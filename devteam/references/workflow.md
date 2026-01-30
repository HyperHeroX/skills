# devteam Workflow Process

This document contains the detailed 11-step workflow for the devteam skill.

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
- **OpenSpec**: `/opsx:new <change-name>` (creates `openspec/changes/<change-name>/` directory)
- **State Update**: `current_step: 1, current_role: "Product Manager"`
- **Reference**: `devteam/references/JobDescription/產品經理_職務說明.md`

#### Step 2: System Architecture (System Architect)
- **Goal**: Establish system architecture based on specs.
- **Action**:
  1. Create system architecture document.
  2. **Generate `docs/env.md`** based on architecture and environment details.
- **Output**: Save to `docs/plan` (architecture) and `docs` (env.md).
- **OpenSpec**: `/opsx:continue` to create `proposal.md` artifact (or `/opsx:ff` to create all planning artifacts at once)
- **Format**: `devteam/references/FormatSample/範例-系統分析.md`
- **Reference**: `devteam/references/JobDescription/系統架構師_職務說明.md`

#### Step 3: System Analysis (System Analyst)
- **Goal**: Produce detailed system analysis from specs and architecture.
- **Action**: Create System Analysis Document (SA Doc).
- **Output**: Save to `docs/plan`.
- **Constraint**: Must derive from Step 1 (specs) and Step 2 (architecture).
- **Format**: `devteam/references/FormatSample/範例-系統分析.md`
- **Reference**: `devteam/references/JobDescription/系統分析師_職務說明.md`

#### Step 4: Project Planning (Project Manager)
- **Goal**: Define development schedule and milestones.
- **Input**: System Analysis Document (Step 3).
- **Review**: Product Manager must review SA Doc for alignment.
- **Action**: Create high-level project plan.
- **Output**: Save to `docs/plan`.
- **OpenSpec**: `/opsx:continue` to create `specs/` and `design.md` artifacts (artifacts are created based on dependency graph)
- **Format**: `devteam/references/FormatSample/範例-開發計劃概述.md`
- **Reference**: `devteam/references/JobDescription/專案經理_職務說明.md`

#### Step 5: Task Breakdown (Dev Lead)
- **Goal**: Break down plan into specific technical tasks (FE, BE, DB, Test, CI/CD).
- **Input**: Read documents `01-requirements.md`, `02-system-architecture.md`, `03-system-analysis.md`, `04-project-plan.md` from `docs/plan`.
- **Action**:
  1. Create module development plan: Save `05-task-breakdown.md` to `docs/plan`.
  2. Generate detailed task documents by phase into `docs/tasks/phase{n}/`:
     - Backend tasks: `be-t{nnn}.md` (main task), `be-t{nnn}-st{nnn}.md` (sub-tasks if needed)
     - Frontend tasks: `fe-t{nnn}.md` (main task), `fe-t{nnn}-st{nnn}.md` (sub-tasks if needed)
     - Database tasks: `db-t{nnn}.md`
     - Test tasks: `test-t{nnn}.md`
     - CI/CD tasks: `cicd-t{nnn}.md`
- **Output**:
  - `docs/plan/05-task-breakdown.md` (overview)
  - `docs/tasks/phase{n}/*.md` (detailed task files)
- **Format**:
  - Overview: `devteam/references/FormatSample/範例-模組開發計劃.md`
  - Backend Task: `devteam/references/FormatSample/範例-be-t001.md`
  - Backend Sub-task: `devteam/references/FormatSample/範例-be-t001-st001.md`
  - Frontend Task: `devteam/references/FormatSample/範例-fe-t001.md`
  - Frontend Sub-task: `devteam/references/FormatSample/範例-fe-t001-st004.md`
- **Reference**: `devteam/references/JobDescription/系統分析師_職務說明.md`

### Phase 2: Implementation & Iteration

#### Step 6: Database Design (Database Architect)
- **Goal**: Design database schema and fields.
- **Input**: Read documents `01-requirements.md` through `06-database-design.md` from `docs/plan` and retrieve DB tasks from `docs/tasks/phase{n}/`.
- **Action**:
  1. Create database design document.
  2. Execute database implementation based on task files.
- **Output**: Save `06-database-design.md` to `docs/plan`.
- **Completion**: Mark DB tasks complete in `docs/tasks/phase{n}/db-t{nnn}.md` with execution notes.
- **Format**: `devteam/references/FormatSample/範例-資料庫設計.md`
- **Reference**: `devteam/references/JobDescription/系統架構師_職務說明.md`

#### Step 7: Backend Development (Backend Engineer)
- **Goal**: Implement APIs.
- **Input**:
  1. Read all planning documents `01-06` from `docs/plan`.
  2. Read backend task files from `docs/tasks/phase{n}/be-t{nnn}.md` (and sub-tasks if exists).
