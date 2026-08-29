# AI Agent 工程與安全開發規範 v4.4

本版本以產品負責人的 57 項不可變需求為主契約，並修正開發基準的定位：

- 第 22、23 章是**所有語言與平台共用的開發行為基準**，不是 Linux 與 C#／.NET 採用規範。
- Linux Kernel、Microsoft、Google、NASA 等公開資料只提供可審查性、工具政策、SSDLC、資源治理與證據導向的精神。
- 新增獨立、完整、框架中立的 `前端開發基準`，涵蓋架構、型別、狀態、API、瀏覽器安全、RWD、AA、Theme、i18n、效能、測試與生命週期。
- 所有 Builder 任務固定載入兩份通用 Profile；只有涉及 UI 時再載入前端 Profile。

## 最小載入

1. `requirements/USER_MANDATORY_REQUIREMENTS_BASELINE.md`
2. `profiles/GENERAL_DEVELOPMENT_BEHAVIOR_PROFILE.md`
3. `profiles/GENERAL_IMPLEMENTATION_QUALITY_PROFILE.md`
4. `AGENTS.md`
5. Lifecycle、Task Contract、Security Invariants
6. Requirement／Diff 觸發的 Domain Profile
7. 涉及 UI 時載入 `profiles/FRONTEND_DEVELOPMENT_PROFILE.md`

## 核心檔案

| 路徑 | 用途 |
|---|---|
| `AI_AGENT_ENGINEERING_SECURE_DEVELOPMENT_STANDARD_v4.4.md` | 完整組織規範 |
| `AGENTS.md` | Agent 最小執行契約 |
| `reference/GENERAL_DEVELOPMENT_BEHAVIOR_STANDARD.md` | 通用開發變更與維護行為 |
| `reference/GENERAL_IMPLEMENTATION_QUALITY_STANDARD.md` | 通用程式實作、執行與交付品質 |
| `reference/FRONTEND_DEVELOPMENT_STANDARD.md` | 完整框架中立前端開發基準 |
| `profiles/GENERAL_DEVELOPMENT_BEHAVIOR_PROFILE.md` | 所有 Builder Always-on 摘要 |
| `profiles/GENERAL_IMPLEMENTATION_QUALITY_PROFILE.md` | 所有 Builder Always-on 摘要 |
| `profiles/FRONTEND_DEVELOPMENT_PROFILE.md` | UI／Client 任務摘要 |
| `policies/development-behavior-profiles.yaml` | 機器可讀載入與路由政策 |
| `requirements/` | 57 項不可變需求與追蹤矩陣 |
| `reference/FRONTEND_CODE_REVIEW_STANDARD.md` | 前端獨立審查 |
| `reference/FRONTEND_TESTING_STANDARD.md` | 前端分階段測試 |

## 明確移除的核心技術綁定

v4.4 不再將下列檔案視為核心 Profile：

- `LINUX_APPLICATION_PROFILE.md`
- `DOTNET_CSHARP_PROFILE.md`
- `FRONTEND_WEB_PROFILE.md`
- `TYPESCRIPT_VUE_NUXT_PROFILE.md`
- `platform-profiles.yaml`

專案日後可另外建立語言／平台 Overlay，但只能增加工具與細節，不能取代通用基準或改寫必備需求。

## 驗證

```bash
python tools/validate_bundle.py .
```
