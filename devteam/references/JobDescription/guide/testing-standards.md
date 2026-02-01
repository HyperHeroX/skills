# 測試標準 (Testing Standards)

> **Version**: 1.0  
> **Last Updated**: 2026-01-31  
> **Maintainer**: HyperHeroX Team  
> **Status**: ✅ Active

---

## 📋 概述 (Overview)

本文檔定義 HyperHeroX Skills 專案的測試標準，涵蓋單元測試 (Unit Test)、整合測試 (Integration Test)、端對端測試 (E2E Test)、效能測試 (Performance Test) 等。所有程式碼必須達到測試覆蓋率要求並通過測試驗證。

---

## 🎯 核心原則 (Core Principles)

| 原則 | 說明 | 實踐方式 |
|------|------|---------|
| **Test Early** | 開發初期即開始測試 | TDD (Test-Driven Development) |
| **Test Often** | 持續執行測試 | CI/CD 自動化測試 |
| **Test Coverage** | 高測試覆蓋率 | Unit Test ≥ 80%, E2E Test 100% (核心流程) |
| **Test Isolation** | 測試獨立性 | 每個測試案例獨立執行, 不依賴其他測試 |
| **Test Readability** | 測試可讀性 | AAA Pattern (Arrange, Act, Assert) |

---

## 📊 測試覆蓋率要求 (Test Coverage Requirements)

依據 **AGENTS.md Section 5.1 (Pre-Commit Checks)** 與 **tech-stack.md (Testing Standards)**：

| 測試類型 | 覆蓋率要求 | 工具 | 執行時機 |
|---------|-----------|------|---------|
| **Unit Test** | ≥ 80% | Vitest (Frontend), Jest (Node.js), pytest (Python), Go testing | Pre-commit, CI/CD |
| **Integration Test** | 100% (核心 API) | Postman, Newman | CI/CD |
| **E2E Test** | 100% (核心流程) | **chrome-devtools-mcp** (強制), Playwright | Pre-commit, CI/CD |
| **Performance Test** | N/A | k6, Artillery | 定期執行 (每週) |

---

## 🧪 單元測試 (Unit Test)

### 單元測試目標
- **測試最小可測試單元**: 單一函數、單一類別方法
- **不依賴外部資源**: 不連線資料庫、不呼叫外部 API
- **快速執行**: 單元測試應在 1 秒內完成

### AAA Pattern (Arrange, Act, Assert)
```typescript
// ✅ CORRECT - AAA Pattern
describe('UserService', () => {
  describe('getUserById', () => {
    it('should return user when user exists', async () => {
      // Arrange (準備測試資料)
      const userId = 'user-123';
      const mockUser = { id: userId, name: 'John Doe', email: 'john@example.com' };
      const mockRepository = {
        findById: jest.fn().mockResolvedValue(mockUser),
      };
      const userService = new UserService(mockRepository as any);

      // Act (執行被測試函數)
      const result = await userService.getUserById(userId);

      // Assert (驗證結果)
      expect(result).toEqual(mockUser);
      expect(mockRepository.findById).toHaveBeenCalledWith(userId);
      expect(mockRepository.findById).toHaveBeenCalledTimes(1);
    });

    it('should throw error when user not found', async () => {
      // Arrange
      const userId = 'non-existent-user';
      const mockRepository = {
        findById: jest.fn().mockResolvedValue(null),
      };
      const userService = new UserService(mockRepository as any);

      // Act & Assert
      await expect(userService.getUserById(userId)).rejects.toThrow('User not found');
    });
  });
});
```

### Mock 最佳實踐
```typescript
// ✅ CORRECT - 使用 Jest Mock
const mockRepository = {
  findById: jest.fn().mockResolvedValue(mockUser),
  create: jest.fn().mockResolvedValue(mockUser),
  update: jest.fn().mockResolvedValue(mockUser),
  delete: jest.fn().mockResolvedValue(undefined),
};

// ✅ CORRECT - 驗證 Mock 呼叫
expect(mockRepository.findById).toHaveBeenCalledWith(userId);
expect(mockRepository.findById).toHaveBeenCalledTimes(1);
```

