# PowerPoint 相容 SVG 規則

PowerPoint（Microsoft 365 / 2019+）把插入的 SVG 轉成自己的向量形狀，只支援 SVG 的一個子集。
不支援的元素**不會報錯，而是靜默消失**：線框不見、色塊沒有底色、箭頭沒有尖端、文字變黑。
這些問題在瀏覽器或 rsvg 預覽裡都看不出來，所以要從語法上預防，並用 `check_svg.py` 把關。

## 禁用（會在 PowerPoint 消失或變形）

| 禁用 | 症狀 | 替代做法 |
|---|---|---|
| `filter`（drop-shadow、blur） | 整個元素或陰影消失 | 陰影 = 向下位移 3–5px、`fill-opacity="0.10"` 的深色同形狀（`box(shadow=True)`） |
| `marker` / `marker-end` | 箭頭沒有尖端 | 尖端畫成 `<polygon>`（`head()`、`arrow()`、`elbow()`、`curve_arrow()`） |
| `linearGradient` / `radialGradient` / `url(#…)` | 填色變黑或透明 | 純色；層次用 `TINT` 淡底＋`C` 主色框線 |
| `currentColor` | 線條或填色變黑 | 寫死色碼（`icon()` 會把 Lucide 圖示的 currentColor 換掉） |
| `<style>` / class 選擇器 | 樣式全部失效 | 屬性直接寫在元素上（`fill=`、`stroke=`、`font-size=`） |
| `<image>`（內嵌點陣圖） | 不顯示或位置錯 | 用向量重畫；真要照片就在 PPT 另外放圖 |
| `<use>` / `<symbol>` | 參照的內容消失 | 直接展開成元素 |
| `mask` / `clip-path` | 被忽略，內容溢出 | 用形狀本身控制範圍；文字壓線時用 `knockout()` 白底 |
| `<foreignObject>` / `<animate>` | 消失 | 不使用 |
| CSS 變數、`em`/`%` 字級 | 字級錯亂 | `font-size` 一律用 px 數字 |

## 可以用

`<rect rx>`、`<circle>`、`<ellipse>`、`<line>`、`<polygon>`、`<path>`（M/L/Q/C/A/Z）、`<text>`（x、y、font-size、font-weight、fill、text-anchor）、
`<g transform="translate() scale()">`、`stroke-dasharray`、`fill-opacity`、`stroke-linecap/linejoin`、`<title>`（成為替代文字）。

## 文字

- 根節點設定 `font-family`（微軟正黑體 → Noto Sans CJK TC → PingFang TC），PowerPoint 會用使用者電腦上的字型。
- **一個 `<text>` 一行**；不要用 `<tspan>` 自動換行或 `textLength`。換行由 `wrap()` / `fit()` 事先算好。
- `y` 是基線；svgkit 的 `label()/text()` 用「文字框頂端」當 y，內部換算成基線（頂端 + 0.88em）。
- 文字寬度用 `tw()` 估算（中文 1em、英文大寫/數字 0.62em、小寫 0.53em），留 10% 餘裕。
- 文字放在線條或弧線上時，先畫 `knockout()` 白底再畫字，避免線條穿過文字。

## 尺寸與比例

- 1 in = 144 px。LAYOUT_WIDE 投影片 13.333 × 7.5 in。
- 放進 PPT 時用 `寬 = px / 144` 吋原尺寸放入，**不要再縮放**，字級才會和設計時一致（22px ≈ 11pt）。
- 右側配圖寬 1048 px（7.28 in），全寬配圖寬 1747 px（12.13 in）；高度依版面剩餘空間決定。

## PNG 備援

pptxgenjs 寫入 SVG 時會附一張 PNG 備援（給舊版 Office、LibreOffice、縮圖用）。在 Node 環境這張 PNG 是壞的，
一定要跑 `fix_png_fallback.py` 用 rsvg-convert 從 SVG 重新算圖替換，否則 LibreOffice 檢查時會看到空白圖，也無法做視覺 QA。
