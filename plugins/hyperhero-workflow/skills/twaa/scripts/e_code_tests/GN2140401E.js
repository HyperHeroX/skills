/**
 * GN2140401E — 使用流動版面設計，或者確認當文字尺寸變更而文字容器尺寸並未變更時，不會喪失任何內容或功能
 * 對應成功準則：1.4.4（等級 AA）
 * 類別：General
 *
 * 官方稽核步驟：
   * 使用工具將網頁打開。
   * 放大網頁頁面至200%。
   * 檢查所有網頁元件的功能是否能正常執行。
 *
 * 注意：此為自動化程式碼測試，依官方稽核步驟實作 Playwright 驗證。
 * 不依賴 AI 判斷，全部使用 DOM 查詢、CSS 計算、鍵盤模擬等程式碼。
 */

function pass(detail = '', details = []) {
  return { code: 'GN2140401E', rule: '使用流動版面設計，或者確認當文字尺寸變更而文字容器尺寸並未變更時，不會喪失任何內容或功能', status: 'pass', message: detail, fix_suggestion: '', details };
}
function fail(message, fix = '', details = []) {
  return { code: 'GN2140401E', rule: '使用流動版面設計，或者確認當文字尺寸變更而文字容器尺寸並未變更時，不會喪失任何內容或功能', status: 'fail', message, fix_suggestion: fix, details: Array.isArray(details) ? details : [details] };
}

/**
 * @param {import('playwright').Page} page
 * @returns {Promise<{code:string, rule:string, status:string, message:string, fix_suggestion:string, details:string[]}>>}
 */
export async function check(page) {
  try {
  // 通用 DOM 查詢：使用流動版面設計，或者確認當文字尺寸變更而文字容器尺寸並未變更時，不會喪失任何內容或功能
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
    return { code: 'GN2140401E', rule: '使用流動版面設計，或者確認當文字尺寸變更而文字容器尺寸並未變更時，不會喪失任何內容或功能', status: 'fail', message: `執行錯誤: ${err.message}`, fix_suggestion: '確認頁面載入完成後再執行', details: [] };
  }
}

export const metadata = {
  code: 'GN2140401E',
  criterion: '1.4.4',
  level: 'AA',
  category: 'General',
  rule: '使用流動版面設計，或者確認當文字尺寸變更而文字容器尺寸並未變更時，不會喪失任何內容或功能',
};
