#!/usr/bin/env node
/**
 * run_axe.js — Playwright + axe-core 對 URL 跑動態 a11y 檢測
 *
 * 用法：
 *   node run_axe.js https://example.com [--json]
 *   node run_axe.js file:///abs/path.html --json
 *
 * 輸出：{ violations: [...], passes: [...], incomplete: [...] }
 */
import { chromium } from 'playwright';
import AxeBuilder from '@axe-core/playwright';

async function run(url) {
  const browser = await chromium.launch({ headless: true });
  try {
    const ctx = await browser.newContext();
    const page = await ctx.newPage();
    await page.goto(url, { waitUntil: 'networkidle', timeout: 30_000 });
    const builder = new AxeBuilder({ page })
      .withTags(['wcag2a', 'wcag2aa', 'wcag2aaa', 'wcag21a', 'wcag21aa', 'wcag22aa']);
    return await builder.analyze();
  } finally {
    await browser.close();
  }
}

const args = process.argv.slice(2);
const url = args.find(a => !a.startsWith('--'));
const isJson = args.includes('--json');

if (!url) {
  console.error('Usage: run_axe.js <url> [--json]');
  process.exit(1);
}

run(url).then(result => {
  if (isJson) console.log(JSON.stringify(result, null, 2));
  else {
    console.log(`Violations: ${result.violations.length}`);
    for (const v of result.violations) {
      console.log(`  [${v.impact}] ${v.id} — ${v.help} (${v.nodes.length} nodes)`);
    }
  }
}).catch(err => {
  console.error(err);
  process.exit(2);
});
