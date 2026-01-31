# 大型電商平台系統架構設計文件（V1.0）

## 📋 Executive Summary

### 系統概述
- **系統名稱**: 企業級電商平台（Scalable E-Commerce Platform）
- **系統規模**: 10 子系統、50+ APIs、22 資料表、10 技術架構決策
- **預期流量**: 100K+ DAU（Daily Active Users）、1000+ orders/sec（尖峰）
- **資料規模**: 100K+ SKUs、10M+ 用戶、100M+ 訂單/年
- **架構風格**: **Microservices** with **Event-Driven Architecture**

### 架構原則（Architecture Principles）
1. **Scalability First**: 支援 10x-100x 流量成長（Horizontal Scaling）
2. **Resilience**: 單一服務故障不影響整體系統（Circuit Breaker, Bulkhead）
3. **Security**: Defense in Depth（多層防禦）+ Zero Trust（不信任任何請求）
4. **Observability**: 全域追蹤（Distributed Tracing）+ 即時監控（Real-time Monitoring）
5. **Cost Efficiency**: 按需擴展（Auto Scaling）+ 資源優化（Spot Instances）

### 技術棧概覽
| Layer | Technology | Justification |
|-------|-----------|---------------|
| **Frontend** | Next.js 14 + React 18 | SSR/SSG 提升 SEO（+30% 流量）+ React Server Components 減少 Bundle Size（-40%） |
| **Backend** | Node.js 20 (40%), Python 3.12 (30%), Go 1.21 (30%) | Node.js 高併發、Python ML/AI、Go 低延遲服務 |
| **API Gateway** | Kong Gateway | Rate Limiting（防 DDoS）+ JWT 驗證 + API Analytics |
| **Database** | PostgreSQL 15（主）+ Redis 7（快取）+ MongoDB 5（非結構化） | PostgreSQL ACID + Sharding、Redis 毫秒級、MongoDB 彈性 Schema |
| **Search** | Elasticsearch 8.11 | 中文分詞（IK Analyzer）+ Full-Text Search < 200ms |
| **Message Queue** | Kafka 3.6 + RabbitMQ 3.12 | Kafka 大量事件（100K events/sec）、RabbitMQ 任務佇列 |
| **Caching** | Redis Cluster 7 + CDN（CloudFront） | Redis 分散式快取（P95 < 5ms）+ CDN 靜態資源（-80% 延遲） |
| **Infrastructure** | AWS ECS Fargate + RDS + ElastiCache | Serverless Container（按需擴展）+ Managed Services（降低 Ops 負擔） |

---

## 🏗️ Architecture Overview（架構總覽）

### C4 Model - Context Diagram（系統情境圖）

```mermaid
C4Context
    title System Context - E-Commerce Platform（情境圖）
    
    Person(customer, "Customer", "使用者購物")
    Person(admin, "Admin", "後台管理")
    Person(vendor, "Vendor", "供應商管理商品")
    
    System_Boundary(system, "E-Commerce Platform") {
        System(ecommerce, "E-Commerce Platform", "10 Microservices + API Gateway")
    }
    
    System_Ext(payment, "Payment Gateway", "Stripe + PayPal")
    System_Ext(logistics, "Logistics Provider", "5 家物流商")
    System_Ext(email, "Email Service", "SendGrid")
    System_Ext(sms, "SMS Service", "Twilio")
    System_Ext(analytics, "Analytics Service", "Google Analytics")
    
    Rel(customer, ecommerce, "瀏覽商品、下單", "HTTPS")
    Rel(admin, ecommerce, "管理後台", "HTTPS")
    Rel(vendor, ecommerce, "上架商品", "HTTPS")
    
    Rel(ecommerce, payment, "支付處理", "HTTPS/Webhook")
    Rel(ecommerce, logistics, "物流追蹤", "HTTPS/API")
    Rel(ecommerce, email, "發送 Email", "SMTP/API")
    Rel(ecommerce, sms, "發送簡訊", "HTTPS/API")
    Rel(ecommerce, analytics, "埋點追蹤", "HTTPS")
```

### C4 Model - Container Diagram（容器圖）

```mermaid
C4Container
    title Container Diagram - E-Commerce Platform（容器圖）
    
    Person(customer, "Customer")
    Person(admin, "Admin")
    
    Container_Boundary(frontend, "Frontend") {
        Container(web, "Web App", "Next.js 14", "SSR/SSG, React Server Components")
        Container(mobile, "Mobile App", "React Native", "iOS + Android")
    }
    
    Container(apigateway, "API Gateway", "Kong", "Rate Limiting, JWT, Analytics")
    
    Container_Boundary(backend, "Backend Microservices") {
        Container(user, "User Service", "Node.js", "註冊/登入/RBAC")
        Container(product, "Product Service", "Node.js", "商品管理/搜尋")
        Container(order, "Order Service", "Node.js", "訂單/購物車/Saga")
        Container(payment, "Payment Service", "Go", "支付/退款/PCI DSS")
        Container(inventory, "Inventory Service", "Go", "庫存/分散式鎖")
        Container(logistics, "Logistics Service", "Python", "物流/追蹤")
        Container(marketing, "Marketing Service", "Node.js", "優惠券/會員")
        Container(analytics, "Analytics Service", "Python", "BI/報表")
        Container(cs, "CS Service", "Node.js", "客服/WebSocket")
        Container(admin, "Admin Service", "Node.js", "後台/RBAC")
    }
    
    ContainerDb(postgres, "PostgreSQL", "RDS Multi-AZ", "主資料庫")
    ContainerDb(redis, "Redis Cluster", "ElastiCache", "快取 + 分散式鎖")
    ContainerDb(mongo, "MongoDB", "DocumentDB", "非結構化資料")
    ContainerDb(es, "Elasticsearch", "OpenSearch", "全文搜尋")
    ContainerQueue(kafka, "Kafka Cluster", "MSK", "事件串流")
    ContainerQueue(rabbitmq, "RabbitMQ", "AmazonMQ", "任務佇列")
    
    Rel(customer, web, "瀏覽", "HTTPS")
    Rel(admin, web, "管理", "HTTPS")
    Rel(web, apigateway, "API 請求", "HTTPS")
    
    Rel(apigateway, user, "User APIs", "HTTP/gRPC")
    Rel(apigateway, product, "Product APIs", "HTTP/gRPC")
    Rel(apigateway, order, "Order APIs", "HTTP/gRPC")
    Rel(apigateway, payment, "Payment APIs", "HTTP/gRPC")
    
    Rel(user, postgres, "讀寫用戶", "SQL")
    Rel(product, postgres, "讀寫商品", "SQL")
    Rel(order, postgres, "讀寫訂單", "SQL")
    Rel(order, kafka, "發送訂單事件", "Kafka Protocol")
    
    Rel(product, es, "搜尋商品", "HTTPS/API")
    Rel(inventory, redis, "分散式鎖", "Redis Protocol")
    Rel(marketing, redis, "優惠券快取", "Redis Protocol")
```

