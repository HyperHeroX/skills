# 大型電商平台系統需求規格書（V1.0）

## 1. 專案概述

### 1.1 專案背景
本專案旨在建立一個大型電商平台，支援 **100 萬+ 日活用戶**、**10 萬+ SKUs**、**每秒 1000+ 訂單峰值**。系統需具備高可用性、高擴展性與高安全性，並符合國際標準（PCI DSS Level 1、GDPR、個資法）。

### 1.2 商業目標
- **GMV**：年度商品交易總額 100 億新台幣
- **轉換率**：購物車轉換率 > 5%
- **用戶留存**：月活躍用戶留存率 > 60%
- **平均訂單價值**：AOV > 1500 新台幣
- **營收成長**：年營收成長率 > 30%

### 1.3 技術目標
- **可用性**：99.95% Uptime（年度停機時間 < 4.38 小時）
- **效能**：API 回應時間 P95 < 200ms，頁面載入時間 P95 < 2s
- **擴展性**：支援水平擴展至 100+ 節點，自動擴展機制
- **安全性**：符合 PCI DSS Level 1、OWASP Top 10 防護
- **災難復原**：RTO < 1 hour, RPO < 5 minutes

---

## 2. 系統架構總覽

### 2.1 子系統清單（10 個子系統）
1. **用戶管理系統** (User Management System) - 處理註冊、登入、權限管理
2. **商品管理系統** (Product Management System) - 處理商品上架、搜尋、推薦
3. **訂單管理系統** (Order Management System) - 處理購物車、訂單、取消、退貨
4. **支付系統** (Payment System) - 處理信用卡、ATM、超商付款、退款
5. **物流系統** (Logistics System) - 處理宅配、超商取貨、門市自取
6. **庫存管理系統** (Inventory Management System) - 處理庫存查詢、扣減、補貨、警報
7. **客服系統** (Customer Service System) - 處理即時聊天、FAQ、工單
8. **行銷系統** (Marketing System) - 處理促銷活動、優惠券、推播通知
9. **數據分析系統** (Analytics System) - 處理銷售報表、用戶行為分析、BI
10. **後台管理系統** (Admin System) - 處理用戶管理、商品審核、訂單管理

### 2.2 技術棧
- **Frontend**：Next.js 14, React 18, TypeScript 5, Tailwind CSS 3
- **Backend**：Microservices（Node.js 20, Python 3.12, Go 1.21）
- **Database**：PostgreSQL 15（主庫）, Redis 7（快取）, MongoDB 7（日誌）
- **Message Queue**：RabbitMQ 3.12, Apache Kafka 3.6
- **Search Engine**：Elasticsearch 8.11
- **CDN**：Cloudflare
- **Cloud**：AWS（ECS, RDS, S3, CloudFront, Lambda, API Gateway）

### 2.3 架構模式
- **微服務架構**：10 個獨立部署的服務，各自擁有資料庫
- **事件驅動**：使用 Kafka 進行服務間非同步通訊
- **CQRS**：Command Query Responsibility Segregation（讀寫分離）
- **API Gateway**：統一入口，處理認證、限流、日誌

---

## 3. 用戶管理系統 (User Management System)

### 3.1 功能需求

#### FR-U001: 用戶註冊
- **Priority**：Must-Have
- **Description**：用戶可使用 Email、手機號碼、社群帳號（Google, Facebook, Apple）註冊
- **Acceptance Criteria**：
  - Email 需驗證（發送驗證信，24 小時有效）
  - 手機號碼需驗證（發送 SMS OTP，5 分鐘有效，6 位數字）
  - 密碼需符合強度要求（12+ 字元，大小寫英文 + 數字 + 特殊符號）
  - 社群帳號需 OAuth 2.0 授權（標準流程）
  - 註冊後自動登入（發送 JWT Access Token）
- **API**：`POST /api/v1/users/register`
- **Input**：
  ```json
  {
    "email": "user@example.com",
    "phone": "+886912345678",
    "password": "SecureP@ssw0rd123",
    "provider": "email|google|facebook|apple"
  }
  ```
- **Output**：
  ```json
  {
    "user_id": "uuid",
    "access_token": "jwt",
    "refresh_token": "jwt",
    "expires_in": 900
  }
  ```
- **Database**：`users` table
- **Security**：
  - OWASP #1: SQL Injection 防護（Parameterized queries）
  - OWASP #2: Broken Authentication 防護（強密碼策略）
  - OWASP #7: XSS 防護（Input validation）

#### FR-U002: 用戶登入
- **Priority**：Must-Have
- **Description**：用戶可使用 Email/手機號碼 + 密碼登入，或使用社群帳號登入
- **Acceptance Criteria**：
  - 登入失敗 5 次後，帳號鎖定 15 分鐘
  - 支援「記住我」功能（Refresh Token，30 天有效）
  - 支援 2FA（TOTP，Google Authenticator，可選）
  - 記錄登入歷史（IP, Device, Time）
- **API**：`POST /api/v1/users/login`
- **Response**：JWT Access Token (15 min) + Refresh Token (30 days)
- **Security**：
  - Brute-force protection（Rate limiting: 10 attempts/min per IP）
  - bcrypt password hashing（cost factor 12）
  - JWT secret rotation（每 90 天）

#### FR-U003: 密碼重設
- **Priority**：Must-Have
- **Description**：用戶忘記密碼時，可透過 Email 或 SMS 重設密碼
- **Acceptance Criteria**：
  - 發送重設連結/OTP（15 分鐘有效，單次使用）
  - 重設密碼需與舊密碼不同（檢查密碼歷史，最近 5 次）
  - 密碼重設後，所有現有 Session 失效（強制重新登入）
  - 發送通知 Email/SMS（告知密碼已重設）
- **API**：`POST /api/v1/users/password-reset`

#### FR-U004: 個人資料編輯
- **Priority**：Must-Have
- **Description**：用戶可編輯個人資料（姓名、生日、性別、地址、大頭照）
- **Acceptance Criteria**：
  - 大頭照需符合尺寸限制（500x500px, < 2MB, format: jpg/png/webp）
  - 地址需自動完成（Google Places API 整合）
  - 敏感資料變更需驗證（Email 驗證碼確認）
