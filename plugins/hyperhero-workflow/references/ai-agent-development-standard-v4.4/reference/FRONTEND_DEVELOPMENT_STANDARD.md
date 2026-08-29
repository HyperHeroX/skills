# 前端開發基準 v4.4

> **適用性**：所有具有瀏覽器、WebView、桌面 Web Runtime、行動 Web 或其他互動式 Client UI 的系統。  
> **框架中立**：適用於 Vue、Nuxt、React、Angular、Svelte、Web Components、原生 JavaScript／TypeScript 或其他框架；不得綁定單一技術棧。  
> **需求權威**：本基準補強 `UI-REQ-001～017`，不得改寫、刪除或條件化產品負責人的前端必備功能。

## 1. 前端架構與責任邊界

- **FED-001**：前端必須明確區分 App Shell、Layout、Page／Route、Feature、Shared Component、Form、State、API Client、Domain Adapter、Utility 與 Design Token。
- **FED-002**：Page／Route 不得同時承擔 API 細節、商業規則、授權判定、資料轉換與複雜渲染；責任須下沉至可測試模組。
- **FED-003**：共用元件具有明確 Props／Inputs、Events／Outputs、Slots／Children、狀態、Accessibility Contract 與 Theme Contract，不依賴隱藏全域狀態。
- **FED-004**：先搜尋既有 Design System、元件、Composable／Hook、Store、API Client 與 Validator；禁止建立第二套 Button、Dialog、Table、Notification、Auth Client 或 Error Handler。
- **FED-005**：框架、Router、Store、Query Cache、Form、i18n 與 UI Library 的引入必須有明確責任，不得以套件取代架構思考。

## 2. 型別、Schema 與資料邊界

- **FED-006**：採用語言可提供的 Strict Type／Static Analysis；API、Route Param、Form、Event、Store、Component Contract 與 Feature Flag 必須有型別。
- **FED-007**：編譯期型別不能取代 Runtime Validation；API、Storage、URL、Message、File、第三方 Script 與模型輸出進入前端時須驗證。
- **FED-008**：OpenAPI／JSON Schema／事件契約產生的型別應作單一來源，不得手動複製成容易漂移的第二份 DTO。
- **FED-009**：日期、金額、枚舉、Nullable、Optional、Empty 與錯誤狀態必須在 Client Contract 明確表示。
- **FED-010**：不可信資料不得直接進入 HTML、Style、URL、DOM Selector、Template、Script、Storage Key 或權限判定。

## 3. Component 與狀態管理

- **FED-011**：Local UI State 優先；只有跨元件、跨頁、持久或共享業務狀態才進入 Store，且必須定義 Owner 與清除時機。
- **FED-012**：Server State、Authentication State、Form State、Navigation State、Ephemeral UI State 與 Cached Derived State 必須分離。
- **FED-013**：禁止單一巨型 Store 同時保存所有使用者、Tenant、權限、API Cache、Modal 與頁面草稿。
- **FED-014**：Store／Cache 必須按 User、Tenant、Environment 與版本隔離；登入切換、登出與權限變更時清除受影響資料。
- **FED-015**：非同步流程使用顯式狀態模型，至少涵蓋 `idle/loading/success/empty/no-result/error/unauthorized/stale/partial/cancelled` 的適用部分。

## 4. API Client、非同步與即時資料

- **FED-016**：API Client 集中管理 Base URL、Auth、Timeout、Abort、Trace、Error Normalization、Retry、Idempotency 與內容型別；禁止每個 Component 自建 Wrapper。
- **FED-017**：頁面卸載、參數改變或新請求取代舊請求時，必須取消或忽略過期回應，防止 Stale Response 覆蓋新資料。
- **FED-018**：非冪等請求不得自動無上限重試；重複提交需 Client Lock 與 Server Idempotency 共同保護。
- **FED-019**：Session Refresh 採 Single-flight、上限與失敗終止，避免 Refresh Storm、無限 401 Loop 與多分頁競爭。
- **FED-020**：SSE／WebSocket／Polling 必須處理授權到期、重連 Backoff、事件去重、順序、斷線、Stale、資源釋放與可觀測性。

## 5. 身分、授權與瀏覽器安全

