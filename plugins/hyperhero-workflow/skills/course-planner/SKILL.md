---
name: course-planner
description: |
  教學課程一條龍規劃技能。當使用者提到「我要準備一堂課」、「幫我規劃 X 課程」、「設計教材」、「備課」、「教學大綱」、「講稿」、「課程簡報」、「實作教材」、「教學工作坊」、「training」、「workshop」、「curriculum」、「lesson plan」時，**務必觸發此技能**。即使使用者只說「我下週要教 AI」這種一句話，也應觸發。本技能會帶領講師從「釐清需求 → 蒐集資料 → 課綱 → 課程介紹頁 → 痛點對齊 → 講稿 → 簡報 → 實作 → 一致性檢核」一條龍完成備課。所有產出使用繁體中文。
type: workflow
---

# Course Planner — 教學課程一條龍規劃技能

本技能用來協助講師為一場教學任務從零備課。核心精神是「**先對齊真實痛點、再產出完整教材**」，避免講師單方面假設學員需要什麼。

## 使用時機

當使用者表達任何備課意圖時觸發。常見訊號：
- 「我要準備一堂 X 課程」「幫我規劃 X 課程」「設計教材」「備課」
- 「教學大綱」「講稿」「課程簡報」「教學工作坊」
- 「training」「workshop」「curriculum」「lesson plan」
- 即使只是一句話「我下週要教 AI」也應觸發

## 核心原則

1. **先問再做**：永遠先用 AskUserQuestion 釐清需求，不要自行假設。
2. **與真實痛點對齊**：課綱完成後必須做三次循環痛點對齊（見 Step 4.7）。
3. **產出完整可用**：每節講稿需逐字稿等級、簡報需與講稿頁碼對齊、實作需含驗收標準。
4. **一致性檢核為最後一步**：所有檔案產出後必須跑檢核。
5. **永遠使用繁體中文**回應與產出。
6. **時間以今天為準**，相對時間轉成絕對日期。

## 標準工作流程（SOP）

### Step 1 — 釐清任務需求（必要）

用 `AskUserQuestion` 工具確認以下資訊（已提供則跳過）：

- **課程主題**：要教什麼？
- **學員類型**：年齡、職業、AI/技術先備程度（新手/初階/中階/進階）
- **上課時數**：總時數與節數（每節 50 分鐘）
- **場地與設備**：實體/線上/混合
- **可用工具**：學員可用的 AI 工具與帳號
- **是否包含實作**：是/否；若是預期主題
- **簡報形式偏好**：PPT / 互動式 HTML / 影片
- **課程目標**：學員上完課後應該會做什麼或理解什麼

### Step 2 — 蒐集最新資訊

使用 `WebSearch` 與 `WebFetch`：
1. 該主題的**最新技術現況**（近 6 個月內更新）
2. **同類型教學案例**
3. **實際應用案例**作為課堂範例
4. 整理為 `/research/{課程名稱}_research.md`，含資料來源 URL 與日期

### Step 3 — 產生課程大綱

依 Step 1 條件 + Step 2 資料產出課綱，內容必須包含：
- 課程總目標（Learning Outcomes，3–6 條，動詞開頭）
- 每節子目標、主題、時間分配
- 每節「講授/示範/實作/討論」比例
- 課前準備清單（學員端/講師端）
- 評量方式（若適用）

輸出為 `01_課綱.md`（草案階段用 md 即可）或 `01_課綱.docx`（最終版讀 docx skill）。
存於 `{工作目錄}/{課程名稱}/01_課綱.md`。

### Step 4 — 撰寫每節講稿

每節 50 分鐘獨立一份，檔名 `02_講稿_第N節_{主題}.docx`。

要求：
- 開場（3–5 分鐘）：暖身、回顧、引發動機
- 主體（35–40 分鐘）：分段敘述、過場語、提問、互動點
- 結尾（5–10 分鐘）：總結、Q&A、預告下節
- **逐字稿等級**，講師可直接照唸
- 註明「對應簡報第 X 頁」與「示範操作時機」
- 每段落能回答「這段在達成哪一條 LO？」

### Step 4.5 — 課程介紹頁（必要）

課綱完成後，產出 `00_課程介紹.html`（互動式行銷頁）：
- 單檔 HTML、Tailwind CDN
- 區塊：Hero 標題、Learning Outcomes 視覺化、知識主題卡片、Day1/Day2 時程、必備工具與課前準備、適合對象、CTA
- 響應式、含圖示、配色專業
- 語氣**吸引人、利益導向**（行銷招生用途）

### Step 4.7 — 痛點對齊三次循環思考（必要）

課綱草案 + 課程介紹頁完成後，執行：

