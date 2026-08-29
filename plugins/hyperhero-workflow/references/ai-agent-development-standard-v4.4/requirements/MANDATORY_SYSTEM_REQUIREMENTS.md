# 強制系統需求目錄（Mandatory System Requirement Catalog）

> **版本**：4.4.0  
> **來源**：`requirements/USER_MANDATORY_REQUIREMENTS_BASELINE.md`  
> **規則**：57 項來源需求全部必須被遵循；來源中的「必須／應該／如／若／除非／可以考慮」語氣與條件原樣保留。外部標準只能補強，不得改寫。

## 1. 不可變性與禁止事項

- AI Agent 不得把來源要求改成另一套 `SHOULD`、`MAY`、`capability-ready`、`disabled`、`deferred` 或 `not-applicable` 分類。
- `MUST` 的對象是「忠實遵循整段來源指令」；例如「可以考慮」仍保持考慮與留證義務，不得被改寫成無條件強制實作，也不得被完全忽略。
- `trigger`、`exception`、`default-unless`、`consideration`、`compound` 只描述來源原文的語法，不是 AI 新增的適用性裁剪。
- 只有 `trigger` 或 `consideration` 可在有證據時使用 `condition-not-triggered`；來源例外、預設規則與複合規則仍須完成其剩餘義務。
- Runtime 可由管理者開關的功能，仍必須完整實作與驗證；功能關閉不是需求未完成。
- 生命週期只決定成熟度，不決定需求是否存在。

## 架構類

### ARCH-REQ-001 — 多租戶

- **來源原意**：系統預設具多租戶，但由管理者決定是否開啟。除非有特別要求硬體隔離，否則一律採用軟體隔離方式。隔離中的所有資料只能由管理者進行查探。
- **規範強度**：`MUST_HONOR_SOURCE_DIRECTIVE`
- **來源指令型態**：`MUST_IMPLEMENT`
- **條件模式**：`none`
- **來源明示條件**：無
- **可否使用 condition-not-triggered**：不可
- **必要審查**：Architecture, Security, Data, Requirement Conformance
- **最低證據**：tenant model; admin enable/disable setting; software isolation tests; cross-tenant admin audit tests
- **適用技術剖面**：profiles/ARCHITECTURE_SYSTEM_PROFILE.md

### ARCH-REQ-002 — 設計模式

- **來源原意**：系統從分析階段時就必須考慮使用最佳的模式，例如訂閱者模式使用在滿足即時事件顯示
- **規範強度**：`MUST_HONOR_SOURCE_DIRECTIVE`
- **來源指令型態**：`MUST_CONSIDER_AND_RECORD`
- **條件模式**：`none`
- **來源明示條件**：無
- **可否使用 condition-not-triggered**：不可
- **必要審查**：Architecture, Requirement Conformance
- **最低證據**：analysis record; pattern decision record; implementation and tests
- **適用技術剖面**：profiles/ARCHITECTURE_SYSTEM_PROFILE.md

### ARCH-REQ-003 — 依賴注入／控制反轉

- **來源原意**：在系統開發過程中，解耦是重要的事情，因此除非該語言特性無法滿足，否則都應該將DI/IoC作為首要目標。
- **規範強度**：`MUST_HONOR_SOURCE_DIRECTIVE`
- **來源指令型態**：`MUST_UNLESS_SOURCE_EXCEPTION`
- **條件模式**：`exception`
- **來源明示條件**：除非該語言特性無法滿足
- **可否使用 condition-not-triggered**：不可
- **必要審查**：Architecture, Domain Specialist, Requirement Conformance
- **最低證據**：dependency graph; DI/IoC configuration; unit tests
- **適用技術剖面**：profiles/ARCHITECTURE_SYSTEM_PROFILE.md

### ARCH-REQ-004 — 事件匯流機制

- **來源原意**：用事件匯流機制來實現發布與訂閱模式，用來集中處理事件，並解耦組件之間通訊依賴。
- **規範強度**：`MUST_HONOR_SOURCE_DIRECTIVE`
- **來源指令型態**：`MUST_IMPLEMENT`
- **條件模式**：`none`
- **來源明示條件**：無
- **可否使用 condition-not-triggered**：不可
- **必要審查**：Architecture, Reliability, Security, Requirement Conformance
- **最低證據**：event catalog; event bus implementation; publish/subscribe tests
- **適用技術剖面**：profiles/ARCHITECTURE_SYSTEM_PROFILE.md

### ARCH-REQ-005 — 模組化設計

- **來源原意**：所有功能必須以模組化方式進行設計，且必須有一個設計規範來讓其他開發者遵循，設計規範必須寫在 docs中
- **規範強度**：`MUST_HONOR_SOURCE_DIRECTIVE`
- **來源指令型態**：`MUST_IMPLEMENT`
- **條件模式**：`none`
- **來源明示條件**：無
- **可否使用 condition-not-triggered**：不可
- **必要審查**：Architecture, General Review, Requirement Conformance
- **最低證據**：module boundaries; docs design standard; dependency tests
- **適用技術剖面**：profiles/ARCHITECTURE_SYSTEM_PROFILE.md

### ARCH-REQ-006 — IPC

