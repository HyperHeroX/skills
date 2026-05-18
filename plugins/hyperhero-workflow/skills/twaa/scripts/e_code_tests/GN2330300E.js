/**
 * GN2330300E — 提供文字描述以指明未完成的必填欄位，並建立可以讓使用者跳到出錯之處的機制
 * 對應成功準則：3.3.3（等級 AA）
 * 類別：General
 *
 * 官方稽核步驟：
   * 範例1：提供文字描述以指明未完成的必填欄位
   * 欄位未輸入訊息。 按下提交鍵後，會跳出錯誤訊息：輸入格式錯誤或者此處不能為空白。 使用Google Chrome「檢視原始碼」顯示連結(按下右鍵→檢視原始碼)，檢查是否具有警示出錯的機制。
 *
 * 注意：此為自動化程式碼測試，依官方稽核步驟實作 Playwright 驗證。
 * 不依賴 AI 判斷，全部使用 DOM 查詢、CSS 計算、鍵盤模擬等程式碼。
 */

function pass(detail = '', details = []) {
  return { code: 'GN2330300E', rule: '提供文字描述以指明未完成的必填欄位，並建立可以讓使用者跳到出錯之處的機制', status: 'pass', message: detail, fix_suggestion: '', details };
}
function fail(message, fix = '', details = []) {
  return { code: 'GN2330300E', rule: '提供文字描述以指明未完成的必填欄位，並建立可以讓使用者跳到出錯之處的機制', status: 'fail', message, fix_suggestion: fix, details: Array.isArray(details) ? details : [details] };
}

/**
 * @param {import('playwright').Page} page
 * @returns {Promise<{code:string, rule:string, status:string, message:string, fix_suggestion:string, details:string[]}>>}
 */
export async function check(page) {
  try {
  const submitBtn = page.locator('form [type="submit"], form button:not([type="button"])').first();
    if (!await submitBtn.count()) return pass('無提交按鈕，跳過');
    await submitBtn.click().catch(() => {});
    await page.waitForTimeout(800);
    const result = await page.evaluate(() => {
      const firstInvalid = document.querySelector('[aria-invalid="true"]');
      const active = document.activeElement;
      return { firstInvalidId: firstInvalid?.id, activeId: active?.id, match: firstInvalid && active === firstInvalid };
    });
    if (!result.firstInvalidId) return fail('送出後無 aria-invalid="true" 標示錯誤', '驗證失敗時加 aria-invalid="true" 到錯誤欄位');
    if (!result.match) return fail(`焦點在 #${result.activeId}，應在錯誤欄位 #${result.firstInvalidId}`, '驗證後呼叫 firstErrorEl.focus()');
    return pass('送出後焦點正確跳至第一個錯誤欄位');
  } catch (err) {
    return { code: 'GN2330300E', rule: '提供文字描述以指明未完成的必填欄位，並建立可以讓使用者跳到出錯之處的機制', status: 'fail', message: `執行錯誤: ${err.message}`, fix_suggestion: '確認頁面載入完成後再執行', details: [] };
  }
}

export const metadata = {
  code: 'GN2330300E',
  criterion: '3.3.3',
  level: 'AA',
  category: 'General',
  rule: '提供文字描述以指明未完成的必填欄位，並建立可以讓使用者跳到出錯之處的機制',
};