### Architecture Style Comparison（架構風格比較）

#### Option 1: Monolith（單體架構）
**Pros**:
- ✅ 開發簡單（單一 Codebase）
- ✅ 部署簡單（單一 Container）
- ✅ 交易簡單（ACID Transaction）

**Cons**:
- ❌ 擴展困難（只能垂直擴展）
- ❌ 技術棧單一（無法混用 Node.js + Python + Go）
- ❌ 單點故障（一個 Bug 影響全系統）
- ❌ 團隊協作困難（50 人同時修改一個 Codebase）

**Decision**: ❌ **不採用**（無法支援 100K+ DAU 與 1000+ orders/sec）

---

#### Option 2: Microservices（微服務架構）✅ **採用**
**Pros**:
- ✅ 獨立擴展（Order Service 可單獨擴展至 10 個 Pod）
- ✅ 技術多樣性（Node.js + Python + Go 混用）
- ✅ 容錯隔離（Payment 掛了不影響 Product）
- ✅ 團隊自主（10 個團隊各自負責 1 個 Service）

**Cons**:
- ❌ 複雜度高（需 Distributed Tracing、Service Mesh）
- ❌ 資料一致性（需 Saga Pattern 或 2PC）
- ❌ 網路延遲（Service 間 RPC 呼叫）

**Decision**: ✅ **採用**（適合大型團隊 + 高流量需求）

---

#### Option 3: Serverless（無伺服器架構）
**Pros**:
- ✅ 自動擴展（AWS Lambda 按需擴展）
- ✅ 成本低（只付使用量）
- ✅ Ops 負擔低（無需管理伺服器）

**Cons**:
- ❌ Cold Start 延遲（Lambda 冷啟動 1-3s）
- ❌ 執行時間限制（Lambda 15 分鐘 timeout）
- ❌ 資料庫連線池困難（Lambda 短生命週期）

**Decision**: ❌ **不採用**（訂單/支付服務需低延遲，Lambda Cold Start 不適合）

---

## 📊 Technology Stack - Architecture Decision Records（ADRs）

### ADR-001: Frontend Framework - Next.js 14 vs React SPA vs Vue.js ✅

#### Context
需選擇前端框架支援：
- SSR/SSG（提升 SEO 30%+ 流量）
- React Server Components（減少 Bundle Size 40%）
- 100K+ DAU 高併發

#### Options Considered
| Option | Pros | Cons | Score |
|--------|------|------|-------|
| **Next.js 14** | SSR/SSG, React Server Components, Vercel 整合 | 學習曲線陡峭 | **9/10** |
| React SPA | 開發簡單, 生態豐富 | SEO 差, Bundle Size 大 | 6/10 |
| Vue.js 3 | 學習曲線平緩, Vite 快速 | 生態較小, SSR 複雜 | 7/10 |

#### Decision: **Next.js 14** ✅

#### Rationale
1. **SEO Critical**: 電商平台需 Google 索引商品頁（SSR 提升 30%+ 自然流量）
2. **Performance**: React Server Components 減少 Client Bundle（40% 減少 → FCP < 1.5s）
3. **Team Capability**: 團隊有 React 經驗（15 人），學習 Next.js 成本低（1 週）

#### Consequences
- ✅ Pros: SEO 友善、載入速度快、開發體驗佳
- ❌ Cons: 部署複雜度增加（需 Node.js Server）、Vercel 綁定風險（可改用 ECS Fargate）

#### Monitoring
- Core Web Vitals: FCP < 1.5s, LCP < 2.5s, CLS < 0.1
- SEO Traffic: Google Search Console（月流量 +30%）

---

### ADR-002: Backend Language - Node.js vs Python vs Go ✅ Mixed

#### Context
後端需支援：
- 高併發（1000+ orders/sec）
- ML/AI（商品推薦、AI 客服）
- 低延遲（支付/庫存服務 P95 < 50ms）

#### Options Considered
| Option | Pros | Cons | Use Case |
|--------|------|------|----------|
| **Node.js 20** | 高併發（Event Loop）, 生態豐富（npm） | 單執行緒（CPU 密集型慢） | User, Order, Marketing |
| **Python 3.12** | ML/AI 生態（TensorFlow, PyTorch）, 快速開發 | 效能差（GIL 限制）, 部署慢 | Analytics, Logistics |
| **Go 1.21** | 低延遲（P95 < 10ms）, 併發好（Goroutine） | 生態小, 學習曲線陡 | Payment, Inventory |

#### Decision: **Mixed（Node.js 40% + Python 30% + Go 30%）** ✅

#### Rationale
1. **Node.js（40%）**: 用於 User, Order, Marketing（高併發 I/O 密集型）
2. **Python（30%）**: 用於 Analytics, Logistics（ML/AI + 外部 API 整合）
3. **Go（30%）**: 用於 Payment, Inventory（低延遲 + 分散式鎖）

#### Consequences
- ✅ Pros: 各取所長、技術棧多樣性、團隊技能利用
- ❌ Cons: Ops 複雜度增加（3 種 Runtime）、跨語言 RPC 需統一（gRPC）

#### Monitoring
- Latency: Node.js P95 < 100ms, Python P95 < 200ms, Go P95 < 50ms
- Error Rate: All services < 0.1%

---

### ADR-003: Database - PostgreSQL vs MySQL vs NoSQL ✅ Hybrid

#### Context
資料庫需支援：
- ACID Transaction（訂單/支付）
- 複雜查詢（JOIN, Aggregation）
- 高流量（100K+ DAU, 10M+ 用戶）
- 彈性 Schema（用戶自訂欄位）

