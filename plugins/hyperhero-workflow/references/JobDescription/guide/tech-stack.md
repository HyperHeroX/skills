# 技術棧規範 (Tech Stack Specification)

> **Version**: 1.0  
> **Last Updated**: 2026-01-31  
> **Maintainer**: HyperHeroX Team  
> **Status**: ✅ Active

---

## 📋 概述 (Overview)

本文檔定義 HyperHeroX Skills 專案的技術棧標準，涵蓋前端、後端、資料庫、測試工具、CI/CD、安全性工具等。所有新功能開發必須遵循本規範。

---

## 🎯 核心架構原則 (Core Architecture Principles)

| 原則 | 說明 | 實作方式 |
|------|------|---------|
| **Scalability First** | 支援 10x-100x 流量成長 | Horizontal Scaling, Microservices |
| **Security by Design** | 安全性優先設計 | Defense in Depth, OWASP Top 10, CISSP |
| **Observability** | 全域可觀測性 | Distributed Tracing, Real-time Monitoring |
| **Developer Experience** | 開發者體驗優先 | TypeScript, Serena MCP, Skills-First |
| **Cost Efficiency** | 成本效益優化 | Auto Scaling, Managed Services |

---

## 🚀 前端技術棧 (Frontend Stack)

### 核心框架 (Core Framework)
| 技術 | 版本 | 用途 | 決策依據 |
|------|------|------|---------|
| **Nuxt** | 4.2.1 | SSR/SSG Framework | ✅ SSR/SSG 提升 SEO (+30% 流量), 含改良錯誤處理 |
| **Vue** | 3.3.4 | Composition API | ✅ Composition API 提升程式碼可重用性 |
| **TypeScript** | 5.0.4 | Type Safety | ✅ 型別安全，減少 Runtime 錯誤 |
| **Vite** | 4.3.9 | Build Tool | ✅ 快速 HMR (<100ms), ESBuild 編譯 |

### UI 框架與工具 (UI Framework & Tools)
| 技術 | 版本 | 用途 | 備註 |
|------|------|------|------|
| **@nuxt/ui** | 4.3.0 | UI Component Library | ✅ Nuxt 官方 UI 庫，支援暗色模式 |
| **Pinia** | 2.1.3 | State Management | ✅ Vuex 官方推薦替代方案 |
| **TailwindCSS** | 3.4+ | CSS Framework | ✅ Utility-First, 支援 JIT 編譯 |

### 前端安全標準 (Frontend Security)
- **XSS 防護**: 使用 Vue 內建 `v-html` escaping, CSP Header
- **CSRF 防護**: 使用 CSRF Token (Server-side 驗證)
- **Input Validation**: 所有表單輸入需前端驗證 (Yup / Zod)

---

## ⚙️ 後端技術棧 (Backend Stack)

### 核心技術 (Core Technologies)
| 技術 | 版本 | 佔比 | 用途 | 決策依據 |
|------|------|------|------|---------|
| **Node.js** | 20.x | 40% | API Gateway, User, Product Service | ✅ 高併發, 生態豐富 |
| **Python** | 3.12+ | 30% | ML/AI, Analytics, Logistics | ✅ ML 生態 (TensorFlow), 數據分析 (Pandas) |
| **Go** | 1.21+ | 30% | Order, Payment, Inventory | ✅ 低延遲 (< 10ms), 高併發 (10K+ goroutines) |

### 後端框架 (Backend Frameworks)
| 語言 | 框架 | 版本 | 用途 |
|------|------|------|------|
| Node.js | **Express.js** | 4.18+ | RESTful API |
| Node.js | **NestJS** | 10.0+ | Enterprise-level Architecture (可選) |
| Python | **FastAPI** | 0.100+ | ML API, 高效能 RESTful API |
| Go | **Gin** | 1.9+ | High-Performance API |

### API 設計標準 (API Design Standards)
- **RESTful API**: 遵循 REST 原則 (GET, POST, PUT, DELETE)
- **gRPC**: 內部微服務通訊 (低延遲 < 5ms)
- **GraphQL**: 前端彈性查詢 (可選，適用複雜查詢)

---

## 🗄️ 資料庫技術棧 (Database Stack)

