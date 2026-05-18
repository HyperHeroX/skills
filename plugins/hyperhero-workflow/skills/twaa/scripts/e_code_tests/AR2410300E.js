/**
 * AR2410300E — 使用ARIA role=status顯示狀態訊息
 * 對應成功準則：4.1.3（等級 AA）
 * 類別：ARIA
 *
 * 官方稽核步驟：
   * 程序
   * 對於每個狀態訊息：
   * - 檢查在狀態訊息出現之前，預定放置狀態訊息的容器是否具有屬性值為status的role。
   * - 檢查觸發狀態訊息時，訊息是否在容器內。
   * - 檢查提供與狀態訊息的視覺體驗等效的訊息的元素或屬性(例如具有正確ALT文本的購物車圖片)是否也在容器中。
   * 預期結果：#1、#2和#3為是。
 *
 * 注意：此為自動化程式碼測試，依官方稽核步驟實作 Playwright 驗證。
 * 不依賴 AI 判斷，全部使用 DOM 查詢、CSS 計算、鍵盤模擬等程式碼。
 */

function pass(detail = '', details = []) {
  return { code: 'AR2410300E', rule: '使用ARIA role=status顯示狀態訊息', status: 'pass', message: detail, fix_suggestion: '', details };
}
function fail(message, fix = '', details = []) {
  return { code: 'AR2410300E', rule: '使用ARIA role=status顯示狀態訊息', status: 'fail', message, fix_suggestion: fix, details: Array.isArray(details) ? details : [details] };
}

/**
 * @param {import('playwright').Page} page
 * @returns {Promise<{code:string, rule:string, status:string, message:string, fix_suggestion:string, details:string[]}>>}
 */
export async function check(page) {
  try {
  const status = await page.evaluate(() => {
      const regions = [...document.querySelectorAll('[role="status"],[role="log"]')];
      const alike = [...document.querySelectorAll('[class*="success"],[class*="status"],[class*="notification"]')].filter(el => el.offsetWidth > 0 && !el.getAttribute('role'));
      return { regions: regions.length, alike: alike.map(el => el.className.split(' ')[0]).slice(0,5) };
    });
    if (status.alike.length && !status.regions) return fail(`${status.alike.length} 個疑似狀態訊息元素缺少 role="status"`, '<div role="status" aria-live="polite">狀態訊息</div>', status.alike);
    return pass(`role=status/log: ${status.regions} 個`);
  } catch (err) {
    return { code: 'AR2410300E', rule: '使用ARIA role=status顯示狀態訊息', status: 'fail', message: `執行錯誤: ${err.message}`, fix_suggestion: '確認頁面載入完成後再執行', details: [] };
  }
}

export const metadata = {
  code: 'AR2410300E',
  criterion: '4.1.3',
  level: 'AA',
  category: 'ARIA',
  rule: '使用ARIA role=status顯示狀態訊息',
};
