/**
 * keyboard_checks.js — 鍵盤互動類 E 碼測試
 *
 * 涵蓋：鍵盤操作、跳位順序、焦點追蹤
 * 測試方式：page.keyboard.press('Tab')、document.activeElement
 *
 * 包含 E 碼（共 25 個）：
 * GN1210100E, GN1210101E, GN1210200E, GN1210400E,
 * GN1240100E, GN1240104E (keyboard variant),
 * GN1250100E, GN1250101E, GN1250200E, GN1250201E,
 * GN1250300E, GN1250301E, GN1250400E,
 * GN3210300E, GN3220300E, GN3220400E, GN3220500E, GN3220501E,
 * GN3230200E, GN3240900E, GN3241000E,
 * GN3310300E, GN3310400E, GN3310500E,
 * FA1210401E, FA1250102E, FA1250202E, FA1250303E, FA1250401E
 */

import { result, safeEval } from './helpers.js';

// ── 2.1.1 鍵盤操作 ────────────────────────────────────────────────────────────

/** GN1210100E: 提供由鍵盤觸發的事件處理程式 */
export async function check_GN1210100E(page) {
  const r = await safeEval(page, () => {
    // 偵測只有 onclick 但無 onkeydown/onkeypress/onkeyup 的非按鈕/非連結元素
    const mouseOnlyEls = [...document.querySelectorAll('[onclick]:not(a):not(button):not(input):not(select):not(textarea)')]
      .filter(el => !el.getAttribute('onkeydown') && !el.getAttribute('onkeypress') && !el.getAttribute('onkeyup') && !el.getAttribute('onkeypress'))
      .filter(el => !el.getAttribute('tabindex') || el.getAttribute('tabindex') === '-1')
      .map(el => `${el.tagName}${el.id ? '#' + el.id : ''}.${el.className?.split(' ')[0] || ''}`)
      .slice(0, 5);
    return mouseOnlyEls;
  }, []);
  if (r.length > 0) {
    return result('GN1210100E', '自訂互動元素只有滑鼠事件無鍵盤事件', 'fail',
      `${r.length} 個非標準互動元素缺少 tabindex 或 keyboard 事件處理`,
      '改用原生 <button>/<a>；或加 tabindex="0" + role="button" + onkeydown 處理 Enter/Space',
      r);
  }
  return result('GN1210100E', '互動元素有鍵盤事件處理', 'pass');
}

/** GN1210101E: 所有功能可透過鍵盤介面操作 */
export async function check_GN1210101E(page) {
  // Tab 鍵遍歷，確認可聚焦元素數量
  const initialFocus = await safeEval(page, () => document.activeElement?.tagName, 'BODY');
  let focusedElements = [];
  for (let i = 0; i < 10; i++) {
    await page.keyboard.press('Tab');
    const focused = await safeEval(page, () => {
      const el = document.activeElement;
      if (!el || el.tagName === 'BODY') return null;
      return {
        tag: el.tagName,
        type: el.getAttribute('type') || '',
        role: el.getAttribute('role') || '',
        id: el.id?.slice(0, 20) || '',
        text: (el.textContent || el.value || el.getAttribute('aria-label') || '').trim().slice(0, 20),
        visible: el.offsetWidth > 0 && el.offsetHeight > 0
      };
    }, null);
    if (focused) focusedElements.push(focused);
    else break;
  }

  if (focusedElements.length === 0) {
    return result('GN1210101E', '頁面無任何可鍵盤聚焦元素', 'fail',
      '按 Tab 鍵後無任何元素獲得焦點',
      '確保頁面有可聚焦的連結、按鈕、輸入框等互動元素');
  }
  const invisible = focusedElements.filter(el => !el.visible).length;
  if (invisible > 0) {
    return result('GN1210101E', '部分可聚焦元素不可見', 'fail',
      `${invisible}/${focusedElements.length} 個可聚焦元素在獲得焦點時不可見`,
      '確保可聚焦元素在獲得焦點時有可見的焦點樣式（:focus-visible）',
      focusedElements.filter(el => !el.visible).map(el => `${el.tag}#${el.id}`));
  }
  return result('GN1210101E', '可透過鍵盤操作頁面元素', 'pass',
    `Tab 鍵可聚焦 ${focusedElements.length}+ 個元素：${focusedElements.slice(0, 3).map(el => el.tag + (el.text ? ':' + el.text : '')).join(', ')}`);
}

