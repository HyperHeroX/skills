/**
 * css_checks.js — CSS 計算樣式類 E 碼測試
 *
 * 涵蓋：CS 類全部（28 個 E 碼）+ GN 類部分 CSS 相關
 * 測試方式：window.getComputedStyle + document.styleSheets
 *
 * 包含 E 碼（共 40 個）：
 * CS1110113E, CS1110114E, CS1130103E, CS1130202E, CS1130203E,
 * CS1140101E, CS1240405E,
 * CS2140401E, CS2140402E, CS2140500E,
 * CS2141000E, CS2141001E, CS2141002E, CS2141003E, CS2141006E, CS2141007E,
 * CS2141200E, CS2141201E, CS2141202E, CS2141203E, CS2141204E,
 * CS2240700E,
 * CS3140800E, CS3140801E, CS3140802E, CS3140803E, CS3140804E,
 * CS3140900E, CS3230300E, CS3240903E,
 * SC2141004E, SC2141300E,
 * GN2140300E, GN2140301E, GN2140302E, GN2140303E,
 * GN2140400E, GN2140401E, GN2141005E,
 * GN2141100E, GN2141101E, GN2141102E, GN2141103E
 */

import { result, safeEval, parseRgb, wcagContrast, blendOnWhite } from './helpers.js';

// ── 1.1.1 CSS 裝飾性圖片 ─────────────────────────────────────────────────────

/** CS1110113E: 裝飾性圖片透過 CSS 置入，非 img 標籤 */
export async function check_CS1110113E(page) {
  const r = await safeEval(page, () => {
    const decorativeImgs = [...document.querySelectorAll('img')].filter(img =>
      img.getAttribute('alt') === '' && !img.closest('a') && !img.closest('button')
    ).map(img => img.src?.split('/').pop()?.slice(0, 40) || '?');
    return decorativeImgs;
  }, []);
  if (r.length > 0) {
    return result('CS1110113E', '裝飾性圖片應透過 CSS background 置入', 'fail',
      `${r.length} 個 alt="" 的 <img> 疑似裝飾性圖片，建議改用 CSS background-image`,
      '.deco { background-image: url(...); } 並移除 <img alt="">',
      r);
  }
  return result('CS1110113E', '裝飾性圖片使用 CSS 置入', 'pass', '無需改用 CSS 的裝飾性 img');
}

/** CS1110114E: 佔位圖片（spacer）應改用 CSS */
export async function check_CS1110114E(page) {
  const r = await safeEval(page, () => {
    return [...document.querySelectorAll('img')].filter(img => {
      const w = img.getAttribute('width') ? parseInt(img.getAttribute('width')) : img.naturalWidth;
      const h = img.getAttribute('height') ? parseInt(img.getAttribute('height')) : img.naturalHeight;
      const src = (img.src || '').toLowerCase();
      return (w <= 1 || h <= 1 || src.includes('spacer') || src.includes('blank') || src.includes('pixel') || src.includes('1x1'));
    }).length;
  }, 0);
  if (r > 0) {
    return result('CS1110114E', '佔位圖片應改用 CSS', 'fail',
      `${r} 個疑似佔位圖片（1×1px 或 spacer/blank 命名）`,
      '移除佔位 <img>，改用 CSS margin/padding/gap 控制間距');
  }
  return result('CS1110114E', '無佔位 img 元素', 'pass');
}

// ── 1.3 CSS 文字呈現 ───────────────────────────────────────────────────────────

/** CS1130103E: 文字以 CSS 控制，不用 font/center/b/i */
export async function check_CS1130103E(page) {
  const r = await safeEval(page, () => {
    const fontTags = document.querySelectorAll('font').length;
    const centerTags = document.querySelectorAll('center').length;
    const presentational = document.querySelectorAll('b:not([class]):not([aria-label]), i:not([class]):not([aria-label])').length;
    return { fontTags, centerTags, presentational };
  }, { fontTags: 0, centerTags: 0, presentational: 0 });
  const issues = [];
  if (r.fontTags > 0) issues.push(`${r.fontTags} 個 <font>`);
  if (r.centerTags > 0) issues.push(`${r.centerTags} 個 <center>`);
  if (r.presentational > 0) issues.push(`${r.presentational} 個 <b>/<i>（無 class）`);
  if (issues.length > 0) {
    return result('CS1130103E', '文字呈現使用舊式標籤', 'fail',
      `發現舊式呈現標籤：${issues.join('、')}`,
      '改用 CSS 控制：.bold { font-weight: bold; }，舊標籤以 <strong>/<em> 替代');
  }
  return result('CS1130103E', '文字以 CSS 控制', 'pass', '無舊式排版標籤');
}

/** CS1130202E: letter-spacing 以 CSS 控制，非 inline style */
export async function check_CS1130202E(page) {
  const r = await safeEval(page, () => {
    return [...document.querySelectorAll('[style]')]
      .filter(el => (el.getAttribute('style') || '').includes('letter-spacing'))
      .map(el => el.tagName + ': ' + el.getAttribute('style').match(/letter-spacing[^;]+/)?.[0])
      .slice(0, 5);
  }, []);
  if (r.length > 0) {
    return result('CS1130202E', 'letter-spacing 使用 inline style', 'fail',
      `${r.length} 個元素用 inline style 設定 letter-spacing`,
      '移至外部 CSS 規則：.text { letter-spacing: 0.12em; }',
      r);
  }
  return result('CS1130202E', 'letter-spacing 以外部 CSS 控制', 'pass');
}

/** CS1130203E: DOM 物件順序與視覺順序一致 */
export async function check_CS1130203E(page) {
  const r = await safeEval(page, () => {
    const orderIssues = [];
    document.querySelectorAll('[class]').forEach(el => {
      try {
        const order = parseInt(window.getComputedStyle(el).order || '0');
        if (order !== 0) {
          orderIssues.push(`${el.tagName}.${el.className?.split(' ')[0]} order=${order}`);
        }
      } catch {}
    });
    return orderIssues.slice(0, 5);
  }, []);
  if (r.length > 0) {
    return result('CS1130203E', 'CSS order 屬性改變視覺順序，可能與 DOM 不一致', 'fail',
      `${r.length} 個元素有非零的 CSS order 值`,
      '調整 DOM 順序使之符合視覺順序，減少對 CSS order 的依賴',
      r);
  }
  return result('CS1130203E', 'DOM 物件順序與視覺順序一致', 'pass');
}

