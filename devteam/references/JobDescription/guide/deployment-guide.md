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

```mermaid
graph TD
    User[User] --> ALB[Application Load Balancer]
    ALB --> TG[Target Group]
    TG --> ECS1[ECS Task 1]
    TG --> ECS2[ECS Task 2]
    TG --> ECS3[ECS Task 3]
    
    ECS1 --> ECR[Amazon ECR<br/>Docker Registry]
    ECS2 --> ECR
    ECS3 --> ECR
    
    ECS1 --> RDS[(RDS PostgreSQL)]
    ECS2 --> RDS
    ECS3 --> RDS
    
    ECS1 --> ElastiCache[(ElastiCache Redis)]
    ECS2 --> ElastiCache
    ECS3 --> ElastiCache
    
    CloudWatch[CloudWatch Logs] -.-> ECS1
    CloudWatch -.-> ECS2
    CloudWatch -.-> ECS3
```

### 1. ECS Cluster 建立 (Terraform)

```hcl
# infrastructure/terraform/ecs.tf

# ECS Cluster
resource "aws_ecs_cluster" "main" {
  name = "hyperherox-cluster"
  
  setting {
    name  = "containerInsights"
    value = "enabled"
  }
}

# ECS Task Definition
resource "aws_ecs_task_definition" "api" {
  family                   = "api-task"
  network_mode             = "awsvpc"
  requires_compatibilities = ["FARGATE"]
  cpu                      = "512"    # 0.5 vCPU
  memory                   = "1024"   # 1 GB
  execution_role_arn       = aws_iam_role.ecs_task_execution.arn
  task_role_arn            = aws_iam_role.ecs_task.arn
  
  container_definitions = jsonencode([
    {
      name      = "api"
      image     = "${aws_ecr_repository.api.repository_url}:latest"
      cpu       = 512
      memory    = 1024
      essential = true
      
      portMappings = [
        {
          containerPort = 3000
          hostPort      = 3000
          protocol      = "tcp"
        }
      ]
      
      environment = [
        { name = "NODE_ENV", value = "production" },
        { name = "PORT", value = "3000" }
      ]
      
      secrets = [
        {
          name      = "DATABASE_URL"
          valueFrom = "${aws_secretsmanager_secret.database.arn}:DATABASE_URL::"
        },
        {
          name      = "JWT_SECRET"
          valueFrom = "${aws_secretsmanager_secret.jwt.arn}:JWT_SECRET::"
        }
      ]
      
      logConfiguration = {
        logDriver = "awslogs"
        options = {
          "awslogs-group"         = "/ecs/api"
          "awslogs-region"        = "ap-northeast-1"
          "awslogs-stream-prefix" = "api"
        }
      }
      
      healthCheck = {
        command     = ["CMD-SHELL", "curl -f http://localhost:3000/health || exit 1"]
        interval    = 30
        timeout     = 5
        retries     = 3
        startPeriod = 60
      }
    }
  ])
}

# ECS Service
resource "aws_ecs_service" "api" {
  name            = "api-service"
  cluster         = aws_ecs_cluster.main.id
  task_definition = aws_ecs_task_definition.api.arn
  desired_count   = 3  # 3 個 Task (高可用性)
  launch_type     = "FARGATE"
  
  network_configuration {
    subnets          = aws_subnet.private[*].id
    security_groups  = [aws_security_group.ecs_tasks.id]
    assign_public_ip = false
  }
  
  load_balancer {
    target_group_arn = aws_lb_target_group.api.arn
    container_name   = "api"
    container_port   = 3000
  }
  
  deployment_configuration {
    maximum_percent         = 200
    minimum_healthy_percent = 100
    deployment_circuit_breaker {
      enable   = true
      rollback = true
    }
  }
  
  health_check_grace_period_seconds = 60
}

# Application Load Balancer
resource "aws_lb" "main" {
  name               = "hyperherox-alb"
  internal           = false
  load_balancer_type = "application"
  security_groups    = [aws_security_group.alb.id]
  subnets            = aws_subnet.public[*].id
  
  enable_deletion_protection = true
  enable_http2              = true
  
  tags = {
    Name = "HyperHeroX ALB"
  }
}

# ALB Target Group
resource "aws_lb_target_group" "api" {
  name        = "api-tg"
  port        = 3000
  protocol    = "HTTP"
  vpc_id      = aws_vpc.main.id
  target_type = "ip"
  
  health_check {
    enabled             = true
    healthy_threshold   = 2
    unhealthy_threshold = 3
    timeout             = 5
    interval            = 30
    path                = "/health"
    matcher             = "200"
  }
  
  deregistration_delay = 30
}

# ALB Listener (HTTPS)
resource "aws_lb_listener" "https" {
  load_balancer_arn = aws_lb.main.arn
  port              = "443"
  protocol          = "HTTPS"
  ssl_policy        = "ELBSecurityPolicy-TLS13-1-2-2021-06"  # TLS 1.3
  certificate_arn   = aws_acm_certificate.main.arn
  
  default_action {
    type             = "forward"
    target_group_arn = aws_lb_target_group.api.arn
  }
}

# ALB Listener (HTTP → HTTPS Redirect)
resource "aws_lb_listener" "http" {
  load_balancer_arn = aws_lb.main.arn
  port              = "80"
  protocol          = "HTTP"
  
  default_action {
    type = "redirect"
    redirect {
      port        = "443"
      protocol    = "HTTPS"
      status_code = "HTTP_301"
    }
  }
}

# Auto Scaling (依據 CPU 使用率)
resource "aws_appautoscaling_target" "ecs" {
  max_capacity       = 10  # 最多 10 個 Task
  min_capacity       = 3   # 最少 3 個 Task
  resource_id        = "service/${aws_ecs_cluster.main.name}/${aws_ecs_service.api.name}"
  scalable_dimension = "ecs:service:DesiredCount"
  service_namespace  = "ecs"
}

resource "aws_appautoscaling_policy" "cpu" {
  name               = "cpu-autoscaling"
  policy_type        = "TargetTrackingScaling"
  resource_id        = aws_appautoscaling_target.ecs.resource_id
  scalable_dimension = aws_appautoscaling_target.ecs.scalable_dimension
  service_namespace  = aws_appautoscaling_target.ecs.service_namespace
  
  target_tracking_scaling_policy_configuration {
    predefined_metric_specification {
      predefined_metric_type = "ECSServiceAverageCPUUtilization"
    }
    target_value = 70.0  # CPU 70% 時觸發 Auto Scaling
  }
}
```

