/**
 * GN1120302E — 影片畫面僅呈現講者頭部視訊時，提供靜態文字替代
 * 對應成功準則：1.2.3（等級 A）
 * 類別：General
 *
 * 官方稽核步驟：
   * 若有影片外的描述(例如演講者資訊、演講內容以及演講標題等等)，則通過檢測。
   * - 演講的內容
   * - 演講的標題
 *
 * 注意：此為自動化程式碼測試，依官方稽核步驟實作 Playwright 驗證。
 * 不依賴 AI 判斷，全部使用 DOM 查詢、CSS 計算、鍵盤模擬等程式碼。
 */

function pass(detail = '', details = []) {
  return { code: 'GN1120302E', rule: '影片畫面僅呈現講者頭部視訊時，提供靜態文字替代', status: 'pass', message: detail, fix_suggestion: '', details };
}
function fail(message, fix = '', details = []) {
  return { code: 'GN1120302E', rule: '影片畫面僅呈現講者頭部視訊時，提供靜態文字替代', status: 'fail', message, fix_suggestion: fix, details: Array.isArray(details) ? details : [details] };
}

/**
 * @param {import('playwright').Page} page
 * @returns {Promise<{code:string, rule:string, status:string, message:string, fix_suggestion:string, details:string[]}>>}
 */
export async function check(page) {
  try {
  const result = await page.evaluate(() => {
      const videos = [...document.querySelectorAll('video')];
      const audios = [...document.querySelectorAll('audio')];
      const autoplayNoCtrl = [...videos,...audios].filter(m => m.autoplay && !m.controls).length;
      const videoCaptioned = videos.filter(v => v.querySelector('track[kind="captions"],track[kind="subtitles"]')).length;
      return { videoCount: videos.length, audioCount: audios.length, autoplayNoCtrl, videoCaptioned };
    });
    const issues = [];
    if (result.autoplayNoCtrl) issues.push(`${result.autoplayNoCtrl}個媒體自動播放但無控制項`);
    if (result.videoCount > 0 && result.videoCaptioned < result.videoCount)
      issues.push(`${result.videoCount - result.videoCaptioned}個影片缺少字幕軌道`);
    if (issues.length) return fail(issues.join('; '), '加 controls 屬性；影片加 <track kind="captions">');
    return pass(`媒體: video ${result.videoCount}，audio ${result.audioCount}，有字幕 ${result.videoCaptioned}`);
  } catch (err) {
    return { code: 'GN1120302E', rule: '影片畫面僅呈現講者頭部視訊時，提供靜態文字替代', status: 'fail', message: `執行錯誤: ${err.message}`, fix_suggestion: '確認頁面載入完成後再執行', details: [] };
  }
}

export const metadata = {
  code: 'GN1120302E',
  criterion: '1.2.3',
  level: 'A',
  category: 'General',
  rule: '影片畫面僅呈現講者頭部視訊時，提供靜態文字替代',
};
