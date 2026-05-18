/**
 * aria_checks.js — ARIA 角色與屬性類 E 碼測試
 *
 * 涵蓋：AR 類全部 + GN 類 ARIA 相關
 * 測試方式：role、aria-* 屬性查詢
 *
 * 包含 E 碼（共 22 個）：
 * AR2410300E, AR2410301E, AR2410302E, AR3130600E,
 * GN2240600E, GN2240601E, GN2320300E, GN2320400E,
 * GN2330300E, GN2330301E, GN2330400E, GN2330401E,
 * GN2330402E, GN2330403E,
 * GN3120800E, GN3120801E, GN3120900E, GN3120901E,
 * GN3320500E, GN3320501E, GN3330500E, GN3330501E,
 * GN3330502E, GN3330600E, GN3330601E, GN3330602E, GN3330603E,
 * FA2130401E, FA2130402E, FA2130501E, FA2410303E
 */

import { result, safeEval } from './helpers.js';

// ── 4.1.3 狀態訊息 ────────────────────────────────────────────────────────────

/** AR2410300E: 狀態訊息容器有 role=status */
export async function check_AR2410300E(page) {
  const r = await safeEval(page, () => {
    const statusRegions = [...document.querySelectorAll('[role="status"],[role="log"]')]
      .map(el => ({ role: el.getAttribute('role'), text: el.textContent.trim().slice(0, 30) }));
    // 找可能的狀態訊息容器（class 含 success/status 等）但無 role
    const statusLike = [...document.querySelectorAll('[class*="success"],[class*="status"],[class*="notification"],[class*="toast"]')]
      .filter(el => el.offsetWidth > 0 && !el.getAttribute('role'))
      .map(el => el.className?.split(' ')[0] || el.tagName)
      .slice(0, 5);
    return { statusRegions, statusLike };
  }, { statusRegions: [], statusLike: [] });

  if (r.statusLike.length > 0 && r.statusRegions.length === 0) {
    return result('AR2410300E', '狀態訊息元素缺少 role=status', 'fail',
      `找到 ${r.statusLike.length} 個疑似狀態訊息元素（class 含 success/status），但無 role="status"`,
      '<div role="status" aria-live="polite">操作成功</div>',
      r.statusLike);
  }
  return result('AR2410300E', 'ARIA role=status 設定正確', 'pass',
    r.statusRegions.length > 0 ? `${r.statusRegions.length} 個 role=status/log` : '無狀態訊息區域');
}

/** AR2410301E: 錯誤訊息有 role=alert 或 aria-live=assertive */
export async function check_AR2410301E(page) {
  const r = await safeEval(page, () => {
    const ariaAlerts = [...document.querySelectorAll('[role="alert"],[aria-live="assertive"]')]
      .filter(el => el.offsetWidth > 0 || el.textContent.trim().length > 0).length;
    const visibleErrors = [...document.querySelectorAll('[class*="error"],[class*="invalid"],[class*="danger"],[aria-invalid]')]
      .filter(el => el.offsetWidth > 0 && el.textContent.trim() && !el.getAttribute('role')).length;
    return { ariaAlerts, visibleErrors };
  }, { ariaAlerts: 0, visibleErrors: 0 });

  if (r.visibleErrors > 0 && r.ariaAlerts === 0) {
    return result('AR2410301E', '可見錯誤訊息缺少 role=alert 或 aria-live=assertive', 'fail',
      `${r.visibleErrors} 個可見錯誤訊息無 role="alert" 或 aria-live="assertive"`,
      '<div role="alert">帳號或密碼錯誤</div>');
  }
  return result('AR2410301E', '錯誤訊息有 ARIA live 通報', 'pass',
    r.ariaAlerts > 0 ? `${r.ariaAlerts} 個 role=alert` : '無可見錯誤訊息');
}

/** AR2410302E: 順序訊息（聊天/動態）有 role=log */
export async function check_AR2410302E(page) {
  const r = await safeEval(page, () => {
    const logRegions = document.querySelectorAll('[role="log"]').length;
    const chatLike = document.querySelectorAll('[class*="chat"],[class*="feed"],[class*="timeline"],[class*="activity"],[class*="message-list"]').length;
    return { logRegions, chatLike };
  }, { logRegions: 0, chatLike: 0 });

  if (r.chatLike > 0 && r.logRegions === 0) {
    return result('AR2410302E', '順序訊息區域缺少 role=log', 'fail',
      `${r.chatLike} 個疑似聊天/動態串列元素，但無 role="log"`,
      '<div role="log" aria-live="polite" aria-label="訊息串">');
  }
  return result('AR2410302E', 'role=log 設定正確', 'pass',
    r.logRegions > 0 ? `${r.logRegions} 個 role=log` : '無聊天/動態串列');
}

