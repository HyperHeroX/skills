# 部署流程指南 (Deployment Guide)

> **Version**: 1.0  
> **Last Updated**: 2026-01-31  
> **Maintainer**: HyperHeroX Team  
> **Status**: ✅ Active  
> **Prerequisites**: tech-stack.md, architecture.md, security-guidelines.md

---

## 📋 概述 (Overview)

本文檔定義 HyperHeroX Skills 專案的完整部署流程，涵蓋 Railway、AWS ECS、GitHub Actions CI/CD、環境管理、藍綠部署、滾動部署、災難恢復等。所有部署作業必須遵循本規範。

---

## 🎯 部署原則 (Deployment Principles)

| 原則 | 說明 | 實作方式 |
|------|------|---------|
| **Automation First** | 全自動化部署, 零手動操作 | GitHub Actions, Railway Auto Deploy, AWS CodePipeline |
| **Zero Downtime** | 部署期間服務不中斷 | Blue-Green Deployment, Rolling Update, Health Check |
| **Rollback Ready** | 錯誤發生時快速回滾 | Git Tag, Docker Image Tag, Database Migration Rollback |
| **Environment Parity** | Dev/Stage/Prod 環境一致 | Docker Container, Infrastructure as Code (Terraform) |
| **Security First** | 所有部署遵循 Security Guidelines | HTTPS only, Secret Management, IAM Role, Security Group |

---

## 🏗️ 部署架構 (Deployment Architecture)

### 部署平台選擇 (Deployment Platform Selection)

| 平台 | 環境 | 用途 | 優點 | 缺點 | 採用? |
|------|------|------|------|------|------|
| **Railway** | Stage | 快速測試部署 | ✅ 零配置, 自動部署<br>✅ 快速部署 (~3 min)<br>✅ 內建 Logs | ❌ 功能限制<br>❌ 成本較高 (生產環境) | ✅ **Stage 環境** |
| **AWS ECS** | Production | 生產環境部署 | ✅ 高可用性<br>✅ Auto Scaling<br>✅ 整合 AWS 生態 | ❌ 配置複雜<br>❌ 學習曲線高 | ✅ **Production 環境** |
| **Vercel** | Frontend | 前端專用部署 | ✅ 極快部署 (<1 min)<br>✅ Edge Network (CDN)<br>✅ Preview Deployment | ❌ 後端功能限制<br>❌ Database 連線困難 | ⚠️ **前端可選** |
| **Heroku** | N/A | 通用平台 | ✅ 簡單易用 | ❌ 價格高<br>❌ 效能限制 | ❌ 不採用 |

#### 決策 (Decision)
- ✅ **Stage 環境**: Railway (快速迭代測試)
- ✅ **Production 環境**: AWS ECS Fargate (高可用性, 彈性擴展)
- ⚠️ **Frontend**: 可選 Vercel (Edge CDN, 極速部署) 或 AWS ECS (統一管理)

---

## 🔄 CI/CD 流程 (CI/CD Pipeline)

### GitHub Actions Workflow (完整流程)

```mermaid
graph LR
    A[Git Push] --> B{Branch?}
    B -->|main| C[Production Pipeline]
    B -->|stage| D[Stage Pipeline]
    B -->|feature/*| E[Feature Pipeline]
    
    C --> C1[Run Tests]
    C1 --> C2[Build Docker]
    C2 --> C3[Push to ECR]
    C3 --> C4[Deploy to ECS]
    C4 --> C5[Health Check]
    C5 --> C6[Smoke Test]
    
    D --> D1[Run Tests]
    D1 --> D2[Deploy to Railway]
    D2 --> D3[E2E Test]
    D3 --> D4[Performance Test]
    
    E --> E1[Run Tests]
    E1 --> E2[Code Quality Scan]
```

### GitHub Actions 配置 (.github/workflows/deploy.yml)

