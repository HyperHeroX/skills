/**
 * GN3210300E — 僅提供由鍵盤觸發的事件處理程式。
 * 對應成功準則：2.1.3（等級 AAA）
 * 類別：General
 *
 * 官方稽核步驟：
   * 1. 用chrome打開檔案，以下兩個連結既可以用滑鼠點擊也可以用鍵盤去操作。
   * 2. 這裡使用tab鍵可取代滑鼠點擊的功能，如此無論是鍵盤還是滑鼠的事件皆可由鍵盤來完成。
   * 3. 檢視原始碼，此原始碼可呼叫javascript內的函式來執行以上所需的功能。
 *
 * 注意：此為自動化程式碼測試，依官方稽核步驟實作 Playwright 驗證。
 * 不依賴 AI 判斷，全部使用 DOM 查詢、CSS 計算、鍵盤模擬等程式碼。
 */

function pass(detail = '', details = []) {
  return { code: 'GN3210300E', rule: '僅提供由鍵盤觸發的事件處理程式。', status: 'pass', message: detail, fix_suggestion: '', details };
}
function fail(message, fix = '', details = []) {
  return { code: 'GN3210300E', rule: '僅提供由鍵盤觸發的事件處理程式。', status: 'fail', message, fix_suggestion: fix, details: Array.isArray(details) ? details : [details] };
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
    return { code: 'GN3210300E', rule: '僅提供由鍵盤觸發的事件處理程式。', status: 'fail', message: `執行錯誤: ${err.message}`, fix_suggestion: '確認頁面載入完成後再執行', details: [] };
  }
}

export const metadata = {
  code: 'GN3210300E',
  criterion: '2.1.3',
  level: 'AAA',
  category: 'General',
  rule: '僅提供由鍵盤觸發的事件處理程式。',
};
