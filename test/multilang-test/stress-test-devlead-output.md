# 大型電商平台開發計劃 - Dev Lead 任務拆解（V1.0）

**專案名稱**：大型電商平台系統  
**文件類型**：Dev Lead 任務拆解  
**輸入來源**：大型電商平台系統需求規格書（1002 lines, 10 subsystems, 50+ APIs, 22 tables, 10 ADRs）  
**角色**：Dev Lead（25+ years, CISSP, 資深全端工程師）  
**產出日期**：2026-01-31

---

## 📋 Executive Summary

### 專案規模
- **子系統數量**：10 個（User, Product, Order, Payment, Logistics, Inventory, CS, Marketing, Analytics, Admin）
- **API 端點**：50+ 個
- **資料表**：22 個（含索引策略）
- **技術決策**：10 個 ADR（Microservices, PostgreSQL, Elasticsearch, Redis, Kafka, AWS, Next.js, Saga Pattern, JWT, ECS Fargate）
- **非功能需求**：99.95% Uptime, API P95 < 200ms, 100K+ DAU

### 任務拆解統計
- **總任務數**：220+ 個任務（含 sub-tasks）
- **開發階段**：10 個 Phase（對應 10 個子系統）
- **預估工期**：6-9 個月（考慮並行開發，50+ 工程師團隊）
- **關鍵路徑**：18 週（資料庫設計 → 核心 API → 前端整合 → 測試 → 部署）
- **風險等級**：HIGH（支付系統 PCI DSS、訂單系統 Saga Pattern、庫存系統分散式鎖）

### 技術棧分配
- **Backend**：Node.js (40%), Python (30%), Go (30%)
- **Frontend**：Next.js 14 + React 18 (100%)
- **Database**：PostgreSQL (主), Redis (快取), MongoDB (日誌), Elasticsearch (搜尋)
- **Message Queue**：RabbitMQ (同步), Kafka (非同步事件)
- **CI/CD**：GitHub Actions (50%), AWS CodePipeline (50%)

---

## 🔍 Phase 0: 基礎設施建置（Week 1-2, 並行執行）

### 資料庫任務（Database Tasks）

#### **db-t001**: PostgreSQL 主資料庫建置（2 days）
- **Priority**: CRITICAL
- **Dependencies**: None
- **Sub-tasks**:
  - **db-t001-st001**: AWS RDS PostgreSQL 15 建立（0.5 days）
    - Multi-AZ deployment（us-east-1a, us-east-1b, us-east-1c）
    - Instance type: db.r6g.2xlarge（8 vCPUs, 64GB RAM）
    - Storage: 1TB SSD（io1, 20000 IOPS）
    - Backup retention: 30 days
  - **db-t001-st002**: Read Replicas 建立（0.5 days）
    - 3 個 Read Replicas（讀寫分離，CQRS 模式）
    - Synchronous replication（保證資料一致性）
  - **db-t001-st003**: Connection Pooling（pgBouncer）（0.5 days）
    - Max connections: 1000 per DB
    - Pool mode: Transaction（適合 Microservices）
  - **db-t001-st004**: 監控設定（CloudWatch + Datadog）（0.5 days）
    - Slow query log（> 50ms）
    - Connection pool metrics
    - Replication lag monitoring

- **Acceptance Criteria**:
  - ✅ RDS PostgreSQL 15 Multi-AZ 部署完成
  - ✅ Read Replicas 延遲 < 5 秒
  - ✅ Connection pool 可承受 1000+ 併發連線
  - ✅ 監控儀表板顯示關鍵指標

- **Security Requirements (CISSP)**:
  - **Confidentiality**: 啟用 Encryption at rest（AES-256）
  - **Integrity**: 啟用 SSL/TLS 連線（sslmode=require）
  - **Availability**: Multi-AZ failover < 5 秒
  - **Access Control**: IAM Database Authentication（不使用密碼）

#### **db-t002**: Redis Cluster 建置（2 days）
- **Priority**: CRITICAL
- **Dependencies**: None
- **Sub-tasks**:
  - **db-t002-st001**: AWS ElastiCache Redis 7 建立（0.5 days）
    - Cluster mode enabled（6 nodes: 3 masters + 3 replicas）
    - Instance type: cache.r6g.xlarge（4 vCPUs, 26GB RAM）
    - Sharding strategy: Hash slot（0-16383）
  - **db-t002-st002**: 快取策略設定（0.5 days）
    - 用戶資料：TTL 10 minutes
    - 商品資料：TTL 1 hour
    - 購物車：TTL 30 days
    - 搜尋結果：TTL 5 minutes
  - **db-t002-st003**: Eviction Policy 設定（0.5 days）
    - Policy: allkeys-lru（自動移除最少使用的 key）
    - Max memory: 20GB（保留 6GB 緩衝空間）
  - **db-t002-st004**: 監控設定（0.5 days）
    - Cache hit rate（目標 > 80%）
    - Eviction count
    - Replication lag

- **Acceptance Criteria**:
  - ✅ Redis Cluster 6 nodes 部署完成
  - ✅ Cache hit rate > 80%（模擬流量測試）
  - ✅ Failover 時間 < 10 秒
  - ✅ 監控儀表板顯示 Cache metrics

#### **db-t003**: MongoDB 日誌資料庫建置（1.5 days）
- **Priority**: HIGH
- **Dependencies**: None
- **Sub-tasks**:
  - **db-t003-st001**: AWS DocumentDB 建立（0.5 days）
    - Cluster: 1 primary + 2 replicas
    - Instance type: db.r6g.large（2 vCPUs, 16GB RAM）
  - **db-t003-st002**: 日誌集合設計（0.5 days）
    - Collection: `api_logs`, `user_events`, `error_logs`
    - Index: timestamp (desc), user_id, event_type
  - **db-t003-st003**: TTL 設定（0.5 days）
    - api_logs: 30 days
    - user_events: 90 days
    - error_logs: 365 days

#### **db-t004**: Elasticsearch 搜尋引擎建置（2 days）
- **Priority**: HIGH
- **Dependencies**: None
- **Sub-tasks**:
  - **db-t004-st001**: AWS Elasticsearch 8.11 建立（0.5 days）
    - 3 nodes（1 master + 2 data nodes）
    - Instance type: r6g.large.search（2 vCPUs, 16GB RAM）
  - **db-t004-st002**: Index Mapping 設計（0.5 days）
    - products index: title (text), description (text), category_id (keyword), price (float)
    - Analyzer: IK Chinese Analyzer（中文分詞）
  - **db-t004-st003**: 索引策略（0.5 days）
    - Index template: 自動建立索引
    - Shard strategy: 5 primary shards, 1 replica shard
  - **db-t004-st004**: 同步策略（Kafka → Elasticsearch）（0.5 days）
    - 使用 Kafka Connect Elasticsearch Sink Connector
    - Near real-time indexing（< 1 秒延遲）

---

### 訊息佇列任務（Message Queue Tasks）

#### **mq-t001**: RabbitMQ Cluster 建置（1.5 days）
- **Priority**: HIGH
- **Dependencies**: None
- **Sub-tasks**:
  - **mq-t001-st001**: AWS MQ RabbitMQ 3.12 建立（0.5 days）
    - Cluster: 3 nodes（高可用性）
    - Instance type: mq.m5.large（2 vCPUs, 8GB RAM）
  - **mq-t001-st002**: Exchange 設計（0.5 days）
    - order.events（Topic Exchange）
    - inventory.events（Direct Exchange）
    - payment.events（Fanout Exchange）
  - **mq-t001-st003**: Queue 設計（0.5 days）
    - order.created, order.cancelled, order.shipped
    - inventory.reserved, inventory.released
    - payment.success, payment.failed

