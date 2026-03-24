# devteam Workflow Process

This document contains the detailed 11-step workflow for the devteam skill.

---

## 🚨 Session Resume Guard (MANDATORY — Read FIRST)

> **If this is a resumed session (from summary, transcript, or pending TODOs), STOP HERE and execute the `openspec-session-resume` skill BEFORE doing anything else.**

### Step 0: Configuration Sync (AUTO — Runs Before Everything)

> **This step runs AUTOMATICALLY before any workflow step, including session resume.**

The AI MUST execute the `devteam-config-sync` skill to ensure the user's project configuration files contain the mandatory devteam/OpenSpec rules:

1. **Check** user's `AGENTS.md` and `copilot-instructions.md` for `<!-- DEVTEAM-RULES-START -->` marker
2. **If missing** → read injection template from `devteam/references/config-injection/agents-md-injection.md`
3. **Append** the rules block to the end of each file
4. **If outdated** → replace the existing block with the updated version
5. **Report** what was synced

**Files to check:**
- `./AGENTS.md` or `./.github/AGENTS.md`
- `./.github/copilot-instructions.md` or `./copilot-instructions.md`

**If file doesn't exist** → create it with the injection content as initial content.

This ensures that even if the user has never set up these files, the AI will still have the mandatory rules available.

---

### Why This Section Exists

AI agents frequently skip the structured OpenSpec workflow when resuming from conversation summaries. This section exists to prevent that failure mode.

### Mandatory Pre-Implementation Checklist

Before ANY implementation work in a resumed session:

1. ✅ Read `docs/.devteam/status.json` to confirm current step
2. ✅ Scan `docs/tasks/phase{n}/` for ALL task .md files
3. ✅ Run `openspec list --json` to check existing changes
4. ✅ Map each unfinished task .md to an OpenSpec change
5. ✅ Present execution plan to user for confirmation
6. ✅ Begin sequential processing: one task → one OpenSpec lifecycle → archive → next

### Core Rules (Non-Negotiable)

| Rule | Description |
|------|-------------|
| **1 task = 1 change** | Each task .md file from Dev Lead = one independent OpenSpec change lifecycle |
| **Full lifecycle** | Every task: `new → continue/ff → apply → verify → archive` |
| **Sequential** | Complete one task's full cycle before starting the next |
| **No stopping** | AI continues until ALL tasks done (unless circuit breaker or user pause) |
| **No direct code** | Never modify source code without an active OpenSpec change |
| **Task .md = truth** | `docs/tasks/phase{n}/` defines WHAT to do; OpenSpec tracks HOW |

### Task .md → OpenSpec Lifecycle Flow

```
┌──────────────────────────────────────────────────────────────┐
│  FOR EACH task .md (be-t001.md → fe-t001.md → test-t001.md) │
├──────────────────────────────────────────────────────────────┤
│                                                              │
│  1. Read task .md content                                    │
│  2. /opsx:new <task-id>-<description>                        │
│  3. /opsx:continue (or /opsx:ff)                             │
│     → proposal → specs → design → tasks                     │
│  4. /opsx:apply → implement all sub-tasks                    │
│  5. /opsx:verify → validate implementation                   │
│  6. /opsx:archive → archive completed change                 │
│  7. Mark task .md as ✅ complete                              │
│  8. IMMEDIATELY move to next task .md                        │
│                                                              │
│  ⚠️ DO NOT STOP between tasks unless:                       │
│     - Circuit breaker triggers                               │
│     - User says "pause" or "stop"                            │
│     - Unresolvable blocker                                   │
│                                                              │
│  ⚠️ DO NOT batch-implement without OpenSpec changes          │
│  ⚠️ DO NOT skip any step in the lifecycle                    │
└──────────────────────────────────────────────────────────────┘
```

---

## 🌐 Language Configuration

**JobDescription Files**: Written in English for AI comprehension.

**Generated Documents**: All outputs (requirements, architecture docs, system analysis, project plans, task files, test cases, etc.) must be in **user's detected language** (the language user is using in conversation).

---

## 🔁 Workflow Process

The AI drives this process **sequentially and autonomously**. Use `mcp_user-web-feed_collect_feedback` only at:
- Major milestones (phase completion)
- Blockers requiring user decision
- High-risk changes

### Phase 1: Planning & Design

#### Step 1: Requirement Gathering (Product Manager)
- **Goal**: Clarify product specifications and user needs.
- **Action**: Discuss with user to gather requirements.
- **Output**: Save requirement documents to `docs/plan`.
- **State Update**: `current_step: 1, current_role: "Product Manager"`
- **Reference**: `devteam/references/JobDescription/Product_Manager.md`

#### Step 2: System Architecture (System Architect)
- **Goal**: Establish system architecture based on specs.
- **Action**:
  1. Create system architecture document.
  2. **Generate `docs/env.md`** based on architecture and environment details.
- **Output**: Save to `docs/plan` (architecture) and `docs` (env.md).
- **Format**: `devteam/references/FormatSample/範例-系統分析.md`
- **Reference**: `devteam/references/JobDescription/System_Architect.md`

