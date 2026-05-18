# 13 指引每條檢測方法 SOP

> 每條按「靜態 → 運行 → 手動」三層提供具體方法。
> AI 執行時對每頁皆按此 SOP 過一輪，把結果寫入 state.json。

---

## 指引 1.1 — 替代文字

### 1.1.1 非文字內容（A）

| 工具層 | 方法 |
|--------|------|
| **靜態** | `scan_static.py` 呼叫 `scan_vue.js` / `scan_react.mjs` 找 `<img>` 無 alt、`<input type=image>`、`<area>`、`<svg>` 無 `<title>`。動態繫結 alt（`:alt`）也要解析；裝飾圖（`<a>` `<button>` 內含相鄰文字但 `alt!=""`）見 framework-hazards C04。 |
| **運行** | axe-core 規則：`image-alt`、`input-image-alt`、`area-alt`、`role-img-alt`、`svg-img-alt` |
| **手動** | AI 對每張 flag 圖逐張用 Read 看上下文：(a) 裝飾性？→ alt="" (b) 提供資訊？→ 完整描述 (c) 可操作？→ 描述目的 (d) CAPTCHA？→ 描述目的 + 提供替代驗證 |

---

## 指引 1.2 — 時序媒體

### 1.2.1 純音訊與純視訊（A）／1.2.2 字幕（A）／1.2.3 音訊描述（A）／1.2.4 字幕現場直播（AA）／1.2.5 音訊描述預錄（AA）／AAA 條目

| 工具層 | 方法 |
|--------|------|
| **靜態** | grep `<video>` `<audio>` 統計頁面有無時序媒體；自動標 `needs_human` |
| **運行** | — |
| **手動** | 開啟頁面確認 transcript / captions / audio description / sign language（依等級）|

---

## 指引 1.3 — 可調適

### 1.3.1 資訊與關連性（A）

| 工具層 | 方法 |
|--------|------|
| **靜態** | grep `<table>` 無 `<th>`、`<form>` 無 `<label>`、heading 跳級（h1→h3）、list 不用 `<ul>/<ol>` |
| **運行** | axe-core 規則：`label`、`form-field-multiple-labels`、`heading-order`、`landmark-*` |
| **手動** | 確認語意分組、`fieldset/legend` 用法 |

### 1.3.2 有意義的序列（A）

| 工具層 | 方法 |
|--------|------|
| **靜態** | grep `position:absolute`、`float`、`flex.*order`，標記為需檢查 DOM 順序 vs 視覺順序 |
| **運行** | Browser MCP：CSS off 後讀內容順序是否合理 |
| **手動** | 視覺對照 |

### 1.3.3 知覺特徵（A）／1.3.4 螢幕方向（AA）／1.3.5 識別輸入目的（AA）／1.3.6 識別目的（AAA）

| 工具層 | 方法 |
|--------|------|
| **靜態** | 1.3.4 找 `orientation: portrait\|landscape` 鎖定；1.3.5 找 `<input>` 無 `autocomplete`；1.3.6 找 ARIA landmarks |
| **運行** | Browser MCP：嘗試橫直旋轉 |
| **手動** | 1.3.3 確認指示不單靠形狀/位置/聲音 |

---

## 指引 1.4 — 可辨識

### 1.4.1 色彩使用（A）

| 工具層 | 方法 |
|--------|------|
| **靜態** | grep 連結僅靠色彩區分（無 underline）、錯誤訊息僅靠紅字 |
| **運行** | — |
| **手動** | 視覺確認 |

### 1.4.2 音訊控制（A）

| 工具層 | 方法 |
|--------|------|
| **靜態** | grep `<audio.*autoplay`、`<video.*autoplay` 但無 `controls` |
| **運行** | Browser MCP：載入頁面，> 3s 內無暫停按鈕 → flag |
| **手動** | — |

### 1.4.3 對比值（最小，AA）