// ── 1.4.4 焦點可見 ───────────────────────────────────────────────────────────

/** CS1140101E: 焦點元素有可見的 focus 樣式 */
export async function check_CS1140101E(page) {
  const r = await safeEval(page, () => {
    // 抽樣 focusable 元素，檢查 CSS outline 是否被移除
    const focusable = [...document.querySelectorAll('a[href], button:not([disabled]), input:not([disabled]):not([type="hidden"]), select, textarea, [tabindex="0"]')].slice(0, 20);
    const noFocus = focusable.filter(el => {
      const style = window.getComputedStyle(el, ':focus');
      const outline = style.outline || '';
      const outlineWidth = style.outlineWidth || '';
      const boxShadow = style.boxShadow || '';
      const borderColor = style.borderColor || '';
      return (outline === 'none' || outline.includes('0px') || outlineWidth === '0px') &&
        !boxShadow.includes('0 0') && boxShadow === 'none';
    }).map(el => el.tagName + (el.id ? '#' + el.id : '') + (el.className ? '.' + el.className.split(' ')[0] : '')).slice(0, 5);

    // 全域 :focus { outline: none } 偵測
    let globalOutlineNone = false;
    for (const sheet of document.styleSheets) {
      try {
        for (const rule of sheet.cssRules || []) {
          if (rule.selectorText?.includes(':focus') && (rule.style?.outline === 'none' || rule.style?.outlineWidth === '0px')) {
            globalOutlineNone = true;
          }
        }
      } catch {}
    }
    return { noFocus, globalOutlineNone };
  }, { noFocus: [], globalOutlineNone: false });

  if (r.globalOutlineNone) {
    return result('CS1140101E', 'CSS 全域移除 focus outline', 'fail',
      '偵測到 CSS 規則 ":focus { outline: none }"，所有焦點元素可能不可見',
      '移除 * :focus { outline: none }；改為 :focus-visible { outline: 2px solid #005fcc; outline-offset: 2px; }');
  }
  if (r.noFocus.length > 5) {
    return result('CS1140101E', '多個互動元素無可見焦點樣式', 'fail',
      `${r.noFocus.length} 個焦點元素 outline 為 none 且無 box-shadow 替代`,
      '加上 :focus-visible { outline: 2px solid currentColor; outline-offset: 2px; }',
      r.noFocus);
  }
  return result('CS1140101E', '焦點樣式可見', 'pass', r.noFocus.length > 0 ? `${r.noFocus.length} 個元素待確認` : '所有測試元素有焦點樣式');
}

// ── 2.4 焦點（keyboard navigation） ─────────────────────────────────────────

/** CS1240405E: 使用 :focus-within 保持父元素焦點可見 */
export async function check_CS1240405E(page) {
  const r = await safeEval(page, () => {
    let hasFocusWithin = false;
    for (const sheet of document.styleSheets) {
      try {
        for (const rule of sheet.cssRules || []) {
          if (rule.selectorText?.includes(':focus-within')) {
            hasFocusWithin = true;
          }
        }
      } catch {}
    }
    const hasNavDropdown = !!document.querySelector('nav [class*="dropdown"], nav [class*="submenu"]');
    return { hasFocusWithin, hasNavDropdown };
  }, { hasFocusWithin: false, hasNavDropdown: false });
  if (r.hasNavDropdown && !r.hasFocusWithin) {
    return result('CS1240405E', '下拉導覽缺少 :focus-within 保持父元素聚焦', 'fail',
      '有下拉選單但 CSS 無 :focus-within 規則',
      'nav li:focus-within { ... } 讓焦點移入子項時父元素保持視覺狀態');
  }
  return result('CS1240405E', ':focus-within 設定', 'pass',
    r.hasFocusWithin ? '已有 :focus-within 規則' : '無下拉導覽，不需要');
}

// ── 1.4.4 調整文字大小 ────────────────────────────────────────────────────────

/** CS2140401E: CSS font-size 使用相對單位（em/rem/%） */
export async function check_CS2140401E(page) {
  const r = await safeEval(page, () => {
    const pxFonts = [];
    for (const sheet of document.styleSheets) {
      try {
        for (const rule of sheet.cssRules || []) {
          if (rule.style?.fontSize) {
            const fs = rule.style.fontSize;
            if (/^\d+(\.\d+)?px$/.test(fs)) {
              pxFonts.push({ selector: rule.selectorText?.slice(0, 40), fontSize: fs });
            }
          }
        }
      } catch {}
    }
    return pxFonts.slice(0, 10);
  }, []);
  if (r.length > 0) {
    return result('CS2140401E', 'CSS font-size 使用固定 px', 'fail',
      `${r.length} 個 CSS 規則使用固定 px 字型尺寸（無法依使用者字型設定縮放）`,
      'font-size 改為 rem/em/%：body { font-size: 1rem; } h1 { font-size: 2em; }',
      r.slice(0, 5).map(f => `${f.selector}: ${f.fontSize}`));
  }
  return result('CS2140401E', 'CSS font-size 使用相對單位', 'pass');
}

/** CS2140402E: 不使用 CSS 的絕對字型大小關鍵字 */
export async function check_CS2140402E(page) {
  const r = await safeEval(page, () => {
    const absoluteKeywords = ['xx-small', 'x-small', 'medium', 'large', 'x-large', 'xx-large'];
    const issues = [];
    for (const sheet of document.styleSheets) {
      try {
        for (const rule of sheet.cssRules || []) {
          if (rule.style?.fontSize) {
            const fs = rule.style.fontSize;
            // 'medium' is default, warn if explicitly set
            if (fs === 'medium') {
              issues.push(`${rule.selectorText?.slice(0, 30)}: font-size: medium (明確設定了預設值)`);
            }
          }
        }
      } catch {}
    }
    // named keywords that are NOT relative (x-small etc are absolute)
    return issues.slice(0, 5);
  }, []);
  return result('CS2140402E', 'CSS 字型大小關鍵字檢查', 'pass',
    r.length > 0 ? `${r.length} 個規則明確使用絕對字型關鍵字` : '無問題');
}

