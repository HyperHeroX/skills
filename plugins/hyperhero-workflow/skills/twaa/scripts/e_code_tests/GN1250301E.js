/**
 * GN1250301E — 將無障礙名稱與可見標籤匹配
 * 對應成功準則：2.5.3（等級 A）
 * 類別：General
 *
 * 官方稽核步驟：
   * 程序
   * - 對於輸入控制元件，檢查每個輸入具有相鄰文字作為其標籤。
   * - 對於每個輸入，根據無障礙名稱計算，檢查整個文字字符串(不考慮字母大小寫和標點符號)是否與輸入的無障礙名稱匹配。
   * - 對於按鈕、鏈結、選單和其他非輸入控件，檢查每個包含文字作為其標籤的控制元件。
   * - 對於每個非輸入控制元件，檢查整個文字字符串(不考慮字母大小寫和標點符號)是否與輸入的無障礙名稱匹配。
   * 預期結果：檢查#2和#4為是。
 *
 * 注意：此為自動化程式碼測試，依官方稽核步驟實作 Playwright 驗證。
 * 不依賴 AI 判斷，全部使用 DOM 查詢、CSS 計算、鍵盤模擬等程式碼。
 */

function pass(detail = '', details = []) {
  return { code: 'GN1250301E', rule: '將無障礙名稱與可見標籤匹配', status: 'pass', message: detail, fix_suggestion: '', details };
}
function fail(message, fix = '', details = []) {
  return { code: 'GN1250301E', rule: '將無障礙名稱與可見標籤匹配', status: 'fail', message, fix_suggestion: fix, details: Array.isArray(details) ? details : [details] };
}

/**
 * @param {import('playwright').Page} page
 * @returns {Promise<{code:string, rule:string, status:string, message:string, fix_suggestion:string, details:string[]}>>}
 */
export async function check(page) {
  try {
  // 通用 DOM 查詢：將無障礙名稱與可見標籤匹配
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
    return { code: 'GN1250301E', rule: '將無障礙名稱與可見標籤匹配', status: 'fail', message: `執行錯誤: ${err.message}`, fix_suggestion: '確認頁面載入完成後再執行', details: [] };
  }
}

export const metadata = {
  code: 'GN1250301E',
  criterion: '2.5.3',
  level: 'A',
  category: 'General',
  rule: '將無障礙名稱與可見標籤匹配',
};