- **API**：`PUT /api/v1/users/:id`

#### FR-U005: 用戶權限管理（RBAC）
- **Priority**：Must-Have
- **Description**：支援 RBAC（Role-Based Access Control）
- **Roles**：
  - **Customer**（一般用戶）：瀏覽商品、下單、查詢訂單
  - **Seller**（賣家）：上架商品、管理庫存、查詢銷售報表
  - **CS**（客服）：查詢訂單、處理退貨、回覆客服訊息
  - **Admin**（管理員）：完整系統存取權限
- **Permissions**：Granular permissions（例如：`order:read`, `product:write`）
- **API**：`POST /api/v1/users/:id/roles`, `GET /api/v1/users/:id/permissions`

### 3.2 非功能需求

#### NFR-U001: 效能
- **Metric**：登入 API 回應時間 P95 < 100ms
- **Load**：支援每秒 1000+ 併發登入請求
- **Cache Strategy**：用戶資料快取於 Redis（TTL 10 分鐘）

#### NFR-U002: 安全性
- **Password Hashing**：bcrypt（cost factor 12）
- **JWT Secret**：256-bit random key（環境變數，每 90 天輪換）
- **Rate Limiting**：登入 API 限制 10 requests/min per IP
- **Compliance**：GDPR（用戶資料可匯出與刪除）

#### NFR-U003: 可用性
- **SLA**：99.95% Uptime
- **Failover**：主庫 → 備援庫切換時間 < 5 秒（Read Replicas）

---

## 4. 商品管理系統 (Product Management System)

### 4.1 功能需求

#### FR-P001: 商品上架
- **Priority**：Must-Have
- **Description**：賣家可上架商品（標題、描述、圖片、價格、庫存、規格）
- **Acceptance Criteria**：
  - 商品標題限制 100 字元（UTF-8）
  - 商品描述限制 5000 字元（支援富文本編輯器，HTML sanitization）
  - 商品圖片最多 10 張（800x800px, < 1MB per image, WebP format）
  - 支援多規格（顏色、尺寸、材質，最多 3 個維度）
  - 支援 SKU 管理（每個規格組合對應一個 SKU，最多 100 個 SKU per product）
  - 商品需經 Admin 審核（Pending → Approved/Rejected）
- **API**：`POST /api/v1/products`
- **Database**：`products`, `product_images`, `product_variants` tables
- **Image Processing**：
  - 自動產生縮圖（200x200px, 400x400px, 800x800px）
  - 上傳至 S3（CDN 加速）
  - WebP 格式轉換（壓縮率 > 30%）

#### FR-P002: 商品搜尋
- **Priority**：Must-Have
- **Description**：用戶可搜尋商品（關鍵字、分類、價格區間、評分、品牌）
- **Acceptance Criteria**：
  - 支援全文搜尋（Elasticsearch，中文分詞）
  - 支援搜尋建議（Autocomplete，基於 Elasticsearch Suggester）
  - 支援多重篩選（分類 AND 價格區間 AND 評分 AND 品牌）
  - 支援排序（價格低→高、價格高→低、銷量、評分、最新、相關性）
  - 支援分頁（每頁 20/40/60 個商品）
- **API**：`GET /api/v1/products/search?q={keyword}&category={id}&price_min={min}&price_max={max}&rating={min}&brand={id}&sort={field}&order={asc|desc}&page={page}&size={size}`
- **Performance**：搜尋回應時間 P95 < 200ms
- **Relevance**：使用 BM25 算法（Elasticsearch default）

#### FR-P003: 商品詳情頁
- **Priority**：Must-Have
- **Description**：顯示商品完整資訊（圖片輪播、描述、規格、價格、庫存、評價、相關商品）
- **Acceptance Criteria**：
  - 圖片支援 Lazy Loading + Progressive Loading（LQIP）
  - 評價支援分頁（每頁 20 則，排序：最新、最高評分、最低評分、最有幫助）
  - 顯示相關商品推薦（基於協同過濾，5 個商品）
  - 顯示「其他人也買了」（基於購買歷史，5 個商品）
  - 顯示「看過這個的人也看了」（基於瀏覽歷史，5 個商品）
- **API**：`GET /api/v1/products/:id`
- **Cache Strategy**：
  - 商品基本資訊（Redis, TTL 1 hour）
  - 商品圖片（CDN, TTL 7 days）
  - 評價（Redis, TTL 10 minutes）

#### FR-P004: 商品分類
- **Priority**：Must-Have
- **Description**：支援多層級分類（最多 3 層，樹狀結構）
- **Example**：
  - 電子產品 > 手機 > iPhone
  - 服飾 > 女裝 > 洋裝
  - 食品 > 零食 > 巧克力
- **API**：
  - `GET /api/v1/categories`（取得所有分類，樹狀結構）
  - `POST /api/v1/categories`（Admin 新增分類）
  - `PUT /api/v1/categories/:id`（Admin 編輯分類）
  - `DELETE /api/v1/categories/:id`（Admin 刪除分類，需檢查是否有商品）

#### FR-P005: 商品推薦
- **Priority**：Should-Have
- **Description**：首頁顯示個人化商品推薦
- **Algorithm**：
  - **冷啟動**（新用戶）：熱門商品（基於銷量，最近 30 天）
  - **暖啟動**（有瀏覽歷史）：協同過濾（User-Based CF，餘弦相似度）
  - **熱啟動**（有購買歷史）：混合推薦（70% Collaborative Filtering + 30% Content-Based）
- **API**：`GET /api/v1/products/recommendations`
- **Performance**：回應時間 P95 < 300ms
- **Refresh**：推薦結果快取 1 小時（Redis）

### 4.2 非功能需求

#### NFR-P001: 效能
- **Metric**：商品詳情頁載入時間 P95 < 500ms
- **Cache Strategy**：
  - 商品基本資訊（Redis, TTL 1 hour）
  - 商品圖片（CDN, TTL 7 days）
  - 搜尋結果（Redis, TTL 5 minutes）

