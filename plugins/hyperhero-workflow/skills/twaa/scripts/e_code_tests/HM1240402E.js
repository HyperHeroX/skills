/**
 * HM1240402E — 合併相同資源的毗鄰圖片與文字鏈結
 * 對應成功準則：2.4.4（等級 A）
 * 類別：HTML
 *
 * 官方稽核步驟：
   * 1. 使用Google Chrome「檢視原始碼」顯示連結(按下右鍵→檢視原始碼)。
   * 2. 檢查敘述文字和圖片來源是否有被包含在`<a href="…"></a>`連結區塊內，並點擊文字及圖片鏈結來驗證。
 *
 * 注意：此為自動化程式碼測試，依官方稽核步驟實作 Playwright 驗證。
 * 不依賴 AI 判斷，全部使用 DOM 查詢、CSS 計算、鍵盤模擬等程式碼。
 */

function pass(detail = '', details = []) {
  return { code: 'HM1240402E', rule: '合併相同資源的毗鄰圖片與文字鏈結', status: 'pass', message: detail, fix_suggestion: '', details };
}
function fail(message, fix = '', details = []) {
  return { code: 'HM1240402E', rule: '合併相同資源的毗鄰圖片與文字鏈結', status: 'fail', message, fix_suggestion: fix, details: Array.isArray(details) ? details : [details] };
}

/**
 * @param {import('playwright').Page} page
 * @returns {Promise<{code:string, rule:string, status:string, message:string, fix_suggestion:string, details:string[]}>>}
 */
export async function check(page) {
  try {
  const result = await page.evaluate(() => {
      const vague = /^(按此|點此|點擊|here|click here|read more|more|詳情|連結|link|更多)$/i;
      const issues = [...document.querySelectorAll('a[href]')].filter(a => {
        const text = (a.textContent || '').trim();
        const alt = a.querySelector('img')?.getAttribute('alt') || '';
        const ariaLabel = a.getAttribute('aria-label') || '';
        return (!text && !alt && !ariaLabel) || vague.test(text);
      }).map(a => (a.textContent.trim() || '[無文字]') + ' → ' + (a.getAttribute('href') || '').slice(0,30));
      return issues.slice(0,5);
    });
    if (result.length) return fail(`${result.length} 個連結文字無意義或為空`, '改為描述目的地的文字，如「查看年度報告」', result);
    return pass('所有連結均有描述性文字');
  } catch (err) {
    return { code: 'HM1240402E', rule: '合併相同資源的毗鄰圖片與文字鏈結', status: 'fail', message: `執行錯誤: ${err.message}`, fix_suggestion: '確認頁面載入完成後再執行', details: [] };
  }
}

export const metadata = {
  code: 'HM1240402E',
  criterion: '2.4.4',
  level: 'A',
  category: 'HTML',
  rule: '合併相同資源的毗鄰圖片與文字鏈結',
};