### 主要資料庫 (Primary Database)
| 技術 | 版本 | 用途 | 決策依據 |
|------|------|------|---------|
| **PostgreSQL** | 15.x | 主資料庫 (User, Product, Order) | ✅ ACID 保證, Sharding 支援, JSONB 彈性 |
| **Redis** | 7.x | 快取 + Session + 分散式鎖 | ✅ P95 < 5ms, 支援 Cluster Mode |
| **MongoDB** | 5.x | 彈性 Schema (日誌, 行銷活動) | ✅ 無 Schema 限制, 水平擴展 |

### Database Sharding Strategy (Sharding 策略)
```sql
-- User & Order Sharding (by user_id)
SELECT shard_id FROM users WHERE user_id % 10 = ?  -- 10 個 Shard，均勻分佈

-- Product Sharding (by category_id)
SELECT shard_id FROM products WHERE category_id % 5 = ?  -- 5 個 Shard
```

### Database Security (資料庫安全)
- **Encryption at Rest**: AES-256 (AWS RDS 加密)
- **Encryption in Transit**: TLS 1.3 (PostgreSQL SSL)
- **Access Control**: RBAC (Database-level permissions)
- **Sensitive Data**: Column-level encryption (PII 資料)

---

## 🔍 搜尋引擎 (Search Engine)

| 技術 | 版本 | 用途 | 決策依據 |
|------|------|------|---------|
| **Elasticsearch** | 8.11+ | 全文搜尋, 商品搜尋 | ✅ 中文分詞 (IK Analyzer), P95 < 200ms |

### Elasticsearch Configuration
```yaml
# Elasticsearch Index 配置
index:
  number_of_shards: 5
  number_of_replicas: 2
  refresh_interval: 1s
  
analyzer:
  ik_max_word:  # 中文分詞 (IK Analyzer)
    tokenizer: ik_max_word
```

---

## 📨 訊息佇列 (Message Queue)

| 技術 | 版本 | 用途 | 決策依據 |
|------|------|------|---------|
| **Kafka** | 3.6+ | 事件串流 (訂單事件, 庫存變更) | ✅ 100K events/sec, Event Sourcing |
| **RabbitMQ** | 3.12+ | 任務佇列 (Email, SMS, Notification) | ✅ 可靠傳遞, Dead Letter Queue |

### Message Queue Strategy
- **Kafka**: 大量事件 (Order Created, Payment Completed, Inventory Updated)
- **RabbitMQ**: 任務佇列 (發送 Email, 發送 SMS, 推播通知)

---

## 🌐 API Gateway & Networking

| 技術 | 版本 | 用途 | 決策依據 |
|------|------|------|---------|
| **Kong** | 3.4+ | API Gateway | ✅ Rate Limiting, JWT 驗證, Analytics |
| **NGINX** | 1.24+ | Reverse Proxy, Load Balancer | ✅ 高效能, SSL Termination |

### API Gateway Features
- **Rate Limiting**: 1000 requests/min per IP
- **JWT Verification**: Access Token 驗證 (15 min expiry)
- **API Analytics**: Request Count, Latency, Error Rate
- **CORS**: 跨域請求支援

---

## 🧪 測試工具 (Testing Tools)

### 前端測試 (Frontend Testing)
| 工具 | 版本 | 用途 | 備註 |
|------|------|------|------|
| **Vitest** | 1.0+ | Unit Test | ✅ Vite 原生支援, 快速執行 |
| **Playwright** | 1.40+ | E2E Test | ✅ 跨瀏覽器測試 (Chrome, Firefox, Safari) |
| **chrome-devtools-mcp** | Latest | Browser Automation | ✅ 強制使用 (AGENTS.md 規範) |

### 後端測試 (Backend Testing)
| 工具 | 版本 | 用途 | 備註 |
|------|------|------|------|
| **Jest** | 29.x | Node.js Unit Test | ✅ Mocking, Coverage Report |
| **pytest** | 7.x | Python Unit Test | ✅ Fixtures, Parametrize |
| **Go testing** | Built-in | Go Unit Test | ✅ Table-driven tests |
| **Postman** | Latest | API Test | ✅ API Collection 管理 |

### 測試標準 (Testing Standards)
- **Unit Test Coverage**: ≥ 80% (強制要求)
- **E2E Test Coverage**: 核心流程 100% (註冊, 登入, 下單, 支付)
- **Browser E2E Test**: 必須使用 `chrome-devtools-mcp` (AGENTS.md Section 3.3)

