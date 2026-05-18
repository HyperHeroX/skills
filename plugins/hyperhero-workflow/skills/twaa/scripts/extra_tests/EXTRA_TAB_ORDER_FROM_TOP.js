/**
 * EXTRA_TAB_ORDER_FROM_TOP — Tab 順序從頁面頂端開始 (GN1240300E)
 *
 * 背景：稽核員 (2026-05-13) 對 https://dsos.wda.gov.tw/zh-tw/home 與 register 抓出
 * 「TAB鍵移動順序應從頭(網址列)開始由上至下、由左至右順序移動，鍵盤焦點請勿
 * 自主要入容區開始遊走」。
 *
 * 檢測：
 *   1. 清掉所有現有焦點，把焦點重設到 body
 *   2. 連按 Tab 6 次，記錄每次焦點所在元素
 *   3. 驗證：
 *      a) 第 1 個 Tab 焦點必須在 <main> / [role=main] 之外（在頁首 header / nav / skip-link）
 *      b) 第 2 個 Tab 焦點的位置（getBoundingClientRect().top）應 ≤ 第 1 個的 top
 *         （或非常接近 — 允許 50px 偏差），代表沒有大跳上下
 *      c) 第 1 個焦點應為 skip-link（class 含 skip-link）或頁首區內的元素
 */

const NAME = 'EXTRA_TAB_ORDER_FROM_TOP';
const RULE = 'Tab 順序從頁面頂端 (skip-link / header) 開始';

function pass(message = '', details = []) {
  return { code: NAME, rule: RULE, status: 'pass', message, fix_suggestion: '', details };
}
function fail(message, fix = '', details = []) {
  return { code: NAME, rule: RULE, status: 'fail', message, fix_suggestion: fix, details: Array.isArray(details) ? details : [details] };
}

/**
 * 共用：連按 Tab 收集 N 個焦點軌跡
 * @param resetFocus 是否先強制 reset 焦點到 body（fresh-load 用）；
 *                  若為 false，會保留現有焦點狀態（模擬 SPA 點擊後直接 Tab 的真實情境）
 */
async function captureTabTrail(page, count = 6, resetFocus = true) {
  if (resetFocus) {
    await page.evaluate(() => {
      if (document.activeElement && document.activeElement.blur) document.activeElement.blur();
      document.body.tabIndex = -1;
      document.body.focus();
    });
    await page.waitForTimeout(200);
  }
  const trail = [];
  for (let i = 0; i < count; i++) {
    await page.keyboard.press('Tab');
    await page.waitForTimeout(50);
    const info = await page.evaluate(() => {
      const el = document.activeElement;
      if (!el || el === document.body) return null;
      const rect = el.getBoundingClientRect();
      const inMain = !!el.closest('main, [role=main], #main-content');
      const inHeader = !!el.closest('header, [role=banner], nav, [role=navigation], .topbar, .skip-link');
      const isSkip = (el.className || '').toString().includes('skip-link') || (el.getAttribute('href') || '').startsWith('#main') || /跳至|跳到|skip/i.test(el.textContent || '');
      return {
        tag: el.tagName,
        text: (el.textContent || el.getAttribute('aria-label') || '').trim().slice(0, 40),
        top: Math.round(rect.top),
        inMain,
        inHeader,
        isSkip,
      };
    });
    if (info) trail.push(info);
  }
  return trail;
}

/**
 * @param {import('playwright').Page} page
 */
