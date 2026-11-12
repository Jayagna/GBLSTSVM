"""
Summary of results/test_tuning (run_test_tuning.py): every model tuned on the test set.

Writes to the results folder:
  summary.csv      mean test-tuned accuracy / balanced accuracy per method and noise level, the
                   difference to GBLSTSVM, datasets won / lost and the Wilcoxon p-value (21 datasets)
  fixed_param.csv  the same with each membership held at ONE parameter value, so its grid is the
                   same size as GBLSTSVM's (490 settings); answers "is the gain just a bigger grid?"
  split0.csv       the same on split 0 only (one split, as in the paper's protocol)
  rank_table.csv   average accuracy and average rank (1 = best, ties share the mean rank) of every
                   method over the datasets, per noise level, laid out like Table 1 of the GBLSTSVM paper
  rank_table_main.csv  the same among six models only (LSTSVM, GBLSTSVM, GBTWSVM, GBFTSVM, keep + T7,
                   keep + radius-aware vote), so ranks run 1-6 as in the paper's six-model table
  summary.md       the tables in readable form

Example:
  python experiments/summarize_test_tuning.py --results results/test_tuning
"""
import argparse
import json
from pathlib import Path

import numpy as np
import pandas as pd
from scipy.stats import rankdata, wilcoxon

ROOT = Path(__file__).resolve().parents[1]
ORDER = ["LSTSVM", "FKNN-LSTSVM", "GBLSTSVM", "T1-centre", "T2-entropy", "GBTWSVM", "GBFTSVM", "GB-keep", "T7-agree",
         "Keep+boundary", "Keep+shrunk", "Keep+gapvote", "Keep+relative"]
METRICS = {"accuracy": 1, "balanced_accuracy": 0}


def load(results):
    rows = []
    for f in sorted(Path(results).glob("*__noise*.json")):
        d = json.loads(f.read_text())
        for rep in d["repeats"]:
            for m, res in rep["methods"].items():
                by = res["by_param"]
                first = by[sorted(by)[0]] if len(by) > 1 else None
                for metric, i in METRICS.items():
                    rows.append({"dataset": d["dataset"], "noise": d["noise"], "repeat": rep["repeat"], "method": m,
                                 "metric": metric, "best": res[f"oracle_{metric}"],
                                 "fixed": first[i] if first else res[f"oracle_{metric}"],
                                 "mean_param": float(np.mean([v[i] for v in by.values()]))})
    return pd.DataFrame(rows)


def table(df, col):
    per_ds = df.groupby(["metric", "noise", "method", "dataset"])[col].mean().unstack("method")
    out = []
    for (metric, noise), block in per_ds.groupby(level=["metric", "noise"]):
        base = block["GBLSTSVM"]
        for m in [m for m in ORDER if m in block]:
            diff = (block[m] - base).to_numpy()
            p = wilcoxon(diff).pvalue if m != "GBLSTSVM" and np.any(diff != 0) else np.nan
            out.append({"metric": metric, "noise": noise, "method": m, "mean": block[m].mean(), "vs_GBLSTSVM": diff.mean(),
                        "wins": int((diff > 1e-9).sum()), "losses": int((diff < -1e-9).sum()), "p": p})
    return pd.DataFrame(out)


MAIN = ["LSTSVM", "GBLSTSVM", "GBTWSVM", "GBFTSVM", "T7-agree", "Keep+gapvote"]  # six models, as many as the paper's table


def rank_table(df, methods=ORDER, metric="accuracy"):
    per_ds = df[df.metric == metric].groupby(["noise", "dataset", "method"])["best"].mean().unstack("method")
    cols = [m for m in methods if m in per_ds]
    out = []
    for noise, block in per_ds.groupby(level="noise"):
        ranks = np.vstack([rankdata(-row) for row in block[cols].to_numpy()])
        for m, acc, rk in zip(cols, block[cols].mean(), ranks.mean(axis=0)):
            out.append({"noise": noise, "method": m, "mean_accuracy": acc, "mean_rank": rk})
    return pd.DataFrame(out)


def md(t, title):
    lines = [f"## {title}", ""]
    for metric in METRICS:
        sub = t[t.metric == metric]
        noises = sorted(sub.noise.unique())
        lines += [f"**{metric}** (mean over 21 datasets; in brackets: difference to GBLSTSVM, wins/losses, Wilcoxon p)", "",
                  "| method | " + " | ".join(f"{n:.0%}" for n in noises) + " |", "|---|" + "---|" * len(noises)]
        for m in [m for m in ORDER if m in set(sub.method)]:
            cells = []
            for n in noises:
                r = sub[(sub.method == m) & (sub.noise == n)].iloc[0]
                cells.append(f"{r['mean']:.1f}" if m == "GBLSTSVM" else
                             f"{r['mean']:.1f} ({r['vs_GBLSTSVM']:+.1f}, {r['wins']}/{r['losses']}, p={r['p']:.3f})")
            lines.append(f"| {m} | " + " | ".join(cells) + " |")
        lines.append("")
    return lines


def main():
    ap = argparse.ArgumentParser(description=__doc__, formatter_class=argparse.RawDescriptionHelpFormatter)
    ap.add_argument("--results", default=str(ROOT / "results" / "test_tuning"))
    args = ap.parse_args()
    out = Path(args.results)
    df = load(out)
    best, fixed, split0 = table(df, "best"), table(df, "fixed"), table(df[df.repeat == 0], "best")
    best.to_csv(out / "summary.csv", index=False)
    fixed.to_csv(out / "fixed_param.csv", index=False)
    split0.to_csv(out / "split0.csv", index=False)
    rt = rank_table(df)
    rt.to_csv(out / "rank_table.csv", index=False)
    rank_table(df, MAIN).to_csv(out / "rank_table_main.csv", index=False)
    lines = ["# Every model tuned on the test set (no cross-validation)", "",
             f"{df.dataset.nunique()} datasets, {df.repeat.nunique()} splits. Each number is the BEST test score over the whole "
             "grid, so it is optimistic; see run_test_tuning.py.", ""]
    lines += md(best, "Best over the whole grid, mean of all splits")
    lines += md(fixed, "Membership parameter fixed (same grid size as GBLSTSVM)")
    lines += md(split0, "Split 0 only (one split, as in the paper)")
    lines += ["## Average accuracy and average rank (layout of the GBLSTSVM paper's Table 1)", ""]
    for col, fmt in (("mean_accuracy", "{:.2f}"), ("mean_rank", "{:.2f}")):
        wide = rt.pivot(index="noise", columns="method", values=col)[[m for m in ORDER if m in set(rt.method)]]
        lines += [f"**{col}**", "", "| noise | " + " | ".join(wide.columns) + " |", "|---|" + "---|" * len(wide.columns)]
        lines += [f"| {n:.0%} | " + " | ".join(fmt.format(v) for v in row) + " |" for n, row in wide.iterrows()]
        lines.append("")
    (out / "summary.md").write_text("\n".join(lines) + "\n")
    print("\n".join(lines))


if __name__ == "__main__":
    main()
