"""
Kernel (RBF) version of the fuzzy GBLSTSVM comparison.

Every ball set is mapped to kernel features phi(x) = K(x, C), where C holds the
centres of that ball set (all training samples for LSTSVM), and the closed-form
GBLSTSVM solver runs on those features with the input-space radii. This is the
usual non-linear LSTSVM construction (Kumar & Gopal, 2009) applied to balls: the
linear systems have one row and column per ball instead of one per sample.

Protocol as in run_fuzzy_cv.py (repeated stratified 70/30 splits, label noise on
the training part, everything tuned by stratified 5-fold CV on the training part,
scored by balanced accuracy). The RBF width gamma = g / d, g in GAMMA_GRID, is tuned
too. c1 and c2 enter separate linear systems, so each plane is solved once per
value of its own C instead of once per (c1, c2) pair.

Example:
  python experiments/run_kernel_cv.py --datasets pima sonar --noise 0 0.2 --repeats 5
"""
import os

os.environ.setdefault("OMP_NUM_THREADS", "1")
os.environ.setdefault("OPENBLAS_NUM_THREADS", "1")
os.environ.setdefault("MKL_NUM_THREADS", "1")

import argparse
import json
import time
from multiprocessing import Pool
from pathlib import Path

import numpy as np
from scipy.linalg import LinAlgError, cho_factor, cho_solve, solve
from sklearn.model_selection import StratifiedKFold

from run_fuzzy_cv import (  # noqa: E402  (also puts the repo root on sys.path)
    AGREE_GRID, C_GRID, DEFAULT_DATASETS, IMB_GRID, ROOT, ball_set_from_samples, balanced_accuracy,
    build_ball_sets, member, select_best, test_metrics,
)
from addNoisy import recreat_data  # noqa: E402
from dataset_utils import (  # noqa: E402
    discover_datasets, load_binary_dataset, select_datasets, standardize_train_test, stratified_train_test_split,
)

GAMMA_GRID = [0.25, 1.0, 4.0]  # gamma = g / n_features

# (method name, ball set, membership(ball set, param), parameter grid); ball sets as in run_fuzzy_cv.py
KMETHODS = [
    ("K-GBLSTSVM", "gb", member("none"), [None]),
    ("K-GB-keep", "gb_all", member("none"), [None]),
    ("K-keep-T7", "gb_all", member("agreement"), AGREE_GRID),
    ("K-LSTSVM", "samples", member("none"), [None]),
    ("K-FKNN-LSTSVM", "samples", member("agreement"), AGREE_GRID),
]
KMETHOD_INDEX = {m[0]: m for m in KMETHODS}
ACTIVE = KMETHODS


def rbf(X, C, gamma):
    sq = np.sum(X ** 2, axis=1)[:, None] + np.sum(C ** 2, axis=1)[None, :] - 2.0 * X @ C.T
    return np.exp(-gamma * np.maximum(sq, 0.0))


def _spd_solve(M, r):
    try:
        return cho_solve(cho_factor(M, check_finite=False), r, check_finite=False)
    except LinAlgError:
        return solve(M, r, check_finite=False)