### 測試案例類型
| 測試類型 | 說明 | 範例 |
|---------|------|------|
| **Happy Path** | 正常流程 | 使用者註冊成功 |
| **Boundary Condition** | 邊界條件 | 輸入空字串, 超長字串, 負數 |
| **Error Handling** | 錯誤處理 | 資料庫連線失敗, API 超時 |
| **Edge Case** | 特殊情境 | 同時註冊相同 Email, 庫存剛好為 0 |

### Vitest 設定 (Frontend)
```typescript
// vitest.config.ts
import { defineConfig } from 'vitest/config';
import vue from '@vitejs/plugin-vue';

export default defineConfig({
  plugins: [vue()],
  test: {
    globals: true,
    environment: 'jsdom',
    coverage: {
      provider: 'v8',
      reporter: ['text', 'json', 'html'],
      lines: 80,        // Line coverage ≥ 80%
      functions: 80,    // Function coverage ≥ 80%
      branches: 80,     // Branch coverage ≥ 80%
      statements: 80,   // Statement coverage ≥ 80%
    },
  },
});
```

### Jest 設定 (Backend Node.js)
```javascript
// jest.config.js
module.exports = {
  preset: 'ts-jest',
  testEnvironment: 'node',
  roots: ['<rootDir>/src'],
  testMatch: ['**/__tests__/**/*.ts', '**/?(*.)+(spec|test).ts'],
  coverageThreshold: {
    global: {
      branches: 80,
      functions: 80,
      lines: 80,
      statements: 80,
    },
  },
  collectCoverageFrom: [
    'src/**/*.ts',
    '!src/**/*.dto.ts',      // 排除 DTO
    '!src/**/*.entity.ts',   // 排除 Entity
    '!src/main.ts',          // 排除 Entry Point
  ],
};
```

### pytest 設定 (Python)
```toml
# pyproject.toml
[tool.pytest.ini_options]
minversion = "7.0"
addopts = "-ra -q --cov=src --cov-report=html --cov-report=term --cov-fail-under=80"
testpaths = ["tests"]

[tool.coverage.run]
omit = [
    "*/tests/*",
    "*/migrations/*",
    "*/__init__.py",
]
```

---

## 🔗 整合測試 (Integration Test)

### 整合測試目標
- **測試多個元件整合**: 測試 Controller + Service + Repository + Database
- **使用真實依賴**: 連線測試資料庫 (Docker), 呼叫真實 API
- **獨立測試環境**: 使用獨立的測試資料庫, 每次測試後清理

### Database Integration Test
```typescript
// ✅ CORRECT - 使用 Docker Test Container
import { GenericContainer } from 'testcontainers';

describe('UserRepository Integration Test', () => {
  let container: StartedTestContainer;
  let repository: UserRepository;

  beforeAll(async () => {
    // 啟動 PostgreSQL Docker Container
    container = await new GenericContainer('postgres:15')
      .withExposedPorts(5432)
      .withEnv('POSTGRES_PASSWORD', 'test')
      .withEnv('POSTGRES_DB', 'testdb')
      .start();

    const connectionString = `postgresql://postgres:test@localhost:${container.getMappedPort(5432)}/testdb`;
    repository = new UserRepository(connectionString);
  });

  afterAll(async () => {
    await container.stop();
  });

  it('should create and retrieve user', async () => {
    const user = await repository.create({ name: 'John', email: 'john@example.com' });
    const retrieved = await repository.findById(user.id);
    
    expect(retrieved).toEqual(user);
  });
});
```

### API Integration Test (Postman/Newman)
```bash
# 執行 Postman Collection
newman run api-collection.json --environment test-env.json --reporters cli,json
```

---

## 🌐 端對端測試 (E2E Test)

依據 **AGENTS.md Section 3.3 (測試工具與瀏覽器自動化)**，**所有前端 E2E 測試必須使用 chrome-devtools-mcp**。

### E2E 測試目標
- **測試完整使用者流程**: 從註冊到下單完成
- **真實瀏覽器環境**: 使用 chrome-devtools-mcp 自動化測試
- **視覺驗證**: UI 截圖、版面驗證、RWD、暗/亮色模式

### E2E Test 必須包含 (AGENTS.md Section 3.3)
- ✅ **UI 截圖**
- ✅ **版面與視覺驗證**: 對齊、文字完整、顏色對比度、RWD、暗/亮色模式
- ✅ **互動驗證**: 點擊、輸入、懸停
- ✅ **資料正確性驗證**
- ✅ **Console 錯誤監控與修正**

### chrome-devtools-mcp E2E Test 範例
```typescript
// ✅ CORRECT - 使用 chrome-devtools-mcp
import { ChromeDevTools } from '@chrome-devtools-mcp/client';

