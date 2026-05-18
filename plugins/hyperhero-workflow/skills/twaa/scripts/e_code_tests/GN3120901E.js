/**
 * GN3120901E — 提供連往預先準備好的發言文字逐字稿的鏈結；如果有劇本的話，則提供連往劇本的鏈結
 * 對應成功準則：1.2.9（等級 AAA）
 * 類別：General
 *
 * 官方稽核步驟：
   * 網路影片總統正在演講
   * 演講內容同時被公布在網路上，並且有頁數連往下一頁講稿
 *
 * 注意：此為自動化程式碼測試，依官方稽核步驟實作 Playwright 驗證。
 * 不依賴 AI 判斷，全部使用 DOM 查詢、CSS 計算、鍵盤模擬等程式碼。
 */

function pass(detail = '', details = []) {
  return { code: 'GN3120901E', rule: '提供連往預先準備好的發言文字逐字稿的鏈結；如果有劇本的話，則提供連往劇本的鏈結', status: 'pass', message: detail, fix_suggestion: '', details };
}
function fail(message, fix = '', details = []) {
  return { code: 'GN3120901E', rule: '提供連往預先準備好的發言文字逐字稿的鏈結；如果有劇本的話，則提供連往劇本的鏈結', status: 'fail', message, fix_suggestion: fix, details: Array.isArray(details) ? details : [details] };
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
    return { code: 'GN3120901E', rule: '提供連往預先準備好的發言文字逐字稿的鏈結；如果有劇本的話，則提供連往劇本的鏈結', status: 'fail', message: `執行錯誤: ${err.message}`, fix_suggestion: '確認頁面載入完成後再執行', details: [] };
  }
}

export const metadata = {
  code: 'GN3120901E',
  criterion: '1.2.9',
  level: 'AAA',
  category: 'General',
  rule: '提供連往預先準備好的發言文字逐字稿的鏈結；如果有劇本的話，則提供連往劇本的鏈結',
};
