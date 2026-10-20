"""Figures for the plain-language guide (static, light mode, print)."""
import sys
from pathlib import Path

import matplotlib
matplotlib.use("Agg")
import matplotlib.pyplot as plt
import numpy as np
from matplotlib.patches import Circle

REPO = Path("/home/user/GBLSTSVM")
sys.path.insert(0, str(REPO))
from gen_ball import gen_balls  # noqa: E402
from GBLSTSVM import solve_gb_planes  # noqa: E402

OUT = Path(__file__).parent / "fig"
BLUE, ORANGE, AQUA = "#2a78d6", "#eb6834", "#1baf7a"
INK, INK2, MUTED, GRID, SURF = "#0b0b0b", "#52514e", "#8a8984", "#e4e3df", "#ffffff"
plt.rcParams.update({
    "font.family": "Inter", "font.size": 10, "text.color": INK, "axes.labelcolor": INK2,
    "xtick.color": INK2, "ytick.color": INK2, "axes.edgecolor": GRID, "axes.linewidth": 0.8,
    "figure.facecolor": SURF, "axes.facecolor": SURF, "savefig.dpi": 200,
})


def clean(ax, grid_axis="x"):
    for side in ("top", "right"):
        ax.spines[side].set_visible(False)
    ax.grid(axis=grid_axis, color=GRID, linewidth=0.6)
    ax.set_axisbelow(True)
    ax.tick_params(length=0)


# ---------------------------------------------------------------- Fig 1: balls
def fig_balls():
    rng = np.random.default_rng(3)
    n = 70
    A = rng.normal([-1.0, 0.6], 0.75, (n, 2))
    B = rng.normal([1.0, -0.6], 0.75, (n + 30, 2))
    data = np.vstack([np.column_stack([A, np.ones(n)]), np.column_stack([B, -np.ones(n + 30)])])
    balls = gen_balls(data, pur=0.985, delbals=1, k_clusters=2, return_details=True)
    fig, axes = plt.subplots(1, 2, figsize=(9.2, 4.9))
    for ax in axes:
        ax.set_aspect("equal")
        ax.set_xlim(-3.6, 3.6)
        ax.set_ylim(-3.2, 3.2)
        ax.set_xticks([])
        ax.set_yticks([])
        for s in ax.spines.values():
            s.set_visible(False)
    ax = axes[0]
    ax.scatter(A[:, 0], A[:, 1], s=14, color=BLUE, edgecolor="white", linewidth=0.5, label="class +1")
    ax.scatter(B[:, 0], B[:, 1], s=14, color=ORANGE, edgecolor="white", linewidth=0.5, label="class −1")
    ax.set_title("1. Training points", loc="left", fontsize=11, fontweight="semibold")
    ax.legend(frameon=False, loc="upper left", bbox_to_anchor=(0, 0.0), fontsize=8.5)

    ax = axes[1]
    kept = [b for b in balls if b["num"] >= 2]
    single = [b for b in balls if b["num"] < 2]
    for b in kept:
        col = BLUE if b["label"] == 1 else ORANGE
        ax.add_patch(Circle(b["center"], b["r"], facecolor=col, alpha=0.18, edgecolor=col, linewidth=1.2))
        ax.plot(*b["center"], "o", ms=3, color=col)
    sc = np.array([b["center"] for b in single])
    ax.scatter(sc[:, 0], sc[:, 1], marker="x", s=22, color=MUTED, linewidth=1.2,
               label=f"single-point balls, deleted ({len(single)} of {len(data)} points)")
    # The two GBLSTSVM planes trained on the kept balls
    C = np.array([b["center"] for b in kept]); R = np.array([b["r"] for b in kept]); L = np.array([b["label"] for b in kept])
    pos, neg = L == 1, L == -1
    w1, b1, w2, b2 = solve_gb_planes(C[pos], R[pos], C[neg], R[neg], 1.0, 1.0,
                                     np.ones(pos.sum()), np.ones(pos.sum()), np.ones(neg.sum()), np.ones(neg.sum()))
    xs = np.linspace(-3.6, 3.6, 50)
    for w, b, col, name in ((w1, b1, BLUE, "plane 1 (near class +1)"), (w2, b2, ORANGE, "plane 2 (near class −1)")):
        w = np.ravel(w)
        ax.plot(xs, -(w[0] * xs + b) / w[1], color=col, linewidth=2, label=name)
    ax.set_title(f"2. GBLSTSVM: {len(kept)} balls replace the points", loc="left", fontsize=11, fontweight="semibold")
    ax.legend(frameon=False, loc="upper left", bbox_to_anchor=(0, 0.0), fontsize=8.5)
    fig.tight_layout()
    fig.savefig(OUT / "fig1_balls.png", bbox_inches="tight", pad_inches=0.08)
    plt.close(fig)
    return len(kept), len(single), len(data)


