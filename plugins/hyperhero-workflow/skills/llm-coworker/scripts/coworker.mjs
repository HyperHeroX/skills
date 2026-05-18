#!/usr/bin/env node
// llm-coworker state CLI. 兩端共用，跨平台 (Node 18+).
// 用法見 SKILL.md / references/state-schema.md。

import fs from 'node:fs';
import path from 'node:path';
import os from 'node:os';
import crypto from 'node:crypto';
import process from 'node:process';

const SCHEMA_VERSION = 1;
const HEARTBEAT_TIMEOUT_MS = 5 * 60 * 1000; // 5 分鐘
const LEGAL_TRANSITIONS = {
  initialized: ['implementing', 'failed'],
  implementing: ['awaiting_validation', 'failed'],
  awaiting_validation: ['validating', 'failed'],
  validating: ['approved', 'needs_rework', 'failed'],
  approved: ['implementing', 'completed', 'failed'],
  needs_rework: ['implementing', 'failed'],
  completed: [],
  failed: [],
};

function nowIso() {
  return new Date().toISOString();
}

function sha1Hex(input) {
  return crypto.createHash('sha1').update(input).digest('hex');
}

function projectHash(projectRoot) {
  const normalized = path.resolve(projectRoot).toLowerCase().replace(/\\/g, '/');
  return sha1Hex(normalized).slice(0, 12);
}

function stateDir(projectRoot) {
  return path.join(os.homedir(), '.claude', 'coworker', projectHash(projectRoot));
}

function statePath(projectRoot) {
  return path.join(stateDir(projectRoot), 'state.json');
}

function lockPath(projectRoot) {
  return path.join(stateDir(projectRoot), 'state.lock');
}

function ensureDir(dir) {
  fs.mkdirSync(dir, { recursive: true });
}

async function withLock(projectRoot, fn) {
  const dir = stateDir(projectRoot);
  ensureDir(dir);
  const lock = lockPath(projectRoot);
  const start = Date.now();
  let fd;
  while (true) {
    try {
      fd = fs.openSync(lock, 'wx');
      break;
    } catch (e) {
      if (e.code !== 'EEXIST') throw e;
      if (Date.now() - start > 5000) {
        const err = new Error('STATE_LOCKED: 等不到 lock，可能上次崩潰殘留。試試 `unlock --force`。');
        err.code = 'STATE_LOCKED';
        throw err;
      }
      await new Promise((r) => setTimeout(r, 100));
    }
  }
  try {
    fs.writeSync(fd, String(process.pid));
    return await fn();
  } finally {
    try { fs.closeSync(fd); } catch {}
    try { fs.unlinkSync(lock); } catch {}
  }
}

function readState(projectRoot) {
  const p = statePath(projectRoot);
  if (!fs.existsSync(p)) return null;
  const raw = fs.readFileSync(p, 'utf8');
  const obj = JSON.parse(raw);
  if (obj.version !== SCHEMA_VERSION) {
    throw new Error(`STATE_VERSION_MISMATCH: 中繼檔 version=${obj.version}，本腳本 expects ${SCHEMA_VERSION}`);
  }
  return obj;
}

function writeState(projectRoot, state) {
  state.updated_at = nowIso();
  const p = statePath(projectRoot);
  const tmp = p + '.tmp';
  ensureDir(path.dirname(p));
  fs.writeFileSync(tmp, JSON.stringify(state, null, 2));
  fs.renameSync(tmp, p);
}

function requireState(projectRoot) {
  const s = readState(projectRoot);
  if (!s) {
    throw new Error('NO_STATE: 中繼檔不存在，請先讓 implementer 跑 `init`。');
  }
  return s;
}

function assertTransition(from, to) {
  if (from === to) return;
  const allowed = LEGAL_TRANSITIONS[from] || [];
  if (!allowed.includes(to)) {
    throw new Error(`ILLEGAL_TRANSITION: ${from} → ${to} 不在允許清單 ${JSON.stringify(allowed)}`);
  }
}

function pushHistory(state, actor, event, ref = null) {
  state.history.push({ ts: nowIso(), actor, event, ref });
}

