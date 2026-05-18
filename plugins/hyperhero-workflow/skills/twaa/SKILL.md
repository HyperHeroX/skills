---
name: twaa
description: |
  台灣無障礙網站規範 (TWAA) 全等級 (A/AA/AAA) 自動檢測技能。腳本主導 + AI 兜底，
  靜態 + Browser MCP + 自動腳本三軌並行，對 Vue/React/PrimeVue 等現代前端架構特別優化。

  **必須使用此技能的時機：**
  - 提到「無障礙」、「TWAA」、「TWAAA」、「AAA」、「AA」、「無障礙評量」、
    「無障礙稽核」、「無障礙審查」、「a11y audit」、「accessibility review」
  - 要求「依 13 指引條文檢測」、「為網站做 AA/AAA 標章準備」、
    「對前端組件做嵌套地雷檢查」
  - 退件意見來自台灣數位部、勞動部、衛福部等政府單位
  - 上傳 sitemap、URL 清單、整個前端 repo 並要求做無障礙稽核
---

# TWAA 全等級無障礙檢測技能

## 🚨 五項不可違背的核心原則（任何情況下均不可跳過）

### 原則一：一個頁面必須滿足全部 300+ 條檢查項目才算通過

台灣 MODA 無障礙規範包含：
- **28 個 C 碼**（自動檢測）
- **209 個 E 碼**（稽核評量，必須用 Playwright 瀏覽器自動化檢測）
- **axe-core 規則**（WCAG 2.1 機械可驗證）

**一頁只檢查部分規則是不完整的。** 每個頁面必須跑完所有適用規則，才能確認該頁面真正達標。

```bash
# ✅ 正確：一個頁面跑全部 300+ 條規則
python -m twaa.check_browser http://localhost:8083/zh-tw/home --level AA
# → 同時執行 axe-core + 28個C碼靜態 + 209個E碼 Playwright 自動化

# ❌ 錯誤：只跑部分規則（不允許）
# ❌ 錯誤：只用 AI 判斷 E 碼（必須用程式碼驗證）
```

### 原則二：E 碼必須用程式碼自動化，不能只靠 AI 判斷

**209 個 E 碼（稽核評量碼）的檢測要求：**
- 每個 E 碼都有官方稽核步驟（見 `references/examples/`）
- 必須將稽核步驟轉換為 **Playwright 瀏覽器程式碼**（DOM 查詢、鍵盤模擬、CSS 計算等）
- 不可僅靠 AI 閱讀頁面判斷 — 必須有可重複執行的自動化程式

```bash
# E 碼自動化工具架構（每個 E 碼一個獨立 JS 模組）
scripts/e_code_tests/            # 209 個獨立測試檔（每個 E 碼一個 JS 文件）
  ├── AR2410300E.js             # 每個檔案：export async function check(page)
  ├── CS1140101E.js
  ├── GN1240100E.js
  └── ... (共 209 個)
scripts/e_code_runner.js         # 主控器：動態 import 所有 E 碼並逐一呼叫
scripts/gen_e_code_tests.py      # 產生器：從官方 md 文件自動產生 JS 測試程式碼

# 執行方式
node scripts/e_code_runner.js <url> --level AA      # 執行全部 AA 等級 E 碼
node scripts/e_code_runner.js <url> --category GN   # 只執行 GN 類（通用）
node scripts/e_code_runner.js --list                 # 列出所有已實作的 E 碼

# 整合執行（axe-core + E 碼 + 基礎規則）
python -m twaa.check_browser <url> --level AA        # 三套工具一次跑完
```

#### 額外檢測（FreeGo 審查員慣性要求，非官方 E 碼）

某些自檢表/審查員會要求超出官方規範字面的條件。這些放在獨立資料夾與獨立主控器：

```bash
scripts/extra_tests/              # 非官方 E 碼但實務 AA 審查會檢的加強規則
  ├── EXTRA_SKIPLINK_FIRST.js    # 自檢表第 8 項：頁面載入後第一個 Tab 焦點為 skip-link
  ├── EXTRA_HOVER_TOOLTIP.js     # 多數 AA 站慣例：可互動元素 hover 顯示 tooltip
  └── EXTRA_DOWNLOAD_EXTENSION.js # 下載連結顯示「檔名.副檔名」格式
scripts/extra_runner.js           # 額外檢測主控器（共用 e_code_runner 的格式）

# 執行
node scripts/extra_runner.js <url>
node scripts/extra_runner.js --list
```

