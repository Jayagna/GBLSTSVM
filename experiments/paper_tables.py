"""
Paper-format tables and critical-difference diagrams from the CV results.

For each comparison (linear: results/fuzzy_cv_v4 + v5, kernel: results/kernel_cv_v1)
and each noise level it writes, to --out:
  <name>_noise<N>.csv / .tex   balanced accuracy (mean ± std over splits) per dataset,
                               with mean, average rank and Wilcoxon-Holm vs the reference
  <name>_cd_noise<N>.png/.pdf  critical-difference diagram (Friedman + Nemenyi, alpha 0.05)
  summary.md                   one block per comparison and noise level

Example:
  python experiments/paper_tables.py --out results/paper
"""
import argparse
from pathlib import Path

import matplotlib
matplotlib.use("Agg")
import matplotlib.pyplot as plt  # noqa: E402
import numpy as np  # noqa: E402
import pandas as pd  # noqa: E402
from scipy.stats import friedmanchisquare, rankdata, wilcoxon  # noqa: E402

from summarize_fuzzy import load  # noqa: E402

ROOT = Path(__file__).resolve().parents[1]
# Nemenyi two-tailed q values at alpha = 0.05 for k = 2..10 methods (Demsar, 2006)
Q05 = {2: 1.960, 3: 2.343, 4: 2.569, 5: 2.728, 6: 2.850, 7: 2.949, 8: 3.031, 9: 3.102, 10: 3.164}

# name -> (result dirs, [(method key, display name)], reference method key)
COMPARISONS = {
    "linear": (["fuzzy_cv_v4", "fuzzy_cv_v5", "fuzzy_cv_v6"], [
        ("GBLSTSVM", "GBLSTSVM"), ("GB-keep", "GB-keep"), ("T7-agree", "Keep+T7"), ("GB-adp", "ADPGBG"),
        ("LSTSVM", "LSTSVM"), ("FKNN-LSTSVM", "FKNN-LSTSVM")], "GBLSTSVM"),
    "kernel": (["kernel_cv_v1", "kernel_cv_v2"], [
        ("K-GBLSTSVM", "GBLSTSVM"), ("K-GB-keep", "GB-keep"), ("K-keep-T7", "Keep+T7"),
        ("K-LSTSVM", "LSTSVM"), ("K-FKNN-LSTSVM", "FKNN-LSTSVM")], "K-GBLSTSVM"),
}


def load_runs(dirs):
    # splits 0-4 come from the first run of each comparison, splits 5-9 from fuzzy_cv_v6 / kernel_cv_v2
    frames = [load(ROOT / "results" / d).assign(source=d) for d in dirs if (ROOT / "results" / d).is_dir()]
    df = pd.concat(frames, ignore_index=True)
    # a method present in several runs must agree exactly (same splits and seeds), then keep one copy
    key = ["noise", "dataset", "repeat", "method"]
    dup = df[df.duplicated(key, keep=False)]
    if len(dup):
        spread = dup.groupby(key)["balanced_accuracy"].agg(lambda v: v.max() - v.min())
        assert spread.max() < 1e-12, "runs disagree on a shared method"
    return df.drop_duplicates(key)


def holm(pvals):
    order = np.argsort(pvals)
    adj, running = np.empty(len(pvals)), 0.0
    for i, idx in enumerate(order):
        running = max(running, min(1.0, (len(pvals) - i) * pvals[idx]))
        adj[idx] = running
    return adj


def cliques(ranks, cd):
    """Maximal groups of methods (indices into ascending ranks) whose rank range is below cd."""
    groups = []
    for i in range(len(ranks)):
        j = i
        while j + 1 < len(ranks) and ranks[j + 1] - ranks[i] < cd:
            j += 1
        if j > i and not any(a <= i and j <= b for a, b in groups):
            groups.append((i, j))
    return groups


def cd_diagram(avg_rank, n_datasets, path, title):
    names = list(avg_rank.sort_values().index)
    ranks = avg_rank.sort_values().values
    k = len(names)
    cd = Q05[k] * np.sqrt(k * (k + 1) / (6.0 * n_datasets))
    half = (k + 1) // 2
    fig_h = 1.2 + 0.32 * max(half, k - half)
    fig, ax = plt.subplots(figsize=(6.4, fig_h))
    ax.set_xlim(0.4, k + 0.6)
    ax.set_ylim(-0.25 - 0.32 * max(half, k - half), 0.8)
    ax.axis("off")
    ax.hlines(0, 1, k, color="black", linewidth=0.9)
    for t in range(1, k + 1):
        ax.vlines(t, 0, 0.08, color="black", linewidth=0.9)
        ax.text(t, 0.13, str(t), ha="center", va="bottom", fontsize=9)
    ax.hlines(0.55, 1, 1 + cd, color="black", linewidth=1.4)
    ax.vlines([1, 1 + cd], 0.5, 0.6, color="black", linewidth=1.4)
    ax.text(1 + cd / 2, 0.62, f"CD = {cd:.2f}", ha="center", va="bottom", fontsize=8.5)
    for i, (name, r) in enumerate(zip(names, ranks)):
        left = i < half
        level = (i if left else k - 1 - i)
        y = -0.32 * (level + 1)
        x_text = 0.55 if left else k + 0.45
        ax.plot([r, r, x_text], [0, y, y], color="black", linewidth=0.8)
        ax.text(x_text + (-0.05 if left else 0.05), y, f"{name} ({r:.2f})", ha="right" if left else "left",
                va="center", fontsize=9)
    for g, (a, b) in enumerate(cliques(ranks, cd)):
        y = -0.08 - 0.07 * g
        ax.hlines(y, ranks[a] - 0.03, ranks[b] + 0.03, color="black", linewidth=3)
    ax.set_title(title, fontsize=10, pad=10)
    fig.tight_layout()
    for ext in ("png", "pdf"):
        fig.savefig(path.with_suffix(f".{ext}"), bbox_inches="tight", dpi=200)
    plt.close(fig)
    return cd