```yaml
name: Deploy

on:
  push:
    branches:
      - main          # Production 部署
      - stage         # Stage 部署
      - hiro/addnewfeature  # Stage 部署 (依據 AGENTS.md Section 7.2)

env:
  NODE_VERSION: '20.x'
  DOCKER_REGISTRY: ghcr.io
  AWS_REGION: ap-northeast-1

jobs:
  # ==================== Stage 部署 (Railway) ====================
  deploy-stage:
    name: Deploy to Stage (Railway)
    runs-on: ubuntu-latest
    if: github.ref == 'refs/heads/stage' || github.ref == 'refs/heads/hiro/addnewfeature'
    
    steps:
      - name: Checkout Code
        uses: actions/checkout@v3
      
      - name: Setup Node.js
        uses: actions/setup-node@v3
        with:
          node-version: ${{ env.NODE_VERSION }}
      
      - name: Install Dependencies
        run: npm ci
      
      - name: Run Unit Tests
        run: npm run test:unit
      
      - name: Run Integration Tests
        run: npm run test:integration
      
      - name: Build Application
        run: npm run build
      
      - name: Trigger Railway Deployment
        env:
          RAILWAY_TOKEN: ${{ secrets.RAILWAY_TOKEN }}
        run: |
          # Railway 自動部署會透過 Git Push 觸發, 無需額外操作
          echo "Railway deployment triggered by git push"
      
      - name: Wait for Railway Deployment (依據 AGENTS.md Section 7.4)
        run: |
          echo "Waiting 3 minutes for Railway deployment..."
          sleep 180
      
      - name: Check Railway Deployment Status
        id: check_deployment
        run: |
          # 呼叫 Railway API 檢查部署狀態 (最多重試 10 次)
          MAX_RETRIES=10
          RETRY_COUNT=0
          DEPLOYMENT_COMPLETE=false
          
          while [ $RETRY_COUNT -lt $MAX_RETRIES ]; do
            # 呼叫 Railway API (需替換為實際 API)
            STATUS=$(curl -s -H "Authorization: Bearer ${{ secrets.RAILWAY_TOKEN }}" \
              https://api.railway.app/v1/deployments/latest | jq -r '.status')
            
            if [ "$STATUS" = "SUCCESS" ]; then
              echo "✅ Railway deployment complete"
              DEPLOYMENT_COMPLETE=true
              break
            fi
            
            echo "⏳ Deployment status: $STATUS, waiting 1 minute..."
            sleep 60
            RETRY_COUNT=$((RETRY_COUNT + 1))
          done
          
          if [ "$DEPLOYMENT_COMPLETE" = false ]; then
            echo "❌ Railway deployment failed after 10 retries"
            echo "記錄至 docs/obstacles.md"
            exit 1
          fi
      
      - name: Run E2E Tests (chrome-devtools-mcp)
        env:
          STAGE_URL: https://linebotrag-staging.up.railway.app
        run: |
          # 使用 chrome-devtools-mcp 進行 E2E 測試 (依據 AGENTS.md Section 3.3)
          npm run test:e2e:stage
      
      - name: Notify Success
        if: success()
        run: |
          echo "✅ Stage deployment successful"
          # 可選：發送 Slack/Discord 通知

  # ==================== Production 部署 (AWS ECS) ====================
  deploy-production:
    name: Deploy to Production (AWS ECS)
    runs-on: ubuntu-latest
    if: github.ref == 'refs/heads/main'
    
    steps:
      - name: Checkout Code
        uses: actions/checkout@v3
      
      - name: Setup Node.js
        uses: actions/setup-node@v3
        with:
          node-version: ${{ env.NODE_VERSION }}
      
      - name: Install Dependencies
        run: npm ci
      
      - name: Run Full Test Suite
        run: |
          npm run test:unit
          npm run test:integration
          npm run test:e2e
      
      - name: Build Application
        run: npm run build
      
      - name: Configure AWS Credentials
        uses: aws-actions/configure-aws-credentials@v2
        with:
          aws-access-key-id: ${{ secrets.AWS_ACCESS_KEY_ID }}
          aws-secret-access-key: ${{ secrets.AWS_SECRET_ACCESS_KEY }}
          aws-region: ${{ env.AWS_REGION }}
      
      - name: Login to Amazon ECR
        id: login-ecr
        uses: aws-actions/amazon-ecr-login@v1
      
      - name: Build Docker Image
        env:
          ECR_REGISTRY: ${{ steps.login-ecr.outputs.registry }}
          ECR_REPOSITORY: hyperherox-api
          IMAGE_TAG: ${{ github.sha }}
        run: |
          docker build -t $ECR_REGISTRY/$ECR_REPOSITORY:$IMAGE_TAG .
          docker tag $ECR_REGISTRY/$ECR_REPOSITORY:$IMAGE_TAG $ECR_REGISTRY/$ECR_REPOSITORY:latest
      
      - name: Scan Docker Image (Snyk)
        env:
          SNYK_TOKEN: ${{ secrets.SNYK_TOKEN }}
        run: |
          npm install -g snyk
          snyk container test $ECR_REGISTRY/$ECR_REPOSITORY:$IMAGE_TAG --severity-threshold=high
      
      - name: Push to Amazon ECR
        env:
          ECR_REGISTRY: ${{ steps.login-ecr.outputs.registry }}
          ECR_REPOSITORY: hyperherox-api
          IMAGE_TAG: ${{ github.sha }}
        run: |
          docker push $ECR_REGISTRY/$ECR_REPOSITORY:$IMAGE_TAG
          docker push $ECR_REGISTRY/$ECR_REPOSITORY:latest
      
      - name: Update ECS Task Definition
        run: |
          # 更新 ECS Task Definition (指向新 Docker Image)
          aws ecs register-task-definition \
            --cli-input-json file://ecs-task-definition.json \
            --region ${{ env.AWS_REGION }}
      
      - name: Deploy to ECS (Blue-Green)
        run: |
          # 使用 AWS CodeDeploy 進行藍綠部署
          aws deploy create-deployment \
            --application-name HyperHeroX-API \
            --deployment-group-name production \
            --deployment-config-name CodeDeployDefault.ECSAllAtOnce \
            --region ${{ env.AWS_REGION }}
      
      - name: Wait for Deployment Complete
        run: |
          # 等待 ECS 部署完成 (健康檢查通過)
          aws ecs wait services-stable \
            --cluster hyperherox-cluster \
            --services api-service \
            --region ${{ env.AWS_REGION }}
      
      - name: Run Smoke Tests
        env:
          PROD_URL: https://bot.iexam.win
        run: |
          # 冒煙測試：確保核心功能正常
          curl -f $PROD_URL/health || exit 1
          curl -f $PROD_URL/api/products || exit 1
      
      - name: Notify Success
        if: success()
        run: |
          echo "✅ Production deployment successful"
          # 發送 Slack/Discord 通知

  # ==================== Rollback (回滾) ====================
  rollback:
    name: Rollback Deployment
    runs-on: ubuntu-latest
    if: failure()
    
    steps:
      - name: Rollback ECS Deployment
        run: |
          # 回滾至前一個穩定版本
          aws ecs update-service \
            --cluster hyperherox-cluster \
            --service api-service \
            --task-definition api-task:previous \
            --region ${{ env.AWS_REGION }}
      
      - name: Notify Rollback
        run: |
          echo "⚠️ Deployment failed, rolled back to previous version"
```

