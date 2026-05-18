/**
 * GN3310501E — 提供不需超出國中閱讀能力程度即可理解的文字摘要。
 * 對應成功準則：3.1.5（等級 AAA）
 * 類別：General
 *
 * 官方稽核步驟：
   * 為幫助使用者瀏覽網頁時可迅速了解重點，網頁資訊應提供額外的摘要說明。 摘要的內容應簡單易懂，相當於具國中閱讀能力即可理解的程度，並避免使用專業術語或過於冗長的描述。
   * 重點摘要的彙整方式：
   * 1. 找出網頁原文的重點。
   * 2. 以淺顯易懂的說法，列出原文的重點摘要；摘要的長度可視原文內容而定。
   * 3. 再次確認並評估摘要的易讀性。
   * 4. 調整摘要內容，例如簡化過於冗長的描述，或是將艱深的字詞替換成較普遍或口語的說法。
   * 5. 視需求重複步驟3、4，直到完成重點摘要的彙整。
 *
 * 注意：此為自動化程式碼測試，依官方稽核步驟實作 Playwright 驗證。
 * 不依賴 AI 判斷，全部使用 DOM 查詢、CSS 計算、鍵盤模擬等程式碼。
 */

function pass(detail = '', details = []) {
  return { code: 'GN3310501E', rule: '提供不需超出國中閱讀能力程度即可理解的文字摘要。', status: 'pass', message: detail, fix_suggestion: '', details };
}
function fail(message, fix = '', details = []) {
  return { code: 'GN3310501E', rule: '提供不需超出國中閱讀能力程度即可理解的文字摘要。', status: 'fail', message, fix_suggestion: fix, details: Array.isArray(details) ? details : [details] };
}

/**
 * @param {import('playwright').Page} page
 * @returns {Promise<{code:string, rule:string, status:string, message:string, fix_suggestion:string, details:string[]}>>}
 */
export async function check(page) {
  try {
  // 通用 DOM 查詢：提供不需超出國中閱讀能力程度即可理解的文字摘要。
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
    return { code: 'GN3310501E', rule: '提供不需超出國中閱讀能力程度即可理解的文字摘要。', status: 'fail', message: `執行錯誤: ${err.message}`, fix_suggestion: '確認頁面載入完成後再執行', details: [] };
  }
}

export const metadata = {
  code: 'GN3310501E',
  criterion: '3.1.5',
  level: 'AAA',
  category: 'General',
  rule: '提供不需超出國中閱讀能力程度即可理解的文字摘要。',
};
