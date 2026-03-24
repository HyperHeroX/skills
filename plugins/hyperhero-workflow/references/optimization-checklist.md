# 效能優化檢查清單
> **目標**: 確保應用程序符合效能標準

---

## 前端效能

### Lighthouse 分數
- [ ] Performance ≥ 90
- [ ] Accessibility ≥ 95
- [ ] Best Practices ≥ 95
- [ ] SEO ≥ 90

### Core Web Vitals
- [ ] LCP (Largest Contentful Paint) < 2.5s
- [ ] FID (First Input Delay) < 100ms
- [ ] CLS (Cumulative Layout Shift) < 0.1

### 打包優化
- [ ] Bundle size 合理 (< 500KB gzipped)
- [ ] Code splitting 實作
- [ ] Tree shaking 正確
- [ ] Lazy loading 重要組件

### 圖片優化
- [ ] 圖片壓縮
- [ ] 使用現代格式 (WebP/AVIF)
- [ ] 響應式圖片 (srcset)
- [ ] Lazy loading 圖片

### CSS 優化
- [ ] Critical CSS inline
- [ ] Unused CSS 移除
- [ ] CSS minification
- [ ] 使用原子化 CSS

### JavaScript 優化
- [ ] Minification
- [ ] Uglification
- [ ] Tree shaking
- [ ] Dead code elimination

---
## 後端效能

### API 回應時間
- [ ] 平均回應時間 < 200ms
- [ ] P95 < 500ms
- [ ] P99 < 1000ms

### 資料庫查詢
- [ ] N+1 查詢排查
- [ ] 索引優化
- [ ] 查詢計畫分析
- [ ] 連接池配置

### 快取策略
- [ ] Redis 快取實作
- [ ] HTTP 快取標頭
- [ ] Query 結果快取
- [ ] CDN 使用

### 並發處理
- [ ] 適當的連接池大小
- [ ] 非阻塞 I/O
- [ ] 負載平衡配置
- [ ] Rate limiting

---
## 網絡效能

### HTTP/2
- [ ] HTTP/2 啟用
- [ ] Server Push
- [ ] Header Compression

### CDN 配置
- [ ] 靜態資源 CDN
- [ ] Edge caching
- [ ] Geographic distribution

### Gzip/Brotli
- [ ] Gzip 壓縮啟用
- [ ] Brotli 壓縮 (更好)
- [ ] 壓縮級別優化

---
## 資源優化

### CPU 使用
- [ ] CPU 使用率監控
- [ ] 熱點分析
- [ ] 優化 CPU 密集操作

### 內存使用
- [ ] 內存洩漏檢查
- [ ] Heap size 優化
- [ ] Garbage collection 調優

### 磁盤 I/O
- [ ] 讀寫優化
- [ ] 緩衝區配置
- [ ] SSD 使用

---
## 監控與分析

### 效能監控
- [ ] APM 工具安裝 (New Relic/Datadog)
- [ ] 實時監控儀表板
- [ ] 警報配置

### 日誌分析
- [ ] 結構化日誌
- [ ] 日誌聚合
- [ ] 錯誤追蹤

### 用戶體驗監控
- [ ] RUM (Real User Monitoring)
- [ ] Session Replay
- [ ] 用戶行為分析

---
## 優化工具

### 前端
- **Lighthouse**: 效能審計
- **WebPageTest**: 詳細效能分析
- **Bundlephobia**: 打包大小分析

### 後端
- **PM2**: Node.js 進程管理
- **Clinic**: Node.js 效能分析
- **pg_stat_statements**: PostgreSQL 查詢分析

### 資料庫
- **EXPLAIN ANALYZE**: 查詢計畫分析
- **pg_stat_activity**: 資料庫活動監控
- **Index advisor**: 索引建議

