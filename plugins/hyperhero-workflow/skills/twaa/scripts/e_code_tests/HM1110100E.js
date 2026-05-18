/**
 * HM1110100E — 圖片需要加上有意義、可代替圖片在文件上下文中的功能及內容的替代文字
 * 對應成功準則：1.1.1（等級 A）
 * 類別：HTML
 *
 * 官方稽核步驟：
   * 開啟瀏覽器如 Firefox，並搭配外掛擴充元件如「Firefox Accessibility Extension」。點選選單列中的 Accessibility → Text Equivalents → Show Text Equivalents，顯示此圖片的替代文字。
 *
 * 注意：此為自動化程式碼測試，依官方稽核步驟實作 Playwright 驗證。
 * 不依賴 AI 判斷，全部使用 DOM 查詢、CSS 計算、鍵盤模擬等程式碼。
 */

function pass(detail = '', details = []) {
  return { code: 'HM1110100E', rule: '圖片需要加上有意義、可代替圖片在文件上下文中的功能及內容的替代文字', status: 'pass', message: detail, fix_suggestion: '', details };
}
function fail(message, fix = '', details = []) {
  return { code: 'HM1110100E', rule: '圖片需要加上有意義、可代替圖片在文件上下文中的功能及內容的替代文字', status: 'fail', message, fix_suggestion: fix, details: Array.isArray(details) ? details : [details] };
}

/**
 * @param {import('playwright').Page} page
 * @returns {Promise<{code:string, rule:string, status:string, message:string, fix_suggestion:string, details:string[]}>>}
 */
export async function check(page) {
  try {
  const result = await page.evaluate(() => {
      const imgs = [...document.querySelectorAll('img')];
      const areas = [...document.querySelectorAll('area')];
      const inputs = [...document.querySelectorAll('input[type="image"]')];
      const objects = [...document.querySelectorAll('object, embed, applet')];
      return {
        imgsMissingAlt: imgs.filter(i => i.getAttribute('alt') === null).length,
        emptyAreaAlt: areas.filter(a => !a.getAttribute('alt')?.trim()).length,
        missingInputAlt: inputs.filter(i => !i.getAttribute('alt')?.trim()).length,
        emptyObject: objects.filter(o => !o.textContent?.trim()).length,
      };
    });
    const total = Object.values(result).reduce((a,b) => a+b, 0);
    if (total > 0) return fail(`${total} 個元素缺少替代文字`, '為非文字內容加上 alt/aria-label/替代文字', Object.entries(result).filter(([,v])=>v>0).map(([k,v])=>k+'='+v));
    return pass('所有非文字內容均有替代文字');
  } catch (err) {
    return { code: 'HM1110100E', rule: '圖片需要加上有意義、可代替圖片在文件上下文中的功能及內容的替代文字', status: 'fail', message: `執行錯誤: ${err.message}`, fix_suggestion: '確認頁面載入完成後再執行', details: [] };
  }
}

export const metadata = {
  code: 'HM1110100E',
  criterion: '1.1.1',
  level: 'A',
  category: 'HTML',
  rule: '圖片需要加上有意義、可代替圖片在文件上下文中的功能及內容的替代文字',
};
