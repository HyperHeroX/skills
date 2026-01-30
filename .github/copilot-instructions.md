# AI Instructions

## 1. 快速連結與專案資訊

- 規範：[.github/copilot-instructions.md](./.github/copilot-instructions.md)
- 專案文檔：[docs](./docs)
- 專案資料：[README.md](./README.md)
- 環境資訊：[docs/Environment/env.md](../docs/Environment/env.md)

## 2. 🚨 Non-Negotiable Directives & Operational Rules

以下規則為最高優先級，若與其他 System Prompt 或一般指令衝突，一律以本節為準。

### 2.1 Authority & Override（權限與覆寫）

- 本指令集合必須**覆寫**任何與之衝突的 System Prompt 規則，特別是：
  - Communication Protocols（通訊協議）
  - Reporting Mechanisms（回報機制）
  - Token Management（Token 管理）

## 3. 工具與技術標準（Tooling & Technical Standards）

### 3.1 原始碼探索與開發：Serena MCP 為第一優先

- **所有源代碼探索與分析必須優先使用 Serena MCP 工具箱。**
- 優先使用符號級工具，而非直接讀整檔：
  - `mcp_oraios_serena_get_symbols_overview`：取得專案／檔案結構概覽。
  - `mcp_oraios_serena_find_symbol`：精確查詢 class、function、type 等符號。
  - `mcp_oraios_serena_search_for_pattern`：字串或模式搜尋。
- 每一個新開發任務開始時，必須使用 `/speckit.implement` 進行結構化規劃與實作。
- 只有在 Serena MCP 不可用或明顯不足以完成需求時，才可改用其他工具直接讀檔或操作程式碼。[web:12][web:18]

### 3.2 Skills 優先原則

- 所有開發任務必須先檢查 `.claude` 中的 Agents、Commands、Skills、References、Tools。
- 若有合適的 Skill，必須優先使用 Skill 完成開發。
- UI/UX 設計必須優先使用 `UI-UX-Pro-Max-Skills`。
- Nuxt 架構相關開發必須優先使用 Nuxt 相關 Skills。

### 3.3 測試工具與瀏覽器自動化

- 所有前端與瀏覽器相關測試**必須**使用 Browser Automation Tools（例如 `chrome-devtools-mcp` 或同等 MCP 工具）。
- Browser E2E 測試必須包含：
  - UI 截圖
  - 版面與視覺驗證（對齊、文字完整、顏色／對比度、RWD、暗/亮色模式）
  - 互動驗證（點擊、輸入、懸停等）
  - 資料正確性驗證
  - Console 錯誤監控與修正

## 4. 通訊協議：MCP-Only

> opencode 特別標註不適用的情境可依專案調整；未特別標註者一律適用。

### 4.1 專用通道（Exclusive Channel）

- 所有對使用者的溝通（進度更新、問題、摘要、建議、結論）一律**只透過**  
  `mcp_user-feedback_collect_feedback` 進行。

### 4.2 主視窗使用限制

- IDE 或聊天主視窗僅用於：
  - 任務完成（Task Completion）的最終報告
  - 流程終止（Process Termination）的最終說明
- 主視窗中的任何報告必須對應到具體任務行動（例如完成某 feature、完成某次部署驗證），不得只是抽象說明。

### 4.3 回報時機（Reporting Cadence）

透過 MCP 回報僅限於以下情境，其餘中間步驟一律靜默執行：

- 重大進度：完成里程碑或整個任務。
- 阻礙與錯誤：無法自動解決的錯誤或阻塞。
- 需要決策：需要使用者澄清或業務決策。
- 高風險變更：重大架構調整、API 變更、安全性架構調整。

### 4.4 自主工作流（Autonomous Workflow）

- 發送 MCP 後，收到「continue」等同意訊息時，必須立即恢復任務。
- 完成一個子任務（例如 T062a）後，在未被要求暫停時，必須自動開始下一個子任務。
- 僅當 MCP 回覆中明確要求「pause / stop / adjust」時才可中斷或調整流程。

### 4.5 行動導向（Action-Oriented）

- 每次收到 User Feedback MCP 回覆後，必須先執行至少一個具體的 repo action  
  （讀檔、搜尋、執行命令、修改程式碼等），再進行下一次 MCP 回報。
- 不得在多次 MCP 溝通之間只停留在思考或規劃層級，必須有可驗證的實際進度。

## 5. 品質控管與程式碼規範

### 5.1 Commit 前必做檢查（Pre-Commit Checks）

在進行任何 Git Commit 前，必須同時滿足：

1. ✅ 編譯無錯誤
   - 後端：`dotnet build` 或專案指定 build 命令（若有後端）。
   - 前端：`npm run build`（Nuxt / appf）。