**何時跑：** 在 e_code_runner 全部 PASS 後，跑 extra_runner 確保 FreeGo 慣性條目也通過。失敗時會列具體 fix_suggestion。

### 原則三：報告格式以「單一頁面」為單位，每頁列出所有未達標項目

**錯誤做法**：取一條規則（如 CS2140401C），掃遍所有頁面  
**正確做法**：取一個頁面，對它執行全部規則，完整列出所有問題，再換下一頁

```bash
# ✅ 正確：一個頁面跑所有規則
python -m twaa.check_file Login.vue --level AA      # 先完整檢查 Login.vue
python -m twaa.check_file Register.vue --level AA   # 再完整檢查 Register.vue

# ❌ 錯誤：一個規則掃所有頁面（不允許）
```

### 原則三（延伸）：報告格式以「單一頁面」為單位

報告結構：
```
## 頁面 1：Login.vue
  1. [CS2140401C] font-size 固定 px
     - 未達標內容：font-size: 13px
     - 稽核評量碼：CS2140401C
     - 修改建議：改為 font-size: 0.8125rem;
  2. [WCAG-2.4.7] 焦點無可視指示器
     ...

## 頁面 2：Register.vue
  1. [GN1310100E] lang 屬性使用 zh-TW
     ...
```

每項問題**必須包含**：
1. **未達標內容**（問題描述 + 程式碼片段）
2. **稽核評量碼**（台灣 MODA 官方碼）
3. **修改建議**（具體可操作）

產生修復計劃：
```bash
python -m twaa.generate_fix_plan report.json -o fix-plan.md
```

### 原則四：每一個檢查碼必須有自己的檢查方法、獨立成一個程式

**這是維持規模化、可追溯、可獨立啟用的基礎架構原則。**

任何規則（官方 C/E 碼或補充靜態 WCAG 檢查）**必須**：
- 為該規則建立**一個獨立檔案**（檔名 = 規則代碼）
- 該檔包含 `check()` 函式 + `metadata` 字典（criterion / level / category / rule）
- 主程序（runner）動態 import 全部模組並逐一呼叫，**不可手動維護全域檢查清單**

```
scripts/
├── e_code_tests/<CODE>.js              # 209 個 E 碼（瀏覽器自動化）
├── e_code_runner.js                    # 動態載入 E 碼
└── twaa/
    ├── c_code_tests/<CODE>.py          # 29 個官方 C 碼（HM/CS/ME 前綴）
    ├── c_code_runner.py                # 動態載入 C 碼
    ├── supplementary_tests/<RULE>.py   # 10 個補充 informal WCAG 檢查
    └── supplementary_runner.py         # 動態載入補充規則
```

**官方 vs 補充的區分：**

| 來源 | 命名 | 用途 | 範例 |
|------|------|------|------|
| 官方 C 碼 | HM/CS/ME + 數字 + C | 標章審查依據 | `HM1110100C.py` |
| 官方 E 碼 | 類別前綴 + 數字 + E | 標章審查依據 | `HM1110100E.js` |
| 補充靜態 | `WCAG_x_y_z.py` | 開發階段協助，非審查依據 | `WCAG_2_4_3.py`（正值 tabindex）|

**補充模組設計時機：** 官方規範該成功準則標示「相關檢測碼:(無)」，
但仍可靜態偵測常見違規模式（如 `tabindex>0`、`viewport user-scalable=no`、
非互動元素帶 onclick 缺鍵盤事件等）。

```bash
# 列出所有實作
node   scripts/e_code_runner.js  --list
python -m twaa.c_code_runner --list           # 29 官方 C 碼
python -m twaa.supplementary_runner --list    # 10 補充規則

# 對單檔執行
python -m twaa.c_code_runner --check Foo.vue --level AA
python -m twaa.supplementary_runner --check Foo.vue --level AA

# 整合執行（兩個 runner + needs_human 清單）
python -m twaa.check_file Foo.vue --level AA
```

**為什麼必須這樣做：**
1. **可追溯**：報告中每條失敗都能直接對應到一個原始碼檔案，便於審查與測試
2. **可獨立啟用**：可只跑指定碼（如 `--code CS2140401C` 或 `--category HM`）
3. **無中央維護負擔**：新增檢查碼只需丟一個檔進目錄，runner 自動發現
4. **可獨立替換實作**：當某條檢查邏輯改進時，只動該檔不影響其他碼

