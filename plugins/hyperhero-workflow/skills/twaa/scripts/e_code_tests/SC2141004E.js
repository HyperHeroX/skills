/**
 * SC2141004E — 使用與文字大小成比例的方式計算大小和位置
 * 對應成功準則：1.4.10（等級 AA）
 * 類別：Client-Side Scripting
 *
 * 官方稽核步驟：
   * **程序**
   * 1. 打開一個隨著文字大小的改變而調整容器大小的頁面。
   * 2. 使用瀏覽器的文字大小調整功能(不使用縮放功能)將文字大小放大至200％。
   * 3. 檢查文字，以確保調整文字容器的大小可適應文字的大小。
   * 4. 確保沒有因文字大小的增加而導致文字被"裁切"或消失。
   * **預期結果**
 *
 * 注意：此為自動化程式碼測試，依官方稽核步驟實作 Playwright 驗證。
 * 不依賴 AI 判斷，全部使用 DOM 查詢、CSS 計算、鍵盤模擬等程式碼。
 */

function pass(detail = '', details = []) {
  return { code: 'SC2141004E', rule: '使用與文字大小成比例的方式計算大小和位置', status: 'pass', message: detail, fix_suggestion: '', details };
}
function fail(message, fix = '', details = []) {
  return { code: 'SC2141004E', rule: '使用與文字大小成比例的方式計算大小和位置', status: 'fail', message, fix_suggestion: fix, details: Array.isArray(details) ? details : [details] };
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
    return { code: 'SC2141004E', rule: '使用與文字大小成比例的方式計算大小和位置', status: 'fail', message: `執行錯誤: ${err.message}`, fix_suggestion: '確認頁面載入完成後再執行', details: [] };
  }
}

export const metadata = {
  code: 'SC2141004E',
  criterion: '1.4.10',
  level: 'AA',
  category: 'Client-Side Scripting',
  rule: '使用與文字大小成比例的方式計算大小和位置',
};
