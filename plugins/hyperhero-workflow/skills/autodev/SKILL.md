---
name: autodev
description: '通用全流程開發技能。指導代理完成完整開發流程：規劃 → 資安 review → code review → 單元測試 → 容器化部署 → 瀏覽器 UI 測試 → 瀏覽器視覺辨識 → 調整優化 → 最終驗收。使用時機：(1) 新專案開發，(2) 功能模組實作，(3) API 端點開發，(4) UI/UX 實作，(5) 測試與部署，(6) 跨專案通用開發流程。強制要求：規劃階段必須使用 devteam skill，所有任務必須通過對應階段的檢查清單，並遵循隨附的 AI Agent Engineering and Secure Development Standard v4.4 與 57 項不可變需求。'
---

# AutoDEV - 通用全流程開發技能

**適用範圍**: 跨專案通用開發流程  
**版本**: 1.2 (整合 OpenSpec SDD 與 AI Agent Standard v4.4)
**標準基線**: AI Agent Engineering and Secure Development Standard `4.4.0` / `77478e2a918e6dc7984f79534abcd5415cdbb07bb2c7de2346aceb03e5484f4f`
**最後更新**: 2026-08-29

---

## 技能描述

本技能定義通用的標準開發流程，確保所有代理在執行開發任務時遵循一致的品質標準。每個功能開發必須依序通過以下十個階段：

**開發流程**: `規劃 → OpenSpec 驅動開發 → 資安 review → code review → 單元測試 → 容器化部署 → 瀏覽器 UI 測試 → 瀏覽器視覺辨識 → 調整優化 → 最終驗收`

---

## AI Agent Engineering Standard v4.4（所有階段強制套用）

開始任何規劃、寫入、程式碼生成、測試、部署或驗收前，先讀取 [v4.4 整合契約](../../references/ai-agent-development-standard-v4.4-integration.md)。完整來源 bundle 位於 [ai-agent-development-standard-v4.4/](../../references/ai-agent-development-standard-v4.4/)，包含需求原文、57 項 Requirement、Profiles、Policies、Schemas、Lifecycle、Templates 與 Validator。

### 強制契約閘門

1. 依整合契約載入不可變需求基線、兩份 Always-on General Profile、專案保護規則、Lifecycle、Task Contract、Security Invariants，以及 Requirement-ID 對應的 Domain／Frontend Profile。
2. 在 preflight 和每個 OpenSpec change 記錄 `standard_version: 4.4.0`、baseline digest、Task ID、lifecycle／SSDLC／risk、直接與間接 Requirement IDs、來源明示條件、允許／禁止路徑、可重用模組、模式決策、測試／review／scan／conformance 計畫。
3. 57 項需求全部維持 `MUST`。管理者關閉 runtime feature 不代表需求已取消；`deferred`、`disabled`、`not-applicable`、`optional`、`capability-ready` 不得被當成完成狀態。
4. Builder 不得核准自己的 Review、Scan 或 Requirement Conformance。Digest、需求對映、證據、Scanner 結果或來源條件無法驗證時，必須 fail closed 為 `BLOCKED`。
5. 最終完成時，實作、測試、文件、Review、Scan、Requirement State、Conformance Manifest、Artifact 與部署證據必須綁定相同 candidate revision 與 baseline digest。

### 57 項需求路由

| 類別 | Requirement IDs | 主要 Profile |
|---|---|---|
| 架構 | `ARCH-REQ-001`–`ARCH-REQ-009` | Architecture／Design Patterns |
| 資安 | `SEC-REQ-001`–`SEC-REQ-009` | Security／Scanning |
| 資料 | `DATA-REQ-001`–`DATA-REQ-004` | Data Management |
| 測試 | `TEST-REQ-001`–`TEST-REQ-007` | Test Engineering／Frontend Testing |
| 管理 | `MGMT-REQ-001`–`MGMT-REQ-006` | Admin Operations |
| 介面 | `UI-REQ-001`–`UI-REQ-017` | Frontend Development／Review |
| AI | `AI-REQ-001`–`AI-REQ-004` | AI Integration |
| 共同開發 | `DEV-REQ-001` | Collaboration／Versioning |

各 Requirement 的原文、條件與最低證據以整合契約及 v4.4 bundle 為準。

---

## 第一階段：規劃 (Planning) - 強制使用 devteam skill

### 目標

使用 devteam skill 進行團隊協作規劃，建立清晰的任務分配和執行計畫。

### 必做事項

#### 1.1 啟動 devteam 規劃

**強制要求**: 所有開發任務在開始前必須使用 devteam skill 進行規劃。

