# AI Provider／Model／Agent Integration Profile v4.4

本 Profile 實作 `AI-REQ-001～004`。

- 從 `https://llmgateway.io/models` 建立本機模型／供應商目錄並定期更新，保存同步時間、差異與失敗狀態。
- Provider 設定包含 OpenAI Compatible、併發頻率、費用、文字／視覺／嵌入等適用範圍。
- 模型可調參數在 Provider 設定中指定；需要細微調整的 LLM 功能提供自己的可調參數。
- 有 Tool-calling Agent 時提供 SKILLS、MCP、Plugin、Connector 功能與管理頁。
- 安全補強：Secret Reference、Tool JSON Schema、最小權限、Tenant、Side Effect、確認、Timeout、Budget、Audit、Prompt Injection 與 Kill Switch。
