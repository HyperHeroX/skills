/**
 * FA2141301E — 由於游標無法移動到懸浮的內容，而導致成功準則1.4.13失敗
 * 對應成功準則：1.4.13（等級 AA）
 * 類別：Failure
 *
 * 官方稽核步驟：
   * **程序**
   * 對於指標懸浮上顯示的附加內容區域：
   * 1. 指標可以在新內容上移動而不會使附加內容消失。
   * **預期結果**
 *
 * 注意：此為自動化程式碼測試，依官方稽核步驟實作 Playwright 驗證。
 * 不依賴 AI 判斷，全部使用 DOM 查詢、CSS 計算、鍵盤模擬等程式碼。
 */

function pass(detail = '', details = []) {
  return { code: 'FA2141301E', rule: '由於游標無法移動到懸浮的內容，而導致成功準則1.4.13失敗', status: 'pass', message: detail, fix_suggestion: '', details };
}
function fail(message, fix = '', details = []) {
  return { code: 'FA2141301E', rule: '由於游標無法移動到懸浮的內容，而導致成功準則1.4.13失敗', status: 'fail', message, fix_suggestion: fix, details: Array.isArray(details) ? details : [details] };
}

/**
 * @param {import('playwright').Page} page
 * @returns {Promise<{code:string, rule:string, status:string, message:string, fix_suggestion:string, details:string[]}>>}
 */
export async function check(page) {
  try {
  const triggers = await page.evaluate(() =>
      [...document.querySelectorAll('[title],[data-tooltip],[aria-describedby]')].slice(0,3).map(el => {
        const r = el.getBoundingClientRect();
        return { x: Math.round(r.x+r.width/2), y: Math.round(r.y+r.height/2) };
      }).filter(p => p.x > 0 && p.y > 0)
    );
    if (!triggers.length) return pass('無 tooltip 觸發元素，跳過');
    for (const { x, y } of triggers.slice(0,2)) {
      await page.mouse.move(x, y);
      await page.waitForTimeout(400);
      const ttPos = await page.evaluate(() => {
        const tt = document.querySelector('[role="tooltip"],[class*="tooltip"]');
        if (!tt || !tt.offsetWidth) return null;
        const r = tt.getBoundingClientRect();
        return { x: Math.round(r.x+r.width/2), y: Math.round(r.y+r.height/2) };
      });
      if (ttPos) {
        await page.mouse.move(ttPos.x, ttPos.y);
        await page.waitForTimeout(200);
        const still = await page.evaluate(() => !!document.querySelector('[role="tooltip"],[class*="tooltip"]')?.offsetWidth);
        if (!still) return fail('Tooltip 在指標移入後消失', 'pointer-events:auto 讓指標可移入不觸發 mouseleave');
        await page.keyboard.press('Escape');
        await page.waitForTimeout(200);
        const afterEsc = await page.evaluate(() => !!document.querySelector('[role="tooltip"],[class*="tooltip"]')?.offsetWidth);
        if (afterEsc) return fail('按 Esc 無法關閉 tooltip', '監聽 keydown Escape 事件關閉懸浮內容');
      }
    }
    return pass('Tooltip 行為正確（可移入、Esc 可關閉）');
  } catch (err) {
    return { code: 'FA2141301E', rule: '由於游標無法移動到懸浮的內容，而導致成功準則1.4.13失敗', status: 'fail', message: `執行錯誤: ${err.message}`, fix_suggestion: '確認頁面載入完成後再執行', details: [] };
  }
}

export const metadata = {
  code: 'FA2141301E',
  criterion: '1.4.13',
  level: 'AA',
  category: 'Failure',
  rule: '由於游標無法移動到懸浮的內容，而導致成功準則1.4.13失敗',
};