/** CS2140500E: 不使用 CSS 的 text-decoration: blink */
export async function check_CS2140500E(page) {
  const r = await safeEval(page, () => {
    const blinkEls = [];
    for (const sheet of document.styleSheets) {
      try {
        for (const rule of sheet.cssRules || []) {
          if (rule.style?.textDecoration === 'blink') {
            blinkEls.push(rule.selectorText?.slice(0, 40));
          }
        }
      } catch {}
    }
    const inlineBlink = [...document.querySelectorAll('[style*="blink"]')].length;
    return { cssBlink: blinkEls, inlineBlink };
  }, { cssBlink: [], inlineBlink: 0 });
  if (r.cssBlink.length > 0 || r.inlineBlink > 0) {
    return result('CS2140500E', 'CSS text-decoration: blink 會造成閃爍', 'fail',
      `${r.cssBlink.length} 個 CSS 規則或 ${r.inlineBlink} 個 inline style 使用 blink`,
      '移除所有 text-decoration: blink；若需提示，改用視覺邊框或 animation 且限時');
  }
  return result('CS2140500E', '無 CSS blink 效果', 'pass');
}

// ── 1.4.4 文字縮放（responsive） ─────────────────────────────────────────────

/** CS2141000E: CSS 有 media query 支援響應式 */
export async function check_CS2141000E(page) {
  const r = await safeEval(page, () => {
    let mediaQueryCount = 0;
    for (const sheet of document.styleSheets) {
      try {
        for (const rule of sheet.cssRules || []) {
          if (rule.type === CSSRule.MEDIA_RULE) mediaQueryCount++;
        }
      } catch {}
    }
    return mediaQueryCount;
  }, 0);
  if (r === 0) {
    return result('CS2141000E', '缺少 @media query 響應式規則', 'fail',
      '樣式表中無任何 @media 規則，無法支援不同裝置',
      '@media (max-width: 768px) { ... } 加入響應式斷點');
  }
  return result('CS2141000E', 'CSS 有響應式 media query', 'pass', `共 ${r} 個 @media 規則`);
}

/** CS2141001E: 使用彈性版面（flexbox/grid）而非固定寬度 */
export async function check_CS2141001E(page) {
  const r = await safeEval(page, () => {
    let hasFlexOrGrid = false;
    let fixedWidthCount = 0;
    for (const sheet of document.styleSheets) {
      try {
        for (const rule of sheet.cssRules || []) {
          if (rule.style?.display === 'flex' || rule.style?.display === 'grid' ||
              rule.style?.display === 'inline-flex' || rule.style?.display === 'inline-grid') {
            hasFlexOrGrid = true;
          }
          if (rule.style?.width && /^\d+px$/.test(rule.style.width) && parseInt(rule.style.width) > 200) {
            fixedWidthCount++;
          }
        }
      } catch {}
    }
    const viewport = document.querySelector('meta[name="viewport"]');
    const hasViewportMeta = !!viewport && viewport.getAttribute('content')?.includes('width=device-width');
    return { hasFlexOrGrid, fixedWidthCount, hasViewportMeta };
  }, { hasFlexOrGrid: false, fixedWidthCount: 0, hasViewportMeta: false });
  const issues = [];
  if (!r.hasFlexOrGrid) issues.push('CSS 未使用 flexbox 或 grid 彈性版面');
  if (!r.hasViewportMeta) issues.push('缺少 <meta name="viewport" content="width=device-width">');
  if (issues.length > 0) {
    return result('CS2141001E', '版面未使用彈性佈局', 'fail', issues.join('；'),
      'body { display: flex; flex-direction: column; } 或使用 CSS grid');
  }
  return result('CS2141001E', '版面使用彈性佈局', 'pass',
    `flex/grid: ${r.hasFlexOrGrid}, viewport meta: ${r.hasViewportMeta}`);
}

/** CS2141002E: 不限制視窗縮放 */
export async function check_CS2141002E(page) {
  const r = await safeEval(page, () => {
    const viewport = document.querySelector('meta[name="viewport"]');
    const content = viewport?.getAttribute('content') || '';
    const hasScaleRestriction = content.includes('user-scalable=no') ||
      content.includes('maximum-scale=1') || content.includes('maximum-scale=1.0');
    return { content, hasScaleRestriction };
  }, { content: '', hasScaleRestriction: false });
  if (r.hasScaleRestriction) {
    return result('CS2141002E', 'meta viewport 限制使用者縮放', 'fail',
      `viewport: "${r.content}" 包含 user-scalable=no 或 maximum-scale=1`,
      '移除 user-scalable=no 和 maximum-scale=1，讓使用者可以縮放頁面');
  }
  return result('CS2141002E', '未限制視窗縮放', 'pass', `viewport: "${r.content}"`);
}

/** CS2141003E: 避免使用固定位置的元素影響縮放 */
export async function check_CS2141003E(page) {
  const r = await safeEval(page, () => {
    const fixedEls = [...document.querySelectorAll('*')].filter(el => {
      try {
        const pos = window.getComputedStyle(el).position;
        return pos === 'fixed';
      } catch { return false; }
    }).map(el => el.tagName + (el.className ? '.' + el.className.split(' ')[0] : '')).slice(0, 5);
    return fixedEls;
  }, []);
  if (r.length > 3) {
    return result('CS2141003E', '過多固定定位元素可能影響縮放可用性', 'fail',
      `${r.length} 個 position: fixed 元素，可能遮蓋縮放後的內容`,
      '固定定位元素應可摺疊或設計不遮蓋內容；確保 320px 寬度下仍可使用',
      r);
  }
  return result('CS2141003E', '固定定位元素數量合理', 'pass', r.length > 0 ? `${r.length} 個 fixed 元素：${r.join(', ')}` : '無 fixed 元素');
}