describe('User Registration E2E Test', () => {
  let browser: ChromeDevTools;

  beforeAll(async () => {
    browser = await ChromeDevTools.launch({ headless: true });
  });

  afterAll(async () => {
    await browser.close();
  });

  it('should register user successfully', async () => {
    const page = await browser.newPage();
    
    // 1. 導航到註冊頁面
    await page.goto('https://linebotrag-staging.up.railway.app/register');
    
    // 2. UI 截圖 (Before)
    await page.screenshot({ path: 'screenshots/register-before.png' });
    
    // 3. 輸入表單資料
    await page.type('#name', 'John Doe');
    await page.type('#email', 'john@example.com');
    await page.type('#password', 'SecurePass123!');
    
    // 4. 點擊註冊按鈕
    await page.click('button[type="submit"]');
    
    // 5. 等待導航到成功頁面
    await page.waitForNavigation({ waitUntil: 'networkidle0' });
    
    // 6. UI 截圖 (After)
    await page.screenshot({ path: 'screenshots/register-after.png' });
    
    // 7. 驗證 URL
    expect(page.url()).toBe('https://linebotrag-staging.up.railway.app/dashboard');
    
    // 8. 驗證頁面內容
    const welcomeMessage = await page.$eval('.welcome-message', el => el.textContent);
    expect(welcomeMessage).toContain('Welcome, John Doe');
    
    // 9. Console 錯誤監控
    const consoleErrors = await page.evaluate(() => {
      return (window as any).__consoleErrors || [];
    });
    expect(consoleErrors).toHaveLength(0);  // 確保無 Console 錯誤
  });
});
```

### Playwright E2E Test 範例 (輔助工具)
```typescript
// ⚠️ CAUTION - Playwright 可作為輔助工具, 但 chrome-devtools-mcp 優先
import { test, expect } from '@playwright/test';

test('user login flow', async ({ page }) => {
  // 1. 導航到登入頁面
  await page.goto('https://linebotrag-staging.up.railway.app/login');
  
  // 2. 輸入帳號密碼
  await page.fill('input[name="email"]', 'test@example.com');
  await page.fill('input[name="password"]', 'TestPass123!');
  
  // 3. 點擊登入按鈕
  await page.click('button[type="submit"]');
  
  // 4. 等待導航
  await page.waitForURL('**/dashboard');
  
  // 5. 驗證頁面元素
  await expect(page.locator('.user-name')).toHaveText('Test User');
});
```

### E2E Test 核心流程 (100% 覆蓋)
| 流程 | 必測項目 | 預期結果 |
|------|---------|---------|
| **使用者註冊** | 填寫表單 → 送出 → Email 驗證 | 成功導航到 Dashboard |
| **使用者登入** | 輸入帳密 → 送出 | 成功登入, 顯示使用者名稱 |
| **商品瀏覽** | 搜尋商品 → 查看詳情 | 顯示商品資訊 |
| **加入購物車** | 點擊加入購物車 | 購物車數量 +1 |
| **結帳流程** | 填寫地址 → 選擇付款方式 → 確認訂單 | 訂單建立成功 |
| **付款流程** | 選擇信用卡 → 輸入卡號 → 送出 | 付款成功, 顯示訂單編號 |

---

## ⚡ 效能測試 (Performance Test)

### 效能測試目標
- **API 回應時間**: P95 < 200ms
- **併發使用者**: 支援 1000+ 併發使用者
- **吞吐量**: 支援 10K+ RPS (Requests Per Second)

### k6 Load Testing 範例
```javascript
// load-test.js
import http from 'k6/http';
import { check, sleep } from 'k6';

export const options = {
  stages: [
    { duration: '30s', target: 100 },   // Ramp up to 100 users
    { duration: '1m', target: 100 },    // Stay at 100 users
    { duration: '30s', target: 500 },   // Ramp up to 500 users
    { duration: '1m', target: 500 },    // Stay at 500 users
    { duration: '30s', target: 0 },     // Ramp down to 0 users
  ],
  thresholds: {
    http_req_duration: ['p(95)<200'],  // P95 < 200ms
    http_req_failed: ['rate<0.01'],    // Error rate < 1%
  },
};

