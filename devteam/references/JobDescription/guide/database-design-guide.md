# Database Design Guide (資料庫設計指南)

## 📌 文檔概述 (Document Overview)

本指南定義 HyperHeroX 專案的資料庫設計標準，涵蓋 Schema 設計、Sharding 策略、Indexing 優化、Migration 管理、ORM 最佳實踐，確保資料層的一致性、效能、安全性與可擴展性。

### 適用範圍 (Scope)
- ✅ PostgreSQL Schema 設計標準
- ✅ Database Sharding 與 Partitioning 策略
- ✅ Indexing 優化與查詢效能
- ✅ Database Migration 管理
- ✅ ORM 最佳實踐 (Prisma, TypeORM, SQLAlchemy, GORM)
- ✅ Database Security (Column-level Encryption, Audit Trail)
- ✅ Backup & Disaster Recovery

### 整合規範 (Related Specs)
- [tech-stack.md](./tech-stack.md) - Database Stack (PostgreSQL, Redis, MongoDB)
- [security-guidelines.md](./security-guidelines.md) - Database Security (AES-256, Column-level Encryption)
- [architecture.md](./architecture.md) - Database Sharding Strategy
- [api-design-guide.md](./api-design-guide.md) - API Response Data Format

---

## 🎯 資料庫設計原則 (Database Design Principles)

| 原則 | 說明 | 實踐方式 |
|------|------|---------|
| **正規化優先** (Normalization First) | 遵循 3NF (Third Normal Form) | 避免資料重複, 確保資料一致性 |
| **效能導向** (Performance-Oriented) | 查詢效能 P95 < 50ms | 適當反正規化 (Denormalization), Indexing 優化 |
| **安全優先** (Security First) | 敏感資料保護 | Column-level Encryption (PII), Audit Trail |
| **可擴展性** (Scalability) | 支援 Horizontal Scaling | Sharding by user_id, Partitioning by date |
| **資料一致性** (Data Consistency) | ACID Transaction | 使用 PostgreSQL Transaction, Optimistic Locking |

---

## 🗄️ Database Stack (資料庫堆疊)

依據 **tech-stack.md (Database Stack)**：

| 資料庫 | 用途 | 資料類型 | 備註 |
|--------|------|---------|------|
| **PostgreSQL 15** | 主要資料庫 | 結構化資料 (Users, Orders, Products) | ✅ ACID, ✅ JSONB 支援, ✅ 擴展性強 |
| **Redis 7** | 快取 + Session Store | 快取, Session, Rate Limiting 計數器 | ✅ 超高速讀取 (< 1ms), ✅ Pub/Sub |
| **MongoDB 6** | 文檔儲存 | 日誌, Audit Trail, Product Reviews | ✅ 彈性 Schema, ✅ 地理空間查詢 |

### Database 選擇決策矩陣

| 需求 | PostgreSQL | Redis | MongoDB |
|------|-----------|-------|---------|
| 結構化交易資料 (Users, Orders) | ✅ **主要選擇** | ❌ | ❌ |
| 快取與 Session | ❌ | ✅ **主要選擇** | ❌ |
| 日誌與 Audit Trail | ⚠️ 可用 (JSON 欄位) | ❌ | ✅ **主要選擇** |
| 全文搜尋 | ⚠️ 可用 (tsvector) | ❌ | ✅ **主要選擇** |
| 地理空間查詢 | ⚠️ 可用 (PostGIS) | ❌ | ✅ **主要選擇** |
| ACID Transaction | ✅ | ❌ | ⚠️ 有限支援 |

**決策**:
- ✅ PostgreSQL: 主要資料庫 (Users, Orders, Products, Inventory)
- ✅ Redis: 快取與 Session (API Response Cache, JWT Token Blacklist)
- ✅ MongoDB: 日誌與 Audit Trail (API Logs, User Activity Logs)

---

## 📐 Schema 設計標準 (Schema Design Standards)

### 命名規範 (Naming Conventions)

#### Table 命名規範
| 規則 | ✅ CORRECT | ❌ INCORRECT |
|------|-----------|------------|
| **複數名詞** | `users`, `orders`, `products` | `user`, `order`, `product` |
| **小寫 + 底線** | `order_items`, `user_addresses` | `OrderItems`, `userAddresses` |
| **避免縮寫** | `user_addresses` | `usr_addr` |
| **避免保留字** | `user_orders` | `order` (MySQL 保留字) |

#### Column 命名規範
| 規則 | ✅ CORRECT | ❌ INCORRECT |
|------|-----------|------------|
| **小寫 + 底線** | `user_id`, `created_at`, `is_active` | `userId`, `CreatedAt`, `isActive` |
| **布林值前綴** | `is_active`, `has_premium`, `can_edit` | `active`, `premium`, `edit` |
| **日期時間後綴** | `created_at`, `updated_at`, `deleted_at` | `create_date`, `update_time` |
| **外鍵命名** | `user_id`, `product_id`, `order_id` | `user`, `product_fk` |

#### Index 命名規範
| 類型 | 格式 | 範例 |
|------|------|------|
| **Primary Key** | `pk_<table>` | `pk_users` |
| **Foreign Key** | `fk_<table>_<column>` | `fk_orders_user_id` |
| **Unique Index** | `uk_<table>_<column>` | `uk_users_email` |
| **General Index** | `idx_<table>_<column>` | `idx_orders_created_at` |
| **Composite Index** | `idx_<table>_<col1>_<col2>` | `idx_orders_user_id_status` |

---

### 資料型別標準 (Data Type Standards)

#### PostgreSQL 資料型別選擇

