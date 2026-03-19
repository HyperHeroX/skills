# 開發工作流程
> **目標**: 提供清晰的 OpenSpec 驅動開發工作流程指導

---

## 如述
本文檔詳細說明如何在開發階段使用 OpenSpec (SDD) 高效工作，包括：
- **OpenSpec 生命週期**: 規格驅動開發的核心流程
- **迭代循環（Ultrawork Loop 或 Ralph Loop）**: 後端持續循環開發（在 OpenSpec `/opsx:apply` 階段內執行）
- **UI-UX 規劃**: 前端視覺設計規劃（在 OpenSpec `/opsx:apply` 階段內執行）
- **代碼規範**: 編碼標準和最佳實踐
- **測試策略**: TDD 方法論

---

## OpenSpec 規格驅動開發 (SDD)

### 什麼是 OpenSpec?

OpenSpec 是一個規格驅動開發 (Spec-Driven Development) 框架，在實作前先讓人與 AI 對齊需求。核心理念：「先規格，後實作」。

### 前置條件

```bash
# 安裝 / 更新 OpenSpec（需 Node.js 20.19.0+）
npm install -g @fission-ai/openspec@latest

# 在專案中初始化
cd <project-root>
openspec init
```

### OpenSpec 生命週期（每個任務必須完整執行）

| 步驟 | 命令 | 說明 |
|------|------|------|
| 1. 建立 | `/opsx:new <task-id>-<desc>` | 建立 change folder（proposal + specs + design + tasks） |
| 2. 推進 | `/opsx:continue` 或 `/opsx:ff` | 審閱並完善規格內容 |
| 3. 實作 | `/opsx:apply` | 依據規格實作程式碼 |
| 4. 驗證 | `/opsx:verify` | 驗證實作是否符合規格 |
| 5. 歸檔 | `/opsx:archive` | 將完成的 change 歸檔 |

### 目錄結構

```
openspec/
├── changes/                    # 進行中的 changes
│   └── <task-id>-<desc>/
│       ├── proposal.md         # 目的與範圍
│       ├── specs/              # 需求與使用者情境
│       ├── design.md           # 技術方案
│       └── tasks.md            # 實作檢查清單
└── changes/archive/            # 已完成的 changes
    └── [date]-<task-id>-<desc>/
```

### 核心規則

- **一個任務 = 一個 OpenSpec change**
- **完整生命週期**：每個 change 必須走完 new → continue/ff → apply → verify → archive
- **禁止直接實作**：未建立 OpenSpec change 前，禁止修改原始碼
- **循序處理**：完成一個 change 後才開始下一個

---

## 後端開發流程
### OpenSpec + 迭代循環模式（Ultrawork Loop 或 Ralph Loop）

在 OpenSpec `/opsx:apply` 階段內，可選擇以下任一迭代循環模式：

#### 模式選擇指南

| 模式 | 適用場景 | 特點 |
|------|----------|------|
| **Ultrawork Loop** | 單次會話可完成、需精細控制 | 手動 5 階段循環（分析→實作→測試→驗證→覆盤） |
| **Ralph Loop** | 需多次自動迭代、綠地專案、有明確成功標準 | 自動化迴圈，同一 prompt 反覆執行，AI 看到前次結果持續改進 |

---

### 選項 A: Ultrawork Loop
**什麼是 Ultrawork Loop?**
Ultrawork Loop 是一種手動持續循環開發模式，在 OpenSpec `/opsx:apply` 階段內執行，專為後端開發設計，確保代碼品質和測試覆蓋率。

**循環階段**:
| 階段 | 行動 | 陂間 | 驗證標準 |
|------|------|------|----------|
| **1. 分析** | 理解需求、識別依賴 | 15-20% | 明確的輸入/輸出定義 |
| **2. 實作** | 最小可行程式碼 | 30-40% | 通過 TypeScript 編譯 |
| **3. 測試** | 執行單元測試 | 20-30% | 新測試通過、覆蓋率達標 |
| **4. 驗證** | 手動測試 API | 10-15% | curl/Postman 回應正確 |
| **5. 覆盤** | 檢查代碼品質 | 5-10% | ESLint 通過、無技術債 |

