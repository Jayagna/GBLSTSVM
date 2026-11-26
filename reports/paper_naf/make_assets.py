"""Tables (LaTeX) and figures (PDF) of the NAF-GBLSTSVM paper, straight from the result folders.

Run after
  python experiments/summarize_paper.py --ours T7-agree --main SVM TSVM GBSVM LSTSVM GBLSTSVM LS-GBLSTSVM T7-agree \
      --extra GB-keep FKNN-LSTSVM GBFTSVM --out results/paper_tables_naf
  (and the same with --root results/noise_<kind> --out results/paper_tables_naf_<kind> for kind in boundary, asymmetric)
  bash experiments/run_naf_diagnostics.sh
then: python reports/paper_naf/make_assets.py
"""
import csv
import sys
from pathlib import Path

import matplotlib
matplotlib.use("Agg")
import matplotlib.pyplot as plt
import numpy as np
import pandas as pd

HERE = Path(__file__).resolve().parent
ROOT = HERE.parents[1]
RES = ROOT / "results"
T, F = HERE / "tables", HERE / "figures"
OURS = "T7-agree"
NAME = {"SVM": "SVM", "TSVM": "TSVM", "GBSVM": "GBSVM", "LSTSVM": "LSTSVM", "GBLSTSVM": "GBLSTSVM",
        "LS-GBLSTSVM": "LS-GBLSTSVM", OURS: r"\textbf{NAF-GBLSTSVM}"}
PLAIN = {**NAME, OURS: "NAF-GBLSTSVM", "GB-keep": "GBLSTSVM, all balls kept", "FKNN-LSTSVM": "FKNN-LSTSVM"}
MAIN = list(NAME)
COL = {"SVM": "#7f7f7f", "TSVM": "#8c564b", "GBSVM": "#bcbd22", "LSTSVM": "#1f77b4", "GBLSTSVM": "#d62728",
       "LS-GBLSTSVM": "#ff7f0e", OURS: "#6a3d9a"}
KINDS = (("uniform", "Uniform"), ("boundary", "Boundary-targeted"), ("asymmetric", "Class-dependent"))
# hyperparameter settings searched per model (linear): see the Setup section
CONFIGS = {"SVM": 14, "TSVM": 242, "GBSVM": 70, "LSTSVM": 98, "GBLSTSVM": 490, "LS-GBLSTSVM": 490, OURS: 1960}


def read(p):
    with open(p) as fh:
        return list(csv.DictReader(fh))


def pct(n):
    return f"{round(float(n) * 100):d}\\%"


def pval(p):
    p = float(p)
    return "$<$0.001" if p < 0.001 else f"{p:.3f}"


def get(rows, prot, metric, n, m, key="mean"):
    r = next((r for r in rows if r["protocol"] == prot and r["metric"] == metric and abs(float(r["noise"]) - n) < 1e-9 and r["model"] == m), None)
    return float(r[key]) if r is not None else float("nan")


def write(name, lines):
    (T / name).write_text("\n".join(lines) + "\n")


def score_table(rows, protocol, metric, noises, fname, caption, label):
    lines = [r"\begin{table}[!t]", r"\centering", rf"\caption{{{caption}}}", rf"\label{{{label}}}", r"\small",
             r"\resizebox{\textwidth}{!}{%", r"\begin{tabular}{ll" + "c" * len(MAIN) + "}", r"\toprule",
             " & Noise & " + " & ".join(NAME[m] for m in MAIN) + r" \\", r"\midrule"]
    for key, title, best in (("mean", "Average " + ("ACC" if metric == "accuracy" else "BACC"), max), ("avg_rank", "Average rank", min)):
        for i, n in enumerate(noises):
            vals = [get(rows, protocol, metric, n, m, key) for m in MAIN]
            b = best(vals)
            cells = [(r"\textbf{%.2f}" % v) if abs(v - b) < 5e-3 else "%.2f" % v for v in vals]
            lines.append((title if i == 0 else "") + f" & {pct(n)} & " + " & ".join(cells) + r" \\")
        lines.append(r"\midrule" if key == "mean" else r"\bottomrule")
    lines += [r"\end{tabular}}", r"\end{table}"]
    write(fname, lines)


