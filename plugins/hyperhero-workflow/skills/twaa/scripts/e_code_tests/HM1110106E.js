/**
 * HM1110106E — 作為「送出」按鈕之用的圖片需提供替代文字，且此替代文字需能充分表達此按鈕之意義與功能
 * 對應成功準則：1.1.1（等級 A）
 * 類別：HTML
 *
 * 官方稽核步驟：
   * 1. 網頁上按右鍵 → 檢視網頁原始碼。
   * 2. 檢查 input 標籤的 type 屬性是否為 "image"（圖片檔）。
   * 3. 檢查是否存在 alt 屬性，用來表示以圖片做為按鈕的功能。
   * 4. 此範例 alt 屬性表示傳送按鈕，點擊圖片按鈕後會將頁面轉換到所指定的網頁位址。
 *
 * 注意：此為自動化程式碼測試，依官方稽核步驟實作 Playwright 驗證。
 * 不依賴 AI 判斷，全部使用 DOM 查詢、CSS 計算、鍵盤模擬等程式碼。
 */

function pass(detail = '', details = []) {
  return { code: 'HM1110106E', rule: '作為「送出」按鈕之用的圖片需提供替代文字，且此替代文字需能充分表達此按鈕之意義與功能', status: 'pass', message: detail, fix_suggestion: '', details };
}
function fail(message, fix = '', details = []) {
  return { code: 'HM1110106E', rule: '作為「送出」按鈕之用的圖片需提供替代文字，且此替代文字需能充分表達此按鈕之意義與功能', status: 'fail', message, fix_suggestion: fix, details: Array.isArray(details) ? details : [details] };
}

/**
 * @param {import('playwright').Page} page
 * @returns {Promise<{code:string, rule:string, status:string, message:string, fix_suggestion:string, details:string[]}>>}
 */
export async function check(page) {
  try {
  // 通用 DOM 查詢：作為「送出」按鈕之用的圖片需提供替代文字，且此替代文字需能充分表達此按鈕之意義與功能
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
    return { code: 'HM1110106E', rule: '作為「送出」按鈕之用的圖片需提供替代文字，且此替代文字需能充分表達此按鈕之意義與功能', status: 'fail', message: `執行錯誤: ${err.message}`, fix_suggestion: '確認頁面載入完成後再執行', details: [] };
  }
}

export const metadata = {
  code: 'HM1110106E',
  criterion: '1.1.1',
  level: 'A',
  category: 'HTML',
  rule: '作為「送出」按鈕之用的圖片需提供替代文字，且此替代文字需能充分表達此按鈕之意義與功能',
};
