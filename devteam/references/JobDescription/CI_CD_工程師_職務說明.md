# CI/CD 工程師職務說明書 (CI/CD Engineer Job Description)

## 1. 職位概述
CI/CD 工程師負責設計、實施和維護持續整合與持續部署（CI/CD）流程，確保軟體交付的高效性、穩定性與安全性。此職位專注於自動化構建、測試發布流程，並管理容器化環境與雲端部署服務。

## 2. 核心職責 (Core Responsibilities)
- **CI/CD 流水線管理**: 設計與維護 GitHub Actions Workflow，實現自動化構建、測試與部署。
- **容器化技術**: 使用 Docker 與 Podman 進行應用程式的容器化封裝，編寫與優化 Dockerfile。
- **雲端部署管理**: 負責 Railway 等 PaaS 平台的服務部署、環境變數設定與監控。
- **環境一致性**: 確保開發 (Development)、測試 (Stage) 與生產 (Production) 環境的一致性。
- **部署策略**: 實施 Blue-Green 或 Rolling Update 等部署策略，降低發布風險。

## 3. 技術要求 (Technical Skills)
- **版本控制**: 精通 Git 與 GitHub Flow，熟悉 Branch Protection Rules 設定。
- **CI/CD 工具**: 精通 GitHub Actions (編寫 YAML, 使用 Actions, 設定 Secrets)。
- **容器技術**:
  - 精通 **Docker** (Image Build, Multi-stage Build, Docker Compose)。
  - 熟悉 **Podman** (Rootless containers, Pods 管理)。
- **雲端平台**:
  - 精通 **Railway** (Service 設定, Volume 掛載, Domain 綁定, TCP/HTTP Proxy)。
  - 熟悉 Railway CLI 操作。

## 4. 工作產出 (Deliverables)
- **CI/CD 設定檔**: `.github/workflows/*.yml`。
- **容器設定**: `Dockerfile`, `docker-compose.yml`, Podman 相關腳本。
- **部署文件**: 部署操作手冊、環境變數清單 (不含敏感受值)、故障排除指南。
- **部署日誌**: 部署驗證報告與狀態追蹤。

## 5. 協作流程
- 與 **Dev Lead** 配合，確定發布時程與版本規範。
- 與 **QA 工程師** 配合，確保自動化測試整合至 CI 流程中。
- 與 **後端/前端工程師** 配合，優化構建速度與容器映像檔大小。