| 資料類型 | 適用場景 | PostgreSQL 型別 | 範例 |
|---------|---------|----------------|------|
| **主鍵 (Primary Key)** | 自動遞增 ID | `SERIAL` or `BIGSERIAL` | `id SERIAL PRIMARY KEY` |
| **UUID** | 分散式系統 ID | `UUID` | `id UUID PRIMARY KEY DEFAULT gen_random_uuid()` |
| **短文字** | 名稱, Email (< 255 字元) | `VARCHAR(n)` | `name VARCHAR(100)`, `email VARCHAR(255)` |
| **長文字** | 描述, 內容 (無長度限制) | `TEXT` | `description TEXT` |
| **整數** | 年齡, 數量 | `INTEGER` (4 bytes) or `BIGINT` (8 bytes) | `age INTEGER`, `quantity INTEGER` |
| **小數** | 價格, 金額 (精確) | `NUMERIC(p, s)` | `price NUMERIC(10, 2)` (最多 10 位, 2 位小數) |
| **浮點數** | 座標 (不需精確) | `DOUBLE PRECISION` | `latitude DOUBLE PRECISION` |
| **布林值** | 是/否 | `BOOLEAN` | `is_active BOOLEAN DEFAULT true` |
| **日期時間** | 時間戳 | `TIMESTAMP WITH TIME ZONE` | `created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()` |
| **JSON** | 彈性欄位 (metadata, settings) | `JSONB` (推薦, 索引支援) | `metadata JSONB` |
| **陣列** | Tags, Categories | `TEXT[]` | `tags TEXT[]` |
| **枚舉** | 固定選項 (狀態, 角色) | `ENUM` or `VARCHAR` + CHECK Constraint | `status VARCHAR(20) CHECK (status IN ('pending', 'completed'))` |

#### 資料型別選擇最佳實踐

**1. Primary Key 選擇**:
| 類型 | 適用場景 | 優點 | 缺點 |
|------|---------|------|------|
| **SERIAL** | 單一資料庫 (不需分散式) | ✅ 自動遞增, 簡單 | ❌ 不適合 Sharding (ID 衝突) |
| **UUID** | 分散式系統 (Sharding) | ✅ 全域唯一, 不衝突 | ❌ 儲存空間大 (16 bytes vs 4 bytes) |
| **ULID** | 分散式系統 (時間排序) | ✅ 全域唯一, ✅ 時間排序 | ❌ 需額外套件 |

**決策**:
- ✅ **非 Sharding Table**: 使用 `SERIAL` (簡單高效)
- ✅ **Sharding Table**: 使用 `UUID` (避免 ID 衝突)

**2. 金額欄位**:
```sql
-- ✅ CORRECT - 使用 NUMERIC (精確)
price NUMERIC(10, 2)  -- 最多 10 位數, 2 位小數

-- ❌ INCORRECT - 使用 FLOAT (精度問題)
price FLOAT  -- 浮點數會有精度誤差
```

**3. 日期時間欄位**:
```sql
-- ✅ CORRECT - 使用 TIMESTAMP WITH TIME ZONE
created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()

-- ❌ INCORRECT - 使用 TIMESTAMP (不含時區)
created_at TIMESTAMP DEFAULT NOW()
```

**4. 枚舉欄位**:
```sql
-- ✅ CORRECT - 使用 VARCHAR + CHECK Constraint (彈性)
status VARCHAR(20) CHECK (status IN ('pending', 'processing', 'completed', 'cancelled'))

-- ⚠️ ALTERNATIVE - 使用 ENUM Type (效能好但不彈性)
CREATE TYPE order_status AS ENUM ('pending', 'processing', 'completed', 'cancelled');
status order_status NOT NULL DEFAULT 'pending'
```

**優缺點比較**:
| 方法 | 優點 | 缺點 |
|------|------|------|
| **VARCHAR + CHECK** | ✅ 彈性 (易於新增選項) | ❌ 儲存空間較大 |
| **ENUM** | ✅ 效能好, ✅ 儲存空間小 | ❌ 新增選項需 ALTER TYPE |

**決策**: ✅ 優先使用 **VARCHAR + CHECK Constraint** (彈性優先)

---

### 資料表設計範例 (Table Design Examples)

#### 1. Users Table (使用者資料表)
```sql
CREATE TABLE users (
  -- Primary Key
  id BIGSERIAL PRIMARY KEY,
  
  -- 基本資訊
  name VARCHAR(100) NOT NULL,
  email VARCHAR(255) NOT NULL UNIQUE,
  password_hash VARCHAR(255) NOT NULL,  -- bcrypt hash
  
  -- 角色與權限 (依據 security-guidelines.md RBAC)
  role VARCHAR(20) NOT NULL DEFAULT 'user' 
    CHECK (role IN ('admin', 'user', 'vendor', 'cs', 'guest')),
  
  -- 安全性
  email_verified BOOLEAN DEFAULT false,
  mfa_secret VARCHAR(64),  -- TOTP Secret (可選)
  mfa_enabled BOOLEAN DEFAULT false,
  
  -- 元資料
  metadata JSONB,  -- 彈性欄位 (preferences, settings)
  
  -- 時間戳
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
  updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
  deleted_at TIMESTAMP WITH TIME ZONE,  -- Soft Delete
  
  -- Constraints
  CONSTRAINT check_email_format CHECK (email ~* '^[A-Za-z0-9._%+-]+@[A-Za-z0-9.-]+\.[A-Z|a-z]{2,}$')
);

-- Indexes
CREATE UNIQUE INDEX uk_users_email ON users(email) WHERE deleted_at IS NULL;
CREATE INDEX idx_users_role ON users(role);
CREATE INDEX idx_users_created_at ON users(created_at);
CREATE INDEX idx_users_deleted_at ON users(deleted_at) WHERE deleted_at IS NOT NULL;

-- Comments
COMMENT ON TABLE users IS '使用者資料表';
COMMENT ON COLUMN users.email IS '使用者 Email (唯一)';
COMMENT ON COLUMN users.password_hash IS 'bcrypt 雜湊密碼 (cost 12)';
COMMENT ON COLUMN users.role IS '使用者角色 (admin, user, vendor, cs, guest)';
```

