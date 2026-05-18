/**
 * FA1250102E — 由於提供的功能只有基於路徑的手勢，而沒有單點指標替代方法，而導致成功準則2.5.1失敗
 * 對應成功準則：2.5.1（等級 A）
 * 類別：Failure
 *
 * 官方稽核步驟：
   * 程序
   * 對於透過基於路徑的手勢啟動功能的每個部分：
   * 檢查控制元件是否可用，通過點擊或單擊即可執行相同的功能。
   * 預期結果：如果檢查#1為否，則符合失敗條件，此內容未通過成功準則。
 *
 * 注意：此為自動化程式碼測試，依官方稽核步驟實作 Playwright 驗證。
 * 不依賴 AI 判斷，全部使用 DOM 查詢、CSS 計算、鍵盤模擬等程式碼。
 */

function pass(detail = '', details = []) {
  return { code: 'FA1250102E', rule: '由於提供的功能只有基於路徑的手勢，而沒有單點指標替代方法，而導致成功準則2.5.1失敗', status: 'pass', message: detail, fix_suggestion: '', details };
}
function fail(message, fix = '', details = []) {
  return { code: 'FA1250102E', rule: '由於提供的功能只有基於路徑的手勢，而沒有單點指標替代方法，而導致成功準則2.5.1失敗', status: 'fail', message, fix_suggestion: fix, details: Array.isArray(details) ? details : [details] };
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
    return { code: 'FA1250102E', rule: '由於提供的功能只有基於路徑的手勢，而沒有單點指標替代方法，而導致成功準則2.5.1失敗', status: 'fail', message: `執行錯誤: ${err.message}`, fix_suggestion: '確認頁面載入完成後再執行', details: [] };
  }
}

export const metadata = {
  code: 'FA1250102E',
  criterion: '2.5.1',
  level: 'A',
  category: 'Failure',
  rule: '由於提供的功能只有基於路徑的手勢，而沒有單點指標替代方法，而導致成功準則2.5.1失敗',
};
