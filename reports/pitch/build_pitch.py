"""Builds Why_Evaluation_Paper.pdf: a 3-page, plain-language case for writing a fair-testing
(evaluation) paper on GBLSTSVM instead of chasing a new fuzzy membership. 4 Nov 2026.

Run:  python3 build_pitch.py        (writes pitch.html, then prints it to PDF with Chromium)
Numbers come from the post-midsem deck's data files (same results as the deck):
  ../ppt/post_midsem/data/lstsvm_vs_gblstsvm.csv   fair CV vs settings picked on the test set
  ../ppt/post_midsem/data/{residual,boundary,transplant}_probe.csv   flipped-label detection AUCs
and repo results/paper/summary.md, results/noise_diagnostics/summary.md (constants below).
"""
import csv
import os
import subprocess

HERE = os.path.dirname(os.path.abspath(__file__))
DATA = os.path.join(HERE, "..", "ppt", "post_midsem", "data")  # repo copy: ../post_midsem/data
CHROME = "/opt/pw-browsers/chromium-1194/chrome-linux/chrome"

BLUE, BRICK, TEAL, GREY = "#2B63C6", "#C0492F", "#00897B", "#A3AEB1"
INK, INK2, RULE = "#17242A", "#4E5B60", "#DCE5E4"


def rows(name):
    with open(os.path.join(DATA, name)) as f:
        return list(csv.DictReader(f))


gap = {(r["noise"], r["metric"]): r for r in rows("lstsvm_vs_gblstsvm.csv")}
acc = lambda noise, key: float(gap[(noise, "accuracy")][key])
FAIR_L, FAIR_G = acc("0%", "LSTSVM_cv"), acc("0%", "GBLSTSVM_cv")
PEEK_L, PEEK_G = acc("0%", "LSTSVM_test_tuned"), acc("0%", "GBLSTSVM_test_tuned")
PAPER_L, PAPER_G = 86.67, 88.26  # GBLSTSVM paper (arXiv 2410.17338v2), Table 1, linear, 0% noise
F30_L, F30_G = acc("30%", "LSTSVM_cv"), acc("30%", "GBLSTSVM_cv")
P30_L, P30_G = acc("30%", "LSTSVM_test_tuned"), acc("30%", "GBLSTSVM_test_tuned")
NOISES = ["0%", "10%", "20%", "30%"]
fair_gaps = [acc(n, "LSTSVM_cv") - acc(n, "GBLSTSVM_cv") for n in NOISES]
lifts = [acc(n, k + "_test_tuned") - acc(n, k + "_cv") for n in NOISES for k in ("LSTSVM", "GBLSTSVM")]

at20 = lambda name, key: float(next(r for r in rows(name) if r["noise"] == "20%")[key])
LADDER = [  # flipped-label detection AUC at 20% noise; True = asks whether neighbours share the label
    ("Fuzzy kNN on single points (published 1985)", 0.869, True),  # results/residual_probe auc_point_knn
    ("Neighbour agreement, T7 (published for balls 2026)", at20("residual_probe.csv", "auc_T7_mean"), True),
    ("Boundary-aware agreement (ours, new)", at20("boundary_probe.csv", "auc_ball_2nd_mean"), True),
    ("Intuitionistic: neighbours + centre (borrowed)", at20("transplant_probe.csv", "auc_IF_mean"), True),
    ("Deleting one-point balls (what GBLSTSVM does)", 0.667, False),  # results/noise_diagnostics
    ("Mistakes of a first model (ours, new)", at20("residual_probe.csv", "auc_res_0.1_mean"), False),
    ("Distance to the ball's class centre (published)", at20("transplant_probe.csv", "auc_T1_mean"), False),
    ("Distance to the other class (borrowed)", at20("transplant_probe.csv", "auc_FR_mean"), False),
    ("How much balls overlap (tried in round 1)", 0.491, False),
    ("How crowded the area is (tried in round 1)", 0.330, False),
    ("How mixed the neighbours are (published)", 0.264, False),
]
LADDER.sort(key=lambda r: -r[1])

