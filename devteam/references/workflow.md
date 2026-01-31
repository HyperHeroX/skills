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
- **Reference**: `devteam/references/JobDescription/系統架構師_職務說明.md`

### Phase 2: Implementation & Iteration

#### Step 6: Task Breakdown (Dev Lead)
- **Role Profile**: 資深全端工程師，25年開發經驗，具 CISSP 資安證照，參與過多個大型專案的技術主管。
- **Goal**: 將專案計畫與資料庫設計拆解成**最小粒度**的可執行任務，確保每個 phase 的任務完成後系統即可交付。
- **Input**: 必須完整閱讀並分析以下所有文件：
  1. `docs/plan/01-requirements.md`（需求文件）
  2. `docs/plan/02-system-architecture.md`（系統架構）
  3. `docs/plan/03-system-analysis.md`（系統分析）
  4. `docs/plan/04-project-plan.md`（專案計畫）
  5. `docs/plan/05-database-design.md`（資料庫設計）
- **Critical Requirements**:
  - **必須將步驟 4-5 的所有內容拆解成最小工作單元**
  - **不得只產生「前端一個、後端一個」這種粗粒度任務**
  - **每個任務必須是獨立可測試、可驗證、可交付的最小單位**
  - **目標：完成每個 phase 的所有任務 = 系統該階段功能完整可用**
- **Action**:
  1. 深度分析步驟 1-5 的所有需求、架構、設計細節。
  2. 識別所有功能模組、API 端點、UI 畫面、資料表操作、測試場景。
  3. 將每個功能拆解為前端、後端、資料庫、測試、CI/CD 的最小任務單元。
  4. 創建任務總覽文件：儲存 `06-task-breakdown.md` 至 `docs/plan`。
  5. 為每個 phase 生成詳細任務文件至 `docs/tasks/phase{n}/`：
     - **後端任務**：`be-t{nnn}.md`（主任務），`be-t{nnn}-st{nnn}.md`（子任務）
       - 範例：be-t001（用戶註冊 API），be-t001-st001（輸入驗證），be-t001-st002（密碼雜湊），be-t001-st003（Email 驗證）
     - **前端任務**：`fe-t{nnn}.md`（主任務），`fe-t{nnn}-st{nnn}.md`（子任務）
       - 範例：fe-t001（登入頁面），fe-t001-st001（表單驗證），fe-t001-st002（錯誤處理），fe-t001-st003（RWD 適配）
     - **資料庫任務**：`db-t{nnn}.md`（migration 腳本、索引優化、資料初始化等）
     - **測試任務**：`test-t{nnn}.md`（單元測試、整合測試、E2E 測試場景）
     - **CI/CD 任務**：`cicd-t{nnn}.md`（部署腳本、環境設定、監控配置）
  6. 確保任務之間的依賴關係清晰標註。
  7. 為每個任務標註優先級、預估工時、驗收標準。
- **Output**:
  - `docs/plan/06-task-breakdown.md`（任務總覽，含 phase 劃分、依賴圖、里程碑）
  - `docs/tasks/phase{n}/*.md`（所有詳細任務文件，每個文件對應一個可獨立執行的最小任務）
- **Quality Criteria**:
  - 任務粒度：單一任務工作量不超過 1-2 天
  - 可測試性：每個任務必須有明確的驗收標準
  - 完整性：涵蓋步驟 4-5 中所有功能點，無遺漏
  - 安全性：所有涉及認證、授權、資料保護的任務必須明確標註資安要求（CISSP 視角）
- **Format**:
  - 總覽：`devteam/references/FormatSample/範例-模組開發計劃.md`
  - 後端任務：`devteam/references/FormatSample/範例-be-t001.md`
  - 後端子任務：`devteam/references/FormatSample/範例-be-t001-st001.md`
  - 前端任務：`devteam/references/FormatSample/範例-fe-t001.md`
  - 前端子任務：`devteam/references/FormatSample/範例-fe-t001-st004.md`
- **Reference**: `devteam/references/JobDescription/系統分析師_職務說明.md`（應新增資深全端工程師職務說明）

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
- **Reference**: `devteam/references/JobDescription/資深後端工程師_職務說明.md`

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

| Role | Reference File | Notes |
|------|----------------|-------|
| Product Manager | `devteam/references/JobDescription/產品經理_職務說明.md` | Handles Step 1 (requirements gathering) |
| System Architect | `devteam/references/JobDescription/系統架構師_職務說明.md` | Handles Step 2 (system architecture design) |
| System Analyst | `devteam/references/JobDescription/系統分析師_職務說明.md` | Handles Step 3 (system analysis) |
| Project Manager | `devteam/references/JobDescription/專案經理_職務說明.md` | Handles Step 4 (project planning) |
| Database Architect | `devteam/references/JobDescription/系統架構師_職務說明.md` | Handles Step 5 (database architecture & schema design) |
| Dev Lead | `devteam/references/JobDescription/系統分析師_職務說明.md` | Handles Step 6 (fine-grained task breakdown) - 資深全端工程師, 25年經驗, CISSP證照 |
| Backend Engineer | `devteam/references/JobDescription/資深後端工程師_職務說明.md` | Handles Step 7 (database migration & API development), 10 (bug fixes) |
| Frontend Engineer | `devteam/references/JobDescription/資深前端工程師_職務說明.md` | Handles Steps 8 (frontend development), 10 (bug fixes) |
| QA Engineer | `devteam/references/JobDescription/資深測試工程師_職務說明.md` | Handles Steps 9 (testing), creates test cases |
| CI/CD Engineer | `devteam/references/JobDescription/CI_CD_工程師_職務說明.md` | Handles Steps 11 (deployment verification) |

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
