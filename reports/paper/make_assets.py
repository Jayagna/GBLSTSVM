"""Tables (LaTeX) and figures (PDF) of the paper, straight from the result folders.
Run from anywhere: python reports/paper/make_assets.py  (after experiments/summarize_paper.py [--kernel])."""
import csv
import sys
from pathlib import Path

import matplotlib
matplotlib.use("Agg")
import matplotlib.pyplot as plt
import numpy as np

HERE = Path(__file__).resolve().parent
ROOT = HERE.parents[1]
sys.path.insert(0, str(ROOT))
sys.path.insert(0, str(ROOT / "experiments"))
from dataset_utils import discover_datasets, load_binary_dataset  # noqa: E402

T, F = HERE / "tables", HERE / "figures"
OURS = "LS-keep+gapvote"
NAME = {"SVM": "SVM", "TSVM": "TSVM", "GBSVM": "GBSVM", "LSTSVM": "LSTSVM", "GBLSTSVM": "GBLSTSVM",
        "LS-GBLSTSVM": "LS-GBLSTSVM", OURS: r"\textbf{RF-GBLSTSVM}"}
MAIN = list(NAME)
COL = {"SVM": "#7f7f7f", "TSVM": "#8c564b", "GBSVM": "#bcbd22", "LSTSVM": "#1f77b4", "GBLSTSVM": "#d62728",
       "LS-GBLSTSVM": "#ff7f0e", OURS: "#00897b"}


def read(p):
    with open(p) as fh:
        return list(csv.DictReader(fh))


def pct(n):
    return f"{round(float(n) * 100):d}\\%"


def pval(p):
    p = float(p)
    return "$<$0.001" if p < 0.001 else f"{p:.3f}"


def score_table(rows, protocol, metric, noises, fname, caption, label):
    get = lambda m, n: next(r for r in rows if r["protocol"] == protocol and r["metric"] == metric and float(r["noise"]) == n and r["model"] == m)
    lines = [r"\begin{table}[!t]", r"\centering", rf"\caption{{{caption}}}", rf"\label{{{label}}}", r"\small",
             r"\resizebox{\textwidth}{!}{%", r"\begin{tabular}{ll" + "c" * len(MAIN) + "}", r"\toprule",
             " & Noise & " + " & ".join(NAME[m] for m in MAIN) + r" \\", r"\midrule"]
    for key, title, fmt, best in (("mean", "Average " + ("ACC" if metric == "accuracy" else "BACC"), "{:.2f}", max), ("avg_rank", "Average rank", "{:.2f}", min)):
        for i, n in enumerate(noises):
            vals = [float(get(m, n)[key]) for m in MAIN]
            b = best(vals)
            cells = [(r"\textbf{" + fmt.format(v) + "}") if abs(v - b) < 5e-3 else fmt.format(v) for v in vals]
            lines.append((title if i == 0 else "") + f" & {pct(n)} & " + " & ".join(cells) + r" \\")
        lines.append(r"\midrule" if key == "mean" else r"\bottomrule")
    lines += [r"\end{tabular}}", r"\end{table}"]
    (T / fname).write_text("\n".join(lines) + "\n")


def pair_table(pairs, protocol, metric, noises, fname, caption, label):
    get = lambda m, n: next(r for r in pairs if r["protocol"] == protocol and r["metric"] == metric and float(r["noise"]) == n and r["model"] == m)
    others = [m for m in MAIN if m != OURS]
    lines = [r"\begin{table}[!t]", r"\centering", rf"\caption{{{caption}}}", rf"\label{{{label}}}", r"\footnotesize",
             r"\resizebox{\textwidth}{!}{%", r"\begin{tabular}{l" + "c" * len(noises) + "}", r"\toprule",
             "Baseline & " + " & ".join(pct(n) for n in noises) + r" \\", r"\midrule"]
    for m in others:
        cells = []
        for n in noises:
            r = get(m, n)
            cells.append(rf"\shortstack{{{float(r['mean_diff']):+.2f} [{r['win']}, {r['tie']}, {r['loss']}]\\({pval(r['p_wilcoxon'])})}}")
        lines.append(NAME[m] + " & " + " & ".join(cells) + r" \\[4pt]")
    lines += [r"\bottomrule", r"\end{tabular}}", r"\end{table}"]
    (T / fname).write_text("\n".join(lines) + "\n")


