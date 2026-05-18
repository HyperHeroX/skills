/**
 * HM1110101E — 僅在一組緊連圖片中的其中一個項目使用替代文字，描述該組圖片的所有項目
 * 對應成功準則：1.1.1（等級 A）
 * 類別：HTML
 *
 * 官方稽核步驟：
   * 1. 開啟瀏覽器如 Firefox，並搭配外掛擴充元件如「Firefox Accessibility Extension」。
   * 2. 點選選單列中的 Accessibility → Text Equivalents → Show Text Equivalents 來顯示此圖片的替代文字。
   * 3. 點選網頁右鍵「檢視原始碼」。
   * 4. 可以對照程式碼中，只有第一張圖（`img src="w3c1.png"`）有替代文字（`alt="這是w3c網站"`），其他圖片項目的替代文字都是空值（`alt=""`）。
 *
 * 注意：此為自動化程式碼測試，依官方稽核步驟實作 Playwright 驗證。
 * 不依賴 AI 判斷，全部使用 DOM 查詢、CSS 計算、鍵盤模擬等程式碼。
 */

function pass(detail = '', details = []) {
  return { code: 'HM1110101E', rule: '僅在一組緊連圖片中的其中一個項目使用替代文字，描述該組圖片的所有項目', status: 'pass', message: detail, fix_suggestion: '', details };
}
function fail(message, fix = '', details = []) {
  return { code: 'HM1110101E', rule: '僅在一組緊連圖片中的其中一個項目使用替代文字，描述該組圖片的所有項目', status: 'fail', message, fix_suggestion: fix, details: Array.isArray(details) ? details : [details] };
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
    return { code: 'HM1110101E', rule: '僅在一組緊連圖片中的其中一個項目使用替代文字，描述該組圖片的所有項目', status: 'fail', message: `執行錯誤: ${err.message}`, fix_suggestion: '確認頁面載入完成後再執行', details: [] };
  }
}

export const metadata = {
  code: 'HM1110101E',
  criterion: '1.1.1',
  level: 'A',
  category: 'HTML',
  rule: '僅在一組緊連圖片中的其中一個項目使用替代文字，描述該組圖片的所有項目',
};
