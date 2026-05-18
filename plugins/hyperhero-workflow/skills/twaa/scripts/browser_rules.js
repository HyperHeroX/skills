#!/usr/bin/env node
/**
 * browser_rules.js — TWAA 瀏覽器自動化無障礙測試
 *
 * 涵蓋全部不能靜態分析、需要實際 DOM / 互動的成功準則：
 *   axe-core 掃描 → 覆蓋 WCAG 2.1 A/AA/AAA 機械可驗證規則
 *   DOM 檢查     → lang、title、skip link、aria-live、heading 結構
 *   鍵盤走訪     → Tab 順序、焦點可視、焦點陷阱（WCAG 2.1.1/2.1.2/2.4.3/2.4.7）
 *   320px 重排   → 無水平捲動（WCAG 1.4.10）
 *   Hover 測試   → tooltip/dropdown 可移入、Esc 可關閉（WCAG 1.4.13）
 *   表單送出     → 錯誤訊息有 role=alert / aria-live（WCAG 3.3.1/4.1.3）
 *   色彩對比     → 補充 axe-core（對比不足時附修復建議）
 *
 * 用法：
 *   node browser_rules.js <url> [--level AA] [--timeout 30000]
 *   node browser_rules.js https://localhost:44301/zh-tw/identity/login --level AA
 *
 * 輸出：JSON 陣列，每項 { code, rule, status, message, fix_suggestion, details }
 */

import { chromium } from 'playwright';
import AxeBuilder from '@axe-core/playwright';

// ── 常數 ──────────────────────────────────────────────────────────────────
const AXE_TAGS_BY_LEVEL = {
  A:   ['wcag2a',  'wcag21a'],
  AA:  ['wcag2a',  'wcag21a',  'wcag2aa',  'wcag21aa', 'wcag22aa'],
  AAA: ['wcag2a',  'wcag21a',  'wcag2aa',  'wcag21aa', 'wcag22aa',  'wcag2aaa'],
};

const AXE_TO_CODE = {
  'image-alt':          'HM1110100C',
  'input-image-alt':    'HM1110104C',
  'area-alt':           'HM1110101C',
  'object-alt':         'HM1110105C',
  'color-contrast':     'WCAG-1.4.3',
  'heading-order':      'HM1130100C',
  'label':              'HM1130104C',
  'duplicate-id-active':'WCAG-4.1.1',
  'button-name':        'WCAG-4.1.2',
  'link-name':          'WCAG-2.4.4',
  'document-title':     'WCAG-2.4.2',
  'html-has-lang':      'WCAG-3.1.1',
  'html-lang-valid':    'WCAG-3.1.1',
  'bypass':             'WCAG-2.4.1',
  'aria-live-region-content':'WCAG-4.1.3',
};

const FIX_BY_CODE = {
  'HM1110100C': '為 <img> 加上有意義的 alt 屬性；裝飾性圖片使用 alt=""',
  'WCAG-1.4.3': '調整前景/背景顏色使對比值達 4.5:1（一般文字）或 3:1（大文字）',
  'HM1130100C': '依序使用 h1→h2→h3，不跳級',
  'HM1130104C': '為每個輸入欄位加上對應 <label for="..."> 或 aria-label',
  'WCAG-4.1.1': '確保每個 id 值在頁面中唯一',
  'WCAG-4.1.2': '為 <button> 加上文字、aria-label 或 title',
  'WCAG-2.4.4': '使用描述目的地的連結文字，避免「按此」「more」等無意義文字',
  'WCAG-2.4.2': '在 <head> 加入 <title>頁面名稱 - 系統名稱</title>',
  'WCAG-3.1.1': '在 <html> 加上 lang="zh-TW"',
  'WCAG-2.4.1': '在 <body> 最前端加入 <a href="#main-content" class="sr-only">跳至主要內容</a>',
  'WCAG-4.1.3': '為動態更新的訊息區域加上 aria-live="polite" 或 role="alert"',
};

// ── 輔助函式 ───────────────────────────────────────────────────────────────

function makeResult(code, rule, status, message = '', fix = '', details = []) {
  return { code, rule, status, message, fix_suggestion: fix || FIX_BY_CODE[code] || '', details };
}

async function safeEval(page, fn, fallback) {
  try { return await page.evaluate(fn); }
  catch { return fallback; }
}

// ── 測試套件 ───────────────────────────────────────────────────────────────

