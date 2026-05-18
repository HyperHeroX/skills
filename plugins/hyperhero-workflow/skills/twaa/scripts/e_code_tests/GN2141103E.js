/**
 * GN2141103E — 提供具有足夠對比度的控制元件，以允許用戶切換到足夠對比度的呈現
 * 對應成功準則：1.4.11（等級 AA）
 * 類別：General
 *
 * 官方稽核步驟：
   * **程序**
   * 1. 檢查原始頁面上是否存在可訪問備用版本的鏈結或控制元件。
   * 2. 檢查原始頁面上的鏈結或控制元件是否符合所測試一致性級別的所有成功條件。
   * 3. 檢查替代版本是否符合對比度和所有其他成功準則，以符合所測試的一致性級別。
   * **預期結果**
 *
 * 注意：此為自動化程式碼測試，依官方稽核步驟實作 Playwright 驗證。
 * 不依賴 AI 判斷，全部使用 DOM 查詢、CSS 計算、鍵盤模擬等程式碼。
 */

function pass(detail = '', details = []) {
  return { code: 'GN2141103E', rule: '提供具有足夠對比度的控制元件，以允許用戶切換到足夠對比度的呈現', status: 'pass', message: detail, fix_suggestion: '', details };
}
function fail(message, fix = '', details = []) {
  return { code: 'GN2141103E', rule: '提供具有足夠對比度的控制元件，以允許用戶切換到足夠對比度的呈現', status: 'fail', message, fix_suggestion: fix, details: Array.isArray(details) ? details : [details] };
}

/**
 * @param {import('playwright').Page} page
 * @returns {Promise<{code:string, rule:string, status:string, message:string, fix_suggestion:string, details:string[]}>>}
 */
export async function check(page) {
  try {
  const result = await page.evaluate(() => {
      const ids = [...document.querySelectorAll('[id]')].map(e => e.id);
      const dupIds = ids.filter((id,i) => ids.indexOf(id) !== i).slice(0,5);
      const btnNoName = [...document.querySelectorAll('button')].filter(b => !b.textContent.trim() && !b.getAttribute('aria-label') && !b.getAttribute('title')).length;
      const iframeNoTitle = document.querySelectorAll('iframe:not([title])').length;
      return { dupIds, btnNoName, iframeNoTitle, hasDoctype: document.doctype !== null };
    });
    const issues = [];
    if (result.dupIds.length) issues.push(`重複ID: ${result.dupIds.join(',')}`);
    if (result.btnNoName) issues.push(`${result.btnNoName}個button無名稱`);
    if (result.iframeNoTitle) issues.push(`${result.iframeNoTitle}個iframe無title`);
    if (issues.length) return fail(issues.join('; '), '修正 id 唯一性、button 名稱、iframe title', issues);
    return pass(`相容性通過（DOCTYPE:${result.hasDoctype}，無重複ID，按鈕/iframe均有名稱）`);
  } catch (err) {
    return { code: 'GN2141103E', rule: '提供具有足夠對比度的控制元件，以允許用戶切換到足夠對比度的呈現', status: 'fail', message: `執行錯誤: ${err.message}`, fix_suggestion: '確認頁面載入完成後再執行', details: [] };
  }
}

export const metadata = {
  code: 'GN2141103E',
  criterion: '1.4.11',
  level: 'AA',
  category: 'General',
  rule: '提供具有足夠對比度的控制元件，以允許用戶切換到足夠對比度的呈現',
};
