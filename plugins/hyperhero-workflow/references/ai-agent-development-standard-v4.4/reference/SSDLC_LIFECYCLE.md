# 完整安全軟體開發生命週期（SSDLC）執行指南

> **版本**：4.4.0  
> **適用者**：Orchestrator、Requirements、Architecture／Threat、Builder、Review、Scan、Release、Operations 與 PSIRT Agents。  
> **原則**：產品成熟度使用 L0–L6；單次安全開發活動使用 S0–S14。敏捷、Scrum、Kanban、瀑布或 Continuous Delivery 可以改變節奏，但不能刪除目前產品階段與任務風險所觸發的安全活動、證據與責任。

## 1. 生命週期總覽

```text
S0 治理與準備
  ↓
S1 Intake／分類
  ↓
S2 安全與品質需求
  ↓
S3 架構／Threat Model
  ↓
S4 變更計畫／切片
  ↓
S5 Source／環境／Pipeline 保護
  ↓
S6 安全實作
  ↓
S7 持續自動驗證
  ↓
S8 獨立 Review
  ↓
S9 深度系統驗證
  ↓
S10 Release Assurance
  ↓
S11 受控部署
  ↓
S12 營運／持續監測
  ↓
S13 弱點／事件回應
  ↓
S14 退役／持續改善
       └──────────────► 回饋至 S0–S5
```

### 1.1 產品成熟度 L0–L6

S0–S14 是「工作活動」，不是產品成熟度。每個 Repository 必須另外宣告：

| 階段 | 產品狀態 | 主要關注 |
|---|---|---|
| **L0 MVP** | 概念與技術假設驗證 | 最小安全架構、Synthetic Data、快速 Gate、不可直接 Production。 |
| **L1 正式專案** | 正式建置 | Requirement、Architecture、Threat、CI、Contract、Migration、Review。 |
| **L2 內部測試** | Release Candidate 驗證 | Feature Freeze、Integration／E2E、Security Negative、DAST／Fuzz、Recovery。 |
| **L3 試營運** | 有限正式流量 | Release Assurance、Canary、Monitoring、Support、Incident、Rollback。 |
| **L4 正式上市** | 一般正式服務 | Full Release Gate、SLO／SLA、Capacity、DR、Compliance、Supply Chain。 |
| **L5 維護** | 持續營運 | Patch、CVE、Regression、Compatibility、Drift、Incident、Technical Debt。 |
| **L6 退役** | 終止或移轉 | Data Disposition、Credential／Domain／Job／Integration Revocation。 |

### 1.2 Stage-aware SSDLC 套用方式

每次任務需要同時記錄：

```yaml
product_lifecycle_stage: L1-FORMAL-PROJECT
current_ssdlc_activity: S6
risk_level: R2
activated_profiles: [dotnet, api, data]
```

Required Gates 為以下集合的聯集，衝突時採較嚴格者：

```text
Always-on Core
+ Current L0–L6 Stage Profile
+ Current S0–S14 Activity
+ R0–R3 Risk
+ Diff/Data-triggered Domain Profiles
+ Change Class (normal/security/hotfix/retirement)
```

Builder 只載入 Core、目前 Lifecycle Profile、Task Contract 與相關 Domain Profile；Review、Scan、Release 詳細條款由專業代理讀取。完整對照見 `reference/PRODUCT_LIFECYCLE_PROFILES.md`。

## 2. 與外部模型的關聯

| 本規範 | NIST SSDF | OWASP SAMM | 主要目的 |
|---|---|---|---|
| S0–S4 | PO／PW | Governance／Design | 準備組織、建立安全需求與設計。 |
| S5 | PS | Governance／Implementation | 保護 Source、工具、環境與 Pipeline。 |
| S6–S9 | PW | Implementation／Verification | 產生與驗證安全軟體。 |
| S10–S12 | PS／PW | Verification／Operations | 可信發布、部署及持續營運。 |
| S13–S14 | RV | Operations／Governance | 弱點回應、退役、RCA 與持續改善。 |

## 3. S0 治理與準備

