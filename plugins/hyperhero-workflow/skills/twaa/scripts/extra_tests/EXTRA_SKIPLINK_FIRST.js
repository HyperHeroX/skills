/**
 * EXTRA_SKIPLINK_FIRST — 自檢表第 8 項加強版
 *
 * 規則：跳到主要內容區的鏈結必須為網頁載入後第一個可取得鍵盤焦點的鏈結。
 *
 * 與官方 GN1240100E 差異：
 *   官方規則只要求 skip-link 存在於頁面頂端 DOM；自檢表進一步要求「第一個 Tab 焦點」。
 *   實務上 SPA 用 router.afterEach 程式化 focus 到 main-content 會破壞此條件，
 *   即使 DOM 結構正確也會被審查員以「Tab 不到 skip-link」退件。
 *
 * 自動化檢測流程：
 *   1. blur active element + body.focus()
 *   2. 按 Tab 一次
 *   3. 驗證 document.activeElement 是 skip-link（href 含 #main 或 text 含「跳」）
 */

const NAME = 'EXTRA_SKIPLINK_FIRST';
const RULE = '頁面載入後第一個 Tab 焦點為 skip-link';

function pass(message = '', details = []) {
  return { code: NAME, rule: RULE, status: 'pass', message, fix_suggestion: '', details };
}
function fail(message, fix = '', details = []) {
  return { code: NAME, rule: RULE, status: 'fail', message, fix_suggestion: fix, details: Array.isArray(details) ? details : [details] };
}

/**
 * @param {import('playwright').Page} page
 */
export async function check(page) {
  try {
    // 模擬「使用者剛載入頁面」：清除任何程式化 focus
    await page.evaluate(() => {
      if (document.activeElement && document.activeElement !== document.body) {
        (document.activeElement).blur?.();
      }
      document.body.tabIndex = -1;
      document.body.focus();
    });
    await page.waitForTimeout(200);

    // 按一次 Tab
    await page.keyboard.press('Tab');
    await page.waitForTimeout(100);

    const result = await page.evaluate(() => {
      const el = document.activeElement;
      if (!el || el === document.body) return { found: false, tag: 'BODY', text: '', href: '' };
      return {
        found: true,
        tag: el.tagName,
        text: (el.textContent || '').trim().slice(0, 80),
        href: el.getAttribute('href') || '',
        ariaLabel: el.getAttribute('aria-label') || '',
        className: (typeof el.className === 'string' ? el.className : '').slice(0, 100),
      };
    });

    if (!result.found) {
      return fail('Tab 後沒有任何元素獲得焦點', '檢查頁面是否有可聚焦元素', [JSON.stringify(result)]);
    }

    const isSkipLink =
      /(^|\s)skip-link(\s|$)/.test(result.className) ||
      /^#(main|content|main-content)/i.test(result.href) ||
      /(跳至|跳到|skip)/i.test(result.text + ' ' + result.ariaLabel);

    if (!isSkipLink) {
      return fail(
        `第一個 Tab 焦點不是 skip-link：${result.tag} "${result.text || result.ariaLabel}"`,
        'router.afterEach 初次載入時不要主動 focus #main-content；保留 DOM 起始焦點讓 Tab 從 body 開始',
        [JSON.stringify(result)],
      );
    }
    return pass(`第一個 Tab 焦點為 skip-link：${result.text}`, [result.href]);
  } catch (err) {
    return fail(`執行錯誤: ${err.message}`, '確認頁面載入完成');
  }
}

export const metadata = {
  code: NAME,
  criterion: '2.4.1',
  level: 'A',
  category: 'EXTRA',
  rule: RULE,
};