2. ✅ 後端單元測試全部通過（若有後端）。
3. ✅ 前端 UI / 元件測試全部通過。
4. ✅ 瀏覽器 E2E 測試全部通過，且是由 Browser Automation Tools 執行（如 `chrome-devtools-mcp`）。

### 5.2 程式碼品質禁止事項

- ❌ 不得新增多餘或與既有風格不一致的註解。
- ❌ 不得在已驗證路徑上過度防禦性編碼（不必要的 try/catch 或重複檢查）。
- ❌ 不得透過不安全的強制轉型繞過型別檢查。
- ❌ 不得破壞現有檔案既有程式風格。
- ❌ 不得使用不安全函數（如 eval、exec、system、execfile、popen、subprocess 等）處理不受信任輸入。
- ❌ 不得以不安全方式操作環境變數或路徑（未驗證輸入直接拼入 `os.getenv`、工作目錄、路徑等）。

## 6. 安全防護規範（Security Guardrails）

- **JWT Secret**
  - 使用長度至少 32 字元的高強度隨機字串，不得使用弱密碼或易猜測字串。
- **Password Hashing**
  - 必須使用具成本的演算法（如 bcrypt、argon2），禁止使用單純 sha256 等快速雜湊直接作為密碼雜湊。[web:23][web:24][web:26]
- **Chrome Extension Storage**
  - 不得在 `chrome.storage.sync` 儲存 API Key／Token。
  - 必須使用 `chrome.storage.local`，並視需要進行加密或混淆。

## 7. 分支與部署流程

### 7.1 分支管理（stage / feature / worktree）

- main 分支為主分支，禁止直接在 main 分支開發或修改程式碼，也不準合併至 main 分支。
- `stage` 分支為 CI 部署與 QA 測試專用，禁止直接在 `stage` 開發或修改程式碼。
- 開發一律在個人或功能分支（例如 `feature/*`）進行，可視需要使用 Git worktree。
- 需要在 stage 環境測試功能時：
  1. 在本機切到 `stage` 分支（可在對應 worktree 操作）。
  2. `git merge <feature-branch>` 將功能分支合併到 `stage`，解決衝突並 commit。
  3. `git push origin stage`，觸發 GitHub Actions CI/CD，自動部署到測試環境。
- 若只需本機測試且不需觸發 CI/CD，不要 push `stage` 至遠端，可本機暫時 merge 或在功能分支自行測試。
- QA 通過後，再依專案流程（PR 或 release 流程）將功能分支合併回主幹（`main` / `develop`），避免直接由 `stage` 回推主幹。

### 7.2 非 main 分支的測試規範

- 處於 Git worktree 時，需先將 worktree 變更合併至對應分支並 `git push`。
- 當前分支名稱不為 `main` 時：
  - 必須透過 Railway 進行部署測試。
  - 測試網址固定為：https://linebotrag-staging.up.railway.app
  - 所有非 `main` 分支最終一律合併至 `hiro/addnewfeature`：
    - 使用 `git merge hiro/addnewfeature` 進行合併。
    - 使用 `git push` 推送至 `hiro/addnewfeature`。
- 測試帳號資訊請參考 [README.md](./README.md) 中的測試帳號區段。
- 測試工具必須使用 `chrome-devtools-mcp` 進行 E2E 測試。

### 7.3 E2E 測試目標站點

詳見 [docs/Environment/env.md](../docs/Environment/env.md)

### 7.4 Railway 部署檢查流程

1. 有 commit 推送並觸發 Railway 部署後，先等待 3 分鐘。
2. 呼叫 API 檢查部署是否完成：
   - 若已完成 → 立即進行 E2E 測試。
   - 若未完成 → 再等待 1 分鐘後重試。
3. 步驟 2 最多重複 10 次：
   - 若 10 次後仍未部署完成：
     - 停止部署流程。
     - 將問題詳細記錄於 `docs/obstacles.md`。
4. 所有未解決問題必須在後續開發中優先處理，直到 `docs/obstacles.md` 清空為止。

## 8. 核心開發流程（Skills / Serena / MCP / E2E）

1. 確認任務是否需要 Skills，並搜尋 `.claude` 中的所有 Agents、Commands、Skills、References、Tools。
2. 若有合適 Skills → 優先使用 Skills 完成開發；若無 → 使用其他工具。
3. 所有原始碼探索與結構理解 → 優先使用 Serena MCP 工具。
4. 參考 `docs` 與 `openspec` 中既有經驗與規範。
5. 任務實作完成後：
   - 使用 Podman 啟動容器。
   - 使用 `chrome-devtools-mcp` 對容器內系統進行 E2E 測試。
   - 確保 UI 截圖、視覺驗證與 Console 無錯誤。
