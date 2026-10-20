"""
Report on the GBFTSVM baseline run (results/gbftsvm_cv, from run_gbftsvm_cv.py).

Writes report.md (and the tables as CSV) to --out with:
  1. how often GBFTSVM's Pythagorean score differs from plain centre distance
     (it does only for impure balls), per ball builder and noise level
  2. CV-tuned vs test-set-tuned scores per method and noise level: how much tuning
     on the test set adds
  3. accuracies reported in the GBFTSVM paper (arXiv 2408.00699, Tables IV and V)
     next to ours on the datasets both studies use

Example:
  python experiments/gbftsvm_report.py results/gbftsvm_cv
"""
import argparse
import json
from pathlib import Path

import pandas as pd

# Paper accuracies (fractions) for GBTWSVM and GBFTSVM, by our dataset name.
# Paper names: Conn-bench-sonar-mines-rocks, Heart, Ionosphere, WDBC, Diabetes, German.numer.
# Its Liver-disorders (145 x 4) is not our bupa (345 x 6), so it is left out.
PAPER = {  # dataset: {noise: (GBTWSVM, GBFTSVM)}
    "sonar": {0.0: (0.93, 0.97), 0.1: (0.90, 0.90)},
    "heart-stat": {0.0: (0.91, 0.95), 0.1: (0.91, 0.93)},
    "iono": {0.0: (0.93, 0.97), 0.1: (0.93, 0.96)},
    "wdbc": {0.0: (0.96, 0.99), 0.1: (0.97, 0.98)},
    "pima": {0.0: (0.83, 0.84), 0.1: (0.83, 0.84)},
    "ger": {0.0: (0.81, 0.83), 0.1: (0.80, 0.82)},
}
ORDER = ["GBLSTSVM", "GBTWSVM", "GBFTSVM", "GBFTSVM-keep", "GBFTSVM-adp"]


def load(results_dir):
    rows = []
    for f in sorted(Path(results_dir).glob("*.json")):
        rec = json.loads(f.read_text())
        for rep in rec["repeats"]:
            for method, res in rep["methods"].items():
                rows.append({"dataset": rec["dataset"], "noise": rec["noise"], "repeat": rep["repeat"], "method": method,
                             **{key: res[key] for key in ("accuracy", "balanced_accuracy", "oracle_accuracy",
                                                          "oracle_balanced_accuracy", "share_impure_balls",
                                                          "mean_membership", "n_balls")}})
    df = pd.DataFrame(rows)
    df["balanced_accuracy"] *= 100
    df["oracle_balanced_accuracy"] *= 100
    return df


def md_table(df, fmt="{:.2f}"):
    cols = list(df.columns)
    lines = ["| " + " | ".join([df.index.name or ""] + [str(c) for c in cols]) + " |", "|---" * (len(cols) + 1) + "|"]
    for idx, row in df.iterrows():
        lines.append("| " + " | ".join([str(idx)] + [fmt.format(v) if isinstance(v, float) else str(v) for v in row]) + " |")
    return "\n".join(lines)


def main():
    ap = argparse.ArgumentParser(description=__doc__, formatter_class=argparse.RawDescriptionHelpFormatter)
    ap.add_argument("results_dir")
    ap.add_argument("--out", default=None, help="defaults to results_dir")
    args = ap.parse_args()
    out = Path(args.out or args.results_dir)
    df = load(args.results_dir)
    methods = [m for m in ORDER if m in df["method"].unique()]
    per_ds = df.groupby(["method", "noise", "dataset"]).mean(numeric_only=True)
    avg = per_ds.groupby(["method", "noise"]).mean()  # mean over splits, then over datasets
    n_ds, n_rep = df["dataset"].nunique(), df["repeat"].nunique()
    report = ["# GBFTSVM baseline: extra analyses", "",
              f"{n_ds} datasets, {n_rep} splits. Scores are means over splits, then over datasets.", ""]

    impure = avg["share_impure_balls"].unstack("noise").loc[[m for m in methods if m != "GBLSTSVM"]] * 100
    impure.columns = [f"{c:.0%} noise" for c in impure.columns]
    impure.index.name = "method (ball set)"
    impure.to_csv(out / "impure_balls.csv")
    report += ["## 1. Share of impure balls (%)", "",
               "GBFTSVM scores a pure ball by its centre distance alone; only impure balls get the "
               "Pythagorean closeness. This is the share of balls in the chosen model that are impure.", "",
               md_table(impure), ""]

    gap_rows = []
    for m in methods:
        for nz in sorted(df["noise"].unique()):
            a = avg.loc[(m, nz)]
            gap_rows.append({"method": m, "noise": f"{nz:.0%}", "CV BA": a["balanced_accuracy"],
                             "test-tuned BA": a["oracle_balanced_accuracy"],
                             "BA gain": a["oracle_balanced_accuracy"] - a["balanced_accuracy"],
                             "CV acc": a["accuracy"], "test-tuned acc": a["oracle_accuracy"],
                             "acc gain": a["oracle_accuracy"] - a["accuracy"]})
    gap = pd.DataFrame(gap_rows).set_index(["method", "noise"])
    gap.to_csv(out / "test_tuning_gain.csv")
    flat = gap.copy()
    flat.index = [f"{m}, {nz}" for m, nz in flat.index]
    flat.index.name = "method, noise"
    report += ["## 2. Tuning on the test set vs cross-validation", "",
               "CV: configuration chosen by 5-fold CV on the training part (our protocol). "
               "Test-tuned: the best test score over the whole grid, which is what choosing the "
               "configuration on the test set reports. BA = balanced accuracy, acc = accuracy (%).", "",
               md_table(flat), ""]

    paper_rows = []
    for ds, by_noise in PAPER.items():
        for nz, (tw, ft) in by_noise.items():
            if ("GBFTSVM", nz, ds) not in per_ds.index:
                continue
            row = {"dataset": ds, "noise": f"{nz:.0%}", "paper GBTWSVM": 100 * tw, "paper GBFTSVM": 100 * ft}
            for m in ("GBTWSVM", "GBFTSVM"):
                if (m, nz, ds) in per_ds.index:
                    row[f"{m} CV"] = per_ds.loc[(m, nz, ds), "accuracy"]
                    row[f"{m} test-tuned"] = per_ds.loc[(m, nz, ds), "oracle_accuracy"]
            paper_rows.append(row)
    if paper_rows:
        paper = pd.DataFrame(paper_rows).set_index(["dataset", "noise"])
        paper.to_csv(out / "paper_vs_ours.csv")
        means = paper.groupby(level="noise").mean()
        flat = paper.copy()
        flat.index = [f"{d}, {nz}" for d, nz in flat.index]
        flat.index.name = "dataset, noise"
        means.index = [f"mean, {nz}" for nz in means.index]
        table = pd.concat([flat, means])
        table.index.name = "dataset, noise"
        report += ["## 3. Accuracy reported in the GBFTSVM paper vs ours (%)", "",
                   "Paper: ten-fold CV with the best grid result reported (Tables IV and V). Ours: mean over "
                   f"{n_rep} stratified 70/30 splits, the paper's grid of C, k-means balls as in GBLSTSVM. "
                   "'CV' is the accuracy of the configuration CV chose for balanced accuracy; 'test-tuned' is the "
                   "best test accuracy over the grid. The paper's label-noise procedure is not described, so the "
                   "10% rows compare loosely.", "",
                   md_table(table, fmt="{:.1f}"), ""]
    (out / "report.md").write_text("\n".join(report))
    print("\n".join(report))


if __name__ == "__main__":
    main()
