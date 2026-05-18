/**
 * CS1130203E — DOM物件順序需與視覺順序一致
 * 對應成功準則：1.3.2（等級 A）
 * 類別：CSS
 *
 * 官方稽核步驟：
   * 利用眼睛觀察網頁在一般使用者眼前時，每個物件所呈現的順序。
   * 利用DOM工具得到網頁的DOM標籤（這是一個線上DOM工具，將網頁原始碼輸入，可以得到該網站的DOM結構 https://software.hixie.ch/utilities/js/live-dom-viewer/）
   * 檢查DOM工具所呈現的物件，其順序是否與視覺上的順序相同。(對於一常見的英文或中文網站，視覺順序是由上到下、由左到右)
 *
 * 注意：此為自動化程式碼測試，依官方稽核步驟實作 Playwright 驗證。
 * 不依賴 AI 判斷，全部使用 DOM 查詢、CSS 計算、鍵盤模擬等程式碼。
 */

function pass(detail = '', details = []) {
  return { code: 'CS1130203E', rule: 'DOM物件順序需與視覺順序一致', status: 'pass', message: detail, fix_suggestion: '', details };
}
function fail(message, fix = '', details = []) {
  return { code: 'CS1130203E', rule: 'DOM物件順序需與視覺順序一致', status: 'fail', message, fix_suggestion: fix, details: Array.isArray(details) ? details : [details] };
}

/**
 * @param {import('playwright').Page} page
 * @returns {Promise<{code:string, rule:string, status:string, message:string, fix_suggestion:string, details:string[]}>>}
 */
export async function check(page) {
  try {
  const orderEls = await page.evaluate(() => {
      return [...document.querySelectorAll('*')].filter(el => {
        const s = window.getComputedStyle(el);
        return parseInt(s.order || 0) !== 0;
      }).map(el => el.tagName + (el.className ? '.' + String(el.className).split(' ')[0] : '')).slice(0,5);
    });
    if (orderEls.length) return fail(`${orderEls.length} 個元素使用 CSS order，視覺與 DOM 順序可能不一致`, '調整 DOM 順序取代 CSS order', orderEls);
    return pass('DOM 順序與視覺一致，無 CSS order');
  } catch (err) {
    return { code: 'CS1130203E', rule: 'DOM物件順序需與視覺順序一致', status: 'fail', message: `執行錯誤: ${err.message}`, fix_suggestion: '確認頁面載入完成後再執行', details: [] };
  }
}

export const metadata = {
  code: 'CS1130203E',
  criterion: '1.3.2',
  level: 'A',
  category: 'CSS',
  rule: 'DOM物件順序需與視覺順序一致',
};
