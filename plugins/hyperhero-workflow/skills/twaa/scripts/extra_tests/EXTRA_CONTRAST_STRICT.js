/**
 * EXTRA_CONTRAST_STRICT — 嚴格 4.5:1 對比檢測（GN2140300E）
 *
 * 背景：稽核員 (2026-05-13) 在 https://dsos.wda.gov.tw/zh-tw/sitemap 抓出
 * 「導覽項目-首頁與公開資訊…等 #34A2BB 與背景色 #FFFFFF，對比度為 3:1」。
 *
 * axe-core 的 color-contrast 規則會偵測，但會跳過某些案例（如：背景色由父層繼承
 * 的層疊、子像素計算、view 端透明度等）。本工具強化採樣：
 *
 *  1. 遍歷所有「可見且有可讀文字內容」的元素
 *  2. 解析其 effective color + 真正的 effective background（透明度層層回推）
 *  3. 計算對比，按 WCAG 公式
 *  4. 區分大字 (≥18.66px regular or ≥14px bold) 標準 3:1，其他 4.5:1
 *  5. 排除：disabled、aria-hidden、純裝飾、僅含 whitespace
 *
 * 失敗時列出元素的 selector + 文字內容 + 兩色 + 實際比值，便於人工修正。
 */

const NAME = 'EXTRA_CONTRAST_STRICT';
const RULE = '所有可見文字對比 ≥ 4.5:1 (大字 ≥ 3:1)';

function pass(message = '', details = []) {
  return { code: NAME, rule: RULE, status: 'pass', message, fix_suggestion: '', details };
}
function fail(message, fix = '', details = []) {
  return { code: NAME, rule: RULE, status: 'fail', message, fix_suggestion: fix, details: Array.isArray(details) ? details : [details] };
}

/**
 * @param {import('playwright').Page} page
 */