1. **第一次循環 — 蒐集**：用 `WebSearch` 查同主題課程「學員最在意的目標／最常見卡點／最常被吐槽的痛點」，整理 5–10 條真實需求。
2. **第二次循環 — 對照**：把痛點與目前 LO、節次內容逐一比對，標「已涵蓋／部分涵蓋／未涵蓋」。
3. **第三次循環 — 微調**：針對未/部分涵蓋項目，補進現有節次或新增段落，必要時新增 LO。
4. 完整過程記錄到課綱新章節「**使用者真實痛點對齊紀錄**」中（含資料來源、對照表、決策表）。
5. 微調內容在對應節次標註 🟣 痛點對齊。

**目的**：確保課程與真實世界要解決的痛點對齊，而非講師單方面想講的內容。

### Step 5 — 製作簡報

**產出前必讀**：系統 `pptx/SKILL.md` **＋** 本技能附帶的 [`pptx_baoyu_extension.md`](pptx_baoyu_extension.md)（Baoyu Slide Deck 風格系統：九步流程、風格四維度 Texture × Mood × Typography × Density、15 種預設風格、prompt→image→pptx 工作流）。兩者合併套用。

依使用者選擇：
- **PPT**：使用 `pptx` skill，檔名 `03_簡報_第N節.pptx`
- **互動式網頁**：單檔 `.html`，Tailwind CDN，含導覽、動畫、範例
- **影片**：先產腳本與分鏡 `.md`，再說明製作建議

#### 五大設計準則（融合 2026 設計趨勢）

1. **明顯（Bold & Big）**：標題 48pt+、副標 32pt+、正文 24pt+；粗體 Sans-serif；單頁訊息密度低、留白充足；50% 螢幕面積給主標也不為過
2. **可遠距閱覽（Readable from back row）**：高對比配色（深底 + 高彩度強調色，或白底 + 深色字）、避免細線細字、最後一排能看清楚；遵循 WCAG AA 對比度 4.5:1 以上
3. **充滿圖表（Visual-first）**：能用圖就不要用字
   - **Bento Grid** 模組化版型（一頁多 box、像 Apple keynote）
   - **Donut Chart / Sankey / 單一大數字 + 一句解讀**
   - **流程圖、icon 卡片、對比卡**
   - 每頁至少 1 個視覺元素，避免純文字頁
   - 從「Data Visualization」進化為「Narrative Scaffolding」 — 圖表旁要有一句話解讀
4. **可互動（Interactive）**
   - HTML 簡報務必支援鍵盤左右鍵與空白鍵切換
   - 含現場互動環節（投票、QR、Mentimeter/Slido、討論題卡）
   - **非線性導覽**：可跳頁選單，讓講師依現場提問跳到相關頁
   - 必要時加入動畫過場（fade、slide-in）
5. **現代化（Modern aesthetic）**：採用 2026 設計趨勢
   - **深色模式 + 霓虹強調色**（董事會新標準）
   - **Bento Grid** 模組化版型
   - **玻璃擬態 glassmorphism**：`background: rgba(255,255,255,.08); backdrop-filter: blur(8px)`
   - **漸層 hero**：linear-gradient 多色過渡
   - **大膽 sans-serif** 標題（思源黑體、Inter、Microsoft JhengHei）
6. **最小字級 ≥ 22px**：所有文字（含註解、圖說、表格內文、footer）字級下限為 **22px**（或 1.4rem 等相當值）。低於此值一律放大或刪除，禁止用小字塞資訊。CSS 建議：`html { font-size: 22px; }` 或全域 `*:not(.huge-num):not(.mega) { font-size: max(22px, 1.4rem); }`
7. **必須含呼應主題的生成圖片**：每節簡報需產生並嵌入至少 1–2 張 AI 生成圖片（hero 視覺、概念示意、案例情境圖），不可只用純文字 + emoji。圖片要與該頁訊息語意一致，並以暗色濾鏡或玻璃卡片融合，避免破壞整體視覺風格

**圖片產生工具優先順序（依「真實感 / 可用性」排序）：**

1. **Gemini Nano Banana via Claude in Chrome**（首選 — 真實攝影感最佳，使用者通常已有 Google AI Pro 訂閱）
2. **imagegen SKILL / 圖像生成 MCP**（若已掛載 `mcp__*__generate_image`）
3. **內嵌 SVG**（離線安全的概念示意 — 神經網路、流程、icon 卡片）
4. **Claude in Chrome → Midjourney / DALL-E / Ideogram / Firefly**
5. **Python `pillow` / `matplotlib`**（資料視覺化、流程圖）
6. **Unsplash / Pexels API**（合規授權真實照片）

