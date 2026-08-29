# 外部標準與產品必備需求對照表 v4.4

> **原則**：外部標準只提供安全實作、審查、掃描與證據方法，不得改寫 `requirements/USER_MANDATORY_REQUIREMENTS_BASELINE.md`。

| 外部標準／公開工程實務 | 導入精神 | 主要對應需求／文件 | 不得取代的來源要求 |
|---|---|---|---|
| NIST SSDF SP 800-218／800-218A | SSDLC、角色、證據、弱點回饋、AI 開發安全 | `reference/SSDLC_LIFECYCLE.md`、全體 Requirement | 不得用風險裁剪取消產品必備功能 |
| OWASP ASVS／WSTG／SAMM | Web／API 驗證、測試、成熟度 | `SEC-REQ-*`、`DATA-REQ-*`、`TEST-REQ-*`、`UI-REQ-*` | UI RBAC、CORS、2FA、日誌、隱私仍依來源完整實作 |
| CISA Secure by Design | 安全預設、最小權限、可觀察性 | `SEC-REQ-001～009` | 不得把管理者可開關功能改成未實作 |
| SLSA／OpenSSF OSPS Baseline | 來源、Build、依賴、Artifact 與 Provenance | Review／Scan／Release Assurance | 不得取代 Commit／Stage 版本規則 |
| Linux Kernel Development Process | 小型可審查變更、自我檢查、責任鏈 | 通用開發行為 GDB、Code Review | 只移植行為精神，不要求 Linux |
| Google Engineering Practices | Small CL、Code Health、What／Why | Code Review、Builder 規則 | 不得以 Code Health 偏好刪除必備功能 |
| Microsoft SDL／Engineering Guidance | 全生命週期安全、Analyzer-as-policy、可靠實作 | 通用實作品質 GIQ、Security Review | 只移植行為精神，不要求 C#／.NET |
| NASA Peer Review／Inspection | 需求、設計、程式、測試與證據的正式審查 | Requirement Conformance、Formal Inspection | 不得由同一 Builder 自我核准 |
| OpenAPI Specification | API 契約與互動文件 | `ARCH-REQ-009` | 管理者可操作 API 頁面不可被只讀文件取代 |
| OAuth／OIDC 安全規範 | Token、Redirect、PKCE、Provider 安全 | `SEC-REQ-005` | Token 主要鑑權、OAuth 第二選項與前五 Provider 支援仍保留 |
| WHATWG EventSource／SSE | SSE 傳輸、Reconnect、Event ID | `MGMT-REQ-001` | 不得把「所有功能或方法六狀態可訂閱」縮成只有長任務 |
| WCAG 2.2 | AA 驗收、Keyboard、Focus、Contrast | `UI-REQ-001～017` | 預設 AA、RWD、字型、對比與指定 UI 行為仍保留 |
| Semantic Versioning | 可作額外公開相容性版本 | `DEV-REQ-001` 補充 | 不得取代每 Commit 右位 +1、PR 進 Stage 中位 +1 且右位清零 |
| MCP／Agent Security Practices | Tool Schema、最小權限、稽核、Prompt Injection 防護 | `AI-REQ-004` | SKILLS、MCP、Plugin、Connector 功能與頁面仍須建立 |
| LLM Gateway Model Catalog | 本機模型目錄的同步資料來源 | `AI-REQ-001～003` | 不得取消本機目錄、定期更新與 Provider 必要欄位 |

若外部標準與來源需求看似衝突，AI 必須輸出：來源需求、風險、補強方案、必要 Amendment Proposal；在 Requirement Owner 核准前仍以來源需求為準。