- **來源原意**：程式間通訊
- **規範強度**：`MUST_HONOR_SOURCE_DIRECTIVE`
- **來源指令型態**：`MUST_IMPLEMENT`
- **條件模式**：`none`
- **來源明示條件**：無
- **可否使用 condition-not-triggered**：不可
- **必要審查**：Architecture, Security, Platform Specialist, Requirement Conformance
- **最低證據**：IPC contract; authentication/authorization tests; compatibility tests
- **適用技術剖面**：profiles/ARCHITECTURE_SYSTEM_PROFILE.md

### ARCH-REQ-007 — 異常管理

- **來源原意**：異常事件發生時必須能夠記錄異常詳細資訊，並提供用戶不含重要或敏感內容的異常簡要資訊，所有種類的異常必須編制一個異常對應表在docs，並在開發過程中逐漸添加。
- **規範強度**：`MUST_HONOR_SOURCE_DIRECTIVE`
- **來源指令型態**：`MUST_IMPLEMENT`
- **條件模式**：`none`
- **來源明示條件**：無
- **可否使用 condition-not-triggered**：不可
- **必要審查**：General Review, Security, Operations, Requirement Conformance
- **最低證據**：structured error logs; sanitized user error tests; docs/exception-matrix.md
- **適用技術剖面**：profiles/ARCHITECTURE_SYSTEM_PROFILE.md

### ARCH-REQ-008 — 工作者服務模式

- **來源原意**：如系統需要一個脫離宿主不隨著宿主啟動而啟動、結束就跟著結束的陪伴或監測機制就應該使用此模式。
- **規範強度**：`MUST_HONOR_SOURCE_DIRECTIVE`
- **來源指令型態**：`MUST_WHEN_SOURCE_CONDITION`
- **條件模式**：`trigger`
- **來源明示條件**：如系統需要脫離宿主生命週期的陪伴或監測機制
- **可否使用 condition-not-triggered**：可，但必須有來源條件證據
- **必要審查**：Architecture, Reliability, Security, Requirement Conformance
- **最低證據**：worker design; independent lifecycle tests; shutdown/recovery tests
- **適用技術剖面**：profiles/ARCHITECTURE_SYSTEM_PROFILE.md

### ARCH-REQ-009 — API 文件

- **來源原意**：必須符合openapi格式，系統管理者應該且必須了解並測試、使用API，因此必須建立可操作的頁面。
- **規範強度**：`MUST_HONOR_SOURCE_DIRECTIVE`
- **來源指令型態**：`MUST_IMPLEMENT`
- **條件模式**：`none`
- **來源明示條件**：無
- **可否使用 condition-not-triggered**：不可
- **必要審查**：API Specialist, Security, Frontend, Requirement Conformance
- **最低證據**：OpenAPI artifact; interactive API page; administrator authorization tests
- **適用技術剖面**：profiles/ARCHITECTURE_SYSTEM_PROFILE.md

## 資安類

### SEC-REQ-001 — RBAC

- **來源原意**：所有頁面中可以執行特定功能的元件都必須被RBAC支配。
- **規範強度**：`MUST_HONOR_SOURCE_DIRECTIVE`
- **來源指令型態**：`MUST_IMPLEMENT`
- **條件模式**：`none`
- **來源明示條件**：無
- **可否使用 condition-not-triggered**：不可
- **必要審查**：Security, Identity, Frontend, Requirement Conformance
- **最低證據**：permission catalog; UI permission tests; server authorization tests
- **適用技術剖面**：profiles/SECURITY_IDENTITY_PROFILE.md

### SEC-REQ-002 — 最小權限

- **來源原意**：所有帳號建立時都必須是最小權限，且不能自行提權。最高權限管理者必須在系統第一次啟動時進行帳號密碼設定。
- **規範強度**：`MUST_HONOR_SOURCE_DIRECTIVE`
- **來源指令型態**：`MUST_IMPLEMENT`
- **條件模式**：`none`
- **來源明示條件**：無
- **可否使用 condition-not-triggered**：不可
- **必要審查**：Security, Identity, Requirement Conformance
- **最低證據**：default role tests; privilege escalation negative tests; first-boot bootstrap test
- **適用技術剖面**：profiles/SECURITY_IDENTITY_PROFILE.md

### SEC-REQ-003 — 二階段認證

- **來源原意**：系統必須支援2FA、Authenticator、PassKey、Email Verify Code等各種二階段認證，且可由使用者自行決定是否開啟，但當系統管理者在系統管理選項中選擇所有人都必須開啟時，使用者2FA設定失效並繼承來自管理的設定。
- **規範強度**：`MUST_HONOR_SOURCE_DIRECTIVE`
- **來源指令型態**：`MUST_IMPLEMENT`
- **條件模式**：`none`
- **來源明示條件**：無
- **可否使用 condition-not-triggered**：不可
- **必要審查**：Security, Identity, Frontend, Requirement Conformance
- **最低證據**：factor enrollment flows; user setting tests; administrator inheritance tests
- **適用技術剖面**：profiles/SECURITY_IDENTITY_PROFILE.md

### SEC-REQ-004 — 越權稽核

- **來源原意**：管理者進行租戶行為、資料、操作、Log等越過租戶特權的查探操作時必須留下相應記錄。
- **規範強度**：`MUST_HONOR_SOURCE_DIRECTIVE`
- **來源指令型態**：`MUST_WHEN_SOURCE_CONDITION`
- **條件模式**：`trigger`
- **來源明示條件**：發生管理者跨租戶特權查探
- **可否使用 condition-not-triggered**：可，但必須有來源條件證據
- **必要審查**：Security, Audit, Data, Requirement Conformance
- **最低證據**：privileged inspection audit; tamper protection; negative tests
- **適用技術剖面**：profiles/SECURITY_IDENTITY_PROFILE.md