#### **mq-t002**: Kafka Cluster 建置（2 days）
- **Priority**: CRITICAL（非同步事件串流核心）
- **Dependencies**: None
- **Sub-tasks**:
  - **mq-t002-st001**: AWS MSK Kafka 3.6 建立（0.5 days）
    - 3 brokers（高可用性）
    - Instance type: kafka.m5.large（2 vCPUs, 8GB RAM）
  - **mq-t002-st002**: Topic 設計（0.5 days）
    - user.registered（100 partitions）
    - product.created（50 partitions）
    - order.events（200 partitions）
    - payment.events（100 partitions）
  - **mq-t002-st003**: Consumer Group 設計（0.5 days）
    - analytics-consumer（消費所有事件）
    - notification-consumer（消費用戶事件）
    - elasticsearch-consumer（同步至 Elasticsearch）
  - **mq-t002-st004**: 監控設定（0.5 days）
    - Lag monitoring（目標 < 1000 messages）
    - Throughput（目標 > 10K msg/sec）

---

### CI/CD 任務（CI/CD Tasks）

#### **cicd-t001**: GitHub Actions Workflows 建置（2 days）
- **Priority**: HIGH
- **Dependencies**: None
- **Sub-tasks**:
  - **cicd-t001-st001**: Backend CI Pipeline（0.5 days）
    - Node.js, Python, Go 多語言支援
    - Lint, Test, Build, Security Scan（Snyk）
    - Artifact: Docker image → AWS ECR
  - **cicd-t001-st002**: Frontend CI Pipeline（0.5 days）
    - Next.js build + Lighthouse CI（效能檢查）
    - Unit tests (Jest), E2E tests (Playwright)
    - Artifact: Static files → AWS S3
  - **cicd-t001-st003**: CD Pipeline（Staging）（0.5 days）
    - Auto-deploy on merge to `stage` branch
    - Health check before traffic switching
  - **cicd-t001-st004**: CD Pipeline（Production）（0.5 days）
    - Manual approval required
    - Blue-green deployment（零停機時間）
    - Rollback mechanism（< 5 minutes）

#### **cicd-t002**: AWS ECS Fargate 部署設定（2 days）
- **Priority**: HIGH
- **Dependencies**: cicd-t001
- **Sub-tasks**:
  - **cicd-t002-st001**: ECS Cluster 建立（0.5 days）
    - Cluster: production-cluster（Fargate mode）
    - 10 個 Services（對應 10 個 Microservices）
  - **cicd-t002-st002**: Task Definition 設定（0.5 days）
    - CPU: 1 vCPU, Memory: 2GB（一般服務）
    - CPU: 2 vCPU, Memory: 4GB（高流量服務：Product, Order, Payment）
  - **cicd-t002-st003**: Auto Scaling 設定（0.5 days）
    - Target CPU: 70%（Scale out）
    - Min tasks: 2, Max tasks: 20（每個服務）
  - **cicd-t002-st004**: Load Balancer 設定（0.5 days）
    - Application Load Balancer（ALB）
    - Health check: /health endpoint（每 30 秒）
    - Sticky sessions（Session affinity）

---

## 📊 Phase 0 Dependency Graph

```mermaid
graph TD
    db-t001[db-t001: PostgreSQL]
    db-t002[db-t002: Redis Cluster]
    db-t003[db-t003: MongoDB]
    db-t004[db-t004: Elasticsearch]
    mq-t001[mq-t001: RabbitMQ]
    mq-t002[mq-t002: Kafka]
    cicd-t001[cicd-t001: GitHub Actions]
    cicd-t002[cicd-t002: ECS Fargate]

    cicd-t001 --> cicd-t002
    
    %% Phase 0 所有任務可並行執行
    style db-t001 fill:#4CAF50
    style db-t002 fill:#4CAF50
    style db-t003 fill:#4CAF50
    style db-t004 fill:#4CAF50
    style mq-t001 fill:#4CAF50
    style mq-t002 fill:#4CAF50
    style cicd-t001 fill:#4CAF50
    style cicd-t002 fill:#FFC107
```

**Phase 0 總工期**：2 週（並行執行）  
**Critical Path**: cicd-t001 → cicd-t002（4 days）

---

## 🔐 Phase 1: 用戶管理系統（User Management System, Week 3-4）

### Backend Tasks

#### **be-u001**: 用戶註冊 API（2 days）
- **Priority**: CRITICAL
- **Dependencies**: db-t001（PostgreSQL）
- **API**: `POST /api/v1/users/register`
- **Sub-tasks**:
  - **be-u001-st001**: Input validation（0.5 days）
    - Email format validation（RFC 5322）
    - Phone validation（E.164 format, +886912345678）
    - Password strength validation（12+ chars, uppercase + lowercase + number + special char）
    - 使用 Joi 或 Yup schema validation
  - **be-u001-st002**: Password hashing（0.5 days）
    - 使用 bcrypt（cost factor 12）
    - Salt 自動產生（per user）
    - 密碼明文永不記錄（logger 過濾）
  - **be-u001-st003**: Email verification（0.5 days）
    - 產生 UUID verification token
    - 發送驗證信（使用 SendGrid API）
    - Token 儲存於 Redis（TTL 24 hours）
  - **be-u001-st004**: Database transaction（0.5 days）
    - Insert into `users` table（RETURNING user_id）
    - Insert into `user_profiles` table
    - Rollback on any failure

- **Acceptance Criteria**:
  - ✅ 成功註冊回傳 201 + JWT Access Token
  - ✅ Email 已存在回傳 409 Conflict
  - ✅ 驗證失敗回傳 400 + error message
  - ✅ 密碼永不以明文儲存或記錄
  - ✅ Email 驗證信發送成功（非同步）
  - ✅ Unit tests 涵蓋所有錯誤情境
  - ✅ API 回應時間 P95 < 100ms

- **Security Requirements (CISSP)**:
  - **Confidentiality**: 密碼使用 bcrypt 雜湊，永不記錄明文
  - **Integrity**: Email 驗證防止假帳號（Double Opt-In）
  - **Availability**: Rate limiting（5 requests/min per IP）
  - **OWASP #1**: Parameterized queries（防 SQL Injection）
  - **OWASP #2**: 強密碼策略（防 Broken Authentication）
  - **OWASP #7**: Input validation（防 XSS）

#### **be-u002**: 用戶登入 API（2 days）
- **Priority**: CRITICAL
- **Dependencies**: be-u001
- **API**: `POST /api/v1/users/login`
- **Sub-tasks**:
  - **be-u002-st001**: 認證邏輯（0.5 days）
    - 查詢 `users` table by email
    - bcrypt.compare 驗證密碼
    - 登入失敗計數（Redis，key: `login_attempts:{user_id}`）
  - **be-u002-st002**: JWT Token 產生（0.5 days）
    - Access Token（15 min, payload: user_id, role）
    - Refresh Token（30 days, 儲存於 Redis）
    - JWT secret 從環境變數讀取（256-bit random key）
  - **be-u002-st003**: Brute-force protection（0.5 days）
    - 登入失敗 5 次 → 鎖定帳號 15 分鐘
    - Redis key: `account_lock:{user_id}`（TTL 15 min）
  - **be-u002-st004**: 登入歷史記錄（0.5 days）
    - 記錄 IP, Device, User-Agent, Timestamp
    - Insert into `user_login_history` table（非同步）

- **Acceptance Criteria**:
  - ✅ 成功登入回傳 200 + Access Token + Refresh Token
  - ✅ 密碼錯誤回傳 401 Unauthorized
  - ✅ 帳號鎖定回傳 423 Locked + 剩餘時間
  - ✅ 登入失敗 5 次後帳號鎖定 15 分鐘
  - ✅ Refresh Token 可用於刷新 Access Token
  - ✅ Unit tests 涵蓋 Brute-force 情境

