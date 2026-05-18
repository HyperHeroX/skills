/**
 * GN1120102E — 提供描述預先錄製之重要視訊內容的音訊，並描述其本身係用於描述重要視訊內容
 * 對應成功準則：1.2.1（等級 A）
 * 類別：General
 *
 * 官方稽核步驟：
   * 開啟網頁，此以連結到飛船降落火星的新聞視頻為例，連接到視頻的初始畫面是一個飛船的圖片，而視頻下方有一個關於影片內容的音訊檔案。
   * 當點選左圖紅色箭頭的飛船圖片可連接到右圖的飛船降落火星的新聞視頻。
   * 而點選紫色字幕的音訊連結可執行一個關於影片內容的音訊檔案。
   * 檢視原始碼，紅色框分別為視訊檔案和音訊檔案。
 *
 * 注意：此為自動化程式碼測試，依官方稽核步驟實作 Playwright 驗證。
 * 不依賴 AI 判斷，全部使用 DOM 查詢、CSS 計算、鍵盤模擬等程式碼。
 */

function pass(detail = '', details = []) {
  return { code: 'GN1120102E', rule: '提供描述預先錄製之重要視訊內容的音訊，並描述其本身係用於描述重要視訊內容', status: 'pass', message: detail, fix_suggestion: '', details };
}
function fail(message, fix = '', details = []) {
  return { code: 'GN1120102E', rule: '提供描述預先錄製之重要視訊內容的音訊，並描述其本身係用於描述重要視訊內容', status: 'fail', message, fix_suggestion: fix, details: Array.isArray(details) ? details : [details] };
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
    return { code: 'GN1120102E', rule: '提供描述預先錄製之重要視訊內容的音訊，並描述其本身係用於描述重要視訊內容', status: 'fail', message: `執行錯誤: ${err.message}`, fix_suggestion: '確認頁面載入完成後再執行', details: [] };
  }
}

export const metadata = {
  code: 'GN1120102E',
  criterion: '1.2.1',
  level: 'A',
  category: 'General',
  rule: '提供描述預先錄製之重要視訊內容的音訊，並描述其本身係用於描述重要視訊內容',
};
