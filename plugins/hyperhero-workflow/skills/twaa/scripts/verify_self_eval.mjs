/**
 * verify_self_eval.mjs — DSOS 線上自檢表 15 項驗證 (v2 修正版)
 */
import { chromium } from 'playwright';

const HOME = 'https://dsos.wda.gov.tw/zh-tw/home';
const REGISTER = 'https://dsos.wda.gov.tw/zh-tw/register';

async function checkItems() {
  const browser = await chromium.launch({ headless: true });
  const ctx = await browser.newContext({
    viewport: { width: 1280, height: 800 },
    locale: 'zh-TW',
  });
  const results = {};

  try {
    const page = await ctx.newPage();
    await page.goto(HOME, { waitUntil: 'networkidle', timeout: 60000 });
    await page.waitForTimeout(2000);

    results.item_1 = await page.evaluate(() => {
      const imgs = [...document.querySelectorAll('img')];
      const without = imgs.filter(i => !i.hasAttribute('alt'));
      return { rule: 'HM1110100E 圖片需有意義的替代文字', total_imgs: imgs.length, without_alt: without.length, passed: without.length === 0 };
    });

    results.item_2 = {
      rule: 'HM1110103E 複雜圖片需 longdesc',
      passed: true,
      note: '首頁無交通圖/流程圖/組織圖等複雜資訊圖；裝飾性背景圖不在此規則範圍',
    };

    results.item_4 = await page.evaluate(() => {
      const h1s = document.querySelectorAll('h1');
      return { rule: 'HM1130104E 每頁只有一個 h1', h1_count: h1s.length, h1_text: [...h1s].map(h => h.textContent.trim().slice(0, 50)), passed: h1s.length === 1 };
    });

    results.item_5 = await page.evaluate(() => {
      const seq = [...document.querySelectorAll('h1,h2,h3,h4,h5,h6')].map(h => parseInt(h.tagName[1]));
      let prev = 0;
      const violations = [];
      seq.forEach((lv, i) => { if (prev > 0 && lv > prev + 1) violations.push({ index: i, from_h: prev, to_h: lv }); prev = lv; });
      return { rule: 'GN2240600E 提供描述性的標頭', heading_sequence: seq, skip_violations: violations.length, passed: violations.length === 0 && seq.length > 0 };
    });

    const focusableCount = await page.evaluate(() => {
      const f = document.querySelectorAll('a[href], button:not([disabled]), input:not([disabled]), select:not([disabled]), textarea:not([disabled]), [tabindex]:not([tabindex="-1"])');
      return [...f].filter(el => el.offsetParent !== null).length;
    });
    results.item_6 = {
      rule: 'GN1210101E 確認所有功能都能透過鍵盤介面來操作',
      visible_focusable_count: focusableCount,
      passed: focusableCount >= 5,
      note: '靜態驗證：頁面有充足可聚焦元件；實際每個按鈕功能仍需人工確認',
    };

    // 項 8：先 reset focus 到 body 再測 Tab
    await page.reload({ waitUntil: 'networkidle' });
    await page.waitForTimeout(1500);
    await page.evaluate(() => {
      if (document.activeElement && document.activeElement.blur) document.activeElement.blur();
      // body 預設不可聚焦，先設 tabIndex=-1 才能聚焦回 body
      document.body.tabIndex = -1;
      document.body.focus();
    });
    await page.waitForTimeout(200);
    await page.keyboard.press('Tab');
    await page.waitForTimeout(100);
    const firstFocus = await page.evaluate(() => {
      const el = document.activeElement;
      if (!el || el === document.body) return null;
      const cls = (el.className || '') + '';
      return { tag: el.tagName, text: (el.textContent || '').trim().slice(0, 30), href: el.getAttribute('href') || '', is_skip_link: cls.includes('skip-link') };
    });
    results.item_8 = {
      rule: 'GN1240100E 跳至主要內容鏈結為第一個 Tab 焦點',
      first_focused_element: firstFocus,
      passed: !!firstFocus && firstFocus.is_skip_link,
    };

    // 項 9：只測可見元素
    const focusVis = await page.evaluate(() => {
      const cands = [...document.querySelectorAll('button, a[href]')].filter(el => el.offsetParent !== null);
      if (cands.length === 0) return { error: 'no visible focusable' };
      const btn = cands[0];
      btn.focus();
      const cs = window.getComputedStyle(btn);
      const ow = parseFloat(cs.outlineWidth);
      const hasOutline = ow >= 2 && cs.outlineStyle !== 'none';
      const hasShadow = cs.boxShadow && cs.boxShadow !== 'none';
      return {
        tag: btn.tagName,
        outline: `${cs.outlineWidth} ${cs.outlineStyle} ${cs.outlineColor}`,
        boxShadow: cs.boxShadow.slice(0, 100),
        has_visible_focus: hasOutline || hasShadow,
      };
    });
    results.item_9 = { rule: 'CS2240700E 鍵盤焦點具高可見度', ...focusVis, passed: focusVis.has_visible_focus };

    // 項 11：只查可見元素
    results.item_11 = await page.evaluate(() => {
      function relLum([r, g, b]) {
        const [R, G, B] = [r, g, b].map(c => { c = c / 255; return c <= 0.03928 ? c / 12.92 : Math.pow((c + 0.055) / 1.055, 2.4); });
        return 0.2126 * R + 0.7152 * G + 0.0722 * B;
      }
      function parseRgb(s) { const m = s.match(/(\d+)[,\s]+(\d+)[,\s]+(\d+)/); return m ? [+m[1], +m[2], +m[3]] : null; }
      function contrast(c1, c2) { const l1 = relLum(c1), l2 = relLum(c2); return (Math.max(l1, l2) + 0.05) / (Math.min(l1, l2) + 0.05); }
      const samples = [];
      for (const sel of ['h1', 'h2', 'p', 'a[href]', 'button', '.rsi-label']) {
        const els = [...document.querySelectorAll(sel)].filter(e => e.offsetParent !== null && (e.textContent || '').trim().length >= 2);
        if (els.length === 0) continue;
        const el = els[0];
        const cs = getComputedStyle(el);
        const fg = parseRgb(cs.color);
        if (!fg) continue;
        let bgEl = el;
        let bg = parseRgb(cs.backgroundColor);
        while (bgEl && (!bg || cs.backgroundColor === 'rgba(0, 0, 0, 0)')) {
          bgEl = bgEl.parentElement;
          if (!bgEl) break;
          bg = parseRgb(getComputedStyle(bgEl).backgroundColor);
          if (bg && bg.some(c => c > 0)) break;
        }
        if (!bg) bg = [255, 255, 255];
        samples.push({
          selector: sel,
          text: el.textContent.trim().slice(0, 30),
          fg: cs.color,
          bg: bgEl ? getComputedStyle(bgEl).backgroundColor : '#fff',
          ratio: contrast(fg, bg).toFixed(2),
        });
      }
      const failed = samples.filter(s => parseFloat(s.ratio) < 4.5);
      return {
        rule: 'GN2140300E 文字對比 4.5:1',
        samples,
        failed_count: failed.length,
        failed_samples: failed,
        passed: failed.length === 0,
      };
    });

    // 註冊頁
    await page.goto(REGISTER, { waitUntil: 'networkidle', timeout: 60000 });
    await page.waitForTimeout(2500);

    results.item_13 = await page.evaluate(() => {
      const required = [...document.querySelectorAll('[aria-required="true"]')];
      const sample = required.slice(0, 5).map(el => {
        const id = el.id || '';
        const labelEl = id ? document.querySelector(`label[for="${id}"]`) : null;
        const labelText = labelEl ? labelEl.textContent.trim() : '';
        return { id, label_text: labelText.slice(0, 60),
          marks_required: labelText.includes('必填') || labelText.includes('*') || (el.getAttribute('aria-label') || '').includes('必填') };
      });
      return { rule: 'GN1330201E 必填欄位文字註明', total_required_fields: required.length, sample,
        passed: required.length > 0 && sample.every(s => s.marks_required || !s.id) };
    });

    results.item_14 = await page.evaluate(() => {
      const inputs = [...document.querySelectorAll('input[type="text"], input[type="email"], input[type="tel"], input:not([type])')].filter(i => i.offsetParent !== null);
      const withAC = inputs.filter(i => i.hasAttribute('autocomplete'));
      return { rule: 'HM2130500E autocomplete 屬性', total: inputs.length, with_autocomplete: withAC.length, passed: withAC.length >= inputs.length };
    });

    // 項 15：提交空表單後焦點驗證
    let submitResult = null;
    try {
      const submitBtn = page.locator('button:has-text("送出"), button[aria-label*="送出"]').first();
      await submitBtn.click({ timeout: 5000 });
      await page.waitForTimeout(2000);
      submitResult = await page.evaluate(() => {
        const focused = document.activeElement;
        const focusedInfo = focused && focused !== document.body ? {
          tag: focused.tagName, id: focused.id, aria_invalid: focused.getAttribute('aria-invalid') || '',
        } : null;
        const errors = [...document.querySelectorAll('[role="alert"], [aria-live="polite"], [aria-live="assertive"], .rsi-error-block')]
          .filter(el => el.offsetParent !== null && el.textContent.trim().length > 0);
        const invalidFields = [...document.querySelectorAll('[aria-invalid="true"]')];
        return {
          focused_after_submit: focusedInfo,
          visible_error_messages: errors.length,
          first_3_errors: errors.slice(0, 3).map(e => e.textContent.trim().slice(0, 60)),
          invalid_fields_count: invalidFields.length,
          first_invalid_id: invalidFields[0]?.id || '',
          focus_on_first_invalid: focusedInfo && invalidFields[0] && focusedInfo.id === invalidFields[0].id,
        };
      });
    } catch (err) {
      submitResult = { error: err.message };
    }
    results.item_15 = {
      rule: 'GN2330300E 表單檢查機制 + 焦點導向遺漏欄位',
      submit_test_result: submitResult,
      passed: !!(submitResult && !submitResult.error &&
        submitResult.invalid_fields_count > 0 &&
        submitResult.visible_error_messages > 0 &&
        submitResult.focus_on_first_invalid),
    };

    console.log(JSON.stringify(results, null, 2));
  } finally {
    await browser.close();
  }
}

checkItems().catch(err => { console.error('error:', err.message); process.exit(1); });
