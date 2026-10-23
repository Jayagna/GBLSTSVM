"""Ball diagrams for the deck of work done before the fuzzy study.

Uses the user's own generator (gen_ball_new.py from GBLSTSVM_M0_M3_ready.zip) for the
k-means, M0 and M1 balls, and adpgbg.py from Jayagna/GBLSTSVM for the ADPGBG balls.
Usage: python3 figs_prior.py <path to extracted GBLSTSVM-Ex-main>
"""
import json
import sys
from pathlib import Path

import matplotlib
matplotlib.use("Agg")
import matplotlib.pyplot as plt
import numpy as np
from matplotlib.patches import Circle
from sklearn.datasets import make_moons

EX = Path(sys.argv[1])
sys.path.insert(0, str(EX))
sys.path.insert(0, "/home/user/GBLSTSVM")
import gen_ball_new as gbn  # noqa: E402  (user's prior code)
from src.bmru import bmru_uncertainty, decision_margin_at_center  # noqa: E402
from src.topology_membership import compute_topology_membership  # noqa: E402
from src.cbcm import compute_competition_membership  # noqa: E402
from adpgbg import adpgbg_gen_balls  # noqa: E402

OUT = Path(__file__).parent / "fig"
BLUE, ORANGE, INK, INK2, MUTED, GRID = "#2a78d6", "#eb6834", "#0b0b0b", "#52514e", "#8a8984", "#e4e3df"
plt.rcParams.update({"font.family": "Inter", "font.size": 10, "text.color": INK, "axes.labelcolor": INK2,
                     "figure.facecolor": "white", "axes.facecolor": "white", "savefig.dpi": 200})
stats = {}


def moons(n, noise, seed):
    X, y = make_moons(n_samples=n, noise=noise, random_state=seed)
    return X, np.where(y == 0, 1.0, -1.0)


def frame(ax, X, title):
    ax.set_aspect("equal")
    pad = 0.35
    ax.set_xlim(X[:, 0].min() - pad, X[:, 0].max() + pad)
    ax.set_ylim(X[:, 1].min() - pad, X[:, 1].max() + pad)
    ax.set_xticks([]); ax.set_yticks([])
    for s in ax.spines.values():
        s.set_visible(False)
    ax.set_title(title, loc="left", fontsize=11, fontweight="semibold")


def points(ax, X, y, s=9, alpha=0.75):
    ax.scatter(X[y == 1, 0], X[y == 1, 1], s=s, color=BLUE, alpha=alpha, linewidth=0)
    ax.scatter(X[y == -1, 0], X[y == -1, 1], s=s, color=ORANGE, alpha=alpha, linewidth=0)


def draw_balls(ax, balls, fill=0.16, lw=1.1, edge=None, alphas=None):
    for i, (c, r, lab) in enumerate(balls):
        col = BLUE if lab == 1 else ORANGE
        a = fill if alphas is None else alphas[i]
        ax.add_patch(Circle(c, max(r, 0.012), facecolor=col, alpha=a, edgecolor="none"))
        ax.add_patch(Circle(c, max(r, 0.012), facecolor="none", edgecolor=edge or col, linewidth=lw))


def conflicts(balls):
    n = 0
    for i in range(len(balls)):
        for j in range(i + 1, len(balls)):
            (ci, ri, li), (cj, rj, lj) = balls[i], balls[j]
            if li != lj and np.linalg.norm(np.asarray(ci) - np.asarray(cj)) < ri + rj:
                n += 1
    return n


def planes(ax, X, hp):
    xs = np.linspace(X[:, 0].min() - 0.35, X[:, 0].max() + 0.35, 50)
    for w, b, col in ((hp["w1"], hp["b1"], BLUE), (hp["w2"], hp["b2"], ORANGE)):
        ax.plot(xs, -(w[0] * xs + b) / w[1], color=col, linewidth=2)


def gblist(X, y, pur, seed=0):
    gb = gbn.GBList(gbn._append_row_index(np.column_stack([X, y])))
    gb.init_granular_balls(purity=pur, min_sample=2, random_state=seed)
    return gb