### SEC-REQ-005 — 安全權限

- **來源原意**：系統權限授權主要使用Token作為主要鑑權方式，OAuth作為第二選項，OAuth需能滿足市場前五名的授權來源。
- **規範強度**：`MUST_HONOR_SOURCE_DIRECTIVE`
- **來源指令型態**：`MUST_IMPLEMENT`
- **條件模式**：`none`
- **來源明示條件**：無
- **可否使用 condition-not-triggered**：不可
- **必要審查**：Security, Identity, API, Requirement Conformance
- **最低證據**：token authentication tests; OAuth provider adapters; provider compatibility matrix
- **適用技術剖面**：profiles/SECURITY_IDENTITY_PROFILE.md

### SEC-REQ-006 — CORS

- **來源原意**：基本安全功能，必須具備，且必須可以在系統中自行設定。
- **規範強度**：`MUST_HONOR_SOURCE_DIRECTIVE`
- **來源指令型態**：`MUST_IMPLEMENT`
- **條件模式**：`none`
- **來源明示條件**：無
- **可否使用 condition-not-triggered**：不可
- **必要審查**：Security, Frontend, API, Requirement Conformance
- **最低證據**：CORS configuration page; origin policy tests; audit log
- **適用技術剖面**：profiles/SECURITY_IDENTITY_PROFILE.md

### SEC-REQ-007 — 系統日誌

- **來源原意**：記錄系統相關LOG與程式運作LOG，系統相關如操作、資料變更、事件發等，程式運作則例如程序或方法的運作、錯誤等，系統日誌必須分級。
- **規範強度**：`MUST_HONOR_SOURCE_DIRECTIVE`
- **來源指令型態**：`MUST_IMPLEMENT`
- **條件模式**：`none`
- **來源明示條件**：無
- **可否使用 condition-not-triggered**：不可
- **必要審查**：Security, Operations, Requirement Conformance
- **最低證據**：log taxonomy; log-level tests; operation/runtime log samples
- **適用技術剖面**：profiles/SECURITY_IDENTITY_PROFILE.md

### SEC-REQ-008 — 資通系統防護基準

- **來源原意**：系統規劃時必須符合相關規範。
- **規範強度**：`MUST_HONOR_SOURCE_DIRECTIVE`
- **來源指令型態**：`MUST_IMPLEMENT`
- **條件模式**：`none`
- **來源明示條件**：無
- **可否使用 condition-not-triggered**：不可
- **必要審查**：Security, Compliance, Requirement Conformance
- **最低證據**：applicability statement; control crosswalk; compliance evidence
- **適用技術剖面**：profiles/SECURITY_IDENTITY_PROFILE.md

### SEC-REQ-009 — 隱私權

- **來源原意**：除非有系統使用上的需要，否則一律不向用戶要求或記錄除帳號以外資訊，若有要求則需進行保護作業。
- **規範強度**：`MUST_HONOR_SOURCE_DIRECTIVE`
- **來源指令型態**：`MUST_UNLESS_SOURCE_EXCEPTION`
- **條件模式**：`exception`
- **來源明示條件**：僅在系統使用上有需要時蒐集帳號以外資訊
- **可否使用 condition-not-triggered**：不可
- **必要審查**：Privacy, Security, Data, Requirement Conformance
- **最低證據**：data inventory; purpose/retention record; protection tests
- **適用技術剖面**：profiles/SECURITY_IDENTITY_PROFILE.md

## 資料類

### DATA-REQ-001 — 快取機制

- **來源原意**：對於經常性取用的資料進行快取，並且進行快取持久化的設置，保證下次系統啟動能繼續未完行為。
- **規範強度**：`MUST_HONOR_SOURCE_DIRECTIVE`
- **來源指令型態**：`MUST_IMPLEMENT`
- **條件模式**：`none`
- **來源明示條件**：無
- **可否使用 condition-not-triggered**：不可
- **必要審查**：Data, Reliability, Security, Requirement Conformance
- **最低證據**：cache policy; persistence configuration; restart/resume tests
- **適用技術剖面**：profiles/DATA_MANAGEMENT_PROFILE.md

### DATA-REQ-002 — 資料加密

- **來源原意**：對於可能對於個人隱私洩漏或機密資料或應保護之欄位進行加密，加密金鑰分為管理員金鑰，用來加密租戶資料；租戶金鑰用來加密租戶的客戶資料；客戶金鑰用來加密自己的資料。每一種角色持有的金鑰在帳號建立時就必須建立，並提示由帳號擁有者自行保存，顯示後離開該頁面即不顯示，金鑰存於資料庫中但由上級管理者加密，若無租戶則是系統管理者的金鑰加密，系統管理者的金鑰儲存於環境變數。
- **規範強度**：`MUST_HONOR_SOURCE_DIRECTIVE`
- **來源指令型態**：`MUST_IMPLEMENT`
- **條件模式**：`none`
- **來源明示條件**：無
- **可否使用 condition-not-triggered**：不可
- **必要審查**：Security, Crypto, Data, Frontend, Requirement Conformance
- **最低證據**：key hierarchy design; account key generation tests; display-once tests; wrapped-key storage tests; environment root-key test
- **適用技術剖面**：profiles/DATA_MANAGEMENT_PROFILE.md

