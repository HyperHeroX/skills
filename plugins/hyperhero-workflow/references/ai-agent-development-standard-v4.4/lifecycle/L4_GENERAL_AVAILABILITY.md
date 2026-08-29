# L4 — 正式上市 階段規則

> **版本**：4.4.0  
> **Requirement 最低成熟度**：`operational`  
> **核心原則**：本階段只改變工作重點與成熟度，不取消任何產品負責人必備需求。

## 1. 本階段關注

- Requirement Traceability 需 100%，無未核准偏離與未審需求。
- 所有 UI、管理頁、API、資料、測試、AI、版本號與安全要求具正式證據。
- Release Artifact、SBOM、Provenance、Review、Scan、Test、Conformance 綁定同一 Revision。
- 任何最後修改都使受影響證據失效並重新驗證。

- 前端須具正式 AA、Browser Support、Bundle Budget、Release Asset 完整性與 UI-REQ／FED 完整證據。

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
