# 程式碼規範 (Coding Standards)

> **Version**: 1.0  
> **Last Updated**: 2026-01-31  
> **Maintainer**: HyperHeroX Team  
> **Status**: ✅ Active

---

## 📋 概述 (Overview)

本文檔定義 HyperHeroX Skills 專案的程式碼風格、命名規範、程式碼品質標準等。所有程式碼必須遵循本規範，確保程式碼一致性、可維護性、可測試性。

---

## 🎯 核心原則 (Core Principles)

| 原則 | 說明 | 實踐方式 |
|------|------|---------|
| **Readability** | 程式碼可讀性優先 | 清晰命名, 適當註解, 避免過度簡化 |
| **Consistency** | 保持一致性 | 遵循專案既有風格, 統一命名規則 |
| **Simplicity** | 簡單優於複雜 | KISS (Keep It Simple, Stupid), DRY (Don't Repeat Yourself) |
| **Testability** | 可測試性優先 | 依賴注入, 單一職責, 避免副作用 |
| **Security** | 安全性優先 | 輸入驗證, 避免不安全函數, 遵循 OWASP Top 10 |

---

## 🚫 程式碼品質禁止事項 (Code Quality Prohibitions)

依據 **AGENTS.md Section 5.2**，以下行為**嚴格禁止**：

### 禁止事項清單
| 禁止行為 | 原因 | 正確做法 |
|---------|------|---------|
| ❌ **新增多餘或不一致註解** | 降低可讀性, 增加維護成本 | 只註解複雜邏輯或業務規則, 避免註解顯而易見的程式碼 |
| ❌ **過度防禦性編碼** | 已驗證路徑不需重複檢查 | 僅在邊界處理輸入驗證, 內部函數信任輸入 |
| ❌ **不安全強制轉型** | 繞過型別檢查, 引入 Runtime 錯誤 | 使用型別守衛 (Type Guards), 避免 `as any` |
| ❌ **破壞既有程式風格** | 降低一致性 | 遵循專案既有風格 (縮排, 命名, 結構) |
| ❌ **使用不安全函數** | `eval`, `exec`, `system` 等處理不受信任輸入 | 使用安全替代方案 (Parameterized Queries, 白名單驗證) |
| ❌ **不安全操作環境變數** | 未驗證輸入直接拼入 `os.getenv`, 路徑 | 使用環境變數庫 (dotenv), 驗證後使用 |

### 禁止函數清單 (Forbidden Functions)
```javascript
// ❌ FORBIDDEN - 禁止使用
eval('user_input');                // JavaScript/Node.js
exec('rm -rf ' + user_input);      // Node.js
new Function('return ' + code)();  // JavaScript
```

```python
# ❌ FORBIDDEN - 禁止使用
eval(user_input)                   # Python
exec(user_input)                   # Python
os.system('rm -rf ' + user_path)   # Python
subprocess.Popen(user_cmd, shell=True)  # Python (shell=True)
```

```go
// ❌ FORBIDDEN - 禁止使用 (Go)
exec.Command("sh", "-c", userInput).Run()  // Go
```

### 安全替代方案 (Secure Alternatives)
```javascript
// ✅ CORRECT - 使用參數化查詢
const result = await db.query('SELECT * FROM users WHERE id = $1', [userId]);

// ✅ CORRECT - 白名單驗證
const allowedCommands = ['start', 'stop', 'restart'];
if (allowedCommands.includes(userCommand)) {
  // 執行白名單內命令
}
```

---

## 📏 命名規範 (Naming Conventions)

### TypeScript/JavaScript
| 類型 | 命名風格 | 範例 | 說明 |
|------|---------|------|------|
| **變數** | camelCase | `userId`, `orderTotal` | 小駝峰式 |
| **常數** | UPPER_SNAKE_CASE | `MAX_RETRIES`, `API_BASE_URL` | 全大寫蛇形 |
| **函數** | camelCase | `getUserById()`, `calculateTotal()` | 動詞開頭 |
| **類別** | PascalCase | `UserService`, `OrderRepository` | 大駝峰式 |
| **介面** | PascalCase | `IUserRepository`, `UserDto` | I- 前綴 (可選) 或 -Dto 後綴 |
| **型別** | PascalCase | `UserType`, `OrderStatus` | 大駝峰式 |
| **列舉** | PascalCase | `UserRole.Admin`, `OrderStatus.Pending` | 列舉值大駝峰式 |
| **檔案** | kebab-case | `user-service.ts`, `order.repository.ts` | 串燒式 (小寫加連字號) |

### Python
| 類型 | 命名風格 | 範例 | 說明 |
|------|---------|------|------|
| **變數** | snake_case | `user_id`, `order_total` | 蛇形式 |
| **常數** | UPPER_SNAKE_CASE | `MAX_RETRIES`, `API_BASE_URL` | 全大寫蛇形 |
| **函數** | snake_case | `get_user_by_id()`, `calculate_total()` | 動詞開頭 |
| **類別** | PascalCase | `UserService`, `OrderRepository` | 大駝峰式 |
| **模組** | snake_case | `user_service.py`, `order_repository.py` | 蛇形式 |
| **私有變數** | _leading_underscore | `_internal_cache`, `_process_data()` | 單底線前綴 |

### Go
| 類型 | 命名風格 | 範例 | 說明 |
|------|---------|------|------|
| **變數** | camelCase | `userID`, `orderTotal` | 小駝峰式 (縮寫全大寫如 ID, URL) |
| **常數** | PascalCase | `MaxRetries`, `APIBaseURL` | 大駝峰式 |
| **函數** | PascalCase (public) / camelCase (private) | `GetUserByID()`, `calculateTotal()` | 大駝峰式 (exported) |
| **結構** | PascalCase | `UserService`, `OrderRepository` | 大駝峰式 |
| **介面** | PascalCase | `UserRepository`, `Stringer` | -er 後綴 (約定俗成) |
| **檔案** | snake_case | `user_service.go`, `order_repository.go` | 蛇形式 |

---

## 📦 程式碼組織 (Code Organization)

### 檔案結構 (File Structure)
```
src/
├── modules/                  # 模組 (依業務領域劃分)
│   ├── user/                # User 模組
│   │   ├── user.controller.ts    # Controller (處理 HTTP 請求)
│   │   ├── user.service.ts       # Service (業務邏輯)
│   │   ├── user.repository.ts    # Repository (資料存取)
│   │   ├── user.dto.ts           # DTO (Data Transfer Object)
│   │   ├── user.entity.ts        # Entity (資料模型)
│   │   └── user.spec.ts          # Unit Test
│   ├── order/               # Order 模組
│   └── product/             # Product 模組
├── common/                  # 共用元件
│   ├── middleware/          # Middleware
│   ├── guards/              # Guards (Authorization)
│   ├── interceptors/        # Interceptors
│   ├── filters/             # Exception Filters
│   └── utils/               # Utility 函數
├── config/                  # 設定檔
│   ├── database.config.ts   # Database 設定
│   └── jwt.config.ts        # JWT 設定
└── main.ts                  # 應用程式進入點
```

### 模組職責分離 (Separation of Concerns)
| 層級 | 職責 | 範例 |
|------|------|------|
| **Controller** | 處理 HTTP 請求, 驗證輸入, 呼叫 Service | `UserController.createUser()` |
| **Service** | 業務邏輯, 協調多個 Repository | `UserService.registerUser()` |
| **Repository** | 資料存取, 與資料庫互動 | `UserRepository.findById()` |
| **Entity** | 資料模型 (ORM) | `UserEntity` |
| **DTO** | 資料傳輸物件, 驗證輸入 | `CreateUserDto` |

---

## 🧩 函數設計 (Function Design)

### 單一職責原則 (Single Responsibility Principle)
```typescript
// ❌ BAD - 函數做太多事
function processUserOrder(userId: string, orderId: string) {
  const user = getUserById(userId);        // 取得使用者
  const order = getOrderById(orderId);     // 取得訂單
  validateOrder(order);                    // 驗證訂單
  const payment = createPayment(order);    // 建立付款
  sendEmail(user.email, order);            // 發送 Email
  updateInventory(order.items);            // 更新庫存
}

// ✅ GOOD - 函數職責單一
async function processUserOrder(userId: string, orderId: string): Promise<void> {
  const user = await userService.getUserById(userId);
  const order = await orderService.getOrderById(orderId);
  
  await orderService.validateOrder(order);
  await paymentService.createPayment(order);
  await notificationService.sendOrderConfirmation(user, order);
  await inventoryService.updateStock(order.items);
}
```

### 函數參數限制 (Function Parameter Limit)
- **最多 3 個參數**：超過 3 個參數使用物件傳遞
- **使用 Options Pattern**：選擇性參數使用物件

```typescript
// ❌ BAD - 過多參數
function createUser(name: string, email: string, age: number, address: string, phone: string) {
  // ...
}

// ✅ GOOD - 使用物件傳遞
interface CreateUserOptions {
  name: string;
  email: string;
  age: number;
  address: string;
  phone: string;
}

function createUser(options: CreateUserOptions): User {
  // ...
}
```

### 函數長度限制 (Function Length Limit)
- **建議上限**: 50 行
- **強制上限**: 100 行
- **超過限制**: 拆分為多個小函數

---

## 🔒 安全編碼規範 (Security Coding Standards)

### 輸入驗證 (Input Validation)
```typescript
// ✅ CORRECT - 使用 DTO 驗證輸入
import { IsEmail, IsString, MinLength, MaxLength } from 'class-validator';

class CreateUserDto {
  @IsString()
  @MinLength(2)
  @MaxLength(50)
  name: string;

  @IsEmail()
  email: string;

  @IsString()
  @MinLength(8)
  password: string;
}

// Controller 自動驗證
@Post('/users')
async createUser(@Body() createUserDto: CreateUserDto) {
  return this.userService.createUser(createUserDto);
}
```

### 密碼雜湊 (Password Hashing)
依據 **AGENTS.md Section 6 (Security Guardrails)**：

```typescript
// ✅ CORRECT - 使用 bcrypt cost 12
import bcrypt from 'bcrypt';

const SALT_ROUNDS = 12;  // AGENTS.md 強制要求

async function hashPassword(password: string): Promise<string> {
  return bcrypt.hash(password, SALT_ROUNDS);
}

async function verifyPassword(password: string, hash: string): Promise<boolean> {
  return bcrypt.compare(password, hash);
}
```

```python
# ✅ CORRECT - Python bcrypt
import bcrypt

SALT_ROUNDS = 12

def hash_password(password: str) -> str:
    return bcrypt.hashpw(password.encode('utf-8'), bcrypt.gensalt(SALT_ROUNDS)).decode('utf-8')

def verify_password(password: str, hash: str) -> bool:
    return bcrypt.checkpw(password.encode('utf-8'), hash.encode('utf-8'))
```

### JWT Secret
依據 **AGENTS.md Section 6 (Security Guardrails)**：

```typescript
// ✅ CORRECT - JWT Secret ≥ 32 字元
const JWT_SECRET = process.env.JWT_SECRET;  // Must be ≥ 32 chars

if (!JWT_SECRET || JWT_SECRET.length < 32) {
  throw new Error('JWT_SECRET must be at least 32 characters');
}

// ✅ CORRECT - JWT 過期時間
const JWT_ACCESS_EXPIRY = '15m';   // Access Token: 15 minutes
const JWT_REFRESH_EXPIRY = '30d';  // Refresh Token: 30 days
```

### SQL Injection 防護
```typescript
// ❌ BAD - 字串拼接 (易受 SQL Injection 攻擊)
const query = `SELECT * FROM users WHERE email = '${email}'`;

// ✅ CORRECT - Parameterized Query
const query = 'SELECT * FROM users WHERE email = $1';
const result = await db.query(query, [email]);
```

```python
# ❌ BAD - Python 字串拼接
query = f"SELECT * FROM users WHERE email = '{email}'"

# ✅ CORRECT - Python Parameterized Query
query = "SELECT * FROM users WHERE email = %s"
cursor.execute(query, (email,))
```

### XSS 防護
```typescript
// ✅ CORRECT - Vue 自動 Escape (Vue built-in)
<template>
  <div>{{ userInput }}</div>  <!-- Vue 自動 escape -->
</template>

// ⚠️ CAUTION - v-html 需手動驗證
<template>
  <div v-html="sanitizedHTML"></div>  <!-- 需使用 DOMPurify sanitize -->
</template>

import DOMPurify from 'dompurify';

const sanitizedHTML = DOMPurify.sanitize(userHTML);
```

---

## 📝 註解規範 (Comment Standards)

### 何時應該註解 (When to Comment)
| 情境 | 是否註解 | 範例 |
|------|---------|------|
| **複雜業務邏輯** | ✅ 必須 | Saga Pattern 補償邏輯 |
| **演算法說明** | ✅ 必須 | 快速排序, 分散式鎖演算法 |
| **重要假設** | ✅ 必須 | "假設訂單狀態為 Pending" |
| **Workaround** | ✅ 必須 | "臨時解法, 待 Bug #123 修復" |
| **簡單邏輯** | ❌ 禁止 | `const sum = a + b;  // 加法` |
| **重複程式碼語意** | ❌ 禁止 | `getUserById(id);  // 取得使用者` |

### JSDoc/TSDoc (TypeScript)
```typescript
/**
 * 建立新訂單並執行 Saga Pattern 分散式交易
 * 
 * @param {CreateOrderDto} orderDto - 訂單資料傳輸物件
 * @param {string} userId - 使用者 ID
 * @returns {Promise<Order>} 建立的訂單
 * @throws {InsufficientStockError} 庫存不足
 * @throws {PaymentFailedError} 付款失敗
 * 
 * @example
 * ```typescript
 * const order = await createOrder(orderDto, 'user-123');
 * ```
 */
async function createOrder(orderDto: CreateOrderDto, userId: string): Promise<Order> {
  // Saga Step 1: Reserve Inventory (with compensation)
  const inventoryReservation = await inventoryService.reserve(orderDto.items);
  
  try {
    // Saga Step 2: Create Payment
    const payment = await paymentService.createPayment(orderDto.total);
    
    // Saga Step 3: Create Order
    return await orderRepository.create({ ...orderDto, userId, paymentId: payment.id });
  } catch (error) {
    // Compensation: Release inventory if payment or order creation fails
    await inventoryService.release(inventoryReservation);
    throw error;
  }
}
```

### Python Docstring
```python
def create_order(order_dto: CreateOrderDto, user_id: str) -> Order:
    """建立新訂單並執行 Saga Pattern 分散式交易
    
    Args:
        order_dto: 訂單資料傳輸物件
        user_id: 使用者 ID
        
    Returns:
        Order: 建立的訂單
        
    Raises:
        InsufficientStockError: 庫存不足
        PaymentFailedError: 付款失敗
        
    Example:
        >>> order = create_order(order_dto, 'user-123')
    """
    # Saga Step 1: Reserve Inventory
    inventory_reservation = inventory_service.reserve(order_dto.items)
    
    try:
        # Saga Step 2: Create Payment
        payment = payment_service.create_payment(order_dto.total)
        
        # Saga Step 3: Create Order
        return order_repository.create({**order_dto, 'user_id': user_id, 'payment_id': payment.id})
    except Exception as e:
        # Compensation: Release inventory
        inventory_service.release(inventory_reservation)
        raise
```

---

## 🧪 可測試性設計 (Testability Design)

### 依賴注入 (Dependency Injection)
```typescript
// ❌ BAD - 硬編碼依賴
class UserService {
  private userRepository = new UserRepository();  // 硬編碼, 無法測試
  
  async getUserById(id: string): Promise<User> {
    return this.userRepository.findById(id);
  }
}

// ✅ GOOD - 依賴注入
class UserService {
  constructor(private userRepository: UserRepository) {}  // 透過 constructor 注入
  
  async getUserById(id: string): Promise<User> {
    return this.userRepository.findById(id);
  }
}

// Unit Test 可注入 Mock
const mockRepository = new MockUserRepository();
const userService = new UserService(mockRepository);
```

### 避免副作用 (Avoid Side Effects)
```typescript
// ❌ BAD - 有副作用 (修改全域狀態)
let totalOrders = 0;

function createOrder(order: Order): Order {
  totalOrders++;  // 副作用: 修改全域變數
  return saveOrder(order);
}

// ✅ GOOD - 無副作用 (Pure Function)
function createOrder(order: Order, currentTotal: number): { order: Order; newTotal: number } {
  return {
    order: saveOrder(order),
    newTotal: currentTotal + 1  // 回傳新值, 不修改輸入
  };
}
```

---

## 🔍 Code Review 檢查清單 (Code Review Checklist)

### 功能性 (Functionality)
- [ ] 程式碼符合需求規格
- [ ] 邊界條件正確處理
- [ ] 錯誤處理完整 (try/catch, error boundary)
- [ ] 日誌記錄適當 (DEBUG, INFO, WARN, ERROR)

### 可讀性 (Readability)
- [ ] 命名清晰且有意義
- [ ] 函數長度 ≤ 50 行 (建議) / ≤ 100 行 (強制)
- [ ] 註解適當且必要
- [ ] 程式碼結構清晰

### 可維護性 (Maintainability)
- [ ] 遵循單一職責原則
- [ ] 避免重複程式碼 (DRY)
- [ ] 模組化設計良好
- [ ] 依賴注入正確使用

### 安全性 (Security)
- [ ] 輸入驗證完整
- [ ] 密碼使用 bcrypt cost 12 雜湊
- [ ] 禁止使用不安全函數 (eval, exec, system)
- [ ] SQL 使用 Parameterized Query
- [ ] JWT Secret ≥ 32 字元

### 效能 (Performance)
- [ ] 避免 N+1 Query 問題
- [ ] 使用索引查詢資料庫
- [ ] 適當使用快取 (Redis)
- [ ] 大量資料使用分頁

### 測試 (Testing)
- [ ] Unit Test 覆蓋率 ≥ 80%
- [ ] 測試案例涵蓋正常流程、邊界條件、錯誤情境
- [ ] Mock 使用正確
- [ ] E2E Test 涵蓋核心流程

---

## 📦 Git Commit 規範 (Git Commit Convention)

### Conventional Commits
```
<type>(<scope>): <subject>

<body>

<footer>

---

## 📖 進階編碼主題

以下進階主題已拆分至獨立文件：

- **Code Review 檢查清單**: [coding-advanced-guide.md](./coding-advanced-guide.md#-code-review-檢查清單)
- **Git Commit 規範**: [coding-advanced-guide.md](./coding-advanced-guide.md#-git-commit-規範)
- **Linter & Formatter**: [coding-advanced-guide.md](./coding-advanced-guide.md#️-linter--formatter)
- **效能最佳化**: [coding-advanced-guide.md](./coding-advanced-guide.md#-效能最佳化)

---

## 📚 參考資料

- [coding-advanced-guide.md](./coding-advanced-guide.md) - 進階編碼主題
- [Conventional Commits](https://www.conventionalcommits.org/)
- [Google Style Guide](https://google.github.io/styleguide/)
