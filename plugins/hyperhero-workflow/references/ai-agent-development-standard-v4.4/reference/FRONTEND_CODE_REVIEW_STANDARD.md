# 前端程式碼審查標準 v4.4

Frontend Reviewer 必須同時審查：

1. `UI-REQ-001～017` 的來源功能是否完整實作。
2. `reference/FRONTEND_DEVELOPMENT_STANDARD.md` 的 FED-001～070。
3. 通用開發行為 GDB 與通用實作品質 GIQ。

## 1. Frontend Engineering Review

- Page／Feature／Component／State／API Client／Design System 邊界。
- 是否重用既有元件，是否產生第二套平行 Client／Store／Dialog／Table／Notification。
- Strict Type、Runtime Schema、Async State、Abort、Race、Retry、Stale、Conflict。
- RWD、Theme、i18n、設定卡 Save、Blur Auto-save、20% Lazy Load、即時 Dashboard、版本、回頂、通知、Session Menu、Sidebar、Font Size。
- Loading／Empty／No-result／Error／Unauthorized 與復原體驗。
- Bundle、圖片、字型、第三方依賴、RUM 與 Source Map。

## 2. Frontend Security Review

- Server-side AuthZ／Tenant 是否存在；Route Guard／按鈕隱藏不得作為授權。
- DOM XSS、Raw HTML、URL／Redirect、`postMessage`、Storage、Cookie／Token、CSRF。
- Service Worker、Third-party Script、CSP、Client Bundle Secret、File Preview／Upload。
- 登出、切換帳號／租戶、Cache／Store／IndexedDB 清除與跨使用者洩漏。

## 3. Accessibility／i18n Review

- WCAG AA、Semantic HTML、Keyboard、Focus、Screen Reader、Error Association、Live Region。
- Contrast、Reduced Motion、Zoom、Font Size、Touch Target、RTL、Locale、Plural、Date／Number。

## 4. Blocking Finding

下列任一情況均阻擋：

- 來源 UI 行為缺失或被「最佳實務」替換。
- 只有 UI RBAC，沒有 Server 授權。
- 只有後端功能，缺少要求的管理頁／使用者介面。
- 不可信 HTML／URL／Message／Storage 路徑未受控。
- 鍵盤無法完成核心流程、AA 嚴重缺陷或核心 RWD 失敗。
- 前端 Profile 未載入、未審範圍未揭露或證據不綁定最終 Revision。
