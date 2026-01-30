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
- **Input**: System Analysis Document (Step 3).
- **Action**: Create detailed module development plans and individual tasks.
- **Output**: Save to `docs/tasks`.
- **Format**: `devteam/references/FormatSample/範例-模組開發計劃.md`

### Phase 2: Implementation & Iteration

#### Step 6: Database Design (Database Architect)
- **Goal**: Design database schema and fields.
- **Input**: Retrieve tasks from `docs/tasks`.
- **Action**: Create database design documents.
- **Completion**: Mark task complete in `docs/tasks` with notes.
- **Format**: `devteam/references/FormatSample/範例-資料庫設計.md`

#### Step 7: Backend Development (Backend Engineer)
- **Goal**: Implement APIs.
- **Input**: Retrieve tasks from `docs/tasks`.
- **Action**: Write backend code/docs based on tasks.
- **Constraint**: Use Serena MCP for code exploration.
- **Completion**: Mark task complete in `docs/tasks` with notes.
- **Format**: `devteam/references/FormatSample/範例-後端開發計劃.md`, `devteam/references/FormatSample/範例-be-t001.md`
- **Reference**: `devteam/references/JobDescription/資深後端工程師_職務說明.md`

#### Step 8: Frontend Development (Frontend Engineer)
- **Goal**: Implement UI and integrate APIs.
- **Input**: Retrieve tasks from `docs/tasks`.
- **Action**: Write frontend code/docs.
- **Constraint**: **MUST** apply `ui-ux-pro-max` skill guidelines.
- **Completion**: Mark task complete in `docs/tasks` with notes.
- **Format**: `devteam/references/FormatSample/範例-前端開發計劃.md`, `devteam/references/FormatSample/範例-fe-t001.md`
- **Reference**: `devteam/references/JobDescription/資深前端工程師_職務說明.md`

### Phase 3: Verification & Deployment

#### Step 9: Testing (QA Engineer)
- **Goal**: Verify quality and identify bugs.
- **Input**: Retrieve testing tasks from `docs/tasks`.
- **Action**:
  1. **Generate Test Cases**: Save to `docs/tests`.
  2. **Execute Tests**: Use `chrome-devtools-mcp` (Browser Automation).
  3. **Record Results**: Annotate pass/fail in `docs/tests`.
- **OpenSpec**: `/opsx:verify` to validate implementation matches artifacts (checks Completeness, Correctness, Coherence)
- **Checks**: UI screenshot, Visual verification, Console error check.
- **Completion**: Mark task complete. If failed → create **BUG Tasks** in `docs/tasks`.
- **Format**: `devteam/references/FormatSample/範例-測試案例.md`
- **Reference**: `devteam/references/JobDescription/資深測試工程師_職務說明.md`

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
- **OpenSpec**: `/opsx:archive` (prompts to sync delta specs if needed, moves change to archive)
- **Reference**: `devteam/references/JobDescription/CI_CD_工程師_職務說明.md`
- **Procedure**:
  1. Wait 3 mins after commit.
  2. Check deployment status via API.
  3. Run E2E tests on Stage site (`devteam/references/Environment/env-sample.md`).
  4. If failed → log to `docs/obstacles.md`.

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
│   ├── plan/                    # Planning documents (Steps 1-5)
│   ├── tasks/                   # Task breakdowns (Step 5+)
│   ├── tests/                   # Test cases (Step 9)
│   ├── env.md                   # Environment config (Step 2)
│   ├── obstacles.md             # Blockers and issues
│   └── CHANGELOG.md             # Change log
└── devteam/
    └── references/
        ├── JobDescription/      # Role definitions
        ├── FormatSample/        # Document templates
        └── StateTemplate/       # State file templates
```

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