### 2. ECS 部署命令 (ECS Deploy Commands)

```bash
#!/bin/bash
# ecs-deploy.sh - ECS 部署腳本

set -e

# 環境變數
AWS_REGION="ap-northeast-1"
CLUSTER_NAME="hyperherox-cluster"
SERVICE_NAME="api-service"
ECR_REPOSITORY="hyperherox-api"
IMAGE_TAG=$(git rev-parse --short HEAD)

# 1. 建立 ECR Repository (首次)
aws ecr create-repository \
  --repository-name $ECR_REPOSITORY \
  --region $AWS_REGION \
  --image-scanning-configuration scanOnPush=true \
  --encryption-configuration encryptionType=AES256 || echo "Repository already exists"

# 2. 登入 ECR
aws ecr get-login-password --region $AWS_REGION | \
  docker login --username AWS --password-stdin \
  $(aws ecr describe-repositories --repository-names $ECR_REPOSITORY --region $AWS_REGION --query 'repositories[0].repositoryUri' --output text | cut -d'/' -f1)

# 3. Build Docker Image
docker build -t $ECR_REPOSITORY:$IMAGE_TAG .
docker tag $ECR_REPOSITORY:$IMAGE_TAG \
  $(aws ecr describe-repositories --repository-names $ECR_REPOSITORY --region $AWS_REGION --query 'repositories[0].repositoryUri' --output text):$IMAGE_TAG
docker tag $ECR_REPOSITORY:$IMAGE_TAG \
  $(aws ecr describe-repositories --repository-names $ECR_REPOSITORY --region $AWS_REGION --query 'repositories[0].repositoryUri' --output text):latest

# 4. Push to ECR
docker push $(aws ecr describe-repositories --repository-names $ECR_REPOSITORY --region $AWS_REGION --query 'repositories[0].repositoryUri' --output text):$IMAGE_TAG
docker push $(aws ecr describe-repositories --repository-names $ECR_REPOSITORY --region $AWS_REGION --query 'repositories[0].repositoryUri' --output text):latest

# 5. 更新 ECS Service (Rolling Update)
aws ecs update-service \
  --cluster $CLUSTER_NAME \
  --service $SERVICE_NAME \
  --force-new-deployment \
  --region $AWS_REGION

# 6. 等待部署完成
echo "⏳ 等待 ECS 部署完成..."
aws ecs wait services-stable \
  --cluster $CLUSTER_NAME \
  --services $SERVICE_NAME \
  --region $AWS_REGION

echo "✅ ECS 部署完成"
```

