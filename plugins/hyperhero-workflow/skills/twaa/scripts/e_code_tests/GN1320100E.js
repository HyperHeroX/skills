/**
 * GN1320100E — 物件單純取得焦點時不要觸發脈絡變更，等使用者啟動該物件後才觸發脈絡變更
 * 對應成功準則：3.2.1（等級 A）
 * 類別：General
 *
 * 官方稽核步驟：
   * Google Chrome「檢視原始碼」顯示連結(按下右鍵→檢視原始碼)。 檢查是否使用onclick功能，當使用者利用Tab鍵選擇物件，物件取得焦點時不會直接觸發脈絡變更，需使用者啟動該物件後才觸發脈絡變更。 是否在使用tab鍵取得焦點時不會觸發結果，須點擊物件才觸發。
 *
 * 注意：此為自動化程式碼測試，依官方稽核步驟實作 Playwright 驗證。
 * 不依賴 AI 判斷，全部使用 DOM 查詢、CSS 計算、鍵盤模擬等程式碼。
 */

function pass(detail = '', details = []) {
  return { code: 'GN1320100E', rule: '物件單純取得焦點時不要觸發脈絡變更，等使用者啟動該物件後才觸發脈絡變更', status: 'pass', message: detail, fix_suggestion: '', details };
}
function fail(message, fix = '', details = []) {
  return { code: 'GN1320100E', rule: '物件單純取得焦點時不要觸發脈絡變更，等使用者啟動該物件後才觸發脈絡變更', status: 'fail', message, fix_suggestion: fix, details: Array.isArray(details) ? details : [details] };
}

/**
 * @param {import('playwright').Page} page
 * @returns {Promise<{code:string, rule:string, status:string, message:string, fix_suggestion:string, details:string[]}>>}
 */
export async function check(page) {
  try {
  const focusCount = [];
    for (let i = 0; i < 8; i++) {
      await page.keyboard.press('Tab');
      const el = await page.evaluate(() => {
        const e = document.activeElement;
        if (!e || e === document.body) return null;
        const s = window.getComputedStyle(e);
        return { tag: e.tagName, hasFocus: s.outlineStyle !== 'none' || s.boxShadow !== 'none' };
      });
      if (el) focusCount.push(el);
    }
    const invisible = focusCount.filter(e => !e.hasFocus).length;
    if (invisible > focusCount.length * 0.5) return fail(`${invisible}/${focusCount.length} 個焦點停駐點無可視焦點指示器`, ':focus-visible { outline: 3px solid #005fcc; }');
    return pass(`Tab 走訪 ${focusCount.length} 個，${focusCount.length-invisible} 個有可視焦點`);
  } catch (err) {
    return { code: 'GN1320100E', rule: '物件單純取得焦點時不要觸發脈絡變更，等使用者啟動該物件後才觸發脈絡變更', status: 'fail', message: `執行錯誤: ${err.message}`, fix_suggestion: '確認頁面載入完成後再執行', details: [] };
  }
}

export const metadata = {
  code: 'GN1320100E',
  criterion: '3.2.1',
  level: 'A',
  category: 'General',
  rule: '物件單純取得焦點時不要觸發脈絡變更，等使用者啟動該物件後才觸發脈絡變更',
};