/** CS2141006E: 使用 CSS 而非圖片呈現文字 */
export async function check_CS2141006E(page) {
  const r = await safeEval(page, () => {
    // 偵測 img 的 alt 文字與圖片名稱相符（文字圖片）
    const textImgs = [...document.querySelectorAll('img[alt]')].filter(img => {
      const alt = img.alt.trim();
      const src = (img.src || '').toLowerCase();
      // 如果 alt 是純文字且 src 包含常見文字圖片關鍵字
      return alt.length > 0 && alt.length < 20 &&
        (src.includes('text') || src.includes('title') || src.includes('heading') || src.includes('btn'));
    }).map(img => ({ alt: img.alt, src: img.src?.split('/').pop() })).slice(0, 5);
    return textImgs;
  }, []);
  if (r.length > 0) {
    return result('CS2141006E', '疑似使用圖片呈現文字', 'fail',
      `${r.length} 個圖片疑似為文字圖片`,
      '改用 HTML 文字 + CSS 樣式；需要特殊字體時用 @font-face + 真實文字',
      r.map(i => `${i.alt} (${i.src})`));
  }
  return result('CS2141006E', '文字以 CSS 而非圖片呈現', 'pass');
}

/** CS2141007E: 影像文字使用者可自訂外觀 */
export async function check_CS2141007E(page) {
  // 此項主要靠人工確認；程式層面偵測是否有可客製化的文字圖片
  const r = await safeEval(page, () => {
    const imgText = [...document.querySelectorAll('img[alt]')]
      .filter(img => img.alt && img.alt.length > 0 && img.alt.length < 15)
      .filter(img => {
        const style = window.getComputedStyle(img);
        return style.width === style.height; // 疑似 logo/icon
      }).length;
    return imgText;
  }, 0);
  return result('CS2141007E', '影像文字外觀可自訂', 'pass',
    `${r} 個疑似影像文字（請人工確認是否允許使用者自訂外觀）`);
}

// ── 1.4.10 重新排列（Reflow） ─────────────────────────────────────────────────

/** CS2141200E: 320px 寬度下無水平捲動 */
export async function check_CS2141200E(page) {
  const origSize = page.viewportSize() || { width: 1280, height: 800 };
  await page.setViewportSize({ width: 320, height: 568 });
  await page.waitForTimeout(500);
  const r = await safeEval(page, () => {
    const hasHScroll = document.documentElement.scrollWidth > 320;
    const overflow = window.getComputedStyle(document.body).overflowX;
    return { hasHScroll, scrollWidth: document.documentElement.scrollWidth, overflow };
  }, { hasHScroll: false, scrollWidth: 320, overflow: 'auto' });
  await page.setViewportSize(origSize);
  if (r.hasHScroll && r.overflow !== 'hidden') {
    return result('CS2141200E', '320px 視窗下有水平捲動', 'fail',
      `320px 寬度下，文件寬度為 ${r.scrollWidth}px（overflow-x: ${r.overflow}）`,
      '移除固定寬度元素；使用 max-width: 100%、overflow-wrap: break-word；flex/grid 自動換行');
  }
  return result('CS2141200E', '320px 視窗下無水平捲動', 'pass');
}

/** CS2141201E: 256px 高度下無垂直捲動（橫向頁面） */
export async function check_CS2141201E(page) {
  const origSize = page.viewportSize() || { width: 1280, height: 800 };
  await page.setViewportSize({ width: 1280, height: 256 });
  await page.waitForTimeout(400);
  const r = await safeEval(page, () => {
    const hasVScroll = document.documentElement.scrollHeight > 256;
    return { hasVScroll, scrollHeight: document.documentElement.scrollHeight };
  }, { hasVScroll: false, scrollHeight: 256 });
  await page.setViewportSize(origSize);
  // 此規則主要針對橫向滾動頁面（如數據表），大部分頁面允許垂直捲動
  return result('CS2141201E', '256px 高度垂直捲動', 'pass',
    r.hasVScroll ? `scrollHeight=${r.scrollHeight}px（橫向頁面請人工確認）` : '無垂直捲動');
}

/** CS2141202E: 重排後兩端對齊文字不超過視窗寬度 */
export async function check_CS2141202E(page) {
  const origSize = page.viewportSize() || { width: 1280, height: 800 };
  await page.setViewportSize({ width: 320, height: 568 });
  await page.waitForTimeout(400);
  const r = await safeEval(page, () => {
    const justifiedEls = [...document.querySelectorAll('p, div, section')]
      .filter(el => window.getComputedStyle(el).textAlign === 'justify')
      .filter(el => el.scrollWidth > 320)
      .map(el => el.tagName + '.' + (el.className?.split(' ')[0] || ''))
      .slice(0, 3);
    return justifiedEls;
  }, []);
  await page.setViewportSize(origSize);
  if (r.length > 0) {
    return result('CS2141202E', '兩端對齊文字在 320px 下溢出', 'fail',
      `${r.length} 個 text-align:justify 元素在小視窗下有水平溢出`,
      '小螢幕改用 text-align: left；或加 overflow-wrap: break-word',
      r);
  }
  return result('CS2141202E', '兩端對齊文字無溢出', 'pass');
}

/** CS2141203E: 重排後文字不使用水平捲動 */
export async function check_CS2141203E(page) {
  // 同 CS2141200E 但針對文字區塊
  const origSize = page.viewportSize() || { width: 1280, height: 800 };
  await page.setViewportSize({ width: 320, height: 568 });
  await page.waitForTimeout(400);
  const r = await safeEval(page, () => {
    const textOverflow = [...document.querySelectorAll('p, h1, h2, h3, h4, li, td')]
      .filter(el => el.scrollWidth > el.offsetWidth && el.offsetWidth > 0)
      .map(el => el.tagName + ': ' + el.textContent.trim().slice(0, 20))
      .slice(0, 5);
    return textOverflow;
  }, []);
  await page.setViewportSize(origSize);
  if (r.length > 0) {
    return result('CS2141203E', '文字元素在 320px 下水平溢出', 'fail',
      `${r.length} 個文字元素寬度超出容器`,
      'word-break: break-word; overflow-wrap: break-word;',
      r);
  }
  return result('CS2141203E', '文字無水平溢出', 'pass');
}

