# 專業程式與資安掃描標準

> **版本**：4.4.0  
> **核心原則**：掃描由受限制的專業代理呼叫確定性工具執行；AI 只可解讀與關聯，不得把模型判斷冒充掃描證據。

## 1. 掃描治理

每個 Scanner 必須註冊：

- Tool／Vendor／Project。
- Version。
- Binary／Container Digest。
- Ruleset／Config Digest。
- Supported Languages／Frameworks。
- Scan Mode。
- Data Handling／SaaS Upload。
- License。
- Timeout／Resource。
- Output Format。
- Known Limitations。
- Owner／Update Process。
- Validation Dataset。

禁止：

- 任務中臨時下載未知 Scanner。
- Builder 修改 Scanner Config 或 Baseline。
- 將 Source／Secret／Customer Data 上傳未核准 SaaS。
- 只用 LLM 讀程式後宣稱完成 SAST。
- 把 Exit 0 當成 Passed。
- 把 Tool Crash／OOM／Timeout 當成零 Finding。

## 2. 掃描階段矩陣

Scanner Agent 必須從受保護的 Product Lifecycle Stage、Risk、Diff、資料分類與 Change Class 計算掃描集合。Builder 只取得快速回饋與 Finding，不載入所有 Scanner 規則，也不得自行決定減少掃描。

### 2.1 依產品生命週期的最低掃描集合

| Product Stage | 最低集合 | 加強／限制 |
|---|---|---|
| `L0-MVP` | Secret Diff、Format／Lint／Type／Build、Affected Test、快速 SAST、SCA、License／Source。 | Auth、Data、File、Parser、Shell、AI Tool、公開 Endpoint 等風險觸發 DAST／Fuzz／Domain Scan；禁止用 MVP 略過真實 Secret 或 Critical／High。 |
| `L1-FORMAL-PROJECT` | 每 PR Secret、SAST、SCA、License、Dependency Diff、Unit／Integration，以及適用的 API、Migration、IaC、Container、Platform Analyzer。 | 建立正式 Baseline，但 Builder 不得新增 Suppression 或降低 Severity。 |
| `L2-INTERNAL-TEST` | 完整 Repository／Artifact SAST、SCA、Secret、DAST、API、Fuzz、Migration、Concurrency／Resource、IaC／Container、SBOM／Provenance。 | 綁定固定 RC；Scanner Error、Timeout、Coverage 缺口均阻擋退出。 |
| `L3-PILOT` | Final RC 與實際 Artifact 重掃、SBOM／Provenance／Signature、Config／IAM／Secret Diff、Pilot Target 驗證。 | Production DAST 預設禁止破壞性測試；需 Target Allowlist、Rate、Window、Kill 與 R3。 |
| `L4-GENERAL-AVAILABILITY` | 完整 Release Scan、Artifact／Image／Package、Known Exploited、License、Supply-chain、Production Config 與部署後 Runtime Check。 | 所有結果與批准的 Source／Artifact Digest 一致，最後修改一律重掃。 |
| `L5-MAINTENANCE` | 依 Change Class 重跑適用 PR／Release Scan，另持續 CVE、Image、OS、Certificate、Secret Expiry、Config／IAM Drift。 | Security Patch／Hotfix 可並行加速但不得略過核心掃描；事後限期補完整深掃。 |
| `L6-RETIREMENT` | 退役 Script、Shell／IaC、Secret、SAST、SCA、Data Export／Delete、Asset／Credential／Endpoint Inventory。 | 強調 Dry-run、Idempotency、Partial Failure、Audit 與撤銷驗證，不以「不再上線」為由停止掃描。 |

### 2.2 Pre-commit／Local Candidate

| 掃描 | 目的 | 失敗處理 |
|---|---|---|
| Secret Diff | 防止 Secret 進入 Commit。 | 阻擋；撤銷／輪替已洩漏 Credential。 |
| Formatter | 消除人工風格爭議。 | 修正格式，不得手動爭論。 |
| Lint／Analyzer | 低成本品質／安全問題。 | 新 Warning 阻擋。 |
| Type／Compile | 型別與建置。 | 阻擋。 |
| Affected Unit | 快速回歸。 | 阻擋。 |

Local Builder 執行可作為快速回饋，但 R2／R3 不計入獨立驗證。

### 2.3 Pull Request

最低：

- Policy／Scope／Protected Files。
- Secret。
- SAST。
- SCA／Dependency Diff。
- License。
- Unit／Integration。
- Activated Platform Profile。
- Security Invariant Diff。
- Review／Scan Schema。

依風險：

- IaC／Container／Kubernetes。
- API／Contract。
- Migration。
- DAST。
- Fuzz／Property。
- Concurrency／Race。
- Performance／Resource。
- AI Prompt／Tool。
- Accessibility／i18n。