| 工具層 | 方法 |
|--------|------|
| **靜態** | `contrast.py scan_scss_file()` 解析 SCSS 變數 / `lighten()` / `darken()` / PrimeVue token，列出所有 background+color 配對及對比值。閾值：一般 4.5、大字 3 |
| **運行** | axe-core 規則：`color-contrast`；Browser MCP 量 computed style 確認動態 background 也合規 |
| **手動** | 大尺寸字、停用元件、商標文字等例外條目人工判讀 |

### 1.4.4 調整文字尺寸（AA）

| 工具層 | 方法 |
|--------|------|
| **靜態** | grep `font-size: \d+px` 而非 `rem/em` |
| **運行** | Browser MCP：縮放 200%，確認內容/功能不消失 |
| **手動** | — |

### 1.4.5 影像文字（AA）／1.4.6 對比值增強（AAA）／1.4.8 視覺呈現（AAA）／1.4.9 影像文字無例外（AAA）

| 工具層 | 方法 |
|--------|------|
| **靜態** | 1.4.6 contrast.py 改閾值 7.0 / 4.5 |
| **運行** | axe-core `color-contrast-enhanced` |
| **手動** | 1.4.5/9 確認可改文字呈現；1.4.8 段寬、行距、對齊判讀 |

### 1.4.10 流動排版（AA）／1.4.11 非文字對比（AA）／1.4.12 文字間距（AA）／1.4.13 懸浮焦點內容（AA）

| 工具層 | 方法 |
|--------|------|
| **靜態** | 1.4.11 contrast.py 套用於 button border、icon；1.4.12 grep `letter-spacing` `line-height` |
| **運行** | 1.4.10 Browser MCP 寬 320px 確認無 2D 捲動；1.4.13 Browser MCP 開啟 tooltip 後 hover 移開測試 dismissable / hoverable / persistent |
| **手動** | — |

---

## 指引 2.1 — 鍵盤可操作

### 2.1.1 鍵盤（A）

| 工具層 | 方法 |
|--------|------|
| **靜態** | grep 互動元件（onClick）但無 keydown handler |
| **運行** | Browser MCP：Tab 走訪所有可見互動元件，每個都能用 Enter / Space 觸發 |
| **手動** | 用實體鍵盤完整走訪確認 |

### 2.1.2 無鍵盤操作陷阱（A）

| 工具層 | 方法 |
|--------|------|
| **靜態** | grep `tabindex="-1"` 在可見可互動容器、`<Dialog :closeOnEscape="false">`、modal 元件無 focus restoration（framework-hazards V01/R02/P05） |
| **運行** | Browser MCP：開頁面 → Tab 走完所有可聚焦元件 → 進入 modal/dropdown → 確認能 Tab 出 / Esc 關閉 |
| **手動** | 用實體鍵盤完整走訪確認 |

### 2.1.4 快捷鍵（A）

| 工具層 | 方法 |
|--------|------|
| **靜態** | grep `addEventListener('keydown'` 處理單字母 |
| **運行** | Browser MCP：嘗試在輸入欄位輸入單字母快捷鍵衝突 |
| **手動** | 確認可關閉 / 重對應 / 僅在焦點啟動 |

---

## 指引 2.2 — 充足時間

### 2.2.1 計時調整（A）／2.2.2 暫停停止隱藏（A）／AAA 條目（2.2.3-6）

| 工具層 | 方法 |
|--------|------|
| **靜態** | grep `setTimeout` `setInterval`、`<marquee>`、輪播元件 |
| **運行** | Browser MCP：等待 5s 觀察 auto-update / animation 是否可暫停 |
| **手動** | 確認時限可調整 / 警告 / 延長 |

---

## 指引 2.3 — 預防痙攣

### 2.3.1 閃爍三次或低於閾值（A）／2.3.2 三次閃爍（AAA）／2.3.3 動畫互動（AAA）