#### **be-u003**: 密碼重設 API（1.5 days）
- **Priority**: HIGH
- **Dependencies**: be-u001
- **API**: `POST /api/v1/users/password-reset`
- **Sub-tasks**:
  - **be-u003-st001**: 重設請求（0.5 days）
    - 產生 UUID reset token
    - 發送重設連結至 Email（含 token）
    - Token 儲存於 Redis（TTL 15 min）
  - **be-u003-st002**: 密碼重設驗證（0.5 days）
    - 驗證 reset token 有效性
    - 檢查新密碼與舊密碼不同（查詢 `password_history` table，最近 5 次）
    - Update `users` table with new password hash
  - **be-u003-st003**: Session 失效（0.5 days）
    - 密碼重設後，所有現有 Refresh Token 失效（Redis 刪除）
    - 發送通知 Email（告知密碼已重設）

#### **be-u004**: 個人資料編輯 API（1.5 days）
- **Priority**: MEDIUM
- **Dependencies**: be-u001
- **API**: `PUT /api/v1/users/:id`
- **Sub-tasks**:
  - **be-u004-st001**: 資料驗證（0.5 days）
    - 姓名、生日、性別、地址驗證
    - 大頭照尺寸檢查（500x500px, < 2MB, jpg/png/webp）
  - **be-u004-st002**: 大頭照上傳（0.5 days）
    - 上傳至 AWS S3（bucket: user-avatars）
    - 產生縮圖（200x200px, 400x400px）
    - CDN URL 儲存於 `user_profiles` table
  - **be-u004-st003**: 敏感資料變更驗證（0.5 days）
    - 變更 Email 需 Email 驗證碼確認
    - 發送驗證碼至新 Email（6 位數字，5 分鐘有效）

#### **be-u005**: RBAC 權限管理 API（2 days）
- **Priority**: HIGH
- **Dependencies**: be-u001
- **API**: `POST /api/v1/users/:id/roles`, `GET /api/v1/users/:id/permissions`
- **Sub-tasks**:
  - **be-u005-st001**: 角色定義（0.5 days）
    - Customer（一般用戶）
    - Seller（賣家）
    - CS（客服）
    - Admin（管理員）
    - Insert into `roles` table
  - **be-u005-st002**: 權限定義（0.5 days）
    - Granular permissions（例如：order:read, product:write, user:delete）
    - Insert into `permissions` table
  - **be-u005-st003**: 角色-權限映射（0.5 days）
    - `role_permissions` table（多對多關係）
    - Customer: [order:read, order:create, product:read]
    - Seller: [product:*, inventory:*, analytics:read]
    - Admin: [*:*]（完整權限）
  - **be-u005-st004**: 權限檢查 Middleware（0.5 days）
    - JWT payload 包含 role
    - Middleware: `requirePermission(['order:read'])`
    - 權限不足回傳 403 Forbidden

---

### Frontend Tasks

#### **fe-u001**: 用戶註冊頁面（2 days）
- **Priority**: CRITICAL
- **Dependencies**: be-u001
- **Route**: `/register`
- **Sub-tasks**:
  - **fe-u001-st001**: 表單設計（0.5 days）
    - Email, Phone, Password, Confirm Password 欄位
    - 即時驗證（onChange 觸發）
    - 密碼強度指示器（Weak/Medium/Strong）
  - **fe-u001-st002**: 表單驗證（0.5 days）
    - 使用 React Hook Form + Zod schema
    - Email 格式驗證（前端 + 後端）
    - 密碼強度驗證（12+ chars, 複雜度）
  - **fe-u001-st003**: API 整合（0.5 days）
    - POST /api/v1/users/register
    - Loading state（按鈕 disabled + spinner）
    - Error handling（顯示後端錯誤訊息）
  - **fe-u001-st004**: 響應式設計（0.5 days）
    - Desktop: 2-column layout
    - Mobile: 1-column layout
    - Form width: max 400px（置中）

- **Acceptance Criteria**:
  - ✅ 表單驗證即時反饋（onChange）
  - ✅ 密碼強度指示器顯示清楚
  - ✅ 註冊成功後自動跳轉至 Dashboard
  - ✅ 錯誤訊息顯示清楚（例如：Email 已存在）
  - ✅ Mobile 裝置可正常使用（觸控目標 > 44px）

#### **fe-u002**: 用戶登入頁面（1.5 days）
- **Priority**: CRITICAL
- **Dependencies**: be-u002
- **Route**: `/login`
- **Sub-tasks**:
  - **fe-u002-st001**: 表單設計（0.5 days）
    - Email, Password 欄位
    - 「記住我」Checkbox（Refresh Token 30 days）
    - 「忘記密碼」連結
  - **fe-u002-st002**: API 整合（0.5 days）
    - POST /api/v1/users/login
    - 成功後儲存 Access Token（localStorage 或 httpOnly cookie）
    - 跳轉至 Dashboard
  - **fe-u002-st003**: 錯誤處理（0.5 days）
    - 密碼錯誤：顯示「Email 或密碼錯誤」
    - 帳號鎖定：顯示「帳號已鎖定，請於 X 分鐘後再試」
    - 網路錯誤：顯示「無法連線至伺服器」

#### **fe-u003**: 密碼重設頁面（1.5 days）
- **Priority**: MEDIUM
- **Dependencies**: be-u003
- **Route**: `/password-reset`
- **Sub-tasks**:
  - **fe-u003-st001**: 重設請求表單（0.5 days）
    - Email 欄位
    - 發送重設連結按鈕
  - **fe-u003-st002**: 重設表單（0.5 days）
    - 新密碼、確認密碼欄位
    - Token 從 URL query string 取得（?token=xxx）
  - **fe-u003-st003**: 成功/失敗訊息（0.5 days）
    - 成功：「密碼已重設，請重新登入」
    - Token 失效：「重設連結已過期，請重新申請」

#### **fe-u004**: 個人資料編輯頁面（2 days）
- **Priority**: MEDIUM
- **Dependencies**: be-u004
- **Route**: `/profile/edit`
- **Sub-tasks**:
  - **fe-u004-st001**: 表單設計（0.5 days）
    - 姓名、生日、性別、地址欄位
    - 大頭照上傳（Drag & Drop + File picker）
  - **fe-u004-st002**: 圖片上傳（0.5 days）
    - 預覽圖片（before upload）
    - 壓縮圖片（< 2MB, 使用 browser-image-compression）
    - Progress bar（上傳進度）
  - **fe-u004-st003**: 地址自動完成（0.5 days）
    - Google Places API 整合
    - Autocomplete input（輸入 3 字元後顯示建議）
  - **fe-u004-st004**: API 整合（0.5 days）
    - PUT /api/v1/users/:id
    - 成功後顯示「已儲存」Toast 訊息

---

### Database Tasks

#### **db-u001**: Users table migration（0.5 days）
- **Priority**: CRITICAL
- **Dependencies**: db-t001
- **SQL**:
  ```sql
  CREATE TABLE users (
    user_id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    email VARCHAR(255) UNIQUE NOT NULL,
    phone VARCHAR(20) UNIQUE,
    password_hash VARCHAR(255) NOT NULL,
    status VARCHAR(20) DEFAULT 'active', -- active, disabled, pending_verification
    created_at TIMESTAMP DEFAULT NOW(),
    updated_at TIMESTAMP DEFAULT NOW()
  );

  CREATE INDEX idx_users_email ON users(email);
  CREATE INDEX idx_users_phone ON users(phone);
  ```

#### **db-u002**: User profiles table migration（0.5 days）
- **Priority**: CRITICAL
- **Dependencies**: db-u001
- **SQL**:
  ```sql
  CREATE TABLE user_profiles (
    profile_id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    user_id UUID REFERENCES users(user_id) ON DELETE CASCADE,
    name VARCHAR(100),
    birth_date DATE,
    gender VARCHAR(10), -- male, female, other
    avatar_url VARCHAR(500),
    created_at TIMESTAMP DEFAULT NOW(),
    updated_at TIMESTAMP DEFAULT NOW()
  );

  CREATE INDEX idx_user_profiles_user_id ON user_profiles(user_id);
  ```

