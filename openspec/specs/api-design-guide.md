# API 設計指南 (API Design Guide)

> **Version**: 1.0  
> **Last Updated**: 2026-01-31  
> **Maintainer**: HyperHeroX Team  
> **Status**: ✅ Active  
> **Prerequisites**: tech-stack.md, security-guidelines.md, architecture.md

---

## 📋 概述 (Overview)

本文檔定義 HyperHeroX Skills 專案的 API 設計標準，涵蓋 RESTful API、gRPC、GraphQL、API 版本控制、錯誤處理、文檔生成等。所有 API 開發必須遵循本規範。

---

## 🎯 API 設計原則 (API Design Principles)

| 原則 | 說明 | 實踐方式 |
|------|------|---------|
| **RESTful First** | 優先使用 RESTful API | 遵循 REST 原則 (GET, POST, PUT, DELETE), 資源導向設計 |
| **Security First** | API 安全優先 | JWT Authentication, Rate Limiting, Input Validation, HTTPS Only |
| **Developer Experience** | 開發者體驗優先 | 清晰的 API 文檔 (OpenAPI/Swagger), 一致的錯誤回應格式 |
| **Performance** | 高效能 API | Response Time P95 < 200ms, 分頁查詢, 快取策略 |
| **Backward Compatibility** | 向後相容 | API Versioning (v1, v2), 不破壞現有 API |

---

## 🏗️ API 架構選擇 (API Architecture Selection)

### API 風格比較 (API Style Comparison)

| API 風格 | 優點 | 缺點 | 適用場景 | 採用? |
|---------|------|------|---------|------|
| **RESTful API** | ✅ 標準化 (HTTP Methods)<br>✅ 易於理解<br>✅ 廣泛支援<br>✅ 快取友善 (HTTP Cache) | ❌ Over-fetching / Under-fetching<br>❌ 多次請求 (N+1 問題) | 對外 API (前端, 第三方整合) | ✅ **主要採用** |
| **gRPC** | ✅ 高效能 (Protocol Buffers)<br>✅ 雙向串流<br>✅ 低延遲 (< 5ms)<br>✅ 強型別 | ❌ 瀏覽器支援困難<br>❌ 除錯困難 (二進位格式)<br>❌ 學習曲線高 | 內部微服務通訊 | ✅ **內部服務** |
| **GraphQL** | ✅ 彈性查詢 (按需取得資料)<br>✅ 解決 Over-fetching<br>✅ 單一端點 | ❌ 複雜度高<br>❌ 快取困難<br>❌ N+1 查詢問題 | 複雜前端需求 (多種資料組合) | ⚠️ **可選** |
| **WebSocket** | ✅ 雙向即時通訊<br>✅ 低延遲推播 | ❌ 擴展性困難<br>❌ 連線管理複雜 | 即時通訊 (聊天, 推播通知) | ⚠️ **特定場景** |

#### 決策 (Decision)
- ✅ **對外 API**: RESTful API (前端, 第三方整合)
- ✅ **內部微服務**: gRPC (低延遲, 高效能)
- ⚠️ **複雜查詢**: GraphQL (可選, 適用前端多樣化需求)
- ⚠️ **即時通訊**: WebSocket (聊天, 推播通知)

---

## 🌐 RESTful API 設計標準

### 1. URL 設計規範 (URL Design Standards)

#### 資源命名規則 (Resource Naming Rules)

| 規則 | 說明 | ✅ CORRECT | ❌ INCORRECT |
|------|------|-----------|------------|
| **使用複數名詞** | 資源使用複數形式 | `/api/users` | `/api/user` |
| **小寫字母 + 連字符** | URL 使用小寫, 單字用連字符 (`-`) | `/api/order-items` | `/api/OrderItems`, `/api/order_items` |
| **層級關係** | 巢狀資源表達所屬關係 | `/api/users/123/orders` | `/api/orders?userId=123` |
| **避免動詞** | URL 不含動詞, 用 HTTP Method 表達動作 | `POST /api/orders` | `/api/createOrder` |
| **避免檔案副檔名** | 不使用檔案副檔名 | `/api/products/123` | `/api/products/123.json` |

#### URL 設計範例 (URL Design Examples)

