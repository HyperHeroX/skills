#!/usr/bin/env node

/**
 * Ralph Loop Setup Script (Node.js cross-platform)
 * Creates state file for in-session Ralph loop.
 *
 * Ported from setup-ralph-loop.sh for Windows/Linux/macOS compatibility.
 */

import { writeFileSync, mkdirSync } from 'node:fs';
import { join } from 'node:path';

const args = process.argv.slice(2);

// Parse arguments
let maxIterations = 0;
let completionPromise = null;
const promptParts = [];

function showHelp() {
  console.log(`Ralph Loop - Interactive self-referential development loop

USAGE:
  /ralph-loop [PROMPT...] [OPTIONS]

ARGUMENTS:
  PROMPT...    Initial prompt to start the loop (can be multiple words without quotes)

OPTIONS:
  --max-iterations <n>           Maximum iterations before auto-stop (default: unlimited)
  --completion-promise '<text>'  Promise phrase (USE QUOTES for multi-word)
  -h, --help                     Show this help message

DESCRIPTION:
  Starts a Ralph Loop in your CURRENT session. The stop hook prevents
  exit and feeds your output back as input until completion or iteration limit.

  To signal completion, you must output: <promise>YOUR_PHRASE</promise>

  Use this for:
  - Interactive iteration where you want to see progress
  - Tasks requiring self-correction and refinement
  - Learning how Ralph works

EXAMPLES:
  /ralph-loop Build a todo API --completion-promise 'DONE' --max-iterations 20
  /ralph-loop --max-iterations 10 Fix the auth bug
  /ralph-loop Refactor cache layer  (runs forever)
  /ralph-loop --completion-promise 'TASK COMPLETE' Create a REST API

STOPPING:
  Only by reaching --max-iterations or detecting --completion-promise
  No manual stop - Ralph runs infinitely by default!

MONITORING:
  # View current iteration:
  grep '^iteration:' .claude/ralph-loop.local.md

  # View full state:
  head -10 .claude/ralph-loop.local.md`);
  process.exit(0);
}

let i = 0;
while (i < args.length) {
  const arg = args[i];
  switch (arg) {
    case '-h':
    case '--help':
      showHelp();
      break;
    case '--max-iterations': {
      const val = args[i + 1];
      if (!val || !/^\d+$/.test(val)) {
        console.error(`❌ Error: --max-iterations requires a positive integer, got: ${val || '(nothing)'}`);
        process.exit(1);
      }
      maxIterations = parseInt(val, 10);
      i += 2;
      break;
    }
    case '--completion-promise': {
      const val = args[i + 1];
      if (!val) {
        console.error('❌ Error: --completion-promise requires a text argument');
        process.exit(1);
      }
      completionPromise = val;
      i += 2;
      break;
    }
    default:
      promptParts.push(arg);
      i++;
      break;
  }
}

const prompt = promptParts.join(' ');

if (!prompt) {
  console.error(`❌ Error: No prompt provided

   Ralph needs a task description to work on.

   Examples:
     /ralph-loop Build a REST API for todos
     /ralph-loop Fix the auth bug --max-iterations 20
     /ralph-loop --completion-promise 'DONE' Refactor code

   For all options: /ralph-loop --help`);
  process.exit(1);
}

// Create state file
mkdirSync('.claude', { recursive: true });

const promiseYaml = completionPromise ? `"${completionPromise}"` : 'null';
const sessionId = process.env.CLAUDE_CODE_SESSION_ID || '';
const startedAt = new Date().toISOString();

const stateContent = `---
active: true
iteration: 1
session_id: ${sessionId}
max_iterations: ${maxIterations}
completion_promise: ${promiseYaml}
started_at: "${startedAt}"
---

${prompt}
`;

writeFileSync(join('.claude', 'ralph-loop.local.md'), stateContent, 'utf-8');

// Output setup message
const maxDisplay = maxIterations > 0 ? maxIterations : 'unlimited';
const promiseDisplay = completionPromise
  ? `${completionPromise} (ONLY output when TRUE - do not lie!)`
  : 'none (runs forever)';

console.log(`🔄 Ralph loop activated in this session!

Iteration: 1
Max iterations: ${maxDisplay}
Completion promise: ${promiseDisplay}

The stop hook is now active. When you try to exit, the SAME PROMPT will be
fed back to you. You'll see your previous work in files, creating a
self-referential loop where you iteratively improve on the same task.

To monitor: head -10 .claude/ralph-loop.local.md

⚠️  WARNING: This loop cannot be stopped manually! It will run infinitely
    unless you set --max-iterations or --completion-promise.

🔄

${prompt}`);

if (completionPromise) {
  console.log(`
═══════════════════════════════════════════════════════════
CRITICAL - Ralph Loop Completion Promise
═══════════════════════════════════════════════════════════

To complete this loop, output this EXACT text:
  <promise>${completionPromise}</promise>

STRICT REQUIREMENTS (DO NOT VIOLATE):
  ✓ Use <promise> XML tags EXACTLY as shown above
  ✓ The statement MUST be completely and unequivocally TRUE
  ✓ Do NOT output false statements to exit the loop
  ✓ Do NOT lie even if you think you should exit

IMPORTANT - Do not circumvent the loop:
  Even if you believe you're stuck, the task is impossible,
  or you've been running too long - you MUST NOT output a
  false promise statement. The loop is designed to continue
  until the promise is GENUINELY TRUE. Trust the process.

  If the loop should stop, the promise statement will become
  true naturally. Do not force it by lying.
═══════════════════════════════════════════════════════════`);
}
