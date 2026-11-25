import assert from 'node:assert/strict';
import { spawnSync } from 'node:child_process';
import { cpSync, existsSync, mkdirSync, mkdtempSync, readFileSync, rmSync, writeFileSync } from 'node:fs';
import { tmpdir } from 'node:os';
import { basename, join } from 'node:path';
import { test } from 'node:test';

const loopPrompt = 'Continue the task. 請繼續任務。';

const plugins = [
  ['hyperhero-tools', 'ralph-stop-hook.mjs', 'ralph-loop.local.md'],
  ['hyperhero-workflow', 'devteam-stop-hook.mjs', 'devtem-loop.local.md'],
];

for (const [plugin, script, stateName] of plugins) {
  test(plugin + ' Stop hook', async t => {
    const root = mkdtempSync(join(tmpdir(), 'stop-hook fixture '));
    t.after(() => rmSync(root, { recursive: true, force: true }));
    const installed = join(root, 'plugin root #1');
    const project = join(root, 'project directory');
    const source = new URL('../plugins/' + plugin + '/', import.meta.url);
    mkdirSync(join(installed, 'scripts'), { recursive: true });
    mkdirSync(join(project, '.claude'), { recursive: true });
    cpSync(new URL('scripts/' + script, source), join(installed, 'scripts', script));

    const config = JSON.parse(readFileSync(new URL('hooks/hooks.json', source), 'utf8'));
    assert.equal(config.hooks.Stop.length, 1);
    assert.equal(config.hooks.Stop[0].hooks.length, 1);
    const { command } = config.hooks.Stop[0].hooks[0];
    const stateFile = join(project, '.claude', stateName);

    function runHook(payload = {}) {
      const executable = process.platform === 'win32' ? 'powershell.exe' : '/bin/sh';
      const args = process.platform === 'win32'
        ? ['-NoProfile', '-NonInteractive', '-Command', command]
        : ['-c', command];
      const result = spawnSync(executable, args, {
        cwd: root,
        env: { ...process.env, CLAUDE_PLUGIN_ROOT: installed },
        input: JSON.stringify({ cwd: project, session_id: 'test-session', ...payload }),
        encoding: 'utf8',
        timeout: 10_000,
      });
      assert.ifError(result.error);
      assert.equal(result.status, 0, result.stderr);
      assert.equal(result.stderr, '');
      return result.stdout ? JSON.parse(result.stdout) : null;
    }

    function writeState({
      iteration = 1, max = 3, session = 'test-session', promise = 'null',
      newline = '\n', bom = '', prompt = loopPrompt,
    } = {}) {
      const lines = [
        '---', 'iteration: ' + iteration, 'session_id: ' + session,
        'max_iterations: ' + max, 'completion_promise: ' + promise, '---', '', prompt,
      ];
      const contents = bom + lines.join(newline) + newline;
      writeFileSync(stateFile, contents);
      return contents;
    }

    await t.test('exits cleanly without a loop', () => {
      assert.equal(runHook(), null);
    });

    await t.test('continues LF and CRLF/BOM state in the payload cwd', () => {
      for (const [newline, bom, session] of [['\n', '', 'test-session'], ['\r\n', '\uFEFF', '']]) {
        const original = writeState({ newline, bom, session });
        const out = runHook();
        assert.equal(out?.decision, 'block');
        assert.equal(out.reason, loopPrompt);
        assert.equal(readFileSync(stateFile, 'utf8'), original.replace('iteration: 1', 'iteration: 2'));
      }
    });

    await t.test('leaves a different session untouched', () => {
      const original = writeState();
      assert.equal(runHook({ session_id: 'other-session' }), null);
      assert.equal(readFileSync(stateFile, 'utf8'), original);
    });

    await t.test('returns JSON and removes finished state at the iteration limit', () => {
      writeState({ iteration: 3 });
      assert.match(runHook()?.systemMessage ?? '', /Max iterations/);
      assert.equal(existsSync(stateFile), false);
    });

    await t.test('uses the Codex message without a transcript', () => {
      writeState({ promise: '"DONE"' });
      const result = runHook({ transcript_path: null, last_assistant_message: '<promise>DONE</promise>' });
      assert.match(result?.systemMessage ?? '', /Detected <promise>DONE/);
      assert.equal(existsSync(stateFile), false);
    });

    await t.test('uses the latest Claude assistant text from a JSONL transcript', () => {
      writeState({ promise: '"DONE"' });
      const transcript = join(project, 'assistant transcript.jsonl');
      const record = {
        type: 'assistant', message: { role: 'assistant', content: [{ type: 'text', text: '<promise>DONE</promise>' }] },
      };
      writeFileSync(transcript, JSON.stringify(record) + '\r\n{');
      const result = runHook({ transcript_path: basename(transcript) });
      assert.match(result?.systemMessage ?? '', /Detected <promise>DONE/);
      assert.equal(existsSync(stateFile), false);
    });

    await t.test('preserves a promise loop if no assistant text can be read', () => {
      const original = writeState({ promise: '"DONE"' });
      assert.equal(runHook({ transcript_path: 'missing transcript.jsonl' }), null);
      assert.equal(readFileSync(stateFile, 'utf8'), original);
    });
  });
}
