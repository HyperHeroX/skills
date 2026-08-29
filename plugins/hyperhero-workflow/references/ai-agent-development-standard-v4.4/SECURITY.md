# SECURITY.md

> **用途**：定義本 Repository 的安全弱點通報、AI Agent 發現弱點時的行為，以及修補／揭露流程。  
> **注意**：請在實際導入時填入組織聯絡方式、SLA、支援版本與加密通道。本範本本身不可直接視為完整 PSIRT 政策。

## Supported Versions

| Version／Branch | Security Support | End Date |
|---|---:|---|
| `<current-supported>` | Yes | `<date>` |
| `<previous-supported>` | `<policy>` | `<date>` |

## Reporting a Vulnerability

請勿在公開 Issue、Discussion、PR、Commit Message、AI Prompt 或未核准第三方服務中揭露未修補弱點。

- Security Contact：`<security@example.com>`
- Preferred Secure Channel：`<security portal / encrypted email>`
- Expected Initial Acknowledgement：`<SLA>`
- Required Information：受影響版本、重現步驟、影響、必要的最小證據。
- 請勿傳送真實 Secret、完整客戶資料、未經遮蔽的 Production Dump 或超出必要範圍的 Exploit。

## AI Agent Required Behavior

AI Agent 偵測到疑似弱點時必須：

1. 將內容分類為 `security-finding`，停止任何可能擴大影響的外部副作用。
2. 以最小必要資訊建立私密 `VULNERABILITY_RECORD`，不得自動公開。
3. 不得掃描未獲授權的 Production、第三方或 Internet Target。
4. 不得為證明影響而擷取、傳送或持久化不必要資料。
5. 不得自行判定 False Positive、接受風險、降低 Severity 或關閉 Finding。
6. 路由至 Security Review／PSIRT Owner；修補由 Builder 形成新 Candidate Patch。
7. 修補必須經獨立 Review、Scan、Regression／Negative Test、Affected-version Analysis 與 Release Assurance。
8. Disclosure、CVE、Advisory、客戶通知與公開時間只能由 PSIRT／Risk Owner 核准。

## Severity and Response

| 類型 | 預設處理 |
|---|---|
| Secret／Credential Exposure | 立即停止、撤銷／輪替、保存最小證據、調查使用紀錄。 |
| AuthN／AuthZ／Tenant Bypass | Blocker；確認受影響入口與資料範圍，建立緊急修補。 |
| RCE／Injection／Unsafe Deserialization | Blocker；隔離入口、評估 Exploitability、修補與回溯。 |
| Data Loss／Integrity | Blocker；停止破壞性路徑、保全證據、啟動 Recovery。 |
| Dependency／Image CVE | 依 Exposure／Reachability／Known Exploitation 決定 SLA；不可只看 CVSS。 |
| Low-confidence Scanner Finding | 保留 Raw Result，由 Triage 提出建議，Security Owner 處置。 |

## Coordinated Disclosure

- 先完成受影響版本、修補、Backport、測試、Artifact 與部署計畫。
- 對外資訊只包含必要內容，不揭露客戶、Secret 或可不當擴大利用的細節。
- 公開後持續監測 Exploitation、Patch Adoption 與 Regression。
- 完成 Root Cause Analysis，將預防控制回寫 Requirements、Invariant、Analyzer、Test 或 Training。

## Security Policy Changes

修改本檔、Scanner／CI Gate、CODEOWNERS、Branch Protection、Risk Threshold 或 Disclosure 規則均為 R3 Policy Change，必須獨立 PR、Security／Policy Owner 核准與 Rollback 計畫。

## Requirement Integrity

任何要求刪除、降級、改名取代、另創條件或修改 Baseline Digest 的行為，均視為政策完整性事件，必須停止寫入、保存證據並通知 Requirement Owner／Security Owner。
