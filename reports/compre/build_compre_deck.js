// Builds compre_presentation.pptx: ONLY the paths we are going forward with (paper 1: the radius-aware fuzzy
// GBLSTSVM; paper 2: NAF-GBLSTSVM, section "Paper 2"), in plain language, with the setup of every test spelled out.
// Dead ends live in ../post_midsem. Helpers copied from ../post_midsem/build_post_midsem_deck.js.
// Run: PPTX_SKILL_DIR=<pptx skill dir> NODE_PATH=<dir with pptxgenjs> node build_compre_deck.js [out.pptx]
// Data: data/*.csv (see data/README.md for the script behind each file).
const fs = require("fs");
const path = require("path");
const pptxgen = require("pptxgenjs");
const { applyTheme } = require(process.env.PPTX_SKILL_DIR + "/scripts/apply_theme.js");

const OUT = process.argv[2] || path.join(__dirname, "compre_presentation.pptx");

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
pres.title = "Radius-aware fuzzy GBLSTSVM: comprehensive presentation";
pres.author = "Jayagna";
pres.theme = { headFontFace: THEME.headFontFace, bodyFontFace: THEME.bodyFontFace };
const C = pres.SchemeColor;

// ---------------------------------------------------------------- references
const REFS = [
  ["lstsvm", "M. A. Kumar, M. Gopal. Least squares twin support vector machines for pattern classification. Expert Systems with Applications 36(4):7535–7543, 2009. (LSTSVM)"],
  ["gblstsvm", "M. Tanveer, R. K. Sharma, A. Quadir, M. Sajid. Enhancing robustness and efficiency of least square twin SVM via granular computing. Pattern Recognition 170, 112021, 2026; arXiv 2410.17338v2. (GBLSTSVM, LS-GBLSTSVM; the paper we follow)"],
  ["svm", "C. Cortes, V. Vapnik. Support-vector networks. Machine Learning 20:273–297, 1995. (SVM)"],
  ["tsvm", "Jayadeva, R. Khemchandani, S. Chandra. Twin support vector machines for pattern classification. IEEE TPAMI 29(5):905–910, 2007. (TSVM)"],
  ["gbsvm", "S. Xia et al. GBSVM: granular-ball support vector machine. arXiv 2210.03120; IEEE TNNLS, 2024. (GBSVM)"],
  ["gbfuzzy", "G. Lang, L. Zhao, D. Miao, W. Ding. Granular-ball computing-based fuzzy twin support vector machine for pattern classification. IEEE Trans. Fuzzy Systems 33(7):2148–2160, 2025. (GBFTSVM)"],
  ["sdap", "A. Quadir, M. Rahaman, P. N. Suganthan, M. Tanveer. Granular-ball fuzzy RVFL network (SDAP-GBRVFL). arXiv 2609.29670, 2026."],
  ["gbct", "S. Xia et al. GBCT: an efficient and adaptive granular-ball clustering algorithm for complex data. arXiv 2410.13917, 2024."],
  ["wknn", "S. A. Dudani. The distance-weighted k-nearest-neighbor rule. IEEE Trans. SMC 6(4):325–327, 1976; K. Hechenbichler, K. Schliep. Weighted k-nearest-neighbor techniques and ordinal classification. LMU Munich SFB 386 Discussion Paper 399, 2004."],
  ["keller", "J. M. Keller, M. R. Gray, J. A. Givens. A fuzzy k-nearest neighbor algorithm. IEEE Trans. SMC 15(4):580–585, 1985."],
  ["repo", "Our code and results: github.com/Jayagna/GBLSTSVM (fuzzy_membership.py, experiments/, results/)."],
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
    { text: { text: "Radius-aware fuzzy GBLSTSVM · Compre presentation", options: { x: 0.6, y: 7.02, w: 8, h: 0.3, fontSize: 10, color: C.accent6 } } },
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
// ---------------------------------------------------------------- data
const readCsv = name => {
  const rows = fs.readFileSync(path.join(__dirname, "data", name), "utf8").trim().split(/\r?\n/);
  const h = rows[0].split(",");
  return rows.slice(1).map(l => Object.fromEntries(l.split(",").map((v, i) => [h[i], v !== "" && !isNaN(v) ? Number(v) : v])));
};
const f1 = v => v.toFixed(1);
const f2 = v => v.toFixed(2);
const sgn = v => (v > 0 ? "+" : v < 0 ? "−" : "") + Math.abs(v).toFixed(1);
const pfmt = p => (p < 0.001 ? "< 0.001" : p < 0.1 ? p.toFixed(3) : p.toFixed(2));
const RANK = readCsv("rank_table_main.csv");   // published-style protocol, 21 datasets
const PROBE = readCsv("new_probe.csv");        // wrong-label detection
const CV = readCsv("new_cv.csv");              // fair cross-validation
const N_DATA = 21;                             // datasets behind the numbers shown so far
const OURS = "LS-keep+gapvote";
const centre = { align: "center" };
const mt = rows => rows.map(r => r.map(c => ({ text: typeof c.text === "string" ? eq(c.text) : c.text, options: c.options })));
// a card listing the setup of a test
function setupBox(s, x, y, w, h, lines, title = "Setup of this test") {
  card(s, x, y, w, h, { fill: C.background1, line: C.accent6, name: "setup" });
  s.addText(title.toUpperCase(), tx({ x: x + 0.2, y: y + 0.12, w: w - 0.4, h: 0.28, fontSize: 11, bold: true, color: C.accent6 }));
  s.addText(bullets(lines, { space: 4, math: true }), tx({ x: x + 0.2, y: y + 0.45, w: w - 0.4, h: h - 0.55, fontSize: 12 }));
}
function three(s, items, o = {}) {
  items.forEach(([n, h, t, color], i) => {
    const x = 0.6 + i * 4.1, w = 3.9, y = o.y || 1.6, hh = o.h || 4.3;
    card(s, x, y, w, hh);
    badge(s, x + 0.25, y + 0.25, n, color, 0.55, 18);
    s.addText(h, tx({ x: x + 0.95, y: y + 0.25, w: w - 1.2, h: 0.55, fontSize: 17, bold: true, color: C.text2, valign: "middle" }));
    s.addText(eq(t), tx({ x: x + 0.25, y: y + 1.05, w: w - 0.5, h: hh - 1.2, fontSize: o.fs || 15.5 }));
  });
}

// ===================================================================================== 1. Title
let s = newSlide("TITLE", "Overview");
s.addText("RF-GBLSTSVM: A Radius-Aware Fuzzy GBLSTSVM", { placeholder: "title" });
s.addText([
  { text: "The model we are taking forward, how it works, how it is tested and what the results say so far", options: { breakLine: true } },
  { text: "Comprehensive presentation · updated 17 November 2026 · Jayagna", options: { fontSize: 15, paraSpaceBefore: 14 } },
], { placeholder: "body" });
motif(s);
s.addNotes("This deck holds only the path we are going forward with: a new fuzzy version of GBLSTSVM that uses the radius of the granular balls. Everything we tried and dropped is kept in the separate post-midsem deck. Each test in this deck comes with the exact setup used.");

// ===================================================================================== 2. The paper in one slide
s = content("Overview", "The paper in one slide");
three(s, [
  ["1", "The problem", `GBLSTSVM ${R("gblstsvm")} trains on granular balls (small groups of points) instead of single points. To be robust to wrong labels it throws away every ball that holds one point. That also throws away many correct points near the class border.`, C.accent2],
  ["2", "Our model", "Keep every ball, and give each ball a fuzzy weight between 0 and 1. The weight comes from a vote of the neighbouring balls, where neighbours are found by the gap between ball surfaces. A ball that its neighbours disagree with counts less in training. We build this on LS-GBLSTSVM, the regularised version of GBLSTSVM.", C.accent1],
  ["3", "How we show it", `Same style as the GBLSTSVM paper: SVM, TSVM, GBSVM, LSTSVM, GBLSTSVM and LS-GBLSTSVM as competitors, label noise from 0 to 20%, average accuracy, ranks and statistical tests. Results are reported under two tuning methods, both clearly labelled.`, C.accent5],
]);
takeaway(s, "One research paper: a new fuzzy GBLSTSVM, plus an honest look at how these models are evaluated.");
s.addNotes("The whole plan on one slide. GBLSTSVM replaces training points by granular balls and deletes the balls that contain one point, on the idea that those are noise. We found that this also deletes many correct points near the border between the classes. Our model keeps all balls and instead gives each one a weight, so a suspicious ball is not deleted, it simply counts less. The weight is new: it uses the radius of the balls. We will present it the way the GBLSTSVM paper presents its model, against the same competitors, and we report results under two ways of choosing the settings.");

// ===================================================================================== 3. Background
s = content("Background", "Three things to know first");
three(s, [
  ["A", "LSTSVM", `Least squares twin SVM ${R("lstsvm")}. Instead of one separating line it fits two: one close to class +1 and one close to class −1. A new point gets the class of the nearer line. Each line is found by solving one small system of equations, so training is fast.`, C.accent3],
  ["B", "Granular balls", "A granular ball is a group of nearby training points, described by its centre c, its radius r (mean distance of its points to the centre), its label (majority class) and its size n. Balls are made by splitting the data again and again until each ball is almost pure (one class).", C.accent4],
  ["C", "GBLSTSVM", `LSTSVM trained on the ball centres and radii instead of the points ${R("gblstsvm")}. Fewer objects, so faster, and a few wrong labels inside a ball are outvoted. Balls with a single point are deleted as likely noise.`, C.accent2],
]);
takeaway(s, "Our model changes two things in (LS-)GBLSTSVM: it keeps single-point balls, and it weights every ball.");
s.addNotes("Three pieces of background. First, LSTSVM: it draws two lines, one hugging each class, and a new point is given to the class whose line is nearer. Second, a granular ball: a small group of neighbouring points, summarised by a centre, a radius, a label and a size. Third, GBLSTSVM: the same LSTSVM, but trained on balls instead of points, and with single-point balls deleted. Our model keeps the same machinery and changes two things only.");

// ===================================================================================== 3a-3d. Every name explained
s = content("Every name explained", "Models trained on the points: SVM, TSVM and LSTSVM", "Every name explained (1 of 4)");
fcard(s, 0.6, 1.5, 12.1, 1.45, `SVM: support vector machine ${R("svm")}`, [
  "One line w·x + b = 0 with the widest possible empty band (margin) between the classes. Training:  minimise ½‖w‖² + C Σ_i ξ_i   such that   y_i (w·x_i + b) ≥ 1 − ξ_i,  ξ_i ≥ 0.",
  "x_i = a training point, y_i = its label (+1 or −1), ξ_i = how far point i is inside the band or on the wrong side, C = how much those errors cost. Predict: the sign of w·x + b.",
  "Solved as a quadratic programme whose matrix is n × n (n = number of points): very good on small data, but memory and time grow fast with n.",
], { fs: 12.5 });
fcard(s, 0.6, 3.05, 12.1, 1.45, `TSVM: twin support vector machine ${R("tsvm")}`, [
  "Two lines instead of one. Line 1 stays close to class +1 and at least distance 1 away from class −1:  minimise ½‖A w_1 + e b_1‖² + C_1 Σ ξ_j   such that   −(B w_1 + e b_1) ≥ 1 − ξ_j,  ξ_j ≥ 0.",
  "A = all class +1 points (one per row), B = all class −1 points, e = a column of ones. Line 2 is the mirror image with A and B swapped. Predict: the class whose line is nearer to x.",
  "Two smaller quadratic programmes (each the size of one class) instead of one big one: about 4 times faster than SVM, but still grows with n².",
], { fs: 12.5 });
fcard(s, 0.6, 4.55, 12.1, 1.6, `LSTSVM: least squares twin SVM ${R("lstsvm")}`, [
  "TSVM with squared errors and \"=\" instead of \"≥\":  minimise ½‖A w_1 + e b_1‖² + (c_1/2)‖ξ‖²   such that   −(B w_1 + e b_1) + ξ = e.",
  "Substituting ξ gives a formula, no optimiser needed:  [w_1; b_1] = −(G^T G + (1/c_1) H^T H)^{−1} G^T e,   with H = [A e], G = [B e]. The matrix is only (d + 1) × (d + 1), d = number of features.",
  "One small linear solve: under 1 second even for 1 million points. Weak spot: squared errors let far-away (often mislabelled) points pull hard on the line.",
], { fs: 12 });
takeaway(s, "All the other models in this deck are built from these three; LSTSVM is the base of our model.");
s.addNotes("The first of four slides that explain every name in the deck in detail. SVM finds one separating line with the widest empty band around it; the slack xi measures how badly a point violates the band and C sets how much that costs. TSVM fits two lines, each close to one class and at least one unit away from the other, by solving two smaller quadratic problems. LSTSVM keeps the two-line idea but uses squared errors and equality constraints, which turns training into one small system of linear equations. That is why it is so fast, and also why it is sensitive to wrong labels: a mislabelled point far on the wrong side has a large squared error and pulls the line towards it.");

s = content("Every name explained", "Granular balls and the ball models: GBSVM, GBLSTSVM", "Every name explained (2 of 4)");
fcard(s, 0.6, 1.5, 12.1, 1.5, "Granular ball (GB)", [
  "A group of nearby training points summarised by: centre c_j = mean of its points;  radius r_j = mean distance of its points to c_j;  label y_j = majority label;  size n_j = number of points;  purity = share of points with label y_j.",
  "How balls are made: start with one ball holding all training points. If a ball's purity is below 0.985, split it with k-means into \"clusters per split\" parts (2 to 6, a setting). Repeat until every ball is pure enough or holds 1 point.",
  "A point whose neighbours all have the other label always ends up alone: a single-point ball with radius 0.",
], { fs: 12.5 });
fcard(s, 0.6, 3.1, 12.1, 1.35, `GBSVM: granular-ball SVM ${R("gbsvm")}`, [
  "SVM on balls: the whole ball, not just its centre, must clear the band:  y_j (w·c_j + b) − r_j ‖w‖ ≥ 1 − ξ_j.",
  "The papers solve it with particle swarm optimisation (a random search). We solve it exactly (it is a convex cone programme). The exact answer is often w = 0, which predicts one class for everything: that is why GBSVM scores about 50% on several datasets.",
], { fs: 12.5 });
fcard(s, 0.6, 4.55, 12.1, 1.55, `GBLSTSVM: granular-ball LSTSVM ${R("gblstsvm")}`, [
  "LSTSVM on balls:  minimise ½‖C_+ w_1 + e b_1‖² + (c_1/2)‖ξ‖²   such that   −(C_− w_1 + e b_1) + ξ = e + R_−.",
  "C_+, C_− = centres of the class +1 and class −1 balls; R_− = their radii, so each ball of the other class must stay 1 + r_j away (the whole ball clears the line). Same one-line formula as LSTSVM, with balls in place of points.",
  "Before training, every single-point ball is deleted as \"probably noise\". This is the step we question.",
], { fs: 12.5 });
takeaway(s, "A ball model learns from a few hundred or thousand balls instead of all the points.");
s.addNotes("The second explanation slide. A granular ball is a summary of a group of nearby points: its centre, its radius, its majority label and its size. Balls are made by splitting the data with k-means again and again until each ball is almost pure. A wrongly labelled point, surrounded by the other class, always ends up alone in a ball. GBSVM is the SVM where the whole ball has to be outside the band; we solve it exactly and it often collapses to predicting one class. GBLSTSVM is LSTSVM where the rows are ball centres and every ball of the other class must stay one plus its radius away. Before training it deletes single-point balls.");

s = content("Every name explained", "LS-GBLSTSVM and RF-GBLSTSVM: what the letters mean", "Every name explained (3 of 4)");
fcard(s, 0.6, 1.5, 6.0, 3.0, `LS-GBLSTSVM = Large-Scale GBLSTSVM ${R("gblstsvm")}`, [
  "Name and model from the GBLSTSVM paper (its second proposed model).",
  "GBLSTSVM + a regulariser term (c_3/2)(‖w_1‖² + b_1²) in the objective, and the same for line 2 with c_4.",
  "Why: it keeps w and b small (structural risk minimisation), so the line is more stable and the equations always have a unique solution. \"Large-scale\" because the paper solves it in a form meant for big data.",
  "Solution:  z_1 = −(G^T G + (1/c_1) H^T H + (c_3/c_1) I)^{−1} G^T (e + R_−)  with z_1 = [w_1; b_1].",
  "Settings: c_1 = c_2 and c_3 = c_4. Single-point balls still deleted.",
], { fs: 12.5 });
fcard(s, 6.7, 1.5, 6.0, 3.0, "RF-GBLSTSVM = Radius-aware Fuzzy GBLSTSVM (ours)", [
  "Our model. In code and older slides it is called \"LS-keep+gapvote\".",
  "Starts from LS-GBLSTSVM and changes two things: (1) single-point balls are kept; (2) every ball j gets a fuzzy weight m_j (the radius-aware vote, next section) that multiplies its error in training.",
  "Solution:  z_1 = −(G^T S_− G + (1/c_1) H^T H + (c_3/c_1) I)^{−1} G^T S_− (e + R_−),  S_− = diagonal matrix of the weights m_j of the class −1 balls.",
  "With all m_j = 1 and single-point balls deleted it is exactly LS-GBLSTSVM.",
  "Extra settings: k = 5 or 10 voting neighbours, γ = 1 or 3.",
], { fs: 12.5, headColor: C.accent1 });
table(s, [
  [th("Model"), th("Regulariser c_3"), th("Single-point balls"), th("Fuzzy weight"), th("Name in code")],
  [td("GBLSTSVM"), td("no"), td("deleted"), td("no"), td("GBLSTSVM")],
  [td("LS-GBLSTSVM"), td("yes"), td("deleted"), td("no"), td("LS-GBLSTSVM")],
  [td("(step in between)"), td("yes"), td("kept"), td("no"), td("LS-keep")],
  [td("RF-GBLSTSVM", { bold: true, color: HEX.accent1 }), td("yes"), td("kept"), td("radius-aware vote"), td("LS-keep+gapvote")],
].map(r => r.map(c => ({ text: eq(c.text), options: c.options }))), { x: 0.6, y: 4.6, w: 12.1, colW: [2.6, 2.1, 2.4, 2.6, 2.4], fontSize: 12, rowH: 0.3 });
takeaway(s, "RF-GBLSTSVM = LS-GBLSTSVM + keep every ball + weight every ball by its neighbours.", 6.25);
s.addNotes("The third explanation slide answers what the letters mean. LS-GBLSTSVM stands for large-scale GBLSTSVM; it is the second model of the GBLSTSVM paper. It adds a regulariser that keeps the line's coefficients small, which makes the solution stable. RF-GBLSTSVM is our name for our model: radius-aware fuzzy GBLSTSVM. It takes LS-GBLSTSVM, keeps the single-point balls instead of deleting them, and multiplies the error of each ball by its fuzzy weight. The formula shows exactly where the weight goes: the diagonal matrix S holds the weights. The table at the bottom shows the chain of changes and the names used in our code.");

s = content("Every name explained", "Words used in the tests and results", "Every name explained (4 of 4)");
table(s, [
  [th("Word"), th("Meaning in detail")],
  [td("Label noise (e.g. 20%)", { bold: true }), td("We flip the labels of 20% of the training points on purpose (same share in each class). Test labels are never changed, so the test measures how well a model resists wrong training labels.")],
  [td("ACC (accuracy)", { bold: true }), td("Share of test points classified correctly, in %.")],
  [td("BACC (balanced accuracy)", { bold: true }), td("Average of the accuracy on class +1 and on class −1. On a 90/10 dataset, always guessing the big class gives ACC 90% but BACC 50%, so BACC is fairer on imbalanced data.")],
  [td("Test-score tuning", { bold: true }), td("Try every setting, report the best test score. Shows the best a model can do, but uses the test labels to choose, so it is optimistic. Several granular-ball papers report this way.")],
  [td("Cross-validation (CV) tuning", { bold: true }), td("Split the training part into 5 folds, train on 4 and score on the 5th, rotate; pick the setting with the best mean score; train once on all training data; score once on the test part. Test labels are never used to choose: this is what a real user gets.")],
  [td("Average rank", { bold: true }), td("On each dataset rank the 7 models (1 = best), then average over datasets. Lower is better.")],
  [td("Friedman test", { bold: true }), td("Checks whether all models could be equally good overall. A small p (below 0.05) means they are not.")],
  [td("Wilcoxon test, W-T-L", { bold: true }), td("Compares our model with one other model across datasets: p < 0.05 means the difference is unlikely to be luck. W-T-L = number of datasets where ours wins, ties, loses.")],
  [td("Linear / Gaussian kernel", { bold: true }), td("Linear: straight boundary. Gaussian: points are first mapped through exp(−γ‖x − z‖²), so the boundary can curve.")],
  [td("NDC", { bold: true }), td("Normally Distributed Clustered data: synthetic data of any size (here 10 thousand to 1 million points, 32 features), used to measure training time on large data.")],
].map(r => r.map(c => ({ text: eq(c.text), options: c.options }))), { x: 0.6, y: 1.45, w: 12.1, colW: [2.7, 9.4], fontSize: 11, rowH: 0.42 });
s.addNotes("The last explanation slide lists every word used in the results. The two tuning methods are the most important: test-score tuning picks the setting that does best on the test data, which is optimistic; cross-validation picks the setting using only the training data, which is what a user would actually get. We report both.");

// ===================================================================================== 4. The weakness
s = content("The weakness we found", "Deleting single-point balls removes noise, and a lot of good data");
stat(s, 0.6, 1.6, 3.9, 1.9, "82–88%", "of wrongly labelled points are removed by the deletion step (10–30% label noise)", C.accent1);
stat(s, 0.6, 3.7, 3.9, 1.9, "41–60%", "of correctly labelled points are removed too, mostly points near the class border", C.accent2);
card(s, 4.7, 1.6, 8.0, 2.3);
s.addText("Why this happens", tx({ x: 4.95, y: 1.75, w: 7.5, h: 0.35, fontSize: 17, bold: true, color: C.text2 }));
s.addText(bullets([
  "Splitting stops when a ball is pure. A wrongly labelled point sits among points of the other class, so it ends up alone in its own ball.",
  "A correct point near the class border is also surrounded by the other class, so it ends up alone as well.",
  "Deleting all single-point balls cannot tell these two cases apart.",
], { space: 5 }), tx({ x: 4.95, y: 2.15, w: 7.5, h: 1.7, fontSize: 14 }));
setupBox(s, 4.7, 4.05, 8.0, 1.95, [
  "21 UCI/KEEL datasets, 70/30 train/test split, 5 splits, features standardised on the training part.",
  "Label noise: a chosen share (10, 20, 30%) of training labels is flipped at random, the same share in each class.",
  "Balls: 2-means splitting until purity ≥ 0.985, tried with k = 2, 4, 6 clusters per split. We count which training points the deleted balls contained.",
]);
takeaway(s, "The border points are exactly the ones a classifier needs. This is what our model fixes.");
s.addNotes("This is the weakness that motivates the model. We flipped a known share of the training labels and looked at what the deletion step of GBLSTSVM removes. It removes most of the wrong labels, which is good. But it also removes between four and six out of ten correct points, mainly those near the border between the classes, because those also end up alone in their own ball. A classifier learns the border from exactly those points. So deletion is too blunt. The setup of this check is on the slide.");

// ===================================================================================== 5. Our model: the weight
s = content("Our model", "The radius-aware fuzzy weight of a ball");
// little picture: ball i and three neighbours
const px = 0.6, py = 1.6;
card(s, px, py, 4.6, 4.4, { fill: C.background1, line: C.background2 });
const ball = (x, y, d, color, label) => {
  s.addShape(pres.shapes.OVAL, { x: px + x, y: py + y, w: d, h: d, fill: { color, transparency: 30 }, line: { color, width: 1.25 }, objectName: "ball" });
  if (label) s.addText(label, tx({ x: px + x, y: py + y, w: d, h: d, fontSize: 13, bold: true, align: "center", valign: "middle", color: C.text2 }));
};
ball(1.75, 1.6, 1.0, C.accent1, "ball i");
ball(0.25, 0.35, 1.5, C.accent1, "big, same class");
ball(3.0, 0.5, 0.75, C.accent5, "other");
ball(3.2, 2.3, 1.1, C.accent5, "other");
ball(0.6, 2.8, 0.55, C.accent1, "");
s.addShape(pres.shapes.LINE, { x: px + 1.585, y: py + 1.57, w: 0.275, h: 0.22, flipV: false, line: { color: C.accent2, width: 2 }, objectName: "gap" });
s.addText("gap g", tx({ x: px + 1.95, y: py + 1.3, w: 0.9, h: 0.25, fontSize: 11, color: C.accent2, bold: true }));
caption(s, "The gap is measured between ball surfaces, not centres. A big ball next door is a close neighbour.", px + 0.2, py + 3.7, 4.2, 0.6);
fcard(s, 5.4, 1.6, 7.3, 1.75, "The formula", [
  "g_{ij} = max(0, ‖c_i − c_j‖ − r_i − r_j)          gap between balls i and j",
  "v_{ij} = n_j · exp(−(g_{ij} / s_i)²)                  how loud ball j votes",
  "m_i = ( Σ v_{ij} over neighbours with ball i's label / Σ v_{ij} over all neighbours )^γ",
], { fs: 13.5 });
table(s, mt([
  [th("Symbol"), th("Meaning")],
  [td("c_i, r_i, n_i"), td("centre, radius and number of points of ball i")],
  [td("neighbours"), td("the k balls with the smallest gap to ball i (k is a setting: 5 or 10)")],
  [td("s_i"), td("the gap to the k-th neighbour; it sets how fast a vote fades with distance")],
  [td("γ (gamma)"), td("sharpness (a setting: 1 or 3); a larger γ pushes doubtful balls closer to 0")],
  [td("m_i"), td("fuzzy weight of ball i, between 0.001 and 1; 1 = all neighbours agree with its label")],
]), { x: 5.4, y: 3.5, w: 7.3, colW: [1.5, 5.8], fontSize: 12, rowH: 0.36 });
takeaway(s, "Touching balls vote at full strength, far balls fade out, and bigger balls have a louder vote.");
s.addNotes("This is the new part. For every ball we ask its neighbours whether they agree with its label. Three things make it radius-aware. First, neighbours are chosen by the gap between ball surfaces, which is the distance between the centres minus both radii, so a large ball that touches ball i is a close neighbour even if its centre is far away. Second, a nearer ball votes louder than a farther one. Third, a ball with more points votes louder. The weight is the share of the vote that agrees with the ball's own label, raised to a power gamma. A ball deep inside its own class gets a weight near one. A ball surrounded by the other class, which is what a wrongly labelled point looks like, gets a weight near zero. The table explains every symbol.");

// ===================================================================================== 6. How the weight enters training
s = content("Our model", "How the weight enters training");
fcard(s, 0.6, 1.6, 12.1, 1.5, "Line 1 (close to class +1); line 2 is the mirror image", [
  "minimise   (c_3 / 2)(‖w_1‖² + b_1²)   +   ½ ‖C_+ w_1 + e b_1‖²   +   (c_1 / 2) · Σ_j m_j · ξ_j²        (sum over the balls j of class −1)",
  "with   ξ_j = (c_j · w_1 + b_1) + 1 + r_j        (how far ball j of class −1 is from being at distance 1 + r_j on the far side)",
], { fs: 14 });
table(s, mt([
  [th("Symbol"), th("Meaning")],
  [td("w_1, b_1"), td("the direction and offset of line 1 (what training finds)")],
  [td("C_+"), td("the centres of the class +1 balls; the first term pulls line 1 close to them")],
  [td("ξ_j"), td("error of a class −1 ball: it should stay at least 1 + r_j away from line 1, so the whole ball is clear of it")],
  [td("m_j"), td("our fuzzy weight: the error of a doubtful ball counts less")],
  [td("c_1, c_2"), td("penalty settings for line 1 and line 2: how much errors matter compared with closeness")],
  [td("c_3, c_4"), td("regulariser strength for line 1 and line 2: keeps w and b small, which makes the line more stable")],
]), { x: 0.6, y: 3.25, w: 7.6, colW: [1.3, 6.3], fontSize: 11.5, rowH: 0.34 });
card(s, 8.4, 3.25, 4.3, 2.75);
s.addText("Compared with GBLSTSVM", tx({ x: 8.6, y: 3.38, w: 3.9, h: 0.35, fontSize: 16, bold: true, color: C.text2 }));
s.addText(bullets([
  "Same objective, same closed-form solution (one small linear system per line).",
  "LS-GBLSTSVM is the special case m_j = 1 with single-point balls deleted; GBLSTSVM also drops the c_3 term.",
  "Extra cost: finding each ball's neighbours once before training.",
], { space: 5, math: true }), tx({ x: 8.6, y: 3.8, w: 3.9, h: 2.1, fontSize: 13.5 }));
takeaway(s, "No ball is deleted. A ball that looks mislabelled is simply listened to less.");
s.addNotes("Where does the weight go? GBLSTSVM finds each line by balancing two wishes: stay close to the balls of its own class, and keep the balls of the other class at a distance of at least one plus their radius. The second wish has an error term for every ball. We multiply that error by the ball's fuzzy weight. So a ball that its neighbours disagree with can be on the wrong side at little cost, while a trusted ball keeps its full say. Nothing else changes: the solution is still one small system of equations per line.");

// ===================================================================================== 7. Novelty
s = content("Our model", "Is this weight new? What we can claim");
three(s, [
  ["1", "Each part exists", `Neighbouring balls voting on a label: SDAP-GBRVFL ${R("sdap")}, as a plain count with no radius. Gap between ball surfaces: GBCT clustering ${R("gbct")}. Closer neighbours vote louder: weighted and fuzzy kNN ${R("wknn", "keller")}, on points.`, C.accent2],
  ["2", "The combination is new", `No paper found gives a ball a fuzzy weight from a surface-gap, size- and distance-weighted vote. The published fuzzy ball SVMs ${R("gbfuzzy")} use the distance to the class centre.`, C.accent1],
  ["3", "The claim", "A new fuzzy membership for granular-ball SVMs, built from known parts, and the first fuzzy GBLSTSVM. We cite the three sources. We do not claim a new idea in fuzzy theory.", C.accent5],
], { h: 4.3 });
takeaway(s, "Literature searched on 12 Nov 2026 (arXiv and web). Partly new: a new combination of known parts.");
s.addNotes("We checked the literature before claiming this is new. The three ingredients each exist somewhere: a neighbour vote on balls, the gap between ball surfaces, and distance-weighted votes on points. What we did not find is the combination used as the fuzzy weight of a ball in a support vector machine. So the claim is a new fuzzy membership for granular-ball SVMs built from known parts. That is the same kind of novelty as the published fuzzy granular-ball twin SVM.");

// ===================================================================================== 8. Setup: data and noise
s = content("How we test", "Test setup 1: data, noise and scores");
table(s, [
  [th("Item"), th("What we use"), th("What it means")],
  [td("Datasets", { bold: true }), td("35 two-class UCI/KEEL datasets (the GBLSTSVM paper uses 34); the wrong-label test uses 21 of them"), td("Public benchmark tables; several are imbalanced (one class is rare)")],
  [td("Split", { bold: true }), td("70% training, 30% test, stratified; repeated 10 times with seeds 0–9"), td("Stratified = both parts keep the class proportions. Results are averaged over the 10 splits")],
  [td("Scaling", { bold: true }), td("Each feature standardised with the training mean and standard deviation"), td("No information from the test part leaks into training")],
  [td("Label noise", { bold: true }), td("0, 5, 10, 15, 20% (and 30%) of training labels flipped; test labels untouched"), td("Simulates wrong labels. The same share is flipped in each class")],
  [td("Accuracy", { bold: true }), td("Share of test points classified correctly"), td("The score the GBLSTSVM paper reports")],
  [td("Balanced accuracy", { bold: true }), td("Mean of the accuracy on class +1 and on class −1"), td("Fairer on imbalanced data: always guessing the big class scores only 50%")],
  [td("Average rank", { bold: true }), td("Rank the models on each dataset (1 = best), then average"), td("Lower is better; not dominated by a few easy datasets")],
], { x: 0.6, y: 1.55, w: 12.1, colW: [1.9, 5.1, 5.1], fontSize: 12.5, rowH: 0.52 });
takeaway(s, "Same design as the GBLSTSVM paper (70/30 split, the same noise levels), with 10 repeats instead of one.");
s.addNotes("The first setup slide: the data. We use public two-class benchmark datasets. Each one is split seventy-thirty into training and test parts ten times. Label noise means we deliberately flip a share of the training labels, to see how well a model copes with wrong labels. The test labels are never touched. We report accuracy, as the GBLSTSVM paper does, and balanced accuracy, which is fairer when one class is rare.");

// ===================================================================================== 9. Setup: settings
s = content("How we test", "Test setup 2: every setting and what it means");
table(s, mt([
  [th("Setting"), th("Meaning"), th("Values tried"), th("Used by")],
  [td("c_1, c_2", { bold: true }), td("Penalty on errors for line 1 and line 2. Large = fit the training balls harder"), td("0.001, 0.01, 0.1, 1, 10, 100, 1000 (each; c_1 = c_2 in LS-GBLSTSVM and ours)"), td("LSTSVM family, ours")],
  [td("c_3, c_4", { bold: true }), td("Regulariser strength: keeps the line's coefficients small"), td("0.001 … 1000, with c_3 = c_4"), td("LS-GBLSTSVM, ours")],
  [td("Class weighting", { bold: true }), td("Whether the rare class gets a larger weight (majority size / minority size)"), td("off, on"), td("all models")],
  [td("Clusters per split", { bold: true }), td("Into how many parts an impure ball is split (k-means)"), td("2, 3, 4, 5, 6"), td("all ball models")],
  [td("Purity threshold", { bold: true }), td("A ball stops splitting when this share of its points has one label"), td("0.985 (fixed)"), td("all ball models")],
  [td("Single-point balls", { bold: true }), td("Balls that contain one point"), td("deleted in GBLSTSVM and LS-GBLSTSVM; kept in ours"), td("ball models")],
  [td("k (neighbours)", { bold: true }), td("How many neighbouring balls vote on a ball's weight"), td("5, 10"), td("ours")],
  [td("γ (gamma)", { bold: true }), td("Sharpness of the fuzzy weight"), td("1, 3"), td("ours")],
  [td("Ridge term", { bold: true }), td("Tiny constant added so the equations always have a solution"), td("0.0001 (fixed)"), td("LSTSVM family")],
]), { x: 0.6, y: 1.55, w: 12.1, colW: [2.0, 4.6, 3.5, 2.0], fontSize: 11.5, rowH: 0.42 });
takeaway(s, "Settings searched: 490 for GBLSTSVM and for LS-GBLSTSVM, 1,960 for ours (4 weight settings × 490).");
s.addNotes("The second setup slide lists every setting, what it means in plain words, and which values we try. The penalties c one and c two decide how hard each line tries to fit the training balls. Class weighting helps when one class is rare. The number of clusters per split and the purity threshold control how the balls are built. Our model adds two settings for the weight: how many neighbours vote, and the sharpness gamma. Because our model has four times as many combinations to choose from, we also report it with a single weight setting so the comparison is on equal terms.");

// ===================================================================================== 10. Two protocols
s = content("How we test", "Test setup 3: two ways of choosing the settings");
[
  ["Published-style tuning", C.accent5, [
    "Train with every combination of settings on the training part.",
    "Score each one on the test part and report the best score.",
    "This is what the released GBLSTSVM code and the fuzzy ball SVM paper do in practice.",
    "The numbers come out high, because the test labels helped pick the settings.",
  ]],
  ["Fair cross-validation (CV)", C.accent1, [
    "Cut the training part into 5 folds. Train on 4, score on the 5th, rotate.",
    "Pick the settings with the best average balanced accuracy over the 5 folds.",
    "Retrain with those settings on the whole training part, then score once on the test part.",
    "The test part is never used to choose anything, so the number is an honest estimate.",
  ]],
].forEach(([h, color, lines], i) => {
  const x = 0.6 + i * 6.15, w = 5.95;
  card(s, x, 1.6, w, 4.4);
  s.addShape(pres.shapes.RECTANGLE, { x, y: 1.6, w: 0.09, h: 4.4, fill: { color }, line: { color }, objectName: "card-accent" });
  s.addText(h, tx({ x: x + 0.3, y: 1.75, w: w - 0.5, h: 0.45, fontSize: 19, bold: true, color: C.text2 }));
  s.addText(bullets(lines, { space: 8 }), tx({ x: x + 0.3, y: 2.35, w: w - 0.5, h: 3.5, fontSize: 15 }));
});
takeaway(s, "The paper reports both, each clearly labelled, so readers can compare with published tables and see honest numbers.");
s.addNotes("There are two ways to choose the settings, and they give different pictures. The first is what the published granular-ball code does: try all settings and report the best test score. It gives high numbers because the test answers helped choose. The second is cross-validation: the settings are chosen using the training part only, and the test part is used once at the end. We decided to report both in the paper, clearly labelled. The first lets readers compare with the published tables. The second is the honest estimate.");

// ===================================================================================== 11. Test A: detection
const pr = k => PROBE.find(r => r.measure === k);
const cw = pr("auc_T7"), gv = pr("auc_gapvote");
s = content("Results so far", "Test A: does the weight spot wrongly labelled points?");
barChart(s, [["Plain neighbour count (no radius)", [cw.auc10, cw.auc20, cw.auc30].map(v => Number(v.toFixed(3)))], ["Radius-aware weight (ours)", [gv.auc10, gv.auc20, gv.auc30].map(v => Number(v.toFixed(3)))]],
  ["10% noise", "20% noise", "30% noise"], [HEX.accent6, HEX.accent1], { x: 0.6, y: 1.55, w: 6.6, h: 4.5, valAxisMinVal: 0.5, valAxisMaxVal: 1, dataLabelFormatCode: "0.000", valAxisTitle: "Detection score (AUC)", showValAxisTitle: true });
setupBox(s, 7.4, 1.55, 5.3, 2.75, [
  `${N_DATA} datasets, 5 splits, label noise 10/20/30%. We know which training labels we flipped.`,
  "Balls built with 2, 4 and 6 clusters per split; single-point balls kept.",
  "Weight settings: k = 10 neighbours, γ = 1.",
  "Score: AUC = the chance that a flipped point gets a lower weight than a correct point. 0.5 = guessing, 1 = perfect.",
]);
card(s, 7.4, 4.45, 5.3, 1.6);
s.addText(bullets([
  `Ours is ahead on ${gv.wins10}, ${gv.wins20} and ${gv.wins30} of ${N_DATA} datasets at 10, 20 and 30% noise.`,
  "The gain grows with the noise level, where it matters most.",
], { space: 5 }), tx({ x: 7.6, y: 4.6, w: 4.9, h: 1.35, fontSize: 14 }));
takeaway(s, `The radius helps: detection rises from ${f2(cw.auc30)} to ${f2(gv.auc30)} at 30% noise.`);
s.addNotes("The first test asks a direct question: do wrongly labelled points get low weights? We flip labels ourselves, so we know the answer for every point. The score is the AUC: the chance that a flipped point gets a lower weight than a correct one. Half means guessing, one means perfect. The grey bars are a plain count of neighbouring balls with the same label, which ignores the radius. The teal bars are our radius-aware weight. Ours is better at every noise level, and the gap grows as the noise grows.");

// ===================================================================================== 12. Test B: published-style protocol
const SUM = readCsv("summary.csv"), PAIR = readCsv("pairwise.csv");
const NP = SUM[0].datasets;
const MODELS = [["SVM", "SVM"], ["TSVM", "TSVM"], ["GBSVM", "GBSVM"], ["LSTSVM", "LSTSVM"], ["GBLSTSVM", "GBLSTSVM"], ["LS-GBLSTSVM", "LS-GBLSTSVM"], [OURS, "RF-GBLSTSVM (ours)"]];
const cell = (prot, metric, nz, m, src = SUM) => src.find(r => r.protocol === prot && r.metric === metric && r.noise === nz && r.model === m);
const pair = (prot, metric, nz, m, src = PAIR) => src.find(r => r.protocol === prot && r.metric === metric && r.noise === nz && r.model === m);
const noisesOf = prot => [...new Set(SUM.filter(r => r.protocol === prot).map(r => r.noise))].sort((x, y) => x - y);
const rng = (prot, metric, m, nzs) => { const d = nzs.map(n => pair(prot, metric, n, m).mean_diff); return `${sgn(Math.min(...d))} to ${sgn(Math.max(...d))}`; };
function scoreTable(prot, metric, nzs, x, y, w, src = SUM, mw = 2.6) {
  const best = nzs.map(n => Math.max(...MODELS.map(([m]) => cell(prot, metric, n, m, src).mean)));
  const rows = [[th("Model"), ...nzs.map(n => th(`${Math.round(n * 100)}%`, centre)), th("Avg rank", centre)]].concat(MODELS.map(([m, label]) => [
    td(label, { bold: m === OURS }),
    ...nzs.map((n, i) => { const v = cell(prot, metric, n, m, src).mean; return td(f1(v), Object.assign({ bold: v > best[i] - 0.05, color: m === OURS ? HEX.accent1 : HEX.dk1 }, centre)); }),
    td(f2(nzs.reduce((a, n) => a + cell(prot, metric, n, m, src).avg_rank, 0) / nzs.length), Object.assign({ bold: m === OURS }, centre)),
  ]));
  const cw = (w - mw - 1.0) / nzs.length;
  table(s, rows, { x, y, w, colW: [mw, ...nzs.map(() => cw), 1.0], fontSize: 12.5, rowH: 0.36 });
}
const NZB = noisesOf("oracle").filter(n => n <= 0.2);
s = content("Results so far", "Test B: published-style tuning (best test score over all settings)");
s.addText(`Average accuracy (%) by label noise, ${NP} datasets; best in each column in bold`, tx({ x: 0.6, y: 1.5, w: 7.6, h: 0.3, fontSize: 13.5, bold: true, color: C.text2 }));
scoreTable("oracle", "accuracy", NZB, 0.6, 1.85, 7.6);
card(s, 0.6, 4.9, 7.6, 1.15);
s.addText(bullets([
  `Ours has the highest average accuracy at every noise level and beats all six competitors (Wilcoxon p < 0.01 each).`,
  `Gain: ${rng("oracle", "accuracy", "GBLSTSVM", NZB)} points over GBLSTSVM, ${rng("oracle", "accuracy", "LSTSVM", NZB)} over LSTSVM, ${rng("oracle", "accuracy", "LS-GBLSTSVM", NZB)} over LS-GBLSTSVM.`,
], { space: 4 }), tx({ x: 0.8, y: 5.0, w: 7.2, h: 1.0, fontSize: 12.5 }));
setupBox(s, 8.4, 1.5, 4.3, 4.55, [
  `${NP} datasets, 10 splits (70/30), linear models.`,
  "Every combination of settings is trained on the training part and scored on the test part; the best score per split is kept, then averaged.",
  "LSTSVM, GBLSTSVM: c_1, c_2 in 0.001…1000, class weighting off/on, 2–6 clusters per split.",
  "LS-GBLSTSVM and ours: c_1 = c_2 and c_3 = c_4 in 0.001…1000; ours adds k = 5, 10 and γ = 1, 3.",
  "SVM, GBSVM: C in 0.001…1000. TSVM: C_1, C_2 in 2^{−5}…2^{5}.",
  "Avg rank: mean rank over datasets and noise levels (1 = best).",
  "Caution: optimistic for every model, because the test labels chose the settings.",
]);
takeaway(s, "Under the tuning used in the published work, our model is first at every noise level, ahead of all six competitors.");
s.addNotes("The second test uses the published style of tuning: try all settings and keep the best test score. The table has the same layout as Table 1 of the GBLSTSVM paper and the same six competitors. Our model has the highest average accuracy and the best average rank at every noise level, and the difference to each of the six competitors is statistically significant. The closest competitor is LS-GBLSTSVM, about half a point behind. The setup box lists exactly what was searched for each model. These numbers are optimistic for every model, because the test labels were used to pick the settings; our model also searches four times as many settings as LS-GBLSTSVM, which helps under this kind of tuning.");

// ===================================================================================== 13. Test C: fair CV
const NZC = noisesOf("cv");
const sig = (metric, m) => NZC.map(n => { const p = pair("cv", metric, n, m); return p.p_wilcoxon < 0.05 ? (p.mean_diff > 0 ? "win" : "loss") : "tie"; });
const tally = (metric, m) => { const v = sig(metric, m); return `${v.filter(x => x === "win").length} wins, ${v.filter(x => x === "tie").length} ties, ${v.filter(x => x === "loss").length} losses`; };
s = content("Results so far", "Test C: fair cross-validation, accuracy");
s.addText(`Average accuracy (%) by label noise, ${NP} datasets; best in each column in bold`, tx({ x: 0.6, y: 1.5, w: 7.6, h: 0.3, fontSize: 13.5, bold: true, color: C.text2 }));
scoreTable("cv", "accuracy", NZC, 0.6, 1.85, 7.6);
card(s, 0.6, 4.9, 7.6, 1.15);
s.addText(bullets([
  `From 5% noise up, ours is ahead of SVM, TSVM and LSTSVM, and the lead grows with the noise (over LSTSVM: ${rng("cv", "accuracy", "LSTSVM", NZC)} points).`,
  `On clean data SVM is ahead (${sgn(pair("cv", "accuracy", 0, "SVM").mean_diff)}); ours is level with LS-GBLSTSVM up to 10% noise and ahead after that.`,
], { space: 4 }), tx({ x: 0.8, y: 5.0, w: 7.2, h: 1.0, fontSize: 12.5 }));
setupBox(s, 8.4, 1.5, 4.3, 4.55, [
  `${NP} datasets, 10 splits (70/30), linear models.`,
  "Settings chosen by 5-fold cross-validation on the training part (the settings with the best mean balanced accuracy over the folds), then one retrain and one test score.",
  "Same grids as Test B for every model.",
  "Avg rank: mean rank over datasets and noise levels (1 = best).",
  `Ours against each model over the ${NZC.length} noise levels (Wilcoxon, p < 0.05): SVM ${tally("accuracy", "SVM")}; LSTSVM ${tally("accuracy", "LSTSVM")}; LS-GBLSTSVM ${tally("accuracy", "LS-GBLSTSVM")}; GBLSTSVM ${tally("accuracy", "GBLSTSVM")}.`,
]);
takeaway(s, "With honest tuning our model still wins under label noise; on clean data plain SVM is better.");
s.addNotes("The third test is the honest one. Settings are chosen by cross-validation on the training part only, and the test part is used once. On accuracy, our model is the best or level with the best from five percent noise upwards, and its lead over SVM, TSVM and LSTSVM grows as the noise grows. On clean data, plain SVM is still ahead by about two points. Against LS-GBLSTSVM our model is level up to ten percent noise and ahead after that. Against GBLSTSVM it wins at every noise level.");

s = content("Results so far", "Test C: fair cross-validation, balanced accuracy");
s.addText(`Average balanced accuracy (%) by label noise, ${NP} datasets; best in each column in bold`, tx({ x: 0.6, y: 1.5, w: 7.6, h: 0.3, fontSize: 13.5, bold: true, color: C.text2 }));
scoreTable("cv", "balanced_accuracy", NZC, 0.6, 1.85, 7.6);
card(s, 0.6, 4.9, 7.6, 1.15);
s.addText(bullets([
  `Ours is the best granular-ball model: ${rng("cv", "balanced_accuracy", "GBLSTSVM", NZC)} points over GBLSTSVM, ${rng("cv", "balanced_accuracy", "LS-GBLSTSVM", NZC)} over LS-GBLSTSVM.`,
  `SVM is ahead at low noise (ours minus SVM: ${rng("cv", "balanced_accuracy", "SVM", NZC)}); from 20% noise ours is level or ahead.`,
], { space: 4 }), tx({ x: 0.8, y: 5.0, w: 7.2, h: 1.0, fontSize: 12.5 }));
setupBox(s, 8.4, 1.5, 4.3, 4.55, [
  "Same runs as the previous slide; only the score differs.",
  "Balanced accuracy = mean of the accuracy on class +1 and on class −1. It is fairer when one class is rare: always guessing the big class scores 50%.",
  `Ours against each model over the ${NZC.length} noise levels (Wilcoxon, p < 0.05): SVM ${tally("balanced_accuracy", "SVM")}; LSTSVM ${tally("balanced_accuracy", "LSTSVM")}; LS-GBLSTSVM ${tally("balanced_accuracy", "LS-GBLSTSVM")}; GBLSTSVM ${tally("balanced_accuracy", "GBLSTSVM")}.`,
]);
takeaway(s, "On the rare-class-friendly score, ours leads the ball models; the point-based SVMs keep an edge at low noise.");
s.addNotes("The same runs, scored with balanced accuracy, which treats both classes equally and so is stricter on imbalanced datasets. Our model is the best of the granular-ball models at every noise level. The point-based models, SVM in particular, are still ahead when there is little noise, and our model catches up at twenty and thirty percent noise. We will report this openly: it is the evaluation message of the paper.");

// ===================================================================================== 13a. Gaussian kernel
const SUMK = readCsv("kernel_summary.csv"), PAIRK = readCsv("kernel_pairwise.csv");
const NZK = [...new Set(SUMK.map(r => r.noise))].sort((x, y) => x - y);
const NK = Math.min(...SUMK.map(r => r.datasets));
const rngK = (prot, metric, m) => { const d = NZK.map(n => pair(prot, metric, n, m, PAIRK).mean_diff); return `${sgn(Math.min(...d))} to ${sgn(Math.max(...d))}`; };
s = content("Results so far", "Test D: Gaussian kernel (curved boundaries)");
s.addText("Published-style tuning, accuracy (%)", tx({ x: 0.6, y: 1.5, w: 5.95, h: 0.3, fontSize: 13.5, bold: true, color: C.text2 }));
scoreTable("oracle", "accuracy", NZK, 0.6, 1.85, 5.95, SUMK, 2.3);
s.addText("Fair cross-validation, balanced accuracy (%)", tx({ x: 6.75, y: 1.5, w: 5.95, h: 0.3, fontSize: 13.5, bold: true, color: C.text2 }));
scoreTable("cv", "balanced_accuracy", NZK, 6.75, 1.85, 5.95, SUMK, 2.3);
setupBox(s, 0.6, 4.85, 12.1, 1.25, [
  `${NK === 35 ? "35" : NK + " to 35"} datasets, 5 splits (70/30), noise 0/10/20%. Gaussian kernel exp(−γ_k ‖x − z‖²) with γ_k = g / (number of features), g in 0.25, 1, 4. Ball models use the kernel between each point and the ball centres; our fuzzy weight is still computed from the balls in the original space.`,
  "Other grids as in Tests B and C, with 2, 4 or 6 clusters per split. Left: best test score over all settings. Right: settings chosen by 5-fold cross-validation.",
]);
takeaway(s, "Same picture as the linear models: first under published-style tuning; best ball model under fair CV, just behind SVM.");
s.addNotes("The same comparison with a Gaussian kernel, which lets every model draw a curved boundary. The picture matches the linear results. Under the published style of tuning, on the left, our model is first at every noise level and significantly ahead of all six competitors. Under fair cross-validation, on the right, it is the best of the granular-ball models and close behind the kernel SVM, which stays ahead by about one to one and a half points. The setup box gives the kernel and its settings. Because kernel runs are much slower, this test uses five splits and three noise levels.");

// ===================================================================================== 13b. Ablation
const ABL = [["GBLSTSVM", "GBLSTSVM (start)"], ["GB-keep", "+ keep single-point balls"], ["Keep+gapvote", "+ keep balls + radius-aware weight"], ["LS-GBLSTSVM", "+ regulariser only (LS-GBLSTSVM)"], ["LS-keep", "+ regulariser + keep balls"], [OURS, "+ regulariser + keep balls + weight (ours)"]];
s = content("Results so far", "Which part of the model does the work?");
const ablTable = (prot, metric, nzs, x, title) => {
  s.addText(title, tx({ x, y: 1.5, w: 5.95, h: 0.3, fontSize: 13.5, bold: true, color: C.text2 }));
  const cw = (5.95 - 3.3) / nzs.length;
  table(s, [[th("Model"), ...nzs.map(n => th(`${Math.round(n * 100)}%`, centre))]].concat(ABL.map(([m, label]) => [td(label, { bold: m === OURS }), ...nzs.map(n => td(f1(cell(prot, metric, n, m).mean), Object.assign({ bold: m === OURS }, centre)))])),
    { x, y: 1.85, w: 5.95, colW: [3.3, ...nzs.map(() => cw)], fontSize: 12, rowH: 0.38 });
};
ablTable("oracle", "accuracy", [0, 0.1, 0.2], 0.6, "Published-style tuning, accuracy (%)");
ablTable("cv", "accuracy", [0, 0.1, 0.2], 6.75, "Fair cross-validation, accuracy (%)");
setupBox(s, 0.6, 4.6, 12.1, 1.45, [
  `Same ${NP} datasets, splits, noise and grids as Tests B and C. Each row switches on one more part of the model; everything else is unchanged.`,
  "Keep balls = single-point balls are not deleted. Weight = the radius-aware fuzzy weight (k = 5, 10; γ = 1, 3). Regulariser = the c_3 term of LS-GBLSTSVM (0.001…1000).",
], "Setup of this comparison");
takeaway(s, "The three parts together are best under both tuning methods; the fuzzy weight matters most under label noise.");
s.addNotes("This slide takes the model apart. We start from GBLSTSVM and switch on one part at a time: keeping the single-point balls, the radius-aware weight, and the regulariser from LS-GBLSTSVM. The regulariser and the weight are different kinds of improvement, and together they give the best result under both tuning methods. Under fair cross-validation with label noise, adding the weight to the regularised model with kept balls gives the largest step.");

// ===================================================================================== 13c. Sensitivity
const SENS = readCsv("sensitivity.csv");
const SK = [...new Set(SENS.map(r => r.k))].sort((a, b) => a - b), SG = [...new Set(SENS.map(r => r.gamma))].sort((a, b) => a - b);
s = content("Results so far", "How much do the two weight settings matter?");
const sensTable = (nz, x, title) => {
  const v = (k, g) => SENS.find(r => r.noise === nz && r.k === k && r.gamma === g).balanced_accuracy;
  const all = SK.flatMap(k => SG.map(g => v(k, g))), lo = Math.min(...all), hi = Math.max(...all);
  s.addText(`${title} (range ${f1(lo)} to ${f1(hi)})`, tx({ x, y: 1.5, w: 5.95, h: 0.3, fontSize: 13.5, bold: true, color: C.text2 }));
  table(s, [[th("k \\ γ"), ...SG.map(g => th(`γ = ${g}`, centre))]].concat(SK.map(k => [td(`k = ${k}`, { bold: true }), ...SG.map(g => td(f1(v(k, g)), Object.assign({ bold: v(k, g) > hi - 0.05 }, centre)))])),
    { x, y: 1.85, w: 5.95, colW: [1.2, ...SG.map(() => 0.95)], fontSize: 12.5, rowH: 0.4 });
  return [lo, hi];
};
const [lo0, hi0] = sensTable(0, 0.6, "Balanced accuracy (%), 0% noise");
const [lo2, hi2] = sensTable(0.2, 6.75, "Balanced accuracy (%), 20% noise");
setupBox(s, 0.6, 4.45, 12.1, 1.6, [
  `${SENS[0].datasets} datasets, 5 splits (70/30), linear model, fair cross-validation.`,
  "k = number of neighbouring balls that vote on a ball's weight (3, 5, 10, 15, 20). γ = sharpness of the weight (0.5, 1, 2, 3, 5).",
  "For each (k, γ) pair the other settings (c_1 = c_2, c_3 = c_4, 2/4/6 clusters per split, class weighting) are chosen by 5-fold cross-validation; the table shows the mean test score.",
]);
takeaway(s, `The model is not sensitive to k and γ: all 25 combinations stay within ${f1(Math.max(hi0 - lo0, hi2 - lo2))} points of each other.`);
s.addNotes("A reviewer will ask whether the model needs careful tuning of its two new settings, the number of voting neighbours k and the sharpness gamma. We tried twenty-five combinations. For each one, all the other settings were chosen by cross-validation. The balanced accuracy barely moves: all combinations stay within about two points of each other, both on clean data and with twenty percent label noise. So the model does not depend on a lucky choice of k and gamma, and two or three values of each are enough in practice.");

// ===================================================================================== 13d. NDC large scale
const NDC = readCsv("ndc.csv").filter(r => r.protocol === "cv");
s = content("Results so far", "Test E: large data (NDC, 10 thousand to 1 million points)");
const NDC_SIZES = ["10k", "50k", "100k", "300k", "500k", "1m"];
const NDC_M = ["SVM", "LSTSVM", "GBLSTSVM", "LS-GBLSTSVM", "RF-GBLSTSVM"];
const ncell = (sz, nz, m) => {
  const r = NDC.find(x => x.size === sz && x.noise === nz && x.model === m);
  if (!r || r.status === "" || r.status === undefined) return "running";
  if (r.status !== "ok") return String(r.status).startsWith("not run") ? "too big" : String(r.status);
  const t = r.train_sec;
  return `${f1(r.accuracy)}%  (${t < 10 ? t.toFixed(1) : Math.round(t)} s)`;
};
const nrows = [[th("Size"), th("Noise"), ...NDC_M.map(m => th(m === "RF-GBLSTSVM" ? "RF-GBLSTSVM (ours)" : m))]];
NDC_SIZES.forEach(sz => [0, 0.2].forEach(nz => nrows.push([td(sz === "1m" ? "1 million" : sz), td(nz ? "20%" : "0%"), ...NDC_M.map(m => td(ncell(sz, nz, m), centre))])));
table(s, nrows, { x: 0.6, y: 1.45, w: 8.2, colW: [1.0, 0.7, 1.4, 1.3, 1.3, 1.3, 1.2], fontSize: 10, rowH: 0.3 });
setupBox(s, 9.0, 1.45, 3.7, 4.6, [
  "NDC data made by our own Python version of the NDC generator (the original site is not reachable): 100 Gaussian clusters, 32 features, classes set by a random plane. Linear accuracy about 83%, as in the GBLSTSVM paper.",
  "One 70/30 split. Settings chosen by 5-fold CV on a random 10,000-point part of the training data, then one fit on all of it.",
  "Time = training seconds on one CPU core, including ball building and our weight. \"too big\": SVM needs an n × n matrix, not run above 100k.",
  "Each cell: test accuracy (training time).",
]);
takeaway(s, "On large, mostly separable data all twin models reach about 82 to 84%; plain LSTSVM is the fastest.");
s.addNotes("The large-scale test, as in the GBLSTSVM paper. NDC data can be made at any size; we used ten thousand to one million points with thirty-two features. All twin models reach about the same accuracy, between eighty-two and eighty-four percent, with or without twenty percent label noise, because with so much data uniform noise averages out. Plain LSTSVM is the fastest, because it only solves one small system of equations; the ball models spend most of their time building the balls, and our model also needs the neighbour vote. So on this data the paper's speed claim for ball models does not hold in our code, and our model's advantage is on noisy small and medium data, not on huge clean data.");

// ===================================================================================== 14. Competitors
s = content("Work in progress", "The competitors, as in the GBLSTSVM paper");
table(s, mt([
  [th("Model"), th("What it is, in one line"), th("Settings we search"), th("Status")],
  [td(`SVM ${R("svm")}`, { bold: true }), td("One separating line with the widest margin, trained on the points"), td("C in 0.001…1000; class weighting off/on"), td("done")],
  [td(`TSVM ${R("tsvm")}`, { bold: true }), td("Twin SVM: two lines, each found by a small optimisation, on the points"), td("C_1, C_2 in 2^{−5}…2^{5}; class weighting off/on"), td("done")],
  [td(`GBSVM ${R("gbsvm")}`, { bold: true }), td("SVM trained on granular balls"), td("C in 0.001…1000; 2–6 clusters; class weighting off/on"), td("done; see note")],
  [td(`LSTSVM ${R("lstsvm")}`, { bold: true }), td("Least squares twin SVM on the points"), td("c_1, c_2 in 0.001…1000; class weighting off/on"), td("done")],
  [td(`GBLSTSVM ${R("gblstsvm")}`, { bold: true }), td("LSTSVM on balls, single-point balls deleted"), td("as LSTSVM, plus 2–6 clusters"), td("done")],
  [td(`LS-GBLSTSVM ${R("gblstsvm")}`, { bold: true }), td("GBLSTSVM with an extra term that keeps the line's coefficients small"), td("c_1 = c_2 and c_3 = c_4 in 0.001…1000; 2–6 clusters"), td("done")],
  [td("RF-GBLSTSVM (ours)", { bold: true, color: HEX.accent1 }), td("LS-GBLSTSVM with all balls kept and the radius-aware fuzzy weight"), td("as LS-GBLSTSVM, plus k = 5, 10 and γ = 1, 3"), td("done")],
]), { x: 0.6, y: 1.55, w: 12.1, colW: [2.0, 4.6, 3.6, 1.9], fontSize: 12, rowH: 0.5 });
card(s, 0.6, 5.7, 12.1, 0.42, { fill: C.background1, line: C.accent6 });
s.addText("Note on GBSVM: the papers solve it with a random search (particle swarm). We solve it exactly. With large balls the exact solution often predicts a single class, which is why its scores are low.", tx({ x: 0.75, y: 5.72, w: 11.8, h: 0.38, fontSize: 11, color: C.accent6, valign: "middle" }));
takeaway(s, "All models run on the same splits, the same noisy labels and under both tuning methods.");
s.addNotes("The paper we follow compares against six models, and so will we. SVM and TSVM train on the points. GBSVM, GBLSTSVM and LS-GBLSTSVM train on granular balls. The table says in one line what each model is, which settings we search for it, and where the runs stand. Everything runs on the same splits and the same noisy labels, so the comparison is paired.");

// ===================================================================================== 15. Next steps
s = content("Work in progress", "Where we stand and what comes next");
three(s, [
  ["✓", "Done", "Model defined and coded, now on top of LS-GBLSTSVM. Novelty checked. Wrong-label detection test. All six competitors, 35 datasets, six noise levels, both tuning methods, linear and Gaussian kernel. Ablation of the three parts. Sensitivity of k and γ. First full paper draft in LaTeX (29 pages, layout of the GBLSTSVM paper, both tuning methods reported).", C.accent1],
  ["→", "Next", "Finish NDC at 1 million points with 20% noise. Re-run our model on the 35 datasets with the tie fix (when several balls touch, neighbours are now chosen by centre distance). Update the paper tables.", C.accent3],
  ["✎", "Then", "Add the NDC section to the paper. Complete the author block and four references. Choose the target journal.", C.accent5],
]);
takeaway(s, "This deck is updated with every new result; dropped ideas are recorded in the post-midsem deck.");
s.addNotes("Where we are. All experiments on the thirty-five datasets are done, and the first full draft of the paper is written. Next is the review of the draft, the author details and the choice of journal. The large-scale test on the NDC datasets is the one experiment still missing.");

// ===================================================================================== P2. Second paper: NAF-GBLSTSVM
// Data: data/naf_*.csv, written by reports/paper_naf/make_assets.py. Slides whose runs are not finished show a "running" note.
const optCsv = name => (fs.existsSync(path.join(__dirname, "data", name)) ? readCsv(name) : null);
const NSUM = readCsv("naf_summary.csv"), NPAIR = readCsv("naf_pairwise.csv");
const NB = optCsv("naf_boundary_summary.csv"), NA = optCsv("naf_asymmetric_summary.csv");
const NBP = optCsv("naf_boundary_pairwise.csv"), NAP = optCsv("naf_asymmetric_pairwise.csv");
const NDIAG = optCsv("naf_diagnostics.csv");
const NAF = "T7-agree";
const NMODELS = [["SVM", "SVM"], ["TSVM", "TSVM"], ["GBSVM", "GBSVM"], ["LSTSVM", "LSTSVM"], ["GBLSTSVM", "GBLSTSVM"], ["LS-GBLSTSVM", "LS-GBLSTSVM"], [NAF, "NAF-GBLSTSVM (ours)"]];
const nfCell = (src, prot, metric, nz, m) => src.find(r => r.protocol === prot && r.metric === metric && Math.abs(r.noise - nz) < 1e-9 && r.model === m);
const nfPair = (src, prot, metric, nz, m) => src.find(r => r.protocol === prot && r.metric === metric && Math.abs(r.noise - nz) < 1e-9 && r.model === m);
const nfRng = (src, prot, metric, m, nzs) => { const d = nzs.map(n => nfPair(src, prot, metric, n, m).mean_diff); return `${sgn(Math.min(...d))} to ${sgn(Math.max(...d))}`; };
function nafTable(src, prot, metric, nzs, x, y, w, o = {}) {
  const best = nzs.map(n => Math.max(...NMODELS.map(([m]) => nfCell(src, prot, metric, n, m).mean)));
  const rows = [[th("Model"), ...nzs.map(n => th(`${Math.round(n * 100)}%`, centre)), th("Avg rank", centre)]].concat(NMODELS.map(([m, label]) => [
    td(label, { bold: m === NAF }),
    ...nzs.map((n, i) => { const v = nfCell(src, prot, metric, n, m).mean; return td(f1(v), Object.assign({ bold: v > best[i] - 0.05, color: m === NAF ? HEX.accent4 : HEX.dk1 }, centre)); }),
    td(f2(nzs.reduce((a, n) => a + nfCell(src, prot, metric, n, m).avg_rank, 0) / nzs.length), Object.assign({ bold: m === NAF }, centre)),
  ]));
  const mw = o.mw || 2.6, cw = (w - mw - 1.0) / nzs.length;
  table(s, rows, { x, y, w, colW: [mw, ...nzs.map(() => cw), 1.0], fontSize: o.fs || 12.5, rowH: o.rowH || 0.36 });
}
const running = (x, y, w, h, what) => {
  card(s, x, y, w, h, { fill: C.background1, line: C.accent5 });
  s.addText(`Still running: ${what}. This slide fills in automatically when the runs finish.`, tx({ x: x + 0.3, y: y + 0.2, w: w - 0.6, h: h - 0.4, fontSize: 15, color: C.accent5, valign: "middle" }));
};
const NZU = [...new Set(NSUM.filter(r => r.protocol === "oracle").map(r => r.noise))].sort((a, b) => a - b);

s = newSlide("TITLE", "Paper 2: NAF-GBLSTSVM");
s.addText("Paper 2: NAF-GBLSTSVM", { placeholder: "title" });
s.addText([
  { text: "Keep every ball and weight it by how much its neighbours agree with it: what single-point-ball deletion throws away, and how the tuning method changes the verdict", options: { breakLine: true } },
  { text: "Added 26 November 2026", options: { fontSize: 15, paraSpaceBefore: 14 } },
], { placeholder: "body" });
motif(s);
s.addNotes("From here on, the deck covers the second paper. It uses the simpler model we called keep plus T7 earlier, now named NAF-GBLSTSVM, which stands for neighbour-agreement fuzzy GBLSTSVM. The first paper, RF-GBLSTSVM, is unchanged by this section.");

s = content("Paper 2: NAF-GBLSTSVM", "Two papers from one project: how they stay separate");
three(s, [
  ["1", "Paper 1: RF-GBLSTSVM", "Method paper. New radius-aware vote (surface gaps, size- and distance-weighted) on top of LS-GBLSTSVM's regulariser. Claim: a new fuzzy membership and model that beats six baselines.", C.accent1],
  ["2", "Paper 2: NAF-GBLSTSVM", "Method paper in the same style (your choice, 26 Nov). Keep all balls + neighbour-agreement weight on the ORIGINAL GBLSTSVM (no regulariser, centre-distance neighbours). Its own experiments: boundary-targeted and class-dependent label noise, deletion analysis on all 35 datasets.", C.accent4],
  ["!", "The overlap risk", "Same base model and datasets, so an editor could call it duplicate publication. What we do: keep+T7 removed from the RF paper, RF kept out of paper 2's tables, new noise types only in paper 2, each paper cites the other, and both editors are told about the other paper.", C.accent2],
], { h: 4.3, fs: 14 });
takeaway(s, "Name: NAF-GBLSTSVM = Neighbour-Agreement Fuzzy GBLSTSVM (other options were KA-FGBLSTSVM and NV-GBLSTSVM).");
s.addNotes("You asked for two papers. That is possible, but the two models share a lot: both keep the single-point balls and both use a neighbour vote. If both papers were written as 'here is a new model that beats everything', on the same datasets and with overlapping tables, a reviewer or editor could treat it as publishing the same work twice. You chose to write both as method papers in the same style. To keep them apart, keep plus T7 was removed from the RF paper, the RF model is not in paper 2's tables, paper 2 builds on the original GBLSTSVM rather than LS-GBLSTSVM, and paper 2 has its own experiments: boundary-targeted and class-dependent label noise. Each paper cites the other, and the editors should be told about the other paper.");

s = content("Paper 2: NAF-GBLSTSVM", "The NAF weight of a ball, symbol by symbol");
fcard(s, 0.6, 1.55, 6.2, 1.95, "The formula", [
  "a_i = Σ_{j ∈ N_k(i)} n_j · [y_j = y_i]  /  Σ_{j ∈ N_k(i)} n_j",
  "s_i = max( a_i^γ , 0.001 )",
], { fs: 15 });
table(s, mt([
  [th("Symbol"), th("Meaning")],
  [td("i, j"), td("ball numbers; every ball is kept, also the single-point ones")],
  [td("N_k(i)"), td("the k balls whose centres are nearest to the centre of ball i")],
  [td("n_j"), td("number of training points in ball j (a big ball counts more)")],
  [td("y_j"), td("label of ball j (+1 or −1, the majority label of its points)")],
  [td("[y_j = y_i]"), td("1 if ball j has the same label as ball i, otherwise 0")],
  [td("a_i"), td("agreement: share of the neighbours' points that carry ball i's label (0 to 1)")],
  [td("γ (gamma)"), td("sharpness, a setting (1 or 3): with γ = 3, a = 0.5 becomes 0.125")],
  [td("s_i"), td("the fuzzy weight of ball i; 0.001 is a floor so no ball is fully switched off")],
]), { x: 0.6, y: 3.65, w: 6.2, colW: [1.3, 4.9], fontSize: 10.5, rowH: 0.24 });
card(s, 7.0, 1.55, 5.7, 4.5);
s.addText("Worked example (k = 5, γ = 1)", tx({ x: 7.2, y: 1.7, w: 5.3, h: 0.35, fontSize: 16, bold: true, color: C.text2 }));
s.addText(bullets([
  "Ball i holds 1 point with label +1 (it would be DELETED by GBLSTSVM).",
  "Its 5 nearest balls: sizes 12, 8, 1, 6, 3 with labels −1, −1, +1, −1, −1.",
  "Agreement a_i = 1 / (12 + 8 + 1 + 6 + 3) = 1/30 = 0.033 → weight 0.033: almost surely a flipped label, nearly ignored.",
  "If instead the neighbours were sizes 12, 8, 1, 6, 3 with labels +1, −1, +1, +1, −1: a_i = (12 + 1 + 6)/30 = 0.63 → weight 0.63. A boundary point: kept with reduced say, not deleted.",
  "A ball deep in its own class: a_i = 1 → weight 1.",
], { space: 6, math: true }), tx({ x: 7.2, y: 2.15, w: 5.3, h: 3.8, fontSize: 13 }));
takeaway(s, `This is the plain neighbour count; SDAP-GBRVFL ${R("sdap")} already uses it on balls in an RVFL. What is new here is where and how we use it.`);
s.addNotes("This is the whole weight. For each ball we look at its k nearest balls and ask what share of their points carries the same label as our ball. That share is the agreement a. The weight s is a to the power gamma, with a small floor so no ball is completely switched off. The example on the right shows the two cases that matter: a single wrongly labelled point surrounded by the other class gets a weight near zero, while a correct point on the border keeps a medium weight instead of being deleted. The weight itself is not new. It appears inside the non-membership of the granular-ball fuzzy RVFL paper. Paper 2 is honest about this: the contribution is the analysis around it and its use in GBLSTSVM with all balls kept.");

s = content("Paper 2: NAF-GBLSTSVM", "How the NAF weight enters GBLSTSVM");
fcard(s, 0.6, 1.55, 12.1, 1.55, "Line 1 (close to class +1); line 2 swaps the roles of the classes", [
  "minimise   ½ (H z_1)ᵀ D⁺ (H z_1)   +   (c_1 / 2) · Σ_j s_j · ξ_j²      subject to   −G z_1 + ξ = e + R⁻",
  "solution:   z_1 = −( Gᵀ S⁻ G + (1/c_1) Hᵀ D⁺ H + δ I )^{−1} Gᵀ S⁻ (e + R⁻)          (one small linear system)",
], { fs: 13.5 });
table(s, mt([
  [th("Symbol"), th("Meaning")],
  [td("z_1 = [w_1; b_1]"), td("direction and offset of line 1, what training finds")],
  [td("H, G"), td("centres of ALL class +1 / class −1 balls, each with a column of ones added")],
  [td("R⁻"), td("radii of the class −1 balls: each must stay 1 + r_j beyond line 1")],
  [td("ξ_j"), td("error of class −1 ball j (how far it is from that distance)")],
  [td("S⁻ = diag(s_j)"), td("NAF weights of the class −1 balls: a doubtful ball's error counts less")],
  [td("D⁺"), td("class weight θ on the +1 balls (θ = 1, or majority/minority size; a setting)")],
  [td("c_1, c_2"), td("penalty settings, 0.001 … 1000")],
  [td("δ"), td("0.0001, a tiny ridge so the system always has a solution (same in all models)")],
]), { x: 0.6, y: 3.25, w: 7.6, colW: [1.7, 5.9], fontSize: 11.5, rowH: 0.3 });
card(s, 8.4, 3.25, 4.3, 2.8);
s.addText("Compared with GBLSTSVM and paper 1", tx({ x: 8.6, y: 3.38, w: 3.9, h: 0.35, fontSize: 15, bold: true, color: C.text2 }));
s.addText(bullets([
  "GBLSTSVM = same equations with s_j = 1 and single-point balls deleted. NAF changes only these two things.",
  "No regulariser c_3 (paper 1 has it). Neighbours by centre distance (paper 1 uses surface gaps).",
  "A point is classified by the nearer line, as in GBLSTSVM.",
], { space: 5, math: true }), tx({ x: 8.6, y: 3.8, w: 3.9, h: 2.2, fontSize: 12.5 }));
takeaway(s, "Two changes to GBLSTSVM: keep every ball, and multiply each ball's error by its NAF weight.");
s.addNotes("The weight goes into the error term of GBLSTSVM, exactly where the fuzzy weight of paper 1 goes, but here we keep the original GBLSTSVM without the extra regulariser of LS-GBLSTSVM. Each line is still one small linear system. The table explains every symbol. If all weights are one and the single-point balls are deleted, we are back at plain GBLSTSVM. This keeps the second paper about the original GBLSTSVM and clearly different from paper 1, which builds on LS-GBLSTSVM and uses a different, radius-aware weight.");

s = content("Paper 2: NAF-GBLSTSVM", "Paper 2 test setup: three kinds of wrong labels");
table(s, mt([
  [th("Noise model"), th("How labels are flipped"), th("What it imitates")],
  [td("Uniform", { bold: true }), td("q·n training labels flipped at random, shared between the classes in proportion to their size (q = 5, 10, 15, 20, 30%)"), td("Random typing errors; the noise used in the GBLSTSVM paper")],
  [td("Boundary-targeted", { bold: true }), td("Same number of flips per class, but point i is picked with probability ∝ exp(−δ_i / τ). δ_i = distance to the nearest point of the other class; τ = half the median δ in its class (q = 10, 20, 30%)"), td("Annotators confusing borderline cases: points near the other class are flipped far more often")],
  [td("Class-dependent", { bold: true }), td("A share q of the majority-class points is relabelled as minority; the minority class is untouched (q = 10, 20, 30%)"), td("One class systematically mislabelled as the other (noise rates ρ_maj = q, ρ_min = 0)")],
]), { x: 0.6, y: 1.55, w: 12.1, colW: [2.0, 6.0, 4.1], fontSize: 12, rowH: 0.75 });
setupBox(s, 0.6, 4.6, 12.1, 1.45, [
  "35 UCI/KEEL datasets; 70/30 stratified splits (10 splits for uniform noise, 5 for the two new noise models); features standardised on the training part; noise only on training labels, test labels always clean.",
  "Same seven models, grids and two tuning methods as paper 1. NAF adds k ∈ {5, 10} neighbours and γ ∈ {1, 3}: 1,960 settings per split vs 490 for GBLSTSVM. Extra rows: GBLSTSVM with all balls kept (no weight) and FKNN-LSTSVM (the same weight on single points).",
], "Shared setup");
takeaway(s, "The two new noise models are paper 2's own experiments; paper 1 only uses uniform noise.");
s.addNotes("Paper 2 tests three kinds of label noise. Uniform noise is what everyone uses: random labels are flipped. Boundary-targeted noise flips mostly points that are close to the other class, because that is where people make mistakes. Class-dependent noise relabels part of the big class as the small class, which is common in practice, for example when rare cases are over-reported. The formulas are on the slide. Everything else, the datasets, splits, models and settings, is the same as in paper 1, so the results can be compared, but the two new noise models only appear in paper 2.");

// Test E: deletion
s = content("Paper 2: NAF-GBLSTSVM", "Test E: what deleting single-point balls throws away");
if (NDIAG) {
  const KN = { uniform: "Uniform", boundary: "Boundary", asymmetric: "Class-dep." };
  const rows = [[th("Noise"), th("Level", centre), th("Wrong labels", centre), th("Correct", centre), th("Correct, boundary", centre), th("Correct, interior", centre), th("Correct, minority", centre)]];
  NDIAG.forEach(r => rows.push([td(KN[r.kind]), td(`${Math.round(r.noise * 100)}%`, centre), ...["deleted_flipped", "deleted_clean", "deleted_clean_boundary", "deleted_clean_interior", "deleted_clean_minority"].map(c => td(r[c] === "" || r[c] === undefined ? "–" : f1(100 * r[c]), centre))]));
  table(s, rows, { x: 0.6, y: 1.55, w: 7.6, colW: [1.3, 0.8, 1.1, 1.0, 1.2, 1.1, 1.1], fontSize: 11.5, rowH: 0.34 });
} else running(0.6, 1.55, 7.6, 4.5, "deletion analysis on 35 datasets");
setupBox(s, 8.4, 1.55, 4.3, 4.5, [
  "35 datasets, 5 splits; balls built on the noisy training part with 2, 4 and 6 clusters per split, purity 0.985.",
  "Number = % of that group of training points that ends up alone in a ball (GBLSTSVM deletes these).",
  "Boundary = the quarter of each class closest to the other class (true labels); interior = the other three quarters.",
  "Minority = correct points of the rare class.",
]);
takeaway(s, "The deletion removes most wrong labels, but also a big share of the correct border and minority points.");
s.addNotes("This is the first analysis of paper 2, now on all 35 datasets and the three noise models. For every group of training points the table gives the share that GBLSTSVM deletes. The deletion is a noise filter: most of the wrongly labelled points go. But it cannot tell a wrong point from a correct point on the border, so it also deletes many correct border points and many correct points of the rare class.");

// Test F: detection
s = content("Paper 2: NAF-GBLSTSVM", "Test F: which ball weight spots wrong labels?");
if (NDIAG) {
  const KN = { uniform: "Uniform", boundary: "Boundary", asymmetric: "Class-dep." };
  const cols = [["auc_singleton", "Deletion"], ["auc_T1", "Centre dist."], ["auc_T2", "Entropy"], ["auc_T4", "Overlap"], ["auc_T5", "Density"], ["auc_T7", "NAF"], ["auc_point_knn", "Fuzzy kNN (points)"]];
  const rows = [[th("Noise"), th("Level", centre), ...cols.map(([, h]) => th(h, centre))]];
  NDIAG.filter(r => r.noise > 0).forEach(r => rows.push([td(KN[r.kind]), td(`${Math.round(r.noise * 100)}%`, centre), ...cols.map(([c]) => td(f2(r[c]), Object.assign({ bold: c === "auc_T7", color: c === "auc_T7" ? HEX.accent4 : HEX.dk1 }, centre)))]));
  table(s, rows, { x: 0.6, y: 1.55, w: 7.6, colW: [1.1, 0.7, 0.9, 0.9, 0.8, 0.8, 0.8, 0.7, 0.9], fontSize: 11, rowH: 0.36 });
} else running(0.6, 1.55, 7.6, 4.5, "detection test on 35 datasets");
setupBox(s, 8.4, 1.55, 4.3, 4.5, [
  "Same balls as Test E, but all balls kept; each point gets its ball's weight (0 if its label differs from the ball's).",
  "AUC = chance that a flipped point gets a lower weight than a correct point; 0.5 = guessing, 1 = perfect.",
  "Weights: deletion (0/1), distance to class centre (GBFTSVM), 1 − entropy, overlap with other-class balls, density, NAF (k = 10, γ = 1), and the same agreement on single points.",
]);
takeaway(s, "Only weights that look at the neighbours catch wrong labels well; a ball's own size, purity or centre distance do not.");
s.addNotes("The second analysis asks which weight could replace the deletion. A good weight is low for wrongly labelled points. We measure this with the AUC, the chance that a flipped point gets a lower weight than a correct one. The weights from the published fuzzy granular-ball SVMs, such as the distance to the class centre, are weak. The entropy weight is even worse than guessing, because a flipped point sits alone in a pure ball. The neighbour agreement, NAF, is the clear winner.");

// Test G: published-style tuning
s = content("Paper 2: NAF-GBLSTSVM", "Test G: published-style tuning, uniform noise");
s.addText("Average accuracy (%), 35 datasets, 10 splits; best in each column in bold", tx({ x: 0.6, y: 1.5, w: 7.6, h: 0.3, fontSize: 13.5, bold: true, color: C.text2 }));
nafTable(NSUM, "oracle", "accuracy", NZU, 0.6, 1.85, 7.6);
card(s, 0.6, 4.9, 7.6, 1.15);
s.addText(bullets([
  `NAF has the best average rank at every noise level; its mean accuracy ties LS-GBLSTSVM (difference ${nfRng(NPAIR, "oracle", "accuracy", "LS-GBLSTSVM", NZU)}, not significant).`,
  `Over GBLSTSVM: ${nfRng(NPAIR, "oracle", "accuracy", "GBLSTSVM", NZU)} points (p < 0.001 at every level). Over keeping balls without a weight: ${nfRng(NPAIR, "oracle", "accuracy", "GB-keep", NZU)}.`,
], { space: 4 }), tx({ x: 0.8, y: 5.0, w: 7.2, h: 1.0, fontSize: 12.5 }));
setupBox(s, 8.4, 1.5, 4.3, 4.55, [
  "Every setting is trained on the training part and scored on the test part; the best test score per split is kept (optimistic for all models).",
  "c_1, c_2 (or C) in 0.001…1000; TSVM C_1, C_2 in 2^{−5}…2^{5}; LS-GBLSTSVM c_3 = c_4 in 0.001…1000; 2–6 clusters per split; class weight off/on.",
  "NAF adds k ∈ {5, 10}, γ ∈ {1, 3}.",
  "Avg rank: mean over datasets and noise levels (1 = best).",
]);
takeaway(s, "With the papers' tuning, the simple NAF fix is ranked first, level with LS-GBLSTSVM and clearly above GBLSTSVM.");
s.addNotes("Under the tuning style of the published papers, NAF has the best average rank at every noise level. Its mean accuracy is the same as LS-GBLSTSVM's, and it is clearly ahead of the original GBLSTSVM, by about one and a half points, at every noise level. Keeping the balls without a weight already helps, and the weight adds a bit more than half a point to a point and a half on top.");

// Test H: fair CV
s = content("Paper 2: NAF-GBLSTSVM", "Test H: fair cross-validation, uniform noise");
s.addText("Accuracy (%)", tx({ x: 0.6, y: 1.5, w: 6.0, h: 0.3, fontSize: 13.5, bold: true, color: C.text2 }));
nafTable(NSUM, "cv", "accuracy", NZU, 0.6, 1.85, 6.0, { mw: 1.9, fs: 10.5, rowH: 0.33 });
s.addText("Balanced accuracy (%)", tx({ x: 6.75, y: 1.5, w: 6.0, h: 0.3, fontSize: 13.5, bold: true, color: C.text2 }));
nafTable(NSUM, "cv", "balanced_accuracy", NZU, 6.75, 1.85, 6.0, { mw: 1.9, fs: 10.5, rowH: 0.33 });
card(s, 0.6, 4.75, 12.1, 1.3);
s.addText(bullets([
  `NAF vs GBLSTSVM: accuracy ${nfRng(NPAIR, "cv", "accuracy", "GBLSTSVM", NZU)} (significant at 20% and 30%), balanced accuracy ${nfRng(NPAIR, "cv", "balanced_accuracy", "GBLSTSVM", NZU)} (significant at 0, 5, 15, 20, 30%).`,
  `But SVM, TSVM, LSTSVM and LS-GBLSTSVM are ahead of NAF on clean and mildly noisy data (accuracy vs LS-GBLSTSVM ${nfRng(NPAIR, "cv", "accuracy", "LS-GBLSTSVM", NZU)}). Settings chosen by 5-fold CV on the training part; same grids as Test G.`,
], { space: 4 }), tx({ x: 0.8, y: 4.85, w: 11.7, h: 1.15, fontSize: 12.5 }));
takeaway(s, "With honest tuning, NAF fixes GBLSTSVM's weak spots (rare class, high noise) but does not beat the point-based models.");
s.addNotes("With fair cross-validation the picture is more modest. NAF clearly improves the original GBLSTSVM on balanced accuracy, which is the score that cares about the rare class, and on accuracy at high noise. But on clean or lightly noisy data, plain SVM, TSVM, LSTSVM and LS-GBLSTSVM are better. Paper 2 says this openly; it is part of its message.");

// Test I: protocol flips the ranking
s = content("Paper 2: NAF-GBLSTSVM", "Test I: the tuning method flips the ranking");
{
  const nz4 = [0, 0.1, 0.2, 0.3];
  const CFG = { SVM: 14, TSVM: 242, GBSVM: 70, LSTSVM: 98, GBLSTSVM: 490, "LS-GBLSTSVM": 490, [NAF]: 1960 };
  const rows = [[th("Model"), th("Settings", centre), ...nz4.map(n => th(`${Math.round(n * 100)}%: gain · rank`, centre))]];
  NMODELS.forEach(([m, label]) => rows.push([td(label, { bold: m === NAF }), td(String(CFG[m]), centre), ...nz4.map(n => {
    const g = nfCell(NSUM, "oracle", "accuracy", n, m).mean - nfCell(NSUM, "cv", "accuracy", n, m).mean;
    return td(`${f1(g)} · ${f1(nfCell(NSUM, "oracle", "accuracy", n, m).avg_rank)}→${f1(nfCell(NSUM, "cv", "accuracy", n, m).avg_rank)}`, centre);
  })]));
  table(s, rows, { x: 0.6, y: 1.55, w: 8.2, colW: [2.2, 0.9, 1.275, 1.275, 1.275, 1.275], fontSize: 11.5, rowH: 0.4 });
}
setupBox(s, 9.0, 1.55, 3.7, 4.5, [
  "Same runs as Tests G and H (35 datasets, 10 splits, uniform noise, accuracy).",
  "Gain = published-style accuracy minus fair-CV accuracy (points).",
  "Rank: average rank among the 7 models, published-style → fair CV (1 = best).",
  "Settings = combinations searched per split.",
]);
takeaway(s, "GBLSTSVM ranks above SVM, TSVM and LSTSVM with the papers' tuning, and below all three with fair CV, at every noise level.");
s.addNotes("This slide is the core evaluation finding of paper 2. Every model scores higher when the test set is used to pick its settings, but the granular-ball models gain more. They have more settings to choose from, for example the number of clusters per split. As a result GBLSTSVM looks better than SVM, TSVM and LSTSVM under the published tuning, and worse than all three under fair cross-validation, at every noise level. NAF drops from about rank two to about rank four. So a claim that a granular-ball model beats a point-based one depends on how the settings were chosen.");

// Test J: new noise types
s = content("Paper 2: NAF-GBLSTSVM", "Test J: boundary-targeted and class-dependent noise");
if (NB || NA) {
  const nz3 = [0.1, 0.2, 0.3];
  const rows = [[th("Model"), ...["Boundary", "Class-dep."].flatMap(k => ["test-tuned", "fair CV"].map(p => th(`${k}, ${p}`, centre)))]];
  NMODELS.forEach(([m, label]) => rows.push([td(label, { bold: m === NAF }), ...[NB, NA].flatMap(src => ["oracle", "cv"].map(p => {
    if (!src) return td("running", centre);
    const v = nz3.map(n => nfCell(src, p, "accuracy", n, m)).filter(Boolean);
    return v.length ? td(v.map(c => f1(c.mean)).join(" / "), Object.assign({ bold: m === NAF, color: m === NAF ? HEX.accent4 : HEX.dk1 }, centre)) : td("–", centre);
  }))]));
  table(s, rows, { x: 0.6, y: 1.55, w: 12.1, colW: [2.5, 2.4, 2.4, 2.4, 2.4], fontSize: 11.5, rowH: 0.42 });
} else running(0.6, 1.55, 12.1, 3.4, "boundary-targeted and class-dependent noise runs");
setupBox(s, 0.6, 5.0, 12.1, 1.05, [
  "Average accuracy (%) at 10 / 20 / 30% noise, 35 datasets, 5 splits. Noise models as on the setup slide; models, grids and tuning methods as in Tests G and H.",
]);
takeaway(s, "New in paper 2: does the NAF fix still help when the wrong labels sit at the border or come from one class?");
s.addNotes("The last test repeats the comparison with the two new kinds of label noise. Each cell gives the average accuracy at ten, twenty and thirty percent noise, under the published tuning and under fair cross-validation.");

// verdict
s = content("Paper 2: NAF-GBLSTSVM", "Paper 2: honest verdict and next steps");
three(s, [
  ["✓", "What paper 2 can claim", "NAF-GBLSTSVM: best average rank of 7 models with the papers' tuning, +1.2 to +1.9 over GBLSTSVM. With fair CV: up to +3.4 accuracy and +4.7 balanced accuracy over GBLSTSVM at 30% noise. Motivated by the deletion analysis (Test E) and the detection test (Test F).", C.accent1],
  ["✗", "What it cannot claim", "That NAF is a new fuzzy function (SDAP-GBRVFL has the same count). That NAF beats SVM / LSTSVM / LS-GBLSTSVM under fair CV on clean data. That NAF beats RF-GBLSTSVM (paper 1 is stronger; we do not put RF in paper 2's tables).", C.accent2],
  ["→", "Next", "Finish the runs: new noise types, deletion analysis, Gaussian kernel and k/γ sensitivity for NAF. Fill those sections, then choose journals with your supervisor (different journals for the two papers is safer).", C.accent5],
], { h: 4.3, fs: 14 });
takeaway(s, "Two method papers: RF (radius-aware, regularised) and NAF (plain neighbour agreement, original GBLSTSVM). Each cites the other.");
s.addNotes("To sum up paper 2. It can honestly claim a simple, cheap fuzzy GBLSTSVM that is ranked first under the published tuning and fixes GBLSTSVM's rare-class and high-noise weakness under fair tuning. It cannot claim a new fuzzy function, because the neighbour count already exists in the granular-ball RVFL paper, and it cannot claim to beat the point-based models under fair tuning. We also keep the radius-aware model out of paper 2's tables, so the two papers do not report the same comparison.");

// ===================================================================================== 16. References
s = content("References", "References");
s.addText(REFS.map(([, t], i) => ({ text: `[${i + 1}] ${t}`, options: { breakLine: i < REFS.length - 1, paraSpaceAfter: 5 } })), tx({ x: 0.6, y: 1.5, w: 12.1, h: 5.3, fontSize: 11.5 }));
s.addNotes("References for the models and ideas mentioned in this deck. The last entry is our own repository, which holds every script and result shown.");

(async () => {
  await pres.writeFile({ fileName: OUT });
  await applyTheme(OUT, THEME);
  const removed = await dropInnerParagraphProps(OUT);
  console.log("wrote", OUT, `(${removed} inner paragraph properties removed)`);
})();