**規劃內容**:
- 任務拆解與分配
- 技術棧確認
- 架構設計決策
- 時程估算
- 風險評估
- 57 項 v4.4 Requirement 的直接／間接對映、來源條件與最低證據
- lifecycle／SSDLC stage、Task Contract、Security Invariants、Review／Scan／Conformance 路由
- 租戶、權限、資料金鑰、事件／SSE、排程、插件、API、UI、AI 與回復／監控邊界

**使用方式**:
```typescript
task(
  category="unspecified-high",
  load_skills=["devteam"],
  prompt="規劃 [任務描述] 的開發流程。

  【規劃範圍】
  1. 任務拆解：將任務分解為可執行的子任務
  2. 技術決策：確認使用的技術棧和架構
  3. 角色分配：前端、後端、測試等角色分配
  4. 時程規劃：各階段預估時間
  5. 風險識別：潛在風險和應對措施

  【輸出要求】
  - 詳細的任務清單
  - 技術架構圖
  - 開發時程表
  - 風險評估報告"
)
```

#### 1.2 確認技術棧

**前端技術棧** (根據專案選擇):
- **React 生態**: React 18+ / Next.js 14+ / TypeScript / Tailwind CSS / Zustand
- **Vue 生態**: Vue 3.5+ / Nuxt 4 / TypeScript / UnoCSS / Pinia
- **其他**: 根據專案需求確認

**後端技術棧** (根據專案選擇):
- **Node.js**: Node.js 20 LTS / Express 4.18+ / TypeScript / Prisma 5.10+
- **Python**: Python 3.11+ / FastAPI / SQLAlchemy
- **Go**: Go 1.21+ / Gin / GORM
- **其他**: 根據專案需求確認

**資料庫** (根據專案選擇):
- PostgreSQL 15+
- MySQL 8.0+
- MongoDB 6.0+
- SQLite (開發環境)

**容器化**:
- Podman 4.8+ / Docker 24+

### 交付物

- [ ] devteam 規劃報告
- [ ] 技術棧確認文件
- [ ] 任務拆解清單
- [ ] 架構設計文件
- [ ] 開發時程表
- [ ] AI Preflight（standard version、baseline digest、Requirement IDs、風險與證據計畫）
- [ ] Requirement-to-module/test/evidence 對映表

---

## 第二階段：開發 (Development) - 強制使用 OpenSpec

### 目標

使用 OpenSpec 規格驅動開發 (SDD) 實作功能需求，確保每個任務/規格都經過完整的 OpenSpec 生命週期。

### 前置條件：OpenSpec 環境檢測 (三層策略)

本 plugin 不再綑綁 OpenSpec 輔助 skills。每個工作流步驟會依可用性自動選擇最佳執行路徑。完整機制參考 `../../references/openspec-integration.md`。

**三層檢測順序：**

```
步驟 1. 檢查是否已安裝 OpenSpec 輔助 skills（例如 openspec-new-change）
        → 有：Tier 1 直接透過 Skill 工具呼叫（最佳體驗）
        → 無：進入步驟 2

步驟 2. 檢查 OpenSpec CLI 是否已安裝
        $ openspec --version
        → 有：Tier 2 使用 CLI 指令（openspec new / apply / verify / archive）
        → 無：進入步驟 3

步驟 3. Tier 3 內建 fallback
        手動建立 docs/openspec/changes/<change-id>/
        包含 proposal.md、specs/、design.md、tasks.md
```

**若用戶希望獲得最佳體驗，建議安裝 OpenSpec：**
```bash
npm install -g @fission-ai/openspec@latest
cd <project-root> && openspec init
```

**完整對應表** 請參考 `../../references/openspec-integration.md`。

### 核心規則：OpenSpec 生命週期 (不可違反)

| 規則 | 說明 |
|------|------|
| **一個任務 = 一個 OpenSpec change** | 每個開發任務（需求/子任務/bug fix）必須有獨立的 OpenSpec 生命週期 |
| **完整生命週期** | 每個任務必須完成 `/opsx:new → /opsx:continue 或 /opsx:ff → /opsx:apply → /opsx:verify → /opsx:archive` |
| **循序處理** | 完成一個任務的完整 OpenSpec 生命週期後，才開始下一個任務 |
| **禁止直接實作** | 未建立對應 OpenSpec change 之前，**禁止修改任何原始碼** |
| **規格即文件** | OpenSpec 產出的 proposal.md、specs/、design.md、tasks.md 即為任務的完整規格文件 |
| **需求可追溯** | 每個 change 必須記錄 v4.4 baseline digest、直接／間接 Requirement IDs、來源明示條件、必要 gates 與證據位置 |
| **Fail closed** | 需求語意偏離、未審查 ID、缺少必要證據、Scanner error 或 Builder 自我核准時，change 不得進入完成狀態 |