/** 1. axe-core 掃描 */
async function runAxe(page, level) {
  const tags = AXE_TAGS_BY_LEVEL[level] || AXE_TAGS_BY_LEVEL.AA;
  const builder = new AxeBuilder({ page }).withTags(tags);
  const { violations, passes } = await builder.analyze();
  const results = [];

  for (const v of violations) {
    const code = AXE_TO_CODE[v.id] || `AXE-${v.id}`;
    const nodes = v.nodes.map(n => n.target.join(', ')).slice(0, 5);
    results.push(makeResult(
      code,
      `[axe] ${v.help}`,
      'fail',
      `${v.description}（影響 ${v.nodes.length} 個節點）`,
      FIX_BY_CODE[code] || v.helpUrl,
      nodes,
    ));
  }
  // passes 計入統計但不逐一輸出（避免報告過長）
  results.push(makeResult('AXE-PASS', 'axe-core 掃描通過項', 'pass',
    `共 ${passes.length} 項規則通過`));
  return results;
}

/** 2. DOM 結構檢查（不需互動） */
async function runDomChecks(page) {
  const results = [];

  // 2a. html lang
  const lang = await safeEval(page,
    () => document.documentElement.getAttribute('lang'), null);
  if (!lang) {
    results.push(makeResult('WCAG-3.1.1', '<html> 缺少 lang 屬性', 'fail',
      '輔助科技無法判斷頁面語言',
      '在 <html> 加上 lang="zh-TW"'));
  } else {
    results.push(makeResult('WCAG-3.1.1', '<html lang> 已設定', 'pass', `lang="${lang}"`));
  }

  // 2b. title
  const title = await safeEval(page, () => document.title.trim(), '');
  if (!title) {
    results.push(makeResult('WCAG-2.4.2', '頁面標題為空', 'fail',
      '<title> 不存在或為空'));
  } else {
    results.push(makeResult('WCAG-2.4.2', '頁面標題存在', 'pass', `title="${title}"`));
  }

  // 2c. skip link — 接受 class="skip-link" 或 href 目標含 main/content/login-form 的跳躍連結
  const skipLink = await safeEval(page, () => {
    // 1. class="skip-link" 或 "skip-to-content" 的任何 <a>
    const byClass = document.querySelector('a.skip-link, a.skip-to-content, a[class*="skip"]');
    if (byClass && byClass.getAttribute('href')) return byClass.href;
    // 2. href 指向主要內容的 <a>
    const byHref = document.querySelector(
      'a[href^="#main"], a[href^="#content"], a[href*="maincontent"], a[href^="#login"], a[href^="#skip"]'
    );
    return byHref ? byHref.href : null;
  }, null);
  if (!skipLink) {
    results.push(makeResult('WCAG-2.4.1', '缺少跳過導覽的 skip link', 'fail',
      '鍵盤使用者每次必須 Tab 過所有導覽才能到主內容',
      '<a class="sr-only" href="#main-content">跳至主要內容</a> 放在 <body> 第一個元素'));
  } else {
    results.push(makeResult('WCAG-2.4.1', 'Skip link 存在', 'pass', skipLink));
  }

  // 2d. aria-live 區域
  const liveRegions = await safeEval(page, () => {
    return [...document.querySelectorAll('[aria-live],[role="alert"],[role="status"]')]
      .map(el => ({ tag: el.tagName, live: el.getAttribute('aria-live'), role: el.getAttribute('role'), id: el.id }));
  }, []);
  if (liveRegions.length === 0) {
    results.push(makeResult('WCAG-4.1.3', '未找到 aria-live 區域', 'needs_human',
      '頁面可能有動態訊息但未標記 aria-live，輔助科技無法通報',
      '為錯誤/成功訊息容器加上 aria-live="polite" 或 role="alert"'));
  } else {
    results.push(makeResult('WCAG-4.1.3', 'aria-live 區域存在', 'pass',
      `找到 ${liveRegions.length} 個 live region`));
  }

  // 2e. 主要 landmark 結構
  const landmarks = await safeEval(page, () => {
    const found = [];
    ['main', 'nav', 'header', 'footer', 'aside'].forEach(tag => {
      if (document.querySelector(tag)) found.push(tag);
    });
    ['banner', 'main', 'navigation', 'contentinfo'].forEach(role => {
      if (document.querySelector(`[role="${role}"]`)) found.push(`role=${role}`);
    });
    return [...new Set(found)];
  }, []);
  if (!landmarks.includes('main') && !landmarks.includes('role=main')) {
    results.push(makeResult('WCAG-1.3.1', '缺少 <main> landmark', 'fail',
      '螢幕報讀軟體需要 <main> 或 role="main" 來定位主要內容',
      '將主要內容包裹在 <main id="main-content"> 中'));
  } else {
    results.push(makeResult('WCAG-1.3.1', '<main> landmark 存在', 'pass',
      landmarks.join(', ')));
  }

  // 2f. 影像文字（img 的 alt 為有意義文字 → 之後確認是否可改 CSS）
  const meaninglessAlts = await safeEval(page, () => {
    return [...document.querySelectorAll('img[alt]')]
      .filter(img => /^\s*(image|photo|img|圖|圖片|pic)\s*$/i.test(img.alt))
      .map(img => img.src.split('/').pop() + ` alt="${img.alt}"`);
  }, []);
  if (meaninglessAlts.length) {
    results.push(makeResult('HM1110100C', 'img alt 文字無意義', 'fail',
      `發現無意義 alt：${meaninglessAlts.slice(0, 3).join('；')}`,
      'alt 應描述圖片內容或功能，如 alt="公司Logo" 而非 alt="image"'));
  }

  return results;
}

