# Coding Advanced Guide (程式碼進階指南)

> 本文件為 `coding-standards.md` 的進階章節。
>
> **前置閱讀**: `coding-standards.md` (核心編碼規範)

---

## 🔍 Code Review 檢查清單

### 必查項目

| 類別 | 檢查項目 |
|------|---------|
| **功能** | 符合需求、邊界條件處理 |
| **安全** | 輸入驗證、SQL 注入、XSS |
| **效能** | N+1 查詢、無限迴圈、記憶體洩漏 |
| **可讀** | 命名清晰、函數簡短、註解適當 |
| **測試** | 單元測試覆蓋、邊界測試 |

### Review 回饋範本

```markdown
## Summary
- [x] 功能符合需求
- [ ] 需補充測試案例

## Issues
1. `src/service.ts:45` - 缺少 null 檢查
2. `src/api.ts:12` - SQL Injection 風險

## Suggestions
- 建議使用 early return 減少巢狀
```

---

## 📦 Git Commit 規範

### Commit 格式

```
<type>(<scope>): <subject>

<body>

<footer>
```

### Type 類型

| Type | 說明 | 範例 |
|------|------|------|
| `feat` | 新功能 | `feat(auth): add MFA support` |
| `fix` | Bug 修復 | `fix(cart): correct total calculation` |
| `docs` | 文件更新 | `docs(api): update auth endpoints` |
| `style` | 格式調整 | `style: format with prettier` |
| `refactor` | 重構 | `refactor(db): optimize queries` |
| `test` | 測試 | `test(auth): add login tests` |
| `chore` | 雜項 | `chore: update dependencies` |

### 良好 Commit 範例

```bash
# Good
feat(auth): implement JWT refresh token rotation
fix(order): prevent duplicate payment processing

# Bad
update code
fix bug
```

---

## 🛠️ Linter & Formatter

### ESLint 配置

```json
{
  "extends": [
    "eslint:recommended",
    "@typescript-eslint/recommended"
  ],
  "rules": {
    "no-console": "warn",
    "no-unused-vars": "error",
    "@typescript-eslint/explicit-function-return-type": "error"
  }
}
```

### Prettier 配置

```json
{
  "semi": true,
  "singleQuote": true,
  "tabWidth": 2,
  "trailingComma": "es5",
  "printWidth": 100
}
```

### Pre-commit Hook

```yaml
# .husky/pre-commit
npm run lint
npm run format:check
npm run test:unit
```

---

## 📊 效能最佳化

### 常見問題與解法

| 問題 | 解法 |
|------|------|
| N+1 Query | Eager Loading, DataLoader |
| 大量 DOM 操作 | Virtual DOM, 批次更新 |
| 記憶體洩漏 | WeakMap, 清理事件監聽 |
| 重複計算 | Memoization, Caching |
| 阻塞主線程 | Web Worker, async/await |

### React 效能優化

```typescript
// 使用 useMemo 避免重複計算
const expensiveValue = useMemo(() => computeExpensive(data), [data]);

// 使用 useCallback 避免重複建立函數
const handleClick = useCallback(() => {
  doSomething(id);
}, [id]);

// 使用 React.memo 避免不必要的重新渲染
const MemoComponent = React.memo(({ data }) => <div>{data}</div>);
```

### API 效能優化

```typescript
// 批次處理
const results = await Promise.all(ids.map(id => fetchItem(id)));

// 快取策略
const cached = await redis.get(cacheKey);
if (cached) return JSON.parse(cached);
```

---

## 📚 參考資料

- [coding-standards.md](./coding-standards.md) - 核心編碼規範
- [Conventional Commits](https://www.conventionalcommits.org/)
- [Google TypeScript Style Guide](https://google.github.io/styleguide/tsguide.html)
- [Clean Code](https://www.amazon.com/Clean-Code-Handbook-Software-Craftsmanship/dp/0132350882)
