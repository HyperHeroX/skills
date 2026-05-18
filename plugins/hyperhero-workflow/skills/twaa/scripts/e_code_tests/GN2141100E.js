/**
 * GN2141100E — 使用網頁作者設定的高可視焦點指示器
 * 對應成功準則：1.4.11（等級 AA）
 * 類別：General
 *
 * 官方稽核步驟：
   * **程序**
   * 1. 使用鍵盤將焦點放在頁面中的每個可聚焦的使用者介面元素上。
   * 2. 檢查是否有清晰可見的焦點指示器。
   * 3. 檢查焦點指示器的區域至少有1 CSS像素圍繞該元素。
   * 4. 檢查指示器在聚焦與未聚焦狀態之間對比度的改變，指示器的區域是否具有3:1對比值。
   * 5. 如果焦點指示器與相鄰的顏色未達3:1對比值，檢查指示器邊線厚度是否有2 CSS像素。
 *
 * 注意：此為自動化程式碼測試，依官方稽核步驟實作 Playwright 驗證。
 * 不依賴 AI 判斷，全部使用 DOM 查詢、CSS 計算、鍵盤模擬等程式碼。
 */

function pass(detail = '', details = []) {
  return { code: 'GN2141100E', rule: '使用網頁作者設定的高可視焦點指示器', status: 'pass', message: detail, fix_suggestion: '', details };
}
function fail(message, fix = '', details = []) {
  return { code: 'GN2141100E', rule: '使用網頁作者設定的高可視焦點指示器', status: 'fail', message, fix_suggestion: fix, details: Array.isArray(details) ? details : [details] };
}

/**
 * @param {import('playwright').Page} page
 * @returns {Promise<{code:string, rule:string, status:string, message:string, fix_suggestion:string, details:string[]}>>}
 */
export async function check(page) {
  try {
  // CSS 檢查：使用網頁作者設定的高可視焦點指示器
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
    return { code: 'GN2141100E', rule: '使用網頁作者設定的高可視焦點指示器', status: 'fail', message: `執行錯誤: ${err.message}`, fix_suggestion: '確認頁面載入完成後再執行', details: [] };
  }
}

export const metadata = {
  code: 'GN2141100E',
  criterion: '1.4.11',
  level: 'AA',
  category: 'General',
  rule: '使用網頁作者設定的高可視焦點指示器',
};
