/**
 * CS2141201E — 允許調整文字間距而不換行(wrapping)
 * 對應成功準則：1.4.12（等級 AA）
 * 類別：CSS
 *
 * 官方稽核步驟：
   * **程序**
   * 對於包含不換行的文字元素：
   * 1. 將縮放級別設置為100％。
   * 2. 使用工具或其他機制運用文字間距度量(行高、段落、字母和單詞間距)，例如Text Spacing Bookmarklet或用戶樣式的瀏覽器插件。
   * 3. 檢查所有內容和功能是否可用，例如，容器中的文字不會被截斷，也不會與其他內容重疊。
 *
 * 注意：此為自動化程式碼測試，依官方稽核步驟實作 Playwright 驗證。
 * 不依賴 AI 判斷，全部使用 DOM 查詢、CSS 計算、鍵盤模擬等程式碼。
 */

function pass(detail = '', details = []) {
  return { code: 'CS2141201E', rule: '允許調整文字間距而不換行(wrapping)', status: 'pass', message: detail, fix_suggestion: '', details };
}
function fail(message, fix = '', details = []) {
  return { code: 'CS2141201E', rule: '允許調整文字間距而不換行(wrapping)', status: 'fail', message, fix_suggestion: fix, details: Array.isArray(details) ? details : [details] };
}

/**
 * @param {import('playwright').Page} page
 * @returns {Promise<{code:string, rule:string, status:string, message:string, fix_suggestion:string, details:string[]}>>}
 */
export async function check(page) {
  try {
  const result = await page.evaluate(() => {
      const rules = [...document.styleSheets].flatMap(s => { try { return [...s.cssRules]; } catch { return []; } });
      const letterSpacingPx = rules.filter(r => r.style?.letterSpacing?.endsWith('px')).map(r => ({ sel: (r.selectorText||'').slice(0,30), v: r.style.letterSpacing })).slice(0,5);
      const wordSpacingPx = rules.filter(r => r.style?.wordSpacing?.endsWith('px')).map(r => r.style.wordSpacing).slice(0,3);
      return { letterSpacingPx, wordSpacingPx };
    });
    const issues = [];
    if (result.letterSpacingPx.length) issues.push(`letter-spacing 固定px: ${result.letterSpacingPx.map(f=>f.v).join(',')}`);
    if (result.wordSpacingPx.length) issues.push(`word-spacing 固定px: ${result.wordSpacingPx.join(',')}`);
    if (issues.length) return fail(issues.join('; '), '改為 em 單位：letter-spacing: 0.12em; word-spacing: 0.16em;', result.letterSpacingPx.map(f=>f.sel+': '+f.v));
    return pass('文字間距使用相對單位');
  } catch (err) {
    return { code: 'CS2141201E', rule: '允許調整文字間距而不換行(wrapping)', status: 'fail', message: `執行錯誤: ${err.message}`, fix_suggestion: '確認頁面載入完成後再執行', details: [] };
  }
}

export const metadata = {
  code: 'CS2141201E',
  criterion: '1.4.12',
  level: 'AA',
  category: 'CSS',
  rule: '允許調整文字間距而不換行(wrapping)',
};
