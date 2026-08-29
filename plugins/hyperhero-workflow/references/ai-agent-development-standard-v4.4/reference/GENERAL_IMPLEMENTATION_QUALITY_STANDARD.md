# 通用程式實作與執行品質基準 v4.4

> **適用性**：所有語言、框架與執行環境。語言或平台專用工具可作為實作手段，但不得把本基準限縮成任何單一技術棧。

## 1. 型別、資料與契約

- **GIQ-001**：採用語言可提供的最強合理型別與靜態分析；動態語言需以 Schema、Type Hint、Contract Test 或等價方式補強。
- **GIQ-002**：禁止未受控的 `any`／動態物件／字典式資料穿越核心邏輯；外部邊界資料必須先解析、驗證與正規化。
- **GIQ-003**：Null／Missing／Empty／Zero／Default 必須具有明確不同語意，不得用隱式預設掩蓋錯誤。
- **GIQ-004**：公開 API、事件、IPC、檔案、設定與資料庫 Schema 必須版本化，定義相容、棄用與 Migration。
- **GIQ-005**：輸入與輸出都要驗證；Server、權威服務或資料層是最終規則執行者，Client Check 只改善體驗。

## 2. 資源、非同步與併發

- **GIQ-006**：Stream、Connection、Transaction、Lock、File、Socket、Process、Subscription 與其他資源必須有明確 Owner、生命週期與保證釋放機制。
- **GIQ-007**：所有可能阻塞的 I/O 必須具 Timeout；可取消流程必須傳遞 Cancellation／Abort，不得在內部吞掉取消訊號。
- **GIQ-008**：同步與非同步邊界不得造成 Deadlock、Thread／Event-loop Starvation 或無界併發；Blocking Call 必須隔離與量測。
- **GIQ-009**：共享可變狀態必須避免或以明確同步機制保護；定義 Race、Ordering、Duplicate Delivery 與 Visibility 行為。
- **GIQ-010**：Retry 只用於可判定的暫時性錯誤，採上限、Backoff、Jitter 與 Cancellation；非冪等操作必須先具冪等或補償設計。

## 3. 錯誤、例外與回復

- **GIQ-011**：例外不得作一般控制流；錯誤需分類為 Validation、Authorization、Conflict、Transient、Permanent、Dependency、Resource Exhaustion 等可操作類型。
- **GIQ-012**：不得空 Catch、吞錯或只寫字串；保留 Cause、Trace／Correlation、Context 與安全遮蔽後的必要資料。
- **GIQ-013**：對外錯誤不得暴露 Stack、SQL、Path、Secret、Token、內部 Host 或敏感資料；使用穩定錯誤碼與 `trace_id`。
- **GIQ-014**：Partial Failure 必須定義 Commit Point、補償、重試、人工介入與重入行為。
- **GIQ-015**：程序與服務必須可優雅停止：停止接收新工作、處理／取消在途工作、Flush 必要狀態、釋放資源並在期限內退出。

## 4. 外部程序、檔案與路徑

- **GIQ-016**：呼叫子程序使用 Argument Array／安全 Process API；禁止把不可信字串拼成 Shell 命令或使用 `eval`。
- **GIQ-017**：子程序必須限制 Working Directory、Environment Allowlist、Timeout、Output Size、Exit Code 與取消；不得把 Secret 放入可見命令列。
- **GIQ-018**：檔案路徑必須 Canonicalize、限制於允許根目錄並防止 Traversal、Symlink Escape、TOCTOU 與不安全臨時檔。
- **GIQ-019**：重要檔案更新採安全臨時檔、完整寫入、必要同步與 Atomic Replace；不得讓中斷留下半寫狀態。
- **GIQ-020**：檔案與目錄權限採最小權限；Secret、私鑰、備份與匯出不得放在公開路徑或無存取控制的暫存區。

## 5. 網路、外部服務與資源界限

- **GIQ-021**：外部 Client 必須集中治理 Connection Pool、DNS 更新、Timeout、Retry、Circuit Breaker、TLS、Proxy 與 Telemetry，禁止每次呼叫任意建立資源。
- **GIQ-022**：Network Listener 明確設定 Bind、Port、Protocol、TLS、Authentication、Rate／Size Limit 與 Health／Readiness，不得預設暴露所有介面。
- **GIQ-023**：CPU、Memory、Thread／Task、Connection、FD、Queue、Payload、File、Recursion、Batch 與模型 Token 都必須有上限與耗盡測試。
- **GIQ-024**：反序列化、Parser、Archive、Image、Document、Regex 與 Template 必須限制型別、深度、大小、數量、時間與擴張比例。
- **GIQ-025**：所有外部依賴失敗都要有明確降級、隔離、告警與恢復策略；不得形成無界級聯重試。

