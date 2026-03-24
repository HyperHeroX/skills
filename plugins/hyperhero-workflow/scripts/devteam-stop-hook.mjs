#!/usr/bin/env node

/**
 * DevTeam Loop Stop Hook (Node.js cross-platform)
 * Prevents session exit when a devteam-loop is active.
 * Feeds Claude's output back as input to continue the loop.
 *
 * Based on Ralph Loop stop hook, adapted for devteam workflow.
 * Original: https://github.com/anthropics/claude-code/tree/main/plugins/ralph-wiggum
 */

import { readFileSync, writeFileSync, unlinkSync, existsSync } from 'node:fs';
import { join } from 'node:path';

const STATE_FILE = join('.claude', 'devtem-loop.local.md');

// Read hook input from stdin
let hookInput = '';
try {
  hookInput = readFileSync(0, 'utf-8');
} catch {
  // No stdin available
}

// No active loop — allow exit
if (!existsSync(STATE_FILE)) {
  process.exit(0);
}

const stateContent = readFileSync(STATE_FILE, 'utf-8');

// Parse YAML frontmatter (between --- markers)
const fmMatch = stateContent.match(/^---\n([\s\S]*?)\n---/);
if (!fmMatch) {
  console.error('⚠️  DevTeam loop: State file has no frontmatter');
  unlinkSync(STATE_FILE);
  process.exit(0);
}

const frontmatter = fmMatch[1];
function getField(name) {
  const m = frontmatter.match(new RegExp(`^${name}:\\s*(.*)$`, 'm'));
  return m ? m[1].replace(/^["']|["']$/g, '').trim() : null;
}

let iteration = parseInt(getField('iteration'), 10);
const maxIterations = parseInt(getField('max_iterations'), 10) || 0;
let completionPromise = getField('completion_promise');
const featureName = getField('feature_name') || '';
if (completionPromise === 'null') completionPromise = null;

// Session isolation
const stateSession = getField('session_id') || '';
let hookSession = '';
try {
  const parsed = JSON.parse(hookInput);
  hookSession = parsed.session_id || '';
} catch { /* ignore */ }

if (stateSession && stateSession !== hookSession) {
  process.exit(0);
}

// Validate iteration
if (isNaN(iteration)) {
  console.error('⚠️  DevTeam loop: State file corrupted (invalid iteration)');
  unlinkSync(STATE_FILE);
  process.exit(0);
}

// Check max iterations
if (maxIterations > 0 && iteration >= maxIterations) {
  console.log(`🛑 DevTeam loop: Max iterations (${maxIterations}) reached.`);
  unlinkSync(STATE_FILE);
  process.exit(0);
}

// Get transcript path from hook input
let transcriptPath = '';
try {
  const parsed = JSON.parse(hookInput);
  transcriptPath = parsed.transcript_path || '';
} catch { /* ignore */ }

if (!transcriptPath || !existsSync(transcriptPath)) {
  console.error('⚠️  DevTeam loop: Transcript file not found');
  unlinkSync(STATE_FILE);
  process.exit(0);
}

// Read last assistant message from transcript (JSONL format)
const transcriptContent = readFileSync(transcriptPath, 'utf-8');
const lines = transcriptContent.split('\n').filter(l => l.includes('"role":"assistant"'));

if (lines.length === 0) {
  console.error('⚠️  DevTeam loop: No assistant messages found in transcript');
  unlinkSync(STATE_FILE);
  process.exit(0);
}

// Extract the last text block from recent assistant lines
let lastOutput = '';
try {
  const recentLines = lines.slice(-100);
  for (const line of recentLines) {
    const parsed = JSON.parse(line);
    const contents = parsed?.message?.content || [];
    for (const block of contents) {
      if (block.type === 'text' && block.text) {
        lastOutput = block.text;
      }
    }
  }
} catch (e) {
  console.error(`⚠️  DevTeam loop: Failed to parse transcript JSON: ${e.message}`);
  unlinkSync(STATE_FILE);
  process.exit(0);
}

// Check for completion promise
if (completionPromise) {
  const promiseMatch = lastOutput.match(/<promise>([\s\S]*?)<\/promise>/);
  if (promiseMatch) {
    const promiseText = promiseMatch[1].trim().replace(/\s+/g, ' ');
    if (promiseText === completionPromise) {
      console.log(`✅ DevTeam loop: Detected <promise>${completionPromise}</promise>`);
      unlinkSync(STATE_FILE);
      process.exit(0);
    }
  }
}

// Not complete — continue loop with SAME PROMPT
const nextIteration = iteration + 1;

// Extract prompt (everything after the closing ---)
const afterFrontmatter = stateContent.replace(/^---\n[\s\S]*?\n---\n?/, '');
const promptText = afterFrontmatter.trim();

if (!promptText) {
  console.error('⚠️  DevTeam loop: No prompt text found in state file');
  unlinkSync(STATE_FILE);
  process.exit(0);
}

// Update iteration in state file
const updatedState = stateContent.replace(
  /^iteration:\s*\d+/m,
  `iteration: ${nextIteration}`
);
writeFileSync(STATE_FILE, updatedState, 'utf-8');

// Build system message
const featureInfo = featureName ? ` [${featureName}]` : '';
let systemMsg;
if (completionPromise) {
  systemMsg = `🔄 DevTeam iteration ${nextIteration}${featureInfo} | To stop: output <promise>${completionPromise}</promise> (ONLY when TRUE)`;
} else {
  systemMsg = `🔄 DevTeam iteration ${nextIteration}${featureInfo} | No completion promise set - loop runs infinitely`;
}

// Output JSON to block the stop and feed prompt back
const output = JSON.stringify({
  decision: 'block',
  reason: promptText,
  systemMessage: systemMsg,
});

process.stdout.write(output);
process.exit(0);
