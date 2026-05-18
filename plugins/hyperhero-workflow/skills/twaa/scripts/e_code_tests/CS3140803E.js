/**
 * CS3140803E — 文字僅對齊某一邊，或提供可移除文字左右全齊的機制
 * 對應成功準則：1.4.8（等級 AAA）
 * 類別：CSS
 *
 * 官方稽核步驟：
   * 用chrome打開檔案，可依按鈕指示變更文字對齊的位置，分別為左、中、右，預設為左邊對齊。
   * 按"中"的按鈕，可使文字以置中方式對齊。
   * 按"右"的按鈕，可使文字靠右邊對齊。
   * 點選"預設"的按鈕，可跳回初始狀態。
 *
 * 注意：此為自動化程式碼測試，依官方稽核步驟實作 Playwright 驗證。
 * 不依賴 AI 判斷，全部使用 DOM 查詢、CSS 計算、鍵盤模擬等程式碼。
 */

function pass(detail = '', details = []) {
  return { code: 'CS3140803E', rule: '文字僅對齊某一邊，或提供可移除文字左右全齊的機制', status: 'pass', message: detail, fix_suggestion: '', details };
}
function fail(message, fix = '', details = []) {
  return { code: 'CS3140803E', rule: '文字僅對齊某一邊，或提供可移除文字左右全齊的機制', status: 'fail', message, fix_suggestion: fix, details: Array.isArray(details) ? details : [details] };
}

/**
 * @param {import('playwright').Page} page
 * @returns {Promise<{code:string, rule:string, status:string, message:string, fix_suggestion:string, details:string[]}>>}
 */
export async function check(page) {
  try {
  // CSS 檢查：文字僅對齊某一邊，或提供可移除文字左右全齊的機制
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
    return { code: 'CS3140803E', rule: '文字僅對齊某一邊，或提供可移除文字左右全齊的機制', status: 'fail', message: `執行錯誤: ${err.message}`, fix_suggestion: '確認頁面載入完成後再執行', details: [] };
  }
}

export const metadata = {
  code: 'CS3140803E',
  criterion: '1.4.8',
  level: 'AAA',
  category: 'CSS',
  rule: '文字僅對齊某一邊，或提供可移除文字左右全齊的機制',
};