#### Step 3: System Analysis (System Analyst)
- **Goal**: Produce detailed system analysis from specs and architecture.
- **Action**: Create System Analysis Document (SA Doc).
- **Output**: Save to `docs/plan`.
- **Constraint**: Must derive from Step 1 (specs) and Step 2 (architecture).
- **Format**: `devteam/references/FormatSample/範例-系統分析.md`
- **Reference**: `devteam/references/JobDescription/System_Analyst.md`

#### Step 4: Project Planning (Project Manager)
- **Goal**: Define development schedule and milestones.
- **Input**: System Analysis Document (Step 3).
- **Review**: Product Manager must review SA Doc for alignment.
- **Action**: Create high-level project plan.
- **Output**: Save to `docs/plan`.
- **Format**: `devteam/references/FormatSample/範例-開發計劃概述.md`
- **Reference**: `devteam/references/JobDescription/Project_Manager.md`

#### Step 5: Database Design (Database Architect)
- **Goal**: Design database architecture, tables, and column structures.
- **Input**: Read documents `01-requirements.md` through `04-project-plan.md` from `docs/plan`.
- **Action**:
  1. Create database design document: Save `05-database-design.md` to `docs/plan`.
  2. Design database tables, relationships, indexes, foreign key constraints, etc.
- **Output**: Database design document in `docs/plan/05-database-design.md`.
- **Format**: `devteam/references/FormatSample/範例-資料庫設計.md`
- **Reference**: `devteam/references/JobDescription/System_Architect.md`

### Phase 2: Implementation & Iteration

#### Step 6: Task Breakdown (Dev Lead)
- **Role Profile**: Senior Full-Stack Engineer with 25 years of experience, CISSP certification, and extensive large-scale project leadership. Must have served as System Analyst, System Architect, CI/CD Engineer, and QA Engineer.
- **Goal**: Decompose project plan and database design into **finest-grained** executable tasks, ensuring system delivery upon phase completion.
- **Input**: Must thoroughly read and analyze ALL planning documents:
  1. `docs/plan/01-requirements.md` (Requirements Document)
  2. `docs/plan/02-system-architecture.md` (System Architecture)
  3. `docs/plan/03-system-analysis.md` (System Analysis)
  4. `docs/plan/04-project-plan.md` (Project Plan)
  5. `docs/plan/05-database-design.md` (Database Design)
- **Critical Requirements**:
  - **MUST decompose ALL content from Steps 4-5 into atomic work units**
  - **FORBIDDEN: Coarse-grained tasks like "one frontend, one backend"**
  - **Each task MUST be independently testable, verifiable, and deliverable**
  - **Goal: Complete all phase tasks = System functionality ready for that phase**
- **Action**:
  1. Deep analysis of all requirements, architecture, and design details from Steps 1-5.
  2. Identify ALL functional modules, API endpoints, UI screens, database operations, test scenarios.
  3. Decompose each feature into frontend, backend, database, test, and CI/CD atomic tasks.
  4. Create task overview document: Save `06-task-breakdown.md` to `docs/plan`.
  5. Generate detailed task files for each phase in `docs/tasks/phase{n}/`:
     - **Backend Tasks**: `be-t{nnn}.md` (main task), `be-t{nnn}-st{nnn}.md` (sub-tasks)
       - Example: be-t001 (User Registration API), be-t001-st001 (Input Validation), be-t001-st002 (Password Hashing), be-t001-st003 (Email Verification)
     - **Frontend Tasks**: `fe-t{nnn}.md` (main task), `fe-t{nnn}-st{nnn}.md` (sub-tasks)
       - Example: fe-t001 (Login Page), fe-t001-st001 (Form Validation), fe-t001-st002 (Error Handling), fe-t001-st003 (Responsive Design)
     - **Database Tasks**: `db-t{nnn}.md` (migration scripts, index optimization, data initialization)
     - **Test Tasks**: `test-t{nnn}.md` (unit tests, integration tests, E2E test scenarios)
     - **CI/CD Tasks**: `cicd-t{nnn}.md` (deployment scripts, environment setup, monitoring configuration)
  6. Ensure clear dependency relationships between tasks.
  7. Mark each task with priority level, estimated effort, and acceptance criteria.
- **Output**:
  - `docs/plan/06-task-breakdown.md` (Task overview with phase division, dependency graph, milestones)
  - `docs/tasks/phase{n}/*.md` (All detailed task files, each file = one independently executable atomic task)
- **Quality Criteria**:
  - **Task Granularity**: Single task ≤ 1-2 days work
  - **Testability**: Each task must have clear acceptance criteria
  - **Completeness**: Cover ALL features from Steps 4-5, no omissions
  - **Security**: Authentication/authorization/data protection tasks must include CISSP-based security requirements
- **Format**:
  - Overview: `devteam/references/FormatSample/範例-模組開發計劃.md`
  - Backend Task: `devteam/references/FormatSample/範例-be-t001.md`
  - Backend Sub-task: `devteam/references/FormatSample/範例-be-t001-st001.md`
  - Frontend Task: `devteam/references/FormatSample/範例-fe-t001.md`
  - Frontend Sub-task: `devteam/references/FormatSample/範例-fe-t001-st004.md`
- **Reference**: `devteam/references/JobDescription/Dev_Lead_Job_Description.md`

#### Step 7: Backend Development (Backend Engineer)
- **Goal**: Implement database migrations and backend APIs.
- **Input**:
  1. Read all planning documents `01-06` from `docs/plan` (including database design from Step 5 and task breakdown from Step 6).
  2. Read backend task files from `docs/tasks/phase{n}/be-t{nnn}.md` (and sub-tasks if exists).