**總時間**: 80-115% 的開發時間
### 循環終止條件
- ✅ 所有功能需求已實作
- ✅ 所有測試通過（覆蓋率 ≥ 80%)
- ✅ 手動驗證通過 (API 測試)
- ✅ 代碼審查通過 (ESLint + TypeScript)
- ✅ 無已知 bug 或技術債
### 實作範例
**Node.js + Express + TypeScript**:
```typescript
// 循環 1: 分析 - 建立基礎架構
// src/services/userService.ts
import { PrismaClient } from '@prisma/client'

import { hash, compare } from 'bcrypt'
import { sign } from 'jsonwebtoken'

import { User } from '@prisma/client'

const prisma = new PrismaClient()

export class UserService {
  async create(data: CreateUserDTO): Promise<User> {
    // 需求明確: 加密密碼、創建用戶
    const hashedPassword = await hash(data.password, 10)
    return prisma.user.create({
      ...data,
      password: hashedPassword,
    })
  }
}

// 循環 2: 實作 - 添加認證方法
export class AuthService {
  constructor(private userService: UserService) {}

  async login(email: string, password: string): Promise<string> {
    const user = await this.userService.findByEmail(email)
    if (!user) throw new Error('Invalid credentials')

    
    const isValid = await compare(password, user.password)
    if (!isValid) throw new Error('Invalid credentials')
    
    return sign({ userId: user.id }, process.env.JWT_SECRET, { expiresIn: '1h' })
  }
}
```

---

### 選項 B: Ralph Loop

**什麼是 Ralph Loop?**
Ralph Loop 是一種自動化迭代開發模式（基於 Ralph Wiggum 技術），在 OpenSpec `/opsx:apply` 階段內執行。核心機制：同一 prompt 反覆餵給 AI，AI 看到自己前次的修改結果，持續迭代改進直到達成完成標準。

**特點**:
- 自動化迭代，無需手動控制每個階段
- 適合有明確成功標準的任務
- 通過 `<promise>` 標籤或 `--max-iterations` 控制終止

**使用方式**（在 `/opsx:apply` 階段內）:

```bash
/ralph-loop "依據 openspec/changes/<task-id>-<description>/ 中的
  specs 和 design 完成實作。

  實作要求：
  1. 閱讀 openspec/changes/<task-id>/specs/ 中的所有規格
  2. 遵循 openspec/changes/<task-id>/design.md 的技術方案
  3. 完成 openspec/changes/<task-id>/tasks.md 中的所有子任務

  驗收標準：
  - 所有功能需求已實作
  - 單元測試覆蓋率 ≥ 80% 且全部通過
  - API 手動測試通過
  - ESLint + TypeScript 編譯通過
  - 無已知 bug 或技術債

  完成時輸出 <promise>TASK COMPLETE</promise>"
  --max-iterations 15
  --completion-promise "TASK COMPLETE"
```

**Ralph Loop 參數建議**:
| 參數 | 建議值 | 說明 |
|------|--------|------|
| `--max-iterations` | 10-20 | 依任務複雜度調整，防止無限循環 |
| `--completion-promise` | `"TASK COMPLETE"` | 成功完成時的信號 |
| prompt | 引用 OpenSpec change 路徑 | 確保每次迭代都參照規格文件 |

**取消正在執行的 Ralph Loop**:
```bash
/cancel-ralph
```

---

## 前端開發流程
### OpenSpec + UI-UX 視覺設計流程

**前端任務 OpenSpec 執行流程**:
```
1. /opsx:new fe-<task-id>-<description>
   → proposal 必須明確宣告使用 ui-ux-pro-max skill
2. /opsx:continue → 完善 UI specs 和 design
3. /opsx:apply → 實作（以下 UI-UX 步驟在此階段內執行）
4. /opsx:verify → 驗證 UI/UX 符合規格
5. /opsx:archive → 歸檔
```

