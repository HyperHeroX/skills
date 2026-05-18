import { test } from 'node:test';
import assert from 'node:assert/strict';
import { execSync } from 'node:child_process';
import path from 'node:path';
import { fileURLToPath } from 'node:url';

const __dirname = path.dirname(fileURLToPath(import.meta.url));
const SCRIPT = path.resolve(__dirname, '../../scripts/run_axe.js');
const FIXTURE = 'file://' + path.resolve(__dirname, '../fixtures/sample.html').replace(/\\/g, '/');

test('run_axe 偵測缺 alt + 對比不足', { timeout: 90_000 }, async () => {
  const out = JSON.parse(execSync(`node "${SCRIPT}" "${FIXTURE}" --json`).toString());
  const ids = out.violations.map(v => v.id);
  assert.ok(ids.includes('image-alt'), 'image-alt should fire');
  assert.ok(ids.includes('color-contrast'), 'color-contrast should fire');
});