def pair_table(pairs, protocol, metric, noises, fname, caption, label, others=None):
    others = others or [m for m in MAIN if m != OURS]
    lines = [r"\begin{table}[!t]", r"\centering", rf"\caption{{{caption}}}", rf"\label{{{label}}}", r"\footnotesize",
             r"\resizebox{\textwidth}{!}{%", r"\begin{tabular}{l" + "c" * len(noises) + "}", r"\toprule",
             "Compared model & " + " & ".join(pct(n) for n in noises) + r" \\", r"\midrule"]
    for m in others:
        cells = []
        for n in noises:
            r = next((r for r in pairs if r["protocol"] == protocol and r["metric"] == metric and abs(float(r["noise"]) - n) < 1e-9 and r["model"] == m), None)
            cells.append("--" if r is None else rf"\shortstack{{{float(r['mean_diff']):+.2f} [{r['win']}, {r['tie']}, {r['loss']}]\\({pval(r['p_wilcoxon'])})}}")
        lines.append(PLAIN[m] + " & " + " & ".join(cells) + r" \\[4pt]")
    lines += [r"\bottomrule", r"\end{tabular}}", r"\end{table}"]
    write(fname, lines)


def protocol_table(rows):
    noises = (0.0, 0.1, 0.2, 0.3)
    lines = [r"\begin{table}[!t]", r"\centering",
             r"\caption{How much each model gains when its hyperparameters are chosen on the test set instead of by cross-validation on the training part (linear kernel, uniform noise, 35 datasets). Gap: average test-tuned ACC minus average CV-tuned ACC, in points. Rank: average rank among the seven models under test-set tuning $\to$ under CV tuning. Settings: number of hyperparameter combinations searched per split.}",
             r"\label{tab:protocol}", r"\small", r"\resizebox{\textwidth}{!}{%", r"\begin{tabular}{lr" + "cc" * len(noises) + "}", r"\toprule",
             " & & " + " & ".join(rf"\multicolumn{{2}}{{c}}{{{pct(n)} noise}}" for n in noises) + r" \\",
             " ".join(rf"\cmidrule(lr){{{3 + 2 * i}-{4 + 2 * i}}}" for i in range(len(noises))),
             "Model & Settings & " + " & ".join("Gap & Rank" for _ in noises) + r" \\", r"\midrule"]
    for m in MAIN:
        cells = []
        for n in noises:
            gap = get(rows, "oracle", "accuracy", n, m) - get(rows, "cv", "accuracy", n, m)
            cells += [f"{gap:.1f}", f"{get(rows, 'oracle', 'accuracy', n, m, 'avg_rank'):.1f} $\\to$ {get(rows, 'cv', 'accuracy', n, m, 'avg_rank'):.1f}"]
        lines.append(f"{NAME[m]} & {CONFIGS[m]} & " + " & ".join(cells) + r" \\")
    lines += [r"\bottomrule", r"\end{tabular}}", r"\end{table}"]
    write("protocol.tex", lines)


