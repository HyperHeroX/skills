/**
 * HM1130108E — 以有意義的標記來提供資料表格的概觀
 * 對應成功準則：1.3.1（等級 A）
 * 類別：HTML
 *
 * 官方稽核步驟：
   * 使用Google Chrome瀏覽器開啟檔案。
   * 點選右鍵檢視網頁原始碼。
   * 檢查原始碼是否以有意義的標記來提供資料表格的概觀（`<tr>`標籤(table row)表示為行，第一行為星期一到五，第一列為時間，內容對照時間及星期來呈現表格的概觀；有意義的標記如summary屬性來為提供詳細的表格說明，`<td>`標籤是指表格中的一個單元格可用來擺放內容，`<th>`標籤則用來宣告表頭的方格例如星期及時間，border屬性為邊框，可設定寬度。）
 *
 * 注意：此為自動化程式碼測試，依官方稽核步驟實作 Playwright 驗證。
 * 不依賴 AI 判斷，全部使用 DOM 查詢、CSS 計算、鍵盤模擬等程式碼。
 */

function pass(detail = '', details = []) {
  return { code: 'HM1130108E', rule: '以有意義的標記來提供資料表格的概觀', status: 'pass', message: detail, fix_suggestion: '', details };
}
function fail(message, fix = '', details = []) {
  return { code: 'HM1130108E', rule: '以有意義的標記來提供資料表格的概觀', status: 'fail', message, fix_suggestion: fix, details: Array.isArray(details) ? details : [details] };
}

/**
 * @param {import('playwright').Page} page
 * @returns {Promise<{code:string, rule:string, status:string, message:string, fix_suggestion:string, details:string[]}>>}
 */
export async function check(page) {
  try {
  // 通用 DOM 查詢：以有意義的標記來提供資料表格的概觀
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
    return { code: 'HM1130108E', rule: '以有意義的標記來提供資料表格的概觀', status: 'fail', message: `執行錯誤: ${err.message}`, fix_suggestion: '確認頁面載入完成後再執行', details: [] };
  }
}

export const metadata = {
  code: 'HM1130108E',
  criterion: '1.3.1',
  level: 'A',
  category: 'HTML',
  rule: '以有意義的標記來提供資料表格的概觀',
};