#### 2. Products Table (商品資料表)
```sql
CREATE TABLE products (
  -- Primary Key
  id BIGSERIAL PRIMARY KEY,
  
  -- 基本資訊
  name VARCHAR(200) NOT NULL,
  slug VARCHAR(200) NOT NULL UNIQUE,  -- SEO 友善 URL
  description TEXT,
  
  -- 分類
  category_id INTEGER NOT NULL,
  tags TEXT[],  -- 標籤陣列
  
  -- 價格與庫存
  price NUMERIC(10, 2) NOT NULL CHECK (price >= 0),
  currency VARCHAR(3) NOT NULL DEFAULT 'USD',
  stock_quantity INTEGER NOT NULL DEFAULT 0 CHECK (stock_quantity >= 0),
  
  -- 狀態
  status VARCHAR(20) NOT NULL DEFAULT 'active' 
    CHECK (status IN ('active', 'inactive', 'out_of_stock', 'discontinued')),
  
  -- 供應商
  vendor_id BIGINT NOT NULL,
  
  -- 元資料
  images JSONB,  -- 商品圖片 (array of image URLs)
  specifications JSONB,  -- 規格 (CPU, RAM, Storage, etc.)
  
  -- 時間戳
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
  updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
  deleted_at TIMESTAMP WITH TIME ZONE,
  
  -- Foreign Keys
  FOREIGN KEY (vendor_id) REFERENCES users(id) ON DELETE RESTRICT
);

-- Indexes
CREATE UNIQUE INDEX uk_products_slug ON products(slug) WHERE deleted_at IS NULL;
CREATE INDEX idx_products_category_id ON products(category_id);
CREATE INDEX idx_products_vendor_id ON products(vendor_id);
CREATE INDEX idx_products_status ON products(status);
CREATE INDEX idx_products_price ON products(price);
CREATE INDEX idx_products_created_at ON products(created_at);

-- Full-Text Search Index
CREATE INDEX idx_products_name_fts ON products USING gin(to_tsvector('english', name));
CREATE INDEX idx_products_description_fts ON products USING gin(to_tsvector('english', description));

-- JSONB Index (for specifications query)
CREATE INDEX idx_products_specifications ON products USING gin(specifications);

-- Comments
COMMENT ON TABLE products IS '商品資料表';
COMMENT ON COLUMN products.slug IS 'SEO 友善 URL (唯一)';
COMMENT ON COLUMN products.price IS '商品價格 (NUMERIC 精確計算)';
COMMENT ON COLUMN products.stock_quantity IS '庫存數量';
```

#### 3. Orders Table (訂單資料表)
```sql
CREATE TABLE orders (
  -- Primary Key
  id BIGSERIAL PRIMARY KEY,
  
  -- 訂單編號 (業務用)
  order_number VARCHAR(50) NOT NULL UNIQUE,  -- e.g., "ORD-20260131-000001"
  
  -- 使用者
  user_id BIGINT NOT NULL,
  
  -- 訂單狀態
  status VARCHAR(20) NOT NULL DEFAULT 'pending' 
    CHECK (status IN ('pending', 'processing', 'paid', 'shipped', 'delivered', 'cancelled', 'refunded')),
  
  -- 金額
  subtotal NUMERIC(10, 2) NOT NULL CHECK (subtotal >= 0),
  tax NUMERIC(10, 2) NOT NULL DEFAULT 0 CHECK (tax >= 0),
  shipping_fee NUMERIC(10, 2) NOT NULL DEFAULT 0 CHECK (shipping_fee >= 0),
  discount NUMERIC(10, 2) NOT NULL DEFAULT 0 CHECK (discount >= 0),
  total NUMERIC(10, 2) NOT NULL CHECK (total >= 0),
  currency VARCHAR(3) NOT NULL DEFAULT 'USD',
  
  -- 收件資訊
  shipping_address JSONB NOT NULL,  -- {name, phone, address, city, state, zip, country}
  
  -- 支付資訊
  payment_method VARCHAR(50),  -- 'credit_card', 'paypal', 'stripe'
  payment_transaction_id VARCHAR(100),  -- 支付平台交易 ID
  paid_at TIMESTAMP WITH TIME ZONE,
  
  -- 時間戳
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
  updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
  deleted_at TIMESTAMP WITH TIME ZONE,
  
  -- Foreign Keys
  FOREIGN KEY (user_id) REFERENCES users(id) ON DELETE RESTRICT
);

-- Indexes
CREATE UNIQUE INDEX uk_orders_order_number ON orders(order_number) WHERE deleted_at IS NULL;
CREATE INDEX idx_orders_user_id ON orders(user_id);
CREATE INDEX idx_orders_status ON orders(status);
CREATE INDEX idx_orders_created_at ON orders(created_at);
CREATE INDEX idx_orders_paid_at ON orders(paid_at);

-- Composite Index (常見查詢: 查詢某使用者的特定狀態訂單)
CREATE INDEX idx_orders_user_id_status ON orders(user_id, status);

-- Comments
COMMENT ON TABLE orders IS '訂單資料表';
COMMENT ON COLUMN orders.order_number IS '訂單編號 (業務用, 唯一)';
COMMENT ON COLUMN orders.total IS '訂單總金額 (subtotal + tax + shipping_fee - discount)';
```

#### 4. Order Items Table (訂單明細資料表)
```sql
CREATE TABLE order_items (
  -- Primary Key
  id BIGSERIAL PRIMARY KEY,
  
  -- 訂單與商品
  order_id BIGINT NOT NULL,
  product_id BIGINT NOT NULL,
  
  -- 商品資訊 (快照, 避免商品修改影響歷史訂單)
  product_name VARCHAR(200) NOT NULL,
  product_price NUMERIC(10, 2) NOT NULL,
  
  -- 數量與金額
  quantity INTEGER NOT NULL CHECK (quantity > 0),
  subtotal NUMERIC(10, 2) NOT NULL CHECK (subtotal >= 0),
  
  -- 時間戳
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
  updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
  
  -- Foreign Keys
  FOREIGN KEY (order_id) REFERENCES orders(id) ON DELETE CASCADE,
  FOREIGN KEY (product_id) REFERENCES products(id) ON DELETE RESTRICT
);

-- Indexes
CREATE INDEX idx_order_items_order_id ON order_items(order_id);
CREATE INDEX idx_order_items_product_id ON order_items(product_id);

-- Comments
COMMENT ON TABLE order_items IS '訂單明細資料表';
COMMENT ON COLUMN order_items.product_name IS '商品名稱快照 (避免商品修改影響歷史訂單)';
COMMENT ON COLUMN order_items.product_price IS '商品價格快照';
```

