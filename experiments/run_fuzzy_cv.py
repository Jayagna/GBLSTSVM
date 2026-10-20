"""
Cross-validated comparison of fuzzy membership functions for GBLSTSVM.

Protocol (no test-set tuning):
  * R repeated stratified 70/30 splits (seed = repeat index), z-scored on train stats.
  * Optional label noise on the training part only (addNoisy.recreat_data).
  * For every method, k (granular-ball split), c1, c2, class-imbalance weighting
    on/off and the membership parameter are chosen by stratified F-fold CV on the
    training part, scored by balanced accuracy.
  * The chosen configuration is refit on the whole training part and evaluated
    once on the clean test part.

Methods: GBLSTSVM (no membership), the ball-level memberships in
fuzzy_membership.py, and LSTSVM on raw samples (every sample a ball of radius 0).

Example:
  python experiments/run_fuzzy_cv.py --datasets pima sonar --noise 0 0.1 --repeats 5
"""
import os

os.environ.setdefault("OMP_NUM_THREADS", "1")
os.environ.setdefault("OPENBLAS_NUM_THREADS", "1")
os.environ.setdefault("MKL_NUM_THREADS", "1")

import argparse
import json
import sys
import time
from multiprocessing import Pool
from pathlib import Path

import numpy as np
from sklearn.metrics import f1_score, roc_auc_score
from sklearn.model_selection import StratifiedKFold

ROOT = Path(__file__).resolve().parents[1]
sys.path.insert(0, str(ROOT))

from addNoisy import recreat_data  # noqa: E402
from dataset_utils import (  # noqa: E402
    discover_datasets,
    load_binary_dataset,
    select_datasets,
    standardize_train_test,
    stratified_train_test_split,
)
from fuzzy_membership import compute_membership  # noqa: E402
from GBLSTSVM import gb_decision_scores, solve_gb_planes  # noqa: E402
from gen_ball import gen_balls  # noqa: E402

def member(name):
    """Membership from fuzzy_membership.py as a function of (ball set, parameter)."""
    return lambda bs, p: compute_membership(name, bs["centers"], bs["radii"], bs["labels"], bs["counts"], p)


def singleton_weight(bs, w):
    """T6: single-point balls (normally deleted) are kept with membership w."""
    return np.where(bs["counts"] >= 2, 1.0, float(w))


def via_balls(ball_membership):
    """Sample-level membership: each training sample takes the membership of its granular ball."""
    return lambda bs, p: ball_membership(bs["gb_all"], p)[bs["ball_index"]]


def singleton_entropy(bs, p):
    w, k_nn = p
    return singleton_weight(bs, w) * member("entropy")(bs, k_nn)


# (method name, ball set, membership(ball set, param), parameter grid)
#   ball sets: "gb"      granular balls as in GBLSTSVM (single-point balls deleted)
#              "gb_noR"  same balls with radii set to 0 (ablation)
#              "gb_all"  granular balls without deleting single-point balls
#              "samples" every training sample is a ball of radius 0 (LSTSVM)
#              "samples_gb" samples as in LSTSVM, plus the granular balls of the same
#                           training set, used only to give each sample a membership
METHODS = [
    ("GBLSTSVM", "gb", member("none"), [None]),
    ("T1-centre", "gb", member("centre"), [None]),
    ("T2-entropy", "gb", member("entropy"), [5, 10]),
    ("T4-overlap", "gb", member("overlap"), [0.5, 1.0, 2.0, 4.0]),
    ("T5-density", "gb", member("density"), [0.25, 0.5, 1.0]),
    ("GB-noR", "gb_noR", member("none"), [None]),
    ("GB-keep", "gb_all", member("none"), [None]),
    ("T6-keep", "gb_all", singleton_weight, [0.05, 0.2, 0.5]),
    ("T6+T2", "gb_all", singleton_entropy, [(w, k) for w in (0.2, 0.5, 1.0) for k in (5, 10)]),
    ("T6+T4", "gb_all", member("overlap"), [0.5, 1.0, 2.0, 4.0]),
    ("LSTSVM", "samples", member("none"), [None]),
    ("GBF-size", "samples_gb", via_balls(singleton_weight), [0.05, 0.2, 0.5]),
    ("GBF-overlap", "samples_gb", via_balls(member("overlap")), [0.5, 1.0, 2.0, 4.0]),
    ("GBF-entropy", "samples_gb", via_balls(member("entropy")), [5, 10]),
]
METHOD_INDEX = {m[0]: m for m in METHODS}
ACTIVE_METHODS = METHODS
C_GRID = [0.001, 0.01, 0.1, 1.0, 10.0, 100.0, 1000.0]
IMB_GRID = [False, True]

