/**
 * CS1110114E — 使用CSS方塊模型來處理版面設計，不要用佔位圖片
 * 對應成功準則：1.1.1（等級 A）
 * 類別：CSS
 *
 * 官方稽核步驟：
   * 使用Google Chrome「檢視原始碼」顯示連結 (按下右鍵→檢視原始碼)
   * 檢查項目內容是否有用CSS方塊模型來處理版面
 *
 * 注意：此為自動化程式碼測試，依官方稽核步驟實作 Playwright 驗證。
 * 不依賴 AI 判斷，全部使用 DOM 查詢、CSS 計算、鍵盤模擬等程式碼。
 */

function pass(detail = '', details = []) {
  return { code: 'CS1110114E', rule: '使用CSS方塊模型來處理版面設計，不要用佔位圖片', status: 'pass', message: detail, fix_suggestion: '', details };
}
function fail(message, fix = '', details = []) {
  return { code: 'CS1110114E', rule: '使用CSS方塊模型來處理版面設計，不要用佔位圖片', status: 'fail', message, fix_suggestion: fix, details: Array.isArray(details) ? details : [details] };
}

/**
 * @param {import('playwright').Page} page
 * @returns {Promise<{code:string, rule:string, status:string, message:string, fix_suggestion:string, details:string[]}>>}
 */
export async function check(page) {
  try {
  const result = await page.evaluate(() => {
      const decorativeImgs = [...document.querySelectorAll('img[alt=""]')].length;
      const spacerImgs = [...document.querySelectorAll('img')].filter(i => {
        const src = (i.getAttribute('src') || '').toLowerCase();
        return src.includes('spacer') || src.includes('blank') || src.includes('pixel') || src.includes('1x1');
      }).length;
      return { decorativeImgs, spacerImgs };
    });
    if (result.spacerImgs) return fail(`${result.spacerImgs} 個疑似佔位圖片，應改用 CSS`, '將佔位/裝飾圖片改為 CSS background-image，移除 <img>');
    return pass(`裝飾性圖片（alt=""）: ${result.decorativeImgs}個，無佔位圖片`);
  } catch (err) {
    return { code: 'CS1110114E', rule: '使用CSS方塊模型來處理版面設計，不要用佔位圖片', status: 'fail', message: `執行錯誤: ${err.message}`, fix_suggestion: '確認頁面載入完成後再執行', details: [] };
  }
}

export const metadata = {
  code: 'CS1110114E',
  criterion: '1.1.1',
  level: 'A',
  category: 'CSS',
  rule: '使用CSS方塊模型來處理版面設計，不要用佔位圖片',
};
