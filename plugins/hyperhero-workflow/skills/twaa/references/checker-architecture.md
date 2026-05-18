# TWAA 檢查器架構：「一碼一檔」原則完整說明

> **核心信念：** TWAA 規範約 250+ 條檢測碼，分散在不同類別與等級。
> 任何嘗試把多碼塞進一個大檔案的方案，最終都會變成不可維護的條件式地獄。
> 唯一規模化的方式是：**每碼一個獨立模組，主程序動態載入。**

## 為什麼採用「一碼一檔」

### 問題：bundled 模組的代價

過去 TWAA 把所有 CSS C 碼塞在 `checkers/css_rules.py`、HTML C 碼塞在 `checkers/html_rules.py`。

當官方規範修訂時，常見的痛苦：
1. 找一個函式要 scroll 過 500 行檔案
2. 改某條規則時害怕影響其他規則
3. 報告中無法直接從失敗碼跳到原始碼
4. 沒辦法只啟用特定一條規則做 A/B 測試
5. 主控器要手動維護 `ALL_CHECKS = [...]` 清單，新增規則時容易忘記註冊

### 解法：發現式架構（discovery-based）

主控器只做一件事：**列出目錄、import 全部、逐一呼叫**。
新增規則 = 把新檔案丟進目錄即可，**主控器永遠不需要修改**。

```python
# c_code_runner.py 核心邏輯
for py in sorted(TESTS_DIR.glob("*.py")):
    if py.stem.startswith("_"):  # 跳過 helpers
        continue
    mod = importlib.import_module(f"twaa.c_code_tests.{py.stem}")
    if hasattr(mod, "check") and hasattr(mod, "metadata"):
        modules.append(mod)
```

## 模組契約（contract）

每個 `<CODE>.py` 模組**必須**匯出兩個物件：

### 1. `metadata` 字典

```python
metadata = {
    "code": "CS2140401C",         # 與檔名一致的官方檢測碼
    "criterion": "1.4.4",          # WCAG 成功準則
    "level": "AA",                 # A / AA / AAA
    "category": "CSS",             # CSS / HTML / Media / General / Script / ARIA / Flash
    "rule": "font-size 不得使用固定 px",  # 一句話規則描述
    "applies_to": ("css", "scss", "vue"),  # 適用副檔名（runner 用此過濾）
}
```

### 2. `check(file_path: str, content: str) -> list[CheckResult]` 函式

```python
from ..checkers.result import CheckResult, Status
from . import _helpers as H

def check(file_path: str, content: str) -> list[CheckResult]:
    # 1. 萃取適合此規則的內容（CSS / template / 整檔）
    css, offset = H.extract_style(content) if file_path.endswith(".vue") else (content, 0)

    # 2. 執行邏輯，每發現問題建立一個 CheckResult
    results = []
    for m in re.finditer(...):
        results.append(CheckResult(
            code=metadata["code"],   # 一律從 metadata 取，避免不一致
            rule=metadata["rule"],
            status=Status.FAIL,       # PASS / FAIL / NEEDS_HUMAN
            file=file_path,
            line=H.line_of(css, m.start(), offset),
            snippet=...,
            message=...,
            fix_suggestion=...,       # FAIL/NEEDS_HUMAN 必填
        ))
    return results
```

### 命名約定

| 元素 | 約定 | 範例 |
|------|------|------|
| 檔名 | `<CODE>.py` | `CS2140401C.py` |
| `metadata["code"]` | 必須等於檔名 | `"CS2140401C"` |
| 私有 helper | 底線開頭，runner 跳過 | `_helpers.py` |
| 共用工具 | 放在 `_helpers.py` | `extract_style`, `line_of`, `attr` |

## E 碼（瀏覽器）與 C 碼（靜態）的並行架構

| 項目 | E 碼（運行期） | C 碼（靜態） |
|------|---------------|--------------|
| 語言 | JavaScript（Playwright）| Python |
| 模組目錄 | `scripts/e_code_tests/` | `scripts/twaa/c_code_tests/` |
| 主控器 | `scripts/e_code_runner.js` | `scripts/twaa/c_code_runner.py` |
| 模組數量 | 209 個獨立檔 | 17 個（持續成長中） |
| 模組契約 | `export {check, metadata}` | `metadata = {}; def check()` |
| 執行對象 | URL（瀏覽器渲染後 DOM） | 檔案路徑 + 內容（原始碼） |
| 等級篩選 | 依 `metadata.code[2]` (1/2/3) | 依 `metadata["level"]` |

兩個架構**完全對稱**，各自處理「規範可機械驗證的部分」中適合自己工具的檢測碼。

## 何時新增 C 碼模組

### 觸發條件

- 官方規範（FreeGo 平台或 MODA 公告）新增/修訂某條 C 碼
- 退件意見指向某個尚未實作的檢測碼
- 既有 informal 描述性檢查（如 `check_img_alt`）的對應官方 C 碼被釐清

