# 中繼檔 (state.json) Schema

中繼檔位於 `~/.claude/coworker/<project-hash>/state.json`。**永遠透過 `coworker.mjs`
讀寫**，本檔僅作為人類 / debug 參考。

## 完整欄位

```jsonc
{
  // 1 = 本 schema 版本；coworker.mjs 看到不同版本會拒絕讀寫
  "version": 1,

  // 開場 init 時產生，兩端共用，使用者一眼看得懂
  "session_id": "2026-05-18-d1-company-roles",

  // 專案根目錄絕對路徑（hash 來源）
  "project_root": "E:\\01-Devops\\HyperHeroX\\SoftDevelopmentFactory",
  // SHA-1(project_root) 前 12 碼，用來推算中繼檔目錄
  "project_hash": "a1b2c3d4e5f6",

  // ISO8601；created_at 不變，updated_at 每次寫入更新
  "created_at": "2026-05-18T00:15:00.000Z",
  "updated_at": "2026-05-18T02:06:30.000Z",

  // 狀態機唯一真相
  "status": "implementing",
  //  ↑ 合法值：initialized | implementing | awaiting_validation
  //              | validating | needs_rework | approved | completed | failed

  // 1-based，每次新一輪 rework 就 +1（同一個 work item 內）
  "current_iteration": 1,

  "implementer": {
    "model_label": "claude-opus-4-7",       // 由模型自行宣告，best-effort
    "session_label": "session-A",            // 使用者自己取的標籤
    "last_heartbeat": "2026-05-18T02:06:00.000Z"
  },
  "validator": {
    "model_label": "claude-sonnet-4-6",
    "session_label": "validator-A",
    "last_heartbeat": "2026-05-18T02:06:12.000Z"
  },

  // 任務總覽，init 時填，之後通常不動
  "task_brief": {
    "title": "Sprint D.1 重構 company-roles autonomy",
    "description": "把 COO/CFO route 從 stub 升級為 live LLM-routed cycle",
    "source_plan_path": "docs/plans/2026-05-17-autonomy-core-sprint.md"
  },

  // work item 佇列；status 流轉時會搬動
  "remaining_tasks": [
    "fix-llm-model-routing",
    "wire-coo-live-execute",
    "harden-evidence-gate"
  ],
  "completed_unverified": [],
  "completed_verified": ["fix-llm-model-routing"],

  // 目前 implementer 正在處理的；status != implementing/awaiting_validation/validating
  // 時為 null
  "current_work_item": {
    "title": "Wire COO live execute path",
    "slug": "wire-coo-live-execute",
    "started_at": "2026-05-18T01:30:00.000Z",
    "implementation_report": "docs/coworker-reports/implementation/2026-05-18-wire-coo-live-execute.md"
  },

  // 最近一次驗證結果；用來讓 implementer 在 rework 時找到報告
  "last_validation": {
    "verdict": "rework",                     // pass | rework | null
    "report_path": "docs/coworker-reports/validation/2026-05-18-wire-coo-live-execute.md",
    "rework_reference_files": [
      "docs/coworker-reports/validation/2026-05-18-wire-coo-live-execute.md"
    ],
    "validated_at": "2026-05-18T02:00:00.000Z"
  },

  // append-only event log，最舊在前
  "history": [
    {
      "ts": "2026-05-18T00:15:00.000Z",
      "actor": "implementer",
      "event": "initialized",
      "ref": null
    },
    {
      "ts": "2026-05-18T01:30:00.000Z",
      "actor": "implementer",
      "event": "started_work",
      "ref": "wire-coo-live-execute"
    },
    {
      "ts": "2026-05-18T01:55:00.000Z",
      "actor": "implementer",
      "event": "reported",
      "ref": "docs/coworker-reports/implementation/2026-05-18-wire-coo-live-execute.md"
    },
    {
      "ts": "2026-05-18T02:00:00.000Z",
      "actor": "validator",
      "event": "validated_rework",
      "ref": "docs/coworker-reports/validation/2026-05-18-wire-coo-live-execute.md"
    }
  ]
}
```

## 欄位語意

| 欄位 | 寫入者 | 規則 |
| --- | --- | --- |
| `version` | init 一次 | 不可改 |
| `session_id` | implementer init | 兩端共用，不可改 |
| `project_root` / `project_hash` | init | 兩端啟動時會 cross-check，不一致拒絕 |
| `status` | 兩端皆可，但有狀態圖約束 | 見下表「合法轉換」 |
| `current_iteration` | 每次 rework 由 validator 在 `report-validation rework` 時 +1 | — |
| `implementer.*` | implementer | validator 唯讀 |
| `validator.*` | validator | implementer 唯讀 |
| `task_brief` | init | 偶爾使用者要求更新 → 兩端皆可改 |
| `remaining_tasks` | implementer | validator 唯讀 |
| `completed_unverified` | implementer 在 `report-implementation` 時自動 push | — |
| `completed_verified` | validator 在 `report-validation pass` 時自動搬 | — |
| `current_work_item` | implementer 在 `start-work` 寫、`next-work` 清 | — |
| `last_validation` | validator | implementer 唯讀 |
| `history` | 兩端，append-only | 不可刪、不可改舊事件 |

## 合法狀態轉換

| 當前 | 允許下一個 | 誰能寫 |
| --- | --- | --- |
| `initialized` | `implementing` | implementer |
| `implementing` | `awaiting_validation` | implementer |
| `awaiting_validation` | `validating` | validator |
| `validating` | `approved` / `needs_rework` | validator |
| `approved` | `implementing` (下一個 work item) / `completed` | implementer |
| `needs_rework` | `implementing` | implementer |
| 任意 | `failed` | 兩端皆可（搭配 history 寫原因） |

`coworker.mjs` 會在每次 `set-status` / 各 high-level 指令時驗證合法性，
非法轉換直接 reject。

## 檔案鎖

`coworker.mjs` 每次寫入會：

1. 開 `<state-dir>/state.lock` 為獨佔（fs `wx` flag），拿不到就 backoff 至多 5 秒
2. 讀現狀 → 計算新值 → 原子寫入 `state.json.tmp` → `rename` 到 `state.json`
3. 刪除 lock

兩端高頻 heartbeat 也透過同一機制；衝突極少，但理論上會發生。看到
`STATE_LOCKED` 錯誤就重試一次。
