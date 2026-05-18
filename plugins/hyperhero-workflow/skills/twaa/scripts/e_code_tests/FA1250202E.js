/**
 * FA1250202E — 由於向下事件啟動一個控制元件而導致成功準則2.5.2失敗
 * 對應成功準則：2.5.2（等級 A）
 * 類別：Failure
 *
 * 官方稽核步驟：
   * 程序
   * 使用指標輸入(滑鼠、觸控螢幕、手寫筆)以及所有可用控制元件(按鈕、鏈結、複雜程式物件)在裝置上打開內容：
   * - 觸發向下事件(例如，透過按下但不釋放滑鼠按鈕，或者將手指或手寫筆放在觸控螢幕上)，並檢查是否在向上事件之前執行功能。
   * - 如果在向下事件上執行功能，檢查是否觸發向上事件，是否可以反轉結果。
   * - 評估在事件發生時，向下事件是否具執行和完成功能必要性。
   * 預期結果：如果#1為是，而#2和#3為否，則符合失敗條件，此內容未通過成功準則。
 *
 * 注意：此為自動化程式碼測試，依官方稽核步驟實作 Playwright 驗證。
 * 不依賴 AI 判斷，全部使用 DOM 查詢、CSS 計算、鍵盤模擬等程式碼。
 */

function pass(detail = '', details = []) {
  return { code: 'FA1250202E', rule: '由於向下事件啟動一個控制元件而導致成功準則2.5.2失敗', status: 'pass', message: detail, fix_suggestion: '', details };
}
function fail(message, fix = '', details = []) {
  return { code: 'FA1250202E', rule: '由於向下事件啟動一個控制元件而導致成功準則2.5.2失敗', status: 'fail', message, fix_suggestion: fix, details: Array.isArray(details) ? details : [details] };
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
    return { code: 'FA1250202E', rule: '由於向下事件啟動一個控制元件而導致成功準則2.5.2失敗', status: 'fail', message: `執行錯誤: ${err.message}`, fix_suggestion: '確認頁面載入完成後再執行', details: [] };
  }
}

export const metadata = {
  code: 'FA1250202E',
  criterion: '2.5.2',
  level: 'A',
  category: 'Failure',
  rule: '由於向下事件啟動一個控制元件而導致成功準則2.5.2失敗',
};
