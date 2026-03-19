# 資安 Review 檢查清單

> **目標**: 確保應用程序沒有安全漏洞，符合行業標準

---

## 認證與授權

### JWT 配置
- [ ] JWT 密鑰強度 ≥ 256 bits
- [ ] JWT 過期時間合理 (15-60 分鐘)
- [ ] Refresh token 機制實作
- [ ] Token 黑名單機制
- [ ] 敏感資料不包含在 payload 中

### 密碼處理
- [ ] 使用 bcrypt/argon2 加密
- [ ] 加密強度 ≥ 10 rounds
- [ ] 密碼複雜度要求：
  - 長度 ≥ 8 字元
  - 包含大小寫字母
  - 包含數字
  - 包含特殊字符
- [ ] 密碼不存儲明文
### 授權檢查
- [ ] 基於角色的授權 (RBAC)
- [ ] 基於權限的授權
- [ ] 資源級權限控制
- [ ] API 端點權限驗證

---
## 輸入驗證
### 請求驗證
- [ ] 所有輸入經過驗證
- [ ] 使用驗證中間件 (如 Joi/Zod/express-validator)
- [ ] 鉗誤訊息清晰
- [ ] 錯誤代碼規範
### SQL 注入防護
- [ ] 使用參數化查詢
- [ ] 輸入轉義處理
- [ ] 避免 SQL 字串拼接
- [ ] ORM 自動防護
### XSS 防護
- [ ] 輸出編碼 (HTML escape)
- [ ] Content Security Policy (CSP) 配置
- [ ] HttpOnly Cookie 標記
- [ ] 避免使用 `dangerouslySetInnerHTML`
---
## HTTP 安全標頭
### CORS 配置
- [ ] 白名單域名限制
- [ ] 允許的方法限制
- [ ] 允許的標頭限制
- [ ] 預檢請求限制 (max age)
### 安全標頭
- [ ] `X-Content-Type-Options: nosniff`
- [ ] `X-Frame-Options: DENY`
- [ ] `X-XSS-Protection: 1; mode=block`
- [ ] `Strict-Transport-Security: max-age=31536000`
- [ ] `Content-Security-Policy` 配置
### HTTPS 強制
- [ ] 生產環境強制 HTTPS
- [ ] HSTS 標頭配置
- [ ] SSL/TLS 憑證有效
---
## 敏感資料保護
### 環境變數
- [ ] 使用 .env 文件
- [ ] .env 不提交到版本控制
- [ ] 生產環境變數加密存儲
- [ ] 敏感資料不硬編碼
### 日誌
- [ ] 不記錄敏感資訊
  - 密碼
  - Token
  - API 密鑰
  - 個人資料
- [ ] 日誌級別適當
- [ ] 日誌輪替策略
### 加密存儲
- [ ] 敏感資料加密存儲
- [ ] 加密密鑰管理
- [ ] 加密演算法安全 (AES-256)
---
## 會話管理
### Session 安全
- [ ] Session ID 隨機生成
- [ ] Session 固定時間
- [ ] Session 數據加密
- [ ] Session 清除機制
### Cookie 安全
- [ ] Cookie HttpOnly 標記
- [ ] Cookie Secure 標記
- [ ] Cookie SameSite 屬性
- [ ] Cookie 過期時間合理
---
## 檔案上傳
### 文件類型限制
- [ ] 白名單文件類型
- [ ] 文件大小限制
- [ ] 文件名安全處理
- [ ] 避免路徑遍歷
### 惡意文件防護
- [ ] 文件內容掃描
- [ ] 檔案魔數檪查
- [ ] 上傳目錄權限控制
---
## API 安全
### 速率限制
- [ ] API 請求頻率限制
- [ ] IP 白名單/黑名單
- [ ] 用戶級別限制
### 錯誤處理
- [ ] 不洩漏敏感資訊
- [ ] 錯誤訊息通用
- [ ] 適當的 HTTP 狀態碼
---
## 依賴安全
### 依賴掃描
- [ ] 使用 npm audit / pip-audit / yarn audit
- [ ] 修復已知漏洞
- [ ] 定期更新依賴
### 依賴版本
- [ ] 固定依賴版本
- [ ] 避免使用過時依賴
- [ ] 監控依賴更新
---
## 檢查清單總結
- [ ] 所有檢查項目完成
- [ ] 漏洞已修復
- [ ] 安全配置已更新
- [ ] 文檔已更新
- [ ] 團隊已培訓