def friedman_table(lin, ker):
    lines = [r"\begin{table}[!t]", r"\centering",
             r"\caption{Friedman test over the seven models. $\chi^2_F$ has 6 degrees of freedom; $F_F$ is the Iman--Davenport statistic. Every $p$-value is below $10^{-6}$, so the hypothesis that all models perform equally is rejected in every setting.}",
             r"\label{tab:friedman}", r"\small", r"\begin{tabular}{lllccc}", r"\toprule",
             r"Kernel & Tuning & Score & Noise & $\chi^2_F$ & $F_F$ \\", r"\midrule"]
    for kname, rows, noises in (("Linear", lin, (0.0, 0.1, 0.2)), ("Gaussian", ker, (0.0, 0.1, 0.2))):
        for prot, pname in (("oracle", "Test-set"), ("cv", "CV")):
            for metric, mname in (("accuracy", "ACC"), ("balanced_accuracy", "BACC")):
                for n in noises:
                    r = next(x for x in rows if x["protocol"] == prot and x["metric"] == metric and float(x["noise"]) == n)
                    assert float(r["p_chi2"]) < 1e-6, r
                    lines.append(f"{kname} & {pname} & {mname} & {pct(n)} & {float(r['chi2']):.2f} & {float(r['F']):.2f} \\\\")
    lines += [r"\bottomrule", r"\end{tabular}", r"\end{table}"]
    (T / "friedman.tex").write_text("\n".join(lines) + "\n")


def ablation_table(rows):
    order = [("GBLSTSVM", "", "", ""), ("GB-keep", r"\checkmark", "", ""), ("Keep+gapvote", r"\checkmark", r"\checkmark", ""),
             ("LS-GBLSTSVM", "", "", r"\checkmark"), ("LS-keep", r"\checkmark", "", r"\checkmark"), (OURS, r"\checkmark", r"\checkmark", r"\checkmark")]
    noises = (0.0, 0.1, 0.2, 0.3)
    get = lambda p, m, n: float(next(r for r in rows if r["protocol"] == p and r["metric"] == "accuracy" and float(r["noise"]) == n and r["model"] == m)["mean"])
    lines = [r"\begin{table}[!t]", r"\centering",
             r"\caption{Ablation of the three components (linear kernel, average ACC in \% over 35 datasets). Keep: single-point balls are retained. Fuzzy: radius-aware membership. Reg.: regularisation term of LS-GBLSTSVM. The first row is GBLSTSVM, the fourth is LS-GBLSTSVM and the last is the proposed RF-GBLSTSVM.}",
             r"\label{tab:ablation}", r"\small", r"\resizebox{\textwidth}{!}{%", r"\begin{tabular}{ccc" + "c" * 8 + "}", r"\toprule",
             r" & & & \multicolumn{4}{c}{Test-set tuning} & \multicolumn{4}{c}{CV tuning} \\ \cmidrule(lr){4-7}\cmidrule(lr){8-11}",
             "Keep & Fuzzy & Reg. & " + " & ".join(pct(n) for n in noises) + " & " + " & ".join(pct(n) for n in noises) + r" \\", r"\midrule"]
    for m, a, b, c in order:
        lines.append(f"{a} & {b} & {c} & " + " & ".join(f"{get(p, m, n):.2f}" for p in ("oracle", "cv") for n in noises) + r" \\")
    lines += [r"\bottomrule", r"\end{tabular}}", r"\end{table}"]
    (T / "ablation.tex").write_text("\n".join(lines) + "\n")


def dataset_table(names):
    files = {p.stem: p for p in discover_datasets(str(ROOT / "Data"))}
    rows = []
    for d in names:
        _, meta = load_binary_dataset(files[d], minority_positive=True)
        rows.append((d.replace("_", r"\_"), meta["samples"], meta["features"], meta["negative_count"] / meta["positive_count"]))
    half = (len(rows) + 1) // 2
    lines = [r"\begin{table}[!t]", r"\centering",
             r"\caption{The 35 UCI and KEEL benchmark datasets. IR is the imbalance ratio (majority size divided by minority size).}",
             r"\label{tab:datasets}", r"\footnotesize", r"\resizebox{\textwidth}{!}{%", r"\begin{tabular}{lrrr@{\hskip 18pt}lrrr}", r"\toprule",
             r"Dataset & Samples & Features & IR & Dataset & Samples & Features & IR \\", r"\midrule"]
    for i in range(half):
        left = rows[i]
        right = rows[i + half] if i + half < len(rows) else ("", "", "", None)
        fmt = lambda r: f"{r[0]} & {r[1]} & {r[2]} & " + (f"{r[3]:.2f}" if r[3] is not None else "")
        lines.append(fmt(left) + " & " + fmt(right) + r" \\")
    lines += [r"\bottomrule", r"\end{tabular}}", r"\end{table}"]
    (T / "datasets.tex").write_text("\n".join(lines) + "\n")