def legacy(gb):
    return [(b.center, b.r, b.label) for b in gb.granular_balls]


# --------------------------------------------- 1. k-means vs ADPGBG on two moons
X, y = moons(300, 0.20, 42)
gb = gblist(X, y, 0.985)
gb.del_ball(num_data=2)
km = legacy(gb)
ad = [(b["center"], b["r"], b["label"]) for b in adpgbg_gen_balls(np.column_stack([X, y]))]
fig, axes = plt.subplots(1, 2, figsize=(10, 4.2))
points(axes[0], X, y); draw_balls(axes[0], km)
frame(axes[0], X, f"K-means splitting (purity 0.985): {len(km)} balls")
points(axes[1], X, y); draw_balls(axes[1], ad)
frame(axes[1], X, f"ADPGBG: {len(ad)} balls")
fig.tight_layout(); fig.savefig(OUT / "p1_kmeans_vs_adpgbg.png", bbox_inches="tight", pad_inches=0.05); plt.close(fig)
stats["moons"] = {"kmeans_balls": len(km), "kmeans_conflicts": conflicts(km), "adpgbg_balls": len(ad), "adpgbg_conflicts": conflicts(ad)}

# --------------------------------------------- 2. M1: margin-guided refinement
X, y = moons(400, 0.25, 7)
gb = gblist(X, y, 0.80)
coarse = list(gb.granular_balls)
hp0 = gbn._fit_provisional_gblstsvm(coarse)
gbn._update_dynamic_metrics(coarse, hp0)
coarse_scores = np.array([b.refinement_score for b in coarse])
coarse_legacy = legacy(gb)
hist = gbn.refine_balls_margin_guided(gb, score_threshold=0.02, complexity_penalty=0.002, max_rounds=10, random_state=0)
final = list(gb.granular_balls)
new = [b for b in final if all(b is not c for c in coarse)]
hp1 = gbn._fit_provisional_gblstsvm(final)
fig, axes = plt.subplots(1, 2, figsize=(10, 4.4))
ax = axes[0]
points(ax, X, y, s=7, alpha=0.5)
alph = 0.06 + 0.5 * coarse_scores / max(coarse_scores.max(), 1e-9)
draw_balls(ax, coarse_legacy, alphas=alph)
planes(ax, X, hp0)
frame(ax, X, f"1. Coarse balls (purity 0.80) and provisional planes")
ax.text(0.0, -0.06, "darker fill = higher refinement score", transform=ax.transAxes, fontsize=8.5, color=INK2)
ax = axes[1]
points(ax, X, y, s=7, alpha=0.5)
draw_balls(ax, [(b.center, b.r, b.label) for b in final if any(b is c for c in coarse)], fill=0.10, lw=0.9)
draw_balls(ax, [(b.center, b.r, b.label) for b in new], fill=0.25, lw=2.0, edge=INK)
planes(ax, X, hp1)
acc = sum(r["accepted"] for r in hist)
frame(ax, X, f"2. After refinement: {acc} of {len(hist)} splits kept")
ax.text(0.0, -0.06, "black outline = ball created by an accepted split", transform=ax.transAxes, fontsize=8.5, color=INK2)
fig.tight_layout(); fig.savefig(OUT / "p2_m1_refinement.png", bbox_inches="tight", pad_inches=0.05); plt.close(fig)
stats["m1"] = {"coarse_balls": len(coarse), "final_balls": len(final), "attempted": len(hist), "accepted": int(acc),
               "rounds": int(max([r["round"] for r in hist], default=0))}

# --------------------------------------------- 3. M2: reliability weights on M0 balls
gb = gblist(X, y, 0.92)
gb.del_ball(num_data=2)
balls = list(gb.granular_balls)
hp = gbn._fit_provisional_gblstsvm(balls)
gbn._update_dynamic_metrics(balls, hp, weight_boundary_boost=0.75)
w = np.array([b.weight for b in balls])
fig, ax = plt.subplots(figsize=(6.2, 4.6))
points(ax, X, y, s=6, alpha=0.35)
draw_balls(ax, legacy(gb), alphas=0.05 + 0.55 * (w - w.min()) / max(np.ptp(w), 1e-9))
for b, wi in zip(balls, w):
    if b.num >= 12:
        ax.text(b.center[0], b.center[1], f"{wi:.2f}", ha="center", va="center", fontsize=7.5, color=INK)
