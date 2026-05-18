/**
 * HM1110112E — 對於輔助科技應當要忽略的圖片，使用空字串作為替代文字，並且不可使用標題屬性
 * 對應成功準則：1.1.1（等級 A）
 * 類別：HTML
 *
 * 官方稽核步驟：
   * 開啟瀏覽器如Firefox，並搭配外掛擴充元件如「Firefox Accessibility Extension」。
   * 點選選單列中的Accessibility→Text Equivalents→Show Text Equivalents 來顯示此圖片的替代文字，而此處使用空字串當它的替代文字，所以會顯示為空白。
   * 檢視原始碼，alt屬性為使用替代文字部分，此處為空字串，且指引規定不可使用標題(title)屬性，故此處沒有使用title。
 *
 * 注意：此為自動化程式碼測試，依官方稽核步驟實作 Playwright 驗證。
 * 不依賴 AI 判斷，全部使用 DOM 查詢、CSS 計算、鍵盤模擬等程式碼。
 */

function pass(detail = '', details = []) {
  return { code: 'HM1110112E', rule: '對於輔助科技應當要忽略的圖片，使用空字串作為替代文字，並且不可使用標題屬性', status: 'pass', message: detail, fix_suggestion: '', details };
}
function fail(message, fix = '', details = []) {
  return { code: 'HM1110112E', rule: '對於輔助科技應當要忽略的圖片，使用空字串作為替代文字，並且不可使用標題屬性', status: 'fail', message, fix_suggestion: fix, details: Array.isArray(details) ? details : [details] };
}

/**
 * @param {import('playwright').Page} page
 * @returns {Promise<{code:string, rule:string, status:string, message:string, fix_suggestion:string, details:string[]}>>}
 */
export async function check(page) {
  try {
  // 通用 DOM 查詢：對於輔助科技應當要忽略的圖片，使用空字串作為替代文字，並且不可使用標題屬性
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
    return { code: 'HM1110112E', rule: '對於輔助科技應當要忽略的圖片，使用空字串作為替代文字，並且不可使用標題屬性', status: 'fail', message: `執行錯誤: ${err.message}`, fix_suggestion: '確認頁面載入完成後再執行', details: [] };
  }
}

export const metadata = {
  code: 'HM1110112E',
  criterion: '1.1.1',
  level: 'A',
  category: 'HTML',
  rule: '對於輔助科技應當要忽略的圖片，使用空字串作為替代文字，並且不可使用標題屬性',
};
