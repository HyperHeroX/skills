/**
 * 把 svgkit 產出的配圖放進 PPTX 的參考實作（pptxgenjs，LAYOUT_WIDE 13.333×7.5 in）。
 *
 * 用法：
 *   NODE_PATH=$(npm root -g) node embed_pptx.js slides.json out_raw.pptx
 *   python3 fix_png_fallback.py out_raw.pptx out.pptx        # 必做：修 PNG 備援
 *
 * slides.json：
 *   [{ "title": "金鑰管理生命週期",
 *      "lead": "密碼系統的安全關鍵在**金鑰**。",
 *      "bullets": ["**產生**：確保隨機與足夠金鑰空間", "**儲存**：硬體保護或分割"],
 *      "diagram": "diagrams/deck-03.svg",          // 可省略；同名 .json 內有 layout 與 caption
 *      "notes": "講者備註" }]
 *
 * 版位規則（與 svgkit 畫布對應，1 in = 144 px，圖片以 px/144 原尺寸放入、不縮放）：
 *   layout=side → 條列在左（寬 = 12.13 − 圖寬 − 0.35），圖在右，靠上對齊內容區
 *   layout=full 或沒有條列 → 圖置中全寬，條列在圖下方分兩欄
 *   caption → 圖下方一行「看圖重點」
 * 重點標示：文字中的 **詞** → 粗體＋黃色螢光底（FFE58A）。
 */
const pptxgen = require("pptxgenjs");
const fs = require("fs");
const path = require("path");

const [, , specPath, outPath] = process.argv;
const spec = JSON.parse(fs.readFileSync(specPath, "utf8"));
const PX = 144, L = 0.6, FULLW = 12.13, TOP = 1.95, BOTTOM = 6.85;
const INK = "12202E", BODY = "2A3747", NAVY = "1B2B3F", HL = "FFE58A", FONT = "Microsoft JhengHei";

// **詞** → runs
function runs(text, base = {}) {
  return String(text).split("**").map((t, i) => ({
    text: t, options: Object.assign({}, base, i % 2 ? { bold: true, highlight: HL, color: INK } : {}),
  })).filter(r => r.text);
}
function svgSize(p) {
  const s = fs.readFileSync(p, "utf8");
  return { w: +s.match(/<svg[^>]*width="([\d.]+)"/)[1] / PX, h: +s.match(/<svg[^>]*height="([\d.]+)"/)[1] / PX };
}
function bulletsBox(slide, items, x, y, w, h, pt = 16) {
  const paras = [];
  items.forEach((b, i) => runs(b, { fontSize: pt, color: BODY }).forEach((r, j, arr) => {
    // 段落屬性（bullet、paraSpaceAfter）只能放在段落第一個 run：pptxgenjs 會為每個 run 各寫一個 <a:pPr>，
    // 後面的 run 帶了段落屬性就會產生多個 pPr，含重點標示（多 run）的段落因此掉項目符號。
    if (j === 0) Object.assign(r.options, { bullet: true, paraSpaceAfter: 8 });
    if (j === arr.length - 1 && i < items.length - 1) r.options.breakLine = true;
    paras.push(r);
  }));
  slide.addText(paras, { x, y, w, h, valign: "top", margin: 0, isTextBox: true, fontFace: FONT, fit: "shrink" });
}

const pres = new pptxgen();
pres.layout = "LAYOUT_WIDE";
pres.theme = { headFontFace: FONT, bodyFontFace: FONT };

for (const s of spec) {
  const sl = pres.addSlide();
  sl.addText(s.title, { x: L, y: 0.55, w: FULLW, h: 0.75, fontSize: 30, bold: true, color: NAVY, isTextBox: true, margin: 0 });
  if (s.lead) sl.addText(runs(s.lead, { fontSize: 16, color: BODY }), { x: L, y: 1.38, w: FULLW, h: 0.5, isTextBox: true, margin: 0, valign: "top" });
  const bullets = s.bullets || [];
  if (s.diagram) {
    const meta = fs.existsSync(s.diagram.replace(/\.svg$/, ".json")) ? JSON.parse(fs.readFileSync(s.diagram.replace(/\.svg$/, ".json"), "utf8")) : {};
    const { w, h } = svgSize(s.diagram);
    const data = "image/svg+xml;base64," + fs.readFileSync(s.diagram).toString("base64");
    const alt = (fs.readFileSync(s.diagram, "utf8").match(/<title>([^<]*)<\/title>/) || [, ""])[1];
    let capY;
    if (meta.layout === "full" || !bullets.length) {
      sl.addImage({ data, x: L + (FULLW - w) / 2, y: TOP, w, h, altText: alt });
      capY = TOP + h + 0.08;
      if (bullets.length) {
        const half = Math.ceil(bullets.length / 2), by = capY + (meta.caption ? 0.45 : 0.1);
        bulletsBox(sl, bullets.slice(0, half), L, by, FULLW / 2 - 0.2, BOTTOM - by, 14);
        bulletsBox(sl, bullets.slice(half), L + FULLW / 2 + 0.2, by, FULLW / 2 - 0.2, BOTTOM - by, 14);
      }
    } else {
      const bw = FULLW - w - 0.35;
      bulletsBox(sl, bullets, L, TOP, bw, BOTTOM - TOP);
      sl.addImage({ data, x: L + bw + 0.35, y: TOP, w, h, altText: alt });
      capY = TOP + h + 0.08;
    }
    if (meta.caption) sl.addText([{ text: "看圖重點　", options: { bold: true, color: "D2581F" } }, { text: meta.caption, options: { color: BODY } }],
      { x: L, y: Math.min(capY, 6.88), w: FULLW, h: 0.35, fontSize: 12, isTextBox: true, margin: 0 });
  } else {
    bulletsBox(sl, bullets, L, TOP, FULLW, BOTTOM - TOP);
  }
  if (s.notes) sl.addNotes(s.notes);
}
pres.writeFile({ fileName: outPath }).then(() => console.log("written", spec.length, "slides →", outPath));
