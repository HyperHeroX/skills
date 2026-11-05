# HyperHeroX Skills Marketplace

Claude Code plugin marketplace，包含完整軟體開發生命週期、企業高階簡報、研發分析與輔助工具的技能套件。

## 安裝

### 方法一：Public Repo（推薦）

若 repo 為 public，可直接透過 Claude Code 安裝：

```bash
# 1. 新增 marketplace
/plugin marketplace add HyperHeroX/skills

# 2. 安裝 plugins
/plugin install hyperhero-workflow@hyperhero-skills
/plugin install hyperhero-tools@hyperhero-skills

# 3. 重新載入
/reload-plugins
```

### 方法二：Private Repo（手動安裝）

若 repo 為 private，需手動將 plugin 複製到 Claude Code 的 cache 目錄：

```bash
# 1. Clone repo
git clone https://github.com/HyperHeroX/skills.git

# 2. 建立 marketplace 目錄
mkdir -p ~/.claude/plugins/marketplaces/hyperhero-skills/plugins
cp -r skills/plugins/hyperhero-workflow ~/.claude/plugins/marketplaces/hyperhero-skills/plugins/
cp -r skills/plugins/hyperhero-tools ~/.claude/plugins/marketplaces/hyperhero-skills/plugins/
cp skills/.claude-plugin/marketplace.json ~/.claude/plugins/marketplaces/hyperhero-skills/

# 3. 建立 cache 目錄
mkdir -p ~/.claude/plugins/cache/hyperhero-skills/hyperhero-workflow/1.3.0
mkdir -p ~/.claude/plugins/cache/hyperhero-skills/hyperhero-tools/1.1.0
cp -r skills/plugins/hyperhero-workflow/* ~/.claude/plugins/cache/hyperhero-skills/hyperhero-workflow/1.3.0/
cp -r skills/plugins/hyperhero-workflow/.claude-plugin ~/.claude/plugins/cache/hyperhero-skills/hyperhero-workflow/1.3.0/
cp -r skills/plugins/hyperhero-tools/* ~/.claude/plugins/cache/hyperhero-skills/hyperhero-tools/1.1.0/
cp -r skills/plugins/hyperhero-tools/.claude-plugin ~/.claude/plugins/cache/hyperhero-skills/hyperhero-tools/1.1.0/

# 4. 在 ~/.claude/settings.json 的 enabledPlugins 加入：
#    "hyperhero-workflow@hyperhero-skills": true,
#    "hyperhero-tools@hyperhero-skills": true
# 在 extraKnownMarketplaces 加入：
#    "hyperhero-skills": { "source": { "source": "github", "repo": "HyperHeroX/skills" } }

# 5. 重新載入
/reload-plugins
```

## Plugins

### hyperhero-workflow — 開發流程核心

整合 devteam 團隊模擬、AutoDEV 全流程開發、AI Agent Engineering and Secure Development Standard v4.4、CoWork 企業簡報、Stage-Gate 研發分析與 AI 教學規劃評估，完整涵蓋規劃到部署。

#### AI Agent Engineering Standard v4.4

`devteam` 與 `autodev` 共用 `plugins/hyperhero-workflow/references/ai-agent-development-standard-v4.4/` 的 79 檔來源 bundle，以及整合契約。該 bundle 保留 57 項不可變 `MUST` Requirement、Profiles、Policies、Schemas、Lifecycle、Templates 與 Validator；兩個 skill 會以相同 baseline digest、Requirement 對映、Review／Scan／Test／Conformance 與部署證據閘門執行。

#### Slash Commands

| 指令 | 說明 | 範例 |
|------|------|------|
| `/devteam` | 啟動開發團隊模擬 | `/devteam 使用者管理系統` |
| `/devteam-continue` | 恢復中斷的模擬 | `/devteam-continue` |
| `/devteam-reset` | 重設模擬狀態 | `/devteam-reset` |

#### Skills（自動觸發）