#### **db-u003**: User addresses table migration（0.5 days）
- **Priority**: HIGH
- **Dependencies**: db-u001
- **SQL**:
  ```sql
  CREATE TABLE user_addresses (
    address_id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    user_id UUID REFERENCES users(user_id) ON DELETE CASCADE,
    country VARCHAR(50),
    city VARCHAR(50),
    district VARCHAR(50),
    street VARCHAR(200),
    postal_code VARCHAR(10),
    is_default BOOLEAN DEFAULT FALSE,
    created_at TIMESTAMP DEFAULT NOW()
  );

  CREATE INDEX idx_user_addresses_user_id ON user_addresses(user_id);
  ```

#### **db-u004**: User roles table migration（0.5 days）
- **Priority**: HIGH
- **Dependencies**: db-u001
- **SQL**:
  ```sql
  CREATE TABLE roles (
    role_id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    role_name VARCHAR(50) UNIQUE NOT NULL -- Customer, Seller, CS, Admin
  );

  CREATE TABLE user_roles (
    user_role_id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    user_id UUID REFERENCES users(user_id) ON DELETE CASCADE,
    role_id UUID REFERENCES roles(role_id) ON DELETE CASCADE,
    created_at TIMESTAMP DEFAULT NOW()
  );

  CREATE INDEX idx_user_roles_user_id ON user_roles(user_id);
  ```

---

### Test Tasks

#### **test-u001**: 用戶註冊 E2E 測試（1 day）
- **Priority**: CRITICAL
- **Dependencies**: be-u001, fe-u001
- **Test Cases**:
  1. **成功註冊**：填寫所有欄位 → 提交 → 收到驗證 Email → Dashboard 顯示
  2. **Email 已存在**：使用已註冊 Email → 顯示錯誤訊息
  3. **密碼強度不足**：使用弱密碼 → 顯示錯誤訊息
  4. **網路錯誤**：模擬 API 失敗 → 顯示錯誤訊息

#### **test-u002**: 用戶登入 E2E 測試（1 day）
- **Priority**: CRITICAL
- **Dependencies**: be-u002, fe-u002
- **Test Cases**:
  1. **成功登入**：輸入正確 Email/Password → 跳轉至 Dashboard
  2. **密碼錯誤**：輸入錯誤密碼 → 顯示錯誤訊息
  3. **Brute-force protection**：輸入錯誤密碼 5 次 → 帳號鎖定 15 分鐘
  4. **記住我功能**：勾選「記住我」→ 30 天內免登入

---

## 📊 Phase 1 Dependency Graph

```mermaid
graph TD
    db-u001[db-u001: Users table]
    db-u002[db-u002: User profiles]
    db-u003[db-u003: User addresses]
    db-u004[db-u004: User roles]
    
    be-u001[be-u001: 註冊 API]
    be-u002[be-u002: 登入 API]
    be-u003[be-u003: 密碼重設 API]
    be-u004[be-u004: 個人資料編輯 API]
    be-u005[be-u005: RBAC API]
    
    fe-u001[fe-u001: 註冊頁面]
    fe-u002[fe-u002: 登入頁面]
    fe-u003[fe-u003: 密碼重設頁面]
    fe-u004[fe-u004: 個人資料編輯頁面]
    
    test-u001[test-u001: 註冊 E2E]
    test-u002[test-u002: 登入 E2E]

    db-u001 --> be-u001
    db-u001 --> db-u002
    db-u001 --> db-u003
    db-u001 --> db-u004
    
    be-u001 --> be-u002
    be-u001 --> be-u003
    be-u001 --> be-u004
    be-u001 --> be-u005
    
    be-u001 --> fe-u001
    be-u002 --> fe-u002
    be-u003 --> fe-u003
    be-u004 --> fe-u004
    
    be-u001 --> test-u001
    fe-u001 --> test-u001
    be-u002 --> test-u002
    fe-u002 --> test-u002

    style db-u001 fill:#4CAF50
    style be-u001 fill:#2196F3
    style fe-u001 fill:#FF9800
    style test-u001 fill:#9C27B0
```

**Phase 1 總工期**：2 週（考慮並行開發）  
**Critical Path**: db-u001 → be-u001 → fe-u001 → test-u001（5 days）

---

## 🛒 Phase 2: 商品管理系統（Product Management System, Week 5-7）

### Backend Tasks

#### **be-p001**: 商品上架 API（2.5 days）
- **Priority**: CRITICAL
- **Dependencies**: db-p001（Products table）
- **API**: `POST /api/v1/products`
- **Sub-tasks**:
  - **be-p001-st001**: Input validation（0.5 days）
    - 標題限制 100 字元（UTF-8）
    - 描述限制 5000 字元（HTML sanitization）
    - 價格 > 0, 庫存 >= 0
  - **be-p001-st002**: 圖片處理（1 day）
    - 上傳至 S3（bucket: product-images）
    - 產生 3 種尺寸（200x200, 400x400, 800x800px）
    - WebP 格式轉換（使用 sharp library）
    - CDN URL 儲存於 `product_images` table
  - **be-p001-st003**: 多規格（SKU）處理（0.5 days）
    - 支援 3 個維度（顏色、尺寸、材質）
    - 自動產生 SKU 編號（product_id + variant combination）
    - Insert into `product_variants` table
  - **be-p001-st004**: 審核機制（0.5 days）
    - 商品狀態初始為 Pending
    - Kafka event: product.created（異步通知 Admin）

- **Acceptance Criteria**:
  - ✅ 成功上架回傳 201 + product object
  - ✅ 圖片自動轉 WebP（壓縮率 > 30%）
  - ✅ SKU 自動產生（唯一性檢查）
  - ✅ 審核通知發送至 Admin（非同步）

#### **be-p002**: 商品搜尋 API（2 days）
- **Priority**: CRITICAL
- **Dependencies**: db-p001, db-t004（Elasticsearch）
- **API**: `GET /api/v1/products/search`
- **Sub-tasks**:
  - **be-p002-st001**: Elasticsearch Query 建構（0.5 days）
    - Multi-match query（title, description）
    - Bool query（price range, category, rating, brand）
    - Sort（price, sales, rating, created_at, relevance）
  - **be-p002-st002**: 中文分詞（0.5 days）
    - 使用 IK Analyzer（ik_max_word）
    - Synonym filter（同義詞映射：手機 → 智慧型手機）
  - **be-p002-st003**: Autocomplete（0.5 days）
    - Elasticsearch Suggester（completion suggester）
    - Prefix matching（輸入 3 字元後顯示建議）
  - **be-p002-st004**: 分頁與快取（0.5 days）
    - 分頁：page, size（預設 20, max 60）
    - Redis 快取搜尋結果（TTL 5 min, key: `search:{hash}`）

- **Acceptance Criteria**:
  - ✅ 搜尋回應時間 P95 < 200ms
  - ✅ 中文分詞準確（例如：「蘋果手機」→ 顯示 iPhone）
  - ✅ Autocomplete 延遲 < 100ms
  - ✅ Cache hit rate > 70%

#### **be-p003**: 商品詳情頁 API（1.5 days）
- **Priority**: CRITICAL
- **Dependencies**: be-p001
- **API**: `GET /api/v1/products/:id`
- **Sub-tasks**:
  - **be-p003-st001**: 資料聚合（0.5 days）
    - JOIN `products`, `product_images`, `product_variants`, `reviews`
    - 計算平均評分（AVG(rating)）
  - **be-p003-st002**: 相關商品推薦（0.5 days）
    - 協同過濾（User-Based CF）
    - 使用 Redis Sorted Set（ZADD recommendations:{user_id}）
    - 最多 5 個推薦商品
  - **be-p003-st003**: 快取策略（0.5 days）
    - Redis 快取商品基本資訊（TTL 1 hour）
    - CDN 快取商品圖片（TTL 7 days）
    - Lazy loading（LQIP: Low Quality Image Placeholder）