| 操作 | HTTP Method | URL | 說明 |
|------|------------|-----|------|
| **取得使用者清單** | GET | `/api/v1/users` | 取得所有使用者 |
| **取得單一使用者** | GET | `/api/v1/users/123` | 取得 ID 為 123 的使用者 |
| **建立使用者** | POST | `/api/v1/users` | 建立新使用者 |
| **更新使用者** | PUT | `/api/v1/users/123` | 完整更新 ID 為 123 的使用者 |
| **部分更新使用者** | PATCH | `/api/v1/users/123` | 部分更新 ID 為 123 的使用者 |
| **刪除使用者** | DELETE | `/api/v1/users/123` | 刪除 ID 為 123 的使用者 |
| **取得使用者訂單** | GET | `/api/v1/users/123/orders` | 取得 ID 為 123 的使用者的所有訂單 |
| **搜尋商品** | GET | `/api/v1/products?search=laptop&category=electronics` | 搜尋筆電類商品 |

---

### 2. HTTP Method 使用標準 (HTTP Method Standards)

| HTTP Method | 說明 | 冪等性 (Idempotent) | 安全性 (Safe) | 適用場景 |
|------------|------|-------------------|--------------|---------|
| **GET** | 讀取資源 | ✅ 是 | ✅ 是 | 查詢資料, 不改變資源狀態 |
| **POST** | 建立資源 | ❌ 否 | ❌ 否 | 建立新資源 (每次呼叫產生新資源) |
| **PUT** | 完整更新資源 | ✅ 是 | ❌ 否 | 完整替換資源 (提供所有欄位) |
| **PATCH** | 部分更新資源 | ⚠️ 視實作 | ❌ 否 | 部分更新資源 (僅提供變更欄位) |
| **DELETE** | 刪除資源 | ✅ 是 | ❌ 否 | 刪除資源 (多次呼叫結果相同) |
| **OPTIONS** | 查詢支援的 HTTP Method | ✅ 是 | ✅ 是 | CORS Preflight Request |
| **HEAD** | 取得 Response Header (無 Body) | ✅ 是 | ✅ 是 | 檢查資源是否存在 |

#### PUT vs PATCH 差異 (PUT vs PATCH Difference)

```http
# PUT - 完整更新 (必須提供所有欄位)
PUT /api/v1/users/123
Content-Type: application/json

{
  "name": "John Doe",
  "email": "john@example.com",
  "age": 30,
  "address": "123 Main St"
}

# PATCH - 部分更新 (僅提供變更欄位)
PATCH /api/v1/users/123
Content-Type: application/json

{
  "email": "newemail@example.com"
}
```

---

### 3. HTTP 狀態碼標準 (HTTP Status Code Standards)

| 狀態碼 | 分類 | 說明 | 適用場景 |
|-------|------|------|---------|
| **200 OK** | 成功 | 請求成功, 回傳資料 | GET, PUT, PATCH 成功 |
| **201 Created** | 成功 | 資源建立成功 | POST 建立資源成功 |
| **204 No Content** | 成功 | 請求成功, 無回傳資料 | DELETE 成功, PUT/PATCH 成功且無需回傳資料 |
| **400 Bad Request** | 客戶端錯誤 | 請求格式錯誤 (驗證失敗) | 輸入驗證失敗, JSON 格式錯誤 |
| **401 Unauthorized** | 客戶端錯誤 | 未驗證 (無 Token 或 Token 無效) | JWT Token 過期, Token 格式錯誤 |
| **403 Forbidden** | 客戶端錯誤 | 已驗證但無權限 | 使用者無權限存取資源 (RBAC 檢查失敗) |
| **404 Not Found** | 客戶端錯誤 | 資源不存在 | 查詢的資源 ID 不存在 |
| **409 Conflict** | 客戶端錯誤 | 資源衝突 (重複建立) | Email 已存在, 訂單已取消無法修改 |
| **422 Unprocessable Entity** | 客戶端錯誤 | 語意錯誤 (格式正確但邏輯錯誤) | 商品庫存不足, 折扣碼已過期 |
| **429 Too Many Requests** | 客戶端錯誤 | Rate Limiting 限制 | 超過 1000 requests/min/IP |
| **500 Internal Server Error** | 伺服器錯誤 | 伺服器內部錯誤 | 資料庫連線失敗, 未處理的例外 |
| **502 Bad Gateway** | 伺服器錯誤 | 上游服務錯誤 | 微服務間呼叫失敗, Payment Gateway 無回應 |
| **503 Service Unavailable** | 伺服器錯誤 | 服務暫時無法使用 | 系統維護, 資源不足 |

---

### 4. Request & Response 格式 (Request & Response Format)

#### Request 格式 (Request Format)

```http
POST /api/v1/users HTTP/1.1
Host: api.hyperherox.com
Content-Type: application/json
Authorization: Bearer eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9...
Accept: application/json
User-Agent: Mozilla/5.0
X-Request-ID: 550e8400-e29b-41d4-a716-446655440000

{
  "name": "John Doe",
  "email": "john@example.com",
  "password": "SecureP@ssw0rd123"
}
```