#### Options Considered
| Option | Pros | Cons | Use Case |
|--------|------|------|----------|
| **PostgreSQL 15** | ACID, 複雜查詢, Sharding 支援 | 垂直擴展限制 | User, Order, Payment |
| **MySQL 8** | 成熟穩定, 生態豐富 | JSON 支援差, Sharding 複雜 | - |
| **MongoDB 5** | 彈性 Schema, 水平擴展 | 無 ACID（單文件）, JOIN 慢 | Product Attributes, Logs |
| **Redis 7** | 毫秒級延遲, 分散式鎖 | 資料不持久（需持久化） | Cache, Session, Lock |

#### Decision: **Hybrid（PostgreSQL 主 + MongoDB 輔 + Redis 快取）** ✅

#### Rationale
1. **PostgreSQL（主資料庫）**: 用於 User, Order, Payment（需 ACID Transaction）
2. **MongoDB（輔助）**: 用於 Product Attributes（彈性 Schema）, Logs（寫入密集）
3. **Redis（快取 + 鎖）**: 用於 Session, 商品詳情快取, 分散式鎖

#### Sharding Strategy（分片策略）
- **User**: Shard by `user_id % 10`（10 個 Shard）
- **Order**: Shard by `user_id % 10`（與 User 同分片，避免跨片 JOIN）
- **Product**: Shard by `category_id % 5`（5 個 Shard）

#### Consequences
- ✅ Pros: ACID 保證、彈性 Schema、水平擴展
- ❌ Cons: Ops 複雜度增加（3 種 Database）、資料一致性需處理

#### Monitoring
- Query Latency: PostgreSQL P95 < 50ms, MongoDB P95 < 20ms, Redis P95 < 5ms
- Cache Hit Rate: Redis > 80%

---

### ADR-004: API Gateway - Kong vs NGINX vs AWS API Gateway ✅

#### Context
API Gateway 需支援：
- Rate Limiting（防 DDoS）
- JWT 驗證（無狀態認證）
- API Analytics（追蹤流量）
- 100K+ RPS（高流量）

#### Options Considered
| Option | Pros | Cons | Score |
|--------|------|------|-------|
| **Kong Gateway** | Plugins 豐富（JWT, Rate Limit）, 開源 | 學習曲線陡 | **9/10** |
| NGINX | 成熟穩定, 高效能 | Plugin 少, 需自行開發 | 7/10 |
| AWS API Gateway | Managed, 自動擴展 | 成本高（$3.5/M requests）, 功能有限 | 6/10 |

#### Decision: **Kong Gateway** ✅

#### Rationale
1. **Plugins**: JWT 驗證（`jwt` plugin）, Rate Limiting（`rate-limiting` plugin）, Analytics（`prometheus` plugin）
2. **Cost**: 開源免費（vs AWS API Gateway $3.5/M requests = $350K/月@100M requests）
3. **Team**: 團隊有 NGINX 經驗，Kong 基於 NGINX（學習曲線低）

#### Consequences
- ✅ Pros: 功能豐富、成本低、開源社群支援
- ❌ Cons: Ops 負擔（需自行維護 Kong Cluster）、無 Managed Service

#### Monitoring
- Latency: Kong P95 < 10ms（Gateway Overhead）
- Rate Limit: 1000 RPS/IP（防 DDoS）

---

### ADR-005: Message Queue - Kafka vs RabbitMQ vs AWS SQS ✅ Both

#### Context
Message Queue 需支援：
- 大量事件串流（100K events/sec）
- 任務佇列（Email, SMS 非同步發送）
- 事件回溯（Replay Events）

#### Options Considered
| Option | Pros | Cons | Use Case |
|--------|------|------|----------|
| **Kafka 3.6** | 高吞吐（100K events/sec）, 事件回溯 | 設定複雜, Ops 負擔高 | Order Events, Analytics |
| **RabbitMQ 3.12** | 任務佇列簡單, Routing 靈活 | 吞吐低（10K msg/sec） | Email, SMS 佇列 |
| **AWS SQS** | Managed, 自動擴展 | 無事件回溯, 延遲高（100ms） | - |

#### Decision: **Both（Kafka + RabbitMQ）** ✅

#### Rationale
1. **Kafka（事件串流）**: 用於 Order Events, Analytics Events（需事件回溯 + 高吞吐）
2. **RabbitMQ（任務佇列）**: 用於 Email, SMS 佇列（需 Routing + Priority Queue）

#### Consequences
- ✅ Pros: 各取所長、高吞吐 + 靈活 Routing
- ❌ Cons: Ops 複雜度增加（2 種 MQ）、成本增加（Kafka $500/月 + RabbitMQ $200/月）

#### Monitoring
- Kafka Lag: < 100 messages（事件延遲）
- RabbitMQ Queue Length: < 1000 messages（避免積壓）

---

### ADR-006: Caching Strategy - Redis vs Memcached vs CDN ✅ Hybrid

#### Context
快取需支援：
- 毫秒級延遲（P95 < 5ms）
- 分散式鎖（庫存扣減）
- 靜態資源（圖片、CSS、JS）

#### Options Considered
| Option | Pros | Cons | Use Case |
|--------|------|------|----------|
| **Redis Cluster** | 分散式鎖, 資料結構豐富, 持久化 | 記憶體貴（$0.1/GB/hour） | Session, 商品快取, Lock |
| **Memcached** | 簡單快速, 記憶體便宜 | 無持久化, 無分散式鎖 | - |
| **CDN（CloudFront）** | 全球加速, 減少 Origin 負擔 | 僅適用靜態資源 | 圖片, CSS, JS |

#### Decision: **Hybrid（Redis Cluster + CDN）** ✅

#### Rationale
1. **Redis Cluster**: 用於 Session, 商品詳情快取（TTL 5 min）, 分散式鎖
2. **CDN（CloudFront）**: 用於圖片（商品圖）, CSS, JS（減少 80% 延遲）