- **Execution Order**: Backend Engineer **MUST** complete ALL backend tasks in current phase before handing off to Frontend Engineer.

##### 🔄 Backend Task Execution Loop (Mandatory Sequence)

```
┌─────────────────────────────────────────────────────────────────┐
│                    BACKEND ENGINEER WORKFLOW                     │
├─────────────────────────────────────────────────────────────────┤
│  Phase N Start                                                   │
│       │                                                          │
│       ▼                                                          │
│  ┌─────────────────────────────────────────────────────────────┐│
│  │ STEP be-1: Acquire task and reference planning documents     ││
│  │ • Read docs/tasks/phase{n}/be-t{nnn}.md                     ││
│  │ • Reference all docs/plan files (01-06)                     ││
│  └─────────────────────────────────────────────────────────────┘│
│       │                                                          │
│       ▼                                                          │
│  ┌─────────────────────────────────────────────────────────────┐│
│  │ STEP be-2: Database migration (if db-t{nnn}.md exists)      ││
│  │ • Retrieve corresponding db-t{nnn}.md in batch              ││
│  │ • Execute /opsx:new db-<brief-description>                  ││
│  │   Example: /opsx:new db-user-authentication-schema          ││
│  └─────────────────────────────────────────────────────────────┘│
│       │                                                          │
│       ▼                                                          │
│  ┌─────────────────────────────────────────────────────────────┐│
│  │ STEP be-3: Approve and execute database migration           ││
│  │ • Execute /opsx:apply db-<brief-description>                ││
│  │ • Complete ORM migrations, SQL scripts, etc.                ││
│  └─────────────────────────────────────────────────────────────┘│
│       │                                                          │
│       ▼                                                          │
│  ┌─────────────────────────────────────────────────────────────┐│
│  │ STEP be-4: Create OpenSpec backend development task         ││
│  │ • Execute /opsx:new <task-id>-<brief-description>           ││
│  │   Example: /opsx:new be-t001-user-registration-api          ││
│  │ • If sub-tasks exist, create OpenSpec change for each       ││
│  └─────────────────────────────────────────────────────────────┘│
│       │                                                          │
│       ▼                                                          │
│  ┌─────────────────────────────────────────────────────────────┐│
│  │ STEP be-5: Approve and execute backend development          ││
│  │ • Execute /opsx:apply <task-id>-<brief-description>         ││
│  │ • Use Serena MCP for source code exploration                ││
│  │ • Implement backend code and documentation                  ││
│  └─────────────────────────────────────────────────────────────┘│
│       │                                                          │
│       ▼                                                          │
│  ┌─────────────────────────────────────────────────────────────┐│
│  │ STEP be-6: Verify implementation                            ││
│  │ • Execute /opsx:verify <task-id>-<brief-description>        ││
│  │ • Validate implementation matches change artifacts          ││
│  │ • Ensure code compiles and unit tests pass                  ││
│  └─────────────────────────────────────────────────────────────┘│
│       │                                                          │
│       ▼                                                          │
│  ┌─────────────────────────────────────────────────────────────┐│
│  │ STEP be-7: Archive change                                   ││
│  │ • Execute /opsx:archive <task-id>-<brief-description>       ││
│  │ • Sync delta specs to main specs if applicable              ││
│  └─────────────────────────────────────────────────────────────┘│
│       │                                                          │
│       ▼                                                          │
│  ┌─────────────────────────────────────────────────────────────┐│
│  │ STEP be-8: Task completion check                            ││
│  │ • Mark task complete, record execution notes & solutions    ││
│  │ • Check if next be-t{nnn}.md exists                         ││
│  │   └─ YES → Return to STEP be-1 for next backend task        ││
│  │   └─ NO  → Backend phase complete, hand off to Frontend     ││
│  └─────────────────────────────────────────────────────────────┘│
│       │                                                          │
│       ▼                                                          │
│  ✅ ALL BE TASKS COMPLETE → Hand off to Frontend Engineer        │
└─────────────────────────────────────────────────────────────────┘
```

- **Completion**: Mark backend tasks complete in task files with execution notes and problem-solving details.
- **OpenSpec Artifacts**: `proposal.md`, `specs/`, `design.md`, `tasks.md` in `openspec/changes/<task-id>-<brief-description>/`
- **Format**: `devteam/references/FormatSample/範例-後端開發計劃.md`, `devteam/references/FormatSample/範例-be-t001.md`
- **Reference**: `devteam/references/JobDescription/Senior_Backend_Engineer.md`

#### Step 8: Frontend Development (Frontend Engineer)
- **Goal**: Implement UI and integrate with backend APIs.
- **Input**:
  1. Read all planning documents `01-06` from `docs/plan`.
  2. Read frontend task files from `docs/tasks/phase{n}/fe-t{nnn}.md` (and sub-tasks if exists).
- **Execution Order**: Frontend Engineer **MUST** complete ALL frontend tasks in current phase before handing off to Test Engineer.

##### 🔄 Frontend Task Execution Loop (Mandatory Sequence)