#### Response 格式 - 成功 (Response Format - Success)

```http
HTTP/1.1 201 Created
Content-Type: application/json
X-Request-ID: 550e8400-e29b-41d4-a716-446655440000
X-RateLimit-Limit: 1000
X-RateLimit-Remaining: 999
X-RateLimit-Reset: 1640995200

{
  "success": true,
  "data": {
    "id": 123,
    "name": "John Doe",
    "email": "john@example.com",
    "createdAt": "2026-01-31T10:30:00Z",
    "updatedAt": "2026-01-31T10:30:00Z"
  },
  "meta": {
    "requestId": "550e8400-e29b-41d4-a716-446655440000",
    "timestamp": "2026-01-31T10:30:00Z"
  }
}
```

#### Response 格式 - 錯誤 (Response Format - Error)

```http
HTTP/1.1 400 Bad Request
Content-Type: application/json
X-Request-ID: 550e8400-e29b-41d4-a716-446655440000

{
  "success": false,
  "error": {
    "code": "VALIDATION_ERROR",
    "message": "輸入驗證失敗",
    "details": [
      {
        "field": "email",
        "message": "Email 格式錯誤"
      },
      {
        "field": "password",
        "message": "密碼長度至少 8 個字元"
      }
    ]
  },
  "meta": {
    "requestId": "550e8400-e29b-41d4-a716-446655440000",
    "timestamp": "2026-01-31T10:30:00Z"
  }
}
```

---

### 5. 分頁查詢標準 (Pagination Standards)

#### Offset-based Pagination (偏移分頁)

```http
GET /api/v1/products?page=2&limit=20 HTTP/1.1

# Response
{
  "success": true,
  "data": [
    { "id": 21, "name": "Product 21" },
    { "id": 22, "name": "Product 22" },
    ...
  ],
  "pagination": {
    "page": 2,
    "limit": 20,
    "total": 1000,
    "totalPages": 50,
    "hasNextPage": true,
    "hasPreviousPage": true
  }
}
```

#### Cursor-based Pagination (游標分頁, 推薦)

```http
GET /api/v1/products?cursor=eyJpZCI6MjB9&limit=20 HTTP/1.1

# Response
{
  "success": true,
  "data": [
    { "id": 21, "name": "Product 21" },
    { "id": 22, "name": "Product 22" },
    ...
  ],
  "pagination": {
    "nextCursor": "eyJpZCI6NDB9",
    "hasMore": true
  }
}
```

**Cursor-based Pagination 優點**:
- ✅ 避免 Offset Pagination 的漏資料問題 (新增/刪除資料時)
- ✅ 效能更好 (不需 COUNT(*), 不需 OFFSET)
- ✅ 適用於無限滾動 (Infinite Scroll)

---

### 6. 搜尋與過濾標準 (Search & Filter Standards)

```http
# 搜尋商品 (關鍵字搜尋)
GET /api/v1/products?search=laptop HTTP/1.1

# 過濾商品 (分類 + 價格範圍)
GET /api/v1/products?category=electronics&minPrice=500&maxPrice=2000 HTTP/1.1

# 排序商品 (價格由低到高)
GET /api/v1/products?sort=price&order=asc HTTP/1.1

# 綜合查詢 (搜尋 + 過濾 + 排序 + 分頁)
GET /api/v1/products?search=laptop&category=electronics&minPrice=500&sort=price&order=asc&page=1&limit=20 HTTP/1.1
```

---

### 7. 批次操作標準 (Batch Operations Standards)

```http
# 批次刪除 (Bulk Delete)
DELETE /api/v1/products HTTP/1.1
Content-Type: application/json

{
  "ids": [1, 2, 3, 4, 5]
}

# Response
HTTP/1.1 200 OK
Content-Type: application/json

{
  "success": true,
  "data": {
    "deleted": 5,
    "failed": 0
  }
}
```

---

## 🔐 API 安全性標準 (API Security Standards)

### 1. Authentication (身分驗證)

依據 **security-guidelines.md (Authentication)**：

#### JWT Authentication
```http
# 登入取得 Access Token
POST /api/v1/auth/login HTTP/1.1
Content-Type: application/json

{
  "email": "user@example.com",
  "password": "SecureP@ssw0rd123"
}

# Response
HTTP/1.1 200 OK
Content-Type: application/json

{
  "success": true,
  "data": {
    "accessToken": "eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9...",
    "refreshToken": "eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9...",
    "expiresIn": 900  # 15 分鐘 (依據 AGENTS.md Section 6)
  }
}

# 使用 Access Token 呼叫 API
GET /api/v1/users/me HTTP/1.1
Authorization: Bearer eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9...
```