| Skill | 說明 | 觸發時機 |
|-------|------|----------|
| **devteam** | 11 步驟開發團隊模擬（需求 → 架構 → 分析 → 規劃 → DB → 拆任務 → 開發 → 測試 → 部署） | 使用 `/devteam` 指令 |
| **autodev** | 10 階段全流程（規劃 → 資安 → Code Review → 測試 → 部署 → UI → 視覺 → 優化 → 驗收） | 提及全流程開發、AutoDEV |
| **dotnet-enterprise** | .NET 10 企業級開發規範（Clean Architecture + DDD + MediatR CQRS） | 涉及 .NET、C#、EF Core、MediatR 等關鍵字 |
| **cowork-presentation** | CoWork 企業高階教學與商業簡報製作規範（16px/18px 最小字級、滿版 SVG、防溢出卡片、演講者備忘稿、台灣標準用語） | 製作企業高階簡報、內訓教材、演講投影片、提及 cowork-presentation |
| **interactive-presentation** | 互動式 HTML 簡報生成（含動畫、流程圖） | 提及簡報、presentation、投影片 |
| **research-refinement** | Stage-Gate Phase 1 研究細化方法論（文獻評估、E# 證據追溯、審查 findings 銷號） | 執行研發 Phase 1 研究報告、文獻評估、研究重置 |
| **system-analysis-doc-set** | Stage-Gate Phase 3 系統分析 13 份架構文件集與 ADR 決策規範 | 執行研發 Phase 3 系統分析、重構架構文件 |
| **course-planner** | AI 教學課程一條龍備課與教案規劃（課綱、講稿、簡報、實作教材） | 準備課程、備課、課綱規劃、教學工作坊 |
| **teaching-evaluator** | AI 教學課程產出品質評估與審查（LO 完整性、四者對齊、時間合理性、事實查核） | 評估教學教材、審查課綱講稿、教學品質確認 |
| **llm-coworker** | 雙模型實作者與驗證者協同工作流（Implementer / Validator） | 跨模型審查、複雜重構驗證、雙重把關 |
| **pgvector-rag-blueprint** | PostgreSQL + pgvector 企業級向量檢索與 RAG 藍圖 | 規劃或建置 RAG、pgvector 向量資料庫 |
| **twaa** | 台灣無障礙標章 TWAA (A/AA/AAA) 自動化檢驗與修正指引 | 提及無障礙、TWAA、A11y、無障礙檢測 |
| **software-contract-spec** | 軟體開發委託合約與驗收規格工程方法論（三階段付款、除不盡尾數規則、責任上限、AI/商業庫免責、附件一6欄位標準、附件二客觀驗收矩陣） | 擬定軟體合約、系統需求附件一、驗收標準附件二、分期付款、合約防衛條款 |
| **devteam-config-sync** | 自動注入 devteam 規則到專案設定 | 專案初始化時 |

#### dotnet-enterprise Skill 詳細說明

此 skill 定義 .NET 10 企業級系統的開發標準，涵蓋：

- **四層架構**：Domain ← Application ← Infrastructure ← Presentation
- **Rich Domain Model**：`private set` + 行為方法，禁止 Anemic Model
- **CQRS with MediatR**：Command/Query + Handler + FluentValidation
- **錯誤處理**：`Ardalis.Result<T>` 替代 Exception
- **ORM 策略**：EF Core（寫入）+ Dapper（複雜查詢）
- **測試策略**：xUnit + NSubstitute + Testcontainers（禁止 In-Memory DB）
- **架構守護**：NetArchTest 確保層次依賴合規

**使用範例：**

```
# 新增功能（自動套用 Clean Architecture 規範）
按照 Clean Architecture 架構新增訂單管理功能

# 架構合規檢查
檢查這段程式碼是否符合 DDD 規範

# 複雜查詢
這個報表查詢效能很差，請用 Dapper 優化
```

### hyperhero-tools — 輔助工具

E2E 瀏覽器測試、使用手冊生成、Ralph Loop 自動迭代、網路排障知識庫、影片字幕生成、AI 新聞摘要。

#### Slash Commands

| 指令 | 說明 | 範例 |
|------|------|------|
| `/ralph-loop` | 啟動自動迭代開發迴圈 | `/ralph-loop "完成所有待辦任務" --max-iterations 10` |
| `/cancel-ralph` | 取消進行中的 Ralph Loop | `/cancel-ralph` |
| `/ralph-help` | 查看 Ralph Loop 使用說明 | `/ralph-help` |

#### Skills（自動觸發）