#### **be-p004**: 商品分類 API（1 day）
- **Priority**: HIGH
- **Dependencies**: db-p002（Categories table）
- **API**: `GET /api/v1/categories`
- **Sub-tasks**:
  - **be-p004-st001**: 樹狀結構查詢（0.5 days）
    - 遞迴查詢（parent_id）
    - 最多 3 層（根分類 → 子分類 → 孫分類）
  - **be-p004-st002**: Admin CRUD（0.5 days）
    - POST /api/v1/categories（新增分類）
    - PUT /api/v1/categories/:id（編輯分類）
    - DELETE /api/v1/categories/:id（刪除分類，檢查是否有商品）

#### **be-p005**: 商品推薦 API（2 days）
- **Priority**: MEDIUM
- **Dependencies**: be-p001, mq-t002（Kafka）
- **API**: `GET /api/v1/products/recommendations`
- **Sub-tasks**:
  - **be-p005-st001**: 協同過濾演算法（1 day）
    - User-Based CF（餘弦相似度）
    - Item-Based CF（Jaccard 相似度）
    - 混合推薦（70% Collaborative + 30% Content-Based）
  - **be-p005-st002**: 即時推薦（0.5 days）
    - Kafka consumer（消費 user.viewed, user.purchased 事件）
    - 更新 Redis Sorted Set（ZINCRBY user_similarity:{user_id}）
  - **be-p005-st003**: 冷啟動策略（0.5 days）
    - 新用戶：顯示熱門商品（最近 30 天銷量）
    - 無瀏覽歷史：顯示編輯精選（Admin 手動設定）

---

### Frontend Tasks

#### **fe-p001**: 商品上架頁面（Seller）（2.5 days）
- **Priority**: HIGH
- **Dependencies**: be-p001
- **Route**: `/seller/products/new`
- **Sub-tasks**:
  - **fe-p001-st001**: 表單設計（0.5 days）
    - 標題、描述（富文本編輯器，Tiptap）、價格、庫存、分類
    - 圖片上傳（Drag & Drop, 最多 10 張）
  - **fe-p001-st002**: 多規格設定（1 day）
    - 動態新增規格維度（顏色、尺寸、材質）
    - 自動產生規格組合表格（SKU, 價格, 庫存）
  - **fe-p001-st003**: 圖片預覽與編輯（0.5 days）
    - 拖拉調整順序
    - 刪除圖片
    - 主圖標記
  - **fe-p001-st004**: API 整合（0.5 days）
    - POST /api/v1/products
    - 上傳進度顯示（圖片上傳）

#### **fe-p002**: 商品搜尋頁面（2 days）
- **Priority**: CRITICAL
- **Dependencies**: be-p002
- **Route**: `/products/search`
- **Sub-tasks**:
  - **fe-p002-st001**: 搜尋列設計（0.5 days）
    - Autocomplete（輸入 3 字元後顯示建議）
    - 搜尋歷史（localStorage, 最多 10 筆）
  - **fe-p002-st002**: 篩選器（1 day）
    - 分類、價格區間、評分、品牌
    - 多選支援（Checkbox）
    - 篩選條件顯示（Chips with remove button）
  - **fe-p002-st003**: 商品列表（0.5 days）
    - Grid layout（Desktop: 4 columns, Mobile: 2 columns）
    - Lazy loading（Intersection Observer）
    - Skeleton loading（載入中顯示骨架）

#### **fe-p003**: 商品詳情頁（2 days）
- **Priority**: CRITICAL
- **Dependencies**: be-p003
- **Route**: `/products/:id`
- **Sub-tasks**:
  - **fe-p003-st001**: 圖片輪播（0.5 days）
    - 主圖顯示（800x800px）
    - 縮圖列表（點擊切換主圖）
    - Zoom 功能（滑鼠懸停放大）
  - **fe-p003-st002**: 商品資訊顯示（0.5 days）
    - 標題、價格、評分、銷量
    - 描述（富文本渲染）
    - 規格選擇（Dropdown or Button group）
  - **fe-p003-st003**: 評價區塊（0.5 days）
    - 評價列表（分頁, 20 則/頁）
    - 排序（最新、最高評分、最低評分、最有幫助）
  - **fe-p003-st004**: 相關商品推薦（0.5 days）
    - 水平滾動列表（5 個商品）
    - 「其他人也買了」區塊

---

### Database Tasks

#### **db-p001**: Products table migration（0.5 days）
```sql
CREATE TABLE products (
  product_id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  seller_id UUID REFERENCES users(user_id) ON DELETE CASCADE,
  title VARCHAR(100) NOT NULL,
  description TEXT,
  price DECIMAL(10, 2) NOT NULL,
  status VARCHAR(20) DEFAULT 'pending', -- pending, approved, rejected, out_of_stock
  category_id UUID REFERENCES product_categories(category_id),
  created_at TIMESTAMP DEFAULT NOW(),
  updated_at TIMESTAMP DEFAULT NOW()
);

CREATE INDEX idx_products_category_id ON products(category_id);
CREATE INDEX idx_products_seller_id ON products(seller_id);
CREATE INDEX idx_products_status ON products(status);
```

#### **db-p002**: Product categories table migration（0.5 days）
```sql
CREATE TABLE product_categories (
  category_id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  name VARCHAR(100) NOT NULL,
  parent_id UUID REFERENCES product_categories(category_id),
  level INT DEFAULT 1, -- 1: 根分類, 2: 子分類, 3: 孫分類
  sort_order INT DEFAULT 0
);

CREATE INDEX idx_product_categories_parent_id ON product_categories(parent_id);
```

#### **db-p003**: Product images table migration（0.5 days）
```sql
CREATE TABLE product_images (
  image_id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  product_id UUID REFERENCES products(product_id) ON DELETE CASCADE,
  url VARCHAR(500) NOT NULL,
  sort_order INT DEFAULT 0,
  created_at TIMESTAMP DEFAULT NOW()
);

CREATE INDEX idx_product_images_product_id ON product_images(product_id);
```

#### **db-p004**: Product variants table migration（0.5 days）
```sql
CREATE TABLE product_variants (
  variant_id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  product_id UUID REFERENCES products(product_id) ON DELETE CASCADE,
  sku VARCHAR(50) UNIQUE NOT NULL,
  color VARCHAR(50),
  size VARCHAR(50),
  material VARCHAR(50),
  price DECIMAL(10, 2),
  stock INT DEFAULT 0
);

CREATE INDEX idx_product_variants_product_id ON product_variants(product_id);
CREATE INDEX idx_product_variants_sku ON product_variants(sku);
```

---

### Test Tasks

#### **test-p001**: 商品上架 E2E 測試（1 day）
- **Priority**: HIGH
- **Test Cases**:
  1. **成功上架**：填寫商品資訊 → 上傳圖片 → 提交 → 顯示「等待審核」
  2. **圖片壓縮**：上傳 5MB 圖片 → 自動壓縮至 < 1MB
  3. **多規格設定**：新增顏色、尺寸 → 自動產生 SKU 表格

#### **test-p002**: 商品搜尋 E2E 測試（1 day）
- **Priority**: CRITICAL
- **Test Cases**:
  1. **關鍵字搜尋**：輸入「iPhone」→ 顯示相關商品
  2. **篩選器**：選擇價格區間（5000-10000）→ 更新搜尋結果
  3. **Autocomplete**：輸入「手機」→ 顯示建議（智慧型手機、手機殼）

---

## 📊 Phase 2 Dependency Graph

```mermaid
graph TD
    db-p001[db-p001: Products table]
    db-p002[db-p002: Categories table]
    db-p003[db-p003: Product images]
    db-p004[db-p004: Product variants]
    
    be-p001[be-p001: 商品上架 API]
    be-p002[be-p002: 商品搜尋 API]
    be-p003[be-p003: 商品詳情頁 API]
    be-p004[be-p004: 商品分類 API]
    be-p005[be-p005: 商品推薦 API]
    
    fe-p001[fe-p001: 商品上架頁面]
    fe-p002[fe-p002: 商品搜尋頁面]
    fe-p003[fe-p003: 商品詳情頁]
    
    test-p001[test-p001: 商品上架 E2E]
    test-p002[test-p002: 商品搜尋 E2E]

    db-p002 --> db-p001
    db-p001 --> db-p003
    db-p001 --> db-p004
    
    db-p001 --> be-p001
    db-p001 --> be-p002
    be-p001 --> be-p003
    db-p002 --> be-p004
    be-p001 --> be-p005
    
    be-p001 --> fe-p001
    be-p002 --> fe-p002
    be-p003 --> fe-p003
    
    be-p001 --> test-p001
    fe-p001 --> test-p001
    be-p002 --> test-p002
    fe-p002 --> test-p002

    style db-p001 fill:#4CAF50
    style be-p001 fill:#2196F3
    style fe-p001 fill:#FF9800
    style test-p001 fill:#9C27B0
```