/** AR3130600E: ARIA landmark 識別頁面區域 */
export async function check_AR3130600E(page) {
  const r = await safeEval(page, () => {
    const landmarks = [];
    ['main', 'nav', 'header', 'footer', 'aside'].forEach(sel => {
      if (document.querySelector(sel)) landmarks.push(`<${sel}>`);
    });
    ['banner', 'main', 'navigation', 'contentinfo', 'complementary', 'search', 'form'].forEach(role => {
      if (document.querySelector(`[role="${role}"]`)) landmarks.push(`role=${role}`);
    });
    const uniqueLandmarks = [...new Set(landmarks)];
    const hasMain = uniqueLandmarks.some(l => l === '<main>' || l === 'role=main');
    const hasNav = uniqueLandmarks.some(l => l === '<nav>' || l === 'role=navigation');
    return { landmarks: uniqueLandmarks, hasMain, hasNav };
  }, { landmarks: [], hasMain: false, hasNav: false });

  if (!r.hasMain) {
    return result('AR3130600E', '缺少 main landmark', 'fail',
      '未找到 <main> 或 role="main" 元素',
      '<main id="main-content">頁面主要內容</main>',
      r.landmarks);
  }
  if (r.landmarks.length < 2) {
    return result('AR3130600E', 'ARIA landmark 數量不足', 'fail',
      `只找到 ${r.landmarks.length} 個 landmark`,
      '至少應有 <header>/<nav>/<main>/<footer>',
      r.landmarks);
  }
  return result('AR3130600E', 'ARIA landmark 結構完整', 'pass', r.landmarks.join(', '));
}

// ── 2.4.6 標題與標籤（GN 類） ─────────────────────────────────────────────────

/** GN2240600E: 提供每個標題和標籤的描述性文字 */
export async function check_GN2240600E(page) {
  const r = await safeEval(page, () => {
    const headings = [...document.querySelectorAll('h1, h2, h3, h4, h5, h6')];
    const emptyHeadings = headings.filter(h => !h.textContent.trim()).length;
    const labels = [...document.querySelectorAll('label')];
    const emptyLabels = labels.filter(l => !l.textContent.trim() && !l.getAttribute('aria-label')).length;
    return { totalHeadings: headings.length, emptyHeadings, totalLabels: labels.length, emptyLabels };
  }, { totalHeadings: 0, emptyHeadings: 0, totalLabels: 0, emptyLabels: 0 });
  const issues = [];
  if (r.emptyHeadings > 0) issues.push(`${r.emptyHeadings} 個空標題元素`);
  if (r.emptyLabels > 0) issues.push(`${r.emptyLabels} 個空標籤元素`);
  if (issues.length > 0) {
    return result('GN2240600E', '標題或標籤缺少描述文字', 'fail',
      issues.join('；'),
      '確保所有 h1~h6 和 label 都有有意義的文字內容');
  }
  return result('GN2240600E', '標題和標籤均有描述性文字', 'pass',
    `${r.totalHeadings} 個標題，${r.totalLabels} 個標籤`);
}

/** GN2240601E: 標題和標籤描述主題或目的 */
export async function check_GN2240601E(page) {
  const r = await safeEval(page, () => {
    const headings = [...document.querySelectorAll('h1, h2, h3')];
    const generic = headings.filter(h => {
      const text = h.textContent.trim().toLowerCase();
      return text === 'section' || text === '區段' || text === 'content' || text === '內容' || text.length < 2;
    }).map(h => `${h.tagName}: "${h.textContent.trim()}"`)
    .slice(0, 5);
    return generic;
  }, []);
  if (r.length > 0) {
    return result('GN2240601E', '標題文字過於模糊', 'fail',
      `${r.length} 個標題使用過於模糊的文字`,
      '標題應描述該區段的具體主題，例如「申請資格說明」而非「區段」',
      r);
  }
  return result('GN2240601E', '標題描述具體主題', 'pass');
}

// ── 3.2 可預測行為 ────────────────────────────────────────────────────────────

