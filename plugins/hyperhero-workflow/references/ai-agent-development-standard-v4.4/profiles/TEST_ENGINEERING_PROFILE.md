# 測試工程 Profile v4.4

本 Profile 實作 `TEST-REQ-001～007`。

- Unit：最小單元。
- Collection／Integration：最小單元執行順序、資料傳遞、呼叫與完整流向。
- Stress：大量請求下吞吐、飽和、錯誤與恢復。
- Benchmark：固定工作負載與環境指紋；硬體／環境異動後重測。
- Concurrency：Race、Deadlock、Ordering、Duplicate、Idempotency、Resource Contention。
- White／Gray／Shallow-black／Black：依可知內部結構、原始碼、架構與憑證程度分別建立計畫與報告；保留「淺黑箱」名稱及專案定義。
- E2E：頁面完成串接後必須建立可在啟動後自動執行的介面測試。

測試由專業代理設計與執行，Builder 自測不構成獨立 Gate。