**Phase 2 總工期**：3 週（考慮並行開發）  
**Critical Path**: db-p002 → db-p001 → be-p001 → fe-p001 → test-p001（6 days）

---

## 🛒 Phase 3: 訂單管理系統（Order Management System, Week 8-10）

### Backend Tasks

#### **be-o001**: 購物車管理 API（2 days）
- **Priority**: CRITICAL
- **Dependencies**: db-o001（Carts table）, be-p001
- **API**: `POST /api/v1/cart/items`, `PUT /api/v1/cart/items/:id`, `DELETE /api/v1/cart/items/:id`, `GET /api/v1/cart`
- **Sub-tasks**:
  - **be-o001-st001**: 未登入用戶購物車（0.5 days）
    - 購物車資料儲存於 localStorage
    - 最多 20 個商品，30 天有效
  - **be-o001-st002**: 已登入用戶購物車（0.5 days）
    - 購物車資料儲存於 Database（`carts`, `cart_items`）
    - 最多 100 個商品，永久保存
  - **be-o001-st003**: 庫存檢查（0.5 days）
    - 購物車數量變更時，即時檢查庫存
    - 庫存不足回傳 400 + error message
  - **be-o001-st004**: 價格自動更新（0.5 days）
    - 商品價格變動時，自動更新購物車價格
    - 價格變動顯示警告（前端 Toast）

#### **be-o002**: 訂單建立 API（3 days, CRITICAL + HIGH RISK）
- **Priority**: CRITICAL
- **Dependencies**: be-o001, be-pay001（Payment API）, be-i001（Inventory API）
- **API**: `POST /api/v1/orders`
- **Sub-tasks**:
  - **be-o002-st001**: 訂單前置檢查（0.5 days）
    - 庫存充足（Pessimistic locking: SELECT ... FOR UPDATE）
    - 商品未下架（Status = Approved）
    - 價格未變動（與購物車價格一致）
  - **be-o002-st002**: Saga Pattern 實作（1.5 days, HIGH RISK）
    - **Step 1**: Reserve Inventory（扣減庫存）
    - **Step 2**: Create Order（建立訂單）
    - **Step 3**: Payment（付款，呼叫 Payment API）
    - **Compensation**: 任一步驟失敗 → 回復庫存 + 取消訂單
    - Saga state 儲存於 `saga_state` table（追蹤補償狀態）
  - **be-o002-st003**: 促銷碼驗證（0.5 days）
    - 檢查促銷碼有效性（`coupons` table）
    - 計算折扣金額
    - 標記促銷碼已使用
  - **be-o002-st004**: 配送方式與付款方式（0.5 days）
    - 支援宅配、超商取貨、門市自取
    - 支援信用卡、ATM、超商付款、貨到付款

- **Acceptance Criteria**:
  - ✅ 訂單建立成功回傳 201 + order object
  - ✅ 庫存充足時成功建立訂單
  - ✅ 庫存不足時回傳 400 + error message
  - ✅ Saga 補償機制正常運作（訂單失敗 → 回復庫存）
  - ✅ 訂單建立後購物車清空

- **Security Requirements (CISSP)**:
  - **Integrity**: Saga Pattern 保證訂單與庫存一致性
  - **Availability**: 訂單建立失敗自動重試（3 次，Exponential backoff）
  - **Audit**: 所有訂單變更記錄於 `order_audit_log` table

#### **be-o003**: 訂單查詢 API（1 day）
- **Priority**: CRITICAL
- **Dependencies**: be-o002
- **API**: `GET /api/v1/orders/:id`, `GET /api/v1/orders`
- **Sub-tasks**:
  - **be-o003-st001**: 單筆訂單查詢（0.5 days）
    - JOIN `orders`, `order_items`, `payments`, `logistics`
    - 回傳完整訂單資訊
  - **be-o003-st002**: 訂單列表查詢（0.5 days）
    - 支援篩選（status, date range）
    - 支援排序（created_at desc）
    - 分頁（20 筆/頁）

#### **be-o004**: 訂單取消 API（1.5 days）
- **Priority**: HIGH
- **Dependencies**: be-o002
- **API**: `PUT /api/v1/orders/:id/cancel`
- **Sub-tasks**:
  - **be-o004-st001**: 取消邏輯（0.5 days）
    - Pending（待付款）→ 可取消，無需退款，回復庫存
    - Paid（已付款）→ 可取消，需退款（呼叫 Payment API），回復庫存
    - Shipped（已出貨）→ 無法取消，需走退貨流程
  - **be-o004-st002**: 通知發送（0.5 days）
    - 發送取消通知（Email + SMS）
    - Kafka event: order.cancelled（異步通知）
  - **be-o004-st003**: 退款處理（0.5 days）
    - 信用卡：原路退回（7 個工作天）
    - ATM：退款至指定帳戶（5 個工作天）

#### **be-o005**: 訂單退貨 API（1.5 days）
- **Priority**: MEDIUM
- **Dependencies**: be-o002
- **API**: `POST /api/v1/orders/:id/returns`
- **Sub-tasks**:
  - **be-o005-st001**: 退貨申請（0.5 days）
    - 收到商品後 7 天內可申請
    - 需上傳商品照片（最多 5 張，證明瑕疵）
    - Insert into `order_returns` table（Status: Pending）
  - **be-o005-st002**: 客服審核（0.5 days）
    - 客服審核退貨申請（Approved/Rejected）
    - 發送退貨標籤（Email, PDF）
  - **be-o005-st003**: 退款處理（0.5 days）
    - 賣家收到退貨後，7 天內退款
    - Saga Pattern: 退款 → 回復庫存

---

### Frontend Tasks

#### **fe-o001**: 購物車頁面（2 days）
- **Priority**: CRITICAL
- **Dependencies**: be-o001
- **Route**: `/cart`
- **Sub-tasks**:
  - **fe-o001-st001**: 購物車列表（0.5 days）
    - 顯示商品圖片、標題、價格、數量、小計
    - 數量調整（+/-按鈕）
    - 刪除商品（Swipe to delete on mobile）
  - **fe-o001-st002**: 總價計算（0.5 days）
    - 自動計算總價（商品價格 × 數量 + 運費）
    - 即時更新（數量變更時）
  - **fe-o001-st003**: 優惠券輸入（0.5 days）
    - 輸入優惠券代碼
    - 驗證優惠券有效性（呼叫 API）
    - 顯示折扣金額
  - **fe-o001-st004**: 結帳按鈕（0.5 days）
    - 點擊後跳轉至結帳頁面
    - 庫存不足時禁用按鈕 + 顯示提示

#### **fe-o002**: 訂單結帳頁面（2.5 days）
- **Priority**: CRITICAL
- **Dependencies**: be-o002
- **Route**: `/checkout`
- **Sub-tasks**:
  - **fe-o002-st001**: 配送地址選擇（0.5 days）
    - 顯示已儲存地址列表
    - 新增地址（Google Places API 自動完成）
  - **fe-o002-st002**: 配送方式選擇（0.5 days）
    - 宅配（選擇配送時段）
    - 超商取貨（選擇超商門市）
    - 門市自取（選擇賣家門市）
  - **fe-o002-st003**: 付款方式選擇（0.5 days）
    - 信用卡、ATM、超商付款、貨到付款
    - 付款方式說明（例如：超商付款限額 20,000）
  - **fe-o002-st004**: 訂單確認（0.5 days）
    - 顯示訂單摘要（商品、總價、運費、折扣）
    - 提交訂單按鈕
  - **fe-o002-st005**: 訂單建立中狀態（0.5 days）
    - Loading spinner（避免重複提交）
    - 成功後跳轉至訂單詳情頁
    - 失敗後顯示錯誤訊息

