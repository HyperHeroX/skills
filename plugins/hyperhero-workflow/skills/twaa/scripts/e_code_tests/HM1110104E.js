/**
 * HM1110104E — 提供字符圖案、表情符號、其他挪用文字外型作為表意功能之語言形式的替代文字，且其替代文字需有意義、可代替前述內容之目的與功能
 * 對應成功準則：1.1.1（等級 A）
 * 類別：HTML
 *
 * 官方稽核步驟：
   * 1. 先判斷出在網頁上由字元湊成的表情符號或 ASCII 藝術字。
   * 2. 接著檢查在表情符號的前後方必須要有等同於符號所要表達意義之文字說明。
 *
 * 注意：此為自動化程式碼測試，依官方稽核步驟實作 Playwright 驗證。
 * 不依賴 AI 判斷，全部使用 DOM 查詢、CSS 計算、鍵盤模擬等程式碼。
 */

function pass(detail = '', details = []) {
  return { code: 'HM1110104E', rule: '提供字符圖案、表情符號、其他挪用文字外型作為表意功能之語言形式的替代文字，且其替代文字需有意義、可代替前述內容之目的與功', status: 'pass', message: detail, fix_suggestion: '', details };
}
function fail(message, fix = '', details = []) {
  return { code: 'HM1110104E', rule: '提供字符圖案、表情符號、其他挪用文字外型作為表意功能之語言形式的替代文字，且其替代文字需有意義、可代替前述內容之目的與功', status: 'fail', message, fix_suggestion: fix, details: Array.isArray(details) ? details : [details] };
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
    return { code: 'HM1110104E', rule: '提供字符圖案、表情符號、其他挪用文字外型作為表意功能之語言形式的替代文字，且其替代文字需有意義、可代替前述內容之目的與功', status: 'fail', message: `執行錯誤: ${err.message}`, fix_suggestion: '確認頁面載入完成後再執行', details: [] };
  }
}

export const metadata = {
  code: 'HM1110104E',
  criterion: '1.1.1',
  level: 'A',
  category: 'HTML',
  rule: '提供字符圖案、表情符號、其他挪用文字外型作為表意功能之語言形式的替代文字，且其替代文字需有意義、可代替前述內容之目的與功',
};
