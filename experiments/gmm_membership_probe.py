"""
Flipped-label detection check (gate 1) for soft, Gaussian-mixture ball splitting.

Idea (user, 4 Nov 2026): split granular balls with a Gaussian mixture instead of k-means, so
every point gets a soft membership (its posterior in the component that formed its ball), and
use that as the fuzzy weight. Memberships compared (single-point balls kept, as in keep + T7):
  GMM balls (gen_ball_gmm.py)
    ball_last   ball weight = mean responsibility of its points at their last split
    ball_path   ball weight = mean product of responsibilities along the split chain
    T7_gmm      neighbour agreement T7 (k = 10 nearest balls) on the GMM balls
    point_last, point_path   each point's own responsibility (for a point-level model)
  k-means balls (gen_ball.py), reference
    T7          neighbour agreement, the current best
  Label-aware variant (a mixture per class instead of one unlabelled mixture)
    cpost       cross-fitted class posterior p(y_i | x_i) from one diagonal GMM per class
                (5 folds, up to 5 components), for each point
    cpost_ball  on k-means balls: mean posterior of the ball's label over its points
Scoring as noise_diagnostics.py: ROC-AUC of low weight for flipped points; a ball weight
scores a point only if the point carries the ball's label (otherwise 0, as the ball relabels it).

Example:
  python experiments/gmm_membership_probe.py --out results/gmm_probe
"""
import argparse
import os
from functools import partial
from multiprocessing import Pool
from pathlib import Path

import numpy as np
import pandas as pd
from sklearn.mixture import GaussianMixture
from sklearn.model_selection import StratifiedKFold

from noise_diagnostics import auc_low, flipped_mask
from run_fuzzy_cv import DEFAULT_DATASETS, ROOT, ball_set_from_balls  # noqa: E402
from addNoisy import recreat_data  # noqa: E402
from dataset_utils import (  # noqa: E402
    discover_datasets, load_binary_dataset, standardize_train_test, stratified_train_test_split,
)
from fuzzy_membership import compute_membership  # noqa: E402
from gen_ball import gen_balls  # noqa: E402
from gen_ball_gmm import gen_balls_gmm  # noqa: E402


def class_posterior(X, y, folds=5, max_comp=5, seed=0):
    """Cross-fitted p(y_i | x_i) from one diagonal GMM per class."""
    post = np.full(len(y), 0.5)
    classes = np.unique(y)
    n_splits = min(folds, int(min(np.sum(y == c) for c in classes)))
    if n_splits < 2:
        return post
    for tr, te in StratifiedKFold(n_splits, shuffle=True, random_state=seed).split(X, y):
        logp = []
        for c in classes:
            Xc = X[tr][y[tr] == c]
            comp = max(1, min(max_comp, len(Xc) // 10))
            gm = GaussianMixture(comp, covariance_type="diag", reg_covar=1e-3, random_state=seed).fit(Xc)
            logp.append(gm.score_samples(X[te]) + np.log(len(Xc) / len(tr)))
        logp = np.array(logp).T
        logp -= logp.max(1, keepdims=True)
        p = np.exp(logp)
        p /= p.sum(1, keepdims=True)
        post[te] = p[np.arange(len(te)), np.searchsorted(classes, y[te])]
    return post


def ball_index(balls, n):
    ball_of = np.empty(n, dtype=int)
    for b, ball in enumerate(balls):
        ball_of[ball["indices"]] = b
    return ball_of


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
            X, y = noisy[:, :-1], noisy[:, -1]
            n, mino = len(y), y == 1
            cpost = class_posterior(X, y, seed=r)
            for k in k_values:
                km = gen_balls(noisy, pur=0.985, delbals=1, k_clusters=k, return_details=True)
                kbs, kof = ball_set_from_balls(km), ball_index(km, n)
                kown = kbs["labels"][kof] == y
                gm = gen_balls_gmm(noisy, pur=0.985, delbals=1, k_clusters=k)
                gbs, gof = ball_set_from_balls(gm), ball_index(gm, n)
                gown = gbs["labels"][gof] == y
                r_last, r_path = np.empty(n), np.empty(n)
                for ball in gm:
                    r_last[ball["indices"]] = ball["resp_last"]
                    r_path[ball["indices"]] = ball["resp_path"]
                lab_k = np.array([b["label"] for b in km])
                cp_ball = np.array([np.mean(np.where(y[b["indices"]] == lab_k[j], cpost[b["indices"]], 1 - cpost[b["indices"]]))
                                    for j, b in enumerate(km)])
                ball_m = {
                    "T7": (compute_membership("agreement", kbs["centers"], kbs["radii"], kbs["labels"], kbs["counts"], (10, 1.0)), kof, kown),
                    "cpost_ball": (cp_ball, kof, kown),
                    "T7_gmm": (compute_membership("agreement", gbs["centers"], gbs["radii"], gbs["labels"], gbs["counts"], (10, 1.0)), gof, gown),
                    "ball_last": (np.array([np.mean(b["resp_last"]) for b in gm]), gof, gown),
                    "ball_path": (np.array([np.mean(b["resp_path"]) for b in gm]), gof, gown),
                }
                row = {"dataset": path.stem, "noise": noise, "repeat": r, "k": k,
                       "n_balls_kmeans": len(km), "n_balls_gmm": len(gm)}
                for name, (m, of, own) in ball_m.items():
                    sc = np.where(own, m[of], 0.0)
                    row[f"auc_{name}"] = auc_low(flipped, sc)
                    row[f"auc_{name}_minority"] = auc_low(flipped[mino], sc[mino])
                for name, sc in {"point_last": r_last, "point_path": r_path, "cpost": cpost}.items():
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
    ap.add_argument("--out", default=str(ROOT / "results" / "gmm_probe"))
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
    per_ds = df.groupby(["noise", "dataset"])[cols + ["n_balls_kmeans", "n_balls_gmm"]].mean()
    summary = per_ds.groupby("noise").mean().T
    summary.columns = [f"{n:.0%} noise" for n in summary.columns]
    wins = (per_ds[cols].sub(per_ds["auc_T7"], axis=0) > 0).groupby("noise").sum().T
    lines = ["# GMM (soft) ball splitting probe", "",
             f"{df['dataset'].nunique()} datasets, {df['repeat'].nunique()} splits, k in {sorted(int(k) for k in df['k'].unique())}, "
             "single-point balls kept. ROC-AUC of low membership for flipped points (0.5 = chance); "
             "'_minority' = within points labelled +1. In brackets: datasets where the measure beats T7 (k-means balls).", "",
             "| measure | " + " | ".join(summary.columns) + " |", "|---|" + "---|" * len(summary.columns)]
    for idx, row in summary.iterrows():
        show_w = idx in wins.index and not idx.endswith("_minority")
        cells = [(f"{v:.3f}" if idx.startswith("auc") else f"{v:.0f}") + (f" ({int(wins.loc[idx].iloc[j])})" if show_w else "")
                 for j, v in enumerate(row)]
        lines.append(f"| {idx} | " + " | ".join(cells) + " |")
    (out / "summary.md").write_text("\n".join(lines) + "\n")
    print("\n".join(lines))


if __name__ == "__main__":
    main()
