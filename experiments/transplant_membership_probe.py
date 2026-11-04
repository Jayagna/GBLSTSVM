"""
Flipped-label detection check (gate 1) for memberships published for other fuzzy SVMs and
not yet used in GBLSTSVM, computed on k-means balls with single-point balls kept:
  IF   intuitionistic fuzzy score (Ha et al. 2013; Rezvani et al. IFTSVM 2019):
       mu = T1 centre membership, rho = share of the k = 10 nearest balls with the other
       label (= 1 - T7), nu = (1 - mu) * rho;
       s = mu if nu = 0, 0 if mu <= nu, else (1 - nu) / (2 - mu - nu)
  FR   fuzzy-rough lower approximation (fuzzy-rough SVMs / FRIS instance selection):
       s = 1 - max_j R(c_i, c_j) over balls j of the other label, R = exp(-d^2 / (2 sigma^2));
       it ranks balls by the distance to the nearest other-class ball (sigma does not change the AUC)
Same datasets, splits, noise and scoring as noise_diagnostics.py, with T7 and T1 for reference.

Example:
  python experiments/transplant_membership_probe.py --out results/transplant_probe
"""
import argparse
import os
from functools import partial
from multiprocessing import Pool
from pathlib import Path

import numpy as np
import pandas as pd
from sklearn.neighbors import NearestNeighbors

from noise_diagnostics import auc_low, flipped_mask
from run_fuzzy_cv import DEFAULT_DATASETS, ROOT, ball_set_from_balls  # noqa: E402
from addNoisy import recreat_data  # noqa: E402
from dataset_utils import (  # noqa: E402
    discover_datasets, load_binary_dataset, standardize_train_test, stratified_train_test_split,
)
from fuzzy_membership import compute_membership  # noqa: E402
from gen_ball import gen_balls  # noqa: E402


def intuitionistic(bs, k=10):
    mu = compute_membership("centre", bs["centers"], bs["radii"], bs["labels"], bs["counts"])
    rho = 1.0 - compute_membership("agreement", bs["centers"], bs["radii"], bs["labels"], bs["counts"], (k, 1.0))
    nu = (1.0 - mu) * rho
    s = np.where(mu <= nu, 0.0, (1.0 - nu) / np.maximum(2.0 - mu - nu, 1e-12))
    return np.where(nu <= 1e-12, mu, s)


def fuzzy_rough(bs):
    c, y = bs["centers"], bs["labels"]
    d_min = np.empty(len(y))
    for lab in (-1.0, 1.0):
        own, other = y == lab, y != lab
        d_min[own] = NearestNeighbors(n_neighbors=1).fit(c[other]).kneighbors(c[own])[0][:, 0]
    sigma = np.median(d_min) + 1e-12
    return 1.0 - np.exp(-d_min ** 2 / (2 * sigma ** 2))


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
                ms = {"T7": compute_membership("agreement", bs["centers"], bs["radii"], bs["labels"], bs["counts"], (10, 1.0)),
                      "T1": compute_membership("centre", bs["centers"], bs["radii"], bs["labels"], bs["counts"]),
                      "IF": intuitionistic(bs), "FR": fuzzy_rough(bs)}
                row = {"dataset": path.stem, "noise": noise, "repeat": r, "k": k}
                for name, m in ms.items():
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
    ap.add_argument("--datasets", nargs="+", default=DEFAULT_DATASETS)
    ap.add_argument("--out", default=str(ROOT / "results" / "transplant_probe"))
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
    lines = ["# Transplanted membership probe", "",
             f"{df['dataset'].nunique()} datasets, {df['repeat'].nunique()} splits, k in {sorted(int(k) for k in df['k'].unique())}, "
             "single-point balls kept. ROC-AUC of low membership for flipped points (0.5 = chance); "
             "'_minority' = within points labelled +1. In brackets: datasets where the measure beats T7 overall.", "",
             "| measure | " + " | ".join(summary.columns) + " |", "|---|" + "---|" * len(summary.columns)]
    for idx, row in summary.iterrows():
        cells = [f"{v:.3f}" + (f" ({int(wins.loc[idx].iloc[j])})" if idx in wins.index and not idx.endswith("_minority") else "") for j, v in enumerate(row)]
        lines.append(f"| {idx} | " + " | ".join(cells) + " |")
    (out / "summary.md").write_text("\n".join(lines) + "\n")
    print("\n".join(lines))


if __name__ == "__main__":
    main()