def ablation_table(rows):
    order = [("GBLSTSVM", "balls, single-sample balls deleted"), ("GB-keep", "balls, all kept"), (OURS, "balls, all kept, NAF membership"),
             ("LSTSVM", "samples"), ("FKNN-LSTSVM", "samples, fuzzy $k$-NN membership")]
    noises = (0.0, 0.1, 0.2, 0.3)
    lines = [r"\begin{table}[!t]", r"\centering",
             r"\caption{Where the gain of NAF-GBLSTSVM comes from (linear kernel, uniform noise, average ACC in \% over 35 datasets). The last two rows train on the samples instead of the balls; FKNN-LSTSVM gives every sample the neighbour-agreement membership of \eqref{eq:agree} computed among samples, i.e.\ NAF-GBLSTSVM with every sample as its own ball.}",
             r"\label{tab:ablation}", r"\small", r"\resizebox{\textwidth}{!}{%", r"\begin{tabular}{ll" + "c" * 8 + "}", r"\toprule",
             r" & & \multicolumn{4}{c}{Test-set tuning} & \multicolumn{4}{c}{CV tuning} \\ \cmidrule(lr){3-6}\cmidrule(lr){7-10}",
             "Model & Trained on & " + " & ".join(pct(n) for n in noises) + " & " + " & ".join(pct(n) for n in noises) + r" \\", r"\midrule"]
    for m, what in order:
        vals = [get(rows, p, "accuracy", n, m) for p in ("oracle", "cv") for n in noises]
        lines.append(f"{PLAIN[m]} & {what} & " + " & ".join("--" if np.isnan(v) else f"{v:.2f}" for v in vals) + r" \\")
    lines += [r"\bottomrule", r"\end{tabular}}", r"\end{table}"]
    write("ablation.tex", lines)


def noise_type_table(tabs):
    noises = (0.1, 0.2, 0.3)
    lines = [r"\begin{table}[!t]", r"\centering",
             r"\caption{Boundary-targeted and class-dependent label noise (linear kernel, 35 datasets, 5 splits): average ACC (\%) with the average rank in parentheses. Best value per row in bold.}",
             r"\label{tab:noisetypes}", r"\scriptsize", r"\resizebox{\textwidth}{!}{%", r"\begin{tabular}{lll" + "c" * len(MAIN) + "}", r"\toprule",
             "Noise & Tuning & Level & " + " & ".join(NAME[m] for m in MAIN) + r" \\", r"\midrule"]
    for kind, kname in KINDS[1:]:
        rows = tabs.get(kind)
        if not rows:
            continue
        for prot, pname in (("oracle", "Test set"), ("cv", "CV")):
            for i, n in enumerate(noises):
                vals = [get(rows, prot, "accuracy", n, m) for m in MAIN]
                rk = [get(rows, prot, "accuracy", n, m, "avg_rank") for m in MAIN]
                if all(np.isnan(vals)):
                    continue
                b = np.nanmax(vals)
                cells = [("\\textbf{%.2f}" % v if abs(v - b) < 5e-3 else "%.2f" % v) + f" ({r:.1f})" for v, r in zip(vals, rk)]
                lines.append((kname if prot == "oracle" and i == 0 else "") + " & " + (pname if i == 0 else "") + f" & {pct(n)} & " + " & ".join(cells) + r" \\")
            lines.append(r"\midrule" if not (kind == "asymmetric" and prot == "cv") else "")
    lines += [r"\bottomrule", r"\end{tabular}}", r"\end{table}"]
    write("noisetypes.tex", lines)


def load_diag():
    out = {}
    for kind, _ in KINDS:
        p = RES / "naf_diagnostics" / kind / "diagnostics.csv"
        if p.exists():
            df = pd.read_csv(p)
            cols = [c for c in df.columns if c.startswith(("deleted_", "auc_", "kept_"))]
            out[kind] = df.groupby(["noise", "dataset"])[cols].mean().groupby("noise").mean()
    return out


def deletion_table(diag):
    cols = [("deleted_flipped", "Mislabelled"), ("deleted_clean", "Correct"), ("deleted_clean_boundary", "Correct, boundary"),
            ("deleted_clean_interior", "Correct, interior"), ("deleted_clean_minority", "Correct, minority"), ("kept_after_delete_flipped_share", "Noise left")]
    lines = [r"\begin{table}[!t]", r"\centering",
             r"\caption{What GBLSTSVM's deletion of single-sample balls removes (35 datasets, 5 splits, $k\in\{2,4,6\}$ clusters per split): share (\%) of each group of training samples that ends up in a single-sample ball. Boundary: the quarter of each class closest to the other class (by true labels); interior: the rest. Noise left: share of mislabelled samples among the samples that survive the deletion, to be compared with the noise level.}",
             r"\label{tab:deletion}", r"\small", r"\resizebox{\textwidth}{!}{%", r"\begin{tabular}{ll" + "c" * len(cols) + "}", r"\toprule",
             "Noise model & Level & " + " & ".join(c[1] for c in cols) + r" \\", r"\midrule"]
    for kind, kname in KINDS:
        if kind not in diag:
            continue
        d = diag[kind]
        for i, n in enumerate(d.index):
            cells = ["--" if np.isnan(d.loc[n, c]) else f"{100 * d.loc[n, c]:.1f}" for c, _ in cols]
            lines.append((kname if i == 0 else "") + f" & {pct(n)} & " + " & ".join(cells) + r" \\")
        lines.append(r"\midrule" if kind != "asymmetric" else "")
    lines += [r"\bottomrule", r"\end{tabular}}", r"\end{table}"]
    write("deletion.tex", lines)


