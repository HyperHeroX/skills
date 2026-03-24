# Database Operations Guide (資料庫操作指南)

> 本文件為 `database-design-guide.md` 的進階章節，涵蓋 Indexing、Sharding、Migration、ORM、Security 與 Backup。
> 
> **前置閱讀**: `database-design-guide.md` (Schema 設計標準)

---

## 🔍 Indexing 優化 (Indexing Optimization)

### Index 類型 (Index Types)

| Index 類型 | 適用場景 | PostgreSQL 語法 | 備註 |
|-----------|---------|----------------|------|
| **B-tree** | 等值/範圍查詢 | `CREATE INDEX idx_xxx ON table(col);` | ✅ 預設類型 |
| **Hash** | 等值查詢 | `USING hash(col)` | 僅等值查詢 |
| **GIN** | 全文搜尋/JSONB/陣列 | `USING gin(...)` | 複雜資料結構 |
| **GiST** | 地理空間查詢 | `USING gist(location)` | PostGIS |
| **BRIN** | 時間序列 (大表) | `USING brin(created_at)` | Append-only |

### Index 類型選擇

1. **Single Column**: WHERE 單一欄位
2. **Composite**: 多欄位查詢 (高選擇性欄位在前)
3. **Partial**: 只索引符合條件資料 (`WHERE deleted_at IS NULL`)
4. **Covering**: 包含 SELECT 所需欄位 (避免回表)
5. **Expression**: 函數結果索引 (`LOWER(email)`)
6. **Full-Text**: GIN + to_tsvector

### Index 監控

```sql
-- 未使用的 Index
SELECT indexname, idx_scan FROM pg_stat_user_indexes WHERE idx_scan = 0;

-- 缺少 Index 的 Table (Seq Scan 過多)
SELECT tablename, seq_scan, idx_scan FROM pg_stat_user_tables ORDER BY seq_scan DESC;

-- 分析查詢效能
EXPLAIN (ANALYZE, BUFFERS) SELECT ...;
```

---

## 🗂️ Database Sharding

### Sharding 策略

| 策略 | Sharding Key | 適用場景 |
|------|-------------|---------|
| User Sharding | `user_id % N` | Users, Orders |
| Product Sharding | `category_id % N` | Products |

### 最佳實踐

- **均勻分佈**: 避免 Hot Shard
- **避免跨片查詢**: 同一使用者資料在同一 Shard
- **Global Table**: 小型配置表 (Categories)
- **Application-level Join**: 應用層合併資料

---

## 🔄 Database Migration

### 工具選擇

| 工具 | 語言 | 特色 |
|------|------|------|
| **Prisma Migrate** | Node.js | Type-safe, Auto-generate |
| **Alembic** | Python | SQLAlchemy 整合 |
| **golang-migrate** | Go | 輕量級 CLI |
| **Flyway** | Java | 企業級 |

### Migration 原則

- **命名**: `<timestamp>_<description>.sql`
- **向後相容**: 新增欄位用 DEFAULT
- **可回滾**: Up + Down Migration
- **小步前進**: 每次只做一件事
- **測試優先**: Stage → Production

---

## 🛠️ ORM 最佳實踐

### ORM 選擇

| 語言 | 推薦 ORM |
|------|---------|
| Node.js | Prisma, TypeORM |
| Python | SQLAlchemy |
| Go | GORM |

### N+1 問題避免

```typescript
// ❌ N+1 問題
const users = await prisma.user.findMany();
for (const user of users) {
  const orders = await prisma.order.findMany({ where: { userId: user.id } });
}

// ✅ Eager Loading
const users = await prisma.user.findMany({
  include: { orders: true }
});
```

### Batch 操作

```typescript
// ❌ Loop Insert
for (const item of items) {
  await prisma.item.create({ data: item });
}

// ✅ Batch Insert
await prisma.item.createMany({ data: items });
```

---

## 🔒 Database Security

### Column-level Encryption

| 欄位類型 | 加密方式 | 範例 |
|---------|---------|------|
| 信用卡號 | AES-256 | `card_number_encrypted` |
| 身分證號 | AES-256 | `id_number_encrypted` |
| 密碼 | bcrypt/Argon2 | `password_hash` |

### Audit Trail

```sql
CREATE TABLE audit_logs (
  id BIGSERIAL PRIMARY KEY,
  table_name VARCHAR(100) NOT NULL,
  record_id BIGINT NOT NULL,
  action VARCHAR(20) NOT NULL,  -- INSERT/UPDATE/DELETE
  old_values JSONB,
  new_values JSONB,
  user_id BIGINT,
  created_at TIMESTAMPTZ DEFAULT NOW()
);
```

### RBAC 權限

- **read**: SELECT 權限
- **write**: INSERT/UPDATE 權限
- **delete**: DELETE 權限
- **admin**: DDL 權限

---

## 💾 Backup & Disaster Recovery

### Backup 策略

| 類型 | 頻率 | 保留期 | 用途 |
|------|------|-------|------|
| Full Backup | 每日 | 30 天 | 完整恢復 |
| Incremental | 每小時 | 7 天 | Point-in-time |
| WAL Archive | 即時 | 7 天 | 即時恢復 |

### RTO/RPO 目標

- **RPO** (Recovery Point Objective): < 1 小時
- **RTO** (Recovery Time Objective): < 4 小時

### 災難復原流程

1. 確認災難範圍
2. 啟動 Read Replica (如有)
3. 恢復最近 Backup
4. 應用 WAL Logs
5. 驗證資料完整性
6. 切換 DNS/Load Balancer

---

## 📚 參考資料

- PostgreSQL Documentation: https://www.postgresql.org/docs/
- Prisma Documentation: https://www.prisma.io/docs/
- High Performance PostgreSQL: O'Reilly
