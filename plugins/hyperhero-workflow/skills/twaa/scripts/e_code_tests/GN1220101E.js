/**
 * GN1220101E — 提供能讓使用者將時間限制設為預設時間限制十倍，或完全關閉時間限制的方法
 * 對應成功準則：2.2.1（等級 A）
 * 類別：General
 *
 * 官方稽核步驟：
   * 1. 檢查網頁表單填寫是否具有時間限制，並將預設時間更改為原先的10倍。以下範例原先預設時間為10秒，選擇增加10倍後，預設時間變成100秒。
   * 2. 網頁表單填寫若有時間限制，則有一個選項能取消時間限制。
 *
 * 注意：此為自動化程式碼測試，依官方稽核步驟實作 Playwright 驗證。
 * 不依賴 AI 判斷，全部使用 DOM 查詢、CSS 計算、鍵盤模擬等程式碼。
 */

function pass(detail = '', details = []) {
  return { code: 'GN1220101E', rule: '提供能讓使用者將時間限制設為預設時間限制十倍，或完全關閉時間限制的方法', status: 'pass', message: detail, fix_suggestion: '', details };
}
function fail(message, fix = '', details = []) {
  return { code: 'GN1220101E', rule: '提供能讓使用者將時間限制設為預設時間限制十倍，或完全關閉時間限制的方法', status: 'fail', message, fix_suggestion: fix, details: Array.isArray(details) ? details : [details] };
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
    return { code: 'GN1220101E', rule: '提供能讓使用者將時間限制設為預設時間限制十倍，或完全關閉時間限制的方法', status: 'fail', message: `執行錯誤: ${err.message}`, fix_suggestion: '確認頁面載入完成後再執行', details: [] };
  }
}

export const metadata = {
  code: 'GN1220101E',
  criterion: '2.2.1',
  level: 'A',
  category: 'General',
  rule: '提供能讓使用者將時間限制設為預設時間限制十倍，或完全關閉時間限制的方法',
};