---

### 正規化與反正規化 (Normalization vs Denormalization)

#### 正規化 (Normalization) - 3NF (Third Normal Form)

**目標**: 避免資料重複, 確保資料一致性

**範例: 正規化的 Orders & Order Items**:
```sql
-- ✅ CORRECT - 正規化設計
-- Orders Table (訂單主表)
CREATE TABLE orders (
  id BIGSERIAL PRIMARY KEY,
  user_id BIGINT NOT NULL,
  total NUMERIC(10, 2) NOT NULL,
  ...
);

-- Order Items Table (訂單明細)
CREATE TABLE order_items (
  id BIGSERIAL PRIMARY KEY,
  order_id BIGINT NOT NULL,
  product_id BIGINT NOT NULL,
  quantity INTEGER NOT NULL,
  ...
  FOREIGN KEY (order_id) REFERENCES orders(id)
);
```

**優點**:
- ✅ 資料一致性 (避免重複)
- ✅ 易於維護 (修改 product 不影響 order_items)

**缺點**:
- ❌ 查詢效能較差 (需 JOIN)

---

#### 反正規化 (Denormalization) - 適當冗餘提升效能

**目標**: 減少 JOIN, 提升查詢效能

**範例: 反正規化的 Orders (加入 user_name)**:
```sql
-- ⚠️ DENORMALIZED - 反正規化設計 (冗餘 user_name)
CREATE TABLE orders (
  id BIGSERIAL PRIMARY KEY,
  user_id BIGINT NOT NULL,
  user_name VARCHAR(100) NOT NULL,  -- 冗餘欄位 (從 users table 複製)
  user_email VARCHAR(255) NOT NULL,  -- 冗餘欄位
  total NUMERIC(10, 2) NOT NULL,
  ...
);
```

**優點**:
- ✅ 查詢效能提升 (不需 JOIN users table)
- ✅ 適用於讀多寫少的場景

**缺點**:
- ❌ 資料重複 (user_name 在 users 與 orders 都存在)
- ❌ 維護困難 (user_name 修改需同步更新 orders)

---

#### 反正規化最佳實踐

**適用場景**:
1. **高頻讀取, 低頻寫入** (e.g., 商品名稱快照)
2. **避免複雜 JOIN** (e.g., 多層級資料)
3. **歷史資料快照** (e.g., 訂單商品快照)

**範例: Order Items 商品快照**:
```sql
-- ✅ CORRECT - 反正規化商品快照 (避免商品修改影響歷史訂單)
CREATE TABLE order_items (
  id BIGSERIAL PRIMARY KEY,
  order_id BIGINT NOT NULL,
  product_id BIGINT NOT NULL,
  
  -- 商品快照 (反正規化)
  product_name VARCHAR(200) NOT NULL,
  product_price NUMERIC(10, 2) NOT NULL,
  product_image_url VARCHAR(500),
  
  quantity INTEGER NOT NULL,
  subtotal NUMERIC(10, 2) NOT NULL,
  ...
);
```

**優點**:
- ✅ 保留歷史資料 (商品修改不影響已下單訂單)
- ✅ 查詢效能提升 (不需 JOIN products table)

---

### Soft Delete vs Hard Delete (軟刪除 vs 硬刪除)

#### Soft Delete (軟刪除, 推薦)

**定義**: 不實際刪除資料, 而是標記 `deleted_at` 欄位

```sql
-- ✅ CORRECT - Soft Delete
CREATE TABLE users (
  id BIGSERIAL PRIMARY KEY,
  name VARCHAR(100) NOT NULL,
  email VARCHAR(255) NOT NULL,
  deleted_at TIMESTAMP WITH TIME ZONE,  -- NULL = 未刪除, NOT NULL = 已刪除
  ...
);

-- 查詢未刪除的使用者
SELECT * FROM users WHERE deleted_at IS NULL;

-- 刪除使用者 (Soft Delete)
UPDATE users SET deleted_at = NOW() WHERE id = 123;

-- 恢復使用者
UPDATE users SET deleted_at = NULL WHERE id = 123;
```

**優點**:
- ✅ 資料可恢復 (誤刪可還原)
- ✅ Audit Trail (保留刪除記錄)
- ✅ 符合 GDPR 要求 (可追溯刪除歷史)

**缺點**:
- ❌ 儲存空間增加
- ❌ 查詢需加 `WHERE deleted_at IS NULL`

**Unique Index with Soft Delete**:
```sql
-- ✅ CORRECT - Unique Index 排除已刪除資料
CREATE UNIQUE INDEX uk_users_email ON users(email) WHERE deleted_at IS NULL;
```

---

#### Hard Delete (硬刪除, 謹慎使用)

**定義**: 實際刪除資料 (不可恢復)

```sql
-- ⚠️ HARD DELETE - 永久刪除資料
DELETE FROM users WHERE id = 123;
```

**優點**:
- ✅ 節省儲存空間
- ✅ 查詢簡單 (不需 `WHERE deleted_at IS NULL`)

**缺點**:
- ❌ 資料不可恢復
- ❌ 無法追溯刪除記錄

**適用場景**:
- ✅ 暫存資料 (e.g., 驗證碼, Session)
- ✅ 定期清理舊資料 (e.g., 3 個月前的日誌)

**決策**: ✅ **預設使用 Soft Delete** (保留刪除記錄)

---

---

## 📖 進階主題

以下進階主題已拆分至獨立文件：

