"""
Tables for the paper from the three result folders written by run_paper_all.sh:

  results/test_tuning   published-style protocol for the LSTSVM family and GBFTSVM (oracle_* fields)
  results/baselines     SVM, TSVM, GBSVM, LS-GBLSTSVM under both protocols (oracle_* and cv_* fields)
  results/baselines_ls  the proposed weight on top of LS-GBLSTSVM (extra rows)
  results/paper_cv      fair cross-validation for the LSTSVM family

For each protocol ("oracle" = best test score over the grid, "cv" = settings chosen by 5-fold CV on
the training part), each metric and each noise level, over the datasets that have every model:
  * mean score and average rank per model (rank 1 = best, ties share the mean rank),
  * Friedman chi-square and the Iman-Davenport F statistic with their p-values,
  * Wilcoxon signed-rank test and win-tie-loss of the proposed model against every other model.
Scores are averaged over the splits of a dataset first; tests are across datasets.

Writes results/paper_tables/{summary.csv, pairwise.csv, friedman.csv, per_dataset.csv, summary.md}.
"""
import argparse
import csv
import json
from pathlib import Path

import numpy as np
from scipy import stats

ROOT = Path(__file__).resolve().parents[1]
OURS = "LS-keep+gapvote"  # kept balls + radius-aware weight + regulariser
LABEL = {OURS: "Proposed", "Keep+gapvote": "Proposed without the regulariser", "LS-keep": "LS-GBLSTSVM, balls kept (no weight)", "GB-keep": "GBLSTSVM, balls kept (no weight)", "T7-agree": "Plain neighbour count"}
MAIN = ["SVM", "TSVM", "GBSVM", "LSTSVM", "GBLSTSVM", "LS-GBLSTSVM", OURS]
EXTRA = ["Keep+gapvote", "LS-keep", "GBFTSVM", "GB-keep", "T7-agree"]


def load(folder, fields):
    """{(dataset, noise): {method: {metric: mean over splits}}}; fields = {metric: json key}."""
    out = {}
    for f in sorted(Path(folder).glob("*.json")):
        rec = json.loads(f.read_text())
        acc = {}
        for rep in rec["repeats"]:
            for m, v in rep["methods"].items():
                for metric, key in fields.items():
                    if key in v:
                        acc.setdefault(m, {}).setdefault(metric, []).append(v[key])
        out[(rec["dataset"], float(rec["noise"]))] = {m: {k: float(np.mean(x)) for k, x in d.items()} for m, d in acc.items()}
    return out


def merge(*parts):
    out = {}
    for p in parts:
        for key, methods in p.items():
            out.setdefault(key, {}).update(methods)
    return out


def linear_data(res):
    cv_family = load(res / "paper_cv", {"accuracy": "accuracy", "balanced_accuracy": "balanced_accuracy"})
    for methods in cv_family.values():  # run_fuzzy_cv stores balanced accuracy as a fraction
        for d in methods.values():
            if "balanced_accuracy" in d:
                d["balanced_accuracy"] *= 100.0
    data = {
        "oracle": merge(load(res / "test_tuning", {"accuracy": "oracle_accuracy", "balanced_accuracy": "oracle_balanced_accuracy"}),
                        load(res / "baselines", {"accuracy": "oracle_accuracy", "balanced_accuracy": "oracle_balanced_accuracy"}),
                        load(res / "baselines_ls", {"accuracy": "oracle_accuracy", "balanced_accuracy": "oracle_balanced_accuracy"})),
        "cv": merge(cv_family, load(res / "baselines", {"accuracy": "cv_accuracy", "balanced_accuracy": "cv_balanced_accuracy"}),
                    load(res / "baselines_ls", {"accuracy": "cv_accuracy", "balanced_accuracy": "cv_balanced_accuracy"})),
    }
    return data


