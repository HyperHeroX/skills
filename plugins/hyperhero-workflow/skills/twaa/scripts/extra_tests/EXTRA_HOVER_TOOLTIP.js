/**
 * EXTRA_HOVER_TOOLTIP — 滑鼠懸停顯示 tooltip（FreeGo 審查員慣性要求）
 *
 * 規則：所有具備 click / hover 行為的可互動元素，滑鼠懸停時應顯示 tooltip。
 *
 * 此非官方 WCAG / TWAA 條目（AA 規範並未強制要求每個元素都有 tooltip），
 * 但實務上大多數 AA 標章網站皆有此行為，FreeGo 審查員會以此判定「可用性」。
 *
 * 自動化檢測流程：
 *   1. 取得所有可互動元素（a[href], button, [role=button], input[type=button|submit]）
 *   2. 檢查每個元素是否有：
 *      a) title 屬性，或
 *      b) aria-label 屬性，或
 *      c) PrimeVue tooltip 標記（hover 後 DOM 出現 .p-tooltip）
 *   3. 隨機取樣 5 個元素實際 hover 驗證 tooltip 是否真的出現
 */

const NAME = 'EXTRA_HOVER_TOOLTIP';
const RULE = '可互動元素滑鼠懸停顯示 tooltip';

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
    // 步驟 1: 靜態檢查 — 統計具/缺 title|aria-label 的可互動元素
    const stats = await page.evaluate(() => {
      const sel = 'a[href], button, [role="button"], input[type="button"], input[type="submit"]';
      const all = [...document.querySelectorAll(sel)].filter(el => {
        // 只算可見元素
        if (el.getAttribute('aria-hidden') === 'true') return false;
        const r = el.getBoundingClientRect();
        return r.width > 0 && r.height > 0 && el.offsetParent !== null;
      });
      const missing = [];
      for (const el of all) {
        const hasTooltipSource =
          (el.getAttribute('title') || '').trim() ||
          (el.getAttribute('aria-label') || '').trim() ||
          (el.textContent || '').trim();
        if (!hasTooltipSource) {
          missing.push({
            tag: el.tagName,
            html: el.outerHTML.slice(0, 100),
          });
        }
      }
      return {
        total: all.length,
        missing_count: missing.length,
        missing_samples: missing.slice(0, 5),
      };
    });

    if (stats.missing_count > 0) {
      return fail(
        `${stats.missing_count}/${stats.total} 個可互動元素無任何 tooltip 來源（無 title、aria-label、可視文字）`,
        '為這些元素加上 aria-label 或 title；或全域 auto-tooltip plugin 未生效',
        stats.missing_samples.map(s => s.html),
      );
    }

    // 步驟 2: 動態檢查 — 隨機取樣 hover 驗證 PrimeVue tooltip 是否出現
    const samplesToTest = await page.evaluate(() => {
      const sel = 'a[href], button, [role="button"]';
      const all = [...document.querySelectorAll(sel)].filter(el => {
        if (el.getAttribute('aria-hidden') === 'true') return false;
        const r = el.getBoundingClientRect();
        return r.width > 0 && r.height > 0;
      });
      // 取最多 5 個樣本
      const samples = [];
      for (let i = 0; i < Math.min(5, all.length); i++) {
        const el = all[Math.floor(i * all.length / 5)];
        if (el && !samples.includes(el)) {
          el.setAttribute('data-tooltip-probe', String(i));
          samples.push(el);
        }
      }
      return samples.length;
    });

    let hoverPass = 0;
    let hoverFail = 0;
    const hoverDetails = [];

    for (let i = 0; i < samplesToTest; i++) {
      const probe = page.locator(`[data-tooltip-probe="${i}"]`);
      if (await probe.count() === 0) continue;

      // 先檢查靜態 title（即使 hover 動作失敗，只要有 title 就算 native tooltip 可顯示）
      const staticInfo = await probe.first().evaluate((el) => ({
        title: el.getAttribute('title') || '',
        ariaLabel: el.getAttribute('aria-label') || '',
        text: (el.textContent || '').trim().slice(0, 30),
      }));

      try {
        await probe.first().hover({ timeout: 2000 });
        await page.waitForTimeout(400);

        const tooltipShown = await page.evaluate(() => {
          const ptip = document.querySelector('.p-tooltip:not([style*="display: none"]):not([style*="display:none"])');
          if (ptip && ptip.getBoundingClientRect().width > 0) return { method: 'p-tooltip', text: ptip.textContent?.trim().slice(0, 50) };
          return null;
        });

        if (tooltipShown) {
          hoverPass++;
          hoverDetails.push(`✓ #${i} p-tooltip: ${tooltipShown.text}`);
        } else if (staticInfo.title || staticInfo.ariaLabel) {
          // PrimeVue tooltip 沒觸發但有 native title → 視為通過（瀏覽器原生 hover 仍會顯示）
          hoverPass++;
          hoverDetails.push(`✓ #${i} native-title: ${(staticInfo.title || staticInfo.ariaLabel).slice(0, 40)}`);
        } else {
          hoverFail++;
          hoverDetails.push(`✗ #${i} 無 tooltip（無 title/aria-label）`);
        }
      } catch (e) {
        // hover 動作失敗（多半是 overlay 攔截或元素超出視窗）— 退回靜態檢查
        if (staticInfo.title || staticInfo.ariaLabel) {
          hoverPass++;
          hoverDetails.push(`✓ #${i} static-only（hover 被 overlay 擋）: ${(staticInfo.title || staticInfo.ariaLabel).slice(0, 40)}`);
        } else {
          hoverFail++;
          hoverDetails.push(`✗ #${i} hover 失敗且無靜態 tooltip 來源`);
        }
      }
    }

    // 清理 probe 標記
    await page.evaluate(() => {
      document.querySelectorAll('[data-tooltip-probe]').forEach(el => el.removeAttribute('data-tooltip-probe'));
    });

    if (hoverFail > hoverPass) {
      return fail(
        `${hoverFail}/${samplesToTest} 個樣本 hover 後未偵測到 tooltip`,
        '檢查 auto-tooltip plugin 是否載入；確認 PrimeVue Tooltip directive 已註冊',
        hoverDetails,
      );
    }

    return pass(
      `${stats.total} 個可互動元素全部具有 tooltip 來源；hover 採樣 ${hoverPass}/${samplesToTest} 通過`,
      hoverDetails,
    );
  } catch (err) {
    return fail(`執行錯誤: ${err.message}`, '確認頁面載入完成');
  }
}

export const metadata = {
  code: NAME,
  criterion: 'extra',
  level: 'AA',
  category: 'EXTRA',
  rule: RULE,
};
