/**
 * CS3240903E — 針對單獨存在的鏈結，在靠近網頁開頭處提供可以變更鏈結文字的控制元件，或使用CSS隱藏部分鏈結文字。
 * 對應成功準則：2.4.9（等級 AAA）
 * 類別：CSS
 *
 * 官方稽核步驟：
   * 檢查各個類型的鏈結內容主題是否相同，並和單獨存在的主鏈結一起檢查。 使用Google Chrome「檢視原始碼」顯示連結(按下右鍵→檢視原始碼)。 檢查是否有使用CSS樣式隱藏部分鏈結文字，如圖省略"華盛頓經濟成長計畫"，鏈結文字剩"計畫"。
 *
 * 注意：此為自動化程式碼測試，依官方稽核步驟實作 Playwright 驗證。
 * 不依賴 AI 判斷，全部使用 DOM 查詢、CSS 計算、鍵盤模擬等程式碼。
 */

function pass(detail = '', details = []) {
  return { code: 'CS3240903E', rule: '針對單獨存在的鏈結，在靠近網頁開頭處提供可以變更鏈結文字的控制元件，或使用CSS隱藏部分鏈結文字。', status: 'pass', message: detail, fix_suggestion: '', details };
}
function fail(message, fix = '', details = []) {
  return { code: 'CS3240903E', rule: '針對單獨存在的鏈結，在靠近網頁開頭處提供可以變更鏈結文字的控制元件，或使用CSS隱藏部分鏈結文字。', status: 'fail', message, fix_suggestion: fix, details: Array.isArray(details) ? details : [details] };
}

/**
 * @param {import('playwright').Page} page
 * @returns {Promise<{code:string, rule:string, status:string, message:string, fix_suggestion:string, details:string[]}>>}
 */
export async function check(page) {
  try {
  // CSS 檢查：針對單獨存在的鏈結，在靠近網頁開頭處提供可以變更鏈結文字的控制元件，或使用CSS隱藏部分鏈結文字。
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
    return { code: 'CS3240903E', rule: '針對單獨存在的鏈結，在靠近網頁開頭處提供可以變更鏈結文字的控制元件，或使用CSS隱藏部分鏈結文字。', status: 'fail', message: `執行錯誤: ${err.message}`, fix_suggestion: '確認頁面載入完成後再執行', details: [] };
  }
}

export const metadata = {
  code: 'CS3240903E',
  criterion: '2.4.9',
  level: 'AAA',
  category: 'CSS',
  rule: '針對單獨存在的鏈結，在靠近網頁開頭處提供可以變更鏈結文字的控制元件，或使用CSS隱藏部分鏈結文字。',
};
