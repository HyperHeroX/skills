# 多語言支援測試 - QA Engineer (繁體中文)

## 測試場景
測試 QA Engineer JD 是否能引導 AI 產生符合規範的測試案例與 Bug 報告，重點驗證：
1. chrome-devtools-mcp 整合提及
2. 測試案例涵蓋 positive/negative/edge cases
3. Bug 報告包含明確重現步驟與證據

## 模擬對話情境
**使用者**：「請根據任務拆解文件（chinese-devlead-test.md）設計測試案例，並執行 E2E 測試。」
**輸入**：
- Dev Lead 產出的任務拆解（be-t001: 使用者註冊 API）
- 測試目標：驗證 be-t001-st001（輸入驗證）與 be-t001-st002（密碼雜湊）

## QA Engineer 回應（AI 依偵測語言生成：繁體中文）

---

# 測試案例文件 - 使用者註冊 API

## 測試目標
驗證 `POST /api/auth/register` 的輸入驗證與密碼雜湊功能，確保：
- 有效輸入成功註冊
- 無效輸入回傳明確錯誤訊息
- 密碼以安全方式儲存（bcrypt，不可逆）

---

## Test Case: TC-001 - 有效註冊成功（Happy Path）

### 優先級
必須具備（Must-Have）

### 前置條件
- API 端點 `/api/auth/register` 可用
- 資料庫已清空測試資料
- Email `testuser@example.com` 不存在於資料庫

### 測試步驟
1. 使用 `chrome-devtools-mcp` 發送 POST 請求至 `/api/auth/register`
2. Request Body:
   ```json
   {
     "email": "testuser@example.com",
     "password": "Test123!@#"
   }
   ```
3. 驗證 HTTP 狀態碼
4. 驗證回應 body 結構
5. 查詢資料庫驗證 user 記錄

### 預期結果
- ✅ HTTP 狀態碼：201 Created
- ✅ 回應 body 包含：
  ```json
  {
    "id": "<UUID>",
    "email": "testuser@example.com",
    "created_at": "<ISO 8601 timestamp>"
  }
  ```
- ✅ 回應 body 不包含：`password`, `verification_token`
- ✅ 資料庫 users 資料表新增 1 筆記錄
- ✅ `password` 欄位為 bcrypt hash（60 字元，開頭為 `$2b$12$`）
- ✅ 原始密碼 `Test123!@#` 不出現在資料庫或日誌

### 測試資料
| 欄位 | 值 |
|------|-----|
| Email | testuser@example.com |
| Password | Test123!@# |

### 瀏覽器環境
- Chrome 120+（透過 chrome-devtools-mcp）
- OS: Windows 11

### 狀態
⏳ 待執行

---

## Test Case: TC-002 - 無效 Email 格式（Negative）

### 優先級
必須具備（Must-Have）

### 前置條件
- API 端點可用

### 測試步驟
1. 發送 POST 請求至 `/api/auth/register`
2. Request Body（無效 email 格式）:
   ```json
   {
     "email": "invalid-email",
     "password": "Test123!@#"
   }
   ```
3. 驗證回應狀態碼與錯誤訊息

### 預期結果
- ✅ HTTP 狀態碼：400 Bad Request
- ✅ 錯誤訊息：`"Invalid email format"`（英文）或 `"無效的電子信箱格式"`（繁中）
- ✅ 資料庫無新增記錄

### 測試資料
| 測試案例 | Email |
|----------|-------|
| 缺少 @ | `invalidemail.com` |
| 缺少域名 | `test@` |
| 空字串 | `""` |
| null 值 | `null` |
| 特殊字元 | `test@@example.com` |

### 瀏覽器環境
- Chrome 120+（透過 chrome-devtools-mcp）

### 狀態
⏳ 待執行

---

## Test Case: TC-003 - 弱密碼拒絕（Negative）

### 優先級
必須具備（Must-Have）

### 前置條件
- API 端點可用

### 測試步驟
1. 發送 POST 請求至 `/api/auth/register`
2. Request Body（弱密碼）:
   ```json
   {
     "email": "testuser@example.com",
     "password": "abc123"
   }
   ```
