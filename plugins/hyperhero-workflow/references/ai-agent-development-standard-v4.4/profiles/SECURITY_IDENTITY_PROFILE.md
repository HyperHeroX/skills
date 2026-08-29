# 資安、身分與授權 Profile v4.4

本 Profile 實作 `SEC-REQ-001～009`。

- 所有頁面可執行元件受 RBAC；API、Service、Job、Event、File、Plugin、Scheduler 同時以同一權威 Permission Catalog 授權。
- 所有帳號預設最小權限且不得自行提權；首次啟動由最高管理者設定帳號密碼，完成後關閉初始化入口。
- 支援 2FA、Authenticator、PassKey、Email Verify Code；使用者可選擇，管理者強制時個人設定失效並顯示繼承來源。
- 管理者跨租戶行為、資料、操作、Log 查探留下完整稽核。
- Token 為主要鑑權，OAuth 為第二選項；支援由產品基線定義的市場前五 Provider。
- CORS 必須可在系統管理頁設定，並具安全驗證、稽核與回復。
- 系統操作／資料／事件 Log 與程式程序／方法／錯誤 Log 分開且分級。
- 規劃階段建立資通系統防護基準適用性與證據。
- 帳號以外資料只在功能需要時蒐集，並完成分類、加密、遮蔽、存取、保留與刪除保護。
