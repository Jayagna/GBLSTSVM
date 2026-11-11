"""
Every model under the "tune on the test set" protocol (no cross-validation).

For each train/test split the whole grid (k, class weighting, membership parameter, c1, c2) is
fitted on the training part and scored on the test part, and the BEST test score is reported.
This is the protocol behind the published granular-ball comparisons; the numbers are optimistic
because the test labels choose the settings. Same datasets, splits and label noise as
run_fuzzy_cv.py, so the results pair with the cross-validated ones.

Per method and split the output holds the best test accuracy and balanced accuracy over the
whole grid, and the same per membership parameter ("by_param"), so a method with a larger grid
can also be compared at one fixed parameter (grid size equal to GBLSTSVM's).

Example:
  python experiments/run_test_tuning.py --noise 0 0.1 0.2 0.3 --repeats 10
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

import run_fuzzy_cv as rfc
from run_fuzzy_cv import DEFAULT_DATASETS, ROOT, balanced_accuracy, ball_set_from_samples, build_ball_sets, fit_planes
from run_gbftsvm_cv import twin_grid_scores

sys.path.insert(0, str(ROOT))
from addNoisy import recreat_data  # noqa: E402
from dataset_utils import (  # noqa: E402
    discover_datasets, load_binary_dataset, standardize_train_test, stratified_train_test_split,
)
from GBLSTSVM import gb_decision_scores  # noqa: E402

LS_METHODS = ["LSTSVM", "FKNN-LSTSVM", "GBLSTSVM", "T1-centre", "T2-entropy", "GB-keep", "T7-agree",
              "Keep+boundary", "Keep+shrunk", "Keep+gapvote", "Keep+relative"]
TWIN = {"GBTWSVM": ("gb", False), "GBFTSVM": ("gb", True)}
ALL_METHODS = LS_METHODS + list(TWIN)


def ls_grid(bs, fn, grid, X, y):
    """{param: (best balanced accuracy, best accuracy)} over class weighting, c1, c2 on the test part."""
    out = {}
    for p in grid:
        memb = fn(bs, p)
        best_ba = best_acc = 0.0
        for imb in rfc.IMB_GRID:
            for c1 in rfc.C_GRID:
                for c2 in rfc.C_GRID:
                    try:
                        w1, b1, w2, b2 = fit_planes(bs, memb, c1, c2, imb)
                    except np.linalg.LinAlgError:
                        continue
                    pred = np.where(gb_decision_scores(X, w1, b1, w2, b2) > 0, 1, -1)
                    best_ba = max(best_ba, balanced_accuracy(y, pred))
                    best_acc = max(best_acc, float(np.mean(pred == y)))
        out[p] = (best_ba, best_acc)
    return out


def run_one(task):
    path, noise, repeats, k_values, out_dir, methods = task
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
        X, y = test[:, :-1], test[:, -1]
        per = {m: {} for m in methods}  # method -> {param: [ba, acc]} (best over k and the rest)

        def merge(name, scores):
            for p, (ba, acc) in scores.items():
                old = per[name].get(p, (0.0, 0.0))
                per[name][p] = (max(old[0], ba), max(old[1], acc))

        samples = ball_set_from_samples(train)
        for name in methods:
            if name in LS_METHODS and rfc.METHOD_INDEX[name][1] == "samples":
                _, _, fn, grid = rfc.METHOD_INDEX[name]
                merge(name, ls_grid(samples, fn, grid, X, y))
        for k in k_values:
            sets = build_ball_sets(train, k)
            for name in methods:
                if name in TWIN:
                    bs = sets.get(TWIN[name][0])
                    if bs is not None:
                        sc = twin_grid_scores(bs, TWIN[name][1], X, y, k).values()
                        merge(name, {None: (max(v[0] for v in sc), max(v[1] for v in sc))})
                    continue
                _, set_name, fn, grid = rfc.METHOD_INDEX[name]
                bs = sets.get(set_name)
                if set_name != "samples" and bs is not None:
                    merge(name, ls_grid(bs, fn, grid, X, y))
        rep = {"repeat": r, "methods": {}}
        for name, scores in per.items():
            if not scores:
                continue
            rep["methods"][name] = {
                "oracle_balanced_accuracy": 100.0 * max(v[0] for v in scores.values()),
                "oracle_accuracy": 100.0 * max(v[1] for v in scores.values()),
                "by_param": {json.dumps(p): [100.0 * v[0], 100.0 * v[1]] for p, v in scores.items()},
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
    ap.add_argument("--noise", nargs="+", type=float, default=[0.0, 0.1, 0.2, 0.3])
    ap.add_argument("--repeats", type=int, default=10)
    ap.add_argument("--k-values", nargs="+", type=int, default=[2, 3, 4, 5, 6])
    ap.add_argument("--out", default=str(ROOT / "results" / "test_tuning"))
    ap.add_argument("--jobs", type=int, default=os.cpu_count() or 1)
    ap.add_argument("--methods", nargs="+", default=ALL_METHODS, choices=ALL_METHODS)
    args = ap.parse_args()
    files = {p.stem: p for p in discover_datasets(str(ROOT / "Data"))}
    tasks = [(str(files[d]), nz, list(range(args.repeats)), args.k_values, args.out, args.methods)
             for nz in args.noise for d in args.datasets]
    print(f"{len(tasks)} tasks, {args.jobs} workers", flush=True)
    with Pool(args.jobs) as pool:
        for out, msg in pool.imap_unordered(run_one, tasks):
            print(f"done {Path(out).name} ({msg})", flush=True)


if __name__ == "__main__":
    main()
