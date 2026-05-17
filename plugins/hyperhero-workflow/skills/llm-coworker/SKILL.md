---
name: llm-coworker
description: >-
  讓「兩個 Claude 模型實例」分別扮演實作者 (implementer) 與驗證者 (validator)
  透過共享中繼檔自動協作，免去使用者手動在多個 LLM session 間搬訊息。
  使用時機：當使用者提到「多模型協作」、「兩個 Claude 一起做」、「一個寫一個驗」、
  「coworker」、「pair LLM」、「implementer / validator 分工」、
  「讓另一個 Claude 同時驗證我這邊在寫的東西」、「parallel claude sessions」、
  「多開 session 分工」、或描述出由一個 session 寫程式、另一個 session 跑測試/驗收
  的工作模式時，**必須**使用本 skill。即使使用者沒有明說「coworker」，只要意圖是
  「兩個或以上的 LLM session 同時針對同一專案分工 → 透過檔案傳遞狀態 → 自動輪詢
  等對方完成」，就應該啟動本 skill。本 skill 會強制呼叫 e2e-ui-testing 等子 skill
  完成 UI 自動化測試。
---

# LLM Model CoWorker

兩個 Claude 模型實例（同一專案，不同 session）透過共享中繼檔 + 報告檔案分工協作。
**實作者**負責落地需求，**驗證者**負責用腳本 / 單元測試 / 回歸測試 / UI 自動化測試
保證系統真的能跑、真的滿足需求。中繼檔是兩者唯一的通訊媒介；使用者完全不需要
手動在兩個 session 之間搬資訊。

## 角色參數

呼叫本 skill 時 **必須** 在使用者訊息或 skill 參數中明確指定角色之一：

| 角色 | 觸發詞範例 |
| --- | --- |
| `implementer`（實作者） | 「我是實作者」、「implementer 模式」、「我來寫 code」、「我負責落地」 |
| `validator`（驗證者） | 「我是驗證者」、「validator 模式」、「我來驗收」、「我跑測試」 |

若使用者沒明說角色，**先問**一次：「你這個 session 要當 implementer 還是 validator？」
不要自行假設。兩個 session 必須使用 **同一個 session_id** 才能串起來，session_id
由 implementer 首次 `init` 時建立，validator 直接讀取現有中繼檔即可（路徑由
`project_hash` 推算，兩端會自然對齊）。

## 共用基礎建設

不論角色，都使用同一份中繼檔與同一個 helper 腳本。

### 中繼檔位置

```
~/.claude/coworker/<project-hash>/state.json
```

`<project-hash>` 是「專案根目錄絕對路徑」的 SHA-1 前 12 碼。腳本會自動計算，
你不需要手動算。兩個 session 必須在 **同一個專案根目錄** 啟動，hash 才會一致。
若在 git worktree，請使用 `git rev-parse --show-toplevel` 取得的路徑，而不是 worktree
路徑本身（除非兩端都用 worktree 路徑）。預設策略：直接使用當下的 `cwd`，並在
init 時把絕對路徑寫進中繼檔，讓 validator 開啟時可以 cross-check。

### Helper 腳本

腳本位於 `${CLAUDE_PLUGIN_ROOT}/skills/llm-coworker/scripts/coworker.mjs`，
本 skill 內所有「讀寫狀態 / 等待狀態變化 / 計算 project hash」一律走它，
不要自己 `fs.readFile` 中繼檔，避免格式漂移。

常用指令（在 Bash 工具中執行；Windows 也走 Node 不走 PowerShell）：

```bash
# 第一次建立（implementer 開場才做）
node "$COWORKER" init --title "Sprint D.1 重構 company-roles" \
  --plan docs/plans/2026-05-17-autonomy-core-sprint.md

# 讀目前完整狀態
node "$COWORKER" get

# 讀單一欄位
node "$COWORKER" get --field status

# 阻塞等待狀態變成指定值（預設 60 秒 timeout，過了就回 exit 124，**不要無限等**）
node "$COWORKER" wait-for --status awaiting_validation --timeout 60

# 心跳（每次循環呼叫一次，讓對方知道你還活著）
node "$COWORKER" heartbeat --role implementer

# 顯示中繼檔絕對路徑（debug 用）
node "$COWORKER" path
```

第一次使用前，把腳本路徑展開到變數方便重複呼叫：

```bash
# 在 Claude Code（plugin runtime）
COWORKER="$CLAUDE_PLUGIN_ROOT/skills/llm-coworker/scripts/coworker.mjs"

# 若沒有 $CLAUDE_PLUGIN_ROOT，退回硬路徑（仍盡量用相對符號）
COWORKER="$HOME/.claude/plugins/hyperhero-workflow/skills/llm-coworker/scripts/coworker.mjs"
```

### 狀態機

