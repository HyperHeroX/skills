# 需求變更控制

## 1. 不可自行變更

`requirements/USER_MANDATORY_REQUIREMENTS_BASELINE.md`、`requirements/MANDATORY_SYSTEM_REQUIREMENTS.md`、`policies/mandatory-requirements.yaml` 與其 Digest 均為 Protected Requirement Files。Builder、Reviewer、Scanner、Orchestrator 與外部標準不得修改需求語意。

## 2. 唯一合法流程

只有人類 Requirement Owner 可建立 `Requirement Amendment`，並至少記錄：

- Amendment ID、申請人、核准人與日期。
- 被修改 Requirement ID 與原文。
- 新文字與逐字差異。
- 變更理由、商業影響、安全影響與相容性。
- 受影響的程式、資料、API、UI、測試、文件、Migration 與 Release。
- 是否降低既有控制；若是，另需 Security／Risk Owner 核准。
- 生效版本、回復方式與重新驗證範圍。

## 3. AI Agent 行為

- 遇到不合理、昂貴或具風險的需求時，AI 只能提出 `implementation supplement`、`risk note` 或 `amendment proposal`。
- 在 Amendment 正式核准前，原需求仍為權威要求。
- 不得把技術建議直接寫回來源需求，也不得用生命週期、MVP、Deadline 或外部標準繞過。
