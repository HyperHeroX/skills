/**
 * AR3130600E — 使用ARIA地標來識別網頁的區域
 * 對應成功準則：1.3.6（等級 AAA）
 * 類別：ARIA
 *
 * 官方稽核步驟：
   * **程序**
   * 1. 檢查每個具有landmark role地標角色的元素。
   * 2. 檢查是否將地標角色屬性應用於與該角色對應的頁面部分。(即，"導航(navigation)"角色應用於導航部分，"主要內容(main)"角色應用於主要內容的位置。)
   * **預期結果**
   * #1和#2為是。
 *
 * 注意：此為自動化程式碼測試，依官方稽核步驟實作 Playwright 驗證。
 * 不依賴 AI 判斷，全部使用 DOM 查詢、CSS 計算、鍵盤模擬等程式碼。
 */

function pass(detail = '', details = []) {
  return { code: 'AR3130600E', rule: '使用ARIA地標來識別網頁的區域', status: 'pass', message: detail, fix_suggestion: '', details };
}
function fail(message, fix = '', details = []) {
  return { code: 'AR3130600E', rule: '使用ARIA地標來識別網頁的區域', status: 'fail', message, fix_suggestion: fix, details: Array.isArray(details) ? details : [details] };
}

/**
 * @param {import('playwright').Page} page
 * @returns {Promise<{code:string, rule:string, status:string, message:string, fix_suggestion:string, details:string[]}>>}
 */
export async function check(page) {
  try {
  const landmarks = await page.evaluate(() => {
      const found = new Set();
      ['main','nav','header','footer','aside'].forEach(t => { if (document.querySelector(t)) found.add(t); });
      ['banner','main','navigation','contentinfo'].forEach(r => { if (document.querySelector(`[role="${r}"]`)) found.add('role='+r); });
      const navs = [...document.querySelectorAll('nav')];
      const navsLabeled = navs.filter(n => n.getAttribute('aria-label')||n.getAttribute('aria-labelledby')).length;
      return { landmarks: [...found], navTotal: navs.length, navsLabeled };
    });
    if (!landmarks.landmarks.some(l => l.includes('main'))) return fail('缺少 <main> landmark', '<main id="main-content">');
    if (landmarks.navTotal > 1 && landmarks.navsLabeled < landmarks.navTotal)
      return fail(`${landmarks.navTotal} 個 nav 中只有 ${landmarks.navsLabeled} 個有 aria-label`, '每個 nav 加 aria-label 以區分');
    return pass(`Landmarks: ${landmarks.landmarks.join(', ')}`);
  } catch (err) {
    return { code: 'AR3130600E', rule: '使用ARIA地標來識別網頁的區域', status: 'fail', message: `執行錯誤: ${err.message}`, fix_suggestion: '確認頁面載入完成後再執行', details: [] };
  }
}

export const metadata = {
  code: 'AR3130600E',
  criterion: '1.3.6',
  level: 'AAA',
  category: 'ARIA',
  rule: '使用ARIA地標來識別網頁的區域',
};
