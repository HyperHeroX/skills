---
name: openspec-session-resume
description: |
  🚨 MANDATORY session resume guard. This skill MUST be triggered BEFORE any implementation work when:
  - A conversation is resumed from a summary or transcript
  - There are pending TODO items from a previous session
  - The user asks to "continue", "resume", or "keep going"
  - Dev Lead task .md files exist in docs/tasks/ but have not been processed through OpenSpec

  **PROBLEM IT SOLVES**: When conversations are resumed, agents tend to jump directly to implementation,
  skipping the structured devteam/OpenSpec workflow. This skill acts as a MANDATORY gate that cannot be bypassed.

  **CORE RULE**: Dev Lead produces individual task .md files (be-t001.md, fe-t001.md, etc.).
  Engineers MUST process each task .md through the full OpenSpec lifecycle:
  new → continue/ff → apply → verify → archive
  One task at a time. No skipping. No batching. AI does NOT stop until ALL tasks are completed.
license: MIT
compatibility: Requires openspec CLI and devteam skill.
metadata:
  author: HyperHeroX
  version: "1.0"
  priority: CRITICAL
  triggers:
    - conversation resumed from summary
    - pending TODOs detected
    - user says "continue" or "resume"
    - unprocessed task .md files exist
---

# 🚨 Session Resume Guard (MANDATORY)

This skill is a **NON-NEGOTIABLE** gate that prevents AI from skipping the devteam/OpenSpec workflow when resuming work. It MUST be invoked before ANY implementation work begins in a resumed session.

## Why This Exists

AI agents frequently lose context when resuming from conversation summaries. Common failures include:
- Jumping directly to code implementation without creating OpenSpec changes
- Treating "pending TODOs" as permission to skip structured workflow
- Forgetting that each task .md requires its own OpenSpec lifecycle
- Batching multiple tasks into a single implementation pass

**These failures are PROHIBITED.**

---

## 🔒 Hard Rules (Non-Negotiable)

1. **ONE TASK = ONE OPENSPEC CHANGE**: Each task .md file (be-t001.md, fe-t001.md, etc.) created by Dev Lead MUST have its own OpenSpec change lifecycle.
2. **SEQUENTIAL PROCESSING**: Complete one task's full OpenSpec lifecycle (new → continue/ff → apply → verify → archive) BEFORE starting the next task.
3. **NO DIRECT IMPLEMENTATION**: NEVER modify source code without an active OpenSpec change that corresponds to the current task .md.
4. **NO STOPPING**: AI MUST NOT stop execution until ALL tasks in the current phase are completed, unless a circuit breaker triggers or the user explicitly says "pause/stop".
5. **TASK .MD IS THE SOURCE OF TRUTH**: The task .md files in `docs/tasks/phase{n}/` define WHAT to implement. OpenSpec changes define HOW to track implementation.

---

## Steps

### Step 0: Configuration Sync (AUTO — MUST RUN FIRST)

Before ANY other step, execute the `devteam-config-sync` skill:

1. Check user's `AGENTS.md` and `copilot-instructions.md` for `<!-- DEVTEAM-RULES-START -->` marker
2. If missing → read template from `devteam/references/config-injection/agents-md-injection.md` and append to user's files
3. If outdated → replace the existing block with updated version
4. If file doesn't exist → create it with injection content

This ensures the mandatory rules are always present in the user's project, even across different sessions and conversations.

### Step 1: Detect Resume Context

Check for ANY of these indicators:
- Conversation contains summary references to previous work
- `docs/.devteam/status.json` exists with `current_step >= 7` (implementation phase)
- `docs/tasks/` directory contains task .md files
- TODO list contains pending items from a previous session
- User references a plan file, task breakdown, or previous work

If detected, announce:
```
⚠️ SESSION RESUME DETECTED
Running mandatory OpenSpec workflow checklist before proceeding.
DO NOT skip this step. Process compliance is non-negotiable.
```

### Step 2: Read Current State

1. Read `docs/.devteam/status.json` to determine:
   - Current step and role
   - Which phase is active
   - Which tasks have been completed

2. Check `openspec/changes/` for existing active changes:
   ```bash
   openspec list --json
   ```

3. Scan `docs/tasks/phase{n}/` to find ALL task .md files and their completion status.

### Step 3: Inventory All Task Files

