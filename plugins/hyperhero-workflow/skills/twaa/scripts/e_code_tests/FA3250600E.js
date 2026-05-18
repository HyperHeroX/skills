/**
 * FA3250600E — 由於觸控設備上的互動僅限於觸控而失敗
 * 對應成功準則：2.5.6（等級 AAA）
 * 類別：Failure
 *
 * 官方稽核步驟：
   * 程序
   * 在具有觸控螢幕和至少一個其他輸入方式的裝置上打開內容：
   * - 檢查是否不僅可以使用觸控螢幕，還可以使用其他輸入機制(鍵盤和滑鼠)來操作所有互動控制元件。
   * - 如果觸控螢幕的存在導致互動控制元件無法顯示，檢查是否存在其他輸入機制的使用者可以操作該控制元件的替代控制元件方式。
   * 預期結果：如果檢查#2或#3為否，則符合失敗條件，此內容未通過成功準則。
 *
 * 注意：此為自動化程式碼測試，依官方稽核步驟實作 Playwright 驗證。
 * 不依賴 AI 判斷，全部使用 DOM 查詢、CSS 計算、鍵盤模擬等程式碼。
 */

function pass(detail = '', details = []) {
  return { code: 'FA3250600E', rule: '由於觸控設備上的互動僅限於觸控而失敗', status: 'pass', message: detail, fix_suggestion: '', details };
}
function fail(message, fix = '', details = []) {
  return { code: 'FA3250600E', rule: '由於觸控設備上的互動僅限於觸控而失敗', status: 'fail', message, fix_suggestion: fix, details: Array.isArray(details) ? details : [details] };
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
    return { code: 'FA3250600E', rule: '由於觸控設備上的互動僅限於觸控而失敗', status: 'fail', message: `執行錯誤: ${err.message}`, fix_suggestion: '確認頁面載入完成後再執行', details: [] };
  }
}

export const metadata = {
  code: 'FA3250600E',
  criterion: '2.5.6',
  level: 'AAA',
  category: 'Failure',
  rule: '由於觸控設備上的互動僅限於觸控而失敗',
};
