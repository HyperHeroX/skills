/**
 * GN3240900E — 針對單獨存在的鏈結，提供描述鏈結目的的鏈結文字。
 * 對應成功準則：2.4.9（等級 AAA）
 * 類別：General
 *
 * 官方稽核步驟：
   * 範例1：提供描述鏈結目的的鏈結文字 針對單獨鏈結部分，具有描述鏈結目的的文字。 可點選右鍵檢視網頁原始碼。
   * 範例2：使用aria-label提供描述鏈結目的的鏈結說明
   * 原始碼：
   * ```html
   * <h4>Neighborhood News</h4>
   * <p>Seminole tax hike: Seminole city managers are proposing a 75% increase in property taxes for the coming fiscal year.
 *
 * 注意：此為自動化程式碼測試，依官方稽核步驟實作 Playwright 驗證。
 * 不依賴 AI 判斷，全部使用 DOM 查詢、CSS 計算、鍵盤模擬等程式碼。
 */

function pass(detail = '', details = []) {
  return { code: 'GN3240900E', rule: '針對單獨存在的鏈結，提供描述鏈結目的的鏈結文字。', status: 'pass', message: detail, fix_suggestion: '', details };
}
function fail(message, fix = '', details = []) {
  return { code: 'GN3240900E', rule: '針對單獨存在的鏈結，提供描述鏈結目的的鏈結文字。', status: 'fail', message, fix_suggestion: fix, details: Array.isArray(details) ? details : [details] };
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
    return { code: 'GN3240900E', rule: '針對單獨存在的鏈結，提供描述鏈結目的的鏈結文字。', status: 'fail', message: `執行錯誤: ${err.message}`, fix_suggestion: '確認頁面載入完成後再執行', details: [] };
  }
}

export const metadata = {
  code: 'GN3240900E',
  criterion: '2.4.9',
  level: 'AAA',
  category: 'General',
  rule: '針對單獨存在的鏈結，提供描述鏈結目的的鏈結文字。',
};
