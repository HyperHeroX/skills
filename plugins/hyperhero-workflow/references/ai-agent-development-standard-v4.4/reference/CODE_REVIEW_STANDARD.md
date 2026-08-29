# AI 專業程式碼審查標準

> **版本**：4.4.0  
> **核心原則**：審查必須讓整體 Code Health、安全與可維護性改善或至少不降低；不追求個人偏好的完美，也不接受「看起來能跑」。

## 1. 審查前置條件

Reviewer 開始前必須取得：

- Task ID。
- Risk Level。
- Product Lifecycle Stage／Profile Digest。
- Current SSDLC Activity（S0–S14）。
- Requirements／Acceptance Criteria。
- Non-goals。
- Threat Model／Abuse Cases。
- Security Invariants。
- Base／Candidate Revision。
- Human-readable Diff。
- Builder Summary（標記為未驗證宣告）。
- Test／Scan Evidence。
- Review Routing。
- Activated Behavior／Domain Profiles。

缺少 Critical Artifact 時，Reviewer 應回報 `blocked`，不得自行猜測。

### 1.1 依產品生命週期調整審查深度

Reviewer 只載入目前 Stage、Diff 所觸發的 Domain Checklist 與本身角色標準；不得為了「完整」把所有階段與所有專業領域塞入同一審查 Context。

| Product Stage | 必要審查重點 | 預設專業代理 |
|---|---|---|
| `L0-MVP` | 假設是否可驗證、最小設計是否可重建、是否誤用正式資料／Credential、是否留下 Bypass／一次性程式。 | Final Candidate General Review；Auth、Tenant、Data、Shell、AI Tool 等風險觸發 Security／Domain Review。 |
| `L1-FORMAL-PROJECT` | Requirement／Threat／Architecture／Contract／Migration／Telemetry 是否與實作一致，是否形成可維護正式產品。 | 每 PR General Review；依 Diff 路由 Security、Data、API、Frontend、Implementation Quality、Concurrency 等 Reviewer。 |
| `L2-INTERNAL-TEST` | Release Candidate、Feature Freeze、Regression、負面測試、Migration／Recovery、測試真實度與 Finding 修正。 | General＋Security＋Test／QA＋所有被觸發 Domain Reviewer。 |
| `L3-PILOT` | Release Config、有限曝光、Canary、監控、事件、資料處理、支援與 Rollback 是否可在真實流量下安全運作。 | General＋Security＋Operations／Privacy／Supply-chain＋Release Assurance。 |
| `L4-GENERAL-AVAILABILITY` | Final Revision／Artifact／Config／Migration／SLO／DR／法遵／供應鏈證據是否一致，Go／No-Go 是否成立。 | 完整 Release Quorum；Reviewer 不直接部署。 |
| `L5-MAINTENANCE` | 依 Change Class 檢查相容、回歸、CVE、Patch SLA、Backport、Hotfix 範圍與控制是否退化。 | Standard Change 用 General；R2／Security／Hotfix 動態加入 Security、Domain 與 Release Assurance。 |
| `L6-RETIREMENT` | Data Disposition、Consumer、Credential、Domain、Job、Webhook、Artifact Retention 與不可逆點。 | Data／Identity／Operations／API Compatibility／Privacy／Release Assurance。 |

Stage 只決定審查深度與路由，不得降低安全不變條件。任何 Review Manifest 都必須綁定相同的 Stage、Profile Digest 與 Candidate Revision。

## 2. 獨立性與工作環境

- Reviewer 不得與 Builder 使用同一可寫工作區。
- Reviewer 必須在乾淨 Revision 上工作。
- Reviewer 預設唯讀。
- Approval 綁定 Candidate Revision Digest。
- 修改後 Approval 過期。
- Self-review 不算 Approval。
- 同一模型同一 Session 不算獨立。
- Reviewer 不得直接 Commit 修正後再核准。
- Review Agent 不持有 Production Secret 或 Deploy Credential。

## 3. Change Size 與結構

### 建議原則

- 一個主要邏輯目的。
- 小型、可理解、可測試、可回復。
- 行為與格式分離。
- 重構與功能分離。
- Dependency 與功能分離（可行時）。
- Policy／CI／Scanner 變更獨立 R3 PR。
- Generated Diff 與生成來源清楚。

### 大型變更處理

Reviewer 必須確認：

1. 是否可拆分。
2. 拆分後是否暴露不完整或不安全狀態。
3. 是否有先審設計再審實作。
4. 是否有 Diff Map／File Group。
5. 是否可逐 Commit Review。
6. 是否超出 Reviewer 能完整理解的範圍。