#### Cache Strategy（快取策略）
| Data Type | TTL | Eviction Policy | Invalidation |
|-----------|-----|----------------|--------------|
| Session | 30 min | LRU | 登出時 DELETE |
| 商品詳情 | 5 min | LRU | 商品更新時 DELETE |
| 商品列表 | 1 min | LRU | 商品新增時 FLUSH |
| 靜態資源 | 1 year | - | 檔名加 Hash（Cache Busting） |

#### Consequences
- ✅ Pros: 延遲低（Redis P95 < 5ms）, 命中率高（> 80%）
- ❌ Cons: 成本增加（Redis $0.1/GB/hour = $720/month@300GB）

#### Monitoring
- Cache Hit Rate: Redis > 80%, CDN > 95%
- Cache Latency: Redis P95 < 5ms, CDN P95 < 50ms（全球）

---

### ADR-007: Search Engine - Elasticsearch vs PostgreSQL Full-Text vs Algolia ✅

#### Context
搜尋需支援：
- 中文分詞（「蘋果手機」→ iPhone）
- Autocomplete（延遲 < 100ms）
- Fuzzy Search（容錯搜尋「蘋果」→「蘋果」）
- 100K+ SKUs 全文搜尋

#### Options Considered
| Option | Pros | Cons | Score |
|--------|------|------|-------|
| **Elasticsearch 8.11** | 中文分詞（IK Analyzer）, 強大聚合 | Ops 負擔, 記憶體貴 | **9/10** |
| PostgreSQL Full-Text | 簡單, 成本低 | 中文分詞差, 效能差 | 5/10 |
| Algolia | Managed, 延遲低 | 成本高（$1/1K searches = $100K/月@100M searches） | 7/10 |

#### Decision: **Elasticsearch 8.11** ✅

#### Rationale
1. **中文分詞**: IK Analyzer（`ik_max_word` 模式）+ Synonym 字典（「手機」→「智慧型手機」）
2. **Performance**: P95 < 200ms（vs PostgreSQL Full-Text P95 > 1s）
3. **Cost**: 開源免費（vs Algolia $100K/月）

#### Index Strategy（索引策略）
```json
{
  "settings": {
    "analysis": {
      "analyzer": {
        "ik_analyzer": {
          "type": "custom",
          "tokenizer": "ik_max_word",
          "filter": ["synonym"]
        }
      },
      "filter": {
        "synonym": {
          "type": "synonym",
          "synonyms": ["手機, 智慧型手機", "蘋果, Apple"]
        }
      }
    }
  },
  "mappings": {
    "properties": {
      "name": {"type": "text", "analyzer": "ik_analyzer"},
      "description": {"type": "text", "analyzer": "ik_analyzer"},
      "category": {"type": "keyword"}
    }
  }
}
```

#### Consequences
- ✅ Pros: 中文分詞準確、搜尋快速、功能強大
- ❌ Cons: Ops 負擔（需維護 Elasticsearch Cluster）、記憶體貴（$0.1/GB/hour）

#### Monitoring
- Search Latency: P95 < 200ms
- Index Sync Lag: < 5s（Eventual Consistency）

---

### ADR-008: Distributed Transaction - Saga Pattern vs 2PC vs Eventually Consistent ✅

#### Context
訂單建立需協調：
- 庫存扣減（Inventory Service）
- 訂單建立（Order Service）
- 支付處理（Payment Service）
- 需保證一致性（要麼全成功，要麼全回復）

#### Options Considered
| Option | Pros | Cons | Score |
|--------|------|------|-------|
| **Saga Pattern** | 可擴展, 無鎖, 補償機制 | 複雜度高, 最終一致性 | **9/10** |
| **2PC（兩階段提交）** | 強一致性 | 阻塞, 效能差, 單點故障 | 4/10 |
| **Eventually Consistent** | 簡單, 高效能 | 無補償機制（資料可能不一致） | 6/10 |

#### Decision: **Saga Pattern（Orchestration-based）** ✅

#### Saga Flow（訂單建立 Saga）
```
Step 1: Reserve Inventory（扣減庫存）
  → Success → Step 2
  → Failure → Compensate: N/A（無需補償）

Step 2: Create Order（建立訂單）
  → Success → Step 3
  → Failure → Compensate: Release Inventory（回復庫存）

Step 3: Payment（付款）
  → Success → End（完成）
  → Failure → Compensate: Cancel Order + Release Inventory
```

#### Saga State Table（追蹤 Saga 狀態）
```sql
CREATE TABLE saga_state (
  saga_id UUID PRIMARY KEY,
  saga_type VARCHAR(50),  -- 'order_creation'
  current_step INT,        -- 1, 2, 3
  status VARCHAR(20),      -- 'running', 'success', 'compensating', 'failed'
  payload JSONB,           -- Saga 執行資料
  created_at TIMESTAMP,
  updated_at TIMESTAMP
);
```

#### Rationale
1. **Scalability**: 無鎖（vs 2PC 阻塞）→ 支援 1000+ orders/sec
2. **Resilience**: 補償機制 → 任一步驟失敗自動回復
3. **Observability**: saga_state table 追蹤所有 Saga 執行狀態

#### Consequences
- ✅ Pros: 可擴展、無鎖、補償機制完整
- ❌ Cons: 複雜度高（需開發 Saga Orchestrator）、最終一致性（1-5s 延遲）

#### Monitoring
- Saga Success Rate: > 99%
- Saga Compensation Rate: < 1%（理想情況）
- Saga Duration: P95 < 2s

---

### ADR-009: Authentication - JWT vs Session vs OAuth2 ✅ JWT

#### Context
認證需支援：
- 無狀態（Stateless）→ 支援水平擴展
- 跨服務認證（User Service → Order Service）
- Token 過期控制（15 min Access Token + 30 day Refresh Token）

#### Options Considered
| Option | Pros | Cons | Score |
|--------|------|------|-------|
| **JWT（JSON Web Token）** | 無狀態, 跨服務, 簡單 | Token 無法撤銷（需 Blacklist） | **9/10** |
| **Session（Cookie）** | 可撤銷, 安全 | 有狀態（需 Session Store）, 不支援跨域 | 6/10 |
| **OAuth2（第三方）** | 標準協議, 安全 | 複雜度高, 需 Authorization Server | 7/10 |

#### Decision: **JWT（Access Token + Refresh Token）** ✅