### OpenSpec 任務執行流程 (強制)

每個步驟依可用性自動選擇 Tier 1 / Tier 2 / Tier 3（詳見 `../../references/openspec-integration.md`）：

```
┌──────────────────────────────────────────────────────────────┐
│  FOR EACH 開發任務:                                          │
├──────────────────────────────────────────────────────────────┤
│  1. 讀取任務需求描述                                         │
│                                                              │
│  2. 建立 change（proposal + specs + design + tasks）         │
│     Tier 1: Skill(skill: "openspec-new-change")              │
│     Tier 2: openspec new <task-id>-<description>             │
│     Tier 3: 手動建立 docs/openspec/changes/<id>/             │
│                                                              │
│  3. 完善規格                                                 │
│     Tier 1: openspec-continue-change / openspec-ff-change    │
│     Tier 2: 編輯 proposal.md / specs/ / design.md            │
│     Tier 3: 同 Tier 2                                        │
│                                                              │
│  4. 實作程式碼                                               │
│     Tier 1: openspec-apply-change                            │
│     Tier 2: openspec apply <change-id>                       │
│     Tier 3: 依 specs/ 和 tasks.md 手動實作                   │
│                                                              │
│  5. 驗證實作                                                 │
│     Tier 1: openspec-verify-change                           │
│     Tier 2: openspec verify <change-id>                      │
│     Tier 3: 對照 specs 手動檢查 + 執行 tasks.md 中的測試     │
│                                                              │
│  6. 歸檔 change                                              │
│     Tier 1: openspec-archive-change                          │
│     Tier 2: openspec archive <change-id>                     │
│     Tier 3: 移至 docs/openspec/archived/<change-id>/         │
│                                                              │
│  7. 標記任務為 ✅ 完成                                        │
│  8. 立即開始下一個任務                                       │
│                                                              │
│  ⚠️ 禁止跳過任何生命週期步驟                                 │
│  ⚠️ 禁止未建立 OpenSpec change 就修改原始碼                   │
│  ⚠️ 禁止同時進行多個 OpenSpec change                         │
└──────────────────────────────────────────────────────────────┘
```

### 必做事項

#### 2.0 v4.4 Change Contract

- 在 `proposal.md`、`design.md` 或等價 change metadata 中保留 `standard_version: 4.4.0`、baseline digest、Task ID、lifecycle／SSDLC／risk、Requirement IDs、source conditions、allowed／forbidden paths 與 required gates。
- 在 `specs/` 將需求行為、租戶／權限／資料／事件／錯誤／管理頁／UI／AI 邊界與驗收證據逐條對映；不要以「之後處理」或 runtime 關閉取代需求。
- 使用 [v4.4 整合契約](../../references/ai-agent-development-standard-v4.4-integration.md) 的 Domain routing；需求、Review、Scan、Test、Conformance 與 Artifact 必須指向同一 candidate revision。

#### 2.1 編碼規範

- **TypeScript**: 嚴格模式，禁止 `any`，完整型別定義
- **命名規範**: 組件 PascalCase、函數 camelCase、常量 UPPER_SNAKE_CASE
- **代碼風格**: ESLint + Prettier 統一格式
- **註解**: 關鍵邏輯必須註解，複雜函數必須 JSDoc

#### 2.2 前端開發工作流程 (OpenSpec + UI-UX 視覺規劃)

**適用範圍**: 所有前端 UI 開發任務

**工作流程**: OpenSpec 生命週期 + UI-UX 視覺規劃 (強制)

**OpenSpec 前端任務執行**:

```
FOR EACH 前端任務:
  1. /opsx:new fe-<task-id>-<description>
     → proposal 必須明確宣告使用 ui-ux-pro-max skill
  2. /opsx:continue → 完善 specs 和 design
  3. /opsx:apply → 實作（必須使用 ui-ux-pro-max skill）
  4. /opsx:verify → 驗證 UI/UX 符合規格
  5. /opsx:archive → 歸檔
```

**必做事項**:

1. **UI/UX 設計系統規劃**（在 `/opsx:new` 階段定義）
   - 使用 ui-ux-pro-max skill 生成設計系統
   - 確認色彩、字體、間距系統
   - 建立組件庫規範

2. **無障礙設計**
   - 符合 WCAG 2.1 AA 標準
   - 色彩對比度 ≥ 4.5:1
   - 鍵盤導航支援
   - 螢幕閱讀器支援

3. **響應式設計**
   - Mobile-first 優先
   - 支援多種裝置尺寸
   - 觸控友善設計