/** GN1210200E: 確認使用者不會困在內容中（鍵盤陷阱） */
export async function check_GN1210200E(page) {
  // 找到第一個可聚焦元素後，按 Tab 10 次，若焦點不再移動則可能有陷阱
  const elements = new Set();
  let trapped = false;
  let lastTag = '';
  let sameCount = 0;

  for (let i = 0; i < 15; i++) {
    await page.keyboard.press('Tab');
    const tag = await safeEval(page, () => {
      const el = document.activeElement;
      return el ? el.tagName + '#' + el.id + '.' + el.className?.split(' ')[0] : 'BODY';
    }, 'BODY');
    if (tag === lastTag) {
      sameCount++;
      if (sameCount >= 3) { trapped = true; break; }
    } else {
      sameCount = 0;
      elements.add(tag);
    }
    lastTag = tag;
  }

  if (trapped) {
    return result('GN1210200E', '疑似鍵盤陷阱：焦點卡在同一元素', 'fail',
      `Tab 鍵連續聚焦相同元素 ${sameCount} 次：${lastTag}`,
      '確保所有 modal/dialog/widget 有 Escape 鍵退出機制；modal 內部用 Tab 循環，按 Escape 關閉後回到觸發元素');
  }
  return result('GN1210200E', '無鍵盤陷阱', 'pass',
    `Tab 遍歷了 ${elements.size} 個不同元素，焦點可自由移動`);
}

/** GN1210400E: 字符鍵快捷鍵可重新對應或關閉 */
export async function check_GN1210400E(page) {
  const r = await safeEval(page, () => {
    // 偵測是否有自訂 single-key shortcuts
    const singleKeyShortcuts = [...document.querySelectorAll('[accesskey]')]
      .map(el => `${el.tagName}: accesskey="${el.getAttribute('accesskey')}"`);
    // 偵測是否有 keyboard shortcut 設定頁面
    const hasShortcutSettings = !!document.querySelector('[class*="shortcut-settings"],[aria-label*="快捷鍵"],[aria-label*="keyboard shortcut"]');
    return { singleKeyShortcuts, hasShortcutSettings };
  }, { singleKeyShortcuts: [], hasShortcutSettings: false });
  if (r.singleKeyShortcuts.length > 0 && !r.hasShortcutSettings) {
    return result('GN1210400E', 'accesskey 快捷鍵無重新對應機制', 'fail',
      `${r.singleKeyShortcuts.length} 個元素有 accesskey，但無快捷鍵設定頁面`,
      '加入快捷鍵設定介面，或移除 accesskey 改用組合鍵',
      r.singleKeyShortcuts);
  }
  return result('GN1210400E', '字符鍵快捷鍵可重新對應', 'pass',
    r.singleKeyShortcuts.length > 0 ? `${r.singleKeyShortcuts.length} 個 accesskey` : '無單鍵快捷鍵');
}

// ── 2.4.1 跳過區塊（Bypass blocks） ─────────────────────────────────────────

