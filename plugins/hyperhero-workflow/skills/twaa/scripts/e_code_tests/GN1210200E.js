/**
 * GN1210200E — 確認使用者不會困在內容中
 * 對應成功準則：2.1.2（等級 A）
 * 類別：General
 *
 * 官方稽核步驟：
   * 1. 按tab鍵，能依序瀏覽所有內容。以此範例為例，按下tab鍵會依序跑完所有需要填寫的內容中，不會跳到其他內容。
   * 2. 若要使用者困在其他內容中，可選擇以下鍵入來取消焦點：Tab、Shift + Tab、Esc、Shift + F10、Alt + Enter、Ctrl + I。
 *
 * 注意：此為自動化程式碼測試，依官方稽核步驟實作 Playwright 驗證。
 * 不依賴 AI 判斷，全部使用 DOM 查詢、CSS 計算、鍵盤模擬等程式碼。
 */

function pass(detail = '', details = []) {
  return { code: 'GN1210200E', rule: '確認使用者不會困在內容中', status: 'pass', message: detail, fix_suggestion: '', details };
}
function fail(message, fix = '', details = []) {
  return { code: 'GN1210200E', rule: '確認使用者不會困在內容中', status: 'fail', message, fix_suggestion: fix, details: Array.isArray(details) ? details : [details] };
}

/**
 * @param {import('playwright').Page} page
 * @returns {Promise<{code:string, rule:string, status:string, message:string, fix_suggestion:string, details:string[]}>>}
 */
export async function check(page) {
  try {
  const startUrl = page.url();
    const seq = [];
    for (let i = 0; i < 15; i++) {
      await page.keyboard.press('Tab');
      const info = await page.evaluate(() => {
        const el = document.activeElement;
        return el && el !== document.body ? { tag: el.tagName, id: el.id || '' } : null;
      });
      if (info) seq.push(info.tag + (info.id ? '#'+info.id : ''));
    }
    if (page.url() !== startUrl) return fail(`Tab 走訪後頁面跳轉至 ${page.url()}`, '移除 onfocus 觸發的自動導覽');
    const last5 = new Set(seq.slice(-5)).size;
    if (last5 <= 2) return fail(`疑似焦點陷阱：${seq.slice(-5).join(',')}`, '確認 Tab/Esc 可離開所有元件', seq.slice(-5));
    return pass(`Tab 走訪 ${seq.length} 個元素，無焦點陷阱`);
  } catch (err) {
    return { code: 'GN1210200E', rule: '確認使用者不會困在內容中', status: 'fail', message: `執行錯誤: ${err.message}`, fix_suggestion: '確認頁面載入完成後再執行', details: [] };
  }
}

export const metadata = {
  code: 'GN1210200E',
  criterion: '2.1.2',
  level: 'A',
  category: 'General',
  rule: '確認使用者不會困在內容中',
};