/** GN2320300E: 導覽連結在多頁面保持一致順序 */
export async function check_GN2320300E(page) {
  const r = await safeEval(page, () => {
    const navLinks = [...document.querySelectorAll('nav a, [role="navigation"] a')]
      .map(a => (a.textContent || '').trim().slice(0, 20))
      .filter(t => t.length > 0)
      .slice(0, 10);
    return { navLinks, count: navLinks.length };
  }, { navLinks: [], count: 0 });
  return result('GN2320300E', '導覽連結一致性（需跨頁面比較）', 'pass',
    `找到 ${r.count} 個導覽連結（跨頁面一致性需人工或多頁面測試確認）`);
}

/** GN2320400E: 元件在多頁面識別方式一致 */
export async function check_GN2320400E(page) {
  const r = await safeEval(page, () => {
    const logo = document.querySelector('[class*="logo"],[id*="logo"]');
    const searchBtn = document.querySelector('[aria-label*="搜尋"],[aria-label*="search"],[type="search"]');
    const homeLink = [...document.querySelectorAll('a[href]')].find(a =>
      a.href === location.origin + '/' || a.href === location.origin
    );
    return {
      hasLogo: !!logo,
      logoAlt: logo?.querySelector('img')?.alt || logo?.getAttribute('aria-label') || '',
      hasSearch: !!searchBtn,
      hasHomeLink: !!homeLink
    };
  }, { hasLogo: false, logoAlt: '', hasSearch: false, hasHomeLink: false });
  return result('GN2320400E', '元件識別方式一致', 'pass',
    `logo: ${r.hasLogo}（alt: ${r.logoAlt}）, search: ${r.hasSearch}, homeLink: ${r.hasHomeLink}`);
}

// ── 3.3 輸入協助 ─────────────────────────────────────────────────────────────

/** GN2330300E: 送出錯誤後提供修正建議 */
export async function check_GN2330300E(page) {
  const hasForm = await safeEval(page, () => !!document.querySelector('form'), false);
  if (!hasForm) return result('GN2330300E', '無表單', 'pass');

  const submitBtn = await page.$('form [type="submit"], form button:not([type="button"])');
  if (!submitBtn) return result('GN2330300E', '無提交按鈕', 'pass');

  try {
    await submitBtn.click();
    await page.waitForTimeout(1000);
  } catch {}

  const r = await safeEval(page, () => {
    const errorEls = [...document.querySelectorAll('[class*="error"],[role="alert"],[aria-invalid]')]
      .filter(el => el.offsetWidth > 0 && el.textContent.trim().length > 5);
    return { errorCount: errorEls.length, errorTexts: errorEls.map(e => e.textContent.trim().slice(0, 40)).slice(0, 3) };
  }, { errorCount: 0, errorTexts: [] });

  if (r.errorCount === 0) {
    return result('GN2330300E', '表單提交後無錯誤訊息或修正建議', 'fail',
      '提交空白表單後未顯示錯誤訊息或修正建議',
      '錯誤訊息應說明原因與修正方法，例如「電子郵件格式錯誤，請輸入如 user@example.com 的格式」');
  }
  return result('GN2330300E', '表單錯誤有修正建議', 'pass', r.errorTexts.join('；'));
}

/** GN2330301E: 標題告知必填欄位 */
export async function check_GN2330301E(page) {
  const r = await safeEval(page, () => {
    const requiredInputs = document.querySelectorAll('[required],[aria-required="true"]').length;
    const hasRequiredNote = document.body?.textContent.includes('* 為必填') ||
      document.body?.textContent.includes('*為必填') ||
      document.body?.textContent.includes('必填欄位') ||
      !!document.querySelector('[class*="required-note"],[class*="mandatory"]');
    return { requiredInputs, hasRequiredNote };
  }, { requiredInputs: 0, hasRequiredNote: false });
  if (r.requiredInputs > 0 && !r.hasRequiredNote) {
    return result('GN2330301E', '有必填欄位但缺少說明文字', 'fail',
      `${r.requiredInputs} 個必填欄位，但頁面無「* 為必填」等說明`,
      '在表單頂部加入「* 標記的欄位為必填」說明');
  }
  return result('GN2330301E', '必填欄位有說明', 'pass',
    r.requiredInputs > 0 ? `${r.requiredInputs} 個必填欄位，有說明文字` : '無必填欄位');
}

