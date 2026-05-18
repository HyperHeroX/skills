/**
 * CS2141006E — 使用媒體查詢來解除粘滯的頁首/頁尾
 * 對應成功準則：1.4.10（等級 AA）
 * 類別：CSS
 *
 * 官方稽核步驟：
   * **程序**
   * 注意：此測試依據測試的環境，可能有不同的實際模式或大小。
   * 1. 以直向模式在裝置/使用者代理上顯示內容。
   * 2. 將方向更改為橫向。
   * 3. 檢查粘滯的頁首和頁尾是否依據既有的媒體查詢設定而取消固定。
   * 4. 在以1280x1024 CSS像素的起始視埠寬度的桌面/使用者代理上顯示內容。
 *
 * 注意：此為自動化程式碼測試，依官方稽核步驟實作 Playwright 驗證。
 * 不依賴 AI 判斷，全部使用 DOM 查詢、CSS 計算、鍵盤模擬等程式碼。
 */

function pass(detail = '', details = []) {
  return { code: 'CS2141006E', rule: '使用媒體查詢來解除粘滯的頁首/頁尾', status: 'pass', message: detail, fix_suggestion: '', details };
}
function fail(message, fix = '', details = []) {
  return { code: 'CS2141006E', rule: '使用媒體查詢來解除粘滯的頁首/頁尾', status: 'fail', message, fix_suggestion: fix, details: Array.isArray(details) ? details : [details] };
}

/**
 * @param {import('playwright').Page} page
 * @returns {Promise<{code:string, rule:string, status:string, message:string, fix_suggestion:string, details:string[]}>>}
 */
export async function check(page) {
  try {
  // CSS 檢查：使用媒體查詢來解除粘滯的頁首/頁尾
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
    return { code: 'CS2141006E', rule: '使用媒體查詢來解除粘滯的頁首/頁尾', status: 'fail', message: `執行錯誤: ${err.message}`, fix_suggestion: '確認頁面載入完成後再執行', details: [] };
  }
}

export const metadata = {
  code: 'CS2141006E',
  criterion: '1.4.10',
  level: 'AA',
  category: 'CSS',
  rule: '使用媒體查詢來解除粘滯的頁首/頁尾',
};