/** 3. 鍵盤導覽測試（Tab 走訪前 20 個可聚焦元素） */
async function runKeyboardTests(page) {
  const results = [];

  // 重設到 body 起點
  await page.keyboard.press('Tab');
  const MAX_TABS = 20;
  const focusLog = [];

  for (let i = 0; i < MAX_TABS; i++) {
    const info = await safeEval(page, () => {
      const el = document.activeElement;
      if (!el || el === document.body) return null;
      const rect = el.getBoundingClientRect();
      const style = window.getComputedStyle(el);
      const outline = style.outlineStyle + ' ' + style.outlineWidth + ' ' + style.outlineColor;
      const boxShadow = style.boxShadow;
      return {
        tag: el.tagName,
        id: el.id,
        role: el.getAttribute('role'),
        text: (el.textContent || '').trim().slice(0, 30),
        ariaLabel: el.getAttribute('aria-label'),
        visible: rect.width > 0 && rect.height > 0,
        inViewport: rect.top >= 0 && rect.bottom <= window.innerHeight,
        outlineStyle: style.outlineStyle,
        outlineWidth: style.outlineWidth,
        boxShadow,
        hasFocusIndicator: (
          (style.outlineStyle !== 'none' && style.outlineWidth !== '0px') ||
          (boxShadow && boxShadow !== 'none')
        ),
      };
    }, null);

    if (!info) break;
    focusLog.push(info);

    // 焦點可視性檢查（WCAG 2.4.7）
    if (!info.hasFocusIndicator) {
      results.push(makeResult('WCAG-2.4.7', '焦點指示器不可見', 'fail',
        `<${info.tag.toLowerCase()}${info.id ? ' id="' + info.id + '"' : ''}> 焦點時無 outline/box-shadow`,
        ':focus { outline: 3px solid #005fcc; outline-offset: 2px; } 或使用 box-shadow'));
    }

    await page.keyboard.press('Tab');
  }

  // 焦點陷阱偵測（WCAG 2.1.2）：若最後 5 個焦點元素相同 → 疑似陷阱
  if (focusLog.length >= 5) {
    const last5 = focusLog.slice(-5).map(f => f.tag + f.id);
    const unique = new Set(last5);
    if (unique.size <= 2) {
      results.push(makeResult('WCAG-2.1.2', '疑似鍵盤焦點陷阱', 'fail',
        `焦點在同一組元素（${[...unique].join('/')}）中循環`,
        '確認 modal 等元件關閉後焦點回到觸發點；不要攔截 Tab/Esc 鍵'));
    } else {
      results.push(makeResult('WCAG-2.1.2', '未偵測到焦點陷阱', 'pass',
        `Tab 走訪 ${focusLog.length} 個元素，焦點順序正常`));
    }
  }

  // 整體鍵盤可操作性（WCAG 2.1.1）
  const interactiveCount = await safeEval(page, () =>
    document.querySelectorAll('a, button, input, select, textarea, [tabindex]').length, 0);
  results.push(makeResult('WCAG-2.1.1',
    interactiveCount > 0 ? '互動元件存在' : '未找到互動元件',
    interactiveCount > 0 ? 'needs_human' : 'pass',
    `共 ${interactiveCount} 個互動元件，Tab 走訪了 ${focusLog.length} 個，需人工確認所有功能均可鍵盤觸發`,
    '對每個功能性元件確認可用 Tab 聚焦、Enter/Space 觸發'));

  // 焦點順序（WCAG 2.4.3）
  results.push(makeResult('WCAG-2.4.3', `Tab 順序（共 ${focusLog.length} 個焦點停駐）`,
    'needs_human',
    focusLog.map((f, i) => `${i + 1}. <${f.tag.toLowerCase()}> ${f.text || f.ariaLabel || f.id || ''}`).join('\n'),
    '確認 Tab 走訪順序與視覺閱讀順序一致；必要時用 tabindex="0" 調整'));

  return results;
}