### Entry

- 組織準備允許 AI Agent 參與開發。
- 已指定 Policy Owner、Security Owner、Platform Owner 與產品責任人。

### 必要活動

- 建立 AI Agent 角色與 Capability Catalog。
- 建立 Approved Tool／Scanner／Model Registry。
- 建立資料分類、Secret、Credential、Network Egress 與 Log 政策。
- 保護 Policy、CI、CODEOWNERS、Scanner Config、Schema 與 Release Pipeline。
- 建立 Security Training、Threat Modeling、Secure Coding、Review 與 Incident Response 能力。
- 定義 R0–R3、Exception、Risk Acceptance、Kill Switch 與 Evidence Retention。
- 建立 Source／Build／Artifact Provenance 策略。
- 建立 Vendor／Open Source／Model／MCP／Plugin 供應鏈審查。

### 必要證據

- Policy Version／Digest。
- Role／Capability Matrix。
- Approved Tool Registry 與版本。
- Access Review。
- Protected Branch／CODEOWNERS 設定證據。
- Kill／Revoke Exercise。
- Training／Qualification Record。

### Exit

- Builder 無法自行繞過 Review、Scan、Policy 與 Release。
- Reviewer／Scanner 可在乾淨唯讀環境工作。
- Agent 無 Production Secret 與未受控網路。
- 所有政策變更有 R3 流程。

## 4. S1 Intake 與分類

### 必要活動

- 固定 Goal、Non-goals、Owner、使用者與業務影響。
- 分類資料：Public／Internal／Confidential／Restricted。
- 判斷 Availability、Safety、Financial、Medical、Privacy、Regulatory 與 Tenant Impact。
- 選擇 R0–R3。
- 建立 Applicability Profile：Web、API、AI、Agent、Frontend、Data、Multi-tenant、High Assurance；通用開發行為與實作品質不需條件啟用。
- 列出第三方、Open Source、Model、Service、Data Source 與部署環境。
- 確認 EOL、支援期限與預期營運責任。

### Exit

- 目標可驗收，責任人明確。
- 高影響領域與資料流不再未知。
- 適用的 Profile、Reviewer 與 Scanner 可被路由。

## 5. S2 安全與品質需求

### 必要活動

- 產生 Functional／Non-functional／Security／Privacy／AI Safety Requirements。
- 建立正常、失敗、未授權、重複、併發、逾時、取消、復原與資源耗盡驗收。
- 建立 Abuse／Misuse Cases。
- 將 ASVS／Security Invariants／Legal／Contract Requirement 對映至 Acceptance Criteria。
- 明確定義 AuthN、AuthZ、Tenant、Data Retention、Audit、Availability、Backup、Restore 與 Incident Requirements。
- 定義 AI／Agent 的模型、資料、工具、記憶、成本、人工介入與降級模式。
- 定義供應鏈、License、SBOM、Provenance、Signature 與 Vulnerability SLA。

### Requirement Quality Gate

每一需求必須：

- 唯一識別。
- 無模糊主詞與動詞。
- 可驗證。
- 有 Owner。
- 有 Criticality。
- 有正常與負面驗收。
- 有來源與版本。
- 能追溯至設計、程式、測試與證據。

### Exit

- 高影響需求未留 `TBD`。
- 需求不互相衝突。
- 每個 Critical／High Security Requirement 有預計驗證方法。

## 6. S3 架構與威脅建模

### 必要活動

- 建立 System Context、Component、Data Flow、Trust Boundary、Identity、Secret、External Dependency。
- 資產與攻擊者分類。
- 列舉 Entry Point、Privilege Boundary、Data Store、Queue、Cache、Admin／Support Path。
- 以 STRIDE、Attack Tree、Abuse Case、MITRE ATT&CK／ATLAS 或適用方法分析。
- 評估 AuthN／AuthZ、Tenant、Injection、SSRF、Supply Chain、RCE、Data Exfiltration、Race、DoS、Prompt Injection、Tool Misuse。
- 設計 Prevent／Detect／Respond／Recover。
- 定義 Fail-safe／Fail-closed、Degraded Mode、Circuit、Quota、Kill Switch。
- 建立 ADR：選項、理由、風險、替代方案、Migration、Rollback。
- 建立 Security Design Review Finding。

