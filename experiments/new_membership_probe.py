"""
Flipped-label detection check (gate 1) for the three memberships added on 2026-11-11:
shrunk, gapvote and relative (fuzzy_membership.py), next to T7 and the boundary-aware one.
Same datasets, splits, noise and scoring as noise_diagnostics.py: ROC-AUC of "low membership"
for "flipped" (0.5 = chance); a point takes its ball's membership, or 0 when its own label is
outvoted in its ball. Balls are the k-means balls with single-point balls kept.

Example:
  python experiments/new_membership_probe.py --out results/new_membership_probe
"""
import argparse
import os
from functools import partial
from multiprocessing import Pool
from pathlib import Path

import numpy as np
import pandas as pd

from noise_diagnostics import auc_low, flipped_mask
from run_fuzzy_cv import DEFAULT_DATASETS, ROOT, ball_set_from_balls  # noqa: E402
from addNoisy import recreat_data  # noqa: E402
from dataset_utils import (  # noqa: E402
    discover_datasets, load_binary_dataset, standardize_train_test, stratified_train_test_split,
)
from fuzzy_membership import compute_membership  # noqa: E402
from gen_ball import gen_balls  # noqa: E402

SCORES = [("T7", "agreement", (10, 1.0)), ("boundary", "boundary", (10, 1.0)), ("shrunk", "shrunk", (10, 1.0)),
          ("gapvote", "gapvote", (10, 1.0)), ("relative", "relative", (5, 1.0))]


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
            mino = y == 1
            for k in k_values:
                balls = gen_balls(noisy, pur=0.985, delbals=1, k_clusters=k, return_details=True)
                bs = ball_set_from_balls(balls)
                ball_of = np.empty(len(noisy), dtype=int)
                for b, ball in enumerate(balls):
                    ball_of[ball["indices"]] = b
                own = bs["labels"][ball_of] == y
                row = {"dataset": path.stem, "noise": noise, "repeat": r, "k": k}
                for name, fn, p in SCORES:
                    m = compute_membership(fn, bs["centers"], bs["radii"], bs["labels"], bs["counts"], p)
                    sc = np.where(own, m[ball_of], 0.0)
                    row[f"auc_{name}"] = auc_low(flipped, sc)
                    row[f"auc_{name}_minority"] = auc_low(flipped[mino], sc[mino])
                rows.append(row)
    return rows


def main():
    ap = argparse.ArgumentParser(description=__doc__, formatter_class=argparse.RawDescriptionHelpFormatter)
    ap.add_argument("--noise", nargs="+", type=float, default=[0.1, 0.2, 0.3])
    ap.add_argument("--repeats", type=int, default=5)
    ap.add_argument("--k-values", nargs="+", type=int, default=[2, 4, 6])
    ap.add_argument("--out", default=str(ROOT / "results" / "new_membership_probe"))
    ap.add_argument("--jobs", type=int, default=os.cpu_count() or 1)
    args = ap.parse_args()
    files = {p.stem: p for p in discover_datasets(str(ROOT / "Data"))}
    job = partial(run_dataset, noise_levels=args.noise, repeats=args.repeats, k_values=args.k_values)
    rows = []
    with Pool(args.jobs) as pool:
        for part in pool.imap_unordered(job, [files[d] for d in DEFAULT_DATASETS]):
            rows += part
    df = pd.DataFrame(rows)
    out = Path(args.out)
    out.mkdir(parents=True, exist_ok=True)
    df.to_csv(out / "probe.csv", index=False)
    cols = [c for c in df.columns if c.startswith("auc_")]
    per_ds = df.groupby(["noise", "dataset"])[cols].mean()
    summary = per_ds.groupby("noise").mean().T
    summary.columns = [f"{n:.0%} noise" for n in summary.columns]
    wins = {c: [int((per_ds.loc[n, c] > per_ds.loc[n, "auc_T7"]).sum()) for n in sorted(df["noise"].unique())] for c in cols}
    lines = ["# New membership probe (shrunk, gapvote, relative)", "",
             f"{df['dataset'].nunique()} datasets, {df['repeat'].nunique()} splits, k in {sorted(int(k) for k in df['k'].unique())}. "
             "ROC-AUC of low membership for flipped points (0.5 = chance); '_minority' = within points labelled +1. "
             "Last columns: datasets (of 21) where the measure beats T7.", "",
             "| measure | " + " | ".join(summary.columns) + " | " + " | ".join(f"wins {c}" for c in summary.columns) + " |",
             "|---|" + "---|" * (2 * len(summary.columns))]
    lines += [f"| {idx} | " + " | ".join(f"{v:.3f}" for v in row) + " | " + " | ".join(str(w) for w in wins[idx]) + " |"
              for idx, row in summary.iterrows()]
    (out / "summary.md").write_text("\n".join(lines) + "\n")
    print("\n".join(lines))


if __name__ == "__main__":
    main()