def planes_over_grid(F, bs, membership, use_imbalance, c_grid=C_GRID, reg_term=0.0001):
    """Both planes for every value of c1 (plane 1) and c2 (plane 2) on kernel features F
    (one row per ball). Same weighting as run_fuzzy_cv.fit_planes and the same systems
    as GBLSTSVM.solve_gb_planes. Returns ({c1: (w1, b1)}, {c2: (w2, b2)})."""
    pos = bs["labels"] == 1
    neg = ~pos
    w_pos = np.sum(bs["counts"][neg]) / max(np.sum(bs["counts"][pos]), 1e-12) if use_imbalance else 1.0
    prox_pos, prox_neg = np.full(np.sum(pos), w_pos), np.ones(np.sum(neg))
    slack_pos, slack_neg = prox_pos * membership[pos], prox_neg * membership[neg]
    H = np.column_stack((F[pos], np.ones(np.sum(pos))))
    G = np.column_stack((F[neg], np.ones(np.sum(neg))))
    reg_I = reg_term * np.identity(H.shape[1])
    GQ, HQ = G.T * slack_neg, H.T * slack_pos
    A1, B1, r1 = GQ @ G + reg_I, (H.T * prox_pos) @ H, GQ @ (1.0 + bs["radii"][neg])
    A2, B2, r2 = HQ @ H + reg_I, (G.T * prox_neg) @ G, HQ @ (1.0 + bs["radii"][pos])
    p1, p2 = {}, {}
    for c in c_grid:
        z1 = -_spd_solve(A1 + B1 / c, r1)
        z2 = _spd_solve(A2 + B2 / c, r2)
        p1[c], p2[c] = (z1[:-1], z1[-1]), (z2[:-1], z2[-1])
    return p1, p2


def plane_distance(Fx, plane):
    w, b = plane
    nw = float(np.linalg.norm(w))
    return np.abs(Fx @ w + b) / (nw if nw > 1e-12 else 1.0)


def score_sets(sets, X_val, y_val, k, scores_out):
    """Validation balanced accuracy of every (method, config) on one fold and one k."""
    d = X_val.shape[1]
    for set_name in {m[1] for m in ACTIVE}:
        bs = sets.get(set_name)
        if bs is None:
            continue
        methods = [m for m in ACTIVE if m[1] == set_name]
        for g in GAMMA_GRID:
            gamma = g / d
            F, Fv = rbf(bs["centers"], bs["centers"], gamma), rbf(X_val, bs["centers"], gamma)
            for name, _, fn, grid in methods:
                for p in grid:
                    memb = fn(bs, p)
                    for imb in IMB_GRID:
                        p1, p2 = planes_over_grid(F, bs, memb, imb)
                        d1 = {c: plane_distance(Fv, p1[c]) for c in C_GRID}
                        d2 = {c: plane_distance(Fv, p2[c]) for c in C_GRID}
                        for c1 in C_GRID:
                            for c2 in C_GRID:
                                pred = np.where(d2[c2] - d1[c1] > 0, 1, -1)
                                scores_out.setdefault(name, {}).setdefault((k, imb, p, g, c1, c2), []).append(
                                    balanced_accuracy(y_val, pred))