#### NFR-P002: 擴展性
- **Metric**：支援 10 萬+ SKUs
- **Database Sharding**：商品表分片（Sharding by `product_id % 10`，10 個 shard）
- **Elasticsearch Cluster**：3 nodes（1 master + 2 data nodes）

#### NFR-P003: 可用性
- **Metric**：商品搜尋服務可用性 99.9%
- **Degradation**：Elasticsearch 故障時，降級使用 PostgreSQL 全文搜尋（`tsvector`）

---

## 5. 訂單管理系統 (Order Management System)

### 5.1 功能需求

#### FR-O001: 購物車管理
- **Priority**：Must-Have
- **Description**：用戶可將商品加入購物車、修改數量、刪除商品
- **Acceptance Criteria**：
  - 未登入用戶：購物車存於 LocalStorage（最多 20 個商品，30 天有效）
  - 已登入用戶：購物車存於資料庫（最多 100 個商品，永久保存）
  - 購物車數量變更時，即時檢查庫存（防止超賣）
  - 購物車商品價格自動更新（價格變動時顯示警告）
  - 自動移除下架商品（商品狀態變為 Rejected 時）
- **API**：
  - `POST /api/v1/cart/items`（Add to cart）
  - `PUT /api/v1/cart/items/:id`（Update quantity）
  - `DELETE /api/v1/cart/items/:id`（Remove from cart）
  - `GET /api/v1/cart`（Get cart）

#### FR-O002: 訂單建立
- **Priority**：Must-Have
- **Description**：用戶可將購物車商品結帳，建立訂單
- **Acceptance Criteria**：
  - 訂單建立前需檢查：
    - 庫存充足（Pessimistic locking）
    - 商品未下架（Status = Approved）
    - 價格未變動（與購物車價格一致，或顯示警告）
  - 支援促銷碼（折扣碼、滿額折、免運費）
  - 支援多種配送方式（宅配、超商取貨、門市自取）
  - 支援多種付款方式（信用卡、ATM、超商付款、貨到付款）
  - 訂單建立後，自動扣減庫存（Distributed Transaction）
  - 訂單建立後，清空購物車
- **API**：`POST /api/v1/orders`
- **Input**：
  ```json
  {
    "items": [{"sku": "sku-123", "quantity": 2}],
    "shipping_address_id": "uuid",
    "shipping_method": "home_delivery|store_pickup|self_pickup",
    "payment_method": "credit_card|atm|cvs|cod",
    "coupon_code": "SUMMER2024"
  }
  ```
- **Response**：
  ```json
  {
    "order_id": "uuid",
    "order_number": "2024013100001",
    "total_amount": 3000,
    "payment_url": "https://payment.example.com/pay?order_id=uuid"
  }
  ```
- **Distributed Transaction**（Saga Pattern）：
  1. Reserve Inventory（扣減庫存）
  2. Create Order（建立訂單）
  3. Payment（付款）
  4. Rollback：任一步驟失敗 → 回復庫存 + 取消訂單

#### FR-O003: 訂單查詢
- **Priority**：Must-Have
- **Description**：用戶可查詢訂單歷史與訂單狀態
- **Order Status**：
  - **Pending**（待付款）：訂單已建立，等待付款
  - **Paid**（已付款）：付款成功，等待出貨
  - **Shipped**（已出貨）：商品已出貨，物流中
  - **Delivered**（已送達）：商品已送達用戶
  - **Cancelled**（已取消）：用戶或系統取消訂單
  - **Refunded**（已退款）：退款完成
- **API**：
  - `GET /api/v1/orders/:id`（查詢單筆訂單）
  - `GET /api/v1/orders?status={status}&page={page}&size={size}`（查詢訂單列表）

#### FR-O004: 訂單取消
- **Priority**：Must-Have
- **Description**：用戶可在「未出貨」狀態下取消訂單
- **Acceptance Criteria**：
  - **Pending**（待付款）→ 可取消，無需退款，回復庫存
  - **Paid**（已付款）→ 可取消，需退款（5-7 個工作天），回復庫存
  - **Shipped**（已出貨）→ 無法取消，需走退貨流程
  - 取消後發送通知（Email + SMS）
- **API**：`PUT /api/v1/orders/:id/cancel`

#### FR-O005: 訂單退貨
- **Priority**：Should-Have
- **Description**：用戶可在收到商品後 7 天內申請退貨
- **Acceptance Criteria**：
  - 需上傳商品照片（證明商品瑕疵或錯誤，最多 5 張）
  - 客服審核後，寄送退貨標籤（Email）
  - 賣家收到退貨後，7 天內退款
  - 退貨原因：商品瑕疵、商品錯誤、不符合期望、其他
- **API**：`POST /api/v1/orders/:id/returns`

### 5.2 非功能需求

#### NFR-O001: 效能
- **Metric**：訂單建立 API 回應時間 P95 < 300ms
- **Load**：支援每秒 1000+ 併發訂單建立請求（雙十一峰值）
- **Queue**：訂單建立使用 RabbitMQ（非同步處理，削峰填谷）

#### NFR-O002: 一致性
- **Strategy**：Distributed Transaction（Saga Pattern with Compensation）
- **Idempotency**：同一筆訂單不會重複建立（`order_id` 唯一性檢查）

#### NFR-O003: 資料完整性
- **Metric**：訂單資料不遺失（Database ACID 保證）
- **Backup**：訂單表每小時備份（AWS RDS Automated Backups）

---

## 6. 支付系統 (Payment System)

### 6.1 功能需求

#### FR-PAY001: 信用卡付款
- **Priority**：Must-Have
- **Description**：支援信用卡付款（Visa, MasterCard, JCB, AMEX）
- **Payment Gateway**：綠界科技 ECPay
- **Flow**：
  1. 前端跳轉至 ECPay 付款頁（Hosted Payment Page）
  2. 用戶輸入信用卡資訊（卡號、有效期限、CVV）
  3. ECPay 回傳付款結果（Callback URL，使用 HMAC-SHA256 驗證）
  4. 系統更新訂單狀態（Pending → Paid）
  5. 發送付款成功通知（Email + SMS）
- **API**：`POST /api/v1/payments/credit-card`
- **Security**：
  - PCI DSS Level 1 Compliance（信用卡資訊不存於系統）
  - Tokenization（信用卡資訊以 Token 形式傳遞）
  - 3D Secure（額外驗證層，降低詐騙風險）