**Step 1: 設計系統生成**（在 `/opsx:apply` 階段內）
使用 ui-ux-pro-max skill 生成完整的設計系統：
```typescript
task(
  category="visual-engineering",
  load_skills=["ui-ux-pro-max"],
  prompt="為 [應用類型] 生成設計系統。
  
  查詢：'[應用類型] [行業] [風格]'
  例如：'healthcare dashboard modern clean'
  
  要求：
  - 無障礙設計 (WCAG 2.1 AA)
  - 專業簡潔
  - RWD 響應式
  - 深色/淺色模式"
)
```
**Step 2: 組件實作**
遵循設計系統實作 Vue/React 組件:
```vue
<!-- 循環 1: UI-UX 規劃 - 茉案設計系統 -->
<template>
  <div class="card">
    <h2>{{ title }}</h2>
    <p>{{ description }}</p>
  </div>
</template>

<script setup lang="ts">
import { ref } from 'vue'

interface Props {
  title: string
  description: string
}

const props = defineProps<Props>()
</script>

<style scoped>
.card {
  padding: 1.5rem;
  border-radius: 0.5rem;
  box-shadow: 0 1px 3px rgba(0, 0, 0, 0.1);
}
</style>
```
### TDD 工作流程
**測試優先原則**:
1. **先寫測試**: 在實作前編寫測試
2. **最小實作**: 只實作足以通過測試的代碼
3. **重構**: 在測試通過後優化代碼
**測試範例**:
```typescript
// tests/unit/userService.test.ts
import { describe, it, expect, from 'vitest'
import { UserService } from '@/services/userService'
import { hash, compare } from 'bcrypt'

import { prisma } from '@/lib/prisma'

// Mock dependencies
vi.mock('@/lib/prisma', () => ({
  user: {
    create: vi.fn(),
    findByEmail: vi.fn(),
  },
}))

vi.mock('bcrypt', () => ({
  hash: vi.fn(),
  compare: vi.fn(),
}))

describe('UserService', () => {
  let service: UserService

  beforeEach(() => {
    service = new UserService()
  })

  describe('create', () => {
    it('應該加密密碼並創建用戶', async () => {
      const data = {
        email: 'test@example.com',
        password: 'Password123!',
        name: 'Test User',
      }

      vi.mocked(bcrypt).hash.mockResolvedValue('hashedPassword')
      vi.mocked(prisma.user.create).mockResolvedValue({ id: 1, ...data, password: 'hashedPassword' })

      const result = await service.create(data)

      expect(vi.mocked(bcrypt).hash).toHaveBeenCalledWith('Password123!', 10)
      expect(vi.mocked(prisma.user.create).toHaveBeenCalledWith({
        ...data,
        password: 'hashedPassword',
      })
    })
  })
})
```
---

## 代碼規範
### TypeScript 最佳實踐
- **嚴格模式**: 啟用 `strict: true`
- **禁止 `any`**: 使用明確的型別
- **接口優先**: 使用 interface 定義數據結構
- **泛型使用**: 適當使用泛型
**範例**:
```typescript
// ✅ Good - 使用明確型別
interface User {
  id: string
  email: string
  name: string
}

async function getUser(id: string): Promise<User> {
  return prisma.user.findUnique({ where: { id } })
}

// ❌ Bad - 使用 any
async function getUser(id: string): Promise<any> {
  return prisma.user.findUnique({ where: { id } })
}
```
### 娡組化設計
**原則**:
- **單一職責**: 每個模組只負責一件事
- **依賴注入**: 使用 DI 容器傳遞依賴
- **可測試性**: 易於單元測試
- **可維護性**: 易於理解和修改
---

## 開發工具
### 前端
- **Vite**: 快速開發構建工具
- **Vue DevTools**: Vue 調試工具
- **ESLint + Prettier**: 代碼檢查和格式化
### 後端
- **Nodemon**: 自動重啟開發工具
- **Postman**: API 測試工具
- **Prisma Studio**: 資料庫管理工具
### 通用
- **Git**: 版本控制
- **VSCode**: 程式碼編輯器
- **Docker/Podman**: 容器化
---

## 持續整合/部署
### Git 工作流程
1. **分支策略**: Git Flow
2. **提交規範**: Conventional Commits
3. **PR 檿查**: Code Review 流程
### CI/CD 流程
```yaml
# .github/workflows/ci.yml
name: CI/CD
on:
  push:
    branches: [main, develop]
jobs:
  test:
    runs-on: ubuntu-latest
    steps:
      - uses: actions/checkout@v3
      - name: Install dependencies
        run: npm ci
      - name: Run tests
        run: npm test
      - name: Build
        run: npm run build
  deploy:
    needs: test
    runs-on: ubuntu-latest
    steps:
      - name: Deploy to production
        run: |
          echo "Deploying to production..."
          # Add deployment commands here
```
---

## 相關文件
- [planning-guide.md](planning-guide.md) - 規劃階段指南
- [test-examples.md](test-examples.md) - 測試範例
- [deployment-guide.md](deployment-guide.md) - 鋪署指南