**設計檢查清單**:
- [ ] 色彩對比度 ≥ 4.5:1 (WCAG AA)
- [ ] 使用專案色系
- [ ] 避免過度裝飾，保持專業簡潔
- [ ] 資訊密度適中
- [ ] 錯誤狀態清晰可見
- [ ] 成功狀態明確反饋

**交付物**:
- [ ] OpenSpec change artifacts (proposal.md, specs/, design.md, tasks.md)
- [ ] UI-UX 設計系統配置
- [ ] 關鍵頁面/組件視覺規範
- [ ] 無障礙檢查結果

#### 2.3 後端開發工作流程 (OpenSpec + 迭代循環)

**適用範圍**: 所有後端 API、服務層、資料庫操作開發

**工作流程**: OpenSpec 生命週期 + 迭代循環開發 (強制)

**迭代循環模式選擇**（二選一）:

| 模式 | 適用場景 | 機制 |
|------|----------|------|
| **Ultrawork Loop** | 單次會話內可完成的任務、需要精細控制每個循環階段 | 手動 5 階段循環（分析→實作→測試→驗證→覆盤） |
| **Ralph Loop** | 需要多次迭代自動修正的任務、綠地專案、有明確成功標準 | 自動化迴圈（同一 prompt 反覆執行，AI 看到前次結果持續改進） |

**OpenSpec 後端任務執行**:

```
FOR EACH 後端任務:
  1. /opsx:new be-<task-id>-<description>
     → 建立 proposal、specs、design、tasks
  2. /opsx:continue → 完善規格細節
  3. /opsx:apply → 啟動迭代循環實作（選擇 Ultrawork Loop 或 Ralph Loop）

     ┌─ 選項 A: Ultrawork Loop ───────────────────┐
     │ 1. 分析：理解 OpenSpec specs 中的需求         │
     │ 2. 實作：最小可行程式碼                       │
     │ 3. 測試：執行單元測試                         │
     │ 4. 驗證：手動測試 API                         │
     │ 5. 覆盤：檢查代碼品質                         │
     │ ↻ 循環直到全部通過                            │
     └───────────────────────────────────────────────┘

     ┌─ 選項 B: Ralph Loop ─────────────────────────┐
     │ /ralph-loop "依據 OpenSpec specs 實作          │
     │   <task-id>-<description>。                    │
     │   完成條件：所有測試通過、覆蓋率 ≥ 80%。       │
     │   完成時輸出 <promise>TASK COMPLETE</promise>" │
     │   --max-iterations 15                          │
     │   --completion-promise "TASK COMPLETE"          │
     │                                                │
     │ ↻ 自動迭代直到 promise 觸發或達最大次數        │
     └────────────────────────────────────────────────┘

  4. /opsx:verify → 驗證實作符合 OpenSpec 規格
  5. /opsx:archive → 歸檔完成的 change
```

**選項 A: Ultrawork Loop 循環階段**（在 `/opsx:apply` 內執行）:
| 階段 | 行動 | 驗證標準 |
|------|------|----------|
| **1. 分析** | 理解 OpenSpec specs 中的需求、識別依賴 | 明確的輸入/輸出定義 |
| **2. 實作** | 最小可行程式碼 | 通過編譯 (TypeScript/Go/etc.) |
| **3. 測試** | 執行單元測試 | 新測試通過、覆蓋率達標 |
| **4. 驗證** | 手動測試 API | curl/Postman 回應正確 |
| **5. 覆盤** | 檢查代碼品質 | Linting 通過、無技術債 |

**選項 B: Ralph Loop 設定建議**:
| 參數 | 建議值 | 說明 |
|------|--------|------|
| `--max-iterations` | 10-20 | 防止無限循環 |
| `--completion-promise` | `"TASK COMPLETE"` | 成功完成信號 |
| prompt 內容 | 引用 OpenSpec specs 路徑 | 確保每次迭代都參照規格 |

**循環終止條件**（兩種模式共用）:
- ✅ 所有 OpenSpec specs 中定義的功能需求已實作
- ✅ 所有測試通過 (覆蓋率 ≥ 80%)
- ✅ 手動驗證通過 (API 測試)
- ✅ 代碼審查通過 (Linting + 編譯)
- ✅ 無已知 bug 或技術債

**交付物**:
- [ ] OpenSpec change artifacts (proposal.md, specs/, design.md, tasks.md)
- [ ] 迭代循環記錄（Ultrawork Loop 記錄 或 Ralph Loop 迭代 log）
- [ ] 最終實作程式碼
- [ ] 測試報告 (覆蓋率、通過狀態)

### 交付物