#### JWT Token 規範 (依據 AGENTS.md Section 6)
- ✅ **JWT Secret**: ≥ 32 字元 (AGENTS.md 強制要求)
- ✅ **Access Token**: 15 分鐘過期
- ✅ **Refresh Token**: 30 天過期
- ✅ **Issuer (iss)**: 'hyperherox'
- ✅ **Audience (aud)**: 'api.hyperherox.com'

---

### 2. Authorization (授權)

依據 **security-guidelines.md (Authorization RBAC)**：

#### Role-Based Access Control (RBAC)
```typescript
// 5 Roles (依據 security-guidelines.md)
enum UserRole {
  ADMIN = 'admin',      // 全權限
  USER = 'user',        // 瀏覽, 下單
  VENDOR = 'vendor',    // 商品管理, 庫存
  CS = 'cs',            // 查看訂單, 回覆問題
  GUEST = 'guest',      // 僅瀏覽
}

// Permission Check Middleware
const permissions = {
  [UserRole.ADMIN]: ['*'],
  [UserRole.USER]: ['product:read', 'order:create', 'order:read'],
  [UserRole.VENDOR]: ['product:*', 'inventory:*'],
  [UserRole.CS]: ['order:read', 'ticket:*'],
  [UserRole.GUEST]: ['product:read'],
};

function checkPermission(role: UserRole, permission: string): boolean {
  const userPermissions = permissions[role];
  return userPermissions.includes('*') || userPermissions.includes(permission);
}
```

---

### 3. Rate Limiting (速率限制)

依據 **security-guidelines.md (Rate Limiting)**：

```http
# Rate Limiting Response Headers
HTTP/1.1 200 OK
X-RateLimit-Limit: 1000        # 每分鐘最多 1000 次請求
X-RateLimit-Remaining: 995     # 剩餘請求次數
X-RateLimit-Reset: 1640995200  # Reset 時間 (Unix Timestamp)

# 超過 Rate Limit
HTTP/1.1 429 Too Many Requests
Content-Type: application/json
Retry-After: 60  # 60 秒後重試

{
  "success": false,
  "error": {
    "code": "RATE_LIMIT_EXCEEDED",
    "message": "超過請求限制 (1000 requests/min/IP)",
    "retryAfter": 60
  }
}
```

#### Rate Limiting 配置 (Kong API Gateway)
```yaml
# Kong Rate Limiting Plugin
plugins:
  - name: rate-limiting
    config:
      minute: 1000      # 每分鐘 1000 次請求
      hour: 50000       # 每小時 50000 次請求
      policy: redis     # 使用 Redis 儲存計數器
      fault_tolerant: true
      redis_host: redis.hyperherox.com
      redis_port: 6379
```

---

### 4. Input Validation (輸入驗證)

依據 **security-guidelines.md (Input Validation)**：

```typescript
// DTO + class-validator (依據 security-guidelines.md)
import { IsEmail, IsString, MinLength, MaxLength, Matches, IsInt, Min, Max } from 'class-validator';

class CreateProductDto {
  @IsString()
  @MinLength(3, { message: '商品名稱至少 3 個字元' })
  @MaxLength(100, { message: '商品名稱最多 100 個字元' })
  name: string;

  @IsInt({ message: '價格必須為整數' })
  @Min(0, { message: '價格不可為負數' })
  @Max(1000000, { message: '價格不可超過 1,000,000' })
  price: number;

  @IsString()
  @MaxLength(1000, { message: '商品描述最多 1000 個字元' })
  description: string;
}
```

---

## 🔢 API 版本控制 (API Versioning)

### 版本控制策略比較 (Versioning Strategy Comparison)

| 策略 | 範例 | 優點 | 缺點 | 採用? |
|------|------|------|------|------|
| **URL Path Versioning** | `/api/v1/users` | ✅ 清晰易懂<br>✅ 易於路由 | ❌ URL 變更 | ✅ **採用** |
| **Query Parameter** | `/api/users?version=1` | ✅ 彈性 | ❌ 不夠明顯<br>❌ 快取困難 | ❌ |
| **Header Versioning** | `Accept: application/vnd.api.v1+json` | ✅ URL 不變 | ❌ 除錯困難<br>❌ 不夠直觀 | ❌ |

#### 決策 (Decision)
✅ **採用 URL Path Versioning**: `/api/v1/users`, `/api/v2/users`