# ---------------------------------------------------------- Fig 2: the journey
def fig_journey():
    rows = [
        ("GBLSTSVM (original)", 73.4, "R1"),
        ("+ T1 centre distance", 73.8, "R1"),
        ("+ T2 neighbour entropy", 74.2, "R1"),
        ("+ T4 ball overlap", 73.5, "R1"),
        ("+ T5 ball density", 73.6, "R1"),
        ("Keep single-point balls (GB-keep)", 77.1, "R2"),
        ("Keep them, weighted (T6)", 77.7, "R2"),
        ("All samples, ball weights (GBF)", 80.5, "R3"),
        ("LSTSVM, no balls (reference)", 80.7, "ref"),
    ]
    fig, ax = plt.subplots(figsize=(8.6, 4.0))
    y = np.arange(len(rows))[::-1]
    vals = [r[1] for r in rows]
    cols = [BLUE if r[2] != "ref" else MUTED for r in rows]
    ax.barh(y, [v - 70 for v in vals], left=70, height=0.55, color=cols)
    for yi, (name, v, tag) in zip(y, rows):
        ax.text(v + 0.15, yi, f"{v:.1f}", va="center", fontsize=9, color=INK)
    ax.set_yticks(y)
    ax.set_yticklabels([r[0] for r in rows], fontsize=9)
    ax.set_xlim(70, 83.5)
    ax.set_xlabel("Balanced accuracy on clean test data, %  (mean of 21 datasets × 5 splits, 0% noise)")
    ax.axvline(73.4, color=INK2, linewidth=0.8, linestyle=(0, (3, 3)))
    for top, lab in ((8, "Round 1"), (3, "Round 2"), (1, "Round 3")):
        ax.text(83.4, top + 0.42, lab, ha="right", va="center", fontsize=8.5, color=INK2, fontweight="semibold")
    for sep in (3.5, 1.5, 0.5):
        ax.axhline(sep, color=GRID, linewidth=0.8)
    clean(ax)
    fig.tight_layout()
    fig.savefig(OUT / "fig2_journey.png", bbox_inches="tight", pad_inches=0.08)
    plt.close(fig)


# ------------------------------------------------------------ Fig 3: noise lines
def fig_noise():
    noise = [0, 10, 20]
    series = [
        ("GBLSTSVM (original)", [73.4, 73.1, 72.0], ORANGE),
        ("Keep single-point balls", [77.1, 75.7, 73.0], AQUA),
        ("LSTSVM (no balls)", [80.7, 77.8, 76.2], BLUE),
    ]
    fig, ax = plt.subplots(figsize=(7.2, 3.6))
    for name, v, col in series:
        ax.plot(noise, v, color=col, linewidth=2, marker="o", ms=6, markeredgecolor="white", markeredgewidth=1.5)
        ax.text(20.6, v[-1], name, va="center", fontsize=9, color=INK)
    ax.set_xticks(noise)
    ax.set_xticklabels(["0%", "10%", "20%"])
    ax.set_xlim(-1, 30)
    ax.set_ylim(70, 82)
    ax.set_xlabel("Share of training labels flipped (label noise)")
    ax.set_ylabel("Balanced accuracy, %")
    clean(ax, "y")
    fig.tight_layout()
    fig.savefig(OUT / "fig3_noise.png", bbox_inches="tight", pad_inches=0.08)
    plt.close(fig)


