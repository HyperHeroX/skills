# Deployment Cloud Guide (雲端部署指南)

> 本文件為 `deployment-guide.md` 的進階章節，涵蓋 AWS ECS 部署。
>
> **前置閱讀**: `deployment-guide.md` (基礎部署流程)

---

## ☁️ AWS ECS 部署流程

### ECS 架構

```
User → ALB → Target Group → ECS Tasks (3) → ECR
                         ↓
                   RDS + ElastiCache
                         ↓
                   CloudWatch Logs
```

### 核心資源 (Terraform)

1. **ECS Cluster**: 容器運行環境
2. **Task Definition**: Container 規格 (CPU, Memory, Image)
3. **ECS Service**: 服務管理 (Desired Count, Load Balancer)
4. **ALB**: 流量分配與健康檢查
5. **Auto Scaling**: 根據 CPU 自動擴展 (3-10 Tasks)

### 部署命令

```bash
# 1. Build & Push to ECR
docker build -t $REPO:$TAG .
docker push $ECR_URI:$TAG

# 2. Update ECS Service
aws ecs update-service \
  --cluster hyperherox-cluster \
  --service api-service \
  --force-new-deployment

# 3. Wait for stable
aws ecs wait services-stable --cluster $CLUSTER --services $SERVICE
```

---

## 🔄 零停機部署策略

| 策略 | 停機 | 回滾速度 | 成本 | 用途 |
|------|------|---------|------|------|
| Rolling Update | ✅ 無 | ⚠️ 慢 | 💰 低 | Stage |
| Blue-Green | ✅ 無 | ✅ 快 | 💰💰 高 | Production |
| Canary | ✅ 無 | ✅ 快 | 💰 中 | 高風險 |

### Rolling Update 配置

```hcl
deployment_configuration {
  maximum_percent         = 200  # 最多雙倍 Tasks
  minimum_healthy_percent = 100  # 至少保持 100%
  deployment_circuit_breaker {
    enable   = true
    rollback = true  # 失敗自動回滾
  }
}
```

---

## 🔙 回滾策略

| 方法 | 時間 | 適用場景 |
|------|------|---------|
| Docker Tag Rollback | 1-2 min | Container 錯誤 |
| Task Definition Rollback | 1 min | ECS 配置錯誤 |
| Blue-Green Switch | 10 sec | 緊急回滾 |
| DB Migration Rollback | 視資料量 | Schema 變更 |

### ECS 回滾命令

```bash
# 回滾至前一個版本
PREV_REVISION=$((CURRENT - 1))
aws ecs update-service \
  --cluster $CLUSTER \
  --service $SERVICE \
  --task-definition $FAMILY:$PREV_REVISION
```

---

## 📊 部署監控

### 關鍵指標

| 指標 | 目標 | 警告 |
|------|------|------|
| Deployment Success Rate | > 95% | < 90% |
| Deployment Duration | < 5 min | > 10 min |
| Health Check Success | 100% | < 95% |
| MTTR | < 5 min | > 10 min |

### CloudWatch Alarms

- ECS Task 失敗告警
- Deployment 失敗告警
- Health Check 失敗告警

---

## 🧪 Smoke Test

### 部署後檢查清單

1. **Health Check**: `/health` 端點
2. **API 可用性**: 關鍵 API 回應
3. **DB 連線**: 資料庫連線正常
4. **Redis 連線**: 快取服務正常
5. **Authentication**: 登入流程正常

```bash
curl -f $URL/health || exit 1
curl -f $URL/api/health/db || exit 1
curl -f $URL/api/health/redis || exit 1
```

---

## 📚 參考資料

- [deployment-guide.md](./deployment-guide.md) - 基礎部署流程
- [AWS ECS Best Practices](https://docs.aws.amazon.com/AmazonECS/latest/bestpracticesguide/)
- [Blue-Green Deployment](https://martinfowler.com/bliki/BlueGreenDeployment.html)
