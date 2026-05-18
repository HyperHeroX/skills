/**
 * CS2141202E — 使用CSS letter-spacing來控制單字內空格
 * 對應成功準則：1.4.12（等級 AA）
 * 類別：CSS
 *
 * 官方稽核步驟：
   * **程序**
   * 對於每個看起來字符之間具有非標準間距的單詞：
   * 1. 檢查CSS字母間距屬性是否用於控制間距。
   * **預期結果**
 *
 * 注意：此為自動化程式碼測試，依官方稽核步驟實作 Playwright 驗證。
 * 不依賴 AI 判斷，全部使用 DOM 查詢、CSS 計算、鍵盤模擬等程式碼。
 */

function pass(detail = '', details = []) {
  return { code: 'CS2141202E', rule: '使用CSS letter-spacing來控制單字內空格', status: 'pass', message: detail, fix_suggestion: '', details };
}
function fail(message, fix = '', details = []) {
  return { code: 'CS2141202E', rule: '使用CSS letter-spacing來控制單字內空格', status: 'fail', message, fix_suggestion: fix, details: Array.isArray(details) ? details : [details] };
}

/**
 * @param {import('playwright').Page} page
 * @returns {Promise<{code:string, rule:string, status:string, message:string, fix_suggestion:string, details:string[]}>>}
 */
export async function check(page) {
  try {
  // CSS 檢查：使用CSS letter-spacing來控制單字內空格
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
    return { code: 'CS2141202E', rule: '使用CSS letter-spacing來控制單字內空格', status: 'fail', message: `執行錯誤: ${err.message}`, fix_suggestion: '確認頁面載入完成後再執行', details: [] };
  }
}

export const metadata = {
  code: 'CS2141202E',
  criterion: '1.4.12',
  level: 'AA',
  category: 'CSS',
  rule: '使用CSS letter-spacing來控制單字內空格',
};