無法完整審查時必須 `blocked` 或要求拆分，不能因 AI 產生速度快而降低門檻。

## 4. PR／Change Description

必須包含：

- What：主要變更。
- Why：背景與決策。
- User／Operator Impact。
- Security／Privacy Impact。
- Compatibility／Breaking Change。
- Dependency／License。
- Data／Migration。
- Test／Scan。
- Rollout／Rollback。
- Feature Flag。
- Known Limitations。
- Related Requirement／ADR／Threat／Finding。

禁止只寫：

- `fix bug`
- `update code`
- `AI generated`
- 檔案列表
- 未驗證的「安全改善」

## 5. 審查順序

### 5.1 先看設計

- 變更是否屬於正確模組／層級。
- 依賴方向是否正確。
- 是否應重用既有元件。
- 是否有真實變化點。
- 是否產生第二套平行 Client／Manager／Helper。
- 是否過度抽象或過度耦合。
- 是否維持 Trust Boundary。

### 5.2 再看行為與失敗

- 正常路徑。
- 錯誤路徑。
- Empty／Null。
- Boundary／Malformed／Oversized。
- Timeout／Cancellation。
- Retry／Duplicate／Replay。
- Concurrency／Race。
- Partial Failure。
- Recovery／Rollback。
- Resource Exhaustion。

### 5.3 再看安全

- AuthN。
- Session／Token。
- AuthZ／Object／Tenant。
- Input／Injection／Output。
- Secret／Crypto。
- File／SSRF／Deserialization。
- Data／Privacy。
- Audit／Rate／Availability。
- AI／Agent。
- Supply Chain。

### 5.4 再看測試與證據

- 測試是否會在缺陷存在時失敗。
- 測試是否只重複實作。
- 是否有負面測試。
- Scanner 是否成功執行。
- Scope／Ruleset／Revision 是否正確。
- Finding 是否真的修正。
- Coverage 是否聚焦高風險路徑。

### 5.5 最後看可維護與發布

- Naming／Comments／Docs。
- Logging／Metric／Trace／Audit。
- API／Schema／Config Compatibility。
- Migration。
- Feature Flag。
- Deployment／Rollback。
- Runbook。
- Dependency／License／SBOM。

## 6. 通用 Checklist

### 6.1 Requirements／Scope

- [ ] Goal、Non-goals 與 Acceptance 明確。
- [ ] Diff 全部在 Scope。
- [ ] 沒有隱藏 Policy／CI／Scanner 變更。
- [ ] 需求與實作雙向追溯。
- [ ] 高影響假設已核准。

### 6.2 Design／Complexity

- [ ] 選擇最簡可維護設計。
- [ ] 無重複架構。
- [ ] 模組邊界與依賴方向正確。
- [ ] Pattern 有真實需求與 Decision Record。
- [ ] 無 Speculative Generalization。
- [ ] 無 God Object／Service Locator／全域可變狀態。

### 6.3 Correctness

- [ ] 正常與錯誤行為一致。
- [ ] Null／Empty／Boundary。
- [ ] 時間、時區、單位、精度。
- [ ] 排序、Pagination、Filter。
- [ ] Error Cause／Status。
- [ ] State Transition。
- [ ] Idempotency／Replay。
- [ ] Race／Atomicity。

### 6.4 Security

- [ ] Server-side AuthN／AuthZ。
- [ ] Object／Tenant Boundary。
- [ ] Input Bounds／Schema。
- [ ] Parameterized Query／Command。
- [ ] Context-aware Output Encoding。
- [ ] Secret Handling。
- [ ] Approved Crypto。
- [ ] SSRF／Redirect／DNS。
- [ ] File／Path／Upload。
- [ ] Serialization／Reflection。
- [ ] Rate／Quota／Resource Limit。
- [ ] Audit／Redaction。
- [ ] Fail-closed。
- [ ] Prompt／Tool／Model Output 不可信。

### 6.5 Resources／Reliability

- [ ] Timeout／Cancellation。
- [ ] Retry 只對暫時性且有上限。
- [ ] Stream／Socket／DB／Transaction／Lock 釋放。
- [ ] Queue／Backpressure。
- [ ] Circuit／Bulkhead。
- [ ] Graceful Shutdown。
- [ ] Crash／Restart 行為。
- [ ] No unbounded memory／file／thread／task。

### 6.6 Data／Migration