def run_one(task):
    global ACTIVE
    path, noise, repeats, n_folds, k_values, out_dir, method_names = task
    ACTIVE = [KMETHOD_INDEX[m] for m in method_names]
    path = Path(path)
    out_file = Path(out_dir) / f"{path.stem}__noise{noise:g}.json"
    if out_file.exists():
        return str(out_file), "cached"
    needs_k = any(m[1] != "samples" for m in ACTIVE)

    data, meta = load_binary_dataset(path, minority_positive=True)
    record = {"dataset": path.stem, "noise": noise, "samples": meta["samples"], "features": meta["features"],
              "minority": meta["positive_count"], "majority": meta["negative_count"], "kernel": "rbf",
              "repeats": []}
    t_start = time.time()
    for r in repeats:
        train, test = stratified_train_test_split(data, test_size=0.30, random_state=r)
        train, test = standardize_train_test(train, test)
        if noise > 0:
            np.random.seed(r)
            train = np.asarray(recreat_data(train, noise), dtype=np.float64)
        y_train = train[:, -1]
        n_min = int(min(np.sum(y_train == 1), np.sum(y_train == -1)))
        folds = max(2, min(n_folds, n_min))

        cv_scores = {}
        skf = StratifiedKFold(n_splits=folds, shuffle=True, random_state=r)
        for tr_idx, va_idx in skf.split(train[:, :-1], y_train):
            fold_tr, fold_va = train[tr_idx], train[va_idx]
            X_va, y_va = fold_va[:, :-1], fold_va[:, -1]
            if needs_k:
                for k in k_values:
                    score_sets(build_ball_sets(fold_tr, k), X_va, y_va, k, cv_scores)
            score_sets({"samples": ball_set_from_samples(fold_tr)}, X_va, y_va, 0, cv_scores)

        rep = {"repeat": r, "cv_folds": folds, "methods": {}}
        X_te, y_te = test[:, :-1], test[:, -1]
        d = X_te.shape[1]
        for name, set_name, fn, _ in ACTIVE:
            if name not in cv_scores:
                continue
            cfg, cv_best = select_best(cv_scores[name], folds)
            k, imb, p, g, c1, c2 = cfg
            t0 = time.time()
            bs = ball_set_from_samples(train) if set_name == "samples" else build_ball_sets(train, k)[set_name]
            gen_time = time.time() - t0
            if bs is None:
                continue
            t1 = time.time()
            memb = fn(bs, p)
            F = rbf(bs["centers"], bs["centers"], g / d)
            p1, p2 = planes_over_grid(F, bs, memb, imb, c_grid=sorted({c1, c2}))
            fit_time = time.time() - t1
            Ft = rbf(X_te, bs["centers"], g / d)
            res = test_metrics(y_te, plane_distance(Ft, p2[c2]) - plane_distance(Ft, p1[c1]))
            res.update({"k": k, "imbalance": imb, "param": p, "gamma_factor": g, "c1": c1, "c2": c2,
                        "cv_bal_acc": cv_best, "n_balls": int(len(bs["radii"])), "gen_time": gen_time,
                        "fit_time": fit_time, "mean_membership": float(np.mean(memb)),
                        "min_membership": float(np.min(memb))})
            rep["methods"][name] = res
        record["repeats"].append(rep)
    record["elapsed_sec"] = time.time() - t_start
    out_file.parent.mkdir(parents=True, exist_ok=True)
    tmp = out_file.with_suffix(".tmp")
    tmp.write_text(json.dumps(record, indent=1))
    tmp.replace(out_file)
    return str(out_file), f"{record['elapsed_sec']:.0f}s"


def main():
    ap = argparse.ArgumentParser(description=__doc__, formatter_class=argparse.RawDescriptionHelpFormatter)
    ap.add_argument("--data-dir", default=str(ROOT / "Data"))
    ap.add_argument("--datasets", nargs="+", default=DEFAULT_DATASETS, help="dataset stems; 'all' for every file")
    ap.add_argument("--noise", nargs="+", type=float, default=[0.0])
    ap.add_argument("--repeats", type=int, default=5)
    ap.add_argument("--first-repeat", type=int, default=0, help="index of the first split, to add splits to an earlier run")
    ap.add_argument("--folds", type=int, default=5)
    ap.add_argument("--k-values", nargs="+", type=int, default=[2, 3, 4, 5, 6])
    ap.add_argument("--out", default=str(ROOT / "results" / "kernel_cv"))
    ap.add_argument("--jobs", type=int, default=os.cpu_count() or 1)
    ap.add_argument("--methods", nargs="+", default=[m[0] for m in KMETHODS], choices=[m[0] for m in KMETHODS])
    args = ap.parse_args()

    files = discover_datasets(args.data_dir)
    selected = []
    for name in args.datasets:
        exact = [p for p in files if p.stem.lower() == name.lower()]
        selected += exact if exact else select_datasets(files, [name])
    selected = list(dict.fromkeys(selected))
    repeats = list(range(args.first_repeat, args.first_repeat + args.repeats))
    tasks = [(str(p), nz, repeats, args.folds, args.k_values, args.out, args.methods)
             for nz in args.noise for p in selected]
    print(f"{len(tasks)} tasks ({len(selected)} datasets x {len(args.noise)} noise levels), {args.jobs} workers", flush=True)
    with Pool(args.jobs) as pool:
        for out, msg in pool.imap_unordered(run_one, tasks):
            print(f"done {Path(out).name} ({msg})", flush=True)


if __name__ == "__main__":
    main()