### DATA-REQ-003 — 資料驗證

- **來源原意**：系統運作過程中對於輸入或輸出的資料進行合法性與完整性檢查，確保符合業務規則與系統預期，防止無效、惡意或格式錯誤的資料進入核心邏輯。採用鏈式驗證。
- **規範強度**：`MUST_HONOR_SOURCE_DIRECTIVE`
- **來源指令型態**：`MUST_IMPLEMENT`
- **條件模式**：`none`
- **來源明示條件**：無
- **可否使用 condition-not-triggered**：不可
- **必要審查**：Security, Data, API, Requirement Conformance
- **最低證據**：validation chain; input/output tests; business-rule negative tests
- **適用技術剖面**：profiles/DATA_MANAGEMENT_PROFILE.md

### DATA-REQ-004 — 資料庫備份

- **來源原意**：系統必須具備資料庫備份功能。是否可下載由系統管理員進行設定，設定後所有角色皆需繼承。每個角色僅能下載自己權限範圍許可的資料。
- **規範強度**：`MUST_HONOR_SOURCE_DIRECTIVE`
- **來源指令型態**：`MUST_IMPLEMENT`
- **條件模式**：`none`
- **來源明示條件**：無
- **可否使用 condition-not-triggered**：不可
- **必要審查**：Data, Security, Operations, Requirement Conformance
- **最低證據**：backup jobs; administrator download policy; role-scoped download tests; restore tests
- **適用技術剖面**：profiles/DATA_MANAGEMENT_PROFILE.md

## 測試類

### TEST-REQ-001 — 單元測試

- **來源原意**：對最小單元進行檢查驗證。
- **規範強度**：`MUST_HONOR_SOURCE_DIRECTIVE`
- **來源指令型態**：`MUST_IMPLEMENT`
- **條件模式**：`none`
- **來源明示條件**：無
- **可否使用 condition-not-triggered**：不可
- **必要審查**：Test Design, General Review, Requirement Conformance
- **最低證據**：unit test suite; coverage report
- **適用技術剖面**：profiles/TEST_ENGINEERING_PROFILE.md

### TEST-REQ-002 — 集合測試

- **來源原意**：對功能中最小單元執行的順序進行檢查驗證，其中包括資料傳遞、呼叫使用等各種面向進行完整流向檢測。
- **規範強度**：`MUST_HONOR_SOURCE_DIRECTIVE`
- **來源指令型態**：`MUST_IMPLEMENT`
- **條件模式**：`none`
- **來源明示條件**：無
- **可否使用 condition-not-triggered**：不可
- **必要審查**：Test Design, Integration Specialist, Requirement Conformance
- **最低證據**：integration/collection tests; data-flow assertions; call-order assertions
- **適用技術剖面**：profiles/TEST_ENGINEERING_PROFILE.md

### TEST-REQ-003 — 壓力測試

- **來源原意**：對系統運作時遭受大量請求的吞吐能力進行測試。
- **規範強度**：`MUST_HONOR_SOURCE_DIRECTIVE`
- **來源指令型態**：`MUST_IMPLEMENT`
- **條件模式**：`none`
- **來源明示條件**：無
- **可否使用 condition-not-triggered**：不可
- **必要審查**：Performance, Reliability, Requirement Conformance
- **最低證據**：load/stress plan; throughput report; saturation/recovery evidence
- **適用技術剖面**：profiles/TEST_ENGINEERING_PROFILE.md

### TEST-REQ-004 — 基準測試

- **來源原意**：對系統性能指標進行評估與量測，當環境變化後需進行測試，如硬體設備異動。
- **規範強度**：`MUST_HONOR_SOURCE_DIRECTIVE`
- **來源指令型態**：`MUST_IMPLEMENT`
- **條件模式**：`none`
- **來源明示條件**：無
- **可否使用 condition-not-triggered**：不可
- **必要審查**：Performance, Operations, Requirement Conformance
- **最低證據**：benchmark baseline; environment fingerprint; post-change benchmark
- **適用技術剖面**：profiles/TEST_ENGINEERING_PROFILE.md

### TEST-REQ-005 — 併發測試

- **來源原意**：對系統的併發能力進行測試。
- **規範強度**：`MUST_HONOR_SOURCE_DIRECTIVE`
- **來源指令型態**：`MUST_IMPLEMENT`
- **條件模式**：`none`
- **來源明示條件**：無
- **可否使用 condition-not-triggered**：不可
- **必要審查**：Concurrency, Reliability, Requirement Conformance
- **最低證據**：concurrency tests; race/deadlock/idempotency evidence
- **適用技術剖面**：profiles/TEST_ENGINEERING_PROFILE.md

### TEST-REQ-006 — 白箱、灰箱、淺黑箱、黑箱測試

- **來源原意**：對內布結構、原始碼、架構等各個環節進行知情程度測試。
- **規範強度**：`MUST_HONOR_SOURCE_DIRECTIVE`
- **來源指令型態**：`MUST_IMPLEMENT`
- **條件模式**：`none`
- **來源明示條件**：無
- **可否使用 condition-not-triggered**：不可
- **必要審查**：Security Test, QA, Requirement Conformance
- **最低證據**：white-box report; gray-box report; shallow-black-box report; black-box report
- **適用技術剖面**：profiles/TEST_ENGINEERING_PROFILE.md

