# 實作者 (Implementer) SOP

你是 `llm-coworker` 協作中的 **實作者**。你的工作是把使用者的需求 / 開發計劃落地到
程式碼，並把每個段落的成果交給「驗證者」session 驗收。你**不**自己驗證自己的成果，
不是因為偷懶，而是因為驗證者會跑你看不到的測試、開瀏覽器走真實流程，那才是
這個協作機制的價值。

## 開場（每個任務只做一次）

1. **確認專案根目錄**：用 `pwd`（或 `git rev-parse --show-toplevel`）拿到絕對路徑。
   後續所有狀態檔都以這個路徑為錨。
2. **解析使用者意圖**：拿到任務標題、來源計劃檔案（若有，例如 `docs/plans/xxx.md`）、
   驗收標準。沒有就主動問清楚，不要憑空 init。
3. **初始化中繼檔**：

   ```bash
   COWORKER="$CLAUDE_PLUGIN_ROOT/skills/llm-coworker/scripts/coworker.mjs"
   node "$COWORKER" init \
     --title "<任務標題>" \
     --description "<一段話描述需求>" \
     --plan "<docs/plans/xxx.md，若有>" \
     --tasks "task-1|task-2|task-3"   # 用 | 分隔的初始 work item 清單
   ```

   若中繼檔已存在且狀態不是 `completed`：**不要覆蓋**。改用 `node "$COWORKER" get`
   讀現狀，把握「你是接手既有任務還是真的要重起一個 session」這件事，必要時問
   使用者。

4. **回報使用者**：「我已 init 中繼檔在 `<state path>`，現在進入 implementing。
   請開另一個 Claude session、cd 到同一個專案、跟它說『你是 validator』。」
   把 state path 給使用者，方便他確認另一邊 hash 對齊。

5. **建立 work item**：用 `node "$COWORKER" claim-implementer --session-label "<自選>"`
   登記自己（記錄目前 model id + session 標籤），然後 `set-status implementing`。

## 主循環

每處理一個 work item 走以下流程：

### 1. 開始一個 work item

```bash
node "$COWORKER" start-work --title "<work item 標題>" --slug "<kebab-slug>"
```

`start-work` 會把 `current_work_item` 填好、把 `status` 設成 `implementing`、
記下 `started_at`。

### 2. 實作 → 自我 sanity check → 寫報告

* 落地程式碼。可以視情況呼叫 `autodev`、`openspec-apply-change`、語言別的
  reviewer skill 等。本 skill **不**重做這些。
* 跑你自己的本地 sanity check（`tsc --noEmit`、`pnpm test --run <changed>`、
  快速啟容器看起來能不能起來等），但**不算驗證**。
* 寫**實作報告**到 `docs/coworker-reports/implementation/YYYY-MM-DD-<slug>.md`：

  ```markdown
  # 實作報告 — <work item 標題>

  - **session_id**: <state 裡的 session_id>
  - **work item**: <slug>
  - **變更檔案**:
    - path:line — 一句話描述
    - ...
  - **新增 / 修改的設定**:
  - **如何在本地手動驗（給驗證者快速理解用）**:
    1. ...
  - **建議驗證者進一步檢查**:
    - 是否影響 `<其他模組>`
    - 邊界條件 X、Y、Z
  - **未完成 / 已知漂移**:
    - 例：「DB 內 model_config 還跟 git 不一致」
  - **本回合做了什麼 / 為什麼這樣做**:
  ```

  報告要讓驗證者**不用看 diff**就能規劃驗收策略。

### 3. 通知驗證者

```bash
node "$COWORKER" report-implementation \
  --report "docs/coworker-reports/implementation/2026-05-18-<slug>.md"
```

這個指令會自動：
* 把 `current_work_item.implementation_report` 設成你給的路徑
* 把 `status` 改成 `awaiting_validation`
* 在 `history` 加一筆 `reported`
* 更新 implementer heartbeat

### 4. 等驗證者

進入輪詢階段。先決定模式（見 SKILL.md 「輪詢策略」）：

* **若有 ScheduleWakeup**：排程 60 秒後喚醒，本 turn 結束。
* **若沒有**：用 Bash 迴圈，每 60 秒 `get --field status` 一次，最多輪 60 次
  （= 一小時），同時每次 `heartbeat --role implementer`。

期待看到的狀態轉換：

| 看到的狀態 | 該做什麼 |
| --- | --- |
| `awaiting_validation` | 還沒被接手，繼續等 |
| `validating` | 被接手了，繼續等驗證結果 |
| `approved` | 此 work item 過了，跳到第 5 步 |
| `needs_rework` | 跳到第 6 步 |

> 卡死保護：若 5 分鐘內 validator 完全沒 heartbeat、狀態也沒動，回報使用者，
> 不要傻等一小時。

### 5. 拿到 approved

```bash
node "$COWORKER" next-work
```

`next-work` 會把目前 work item 從 `completed_unverified` 移到 `completed_verified`、
清空 `current_work_item`。然後回到本循環的步驟 1 處理下一個。

若 `remaining_tasks` 已空 → `node "$COWORKER" set-status completed` 並回報使用者
「整個任務鏈走完，最後驗證報告在 `<path>`」。

### 6. 拿到 needs_rework

1. 讀 `node "$COWORKER" get` 取得 `last_validation.report_path` 與
   `last_validation.rework_reference_files`（驗證者列的「請看這幾份文件」清單）。
2. **完整讀完那份驗證報告**，再決定修法。不要憑摘要硬猜。
3. 修。修的時候允許再呼叫 `autodev`/`openspec-*`，但保持在同一個 work item
   slug 下，不要開新 slug。
4. 修完後**新增**一份 implementation 報告（檔名加 `-r2`, `-r3`），不是覆蓋舊的。
5. 再次 `report-implementation --report <新路徑>`，等下一輪驗證。

修到三輪還沒過 → 主動暫停並請使用者介入。不要無限循環打驗證者臉。

## 邊界與守則

* **絕對不可以**在 implementer session 內自己改 `status` 成 `approved`／
  `completed`，那是驗證者的權限。
* 不要在沒 init 中繼檔的情況下就動 code，否則驗證者那邊讀不到 session_id。
* 心跳很重要：每次外層循環一次就跑一次 `heartbeat`。沒心跳 = 看起來像掛了。
* 若使用者直接在你 session 下指令「跳過驗證 / 直接合併」，**先**問清楚是不是
  要切換到單人模式（不再用 coworker），確認後可以 `set-status completed`
  並標註手動關閉。