def per_dataset_table(per, protocol, noise, fname, caption, label):
    rows = [r for r in per if r["protocol"] == protocol and r["metric"] == "accuracy" and float(r["noise"]) == noise and r["model"] in MAIN]
    names = sorted({r["dataset"] for r in rows})
    lines = [r"\begin{table}[!p]", r"\centering", rf"\caption{{{caption}}}", rf"\label{{{label}}}", r"\scriptsize",
             r"\resizebox{\textwidth}{!}{%", r"\begin{tabular}{l" + "c" * len(MAIN) + "}", r"\toprule", "Dataset & " + " & ".join(NAME[m] for m in MAIN) + r" \\", r"\midrule"]
    for d in names:
        vals = [float(next(r for r in rows if r["dataset"] == d and r["model"] == m)["score"]) for m in MAIN]
        b = max(vals)
        lines.append(d.replace("_", r"\_") + " & " + " & ".join((r"\textbf{%.2f}" % v) if v > b - 5e-3 else "%.2f" % v for v in vals) + r" \\")
    lines += [r"\bottomrule", r"\end{tabular}}", r"\end{table}"]
    (T / fname).write_text("\n".join(lines) + "\n")


def fig_noise_curves(rows, fname, panels):
    fig, axes = plt.subplots(1, len(panels), figsize=(4.2 * len(panels), 3.4))
    for ax, (prot, metric, title) in zip(np.atleast_1d(axes), panels):
        noises = sorted({float(r["noise"]) for r in rows if r["protocol"] == prot})
        for m in MAIN:
            y = [float(next(r for r in rows if r["protocol"] == prot and r["metric"] == metric and float(r["noise"]) == n and r["model"] == m)["mean"]) for n in noises]
            ax.plot([100 * n for n in noises], y, marker="o", ms=4, lw=2.4 if m == OURS else 1.3, color=COL[m],
                    label="RF-GBLSTSVM" if m == OURS else m, zorder=3 if m == OURS else 2)
        ax.set_title(title, fontsize=10)
        ax.set_xlabel("Label noise (%)")
        ax.set_ylabel("Average ACC (%)" if metric == "accuracy" else "Average BACC (%)")
        ax.grid(alpha=0.3)
    np.atleast_1d(axes)[0].legend(fontsize=7, ncol=2)
    fig.tight_layout()
    fig.savefig(F / fname)
    plt.close(fig)


def fig_diagnostics():
    d = {}
    for line in (ROOT / "results" / "noise_diagnostics" / "summary.md").read_text().splitlines():
        c = [x.strip() for x in line.strip("|").split("|")]
        if len(c) == 4 and c[0] not in ("measure", "---"):
            try:
                d[c[0]] = [float(x) for x in c[1:]]
            except ValueError:
                pass
    probe = {r["measure"]: [float(r["auc10"]), float(r["auc20"]), float(r["auc30"])] for r in read(ROOT / "reports" / "post_midsem" / "data" / "new_probe.csv")}
    x = np.arange(3)
    fig, (a, b) = plt.subplots(1, 2, figsize=(8.6, 3.3))
    w = 0.26
    for i, (k, lab, c) in enumerate((("deleted_flipped", "Mislabelled points", "#00897b"), ("deleted_clean", "Correct points", "#d62728"), ("deleted_clean_minority", "Correct minority points", "#ff7f0e"))):
        a.bar(x + (i - 1) * w, [100 * v for v in d[k]], w, label=lab, color=c)
    a.set_xticks(x, ["10%", "20%", "30%"])
    a.set_xlabel("Label noise")
    a.set_ylabel("Removed by deleting\nsingle-point balls (%)")
    a.legend(fontsize=7)
    a.set_title("(a) What the deletion step removes", fontsize=10)
    series = (("auc_T1", "Centre distance", "#7f7f7f", d), ("auc_T2", "Entropy", "#bcbd22", d), ("auc_T7", "Neighbour count", "#1f77b4", d), ("auc_gapvote", "Radius-aware (ours)", "#00897b", probe))
    w = 0.2
    for i, (k, lab, c, src) in enumerate(series):
        b.bar(x + (i - 1.5) * w, src[k], w, label=lab, color=c)
    b.axhline(0.5, color="k", lw=0.8, ls="--")
    b.set_xticks(x, ["10%", "20%", "30%"])
    b.set_xlabel("Label noise")
    b.set_ylabel("AUC of detecting\nmislabelled points")
    b.set_ylim(0.2, 1.0)
    b.legend(fontsize=7, ncol=2, loc="lower center")
    b.set_title("(b) How well a membership flags label noise", fontsize=10)
    fig.tight_layout()
    fig.savefig(F / "diagnostics.pdf")
    plt.close(fig)
    return d, probe


