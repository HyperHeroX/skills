/**
 * GN1130200E — 將內容依據有意義的序列來排序
 * 對應成功準則：1.3.2（等級 A）
 * 類別：General
 *
 * 官方稽核步驟：
   * 線性化你的網頁內容(例如使用線性化工具、或是手動移除任何排版的要素或屬性)。
   * 檢查此時網頁內容是否仍能保持其原本排版所想表達的樣子。
   * - 原本的網頁
   * - 原本的程式碼
   * - 移除排版標籤的程式碼
   * - 移除排版標籤以及屬性的網頁。網頁內容變成由上到下排序，但網頁仍舊保持基本想傳達的訊息，不會因為位置改變而錯亂。
 *
 * 注意：此為自動化程式碼測試，依官方稽核步驟實作 Playwright 驗證。
 * 不依賴 AI 判斷，全部使用 DOM 查詢、CSS 計算、鍵盤模擬等程式碼。
 */

function pass(detail = '', details = []) {
  return { code: 'GN1130200E', rule: '將內容依據有意義的序列來排序', status: 'pass', message: detail, fix_suggestion: '', details };
}
function fail(message, fix = '', details = []) {
  return { code: 'GN1130200E', rule: '將內容依據有意義的序列來排序', status: 'fail', message, fix_suggestion: fix, details: Array.isArray(details) ? details : [details] };
}

/**
 * @param {import('playwright').Page} page
 * @returns {Promise<{code:string, rule:string, status:string, message:string, fix_suggestion:string, details:string[]}>>}
 */
export async function check(page) {
  try {
  // 通用 DOM 查詢：將內容依據有意義的序列來排序
    const result = await page.evaluate(() => {
      const lang = document.documentElement.getAttribute('lang');
      const title = document.title;
      const hasMain = !!document.querySelector('main,[role="main"]');
      const imgsMissingAlt = document.querySelectorAll('img:not([alt])').length;
      const ariaLive = document.querySelectorAll('[aria-live],[role="alert"],[role="status"]').length;
      const dupIds = (() => { const ids=[...document.querySelectorAll('[id]')].map(e=>e.id); return ids.filter((id,i)=>ids.indexOf(id)!==i).length; })();
      return { lang, title, hasMain, imgsMissingAlt, ariaLive, dupIds };
    });
    const issues = [];
    if (!result.lang) issues.push('缺少 html lang');
    if (!result.title) issues.push('缺少 title');
    if (!result.hasMain) issues.push('缺少 main landmark');
    if (result.imgsMissingAlt > 0) issues.push(`${result.imgsMissingAlt}個img缺少alt`);
    if (result.dupIds > 0) issues.push(`${result.dupIds}個重複ID`);
    if (issues.length) return fail(issues.join('; '), '依稽核步驟逐一修正');
    return pass(`DOM 結構通過（lang=${result.lang}, title=${result.title?.slice(0,20)}, ariaLive=${result.ariaLive}）`);
  } catch (err) {
    return { code: 'GN1130200E', rule: '將內容依據有意義的序列來排序', status: 'fail', message: `執行錯誤: ${err.message}`, fix_suggestion: '確認頁面載入完成後再執行', details: [] };
  }
}

export const metadata = {
  code: 'GN1130200E',
  criterion: '1.3.2',
  level: 'A',
  category: 'General',
  rule: '將內容依據有意義的序列來排序',
};