- [ ] **OpenSpec artifacts**: 每個任務的 proposal.md、specs/、design.md、tasks.md
- [ ] 完整功能程式碼
- [ ] 型別定義 (TypeScript/Go/etc.)
- [ ] 資料庫 Schema 更新 (如有需要)
- [ ] API 文件更新 (如有新增端點)
- [ ] **前端專屬**: UI-UX 設計系統規劃報告 + OpenSpec change archives
- [ ] **後端專屬**: 迭代循環開發記錄（Ultrawork Loop 或 Ralph Loop）+ OpenSpec change archives

---

## 第三階段：資安 Review

### 目標

確保代碼符合安全性標準，防範常見安全漏洞。

### 必做事項

#### 3.1 認證與授權

- [ ] JWT 配置正確 (有效期、簽名算法)
- [ ] 密碼加密 (bcrypt/argon2)
- [ ] Session 管理
- [ ] Role-based Access Control (RBAC)

#### 3.2 輸入驗證

- [ ] 所有使用者輸入驗證
- [ ] SQL Injection 防範
- [ ] XSS 防範
- [ ] CSRF Token 驗證

#### 3.3 HTTP 安全標頭

- [ ] Content-Security-Policy
- [ ] X-Frame-Options
- [ ] X-Content-Type-Options
- [ ] Strict-Transport-Security

#### 3.4 敏感資料保護

- [ ] 環境變數管理 (.env)
- [ ] 敏感資料加密
- [ ] 日誌不包含敏感資訊

#### 3.5 v4.4 Security and Data Controls

- [ ] 每個頁面操作、API、Service、Job、Event、File、Plugin 與 Scheduler 均由同一權威 RBAC／Tenant Permission 在伺服器端驗證
- [ ] 首次啟動最高管理者初始化、最小權限、防止自行提權與管理者跨租戶查探 Audit 已驗證
- [ ] Token 為主要鑑權、OAuth 為第二選項；2FA／Authenticator／PassKey／Email Verify Code 與管理者強制繼承行為已驗證
- [ ] CORS 可由系統管理頁設定；系統／程式 Log 分級；對外例外資訊已遮蔽
- [ ] 三層金鑰、一次顯示、上層包覆、環境變數根金鑰、快取持久化、鏈式驗證、備份下載政策／範圍／還原與稽核已納入 Review

**詳細檢查清單**: [references/phase-checklists/phase-1-security.md](../../references/phase-checklists/phase-1-security.md)

### 交付物

- [ ] 資安檢查報告
- [ ] 漏洞修復記錄
- [ ] 安全配置文件

---

## 第四階段：Code Review

### 目標

確保代碼品質、可維護性和效能。

### 必做事項

#### 4.1 型別安全

- [ ] TypeScript 嚴格模式無錯誤
- [ ] 禁止 `any` 型別
- [ ] 完整型別定義

#### 4.2 代碼品質

- [ ] ESLint 無警告/錯誤
- [ ] Prettier 格式統一
- [ ] 無重複代碼
- [ ] 函數複雜度合理

#### 4.3 架構設計

- [ ] 符合專案架構規範
- [ ] 關注點分離
- [ ] 依賴注入正確
- [ ] 模組化設計

#### 4.4 效能考量

- [ ] 資料庫查詢優化
- [ ] N+1 查詢問題排查
- [ ] 快取策略
- [ ] 前端打包優化

#### 4.5 v4.4 Architecture and Pattern Governance

- [ ] 新模組、核心用例、跨模組整合與重大重構均有 Pattern Decision；至少比較維持簡單設計與候選模式
- [ ] DI／IoC、Event Bus、模組契約、IPC、Worker、OpenAPI、SSE、排程 Adapter、插件邊界與版本規則已對映到實作與測試
- [ ] 檢查 Singleton／Cache 的租戶洩漏、Observer 未解除、事件循環、無界責任鏈、God Facade／Mediator、任意反射／動態載入及以 Proxy／UI 作唯一授權邊界
- [ ] 例外、取消、逾時、重試、冪等、併發、資源釋放、可觀測性與 rollback 行為已審查

**詳細檢查清單**: [references/phase-checklists/phase-2-code-review.md](../../references/phase-checklists/phase-2-code-review.md)

### 交付物

- [ ] Code Review 報告
- [ ] 重構建議
- [ ] 效能優化建議

---

## 第五階段：單元測試

### 目標

確保代碼邏輯正確，測試覆蓋率達標。

### 必做事項

#### 5.1 測試框架

**前端**: Vitest + Vue Test Utils / Jest + React Testing Library  
**後端**: Jest/Vitest + Supertest / pytest / Go testing

#### 5.2 測試覆蓋率