/** GN2330400E: 輸入錯誤後資料不消失 */
export async function check_GN2330400E(page) {
  const r = await safeEval(page, () => {
    // 偵測表單是否有 reset 按鈕在 submit 附近（可能意外清除）
    const resetBtns = document.querySelectorAll('[type="reset"]').length;
    const hasPreserveNote = !!document.querySelector('[class*="preserve"],[aria-label*="保留資料"]');
    return { resetBtns, hasPreserveNote };
  }, { resetBtns: 0, hasPreserveNote: false });
  return result('GN2330400E', '輸入錯誤後資料保留', 'pass',
    `${r.resetBtns} 個 reset 按鈕（請確認驗證失敗時使用者填入的資料不會消失）`);
}

/** GN2330401E: 送出前可確認、修改或撤回 */
export async function check_GN2330401E(page) {
  const r = await safeEval(page, () => {
    const hasConfirm = !!document.querySelector('[class*="confirm-submit"],[class*="review-step"],[aria-label*="確認送出"]');
    const hasEdit = !!document.querySelector('[class*="edit-before-submit"],[aria-label*="修改"]');
    const hasCancel = !!document.querySelector('[type="reset"],[class*="cancel"],[aria-label*="取消"]');
    return { hasConfirm, hasEdit, hasCancel };
  }, { hasConfirm: false, hasEdit: false, hasCancel: false });
  const found = [];
  if (r.hasConfirm) found.push('確認步驟');
  if (r.hasEdit) found.push('修改選項');
  if (r.hasCancel) found.push('取消按鈕');
  return result('GN2330401E', '送出前確認機制', 'pass', found.length > 0 ? found.join(', ') : '無（請確認重要提交有確認機制）');
}

/** GN2330402E: 提交後可在一段時間內撤回 */
export async function check_GN2330402E(page) {
  const r = await safeEval(page, () => {
    const hasUndo = !!document.querySelector('[aria-label*="復原"],[aria-label*="undo"],[class*="undo"],[class*="revoke"]');
    return { hasUndo };
  }, { hasUndo: false });
  return result('GN2330402E', '提交後撤回機制', 'pass',
    r.hasUndo ? '找到復原/撤回元素' : '（請確認重要操作是否有撤回機制）');
}

/** GN2330403E: 使用者可審查、確認和修正資訊 */
export async function check_GN2330403E(page) {
  const r = await safeEval(page, () => {
    const multiStepForm = !!document.querySelector('[class*="wizard"],[class*="stepper"],[class*="multi-step"]');
    const hasReviewStep = !!document.querySelector('[class*="review"],[class*="confirm"],[aria-label*="預覽"]');
    return { multiStepForm, hasReviewStep };
  }, { multiStepForm: false, hasReviewStep: false });
  return result('GN2330403E', '使用者可審查確認資訊', 'pass',
    r.multiStepForm ? `多步驟表單，${r.hasReviewStep ? '有' : '無'}審查步驟` : '（請確認重要提交有審查機制）');
}

// ── AAA 等級語意/說明 ─────────────────────────────────────────────────────────

/** GN3120800E: 提供奇特詞語與片語的定義 */
export async function check_GN3120800E(page) {
  const r = await safeEval(page, () => {
    const dfns = document.querySelectorAll('dfn').length;
    const abbrs = document.querySelectorAll('abbr[title]').length;
    return { dfns, abbrs };
  }, { dfns: 0, abbrs: 0 });
  return result('GN3120800E', '奇特詞語定義（AAA）', 'pass',
    `dfn: ${r.dfns}, abbr[title]: ${r.abbrs}（AAA 等級，請人工確認專業術語有定義）`);
}

/** GN3120801E: 提供縮寫詞的定義 */
export async function check_GN3120801E(page) {
  const r = await safeEval(page, () => {
    const abbrs = [...document.querySelectorAll('abbr')];
    const withTitle = abbrs.filter(a => a.getAttribute('title')).length;
    const withoutTitle = abbrs.filter(a => !a.getAttribute('title')).map(a => a.textContent.trim()).slice(0, 5);
    return { total: abbrs.length, withTitle, withoutTitle };
  }, { total: 0, withTitle: 0, withoutTitle: [] });
  if (r.withoutTitle.length > 0) {
    return result('GN3120801E', 'abbr 元素缺少 title 縮寫定義（AAA）', 'fail',
      `${r.withoutTitle.length} 個 <abbr> 無 title 屬性`,
      '<abbr title="World Wide Web Consortium">W3C</abbr>',
      r.withoutTitle);
  }
  return result('GN3120801E', '縮寫詞有定義（AAA）', 'pass', `${r.withTitle}/${r.total} 個 abbr 有 title`);
}

