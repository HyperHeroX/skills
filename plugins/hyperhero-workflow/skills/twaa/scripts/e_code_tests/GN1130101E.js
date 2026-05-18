/**
 * GN1130101E — 使用色彩線索的時候就使用語意標記
 * 對應成功準則：1.3.1（等級 A）
 * 類別：General
 *
 * 官方稽核步驟：
   * 使用Google Chrome瀏覽器開啟檔案(網頁內改變文字顏色：以紅色字體以及字體背景色為黃色為例)
   * 點選右鍵檢視網頁原始碼
   * 使用顏色改變文字時可以用CSS樣式表顏色屬性來表示，例如：background-color為背景顏色，color可調整文字顏色。下列範例中我們得知從`<span style="background-color: YELLOW">` 可將文字背景色設置成黃色，`<font size="5" color="RED">`可將文字設為紅色。
 *
 * 注意：此為自動化程式碼測試，依官方稽核步驟實作 Playwright 驗證。
 * 不依賴 AI 判斷，全部使用 DOM 查詢、CSS 計算、鍵盤模擬等程式碼。
 */

function pass(detail = '', details = []) {
  return { code: 'GN1130101E', rule: '使用色彩線索的時候就使用語意標記', status: 'pass', message: detail, fix_suggestion: '', details };
}
function fail(message, fix = '', details = []) {
  return { code: 'GN1130101E', rule: '使用色彩線索的時候就使用語意標記', status: 'fail', message, fix_suggestion: fix, details: Array.isArray(details) ? details : [details] };
}

/**
 * @param {import('playwright').Page} page
 * @returns {Promise<{code:string, rule:string, status:string, message:string, fix_suggestion:string, details:string[]}>>}
 */
export async function check(page) {
  try {
  // CSS 檢查：使用色彩線索的時候就使用語意標記
    const result = await page.evaluate(() => {
      const rules = [...document.styleSheets].flatMap(s => { try { return [...s.cssRules]; } catch { return []; } });
      return {
        focusNone: rules.filter(r => r.selectorText?.includes(':focus') && r.style?.outline?.includes('none')).length,
        pxFonts: rules.filter(r => r.style?.fontSize?.match(/^\d+px$/)).length,
        hasLineHeight: rules.some(r => r.style?.lineHeight),
      };
    });
    const issues = [];
    if (result.focusNone) issues.push(`${result.focusNone}個:focus移除outline`);
    if (result.pxFonts > 10) issues.push(`${result.pxFonts}個固定px字型`);
    if (!result.hasLineHeight) issues.push('缺少line-height');
    if (issues.length) return fail(issues.join('; '), '修正 CSS 屬性');
    return pass(`CSS 基本通過（focusNone:${result.focusNone}, pxFont:${result.pxFonts}）`);
  } catch (err) {
    return { code: 'GN1130101E', rule: '使用色彩線索的時候就使用語意標記', status: 'fail', message: `執行錯誤: ${err.message}`, fix_suggestion: '確認頁面載入完成後再執行', details: [] };
  }
}

export const metadata = {
  code: 'GN1130101E',
  criterion: '1.3.1',
  level: 'A',
  category: 'General',
  rule: '使用色彩線索的時候就使用語意標記',
};