- **最低要求**: ≥ 80%
- **核心邏輯**: 100%
- **工具**: coverage reports (Istanbul/c8/coverage.py/go test -cover)

#### 5.3 測試類型

- [ ] 單元測試 (函數/方法)
- [ ] 集合／整合測試 (最小單元順序、資料傳遞、呼叫與完整流向)
- [ ] 壓力測試 (大量請求吞吐、飽和、錯誤與恢復)
- [ ] 基準測試 (固定工作負載、環境指紋；環境／硬體變更後重測)
- [ ] 併發測試 (Race、Deadlock、Ordering、Duplicate、Idempotency、Resource Contention)
- [ ] 白箱、灰箱、淺黑箱、黑箱測試 (依知情程度建立計畫與報告)
- [ ] 組件測試 (前端)
- [ ] E2E 測試 (頁面串接後可在啟動時自動執行)
- [ ] Requirement Conformance 測試 (每個直接／間接 Requirement ID 的最低證據)

**測試範例**: [references/test-examples.md](../../references/test-examples.md)

### 交付物

- [ ] 測試檔案
- [ ] 測試覆蓋率報告 (≥ 80%)
- [ ] 測試執行記錄

---

## 第六階段：容器化部署

### 目標

建立可重現的部署環境，確保開發/生產一致性。

### 必做事項

#### 6.1 Dockerfile

- [ ] 多階段構建 (Multi-stage build)
- [ ] 基礎映像檔版本鎖定
- [ ] 最小化映像檔大小
- [ ] 非 root 使用者運行

#### 6.2 Docker Compose

- [ ] 服務定義清晰
- [ ] 環境變數配置
- [ ] 網路配置
- [ ] Volume 掛載

#### 6.3 資料庫遷移

- [ ] Migration 腳本
- [ ] 種子資料 (Seed data)
- [ ] 回滾策略

#### 6.4 健康檢查

- [ ] Health check endpoint
- [ ] Container 健康檢查配置
- [ ] 日誌管理

#### 6.5 v4.4 Runtime Readiness

- [ ] Cache、checkpoint、job、SSE 狀態與未完行為可持久化並在重啟後恢復
- [ ] Tenant／RBAC／Audit、資料庫備份與範圍下載、資源管理、插件／檔案／權限管理頁均有運行時驗證
- [ ] 版本號、candidate revision、baseline digest、migration、rollback、monitoring 與健康證據可追溯

**部署指南**: [references/deployment-guide.md](../../references/deployment-guide.md)

### 交付物

- [ ] Dockerfile
- [ ] docker-compose.yml
- [ ] Migration 腳本
- [ ] 部署文件

---

## 第七階段：瀏覽器 UI 測試

### 目標

驗證使用者流程和功能正確性。

### 必做事項

#### 7.1 E2E 測試框架

**推薦**: Playwright / Cypress

#### 7.2 測試範圍

- [ ] 關鍵使用者流程
- [ ] 表單提交驗證
- [ ] 導航流程
- [ ] 錯誤處理流程

#### 7.3 跨瀏覽器測試

- [ ] Chrome/Edge
- [ ] Firefox
- [ ] Safari (如適用)

#### 7.4 響應式測試

- [ ] Desktop
- [ ] Tablet
- [ ] Mobile

#### 7.5 v4.4 管理與資料邊界

- [ ] UI 可執行元件與所有直接請求均通過 RBAC／租戶權限
- [ ] SSE 狀態、通知已讀／刪除、登入資訊／帳號功能、版本與資源狀態顯示正確
- [ ] API OpenAPI 互動頁、排程、插件、檔案、備份下載與權限管理頁的資料範圍和 Audit 正確

**測試範例**: [references/test-examples.md](../../references/test-examples.md)

### 交付物

- [ ] E2E 測試腳本
- [ ] 測試執行報告
- [ ] 失敗案例分析

---

## 第八階段：瀏覽器視覺辨識

### 目標

確保 UI 視覺一致性，檢測視覺回歸問題。

### 必做事項

#### 8.1 視覺回歸測試

- [ ] 螢幕快照比對
- [ ] Pixel diff 閾值設定
- [ ] 全頁截圖
- [ ] 組件截圖

#### 8.2 響應式視覺檢查

- [ ] 多種裝置尺寸快照
- [ ] 佈局一致性檢查
- [ ] 字體渲染檢查

#### 8.3 無障礙視覺檢查

- [ ] 色彩對比度
- [ ] 焦點指示器可見性
- [ ] 螢幕閱讀器相容性

#### 8.4 v4.4 Interface Requirements

