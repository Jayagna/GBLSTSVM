"""
The baselines of the GBLSTSVM paper (arXiv 2410.17338) that the other runners do not cover:
SVM, TSVM, GBSVM and LS-GBLSTSVM, linear kernel, under BOTH tuning protocols at once.

  * cv_*      settings chosen by stratified 5-fold cross-validation on the training part
              (best mean balanced accuracy), refitted on the whole training part, scored on test.
  * oracle_*  best test score over the whole grid (the "tune on the test set" protocol).

Datasets, 70/30 splits, standardisation and label noise are the same as in run_fuzzy_cv.py and
run_test_tuning.py, so the results pair with theirs split by split.

Models and grids
  SVM          sklearn SVC (libsvm), linear; C in C_GRID; class weighting off/on.
  TSVM         twin SVM of Jayadeva et al. on the samples (gbftsvm.py's exact dual solver with
               zero radii and unit scores); C1 = C3, C2 = C4 in 2^-5..2^5; class weighting off/on.
  GBSVM        gbsvm.py (exact conic solve) on GBLSTSVM's balls; k, C in C_GRID; class weighting off/on.
  LS-keep, LS-keep+gapvote  LS-GBLSTSVM with single-point balls kept, without and with the
               radius-aware fuzzy weight (k, gamma as in run_fuzzy_cv); not run by default.
  LS-GBLSTSVM  GBLSTSVM with the regulariser c3/2 (||w||^2 + b^2) (paper eq. 26-27, solved in the
               primal, which has the same optimum as the paper's dual); c1 = c2 and c3 = c4 as in
               the paper, both in C_GRID; k; class weighting off/on.

Example:
  python experiments/run_baselines.py --noise 0 0.05 0.1 0.15 0.2 0.3 --repeats 10
"""
import os

os.environ.setdefault("OMP_NUM_THREADS", "1")
os.environ.setdefault("OPENBLAS_NUM_THREADS", "1")
os.environ.setdefault("MKL_NUM_THREADS", "1")

import argparse
import json
import sys
import time
import warnings
from multiprocessing import Pool
from pathlib import Path

import numpy as np
from sklearn.exceptions import ConvergenceWarning
from sklearn.model_selection import StratifiedKFold
from sklearn.svm import SVC

import run_fuzzy_cv as rfc
from run_fuzzy_cv import DEFAULT_DATASETS, ROOT, balanced_accuracy, ball_set_from_samples, build_ball_sets
from run_gbftsvm_cv import TWIN_C_GRID, plane_distances, pos_weight

sys.path.insert(0, str(ROOT))
from addNoisy import recreat_data  # noqa: E402
from dataset_utils import (  # noqa: E402
    discover_datasets, load_binary_dataset, standardize_train_test, stratified_train_test_split,
)
from gbftsvm import twin_planes_over_grid  # noqa: E402
from gbsvm import GBSVMProblem  # noqa: E402
from GBLSTSVM import gb_decision_scores, solve_gb_planes  # noqa: E402

METHODS = ["SVM", "TSVM", "GBSVM", "LS-GBLSTSVM", "LS-keep", "LS-keep+gapvote"]
GAPVOTE = rfc.METHOD_INDEX["Keep+gapvote"]  # (name, ball set, membership(ball set, param), grid)
C_GRID = rfc.C_GRID


def svm_scores(train, Xs):
    X, y = train[:, :-1], train[:, -1]
    out = {}
    for imb in rfc.IMB_GRID:
        for C in C_GRID:
            clf = SVC(kernel="linear", C=C, class_weight="balanced" if imb else None, max_iter=200000, cache_size=500)
            with warnings.catch_warnings():
                warnings.simplefilter("ignore", ConvergenceWarning)
                clf.fit(X, y)
            sign = 1.0 if clf.classes_[1] == 1 else -1.0
            out[(0, imb, C, None)] = [sign * clf.decision_function(Z) for Z in Xs]
    return out


def tsvm_scores(train, Xs):
    bs = ball_set_from_samples(train)
    ones = np.ones(len(bs["labels"]))
    out = {}
    for imb in rfc.IMB_GRID:
        first, second = twin_planes_over_grid(bs["centers"], bs["radii"], bs["labels"], ones, TWIN_C_GRID,
                                              w_pos=pos_weight(bs) if imb else 1.0)
        dist = [(plane_distances(Z, first), plane_distances(Z, second)) for Z in Xs]
        for i, c1 in enumerate(TWIN_C_GRID):
            for j, c2 in enumerate(TWIN_C_GRID):
                out[(0, imb, c1, c2)] = [d2[j] - d1[i] for d1, d2 in dist]
    return out


def gbsvm_scores(bs, k, Xs):
    out = {}
    for imb in rfc.IMB_GRID:
        cost = np.where(bs["labels"] == 1, pos_weight(bs), 1.0) if imb else None
        prob = GBSVMProblem(bs["centers"], bs["radii"], bs["labels"], cost)
        for C in C_GRID:
            sol = prob.solve(C)
            if sol is not None:
                out[(k, imb, C, None)] = [Z @ sol[0] + sol[1] for Z in Xs]
    return out


def lsgb_scores(bs, k, Xs, memberships=None):
    """LS-GBLSTSVM on one ball set. memberships = {param: per-ball fuzzy weight} multiplies the
    slack term as in run_fuzzy_cv.fit_planes; None means weight 1 (config param None)."""
    pos = bs["labels"] == 1
    neg = ~pos
    memberships = memberships or {None: np.ones(len(pos))}
    out = {}
    for imb in rfc.IMB_GRID:
        w1 = np.full(int(np.sum(pos)), pos_weight(bs) if imb else 1.0)
        w2 = np.ones(int(np.sum(neg)))
        for p, memb in memberships.items():
            for c in C_GRID:
                for c3 in C_GRID:
                    try:
                        planes = solve_gb_planes(bs["centers"][pos], bs["radii"][pos], bs["centers"][neg], bs["radii"][neg],
                                                 c, c, w1, w1 * memb[pos], w2, w2 * memb[neg], reg_term=c3 / c)
                    except np.linalg.LinAlgError:
                        continue
                    key = (k, imb, c, c3) if p is None else (k, imb, c, c3, p)
                    out[key] = [gb_decision_scores(Z, *planes) for Z in Xs]
    return out


