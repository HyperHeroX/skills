/**
 * GN1310100E — 明確指出網頁文字所使用的人類語言
 * 對應成功準則：3.1.1（等級 A）
 * 類別：General
 *
 * 官方稽核步驟：
   * 以Google Chrome瀏覽器為例，在網頁上按右鍵選擇"檢視網頁原始碼"。 搜尋lang=""，即可查看""裡的語言為何，例如：zh-Hant-TW為正體中文、de為德語、fr為法語等。
 *
 * 注意：此為自動化程式碼測試，依官方稽核步驟實作 Playwright 驗證。
 * 不依賴 AI 判斷，全部使用 DOM 查詢、CSS 計算、鍵盤模擬等程式碼。
 */

function pass(detail = '', details = []) {
  return { code: 'GN1310100E', rule: '明確指出網頁文字所使用的人類語言', status: 'pass', message: detail, fix_suggestion: '', details };
}
function fail(message, fix = '', details = []) {
  return { code: 'GN1310100E', rule: '明確指出網頁文字所使用的人類語言', status: 'fail', message, fix_suggestion: fix, details: Array.isArray(details) ? details : [details] };
}

/**
 * @param {import('playwright').Page} page
 * @returns {Promise<{code:string, rule:string, status:string, message:string, fix_suggestion:string, details:string[]}>>}
 */
export async function check(page) {
  try {
  const lang = await page.evaluate(() => document.documentElement.getAttribute('lang'));
    if (!lang) return fail('html 缺少 lang 屬性', '<html lang="zh-Hant-TW">');
    if (lang.toLowerCase() === 'zh-tw') return fail(`lang="${lang}" 應為 zh-Hant-TW（MODA 建議）`, '<html lang="zh-Hant-TW">');
    if (!lang.match(/^[a-zA-Z]{2}/)) return fail(`lang="${lang}" 不符 BCP 47 格式`, 'lang="zh-Hant-TW" 或 lang="en"');
    return pass(`lang="${lang}"`);
  } catch (err) {
    return { code: 'GN1310100E', rule: '明確指出網頁文字所使用的人類語言', status: 'fail', message: `執行錯誤: ${err.message}`, fix_suggestion: '確認頁面載入完成後再執行', details: [] };
  }
}

export const metadata = {
  code: 'GN1310100E',
  criterion: '3.1.1',
  level: 'A',
  category: 'General',
  rule: '明確指出網頁文字所使用的人類語言',
};