def fig_sensitivity():
    rows = read(ROOT / "results" / "sensitivity" / "summary.csv")
    ks = sorted({int(r["k"]) for r in rows})
    gs = sorted({float(r["gamma"]) for r in rows})
    fig, axes = plt.subplots(1, 2, figsize=(8.6, 3.2))
    out = {}
    for ax, nz in zip(axes, (0.0, 0.2)):
        M = np.array([[float(next(r for r in rows if float(r["noise"]) == nz and int(r["k"]) == k and float(r["gamma"]) == g)["balanced_accuracy"]) for g in gs] for k in ks])
        out[nz] = (M.min(), M.max())
        im = ax.imshow(M, cmap="YlGn", vmin=M.min() - 1.5, vmax=M.max() + 0.5, aspect="auto")
        for i in range(len(ks)):
            for j in range(len(gs)):
                ax.text(j, i, f"{M[i, j]:.1f}", ha="center", va="center", fontsize=8)
        ax.set_xticks(range(len(gs)), [f"{g:g}" for g in gs])
        ax.set_yticks(range(len(ks)), ks)
        ax.set_xlabel(r"sharpness $\gamma$")
        ax.set_ylabel("neighbours $k$")
        ax.set_title(f"{round(nz * 100)}% label noise (BACC, %)", fontsize=10)
        fig.colorbar(im, ax=ax, fraction=0.046)
    fig.tight_layout()
    fig.savefig(F / "sensitivity.pdf")
    plt.close(fig)
    return out


def fig_gap():
    fig, ax = plt.subplots(figsize=(4.6, 3.3))
    balls = [(0.0, 0.0, 0.55, "#00897b", "$GB_i$"), (-1.75, 0.9, 1.05, "#00897b", "$GB_1$"), (1.7, 1.0, 0.45, "#b88200", "$GB_2$"), (1.55, -1.25, 0.7, "#b88200", "$GB_3$"), (-1.3, -1.45, 0.3, "#00897b", "$GB_4$")]
    for x, y, r, c, lab in balls:
        ax.add_patch(plt.Circle((x, y), r, color=c, alpha=0.45, ec=c))
        ax.plot(x, y, ".", color="k", ms=3)
        ax.text(x, y + 0.12, lab, ha="center", fontsize=9)
    for x, y, r, c, lab in balls[1:]:
        d = np.hypot(x, y)
        ux, uy = x / d, y / d
        ax.plot([ux * 0.55, x - ux * r], [uy * 0.55, y - uy * r], color="#c0492f", lw=1.6)
        ax.plot([0, x], [0, y], color="k", lw=0.5, ls=":")
    ax.text(-0.95, 0.15, "$g_{i1}$", color="#c0492f", fontsize=9)
    ax.text(0.75, 0.75, "$g_{i2}$", color="#c0492f", fontsize=9)
    ax.set_xlim(-3.0, 2.5)
    ax.set_ylim(-2.2, 2.2)
    ax.set_aspect("equal")
    ax.axis("off")
    fig.tight_layout()
    fig.savefig(F / "gap.pdf")
    plt.close(fig)