def all_scores(train, k_values, Xs, methods):
    """{method: {config: [signed scores per X in Xs]}} for one training set."""
    res = {m: {} for m in methods}
    if "SVM" in methods:
        res["SVM"] = svm_scores(train, Xs)
    if "TSVM" in methods:
        res["TSVM"] = tsvm_scores(train, Xs)
    if set(methods) - {"SVM", "TSVM"}:
        for k in k_values:
            sets = build_ball_sets(train, k)
            bs, bs_all = sets.get("gb"), sets.get("gb_all")
            if bs is not None and "GBSVM" in methods:
                res["GBSVM"].update(gbsvm_scores(bs, k, Xs))
            if bs is not None and "LS-GBLSTSVM" in methods:
                res["LS-GBLSTSVM"].update(lsgb_scores(bs, k, Xs))
            if bs_all is not None and "LS-keep" in methods:  # single-point balls kept, no weight
                res["LS-keep"].update(lsgb_scores(bs_all, k, Xs))
            if bs_all is not None and "LS-keep+gapvote" in methods:  # kept balls + radius-aware weight + regulariser
                res["LS-keep+gapvote"].update(lsgb_scores(bs_all, k, Xs, {p: GAPVOTE[2](bs_all, p) for p in GAPVOTE[3]}))
    return res


def ba_acc(y, s):
    pred = np.where(s > 0, 1, -1)
    return balanced_accuracy(y, pred), float(np.mean(pred == y))


def run_one(task):
    path, noise, repeats, n_folds, k_values, out_dir, methods = task
    path = Path(path)
    out_file = Path(out_dir) / f"{path.stem}__noise{noise:g}.json"
    if out_file.exists():
        return str(out_file), "cached"
    data, _ = load_binary_dataset(path, minority_positive=True)
    record = {"dataset": path.stem, "noise": noise, "repeats": []}
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
        cv = {m: {} for m in methods}
        skf = StratifiedKFold(n_splits=folds, shuffle=True, random_state=r)
        for tr_idx, va_idx in skf.split(train[:, :-1], y_train):
            X_va, y_va = train[va_idx, :-1], train[va_idx, -1]
            for m, scores in all_scores(train[tr_idx], k_values, [X_va], methods).items():
                for cfg, (s,) in scores.items():
                    cv[m].setdefault(cfg, []).append(ba_acc(y_va, s)[0])
        X_te, y_te = test[:, :-1], test[:, -1]
        rep = {"repeat": r, "cv_folds": folds, "methods": {}}
        for m, scores in all_scores(train, k_values, [X_te], methods).items():
            if not scores:
                continue
            te = {cfg: ba_acc(y_te, s) for cfg, (s,) in scores.items()}
            # a config missing on some folds scores 0 there, as in run_fuzzy_cv.select_best
            mean_cv = {cfg: np.sum(cv[m].get(cfg, [])) / folds for cfg in te}
            best = max(sorted(te, key=str), key=lambda c: mean_cv[c])
            rep["methods"][m] = {
                "cv_balanced_accuracy": 100.0 * te[best][0], "cv_accuracy": 100.0 * te[best][1],
                "cv_config": list(best), "cv_score": float(mean_cv[best]),
                "oracle_balanced_accuracy": 100.0 * max(v[0] for v in te.values()),
                "oracle_accuracy": 100.0 * max(v[1] for v in te.values()),
                "n_configs": len(te),
            }
        record["repeats"].append(rep)
    record["elapsed_sec"] = time.time() - t_start
    out_file.parent.mkdir(parents=True, exist_ok=True)
    tmp = out_file.with_suffix(".tmp")
    tmp.write_text(json.dumps(record, indent=1))
    tmp.replace(out_file)
    return str(out_file), f"{record['elapsed_sec']:.0f}s"


def main():
    ap = argparse.ArgumentParser(description=__doc__, formatter_class=argparse.RawDescriptionHelpFormatter)
    ap.add_argument("--datasets", nargs="+", default=DEFAULT_DATASETS)
    ap.add_argument("--noise", nargs="+", type=float, default=[0.0, 0.05, 0.1, 0.15, 0.2, 0.3])
    ap.add_argument("--repeats", type=int, default=10)
    ap.add_argument("--folds", type=int, default=5)
    ap.add_argument("--k-values", nargs="+", type=int, default=[2, 3, 4, 5, 6])
    ap.add_argument("--out", default=str(ROOT / "results" / "baselines"))
    ap.add_argument("--jobs", type=int, default=os.cpu_count() or 1)
    ap.add_argument("--methods", nargs="+", default=METHODS[:4], choices=METHODS)
    args = ap.parse_args()
    files = {p.stem: p for p in discover_datasets(str(ROOT / "Data"))}
    tasks = [(str(files[d]), nz, list(range(args.repeats)), args.folds, args.k_values, args.out, args.methods)
             for nz in args.noise for d in args.datasets]
    print(f"{len(tasks)} tasks, {args.jobs} workers", flush=True)
    with Pool(args.jobs) as pool:
        for out, msg in pool.imap_unordered(run_one, tasks):
            print(f"done {Path(out).name} ({msg})", flush=True)


if __name__ == "__main__":
    main()