function parseArgs(argv) {
  const opts = {};
  const positional = [];
  const reworkRefs = [];
  for (let i = 0; i < argv.length; i++) {
    const a = argv[i];
    if (a.startsWith('--')) {
      const key = a.slice(2);
      const next = argv[i + 1];
      if (next === undefined || next.startsWith('--')) {
        opts[key] = true;
      } else {
        if (key === 'rework-ref') {
          reworkRefs.push(next);
        } else {
          opts[key] = next;
        }
        i++;
      }
    } else {
      positional.push(a);
    }
  }
  if (reworkRefs.length) opts['rework-ref'] = reworkRefs;
  return { opts, positional };
}

function resolveProjectRoot(opts) {
  return path.resolve(opts['project-root'] || process.cwd());
}

function ago(ts) {
  if (!ts) return 'never';
  const ms = Date.now() - new Date(ts).getTime();
  if (ms < 60000) return `${Math.floor(ms / 1000)}s ago`;
  if (ms < 3600000) return `${Math.floor(ms / 60000)}m ago`;
  return `${Math.floor(ms / 3600000)}h ago`;
}

// ---------- commands ----------

async function cmdInit(opts) {
  const projectRoot = resolveProjectRoot(opts);
  await withLock(projectRoot, () => {
    const existing = readState(projectRoot);
    if (existing && existing.status !== 'completed' && existing.status !== 'failed' && !opts.force) {
      throw new Error(`ALREADY_INITIALIZED: state 已存在於 ${statePath(projectRoot)}（status=${existing.status}）。若確定要重建，加 --force。`);
    }
    const title = opts.title || (existing && existing.task_brief?.title) || 'untitled-task';
    const slug = (opts['session-id'] || `${new Date().toISOString().slice(0, 10)}-${title.toLowerCase().replace(/[^a-z0-9]+/g, '-').replace(/^-|-$/g, '').slice(0, 40)}`);
    const remaining = (opts.tasks ? String(opts.tasks).split('|').map((s) => s.trim()).filter(Boolean) : []);
    const state = {
      version: SCHEMA_VERSION,
      session_id: slug,
      project_root: projectRoot,
      project_hash: projectHash(projectRoot),
      created_at: nowIso(),
      updated_at: nowIso(),
      status: 'initialized',
      current_iteration: 1,
      implementer: { model_label: null, session_label: null, last_heartbeat: null },
      validator: { model_label: null, session_label: null, last_heartbeat: null },
      task_brief: {
        title,
        description: opts.description || '',
        source_plan_path: opts.plan || null,
      },
      remaining_tasks: remaining,
      completed_unverified: [],
      completed_verified: [],
      current_work_item: null,
      last_validation: { verdict: null, report_path: null, rework_reference_files: [], validated_at: null },
      history: [],
    };
    pushHistory(state, 'implementer', 'initialized', null);
    writeState(projectRoot, state);
    console.log(JSON.stringify({ ok: true, state_path: statePath(projectRoot), session_id: state.session_id }, null, 2));
  });
}

async function cmdGet(opts) {
  const projectRoot = resolveProjectRoot(opts);
  const s = requireState(projectRoot);
  if (opts.field) {
    const parts = String(opts.field).split('.');
    let cur = s;
    for (const p of parts) cur = cur?.[p];
    if (cur === undefined || cur === null) {
      console.log('');
    } else if (typeof cur === 'object') {
      console.log(JSON.stringify(cur));
    } else {
      console.log(String(cur));
    }
    return;
  }
  if (opts.pretty) {
    console.log(`session_id      : ${s.session_id}`);
    console.log(`status          : ${s.status} (iter ${s.current_iteration})`);
    console.log(`project_root    : ${s.project_root}`);
    console.log(`task            : ${s.task_brief.title}`);
    console.log(`remaining       : ${s.remaining_tasks.join(', ') || '(none)'}`);
    console.log(`verified done   : ${s.completed_verified.join(', ') || '(none)'}`);
    console.log(`current work    : ${s.current_work_item ? s.current_work_item.slug : '(none)'}`);
    console.log(`impl heartbeat  : ${ago(s.implementer.last_heartbeat)} (${s.implementer.session_label || '-'})`);
    console.log(`valid heartbeat : ${ago(s.validator.last_heartbeat)} (${s.validator.session_label || '-'})`);
    console.log(`last validation : ${s.last_validation.verdict || '(none)'} @ ${s.last_validation.report_path || '-'}`);
    return;
  }
  console.log(JSON.stringify(s, null, 2));
}