DEFAULT_DATASETS = [
    "sonar", "cleve", "heart-stat", "bupa or liver-disorders", "iono", "wdbc", "pima", "ger",
    "haberman", "transfusion", "vehicle2", "wpbc", "new-thyroid1", "ecoli2", "yeast3",
    "yeast-2_vs_4", "yeast-0-5-6-7-9_vs_4", "ecoli4", "glass4", "abalone9-18", "yeast1vs7",
]


# ---------------------------------------------------------------------------
# Ball sets
# ---------------------------------------------------------------------------
def ball_set_from_balls(balls):
    """Granular balls (dicts from gen_balls(..., return_details=True)) -> arrays."""
    centers = np.array([b["center"] for b in balls], dtype=np.float64)
    radii = np.array([b["r"] for b in balls], dtype=np.float64)
    labels = np.array([b["label"] for b in balls], dtype=np.float64)
    counts = np.array([b["num"] for b in balls], dtype=np.float64)
    return {"centers": centers, "radii": radii, "labels": labels, "counts": counts}


def ball_set_from_samples(data):
    """Every sample is its own ball with radius 0, which turns GBLSTSVM into LSTSVM."""
    return {
        "centers": np.asarray(data[:, :-1], dtype=np.float64),
        "radii": np.zeros(len(data)),
        "labels": np.asarray(data[:, -1], dtype=np.float64),
        "counts": np.ones(len(data)),
    }


def has_both_classes(bs):
    return bool(np.any(bs["labels"] == 1) and np.any(bs["labels"] == -1))


def build_ball_sets(train, k):
    """All granular-ball variants for one training set and one k (one ball generation)."""
    balls = gen_balls(train, pur=0.985, delbals=1, k_clusters=k, return_details=True)
    gb_all = ball_set_from_balls(balls)
    keep = gb_all["counts"] >= 2
    gb = {key: val[keep] for key, val in gb_all.items()}
    gb_noR = dict(gb, radii=np.zeros(int(np.sum(keep))))
    ball_index = np.empty(len(train), dtype=int)
    for b, ball in enumerate(balls):
        ball_index[ball["indices"]] = b
    samples_gb = dict(ball_set_from_samples(train), gb_all=gb_all, ball_index=ball_index)
    sets = {"gb": gb, "gb_noR": gb_noR, "gb_all": gb_all, "samples_gb": samples_gb}
    return {name: (bs if has_both_classes(bs) else None) for name, bs in sets.items()}


# ---------------------------------------------------------------------------
# Fitting and scoring
# ---------------------------------------------------------------------------
def fit_planes(bs, membership, c1, c2, use_imbalance):
    pos = bs["labels"] == 1
    neg = ~pos
    if use_imbalance:
        w_pos = np.sum(bs["counts"][neg]) / max(np.sum(bs["counts"][pos]), 1e-12)
    else:
        w_pos = 1.0
    w1 = np.full(np.sum(pos), w_pos)
    w2 = np.ones(np.sum(neg))
    return solve_gb_planes(
        bs["centers"][pos], bs["radii"][pos], bs["centers"][neg], bs["radii"][neg], c1, c2,
        prox_pos=w1, slack_pos=w1 * membership[pos],
        prox_neg=w2, slack_neg=w2 * membership[neg],
    )


def balanced_accuracy(y, pred):
    pos = y == 1
    neg = ~pos
    sens = np.mean(pred[pos] == 1) if np.any(pos) else 0.0
    spec = np.mean(pred[neg] == -1) if np.any(neg) else 0.0
    return 0.5 * (sens + spec)


def test_metrics(y, scores):
    pred = np.where(scores > 0, 1, -1)
    pos = y == 1
    neg = ~pos
    sens = float(np.mean(pred[pos] == 1)) if np.any(pos) else 0.0
    spec = float(np.mean(pred[neg] == -1)) if np.any(neg) else 0.0
    return {
        "accuracy": float(np.mean(pred == y) * 100.0),
        "balanced_accuracy": 0.5 * (sens + spec),
        "gmean": float(np.sqrt(sens * spec)),
        "sensitivity": sens,
        "specificity": spec,
        "f1": float(f1_score(y, pred, pos_label=1, zero_division=0)),
        "roc_auc": float(roc_auc_score(y, scores)) if np.any(pos) and np.any(neg) else float("nan"),
    }


def method_configs(param_grid):
    for imb in IMB_GRID:
        for p in param_grid:
            for c1 in C_GRID:
                for c2 in C_GRID:
                    yield imb, p, c1, c2