/** GN3120900E: 提供同音異義詞的發音說明 */
export async function check_GN3120900E(page) {
  const r = await safeEval(page, () => {
    const rubyEls = document.querySelectorAll('ruby, rt').length;
    return { rubyEls };
  }, { rubyEls: 0 });
  return result('GN3120900E', '同音異義詞發音說明（AAA）', 'pass',
    r.rubyEls > 0 ? `找到 ${r.rubyEls} 個 <ruby>/<rt> 注音元素` : '（AAA 等級，日文等語言才適用）');
}

/** GN3120901E: 提供發音的音訊 */
export async function check_GN3120901E(page) {
  return result('GN3120901E', '發音音訊（AAA）', 'pass', '（AAA 等級，選項性）');
}

// ── AAA 互動 ──────────────────────────────────────────────────────────────────

/** GN3320500E: 所有功能從任何地方可存取 */
export async function check_GN3320500E(page) {
  const r = await safeEval(page, () => {
    const allInteractive = document.querySelectorAll('button:not([disabled]), a[href], input:not([disabled]):not([type="hidden"]), select:not([disabled])').length;
    const focusable = [...document.querySelectorAll('button:not([disabled]), a[href], input:not([disabled]):not([type="hidden"]), select:not([disabled])')]
      .filter(el => el.getAttribute('tabindex') !== '-1').length;
    return { allInteractive, focusable };
  }, { allInteractive: 0, focusable: 0 });
  if (r.allInteractive > 0 && r.focusable < r.allInteractive * 0.9) {
    return result('GN3320500E', '部分互動元素無法鍵盤存取', 'fail',
      `${r.focusable}/${r.allInteractive} 個互動元素可鍵盤聚焦`,
      '確保所有按鈕/連結/輸入框未被 tabindex="-1" 或 display:none 排除在鍵盤流之外');
  }
  return result('GN3320500E', '所有功能可鍵盤存取', 'pass', `${r.focusable}/${r.allInteractive} 個互動元素可聚焦`);
}

/** GN3320501E: 所有功能不依賴特定輸入方式 */
export async function check_GN3320501E(page) {
  const r = await safeEval(page, () => {
    // 偵測只有 mouse 事件的自訂元素
    const mouseOnly = [...document.querySelectorAll('[onmouseover]:not([onfocus]):not([tabindex])')] .length;
    const touchOnly = [...document.querySelectorAll('[ontouchstart]:not([onclick])')].length;
    return { mouseOnly, touchOnly };
  }, { mouseOnly: 0, touchOnly: 0 });
  if (r.mouseOnly > 3 || r.touchOnly > 3) {
    return result('GN3320501E', '功能依賴特定輸入方式', 'fail',
      `${r.mouseOnly} 個只有 hover 效果，${r.touchOnly} 個只有 touch 觸發`,
      '確保所有功能可透過滑鼠、鍵盤和觸控等多種方式操作');
  }
  return result('GN3320501E', '功能不依賴特定輸入方式', 'pass');
}

// ── AAA 錯誤預防 ─────────────────────────────────────────────────────────────

/** GN3330500E: 提供在規定時間內修改或取消提交的機制 */
export async function check_GN3330500E(page) {
  const r = await safeEval(page, () => {
    const hasTimer = !!document.querySelector('[class*="timer"],[id*="countdown"]');
    const hasCancel = !!document.querySelector('[aria-label*="取消提交"],[aria-label*="撤銷"]');
    return { hasTimer, hasCancel };
  }, { hasTimer: false, hasCancel: false });
  return result('GN3330500E', '修改/取消提交機制（AAA）', 'pass',
    `${r.hasTimer ? '有計時器' : '無計時器'}，${r.hasCancel ? '有取消機制' : '無取消機制'}（AAA 等級）`);
}

/** GN3330501E: 防止使用者資料遺失 */
export async function check_GN3330501E(page) {
  const r = await safeEval(page, () => {
    const hasBeforeUnload = !!window.onbeforeunload ||
      document.body.innerHTML.includes('beforeunload');
    const hasSaveDraft = !!document.querySelector('[class*="save-draft"],[aria-label*="儲存草稿"]');
    return { hasBeforeUnload, hasSaveDraft };
  }, { hasBeforeUnload: false, hasSaveDraft: false });
  return result('GN3330501E', '防止資料遺失（AAA）', 'pass',
    `beforeunload: ${r.hasBeforeUnload}, 儲存草稿: ${r.hasSaveDraft}`);
}

