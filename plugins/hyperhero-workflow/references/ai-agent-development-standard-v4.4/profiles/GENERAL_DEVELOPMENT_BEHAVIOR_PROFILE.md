# 通用開發行為 Profile v4.4

本 Profile **所有寫入任務一律載入**，不依語言、作業系統或框架啟用。

權威細節：`reference/GENERAL_DEVELOPMENT_BEHAVIOR_STANDARD.md`。

AI Builder 必須：

1. 先理解不可變需求、現有架構、測試與安全不變條件。
2. 小步、單一目的、最小 Diff；不得混入無關格式化或平行實作。
3. 優先重用既有模組、共用元件與契約。
4. 禁止一次性程式碼、TODO／Stub／空 Catch／廣域 Suppression。
5. 功能、測試、文件、Telemetry、Migration、Rollback 同步交付。
6. 不得削弱測試、Analyzer、Scanner、授權、租戶、驗證或稽核。
7. Builder Self-review 不等於獨立 Review。
8. 完成聲明必須有同一 Revision 的可重現證據。

本 Profile 的來源精神可來自 Linux Kernel、Google、Microsoft、NASA 等公開工程資料，但**不代表採用 Linux、C#、.NET 或任何特定平台**。
