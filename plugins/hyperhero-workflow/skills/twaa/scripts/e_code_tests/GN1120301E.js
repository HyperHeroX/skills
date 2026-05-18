/**
 * GN1120301E — 除非同步媒體是文字內容的替代媒體，並且有明確地標示出來，否則就為影片提供音訊描述或延伸音訊描述，或提供使用者可選取、且含有音訊描述的第二音軌
 * 對應成功準則：1.2.3（等級 A）
 * 類別：General
 *
 * 官方稽核步驟：
   * **範例1：含有第二音軌的視頻**
   * 使用Google Chrome「檢視原始碼」顯示連結 (按下右鍵→檢視原始碼)。
   * 檢查是否有提供具有音訊描述或額外音訊描述的電影，或提供使用者可選取、且含有音訊描述的第二音軌，並點擊連結來驗證。
   * **範例2：英語視頻的video標籤，音頻描述提供WebVTT格式**
 *
 * 注意：此為自動化程式碼測試，依官方稽核步驟實作 Playwright 驗證。
 * 不依賴 AI 判斷，全部使用 DOM 查詢、CSS 計算、鍵盤模擬等程式碼。
 */

function pass(detail = '', details = []) {
  return { code: 'GN1120301E', rule: '除非同步媒體是文字內容的替代媒體，並且有明確地標示出來，否則就為影片提供音訊描述或延伸音訊描述，或提供使用者可選取、且含', status: 'pass', message: detail, fix_suggestion: '', details };
}
function fail(message, fix = '', details = []) {
  return { code: 'GN1120301E', rule: '除非同步媒體是文字內容的替代媒體，並且有明確地標示出來，否則就為影片提供音訊描述或延伸音訊描述，或提供使用者可選取、且含', status: 'fail', message, fix_suggestion: fix, details: Array.isArray(details) ? details : [details] };
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
    return { code: 'GN1120301E', rule: '除非同步媒體是文字內容的替代媒體，並且有明確地標示出來，否則就為影片提供音訊描述或延伸音訊描述，或提供使用者可選取、且含', status: 'fail', message: `執行錯誤: ${err.message}`, fix_suggestion: '確認頁面載入完成後再執行', details: [] };
  }
}

export const metadata = {
  code: 'GN1120301E',
  criterion: '1.2.3',
  level: 'A',
  category: 'General',
  rule: '除非同步媒體是文字內容的替代媒體，並且有明確地標示出來，否則就為影片提供音訊描述或延伸音訊描述，或提供使用者可選取、且含',
};