- [ ] Data Classification。
- [ ] Retention／Deletion。
- [ ] Transaction／Constraint。
- [ ] Expand／Contract。
- [ ] Rerun／Dry-run。
- [ ] Rollback／Roll-forward。
- [ ] Backup／Restore。
- [ ] Tenant／Cache／Job／Search Isolation。

### 6.7 Tests

- [ ] Unit。
- [ ] Integration／Contract。
- [ ] Negative Security。
- [ ] Regression。
- [ ] Concurrency／Cancellation。
- [ ] Migration。
- [ ] Performance／Resource（適用）。
- [ ] Test Failure proves behavior。
- [ ] No weakened assertion／sleep workaround。

### 6.8 Observability／Operations

- [ ] Structured Log。
- [ ] Trace／Correlation。
- [ ] Metric／Alert。
- [ ] Audit。
- [ ] Redaction。
- [ ] SLO／Health。
- [ ] Runbook。
- [ ] Rollout／Rollback Trigger。

### 6.9 Supply Chain

- [ ] Dependency 真有必要。
- [ ] Version／Lock。
- [ ] Registry／Source。
- [ ] Direct／Transitive Diff。
- [ ] Vulnerability／License／EOL。
- [ ] Generator／Action／Image Pin。
- [ ] SBOM／Provenance。
- [ ] Artifact 可重現／追溯。

## 7. Test Review 的獨立問題

Reviewer 應問：

- 移除新產品碼後，測試會失敗嗎？
- 把授權檢查改成永遠允許，測試會失敗嗎？
- 拿掉 Tenant Filter，測試會失敗嗎？
- 將錯誤改成成功，測試會失敗嗎？
- 重複送出請求，測試能發現重複副作用嗎？
- 模擬 Timeout／Cancellation／Partial Failure，測試能驗證復原嗎？
- 測試是否只檢查 Mock 呼叫，而非業務結果？
- 測試資料是否掩蓋 Production Configuration？
- 測試是否依賴執行順序、時間、網路或不穩定 Sleep？

## 8. Finding 分類

| Severity | 定義 | 預設處理 |
|---|---|---|
| `blocker` | 可造成安全邊界破壞、資料損失、RCE、Auth／Tenant Bypass、Secret、未核准 R3、無法安全部署／回復。 | 必須修正；正式例外僅限 Risk Owner。 |
| `major` | 明顯正確性、可靠性、相容性、可維護性或 High 安全風險。 | 合併前修正或正式風險接受。 |
| `minor` | 不阻擋但應改善的局部問題。 | 可修正或建立追蹤。 |
| `nit` | 不影響行為，且不應由 Formatter 自動解決的低風險建議。 | 不阻擋。 |
| `question` | Reviewer 需要資訊，尚未形成結論。 | 回覆後轉 Finding 或關閉。 |

## 9. Finding 必要欄位

- ID。
- Reviewer Role／Identity。
- Reviewed Revision。
- Severity／Confidence。
- Category。
- File／Line／Symbol 或 Artifact Location。
- Evidence。
- Risk／Why。
- Reproduction／Attack Preconditions（適用）。
- Standard Mapping（CWE／ASVS／Invariant／Profile）。
- Required／Suggested Remediation。
- Status。
- Resolution Evidence。
- Approver／Waiver（適用）。

## 10. Review Comment 寫法

推薦：

> `major — 此查詢只依 URL 的 tenantId 過濾，未驗證 tenantId 是否屬於目前 Principal；可造成跨租戶 IDOR。請從受信任 Session 建立 Tenant Context，並補跨租戶讀寫與批次查詢負面測試。對應 SI-TEN-001。`

不推薦：

> `這段很糟，重寫。`

推薦：

> `question — 這裡使用 Singleton 保存 cache client 是框架管理的 thread-safe client，還是會保存 request state？請補 lifetime／thread-safety 證據。`

不推薦：

> `Singleton 都不好。`

## 11. Review 決策

- `approved`：無 Open Blocker／Major，範圍與限制明確，Revision 一致。
- `changes-required`：存在應修正 Finding。
- `blocked`：缺少需求、證據、專業資格、Context 或無法完整審查。
- `error`：工具、Workspace、Revision 或 Schema 問題使審查無效。

`approved` 不是「無任何缺陷」，也不代表外部認證；它只代表在宣告範圍與證據下符合本次 Gate。

## 12. Formal Inspection

R3／High Assurance 應採：

1. Planning。
2. Overview。
3. Individual Preparation。
4. Inspection Meeting／Structured Finding。
5. Rework。
6. Follow-up。
7. Closure。