- [ ] RWD、AA、可替換 Theme／i18n、關鍵設定儲存按鈕、指定即時儲存、滑桿與懶惰載入
- [ ] 高對比、即時儀表板、顯示版本、可設定回到最上、通知閱覽／已讀／刪除、登入資訊、側邊欄摺疊、字型大小與共用組件

**視覺檢查項目**: [references/visual-testing.md](../../references/visual-testing.md)

### 交付物

- [ ] 視覺回歸測試腳本
- [ ] 快照比對報告
- [ ] 視覺問題清單

---

## 第九階段：調整優化

### 目標

提升效能、改善 UX、優化代碼。

### 必做事項

#### 9.1 效能優化

**前端**:
- [ ] Lighthouse ≥ 90 分
- [ ] First Contentful Paint < 1.8s
- [ ] Time to Interactive < 3.9s
- [ ] Bundle size 優化
- [ ] 圖片優化 (WebP/AVIF)

**後端**:
- [ ] API 回應時間 < 200ms
- [ ] 資料庫查詢優化
- [ ] 快取策略實作
- [ ] 併發處理優化

#### 9.2 UX 改善

- [ ] 載入狀態提示
- [ ] 錯誤訊息友善
- [ ] 操作流程簡化
- [ ] 無障礙優化

#### 9.3 代碼重構

- [ ] 消除技術債
- [ ] 提取共用邏輯
- [ ] 改善命名
- [ ] 增強型別定義
- [ ] 保留所有 v4.4 必備能力、Requirement IDs、租戶／權限／稽核／狀態／排程／備份邊界與證據
- [ ] 未以效能、簡化或框架偏好刪除需求；任何模式或抽象替換都有相容性與回復計畫

**優化清單**: [references/optimization-checklist.md](../../references/optimization-checklist.md)

### 交付物

- [ ] 效能優化報告 (Lighthouse/API 測試)
- [ ] UX 改善建議
- [ ] 重構記錄

---

## 第十階段：最終驗收

### 目標

確認所有需求已實作，品質標準已達成。

### 必做事項

#### 10.1 需求符合度檢查

- [ ] 所有功能需求已實作
- [ ] 所有 API 端點正確
- [ ] 所有 UI 頁面完整
- [ ] 57 項 Requirement 均可追溯；所有直接／間接 Requirement IDs 已由獨立 Conformance Agent 審查
- [ ] 沒有未核准語意偏離、未揭露 Scope Drift、Forbidden state、未審查變更或 Builder 自我核准

#### 10.2 品質標準檢查

- [ ] 測試覆蓋率 ≥ 80%
- [ ] 無安全漏洞
- [ ] 效能符合標準
- [ ] 無障礙標準符合

#### 10.3 文件完整性

- [ ] API 文件完整
- [ ] 部署文件完整
- [ ] 使用者文件完整

#### 10.4 驗收報告

**詳細檢查清單**: [references/acceptance-checklist.md](../../references/acceptance-checklist.md)  
**報告模板**: [references/acceptance-template.md](../../references/acceptance-template.md)

驗收報告必須包含 standard version、baseline digest、candidate revision、Requirement Conformance Manifest、Build／Test／Review／Scan／部署證據、未核准偏離與 rollback／monitoring 結果。任一必要證據缺失時維持 `BLOCKED`，不得宣告完成。

### 交付物

- [ ] 最終驗收報告
- [ ] 功能清單確認
- [ ] 品質指標報告
- [ ] 部署就緒確認

---

## 使用範例

### 完整開發任務（使用 devteam 規劃 + OpenSpec 開發）

```typescript
// 第一階段：規劃（強制使用 devteam）
// 第二階段：開發（強制使用 OpenSpec）
task(
  category="unspecified-high",
  load_skills=["devteam", "autodev"],
  prompt="規劃並開發使用者認證系統。

  【第一階段：規劃】
  使用 devteam skill 進行規劃：
  1. 任務拆解：前端登入頁、後端 API、資料庫設計
  2. 技術決策：JWT vs Session、密碼加密方式
  3. 角色分配：前端工程師、後端工程師、測試工程師

  【第二階段：開發（OpenSpec 驅動）】
  每個任務都必須使用 OpenSpec 生命週期：
  1. /opsx:new <task-id>-<description> → 建立規格
  2. /opsx:continue → 完善規格
  3. /opsx:apply → 實作程式碼
  4. /opsx:verify → 驗證實作
  5. /opsx:archive → 歸檔

  【後續階段】
  依據規劃結果執行 AutoDEV 流程：
  - 資安 review → code review → 單元測試
  - 容器化部署 → UI 測試 → 視覺辨識 → 優化 → 最終驗收"
)
```

### 前端開發任務（OpenSpec + ui-ux-pro-max）

