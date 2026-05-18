/**
 * GN1240101E — 在重複內容的區塊開頭加入鏈結，連到該區塊結束之處，或用頁框來群聚重複出現的材料區塊
 * 對應成功準則：2.4.1（等級 A）
 * 類別：General
 *
 * 官方稽核步驟：
   * 1. 使用Google Chrome「檢視原始碼」顯示連結 (按下右鍵→檢視原始碼)。
   * 2. 確認程式碼裡鏈結是否可以連往其他區塊。
 *
 * 注意：此為自動化程式碼測試，依官方稽核步驟實作 Playwright 驗證。
 * 不依賴 AI 判斷，全部使用 DOM 查詢、CSS 計算、鍵盤模擬等程式碼。
 */

function pass(detail = '', details = []) {
  return { code: 'GN1240101E', rule: '在重複內容的區塊開頭加入鏈結，連到該區塊結束之處，或用頁框來群聚重複出現的材料區塊', status: 'pass', message: detail, fix_suggestion: '', details };
}
function fail(message, fix = '', details = []) {
  return { code: 'GN1240101E', rule: '在重複內容的區塊開頭加入鏈結，連到該區塊結束之處，或用頁框來群聚重複出現的材料區塊', status: 'fail', message, fix_suggestion: fix, details: Array.isArray(details) ? details : [details] };
}

/**
 * @param {import('playwright').Page} page
 * @returns {Promise<{code:string, rule:string, status:string, message:string, fix_suggestion:string, details:string[]}>>}
 */
export async function check(page) {
  try {
  const result = await page.evaluate(() => {
      const skip = document.querySelector('a[href^="#main"],a[href^="#content"],[class*="skip"]');
      return {
        hasSkipLink: !!skip,
        text: skip?.textContent?.trim() || '',
        target: skip?.getAttribute('href') || '',
        targetExists: skip ? !!document.querySelector(skip.getAttribute('href') || '#') : false,
      };
    });
    if (!result.hasSkipLink) return fail('缺少跳過導覽 skip link', '<a class="skip-link" href="#main-content">跳至主要內容</a> 放在 <body> 第一個元素');
    if (!result.targetExists) return fail(`skip link 目標 "${result.target}" 不存在`, `確保有 id="${result.target.slice(1)}" 的元素`);
    return pass(`skip link 存在：${result.text}`);
  } catch (err) {
    return { code: 'GN1240101E', rule: '在重複內容的區塊開頭加入鏈結，連到該區塊結束之處，或用頁框來群聚重複出現的材料區塊', status: 'fail', message: `執行錯誤: ${err.message}`, fix_suggestion: '確認頁面載入完成後再執行', details: [] };
  }
}

export const metadata = {
  code: 'GN1240101E',
  criterion: '2.4.1',
  level: 'A',
  category: 'General',
  rule: '在重複內容的區塊開頭加入鏈結，連到該區塊結束之處，或用頁框來群聚重複出現的材料區塊',
};
