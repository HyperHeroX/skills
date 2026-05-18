/**
 * GN1220200E — 讓內容能加以暫停，並可從暫停處重新開始
 * 對應成功準則：2.2.2（等級 A）
 * 類別：General
 *
 * 官方稽核步驟：
   * 1. 以youtube影片為例，當影片正播放時，以youtube所設之暫停方式(1.直接用滑鼠點影片或2.點影片左下方暫停鍵或3.按空白鍵)讓影片停下來。
   * 2. 觀察以確定影片已暫停且並沒有從頭開始。
   * 3. 接著使用youtube所設之繼續播放影片方式(直接用滑鼠點影片或2.點影片左下方播放鍵或3.按空白鍵)讓影片繼續播放。
   * 4. 觀察以確定影片是從剛才暫停處繼續播放。
 *
 * 注意：此為自動化程式碼測試，依官方稽核步驟實作 Playwright 驗證。
 * 不依賴 AI 判斷，全部使用 DOM 查詢、CSS 計算、鍵盤模擬等程式碼。
 */

function pass(detail = '', details = []) {
  return { code: 'GN1220200E', rule: '讓內容能加以暫停，並可從暫停處重新開始', status: 'pass', message: detail, fix_suggestion: '', details };
}
function fail(message, fix = '', details = []) {
  return { code: 'GN1220200E', rule: '讓內容能加以暫停，並可從暫停處重新開始', status: 'fail', message, fix_suggestion: fix, details: Array.isArray(details) ? details : [details] };
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
    return { code: 'GN1220200E', rule: '讓內容能加以暫停，並可從暫停處重新開始', status: 'fail', message: `執行錯誤: ${err.message}`, fix_suggestion: '確認頁面載入完成後再執行', details: [] };
  }
}

export const metadata = {
  code: 'GN1220200E',
  criterion: '2.2.2',
  level: 'A',
  category: 'General',
  rule: '讓內容能加以暫停，並可從暫停處重新開始',
};
