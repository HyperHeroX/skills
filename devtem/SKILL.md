# Development Team Simulation Skill (devtem)

## Description
This skill simulates a complete software development lifecycle with **autonomous continuous operation**. It assigns specific roles and responsibilities to the AI at each stage, ensures structured workflows from requirement gathering to deployment, and includes intelligent state management for session continuity across conversations.

**Key Features:**
- 🔄 **State Management System** - Persistent state files for session continuity
- 🧠 **Intelligent Exit Detection** - Dual-condition exit gate (indicators + explicit signal)
- 📊 **Response Analysis** - Pattern-based completion and stagnation detection
- 🔁 **Session Continuity** - Seamless resume across conversations
- 🎯 **Autonomous Loop Protocol** - Self-continuing execution until task completion

---

## 🎯 Autonomous Continuous Operation

This skill implements an **Autonomous Loop Protocol** that works across all IDEs supporting the Agent Skills standard.

### Operating Modes

| Mode | Scope | Mechanism | IDE Support |
|------|-------|-----------|-------------|
| **Universal** | Core | State Files + Directive Protocol | ✅ All IDEs |
| **Advanced** | Plugin | Stop Hook (optional) | Claude Code only |

### Universal Mode (All IDEs)

The Universal Mode uses a **Directive-Based Loop Protocol** embedded directly in SKILL.md:

#### 1. Initialization
```
/devtem <feature-name>
```
- Creates `docs/.devtem/status.json` with step=1
- Creates `docs/.devtem/circuit_breaker.json` with state=CLOSED
- AI begins Step 1 execution

#### 2. Continuation Protocol (CRITICAL)

**After EVERY step completion, the AI MUST:**

```markdown
📍 STEP COMPLETION CHECK (Mandatory Protocol)
1. READ `docs/.devtem/status.json`
2. IF current_step <= 11 AND exit_signal == false:
   → INCREMENT current_step
   → SAVE state
   → IMMEDIATELY CONTINUE to next step
   → DO NOT wait for user input
3. IF current_step > 11 AND all_tests_pass:
   → SET exit_signal = true
   → OUTPUT completion status
   → HALT and await user
```

#### 3. Circuit Breaker Protection

When stagnation detected (same error 3+ times):
```markdown
🚫 CIRCUIT BREAKER TRIGGERED
- HALT autonomous execution
- REPORT via MCP: "Circuit breaker OPEN - {reason}"
- AWAIT user input: "continue" / "reset" / "abort"
```

#### 4. Session Recovery

When resuming a session:
```markdown
🔄 SESSION RECOVERY PROTOCOL
1. READ `docs/.devtem/status.json`
2. IF exists AND exit_signal == false:
   → ANNOUNCE: "Resuming Step {N} as {ROLE}"
   → CONTINUE from current_step
3. IF not exists:
   → START fresh session at Step 1
```

### Advanced Mode (Claude Code Plugin)

For Claude Code users, an optional Stop Hook provides automated enforcement:

- **Hook Location**: `devtem/hooks/stop-hook.sh`
- **Config Location**: `devtem/hooks/hooks.json`
- **Mechanism**: Intercepts exit attempts and feeds prompt back

See [devtem/lib/hooks.md](lib/hooks.md) for detailed hook documentation.

---

### Completion Signal Format

When all 11 steps complete and all tests pass, output:

```
---DEVTEM_STATUS---
STATUS: COMPLETE
STEPS_COMPLETED: 11/11
TASKS_REMAINING: 0
TESTS_PASSING: 100%
EXIT_SIGNAL: true
---END_DEVTEM_STATUS---
```

### Safety Mechanisms

| Mechanism | Purpose | Mode |
|-----------|---------|------|
| State Files | Track progress, enable resume | Universal |
| Circuit Breaker | Halt on stagnation (3 cycles) | Universal |
| Exit Signal | Explicit completion marker | Universal |
| Stop Hook | Automated enforcement (optional) | Plugin |

