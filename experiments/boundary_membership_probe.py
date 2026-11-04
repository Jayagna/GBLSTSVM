"""
Flipped-label detection check for a boundary-aware neighbour membership (gate 1).

Motivation: deleting single-point balls removes most flipped labels but also 41-60% of clean
points, mostly boundary and minority points. T7 (neighbour agreement) has the same blind spot:
a clean boundary point and a flipped point both have few same-label neighbours.
What tells them apart is the neighbourhood of the neighbours:
  * a flipped point sits inside the other class, whose members agree with each other;
  * a clean boundary point sits among points that are themselves mixed.
Memberships (k = 10 nearest balls, count-weighted, as T7):
  T7         a_i = share of the neighbours with ball i's label
  bal        the same with each neighbour weighted by 1 / prior of its class (class-balanced vote)
  2nd        m_i = 1 - (1 - a_i) * b_i, b_i = mean agreement a_j of i's neighbours
  bal2nd     2nd built on the class-balanced agreement
Each is also computed on raw samples (fuzzy kNN family). Same datasets, splits, noise and
scoring as noise_diagnostics.py; also reports the AUC within the minority (+1) label only.

Example:
  python experiments/boundary_membership_probe.py --out results/boundary_probe
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
from gen_ball import gen_balls  # noqa: E402

K_NN = 10


def memberships(centers, labels, counts, k=K_NN):
    n = len(labels)
    k = min(k, n - 1)
    nn = NearestNeighbors(n_neighbors=k + 1).fit(centers).kneighbors(centers, return_distance=False)[:, 1:]
    prior = {c: counts[labels == c].sum() / counts.sum() for c in (-1.0, 1.0)}
    inv = np.array([1.0 / prior[l] for l in labels])
    same = labels[nn] == labels[:, None]
    out = {}
    for name, w in (("T7", counts[nn]), ("bal", counts[nn] * inv[nn])):
        a = np.sum(w * same, axis=1) / np.sum(w, axis=1)
        b = np.sum(counts[nn] * a[nn], axis=1) / np.sum(counts[nn], axis=1)
        out[name] = a
        out[name + "2nd" if name == "bal" else "2nd"] = 1.0 - (1.0 - a) * b
    return out


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
            pts = memberships(noisy[:, :-1], y, np.ones(len(y)))
            for k in k_values:
                balls = gen_balls(noisy, pur=0.985, delbals=1, k_clusters=k, return_details=True)
                bs = ball_set_from_balls(balls)
                ball_of = np.empty(len(noisy), dtype=int)
                for b, ball in enumerate(balls):
                    ball_of[ball["indices"]] = b
                own = bs["labels"][ball_of] == y
                mb = memberships(bs["centers"], bs["labels"], bs["counts"])
                row = {"dataset": path.stem, "noise": noise, "repeat": r, "k": k}
                for name, m in mb.items():
                    sc = np.where(own, m[ball_of], 0.0)
                    row[f"auc_ball_{name}"] = auc_low(flipped, sc)
                    row[f"auc_ball_{name}_minority"] = auc_low(flipped[mino], sc[mino])
                for name, m in pts.items():
                    row[f"auc_point_{name}"] = auc_low(flipped, m)
                    row[f"auc_point_{name}_minority"] = auc_low(flipped[mino], m[mino])
                rows.append(row)
    return rows


def main():
    ap = argparse.ArgumentParser(description=__doc__, formatter_class=argparse.RawDescriptionHelpFormatter)
    ap.add_argument("--noise", nargs="+", type=float, default=[0.1, 0.2, 0.3])
    ap.add_argument("--repeats", type=int, default=5)
    ap.add_argument("--k-values", nargs="+", type=int, default=[2, 4, 6])
    ap.add_argument("--datasets", nargs="+", default=DEFAULT_DATASETS)
    ap.add_argument("--out", default=str(ROOT / "results" / "boundary_probe"))
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
    lines = ["# Boundary-aware membership probe", "",
             f"{df['dataset'].nunique()} datasets, {df['repeat'].nunique()} splits, k in {sorted(int(k) for k in df['k'].unique())}. "
             "ROC-AUC of low membership for flipped points (0.5 = chance); '_minority' = within points labelled +1.", "",
             "| measure | " + " | ".join(summary.columns) + " |", "|---|" + "---|" * len(summary.columns)]
    lines += [f"| {idx} | " + " | ".join(f"{v:.3f}" for v in row) + " |" for idx, row in summary.iterrows()]
    (out / "summary.md").write_text("\n".join(lines) + "\n")
    print("\n".join(lines))


if __name__ == "__main__":
    main()
