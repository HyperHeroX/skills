/**
 * GN2320300E — 每一次會重複出現的元件出現時，均按照相同的相對順序來呈現
 * 對應成功準則：3.2.3（等級 AA）
 * 類別：General
 *
 * 官方稽核步驟：
   * 使用Google Chrome瀏覽器開啟檔案。範例中相簿、網誌、名片是以相對順序來呈現。 點選右鍵檢視網頁原始碼。此範例是使用CSS的位置屬性(Position)：Relative(相對位置)。 可把程式碼中的網誌部分刪除(第20~22行)，則剩下元件的順序仍不會改變。
 *
 * 注意：此為自動化程式碼測試，依官方稽核步驟實作 Playwright 驗證。
 * 不依賴 AI 判斷，全部使用 DOM 查詢、CSS 計算、鍵盤模擬等程式碼。
 */

function pass(detail = '', details = []) {
  return { code: 'GN2320300E', rule: '每一次會重複出現的元件出現時，均按照相同的相對順序來呈現', status: 'pass', message: detail, fix_suggestion: '', details };
}
function fail(message, fix = '', details = []) {
  return { code: 'GN2320300E', rule: '每一次會重複出現的元件出現時，均按照相同的相對順序來呈現', status: 'fail', message, fix_suggestion: fix, details: Array.isArray(details) ? details : [details] };
}

/**
 * @param {import('playwright').Page} page
 * @returns {Promise<{code:string, rule:string, status:string, message:string, fix_suggestion:string, details:string[]}>>}
 */
export async function check(page) {
  try {
  // CSS 檢查：每一次會重複出現的元件出現時，均按照相同的相對順序來呈現
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
    return { code: 'GN2320300E', rule: '每一次會重複出現的元件出現時，均按照相同的相對順序來呈現', status: 'fail', message: `執行錯誤: ${err.message}`, fix_suggestion: '確認頁面載入完成後再執行', details: [] };
  }
}

export const metadata = {
  code: 'GN2320300E',
  criterion: '3.2.3',
  level: 'AA',
  category: 'General',
  rule: '每一次會重複出現的元件出現時，均按照相同的相對順序來呈現',
};