---

## 🔐 安全性工具 (Security Tools)

| 工具 | 用途 | 標準 |
|------|------|------|
| **bcrypt** | 密碼雜湊 | Cost factor 12 (AGENTS.md Section 6) |
| **JWT** | 認證 Token | Access 15 min, Refresh 30 days |
| **OWASP ZAP** | 安全掃描 | 每次部署前執行 |
| **Snyk** | 依賴掃描 | 自動偵測漏洞套件 |

### Security Standards (安全標準)
- **OWASP Top 10**: 所有 API 必須防護 OWASP Top 10 威脅
- **CISSP CIA Triad**: 所有 Auth/Payment 任務需標註 Confidentiality, Integrity, Availability
- **PCI DSS Level 1**: 支付相關服務必須符合 PCI DSS 規範
- **JWT Secret**: 長度至少 32 字元的高強度隨機字串 (AGENTS.md Section 6)

---

## ☁️ 基礎設施 (Infrastructure)

### Cloud Provider (雲端服務商)
| 服務 | 提供商 | 用途 |
|------|-------|------|
| **Container Orchestration** | AWS ECS Fargate | Serverless Container, Auto Scaling |
| **Database** | AWS RDS (PostgreSQL) | Managed Database, Multi-AZ |
| **Cache** | AWS ElastiCache (Redis) | Managed Redis Cluster |
| **Object Storage** | AWS S3 | 圖片, 影片儲存 |
| **CDN** | AWS CloudFront / Cloudflare | 靜態資源 CDN, -80% 延遲 |

### Infrastructure as Code (IaC)
- **Terraform**: 基礎設施定義 (首選)
- **AWS CloudFormation**: AWS 原生 IaC (備選)

---

## 🔄 CI/CD 工具 (CI/CD Tools)

| 工具 | 用途 | 配置 |
|------|------|------|
| **GitHub Actions** | CI/CD Pipeline | `.github/workflows/multilang-test.yml` |
| **Railway** | 測試環境部署 | Stage 環境 (非 main 分支) |
| **Docker** | 容器化 | Dockerfile (Multi-stage build) |
| **Podman** | 容器測試 | 本機 E2E 測試 (AGENTS.md Section 8) |

### CI/CD Pipeline Stages
1. **Build**: `npm run build` / `dotnet build`
2. **Unit Test**: Jest / pytest / Go testing
3. **E2E Test**: chrome-devtools-mcp (強制要求)
4. **Security Scan**: OWASP ZAP + Snyk
5. **Deploy**: Railway (Stage) / AWS ECS (Production)

---

## 📦 套件管理 (Package Management)

| 語言 | 套件管理工具 | Lock File | 備註 |
|------|------------|----------|------|
| Node.js | **pnpm** | `pnpm-lock.yaml` | ✅ 節省磁碟空間, 快速安裝 |
| Python | **Poetry** | `poetry.lock` | ✅ 依賴解析, 虛擬環境管理 |
| Go | **go mod** | `go.sum` | ✅ Go 內建工具 |

---

## 🛠️ 開發工具 (Development Tools)

### IDE & Editor
- **VS Code**: 主要 IDE (推薦)
  - 必裝擴充: GitHub Copilot, Serena MCP, Playwright Test for VSCode
  
### Code Quality Tools
| 工具 | 用途 | 配置檔 |
|------|------|--------|
| **ESLint** | JavaScript/TypeScript Linter | `.eslintrc.js` |
| **Prettier** | Code Formatter | `.prettierrc` |
| **Ruff** | Python Linter | `ruff.toml` |
| **golangci-lint** | Go Linter | `.golangci.yml` |

### Git Workflow
- **分支策略**: `main` (Production), `stage` (Testing), `feature/*` (開發)
- **Commit 規範**: Conventional Commits (feat, fix, docs, style, refactor, test, chore)
- **Pre-commit Hook**: ESLint + Prettier + Unit Test (AGENTS.md Section 5.1)

---

## 📊 監控與日誌 (Monitoring & Logging)