必須保存：

- Moderator。
- Participants／Roles。
- Artifact／Revision。
- Checklist。
- Preparation Evidence。
- Finding／Resolution。
- Sign-off。
- Defect Metrics。

## 13. Review Metrics

用來改善流程，不用來懲罰 Reviewer：

- First Response Time。
- Review Cycle Time。
- Findings per Change／per KLOC（僅作趨勢）。
- Blocker／Major Escape Rate。
- Reopen Rate。
- Stale Approval Count。
- Review Miss Found by Production／Incident。
- Human Rework Ratio。
- AI Review False-positive／False-negative。
- Large Diff Rejection／Split Rate。
- Cost per Accepted Change。

不得以「越少 Finding 越好」作為 Reviewer KPI，避免誘導漏報。

---

## 14. v4.4 Requirement-aware Review

每次 Review 必須先確認：

- Task Contract、Requirement State、Baseline／Policy Digest 與 Repository 一致。
- 直接與間接 Requirement IDs 完整涵蓋 Diff、資料流、UI、管理頁、外部副作用與技術棧。
- 來源原文及其明示條件沒有被刪除、降級、改名取代或另創條件。
- L0–L6 只改變成熟度，沒有用 Stage 將 Requirement 標成可選或不適用。
- 新增或修改 Requirement Baseline 必須有已核准 Human Requirement Amendment。

Finding 必須標記 Requirement ID，例如：

```yaml
requirement_ids:
  - SEC-REQ-001
  - UI-REQ-013
```

任何未核准語意偏離都是 Blocking Finding，不能以一般 Code Health 建議關閉。

## 15. Frontend Code Review

任何 UI、Browser、WebView、HTML、CSS、Client Script、Component、Router、Store、Form、Theme、i18n、Accessibility 或 Browser Storage 變更，至少觸發 Frontend Engineering Review；涉及輸入輸出、Session、Token、URL、Script、File、CSP 或 Service Worker 時另觸發 Frontend Security Review。

### 15.1 審查順序

1. 使用者流程、資料來源、Trust Boundary 與 Server Contract。
2. Component／State Ownership／API Client／SSR–CSR Boundary。
3. DOM XSS、Session／CSRF、URL／`postMessage`、Storage、CSP 與 Client Bundle。
4. RWD、Keyboard、Focus、Label、Error、Theme、Locale。
5. Async、Race、Cancellation、Retry、Conflict、Offline／Slow Network。
6. Component／E2E／Accessibility／Browser／Bundle／Visual Evidence。
7. 共用元件、技術債、相容性與 Rollback。

### 15.2 必查反模式

- Page Component 同時承擔 API、業務規則、權限與 UI。
- 第二套 Fetch／Axios Client、Button、Modal、Table、Validation 或 Notification。
- `v-html`／`innerHTML` Render 不可信內容。
- 長效 Token／敏感資料存於 Local Storage。
- Client Route Guard／Hidden Button 被當作授權。
- Store 跨 User／Tenant 未清除。
- 無 Loading／Empty／Error／Unauthorized／Stale 狀態。
- 以 Client-only、任意 Sleep、廣域 `any`／Ignore 解決 Hydration 或 Type 問題。
- Theme／Language Pack 執行未審查程式碼。
- Lazy Loading 造成無界 DOM、重複請求、焦點遺失或 Footer 不可達。

完整 Frontend Checklist 見 `reference/FRONTEND_CODE_REVIEW_STANDARD.md`。

## 16. 管理與 AI 能力 Review

- SSE／Operation：檢查授權、Tenant、狀態機、Resume、Cancel、Retry、Retention、Connection Limit。
- Scheduler：檢查 Schedulable Command Registry、Schema、Permission、Idempotency、Misfire、Timezone、禁止任意 Shell／SQL。
- Plugin：檢查 Manifest、Signature、Capabilities、Sandbox、Upgrade／Rollback、Supply Chain。
- File：檢查 Quarantine、Detected Type、Malware、Random Key、Signed URL、Tenant Isolation。
- Backup／Export：檢查完整備份與 Scoped Export 分離、Restore Drill、RPO／RTO。
- AI：檢查 Catalog 不自動啟用、Provider Secret Reference、Parameter Allowlist、Tool Schema、Budget、Kill Switch、Output Handling。


## v4.4 Requirement Integrity Gate

本流程不得使用生命週期、Reviewer 或 Scanner 將產品負責人必備需求降級；每個 Candidate Revision 必須通過獨立 Requirement Conformance。
