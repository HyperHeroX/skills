# 工具鏈分層對照表

> AI 在 Phase 2/3/4 依此表決定每條指引「先用哪一套工具掃」。

| 層 | 涵蓋指引 | 自動化程度 | 主要工具 |
|----|----------|------------|----------|
| **靜態** | 1.1.1, 1.3.1-2, 1.3.4-5, 1.4.1, 2.4.2, 2.4.4, 2.5.3, 3.1.1, 3.1.4, 3.3.2, 4.1.1 | 100% script | scan_vue.js, scan_react.mjs, contrast.py（SCSS）, framework-hazards grep |
| **運行** | 1.4.2, 1.4.3 (computed), 1.4.10-13, 2.1.1-3, 2.1.4 (測試 shortcut), 2.2.1-6, 2.3.x, 2.4.1, 2.4.3, 2.4.7, 2.4.10-13, 2.5.1-2, 2.5.4-5, 3.2.x, 3.3.1, 3.3.3-9, 4.1.2-3 | 70% script + 30% AI 復核 | run_axe.js, Playwright MCP, Chrome DevTools MCP |
| **手動** | 1.2.x, 1.3.3, 1.4.4-5, 1.4.8-9, 1.4.6（大量段落需人工確認）, 2.1.4 (重對應流程), 2.5.6, 3.1.2-6 | 0% script，AI 引導 + 人工驗收 | references/method-by-guideline.md 對應段落 |

## 降級策略

若 Browser MCP 不可用：
- Phase 3 運行檢測自動降級為「標記 needs_human」+ AI 給出靜態能推論的結論
- 報告產出時 Phase 3 條目顯示 ⚠ 而非 ✅/❌

## 跨層覆核

部分條目兩層都跑（例：1.4.3 對比值靜態 SCSS 算 + 運行 axe 量 computed），結果合併規則：
- 兩層都 pass → pass
- 任一層 fail → fail（在 issue 註明哪一層發現）
- 一層 pass 一層 needs_human → needs_human