# ---------------------------------------------------------- Fig 4: detection AUC
def fig_detect():
    rows = [("Neighbour entropy (T2)", 0.33), ("Ball overlap (T4)", 0.48), ("Single-point ball (T6)", 0.75),
            ("Classic kNN on samples", 0.89), ("Ball neighbour agreement (T7)", 0.90)]
    fig, ax = plt.subplots(figsize=(7.6, 3.0))
    y = np.arange(len(rows))[::-1]
    ax.barh(y, [r[1] for r in rows], height=0.55, color=[BLUE if r[1] > 0.6 else MUTED for r in rows])
    for yi, (n, v) in zip(y, rows):
        ax.text(v + 0.012, yi, f"{v:.2f}", va="center", fontsize=9,
                bbox=dict(boxstyle="square,pad=0.15", facecolor=SURF, edgecolor="none"), zorder=4)
    ax.axvline(0.5, color=INK2, linewidth=0.8, linestyle=(0, (3, 3)))
    ax.text(0.505, len(rows) - 0.45, "0.5 = random guessing", fontsize=8, color=INK2)
    ax.set_yticks(y)
    ax.set_yticklabels([r[0] for r in rows], fontsize=9)
    ax.set_xlim(0, 1.0)
    ax.set_xlabel("ROC-AUC for spotting the flipped labels (1.0 = perfect), 10% label noise")
    clean(ax)
    fig.tight_layout()
    fig.savefig(OUT / "fig4_detect.png", bbox_inches="tight", pad_inches=0.08)
    plt.close(fig)


# -------------------------------------------------- Fig 5: entropy vs agreement
def fig_entropy():
    rng = np.random.default_rng(7)
    A = rng.normal([-1.3, 0], 0.55, (40, 2))
    B = rng.normal([1.3, 0], 0.55, (40, 2))
    flip = np.array([-1.5, 0.15])     # an orange label sitting deep in the blue cloud
    border = np.array([-0.2, 0.1])     # a correctly labelled blue point on the border
    fig, axes = plt.subplots(1, 2, figsize=(9.2, 3.6))
    titles = ("Entropy (T2) asks: is the neighbourhood mixed?", "Agreement (T7) asks: do neighbours share my label?")
    notes = (
        [(flip, "flipped point:\nneighbours all blue → pure\n→ trusted (weight 1.0)", (-3.1, 1.55)),
         (border, "correct border point:\n3 blue, 2 orange neighbours\n→ distrusted (weight 0.1)", (0.35, 1.55))],
        [(flip, "flipped point:\n0 of 5 neighbours agree\n→ weight 0", (-3.1, 1.55)),
         (border, "correct border point:\n3 of 5 neighbours agree\n→ weight 0.6", (0.35, 1.55))],
    )
    for ax, title, nts in zip(axes, titles, notes):
        ax.scatter(A[:, 0], A[:, 1], s=16, color=BLUE, edgecolor="white", linewidth=0.5)
        ax.scatter(B[:, 0], B[:, 1], s=16, color=ORANGE, edgecolor="white", linewidth=0.5)
        ax.scatter(*flip, s=70, color=ORANGE, edgecolor=INK, linewidth=1.2, zorder=5)
        ax.scatter(*border, s=70, color=BLUE, edgecolor=INK, linewidth=1.2, zorder=5)
        for pt, txt, xy in nts:
            ax.annotate(txt, pt, xytext=xy, fontsize=8, color=INK,
                        arrowprops=dict(arrowstyle="-", color=INK2, linewidth=0.7))
        ax.set_title(title, loc="left", fontsize=10, fontweight="semibold")
        ax.set_xlim(-3.2, 3.2)
        ax.set_ylim(-1.5, 2.4)
        ax.set_aspect("equal")
        ax.set_xticks([])
        ax.set_yticks([])
        for s in ax.spines.values():
            s.set_visible(False)
    fig.tight_layout()
    fig.savefig(OUT / "fig5_entropy.png", bbox_inches="tight", pad_inches=0.08)
    plt.close(fig)