| 工具層 | 方法 |
|--------|------|
| **靜態** | grep CSS `animation` 高頻 keyframes、GIF 統計 |
| **運行** | Browser MCP 紀錄 1s 內 frame 變化 |
| **手動** | 視覺確認；2.3.3 確認 `prefers-reduced-motion` 支援 |

---

## 指引 2.4 — 可導覽

### 2.4.1 跳過區塊（A）

| 工具層 | 方法 |
|--------|------|
| **靜態** | 找頁面第一個可聚焦元素是否為 `href="#main-content"` skip-link；確認對應 anchor 存在且 `tabindex="-1"` |
| **運行** | Browser MCP：頁面載入後第一個 Tab 焦點落點 + Enter 後實際焦點位置驗證 |
| **手動** | — |

### 2.4.2 網頁標題（A）

| 工具層 | 方法 |
|--------|------|
| **靜態** | grep `<title>`，確認非空、不重複、非「prefix - default」格式 |
| **運行** | axe-core `document-title` |
| **手動** | 各頁標題符合內容 |

### 2.4.3 焦點順序（A）

| 工具層 | 方法 |
|--------|------|
| **靜態** | grep `tabindex` 正值（破壞自然順序）|
| **運行** | Browser MCP：Tab 走訪 → 順序與 DOM/視覺一致 |
| **手動** | — |

### 2.4.4 鏈結目的脈絡（A）

| 工具層 | 方法 |
|--------|------|
| **靜態** | grep 連結文字「點此」「more」「here」 |
| **運行** | axe-core `link-name` |
| **手動** | 確認連結文字脫離脈絡也清楚 |

### 2.4.5 多種方式（AA）

| 工具層 | 方法 |
|--------|------|
| **靜態** | 確認站台有 sitemap、search、breadcrumb 至少 2 種 |
| **運行** | — |
| **手動** | 確認 sitemap 可鍵盤遊走全部項目（GN1240500E）|

### 2.4.6 標題和標籤（AA）

| 工具層 | 方法 |
|--------|------|
| **靜態** | heading 順序 + form `<label>` 完整性 |
| **運行** | axe-core `heading-order` `label` |
| **手動** | — |

### 2.4.7 焦點可視（AA）

| 工具層 | 方法 |
|--------|------|
| **靜態** | grep `outline:\s*none` 但同檔案無 `:focus-visible` 補上 |
| **運行** | axe-core `focus-visible`；Browser MCP Tab 走訪確認每個焦點可見 |
| **手動** | — |

### 2.4.8 位置（AAA）／2.4.9 鏈結目的純鏈結（AAA）／2.4.10-13 等

| 工具層 | 方法 |
|--------|------|
| **靜態** | 2.4.10 heading 結構；2.4.11/12/13 焦點不被 sticky header 遮蔽 |
| **運行** | Browser MCP：滾動時確認焦點位置可見 |
| **手動** | 2.4.8 breadcrumb / 當前位置標記 |

---

## 指引 2.5 — 輸入方式

### 2.5.1 指標手勢（A）／2.5.2 指標取消（A）／2.5.3 標籤名稱（A）／2.5.4 動作啟動（A）／2.5.5 目標尺寸（AAA）

| 工具層 | 方法 |
|--------|------|
| **靜態** | 2.5.3 visible label 文字應包含於 accessible name；2.5.5 grep button 大小 < 44×44 |
| **運行** | Browser MCP：嘗試手勢、上下移動取消觸發 |
| **手動** | 2.5.4 確認搖動觸發功能可關 |

---

## 指引 3.1 — 可讀性

### 3.1.1 網頁語言（A）

| 工具層 | 方法 |
|--------|------|
| **靜態** | grep `<html lang=`；應為 `zh-Hant-TW` 或 `zh-Hant`（GN1310100E） |
| **運行** | axe-core `html-has-lang` `html-lang-valid` |
| **手動** | — |

### 3.1.2 局部語言（AA）／3.1.3-6（AAA）

