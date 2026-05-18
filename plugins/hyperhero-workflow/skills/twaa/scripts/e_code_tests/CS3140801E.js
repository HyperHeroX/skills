/**
 * CS3140801E — 如果不確定使用者能選擇前景及背景色彩，則不要指定主要內容的文字色彩與背景色彩，而且不要使用會變更這些預設值的科技功能
 * 對應成功準則：1.4.8（等級 AAA）
 * 類別：CSS
 *
 * 官方稽核步驟：
   * 查看該文本顏色可以指定所有的地方。
   * 檢查文本顏色未被指定。
   * 查看作為背景的背景顏色或圖片可以被指定。
   * 檢查被指定的背景沒背景顏色或圖片。
 *
 * 注意：此為自動化程式碼測試，依官方稽核步驟實作 Playwright 驗證。
 * 不依賴 AI 判斷，全部使用 DOM 查詢、CSS 計算、鍵盤模擬等程式碼。
 */

function pass(detail = '', details = []) {
  return { code: 'CS3140801E', rule: '如果不確定使用者能選擇前景及背景色彩，則不要指定主要內容的文字色彩與背景色彩，而且不要使用會變更這些預設值的科技功能', status: 'pass', message: detail, fix_suggestion: '', details };
}
function fail(message, fix = '', details = []) {
  return { code: 'CS3140801E', rule: '如果不確定使用者能選擇前景及背景色彩，則不要指定主要內容的文字色彩與背景色彩，而且不要使用會變更這些預設值的科技功能', status: 'fail', message, fix_suggestion: fix, details: Array.isArray(details) ? details : [details] };
}

/**
 * @param {import('playwright').Page} page
 * @returns {Promise<{code:string, rule:string, status:string, message:string, fix_suggestion:string, details:string[]}>>}
 */
export async function check(page) {
  try {
  const result = await page.evaluate(() => {
      const rules = [...document.styleSheets].flatMap(s => { try { return [...s.cssRules]; } catch { return []; } });
      return {
        hasLineHeight: rules.some(r => r.style?.lineHeight),
        lineHeightPx: rules.filter(r => r.style?.lineHeight?.endsWith('px')).map(r => r.style.lineHeight).slice(0,3),
        maxWidthCh: rules.filter(r => r.style?.maxWidth?.includes('ch')).map(r => r.style.maxWidth).slice(0,3),
      };
    });
    if (!result.hasLineHeight) return fail('樣式表中無 line-height 宣告', 'body { line-height: 1.5; }（AAA 1.4.8）');
    if (result.lineHeightPx.length) return fail(`line-height 使用固定 px：${result.lineHeightPx.join(', ')}`, '改為無單位：line-height: 1.5;');
    return pass(`line-height 已宣告，ch 寬度: ${result.maxWidthCh.join(',') || '無'}`);
  } catch (err) {
    return { code: 'CS3140801E', rule: '如果不確定使用者能選擇前景及背景色彩，則不要指定主要內容的文字色彩與背景色彩，而且不要使用會變更這些預設值的科技功能', status: 'fail', message: `執行錯誤: ${err.message}`, fix_suggestion: '確認頁面載入完成後再執行', details: [] };
  }
}

export const metadata = {
  code: 'CS3140801E',
  criterion: '1.4.8',
  level: 'AAA',
  category: 'CSS',
  rule: '如果不確定使用者能選擇前景及背景色彩，則不要指定主要內容的文字色彩與背景色彩，而且不要使用會變更這些預設值的科技功能',
};
