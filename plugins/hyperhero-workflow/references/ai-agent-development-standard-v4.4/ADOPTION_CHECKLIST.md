# v4.4 導入檢查表

- [ ] 來源需求基線已設為 Protected File。
- [ ] 57 項 Requirement 全部存在於 Policy 與 State。
- [ ] 無 `deferred/disabled/not-applicable/optional/capability-ready` 需求狀態。
- [ ] 所有來源明示條件保留原文，沒有新增條件。
- [ ] L0–L6 只設定成熟度，不取消需求。
- [ ] Requirement Conformance Agent 與 Schema 已加入 CI。
- [ ] Frontend 17 項、Management 6 項與版本規則逐條有測試。
- [ ] Builder 與 Reviewer／Scanner／Conformance 分離。
- [ ] Baseline Digest、Revision、Review、Scan、Test、Artifact 一致。


## 通用開發與前端基準

- [ ] 所有 Agent 固定載入兩份 General Profile。
- [ ] 沒有把 Linux、C#、.NET 或特定框架設成組織通用採用條件。
- [ ] UI／Client 變更自動載入 Frontend Development Profile。
- [ ] 前端 Review／Test／Scan 路由不依特定框架名稱。
- [ ] UI-REQ-001～017 對應完整 FED 基準與證據。
