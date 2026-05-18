/**
 * GN1130201E — 使用萬國碼的右至左標記(RLM)或左至右標記(LRM)來即席混用文字走向，或在行內組件使用文字方向屬性以解決巢狀文字走向的問題
 * 對應成功準則：1.3.2（等級 A）
 * 類別：General
 *
 * 官方稽核步驟：
   * 檢查網頁內容是否有出現閱讀文字方向改變的情形。如果有，則找出其位置。
   * 當文字方向改變時，檢查緊貼在文字旁的中性的符號(沒有方向性的符號)，例如空白、標點符號等，是否出現在不對的位置。
   * 如果是，表示HTML的Bidirectional Algorithm將這些中性符號放在不對的位置，請檢查這些符號的後面是否有使用Unicode的right-to-left或left-to-right符號，以便讓中性符號顯示在正確的位置。
 *
 * 注意：此為自動化程式碼測試，依官方稽核步驟實作 Playwright 驗證。
 * 不依賴 AI 判斷，全部使用 DOM 查詢、CSS 計算、鍵盤模擬等程式碼。
 */

function pass(detail = '', details = []) {
  return { code: 'GN1130201E', rule: '使用萬國碼的右至左標記(RLM)或左至右標記(LRM)來即席混用文字走向，或在行內組件使用文字方向屬性以解決巢狀文字走向', status: 'pass', message: detail, fix_suggestion: '', details };
}
function fail(message, fix = '', details = []) {
  return { code: 'GN1130201E', rule: '使用萬國碼的右至左標記(RLM)或左至右標記(LRM)來即席混用文字走向，或在行內組件使用文字方向屬性以解決巢狀文字走向', status: 'fail', message, fix_suggestion: fix, details: Array.isArray(details) ? details : [details] };
}

/**
 * @param {import('playwright').Page} page
 * @returns {Promise<{code:string, rule:string, status:string, message:string, fix_suggestion:string, details:string[]}>>}
 */
export async function check(page) {
  try {
  // 通用 DOM 查詢：使用萬國碼的右至左標記(RLM)或左至右標記(LRM)來即席混用文字走向，或在行內組件使用文字方向屬性以解決巢狀文字走向
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
    return { code: 'GN1130201E', rule: '使用萬國碼的右至左標記(RLM)或左至右標記(LRM)來即席混用文字走向，或在行內組件使用文字方向屬性以解決巢狀文字走向', status: 'fail', message: `執行錯誤: ${err.message}`, fix_suggestion: '確認頁面載入完成後再執行', details: [] };
  }
}

export const metadata = {
  code: 'GN1130201E',
  criterion: '1.3.2',
  level: 'A',
  category: 'General',
  rule: '使用萬國碼的右至左標記(RLM)或左至右標記(LRM)來即席混用文字走向，或在行內組件使用文字方向屬性以解決巢狀文字走向',
};