- **Action**: Write backend code/docs based on task specifications.
- **Constraint**: Use Serena MCP for code exploration.
- **Completion**: Mark backend tasks complete in task files with execution notes and problem-solving details.
- **Format**: `devteam/references/FormatSample/範例-後端開發計劃.md`, `devteam/references/FormatSample/範例-be-t001.md`
- **Reference**: `devteam/references/JobDescription/資深後端工程師_職務說明.md`

#### Step 8: Frontend Development (Frontend Engineer)
- **Goal**: Implement UI and integrate APIs.
- **Input**:
  1. Read all planning documents `01-06` from `docs/plan`.
  2. Read frontend task files from `docs/tasks/phase{n}/fe-t{nnn}.md` (and sub-tasks if exists).
- **Action**: Write frontend code/docs.
- **Constraint**: **MUST** apply `ui-ux-pro-max` skill guidelines.
- **Completion**: Mark frontend tasks complete in task files with execution notes and problem-solving details.
- **Format**: `devteam/references/FormatSample/範例-前端開發計劃.md`, `devteam/references/FormatSample/範例-fe-t001.md`
- **Reference**: `devteam/references/JobDescription/資深前端工程師_職務說明.md`

### Phase 3: Verification & Deployment

#### Step 9: Testing (QA Engineer)
- **Goal**: Verify quality and identify bugs.
- **Input**:
  1. Retrieve testing tasks from `docs/tasks/phase{n}/test-t{nnn}.md`.
  2. Review all implementation from Steps 6-8.
- **Action**:
  1. **Generate Test Cases**: Save to `docs/tests` using naming convention `tc-{nnn}.md`.
  2. **Execute Tests**: Use `chrome-devtools-mcp` (Browser Automation).
  3. **Record Results**: Annotate pass/fail status in test case files.
- **OpenSpec**: `/opsx:verify` to validate implementation matches artifacts (checks Completeness, Correctness, Coherence)
- **Checks**: UI screenshot, Visual verification, Console error check, Accessibility, Performance.
- **Completion**:
  - Mark test tasks complete in `docs/tasks/phase{n}/test-t{nnn}.md`.
  - If failed → create **BUG Tasks** in appropriate `docs/tasks/phase{n}/` directory (e.g., `be-bug-{nnn}.md`, `fe-bug-{nnn}.md`).
- **Format**: `devteam/references/FormatSample/範例-測試案例.md`
- **Reference**: `devteam/references/JobDescription/資深測試工程師_職務說明.md`

#### Step 10: Iteration (Process Check)
- **Action**: Scan all phase directories in `docs/tasks/phase{n}/` for BUG tasks (`*-bug-{nnn}.md`).
  - **YES**: Route bug tasks to appropriate engineers (Step 6/7/8) for fixing.
  - **NO**: Proceed to Step 11.
- **State Update**: If bugs exist, update status but continue fixing cycle; do not block deployment preparation.

#### Step 11: Deployment (CI/CD Engineer)
- **Goal**: Deploy the stable solution.
- **Input**:
  1. Retrieve CI/CD tasks from `docs/tasks/phase{n}/cicd-t{nnn}.md` or trigger on QA pass.
  2. Verify all test cases in `docs/tests` are marked PASS.
- **Action**: Perform deployment tests and finalize.
- **Completion**: Mark CI/CD tasks complete in task files.
- **OpenSpec**: `/opsx:archive` (prompts to sync delta specs if needed, moves change to archive)
- **Reference**: `devteam/references/JobDescription/CI_CD_工程師_職務說明.md`
- **Procedure**:
  1. Wait 3 mins after commit.
  2. Check deployment status via API.
  3. Run E2E tests on Stage site (`devteam/references/Environment/env-sample.md`).
  4. If failed → log to `docs/obstacles.md` and create deployment bug task.

---

## 👥 Roles & Responsibilities

| Role | Reference File |
|------|----------------|
| Product Manager | `devteam/references/JobDescription/產品經理_職務說明.md` |
| System Architect | `devteam/references/JobDescription/系統架構師_職務說明.md` |
| System Analyst | `devteam/references/JobDescription/系統分析師_職務說明.md` |
| Project Manager | `devteam/references/JobDescription/專案經理_職務說明.md` |
| Dev Lead | `devteam/references/JobDescription/系統分析師_職務說明.md` |
| Database Architect | `devteam/references/JobDescription/系統架構師_職務說明.md` |
| Backend Engineer | `devteam/references/JobDescription/資深後端工程師_職務說明.md` |
| Frontend Engineer | `devteam/references/JobDescription/資深前端工程師_職務說明.md` |
| QA Engineer | `devteam/references/JobDescription/資深測試工程師_職務說明.md` |
| CI/CD Engineer | `devteam/references/JobDescription/CI_CD_工程師_職務說明.md` |

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
│   │   ├── 05-task-breakdown.md       # Step 5: Task Overview
│   │   └── 06-database-design.md      # Step 6: DB Design
│   ├── tasks/                   # Task details (Step 5+)
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