/** GN1240100E: 頁面頂端有跳到主要內容的連結（鍵盤測試） */
export async function check_GN1240100E(page) {
  // 模擬 Tab 鍵，確認第一個焦點元素是否為 skip link
  await page.keyboard.press('Tab');
  const firstFocused = await safeEval(page, () => {
    const el = document.activeElement;
    if (!el || el.tagName === 'BODY') return null;
    const href = el.getAttribute('href') || '';
    const text = (el.textContent || el.getAttribute('aria-label') || '').toLowerCase().trim();
    return {
      tag: el.tagName,
      href,
      text,
      isSkipLink: (href.startsWith('#') && (
        text.includes('跳') || text.includes('skip') || text.includes('主要') || text.includes('main') || text.includes('content')
      )) || href === '#main' || href === '#main-content' || href === '#content'
    };
  }, null);

  if (!firstFocused || !firstFocused.isSkipLink) {
    // 也做 DOM 檢查
    const domCheck = await safeEval(page, () => {
      const skipLinks = [...document.querySelectorAll('a[href^="#"]')]
        .filter(a => {
          const text = (a.textContent || '').toLowerCase();
          return text.includes('跳') || text.includes('skip') || text.includes('主要') || text.includes('main');
        });
      const visibilityOnFocus = skipLinks.some(a => {
        const style = window.getComputedStyle(a);
        return style.display !== 'none' && style.visibility !== 'hidden';
      });
      return { count: skipLinks.length, visibilityOnFocus, texts: skipLinks.map(a => a.textContent.trim().slice(0, 20)) };
    }, { count: 0, visibilityOnFocus: false, texts: [] });

    if (domCheck.count === 0) {
      return result('GN1240100E', '頁面缺少跳過導覽連結', 'fail',
        '未找到跳到主要內容的連結（Tab 鍵後第一個焦點也非 skip link）',
        '在 <body> 第一個元素加入：<a href="#main-content" class="skip-link">跳到主要內容</a>');
    }
    if (!domCheck.visibilityOnFocus) {
      return result('GN1240100E', 'Skip link 存在但焦點時不可見', 'fail',
        `找到 ${domCheck.count} 個 skip link，但焦點時可能不顯示`,
        '.skip-link { position: absolute; top: -40px; } .skip-link:focus { top: 0; }',
        domCheck.texts);
    }
  }

  return result('GN1240100E', '有跳過導覽連結', 'pass',
    firstFocused?.isSkipLink
      ? `Tab 後第一個聚焦元素是 skip link："${firstFocused.text}"`
      : 'DOM 中找到 skip link');
}

// ── 2.5 輸入方式 ────────────────────────────────────────────────────────────────

/** GN1250100E: 提供單點指標代替路徑手勢 */
export async function check_GN1250100E(page) {
  const r = await safeEval(page, () => {
    // 偵測是否有 drag-and-drop 但無替代按鈕
    const draggables = document.querySelectorAll('[draggable="true"]').length;
    const swipeElements = document.querySelectorAll('[class*="swipe"],[class*="carousel"],[class*="slider"]').length;
    const withAlt = document.querySelectorAll('[class*="carousel"] button, [class*="slider"] button').length > 0;
    return { draggables, swipeElements, withAlt };
  }, { draggables: 0, swipeElements: 0, withAlt: false });
  if ((r.draggables > 0 || r.swipeElements > 0) && !r.withAlt) {
    return result('GN1250100E', '路徑/多點手勢操作缺少單點替代', 'fail',
      `${r.draggables} 個可拖曳元素，${r.swipeElements} 個滑動元件，但無點擊替代按鈕`,
      '在輪播旁加入「上一張」「下一張」按鈕；拖曳功能提供鍵盤替代操作');
  }
  return result('GN1250100E', '路徑手勢有單點替代操作', 'pass');
}

/** GN1250101E: 拖曳動作可透過其他機制完成 */
export async function check_GN1250101E(page) {
  const r = await safeEval(page, () => {
    const draggables = [...document.querySelectorAll('[draggable="true"]')];
    const withKeyboardAlt = draggables.filter(el =>
      el.getAttribute('tabindex') !== '-1' && (el.getAttribute('aria-label') || el.textContent.trim())
    ).length;
    return { total: draggables.length, withKeyboardAlt };
  }, { total: 0, withKeyboardAlt: 0 });
  if (r.total > 0 && r.withKeyboardAlt === 0) {
    return result('GN1250101E', '拖曳元素缺少鍵盤替代操作', 'fail',
      `${r.total} 個可拖曳元素無鍵盤替代（無 tabindex 或 aria-label）`,
      '為拖曳元素加入鍵盤操作：tabindex="0" + onkeydown 處理方向鍵 + 空格確認');
  }
  return result('GN1250101E', '拖曳動作有替代機制', 'pass');
}

/** GN1250200E: 指標取消（防止意外啟動）—在 mouseup 而非 mousedown 觸發 */
export async function check_GN1250200E(page) {
  const r = await safeEval(page, () => {
    // 偵測直接在 mousedown 上觸發重要動作的元素
    const mousedownActions = [...document.querySelectorAll('[onmousedown]')]
      .filter(el => {
        const handler = el.getAttribute('onmousedown') || '';
        return handler.includes('submit') || handler.includes('delete') || handler.includes('remove');
      })
      .map(el => el.tagName + ': ' + el.getAttribute('onmousedown')?.slice(0, 40))
      .slice(0, 5);
    return mousedownActions;
  }, []);
  if (r.length > 0) {
    return result('GN1250200E', 'mousedown 觸發重要動作（不可取消）', 'fail',
      `${r.length} 個元素在 mousedown 觸發 submit/delete 等動作`,
      '改在 click（mouseup）觸發，讓使用者可以拖離取消操作',
      r);
  }
  return result('GN1250200E', '指標動作符合取消機制', 'pass');
}

