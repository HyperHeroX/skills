<!-- DEVTEAM-RULES-START v1.0 -->

## 🚨 devteam Workflow — Mandatory Rules (Auto-Injected)

> ⚠️ This section is auto-injected by the `devteam` skill. DO NOT remove the markers.
> Version: 1.0 | Source: `devteam/references/config-injection/`

### Session Resume Protocol（會話恢復協議 — MANDATORY）

> **本節為最高優先級流程閘門。任何 AI 在恢復會話或發現待辦任務時，必須在執行任何實作之前完成本協議。**

#### 觸發條件（任一成立即觸發）
- 會話從摘要（summary）或轉錄（transcript）恢復
- 存在來自上一次會話的待辦 TODO 項目
- 使用者說「continue」、「resume」、「繼續」、「接著做」
- `docs/tasks/` 中存在尚未透過 OpenSpec 處理的 task .md 檔案
- `docs/.devteam/status.json` 存在且 `current_step >= 7`（實作階段）

#### 強制動作（按順序執行）
1. **宣告**：「⚠️ 偵測到會話恢復。正在執行 OpenSpec 流程檢查清單。」
2. **讀取狀態**：讀取 `docs/.devteam/status.json` 確認當前步驟
3. **盤點任務**：掃描 `docs/tasks/phase{n}/` 中所有 task .md 檔案
4. **檢查 OpenSpec**：執行 `openspec list --json` 確認現有 changes
5. **映射**：將每個未完成的 task .md 對應到 OpenSpec change
6. **產生執行計畫**：按照工程師執行順序（BE → FE → Test → CI/CD）排列
7. **確認**：向使用者確認執行計畫
8. **執行**：開始 auto-continue loop，直到所有任務完成

#### 核心規則（不可違反）

| 規則 | 說明 |
|------|------|
| **一個 task .md = 一個 OpenSpec change** | Dev Lead 產出的每個 task .md 檔案必須有獨立的 OpenSpec 生命週期 |
| **完整生命週期** | 每個 task 必須完成 `new → continue/ff → apply → verify → archive` 全流程 |
| **循序處理** | 完成一個 task 的完整 OpenSpec 生命週期後，才開始下一個 task |
| **不得停止** | AI 不得在任務之間停止，除非 circuit breaker 觸發或使用者明確說「pause/stop」 |
| **task .md 是唯一真相來源** | `docs/tasks/phase{n}/` 中的 task .md 定義「做什麼」，OpenSpec 追蹤「如何做」 |
| **禁止直接實作** | 未建立對應 OpenSpec change 之前，禁止修改任何原始碼 |

### devteam 開發流程

1. 確認任務是否需要 Skills，並搜尋可用的 Agents、Commands、Skills、References、Tools。
2. 若有合適 Skills → 優先使用 Skills 完成開發；若無 → 使用其他工具。
3. 所有原始碼探索與結構理解 → 優先使用 Serena MCP 工具。
4. 參考 `docs` 與 `openspec` 中既有經驗與規範。
5. 任務實作完成後 → 執行測試驗證。
6. 測試通過後 → 進行 Git Commit，記錄於 `docs/CHANGELOG.md`。
7. 若部署或測試過程中出現問題 → 記錄於 `docs/obstacles.md`，持續修復。
8. 全部任務完成後，通知使用者並等待後續指示。

### 強制指令總結

- 🚨 **強制執行 Session Resume Protocol**：會話恢復時必須先執行 Session Resume Protocol，禁止跳過。
- 🚨 **強制一個 task .md = 一個 OpenSpec change**：Dev Lead 產出的每個 task .md 必須獨立走完 OpenSpec 生命週期（new → continue → apply → verify → archive），完成一個才能開始下一個。
- 🚨 **強制不停止**：AI 在處理 task 序列時不得自行停止，除非 circuit breaker 觸發或使用者明確暫停。
- 強制使用 Skills 進行開發（若有適用 Skills）。
- 強制使用 Serena MCP 工具進行原始碼探索與分析（若可用）。

### OpenSpec & Development Standards

本專案採用 OpenSpec 開發流程規範，所有功能開發必須遵循以下標準：

#### 開發流程模擬 (Dev Team Simulation)
1. **Product Manager**: 需求訪談與確認。
2. **System Architect**: 產出系統架構文件。
3. **System Analyst**: 產出系統分析文件。
4. **Project Manager**: 制定開發計畫與里程碑。
5. **Database Architect**: 資料庫設計。
6. **Dev Lead**: 拆解詳細任務 — 資深全端工程師，必須將所有功能拆解至最小粒度，每個任務 = 一個獨立的 .md 檔案。
7. **Backend/Frontend/QA/CI-CD**: 依據職務說明書進行開發、測試與部署。每個工程師接到 task .md 後，必須使用 OpenSpec 展開完整生命週期。

#### Task .md → OpenSpec Lifecycle Flow

```
FOR EACH task .md:
  1. Read task .md content
  2. /opsx:new <task-id>-<description>
  3. /opsx:continue (or /opsx:ff)
  4. /opsx:apply → implement
  5. /opsx:verify → validate
  6. /opsx:archive → archive
  7. Mark task .md as ✅ complete
  8. IMMEDIATELY move to next task .md
  
  ⚠️ DO NOT STOP between tasks
  ⚠️ DO NOT batch-implement without OpenSpec
  ⚠️ DO NOT skip any lifecycle step
```

<!-- DEVTEAM-RULES-END -->