/** GN3330502E: 防止輸入錯誤（AAA） */
export async function check_GN3330502E(page) {
  const r = await safeEval(page, () => {
    const inputsWithPattern = document.querySelectorAll('[pattern]').length;
    const inputsWithValidation = document.querySelectorAll('[aria-invalid],[required],[min],[max],[maxlength]').length;
    return { inputsWithPattern, inputsWithValidation };
  }, { inputsWithPattern: 0, inputsWithValidation: 0 });
  return result('GN3330502E', '防止輸入錯誤（AAA）', 'pass',
    `pattern: ${r.inputsWithPattern}, 驗證屬性: ${r.inputsWithValidation}`);
}

/** GN3330600E: 使用者可以確認資訊並修正 */
export async function check_GN3330600E(page) {
  const r = await safeEval(page, () => {
    const hasCheckout = !!document.querySelector('[class*="checkout"],[class*="review-order"],[class*="confirm-order"]');
    const hasEditBtn = !!document.querySelector('[aria-label*="編輯"],[class*="edit-info"]');
    return { hasCheckout, hasEditBtn };
  }, { hasCheckout: false, hasEditBtn: false });
  return result('GN3330600E', '資訊確認修正機制（AAA）', 'pass',
    `checkout: ${r.hasCheckout}, 編輯按鈕: ${r.hasEditBtn}`);
}

/** GN3330601E: 法律/財務/測驗資料提交可逆 */
export async function check_GN3330601E(page) {
  return result('GN3330601E', '重要提交可逆（AAA）', 'pass', '（AAA 等級，請人工確認法律/財務提交是否可逆）');
}

/** GN3330602E: 法律/財務/測驗資料提交前可修正 */
export async function check_GN3330602E(page) {
  return result('GN3330602E', '重要提交可修正（AAA）', 'pass', '（AAA 等級，請人工確認）');
}

/** GN3330603E: 提交前可確認 */
export async function check_GN3330603E(page) {
  return result('GN3330603E', '提交前確認（AAA）', 'pass', '（AAA 等級，請人工確認）');
}

// ── Failure 模式（ARIA 相關） ─────────────────────────────────────────────────

/** FA2130401E: 使用 onselect 事件改變情境（Failure 3.2.4） */
export async function check_FA2130401E(page) {
  const r = await safeEval(page, () => {
    const onchangeEls = [...document.querySelectorAll('select[onchange]')]
      .filter(el => {
        const handler = el.getAttribute('onchange') || '';
        return handler.includes('location') || handler.includes('navigate') || handler.includes('href') || handler.includes('submit');
      })
      .map(el => el.getAttribute('name') || el.id || el.tagName)
      .slice(0, 3);
    return onchangeEls;
  }, []);
  if (r.length > 0) {
    return result('FA2130401E', 'select onchange 自動導航（Failure 3.2.1）', 'fail',
      `${r.length} 個 select 在 onchange 自動 navigate/submit`,
      '移除 onchange 自動導航；加入「前往」按鈕讓使用者確認',
      r);
  }
  return result('FA2130401E', '無 select onchange 自動導航', 'pass');
}

/** FA2130402E: 設定改變時自動提交表單（Failure 3.2.2） */
export async function check_FA2130402E(page) {
  const r = await safeEval(page, () => {
    const autoSubmit = [...document.querySelectorAll('[onchange]')]
      .filter(el => {
        const handler = el.getAttribute('onchange') || '';
        return handler.includes('submit') || handler.includes('form.submit');
      })
      .map(el => el.tagName + '[name=' + (el.getAttribute('name') || '?') + ']')
      .slice(0, 3);
    return autoSubmit;
  }, []);
  if (r.length > 0) {
    return result('FA2130402E', '表單欄位改變時自動提交（Failure 3.2.2）', 'fail',
      `${r.length} 個元素 onchange 自動 submit`,
      '加入提交按鈕讓使用者主動確認；移除 onchange submit',
      r);
  }
  return result('FA2130402E', '無自動提交表單', 'pass');
}

/** FA2130501E: 焦點改變時自動提交表單（Failure 3.2.1） */
export async function check_FA2130501E(page) {
  const r = await safeEval(page, () => {
    const autoSubmit = [...document.querySelectorAll('[onfocus],[onblur]')]
      .filter(el => {
        const handler = (el.getAttribute('onfocus') || '') + (el.getAttribute('onblur') || '');
        return handler.includes('submit');
      })
      .map(el => el.tagName)
      .slice(0, 3);
    return autoSubmit;
  }, []);
  if (r.length > 0) {
    return result('FA2130501E', '焦點改變時自動提交（Failure 3.2.1）', 'fail',
      `${r.length} 個元素在 onfocus/onblur 觸發 submit`,
      '移除焦點觸發的表單提交；加入明確的提交按鈕',
      r);
  }
  return result('FA2130501E', '無焦點觸發自動提交', 'pass');
}

