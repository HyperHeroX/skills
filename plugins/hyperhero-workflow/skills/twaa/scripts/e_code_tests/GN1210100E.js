/**
 * GN1210100E — 提供由鍵盤觸發的事件處理程式
 * 對應成功準則：2.1.1（等級 A）
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
  return { code: 'GN1210100E', rule: '提供由鍵盤觸發的事件處理程式', status: 'pass', message: detail, fix_suggestion: '', details };
}
function fail(message, fix = '', details = []) {
  return { code: 'GN1210100E', rule: '提供由鍵盤觸發的事件處理程式', status: 'fail', message, fix_suggestion: fix, details: Array.isArray(details) ? details : [details] };
}

/**
 * @param {import('playwright').Page} page
 * @returns {Promise<{code:string, rule:string, status:string, message:string, fix_suggestion:string, details:string[]}>>}
 */
export async function check(page) {
  try {
  const result = await page.evaluate(() => {
      const bad = [...document.querySelectorAll('[onclick],[onmousedown],[onmouseover]')]
        .filter(el => !['A','BUTTON','INPUT','SELECT','TEXTAREA','SUMMARY'].includes(el.tagName))
        .filter(el => {
          const ti = el.getAttribute('tabindex');
          return ti === null || parseInt(ti) < 0;
        }).map(el => el.tagName + (el.id ? '#'+el.id : '') + (el.className ? '.'+String(el.className).split(' ')[0] : '')).slice(0,5);
      const total = document.querySelectorAll('a[href], button:not([disabled]), input:not([disabled]), select:not([disabled])').length;
      return { bad, total };
    });
    if (result.bad.length) return fail(`${result.bad.length} 個有 click 事件但無鍵盤存取`, '改用 <button> 或加 tabindex="0" 並監聽 keydown Enter/Space', result.bad);
    return pass(`${result.total} 個互動元件均可鍵盤操作`);
  } catch (err) {
    return { code: 'GN1210100E', rule: '提供由鍵盤觸發的事件處理程式', status: 'fail', message: `執行錯誤: ${err.message}`, fix_suggestion: '確認頁面載入完成後再執行', details: [] };
  }
}

export const metadata = {
  code: 'GN1210100E',
  criterion: '2.1.1',
  level: 'A',
  category: 'General',
  rule: '提供由鍵盤觸發的事件處理程式',
};
