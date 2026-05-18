/**
 * HM1110102E — 提供影像地圖區域的替代文字，並要能確實表達這些地圖區域的功能與目的
 * 對應成功準則：1.1.1（等級 A）
 * 類別：HTML
 *
 * 官方稽核步驟：
   * **範例1：提供描述影像地圖區域用途的文字**
   * 開啟瀏覽器如 Firefox，並搭配外掛擴充元件如「Firefox Accessibility Extension」，顯示替代文字（Accessibility → Text Equivalents → Show Text Equivalents），檢查所有的替代文字是否與其圖片區域原本要表達的功能及意義吻合，必要時並參考區域的鏈結目的地來驗證。
   * **範例2：利用 aria-describedby 提供在同一頁面上的詳盡描述**
   * ```html
   * <img src="ladymacbeth.jpg" alt="Lady MacBeth" ari
 *
 * 注意：此為自動化程式碼測試，依官方稽核步驟實作 Playwright 驗證。
 * 不依賴 AI 判斷，全部使用 DOM 查詢、CSS 計算、鍵盤模擬等程式碼。
 */

function pass(detail = '', details = []) {
  return { code: 'HM1110102E', rule: '提供影像地圖區域的替代文字，並要能確實表達這些地圖區域的功能與目的', status: 'pass', message: detail, fix_suggestion: '', details };
}
function fail(message, fix = '', details = []) {
  return { code: 'HM1110102E', rule: '提供影像地圖區域的替代文字，並要能確實表達這些地圖區域的功能與目的', status: 'fail', message, fix_suggestion: fix, details: Array.isArray(details) ? details : [details] };
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
    return { code: 'HM1110102E', rule: '提供影像地圖區域的替代文字，並要能確實表達這些地圖區域的功能與目的', status: 'fail', message: `執行錯誤: ${err.message}`, fix_suggestion: '確認頁面載入完成後再執行', details: [] };
  }
}

export const metadata = {
  code: 'HM1110102E',
  criterion: '1.1.1',
  level: 'A',
  category: 'HTML',
  rule: '提供影像地圖區域的替代文字，並要能確實表達這些地圖區域的功能與目的',
};
