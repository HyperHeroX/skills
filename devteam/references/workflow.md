# devteam Workflow Process

This document contains the detailed 11-step workflow for the devteam skill.

---

## � Language Configuration

**JobDescription Files**: Written in English for AI comprehension.

**Generated Documents**: All outputs (requirements, architecture docs, system analysis, project plans, task files, test cases, etc.) must be in **user's detected language** (the language user is using in conversation).

---

## �🔁 Workflow Process

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
- **Reference**: `devteam/references/JobDescription/Product_Manager.md`

#### Step 2: System Architecture (System Architect)
- **Goal**: Establish system architecture based on specs.
- **Action**:
  1. Create system architecture document.
  2. **Generate `docs/env.md`** based on architecture and environment details.
- **Output**: Save to `docs/plan` (architecture) and `docs` (env.md).
- **OpenSpec**: `/opsx:continue` to create `proposal.md` artifact (or `/opsx:ff` to create all planning artifacts at once)
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
- **OpenSpec**: `/opsx:continue` to create `specs/` and `design.md` artifacts (artifacts are created based on dependency graph)
- **Format**: `devteam/references/FormatSample/範例-開發計劃概述.md`
- **Reference**: `devteam/references/JobDescription/Project_Manager.md`

#### Step 5: Database Design (Database Architect)
- **Goal**: Design database architecture, tables, and column structures.
- **Input**: Read documents `01-requirements.md` through `04-project-plan.md` from `docs/plan`.
- **Action**:
  1. Create database design document: Save `05-database-design.md` to `docs/plan`.
  2. **領取任務時介入 OpenSpec**:
     - 執行 `/opsx:new db-design-<brief-description>`
     - 例如：`/opsx:new db-design-user-authentication-schema`
  3. Design database tables, relationships, indexes, foreign key constraints, etc.
- **Output**: Database design document in `docs/plan/05-database-design.md`.
- **OpenSpec Artifacts**: `proposal.md`, `specs/`, `design.md`, `tasks.md` in `openspec/changes/db-design-<brief-description>/`
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
- **Action**:
  1. **領取任務時介入 OpenSpec**:
     - 執行 `/opsx:new <task-id>-<brief-description>`
     - 例如：`/opsx:new be-t001-user-registration-api`
     - 若有子任務，為每個子任務建立 OpenSpec change
  2. **根據 `docs/plan/05-database-design.md` 執行資料庫遷移或產生作業** (ORM migrations, SQL scripts, etc.)
  3. Write backend code/docs based on task specifications and OpenSpec artifacts.
  4. Use Serena MCP for code exploration.
- **Completion**: Mark backend tasks complete in task files with execution notes and problem-solving details.
- **OpenSpec Artifacts**: `proposal.md`, `specs/`, `design.md`, `tasks.md` in `openspec/changes/<task-id>-<brief-description>/`
- **Format**: `devteam/references/FormatSample/範例-後端開發計劃.md`, `devteam/references/FormatSample/範例-be-t001.md`
- **Reference**: `devteam/references/JobDescription/Senior_Backend_Engineer.md`

#### Step 8: Frontend Development (Frontend Engineer)
- **Goal**: Implement UI and integrate with backend APIs.
- **Input**:
  1. Read all planning documents `01-06` from `docs/plan`.
  2. Read frontend task files from `docs/tasks/phase{n}/fe-t{nnn}.md` (and sub-tasks if exists).
- **Action**:
  1. **領取任務時介入 OpenSpec**:
     - 執行 `/opsx:new <task-id>-<brief-description>`
     - 例如：`/opsx:new fe-t001-login-page-ui`
     - 若有子任務，為每個子任務建立 OpenSpec change
  2. Write frontend code/docs based on task specifications and OpenSpec artifacts.
  3. **MUST** apply `ui-ux-pro-max` skill guidelines.
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
- **Reference**: `devteam/references/JobDescription/Senior_QA_Engineer.md`

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
- **Reference**: `devteam/references/JobDescription/CI_CD_Engineer.md`
- **Procedure**:
  1. Wait 3 mins after commit.
  2. Check deployment status via API.
  3. Run E2E tests on Stage site (`devteam/references/Environment/env-sample.md`).
  4. If failed → log to `docs/obstacles.md` and create deployment bug task.

---

## 👥 Roles & Responsibilities

| Role | Reference File | Notes |
|------|----------------|-------|
| Product Manager | `devteam/references/JobDescription/Product_Manager.md` | Handles Step 1 (requirements gathering) |
| System Architect | `devteam/references/JobDescription/System_Architect.md` | Handles Step 2 (system architecture design) |
| System Analyst | `devteam/references/JobDescription/System_Analyst.md` | Handles Step 3 (system analysis) |
| Project Manager | `devteam/references/JobDescription/Project_Manager.md` | Handles Step 4 (project planning) |
| Database Architect | `devteam/references/JobDescription/System_Architect.md` | Handles Step 5 (database architecture & schema design) |
| Dev Lead | `devteam/references/JobDescription/Dev_Lead_Job_Description.md` | Handles Step 6 (fine-grained task breakdown) - 資深全端工程師, 25年經驗, CISSP證照 |
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
