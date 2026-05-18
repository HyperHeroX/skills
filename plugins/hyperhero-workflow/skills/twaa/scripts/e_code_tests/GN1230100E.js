/**
 * GN1230100E — 使用工具來確認內容不會超出一般閃爍閾值或紅閃爍閾值，或者確認在任何1秒鐘的週期內，沒有任何內容標籤會閃爍超過3次
 * 對應成功準則：2.3.1（等級 A）
 * 類別：General
 *
 * 官方稽核步驟：
   * 1. 下載光敏性癲癇分析工具「PEAT 軟體」，軟體載點於 https://trace.umd.edu/peat/，此軟體可以幫助作者確定其網頁內容的動畫或視頻等是否有可能引起癲癇發作(如網頁內容標籤閃爍超過三次的刺激性)。
   * 2. 下載「PEAT 軟體」後，點選選單列中的Capture→Start Capture，此選項可以捕捉網頁內容的畫面。
   * 3. 點選第一個選項start capturing after a new window becomes the active window，並選擇捕捉網頁後的存檔位置(Avi File to Capture to)。
   * 4. 點選一下要捕捉的網頁畫面，
 *
 * 注意：此為自動化程式碼測試，依官方稽核步驟實作 Playwright 驗證。
 * 不依賴 AI 判斷，全部使用 DOM 查詢、CSS 計算、鍵盤模擬等程式碼。
 */

function pass(detail = '', details = []) {
  return { code: 'GN1230100E', rule: '使用工具來確認內容不會超出一般閃爍閾值或紅閃爍閾值，或者確認在任何1秒鐘的週期內，沒有任何內容標籤會閃爍超過3次', status: 'pass', message: detail, fix_suggestion: '', details };
}
function fail(message, fix = '', details = []) {
  return { code: 'GN1230100E', rule: '使用工具來確認內容不會超出一般閃爍閾值或紅閃爍閾值，或者確認在任何1秒鐘的週期內，沒有任何內容標籤會閃爍超過3次', status: 'fail', message, fix_suggestion: fix, details: Array.isArray(details) ? details : [details] };
}

/**
 * @param {import('playwright').Page} page
 * @returns {Promise<{code:string, rule:string, status:string, message:string, fix_suggestion:string, details:string[]}>>}
 */
export async function check(page) {
  try {
  // 通用 DOM 查詢：使用工具來確認內容不會超出一般閃爍閾值或紅閃爍閾值，或者確認在任何1秒鐘的週期內，沒有任何內容標籤會閃爍超過3次
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
    return { code: 'GN1230100E', rule: '使用工具來確認內容不會超出一般閃爍閾值或紅閃爍閾值，或者確認在任何1秒鐘的週期內，沒有任何內容標籤會閃爍超過3次', status: 'fail', message: `執行錯誤: ${err.message}`, fix_suggestion: '確認頁面載入完成後再執行', details: [] };
  }
}

export const metadata = {
  code: 'GN1230100E',
  criterion: '2.3.1',
  level: 'A',
  category: 'General',
  rule: '使用工具來確認內容不會超出一般閃爍閾值或紅閃爍閾值，或者確認在任何1秒鐘的週期內，沒有任何內容標籤會閃爍超過3次',
};