### 3. 藍綠部署 (Blue-Green Deployment)

```bash
#!/bin/bash
# blue-green-deploy.sh - 藍綠部署腳本

# 環境變數
CLUSTER_NAME="hyperherox-cluster"
SERVICE_NAME="api-service"
BLUE_TG_ARN="arn:aws:elasticloadbalancing:ap-northeast-1:xxx:targetgroup/api-blue/xxx"
GREEN_TG_ARN="arn:aws:elasticloadbalancing:ap-northeast-1:xxx:targetgroup/api-green/xxx"
LISTENER_ARN="arn:aws:elasticloadbalancing:ap-northeast-1:xxx:listener/app/hyperherox-alb/xxx/xxx"

# 1. 獲取當前 Target Group (藍色環境)
CURRENT_TG=$(aws elbv2 describe-listeners --listener-arns $LISTENER_ARN \
  --query 'Listeners[0].DefaultActions[0].TargetGroupArn' --output text)

# 2. 確定新 Target Group (綠色環境)
if [ "$CURRENT_TG" = "$BLUE_TG_ARN" ]; then
  NEW_TG=$GREEN_TG_ARN
  NEW_COLOR="GREEN"
else
  NEW_TG=$BLUE_TG_ARN
  NEW_COLOR="BLUE"
fi

echo "🔵 當前環境: $([ "$CURRENT_TG" = "$BLUE_TG_ARN" ] && echo "BLUE" || echo "GREEN")"
echo "🟢 新環境: $NEW_COLOR"

# 3. 更新 ECS Service 至新 Target Group
aws ecs update-service \
  --cluster $CLUSTER_NAME \
  --service $SERVICE_NAME \
  --load-balancers "targetGroupArn=$NEW_TG,containerName=api,containerPort=3000" \
  --force-new-deployment

# 4. 等待新環境健康檢查通過
echo "⏳ 等待新環境啟動並通過健康檢查..."
while true; do
  HEALTHY_COUNT=$(aws elbv2 describe-target-health --target-group-arn $NEW_TG \
    --query 'length(TargetHealthDescriptions[?TargetHealth.State==`healthy`])' --output text)
  
  if [ "$HEALTHY_COUNT" -ge 3 ]; then
    echo "✅ 新環境健康檢查通過 ($HEALTHY_COUNT 個健康 Task)"
    break
  fi
  
  echo "⏳ 健康 Task 數量: $HEALTHY_COUNT/3, 等待 30 秒..."
  sleep 30
done

# 5. 切換 ALB Listener 至新 Target Group
echo "🔀 切換流量至新環境..."
aws elbv2 modify-listener \
  --listener-arn $LISTENER_ARN \
  --default-actions "Type=forward,TargetGroupArn=$NEW_TG"

# 6. 驗證新環境
echo "🧪 驗證新環境..."
sleep 10
curl -f https://bot.iexam.win/health || {
  echo "❌ 新環境驗證失敗, 回滾至舊環境"
  aws elbv2 modify-listener \
    --listener-arn $LISTENER_ARN \
    --default-actions "Type=forward,TargetGroupArn=$CURRENT_TG"
  exit 1
}

echo "✅ 藍綠部署完成"
```