#### JWT Payload（Token 內容）
```json
{
  "user_id": "uuid",
  "email": "user@example.com",
  "roles": ["customer", "admin"],
  "exp": 1704067200,  // Expiration: 15 min
  "iat": 1704066300   // Issued At
}
```

#### Token Strategy（Token 策略）
| Token Type | Expiry | Storage | Use Case |
|------------|--------|---------|----------|
| **Access Token** | 15 min | LocalStorage（或 Memory） | API 請求（Authorization Header） |
| **Refresh Token** | 30 days | HttpOnly Cookie（Secure + SameSite） | 刷新 Access Token |

#### Token Revocation（Token 撤銷）
使用 **Redis Blacklist**：
```redis
# 用戶登出 → 加入 Blacklist
SETEX blacklist:{token_id} 900 "revoked"  # TTL = Access Token TTL

# API Gateway 檢查 Blacklist
EXISTS blacklist:{token_id}  # 存在 → 拒絕請求
```

#### Consequences
- ✅ Pros: 無狀態、跨服務、水平擴展
- ❌ Cons: Token 撤銷需 Redis Blacklist（增加延遲）、Token 洩漏風險（需 HTTPS）

#### Monitoring
- Token Validation Latency: P95 < 10ms（Redis Blacklist Check）
- Token Expiry Rate: < 1%（用戶需重新登入）

---

### ADR-010: Infrastructure - AWS ECS Fargate vs Kubernetes vs EC2 ✅

#### Context
基礎設施需支援：
- 自動擴展（1000+ RPS 尖峰）
- Managed Service（降低 Ops 負擔）
- 成本優化（按需擴展）

#### Options Considered
| Option | Pros | Cons | Score |
|--------|------|------|-------|
| **AWS ECS Fargate** | Serverless Container, 自動擴展, Managed | 成本高（vs EC2 +30%） | **9/10** |
| **Kubernetes（EKS）** | 功能強大, 生態豐富 | Ops 負擔高, 學習曲線陡 | 7/10 |
| **EC2 Instances** | 成本低, 完全控制 | Ops 負擔高, 需自行管理 Auto Scaling | 6/10 |

#### Decision: **AWS ECS Fargate** ✅

#### ECS Service Configuration（ECS 服務配置）
```yaml
service:
  name: user-service
  cluster: ecommerce-cluster
  launch_type: FARGATE
  desired_count: 5  # 初始 5 個 Task
  task_definition: user-service:1
  
  auto_scaling:
    min_capacity: 2   # 最少 2 個 Task
    max_capacity: 50  # 最多 50 個 Task
    target_cpu: 70%   # CPU > 70% → Scale Out
    target_memory: 80%  # Memory > 80% → Scale Out
    
  load_balancer:
    type: application
    target_group: user-service-tg
    health_check: /health
```

#### Cost Comparison（成本比較）
| Option | vCPU | Memory | Cost/hour | Cost/month@100 Tasks |
|--------|------|--------|-----------|---------------------|
| **Fargate** | 0.25 vCPU | 0.5 GB | $0.01225 | **$3,675** |
| **EC2 t3.small** | 2 vCPU | 2 GB | $0.0208 | $2,496（需自行管理） |

**Decision Rationale**: 
- Fargate 雖成本高 30%，但無需 Ops（省下 1 個 DevOps 工程師 = $8K/month）
- **Net Savings**: $8K - $1.2K = **$6.8K/month**

#### Consequences
- ✅ Pros: Serverless（無需管理伺服器）、自動擴展、Managed Service
- ❌ Cons: 成本高 30%（vs EC2）、AWS 綁定風險（可改用 EKS）

#### Monitoring
- Task Health: > 95%（健康 Task 比例）
- Auto Scaling: Trigger < 5 min（Scale Out 時間）

---

## 🔒 Security Architecture（安全架構）

### Defense in Depth（多層防禦）

```mermaid
graph TD
    subgraph Layer 7: Application
    A1[Input Validation]
    A2[SQL Injection Prevention]
    A3[XSS Prevention]
    end
    
    subgraph Layer 6: Authentication
    B1[JWT Token]
    B2[Refresh Token]
    B3[2FA（Optional）]
    end
    
    subgraph Layer 5: Authorization
    C1[RBAC]
    C2[API Rate Limiting]
    C3[IP Whitelist]
    end
    
    subgraph Layer 4: API Gateway
    D1[Kong JWT Plugin]
    D2[Rate Limiting 1000 RPS/IP]
    D3[API Analytics]
    end
    
    subgraph Layer 3: Network
    E1[VPC Isolation]
    E2[Security Groups]
    E3[WAF]
    end
    
    subgraph Layer 2: Transport
    F1[TLS 1.3]
    F2[HTTPS Only]
    F3[Certificate Rotation]
    end
    
    subgraph Layer 1: Data
    G1[Encryption at Rest（AES-256）]
    G2[bcrypt Password Hashing]
    G3[PII Masking]
    end
    
    A1 --> B1
    B1 --> C1
    C1 --> D1
    D1 --> E1
    E1 --> F1
    F1 --> G1
```

### OWASP Top 10 Mitigation（OWASP 十大漏洞防護）

| OWASP Risk | Mitigation Strategy | Implementation |
|-----------|-------------------|----------------|
| **#1 Injection** | Parameterized Queries | PostgreSQL Prepared Statements |
| **#2 Broken Authentication** | JWT + Refresh Token + bcrypt cost 12 | User Service |
| **#3 Sensitive Data Exposure** | Encryption at Rest（AES-256）+ HTTPS | All Services |
| **#4 XML External Entities** | Disable XML Parsing | N/A（使用 JSON） |
| **#5 Broken Access Control** | RBAC + API Rate Limiting | Kong Gateway |
| **#6 Security Misconfiguration** | Infrastructure as Code（Terraform） | CI/CD Pipeline |
| **#7 XSS** | Content Security Policy（CSP） | Next.js Middleware |
| **#8 Insecure Deserialization** | JSON Schema Validation | All Services |
| **#9 Known Vulnerabilities** | Dependabot + Snyk Scanning | GitHub Actions |
| **#10 Insufficient Logging** | Distributed Tracing（Jaeger） | All Services |

### PCI DSS Level 1 Compliance（PCI DSS 合規性）

