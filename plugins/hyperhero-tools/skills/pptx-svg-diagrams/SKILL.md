---
name: pptx-svg-diagrams
description: |
  為 PowerPoint 簡報（尤其是由教學影片、課程錄影、原投影片整理出的筆記簡報）量身繪製配圖：
  依原始畫面的圖形結構逐張重繪成 PowerPoint 相容 SVG，統一配色與字級，嵌入 PPTX 並做 PNG 備援修正與視覺 QA。
  **在以下情況使用：**
  - 使用者要「重畫配圖」「統一配圖風格」「流程圖／架構圖放進 PPT」「配圖用 SVG 做再放進 PPT」
  - 使用者抱怨 PPT 裡的 SVG「線框不見」「沒有底色」「箭頭消失」「顏色對比太低」
  - 使用者說配圖「結構都一樣」「要對應原始影片／原投影片的圖」
  - 從影片或文件整理重點筆記投影片，且需要圖解
---

# PPTX SVG 配圖技能

把「看得懂、和原圖結構一致、在 PowerPoint 裡不會壞掉」的配圖放進簡報。
本技能來自一份 39 堂課、366 頁的 CISSP 錄影筆記簡報實作（128 張客製配圖），踩過的坑都寫在規則裡。

## 搭配的技能

- **frontend-design**：決定構圖、層次與克制（一張圖只有一個視覺重點、結構即資訊、不做模板化卡片）。
- **dataviz**：配色依「工作」分配（類別／順序／狀態），並用它的 `validate_palette.js` **實際跑驗證**，不要用眼睛判斷色盲安全。
- **pptx**：用 pptxgenjs 組簡報、`validate.py` 驗證、`soffice.py` 轉 PDF。
開始畫之前先讀這三個技能的 SKILL.md。

## 檔案

| 路徑 | 用途 |
|---|---|
| `scripts/svgkit.py` | 繪圖元件（box、circle、arrow、elbow、curve_arrow、arc、icon、badge、pill、label/text、knockout、wrap/fit、svg、save）與色票常數。單檔、只用標準庫 |
| `scripts/icons.json` | 50 個 Lucide 線條圖示（ISC 授權，見 ICONS_LICENSE.txt），`icon()`/`badge()` 使用 |
| `scripts/check_svg.py` | 檢查禁用語法、最小字級、畫布尺寸、文字出界，並輸出 PNG 預覽 |
| `scripts/extract_frames.py` | 從影片擷取某時間範圍的畫面（去重＋聯絡表），找原圖用 |
| `scripts/embed_pptx.js` | pptxgenjs 參考實作：side／full 版位、`**重點**` 螢光標示、caption、講者備註 |
| `scripts/fix_png_fallback.py` | **必跑**：用 SVG 重算 PNG 備援，並修 pptxgenjs 多 run 段落掉項目符號的 bug |
| `scripts/render_qa.sh` | PPTX → PDF → 頁面圖 → 聯絡表，供目視 QA |
| `references/ppt-safe-svg.md` | PowerPoint 相容 SVG 規則（禁用清單與替代做法） |
| `references/design-tokens.md` | 色票、字級、版面尺寸、重點標示規則 |
| `references/form-catalog.md` | 原圖形式 → 重繪形式對照表 |
| `references/agent-brief-template.md` | 大量配圖時，交給平行繪圖代理的任務說明範本 |
| `examples/*.py` | 三張完整範例：同心弧城堡模型（side）、六站生命週期時間軸（full）、決策流程＋長條（side） |

## 流程

### 1. 盤點任務
列出每張投影片：key、標題、條列、對應的原始位置（影片時間 t0–t1 或原投影片頁碼）、是否需要圖。
存成 `tasks.json`。條列在左、圖在右的版面用 `side`（寬 1048 px），橫向長流程用 `full`（寬 1747 px）；
依投影片剩餘空間算出每張的高度上限（1 in = 144 px）。

### 2. 看原圖，決定形式
- 影片：`python3 scripts/extract_frames.py <影片> <t0> <t1>`，用 Read 看 `sheet.jpg`。
- 文件：把對應頁轉成圖片再看。
- 依 `references/form-catalog.md` **沿用原圖結構**（同心圓 → 同心圓、握手 → 時序生命線、OSI → 疊層…）。
  原圖只有文字時才自行選形式；沒有關係結構就不畫，不要硬做一排卡片。
- 內容以筆記為準，不加入筆記沒有的事實；術語保留英文。

