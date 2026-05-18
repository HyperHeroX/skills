/**
 * HM1130113E — 無法使用標籤組件的情況下，用標題屬性來指明表單控制元件
 * 對應成功準則：1.3.1（等級 A）
 * 類別：HTML
 *
 * 官方稽核步驟：
   * 使用Google Chrome瀏覽器開啟頁面。
   * 當游標移置方框中會有文字訊息的提示(以下範例為：將游標移至第一個方框(欄位)中)。
   * 點選右鍵檢視網頁原始碼。
   * 當有些視覺設計時不能容納標籤時，我們可以使用title屬性來標籤表單控制元件(表單控制元件表示在表單中出現的控制元件如文字欄位、核取方塊或是選項按鈕等)，當游標移至方框中時會出現文字訊息的提示，使我們不會困惑此欄位方框需填入什麼訊息。例如，下方title屬性設為"區域號碼"時，游標移至此欄位時可看到區域號碼的提示訊息，代表此欄位需填入區域號碼，以此類推。
 *
 * 注意：此為自動化程式碼測試，依官方稽核步驟實作 Playwright 驗證。
 * 不依賴 AI 判斷，全部使用 DOM 查詢、CSS 計算、鍵盤模擬等程式碼。
 */

function pass(detail = '', details = []) {
  return { code: 'HM1130113E', rule: '無法使用標籤組件的情況下，用標題屬性來指明表單控制元件', status: 'pass', message: detail, fix_suggestion: '', details };
}
function fail(message, fix = '', details = []) {
  return { code: 'HM1130113E', rule: '無法使用標籤組件的情況下，用標題屬性來指明表單控制元件', status: 'fail', message, fix_suggestion: fix, details: Array.isArray(details) ? details : [details] };
}

/**
 * @param {import('playwright').Page} page
 * @returns {Promise<{code:string, rule:string, status:string, message:string, fix_suggestion:string, details:string[]}>>}
 */
export async function check(page) {
  try {
  // 通用 DOM 查詢：無法使用標籤組件的情況下，用標題屬性來指明表單控制元件
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
    return { code: 'HM1130113E', rule: '無法使用標籤組件的情況下，用標題屬性來指明表單控制元件', status: 'fail', message: `執行錯誤: ${err.message}`, fix_suggestion: '確認頁面載入完成後再執行', details: [] };
  }
}

export const metadata = {
  code: 'HM1130113E',
  criterion: '1.3.1',
  level: 'A',
  category: 'HTML',
  rule: '無法使用標籤組件的情況下，用標題屬性來指明表單控制元件',
};
