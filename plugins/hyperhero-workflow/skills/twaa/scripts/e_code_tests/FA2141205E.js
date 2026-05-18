/**
 * FA2141205E — 由於調整文字間距時內容被剪切或重疊，而導致成功準則1.4.12失敗
 * 對應成功準則：1.4.12（等級 AA）
 * 類別：Failure
 *
 * 官方稽核步驟：
 *   1. 注入強制文字間距樣式（line-height: 1.5, letter-spacing: 0.12em, word-spacing: 0.16em）
 *   2. 確認頁面中可見的文字內容沒有被截斷或重疊
 *   3. 排除 .sr-only、.p-hidden-accessible 等螢幕閱讀器專用的隱藏元素
 *      （這些元素本身就是視覺上隱藏的，不屬於 1.4.12 的範疇）
 *
 * 注意：此為自動化程式碼測試，依官方稽核步驟實作 Playwright 驗證。
 */

function pass(detail = '', details = []) {
  return { code: 'FA2141205E', rule: '調整文字間距後無內容截斷', status: 'pass', message: detail, fix_suggestion: '', details };
}
function fail(message, fix = '', details = []) {
  return { code: 'FA2141205E', rule: '調整文字間距後內容被截斷', status: 'fail', message, fix_suggestion: fix, details: Array.isArray(details) ? details : [details] };
}

export async function check(page) {
  try {
    // 注入文字間距樣式（WCAG 1.4.12 規定的最小值）
    await page.addStyleTag({ content: `
      *, *::before, *::after {
        line-height: 1.5 !important;
        letter-spacing: 0.12em !important;
        word-spacing: 0.16em !important;
      }
      p, li, dd, dt { margin-bottom: 2em !important; }
    ` });
    await page.waitForTimeout(400);

    const clipped = await page.evaluate(() => {
      // 排除螢幕閱讀器專用隱藏元素（sr-only, p-hidden-accessible 等）
      const EXCLUDE_CLASSES = ['sr-only', 'p-hidden-accessible', 'visually-hidden', 'hidden', 'sr_only'];

      return [...document.querySelectorAll('h1,h2,h3,h4,h5,h6,p,li,td,th,label,span,button,a')]
        .filter(el => {
          // 排除隱藏元素
          if (el.offsetHeight === 0 && el.offsetWidth === 0) return false;
          // 排除 sr-only 類別
          const classes = Array.from(el.classList);
          if (classes.some(c => EXCLUDE_CLASSES.some(ex => c.includes(ex)))) return false;
          // 排除 aria-hidden
          if (el.getAttribute('aria-hidden') === 'true') return false;
          // 排除高度 <= 1px 的元素（通常是 sr-only 模式）
          if (el.offsetHeight <= 1) return false;
          // 僅檢查有實際文字且高度 > 8px 的元素
          return el.textContent.trim().length > 2 && el.offsetHeight > 8;
        })
        .filter(el => el.scrollHeight > el.offsetHeight + 4)
        .map(el => {
          const s = window.getComputedStyle(el);
          return {
            tag: el.tagName,
            id: el.id || '',
            class: el.className?.toString().slice(0,30) || '',
            text: el.textContent.trim().slice(0,20),
            scrollH: el.scrollHeight,
            offsetH: el.offsetHeight,
            overflow: s.overflow + '/' + s.overflowY,
          };
        })
        .slice(0, 5);
    });

    if (clipped.length > 0) {
      return fail(
        `${clipped.length} 個可見元素在文字間距增加後被截斷`,
        '移除固定高度（height:Xpx）改用 min-height；不要用 overflow:hidden 截斷文字',
        clipped.map(c => `${c.tag}${c.id ? '#'+c.id : ''}${c.class ? '.'+c.class.split(' ')[0] : ''} (${c.scrollH}/${c.offsetH})`)
      );
    }
    return pass('文字間距增加後無可見內容截斷');
  } catch (err) {
    return { code: 'FA2141205E', rule: '調整文字間距後內容截斷', status: 'fail', message: `執行錯誤: ${err.message}`, fix_suggestion: '確認頁面載入完成後再執行', details: [] };
  }
}

export const metadata = {
  code: 'FA2141205E',
  criterion: '1.4.12',
  level: 'AA',
  category: 'Failure',
  rule: '由於調整文字間距時內容被剪切或重疊，而導致成功準則1.4.12失敗',
};