- **Indexing 優化**: 請參閱 [database-operations-guide.md](./database-operations-guide.md#-indexing-優化-indexing-optimization)
- **Database Sharding**: 請參閱 [database-operations-guide.md](./database-operations-guide.md#️-database-sharding)
- **Database Migration**: 請參閱 [database-operations-guide.md](./database-operations-guide.md#-database-migration)
- **ORM 最佳實踐**: 請參閱 [database-operations-guide.md](./database-operations-guide.md#️-orm-最佳實踐)
- **Database Security**: 請參閱 [database-operations-guide.md](./database-operations-guide.md#-database-security)
- **Backup & DR**: 請參閱 [database-operations-guide.md](./database-operations-guide.md#-backup--disaster-recovery)

---

## 📚 參考資料 (References)

**決策**:
- ✅ **預設使用 B-tree Index** (等值 + 範圍查詢)
- ✅ **全文搜尋使用 GIN Index** (to_tsvector)
- ✅ **JSONB 查詢使用 GIN Index** (JSONB 欄位)

---

### Index 優化最佳實踐

#### 1. Single Column Index (單欄位索引)
```sql
-- ✅ CORRECT - 單欄位索引
CREATE INDEX idx_users_email ON users(email);
CREATE INDEX idx_orders_status ON orders(status);
CREATE INDEX idx_products_category_id ON products(category_id);
```

**適用場景**: WHERE 條件只包含單一欄位

---

#### 2. Composite Index (複合索引)

**定義**: 多個欄位組成的索引

```sql
-- ✅ CORRECT - 複合索引 (user_id, status)
CREATE INDEX idx_orders_user_id_status ON orders(user_id, status);

-- 查詢1: 使用 Composite Index (✅ 有效)
SELECT * FROM orders WHERE user_id = 123 AND status = 'paid';

-- 查詢2: 使用 Composite Index (✅ 有效, 前綴匹配)
SELECT * FROM orders WHERE user_id = 123;

-- 查詢3: 不使用 Composite Index (❌ 無效, 缺少前綴)
SELECT * FROM orders WHERE status = 'paid';
```

**Composite Index 規則**:
- ✅ **Index 前綴匹配**: `(user_id, status)` 可用於 `WHERE user_id = ?` 或 `WHERE user_id = ? AND status = ?`
- ❌ **無法匹配非前綴**: `(user_id, status)` 無法用於 `WHERE status = ?`

**最佳實踐**:
1. **高選擇性欄位在前** (e.g., `user_id` 選擇性高於 `status`)
2. **常見查詢優先** (依據 Query Pattern 設計)

---

#### 3. Partial Index (部分索引)

**定義**: 只索引符合條件的資料列

```sql
-- ✅ CORRECT - Partial Index (只索引未刪除的資料)
CREATE UNIQUE INDEX uk_users_email ON users(email) WHERE deleted_at IS NULL;

-- ✅ CORRECT - Partial Index (只索引 pending 訂單)
CREATE INDEX idx_orders_pending ON orders(created_at) WHERE status = 'pending';
```

**優點**:
- ✅ 節省儲存空間 (只索引部分資料)
- ✅ 提升效能 (Index 更小, 查詢更快)

**適用場景**:
- ✅ Soft Delete (只索引未刪除資料)
- ✅ 狀態欄位 (只索引特定狀態)

---

#### 4. Covering Index (覆蓋索引)

**定義**: Index 包含 SELECT 所需的所有欄位, 不需回表查詢

```sql
-- ✅ CORRECT - Covering Index (包含 SELECT 欄位)
CREATE INDEX idx_orders_user_id_status_total ON orders(user_id, status, total);

-- 查詢: 使用 Covering Index (✅ 不需回表)
SELECT user_id, status, total FROM orders WHERE user_id = 123 AND status = 'paid';
```

**優點**:
- ✅ 效能提升 (不需回表查詢, Index Scan 即可完成)

**缺點**:
- ❌ Index 大小增加

**適用場景**:
- ✅ 高頻查詢 (效能優先)

---

#### 5. Expression Index (表達式索引)

**定義**: 對欄位的函數結果建立索引

```sql
-- ✅ CORRECT - Expression Index (LOWER(email) 索引)
CREATE INDEX idx_users_email_lower ON users(LOWER(email));

-- 查詢: 使用 Expression Index (✅ 不區分大小寫查詢)
SELECT * FROM users WHERE LOWER(email) = 'john@example.com';
```

**適用場景**:
- ✅ 不區分大小寫查詢
- ✅ JSONB 欄位查詢 (e.g., `metadata->>'key'`)

---

#### 6. Full-Text Search Index (全文搜尋索引)

**定義**: 使用 GIN Index 支援全文搜尋

```sql
-- ✅ CORRECT - Full-Text Search Index
CREATE INDEX idx_products_name_fts ON products USING gin(to_tsvector('english', name));
CREATE INDEX idx_products_description_fts ON products USING gin(to_tsvector('english', description));

-- 查詢: 全文搜尋
SELECT * FROM products 
WHERE to_tsvector('english', name) @@ to_tsquery('english', 'laptop');
```

**優點**:
- ✅ 支援全文搜尋 (LIKE '%keyword%' 效能差)
- ✅ 支援多語言 (english, chinese, etc.)

**缺點**:
- ❌ Index 大小增加

**適用場景**:
- ✅ 商品搜尋, 文章搜尋

---

### Index 效能監控 (Index Performance Monitoring)

#### 1. 查詢未使用的 Index
```sql
-- ✅ 查詢未使用的 Index (刪除無用 Index)
SELECT
  schemaname,
  tablename,
  indexname,
  idx_scan AS scans,
  pg_size_pretty(pg_relation_size(indexrelid)) AS size
FROM pg_stat_user_indexes
WHERE idx_scan = 0
  AND indexrelname NOT LIKE 'pk_%'  -- 排除 Primary Key
ORDER BY pg_relation_size(indexrelid) DESC;
```

#### 2. 查詢缺少 Index 的 Table
```sql
-- ✅ 查詢缺少 Index 的 Table (Sequential Scan 過多)
SELECT
  schemaname,
  tablename,
  seq_scan,
  seq_tup_read,
  idx_scan,
  seq_tup_read / seq_scan AS avg_seq_tup
FROM pg_stat_user_tables
WHERE seq_scan > 0
ORDER BY seq_tup_read DESC
LIMIT 20;
```

#### 3. 使用 EXPLAIN ANALYZE 分析查詢
```sql
-- ✅ EXPLAIN ANALYZE (分析查詢效能)
EXPLAIN (ANALYZE, BUFFERS) 
SELECT * FROM orders WHERE user_id = 123 AND status = 'paid';
```

**關鍵指標**:
- **Execution Time**: 執行時間 (目標 < 50ms)
- **Index Scan**: 使用 Index (✅ 好)
- **Seq Scan**: 全表掃描 (❌ 差, 需加 Index)
- **Buffers**: 讀取的 Block 數量 (越少越好)

---

## 🗂️ Database Sharding (資料庫分片)

### Sharding 策略 (Sharding Strategy)

依據 **architecture.md (Database Sharding Strategy)**：

#### 1. User & Order Sharding (使用者與訂單分片)

**Sharding Key**: `user_id`

```sql
-- Sharding Function: user_id % 10
SELECT shard_id FROM users WHERE user_id % 10 = ?

-- 10 個 Shard，均勻分佈
-- Shard 0: user_id % 10 = 0
-- Shard 1: user_id % 10 = 1
-- ...
-- Shard 9: user_id % 10 = 9
```

**優點**:
- ✅ 均勻分佈 (假設 user_id 連續)
- ✅ 避免跨片 JOIN (User + Order 同分片)

**缺點**:
- ❌ Hot Shard (若某些 user_id 範圍活躍度高)

**解決方案**: 使用 **Consistent Hashing** (避免 Hot Shard)

---

#### 2. Product Sharding (商品分片)

**Sharding Key**: `category_id`

```sql
-- Sharding Function: category_id % 5
SELECT shard_id FROM products WHERE category_id % 5 = ?

-- 5 個 Shard
-- Shard 0: 3C 電子 (category_id = 1, 6, 11, ...)
-- Shard 1: 服飾 (category_id = 2, 7, 12, ...)
-- Shard 2: 食品 (category_id = 3, 8, 13, ...)
-- Shard 3: 家居 (category_id = 4, 9, 14, ...)
-- Shard 4: 美妝 (category_id = 5, 10, 15, ...)
```

**注意事項**:
- ⚠️ 熱門分類 (3C, 服飾) 可能造成 Hot Shard
- ✅ 可用 Redis 快取熱門商品 (TTL 5 min)

---

### Sharding 最佳實踐

#### 1. Sharding Key 選擇原則
| 原則 | 說明 |
|------|------|
| **均勻分佈** | 避免 Hot Shard (某些 Shard 流量過高) |
| **避免跨片查詢** | 同一使用者的資料在同一 Shard (User + Order) |
| **不可變** | Sharding Key 不應修改 (e.g., user_id 不變) |

#### 2. 避免跨片 JOIN
```sql
-- ❌ INCORRECT - 跨片 JOIN (效能差)
SELECT u.name, o.total
FROM users u
INNER JOIN orders o ON u.id = o.user_id
WHERE u.id = 123;

-- ✅ CORRECT - Application-level Join (應用層合併)
-- Step 1: 查詢 User (Shard 3)
SELECT * FROM users WHERE user_id = 123;

-- Step 2: 查詢 Orders (Shard 3)
SELECT * FROM orders WHERE user_id = 123;

-- Step 3: 應用層合併資料
```

#### 3. Global Table (全域表)
```sql
-- ✅ Global Table - 每個 Shard 都有完整資料 (e.g., Categories, Settings)
-- Shard 0: categories (完整資料)
-- Shard 1: categories (完整資料)
-- ...
```

**適用場景**: 小型配置表 (Categories, Settings)

---

## 🔄 Database Migration (資料庫遷移)

### Migration 工具選擇

| 工具 | 語言 | 特色 | 推薦度 |
|------|------|------|--------|
| **Prisma Migrate** | Node.js | ✅ Type-safe, ✅ Auto-generate SQL | ⭐⭐⭐⭐⭐ |
| **TypeORM Migrations** | Node.js | ✅ TypeScript 支援 | ⭐⭐⭐⭐ |
| **Alembic** | Python | ✅ SQLAlchemy 整合 | ⭐⭐⭐⭐ |
| **golang-migrate** | Go | ✅ 輕量級, ✅ CLI 工具 | ⭐⭐⭐⭐ |
| **Flyway** | Java | ✅ 企業級, ✅ 版本控制 | ⭐⭐⭐⭐ |

**決策**: ✅ **Prisma Migrate** (Node.js), **Alembic** (Python), **golang-migrate** (Go)

---

### Migration 最佳實踐

#### 1. Migration 命名規範
```
<timestamp>_<description>.sql

範例:
20260131_create_users_table.sql
20260131_add_email_index_to_users.sql
20260131_alter_orders_add_payment_method.sql
```

#### 2. Migration 檔案結構
```sql
-- ✅ CORRECT - Migration 檔案結構

-- Up Migration (正向遷移)
CREATE TABLE users (
  id BIGSERIAL PRIMARY KEY,
  name VARCHAR(100) NOT NULL,
  email VARCHAR(255) NOT NULL UNIQUE,
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- Down Migration (回滾遷移)
DROP TABLE users;
```

#### 3. Migration 安全原則
| 原則 | 說明 |
|------|------|
| **向後相容** | 不破壞現有功能 (e.g., 新增欄位用 DEFAULT 值) |
| **可回滾** | 每個 Up Migration 需有對應 Down Migration |
| **小步前進** | 每次 Migration 只做一件事 (易於除錯) |
| **測試優先** | Stage 環境先測試, Production 再執行 |

#### 4. 危險 Migration 範例
```sql
-- ❌ DANGEROUS - 刪除欄位 (不可逆)
ALTER TABLE users DROP COLUMN email;

-- ✅ CORRECT - Soft Deprecate (先標記為可選, 3 個月後刪除)
-- Step 1: 允許 NULL (3 個月過渡期)
ALTER TABLE users ALTER COLUMN email DROP NOT NULL;

-- Step 2: 3 個月後刪除
ALTER TABLE users DROP COLUMN email;
```

---

## 🛠️ ORM 最佳實踐 (ORM Best Practices)

### ORM 工具選擇

依據 **tech-stack.md (Backend Frameworks)**：

| 語言 | ORM 工具 | 特色 | 推薦度 |
|------|---------|------|--------|
| **Node.js** | Prisma | ✅ Type-safe, ✅ Auto-complete, ✅ Migration 工具 | ⭐⭐⭐⭐⭐ |
| **Node.js** | TypeORM | ✅ TypeScript 支援, ✅ Active Record + Data Mapper | ⭐⭐⭐⭐ |
| **Python** | SQLAlchemy | ✅ 成熟穩定, ✅ Raw SQL 支援 | ⭐⭐⭐⭐⭐ |
| **Go** | GORM | ✅ 簡單易用, ✅ Hook 支援 | ⭐⭐⭐⭐ |

**決策**: ✅ **Prisma** (Node.js), **SQLAlchemy** (Python), **GORM** (Go)

---

### Prisma 範例 (Node.js)

#### 1. Prisma Schema 定義
```prisma
// schema.prisma
model User {
  id        BigInt   @id @default(autoincrement())
  name      String   @db.VarChar(100)
  email     String   @unique @db.VarChar(255)
  role      String   @default("user") @db.VarChar(20)
  createdAt DateTime @default(now()) @map("created_at") @db.Timestamptz
  updatedAt DateTime @updatedAt @map("updated_at") @db.Timestamptz
  deletedAt DateTime? @map("deleted_at") @db.Timestamptz

  orders    Order[]

  @@index([email])
  @@index([createdAt])
  @@map("users")
}

model Order {
  id          BigInt   @id @default(autoincrement())
  orderNumber String   @unique @map("order_number") @db.VarChar(50)
  userId      BigInt   @map("user_id")
  status      String   @default("pending") @db.VarChar(20)
  total       Decimal  @db.Decimal(10, 2)
  createdAt   DateTime @default(now()) @map("created_at") @db.Timestamptz
  updatedAt   DateTime @updatedAt @map("updated_at") @db.Timestamptz
  deletedAt   DateTime? @map("deleted_at") @db.Timestamptz

  user        User     @relation(fields: [userId], references: [id])
  orderItems  OrderItem[]

  @@index([userId])
  @@index([status])
  @@index([createdAt])
  @@map("orders")
}
```

#### 2. Prisma Query 範例
```typescript
// ✅ CORRECT - Prisma Query (Type-safe)
import { PrismaClient } from '@prisma/client';
const prisma = new PrismaClient();

// 查詢單一使用者
const user = await prisma.user.findUnique({
  where: { email: 'john@example.com' },
});

// 查詢多個訂單 (with relations)
const orders = await prisma.order.findMany({
  where: {
    userId: 123,
    status: 'paid',
    deletedAt: null,  // Soft Delete
  },
  include: {
    user: true,
    orderItems: true,
  },
  orderBy: {
    createdAt: 'desc',
  },
});

// Transaction (ACID)
await prisma.$transaction(async (tx) => {
  // Step 1: 建立訂單
  const order = await tx.order.create({
    data: {
      userId: 123,
      orderNumber: 'ORD-20260131-000001',
      total: 100.00,
      status: 'pending',
    },
  });

  // Step 2: 建立訂單明細
  await tx.orderItem.createMany({
    data: [
      { orderId: order.id, productId: 1, quantity: 2, subtotal: 50.00 },
      { orderId: order.id, productId: 2, quantity: 1, subtotal: 50.00 },
    ],
  });

  // Step 3: 扣除庫存
  await tx.product.update({
    where: { id: 1 },
    data: { stockQuantity: { decrement: 2 } },
  });
});
```

---

### ORM 效能優化

#### 1. N+1 Query Problem (N+1 查詢問題)

**問題範例**:
```typescript
// ❌ BAD - N+1 Query Problem (每個 order 都查詢一次 user)
const orders = await prisma.order.findMany();  // 1 query

for (const order of orders) {
  const user = await prisma.user.findUnique({
    where: { id: order.userId },
  });  // N queries (N = orders.length)
}
```

**解決方案**:
```typescript
// ✅ CORRECT - 使用 include (JOIN) 避免 N+1
const orders = await prisma.order.findMany({
  include: {
    user: true,  // 1 query (JOIN)
  },
});
```

#### 2. Lazy Loading vs Eager Loading

| 策略 | 說明 | 範例 | 優缺點 |
|------|------|------|--------|
| **Lazy Loading** | 需要時才查詢關聯資料 | `order.user` 時才查詢 user | ❌ N+1 Problem |
| **Eager Loading** | 一次查詢包含關聯資料 | `include: { user: true }` | ✅ 效能好, ❌ 資料量大 |

**決策**: ✅ **預設使用 Eager Loading** (避免 N+1)

#### 3. Batch Operations (批次操作)
```typescript
// ✅ CORRECT - Batch Insert (批次新增)
await prisma.orderItem.createMany({
  data: [
    { orderId: 1, productId: 1, quantity: 2 },
    { orderId: 1, productId: 2, quantity: 1 },
  ],
});

// ✅ CORRECT - Batch Update (批次更新)
await prisma.product.updateMany({
  where: { category_id: 1 },
  data: { status: 'inactive' },
});
```

---

## 🔒 Database Security (資料庫安全性)

依據 **security-guidelines.md (Layer 1: Data Security)**：

### 1. Column-level Encryption (欄位級加密)

**PII 欄位加密** (依據 security-guidelines.md):
```typescript
import crypto from 'crypto';

// ✅ CORRECT - Column-level Encryption (AES-256)
const ENCRYPTION_KEY = process.env.DB_ENCRYPTION_KEY;  // 32 bytes
const IV_LENGTH = 16;

function encrypt(text: string): string {
  const iv = crypto.randomBytes(IV_LENGTH);
  const cipher = crypto.createCipheriv('aes-256-cbc', Buffer.from(ENCRYPTION_KEY), iv);
  let encrypted = cipher.update(text, 'utf8', 'hex');
  encrypted += cipher.final('hex');
  return iv.toString('hex') + ':' + encrypted;
}

function decrypt(text: string): string {
  const [ivHex, encryptedHex] = text.split(':');
  const iv = Buffer.from(ivHex, 'hex');
  const decipher = crypto.createDecipheriv('aes-256-cbc', Buffer.from(ENCRYPTION_KEY), iv);
  let decrypted = decipher.update(encryptedHex, 'hex', 'utf8');
  decrypted += decipher.final('utf8');
  return decrypted;
}

// 使用範例
const user = await prisma.user.create({
  data: {
    name: 'John Doe',
    email: 'john@example.com',
    phone: encrypt('+886-912-345-678'),  // ✅ 加密敏感資料
  },
});
```

**需加密欄位**:
- ✅ 電話號碼 (phone)
- ✅ 身分證字號 (national_id)
- ✅ 信用卡號 (credit_card_number)
- ✅ 地址 (address)

---

### 2. SQL Injection Prevention (SQL Injection 防護)

```typescript
// ❌ DANGEROUS - SQL Injection Vulnerable
const email = req.query.email;  // 'admin@example.com' OR '1'='1'
const user = await prisma.$queryRawUnsafe(
  `SELECT * FROM users WHERE email = '${email}'`
);

// ✅ CORRECT - Parameterized Queries (Prepared Statements)
const email = req.query.email;
const user = await prisma.$queryRaw`
  SELECT * FROM users WHERE email = ${email}
`;
```

**ORM 自動防護**: Prisma, SQLAlchemy, GORM 預設使用 Parameterized Queries

---

### 3. Database Access Control (資料庫存取控制)

```sql
-- ✅ CORRECT - Database User with Limited Permissions
-- Application User (只有 SELECT, INSERT, UPDATE, DELETE 權限)
CREATE USER app_user WITH PASSWORD 'SecureP@ssw0rd123';
GRANT SELECT, INSERT, UPDATE, DELETE ON ALL TABLES IN SCHEMA public TO app_user;

-- Read-only User (只有 SELECT 權限, 用於報表)
CREATE USER readonly_user WITH PASSWORD 'SecureP@ssw0rd456';
GRANT SELECT ON ALL TABLES IN SCHEMA public TO readonly_user;

-- Admin User (全權限, 僅限 Migration)
CREATE USER admin_user WITH PASSWORD 'AdminP@ssw0rd789';
GRANT ALL PRIVILEGES ON DATABASE hyperherox TO admin_user;
```

---

### 4. Audit Trail (審計追蹤)

**審計追蹤範例** (儲存至 MongoDB):
```typescript
// ✅ CORRECT - Audit Trail (記錄所有 User 操作)
import { MongoClient } from 'mongodb';

async function logAuditTrail(userId: number, action: string, tableName: string, recordId: number) {
  const mongoClient = new MongoClient(process.env.MONGODB_URI);
  await mongoClient.connect();
  
  const db = mongoClient.db('hyperherox');
  await db.collection('audit_logs').insertOne({
    userId,
    action,  // 'CREATE', 'UPDATE', 'DELETE'
    tableName,
    recordId,
    timestamp: new Date(),
    ipAddress: req.ip,
    userAgent: req.headers['user-agent'],
  });
  
  await mongoClient.close();
}

// 使用範例
await prisma.user.update({
  where: { id: 123 },
  data: { name: 'John Doe Updated' },
});

await logAuditTrail(currentUserId, 'UPDATE', 'users', 123);
```

---

## 💾 Backup & Disaster Recovery (備份與災難復原)

依據 **security-guidelines.md (Layer 1: Database Backup Encryption)**：

### Backup 策略

| Backup 類型 | 頻率 | 保留期限 | 加密 |
|-----------|------|---------|------|
| **Full Backup** | 每日 00:00 | 30 天 | ✅ AES-256 |
| **Incremental Backup** | 每 6 小時 | 7 天 | ✅ AES-256 |
| **Point-in-Time Recovery** | 持續 (WAL) | 7 天 | ✅ AES-256 |

### PostgreSQL Backup 範例

```bash
# ✅ Full Backup (pg_dump)
pg_dump -h localhost -U postgres -d hyperherox -F c -f backup_$(date +%Y%m%d).dump

# ✅ Encrypted Backup (pg_dump + OpenSSL)
pg_dump -h localhost -U postgres -d hyperherox -F c | \
  openssl enc -aes-256-cbc -salt -out backup_$(date +%Y%m%d).dump.enc -pass pass:$BACKUP_PASSWORD
```

### Disaster Recovery Plan

| Scenario | RTO (Recovery Time Objective) | RPO (Recovery Point Objective) | Recovery Steps |
|----------|------------------------------|-------------------------------|----------------|
| **Database Crash** | < 1 hour | < 15 minutes | 1. 啟用 Standby Database<br>2. 驗證資料完整性<br>3. 切換流量 |
| **Data Corruption** | < 4 hours | < 1 hour | 1. 從最近 Backup 還原<br>2. 套用 WAL (Point-in-Time Recovery)<br>3. 驗證資料 |
| **Region Failure** | < 2 hours | < 30 minutes | 1. Failover 至備援 Region<br>2. 驗證複寫狀態<br>3. 切換 DNS |

---

## 📚 參考資料 (References)

### 內部規範
- [tech-stack.md](./tech-stack.md) - Database Stack, ORM 工具
- [security-guidelines.md](./security-guidelines.md) - Database Security, Column-level Encryption
- [architecture.md](./architecture.md) - Database Sharding Strategy, Auto Scaling
- [api-design-guide.md](./api-design-guide.md) - API Response Data Format

### 外部資源
- [PostgreSQL Documentation](https://www.postgresql.org/docs/)
- [Database Normalization (3NF)](https://en.wikipedia.org/wiki/Third_normal_form)
- [Database Indexing Best Practices](https://use-the-index-luke.com/)
- [Prisma Documentation](https://www.prisma.io/docs)
- [SQLAlchemy Documentation](https://docs.sqlalchemy.org/)
- [Database Sharding Strategies](https://www.digitalocean.com/community/tutorials/understanding-database-sharding)
- [OWASP SQL Injection Prevention](https://cheatsheetseries.owasp.org/cheatsheets/SQL_Injection_Prevention_Cheat_Sheet.html)

---

**文檔版本**: 1.0.0  
**最後更新**: 2026-01-31  
**維護者**: Database Team