```
┌─────────────────────────────────────────────────────────────────┐
│                   FRONTEND ENGINEER WORKFLOW                     │
├─────────────────────────────────────────────────────────────────┤
│  (After ALL Backend Tasks Complete)                              │
│       │                                                          │
│       ▼                                                          │
│  ┌─────────────────────────────────────────────────────────────┐│
│  │ STEP fe-1: Acquire task and reference planning documents    ││
│  │ • Read docs/tasks/phase{n}/fe-t{nnn}.md                     ││
│  │ • Reference all docs/plan files (01-06)                     ││
│  └─────────────────────────────────────────────────────────────┘│
│       │                                                          │
│       ▼                                                          │
│  ┌─────────────────────────────────────────────────────────────┐│
│  │ STEP fe-2: Create OpenSpec frontend development task        ││
│  │ • Execute /opsx:new <task-id>-<brief-description>           ││
│  │   Example: /opsx:new fe-t001-login-page-ui                  ││
│  │ • ⚠️ MANDATORY: OpenSpec must explicitly specify using      ││
│  │   ui-ux-pro-max skill for UI/UX design and implementation   ││
│  │ • If sub-tasks exist, create OpenSpec change for each       ││
│  └─────────────────────────────────────────────────────────────┘│
│       │                                                          │
│       ▼                                                          │
│  ┌─────────────────────────────────────────────────────────────┐│
│  │ STEP fe-3: Approve and execute frontend development         ││
│  │ • Execute /opsx:apply <task-id>-<brief-description>         ││
│  │ • ⚠️ MANDATORY: All frontend task implementation MUST use   ││
│  │   ui-ux-pro-max skill for development                       ││
│  │ • Use Serena MCP for source code exploration                ││
│  │ • Implement frontend code and integrate backend APIs        ││
│  └─────────────────────────────────────────────────────────────┘│
│       │                                                          │
│       ▼                                                          │
│  ┌─────────────────────────────────────────────────────────────┐│
│  │ STEP fe-4: Verify implementation                            ││
│  │ • Execute /opsx:verify <task-id>-<brief-description>        ││
│  │ • Validate implementation matches change artifacts          ││
│  │ • Ensure UI meets ui-ux-pro-max standards                   ││
│  └─────────────────────────────────────────────────────────────┘│
│       │                                                          │
│       ▼                                                          │
│  ┌─────────────────────────────────────────────────────────────┐│
│  │ STEP fe-5: Archive change                                   ││
│  │ • Execute /opsx:archive <task-id>-<brief-description>       ││
│  │ • Sync delta specs to main specs if applicable              ││
│  └─────────────────────────────────────────────────────────────┘│
│       │                                                          │
│       ▼                                                          │
│  ┌─────────────────────────────────────────────────────────────┐│
│  │ STEP fe-6: Task completion check                            ││
│  │ • Mark task complete, record execution notes & solutions    ││
│  │ • Check if next fe-t{nnn}.md exists                         ││
│  │   └─ YES → Return to STEP fe-1 for next frontend task       ││
│  │   └─ NO  → Frontend phase complete, hand off to Test        ││
│  └─────────────────────────────────────────────────────────────┘│
│       │                                                          │
│       ▼                                                          │
│  ✅ ALL FE TASKS COMPLETE → Hand off to Test Engineer            │
└─────────────────────────────────────────────────────────────────┘
```

##### ⚠️ ui-ux-pro-max Skill Mandatory Usage Rules

| Phase | Mandatory Requirement |
|-------|----------------------|
| `/opsx:new` | OpenSpec proposal must explicitly declare use of `ui-ux-pro-max` skill |
| `/opsx:apply` | Implementation must follow `ui-ux-pro-max` design guidelines |
| Acceptance Criteria | UI/UX must comply with `ui-ux-pro-max` priority matrix requirements |

- **Completion**: Mark frontend tasks complete in task files with execution notes and problem-solving details.
- **OpenSpec Artifacts**: `proposal.md`, `specs/`, `design.md`, `tasks.md` in `openspec/changes/<task-id>-<brief-description>/`
- **Format**: `devteam/references/FormatSample/範例-前端開發計劃.md`, `devteam/references/FormatSample/範例-fe-t001.md`
- **Reference**: `devteam/references/JobDescription/Senior_Frontend_Engineer.md`

### Phase 3: Verification & Deployment

#### Step 9: Testing (QA Engineer)
- **Goal**: Verify quality and identify bugs.
- **Input**:
  1. Retrieve testing tasks from `docs/tasks/phase{n}/test-t{nnn}.md`.
  2. Review all implementation from Steps 6-8.
- **Execution Order**: Test Engineer **MUST** complete ALL test tasks in current phase before handing off to CI/CD Engineer.

##### 🔄 Test Task Execution Loop (Mandatory Sequence)