def detection_table(diag):
    cols = [("auc_singleton", "Deletion"), ("auc_T1", "Centre dist."), ("auc_T2", "Entropy"), ("auc_T4", "Overlap"),
            ("auc_T5", "Density"), ("auc_T7", r"\textbf{NAF}"), ("auc_point_knn", "Fuzzy $k$-NN")]
    lines = [r"\begin{table}[!t]", r"\centering",
             r"\caption{How well each ball membership flags mislabelled training samples: area under the ROC curve when a low membership is read as ``mislabelled'' (0.5 = random). All balls are kept and each sample inherits the membership of its ball. Deletion: the 0/1 score ``in a single-sample ball''. Fuzzy $k$-NN: the same agreement computed among samples ($k=10$). 35 datasets, 5 splits.}",
             r"\label{tab:detection}", r"\small", r"\resizebox{\textwidth}{!}{%", r"\begin{tabular}{ll" + "c" * len(cols) + "}", r"\toprule",
             "Noise model & Level & " + " & ".join(c[1] for c in cols) + r" \\", r"\midrule"]
    for kind, kname in KINDS:
        if kind not in diag:
            continue
        d = diag[kind]
        idx = [n for n in d.index if n > 0]
        for i, n in enumerate(idx):
            vals = [d.loc[n, c] for c, _ in cols]
            b = max(vals[:-1])
            cells = [("\\textbf{%.3f}" % v) if abs(v - b) < 5e-4 and j < len(cols) - 1 else "%.3f" % v for j, v in enumerate(vals)]
            lines.append((kname if i == 0 else "") + f" & {pct(n)} & " + " & ".join(cells) + r" \\")
        lines.append(r"\midrule" if kind != "asymmetric" else "")
    lines += [r"\bottomrule", r"\end{tabular}}", r"\end{table}"]
    write("detection.tex", lines)


def fig_deletion(diag):
    kinds = [k for k in KINDS if k[0] in diag]
    fig, axes = plt.subplots(1, len(kinds), figsize=(4.0 * len(kinds), 3.3), sharey=True)
    for ax, (kind, kname) in zip(np.atleast_1d(axes), kinds):
        d = diag[kind]
        idx = [n for n in d.index if n > 0]
        x = np.arange(len(idx))
        series = (("deleted_flipped", "Mislabelled", "#6a3d9a"), ("deleted_clean_boundary", "Correct, boundary", "#d62728"),
                  ("deleted_clean_interior", "Correct, interior", "#ff9896"), ("deleted_clean_minority", "Correct, minority", "#ff7f0e"))
        w = 0.2
        for i, (c, lab, col) in enumerate(series):
            ax.bar(x + (i - 1.5) * w, [100 * d.loc[n, c] for n in idx], w, label=lab, color=col)
        ax.set_xticks(x, [f"{round(100 * n)}%" for n in idx])
        ax.set_title(f"{kname} noise", fontsize=10)
        ax.set_xlabel("Label noise")
        ax.grid(axis="y", alpha=0.3)
    np.atleast_1d(axes)[0].set_ylabel("Removed by deleting\nsingle-sample balls (%)")
    np.atleast_1d(axes)[0].legend(fontsize=7)
    fig.tight_layout()
    fig.savefig(F / "deletion.pdf")
    plt.close(fig)