#### FR-PAY002: ATM 轉帳
- **Priority**：Must-Have
- **Description**：系統產生虛擬帳號，用戶於 3 天內轉帳
- **Flow**：
  1. 系統呼叫 ECPay API 產生虛擬帳號（銀行代碼 + 帳號）
  2. 用戶轉帳（銀行 ATM / 網路銀行）
  3. ECPay 收到款項後，回傳通知（Callback URL）
  4. 系統更新訂單狀態（Pending → Paid）
  5. 發送付款成功通知
- **API**：`POST /api/v1/payments/atm`
- **Timeout**：虛擬帳號 3 天後失效，訂單自動取消

#### FR-PAY003: 超商付款
- **Priority**：Should-Have
- **Description**：用戶於超商（7-11, FamilyMart, OK, Hi-Life）付款
- **Flow**：
  1. 系統呼叫 ECPay API 產生超商代碼（14 位數字）
  2. 用戶至超商繳費機輸入代碼
  3. ECPay 收到款項後，回傳通知
  4. 系統更新訂單狀態（Pending → Paid）
- **API**：`POST /api/v1/payments/cvs`
- **Limitation**：超商付款金額限制 < 20,000 新台幣

#### FR-PAY004: 貨到付款
- **Priority**：Should-Have
- **Description**：商品送達時，用戶現金付款給物流人員
- **Flow**：
  1. 訂單建立時，選擇「貨到付款」
  2. 物流人員送達時，收取現金
  3. 物流人員將款項轉交給平台（隔日到帳）
  4. 系統更新訂單狀態（Pending → Paid）
- **Limitation**：貨到付款訂單金額限制 < 10,000 新台幣

#### FR-PAY005: 退款處理
- **Priority**：Must-Have
- **Description**：訂單取消或退貨時，自動退款
- **Flow**：
  - **信用卡**：原路退回（7 個工作天，ECPay API）
  - **ATM**：退款至用戶指定帳戶（5 個工作天，需驗證帳戶）
  - **超商付款**：退款至用戶指定帳戶（5 個工作天）
  - **貨到付款**：無需退款（尚未付款）
- **API**：`POST /api/v1/payments/:id/refund`
- **Audit**：所有退款需記錄於 `payment_refunds` 表（Audit trail）

### 6.2 非功能需求

#### NFR-PAY001: 安全性
- **Compliance**：PCI DSS Level 1
- **Encryption**：信用卡資訊不存於系統（由 ECPay 代管）
- **Tokenization**：信用卡資訊以 Token 形式傳遞
- **HMAC Verification**：Callback URL 使用 HMAC-SHA256 驗證（防止偽造）

#### NFR-PAY002: 可靠性
- **Retry**：付款失敗時，自動重試 3 次（間隔 5 秒，Exponential backoff）
- **Idempotency**：同一筆訂單不會重複扣款（`payment_id` 唯一性檢查）
- **Timeout**：付款 API 超時時間 30 秒（避免長時間等待）

#### NFR-PAY003: 監控
- **Metric**：付款成功率 > 99%
- **Alert**：付款成功率 < 95% 時，發送告警（Slack, Email, PagerDuty）
- **Dashboard**：即時顯示付款成功率、失敗原因分佈（Grafana）

---

## 7. 物流系統 (Logistics System)

### 7.1 功能需求

#### FR-L001: 宅配配送
- **Priority**：Must-Have
- **Description**：支援宅配配送（黑貓宅急便、新竹物流、嘉里大榮）
- **Acceptance Criteria**：
  - 用戶可選擇配送時段（上午 9-12, 下午 13-18, 晚上 18-21）
  - 系統自動產生物流單號（API 串接物流商）
  - 物流人員取件後，系統更新訂單狀態（Paid → Shipped）
  - 用戶可追蹤物流狀態（即時更新，每 1 小時同步一次）
  - 送達後，系統更新訂單狀態（Shipped → Delivered）
- **API**：`POST /api/v1/logistics/delivery`
- **Tracking**：`GET /api/v1/logistics/tracking/:tracking_number`

#### FR-L002: 超商取貨
- **Priority**：Must-Have
- **Description**：用戶可選擇超商取貨（7-11, FamilyMart, OK, Hi-Life）
- **Acceptance Criteria**：
  - 用戶可查詢附近超商（Google Maps API，距離 < 5km）
  - 商品送達超商後，發送簡訊通知用戶（含取貨碼）
  - 用戶需於 7 天內取貨，逾期退回賣家（自動處理）
  - 取貨後，系統更新訂單狀態（Shipped → Delivered）
- **API**：`POST /api/v1/logistics/store-pickup`
- **Store Search**：`GET /api/v1/logistics/stores?lat={lat}&lng={lng}&radius={radius}`

#### FR-L003: 門市自取
- **Priority**：Should-Have
- **Description**：用戶可至賣家門市自取商品
- **Acceptance Criteria**：
  - 商品準備完成後，發送簡訊通知用戶（含 QR Code）
  - 用戶到店時，出示訂單 QR Code
  - 門市人員掃描 QR Code，確認訂單（Admin 系統）
  - 取貨後，系統更新訂單狀態（Paid → Delivered）
- **API**：`POST /api/v1/logistics/self-pickup`

### 7.2 非功能需求

#### NFR-L001: 可靠性
- **Metric**：物流資訊同步延遲 < 5 分鐘
- **Retry**：物流 API 失敗時，自動重試 5 次（間隔 1 分鐘）
- **Fallback**：物流 API 長時間失敗時，使用備用物流商

---

## 8. 庫存管理系統 (Inventory Management System)

### 8.1 功能需求

#### FR-I001: 庫存查詢
- **Priority**：Must-Have
- **Description**：賣家可查詢商品庫存數量
- **API**：`GET /api/v1/inventory?sku={sku}`
- **Real-time**：庫存數量即時更新（使用 Redis 快取，TTL 5 minutes）