# ------------------------------------------------------------ Fig 6: round 4
def fig_round4():
    sys.path.insert(0, str(REPO / "experiments"))
    from summarize_fuzzy import load
    df = load(REPO / "results" / "fuzzy_cv_v4")
    full = df.groupby("noise")["dataset"].nunique()
    df = df[df["noise"].isin(full[full == 21].index)]  # only noise levels with all 21 datasets
    t = df.groupby(["noise", "dataset", "method"])["balanced_accuracy"].mean().groupby(["noise", "method"]).mean().unstack() * 100
    series = [
        ("GBLSTSVM (original)", "GBLSTSVM", ORANGE),
        ("T7 on all balls", "T7-agree", AQUA),
        ("LSTSVM (no balls)", "LSTSVM", BLUE),
        ("Classic fuzzy-kNN LSTSVM", "FKNN-LSTSVM", "#eda100"),
    ]
    noise = [int(round(n * 100)) for n in t.index]
    fig, ax = plt.subplots(figsize=(7.4, 3.8))
    ends = []
    for name, key, col in series:
        v = t[key].values
        ax.plot(noise, v, color=col, linewidth=2, marker="o", ms=6, markeredgecolor="white", markeredgewidth=1.5)
        ends.append([v[-1], name])
    ends.sort()
    for i in range(1, len(ends)):  # keep direct labels at least 1.1 points apart
        ends[i][0] = max(ends[i][0], ends[i - 1][0] + 1.1)
    for y, name in ends:
        ax.text(noise[-1] + 0.8, y, name, va="center", fontsize=9, color=INK)
    ax.set_xticks(noise)
    ax.set_xticklabels([f"{n}%" for n in noise])
    ax.set_xlim(-1.5, noise[-1] + 13)
    ax.set_xlabel("Share of training labels flipped (label noise)")
    ax.set_ylabel("Balanced accuracy, %")
    clean(ax, "y")
    fig.tight_layout()
    fig.savefig(OUT / "fig6_round4.png", bbox_inches="tight", pad_inches=0.08)
    plt.close(fig)
    return t


def fig_kernel():
    sys.path.insert(0, str(REPO / "experiments"))
    from summarize_fuzzy import load
    df = load(REPO / "results" / "kernel_cv_v1")
    t = df.groupby(["noise", "dataset", "method"])["balanced_accuracy"].mean().groupby(["noise", "method"]).mean().unstack() * 100
    series = [
        ("Kernel GBLSTSVM", "K-GBLSTSVM", ORANGE),
        ("Kernel, keep + T7", "K-keep-T7", AQUA),
        ("Kernel LSTSVM", "K-LSTSVM", BLUE),
        ("Kernel fuzzy-kNN LSTSVM", "K-FKNN-LSTSVM", "#eda100"),
    ]
    noise = [int(round(n * 100)) for n in t.index]
    fig, ax = plt.subplots(figsize=(7.4, 3.8))
    ends = []
    for name, key, col in series:
        v = t[key].values
        ax.plot(noise, v, color=col, linewidth=2, marker="o", ms=6, markeredgecolor="white", markeredgewidth=1.5)
        ends.append([v[-1], name])
    ends.sort()
    for i in range(1, len(ends)):
        ends[i][0] = max(ends[i][0], ends[i - 1][0] + 1.1)
    for y, name in ends:
        ax.text(noise[-1] + 0.8, y, name, va="center", fontsize=9, color=INK)
    ax.set_xticks(noise)
    ax.set_xticklabels([f"{n}%" for n in noise])
    ax.set_xlim(-1.5, noise[-1] + 13)
    ax.set_xlabel("Share of training labels flipped (label noise)")
    ax.set_ylabel("Balanced accuracy, %")
    clean(ax, "y")
    fig.tight_layout()
    fig.savefig(OUT / "fig7_kernel.png", bbox_inches="tight", pad_inches=0.08)
    plt.close(fig)
    return t


