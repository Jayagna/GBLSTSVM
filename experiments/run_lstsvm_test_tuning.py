"""
Plain LSTSVM, scored two ways on the exact splits and label noise of run_gbftsvm_cv.py:
  cv      c1, c2 and class weighting chosen by 5-fold CV (balanced accuracy) on the training part
  oracle  the best test score over the same grid ("tuning on the test set")
GBLSTSVM's cv and oracle scores are already in results/gbftsvm_cv, so this answers whether
test-set tuning alone flips LSTSVM vs GBLSTSVM, as in the GBLSTSVM paper.

Example:
  python experiments/run_lstsvm_test_tuning.py --noise 0 0.1 0.2 0.3 --repeats 10
"""
import os

os.environ.setdefault("OMP_NUM_THREADS", "1")
os.environ.setdefault("OPENBLAS_NUM_THREADS", "1")

import argparse
import json
import sys
from multiprocessing import Pool
from pathlib import Path

import numpy as np
from sklearn.model_selection import StratifiedKFold

from run_fuzzy_cv import (  # noqa: E402
    DEFAULT_DATASETS, ROOT, balanced_accuracy, ball_set_from_samples, fit_planes, method_configs,
)

sys.path.insert(0, str(ROOT))
from addNoisy import recreat_data  # noqa: E402
from dataset_utils import (  # noqa: E402
    discover_datasets, load_binary_dataset, standardize_train_test, stratified_train_test_split,
)
from GBLSTSVM import gb_decision_scores  # noqa: E402


def grid_scores(bs, X, y):
    ones = np.ones(len(bs["labels"]))
    out = {}
    for imb, _, c1, c2 in method_configs([None]):
        try:
            w1, b1, w2, b2 = fit_planes(bs, ones, c1, c2, imb)
        except np.linalg.LinAlgError:
            continue
        pred = np.where(gb_decision_scores(X, w1, b1, w2, b2) > 0, 1, -1)
        out[(imb, c1, c2)] = (balanced_accuracy(y, pred), float(np.mean(pred == y)))
    return out


def run_one(task):
    path, noise, repeats, n_folds = task
    data, _ = load_binary_dataset(path, minority_positive=True)
    rows = []
    for r in repeats:
        train, test = stratified_train_test_split(data, test_size=0.30, random_state=r)
        train, test = standardize_train_test(train, test)
        if noise > 0:
            np.random.seed(r)
            train = np.asarray(recreat_data(train, noise), dtype=np.float64)
        y_tr = train[:, -1]
        n_min = int(min(np.sum(y_tr == 1), np.sum(y_tr == -1)))
        folds = max(2, min(n_folds, n_min))
        cv = {}
        skf = StratifiedKFold(n_splits=folds, shuffle=True, random_state=r)
        for tr_idx, va_idx in skf.split(train[:, :-1], y_tr):
            va = train[va_idx]
            for cfg, (ba, _) in grid_scores(ball_set_from_samples(train[tr_idx]), va[:, :-1], va[:, -1]).items():
                cv.setdefault(cfg, []).append(ba)
        best = max((c for c in cv if len(cv[c]) == folds), key=lambda c: np.mean(cv[c]))
        test_all = grid_scores(ball_set_from_samples(train), test[:, :-1], test[:, -1])
        rows.append({"repeat": r, "cv_balanced_accuracy": 100 * test_all[best][0], "cv_accuracy": 100 * test_all[best][1],
                     "oracle_balanced_accuracy": 100 * max(v[0] for v in test_all.values()),
                     "oracle_accuracy": 100 * max(v[1] for v in test_all.values())})
    return {"dataset": Path(path).stem, "noise": noise, "repeats": rows}


def main():
    ap = argparse.ArgumentParser(description=__doc__, formatter_class=argparse.RawDescriptionHelpFormatter)
    ap.add_argument("--noise", nargs="+", type=float, default=[0.0, 0.1, 0.2, 0.3])
    ap.add_argument("--repeats", type=int, default=10)
    ap.add_argument("--folds", type=int, default=5)
    ap.add_argument("--out", default=str(ROOT / "results" / "lstsvm_test_tuning" / "lstsvm.json"))
    ap.add_argument("--jobs", type=int, default=os.cpu_count() or 1)
    args = ap.parse_args()
    files = {p.stem: p for p in discover_datasets(str(ROOT / "Data"))}
    tasks = [(str(files[d]), nz, list(range(args.repeats)), args.folds) for nz in args.noise for d in DEFAULT_DATASETS]
    with Pool(args.jobs) as pool:
        results = list(pool.imap_unordered(run_one, tasks))
    Path(args.out).parent.mkdir(parents=True, exist_ok=True)
    Path(args.out).write_text(json.dumps(results, indent=1))
    print(f"wrote {args.out}")


if __name__ == "__main__":
    main()
