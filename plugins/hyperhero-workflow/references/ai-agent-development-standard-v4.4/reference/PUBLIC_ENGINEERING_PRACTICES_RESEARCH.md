# 公開大型工程實務研究與導入說明

> **基線日期**：2026-08-09  
> **目的**：記錄本套規範採用哪些「公開、可驗證」的工程實務，以及如何把其精神轉為 AI Agent 可執行控制。  
> **限制**：公開指南不等於公司完整內部制度；本文件不把傳聞、面試文章或非官方部落格冒充為大廠內規。

---

## 技術中立採用原則（v4.4 修正）

本研究中的 Linux Kernel、Microsoft、Google、NASA 等名稱代表公開來源，不代表目標系統必須採用該組織的作業系統、語言或框架。規範只抽取可審查變更、工具化政策、安全生命週期、資源管理、證據與責任分離等通用行為。Linux／C#／.NET 專用剖面已退出核心規範。


## 1. 研究方法

只採下列優先來源：

1. 標準制定組織或官方規格。
2. 組織正式公開的工程指南、產品文件或安全要求。
3. 官方公開原始碼專案的 Contributor／Review 文件。
4. 無官方資料時，明確標記缺口，不以二手內容補成「內規」。

研究成果必須轉成：

- 可測試的 MUST／MUST NOT。
- Agent Role 與 Separation of Duties。
- SSDLC Entry／Exit Criteria。
- Review／Scan Routing。
- 可機器驗證的 Manifest／Digest／Gate。
- 例外、責任人、期限與補償控制。

---

## 2. Linux Kernel 公開開發流程

### 公開精神

Linux Kernel 公開文件強調：

- 新程式需遵循共同 Coding Style。
- 提交前先執行 Style／Static 工具，不能把低成本錯誤丟給 Reviewer。
- Patch 應為可理解、可審查的邏輯變更，Commit 說明交代原因。
- Review 是品質與安全的一部分；維護者與 Subsystem Ownership 清楚。
- Security Bug 應走受控、私密與協調揭露流程。

### 導入本規範

- Builder 在交付前跑快速 Gate，但這不算獨立證據。
- Change 必須小而自洽，無關格式化與重構拆開。
- Owner／Domain Specialist 依路徑路由。
- 將小型 Patch、自我檢查、Ownership、資源生命週期、檔案／程序安全抽象為通用 GDB／GIQ；不建立 Linux 採用要求。
- 弱點不得由 Agent 自動公開；交由 PSIRT／Security Owner。

### 不機械套用的部分

Kernel C 的 Tab、Brace、Mailing-list Patch 格式不應強制套到 C#、Rust、Python、TypeScript 或一般 User-space 專案。採用的是可讀性、工具先行、Ownership、小變更與公開 Review 的精神。

---

## 3. Google 公開 Engineering Practices

### 公開精神

Google 公開 Code Review 指南提出：

- Approval 標準是變更明確改善整體 Code Health，而非追求抽象完美。
- Review 先看整體設計，再看功能、複雜度、測試、命名、註解、文件與每一行。
- 小型 CL 較快且能被更徹底審查。
- CL Description 應回答「改了什麼」及「為什麼」。
- Reviewer 應考慮邊界、併發與使用者觀點。

### 導入本規範

- `REV-*` 將 Code Health、設計、邊界、併發、測試與文件列為必要面向。
- `ENG-*`／`TSK-*` 設 Diff Budget 與最小邏輯變更。
- Task／PR／Manifest 必須記錄 What／Why、非目標、風險與驗證。
- Reviewer 不因「不完美」阻擋，但任何安全不變條件、重大正確性或維護債退化仍阻擋。
- 大到無法完整理解的 AI Diff 必須拆分，不以 AI 生成速度提高 Reviewer 負荷。

---

## 4. Microsoft 公開工程與 SDL 指南（行為來源）

### 公開精神

Microsoft 公開 SDL／Assurance 與工程指南強調：

- Security 整合到 DevOps／Development Lifecycle。
- Release Branch 前由非原作者的獨立 Reviewer 進行手動 Review。
- Reviewer 檢查 SDL／Design、Functional／Security Test、Documentation、Configuration、Dependencies 與副作用。
- 可將 Formatter、Linter、Analyzer 與 Policy-as-code 納入 Repository 與 CI，讓規則不依賴個人 IDE。
- Rule／Severity 應版本化配置，且不得由 Builder 為了通過 Gate 而任意降低。

### 導入本規範

- Builder、Reviewer、Scanner、Release Assurance 明確分離。
- 將 Analyzer-as-policy、型別與契約、非同步、資源生命週期、輸入、Migration、依賴與可重現 Build 抽象為通用 GDB／GIQ；不建立任何語言或平台採用要求。
- Review 不只看 Source，也看 Config、Dependency、Test、Docs、Migration、Artifact。
- Analyzer／Scanner Config 是 Protected Policy；Builder 不得為了通過而降低 Severity。
- 安全邊界由專業 Security Reviewer 驗證，工具結果不能取代業務邏輯 Review。