def fig_timing():
    import json
    recs = sorted((json.loads(f.read_text()) for f in (REPO / "results" / "kernel_timing").glob("*__noise0.json")),
                  key=lambda r: r["train"])
    series = [
        ("Kernel GBLSTSVM", "K-GBLSTSVM", ORANGE),
        ("Kernel, keep + T7", "K-keep-T7", AQUA),
        ("Kernel LSTSVM (all points)", "K-LSTSVM", BLUE),
        ("Reduced-kernel LSTSVM", "RK-LSTSVM", "#eda100"),
    ]
    fig, (a1, a2) = plt.subplots(1, 2, figsize=(7.6, 3.6))
    for name, key, col in series:
        pts = [(r["train"], r["models"][key]) for r in recs if "train_time" in r["models"].get(key, {})]
        n = [p[0] / 1000 for p in pts]
        a1.plot(n, [p[1]["train_time"] for p in pts], color=col, linewidth=2, marker="o", ms=5,
                markeredgecolor="white", markeredgewidth=1.2, label=name)
        a2.plot(n, [p[1]["bal_acc"] * 100 for p in pts], color=col, linewidth=2, marker="o", ms=5,
                markeredgecolor="white", markeredgewidth=1.2)
    last_full = max(r["train"] for r in recs if "train_time" in r["models"]["K-LSTSVM"]) / 1000
    a1.annotate("not run on more points\n(needs 73 GB at 70k)", xy=(last_full, 60), xytext=(last_full + 6, 90), fontsize=8.5, color=INK2,
                arrowprops=dict(arrowstyle="-", color=MUTED, linewidth=0.8))
    a1.set_yscale("log")
    a1.set_xlabel("Training points (thousands)")
    a1.set_ylabel("Training time, seconds (log scale)")
    a2.set_xlabel("Training points (thousands)")
    a2.set_ylabel("Balanced accuracy, %")
    a2.set_ylim(95, 100)
    for ax in (a1, a2):
        clean(ax, "y")
    fig.legend(loc="lower center", ncol=2, frameon=False, fontsize=9, bbox_to_anchor=(0.5, -0.08))
    fig.tight_layout(rect=(0, 0.08, 1, 1))
    fig.savefig(OUT / "fig8_timing.png", bbox_inches="tight", pad_inches=0.08)
    plt.close(fig)


# ---------------------------------------------------------------- Fig 10: GBFTSVM baseline
def fig_gbftsvm():
    sys.path.insert(0, str(REPO / "experiments"))
    from paper_tables import load_runs
    df = load_runs(["fuzzy_cv_v4", "fuzzy_cv_v6", "gbftsvm_cv"])
    t = df.groupby(["noise", "dataset", "method"])["balanced_accuracy"].mean().groupby(["noise", "method"]).mean().unstack() * 100
    series = [
        ("GBLSTSVM (original)", "GBLSTSVM", ORANGE),
        ("GBFTSVM (published fuzzy GB model)", "GBFTSVM", "#8a5cd6"),
        ("Keep + T7 (our fix)", "T7-agree", AQUA),
        ("LSTSVM (no balls)", "LSTSVM", BLUE),
    ]
    noise = [int(round(n * 100)) for n in t.index]
    fig, ax = plt.subplots(figsize=(7.4, 3.8))
    ends = []
    for name, key, col in series:
        v = t[key].values
        ax.plot(noise, v, color=col, linewidth=2, marker="o", ms=6, markeredgecolor="white", markeredgewidth=1.5)
        ends.append([v[-1], name])
    ends.sort()
    for i in range(1, len(ends)):  # keep direct labels at least 1.1 points apart
        ends[i][0] = max(ends[i][0], ends[i - 1][0] + 1.1)
    for y, name in ends:
        ax.text(noise[-1] + 0.8, y, name, va="center", fontsize=9, color=INK)
    ax.set_xticks(noise)
    ax.set_xticklabels([f"{n}%" for n in noise])
    ax.set_xlim(-1.5, noise[-1] + 17)
    ax.set_xlabel("Share of training labels flipped (label noise)")
    ax.set_ylabel("Balanced accuracy, %")
    clean(ax, "y")
    fig.tight_layout()
    fig.savefig(OUT / "fig10_gbftsvm.png", bbox_inches="tight", pad_inches=0.08)
    plt.close(fig)
    return t[[key for _, key, _ in series]]


if __name__ == "__main__":
    print("balls kept/single/points:", fig_balls())
    fig_journey()
    fig_noise()
    fig_detect()
    fig_entropy()
    print(fig_round4().round(2))
    print(fig_kernel().round(2))
    fig_timing()
    print(fig_gbftsvm().round(2))