### TEST-REQ-007 — E2E 測試

- **來源原意**：頁面功能建置且串接完畢後，必須編寫e2e測試碼，使其在啟動後能自動測試介面問題。
- **規範強度**：`MUST_HONOR_SOURCE_DIRECTIVE`
- **來源指令型態**：`MUST_WHEN_SOURCE_CONDITION`
- **條件模式**：`trigger`
- **來源明示條件**：頁面功能建置且串接完畢後
- **可否使用 condition-not-triggered**：可，但必須有來源條件證據
- **必要審查**：Frontend Test, QA, Requirement Conformance
- **最低證據**：E2E code; startup automation; UI result report
- **適用技術剖面**：profiles/TEST_ENGINEERING_PROFILE.md

## 管理類

### MGMT-REQ-001 — SSE 與狀態管理

- **來源原意**：所有功能或方法的啟動、執行、阻塞、錯誤、中止、結束都必須要有狀態供訂閱。(訂閱者模式或觀察者模式)，必須有狀態管理模組，內含管理相關頁面
- **規範強度**：`MUST_HONOR_SOURCE_DIRECTIVE`
- **來源指令型態**：`MUST_IMPLEMENT`
- **條件模式**：`none`
- **來源明示條件**：無
- **可否使用 condition-not-triggered**：不可
- **必要審查**：Architecture, Operations, Frontend, Security, Requirement Conformance
- **最低證據**：status event contract; all lifecycle statuses; SSE subscription tests; state management admin page
- **適用技術剖面**：profiles/ADMIN_OPERATIONS_PROFILE.md

### MGMT-REQ-002 — 排程模組

- **來源原意**：所有功能都可以進入排程系統，必須有排程管理模組，內含管理相關頁面
- **規範強度**：`MUST_HONOR_SOURCE_DIRECTIVE`
- **來源指令型態**：`MUST_IMPLEMENT`
- **條件模式**：`none`
- **來源明示條件**：無
- **可否使用 condition-not-triggered**：不可
- **必要審查**：Architecture, Operations, Security, Requirement Conformance
- **最低證據**：schedulable function registry/adapters; scheduler service; scheduler admin page; RBAC/audit tests
- **適用技術剖面**：profiles/ADMIN_OPERATIONS_PROFILE.md

### MGMT-REQ-003 — 插件系統

- **來源原意**：對於系統中可進行插拔的模組，應該進行插件系統的管理，讓模組可以替換或單獨升級，建立研擬開發規範進行通用插件開發，插件可上傳、下載、開關等功能。若無特別要求必須滿足此項目時，請保留相關擴充能力。
- **規範強度**：`MUST_HONOR_SOURCE_DIRECTIVE`
- **來源指令型態**：`SHOULD_MANAGE_WHEN_PLUGGABLE_AND_MUST_PRESERVE_EXTENSION_OTHERWISE`
- **條件模式**：`compound`
- **來源明示條件**：有可插拔模組時完整實作；無特別要求時至少保留相關擴充能力
- **可否使用 condition-not-triggered**：不可
- **必要審查**：Architecture, Security, Supply Chain, Operations, Requirement Conformance
- **最低證據**：plugin contract/specification; replace/upgrade tests; upload/download/enable/disable page or extension points
- **適用技術剖面**：profiles/ADMIN_OPERATIONS_PROFILE.md

### MGMT-REQ-004 — 資源管理

- **來源原意**：必須有一個現在系統使用資源的狀況頁面，用來了解系統現在的運作狀況。
- **規範強度**：`MUST_HONOR_SOURCE_DIRECTIVE`
- **來源指令型態**：`MUST_IMPLEMENT`
- **條件模式**：`none`
- **來源明示條件**：無
- **可否使用 condition-not-triggered**：不可
- **必要審查**：Operations, Frontend, Security, Requirement Conformance
- **最低證據**：resource metrics; resource status page; access-control tests
- **適用技術剖面**：profiles/ADMIN_OPERATIONS_PROFILE.md

### MGMT-REQ-005 — 檔案管理

- **來源原意**：若系統需要上傳檔案，請必須建立完整的檔案管理頁面進行管理，且若開啟租戶功能則必須做到資料隔離，且操作僅在角色授權範圍內操作。
- **規範強度**：`MUST_HONOR_SOURCE_DIRECTIVE`
- **來源指令型態**：`MUST_WHEN_SOURCE_CONDITION`
- **條件模式**：`trigger`
- **來源明示條件**：系統需要上傳檔案；租戶隔離條件為開啟租戶功能
- **可否使用 condition-not-triggered**：可，但必須有來源條件證據
- **必要審查**：Security, File Specialist, Frontend, Tenant Specialist, Requirement Conformance
- **最低證據**：file management page; upload/download/delete tests; tenant isolation tests; RBAC tests
- **適用技術剖面**：profiles/ADMIN_OPERATIONS_PROFILE.md

### MGMT-REQ-006 — 權限管理