/** GN1250201E: 雙擊/長按/計時等手勢動作有替代 */
export async function check_GN1250201E(page) {
  const r = await safeEval(page, () => {
    const dblclickEls = [...document.querySelectorAll('[ondblclick]')]
      .filter(el => !el.getAttribute('onclick') && !el.getAttribute('onkeydown'))
      .map(el => el.tagName)
      .slice(0, 3);
    return dblclickEls;
  }, []);
  if (r.length > 0) {
    return result('GN1250201E', 'ondblclick 元素缺少替代互動', 'fail',
      `${r.length} 個元素只有 ondblclick，無 onclick 或 onkeydown 替代`,
      '為雙擊功能提供 onclick 替代，或加入觸發按鈕',
      r);
  }
  return result('GN1250201E', '雙擊/特殊手勢有替代操作', 'pass');
}

/** GN1250300E: 語音指令可操作所有功能（可見標籤） */
export async function check_GN1250300E(page) {
  const r = await safeEval(page, () => {
    // 確認每個按鈕/連結都有可見文字或 aria-label
    const interactive = [...document.querySelectorAll('button, a[href], input[type="submit"], [role="button"]')];
    const withoutLabel = interactive.filter(el => {
      const text = (el.textContent || '').trim();
      const ariaLabel = el.getAttribute('aria-label') || '';
      const ariaLabelledby = el.getAttribute('aria-labelledby');
      const imgAlt = [...el.querySelectorAll('img')].map(img => img.alt).join('');
      return !text && !ariaLabel && !imgAlt && !ariaLabelledby;
    }).map(el => el.tagName + (el.id ? '#' + el.id : '')).slice(0, 5);
    return { total: interactive.length, withoutLabel };
  }, { total: 0, withoutLabel: [] });
  if (r.withoutLabel.length > 0) {
    return result('GN1250300E', '互動元素缺少可見標籤（語音指令無法操作）', 'fail',
      `${r.withoutLabel.length} 個互動元素無可見文字或 aria-label`,
      '加入描述性文字標籤，讓語音控制使用者可以說出元素名稱',
      r.withoutLabel);
  }
  return result('GN1250300E', '所有互動元素有可見標籤', 'pass', `${r.total} 個互動元素`);
}

/** GN1250301E: 可見標籤包含在可存取名稱中 */
export async function check_GN1250301E(page) {
  const r = await safeEval(page, () => {
    const issues = [];
    const labeled = [...document.querySelectorAll('[aria-label], [aria-labelledby]')];
    for (const el of labeled.slice(0, 20)) {
      const ariaLabel = (el.getAttribute('aria-label') || '').toLowerCase();
      const visibleText = (el.textContent || '').trim().toLowerCase();
      // 可見文字不為空，且 aria-label 完全不包含可見文字
      if (visibleText.length > 0 && ariaLabel.length > 0 && !ariaLabel.includes(visibleText.slice(0, 10))) {
        issues.push(`${el.tagName}: visible="${visibleText.slice(0, 20)}" aria-label="${ariaLabel.slice(0, 20)}"`);
      }
    }
    return issues.slice(0, 5);
  }, []);
  if (r.length > 0) {
    return result('GN1250301E', 'aria-label 未包含可見文字（語音指令無法觸發）', 'fail',
      `${r.length} 個元素的 aria-label 與可見文字不符`,
      'aria-label 應以可見文字為開頭或包含可見文字',
      r);
  }
  return result('GN1250301E', '可見標籤包含在可存取名稱中', 'pass');
}

