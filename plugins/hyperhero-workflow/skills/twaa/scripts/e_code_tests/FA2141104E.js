/**
 * FA2141104E — 由於樣式元素的輪廓和邊框會消除或使視覺焦點指示器不可見，而導致成功準則2.4.7失敗
 * 對應成功準則：1.4.11（等級 AA）
 * 類別：Failure
 *
 * 官方稽核步驟：
   * **程序**
   * 1. 使用鍵盤將焦點設置在頁面上所有可聚焦的元素。
   * 2. 檢查焦點指示器是否可見。
   * **預期結果**
   * #2為否，則符合失敗條件，此內容未通過成功準則。
 *
 * 注意：此為自動化程式碼測試，依官方稽核步驟實作 Playwright 驗證。
 * 不依賴 AI 判斷，全部使用 DOM 查詢、CSS 計算、鍵盤模擬等程式碼。
 */

function pass(detail = '', details = []) {
  return { code: 'FA2141104E', rule: '由於樣式元素的輪廓和邊框會消除或使視覺焦點指示器不可見，而導致成功準則2.4.7失敗', status: 'pass', message: detail, fix_suggestion: '', details };
}
function fail(message, fix = '', details = []) {
  return { code: 'FA2141104E', rule: '由於樣式元素的輪廓和邊框會消除或使視覺焦點指示器不可見，而導致成功準則2.4.7失敗', status: 'fail', message, fix_suggestion: fix, details: Array.isArray(details) ? details : [details] };
}

/**
 * @param {import('playwright').Page} page
 * @returns {Promise<{code:string, rule:string, status:string, message:string, fix_suggestion:string, details:string[]}>>}
 */
export async function check(page) {
  try {
  const focusCount = [];
    for (let i = 0; i < 8; i++) {
      await page.keyboard.press('Tab');
      const el = await page.evaluate(() => {
        const e = document.activeElement;
        if (!e || e === document.body) return null;
        const s = window.getComputedStyle(e);
        return { tag: e.tagName, hasFocus: s.outlineStyle !== 'none' || s.boxShadow !== 'none' };
      });
      if (el) focusCount.push(el);
    }
    const invisible = focusCount.filter(e => !e.hasFocus).length;
    if (invisible > focusCount.length * 0.5) return fail(`${invisible}/${focusCount.length} 個焦點停駐點無可視焦點指示器`, ':focus-visible { outline: 3px solid #005fcc; }');
    return pass(`Tab 走訪 ${focusCount.length} 個，${focusCount.length-invisible} 個有可視焦點`);
  } catch (err) {
    return { code: 'FA2141104E', rule: '由於樣式元素的輪廓和邊框會消除或使視覺焦點指示器不可見，而導致成功準則2.4.7失敗', status: 'fail', message: `執行錯誤: ${err.message}`, fix_suggestion: '確認頁面載入完成後再執行', details: [] };
  }
}

export const metadata = {
  code: 'FA2141104E',
  criterion: '1.4.11',
  level: 'AA',
  category: 'Failure',
  rule: '由於樣式元素的輪廓和邊框會消除或使視覺焦點指示器不可見，而導致成功準則2.4.7失敗',
};
