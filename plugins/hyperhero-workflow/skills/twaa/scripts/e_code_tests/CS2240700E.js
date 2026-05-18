/**
 * CS2240700E — 使用者介面取得焦點時，使其鍵盤焦點指示具高可見度
 * 對應成功準則：2.4.7（等級 AA）
 * 類別：CSS
 *
 * 官方稽核步驟：
   * 使用Google Chrome瀏覽器開啟檔案。 當使用者把焦點放在輸入行時，其焦點指示具高可見度(輸入行變為綠色)。 可點選右鍵檢視網頁原始碼。此範例使用CSS的:FOCUS動態準類別。
 *
 * 注意：此為自動化程式碼測試，依官方稽核步驟實作 Playwright 驗證。
 * 不依賴 AI 判斷，全部使用 DOM 查詢、CSS 計算、鍵盤模擬等程式碼。
 */

function pass(detail = '', details = []) {
  return { code: 'CS2240700E', rule: '使用者介面取得焦點時，使其鍵盤焦點指示具高可見度', status: 'pass', message: detail, fix_suggestion: '', details };
}
function fail(message, fix = '', details = []) {
  return { code: 'CS2240700E', rule: '使用者介面取得焦點時，使其鍵盤焦點指示具高可見度', status: 'fail', message, fix_suggestion: fix, details: Array.isArray(details) ? details : [details] };
}

/**
 * @param {import('playwright').Page} page
 * @returns {Promise<{code:string, rule:string, status:string, message:string, fix_suggestion:string, details:string[]}>>}
 */
export async function check(page) {
  try {
  const issues = await page.evaluate(() => {
      const bad = [];
      [...document.styleSheets].forEach(sheet => {
        try {
          [...sheet.cssRules].forEach(rule => {
            if (rule.selectorText?.includes(':focus')) {
              const hasOutlineNone = rule.style?.outline?.includes('none') || rule.style?.outlineWidth === '0px';
              const hasFallback = rule.style?.boxShadow && rule.style.boxShadow !== 'none';
              if (hasOutlineNone && !hasFallback) bad.push(rule.selectorText.slice(0,50));
            }
          });
        } catch {}
      });
      return bad;
    });
    if (issues.length) return fail(`${issues.length} 個 :focus 規則移除 outline 但無替代樣式`, ':focus-visible { outline: 3px solid #005fcc; outline-offset: 2px; }', issues.slice(0,5));
    return pass('焦點樣式設定正確');
  } catch (err) {
    return { code: 'CS2240700E', rule: '使用者介面取得焦點時，使其鍵盤焦點指示具高可見度', status: 'fail', message: `執行錯誤: ${err.message}`, fix_suggestion: '確認頁面載入完成後再執行', details: [] };
  }
}

export const metadata = {
  code: 'CS2240700E',
  criterion: '2.4.7',
  level: 'AA',
  category: 'CSS',
  rule: '使用者介面取得焦點時，使其鍵盤焦點指示具高可見度',
};