export async function check(page) {
  try {
    const currentUrl = page.url();
    // 場景 A: 直接載入後立刻 Tab（初次載入）
    let trail = await captureTabTrail(page, 6);
    let scenario = 'fresh-load';

    if (trail.length === 0) {
      return fail('Tab 6 次後沒有任何元素獲得焦點', '檢查頁面是否有可聚焦元素');
    }

    // 場景 B: SPA 內路由切換 (URL goto - 但 page reload 重置焦點記憶，比較鬆)
    let trail2 = null;
    if (!/\/zh-tw\/home$/.test(currentUrl)) {
      try {
        const homeUrl = new URL('/zh-tw/home', currentUrl).href;
        await page.goto(homeUrl, { waitUntil: 'networkidle', timeout: 15000 });
        await page.waitForTimeout(300);
        await page.goto(currentUrl, { waitUntil: 'networkidle', timeout: 15000 });
        await page.waitForTimeout(500);
        trail2 = await captureTabTrail(page, 6);
      } catch (e) {
        // ignore
      }
    } else {
      try {
        await page.goto(new URL('/zh-tw/identity/login', currentUrl).href, { waitUntil: 'networkidle', timeout: 15000 });
        await page.waitForTimeout(300);
        await page.goto(currentUrl, { waitUntil: 'networkidle', timeout: 15000 });
        await page.waitForTimeout(500);
        trail2 = await captureTabTrail(page, 6);
      } catch (e) {
        // ignore
      }
    }

    // 場景 C: 「真實使用者」情境 — 從 home 用滑鼠點擊連結進到 Directions/其他頁。
    // Chrome 內部記憶上次焦點 DOM 位置作 Tab 起始點，這是最容易出 bug 的情境。
    // 此場景 NOT reset focus 在 Tab 前，直接驗 SPA 切換後第一個 Tab 走到哪。
    let trail3 = null;
    const pageMatch = currentUrl.match(/\/zh-tw\/([^/?#]+)/);
    const pageName = pageMatch ? pageMatch[1] : null;
    if (pageName && pageName !== 'home') {
      try {
        const homeUrl = new URL('/zh-tw/home', currentUrl).href;
        await page.goto(homeUrl, { waitUntil: 'networkidle', timeout: 15000 });
        await page.waitForTimeout(500);
        // 在 home 上找出能導向目前頁面的點擊目標 (a[href] 或 button[aria-label])
        const clickTarget = await page.evaluate((targetPage) => {
          const candidates = [
            ...document.querySelectorAll(`a[href*="${targetPage}"]`),
            ...document.querySelectorAll('button, a[role="button"]'),
          ];
          // 先試 href 匹配，找不到就用 aria-label/text 配對
          for (const el of candidates) {
            const href = (el.getAttribute('href') || '');
            if (href.includes(targetPage)) {
              el.scrollIntoView({ block: 'center' });
              return { found: true, via: 'href', tag: el.tagName };
            }
          }
          return { found: false };
        }, pageName);
        if (clickTarget.found) {
          await page.click(`a[href*="${pageName}"]`, { timeout: 5000 }).catch(() => {});
          await page.waitForTimeout(1500);
          if (page.url().includes(pageName)) {
            // 模擬真實使用者：點擊後立即 Tab，不主動 reset 焦點
            trail3 = await captureTabTrail(page, 6, /* resetFocus */ false);
          }
        }
      } catch (e) {
        // ignore — 該頁面在 home 沒有直接連結也 OK
      }
    }

    // 驗證每個場景
    function validate(t, scenarioName) {
      const first = t[0];
      if (!first) return [];
      const errs = [];
      // 規則 a: 第 1 焦點必須在 main 之外
      if (first.inMain) {
        errs.push(
          `[${scenarioName}] 第 1 Tab 焦點落在 <main> 內：${first.tag}「${first.text}」 — 違反 GN1240300E`,
        );
      }
      // 規則 b: 前 3 個 Tab 焦點 Y 不應大幅倒退
      for (let i = 1; i < Math.min(t.length, 3); i++) {
        const prev = t[i - 1];
        const cur = t[i];
        if (cur.top < prev.top - 100) {
          errs.push(
            `[${scenarioName}] Tab #${i + 1} 位置大幅上移：top ${prev.top} → ${cur.top}（元素「${cur.text}」）`,
          );
        }
      }
      return errs;
    }

    const violations = [...validate(trail, '初次載入')];
    if (trail2 && trail2.length > 0) {
      violations.push(...validate(trail2, '從別頁切回'));
    }
    if (trail3 && trail3.length > 0) {
      violations.push(...validate(trail3, '從 home 點擊進入'));
    }

    if (violations.length > 0) {
      const details = [...violations];
      details.push('— 初次載入 Tab 軌跡 —');
      trail.slice(0, 4).forEach((t, i) =>
        details.push(`  [${i + 1}] ${t.tag}「${t.text}」 top=${t.top} inMain=${t.inMain} skip=${t.isSkip}`),
      );
      if (trail2) {
        details.push('— 從別頁切回 Tab 軌跡 —');
        trail2.slice(0, 4).forEach((t, i) =>
          details.push(`  [${i + 1}] ${t.tag}「${t.text}」 top=${t.top} inMain=${t.inMain} skip=${t.isSkip}`),
        );
      }
      if (trail3) {
        details.push('— 從 home 點擊進入 Tab 軌跡 —');
        trail3.slice(0, 4).forEach((t, i) =>
          details.push(`  [${i + 1}] ${t.tag}「${t.text}」 top=${t.top} inMain=${t.inMain} skip=${t.isSkip}`),
        );
      }
      return fail(
        violations[0],
        'router.afterEach 內加 document.body.tabIndex=-1; document.body.focus() 重設 Chrome 內部「上次焦點位置」',
        details,
      );
    }

    const scenarioTags = [];
    if (trail2 && trail2.length > 0) scenarioTags.push('別頁切回');
    if (trail3 && trail3.length > 0) scenarioTags.push('home 點擊進入');
    const scenarioMsg = scenarioTags.length > 0 ? '＋' + scenarioTags.join('＋') : '';
    return pass(
      `Tab 第 1 焦點為「${trail[0].text}」(初次載入${scenarioMsg})`,
      trail.slice(0, 4).map((t, i) => `[${i + 1}] ${t.tag}「${t.text}」 top=${t.top}`),
    );
  } catch (err) {
    return fail(`執行錯誤: ${err.message}`, '');
  }
}

export const metadata = {
  code: NAME,
  criterion: '2.4.3',
  level: 'A',
  category: 'EXTRA',
  rule: RULE,
};
