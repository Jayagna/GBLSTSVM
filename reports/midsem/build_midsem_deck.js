// Builds the midsem presentation for the GBLSTSVM fuzzy-membership project.
// Run: PPTX_SKILL_DIR=<pptx skill dir> NODE_PATH=<dir with pptxgenjs> node build_midsem_deck.js [out.pptx]
// Every number comes from midsem_data.json (python3 midsem_data.py); figures come from
// the guide (guide/fig) and the paper tables (results/paper in the GBLSTSVM repo).
const fs = require("fs");
const path = require("path");
const pptxgen = require("pptxgenjs");
const { applyTheme } = require(process.env.PPTX_SKILL_DIR + "/scripts/apply_theme.js");

const OUT = process.argv[2] || path.join(__dirname, "GBLSTSVM_Midsem_Presentation.pptx");
const D = JSON.parse(fs.readFileSync(path.join(__dirname, "midsem_data.json"), "utf8"));
const FIG = "/mnt/project-files/guide/fig";
const PAPER = "/home/user/GBLSTSVM/results/paper";
const REPO = "/home/user/GBLSTSVM";

const THEME = {
  name: "Granular Petrol",
  headFontFace: "Cambria",
  bodyFontFace: "Calibri",
  colors: {
    dk1: "17242A", lt1: "FFFFFF", dk2: "12333D", lt2: "EEF3F2",
    accent1: "00897B", // teal: our fix (keep + T7)
    accent2: "C0492F", // brick: GBLSTSVM
    accent3: "2B63C6", // blue: LSTSVM
    accent4: "7B4FB0", // violet: GBFTSVM
    accent5: "B88200", // amber: fuzzy-kNN LSTSVM
    accent6: "5A7A82", // slate: secondary text
    hlink: "00897B", folHlink: "5A7A82",
  },
};
const HEX = THEME.colors;
// chart colours follow the model, never its rank (validated with the dataviz palette checker)
const COL = { GBLSTSVM: HEX.accent2, KEEPT7: HEX.accent1, GBFTSVM: HEX.accent4, FKNN: HEX.accent5, LSTSVM: HEX.accent3 };
const NOISE_RAMP = ["8FB3BA", "5A8D97", "2E6470", "12333D"]; // 0, 10, 20, 30% (ordinal ramp, validated)
const GRID = "DCE5E4";
const CODE_FONT = "Courier New";

const pres = new pptxgen();
pres.layout = "LAYOUT_WIDE"; // 13.33 x 7.5 in
pres.title = "Where do granular balls help twin SVMs? Midsem presentation";
pres.author = "Jayagna";
pres.theme = { headFontFace: THEME.headFontFace, bodyFontFace: THEME.bodyFontFace };
const C = pres.SchemeColor;

// ---------------------------------------------------------------- numbers
const NZ = ["0", "0.1", "0.2", "0.3"];
const NZL = ["0%", "10%", "20%", "30%"];
const LIN = D.linear, TW = D.twin, KER = D.kernel, DIAG = D.diagnostics, TT = D.test_tuning;
const f1 = v => v.toFixed(1);
const f2 = v => v.toFixed(2);
const sgn = v => (v >= 0 ? "+" : "−") + Math.abs(v).toFixed(1);
const pf = p => (p < 0.001 ? "< 0.001" : p.toFixed(3));
const range = (arr, d = 1) => {
  const lo = Math.min(...arr), hi = Math.max(...arr);
  return lo.toFixed(d) === hi.toFixed(d) ? lo.toFixed(d) : `${lo.toFixed(d)}–${hi.toFixed(d)}`;
};
const linMean = (nz, m) => LIN[nz].mean[m];
const gainT7 = NZ.map(n => LIN[n].diff_vs_ref["T7-agree"]);
const pT7 = NZ.map(n => LIN[n].holm_p["T7-agree"]);
const winsT7 = NZ.map(n => LIN[n].wins["T7-agree"]);
const lstsvmMinusT7 = NZ.map(n => linMean(n, "LSTSVM") - linMean(n, "T7-agree"));
const fknnMinusT7 = NZ.map(n => linMean(n, "FKNN-LSTSVM") - linMean(n, "T7-agree"));
const t7VsFt = NZ.map(n => TW[n].diff_vs_ref["T7-agree"]);
const t7VsFtP = NZ.map(n => TW[n].holm_p["T7-agree"]);
const keepFt = NZ.map(n => TW[n].diff_vs_ref["GBFTSVM-keep"]);
const twVsFt = NZ.map(n => TW[n].diff_vs_ref["GBTWSVM"]); // GBTWSVM - GBFTSVM
const twVsFtP = NZ.map(n => TW[n].holm_p["GBTWSVM"]);
const gbVsFt = NZ.map(n => TW[n].diff_vs_ref["GBLSTSVM"]); // GBLSTSVM - GBFTSVM
const tuneGain = m => NZ.map(n => TT[m][n].test_tuned_ba - TT[m][n].cv_ba);
const allTuneGain = [...tuneGain("GBLSTSVM"), ...tuneGain("GBFTSVM")];
const purePct = 100 - Math.max(...NZ.map(n => TT.GBFTSVM[n].impure_pct));
const R1 = D.round1, R2 = D.round2;
const R1M = ["T1-centre", "T2-entropy", "T4-overlap", "T5-density"];
const r1Gain = R1M.flatMap(m => ["0", "0.1", "0.2"].map(n => R1[n][m] - R1[n].GBLSTSVM));
const auc = (nz, k) => DIAG[nz][k];
const aucRange = k => range(["0.1", "0.2", "0.3"].map(n => auc(n, k)), 2);
const PVO = D.paper_vs_ours;
const pvoMean = k => Object.values(PVO).reduce((a, r) => a + r[k], 0) / Object.keys(PVO).length;
const DS = D.datasets;