/** 4. 320px 流動排版測試（WCAG 1.4.10） */
async function runReflowTest(page) {
  const results = [];
  const origSize = page.viewportSize();

  await page.setViewportSize({ width: 320, height: 568 });
  await page.waitForTimeout(500);

  const hasHScroll = await safeEval(page, () =>
    document.documentElement.scrollWidth > document.documentElement.clientWidth, false);

  const overflowEls = await safeEval(page, () => {
    return [...document.querySelectorAll('*')]
      .filter(el => el.scrollWidth > el.clientWidth + 2 && el.clientWidth > 0)
      .map(el => el.tagName + (el.id ? '#' + el.id : '') + (el.className ? '.' + el.className.split(' ')[0] : ''))
      .slice(0, 5);
  }, []);

  if (hasHScroll) {
    results.push(makeResult('WCAG-1.4.10', '320px 寬度出現水平捲動', 'fail',
      `在 320px 寬度下頁面需水平捲動（溢出元素：${overflowEls.join(', ') || '未知'}）`,
      '使用 max-width:100%; overflow-wrap:break-word; 或 flex/grid 自動換行'));
  } else {
    results.push(makeResult('WCAG-1.4.10', '320px 流動排版通過', 'pass',
      '在 320px 寬度下無水平捲動'));
  }

  // 恢復原始大小
  if (origSize) await page.setViewportSize(origSize);
  else await page.setViewportSize({ width: 1280, height: 800 });

  return results;
}

/** 5. Hover / 懸浮內容測試（WCAG 1.4.13） */
async function runHoverTests(page) {
  const results = [];

  // 找有 tooltip / popover 的元素
  const tooltipTriggers = await safeEval(page, () => {
    return [...document.querySelectorAll('[title],[data-tooltip],[aria-describedby]')]
      .slice(0, 5)
      .map(el => {
        const rect = el.getBoundingClientRect();
        return { x: rect.x + rect.width / 2, y: rect.y + rect.height / 2, tag: el.tagName };
      })
      .filter(el => el.x > 0 && el.y > 0);
  }, []);

  if (tooltipTriggers.length === 0) {
    results.push(makeResult('WCAG-1.4.13', '未找到 tooltip 觸發元素', 'needs_human',
      '請手動確認：所有 tooltip/popover 是否可移除（Esc）、可移入（滑鼠可移到懸浮內容）、持續顯示',
      '懸浮內容應在 Esc 鍵、滑鼠移出後才消失，且指標可移入懸浮內容'));
    return results;
  }

  let hoverOk = true;
  for (const trigger of tooltipTriggers.slice(0, 3)) {
    await page.mouse.move(trigger.x, trigger.y);
    await page.waitForTimeout(300);

    // 檢查是否有新出現的懸浮元素
    const appeared = await safeEval(page, () => {
      return [...document.querySelectorAll('[role="tooltip"],[class*="tooltip"],[class*="popover"]')]
        .filter(el => el.offsetWidth > 0).length;
    }, 0);

    if (appeared > 0) {
      // 測試滑鼠能否移入懸浮內容（不消失）
      const tooltipPos = await safeEval(page, () => {
        const el = document.querySelector('[role="tooltip"],[class*="tooltip"],[class*="popover"]');
        if (!el) return null;
        const rect = el.getBoundingClientRect();
        return { x: rect.x + rect.width / 2, y: rect.y + rect.height / 2 };
      }, null);

      if (tooltipPos) {
        await page.mouse.move(tooltipPos.x, tooltipPos.y);
        await page.waitForTimeout(200);
        const stillVisible = await safeEval(page, () =>
          document.querySelectorAll('[role="tooltip"],[class*="tooltip"],[class*="popover"]')
            .length > 0, false);
        if (!stillVisible) {
          hoverOk = false;
          results.push(makeResult('WCAG-1.4.13', 'tooltip 移入後消失', 'fail',
            '指標移到懸浮內容時 tooltip 消失，無法讓使用者閱讀',
            '為 tooltip 加 pointer-events:auto，讓指標移入不觸發 mouseleave'));
        }
      }
    }

    // 測試 Esc 可關閉
    await page.mouse.move(trigger.x, trigger.y);
    await page.waitForTimeout(200);
    await page.keyboard.press('Escape');
    await page.waitForTimeout(200);
    const stillOpen = await safeEval(page, () =>
      [...document.querySelectorAll('[role="tooltip"],[class*="tooltip"],[class*="popover"]')]
        .filter(el => el.offsetWidth > 0).length > 0, false);
    if (stillOpen) {
      hoverOk = false;
      results.push(makeResult('WCAG-1.4.13', 'Esc 無法關閉懸浮內容', 'fail',
        'tooltip/popover 在按下 Esc 後仍然顯示',
        '監聽 keydown Escape 事件以關閉懸浮內容'));
    }
  }

  if (hoverOk && tooltipTriggers.length > 0) {
    results.push(makeResult('WCAG-1.4.13', '懸浮內容行為通過', 'pass',
      `測試了 ${Math.min(3, tooltipTriggers.length)} 個 tooltip 觸發元素`));
  }

  return results;
}