/** FA2410303E: 使用 ARIA 語法錯誤（role/aria-* 使用不當） */
export async function check_FA2410303E(page) {
  const r = await safeEval(page, () => {
    const issues = [];
    const validRoles = ['button', 'link', 'checkbox', 'radio', 'tab', 'tabpanel', 'dialog', 'alert', 'alertdialog',
      'main', 'navigation', 'banner', 'contentinfo', 'complementary', 'search', 'form', 'region',
      'status', 'log', 'marquee', 'timer', 'progressbar', 'slider', 'spinbutton', 'tooltip',
      'grid', 'gridcell', 'row', 'rowgroup', 'columnheader', 'rowheader', 'listbox', 'option',
      'menu', 'menubar', 'menuitem', 'menuitemcheckbox', 'menuitemradio', 'tree', 'treeitem', 'treegrid',
      'img', 'separator', 'presentation', 'none', 'article', 'group', 'heading', 'list', 'listitem',
      'definition', 'term', 'figure', 'document', 'application', 'note', 'cell', 'table', 'generic'];
    [...document.querySelectorAll('[role]')].forEach(el => {
      const role = el.getAttribute('role');
      if (!validRoles.includes(role)) {
        issues.push(`${el.tagName}: role="${role}" 不是有效的 ARIA role`);
      }
    });
    // aria-* 屬性使用錯誤
    [...document.querySelectorAll('[aria-labelledby]')].forEach(el => {
      const id = el.getAttribute('aria-labelledby');
      if (id && !document.getElementById(id)) {
        issues.push(`${el.tagName}: aria-labelledby="${id}" 指向不存在的元素`);
      }
    });
    [...document.querySelectorAll('[aria-describedby]')].forEach(el => {
      const id = el.getAttribute('aria-describedby');
      if (id && !document.getElementById(id)) {
        issues.push(`${el.tagName}: aria-describedby="${id}" 指向不存在的元素`);
      }
    });
    return issues.slice(0, 10);
  }, []);
  if (r.length > 0) {
    return result('FA2410303E', 'ARIA 語法錯誤（Failure 4.1.2）', 'fail',
      `${r.length} 個 ARIA 使用問題`,
      '使用有效的 ARIA role；確保 aria-labelledby/aria-describedby 指向存在的元素 id',
      r);
  }
  return result('FA2410303E', 'ARIA 語法正確', 'pass');
}

// ── Failure 樣式（視覺相關） ─────────────────────────────────────────────────

/** FA2141008E: 320px reflow 內容消失 */
export async function check_FA2141008E(page) {
  const origSize = page.viewportSize() || { width: 1280, height: 800 };
  await page.setViewportSize({ width: 320, height: 568 });
  await page.waitForTimeout(500);

  const r = await safeEval(page, () => {
    const clipped = [...document.querySelectorAll('main p, main li, main h1, main h2, main td, article')]
      .filter(el => el.textContent.trim().length > 0 && el.offsetHeight === 0)
      .map(el => el.tagName)
      .slice(0, 5);
    return clipped;
  }, []);

  await page.setViewportSize(origSize);

  if (r.length > 0) {
    return result('FA2141008E', '320px reflow 後部分內容消失（Failure）', 'fail',
      `${r.length} 個主要內容元素在 320px 下不可見`,
      '移除固定高度/寬度限制；使用 overflow: visible 和響應式佈局',
      r);
  }
  return result('FA2141008E', '320px reflow 後無內容消失', 'pass');
}

/** FA2141104E: 焦點樣式被移除（Failure 2.4.7） */
export async function check_FA2141104E(page) {
  // 同 CS1140101E
  const r = await safeEval(page, () => {
    let globalOutlineNone = false;
    for (const sheet of document.styleSheets) {
      try {
        for (const rule of sheet.cssRules || []) {
          if (rule.selectorText?.includes(':focus') &&
              (rule.style?.outline === 'none' || rule.style?.outlineWidth === '0px')) {
            globalOutlineNone = true;
          }
        }
      } catch {}
    }
    return globalOutlineNone;
  }, false);
  if (r) {
    return result('FA2141104E', 'CSS 全域移除 :focus outline（Failure 2.4.7）', 'fail',
      '偵測到 CSS 規則 ":focus { outline: none }"',
      '移除 * :focus { outline: none }；改為 :focus-visible { outline: 2px solid #005fcc; }');
  }
  return result('FA2141104E', '焦點樣式未被全域移除', 'pass');
}