#### Gemini Nano Banana 完整工作流（已驗證可用）

**所需工具：** `mcp__Claude_in_Chrome__*`（navigate / find / computer / read_page / tabs_*）+ `mcp__Windows-MCP__PowerShell`

**前置確認：**
- 使用者必須已在 Chrome 登入 Google 帳號且擁有 Google AI Pro 訂閱
- 不要用 Google AI Studio 的 Nano Banana 2（需付費 API key）；用消費端 `https://gemini.google.com/app`
- 先以 PowerShell 確認使用者實際下載資料夾（**不可假設為 `~/Downloads`**）：
  ```powershell
  (New-Object -ComObject Shell.Application).NameSpace('shell:Downloads').Self.Path
  ```
- 確認 mount 路徑（教學專案目錄在 Linux 沙盒中對應的 Windows 路徑），用 `mount` 指令查 `/sessions/great-serene-edison/mnt/教學` 對應的 `C:\…` 真實位置

**標準步驟（每張圖重複）：**

1. **開啟 / 切換 Gemini 分頁**
   `mcp__Claude_in_Chrome__navigate` → `https://gemini.google.com/app` （首次）；之後重用該 `tabId`
2. **找到輸入框**
   `mcp__Claude_in_Chrome__find` query: `"prompt textbox"` → 取得 `ref_*`
3. **輸入 prompt**
   `mcp__Claude_in_Chrome__computer` action `left_click` 點 textbox ref → action `type` 貼上 prompt
   ⚠️ Prompt 必須是**英文**、含 `16:9 cinematic ultra-realistic photograph`、明確構圖（鏡頭、景深、配色、留白區）、主題色 `purple #a78bfa + cyan #22d3ee neon`，並指定「leave empty negative space on the LEFT for text overlay」以利後續疊文字
4. **送出**
   `mcp__Claude_in_Chrome__find` query: `"send button"` → 取得 ref → `left_click` ref
   ⚠️ 不可用 `key: "Return"`，Gemini 中 Enter 只會換行；座標點擊容易飄，請永遠用 ref
5. **等待生成（20–30 秒）**
   `computer` action `wait` duration 10，必要時重複；用 `read_page` 或 `find query: "下載原尺寸圖片"` 確認圖已生成
6. **下載原尺寸**
   `find` query: `"下載原尺寸圖片"` → 多次生成會回多個 ref，**最後一個 ref 才是最新那張**；`left_click` 該 ref
7. **PowerShell 移動並重新命名**（從使用者下載夾搬到課程 `images/`）
   ```powershell
   Get-ChildItem F:\000-Download\Gemini_Generated_*.png |
     Sort-Object LastWriteTime -Descending | Select-Object -First 1 |
     ForEach-Object { Move-Item $_.FullName "C:\Users\Hiro\Desktop\教學\{課程名}\images\s01_pN_{semantic}.png" -Force }
   ```
   檔名規則：`s{節次:02}_p{頁碼}_{語意}.png`，例：`s01_p1_hero.png`、`s01_p7_three_industries.png`

**常見坑（已踩過）：**
- ❌ Desktop Commander 預設禁止存取 Downloads 資料夾 → 改用 `mcp__Windows-MCP__PowerShell`
- ❌ Linux mount 路徑與 Windows 路徑不同 → 用 `mount` 確認，不要猜
- ❌ Gemini 「停止回覆 / 傳送訊息」按鈕共用同一個 ref，狀態切換 → 每次點擊前重新 `find`
- ❌ 生成中誤點頁面其他位置會出現「你停止了這則回覆」→ 等待期間不要操作

**嵌入 HTML 簡報的 CSS（暗色濾鏡 + 玻璃融合）：**
```css
/* 全幅背景照 */
.photo-bg { position:absolute; inset:0; z-index:0; overflow:hidden; pointer-events:none; }
.photo-bg img { width:100%; height:100%; object-fit:cover;
  filter: brightness(.32) saturate(1.25) contrast(1.05); }
.photo-bg::after { content:''; position:absolute; inset:0;
  background: linear-gradient(180deg, rgba(10,14,26,.55), rgba(10,14,26,.85)); }
.slide > *:not(.photo-bg) { position:relative; z-index:1; }

/* Hero 側欄圖 */
.hero-art img { width:100%; border-radius:24px;
  filter: brightness(.78) saturate(1.18) contrast(1.05);
  box-shadow: 0 30px 80px rgba(167,139,250,.35), inset 0 0 0 1px rgba(255,255,255,.1); }
```

每節簡報目標：1 張 hero（P1）+ 3–5 張內容頁背景照 + 1 張收尾互動頁照

#### HTML 簡報基本骨架（可重用）