---

## 🌍 環境管理 (Environment Management)

### 環境分類 (Environment Classification)

| 環境 | 用途 | 分支 | 部署平台 | 資料庫 | 測試要求 | URL |
|------|------|------|---------|-------|---------|-----|
| **Development** | 本機開發 | feature/* | Localhost | Local PostgreSQL | Unit Tests | http://localhost:3000 |
| **Stage** | 測試環境 | stage, hiro/addnewfeature | Railway | Railway PostgreSQL | Unit + Integration + E2E | https://linebotrag-staging.up.railway.app |
| **Production** | 生產環境 | main | AWS ECS | AWS RDS PostgreSQL | Full Test Suite + Smoke Test | https://bot.iexam.win |

### 環境變數管理 (Environment Variables)

#### .env.example (範本)
```env
# Application
NODE_ENV=production
PORT=3000
APP_NAME=HyperHeroX

# Database (依據 AGENTS.md Section 6, 禁止明文儲存)
DATABASE_URL=postgresql://user:password@host:5432/dbname
REDIS_URL=redis://host:6379

# JWT (依據 AGENTS.md Section 6, Secret ≥ 32 字元)
JWT_SECRET=your-jwt-secret-at-least-32-characters-long-here
JWT_ACCESS_EXPIRY=15m
JWT_REFRESH_EXPIRY=30d

# Payment
STRIPE_API_KEY=sk_live_xxxxx
STRIPE_WEBHOOK_SECRET=whsec_xxxxx

# Email
SENDGRID_API_KEY=SG.xxxxx
EMAIL_FROM=noreply@hyperherox.com

# AWS
AWS_ACCESS_KEY_ID=AKIAXXXXX
AWS_SECRET_ACCESS_KEY=xxxxx
AWS_REGION=ap-northeast-1
AWS_S3_BUCKET=hyperherox-assets

# Monitoring
DATADOG_API_KEY=xxxxx
SENTRY_DSN=https://xxxxx@sentry.io/xxxxx
```

#### GitHub Secrets 管理
```bash
# 新增 GitHub Secrets (避免明文儲存, 依據 AGENTS.md Section 6)
gh secret set DATABASE_URL --body "postgresql://..."
gh secret set JWT_SECRET --body "your-32-char-secret"
gh secret set STRIPE_API_KEY --body "sk_live_xxxxx"
gh secret set AWS_ACCESS_KEY_ID --body "AKIAXXXXX"
gh secret set AWS_SECRET_ACCESS_KEY --body "xxxxx"
gh secret set RAILWAY_TOKEN --body "xxxxx"
gh secret set SNYK_TOKEN --body "xxxxx"
```

#### AWS Secrets Manager (Production)
```bash
# 使用 AWS Secrets Manager 管理敏感資訊
aws secretsmanager create-secret \
  --name hyperherox/production/database \
  --secret-string '{"username":"admin","password":"xxx","host":"xxx.rds.amazonaws.com"}' \
  --region ap-northeast-1

# 從 ECS Task 讀取 Secret
aws ecs describe-task-definition --task-definition api-task \
  --query 'taskDefinition.containerDefinitions[0].secrets'
```

---

## 🚀 Railway 部署流程 (Railway Deployment)

### Railway 專案設定 (Railway Project Setup)

#### 1. Railway CLI 安裝
```bash
# 安裝 Railway CLI
npm install -g @railway/cli

# 登入 Railway
railway login

# 初始化專案
railway init

# 連結至現有專案
railway link
```

#### 2. Railway 環境變數設定
```bash
# 設定環境變數
railway variables set NODE_ENV=production
railway variables set PORT=3000
railway variables set JWT_SECRET=your-32-char-secret
railway variables set DATABASE_URL=postgresql://...

# 查看環境變數
railway variables
```

#### 3. 自動部署配置 (railway.json)
```json
{
  "$schema": "https://railway.app/railway.schema.json",
  "build": {
    "builder": "NIXPACKS",
    "buildCommand": "npm run build"
  },
  "deploy": {
    "startCommand": "npm run start",
    "healthcheckPath": "/health",
    "healthcheckTimeout": 300,
    "restartPolicyType": "ON_FAILURE",
    "restartPolicyMaxRetries": 10
  }
}
```

#### 4. Nixpacks 配置 (nixpacks.toml)
```toml
[phases.setup]
nixPkgs = ["nodejs-20_x"]

[phases.install]
cmds = ["npm ci"]

[phases.build]
cmds = ["npm run build"]

[start]
cmd = "npm run start"
```

### Railway 部署檢查流程 (依據 AGENTS.md Section 7.4)

```bash
#!/bin/bash
# railway-deploy-check.sh - Railway 部署狀態檢查腳本

STAGE_URL="https://linebotrag-staging.up.railway.app"
MAX_RETRIES=10
RETRY_COUNT=0

echo "⏳ 等待 3 分鐘讓 Railway 開始部署..."
sleep 180

while [ $RETRY_COUNT -lt $MAX_RETRIES ]; do
  echo "🔍 檢查部署狀態 (嘗試 $((RETRY_COUNT + 1))/$MAX_RETRIES)..."
  
  # 呼叫 Health Check API
  HTTP_STATUS=$(curl -s -o /dev/null -w "%{http_code}" $STAGE_URL/health)
  
  if [ "$HTTP_STATUS" = "200" ]; then
    echo "✅ Railway 部署完成, 服務正常運行"
    exit 0
  fi
  
  echo "⏳ 服務尚未就緒 (HTTP $HTTP_STATUS), 等待 1 分鐘..."
  sleep 60
  RETRY_COUNT=$((RETRY_COUNT + 1))
done

echo "❌ Railway 部署失敗, 已重試 $MAX_RETRIES 次"
echo "📝 記錄至 docs/obstacles.md"
echo "$(date): Railway 部署失敗 (URL: $STAGE_URL)" >> docs/obstacles.md
exit 1
```

### Railway 常見問題排查 (Railway Troubleshooting)

| 問題 | 原因 | 解決方案 |
|------|------|---------|
| **Build 失敗** | 依賴安裝錯誤, package.json 錯誤 | 檢查 `railway logs`, 修正 package.json |
| **Health Check 失敗** | 啟動時間過長 (>5 min), Port 配置錯誤 | 調整 `healthcheckTimeout`, 確認 `PORT=3000` |
| **環境變數未生效** | Railway Variables 未設定 | 使用 `railway variables set KEY=VALUE` |
| **Database 連線失敗** | DATABASE_URL 錯誤, Network 隔離 | 檢查 Railway PostgreSQL Plugin, 確認連線字串 |
| **記憶體不足 (OOM)** | 記憶體限制 (512MB), 記憶體洩漏 | 升級 Railway Plan, 排查記憶體洩漏 |

---

## ☁️ AWS ECS 部署流程 (AWS ECS Deployment)

### AWS ECS 架構圖 (AWS ECS Architecture)

---

## ☁️ 進階雲端部署

AWS ECS 部署詳細內容請參閱:

- **AWS ECS 部署流程**: [deployment-cloud-guide.md](./deployment-cloud-guide.md#️-aws-ecs-部署流程)
- **零停機部署策略**: [deployment-cloud-guide.md](./deployment-cloud-guide.md#-零停機部署策略)
- **回滾策略**: [deployment-cloud-guide.md](./deployment-cloud-guide.md#-回滾策略)
- **部署監控**: [deployment-cloud-guide.md](./deployment-cloud-guide.md#-部署監控)
- **Smoke Test**: [deployment-cloud-guide.md](./deployment-cloud-guide.md#-smoke-test)

---

## 📚 參考資料

- [tech-stack.md](./tech-stack.md) - 技術棧規範
- [architecture.md](./architecture.md) - 系統架構規範
- [deployment-cloud-guide.md](./deployment-cloud-guide.md) - AWS 雲端部署
- [Railway Documentation](https://docs.railway.app/)
- [GitHub Actions](https://docs.github.com/en/actions)
