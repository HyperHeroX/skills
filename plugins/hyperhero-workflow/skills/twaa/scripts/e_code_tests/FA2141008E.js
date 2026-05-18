/**
 * FA2141008E — 由於內容消失並且在內容重排後不可用，而導致成功準則1.4.10失敗
 * 對應成功準則：1.4.10（等級 AA）
 * 類別：Failure
 *
 * 官方稽核步驟：
   * **程序**
   * 1. 檢查電腦視埠寬度(例如1280px)上的可見內容元素。
   * 2. 縮小或放大瀏覽器視窗以將視窗寬度設置為320px，以使視窗寬度現在為320px（當以1280px視窗寬度開始由100％瀏覽器縮放時，可透過放大至400％完成本項程序）。
   * 3. 對於視窗寬度為320px時未提供的每個內容元素，請檢查是否有一種方法可以透過小部件，彈出視窗或指向其他視圖的鏈結來獲得相同或等效的內容。
   * **預期結果**
 *
 * 注意：此為自動化程式碼測試，依官方稽核步驟實作 Playwright 驗證。
 * 不依賴 AI 判斷，全部使用 DOM 查詢、CSS 計算、鍵盤模擬等程式碼。
 */

function pass(detail = '', details = []) {
  return { code: 'FA2141008E', rule: '由於內容消失並且在內容重排後不可用，而導致成功準則1.4.10失敗', status: 'pass', message: detail, fix_suggestion: '', details };
}
function fail(message, fix = '', details = []) {
  return { code: 'FA2141008E', rule: '由於內容消失並且在內容重排後不可用，而導致成功準則1.4.10失敗', status: 'fail', message, fix_suggestion: fix, details: Array.isArray(details) ? details : [details] };
}

/**
 * @param {import('playwright').Page} page
 * @returns {Promise<{code:string, rule:string, status:string, message:string, fix_suggestion:string, details:string[]}>>}
 */
export async function check(page) {
  try {
  const origW = await page.evaluate(() => window.innerWidth);
    const origH = await page.evaluate(() => window.innerHeight);
    await page.setViewportSize({ width: 320, height: 568 });
    await page.waitForTimeout(500);
    const result = await page.evaluate(() => ({
      hasHScroll: document.documentElement.scrollWidth > document.documentElement.clientWidth,
      clippedEls: [...document.querySelectorAll('p,li,td,th,label,h1,h2,h3,h4')]
        .filter(el => {
          // 排除 sr-only 等視覺隱藏元素
          if (el.offsetHeight <= 1 || el.offsetWidth <= 1) return false;
          const cls = Array.from(el.classList);
          const EXCLUDE = ['sr-only','p-hidden-accessible','visually-hidden','sr_only'];
          if (cls.some(c => EXCLUDE.some(ex => c.includes(ex)))) return false;
          if (el.getAttribute('aria-hidden') === 'true') return false;
          return el.textContent.trim().length > 2 && el.scrollHeight > el.offsetHeight + 4;
        })
        .map(el => el.tagName).slice(0,5),
    }));
    await page.setViewportSize({ width: origW, height: origH });
    if (result.hasHScroll) return fail('320px 下有水平捲軸', 'overflow-wrap:break-word; max-width:100%; 使用 flex/grid 響應式佈局');
    if (result.clippedEls.length) return fail(`${result.clippedEls.length} 個元素文字被截斷`, '移除固定高度（height:Xpx），改用 min-height', result.clippedEls);
    return pass('320px 流動排版正常');
  } catch (err) {
    return { code: 'FA2141008E', rule: '由於內容消失並且在內容重排後不可用，而導致成功準則1.4.10失敗', status: 'fail', message: `執行錯誤: ${err.message}`, fix_suggestion: '確認頁面載入完成後再執行', details: [] };
  }
}

export const metadata = {
  code: 'FA2141008E',
  criterion: '1.4.10',
  level: 'AA',
  category: 'Failure',
  rule: '由於內容消失並且在內容重排後不可用，而導致成功準則1.4.10失敗',
};