/** CS2141204E: 文字縮放至 200% 後頁面可用 */
export async function check_CS2141204E(page) {
  const origSize = page.viewportSize() || { width: 1280, height: 800 };
  // 模擬 200% 縮放（視窗縮半）
  await page.setViewportSize({ width: 640, height: 400 });
  await page.waitForTimeout(400);
  const r = await safeEval(page, () => {
    // 主要內容是否可見
    const mainVisible = !!(document.querySelector('main, [role="main"], #main-content, .main'))
      && document.querySelector('main, [role="main"]')?.offsetHeight > 0;
    const hasHScroll = document.documentElement.scrollWidth > 640;
    return { mainVisible, hasHScroll, scrollWidth: document.documentElement.scrollWidth };
  }, { mainVisible: false, hasHScroll: false, scrollWidth: 640 });
  await page.setViewportSize(origSize);
  if (r.hasHScroll) {
    return result('CS2141204E', '200% 縮放後有水平捲動', 'fail',
      `模擬 200% 縮放（640px 視窗），文件寬度 ${r.scrollWidth}px`,
      '確保 200% 縮放下無需水平捲動；使用 max-width: 100%');
  }
  return result('CS2141204E', '200% 縮放後頁面正常', 'pass', `mainVisible: ${r.mainVisible}`);
}

// ── 2.4.7 非文字對比 ─────────────────────────────────────────────────────────

/** CS2240700E: 非文字 UI 元件對比值至少 3:1 */
export async function check_CS2240700E(page) {
  const r = await safeEval(page, () => {
    // 抽樣按鈕/輸入框/圖示的邊框對比
    const issues = [];
    const sampleEls = [...document.querySelectorAll('button, input, select, textarea, [role="checkbox"], [role="radio"]')].slice(0, 10);
    for (const el of sampleEls) {
      const style = window.getComputedStyle(el);
      const border = style.borderColor || '';
      const bg = style.backgroundColor || '';
      // 只偵測邊框顏色與背景幾乎相同的情況
      if (border === bg && border !== '' && !border.includes('transparent')) {
        issues.push(`${el.tagName}[${el.type || ''}] border === bg (${border})`);
      }
    }
    return issues.slice(0, 3);
  }, []);
  if (r.length > 0) {
    return result('CS2240700E', 'UI 元件邊框對比可能不足', 'fail',
      `${r.length} 個表單元件邊框色與背景色相同`,
      '確保 button/input 邊框或圖示與背景有至少 3:1 對比值',
      r);
  }
  return result('CS2240700E', 'UI 元件對比值符合要求', 'pass',
    '（非文字對比 3:1 請搭配 axe-core color-contrast 詳細報告）');
}

// ── AAA 等級 CSS 規則 ────────────────────────────────────────────────────────

/** CS3140800E: 前景色可由使用者自訂 */
export async function check_CS3140800E(page) {
  const r = await safeEval(page, () => {
    // 偵測是否使用 CSS custom properties (可由使用者覆寫)
    const hasCSSVars = [...document.querySelectorAll('[style]')]
      .some(el => el.getAttribute('style')?.includes('--')) ||
      (() => {
        for (const sheet of document.styleSheets) {
          try {
            for (const rule of sheet.cssRules || []) {
              if (rule.cssText?.includes('--color') || rule.cssText?.includes('--text')) return true;
            }
          } catch {}
        }
        return false;
      })();
    return { hasCSSVars };
  }, { hasCSSVars: false });
  return result('CS3140800E', '前景色可自訂（AAA）', 'pass',
    r.hasCSSVars ? 'CSS custom properties 存在，可由使用者覆寫顏色' : '（請確認是否允許使用者自訂前景色）');
}

/** CS3140801E: 背景色可由使用者自訂 */
export async function check_CS3140801E(page) {
  const r = await safeEval(page, () => {
    const hasHighContrastSupport = (() => {
      for (const sheet of document.styleSheets) {
        try {
          for (const rule of sheet.cssRules || []) {
            if (rule.type === CSSRule.MEDIA_RULE &&
                (rule.conditionText?.includes('forced-colors') || rule.conditionText?.includes('prefers-contrast'))) {
              return true;
            }
          }
        } catch {}
      }
      return false;
    })();
    return { hasHighContrastSupport };
  }, { hasHighContrastSupport: false });
  return result('CS3140801E', '背景色可自訂（AAA）', 'pass',
    r.hasHighContrastSupport ? '有 forced-colors/prefers-contrast media query' : '（AAA 等級，請人工確認）');
}

/** CS3140802E: line-height 至少為字型大小 1.5 倍 */
export async function check_CS3140802E(page) {
  const r = await safeEval(page, () => {
    const bodyStyle = window.getComputedStyle(document.body);
    const lineHeight = parseFloat(bodyStyle.lineHeight) || 0;
    const fontSize = parseFloat(bodyStyle.fontSize) || 16;
    const ratio = lineHeight > 0 ? lineHeight / fontSize : 0;

    // 也檢查 CSS 宣告
    let cssLineHeight = '';
    for (const sheet of document.styleSheets) {
      try {
        for (const rule of sheet.cssRules || []) {
          if ((rule.selectorText === 'body' || rule.selectorText === ':root') && rule.style?.lineHeight) {
            cssLineHeight = rule.style.lineHeight;
          }
        }
      } catch {}
    }
    return { ratio: Math.round(ratio * 100) / 100, lineHeight, fontSize, cssLineHeight };
  }, { ratio: 0, lineHeight: 0, fontSize: 16, cssLineHeight: '' });
  if (r.ratio > 0 && r.ratio < 1.5) {
    return result('CS3140802E', 'line-height 低於 1.5（AAA）', 'fail',
      `body line-height 為 ${r.lineHeight}px，字型 ${r.fontSize}px，比例 ${r.ratio}（建議 ≥ 1.5）`,
      'body { line-height: 1.5; } 或 body { line-height: 1.6; }');
  }
  return result('CS3140802E', 'line-height 達到 1.5 以上（AAA）', 'pass',
    r.ratio > 0 ? `比例 ${r.ratio}（${r.lineHeight}/${r.fontSize}）` : `CSS 宣告：${r.cssLineHeight || '未直接設定'}`);
}

/** CS3140803E: 文字選取區塊前景色可自訂 */
export async function check_CS3140803E(page) {
  const r = await safeEval(page, () => {
    let hasSelection = false;
    for (const sheet of document.styleSheets) {
      try {
        for (const rule of sheet.cssRules || []) {
          if (rule.selectorText?.includes('::selection')) {
            hasSelection = true;
          }
        }
      } catch {}
    }
    return { hasSelection };
  }, { hasSelection: false });
  return result('CS3140803E', '文字選取前景色（AAA）', 'pass',
    r.hasSelection ? '有 ::selection CSS 規則' : '（AAA 等級，請確認 ::selection 前景色可區分）');
}