// ---------------------------------------------------------------- references
const REFS = [
  ["svm", "C. Cortes, V. Vapnik. Support-vector networks. Machine Learning 20(3):273–297, 1995."],
  ["twsvm", "Jayadeva, R. Khemchandani, S. Chandra. Twin support vector machines for pattern classification. IEEE Trans. Pattern Analysis and Machine Intelligence 29(5):905–910, 2007."],
  ["lstsvm", "M. A. Kumar, M. Gopal. Least squares twin support vector machines for pattern classification. Expert Systems with Applications 36(4):7535–7543, 2009."],
  ["gbc", "S. Xia, Y. Liu, X. Ding, G. Wang, H. Yu, Y. Luo. Granular ball computing classifiers for efficient, scalable and robust learning. Information Sciences 483:136–152, 2019."],
  ["gblstsvm", "M. Tanveer, R. K. Sharma, A. Quadir, M. Sajid. Enhancing robustness and efficiency of least square twin SVM via granular computing. Pattern Recognition, 112021, 2025. (GBLSTSVM)"],
  ["gbtsvm", "A. Quadir, M. Sajid, M. Tanveer. Granular ball twin support vector machine. IEEE Trans. Neural Networks and Learning Systems, 2025. (GBTSVM)"],
  ["adpgbg", "W. Liao, Q. Zhang, Q. Xie, M. Gao, P. Jin. A new adaptive and effective granular ball generation method for classification. Int. J. Machine Learning and Cybernetics 16:3501–3520, 2025. (ADPGBG)"],
  ["fsvm", "C.-F. Lin, S.-D. Wang. Fuzzy support vector machines. IEEE Trans. Neural Networks 13(2):464–471, 2002."],
  ["efsvm", "Q. Fan, Z. Wang, D. Li, D. Gao, H. Zha. Entropy-based fuzzy support vector machine for imbalanced datasets. Knowledge-Based Systems 115:87–99, 2017."],
  ["iftsvm", "S. Rezvani, X. Wang, F. Pourpanah. Intuitionistic fuzzy twin support vector machines. IEEE Trans. Fuzzy Systems 27(11):2140–2151, 2019."],
  ["fknn", "J. M. Keller, M. R. Gray, J. A. Givens. A fuzzy K-nearest neighbor algorithm. IEEE Trans. Systems, Man, and Cybernetics 15(4):580–585, 1985."],
  ["yager", "R. R. Yager. Pythagorean membership grades in multicriteria decision making. IEEE Trans. Fuzzy Systems 22(4):958–965, 2014."],
  ["gbfsvm", "Y. Xue, Y. Shao, H. Xia. GBFSVM: a robust classification learning method. Scientific Journal of Intelligent Systems Research 4(1):238–245, 2022."],
  ["gbtwsvm", "L. Zhao, Z. Zhang, W. Liu, G. Lang. GBTWSVM: granular-ball twin support vector machine. Int. Joint Conf. on Rough Sets (IJCRS), 2024."],
  ["gbftsvm", "L. Zhao, W. Ding, D. Miao, G. Lang. Granular-balls based fuzzy twin support vector machine for classification. arXiv:2408.00699, 2024. (GBFTSVM)"],
  ["noise", "B. Frénay, M. Verleysen. Classification in the presence of label noise: a survey. IEEE Trans. Neural Networks and Learning Systems 25(5):845–869, 2014."],
  ["demsar", "J. Demšar. Statistical comparisons of classifiers over multiple data sets. J. Machine Learning Research 7:1–30, 2006."],
  ["holm", "S. Holm. A simple sequentially rejective multiple test procedure. Scandinavian J. Statistics 6(2):65–70, 1979."],
  ["rsvm", "Y.-J. Lee, O. L. Mangasarian. RSVM: Reduced support vector machines. Proc. SIAM Int. Conf. on Data Mining, 2001."],
  ["liblinear", "R.-E. Fan, K.-W. Chang, C.-J. Hsieh, X.-R. Wang, C.-J. Lin. LIBLINEAR: a library for large linear classification. J. Machine Learning Research 9:1871–1874, 2008."],
  ["dcd", "C.-J. Hsieh, K.-W. Chang, C.-J. Lin, S. S. Keerthi, S. Sundararajan. A dual coordinate descent method for large-scale linear SVM. Proc. ICML, 2008."],
  ["uci", "M. Kelly, R. Longjohn, K. Nottingham. The UCI Machine Learning Repository. https://archive.ics.uci.edu, 2023."],
  ["keel", "J. Alcalá-Fdez et al. KEEL data-mining software tool: data set repository, integration of algorithms and experimental analysis framework. J. Multiple-Valued Logic and Soft Computing 17(2–3):255–287, 2011."],
  ["matlab", "G. Jindal. GBLSTSVM MATLAB research suite (SOP research code, unpublished): CW, CR, CBCM, Topo and OBRU weights; ADPGBG port."],
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
    { text: { text: "Fuzzy membership for GBLSTSVM · Midsem presentation", options: { x: 0.6, y: 7.02, w: 8, h: 0.3, fontSize: 10, color: C.accent6 } } },
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

// =====================================================================================
// 1. Title
// =====================================================================================
let s = newSlide("TITLE", "Introduction");
s.addText("Where Do Granular Balls Help Twin SVMs?", { placeholder: "title" });
s.addText([
  { text: "Fuzzy membership, label noise and a fair test for GBLSTSVM", options: { breakLine: true } },
  { text: "Midsem presentation · Jayagna · October 2026", options: { fontSize: 15, paraSpaceBefore: 14 } },
], { placeholder: "body" });
motif(s);
s.addNotes("Opening. The project started as: find a new fuzzy membership function for GBLSTSVM, the least squares twin SVM trained on granular balls, that makes it more accurate and more robust. Along the way we found that the bigger issue is not the membership but which points the balls throw away, and that the way these models are usually evaluated inflates their scores. This talk goes from the background to what we tried, what we found, and the plan for the paper.");

// =====================================================================================
// 2. Outline
// =====================================================================================
s = content("Introduction", "Outline");
[
  ["Background", "Twin SVMs, granular balls and fuzzy membership"],
  ["Research question", "What we set out to find, as four sub-questions"],
  ["Method", "A fair test protocol and seven candidate memberships"],
  ["Experiments", "Rounds 1 to 5: what failed, what worked and why"],
  ["Results", "Our fix, the kernel version, speed, and the published GBFTSVM baseline"],
  ["Conclusion", "Findings, paper plan and next steps"],
].forEach(([t, d], i) => {
  const x = i < 3 ? 0.6 : 6.85, y = 1.65 + (i % 3) * 1.5;
  badge(s, x, y + 0.05, String(i + 1), C.accent1, 0.6, 18);
  s.addText(t, tx({ x: x + 0.85, y, w: 4.9, h: 0.45, fontSize: 20, bold: true, color: C.text2, fontFace: THEME.headFontFace }));
  s.addText(d, tx({ x: x + 0.85, y: y + 0.48, w: 4.9, h: 0.6, fontSize: 15, color: C.text1 }));
});
s.addNotes("Six parts. Background explains the three ingredients: twin SVMs, granular balls and fuzzy membership. Then the research question, the protocol we built to test it fairly, the experiments round by round, the main results including the comparison with the closest published model (GBFTSVM), and finally the findings and the plan.");

// =====================================================================================
// 3. The story in one slide
// =====================================================================================
s = content("Introduction", "The story in one slide", "Summary");
const stats = [
  [sgn(Math.max(...r1Gain)), "points: the best gain from four fuzzy weights on GBLSTSVM’s balls (round 1)", C.text2],
  [`${Math.round(100 * auc("0.2", "deleted_clean"))}%`, `of correct training points are deleted by GBLSTSVM at 20% noise, along with ${Math.round(100 * auc("0.2", "deleted_flipped"))}% of the mislabelled ones`, C.accent2],
  [sgn(gainT7[3]), `points for our fix (keep + T7) over GBLSTSVM at 30% noise, Holm p ${pT7[3] < 0.001 ? "< 0.001" : "= " + pf(pT7[3])}`, C.accent1],
  [`+${Math.floor(Math.min(...allTuneGain))}–${Math.round(Math.max(...allTuneGain))}`, "points of balanced accuracy gained just by tuning on the test set, as the original code and the GBFTSVM paper do", C.accent4],
];
stats.forEach(([big, label, col], i) => {
  const x = 0.6 + i * 3.1;
  card(s, x, 1.6, 2.85, 3.6, { name: "stat-card" });
  s.addText(big, tx({ x: x + 0.22, y: 1.8, w: 2.45, h: 1.15, fontSize: 46, bold: true, color: col, fontFace: THEME.headFontFace, valign: "middle" }));
  s.addText(label, tx({ x: x + 0.22, y: 3.05, w: 2.45, h: 2.0, fontSize: 16 }));
});
s.addText("Fuzzy weights on balls are not the bottleneck. What GBLSTSVM deletes is, and keeping every ball while weighting it by how many neighbours share its label recovers most of the loss.",
  tx({ x: 0.6, y: 5.4, w: 12.1, h: 0.7, fontSize: 16, italic: true, color: C.text2 }));
takeaway(s, "Main message: granular balls help twin SVMs under heavy label noise, but only when no ball is thrown away.");
s.addNotes("If the professor remembers one slide, it is this one. First, none of the fuzzy weights we put on the balls gained more than a point. Second, the reason: GBLSTSVM deletes every ball that holds a single point. That removes most mislabelled points, which is good, but also about half of the correct points, mostly those near the class border. Third, our fix keeps all balls and down-weights a ball when its neighbours carry the other label (T7); it gains about 5 points at 30% noise. Fourth, the original code chooses its settings by the test score; doing so inflates results by 9 to 15 points, which matters when comparing with published numbers.");

// =====================================================================================
// 4. From SVM to LSTSVM
// =====================================================================================
s = content("Background", "From SVM to the least squares twin SVM");
const models = [
  ["SVM " + R("svm"), "One separating line with the widest margin; one large quadratic program (QP) over all points.", 1],
  ["TWSVM " + R("twsvm"), "Two lines, each close to one class and far from the other; two QPs of half the size, about 4× faster.", 2],
  ["LSTSVM " + R("lstsvm"), "Squared errors and equality constraints: each line is the solution of a small linear system. No QP.", 2],
];
models.forEach(([name, text, nLines], i) => {
  const x = 0.6 + i * 4.12;
  card(s, x, 1.5, 3.86, 2.6, { name: "model-card" });
  // mini sketch: two point clouds and one or two lines
  const ox = x + 0.35, oy = 1.62;
  [[0.1, 0.15], [0.35, 0.05], [0.2, 0.45], [0.5, 0.3], [0.05, 0.6]].forEach(([dx, dy]) => s.addShape(pres.shapes.OVAL, { x: ox + dx, y: oy + dy, w: 0.13, h: 0.13, fill: { color: C.accent1 }, line: { color: C.accent1 }, objectName: "dot" }));
  [[1.0, 0.45], [1.25, 0.3], [1.15, 0.7], [1.45, 0.6], [1.35, 0.85]].forEach(([dx, dy]) => s.addShape(pres.shapes.OVAL, { x: ox + dx, y: oy + dy, w: 0.13, h: 0.13, fill: { color: C.accent5 }, line: { color: C.accent5 }, objectName: "dot" }));
  if (nLines === 1) {
    s.addShape(pres.shapes.LINE, { x: ox + 0.55, y: oy, w: 0.5, h: 1.0, flipH: true, line: { color: C.text2, width: 2 }, objectName: "sketch-line" });
  } else {
    s.addShape(pres.shapes.LINE, { x: ox + 0.05, y: oy + 0.05, w: 0.6, h: 0.75, flipH: true, line: { color: C.accent1, width: 2 }, objectName: "sketch-line" });
    s.addShape(pres.shapes.LINE, { x: ox + 1.05, y: oy + 0.25, w: 0.55, h: 0.75, flipH: true, line: { color: C.accent5, width: 2 }, objectName: "sketch-line" });
  }
  s.addText(name, tx({ x: x + 2.25, y: 1.65, w: 1.5, h: 0.9, fontSize: 16, bold: true, color: C.text2, valign: "middle" }));
  s.addText(text, tx({ x: x + 0.25, y: 2.75, w: 3.4, h: 1.25, fontSize: 14 }));
});
card(s, 0.6, 4.3, 12.1, 1.75, { fill: C.background1, line: GRID, name: "equation-card" });
s.addText("LSTSVM, line 1 (close to class +1)", tx({ x: 0.85, y: 4.42, w: 5, h: 0.35, fontSize: 14, bold: true, color: C.accent6 }));
s.addText(eqLines([
  "min  ½‖A w_1 + e b_1‖^2 + (c_1/2) ‖ξ‖^2     subject to   −(B w_1 + e b_1) + ξ = e",
  "⇒   [w_1 ; b_1] = −(G^TG + (1/c_1) H^TH)^{−1} G^Te,       H = [A  e],  G = [B  e]",
  "A new point x goes to the class of the nearer line:  class(x) = argmin_k |w_k^Tx + b_k| / ‖w_k‖",
], { fontFace: THEME.headFontFace, fontSize: 16, color: C.text1 }), tx({ x: 0.85, y: 4.8, w: 11.6, h: 1.2, paraSpaceAfter: 4 }));
takeaway(s, "LSTSVM is fast and simple, but every training point counts equally, including mislabelled ones.");
s.addNotes("A classic SVM finds one line with the widest gap between classes, by solving one big optimisation problem. The twin SVM finds two lines instead, each hugging one class and staying away from the other; that splits the work into two smaller problems and runs about four times faster. The least squares twin SVM (LSTSVM) replaces the inequality constraints with equalities and squares the errors, so each line comes from solving a small linear system, the formula at the bottom. A and B are the points of the two classes; c1 trades off fitting class +1 against keeping class -1 away. A new point is assigned to whichever line is closer. The weakness we care about: every training point has the same weight, so a mislabelled point pulls on the lines as hard as a correct one.");

// =====================================================================================
// 5. Granular balls
// =====================================================================================
s = content("Background", "Granular balls: train on balls instead of points");
s.addImage({ path: path.join(FIG, "fig1_balls.png"), x: 0.6, y: 1.5, w: 7.1, h: 7.1 / 1.82, altText: "Left: training points of two classes. Right: the same data covered by 19 granular balls with the two GBLSTSVM planes; 24 single-point balls are deleted and shown as grey crosses." });
s.addText(bullets([
  [B("Granular balls " + R("gbc") + ": "), "split the training set with k-means until each ball is at least 98.5% one class."],
  [B("A ball "), "= centre c, radius r (mean distance of its points) and a label."],
  [B("GBLSTSVM " + R("gblstsvm") + ": "), "LSTSVM fitted to the ball centres; the radius widens the margin a ball must keep: −(Gz) + ξ = e + r."],
  [B("Why: "), "fewer training units, so it is faster, and it is claimed to resist noise."],
  [B("Then: "), "every ball holding a single point is deleted (grey crosses)."],
], { space: 9 }), tx({ x: 8.0, y: 1.55, w: 4.7, h: 4.4, fontSize: 15 }));
takeaway(s, "Every remaining ball enters the model with the same weight: that is where a fuzzy membership can go.");
s.addNotes("Granular-ball computing replaces the training points with balls. Starting from the whole training set, it splits with k-means until each ball is almost pure, meaning at least 98.5% of its points share one label. Each ball is summarised by its centre, radius and label. GBLSTSVM, published in Pattern Recognition in 2025 by Tanveer and co-authors, fits the LSTSVM lines to the ball centres and uses the radius in the constraint, so a big ball must stay further from the other class's line. On the right of the figure there are 19 balls instead of 170 points. One detail turns out to matter a lot: balls that end up with a single point are deleted, the grey crosses. Our starting idea was to give each ball a fuzzy membership, a trust weight, because right now all balls count equally.");

// =====================================================================================
// 6. Fuzzy membership
// =====================================================================================
s = content("Background", "Fuzzy membership: trust each training unit differently");
card(s, 0.6, 1.5, 4.75, 4.5, { name: "fsvm-card" });
s.addText("Fuzzy SVM " + R("fsvm"), tx({ x: 0.85, y: 1.65, w: 4.3, h: 0.4, fontSize: 18, bold: true, color: C.text2 }));
s.addText(eqLines(["min  ½‖w‖^2 + C Σ_i s_i ξ_i ,     0 < s_i ≤ 1"], { fontFace: THEME.headFontFace, fontSize: 18, color: C.text1 }),
  tx({ x: 0.85, y: 2.2, w: 4.3, h: 0.5 }));
s.addText(bullets([
  [B("s_i"), " is how much we trust training point i."],
  "A point we doubt (likely noise or an outlier) gets a small s_i, so the model may get it wrong cheaply.",
  "The whole question is how to compute s_i from the data alone.",
], { space: 10, math: true }), tx({ x: 0.85, y: 2.9, w: 4.3, h: 3.0, fontSize: 15 }));
table(s, [
  [th("Membership"), th("Idea: a unit is doubtful when …"), th("Source")],
  [td("Centre distance", { bold: true }), td("it lies far from its class centre"), td("FSVM " + R("fsvm") + "; on balls: GBFSVM " + R("gbfsvm"))],
  [td("Entropy", { bold: true }), td("its neighbourhood mixes both classes"), td("EFSVM " + R("efsvm"))],
  [td("Intuitionistic / Pythagorean", { bold: true }), td("membership and non-membership degrees disagree"), td("IFTSVM " + R("iftsvm") + ", " + R("yager") + "; on balls: GBFTSVM " + R("gbftsvm"))],
  [td("k nearest neighbours", { bold: true }), td("few neighbours share its label"), td("Fuzzy kNN " + R("fknn"))],
], { x: 5.65, y: 1.5, w: 7.05, colW: [1.95, 2.75, 2.35], fontSize: 13, rowH: [0.45, 0.85, 0.85, 0.95, 0.85] });
takeaway(s, "On points these weights are well studied; on granular balls only GBFSVM and GBFTSVM exist, and none on GBLSTSVM.");
s.addNotes("Fuzzy SVM, Lin and Wang 2002, gives every training point a membership s_i between 0 and 1 that multiplies its error in the objective. A point we do not trust gets a small s_i, so the model is allowed to misclassify it without much penalty. Different papers compute s_i differently, the table lists the main families: distance to the class centre (the original FSVM), entropy of the neighbourhood (EFSVM), intuitionistic or Pythagorean fuzzy sets that use a membership and a non-membership degree (IFTSVM; GBFTSVM on balls), and fuzzy k nearest neighbours (Keller 1985). These are the papers we took the fuzzy functions from. For granular balls only two such models existed: GBFSVM and GBFTSVM; none for the least squares version, which was our opening.");

// =====================================================================================
// 7. Research question
// =====================================================================================
s = content("Research question", "Research question");
card(s, 0.6, 1.5, 12.1, 1.35, { fill: C.text2, name: "question-card" });
s.addText("Can a fuzzy membership on granular balls make GBLSTSVM more accurate and more robust to label noise?",
  tx({ x: 0.95, y: 1.5, w: 11.4, h: 1.35, fontSize: 24, italic: true, color: C.background1, fontFace: THEME.headFontFace, valign: "middle" }));
[
  ["Q1", "Do existing memberships help when they are applied to balls instead of points?"],
  ["Q2", "If not, what is it that limits GBLSTSVM?"],
  ["Q3", "Can a new membership, or another fix, close the gap to LSTSVM trained on every point?"],
  ["Q4", "How does the fix compare with the published fuzzy granular-ball model, GBFTSVM " + R("gbftsvm") + "?"],
].forEach(([q, t], i) => {
  const x = i % 2 ? 6.75 : 0.6, y = i < 2 ? 3.15 : 4.75;
  card(s, x, y, 5.95, 1.35, { name: "subq-card" });
  badge(s, x + 0.25, y + 0.38, q, C.accent1, 0.6, 15);
  s.addText(t, tx({ x: x + 1.05, y: y + 0.12, w: 4.7, h: 1.1, fontSize: 16, valign: "middle" }));
});
s.addNotes("The main question as it was set at the start. We split it into four. Q1: do the known memberships help on balls? Q2: if not, what is actually holding GBLSTSVM back? Q3: can we close the gap to plain LSTSVM, which trains on every point? Q4: how does our answer compare with GBFTSVM, the closest published model? The rest of the talk answers these in order; the summary slide maps each finding back to its question.");

// =====================================================================================
// 8. The original code tunes on the test set
// =====================================================================================
s = content("Method", "First problem: the original code tunes on the test set");
let codeEnd = codeCard(s, 0.6, 1.5, 6.9, 4.5, "main.py (original GBLSTSVM code)", `c_candidates = [0.001, 0.01, 0.1, 1.0, 10.0, 100.0, 1000.0]
for k in k_values:                      # k-means splits: 2..6
    ...
    for c1 in c_candidates:
        for c2 in c_candidates:
            res = LSTWGBSVM(train_ball_matrix, test_data,
                            c1=c1, c2=c2, return_details=True)
            score = res["auc"]          # measured on test_data
            if score > best_uw_score:
                best_uw_score = score
                best_unweighted = (c1, c2, res)
# best_unweighted is then reported as the result`);
caption(s, "Shortened from main.py; the same loop runs again for the class-weighted model, with test AUC plus accuracy as the score.", 0.6, codeEnd + 0.12, 6.9, 0.5);
s.addText("Why this is a problem", tx({ x: 7.85, y: 1.5, w: 4.85, h: 0.4, fontSize: 18, bold: true, color: C.text2 }));
s.addText(bullets([
  "c1, c2 and k (245 combinations) are picked by their score on the test set, and that same score is reported.",
  "The test set is no longer unseen: the result is the best of 245 tries, so it is optimistic.",
  [B("We measured it: "), `+${Math.floor(Math.min(...allTuneGain))} to +${Math.round(Math.max(...allTuneGain))} points of balanced accuracy.`],
], { space: 8 }), tx({ x: 7.85, y: 1.95, w: 4.85, h: 2.4, fontSize: 15 }));
s.addText("What we do instead", tx({ x: 7.85, y: 4.4, w: 4.85, h: 0.4, fontSize: 18, bold: true, color: C.accent1 }));
s.addText("Choose every setting by 5-fold cross-validation inside the training part, and use the test set exactly once.",
  tx({ x: 7.85, y: 4.85, w: 4.85, h: 1.1, fontSize: 15 }));
takeaway(s, "Before testing any membership, we rebuilt the evaluation so that the test data never influences a choice.");
s.addNotes("This is the first thing we found when reading the code. For every k and every pair c1, c2 the model is trained, scored on the test data, and the best test score is kept and reported. That is 5 times 7 times 7, so 245 tries, with the winner picked by looking at the test labels. The reported number is then optimistic, and any small improvement from a new membership could just be luck in this selection. Later we measured the effect directly: tuning on the test set adds 9 to 15 points of balanced accuracy. So before trying memberships we rebuilt the evaluation: every setting is chosen by cross-validation on the training part, and the test set is used once at the end.");

// =====================================================================================
// 9. Protocol
// =====================================================================================
s = content("Method", "Our protocol: a fair, repeatable test bench");
const steps = [
  ["Data", `21 binary datasets from UCI and KEEL ${R("uci", "keel")}, standardised on the training part`],
  ["Split", "Stratified 70/30 train/test split, repeated 10 times with different seeds"],
  ["Noise", `Flip 0, 10, 20 or 30% of the training labels at random ${R("noise")}; test labels stay clean`],
  ["Tune", "5-fold cross-validation on the training part picks c1, c2, k and the membership settings"],
  ["Test", "Retrain on the whole training part with the chosen settings; score the test set once"],
];
steps.forEach(([t, d], i) => {
  const x = 0.6 + i * 2.47;
  card(s, x, 1.5, 2.22, 2.3, { name: "step-card" });
  badge(s, x + 0.18, 1.65, String(i + 1), C.accent1, 0.45, 14);
  s.addText(t, tx({ x: x + 0.75, y: 1.66, w: 1.35, h: 0.42, fontSize: 17, bold: true, color: C.text2, valign: "middle" }));
  s.addText(d, tx({ x: x + 0.18, y: 2.25, w: 1.92, h: 1.5, fontSize: 13 }));
  if (i < steps.length - 1) s.addShape(pres.shapes.RIGHT_ARROW, { x: x + 2.24, y: 2.5, w: 0.22, h: 0.3, fill: { color: C.accent6 }, line: { color: C.accent6 }, objectName: "flow-arrow" });
});
const nMin = Math.min(...DS.map(d => d.n)), nMax = Math.max(...DS.map(d => d.n));
const dMin = Math.min(...DS.map(d => d.d)), dMax = Math.max(...DS.map(d => d.d));
const irMax = Math.max(...DS.map(d => d.ir));
[
  ["21", `datasets: ${nMin}–${nMax.toLocaleString("en-US")} points, ${dMin}–${dMax} features, class imbalance up to ${Math.round(irMax)}:1`],
  ["10", "random splits per dataset and noise level, so 840 runs per model"],
  ["4", "label-noise levels: 0, 10, 20 and 30% of training labels flipped"],
  ["BA", "balanced accuracy (mean recall of the two classes), fair under class imbalance"],
].forEach(([big, lab], i) => {
  const x = 0.6 + i * 3.08;
  s.addText(big, tx({ x, y: 4.05, w: 2.9, h: 0.75, fontSize: 36, bold: true, color: C.accent1, fontFace: THEME.headFontFace, valign: "bottom" }));
  s.addText(lab, tx({ x, y: 4.85, w: 2.85, h: 1.1, fontSize: 14 }));
});
takeaway(s, `Statistics: Wilcoxon signed-rank tests with Holm correction ${R("holm")}, and Friedman + Nemenyi rank tests ${R("demsar")}.`);
s.addNotes("The protocol in five steps. Twenty-one binary benchmark datasets, the same family used by the LSTSVM papers. Each is split 70/30, stratified, ten times. Label noise: we flip a share of the training labels at random, which simulates annotation errors, but leave the test labels clean so we measure how well the model learned the true classes. All settings are chosen by 5-fold cross-validation on the training part. The metric is balanced accuracy, the mean of the recall on each class, because many datasets are imbalanced (up to 16 to 1) and plain accuracy would reward predicting the majority class. For statistics we follow Demsar 2006: Wilcoxon signed-rank tests across datasets with Holm correction for multiple comparisons, and Friedman tests with Nemenyi critical-difference diagrams.");

// =====================================================================================
// 10. Seven rounds
// =====================================================================================
s = content("Method", "Seven rounds of experiments, each building on the last");
const rounds = [
  ["1", "Fuzzy weights on balls", "T1, T2, T4, T5 on GBLSTSVM", "< 1 pt", C.accent2],
  ["2", "Keep single-point balls", "Undo the deletion step (T6)", "+3.8 pts", C.accent1],
  ["3", "Ball weights on points", "LSTSVM on all points, ball-based weights", "dead end", C.accent2],
  ["4", "Neighbour agreement", "T7 on all balls, up to 30% noise", "best fix", C.accent1],
  ["5", "Better ball builder", "ADPGBG balls " + R("adpgbg"), "≈ keeping", C.accent6],
  ["6", "Kernel and speed", "RBF kernel; 2.5k–100k points", "gain shrinks", C.accent6],
  ["7", "Published baseline", "GBFTSVM " + R("gbftsvm") + " re-implemented", "ours ahead", C.accent1],
];
s.addShape(pres.shapes.LINE, { x: 1.0, y: 2.1, w: 11.3, h: 0, line: { color: GRID, width: 3 }, objectName: "timeline" });
rounds.forEach(([n, t, d, tag, col], i) => {
  const x = 0.6 + i * 1.75;
  badge(s, x + 0.45, 1.8, n, C.text2, 0.6, 16);
  s.addText(t, tx({ x, y: 2.6, w: 1.6, h: 0.75, fontSize: 15, bold: true, color: C.text2, align: "center" }));
  s.addText(d, tx({ x, y: 3.4, w: 1.6, h: 0.95, fontSize: 13, align: "center" }));
  card(s, x + 0.1, 4.45, 1.4, 0.45, { fill: col, r: 0.2, name: "outcome-tag" });
  s.addText(tag, tx({ x: x + 0.1, y: 4.45, w: 1.4, h: 0.45, fontSize: 13, bold: true, color: C.background1, align: "center", valign: "middle" }));
});
s.addText("Rounds 1–5 use the linear model; round 6 adds the RBF kernel and a timing study; round 7 adds the closest published competitor. Rounds 1–3 used 5 splits; the final tables use 10.",
  tx({ x: 0.6, y: 5.25, w: 12.1, h: 0.7, fontSize: 14, color: C.accent6 }));
takeaway(s, "Each dead end pointed to the next experiment; this order is also the order of the paper.");
s.addNotes("This is the path we took. Round 1 put four fuzzy weights on GBLSTSVM's balls; none gained more than a point. That made us ask what else costs accuracy, and round 2 showed that simply keeping the single-point balls gains almost 4 points. Round 3 tried the other direction, ball-based weights on individual points, which did not beat plain LSTSVM. Round 4 introduced the neighbour-agreement membership T7 on all balls, which is our fix. Round 5 tried a smarter ball builder from the literature (ADPGBG), which was no better than keeping the points. Round 6 checked the kernel version and speed; round 7 compared with GBFTSVM. Red tags are dead ends, teal tags are results we keep.");

// =====================================================================================
// 11. Where a membership enters GBLSTSVM (code)
// =====================================================================================
s = content("Method", "Where a membership enters GBLSTSVM");
codeEnd = codeCard(s, 0.6, 1.5, 7.6, 4.3, "GBLSTSVM.py (simplified)", `def solve_gb_planes(A, R_pos, B, R_neg, c1, c2,
                    prox_pos, slack_pos, prox_neg, slack_neg):
    H = np.column_stack((A, np.ones(len(A))))  # +1 centres
    G = np.column_stack((B, np.ones(len(B))))  # -1 centres
    I = 1e-4 * np.identity(H.shape[1])
    G_Q2 = G.T * slack_neg      # s_i of each -1 ball
    lhs1 = G_Q2 @ G + ((H.T * prox_pos) @ H) / c1 + I
    z1 = -np.linalg.solve(lhs1, G_Q2 @ (1 + R_neg))  # [w1; b1]
    H_Q1 = H.T * slack_pos      # s_i of each +1 ball
    lhs2 = H_Q1 @ H + ((G.T * prox_neg) @ G) / c2 + I
    z2 = np.linalg.solve(lhs2, H_Q1 @ (1 + R_pos))   # [w2; b2]
    return z1[:-1], z1[-1], z2[:-1], z2[-1]`);
caption(s, "prox_* and slack_* are per-ball weight vectors: the original code passes the class weights in both; a membership goes into slack_*.", 0.6, codeEnd + 0.12, 7.6, 0.5);
s.addText("Line 1 with memberships", tx({ x: 8.45, y: 1.5, w: 4.25, h: 0.4, fontSize: 18, bold: true, color: C.text2 }));
s.addText(eqLines([
  "(G^TSG + (1/c_1) H^TH + εI) z_1 = −G^TS(e + r^−)",
  "S = diag(s_1, …, s_m)",
], { fontFace: THEME.headFontFace, fontSize: 15, color: C.text1 }), tx({ x: 8.45, y: 1.95, w: 4.25, h: 0.8, paraSpaceAfter: 4 }));
s.addText(bullets([
  "A membership scales only the slack term: a ball with a small s_i may sit on the wrong side of the other class’s line cheaply.",
  "With every s_i = 1 this is exactly the original GBLSTSVM; we checked that its predictions are unchanged.",
  "Training on every point with radius 0 turns the same code into LSTSVM, so all models share one solver.",
], { space: 8, math: true }), tx({ x: 8.45, y: 2.9, w: 4.25, h: 3.1, fontSize: 14 }));
takeaway(s, "One hook, one solver: every variant in this talk differs only in which balls go in and what weight they carry.");
s.addNotes("This is the hook in our version of the code. The two lines come from two linear systems. The vectors slack_neg and slack_pos carry the membership of each ball; they multiply the rows of G or H in the slack term, which is the diagonal matrix S in the equation on the right. If a ball has a small membership, the line is allowed to violate that ball's constraint more cheaply. With all memberships equal to one we recover the original GBLSTSVM, and we verified that predictions match the original code. A useful trick: if every training point is its own ball with radius zero, the same function is plain LSTSVM, so comparisons between balls and points use exactly the same solver.");

// =====================================================================================
// 12. Seven candidate memberships
// =====================================================================================
s = content("Method", "Seven candidate memberships for a ball i");
const cellEq = t => ({ text: eq(t, { fontSize: 13 }), options: {} });
table(s, [
  [th(""), th("Membership s_i of ball i"), th("Idea: the ball is doubtful when …"), th("Where it comes from")],
  [td("T1  Centre distance", { bold: true }), cellEq("1 − d_i / (max_j d_j + δ),  d_i = distance to its class centre"), td("it lies far from its class centre"), td("FSVM " + R("fsvm") + "; on balls: GBFSVM " + R("gbfsvm"))],
  [td("T2  Entropy", { bold: true }), cellEq("1 − H(class shares among the k nearest balls)"), td("its neighbourhood mixes both classes"), td("EFSVM " + R("efsvm"))],
  [td("T3  Pythagorean", { bold: true }), cellEq("membership μ and non-membership ν, μ^2 + ν^2 ≤ 1"), td("it is impure or far from the centre"), td("IFTSVM " + R("iftsvm") + ", " + R("yager") + "; tested as GBFTSVM " + R("gbftsvm"))],
  [td("T4  Overlap", { bold: true }), cellEq("exp(−λ Σ_j o_{ij} / r_i),  o_{ij} = overlap with other-class ball j"), td("it overlaps balls of the other class"), td("Ours (a similar OBRU weight exists in the lab suite " + R("matlab") + ")")],
  [td("T5  Density", { bold: true }), cellEq("(ρ_i / max ρ)^γ,  ρ_i = n_i / r_i"), td("it is sparse: few points in a big ball"), td("Ours")],
  [td("T6  Keep single points", { bold: true }), td("not a weight: keep the balls GBLSTSVM deletes"), td("deletion also removes correct border points"), td("Ours")],
  [td("T7  Neighbour agreement", { bold: true }, ), cellEq("(own-label share among the k nearest balls)^γ"), td("its neighbours carry the other label"), td("Fuzzy kNN " + R("fknn") + ", moved to balls: ours")],
], { x: 0.6, y: 1.45, w: 12.1, colW: [2.25, 4.0, 3.05, 2.8], fontSize: 13, rowH: [0.42, 0.6, 0.55, 0.6, 0.6, 0.55, 0.55, 0.55] });
takeaway(s, "T1–T3 come from the fuzzy SVM literature; T4–T7 are our proposals for balls (T7 adapts fuzzy kNN).");
s.addNotes("These are the seven candidates. T1 to T3 are taken from the literature: centre distance from the original fuzzy SVM (and GBFSVM on balls), entropy from EFSVM, and the Pythagorean fuzzy score that GBFTSVM uses, which we tested by re-implementing GBFTSVM itself. T4 and T5 are our ideas that use what only balls have, a radius: overlap with balls of the other class, and density, points per unit radius. T6 is not a weight but a structural change: keep the single-point balls. T7 measures how many of a ball's nearest balls share its label, weighted by ball size; it is the fuzzy k-nearest-neighbour idea from Keller 1985, applied to balls. All parameters, such as k and gamma, are chosen by cross-validation.");

// =====================================================================================
// 13. Round 1
// =====================================================================================
s = content("Experiments", "Round 1: fuzzy weights on balls change almost nothing");
const r1Cats = ["T1 centre", "T2 entropy", "T4 overlap", "T5 density", "LSTSVM (all points)"];
const r1Keys = [...R1M, "LSTSVM"];
caption(s, "Change in balanced accuracy vs GBLSTSVM, points (21 datasets × 5 splits)", 0.6, 1.45, 8.0);
barChart(s, ["0", "0.1", "0.2"].map((n, i) => [NZL[i] + " noise", r1Keys.map(k => +(R1[n][k] - R1[n].GBLSTSVM).toFixed(2))]), r1Cats, NOISE_RAMP.slice(0, 3), {
  x: 0.6, y: 1.75, w: 8.0, h: 4.3, dataLabelFormatCode: "+0.0;−0.0;0.0", valAxisLabelFormatCode: "+0;−0;0",
  valAxisMinVal: -4, valAxisMaxVal: 8, valAxisMajorUnit: 2, catAxisLabelPos: "low", dataLabelFontSize: 10,
});
s.addText(bullets([
  [B("Gains are at most " + sgn(Math.max(...r1Gain)) + " points; "), "under 20% noise every weight is below GBLSTSVM."],
  [B("Only T2 at 0% noise "), "was significant, and it hurts under noise."],
  [B("LSTSVM, "), `trained on every point with no balls, is ${range(["0", "0.1", "0.2"].map(n => R1[n].LSTSVM - R1[n].GBLSTSVM))} points ahead.`],
], { space: 10 }), tx({ x: 8.9, y: 1.75, w: 3.8, h: 4.2, fontSize: 15 }));
takeaway(s, "The weights are not the bottleneck: something else costs GBLSTSVM 4–7 points against plain LSTSVM.");
s.addNotes("Round 1 result. Each bar is the change in balanced accuracy compared with plain GBLSTSVM, averaged over 21 datasets, at three noise levels from light to dark. The four fuzzy weights move accuracy by less than one point on clean data, and all of them lose under 20% noise. The rightmost group is the surprise: plain LSTSVM, with no balls at all, is 4 to 7 points better. So whatever the balls do, they lose information that no weight can give back. That is what we investigated next.");

// =====================================================================================
// 14. Deletion
// =====================================================================================
s = content("Experiments", "Why: deleting single-point balls is a hidden noise filter");
caption(s, "Share of training points deleted by GBLSTSVM, % (21 datasets × 5 splits, k = 2, 4, 6)", 0.6, 1.45, 6.3);
barChart(s, [
  ["Mislabelled points deleted", ["0.1", "0.2", "0.3"].map(n => +(100 * auc(n, "deleted_flipped")).toFixed(1))],
  ["Correct points deleted", ["0.1", "0.2", "0.3"].map(n => +(100 * auc(n, "deleted_clean")).toFixed(1))],
], ["10% noise", "20% noise", "30% noise"], ["1F78A8", COL.GBLSTSVM], {
  x: 0.6, y: 1.75, w: 6.3, h: 4.3, dataLabelFormatCode: "0", valAxisMinVal: 0, valAxisMaxVal: 100, valAxisMajorUnit: 25, valAxisLabelFormatCode: "0",
});
codeEnd = codeCard(s, 7.2, 1.5, 5.5, 2.15, "gen_ball.py", `gb = GBList(data)
gb.init_granular_balls(purity=0.985, k_clusters=k)
gb.del_ball(num_data=2)    # drop balls with < 2 points`);
s.addText(bullets([
  "A flipped label sits alone among the other class, so k-means isolates it in a one-point ball, and it is deleted.",
  `But correct points near the class border also end up alone: ${Math.round(100 * auc("0.2", "deleted_clean"))}% of them go at 20% noise, and ${Math.round(100 * auc("0.2", "deleted_clean_minority"))}% of the minority class.`,
], { space: 10 }), tx({ x: 7.2, y: codeEnd + 0.35, w: 5.5, h: 2.6, fontSize: 15 }));
takeaway(s, "Deletion removes most mislabelled points, but pays with half the correct ones, mostly at the class border.");
s.addNotes("Why do balls lose so much? We traced which training points survive. GBLSTSVM deletes every ball with fewer than two points, the one line of code shown. A mislabelled point sits among points of the other class, so k-means splits it off into a ball of its own and it gets deleted: 85% of flipped labels disappear at 20% noise, which is why GBLSTSVM looks robust. But the same thing happens to correct points near the border between the classes, and to points of the small class: about half of all correct points are deleted, and two thirds of the minority class. Those border points are exactly the ones that decide where the lines go.");

// =====================================================================================
// 15. Which membership spots flipped labels
// =====================================================================================
s = content("Experiments", "Which membership can tell a flipped label from a correct one?");
const aucItems = [
  ["T2 entropy", auc("0.2", "auc_T2"), 0], ["T5 density", auc("0.2", "auc_T5"), 0], ["T4 overlap", auc("0.2", "auc_T4"), 0],
  ["T1 centre", auc("0.2", "auc_T1"), 0], ["Single-point ball", auc("0.2", "auc_singleton"), 0],
  ["kNN on points", auc("0.2", "auc_point_knn"), 2], ["T7 agreement", auc("0.2", "auc_T7"), 1],
].sort((a, b) => a[1] - b[1]);
caption(s, "ROC-AUC for spotting flipped labels at 20% noise (0.5 = coin toss)", 0.6, 1.45, 7.4);
s.addChart(pres.charts.BAR, [
  { name: "Other memberships", labels: aucItems.map(a => a[0]), values: aucItems.map(a => (a[2] === 0 ? +a[1].toFixed(2) : 0)) },
  { name: "T7 (ours)", labels: aucItems.map(a => a[0]), values: aucItems.map(a => (a[2] === 1 ? +a[1].toFixed(2) : 0)) },
  { name: "Fuzzy kNN on points", labels: aucItems.map(a => a[0]), values: aucItems.map(a => (a[2] === 2 ? +a[1].toFixed(2) : 0)) },
], chartOpts({
  x: 0.6, y: 1.75, w: 7.4, h: 4.3, barDir: "bar", barGrouping: "clustered", barOverlapPct: 100, barGapWidthPct: 45,
  chartColors: ["B4C0C3", COL.KEEPT7, COL.FKNN], showValue: true, dataLabelPosition: "outEnd", dataLabelFormatCode: "0.00;;;",
  valAxisMinVal: 0, valAxisMaxVal: 1, valAxisMajorUnit: 0.25, valAxisLabelFormatCode: "0.00", showLegend: false,
}));
s.addText(bullets([
  [B("ROC-AUC: "), "the chance that a random flipped point gets a lower weight than a random correct one."],
  [B("Entropy and density score below 0.5: "), "they trust flipped points more than correct ones."],
  [B("Neighbour agreement (T7) "), `reaches ${aucRange("auc_T7")} across 10–30% noise, as good as kNN on points.`],
], { space: 10 }), tx({ x: 8.3, y: 1.75, w: 4.4, h: 4.2, fontSize: 15 }));
takeaway(s, "A useful membership must be low for flipped labels; only neighbour agreement does that reliably.");
s.addNotes("If we keep all the balls, we also keep the flipped labels, so we need a weight that is low exactly for them. We tested each membership as a detector of flipped labels, using ROC-AUC: 1 means flipped points always get lower weights than correct ones, 0.5 is a coin toss. Entropy and density are worse than a coin toss: a flipped point surrounded by the other class sits in a pure, dense neighbourhood, so they trust it. Overlap is at chance and centre distance is weak. Neighbour agreement, T7, reaches about 0.87, matching fuzzy kNN on individual points. This is why T7 became the membership of our fix.");

// =====================================================================================
// 16. Round 2
// =====================================================================================
s = content("Experiments", "Round 2: keeping the single-point balls helps more than any weight");
const r2Cats = ["Keep single points (T6)", "Keep + T2 entropy", "Keep + T4 overlap", "No radius term", "LSTSVM (all points)"];
const r2Keys = ["GB-keep", "T6+T2", "T6+T4", "GB-noR", "LSTSVM"];
caption(s, "Change in balanced accuracy vs GBLSTSVM, points (21 datasets × 5 splits)", 0.6, 1.45, 8.0);
barChart(s, ["0", "0.1", "0.2"].map((n, i) => [NZL[i] + " noise", r2Keys.map(k => +(R2[n][k] - R2[n].GBLSTSVM).toFixed(2))]), r2Cats, NOISE_RAMP.slice(0, 3), {
  x: 0.6, y: 1.75, w: 8.0, h: 4.3, dataLabelFormatCode: "+0.0;−0.0;0.0", valAxisLabelFormatCode: "+0;−0;0",
  valAxisMinVal: -4, valAxisMaxVal: 8, valAxisMajorUnit: 2, catAxisLabelPos: "low", dataLabelFontSize: 10,
});
s.addText(bullets([
  [B("Keeping single points: "), `${sgn(R2["0"]["GB-keep"] - R2["0"].GBLSTSVM)} points on clean data.`],
  [B("Fuzzy weights on top "), "add nothing more."],
  [B("The radius term "), "barely matters either: removing it changes little."],
  [B("But the gain fades with noise, "), "because the kept balls include the flipped labels."],
], { space: 10 }), tx({ x: 8.9, y: 1.75, w: 3.8, h: 4.2, fontSize: 15 }));
takeaway(s, "Keep every ball, then down-weight the ones whose neighbours disagree: that is keep + T7.");
s.addNotes("Round 2 tests the deletion directly. Keeping the single-point balls, with nothing else changed, gains almost 4 points on clean data, more than any fuzzy weight. Adding entropy or overlap weights on top adds nothing. As a check, removing the radius term from the model changes little, so the radius is not what makes balls work. The catch is visible at 20% noise: the gain shrinks, because the kept balls now include the mislabelled points. The natural next step is to keep everything and give the suspicious balls a low weight, using the one membership that detects them, T7.");

// =====================================================================================
// 17. T7 in code
// =====================================================================================
s = content("Experiments", "T7: neighbour agreement in a dozen lines of code");
codeEnd = codeCard(s, 0.6, 1.5, 7.0, 4.5, "fuzzy_membership.py (simplified)", `def membership_agreement(centers, radii, labels, counts,
                         param=(10, 1.0), floor=1e-3):
    """T7: share of ball i's own label among its k nearest balls."""
    k_nn, gamma = param
    k_nn = min(int(k_nn), len(radii) - 1)
    dist = pairwise_distances(centers)
    np.fill_diagonal(dist, np.inf)
    nn = np.argpartition(dist, k_nn - 1, axis=1)[:, :k_nn]
    w = counts[nn]                  # bigger balls count more
    same = labels[nn] == labels[:, None]
    agree = np.sum(w * same, axis=1) / (np.sum(w, axis=1) + EPS)
    return np.clip(agree ** gamma, floor, 1.0)`);
caption(s, "Above 5,000 balls the nearest neighbours come from a k-d tree instead of the full distance matrix.", 0.6, codeEnd + 0.12, 7.0, 0.5);
s.addText(eqLines(["s_i = a_i^γ ,    a_i = Σ_{j∈kNN(i)} n_j [y_j = y_i] / Σ_{j∈kNN(i)} n_j"], { fontFace: THEME.headFontFace, fontSize: 16, color: C.text1 }),
  tx({ x: 7.9, y: 1.55, w: 4.8, h: 0.5 }));
s.addText(bullets([
  [B("a_i "), "is the share of the k nearest balls that carry ball i’s label, each counted by its number of points n_j."],
  [B("γ > 1 "), "punishes disagreement harder; a floor of 0.001 keeps every ball in the model."],
  [B("Cost: "), "one nearest-neighbour search over the balls; no extra model to train."],
  [B("With every point as its own ball, "), "T7 is the fuzzy-kNN membership " + R("fknn") + ", our strongest baseline."],
  [B("Tuned by CV: "), "k ∈ {5, 10}, γ ∈ {1, 3}."],
], { space: 8, math: true }), tx({ x: 7.9, y: 2.2, w: 4.8, h: 3.85, fontSize: 14 }));
takeaway(s, "T7 is cheap, needs no extra model, and is the only ball membership that tracks flipped labels.");
s.addNotes("Here is T7 itself. For each ball we find its k nearest balls and compute the share of them, weighted by how many points they hold, that carry the same label. Raising it to a power gamma sharpens the weight, and a small floor keeps every ball in the model. It costs one nearest-neighbour search over the balls. If every point were its own ball, this would be exactly the fuzzy k-nearest-neighbour membership from Keller 1985, which is why fuzzy-kNN LSTSVM is the natural strongest baseline. k and gamma are chosen by cross-validation like everything else.");

// =====================================================================================
// 17b. Why agreement beats entropy
// =====================================================================================
s = content("Experiments", "Why agreement works where entropy fails");
s.addImage({ path: path.join(FIG, "fig5_entropy.png"), x: 0.95, y: 1.45, w: 11.4, h: 11.4 / 2.99, altText: "Two toy panels. Entropy trusts a flipped point inside a pure region and distrusts a correct border point; agreement gives the flipped point weight 0 and the border point 0.6." });
s.addText([B("Entropy (T2) "), { text: "asks whether the neighbourhood is mixed. A flipped point inside a pure region looks safe (weight 1.0); a correct border point looks doubtful (0.1)." }],
  tx({ x: 0.6, y: 5.35, w: 5.9, h: 0.8, fontSize: 14 }));
s.addText([B("Agreement (T7) "), { text: "asks whether the neighbours share my label. The flipped point gets weight 0; the correct border point keeps 0.6." }],
  tx({ x: 6.8, y: 5.35, w: 5.9, h: 0.8, fontSize: 14 }));
takeaway(s, "Entropy measures how mixed a region is, not whether a label fits it; that is why it trusts flipped points.");
s.addNotes("The picture shows why T7 beats entropy. In both panels there is one flipped point, orange inside the blue class, and one correct point at the border. Entropy only asks whether the neighbourhood is mixed: around the flipped point all neighbours are blue, so the neighbourhood is pure and the flipped point gets full trust, while the correct border point sits in a mixed region and gets distrusted. Agreement asks whether my neighbours share my label: none of the flipped point's neighbours do, so it gets zero; three of five of the border point's neighbours do, so it keeps 0.6.");

// =====================================================================================
// 18. Main result
// =====================================================================================
s = content("Results", "Main result: keep + T7 beats GBLSTSVM at every noise level");
caption(s, "Balanced accuracy, % (linear models, 21 datasets × 10 splits)", 0.6, 1.45, 7.2);
lineChart(s, [
  ["GBLSTSVM", NZ.map(n => +linMean(n, "GBLSTSVM").toFixed(2))],
  ["GBFTSVM", NZ.map(n => +linMean(n, "GBFTSVM").toFixed(2))],
  ["Keep + T7 (ours)", NZ.map(n => +linMean(n, "T7-agree").toFixed(2))],
  ["LSTSVM", NZ.map(n => +linMean(n, "LSTSVM").toFixed(2))],
  ["Fuzzy-kNN LSTSVM", NZ.map(n => +linMean(n, "FKNN-LSTSVM").toFixed(2))],
], NZL.map(l => l + " noise"), [COL.GBLSTSVM, COL.GBFTSVM, COL.KEEPT7, COL.LSTSVM, COL.FKNN], {
  x: 0.6, y: 1.75, w: 7.2, h: 4.3, valAxisMinVal: 60, valAxisMaxVal: 85, valAxisMajorUnit: 5, valAxisLabelFormatCode: "0",
});
table(s, [
  [th("Noise"), th("Keep + T7 vs GBLSTSVM"), th("Holm p"), th("Wins")],
  ...NZ.map((n, i) => [td(NZL[i]), td(sgn(gainT7[i]), { bold: true, color: C.accent1 }), td(pf(pT7[i])), td(`${winsT7[i]}/21`)]),
], { x: 8.05, y: 1.5, w: 4.65, colW: [0.85, 1.75, 1.05, 1.0], fontSize: 14, rowH: 0.42, align: "center" });
s.addText(bullets([
  `Plain LSTSVM is ${range(lstsvmMinusT7.slice(0, 3))} points ahead up to 20% noise; at 30% they tie (${sgn(-lstsvmMinusT7[3])}).`,
  `Fuzzy-kNN LSTSVM on every point stays best, by ${range(fknnMinusT7)} points.`,
], { space: 8 }), tx({ x: 8.05, y: 3.85, w: 4.65, h: 2.2, fontSize: 14 }));
takeaway(s, "Keep + T7 closes most of the gap to LSTSVM and closes it fully at 30% noise; balls help only under heavy noise.");
s.addNotes(`The main result with the final protocol, 10 splits. The teal line is our fix, keep + T7; brick is the original GBLSTSVM. Our fix is above GBLSTSVM at every noise level, by ${gainT7.map(f1).join(", ")} points, significant after Holm correction except at 10% noise, and it wins on most datasets.` + " To be honest about the limits: plain LSTSVM on all points, the blue line, is still better up to 20% noise; at 30% noise our fix ties it. And fuzzy-kNN LSTSVM, amber, which gives each point the same kind of agreement weight, is the best model overall. So balls are not a free lunch; their value is under heavy noise and, as we will see, for speed.");

// =====================================================================================
// 19. Critical difference
// =====================================================================================
s = content("Results", "Ranking at 30% noise: keep + T7 joins the top group");
s.addImage({ path: path.join(PAPER, "linear_cd_noise30.png"), x: 1.15, y: 1.5, w: 11.0, h: 11.0 / 3.07, altText: "Critical difference diagram for linear models at 30% label noise. Average ranks: FKNN-LSTSVM 1.71, Keep+T7 3.10, LSTSVM 3.10, ADPGBG 4.52, GB-keep 4.62, GBLSTSVM 5.33, GBFTSVM 5.62. Critical difference 1.97." });
s.addText(bullets([
  "Average rank over 21 datasets, 1 = best. Methods joined by a thick bar are not significantly different (Nemenyi test, α = 0.05) " + R("demsar") + ".",
  "Keep + T7 ties LSTSVM in rank and is significantly ahead of GBLSTSVM and GBFTSVM; only fuzzy-kNN LSTSVM ranks higher.",
], { space: 8 }), tx({ x: 0.6, y: 5.15, w: 12.1, h: 0.95, fontSize: 15 }));
takeaway(s, "Ball models without our fix (GBLSTSVM, GBFTSVM) sit at the bottom of the ranking under heavy noise.");
s.addNotes("The critical-difference diagram is the standard way to compare many classifiers over many datasets. Each method is placed at its average rank, 1 being best; the bar at the top left shows the critical difference, 1.97 ranks: methods closer than that, joined by thick lines, are not significantly different. At 30% noise, keep + T7 and LSTSVM share rank 3.1; GBLSTSVM and GBFTSVM are at the bottom, more than a critical difference away from our fix.");

// =====================================================================================
// 20. Kernel and ADPGBG
// =====================================================================================
s = content("Results", "With a kernel the gain shrinks; a better ball builder adds little");
caption(s, "Balanced accuracy, % (RBF kernel models, 21 datasets × 10 splits)", 0.6, 1.45, 6.6);
const KN = ["0", "0.2", "0.3"];
lineChart(s, [
  ["Kernel GBLSTSVM", KN.map(n => +KER[n].mean["K-GBLSTSVM"].toFixed(2))],
  ["Kernel keep + T7", KN.map(n => +KER[n].mean["K-keep-T7"].toFixed(2))],
  ["Kernel LSTSVM", KN.map(n => +KER[n].mean["K-LSTSVM"].toFixed(2))],
  ["Kernel fuzzy-kNN LSTSVM", KN.map(n => +KER[n].mean["K-FKNN-LSTSVM"].toFixed(2))],
], ["0% noise", "20% noise", "30% noise"], [COL.GBLSTSVM, COL.KEEPT7, COL.LSTSVM, COL.FKNN], {
  x: 0.6, y: 1.75, w: 6.6, h: 4.3, valAxisMinVal: 60, valAxisMaxVal: 85, valAxisMajorUnit: 5, valAxisLabelFormatCode: "0",
});
card(s, 7.5, 1.5, 5.2, 4.55, { name: "adpgbg-card" });
s.addText("ADPGBG balls " + R("adpgbg") + " (round 5)", tx({ x: 7.75, y: 1.62, w: 4.8, h: 0.4, fontSize: 17, bold: true, color: C.text2 }));
s.addText("Grows each ball up to the nearest point of the other class, so border points stay in; ported from the lab MATLAB suite " + R("matlab") + ".",
  tx({ x: 7.75, y: 2.05, w: 4.75, h: 0.95, fontSize: 14 }));
table(s, [
  [th("Linear, BA %"), ...NZL.map(l => th(l))],
  [td("GBLSTSVM"), ...NZ.map(n => td(f1(linMean(n, "GBLSTSVM"))))],
  [td("ADPGBG balls"), ...NZ.map(n => td(f1(linMean(n, "GB-adp"))))],
  [td("Keep single points"), ...NZ.map(n => td(f1(linMean(n, "GB-keep"))))],
  [td("Keep + T7", { bold: true }), ...NZ.map(n => td(f1(linMean(n, "T7-agree")), { bold: true, color: C.accent1 }))],
], { x: 7.75, y: 3.1, w: 4.75, colW: [1.75, 0.75, 0.75, 0.75, 0.75], fontSize: 13, rowH: 0.4, align: "center" });
takeaway(s, `Kernel keep + T7 gains ${sgn(KER["0"].diff_vs_ref["K-keep-T7"])} on clean data and about nothing under noise; ADPGBG ≈ keeping single points.`);
s.addNotes("Two checks. Left, the kernel version: with an RBF kernel, all models are closer together. Keep + T7 gains about 2 points on clean data and nothing significant under noise; kernel fuzzy-kNN LSTSVM is again the best. Right, round 5: ADPGBG is a published ball builder that grows each ball until it reaches the other class, so border points are not lost. It does about as well as simply keeping the single-point balls, and below keep + T7 at 20 and 30% noise. So a better ball builder alone does not replace the agreement weight.");

// =====================================================================================
// 21. Speed
// =====================================================================================
s = content("Results", "Speed: balls train fast, but so does a reduced-kernel LSTSVM");
const T0 = D.timing["0"], T2 = D.timing["0.2"];
const sizeLab = T0.map(r => (r.train >= 1000 ? (r.train / 1000).toString().replace(/\.0$/, "") + "k" : String(r.train)));
caption(s, "Training time, seconds, log scale (NDC data, clean labels, RBF kernel)", 0.6, 1.45, 7.0);
lineChart(s, [
  ["Kernel GBLSTSVM", T0.map(r => +r["K-GBLSTSVM"].time.toFixed(3))],
  ["Kernel keep + T7", T0.map(r => +r["K-keep-T7"].time.toFixed(3))],
  ["Reduced-kernel LSTSVM", T0.map(r => +r["RK-LSTSVM"].time.toFixed(3))],
], sizeLab, [COL.GBLSTSVM, COL.KEEPT7, COL.LSTSVM], {
  x: 0.6, y: 1.75, w: 7.0, h: 4.3, valAxisLogScaleBase: 10, valAxisMinVal: 0.01, valAxisMaxVal: 100, valAxisLabelFormatCode: "General",
  showCatAxisTitle: true, catAxisTitle: "Training points",
});
const pick = [14000, 28000, 70000].map(n => T2.find(r => r.train === n));
s.addText("Under 20% label noise", tx({ x: 7.9, y: 1.5, w: 4.8, h: 0.4, fontSize: 17, bold: true, color: C.text2 }));
table(s, [
  [th("Points"), th("Kernel GBLSTSVM"), th("Reduced-kernel fuzzy-kNN")],
  ...pick.map(r => [td((r.train / 1000) + "k"), td(`${f1(r["K-GBLSTSVM"].time)} s · ${f1(r["K-GBLSTSVM"].ba)}%`), td(`${f1(r["RK-FKNN"].time)} s · ${f1(r["RK-FKNN"].ba)}%`)]),
], { x: 7.9, y: 1.95, w: 4.8, colW: [0.9, 1.85, 2.05], fontSize: 13, rowH: 0.42, align: "center" });
const k105 = T0.find(r => r.train === 10500);
s.addText(bullets([
  `Full kernel LSTSVM needs the whole n × n kernel: ${Math.round(k105["K-LSTSVM"].time)} s at 10.5k points, and about 73 GB of memory at 70k.`,
  `Reduced-kernel LSTSVM ${R("rsvm")} also trains in seconds (${Math.round(T0[T0.length - 1]["RK-LSTSVM"].time)} s vs ${Math.round(T0[T0.length - 1]["K-GBLSTSVM"].time)} s at 70k) and is ${range(T0.map(r => r["RK-LSTSVM"].ba - r["K-GBLSTSVM"].ba))} points more accurate on clean data.`,
], { space: 8 }), tx({ x: 7.9, y: 3.85, w: 4.8, h: 2.2, fontSize: 14 }));
const big = T2.filter(r => r.train >= 28000);
takeaway(s, `Under 20% noise and from 28k points, kernel GBLSTSVM trains ${range(big.map(r => r["RK-FKNN"].time / r["K-GBLSTSVM"].time))}× faster than the best model, within ${f1(Math.max(...big.map(r => r["RK-FKNN"].ba - r["K-GBLSTSVM"].ba)))} points.`);
s.addNotes("The other claim for balls is speed. On a synthetic dataset from 1,750 to 70,000 training points, the kernel ball models train in about a second up to 56k points. Full kernel LSTSVM is not feasible at that size: it needs the full kernel matrix, about 73 GB at 70k points. But the fair comparison is a reduced-kernel LSTSVM, which uses a random subset of columns; it is just as fast and more accurate on clean data. Under 20% label noise the picture changes: pruned kernel GBLSTSVM is within 0.6 points of the best model (reduced-kernel fuzzy kNN) and several times faster from 28k points up. So large and noisy data is where balls are worth it.");

// =====================================================================================
// 22. GBFTSVM model
// =====================================================================================
s = content("Published baseline", "The closest published model: GBFTSVM");
s.addText(bullets([
  [B("GBFTSVM " + R("gbftsvm") + ": "), "a twin SVM (hinge loss, solved as a QP) on granular balls, with a Pythagorean fuzzy score per ball " + R("yager") + "."],
  [B("Without the scores "), "it is GBTWSVM " + R("gbtwsvm") + ", the authors’ earlier model."],
], { space: 8 }), tx({ x: 0.6, y: 1.5, w: 5.3, h: 1.45, fontSize: 15 }));
card(s, 0.6, 3.0, 5.3, 3.05, { name: "pfs-card" });
s.addText(eqLines([
  "μ_i = 1 − ‖c_i − C‖ / (R + ε)      (centre distance = T1)",
  "ν_i^2 = (1 − μ_i^2)(1 − purity_i)",
  "θ_i = √((1 − ν_i^2) / (2 − μ_i^2 − ν_i^2))",
  "s_i = μ_i  if ball i is pure,  else  θ_i",
], { fontFace: THEME.headFontFace, fontSize: 15, color: C.text1 }), tx({ x: 0.82, y: 3.15, w: 4.95, h: 1.7, paraSpaceAfter: 6 }));
s.addText(`On a pure ball the score is just the centre distance, and with k-means balls at least ${Math.floor(purePct)}% of balls are pure.`,
  tx({ x: 0.82, y: 4.95, w: 4.95, h: 1.0, fontSize: 15, bold: true, color: C.accent4 }));
codeCard(s, 6.15, 1.5, 6.55, 3.2, "gbftsvm.py (our implementation)", `def pythagorean_scores(centers, labels, purity, eps=1e-4):
    scores = np.ones(len(labels))
    for cls in np.unique(labels):
        m = labels == cls
        c = centers[m]
        dist = np.linalg.norm(c - c.mean(axis=0), axis=1)
        mu = 1.0 - dist / (dist.max() + eps)      # = T1
        nu2 = (1.0 - mu ** 2) * (1.0 - purity[m])
        theta = np.sqrt((1.0 - nu2) / (2.0 - mu**2 - nu2))
        pure = purity[m] >= 1.0 - 1e-12
        scores[m] = np.where(pure, mu, theta)
    return scores`);
card(s, 6.15, 4.85, 6.55, 1.2, { name: "solver-card" });
s.addText([
  { text: "Solver. ", options: { bold: true } },
  { text: `The paper uses L-BFGS-B, which stopped far from the optimum on some of our data (on ger the lines were 100% off). We solve the same dual exactly with LIBLINEAR’s dual coordinate descent ${R("liblinear", "dcd")}, checked against an independent solver.` },
], tx({ x: 6.35, y: 4.88, w: 6.2, h: 1.14, fontSize: 13, valign: "middle" }));
takeaway(s, "We re-implemented GBFTSVM from its paper and ran it on our 21 datasets with the same fair protocol.");
s.addNotes("GBFTSVM, by Zhao, Ding, Miao and Lang (arXiv 2024), is the published model closest to our question: a twin SVM on granular balls with a fuzzy score for each ball. The score uses a Pythagorean fuzzy set: a membership mu, which is the distance of the ball to its class centre, exactly our T1, and a non-membership nu that grows when the ball is impure. They combine into a score theta. The paper uses mu for pure balls and theta for impure ones. On k-means balls almost every ball is pure, so in practice the score is just T1. We implemented it from the paper. One technical point: the paper's solver, L-BFGS-B, sometimes stopped far from the true optimum on our data, so we solve the identical problem with LIBLINEAR's exact dual solver and verified it against a third solver.");

// =====================================================================================
// 23. GBFTSVM vs ours
// =====================================================================================
s = content("Published baseline", "GBFTSVM is no better than GBLSTSVM; keep + T7 beats both");
caption(s, "Balanced accuracy, % (21 datasets × 10 splits)", 0.6, 1.45, 5.9);
lineChart(s, [
  ["GBLSTSVM", NZ.map(n => +TW[n].mean.GBLSTSVM.toFixed(2))],
  ["GBFTSVM", NZ.map(n => +TW[n].mean.GBFTSVM.toFixed(2))],
  ["Keep + T7 (ours)", NZ.map(n => +TW[n].mean["T7-agree"].toFixed(2))],
], NZL.map(l => l + " noise"), [COL.GBLSTSVM, COL.GBFTSVM, COL.KEEPT7], {
  x: 0.6, y: 1.75, w: 5.9, h: 4.3, valAxisMinVal: 60, valAxisMaxVal: 80, valAxisMajorUnit: 5, valAxisLabelFormatCode: "0",
});
const twRows = [
  ["GBTWSVM (no fuzzy score) " + R("gbtwsvm"), "GBTWSVM"],
  ["GBFTSVM " + R("gbftsvm"), "GBFTSVM"],
  ["GBFTSVM + keep single points", "GBFTSVM-keep"],
  ["GBFTSVM on ADPGBG balls", "GBFTSVM-adp"],
  ["GBLSTSVM " + R("gblstsvm"), "GBLSTSVM"],
  ["Keep + T7 (ours)", "T7-agree"],
];
const twBest = NZ.map(n => Math.max(...twRows.map(r => TW[n].mean[r[1]])));
table(s, [
  [th("Balanced accuracy, %"), ...NZL.map(l => th(l))],
  ...twRows.map(([lab, k]) => [td(lab, { bold: k === "T7-agree" }), ...NZ.map((n, i) => td(f1(TW[n].mean[k]), TW[n].mean[k] === twBest[i] ? { bold: true, color: C.accent1 } : {}))]),
], { x: 6.8, y: 1.5, w: 5.9, colW: [2.9, 0.75, 0.75, 0.75, 0.75], fontSize: 13, rowH: 0.42, align: "center" });
s.addText(bullets([
  `The fuzzy score adds nothing: GBFTSVM and GBTWSVM differ by ${range(twVsFt.map(Math.abs))} points, never significantly.`,
  `Keeping single points lifts GBFTSVM by ${range(keepFt.filter(v => v > 0))} points: the deletion finding carries over.`,
], { space: 6 }), tx({ x: 6.8, y: 4.6, w: 5.9, h: 1.45, fontSize: 14 }));
takeaway(s, `Keep + T7 beats GBFTSVM by ${range(t7VsFt)} points at every noise level (Holm p ≤ ${Math.max(...t7VsFtP).toFixed(3)}).`);
s.addNotes("The comparison a reviewer will ask for first. Under our fair protocol, GBFTSVM, violet, is at or slightly below GBLSTSVM, brick. Its fuzzy score does nothing measurable: with and without it (GBTWSVM) the results differ by about a point or less and never significantly, which fits the fact that on pure balls the score is just centre distance. Two ablations confirm our story: keeping single points lifts GBFTSVM by up to 4.5 points, so deletion is the weak spot of this model too; and ADPGBG balls help it a little. Our fix, keep + T7, is the best ball model in every column and beats GBFTSVM by 3.7 to 5.6 points, significant at every noise level after Holm correction.");

// =====================================================================================
// 24. Protocol matters
// =====================================================================================
s = content("Published baseline", "Protocol matters: tuning on the test set adds 9–15 points");
caption(s, "Points gained by tuning on the test set instead of by CV", 0.6, 1.45, 5.7);
barChart(s, [
  ["GBLSTSVM", tuneGain("GBLSTSVM").map(v => +v.toFixed(2))],
  ["GBFTSVM", tuneGain("GBFTSVM").map(v => +v.toFixed(2))],
], NZL.map(l => l + " noise"), [COL.GBLSTSVM, COL.GBFTSVM], {
  x: 0.6, y: 1.75, w: 5.7, h: 4.3, dataLabelFormatCode: "+0.0", valAxisMinVal: 0, valAxisMaxVal: 18, valAxisMajorUnit: 3, valAxisLabelFormatCode: "0",
});
s.addText("Accuracy on clean data, % (6 datasets in both studies)", tx({ x: 6.6, y: 1.5, w: 6.1, h: 0.35, fontSize: 14, bold: true, color: C.text2 }));
table(s, [
  [th("Dataset"), th("GBFTSVM paper"), th("Ours, tuned on test"), th("Ours, fair CV")],
  ...Object.entries(PVO).map(([ds, r]) => [td(ds), td(f1(r.paper_GBFTSVM)), td(f1(r.ours_test_tuned_acc)), td(f1(r.ours_cv_acc))]),
  [td("Mean", { bold: true }), td(f1(pvoMean("paper_GBFTSVM")), { bold: true }), td(f1(pvoMean("ours_test_tuned_acc")), { bold: true }), td(f1(pvoMean("ours_cv_acc")), { bold: true })],
], { x: 6.6, y: 1.9, w: 6.1, colW: [1.45, 1.45, 1.7, 1.5], fontSize: 13, rowH: 0.38, align: "center" });
s.addText("Part of the remaining gap may come from the paper’s larger training folds (10-fold CV) and its own ball builder.",
  tx({ x: 6.6, y: 5.1, w: 6.1, h: 0.9, fontSize: 13, italic: true, color: C.accent6 }));
takeaway(s, "Published gains of fuzzy granular-ball models can be artefacts of tuning on the test set; fair CV is essential.");
s.addNotes("Left: for every run we also recorded what tuning on the test set would have reported. With no change to the models, balanced accuracy rises by 9 to 15 points, more under heavy noise, for GBLSTSVM and GBFTSVM alike. Right: on the six datasets both studies use, the GBFTSVM paper reports 92.5% accuracy on average; even with test-set tuning our runs reach about 81%, and 74% with fair tuning. Some of the gap may come from their larger training sets and a different ball builder, but test-set tuning alone is worth about 10 points. This becomes one of the paper's points: how granular-ball models are evaluated changes the conclusions.");

// =====================================================================================
// 25. Findings
// =====================================================================================
s = content("Conclusion", "What we found");
const findings = [
  ["Q1", `Fuzzy weights on balls do not help: T1, T2, T4, T5 and GBFTSVM’s Pythagorean score gain at most ${f1(Math.max(...r1Gain))} points and lose up to ${f1(-Math.min(...r1Gain))} under noise.`],
  ["Q2", `GBLSTSVM’s weak spot is deletion: dropping single-point balls removes ${Math.round(100 * auc("0.2", "deleted_flipped"))}% of flipped labels but also ${Math.round(100 * auc("0.2", "deleted_clean"))}% of correct points (20% noise).`],
  ["Q2", `Entropy and density memberships flag flipped labels worse than chance (ROC-AUC ${range([...["0.1", "0.2", "0.3"].map(n => auc(n, "auc_T2")), ...["0.1", "0.2", "0.3"].map(n => auc(n, "auc_T5"))], 2)}); neighbour agreement T7 reaches ${aucRange("auc_T7")}.`],
  ["Q3", `Keep + T7 beats GBLSTSVM by ${range(gainT7)} points and ties LSTSVM at 30% noise; fuzzy-kNN LSTSVM on all points is still the best model.`],
  ["Q4", `Keep + T7 beats the published GBFTSVM by ${range(t7VsFt)} points; tuning on the test set inflates scores by ${Math.floor(Math.min(...allTuneGain))}–${Math.round(Math.max(...allTuneGain))} points.`],
];
findings.forEach(([q, t], i) => {
  const y = 1.5 + i * 0.93;
  badge(s, 0.6, y + 0.1, String(i + 1), C.text2, 0.55, 16);
  s.addText(t, tx({ x: 1.35, y, w: 10.1, h: 0.8, fontSize: 16, valign: "middle" }));
  card(s, 11.7, y + 0.18, 1.0, 0.42, { fill: C.accent1, r: 0.2, name: "q-tag" });
  s.addText(q, tx({ x: 11.7, y: y + 0.18, w: 1.0, h: 0.42, fontSize: 13, bold: true, color: C.background1, align: "center", valign: "middle" }));
});
takeaway(s, "Answer to the research question: the membership matters less than which balls exist; T7 on all balls is the fix.");
s.addNotes("The findings, each tagged with the question it answers. Q1: the fuzzy weights we tried, including the published Pythagorean one, do not help on balls. Q2: the real limit is the deletion step, which works as a crude noise filter that also throws away half the correct points; and the popular entropy and density memberships cannot spot flipped labels at all. Q3: keeping every ball and weighting it by neighbour agreement gives a consistent gain over GBLSTSVM and ties LSTSVM at heavy noise, but does not beat fuzzy kNN on points. Q4: it also beats GBFTSVM clearly, and we showed that tuning on the test set, common in this literature, inflates scores by about 10 points.");

// =====================================================================================
// 26. Contribution and paper plan
// =====================================================================================
s = content("Conclusion", "Contribution and paper plan");
card(s, 0.6, 1.5, 6.25, 4.55, { name: "contrib-card" });
s.addText("Working title", tx({ x: 0.85, y: 1.62, w: 5.8, h: 0.35, fontSize: 14, bold: true, color: C.accent6 }));
s.addText("“Where do granular balls help least squares twin SVMs? A controlled study of ball deletion, fuzzy memberships and kernel speed”",
  tx({ x: 0.85, y: 1.98, w: 5.8, h: 0.95, fontSize: 16, italic: true, color: C.text2, fontFace: THEME.headFontFace }));
s.addText(bullets([
  "A leak-free benchmark of granular-ball twin SVMs under 0–30% label noise.",
  "Ball deletion shown to be a hidden noise filter, with its cost measured.",
  "Memberships tested as noise detectors: why entropy and density fail.",
  "A simple fix, keep + T7, that works for GBLSTSVM and GBFTSVM.",
  "A fair re-evaluation of GBFTSVM with an exact solver.",
], { space: 8 }), tx({ x: 0.85, y: 3.05, w: 5.8, h: 2.9, fontSize: 15 }));
card(s, 7.1, 1.5, 5.6, 4.55, { name: "outline-card" });
s.addText("Paper outline (analysis paper)", tx({ x: 7.35, y: 1.62, w: 5.1, h: 0.35, fontSize: 14, bold: true, color: C.accent6 }));
const secs = ["Introduction", "Background: LSTSVM, granular balls, fuzzy SVMs", "Protocol: data, noise, CV, statistics", "Where the accuracy goes: deletion", "Memberships as noise detectors", "The fix: keep + T7, linear and kernel", "Ball builders: k-means vs ADPGBG", "Scalability", "Published baseline and protocol", "Discussion and conclusion"];
s.addText(secs.map((t, i) => ({ text: `${i + 1}.  ${t}`, options: { breakLine: i < secs.length - 1, paraSpaceAfter: 4 } })), tx({ x: 7.35, y: 2.0, w: 5.1, h: 3.35, fontSize: 15 }));
[["Experiments", C.accent1], ["Tables, figures", C.accent1], ["Writing: next", C.accent6]].forEach(([t, col], i) => {
  card(s, 7.35 + i * 1.72, 5.45, 1.6, 0.42, { fill: col, r: 0.2, name: "status-chip" });
  s.addText(t, tx({ x: 7.35 + i * 1.72, y: 5.45, w: 1.6, h: 0.42, fontSize: 12, bold: true, color: C.background1, align: "center", valign: "middle" }));
});
takeaway(s, "Framing chosen: an analysis paper with keep + T7 as the proposed fix; all tables and statistics are ready.");
s.addNotes("Rather than claiming a new membership that wins everywhere, which our data does not support, the paper is framed as an analysis: where granular balls actually help twin SVMs, and why. The five contributions are on the left. The outline on the right follows the order of this talk. Experiments, tables with significance tests and critical-difference diagrams are done; writing is the next step. The target journal is something to decide with you.");

// =====================================================================================
// 27. Next steps
// =====================================================================================
s = content("Conclusion", "Next steps (proposed)");
const next = [
  ["Write the draft", "Sections 1–6 first, from the existing tables and figures."],
  ["Close literature gaps", "Read the ADPGBG paper in full to confirm our port; add GBTSVM " + R("gbtsvm") + " as another baseline."],
  ["Harder noise", "Label noise that targets the class border, where neighbour agreement is weakest."],
  ["Bigger and multi-class data", "Test keep + T7 and the speed niche beyond binary benchmarks."],
  ["Choose venue, release code", "Pick the journal together; code and results are already on GitHub."],
];
s.addShape(pres.shapes.LINE, { x: 1.0, y: 2.15, w: 11.3, h: 0, line: { color: GRID, width: 3 }, objectName: "timeline" });
next.forEach(([t, d], i) => {
  const x = 0.6 + i * 2.45;
  badge(s, x + 0.82, 1.85, String(i + 1), i === 0 ? C.accent1 : C.text2, 0.6, 16);
  card(s, x, 2.75, 2.25, 3.25, { name: "next-card" });
  s.addText(t, tx({ x: x + 0.18, y: 2.9, w: 1.9, h: 0.85, fontSize: 17, bold: true, color: C.text2 }));
  s.addText(d, tx({ x: x + 0.18, y: 3.8, w: 1.9, h: 2.1, fontSize: 15 }));
});
s.addText("Now", tx({ x: 0.6, y: 1.5, w: 1.0, h: 0.3, fontSize: 12, bold: true, color: C.accent6 }));
s.addText("Before the endsem", tx({ x: 10.2, y: 1.5, w: 2.5, h: 0.3, fontSize: 12, bold: true, color: C.accent6, align: "right" }));
takeaway(s, "The experiments are done; the next phase is writing, plus two robustness checks a reviewer is likely to ask for.");
s.addNotes("Proposed next steps, in order. First, write the draft from the existing material. Second, close two literature gaps: read the ADPGBG paper in full to confirm our port matches it, and add GBTSVM from Tanveer's group as another baseline. Third and fourth are robustness checks: our label noise is random; real annotation errors cluster near the class border, where neighbour agreement is weakest, so we should test that, and we should test larger and multi-class data. Finally, choose the venue with you. All code and results are already in the GitHub repository.");

// =====================================================================================
// 28-29. References
// =====================================================================================
const half = Math.ceil(REFS.length / 2);
[REFS.slice(0, half), REFS.slice(half)].forEach((part, pi) => {
  s = content("References", `References (${pi + 1} of 2)`);
  s.addText(part.map(([k, t], i) => ({
    text: `[${REF_NO[k]}]  ${t}`,
    options: { breakLine: i < part.length - 1, paraSpaceAfter: 6, indentLevel: 0 },
  })), tx({ x: 0.6, y: 1.5, w: 12.1, h: 5.35, fontSize: 13 }));
  s.addNotes(pi === 0
    ? `References for the models, the ball generators and the fuzzy membership functions. The fuzzy functions come from ${R("fsvm")} FSVM (centre distance), ${R("efsvm")} EFSVM (entropy), ${R("iftsvm")} IFTSVM and ${R("yager")} Yager (intuitionistic and Pythagorean), ${R("fknn")} fuzzy kNN (neighbour agreement), and ${R("gbfsvm")} GBFSVM and ${R("gbftsvm")} GBFTSVM on granular balls.`
    : `References for label noise, statistics, solvers and data. ${R("demsar")} and ${R("holm")} are the statistical tests; ${R("rsvm")} is the reduced kernel used in the speed study; ${R("liblinear")} and ${R("dcd")} are the exact dual solver used for GBFTSVM; ${R("uci")} and ${R("keel")} are the data sources; ${R("matlab")} is the lab's MATLAB suite we compared with.`);
});

// =====================================================================================
// 30. Thank you
// =====================================================================================
s = newSlide("TITLE", "References");
s.addText("Thank you. Questions?", { placeholder: "title" });
s.addText([
  { text: "Code, results and tables: github.com/Jayagna/GBLSTSVM", options: { breakLine: true } },
  { text: "Appendix: datasets, dead ends and tuning grids", options: { fontSize: 15, paraSpaceBefore: 14 } },
], { placeholder: "body" });
motif(s);
s.addNotes("Close and take questions. Likely questions: why not just use LSTSVM (answer: under heavy noise and at scale balls are competitive, and the analysis explains when); is T7 new (it adapts fuzzy kNN to balls; the contribution is the analysis and the fix, not the formula); why balanced accuracy (imbalanced datasets); and how GBFTSVM was implemented (from the paper, with an exact solver). The appendix has the datasets, the dead ends and the tuning grids.");

// =====================================================================================
// 31. Appendix: datasets
// =====================================================================================
s = content("Appendix", "Appendix A: the 21 datasets");
const dsRow = d => [td(d.name.replace("bupa or liver-disorders", "bupa (liver)")), td(String(d.n)), td(String(d.d)), td(f1(d.ir))];
const dsHead = [th("Dataset"), th("Points"), th("Features"), th("Imbalance")];
const half1 = Math.ceil(DS.length / 2);
table(s, [dsHead, ...DS.slice(0, half1).map(dsRow)], { x: 0.6, y: 1.5, w: 5.9, colW: [2.6, 1.0, 1.1, 1.2], fontSize: 13, rowH: 0.37, align: "center" });
table(s, [dsHead, ...DS.slice(half1).map(dsRow)], { x: 6.8, y: 1.5, w: 5.9, colW: [2.6, 1.0, 1.1, 1.2], fontSize: 13, rowH: 0.37, align: "center" });
s.addText(`Imbalance = majority / minority class size. Sources: UCI ${R("uci")} and KEEL ${R("keel")}, as used in the LSTSVM benchmark collection shipped with the GBLSTSVM code.`,
  tx({ x: 0.6, y: 6.15, w: 12.1, h: 0.6, fontSize: 13, color: C.accent6 }));
s.addNotes("The 21 binary datasets, from 194 to 1,484 points and 3 to 60 features, ordered from balanced to strongly imbalanced. They are the LSTSVM benchmark files that came with the GBLSTSVM code.");

// =====================================================================================
// 32. Appendix: dead ends
// =====================================================================================
s = content("Appendix", "Appendix B: dead ends and what they taught us");
table(s, [
  [th("Idea"), th("What happened"), th("Lesson")],
  [td("Ball purity as membership"), td("Purity is about 1 for almost every k-means ball"), td("It carries no information")],
  [td("T1, T4, T5 on GBLSTSVM’s balls"), td("At most +0.5 points; down to −2.4 at 20% noise"), td("A weight cannot undo deletion")],
  [td("Ball-based weights on every point (round 3)"), td("0.2–0.9 points below LSTSVM, never significant"), td("Point models need point-level weights")],
  [td("ADPGBG balls (round 5)"), td("About equal to keeping single points"), td("A better builder alone is not enough")],
  [td("Kernel keep + T7 under noise"), td("No significant gain over kernel GBLSTSVM at 20–30% noise"), td("The gain is mostly a linear-model effect")],
  [td("Ball-based weights for speed"), td("Building balls 0.3–0.9 s vs point kNN 0.1–0.7 s"), td("No speed gain for weights")],
  [td("L-BFGS-B for GBFTSVM’s dual"), td("Stopped far from the optimum on some data"), td("Use an exact dual solver")],
], { x: 0.6, y: 1.5, w: 12.1, colW: [3.6, 4.6, 3.9], fontSize: 13, rowH: 0.52 });
s.addNotes("Everything that did not work, kept for completeness. Each dead end changed the direction: purity was useless as a weight because k-means balls are pure; weights on pruned balls could not undo deletion; ball-based weights on points did not beat LSTSVM; a better ball builder was not enough by itself; the kernel version gains little; and ball-based weights were no faster than kNN on points.");

// =====================================================================================
// 33. Appendix: tuning grids
// =====================================================================================
s = content("Appendix", "Appendix C: settings chosen by 5-fold cross-validation");
table(s, [
  [th("Model"), th("Settings searched (all by CV on the training part)")],
  [td("GBLSTSVM and every variant, LSTSVM"), td("c1, c2 ∈ {0.001, 0.01, …, 1000} (7 × 7); class weighting on/off; k ∈ {2, …, 6} k-means splits")],
  [td("T2 entropy · T4 overlap · T5 density"), td("k ∈ {5, 10} · λ ∈ {0.5, 1, 2, 4} · γ ∈ {0.25, 0.5, 1}")],
  [td("T7 agreement, fuzzy-kNN LSTSVM"), td("k ∈ {5, 10} nearest balls or points; γ ∈ {1, 3}")],
  [td("GBTWSVM, GBFTSVM"), { text: eq("C_1 = C_3, C_2 = C_4 ∈ {2^{−5}, …, 2^5}, the paper’s grid; same k and class weighting as GBLSTSVM", { fontSize: 14 }), options: {} }],
  [td("Kernel models"), td("RBF width γ = g / d, g ∈ {0.25, 1, 4}; same c grid")],
  [td("Selection score"), td("Mean balanced accuracy over the 5 folds; the test set is used once, after selection")],
], { x: 0.6, y: 1.5, w: 12.1, colW: [3.9, 8.2], fontSize: 14, rowH: 0.6 });
s.addNotes("For reference, the full search grids. Every model gets the same budget for c1, c2 and k, and the membership parameters are chosen in the same cross-validation, so no model gets an unfair tuning advantage.");

// ---------------------------------------------------------------- write
(async () => {
  await pres.writeFile({ fileName: OUT });
  await applyTheme(OUT, THEME);
  const removed = await dropInnerParagraphProps(OUT);
  console.log("wrote", OUT, `(${removed} inner paragraph properties removed)`);
})();
