# v4.3 → v4.4 遷移指南

## 1. 核心修正

v4.3 第 22、23 章錯把公開工程來源轉成 Linux 與 .NET／C# 技術採用剖面。v4.4 將其修正為：

- `GENERAL_DEVELOPMENT_BEHAVIOR_STANDARD`：所有技術棧共同的需求理解、變更切片、可讀性、可維護性、Review 與證據行為。
- `GENERAL_IMPLEMENTATION_QUALITY_STANDARD`：所有技術棧共同的型別、契約、資源、非同步、錯誤、安全、設定、Build、相容與交付品質。
- `FRONTEND_DEVELOPMENT_STANDARD`：獨立、完整、框架中立的前端架構、安全、RWD、AA、Theme、i18n、效能、Review 與測試基準。

這些規範約束的是**開發行為**，不要求專案採用 Linux、C#、.NET、Vue、Nuxt 或任何特定技術。

## 2. 移除的核心技術綁定

從組織級核心規範移除：

```text
profiles/LINUX_APPLICATION_PROFILE.md
profiles/DOTNET_CSHARP_PROFILE.md
profiles/FRONTEND_WEB_PROFILE.md
profiles/TYPESCRIPT_VUE_NUXT_PROFILE.md
policies/platform-profiles.yaml
```

專案仍可自行建立語言／平台 Overlay，但只能增加工具與細節，不能取代或弱化通用基準、不可變需求與安全不變條件。

## 3. 新增的通用與前端基準

```text
profiles/GENERAL_DEVELOPMENT_BEHAVIOR_PROFILE.md
profiles/GENERAL_IMPLEMENTATION_QUALITY_PROFILE.md
profiles/FRONTEND_DEVELOPMENT_PROFILE.md
reference/GENERAL_DEVELOPMENT_BEHAVIOR_STANDARD.md
reference/GENERAL_IMPLEMENTATION_QUALITY_STANDARD.md
reference/FRONTEND_DEVELOPMENT_STANDARD.md
reference/FRONTEND_CODE_REVIEW_STANDARD.md
reference/FRONTEND_TESTING_STANDARD.md
policies/development-behavior-profiles.yaml
```

## 4. Agent 載入方式

所有寫入任務固定載入：

1. 不可變需求基線。
2. `GENERAL_DEVELOPMENT_BEHAVIOR_PROFILE.md`。
3. `GENERAL_IMPLEMENTATION_QUALITY_PROFILE.md`。
4. `AGENTS.md`、目前生命週期與 Task Contract。
5. Requirement／Diff 觸發的 Domain Profiles。

只要任務涉及 UI、Browser、WebView、Page、Component、Form、Router、Client State、Theme、i18n、Accessibility、PWA 或前端資產，必須再載入：

```text
profiles/FRONTEND_DEVELOPMENT_PROFILE.md
reference/FRONTEND_DEVELOPMENT_STANDARD.md
```

## 5. UI Requirement Mapping

`UI-REQ-001～017` 的 Profile 路徑統一改為：

```text
profiles/FRONTEND_DEVELOPMENT_PROFILE.md
```

Frontend Reviewer 同時審查：

- `UI-REQ-001～017`。
- `FED-001～070`。
- 通用 `GDB-*` 與 `GIQ-*`。

## 6. CI／Policy 遷移

- 將 `platform-profiles.yaml` 的引用改為 `development-behavior-profiles.yaml`。
- 移除組織級預設 `linux-specialist`、`dotnet-specialist` 與框架綁定路由。
- 保留專案實際使用的 Compiler、Analyzer、Formatter、Package Audit 與 Runtime Scanner，但將其視為**驗證手段**，不是通用規範的採用條件。
- 將 `GENERAL_DEVELOPMENT_BEHAVIOR_PROFILE` 與 `GENERAL_IMPLEMENTATION_QUALITY_PROFILE` 設為所有寫入任務 Always-on。
- 將前端檔案、Route、Form、Store、Theme、i18n、PWA 等觸發條件路由至 Frontend Engineering、Frontend Security、Accessibility／i18n Review。

## 7. 不變項目

- 57 項產品負責人不可變需求。
- Requirement ID、來源文字、強度與條件。
- Requirement Baseline SHA-256。
- L0–L6 與 S0–S14。
- Requirement Conformance Agent、SSDLC、Review、Scanner 與 Release Assurance。