3. 驗證回應錯誤訊息

### 預期結果
- ✅ HTTP 狀態碼：400 Bad Request
- ✅ 錯誤訊息：`"Password must be at least 8 characters with uppercase, number, and symbol"`
- ✅ 資料庫無新增記錄

### 測試資料
| 測試案例 | Password | 預期錯誤原因 |
|----------|----------|------------|
| 太短 | `Test1!` | < 8 字元 |
| 無大寫 | `test123!` | 缺少大寫字母 |
| 無數字 | `TestAbc!` | 缺少數字 |
| 無特殊符號 | `Test1234` | 缺少特殊符號 |
| 純數字 | `12345678` | 缺少字母與符號 |

### 瀏覽器環境
- Chrome 120+（透過 chrome-devtools-mcp）

### 狀態
⏳ 待執行

---

## Test Case: TC-004 - 重複 Email 拒絕（Negative）

### 優先級
必須具備（Must-Have）

### 前置條件
- 資料庫已存在 user：email = `existing@example.com`

### 測試步驟
1. 第一次註冊：`POST /api/auth/register` with `existing@example.com`（成功）
2. 第二次註冊：使用相同 email（應失敗）
3. 驗證錯誤回應

### 預期結果
- ✅ 第一次註冊：201 Created
- ✅ 第二次註冊：409 Conflict
- ✅ 錯誤訊息：`"Email already exists"`
- ✅ 資料庫僅有 1 筆記錄（非 2 筆）

### 瀏覽器環境
- Chrome 120+（透過 chrome-devtools-mcp）

### 狀態
⏳ 待執行

---

## Test Case: TC-005 - SQL Injection 防護（Security / Edge）

### 優先級
高（High）- 安全性測試

### 前置條件
- API 端點可用

### 測試步驟
1. 發送惡意 SQL 字串作為 email
2. Request Body:
   ```json
   {
     "email": "test@example.com'; DROP TABLE users; --",
     "password": "Test123!@#"
   }
   ```
3. 驗證 API 正確處理（應拒絕或安全處理）
4. 檢查資料庫 users 資料表是否仍存在

### 預期結果
- ✅ HTTP 狀態碼：400 Bad Request（email 格式驗證失敗）
- ✅ 或 500 Internal Server Error（但資料表未被刪除）
- ✅ 資料庫 users 資料表仍存在
- ✅ 無 SQL 錯誤訊息洩漏至前端

### 安全需求驗證
- 使用參數化查詢（Prepared Statements）
- 不直接拼接 SQL 字串
- 錯誤訊息不洩漏資料庫結構

### 瀏覽器環境
- Chrome 120+（透過 chrome-devtools-mcp）

### 狀態
⏳ 待執行

---

## Test Case: TC-006 - Emoji 與 Unicode 字元支援（Edge）

### 優先級
中（Medium）

### 前置條件
- API 端點可用

### 測試步驟
1. 發送包含 emoji 的 email
2. Request Body:
   ```json
   {
     "email": "test😀@example.com",
     "password": "Test123!@#"
   }
   ```
3. 驗證 API 行為

### 預期結果
**兩種可接受結果**：
- ✅ 選項 A：400 Bad Request（email 格式驗證拒絕 emoji）
- ✅ 選項 B：201 Created（支援 emoji，資料庫正確儲存）

**不可接受結果**：
- ❌ 500 Internal Server Error（未處理 Unicode 字元）
- ❌ 儲存後資料損壞（顯示為 `?` 或亂碼）

### 瀏覽器環境
- Chrome 120+（透過 chrome-devtools-mcp）

### 狀態
⏳ 待執行

---

## Test Case: TC-007 - 密碼雜湊安全性驗證（Security）

### 優先級
必須具備（Must-Have）- 安全關鍵

### 前置條件
- 已成功註冊 user：email = `hashtest@example.com`, password = `Test123!@#`

### 測試步驟
1. 查詢資料庫取得 user 記錄
2. 驗證 password 欄位內容
3. 使用相同密碼再次註冊（不同 email）
4. 比較兩次 password hash 是否不同

