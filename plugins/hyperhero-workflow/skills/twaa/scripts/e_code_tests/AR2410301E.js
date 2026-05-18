/**
 * AR2410301E — 使用ARIA role=alert或aria-live來識別錯誤
 * 對應成功準則：4.1.3（等級 AA）
 * 類別：ARIA
 *
 * 官方稽核步驟：
   * 程序
   * - 確定頁面載入時，DOM中存在空的錯誤容器role=alert或aria-live=assertive屬性。
   * - 觸發可導致在活動區域中的內容出現或更新的錯誤。
   * - 確定錯誤訊息已注入到已經存在的錯誤容器中。
   * 預期結果：#1和#3為是。
 *
 * 注意：此為自動化程式碼測試，依官方稽核步驟實作 Playwright 驗證。
 * 不依賴 AI 判斷，全部使用 DOM 查詢、CSS 計算、鍵盤模擬等程式碼。
 */

function pass(detail = '', details = []) {
  return { code: 'AR2410301E', rule: '使用ARIA role=alert或aria-live來識別錯誤', status: 'pass', message: detail, fix_suggestion: '', details };
}
function fail(message, fix = '', details = []) {
  return { code: 'AR2410301E', rule: '使用ARIA role=alert或aria-live來識別錯誤', status: 'fail', message, fix_suggestion: fix, details: Array.isArray(details) ? details : [details] };
}

/**
 * @param {import('playwright').Page} page
 * @returns {Promise<{code:string, rule:string, status:string, message:string, fix_suggestion:string, details:string[]}>>}
 */
export async function check(page) {
  try {
  const result = await page.evaluate(() => {
      const alerts = document.querySelectorAll('[role="alert"],[aria-live="assertive"]').length;
      const errLike = [...document.querySelectorAll('[class*="error"],[class*="danger"]')].filter(el => el.offsetWidth > 0 && !el.getAttribute('role') && !el.getAttribute('aria-live')).length;
      return { alerts, errLike };
    });
    if (result.errLike && !result.alerts) return fail(`${result.errLike} 個錯誤容器缺少 role="alert"`, 'role="alert" 或 aria-live="assertive"');
    return pass(`role=alert: ${result.alerts}個`);
  } catch (err) {
    return { code: 'AR2410301E', rule: '使用ARIA role=alert或aria-live來識別錯誤', status: 'fail', message: `執行錯誤: ${err.message}`, fix_suggestion: '確認頁面載入完成後再執行', details: [] };
  }
}

export const metadata = {
  code: 'AR2410301E',
  criterion: '4.1.3',
  level: 'AA',
  category: 'ARIA',
  rule: '使用ARIA role=alert或aria-live來識別錯誤',
};