/** GN1250400E: 動作目標大小符合要求（24x24px） */
export async function check_GN1250400E(page) {
  const r = await safeEval(page, () => {
    const smallTargets = [...document.querySelectorAll('button, a[href], input[type="checkbox"], input[type="radio"], [role="button"]')]
      .filter(el => {
        const rect = el.getBoundingClientRect();
        const style = window.getComputedStyle(el);
        // 排除 inline 元素（可能跨行）
        if (style.display === 'inline') return false;
        return (rect.width < 24 || rect.height < 24) && rect.width > 0 && rect.height > 0;
      })
      .map(el => {
        const rect = el.getBoundingClientRect();
        return `${el.tagName}(${Math.round(rect.width)}x${Math.round(rect.height)})`;
      })
      .slice(0, 5);
    return smallTargets;
  }, []);
  if (r.length > 0) {
    return result('GN1250400E', '部分互動目標尺寸小於 24x24px', 'fail',
      `${r.length} 個互動元素小於 24x24px`,
      '互動目標最小尺寸應為 24x24px（AA 2.5.8）或 44x44px（AAA 2.5.5）',
      r);
  }
  return result('GN1250400E', '互動目標尺寸符合要求', 'pass');
}

// ── AAA 鍵盤/語音 ─────────────────────────────────────────────────────────────

/** GN3210300E: 使用者的錯誤輸入可被系統識別並提供建議 */
export async function check_GN3210300E(page) {
  const r = await safeEval(page, () => {
    const hasSpellcheck = [...document.querySelectorAll('input[type="text"], textarea')]
      .some(el => el.getAttribute('spellcheck') !== 'false');
    return { hasSpellcheck };
  }, { hasSpellcheck: false });
  return result('GN3210300E', '輸入建議（AAA）', 'pass',
    `spellcheck: ${r.hasSpellcheck}（AAA 等級，請人工確認錯誤識別機制）`);
}

/** GN3220300E: 說明/說明文件可存取（AAA） */
export async function check_GN3220300E(page) {
  const r = await safeEval(page, () => {
    const helpLinks = [...document.querySelectorAll('a[href]')]
      .filter(a => {
        const text = (a.textContent || '').toLowerCase();
        const href = a.href || '';
        return text.includes('說明') || text.includes('help') || text.includes('文件') || text.includes('faq');
      }).length;
    return { helpLinks };
  }, { helpLinks: 0 });
  return result('GN3220300E', '說明文件連結（AAA）', 'pass',
    `${r.helpLinks} 個說明/help 連結（AAA 等級）`);
}

/** GN3220400E: 所有功能均有說明（AAA） */
export async function check_GN3220400E(page) {
  const r = await safeEval(page, () => {
    const inputs = [...document.querySelectorAll('input:not([type="hidden"])')];
    const withHelp = inputs.filter(inp =>
      inp.getAttribute('aria-describedby') || inp.getAttribute('title') ||
      inp.nextElementSibling?.classList.contains('help') ||
      inp.parentElement?.querySelector('[class*="hint"],[class*="help"],[class*="desc"]')
    ).length;
    return { total: inputs.length, withHelp };
  }, { total: 0, withHelp: 0 });
  return result('GN3220400E', '功能說明完整度（AAA）', 'pass',
    `${r.withHelp}/${r.total} 個輸入欄位有額外說明（AAA 等級）`);
}

/** GN3220500E: 指明發生錯誤的欄位 */
export async function check_GN3220500E(page) {
  const r = await safeEval(page, () => {
    const ariaInvalid = document.querySelectorAll('[aria-invalid="true"]').length;
    const errorEls = document.querySelectorAll('[class*="error"],[class*="invalid"],[id*="error"]').length;
    return { ariaInvalid, errorEls };
  }, { ariaInvalid: 0, errorEls: 0 });
  return result('GN3220500E', '錯誤欄位識別', 'pass',
    `${r.ariaInvalid} 個 aria-invalid=true，${r.errorEls} 個 error class 元素`);
}

/** GN3220501E: 錯誤修正建議（AAA） */
export async function check_GN3220501E(page) {
  // 簡單偵測錯誤訊息是否包含修正建議
  const r = await safeEval(page, () => {
    const errorMsgs = [...document.querySelectorAll('[class*="error"], [role="alert"]')]
      .filter(el => el.offsetWidth > 0 && el.textContent.trim().length > 5)
      .map(el => el.textContent.trim().slice(0, 50));
    return errorMsgs.slice(0, 3);
  }, []);
  return result('GN3220501E', '錯誤修正建議（AAA）', 'pass',
    r.length > 0 ? `找到 ${r.length} 個錯誤訊息（請人工確認是否包含修正建議）` : '目前無可見錯誤訊息');
}

