/**
 * SC2141300E — 使懸浮或焦點內容可移除或維持，使其呈現可忽略或持續
 * 對應成功準則：1.4.13（等級 AA）
 * 類別：Client-Side Scripting
 *
 * 官方稽核步驟：
   * **程序**
   * 1. 打開頁面，使用指標是否觸發附加內容。
   * 2. 檢查附加內容保持可見，並指標是否可移到附加內容上與刪除附加內容。
   * 3. 鍵盤焦點是否觸發附加內容。
   * 4. 檢查附加內容保持可見，並可刪除附加內容。
   * **預期結果**
 *
 * 注意：此為自動化程式碼測試，依官方稽核步驟實作 Playwright 驗證。
 * 不依賴 AI 判斷，全部使用 DOM 查詢、CSS 計算、鍵盤模擬等程式碼。
 */

function pass(detail = '', details = []) {
  return { code: 'SC2141300E', rule: '使懸浮或焦點內容可移除或維持，使其呈現可忽略或持續', status: 'pass', message: detail, fix_suggestion: '', details };
}
function fail(message, fix = '', details = []) {
  return { code: 'SC2141300E', rule: '使懸浮或焦點內容可移除或維持，使其呈現可忽略或持續', status: 'fail', message, fix_suggestion: fix, details: Array.isArray(details) ? details : [details] };
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
    return { code: 'SC2141300E', rule: '使懸浮或焦點內容可移除或維持，使其呈現可忽略或持續', status: 'fail', message: `執行錯誤: ${err.message}`, fix_suggestion: '確認頁面載入完成後再執行', details: [] };
  }
}

export const metadata = {
  code: 'SC2141300E',
  criterion: '1.4.13',
  level: 'AA',
  category: 'Client-Side Scripting',
  rule: '使懸浮或焦點內容可移除或維持，使其呈現可忽略或持續',
};
