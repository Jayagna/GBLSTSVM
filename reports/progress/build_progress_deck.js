// Builds the GBLSTSVM fuzzy-membership progress deck.
// Run: NODE_PATH=<dir with pptxgenjs> node build_progress_deck.js <out.pptx>
// Update the LOG, RESULTS and DEAD_ENDS arrays as work progresses, then rebuild.
const pptxgen = require("pptxgenjs");
const path = require("path");
const { applyTheme } = require(process.env.PPTX_SKILL_DIR + "/scripts/apply_theme.js");

const OUT = process.argv[2] || "GBLSTSVM_Fuzzy_Progress.pptx";
const UPDATED = "20 Oct 2026 (GBFTSVM baseline added)";

const THEME = {
  name: "Granular Teal",
  headFontFace: "Cambria",
  bodyFontFace: "Calibri",
  colors: {
    dk1: "1B2A30", lt1: "FFFFFF", dk2: "0B3C49", lt2: "EAF3F2",
    accent1: "1B998B", accent2: "F4A259", accent3: "0B3C49",
    accent4: "BC4B51", accent5: "8CB369", accent6: "5B8E7D",
    hlink: "1B998B", folHlink: "5B8E7D",
  },
};
const HEX = THEME.colors;

const pres = new pptxgen();
pres.layout = "LAYOUT_WIDE"; // 13.33 x 7.5
pres.title = "GBLSTSVM fuzzy membership: research progress log";
pres.author = "Jayagna";
pres.theme = { headFontFace: THEME.headFontFace, bodyFontFace: THEME.bodyFontFace };
const C = pres.SchemeColor;

// ---------- layouts ----------
pres.defineSlideMaster({
  title: "TITLE_DARK",
  background: { color: C.text2 },
  objects: [
    { placeholder: { options: { name: "title", type: "title", x: 0.8, y: 2.2, w: 11.7, h: 1.6, fontSize: 40, bold: true, color: C.background1, valign: "bottom", align: "left" }, text: "" } },
    { placeholder: { options: { name: "body", type: "body", x: 0.8, y: 4.0, w: 11.7, h: 1.4, fontSize: 18, color: C.background2, valign: "top" }, text: "" } },
  ],
});
pres.defineSlideMaster({
  title: "SECTION_DARK",
  background: { color: C.text2 },
  objects: [
    { placeholder: { options: { name: "kicker", type: "body", x: 0.8, y: 2.0, w: 11.7, h: 0.6, fontSize: 18, bold: true, color: C.accent2 }, text: "" } },
    { placeholder: { options: { name: "title", type: "title", x: 0.8, y: 2.6, w: 11.7, h: 1.2, fontSize: 40, bold: true, color: C.background1, valign: "top", align: "left" }, text: "" } },
    { placeholder: { options: { name: "body", type: "body", x: 0.8, y: 3.9, w: 11.0, h: 1.4, fontSize: 18, color: C.background2, valign: "top" }, text: "" } },
  ],
});
pres.defineSlideMaster({
  title: "CONTENT",
  background: { color: C.background1 },
  margin: [0.5, 0.6, 0.7, 0.6],
  objects: [
    { placeholder: { options: { name: "title", type: "title", x: 0.6, y: 0.35, w: 12.1, h: 0.9, fontSize: 30, bold: true, color: C.text2, valign: "middle", align: "left" }, text: "" } },
    { text: { text: "GBLSTSVM fuzzy membership · progress log", options: { x: 0.6, y: 7.0, w: 8, h: 0.3, fontSize: 10, color: C.accent6 } } },
  ],
  slideNumber: { x: 12.2, y: 7.0, w: 0.6, h: 0.3, fontSize: 10, color: C.accent6, align: "right" },
});

// ---------- helpers ----------
function card(slide, x, y, w, h, opts = {}) {
  slide.addShape(pres.shapes.ROUNDED_RECTANGLE, {
    x, y, w, h, rectRadius: 0.12,
    fill: { color: opts.fill || C.background2 },
    line: { color: opts.line || opts.fill || C.background2, width: 0.75 },
    objectName: opts.name || "card",
  });
}
function badge(slide, x, y, label, color) {
  slide.addShape(pres.shapes.OVAL, { x, y, w: 0.55, h: 0.55, fill: { color }, line: { color }, objectName: "badge" });
  slide.addText(label, { x, y, w: 0.55, h: 0.55, fontSize: 16, bold: true, color: C.background1, align: "center", valign: "middle", margin: 0, isTextBox: true });
}
const tx = (text, opts) => Object.assign({ isTextBox: true, fontSize: 14, color: C.text1, valign: "top" }, opts, {});

// ================= 1. Title =================
pres.addSection({ title: "Overview" });
let s = pres.addSlide({ masterName: "TITLE_DARK", sectionTitle: "Overview" });
s.addText("Fuzzy Membership for Granular-Ball LSTSVM", { placeholder: "title" });
s.addText([
  { text: "Research progress log: everything tried, including dead ends", options: { breakLine: true } },
  { text: `Jayagna · last updated ${UPDATED}`, options: { fontSize: 14 } },
], { placeholder: "body" });
// motif: granular balls
[[10.6, 0.7, 1.3], [11.7, 1.6, 0.8], [9.9, 1.7, 0.6], [12.2, 0.6, 0.45]].forEach(([x, y, d], i) => {
  s.addShape(pres.shapes.OVAL, { x, y, w: d, h: d, fill: { color: i % 2 ? C.accent2 : C.accent1, transparency: 25 }, line: { color: C.background1, width: 1 }, objectName: "ball-motif" });
});

// ================= 2. Status at a glance =================
s = pres.addSlide({ masterName: "CONTENT", sectionTitle: "Overview" });
s.addText("Status: GBFTSVM baseline done; midsem deck ready", { placeholder: "title" });
s.addText("Goal: find a new (or not-yet-used) fuzzy membership function for GBLSTSVM that improves accuracy and robustness, and publish it.",
  tx(null, { x: 0.6, y: 1.35, w: 12.1, h: 0.6, fontSize: 16, italic: true, color: C.accent6 }));
const stats = [
  ["85%", "of flipped labels deleted by GBLSTSVM at 20% noise, along with 52% of correct points (21 datasets)", C.accent2],
  ["+4.9", "points over GBLSTSVM from keep + T7 at 30% noise, linear (10 splits, Holm p < 0.001)", C.accent1],
  ["0.25", "ROC-AUC of entropy weights at spotting flipped labels: worse than chance (T7: 0.82–0.89)", C.accent4],
  ["+5.1", "points for keep + T7 over GBFTSVM, the published fuzzy GB model, at 0% noise (+3.7 to +5.6 at 0–30%, Holm p ≤ 0.005)", C.accent3],
];
stats.forEach(([big, label, col], i) => {
  const x = 0.6 + i * 3.1;
  card(s, x, 2.2, 2.85, 3.0, { name: "stat-card" });
  s.addText(big, tx(null, { x: x + 0.2, y: 2.4, w: 2.45, h: 1.2, fontSize: 48, bold: true, color: col, fontFace: THEME.headFontFace, valign: "middle", margin: 0 }));
  s.addText(label, tx(null, { x: x + 0.2, y: 3.7, w: 2.45, h: 1.4, fontSize: 16, margin: 0 }));
});
s.addText("Analysis paper (option C), keep + T7 as the fix. GBFTSVM baseline and midsem deck done. Next: writing and two robustness checks.",
  tx(null, { x: 0.6, y: 5.6, w: 12.1, h: 0.5, fontSize: 16, bold: true, color: C.text2 }));

