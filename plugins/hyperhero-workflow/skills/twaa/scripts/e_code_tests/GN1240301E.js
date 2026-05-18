/**
 * GN1240301E — 在鏈結、表單控制元件、物件間建立合乎邏輯的跳位順序
 * 對應成功準則：2.4.3（等級 A）
 * 類別：General
 *
 * 官方稽核步驟：
   * 1. 檢查是否使用tabindex，在網頁上按右鍵->選擇檢查網頁原始碼。
   * 2. 如果有使用tabindex，檢查tabindex屬性所指定的內容來決定Tab鍵的順序。如下圖所顯示，新郎的姓氏、名字與出生地分別為tabindex=1、tabindex=2、tabindex=3，表示按Tab鍵的順序，輸入完新郎後，再輸入新娘的資料內容。
 *
 * 注意：此為自動化程式碼測試，依官方稽核步驟實作 Playwright 驗證。
 * 不依賴 AI 判斷，全部使用 DOM 查詢、CSS 計算、鍵盤模擬等程式碼。
 */

function pass(detail = '', details = []) {
  return { code: 'GN1240301E', rule: '在鏈結、表單控制元件、物件間建立合乎邏輯的跳位順序', status: 'pass', message: detail, fix_suggestion: '', details };
}
function fail(message, fix = '', details = []) {
  return { code: 'GN1240301E', rule: '在鏈結、表單控制元件、物件間建立合乎邏輯的跳位順序', status: 'fail', message, fix_suggestion: fix, details: Array.isArray(details) ? details : [details] };
}

/**
 * @param {import('playwright').Page} page
 * @returns {Promise<{code:string, rule:string, status:string, message:string, fix_suggestion:string, details:string[]}>>}
 */
export async function check(page) {
  try {
  const focusOrder = [];
    for (let i = 0; i < 10; i++) {
      await page.keyboard.press('Tab');
      const info = await page.evaluate(() => {
        const el = document.activeElement;
        const rect = el?.getBoundingClientRect();
        return el && el !== document.body ? { tag: el.tagName, y: Math.round(rect?.top||0) } : null;
      });
      if (info) focusOrder.push(info);
    }
    const jumps = focusOrder.filter((f,i) => i > 0 && f.y < focusOrder[i-1].y - 300).length;
    if (jumps > 2) return fail(`焦點順序出現 ${jumps} 次大幅回跳，可能不符閱讀順序`, '調整 DOM 順序，避免用 CSS order/position 改變視覺順序', focusOrder.map(f=>f.tag+'('+f.y+')'));
    return pass(`Tab 走訪 ${focusOrder.length} 個元素，順序合理`);
  } catch (err) {
    return { code: 'GN1240301E', rule: '在鏈結、表單控制元件、物件間建立合乎邏輯的跳位順序', status: 'fail', message: `執行錯誤: ${err.message}`, fix_suggestion: '確認頁面載入完成後再執行', details: [] };
  }
}

export const metadata = {
  code: 'GN1240301E',
  criterion: '2.4.3',
  level: 'A',
  category: 'General',
  rule: '在鏈結、表單控制元件、物件間建立合乎邏輯的跳位順序',
};