```
┌─────────────────────────────────────────────────────────────────┐
│                     TEST ENGINEER WORKFLOW                       │
├─────────────────────────────────────────────────────────────────┤
│  (After ALL Frontend Tasks Complete)                             │
│       │                                                          │
│       ▼                                                          │
│  ┌─────────────────────────────────────────────────────────────┐│
│  │ STEP test-1: Acquire task and reference planning documents  ││
│  │ • Read docs/tasks/phase{n}/test-t{nnn}.md                   ││
│  │ • Reference all docs/plan files (01-06)                     ││
│  │ • Review all implementations from Steps 6-8                 ││
│  └─────────────────────────────────────────────────────────────┘│
│       │                                                          │
│       ▼                                                          │
│  ┌─────────────────────────────────────────────────────────────┐│
│  │ STEP test-2: Create OpenSpec test task                      ││
│  │ • Execute /opsx:new <task-id>-<brief-description>           ││
│  │   Example: /opsx:new test-t001-user-login-e2e               ││
│  │ • ⚠️ MANDATORY: OpenSpec must explicitly specify using:     ││
│  │   - Playwright testing framework                            ││
│  │   - chrome-devtools-mcp browser automation tool             ││
│  │ • If sub-tasks exist, create OpenSpec change for each       ││
│  └─────────────────────────────────────────────────────────────┘│
│       │                                                          │
│       ▼                                                          │
│  ┌─────────────────────────────────────────────────────────────┐│
│  │ STEP test-3: Approve and execute testing                    ││
│  │ • Execute /opsx:apply <task-id>-<brief-description>         ││
│  │ • ⚠️ MANDATORY: Implementation MUST use:                    ││
│  │   - Browser testing for UI/UX operation verification        ││
│  │   - Screenshot visual recognition and verification          ││
│  │   - chrome-devtools-mcp for E2E testing                     ││
│  │ • Generate test cases: Save to docs/tests/tc-{nnn}.md       ││
│  │ • Record test results: Mark pass/fail status                ││
│  └─────────────────────────────────────────────────────────────┘│
│       │                                                          │
│       ▼                                                          │
│  ┌─────────────────────────────────────────────────────────────┐│
│  │ STEP test-4: Verify implementation                          ││
│  │ • Execute /opsx:verify <task-id>-<brief-description>        ││
│  │ • Validate test coverage matches change artifacts           ││
│  │ • Ensure all test cases pass verification                   ││
│  └─────────────────────────────────────────────────────────────┘│
│       │                                                          │
│       ▼                                                          │
│  ┌─────────────────────────────────────────────────────────────┐│
│  │ STEP test-5: Archive change                                 ││
│  │ • Execute /opsx:archive <task-id>-<brief-description>       ││
│  │ • Sync delta specs to main specs if applicable              ││
│  └─────────────────────────────────────────────────────────────┘│
│       │                                                          │
│       ▼                                                          │
│  ┌─────────────────────────────────────────────────────────────┐│
│  │ STEP test-6: Task completion check                          ││
│  │ • Mark task complete, record execution notes & solutions    ││
│  │ • If test failed → Create BUG Tasks                         ││
│  │   (be-bug-{nnn}.md, fe-bug-{nnn}.md)                        ││
│  │ • Check if next test-t{nnn}.md exists                       ││
│  │   └─ YES → Return to STEP test-1 for next test task         ││
│  │   └─ NO  → Test phase complete, hand off to CI/CD           ││
│  └─────────────────────────────────────────────────────────────┘│
│       │                                                          │
│       ▼                                                          │
│  ✅ ALL TEST TASKS COMPLETE → Hand off to CI/CD Engineer         │
└─────────────────────────────────────────────────────────────────┘
```

##### ⚠️ Testing Tools Mandatory Usage Rules

| Tool | Purpose | Mandatory Level |
|------|---------|-----------------|
| Playwright | E2E testing framework | **CRITICAL** |
| chrome-devtools-mcp | Browser automation | **CRITICAL** |
| Screenshot | Visual recognition verification | **CRITICAL** |
| Console monitoring | Error detection | **HIGH** |

##### ✅ Test Verification Checklist (Mandatory Checks)

| Check Item | Description |
|------------|-------------|
| UI Screenshot | Must capture screenshot for each test step |
| Visual Verification | Layout alignment, text completeness, color contrast |
| RWD Testing | Responsive design verification |
| Dark/Light Mode | Theme switching test |
| Console Errors | No JS errors or warnings |
| Accessibility | Accessibility standards compliance |
| Performance | Performance metrics meet standards |

- **OpenSpec**: `/opsx:verify` to validate implementation matches artifacts (checks Completeness, Correctness, Coherence)
- **Completion**:
  - Mark test tasks complete in `docs/tasks/phase{n}/test-t{nnn}.md`.
  - If failed → create **BUG Tasks** in appropriate `docs/tasks/phase{n}/` directory (e.g., `be-bug-{nnn}.md`, `fe-bug-{nnn}.md`).
- **Format**: `devteam/references/FormatSample/範例-測試案例.md`
- **Reference**: `devteam/references/JobDescription/Senior_QA_Engineer.md`

#### Step 10: Iteration (Process Check)
- **Action**: Scan all phase directories in `docs/tasks/phase{n}/` for BUG tasks (`*-bug-{nnn}.md`).
  - **YES**: Route bug tasks to appropriate engineers (Step 7/8) for fixing.
    - Bug fix follows full OpenSpec lifecycle: `/opsx:new` → `/opsx:apply` → `/opsx:verify` → `/opsx:archive`
    - After all bugs fixed → Re-run affected test cases in Step 9
    - After re-test → Return to Step 10 to re-check for new bugs
    - Loop continues until no BUG tasks remain
  - **NO**: Proceed to Step 11.