// ================= 3. Progress log =================
const LOG = [
  ["20 Oct 2026", "Located code on PC (Downloads › GBLSTSVM-main); GitHub repo was empty", "Pushed baseline as first commit (branch claude/project-thread-bwmgim)", "Done"],
  ["20 Oct 2026", "Read model (GBLSTSVM.py) and ball generation (gen_ball.py)", "No fuzzy logic exists; per-ball weights W1/W2 are the hook", "Done"],
  ["20 Oct 2026", "Measured ball statistics on 3 datasets", "Purity ≈ 1.0 everywhere, so purity is useless as membership", "Dead end"],
  ["20 Oct 2026", "Quick baseline run (pima, breast_cancer)", "Runs; but c1, c2, k are tuned on the test set", "Needs fix"],
  ["20 Oct 2026", "Proposed six fuzzy membership topics", "See section 3 of this deck", "Proposed"],
  ["20 Oct 2026", "Rebuilt evaluation: 5 repeated splits, 5-fold CV on train, true ROC-AUC", "No more test-set tuning (commit fe70e16)", "Done"],
  ["20 Oct 2026", "Implemented T1, T2, T4, T5 + LSTSVM reference", "fuzzy_membership.py; baseline predictions unchanged", "Done"],
  ["20 Oct 2026", "Literature check (web summaries)", "T1 published (GBFSVM); T3 close to GBFTSVM; T4, T6 look open", "Done"],
  ["20 Oct 2026", "Round 1: 21 datasets × noise 0/10/20%", "Fuzzy gains ≤ 0.8 pts; LSTSVM beats every GB variant", "Done"],
  ["20 Oct 2026", "T1 centre, T4 overlap, T5 density on pruned balls", "No gain or worse under noise", "Dead end"],
  ["20 Oct 2026", "Round 2: T6 keep deleted points, T6+T2, T6+T4, ablations", "Keeping points +3.7 pts; fuzzy on top adds nothing; radius term irrelevant", "Done"],
  ["20 Oct 2026", "Round 3: GB-induced memberships on samples (GBF-size, -overlap, -entropy)", "0.2–0.9 pts below LSTSVM, never significant", "Dead end"],
  ["20 Oct 2026", "Diagnostic: do memberships spot flipped labels?", "Entropy 0.30, overlap 0.48, singleton 0.73, neighbour agreement 0.89 (ROC-AUC)", "Done"],
  ["20 Oct 2026", "Round 4: T7 agreement on balls/samples vs kNN fuzzy LSTSVM, noise up to 30%", "T7 on all balls +2.4 over keep at 30% noise but still below LSTSVM; on samples ≈ fuzzy-kNN LSTSVM (+2 over LSTSVM at 30%)", "Done"],
  ["20 Oct 2026", "Measured what ball deletion removes at 20% noise (12 datasets)", "86% of flipped labels deleted, but also 53% of correct points", "Done"],
  ["20 Oct 2026", "Compared the Desktop copies (GBLSTSVM-main, GBLSTSVM_MATLAB)", "Python copy identical; MATLAB suite already has CW, CR, CBCM, Topo, OBRU weights and the ADPGBG generator", "Done"],
  ["20 Oct 2026", "Ported ADPGBG ball generator to Python (adpgbg.py)", "Seeded port; baselines reproduce round 4 exactly", "Done"],
  ["20 Oct 2026", "Round 5: ADPGBG balls plain, + T4, + T7, noise up to 30%", "About equal to keeping single points; still 1.3–4 pts below LSTSVM", "Dead end"],
  ["20 Oct 2026", "Timing check on NDC 5k–20k: ball-based vs point kNN weights", "Ball building 0.3–0.9 s vs point kNN 0.1–0.7 s: no speed gain", "Dead end"],
  ["20 Oct 2026", "Paper framing: A improved GBLSTSVM (+ kernel), B fuzzy LSTSVM, C analysis", "Asked Jayagna; recommended A", "Proposed"],
  ["20 Oct 2026", "Wrote a plain-language guide for Jayagna", "Desktop › FUZZY › GBLSTSVM_Fuzzy_Guide.pdf", "Done"],
  ["20 Oct 2026", "Kernel (RBF) versions of all models; CV runner run_kernel_cv.py", "Same protocol; RBF width tuned too", "Done"],
  ["20 Oct 2026", "Round 6: kernel models on 21 datasets × noise 0/20/30%", "Keep + T7 only +0.1 to +0.9 over kernel GBLSTSVM; beats kernel LSTSVM at 30% noise; fuzzy-kNN best", "Dead end"],
  ["20 Oct 2026", "Speed test on NDC 2.5k–100k (clean and 20% noise)", "Balls train in seconds; reduced-kernel LSTSVM as fast and more accurate", "Dead end"],
  ["20 Oct 2026", "Paper framing after round 6", "Recommendation changed to C (analysis paper, keep + T7 as the fix)", "Done"],
  ["20 Oct 2026", "Jayagna chose the framing", "Analysis paper (option C); draft outline in project files › paper", "Done"],
  ["20 Oct 2026", "5 more splits for linear and kernel comparisons (10 in total)", "Paper tables (CSV, LaTeX), Holm-corrected tests, CD diagrams in results/paper", "Done"],
  ["20 Oct 2026", "Noise diagnostic rerun on all 21 datasets × 5 splits × k ∈ {2, 4, 6}", "Deletion removes 85% of flipped and 52% of clean points at 20% noise; entropy AUC 0.26", "Done"],
  ["20 Oct 2026", "Implemented GBFTSVM from the PDF Jayagna saved (gbftsvm.py)", "The paper's L-BFGS-B solver stops far from the optimum on some data (ger); liblinear solves the same dual exactly", "Done"],
  ["20 Oct 2026", "Round 7: GBFTSVM, GBTWSVM, + keep, + ADPGBG; 21 datasets × 10 splits × noise 0–30%", "No better than GBLSTSVM; its fuzzy scores add nothing; keep + T7 beats it by 3.7–5.6 points (Holm p ≤ 0.005)", "Done"],
  ["20 Oct 2026", "Recorded test-set-tuned scores for every run", "Test-set tuning adds 9–15 points; paper reports 92.5% on 6 shared datasets, ours 81.4% test-tuned, 74.0% fair", "Done"],
  ["20 Oct 2026", "Midsem presentation for the professor", "Desktop › FUZZY › GBLSTSVM_Midsem_Presentation.pptx (34 slides, speaker notes)", "Done"],
];
const statusColor = { "Done": HEX.accent1, "Dead end": HEX.accent4, "Needs fix": HEX.accent2, "Proposed": HEX.accent6, "In progress": HEX.dk2 };
const head = ["Date", "What was done", "Outcome", "Status"].map(t => ({ text: t, options: { bold: true, color: HEX.lt1, fill: { color: HEX.dk2 } } }));
const LOG_PER_SLIDE = 7;
for (let i = 0; i < LOG.length; i += LOG_PER_SLIDE) {
  const chunk = LOG.slice(i, i + LOG_PER_SLIDE);
  s = pres.addSlide({ masterName: "CONTENT", sectionTitle: "Overview" });
  s.addText(i === 0 ? "Progress log" : "Progress log (continued)", { placeholder: "title" });
  const rows = [head].concat(chunk.map(([d, w, o, st]) => [
    { text: d }, { text: w }, { text: o },
    { text: st, options: { bold: true, color: statusColor[st] || HEX.dk1 } },
  ]));
  s.addTable(rows, {
    x: 0.6, y: 1.45, w: 12.1, colW: [1.5, 4.6, 4.6, 1.4],
    fontSize: 13, fontFace: THEME.bodyFontFace, color: HEX.dk1, valign: "middle",
    border: { type: "solid", color: "D5E3E1", pt: 0.75 }, fill: { color: HEX.lt1 }, rowH: 0.62, autoPage: false,
  });
}

// ================= 4. Section: baseline =================
pres.addSection({ title: "Baseline GBLSTSVM" });
s = pres.addSlide({ masterName: "SECTION_DARK", sectionTitle: "Baseline GBLSTSVM" });
s.addText("SECTION 1", { placeholder: "kicker" });
s.addText("How the baseline works", { placeholder: "title" });
s.addText("Tanveer, Sharma, Quadir & Sajid (2025), Pattern Recognition 112021: least squares twin SVM trained on granular balls instead of samples.", { placeholder: "body" });

// ================= 5. Pipeline =================
s = pres.addSlide({ masterName: "CONTENT", sectionTitle: "Baseline GBLSTSVM" });
s.addText("Pipeline: samples → balls → two closed-form planes", { placeholder: "title" });
const steps = [
  ["1", "Prepare data", "Minority class → +1, stratified 70/30 split, z-score on train stats"],
  ["2", "Grow granular balls", "Split by k-means (k = 2..6) until purity ≥ 0.985; delete balls with < 2 points"],
  ["3", "Solve two planes", "Each plane is one linear system on ball centers and radii; no QP"],
  ["4", "Predict", "Assign a test point to the plane it is closer to"],
];
steps.forEach(([n, h, d], i) => {
  const x = 0.6 + i * 3.1;
  card(s, x, 1.5, 2.85, 2.6, { name: "step-card" });
  badge(s, x + 0.2, 1.7, n, C.accent1);
  s.addText(h, tx(null, { x: x + 0.9, y: 1.7, w: 1.85, h: 0.55, fontSize: 16, bold: true, color: C.text2, valign: "middle", margin: 0 }));
  s.addText(d, tx(null, { x: x + 0.2, y: 2.45, w: 2.5, h: 1.55, fontSize: 14, margin: 0 }));
  if (i < 3) s.addShape(pres.shapes.CHEVRON, { x: x + 2.89, y: 2.6, w: 0.17, h: 0.4, fill: { color: C.accent2 }, line: { color: C.accent2 }, objectName: "arrow" });
});
card(s, 0.6, 4.45, 12.1, 2.25, { fill: C.background1, line: C.accent1, name: "equation-card" });
s.addText([
  { text: "Plane 1 (near +1 balls):  ", options: { bold: true, color: C.text2 } },
  { text: "(GᵀW₂G + (1/c₁)HᵀW₁H + δI) z₁ = −GᵀW₂(e₂ + R⁻)", options: { breakLine: true } },
  { text: "Plane 2 (near −1 balls):  ", options: { bold: true, color: C.text2 } },
  { text: "(HᵀW₁H + (1/c₂)GᵀW₂G + δI) z₂ = HᵀW₁(e₁ + R⁺)", options: { breakLine: true } },
  { text: "H = [positive centers, 1], G = [negative centers, 1], R = ball radii, W₁, W₂ = diagonal per-ball weights", options: { fontSize: 13, color: C.accent6 } },
], tx(null, { x: 0.85, y: 4.6, w: 11.6, h: 2.0, fontSize: 16, paraSpaceAfter: 8, valign: "middle" }));