### 2.4 Scheduled

- Full Repository SAST。
- Full History Secret。
- Full SCA／EOL／License。
- Base Image／OS Package。
- Deep Fuzz。
- DAST Test Environment。
- Scanner Ruleset Regression。
- Unused／Orphan Dependency。
- Certificate／Secret Expiry。
- Config Drift。

### 2.5 Release

- 對 Final Revision 重新驗證。
- 對實際 Artifact 掃描。
- SBOM。
- Build／Source Provenance。
- Signature／Digest。
- License。
- Malware／Unexpected Binary（適用）。
- Container／Package Content。
- Release Configuration。
- Known Exploited／Critical Vulnerability Policy。

### 2.6 Post-release

- CVE／Advisory Feed。
- Dependency／Image／OS Package。
- Runtime Signal。
- Config／IAM Drift。
- Certificate／Secret。
- New Scanner Rules。
- Customer／Researcher Report。

## 3. Secret Detection

### 必須掃描

- Working Tree。
- Staged Diff。
- Candidate Commit。
- Git History（新專案、Incident、Scheduled、Release Policy 適用時）。
- Build Log。
- Test Fixture。
- Container Layer。
- Package／Artifact。
- Frontend Bundle。
- Source Map。
- AI Prompt／Manifest Redaction。

### 命中處理

1. 不在報告顯示完整 Secret。
2. 判斷是否真實 Credential。
3. 若可能有效，立即撤銷／輪替。
4. 從 Candidate Patch 移除。
5. 若已進 History，啟動 Incident／Expunging 評估。
6. 追查 Log、Artifact、Fork、Cache 與下游。
7. 加入 Regression Rule。

Secret Finding 永遠不是單純「刪掉字串就好」。

## 4. SAST

### 最低能力

- Language／Framework aware。
- Data Flow／Taint（可用時）。
- Interprocedural（可用時）。
- Security Rule。
- Source／Sink／Sanitizer。
- Suppression／Baseline Visibility。
- SARIF／Structured Output。

### 必查類別

- Injection。
- XSS／Output。
- Path／File。
- SSRF。
- Deserialization。
- Crypto。
- Secret。
- Auth／AuthZ Pattern。
- Resource／DoS。
- Unsafe／Native。
- Command／Process。
- Logging／Sensitive Data。

### 限制

- SAST 對 Business Logic、Tenant Ownership、Workflow State、Misconfiguration 與 Runtime Context 不完整。
- Regex-only Scanner 不能代表完整 SAST。
- 無語言覆蓋必須標示未掃區域。

## 5. SCA、Dependency、License、SBOM

### 必查

- Direct／Transitive。
- Lockfile。
- Package Source／Registry。
- Package Name Confusion／Typosquat。
- Integrity Hash／Signature（可用）。
- Known Vulnerability。
- Exploitability／Reachability（輔助，不得自動降級）。
- EOL／Maintenance。
- License／Notice。
- Dependency Added／Removed／Updated。
- Container OS Package。
- GitHub Action／Plugin／MCP／Model Artifact。

### Gate

- 新 Critical／High 預設阻擋。
- Known Exploited／Active Exploit 優先阻擋。
- Invalid／Forbidden License 阻擋。
- 無 Lock／不可重現版本至少 R2。
- 例外需 Owner、Expiry、Upgrade／Removal Plan。

### SBOM

- 使用 CycloneDX／SPDX 或組織核准格式。
- 對應實際 Release Artifact。
- 包含 Version／Supplier／Hash／License／Relationship。
- 具 Digest／Signature 或與 Provenance 關聯。
- 不把 SBOM 當成已完成弱點分析。

## 6. IaC、Container、Kubernetes、CI

### IaC

- Public Exposure。
- IAM Wildcard／Privilege Escalation。
- Encryption。
- Logging。
- Backup。
- Secret。
- Network。
- Metadata／SSRF。
- State Security。
- Drift。

### Container

- Root。
- Privileged。
- Capability。
- Readonly FS。
- Base Image。
- OS Package。
- Secret Layer。
- Health。
- Resource。
- 執行環境適用的 Sandbox／Mandatory Access Control。
- Unexpected Binary。

### Kubernetes

- Security Context。
- HostPath／HostNetwork／PID。
- Service Account。
- RBAC。
- Network Policy。
- Secret。
- Image Tag／Digest。
- Admission／Policy。
- Resource Limit。
- Probe。
- Pod／Node Boundary。

### CI Workflow