#### 版本升級策略 (Version Upgrade Strategy)
1. **新增 v2 API**: 保留 v1 API, 新增 v2 API
2. **標註 v1 為 Deprecated**: 在文檔與 Response Header 標註 v1 將淘汰
3. **設定淘汰期限**: v1 API 將於 6 個月後淘汰
4. **通知使用者**: Email 通知, API Response 警告訊息
5. **關閉 v1 API**: 6 個月後關閉 v1 API

```http
# v1 API (Deprecated)
GET /api/v1/users HTTP/1.1

# Response
HTTP/1.1 200 OK
Deprecation: true
Sunset: Sat, 31 Jul 2026 23:59:59 GMT
Link: </api/v2/users>; rel="successor-version"

{
  "success": true,
  "data": [...],
  "warning": "此 API 將於 2026-07-31 淘汰, 請改用 /api/v2/users"
}
```

---

## 📜 錯誤處理標準 (Error Handling Standards)

### 統一錯誤回應格式 (Unified Error Response Format)

```typescript
// Error Response Interface
interface ErrorResponse {
  success: false;
  error: {
    code: string;           // 錯誤代碼 (UPPERCASE_SNAKE_CASE)
    message: string;        // 錯誤訊息 (使用者可讀)
    details?: ErrorDetail[];// 詳細錯誤資訊 (可選, 用於驗證錯誤)
    stack?: string;         // Stack Trace (僅限開發環境)
  };
  meta: {
    requestId: string;      // Request ID (追蹤用)
    timestamp: string;      // ISO 8601 Timestamp
  };
}

interface ErrorDetail {
  field: string;            // 欄位名稱
  message: string;          // 錯誤訊息
  value?: any;              // 欄位值 (可選)
}
```

### 標準錯誤代碼 (Standard Error Codes)

| 錯誤代碼 | HTTP 狀態碼 | 說明 | 範例 |
|---------|-----------|------|------|
| **VALIDATION_ERROR** | 400 | 輸入驗證失敗 | Email 格式錯誤, 密碼長度不足 |
| **UNAUTHORIZED** | 401 | 未驗證 (無 Token 或 Token 無效) | JWT Token 過期, Token 格式錯誤 |
| **FORBIDDEN** | 403 | 已驗證但無權限 | 使用者無權限刪除訂單 |
| **NOT_FOUND** | 404 | 資源不存在 | 商品 ID 不存在 |
| **CONFLICT** | 409 | 資源衝突 | Email 已存在, 訂單已取消無法修改 |
| **UNPROCESSABLE_ENTITY** | 422 | 語意錯誤 | 商品庫存不足, 折扣碼已過期 |
| **RATE_LIMIT_EXCEEDED** | 429 | 超過請求限制 | 超過 1000 requests/min/IP |
| **INTERNAL_SERVER_ERROR** | 500 | 伺服器內部錯誤 | 資料庫連線失敗, 未處理的例外 |
| **SERVICE_UNAVAILABLE** | 503 | 服務暫時無法使用 | 系統維護, 資源不足 |

### 錯誤回應範例 (Error Response Examples)

```http
# 1. 輸入驗證錯誤 (Validation Error)
HTTP/1.1 400 Bad Request
Content-Type: application/json

{
  "success": false,
  "error": {
    "code": "VALIDATION_ERROR",
    "message": "輸入驗證失敗",
    "details": [
      {
        "field": "email",
        "message": "Email 格式錯誤",
        "value": "invalid-email"
      },
      {
        "field": "password",
        "message": "密碼長度至少 8 個字元",
        "value": "***"
      }
    ]
  },
  "meta": {
    "requestId": "550e8400-e29b-41d4-a716-446655440000",
    "timestamp": "2026-01-31T10:30:00Z"
  }
}

# 2. 未驗證 (Unauthorized)
HTTP/1.1 401 Unauthorized
Content-Type: application/json

{
  "success": false,
  "error": {
    "code": "UNAUTHORIZED",
    "message": "JWT Token 已過期, 請重新登入"
  },
  "meta": {
    "requestId": "550e8400-e29b-41d4-a716-446655440000",
    "timestamp": "2026-01-31T10:30:00Z"
  }
}

# 3. 無權限 (Forbidden)
HTTP/1.1 403 Forbidden
Content-Type: application/json

{
  "success": false,
  "error": {
    "code": "FORBIDDEN",
    "message": "您無權限執行此操作"
  },
  "meta": {
    "requestId": "550e8400-e29b-41d4-a716-446655440000",
    "timestamp": "2026-01-31T10:30:00Z"
  }
}

# 4. 資源不存在 (Not Found)
HTTP/1.1 404 Not Found
Content-Type: application/json

{
  "success": false,
  "error": {
    "code": "NOT_FOUND",
    "message": "商品不存在 (ID: 999)"
  },
  "meta": {
    "requestId": "550e8400-e29b-41d4-a716-446655440000",
    "timestamp": "2026-01-31T10:30:00Z"
  }
}

# 5. 資源衝突 (Conflict)
HTTP/1.1 409 Conflict
Content-Type: application/json

{
  "success": false,
  "error": {
    "code": "CONFLICT",
    "message": "Email 已存在, 請使用其他 Email"
  },
  "meta": {
    "requestId": "550e8400-e29b-41d4-a716-446655440000",
    "timestamp": "2026-01-31T10:30:00Z"
  }
}

# 6. 語意錯誤 (Unprocessable Entity)
HTTP/1.1 422 Unprocessable Entity
Content-Type: application/json

{
  "success": false,
  "error": {
    "code": "UNPROCESSABLE_ENTITY",
    "message": "商品庫存不足 (剩餘 5 個, 您要購買 10 個)"
  },
  "meta": {
    "requestId": "550e8400-e29b-41d4-a716-446655440000",
    "timestamp": "2026-01-31T10:30:00Z"
  }
}
```