async function cmdPath(opts) {
  const projectRoot = resolveProjectRoot(opts);
  console.log(statePath(projectRoot));
}

async function cmdSetStatus(opts, positional) {
  const projectRoot = resolveProjectRoot(opts);
  const target = positional[0];
  if (!target) throw new Error('USAGE: set-status <status>');
  await withLock(projectRoot, () => {
    const s = requireState(projectRoot);
    assertTransition(s.status, target);
    s.status = target;
    pushHistory(s, opts.actor || 'unknown', `status_${target}`, null);
    writeState(projectRoot, s);
    console.log(JSON.stringify({ ok: true, status: target }));
  });
}

async function cmdClaim(role, opts) {
  if (!['implementer', 'validator'].includes(role)) throw new Error('USAGE: claim-implementer | claim-validator');
  const projectRoot = resolveProjectRoot(opts);
  await withLock(projectRoot, () => {
    const s = requireState(projectRoot);
    const slot = s[role];
    if (!opts.force && slot.last_heartbeat) {
      const age = Date.now() - new Date(slot.last_heartbeat).getTime();
      if (age < HEARTBEAT_TIMEOUT_MS && slot.session_label && slot.session_label !== opts['session-label']) {
        const err = new Error(`ANOTHER_${role.toUpperCase()}_ACTIVE: ${slot.session_label} 最後 heartbeat ${Math.floor(age / 1000)}s 前。要踢掉的話加 --force。`);
        err.exitCode = 2;
        throw err;
      }
    }
    if (opts.force && slot.session_label && slot.session_label !== opts['session-label']) {
      pushHistory(s, role, `${role}_replaced`, slot.session_label);
    }
    slot.model_label = opts['model-label'] || slot.model_label || null;
    slot.session_label = opts['session-label'] || `${role}-${Date.now()}`;
    slot.last_heartbeat = nowIso();
    pushHistory(s, role, `${role}_claimed`, slot.session_label);
    writeState(projectRoot, s);
    console.log(JSON.stringify({ ok: true, role, session_label: slot.session_label }));
  });
}

async function cmdHeartbeat(opts) {
  const role = opts.role;
  if (!['implementer', 'validator'].includes(role)) throw new Error('USAGE: heartbeat --role implementer|validator');
  const projectRoot = resolveProjectRoot(opts);
  await withLock(projectRoot, () => {
    const s = requireState(projectRoot);
    s[role].last_heartbeat = nowIso();
    writeState(projectRoot, s);
  });
}

async function cmdStartWork(opts) {
  const projectRoot = resolveProjectRoot(opts);
  const title = opts.title;
  const slug = opts.slug || (title && title.toLowerCase().replace(/[^a-z0-9]+/g, '-').replace(/^-|-$/g, ''));
  if (!title || !slug) throw new Error('USAGE: start-work --title "..." [--slug ...]');
  await withLock(projectRoot, () => {
    const s = requireState(projectRoot);
    if (!['initialized', 'approved', 'needs_rework'].includes(s.status)) {
      throw new Error(`CANNOT_START_WORK_FROM: ${s.status}`);
    }
    if (s.status === 'needs_rework') {
      s.current_iteration += 1;
    } else {
      s.current_iteration = 1;
      // 把 slug 從 remaining 取出（若有）
      s.remaining_tasks = s.remaining_tasks.filter((t) => t !== slug);
    }
    s.current_work_item = {
      title,
      slug,
      started_at: nowIso(),
      implementation_report: null,
    };
    s.status = 'implementing';
    s.implementer.last_heartbeat = nowIso();
    pushHistory(s, 'implementer', 'started_work', slug);
    writeState(projectRoot, s);
    console.log(JSON.stringify({ ok: true, slug, iteration: s.current_iteration }));
  });
}

async function cmdReportImplementation(opts) {
  const report = opts.report;
  if (!report) throw new Error('USAGE: report-implementation --report <path>');
  const projectRoot = resolveProjectRoot(opts);
  await withLock(projectRoot, () => {
    const s = requireState(projectRoot);
    if (s.status !== 'implementing') throw new Error(`CANNOT_REPORT_FROM: ${s.status}`);
    if (!s.current_work_item) throw new Error('NO_CURRENT_WORK_ITEM');
    s.current_work_item.implementation_report = report;
    s.status = 'awaiting_validation';
    s.implementer.last_heartbeat = nowIso();
    pushHistory(s, 'implementer', 'reported', report);
    writeState(projectRoot, s);
    console.log(JSON.stringify({ ok: true, status: s.status, report }));
  });
}