```html
<style>
  html,body { height:100%; margin:0; font-family:'Microsoft JhengHei',sans-serif; background:#0f172a; color:#f8fafc; }
  .slide { position:absolute; inset:0; display:none; padding:4vh 6vw; flex-direction:column; justify-content:center; }
  .slide.active { display:flex; animation: fade .4s ease; }
  .grad { background: linear-gradient(135deg,#0f172a,#1e3a8a,#7c3aed); }
  .card { background:rgba(255,255,255,.06); border:1px solid rgba(255,255,255,.12); border-radius:16px; padding:24px; backdrop-filter:blur(8px); }
  .accent { color:#a78bfa; } .warn { color:#fbbf24; } .danger { color:#f87171; }
  h1 { font-size:5vw; font-weight:800; }
  h2 { font-size:3.2vw; font-weight:700; }
  .big { font-size:8vw; font-weight:900; }
</style>
<script>
  // 鍵盤導覽：左右鍵 + 空白鍵
  const slides = document.querySelectorAll('.slide');
  let i = 0;
  function show(n){ slides.forEach(s=>s.classList.remove('active')); i=(n+slides.length)%slides.length; slides[i].classList.add('active'); }
  document.addEventListener('keydown', e => { if(e.key==='ArrowRight'||e.key===' ')show(i+1); if(e.key==='ArrowLeft')show(i-1); });
</script>
```

#### 設計準則來源
- [Presentation Design Trends 2026 — Slidesgo](https://slidesgo.com/slidesgo-school/ai-presentations/presentation-design-trends-2026)
- [7 Top Presentation Design Trends 2026 — SlideEgg](https://www.slideegg.com/blog/presentation-tips/the-7-presentation-design-trends-dominating-2026-data-backed/)
- [簡報、多媒體教材設計原則 — 台灣數位訓練](https://learning.xms.tw/media/1728)
- [簡報圖表設計：基本觀念到設計細節 — Fahahatalk](https://fahahatalk.com/data-visualization/)
- [Slido 教學：互動工具提升教學演說 — Hahow](https://hahow.in/contents/articles/6063fe6fe28e587d3c010266)

#### 共通原則
- 一頁一觀念
- 與該節講稿**頁碼對齊**（簡報 P.X 對應講稿「換到第 X 頁」）
- 每頁皆服務於某條 LO

### Step 6 — 實作教材（若有）

若課程包含實作，產出：
- **實作流程文件** `04_實作_第N節.docx`：步驟編號、預期結果、常見錯誤、Debug 建議
- **操作素材**：範例資料、Prompt 模板、設定檔
- **驗收標準**：學員完成後應看到/產出什麼

### Step 7 — 一致性檢核（必要，最後一個 Todo）

1. 課綱目標 ↔ 講稿段落 ↔ 簡報頁面 ↔ 實作步驟，是否四者對齊？
2. 時間是否合理（每節 50 分鐘 ±5 分鐘）？
3. 學員程度是否匹配（不可有未介紹的名詞直接出現）？
4. 工具與場地是否與 Step 1 相符？

寫入 `00_檢核報告.md`。

## 檔案結構規範

每門課產生：

```
{課程名稱}/
├── 00_檢核報告.md
├── 00_課程介紹.html
├── 01_課綱.md / .docx
├── 02_講稿_第01節_xxx.docx
├── 02_講稿_第02節_xxx.docx
├── ...
├── 03_簡報_第01節.pptx (或 .html)
├── ...
├── 04_實作_第N節.docx
└── research/
    └── {課程名稱}_research.md
```

## 必守原則總結

1. 永遠先 `AskUserQuestion` 釐清需求
2. 永遠先 `TodoWrite` 列出步驟，把「一致性檢核」列為最後一項
3. 建立 docx / pptx / pdf 之前，先 Read 對應的 SKILL.md
4. 講稿與簡報必須對應 LO，禁止天馬行空加料
5. 痛點對齊三循環是必要步驟，不可省略
6. 所有檔案存到使用者指定的工作資料夾並提供 `computer://` 連結
7. 回應一律繁體中文，語氣專業簡潔
8. 資料來源附引用（URL + 日期）
9. 相對時間轉成絕對日期（用今天日期為準）

## 後續擴充計畫

本技能會在實際使用過程中陸續補充：
- [ ] 各產業常用幕僚陣容範本（行銷／建築／遊戲／製造／教育…）
- [ ] 常用 Prompt 模板庫
- [ ] 常用 HTML 簡報範本
- [ ] 各類學員的破冰互動範例
- [ ] 痛點對齊常用搜尋關鍵字清單
- [ ] 不同時數的課表安排範本（半天、一天、兩天、三天）
