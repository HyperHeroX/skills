# 平行繪圖代理的任務說明範本

配圖超過約 15 張時，把任務清單切成每份 10–15 張，交給多個代理平行畫。每個代理只拿到這份說明，
所以要把資料位置、工具、規範、交付格式寫完整。把 `<…>` 換成實際值後使用。

---

# 任務：依原始資料畫面，量身重繪簡報配圖（PowerPoint 相容 SVG）

你是資訊設計師。每張圖都要**對應原始資料中的配圖**來設計，不可沿用同一種版型。你負責：<key 清單或範圍>。

## 資料
- 任務清單：`<tasks.json>`。每筆有 `key`、`title`、`lead`、`bullets`、`t0`/`t1`（對應影片時間）或 `page`（對應原投影片頁）、
  `kind`（diagram＝要畫；bullets＝原本沒圖）、畫布 `side_w/side_h` 與 `full_w/full_h`。
- 看原始畫面：`python3 <skill>/scripts/extract_frames.py <影片> <t0> <t1>`，用 Read 看 `sheet.jpg`（需要細節看單張）。
- 繪圖元件：`<skill>/scripts/svgkit.py`（先讀一遍）。
- 規範：`<skill>/references/ppt-safe-svg.md`、`design-tokens.md`、`form-catalog.md`（先讀）。
- 範例：`<skill>/examples/*.py`。

## 每張要做的事
1. `kind=diagram`：看原始畫面 → **沿用原圖的結構**（同心圓就畫同心圓、時序就畫生命線…），文字改成繁體中文（術語保留英文），
   內容以 `bullets`/`lead` 為準，**不可加入筆記裡沒有的事實**。原畫面只有文字時，依內容關係從 form-catalog 選形式，不可又是一排同樣的卡片。
2. `kind=bullets`：只有原畫面那段**真的有圖**時才畫；只是文字就跳過。
3. 寫 `<src>/<key>.py`，最後呼叫 `save(key, svg(W, H, b, alt=...), layout="side"|"full", caption="看圖重點一句話（≤40字）")`。
   side：寬 = `side_w`、高 ≤ `side_h`；full：寬 = `full_w`、高 ≤ `full_h`。
4. 跑 `python3 <skill>/scripts/check_svg.py <out>/<key>.svg --max-height <h>`，**用 Read 看 PNG 預覽**，
   修到沒有：文字重疊、文字壓線、文字超出圖框或畫布、箭頭指錯、留白失衡。

## 硬性規範
- 只用 svgkit 的基本圖形；禁止 filter、marker、gradient、url(#…)、currentColor、<style>、<image>。
- 類別色 C[0]…C[5] 依固定順序；淡底用同索引 TINT；結構用 NAVY；長文字用 INK/BODY。
- 字級 ≥ 22px；圖內不放大標題；只有順序內容才編號；圖示只在幫助辨識時用。

## 交付
每個 key 一行：「key｜原圖形式 → 新圖形式｜layout」；另列跳過的 key 與原因（一句）。不要改任務清單或別人的檔案。
