/**
 * 診斷 item_8（skip link Tab 順序）與 item_11（button 對比）真實原因
 */
import { chromium } from 'playwright';

(async () => {
  const browser = await chromium.launch({ headless: true });
  const ctx = await browser.newContext({ viewport: { width: 1280, height: 800 }, locale: 'zh-TW' });
  const page = await ctx.newPage();

  await page.goto('https://dsos.wda.gov.tw/zh-tw/home', { waitUntil: 'networkidle', timeout: 60000 });
  await page.waitForTimeout(2000);

  // === 診斷 #8 ===
  // 找出 DOM 順序前 10 個可聚焦元素
  const domOrder = await page.evaluate(() => {
    const focusable = document.querySelectorAll(
      'a[href], button:not([disabled]), input:not([disabled]), [tabindex]:not([tabindex="-1"])'
    );
    return [...focusable].slice(0, 12).map(el => ({
      tag: el.tagName,
      text: (el.textContent || el.value || '').slice(0, 40).trim(),
      href: el.getAttribute('href') || '',
      tabindex: el.getAttribute('tabindex') || '',
      className: (el.className || '').slice(0, 50),
      // 計算 DOM 中的位置（用 getBoundingClientRect.top）
      offsetTop: el.getBoundingClientRect().top,
    }));
  });

  console.log('=== DOM 順序前 12 個可聚焦元素 ===');
  domOrder.forEach((e, i) => {
    console.log(`${i+1}. <${e.tag}> "${e.text.slice(0,30)}" tabindex="${e.tabindex}" class="${e.className.slice(0,40)}" top=${Math.round(e.offsetTop)}`);
  });

  // 看 skip link 在 DOM 中的位置與 tabindex 設定
  const skipLinks = await page.evaluate(() => {
    return [...document.querySelectorAll('.skip-link, .bypass-blocks a')].map(el => ({
      text: el.textContent.trim(),
      href: el.getAttribute('href'),
      tabindex: el.getAttribute('tabindex') || '',
      className: el.className,
      // 計算它在 DOM 中是第幾個可聚焦元素
      index: [...document.querySelectorAll('a[href], button:not([disabled])')].indexOf(el),
    }));
  });
  console.log('\n=== Skip Links 詳情 ===');
  skipLinks.forEach(s => console.log(`  [${s.index}] "${s.text}" href="${s.href}" tabindex="${s.tabindex}"`));

  // === 診斷 #11 ===
  // 找出第一個 button 是什麼
  const firstBtn = await page.evaluate(() => {
    const btn = document.querySelector('button');
    if (!btn) return null;
    const cs = getComputedStyle(btn);
    let parent = btn.parentElement;
    let bgChain = [];
    while (parent && bgChain.length < 5) {
      const pcs = getComputedStyle(parent);
      bgChain.push({
        tag: parent.tagName,
        cls: (parent.className || '').slice(0, 50),
        bg: pcs.backgroundColor,
      });
      parent = parent.parentElement;
    }
    return {
      tag: btn.tagName,
      text: btn.textContent.trim().slice(0, 40),
      className: btn.className.slice(0, 80),
      ariaLabel: btn.getAttribute('aria-label') || '',
      computedColor: cs.color,
      computedBg: cs.backgroundColor,
      visible: btn.offsetParent !== null,
      rect: { x: Math.round(btn.getBoundingClientRect().x), y: Math.round(btn.getBoundingClientRect().y) },
      parentChain: bgChain,
    };
  });
  console.log('\n=== 第一個 <button> 詳情 ===');
  console.log(JSON.stringify(firstBtn, null, 2));

  await browser.close();
})();