---

## 5. NASA 公開高保證軟體要求

### 公開精神

NASA 公開 Software Engineering／Assurance 要求把 Peer Review／Inspection 擴展到：

- Requirements。
- Plans，包含 Cybersecurity。
- 指定 Design Items。
- Code。
- Test Procedures。

並要求使用 Checklist／Formal Reading、Readiness／Completion Criteria、指定參與者、Finding 追蹤與量測。另要求確認 Static Analysis／Security Scan 與 Release Evidence。

### 導入本規範

- SSDLC S2、S3、S8、S9 對需求、威脅、設計、程式與測試分階段審查。
- 高保證變更採 Formal Inspection 角色與客觀退出條件。
- Review Manifest 保存參與者、範圍、Finding、處置、Revision 與限制。
- S7／S10 要求 Scanner Raw Result、SBOM、Provenance、Artifact Digest。
- 缺少證據只能 `blocked`／`partial`，不能由模型信心補足。

---

## 6. SpaceX／XSpace 來源限制

截至基線日期，研究未找到足以由 SpaceX 官方驗證、可作為正式依據的完整內部 Coding／Review Standard。SpaceX 公開職缺／實習資料只能證明工程活動涉及設計、開發與測試，不能推導其內部 Review、SSDLC 或 Coding 規則。

因此：

- 本規範不聲稱採用 SpaceX 私有內規。
- 航太高保證採 NASA 公開可查證要求。
- 若「XSpace」指另一個組織，必須提供正確名稱或官方來源，再建立專屬 Crosswalk。
- 未來取得可驗證官方資料時，以版本化 Change Proposal 更新，不直接覆寫既有控制。

---

## 7. GitHub 公開機制：實作範例而非唯一平台

GitHub 公開功能可用來實作：

- CODEOWNERS 與 Required Review。
- Protected Branch／Ruleset。
- Code／Secret／Dependency Scanning。
- Dependency Review。
- Merge Protection 與 Required Status Checks。

本規範保持平台中立；GitLab、Azure DevOps、Bitbucket 或自建平台必須提供等價控制：

- 不能直接 Push Protected Branch。
- Review／Scan／Gate 綁定精確 Revision。
- Policy／Workflow／Owner 變更受保護。
- Finding、例外與 Approval 可稽核。
- Artifact 可回溯到 Source／Build。

---

## 8. 從「指南」到「AI Agent 控制」的轉換

| 公開工程精神 | AI Agent 風險 | 本規範的控制 |
|---|---|---|
| 小型自洽變更 | AI 一次產生巨量 Diff | Diff Budget、S4 Slicing、超限拆分 |
| 提交前工具檢查 | Builder 自跑後自稱安全 | Builder Fast Check＋獨立 Scan Agent |
| 獨立 Code Review | 同一 Session 角色扮演 | Clean Revision、Read-only、Session／Identity 分離 |
| Owner／專家審查 | 通用模型不懂領域細節 | Diff-based Specialist Routing |
| What／Why 說明 | AI 摘要與實際 Diff 脫節 | Task Contract／Change Manifest／Digest |
| Requirements／Design／Code／Test Inspection | AI 只在最後掃 Code | S0–S14 SSDLC 與分階段退出條件 |
| Analyzer／Policy as Code | AI 修改規則使 CI 變綠 | Protected Scanner／Policy Config、R3 變更 |
| 安全通報 | Agent 公開零日細節 | PSIRT Routing、Private Disclosure、Egress Deny |
| 可追溯 Artifact | Source 通過但 Binary 被替換 | SBOM、Provenance、Signature／Digest Verification |

---

## 9. 官方來源索引

### Linux Kernel 公開開發流程（行為來源）

- Linux Kernel Documentation — Development Process、Submitting Patches、Patch Checklist、Coding Style、Security Bugs。
- 採用範圍限於小型可審查變更、自我檢查、Ownership、責任鏈與安全通報精神；不導入 Linux 平台要求。

### Google

- Google Engineering Practices — Code Review Standard、What to Look For、Small CLs、CL Descriptions。

### Microsoft

- Microsoft Security Development Lifecycle。
- Microsoft Security Development and Operations Overview。
- Microsoft 公開 Code Review、Engineering、Analyzer／Policy-as-code 與 Security Rules 指南；只擷取通用行為。

### NASA

- NASA Software Engineering Handbook — SWE-087／088／089。
- NASA-STD-8739.8B — Software Assurance and Software Safety Standard。

### Secure Development／Supply Chain

- NIST SP 800-218 v1.1 Final、SP 800-218A Final。
- OWASP SAMM 2.0、ASVS 5.0.0、WSTG 4.2 Stable。
- CISA Secure by Design。
- SLSA 1.2。
- OpenSSF OSPS Baseline 2026-02-19。