#### FR-I002: 庫存扣減
- **Priority**：Must-Have
- **Description**：訂單建立時，自動扣減庫存
- **Strategy**：
  - **Pessimistic Locking**（悲觀鎖）：`SELECT ... FOR UPDATE`（PostgreSQL）
  - **Optimistic Locking**（樂觀鎖）：Version field + Retry（失敗時重試 3 次）
  - **Distributed Locking**（分散式鎖）：Redis SETNX（跨服務同步）
- **API**：`POST /api/v1/inventory/reserve`
- **Rollback**：訂單取消時，自動回復庫存

#### FR-I003: 庫存補貨
- **Priority**：Must-Have
- **Description**：賣家可手動補貨
- **API**：`POST /api/v1/inventory/restock`
- **Input**：
  ```json
  {
    "sku": "sku-123",
    "quantity": 100,
    "reason": "New shipment arrived"
  }
  ```

#### FR-I004: 庫存警報
- **Priority**：Should-Have
- **Description**：庫存低於安全水位時，發送告警
- **Threshold**：
  - 庫存 < 10 件 → Email 通知賣家（每日一次）
  - 庫存 < 5 件 → SMS 通知賣家（即時）
  - 庫存 = 0 → 自動下架商品（Status = Out of Stock）
- **API**：`GET /api/v1/inventory/alerts`

### 8.2 非功能需求

#### NFR-I001: 一致性
- **Metric**：庫存數量與實際庫存一致性 > 99.9%
- **Strategy**：每日盤點（與 ERP 系統同步，凌晨 2:00 執行）
- **Audit**：所有庫存變動記錄於 `inventory_logs` 表（Audit trail）

---

## 9. 客服系統 (Customer Service System)

### 9.1 功能需求

#### FR-CS001: 即時聊天
- **Priority**：Must-Have
- **Description**：用戶可與客服即時聊天（WebSocket）
- **Acceptance Criteria**：
  - 訊息延遲 < 1 秒（WebSocket 長連接）
  - 支援文字、圖片、檔案（< 10MB，格式：jpg/png/pdf）
  - 客服可同時處理 5 個對話（Queue management）
  - 聊天記錄保存 30 天（MongoDB）
- **API**：WebSocket `/ws/chat`
- **Features**：
  - 已讀回條（Message read status）
  - 輸入狀態（Typing indicator）
  - 離線訊息（Offline messages，用戶上線時推送）

#### FR-CS002: 常見問題（FAQ）
- **Priority**：Must-Have
- **Description**：提供常見問題列表（FAQ），分類清晰
- **Categories**：
  - 訂單問題（下單、付款、取消、退貨）
  - 商品問題（規格、保固、運送）
  - 帳號問題（註冊、登入、密碼重設）
  - 付款問題（信用卡、ATM、超商付款）
- **API**：`GET /api/v1/faq?category={category}`
- **Search**：支援關鍵字搜尋（Elasticsearch full-text search）

#### FR-CS003: 工單系統（Ticket System）
- **Priority**：Should-Have
- **Description**：用戶可建立客服工單（退貨申請、商品問題、建議）
- **Workflow**：
  1. 用戶建立工單（描述問題，上傳圖片）
  2. 系統自動分配給客服（Round-robin 分配）
  3. 客服處理工單（回覆、狀態變更）
  4. 用戶收到回覆通知（Email + App 推播）
  5. 用戶確認問題解決，工單關閉
- **API**：
  - `POST /api/v1/tickets`（建立工單）
  - `GET /api/v1/tickets/:id`（查詢工單）
  - `PUT /api/v1/tickets/:id`（更新工單）
- **Status**：Open, In Progress, Resolved, Closed

---

## 10. 行銷系統 (Marketing System)

### 10.1 功能需求

#### FR-M001: 促銷活動
- **Priority**：Must-Have
- **Description**：平台可建立促銷活動（限時折扣、滿額折、買一送一、秒殺）
- **Types**：
  - **限時折扣**：特定商品於特定時間享折扣（例如：雙十一 5 折）
  - **滿額折**：訂單金額達門檻即享折扣（例如：滿 1000 折 100）
  - **買一送一**：購買特定商品即贈送另一商品
  - **秒殺**：限量商品於特定時間開搶（例如：iPhone 秒殺價）
- **API**：
  - `POST /api/v1/promotions`（Admin 建立促銷活動）
  - `GET /api/v1/promotions`（查詢進行中的促銷活動）
  - `GET /api/v1/promotions/:id/products`（查詢促銷活動的商品）
- **Validation**：結帳時自動套用最優惠的促銷（單筆訂單僅限一個促銷）

#### FR-M002: 優惠券（Coupon）
- **Priority**：Must-Have
- **Description**：平台可發送優惠券（折扣碼），用戶結帳時輸入使用
- **Types**：
  - **折扣金額**：固定金額折扣（例如：-100 元）
  - **折扣百分比**：百分比折扣（例如：9 折）
  - **免運費**：免除運費（運費 = 0）
- **Constraints**：
  - 使用期限（例如：2024/01/01 - 2024/01/31）
  - 使用次數限制（例如：單人限用 1 次，總共限用 1000 次）
  - 最低消費門檻（例如：滿 500 元才可使用）
- **API**：
  - `POST /api/v1/coupons`（Admin 建立優惠券）
  - `GET /api/v1/coupons`（查詢可用優惠券）
  - `POST /api/v1/orders/apply-coupon`（訂單套用優惠券）
- **Validation**：優惠券使用後即失效（單次使用）

#### FR-M003: 推播通知（Push Notification）
- **Priority**：Should-Have
- **Description**：平台可發送推播通知（新品上市、促銷活動、訂單狀態更新）
- **Channels**：
  - **Email**：發送至用戶註冊 Email（使用 SendGrid）
  - **SMS**：發送至用戶手機號碼（使用 Twilio）
  - **Push Notification**：發送至用戶手機 App（使用 Firebase Cloud Messaging）
  - **App 內推播**：發送至 App 通知中心（WebSocket）
- **API**：
  - `POST /api/v1/notifications/send`（Admin 發送推播）
  - `GET /api/v1/notifications`（用戶查詢通知記錄）
- **Targeting**：
  - 全體用戶（Broadcast）
  - 特定用戶群（Segmentation，例如：近 30 天未購買用戶）
  - 單一用戶（Personalized）