- **來源原意**：每個頁面中的功能都應該能被權限控制，依角色與租戶。
- **規範強度**：`MUST_HONOR_SOURCE_DIRECTIVE`
- **來源指令型態**：`MUST_IMPLEMENT`
- **條件模式**：`none`
- **來源明示條件**：無
- **可否使用 condition-not-triggered**：不可
- **必要審查**：Security, Identity, Frontend, Requirement Conformance
- **最低證據**：page function permission catalog; role/tenant tests; admin permission page
- **適用技術剖面**：profiles/ADMIN_OPERATIONS_PROFILE.md

## 介面類

### UI-REQ-001 — RWD

- **來源原意**：必須完全符合RWD。
- **規範強度**：`MUST_HONOR_SOURCE_DIRECTIVE`
- **來源指令型態**：`MUST_IMPLEMENT`
- **條件模式**：`none`
- **來源明示條件**：無
- **可否使用 condition-not-triggered**：不可
- **必要審查**：Frontend, Accessibility, Requirement Conformance
- **最低證據**：responsive layouts; viewport tests; device/browser E2E
- **適用技術剖面**：profiles/FRONTEND_DEVELOPMENT_PROFILE.md

### UI-REQ-002 — 無障礙 AA

- **來源原意**：除非特別要求，否則無障礙設計僅達AA程度即可。
- **規範強度**：`MUST_HONOR_SOURCE_DIRECTIVE`
- **來源指令型態**：`MUST_DEFAULT_AA_UNLESS_SPECIAL_REQUIREMENT`
- **條件模式**：`default-unless`
- **來源明示條件**：除非另有特別要求，預設 AA
- **可否使用 condition-not-triggered**：不可
- **必要審查**：Accessibility, Frontend, Requirement Conformance
- **最低證據**：AA checklist; automated accessibility scan; keyboard/screen-reader tests
- **適用技術剖面**：profiles/FRONTEND_DEVELOPMENT_PROFILE.md

### UI-REQ-003 — 介面模板抽換模式

- **來源原意**：所有介面都必須具備可更換風格的特性。且更換風格是可插拔的外掛模組進行抽換。
- **規範強度**：`MUST_HONOR_SOURCE_DIRECTIVE`
- **來源指令型態**：`MUST_IMPLEMENT`
- **條件模式**：`none`
- **來源明示條件**：無
- **可否使用 condition-not-triggered**：不可
- **必要審查**：Frontend, Architecture, Plugin Security, Requirement Conformance
- **最低證據**：theme contract; pluggable theme modules; theme switch/rollback tests
- **適用技術剖面**：profiles/FRONTEND_DEVELOPMENT_PROFILE.md

### UI-REQ-004 — 多國語系

- **來源原意**：系統必須具備多國語系的切換能力，且必須可以對語系進行抽換，可能是檔案覆蓋或外掛方式。
- **規範強度**：`MUST_HONOR_SOURCE_DIRECTIVE`
- **來源指令型態**：`MUST_IMPLEMENT`
- **條件模式**：`none`
- **來源明示條件**：無
- **可否使用 condition-not-triggered**：不可
- **必要審查**：Frontend, i18n, Security, Requirement Conformance
- **最低證據**：locale switch; replaceable locale package/file; fallback tests
- **適用技術剖面**：profiles/FRONTEND_DEVELOPMENT_PROFILE.md

### UI-REQ-005 — 關鍵設定卡片

- **來源原意**：所有關鍵設定卡片都需搭配一個儲存按鈕。
- **規範強度**：`MUST_HONOR_SOURCE_DIRECTIVE`
- **來源指令型態**：`MUST_IMPLEMENT`
- **條件模式**：`none`
- **來源明示條件**：無
- **可否使用 condition-not-triggered**：不可
- **必要審查**：Frontend, UX, Requirement Conformance
- **最低證據**：save button on every critical setting card; save-state tests
- **適用技術剖面**：profiles/FRONTEND_DEVELOPMENT_PROFILE.md

### UI-REQ-006 — 即時儲存

- **來源原意**：如果有特別註明系統中的全部或部分異動是屬於即時儲存機制時，只要焦點離開欄位即進行儲存。
- **規範強度**：`MUST_HONOR_SOURCE_DIRECTIVE`
- **來源指令型態**：`MUST_WHEN_SOURCE_CONDITION`
- **條件模式**：`trigger`
- **來源明示條件**：該欄位或功能被特別註明為即時儲存
- **可否使用 condition-not-triggered**：可，但必須有來源條件證據
- **必要審查**：Frontend, Data, Requirement Conformance
- **最低證據**：blur save event; success/failure/conflict tests
- **適用技術剖面**：profiles/FRONTEND_DEVELOPMENT_PROFILE.md

### UI-REQ-007 — 滑桿

- **來源原意**：若空間不足顯示內容則顯示滑桿，但平常不顯示，除非游標在其物件之上。
- **規範強度**：`MUST_HONOR_SOURCE_DIRECTIVE`
- **來源指令型態**：`MUST_WHEN_SOURCE_CONDITION`
- **條件模式**：`trigger`
- **來源明示條件**：空間不足顯示內容
- **可否使用 condition-not-triggered**：可，但必須有來源條件證據
- **必要審查**：Frontend, Accessibility, Requirement Conformance
- **最低證據**：overflow scrollbar behavior; hover visibility tests; keyboard accessibility
- **適用技術剖面**：profiles/FRONTEND_DEVELOPMENT_PROFILE.md

