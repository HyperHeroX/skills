# 前端開發 Profile v4.4

當任務涉及任何 UI、瀏覽器、WebView、HTML、CSS、Client Script、Component、Page、Form、Router、Store、Theme、i18n、Accessibility、PWA 或前端資產時必須載入。

權威細節：`reference/FRONTEND_DEVELOPMENT_STANDARD.md`。

本 Profile 框架中立，禁止只因 Repository 不是 Vue／Nuxt／React／Angular 就跳過。

最低要求：

- 明確 Page／Feature／Component／State／API Client／Design System 邊界。
- Strict Type 與 Runtime Schema；Server State 與 UI State 分離。
- Client 只改善體驗，AuthZ／Tenant／Validation 由 Server 權威執行。
- XSS、CSRF、Cookie／Token、URL、`postMessage`、Storage、Service Worker、第三方 Script 與 Source Map 安全。
- RWD、WCAG AA、Theme、i18n、所有關鍵設定卡片都有獨立儲存按鈕、Blur Auto-save、距底部不足 20% 的 Lazy Load、儀表板每個元件都可即時更新、版本號、浮動回到最上按鈕、通知、Session Menu、Sidebar、使用者可設定字型大小與共用元件。
- Loading／Empty／No-result／Error／Unauthorized、Abort、Race、Retry、Rollback、Stale 與 Reconnect。
- Component、Contract、E2E、Accessibility、Browser、Visual、Performance 與 Security Test。
- Frontend Engineering、Frontend Security、Accessibility／i18n 專業代理獨立審查。


驗收關鍵詞：`Dashboard 即時`、`回頂`、關鍵設定卡、距底部不足 20%、使用者字型大小。