---

## 11. 數據分析系統 (Analytics System)

### 11.1 功能需求

#### FR-A001: 銷售報表
- **Priority**：Must-Have
- **Description**：賣家可查詢銷售報表（日報、週報、月報、年報）
- **Metrics**：
  - **GMV**（Gross Merchandise Value）：商品交易總額
  - **訂單數**：總訂單數、成功訂單數、取消訂單數
  - **轉換率**：訂單數 / 訪客數
  - **AOV**（Average Order Value）：平均訂單價值
  - **Top 10 商品**：銷量排行、營收排行
- **API**：`GET /api/v1/analytics/sales?start_date={date}&end_date={date}&group_by={day|week|month}`
- **Visualization**：圖表顯示（折線圖、長條圖、圓餅圖）

#### FR-A002: 用戶行為分析
- **Priority**：Should-Have
- **Description**：追蹤用戶行為（瀏覽、搜尋、加入購物車、購買）
- **Events**：
  - **Page View**：用戶瀏覽頁面（首頁、商品詳情頁、分類頁）
  - **Search**：用戶搜尋關鍵字
  - **Add to Cart**：用戶加入購物車
  - **Checkout**：用戶進入結帳頁
  - **Purchase**：用戶完成購買
- **Tools**：
  - **Google Analytics 4**：網站流量分析
  - **Mixpanel**：用戶行為漏斗分析（Funnel analysis）
  - **Hotjar**：熱點圖（Heatmap）、用戶錄影（Session recording）
- **API**：`POST /api/v1/analytics/events`（發送事件至分析平台）

#### FR-A003: BI Dashboard
- **Priority**：Should-Have
- **Description**：即時顯示關鍵指標（KPI Dashboard）
- **Metrics**：
  - 今日 GMV、訂單數、訪客數、轉換率
  - 即時線上用戶數
  - 熱銷商品 Top 10
  - 庫存警報數量
  - 系統健康狀態（API 回應時間、錯誤率）
- **Tools**：
  - **Grafana**：即時圖表顯示
  - **Prometheus**：系統監控指標收集
  - **ELK Stack**：日誌分析（Elasticsearch, Logstash, Kibana）

---

## 12. 後台管理系統 (Admin System)

### 12.1 功能需求

#### FR-AD001: 用戶管理
- **Priority**：Must-Have
- **Description**：Admin 可查詢、編輯、停用用戶帳號
- **Features**：
  - 查詢用戶列表（支援搜尋、篩選、排序、分頁）
  - 查詢用戶詳情（個人資料、訂單歷史、購物車、瀏覽歷史）
  - 編輯用戶資料（修改 Email、手機號碼、角色）
  - 停用用戶帳號（Status = Disabled，無法登入）
- **API**：
  - `GET /api/v1/admin/users`（查詢用戶列表）
  - `GET /api/v1/admin/users/:id`（查詢用戶詳情）
  - `PUT /api/v1/admin/users/:id`（編輯用戶資料）
  - `DELETE /api/v1/admin/users/:id`（停用用戶帳號）

#### FR-AD002: 商品審核
- **Priority**：Must-Have
- **Description**：Admin 可審核賣家上架的商品（通過、拒絕）
- **Workflow**：
  1. 賣家上架商品（Status = Pending）
  2. Admin 審核商品（查看商品資訊、圖片、描述）
  3. Admin 通過/拒絕商品
     - 通過：Status = Approved，商品上架
     - 拒絕：Status = Rejected，通知賣家原因
- **API**：
  - `GET /api/v1/admin/products/pending`（查詢待審核商品）
  - `PUT /api/v1/admin/products/:id/review`（審核商品）

#### FR-AD003: 訂單管理
- **Priority**：Must-Have
- **Description**：Admin 可查詢所有訂單、手動退款、標記異常訂單
- **Features**：
  - 查詢訂單列表（支援搜尋、篩選、排序、分頁）
  - 查詢訂單詳情（用戶資訊、商品明細、付款資訊、物流資訊）
  - 手動退款（Admin 可強制退款，需填寫原因）
  - 標記異常訂單（例如：疑似詐騙、重複訂單）
- **API**：
  - `GET /api/v1/admin/orders`（查詢訂單列表）
  - `GET /api/v1/admin/orders/:id`（查詢訂單詳情）
  - `POST /api/v1/admin/orders/:id/refund`（手動退款）
  - `PUT /api/v1/admin/orders/:id/flag`（標記異常訂單）

---

## 13. 資料庫設計

### 13.1 資料表清單（20+ 資料表）

1. **users**（用戶表）：user_id, email, phone, password_hash, status, created_at, updated_at
2. **user_profiles**（用戶個人資料）：profile_id, user_id, name, birth_date, gender, avatar_url
3. **user_addresses**（用戶地址）：address_id, user_id, country, city, district, street, postal_code, is_default
4. **user_roles**（用戶角色）：role_id, user_id, role_name (Customer, Seller, CS, Admin)
5. **products**（商品表）：product_id, seller_id, title, description, price, status, category_id, created_at, updated_at
6. **product_images**（商品圖片）：image_id, product_id, url, sort_order
7. **product_variants**（商品規格）：variant_id, product_id, sku, color, size, material, price, stock
8. **product_categories**（商品分類）：category_id, name, parent_id, level, sort_order
9. **orders**（訂單表）：order_id, order_number, user_id, total_amount, status, payment_method, shipping_method, created_at
10. **order_items**（訂單商品明細）：item_id, order_id, sku, product_name, quantity, price
11. **payments**（付款記錄）：payment_id, order_id, payment_method, amount, status, transaction_id, created_at
12. **payment_refunds**（退款記錄）：refund_id, payment_id, amount, reason, status, created_at
13. **logistics**（物流記錄）：logistics_id, order_id, tracking_number, carrier, shipping_method, status, created_at
14. **inventory**（庫存表）：inventory_id, sku, quantity, reserved_quantity, warehouse_id, updated_at
15. **inventory_logs**（庫存變動記錄）：log_id, sku, quantity_change, reason, created_at
16. **promotions**（促銷活動）：promotion_id, name, type, discount_value, start_date, end_date, status
17. **coupons**（優惠券）：coupon_id, code, type, discount_value, min_amount, max_uses, expires_at
18. **reviews**（商品評價）：review_id, product_id, user_id, rating, comment, created_at
19. **carts**（購物車）：cart_id, user_id, created_at, updated_at
20. **cart_items**（購物車商品）：item_id, cart_id, sku, quantity, price, added_at
21. **notifications**（通知記錄）：notification_id, user_id, type, title, content, is_read, created_at
22. **analytics_events**（用戶行為事件）：event_id, user_id, event_type, event_data, created_at

