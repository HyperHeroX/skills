# 通用程式實作與執行品質 Profile v4.4

本 Profile **所有寫入任務一律載入**，不依語言、作業系統或框架啟用。

權威細節：`reference/GENERAL_IMPLEMENTATION_QUALITY_STANDARD.md`。

最低要求：

- 強型別／Schema、明確 Null 與版本化契約。
- Resource Ownership、Timeout、Cancellation、Cleanup、Graceful Shutdown。
- Concurrency、Retry、Idempotency、Partial Failure 與資源上限。
- 參數化 Query／Command／Path／Template；禁止不可信字串執行。
- Server-side AuthZ、Secret Store、核准 Crypto、輸入輸出驗證。
- Structured Log、Telemetry、Health、設定 Schema 與安全預設。
- 固定 Toolchain／Dependency、無新增 Warning、可重現 CI Artifact。
- UTC／Timezone、Unicode、Decimal、相容性與效能 Baseline。

語言或平台工具只是執行手段，不能把本 Profile 限縮為 Linux、C#、.NET 或單一框架規範。