| 工具層 | 方法 |
|--------|------|
| **靜態** | 3.1.4 grep `<abbr>`；3.1.2 grep 外語片語應有 `lang=` |
| **運行** | — |
| **手動** | 3.1.3 不常見字詞、3.1.5 閱讀程度、3.1.6 發音判讀 |

---

## 指引 3.2 — 可預期性

### 3.2.1 焦點（A）／3.2.2 輸入（A）／3.2.3 一致導覽（AA）／3.2.4 一致識別（AA）／3.2.5-6（AAA）

| 工具層 | 方法 |
|--------|------|
| **靜態** | 3.2.4 確認同功能元件用同樣 class / aria |
| **運行** | Browser MCP：focus 元件不應自動跳轉；select 變更不應自動 submit |
| **手動** | 3.2.3 比對多頁 nav 是否相同順序 |

---

## 指引 3.3 — 輸入協助

### 3.3.1 識別錯誤（A）

| 工具層 | 方法 |
|--------|------|
| **靜態** | grep `aria-invalid`、`aria-describedby` 配對 |
| **運行** | Browser MCP：故意填錯送出，確認錯誤訊息文字+位置 |
| **手動** | — |

### 3.3.2 標籤或說明（A）

| 工具層 | 方法 |
|--------|------|
| **靜態** | grep `<input>` 無對應 `<label>`、必填欄位無「必填」文字（GN1330201E）|
| **運行** | axe-core `label` |
| **手動** | — |

### 3.3.3 錯誤建議（AA）

| 工具層 | 方法 |
|--------|------|
| **靜態** | 找錯誤訊息範本是否含建議 |
| **運行** | Browser MCP：故意填錯送出，確認焦點跳到第一個錯誤欄位（GN2330300E）|
| **手動** | — |

### 3.3.4 錯誤預防（AA）／3.3.5-9（AAA）

| 工具層 | 方法 |
|--------|------|
| **靜態** | 找 confirm dialog、preview/review 步驟 |
| **運行** | Browser MCP：嘗試送出後是否能反悔 |
| **手動** | — |

---

## 指引 4.1 — 相容性

### 4.1.1 語法分析（A）

| 工具層 | 方法 |
|--------|------|
| **靜態** | grep duplicate id、unclosed tags |
| **運行** | axe-core `duplicate-id`、`duplicate-id-active` |
| **手動** | — |

### 4.1.2 名稱角色和值（A）

| 工具層 | 方法 |
|--------|------|
| **靜態** | grep `<div role="button">` 無 keydown、wrapper 元件未 forward $attrs |
| **運行** | axe-core `aria-*` 系列規則 |
| **手動** | screen reader 走訪確認 |

### 4.1.3 狀態訊息（AA）

| 工具層 | 方法 |
|--------|------|
| **靜態** | grep `aria-live`、`role="status"`、`role="alert"` 用法 |
| **運行** | axe-core `aria-roledescription`；Browser MCP 觸發狀態變更，確認 SR 宣告 |
| **手動** | screen reader 確認 |

---

## 執行順序對照（與 tool-tier-mapping.md 連動）

按工具鏈分層執行 → 同層內按指引編號順序：

```
Phase 2 靜態：1.1.1 → 1.3.1 → 1.3.2 → 2.4.2 → 2.4.4 → 2.5.3 → 3.1.1 → 3.3.2 → 4.1.1 → 1.4.3 (SCSS) → 1.3.4 → 1.3.5
Phase 3 運行：1.4.2 → 2.1.1 → 2.1.2 → 2.2.x → 2.3.x → 2.4.1 → 2.4.3 → 2.4.7 → 2.5.x → 3.2.x → 3.3.1 → 3.3.3 → 4.1.2 → 4.1.3 → 1.4.3 (axe color-contrast 復測) → 1.4.10
Phase 4 手動：1.2.x → 1.3.3 → 1.4.1 → 1.4.4 → 1.4.5 → 1.4.8/9 → 2.1.4 → 3.1.x（AAA 含 reading level）
```
