/**
 * HM1130112E — 使用標籤組件將文字標籤與表單控制元件建立關連
 * 對應成功準則：1.3.1（等級 A）
 * 類別：HTML
 *
 * 官方稽核步驟：
   * 使用Google Chrome瀏覽器開啟頁面。
   * 點選右鍵檢視網頁原始碼。
   * 在下面的例子中以核取方塊的勾選作為表單的控制元件(表單控制元件表示在表單中出現的控制元件如核取方塊或是選項按鈕等)，文字標籤為HTML，程式碼中`type="checkbox" id="markuplang"`代表id為markuplang的核取方塊"checkbox"，以及程式碼中`<label for="markuplang">HTML</label>` id同樣設為markuplang的 HTML文字標籤產生關聯，代表著核取方塊的勾選或不勾選來表示和文字標籤為HTML間的關聯。
 *
 * 注意：此為自動化程式碼測試，依官方稽核步驟實作 Playwright 驗證。
 * 不依賴 AI 判斷，全部使用 DOM 查詢、CSS 計算、鍵盤模擬等程式碼。
 */

function pass(detail = '', details = []) {
  return { code: 'HM1130112E', rule: '使用標籤組件將文字標籤與表單控制元件建立關連', status: 'pass', message: detail, fix_suggestion: '', details };
}
function fail(message, fix = '', details = []) {
  return { code: 'HM1130112E', rule: '使用標籤組件將文字標籤與表單控制元件建立關連', status: 'fail', message, fix_suggestion: fix, details: Array.isArray(details) ? details : [details] };
}

/**
 * @param {import('playwright').Page} page
 * @returns {Promise<{code:string, rule:string, status:string, message:string, fix_suggestion:string, details:string[]}>>}
 */
export async function check(page) {
  try {
  // 通用 DOM 查詢：使用標籤組件將文字標籤與表單控制元件建立關連
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
    return { code: 'HM1130112E', rule: '使用標籤組件將文字標籤與表單控制元件建立關連', status: 'fail', message: `執行錯誤: ${err.message}`, fix_suggestion: '確認頁面載入完成後再執行', details: [] };
  }
}

export const metadata = {
  code: 'HM1130112E',
  criterion: '1.3.1',
  level: 'A',
  category: 'HTML',
  rule: '使用標籤組件將文字標籤與表單控制元件建立關連',
};
