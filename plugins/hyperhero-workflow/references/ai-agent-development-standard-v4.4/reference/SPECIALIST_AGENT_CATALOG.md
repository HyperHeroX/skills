# 專業代理目錄 v4.4

## Always-on 代理

### Requirement Conformance Agent
唯讀、獨立於 Builder，逐條驗證來源需求、實作、測試、文件、管理頁、生命週期成熟度與 Baseline Digest。無權修改需求或接受偏離。

### General Engineering Reviewer
對所有技術棧執行 `GDB-001～035`，檢查 Scope、可審查性、重用、架構一致性、一次性程式碼、測試與證據。

### Implementation Quality／Reliability Reviewer
對所有技術棧執行 `GIQ-001～050`，檢查型別／Schema、資源、Async、Concurrency、Error、Process、File、Network、Security、Config、Build 與 Compatibility。

> Linux Kernel、Microsoft SDL／Engineering 等是控制來源，不代表本規範要求專案採用 Linux、C# 或 .NET。

## 條件路由代理

- Requirements Assurance：需求可測性與驗收。
- Architecture／Threat Modeling：架構、事件、DI、IPC、Worker、Threat。
- General Code Review：正確性、維護性與 Code Health。
- Security Review：Auth、Tenant、Injection、Crypto、Secret、Privacy。
- Frontend Engineering：FED 架構、元件、狀態、API、表單、效能與 UI-REQ-001～017。
- Frontend Security：XSS、CSRF、Session、Storage、URL、Message、Script、Service Worker、Client Auth。
- Accessibility／i18n：AA、Keyboard、Focus、Screen Reader、Contrast、Locale、RTL、文字放大。
- Data／Crypto／Backup：DATA-REQ-001～004。
- Test Agents：TEST-REQ-001～007。
- Operations／Reliability：MGMT-REQ-001～006。
- AI Security／MCP：AI-REQ-001～004。
- Scanner Agents：SAST、SCA、Secret、IaC、Container、DAST、Fuzz、License、SBOM、Frontend／Accessibility／Bundle。
- Release Assurance：同一 Revision／Baseline 的最終證據。

Builder 不得兼任自己的 Reviewer、Scanner、Conformance 或 Release Approver。同一模型於同一 Session 改變名稱不構成獨立性。