# results/paper/summary.md, linear, balanced accuracy: keep + T7 minus GBLSTSVM / GBFTSVM at 0-30% noise
KEEP_VS_GB = (2.6, 4.9)
KEEP_VS_GBF = (3.7, 5.6)
# results/noise_diagnostics/summary.md: share of points removed by deleting one-point balls at 10-30% noise
DEL_FLIPPED = (82, 88)
DEL_CLEAN = (41, 60)


def f1(v):
    return f"{v:.1f}"


# ------------------------------------------------------------------ figure 1: dot plot
def dot_plot():
    W, H = 640, 214
    x0, x1, lo, hi = 250, 610, 76, 90
    X = lambda v: x0 + (v - lo) / (hi - lo) * (x1 - x0)
    lines = [
        ("Reported in the GBLSTSVM paper", PAPER_L, PAPER_G),
        ("Our run, settings picked by peeking at the test", PEEK_L, PEEK_G),
        ("Our run, fair test", FAIR_L, FAIR_G),
    ]
    out = [f'<svg viewBox="0 0 {W} {H}" width="100%" role="img" aria-label="Accuracy of LSTSVM and GBLSTSVM under three conditions">']
    # legend
    out.append(f'<circle cx="{x0 + 6}" cy="14" r="6" fill="{BLUE}"/><text x="{x0 + 18}" y="18" class="lg">plain LSTSVM</text>')
    out.append(f'<circle cx="{x0 + 140}" cy="14" r="6" fill="{BRICK}"/><text x="{x0 + 152}" y="18" class="lg">GBLSTSVM</text>')
    top, step = 52, 48
    for v in range(lo, hi + 1, 2):
        out.append(f'<line x1="{X(v):.1f}" x2="{X(v):.1f}" y1="{top - 18}" y2="{top + 2 * step + 16}" stroke="{RULE}" stroke-width="1"/>')
        out.append(f'<text x="{X(v):.1f}" y="{top + 2 * step + 34}" class="ax" text-anchor="middle">{v}</text>')
    for i, (name, l, g) in enumerate(lines):
        y = top + i * step
        bold = ' font-weight="600"' if i == 2 else ""
        out.append(f'<text x="0" y="{y + 5}" class="rl"{bold}>{name}</text>')
        out.append(f'<line x1="{X(min(l, g)):.1f}" x2="{X(max(l, g)):.1f}" y1="{y}" y2="{y}" stroke="{INK2}" stroke-width="2"/>')
        for v, c, other in ((l, BLUE, g), (g, BRICK, l)):
            out.append(f'<circle cx="{X(v):.1f}" cy="{y}" r="7" fill="{c}" stroke="#fff" stroke-width="2"/>')
            anchor, dx = ("end", -11) if v < other else ("start", 11)
            out.append(f'<text x="{X(v) + dx:.1f}" y="{y + 4.5}" class="vl" text-anchor="{anchor}">{f1(v)}</text>')
    out.append("</svg>")
    return "".join(out)


# ------------------------------------------------------------------ figure 2: detection ladder
def ladder():
    W, rowh = 640, 25
    x0, x1 = 330, 600
    X = lambda v: x0 + v * (x1 - x0)
    top = 40
    H = top + rowh * len(LADDER) + 44
    out = [f'<svg viewBox="0 0 {W} {H}" width="100%" role="img" aria-label="How well each trust rule spots flipped labels">']
    out.append(f'<rect x="{x0}" y="6" width="12" height="12" rx="2" fill="{TEAL}"/><text x="{x0 + 18}" y="17" class="lg">asks "do my neighbours share my label?"</text>')
    out.append(f'<rect x="{x0}" y="22" width="12" height="12" rx="2" fill="{GREY}"/><text x="{x0 + 18}" y="33" class="lg">uses some other idea</text>')
    for v in (0, 0.25, 0.5, 0.75, 1.0):
        out.append(f'<text x="{X(v):.1f}" y="{H - 8}" class="ax" text-anchor="middle">{v:g}</text>')
    for i, (name, v, nb) in enumerate(LADDER):
        y = top + 6 + i * rowh
        out.append(f'<text x="0" y="{y + 12}" class="rl">{name}</text>')
        out.append(f'<rect x="{x0}" y="{y}" width="{X(v) - x0:.1f}" height="{rowh - 8}" rx="3" fill="{TEAL if nb else GREY}"/>')
        out.append(f'<text x="{X(v) + 6:.1f}" y="{y + 12.5}" class="vl">{v:.2f}</text>')
    yb = top + rowh * len(LADDER) + 6
    out.append(f'<line x1="{X(0.5):.1f}" x2="{X(0.5):.1f}" y1="{top}" y2="{yb}" stroke="{INK}" stroke-width="1.2" stroke-dasharray="4 3"/>')
    out.append(f'<line x1="{x0}" x2="{x0}" y1="{top}" y2="{yb}" stroke="{INK2}" stroke-width="1"/>')
    out.append(f'<text x="{X(0.5) + 4:.1f}" y="{yb + 10}" class="ax" text-anchor="start">coin flip</text>')
    out.append("</svg>")
    return "".join(out)


