# PPTX Skill 擴充 — Baoyu Slide Deck 風格系統

> 本檔為本專案對系統內建 `pptx` skill 的擴充層。
> 產生任何 `.pptx` 或 HTML 簡報前，**先讀 `.claude/skills/pptx/SKILL.md`，再讀本檔**，兩者合併套用。
> 來源：[JimLiu/baoyu-skills · baoyu-slide-deck](https://github.com/JimLiu/baoyu-skills/tree/main/skills/baoyu-slide-deck)

---

## 核心理念

簡報優先為「**閱讀與分享**」而設計，而非僅為現場口述。每一頁都要能獨立被看懂、具備社群分享力，並以 **AI 生成視覺為主角**，而非文字條列。此理念與本專案 `CLAUDE.md` 中簡報五大準則（明顯、可遠距閱覽、充滿圖表、可互動、現代化）完全相容，並補足「圖像生成工作流」的細節。

---

## 九步工作流（建立簡報時套用）

1. **Setup & Analyze** — 讀入內容/檔案，分析主題、受眾、語氣訊號
2. **Confirmation（必要）** — 與使用者做「兩輪確認」：風格、受眾、頁數、是否逐步審核
   - 與本專案 Step 1 `AskUserQuestion` 合併執行，不重複發問
3. **Generate Outline** — 依所選風格產生大綱 `outline.md`
4. **Review Outline**（條件式）— 核對每頁標題與版型
5. **Generate Prompts** — 為每一頁撰寫 AI 圖像生成 prompt，存 `prompts/`
6. **Review Prompts**（條件式）— 使用者確認圖像描述
7. **Generate Images** — 批次生成 PNG（參考 `CLAUDE.md` Step 5 的圖像生成優先順序）
8. **Merge** — 組合為 `.pptx`（或單檔 `.html`）與 `.pdf`
9. **Output Summary** — 交付並附 `computer://` 預覽連結

---

## 風格四維度（Texture × Mood × Typography × Density）

| 維度 | 選項 |
|------|------|
| **Texture 材質** | clean, grid, organic, pixel, paper |
| **Mood 氛圍** | professional, warm, cool, vibrant, dark, neutral |
| **Typography 字型感** | geometric, humanist, handwritten, editorial, technical |
| **Density 密度** | minimal, balanced, dense |

任一簡報任務都要在這四維度中明確下決策，並寫入大綱檔首。

---

## 15 種預設風格

`blueprint`（預設）、`chalkboard`、`corporate`、`minimal`、`sketch-notes`、`watercolor`、`dark-atmospheric`、`notion`、`bold-editorial`、`editorial-infographic`、`fantasy-animation`、`intuition-machine`、`pixel-art`、`scientific`、`vintage`

### 自動風格推薦

| 內容訊號 | 建議風格 |
|---------|---------|
| 教學 / tutorial / how-to | `sketch-notes`、`notion` |
| 架構 / system design | `blueprint` |
| 企業提案 / pitch | `corporate`、`bold-editorial` |
| 科研 / data-heavy | `scientific`、`editorial-infographic` |
| 故事 / 創意 | `watercolor`、`fantasy-animation`、`vintage` |
| 科技感 / 暗黑 | `dark-atmospheric`、`intuition-machine`、`pixel-art` |
| AI 教學課程（本專案預設） | `dark-atmospheric` + neon 強調色（對齊 CLAUDE.md 2026 趨勢） |

---

## 輸出結構

```
{課程名稱}/
├── 03_簡報_第N節.pptx        ← 最終交付
└── slide-deck/第N節/
    ├── outline.md             ← 含四維度決策 + 風格
    ├── prompts/
    │   ├── 01-{title}.md
    │   └── ...
    ├── images/
    │   ├── 01.png
    │   └── ...
    └── preview.pdf
```

---

## 套用原則

- **圖像優先**：每頁至少一張生成圖或主要視覺；文字僅為輔助說明
- **自解釋**：單頁能獨立讀懂，不依賴講師口述
- **偏好持久化**：使用者確認的風格/語言/受眾寫入本專案 `EXTEND.md`，跨課程重用
- **衝突處理**：目錄已存在內容時，主動提供備份或重生成選項
- **部分流程支援**：允許「只產大綱 / 只產 prompt / 只產圖 / 重生特定頁」
- **QA 仍依系統 pptx skill**：Baoyu 流程結束後必須跑一次 `SKILL.md` 的 Visual QA 子代理驗證

---

## 與本專案 `CLAUDE.md` 的對齊表

| CLAUDE.md Step 5 準則 | Baoyu 對應機制 |
|----------------------|----------------|
| 充滿圖表 / 每頁至少一視覺 | 圖像優先 + Step 5 Generate Prompts |
| 必須含呼應主題的生成圖片 | Step 5–7 的 prompt→image 工作流 |
| 現代化（2026 暗黑 + 霓虹） | `dark-atmospheric` / `intuition-machine` 預設 |
| 一頁一觀念、避免文字牆 | Density=minimal / balanced |
| 可互動（HTML 簡報） | 四維度可轉譯為 Tailwind 配色 + SVG 決策 |