// ================= 6. Code map =================
s = pres.addSlide({ masterName: "CONTENT", sectionTitle: "Baseline GBLSTSVM" });
s.addText("Code map: five files matter", { placeholder: "title" });
const files = [
  ["GBLSTSVM.py", "LSTWGBSVM(): builds W₁, W₂, solves both planes, predicts, returns metrics", "Fuzzy membership goes into W₁, W₂ here"],
  ["gen_ball.py", "GranularBall / GBList: k-means splitting, purity, mean-distance radius, ball deletion", "Compute per-ball membership here"],
  ["main.py", "CLI runner: dataset selection, k loop, c₁ × c₂ grid, unweighted vs class-imbalance variants", "Replace test-set tuning with CV"],
  ["dataset_utils.py", "Loads .csv/.txt, maps minority → +1, stratified split, standardization", "Reuse as is"],
  ["addNoisy.py", "Flips a fraction of training labels (robustness experiments)", "Use for 10% / 20% noise runs"],
];
const fhead = ["File", "What it does", "Role in fuzzy work"].map(t => ({ text: t, options: { bold: true, color: HEX.lt1, fill: { color: HEX.dk2 } } }));
s.addTable([fhead].concat(files.map(([f, d, r]) => [{ text: f, options: { bold: true, fontFace: "Courier New", color: HEX.dk2 } }, { text: d }, { text: r, options: { color: HEX.accent1, bold: true } }])), {
  x: 0.6, y: 1.45, w: 12.1, colW: [2.3, 6.1, 3.7], fontSize: 14, fontFace: THEME.bodyFontFace, color: HEX.dk1, valign: "middle",
  border: { type: "solid", color: "D5E3E1", pt: 0.75 }, fill: { color: HEX.lt1 }, rowH: 0.8, autoPage: false,
});
s.addText("Data: breast_cancer.csv plus 85 LSTSVM benchmark sets (UCI / KEEL, many imbalanced; NDC 2.5k–100k for scalability).",
  tx(null, { x: 0.6, y: 6.35, w: 12.1, h: 0.45, fontSize: 14, italic: true, color: C.accent6 }));

// ================= 7. Section: findings =================
pres.addSection({ title: "Findings" });
s = pres.addSlide({ masterName: "SECTION_DARK", sectionTitle: "Findings" });
s.addText("SECTION 2", { placeholder: "kicker" });
s.addText("What the code review found", { placeholder: "title" });
s.addText("One clear hook for fuzzy membership, one big opportunity, and three evaluation problems to fix before any result is publishable.", { placeholder: "body" });

// ================= 8. Hook =================
s = pres.addSlide({ masterName: "CONTENT", sectionTitle: "Findings" });
s.addText("No fuzzy membership yet; the per-ball weights are the hook", { placeholder: "title" });
card(s, 0.6, 1.5, 5.85, 4.2, { name: "today-card" });
s.addText("Today", tx(null, { x: 0.9, y: 1.7, w: 5.3, h: 0.5, fontSize: 20, bold: true, color: C.accent4 }));
s.addText([
  { text: "W₁ = (N⁻ / N⁺)^p · I  for positive balls", options: { bullet: true, breakLine: true } },
  { text: "W₂ = I  for negative balls", options: { bullet: true, breakLine: true } },
  { text: "Optional ball-size factor (off by default)", options: { bullet: true, breakLine: true } },
  { text: "Every ball of a class is trusted equally, however noisy or close to the other class", options: { bullet: true } },
], tx(null, { x: 0.9, y: 2.3, w: 5.3, h: 3.2, fontSize: 16, paraSpaceAfter: 10 }));
card(s, 6.85, 1.5, 5.85, 4.2, { fill: C.background1, line: C.accent1, name: "proposed-card" });
s.addText("Proposed", tx(null, { x: 7.15, y: 1.7, w: 5.3, h: 0.5, fontSize: 20, bold: true, color: C.accent1 }));
s.addText([
  { text: "W = class weight × diag(s₁ … sₖ), with sᵢ ∈ (0, 1] the fuzzy membership of ball i", options: { bullet: true, breakLine: true } },
  { text: "sᵢ computed in gen_ball.py from ball centre, radius, count and neighbours", options: { bullet: true, breakLine: true } },
  { text: "Put membership on the slack (error) term only, separate from the imbalance weight: today W₁ plays both roles", options: { bullet: true, breakLine: true } },
  { text: "Closed form is kept, so training cost barely changes", options: { bullet: true } },
], tx(null, { x: 7.15, y: 2.3, w: 5.3, h: 3.2, fontSize: 16, paraSpaceAfter: 10 }));

// ================= 9. Discarded points =================
s = pres.addSlide({ masterName: "CONTENT", sectionTitle: "Findings" });
s.addText("Ball generation throws away 35–40% of training points", { placeholder: "title" });
s.addChart(pres.charts.BAR, [{ name: "Train points kept in balls (%)", labels: ["yeast3", "pima", "breast_cancer"], values: [92, 60, 65] }], {
  x: 0.6, y: 1.5, w: 6.6, h: 5.1, barDir: "bar",
  chartColors: [HEX.accent1], showValue: true, dataLabelPosition: "outEnd", dataLabelFormatCode: "0\"%\"",
  dataLabelColor: HEX.dk1, dataLabelFontFace: "+mn-lt", dataLabelFontSize: 14,
  showTitle: true, title: "Training points kept inside a ball (%)", titleFontFace: "+mn-lt", titleFontSize: 16, titleColor: HEX.dk2,
  catAxisLabelColor: HEX.dk1, catAxisLabelFontFace: "+mn-lt", catAxisLabelFontSize: 14,
  valAxisHidden: true, valAxisMinVal: 0, valAxisMaxVal: 100,
  valGridLine: { style: "none" }, catGridLine: { style: "none" }, showLegend: false,
});
card(s, 7.6, 1.5, 5.1, 5.1, { name: "insight-card" });
s.addText([
  { text: "Why it matters", options: { bold: true, fontSize: 18, color: C.text2, breakLine: true } },
  { text: "Single-point balls are deleted, and on overlapping data those are mostly boundary and noisy points.", options: { breakLine: true } },
  { text: " ", options: { breakLine: true, fontSize: 8 } },
  { text: "Opportunity", options: { bold: true, fontSize: 18, color: C.accent1, breakLine: true } },
  { text: "Keep them with a low fuzzy membership instead of deleting them. This is exactly what fuzzy SVMs are for, and it is GB-specific.", options: { breakLine: true } },
  { text: " ", options: { breakLine: true, fontSize: 8 } },
  { text: "Also: every kept ball has purity ≥ 0.985 (yeast3) or exactly 1.0 (the other two).", options: { italic: true, color: C.accent6 } },
], tx(null, { x: 7.85, y: 1.7, w: 4.6, h: 4.7, fontSize: 15 }));

// ================= 10. Evaluation issues =================
s = pres.addSlide({ masterName: "CONTENT", sectionTitle: "Findings" });
s.addText("Three evaluation problems to fix before publishing", { placeholder: "title" });
const issues = [
  ["!", "Tuned on the test set", "c₁, c₂ and k are chosen by the best test score. Reported numbers are optimistic and reviewers will reject them.", "Fix: 5-fold CV on the training split, then a single test evaluation"],
  ["1×", "One split, one seed", "No mean ± std, so no significance tests (Friedman, Nemenyi, Wilcoxon) are possible.", "Fix: 10 repeated stratified splits, report mean ± std"],
  ["≠", "“AUC” is not AUC", "The auc field is balanced accuracy (sens + spec) / 2.", "Fix: rename it and add true ROC-AUC from the plane-distance score"],
];
issues.forEach(([ic, h, d, f], i) => {
  const x = 0.6 + i * 4.1;
  card(s, x, 1.5, 3.85, 4.4, { name: "issue-card" });
  badge(s, x + 0.25, 1.75, ic, C.accent4);
  s.addText(h, tx(null, { x: x + 0.95, y: 1.75, w: 2.75, h: 0.55, fontSize: 18, bold: true, color: C.text2, valign: "middle", margin: 0 }));
  s.addText(d, tx(null, { x: x + 0.25, y: 2.6, w: 3.35, h: 2.1, fontSize: 15, margin: 0 }));
  s.addText(f, tx(null, { x: x + 0.25, y: 4.3, w: 3.35, h: 1.4, fontSize: 15, bold: true, color: C.accent1, margin: 0 }));
});

// ================= 11. Baseline numbers =================
const RESULTS = [
  ["pima", "Unweighted", "2", "76.19", "0.785"],
  ["pima", "Class-imbalance weighted", "3", "79.22", "0.783"],
  ["breast_cancer", "Both variants", "2", "73.26", "0.743"],
];
s = pres.addSlide({ masterName: "CONTENT", sectionTitle: "Findings" });
s.addText("Quick baseline check: the code runs end to end", { placeholder: "title" });
const rhead = ["Dataset", "Variant", "Best k", "Accuracy (%)", "Balanced acc."].map(t => ({ text: t, options: { bold: true, color: HEX.lt1, fill: { color: HEX.dk2 } } }));
s.addTable([rhead].concat(RESULTS.map(r => r.map(v => ({ text: v })))), {
  x: 0.6, y: 1.5, w: 7.8, colW: [1.7, 2.6, 0.9, 1.3, 1.3], fontSize: 14, fontFace: THEME.bodyFontFace, color: HEX.dk1, valign: "middle",
  border: { type: "solid", color: "D5E3E1", pt: 0.75 }, fill: { color: HEX.lt1 }, rowH: 0.6, autoPage: false,
});
card(s, 8.8, 1.5, 3.9, 2.4, { fill: "FDF1E6", line: HEX.accent2, name: "caveat-card" });
s.addText([
  { text: "Caveat", options: { bold: true, fontSize: 18, color: C.text2, breakLine: true } },
  { text: "Single 70/30 split, k ∈ {2, 3} only, c₁ and c₂ picked on the test set. These are sanity numbers, not results for the paper.", options: {} },
], tx(null, { x: 9.05, y: 1.65, w: 3.4, h: 2.15, fontSize: 15 }));

// ================= 12. Section: topics =================
pres.addSection({ title: "Proposed topics" });
s = pres.addSlide({ masterName: "SECTION_DARK", sectionTitle: "Proposed topics" });
s.addText("SECTION 3", { placeholder: "kicker" });
s.addText("Fuzzy functions we can work on now", { placeholder: "title" });
s.addText("Six ball-level membership functions, from a safe baseline to GB-native ideas. Novelty must be confirmed by a literature check before we claim it.", { placeholder: "body" });