### 預期結果（依 be-t001-st002 安全需求）
- ✅ Password hash 格式：`$2b$12$[22字元salt][31字元hash]`（總長 60 字元）
- ✅ 原始密碼不出現在資料庫（不可逆）
- ✅ 兩次相同密碼產生不同 hash（salt 隨機性）
- ✅ Cost factor 為 12（從 hash 開頭 `$2b$12$` 可見）

### 驗證工具
- 資料庫查詢工具（直接檢視 password 欄位）
- bcrypt 驗證函數（測試 `bcrypt.compare("Test123!@#", hash)` 回傳 true）

### 狀態
⏳ 待執行

---

## Test Case: TC-008 - API 回應時間效能測試（Non-Functional）

### 優先級
高（High）

### 前置條件
- API 端點可用
- 資料庫已有 1000+ user 記錄（模擬真實負載）

### 測試步驟
1. 使用 `chrome-devtools-mcp` 發送 100 個並行註冊請求
2. 記錄每個請求的回應時間
3. 計算 P95（第 95 百分位數）

### 預期結果（依 be-t001 NFR）
- ✅ P95 回應時間 < 500ms
- ✅ 平均回應時間 < 300ms
- ✅ 無請求超時（> 5000ms）
- ✅ 所有請求成功率 > 99%

### 負載參數
- 並行請求數：100
- 請求間隔：10ms
- 總測試時間：約 5 秒

### 狀態
⏳ 待執行

---

## E2E 測試執行計畫

### 測試環境設定
**使用工具**：`chrome-devtools-mcp`（必須使用）

**環境資訊**：
- 測試 URL：https://linebotrag-staging.up.railway.app/api/auth/register
- 瀏覽器：Chrome 120+
- OS：Windows 11
- 資料庫：PostgreSQL（Supabase）

### 執行步驟
1. **啟動瀏覽器自動化**：使用 `chrome-devtools-mcp` 連線至測試環境
2. **清理測試資料**：刪除資料庫中的測試 user 記錄
3. **執行測試案例**：依序執行 TC-001 至 TC-008
4. **擷取證據**：
   - UI 截圖（chrome-devtools-mcp 截圖功能）
   - Console 錯誤日誌
   - Network 請求/回應詳情
5. **驗證結果**：比對實際結果與預期結果
6. **產出報告**：
   - 測試通過：更新狀態為 ✅ Pass
   - 測試失敗：建立 Bug 報告（be-bug-{nnn}.md）

### Console 錯誤檢查
**要求**：Console 錯誤數 = 0（依 QA 測試清單）

**監控項目**：
- JavaScript 錯誤
- CORS 錯誤
- 網路請求失敗
- 未處理的 Promise rejection

---

## Bug 報告範例（若測試失敗）

### be-bug-001 - 弱密碼未被拒絕（假設 TC-003 失敗）

**嚴重性**：高（High）

**步驟重現**：
1. 導航至註冊 API：`POST /api/auth/register`
2. 發送 Request Body:
   ```json
   {
     "email": "testuser@example.com",
     "password": "abc123"
   }
   ```
3. 提交請求

**預期行為**：
API 回傳 400 Bad Request，錯誤訊息為 "Password must be at least 8 characters with uppercase, number, and symbol"

**實際行為**：
API 回傳 201 Created，弱密碼被成功儲存至資料庫

**證據**：
- **Screenshot**：`test/screenshots/be-bug-001-weak-password-accepted.png`
- **Console 錯誤**：無
- **Network Trace**：
  ```
  POST /api/auth/register
  Status: 201 Created
  Response Body: {"id": "...", "email": "testuser@example.com", ...}
  ```
- **資料庫驗證**：
  ```sql
  SELECT email, password FROM users WHERE email = 'testuser@example.com';
  -- 結果：password 欄位包含弱密碼的 hash
  ```

**環境**：
- Browser: Chrome 120
- OS: Windows 11
- URL: https://linebotrag-staging.up.railway.app/api/auth/register

**安全影響**：
違反 be-t001-st001 安全需求，使用者可設定弱密碼（易被暴力破解）