def main():
    ap = argparse.ArgumentParser()
    ap.add_argument("--out", default=None)
    ap.add_argument("--kernel", action="store_true", help="Gaussian-kernel runs (results/kernel) instead of the linear ones")
    args = ap.parse_args()
    args.out = args.out or str(ROOT / "results" / ("paper_tables_kernel" if args.kernel else "paper_tables"))
    res = ROOT / "results"
    orc = {"accuracy": "oracle_accuracy", "balanced_accuracy": "oracle_balanced_accuracy"}
    cvf = {"accuracy": "cv_accuracy", "balanced_accuracy": "cv_balanced_accuracy"}
    if args.kernel:
        data = {"oracle": load(res / "kernel", orc), "cv": load(res / "kernel", cvf)}
    else:
        data = linear_data(res)
    out = Path(args.out)
    out.mkdir(parents=True, exist_ok=True)
    summary, pairwise, friedman, per_dataset = [], [], [], []
    md = ["# Paper tables", ""]
    for protocol, table in data.items():
        noises = sorted({nz for _, nz in table})
        for metric in ("accuracy", "balanced_accuracy"):
            md += [f"## {protocol}, {metric}", ""]
            for nz in noises:
                rows = {d: m for (d, n), m in table.items() if n == nz}
                models = [m for m in MAIN + EXTRA if any(m in r for r in rows.values())]
                main_models = [m for m in MAIN if m in models]
                full = sorted(d for d, r in rows.items() if all(m in r and metric in r[m] for m in main_models))
                if len(full) < 30 or OURS not in main_models:  # only complete noise levels
                    continue
                score = {m: np.array([rows[d][m][metric] for d in full]) for m in main_models}
                for m in models:  # extras: only on datasets where they exist
                    if m not in score and all(m in rows[d] and metric in rows[d][m] for d in full):
                        score[m] = np.array([rows[d][m][metric] for d in full])
                mat = np.column_stack([score[m] for m in main_models])
                ranks = np.vstack([stats.rankdata(-np.round(r, 6)) for r in mat])
                n, k = mat.shape
                chi2 = 12.0 * n / (k * (k + 1)) * (np.sum(ranks.mean(0) ** 2) - k * (k + 1) ** 2 / 4.0)
                ff = (n - 1) * chi2 / (n * (k - 1) - chi2) if n * (k - 1) > chi2 else float("inf")
                friedman.append({"protocol": protocol, "metric": metric, "noise": nz, "datasets": n, "models": k,
                                 "chi2": chi2, "p_chi2": float(stats.chi2.sf(chi2, k - 1)),
                                 "F": ff, "p_F": float(stats.f.sf(ff, k - 1, (k - 1) * (n - 1)))})
                md += [f"### noise {nz:g} ({n} datasets; Friedman chi2 = {chi2:.2f}, p = {stats.chi2.sf(chi2, k - 1):.2g})", "",
                       "| Model | Mean | Avg rank | Proposed − model | W-T-L | Wilcoxon p |", "|---|---|---|---|---|---|"]
                for m in score:
                    rank = float(ranks[:, main_models.index(m)].mean()) if m in main_models else float("nan")
                    summary.append({"protocol": protocol, "metric": metric, "noise": nz, "model": m, "datasets": n,
                                    "mean": float(score[m].mean()), "avg_rank": rank})
                    line = f"| {LABEL.get(m, m)} | {score[m].mean():.2f} | {rank:.2f} |"
                    if m != OURS:
                        diff = np.round(score[OURS] - score[m], 6)
                        w, t, l = int(np.sum(diff > 0)), int(np.sum(diff == 0)), int(np.sum(diff < 0))
                        p = float(stats.wilcoxon(diff).pvalue) if np.any(diff != 0) else 1.0
                        pairwise.append({"protocol": protocol, "metric": metric, "noise": nz, "model": m, "datasets": n,
                                         "mean_diff": float(diff.mean()), "win": w, "tie": t, "loss": l, "p_wilcoxon": p})
                        line += f" {diff.mean():+.2f} | {w}-{t}-{l} | {p:.3g} |"
                    else:
                        line += " | | |"
                    md.append(line)
                    for d, v in zip(full, score[m]):
                        per_dataset.append({"protocol": protocol, "metric": metric, "noise": nz, "dataset": d, "model": m, "score": float(v)})
                md.append("")
    for name, rows in (("summary", summary), ("pairwise", pairwise), ("friedman", friedman), ("per_dataset", per_dataset)):
        if rows:
            with open(out / f"{name}.csv", "w", newline="") as fh:
                w = csv.DictWriter(fh, fieldnames=list(rows[0]))
                w.writeheader()
                w.writerows(rows)
    (out / "summary.md").write_text("\n".join(md))
    print("wrote", out)


if __name__ == "__main__":
    main()
