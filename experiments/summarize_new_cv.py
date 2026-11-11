"""
Fair-CV summary of the memberships added on 2026-11-11 (results/fuzzy_cv_new) against the
baselines on the same 10 splits: splits 0-4 of fuzzy_cv_v4 and 5-9 of fuzzy_cv_v6 (GBLSTSVM,
LSTSVM, FKNN-LSTSVM, T7-agree) and fuzzy_cv_boundary (Keep+boundary).
Writes results/fuzzy_cv_new/summary_vs_baselines.csv: per noise level and metric, each new
method's mean, and its difference, wins/losses and Wilcoxon p against every baseline.

Example:
  python experiments/summarize_new_cv.py
"""
import json
from pathlib import Path

import numpy as np
import pandas as pd
from scipy.stats import wilcoxon

ROOT = Path(__file__).resolve().parents[1]
NEW = ["Keep+shrunk", "Keep+gapvote", "Keep+relative"]
BASE = ["GBLSTSVM", "T7-agree", "Keep+boundary", "LSTSVM", "FKNN-LSTSVM"]


def load(folder, methods, repeats=None):
    rows = []
    for f in sorted((ROOT / "results" / folder).glob("*__noise*.json")):
        d = json.loads(f.read_text())
        for rep in d["repeats"]:
            if repeats is not None and rep["repeat"] not in repeats:
                continue
            for m, res in rep["methods"].items():
                if m in methods:
                    rows.append({"dataset": d["dataset"], "noise": d["noise"], "repeat": rep["repeat"], "method": m,
                                 "accuracy": res["accuracy"], "balanced_accuracy": 100.0 * res["balanced_accuracy"]})
    return rows


def main():
    rows = (load("fuzzy_cv_v4", BASE, range(5)) + load("fuzzy_cv_v6", BASE, range(5, 10))
            + load("fuzzy_cv_boundary", BASE) + load("fuzzy_cv_new", NEW))
    df = pd.DataFrame(rows)
    df = df[df.dataset.isin(set(df[df.method == NEW[0]].dataset))]
    n = df.groupby(["method", "noise", "dataset"]).repeat.nunique()
    # GBLSTSVM has no model on a few splits (all balls of one class deleted); its mean uses the rest
    assert n.drop("GBLSTSVM").eq(10).all() and n.ge(8).all(), f"missing splits: {n[n != 10]}"
    out = []
    for metric in ("accuracy", "balanced_accuracy"):
        per = df.groupby(["noise", "method", "dataset"])[metric].mean().unstack("method")
        for noise, block in per.groupby(level="noise"):
            for m in BASE + NEW:
                row = {"metric": metric, "noise": noise, "method": m, "mean": block[m].mean()}
                for b in BASE:
                    diff = (block[m] - block[b]).to_numpy()
                    row[f"vs_{b}"] = diff.mean()
                    row[f"w_{b}"] = f"{int((diff > 1e-9).sum())}/{int((diff < -1e-9).sum())}"
                    row[f"p_{b}"] = wilcoxon(diff).pvalue if m != b and np.any(diff != 0) else np.nan
                out.append(row)
    res = pd.DataFrame(out)
    res.to_csv(ROOT / "results" / "fuzzy_cv_new" / "summary_vs_baselines.csv", index=False)
    pd.set_option("display.width", 250)
    print(res[res.metric == "balanced_accuracy"][["noise", "method", "mean", "vs_GBLSTSVM", "p_GBLSTSVM", "vs_T7-agree", "w_T7-agree",
                                                    "p_T7-agree", "vs_LSTSVM", "p_LSTSVM", "vs_FKNN-LSTSVM", "p_FKNN-LSTSVM"]].round(3).to_string(index=False))
    print(res[res.metric == "accuracy"][["noise", "method", "mean", "vs_GBLSTSVM", "p_GBLSTSVM", "vs_T7-agree", "p_T7-agree", "vs_LSTSVM", "p_LSTSVM"]].round(3).to_string(index=False))


if __name__ == "__main__":
    main()