#### Requirement 1-2: Network Security
- ✅ VPC Isolation（Payment Service 獨立 VPC）
- ✅ Security Groups（只開放必要 Port）
- ✅ WAF（防 SQL Injection, XSS）

#### Requirement 3-4: Data Protection
- ✅ Encryption at Rest（AES-256）
- ✅ Encryption in Transit（TLS 1.3）
- ✅ PII Masking（信用卡號僅顯示後 4 碼）

#### Requirement 5-6: Vulnerability Management
- ✅ Dependabot（自動更新依賴）
- ✅ Snyk Scanning（掃描已知漏洞）
- ✅ Penetration Test（每季一次）

#### Requirement 7-8: Access Control
- ✅ RBAC（Role-Based Access Control）
- ✅ MFA（Multi-Factor Authentication，Admin 必須）
- ✅ Audit Log（所有支付操作記錄）

#### Requirement 9-12: Physical Security + Monitoring
- ✅ AWS Data Center（Physical Security by AWS）
- ✅ Distributed Tracing（Jaeger，追蹤所有請求）
- ✅ Real-time Monitoring（Datadog，異常告警）

---

## 📈 Scalability Architecture（可擴展性架構）

### Horizontal Scaling Strategy（水平擴展策略）

#### Auto Scaling Rules（自動擴展規則）
| Service | Min Tasks | Max Tasks | Scale Out Trigger | Scale In Trigger |
|---------|-----------|-----------|-------------------|------------------|
| User Service | 2 | 20 | CPU > 70% or Memory > 80% | CPU < 30% for 10 min |
| Product Service | 3 | 30 | RPS > 1000/Task | RPS < 300/Task for 10 min |
| Order Service | 5 | 50 | RPS > 500/Task（訂單高峰） | RPS < 100/Task for 10 min |
| Payment Service | 5 | 50 | RPS > 200/Task（支付高峰） | RPS < 50/Task for 10 min |
| Inventory Service | 3 | 30 | CPU > 80%（分散式鎖競爭） | CPU < 40% for 10 min |

#### Database Sharding Strategy（資料庫分片策略）

##### User & Order Sharding（by user_id）
```sql
-- Shard 0-9（10 個 Shard）
SELECT shard_id FROM users WHERE user_id % 10 = ?

-- Example: user_id = '123e4567-e89b-12d3-a456-426614174000'
-- hash(user_id) % 10 = 7 → Shard 7
```

**Pros**:
- ✅ 均勻分佈（Hash Function 保證）
- ✅ 避免跨片 JOIN（User + Order 同分片）

**Cons**:
- ❌ 無法依 user_id 範圍查詢（需查詢所有 Shard）

##### Product Sharding（by category_id）
```sql
-- Shard 0-4（5 個 Shard）
SELECT shard_id FROM products WHERE category_id % 5 = ?

-- Example: category_id = 'electronics'
-- hash('electronics') % 5 = 2 → Shard 2
```

**Pros**:
- ✅ 相同類別商品在同一 Shard（查詢快）
- ✅ 熱門類別可單獨擴展（例如：3C 類別 → Shard 2 → 升級至 db.r6g.4xlarge）

**Cons**:
- ❌ 類別分佈不均勻（電子產品 SKU 多，食品 SKU 少）

#### CDN Strategy（CDN 策略）

##### Cache Rules（快取規則）
| Asset Type | TTL | Cache-Control | Invalidation |
|-----------|-----|---------------|--------------|
| Product Images | 1 year | `max-age=31536000, immutable` | 檔名加 Hash（`product-123-abc456.jpg`） |
| CSS/JS Bundles | 1 year | `max-age=31536000, immutable` | Next.js 自動加 Hash |
| API Responses | 0 | `no-cache` | N/A（不快取） |
| Static HTML | 1 min | `max-age=60, s-maxage=60` | 商品更新時 Purge |

##### CDN Cost Optimization（CDN 成本優化）
```
假設：
- 商品圖片：10K SKUs × 5 images/SKU × 500KB/image = 25GB
- CSS/JS：10MB
- 月流量：100K DAU × 20 pages/day × 30 days = 60M requests

CloudFront Cost:
- Data Transfer: 25GB × 60M / 10K = 150TB × $0.085/GB = $12,750/month
- Requests: 60M × $0.0075/10K = $45/month
- Total: $12,795/month

vs Origin（ECS Fargate）:
- Data Transfer: 150TB × $0.09/GB = $13,500/month
- Compute: 150TB / 100MB/s / 3600s = 417 Task-hours × $0.01225/hour = $5/month
- Total: $13,505/month

**Savings**: $13,505 - $12,795 = **$710/month**（+ 80% 延遲減少）
```

---

## 📊 Observability Architecture（可觀測性架構）

### Distributed Tracing（分散式追蹤）

```mermaid
sequenceDiagram
    participant User
    participant APIGateway
    participant UserService
    participant OrderService
    participant PaymentService
    participant Kafka
    participant Jaeger
    
    User->>APIGateway: POST /orders（Trace ID: abc123）
    APIGateway->>UserService: GET /users/{id}（Trace ID: abc123, Span ID: span1）
    UserService->>Jaeger: Span: UserService GET /users/{id}（100ms）
    UserService->>APIGateway: 200 OK
    
    APIGateway->>OrderService: POST /orders（Trace ID: abc123, Span ID: span2）
    OrderService->>Kafka: Publish order.created（Trace ID: abc123, Span ID: span3）
    Kafka->>Jaeger: Span: Kafka Publish（50ms）
    OrderService->>PaymentService: POST /payments（Trace ID: abc123, Span ID: span4）
    PaymentService->>Jaeger: Span: PaymentService POST /payments（200ms）
    PaymentService->>OrderService: 200 OK
    OrderService->>Jaeger: Span: OrderService POST /orders（500ms）
    OrderService->>APIGateway: 201 Created
    APIGateway->>User: 201 Created
    
    Jaeger->>Jaeger: 彙整 Trace: abc123（Total: 850ms）
```

#### Jaeger Configuration（Jaeger 配置）
```yaml
# docker-compose.yml
jaeger:
  image: jaegertracing/all-in-one:1.50
  environment:
    COLLECTOR_ZIPKIN_HOST_PORT: :9411
    SPAN_STORAGE_TYPE: elasticsearch
  ports:
    - "5775:5775/udp"  # Jaeger Agent
    - "16686:16686"     # Jaeger UI
```