export async function check(page) {
  try {
    const result = await page.evaluate(() => {
      // --- 工具函式（在瀏覽器內執行）---
      function parseColor(c) {
        if (!c || c === 'transparent') return null;
        const m = c.match(/rgba?\(([^)]+)\)/);
        if (!m) return null;
        const parts = m[1].split(',').map((s) => parseFloat(s.trim()));
        return { r: parts[0], g: parts[1], b: parts[2], a: parts.length > 3 ? parts[3] : 1 };
      }
      function srgbToLinear(v) {
        const x = v / 255;
        return x <= 0.03928 ? x / 12.92 : Math.pow((x + 0.055) / 1.055, 2.4);
      }
      function relativeLuminance(rgb) {
        const R = srgbToLinear(rgb.r);
        const G = srgbToLinear(rgb.g);
        const B = srgbToLinear(rgb.b);
        return 0.2126 * R + 0.7152 * G + 0.0722 * B;
      }
      function contrast(a, b) {
        const L1 = relativeLuminance(a);
        const L2 = relativeLuminance(b);
        return (Math.max(L1, L2) + 0.05) / (Math.min(L1, L2) + 0.05);
      }
      // 計算實際背景色 — 收集 alpha bg stack 後從最深層往外合成
      function effectiveBg(el) {
        const stack = [];
        let cur = el;
        while (cur && cur !== document.documentElement) {
          const cs = window.getComputedStyle(cur);
          const bg = parseColor(cs.backgroundColor);
          if (bg && bg.a > 0) {
            stack.push(bg);
            if (bg.a >= 0.999) break; // 完全不透明，停止
          }
          cur = cur.parentElement;
        }
        // 從最深層 opaque 往外做 alpha compositing
        let result = { r: 255, g: 255, b: 255, a: 1 };
        for (let i = stack.length - 1; i >= 0; i--) {
          const top = stack[i];
          const a = top.a;
          result = {
            r: top.r * a + result.r * (1 - a),
            g: top.g * a + result.g * (1 - a),
            b: top.b * a + result.b * (1 - a),
            a: 1,
          };
        }
        return result;
      }
      function colorToHex(rgb) {
        const toHex = (n) => Math.round(n).toString(16).padStart(2, '0');
        return '#' + toHex(rgb.r) + toHex(rgb.g) + toHex(rgb.b);
      }
      function selectorOf(el) {
        if (el.id) return `#${el.id}`;
        const cls = (el.className || '').toString().trim().split(/\s+/).slice(0, 2).join('.');
        return `${el.tagName.toLowerCase()}${cls ? '.' + cls : ''}`;
      }

      // --- 收集所有可見有文字的元素 ---
      const candidates = [];
      const walker = document.createTreeWalker(
        document.body,
        NodeFilter.SHOW_ELEMENT,
        {
          acceptNode(el) {
            if (el.tagName === 'SCRIPT' || el.tagName === 'STYLE' || el.tagName === 'NOSCRIPT') return NodeFilter.FILTER_REJECT;
            if (el.getAttribute('aria-hidden') === 'true') return NodeFilter.FILTER_REJECT;
            if (el.disabled) return NodeFilter.FILTER_REJECT;
            // 必須有直接文字節點（不算子元素文字）
            let hasDirectText = false;
            for (const n of el.childNodes) {
              if (n.nodeType === Node.TEXT_NODE && n.textContent.trim().length > 0) {
                hasDirectText = true;
                break;
              }
            }
            if (!hasDirectText) return NodeFilter.FILTER_SKIP;
            // 可見性
            const r = el.getBoundingClientRect();
            if (r.width < 2 || r.height < 2) return NodeFilter.FILTER_REJECT;
            const cs = window.getComputedStyle(el);
            if (cs.visibility === 'hidden' || cs.display === 'none' || parseFloat(cs.opacity) === 0) {
              return NodeFilter.FILTER_REJECT;
            }
            return NodeFilter.FILTER_ACCEPT;
          },
        },
      );
      let node;
      while ((node = walker.nextNode())) {
        candidates.push(node);
      }

      const violations = [];
      let checked = 0;

      for (const el of candidates) {
        const cs = window.getComputedStyle(el);
        const fg = parseColor(cs.color);
        if (!fg) continue;
        const bg = effectiveBg(el);
        const ratio = contrast(fg, bg);
        // 判斷大字
        const fontSize = parseFloat(cs.fontSize);
        const fontWeight = parseInt(cs.fontWeight, 10) || 400;
        const isLarge = fontSize >= 18.66 || (fontSize >= 14 && fontWeight >= 700);
        const threshold = isLarge ? 3.0 : 4.5;
        checked++;
        if (ratio < threshold) {
          const text = (Array.from(el.childNodes).find((n) => n.nodeType === Node.TEXT_NODE)?.textContent || '').trim().slice(0, 40);
          violations.push({
            selector: selectorOf(el),
            text,
            fg: colorToHex(fg),
            bg: colorToHex(bg),
            ratio: ratio.toFixed(2),
            threshold,
            fontSize: cs.fontSize,
            fontWeight,
          });
        }
      }

      return { total_checked: checked, violations };
    });

    if (result.violations.length === 0) {
      return pass(`${result.total_checked} 個可見文字元素全部達標`);
    }
    return fail(
      `${result.violations.length}/${result.total_checked} 個元素對比未達 ${result.violations[0]?.threshold ?? 4.5}:1`,
      '修正前景文字色或背景色；參考 #1a7a94 (~5:1 on white) 或 #1a6a89 (~5.8:1)',
      result.violations.slice(0, 15).map(
        (v) => `${v.selector}「${v.text}」 ${v.fg}/${v.bg} = ${v.ratio}:1 (need ${v.threshold}:1, ${v.fontSize}/${v.fontWeight})`,
      ),
    );
  } catch (err) {
    return fail(`執行錯誤: ${err.message}`, '');
  }
}

export const metadata = {
  code: NAME,
  criterion: '1.4.3',
  level: 'AA',
  category: 'EXTRA',
  rule: RULE,
};