### Exit

- Critical／High Threat 有控制、測試、Owner 與殘餘風險。
- 設計不依賴「Agent 會小心」或「使用者不會這樣做」。
- 不把 Proxy、UI、Prompt 或 Scanner 當成唯一安全邊界。

## 7. S4 變更計畫與切片

### 必要活動

- 建立 Impact Graph：Caller、Callee、API、Schema、Event、Job、Cache、Permission、Telemetry、Deploy。
- 將變更拆成單一邏輯目的、可建置、可測試、可回復的 Candidate Patches。
- 分離行為變更、重構、格式、依賴、Migration、政策與 Generated Diff。
- 定義 Feature Flag、Owner、Expiry、Kill、Cleanup。
- 定義 Expand／Migrate／Contract 或其他相容部署策略。
- 定義 Review Routing 與 Scan Routing。
- 定義 Diff、Token、Tool、Command、Retry 與 Time Budget。
- 定義 Stop Conditions。

### Exit

- 每個 Slice 可單獨驗證。
- Review 能完整理解。
- 沒有隱藏 R3。
- Rollback／Roll-forward 可執行。

## 8. S5 開發環境、Source 與 Pipeline 保護

### 必要活動

- SSO／MFA、最小權限、短效 Credential。
- Protected Branch、Required Status Checks、CODEOWNERS、Stale Approval。
- 禁止 Direct Push、Force Push、任意 Tag Mutation。
- Repository／CI／Artifact Registry 的 Audit。
- Pin Toolchain、Action／Plugin／Container Digest。
- 隔離 Untrusted PR Build；避免讓外部 PR 取得 Secret。
- Build Runner Ephemeral／Isolated。
- Scanner／Policy Config Protected。
- Dependency Registry Allowlist、Lockfile、Signature／Provenance（可用時）。
- Backup、Restore 與 Source Expunging／Legal Removal 流程。

### Exit

- Source Revision 有可靠 Change History。
- Build 不依賴 Agent Workstation。
- Agent 無法存取 Release Signing Key。
- Control Continuity 可證明。

## 9. S6 安全實作

### Builder Checklist

- 符合既有架構、Naming、Error、Logging、Test 與 Ownership。
- 所有輸入具型別、長度、數量、深度與語意限制。
- 所有授權在 Server／Authority 執行。
- Query／Command／Template 不拼接不可信字串。
- Secret 不進 Repo、Prompt、Log、Client、Test 或 Manifest。
- 外部呼叫有 Timeout、Cancellation、大小上限、有限 Retry。
- Side Effect 有 Idempotency、Transaction、Partial Failure 與 Compensation。
- 資源有 Ownership／Dispose／Cleanup。
- Concurrent State 有一致性與 Race Test。
- 錯誤對外 Sanitized、對內可追蹤。
- Telemetry 與 Audit 不含不必要 PII。
- 文件、Migration、Runbook、Feature Flag 同步。

### Exit

- Candidate Patch 僅修改 Allowed Scope。
- Self-review 完成。
- 快速 Gate 通過。
- 無一次性 Production Code。

## 10. S7 持續自動驗證

### 必要 Gate

- Policy／Scope／Protected File。
- Format／Lint／Type／Build。
- Unit／Component。
- Secret。
- SAST。
- SCA／License／Dependency Diff。
- Platform Profile Scan。
- Security Invariant Diff。
- Change／Scan Manifest Schema。

### 原則

- 工具錯誤不是零 Finding。
- Exit 0 不是自動通過。
- Scanner Config 不由 Builder 修改。
- 原始報告與標準化 Manifest 都保存。
- Finding 綁定 Candidate Revision。

### Exit

- 無 Blocking Finding。
- Tool／Version／Ruleset／Config／Scope／Digest 完整。
- 無未揭露 Exclusion／Suppression。

## 11. S8 獨立程式碼與安全審查

