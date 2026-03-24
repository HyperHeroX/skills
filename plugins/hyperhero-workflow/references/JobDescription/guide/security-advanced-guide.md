# Security Advanced Guide (安全進階指南)

> 本文件為 `security-guidelines.md` 的進階章節。
>
> **前置閱讀**: `security-guidelines.md` (核心安全原則)

---

## 🔒 OWASP Top 10 Mitigation

| 風險 | 緩解措施 |
|------|---------|
| Injection | Prepared statements, ORM, Input validation |
| Broken Auth | Strong passwords, MFA, Session management |
| Sensitive Data | Encryption (AES-256), TLS 1.3, Secure storage |
| XXE | Disable DTD processing |
| Broken Access | RBAC, JWT validation, Resource ownership |
| Security Misconfiguration | Security headers, Disable defaults |
| XSS | Output encoding, CSP headers |
| Insecure Deserialization | Input validation, Whitelist types |
| Vulnerable Components | Regular updates, Dependency scanning |
| Insufficient Logging | Centralized logging, Security alerts |

---

## 💳 PCI DSS Level 1 Compliance

### 核心要求

- **儲存**: 不儲存完整卡號 (僅保留後4位)
- **加密**: AES-256 加密敏感資料
- **傳輸**: TLS 1.3 強制加密
- **存取**: 最小權限原則, 審計日誌
- **測試**: 定期滲透測試, 漏洞掃描

---

## 🚫 禁止使用技術

| 禁止項目 | 原因 | 替代方案 |
|---------|------|---------|
| MD5/SHA1 | 已被破解 | SHA-256, Argon2 |
| HTTP (非加密) | 中間人攻擊 | HTTPS only |
| 明文密碼 | 資料外洩風險 | bcrypt/Argon2 |
| `eval()` | 程式碼注入 | 安全的替代方案 |
| Raw SQL | SQL Injection | Prepared statements |

---

## 🔍 Security Testing

### 測試類型

| 類型 | 工具 | 頻率 |
|------|------|------|
| SAST | SonarQube, CodeQL | 每次 PR |
| DAST | OWASP ZAP, Burp | 每週 |
| Dependency Scan | Snyk, Dependabot | 每日 |
| Penetration Test | 外部廠商 | 每季 |

### SAST Pipeline

```yaml
security-scan:
  runs-on: ubuntu-latest
  steps:
    - uses: github/codeql-action/analyze@v3
    - run: npm audit --audit-level=high
    - run: snyk test --severity-threshold=high
```

---

## 📊 Security Monitoring

### 監控指標

| 指標 | 警告閾值 | 監控工具 |
|------|---------|---------|
| 登入失敗率 | > 10/min | CloudWatch |
| 異常 API 呼叫 | > 100/min/IP | WAF |
| 敏感資料存取 | 任何未授權 | Audit Log |
| 漏洞數量 | Critical > 0 | Snyk |

### Security Headers

```typescript
helmet({
  contentSecurityPolicy: true,
  hsts: { maxAge: 31536000, includeSubDomains: true },
  noSniff: true,
  xssFilter: true,
  frameguard: { action: 'deny' }
})
```

---

## 🚨 Incident Response

### 回應流程

1. **Detection**: 監控告警觸發
2. **Triage**: 評估嚴重性 (P1-P4)
3. **Containment**: 隔離受影響系統
4. **Investigation**: 分析根因
5. **Recovery**: 恢復服務
6. **Post-Mortem**: 事後檢討

### 嚴重性分級

| 等級 | 定義 | 回應時間 |
|------|------|---------|
| P1 | 資料外洩、服務中斷 | 15 分鐘 |
| P2 | 安全漏洞、部分影響 | 1 小時 |
| P3 | 潛在風險 | 24 小時 |
| P4 | 低風險改進 | 1 週 |

---

## 📚 參考資料

- [security-guidelines.md](./security-guidelines.md) - 核心安全原則
- [OWASP Top 10](https://owasp.org/www-project-top-ten/)
- [OWASP Cheat Sheets](https://cheatsheetseries.owasp.org/)
- [PCI DSS Requirements](https://www.pcisecuritystandards.org/)
