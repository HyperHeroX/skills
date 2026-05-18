import { test } from 'node:test';
import assert from 'node:assert/strict';
import { execSync } from 'node:child_process';
import path from 'node:path';
import { fileURLToPath } from 'node:url';

const __dirname = path.dirname(fileURLToPath(import.meta.url));
const SCRIPT = path.resolve(__dirname, '../../scripts/scan_react.mjs');
const FIXTURE = path.resolve(__dirname, '../fixtures/sample.tsx');

test('scan_react 偵測無 alt 的 img', () => {
  const out = JSON.parse(execSync(`node "${SCRIPT}" "${FIXTURE}" --json`).toString());
  assert.ok(out.find(f => f.rule === 'img-without-alt'));
});

test('scan_react 偵測 div role=button 缺鍵盤事件', () => {
  const out = JSON.parse(execSync(`node "${SCRIPT}" "${FIXTURE}" --json`).toString());
  assert.ok(out.find(f => f.rule === 'div-with-button-role'));
});

test('scan_react 偵測 dangerouslySetInnerHTML', () => {
  const out = JSON.parse(execSync(`node "${SCRIPT}" "${FIXTURE}" --json`).toString());
  assert.ok(out.find(f => f.rule === 'dangerously-set-inner-html'));
});
