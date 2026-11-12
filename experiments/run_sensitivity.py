"""
Sensitivity of the proposed model (LS-GBLSTSVM + kept balls + radius-aware weight, linear) to the two
settings of the fuzzy weight: k (number of neighbouring balls that vote) and gamma (sharpness).

For every (k, gamma) pair the remaining settings (c1 = c2, c3 = c4, clusters per split, class
weighting) are chosen by 5-fold cross-validation on the training part, as in run_baselines.py, and
the test accuracy and balanced accuracy are recorded. Output: results/sensitivity/<dataset>__noise<n>.json
with one entry per (k, gamma), averaged over the splits, and summary.csv with the mean over datasets.
"""
import os

os.environ.setdefault("OMP_NUM_THREADS", "1")
os.environ.setdefault("OPENBLAS_NUM_THREADS", "1")

import argparse
import csv
import json
from multiprocessing import Pool
from pathlib import Path

import numpy as np
from sklearn.model_selection import StratifiedKFold

import run_baselines as rb
from run_baselines import ROOT, ba_acc, build_ball_sets, lsgb_scores
from run_fuzzy_cv import DEFAULT_DATASETS, member

import sys
sys.path.insert(0, str(ROOT))
from addNoisy import recreat_data  # noqa: E402
from dataset_utils import discover_datasets, load_binary_dataset, standardize_train_test, stratified_train_test_split  # noqa: E402

K_NN = [3, 5, 10, 15, 20]
GAMMA = [0.5, 1.0, 2.0, 3.0, 5.0]
PARAMS = [(k, g) for k in K_NN for g in GAMMA]
GAP = member("gapvote")


def scores(train, k_values, X):
    """{param: {config: signed scores on X}}"""
    out = {p: {} for p in PARAMS}
    for k in k_values:
        bs = build_ball_sets(train, k).get("gb_all")
        if bs is None:
            continue
        for cfg, (s,) in lsgb_scores(bs, k, [X], {p: GAP(bs, p) for p in PARAMS}).items():
            out[cfg[-1]][cfg[:-1]] = s
    return out


def run_one(task):
    path, noise, repeats, k_values, out_dir = task
    path = Path(path)
    out_file = Path(out_dir) / f"{path.stem}__noise{noise:g}.json"
    if out_file.exists():
        return str(out_file)
    data, _ = load_binary_dataset(path, minority_positive=True)
    acc = {p: [] for p in PARAMS}
    for r in repeats:
        train, test = stratified_train_test_split(data, test_size=0.30, random_state=r)
        train, test = standardize_train_test(train, test)
        if noise > 0:
            np.random.seed(r)
            train = np.asarray(recreat_data(train, noise), dtype=np.float64)
        y = train[:, -1]
        folds = max(2, min(5, int(min(np.sum(y == 1), np.sum(y == -1)))))
        cv = {p: {} for p in PARAMS}
        for tr, va in StratifiedKFold(n_splits=folds, shuffle=True, random_state=r).split(train[:, :-1], y):
            for p, d in scores(train[tr], k_values, train[va, :-1]).items():
                for cfg, s in d.items():
                    cv[p].setdefault(cfg, []).append(ba_acc(train[va, -1], s)[0])
        for p, d in scores(train, k_values, test[:, :-1]).items():
            if d:
                best = max(sorted(d, key=str), key=lambda c: np.sum(cv[p].get(c, [])) / folds)
                acc[p].append(ba_acc(test[:, -1], d[best]))
    rec = {"dataset": path.stem, "noise": noise,
           "grid": [{"k": p[0], "gamma": p[1], "balanced_accuracy": 100 * float(np.mean([a[0] for a in v])),
                     "accuracy": 100 * float(np.mean([a[1] for a in v]))} for p, v in acc.items() if v]}
    out_file.parent.mkdir(parents=True, exist_ok=True)
    out_file.write_text(json.dumps(rec, indent=1))
    return str(out_file)


def main():
    ap = argparse.ArgumentParser(description=__doc__, formatter_class=argparse.RawDescriptionHelpFormatter)
    ap.add_argument("--datasets", nargs="+", default=DEFAULT_DATASETS)
    ap.add_argument("--noise", nargs="+", type=float, default=[0.0, 0.2])
    ap.add_argument("--repeats", type=int, default=5)
    ap.add_argument("--k-values", nargs="+", type=int, default=[2, 4, 6])
    ap.add_argument("--out", default=str(ROOT / "results" / "sensitivity"))
    ap.add_argument("--jobs", type=int, default=os.cpu_count() or 1)
    args = ap.parse_args()
    files = {p.stem: p for p in discover_datasets(str(ROOT / "Data"))}
    tasks = [(str(files[d]), nz, list(range(args.repeats)), args.k_values, args.out) for nz in args.noise for d in args.datasets]
    with Pool(args.jobs) as pool:
        for f in pool.imap_unordered(run_one, tasks):
            print("done", Path(f).name, flush=True)
    rows = {}
    for f in Path(args.out).glob("*.json"):
        rec = json.loads(f.read_text())
        for g in rec["grid"]:
            rows.setdefault((rec["noise"], g["k"], g["gamma"]), []).append((g["accuracy"], g["balanced_accuracy"]))
    with open(Path(args.out) / "summary.csv", "w", newline="") as fh:
        w = csv.writer(fh)
        w.writerow(["noise", "k", "gamma", "datasets", "accuracy", "balanced_accuracy"])
        for (nz, k, g), v in sorted(rows.items()):
            w.writerow([nz, k, g, len(v), np.mean([a for a, _ in v]), np.mean([b for _, b in v])])


if __name__ == "__main__":
    main()
