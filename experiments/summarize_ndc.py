"""
NDC table and figure for the paper from results/ndc (written by run_ndc.py).
Writes results/ndc/summary.csv, reports/paper/tables/ndc.tex and reports/paper/figures/ndc_time.pdf.
"""
import csv
import json
from pathlib import Path

import matplotlib
matplotlib.use("Agg")
import matplotlib.pyplot as plt  # noqa: E402

ROOT = Path(__file__).resolve().parents[1]
RES = ROOT / "results" / "ndc"
MODELS = ["SVM", "TSVM", "GBSVM", "LSTSVM", "GBLSTSVM", "LS-GBLSTSVM", "RF-GBLSTSVM"]
SIZES = ["10k", "50k", "100k", "300k", "500k", "1m"]


def load():
    out = {}
    for f in RES.glob("*.json"):
        r = json.loads(f.read_text())
        out[(r["dataset"].split("-")[1], float(r["noise"]))] = r
    return out


def cell(v):
    if v is None:
        return "--", "--"
    st = v.get("status", "")
    if st == "ok":
        t = v["train_sec"]
        return f"{v['accuracy']:.2f}", (f"{t:.1f}" if t < 100 else f"{t:,.0f}")
    if st.startswith("not run"):
        return "a", ""
    if st == "timeout":
        return "b", ""
    return "c", ""


def main():
    data = load()
    rows = []
    for (size, nz), r in sorted(data.items(), key=lambda x: (SIZES.index(x[0][0]), x[0][1])):
        for proto in ("fixed", "cv"):
            for m in MODELS:
                v = r.get(proto, {}).get(m, {})
                rows.append({"size": size, "noise": nz, "protocol": proto, "model": m, "status": v.get("status"),
                             "accuracy": v.get("accuracy"), "balanced_accuracy": v.get("balanced_accuracy"),
                             "train_sec": v.get("train_sec"), "balls": v.get("balls"),
                             "membership_sec": v.get("membership_sec"), "tuning_sec": v.get("tuning_sec")})
    with open(RES / "summary.csv", "w", newline="") as fh:
        w = csv.DictWriter(fh, fieldnames=list(rows[0]))
        w.writeheader()
        w.writerows(rows)
    # LaTeX: one block per (protocol); rows = size x noise, two lines (ACC, time)
    name = {m: (r"\textbf{RF-GBLSTSVM}" if m == "RF-GBLSTSVM" else m) for m in MODELS}
    L = [r"\begin{table}[!t]", r"\centering",
         r"\caption{NDC datasets (32 features, 70\% of the samples for training), linear kernel: test ACC (\%, upper line) and training time in seconds (lower line, one CPU thread; for granular-ball models it includes ball generation and, for RF-GBLSTSVM, the membership). Settings chosen by five-fold CV on a random subsample of 10{,}000 training samples. a: not run, the solver needs the $n\times n$ kernel or dual matrix. b: did not finish within one hour.}",
         r"\label{tab:ndc}", r"\resizebox{\textwidth}{!}{%", r"\begin{tabular}{ll" + "c" * len(MODELS) + "}", r"\toprule",
         "Dataset & Noise & " + " & ".join(name[m] for m in MODELS) + r" \\", r"\midrule"]
    for size in SIZES:
        for nz in (0.0, 0.2):
            r = data.get((size, nz))
            if r is None:
                continue
            cells = [cell(r.get("cv", {}).get(m)) for m in MODELS]
            ok = [float(c[0]) for c in cells if c[0][0].isdigit()]
            best = max(ok) if ok else None
            accs = [(rf"\textbf{{{a}}}" if a[0].isdigit() and float(a) == best else a) for a, _ in cells]
            L.append(f"NDC-{size} & {round(nz * 100)}\\% & " + " & ".join(accs) + r" \\")
            L.append(" & & " + " & ".join(t for _, t in cells) + r" \\[2pt]")
    L += [r"\bottomrule", r"\end{tabular}}", r"\end{table}"]
    (ROOT / "reports" / "paper" / "tables" / "ndc.tex").write_text("\n".join(L) + "\n")
    # figure: training time vs size, both noise levels, cv protocol
    fig, axes = plt.subplots(1, 2, figsize=(8.6, 3.3), sharey=True)
    colours = {"SVM": "#7f7f7f", "GBSVM": "#bcbd22", "LSTSVM": "#1f77b4", "GBLSTSVM": "#ff7f0e",
               "LS-GBLSTSVM": "#d62728", "RF-GBLSTSVM": "#00897b", "TSVM": "#9467bd"}
    n = {"10k": 1e4, "50k": 5e4, "100k": 1e5, "300k": 3e5, "500k": 5e5, "1m": 1e6}
    for ax, nz in zip(axes, (0.0, 0.2)):
        for m in MODELS:
            pts = [(n[s], data[(s, nz)]["cv"][m]["train_sec"]) for s in SIZES
                   if (s, nz) in data and data[(s, nz)].get("cv", {}).get(m, {}).get("status") == "ok"]
            if pts:
                ax.plot(*zip(*pts), "o-", ms=3, lw=1.3, label=m, color=colours[m])
        ax.set_xscale("log")
        ax.set_yscale("log")
        ax.set_xlabel("dataset size (samples)")
        ax.set_title(f"{round(nz * 100)}% label noise", fontsize=10)
        ax.grid(alpha=0.3, which="both")
    axes[0].set_ylabel("training time (s)")
    axes[0].legend(fontsize=7, ncol=2)
    fig.tight_layout()
    fig.savefig(ROOT / "reports" / "paper" / "figures" / "ndc_time.pdf")
    print("wrote summary.csv, tables/ndc.tex, figures/ndc_time.pdf")


if __name__ == "__main__":
    main()