def main():
    lin, linp, linf = (read(ROOT / "results" / "paper_tables" / f) for f in ("summary.csv", "pairwise.csv", "friedman.csv"))
    ker, kerp, kerf = (read(ROOT / "results" / "paper_tables_kernel" / f) for f in ("summary.csv", "pairwise.csv", "friedman.csv"))
    per = read(ROOT / "results" / "paper_tables" / "per_dataset.csv")
    NZ = (0.0, 0.05, 0.1, 0.15, 0.2, 0.3)
    NK = (0.0, 0.1, 0.2)
    score_table(lin, "oracle", "accuracy", NZ, "lin_oracle_acc.tex", r"Linear kernel, test-set tuning: average ACC (\%) and average rank over 35 datasets. Best value in each row in bold.", "tab:lin-oracle")
    score_table(lin, "cv", "accuracy", NZ, "lin_cv_acc.tex", r"Linear kernel, cross-validated tuning: average ACC (\%) and average rank over 35 datasets.", "tab:lin-cv-acc")
    score_table(lin, "cv", "balanced_accuracy", NZ, "lin_cv_bacc.tex", r"Linear kernel, cross-validated tuning: average balanced accuracy (BACC, \%) and average rank over 35 datasets.", "tab:lin-cv-bacc")
    score_table(ker, "oracle", "accuracy", NK, "ker_oracle_acc.tex", r"Gaussian kernel, test-set tuning: average ACC (\%) and average rank over 35 datasets.", "tab:ker-oracle")
    score_table(ker, "cv", "accuracy", NK, "ker_cv_acc.tex", r"Gaussian kernel, cross-validated tuning: average ACC (\%) and average rank over 35 datasets.", "tab:ker-cv-acc")
    score_table(ker, "cv", "balanced_accuracy", NK, "ker_cv_bacc.tex", r"Gaussian kernel, cross-validated tuning: average BACC (\%) and average rank over 35 datasets.", "tab:ker-cv-bacc")
    cap = r"RF-GBLSTSVM against each baseline, {}: mean difference in {} (percentage points), [win, tie, loss] over the 35 datasets and, in parentheses, the $p$-value of the Wilcoxon signed-rank test."
    pair_table(linp, "oracle", "accuracy", NZ, "lin_oracle_pair.tex", cap.format("linear kernel, test-set tuning", "ACC"), "tab:lin-oracle-pair")
    pair_table(linp, "cv", "accuracy", NZ, "lin_cv_acc_pair.tex", cap.format("linear kernel, cross-validated tuning", "ACC"), "tab:lin-cv-acc-pair")
    pair_table(linp, "cv", "balanced_accuracy", NZ, "lin_cv_bacc_pair.tex", cap.format("linear kernel, cross-validated tuning", "BACC"), "tab:lin-cv-bacc-pair")
    pair_table(kerp, "oracle", "accuracy", NK, "ker_oracle_pair.tex", cap.format("Gaussian kernel, test-set tuning", "ACC"), "tab:ker-oracle-pair")
    pair_table(kerp, "cv", "balanced_accuracy", NK, "ker_cv_bacc_pair.tex", cap.format("Gaussian kernel, cross-validated tuning", "BACC"), "tab:ker-cv-bacc-pair")
    friedman_table(linf, kerf)
    ablation_table(lin)
    dataset_table(sorted({r["dataset"] for r in per}))
    for prot, pname in (("oracle", "test-set tuning"), ("cv", "cross-validated tuning")):
        for nz in (0.0, 0.2):
            per_dataset_table(per, prot, nz, f"per_{prot}_{round(nz * 100)}.tex",
                              rf"ACC (\%) on every dataset, linear kernel, {pname}, {round(nz * 100)}\% label noise (mean over 10 splits).", f"tab:per-{prot}-{round(nz * 100)}")
    fig_noise_curves(lin, "noise_linear.pdf", (("oracle", "accuracy", "(a) Test-set tuning"), ("cv", "accuracy", "(b) Cross-validated tuning")))
    fig_noise_curves(ker, "noise_kernel.pdf", (("oracle", "accuracy", "(a) Test-set tuning"), ("cv", "balanced_accuracy", "(b) Cross-validated tuning")))
    d, probe = fig_diagnostics()
    sens = fig_sensitivity()
    fig_gap()
    print("deletion", {k: d[k] for k in ("deleted_flipped", "deleted_clean", "deleted_clean_minority")})
    print("auc", d["auc_T1"], d["auc_T2"], d["auc_T7"], probe["auc_gapvote"])
    print("sensitivity", sens)


if __name__ == "__main__":
    main()
