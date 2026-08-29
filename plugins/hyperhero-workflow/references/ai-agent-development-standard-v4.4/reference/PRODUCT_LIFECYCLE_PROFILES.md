# 產品生命週期與必備需求成熟度

本文件將產品階段與需求完成深度分開。所有產品負責人必備需求從 L0 起就存在；階段只決定其最低成熟度。

| 階段 | 成熟度 | 主要焦點 | 不可發生 |
|---|---|---|---|
| L0 MVP | specified | 全量登錄、規格、風險、驗收；核心切片安全實作 | 把未做需求刪除、降級或標 N/A |
| L1 正式專案 | implemented | 全部無條件與已觸發條件需求完成實作 | 用 Extension Point 取代明定完整功能 |
| L2 內部測試 | verified | 全量 Test／Review／Scan／Conformance | Scanner Error 當通過、Builder 自審取代獨立驗證 |
| L3 試營運 | operational | 受控真實流程、監控、稽核、支援、回復 | 用 Feature Flag 隱藏缺失後宣稱完成 |
| L4 正式上市 | operational | 100% 需求追蹤與正式 Artifact 證據 | 未核准語意偏離或未審需求 |
| L5 維護 | maintained | 回歸、CVE、相容、效能、漂移與 EOL | 以 Hotfix 為由永久降低要求 |
| L6 退役 | retired | 資料、金鑰、權限、資源、Job、Plugin、介面處置 | 留下孤兒資料、Credential、Endpoint 或責任 |

Runtime `feature_state`（例如管理者關閉多租戶）與 Requirement `status`（例如已實作並驗證）必須分開記錄。