---

## 🔄 零停機部署策略 (Zero Downtime Deployment)

### 部署策略比較 (Deployment Strategy Comparison)

| 策略 | 原理 | 停機時間 | 回滾速度 | 資源成本 | 適用場景 | 採用? |
|------|------|---------|---------|---------|---------|------|
| **Rolling Update** | 逐步替換舊 Task | ✅ 零停機 | ⚠️ 慢 (需重新部署) | 💰 低 (無額外資源) | 一般部署 | ✅ **Stage** |
| **Blue-Green** | 雙環境, 流量切換 | ✅ 零停機 | ✅ 快 (切換 ALB Listener) | 💰💰 高 (雙倍資源) | 生產環境 | ✅ **Production** |
| **Canary** | 逐步放量 (10% → 50% → 100%) | ✅ 零停機 | ✅ 快 (切換流量比例) | 💰 中 (部分額外資源) | 高風險部署 | ⚠️ 可選 |
| **Recreate** | 停止舊版 → 啟動新版 | ❌ 有停機 (1-5 min) | ✅ 快 (重新啟動) | 💰 低 | 非生產環境 | ❌ |

#### 決策 (Decision)
- ✅ **Stage 環境**: Rolling Update (Railway 預設)
- ✅ **Production 環境**: Blue-Green Deployment (AWS ECS + ALB)
- ⚠️ **高風險部署**: Canary Deployment (可選, 使用 AWS App Mesh)

### Rolling Update 配置 (ECS Service)

```hcl
# Rolling Update 配置 (Terraform)
deployment_configuration {
  maximum_percent         = 200  # 最多 200% Task (3 → 6 個)
  minimum_healthy_percent = 100  # 最少 100% 健康 Task (至少 3 個)
  
  deployment_circuit_breaker {
    enable   = true   # 啟用 Circuit Breaker
    rollback = true   # 失敗自動回滾
  }
}
```

**Rolling Update 流程**:
1. 啟動 3 個新 Task (總共 6 個 Task)
2. 等待新 Task 健康檢查通過
3. 停止 3 個舊 Task (剩下 3 個新 Task)
4. ✅ 部署完成

---

## 🔙 回滾策略 (Rollback Strategy)

### 快速回滾方法 (Quick Rollback Methods)

| 方法 | 回滾時間 | 操作複雜度 | 資料完整性 | 適用場景 |
|------|---------|-----------|-----------|---------|
| **Git Revert + Redeploy** | ⚠️ 慢 (5-10 min) | 簡單 | ✅ 保證 | Code 層級錯誤 |
| **Docker Image Tag Rollback** | ✅ 快 (1-2 min) | 簡單 | ✅ 保證 | Container 層級錯誤 |
| **ECS Task Definition Rollback** | ✅ 快 (1 min) | 簡單 | ✅ 保證 | ECS 配置錯誤 |
| **Blue-Green Traffic Switch** | ✅ 超快 (10 sec) | 中等 | ✅ 保證 | 生產環境緊急回滾 |
| **Database Migration Rollback** | ⚠️ 慢 (視資料量) | 複雜 | ⚠️ 可能遺失資料 | Database Schema 變更 |

### 1. ECS Task Definition 回滾