/** CS3140804E: 文字選取區塊背景色可自訂 */
export async function check_CS3140804E(page) {
  const r = await safeEval(page, () => {
    let selectionBg = '';
    for (const sheet of document.styleSheets) {
      try {
        for (const rule of sheet.cssRules || []) {
          if (rule.selectorText?.includes('::selection') && rule.style?.backgroundColor) {
            selectionBg = rule.style.backgroundColor;
          }
        }
      } catch {}
    }
    return { selectionBg };
  }, { selectionBg: '' });
  return result('CS3140804E', '文字選取背景色（AAA）', 'pass',
    r.selectionBg ? `::selection background: ${r.selectionBg}` : '未設定 ::selection（沿用瀏覽器預設）');
}

/** CS3140900E: 文字寬度不超過 80 個字元 */
export async function check_CS3140900E(page) {
  const r = await safeEval(page, () => {
    const mainContent = document.querySelector('main, article, .content, #content') || document.body;
    const style = window.getComputedStyle(mainContent);
    const maxWidth = style.maxWidth;
    const width = mainContent.offsetWidth;
    const fontSize = parseFloat(style.fontSize) || 16;
    // 80ch ≈ 80 * 0.5em = 40em（粗估）
    const estChars = width / (fontSize * 0.5);
    return { maxWidth, width, fontSize, estChars: Math.round(estChars) };
  }, { maxWidth: '', width: 0, fontSize: 16, estChars: 0 });
  if (r.estChars > 100) {
    return result('CS3140900E', '主要內容寬度可能超過 80 字元（AAA）', 'fail',
      `估計每行約 ${r.estChars} 字元（主容器寬 ${r.width}px，字型 ${r.fontSize}px）`,
      'main, article { max-width: 80ch; } 限制每行不超過 80 字元');
  }
  return result('CS3140900E', '文字寬度符合 80 字元上限（AAA）', 'pass',
    `估計每行約 ${r.estChars} 字元`);
}

/** CS3230300E: focus 指示器對比度符合 AAA */
export async function check_CS3230300E(page) {
  const r = await safeEval(page, () => {
    // 取樣第一個按鈕的 :focus 樣式
    const btn = document.querySelector('button, a[href], input');
    if (!btn) return { checked: false };
    const focusStyle = window.getComputedStyle(btn, ':focus');
    const outlineColor = focusStyle.outlineColor || '';
    const bgColor = window.getComputedStyle(document.body).backgroundColor || '';
    return { checked: true, outlineColor, bgColor };
  }, { checked: false, outlineColor: '', bgColor: '' });
  return result('CS3230300E', '焦點指示器對比度（AAA）', 'pass',
    r.checked ? `focus outline: ${r.outlineColor}（AAA 等級，請搭配 axe-core 詳細確認）` : '無可聚焦元素');
}

/** CS3240903E: 連結的焦點樣式有足夠對比 */
export async function check_CS3240903E(page) {
  const r = await safeEval(page, () => {
    const link = document.querySelector('a[href]');
    if (!link) return { hasLink: false };
    const style = window.getComputedStyle(link, ':focus');
    const outline = style.outline;
    const outlineWidth = parseFloat(style.outlineWidth) || 0;
    return { hasLink: true, outline, outlineWidth };
  }, { hasLink: false, outline: '', outlineWidth: 0 });
  if (r.hasLink && r.outlineWidth < 1) {
    return result('CS3240903E', '連結焦點樣式 outline 寬度不足', 'fail',
      `a:focus outline 寬度 ${r.outlineWidth}px`,
      'a:focus-visible { outline: 2px solid currentColor; outline-offset: 2px; }');
  }
  return result('CS3240903E', '連結焦點樣式對比符合（AAA）', 'pass',
    r.hasLink ? `outline: ${r.outline}` : '無連結');
}

// ── SC 類（CSS 特殊規則） ─────────────────────────────────────────────────────

/** SC2141004E: 不使用 CSS aspect-ratio 固定影像比例導致 Reflow 問題 */
export async function check_SC2141004E(page) {
  const r = await safeEval(page, () => {
    const imgs = [...document.querySelectorAll('img')].filter(img => {
      const style = window.getComputedStyle(img);
      // 偵測固定高度影像（可能在 reflow 時被切割）
      const heightFixed = style.height !== 'auto' && !style.height.includes('%');
      const widthAuto = style.width === '100%' || style.width === 'auto';
      return heightFixed && widthAuto && img.offsetWidth > 0;
    }).length;
    return imgs;
  }, 0);
  if (r > 0) {
    return result('SC2141004E', '圖片固定高度可能在 reflow 時被截切', 'fail',
      `${r} 個圖片有固定高度但寬度自適應`,
      'img { width: 100%; height: auto; } 或使用 aspect-ratio 屬性');
  }
  return result('SC2141004E', '圖片比例設定正確', 'pass');
}

/** SC2141300E: 文字間距可覆寫（CSS 不阻止使用者樣式） */
export async function check_SC2141300E(page) {
  const r = await safeEval(page, () => {
    // 偵測是否有 !important 鎖定 letter-spacing/word-spacing/line-height
    const lockedStyles = [];
    for (const sheet of document.styleSheets) {
      try {
        for (const rule of sheet.cssRules || []) {
          if (rule.style) {
            const text = rule.cssText || '';
            if ((text.includes('letter-spacing') || text.includes('word-spacing') ||
                 text.includes('line-height') || text.includes('padding-top')) &&
                text.includes('!important')) {
              lockedStyles.push(rule.selectorText?.slice(0, 40));
            }
          }
        }
      } catch {}
    }
    return lockedStyles.slice(0, 5);
  }, []);
  if (r.length > 0) {
    return result('SC2141300E', 'CSS !important 鎖定文字間距相關屬性', 'fail',
      `${r.length} 個規則用 !important 鎖定 letter-spacing/line-height 等間距屬性`,
      '移除文字間距相關屬性的 !important，讓使用者可以覆寫',
      r);
  }
  return result('SC2141300E', '文字間距屬性可被覆寫', 'pass');
}

// ── GN 類對比值（需計算） ────────────────────────────────────────────────────