### UI-REQ-008 — 懶惰載入

- **來源原意**：若頁面資料太多，不必一次載入全部資料，可以考慮懶惰載入，當畫面距離底部不足20%時執行。
- **規範強度**：`MUST_HONOR_SOURCE_DIRECTIVE`
- **來源指令型態**：`MUST_EVALUATE_AND_CONSIDER_WHEN_DATA_TOO_LARGE`
- **條件模式**：`consideration`
- **來源明示條件**：頁面資料太多；原文強度為可以考慮
- **可否使用 condition-not-triggered**：可，但必須有來源條件證據
- **必要審查**：Frontend, Performance, Accessibility, Requirement Conformance
- **最低證據**：lazy-load decision; 20% threshold test when adopted; duplicate-request and focus tests
- **適用技術剖面**：profiles/FRONTEND_DEVELOPMENT_PROFILE.md

### UI-REQ-009 — 對比

- **來源原意**：文字與底色對比度要高。
- **規範強度**：`MUST_HONOR_SOURCE_DIRECTIVE`
- **來源指令型態**：`MUST_IMPLEMENT`
- **條件模式**：`none`
- **來源明示條件**：無
- **可否使用 condition-not-triggered**：不可
- **必要審查**：Accessibility, Frontend, Requirement Conformance
- **最低證據**：contrast test; theme contrast matrix
- **適用技術剖面**：profiles/FRONTEND_DEVELOPMENT_PROFILE.md

### UI-REQ-010 — 儀表板

- **來源原意**：所有元件必須可即時更新，顯示內容必須與系統相關。
- **規範強度**：`MUST_HONOR_SOURCE_DIRECTIVE`
- **來源指令型態**：`MUST_IMPLEMENT`
- **條件模式**：`none`
- **來源明示條件**：無
- **可否使用 condition-not-triggered**：不可
- **必要審查**：Frontend, Operations, Performance, Requirement Conformance
- **最低證據**：realtime update tests for every widget; system relevance review; stale/error behavior
- **適用技術剖面**：profiles/FRONTEND_DEVELOPMENT_PROFILE.md

### UI-REQ-011 — 版本號

- **來源原意**：必須在明顯的地方顯示版本號:
- **規範強度**：`MUST_HONOR_SOURCE_DIRECTIVE`
- **來源指令型態**：`MUST_IMPLEMENT`
- **條件模式**：`none`
- **來源明示條件**：無
- **可否使用 condition-not-triggered**：不可
- **必要審查**：Frontend, Release Assurance, Requirement Conformance
- **最低證據**：visible version display; artifact/version consistency test
- **適用技術剖面**：profiles/FRONTEND_DEVELOPMENT_PROFILE.md

### UI-REQ-012 — 回到最上

- **來源原意**：必須在明顯的地方顯示回到最上的按鈕，這個按鈕式浮動的，可在設定頁面中設定是否開關。按下之後回到最上方的內容。
- **規範強度**：`MUST_HONOR_SOURCE_DIRECTIVE`
- **來源指令型態**：`MUST_IMPLEMENT`
- **條件模式**：`none`
- **來源明示條件**：無
- **可否使用 condition-not-triggered**：不可
- **必要審查**：Frontend, Accessibility, Requirement Conformance
- **最低證據**：visible floating button; settings toggle; scroll-to-top test
- **適用技術剖面**：profiles/FRONTEND_DEVELOPMENT_PROFILE.md

### UI-REQ-013 — Notify

- **來源原意**：必須有訊息通知的提示，訊息通知必須有一個閱覽介面，可以是浮動的彈窗或跟隨的區塊，但都必須具備個別通知的刪除、已讀等狀態切換。
- **規範強度**：`MUST_HONOR_SOURCE_DIRECTIVE`
- **來源指令型態**：`MUST_IMPLEMENT`
- **條件模式**：`none`
- **來源明示條件**：無
- **可否使用 condition-not-triggered**：不可
- **必要審查**：Frontend, Security, Requirement Conformance
- **最低證據**：notification indicator; viewer interface; individual delete/read-state tests
- **適用技術剖面**：profiles/FRONTEND_DEVELOPMENT_PROFILE.md

### UI-REQ-014 — 登入資訊與功能

- **來源原意**：必須在明顯地方顯示登入資訊與相關功能，如:個人資料編輯、訂閱狀態、登出等。
- **規範強度**：`MUST_HONOR_SOURCE_DIRECTIVE`
- **來源指令型態**：`MUST_IMPLEMENT`
- **條件模式**：`none`
- **來源明示條件**：無
- **可否使用 condition-not-triggered**：不可
- **必要審查**：Frontend, Identity, Requirement Conformance
- **最低證據**：visible session information; profile/subscription/logout functions; authorization tests
- **適用技術剖面**：profiles/FRONTEND_DEVELOPMENT_PROFILE.md

### UI-REQ-015 — 側邊欄

- **來源原意**：如有側邊欄必須顯示摺疊按鈕讓側邊欄縮小。
- **規範強度**：`MUST_HONOR_SOURCE_DIRECTIVE`
- **來源指令型態**：`MUST_WHEN_SOURCE_CONDITION`
- **條件模式**：`trigger`
- **來源明示條件**：介面有側邊欄
- **可否使用 condition-not-triggered**：可，但必須有來源條件證據
- **必要審查**：Frontend, Accessibility, Requirement Conformance
- **最低證據**：collapse button; state and keyboard tests
- **適用技術剖面**：profiles/FRONTEND_DEVELOPMENT_PROFILE.md

