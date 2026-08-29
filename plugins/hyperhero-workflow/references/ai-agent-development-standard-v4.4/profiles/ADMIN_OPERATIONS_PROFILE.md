# 管理、狀態、排程、插件、資源與檔案 Profile v4.4

本 Profile 實作 `MGMT-REQ-001～006`。

## SSE 與狀態

所有功能或方法都必須產生 `started/running/blocked/error/aborted/finished` 狀態，經 Observer／Subscriber 模式進入 Event Bus 與 Operation Registry，並由 SSE 供訂閱。使用 AOP、Interceptor、Decorator 或 Code Generation 降低人工遺漏。狀態管理模組及管理頁可搜尋、過濾、查看、取消、重試與稽核。不得記錄敏感參數。

## 排程

所有功能以 Schedule Adapter／Command 進入排程系統；每一項具 Schema、Permission、Tenant、Timezone、Timeout、Retry、Idempotency、Concurrency、Audit 與 UI。所有功能都可排程，不等於允許使用者輸入任意 Shell／SQL。

## Plugin

可插拔模組支援替換、獨立升級、通用 Plugin 規範、上傳、下載、啟用與停用。若專案未要求完整 Plugin Runtime，仍需保留穩定 Extension Contract、Host API 與升級邊界。

## Resource／File／Permission

- 提供目前 CPU、Memory、Disk、Network、Queue、Connection、Job 與錯誤等資源狀況頁。
- 需要上傳檔案時提供完整檔案管理頁；租戶啟用時隔離，所有操作受角色權限。
- 每個頁面功能使用角色與租戶權限控制，UI 與後端共享 Permission ID。