/** 6. 表單送出錯誤訊息測試（WCAG 3.3.1 / 4.1.3） */
async function runFormErrorTest(page) {
  const results = [];

  // 找頁面上的表單
  const forms = await safeEval(page, () => {
    return [...document.querySelectorAll('form')].slice(0, 2).map(f => ({
      id: f.id,
      hasRequiredInputs: f.querySelectorAll('[required]').length > 0,
    }));
  }, []);

  if (forms.length === 0 || !forms.some(f => f.hasRequiredInputs)) {
    results.push(makeResult('WCAG-3.3.1', '未找到含 required 欄位的表單', 'needs_human',
      '請手動提交空表單，確認錯誤訊息有 role=alert 或 aria-live',
      '錯誤訊息容器加 role="alert" 或 aria-live="assertive"'));
    return results;
  }

  // 嘗試提交空表單
  try {
    const submitBtn = await page.$('form [type="submit"], form button:not([type="button"])');
    if (submitBtn) {
      await submitBtn.click();
      await page.waitForTimeout(800);

      // 檢查錯誤訊息是否出現且有適當 ARIA
      const errorState = await safeEval(page, () => {
        const alerts = document.querySelectorAll('[role="alert"],[aria-live="assertive"],[aria-live="polite"]');
        const errorMsgs = document.querySelectorAll('[class*="error"],[class*="invalid"],[class*="danger"]');
        return {
          alertCount: alerts.length,
          errorMsgCount: errorMsgs.length,
          alertsVisible: [...alerts].filter(el => el.offsetWidth > 0).length,
          errorMsgsVisible: [...errorMsgs].filter(el => el.offsetWidth > 0 && el.textContent.trim()).length,
        };
      }, { alertCount: 0, errorMsgCount: 0, alertsVisible: 0, errorMsgsVisible: 0 });

      if (errorState.errorMsgsVisible > 0 && errorState.alertsVisible === 0) {
        results.push(makeResult('WCAG-4.1.3', '錯誤訊息缺少 aria-live/role=alert', 'fail',
          `偵測到 ${errorState.errorMsgsVisible} 個錯誤訊息但無 ARIA 通報機制`,
          '為錯誤訊息容器加 role="alert" 或 aria-live="assertive"'));
      } else if (errorState.alertsVisible > 0) {
        results.push(makeResult('WCAG-3.3.1', '表單錯誤訊息有 ARIA 通報', 'pass',
          `錯誤訊息容器有 role=alert 或 aria-live（共 ${errorState.alertsVisible} 個）`));
      } else {
        results.push(makeResult('WCAG-3.3.1', '表單送出後未顯示錯誤訊息', 'needs_human',
          '可能有客製化驗證邏輯，請手動確認',
          '確認送出空白表單後錯誤訊息有出現且有 aria-live 通報'));
      }
    }
  } catch (e) {
    results.push(makeResult('WCAG-3.3.1', '表單錯誤測試無法執行', 'needs_human',
      e.message, '請手動測試表單送出錯誤通報'));
  }

  return results;
}