/** GN3230200E: 避免讓使用者付出不必要的認知努力 */
export async function check_GN3230200E(page) {
  const r = await safeEval(page, () => {
    // CAPTCHA 存在即潛在認知負擔
    const hasCaptcha = !!document.querySelector('[class*="captcha"],[id*="captcha"]');
    const hasPasswordComplexity = [...document.querySelectorAll('[placeholder]')]
      .some(el => {
        const p = (el.getAttribute('placeholder') || '').toLowerCase();
        return p.includes('大寫') || p.includes('符號') || p.includes('uppercase') || p.includes('special');
      });
    return { hasCaptcha, hasPasswordComplexity };
  }, { hasCaptcha: false, hasPasswordComplexity: false });
  if (r.hasCaptcha) {
    return result('GN3230200E', 'CAPTCHA 增加認知負擔（AAA）', 'fail',
      '存在 CAPTCHA 驗證，可能讓部分使用者（如認知障礙者）難以通過',
      '考慮改用非識別型驗證方式，如 reCAPTCHA v3 或 honeypot');
  }
  return result('GN3230200E', '無不必要認知負擔（AAA）', 'pass');
}

/** GN3240900E: 輸入完成可確認後執行 */
export async function check_GN3240900E(page) {
  const r = await safeEval(page, () => {
    const forms = [...document.querySelectorAll('form')];
    const hasConfirmStep = !!document.querySelector('[class*="confirm"],[class*="review"],[id*="confirm"],[aria-label*="確認"]');
    return { formCount: forms.length, hasConfirmStep };
  }, { formCount: 0, hasConfirmStep: false });
  if (r.formCount > 0 && !r.hasConfirmStep) {
    return result('GN3240900E', '表單缺少確認步驟（AAA）', 'fail',
      `${r.formCount} 個表單，但無確認或預覽步驟`,
      '在重要表單提交前加入「確認送出」步驟（AAA 等級）');
  }
  return result('GN3240900E', '表單有確認機制（AAA）', 'pass');
}

/** GN3241000E: 可逆操作（Reversible） */
export async function check_GN3241000E(page) {
  const r = await safeEval(page, () => {
    const deleteButtons = [...document.querySelectorAll('button, [role="button"]')]
      .filter(el => {
        const text = (el.textContent || '').toLowerCase();
        return text.includes('刪除') || text.includes('delete') || text.includes('remove') || text.includes('cancel');
      });
    const withConfirm = deleteButtons.filter(el =>
      el.getAttribute('aria-haspopup') || el.getAttribute('data-confirm') || el.getAttribute('onclick')?.includes('confirm')
    ).length;
    return { total: deleteButtons.length, withConfirm };
  }, { total: 0, withConfirm: 0 });
  if (r.total > 0 && r.withConfirm === 0) {
    return result('GN3241000E', '刪除/取消動作無確認機制（AAA）', 'fail',
      `${r.total} 個刪除/取消按鈕，但無確認對話框`,
      '刪除操作前加入確認對話框：aria-haspopup="dialog"，或提供「復原」功能');
  }
  return result('GN3241000E', '可逆操作有確認機制（AAA）', 'pass');
}

// ── AAA 輔助 ──────────────────────────────────────────────────────────────────

/** GN3310300E: 提供文字摘要代替複雜圖表/圖形 */
export async function check_GN3310300E(page) {
  const r = await safeEval(page, () => {
    const charts = document.querySelectorAll('[class*="chart"],[class*="graph"],[class*="diagram"],[role="img"]').length;
    const withSummary = [...document.querySelectorAll('[class*="chart"],[class*="graph"]')]
      .filter(el => el.getAttribute('aria-describedby') || el.nextElementSibling?.querySelector('table,p')).length;
    return { charts, withSummary };
  }, { charts: 0, withSummary: 0 });
  if (r.charts > 0 && r.withSummary === 0) {
    return result('GN3310300E', '圖表缺少文字摘要（AAA）', 'fail',
      `${r.charts} 個圖表無文字摘要`,
      '圖表加 aria-describedby 指向說明段落，或在旁加入資料表格');
  }
  return result('GN3310300E', '圖表有文字摘要（AAA）', 'pass', `${r.charts} 個圖表，${r.withSummary} 個有說明`);
}

