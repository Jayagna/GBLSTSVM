"""
What GBLSTSVM's ball step does with mislabelled training points.

For every dataset, label-noise level and split (same splits and noise as
run_fuzzy_cv.py) and k-means k in --k-values, it builds the k-means granular
balls and records:
  * deletion: the share of flipped and of clean training points that end up in a
    single-point ball, which GBLSTSVM deletes (also for the minority class only)
  * detection: how well each membership flags flipped points, as ROC-AUC of
    "low membership" for "flipped" (0.5 = chance). A point gets its ball's
    membership, or 0 when its own label is outvoted in its ball.

Writes per-run rows to diagnostics.csv and averages to summary.md in --out.

Example:
  python experiments/noise_diagnostics.py --out results/noise_diagnostics
"""
import argparse
import os
from collections import defaultdict
from functools import partial
from multiprocessing import Pool
from pathlib import Path

import numpy as np
import pandas as pd
from sklearn.metrics import roc_auc_score

from run_fuzzy_cv import DEFAULT_DATASETS, ROOT, ball_set_from_balls, ball_set_from_samples  # noqa: E402
from addNoisy import recreat_data  # noqa: E402
from dataset_utils import (  # noqa: E402
    discover_datasets, load_binary_dataset, select_datasets, standardize_train_test, stratified_train_test_split,
)
from fuzzy_membership import compute_membership  # noqa: E402
from gen_ball import gen_balls  # noqa: E402

BALL_SCORES = [("T1 centre", "centre", None), ("T2 entropy", "entropy", None), ("T4 overlap", "overlap", None),
               ("T5 density", "density", None), ("T7 agreement", "agreement", (10, 1.0))]


def flipped_mask(clean, noisy):
    """recreat_data shuffles the rows, so match each noisy row to the clean label of its feature vector."""
    labels = defaultdict(list)
    for row in clean:
        labels[row[:-1].tobytes()].append(row[-1])
    mask = np.zeros(len(noisy), dtype=bool)
    for i, row in enumerate(noisy):
        own = labels[row[:-1].tobytes()]
        mask[i] = row[-1] not in own  # duplicates with mixed clean labels count as not flipped
    return mask


def auc_low(flipped, score):
    return roc_auc_score(flipped, -score) if 0 < flipped.sum() < len(flipped) else np.nan


def run_dataset(path, noise_levels, repeats, k_values):
    data, meta = load_binary_dataset(path, minority_positive=True)
    rows = []
    for noise in noise_levels:
        for r in range(repeats):
            train, _ = stratified_train_test_split(data, test_size=0.30, random_state=r)
            train, _ = standardize_train_test(train, _)
            np.random.seed(r)
            noisy = np.asarray(recreat_data(train, noise), dtype=np.float64)
            flipped = flipped_mask(train, noisy)
            y = noisy[:, -1]
            minority = y == 1  # positive class is the minority (load_binary_dataset(minority_positive=True))
            knn = compute_membership("agreement", *ball_set_from_samples(noisy).values(), (10, 1.0))
            for k in k_values:
                balls = gen_balls(noisy, pur=0.985, delbals=1, k_clusters=k, return_details=True)
                bs = ball_set_from_balls(balls)
                ball_of = np.empty(len(noisy), dtype=int)
                for b, ball in enumerate(balls):
                    ball_of[ball["indices"]] = b
                own = bs["labels"][ball_of] == y
                single = bs["counts"][ball_of] == 1
                row = {"dataset": path.stem, "noise": noise, "repeat": r, "k": k, "n_train": len(noisy),
                       "n_flipped": int(flipped.sum()), "n_balls": len(balls), "n_single": int(np.sum(bs["counts"] == 1)),
                       "deleted_flipped": single[flipped].mean(), "deleted_clean": single[~flipped].mean(),
                       "deleted_clean_minority": single[~flipped & minority].mean(),
                       "deleted_clean_majority": single[~flipped & ~minority].mean(),
                       "auc_singleton": auc_low(flipped, (~single).astype(float)),
                       "auc_point_knn": auc_low(flipped, knn)}
                for name, key, param in BALL_SCORES:
                    m = compute_membership(key, bs["centers"], bs["radii"], bs["labels"], bs["counts"], param)
                    row["auc_" + name.split()[0]] = auc_low(flipped, np.where(own, m[ball_of], 0.0))
                rows.append(row)
    return rows


def main():
    ap = argparse.ArgumentParser(description=__doc__, formatter_class=argparse.RawDescriptionHelpFormatter)
    ap.add_argument("--data-dir", default=str(ROOT / "Data"))
    ap.add_argument("--datasets", nargs="+", default=DEFAULT_DATASETS)
    ap.add_argument("--noise", nargs="+", type=float, default=[0.1, 0.2, 0.3])
    ap.add_argument("--repeats", type=int, default=5)
    ap.add_argument("--k-values", nargs="+", type=int, default=[2, 4, 6])
    ap.add_argument("--out", default=str(ROOT / "results" / "noise_diagnostics"))
    ap.add_argument("--jobs", type=int, default=os.cpu_count() or 1)
    args = ap.parse_args()
    files = discover_datasets(args.data_dir)
    selected = []
    for name in args.datasets:
        exact = [p for p in files if p.stem.lower() == name.lower()]
        selected += exact if exact else select_datasets(files, [name])
    rows = []
    job = partial(run_dataset, noise_levels=args.noise, repeats=args.repeats, k_values=args.k_values)
    with Pool(args.jobs) as pool:
        for part in pool.imap_unordered(job, list(dict.fromkeys(selected))):
            rows += part
            print(f"done {part[0]['dataset']}", flush=True)
    df = pd.DataFrame(rows)
    out = Path(args.out)
    out.mkdir(parents=True, exist_ok=True)
    df.to_csv(out / "diagnostics.csv", index=False)
    cols = [c for c in df.columns if c.startswith(("deleted_", "auc_"))]
    # average over splits and k within each dataset first, then over datasets
    per_ds = df.groupby(["noise", "dataset"])[cols].mean()
    summary = per_ds.groupby("noise").mean().T
    summary.columns = [f"{n:.0%} noise" for n in summary.columns]
    lines = ["# Noise diagnostics", "",
             f"{df['dataset'].nunique()} datasets, {df['repeat'].nunique()} splits, k in {sorted(int(k) for k in df['k'].unique())}. "
             "Averaged over splits and k within each dataset, then over datasets.", "",
             "| measure | " + " | ".join(summary.columns) + " |", "|---|" + "---|" * len(summary.columns)]
    lines += [f"| {idx} | " + " | ".join(f"{v:.3f}" for v in row) + " |" for idx, row in summary.iterrows()]
    lines.append("")
    (out / "summary.md").write_text("\n".join(lines))
    print("\n".join(lines))


if __name__ == "__main__":
    main()
