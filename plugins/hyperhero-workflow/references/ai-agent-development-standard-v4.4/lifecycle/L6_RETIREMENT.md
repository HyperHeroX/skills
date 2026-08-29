# L6 — 退役／移轉 階段規則

> **版本**：4.4.0  
> **Requirement 最低成熟度**：`retired`  
> **核心原則**：本階段只改變工作重點與成熟度，不取消任何產品負責人必備需求。

## 1. 本階段關注

- 安全處置多租戶資料、金鑰、備份、快取、排程、Plugin、檔案、通知、AI Provider、Connector、帳號與權限。
- 移除或封存前仍需 Requirement Conformance，確認沒有孤兒資料、Credential、Job、介面或責任。
- 保存法規、稽核、版本與必要歷史證據。
- 退役 Script 同樣接受 Review、Scan、Test 與 Rollback 驗證。

- 前端退役需清除 Service Worker、Cache、IndexedDB、Static Asset、Deep Link、Analytics、第三方 Script 與 Client Credential。

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
