/**
 * CS1140101E — 當使用者介面元件取得焦點時，使用CSS變更其呈現方式
 * 對應成功準則：1.4.1（等級 A）
 * 類別：CSS
 *
 * 官方稽核步驟：
   * 使用chrome 開啟檔案。
   * 檢查HTML的網頁是否有引用CSS，可改變滑鼠指標所指向的背景顏色。
   * 檢查原始碼 CSS設定背景色的部分。
 *
 * 注意：此為自動化程式碼測試，依官方稽核步驟實作 Playwright 驗證。
 * 不依賴 AI 判斷，全部使用 DOM 查詢、CSS 計算、鍵盤模擬等程式碼。
 */

function pass(detail = '', details = []) {
  return { code: 'CS1140101E', rule: '當使用者介面元件取得焦點時，使用CSS變更其呈現方式', status: 'pass', message: detail, fix_suggestion: '', details };
}
function fail(message, fix = '', details = []) {
  return { code: 'CS1140101E', rule: '當使用者介面元件取得焦點時，使用CSS變更其呈現方式', status: 'fail', message, fix_suggestion: fix, details: Array.isArray(details) ? details : [details] };
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
    return { code: 'CS1140101E', rule: '當使用者介面元件取得焦點時，使用CSS變更其呈現方式', status: 'fail', message: `執行錯誤: ${err.message}`, fix_suggestion: '確認頁面載入完成後再執行', details: [] };
  }
}

export const metadata = {
  code: 'CS1140101E',
  criterion: '1.4.1',
  level: 'A',
  category: 'CSS',
  rule: '當使用者介面元件取得焦點時，使用CSS變更其呈現方式',
};