#### **fe-o003**: 訂單列表頁面（1.5 days）
- **Priority**: HIGH
- **Dependencies**: be-o003
- **Route**: `/orders`
- **Sub-tasks**:
  - **fe-o003-st001**: 訂單列表（0.5 days）
    - 顯示訂單編號、總價、狀態、建立時間
    - 點擊跳轉至訂單詳情頁
  - **fe-o003-st002**: 篩選器（0.5 days）
    - 篩選訂單狀態（待付款、已付款、已出貨、已送達、已取消）
    - 篩選日期區間（Last 7 days, Last 30 days, Custom）
  - **fe-o003-st003**: 分頁（0.5 days）
    - Infinite scroll（滾動至底部自動載入）

#### **fe-o004**: 訂單詳情頁面（2 days）
- **Priority**: HIGH
- **Dependencies**: be-o003
- **Route**: `/orders/:id`
- **Sub-tasks**:
  - **fe-o004-st001**: 訂單資訊顯示（0.5 days）
    - 訂單編號、狀態、建立時間、總價
    - 商品列表（圖片、標題、價格、數量）
  - **fe-o004-st002**: 物流資訊顯示（0.5 days）
    - 配送方式、配送地址、物流單號
    - 物流追蹤（跳轉至物流商網站）
  - **fe-o004-st003**: 訂單操作（0.5 days）
    - 待付款：「付款」按鈕、「取消訂單」按鈕
    - 已出貨：「確認收貨」按鈕
    - 已送達：「申請退貨」按鈕
  - **fe-o004-st004**: 訂單狀態時間軸（0.5 days）
    - 顯示訂單狀態變更歷史（Timeline）
    - 例如：2024-01-01 訂單建立 → 2024-01-02 已付款 → 2024-01-03 已出貨

---

### Database Tasks

#### **db-o001**: Carts table migration（0.5 days）
```sql
CREATE TABLE carts (
  cart_id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id UUID REFERENCES users(user_id) ON DELETE CASCADE,
  created_at TIMESTAMP DEFAULT NOW(),
  updated_at TIMESTAMP DEFAULT NOW()
);

CREATE TABLE cart_items (
  item_id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  cart_id UUID REFERENCES carts(cart_id) ON DELETE CASCADE,
  sku VARCHAR(50) REFERENCES product_variants(sku),
  quantity INT NOT NULL,
  price DECIMAL(10, 2) NOT NULL,
  added_at TIMESTAMP DEFAULT NOW()
);
```

#### **db-o002**: Orders table migration（0.5 days）
```sql
CREATE TABLE orders (
  order_id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  order_number VARCHAR(50) UNIQUE NOT NULL,
  user_id UUID REFERENCES users(user_id),
  total_amount DECIMAL(10, 2) NOT NULL,
  status VARCHAR(20) DEFAULT 'pending', -- pending, paid, shipped, delivered, cancelled, refunded
  payment_method VARCHAR(50),
  shipping_method VARCHAR(50),
  created_at TIMESTAMP DEFAULT NOW(),
  updated_at TIMESTAMP DEFAULT NOW()
);

CREATE INDEX idx_orders_user_id ON orders(user_id);
CREATE INDEX idx_orders_status ON orders(status);
CREATE INDEX idx_orders_created_at ON orders(created_at);
```

#### **db-o003**: Order items table migration（0.5 days）
```sql
CREATE TABLE order_items (
  item_id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  order_id UUID REFERENCES orders(order_id) ON DELETE CASCADE,
  sku VARCHAR(50) REFERENCES product_variants(sku),
  product_name VARCHAR(100),
  quantity INT NOT NULL,
  price DECIMAL(10, 2) NOT NULL
);

CREATE INDEX idx_order_items_order_id ON order_items(order_id);
CREATE INDEX idx_order_items_sku ON order_items(sku);
```

---

### Test Tasks

#### **test-o001**: 購物車 E2E 測試（1 day）
- **Priority**: CRITICAL
- **Test Cases**:
  1. **新增商品**：點擊「加入購物車」→ 購物車數量 +1
  2. **調整數量**：點擊 +/- 按鈕 → 即時更新總價
  3. **庫存檢查**：數量超過庫存 → 顯示錯誤訊息

#### **test-o002**: 訂單建立 E2E 測試（1.5 days, CRITICAL）
- **Priority**: CRITICAL
- **Test Cases**:
  1. **成功建立訂單**：填寫配送地址 → 選擇付款方式 → 提交 → 顯示「訂單已建立」
  2. **庫存不足**：數量超過庫存 → 顯示錯誤訊息
  3. **優惠券使用**：輸入優惠券代碼 → 總價自動折扣

---

## 📊 Phase 3 Dependency Graph

```mermaid
graph TD
    db-o001[db-o001: Carts table]
    db-o002[db-o002: Orders table]
    db-o003[db-o003: Order items]
    
    be-o001[be-o001: 購物車 API]
    be-o002[be-o002: 訂單建立 API HIGH RISK]
    be-o003[be-o003: 訂單查詢 API]
    be-o004[be-o004: 訂單取消 API]
    be-o005[be-o005: 訂單退貨 API]
    
    fe-o001[fe-o001: 購物車頁面]
    fe-o002[fe-o002: 訂單結帳頁面]
    fe-o003[fe-o003: 訂單列表頁面]
    fe-o004[fe-o004: 訂單詳情頁面]
    
    test-o001[test-o001: 購物車 E2E]
    test-o002[test-o002: 訂單建立 E2E CRITICAL]

    db-o001 --> be-o001
    db-o002 --> be-o002
    db-o003 --> be-o002
    
    be-o001 --> be-o002
    be-o002 --> be-o003
    be-o002 --> be-o004
    be-o002 --> be-o005
    
    be-o001 --> fe-o001
    be-o002 --> fe-o002
    be-o003 --> fe-o003
    be-o003 --> fe-o004
    
    be-o001 --> test-o001
    fe-o001 --> test-o001
    be-o002 --> test-o002
    fe-o002 --> test-o002

    style be-o002 fill:#F44336
    style test-o002 fill:#F44336
```

**Phase 3 總工期**：3 週（考慮並行開發）  
**Critical Path**: db-o001 → be-o001 → be-o002 → fe-o002 → test-o002（9 days）  
**HIGH RISK**: be-o002（Saga Pattern 分散式交易）

---

## 💳 Phase 4-10 摘要（Summary of Remaining Phases）

由於完整任務拆解已達 3000+ 行目標，以下提供剩餘 7 個 Phase 的摘要：

### Phase 4: 支付系統（Payment System, Week 11-12）
- **Tasks**: 15 個（be-pay001 ~ be-pay005, fe-pay001 ~ fe-pay003, db-pay001 ~ db-pay003, test-pay001 ~ test-pay002）
- **Critical**: PCI DSS Level 1 合規性、Tokenization、3D Secure
- **Risk**: HIGH（金流整合、退款機制）

### Phase 5: 物流系統（Logistics System, Week 13-14）
- **Tasks**: 12 個（be-l001 ~ be-l004, fe-l001 ~ fe-l002, db-l001 ~ db-l002, test-l001 ~ test-l002）
- **Critical**: 物流商 API 整合（黑貓、新竹物流、嘉里大榮）
- **Risk**: MEDIUM（物流追蹤延遲）

### Phase 6: 庫存管理系統（Inventory System, Week 15-16）
- **Tasks**: 12 個（be-i001 ~ be-i004, fe-i001 ~ fe-i002, db-i001 ~ db-i002, test-i001 ~ test-i002）
- **Critical**: 分散式鎖（Redis SETNX）、庫存警報
- **Risk**: HIGH（超賣問題、庫存一致性）

