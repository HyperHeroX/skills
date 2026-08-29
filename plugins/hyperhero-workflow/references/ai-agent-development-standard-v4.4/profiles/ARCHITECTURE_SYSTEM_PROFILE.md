# 架構與系統設計 Profile v4.4

本 Profile 實作 `ARCH-REQ-001～009`，不得把必備架構改成「僅在需要時才有」。

- 多租戶能力預設存在，由管理者開關；軟體隔離為預設，硬體隔離只依來源特別要求。所有跨租戶查探限管理者並加入 RBAC、Step-up、遮蔽與不可竄改 Audit。
- 分析階段完成 Pattern Decision；即時事件顯示使用 Subscriber／Observer。GoF 23 種模式與其安全限制見 `reference/DESIGN_PATTERNS.md`。
- DI／IoC 為首要組合方式；語言無法支援時記錄等價解耦方式。
- Event Bus 統一發布／訂閱與元件解耦；所有事件有 Schema、Version、Tenant、Correlation、Idempotency、Retry、Dead-letter、Audit。
- 所有功能模組化；規範放 `docs`，每個模組記錄責任、契約、權限、事件、錯誤、測試與營運。
- IPC 建立版本化協定、認證、授權、序列化、Timeout、Cancellation 與相容測試。
- 異常保留詳細內部記錄、提供安全簡要訊息，持續維護 `docs/exception-matrix.md`。
- 需要獨立宿主生命週期的陪伴／監測機制使用 Worker Service。
- API 提供 OpenAPI 與授權管理者可實際測試使用的互動頁。
