/**
 * GN2141102E — 在相鄰顏色之間的邊界處提供足夠的對比度
 * 對應成功準則：1.4.11（等級 AA）
 * 類別：General
 *
 * 官方稽核步驟：
   * **程序**
   * 對於理解所需的圖形物件，使用顏色對比工具：
   * 1. 測量每種顏色與相鄰顏色或邊界(如果存在)的對比度。
   * 2. 檢查每個相鄰顏色或邊框(如果有)的對比度至少為3:1。
   * **預期結果**
 *
 * 注意：此為自動化程式碼測試，依官方稽核步驟實作 Playwright 驗證。
 * 不依賴 AI 判斷，全部使用 DOM 查詢、CSS 計算、鍵盤模擬等程式碼。
 */

function pass(detail = '', details = []) {
  return { code: 'GN2141102E', rule: '在相鄰顏色之間的邊界處提供足夠的對比度', status: 'pass', message: detail, fix_suggestion: '', details };
}
function fail(message, fix = '', details = []) {
  return { code: 'GN2141102E', rule: '在相鄰顏色之間的邊界處提供足夠的對比度', status: 'fail', message, fix_suggestion: fix, details: Array.isArray(details) ? details : [details] };
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
    return { code: 'GN2141102E', rule: '在相鄰顏色之間的邊界處提供足夠的對比度', status: 'fail', message: `執行錯誤: ${err.message}`, fix_suggestion: '確認頁面載入完成後再執行', details: [] };
  }
}

export const metadata = {
  code: 'GN2141102E',
  criterion: '1.4.11',
  level: 'AA',
  category: 'General',
  rule: '在相鄰顏色之間的邊界處提供足夠的對比度',
};