- **FED-021**：Route Guard、隱藏按鈕、Client Role、JWT Decode、前端 Tenant ID 與 Feature Flag 都不構成授權；Server 必須重新授權。
- **FED-022**：瀏覽器身分優先使用 `Secure`、`HttpOnly`、適當 `SameSite` Cookie；長效 Access／Refresh Token 不得預設放入 `localStorage`。
- **FED-023**：採 Cookie Session 時需 CSRF 防護；採 Token Flow 時需處理儲存、更新、撤銷、登出、XSS 與多分頁同步風險。
- **FED-024**：登出必須清除敏感 Store、Cache、Storage、IndexedDB、Service Worker Cache、即時連線與畫面殘留。
- **FED-025**：401、403、Session Expired、Account Locked 與 Network Failure 應分開處理，不得把授權失敗誤當一般錯誤或自動重試。

## 6. DOM XSS、URL、DOM 與第三方內容

- **FED-026**：禁止將不可信內容交給 `innerHTML`、等價 Raw HTML API 或動態 Script；必要時使用經核准 Sanitizer、CSP 與 Trusted Types／等價控制。
- **FED-027**：URL、Redirect、Download、Link Target 與自訂 Scheme 必須 Allowlist Protocol／Origin／Path，防止 `javascript:`、Open Redirect 與 Tabnabbing。
- **FED-028**：`postMessage` 必須驗證精確 Origin、Source、Message Schema 與 Replay／Correlation；不得使用 `*` 傳送敏感內容。
- **FED-029**：第三方 Script、Widget、Tag Manager、SDK 與 CDN 必須有 Owner、用途、資料流、版本、完整性、CSP、Consent 與移除方式。
- **FED-030**：Service Worker／PWA 必須限制 Scope、Cache、更新、離線資料、版本切換與撤銷；不得快取敏感 API 回應或造成舊版永久控制。

## 7. 表單與資料輸入

- **FED-031**：每個輸入都有可見 Label／Accessible Name、型別、Autocomplete、Input Mode、必要性、格式說明與錯誤關聯。
- **FED-032**：Client Validation 服務 UX；Server Validation 是權威。錯誤分為欄位、表單、業務衝突、授權與系統錯誤。
- **FED-033**：錯誤不在 Focus 時立即干擾；依需求採 Blur 或提交後 Change，且訊息具體、可操作、不洩漏敏感資訊。
- **FED-034**：提交後立即顯示處理狀態並防重複；失敗恢復可操作狀態，成功後避免重送與 Back/Refresh 重複副作用。
- **FED-035**：草稿與 Auto-save 必須定義資料敏感度、儲存位置、TTL、版本、User／Tenant 綁定、衝突、還原與刪除；敏感欄位不得無條件持久化。

## 8. 產品負責人指定的前端必備行為

- **FED-036**：所有頁面必須完整 RWD，涵蓋小螢幕、縮放、橫直向、觸控、鍵盤與內容放大。
- **FED-037**：無障礙至少達 WCAG AA；Semantic HTML 優先，並處理鍵盤、Focus、名稱／角色／值、對比、錯誤、Live Region 與 Reduced Motion。
- **FED-038**：所有介面風格可抽換，使用 Design Token 與受控 Theme Package／Plugin；抽換不得執行未授權任意程式碼。
- **FED-039**：支援多國語系與可抽換語系包；禁止在可見介面硬編字串，需處理複數、日期、數字、方向與文字擴張。
- **FED-040**：每張關鍵設定卡片必須有獨立儲存按鈕；即使啟用 Auto-save 也不得取消，並顯示 Dirty／Saving／Saved／Failed／Conflict。
- **FED-041**：被明示為即時儲存的欄位在 Blur 時儲存；必須去重、序列化、處理競爭、失敗與離頁。
- **FED-042**：內容溢位時提供 Scrollbar，平常可視設計隱藏、Hover／Focus 時顯示；不得破壞鍵盤、觸控或作業系統捲動設定。
- **FED-043**：資料過多時採 Lazy Load／Pagination／Virtualization；採需求指定模式時距底部不足 20% 觸發，且防止重複、跳頁、焦點遺失與無限請求。
- **FED-044**：文字與背景具足夠對比，狀態不得只靠顏色；使用者可調字型大小且版面不可因此截斷核心功能。
- **FED-045**：儀表板每個元件都可即時更新，顯示資料時間、連線／Stale／Error 狀態，且內容必須與系統相關。
- **FED-046**：明顯位置顯示 Release／Build 版本號，且可對應實際部署 Artifact。
- **FED-047**：提供可設定開關的浮動回到最上按鈕；需支援鍵盤、Focus 與 Reduced Motion。
- **FED-048**：提供通知提示與閱覽介面，支援每筆已讀／未讀、個別刪除、連結、分類、權限與跨 Tenant 隔離。
- **FED-049**：明顯位置顯示登入資訊與個人資料、訂閱狀態、Session／裝置及登出等相關功能。
- **FED-050**：存在側邊欄時必須有展開／收合控制，保存狀態時需按 User／Device 範圍，不得影響 Accessibility。
- **FED-051**：所有 UI 開發優先使用共用元件與 Design System，防止重複成本與行為漂移。