// ================= 13. Six topics grid =================
const TOPICS = [
  ["T1", "Centre-distance", "Ball far from its class centre → lower membership (Lin & Wang FSVM, at ball level).", "Published", "Easy"],
  ["T2", "Neighbour entropy", "High class entropy among the k nearest balls → lower membership (EFSVM-style, suits imbalance).", "Medium", "Easy"],
  ["T3", "Intuitionistic fuzzy", "Membership from distance plus non-membership from opposite-class neighbours (IF-TSVM idea).", "Low–med", "Medium"],
  ["T4", "Ball overlap", "Down-weight a ball by how deeply its sphere overlaps opposite-class spheres. Uses radii.", "High", "Easy"],
  ["T5", "Density / compactness", "Many points in a small radius → trusted; few points spread wide → not.", "Med–high", "Easy"],
  ["T6", "Recover deleted points", "Keep single-point balls with low membership instead of deleting them.", "High", "Medium"],
];
s = pres.addSlide({ masterName: "CONTENT", sectionTitle: "Proposed topics" });
s.addText("Six candidate membership functions", { placeholder: "title" });
TOPICS.forEach(([id, name, idea, nov, eff], i) => {
  const col = i % 3, row = Math.floor(i / 3);
  const x = 0.6 + col * 4.1, y = 1.4 + row * 2.55;
  const hi = (id === "T1" || id === "T2" || id === "T4");
  card(s, x, y, 3.85, 2.35, hi ? { fill: C.background1, line: C.accent1, name: "topic-card" } : { name: "topic-card" });
  badge(s, x + 0.2, y + 0.2, id, hi ? C.accent1 : C.accent6);
  s.addText(name, tx(null, { x: x + 0.9, y: y + 0.2, w: 2.8, h: 0.55, fontSize: 17, bold: true, color: C.text2, valign: "middle", margin: 0 }));
  s.addText(idea, tx(null, { x: x + 0.2, y: y + 0.85, w: 3.45, h: 1.05, fontSize: 14, margin: 0 }));
  s.addText([
    { text: "Novelty: ", options: { bold: true } }, { text: nov + "   " },
    { text: "Effort: ", options: { bold: true } }, { text: eff },
  ], tx(null, { x: x + 0.2, y: y + 1.9, w: 3.45, h: 0.35, fontSize: 13, color: C.accent6, margin: 0 }));
});
s.addText("Teal outline = first batch to implement (T1 baseline, T2, T4).", tx(null, { x: 0.6, y: 6.5, w: 12.1, h: 0.35, fontSize: 13, italic: true, color: C.accent6 }));

// ================= 14. Formulas for first batch =================
s = pres.addSlide({ masterName: "CONTENT", sectionTitle: "Proposed topics" });
s.addText("First batch: formulas", { placeholder: "title" });
const FORMULAS = [
  ["T1  Centre-distance", [
    "dᵢ = ‖cᵢ − ōᵧ‖",
    "ōᵧ = count-weighted class-y centre",
    "sᵢ = 1 − dᵢ / (max dⱼ + δ)",
  ], "Classic FSVM baseline; expected to help only mildly"],
  ["T2  Neighbour entropy", [
    "pᵢ⁺, pᵢ⁻ = count-weighted class shares among the k nearest balls",
    "Hᵢ = −Σ p log p",
    "sᵢ = max(σ, 1 − Hᵢ / log 2)",
  ], "Minority balls keep sᵢ = 1, as in EFSVM"],
  ["T4  Ball overlap", [
    "oᵢⱼ = max(0, rᵢ + rⱼ − ‖cᵢ − cⱼ‖), j in the other class",
    "sᵢ = exp(−λ Σⱼ oᵢⱼ / (rᵢ + ε))",
  ], "Uses ball radii, so it has no point-based counterpart"],
];
FORMULAS.forEach(([h, lines, note], i) => {
  const x = 0.6 + i * 4.1;
  card(s, x, 1.5, 3.85, 4.6, { name: "formula-card" });
  s.addText(h, tx(null, { x: x + 0.25, y: 1.7, w: 3.35, h: 0.55, fontSize: 19, bold: true, color: C.accent1, margin: 0 }));
  s.addText(lines.map((l, j) => ({ text: l, options: { breakLine: j < lines.length - 1 } })),
    tx(null, { x: x + 0.25, y: 2.45, w: 3.35, h: 2.4, fontSize: 17, paraSpaceAfter: 12, margin: 0 }));
  s.addText(note, tx(null, { x: x + 0.25, y: 4.95, w: 3.35, h: 0.95, fontSize: 15, italic: true, color: C.accent6, margin: 0 }));
});

// ================= Literature check =================
const LIT = [
  ["T1 centre-distance", "GBFSVM in Granular Ball Computing (arXiv 2304.11171); GB fuzzy set in SVM (arXiv 2210.11675)", "Published: baseline only"],
  ["T3 intuitionistic", "GBFTSVM (arXiv 2408.00699, IEEE 10935634): Pythagorean membership + non-membership on GB twin SVM", "Close prior work"],
  ["T2 entropy", "INGB (arXiv 2307.01224) uses entropy to pick minority balls for oversampling", "Not as a membership"],
  ["T4 overlap", "OBRU in your group's MATLAB suite is the same weight; GBSVM deletes overlapping balls; TWHGBS re-samples by overlap", "Close prior work"],
  ["T5 density", "GBFRVFL (arXiv 2609.29670): radius, variance and sparsity terms on an RVFL network", "Partly overlapping"],
  ["T6 keep deleted", "Nothing found", "Looks open"],
  ["T7 agreement", "Classic fuzzy kNN membership on points (Keller 1985); CBCM and Topo in the MATLAB suite favour 50/50 neighbourhoods instead", "Partly overlapping"],
];
s = pres.addSlide({ masterName: "CONTENT", sectionTitle: "Proposed topics" });
s.addText("Literature check: T6 looks open; T1 and T4 are taken", { placeholder: "title" });
const lhead = ["Topic", "Closest prior work found", "Novelty"].map(t => ({ text: t, options: { bold: true, color: HEX.lt1, fill: { color: HEX.dk2 } } }));
const litColor = (v) => v.startsWith("Looks open") ? HEX.accent1 : v.startsWith("Published") || v.startsWith("Close") ? HEX.accent4 : HEX.accent6;
s.addTable([lhead].concat(LIT.map(([t, w, v]) => [{ text: t, options: { bold: true } }, { text: w }, { text: v, options: { bold: true, color: litColor(v) } }])), {
  x: 0.6, y: 1.45, w: 12.1, colW: [2.2, 7.5, 2.4], fontSize: 12, fontFace: THEME.bodyFontFace, color: HEX.dk1, valign: "middle",
  border: { type: "solid", color: "D5E3E1", pt: 0.75 }, fill: { color: HEX.lt1 }, rowH: 0.5, autoPage: false,
});
s.addText("GBFTSVM read in full from the PDF Jayagna saved, reimplemented and run as a baseline (E14). The other rows come from web-search summaries.",
  tx(null, { x: 0.6, y: 6.05, w: 12.1, h: 0.6, fontSize: 13, italic: true, color: C.accent6 }));

// ================= 15. Experiment plan =================
s = pres.addSlide({ masterName: "CONTENT", sectionTitle: "Proposed topics" });
s.addText("Experiment plan for a publishable comparison", { placeholder: "title" });
const plan = [
  ["Protocol", "10 stratified 70/30 splits; c₁, c₂, k and membership parameters tuned by 5-fold CV on the training part only"],
  ["Datasets", "About 15 imbalanced and overlapping sets (ecoli, glass, yeast, pima, haberman, …) plus NDC for timing"],
  ["Noise", "0%, 10% and 20% label noise via addNoisy.py, applied to training labels only"],
  ["Metrics", "Accuracy, true ROC-AUC, G-mean, F1, training time"],
  ["Baselines", "GBLSTSVM (unweighted), GBLSTSVM + class weights, LSTSVM on raw samples"],
  ["Statistics", "Average ranks, Friedman + Nemenyi, Wilcoxon signed-rank vs. best baseline"],
];
plan.forEach(([h, d], i) => {
  const y = 1.45 + i * 0.88;
  card(s, 0.6, y, 12.1, 0.76, { name: "plan-row" });
  s.addText(h, tx(null, { x: 0.85, y, w: 2.2, h: 0.76, fontSize: 16, bold: true, color: C.text2, valign: "middle", margin: 0 }));
  s.addText(d, tx(null, { x: 3.1, y, w: 9.4, h: 0.76, fontSize: 15, valign: "middle", margin: 0 }));
});

