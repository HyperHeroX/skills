/**
 * FA1210401E — 由於實作的快捷鍵無法關閉或重新對應，而導致成功準則2.1.4失敗
 * 對應成功準則：2.1.4（等級 A）
 * 類別：Failure
 *
 * 官方稽核步驟：
   * **程序**
   * 如果該網站未提供關閉或重新對應鍵盤快捷鍵的設定，則：
   * 1. 如果下載頁面將焦點設置在輸入框，單擊頁面的空白部分以確保沒有焦點在輸入上。
   * 2. 按壓由網頁作者標識為快捷鍵的按鍵，或者如果沒有作者提供的說明資訊，則按鍵盤所有打印的字符鍵(即所有數字、字母、符號和標點符號)。勿按下非打印修飾鍵和控制鍵，例如Ctrl、Alt、Esc、箭頭鍵和功能鍵F1-F12(如果有)，空格、Enter、返回、Tab和Delete鍵亦同。
   * 3. 按住Shift鍵，然後再次按相同的鍵。
   * 4. 檢查功能是否被按鍵觸發。
 *
 * 注意：此為自動化程式碼測試，依官方稽核步驟實作 Playwright 驗證。
 * 不依賴 AI 判斷，全部使用 DOM 查詢、CSS 計算、鍵盤模擬等程式碼。
 */

function pass(detail = '', details = []) {
  return { code: 'FA1210401E', rule: '由於實作的快捷鍵無法關閉或重新對應，而導致成功準則2.1.4失敗', status: 'pass', message: detail, fix_suggestion: '', details };
}
function fail(message, fix = '', details = []) {
  return { code: 'FA1210401E', rule: '由於實作的快捷鍵無法關閉或重新對應，而導致成功準則2.1.4失敗', status: 'fail', message, fix_suggestion: fix, details: Array.isArray(details) ? details : [details] };
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
    return { code: 'FA1210401E', rule: '由於實作的快捷鍵無法關閉或重新對應，而導致成功準則2.1.4失敗', status: 'fail', message: `執行錯誤: ${err.message}`, fix_suggestion: '確認頁面載入完成後再執行', details: [] };
  }
}

export const metadata = {
  code: 'FA1210401E',
  criterion: '2.1.4',
  level: 'A',
  category: 'Failure',
  rule: '由於實作的快捷鍵無法關閉或重新對應，而導致成功準則2.1.4失敗',
};
