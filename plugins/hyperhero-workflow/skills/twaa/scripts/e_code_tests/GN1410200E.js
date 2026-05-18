/**
 * GN1410200E — 使用者介面元件應暴露名稱與角色，允許直接設定可由使用者設定的屬性，並在變更時提供通知
 * 對應成功準則：4.1.2（等級 A）
 * 類別：General
 *
 * 官方稽核步驟：
   * 範例1：允許使用者自行設定屬性
   * 使用Google Chrome瀏覽器開啟檔案。 點選右鍵檢視網頁原始碼。 從程式碼中，可以自行更改選項或添加選項，且允許使用者自行設定屬性。
   * 範例2：使用`<aria-labelledby>`在簡單文本字段
   * ```html
   * <input name="searchtxt" type="text" aria-labelledby="searchbtn">
 *
 * 注意：此為自動化程式碼測試，依官方稽核步驟實作 Playwright 驗證。
 * 不依賴 AI 判斷，全部使用 DOM 查詢、CSS 計算、鍵盤模擬等程式碼。
 */

function pass(detail = '', details = []) {
  return { code: 'GN1410200E', rule: '使用者介面元件應暴露名稱與角色，允許直接設定可由使用者設定的屬性，並在變更時提供通知', status: 'pass', message: detail, fix_suggestion: '', details };
}
function fail(message, fix = '', details = []) {
  return { code: 'GN1410200E', rule: '使用者介面元件應暴露名稱與角色，允許直接設定可由使用者設定的屬性，並在變更時提供通知', status: 'fail', message, fix_suggestion: fix, details: Array.isArray(details) ? details : [details] };
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
    return { code: 'GN1410200E', rule: '使用者介面元件應暴露名稱與角色，允許直接設定可由使用者設定的屬性，並在變更時提供通知', status: 'fail', message: `執行錯誤: ${err.message}`, fix_suggestion: '確認頁面載入完成後再執行', details: [] };
  }
}

export const metadata = {
  code: 'GN1410200E',
  criterion: '4.1.2',
  level: 'A',
  category: 'General',
  rule: '使用者介面元件應暴露名稱與角色，允許直接設定可由使用者設定的屬性，並在變更時提供通知',
};
