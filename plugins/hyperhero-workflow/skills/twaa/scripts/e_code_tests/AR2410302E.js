/**
 * AR2410302E — 使用ARIA role=log識別順序訊息更新
 * 對應成功準則：4.1.3（等級 AA）
 * 類別：ARIA
 *
 * 官方稽核步驟：
   * 程序
   * 在包含按順序更新訊息的頁面上：
   * 1. 檢查訊息的容器是否具有日誌(log)角色。
   * 預期結果：#1為是。
 *
 * 注意：此為自動化程式碼測試，依官方稽核步驟實作 Playwright 驗證。
 * 不依賴 AI 判斷，全部使用 DOM 查詢、CSS 計算、鍵盤模擬等程式碼。
 */

function pass(detail = '', details = []) {
  return { code: 'AR2410302E', rule: '使用ARIA role=log識別順序訊息更新', status: 'pass', message: detail, fix_suggestion: '', details };
}
function fail(message, fix = '', details = []) {
  return { code: 'AR2410302E', rule: '使用ARIA role=log識別順序訊息更新', status: 'fail', message, fix_suggestion: fix, details: Array.isArray(details) ? details : [details] };
}

/**
 * @param {import('playwright').Page} page
 * @returns {Promise<{code:string, rule:string, status:string, message:string, fix_suggestion:string, details:string[]}>>}
 */
export async function check(page) {
  try {
  const result = await page.evaluate(() => {
      const logs = document.querySelectorAll('[role="log"]').length;
      const chatLike = document.querySelectorAll('[class*="chat"],[class*="log"],[class*="feed"],[class*="timeline"]').length;
      return { logs, chatLike };
    });
    if (result.chatLike && !result.logs) return fail(`${result.chatLike} 個疑似訊息串列缺少 role="log"`, '<div role="log" aria-live="polite">');
    return pass(`role=log: ${result.logs}個`);
  } catch (err) {
    return { code: 'AR2410302E', rule: '使用ARIA role=log識別順序訊息更新', status: 'fail', message: `執行錯誤: ${err.message}`, fix_suggestion: '確認頁面載入完成後再執行', details: [] };
  }
}

export const metadata = {
  code: 'AR2410302E',
  criterion: '4.1.3',
  level: 'AA',
  category: 'ARIA',
  rule: '使用ARIA role=log識別順序訊息更新',
};