- Untrusted PR＋Secret。
- Mutable Action Tag。
- Script Injection。
- Excessive Token Permission。
- Artifact Poisoning。
- Cache Poisoning。
- Self-hosted Runner。
- Release Credential。
- OIDC Audience。
- Log Secret。

## 7. DAST／API Security Testing

### 前置

- 明確 Target Allowlist。
- 測試／Staging Environment。
- Dedicated Account／Tenant。
- Rate／Time／Request Limit。
- Data Cleanup。
- Test Window。
- Contact／Kill。
- Destructive Test 禁止或 R3。

### 必查

- Authentication。
- Session。
- Authorization／IDOR。
- Input／Injection。
- File。
- SSRF。
- CORS／Headers。
- Rate／Brute Force。
- Error／Information Leakage。
- API Schema／Mass Assignment。
- Business State／Replay。
- Tenant Isolation。

### 限制

- DAST 不知道所有程式路徑。
- Production Configuration 差異仍需 Config Review。
- Scanner 產生的 PoC 不得公開或傳送未核准服務。

## 8. Fuzz／Property／Robustness

### 適用

- Parser。
- Serializer。
- File／Image／Archive。
- Network Protocol。
- Regex／Query。
- Crypto Boundary。
- Native／Unsafe。
- API Validation。
- State Machine。
- Calculation／Precision。

### 必備

- Seed／Corpus。
- Determinism（可行）。
- CPU／Memory／Time／File Limit。
- No Production／External Side Effect。
- Crash／Hang／Leak／Resource。
- Minimized Reproducer。
- Regression Test。
- Tool／Compiler／Sanitizer Version。

## 9. Performance／Resource／Concurrency

掃描與測試應覆蓋：

- CPU。
- Memory。
- FD／Socket。
- Thread／Task。
- Queue。
- Connection Pool。
- Disk／Temp。
- Log Volume。
- Network。
- Timeout。
- Lock Contention。
- Deadlock。
- Race。
- Backpressure。
- Retry Storm。
- Cache Stampede。
- Token／AI Cost。

Performance Finding 不應只看平均值；需考慮 Tail、Burst、Failure Mode 與 Tenant Fairness。

## 10. AI／Agent 安全測試

- Prompt Injection。
- Goal Hijack。
- Tool Schema Abuse。
- Excessive Agency。
- Hidden Context／Secret Leakage。
- RAG ACL／Tenant。
- Vector／Embedding Data Leakage。
- Memory Poisoning。
- Output to SQL／Shell／HTML。
- Inter-Agent Message Forgery。
- Cost／Unbounded Consumption。
- Provider Failover Policy。
- Human Approval／Kill／Degraded Mode。

LLM Judge 可輔助分類，但 Critical Gate 應搭配確定性 Assert、Policy Check 或人工／專業 Reviewer。

## 11. Finding Normalization

每個 Finding 至少包含：

- Finding ID。
- Scanner Type。
- Tool／Version／Digest。
- Rule ID。
- CWE／ASVS／Invariant（可用）。
- Severity。
- Confidence。
- Candidate Revision。
- Location。
- Source／Sink／Data Flow。
- Evidence（Redacted）。
- Exploit Preconditions。
- Affected Asset／Version。
- Status。
- Owner／SLA。
- Remediation。
- Resolution Evidence。
- Waiver。

## 12. Finding 狀態

- `open`
- `confirmed`
- `fix-in-progress`
- `fixed-awaiting-verification`
- `verified-fixed`
- `false-positive-candidate`
- `waived`
- `accepted-risk`
- `duplicate-root-cause`
- `tool-error`

只有 `verified-fixed`、有效 `waived`／`accepted-risk` 或已關聯且 Root Cause 結案的 Duplicate 可視為結案。

## 13. Severity 與阻擋

### 預設 Block

- Verified Secret。
- New Critical。
- New High。
- AuthN／AuthZ／Tenant Bypass。
- RCE。
- Data Loss／Corruption。
- Active Exploit。
- Security Control Regression。
- Invalid License。
- Required Scanner Error／Not Run。
- Policy／CI／Scanner Config 未核准變更。

### Risk-based

Medium／Low 需考慮：

- Exposure。
- Reachability。
- Privilege。
- Data。
- Tenant。
- Exploit Complexity。
- Detectability。
- Compensating Control。
- Affected Version／Customer。
- Time to Fix。

不得單靠 CVSS 或 Agent 信心決定。

## 14. False Positive／Waiver

必須包含：

- Finding／Rule。
- Exact Location／Revision。
- 技術證據。
- 為何不成立。
- Owner。
- Approver。
- Expiry。
- Revalidation Trigger。
- Compensating Control（如需要）。

禁止：

- `ignore all`
- 整個目錄排除
- 因「太多警告」調低 Severity
- 永久無到期
- Builder 自批
- 沒有證據的 AI 判定