```bash
#!/bin/bash
# ecs-rollback.sh - ECS 回滾腳本

CLUSTER_NAME="hyperherox-cluster"
SERVICE_NAME="api-service"

# 獲取當前 Task Definition
CURRENT_TASK_DEF=$(aws ecs describe-services \
  --cluster $CLUSTER_NAME \
  --services $SERVICE_NAME \
  --query 'services[0].taskDefinition' --output text)

echo "當前 Task Definition: $CURRENT_TASK_DEF"

# 獲取前一個 Task Definition (假設為 api-task:N-1)
TASK_FAMILY=$(echo $CURRENT_TASK_DEF | cut -d':' -f6 | cut -d'/' -f2 | cut -d':' -f1)
CURRENT_REVISION=$(echo $CURRENT_TASK_DEF | cut -d':' -f7)
PREVIOUS_REVISION=$((CURRENT_REVISION - 1))

PREVIOUS_TASK_DEF="$TASK_FAMILY:$PREVIOUS_REVISION"

echo "回滾至: $PREVIOUS_TASK_DEF"

# 更新 ECS Service 至前一個 Task Definition
aws ecs update-service \
  --cluster $CLUSTER_NAME \
  --service $SERVICE_NAME \
  --task-definition $PREVIOUS_TASK_DEF \
  --force-new-deployment

echo "✅ 回滾完成"
```

### 2. Database Migration 回滾

```bash
#!/bin/bash
# db-migration-rollback.sh - 資料庫遷移回滾

# 使用 TypeORM Migration
npm run migration:revert

# 或使用 Prisma Migration
npx prisma migrate rollback

# 或使用 Liquibase Rollback
liquibase rollback --tag=v1.0.0
```

---

## 📊 部署監控 (Deployment Monitoring)

### 關鍵指標 (Key Metrics)

| 指標 | 目標值 | 警告閾值 | 危險閾值 | 監控工具 |
|------|-------|---------|---------|---------|
| **Deployment Success Rate** | > 95% | < 90% | < 80% | GitHub Actions, CloudWatch |
| **Deployment Duration** | < 5 min | > 10 min | > 15 min | CloudWatch Logs Insights |
| **Health Check Success Rate** | 100% | < 95% | < 90% | ALB Target Health |
| **Rollback Frequency** | < 5% | > 10% | > 20% | CloudWatch Alarms |
| **Mean Time to Recovery (MTTR)** | < 5 min | > 10 min | > 15 min | Datadog |

### CloudWatch Alarms

```hcl
# CloudWatch Alarm - ECS Task 失敗
resource "aws_cloudwatch_metric_alarm" "ecs_task_failed" {
  alarm_name          = "ECS-Task-Failed"
  comparison_operator = "GreaterThanThreshold"
  evaluation_periods  = "1"
  metric_name         = "TaskCount"
  namespace           = "ECS/ContainerInsights"
  period              = "60"
  statistic           = "Sum"
  threshold           = "1"
  alarm_description   = "ECS Task 失敗超過 1 次"
  alarm_actions       = [aws_sns_topic.alerts.arn]
  
  dimensions = {
    ClusterName = aws_ecs_cluster.main.name
    ServiceName = aws_ecs_service.api.name
  }
}

# CloudWatch Alarm - Deployment 失敗
resource "aws_cloudwatch_metric_alarm" "deployment_failed" {
  alarm_name          = "Deployment-Failed"
  comparison_operator = "GreaterThanThreshold"
  evaluation_periods  = "1"
  metric_name         = "FailedDeployments"
  namespace           = "AWS/ECS"
  period              = "60"
  statistic           = "Sum"
  threshold           = "1"
  alarm_description   = "部署失敗超過 1 次"
  alarm_actions       = [aws_sns_topic.alerts.arn]
}
```

---

## 🧪 Smoke Test (冒煙測試)

### Smoke Test 檢查清單

