# SECURITY_INVARIANTS.md v4.4

> 一般任務不得修改；修改屬 R3。產品必備需求完整性本身也是 Critical Invariant。

| Invariant ID | 不變條件 | 最低證據 |
|---|---|---|
| `SI-REQ-001` | 來源必備需求不得刪除、降級、改名取代、另創條件或以外部標準改寫。 | Baseline Digest、Requirement Conformance Manifest |
| `SI-REQ-002` | L0–L6 只改變成熟度，不改變 Requirement 存在與強度。 | Lifecycle／State Validation |
| `SI-AUTHN-001` | 受保護入口由 Server 驗證有效身分與 Token／Session。 | 未登入、過期、撤銷、Issuer／Audience 測試 |
| `SI-AUTHZ-001` | UI 元件受 RBAC，後端以同一 Role／Tenant Permission 再授權。 | UI／API／Direct Request／Cross-tenant 測試 |
| `SI-TEN-001` | 多租戶資料、Cache、Job、File、Log、AI Context 隔離；管理者跨租戶查探有 Audit。 | Cross-tenant Negative／Audit Test |
| `SI-INPUT-001` | 輸入與輸出經鏈式合法性、完整性與業務規則驗證。 | Boundary／Malformed／Business Rule Test |
| `SI-INJECT-001` | 不可信資料不得直接拼接 SQL、Shell、HTML、Template、URL、Path 或程式碼。 | SAST／DAST／Fuzz／Encoding Test |
| `SI-SECRET-001` | Secret／Key／Token 不進 Repo、Prompt、Log、Test、Client Bundle；三層金鑰來源行為保持。 | Secret Scan、Key Lifecycle Test |
| `SI-LOG-001` | 系統／程式 Log 分類分級；對外錯誤無敏感資訊。 | Log Schema、Redaction／Production Error Test |
| `SI-SSE-001` | 所有功能或方法的 started/running/blocked/error/aborted/finished 狀態可訂閱，且不洩漏敏感參數。 | Instrumentation Coverage、SSE／RBAC Test |
| `SI-SCHED-001` | 所有功能具受控 Schedule Adapter；禁止任意使用者輸入直接成為 Shell／SQL。 | Registry Coverage、Negative／Audit Test |
| `SI-BACKUP-001` | 具資料庫備份、管理者下載政策繼承、角色／租戶範圍下載與 Restore。 | Backup／Scoped Download／Restore Test |
| `SI-FE-001` | UI-REQ-001～017 不得被一般前端偏好取代。 | Frontend Review／E2E／AA／Visual Evidence |
| `SI-AI-001` | AI-REQ-001～004 保持；模型／Tool 輸出仍視為不可信。 | Catalog／Provider／Tool Abuse Test |
| `SI-CI-001` | Builder 不得核准自己、調弱測試／Scanner／Policy 或竄改 Baseline。 | Review／Scan／Conformance／Policy Diff |
| `SI-ART-001` | Release Artifact 可回溯至同一 Source、Baseline、Review、Scan、Test、SBOM／Provenance。 | Digest／Attestation／Release Evidence |
