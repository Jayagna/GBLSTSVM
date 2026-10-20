"""
GBFTSVM and GBTWSVM (Zhao et al., arXiv 2408.00699; gbftsvm.py) under the protocol of
run_fuzzy_cv.py: same splits, label noise, folds, k values and balanced-accuracy CV on
the training part, and the same output format, so summarize_fuzzy.py and
paper_tables.py read the results directly.

C1 = C3 and C2 = C4 range over the paper's grid {2^-5, ..., 2^5}. As for GBLSTSVM, CV
also chooses whether to weight the +1 class by the class ratio (off = the paper's model).

Methods:
  GBTWSVM       twin SVM dual on the GBLSTSVM balls (k-means, single-point balls deleted), scores 1
  GBFTSVM       the same with the Pythagorean fuzzy ball scores
  GBFTSVM-keep  GBFTSVM on all k-means balls (single-point balls kept)
  GBFTSVM-adp   GBFTSVM on ADPGBG balls, which are pure and do not overlap the other class,
                like the generator the paper uses (Xia et al.'s adaptive generator)
  GBLSTSVM      recomputed with run_fuzzy_cv.py's code, to add its test-set-tuned score

Every result also records the test-set-tuned ("oracle") score: the best test accuracy and
the best test balanced accuracy over the whole grid (k, class weighting, C1, C2), each
config refit on the full training part. This is what tuning on the test set reports.

Example:
  python experiments/run_gbftsvm_cv.py --noise 0 0.1 0.2 0.3 --repeats 10 --out results/gbftsvm_cv
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
from sklearn.model_selection import StratifiedKFold

import run_fuzzy_cv as rfc
from run_fuzzy_cv import (  # noqa: E402
    DEFAULT_DATASETS, ROOT, balanced_accuracy, build_ball_sets, build_kfree_sets, fit_planes, select_best, test_metrics,
)

sys.path.insert(0, str(ROOT))
from addNoisy import recreat_data  # noqa: E402
from dataset_utils import (  # noqa: E402
    discover_datasets, load_binary_dataset, select_datasets, standardize_train_test, stratified_train_test_split,
)
from gbftsvm import pythagorean_scores, twin_planes, twin_planes_over_grid  # noqa: E402
from GBLSTSVM import gb_decision_scores  # noqa: E402

TWIN_C_GRID = [2.0 ** i for i in range(-5, 6)]
# (method name, ball set, fuzzy scores on/off); GBLSTSVM is handled by run_fuzzy_cv's code
TWIN_METHODS = [
    ("GBTWSVM", "gb", False),
    ("GBFTSVM", "gb", True),
    ("GBFTSVM-keep", "gb_all", True),
    ("GBFTSVM-adp", "adp", True),
]
ALL_METHODS = [m[0] for m in TWIN_METHODS] + ["GBLSTSVM"]


def ball_scores(bs, fuzzy):
    return pythagorean_scores(bs["centers"], bs["labels"], bs["purity"]) if fuzzy else np.ones(len(bs["labels"]))


def pos_weight(bs):
    pos = bs["labels"] == 1
    return np.sum(bs["counts"][~pos]) / max(np.sum(bs["counts"][pos]), 1e-12)


def plane_distances(X, planes):
    """|w x + b| / ||w|| for each (w, b), as an (n_planes, n) array."""
    out = []
    for w, b in planes:
        norm = float(np.linalg.norm(w))
        out.append(np.abs(X @ w + b).ravel() / (norm if norm > 1e-12 else 1.0))
    return np.array(out)


def twin_grid_scores(bs, fuzzy, X, y, k):
    """{(k, imb, None, c1, c2): (balanced accuracy, accuracy, signed scores)} for the twin model on X."""
    out = {}
    scores = ball_scores(bs, fuzzy)
    for imb in rfc.IMB_GRID:
        first, second = twin_planes_over_grid(bs["centers"], bs["radii"], bs["labels"], scores, TWIN_C_GRID,
                                              w_pos=pos_weight(bs) if imb else 1.0)
        d1, d2 = plane_distances(X, first), plane_distances(X, second)
        for i, c1 in enumerate(TWIN_C_GRID):
            for j, c2 in enumerate(TWIN_C_GRID):
                s = d2[j] - d1[i]
                pred = np.where(s > 0, 1, -1)
                out[(k, imb, None, c1, c2)] = (balanced_accuracy(y, pred), float(np.mean(pred == y)), s)
    return out


def lstsvm_grid_scores(bs, X, y, k):
    """The same for GBLSTSVM (run_fuzzy_cv's fit, membership 1)."""
    out = {}
    ones = np.ones(len(bs["labels"]))
    for imb, _, c1, c2 in rfc.method_configs([None]):
        try:
            w1, b1, w2, b2 = fit_planes(bs, ones, c1, c2, imb)
        except np.linalg.LinAlgError:
            continue
        pred = np.where(gb_decision_scores(X, w1, b1, w2, b2) > 0, 1, -1)
        out[(k, imb, None, c1, c2)] = (balanced_accuracy(y, pred), float(np.mean(pred == y)), None)
    return out


def sets_for(train, k_values):
    """{k: ball sets}; k = 0 holds the sets that need no k (ADPGBG)."""
    sets = {k: build_ball_sets(train, k) for k in k_values}
    sets[0] = build_kfree_sets(train)
    return sets


def run_one(task):
    path, noise, repeats, n_folds, k_values, out_dir, method_names = task
    rfc.ACTIVE_METHODS = [rfc.METHOD_INDEX["GBLSTSVM"]]
    twin = [m for m in TWIN_METHODS if m[0] in method_names]
    path = Path(path)
    out_file = Path(out_dir) / f"{path.stem}__noise{noise:g}.json"
    if out_file.exists():
        return str(out_file), "cached"

    data, meta = load_binary_dataset(path, minority_positive=True)
    record = {"dataset": path.stem, "noise": noise, "samples": meta["samples"], "features": meta["features"],
              "minority": meta["positive_count"], "majority": meta["negative_count"], "repeats": []}
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

        # CV on the training part; GBLSTSVM goes through run_fuzzy_cv.score_ball_sets unchanged
        cv_scores = {}
        skf = StratifiedKFold(n_splits=folds, shuffle=True, random_state=r)
        for tr_idx, va_idx in skf.split(train[:, :-1], y_train):
            fold_tr, fold_va = train[tr_idx], train[va_idx]
            X_va, y_va = fold_va[:, :-1], fold_va[:, -1]
            for k, sets in sets_for(fold_tr, k_values).items():
                if k and "GBLSTSVM" in method_names:
                    rfc.score_ball_sets(sets, X_va, y_va, k, cv_scores)
                for name, set_name, fuzzy in twin:
                    bs = sets.get(set_name)
                    if bs is None or (k == 0) != (set_name in rfc.KFREE_SETS):
                        continue
                    for cfg, (ba, _, _) in twin_grid_scores(bs, fuzzy, X_va, y_va, k).items():
                        cv_scores.setdefault(name, {}).setdefault(cfg, []).append(ba)

        # Refit the chosen config on the whole training part; score every config on the test part
        rep = {"repeat": r, "cv_folds": folds, "methods": {}}
        X_te, y_te = test[:, :-1], test[:, -1]
        full_sets = sets_for(train, k_values)
        for name in method_names:
            if name not in cv_scores:
                continue
            cfg, cv_best = select_best(cv_scores[name], folds)
            k, imb, p, c1, c2 = cfg
            if name == "GBLSTSVM":
                set_name, fuzzy = "gb", False
            else:
                _, set_name, fuzzy = next(m for m in twin if m[0] == name)
            bs = full_sets[k][set_name]
            if bs is None:
                continue
            scores = ball_scores(bs, fuzzy)
            t0 = time.time()
            if name == "GBLSTSVM":
                w1, b1, w2, b2 = fit_planes(bs, scores, c1, c2, imb)
            else:
                w1, b1, w2, b2 = twin_planes(bs["centers"], bs["radii"], bs["labels"], scores, c1, c2,
                                             w_pos=pos_weight(bs) if imb else 1.0)
            fit_time = time.time() - t0
            res = test_metrics(y_te, gb_decision_scores(X_te, w1, b1, w2, b2))
            # test-set tuning: best test score over the whole grid
            oracle = {}
            for kk, sets in full_sets.items():
                bs_k = sets.get(set_name)
                if bs_k is None or (kk == 0) != (set_name in rfc.KFREE_SETS):
                    continue
                oracle.update(lstsvm_grid_scores(bs_k, X_te, y_te, kk) if name == "GBLSTSVM"
                              else twin_grid_scores(bs_k, fuzzy, X_te, y_te, kk))
            res.update({"k": k, "imbalance": imb, "param": p, "c1": c1, "c2": c2, "cv_bal_acc": cv_best,
                        "n_balls": int(len(bs["radii"])), "fit_time": fit_time,
                        "mean_membership": float(np.mean(scores)), "min_membership": float(np.min(scores)),
                        "share_impure_balls": float(np.mean(bs["purity"] < 1.0)),
                        "oracle_balanced_accuracy": max(v[0] for v in oracle.values()),
                        "oracle_accuracy": 100.0 * max(v[1] for v in oracle.values())})
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
    ap.add_argument("--repeats", type=int, default=10)
    ap.add_argument("--first-repeat", type=int, default=0, help="index of the first split, to add splits to an earlier run")
    ap.add_argument("--folds", type=int, default=5)
    ap.add_argument("--k-values", nargs="+", type=int, default=[2, 3, 4, 5, 6])
    ap.add_argument("--out", default=str(ROOT / "results" / "gbftsvm_cv"))
    ap.add_argument("--jobs", type=int, default=os.cpu_count() or 1)
    ap.add_argument("--methods", nargs="+", default=ALL_METHODS, choices=ALL_METHODS)
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