### 必要審查

- General Code Review。
- Diff 觸發的 Domain Review。
- Security Review（R2 敏感與所有 R3）。
- Test Review。
- R3／High Assurance Formal Inspection。

### Review Work Products

不只程式碼，也包括：

- Requirements。
- Plans。
- Architecture／Threat Model。
- Tests／Test Procedures。
- Configuration。
- Dependency／Lockfile。
- Migration。
- Deployment／Rollback。
- Documentation／Runbook。

### Exit

- Approval 綁定最終 Revision。
- 無 Open Blocker／Major。
- Finding 有 Resolution Evidence。
- Reviewer Scope 與 Limitations 明確。
- 角色分離有效。

## 12. S9 深度系統驗證

依風險選擇：

- Integration／Contract／Consumer。
- E2E。
- AuthN／AuthZ／Tenant Negative。
- DAST／API。
- Fuzz／Property。
- Race／Concurrency／Load。
- Performance／Resource Exhaustion。
- Fault Injection／Chaos。
- Backup／Restore。
- Migration／Rollback／Roll-forward。
- Accessibility／Localization。
- AI Prompt Injection／Tool Misuse／Output Handling／Cost Bound。

### Exit

- 高風險情境通過。
- Failure／Recovery 行為具證據。
- 未執行項目有合理 N/A 或正式例外。

## 13. S10 Release Assurance

### 必要活動

- 確認 Final Source Revision。
- Review／Scan Manifest Revision 一致。
- Build 由核准平台產生。
- 生成並驗證 SBOM。
- 生成 Build／Source Provenance。
- Artifact Digest／Signature。
- License／EOL／CVE。
- Release Notes／Breaking Change／Upgrade。
- Migration／Feature Flag／Rollout／Rollback。
- Waiver Validity。
- Go／No-Go。

### Exit

- Artifact 可追溯至核准 Source 與 Build。
- 無未核准例外。
- Rollback 可用。
- Release Assurance Agent 無部署或簽章私鑰。

## 14. S11 受控部署

### 必要活動

- 只能部署不可變核准 Artifact。
- 宣告式 Config／IaC。
- Production 每個具體 Action 為 R3。
- Canary／Blue-Green／Progressive Delivery。
- Health／Security／Business Metric Gate。
- Config／Secret／IAM Diff。
- Database Migration Sequence。
- Rollback／Roll-forward Trigger。
- Deployment Audit。

### Exit

- 健康與安全 Gate 通過。
- 沒有未核准 Drift。
- Rollback Ready。
- Observer 可 Pause／Kill。

## 15. S12 營運與持續監測

### 必要活動

- SLO／Error Budget。
- Log／Metric／Trace／Audit。
- Security Alert／Anomaly。
- Dependency／Image／Runtime CVE。
- Certificate／Secret Expiry。
- Configuration Drift。
- Backup／Restore Drill。
- Capacity／Cost／Quota。
- Kill Switch／Degraded Mode Exercise。
- Patch／Upgrade／EOL Queue。

### Exit（持續狀態）

- Owner、On-call、Severity、SLA 明確。
- 可偵測、診斷、控制與回復。
- Runtime Evidence 回流需求與 Threat Model。

## 16. S13 弱點與事件回應

### 必要活動

- 私密 Intake 與 Identity／Data Protection。
- Severity、Exploitability、Affected Versions。
- Containment／Credential Rotation。
- Fix／Regression Test／Backport。
- Independent Security Review／Scan。
- Advisory／CVE／Customer Communication。
- Coordinated Disclosure。
- Timeline／RCA。
- Prevent Recurrence：Invariant、Rule、Test、Training、Architecture。

### Exit

- 風險受控。
- 修正於實際 Artifact 驗證。
- 所有受影響版本有處置。
- 法令與契約通知完成。
- Lessons Learned 進入 S0–S5。

## 17. S14 退役與持續改善

### 必要活動