```
       ┌────────────────┐
       │ initialized    │  ← implementer 開場 init
       └──────┬─────────┘
              ▼
       ┌────────────────┐
   ┌─▶ │ implementing   │
   │   └──────┬─────────┘
   │          │ 完成一個工作項目並寫好報告
   │          ▼
   │   ┌────────────────────┐
   │   │ awaiting_validation│  ← implementer 等驗證者接手
   │   └──────┬─────────────┘
   │          ▼
   │   ┌────────────────┐
   │   │ validating     │  ← validator 接手後寫入此狀態
   │   └──┬──────────┬──┘
   │      │          │
   │      │ 通過      │ 不通過
   │      ▼          ▼
   │   approved   ┌──────────────┐
   │              │ needs_rework │
   │              └──────┬───────┘
   └─────────────────────┘
              ▲
              │ implementer 讀完驗證報告後重新進入 implementing
              │
       ┌────────────────┐
       │ completed      │  ← 整個任務都 approved 後最終狀態
       └────────────────┘
```

中繼檔 schema 細節見 `references/state-schema.md`。

### 報告目錄

所有報告寫到專案內 `docs/coworker-reports/`，**不是** `~/.claude/coworker/`。
中繼檔在 home 是為了讓多 worktree 都能讀；報告在專案內是為了讓 PR / git history
能審到。檔名規則：

```
docs/coworker-reports/implementation/YYYY-MM-DD-<work-slug>.md
docs/coworker-reports/validation/YYYY-MM-DD-<work-slug>.md
```

`<work-slug>` 是當前 work item 的 kebab-case 摘要。同一天同一 slug 多次重做時，
在 slug 後加 `-r2`, `-r3`。

## 角色分派

讀完上面的共用基礎，依使用者指定的角色跳到對應 guide：

- **implementer** → 讀 `references/implementer-guide.md`，然後依該文件 SOP 進行
- **validator** → 讀 `references/validator-guide.md`，然後依該文件 SOP 進行

兩份 guide 都假設你已熟悉本檔的狀態機與腳本指令。

## 與其他 skill 的整合

- **驗證者執行 UI 自動化測試時，必須呼叫 `e2e-ui-testing` skill**
  （Skill tool，skill 名 `e2e-ui-testing` 或完整 `hyperhero-tools:e2e-ui-testing`）。
  不要自己手刻 Playwright/Browser MCP 流程，重用該 skill 的視覺檢查清單。
- 實作者若需要規劃，可呼叫 `devteam`、`autodev`、`openspec-new-change` 等
  workflow skill；本 skill 不重複那些流程，只負責協作協調。
- 兩端都可以呼叫 `claude-mem:mem-search` 補上歷史 context。

## 輪詢策略（兩種模式）

skill 同時支援兩種輪詢機制，模型依當前環境自動選擇：

1. **Bash sleep 迴圈（預設、最相容）**
   單回合內持續輪詢，每次 60 秒：
   ```bash
   for i in $(seq 1 60); do
     STATUS=$(node "$COWORKER" get --field status)
     if [ "$STATUS" = "needs_rework" ] || [ "$STATUS" = "implementing" ]; then
       break
     fi
     node "$COWORKER" heartbeat --role implementer
     sleep 60
   done
   ```
   優點：簡單可靠、無需 harness 支援。缺點：佔住該 session 一個 turn，
   超過 60 分鐘需要使用者手動延長。**Windows PowerShell 環境用 `Start-Sleep 60`
   等價**，但本 skill 一律走 Bash 工具（node 跨平台一致）。

2. **ScheduleWakeup 模式（若可用）**
   若你（模型）能呼叫 `ScheduleWakeup` 工具，改用：
   ```
   ScheduleWakeup(delaySeconds=60, reason="coworker: poll state.json",
                  prompt="繼續 llm-coworker 的 <role> 工作")
   ```
   並在當下 turn 結束。下次喚醒時讀中繼檔，狀態變了就繼續、沒變就再排一次。
   優點：釋放 session、不卡 turn。缺點：harness 需支援。

判斷規則：**優先嘗試模式 2；ScheduleWakeup 工具不存在或被拒就 fallback 到模式 1。**
不要在同一輪同時用兩種。

## 失敗 / 卡死處理

- 若 `wait-for` 連續 timeout 三次（共 3 分鐘）狀態都沒動，**主動回報使用者**：
  「另一端 session 似乎沒在動，最後心跳是 <ts>，你要不要去看一下？」
  不要無聲無息地一直 sleep。
- 若驗證者偵測「實作者剛 claim 但還沒寫報告」超過 15 分鐘無心跳，視為實作者
  異常離線；驗證者應停止輪詢並回報使用者。
- 中繼檔 schema mismatch、json 壞掉、project_hash 不一致 → 立即停下並回報，
  **不要**自己 reset 對方的狀態。

其餘邊角案例見 `references/troubleshooting.md`。