async function cmdAmendCurrentWork(opts) {
  const projectRoot = resolveProjectRoot(opts);
  await withLock(projectRoot, () => {
    const s = requireState(projectRoot);
    if (!s.current_work_item) throw new Error('NO_CURRENT_WORK_ITEM');
    if (opts.report) s.current_work_item.implementation_report = opts.report;
    if (opts.title) s.current_work_item.title = opts.title;
    pushHistory(s, 'implementer', 'amended_current_work', opts.report || opts.title || null);
    writeState(projectRoot, s);
    console.log(JSON.stringify({ ok: true, current_work_item: s.current_work_item }));
  });
}

async function cmdReportValidation(opts) {
  const verdict = opts.verdict;
  const report = opts.report;
  const refs = opts['rework-ref'] ? (Array.isArray(opts['rework-ref']) ? opts['rework-ref'] : [opts['rework-ref']]) : [];
  if (!['pass', 'rework'].includes(verdict)) throw new Error('USAGE: report-validation --verdict pass|rework --report <path> [--rework-ref <path>]*');
  if (!report) throw new Error('--report is required');
  const projectRoot = resolveProjectRoot(opts);
  await withLock(projectRoot, () => {
    const s = requireState(projectRoot);
    if (s.status !== 'validating') throw new Error(`CANNOT_VALIDATE_FROM: ${s.status}`);
    s.last_validation = {
      verdict,
      report_path: report,
      rework_reference_files: refs.length ? refs : [report],
      validated_at: nowIso(),
    };
    s.validator.last_heartbeat = nowIso();
    if (verdict === 'pass') {
      s.status = 'approved';
      if (s.current_work_item) {
        s.completed_unverified.push(s.current_work_item.slug);
      }
      pushHistory(s, 'validator', 'validated_pass', report);
    } else {
      s.status = 'needs_rework';
      pushHistory(s, 'validator', 'validated_rework', report);
    }
    writeState(projectRoot, s);
    console.log(JSON.stringify({ ok: true, status: s.status, verdict }));
  });
}

async function cmdNextWork(opts) {
  const projectRoot = resolveProjectRoot(opts);
  await withLock(projectRoot, () => {
    const s = requireState(projectRoot);
    if (s.status !== 'approved') throw new Error(`CANNOT_NEXT_FROM: ${s.status}`);
    if (s.current_work_item) {
      const slug = s.current_work_item.slug;
      s.completed_unverified = s.completed_unverified.filter((t) => t !== slug);
      if (!s.completed_verified.includes(slug)) s.completed_verified.push(slug);
      s.current_work_item = null;
    }
    if (s.remaining_tasks.length === 0) {
      s.status = 'completed';
      pushHistory(s, 'implementer', 'all_completed', null);
    } else {
      s.status = 'initialized'; // 讓下一次 start-work 從 initialized 進 implementing
      pushHistory(s, 'implementer', 'work_advanced', null);
    }
    writeState(projectRoot, s);
    console.log(JSON.stringify({ ok: true, status: s.status, remaining: s.remaining_tasks }));
  });
}

async function cmdWaitFor(opts) {
  const target = opts.status;
  const timeoutMs = (Number(opts.timeout) || 60) * 1000;
  if (!target) throw new Error('USAGE: wait-for --status <status> [--timeout <seconds>]');
  const projectRoot = resolveProjectRoot(opts);
  const targets = String(target).split('|');
  const deadline = Date.now() + timeoutMs;
  while (Date.now() < deadline) {
    const s = readState(projectRoot);
    if (s && targets.includes(s.status)) {
      console.log(JSON.stringify({ ok: true, status: s.status }));
      return;
    }
    await new Promise((r) => setTimeout(r, 2000));
  }
  console.log(JSON.stringify({ ok: false, reason: 'timeout', target: targets }));
  process.exitCode = 124;
}