def fig_protocol(rows):
    fig, axes = plt.subplots(1, 2, figsize=(8.4, 3.6))
    for ax, n in zip(axes, (0.0, 0.2)):
        for m in MAIN:
            a, b = get(rows, "oracle", "accuracy", n, m, "avg_rank"), get(rows, "cv", "accuracy", n, m, "avg_rank")
            lw = 2.6 if m == OURS else 1.4
            ax.plot([0, 1], [a, b], marker="o", color=COL[m], lw=lw)
            ax.text(-0.04, a, PLAIN[m], ha="right", va="center", fontsize=7, color=COL[m])
            ax.text(1.04, b, PLAIN[m], ha="left", va="center", fontsize=7, color=COL[m])
        ax.set_xlim(-0.75, 1.75)
        ax.invert_yaxis()
        ax.set_xticks([0, 1], ["Test-set\ntuning", "CV\ntuning"])
        ax.set_ylabel("Average rank (ACC, 1 = best)")
        ax.set_title(f"{round(100 * n)}% uniform label noise", fontsize=10)
        ax.grid(axis="y", alpha=0.3)
    fig.tight_layout()
    fig.savefig(F / "protocol.pdf")
    plt.close(fig)


def fig_noise_curves(rows):
    fig, axes = plt.subplots(1, 3, figsize=(12.0, 3.4))
    for ax, (prot, metric, title) in zip(axes, (("oracle", "accuracy", "(a) Test-set tuning, ACC"), ("cv", "accuracy", "(b) CV tuning, ACC"), ("cv", "balanced_accuracy", "(c) CV tuning, BACC"))):
        noises = sorted({float(r["noise"]) for r in rows if r["protocol"] == prot})
        for m in MAIN:
            ax.plot([100 * n for n in noises], [get(rows, prot, metric, n, m) for n in noises], marker="o", ms=4,
                    lw=2.6 if m == OURS else 1.3, color=COL[m], label=PLAIN[m], zorder=3 if m == OURS else 2)
        ax.set_title(title, fontsize=10)
        ax.set_xlabel("Label noise (%)")
        ax.grid(alpha=0.3)
    axes[0].set_ylabel("Average score (%)")
    axes[0].legend(fontsize=7, ncol=2)
    fig.tight_layout()
    fig.savefig(F / "noise_uniform.pdf")
    plt.close(fig)


def friedman_table(fr):
    lines = [r"\begin{table}[!t]", r"\centering",
             r"\caption{Friedman test over the seven models (35 datasets). $\chi^2_F$ has 6 degrees of freedom; $F_F$ is the Iman--Davenport statistic.}",
             r"\label{tab:friedman}", r"\small", r"\begin{tabular}{lllccc}", r"\toprule",
             r"Noise model & Tuning & Level & $\chi^2_F$ & $F_F$ & $p$ \\", r"\midrule"]
    for kind, kname in KINDS:
        rows = fr.get(kind)
        if not rows:
            continue
        for prot, pname in (("oracle", "Test set"), ("cv", "CV")):
            for n in ((0.0, 0.1, 0.2, 0.3) if kind == "uniform" else (0.1, 0.2, 0.3)):
                r = next((x for x in rows if x["protocol"] == prot and x["metric"] == "accuracy" and abs(float(x["noise"]) - n) < 1e-9), None)
                if r:
                    lines.append(f"{kname} & {pname} & {pct(n)} & {float(r['chi2']):.2f} & {float(r['F']):.2f} & {pval(r['p_F'])} \\\\")
    lines += [r"\bottomrule", r"\end{tabular}", r"\end{table}"]
    write("friedman.tex", lines)