### 13.2 索引策略

- **users**：Index on `email`, `phone`（唯一索引，加快登入查詢）
- **products**：Index on `category_id`, `seller_id`, `status`（加快商品搜尋）
- **products**：Full-text search index on `title`, `description`（PostgreSQL `tsvector`）
- **orders**：Index on `user_id`, `status`, `created_at`（加快訂單查詢）
- **order_items**：Index on `order_id`, `sku`（加快訂單明細查詢）
- **inventory**：Index on `sku`, `warehouse_id`（加快庫存查詢）
- **payments**：Index on `order_id`, `status`（加快付款查詢）
- **reviews**：Index on `product_id`, `user_id`, `rating`（加快評價查詢）

---

## 14. 非功能需求總覽

### 14.1 效能需求

| Metric | Target | Measurement Tool |
|--------|--------|------------------|
| API 回應時間（P95） | < 200ms | Datadog APM, New Relic |
| Page Load Time（P95） | < 2s | Lighthouse, WebPageTest |
| 併發用戶數 | 100,000+ | Load Testing（k6, Locust） |
| Database Query Time（P95） | < 50ms | PostgreSQL Slow Query Log |
| Cache Hit Rate | > 80% | Redis INFO stats |
| Throughput | 10,000+ req/sec | Load Balancer metrics |

### 14.2 可用性需求

| Metric | Target | Strategy |
|--------|--------|----------|
| Uptime | 99.95% | Multi-AZ Deployment（AWS, 3 AZs） |
| RTO（Recovery Time Objective） | < 1 hour | Automated Failover（AWS RDS Multi-AZ） |
| RPO（Recovery Point Objective） | < 5 minutes | Database Replication（Synchronous） |
| Load Balancer Health Check | < 30s | ELB Health Check Interval = 30s |

### 14.3 安全性需求

| Requirement | Implementation | Standard |
|-------------|----------------|----------|
| Authentication | JWT (Access Token 15 min, Refresh Token 30 days) | RFC 7519 |
| Authorization | RBAC (Role-Based Access Control) | NIST RBAC Model |
| Data Encryption（傳輸中） | TLS 1.3 | RFC 8446 |
| Data Encryption（靜態） | AES-256 | FIPS 140-2 |
| Password Hashing | bcrypt（cost factor 12） | OWASP |
| Rate Limiting | 1000 req/min per user | Token Bucket Algorithm |
| OWASP Top 10 Protection | WAF（AWS WAF）, Input Validation, Output Encoding | OWASP 2021 |
| PCI DSS Compliance | Level 1（信用卡資訊不存於系統） | PCI DSS v3.2.1 |
| GDPR Compliance | 用戶資料可匯出與刪除（Right to be forgotten） | GDPR Article 17 |

### 14.4 擴展性需求

| Requirement | Strategy | Capacity |
|-------------|----------|----------|
| Horizontal Scaling | ECS Auto Scaling（CPU > 70% → Scale out） | Max 100 containers |
| Database Scaling | Read Replicas（3 replicas）, Sharding（by `user_id % 10`） | 10 shards |
| Cache Strategy | Redis Cluster（3 masters + 3 replicas） | 6 nodes |
| CDN | Cloudflare（Static assets, Images, Videos） | Global CDN |
| Message Queue | RabbitMQ Cluster（3 nodes）, Kafka Cluster（3 brokers） | 10,000 msg/sec |
| Database Connection Pool | pgBouncer（Max 1000 connections per DB） | 1000 connections |

---

## 15. 技術決策記錄（ADRs）

### ADR-001: 選擇 Microservices 架構
- **Context**：系統規模大（10 個子系統），團隊規模大（50+ 工程師），需支援獨立部署與技術棧自由
- **Decision**：採用 Microservices 架構
- **Consequences**：
  - ✅ Pros：獨立部署、技術棧自由、團隊自主、易於擴展
  - ❌ Cons：複雜度增加、分散式交易挑戰、網路延遲、監控複雜

### ADR-002: 選擇 PostgreSQL 作為主資料庫
- **Context**：需要 ACID 保證、複雜查詢（JOIN）、全文搜尋、JSON 支援
- **Decision**：採用 PostgreSQL 15
- **Consequences**：
  - ✅ Pros：成熟穩定、豐富擴充功能（PostGIS, pgvector）、社群支援強
  - ❌ Cons：寫入效能略遜於 MySQL（單執行緒寫入瓶頸）

### ADR-003: 選擇 Elasticsearch 作為搜尋引擎
- **Context**：商品搜尋需支援全文搜尋、自動完成、多重篩選、相關性排序
- **Decision**：採用 Elasticsearch 8.11
- **Consequences**：
  - ✅ Pros：強大搜尋功能、水平擴展、即時索引
  - ❌ Cons：資料一致性挑戰（Eventual Consistency）、JVM 記憶體管理複雜

### ADR-004: 選擇 Redis 作為快取與 Session 儲存
- **Context**：需要高效能快取、Session 管理、分散式鎖、排行榜功能
- **Decision**：採用 Redis 7
- **Consequences**：
  - ✅ Pros：超快速（< 1ms latency）、豐富資料結構（String, List, Set, Sorted Set, Hash）
  - ❌ Cons：資料持久化挑戰（RDB vs AOF trade-off）、記憶體容量限制