```typescript
task(
  category="visual-engineering",
  load_skills=["autodev", "ui-ux-pro-max"],
  prompt="實作響應式儀表板頁面。

  【OpenSpec 生命週期】
  1. /opsx:new fe-dashboard-responsive-ui
     → proposal 宣告使用 ui-ux-pro-max skill
  2. /opsx:continue → 完善設計規格
  3. /opsx:apply → 實作（必須使用 ui-ux-pro-max）
     - 生成設計系統
     - 遵循設計系統實作組件
     - 使用原子化 CSS (UnoCSS/Tailwind)
     - 實作表單驗證與錯誤提示
  4. /opsx:verify → 驗證 UI/UX
     - 視覺回歸測試
     - RWD 響應式測試
     - 無障礙測試 (WCAG 2.1 AA)
  5. /opsx:archive → 歸檔完成"
)
```

### 後端開發任務 — 方式 A：OpenSpec + Ultrawork Loop

```typescript
task(
  category="ultrabrain",
  load_skills=["autodev"],
  prompt="實作 RESTful API 端點。

  【OpenSpec 生命週期 + Ultrawork Loop】
  1. /opsx:new be-user-api-endpoints
     → 建立 proposal、specs、design、tasks
  2. /opsx:continue → 完善 API 規格
  3. /opsx:apply → 啟動 Ultrawork Loop 實作
     【循環 1：基礎架構】建立路由和控制器
     【循環 2：核心邏輯】實作業務邏輯
     【循環 3：資料整合】連接資料庫
     【循環 4：優化與文件】重構、註解、文件
     【循環終止條件】
     - 所有 OpenSpec specs 中的邏輯正確實作
     - 單元測試全部通過 (覆蓋率 ≥ 80%)
     - API 手動測試通過
     - 程式碼審查通過
  4. /opsx:verify → 驗證實作符合 OpenSpec 規格
  5. /opsx:archive → 歸檔完成"
)
```

### 後端開發任務 — 方式 B：OpenSpec + Ralph Loop

```typescript
task(
  category="ultrabrain",
  load_skills=["autodev"],
  prompt="實作 RESTful API 端點。

  【OpenSpec 生命週期 + Ralph Loop】
  1. /opsx:new be-user-api-endpoints
     → 建立 proposal、specs、design、tasks
  2. /opsx:continue → 完善 API 規格
  3. /opsx:apply → 使用 Ralph Loop 自動迭代實作
     /ralph-loop '依據 openspec/changes/be-user-api-endpoints/ 中的
       specs 和 design 實作所有 API 端點。
       驗收標準：
       - 所有 OpenSpec specs 中的功能已實作
       - 單元測試覆蓋率 ≥ 80% 且全部通過
       - API 手動測試通過 (curl/Postman)
       - ESLint + TypeScript 編譯通過
       完成時輸出 <promise>TASK COMPLETE</promise>'
       --max-iterations 15
       --completion-promise 'TASK COMPLETE'
  4. /opsx:verify → 驗證實作符合 OpenSpec 規格
  5. /opsx:archive → 歸檔完成"
)
```

---

## 參考文件導航

| 文件 | 說明 |
|------|------|
| [references/planning-guide.md](../../references/planning-guide.md) | 規劃階段詳細指南（devteam 使用） |
| [references/development-workflows.md](../../references/development-workflows.md) | 開發工作流程詳解 |
| [references/test-examples.md](../../references/test-examples.md) | 單元測試與 E2E 測試範例 |
| [references/deployment-guide.md](../../references/deployment-guide.md) | 容器化部署完整指南 |
| [references/visual-testing.md](../../references/visual-testing.md) | 視覺回歸測試指南 |
| [references/optimization-checklist.md](../../references/optimization-checklist.md) | 效能優化檢查清單 |
| [references/acceptance-checklist.md](../../references/acceptance-checklist.md) | 最終驗收完整檢查清單 |
| [references/acceptance-template.md](../../references/acceptance-template.md) | 最終驗收報告模板 |
| [references/phase-checklists/](../../references/phase-checklists/) | 各階段詳細檢查清單 |
| [references/ai-agent-development-standard-v4.4-integration.md](../../references/ai-agent-development-standard-v4.4-integration.md) | v4.4 標準載入順序、57 項需求路由、devteam／AutoDEV 閘門與證據契約 |
| [references/ai-agent-development-standard-v4.4/](../../references/ai-agent-development-standard-v4.4/) | v4.4 完整來源 bundle：需求、Profiles、Policies、Schemas、Templates、Lifecycle、Validator |

---

## 技能維護

本技能應隨開發實踐演進持續更新。

**最後更新**: 2026-03-19