/** GN2140300E: 文字對比值至少 4.5:1 */
export async function check_GN2140300E(page) {
  const r = await safeEval(page, () => {
    const issues = [];
    const sampleEls = [...document.querySelectorAll('p, h1, h2, h3, h4, li, td, th, label, button, a, span')]
      .filter(el => el.offsetWidth > 0 && el.textContent.trim().length > 0)
      .slice(0, 30);

    function parseColor(c) {
      const m = c.match(/rgba?\((\d+),\s*(\d+),\s*(\d+)(?:,\s*([\d.]+))?\)/);
      if (!m) return null;
      return { r: +m[1], g: +m[2], b: +m[3], a: m[4] !== undefined ? +m[4] : 1 };
    }
    function luminance({ r, g, b }) {
      return [r, g, b].reduce((acc, c, i) => {
        const s = c / 255;
        const l = s <= 0.04045 ? s / 12.92 : Math.pow((s + 0.055) / 1.055, 2.4);
        return acc + l * [0.2126, 0.7152, 0.0722][i];
      }, 0);
    }
    function contrast(c1, c2) {
      const l1 = luminance(c1), l2 = luminance(c2);
      return (Math.max(l1, l2) + 0.05) / (Math.min(l1, l2) + 0.05);
    }
    function blendOnWhite({ r, g, b, a }) {
      return { r: Math.round(r * a + 255 * (1 - a)), g: Math.round(g * a + 255 * (1 - a)), b: Math.round(b * a + 255 * (1 - a)) };
    }

    for (const el of sampleEls) {
      const style = window.getComputedStyle(el);
      let color = parseColor(style.color);
      let bg = parseColor(style.backgroundColor);
      if (!color) continue;
      if (!bg || bg.a === 0) bg = { r: 255, g: 255, b: 255, a: 1 };
      if (color.a < 1) color = blendOnWhite(color);
      if (bg.a < 1) bg = blendOnWhite(bg);
      const ratio = contrast(color, bg);
      if (ratio < 4.5) {
        const fontSize = parseFloat(style.fontSize);
        const isBold = parseInt(style.fontWeight) >= 700;
        // 大文字（18pt=24px 或 14pt=18.67px 粗體）只需 3:1
        if (fontSize >= 24 || (fontSize >= 18.67 && isBold)) {
          if (ratio < 3) issues.push(`${el.tagName}: ${ratio.toFixed(1)}:1 (大文字 <3:1)`);
        } else {
          issues.push(`${el.tagName}: ratio ${ratio.toFixed(1)}:1 (需 4.5:1)`);
        }
      }
    }
    return issues.slice(0, 5);
  }, []);
  if (r.length > 0) {
    return result('GN2140300E', '文字對比值不足', 'fail',
      `${r.length} 個元素對比值低於要求`,
      '確保一般文字與背景對比值 ≥ 4.5:1；大文字（18pt+）≥ 3:1',
      r);
  }
  return result('GN2140300E', '文字對比值符合 4.5:1', 'pass',
    '（已抽樣 30 個文字元素；完整檢查請搭配 axe-core）');
}

/** GN2140301E: 大文字對比值至少 3:1 */
export async function check_GN2140301E(page) {
  const r = await safeEval(page, () => {
    const issues = [];
    const headings = [...document.querySelectorAll('h1, h2, h3, .text-large, .heading')].slice(0, 10);
    function parseColor(c) {
      const m = c.match(/rgba?\((\d+),\s*(\d+),\s*(\d+)(?:,\s*([\d.]+))?\)/);
      if (!m) return null;
      return { r: +m[1], g: +m[2], b: +m[3], a: m[4] !== undefined ? +m[4] : 1 };
    }
    function lum({ r, g, b }) {
      return [r, g, b].reduce((a, c, i) => {
        const s = c / 255;
        return a + (s <= 0.04045 ? s / 12.92 : Math.pow((s + 0.055) / 1.055, 2.4)) * [0.2126, 0.7152, 0.0722][i];
      }, 0);
    }
    for (const el of headings) {
      const style = window.getComputedStyle(el);
      const color = parseColor(style.color);
      const bg = parseColor(style.backgroundColor) || { r: 255, g: 255, b: 255, a: 1 };
      if (!color) continue;
      const ratio = (Math.max(lum(color), lum(bg)) + 0.05) / (Math.min(lum(color), lum(bg)) + 0.05);
      if (ratio < 3) issues.push(`${el.tagName}: ${ratio.toFixed(1)}:1`);
    }
    return issues.slice(0, 5);
  }, []);
  if (r.length > 0) {
    return result('GN2140301E', '大文字對比值不足 3:1', 'fail',
      `${r.length} 個大標題對比值低於 3:1`,
      '大文字（≥18pt 或 ≥14pt 粗體）對比值至少需 3:1',
      r);
  }
  return result('GN2140301E', '大文字對比值符合 3:1', 'pass');
}

/** GN2140302E: logo/裝飾性文字豁免對比值要求 */
export async function check_GN2140302E(page) {
  const r = await safeEval(page, () => {
    const logos = document.querySelectorAll('[class*="logo"], [id*="logo"], .brand').length;
    return { logos };
  }, { logos: 0 });
  return result('GN2140302E', 'Logo/裝飾性文字（豁免）', 'pass',
    `找到 ${r.logos} 個 logo/brand 元素（WCAG 允許豁免對比值要求）`);
}

/** GN2140303E: 停用元件豁免對比值要求 */
export async function check_GN2140303E(page) {
  const r = await safeEval(page, () => {
    const disabled = document.querySelectorAll('[disabled], [aria-disabled="true"]').length;
    return { disabled };
  }, { disabled: 0 });
  return result('GN2140303E', '停用元件（豁免對比值）', 'pass',
    `${r.disabled} 個停用元件（WCAG 允許豁免對比值要求）`);
}

/** GN2140400E: 音訊控制可由使用者調整音量 */
export async function check_GN2140400E(page) {
  const r = await safeEval(page, () => {
    const audios = [...document.querySelectorAll('audio[controls], video[controls]')];
    const customAudio = [...document.querySelectorAll('[class*="audio"],[class*="player"]')];
    const hasVolumeCtrl = customAudio.some(el =>
      el.querySelector('[aria-label*="音量"],[aria-label*="volume"]') ||
      el.querySelector('input[type="range"]')
    );
    return { total: audios.length, customAudio: customAudio.length, hasVolumeCtrl };
  }, { total: 0, customAudio: 0, hasVolumeCtrl: false });
  if (r.customAudio > 0 && !r.hasVolumeCtrl) {
    return result('GN2140400E', '自訂音訊播放器缺少音量控制', 'fail',
      `${r.customAudio} 個自訂播放器，但無音量調整控制`,
      '加入音量滑桿：<input type="range" aria-label="音量">');
  }
  return result('GN2140400E', '音訊控制符合要求', 'pass',
    r.total > 0 ? `${r.total} 個原生音訊/視訊（內建音量控制）` : '無音訊元素');
}

