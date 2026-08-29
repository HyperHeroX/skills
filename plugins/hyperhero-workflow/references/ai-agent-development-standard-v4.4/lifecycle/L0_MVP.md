# L0 — MVP／概念驗證 階段規則

> **版本**：4.4.0  
> **Requirement 最低成熟度**：`registered／specified`  
> **核心原則**：本階段只改變工作重點與成熟度，不取消任何產品負責人必備需求。

## 1. 本階段關注

- 將 57 項強制需求全部登錄、逐條理解並建立驗收，不得刪除或標成不適用。
- MVP 只縮小當前業務切片；未在切片內完成的需求仍保留在正式專案 Backlog 與 Traceability Matrix。
- 所有 MVP 觸及的 Auth、Tenant、資料、UI、AI、檔案、排程與狀態路徑必須遵守完整安全底線。
- 建立架構、事件匯流、DI／IoC、模組化與 UI 共用元件的可延伸骨架，禁止一次性程式碼。

- 通用開發行為與實作品質兩份 Profile 一律載入；前端切片需建立元件／狀態／API 邊界、核心 RWD、基本 AA、Client 安全與 Smoke Test。

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
