"""
Summarize results written by run_fuzzy_cv.py or run_kernel_cv.py.

Writes, for each noise level and metric:
  * summary_<metric>.csv       mean and std per dataset and method
  * summary.md                 mean table, average ranks, Friedman test,
                               Wilcoxon signed-rank of every method vs GBLSTSVM

Example:
  python experiments/summarize_fuzzy.py results/fuzzy_cv_v1
  python experiments/summarize_fuzzy.py results/kernel_cv_v1 --baseline K-GBLSTSVM
"""
import argparse
import json
from pathlib import Path

import numpy as np
import pandas as pd
from scipy.stats import friedmanchisquare, rankdata, wilcoxon

METRICS = ["accuracy", "balanced_accuracy", "gmean", "roc_auc", "f1"]
BASELINE = "GBLSTSVM"


def load(results_dir):
    rows = []
    for f in sorted(Path(results_dir).glob("*.json")):
        rec = json.loads(f.read_text())
        for rep in rec["repeats"]:
            for method, res in rep["methods"].items():
                row = {"dataset": rec["dataset"], "noise": rec["noise"], "repeat": rep["repeat"], "method": method}
                row.update({m: res[m] for m in METRICS})
                row.update({"k": res["k"], "imbalance": res["imbalance"], "param": res["param"],
                            "mean_membership": res["mean_membership"]})
                rows.append(row)
    return pd.DataFrame(rows)


def method_order(df):
    preferred = ["GBLSTSVM", "T1-centre", "T2-entropy", "T4-overlap", "T5-density", "LSTSVM",
                 "K-GBLSTSVM", "K-GB-keep", "K-keep-T7", "K-LSTSVM", "K-FKNN-LSTSVM"]
    present = list(df["method"].unique())
    return [m for m in preferred if m in present] + sorted(m for m in present if m not in preferred)


def stats_block(mean_table, higher_is_better=True):
    """Average ranks, Friedman p-value, Wilcoxon p-value of each method vs the baseline."""
    data = mean_table.dropna()
    vals = data.values if higher_is_better else -data.values
    ranks = np.vstack([rankdata(-row) for row in vals])
    avg_rank = pd.Series(ranks.mean(axis=0), index=data.columns)
    try:
        fried_p = friedmanchisquare(*[data[c].values for c in data.columns]).pvalue
    except ValueError:
        fried_p = float("nan")
    wil = {}
    for c in data.columns:
        if c == BASELINE or BASELINE not in data.columns:
            continue
        diff = data[c].values - data[BASELINE].values
        if np.allclose(diff, 0):
            wil[c] = (1.0, 0, 0, 0)
            continue
        p = wilcoxon(data[c].values, data[BASELINE].values).pvalue
        wins = int(np.sum(diff > 1e-9))
        ties = int(np.sum(np.abs(diff) <= 1e-9))
        losses = int(np.sum(diff < -1e-9))
        wil[c] = (p, wins, ties, losses)
    return avg_rank, fried_p, wil


def main():
    ap = argparse.ArgumentParser()
    ap.add_argument("results_dir")
    ap.add_argument("--baseline", default=BASELINE, help="method the Wilcoxon tests compare against")
    args = ap.parse_args()
    globals()["BASELINE"] = args.baseline
    out = Path(args.results_dir)
    df = load(out)
    if df.empty:
        print("no results yet")
        return
    order = method_order(df)
    lines = [f"# Fuzzy membership comparison ({out.name})", ""]
    lines.append(f"Datasets: {df['dataset'].nunique()}, repeats per dataset: {df['repeat'].nunique()}, "
                 f"methods: {', '.join(order)}")
    lines.append("")
    for metric in METRICS:
        g = df.groupby(["noise", "dataset", "method"])[metric]
        tab = pd.concat([g.mean().rename("mean"), g.std().rename("std")], axis=1).reset_index()
        tab.to_csv(out / f"summary_{metric}.csv", index=False)

    for noise in sorted(df["noise"].unique()):
        sub = df[df["noise"] == noise]
        lines.append(f"## Label noise {noise:.0%}")
        lines.append("")
        for metric in ["balanced_accuracy", "roc_auc", "accuracy", "gmean"]:
            mean_table = sub.groupby(["dataset", "method"])[metric].mean().unstack()[order]
            avg_rank, fried_p, wil = stats_block(mean_table)
            lines.append(f"### {metric} (mean over repeats)")
            lines.append("")
            lines.append("| dataset | " + " | ".join(order) + " |")
            lines.append("|---|" + "---|" * len(order))
            for ds, row in mean_table.iterrows():
                best = row.max()
                cells = [(f"**{v:.4f}**" if abs(v - best) < 1e-9 else f"{v:.4f}") for v in row.values]
                lines.append(f"| {ds} | " + " | ".join(cells) + " |")
            lines.append("| **mean** | " + " | ".join(f"{v:.4f}" for v in mean_table.mean().values) + " |")
            lines.append("| **avg rank** | " + " | ".join(f"{avg_rank[c]:.2f}" for c in order) + " |")
            lines.append("")
            lines.append(f"Friedman p = {fried_p:.4g}. Wilcoxon vs {BASELINE} (p, wins/ties/losses): " +
                         "; ".join(f"{c}: p={p:.3g} ({w}/{t}/{l})" for c, (p, w, t, l) in wil.items()))
            lines.append("")
    (out / "summary.md").write_text("\n".join(lines))
    print("\n".join(lines))


if __name__ == "__main__":
    main()