export default function () {
  const res = http.get('https://linebotrag-staging.up.railway.app/api/products');
  
  check(res, {
    'status is 200': (r) => r.status === 200,
    'response time < 200ms': (r) => r.timings.duration < 200,
  });
  
  sleep(1);
}
```

### Artillery Load Testing 範例
```yaml
# load-test.yml
config:
  target: "https://linebotrag-staging.up.railway.app"
  phases:
    - duration: 60
      arrivalRate: 100  # 100 requests/sec
    - duration: 60
      arrivalRate: 500  # 500 requests/sec
  ensure:
    p95: 200            # P95 < 200ms
    maxErrorRate: 0.01  # Error rate < 1%

scenarios:
  - name: "Get Products"
    flow:
      - get:
          url: "/api/products"
```

---

## 🔐 安全測試 (Security Test)

### OWASP ZAP Automated Security Scan
```bash
# 執行 OWASP ZAP 自動化掃描
docker run -v $(pwd):/zap/wrk/:rw -t owasp/zap2docker-stable \
  zap-baseline.py -t https://linebotrag-staging.up.railway.app -r zap-report.html
```

### Snyk Dependency Scan
```bash
# 執行 Snyk 依賴掃描
snyk test --all-projects --severity-threshold=high
```

### 安全測試檢查清單
- [ ] **SQL Injection**: 測試 SQL Injection 攻擊
- [ ] **XSS**: 測試 Cross-Site Scripting 攻擊
- [ ] **CSRF**: 測試 Cross-Site Request Forgery 攻擊
- [ ] **Authentication Bypass**: 測試身份驗證繞過
- [ ] **Authorization Bypass**: 測試授權繞過
- [ ] **Sensitive Data Exposure**: 測試敏感資料外洩

---

## 🚀 CI/CD 測試流程 (CI/CD Testing Pipeline)

依據 **AGENTS.md Section 5.1 (Pre-Commit Checks)** 與 **tech-stack.md (CI/CD Pipeline)**：

### Pre-Commit Checks
```bash
# 1. 編譯無錯誤
npm run build           # Frontend (Nuxt)
dotnet build            # Backend (C#, if applicable)

# 2. 後端單元測試全部通過
npm run test:unit       # Node.js (Jest)
poetry run pytest       # Python (pytest)
go test ./...           # Go

# 3. 前端 UI / 元件測試全部通過
npm run test:unit       # Frontend (Vitest)

# 4. 瀏覽器 E2E 測試全部通過 (chrome-devtools-mcp)
npm run test:e2e        # E2E Test (chrome-devtools-mcp)
```

### GitHub Actions CI/CD Pipeline
```yaml
# .github/workflows/test.yml
name: Test Pipeline

on:
  push:
    branches: [main, stage, feature/*]
  pull_request:
    branches: [main, stage]

jobs:
  unit-test:
    runs-on: ubuntu-latest
    steps:
      - uses: actions/checkout@v3
      - uses: actions/setup-node@v3
        with:
          node-version: 20
      - run: npm ci
      - run: npm run test:unit
      - run: npm run test:coverage  # Upload coverage report

  e2e-test:
    runs-on: ubuntu-latest
    steps:
      - uses: actions/checkout@v3
      - uses: actions/setup-node@v3
        with:
          node-version: 20
      - run: npm ci
      - run: npm run test:e2e  # chrome-devtools-mcp

  security-scan:
    runs-on: ubuntu-latest
    steps:
      - uses: actions/checkout@v3
      - name: Run Snyk
        run: snyk test --all-projects --severity-threshold=high
      - name: Run OWASP ZAP
        run: |
          docker run -v $(pwd):/zap/wrk/:rw -t owasp/zap2docker-stable \
            zap-baseline.py -t https://linebotrag-staging.up.railway.app -r zap-report.html
```

---

## 📦 測試資料管理 (Test Data Management)

### Test Fixture
```typescript
// fixtures/user.fixture.ts
export const userFixture = {
  validUser: {
    name: 'John Doe',
    email: 'john@example.com',
    password: 'SecurePass123!',
  },
  invalidEmail: {
    name: 'Jane Doe',
    email: 'invalid-email',  // Invalid email format

---

## 📚 參考資料

- [Jest Documentation](https://jestjs.io/)
- [Playwright Documentation](https://playwright.dev/)
- [Testing Library](https://testing-library.com/)