| Skill | 說明 | 觸發時機 |
|-------|------|----------|
| **e2e-ui-testing** | 瀏覽器 E2E 測試與視覺回歸驗證 | 提及 E2E 測試、UI 測試、視覺驗證 |
| **user-guide-creator** | 含截圖的使用手冊，支援 Markdown + DOCX 匯出 | 提及使用手冊、操作指南 |
| **ralph-loop** | 持續自我引用 AI 迴圈，用於迭代開發 | 使用 `/ralph-loop` 指令 |
| **network-troubleshooting** | 資深網管實戰排障知識庫與 SOP（L1~L7 排查、回滾命令、案例庫沉澱） | 網路斷線、延遲、ping 不通、DNS/防火牆/路由設定 |
| **video-subtitle** | faster-whisper GPU 語音辨識與繁體中文修復字幕產生器 | 影片或音訊轉字幕、產生 .srt、語音轉文字 |
| **ai-news-digest** | 每日焦點 AI 新聞搜尋、事實查核與繁體中文摘要 | 詢問今日 AI 新聞、科技焦點、新聞摘要 |

## 典型工作流程

### 1. 全新功能開發

```
/devteam 使用者認證系統
# → 自動進入 11 步驟團隊模擬
# → PM 需求確認 → SA 架構設計 → DB 設計 → Dev Lead 拆任務
# → 工程師依序實作（自動套用 dotnet-enterprise 規範）
# → QA 測試 → CI/CD 部署
```

### 2. .NET 功能開發（直接觸發規範）

```
新增一個 Order Aggregate，包含 Create、Cancel、Ship 三個行為方法，
加上 MediatR Command 和 FluentValidation，以及 Testcontainers 整合測試
# → 自動觸發 dotnet-enterprise skill
# → 按照 Clean Architecture + DDD 規範產出完整程式碼
```

### 3. 自動迭代修復

```
/ralph-loop "修復所有 E2E 測試失敗的項目" --max-iterations 5
# → AI 自動持續迭代直到所有測試通過或達到上限
```

### 4. 使用手冊生成

```
為目前的系統產生一份使用手冊，包含截圖
# → 自動觸發 user-guide-creator skill
# → 產出 Markdown + DOCX 格式手冊
```

### 5. 企業簡報製作

```
製作一份符合 CoWork 企業高階標準的架構審查簡報
# → 自動觸發 cowork-presentation skill
# → 產出滿版大字級、高對比提示、防溢出 SVG 架構圖與雙螢幕演講者備忘稿
```

## 跨平台支援

所有 hook scripts 已從 bash 改寫為 Node.js（`.mjs`），支援 Windows、Linux、macOS。

## 目錄結構

```
skills/
├── .claude-plugin/marketplace.json
├── plugins/
│   ├── hyperhero-workflow/         # 開發流程核心
│   │   ├── .claude-plugin/plugin.json
│   │   ├── skills/ (13 skills)
│   │   │   ├── autodev/
│   │   │   ├── course-planner/
│   │   │   ├── cowork-presentation/
│   │   │   ├── devteam/
│   │   │   ├── devteam-config-sync/
│   │   │   ├── dotnet-enterprise/
│   │   │   ├── interactive-presentation/
│   │   │   ├── llm-coworker/
│   │   │   ├── pgvector-rag-blueprint/
│   │   │   ├── research-refinement/
│   │   │   ├── system-analysis-doc-set/
│   │   │   ├── teaching-evaluator/
│   │   │   └── twaa/
│   │   ├── commands/ (4 commands)
│   │   ├── scripts/devteam-stop-hook.mjs
│   │   └── references/             # workflow + v4.4 standard bundle
│   └── hyperhero-tools/            # 輔助工具
│       ├── .claude-plugin/plugin.json
│       ├── skills/ (6 skills)
│       │   ├── ai-news-digest/
│       │   ├── e2e-ui-testing/
│       │   ├── network-troubleshooting/
│       │   ├── ralph-loop/
│       │   ├── user-guide-creator/
│       │   └── video-subtitle/
│       ├── commands/ (3 commands)
│       └── scripts/ (ralph-*.mjs, md2docx.py)
├── AGENTS.md
└── README.md
```

## 驗證

```bash
/plugin validate .
```

## License

MIT
