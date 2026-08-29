# L5 — 維護 階段規則

> **版本**：4.4.0  
> **Requirement 最低成熟度**：`maintained`  
> **核心原則**：本階段只改變工作重點與成熟度，不取消任何產品負責人必備需求。

## 1. 本階段關注

- 每次變更重新計算直接與間接 Requirement IDs，禁止維護時逐漸偏離來源。
- 持續執行 CVE、依賴、瀏覽器、框架、模型、效能、備份、金鑰、UI、排程、Plugin 與權限回歸。
- Hotfix 只能加速流程，不能改寫需求或跳過 Conformance。
- 每次硬體／環境變化重新執行基準測試。

- 前端持續檢查 Browser／Dependency EOL、CVE、Bundle Growth、Design System Drift、Accessibility 與 Flaky E2E。

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