---

## 📖 API 文檔標準 (API Documentation Standards)

### OpenAPI (Swagger) 規範

```yaml
openapi: 3.0.3
info:
  title: HyperHeroX API
  version: 1.0.0
  description: HyperHeroX E-Commerce Platform API
  contact:
    name: HyperHeroX Team
    email: dev@hyperherox.com
  license:
    name: MIT
    url: https://opensource.org/licenses/MIT

servers:
  - url: https://api.hyperherox.com/api/v1
    description: Production Server
  - url: https://linebotrag-staging.up.railway.app/api/v1
    description: Stage Server (依據 AGENTS.md)

tags:
  - name: Authentication
    description: 身分驗證相關 API
  - name: Users
    description: 使用者管理
  - name: Products
    description: 商品管理
  - name: Orders
    description: 訂單管理

paths:
  /auth/login:
    post:
      tags:
        - Authentication
      summary: 使用者登入
      description: 使用 Email 與密碼登入, 取得 JWT Access Token
      operationId: login
      requestBody:
        required: true
        content:
          application/json:
            schema:
              type: object
              required:
                - email
                - password
              properties:
                email:
                  type: string
                  format: email
                  example: user@example.com
                password:
                  type: string
                  format: password
                  minLength: 8
                  example: SecureP@ssw0rd123
      responses:
        '200':
          description: 登入成功
          content:
            application/json:
              schema:
                type: object
                properties:
                  success:
                    type: boolean
                    example: true
                  data:
                    type: object
                    properties:
                      accessToken:
                        type: string
                        example: eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9...
                      refreshToken:
                        type: string
                        example: eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9...
                      expiresIn:
                        type: integer
                        example: 900
                        description: Access Token 過期時間 (秒)
        '400':
          description: 輸入驗證失敗
          content:
            application/json:
              schema:
                $ref: '#/components/schemas/ErrorResponse'
        '401':
          description: Email 或密碼錯誤
          content:
            application/json:
              schema:
                $ref: '#/components/schemas/ErrorResponse'

  /users:
    get:
      tags:
        - Users
      summary: 取得使用者清單
      description: 取得所有使用者 (需 Admin 權限)
      operationId: getUsers
      security:
        - bearerAuth: []
      parameters:
        - in: query
          name: page
          schema:
            type: integer
            minimum: 1
            default: 1
          description: 頁碼
        - in: query
          name: limit
          schema:
            type: integer
            minimum: 1
            maximum: 100
            default: 20
          description: 每頁筆數
        - in: query
          name: search
          schema:
            type: string
          description: 搜尋關鍵字 (姓名, Email)
      responses:
        '200':
          description: 成功取得使用者清單
          content:
            application/json:
              schema:
                type: object
                properties:
                  success:
                    type: boolean
                    example: true
                  data:
                    type: array
                    items:
                      $ref: '#/components/schemas/User'
                  pagination:
                    $ref: '#/components/schemas/Pagination'
        '401':
          $ref: '#/components/responses/Unauthorized'
        '403':
          $ref: '#/components/responses/Forbidden'

components:
  securitySchemes:
    bearerAuth:
      type: http
      scheme: bearer
      bearerFormat: JWT

  schemas:
    User:
      type: object
      properties:
        id:
          type: integer
          example: 123
        name:
          type: string
          example: John Doe
        email:
          type: string
          format: email
          example: john@example.com
        role:
          type: string
          enum: [admin, user, vendor, cs, guest]
          example: user
        createdAt:
          type: string
          format: date-time
          example: 2026-01-31T10:30:00Z
        updatedAt:
          type: string
          format: date-time
          example: 2026-01-31T10:30:00Z

    Pagination:
      type: object
      properties:
        page:
          type: integer
          example: 1
        limit:
          type: integer
          example: 20
        total:
          type: integer
          example: 1000
        totalPages:
          type: integer
          example: 50
        hasNextPage:
          type: boolean
          example: true
        hasPreviousPage:
          type: boolean
          example: false

    ErrorResponse:
      type: object
      properties:
        success:
          type: boolean
          example: false
        error:
          type: object
          properties:
            code:
              type: string
              example: VALIDATION_ERROR
            message:
              type: string
              example: 輸入驗證失敗
            details:
              type: array
              items:
                type: object
                properties:
                  field:
                    type: string
                    example: email
                  message:
                    type: string
                    example: Email 格式錯誤
        meta:
          type: object
          properties:
            requestId:
              type: string
              format: uuid
              example: 550e8400-e29b-41d4-a716-446655440000
            timestamp:
              type: string
              format: date-time
              example: 2026-01-31T10:30:00Z

  responses:
    Unauthorized:
      description: 未驗證 (無 Token 或 Token 無效)
      content:
        application/json:
          schema:
            $ref: '#/components/schemas/ErrorResponse'
    Forbidden:
      description: 已驗證但無權限
      content:
        application/json:
          schema:
            $ref: '#/components/schemas/ErrorResponse'
```

