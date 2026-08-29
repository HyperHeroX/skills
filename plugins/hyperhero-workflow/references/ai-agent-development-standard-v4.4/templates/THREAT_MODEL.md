# THREAT_MODEL.md

> **用途**：在 S3 建立可由 Security／Domain Agent 審查、可映射到測試與 Security Invariants 的威脅模型。  
> **規則**：Threat Model 是設計與驗證輸入，不是「已安全」證明。

## 1. Metadata

| Field | Value |
|---|---|
| System／Feature |  |
| Task／Product ID |  |
| Version／Revision |  |
| Risk／Data Classification |  |
| Owners |  |
| Reviewers |  |
| Date／Expiry |  |

## 2. Scope／Assumptions／Non-goals

### In Scope

- 

### Out of Scope

- 

### Assumptions to Validate

| ID | Assumption | Evidence／Owner | Failure Impact |
|---|---|---|---|
| A-001 |  |  |  |

## 3. Assets

| Asset | Sensitivity／Criticality | Required Property | Owner |
|---|---|---|---|
|  |  | Confidentiality／Integrity／Availability／Safety／Privacy |  |

## 4. Actors、Identities、Privileges

| Actor／Service | Authentication | Allowed Actions | Trust Level | Credential／Lifetime |
|---|---|---|---|---|
|  |  |  |  |  |

## 5. Architecture／Data Flow

- Context Diagram：`<link>`
- Data Flow Diagram：`<link>`
- Deployment／Network Diagram：`<link>`

| Flow ID | Source | Destination | Data | Protocol | Trust Boundary | Validation／Encryption |
|---|---|---|---|---|---|---|
| DF-001 |  |  |  |  |  |  |

## 6. Entry Points／External Dependencies

| Entry／Dependency | Exposure | Untrusted Input | AuthN／AuthZ | Rate／Resource Limit | Failure Mode |
|---|---|---|---|---|---|
|  |  |  |  |  |  |

## 7. Threats／Abuse Cases

| ID | Threat／Abuse | Asset／Boundary | Preconditions | Impact | Likelihood | Risk | Control／Invariant | Detection | Test |
|---|---|---|---|---|---|---|---|---|---|
| TH-001 |  |  |  |  |  |  | `SI-*` |  |  |

至少評估：

- 身分冒用、Session／Token Replay、Account Enumeration。
- Broken Object／Function Authorization、跨租戶、Privilege Escalation。
- SQL／Shell／Template／HTML／Log／Deserializer Injection。
- SSRF、Redirect、Webhook、File／Path／Symlink。
- Secret／PII／Model Context／Log／Error Disclosure。
- Race、TOCTOU、Duplicate、Out-of-order、Partial Failure。
- Resource Exhaustion、Unbounded Retry／Queue／Parser／AI Cost。
- Dependency／Build／CI／Artifact Supply Chain。
- Prompt Injection、Tool Misuse、Excessive Agency、Memory／RAG Poisoning。
- Monitoring／Audit Evasion、Fail-open、Recovery／Rollback Failure。

## 8. Controls and Verification

| Control ID | Prevention | Detection | Evidence Location | Owner | Residual Risk |
|---|---|---|---|---|---|
| C-001 |  |  |  |  |  |

## 9. Residual Risk／Decision

| Risk | Decision | Owner | Compensating Control | Expiry／Review |
|---|---|---|---|---|
|  | Mitigate／Avoid／Transfer／Accept |  |  |  |

## 10. Review／Re-entry Triggers

重新執行 Threat Model：

- 新 Entry Point、Data Class、Tenant／Auth、Dependency、Tool／MCP、Network 或 Storage。
- Architecture／Trust Boundary／Deployment／Provider 變更。
- 新重大弱點、Incident、Abuse Pattern 或 Scanner Rule。
- Security Invariant／Policy 變更。
- 模型／Prompt／Tool／Embedding／RAG Index 重大變更。