### 新增步驟

```bash
# 1. 用 lookup 確認碼的詳細資訊（criterion, level, category）
python scripts/lookup_checkcode.py HM1410200C

# 2. 建立檔案 c_code_tests/HM1410200C.py，依模組契約撰寫

# 3. 立即可用（runner 自動發現，不必改任何其他檔）
python -m twaa.c_code_runner --check Foo.vue --level A

# 4. 確認新碼出現在列表
python -m twaa.c_code_runner --list | grep HM1410200C
```

### 過渡期：legacy `checkers/` 模組

目前 `checkers/html_rules.py` 仍含 21 個非 C 碼的描述性檢查（如 `check_img_alt`），
這些對應 informal rule name（如 `WCAG-1.1.1`）。長期目標：

1. 釐清每個 informal 檢查對應的官方 C 碼
2. 一一升級為 `c_code_tests/<CODE>.py` 獨立模組
3. 從 `html_rules.py` 移除已升級的函式
4. 最終 `html_rules.py` 完全清空

`check_file.py` 在過渡期同時呼叫兩套：先 c_code_runner（正式 C 碼），再 legacy helpers（過渡規則）。
**新增規則一律走 c_code_tests/，不再寫進 legacy 模組。**

## 補充靜態檢查（supplementary_tests/）

官方 110.07 規範中，**多個成功準則標示「相關檢測碼:(無)」**，意即沒有靜態 C 碼，
全靠運行時 E 碼或人工檢查。但實務上，許多此類準則仍可靜態偵測常見違規模式。

`supplementary_tests/` 目錄收錄這些補充檢查：

| 模組檔名 | 對應準則 | 偵測內容 |
|---------|---------|---------|
| `WCAG_1_3_4.py` | 1.3.4 螢幕方向 | CSS orientation media query 鎖定 / viewport user-scalable=no |
| `WCAG_1_3_5.py` | 1.3.5 識別輸入目的 | 個人資訊欄位（name/email/tel）缺 autocomplete |
| `WCAG_1_4_2.py` | 1.4.2 音訊控制 | audio/video 有 autoplay 但缺 controls |
| `WCAG_1_4_10.py` | 1.4.10 流動排版 | viewport meta maximum-scale<2 或 user-scalable=no |
| `WCAG_2_1_1.py` | 2.1.1 鍵盤 | div/span 帶 click 缺鍵盤事件或 tabindex |
| `WCAG_2_4_1.py` | 2.4.1 跳過區塊 | 頁面缺 skip link |
| `WCAG_2_4_3.py` | 2.4.3 焦點順序 | tabindex 為正值（破壞自然順序）|
| `WCAG_2_4_4.py` | 2.4.4 鏈結目的 | 連結文字「按這裡」「more」等無語意 |
| `WCAG_4_1_1.py` | 4.1.1 語法分析 | id 重複 |
| `WCAG_4_1_3.py` | 4.1.3 狀態訊息 | class 含 error/alert 但缺 aria-live |

**這些不是官方 MODA C 碼**，標章審查不會用。但對開發階段抓出問題很有幫助，
也滿足「每個可靜態檢測的規則都應該有獨立檢查方法」的原則。

模組契約與 `c_code_tests/` 完全相同：
- `metadata['code']` 為 `WCAG-x.y.z` 格式
- `metadata['informal'] = True` 標記非官方碼
- 檔名為 `WCAG_x_y_z.py`（檔案系統不允許 `.`，故用底線）

報告產出時，這些 informal 規則會以 `WCAG-` 前綴與官方 C 碼明顯區分，
審查員與開發者皆能一眼看出哪些是標章必修、哪些是品質提示。

## 例外：axe-core 不適用此原則

`axe-core` 是國際標準的 npm 套件，含約 80 條 WCAG 機械可驗證規則。
不重新實作 axe，原因：

1. axe 規則由國際社群維護，自動跟隨 WCAG 更新
2. 重做為 wrapper 是反模式，徒增維護成本
3. axe 結果已對應到 `WCAG-x.y.z` 命名空間，足以追溯

`browser_rules.js` 中的 axe 整合保留為單一檔，這是經過深思的例外。

## 模組品質檢核

任何新加入 `c_code_tests/` 的模組，提交前自我檢查：

- [ ] 檔名等於 `metadata["code"]`
- [ ] `metadata` 包含全部必填欄位（code、criterion、level、category、rule、applies_to）
- [ ] `check(file_path, content)` 簽章正確
- [ ] 失敗時 CheckResult 有 `fix_suggestion`（給審查員與開發者明確指引）
- [ ] `applies_to` 限制了副檔名（避免不必要呼叫）
- [ ] 用 `python -m twaa.c_code_runner --list` 能看到新碼
- [ ] 用 `python -m twaa.c_code_runner --check <known-failing-file>` 能正確標記
