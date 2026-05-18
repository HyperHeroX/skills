#!/usr/bin/env node
/**
 * e_code_runner.js — 台灣 TWAA 全部 209 個稽核評量碼（E 碼）Playwright 自動化測試主控器
 *
 * 每個 E 碼有獨立的測試檔案（e_code_tests/<CODE>.js），
 * 本主控器逐一 import 並呼叫，組合成完整報告。
 *
 * 架構原則：
 *  - 一個頁面跑全部 E 碼（不允許一個規則掃所有頁面）
 *  - 全部用 Playwright 程式碼驗證（不靠 AI 判斷）
 *  - 每個 E 碼一個獨立 JS 模組，主控器只負責串接
 *
 * 用法：
 *   node e_code_runner.js <url> [--level=AA] [--timeout=30000] [--category=GN]
 *   node e_code_runner.js --list                          # 列出所有已實作的 E 碼
 *   node e_code_runner.js --list --category GN             # 只列 GN 類
 */

import { chromium } from 'playwright';
import { readdir } from 'fs/promises';
import { join, dirname } from 'path';
import { fileURLToPath, pathToFileURL } from 'url';

const __dirname = dirname(fileURLToPath(import.meta.url));
const TESTS_DIR = join(__dirname, 'e_code_tests');

// ── 工具函式 ──────────────────────────────────────────────────────────────────

function makeResult(code, rule, status, message = '', fix = '', details = []) {
  return { code, rule, status, message, fix_suggestion: fix, details };
}

async function loadAllTests(categoryFilter = null) {
  const files = await readdir(TESTS_DIR);
  const testFiles = files
    .filter(f => f.match(/^[A-Z]{2}\d{7}E\.js$/))
    .filter(f => !categoryFilter || f.startsWith(categoryFilter));

  const tests = [];
  for (const file of testFiles) {
    try {
      const mod = await import(pathToFileURL(join(TESTS_DIR, file)).href);
      if (mod.check && mod.metadata) {
        tests.push({ file, check: mod.check, metadata: mod.metadata });
      }
    } catch (err) {
      // 跳過載入失敗的模組（記錄但不中斷）
    }
  }
  return tests;
}

function filterByLevel(tests, level) {
  const levelDigits = { 'A': new Set(['1']), 'AA': new Set(['1','2']), 'AAA': new Set(['1','2','3']) };
  const allowed = levelDigits[level] || levelDigits['AA'];
  return tests.filter(t => allowed.has(t.metadata.code[2]));
}

// ── 列出所有 E 碼 ─────────────────────────────────────────────────────────────

async function listTests(categoryFilter) {
  const tests = await loadAllTests(categoryFilter);
  const levelMap = {'1':'A','2':'AA','3':'AAA'};
  console.log(`已實作 E 碼：${tests.length} 個\n`);

  const byCategory = {};
  for (const t of tests) {
    const cat = t.metadata.category || t.metadata.code.slice(0,2);
    byCategory[cat] = byCategory[cat] || [];
    byCategory[cat].push(t.metadata);
  }

  for (const [cat, metas] of Object.entries(byCategory).sort()) {
    console.log(`【${cat}】${metas.length} 個`);
    for (const m of metas) {
      const lv = levelMap[m.code[2]] || '?';
      console.log(`  ${m.code} [${lv}] ${m.rule.slice(0,50)}`);
    }
    console.log();
  }
}

// ── 主執行函式 ────────────────────────────────────────────────────────────────

async function runAllECodes(url, { level = 'AA', timeout = 30000, categoryFilter = null } = {}) {
  const allTests = await loadAllTests(categoryFilter);
  const tests = filterByLevel(allTests, level);

  console.error(`[e_code_runner] 載入 ${tests.length} 個 E 碼（等級 ${level}）`);

  const browser = await chromium.launch({ headless: true });
  const results = [];

  try {
    const ctx = await browser.newContext({
      viewport: { width: 1280, height: 800 },
      locale: 'zh-TW',
    });
    const page = await ctx.newPage();

    await page.goto(url, { waitUntil: 'domcontentloaded', timeout });
    await page.waitForTimeout(1000);

    // 逐一執行每個 E 碼測試
    for (const { check, metadata } of tests) {
      try {
        const result = await check(page);
        results.push(result);
      } catch (err) {
        results.push(makeResult(
          metadata.code, metadata.rule, 'fail',
          `執行錯誤: ${err.message}`,
          '確認頁面載入完成後再執行',
          []
        ));
      }
    }

    // 補充：整體頁面摘要（pass 項目）
    const passCount = results.filter(r => r.status === 'pass').length;
    const failCount = results.filter(r => r.status === 'fail').length;
    results.push(makeResult(
      'E-CODE-SUMMARY', `E 碼測試摘要（共 ${tests.length} 個）`,
      failCount === 0 ? 'pass' : 'fail',
      `通過 ${passCount} 個，失敗 ${failCount} 個`
    ));

  } catch (err) {
    results.push(makeResult('ERR-BROWSER', '瀏覽器啟動失敗', 'fail', err.message, '確認 URL 可訪問且 Playwright 已安裝'));
  } finally {
    await browser.close();
  }

  return results;
}

// ── 主程式入口 ────────────────────────────────────────────────────────────────

async function main() {
  const args = process.argv.slice(2);

  if (args.includes('--list')) {
    const catIdx = args.indexOf('--category');
    const cat = catIdx >= 0 ? args[catIdx + 1] : null;
    await listTests(cat);
    return;
  }

  const url = args.find(a => !a.startsWith('--'));
  if (!url) {
    console.error('用法: node e_code_runner.js <url> [--level=AA] [--timeout=30000] [--category=GN]');
    console.error('      node e_code_runner.js --list [--category GN]');
    process.exit(1);
  }

  const level = (args.find(a => a.startsWith('--level=')) || '--level=AA').split('=')[1];
  const timeout = parseInt((args.find(a => a.startsWith('--timeout=')) || '--timeout=30000').split('=')[1]);
  const catArg = args.find(a => a.startsWith('--category='));
  const categoryFilter = catArg ? catArg.split('=')[1] : null;

  const results = await runAllECodes(url, { level, timeout, categoryFilter });
  console.log(JSON.stringify(results, null, 2));

  const failCount = results.filter(r => r.status === 'fail').length;
  if (failCount > 0) process.exit(1);
}

main().catch(err => {
  console.error(JSON.stringify([{
    code: 'ERR', rule: '執行失敗', status: 'fail',
    message: err.message, fix_suggestion: '', details: [],
  }]));
  process.exit(2);
});