## 15. Scanner 更新

更新前：

- 驗證來源／Digest／License。
- 以 Known-positive／False-positive Dataset 評測。
- 比較 Finding 差異。
- 評估 Ruleset Breaking Change。
- 更新 Baseline 必須經 Security Owner。
- 保留 Rollback。
- 更新 Tool Registry。

Scanner 升級造成大量新 Finding 時，不能直接全部 Baseline；需分批 Triage 並維持新程式零新增債務。

## 16. 證據保存

保存：

- Command。
- CWD／Environment Profile。
- Tool／Version／Digest。
- Ruleset／Config Digest。
- Start／End。
- Exit Code。
- Raw Output Digest。
- Scope／Exclusion。
- Candidate Revision。
- Findings。
- Waiver。
- Agent Identity。
- Data Upload Destination（若有）。
- Retention／Access。

原始結果可能含敏感資料，必須分級、遮蔽與限制存取。

---

## 17. v4.4 Mandatory Requirement Integrity Scan

所有寫入任務與 CI 必須執行：

- `SYSTEM_REQUIREMENT_STATE.schema.json` 驗證。
- 57 項 Requirement ID 是否完整、唯一並存在於 Policy／State／Traceability Matrix。
- Requirement 狀態不得使用 `deferred`、`disabled`、`not-applicable`、`optional` 或 `capability-ready`。
- `condition-not-triggered` 是否確實來自來源原文明示條件並具證據。
- Task／Change／Review／Scan／Conformance 的 Baseline Digest 與 Candidate Revision 是否一致。
- 是否有未核准的來源文字、強度、條件、名稱或驗收行為變更。
- Requirement Conformance Manifest 是否獨立、完整且無未審 Requirement IDs。

任何需求降級、來源條件被新增、未知／遺漏 Requirement、Baseline 不一致或未審項目，均預設阻擋。

## 18. Frontend 掃描與瀏覽器驗證

### 18.1 PR 最低集合

- 前端語言／框架適用的 Type／Schema Check。
- ESLint／Framework Lint。
- Frontend SAST：DOM XSS、URL、`postMessage`、Storage、Client-only AuthZ、Secret Exposure。
- SCA／Lockfile／Install Script／Bundler Plugin。
- Component Test。
- 基本 Accessibility Automation。
- Client Bundle Secret／Runtime Config 檢查。

### 18.2 L2／Release 最低集合

- 主要 E2E 與 AuthZ／Tenant 負面流程。
- Browser／Viewport／Zoom／Locale／Theme Matrix。
- Keyboard／Focus 自動與人工驗證、代表性 Screen Reader。
- CSP／Security Header／Third-party Script／Source Map／Service Worker 檢查。
- Bundle Size、Code Splitting、Core Web Vitals／Performance Budget。
- Visual Regression（Baseline 更新需獨立核准）。
- Slow／Offline、Session Expiry、Stale Response、Auto-save Conflict、SSE Reconnect。

### 18.3 Scanner 狀態

下列情況不是通過：

- Browser Crash、Timeout、Skipped Browser、未收集 Trace。
- axe／lint 工具執行失敗或 Coverage 不完整。
- Visual Diff 由 Builder 自行更新 Baseline。
- CSP 因測試方便使用未核准 `unsafe-inline`／`unsafe-eval`。
- Source Map、Console、Screenshot 或 Network Evidence 含 Token／PII。

## 19. 管理能力與 AI 專項掃描

| 能力 | 最低工具／測試 |
|---|---|
| Operation／SSE | AuthZ／Tenant Negative、Connection／Resume／Backoff、Resource Limit |
| Scheduler | Registry／Schema、Arbitrary Command Detection、Concurrency／Misfire |
| Plugin | Signature、SCA、Malware、Capability／Sandbox、Compatibility |
| File | MIME／Magic、Malware、Active Content、Path／Signed URL、Tenant |
| Backup／Export | Secret／Config、Restore、Scope／Masking、Retention |
| AI Catalog／Provider | Schema、Egress、Secret、Last Known Good、Unapproved Model Disabled |
| Agent／MCP／Tool | Prompt Injection、Tool Misuse、Excessive Agency、Output Handling、Cost Bound |


## v4.4 Requirement Integrity Gate

本流程不得使用生命週期、Reviewer 或 Scanner 將產品負責人必備需求降級；每個 Candidate Revision 必須通過獨立 Requirement Conformance。


Frontend 掃描的權威行為與生命週期對照另見 `reference/FRONTEND_DEVELOPMENT_STANDARD.md` 與 `reference/FRONTEND_TESTING_STANDARD.md`。