// ================= Experiments =================
// To log an experiment, append one object to EXPERIMENTS and rebuild; each gets its own slide.
// verdict: "pending" | "keep" | "drop" (dropped ones should also go into DEAD_ENDS).
const ROUND1 = { // mean balanced accuracy (%) over 21 datasets × 5 splits, CV-tuned
  methods: ["GBLSTSVM", "T1 centre", "T2 entropy", "T4 overlap", "T5 density", "LSTSVM (raw)"],
  noise0: [73.4, 73.7, 74.2, 73.5, 73.6, 80.7],
  noise10: [73.2, 73.6, 73.2, 73.7, 71.8, 77.8],
  noise20: [72.0, 69.7, 71.3, 70.4, 70.6, 76.2],
};
const EXPERIMENTS = [
  {
    id: "E0", name: "LSTSVM on raw samples (reference)", date: "20 Oct 2026",
    idea: "Same closed-form solver, but every training sample is a ball of radius 0. Shows what the granular-ball step costs or gains.",
    setup: "21 datasets, label noise 0/10/20%, 5 stratified 70/30 splits; k, c₁, c₂ and class weighting chosen by 5-fold CV on train. Commit fe70e16.",
    results: "Balanced accuracy 80.7 vs 73.4 (0%), 77.8 vs 73.2 (10%), 76.2 vs 72.0 (20%) for GBLSTSVM. Better on 20, 16 and 18 of 21 datasets (Wilcoxon p ≤ 0.001).",
    verdict: "keep", verdictNote: "Key finding: the ball step loses accuracy, so the fuzzy work must fix that step.",
  },
  {
    id: "E1", name: "T1 centre-distance membership", date: "20 Oct 2026",
    idea: "A ball far from its class centre gets a lower membership (Lin & Wang FSVM at ball level). Already published as GBFSVM.",
    setup: "Same protocol as E0; membership on the slack term only; no extra parameter.",
    results: "73.7 vs 73.4 (0%), 73.6 vs 73.2 (10%), 69.7 vs 72.0 (20%). No significant gain (p ≥ 0.15). Worst: abalone9-18 at 20% noise, −18.6 points.",
    verdict: "drop", verdictNote: "Keep only as the published fuzzy baseline.",
  },
  {
    id: "E2", name: "T2 neighbour-entropy membership", date: "20 Oct 2026",
    idea: "Majority balls whose k nearest balls are class-mixed get a lower membership; minority balls stay at 1 (EFSVM idea, at ball level).",
    setup: "Same protocol as E0; k_nn ∈ {5, 10} tuned by CV.",
    results: "74.2 vs 73.4 at 0% noise (p = 0.044, 14 wins / 5 losses; best ecoli2 +4.7). No gain at 10% (73.2) or 20% (71.3 vs 72.0).",
    verdict: "pending", verdictNote: "Only significant gain so far; retest on all balls (T6+T2).",
  },
  {
    id: "E3", name: "T4 ball-overlap membership", date: "20 Oct 2026",
    idea: "Down-weight a ball by how deeply its sphere overlaps spheres of the other class. Uses radii, so it is GB-specific.",
    setup: "Same protocol as E0; λ ∈ {0.5, 1, 2, 4} tuned by CV.",
    results: "73.5 vs 73.4 (0%), 73.7 vs 73.2 (10%), 70.4 vs 72.0 at 20% noise (p = 0.010, 5 wins / 15 losses).",
    verdict: "drop", verdictNote: "Hurts on the pruned ball set; retest on all balls (T6+T4).",
  },
  {
    id: "E4", name: "T5 density membership", date: "20 Oct 2026",
    idea: "Many samples in a small radius → trusted; few samples spread wide → down-weighted.",
    setup: "Same protocol as E0; γ ∈ {0.25, 0.5, 1} tuned by CV.",
    results: "73.6 vs 73.4 (0%), 71.8 vs 73.2 at 10% noise (p = 0.049, 6 wins / 13 losses), 70.6 vs 72.0 (20%).",
    verdict: "drop", verdictNote: "Unstable for balls with only 2–3 points.",
  },
  {
    id: "E5", name: "T6 keep deleted points + ablations", date: "20 Oct 2026",
    idea: "Keep single-point balls with a low membership instead of deleting them; combine with T2 and T4. Ablations: no deletion without weights, radii set to 0.",
    setup: "Same protocol as E0; single-point weight ∈ {0.05, 0.2, 0.5}; commit c55d57c.",
    results: "No deletion (GB-keep): 77.1 vs 73.4 at 0% noise (p = 0.001, 18/3), via minority recall 0.74 vs 0.65. T6 weights on top: 77.7, 77.6, 77.1 (vs GB-keep p ≥ 0.3). At 10%/20% noise all within 1–2 points. Radius term: no effect.",
    verdict: "drop", verdictNote: "Keeping points helps, but fuzzy weighting of balls adds nothing; LSTSVM still +3 points.",
  },
];
EXPERIMENTS.push({
  id: "E6", name: "GB-induced fuzzy LSTSVM (GBF-*)", date: "20 Oct 2026",
  idea: "Train LSTSVM on all samples; use the granular balls only to give each sample a membership: singleton ball (GBF-size), overlap of its ball with the other class (GBF-overlap), or neighbour entropy (GBF-entropy).",
  setup: "Same protocol as E0; compared against LSTSVM, GBLSTSVM and GB-keep. Commit 7aed1f8.",
  results: "Balanced accuracy vs LSTSVM: 80.2–80.5 vs 80.7 (0%), 77.4–77.7 vs 77.8 (10%), 75.4–75.8 vs 76.2 (20%). All differences under 1 point and not significant (p ≥ 0.10).",
  verdict: "drop", verdictNote: "These memberships do not single out noisy points (see E7).",
});
EXPERIMENTS.push({
  id: "E7", name: "Diagnostic: which memberships spot flipped labels?", date: "20 Oct 2026",
  idea: "Flip 10% / 20% of training labels, then score each membership by how well a low value flags a flipped sample (ROC-AUC; 0.5 = random).",
  setup: "8 datasets (pima, wdbc, heart-stat, yeast3, ecoli2, vehicle2, haberman, ger), split seed 0, ball k ∈ {2, 4, 6}.",
  results: "Singleton ball 0.70–0.75; ball overlap 0.48; neighbour entropy 0.30–0.34 (worse than random: it rewards a pure neighbourhood even when it disagrees with the point's own label). Own-class share among the 10 nearest balls: 0.88–0.90, same as sample kNN.",
  verdict: "keep", verdictNote: "Explains E1–E6 and motivates T7 neighbour agreement.",
});
EXPERIMENTS.push({
  id: "E8", name: "T7 neighbour-agreement membership", date: "20 Oct 2026",
  idea: "sᵢ = (count-weighted share of ball i's own class among its k nearest balls)^γ. Applied to pruned balls, all balls, or each sample via its ball; compared to classic kNN fuzzy LSTSVM.",
  setup: "Same protocol as E0 plus 30% noise; k ∈ {5, 10}, γ ∈ {1, 3} tuned by CV. Commit ddaf9f6.",
  results: "Balanced accuracy at 0/10/20/30% noise. T7 on pruned balls: 73.9/73.8/71.3/65.4 (GBLSTSVM 73.4/73.2/72.0/65.2). T7 on all balls: 77.5/75.9/73.8/68.6, +2.4 over GB-keep at 30% (p = 0.029). T7 on samples via balls: 79.9/78.5/75.9/71.3. LSTSVM 80.7/77.8/76.2/69.2; fuzzy-kNN LSTSVM 80.4/78.4/77.3/71.1.",
  verdict: "keep", verdictNote: "Works on samples (+2.1 over LSTSVM at 30%, p = 0.016) but so does the known fuzzy-kNN LSTSVM; on balls it stays below LSTSVM.",
});
EXPERIMENTS.push({
  id: "E9", name: "Desktop copies and the group's MATLAB suite", date: "20 Oct 2026",
  idea: "Compare our baseline with the Desktop GBLSTSVM-main and GBLSTSVM_MATLAB (Garv Jindal's port of Toast24/GBLSTSVM-Ex) and check its weights for overlap with our topics.",
  setup: "Diffed the Python files; read GBLSTSVM.m (CW, CR, CBCM, Topo, OBRU variants), gen_balls.m, adpgbg_gen_balls.m and the two-moons benchmark.",
  results: "Desktop Python copy is identical to ours. OBRU = our T4. CBCM and Topo peak at 50/50 neighbourhoods, unlike T7. Benchmark: one synthetic dataset, one split, fixed c1 = 1, c2 = 0.1; ADPGBG balls 95% vs k-means 71%.",
  verdict: "keep", verdictNote: "T4 is not novel; the ball generator matters more than the weights, so test ADPGBG (E10).",
});
EXPERIMENTS.push({
  id: "E10", name: "ADPGBG balls (+ T4, + T7)", date: "20 Oct 2026",
  idea: "Build balls by shortest heterogeneous distance (Liao et al. 2025): each ball grows to the nearest point of the other class; isolated points are dropped as outliers. No k, no purity threshold.",
  setup: "Python port adpgbg.py (seeded). Same protocol as E8 at 0–30% noise; compared with GBLSTSVM, LSTSVM and fuzzy-kNN LSTSVM.",
  results: "Balanced accuracy at 0/10/20/30% noise. ADPGBG: 76.6/76.5/72.3/66.3; + T4: 76.6/75.6/71.7/65.7; + T7: 76.0/75.8/73.4/68.2. Keep single points: 77.1/75.7/73.0/66.3. LSTSVM 80.7/77.8/76.2/69.2. Best ball model at 10% noise is ADPGBG, still 1.3 below LSTSVM (p = 0.079).",
  verdict: "drop", verdictNote: "No better than keeping single points; the two-moons gain in the MATLAB suite does not carry over.",
});