- EOL／EOS Communication。
- Data Export／Retention／Deletion。
- Service Account、Token、Key、Certificate、Webhook、OAuth Client 撤銷。
- DNS、Domain、Queue、Cron、Job、Monitoring、Alert 移除。
- Dependency／Package／Container Yank／Archive 策略。
- Artifact／Audit／Evidence Retention。
- Customer Migration。
- Threat／Incident／Cost／Quality Metrics Review。

### Exit

- 無孤兒 Credential、資料、Job、Endpoint 或責任。
- 退役不造成下游供應鏈不可預期破壞。
- 改善項目有 Owner 與追蹤。

## 18. 最低追溯模型

```text
Product Lifecycle Stage／Profile Digest
  ↕
Requirement
  ↕
Threat／Abuse Case
  ↕
Security Invariant
  ↕
ADR／Design Control
  ↕
Code／Configuration
  ↕
Test
  ↕
Review Finding
  ↕
Scan Finding
  ↕
Release Artifact／Provenance
  ↕
Runtime Signal／Incident
```

任何一個 Critical Requirement 若無法沿此鏈追溯，不得宣稱已完成 SSDLC。

---

## 19. v4.4 強制需求在 S0–S14 的必要產物

| SSDLC | 必要產物 |
|---|---|
| S0 | 不可變需求基線、Requirement Owner、Digest、Protected Files、Policy／Schema／Validator |
| S1 | `.ai/system-requirements.yaml`、直接／間接 Requirement IDs、Stage／Risk／Scope |
| S2 | 來源原文、來源明示條件、功能／安全／隱私／效能／無障礙／營運驗收 |
| S3 | Requirement Data Flow／Trust Boundary；Tenant、Event、IPC、Plugin、File、AI、Browser 威脅 |
| S4 | Requirement IDs、Domain Profiles、Review／Scan Routing、Test、Migration、Rollback |
| S5 | Baseline／Policy／State 保護、Toolchain／Lockfile、Clean Build／Verifier |
| S6 | Requirement-specific Candidate Patch、文件、測試、Telemetry、Migration／Rollback |
| S7 | Requirement State Schema、Type／Lint／Build、Unit／Integration、SAST／SCA／Secret |
| S8 | Requirement Conformance、General／Security／Frontend／Accessibility／Domain Review |
| S9 | E2E、Negative、Browser、AA、Stress、Benchmark、Concurrency、White／Gray／Shallow-black／Black、Restore |
| S10 | Requirement Coverage 100%、Artifact／Evidence／Baseline／Final Revision 一致 |
| S11 | 完整功能 Inventory、Runtime 管理開關、Canary、Rollback、R3 Approval |
| S12 | Requirement Health／Drift、Resource／State Dashboard、RUM／CSP／Error、CVE／Model Drift |
| S13 | 受影響 Requirement IDs、Containment、Patch、Regression、Conformance、RCA |
| S14 | Requirement `retired`、Data／Credential／Key／Job／Plugin／Frontend Asset 處置與證據保存 |

## 20. Frontend 不得只在 S9 才處理

Frontend 工程控制分散於整個 SSDLC：

- S2 定義 RWD、Accessibility、Browser、Performance、Security 與 i18n Requirement。
- S3 分析 Browser／Server Trust Boundary、Token／Cookie、DOM XSS、Third-party Script、Storage 與 Service Worker。
- S4 決定 Component／State／API Client 邊界與 E2E Slice。
- S6 依 `FRONTEND_DEVELOPMENT_PROFILE.md` 與通用開發行為／實作品質 Profile 實作。
- S7 執行 Type、Lint、SAST、SCA、Component、Basic Accessibility。
- S8 由 Frontend Engineering、Frontend Security、Accessibility／i18n 代理獨立審查。
- S9 才進行完整 Browser／E2E／Manual Accessibility／Performance／Visual／Failure 驗證。

不得把 Accessibility、DOM XSS、State Ownership 或 RWD 全部延後到測試階段才補救。


## v4.4 Requirement Integrity Gate

本流程不得使用生命週期、Reviewer 或 Scanner 將產品負責人必備需求降級；每個 Candidate Revision 必須通過獨立 Requirement Conformance。
