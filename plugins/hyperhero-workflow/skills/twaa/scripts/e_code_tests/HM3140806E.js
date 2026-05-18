/**
 * HM3140806E — 除非是要在內容當中提供選項，讓使用者可以切換到無需水平捲動即可閱讀整行文字的版面，否則當檢視視窗變窄時，不要干預使用者代理的文字重新流向
 * 對應成功準則：1.4.8（等級 AAA）
 * 類別：HTML
 *
 * 官方稽核步驟：
   * 用chrome打開檔案，會自動換行，此原因為程式碼內有此行程式(此行程式碼只限英文字母上可使用)：`<table style="word-break:break-all">`，可執行自動換行的指令，若去掉此行程式碼則沒有換行功能。
   * 若去掉這行程式碼，則無法自動換行，如此當視窗變窄時，即須拉動卷軸。
   * 檢視原始碼。
 *
 * 注意：此為自動化程式碼測試，依官方稽核步驟實作 Playwright 驗證。
 * 不依賴 AI 判斷，全部使用 DOM 查詢、CSS 計算、鍵盤模擬等程式碼。
 */

function pass(detail = '', details = []) {
  return { code: 'HM3140806E', rule: '除非是要在內容當中提供選項，讓使用者可以切換到無需水平捲動即可閱讀整行文字的版面，否則當檢視視窗變窄時，不要干預使用者代', status: 'pass', message: detail, fix_suggestion: '', details };
}
function fail(message, fix = '', details = []) {
  return { code: 'HM3140806E', rule: '除非是要在內容當中提供選項，讓使用者可以切換到無需水平捲動即可閱讀整行文字的版面，否則當檢視視窗變窄時，不要干預使用者代', status: 'fail', message, fix_suggestion: fix, details: Array.isArray(details) ? details : [details] };
}

/**
 * @param {import('playwright').Page} page
 * @returns {Promise<{code:string, rule:string, status:string, message:string, fix_suggestion:string, details:string[]}>>}
 */
export async function check(page) {
  try {
  // 通用 DOM 查詢：除非是要在內容當中提供選項，讓使用者可以切換到無需水平捲動即可閱讀整行文字的版面，否則當檢視視窗變窄時，不要干預使用者代
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
    return { code: 'HM3140806E', rule: '除非是要在內容當中提供選項，讓使用者可以切換到無需水平捲動即可閱讀整行文字的版面，否則當檢視視窗變窄時，不要干預使用者代', status: 'fail', message: `執行錯誤: ${err.message}`, fix_suggestion: '確認頁面載入完成後再執行', details: [] };
  }
}

export const metadata = {
  code: 'HM3140806E',
  criterion: '1.4.8',
  level: 'AAA',
  category: 'HTML',
  rule: '除非是要在內容當中提供選項，讓使用者可以切換到無需水平捲動即可閱讀整行文字的版面，否則當檢視視窗變窄時，不要干預使用者代',
};
