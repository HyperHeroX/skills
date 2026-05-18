#!/usr/bin/env node
/**
 * extra_runner.js — TWAA 額外檢測項主控器
 *
 * 用於跑非官方 E 碼但實務 AA 審查會看的加強規則（FreeGo 慣性要求）。
 * 每個檢測一個獨立 JS 模組（extra_tests/EXTRA_*.js），與 e_code_runner.js 共用 Playwright session。
 *
 * 用法：
 *   node extra_runner.js <url> [--timeout=30000]
 *   node extra_runner.js --list
 *
 * 範例：
 *   node extra_runner.js https://dsos.wda.gov.tw/zh-tw/home
 *   node extra_runner.js http://localhost:8083/zh-tw/EmploymentForPeopleWithDisabilitiesDirections
 */

import { chromium } from 'playwright';
import { readdir } from 'fs/promises';
import { join, dirname } from 'path';
import { fileURLToPath, pathToFileURL } from 'url';

const __dirname = dirname(fileURLToPath(import.meta.url));
const TESTS_DIR = join(__dirname, 'extra_tests');

async function loadTests() {
  const files = await readdir(TESTS_DIR);
  const testFiles = files.filter(f => /^EXTRA_.+\.js$/.test(f));
  const tests = [];
  for (const file of testFiles) {
    try {
      const mod = await import(pathToFileURL(join(TESTS_DIR, file)).href);
      if (mod.check && mod.metadata) {
        tests.push({ file, check: mod.check, metadata: mod.metadata });
      }
    } catch (err) {
      console.error(`✗ 載入失敗 ${file}: ${err.message}`);
    }
  }
  return tests;
}

async function listTests() {
  const tests = await loadTests();
  console.log(`已實作 ${tests.length} 個額外檢測：\n`);
  for (const t of tests) {
    console.log(`  ${t.metadata.code.padEnd(28)} ${t.metadata.level}  ${t.metadata.rule}`);
  }
}

async function runOne(url, timeout = 30000) {
  const tests = await loadTests();
  if (tests.length === 0) {
    console.error('錯誤：extra_tests/ 目錄沒有可載入的檢測模組');
    process.exit(1);
  }

  const browser = await chromium.launch({ headless: true });
  const context = await browser.newContext();
  const page = await context.newPage();

  const results = [];
  try {
    console.error(`▶ ${url}`);
    await page.goto(url, { waitUntil: 'networkidle', timeout });
    await page.waitForTimeout(800); // 等 Vue 渲染與 auto-tooltip plugin 掃描完

    for (const test of tests) {
      const t0 = Date.now();
      let r;
      try {
        r = await test.check(page);
      } catch (err) {
        r = {
          code: test.metadata.code,
          rule: test.metadata.rule,
          status: 'fail',
          message: `執行例外：${err.message}`,
          fix_suggestion: '',
          details: [],
        };
      }
      r.duration_ms = Date.now() - t0;
      results.push(r);

      const symbol = r.status === 'pass' ? '✓' : (r.status === 'fail' ? '✗' : '?');
      console.error(`  ${symbol} ${r.code}: ${r.message}`);
    }
  } finally {
    await browser.close();
  }

  return { url, results, summary: summarize(results) };
}

function summarize(results) {
  const total = results.length;
  const pass = results.filter(r => r.status === 'pass').length;
  const fail = results.filter(r => r.status === 'fail').length;
  return { total, pass, fail };
}

// ── CLI ──
const args = process.argv.slice(2);
if (args.includes('--list')) {
  await listTests();
  process.exit(0);
}

const url = args.find(a => !a.startsWith('--'));
if (!url) {
  console.error('用法：node extra_runner.js <url> [--timeout=30000]');
  console.error('     node extra_runner.js --list');
  process.exit(1);
}

const timeoutArg = args.find(a => a.startsWith('--timeout='));
const timeout = timeoutArg ? parseInt(timeoutArg.split('=')[1], 10) : 30000;

const out = await runOne(url, timeout);
console.log(JSON.stringify(out, null, 2));

process.exit(out.summary.fail > 0 ? 1 : 0);