planes(ax, X, hp)
frame(ax, X, f"M2: {len(balls)} M0 balls, darker = larger weight")
fig.tight_layout(); fig.savefig(OUT / "p3_m2_weights.png", bbox_inches="tight", pad_inches=0.05); plt.close(fig)
stats["m2"] = {"balls": len(balls), "w_min": float(w.min()), "w_max": float(w.max()),
               "purity_min": float(min(b.purity for b in balls))}
# --------------------------------------------- 4. BMRU: 2-D toy vs the real 8-feature pima data (test-setup settings)
def setup_balls(X, y):
    gb = gblist(X, y, 0.95)  # protocol: purity 0.95, balls with >= 2 points, c1 = 100, c2 = 0.01, no scaling
    gb.del_ball(num_data=2)
    balls = list(gb.granular_balls)
    hp = gbn._fit_provisional_gblstsvm(balls, c1=100.0, c2=0.01)
    s_of = lambda c: decision_margin_at_center(c, hp["w1"], hp["b1"], hp["w2"], hp["b2"])[0]
    return gb, balls, hp, s_of


X, y = moons(300, 0.20, 42)
gb, balls, hp, s_of = setup_balls(X, y)
u = np.array([bmru_uncertainty(b.r, s_of(b.center)) for b in balls])
mu = np.exp(-u)
w1, b1, w2, b2 = hp["w1"], hp["b1"], hp["w2"], hp["b2"]


def boundary(ax):
    xs = np.linspace(X[:, 0].min() - 0.35, X[:, 0].max() + 0.35, 300)
    ys = np.linspace(X[:, 1].min() - 0.35, X[:, 1].max() + 0.35, 300)
    gx, gy = np.meshgrid(xs, ys)
    s = np.abs(gx * w2[0] + gy * w2[1] + b2) - np.abs(gx * w1[0] + gy * w1[1] + b1)
    ax.contour(gx, gy, s, levels=[0], colors=INK2, linewidths=1.2, linestyles="--")


sys.path.insert(0, "/home/user/GBLSTSVM")
from dataset_utils import load_binary_dataset  # noqa: E402
P = load_binary_dataset("/home/user/GBLSTSVM/Data/LSTSVM_benchmarks/pima.txt")
P = P[0] if isinstance(P, tuple) else P
_, pballs, _, ps_of = setup_balls(P[:, :-1], P[:, -1])
ps = np.array([abs(ps_of(b.center)) for b in pballs])
pr = np.array([2 * b.r for b in pballs])
pcross = np.array([len({np.sign(ps_of(x)) for x in b.data_no_label} - {0.0}) > 1 for b in pballs])
fig, axes = plt.subplots(1, 2, figsize=(10, 4.4), gridspec_kw={"width_ratios": [1.15, 1]})
ax = axes[0]
points(ax, X, y, s=6, alpha=0.35)
draw_balls(ax, legacy(gb), alphas=0.05 + 0.55 * (1 - mu))
boundary(ax)
frame(ax, X, f"2-D two moons: BMRU flags {int((u >= 1).sum())} of {len(balls)} balls")
ax.text(0.0, -0.06, "darker = lower weight μ = exp(−u); dashed = decision boundary", transform=ax.transAxes,
        fontsize=8.5, color=INK2)