- **State Update**: If bugs exist, update status but continue fixing cycle; do not block deployment preparation.
- **Circuit Breaker + OpenSpec**: If circuit breaker triggers during a bug-fix OpenSpec lifecycle:
  1. Record the in-progress OpenSpec change ID in `circuit_breaker.json` (`interrupted_change` field)
  2. On session resume, the Session Resume Protocol will detect and recover the interrupted change
  3. Resume the OpenSpec lifecycle from the last completed step (e.g., if `apply` was done, resume at `verify`)

#### Step 11: Deployment (CI/CD Engineer)
- **Goal**: Deploy the stable solution.
- **Input**:
  1. Retrieve CI/CD tasks from `docs/tasks/phase{n}/cicd-t{nnn}.md` or trigger on QA pass.
  2. Verify all test cases in `docs/tests` are marked PASS.
- **Execution Order**: CI/CD Engineer **MUST** complete ALL deployment tasks in current phase before moving to next phase.

##### 🔄 CI/CD Task Execution Loop (Mandatory Sequence)

```
┌─────────────────────────────────────────────────────────────────┐
│                    CI/CD ENGINEER WORKFLOW                       │
├─────────────────────────────────────────────────────────────────┤
│  (After ALL Test Tasks Complete & Pass)                          │
│       │                                                          │
│       ▼                                                          │
│  ┌─────────────────────────────────────────────────────────────┐│
│  │ STEP cicd-1: Acquire task and verify test results           ││
│  │ • Read docs/tasks/phase{n}/cicd-t{nnn}.md                   ││
│  │ • Verify all test cases in docs/tests are marked PASS       ││
│  │ • Reference all docs/plan files (01-06)                     ││
│  └─────────────────────────────────────────────────────────────┘│
│       │                                                          │
│       ▼                                                          │
│  ┌─────────────────────────────────────────────────────────────┐│
│  │ STEP cicd-2: Create OpenSpec deployment task                ││
│  │ • Execute /opsx:new <task-id>-<brief-description>           ││
│  │   Example: /opsx:new cicd-t001-stage-deployment             ││
│  │ • If sub-tasks exist, create OpenSpec change for each       ││
│  └─────────────────────────────────────────────────────────────┘│
│       │                                                          │
│       ▼                                                          │
│  ┌─────────────────────────────────────────────────────────────┐│
│  │ STEP cicd-3: Approve and execute deployment                 ││
│  │ • Execute /opsx:apply <task-id>-<brief-description>         ││
│  │ • Perform deployment testing and finalization               ││
│  │ • Wait 3 minutes for deployment to complete                 ││
│  │ • Check deployment status via API                           ││
│  └─────────────────────────────────────────────────────────────┘│
│       │                                                          │
│       ▼                                                          │
│  ┌─────────────────────────────────────────────────────────────┐│
│  │ STEP cicd-4: Stage environment E2E testing                  ││
│  │ • Execute E2E tests on Stage site                           ││
│  │ • Use chrome-devtools-mcp to verify deployment results      ││
│  │ • If failed → Log to docs/obstacles.md                      ││
│  │            → Create deployment bug task                     ││
│  └─────────────────────────────────────────────────────────────┘│
│       │                                                          │
│       ▼                                                          │
│  ┌─────────────────────────────────────────────────────────────┐│
│  │ STEP cicd-5: Verify implementation                          ││
│  │ • Execute /opsx:verify <task-id>-<brief-description>        ││
│  │ • Validate deployment matches change artifacts              ││
│  │ • Ensure all E2E tests pass on Stage environment            ││
│  └─────────────────────────────────────────────────────────────┘│
│       │                                                          │
│       ▼                                                          │
│  ┌─────────────────────────────────────────────────────────────┐│
│  │ STEP cicd-6: Task completion and archival                   ││
│  │ • Mark task complete, record execution notes & solutions    ││
│  │ • Execute /opsx:archive to archive completed change         ││
│  │ • Check if next cicd-t{nnn}.md exists                       ││
│  │   └─ YES → Return to STEP cicd-1 for next deployment task   ││
│  │   └─ NO  → Phase complete, proceed to next phase or end     ││
│  └─────────────────────────────────────────────────────────────┘│
│       │                                                          │
│       ▼                                                          │
│  ✅ ALL CICD TASKS COMPLETE → Phase Complete / Next Phase        │
└─────────────────────────────────────────────────────────────────┘
```

- **Completion**: Mark CI/CD tasks complete in task files.
- **OpenSpec**: `/opsx:archive` (prompts to sync delta specs if needed, moves change to archive)
- **Reference**: `devteam/references/JobDescription/CI_CD_Engineer.md`
- **Procedure**:
  1. Wait 3 mins after commit.
  2. Check deployment status via API.
  3. Run E2E tests on Stage site (`devteam/references/Environment/env-sample.md`).
  4. If failed → log to `docs/obstacles.md` and create deployment bug task.

---

## 🔄 Phase Task Execution Order (Mandatory Sequence)

Within each phase, engineers **MUST** execute tasks in the following strict order. No engineer can start until the previous engineer completes ALL their tasks.

