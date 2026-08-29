# L3 — 上架試營運 階段規則

> **版本**：4.4.0  
> **Requirement 最低成熟度**：`operational`  
> **核心原則**：本階段只改變工作重點與成熟度，不取消任何產品負責人必備需求。

## 1. 本階段關注

- 在有限真實流量下證明所有已驗證需求可操作、可監控、可稽核、可回復。
- 驗證跨租戶查探、2FA 強制繼承、狀態訂閱、排程、插件、資源、檔案、通知、儀表板即時更新與備份下載權限。
- Canary、Kill Switch、Support、Incident、Rollback 與資料處置不得缺少。
- Pilot 不得用 Feature Flag 隱藏未完成的必備需求後宣稱通過。

- 前端驗證 RUM、CSP Report、真實裝置、通知、儀表板即時、Theme／Locale、Source Map 與 Service Worker／Cache 回退。

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