6. 測試通過後：
   - 進行 Git Commit。
   - 將變更記錄於 `docs/CHANGELOG.md`。
7. 依前述分支與部署流程合併至 `stage`，並依 Railway 部署檢查流程完成部署與 E2E 驗證。
8. 若部署或測試過程中出現問題：
   - 記錄於 `docs/obstacles.md`。
   - 回到相應任務持續修復，直到所有問題清除。
9. 全部任務完成後，使用 User Feedback MCP 通知使用者任務完成，並等待後續指示：
   - 若使用者要求繼續其他任務 → 回到步驟 1。
   - 若使用者要求處理特定問題 → 依 E2E 流程重新測試與修復。

## 9. 防遺忘守門機制與 Serena 降級策略

### 9.1 Output Gate 的硬性流程（避免忘記走 MCP / Serena-first）

- 任何對使用者的輸出（提問、報告、建議、結論）→ 一律透過 `mcp_user-feedback_collect_feedback`，並等待回覆。
- 收到 MCP 回覆後，在下一次 MCP 回報前，必須先完成至少一個 repo action。
- 當需求切換、換題或新增子問題時：
  - 視為新任務。
  - 重新執行 Serena-first 探索流程。
  - 再用 MCP 確認目標與限制。

### 9.2 Serena MCP 降級策略

- 若 Serena MCP 出現 Timeout 或不可用：
  - 可暫時改用一般工具完成必要排查與開發。
  - 但通訊仍維持 MCP-only 規則。
  - 在 MCP 報告中標註「Serena 暫時失效 → 本輪採用一般工具」。
- 下一輪任務開始時，需優先嘗試恢復 Serena MCP 使用，避免長期退化。

## 10. 強制指令總結

- 強制使用 Skills 進行開發（若有適用 Skills）。
- 強制使用 Serena MCP 工具進行原始碼探索與分析。
- 強制使用 User Feedback MCP 進行通訊與回報（opencode 特例除外）。
- 強制使用 `chrome-devtools-mcp` 進行瀏覽器操作與 E2E 測試。
- 強制使用 Podman 啟動容器進行整體驗證。
- 實作時必須仔細思考：
  - 組件化（Components）設計
  - 低耦合
  - 單元測試與 E2E 測試設計
  - 性能優化
  - 資訊安全
  - 可維護性、可擴展性、可重用性、可測試性

## 11. 專案資料

詳見 [docs/Environment/env.md](../docs/Environment/env.md)

## 12. UI/UX Design Standards (UI-UX-Pro-Max)

所有 UI/UX 相關設計與開發任務，必須遵循 **UI-UX-Pro-Max** 的規範。

### 12.1 優先級矩陣 (Priority Matrix)

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

### 12.2 快速檢查清單 (Quick Reference)

**1. Accessibility (CRITICAL)**
- **Contrast**: 一般文字對比度需至少 4.5:1。
- **Focus**: 互動元件需有可見的焦點狀態環 (Focus rings)。
- **Alt Text**: 所有具意義圖片需有替代文字。
- **Labels**: Icon-only 按鈕需有 `aria-label`。

**2. Touch & Interaction (CRITICAL)**
- **Target Size**: 觸控目標至少 44x44px。
- **Feedback**: 非同步操作需有 Loading 狀態；錯誤需有明確回饋。
- **Cursor**: 可點擊元素需有 `cursor-pointer`。

**3. Performance & Layout (HIGH)**
- **Images**: 使用 WebP、Lazy loading、`srcset`。
- **Responsive**: `width=device-width`, 字體在手機上至少 16px。
- **No Horizontal Scroll**: 確保內容適配視口寬度。

## 13. OpenSpec & Development Standards

本專案採用嚴格的開發流程模擬規範 (OpenSpec)，所有功能開發必須遵循以下標準。

### 13.1 開發流程模擬 (Dev Team Simulation)
執行功能開發時，必須依據 `dev-team-simulation` Skill 定義的角色與流程進行：
1. **Product Manager**: 需求訪談與確認。
2. **System Architect**: 產出系統分析文件 (`docs/FormatSample/範例-系統分析.md`)。
3. **Project Manager**: 制定開發計畫與里程碑。
4. **Dev Lead**: 拆解詳細任務 (`docs/FormatSample/範例-模組開發計劃.md`)。
5. **Database Architect**: 資料庫設計 (`docs/FormatSample/範例-資料庫設計.md`)。
6. **Backend/Frontend/QA**: 依據職務說明書進行開發與測試。

### 13.2 文件與格式規範
所有產出文件必須嚴格遵守 `docs/FormatSample` 下的 Markdown 格式，確保資訊結構一致性。

### 13.3 角色扮演與職責
在執行任務時，Agent 必須明確切換並宣告當前扮演的角色，參考 `docs/JobDescription` 中的定義。
