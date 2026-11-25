#!/usr/bin/env node

import { readFileSync, rmSync, writeFileSync } from 'node:fs';
import { isAbsolute, join, resolve } from 'node:path';

const stateName = 'ralph-loop.local.md';
const loopName = 'Ralph';

function readOptionalFile(file) {
  try {
    return readFileSync(file, 'utf8');
  } catch (error) {
    if (error.code === 'ENOENT') return null;
    throw error;
  }
}

function lastAssistantMessage(input, cwd) {
  if (typeof input.last_assistant_message === 'string') {
    return input.last_assistant_message;
  }
  if (typeof input.transcript_path !== 'string' || !input.transcript_path) return null;

  const transcript = readOptionalFile(resolve(cwd, input.transcript_path));
  if (!transcript) return null;

  for (const line of transcript.split(/\r?\n/).reverse()) {
    let record;
    try {
      record = JSON.parse(line);
    } catch {
      continue;
    }
    const message = record?.type === 'response_item' ? record.payload : record?.message;
    if ((message?.role ?? record?.role) !== 'assistant' || !Array.isArray(message?.content)) continue;

    const text = message.content
      .filter(block => (block?.type === 'text' || block?.type === 'output_text') && typeof block.text === 'string')
      .map(block => block.text);
    if (text.length) return text.join('\n');
  }
  return null;
}

function stopLoop(stateFile, systemMessage) {
  rmSync(stateFile, { force: true });
  process.stdout.write(JSON.stringify({ systemMessage }));
}

function run() {
  let input;
  try {
    input = JSON.parse(readFileSync(0, 'utf8'));
  } catch {
    return;
  }
  if (!input || typeof input !== 'object') return;

  const cwd = typeof input.cwd === 'string' && isAbsolute(input.cwd) ? input.cwd : process.cwd();
  const stateFile = join(cwd, '.claude', stateName);
  const state = readOptionalFile(stateFile);
  if (state === null) return;

  const header = /^\uFEFF?---[ \t]*\r?\n([\s\S]*?)\r?\n---[ \t]*(?:\r?\n|$)/.exec(state);
  if (!header) {
    stopLoop(stateFile, loopName + ' loop: State file has no frontmatter');
    return;
  }

  function getField(name) {
    const match = header[1].match(new RegExp('^' + name + ':[ \t]*([^\r\n]*)', 'm'));
    return match?.[1].trim().replace(/^["']|["']$/g, '') ?? '';
  }

  const session = getField('session_id');
  if (session && session !== input.session_id) return;

  const iteration = Number.parseInt(getField('iteration'), 10);
  const maxIterations = Number.parseInt(getField('max_iterations'), 10) || 0;
  if (Number.isNaN(iteration)) {
    stopLoop(stateFile, loopName + ' loop: State file corrupted (invalid iteration)');
    return;
  }
  if (maxIterations > 0 && iteration >= maxIterations) {
    stopLoop(stateFile, loopName + ' loop: Max iterations (' + maxIterations + ') reached.');
    return;
  }

  const completionPromise = getField('completion_promise');
  const hasPromise = completionPromise !== '' && completionPromise !== 'null';
  if (hasPromise) {
    const output = lastAssistantMessage(input, cwd);
    if (output === null) return;

    const promise = output.match(/<promise>([\s\S]*?)<\/promise>/)?.[1];
    if (promise?.trim().replace(/\s+/g, ' ') === completionPromise) {
      stopLoop(stateFile, loopName + ' loop: Detected <promise>' + completionPromise + '</promise>');
      return;
    }
  }

  const body = state.slice(header[0].length);
  if (!body.trim()) {
    stopLoop(stateFile, loopName + ' loop: No prompt text found in state file');
    return;
  }

  const nextIteration = iteration + 1;
  const updatedHeader = header[0].replace(/^iteration:[ \t]*\d+/m, 'iteration: ' + nextIteration);
  writeFileSync(stateFile, updatedHeader + body, 'utf8');

  const hint = hasPromise
    ? 'To stop: output <promise>' + completionPromise + '</promise> only when true'
    : 'No completion promise set';
  process.stdout.write(JSON.stringify({
    decision: 'block',
    reason: body.trim(),
    systemMessage: loopName + ' iteration ' + nextIteration + ' | ' + hint,
  }));
}

run();
