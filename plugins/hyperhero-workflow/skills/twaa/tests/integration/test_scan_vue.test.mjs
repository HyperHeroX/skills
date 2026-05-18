import { test } from 'node:test';
import assert from 'node:assert/strict';
import { execSync } from 'node:child_process';
import { fileURLToPath } from 'node:url';
import path from 'node:path';

const __dirname = path.dirname(fileURLToPath(import.meta.url));
const SCRIPT = path.resolve(__dirname, '../../scripts/scan_vue.js');
const FIXTURE = path.resolve(__dirname, '../fixtures/sample.vue');

test('scan_vue 偵測無 alt 的 img', () => {
  const out = execSync(`node "${SCRIPT}" "${FIXTURE}" --json`).toString();
  const findings = JSON.parse(out);
  const imgIssue = findings.find(f => f.rule === 'img-without-alt');
  assert.ok(imgIssue, '應偵測到 /logo.png 缺 alt');
  assert.equal(imgIssue.guideline, '1.1.1');
});

test('scan_vue 偵測 Dialog closeOnEscape false', () => {
  const out = execSync(`node "${SCRIPT}" "${FIXTURE}" --json`).toString();
  const findings = JSON.parse(out);
  const dlg = findings.find(f => f.rule === 'dialog-disable-esc');
  assert.ok(dlg, '應偵測到 Dialog closeOnEscape=false');
  assert.equal(dlg.guideline, '2.1.2');
});

test('scan_vue 偵測 Teleport 焦點順序風險', () => {
  const out = execSync(`node "${SCRIPT}" "${FIXTURE}" --json`).toString();
  const findings = JSON.parse(out);
  const tp = findings.find(f => f.rule === 'teleport-focus-risk');
  assert.ok(tp, '應偵測到 Teleport');
  assert.equal(tp.guideline, '2.4.3');
});