**新增任何檢查碼時的工作流：**
```python
# 1. 建立 c_code_tests/<NEWCODE>.py
metadata = {"code": "HM1410200C", "criterion": "4.1.2", "level": "A",
            "category": "HTML", "rule": "...", "applies_to": ("vue", "html")}

def check(file_path: str, content: str) -> list[CheckResult]:
    # 實作檢查邏輯，回傳 CheckResult list
    ...

# 2. 立即可用（不必改 runner、不必改任何 import）
python -m twaa.c_code_runner --check Foo.vue --level A
```

詳細架構說明見 `references/checker-architecture.md`。

### 原則五：靜態檢查必須對「渲染後 HTML」執行，不能只看原始碼

**為什麼這條重要：**
標章審查員看的是**瀏覽器渲染完成後的最終 HTML**，不是 .vue 原始碼。
SPA / SSR 應用因為動態繫結（`:src`、`:alt`）、computed 屬性、條件渲染、
prerender hydration 等因素，**原始碼通過不代表渲染後通過**（反之亦然）。

實證：本專案首頁 Vue 原始碼 0 fail，但渲染後 HTML 抓到 9 頁的 HM1110103C 違規
（star icons / emoji 圖示在元件層用了動態 props，原始碼掃不到實際出現的字符）。

**所以靜態檢查必須走兩條路徑：**

```bash
# (a) 對 Vue 原始碼跑（開發階段：早期發現問題）
python -m twaa.check_file Foo.vue --level AA

# (b) 對渲染後 HTML 跑（送審前必跑：審查員視角）
python -m twaa.check_url http://localhost:8083/zh-tw/home --level AA
python -m twaa.check_url --urls-file sitemap.json --level AA
```

`check_url.py` 的內部流程：
1. 用 Playwright 開啟 URL，等 `networkidle` 確保 SPA 完成 mount
2. 取得完整 `document.documentElement.outerHTML`（含 doctype）
3. 把這份 HTML 當成 `.html` 檔餵給 `c_code_runner` + `supplementary_runner`
4. 結果以 URL 為主鍵記錄

**永遠不要只跑原始碼檢測就送審**。送審前的最終驗證流程：

```
原始碼 .vue 檢測  ✅ 開發時用，快速但不完整
        ↓
渲染後 HTML 檢測  ✅ 送審前必跑，反映審查員視角
        ↓
瀏覽器 axe + E 碼 ✅ 動態互動驗證
        ↓
人工 sanity check ✅ Tab 走訪、表單提交、Esc 關閉等
```

詳細實作：`scripts/twaa/check_url.py` + `scripts/fetch_rendered_html.js`。

---

## 觸發後第一步

1. 讀 `references/checklist-A.md`、`checklist-AA.md`、`checklist-AAA.md`、
   `framework-hazards.md`、`method-by-guideline.md`、`tool-tier-mapping.md` 概覽。
2. 確認使用者要的等級（預設 AA；明確提 AAA 或 TWAAA → AAA）。
3. 確認專案路徑與要產出的 audit 目錄路徑（預設 `<project>/docs/twaa-audit/`）。
4. 檢查 `<audit>/state.json` 是否存在；存在則 **resume**，不存在則 **new run**。

## 台灣 MODA 官方規範整合

`references/taiwan-spec.md` 收錄台灣數位部「網站無障礙規範(110.07)」全文，含 **112 個官方檢測碼**：

| 前綴 | 類別 | 自動(C) | 人工(E) |
|------|------|---------|---------|
| HM | HTML | 23 | 21 |
| GN | 通用 | 0 | 45 |
| CS | CSS | 4 | 23 |
| FA | Flash/動畫 | 0 | 7 |
| SC | Script | 0 | 2 |
| ME | 媒體 | 1 | 0 |
| AR | ARIA | 0 | 多 |

**查詢特定檢測碼：**
```bash
python scripts/lookup_checkcode.py CS2140401C     # 查單一碼
python scripts/lookup_checkcode.py 1.4.4          # 查成功準則所有碼
python scripts/lookup_checkcode.py --list AA      # 列出等級所有碼
python scripts/decode_checkcode.py HM1240200E     # 解碼任意碼結構
```

**快查索引：** `references/taiwan-checkcodes-index.md`（依等級分組）

**官方範例庫：** `references/examples/`（239 個官方稽核/檢測碼完整說明）
- 索引：`references/examples-index.md`
- 命名規則：`[前綴][等級][準則][流水號][C/E].md`，例如 `HM1240200C.md`
- 查閱方式：`cat references/examples/HM1240200C.md`