### UI-REQ-016 — 字型

- **來源原意**：用戶可自行設定字型大小
- **規範強度**：`MUST_HONOR_SOURCE_DIRECTIVE`
- **來源指令型態**：`MUST_IMPLEMENT`
- **條件模式**：`none`
- **來源明示條件**：無
- **可否使用 condition-not-triggered**：不可
- **必要審查**：Frontend, Accessibility, Requirement Conformance
- **最低證據**：font-size settings; persistence; layout/zoom tests
- **適用技術剖面**：profiles/FRONTEND_DEVELOPMENT_PROFILE.md

### UI-REQ-017 — 共用組件

- **來源原意**：所有UI開發時都必須考慮共用組件方式開發，降低重新編寫的重複成本。
- **規範強度**：`MUST_HONOR_SOURCE_DIRECTIVE`
- **來源指令型態**：`MUST_IMPLEMENT`
- **條件模式**：`none`
- **來源明示條件**：無
- **可否使用 condition-not-triggered**：不可
- **必要審查**：Frontend, Architecture, General Review, Requirement Conformance
- **最低證據**：component inventory; reuse analysis; duplicate component scan/review
- **適用技術剖面**：profiles/FRONTEND_DEVELOPMENT_PROFILE.md

## AI類

### AI-REQ-001 — AI 供應商與模型本機目錄

- **來源原意**：AI供應商與LLM模型清單請訪問 [https://llmgateway.io/models](https://llmgateway.io/models) 後建立本機目錄，並定期更新。
- **規範強度**：`MUST_HONOR_SOURCE_DIRECTIVE`
- **來源指令型態**：`MUST_IMPLEMENT`
- **條件模式**：`none`
- **來源明示條件**：無
- **可否使用 condition-not-triggered**：不可
- **必要審查**：AI Platform, Security, Operations, Requirement Conformance
- **最低證據**：local model catalog; sync job; last-update/diff records
- **適用技術剖面**：profiles/AI_INTEGRATION_PROFILE.md

### AI-REQ-002 — AI 供應商設定

- **來源原意**：設定AI供應商時必須支援openai相容、併發頻率、費用、適用範圍(文字、視覺、嵌入等)等必要資料。
- **規範強度**：`MUST_HONOR_SOURCE_DIRECTIVE`
- **來源指令型態**：`MUST_IMPLEMENT`
- **條件模式**：`none`
- **來源明示條件**：無
- **可否使用 condition-not-triggered**：不可
- **必要審查**：AI Platform, Security, Requirement Conformance
- **最低證據**：provider schema; OpenAI-compatible tests; rate/cost/scope fields
- **適用技術剖面**：profiles/AI_INTEGRATION_PROFILE.md

### AI-REQ-003 — 模型與功能參數

- **來源原意**：若模型具備可調參數，必須在設定供應商時指定，若系統某功能有使用到呼叫LLM，若該功能需要細微調整參數時，必須設計成參數可調。
- **規範強度**：`MUST_HONOR_SOURCE_DIRECTIVE`
- **來源指令型態**：`MUST_WHEN_SOURCE_CONDITION`
- **條件模式**：`trigger`
- **來源明示條件**：模型具備可調參數；功能需要細微調整參數
- **可否使用 condition-not-triggered**：可，但必須有來源條件證據
- **必要審查**：AI Platform, Security, Product, Requirement Conformance
- **最低證據**：parameter schema; provider settings; feature-level parameter controls
- **適用技術剖面**：profiles/AI_INTEGRATION_PROFILE.md

### AI-REQ-004 — Agent 工具與管理頁面

- **來源原意**：若系統具備代理人可以進行工具呼叫功能，請務必建立 SKILLS、MCP、Plugin、Connector等相關AI Agent會用到的功能與頁面。
- **規範強度**：`MUST_HONOR_SOURCE_DIRECTIVE`
- **來源指令型態**：`MUST_WHEN_SOURCE_CONDITION`
- **條件模式**：`trigger`
- **來源明示條件**：系統具備可進行工具呼叫的代理人
- **可否使用 condition-not-triggered**：可，但必須有來源條件證據
- **必要審查**：AI Security, MCP/Tool Specialist, Frontend, Requirement Conformance
- **最低證據**：SKILLS management; MCP management; Plugin management; Connector management; tool authorization and audit tests
- **適用技術剖面**：profiles/AI_INTEGRATION_PROFILE.md

## 共同開發類

### DEV-REQ-001 — Commit／PR 版本號規則

- **來源原意**：每次commit 版本號右邊+1，pr 進 stage 中間版本號 +1 ，版本號右邊清零
- **規範強度**：`MUST_HONOR_SOURCE_DIRECTIVE`
- **來源指令型態**：`MUST_IMPLEMENT`
- **條件模式**：`none`
- **來源明示條件**：無
- **可否使用 condition-not-triggered**：不可
- **必要審查**：Release Assurance, CI Specialist, Requirement Conformance
- **最低證據**：commit version increment; stage PR version increment; right-side reset; CI logs
- **適用技術剖面**：profiles/COLLABORATION_VERSIONING_PROFILE.md
