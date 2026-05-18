# Troubleshooting

## 兩端讀到不同的中繼檔

**症狀**：implementer 寫了 `awaiting_validation`，validator 那邊 `get` 還是
`initialized`，或路徑根本對不上。

**排查**：

1. 兩端各跑 `node "$COWORKER" path`，比對輸出是不是同一個檔。
2. 跑 `node "$COWORKER" doctor` 看 `project_root` / `project_hash` 兩端是否一致。
3. 常見原因：
   - 一端在 git worktree（路徑類似 `…/worktrees/foo`），另一端在主 repo
     （`…/SoftDevelopmentFactory`）。
   - 一端用 cmd 大小寫不同（Windows `E:\` vs `e:\`）。腳本會 lowercase 後 hash，
     但仍可能受 symlink 影響。
4. 解法：兩端 `cd` 到完全同一個絕對路徑後重啟 skill；或在 implementer init 時
   傳 `--project-root <絕對路徑>`，validator 那端用 `node coworker.mjs use
   --project-root <同一路徑>` 對齊。

## State lock 一直拿不到

**症狀**：頻繁 `STATE_LOCKED`，最後拋錯。

**原因**：上次寫入崩潰留下殘留 lock。

**解法**：

```bash
node "$COWORKER" unlock --force
```

`unlock --force` 只刪 `state.lock` 不動 `state.json`。確認另一端沒在寫之後再用。

## Validator 接手後 implementer 看不到 status 變化

**原因**：implementer 還在用 ScheduleWakeup 模式但 harness 沒回 callback。

**解法**：implementer 改成 Bash 迴圈模式，或請使用者直接 `/loop 60s` 觸發
implementer session。

## 兩個 validator 同時 claim

**症狀**：第二個 validator session 跑 `claim-validator` 拿到 exit code 2。

**這是預期行為**。`coworker.mjs` 會偵測 5 分鐘內另一個 validator heartbeat。
若舊 validator 真的掛了，等 5 分鐘 heartbeat 過期，或：

```bash
node "$COWORKER" claim-validator --session-label new --force
```

`--force` 會踢掉舊 validator（在 history 寫一筆 `validator_replaced`）。

## Implementation report 路徑寫錯

**症狀**：`current_work_item.implementation_report` 指到不存在的檔。

**解法**：implementer 那端 `node "$COWORKER" amend-current-work --report <對的路徑>`
修正，然後 validator 跑一次 `get` 重新讀。

## 任務跨多天，session 中間關掉了

中繼檔在 home，**不會**因為某邊 session 結束而消失。下次任何一邊 session 開起來
跑 `node "$COWORKER" get` 就能繼續，只要 cwd 對齊到同一個 project_root。

## UI 自動化測試起不來瀏覽器

驗證者**不要**自己手刻替代方案。先跑 `Skill(skill="e2e-ui-testing")`，照那個
skill 的 troubleshooting 處理。仍處理不了再 rework 給 implementer 補修
（例如要求加 health endpoint、塞 dev seed）。

## 「我想直接看 state.json」

`node "$COWORKER" get --pretty` 是漂亮輸出版。手動 `Read` `state.json` 也可以，
但**不要手動編輯**——格式 / history append-only / 狀態圖檢查全都會被繞過。