nb_lo = min(v for _, v, nb in LADDER if nb and v > 0.8)
other_hi = max(v for _, v, nb in LADDER if not nb)

HTML = f"""<!doctype html>
<html lang="en"><head><meta charset="utf-8">
<title>Why a fair-testing paper is our best next step</title>
<style>
@page {{ size: A4; margin: 16mm 17mm 16mm 17mm; }}
html {{ background: #fff; }}
body {{ font-family: "Inter", "Liberation Sans", sans-serif; font-size: 11pt; line-height: 1.5; color: {INK}; margin: 0; }}
h1 {{ font-size: 22pt; line-height: 1.15; margin: 0 0 4pt; letter-spacing: -0.01em; }}
h2 {{ font-size: 14.5pt; margin: 16pt 0 6pt; padding-top: 6pt; border-top: 1.5pt solid {INK}; break-after: avoid; }}
h3 {{ font-size: 11.5pt; margin: 0 0 3pt; }}
p {{ margin: 0 0 7pt; }}
ul, ol {{ margin: 0 0 8pt; padding-left: 16pt; }}
li {{ margin-bottom: 4pt; }}
.sub {{ color: {INK2}; font-size: 10pt; margin-bottom: 12pt; }}
.box {{ background: #EEF3F2; border-radius: 6pt; padding: 10pt 14pt; margin: 8pt 0 10pt; break-inside: avoid; }}
.box.key {{ border-left: 4pt solid {TEAL}; }}
.box p:last-child, .box ul:last-child, .box ol:last-child {{ margin-bottom: 0; }}
figure {{ margin: 8pt 0 6pt; break-inside: avoid; }}
figcaption {{ font-size: 9pt; color: {INK2}; margin-top: 2pt; line-height: 1.4; }}
.fig-title {{ font-weight: 600; font-size: 10.5pt; margin-bottom: 2pt; }}
svg text {{ font-family: "Inter", "Liberation Sans", sans-serif; fill: {INK}; }}
svg .lg {{ font-size: 12px; }} svg .ax {{ font-size: 11px; fill: {INK2}; }}
svg .rl {{ font-size: 12.5px; }} svg .vl {{ font-size: 12px; font-weight: 600; }}
.take {{ font-weight: 600; margin: 4pt 0 8pt; }}
.reasons {{ display: grid; grid-template-columns: 1fr 1fr 1fr; gap: 10pt; margin: 6pt 0 8pt; }}
.reasons > div {{ background: #F6F8F8; border-radius: 6pt; padding: 9pt 11pt; font-size: 10pt; line-height: 1.45; break-inside: avoid; }}
.num {{ display: inline-block; width: 18pt; height: 18pt; border-radius: 9pt; background: {BRICK}; color: #fff; text-align: center; font-weight: 700; font-size: 10pt; line-height: 18pt; margin-right: 4pt; }}
.num.g {{ background: {TEAL}; }}
.cmp {{ display: grid; grid-template-columns: 1fr 1fr; gap: 12pt; margin: 8pt 0 10pt; break-inside: avoid; }}
.cmp > div {{ border-radius: 6pt; padding: 10pt 13pt; font-size: 10.3pt; }}
.cmp .a {{ background: #FBEDEA; }} .cmp .b {{ background: #E3F2EF; }}
.cmp h3 {{ margin-bottom: 5pt; }}
.cmp ul {{ margin: 0; padding-left: 14pt; }}
.find {{ display: grid; grid-template-columns: 22pt 1fr; column-gap: 6pt; row-gap: 7pt; margin: 6pt 0 10pt; }}
.find p {{ margin: 0; }}
.small {{ font-size: 9pt; color: {INK2}; }}
.pb {{ break-before: page; }}
</style></head><body>

<h1>Why a fair-testing paper is our best next step</h1>
<div class="sub">GBLSTSVM fuzzy study &middot; Jayagna &middot; 4 November 2026 &middot; a short summary in plain words</div>

<div class="box key">
<h3>The short answer</h3>
<ul>
<li><b>We looked hard for a new fuzzy weighting rule for GBLSTSVM.</b> Every rule we found or invented was either already published, or no better than a simple idea from 1985.</li>
<li><b>Along the way we found something nobody has reported.</b> When plain LSTSVM and GBLSTSVM are tested fairly, plain LSTSVM wins. GBLSTSVM only looks better when its settings are chosen by looking at the test answers.</li>
<li><b>That finding is new, our experiments already back it up, and it still lets us present a new fuzzy model.</b> It is a safer and stronger paper than a new rule that does not beat the old ones.</li>
</ul>
</div>

<h2>1. What "fair testing" means</h2>
<p>Think of two students getting ready for an exam. Each can choose how to study. A <b>fair</b> teacher lets them practise only on practice papers, then gives the real exam once. An <b>unfair</b> teacher lets them try every way of studying, marks each try against the real exam, and keeps the best mark. The second student's mark looks great, but it says little about how they would do on a new exam.</p>
<p>A model has settings too, such as how strict it is and how the balls are built. Choosing those settings by looking at the test score is the unfair teacher. The more settings a model has, the more it gains: GBLSTSVM has 490 combinations to try, plain LSTSVM has 98.</p>

<figure>
<div class="fig-title">Average accuracy (%) on data with no flipped labels</div>
{dot_plot()}
<figcaption>Our runs: 21 datasets, each split 10 different ways. The paper used 34 datasets, so its row is a strong hint, not proof. With 30% of labels flipped, the fair test gives {f1(F30_L)} vs {f1(F30_G)}, while peeking gives {f1(P30_L)} vs {f1(P30_G)}.</figcaption>
</figure>
<p class="take">Peeking lifts both models by {min(lifts):.0f} to {max(lifts):.0f} points and closes the gap between them, and the paper's numbers sit right next to our peeking numbers. Tested fairly, plain LSTSVM wins at every noise level, by {min(fair_gaps):.0f} to {max(fair_gaps):.0f} points.</p>

<h2 class="pb">2. Why not just invent a new fuzzy rule?</h2>
<p>GBLSTSVM groups nearby points into <b>balls</b>. A fuzzy weighting rule gives each ball a trust score between 0 and 1, so that balls with wrong labels count less. So a good rule must be able to tell which balls carry wrong labels.</p>
<p>We measured exactly that. We flipped 20% of the labels on purpose and checked how well each rule gives low trust to the flipped ones. A score of 1 is perfect; 0.5 is no better than tossing a coin.</p>

<figure>
<div class="fig-title">How well each rule spots wrong labels (20% of labels flipped)</div>
{ladder()}
<figcaption>Average over 21 datasets. "Ours, new" are the two rules we invented this week; "borrowed" are rules from other fuzzy SVM papers that nobody had used on GBLSTSVM.</figcaption>
</figure>

<div class="reasons">
<div><span class="num">1</span><b>Only one idea works, and it is taken.</b> Rules built only on "do my neighbours share my label?" score {nb_lo:.2f}&ndash;0.87. Every other idea scores {other_hi:.2f} or less, some do worse than a coin, and mixing one in lowers the score. The neighbour idea was published in 1985 and used on balls in 2026.</div>
<div><span class="num">2</span><b>GBLSTSVM leaves little to fix.</b> Before any weights are used, it throws away every ball that holds a single point. That already removes {DEL_FLIPPED[0]}&ndash;{DEL_FLIPPED[1]}% of the wrong labels, so over 99% of the balls left are clean. In our first round, every weighting rule moved accuracy by about 1 point or less.</div>
<div><span class="num">3</span><b>A careful reviewer would test it fairly.</b> Our best new rule only ties the 1985 idea. A reviewer who tests it the fair way, as we did, would find no real gain over the old idea.</div>
</div>
<p class="take">This week alone we tried four more rules, two of our own and two borrowed. None beat the old neighbour idea.</p>

<h2 class="pb">3. Why the fair-testing paper is the best move now</h2>
<p>This is the paper we can write. Each of these four findings is new as far as we can find:</p>
<div class="find">
<span class="num g">1</span><p><b>A hidden clean-up step.</b> Throwing away one-point balls quietly removes {DEL_FLIPPED[0]}&ndash;{DEL_FLIPPED[1]}% of the wrong labels, but also {DEL_CLEAN[0]}&ndash;{DEL_CLEAN[1]}% of the correct points, mostly points near the border between the classes and points from the smaller class.</p>
<span class="num g">2</span><p><b>Fair testing flips the ranking.</b> Plain LSTSVM beats GBLSTSVM when both are tested fairly. The published ranking comes back only when settings are picked using the test answers.</p>
<span class="num g">3</span><p><b>One fair comparison of fuzzy rules.</b> About ten weighting rules from old and new papers, all put on GBLSTSVM and all tested the same way. It tells other researchers which ideas work and which do not.</p>
<span class="num g">4</span><p><b>A new fuzzy GBLSTSVM.</b> Keep the one-point balls and give each ball a trust score from its neighbours (we call it keep + T7). Tested fairly, it beats GBLSTSVM by {KEEP_VS_GB[0]}&ndash;{KEEP_VS_GB[1]} points and the fuzzy model GBFTSVM by {KEEP_VS_GBF[0]}&ndash;{KEEP_VS_GBF[1]} points. The trust rule is known; using it this way in GBLSTSVM is new, the same kind of novelty that GBFTSVM itself claims.</p>
</div>

<div class="cmp">
<div class="a"><h3>Option A: keep hunting for a new fuzzy rule</h3>
<ul>
<li>Needs a rule that beats a 1985 idea. We tried about ten; none did.</li>
<li>More months of work with no sign of a gain.</li>
<li>A fair reviewer is likely to find the gain disappears.</li>
</ul></div>
<div class="b"><h3>Option B: write the fair-testing paper</h3>
<ul>
<li>The experiments are done: 21 datasets, 10 splits each, 4 noise levels, careful statistics.</li>
<li>Four new findings, including a new fuzzy model.</li>
<li>Gives the lab a fair test for its next ball-based models, before reviewers apply one.</li>
</ul></div>
</div>

<p>Papers like this are respected. Demšar's 2006 paper on how to compare classifiers fairly is one of the most cited papers on machine learning methods, and "Do we need hundreds of classifiers?" (2014) is widely cited for the same kind of careful re-testing.</p>

<div class="box key">
<h3>What I need from you</h3>
<ol>
<li>Agreement to write the fair-testing paper, with keep + T7 as our new fuzzy GBLSTSVM.</li>
<li>A suggested journal or conference to aim for.</li>
</ol>
<p class="small">Working title: "Where do granular balls help least squares twin SVMs? A fair evaluation and a simple fix." All code and results are on GitHub (Jayagna/GBLSTSVM).</p>
</div>

</body></html>
"""

if __name__ == "__main__":
    html = os.path.join(HERE, "pitch.html")
    pdf = os.path.join(HERE, "Why_Evaluation_Paper.pdf")
    with open(html, "w") as f:
        f.write(HTML)
    subprocess.run([CHROME, "--headless", "--no-sandbox", "--no-pdf-header-footer", f"--print-to-pdf={pdf}", "file://" + html],
                   check=True, stdout=subprocess.DEVNULL, stderr=subprocess.DEVNULL)
    print("wrote", pdf)