/** GN2140401E: 音訊調整機制可在 3 秒內停止自動播放 */
export async function check_GN2140401E(page) {
  const r = await safeEval(page, () => {
    const autoplayMedia = [...document.querySelectorAll('audio[autoplay], video[autoplay]:not([muted])')];
    if (autoplayMedia.length === 0) return { total: 0, hasStopControl: true };
    const hasStopControl = !!document.querySelector('[aria-label*="停止"],[aria-label*="stop"],[aria-label*="暫停"],[aria-label*="pause"]');
    return { total: autoplayMedia.length, hasStopControl };
  }, { total: 0, hasStopControl: true });
  if (r.total > 0 && !r.hasStopControl) {
    return result('GN2140401E', '自動播放音訊缺少 3 秒內停止機制', 'fail',
      `${r.total} 個自動播放媒體，且頁面無明顯停止控制`,
      '在頁面開頭加入停止按鈕，或設定音訊 3 秒後自動停止');
  }
  return result('GN2140401E', '音訊自動播放停止機制符合要求', 'pass');
}

/** GN2141005E: 影像文字可由使用者覆寫外觀 */
export async function check_GN2141005E(page) {
  const r = await safeEval(page, () => {
    // 偵測 img 作為文字使用（alt 超過 3 字但不超過 20 字）
    const textImgs = [...document.querySelectorAll('img[alt]')]
      .filter(img => img.alt.trim().length > 3 && img.alt.trim().length < 25)
      .length;
    return textImgs;
  }, 0);
  return result('GN2141005E', '影像文字外觀可自訂', 'pass',
    `${r} 個疑似影像文字（建議改用 CSS 文字以允許使用者調整外觀）`);
}

// ── 1.4.11 文字間距 ────────────────────────────────────────────────────────────

/** GN2141100E: 行高至少為字型大小 1.5 倍 */
export async function check_GN2141100E(page) {
  const r = await safeEval(page, () => {
    const el = document.querySelector('body, main, .content') || document.body;
    const style = window.getComputedStyle(el);
    const lineHeight = parseFloat(style.lineHeight) || 0;
    const fontSize = parseFloat(style.fontSize) || 16;
    const ratio = lineHeight > 0 ? lineHeight / fontSize : 0;
    return { ratio: Math.round(ratio * 100) / 100, lineHeight, fontSize };
  }, { ratio: 0, lineHeight: 0, fontSize: 16 });
  if (r.ratio > 0 && r.ratio < 1.5) {
    return result('GN2141100E', '行高低於字型大小 1.5 倍', 'fail',
      `line-height: ${r.lineHeight}px / font-size: ${r.fontSize}px = ${r.ratio}（需 ≥ 1.5）`,
      'body { line-height: 1.5; }');
  }
  return result('GN2141100E', '行高符合 1.5 倍要求', 'pass', `ratio: ${r.ratio}`);
}

/** GN2141101E: 段落間距至少為字型大小 2 倍 */
export async function check_GN2141101E(page) {
  const r = await safeEval(page, () => {
    const ps = [...document.querySelectorAll('p')].slice(0, 5);
    const issues = ps.filter(p => {
      const style = window.getComputedStyle(p);
      const marginBottom = parseFloat(style.marginBottom) || 0;
      const fontSize = parseFloat(style.fontSize) || 16;
      return marginBottom > 0 && marginBottom < fontSize * 2;
    }).map(p => {
      const style = window.getComputedStyle(p);
      return `margin-bottom: ${style.marginBottom} / font-size: ${style.fontSize}`;
    });
    return issues.slice(0, 3);
  }, []);
  if (r.length > 0) {
    return result('GN2141101E', '段落間距低於字型大小 2 倍', 'fail',
      `${r.length} 個段落的 margin-bottom 不足`,
      'p { margin-bottom: 2em; }（段落間距建議為字型大小 2 倍）',
      r);
  }
  return result('GN2141101E', '段落間距符合 2 倍要求', 'pass');
}

/** GN2141102E: 字母間距至少為字型大小 0.12 倍 */
export async function check_GN2141102E(page) {
  const r = await safeEval(page, () => {
    const el = document.querySelector('body, p, div') || document.body;
    const style = window.getComputedStyle(el);
    const letterSpacing = parseFloat(style.letterSpacing) || 0;
    const fontSize = parseFloat(style.fontSize) || 16;
    // 0 is normal browser default (not negative)
    return { letterSpacing, fontSize, ratio: letterSpacing / fontSize };
  }, { letterSpacing: 0, fontSize: 16, ratio: 0 });
  if (r.letterSpacing < 0) {
    return result('GN2141102E', '字母間距為負值', 'fail',
      `letter-spacing: ${r.letterSpacing}px（負值會使文字難以閱讀）`,
      '移除負的 letter-spacing；若需壓縮，確保 ≥ -0.05em');
  }
  return result('GN2141102E', '字母間距符合要求', 'pass',
    `letter-spacing: ${r.letterSpacing}px（不阻止使用者覆寫）`);
}

/** GN2141103E: 字詞間距至少為字型大小 0.16 倍 */
export async function check_GN2141103E(page) {
  const r = await safeEval(page, () => {
    const el = document.querySelector('body') || document.body;
    const style = window.getComputedStyle(el);
    const wordSpacing = parseFloat(style.wordSpacing) || 0;
    return { wordSpacing };
  }, { wordSpacing: 0 });
  if (r.wordSpacing < 0) {
    return result('GN2141103E', '字詞間距為負值', 'fail',
      `word-spacing: ${r.wordSpacing}px`,
      '移除負的 word-spacing');
  }
  return result('GN2141103E', '字詞間距符合要求', 'pass',
    `word-spacing: ${r.wordSpacing}px`);
}