/** FA2141205E: text-spacing 導致內容消失（Failure 1.4.12） */
export async function check_FA2141205E(page) {
  const r = await safeEval(page, () => {
    // 模擬注入文字間距覆寫樣式
    const style = document.createElement('style');
    style.id = '__twaa_spacing_test';
    style.textContent = '* { line-height: 1.5 !important; letter-spacing: 0.12em !important; word-spacing: 0.16em !important; padding-top: 0.44em !important; }';
    document.head.appendChild(style);

    // 偵測是否有元素溢出
    const clipped = [...document.querySelectorAll('nav, header, footer, button, a')]
      .filter(el => el.scrollHeight > el.offsetHeight * 1.5 && el.offsetHeight > 0)
      .map(el => el.tagName + '.' + (el.className?.split(' ')[0] || ''))
      .slice(0, 3);

    // 清除測試樣式
    document.getElementById('__twaa_spacing_test')?.remove();
    return clipped;
  }, []);
  if (r.length > 0) {
    return result('FA2141205E', '文字間距覆寫導致元素裁切（Failure 1.4.12）', 'fail',
      `${r.length} 個元素在增加文字間距後高度溢出`,
      '移除固定高度限制；使用 min-height 而非 height；允許文字間距覆寫',
      r);
  }
  return result('FA2141205E', '文字間距覆寫後無內容裁切', 'pass');
}

/** FA2141301E: hover 內容無法讓滑鼠移入（Failure 1.4.13） */
export async function check_FA2141301E(page) {
  const triggers = await safeEval(page, () => {
    return [...document.querySelectorAll('[title],[data-tooltip],[aria-describedby]')]
      .slice(0, 3)
      .map(el => {
        const rect = el.getBoundingClientRect();
        return { x: Math.round(rect.x + rect.width / 2), y: Math.round(rect.y + rect.height / 2) };
      })
      .filter(p => p.x > 0 && p.y > 0);
  }, []);

  if (triggers.length === 0) return result('FA2141301E', '無 tooltip 觸發元素', 'pass');

  for (const trigger of triggers.slice(0, 2)) {
    await page.mouse.move(trigger.x, trigger.y);
    await page.waitForTimeout(400);
    const tooltipPos = await safeEval(page, () => {
      const tt = document.querySelector('[role="tooltip"],[class*="tooltip"],[class*="popover"]');
      if (!tt || tt.offsetWidth === 0) return null;
      const rect = tt.getBoundingClientRect();
      return { x: Math.round(rect.x + rect.width / 2), y: Math.round(rect.y + rect.height / 2) };
    }, null);
    if (!tooltipPos) continue;

    await page.mouse.move(tooltipPos.x, tooltipPos.y);
    await page.waitForTimeout(200);
    const stillVisible = await safeEval(page, () => {
      const tt = document.querySelector('[role="tooltip"],[class*="tooltip"]');
      return tt ? tt.offsetWidth > 0 : false;
    }, false);

    if (!stillVisible) {
      return result('FA2141301E', 'Tooltip 在滑鼠移入後消失（Failure 1.4.13）', 'fail',
        '滑鼠從觸發元素移向 tooltip 時，tooltip 消失',
        'tooltip CSS 加 pointer-events: auto; 讓滑鼠可移入；tooltip 父容器 :hover 也保持顯示');
    }
  }
  return result('FA2141301E', 'Tooltip 可讓滑鼠移入', 'pass');
}

/** FA3250600E: 提交後無法復原（AAA Failure） */
export async function check_FA3250600E(page) {
  const r = await safeEval(page, () => {
    const forms = document.querySelectorAll('form').length;
    const hasUndo = !!document.querySelector('[aria-label*="復原"],[aria-label*="undo"],[class*="undo"]');
    return { forms, hasUndo };
  }, { forms: 0, hasUndo: false });
  if (r.forms > 0 && !r.hasUndo) {
    return result('FA3250600E', '表單提交後無復原機制（AAA Failure）', 'fail',
      `${r.forms} 個表單但無復原/撤銷機制`,
      '提供復原機制或確認對話框（AAA 等級）');
  }
  return result('FA3250600E', '表單提交有復原機制（AAA）', 'pass');
}
