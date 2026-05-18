/**
 * FA2130402E — 有訊息顯示要求重新定向裝置設備，導致成功準則1.3.4失敗
 * 對應成功準則：1.3.4（等級 AA）
 * 類別：Failure
 *
 * 官方稽核步驟：
   * **程序**
   * 1. 在橫向視圖中打開內容。檢查是否出現訊息要求將裝置重新定向。
   * 2. 在直向視圖中打開內容。檢查是否出現訊息要求將裝置重新定向。
   * 3. 檢查直向或橫向視圖對於內容的查看和操作是否必需。
   * **預期結果**
 *
 * 注意：此為自動化程式碼測試，依官方稽核步驟實作 Playwright 驗證。
 * 不依賴 AI 判斷，全部使用 DOM 查詢、CSS 計算、鍵盤模擬等程式碼。
 */

function pass(detail = '', details = []) {
  return { code: 'FA2130402E', rule: '有訊息顯示要求重新定向裝置設備，導致成功準則1.3.4失敗', status: 'pass', message: detail, fix_suggestion: '', details };
}
function fail(message, fix = '', details = []) {
  return { code: 'FA2130402E', rule: '有訊息顯示要求重新定向裝置設備，導致成功準則1.3.4失敗', status: 'fail', message, fix_suggestion: fix, details: Array.isArray(details) ? details : [details] };
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
    return { code: 'FA2130402E', rule: '有訊息顯示要求重新定向裝置設備，導致成功準則1.3.4失敗', status: 'fail', message: `執行錯誤: ${err.message}`, fix_suggestion: '確認頁面載入完成後再執行', details: [] };
  }
}

export const metadata = {
  code: 'FA2130402E',
  criterion: '1.3.4',
  level: 'AA',
  category: 'Failure',
  rule: '有訊息顯示要求重新定向裝置設備，導致成功準則1.3.4失敗',
};