### API 文檔生成工具

| 工具 | 說明 | 優點 | 採用? |
|------|------|------|------|
| **Swagger UI** | 自動產生 API 文檔介面 | ✅ 互動式測試<br>✅ 廣泛支援 | ✅ **採用** |
| **Redoc** | 優雅的 API 文檔介面 | ✅ 美觀<br>✅ 易於閱讀 | ⚠️ 可選 |
| **Postman** | API 測試與文檔工具 | ✅ 團隊協作<br>✅ 測試自動化 | ✅ **採用** |

---

## 🚀 gRPC API 設計標準 (內部微服務)

### gRPC vs RESTful 比較

| 特性 | gRPC | RESTful |
|------|------|---------|
| **協議** | HTTP/2 + Protocol Buffers | HTTP/1.1 + JSON |
| **效能** | ✅ 高效能 (二進位序列化) | ⚠️ 較慢 (JSON 序列化) |
| **延遲** | ✅ 低延遲 (< 5ms) | ⚠️ 較高延遲 (20-50ms) |
| **型別安全** | ✅ 強型別 (Protocol Buffers) | ❌ 弱型別 (JSON) |
| **瀏覽器支援** | ❌ 需 gRPC-Web | ✅ 原生支援 |
| **除錯** | ❌ 困難 (二進位格式) | ✅ 容易 (人類可讀) |
| **適用場景** | 內部微服務通訊 | 對外 API (前端, 第三方) |

### Protocol Buffers 定義 (.proto)

```protobuf
// user.proto - User Service 定義
syntax = "proto3";

package user;

service UserService {
  rpc GetUser (GetUserRequest) returns (GetUserResponse);
  rpc CreateUser (CreateUserRequest) returns (CreateUserResponse);
  rpc UpdateUser (UpdateUserRequest) returns (UpdateUserResponse);
  rpc DeleteUser (DeleteUserRequest) returns (DeleteUserResponse);
  rpc ListUsers (ListUsersRequest) returns (ListUsersResponse);
}

message GetUserRequest {
  int64 id = 1;
}

message GetUserResponse {
  User user = 1;
}

message User {
  int64 id = 1;
  string name = 2;
  string email = 3;
  string role = 4;
  int64 created_at = 5;
  int64 updated_at = 6;
}

message CreateUserRequest {
  string name = 1;
  string email = 2;
  string password = 3;
}

message CreateUserResponse {
  User user = 1;
}

message ListUsersRequest {
  int32 page = 1;
  int32 limit = 2;
  string search = 3;
}

message ListUsersResponse {
  repeated User users = 1;
  int32 total = 2;
}
```

---

## 📊 GraphQL API 設計標準 (可選)

### GraphQL Schema 定義

