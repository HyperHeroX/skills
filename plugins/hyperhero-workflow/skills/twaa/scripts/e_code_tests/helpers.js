/**
 * helpers.js — 共用工具函式
 *
 * 提供所有 E 碼測試模組共用的輔助工具：
 * - result() 標準化結果格式
 * - safeEval() 安全的 page.evaluate 包裝
 * - wcagContrast() WCAG 2.1 對比值計算
 * - parseRgb() RGB 字串解析
 */

/**
 * 建立標準化測試結果物件
 * @param {string} code - E 碼
 * @param {string} rule - 規則說明
 * @param {'pass'|'fail'|'manual_required'|'skip'} status - 結果狀態
 * @param {string} [message] - 詳細訊息
 * @param {string} [fix] - 修正建議
 * @param {Array} [details] - 詳細資訊陣列
 */
export function result(code, rule, status, message = '', fix = '', details = []) {
  return { code, rule, status, message, fix_suggestion: fix, details };
}

/**
 * 安全執行 page.evaluate，失敗時回傳 fallback
 * @param {import('playwright').Page} page
 * @param {Function} fn - 在瀏覽器中執行的函式
 * @param {*} fallback - 失敗時的預設值
 */
export async function safeEval(page, fn, fallback) {
  try {
    return await page.evaluate(fn);
  } catch {
    return fallback;
  }
}

/**
 * 解析 rgb(r, g, b) 或 rgba(r, g, b, a) 字串為物件
 * @param {string} color - CSS color 字串
 * @returns {{ r: number, g: number, b: number, a: number }|null}
 */
export function parseRgb(color) {
  if (!color) return null;
  const m = color.match(/rgba?\((\d+),\s*(\d+),\s*(\d+)(?:,\s*([\d.]+))?\)/);
  if (!m) return null;
  return {
    r: parseInt(m[1]),
    g: parseInt(m[2]),
    b: parseInt(m[3]),
    a: m[4] !== undefined ? parseFloat(m[4]) : 1,
  };
}

/**
 * 計算單一顏色的相對亮度（WCAG 2.1 公式）
 * @param {{ r: number, g: number, b: number }} rgb
 * @returns {number} 相對亮度 0~1
 */
export function luminance({ r, g, b }) {
  const linearize = (c) => {
    const s = c / 255;
    return s <= 0.04045 ? s / 12.92 : Math.pow((s + 0.055) / 1.055, 2.4);
  };
  return 0.2126 * linearize(r) + 0.7152 * linearize(g) + 0.0722 * linearize(b);
}

/**
 * 計算兩個顏色的對比值（WCAG 2.1 公式）
 * @param {{ r: number, g: number, b: number }} c1
 * @param {{ r: number, g: number, b: number }} c2
 * @returns {number} 對比值（1~21）
 */
export function wcagContrast(c1, c2) {
  const l1 = luminance(c1);
  const l2 = luminance(c2);
  const lighter = Math.max(l1, l2);
  const darker = Math.min(l1, l2);
  return (lighter + 0.05) / (darker + 0.05);
}

/**
 * 混合 RGBA 顏色到白色背景，回傳不透明 RGB
 * @param {{ r: number, g: number, b: number, a: number }} rgba
 * @returns {{ r: number, g: number, b: number }}
 */
export function blendOnWhite({ r, g, b, a }) {
  return {
    r: Math.round(r * a + 255 * (1 - a)),
    g: Math.round(g * a + 255 * (1 - a)),
    b: Math.round(b * a + 255 * (1 - a)),
  };
}