EXPERIMENTS.push({
  id: "E11", name: "Round 6: kernel (RBF) versions", date: "20 Oct 2026",
  idea: "Map every ball set to RBF features K(x, C), C = ball centres (all samples for LSTSVM), and solve the same twin systems. Tests whether balls pay off where boundaries curve.",
  setup: "21 datasets, noise 0/20/30%, 5 splits; RBF width g/d with g ∈ {0.25, 1, 4} tuned by CV with c₁, c₂, k, class weights. run_kernel_cv.py, results/kernel_cv_v1.",
  results: "Balanced accuracy at 0/20/30%: kernel GBLSTSVM 78.2/70.8/63.5; keep 78.5/68.9/62.1; keep + T7 79.1/70.9/64.1; kernel LSTSVM 80.9/70.1/61.9; kernel fuzzy-kNN 81.3/73.6/66.2. Keep + T7 vs kernel GBLSTSVM p ≥ 0.5; vs kernel LSTSVM +2.3 at 30% (p = 0.026), −1.7 at 0% (p = 0.038).",
  verdict: "drop", verdictNote: "The linear-model fix does not carry over; fuzzy-kNN weights beat every ball model (p ≤ 0.022).",
});
EXPERIMENTS.push({
  id: "E12", name: "Speed on large data (NDC 2.5k–100k)", date: "20 Oct 2026",
  idea: "Time kernel ball models against kernel LSTSVM on all points and reduced-kernel LSTSVM (random points as kernel columns, as many as the kept balls).",
  setup: "NDC files (the one named 1m holds 100,000 points), one 70/30 split, c = 1, γ = 1/d, 4 CPU cores; times include ball building. run_kernel_timing.py.",
  results: "Clean: balls 0.2–12 s up to 70k points; kernel LSTSVM 60 s at 10.5k, not run beyond (73 GB at 70k). Reduced kernel: similar speed, 0.5–3 points more accurate. At 20% noise kept balls ≈ 70% of points; kernel GBLSTSVM is 0.1–0.6 below reduced-kernel fuzzy-kNN from 28k up, 3–8× faster.",
  verdict: "drop", verdictNote: "Speed alone is not a selling point; under noise, deletion (not fuzzy weights) is what pays off.",
});

EXPERIMENTS.push({
  id: "E13", name: "Final numbers for the paper (10 splits)", date: "20 Oct 2026",
  idea: "Firm up every comparison the paper uses: 5 more splits (10 in total), Holm-corrected Wilcoxon tests, Friedman + Nemenyi critical-difference diagrams, and the noise diagnostic on all 21 datasets.",
  setup: "--first-repeat 5 runs (fuzzy_cv_v6, kernel_cv_v2) merged with v4/v5 and kernel_cv_v1; paper_tables.py, noise_diagnostics.py.",
  results: "Keep + T7 vs GBLSTSVM, linear: +3.3/+2.6/+2.8/+4.9 at 0/10/20/30% (Holm p 0.001/0.09/0.034/<0.001); ties LSTSVM at 30%. Kernel: +2.1 on clean data (p = 0.06), none under noise. Fuzzy-kNN LSTSVM beats it everywhere. Deletion: 88/85/82% of flipped, 41/52/60% of clean points.",
  verdict: "keep", verdictNote: "These are the numbers the paper quotes; the story from rounds 1–6 holds.",
});

EXPERIMENTS.push({
  id: "E14", name: "GBFTSVM baseline (round 7)", date: "20 Oct 2026",
  idea: "GBFTSVM (Zhao et al., arXiv 2408.00699) is the closest published model: a classic twin SVM on granular balls with Pythagorean fuzzy scores. Does it beat GBLSTSVM under a fair test, and does keep + T7 beat it?",
  setup: "Reimplemented from the PDF (gbftsvm.py), dual solved exactly with liblinear. 21 datasets, 10 splits, noise 0–30%, c and C from the paper's grid 2⁻⁵…2⁵ by 5-fold CV. Ablations: no fuzzy scores (GBTWSVM), keep single points, ADPGBG balls. results/gbftsvm_cv.",
  results: "GBFTSVM 71.7/72.2/68.3/64.2 vs GBLSTSVM 73.5/73.3/71.0/64.0 at 0/10/20/30%. Fuzzy scores vs none: −1.2 to +0.7, never significant (≥ 99% of balls pure, where the score equals T1). Keep lifts it 1.8–4.5. Keep + T7 beats it by 5.1/3.7/5.6/4.7 (Holm p ≤ 0.005).",
  verdict: "keep", verdictNote: "The baseline a reviewer asks for first; our fix wins, and the paper's high numbers come from test-set tuning (+9–15 points).",
});

const KERNEL = { // mean balanced accuracy (%), 21 datasets × 5 splits, CV-tuned, RBF kernel
  noise: ["0%", "20%", "30%"],
  series: [
    ["Kernel GBLSTSVM", [78.2, 70.8, 63.5]],
    ["Kernel keep + T7", [79.1, 70.9, 64.1]],
    ["Kernel LSTSVM", [80.9, 70.1, 61.9]],
    ["Kernel fuzzy-kNN LSTSVM", [81.3, 73.6, 66.2]],
  ],
};
const TIMING_CLEAN = [["1,750", "0.2 s · 96.9%", "0.2 s · 97.3%", "1.2 s · 98.7%", "0.0 s · 98.4%"], ["3,500", "0.3 s · 96.1%", "0.4 s · 97.1%", "4.6 s · 98.8%", "0.1 s · 99.2%"], ["7,000", "0.6 s · 97.3%", "0.7 s · 97.4%", "25 s · 99.1%", "0.3 s · 98.8%"], ["10,500", "0.9 s · 98.3%", "1.1 s · 98.5%", "60 s · 99.5%", "0.4 s · 99.3%"], ["14,000", "1.0 s · 98.4%", "1.1 s · 98.8%", "skipped", "0.9 s · 99.3%"], ["28,000", "1.3 s · 98.1%", "1.6 s · 98.1%", "skipped", "1.9 s · 99.3%"], ["42,000", "1.3 s · 98.5%", "1.7 s · 98.7%", "skipped", "2.9 s · 99.5%"], ["56,000", "1.5 s · 98.5%", "1.6 s · 99.0%", "skipped", "3.5 s · 99.8%"], ["70,000", "5.4 s · 98.3%", "12 s · 98.4%", "skipped", "36 s · 99.1%"]];
const TIMING_NOISY = [["1,750", "0.8 s · 91.9%", "1.0 s · 85.9%", "0.6 s · 83.3%", "0.1 s · 84.6%", "0.2 s · 89.8%"], ["3,500", "1.3 s · 94.2%", "3.0 s · 90.0%", "5.0 s · 88.2%", "0.9 s · 89.2%", "2.2 s · 94.7%"], ["7,000", "3.0 s · 94.9%", "11 s · 93.0%", "22 s · 92.2%", "5.8 s · 92.7%", "12 s · 95.7%"], ["10,500", "5.3 s · 95.8%", "33 s · 94.6%", "58 s · 93.5%", "16 s · 94.0%", "32 s · 96.7%"], ["14,000", "6.5 s · 97.0%", "61 s · 95.3%", "skipped", "46 s · 95.3%", "65 s · 97.6%"], ["28,000", "15 s · 96.6%", "skipped", "skipped", "94 s · 94.8%", "118 s · 96.7%"], ["42,000", "32 s · 98.6%", "skipped", "skipped", "117 s · 98.4%", "171 s · 99.2%"], ["56,000", "63 s · 99.1%", "skipped", "skipped", "136 s · 99.1%", "204 s · 99.5%"], ["70,000", "97 s · 97.6%", "skipped", "skipped", "166 s · 97.5%", "263 s · 98.2%"]];

const DETECT = {
  methods: ["Neighbour entropy (T2)", "Ball overlap (T4)", "Singleton ball (T6)", "Sample kNN (classic)", "Ball agreement (T7)"],
  noise10: [0.33, 0.48, 0.75, 0.89, 0.90],
  noise20: [0.30, 0.48, 0.70, 0.88, 0.88],
};
const ROUND2 = {
  methods: ["GBLSTSVM", "GB-keep", "T6 keep", "T6+T2", "T6+T4", "LSTSVM (raw)"],
  noise0: [73.4, 77.1, 77.7, 77.6, 77.1, 80.7],
  noise10: [73.2, 75.7, 76.0, 74.9, 74.9, 77.8],
  noise20: [72.0, 73.0, 72.5, 72.6, 72.9, 76.2],
};
const VERDICT_COLOR = { pending: C.accent2, keep: C.accent5, drop: C.accent4 };

pres.addSection({ title: "Experiments" });
s = pres.addSlide({ masterName: "CONTENT", sectionTitle: "Experiments" });
s.addText("Round 1: fuzzy weights move GBLSTSVM by under a point", { placeholder: "title" });
s.addChart(pres.charts.BAR, [
  { name: "0% noise", labels: ROUND1.methods, values: ROUND1.noise0 },
  { name: "10% noise", labels: ROUND1.methods, values: ROUND1.noise10 },
  { name: "20% noise", labels: ROUND1.methods, values: ROUND1.noise20 },
], {
  x: 0.6, y: 1.4, w: 8.3, h: 5.3, barDir: "col", barGapWidthPct: 60,
  chartColors: [HEX.dk2, HEX.accent1, HEX.accent2],
  showValue: true, dataLabelPosition: "outEnd", dataLabelFormatCode: "0.0", dataLabelColor: HEX.dk1, dataLabelFontFace: "+mn-lt", dataLabelFontSize: 10,
  showTitle: true, title: "Mean balanced accuracy (%), 21 datasets × 5 splits", titleFontFace: "+mn-lt", titleFontSize: 14, titleColor: HEX.dk2,
  catAxisLabelColor: HEX.dk1, catAxisLabelFontFace: "+mn-lt", catAxisLabelFontSize: 12,
  valAxisMinVal: 60, valAxisMaxVal: 85, valAxisLabelColor: HEX.dk1, valAxisLabelFontFace: "+mn-lt", valAxisLabelFontSize: 11,
  valGridLine: { color: "D5E3E1", size: 0.5 }, catGridLine: { style: "none" },
  showLegend: true, legendPos: "b", legendFontFace: "+mn-lt", legendFontSize: 12, legendColor: HEX.dk1,
});
card(s, 9.2, 1.4, 3.5, 5.3, { name: "round1-insight" });
s.addText([
  { text: "What it shows", options: { bold: true, fontSize: 17, color: C.text2, breakLine: true } },
  { text: "Every fuzzy variant stays within about a point of GBLSTSVM; only T2 at 0% noise is significant.", options: { breakLine: true } },
  { text: " ", options: { breakLine: true, fontSize: 6 } },
  { text: "Plain LSTSVM on raw samples is 4–7 points better at every noise level.", options: { bold: true, color: C.accent4, breakLine: true } },
  { text: " ", options: { breakLine: true, fontSize: 6 } },
  { text: "So the loss happens when samples become balls, not in how balls are weighted.", options: {} },
], tx(null, { x: 9.45, y: 1.6, w: 3.0, h: 4.9, fontSize: 15 }));