**建議修復**：
在 `server/utils/validation.ts` 中加入密碼強度驗證正規表達式：
```typescript
const PASSWORD_REGEX = /^(?=.*[a-z])(?=.*[A-Z])(?=.*\d)(?=.*[@$!%*?&#])[A-Za-z\d@$!%*?&#]{8,}$/;
```

**關聯任務**：
- be-t001-st001（輸入驗證）

---

## 測試覆蓋率摘要

### 功能需求覆蓋
| 功能需求 | 測試案例 | 覆蓋率 |
|---------|---------|--------|
| FR-001: 有效註冊 | TC-001 | ✅ |
| FR-002: Email 驗證 | TC-002 | ✅ |
| FR-003: 密碼強度驗證 | TC-003 | ✅ |
| FR-004: 重複 Email 檢查 | TC-004 | ✅ |

### 測試類型分布
- **Positive（正向）**：1 個（TC-001）
- **Negative（負向）**：3 個（TC-002, TC-003, TC-004）
- **Edge（邊界）**：2 個（TC-005 SQL Injection, TC-006 Emoji）
- **Security（安全）**：2 個（TC-005, TC-007）
- **Non-Functional（非功能）**：1 個（TC-008 效能）

**總計**：8 個測試案例

### 必須使用工具
- ✅ **chrome-devtools-mcp**：所有 E2E 測試（TC-001 至 TC-008）
- ✅ **截圖功能**：視覺驗證（UI 正確性、錯誤訊息顯示）
- ✅ **Console 監控**：錯誤數必須為 0
- ✅ **Network 追蹤**：驗證請求/回應格式

---

## 測試驗證

✅ **語言偵測**：文件以繁體中文生成  
✅ **chrome-devtools-mcp 整合**：
- E2E 測試執行計畫明確提及使用 `chrome-devtools-mcp`
- 截圖、Console 監控、Network 追蹤功能皆列入測試步驟

✅ **測試案例涵蓋**：
- Positive（1 個）：TC-001 有效註冊
- Negative（3 個）：TC-002 無效 Email、TC-003 弱密碼、TC-004 重複 Email
- Edge（2 個）：TC-005 SQL Injection、TC-006 Emoji
- Security（2 個）：TC-005 SQL Injection、TC-007 密碼雜湊
- Non-Functional（1 個）：TC-008 效能測試

✅ **Bug 報告格式**：
- 嚴重性分級（Critical/High/Medium/Low）
- 明確重現步驟（1-2-3 步驟）
- 預期 vs. 實際行為對比
- 證據完整（Screenshot、Console、Network Trace、資料庫驗證）
- 環境資訊（Browser、OS、URL）
- 安全影響評估（針對安全性 Bug）
- 建議修復方案（程式碼範例）

✅ **Forbidden Patterns 遵守**：
- ❌ 無模糊 Bug（所有 Bug 範例都有具體描述）
- ✅ 證據完整（Screenshot、Console、Network Trace）
- ✅ 包含邊界情況測試（TC-005 SQL Injection, TC-006 Emoji）
- ✅ 必須使用 chrome-devtools-mcp（明確列入執行計畫）

✅ **Persona 模擬**：
- 「Break-it mindset」→ TC-005 SQL Injection、TC-006 Emoji（試圖破壞系統）
- 「Edge case hunter」→ TC-006 Emoji、TC-005 SQL Injection、TC-003 各種弱密碼
- 「Security tester」→ TC-005 SQL Injection、TC-007 密碼雜湊安全性
- 「Evidence-based」→ Bug 報告包含 Screenshot、Console、Network、資料庫驗證

✅ **Critical Thinking Patterns**：
- 「How can I make this fail?」→ TC-003 測試 5 種弱密碼、TC-002 測試 5 種無效 Email
- 「What if user enters emoji?」→ TC-006 Emoji 測試
- 「What if I tamper with this request?」→ TC-005 SQL Injection
- 「Is this error message helpful?」→ 預期結果包含明確錯誤訊息

---

**結論**：QA Engineer JD 成功引導 AI 生成高品質測試案例文件，完全符合 chrome-devtools-mcp 整合、測試覆蓋完整性、Bug 報告規範的驗證目標。