### 3. 畫圖（每張一個 Python 檔）
```python
import sys, os; sys.path.insert(0, "<skill>/scripts"); from svgkit import *
W, H = SIDE_W, 615
b = []
b.append(box(40, 60, 300, 120, fill=TINT[0], stroke=C[0]))
b.append(text(190, 96, "產生", size=30, weight=700, color=C[0], anchor="middle"))
b.append(arrow(340, 120, 420, 120))
save("deck-03", svg(W, H, b, alt="替代文字"), layout="side", caption="看圖重點一句話（≤40字）")
```
- 規則：`references/ppt-safe-svg.md`（硬性）與 `references/design-tokens.md`。
- 類別色 `C[0]…C[5]` **依固定順序**，淡底用同索引 `TINT`，結構用 `NAVY`，長文字用 `INK/BODY`。
- 字級 ≥ 22 px；圖內不放大標題；文字壓到線條時先畫 `knockout()` 白底。
- 換品牌色：先用 dataviz 驗證器驗新色票，再改 svgkit.py 開頭的 `C/TINT`。

### 4. 檢查每一張
`python3 scripts/check_svg.py diagrams/deck-03.svg --max-height 615`，然後**用 Read 看 PNG 預覽**。
修到沒有：文字重疊、文字壓線、文字出框、箭頭方向錯、圖形被畫布裁掉、留白失衡。至少看一次預覽才定稿。

配圖超過約 15 張：依 `references/agent-brief-template.md` 切成每份 10–15 張，交給多個代理平行畫，
回來後自己再批次跑 check_svg.py 並看預覽。

### 5. 組簡報
- 參考 `scripts/embed_pptx.js`：SVG 以 `image/svg+xml;base64,` 放入，尺寸 = px / 144 吋，**不縮放**。
- side：條列寬 = 12.13 − 圖寬 − 0.35 in；full 或無條列：圖置中，條列在下方兩欄。
- caption 放圖下方「看圖重點　…」。
- 筆記文字中的 `**詞**` → 粗體＋黃色螢光底 `FFE58A`。

### 6. 後處理與驗證（不可省略）
```bash
NODE_PATH=$(npm root -g) node scripts/embed_pptx.js slides.json raw.pptx
python3 scripts/fix_png_fallback.py raw.pptx final.pptx       # 修 PNG 備援＋多 run 段落 bug
python3 <pptx skill>/scripts/office/validate.py final.pptx
SOFFICE="python3 <pptx skill>/scripts/office/soffice.py" bash scripts/render_qa.sh final.pptx qa
```
看 `qa/sheet_*.jpg`。頁數多時把聯絡表交給一個**沒參與繪圖**的檢查代理逐頁看，回報有問題的頁碼與原因，
修完只重算有問題的那幾張，再用 `render_qa.sh final.pptx qa2 12 "56 95 180"` 確認。

## 常見問題（都實際發生過）

| 症狀 | 原因 | 解法 |
|---|---|---|
| PowerPoint 裡線框、陰影、底色不見 | 用了 filter、gradient、url(#) | 依 ppt-safe-svg.md 改寫；check_svg.py 會擋 |
| 箭頭只剩線、沒有尖端 | 用了 marker | `arrow()`／`head()` 多邊形尖端 |
| 圖示變黑 | currentColor | `icon()` 會替換；自己貼的 SVG 要手動換色碼 |
| LibreOffice／縮圖顯示空白圖 | pptxgenjs 在 Node 下的 PNG 備援是壞的 | `fix_png_fallback.py` |
| 含 **重點** 的條列沒有項目符號 | pptxgenjs 在段落中第 2 個 run 前多寫 `<a:pPr><a:buNone/>` | `fix_png_fallback.py` 會移除；段落屬性只放第一個 run |
| 顏色對比太低、色盲分不出 | 憑感覺挑色 | 用 dataviz 驗證器；預設色票已通過 |
| 每張圖長得都一樣 | 用同一個模板產生 | 逐張看原圖，依 form-catalog 選形式，每張一個繪圖腳本 |
| 文字被弧線或連線穿過 | 標籤放在線上 | `knockout()` 白底，或把標籤移到兩線之間 |
| 字太小看不清 | 圖被縮小放入 | 畫布直接用投影片尺寸（1 in = 144 px）、放入時不縮放、字級 ≥ 22 px |

## 交付
- 最終 PPTX、`diagrams/`（SVG＋JSON＋PNG 預覽）、繪圖腳本目錄，三者一起保存，之後改圖只要改腳本重跑。
- 向使用者說明：重繪了幾張、新增幾張、跳過哪些（為什麼），以及 QA 結果。