s = pres.addSlide({ masterName: "CONTENT", sectionTitle: "Experiments" });
s.addText("Round 2: keeping deleted points helps; fuzzy weights do not", { placeholder: "title" });
s.addChart(pres.charts.BAR, [
  { name: "0% noise", labels: ROUND2.methods, values: ROUND2.noise0 },
  { name: "10% noise", labels: ROUND2.methods, values: ROUND2.noise10 },
  { name: "20% noise", labels: ROUND2.methods, values: ROUND2.noise20 },
], {
  x: 0.6, y: 1.4, w: 8.3, h: 5.3, barDir: "col", barGapWidthPct: 60,
  chartColors: [HEX.dk2, HEX.accent1, HEX.accent2],
  showValue: true, dataLabelPosition: "outEnd", dataLabelFormatCode: "0.0", dataLabelColor: HEX.dk1, dataLabelFontFace: "+mn-lt", dataLabelFontSize: 10,
  showTitle: true, title: "Mean balanced accuracy (%), 21 datasets × 5 splits", titleFontFace: "+mn-lt", titleFontSize: 14, titleColor: HEX.dk2,
  catAxisLabelColor: HEX.dk1, catAxisLabelFontFace: "+mn-lt", catAxisLabelFontSize: 12,
  valAxisMinVal: 60, valAxisMaxVal: 85, valAxisLabelColor: HEX.dk1, valAxisLabelFontFace: "+mn-lt", valAxisLabelFontSize: 11,
  valGridLine: { color: "D5E3E1", size: 0.5 }, catGridLine: { style: "none" },
  showLegend: true, legendPos: "b", legendFontFace: "+mn-lt", legendFontSize: 12, legendColor: HEX.dk1,
});
card(s, 9.2, 1.4, 3.5, 5.3, { name: "round2-insight" });
s.addText([
  { text: "What it shows", options: { bold: true, fontSize: 17, color: C.text2, breakLine: true } },
  { text: "Not deleting single-point balls lifts GBLSTSVM by 3.7 points at 0% noise, mostly by recovering minority recall.", options: { breakLine: true } },
  { text: " ", options: { breakLine: true, fontSize: 6 } },
  { text: "Fuzzy weights on top add at most 0.6 points, never significant.", options: { bold: true, color: C.accent4, breakLine: true } },
  { text: " ", options: { breakLine: true, fontSize: 6 } },
  { text: "Next idea: keep every sample and use balls only to set memberships (E6).", options: {} },
], tx(null, { x: 9.45, y: 1.6, w: 3.0, h: 4.9, fontSize: 15 }));

s = pres.addSlide({ masterName: "CONTENT", sectionTitle: "Experiments" });
s.addText("Why fuzzy weights failed: they did not find noisy points", { placeholder: "title" });
s.addChart(pres.charts.BAR, [
  { name: "10% label noise", labels: DETECT.methods, values: DETECT.noise10 },
  { name: "20% label noise", labels: DETECT.methods, values: DETECT.noise20 },
], {
  x: 0.6, y: 1.4, w: 8.3, h: 5.3, barDir: "bar", barGapWidthPct: 50,
  chartColors: [HEX.accent1, HEX.accent2],
  showValue: true, dataLabelPosition: "outEnd", dataLabelFormatCode: "0.00", dataLabelColor: HEX.dk1, dataLabelFontFace: "+mn-lt", dataLabelFontSize: 11,
  showTitle: true, title: "ROC-AUC for flagging flipped labels (0.5 = random)", titleFontFace: "+mn-lt", titleFontSize: 14, titleColor: HEX.dk2,
  catAxisLabelColor: HEX.dk1, catAxisLabelFontFace: "+mn-lt", catAxisLabelFontSize: 12,
  valAxisMinVal: 0, valAxisMaxVal: 1, valAxisLabelColor: HEX.dk1, valAxisLabelFontFace: "+mn-lt", valAxisLabelFontSize: 11,
  valGridLine: { color: "D5E3E1", size: 0.5 }, catGridLine: { style: "none" },
  showLegend: true, legendPos: "b", legendFontFace: "+mn-lt", legendFontSize: 12, legendColor: HEX.dk1,
});
card(s, 9.2, 1.4, 3.5, 5.3, { name: "detect-insight" });
s.addText([
  { text: "What it shows", options: { bold: true, fontSize: 17, color: C.text2, breakLine: true } },
  { text: "Entropy and overlap memberships are no better than chance at finding mislabelled points, so they cannot help under noise.", options: { breakLine: true } },
  { text: " ", options: { breakLine: true, fontSize: 6 } },
  { text: "Own-class agreement among nearby balls finds them as well as sample kNN, while working on far fewer balls.", options: { bold: true, color: C.accent1, breakLine: true } },
  { text: " ", options: { breakLine: true, fontSize: 6 } },
  { text: "8 datasets, split seed 0, k ∈ {2, 4, 6}.", options: { italic: true, color: C.accent6 } },
], tx(null, { x: 9.45, y: 1.6, w: 3.0, h: 4.9, fontSize: 15 }));

const ROUND4 = { // mean balanced accuracy (%), 21 datasets × 5 splits, CV-tuned
  noise: ["0%", "10%", "20%", "30%"],
  series: [
    ["GBLSTSVM", [73.4, 73.2, 72.0, 65.2]],
    ["T7 on all balls", [77.5, 75.9, 73.8, 68.6]],
    ["LSTSVM (raw)", [80.7, 77.8, 76.2, 69.2]],
    ["Fuzzy-kNN LSTSVM", [80.4, 78.4, 77.3, 71.1]],
  ],
};
s = pres.addSlide({ masterName: "CONTENT", sectionTitle: "Experiments" });
s.addText("Round 4: T7 helps at 30% noise; balls still trail LSTSVM", { placeholder: "title" });
s.addChart(pres.charts.LINE, ROUND4.series.map(([name, v]) => ({ name, labels: ROUND4.noise, values: v })), {
  x: 0.6, y: 1.4, w: 8.3, h: 5.3, lineSize: 2, lineDataSymbol: "circle", lineDataSymbolSize: 7,
  chartColors: [HEX.accent4, HEX.accent1, HEX.dk2, HEX.accent2],
  showTitle: true, title: "Mean balanced accuracy (%) vs training label noise", titleFontFace: "+mn-lt", titleFontSize: 14, titleColor: HEX.dk2,
  catAxisLabelColor: HEX.dk1, catAxisLabelFontFace: "+mn-lt", catAxisLabelFontSize: 12,
  valAxisMinVal: 64, valAxisMaxVal: 82, valAxisLabelColor: HEX.dk1, valAxisLabelFontFace: "+mn-lt", valAxisLabelFontSize: 11,
  valGridLine: { color: "D5E3E1", size: 0.5 }, catGridLine: { style: "none" },
  showLegend: true, legendPos: "b", legendFontFace: "+mn-lt", legendFontSize: 12, legendColor: HEX.dk1,
});
card(s, 9.2, 1.4, 3.5, 5.3, { name: "round4-insight" });
s.addText([
  { text: "What it shows", options: { bold: true, fontSize: 17, color: C.text2, breakLine: true } },
  { text: "T7 on all balls beats just keeping them by 2.4 points at 30% noise (p = 0.029) and nearly reaches LSTSVM there.", options: { breakLine: true } },
  { text: " ", options: { breakLine: true, fontSize: 6 } },
  { text: "Up to 20% noise every ball model stays 2–3 points below LSTSVM.", options: { bold: true, color: C.accent4, breakLine: true } },
  { text: " ", options: { breakLine: true, fontSize: 6 } },
  { text: "Best under noise: the known fuzzy-kNN LSTSVM. Next: better balls (ADPGBG, E10).", options: {} },
], tx(null, { x: 9.45, y: 1.6, w: 3.0, h: 4.9, fontSize: 15 }));

s = pres.addSlide({ masterName: "CONTENT", sectionTitle: "Experiments" });
s.addText("Round 6: in the kernel model, keep + T7 adds little", { placeholder: "title" });
s.addChart(pres.charts.LINE, KERNEL.series.map(([name, v]) => ({ name, labels: KERNEL.noise, values: v })), {
  x: 0.6, y: 1.4, w: 8.3, h: 5.3, lineSize: 2, lineDataSymbol: "circle", lineDataSymbolSize: 7,
  chartColors: [HEX.accent4, HEX.accent1, HEX.dk2, HEX.accent2],
  showTitle: true, title: "Mean balanced accuracy (%) vs training label noise, RBF kernel", titleFontFace: "+mn-lt", titleFontSize: 14, titleColor: HEX.dk2,
  catAxisLabelColor: HEX.dk1, catAxisLabelFontFace: "+mn-lt", catAxisLabelFontSize: 12,
  valAxisMinVal: 60, valAxisMaxVal: 84, valAxisLabelColor: HEX.dk1, valAxisLabelFontFace: "+mn-lt", valAxisLabelFontSize: 11,
  valGridLine: { color: "D5E3E1", size: 0.5 }, catGridLine: { style: "none" },
  showLegend: true, legendPos: "b", legendFontFace: "+mn-lt", legendFontSize: 12, legendColor: HEX.dk1,
});
card(s, 9.2, 1.4, 3.5, 5.3, { name: "kernel-insight" });
s.addText([
  { text: "What it shows", options: { bold: true, fontSize: 17, color: C.text2, breakLine: true } },
  { text: "Keep + T7 is within 0.9 points of kernel GBLSTSVM, never significant.", options: { breakLine: true } },
  { text: " ", options: { breakLine: true, fontSize: 6 } },
  { text: "Ball models beat kernel LSTSVM at 30% noise (+2.3, p = 0.026) but trail it on clean data.", options: { breakLine: true } },
  { text: " ", options: { breakLine: true, fontSize: 6 } },
  { text: "Fuzzy-kNN LSTSVM is best at every noise level.", options: { bold: true, color: C.accent4 } },
], tx(null, { x: 9.45, y: 1.6, w: 3.0, h: 4.9, fontSize: 15 }));

