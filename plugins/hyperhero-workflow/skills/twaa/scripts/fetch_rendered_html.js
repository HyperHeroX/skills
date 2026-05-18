#!/usr/bin/env node
/**
 * fetch_rendered_html.js — 用 Playwright 取得 SPA 渲染完成後的 HTML。
 *
 * 用途：靜態檢查需要對「最終渲染的 DOM」執行，因為審查員看的是這個。
 * SPA 應用的原始 HTML 是空殼，必須等 Vue/React 完成 mount 才有完整內容。
 *
 * 用法：
 *   node fetch_rendered_html.js <url> [--timeout=30000]
 *
 * 輸出：渲染完成的 HTML 字串（stdout）
 */
import { chromium } from 'playwright';

async function main() {
  const args = process.argv.slice(2);
  const url = args.find(a => !a.startsWith('--'));
  const timeoutArg = args.find(a => a.startsWith('--timeout='));
  const timeout = timeoutArg ? parseInt(timeoutArg.split('=')[1]) : 30000;

  if (!url) {
    console.error('Usage: node fetch_rendered_html.js <url> [--timeout=30000]');
    process.exit(1);
  }

  const browser = await chromium.launch({ headless: true });
  try {
    const ctx = await browser.newContext({
      viewport: { width: 1280, height: 800 },
      locale: 'zh-TW',
    });
    const page = await ctx.newPage();

    // 等到 networkidle 確保 SPA 完成渲染
    await page.goto(url, { waitUntil: 'networkidle', timeout });

    // 額外等 1 秒給 Vue/React mount 完成
    await page.waitForTimeout(1000);

    // 取得完整 outerHTML（含 doctype）
    const html = await page.evaluate(() => {
      const doctype = document.doctype
        ? `<!DOCTYPE ${document.doctype.name}>`
        : '<!DOCTYPE html>';
      return doctype + '\n' + document.documentElement.outerHTML;
    });

    process.stdout.write(html);
  } catch (err) {
    console.error('fetch error:', err.message);
    process.exit(2);
  } finally {
    await browser.close();
  }
}

main();
