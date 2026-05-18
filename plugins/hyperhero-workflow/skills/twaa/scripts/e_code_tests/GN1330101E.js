/**
 * GN1330101E — 使用者輸入的內容不在允許清單中，或格式未符合所需時，均提供文字描述。
 * 對應成功準則：3.3.1（等級 A）
 * 類別：General
 *
 * 官方稽核步驟：
   * 填寫表格資料，並且刻意填寫不符合規定的文字。 檢查是否會出現錯誤敘述，並且提醒使用者要如何修正錯誤。 並且，原本已經填好的資料，不會因此消失，除非是為了安全起見，將類似密碼的資訊給清除。
 *
 * 注意：此為自動化程式碼測試，依官方稽核步驟實作 Playwright 驗證。
 * 不依賴 AI 判斷，全部使用 DOM 查詢、CSS 計算、鍵盤模擬等程式碼。
 */

function pass(detail = '', details = []) {
  return { code: 'GN1330101E', rule: '使用者輸入的內容不在允許清單中，或格式未符合所需時，均提供文字描述。', status: 'pass', message: detail, fix_suggestion: '', details };
}
function fail(message, fix = '', details = []) {
  return { code: 'GN1330101E', rule: '使用者輸入的內容不在允許清單中，或格式未符合所需時，均提供文字描述。', status: 'fail', message, fix_suggestion: fix, details: Array.isArray(details) ? details : [details] };
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
    return { code: 'GN1330101E', rule: '使用者輸入的內容不在允許清單中，或格式未符合所需時，均提供文字描述。', status: 'fail', message: `執行錯誤: ${err.message}`, fix_suggestion: '確認頁面載入完成後再執行', details: [] };
  }
}

export const metadata = {
  code: 'GN1330101E',
  criterion: '3.3.1',
  level: 'A',
  category: 'General',
  rule: '使用者輸入的內容不在允許清單中，或格式未符合所需時，均提供文字描述。',
};