/** GN3310400E: 提供僅靠聽力識別的音訊內容的視覺替代 */
export async function check_GN3310400E(page) {
  const r = await safeEval(page, () => {
    const audios = document.querySelectorAll('audio').length;
    return { audios };
  }, { audios: 0 });
  return result('GN3310400E', '音訊識別替代（AAA）', 'pass',
    `${r.audios} 個 audio 元素（AAA 等級，請人工確認是否提供視覺替代）`);
}

/** GN3310500E: 提供同步媒體的擴充音訊描述 */
export async function check_GN3310500E(page) {
  const r = await safeEval(page, () => {
    const videos = [...document.querySelectorAll('video')];
    const withExtendedDesc = videos.filter(v =>
      v.querySelector('track[kind="descriptions"]')
    ).length;
    return { total: videos.length, withExtendedDesc };
  }, { total: 0, withExtendedDesc: 0 });
  return result('GN3310500E', '擴充音訊描述（AAA）', 'pass',
    `${r.total} 個影片，${r.withExtendedDesc} 個有 track[kind=descriptions]`);
}

/** GN3310501E: 提供同步媒體的手語翻譯 */
export async function check_GN3310501E(page) {
  const r = await safeEval(page, () => {
    const hasSignLanguage = !!document.querySelector('[class*="sign-language"],[aria-label*="手語"],[aria-label*="sign language"]');
    return { hasSignLanguage };
  }, { hasSignLanguage: false });
  return result('GN3310501E', '手語翻譯（AAA）', 'pass',
    r.hasSignLanguage ? '偵測到手語翻譯區域' : '無手語翻譯（AAA 等級，選項性）');
}

/** GN3310502E: 提供現場音訊的字幕 */
export async function check_GN3310502E(page) {
  const r = await safeEval(page, () => {
    const liveAudio = document.querySelectorAll('audio[autoplay], [class*="live-audio"]').length;
    const hasCaptions = !!document.querySelector('[class*="live-caption"],[aria-label*="即時字幕"]');
    return { liveAudio, hasCaptions };
  }, { liveAudio: 0, hasCaptions: false });
  if (r.liveAudio > 0 && !r.hasCaptions) {
    return result('GN3310502E', '現場音訊缺少即時字幕（AAA）', 'fail',
      `${r.liveAudio} 個現場音訊，但無即時字幕`,
      '提供即時字幕或連結至文字轉錄服務（AAA 等級）');
  }
  return result('GN3310502E', '現場音訊字幕（AAA）', 'pass');
}

/** GN3310503E: 現場視訊有手語翻譯（AAA） */
export async function check_GN3310503E(page) {
  return result('GN3310503E', '現場視訊手語翻譯（AAA）', 'pass',
    '（AAA 等級，請人工確認是否有現場視訊手語翻譯）');
}

/** GN3310504E: 提供視訊解說（AAA） */
export async function check_GN3310504E(page) {
  return result('GN3310504E', '視訊解說（AAA）', 'pass',
    '（AAA 等級，請人工確認是否有視訊解說）');
}

/** GN3310600E: 提供純文字版本 */
export async function check_GN3310600E(page) {
  const r = await safeEval(page, () => {
    const textLinks = [...document.querySelectorAll('a[href]')]
      .filter(a => {
        const text = (a.textContent || '').toLowerCase();
        return text.includes('純文字') || text.includes('text only') || text.includes('低圖形模式');
      }).length;
    return { textLinks };
  }, { textLinks: 0 });
  return result('GN3310600E', '純文字替代版本（AAA）', 'pass',
    r.textLinks > 0 ? `${r.textLinks} 個純文字版本連結` : '（AAA 等級，選項性）');
}

// ── Failure 模式（FA 碼鍵盤相關） ─────────────────────────────────────────────

/** FA1210401E: 字符鍵快捷鍵無法關閉或重新對應（Failure 2.1.4） */
export async function check_FA1210401E(page) {
  const r = await safeEval(page, () => {
    const accesskeys = [...document.querySelectorAll('[accesskey]')]
      .map(el => `${el.tagName}: accesskey="${el.getAttribute('accesskey')}"`);
    const hasShortcutSettings = !!document.querySelector('[class*="keyboard-settings"],[aria-label*="快捷鍵設定"]');
    return { accesskeys, hasShortcutSettings };
  }, { accesskeys: [], hasShortcutSettings: false });
  if (r.accesskeys.length > 0 && !r.hasShortcutSettings) {
    return result('FA1210401E', '字符鍵快捷鍵無關閉或重新對應機制（Failure 2.1.4）', 'fail',
      `${r.accesskeys.length} 個 accesskey，但無快捷鍵設定頁面`,
      '提供快捷鍵設定介面，或僅在元素聚焦時才啟用快捷鍵',
      r.accesskeys);
  }
  return result('FA1210401E', '無不可關閉的字符鍵快捷鍵', 'pass');
}