[["Speed, clean data: a reduced kernel keeps up with the balls", TIMING_CLEAN, false],
 ["Speed at 20% label noise: kept balls stop being small", TIMING_NOISY, true]].forEach(([title, rowsData, withFknn]) => {
  s = pres.addSlide({ masterName: "CONTENT", sectionTitle: "Experiments" });
  s.addText(title, { placeholder: "title" });
  const cols = ["Training points", "Kernel GBLSTSVM", "Kernel keep + T7", "Kernel LSTSVM", "Reduced-kernel LSTSVM"].concat(withFknn ? ["Reduced-kernel fuzzy-kNN"] : []);
  const th = cols.map(t => ({ text: t, options: { bold: true, color: HEX.lt1, fill: { color: HEX.dk2 } } }));
  const w0 = 1.6, wc = (12.1 - w0) / (cols.length - 1);
  s.addTable([th].concat(rowsData.map(r => r.map((c, j) => ({ text: c, options: { align: j ? "center" : "left", color: c === "skipped" ? HEX.accent6 : HEX.dk1 } })))), {
    x: 0.6, y: 1.45, w: 12.1, colW: [w0].concat(Array(cols.length - 1).fill(wc)), fontSize: 12, fontFace: THEME.bodyFontFace,
    color: HEX.dk1, valign: "middle", border: { type: "solid", color: "D5E3E1", pt: 0.75 }, fill: { color: HEX.lt1 }, rowH: 0.42, autoPage: false,
  });
  s.addText("Each cell: training time (ball building included) · balanced accuracy on the 30% test part. One split, c = 1, γ = 1/d, 4 cores. "
    + "Skipped: more than 11,000 kernel columns. The NDC file named 1m holds 100,000 points.",
    tx(null, { x: 0.6, y: 6.0, w: 12.1, h: 0.6, fontSize: 12, italic: true, color: C.accent6 }));
});

EXPERIMENTS.forEach((e) => {
  const s = pres.addSlide({ masterName: "CONTENT", sectionTitle: "Experiments" });
  s.addText(`${e.id}: ${e.name}`, { placeholder: "title" });
  s.addText(e.date, tx(null, { x: 9.7, y: 1.25, w: 3.0, h: 0.35, fontSize: 12, color: C.accent6, align: "right", margin: 0 }));
  const boxes = [["Idea", e.idea, 0.6, 1.7], ["Setup", e.setup, 6.75, 1.7], ["Results", e.results, 0.6, 4.0]];
  boxes.forEach(([h, body, x, y]) => {
    const w = h === "Results" ? 8.0 : 5.95;
    card(s, x, y, w, 2.1, { name: `exp-${h.toLowerCase()}` });
    s.addText(h, tx(null, { x: x + 0.25, y: y + 0.15, w: w - 0.5, h: 0.4, fontSize: 16, bold: true, color: C.text2, margin: 0 }));
    s.addText(body, tx(null, { x: x + 0.25, y: y + 0.6, w: w - 0.5, h: 1.35, fontSize: 14, margin: 0 }));
  });
  const vc = VERDICT_COLOR[e.verdict] || C.accent2;
  card(s, 8.85, 4.0, 3.9, 2.1, { name: "exp-verdict", fill: vc, line: vc });
  s.addText("Verdict", tx(null, { x: 9.1, y: 4.15, w: 3.4, h: 0.4, fontSize: 16, bold: true, color: C.background1, margin: 0 }));
  s.addText(e.verdict.toUpperCase(), tx(null, { x: 9.1, y: 4.6, w: 3.4, h: 0.5, fontSize: 22, bold: true, color: C.background1, margin: 0 }));
  s.addText(e.verdictNote, tx(null, { x: 9.1, y: 5.15, w: 3.4, h: 0.85, fontSize: 13, color: C.background1, margin: 0 }));
});

// ================= Dead ends =================
const DEAD_ENDS = [
  ["Ball purity as membership", "Ruled out", "Every kept ball has purity ≥ 0.985, mostly exactly 1.0, so it cannot rank balls."],
  ["T1 centre-distance (E1)", "Dropped", "Already published (GBFSVM) and no significant gain; −2.3 points at 20% noise."],
  ["T4 overlap and T5 density on pruned balls (E3, E4)", "Dropped", "Significantly worse under noise (p = 0.010 and 0.049). T4 retested on all balls in E5."],
  ["Ball-level fuzzy weights on all balls (E5: T6, T6+T2, T6+T4)", "Dropped", "No significant gain over simply not deleting points (p ≥ 0.3); LSTSVM still 3 points ahead."],
  ["GB-induced sample memberships (E6: GBF-size, -overlap, -entropy)", "Dropped", "0.2–0.9 points below plain LSTSVM at every noise level, never significant; they do not single out noisy points."],
  ["Entropy as a noise membership (T2)", "Design flaw", "Measures how mixed a neighbourhood is, not whether it disagrees with the point's label (ROC-AUC 0.30)."],
  ["T7 on GBLSTSVM's pruned balls (E8)", "Dropped", "No gain at any noise level: GBLSTSVM already deletes 86% of flipped labels as single-point balls."],
  ["T4 overlap as a novel contribution", "Taken", "OBRU in the group's MATLAB suite is the same idea, and T4 hurts under noise anyway."],
  ["ADPGBG ball builder (E10)", "Dropped", "No better than keeping single points; ball models still 1.3–4 points below LSTSVM."],
  ["Balls as a cheaper way to get fuzzy-kNN weights", "Dropped", "Building balls (0.3–0.9 s) is slower than point kNN (0.1–0.7 s) on NDC 5k–20k."],
  ["Keep + T7 in the kernel model (E11)", "Dropped", "+0.1 to +0.9 over kernel GBLSTSVM, not significant; kernel fuzzy-kNN LSTSVM beats it by 2–2.7 points."],
  ["Kernel speed as the case for balls (E12)", "Dropped", "Reduced-kernel LSTSVM (no balls) trains in the same range and is 0.5–3 points more accurate."],
  ["Pythagorean fuzzy scores of GBFTSVM (E14)", "Dropped", "On a pure ball the score equals centre distance (T1); ≥ 99% of k-means balls are pure, so the scores change nothing."],
  ["L-BFGS-B solver used in the GBFTSVM paper", "Replaced", "Stops far from the optimum on some datasets (ger); we solve the same dual exactly with liblinear."],
  ["Folder “GBLSTSVM_M0_M3_ready”", "Not found", "Used Downloads › GBLSTSVM-main; the Desktop Python copy is identical to it."],
];
pres.addSection({ title: "Log" });
const DEAD_PER_SLIDE = 4;
for (let p0 = 0; p0 < DEAD_ENDS.length; p0 += DEAD_PER_SLIDE) {
  s = pres.addSlide({ masterName: "CONTENT", sectionTitle: "Log" });
  s.addText(p0 === 0 ? "Dead ends and detours" : "Dead ends and detours (continued)", { placeholder: "title" });
  DEAD_ENDS.slice(p0, p0 + DEAD_PER_SLIDE).forEach(([h, st, d], i) => {
    const y = 1.45 + i * 1.3;
    card(s, 0.6, y, 12.1, 1.15, { name: "deadend-row" });
    badge(s, 0.85, y + 0.3, "×", C.accent4);
    s.addText(h, tx(null, { x: 1.65, y: y + 0.1, w: 8.0, h: 0.45, fontSize: 17, bold: true, color: C.text2, valign: "middle", margin: 0 }));
    s.addText(st, tx(null, { x: 9.9, y: y + 0.1, w: 2.6, h: 0.45, fontSize: 14, bold: true, color: C.accent4, align: "right", valign: "middle", margin: 0 }));
    s.addText(d, tx(null, { x: 1.65, y: y + 0.58, w: 10.85, h: 0.45, fontSize: 15, margin: 0 }));
  });
}

// ================= 17. Next steps =================
s = pres.addSlide({ masterName: "CONTENT", sectionTitle: "Log" });
s.addText("Next steps", { placeholder: "title" });
const next = [
  "Write the paper from the draft outline; tables and CD diagrams are done (results/paper)",
  "Read the ADPGBG paper to check our port; add GBTSVM (Tanveer's group) as one more baseline",
  "Robustness: label noise that targets the class border, and larger or multi-class data",
  "Paper-quality figures; choose the journal with the professor after the midsem",
  "Update this deck and push the code to GitHub after each step",
];
next.forEach((t, i) => {
  const y = 1.5 + i * 1.0;
  badge(s, 0.6, y + 0.1, String(i + 1), i === 0 ? C.accent2 : C.accent1);
  s.addText(t, tx(null, { x: 1.4, y, w: 11.3, h: 0.75, fontSize: 17, valign: "middle", margin: 0 }));
});

(async () => {
  await pres.writeFile({ fileName: OUT });
  await applyTheme(OUT, THEME);
  console.log("wrote", OUT);
})();