ax = axes[1]
lim = max(ps.max(), pr.max()) * 1.05
ax.plot([0, lim], [0, lim], color=MUTED, linewidth=1, linestyle="--")
ax.scatter(ps[~pcross], pr[~pcross], s=16, color=BLUE, alpha=0.7, linewidth=0, label="all members on one side")
ax.scatter(ps[pcross], pr[pcross], s=22, color=ORANGE, alpha=0.9, linewidth=0, label="members on both sides")
ax.set_xlim(0, lim); ax.set_ylim(0, lim)
ax.set_xlabel("|s|, margin at the ball centre"); ax.set_ylabel("2r, ball diameter")
ax.text(0.04 * lim, 0.9 * lim, "u ≥ 1: flagged", color=INK2, fontsize=9)
ax.text(0.62 * lim, 0.08 * lim, "u < 1: trusted", color=INK2, fontsize=9)
for sp in ("top", "right"):
    ax.spines[sp].set_visible(False)
ax.grid(color=GRID, linewidth=0.6); ax.set_axisbelow(True)
ax.legend(frameon=False, fontsize=8.5, loc="lower right", bbox_to_anchor=(1.0, 0.12))
ax.set_title(f"pima, 8 features: {int((pr >= ps).sum())} of {len(pballs)} balls flagged, {int(pcross.sum())} really mixed",
             loc="left", fontsize=11, fontweight="semibold")
fig.tight_layout(); fig.savefig(OUT / "p4_bmru.png", bbox_inches="tight", pad_inches=0.05); plt.close(fig)
stats["bmru"] = {"toy_balls": len(balls), "toy_flagged": int((u >= 1).sum()), "pima_balls": len(pballs),
                 "pima_flagged": int((pr >= ps).sum()), "pima_mixed": int(pcross.sum())}


# --------------------------------------------- 5. CBCM competition (CA) and Topo reciprocity on the same balls
centers = np.array([b.center for b in balls])
labels = np.array([b.label for b in balls])
comp, mu_a, k = compute_competition_membership(centers, labels)
topo = compute_topology_membership(centers, labels)
nbr = topo.neighbor_idx
fig, ax = plt.subplots(figsize=(5.4, 4.4))
points(ax, X, y, s=6, alpha=0.3)
for i in range(len(balls)):
    for j in nbr[i]:
        ax.plot(*zip(centers[i], centers[j]), color=GRID if labels[i] == labels[j] else MUTED, linewidth=0.8, zorder=0)
draw_balls(ax, legacy(gb), alphas=0.04 + 0.6 * mu_a)
frame(ax, X, f"CA: k = {k} nearest balls, darker = more contested")
ax.text(0.0, -0.06, "dark links = opposite-class neighbours; μA = 4·comp·(1 − comp)", transform=ax.transAxes,
        fontsize=8.5, color=INK2)
fig.tight_layout(); fig.savefig(OUT / "p5_cbcm.png", bbox_inches="tight", pad_inches=0.05); plt.close(fig)
fig, ax = plt.subplots(figsize=(5.4, 4.4))
points(ax, X, y, s=6, alpha=0.3)
sets = [set(int(j) for j in nbr[i]) for i in range(len(balls))]
for i in range(len(balls)):
    for j in sets[i]:
        if labels[i] != labels[j]:
            mutual = i in sets[j]
            if mutual and j < i:
                continue
            ax.plot(*zip(centers[i], centers[j]), color=INK if mutual else MUTED, linewidth=1.4 if mutual else 0.8,
                    linestyle="-" if mutual else ":", zorder=0)
draw_balls(ax, legacy(gb), alphas=0.04 + 0.6 * topo.mu_topo)
frame(ax, X, "Topo: an opposite-class link counts only if mutual")
ax.text(0.0, -0.06, "solid = mutual link, dotted = one-way; darker = larger A·R_opp", transform=ax.transAxes,
        fontsize=8.5, color=INK2)
fig.tight_layout(); fig.savefig(OUT / "p6_topo.png", bbox_inches="tight", pad_inches=0.05); plt.close(fig)
stats["cbcm_topo"] = {"k": int(k), "mu_a_max": float(mu_a.max()), "contested": int((mu_a > 0).sum()),
                      "topo_nonzero": int((topo.mu_topo > 0).sum())}
(Path(__file__).parent / "fig_stats.json").write_text(json.dumps(stats, indent=1))
print(json.dumps(stats, indent=1))