## 9. Loading、錯誤與復原體驗

- **FED-052**：資料頁面至少實作 Loading、Empty、No-result、Error、Unauthorized 的適用狀態，不得以空白或永遠 Spinner 取代。
- **FED-053**：Loading 優先維持版面結構；Error 提供安全訊息、`trace_id` 與 Retry；No-result 提供清除篩選；Empty 提供說明與 CTA。
- **FED-054**：破壞性操作依風險使用確認、Step-up、Undo／Soft Delete 與 Recovery；不得只依瀏覽器原生 Alert。
- **FED-055**：Optimistic UI 必須有 Rollback、Conflict、重新同步與最終 Server Truth，不得在失敗後留下錯誤畫面狀態。

## 10. 效能、Bundle 與可觀測性

- **FED-056**：建立 JavaScript、CSS、Image、Font、Initial Route 與 Third-party Budget；新增依賴需提供 Bundle 差異與使用理由。
- **FED-057**：採 Code Splitting、Lazy Module、Tree Shaking、適當 Cache 與 Prefetch；不得把管理頁或低頻功能全放入初始 Bundle。
- **FED-058**：圖片與媒體定義尺寸、格式、壓縮、Lazy Load、替代文字與錯誤行為，避免 Layout Shift 與無界記憶體。
- **FED-059**：前端 Telemetry／RUM 記錄 Release、Route、Trace、Web Vital 與錯誤，但不得包含 Token、原始 PII、密碼、完整表單或敏感 URL Query。
- **FED-060**：Source Map 上傳至受控錯誤平台並限制公開存取；不得因方便除錯在正式站公開原始碼映射與 Secret。

## 11. 前端測試與專業代理

- **FED-061**：Unit 測試涵蓋純邏輯、Formatter、Validator、Permission Mapping 與狀態轉換。
- **FED-062**：Component 測試涵蓋 Props／Events、Loading／Error、Keyboard、Focus、Theme、Locale 與邊界資料。
- **FED-063**：Contract 測試驗證 API／Event／Schema 與 Client 型別一致，並涵蓋錯誤回應與版本相容。
- **FED-064**：E2E 涵蓋完成串接的主要使用者流程、Auth、RBAC、Tenant、表單、通知、檔案與管理功能。
- **FED-065**：L2 前執行 RWD、Browser、Accessibility、自動與人工鍵盤、Visual Regression、Performance、弱網路、離線／重連與安全負面測試。
- **FED-066**：Frontend Engineering Reviewer 檢查架構、狀態、重用、非同步、效能與可維護性。
- **FED-067**：Frontend Security Reviewer 檢查 XSS、CSRF、Session、Storage、URL、Message、Script、Service Worker、Client Auth 與資料外洩。
- **FED-068**：Accessibility／i18n Reviewer 檢查 AA、Keyboard、Focus、Screen Reader、Contrast、Locale、RTL、字型放大與微文案。
- **FED-069**：Scanner Agent 執行適用的 Type Check、Lint、SAST、SCA、Secret、Component、E2E、Accessibility、Bundle、CSP 與 Browser Security 檢查。
- **FED-070**：任何 UI-REQ-001～017 或 FED-001～069 缺失、只做畫面未做 Server Control、或只做後端未做必要 UI，皆為 Blocking Finding。

## 12. 生命週期前端重點

| 階段 | 前端最低關注 |
|---|---|
| L0 MVP | 架構骨架、共用元件、Strict／Schema、核心 RWD、基本 AA、核心流程與安全底線。 |
| L1 正式專案 | Design System、Theme、i18n、State／API Client、完整 UI 狀態、表單、Component／Contract Test。 |
| L2 內部測試 | Browser／Viewport、E2E、Accessibility、Visual、Performance、Security、弱網路與即時重連。 |
| L3 試營運 | RUM、錯誤監控、CSP Report、Pilot Funnel、Feature Flag、快速回退與真實裝置觀察。 |
| L4 正式上市 | AA 正式證據、Browser Support、Bundle Budget、Source Map 治理、Release Asset 完整性。 |
| L5 維護 | Browser／Framework EOL、Dependency CVE、UI Regression、Bundle Growth、Flaky E2E、Design System Drift。 |
| L6 退役 | Service Worker、Cache、IndexedDB、Static Asset、Deep Link、Analytics、第三方 Script 與前端 Credential 清理。 |
