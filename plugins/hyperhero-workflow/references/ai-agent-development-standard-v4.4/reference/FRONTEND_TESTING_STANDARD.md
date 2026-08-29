# 前端測試標準 v4.4

本標準驗證 `UI-REQ-001～017` 與 `FED-001～070`，不依 Vue、React、Angular 或其他特定框架。

## 1. L0 MVP

- 核心頁面 Build／Type-or-Schema／Lint。
- 核心流程 Component／Smoke。
- 基本 RWD、Keyboard、Contrast、表單與 XSS 負面測試。
- Secret-in-client-bundle 與 Dependency Scan。

## 2. L1 正式專案

- Unit、Component、API Contract、State、Form、Error／Empty／Unauthorized。
- Theme、Locale、Font Size、設定卡 Save、Blur Auto-save。
- Client Auth／Tenant Negative Test、Abort、Race、Retry、Stale Response。

## 3. L2 內部測試

- RWD Viewport／Browser／Zoom／Touch Matrix。
- WCAG AA 自動與人工 Keyboard／Focus／Screen-reader 測試。
- Visual Regression：Theme、Locale、RTL、Font Size、Contrast、Loading／Error。
- Scrollbar Hover／Focus、Lazy Load 20%、Duplicate Request、Focus Preservation。
- Dashboard 每個 Widget 的 Real-time、Stale、Disconnect、Reconnect、Permission。
- Version、Back-to-top、Notification、Login Menu、Sidebar、Shared Component Regression。
- 主要流程 E2E、弱網路、離線、Session Expiry、多分頁與 Account／Tenant Switch。
- XSS、CSRF、Open Redirect、`postMessage`、Storage、Service Worker、Third-party Script、Client-only AuthZ。
- Bundle Budget、Core Web Vitals／等價效能、Memory／Listener Leak。

## 4. L3–L4

- 真實瀏覽器與裝置的 Pilot 監控、RUM、CSP Report、Error Rate。
- Release Asset Digest、Source Map Access、Cache／Service Worker 更新與 Rollback。
- 正式 Browser Support 與 AA 證據。

## 5. L5–L6

- Browser／Framework／Dependency EOL 與 CVE。
- Design System Drift、Bundle Growth、Flaky E2E、Accessibility Regression。
- 退役時清除 Service Worker、Cache、IndexedDB、Static Asset、Analytics 與第三方 Script。

Scanner Error、Timeout、未執行、Coverage 缺失或只測 Happy Path 均不得視為通過。