async function cmdDoctor(opts) {
  const projectRoot = resolveProjectRoot(opts);
  const s = readState(projectRoot);
  const out = {
    cwd: process.cwd(),
    project_root: projectRoot,
    expected_hash: projectHash(projectRoot),
    state_path: statePath(projectRoot),
    state_exists: !!s,
    state_hash: s?.project_hash || null,
    state_project_root: s?.project_root || null,
    status: s?.status || null,
    impl_heartbeat: s?.implementer?.last_heartbeat ? ago(s.implementer.last_heartbeat) : null,
    valid_heartbeat: s?.validator?.last_heartbeat ? ago(s.validator.last_heartbeat) : null,
    hash_match: s ? s.project_hash === projectHash(projectRoot) : null,
  };
  console.log(JSON.stringify(out, null, 2));
}

async function cmdUnlock(opts) {
  const projectRoot = resolveProjectRoot(opts);
  const lp = lockPath(projectRoot);
  if (!fs.existsSync(lp)) {
    console.log(JSON.stringify({ ok: true, removed: false }));
    return;
  }
  if (!opts.force) throw new Error('REFUSED: lock 存在；確認沒人在寫之後加 --force');
  fs.unlinkSync(lp);
  console.log(JSON.stringify({ ok: true, removed: true }));
}

async function cmdUse(opts) {
  // 提供 validator 顯式對齊 project_root 的場景：印出 hash 與 state path
  const projectRoot = resolveProjectRoot(opts);
  console.log(JSON.stringify({ project_root: projectRoot, project_hash: projectHash(projectRoot), state_path: statePath(projectRoot) }, null, 2));
}

// ---------- main ----------

const HELP = `llm-coworker state CLI

USAGE:
  node coworker.mjs <command> [--project-root <path>] [...flags]

COMMANDS:
  init               implementer 開場建立 state
                     flags: --title --description --plan --tasks "a|b|c" --session-id --force
  get                印 state；可加 --field <dotted.path> --pretty
  path               印 state.json 絕對路徑
  doctor             印環境/state 對齊診斷
  use                顯式給 project_root，印出 hash 與 state path（debug 用）

  claim-implementer  --session-label X [--model-label Y] [--force]
  claim-validator    --session-label X [--model-label Y] [--force]
  heartbeat          --role implementer|validator

  start-work         --title "..." [--slug ...]
  amend-current-work [--report <path>] [--title "..."]
  report-implementation --report <path>
  report-validation  --verdict pass|rework --report <path> [--rework-ref <p>]*
  next-work          approved 後推進到下一個 work item（或標 completed）

  set-status <s>     [--actor implementer|validator]
  wait-for           --status awaiting_validation|implementing|... [--timeout 60]
  unlock             [--force]

EXIT CODES:
  0   ok
  1   一般錯誤
  2   claim 拒絕 (另一端還活著，加 --force 或等心跳過期)
  124 wait-for timeout
`;

async function main() {
  const [, , cmd, ...rest] = process.argv;
  if (!cmd || cmd === '--help' || cmd === '-h') {
    console.log(HELP);
    return;
  }
  const { opts, positional } = parseArgs(rest);
  try {
    switch (cmd) {
      case 'init': return await cmdInit(opts);
      case 'get': return await cmdGet(opts);
      case 'path': return await cmdPath(opts);
      case 'doctor': return await cmdDoctor(opts);
      case 'use': return await cmdUse(opts);
      case 'claim-implementer': return await cmdClaim('implementer', opts);
      case 'claim-validator': return await cmdClaim('validator', opts);
      case 'heartbeat': return await cmdHeartbeat(opts);
      case 'start-work': return await cmdStartWork(opts);
      case 'amend-current-work': return await cmdAmendCurrentWork(opts);
      case 'report-implementation': return await cmdReportImplementation(opts);
      case 'report-validation': return await cmdReportValidation(opts);
      case 'next-work': return await cmdNextWork(opts);
      case 'set-status': return await cmdSetStatus(opts, positional);
      case 'wait-for': return await cmdWaitFor(opts);
      case 'unlock': return await cmdUnlock(opts);
      default:
        console.error(`unknown command: ${cmd}`);
        console.error(HELP);
        process.exitCode = 1;
    }
  } catch (e) {
    console.error(`ERROR: ${e.message}`);
    process.exitCode = e.exitCode || 1;
  }
}

main();