```bash
#!/bin/bash
# smoke-test.sh - 部署後冒煙測試

PROD_URL="https://bot.iexam.win"

echo "🧪 執行 Smoke Test..."

# 1. Health Check
echo "1. Health Check"
curl -f $PROD_URL/health || { echo "❌ Health Check 失敗"; exit 1; }

# 2. API 可用性檢查
echo "2. API 可用性檢查"
curl -f $PROD_URL/api/products || { echo "❌ Products API 失敗"; exit 1; }

# 3. Database 連線檢查
echo "3. Database 連線檢查"
curl -f $PROD_URL/api/health/db || { echo "❌ Database 連線失敗"; exit 1; }

# 4. Redis 連線檢查
echo "4. Redis 連線檢查"
curl -f $PROD_URL/api/health/redis || { echo "❌ Redis 連線失敗"; exit 1; }

# 5. Authentication 檢查
echo "5. Authentication 檢查"
TOKEN=$(curl -s -X POST $PROD_URL/api/auth/login \
  -H "Content-Type: application/json" \
  -d '{"email":"test@example.com","password":"test123"}' | jq -r '.accessToken')

if [ -z "$TOKEN" ] || [ "$TOKEN" = "null" ]; then
  echo "❌ Authentication 失敗"
  exit 1
fi

# 6. 關鍵業務流程檢查 (查詢商品)
echo "6. 關鍵業務流程檢查"
curl -f -H "Authorization: Bearer $TOKEN" $PROD_URL/api/products/1 || {
  echo "❌ 商品查詢失敗"
  exit 1
}

echo "✅ Smoke Test 全部通過"
```

---

## 📚 參考資料 (References)

### 內部文檔
- [tech-stack.md](./tech-stack.md) - 技術棧規範
- [architecture.md](./architecture.md) - 系統架構規範
- [security-guidelines.md](./security-guidelines.md) - 安全指南
- [AGENTS.md](../../AGENTS.md) - AI Agent 開發規範 (Section 7: 分支與部署流程)
- [env.md](../../docs/Environment/env.md) - 環境變數與測試站點

### 外部資源
- [AWS ECS Best Practices](https://docs.aws.amazon.com/AmazonECS/latest/bestpracticesguide/)
- [Railway Documentation](https://docs.railway.app/)
- [GitHub Actions Documentation](https://docs.github.com/en/actions)
- [Docker Best Practices](https://docs.docker.com/develop/dev-best-practices/)
- [Terraform AWS Provider](https://registry.terraform.io/providers/hashicorp/aws/latest/docs)
- [Blue-Green Deployment Pattern](https://martinfowler.com/bliki/BlueGreenDeployment.html)

---

## 📝 版本歷史 (Version History)

| 版本 | 日期 | 變更內容 | 作者 |
|------|------|---------|------|
| 1.0 | 2026-01-31 | 初始版本：Railway + AWS ECS 部署流程完整實作 | HyperHeroX Team |

---

## ✅ 總結 (Conclusion)

本文檔定義了完整的部署流程規範，涵蓋：
- ✅ **Railway Stage 部署** (快速迭代測試, 依據 AGENTS.md Section 7.4 檢查流程)
- ✅ **AWS ECS Production 部署** (高可用性, Auto Scaling, Blue-Green Deployment)
- ✅ **GitHub Actions CI/CD** (自動化測試 + 部署 + 回滾)
- ✅ **環境管理** (Dev/Stage/Prod 環境變數, AWS Secrets Manager)
- ✅ **零停機部署** (Rolling Update, Blue-Green Deployment)
- ✅ **快速回滾** (ECS Task Definition Rollback, Database Migration Rollback)
- ✅ **部署監控** (CloudWatch Alarms, Smoke Test)

所有部署操作必須嚴格遵循本規範，確保：
- ✅ **自動化優先** (GitHub Actions + Railway Auto Deploy + AWS CodePipeline)
- ✅ **零停機部署** (Rolling Update + Blue-Green Deployment)
- ✅ **快速回滾** (< 5 min MTTR)
- ✅ **安全優先** (HTTPS only, Secret Management, Security Scan)

**Compliance Status**:
- ✅ AGENTS.md Section 7 (分支與部署流程)
- ✅ Railway 部署檢查流程 (3 min 等待 + 10 次重試)
- ✅ Security Guidelines (HTTPS, Secret Management, IAM)
