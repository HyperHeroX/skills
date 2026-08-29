# L1 — 正式專案開發 階段規則

> **版本**：4.4.0  
> **Requirement 最低成熟度**：`implemented`  
> **核心原則**：本階段只改變工作重點與成熟度，不取消任何產品負責人必備需求。

## 1. 本階段關注

- 所有無條件 Requirement 及已觸發的來源條件 Requirement 必須完成設計、實作、文件與基本測試。
- 不得以「後續再做」將必備功能改成 Optional；尚未完成即保持 `blocked`。
- 完成 OpenAPI 可操作頁、管理頁、前端 17 項要求、管理 6 項要求、資料與安全要求。
- 建立完整 `/docs` 設計規範、Exception Matrix、Plugin Spec、Permission Catalog 與測試矩陣。

- 前端必須完成框架中立的開發基準：Design System、Theme、i18n、State／API Client、表單、完整 UI 狀態、Component／Contract Test。

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
