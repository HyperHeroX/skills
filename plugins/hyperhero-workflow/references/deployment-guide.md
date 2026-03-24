# 容器化部署指南

> **適用範圍**: 通用容器化部署流程  
> **容器引擎**: Docker 24+ / Podman 4.8+

---

## 快速開始

### 1. 建置映像檔
```bash
# Docker
docker-compose build

# Podman
podman-compose build
```

### 2. 啟動服務
```bash
# Docker
docker-compose up -d

# Podman
podman-compose up -d
```
### 3. 檢查狀態
```bash
# Docker
docker-compose ps
docker ps
# Podman
podman-compose ps
podman ps
```
### 4. 查看日誌
```bash
# Docker
docker-compose logs -f [service-name]
# Podman
podman-compose logs -f [service-name]
```
---
## Dockerfile 最佳實踐
### 前端 Dockerfile (多階段構建)
```dockerfile
# Build stage
FROM node:20-alpine AS builder
WORKDIR /app
COPY package*.json ./
RUN npm ci
COPY . .
RUN npm run build

# Production stage
FROM nginx:alpine
COPY --from=builder /app/dist /usr/share/nginx/html
COPY nginx.conf /etc/nginx/conf.d/default.conf
EXPOSE 80
CMD ["nginx", "-g", "daemon off;"]
```
### 後端 Dockerfile
```dockerfile
# Build stage
FROM node:20-alpine AS builder
WORKDIR /app
COPY package*.json ./
RUN npm ci
COPY . .
RUN npm run build

# Production stage
FROM node:20-alpine
WORKDIR /app
COPY --from=builder /app/dist ./dist
COPY --from=builder /app/node_modules ./node_modules
EXPOSE 3000
CMD ["node", "dist/index.js"]
```
### Python Dockerfile
```dockerfile
FROM python:3.11-slim
WORKDIR /app
COPY requirements.txt .
RUN pip install --no-cache-dir -r requirements.txt
COPY . .
EXPOSE 8000
CMD ["uvicorn", "main:app", "--host", "0.0.0.0", "--port", "8000"]
```
### Go Dockerfile
```dockerfile
FROM golang:1.21-alpine AS builder
WORKDIR /app
COPY go.mod go.sum ./
RUN go mod download
COPY . .
RUN CGO_ENABLED=0 go build -o main .

FROM alpine:latest
WORKDIR /app
COPY --from=builder /app/main .
EXPOSE 8080
CMD ["./main"]
```
---
## Docker Compose 配置
### 基礎配置模板
```yaml
version: '3.8'

services:
  frontend:
    build: ./frontend
    ports:
      - "3000:3000"
    environment:
      - API_URL=http://api:8000
    depends_on:
      - api

  api:
    build: ./api
    ports:
      - "8000:8000"
    environment:
      - DATABASE_URL=postgresql://user:pass@db:5432/db
      - JWT_SECRET=${JWT_SECRET}
    depends_on:
      - db

  db:
    image: postgres:15-alpine
    environment:
      - POSTGRES_DB=db
      - POSTGRES_USER=user
      - POSTGRES_PASSWORD=${DB_PASSWORD}
    volumes:
      - db_data:/var/lib/postgresql/data
    ports:
      - "5432:5432"

volumes:
  db_data:

networks:
  default:
```
### 生產環境配置
```yaml
version: '3.8'

services:
  nginx:
    image: nginx:alpine
    ports:
      - "80:80"
      - "443:443"
    volumes:
      - ./nginx/nginx.conf:/etc/nginx/nginx.conf
      - ./nginx/ssl:/etc/nginx/ssl
    depends_on:
      - frontend
      - api

  frontend:
    build: ./frontend
    environment:
      - NODE_ENV=production
    networks:
      - backend

  api:
    build: ./api
    environment:
      - NODE_ENV=production
      - DATABASE_URL=${DATABASE_URL}
    networks:
      - backend
    depends_on:
      - db

  db:
    image: postgres:15-alpine
    environment:
      - POSTGRES_DB=${DB_NAME}
      - POSTGRES_USER=${DB_USER}
      - POSTGRES_PASSWORD=${DB_PASSWORD}
    volumes:
      - db_data:/var/lib/postgresql/data
    networks:
      - backend

networks:
  backend:
    driver: bridge

volumes:
  db_data:
```
---
## 環境變數管理
### .env 文件
```bash
# Database
DB_NAME=app_db
DB_USER=app_user
DB_PASSWORD=secure_password
DATABASE_URL=postgresql://app_user:secure_password@db:5432/app_db

# JWT
JWT_SECRET=your-super-secret-jwt-key-at-least-32-characters
# API Keys
API_KEY=your-api-key
# Environment
NODE_ENV=production
```
### 環境變數注入
```yaml
services:
  api:
    environment:
      - DATABASE_URL=${DATABASE_URL}
      - JWT_SECRET=${JWT_SECRET}
```
---
## 匁續整合/部署
### 健康檢查
```yaml
healthcheck:
  test: ["CMD", "curl", "-f", "http://localhost/health"]
  interval: 30s
  timeout: 10s
  retries: 3
```
### 自動重啟
```yaml
restart: unless-stopped
```
### 資源限制
```yaml
deploy:
  resources:
    limits:
      cpus: '1'
      memory: 512M
    reservations:
      cpus: '0.5'
      memory: 256M
```
---
## 資料庫管理
### 范圍遷移
```bash
# 執行 Migration
docker exec api-container npx prisma migrate deploy

# Podman
podman exec api-container npx prisma migrate deploy
```
### 資料庫備份
```bash
# Docker
docker exec db-container pg_dump -U user dbname > backup.sql
# Podman
podman exec db-container pg_dump -U user dbname > backup.sql
```
### 資料庫還原
```bash
# Docker
cat backup.sql | docker exec -i db-container psql -U user dbname
# Podman
cat backup.sql | podman exec -i db-container psql -U user dbname
```
---
## 監控與日誌
### 容器日誌
```bash
# 查看所有服務日誌
docker-compose logs
# 查看特定服務日誌
docker-compose logs -f api
# 實時日誌
docker-compose logs -f --tail=100 api
```
### 資源監控
```bash
# 容器資源使用
docker stats
# 系統資源
docker system df
```
---
## 安全性配置
### 網絡隔離
```yaml
networks:
  frontend:
    driver: bridge
  backend:
    driver: bridge
    internal: true
```
### 只讀檔案系統
```yaml
volumes:
  app_data:
    driver: local
  db_data:
    driver: local
  config_data:
    driver: local
    read_only: true
```
### SSL/TLS 配置
```yaml
services:
  nginx:
    volumes:
      - ./ssl/cert.pem:/etc/nginx/ssl/cert.pem:ro
      - ./ssl/key.pem:/etc/nginx/ssl/key.pem:ro
```
---
## 故障排除
### 容器無法啟動
```bash
# 查看容器日誌
docker-compose logs api
# 檢查容器狀態
docker inspect api-container
# 進入容器調試
docker exec -it api-container sh
```
### 網絡問題
```bash
# 檢查網絡
docker network ls
docker network inspect network_name
# 測試連接
docker exec api-container ping db-container
```
### 資料庫連接問題
```bash
# 檢查資料庫日誌
docker-compose logs db
# 測試連接
docker exec api-container nc -zv db 5432
```
---
## 相關文件
- [test-examples.md](test-examples.md) - E2E 測試範例
- [acceptance-checklist.md](acceptance-checklist.md) - 釉收檢查清單
