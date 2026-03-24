---
name: ralph-loop
description: |
  Ralph Loop - 持續自我引用 AI 迴圈，用於互動式迭代開發。實作 Ralph Wiggum 技術，讓 Claude 在 while-true 迴圈中以相同 prompt 反覆執行直到任務完成。

  **USE THIS SKILL WHEN:**
  - 使用者需要迭代式開發並自動修正（如 TDD 紅綠燈循環）
  - 綠地專案（greenfield）有明確成功標準
  - 後端開發任務需要多次迭代自動修正
  - 使用者提到 "ralph loop"、"iterative loop"、"自動迭代"
  - AutoDEV 後端開發階段選擇 Ralph Loop 模式

  **DO NOT USE WHEN:**
  - 需要人類判斷或設計決策的任務
  - 一次性操作（one-shot）
  - 成功標準不明確的任務
  - 生產環境除錯（使用 systematic-debugging）
---

# Ralph Loop - 持續自我引用 AI 迴圈

## 核心概念

Ralph Loop 實作 Ralph Wiggum 技術 — 一種基於持續 AI 迴圈的迭代開發方法論。

**運作原理：**
1. Claude 接收 **相同的 prompt**
2. 執行任務，修改檔案
3. 嘗試結束
4. Stop hook 攔截並重新送入相同 prompt
5. Claude 看到自己前次的工作結果
6. 持續迭代改進直到完成

**「自我引用」** 來自 Claude 在檔案和 git 歷史中看到自己的前次工作，而非輸出回饋為輸入。

## 使用場景

### 場景 1：AutoDEV 後端開發迭代

在 AutoDEV 第二階段（開發）中，後端任務可使用 Ralph Loop 進行自動迭代：

```
/ralph-loop '依據 openspec/changes/<task-id>/ 中的 specs 實作功能。
成功標準：
- 所有 OpenSpec specs 中的功能已實作
- 單元測試全部通過
- 無型別錯誤' --completion-promise 'ALL SPECS IMPLEMENTED AND TESTS PASSING' --max-iterations 20
```

### 場景 2：TDD 紅綠燈循環

```
/ralph-loop 'Run tests, fix failures, repeat. Target: 100% pass rate for auth module.' --completion-promise 'ALL TESTS PASSING' --max-iterations 15
```

### 場景 3：綠地專案建置

```
/ralph-loop 'Build a REST API for task management with CRUD endpoints, validation, and error handling.' --completion-promise 'API COMPLETE' --max-iterations 30
```

### 場景 4：程式碼重構

```
/ralph-loop 'Refactor the cache layer to use Redis. Ensure all existing tests still pass.' --completion-promise 'REFACTOR COMPLETE' --max-iterations 20
```

## 指令

| 指令 | 說明 |
|------|------|
| `/ralph-loop <PROMPT> [OPTIONS]` | 啟動 Ralph Loop |
| `/cancel-ralph` | 取消執行中的 Ralph Loop |
| `/ralph-help` | 顯示完整說明 |

### 選項

| 選項 | 說明 | 預設 |
|------|------|------|
| `--max-iterations <n>` | 最大迭代次數 | 無限 |
| `--completion-promise '<text>'` | 完成承諾（多字需加引號） | 無（永久執行） |

## 完成承諾（Completion Promise）

要結束迴圈，Claude 必須輸出 `<promise>` 標籤：

```
<promise>YOUR_PHRASE</promise>
```

**嚴格規則：**
- 承諾內容必須 **完全且無疑地為真** 才能輸出
- 禁止輸出虛假承諾來逃離迴圈
- 若無設定承諾或 `--max-iterations`，迴圈永遠執行

## 與 AutoDEV 的整合

在 AutoDEV SKILL 的第二階段（開發），後端工作流程提供兩種迭代模式：

| 模式 | 適用場景 | 說明 |
|------|---------|------|
| **Ultrawork Loop** | 需要精細控制的任務 | 手動迭代循環 |
| **Ralph Loop** | 有明確成功標準的任務 | 自動化迴圈（推薦） |

選擇 Ralph Loop 時，在 `/opsx:apply` 階段啟動迴圈，讓 AI 自動迭代實作直到符合 OpenSpec 規格。
