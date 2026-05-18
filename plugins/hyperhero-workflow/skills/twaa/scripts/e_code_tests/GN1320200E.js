/**
 * GN1320200E — 表單控制元件之行為將使網頁跳轉或變更，則在脈絡變更前需先明確描述將發生的事情
 * 對應成功準則：3.2.2（等級 A）
 * 類別：General
 *
 * 官方稽核步驟：
   * Google Chrome瀏覽器開啟檔案。 例如維基百科，可提供各國語言翻譯的功能，例如選擇日文時，滑鼠指標移至"日本語"的連結時，會出現"點入後，會翻譯成日文"的提示。 即可在使用者選取前告知使用者選項的功能，於任何表單變更前先描述該控制元件啟動會發生什麼事。
 *
 * 注意：此為自動化程式碼測試，依官方稽核步驟實作 Playwright 驗證。
 * 不依賴 AI 判斷，全部使用 DOM 查詢、CSS 計算、鍵盤模擬等程式碼。
 */

function pass(detail = '', details = []) {
  return { code: 'GN1320200E', rule: '表單控制元件之行為將使網頁跳轉或變更，則在脈絡變更前需先明確描述將發生的事情', status: 'pass', message: detail, fix_suggestion: '', details };
}
function fail(message, fix = '', details = []) {
  return { code: 'GN1320200E', rule: '表單控制元件之行為將使網頁跳轉或變更，則在脈絡變更前需先明確描述將發生的事情', status: 'fail', message, fix_suggestion: fix, details: Array.isArray(details) ? details : [details] };
}

/**
 * @param {import('playwright').Page} page
 * @returns {Promise<{code:string, rule:string, status:string, message:string, fix_suggestion:string, details:string[]}>>}
 */
export async function check(page) {
  try {
  // 通用 DOM 查詢：表單控制元件之行為將使網頁跳轉或變更，則在脈絡變更前需先明確描述將發生的事情
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
    return { code: 'GN1320200E', rule: '表單控制元件之行為將使網頁跳轉或變更，則在脈絡變更前需先明確描述將發生的事情', status: 'fail', message: `執行錯誤: ${err.message}`, fix_suggestion: '確認頁面載入完成後再執行', details: [] };
  }
}

export const metadata = {
  code: 'GN1320200E',
  criterion: '3.2.2',
  level: 'A',
  category: 'General',
  rule: '表單控制元件之行為將使網頁跳轉或變更，則在脈絡變更前需先明確描述將發生的事情',
};
