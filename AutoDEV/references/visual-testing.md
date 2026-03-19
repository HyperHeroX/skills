# 視覺回歸測試指南
> **測試框架**: Playwright Visual Testing
> **適用範圍**: UI 視覺一致性測試

---

## 目標

確保 UI 視覺一致性，檢測 RWD 響應式、無障礙設計和視覺回歸問題。

---

## 視覺測試類型

### 1. 快照測試 (Snapshot Testing)

**目的**: 比較 UI 與基準快照

**示例**:
```typescript
import { test, expect } from '@playwright/test'

test('首頁視覺檢查', async ({ page }) => {
  await page.goto('/')
  await expect(page).toHaveScreenshot('homepage.png', {
    fullPage: true,
    maxDiffPixels: 100,
  })
})
```

### 2. 元素快照測試

**目的**: 測試特定組件的視覺一致性

**示例**:
```typescript
test('導航欄視覺檢查', async ({ page }) => {
  await page.goto('/')
  const navbar = page.locator('[data-testid="navbar"]')
  await expect(navbar).toHaveScreenshot('navbar.png')
})
```

### 3. RWD 響應式測試
**目的**: 測試不同視窗尺寸下的 UI 表現

**示例**:
```typescript
test.describe('RWD 測試', () => {
  test('桌面視圖', async ({ page }) => {
    await page.setViewportSize({ width: 1920, height: 1080 })
    await page.goto('/')
    await expect(page).toHaveScreenshot('desktop.png')
  })
  test('平板視圖', async ({ page }) => {
    await page.setViewportSize({ width: 768, height: 1024 })
    await page.goto('/')
    await expect(page).toHaveScreenshot('tablet.png')
  })
  test('手機視圖', async ({ page }) => {
    await page.setViewportSize({ width: 375, height: 667 })
    await page.goto('/')
    await expect(page).toHaveScreenshot('mobile.png')
  })
})
```

### 4. 深色/淺色模式測試
**目的**: 測試主題切換

**示例**:
```typescript
test.describe('主題測試', () => {
  test('淺色模式', async ({ page }) => {
    await page.emulateMedia({ colorScheme: 'light' })
    await page.goto('/')
    await expect(page).toHaveScreenshot('light-theme.png')
  })
  test('深色模式', async ({ page }) => {
    await page.emulateMedia({ colorScheme: 'dark' })
    await page.goto('/')
    await expect(page).toHaveScreenshot('dark-theme.png')
  })
})
```

---

## 測試配置

### Playwright 配置
```typescript
// playwright.config.ts
import { defineConfig } from '@playwright/test'
export default defineConfig({
  testDir: './tests/visual',
  fullyParallel: true,
  forbidOnly: true,
  retries: 2,
  workers: 4,
  reporter: 'html',
  use: {
    baseURL: 'http://localhost:3000',
    trace: 'on-first-retry',
    screenshot: 'only-on-failure',
    video: 'retain-on-failure',
  },
  projects: [
    {
      name: 'chromium',
      use: { browserName: 'chromium' },
    },
  ],
})
```

### 快照存儲
```
tests/
  visual/
    example.spec.ts
    example.spec.ts-snapshots/
      homepage.png
      navbar.png
      desktop.png
      mobile.png
```

---

## 最佳實景踳

### 1. 快照命名規範
```
[功能]-[頁面]-[視窗尺寸]-[狀態].png

範例:
- dashboard-home-desktop-logged-in.png
- login-form-mobile-error.png
- profile-settings-tablet-editing.png
```

### 2. 容錯度設置
```typescript
await expect(page).toHaveScreenshot('homepage.png', {
  maxDiffPixels: 100,        // 最多 100 像素差異
  maxDiffPixelRatio: 0.01,   // 最多 1% 差異
  threshold: 0.2,             // 每像素 20% 差異容錯度
  animations: 'allow',        // 允許動畫
  fullPage: true,             // 完整頁面
})
```

### 3. 忽略動態內容
```typescript
await expect(page).toHaveScreenshot('dashboard.png', {
  mask: [
    page.locator('[data-testid="live-chart"]'),
    page.locator('[data-testid="timestamp"]'),
  ],
})
```

### 4. 等待渲染完成
```typescript
// 等待網絡請求完成
await page.waitForLoadState('networkidle')
// 等待特定元素
await page.waitForSelector('[data-testid="loaded"]')
// 等待動畫完成
await page.waitForTimeout(1000)
```

---

## 測試流程

### 1. 基準快照生成
```bash
# 首次運行會生成基準快照
npx playwright test --update-snapshots
```

### 2. 回歸測試
```bash
# 運行視覺測試
npx playwright test tests/visual
```

### 3. 更新快照
```bash
# 更新失敗的快照
npx playwright test --update-snapshots
```

---

## CI/CD 整合

### GitHub Actions
```yaml
name: Visual Regression Tests
on:
  pull_request:
jobs:
  visual-tests:
    runs-on: ubuntu-latest
    steps:
      - uses: actions/checkout@v3
      - uses: actions/setup-node@v3
      - name: Install dependencies
        run: npm ci
      - name: Install Playwright
        run: npx playwright install --with-deps chromium
      - name: Run visual tests
        run: npx playwright test tests/visual
      - uses: actions/upload-artifact@v3
        if: failure()
        with:
          name: playwright-report
          path: playwright-report/
```

---

## 常見問題

### 1. 快照比較失敗
**原因**: UI 變更或渲染差異
**解決**: 檢查變更是否預期，更新快照

### 2. 時間相關問題
**原因**: 動畫、加載時間不一致
**解決**: 使用 `waitForLoadState` 或 `waitForTimeout`

### 3. 字體渲染差異
**原因**: 不同 OS 字體渲染差異
**解決**: 在 CI 中安裝統一字體

### 4. 動態內容干擾
**原因**: 即時數據、時間戳
**解決**: 使用 mask 忽略動態區域

---

## 相關文件
- [test-examples.md](test-examples.md) - E2E 測試範例
- [acceptance-checklist.md](acceptance-checklist.md) - 驗收檢查清單
