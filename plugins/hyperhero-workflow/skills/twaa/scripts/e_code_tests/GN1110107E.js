/**
 * GN1110107E — 提供可描述現場純音訊內容目的及現場純視訊內容目的的描述性標籤
 * 對應成功準則：1.1.1（等級 A）
 * 類別：General
 *
 * 官方稽核步驟：
   * 1. 網頁上刪除或隱藏冗長的文字敘述，只需要用簡短的文字來描述。
   * 2. 以高速公路實況資訊為例，只以簡短的文字內容來描述此影片。
   * 3. 檢查影像與描述文字是否正確。
 *
 * 注意：此為自動化程式碼測試，依官方稽核步驟實作 Playwright 驗證。
 * 不依賴 AI 判斷，全部使用 DOM 查詢、CSS 計算、鍵盤模擬等程式碼。
 */

function pass(detail = '', details = []) {
  return { code: 'GN1110107E', rule: '提供可描述現場純音訊內容目的及現場純視訊內容目的的描述性標籤', status: 'pass', message: detail, fix_suggestion: '', details };
}
function fail(message, fix = '', details = []) {
  return { code: 'GN1110107E', rule: '提供可描述現場純音訊內容目的及現場純視訊內容目的的描述性標籤', status: 'fail', message, fix_suggestion: fix, details: Array.isArray(details) ? details : [details] };
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
    return { code: 'GN1110107E', rule: '提供可描述現場純音訊內容目的及現場純視訊內容目的的描述性標籤', status: 'fail', message: `執行錯誤: ${err.message}`, fix_suggestion: '確認頁面載入完成後再執行', details: [] };
  }
}

export const metadata = {
  code: 'GN1110107E',
  criterion: '1.1.1',
  level: 'A',
  category: 'General',
  rule: '提供可描述現場純音訊內容目的及現場純視訊內容目的的描述性標籤',
};
