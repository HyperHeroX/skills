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

### 內部規範
- [tech-stack.md](./tech-stack.md) - Database Stack, ORM 工具
- [security-guidelines.md](./security-guidelines.md) - Database Security, Encryption
- [architecture.md](./architecture.md) - Database Sharding Strategy
- [database-operations-guide.md](./database-operations-guide.md) - 進階操作指南

### 外部資源
- PostgreSQL Documentation: https://www.postgresql.org/docs/
- Database Design Best Practices: O'Reilly

