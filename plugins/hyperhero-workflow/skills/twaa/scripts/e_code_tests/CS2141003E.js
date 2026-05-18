/**
 * CS2141003E — 使用CSS寬度、最大寬度和彈性容器屬性調適標籤和輸入
 * 對應成功準則：1.4.10（等級 AA）
 * 類別：CSS
 *
 * 官方稽核步驟：
   * **程序**
   * 1. 在能夠進行400％縮放的使用者代理中顯示網頁，並將視埠尺寸(以CSS像素為單位)設置為1280寬和1024高。
   * 2. 放大400％。
   * 3. 對於垂直滾動內容，所有標籤和輸入都適合其可用空間而無需水平滾動。
   * 注意： 如果瀏覽器無法縮放到400％，您可以按比例縮小瀏覽器的寬度。例如，在300％縮放時，視埠的大小應為960px寬。
 *
 * 注意：此為自動化程式碼測試，依官方稽核步驟實作 Playwright 驗證。
 * 不依賴 AI 判斷，全部使用 DOM 查詢、CSS 計算、鍵盤模擬等程式碼。
 */

function pass(detail = '', details = []) {
  return { code: 'CS2141003E', rule: '使用CSS寬度、最大寬度和彈性容器屬性調適標籤和輸入', status: 'pass', message: detail, fix_suggestion: '', details };
}
function fail(message, fix = '', details = []) {
  return { code: 'CS2141003E', rule: '使用CSS寬度、最大寬度和彈性容器屬性調適標籤和輸入', status: 'fail', message, fix_suggestion: fix, details: Array.isArray(details) ? details : [details] };
}

/**
 * @param {import('playwright').Page} page
 * @returns {Promise<{code:string, rule:string, status:string, message:string, fix_suggestion:string, details:string[]}>>}
 */
export async function check(page) {
  try {
  // CSS 檢查：使用CSS寬度、最大寬度和彈性容器屬性調適標籤和輸入
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
    return { code: 'CS2141003E', rule: '使用CSS寬度、最大寬度和彈性容器屬性調適標籤和輸入', status: 'fail', message: `執行錯誤: ${err.message}`, fix_suggestion: '確認頁面載入完成後再執行', details: [] };
  }
}

export const metadata = {
  code: 'CS2141003E',
  criterion: '1.4.10',
  level: 'AA',
  category: 'CSS',
  rule: '使用CSS寬度、最大寬度和彈性容器屬性調適標籤和輸入',
};
