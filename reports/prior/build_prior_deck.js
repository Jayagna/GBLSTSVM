// Builds the deck of work done before the fuzzy-membership study (Aug–Sep 2026):
// baseline reproduction, ball generation, the earlier ball-weighting models and M0–M3.
// Run: PPTX_SKILL_DIR=<pptx skill dir> NODE_PATH=<dir with pptxgenjs> node build_prior_deck.js [out.pptx]
// Numbers come from the earlier reports (docs/ in GBLSTSVM-Ex, the 28 and 29 Sep notes and the
// first progress deck). Ball diagrams come from figs_prior.py (fig/), plus the guide's Fig. 1.
const fs = require("fs");
const path = require("path");
const pptxgen = require("pptxgenjs");
const { applyTheme } = require(process.env.PPTX_SKILL_DIR + "/scripts/apply_theme.js");

const OUT = process.argv[2] || path.join(__dirname, "GBLSTSVM_Work_Before_Fuzzy_Study.pptx");
const FIG = path.join(__dirname, "fig");
const GUIDE_FIG = process.env.GUIDE_FIG || "/mnt/project-files/guide/fig";
const STATS = JSON.parse(fs.readFileSync(path.join(__dirname, "fig_stats.json"), "utf8"));

const THEME = {
  name: "Granular Petrol",
  headFontFace: "Cambria",
  bodyFontFace: "Calibri",
  colors: {
    dk1: "17242A", lt1: "FFFFFF", dk2: "12333D", lt2: "EEF3F2",
    accent1: "00897B", // teal: the model under test
    accent2: "C0492F", // brick: baseline GBLSTSVM / M0
    accent3: "2B63C6", // blue: CW control
    accent4: "7B4FB0", // violet
    accent5: "B88200", // amber
    accent6: "5A7A82", // slate: secondary text
    hlink: "00897B", folHlink: "5A7A82",
  },
};
const HEX = THEME.colors;
const GRID = "DCE5E4";
const CODE_FONT = "Courier New";

const pres = new pptxgen();
pres.layout = "LAYOUT_WIDE"; // 13.33 x 7.5 in
pres.title = "GBLSTSVM: work done before the fuzzy-membership study";
pres.author = "Jayagna";
pres.theme = { headFontFace: THEME.headFontFace, bodyFontFace: THEME.bodyFontFace };
const C = pres.SchemeColor;

// ---------------------------------------------------------------- references
const REFS = [
  ["twsvm", "Jayadeva, R. Khemchandani, S. Chandra. Twin support vector machines for pattern classification. IEEE Trans. Pattern Analysis and Machine Intelligence 29(5):905–910, 2007."],
  ["lstsvm", "M. A. Kumar, M. Gopal. Least squares twin support vector machines for pattern classification. Expert Systems with Applications 36(4):7535–7543, 2009."],
  ["gbc", "S. Xia, Y. Liu, X. Ding, G. Wang, H. Yu, Y. Luo. Granular ball computing classifiers for efficient, scalable and robust learning. Information Sciences 483:136–152, 2019."],
  ["gblstsvm", "M. Tanveer, R. K. Sharma, A. Quadir, M. Sajid. Enhancing robustness and efficiency of least square twin SVM via granular computing. Pattern Recognition 170, 112021, 2026. (GBLSTSVM)"],
  ["adpgbg", "W. Liao, Q. Zhang, Q. Xie, M. Gao, P. Jin. A new adaptive and effective granular ball generation method for classification. Int. J. Machine Learning and Cybernetics 16:3501–3520, 2025. (ADPGBG)"],
  ["gbgpp", "Q. Xie et al. GBG++: a fast and stable granular ball generation method for classification. IEEE Trans. Emerging Topics in Computational Intelligence, 2024."],
  ["shadow", "J. Yang et al. A robust three-way classifier with shadowed granular balls based on justifiable granularity. IEEE Trans. Neural Networks and Learning Systems 36(9):16534–16548, 2025."],
  ["density", "F. Liu et al. A granular-ball generation method based on local density for classification. Information Sciences 717, 122295, 2025."],
  ["tuning", "J. Pan et al. A framework of granular-ball generation for classification via granularity tuning. Applied Intelligence 55, article 63, 2025."],
  ["gbfuzzy", "G. Lang, L. Zhao, D. Miao, W. Ding. Granular-ball computing-based fuzzy twin support vector machine for pattern classification. IEEE Trans. Fuzzy Systems 33(7):2148–2160, 2025."],
  ["gbif", "X. Liu, G. Xie, J. Xie. A granular-ball intuitionistic fuzzy twin support vector machine with RVFL-based feature enhancement for imbalance learning. Int. J. Data Science and Analytics 22(1), 2026."],
  ["boundary", "S. Wang, J. Zhan, S. Xia, W. Ding. Boundary-driven granular ball generation and classification via three-way decision. Information Sciences 755, 123780."],
  ["fsvm", "C.-F. Lin, S.-D. Wang. Fuzzy support vector machines. IEEE Trans. Neural Networks 13(2):464–471, 2002."],
  ["keel", "J. Alcalá-Fdez et al. KEEL data-mining software tool: data set repository, integration of algorithms and experimental analysis framework. J. Multiple-Valued Logic and Soft Computing 17(2–3):255–287, 2011."],
  ["demsar", "J. Demšar. Statistical comparisons of classifiers over multiple data sets. J. Machine Learning Research 7:1–30, 2006."],
  ["ex", "GBLSTSVM-Ex research suite (Python, Sessions 1–7, Aug–Sep 2026) and GBLSTSVM MATLAB suite: CW, R, CR, BMRU, OBRU, CBCM, IPA and Topo weights; M0–M3 code (gen_ball_new.py, run_m0_m3.py). Unpublished SOP research code."],
];
const REF_NO = Object.fromEntries(REFS.map(([k], i) => [k, i + 1]));
const R = (...keys) => "[" + keys.map(k => { if (!REF_NO[k]) throw new Error("unknown ref " + k); return REF_NO[k]; }).join(", ") + "]";

// ---------------------------------------------------------------- layouts
pres.defineSlideMaster({
  title: "TITLE",
  background: { color: C.text2 },
  objects: [
    { placeholder: { options: { name: "title", type: "title", x: 0.8, y: 1.45, w: 8.3, h: 2.6, fontSize: 40, bold: true, color: C.background1, valign: "bottom", align: "left" }, text: "" } },
    { placeholder: { options: { name: "body", type: "body", x: 0.8, y: 4.3, w: 8.3, h: 1.9, fontSize: 18, color: C.background2, valign: "top", align: "left" }, text: "" } },
  ],
});
pres.defineSlideMaster({
  title: "CONTENT",
  background: { color: C.background1 },
  margin: [0.5, 0.6, 0.7, 0.6],
  objects: [
    { placeholder: { options: { name: "kicker", type: "body", x: 0.6, y: 0.3, w: 10, h: 0.32, fontSize: 12, bold: true, color: C.accent6, valign: "middle", align: "left" }, text: "" } },
    { placeholder: { options: { name: "title", type: "title", x: 0.6, y: 0.62, w: 12.1, h: 0.75, fontSize: 28, bold: true, color: C.text2, valign: "top", align: "left" }, text: "" } },
    { text: { text: "GBLSTSVM · Work done before the fuzzy study", options: { x: 0.6, y: 7.02, w: 8, h: 0.3, fontSize: 10, color: C.accent6 } } },
  ],
  slideNumber: { x: 12.1, y: 7.02, w: 0.6, h: 0.3, fontSize: 10, color: C.accent6, align: "right" },
});