## 6. 安全實作

- **GIQ-026**：SQL、Query、Command、Template、URL、Header 與 Path 必須使用參數化或安全建構 API，不得字串拼接不可信輸入。
- **GIQ-027**：授權在權威 Server／Service 每次執行，包含 Tenant、Object、Action、State；UI 隱藏、Route Guard、Token Decode 不構成授權。
- **GIQ-028**：密碼學只使用組織核准、維護中的平台／函式庫 API、CSPRNG、AEAD／Signature 與安全 Key Store；禁止自訂演算法、固定 Nonce／IV 或不安全 Random。
- **GIQ-029**：Secret 只能由受控 Secret Store／KMS／注入機制取得，不得進入程式碼、Repository、Log、錯誤、測試、Prompt、Artifact 或 Client Bundle。
- **GIQ-030**：動態載入、反射建立型別、外掛、Native／FFI、Unsafe、JIT Code Generation 與自修改行為屬高風險，需 Allowlist、隔離與專業審查。

## 7. 設定、日誌與可觀測性

- **GIQ-031**：設定必須具 Schema、型別、預設值、環境差異、Secret Reference 與啟動驗證；Development 設定不得默默流入 Production。
- **GIQ-032**：Structured Logging 使用穩定欄位與等級，區分 Operation、Audit、Security 與 Diagnostic；避免可偽造換行與高基數失控。
- **GIQ-033**：Telemetry 必須能關聯 Version、Environment、Tenant／Subject（經最小化）、Trace、Operation 與錯誤碼，不得記錄不必要敏感內容。
- **GIQ-034**：Health 不只代表程序存在；需區分 Liveness、Readiness、Dependency、Backlog、Degraded 與安全狀態。
- **GIQ-035**：Feature Flag、動態設定與遠端控制必須具 Owner、權限、Audit、環境範圍、預設安全值、到期與移除計畫。

## 8. Build、依賴與發行

- **GIQ-036**：Toolchain、Runtime、Dependency、Generator 與 Container／Build Image 必須固定且可追溯；依賴來源使用 Allowlist。
- **GIQ-037**：新程式碼不得增加 Compiler、Linter、Analyzer 或安全 Warning；Suppression 必須最小 Scope、理由、Owner 與到期日。
- **GIQ-038**：Generated Code 只能由固定版本 Generator／Schema 重現；優先審查來源與模板，不手工修改產物。
- **GIQ-039**：Release Artifact 只能由受控 CI 在乾淨環境產生，具 Digest、SBOM、Provenance 與必要簽章；不得由 Agent 工作站直接發布。
- **GIQ-040**：Dependency 更新需評估 API、行為、License、CVE、Transitive Graph、Build／Bundle、Migration 與 Rollback，禁止只因「最新版」升級。

## 9. 相容性、國際化與精度

- **GIQ-041**：時間內部使用明確 Instant／UTC，邊界明示 Timezone；不得依系統本地時間或模糊字串。
- **GIQ-042**：金額、比率與精確數值使用 Decimal／Fixed-point／Big Number；禁止用二進位浮點承載金流語意。
- **GIQ-043**：文字使用完整 Unicode／UTF-8，正確處理 Normalization、Length、Grapheme、Locale 與排序；不得以 Byte Length 代替使用者字元。
- **GIQ-044**：公開行為變更需相容性測試、Deprecation、Consumer 通知與 Rollback／Roll-forward；環境升級不能自動推論為相容。
- **GIQ-045**：效能優化先建立 Baseline／Profile，再證明改善且沒有安全、正確性、可讀性或資源洩漏回歸。

## 10. 語言與平台工具的正確定位

- **GIQ-046**：各語言可使用其 Formatter、Compiler、Type Checker、Analyzer、Package Audit 與 Test Runner，但工具名稱不是規範本身。
- **GIQ-047**：作業系統可使用其 Service Manager、Sandbox、Permission 與 Package 工具，但不得把某一作業系統設為所有專案必要條件。
- **GIQ-048**：框架慣例只在不違反不可變需求、安全不變條件與本基準時採用。
- **GIQ-049**：技術專用 Overlay 只能增加細節，不得取代或弱化 GIQ-001～048。
- **GIQ-050**：沒有專用 Overlay 時，Builder 仍必須完整遵守本通用基準，不得以「規範未列出此語言」為由跳過控制。