For each phase directory in `docs/tasks/`, catalog every task .md file:

```
## Task Inventory: Phase {N}

### Backend Tasks
| File | Task ID | Status | OpenSpec Change | Action |
|------|---------|--------|-----------------|--------|
| be-t001.md | be-t001 | ⬜ Not started | (none) | Create change |
| be-t001-st001.md | be-t001-st001 | ⬜ Not started | (none) | Create change |

### Frontend Tasks
| File | Task ID | Status | OpenSpec Change | Action |
|------|---------|--------|-----------------|--------|
| fe-t001.md | fe-t001 | ⬜ Not started | (none) | Create change |

### Database Tasks
| File | Task ID | Status | OpenSpec Change | Action |
|------|---------|--------|-----------------|--------|
| db-t001.md | db-t001 | ⬜ Not started | (none) | Create change |

### Test Tasks
| File | Task ID | Status | OpenSpec Change | Action |
|------|---------|--------|-----------------|--------|
| test-t001.md | test-t001 | ⬜ Not started | (none) | Create change |

### CI/CD Tasks
| File | Task ID | Status | OpenSpec Change | Action |
|------|---------|--------|-----------------|--------|
| cicd-t001.md | cicd-t001 | ⬜ Not started | (none) | Create change |
```

Status determination:
- ⬜ Not started: No corresponding OpenSpec change exists
- 🔄 In progress: OpenSpec change exists but not archived
- ✅ Completed: OpenSpec change has been archived AND task .md marked complete

### Step 4: Map Tasks to OpenSpec Changes

For each unfinished task:
- If an OpenSpec change already exists → verify its status and resume from the correct point
- If NO change exists → this task needs `openspec-new-change` before any implementation

### Step 5: Determine Execution Order

Follow the MANDATORY engineer execution order defined in `devteam/references/workflow.md`:

```
Phase N Execution Order:
1. Backend Engineer: ALL be-t{nnn}.md + db-t{nnn}.md (sequential)
2. Frontend Engineer: ALL fe-t{nnn}.md (sequential, MUST use ui-ux-pro-max)
3. Test Engineer: ALL test-t{nnn}.md (sequential, MUST use Playwright + chrome-devtools-mcp)
4. CI/CD Engineer: ALL cicd-t{nnn}.md (sequential)
```

### Step 6: Generate Execution Plan

Present the ordered execution plan:

```
## 📋 Session Resume: Execution Plan

### Current State
- devteam Step: {N} ({ROLE})
- Active Phase: phase{N}
- Tasks Completed: {X}/{TOTAL}
- Active OpenSpec Changes: {list}

### Execution Queue (in order)

#### Backend Tasks (Engineer: Backend)
1. 📄 be-t001.md → `/opsx:new be-t001-<description>` → apply → verify → archive
2. 📄 be-t001-st001.md → `/opsx:new be-t001-st001-<description>` → apply → verify → archive
...

#### Frontend Tasks (Engineer: Frontend)
3. 📄 fe-t001.md → `/opsx:new fe-t001-<description>` → apply → verify → archive
...

#### Test Tasks (Engineer: QA)
4. 📄 test-t001.md → `/opsx:new test-t001-<description>` → apply → verify → archive
...

#### CI/CD Tasks (Engineer: CI/CD)
5. 📄 cicd-t001.md → `/opsx:new cicd-t001-<description>` → apply → verify → archive
...

### ⚡ Auto-Continue Mode: ON
AI will NOT stop until all tasks above are completed.
Interrupt only with explicit "pause" or "stop" command.
```

### Step 7: Get User Confirmation

Use MCP feedback or AskUserQuestion to confirm:
> "I've mapped all pending tasks to OpenSpec changes. Execution plan above.
> The AI will process each task sequentially through the full OpenSpec lifecycle and will NOT stop until all tasks are completed.
>
> A) Proceed as planned (recommended)
> B) Adjust task order or skip specific tasks
> C) Other approach"

### Step 8: Begin Execution (Auto-Continue Loop)

After user confirmation, execute the following loop for EACH task:

```
📍 TASK EXECUTION LOOP (per task .md file)
┌────────────────────────────────────────────────────┐
│ 1. Read task .md file content                      │
│ 2. /opsx:new <task-id>-<description>               │
│ 3. /opsx:continue (or /opsx:ff if clear)           │
│    → Create: proposal → specs → design → tasks     │
│ 4. /opsx:apply <task-id>-<description>             │
│    → Implement all sub-tasks in OpenSpec tasks.md   │
│ 5. /opsx:verify <task-id>-<description>            │
│    → Validate implementation matches artifacts     │
│ 6. /opsx:archive <task-id>-<description>           │
│    → Archive completed change                      │
│ 7. Mark task .md as complete                       │
│ 8. Move to NEXT task .md → repeat from step 1     │
│                                                    │
│ ⚠️ DO NOT STOP between tasks unless:              │
│    - Circuit breaker triggers (3x same error)      │
│    - User explicitly says "pause" or "stop"        │
│    - Unresolvable blocker encountered              │
└────────────────────────────────────────────────────┘
```

---

## Output

After the checklist is complete, show:
- Number of pending tasks identified
- Number of OpenSpec changes to create
- Execution plan with full order
- Estimated workflow (tasks × OpenSpec lifecycle)
- Await user confirmation, then begin auto-continue loop

---

## 🛡️ Guardrails (CRITICAL)

### NEVER do these:
- ❌ Skip this checklist when resuming a session with pending work
- ❌ Start implementing code without an active OpenSpec change
- ❌ Process multiple tasks simultaneously (one at a time only)
- ❌ Archive a change before verification passes
- ❌ Stop between tasks unless circuit breaker or user pause

### ALWAYS do these:
- ✅ Read `docs/.devteam/status.json` at session start
- ✅ Read AGENTS.md and devteam SKILL.md at session start to refresh on rules
- ✅ Scan `docs/tasks/` to find all task .md files
- ✅ Create one OpenSpec change per task .md file
- ✅ Follow the full lifecycle: new → continue → apply → verify → archive
- ✅ Follow the engineer execution order: BE → FE → Test → CI/CD
- ✅ Continue processing tasks until ALL are done

### If user explicitly says "skip OpenSpec":
- Note the deviation in session history
- Comply but log: "⚠️ OpenSpec workflow skipped per user request for task {X}"
- Resume OpenSpec workflow for subsequent tasks unless user says otherwise

### If `openspec` CLI is not available:
- Report the issue via MCP
- Fall back to manual tracking but maintain the same sequential discipline
- Document all changes that would have been OpenSpec changes

---

## Integration with devteam Workflow

This skill bridges the gap between devteam state management and OpenSpec artifact workflow:

| devteam State | This Skill's Action |
|---------------|---------------------|
| Step 7 (Backend) | Process all be-t{nnn}.md + db-t{nnn}.md via OpenSpec |
| Step 8 (Frontend) | Process all fe-t{nnn}.md via OpenSpec |
| Step 9 (Testing) | Process all test-t{nnn}.md via OpenSpec |
| Step 11 (CI/CD) | Process all cicd-t{nnn}.md via OpenSpec |

### Task .md → OpenSpec Change Naming Convention

| Task File | OpenSpec Change Name |
|-----------|---------------------|
| `be-t001.md` (User Registration API) | `be-t001-user-registration-api` |
| `be-t001-st001.md` (Input Validation) | `be-t001-st001-input-validation` |
| `fe-t001.md` (Login Page) | `fe-t001-login-page` |
| `db-t001.md` (User Schema) | `db-t001-user-schema` |
| `test-t001.md` (Login E2E) | `test-t001-login-e2e` |
| `cicd-t001.md` (Stage Deploy) | `cicd-t001-stage-deploy` |

---

## Anti-Amnesia Reinforcement

To prevent future AI from "forgetting" this skill:

1. **AGENTS.md §8.0** mandates this skill at session resume
2. **copilot-instructions.md §8.0** duplicates the mandate
3. **devteam/references/workflow.md** references this skill in session resume section
4. **devteam/SKILL.md** lists this skill as a dependency for resume operations
5. **devteam/references/devteam-continue.md** triggers this skill check
6. **devteam-config-sync** skill auto-injects rules into user's files if missing
7. **devteam/references/config-injection/** contains the injection template

The rule is embedded in **SEVEN** separate locations to ensure no AI can miss it.

Even if the user's `AGENTS.md` / `copilot-instructions.md` don't originally contain these rules,
the `devteam-config-sync` skill (Step 0) will automatically inject them before any workflow begins.