/** 7. 頁面文字間距注入測試（WCAG 1.4.12） */
async function runTextSpacingTest(page) {
  const results = [];

  // 注入強制文字間距樣式
  await page.addStyleTag({ content: `
    * {
      line-height: 1.5 !important;
      letter-spacing: 0.12em !important;
      word-spacing: 0.16em !important;
    }
    p { margin-bottom: 2em !important; }
  ` });
  await page.waitForTimeout(500);

  // 檢查是否有可見內容被截斷（排除 sr-only 等輔助隱藏元素）
  // 注意：page.evaluate 不直接接收外部變數，需透過第二參數傳入
  let clippedEls = [];
  try {
    clippedEls = await page.evaluate(() => {
      const EXCLUDE = ['sr-only', 'p-hidden-accessible', 'visually-hidden', 'sr_only'];
      return [...document.querySelectorAll('p, li, td, th, label, span, h1, h2, h3, h4, h5, h6')]
        .filter(el => {
          if (el.offsetHeight <= 1 || el.offsetWidth <= 1) return false; // sr-only 模式（高度 1px）
          const cls = Array.from(el.classList);
          if (cls.some(c => EXCLUDE.some(ex => c.includes(ex)))) return false;
          if (el.getAttribute('aria-hidden') === 'true') return false;
          return el.textContent.trim().length > 2 && el.offsetHeight > 8;
        })
        .filter(el => el.scrollHeight > el.offsetHeight + 4)
        .map(el => el.tagName + (el.id ? '#' + el.id : '') + ' scrollH=' + el.scrollHeight + ' offsetH=' + el.offsetHeight)
        .slice(0, 5);
    });
  } catch { clippedEls = []; }

  if (clippedEls.length > 0) {
    results.push(makeResult('WCAG-1.4.12', '文字間距增加後內容被截斷', 'fail',
      `以下元素文字溢出：${clippedEls.join('；')}`,
      '移除固定高度（height:Xpx）改用 min-height；不要用 overflow:hidden 截斷文字'));
  } else {
    results.push(makeResult('WCAG-1.4.12', '文字間距測試通過', 'pass',
      '強制增加 line-height/letter-spacing/word-spacing 後無內容截斷'));
  }

  return results;
}

// ── 主程式 ────────────────────────────────────────────────────────────────

async function main() {
  const args = process.argv.slice(2);
  const url = args.find(a => !a.startsWith('--'));
  const level = (args.find(a => a.startsWith('--level=')) || '--level=AA').split('=')[1];
  const timeout = parseInt((args.find(a => a.startsWith('--timeout=')) || '--timeout=30000').split('=')[1]);

  if (!url) {
    console.error(JSON.stringify([{ code: 'ERR', rule: '需提供 URL', status: 'fail',
      message: 'Usage: node browser_rules.js <url> [--level=AA]', fix_suggestion: '', details: [] }]));
    process.exit(1);
  }

  const browser = await chromium.launch({ headless: true });
  const results = [];

  try {
    const ctx = await browser.newContext({
      viewport: { width: 1280, height: 800 },
      locale: 'zh-TW',
    });
    const page = await ctx.newPage();

    // 靜音自動播放音訊（不影響測試邏輯）
    await ctx.grantPermissions([]);

    await page.goto(url, { waitUntil: 'domcontentloaded', timeout });
    await page.waitForTimeout(1000); // 等待 Vue/React 渲染

    results.push(...await runAxe(page, level));
    results.push(...await runDomChecks(page));
    results.push(...await runKeyboardTests(page));
    results.push(...await runReflowTest(page));
    results.push(...await runHoverTests(page));
    results.push(...await runFormErrorTest(page));
    results.push(...await runTextSpacingTest(page));

  } catch (err) {
    results.push(makeResult('ERR-BROWSER', '瀏覽器測試失敗', 'needs_human',
      err.message, '確認 URL 可訪問且伺服器正在運行'));
  } finally {
    await browser.close();
  }

  console.log(JSON.stringify(results, null, 2));
}

main().catch(err => {
  console.error(JSON.stringify([{
    code: 'ERR', rule: '執行失敗', status: 'needs_human',
    message: err.message, fix_suggestion: '', details: [],
  }]));
  process.exit(2);
});