def per_dataset_table(per, protocol, noise, fname, caption, label):
    rows = [r for r in per if r["protocol"] == protocol and r["metric"] == "accuracy" and abs(float(r["noise"]) - noise) < 1e-9 and r["model"] in MAIN]
    names = sorted({r["dataset"] for r in rows})
    lines = [r"\begin{table}[!p]", r"\centering", rf"\caption{{{caption}}}", rf"\label{{{label}}}", r"\scriptsize",
             r"\resizebox{\textwidth}{!}{%", r"\begin{tabular}{l" + "c" * len(MAIN) + "}", r"\toprule", "Dataset & " + " & ".join(NAME[m] for m in MAIN) + r" \\", r"\midrule"]
    for d in names:
        vals = [float(next(r for r in rows if r["dataset"] == d and r["model"] == m)["score"]) for m in MAIN]
        b = max(vals)
        lines.append(d.replace("_", r"\_") + " & " + " & ".join((r"\textbf{%.2f}" % v) if v > b - 5e-3 else "%.2f" % v for v in vals) + r" \\")
    lines += [r"\bottomrule", r"\end{tabular}}", r"\end{table}"]
    write(fname, lines)


def fig_sensitivity():
    rows = read(RES / "sensitivity_naf" / "summary.csv")
    ks = sorted({int(r["k"]) for r in rows})
    gs = sorted({float(r["gamma"]) for r in rows})
    fig, axes = plt.subplots(1, 2, figsize=(8.6, 3.2))
    for ax, nz in zip(axes, (0.0, 0.2)):
        M = np.array([[float(next(r for r in rows if float(r["noise"]) == nz and int(r["k"]) == k and float(r["gamma"]) == g)["balanced_accuracy"]) for g in gs] for k in ks])
        print("sensitivity", nz, M.min().round(2), M.max().round(2))
        im = ax.imshow(M, cmap="Purples", vmin=M.min() - 1.5, vmax=M.max() + 0.5, aspect="auto")
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