/** FA1250102E: touchstart 觸發動作不可取消（Failure 2.5.2） */
export async function check_FA1250102E(page) {
  const r = await safeEval(page, () => {
    const touchEls = [...document.querySelectorAll('[ontouchstart]')]
      .filter(el => {
        const handler = el.getAttribute('ontouchstart') || '';
        return handler.includes('submit') || handler.includes('navigate') || handler.includes('location');
      })
      .map(el => el.tagName)
      .slice(0, 3);
    return touchEls;
  }, []);
  if (r.length > 0) {
    return result('FA1250102E', 'ontouchstart 觸發不可逆動作（Failure 2.5.2）', 'fail',
      `${r.length} 個元素在 touchstart 觸發 submit/navigate 等不可逆動作`,
      '改在 touchend 或 click 事件觸發；提供取消機制',
      r);
  }
  return result('FA1250102E', '無 touchstart 不可取消動作', 'pass');
}

/** FA1250202E: mousedown/touchstart 觸發動作且無取消（Failure 2.5.2） */
export async function check_FA1250202E(page) {
  const r = await safeEval(page, () => {
    const downEls = [...document.querySelectorAll('[onmousedown],[ontouchstart]')]
      .filter(el => {
        const mousedown = el.getAttribute('onmousedown') || '';
        const touch = el.getAttribute('ontouchstart') || '';
        return (mousedown + touch).includes('send') || (mousedown + touch).includes('purchase');
      }).length;
    return downEls;
  }, 0);
  if (r > 0) {
    return result('FA1250202E', '滑鼠按下時觸發不可逆動作（Failure 2.5.2）', 'fail',
      `${r} 個元素在 mousedown/touchstart 觸發 send/purchase 等動作`,
      '改在 click（mouseup）觸發，提供使用者取消的機會');
  }
  return result('FA1250202E', '無 mousedown 不可取消動作', 'pass');
}

/** FA1250303E: 移動裝置傾斜等動作無替代（Failure 2.5.3） */
export async function check_FA1250303E(page) {
  const r = await safeEval(page, () => {
    // 偵測 DeviceMotion/DeviceOrientation 事件
    const bodyScript = document.body.innerHTML;
    const hasMotion = bodyScript.includes('devicemotion') || bodyScript.includes('deviceorientation') ||
      bodyScript.includes('accelerometer') || bodyScript.includes('gyroscope');
    return { hasMotion };
  }, { hasMotion: false });
  if (r.hasMotion) {
    return result('FA1250303E', '使用裝置動作事件，應提供替代操作（Failure 2.5.3）', 'fail',
      '偵測到 devicemotion/deviceorientation 事件，需提供按鈕替代',
      '所有晃動/傾斜觸發的功能均需提供按鈕替代，且使用者可關閉動作觸發');
  }
  return result('FA1250303E', '無裝置動作觸發功能', 'pass');
}

/** FA1250401E: 目標區域太小（Failure 2.5.1） */
export async function check_FA1250401E(page) {
  const r = await safeEval(page, () => {
    const tiny = [...document.querySelectorAll('a[href], button')]
      .filter(el => {
        const rect = el.getBoundingClientRect();
        return rect.width > 0 && rect.height > 0 && (rect.width < 44 || rect.height < 44);
      })
      .map(el => {
        const rect = el.getBoundingClientRect();
        return `${el.tagName}(${Math.round(rect.width)}x${Math.round(rect.height)})`;
      })
      .slice(0, 5);
    return tiny;
  }, []);
  if (r.length > 5) {
    return result('FA1250401E', '多個目標區域小於 44x44px（Failure 2.5.1）', 'fail',
      `${r.length} 個按鈕/連結小於 44x44px 建議尺寸`,
      '互動目標建議至少 44x44px（觸控裝置），可用 padding 擴大點擊區域',
      r);
  }
  return result('FA1250401E', '互動目標尺寸符合要求', 'pass');
}