### 退件意見 ↔ 台灣檢測碼對照

當使用者貼上政府退件意見（如「HM1240200E 缺少頁面標題」），應：
1. 用 `lookup_checkcode.py` 取得完整規則說明
2. 對照 `method-by-guideline.md` 找出靜態/運行/手動三層檢測方法
3. 在 state.json 標記 `source: "taiwan_moda"` 以區分一般 WCAG 問題

## 4 階段執行流程

### Phase 1 — Sitemap discovery（發現所有頁面）

```bash
python -m twaa.discover_sitemap --project <project> --out <audit>/sitemap.json
```

執行後：
1. AI 讀 `sitemap.json`，按 `priority` 排序確認順序
2. 把 sitemap 寫進 state.json
3. 若使用者要求調整排序，重排後再進 Phase 2

### Phase 2 — 靜態掃描（所有頁面 × 所有靜態指引）

```bash
python -m twaa.scan_static --project <project> --out <audit>/static-findings.json
```

執行後：
1. AI 讀 `static-findings.json`，按 page 分組
2. 對每個 finding 用 Read 看 5-10 行上下文（**腳本主導 + AI 兜底**）
3. 結果寫入 state.json：
   - 機械可確認的問題 → `failed`
   - 上下文不明的問題 → `needs_human`
   - 沒問題 → `passed`
4. 對應 `tool-tier-mapping.md` 的「靜態」層指引做標記

### Phase 3 — 運行期檢測（Browser MCP）

對每個 page：

```bash
node scripts/run_axe.js <url> --json > <audit>/axe-<page>.json
```

接著用 Browser MCP（playwright 或 chrome-devtools）：
1. **Tab 走訪測試**：Tab 一輪確認焦點順序、有無陷阱（2.1.2、2.4.3、2.4.7）
2. **Esc 關閉測試**：對所有 modal/dropdown/menu 按 Esc（2.1.2、4.1.2）
3. **Skip-link 測試**：頁面載入後第一 Tab 應落在 skip-link，按 Enter 應實際跳焦（2.4.1）
4. **錯誤焦點測試**：表單留空送出，焦點應跳第一個錯誤欄位（3.3.3）

結果合併進 state.json。

### Phase 4 — 報告產出

```bash
# 產分層報告
python -m twaa.render_reports --state <audit>/state.json --out-dir <audit>

# 互動儀表板
python -m twaa.render_dashboard --state <audit>/state.json --project-name "<name>" --out <audit>/dashboard/index.html

# 合併單檔 + docx
python -m twaa.merge_reports --audit-dir <audit> --project-name "<name>" \
  --out-md <audit>/final/full-report.md --out-docx <audit>/final/full-report.docx
```

## 關鍵原則

1. **腳本先掃，AI 後讀**：scripts 處理 80% 機械檢測；AI 只在 `pending_review` 清單上深入。
2. **頁面 × 方法 雙層迴圈**：外層 for page（按 priority），內層 for method（按 tool-tier-mapping）。**完整跑完一頁才換下一頁**。
3. **state.json 永遠寫入**：每完成一個 cell 立即寫入，中斷重跑 idempotent。
4. **遇 needs_human 不卡流程**：標記後繼續，最終報告統一列出待人工項。

## 框架嵌套地雷

當靜態掃描 hit 到任一 `framework-hazards.md` C/V/R/P 條目，AI 在 per-page 報告中**獨立列出「框架嵌套地雷」段落**，附「責任鏈分析」結論：

> 對每個互動性元件追溯：(1) 誰下了 ARIA？(2) 誰處理鍵盤事件？(3) 誰負責 forward ref？(4) 誰負責 unmount 清理？
> 若任一項責任不明或多層同時處理同一責任，標記為「責任鏈斷裂」高風險。

## 降級

若 Browser MCP 不可用：
- Phase 3 自動跳過 → 對應 cells 標 `needs_human`
- 報告產出時 Phase 3 條目顯示 ⚠ 而非 ✅/❌
- 在 summary.md 開頭明確標注「本次未做運行期檢測」

## 與舊技能的關係

本技能取代 `~/.claude/skills/twaa-aa/`。舊技能驗收通過後可刪除；checklist-AA.md 已移植其全部內容並擴充。

## 範例觸發

> "幫我對 frontend/app-fs 做 TWAAA 全網站無障礙稽核"
> "重做 AA 標章退件 11 條"
> "把這個 Next.js 站台的 a11y 弱點掃出來"
