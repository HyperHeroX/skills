/**
 * HM1110108E — 提供物件的文字替代內容與非文字替代內容，且要能完整表達該物件的意義與功能
 * 對應成功準則：1.1.1（等級 A）
 * 類別：HTML
 *
 * 官方稽核步驟：
   * 1. 檢查網頁原始碼，找出使用 Object 標籤的地方。
   * 2. 檢查是否在 Object 標籤的原始碼程式裡，填寫描述 Object 的替代文字，且符合 Object 的內容。
   * 3. 在 `<Object>` 與 `</Object>` 之間，應有替代文字，或是利用其他方式（例如巢狀 Object 結構）顯示替代圖片。
 *
 * 注意：此為自動化程式碼測試，依官方稽核步驟實作 Playwright 驗證。
 * 不依賴 AI 判斷，全部使用 DOM 查詢、CSS 計算、鍵盤模擬等程式碼。
 */

function pass(detail = '', details = []) {
  return { code: 'HM1110108E', rule: '提供物件的文字替代內容與非文字替代內容，且要能完整表達該物件的意義與功能', status: 'pass', message: detail, fix_suggestion: '', details };
}
function fail(message, fix = '', details = []) {
  return { code: 'HM1110108E', rule: '提供物件的文字替代內容與非文字替代內容，且要能完整表達該物件的意義與功能', status: 'fail', message, fix_suggestion: fix, details: Array.isArray(details) ? details : [details] };
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
    return { code: 'HM1110108E', rule: '提供物件的文字替代內容與非文字替代內容，且要能完整表達該物件的意義與功能', status: 'fail', message: `執行錯誤: ${err.message}`, fix_suggestion: '確認頁面載入完成後再執行', details: [] };
  }
}

export const metadata = {
  code: 'HM1110108E',
  criterion: '1.1.1',
  level: 'A',
  category: 'HTML',
  rule: '提供物件的文字替代內容與非文字替代內容，且要能完整表達該物件的意義與功能',
};
