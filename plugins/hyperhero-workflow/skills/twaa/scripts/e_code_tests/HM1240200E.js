/**
 * HM1240200E — 提供網頁的描述性標題
 * 對應成功準則：2.4.2（等級 A）
 * 類別：General
 *
 * 官方稽核步驟：
   * 1. 檢測瀏覽器網頁上所顯示描述性的標題。
   * 2. 按右鍵->選擇檢視網頁原始碼。
   * 3. 檢查`<title>`標籤即可看到網頁的描述性標題內容。
 *
 * 注意：此為自動化程式碼測試，依官方稽核步驟實作 Playwright 驗證。
 * 不依賴 AI 判斷，全部使用 DOM 查詢、CSS 計算、鍵盤模擬等程式碼。
 */

function pass(detail = '', details = []) {
  return { code: 'HM1240200E', rule: '提供網頁的描述性標題', status: 'pass', message: detail, fix_suggestion: '', details };
}
function fail(message, fix = '', details = []) {
  return { code: 'HM1240200E', rule: '提供網頁的描述性標題', status: 'fail', message, fix_suggestion: fix, details: Array.isArray(details) ? details : [details] };
}

/**
 * @param {import('playwright').Page} page
 * @returns {Promise<{code:string, rule:string, status:string, message:string, fix_suggestion:string, details:string[]}>>}
 */
export async function check(page) {
  try {
  const title = await page.title();
    if (!title?.trim()) return fail('頁面 <title> 為空或不存在', '<title>頁面名稱 - 系統名稱</title>');
    if (title.length < 4) return fail(`標題過短："${title}"（${title.length}字）`, '標題應描述頁面主旨，格式：頁面名稱 - 系統名稱');
    return pass(`標題：${title}`);
  } catch (err) {
    return { code: 'HM1240200E', rule: '提供網頁的描述性標題', status: 'fail', message: `執行錯誤: ${err.message}`, fix_suggestion: '確認頁面載入完成後再執行', details: [] };
  }
}

export const metadata = {
  code: 'HM1240200E',
  criterion: '2.4.2',
  level: 'A',
  category: 'General',
  rule: '提供網頁的描述性標題',
};
