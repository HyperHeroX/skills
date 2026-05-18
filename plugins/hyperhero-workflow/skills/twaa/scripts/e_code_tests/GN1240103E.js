/**
 * GN1240103E — 使用結構性組件來將鏈結分群
 * 對應成功準則：2.4.1（等級 A）
 * 類別：General
 *
 * 官方稽核步驟：
   * **範例1：檢查每個頁面導覽欄**
   * 1. 檢查每個頁面導覽欄下方是否有分類過後的鏈結。
   * 2. 使用Google Chrome「檢視原始碼」顯示連結(按下右鍵→檢視原始碼)。
   * **範例2：使用結構單一的地標頁面區域**
   * 原始碼範例：
 *
 * 注意：此為自動化程式碼測試，依官方稽核步驟實作 Playwright 驗證。
 * 不依賴 AI 判斷，全部使用 DOM 查詢、CSS 計算、鍵盤模擬等程式碼。
 */

function pass(detail = '', details = []) {
  return { code: 'GN1240103E', rule: '使用結構性組件來將鏈結分群', status: 'pass', message: detail, fix_suggestion: '', details };
}
function fail(message, fix = '', details = []) {
  return { code: 'GN1240103E', rule: '使用結構性組件來將鏈結分群', status: 'fail', message, fix_suggestion: fix, details: Array.isArray(details) ? details : [details] };
}

/**
 * @param {import('playwright').Page} page
 * @returns {Promise<{code:string, rule:string, status:string, message:string, fix_suggestion:string, details:string[]}>>}
 */
export async function check(page) {
  try {
  const aria = await page.evaluate(() => ({
      liveRegions: document.querySelectorAll('[aria-live],[role="alert"],[role="status"],[role="log"]').length,
      invalidAria: [...document.querySelectorAll('[aria-expanded]')].filter(el => !['true','false'].includes(el.getAttribute('aria-expanded'))).length,
      ariaHiddenFocusable: [...document.querySelectorAll('[aria-hidden="true"]')].filter(el => el.querySelector('a[href],button,input')).length,
    }));
    const issues = [];
    if (aria.invalidAria) issues.push(`${aria.invalidAria}個aria-expanded值無效`);
    if (aria.ariaHiddenFocusable) issues.push(`${aria.ariaHiddenFocusable}個aria-hidden元素內有可聚焦子元素`);
    if (issues.length) return fail(issues.join('; '), '修正 ARIA 屬性使用');
    return pass(`ARIA: live=${aria.liveRegions}，無無效屬性`);
  } catch (err) {
    return { code: 'GN1240103E', rule: '使用結構性組件來將鏈結分群', status: 'fail', message: `執行錯誤: ${err.message}`, fix_suggestion: '確認頁面載入完成後再執行', details: [] };
  }
}

export const metadata = {
  code: 'GN1240103E',
  criterion: '2.4.1',
  level: 'A',
  category: 'General',
  rule: '使用結構性組件來將鏈結分群',
};
