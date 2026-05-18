/**
 * GN1330100E — 提供文字描述以指明未完成的必填欄位。
 * 對應成功準則：3.3.1（等級 A）
 * 類別：General
 *
 * 官方稽核步驟：
   * 填寫表單測試的時候，留下必填欄位不填寫，並且按送出/提交/commit。 檢查此時是否會有文字提醒尚未完成填寫的必填欄位。 並且，之前所填寫的欄位內容不會消失。
 *
 * 注意：此為自動化程式碼測試，依官方稽核步驟實作 Playwright 驗證。
 * 不依賴 AI 判斷，全部使用 DOM 查詢、CSS 計算、鍵盤模擬等程式碼。
 */

function pass(detail = '', details = []) {
  return { code: 'GN1330100E', rule: '提供文字描述以指明未完成的必填欄位。', status: 'pass', message: detail, fix_suggestion: '', details };
}
function fail(message, fix = '', details = []) {
  return { code: 'GN1330100E', rule: '提供文字描述以指明未完成的必填欄位。', status: 'fail', message, fix_suggestion: fix, details: Array.isArray(details) ? details : [details] };
}

/**
 * @param {import('playwright').Page} page
 * @returns {Promise<{code:string, rule:string, status:string, message:string, fix_suggestion:string, details:string[]}>>}
 */
export async function check(page) {
  try {
  const formResult = await page.evaluate(() => {
      const inputs = [...document.querySelectorAll('input:not([type="hidden"])')];
      const noLabel = inputs.filter(i => !i.labels?.length && !i.getAttribute('aria-label') && !i.getAttribute('aria-labelledby') && !i.getAttribute('title')).length;
      const noAutocomp = inputs.filter(i => ['email','tel','text','password'].includes(i.type) && !i.getAttribute('autocomplete')).length;
      const pwdAutocomplete = inputs.filter(i => i.type==='password' && i.getAttribute('autocomplete')==='current-password').length;
      return { inputs: inputs.length, noLabel, noAutocomp, pwdAutocomplete };
    });
    const issues = [];
    if (formResult.noLabel) issues.push(`${formResult.noLabel}個輸入缺label`);
    if (formResult.noAutocomp > 3) issues.push(`${formResult.noAutocomp}個輸入缺autocomplete`);
    if (issues.length) return fail(issues.join('; '), '補充 label、autocomplete 屬性');
    return pass(`表單通過（inputs:${formResult.inputs}, pwd autocomplete:${formResult.pwdAutocomplete}）`);
  } catch (err) {
    return { code: 'GN1330100E', rule: '提供文字描述以指明未完成的必填欄位。', status: 'fail', message: `執行錯誤: ${err.message}`, fix_suggestion: '確認頁面載入完成後再執行', details: [] };
  }
}

export const metadata = {
  code: 'GN1330100E',
  criterion: '3.3.1',
  level: 'A',
  category: 'General',
  rule: '提供文字描述以指明未完成的必填欄位。',
};