```
┌─────────────────────────────────────────────────────────────────────────────┐
│                    PHASE N: ENGINEER EXECUTION ORDER                         │
├─────────────────────────────────────────────────────────────────────────────┤
│                                                                              │
│  ┌──────────────────────────────────────────────────────────────────────┐   │
│  │ 1️⃣ BACKEND ENGINEER (be)                                              │   │
│  │    • Process all be-t{nnn}.md tasks sequentially                     │   │
│  │    • Include corresponding db-t{nnn}.md database migrations          │   │
│  │    • After all backend tasks complete → Hand off to Frontend Eng.    │   │
│  └──────────────────────────────────────────────────────────────────────┘   │
│                              │                                               │
│                              ▼                                               │
│  ┌──────────────────────────────────────────────────────────────────────┐   │
│  │ 2️⃣ FRONTEND ENGINEER (fe)                                             │   │
│  │    • Process all fe-t{nnn}.md tasks sequentially                     │   │
│  │    • MANDATORY: Use ui-ux-pro-max skill                              │   │
│  │    • After all frontend tasks complete → Hand off to Test Eng.       │   │
│  └──────────────────────────────────────────────────────────────────────┘   │
│                              │                                               │
│                              ▼                                               │
│  ┌──────────────────────────────────────────────────────────────────────┐   │
│  │ 3️⃣ TEST ENGINEER (test)                                               │   │
│  │    • Process all test-t{nnn}.md tasks sequentially                   │   │
│  │    • MANDATORY: Use Playwright + chrome-devtools-mcp                 │   │
│  │    • Execute screenshot visual recognition verification              │   │
│  │    • After all test tasks complete → Hand off to CI/CD Eng.          │   │
│  └──────────────────────────────────────────────────────────────────────┘   │
│                              │                                               │
│                              ▼                                               │
│  ┌──────────────────────────────────────────────────────────────────────┐   │
│  │ 4️⃣ CI/CD ENGINEER (cicd)                                              │   │
│  │    • Process all cicd-t{nnn}.md tasks sequentially                   │   │
│  │    • Execute deployment and Stage E2E verification                   │   │
│  │    • After all deploy tasks complete → Phase done / Next Phase       │   │
│  └──────────────────────────────────────────────────────────────────────┘   │
│                              │                                               │
│                              ▼                                               │
│  ✅ PHASE N COMPLETE → Proceed to Phase N+1 (if exists)                      │
│                                                                              │
└─────────────────────────────────────────────────────────────────────────────┘
```

### 📋 Engineer Handoff Checklist

| From | To | Handoff Condition |
|------|----|--------------------|
| Backend | Frontend | All `be-t{nnn}.md` + `db-t{nnn}.md` complete |
| Frontend | Test | All `fe-t{nnn}.md` complete |
| Test | CI/CD | All `test-t{nnn}.md` complete |
| CI/CD | Next Phase | All `cicd-t{nnn}.md` complete |

### ⚠️ Mandatory Tool Usage Summary

| Engineer Role | OpenSpec Command | Mandatory Tool/Skill |
|---------------|------------------|---------------------|
| Backend | `/opsx:new db-*`, `/opsx:new be-*` | Serena MCP |
| Frontend | `/opsx:new fe-*` | **ui-ux-pro-max skill** |
| Test | `/opsx:new test-*` | **Playwright + chrome-devtools-mcp** |
| CI/CD | `/opsx:new cicd-*` | chrome-devtools-mcp (E2E) |

---

## 👥 Roles & Responsibilities

| Role | Reference File | Notes |
|------|----------------|-------|
| Product Manager | `devteam/references/JobDescription/Product_Manager.md` | Handles Step 1 (requirements gathering) |
| System Architect | `devteam/references/JobDescription/System_Architect.md` | Handles Step 2 (system architecture design) |
| System Analyst | `devteam/references/JobDescription/System_Analyst.md` | Handles Step 3 (system analysis) |
| Project Manager | `devteam/references/JobDescription/Project_Manager.md` | Handles Step 4 (project planning) |
| Database Architect | `devteam/references/JobDescription/System_Architect.md` | Handles Step 5 (database architecture & schema design) |
| Dev Lead | `devteam/references/JobDescription/Dev_Lead_Job_Description.md` | Handles Step 6 (fine-grained task breakdown) - Senior Full-Stack Engineer, 25 years exp., CISSP certified |
| Backend Engineer | `devteam/references/JobDescription/Senior_Backend_Engineer.md` | Handles Step 7 (database migration & API development), 10 (bug fixes) |
| Frontend Engineer | `devteam/references/JobDescription/Senior_Frontend_Engineer.md` | Handles Steps 8 (frontend development), 10 (bug fixes) |
| QA Engineer | `devteam/references/JobDescription/Senior_QA_Engineer.md` | Handles Steps 9 (testing), creates test cases |
| CI/CD Engineer | `devteam/references/JobDescription/CI_CD_Engineer.md` | Handles Steps 11 (deployment verification) |

---

## 📁 Directory Structure

