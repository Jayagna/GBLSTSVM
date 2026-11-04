// Builds post_midsem.pptx: the novelty check and why the GBLSTSVM paper reports GBLSTSVM > LSTSVM
// while our fair-CV runs show the opposite (4 Nov 2026).
// Run: PPTX_SKILL_DIR=<pptx skill dir> NODE_PATH=<dir with pptxgenjs> node build_post_midsem_deck.js [out.pptx]
// Numbers: results/lstsvm_test_tuning/summary.csv (both models, fair CV vs tuned on the test set),
// results/noise_diagnostics/summary.md, results/paper, and the GBLSTSVM paper (arXiv 2410.17338v2, Table 1).
// Text source: /mnt/project-files/research/novelty_and_paper_gap.md. Helpers copied from ../prior/build_prior_deck.js.
const fs = require("fs");
const path = require("path");
const pptxgen = require("pptxgenjs");
const { applyTheme } = require(process.env.PPTX_SKILL_DIR + "/scripts/apply_theme.js");

const OUT = process.argv[2] || path.join(__dirname, "post_midsem.pptx");

const THEME = {
  name: "Granular Petrol",
  headFontFace: "Cambria",
  bodyFontFace: "Calibri",
  colors: {
    dk1: "17242A", lt1: "FFFFFF", dk2: "12333D", lt2: "EEF3F2",
    accent1: "00897B", // teal: fair CV / our fix
    accent2: "C0492F", // brick: GBLSTSVM
    accent3: "2B63C6", // blue: plain LSTSVM
    accent4: "7B4FB0", // violet
    accent5: "B88200", // amber: tuned on the test set / the paper
    accent6: "5A7A82", // slate: secondary text
    hlink: "00897B", folHlink: "5A7A82",
  },
};
const HEX = THEME.colors;
const GRID = "DCE5E4";
const CODE_FONT = "Courier New";

const pres = new pptxgen();
pres.layout = "LAYOUT_WIDE"; // 13.33 x 7.5 in
pres.title = "GBLSTSVM after the midsem: novelty check and the paper gap";
pres.author = "Jayagna";
pres.theme = { headFontFace: THEME.headFontFace, bodyFontFace: THEME.bodyFontFace };
const C = pres.SchemeColor;