| 工具 | 用途 | 備註 |
|------|------|------|
| **Datadog** | APM + 監控 + 日誌 | ✅ Distributed Tracing, Real-time Dashboard |
| **AWS CloudWatch** | AWS 原生監控 | ✅ ECS, RDS, ElastiCache 監控 |
| **Sentry** | 錯誤追蹤 | ✅ Frontend + Backend 錯誤追蹤 |
| **Elasticsearch** | 日誌儲存 + 搜尋 | ✅ ELK Stack (Elasticsearch + Logstash + Kibana) |

### Monitoring Metrics
- **Golden Signals**: Latency, Traffic, Errors, Saturation
- **SLIs**: API 回應時間 P95 < 200ms, Uptime > 99.95%
- **SLOs**: 月度停機時間 < 22 分鐘

---

## 🔧 工具優先原則 (Tool Priority Principles)

### Serena MCP 優先 (AGENTS.md Section 3.1)
- ✅ **所有原始碼探索必須優先使用 Serena MCP 工具**
  - `mcp_oraios_serena_get_symbols_overview`: 取得專案結構概覽
  - `mcp_oraios_serena_find_symbol`: 精確查詢 class, function, type
  - `mcp_oraios_serena_search_for_pattern`: 字串或模式搜尋

### Skills 優先 (AGENTS.md Section 3.2)
- ✅ **所有開發任務必須先檢查 Skills**
  - UI/UX 設計 → `UI-UX-Pro-Max-Skills`
  - Nuxt 架構開發 → Nuxt 相關 Skills
  - OpenSpec 工作流 → `openspec-*` Skills

### Browser Automation 強制使用 (AGENTS.md Section 3.3)
- ✅ **所有前端 E2E 測試必須使用 `chrome-devtools-mcp`**
  - UI 截圖
  - 版面與視覺驗證 (對齊, 文字完整, 顏色對比度, RWD, 暗/亮色模式)
  - 互動驗證 (點擊, 輸入, 懸停)
  - 資料正確性驗證
  - Console 錯誤監控

---

## 🚫 禁止使用技術 (Forbidden Technologies)

| 技術 | 原因 | 替代方案 |
|------|------|---------|
| **sha256 (密碼雜湊)** | ❌ 快速雜湊不安全 | ✅ bcrypt (cost 12) / argon2 |
| **chrome.storage.sync (API Key)** | ❌ 安全風險 | ✅ chrome.storage.local + Encryption |
| **eval / exec / system** | ❌ Code Injection 風險 | ✅ 靜態分析 + 參數化查詢 |
| **單純 HTTP (無 HTTPS)** | ❌ 明文傳輸 | ✅ TLS 1.3 (HTTPS only) |

---

## 📚 參考文件 (References)

### 內部文件
- [AGENTS.md](../../AGENTS.md) ← AI 開發規範
- [docs/Environment/env.md](../../docs/Environment/env.md) ← 環境資訊
- [stress-test-architect-output.md](../../test/multilang-test/stress-test-architect-output.md) ← 架構設計範例

### 外部標準
- [OWASP Top 10](https://owasp.org/www-project-top-ten/)
- [PCI DSS v4.0](https://www.pcisecuritystandards.org/)
- [CISSP Domains](https://www.isc2.org/Certifications/CISSP/CISSP-Domains)
- [Nuxt 4 Documentation](https://nuxt.com/docs)
- [PostgreSQL 15 Documentation](https://www.postgresql.org/docs/15/)

---

## 🔄 版本歷史 (Version History)

| 版本 | 日期 | 變更內容 | 作者 |
|------|------|---------|------|
| 1.0 | 2026-01-31 | 初版建立 | AI Agent (Copilot) |

---

## ✅ 結論 (Conclusion)

本技術棧規範涵蓋前端、後端、資料庫、測試、安全性、基礎設施、CI/CD 等所有層面，所有新功能開發必須遵循本規範。

**關鍵原則**:
1. ✅ **Serena MCP 優先** (所有原始碼探索)
2. ✅ **Skills 優先** (所有開發任務)
3. ✅ **Browser Automation 強制** (所有前端 E2E 測試)
4. ✅ **Security by Design** (OWASP Top 10 + CISSP + PCI DSS)
5. ✅ **Quality First** (Unit Test ≥80%, E2E Test 100% 核心流程)

---

**維護責任**: HyperHeroX Team  
**更新頻率**: 每季度檢視 (Q1, Q2, Q3, Q4)  
**最後更新**: 2026-01-31