```
project/
├── docs/
│   ├── .devteam/                 # State management (auto-created)
│   │   ├── status.json          # Current session state
│   │   ├── circuit_breaker.json # Circuit breaker state machine
│   │   ├── session_history.md   # Session transitions log
│   │   └── progress_tracker.md  # Detailed progress
│   ├── plan/                    # Planning documents (Steps 1-6)
│   │   ├── 01-requirements.md   # Step 1: Requirements
│   │   ├── 02-system-architecture.md  # Step 2: Architecture + env.md
│   │   ├── 03-system-analysis.md      # Step 3: Analysis
│   │   ├── 04-project-plan.md         # Step 4: Project Plan
│   │   ├── 05-database-design.md      # Step 5: Database Design
│   │   └── 06-task-breakdown.md       # Step 6: Task Breakdown (Fine-grained)
│   ├── tasks/                   # Task details (Step 6)
│   │   ├── phase1/              # Phase 1 tasks
│   │   │   ├── be-t001.md       # Backend task
│   │   │   ├── be-t001-st001.md # Backend sub-task
│   │   │   ├── fe-t001.md       # Frontend task
│   │   │   ├── fe-t001-st004.md # Frontend sub-task
│   │   │   ├── db-t001.md       # Database task
│   │   │   ├── test-t001.md     # Test task
│   │   │   └── cicd-t001.md     # CI/CD task
│   │   ├── phase2/              # Phase 2 tasks
│   │   └── ...
│   ├── tests/                   # Test cases (Step 9)
│   │   ├── tc-001.md            # Test case 1
│   │   ├── tc-002.md            # Test case 2
│   │   └── ...
│   ├── env.md                   # Environment config (Step 2)
│   ├── obstacles.md             # Blockers and issues
│   └── CHANGELOG.md             # Change log
├── openspec/                    # OpenSpec OPSX artifacts
│   ├── changes/                 # Active changes
│   │   └── <change-name>/       # Individual change folder
│   │       ├── .openspec.yaml   # Change metadata
│   │       ├── proposal.md      # Change proposal
│   │       ├── specs/           # Delta specifications
│   │       ├── design.md        # Technical design
│   │       └── tasks.md         # Implementation tasks
│   ├── specs/                   # Main specifications
│   └── config.yaml              # Project config (optional)
└── devteam/
    └── references/
        ├── JobDescription/      # Role definitions
        ├── FormatSample/        # Document templates
        └── StateTemplate/       # State file templates
```

### Task File Naming Convention

| Type | Format | Example |
|------|--------|---------|
| Backend | `be-t{nnn}.md` | `be-t001.md` |
| Backend Sub-task | `be-t{nnn}-st{nnn}.md` | `be-t001-st001.md` |
| Frontend | `fe-t{nnn}.md` | `fe-t001.md` |
| Frontend Sub-task | `fe-t{nnn}-st{nnn}.md` | `fe-t001-st004.md` |
| Database | `db-t{nnn}.md` | `db-t001.md` |
| Testing | `test-t{nnn}.md` | `test-t001.md` |
| CI/CD | `cicd-t{nnn}.md` | `cicd-t001.md` |
| Backend Bug | `be-bug-{nnn}.md` | `be-bug-001.md` |
| Frontend Bug | `fe-bug-{nnn}.md` | `fe-bug-001.md` |
| Test Case | `tc-{nnn}.md` | `tc-001.md` |

---

## 📘 OpenSpec OPSX Commands Reference

The devteam skill integrates with OpenSpec's OPSX (artifact-guided) workflow.

| Command | Description | When to Use |
|---------|-------------|-------------|
| `/opsx:explore` | Think through ideas, investigate | Before starting a change |
| `/opsx:new <name>` | Start a new change | Step 1: Requirement Gathering |
| `/opsx:continue` | Create next artifact by dependency | Steps 2-5: Incremental planning |
| `/opsx:ff <name>` | Fast-forward all planning artifacts | When requirements are clear |
| `/opsx:apply` | Implement tasks from the change | Steps 6-8: Implementation |
| `/opsx:verify` | Validate implementation vs artifacts | Step 9: Testing |
| `/opsx:sync` | Merge delta specs to main specs | Before archiving (optional) |
| `/opsx:archive` | Archive completed change | Step 11: Deployment |

### Artifact Dependency Graph (spec-driven schema)

```
          proposal (root)
               |
       +-------+-------+
       |               |
       v               v
    specs           design
       |               |
       +-------+-------+
               |
               v
            tasks
               |
               v
         APPLY PHASE
```

### devteam Step ↔ OpenSpec Mapping

| Phase | devteam Step | OpenSpec Command |
|-------|--------------|------------------|
| Planning | Step 1 | `/opsx:new` |
| Planning | Step 2-5 | `/opsx:continue` or `/opsx:ff` |
| Implementation | Step 6-8 | `/opsx:apply` |
| Verification | Step 9 | `/opsx:verify` |
| Deployment | Step 11 | `/opsx:archive` |

### OpenSpec Directory Structure

```
openspec/
├── changes/                     # Active changes
│   └── <change-name>/           # Individual change folder
│       ├── .openspec.yaml       # Change metadata
│       ├── proposal.md          # Change proposal
│       ├── specs/               # Delta specifications
│       ├── design.md            # Technical design
│       └── tasks.md             # Implementation tasks
├── specs/                       # Main specifications
└── config.yaml                  # Project config (optional)
```

### Command Syntax by AI Tool

| AI Tool | Syntax |
|---------|--------|
| Claude Code | `/opsx:new`, `/opsx:apply` |
| Cursor | `/opsx-new`, `/opsx-apply` |
| Windsurf | `/opsx-new`, `/opsx-apply` |
| Copilot | `/opsx-new`, `/opsx-apply` |
| Trae | `/openspec-new-change`, `/openspec-apply-change` |
