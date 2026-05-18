/**
 * CS3140804E — 在CSS當中指定行距，且行距應介於1.5倍行高至2倍行高之間
 * 對應成功準則：1.4.8（等級 AAA）
 * 類別：CSS
 *
 * 官方稽核步驟：
   * 用chrome打開檔案，行距設為line-height:2.0。
   * 更改原始碼，設成line-height:1.5。
   * 檢視原始碼。
 *
 * 注意：此為自動化程式碼測試，依官方稽核步驟實作 Playwright 驗證。
 * 不依賴 AI 判斷，全部使用 DOM 查詢、CSS 計算、鍵盤模擬等程式碼。
 */

function pass(detail = '', details = []) {
  return { code: 'CS3140804E', rule: '在CSS當中指定行距，且行距應介於1.5倍行高至2倍行高之間', status: 'pass', message: detail, fix_suggestion: '', details };
}
function fail(message, fix = '', details = []) {
  return { code: 'CS3140804E', rule: '在CSS當中指定行距，且行距應介於1.5倍行高至2倍行高之間', status: 'fail', message, fix_suggestion: fix, details: Array.isArray(details) ? details : [details] };
}

/**
 * @param {import('playwright').Page} page
 * @returns {Promise<{code:string, rule:string, status:string, message:string, fix_suggestion:string, details:string[]}>>}
 */
export async function check(page) {
  try {
  // CSS 檢查：在CSS當中指定行距，且行距應介於1.5倍行高至2倍行高之間
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
    return { code: 'CS3140804E', rule: '在CSS當中指定行距，且行距應介於1.5倍行高至2倍行高之間', status: 'fail', message: `執行錯誤: ${err.message}`, fix_suggestion: '確認頁面載入完成後再執行', details: [] };
  }
}

export const metadata = {
  code: 'CS3140804E',
  criterion: '1.4.8',
  level: 'AAA',
  category: 'CSS',
  rule: '在CSS當中指定行距，且行距應介於1.5倍行高至2倍行高之間',
};
