# L2 — 內部測試 階段規則

> **版本**：4.4.0  
> **Requirement 最低成熟度**：`verified`  
> **核心原則**：本階段只改變工作重點與成熟度，不取消任何產品負責人必備需求。

## 1. 本階段關注

- 對 57 項 Requirement 逐條執行 Requirement Conformance。
- 執行 Unit、Collection、Stress、Benchmark、Concurrency、White、Gray、Shallow-black、Black 與 E2E。
- 專業 Reviewer／Scanner 獨立驗證架構、安全、資料、管理、前端、AI 與版本規則。
- 任一來源需求缺失、語意偏離、Scanner Error 或未審項目都阻擋進入 L3。

- 前端執行 Browser／Viewport、Accessibility、Visual、E2E、Performance、弱網路、即時重連與 XSS／CSRF／Storage／Client Auth 負面測試。

## 2. 強制載入

- `requirements/USER_MANDATORY_REQUIREMENTS_BASELINE.md`
- `requirements/REQUIREMENT_TRACEABILITY_MATRIX.md`
- `.ai/system-requirements.yaml`
- `profiles/GENERAL_DEVELOPMENT_BEHAVIOR_PROFILE.md` 與 `profiles/GENERAL_IMPLEMENTATION_QUALITY_PROFILE.md`
- 本次 Requirement IDs 的 Profiles；涉及 UI 時另載入 `profiles/FRONTEND_DEVELOPMENT_PROFILE.md`
- `reference/REQUIREMENT_CONFORMANCE_STANDARD.md`

## 3. 離開階段的阻擋條件

- 使用需求降級狀態或未核准 Amendment。
- 來源條件由 AI 另行創造。
- 實作、測試、文件、管理頁或 UI 與來源原文不一致。
- Requirement Conformance 未通過或未綁定同一 Revision／Baseline Digest。