def latex_table(mean, std, ranks, names, caption):
    best = mean.max(axis=1)
    lines = [r"\begin{table}[t]", r"\centering\small", f"\\caption{{{caption}}}",
             r"\begin{tabular}{l" + "c" * len(names) + "}", r"\toprule",
             "Dataset & " + " & ".join(names) + r" \\", r"\midrule"]
    for ds in mean.index:
        cells = []
        for c in mean.columns:
            s = f"{mean.loc[ds, c]:.2f} $\\pm$ {std.loc[ds, c]:.2f}"
            cells.append(f"\\textbf{{{s}}}" if abs(mean.loc[ds, c] - best[ds]) < 1e-9 else s)
        lines.append(ds.replace("_", r"\_") + " & " + " & ".join(cells) + r" \\")
    lines += [r"\midrule", "Mean & " + " & ".join(f"{v:.2f}" for v in mean.mean().values) + r" \\",
              "Avg. rank & " + " & ".join(f"{v:.2f}" for v in ranks.values) + r" \\",
              r"\bottomrule", r"\end{tabular}", r"\end{table}"]
    return "\n".join(lines)


def main():
    ap = argparse.ArgumentParser(description=__doc__, formatter_class=argparse.RawDescriptionHelpFormatter)
    ap.add_argument("--out", default=str(ROOT / "results" / "paper"))
    args = ap.parse_args()
    out = Path(args.out)
    out.mkdir(parents=True, exist_ok=True)
    report = ["# Paper tables (balanced accuracy, %)", ""]
    for name, (dirs, methods, ref) in COMPARISONS.items():
        df = load_runs(dirs)
        keys, labels = [m for m, _ in methods], dict(methods)
        df = df[df["method"].isin(keys)]
        for noise in sorted(df["noise"].unique()):
            sub = df[df["noise"] == noise]
            g = sub.groupby(["dataset", "method"])["balanced_accuracy"]
            mean = (g.mean().unstack()[keys] * 100).dropna()
            std = (g.std().unstack()[keys] * 100).loc[mean.index]
            ranks = pd.Series(np.vstack([rankdata(-row) for row in mean.values]).mean(axis=0), index=keys)
            fried = friedmanchisquare(*[mean[c].values for c in keys]).pvalue
            others = [c for c in keys if c != ref]
            raw = np.array([wilcoxon(mean[c], mean[ref]).pvalue for c in others])
            adj = holm(raw)
            tag = f"{name}_noise{int(round(noise * 100))}"
            table = mean.round(2).astype(str) + " ± " + std.round(2).astype(str)
            table.rename(columns=labels).to_csv(out / f"{tag}.csv")
            caption = (f"Balanced accuracy (\\%, mean $\\pm$ std over {sub['repeat'].nunique()} splits), {name} models, "
                       f"{int(round(noise * 100))}\\% label noise. Friedman $p = {fried:.2g}$.")
            (out / f"{tag}.tex").write_text(latex_table(mean, std, ranks, [labels[c] for c in keys], caption))
            cd = cd_diagram(ranks.rename(index=labels), len(mean), out / f"{name}_cd_noise{int(round(noise * 100))}",
                            f"{name.capitalize()} models, {int(round(noise * 100))}% label noise")
            report += [f"## {name}, noise {noise:.0%} ({len(mean)} datasets, {sub['repeat'].nunique()} splits each)", "",
                       "| method | mean | avg rank | Wilcoxon p vs " + labels[ref] + " | Holm p | wins/losses |",
                       "|---|---|---|---|---|---|"]
            for c in keys:
                if c == ref:
                    report.append(f"| {labels[c]} | {mean[c].mean():.2f} | {ranks[c]:.2f} | – | – | – |")
                    continue
                i = others.index(c)
                d = mean[c] - mean[ref]
                report.append(f"| {labels[c]} | {mean[c].mean():.2f} | {ranks[c]:.2f} | {raw[i]:.3g} | {adj[i]:.3g} | "
                              f"{int((d > 1e-9).sum())}/{int((d < -1e-9).sum())} |")
            report += ["", f"Friedman p = {fried:.3g}; Nemenyi CD = {cd:.2f} (k = {len(keys)}, N = {len(mean)}).", ""]
    (out / "summary.md").write_text("\n".join(report))
    print("\n".join(report))


if __name__ == "__main__":
    main()
