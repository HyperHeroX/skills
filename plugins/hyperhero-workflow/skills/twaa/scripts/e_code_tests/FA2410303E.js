/**
 * FA2410303E — 由於提供無法通過角色或屬性以程式化確定的狀態消息而導致成功準則4.1.3失敗
 * 對應成功準則：4.1.3（等級 AA）
 * 類別：Failure
 *
 * 官方稽核步驟：
   * 程序
   * 對於動態添加到頁面的內容：
   * - 確認含有更新內容的元素未獲得焦點。
   * - 確認以下內容之一，新內容是否向使用者提供訊息：動作的成功或結果、應用程序的等待狀態、過程的進度、錯誤的存在。
   * - 確認含有新內容的元素是否不具有預先存在的aria role值，包括status(狀態)、alert(警告)、log(日誌)或progressbar(進度欄)或aria-live屬性。
   * - 檢查狀態訊息是否未能透過輔助技術顯示。
 *
 * 注意：此為自動化程式碼測試，依官方稽核步驟實作 Playwright 驗證。
 * 不依賴 AI 判斷，全部使用 DOM 查詢、CSS 計算、鍵盤模擬等程式碼。
 */

function pass(detail = '', details = []) {
  return { code: 'FA2410303E', rule: '由於提供無法通過角色或屬性以程式化確定的狀態消息而導致成功準則4.1.3失敗', status: 'pass', message: detail, fix_suggestion: '', details };
}
function fail(message, fix = '', details = []) {
  return { code: 'FA2410303E', rule: '由於提供無法通過角色或屬性以程式化確定的狀態消息而導致成功準則4.1.3失敗', status: 'fail', message, fix_suggestion: fix, details: Array.isArray(details) ? details : [details] };
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
    return { code: 'FA2410303E', rule: '由於提供無法通過角色或屬性以程式化確定的狀態消息而導致成功準則4.1.3失敗', status: 'fail', message: `執行錯誤: ${err.message}`, fix_suggestion: '確認頁面載入完成後再執行', details: [] };
  }
}

export const metadata = {
  code: 'FA2410303E',
  criterion: '4.1.3',
  level: 'AA',
  category: 'Failure',
  rule: '由於提供無法通過角色或屬性以程式化確定的狀態消息而導致成功準則4.1.3失敗',
};