#### OpenTelemetry Instrumentation（OpenTelemetry 埋點）
```javascript
// Node.js Service
const { NodeTracerProvider } = require('@opentelemetry/sdk-trace-node');
const { JaegerExporter } = require('@opentelemetry/exporter-jaeger');

const provider = new NodeTracerProvider();
const exporter = new JaegerExporter({
  serviceName: 'order-service',
  endpoint: 'http://jaeger:14268/api/traces'
});

provider.addSpanProcessor(new BatchSpanProcessor(exporter));
provider.register();
```

### Metrics & Monitoring（指標與監控）

#### Key Metrics（關鍵指標）
| Metric | Target | Monitoring Tool | Alert Threshold |
|--------|--------|----------------|-----------------|
| **API Latency（P95）** | < 200ms | Datadog | > 500ms for 5 min |
| **Error Rate** | < 0.1% | Datadog | > 1% for 1 min |
| **Availability** | 99.95% | Datadog | < 99.9% for 1 hour |
| **Cache Hit Rate** | > 80% | Redis Metrics | < 70% for 10 min |
| **Saga Success Rate** | > 99% | Custom Metric | < 98% for 5 min |
| **Database Query Time** | < 50ms | PostgreSQL Metrics | > 100ms for 5 min |
| **Kafka Lag** | < 100 messages | Kafka Metrics | > 1000 messages |

#### Datadog Dashboard（Datadog 儀表板）
```yaml
# datadog-dashboard.json
{
  "title": "E-Commerce Platform Dashboard",
  "widgets": [
    {
      "definition": {
        "type": "timeseries",
        "requests": [
          {"q": "avg:api.latency{service:order-service}", "display_type": "line"}
        ],
        "title": "Order Service Latency（P95）"
      }
    },
    {
      "definition": {
        "type": "query_value",
        "requests": [
          {"q": "sum:api.error{service:*}", "aggregator": "avg"}
        ],
        "title": "Total Error Rate"
      }
    }
  ]
}
```

### Logging Strategy（日誌策略）

#### Log Levels（日誌等級）
| Level | Use Case | Example |
|-------|----------|---------|
| **ERROR** | 錯誤需要立即處理 | `Payment API 500 Error` |
| **WARN** | 異常但不影響功能 | `Cache Miss Rate > 30%` |
| **INFO** | 正常業務流程 | `Order Created: order_id=123` |
| **DEBUG** | 除錯資訊 | `SQL Query: SELECT * FROM users WHERE id=?` |

#### Structured Logging（結構化日誌）
```json
{
  "timestamp": "2026-01-31T10:30:00Z",
  "level": "ERROR",
  "service": "order-service",
  "trace_id": "abc123",
  "span_id": "span2",
  "message": "Saga compensation failed",
  "error": {
    "type": "PaymentError",
    "message": "Stripe API timeout",
    "stack": "..."
  },
  "context": {
    "order_id": "order-456",
    "user_id": "user-789"
  }
}
```

#### Log Aggregation（日誌彙整）
```
ECS Fargate Task → CloudWatch Logs → Lambda（Filter） → Elasticsearch → Kibana（視覺化）
```

---

## 🛡️ Disaster Recovery & Backup（災難恢復與備份）

### Backup Strategy（備份策略）

#### Database Backup（資料庫備份）
| Database | Backup Type | Frequency | Retention | RTO | RPO |
|----------|------------|-----------|-----------|-----|-----|
| **PostgreSQL** | Automated Snapshot | Daily | 30 days | < 15 min | < 5 min |
| **PostgreSQL** | Manual Snapshot | Before Major Release | 90 days | < 30 min | 0 |
| **Redis** | RDB + AOF | Hourly | 7 days | < 5 min | < 1 hour |
| **MongoDB** | Automated Snapshot | Daily | 30 days | < 15 min | < 5 min |

#### Application Backup（應用程式備份）
- **Docker Images**: ECR（Elastic Container Registry）保留最近 30 個版本
- **Configuration**: Git Repository（Infrastructure as Code）
- **Secrets**: AWS Secrets Manager（自動輪替 90 天）

### Multi-AZ Deployment（多可用區部署）

```mermaid
graph TD
    subgraph AZ-A（us-east-1a）
    A1[ECS Task 1-5]
    A2[PostgreSQL Primary]
    A3[Redis Master 1]
    end
    
    subgraph AZ-B（us-east-1b）
    B1[ECS Task 6-10]
    B2[PostgreSQL Replica]
    B3[Redis Master 2]
    end
    
    subgraph AZ-C（us-east-1c）
    C1[ECS Task 11-15]
    C2[PostgreSQL Replica]
    C3[Redis Master 3]
    end
    
    ALB[Application Load Balancer]
    ALB --> A1
    ALB --> B1
    ALB --> C1
    
    A2 -->|Streaming Replication| B2
    A2 -->|Streaming Replication| C2
    
    A3 -->|Replication| B3
    A3 -->|Replication| C3
```

#### Failover Strategy（故障切換策略）
| Component | Failure | Failover Time | Action |
|-----------|---------|---------------|--------|
| **ECS Task** | Task 崩潰 | < 30s | ECS 自動重啟新 Task |
| **PostgreSQL Primary** | Primary 故障 | < 5s | RDS 自動切換至 Replica（Multi-AZ） |
| **Redis Master** | Master 故障 | < 10s | Redis Sentinel 自動切換至 Slave |
| **Entire AZ** | AZ 停機 | < 1 min | ALB 自動路由至其他 AZ |

---

## 📝 env.md Configuration（環境配置）

### Development Environment（開發環境）
```bash
# .env.development
NODE_ENV=development
API_URL=http://localhost:3000
DATABASE_URL=postgresql://user:pass@localhost:5432/ecommerce_dev
REDIS_URL=redis://localhost:6379
ELASTICSEARCH_URL=http://localhost:9200
KAFKA_BROKERS=localhost:9092

# JWT Secret（開發用，生產需替換）
JWT_SECRET=dev-secret-change-me-in-production
JWT_ACCESS_EXPIRY=15m
JWT_REFRESH_EXPIRY=30d

# Stripe（測試 Key）
STRIPE_PUBLIC_KEY=pk_test_...
STRIPE_SECRET_KEY=sk_test_...
```