### ADR-005: 選擇 Kafka 作為事件串流平台
- **Context**：需要事件驅動架構、非同步訊息處理、高吞吐量、事件重播
- **Decision**：採用 Apache Kafka 3.6
- **Consequences**：
  - ✅ Pros：高吞吐量（百萬 msg/sec）、持久化、事件重播、Exactly-once semantics
  - ❌ Cons：學習曲線陡峭、運維複雜（Zookeeper 依賴，Kafka 3.0+ 已移除）

### ADR-006: 選擇 AWS 作為雲端平台
- **Context**：需要高可用性、全球部署、豐富服務生態系（ECS, RDS, S3, CloudFront, Lambda）
- **Decision**：採用 AWS
- **Consequences**：
  - ✅ Pros：成熟穩定、全球 CDN、豐富服務、自動備份、安全性高
  - ❌ Cons：成本較高（相較於 GCP, Azure）、Vendor lock-in 風險

### ADR-007: 選擇 Next.js 14 作為前端框架
- **Context**：需要 SSR（Server-Side Rendering）、SEO 優化、快速開發、React 生態系
- **Decision**：採用 Next.js 14（App Router）
- **Consequences**：
  - ✅ Pros：SSR、SSG、ISR 支援、SEO 友善、React Server Components、零配置
  - ❌ Cons：伺服器資源消耗較高（相較於 CSR）、學習曲線（App Router）

### ADR-008: 選擇 Saga Pattern 處理分散式交易
- **Context**：訂單建立需跨多個服務（訂單服務、庫存服務、付款服務），需保證一致性
- **Decision**：採用 Saga Pattern（Choreography-based）
- **Consequences**：
  - ✅ Pros：服務解耦、無需分散式鎖、易於擴展
  - ❌ Cons：補償邏輯複雜、偵錯困難、一致性延遲（Eventual Consistency）

### ADR-009: 選擇 JWT 作為身份驗證機制
- **Context**：需要無狀態身份驗證、支援 API Gateway、跨服務驗證
- **Decision**：採用 JWT（JSON Web Token）
- **Consequences**：
  - ✅ Pros：無狀態、易於擴展、跨域支援、標準化（RFC 7519）
  - ❌ Cons：Token 無法撤銷（需依賴 Refresh Token rotation）、Token 大小較大

### ADR-010: 選擇 ECS Fargate 作為容器平台
- **Context**：需要容器化部署、自動擴展、無需管理 EC2 實例
- **Decision**：採用 AWS ECS Fargate
- **Consequences**：
  - ✅ Pros：Serverless 容器、自動擴展、無需管理基礎設施、按需付費
  - ❌ Cons：成本較高（相較於 EC2）、啟動時間較長（相較於 Lambda）

---

## 16. 附錄

### 16.1 API 端點清單（50+ APIs）

```
# 用戶管理（5 個 APIs）
POST   /api/v1/users/register
POST   /api/v1/users/login
POST   /api/v1/users/password-reset
PUT    /api/v1/users/:id
POST   /api/v1/users/:id/roles

# 商品管理（10 個 APIs）
GET    /api/v1/products
GET    /api/v1/products/:id
POST   /api/v1/products
PUT    /api/v1/products/:id
DELETE /api/v1/products/:id
GET    /api/v1/products/search
GET    /api/v1/products/recommendations
GET    /api/v1/categories
POST   /api/v1/categories
DELETE /api/v1/categories/:id

# 訂單管理（10 個 APIs）
POST   /api/v1/cart/items
PUT    /api/v1/cart/items/:id
DELETE /api/v1/cart/items/:id
GET    /api/v1/cart
POST   /api/v1/orders
GET    /api/v1/orders/:id
GET    /api/v1/orders
PUT    /api/v1/orders/:id/cancel
POST   /api/v1/orders/:id/returns
POST   /api/v1/orders/apply-coupon

# 支付系統（5 個 APIs）
POST   /api/v1/payments/credit-card
POST   /api/v1/payments/atm
POST   /api/v1/payments/cvs
POST   /api/v1/payments/:id/refund
GET    /api/v1/payments/:id

# 物流系統（4 個 APIs）
POST   /api/v1/logistics/delivery
POST   /api/v1/logistics/store-pickup
POST   /api/v1/logistics/self-pickup
GET    /api/v1/logistics/tracking/:tracking_number

# 庫存管理（4 個 APIs）
GET    /api/v1/inventory
POST   /api/v1/inventory/reserve
POST   /api/v1/inventory/restock
GET    /api/v1/inventory/alerts

# 客服系統（4 個 APIs）
WebSocket /ws/chat
GET    /api/v1/faq
POST   /api/v1/tickets
PUT    /api/v1/tickets/:id

# 行銷系統（6 個 APIs）
POST   /api/v1/promotions
GET    /api/v1/promotions
POST   /api/v1/coupons
GET    /api/v1/coupons
POST   /api/v1/notifications/send
GET    /api/v1/notifications

# 數據分析（3 個 APIs）
GET    /api/v1/analytics/sales
POST   /api/v1/analytics/events
GET    /api/v1/analytics/dashboard

# 後台管理（6 個 APIs）
GET    /api/v1/admin/users
PUT    /api/v1/admin/users/:id
DELETE /api/v1/admin/users/:id
GET    /api/v1/admin/products/pending
PUT    /api/v1/admin/products/:id/review
POST   /api/v1/admin/orders/:id/refund
```

### 16.2 技術棧版本

| Technology | Version | Release Date |
|------------|---------|--------------|
| Next.js | 14.1.0 | 2024-01-16 |
| React | 18.2.0 | 2022-06-14 |
| TypeScript | 5.3.3 | 2023-11-13 |
| Node.js | 20.11.0 | 2024-01-09 |
| Python | 3.12.1 | 2023-12-07 |
| Go | 1.21.6 | 2024-01-09 |
| PostgreSQL | 15.5 | 2023-11-09 |
| Redis | 7.2.4 | 2023-12-13 |
| Elasticsearch | 8.11.4 | 2024-01-05 |
| Kafka | 3.6.1 | 2023-12-21 |
| RabbitMQ | 3.12.11 | 2023-12-22 |

---

**文件版本**：V1.0  
**最後更新**：2026-02-01  
**文件作者**：Product Manager  
**審核者**：System Architect  
**總行數**：約 900 行（精簡版，完整版預計 2000+ 行）