def score_ball_sets(sets, X_val, y_val, k, scores_out):
    """Add the validation balanced accuracy of every (method, config) on one fold and one k."""
    for name, set_name, fn, grid in ACTIVE_METHODS:
        bs = sets.get(set_name)
        if bs is None:
            continue
        memberships = {p: fn(bs, p) for p in grid}
        for imb, p, c1, c2 in method_configs(grid):
            try:
                w1, b1, w2, b2 = fit_planes(bs, memberships[p], c1, c2, imb)
                pred = np.where(gb_decision_scores(X_val, w1, b1, w2, b2) > 0, 1, -1)
                s = balanced_accuracy(y_val, pred)
            except np.linalg.LinAlgError:
                s = 0.0
            scores_out.setdefault(name, {}).setdefault((k, imb, p, c1, c2), []).append(s)


def select_best(config_scores, n_folds):
    best_cfg, best = None, -1.0
    for cfg, vals in config_scores.items():
        # A config missing on some folds (degenerate balls) scores 0 there
        m = np.sum(vals) / n_folds
        if m > best + 1e-12:
            best, best_cfg = m, cfg
    return best_cfg, best


# ---------------------------------------------------------------------------
# One dataset at one noise level
# ---------------------------------------------------------------------------
def run_one(task):
    global ACTIVE_METHODS
    path, noise, repeats, n_folds, k_values, out_dir, method_names = task
    ACTIVE_METHODS = [METHOD_INDEX[m] for m in method_names]
    path = Path(path)
    out_file = Path(out_dir) / f"{path.stem}__noise{noise:g}.json"
    if out_file.exists():
        return str(out_file), "cached"

    data, meta = load_binary_dataset(path, minority_positive=True)
    record = {"dataset": path.stem, "noise": noise, "samples": meta["samples"], "features": meta["features"],
              "minority": meta["positive_count"], "majority": meta["negative_count"], "repeats": []}
    t_start = time.time()
    for r in range(repeats):
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
            for k in k_values:
                score_ball_sets(build_ball_sets(fold_tr, k), X_va, y_va, k, cv_scores)
            score_ball_sets({"samples": ball_set_from_samples(fold_tr)}, X_va, y_va, 0, cv_scores)

        rep = {"repeat": r, "cv_folds": folds, "methods": {}}
        ball_cache = {}
        X_te, y_te = test[:, :-1], test[:, -1]
        for name, set_name, fn, _ in ACTIVE_METHODS:
            if name not in cv_scores:
                continue
            cfg, cv_best = select_best(cv_scores[name], folds)
            k, imb, p, c1, c2 = cfg
            t0 = time.time()
            if set_name == "samples":
                bs = ball_set_from_samples(train)
            else:
                if k not in ball_cache:
                    ball_cache[k] = build_ball_sets(train, k)
                bs = ball_cache[k][set_name]
                if bs is None:
                    continue
            memb = fn(bs, p)
            w1, b1, w2, b2 = fit_planes(bs, memb, c1, c2, imb)
            fit_time = time.time() - t0
            res = test_metrics(y_te, gb_decision_scores(X_te, w1, b1, w2, b2))
            res.update({"k": k, "imbalance": imb, "param": p, "c1": c1, "c2": c2, "cv_bal_acc": cv_best,
                        "n_balls": int(len(bs["radii"])), "fit_time": fit_time,
                        "mean_membership": float(np.mean(memb)), "min_membership": float(np.min(memb))})
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
    ap.add_argument("--folds", type=int, default=5)
    ap.add_argument("--k-values", nargs="+", type=int, default=[2, 3, 4, 5, 6])
    ap.add_argument("--out", default=str(ROOT / "results" / "fuzzy_cv"))
    ap.add_argument("--jobs", type=int, default=os.cpu_count() or 1)
    ap.add_argument("--methods", nargs="+", default=[m[0] for m in METHODS], choices=[m[0] for m in METHODS])
    args = ap.parse_args()

    files = discover_datasets(args.data_dir)
    selected = []
    for name in args.datasets:
        exact = [p for p in files if p.stem.lower() == name.lower()]
        selected += exact if exact else select_datasets(files, [name])
    selected = list(dict.fromkeys(selected))
    tasks = [(str(p), nz, args.repeats, args.folds, args.k_values, args.out, args.methods)
             for nz in args.noise for p in selected]
    print(f"{len(tasks)} tasks ({len(selected)} datasets x {len(args.noise)} noise levels), {args.jobs} workers", flush=True)
    with Pool(args.jobs) as pool:
        for out, msg in pool.imap_unordered(run_one, tasks):
            print(f"done {Path(out).name} ({msg})", flush=True)


if __name__ == "__main__":
    main()