```graphql
# schema.graphql - GraphQL Schema 定義

type Query {
  # 取得單一使用者
  user(id: ID!): User
  
  # 取得使用者清單
  users(page: Int, limit: Int, search: String): UserConnection
  
  # 取得商品
  product(id: ID!): Product
  
  # 搜尋商品
  searchProducts(query: String!, category: String, minPrice: Float, maxPrice: Float): [Product!]!
}

type Mutation {
  # 使用者登入
  login(email: String!, password: String!): AuthPayload!
  
  # 建立使用者
  createUser(input: CreateUserInput!): User!
  
  # 更新使用者
  updateUser(id: ID!, input: UpdateUserInput!): User!
  
  # 刪除使用者
  deleteUser(id: ID!): Boolean!
}

type User {
  id: ID!
  name: String!
  email: String!
  role: UserRole!
  orders: [Order!]!
  createdAt: DateTime!
  updatedAt: DateTime!
}

enum UserRole {
  ADMIN
  USER
  VENDOR
  CS
  GUEST
}

type Product {
  id: ID!
  name: String!
  price: Float!
  description: String
  category: Category!
  stock: Int!
  createdAt: DateTime!
}

type Order {
  id: ID!
  user: User!
  items: [OrderItem!]!
  totalAmount: Float!
  status: OrderStatus!
  createdAt: DateTime!
}

enum OrderStatus {
  PENDING
  PAID
  SHIPPED
  DELIVERED
  CANCELLED
}

type AuthPayload {
  accessToken: String!
  refreshToken: String!
  expiresIn: Int!
}

type UserConnection {
  edges: [UserEdge!]!
  pageInfo: PageInfo!
  totalCount: Int!
}

type UserEdge {
  node: User!
  cursor: String!
}

type PageInfo {
  hasNextPage: Boolean!
  hasPreviousPage: Boolean!
  startCursor: String
  endCursor: String
}

input CreateUserInput {
  name: String!
  email: String!
  password: String!
}

input UpdateUserInput {
  name: String
  email: String
}

scalar DateTime
```

---

## 📚 參考資料 (References)

### 內部文檔
- [tech-stack.md](./tech-stack.md) - API Gateway (Kong), 後端框架 (Express.js, FastAPI, Gin)
- [security-guidelines.md](./security-guidelines.md) - JWT Authentication, RBAC, Rate Limiting, Input Validation
- [architecture.md](./architecture.md) - Microservices Architecture, API Gateway Layer
- [AGENTS.md](../../AGENTS.md) - JWT Secret ≥ 32 字元 (Section 6)

### 外部資源
- [RESTful API Design Best Practices](https://restfulapi.net/)
- [OpenAPI Specification](https://swagger.io/specification/)
- [gRPC Documentation](https://grpc.io/docs/)
- [GraphQL Specification](https://graphql.org/learn/)
- [HTTP Status Codes](https://httpstatuses.com/)
- [Google API Design Guide](https://cloud.google.com/apis/design)

---

## 📝 版本歷史 (Version History)

| 版本 | 日期 | 變更內容 | 作者 |
|------|------|---------|------|
| 1.0 | 2026-01-31 | 初始版本：RESTful API 完整規範 + gRPC + GraphQL + OpenAPI 文檔 | HyperHeroX Team |

---

## ✅ 總結 (Conclusion)

本文檔定義了完整的 API 設計規範，涵蓋：
- ✅ **RESTful API 設計標準** (URL 命名, HTTP Method, 狀態碼, Request/Response 格式)
- ✅ **API 安全性** (JWT Authentication, RBAC Authorization, Rate Limiting, Input Validation)
- ✅ **API 版本控制** (URL Path Versioning, 淘汰策略)
- ✅ **錯誤處理標準** (統一錯誤回應格式, 標準錯誤代碼)
- ✅ **API 文檔標準** (OpenAPI/Swagger 規範)
- ✅ **gRPC API 設計** (Protocol Buffers, 內部微服務通訊)
- ✅ **GraphQL API 設計** (Schema 定義, 可選)

所有 API 開發必須嚴格遵循本規範，確保：
- ✅ **一致性** (統一的 URL 設計, 錯誤格式, 回應格式)
- ✅ **安全性** (JWT Authentication, RBAC, Rate Limiting, Input Validation)
- ✅ **效能** (分頁查詢, 快取策略, gRPC 低延遲)
- ✅ **開發者體驗** (清晰的 API 文檔, 互動式測試, Postman Collection)

**Compliance Status**:
- ✅ tech-stack.md (API Gateway, 後端框架)
- ✅ security-guidelines.md (Authentication, Authorization, Rate Limiting, Input Validation)
- ✅ AGENTS.md Section 6 (JWT Secret ≥ 32 字元)