---

## 🚨 Non-Negotiable Operational Directives

These rules apply throughout the **entire** simulation process and **override** any conflicting instructions:

1. **OpenSpec Integration**: Use `openspec` CLI for change management.
   - Initialize: `openspec new change "<name>"`
   - Track: `openspec status` and `openspec next`
   - Archive: `openspec archive`
2. **Serena MCP First**: All source code exploration must use `mcp_oraios_serena_*` tools.
3. **MCP-Only Communication**: All progress/questions/reports via `mcp_user-feedback_collect_feedback`.
4. **Strict Formatting**: Documents must adhere to `devtem/reference/FormatSample`.
5. **UI/UX Standards**: UI work must consult `ui-ux-pro-max` skill.
6. **Pre-Commit Checks**: No code committed without passing build, unit tests, and E2E tests.
7. **Hook Protocol**: Execute pre-step and post-step hooks for every step (see `devtem/lib/hooks.md`).

---

## � Claude Hook System (Autonomous Operation Engine)

The devtem skill implements a **Hook System** inspired by [ralph-claude-code](https://github.com/frankbria/ralph-claude-code) for robust autonomous operation.

### Core Components

| Component | File | Purpose |
|-----------|------|---------|
| Circuit Breaker | `devtem/lib/circuit_breaker.json` | Prevents runaway loops, state machine (CLOSED/HALF_OPEN/OPEN) |
| Response Analyzer | `devtem/lib/response_analyzer.json` | Intelligent completion/stagnation detection |
| Hook Definitions | `devtem/lib/hooks.md` | Complete hook lifecycle documentation |

### Hook Lifecycle Diagram

```
┌─────────────────────────────────────────────────────────────────┐
│                    DEVTEM HOOK LIFECYCLE                        │
├─────────────────────────────────────────────────────────────────┤
│  ┌──────────────┐     ┌──────────────┐     ┌──────────────┐    │
│  │  PRE-STEP    │ ──► │  EXECUTE     │ ──► │  POST-STEP   │    │
│  │  HOOKS       │     │  STEP        │     │  HOOKS       │    │
│  └──────────────┘     └──────────────┘     └──────────────┘    │
│         │                    │                    │             │
│         ▼                    ▼                    ▼             │
│  • Load State          • Role Check         • Analyze Response │
│  • Check CB            • Execute Actions    • Update CB        │
│  • Validate            • Generate Output    • Save State       │
│                                             • Check Exit       │
└─────────────────────────────────────────────────────────────────┘
```

### Pre-Step Hooks (Execute Before Every Step)

```markdown
**MANDATORY Pre-Step Protocol**:
1. 📂 READ `docs/.devtem/status.json` → Load current state
2. 🔌 READ `docs/.devtem/circuit_breaker.json` → Check CB state
3. 🚫 IF CB.state == "OPEN":
      → HALT execution
      → REPORT via MCP: "Circuit breaker OPEN - require user intervention"
      → AWAIT user "continue" or "reset"
4. ✅ VALIDATE prerequisites for current step
5. 🎭 ANNOUNCE: "Acting as: [ROLE]"
```

### Post-Step Hooks (Execute After Every Step)

```markdown
**MANDATORY Post-Step Protocol**:
1. 📊 ANALYZE step output:
      - Check for completion patterns (see response_analyzer.json)
      - Check for progress indicators
      - Check for stagnation patterns
2. 🔄 UPDATE `docs/.devtem/circuit_breaker.json`:
      - IF progress detected → Reset no_progress counter
      - IF no progress → Increment no_progress counter
      - IF threshold breached → Transition state
3. 💾 SAVE state to `docs/.devtem/status.json`
4. 📝 APPEND to `docs/.devtem/progress_tracker.md`
5. 🚦 CHECK exit conditions (see Exit Detection Algorithm)
6. 📢 IF milestone OR blocker → REPORT via MCP
7. ➡️ IF continue → PROCEED to next step
```

### Circuit Breaker State Machine

```
         ┌──────────────────────────────────────────┐
         │                                          │
         ▼                                          │
    ┌─────────┐   no_progress >= 2   ┌───────────┐ │
    │ CLOSED  │ ─────────────────►   │ HALF_OPEN │ │
    └─────────┘                      └───────────┘ │
         ▲                                │        │
         │ progress_detected              │        │
         └────────────────────────────────┘        │
                                                   │
         no_progress >= 1 (in HALF_OPEN)           │
         OR no_progress >= 3 (from CLOSED)         │
         OR same_error >= 5                        │
                          │                        │
                          ▼                        │
                     ┌─────────┐                   │
                     │  OPEN   │ ─── user_reset ───┘
                     └─────────┘
                          │
                          ▼
                  🚫 HALT EXECUTION
                  📢 REPORT VIA MCP
                  ⏳ AWAIT USER INPUT
```

### Exit Detection Algorithm (Dual-Condition Gate)

**Exit requires BOTH conditions:**
1. `completion_indicators >= 2` (pattern-based detection)
2. `EXIT_SIGNAL == true` (explicit signal in status)

```python
def should_exit_gracefully():
    # Load signals from docs/.devtem/exit_signals.json
    signals = load_exit_signals()
    
    # Priority 1: Never exit if blocked
    if signals.blocked:
        return "continue"
    
    # Priority 2: Test saturation (3+ test-only iterations)
    if len(signals.test_only_loops) >= 3:
        return "test_saturation"
    
    # Priority 3: Multiple done signals
    if len(signals.done_signals) >= 2:
        return "completion_signals"
    
    # Priority 4: Completion indicators WITH explicit EXIT_SIGNAL
    if len(signals.completion_indicators) >= 2:
        status = load_status()
        if status.exit_signal == True:
            return "project_complete"  # ✅ EXIT
        else:
            return "continue"  # ⚠️ High confidence but explicit signal=false
    
    # Priority 5: All steps complete
    if status.current_step > 11 and all_tasks_done():
        return "workflow_complete"
    
    # Default: continue
    return "continue"
```

### Session Recovery Protocol

**On Corrupted/Missing State:**
```
1. DETECT invalid JSON or missing files
2. BACKUP any existing corrupted files to docs/.devtem/backup/
3. INITIALIZE fresh state files
4. REPORT via MCP: "State recovered - starting fresh from Step 1"
```

**On Circuit Breaker OPEN:**
```
1. User says "continue" or "reset"
2. RESET circuit_breaker.json to CLOSED
3. CLEAR consecutive counters
4. LOG transition to session_history.md
5. ANNOUNCE: "🔄 Circuit breaker reset - resuming execution"
6. PROCEED with next step
```

---

## �🔄 Autonomous Operation & Session Continuity

### State Management Files
The skill uses state files in `docs/.devtem/` to maintain session continuity:

| File | Purpose |
|------|---------|
| `status.json` | Current workflow state (step, role, phase) |
| `circuit_breaker.json` | Circuit breaker state (CLOSED/HALF_OPEN/OPEN) |
| `exit_signals.json` | Completion indicators and exit conditions |
| `session_history.md` | Log of all session transitions |
| `progress_tracker.md` | Detailed progress across all steps |

### Session Initialization (with Hook System)
At the **start of every conversation**, the AI must execute this protocol:

```
┌─────────────────────────────────────────────────────────────┐
│               SESSION INITIALIZATION PROTOCOL               │
├─────────────────────────────────────────────────────────────┤
│ 1. CHECK docs/.devtem/status.json exists                    │
│    ├─ YES → LOAD state                                      │
│    │        └─ CHECK exit_signal                            │
│    │            ├─ true → "Previous simulation complete"    │
│    │            │         ASK: "Start new simulation?"      │
│    │            └─ false → PROCEED to step 2                │
│    └─ NO → INITIALIZE new session (step 3)                  │
│                                                             │
│ 2. CHECK docs/.devtem/circuit_breaker.json                  │
│    ├─ state == "OPEN" → HALT, REPORT via MCP               │
│    │                     AWAIT user "continue"/"reset"      │
│    └─ state != "OPEN" → PROCEED to step 4                   │
│                                                             │
│ 3. INITIALIZE NEW SESSION:                                  │
│    ├─ CREATE docs/.devtem/ directory                        │
│    ├─ CREATE status.json (step=1, role="Product Manager")   │
│    ├─ CREATE circuit_breaker.json (state="CLOSED")          │
│    ├─ CREATE exit_signals.json (empty arrays)               │
│    └─ ANNOUNCE: "🆕 Starting new DevTem simulation"         │
│                                                             │
│ 4. RESUME EXECUTION:                                        │
│    └─ ANNOUNCE: "🔄 Resuming from Step {N} as {ROLE}"       │
└─────────────────────────────────────────────────────────────┘
```

```json
// docs/.devtem/status.json structure
{
  "session_id": "uuid-v4",
  "current_step": 1,
  "current_role": "Product Manager",
  "current_phase": "Planning & Design",
  "started_at": "ISO-8601",
  "last_updated": "ISO-8601",
  "tasks_completed": [],
  "pending_tasks": [],
  "exit_signal": false,
  "blocked": false,
  "blocker_reason": null
}
```

```json
// docs/.devtem/circuit_breaker.json structure
{
  "state": "CLOSED",
  "consecutive_no_progress": 0,
  "consecutive_same_error": 0,
  "last_error_hash": null,
  "last_progress_step": 0,
  "total_opens": 0,
  "last_transition_at": "ISO-8601",
  "last_transition_reason": null
}
```

```json
// docs/.devtem/exit_signals.json structure
{
  "test_only_loops": [],
  "done_signals": [],
  "completion_indicators": [],
  "last_analysis": {
    "step": 0,
    "has_progress": false,
    "exit_signal": false
  }
}
```

### Exit Conditions (Intelligent Detection)
The simulation exits when **ALL** conditions are met:
1. All steps (1-11) completed successfully.
2. All tasks in `docs/tasks` marked as complete.
3. All tests in `docs/tests` marked as PASS.
4. No BUG tasks remain in `docs/tasks`.
5. Deployment verified via E2E tests.

**Exit Signal Format** (output at completion):
```
---DEVTEM_STATUS---
STATUS: COMPLETE
STEPS_COMPLETED: 11/11
TASKS_REMAINING: 0
TESTS_PASSING: 100%
BUG_TASKS: 0
EXIT_SIGNAL: true
RECOMMENDATION: Simulation complete, all deliverables verified.
---END_DEVTEM_STATUS---
```

### Continuation Protocol
When user sends "continue" or similar:
1. Read `docs/.devtem/status.json`
2. Resume from `current_step` with `current_role`
3. Execute next action in workflow
4. Update state file after each action
5. Report via MCP only at milestones or blockers

---

## 📋 UI/UX Design Standards Reference (Priority Matrix)

| Priority | Category | Impact | Domain |
|----------|----------|--------|--------|
| 1 | Accessibility | CRITICAL | `ux` |
| 2 | Touch & Interaction | CRITICAL | `ux` |
| 3 | Performance | HIGH | `ux` |
| 4 | Layout & Responsive | HIGH | `ux` |
| 5 | Typography & Color | MEDIUM | `typography`, `color` |
| 6 | Animation | MEDIUM | `ux` |
| 7 | Style Selection | MEDIUM | `style`, `product` |
| 8 | Charts & Data | LOW | `chart` |

*Refer to the full `ui-ux-pro-max` skill for detailed implementation.*

---

## 👥 Roles & Responsibilities Reference

Load context from these files when adopting a role:

| Role | Reference File |
|------|----------------|
| Product Manager | `devtem/reference/JobDescription/產品經理_職務說明.md` |
| System Architect | `devtem/reference/JobDescription/系統架構師_職務說明.md` |
| System Analyst | `devtem/reference/JobDescription/系統分析師_職務說明.md` |
| Project Manager | `devtem/reference/JobDescription/專案經理_職務說明.md` |
| Dev Lead | `devtem/reference/JobDescription/系統分析師_職務說明.md` |
| Database Architect | `devtem/reference/JobDescription/系統架構師_職務說明.md` |
| Backend Engineer | `devtem/reference/JobDescription/資深後端工程師_職務說明.md` |
| Frontend Engineer | `devtem/reference/JobDescription/資深前端工程師_職務說明.md` |
| QA Engineer | `devtem/reference/JobDescription/資深測試工程師_職務說明.md` |
| CI/CD Engineer | `devtem/reference/JobDescription/CI_CD_工程師_職務說明.md` |

---

## 🔁 Workflow Process

The AI drives this process **sequentially and autonomously**. Use `mcp_user-feedback_collect_feedback` only at:
- Major milestones (phase completion)
- Blockers requiring user decision
- High-risk changes

### Phase 1: Planning & Design

#### Step 1: Requirement Gathering (Product Manager)
- **Goal**: Clarify product specifications and user needs.
- **Action**: Discuss with user to gather requirements.
- **Output**: Save requirement documents to `docs/plan`.
- **OpenSpec**: `openspec new change "<change-name>"`
- **State Update**: `current_step: 1, current_role: "Product Manager"`
- **Reference**: `devtem/reference/JobDescription/產品經理_職務說明.md`

#### Step 2: System Architecture (System Architect)
- **Goal**: Establish system architecture based on specs.
- **Action**:
  1. Create system architecture document.
  2. **Generate `docs/env.md`** based on architecture and environment details.
- **Output**: Save to `docs/plan` (architecture) and `docs` (env.md).
- **OpenSpec**: Create `01-spec.md` artifact.
- **Format**: `devtem/reference/FormatSample/範例-系統分析.md`
- **Reference**: `devtem/reference/JobDescription/系統架構師_職務說明.md`

#### Step 3: System Analysis (System Analyst)
- **Goal**: Produce detailed system analysis from specs and architecture.
- **Action**: Create System Analysis Document (SA Doc).
- **Output**: Save to `docs/plan`.
- **Constraint**: Must derive from Step 1 (specs) and Step 2 (architecture).
- **Format**: `devtem/reference/FormatSample/範例-系統分析.md`
- **Reference**: `devtem/reference/JobDescription/系統分析師_職務說明.md`

#### Step 4: Project Planning (Project Manager)
- **Goal**: Define development schedule and milestones.
- **Input**: System Analysis Document (Step 3).
- **Review**: Product Manager must review SA Doc for alignment.
- **Action**: Create high-level project plan.
- **Output**: Save to `docs/plan`.
- **OpenSpec**: Create `02-plan.md` artifact.
- **Format**: `devtem/reference/FormatSample/範例-開發計劃概述.md`
- **Reference**: `devtem/reference/JobDescription/專案經理_職務說明.md`

#### Step 5: Task Breakdown (Dev Lead)
- **Goal**: Break down plan into specific technical tasks (FE, BE, DB, Test, CI/CD).
- **Input**: System Analysis Document (Step 3).
- **Action**: Create detailed module development plans and individual tasks.
- **Output**: Save to `docs/tasks`.
- **Format**: `devtem/reference/FormatSample/範例-模組開發計劃.md`

### Phase 2: Implementation & Iteration

#### Step 6: Database Design (Database Architect)
- **Goal**: Design database schema and fields.
- **Input**: Retrieve tasks from `docs/tasks`.
- **Action**: Create database design documents.
- **Completion**: Mark task complete in `docs/tasks` with notes.
- **Format**: `devtem/reference/FormatSample/範例-資料庫設計.md`

#### Step 7: Backend Development (Backend Engineer)
- **Goal**: Implement APIs.
- **Input**: Retrieve tasks from `docs/tasks`.
- **Action**: Write backend code/docs based on tasks.
- **Constraint**: Use Serena MCP for code exploration.
- **Completion**: Mark task complete in `docs/tasks` with notes.
- **Format**: `devtem/reference/FormatSample/範例-後端開發計劃.md`, `devtem/reference/FormatSample/範例-be-t001.md`
- **Reference**: `devtem/reference/JobDescription/資深後端工程師_職務說明.md`

#### Step 8: Frontend Development (Frontend Engineer)
- **Goal**: Implement UI and integrate APIs.
- **Input**: Retrieve tasks from `docs/tasks`.
- **Action**: Write frontend code/docs.
- **Constraint**: **MUST** apply `ui-ux-pro-max` skill guidelines.
- **Completion**: Mark task complete in `docs/tasks` with notes.
- **Format**: `devtem/reference/FormatSample/範例-前端開發計劃.md`, `devtem/reference/FormatSample/範例-fe-t001.md`
- **Reference**: `devtem/reference/JobDescription/資深前端工程師_職務說明.md`

### Phase 3: Verification & Deployment

#### Step 9: Testing (QA Engineer)
- **Goal**: Verify quality and identify bugs.
- **Input**: Retrieve testing tasks from `docs/tasks`.
- **Action**:
  1. **Generate Test Cases**: Save to `docs/tests`.
  2. **Execute Tests**: Use `chrome-devtools-mcp` (Browser Automation).
  3. **Record Results**: Annotate pass/fail in `docs/tests`.
- **OpenSpec**: `openspec verify`
- **Checks**: UI screenshot, Visual verification, Console error check.
- **Completion**: Mark task complete. If failed → create **BUG Tasks** in `docs/tasks`.
- **Format**: `devtem/reference/FormatSample/範例-測試案例.md`
- **Reference**: `devtem/reference/JobDescription/資深測試工程師_職務說明.md`

#### Step 10: Iteration (Process Check)
- **Action**: Check for BUG tasks in `docs/tasks`.
  - **YES**: Route to Step 6/7/8 as appropriate.
  - **NO**: Proceed to Step 11.
- **State Update**: If bugs exist, set `blocked: false` but return to appropriate step.

#### Step 11: Deployment (CI/CD Engineer)
- **Goal**: Deploy the stable solution.
- **Input**: Retrieve deployment tasks from `docs/tasks` or trigger on QA pass.
- **Action**: Perform deployment tests and finalize.
- **Completion**: Mark deployment tasks complete.
- **OpenSpec**: `openspec archive`
- **Reference**: `devtem/reference/JobDescription/CI_CD_工程師_職務說明.md`
- **Procedure**:
  1. Wait 3 mins after commit.
  2. Check deployment status via API.
  3. Run E2E tests on Stage site (`devtem/reference/Environment/env.md`).
  4. If failed → log to `docs/obstacles.md`.

---

## 🎯 Instructions for Autonomous Operation

### Initialization Sequence
```
1. READ docs/.devtem/status.json
2. IF exists AND exit_signal == false:
     RESUME from current_step with current_role
3. ELSE:
     CREATE docs/.devtem/ directory
     INITIALIZE status.json with step=1, role="Product Manager"
     BEGIN Step 1
```

### Per-Step Execution
```
1. ANNOUNCE current role: "🎭 Acting as: [ROLE]"
2. LOAD role reference file
3. EXECUTE step actions
4. CREATE/UPDATE output documents
5. UPDATE docs/.devtem/status.json
6. IF milestone OR blocker:
     REPORT via mcp_user-feedback_collect_feedback
7. IF user responds "continue":
     PROCEED to next step
8. ELSE IF user provides specific instruction:
     FOLLOW instruction and update state
```

### Completion Sequence
```
1. VERIFY all 11 steps complete
2. VERIFY all tasks in docs/tasks marked done
3. VERIFY all tests in docs/tests marked PASS
4. VERIFY no BUG tasks remain
5. OUTPUT DEVTEM_STATUS block with EXIT_SIGNAL: true
6. UPDATE status.json with exit_signal: true
7. ARCHIVE via openspec archive
8. FINAL REPORT via MCP
```

---

## 📁 Directory Structure

```
project/
├── docs/
│   ├── .devtem/                 # State management (auto-created)
│   │   ├── status.json          # Current session state
│   │   ├── circuit_breaker.json # Circuit breaker state machine
│   │   ├── exit_signals.json    # Completion tracking
│   │   ├── session_history.md   # Session transitions log
│   │   ├── progress_tracker.md  # Detailed progress
│   │   └── backup/              # Recovery backups (if corrupted)
│   ├── plan/                    # Planning documents (Steps 1-5)
│   ├── tasks/                   # Task breakdowns (Step 5+)
│   ├── tests/                   # Test cases (Step 9)
│   ├── env.md                   # Environment config (Step 2)
│   ├── obstacles.md             # Blockers and issues
│   └── CHANGELOG.md             # Change log
└── devtem/
    ├── SKILL.md                 # This skill definition
    ├── register.xml             # Skill registration
    ├── lib/                     # Hook system definitions
    │   ├── circuit_breaker.json # CB schema and thresholds
    │   ├── response_analyzer.json # Analysis patterns
    │   └── hooks.md             # Complete hook documentation
    └── reference/
        ├── JobDescription/      # Role definitions
        ├── FormatSample/        # Document templates
        ├── StateTemplate/       # State file templates
        └── Environment/         # Environment templates
```

---

## 🚦 Status Output Format

At each milestone, output status in this format:

```
---DEVTEM_STATUS---
STATUS: IN_PROGRESS | COMPLETE | BLOCKED
CURRENT_STEP: <number>/11
CURRENT_ROLE: <role name>
CURRENT_PHASE: Planning & Design | Implementation & Iteration | Verification & Deployment
TASKS_COMPLETED_THIS_SESSION: <number>
FILES_MODIFIED: <number>
TESTS_STATUS: PASSING | FAILING | NOT_RUN
EXIT_SIGNAL: false | true
BLOCKED_REASON: <reason if blocked, else null>
RECOMMENDATION: <one line summary>
---END_DEVTEM_STATUS---
```

---

## 🔗 Quick Start Commands

| User Command | AI Action |
|--------------|-----------|
| "start devtem" | Initialize from Step 1 |
| "continue" | Resume from last state (resets CB if OPEN) |
| "status" | Output current DEVTEM_STATUS |
| "skip to step N" | Jump to step N (with warning) |
| "pause" | Save state and stop |
| "reset" | Clear state and start fresh |
| "reset circuit breaker" | Reset CB to CLOSED, clear counters |
| "show circuit breaker" | Display current CB state and counters |
| "debug" | Show all state files content |

---

## ✅ Checklist Before Archiving

- [ ] All 11 steps executed
- [ ] All `docs/plan` documents complete
- [ ] All `docs/tasks` marked done
- [ ] All `docs/tests` marked PASS
- [ ] No BUG tasks in `docs/tasks`
- [ ] E2E tests passed on Stage
- [ ] `docs/CHANGELOG.md` updated
- [ ] `openspec archive` executed
- [ ] Final MCP report sent
- [ ] Circuit breaker state is CLOSED
- [ ] Exit signals show `exit_signal: true`
- [ ] Session history logged final transition

---

## 📚 Reference Documentation

| Document | Path |
|----------|------|
| Hook System | `devtem/lib/hooks.md` |
| Circuit Breaker Schema | `devtem/lib/circuit_breaker.json` |
| Response Analyzer Schema | `devtem/lib/response_analyzer.json` |
| State Templates | `devtem/reference/StateTemplate/` |
| Format Samples | `devtem/reference/FormatSample/` |
| Job Descriptions | `devtem/reference/JobDescription/` |
