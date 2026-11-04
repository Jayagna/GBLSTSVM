"""
Quick check of a cross-fitted residual membership for granular balls, before any CV run.

Same datasets, splits, label noise, k values and scoring as noise_diagnostics.py. For each
ball set (k-means balls, single-point balls kept) the balls are split into 5 stratified
folds; the twin planes are fit on the other folds' balls (fixed c1 = c2 = C, class-ratio
weighting on) and every held-out ball gets its margin y * (d2 - d1). Membership =
sigmoid(margin / std(margins)): low when the ball sits on the other class's side.
It is scored like the other memberships: ROC-AUC of "low membership" for "flipped point",
a point getting its ball's membership, or 0 when its label is outvoted in its ball.

Measures:
  auc_T7            neighbour agreement (k = 10), as in noise_diagnostics.py
  auc_point_knn     the same on raw samples (fuzzy kNN)
  auc_res_C         cross-fitted residual membership on balls, C in {0.1, 1, 10}
  auc_res_point_1   the same on raw samples (a classification filter), C = 1
  auc_T7xres_1      T7 * residual membership (C = 1)

Example:
  python experiments/residual_membership_probe.py --out results/residual_probe
"""
import argparse
import os
from functools import partial
from multiprocessing import Pool
from pathlib import Path

import numpy as np
import pandas as pd
from sklearn.model_selection import StratifiedKFold

from noise_diagnostics import auc_low, flipped_mask
from run_fuzzy_cv import DEFAULT_DATASETS, ROOT, ball_set_from_balls, ball_set_from_samples, fit_planes  # noqa: E402
from addNoisy import recreat_data  # noqa: E402
from dataset_utils import (  # noqa: E402
    discover_datasets, load_binary_dataset, standardize_train_test, stratified_train_test_split,
)
from fuzzy_membership import compute_membership  # noqa: E402
from gen_ball import gen_balls  # noqa: E402
from GBLSTSVM import gb_decision_scores  # noqa: E402

C_VALUES = [0.1, 1.0, 10.0]


def subset(bs, idx):
    return {key: val[idx] for key, val in bs.items() if isinstance(val, np.ndarray)}


def residual_membership(bs, c, folds=5, seed=0):
    """Cross-fitted margin of every ball, mapped to (0, 1) by a sigmoid."""
    y = bs["labels"]
    n_min = int(min(np.sum(y == 1), np.sum(y == -1)))
    folds = max(2, min(folds, n_min))
    margin = np.zeros(len(y))
    for tr, te in StratifiedKFold(n_splits=folds, shuffle=True, random_state=seed).split(bs["centers"], y):
        part = subset(bs, tr)
        try:
            w1, b1, w2, b2 = fit_planes(part, np.ones(len(tr)), c, c, True)
        except np.linalg.LinAlgError:
            continue
        margin[te] = y[te] * gb_decision_scores(bs["centers"][te], w1, b1, w2, b2)
    scale = np.std(margin) + 1e-12
    return 1.0 / (1.0 + np.exp(-margin / scale))


def run_dataset(path, noise_levels, repeats, k_values):
    data, _ = load_binary_dataset(path, minority_positive=True)
    rows = []
    for noise in noise_levels:
        for r in range(repeats):
            train, _ = stratified_train_test_split(data, test_size=0.30, random_state=r)
            train, _ = standardize_train_test(train, _)
            np.random.seed(r)
            noisy = np.asarray(recreat_data(train, noise), dtype=np.float64)
            flipped = flipped_mask(train, noisy)
            y = noisy[:, -1]
            samples = ball_set_from_samples(noisy)
            knn = compute_membership("agreement", *samples.values(), (10, 1.0))
            res_point = residual_membership(samples, 1.0, seed=r)
            for k in k_values:
                balls = gen_balls(noisy, pur=0.985, delbals=1, k_clusters=k, return_details=True)
                bs = ball_set_from_balls(balls)
                ball_of = np.empty(len(noisy), dtype=int)
                for b, ball in enumerate(balls):
                    ball_of[ball["indices"]] = b
                own = bs["labels"][ball_of] == y

                def score(m):
                    return auc_low(flipped, np.where(own, m[ball_of], 0.0))

                t7 = compute_membership("agreement", bs["centers"], bs["radii"], bs["labels"], bs["counts"], (10, 1.0))
                row = {"dataset": path.stem, "noise": noise, "repeat": r, "k": k,
                       "auc_point_knn": auc_low(flipped, knn), "auc_res_point_1": auc_low(flipped, res_point),
                       "auc_T7": score(t7)}
                for c in C_VALUES:
                    res = residual_membership(bs, c, seed=r)
                    row[f"auc_res_{c:g}"] = score(res)
                    if c == 1.0:
                        row["auc_T7xres_1"] = score(t7 * res)
                rows.append(row)
    return rows


def main():
    ap = argparse.ArgumentParser(description=__doc__, formatter_class=argparse.RawDescriptionHelpFormatter)
    ap.add_argument("--noise", nargs="+", type=float, default=[0.1, 0.2, 0.3])
    ap.add_argument("--repeats", type=int, default=5)
    ap.add_argument("--k-values", nargs="+", type=int, default=[2, 4, 6])
    ap.add_argument("--datasets", nargs="+", default=DEFAULT_DATASETS)
    ap.add_argument("--out", default=str(ROOT / "results" / "residual_probe"))
    ap.add_argument("--jobs", type=int, default=os.cpu_count() or 1)
    args = ap.parse_args()
    files = {p.stem: p for p in discover_datasets(str(ROOT / "Data"))}
    job = partial(run_dataset, noise_levels=args.noise, repeats=args.repeats, k_values=args.k_values)
    rows = []
    with Pool(args.jobs) as pool:
        for part in pool.imap_unordered(job, [files[d] for d in args.datasets]):
            rows += part
            print(f"done {part[0]['dataset']}", flush=True)
    df = pd.DataFrame(rows)
    out = Path(args.out)
    out.mkdir(parents=True, exist_ok=True)
    df.to_csv(out / "probe.csv", index=False)
    cols = [c for c in df.columns if c.startswith("auc_")]
    per_ds = df.groupby(["noise", "dataset"])[cols].mean()
    summary = per_ds.groupby("noise").mean().T
    summary.columns = [f"{n:.0%} noise" for n in summary.columns]
    wins = (per_ds.sub(per_ds["auc_T7"], axis=0) > 0).groupby("noise").sum().T
    lines = ["# Residual membership probe", "",
             f"{df['dataset'].nunique()} datasets, {df['repeat'].nunique()} splits, k in {sorted(int(k) for k in df['k'].unique())}. "
             "ROC-AUC of low membership for flipped points (0.5 = chance), averaged over splits and k per dataset, then over datasets. "
             "In brackets: datasets where the measure beats T7.", "",
             "| measure | " + " | ".join(summary.columns) + " |", "|---|" + "---|" * len(summary.columns)]
    for idx, row in summary.iterrows():
        lines.append(f"| {idx} | " + " | ".join(f"{v:.3f} ({int(wins.loc[idx].iloc[j])})" for j, v in enumerate(row)) + " |")
    (out / "summary.md").write_text("\n".join(lines) + "\n")
    print("\n".join(lines))


if __name__ == "__main__":
    main()
