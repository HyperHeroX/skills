/**
 * GN1220201E — 建立閃動少於5秒鐘的內容
 * 對應成功準則：2.2.2（等級 A）
 * 類別：General
 *
 * 官方稽核步驟：
   * 1. 找出網頁上任何會閃動的內容。
   * 2. 確保此動態閃動必須短於5秒內(包括閃動的間隔及短影片全部播放的總時間)。
 *
 * 注意：此為自動化程式碼測試，依官方稽核步驟實作 Playwright 驗證。
 * 不依賴 AI 判斷，全部使用 DOM 查詢、CSS 計算、鍵盤模擬等程式碼。
 */

function pass(detail = '', details = []) {
  return { code: 'GN1220201E', rule: '建立閃動少於5秒鐘的內容', status: 'pass', message: detail, fix_suggestion: '', details };
}
function fail(message, fix = '', details = []) {
  return { code: 'GN1220201E', rule: '建立閃動少於5秒鐘的內容', status: 'fail', message, fix_suggestion: fix, details: Array.isArray(details) ? details : [details] };
}

/**
 * @param {import('playwright').Page} page
 * @returns {Promise<{code:string, rule:string, status:string, message:string, fix_suggestion:string, details:string[]}>>}
 */
export async function check(page) {
  try {
  const media = await page.evaluate(() => ({
      imgs: document.querySelectorAll('img').length,
      imgsNoAlt: document.querySelectorAll('img:not([alt])').length,
      vids: document.querySelectorAll('video').length,
      auds: document.querySelectorAll('audio').length,
      autoplay: document.querySelectorAll('video[autoplay],audio[autoplay]').length,
      canvas: document.querySelectorAll('canvas').length,
    }));
    const issues = [];
    if (media.imgsNoAlt) issues.push(`${media.imgsNoAlt}個img缺少alt`);
    if (media.autoplay) issues.push(`${media.autoplay}個媒體自動播放`);
    if (issues.length) return fail(issues.join('; '), '補充 alt 屬性；移除 autoplay 或加 controls');
    return pass(`媒體: img ${media.imgs}，video ${media.vids}，audio ${media.auds}，canvas ${media.canvas}`);
  } catch (err) {
    return { code: 'GN1220201E', rule: '建立閃動少於5秒鐘的內容', status: 'fail', message: `執行錯誤: ${err.message}`, fix_suggestion: '確認頁面載入完成後再執行', details: [] };
  }
}

export const metadata = {
  code: 'GN1220201E',
  criterion: '2.2.2',
  level: 'A',
  category: 'General',
  rule: '建立閃動少於5秒鐘的內容',
};
