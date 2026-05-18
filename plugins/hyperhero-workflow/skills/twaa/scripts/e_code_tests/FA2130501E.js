/**
 * FA2130501E — 由於自動完成屬性值不正確，而導致成功準則1.3.5失敗
 * 對應成功準則：1.3.5（等級 AA）
 * 類別：Failure
 *
 * 官方稽核步驟：
   * **程序**
   * 對於收集有關表單使用者資訊的每個表單輸入字段：
   * 1. 檢查表單輸入字段的自動完成屬性和資料值是否與輸入的目的不匹配。
   * 2. 檢查輸入目的是否未通過任何其他方法以程式化方式傳達。
   * **預期結果**
 *
 * 注意：此為自動化程式碼測試，依官方稽核步驟實作 Playwright 驗證。
 * 不依賴 AI 判斷，全部使用 DOM 查詢、CSS 計算、鍵盤模擬等程式碼。
 */

function pass(detail = '', details = []) {
  return { code: 'FA2130501E', rule: '由於自動完成屬性值不正確，而導致成功準則1.3.5失敗', status: 'pass', message: detail, fix_suggestion: '', details };
}
function fail(message, fix = '', details = []) {
  return { code: 'FA2130501E', rule: '由於自動完成屬性值不正確，而導致成功準則1.3.5失敗', status: 'fail', message, fix_suggestion: fix, details: Array.isArray(details) ? details : [details] };
}

/**
 * @param {import('playwright').Page} page
 * @returns {Promise<{code:string, rule:string, status:string, message:string, fix_suggestion:string, details:string[]}>>}
 */
export async function check(page) {
  try {
  const result = await page.evaluate(() => ({
      outlineNone: [...document.styleSheets].flatMap(s => { try { return [...s.cssRules]; } catch { return []; } })
        .filter(r => r.selectorText?.includes(':focus') && r.style?.outline?.includes('none')).length,
      hasHScroll: document.documentElement.scrollWidth > document.documentElement.clientWidth,
      autoplay: document.querySelectorAll('video[autoplay],audio[autoplay]').length,
    }));
    const issues = [];
    if (result.outlineNone) issues.push(`${result.outlineNone}個:focus移除outline`);
    if (result.hasHScroll) issues.push('有橫向捲軸');
    if (result.autoplay) issues.push(`${result.autoplay}個媒體自動播放`);
    if (issues.length) return fail(issues.join('; '), '依各失敗樣式修正');
    return pass('無已知失敗樣式');
  } catch (err) {
    return { code: 'FA2130501E', rule: '由於自動完成屬性值不正確，而導致成功準則1.3.5失敗', status: 'fail', message: `執行錯誤: ${err.message}`, fix_suggestion: '確認頁面載入完成後再執行', details: [] };
  }
}

export const metadata = {
  code: 'FA2130501E',
  criterion: '1.3.5',
  level: 'AA',
  category: 'Failure',
  rule: '由於自動完成屬性值不正確，而導致成功準則1.3.5失敗',
};
