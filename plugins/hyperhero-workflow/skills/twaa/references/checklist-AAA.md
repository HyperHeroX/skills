# WCAG 2.1 AAA 等級額外檢測項

> AAA 級在 AA 之上，主要是更嚴格的對比值、更深的可讀性、更精細的鍵盤與計時控制。
> 多數條目主觀性較高，需人工驗證。

| ID | 名稱 | 屬性 | 備註 |
|----|------|------|------|
| 1.2.6 | 手語（預錄） | manual | |
| 1.2.7 | 延伸音訊描述（預錄） | manual | |
| 1.2.8 | 媒體替代（預錄） | manual | |
| 1.2.9 | 純音訊（現場直播） | manual | |
| 1.3.6 | 識別目的 | static | ARIA landmarks 完整性 |
| 1.4.6 | 對比值（增強） | axe + static | 一般文字 ≥ 7:1，大文字 ≥ 4.5:1 |
| 1.4.8 | 視覺呈現 | static + manual | 段落寬度、行距、對齊等 |
| 1.4.9 | 影像文字（無例外） | manual | |
| 2.1.3 | 鍵盤（無例外） | runtime | |
| 2.2.3 | 無計時 | runtime | |
| 2.2.4 | 中斷 | runtime | |
| 2.2.5 | 重新驗證 | runtime + manual | |
| 2.2.6 | 逾時 | static | |
| 2.3.2 | 三次閃爍 | runtime | |
| 2.3.3 | 動畫互動 | static | prefers-reduced-motion 支援 |
| 2.4.8 | 位置 | static + manual | breadcrumb / current location |
| 2.4.9 | 鏈結目的（純鏈結） | static | 脫離脈絡也清楚 |
| 2.4.10 | 區段標頭 | static + axe | h1-h6 結構完整 |
| 2.4.11 | 焦點不被遮蔽（最小） | runtime | |
| 2.4.12 | 焦點不被遮蔽（增強） | runtime | |
| 2.4.13 | 焦點外觀 | runtime | 焦點 outline 大小與對比 |
| 2.5.5 | 目標尺寸（增強） | static + manual | ≥ 44×44 CSS px |
| 2.5.6 | 並用輸入機制 | manual | |
| 3.1.3 | 不常見字詞 | manual | |
| 3.1.4 | 縮寫 | static | `<abbr>` 標籤 |
| 3.1.5 | 閱讀程度 | manual | 需 Lower Secondary 等級 |
| 3.1.6 | 發音 | manual | |
| 3.2.5 | 依要求變更 | runtime | |
| 3.2.6 | 一致的求救 | static + manual | |
| 3.3.5 | 說明 | manual | 表單 placeholder/help 完整 |
| 3.3.6 | 錯誤預防（全部） | runtime + manual | |
| 3.3.7 | 重複輸入 | manual | autofill |
| 3.3.8 | 認證可訪問（最小） | manual | |
| 3.3.9 | 認證可訪問（增強） | manual | |
