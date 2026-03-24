# 測試範例
> **測試框架**: 前端 Vitest, 後端 Jest/Vitest, E2E Playwright

---
## 單元測試範例
### 基礎函數測試
```typescript
// tests/unit/utils/calculator.test.ts
import { describe, it, expect } from 'vitest'
import { Calculator } from '@/utils/calculator'

describe('Calculator', () => {
  describe('add', () => {
    it('應該正確相加兩數字', () => {
      const calculator = new Calculator()
      const result = calculator.add(2, 3)
      expect(result).toBe(5)
    })
    it('應該處理負數', () => {
      const calculator = new Calculator()
      const result = calculator.add(-1, 1)
      expect(result).toBe(0)
    })
  })
  describe('multiply', () => {
    it('應該正確相乘兩數字', () => {
      const calculator = new Calculator()
      const result = calculator.multiply(2, 3)
      expect(result).toBe(6)
    })
  })
})
```
### API 測試範例
```typescript
// tests/api/auth.test.ts
import request from 'supertest'
import { app } from '@/app'
describe('POST /api/auth/login', () => {
  it('登入成功應返回 JWT token', async () => {
    const response = await request(app)
      .post('/api/auth/login')
      .send({
        email: 'test@example.com',
        password: 'Password123!'
      })
    expect(response.status).toBe(200)
    expect(response.body.success).toBe(true)
    expect(response.body.data).toHaveProperty('token')
    expect(response.body.data).toHaveProperty('user')
  })
  it('密碼錯誤應返回 401', async () => {
    const response = await request(app)
      .post('/api/auth/login')
      .send({
        email: 'test@example.com',
        password: 'WrongPassword'
      })
    expect(response.status).toBe(401)
    expect(response.body.success).toBe(false)
    expect(response.body.error.code).toBe('INVALID_CREDENTIALS')
  })
})
```
---
## E2E 測試範例
### 登入流程測試
```typescript
// tests/e2e/auth.spec.ts
import { test, expect } from '@playwright/test'
test('用戶登入流程', async ({ page }) => {
  // 訪問登入頁
  await page.goto('http://localhost/login')
  // 填寫表單
  await page.fill('[name="email"]', 'test@example.com')
  await page.fill('[name="password"]', 'Password123!')
  await page.click('button[type="submit"]')
  // 驗證跳轉
  await expect(page).toHaveURL('http://localhost/dashboard')
  await expect(page.locator('text=歡迎')).toBeVisible()
})
test('登入失敗 - 密碼錯誤', async ({ page }) => {
  await page.goto('http://localhost/login')
  await page.fill('[name="email"]', 'test@example.com')
  await page.fill('[name="password"]', 'WrongPassword')
  await page.click('button[type="submit"]')
  // 驗證錯誤訊息
  await expect(page.locator('text=帳號或密碼錯誤')).toBeVisible()
})
```
### 表單填寫測試
```typescript
// tests/e2e/form.spec.ts
import { test, expect } from '@playwright/test'
test('表單驗證', async ({ page }) => {
  await page.goto('http://localhost/form')
  // 提交空表單
  await page.click('button[type="submit"]')
  // 驗證錯誤訊息
  await expect(page.locator('text=此欄位為必填')).toBeVisible()
  // 填寫表單
  await page.fill('[name="name"]', '測試用戶')
  await page.fill('[name="email"]', 'test@example.com')
  await page.click('button[type="submit"]')
  // 驗證成功
  await expect(page.locator('text=提交成功')).toBeVisible()
})
```
---
## 視覺回歸測試
```typescript
// tests/visual/dashboard.spec.ts
import { test, expect } from '@playwright/test'
test('儀表板視覺檢查', async ({ page }) => {
  await page.goto('http://localhost/dashboard')
  // 檢查統計卡片
  await expect(page.locator('[data-testid="stats-cards"]')).toBeVisible()
  // 檢查圖表
  await expect(page.locator('[data-testid="charts"]')).toBeVisible()
  // 截取快照
  await expect(page).toHaveScreenshot('dashboard.png', {
    fullPage: true,
    maxDiffPixels: 100,
  })
})
```
---
## 執行測試
```bash
# 前端單元測試
npm run test
npm run test:coverage
# 後端單元測試
npm run test
npm run test:coverage
# E2E 測試
npx playwright test
# 視覺回歸測試
npx playwright test tests/visual --project=chromium
```
---
## 相關文件
- [development-workflows.md](development-workflows.md) - 開發工作流程
- [acceptance-checklist.md](acceptance-checklist.md) - 驗收檢查清單