def main():
    T.mkdir(exist_ok=True)
    F.mkdir(exist_ok=True)
    base = RES / "paper_tables_naf"
    uni, unip, unif, per = (read(base / f) for f in ("summary.csv", "pairwise.csv", "friedman.csv", "per_dataset.csv"))
    tabs, fr = {"uniform": uni}, {"uniform": unif}
    for kind in ("boundary", "asymmetric"):
        d = RES / f"paper_tables_naf_{kind}"
        if (d / "summary.csv").exists():
            tabs[kind], fr[kind] = read(d / "summary.csv"), read(d / "friedman.csv")
    NZ = (0.0, 0.05, 0.1, 0.15, 0.2, 0.3)
    score_table(uni, "oracle", "accuracy", NZ, "uni_oracle_acc.tex", r"Uniform label noise, test-set tuning: average ACC (\%) and average rank over 35 datasets (10 splits). Best value in each row in bold.", "tab:uni-oracle")
    score_table(uni, "cv", "accuracy", NZ, "uni_cv_acc.tex", r"Uniform label noise, cross-validated tuning: average ACC (\%) and average rank over 35 datasets (10 splits).", "tab:uni-cv-acc")
    score_table(uni, "cv", "balanced_accuracy", NZ, "uni_cv_bacc.tex", r"Uniform label noise, cross-validated tuning: average balanced accuracy (BACC, \%) and average rank over 35 datasets.", "tab:uni-cv-bacc")
    cap = r"NAF-GBLSTSVM against each other model, uniform noise, {}: mean difference in {} (points; positive = NAF-GBLSTSVM better), [win, tie, loss] over the 35 datasets and, in parentheses, the $p$-value of the Wilcoxon signed-rank test."
    others = [m for m in MAIN if m != OURS] + ["GB-keep", "FKNN-LSTSVM"]
    pair_table(unip, "oracle", "accuracy", NZ, "uni_oracle_pair.tex", cap.format("test-set tuning", "ACC"), "tab:uni-oracle-pair", others)
    pair_table(unip, "cv", "accuracy", NZ, "uni_cv_acc_pair.tex", cap.format("cross-validated tuning", "ACC"), "tab:uni-cv-acc-pair", others)
    pair_table(unip, "cv", "balanced_accuracy", NZ, "uni_cv_bacc_pair.tex", cap.format("cross-validated tuning", "BACC"), "tab:uni-cv-bacc-pair", others)
    protocol_table(uni)
    ablation_table(uni)
    noise_type_table(tabs)
    friedman_table(fr)
    for prot, pname in (("oracle", "test-set tuning"), ("cv", "cross-validated tuning")):
        for nz in (0.0, 0.2):
            per_dataset_table(per, prot, nz, f"per_{prot}_{round(nz * 100)}.tex",
                              rf"ACC (\%) on every dataset, uniform noise, {pname}, {round(nz * 100)}\% label noise (mean over 10 splits).", f"tab:per-{prot}-{round(nz * 100)}")
    for kind in ("boundary", "asymmetric"):
        if kind in tabs:
            p = read(RES / f"paper_tables_naf_{kind}" / "pairwise.csv")
            for prot, pname in (("oracle", "test-set tuning"), ("cv", "cross-validated tuning")):
                pair_table(p, prot, "accuracy", (0.1, 0.2, 0.3), f"{kind}_{prot}_pair.tex",
                           rf"NAF-GBLSTSVM against each other model, {'boundary-targeted' if kind == 'boundary' else 'class-dependent'} noise, {pname}: mean difference in ACC, [win, tie, loss] and Wilcoxon $p$-value over 35 datasets.",
                           f"tab:{kind}-{prot}-pair", [m for m in MAIN if m != OURS] + ["GB-keep", "FKNN-LSTSVM"])
    kdir = RES / "paper_tables_naf_kernel"
    if (kdir / "summary.csv").exists():
        ker = read(kdir / "summary.csv")
        if any(r["model"] == OURS for r in ker):
            NK = (0.0, 0.1, 0.2)
            score_table(ker, "oracle", "accuracy", NK, "ker_oracle_acc.tex", r"Gaussian kernel, test-set tuning: average ACC (\%) and average rank over 35 datasets (5 splits).", "tab:ker-oracle")
            score_table(ker, "cv", "accuracy", NK, "ker_cv_acc.tex", r"Gaussian kernel, cross-validated tuning: average ACC (\%) and average rank over 35 datasets (5 splits).", "tab:ker-cv-acc")
            score_table(ker, "cv", "balanced_accuracy", NK, "ker_cv_bacc.tex", r"Gaussian kernel, cross-validated tuning: average BACC (\%) and average rank over 35 datasets (5 splits).", "tab:ker-cv-bacc")
    if (RES / "sensitivity_naf" / "summary.csv").exists():
        fig_sensitivity()
    diag = load_diag()
    if diag:
        deletion_table(diag)
        detection_table(diag)
        fig_deletion(diag)
        for k, d in diag.items():
            print(k, "\n", (100 * d).round(1).T.to_string())
    fig_protocol(uni)
    fig_noise_curves(uni)
    export_deck_data(tabs, diag)


def export_deck_data(tabs, diag):
    """CSV copies for the compre deck (reports/compre/data/naf_*.csv)."""
    out = ROOT / "reports" / "compre" / "data"
    import shutil
    shutil.copy(RES / "paper_tables_naf" / "summary.csv", out / "naf_summary.csv")
    shutil.copy(RES / "paper_tables_naf" / "pairwise.csv", out / "naf_pairwise.csv")
    for kind in ("boundary", "asymmetric"):
        if kind in tabs:
            shutil.copy(RES / f"paper_tables_naf_{kind}" / "summary.csv", out / f"naf_{kind}_summary.csv")
            shutil.copy(RES / f"paper_tables_naf_{kind}" / "pairwise.csv", out / f"naf_{kind}_pairwise.csv")
    if diag:
        rows = []
        for kind, d in diag.items():
            for n, r in d.iterrows():
                rows.append({"kind": kind, "noise": n, **{c: round(float(v), 4) for c, v in r.items()}})
        pd.DataFrame(rows).to_csv(out / "naf_diagnostics.csv", index=False)


if __name__ == "__main__":
    main()