### Staging Environment（測試環境）
```bash
# .env.staging
NODE_ENV=staging
API_URL=https://api-staging.example.com
DATABASE_URL=postgresql://user:pass@staging-db.rds.amazonaws.com:5432/ecommerce_staging
REDIS_URL=redis://staging-redis.elasticache.amazonaws.com:6379
ELASTICSEARCH_URL=https://staging-es.amazonaws.com:443
KAFKA_BROKERS=staging-kafka-1:9092,staging-kafka-2:9092,staging-kafka-3:9092

# JWT Secret（使用 AWS Secrets Manager）
JWT_SECRET={{ resolve:secretsmanager:staging/jwt-secret }}
JWT_ACCESS_EXPIRY=15m
JWT_REFRESH_EXPIRY=30d

# Stripe（測試 Key）
STRIPE_PUBLIC_KEY=pk_test_...
STRIPE_SECRET_KEY=sk_test_...
```

### Production Environment（生產環境）
```bash
# .env.production
NODE_ENV=production
API_URL=https://api.example.com
DATABASE_URL={{ resolve:secretsmanager:production/database-url }}
REDIS_URL={{ resolve:secretsmanager:production/redis-url }}
ELASTICSEARCH_URL={{ resolve:secretsmanager:production/elasticsearch-url }}
KAFKA_BROKERS={{ resolve:secretsmanager:production/kafka-brokers }}

# JWT Secret（使用 AWS Secrets Manager + 自動輪替 90 天）
JWT_SECRET={{ resolve:secretsmanager:production/jwt-secret }}
JWT_ACCESS_EXPIRY=15m
JWT_REFRESH_EXPIRY=30d

# Stripe（生產 Key）
STRIPE_PUBLIC_KEY={{ resolve:secretsmanager:production/stripe-public-key }}
STRIPE_SECRET_KEY={{ resolve:secretsmanager:production/stripe-secret-key }}

# PCI DSS Compliance
PCI_DSS_MODE=enabled
ENCRYPTION_AT_REST=enabled
TLS_VERSION=1.3
```

---

## 📚 Appendix: Component Diagrams（附錄：元件圖）

### Component Diagram - User Service（用戶服務元件圖）

```mermaid
graph LR
    subgraph User Service
    API[REST API]
    Auth[Auth Controller]
    User[User Controller]
    Repo[User Repository]
    Cache[Redis Cache]
    end
    
    APIGateway[API Gateway] --> API
    API --> Auth
    API --> User
    Auth --> Repo
    User --> Repo
    Repo --> PostgreSQL[PostgreSQL]
    User --> Cache
    Cache --> Redis[Redis Cluster]
```

### Sequence Diagram - Order Creation（訂單建立流程圖）

```mermaid
sequenceDiagram
    participant User
    participant APIGateway
    participant OrderService
    participant InventoryService
    participant PaymentService
    participant Kafka
    
    User->>APIGateway: POST /orders
    APIGateway->>OrderService: Create Order（Saga Start）
    
    rect rgb(200, 255, 200)
    Note over OrderService,InventoryService: Step 1: Reserve Inventory
    OrderService->>InventoryService: POST /inventory/reserve
    InventoryService->>InventoryService: Check Stock（Redis Lock）
    InventoryService->>OrderService: 200 OK（Reserved）
    end
    
    rect rgb(200, 255, 200)
    Note over OrderService: Step 2: Create Order
    OrderService->>OrderService: INSERT INTO orders
    OrderService->>Kafka: Publish order.created
    end
    
    rect rgb(200, 255, 200)
    Note over OrderService,PaymentService: Step 3: Payment
    OrderService->>PaymentService: POST /payments
    PaymentService->>PaymentService: Call Stripe API
    PaymentService->>OrderService: 200 OK（Paid）
    end
    
    OrderService->>APIGateway: 201 Created
    APIGateway->>User: 201 Created
    
    Note over OrderService,PaymentService: 若 Step 3 失敗 → Compensate: Cancel Order + Release Inventory
```

---

## 🎯 Conclusion（結論）

### Architecture Summary（架構總結）
本架構設計採用 **Microservices + Event-Driven** 風格，支援：
- ✅ **高流量**：100K+ DAU, 1000+ orders/sec（尖峰）
- ✅ **高可用**：99.95% uptime, Multi-AZ 部署
- ✅ **可擴展**：水平擴展（ECS Auto Scaling）, 資料庫分片（10 Shards）
- ✅ **安全性**：Defense in Depth, OWASP Top 10, PCI DSS Level 1
- ✅ **可觀測**：Distributed Tracing（Jaeger）, Real-time Monitoring（Datadog）

### Trade-Offs Accepted（接受的取捨）
| Trade-Off | Gain | Loss |
|-----------|------|------|
| **Microservices** | 可擴展性、技術多樣性 | 複雜度增加、資料一致性挑戰 |
| **Saga Pattern** | 無鎖、可擴展 | 最終一致性（1-5s 延遲） |
| **JWT** | 無狀態、跨服務 | Token 撤銷需 Redis Blacklist |
| **ECS Fargate** | Serverless、自動擴展 | 成本高 30%（vs EC2） |
| **Hybrid Database** | ACID + 彈性 Schema | Ops 複雜度增加（3 種 DB） |

### Success Criteria（成功標準）
| Metric | Target | Measurement |
|--------|--------|-------------|
| **API Latency（P95）** | < 200ms | Datadog |
| **Error Rate** | < 0.1% | Datadog |
| **Availability** | 99.95% | Datadog |
| **Scalability** | 支援 10x 流量（1M DAU） | Load Test |
| **Security** | OWASP Top 10 全覆蓋 | Penetration Test |
| **Cost** | < $20K/month@100K DAU | AWS Cost Explorer |

---

**Document Version**: V1.0  
**Author**: System Architect  
**Last Updated**: 2026-01-31  
**Next Review**: 2026-02-28（架構檢討會議）

---

**📋 Change Log**
| Date | Version | Changes | Author |
|------|---------|---------|--------|
| 2026-01-31 | V1.0 | Initial architecture design | System Architect |