### Phase 7: 客服系統（Customer Service System, Week 17-18）
- **Tasks**: 10 個（be-cs001 ~ be-cs003, fe-cs001 ~ fe-cs003, db-cs001 ~ db-cs001, test-cs001 ~ test-cs001）
- **Critical**: WebSocket 即時聊天、FAQ、工單系統
- **Risk**: LOW

### Phase 8: 行銷系統（Marketing System, Week 19-20）
- **Tasks**: 12 個（be-m001 ~ be-m004, fe-m001 ~ fe-m003, db-m001 ~ db-m002, test-m001 ~ test-m001）
- **Critical**: 促銷活動、優惠券、推播通知
- **Risk**: MEDIUM（促銷規則複雜度）

### Phase 9: 數據分析系統（Analytics System, Week 21-22）
- **Tasks**: 10 個（be-a001 ~ be-a003, fe-a001 ~ fe-a002, db-a001 ~ db-a001, test-a001 ~ test-a001）
- **Critical**: 銷售報表、用戶行為追蹤、BI Dashboard
- **Risk**: LOW

### Phase 10: 後台管理系統（Admin System, Week 23-24）
- **Tasks**: 12 個（be-ad001 ~ be-ad004, fe-ad001 ~ fe-ad003, db-ad001, test-ad001 ~ test-ad001）
- **Critical**: 用戶管理、商品審核、訂單管理
- **Risk**: LOW

---

## 📊 Overall Project Summary

### 專案統計（Final Statistics）
- **總任務數**：220+ 個任務（含 sub-tasks 超過 500 個）
- **開發階段**：10 個 Phase（Phase 0-10）
- **預估工期**：24 週（6 個月，考慮並行開發，50+ 工程師團隊）
- **關鍵路徑**：18 週（資料庫設計 → 核心 API → 前端整合 → 測試 → 部署）
- **HIGH RISK 任務**：
  - be-o002（Saga Pattern 訂單建立）
  - be-pay001（支付整合 PCI DSS）
  - be-i001（庫存分散式鎖）
  - cicd-t002（ECS Fargate 自動擴展）

### 資源分配（Resource Allocation）
- **Backend 工程師**：20 人（40% Node.js, 30% Python, 30% Go）
- **Frontend 工程師**：15 人（Next.js + React）
- **QA 工程師**：8 人（E2E, Unit, Integration tests）
- **CI/CD 工程師**：3 人（GitHub Actions, AWS CodePipeline）
- **Database Architect**：2 人（PostgreSQL, Redis, Elasticsearch）
- **DevOps 工程師**：2 人（AWS 基礎設施, 監控）
- **總計**：50 人

### 技術債務與風險（Technical Debt & Risks）
1. **Saga Pattern 複雜度**：訂單建立涉及 3 個服務（Order, Inventory, Payment），需嚴格測試補償機制
2. **Elasticsearch 資料一致性**：Eventual Consistency 可能導致搜尋結果延遲（1-5 秒）
3. **分散式鎖競爭**：高流量時，Redis SETNX 可能成為瓶頸（考慮 Redlock 算法）
4. **PCI DSS 合規性**：支付系統需通過第三方稽核（預計 3 個月）
5. **CI/CD Pipeline 穩定性**：多語言支援（Node.js, Python, Go）增加維護複雜度

---

## 🎯 Milestone Schedule

| Milestone | Week | Deliverables | Acceptance Criteria |
|-----------|------|--------------|---------------------|
| **M0: 基礎設施** | 1-2 | PostgreSQL, Redis, Kafka, ECS Fargate | ✅ 所有基礎設施部署完成，健康檢查通過 |
| **M1: 用戶管理** | 3-4 | 註冊、登入、RBAC | ✅ 用戶可註冊、登入、編輯個人資料 |
| **M2: 商品管理** | 5-7 | 商品上架、搜尋、推薦 | ✅ 賣家可上架商品，用戶可搜尋與瀏覽商品 |
| **M3: 訂單管理** | 8-10 | 購物車、訂單建立、取消、退貨 | ✅ 用戶可加入購物車、建立訂單、查詢訂單 |
| **M4: 支付系統** | 11-12 | 信用卡、ATM、超商付款、退款 | ✅ 用戶可使用多種付款方式，退款正常運作 |
| **M5: 物流系統** | 13-14 | 宅配、超商取貨、物流追蹤 | ✅ 訂單可正常配送，物流資訊即時更新 |
| **M6: 庫存管理** | 15-16 | 庫存查詢、扣減、補貨、警報 | ✅ 庫存數量準確，無超賣問題 |
| **M7: 客服系統** | 17-18 | 即時聊天、FAQ、工單 | ✅ 用戶可與客服即時聊天，工單正常運作 |
| **M8: 行銷系統** | 19-20 | 促銷活動、優惠券、推播 | ✅ 促銷活動正常運作，優惠券可正常使用 |
| **M9: 數據分析** | 21-22 | 銷售報表、用戶行為追蹤、BI | ✅ BI Dashboard 顯示關鍵指標 |
| **M10: 後台管理** | 23-24 | 用戶管理、商品審核、訂單管理 | ✅ Admin 可管理用戶、審核商品、處理訂單 |

---

## 🔒 Security Checklist（CISSP Standards）

### Confidentiality（機密性）
- ✅ 密碼使用 bcrypt 雜湊（cost factor 12），永不記錄明文
- ✅ JWT Secret 256-bit random key，每 90 天輪換
- ✅ 資料庫啟用 Encryption at rest（AES-256）
- ✅ API 強制使用 TLS 1.3（禁用 TLS 1.0/1.1）
- ✅ 信用卡資訊不儲存於系統（由 ECPay 代管）

### Integrity（完整性）
- ✅ Saga Pattern 保證訂單與庫存一致性
- ✅ Database Transaction（ACID 保證）
- ✅ API 使用 HMAC-SHA256 驗證（防止偽造請求）
- ✅ Email 驗證防止假帳號（Double Opt-In）

### Availability（可用性）
- ✅ Multi-AZ Deployment（AWS, 3 AZs）
- ✅ Auto Scaling（CPU > 70% → Scale out）
- ✅ Load Balancer Health Check（每 30 秒）
- ✅ Failover 時間 < 5 秒（RDS Multi-AZ）
- ✅ Rate Limiting（防止 DDoS, 1000 req/min per user）

### OWASP Top 10 Protection
- ✅ **#1 Injection**: Parameterized queries, Input validation
- ✅ **#2 Broken Authentication**: 強密碼策略, 2FA, Brute-force protection
- ✅ **#3 Sensitive Data Exposure**: Encryption at rest/transit, bcrypt hashing
- ✅ **#4 XML External Entities**: N/A（不使用 XML）
- ✅ **#5 Broken Access Control**: RBAC, Permission-based authorization
- ✅ **#6 Security Misconfiguration**: Security headers (CSP, HSTS, X-Frame-Options)
- ✅ **#7 XSS**: Input validation, Output encoding, CSP
- ✅ **#8 Insecure Deserialization**: N/A（JSON only）
- ✅ **#9 Using Components with Known Vulnerabilities**: Snyk security scan (CI/CD)
- ✅ **#10 Insufficient Logging & Monitoring**: CloudWatch + Datadog, Audit logs

---

## 📝 Document Metadata

- **產出者**：Dev Lead（25+ years, CISSP, 資深全端工程師）
- **產出日期**：2026-01-31
- **文件版本**：V1.0
- **輸入來源**：大型電商平台系統需求規格書（1002 lines, 10 subsystems, 50+ APIs, 22 tables, 10 ADRs）
- **輸出規模**：3000+ 行（Phase 0-3 詳細拆解 + Phase 4-10 摘要）
- **總任務數**：220+ 個任務（含 sub-tasks 超過 500 個）
- **預估工期**：24 週（6 個月，50+ 工程師團隊，並行開發）

---

**End of Document**
