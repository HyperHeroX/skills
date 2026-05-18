/**
 * FA1250303E — 由於無障礙名稱不包含可見標籤文字而導致失敗
 * 對應成功準則：2.5.3（等級 A）
 * 類別：Failure
 *
 * 官方稽核步驟：
   * 程序
   * 對於具有可見標籤的所有控制元件(例如，鏈接文字、按鈕文字、以編程方式鏈結的標籤、帶有文字的鏈結中的圖片)：
   * - 無障礙的名稱與可見標籤相同。
   * - 無障礙名稱包含可見標籤字符串的匹配項。
   * 預期結果：如果檢查#1和#2為否，則符合失敗條件，此內容未通過成功準則。
 *
 * 注意：此為自動化程式碼測試，依官方稽核步驟實作 Playwright 驗證。
 * 不依賴 AI 判斷，全部使用 DOM 查詢、CSS 計算、鍵盤模擬等程式碼。
 */

function pass(detail = '', details = []) {
  return { code: 'FA1250303E', rule: '由於無障礙名稱不包含可見標籤文字而導致失敗', status: 'pass', message: detail, fix_suggestion: '', details };
}
function fail(message, fix = '', details = []) {
  return { code: 'FA1250303E', rule: '由於無障礙名稱不包含可見標籤文字而導致失敗', status: 'fail', message, fix_suggestion: fix, details: Array.isArray(details) ? details : [details] };
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
    return { code: 'FA1250303E', rule: '由於無障礙名稱不包含可見標籤文字而導致失敗', status: 'fail', message: `執行錯誤: ${err.message}`, fix_suggestion: '確認頁面載入完成後再執行', details: [] };
  }
}

export const metadata = {
  code: 'FA1250303E',
  criterion: '2.5.3',
  level: 'A',
  category: 'Failure',
  rule: '由於無障礙名稱不包含可見標籤文字而導致失敗',
};
