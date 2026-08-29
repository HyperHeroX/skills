# SECURITY_SCAN_REPORT.md

> 人類可讀摘要；權威證據為 Scanner Raw Result 與 `AI_SCAN_MANIFEST.json`。

## 1. Scan Identity

| Field | Value |
|---|---|
| Scan ID |  |
| Task ID |  |
| Candidate Revision／Artifact Digest |  |
| Product Lifecycle Stage／Profile Digest |  |
| SSDLC Activity |  |
| Phase | Pre-commit／PR／Scheduled／Release／Post-release |
| Scan Type | SAST／SCA／Secret／IaC／Container／DAST／Fuzz／Artifact／... |
| Scanner Role／Agent |  |
| Tool／Version／Digest |  |
| Ruleset／Config Digest |  |
| Environment／Target |  |
| Started／Completed |  |

## 2. Scope and Exclusions

### Included

- 

### Excluded

| Path／Target | Reason | Approved By | Expiry |
|---|---|---|---|
|  |  |  |  |

### Coverage／Limitations

- 

## 3. Execution

| Field | Value |
|---|---|
| Command／Invocation |  |
| Exit Code |  |
| Execution Status | Succeeded／Failed／Error／Timeout |
| Raw Result Path／Digest／Format |  |
| Network Destinations |  |
| Resource Limits |  |

## 4. Findings

| ID | Rule／CWE／Advisory | Severity | Confidence | Location／Component | Evidence | Status |
|---|---|---|---|---|---|---|
| SCN-F-001 |  |  |  |  |  | Open |

## 5. Triage Recommendation

| Finding | Recommendation | Rationale | Security Owner Decision |
|---|---|---|---|
|  | True Positive／False-positive Candidate／Needs Investigation／Risk Candidate |  | Pending |

## 6. Gate Decision

- `pass`
- `fail`
- `error`
- `waived`
- `not-run`

### Threshold／Reason

- 

### Required Follow-up

- 

> `exit 0` 不等於自動 Pass；Tool Error、Timeout、Parse Error、Ruleset Load Failure 或缺少必要 Scope 一律不能標示 Pass。Scanner／Triage Agent 無權自行關閉 Finding 或接受風險。