// ---------------------------------------------------------------- helpers
let curSection = null;
function newSlide(master, section) {
  if (section !== curSection) { pres.addSection({ title: section }); curSection = section; }
  return pres.addSlide({ masterName: master, sectionTitle: section });
}
function content(section, title, kicker) {
  const s = newSlide("CONTENT", section);
  s.addText((kicker || section).toUpperCase(), { placeholder: "kicker" });
  s.addText(title, { placeholder: "title" });
  return s;
}
const tx = o => Object.assign({ isTextBox: true, fontSize: 14, color: C.text1, valign: "top", margin: 0 }, o);
function card(s, x, y, w, h, o = {}) {
  s.addShape(pres.shapes.ROUNDED_RECTANGLE, {
    x, y, w, h, rectRadius: o.r || 0.1,
    fill: { color: o.fill || C.background2 }, line: { color: o.line || o.fill || C.background2, width: 0.75 },
    objectName: o.name || "card",
  });
}
function badge(s, x, y, label, color, d = 0.5, fontSize = 15) {
  s.addShape(pres.shapes.OVAL, { x, y, w: d, h: d, fill: { color: color || C.accent1 }, line: { color: color || C.accent1 }, objectName: "badge" });
  s.addText(label, tx({ x, y, w: d, h: d, fontSize, bold: true, color: C.background1, align: "center", valign: "middle" }));
}
function takeaway(s, text, y = 6.2) {
  card(s, 0.6, y, 12.1, 0.62, { name: "takeaway" });
  s.addShape(pres.shapes.OVAL, { x: 0.82, y: y + 0.19, w: 0.24, h: 0.24, fill: { color: C.accent1 }, line: { color: C.accent1 }, objectName: "takeaway-ball" });
  s.addText(text, tx({ x: 1.25, y, w: 11.3, h: 0.62, fontSize: 15, bold: true, color: C.text2, valign: "middle" }));
}
function caption(s, text, x, y, w, h = 0.3) {
  s.addText(text, tx({ x, y, w, h, fontSize: 12, italic: true, color: C.accent6 }));
}
// bulleted paragraphs; an item is a string or an array of runs [{text, options}]
function bullets(items, o = {}) {
  const out = [];
  items.forEach((it, i) => {
    let runs = typeof it === "string" ? [{ text: it, options: {} }] : it.map(r => (typeof r === "string" ? { text: r, options: {} } : r));
    if (o.math) runs = runs.flatMap(r => eq(r.text, r.options)); // render x_i as a subscript
    runs.forEach((r, j) => {
      const opts = Object.assign({}, r.options);
      if (j === 0) Object.assign(opts, { bullet: o.bullet === false ? false : { indent: 16 }, paraSpaceAfter: o.space ?? 8 });
      if (j === runs.length - 1 && i < items.length - 1) opts.breakLine = true;
      out.push({ text: r.text, options: opts });
    });
  });
  return out;
}
const B = t => ({ text: t, options: { bold: true } });
// tiny math markup: x_i, x_{ij}, x^2, x^{-1}
function eq(src, o = {}) {
  const runs = [];
  let buf = "";
  const push = (t, extra) => { if (t) runs.push({ text: t, options: Object.assign({}, o, extra) }); };
  for (let i = 0; i < src.length;) {
    const ch = src[i];
    if ((ch === "_" || ch === "^") && i + 1 < src.length) {
      push(buf); buf = "";
      let t;
      if (src[i + 1] === "{") { const j = src.indexOf("}", i + 2); t = src.slice(i + 2, j); i = j + 1; } else { t = src[i + 1]; i += 2; }
      push(t, ch === "_" ? { subscript: true } : { superscript: true });
    } else { buf += ch; i++; }
  }
  push(buf);
  return runs;
}
function eqLines(lines, o = {}) {
  const out = [];
  lines.forEach((ln, i) => {
    const runs = typeof ln === "string" ? eq(ln, o) : ln;
    if (i < lines.length - 1) runs[runs.length - 1].options.breakLine = true;
    out.push(...runs);
  });
  return out;
}
// Python syntax colouring for code cards
const PY_KW = new Set(["def", "return", "for", "in", "if", "else", "elif", "import", "from", "as", "with", "not", "and", "or", "None", "True", "False", "while", "class", "lambda"]);
const STYLE = {
  plain: { color: C.text1 }, comment: { color: C.accent6, italic: true }, string: { color: C.accent2 },
  number: { color: C.accent4 }, kw: { color: C.accent3, bold: true }, fn: { color: C.text2, bold: true },
};
function pyRuns(line) {
  if (!line.length) return [{ text: " ", style: "plain" }];
  const lead = line.match(/^ */)[0].length;
  const body = line.slice(lead);
  const re = /(#.*$)|("""[^]*?"""|"[^"]*"|'[^']*')|(\b\d+(?:\.\d+)?(?:e-?\d+)?\b)|([A-Za-z_][A-Za-z0-9_]*)|(\s+)|([^\sA-Za-z0-9_#"']+)/g;
  const toks = [];
  if (lead) toks.push({ text: " ".repeat(lead), style: "plain" });
  let m, prev = "";
  while ((m = re.exec(body)) !== null) {
    let st = "plain";
    if (m[1]) st = "comment"; else if (m[2]) st = "string"; else if (m[3]) st = "number";
    else if (m[4]) st = PY_KW.has(m[4]) ? "kw" : prev === "def" ? "fn" : "plain";
    if (m[4]) prev = m[4]; else if (!m[5]) prev = "";
    const last = toks[toks.length - 1];
    if (last && last.style === st) last.text += m[0]; else toks.push({ text: m[0], style: st });
  }
  return toks;
}
// maxH is the most the card may take; it shrinks to fit the code. Returns the card's bottom edge.
function codeCard(s, x, y, w, maxH, file, code, maxFs = 13) {
  const lines = code.replace(/\n$/, "").split("\n");
  const maxLen = Math.max(...lines.map(l => l.length));
  const fsW = ((w - 0.34) * 72) / (0.6 * maxLen);
  const fsH = ((maxH - 0.72) * 72) / (lines.length * 1.18);
  const fs = Math.min(maxFs, Math.floor(Math.min(fsW, fsH) * 2) / 2);
  const h = Math.min(maxH, 0.72 + (lines.length * fs * 1.18) / 72);
  card(s, x, y, w, h, { fill: C.text2, r: 0.08, name: "code-frame" });
  [0, 1, 2].forEach(i => s.addShape(pres.shapes.OVAL, { x: x + 0.16 + i * 0.2, y: y + 0.13, w: 0.12, h: 0.12, fill: { color: C.background2, transparency: 45 }, line: { color: C.background2, transparency: 45 }, objectName: "code-dot" }));
  s.addText(file, tx({ x: x + 0.82, y: y + 0.04, w: w - 1.0, h: 0.3, fontSize: 11, color: C.background2, fontFace: CODE_FONT, valign: "middle" }));
  s.addShape(pres.shapes.RECTANGLE, { x: x + 0.04, y: y + 0.38, w: w - 0.08, h: h - 0.42, fill: { color: C.background1 }, line: { color: C.background1 }, objectName: "code-body" });
  const runs = [];
  lines.forEach((ln, i) => {
    const toks = pyRuns(ln);
    toks.forEach((t, j) => {
      const o = Object.assign({}, STYLE[t.style]);
      if (j === toks.length - 1 && i < lines.length - 1) o.breakLine = true;
      runs.push({ text: t.text, options: o });
    });
  });
  s.addText(runs, tx({ x: x + 0.14, y: y + 0.48, w: w - 0.28, h: h - 0.58, fontSize: fs, fontFace: CODE_FONT, lineSpacingMultiple: 1.0, objectName: "code" }));
  return y + h;
}
// pptxgenjs writes an <a:pPr> before every run, so a paragraph with several runs gets
// <a:pPr> elements after its first run. That is schema-invalid (and drops bullets), so
// keep only each paragraph's leading <a:pPr>.
async function dropInnerParagraphProps(file) {
  const JSZip = require("jszip");
  const zip = await JSZip.loadAsync(fs.readFileSync(file));
  let removed = 0;
  for (const name of Object.keys(zip.files).filter(n => /^ppt\/(slides|slideLayouts|slideMasters|notesSlides)\/[^/]+\.xml$/.test(n))) {
    const xml = await zip.file(name).async("string");
    const out = xml.replace(/(<\/a:r>|<a:br\/>|<\/a:fld>)(?:<a:pPr\b[^>]*\/>|<a:pPr\b[^>]*>.*?<\/a:pPr>)/g, (m, before) => { removed++; return before; });
    if (out !== xml) zip.file(name, out);
  }
  fs.writeFileSync(file, await zip.generateAsync({ type: "nodebuffer", compression: "DEFLATE" }));
  return removed;
}
function chartOpts(o) {
  return Object.assign({
    catAxisLabelFontFace: "+mn-lt", valAxisLabelFontFace: "+mn-lt", legendFontFace: "+mn-lt", dataLabelFontFace: "+mn-lt",
    titleFontFace: "+mn-lt", catAxisTitleFontFace: "+mn-lt", valAxisTitleFontFace: "+mn-lt",
    catAxisLabelFontSize: 12, valAxisLabelFontSize: 12, legendFontSize: 12, dataLabelFontSize: 11,
    catAxisLabelColor: HEX.dk1, valAxisLabelColor: HEX.accent6, legendColor: HEX.dk1, dataLabelColor: HEX.dk1,
    catAxisTitleColor: HEX.accent6, valAxisTitleColor: HEX.accent6, catAxisTitleFontSize: 12, valAxisTitleFontSize: 12,
    valGridLine: { color: GRID, size: 0.5 }, catGridLine: { style: "none" },
    catAxisLineColor: "9FB0B3", valAxisLineShow: false, showTitle: false,
  }, o);
}
function lineChart(s, series, labels, colors, o) {
  s.addChart(pres.charts.LINE, series.map(([name, values]) => ({ name, labels, values })), chartOpts(Object.assign({
    chartColors: colors, lineSize: 2.25, lineDataSymbol: "circle", lineDataSymbolSize: 8,
    showLegend: true, legendPos: "b",
  }, o)));
}
function barChart(s, series, labels, colors, o) {
  s.addChart(pres.charts.BAR, series.map(([name, values]) => ({ name, labels, values })), chartOpts(Object.assign({
    barDir: "col", barGrouping: "clustered", barGapWidthPct: 70, chartColors: colors,
    showValue: true, dataLabelPosition: "outEnd", showLegend: series.length > 1, legendPos: "b",
  }, o)));
}
function table(s, rows, o) {
  s.addTable(rows, Object.assign({ fontSize: 13, color: C.text1, border: { type: "solid", pt: 0.5, color: GRID }, valign: "middle", margin: [3, 6, 3, 6] }, o));
}
const th = (t, o = {}) => ({ text: t, options: Object.assign({ bold: true, color: C.background1, fill: { color: C.text2 } }, o) });
const td = (t, o = {}) => ({ text: t, options: o });
function motif(s) {
  // two classes of granular balls and their two twin planes
  const balls = [
    [9.55, 1.05, 1.45, 0], [10.95, 0.7, 0.85, 0], [9.85, 2.7, 0.95, 0], [11.0, 1.85, 0.55, 0], [10.75, 2.95, 0.32, 0],
    [11.45, 3.55, 1.3, 1], [10.25, 4.55, 1.05, 1], [11.85, 5.15, 0.8, 1], [11.2, 5.0, 0.38, 1], [12.35, 2.95, 0.5, 1],
  ];
  balls.forEach(([x, y, d, k]) => s.addShape(pres.shapes.OVAL, {
    x, y, w: d, h: d, fill: { color: k ? C.accent5 : C.accent1, transparency: 25 }, line: { color: C.background1, width: 1 }, objectName: "ball-motif",
  }));
  s.addShape(pres.shapes.LINE, { x: 9.15, y: 0.55, w: 3.1, h: 3.7, flipV: true, line: { color: C.accent1, width: 2.5 }, objectName: "plane-1" });
  s.addShape(pres.shapes.LINE, { x: 9.95, y: 2.75, w: 3.05, h: 3.9, flipV: true, line: { color: C.accent5, width: 2.5 }, objectName: "plane-2" });
}


// ---------------------------------------------------------------- deck-specific helpers
function pngSize(f) {
  const b = fs.readFileSync(f);
  return { w: b.readUInt32BE(16), h: b.readUInt32BE(20) };
}
// fit a PNG inside the box (x, y, w, h); returns where it landed
function img(s, f, x, y, w, h, o = {}) {
  const p = pngSize(f);
  const k = Math.min(w / p.w, h / p.h);
  const iw = p.w * k, ih = p.h * k;
  const ix = o.align === "left" ? x : x + (w - iw) / 2;
  const iy = o.valign === "middle" ? y + (h - ih) / 2 : y;
  s.addImage({ path: f, x: ix, y: iy, w: iw, h: ih, altText: o.alt || path.basename(f) });
  return { x: ix, y: iy, w: iw, h: ih };
}
function stat(s, x, y, w, h, big, label, color, bigFs = 30) {
  card(s, x, y, w, h, { name: "stat" });
  s.addText(big, tx({ x: x + 0.2, y: y + 0.12, w: w - 0.4, h: h * 0.5, fontSize: bigFs, bold: true, color: color || C.accent1, valign: "middle", fontFace: THEME.headFontFace }));
  s.addText(label, tx({ x: x + 0.2, y: y + 0.12 + h * 0.5, w: w - 0.4, h: h * 0.5 - 0.2, fontSize: 12, color: C.text1 }));
}
// a card with a bold heading and equation lines under it
function fcard(s, x, y, w, h, heading, lines, o = {}) {
  card(s, x, y, w, h, { name: "formula", fill: o.fill });
  if (heading) s.addText(heading, tx({ x: x + 0.2, y: y + 0.14, w: w - 0.4, h: 0.32, fontSize: 15, bold: true, color: o.headColor || C.text2 }));
  const top = heading ? 0.52 : 0.16;
  s.addText(eqLines(lines, { fontSize: o.fs || 14 }), tx({ x: x + 0.2, y: y + top, w: w - 0.4, h: h - top - 0.1, fontSize: o.fs || 14, paraSpaceAfter: o.space ?? 4 }));
}
function ref(s, text, y = 6.88) {
  s.addText(text, tx({ x: 8.7, y, w: 3.3, h: 0.22, fontSize: 10, color: C.accent6, align: "right" }));
}
const dec = (v, d = 3) => (v === 0 ? "" : v > 0 ? "+" : "−") + Math.abs(v).toFixed(d);

// =====================================================================================
// 1. Title
// =====================================================================================
let s = newSlide("TITLE", "Introduction");
s.addText("GBLSTSVM Groundwork Before the Fuzzy Study", { placeholder: "title" });
s.addText([
  { text: "Baseline reproduction, ball generation, ten ball-weighting ideas and the M0–M3 classifier-guided models", options: { breakLine: true } },
  { text: "Work done August to September 2026 · Jayagna", options: { fontSize: 15, paraSpaceBefore: 14 } },
], { placeholder: "body" });
motif(s);
s.addNotes("This deck is the record of what I did before the fuzzy-membership study. It covers four things: reproducing the GBLSTSVM baseline in Python and MATLAB, comparing two ways of building granular balls, a series of ideas for weighting balls inside the twin SVM, and finally the M0 to M3 models, where the classifier itself guides how balls are split. Most ideas did not beat a simple class-weighted baseline, and the reasons why shaped how the fuzzy study was set up.");

// =====================================================================================
// 2. Timeline
// =====================================================================================
s = content("Introduction", "Six steps from August to September", "Overview");
[
  ["Aug", "Reproduce the baseline", "Python and MATLAB versions of GBLSTSVM give the same balls and planes."],
  ["Aug", "Ball generation", "K-means splitting compared with the ADPGBG builder on two moons."],
  ["Sessions 1–2", "Class and reliability weights", "CW, R, CR, BMRU and overlap weights on three imbalanced datasets."],
  ["Session 3, 22 Aug", "Neighbourhood weights", "CBCM/CA, IPA, Topo and SA-Topo, built on a k-NN graph of balls."],
  ["Sessions 4–7, to 7 Sep", "Granulation and compression", "Split rules, entropy order and ball budgets on 17 datasets × 10 seeds."],
  ["28–29 Sep", "M0–M3 models", "Classifier-guided splitting (M1) and reliability weights (M2)."],
].forEach(([when, head, body], i) => {
  const x = 0.6 + i * 2.04, w = 1.96;
  card(s, x, 1.75, w, 4.1);
  badge(s, x + 0.2, 1.95, String(i + 1), i === 5 ? C.accent1 : C.text2, 0.55, 17);
  s.addText(when, tx({ x: x + 0.2, y: 2.7, w: w - 0.4, h: 0.3, fontSize: 12, bold: true, color: C.accent6 }));
  s.addText(head, tx({ x: x + 0.2, y: 3.05, w: w - 0.4, h: 0.85, fontSize: 16, bold: true, color: C.text2 }));
  s.addText(body, tx({ x: x + 0.2, y: 3.95, w: w - 0.4, h: 1.8, fontSize: 13 }));
  if (i < 5) s.addShape(pres.shapes.LINE, { x: x + 0.78, y: 2.225, w: 1.46, h: 0, line: { color: C.accent6, width: 1, dashType: "dash" }, objectName: "timeline-link" });
});
takeaway(s, "Only class weighting helped reliably; Session 7 traced the other gains to data compression, not ball structure.");
s.addNotes("Here is the order things happened. First I reproduced the published GBLSTSVM so I had a baseline I trusted. Then I looked at how the balls are built. Then, in seven working sessions, I tried to make some balls count more than others, first with class and reliability weights, then with weights based on each ball's neighbours, and then by changing how the balls are split. The last step, at the end of September, was M0 to M3, where the classifier's own planes decide which balls to split. The one-line summary is on the bottom: only class weighting gave a consistent gain, and the final session showed that the remaining gains came from compressing the data, which a random stratified sample does just as well.");

// =====================================================================================
// 3. Background
// =====================================================================================
s = content("Background", "GBLSTSVM trains two planes on ball centres");
img(s, path.join(GUIDE_FIG, "fig1_balls.png"), 0.6, 1.6, 7.0, 4.45, { align: "left", alt: "Training points and the granular balls that replace them, with the two GBLSTSVM planes" });
card(s, 7.9, 1.6, 4.8, 4.45);
s.addText(bullets([
  [B("Twin SVM: "), `two non-parallel planes, each close to one class and far from the other ${R("twsvm")}.`],
  [B("Least squares: "), `equalities replace inequalities, so each plane is one linear solve ${R("lstsvm")}.`],
  [B("Granular ball: "), `centre, radius (mean distance), majority label and purity of a group of points ${R("gbc")}.`],
  [B("GBLSTSVM: "), `trains on ball centres and radii instead of points; balls with one point are deleted ${R("gblstsvm")}.`],
], { space: 10 }), tx({ x: 8.1, y: 1.8, w: 4.4, h: 4.1, fontSize: 15 }));
takeaway(s, "Every model in this deck changes either how the balls are built or how much each ball counts.");
s.addNotes("A quick reminder of the model. A twin SVM fits two planes: plane 1 hugs the positive class and stays away from the negative class, and plane 2 does the opposite. A new point goes to the class whose plane is closer. The least squares version turns each plane into a single linear system, so training is fast. Granular balls compress the data: points are grouped into balls by repeated 2-means splitting until each ball is pure enough, and each ball is summarised by its centre, radius and majority label. GBLSTSVM fits the two planes to the ball centres instead of the points, and drops balls with only one point. In the picture, 170 points become 19 balls, and the crosses are the single-point balls that get deleted.");

// =====================================================================================
// 4. Formulation
// =====================================================================================
s = content("Background", "Each plane is one linear solve");
fcard(s, 0.6, 1.6, 6.0, 4.4, null, [
  [{ text: "Plane 1 (near class +1)", options: { bold: true, color: C.text2 } }],
  "min ½‖A w_1 + e_1 b_1‖^2 + (c_1/2)‖ξ‖^2",
  "s.t.  −(B w_1 + e_2 b_1) + ξ = e_2 + R_−",
  "u_1 = −(G^TG + (1/c_1) H^TH + εI)^{-1} G^T(e_2 + R_−)",
  [{ text: "Plane 2 (near class −1)", options: { bold: true, color: C.text2, paraSpaceBefore: 8 } }],
  "u_2 = (H^TH + (1/c_2) G^TG + εI)^{-1} H^T(e_1 + R_+)",
  [{ text: "Decision rule", options: { bold: true, color: C.text2, paraSpaceBefore: 8 } }],
  "predict +1 if |x^Tw_2 + b_2| > |x^Tw_1 + b_1|",
  eq("H = [A e], G = [B e]; A, B hold the ball centres of each class and R_+, R_− their radii.", { color: C.accent6, fontSize: 12, paraSpaceBefore: 8 }),
], { fs: 16 });
codeCard(s, 6.85, 1.6, 5.85, 4.4, "gen_ball_new.py · _fit_provisional_gblstsvm", `A = np.asarray([b.center for b in pos])
B = np.asarray([b.center for b in neg])
H = np.column_stack((A, e1))
G = np.column_stack((B, e2))

lhs1 = G.T @ G + (1.0 / c1) * (H.T @ H) + reg_term * identity
rhs1 = np.concatenate((B.T @ (e2 + R_neg), [np.sum(e2 + R_neg)]))
lhs2 = H.T @ H + (1.0 / c2) * (G.T @ G) + reg_term * identity
rhs2 = np.concatenate((A.T @ (e1 + R_pos), [np.sum(e1 + R_pos)]))

hyper1 = -np.linalg.solve(lhs1, rhs1)
hyper2 = np.linalg.solve(lhs2, rhs2)`);
takeaway(s, "The radius enters the right-hand side, so larger balls push the opposite plane further away.");
s.addNotes("These are the two closed-form solutions. A and B hold the ball centres of the two classes, and R holds their radii. For plane 1, the negative balls must sit at least one unit plus their radius away, which is why e plus R appears on the right. The code on the right is from my M0 to M3 generator and is the same system: build H and G by adding a column of ones, form the left-hand matrix, and solve. Using solve instead of an explicit inverse is one of the engineering choices from the reproduction. Every later weighting model changes this system by putting a weight on each ball's row.");

// =====================================================================================
// 5. Reproduction
// =====================================================================================
s = content("Baseline reproduction", "Python and MATLAB versions match the original code");
stat(s, 0.6, 1.6, 3.9, 1.45, "18 / 18", "balls identical to the original script on the same seed", C.accent1);
stat(s, 4.7, 1.6, 3.9, 1.45, "100%", "agreement on the benchmark linear systems", C.accent1);
stat(s, 8.8, 1.6, 3.9, 1.45, "94.74%", "breast-cancer accuracy, trained and tested in under 0.037 s (MATLAB)", C.accent1);
card(s, 0.6, 3.25, 5.95, 2.75);
s.addText("Python suite (GBLSTSVM-Ex)", tx({ x: 0.8, y: 3.4, w: 5.5, h: 0.35, fontSize: 16, bold: true, color: C.text2 }));
s.addText(bullets([
  "scikit-learn style fit / predict / decision_function in src/gblstsvm.py",
  "original GBLSTSVM.py kept frozen as the reference",
  "one module per extension: class weights, reliability, overlap and others",
  "tests for matrix equality, ball counts and tolerances",
], { space: 6 }), tx({ x: 0.8, y: 3.85, w: 5.6, h: 2.1, fontSize: 14 }));
card(s, 6.75, 3.25, 5.95, 2.75);
s.addText("MATLAB suite", tx({ x: 6.95, y: 3.4, w: 5.5, h: 0.35, fontSize: 16, bold: true, color: C.text2 }));
s.addText(bullets([
  "backslash solve (M \\ RHS) instead of an explicit inverse",
  "GranularBall class with 5 k-means replicates per split",
  "self-contained: LSTWGBSVM.m, gen_balls.m, GBLSTSVM_demo.m",
  "2-D visual suite used for the two-moons study",
], { space: 6 }), tx({ x: 6.95, y: 3.85, w: 5.6, h: 2.1, fontSize: 14 }));
takeaway(s, "With a trusted baseline, every later model could be compared against the same code.");
s.addNotes("Before changing anything, I rebuilt GBLSTSVM twice. The Python version follows the scikit-learn interface so it can be run in batch experiments, and the original script is kept untouched as a reference. On the same seed it produced exactly the same 18 balls and the same planes. The MATLAB version is used for checking the linear algebra and for 2-D pictures; it trains and tests breast cancer in under four hundredths of a second. This matters because every comparison later in the deck uses this same code with one thing changed.");

// =====================================================================================
// 6. Discrepancies
// =====================================================================================
s = content("Baseline reproduction", "Four places where the paper and the code differ");
table(s, [
  [th("Aspect"), th("Paper"), th("Original code"), th("What we kept")],
  [td("Regularisation", { bold: true }), td("one penalty for all plane parameters"), td("separate c1 and c2 on H'H and G'G"), td("separate c1, c2: handles imbalance between the two planes")],
  [td("Radius column", { bold: true }), td("features are the ball centres (d columns)"), td("radius briefly grouped with the features"), td("store [centre (d), radius, label] separately")],
  [td("Solving", { bold: true }), td("written as an explicit inverse"), td("np.linalg.inv (Python), backslash (MATLAB)"), td("linear solve, never an explicit inverse")],
  [td("2-means splits", { bold: true }), td("no replicate count given"), td("one k-means run can stall in a bad split"), td("5 replicates and a safe fallback")],
], { x: 0.6, y: 1.65, w: 12.1, colW: [2.2, 3.1, 3.3, 3.5], fontSize: 14, rowH: [0.45, 0.85, 0.85, 0.85, 0.85] });
takeaway(s, "These choices are small, but writing them down makes later comparisons reproducible.");
s.addNotes("Reproducing a paper always turns up gaps between the equations and the code. I found four. The code uses two penalty constants, one per plane, which we kept because it helps with class imbalance. The radius was at one point mixed into the feature columns, which we separated. The code inverts a matrix; we solve the system instead, which is more stable. And a single k-means run can get stuck, so we use five replicates. None of these change the idea of the model, but they change numbers, so they are documented.");


// =====================================================================================
// 7. K-means vs ADPGBG
// =====================================================================================
s = content("Ball generation", "Two ways to build balls: k-means splitting and ADPGBG");
[[0.6, "1", "K-means splitting (original)", C.accent2, [
  "Start with one ball holding all points.",
  "While a ball's purity is below the threshold, split it with 2-means and repeat.",
  "The split line ignores the class boundary, so on curved data balls can straddle it.",
  "The purity threshold (0.80 to 1.0) must be tuned for each dataset.",
]], [6.75, "2", `ADPGBG ${R("adpgbg")}`, C.accent1, [
  "Grow each ball from a centre until it reaches the nearest point of the other class: hd1st(c) = min_{l(x) ≠ l(c)} d(c, x).",
  "Members: T = {x : d(x, c) < hd1st(c)}, then centre = mean(T) and radius = mean distance.",
  "No purity threshold to tune.",
  "A second distance, hd2nd, flags single isolated points as noise.",
]]].forEach(([x, n, head, col, items]) => {
  card(s, x, 1.6, 5.95, 4.4);
  badge(s, x + 0.25, 1.8, n, col, 0.5, 16);
  s.addText(head, tx({ x: x + 0.95, y: 1.8, w: 4.8, h: 0.5, fontSize: 18, bold: true, color: C.text2, valign: "middle" }));
  s.addText(bullets(items, { space: 9, math: true }), tx({ x: x + 0.25, y: 2.55, w: 5.45, h: 3.35, fontSize: 15 }));
});
takeaway(s, "ADPGBG builds balls from the class boundary inward instead of cutting blindly.");
s.addNotes("The original builder starts from one big ball and keeps cutting impure balls in two with 2-means. The cut does not know where the class boundary is, so on curved data a ball can end up spanning both classes, and the purity threshold has to be tuned per dataset. ADPGBG, from Liao and co-authors, works the other way round: it grows each ball from a centre until it touches the nearest point of the other class, so a ball can never cross the boundary. There is no threshold to tune, and points that sit alone among the other class are flagged as noise.");

// =====================================================================================
// 8. Two moons
// =====================================================================================
s = content("Ball generation", "Two moons: fewer balls with ADPGBG, but no overlap either way");
const m = STATS.moons;
img(s, path.join(FIG, "p1_kmeans_vs_adpgbg.png"), 0.6, 1.55, 7.6, 2.75, { align: "left", alt: "Two-moons data with k-means balls (left) and ADPGBG balls (right)" });
caption(s, "Python re-run, October: two moons, n = 300, noise 0.20, seed 42; k-means at purity 0.985 with balls of under 2 points removed.", 0.6, 4.35, 7.6, 0.5);
table(s, [
  [th(""), th("MATLAB (Aug, old deck)"), th("Python (Oct)"), th("Python (Oct)")],
  [td("Noise", { bold: true }), td("0.08"), td("0.08"), td("0.20")],
  [td("K-means balls", { bold: true }), td("75"), td("9"), td(String(m.kmeans_balls))],
  [td("ADPGBG balls", { bold: true }), td("7"), td("9"), td(String(m.adpgbg_balls))],
  [td("Overlapping pairs, k-means", { bold: true }), td("278"), td("0"), td(String(m.kmeans_conflicts))],
  [td("Overlapping pairs, ADPGBG", { bold: true }), td("0"), td("0"), td(String(m.adpgbg_conflicts))],
], { x: 8.45, y: 1.6, w: 4.25, colW: [1.5, 1.05, 0.85, 0.85], fontSize: 12, rowH: 0.42 });
card(s, 0.6, 4.95, 12.1, 1.05);
s.addText([
  { text: "Open question: ", options: { bold: true, color: C.accent2 } },
  { text: "the MATLAB run reported 278 overlapping pairs (10% of 75 × 74 / 2). The Python re-run gives none at either noise level. The MATLAB run probably counted balls before small ones were removed or used a different radius (inferred, not checked). Later, round 5 of the fuzzy study found no accuracy gain from ADPGBG." },
], tx({ x: 0.8, y: 5.03, w: 11.7, h: 0.9, fontSize: 13.5, valign: "middle" }));
takeaway(s, "ADPGBG gives fewer balls; the 278-conflict claim did not reproduce and must be re-checked before use.");
s.addNotes("This is the two-moons experiment. The old deck showed a MATLAB run where k-means made 75 balls with 278 overlapping pairs and ADPGBG made 7 balls with none. When I re-ran it in Python with the same generator code that the rest of the work uses, k-means made 37 balls and ADPGBG 23 at noise 0.2, and neither had overlapping balls of different classes. At the old noise level of 0.08 both made 9 balls. So the clean part of the story holds: ADPGBG uses fewer balls. The dramatic overlap number does not reproduce, and I think the MATLAB count included tiny balls or a larger radius definition, but I have not confirmed which. In the fuzzy study, round 5, ADPGBG did not improve accuracy either.");

// =====================================================================================
// 9. Setup for weighting models
// =====================================================================================
s = content("Ball weighting models", "How the weighting models were tested");
[["diabetes", "768 points", "imbalance 1.87"], ["ecoli2", "336 points", "imbalance 5.46"], ["vehicle0", "846 points", "imbalance 3.25"]].forEach(([n, a, b], i) => {
  const x = 0.6 + i * 2.02;
  card(s, x, 1.6, 1.92, 1.25);
  s.addText(n, tx({ x: x + 0.15, y: 1.7, w: 1.65, h: 0.4, fontSize: 17, bold: true, color: C.text2 }));
  s.addText([{ text: a, options: { breakLine: true } }, { text: b }], tx({ x: x + 0.15, y: 2.12, w: 1.65, h: 0.65, fontSize: 13, color: C.accent6 }));
});
s.addText(bullets([
  `KEEL imbalanced datasets ${R("keel")}; stratified 70/15/15 split, seed 42, no scaling.`,
  "c1 = 100, c2 = 0.01, purity 0.95, balls of under 2 points removed.",
  "Phase 8 added a validation grid and seeds {0, 1, 2, 3, 4, 42}; later screens used 17 datasets × 3 seeds.",
  [B("Control: "), "every new weight is compared with CW (class weights), not only with plain GBLSTSVM."],
], { space: 8 }), tx({ x: 0.6, y: 3.05, w: 6.0, h: 3.0, fontSize: 14.5 }));
fcard(s, 6.85, 1.6, 5.85, 1.5, "Where a ball weight w enters (plane 1)", [
  "(G^T W G + (1/c_1) H^TH + εI) u_1 = −G^T W (e_2 + R_−)",
  "W = diag(w) over the opposite-class balls",
], { fs: 14 });
codeCard(s, 6.85, 3.25, 5.85, 2.75, "src/cw_gblstsvm.py · solve_cw_gblstsvm_systems", `gram_hp1 = _weighted_gram(mat_G, w_opp_hp1) + (
    1.0 / c1) * _weighted_gram(mat_H, w_own_hp1)
inv_p_1 = np.linalg.inv(gram_hp1 + eye)
e2_R_neg = mat_e2 + R_neg
rhs_1_top = _weighted_matvec(B, w_opp_hp1, e2_R_neg)
rhs_1_bottom = _weighted_matvec(
    mat_e2, w_opp_hp1, mat_e2 + R_neg)
rhs_1 = np.concatenate([rhs_1_top, rhs_1_bottom])
hyper_p_1 = -1.0 * inv_p_1 @ rhs_1.reshape(-1, 1)`);
takeaway(s, "A new weight had to beat class weighting, so any gain had to come from the ball itself.");
s.addNotes("All weighting models were tested the same way. Three imbalanced datasets from KEEL, a fixed split into training, validation and test, and fixed settings. Every model plugs a weight per ball into the same weighted least squares system shown on the right: the weight multiplies that ball's row, so a ball with weight 2 counts like two copies. The important design choice was the control. Weighting by class alone already helps imbalanced data, so a new ball weight only counts as useful if it beats the class-weighted model, CW, not just plain GBLSTSVM.");

// =====================================================================================
// 10. CW, R, CR
// =====================================================================================
s = content("Ball weighting models", "CW, R and CR: does ball reliability add anything?");
[[0.6, "CW: class weight", ["κ_c = n / (2 n_c)", "w_i = κ for the ball's class"]],
 [4.67, "R: ball reliability", ["a_i = ε + (1 − ε) p_i^γ exp(−λ r̃_i (1 − p_i))", "p = purity, r̃ = r / median(r)"]],
 [8.74, "CR: both", ["w_i = κ · a_i", "is CR better than CW?"]],
].forEach(([x, h, l]) => fcard(s, x, 1.6, 3.96, 1.45, h, l, { fs: 14 }));
table(s, [
  [th("Macro F1 difference"), th("diabetes"), th("ecoli2"), th("vehicle0")],
  [td("CW − GBLSTSVM, tuned test"), td(dec(0.003)), td(dec(-0.025)), td(dec(0.011))],
  [td("CW − GBLSTSVM, 6-seed mean"), td(dec(-0.029)), td(dec(-0.008)), td(dec(-0.017))],
  [td("R − GBLSTSVM, tuned test"), td(dec(-0.008)), td(dec(0)), td(dec(-0.012))],
  [td("CR − CW, tuned test", { bold: true }), td(dec(-0.007), { bold: true }), td(dec(0), { bold: true }), td(dec(0), { bold: true })],
  [td("Mean reliability"), td("0.998"), td("0.995"), td("0.999")],
], { x: 0.6, y: 3.25, w: 6.6, colW: [3.0, 1.2, 1.2, 1.2], fontSize: 13, rowH: 0.43 });
codeCard(s, 7.45, 3.25, 5.25, 2.6, "src/reliability.py · ball_reliability_score", `elif variant == "full":
    core = (p**gamma) * float(
        np.exp(-lambda_r * r_tilde * (1.0 - p)))
...
return epsilon + (1.0 - epsilon) * core`);
takeaway(s, "At purity 0.95 every ball is nearly pure, so reliability is about 1 and CR equals CW.");
s.addNotes("The first falsifiable question was: does a ball's reliability, meaning how pure and compact it is, add anything beyond class weighting? CW weights each ball by the inverse of its class frequency. R trusts pure, small balls more. CR multiplies the two. The table shows the result. CW helps a little on diabetes and vehicle0 on the tuned split but is negative on average over seeds. R and CR change almost nothing. The last row explains why: with a purity threshold of 0.95, every ball is almost pure, so the reliability is 0.995 or more for every ball and multiplying by it does nothing. On vehicle0 the CR and CW planes differ slightly, but not a single test prediction changed.");

// =====================================================================================
// 11. BMRU
// =====================================================================================
s = content("Ball weighting models", "BMRU: trust balls that sit far from the decision boundary");
fcard(s, 0.6, 1.6, 4.85, 1.95, "Ball-margin reliability update", [
  "s_i = |f_2(c_i)| − |f_1(c_i)|  (margin at the centre)",
  "u_i = 2 r_i / (|s_i| + ε),   μ_i = exp(−α u_i)",
  "fit → weight → refit, for 3 to 5 rounds",
], { fs: 14 });
codeCard(s, 0.6, 3.7, 4.85, 2.3, "src/bmru.py", `if r == 0.0:
    return 0.0
return (2.0 * r) / (abs(float(margin)) + epsilon)
...
u = bmru_uncertainty(radius, margin, epsilon=epsilon)
mu = float(np.exp(-alpha * u))`);
const bm = STATS.bmru;
img(s, path.join(FIG, "p4_bmru.png"), 5.7, 1.55, 7.0, 3.0, { alt: "BMRU on 2-D two moons and on the 8-feature pima data" });
stat(s, 5.7, 4.65, 2.25, 1.35, "98.7%", "diabetes balls flagged; 0% really cross the boundary", C.accent2, 24);
stat(s, 8.08, 4.65, 2.25, 1.35, "98.2%", "vehicle0 balls flagged; 5.4% cross the boundary", C.accent2, 24);
stat(s, 10.45, 4.65, 2.25, 1.35, "0.40 → 0.00", "vehicle0 minority recall, CW + BMRU vs CW", C.accent2, 24);
takeaway(s, "With 8 or more features every ball is wider than its margin, so BMRU down-weights almost all of them.");
s.addNotes("BMRU asks: is this ball wider than its distance to the decision boundary? If the diameter is large compared with the margin at the centre, the ball probably straddles the boundary, so it gets a lower weight, and the planes are refitted a few times. In two dimensions, on the left of the picture, this looks sensible: none of the 20 balls is flagged. But on real data with 8 or more features, radii grow with the number of features. On pima, on the right, 166 of 195 balls are flagged even though none actually has members on both sides of the boundary. The original runs found the same: 98 percent of balls flagged against 0 to 5 percent really straddling. On vehicle0 it wiped out minority recall. So BMRU was dropped as a failed hypothesis.");

// =====================================================================================
// 12. Overlap
// =====================================================================================
s = content("Ball weighting models", "Overlap weight: boost minority balls that touch the other class");
// diagram of two overlapping balls
s.addShape(pres.shapes.OVAL, { x: 0.9, y: 1.85, w: 2.3, h: 2.3, fill: { color: C.accent3, transparency: 78 }, line: { color: C.accent3, width: 1.5 }, objectName: "ball-i" });
s.addShape(pres.shapes.OVAL, { x: 2.65, y: 2.2, w: 1.6, h: 1.6, fill: { color: C.accent2, transparency: 78 }, line: { color: C.accent2, width: 1.5 }, objectName: "ball-j" });
s.addShape(pres.shapes.LINE, { x: 2.05, y: 3.0, w: 1.4, h: 0, line: { color: C.text1, width: 1.25, dashType: "dash" }, objectName: "d-ij" });
s.addShape(pres.shapes.LINE, { x: 0.9, y: 3.0, w: 1.15, h: 0, line: { color: C.accent3, width: 1.75 }, objectName: "r-i" });
s.addShape(pres.shapes.LINE, { x: 3.45, y: 3.0, w: 0.8, h: 0, line: { color: C.accent2, width: 1.75 }, objectName: "r-j" });
s.addText(eq("r_i"), tx({ x: 1.2, y: 3.05, w: 0.6, h: 0.3, fontSize: 14, bold: true, color: C.accent3 }));
s.addText(eq("r_j"), tx({ x: 3.65, y: 3.05, w: 0.6, h: 0.3, fontSize: 14, bold: true, color: C.accent2 }));
s.addText(eq("d_{ij}"), tx({ x: 2.5, y: 2.68, w: 0.6, h: 0.3, fontSize: 14, bold: true }));
fcard(s, 0.6, 4.35, 4.6, 1.65, null, [
  "O_{ij} = max(0, (r_i + r_j − d_{ij}) / (r_i + r_j + ε))",
  "O_i = mean of the 3 largest O_{ij}",
  "minority μ_i = 1 + αO_i, majority μ_i = 1 − αO_i",
], { fs: 13.5 });
barChart(s, [["Balls with zero overlap", [92.9, 100.0, 61.0]]], ["diabetes", "ecoli2", "vehicle0"], [HEX.accent6], {
  x: 5.45, y: 1.55, w: 3.6, h: 4.45, valAxisMaxVal: 100, valAxisMinVal: 0, valAxisMajorUnit: 25, dataLabelFormatCode: "0.0\"%\"",
  valAxisLabelFormatCode: "0\"%\"", showTitle: true, title: "Balls with zero overlap", titleFontSize: 13, titleColor: HEX.dk2,
});
codeCard(s, 9.3, 1.6, 3.4, 2.7, "src/overlap.py", `denom = ri + rj + epsilon
return float(max(0.0, (ri + rj - d) / denom))
...
if ball.label == minority_label:
    mu[i] = 1.0 + alpha * O[i]
else:
    mu[i] = 1.0 - alpha * O[i]`);
card(s, 9.3, 4.45, 3.4, 1.55);
s.addText([
  { text: "CW + overlap − CW = 0", options: { bold: true, color: C.accent2, breakLine: true } },
  { text: "on every metric for all three datasets; correlation of the weights with CW ≈ 0.998." },
], tx({ x: 9.45, y: 4.55, w: 3.1, h: 1.35, fontSize: 13 }));
takeaway(s, "Pure balls rarely overlap, so the overlap weight was zero for most balls and changed nothing.");
s.addNotes("The overlap idea was: where a minority ball overlaps a majority ball, the boundary is contested, so give that minority ball more weight and the majority ball less. Overlap between two balls is how much the sum of the radii exceeds the distance between the centres, scaled to between 0 and 1. The chart shows the problem: with pure balls, most balls touch nothing. On ecoli2 every overlap score was exactly zero, and on diabetes 93 percent were. Even on vehicle0, the largest overlap was only 0.13. So the weights were almost identical to plain class weights and no metric moved. This was also dropped.");


// =====================================================================================
// 13. CBCM / CA
// =====================================================================================
s = content("Ball weighting models", "CBCM: give weight to contested balls");
fcard(s, 0.6, 1.6, 6.3, 2.2, "Competition among the k nearest balls", [
  "k = max(5, ⌈0.05 N⌉), g_{ij} = exp(−d_{ij}^2 / 2σ_i^2), σ_i = median distance",
  "comp_i = Σ_{opposite} g_{ij} / Σ_j g_{ij}",
  "μA_i = 4 comp_i (1 − comp_i)  (largest at comp = ½)",
  "CA: w = κ · μA     CC: w = κ · μA · μB (μB = density support)",
], { fs: 14 });
codeCard(s, 0.6, 3.95, 6.3, 2.05, "src/cbcm.py · compute_competition_membership", `dists = np.linalg.norm(centers[i] - centers[idx], axis=1)
sigma_i = _adaptive_bandwidth(dists, sigma_eps=sigma_eps)
weights = _gaussian_weights(dists, sigma_i)
opp = labels[idx] != labels[i]
comp_a[i] = float(np.sum(weights[opp]) / w_sum)
...
mu_a = 4.0 * comp_a * (1.0 - comp_a)`);
img(s, path.join(FIG, "p5_cbcm.png"), 7.15, 1.55, 5.55, 4.5, { alt: "k-NN graph of ball centres coloured by competition membership" });
takeaway(s, "CA gives the most weight to balls whose neighbours are half from the other class.");
s.addNotes("CBCM looks at each ball's neighbourhood instead of its own shape. For each ball, take its k nearest balls and work out, with Gaussian weights so closer balls count more, what fraction belong to the other class. That is the competition. A ball surrounded by its own class has competition 0; a ball whose neighbours are half the other class has competition one half. The membership 4 c times 1 minus c turns that into a weight that peaks at one half, so contested boundary balls get the most weight. CA uses only this part; CC also multiplies in a density term. In the picture the dark links go to neighbours of the other class, and the darker balls are the contested ones in the middle.");

// =====================================================================================
// 14. CA results
// =====================================================================================
s = content("Ball weighting models", "CA: one clean gain on vehicle0, unstable elsewhere");
barChart(s, [["CW", [0.6126, 0.5000, 0.6917]], ["CA", [0.6849, 0.5882, 0.7424]]], ["G-mean", "Minority F1", "Macro F1"], [HEX.accent3, HEX.accent1], {
  x: 0.6, y: 1.55, w: 5.9, h: 4.45, valAxisMinVal: 0, valAxisMaxVal: 0.8, valAxisMajorUnit: 0.2, dataLabelFormatCode: "0.000",
  valAxisLabelFormatCode: "0.0", showTitle: true, title: "vehicle0 test split (screen)", titleFontSize: 13, titleColor: HEX.dk2,
});
table(s, [
  [th("Check"), th("CW"), th("CA")],
  [td("vehicle0, 5-fold CV, G-mean"), td("0.710"), td("0.720 ± 0.085")],
  [td("CC vs CW on that CV (Wilcoxon p)"), td("—"), td("p = 1.0")],
  [td("17 datasets × 3 seeds, mean macro F1"), td("0.550", { bold: true }), td("0.537")],
  [td("Datasets where CA beats CW"), td("—"), td("7 of 17")],
  [td("bcw_original, macro F1"), td("0.849", { bold: true }), td("0.397")],
  [td("ecoli2 noise check"), td("—"), td("failed: noise rewarded")],
], { x: 6.75, y: 1.6, w: 5.95, colW: [3.25, 1.05, 1.65], fontSize: 13, rowH: 0.5 });
ref(s, "Mean over 17 datasets computed from topo_broad_screening_aggregate.csv", 5.62);
takeaway(s, "CA's gain on vehicle0 shrank under cross-validation and reversed on other data; it stayed only as a reference.");
s.addNotes("On the vehicle0 test split CA looked good: G-mean up from 0.61 to 0.68 and macro F1 up by five points. That is the bar chart. The table is what happened when I checked it properly. Under 5-fold cross-validation on the same dataset the gap shrank to one point, and the CC variant was no different from CW at all. Across 17 datasets CA was on average slightly worse than CW, better on only 7 of them, and on one dataset it collapsed. On ecoli2 a sanity check with injected noise showed CA rewarding the noisy balls, because noisy balls also look contested. So CA was marked promising but unstable and kept only as the reference for the next ideas.");

// =====================================================================================
// 15. IPA and Topo
// =====================================================================================
s = content("Ball weighting models", "IPA and Topo: two fixes for CA's noise problem");
fcard(s, 0.6, 1.6, 6.3, 1.4, "IPA: penalise isolated balls", [
  "A = 2 min(c, 1 − c);  ρ_i = q_i / median_y(q), q = distance to nearest same-class ball",
  "μ_i = A / (1 + λ max(0, ρ_i − 1))",
], { fs: 13.5 });
fcard(s, 0.6, 3.1, 6.3, 1.4, "Topo and SupportAware-Topo: count only mutual links", [
  "Topo: μ_i = A · R_{opp}, R_{opp} = n_{recip} / (n_{opp} + ε)",
  "SA-Topo: c = n_{opp} / (n_{opp} + 1), R^S = c R_{opp} + (1 − c)",
], { fs: 13.5 });
table(s, [
  [th("vs CA"), th("Result")],
  [td("IPA", { bold: true }), td("vehicle0 G-mean −0.020, ecoli2 +0.011, diabetes 0")],
  [td("Topo, 51 runs", { bold: true }), td("macro F1 wins/ties/losses 16 / 15 / 20, mean −0.001")],
  [td("SA-Topo, 51 runs", { bold: true }), td("15 / 20 / 16, mean +0.003; erased Topo's best win")],
], { x: 0.6, y: 4.6, w: 6.3, colW: [1.6, 4.7], fontSize: 12, rowH: 0.36 });
img(s, path.join(FIG, "p6_topo.png"), 7.15, 1.55, 5.55, 4.5, { alt: "Opposite-class links between balls, mutual links solid" });
takeaway(s, "Neither IPA nor Topo beat CA consistently, so the neighbourhood family was closed.");
s.addNotes("Two follow-ups tried to stop CA from rewarding noise. IPA says a contested ball that is also far from any ball of its own class is probably noise, so its weight is divided by how isolated it is. Topo says a contested link only counts if it is mutual: ball i lists ball j among its nearest neighbours and j lists i back. In the picture the solid links are mutual and the dotted ones are one-way. SupportAware-Topo softens Topo when a ball has very few opposite-class neighbours. The table shows the results against CA. IPA helped on ecoli2 but hurt on vehicle0. Over 51 runs, Topo and SA-Topo won about as often as they lost. So this whole family of neighbourhood weights was closed.");

// =====================================================================================
// 16. Summary of weights
// =====================================================================================
s = content("Ball weighting models", "Ten weighting ideas, one survivor");
const V = (t, ok) => td(t, { bold: true, color: ok ? C.accent1 : C.accent2 });
table(s, [
  [th("Model"), th("What gets more weight"), th("Best evidence"), th("Verdict")],
  [td("CW", { bold: true }), td("balls of the smaller class"), td("vehicle0 minority recall 0.33 → 0.40"), V("kept as control", true)],
  [td("R", { bold: true }), td("pure, compact balls"), td("reliability ≈ 1, no change"), V("rejected")],
  [td("CR", { bold: true }), td("class × reliability"), td("CR − CW ≤ 0 on every dataset"), V("rejected")],
  [td("BMRU", { bold: true }), td("balls far from the margin"), td("98% of balls flagged"), V("rejected")],
  [td("Overlap (OBRU)", { bold: true }), td("overlapping minority balls"), td("overlap 0 for 61–100% of balls"), V("rejected")],
  [td("CBCM: CA, CC", { bold: true }), td("contested balls"), td("vehicle0 only; 7 of 17 datasets"), V("reference only")],
  [td("IPA", { bold: true }), td("contested, not isolated"), td("mixed vs CA"), V("rejected")],
  [td("Topo, SA-Topo", { bold: true }), td("contested with mutual links"), td("16 / 15 / 20 vs CA"), V("not promoted")],
], { x: 0.6, y: 1.6, w: 12.1, colW: [2.3, 3.4, 4.1, 2.3], fontSize: 14, rowH: 0.48 });
takeaway(s, "Only class weighting survived, which is why the fuzzy study compared every membership against a fair baseline.");
s.addNotes("This table puts the weighting ideas side by side. Counting the variants, that is about ten ideas. The pattern is clear: anything that depends on purity or overlap does nothing because the balls are almost pure, and anything that depends on the margin or the neighbourhood is unstable from dataset to dataset. Only class weighting gave a gain, and that gain was small. This is the main reason the fuzzy study later insisted on cross-validation, many datasets and a fair baseline before believing any improvement.");

// =====================================================================================
// 17. Granulation variants
// =====================================================================================
s = content("Granulation and compression", "Changing how balls are split did not help either");
table(s, [
  [th("Variant"), th("Idea"), th("Result"), th("Verdict")],
  [td("Split-utility gate", { bold: true }), td("refuse 2-means splits that peel off a few minority points"), td("minority survival 0.58 → 0.99, but macro F1 −0.014"), V("rejected")],
  [td("Online entropy order", { bold: true }), td("always split the most mixed ball first"), td("F1 0.613 vs 0.597, but 52% of runs collapse"), V("rejected")],
  [td("Ball budget", { bold: true }), td("stop at a ball count, not a purity"), td("best budget F1 0.514 vs 0.597 at purity 0.90"), V("rejected")],
  [td("Ranked compression", { bold: true }), td("keep the K most useful balls"), td("all ranking rules gave identical scores (likely a bug)"), V("unclear")],
  [td("Validation-chosen K", { bold: true }), td("pick K on the validation split"), td("+0.039 F1 (p = 0.002), but the control was not matched"), V("overruled")],
], { x: 0.6, y: 1.6, w: 12.1, colW: [2.35, 3.6, 4.25, 1.9], fontSize: 13.5, rowH: [0.45, 0.72, 0.72, 0.72, 0.72, 0.72] });
ref(s, "17 datasets × 10 seeds; purity-0.90 builder as reference", 5.72);
takeaway(s, "Session 4 found that deleting small balls loses 42% of minority points, a problem the fuzzy study came back to.");
s.addNotes("Sessions 4 to 6 tried to change the ball builder itself. A diagnostic in Session 4 showed that 2-means often splits off a few minority points into a tiny ball, which is then deleted, so only 58 percent of minority points survive. The split-utility gate blocked those splits and kept 99 percent of minority points, but accuracy still went down. Splitting the most mixed ball first, or stopping at a fixed number of balls, were both worse than the plain builder at purity 0.90. A ranking experiment gave identical numbers for every ranking rule, which points to a bug rather than a finding. And a validation-chosen ball count looked significant until we noticed its control was not matched. The deletion problem at the bottom is exactly what the fuzzy study later measured properly.");

// =====================================================================================
// 18. Session 7
// =====================================================================================
s = content("Granulation and compression", "Session 7: balls help only by compressing the data");
const S7 = [["Singleton (no balls)", 0.4775], ["Re-granulate ρ 0.80", 0.6211], ["ρ 0.85", 0.6193], ["ρ 0.90", 0.6179], ["ρ 0.95", 0.6116], ["ρ 0.98", 0.6038], ["Stratified sample", 0.6179], ["Full ρ 0.90", 0.584]];
barChart(s, [["Mean macro F1", S7.map(r => r[1])]], S7.map(r => r[0]), [HEX.accent6, HEX.accent1, HEX.accent1, HEX.accent1, HEX.accent1, HEX.accent1, HEX.accent5, HEX.accent2], {
  x: 0.6, y: 1.55, w: 7.6, h: 4.5, valAxisMinVal: 0, valAxisMaxVal: 0.7, valAxisMajorUnit: 0.1, dataLabelFormatCode: "0.000",
  valAxisLabelFormatCode: "0.0", catAxisLabelFontSize: 11, showTitle: true, title: "Mean macro F1, 17 datasets × 10 seeds, same sample indices", titleFontSize: 13, titleColor: HEX.dk2,
});
card(s, 8.45, 1.6, 4.25, 4.45);
s.addText(bullets([
  [B("Same points: "), "every arm starts from the same sample indices (hash-checked)."],
  [B("Balls vs single points: "), ...eq("+0.13 to +0.14 macro F1, Wilcoxon p < 10^{−57}.")],
  [B("Balls vs a stratified sample of the same size: "), "0.6179 each."],
  [B("Verdict (CASE B): "), "no advantage from ball structure beyond sample-level compression and class weights."],
], { space: 10 }), tx({ x: 8.65, y: 1.8, w: 3.9, h: 4.15, fontSize: 14 }));
takeaway(s, "A stratified sample of the same size did exactly as well as the balls.");
s.addNotes("The last session was a careful ablation. Every method started from exactly the same subset of training points, checked by hash. Turning those points into balls, at any purity from 0.80 to 0.98, beat using the points one by one by about 13 to 14 points of macro F1, which looks like a big win for balls. But a plain stratified sample with the same number of points, the yellow bar, scored exactly the same as balls at purity 0.90. So the gain comes from compressing and rebalancing the data, not from anything special about balls. The recommendation in early September was to stop inventing new ball heuristics. M0 to M3, next, tested one last idea: letting the classifier guide the splitting. After that the project moved to fuzzy membership and to asking which points the balls throw away.");


// =====================================================================================
// 19. Why classifier-guided
// =====================================================================================
s = content("M0–M3 classifier-guided balls", "Why let the classifier guide ball splitting");
s.addText("Original pipeline (M0)", tx({ x: 0.6, y: 1.6, w: 4.6, h: 0.35, fontSize: 16, bold: true, color: C.text2 }));
["All training points start in one ball", "Compute centre, radius, label, purity", "If purity < threshold, split with 2-means", "Repeat for impure children", "Delete very small balls", "Pass [centre, radius, label] to GBLSTSVM"].forEach((t, i) => {
  const y = 2.05 + i * 0.66;
  card(s, 0.6, y, 4.6, 0.54, { name: "step" });
  badge(s, 0.72, y + 0.07, String(i + 1), C.accent6, 0.4, 13);
  s.addText(t, tx({ x: 1.25, y, w: 3.9, h: 0.54, fontSize: 13.5, valign: "middle" }));
});
s.addText("What it cannot see", tx({ x: 5.6, y: 1.6, w: 7.1, h: 0.35, fontSize: 16, bold: true, color: C.text2 }));
[["Classifier-blind", "Two balls of equal purity get the same treatment, even if one sits on the decision boundary."],
 ["Pure boundary balls are ignored", "A first score multiplied entropy by the boundary signal, so a pure ball always scored 0."],
 ["Weights were never used", "Reliability values were computed and stored, but the solver still saw only centre, radius and label."],
 ["Thresholds do not transfer", "A fixed score threshold such as 0.05 is too strict on one dataset and too loose on another."],
].forEach(([h, b], i) => {
  const y = 2.05 + i * 0.99;
  card(s, 5.6, y, 7.1, 0.88);
  s.addText([{ text: h, options: { bold: true, color: C.accent2, breakLine: true } }, { text: b }], tx({ x: 5.8, y: y + 0.07, w: 6.75, h: 0.76, fontSize: 13.5 }));
});
takeaway(s, "Purity alone cannot tell an easy interior ball from a ball on the decision boundary.");
s.addNotes("After the weighting experiments, the last idea was to change where balls are split. The original pipeline, on the left, only looks at purity. It cannot tell whether a ball is deep inside its class, where splitting is wasted, or right on the boundary, where finer balls could move the planes. My first attempt had a flaw: it multiplied entropy by the boundary signal, so a pure ball on the boundary scored zero and was never refined. Also, the reliability weights from earlier were computed but never actually entered the solver. The M0 to M3 design fixes these.");

// =====================================================================================
// 20. M1
// =====================================================================================
s = content("M0–M3 classifier-guided balls", "M1: split the balls the current planes are unsure about");
const m1 = STATS.m1;
img(s, path.join(FIG, "p2_m1_refinement.png"), 0.6, 1.55, 7.75, 3.1, { align: "left", alt: "Coarse balls with provisional planes, and the balls after margin-guided refinement" });
caption(s, `Two moons, n = 400, noise 0.25. ${m1.coarse_balls} coarse balls become ${m1.final_balls} after ${m1.rounds} rounds; ${m1.accepted} of ${m1.attempted} proposed splits were kept.`, 0.6, 4.72, 7.75, 0.3);
["Coarse balls", "Fit planes", "Score balls", "Try a 2-means split", "Keep if gain > min"].forEach((t, i) => {
  const x = 0.6 + i * 1.57;
  card(s, x, 5.2, 1.42, 0.75, { fill: i === 4 ? C.accent1 : C.background2, name: "loop-step" });
  s.addText(t, tx({ x: x + 0.06, y: 5.2, w: 1.3, h: 0.75, fontSize: 12.5, bold: true, align: "center", valign: "middle", color: i === 4 ? C.background1 : C.text2 }));
  if (i < 4) s.addText("›", tx({ x: x + 1.42, y: 5.2, w: 0.15, h: 0.75, fontSize: 18, bold: true, color: C.accent6, align: "center", valign: "middle" }));
});
fcard(s, 8.6, 1.6, 4.1, 4.4, null, [
  [{ text: "Plane ambiguity", options: { bold: true, color: C.text2 } }],
  "d_k = |w_k^Tc_j + b_k| / ‖w_k‖",
  "A_j = 1 − |d_1 − d_2| / (d_1 + d_2)",
  [{ text: "Boundary signal", options: { bold: true, color: C.text2, paraSpaceBefore: 6 } }],
  "B_j = (1 − ρ) A_j + ρ O_j",
  [{ text: "Refinement score (29 Sep)", options: { bold: true, color: C.text2, paraSpaceBefore: 6 } }],
  "S_j = Z_j [(1 − μ) H_j^α + μ B_j^β]",
  "Z_j = log(1 + n_j) / log(1 + n_{max})",
  [{ text: "Split acceptance", options: { bold: true, color: C.text2, paraSpaceBefore: 6 } }],
  "gain = S_{parent} − Σ (n_c / n_p) S_c − λ",
], { fs: 14, space: 2 });
takeaway(s, "M1 spends extra balls only where the current planes cannot tell the classes apart.");
s.addNotes("M1 is margin-guided generation. Start from coarse balls, fit provisional planes, and score each ball by how unsure the planes are about it: if a ball centre is about equally far from both planes, its ambiguity is close to 1. That is mixed with an overlap term into a boundary signal, and with label entropy and a size factor into a refinement score. High-scoring balls are split with 2-means, but the split is only kept if the children's score drops by more than a small complexity penalty. Then the planes are refitted and the loop repeats. In the picture, darker balls on the left have higher scores, and the black-outlined balls on the right came from accepted splits. Most new balls sit in the middle where the moons meet.");

// =====================================================================================
// 21. M1 code
// =====================================================================================
s = content("M0–M3 classifier-guided balls", "M1 in code: score each ball, keep a split only if it pays");
codeCard(s, 0.6, 1.6, 6.0, 2.7, "gen_ball_new.py · _hyperplane_ambiguity", `d1 = abs(np.dot(c, w1) + b1) / (np.linalg.norm(w1) + _EPS)
d2 = abs(np.dot(c, w2) + b2) / (np.linalg.norm(w2) + _EPS)
gap = abs(d1 - d2)
ambiguity = 1.0 - gap / (d1 + d2 + _EPS)
return float(np.clip(ambiguity, 0.0, 1.0))`);
codeCard(s, 0.6, 4.4, 6.0, 1.65, "gen_ball_new.py · refine_balls_margin_guided", `gain = (parent.refinement_score
        - weighted_child_score - complexity_penalty)
if gain > min_gain:
    gb.granular_balls[parent_index] = children[0]
    gb.granular_balls.append(children[1])`);
codeCard(s, 6.85, 1.6, 5.85, 2.7, "gen_ball_new.py · _update_dynamic_metrics", `boundary_signal = ((1.0 - overlap_mix) * ball.ambiguity
                   + overlap_mix * ball.overlap)
ball.refinement_score = float(
    (ball.entropy ** entropy_power)
    * (boundary_signal ** boundary_power)
    * ball.size_factor)`);
card(s, 6.85, 4.4, 5.85, 1.6);
s.addText([
  { text: "Note on the score: ", options: { bold: true, color: C.accent2 } },
  { text: "the code in the zip still multiplies entropy by the boundary signal, so a pure boundary ball scores 0. The 29 Sep report switched to the additive form " },
  ...eq("S = Z[(1 − μ)H^α + μB^β]"),
  { text: " and added a pure-margin path; that version is not in the zip." },
], tx({ x: 7.05, y: 4.5, w: 5.45, h: 1.4, fontSize: 13, valign: "middle" }));
takeaway(s, "The split rule is greedy and cheap: one 2-means call and one score per candidate ball.");
s.addNotes("Here is the code behind M1. Top left is the ambiguity: the distances from the ball centre to both planes, normalised, and one minus their relative gap. Top right combines ambiguity and overlap into the boundary signal and the refinement score. Bottom left is the acceptance rule: a split replaces the parent with its two children only if the gain beats the minimum. One honest caveat on the right: the code I have still uses the multiplicative score, which gives pure balls a score of zero. The 29 September report describes the fixed additive score, so the two should be brought in line before anything is reported.");

// =====================================================================================
// 22. M2
// =====================================================================================
s = content("M0–M3 classifier-guided balls", "M2: weight each ball by how sure we are of its label");
const m2 = STATS.m2;
img(s, path.join(FIG, "p3_m2_weights.png"), 0.6, 1.55, 5.75, 4.5, { align: "left", alt: "M0 balls shaded by their M2 weight, with the provisional planes" });
fcard(s, 6.6, 1.6, 6.1, 2.35, null, [
  "θ_j | data ~ Beta(k_j + 1, n_j − k_j + 1),  reliability_j = 2.5% quantile",
  "w_j = reliability_j (1 + η B_j)",
  "w̃_j = w_j^p / mean_{class}(w^p)",
  [{ text: "k = points agreeing with the label, n = ball size, B = boundary signal, η = boost. Weights go into the same weighted solve as CW.", options: { color: C.accent6, fontSize: 12, paraSpaceBefore: 6 } }],
], { fs: 14 });
codeCard(s, 6.6, 4.1, 6.1, 1.95, "experiments/run_m0_m3.py · fit_model", `weights_pos = class_mean_normalize(weights_pos)
weights_neg = class_mean_normalize(weights_neg)
w1, b1, w2, b2 = solve_cw_gblstsvm_systems(
    A, R_pos, B, R_neg, args.c1, args.c2,
    weights_pos, weights_neg,
    weight_placement=args.weight_placement)`);
takeaway(s, "M2 keeps the M0 balls and changes only how much each one counts in the solve.");
s.addNotes(`M2 leaves the balls alone and changes their weights. The reliability of a ball is a cautious estimate of its purity: the lower end of a 95 percent interval from a Beta distribution, so a ball of 2 points that agree gets a much lower value than a ball of 50 points that agree. That is multiplied by one plus a boost times the boundary signal, so informative boundary balls count a bit more, and the weights are rescaled to mean 1 within each class so they do not silently change c1 and c2. In the picture, ${m2.balls} balls are shaded by weight, which ranges from ${m2.w_min.toFixed(2)} to ${m2.w_max.toFixed(2)} here; the numbers are written on the larger balls. The tiny balls get small weights because their purity interval is wide.`);

// =====================================================================================
// 23. M0–M3 design
// =====================================================================================
s = content("M0–M3 classifier-guided balls", "A 2 × 2 design separates the two ideas");
table(s, [
  [th("Model"), th("Ball generation"), th("Weighting"), th("Tests")],
  [td("M0", { bold: true, color: C.accent2 }), td("purity splitting"), td("none"), td("baseline")],
  [td("M1", { bold: true }), td("margin-guided refinement"), td("none"), td("does better splitting help?")],
  [td("M2", { bold: true }), td("purity splitting"), td("reliability weights"), td("do weights help?")],
  [td("M3", { bold: true, color: C.accent1 }), td("margin-guided refinement"), td("reliability weights"), td("both together")],
], { x: 0.6, y: 1.6, w: 7.0, colW: [0.9, 2.3, 1.8, 2.0], fontSize: 14, rowH: 0.52 });
card(s, 0.6, 4.4, 7.0, 1.6);
s.addText([
  { text: "Leakage-safe tuning", options: { bold: true, color: C.text2, breakLine: true } },
  { text: "Test split held out once. Three CV stages on the training part: base (purity, c1, c2, deletion), margin (thresholds, mixes, powers, penalty, rounds) and weight (boost, power, placement). Scaling fitted on each training fold only." },
], tx({ x: 0.8, y: 4.5, w: 6.6, h: 1.45, fontSize: 13 }));
card(s, 7.85, 1.6, 4.85, 4.4);
s.addText("Diagnostics recorded per run", tx({ x: 8.05, y: 1.75, w: 4.5, h: 0.35, fontSize: 16, bold: true, color: C.text2 }));
s.addText(bullets([
  "number of balls",
  "attempted and accepted splits",
  "mean and max plane ambiguity",
  "spread of refinement scores",
  "weight spread, within each class",
  "share of test predictions that change between two models",
], { space: 7 }), tx({ x: 8.05, y: 2.25, w: 4.5, h: 3.6, fontSize: 14 }));
takeaway(s, "The diagnostics show whether a mechanism actually changed the balls, the weights or the predictions.");
s.addNotes("M0 to M3 is a two by two design: better splitting on or off, weights on or off. That way a gain in M3 can be traced to one of the two ideas. Tuning is done only by cross-validation on the training part, in three stages, and the test split is touched once at the end. The diagnostics on the right were added because of the earlier sessions: several models there turned out to change nothing at all, and accuracy alone does not reveal that. Counting accepted splits and the share of predictions that changed tells us immediately whether a mechanism is active.");

// =====================================================================================
// 24. Breast-cancer results
// =====================================================================================
s = content("M0–M3 classifier-guided balls", "Breast cancer: M1 lifted accuracy, weights added nothing");
barChart(s, [["Accuracy", [87.72, 94.74, 88.60, 94.74]], ["Balanced accuracy", [87.30, 93.85, 88.00, 93.85]], ["Macro F1", [86.93, 94.29, 87.81, 94.29]]],
  ["M0", "M1", "M2", "M3"], [HEX.accent6, HEX.accent1, HEX.accent5], {
    x: 0.6, y: 1.55, w: 6.6, h: 4.5, valAxisMinVal: 80, valAxisMaxVal: 100, valAxisMajorUnit: 5, dataLabelFormatCode: "0.0", dataLabelFontSize: 10,
    valAxisLabelFormatCode: "0", showTitle: true, title: "Tuned holdout, % (29 Sep report)", titleFontSize: 13, titleColor: HEX.dk2,
  });
table(s, [
  [th("Pair"), th("Predictions changed")],
  [td("M0 vs M1"), td("14.04%")],
  [td("M0 vs M2"), td("0.88%")],
  [td("M1 vs M3"), td("0.00%")],
  [td("M2 vs M3"), td("13.16%")],
], { x: 7.45, y: 1.6, w: 5.25, colW: [2.6, 2.65], fontSize: 13, rowH: 0.36 });
caption(s, "Balls: M0 and M2 12, M1 and M3 3 (one accepted split).", 7.45, 3.5, 5.25, 0.3);
card(s, 7.45, 3.95, 5.25, 2.05);
s.addText([
  { text: "Caveats", options: { bold: true, color: C.accent2, breakLine: true } },
  { text: "One dataset and one split, so not a general claim. In the untuned runs saved in the zip (scikit-learn breast cancer, purity 0.95), M1 accepted no splits and M2 lowered test macro F1 from 0.697 to 0.638." },
], tx({ x: 7.65, y: 4.05, w: 4.85, h: 1.85, fontSize: 13 }));
takeaway(s, "M1 raised accuracy from 87.7% to 94.7% on one split; M2 moved under 1% of predictions.");
s.addNotes("These are the tuned results from the 29 September report. Margin-guided generation, M1, raised accuracy from 87.7 to 94.7 percent, and balanced accuracy and macro F1 rose by the same amount. It changed 14 percent of predictions, so the mechanism really did something. Interestingly the tuned M1 ended up with only 3 balls. Weighting, M2, changed less than one percent of predictions, and M3 made exactly the same predictions as M1. The caveat matters: this is one dataset and one split, and the untuned runs saved with the code show the opposite pattern. The plan at that point was to test the fixed benchmark collection before claiming anything, which is where the fuzzy study picked up.");

// =====================================================================================
// 25. Related work
// =====================================================================================
s = content("Wrap-up", "Related work that limits what we can claim");
[
  ["GBLSTSVM", "gblstsvm", "the baseline: LSTSVM trained on ball centres and radii"],
  ["ADPGBG", "adpgbg", "better ball generation is an established direction"],
  ["GBG++", "gbgpp", "fast, stable generation without k-means"],
  ["Shadowed balls", "shadow", "entropy and three-way decisions on balls: entropy alone is not new"],
  ["Local-density balls", "density", "density-chosen centres"],
  ["Granularity tuning", "tuning", "adaptive radius and heterogeneous overlap"],
  ["GB fuzzy TSVM", "gbfuzzy", "fuzzy weights on balls in a twin SVM: closest to a fuzzy extension"],
  ["GB intuitionistic fuzzy TSVM", "gbif", "intuitionistic fuzzy ball weights for imbalance and noise"],
  ["Boundary-driven balls", "boundary", "balls generated from the class boundary"],
].forEach(([n, k, w], i) => {
  const col = i < 5 ? 0 : 1, row = col ? i - 5 : i;
  const x = 0.6 + col * 6.15, y = 1.6 + row * 0.9;
  card(s, x, y, 5.95, 0.8, { name: "paper" });
  s.addText([{ text: `${n} ${R(k)}`, options: { bold: true, color: C.text2, breakLine: true } }, { text: w }], tx({ x: x + 0.2, y: y + 0.06, w: 5.6, h: 0.7, fontSize: 13, valign: "middle" }));
});
takeaway(s, "Entropy, overlap, radius tuning and fuzzy ball weights are all published, so a new claim must be narrower.", 6.25);
s.addNotes("These nine papers came up while positioning the work. Several of them already cover what we tried: entropy on balls, boundary-aware generation, overlap and radius tuning, and two papers that already put fuzzy or intuitionistic fuzzy weights on granular balls in a twin SVM. That means a paper cannot claim fuzzy ball weights as new in themselves. It has to say something narrower and testable, which is how the fuzzy study ended up as an analysis of where balls help and where they hurt.");

// =====================================================================================
// 26. Lessons
// =====================================================================================
s = content("Wrap-up", "What this phase taught us, and where the fuzzy study picked up");
[["1", "Beat a fair baseline", "Class weighting alone explained most gains.", "every membership is compared with GBLSTSVM and plain LSTSVM under the same tuning."],
 ["2", "Pure balls make weights flat", "Reliability ≈ 1 and overlap = 0 for most balls.", "over 99% of k-means balls turned out to be pure, so ball-level scores collapse."],
 ["3", "Deletion costs the minority", "Only 58% of minority points survive small-ball deletion.", "keeping single-point balls lifts GBLSTSVM by 3.2 points (Holm p = 0.002)."],
 ["4", "One split misleads", "CA, validation K and M1 looked good on one split.", "cross-validation, 21 datasets, 10 splits and Holm-corrected tests."],
].forEach(([n, h, a, b], i) => {
  const x = 0.6 + i * 3.06, w = 2.94;
  card(s, x, 1.6, w, 4.4);
  badge(s, x + 0.2, 1.8, n, C.accent1, 0.5, 16);
  s.addText(h, tx({ x: x + 0.2, y: 2.45, w: w - 0.4, h: 0.75, fontSize: 17, bold: true, color: C.text2 }));
  s.addText(a, tx({ x: x + 0.2, y: 3.25, w: w - 0.4, h: 1.0, fontSize: 13.5 }));
  s.addShape(pres.shapes.LINE, { x: x + 0.2, y: 4.3, w: w - 0.4, h: 0, line: { color: GRID, width: 1 }, objectName: "divider" });
  s.addText([{ text: "In the fuzzy study: ", options: { bold: true, color: C.accent1 } }, { text: b }], tx({ x: x + 0.2, y: 4.4, w: w - 0.4, h: 1.5, fontSize: 13 }));
});
takeaway(s, "These lessons set up the fuzzy study: fair tuning, many datasets, and a close look at what the balls discard.");
s.addNotes("To close, four lessons from this phase and how each one shaped the fuzzy study. First, always compare with a fair baseline; here that was class weighting, and later it was plain LSTSVM under the same cross-validation. Second, when balls are pure, any weight built from purity or overlap is flat; the fuzzy study later showed that over 99 percent of k-means balls are pure. Third, deleting small balls throws away minority and boundary points; the fuzzy study measured this and found that simply keeping single-point balls lifts GBLSTSVM by about three points. Fourth, single splits mislead, so everything since then uses cross-validation over 21 datasets and corrected significance tests.");

// =====================================================================================
// 27. References
// =====================================================================================
s = content("Wrap-up", "References");
const half = Math.ceil(REFS.length / 2);
[REFS.slice(0, half), REFS.slice(half)].forEach((list, col) => {
  s.addText(list.map(([, t], i) => ({ text: `[${col * half + i + 1}] ${t}`, options: { breakLine: i < list.length - 1, paraSpaceAfter: 5 } })),
    tx({ x: 0.6 + col * 6.15, y: 1.55, w: 5.95, h: 5.3, fontSize: 10.5 }));
});
s.addNotes("References for the papers and code mentioned in this deck. The last entry is my own research code, which holds every model shown here.");

(async () => {
  await pres.writeFile({ fileName: OUT });
  await applyTheme(OUT, THEME);
  const removed = await dropInnerParagraphProps(OUT);
  console.log("wrote", OUT, `(${removed} inner paragraph properties removed)`);
})();