// ---------------------------------------------------------------- references
const REFS = [
  ["lstsvm", "M. A. Kumar, M. Gopal. Least squares twin support vector machines for pattern classification. Expert Systems with Applications 36(4):7535–7543, 2009."],
  ["gblstsvm", "M. Tanveer, R. K. Sharma, A. Quadir, M. Sajid. Enhancing robustness and efficiency of least square twin SVM via granular computing. Pattern Recognition 170, 112021, 2026; arXiv 2410.17338v2. (GBLSTSVM)"],
  ["gbcode", "GBLSTSVM authors' code, github.com/mtanveer1/GBLSTSVM (main.py, GBLSTSVM.py), read 4 Nov 2026."],
  ["sdap", "A. Quadir, M. Rahaman, P. N. Suganthan, M. Tanveer. Granular-ball fuzzy RVFL network (SDAP-GBRVFL). arXiv 2609.29670, 2026."],
  ["gbfsvm", "S. Xia, X. Lian, Y. Shao. Granular-ball fuzzy set and its implementation in SVM. IEEE, 2024 (IEEE Xplore 10574194); arXiv 2210.11675. (GBFSVM)"],
  ["gbfuzzy", "G. Lang, L. Zhao, D. Miao, W. Ding. Granular-ball computing-based fuzzy twin support vector machine for pattern classification. IEEE Trans. Fuzzy Systems 33(7):2148–2160, 2025. (GBFTSVM)"],
  ["gbif", "X. Liu, G. Xie, J. Xie. A granular-ball intuitionistic fuzzy twin support vector machine with RVFL-based feature enhancement for imbalance learning. Int. J. Data Science and Analytics 22:225, 2026. (RGBIFTSVM)"],
  ["fknn", "J. M. Keller, M. R. Gray, J. A. Givens. A fuzzy k-nearest neighbor algorithm. IEEE Trans. Systems, Man, and Cybernetics 15(4):580–585, 1985."],
  ["iftsvm", "S. Rezvani, X. Wang, F. Pourpanah. Intuitionistic fuzzy twin support vector machines. IEEE Trans. Fuzzy Systems 27(11):2140–2151, 2019."],
  ["brodley", "C. E. Brodley, M. A. Friedl. Identifying mislabeled training data. J. Artificial Intelligence Research 11:131–167, 1999."],
  ["cl", "C. Northcutt, L. Jiang, I. Chuang. Confident learning: estimating uncertainty in dataset labels. J. Artificial Intelligence Research 70:1373–1411, 2021."],
  ["demsar", "J. Demšar. Statistical comparisons of classifiers over multiple data sets. J. Machine Learning Research 7:1–30, 2006."],
  ["ours", "Jayagna/GBLSTSVM, branch claude/project-thread-bwmgim: experiments/run_lstsvm_test_tuning.py, run_gbftsvm_cv.py, noise_diagnostics.py; results/lstsvm_test_tuning, results/paper."],
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
    { text: { text: "GBLSTSVM · After the midsem", options: { x: 0.6, y: 7.02, w: 8, h: 0.3, fontSize: 10, color: C.accent6 } } },
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

// ---------------------------------------------------------------- data
const ROWS = fs.readFileSync(path.join(__dirname, "data", "lstsvm_vs_gblstsvm.csv"), "utf8").trim().split("\n");
const HEAD = ROWS[0].split(",");
const DATA = ROWS.slice(1).map(l => Object.fromEntries(l.split(",").map((v, i) => [HEAD[i], i < 2 ? v : Number(v)])));
const NOISE = ["0%", "10%", "20%", "30%"];
const col = (metric, key) => NOISE.map(n => DATA.find(r => r.noise === n && r.metric === metric)[key]);
const r1 = v => Math.round(v * 10) / 10;
const f1 = v => v.toFixed(1);
const ACC = { lc: col("accuracy", "LSTSVM_cv"), gc: col("accuracy", "GBLSTSVM_cv"), lt: col("accuracy", "LSTSVM_test_tuned"), gt: col("accuracy", "GBLSTSVM_test_tuned"), mixed: col("accuracy", "gb_test_tuned_minus_lstsvm_cv") };
const BA = { lc: col("balanced_accuracy", "LSTSVM_cv"), gc: col("balanced_accuracy", "GBLSTSVM_cv"), lt: col("balanced_accuracy", "LSTSVM_test_tuned"), gt: col("balanced_accuracy", "GBLSTSVM_test_tuned"),
  wins: col("balanced_accuracy", "gb_wins_test_tuned"), p: col("balanced_accuracy", "p_test_tuned") };
const PAPER = { l: [86.67, 84.82, 83.79, null], g: [88.26, 87.47, 86.09, null] }; // GBLSTSVM paper, Table 1 (linear)
// flipped-label detection AUCs, results/residual_probe (10/20/30% noise)
const PROBE = (() => {
  const rows = fs.readFileSync(path.join(__dirname, "data", "residual_probe.csv"), "utf8").trim().split("\n");
  const h = rows[0].split(",");
  return rows.slice(1).map(l => Object.fromEntries(l.split(",").map((v, i) => [h[i], i ? Number(v) : v])));
})();
const pcol = key => PROBE.map(r => r[key]);
const r2 = v => Number(v.toFixed(2));
const T7_AUC = pcol("auc_T7_mean");
const pfmt = p => (p < 0.001 ? "< 0.001" : p < 0.1 ? p.toFixed(3) : p.toFixed(2));
const sgn = v => (v > 0 ? "+" : v < 0 ? "−" : "") + Math.abs(v).toFixed(1);

// =====================================================================================
// 1. Title
// =====================================================================================
let s = newSlide("TITLE", "Introduction");
s.addText("After the Midsem: Novelty Check and the Paper Gap", { placeholder: "title" });
s.addText([
  { text: "Why the GBLSTSVM paper beats LSTSVM when our runs don't, what is new in our work, and the next test", options: { breakLine: true } },
  { text: "4 November 2026 · Jayagna", options: { fontSize: 15, paraSpaceBefore: 14 } },
], { placeholder: "body" });
motif(s);
s.addNotes("This deck covers what happened after the midsem presentation. Two questions came up. First, is our work actually new, given the papers we found? Second, the GBLSTSVM paper reports that GBLSTSVM beats plain LSTSVM, but our experiments show the opposite, so why? I ran one new experiment to answer the second question, and the deck ends with the next test we agreed to run.");

// =====================================================================================
// 2. Two questions, two answers
// =====================================================================================
s = content("Introduction", "Two questions, two short answers", "Summary");
[
  ["?", "Is our work novel?", [B("The analysis is new; the method is not."), " Weighting balls by their neighbours' labels is already published, and fuzzy-kNN LSTSVM beats our keep + T7. What is new is showing where and why granular balls fail in LSTSVM."], C.accent1],
  ["?", "Why does the paper show GBLSTSVM > LSTSVM?", [B("Its numbers match tuning on the test set."), " When both models pick their settings by test score, we get the paper's ordering. With fair cross-validation, LSTSVM wins at every noise level."], C.accent5],
].forEach(([b, q, a, color], i) => {
  const x = 0.6 + i * 6.15, w = 5.95;
  card(s, x, 1.65, w, 4.25);
  badge(s, x + 0.3, 1.95, b, color, 0.62, 22);
  s.addText(q, tx({ x: x + 1.15, y: 1.95, w: w - 1.45, h: 0.62, fontSize: 20, bold: true, color: C.text2, valign: "middle" }));
  s.addText(a.map(r => (typeof r === "string" ? { text: r, options: {} } : r)), tx({ x: x + 0.3, y: 2.85, w: w - 0.6, h: 2.9, fontSize: 19.5 }));
});
takeaway(s, "Realistic target: an evaluation paper, unless a new membership passes a fair test first.");
s.addNotes("Here are the two answers up front. On novelty: the idea of weighting a ball by how many of its neighbouring balls share its label has already been published in 2026, and an older point-level version, fuzzy k-nearest-neighbour weighting, actually does better than our version. What nobody has shown is the analysis: that deleting single-point balls is a hidden noise filter, and that GBLSTSVM loses to plain LSTSVM when both are tested fairly. On the paper: when I let both models choose their settings by looking at the test data, I reproduce the paper's ordering. With honest cross-validation, LSTSVM wins everywhere.");

// =====================================================================================
// 3. What the paper says vs what the code does
// =====================================================================================
s = content("The paper gap", "The paper says it tuned by CV; its released code doesn't tune at all", "Why the paper and our runs disagree");
const gapCards = [
  ["What the paper says " + R("gblstsvm"), [
    "One random 70/30 split per dataset, 34 UCI/KEEL datasets",
    "Accuracy is the only metric",
    "\"Grid search and five-fold cross-validation\"; c1, c2 in {10^{-5}, …, 10^5}; ball settings num and pur also tuned",
    "Label noise 5, 10, 15 and 20%",
    [B("Table 1: "), "LSTSVM 86.67% vs GBLSTSVM 88.26% at 0% noise"],
  ], C.accent5],
  ["What the released code does " + R("gbcode"), [
    "One split with fixed settings: c1 = 1000, c2 = 10^{-5}, num = 2, pur = 0.985",
    "No grid search, no cross-validation, no LSTSVM baseline",
    "README: the code \"is not exactly the same as used in our paper\"",
    [B("Our starting main.py "), "(a modified copy, not the authors') picks c1, c2 and k by test score"],
  ], C.accent2],
];
gapCards.forEach(([h, items, color], i) => {
  const x = 0.6 + i * 6.15, w = 5.95;
  card(s, x, 1.6, w, 4.4);
  s.addShape(pres.shapes.OVAL, { x: x + 0.3, y: 1.86, w: 0.3, h: 0.3, fill: { color }, line: { color }, objectName: "dot" });
  s.addText(h, tx({ x: x + 0.75, y: 1.78, w: w - 1.0, h: 0.45, fontSize: 18, bold: true, color: C.text2, valign: "middle" }));
  s.addText(bullets(items, { math: true, space: 9 }), tx({ x: x + 0.3, y: 2.45, w: w - 0.6, h: 3.4, fontSize: 16.5 }));
});
takeaway(s, "We can't see how the authors tuned, so we tested both ways of tuning on the same data.");
s.addNotes("On the left is what the paper says it did: a single 70/30 split, accuracy, and a grid search with five-fold cross-validation, also tuning the ball settings. Its Table 1 puts GBLSTSVM about one and a half points above LSTSVM. On the right is the code the authors released on GitHub. It runs one split with fixed settings, with no grid search, no cross-validation and no LSTSVM baseline, and its README says it is not exactly the code used in the paper. So we cannot see their tuning. One more thing to be careful about: the main.py we started from does pick settings by test score, but that is a modified copy, not the authors' code. Since we cannot see what they did, the fair move is to run both ways of tuning ourselves.");

// =====================================================================================
// 4. The experiment: two ways to pick settings
// =====================================================================================
s = content("The paper gap", "One experiment: pick the settings two ways on the same splits", "Experiment, 4 Nov");
const flows = [
  ["Fair CV", C.accent1, ["Training part (70%)", "5-fold CV picks the settings", "Refit on the training part", "Score once on the test part"]],
  ["Tuned on the test set", C.accent5, ["Training part (70%)", "Fit every setting", "Score every setting on the test part", "Report the best test score"]],
];
flows.forEach(([name, color, steps], i) => {
  const y = 1.75 + i * 1.55;
  s.addText(name, tx({ x: 0.6, y, w: 2.1, h: 1.05, fontSize: 18, bold: true, color, valign: "middle" }));
  steps.forEach((t, j) => {
    const x = 2.75 + j * 2.5;
    s.addShape(pres.shapes.ROUNDED_RECTANGLE, { x, y, w: 2.15, h: 1.05, rectRadius: 0.1, fill: { color: j === 3 ? color : C.background2 }, line: { color, width: 1.25 }, objectName: "step" });
    s.addText(t, tx({ x: x + 0.12, y, w: 1.91, h: 1.05, fontSize: 14, bold: j === 3, color: j === 3 ? C.background1 : C.text1, align: "center", valign: "middle" }));
    if (j < 3) s.addShape(pres.shapes.LINE, { x: x + 2.17, y: y + 0.525, w: 0.31, h: 0, line: { color: C.accent6, width: 1.5, endArrowType: "triangle" }, objectName: "arrow" });
  });
});
[["Data", "21 UCI/KEEL datasets × 10 random 70/30 splits; training labels flipped at 0, 10, 20 and 30%"],
 ["Grids", "LSTSVM: c1, c2 ∈ {0.001, …, 1000} and class weighting on/off (98 settings). GBLSTSVM: the same for each k = 2–6 (490 settings)"],
 ["Scores", "Accuracy (the paper's metric) and balanced accuracy; Wilcoxon signed-rank test over datasets " + R("demsar")]].forEach(([h, t], i) => {
  s.addText([{ text: h + ": ", options: { bold: true, color: C.text2 } }, { text: t }], tx({ x: 0.6, y: 4.95 + i * 0.4, w: 12.1, h: 0.38, fontSize: 14 }));
});
s.addNotes("This is the experiment. The top row is the honest way: the model only ever sees the training part while choosing its settings, through five-fold cross-validation, and is then scored once on the test part. The bottom row is test-set tuning: every setting is fitted and scored on the test part, and the best score is reported. That best score is optimistic, because it was chosen using the answers. I ran both ways on the same 21 datasets, 10 splits and noise levels as the rest of our study. Notice the grid sizes: plain LSTSVM has 98 settings to choose from, while GBLSTSVM has 490, because each choice of k builds a different set of balls.");

// =====================================================================================
// 5. Accuracy: fair CV vs tuned on the test set
// =====================================================================================
s = content("The paper gap", "Tuned on the test set, the paper's picture comes back", "Result: accuracy");
[["Fair CV", ACC.lc, ACC.gc], ["Tuned on the test set", ACC.lt, ACC.gt]].forEach(([name, l, g], i) => {
  const x = 0.6 + i * 6.15;
  s.addText(name, tx({ x, y: 1.55, w: 5.95, h: 0.4, fontSize: 18, bold: true, color: i ? C.accent5 : C.accent1 }));
  lineChart(s, [["LSTSVM", l.map(r1)], ["GBLSTSVM", g.map(r1)]], NOISE, [HEX.accent3, HEX.accent2], {
    x, y: 1.95, w: 5.95, h: 3.95, valAxisMinVal: 60, valAxisMaxVal: 90, valAxisMajorUnit: 5,
    showValue: !i, dataLabelPosition: "t", dataLabelFormatCode: "0.0", dataLabelFontSize: 10,
    catAxisTitle: "Label noise", showCatAxisTitle: true, valAxisTitle: "Accuracy (%)", showValAxisTitle: true,
  });
});
takeaway(s, `Fair CV: LSTSVM wins at every noise level. On the test set: a tie at 0% (${f1(ACC.lt[0])} vs ${f1(ACC.gt[0])}), then GBLSTSVM edges ahead.`);
s.addNotes("These are mean accuracies over 21 datasets and 10 splits. On the left, with fair cross-validation, the blue LSTSVM line sits three to four points above the red GBLSTSVM line at every noise level. On the right, when both models are tuned on the test set, everything jumps up by eight to twenty points, the two lines meet, and from 20% noise on GBLSTSVM is slightly ahead. That right-hand picture is what the paper reports.");

// =====================================================================================
// 6. Paper vs ours
// =====================================================================================
s = content("The paper gap", "The paper's numbers sit next to test-tuned results, far above fair CV", "Result: compared with the paper");
const hdr = { bold: true, color: C.background1, align: "center" };
const rows = [
  [th("Label noise", { rowspan: 2 }), th("GBLSTSVM paper (34 datasets)", { colspan: 2, align: "center", fill: { color: HEX.accent5 } }),
   th("Ours, tuned on the test set", { colspan: 2, align: "center", fill: { color: HEX.accent5 } }), th("Ours, fair CV", { colspan: 2, align: "center", fill: { color: HEX.accent1 } })],
  [th("LSTSVM", hdr), th("GBLSTSVM", hdr), th("LSTSVM", hdr), th("GBLSTSVM", hdr), th("LSTSVM", hdr), th("GBLSTSVM", hdr)],
];
NOISE.forEach((n, i) => {
  const c = v => td(v == null ? "—" : f1(v), { align: "center" });
  const g = v => td(v == null ? "—" : f1(v), { align: "center", bold: true, color: HEX.accent2 });
  rows.push([td(n, { bold: true }), c(PAPER.l[i]), g(PAPER.g[i]), c(ACC.lt[i]), g(ACC.gt[i]), c(ACC.lc[i]), g(ACC.gc[i])]);
});
table(s, rows, { x: 0.6, y: 1.7, w: 12.1, colW: [1.6, 1.75, 1.75, 1.75, 1.75, 1.75, 1.75], rowH: 0.5, fontSize: 15 });
caption(s, "Mean accuracy (%). Ours: 21 datasets × 10 splits. The paper reports 5% and 15% noise instead of 30%; its LSTSVM tuning is not described.", 0.6, 4.85, 12.1, 0.5);
[["GBLSTSVM at 0% noise", `paper ${f1(PAPER.g[0])} · test-tuned ${f1(ACC.gt[0])} · fair CV ${f1(ACC.gc[0])}`],
 ["Gap to fair CV", `${f1(PAPER.g[0] - ACC.gc[0])}–${f1(PAPER.g[2] - ACC.gc[2])} points at 0–20% noise`]].forEach(([h, t], i) => {
  s.addText([{ text: h + ": ", options: { bold: true, color: C.text2 } }, { text: t }], tx({ x: 0.6 + i * 6.15, y: 5.4, w: 5.95, h: 0.5, fontSize: 15 }));
});
takeaway(s, "Our test-tuned GBLSTSVM is within 1 point of the paper; our fair-CV GBLSTSVM is 10–15 points below it.");
s.addNotes("This table puts the paper next to our two runs, all in accuracy. Look at the red GBLSTSVM columns. The paper reports 88.3, 87.5 and 86.1. Our test-tuned run gives 87.4, 87.1 and 86.2, almost the same. Our fair cross-validation gives 78.6, 75.6 and 70.9, ten to fifteen points lower. The datasets are not identical, so this is not proof, but the paper's numbers look like test-tuned numbers, not cross-validated ones.");

// =====================================================================================
// 7. Balanced accuracy gap
// =====================================================================================
s = content("The paper gap", "Test-set tuning helps GBLSTSVM more as noise grows", "Result: balanced accuracy");
barChart(s, [["Fair CV", NOISE.map((_, i) => r1(BA.gc[i] - BA.lc[i]))], ["Tuned on the test set", NOISE.map((_, i) => r1(BA.gt[i] - BA.lt[i]))]], NOISE, [HEX.accent1, HEX.accent5], {
  x: 0.6, y: 1.6, w: 7.4, h: 4.4, valAxisMinVal: -8, valAxisMaxVal: 4, valAxisMajorUnit: 2, dataLabelFormatCode: "+0.0;−0.0;0.0",
  catAxisTitle: "Label noise", showCatAxisTitle: true, valAxisTitle: "GBLSTSVM − LSTSVM (points)", showValAxisTitle: true, catAxisLabelPos: "low",
});
const brow = [[th("Noise"), th("GBLSTSVM − LSTSVM"), th("GB wins"), th("p")]];
NOISE.forEach((n, i) => brow.push([td(n, { bold: true }), td(sgn(BA.gt[i] - BA.lt[i]), { align: "center" }), td(`${BA.wins[i]}/21`, { align: "center" }), td(pfmt(BA.p[i]), { align: "center" })]));
s.addText("Tuned on the test set", tx({ x: 8.35, y: 1.65, w: 4.35, h: 0.4, fontSize: 17, bold: true, color: C.accent5 }));
table(s, brow, { x: 8.35, y: 2.1, w: 4.35, colW: [0.9, 1.65, 0.95, 0.85], rowH: 0.45, fontSize: 14 });
caption(s, "Balanced accuracy, 21 datasets × 10 splits; Wilcoxon signed-rank test over datasets.", 8.35, 4.5, 4.35, 0.6);
takeaway(s, "Fair CV: GBLSTSVM trails by 4.6–7.3 points. Tuned on the test set: it leads by 2.6 points at 30% noise (18 of 21 datasets).");
s.addNotes("This chart shows the difference between the two models in balanced accuracy, which is the fairer score on imbalanced data. Below zero means LSTSVM is better. With fair cross-validation, in teal, GBLSTSVM is four and a half to seven points behind everywhere. With test-set tuning, in amber, the gap closes and then flips: GBLSTSVM is ahead from 10% noise, and at 30% noise it wins on 18 of 21 datasets, which is significant. So test-set tuning does not just inflate both models equally; it favours GBLSTSVM, and more so the noisier the data.");

// =====================================================================================
// 8. Why test tuning favours GBLSTSVM
// =====================================================================================
s = content("The paper gap", "Why test-set tuning favours GBLSTSVM", "Explanation");
stat(s, 0.6, 1.65, 2.9, 1.7, "98", "settings for plain LSTSVM to pick the best test score from", C.accent3, 40);
stat(s, 3.7, 1.65, 2.9, 1.7, "490", "settings for GBLSTSVM: every k builds a different set of balls", C.accent2, 40);
stat(s, 0.6, 3.6, 6.0, 2.3, "+" + f1(ACC.mixed[0]) + " to +" + f1(ACC.mixed[3]), "accuracy points GBLSTSVM would \"gain\" at 0–30% noise if only it were tuned on the test set and LSTSVM were tuned fairly", C.accent5, 44);
s.addText(bullets([
  [B("More knobs. "), "The ball settings (k here; num and pur in the paper) add choices that plain LSTSVM doesn't have."],
  [B("More varied models. "), "Each k gives different balls, so the candidates differ more than LSTSVM's c1, c2 grid does."],
  [B("Picking the luckiest. "), "The best of many varied models on 30% of the data is high partly by chance; more candidates, more luck."],
  [B("Noise adds variety. "), "Flipped labels make the ball sets even more different, so the bonus grows with noise."],
], { space: 12 }), tx({ x: 7.0, y: 1.65, w: 5.7, h: 4.3, fontSize: 15.5 }));
takeaway(s, "A model with more settings gains more from test-set tuning, which is why it must never touch the test data.");
s.addNotes("Why would test-set tuning help GBLSTSVM more than LSTSVM? Mostly because it has more to choose from. Plain LSTSVM picks from 98 settings; GBLSTSVM picks from 490, because every k builds a different set of balls and therefore a genuinely different model. When you pick the best of many different models using the test data, part of that best score is luck, and more candidates means more luck. Label noise makes the ball sets differ even more, so the bonus grows with noise. The bottom-left number shows the worst case, uneven tuning: if only the proposed model were tuned on the test set and the baseline tuned fairly, GBLSTSVM would appear to win by between five and seventeen points.");

// =====================================================================================
// 9. Other differences and bottom line
// =====================================================================================
s = content("The paper gap", "Other differences matter less", "Other factors");
[
  ["One split vs ten", "A single 70/30 split moves dataset-level numbers by several points. We average 10 splits."],
  ["Datasets", "The paper names haberman, sonar, heart, vehicle, ecoli2, yeast3 and two other yeast sets. The rest of its 34 are listed only in its supplement."],
  ["Noise injection", "The paper doesn't say whether noise touches only training labels. We flip training labels only."],
  ["Tuning metric", "Our CV picks settings by balanced accuracy, which lowers plain accuracy a little. Same for both models, so it can't flip the order."],
].forEach(([h, t], i) => {
  const x = 0.6 + (i % 2) * 6.15, y = 1.6 + Math.floor(i / 2) * 1.75;
  card(s, x, y, 5.95, 1.55);
  badge(s, x + 0.25, y + 0.25, String(i + 1), C.text2, 0.45, 14);
  s.addText(h, tx({ x: x + 0.9, y: y + 0.22, w: 4.8, h: 0.5, fontSize: 17, bold: true, color: C.text2, valign: "middle" }));
  s.addText(t, tx({ x: x + 0.9, y: y + 0.72, w: 4.85, h: 0.8, fontSize: 13.5 }));
});
card(s, 0.6, 5.2, 12.1, 0.85, { fill: HEX.lt2, line: HEX.accent5 });
s.addText([{ text: "Bottom line: ", options: { bold: true, color: C.text2 } }, { text: "the paper's ordering is what you get when settings are chosen with the test data, and it reverses when they are chosen honestly. We can't prove that is what the authors did." }],
  tx({ x: 0.85, y: 5.2, w: 11.6, h: 0.85, fontSize: 15, valign: "middle" }));
s.addNotes("A few other differences between the paper and our runs. One split versus ten adds noise to their per-dataset numbers but doesn't explain a consistent direction. The dataset lists only partly overlap, because their full list is in a supplement we don't have. We don't know exactly how they added label noise. And our cross-validation picks settings by balanced accuracy rather than accuracy, but that applies to both models equally. So the bottom line stays: their ordering appears with test-set tuning and disappears with honest tuning. We should say this carefully in a paper, as a reproduction finding, not as an accusation.");

// =====================================================================================
// 10. Not novel
// =====================================================================================
s = content("Is our work novel?", "Not new: the membership functions themselves", "Novelty check");
[
  ["Neighbour-label weights on balls", `SDAP-GBRVFL ${R("sdap")} scores each ball by the share of its k nearest balls with another label, which is 1 − T7. It uses this in an RVFL network, not LSTSVM.`],
  ["The same idea on single points", `Fuzzy kNN ${R("fknn")} and intuitionistic fuzzy TSVM ${R("iftsvm")} weight each point by its neighbours' labels.`],
  ["Centre-distance and purity weights", `GBFSVM ${R("gbfsvm")}, GBFTSVM ${R("gbfuzzy")} and RGBIFTSVM ${R("gbif")} already cover our T1/T3 style memberships.`],
  ["Our own runs", "Fuzzy-kNN LSTSVM on raw samples beats keep + T7 at every noise level."],
].forEach(([h, t], i) => {
  const y = 1.6 + i * 1.12;
  card(s, 0.6, y, 12.1, 0.98);
  s.addShape(pres.shapes.OVAL, { x: 0.85, y: y + 0.33, w: 0.32, h: 0.32, fill: { color: C.accent2 }, line: { color: C.accent2 }, objectName: "dot" });
  s.addText(h, tx({ x: 1.4, y, w: 3.4, h: 0.98, fontSize: 16, bold: true, color: C.text2, valign: "middle" }));
  s.addText(t, tx({ x: 4.9, y, w: 7.6, h: 0.98, fontSize: 14, valign: "middle" }));
});
takeaway(s, "\"A new fuzzy membership for GBLSTSVM\" can't be the headline of the paper.");
s.addNotes("First the bad news on novelty. The weight we called T7, the share of a ball's neighbours that carry the same label, was published this year in SDAP-GBRVFL, a granular-ball paper from the same group as GBLSTSVM, though in a different kind of network. On single points, the idea goes back to fuzzy k-nearest neighbours in 1985. Distance-to-centre and purity weights are covered by three granular-ball fuzzy SVM papers. And in our own runs, the old point-level version, fuzzy-kNN LSTSVM, does better than our ball version. So we can't sell a new membership function.");

// =====================================================================================
// 11. Novel
// =====================================================================================
s = content("Is our work novel?", "New, as far as our reading shows: the analysis", "Novelty check");
[
  ["Deleting single-point balls is a hidden noise filter", "At 10–30% noise it removes 82–88% of flipped labels, but also 41–60% of clean points, mostly boundary points."],
  ["Under fair CV, plain LSTSVM beats GBLSTSVM", `It wins by ${f1(ACC.lc[3] - ACC.gc[3])}–${f1(ACC.lc[2] - ACC.gc[2])} accuracy points and ${f1(BA.lc[2] - BA.gc[2])}–${f1(BA.lc[0] - BA.gc[0])} balanced-accuracy points at every noise level.`],
  ["The published advantage needs test-set tuning", "It appears only when both models are tuned on the test set, and grows with noise (this deck)."],
  ["Published fuzzy ball scores add nothing", "GBFTSVM's Pythagorean scores don't beat GBTWSVM under fair CV; its paper also tunes on the test set."],
  ["Keep + T7 is a simple fix", "+2.6 to +4.9 points over GBLSTSVM; ties plain LSTSVM at 30% noise."],
].forEach(([h, t], i) => {
  const y = 1.6 + i * 0.9;
  badge(s, 0.6, y + 0.12, String(i + 1), C.accent1, 0.5, 16);
  s.addText([{ text: h + ". ", options: { bold: true, color: C.text2 } }, { text: t }], tx({ x: 1.35, y, w: 11.35, h: 0.8, fontSize: 15.5, valign: "middle" }));
});
takeaway(s, "This supports an evaluation paper (\"granular balls in LSTSVM, tested fairly\"), not a new-method paper.");
s.addNotes("Now the good news. Five findings are, as far as our reading list and searches show, not published anywhere. One: deleting single-point balls quietly removes most mislabelled points, but also many correct boundary points. Two: with fair tuning, plain LSTSVM beats GBLSTSVM. Three: the published advantage only reappears with test-set tuning. Four: the published fuzzy granular-ball scores add nothing under fair tuning. Five: our simple fix, keeping single-point balls and weighting them by neighbour agreement, recovers three to five points. Together these make an evaluation paper. They do not make a new-method paper.");

// =====================================================================================
// 12. What a method paper would need
// =====================================================================================
s = content("Next step", "To claim a new method, a membership must pass two gates", "Adding method novelty");
[["Gate 1: spot flipped labels", `Detection AUC above T7's ${T7_AUC.map(v => v.toFixed(2)).join(" / ")} at 10 / 20 / 30% noise. Cheap: the flipped labels are known.`],
 ["Gate 2: fair accuracy", "Beat plain LSTSVM and fuzzy-kNN LSTSVM under fair CV at two or more noise levels."]].forEach(([h, t], i) => {
  const y = 1.6 + i * 1.45;
  card(s, 0.6, y, 5.6, 1.3);
  badge(s, 0.85, y + 0.25, String(i + 1), C.accent5, 0.5, 16);
  s.addText(h, tx({ x: 1.55, y: y + 0.18, w: 4.5, h: 0.4, fontSize: 16, bold: true, color: C.text2 }));
  s.addText(t, tx({ x: 1.55, y: y + 0.6, w: 4.5, h: 0.7, fontSize: 13.5 }));
});
caption(s, "If it fails, it becomes one more row in the evaluation paper's \"memberships that don't help\" table.", 0.6, 4.55, 5.6, 0.6);
card(s, 6.5, 1.6, 6.2, 4.4, { fill: HEX.lt2 });
s.addText("Candidate: cross-fitted residual membership", tx({ x: 6.75, y: 1.75, w: 5.8, h: 0.45, fontSize: 17, bold: true, color: C.text2 }));
s.addText(bullets([
  "Split the balls into 5 folds; fit the twin planes without a fold.",
  "For each held-out ball, measure how far it falls on its own class's side (its margin).",
  "Weight each ball by a sigmoid of that margin: balls deep on the other class's side get little weight.",
  [B("Why it might help: "), "it uses the classifier's own view, where every geometric weight we tried (distance, entropy, density, purity) failed to spot flipped labels."],
  [B("Prior art to check: "), `on points it is close to classification filters ${R("brodley")} and confident learning ${R("cl")}.`],
], { space: 7 }), tx({ x: 6.75, y: 2.3, w: 5.75, h: 3.6, fontSize: 14 }));
takeaway(s, "In this field, new methods usually put a known idea on balls; ours must also win a fair test.");
s.addNotes("If we want a method contribution as well, any new membership has to pass two gates. The first is cheap: since we flip the labels ourselves, we know which points are wrong, so we can check whether the membership gives them low weight, and it has to do this better than T7. The second is the real test: it has to beat plain LSTSVM and fuzzy-kNN LSTSVM under fair cross-validation. The candidate is a residual membership: fit the planes without a ball, see whether that ball lands on the wrong side, and down-weight it if so. It uses the classifier's own view of each ball. On single points this is close to old classification filters and to confident learning, so it needs a proper prior-art search too.");

// =====================================================================================
// 13. Result of the detection check
// =====================================================================================
s = content("Next step", "Result: residual weights fail gate 1 by a wide margin", "Detection check, 4 Nov");
barChart(s, [
  ["T7 (neighbour agreement)", pcol("auc_T7_mean").map(r2)],
  ["Residual on balls", pcol("auc_res_0.1_mean").map(r2)],
  ["Residual on points", pcol("auc_res_point_1_mean").map(r2)],
  ["T7 × residual", pcol("auc_T7xres_1_mean").map(r2)],
], ["10%", "20%", "30%"], [HEX.accent1, HEX.accent2, HEX.accent3, HEX.accent5], {
  x: 0.6, y: 1.6, w: 7.6, h: 4.45, valAxisMinVal: 0.4, valAxisMaxVal: 1, valAxisMajorUnit: 0.1, dataLabelFormatCode: "0.00", dataLabelFontSize: 10,
  barGapWidthPct: 45, catAxisTitle: "Label noise", showCatAxisTitle: true, valAxisTitle: "Flipped-label detection AUC (0.5 = chance)", showValAxisTitle: true,
});
s.addText(bullets([
  [B("Residual on balls "), `(best of the three C values) flags flipped labels far worse than T7: ${pcol("auc_res_0.1_mean").map(v => v.toFixed(2)).join(" / ")} against ${pcol("auc_T7_mean").map(v => v.toFixed(2)).join(" / ")}. It beats T7 on at most ${Math.max(...pcol("auc_res_0.1_wins"))} of 21 datasets.`],
  [B("Worse than chance on imbalanced sets "), "(ecoli2, ecoli4, yeast, glass4): clean minority points sit on the wrong side of a linear plane, so they get flagged as noise."],
  [B("Combining doesn't help: "), "T7 × residual is below T7 alone at every noise level."],
  [B("Same on single points: "), "the classic classification filter loses to fuzzy kNN."],
], { space: 9 }), tx({ x: 8.5, y: 1.65, w: 4.2, h: 4.4, fontSize: 14 }));
takeaway(s, "Gate 1 failed, so the fair-CV run is skipped; the result joins the paper's \"memberships that don't help\" table.");
s.addNotes("Here is the result of the detection check, on all 21 datasets, five splits and three noise levels. The bars show how well each weight singles out the points whose labels we flipped; 0.5 would be guessing. T7, in teal, scores between 0.82 and 0.89. The residual weights on balls, in red, score only 0.60 to 0.66, and they beat T7 on just two or three datasets. On the imbalanced datasets they are worse than guessing, because a straight-line classifier puts many correct minority points on the wrong side, so the residual mistakes them for noise. Multiplying T7 by the residual weight makes T7 worse, and the same idea on single points also loses to fuzzy kNN. So the idea fails the first gate, and we don't spend time on the full cross-validation. It still has value: it is one more membership that doesn't help, which supports the evaluation paper.");

// =====================================================================================
// 14. Plan
// =====================================================================================
s = content("Next step", "Plan: the residual idea is ruled out, so the evaluation paper is next", "Decision, 4 Nov: \"Test it first\"");
[
  ["✓", "Detection check", "Done 4 Nov: residual weights fail gate 1 (21 datasets, 5 splits, 10–30% noise).", C.accent2],
  ["–", "Fair CV comparison", "Skipped: it only runs if gate 1 passes.", C.accent6],
  ["–", "Prior-art search", "Not needed for a method claim; cite classification filters as related work.", C.accent6],
  ["4", "Draft the paper", "Next: the evaluation paper, with keep + T7 as the fix and this test as a negative result.", C.accent1],
].forEach(([n, h, t, color], i) => {
  const x = 0.6 + i * 3.06, w = 2.94;
  card(s, x, 1.6, w, 2.6);
  badge(s, x + 0.2, 1.8, n, color, 0.5, 16);
  s.addText(h, tx({ x: x + 0.2, y: 2.45, w: w - 0.4, h: 0.5, fontSize: 17, bold: true, color: C.text2 }));
  s.addText(t, tx({ x: x + 0.2, y: 3.0, w: w - 0.4, h: 1.15, fontSize: 14.5 }));
  if (i < 3) s.addShape(pres.shapes.LINE, { x: x + w + 0.01, y: 2.9, w: 0.1, h: 0, line: { color: C.accent6, width: 1.5, endArrowType: "triangle" }, objectName: "arrow" });
});
card(s, 0.6, 4.55, 12.1, 1.1);
s.addText([{ text: "What this rules out: ", options: { bold: true, color: C.text2 } },
  { text: "weights from the linear classifier's own residuals. Neighbour-based weights (T7, fuzzy kNN) remain the best noise detectors we have, and both are already published." }],
  tx({ x: 0.85, y: 4.55, w: 11.6, h: 1.1, fontSize: 15, valign: "middle" }));
takeaway(s, "Next: draft the evaluation paper and pick a venue with the professor.");
s.addNotes("This is where the plan stands. The detection check is done and the residual idea failed it, so the fair cross-validation run and the prior-art search for a method claim are no longer needed. Classification filters can still be cited as related work. The next step is to write the evaluation paper: where granular balls help and hurt in LSTSVM, with keep plus T7 as the simple fix and this residual test as a documented negative result. The venue should be chosen with the professor.");

// =====================================================================================
// 15. References
// =====================================================================================
s = content("Next step", "References");
const half = Math.ceil(REFS.length / 2);
[REFS.slice(0, half), REFS.slice(half)].forEach((list, c) => {
  s.addText(list.map(([, t], i) => ({ text: `[${c * half + i + 1}] ${t}`, options: { breakLine: i < list.length - 1, paraSpaceAfter: 6 } })),
    tx({ x: 0.6 + c * 6.15, y: 1.55, w: 5.95, h: 5.3, fontSize: 11 }));
});
s.addNotes("References for the papers, code and results mentioned in this deck. The last entry is our own repository, which holds every script and result shown.");

(async () => {
  await pres.writeFile({ fileName: OUT });
  await applyTheme(OUT, THEME);
  const removed = await dropInnerParagraphProps(OUT);
  console.log("wrote", OUT, `(${removed} inner paragraph properties removed)`);
})();
