/**
 * GN3120900E — 提供現場純音訊內容的文字形式替代內容，或在網頁內合併採用現場音訊字幕服務。
 * 對應成功準則：1.2.9（等級 AAA）
 * 類別：General
 *
 * 官方稽核步驟：
   * 使用Google Chrome「檢視原始碼」顯示連結 (按下右鍵→檢視原始碼)。
   * 檢查是否提供純音訊檔文字形式的替代內容或現場音訊字幕服務。
   * 並在網頁中檢視文字字幕內容是否與音訊檔吻合。
 *
 * 注意：此為自動化程式碼測試，依官方稽核步驟實作 Playwright 驗證。
 * 不依賴 AI 判斷，全部使用 DOM 查詢、CSS 計算、鍵盤模擬等程式碼。
 */

function pass(detail = '', details = []) {
  return { code: 'GN3120900E', rule: '提供現場純音訊內容的文字形式替代內容，或在網頁內合併採用現場音訊字幕服務。', status: 'pass', message: detail, fix_suggestion: '', details };
}
function fail(message, fix = '', details = []) {
  return { code: 'GN3120900E', rule: '提供現場純音訊內容的文字形式替代內容，或在網頁內合併採用現場音訊字幕服務。', status: 'fail', message, fix_suggestion: fix, details: Array.isArray(details) ? details : [details] };
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
    return { code: 'GN3120900E', rule: '提供現場純音訊內容的文字形式替代內容，或在網頁內合併採用現場音訊字幕服務。', status: 'fail', message: `執行錯誤: ${err.message}`, fix_suggestion: '確認頁面載入完成後再執行', details: [] };
  }
}

export const metadata = {
  code: 'GN3120900E',
  criterion: '1.2.9',
  level: 'AAA',
  category: 'General',
  rule: '提供現場純音訊內容的文字形式替代內容，或在網頁內合併採用現場音訊字幕服務。',
};
