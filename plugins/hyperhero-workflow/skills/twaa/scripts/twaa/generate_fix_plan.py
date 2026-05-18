"""generate_fix_plan.py -- 從 TWAA 檢測報告產生修復計劃 Markdown

報告格式原則：
  「單一頁面 → 該頁面全部未達標項目」

  每一個頁面/檔案獨立一節，列出：
    - 未達標內容（問題描述 + 程式碼片段）
    - 對應稽核評量碼（台灣 MODA 官方碼）
    - 官方規則說明
    - 修改建議
    - 參考圖片（來自 references/examples/）

  這樣才能真實反映「該頁面的問題全貌」，而非單一規則橫跨多頁。

用法：
  python -m twaa.generate_fix_plan report.json -o fix-plan.md
  python -m twaa.generate_fix_plan combined-report.json
"""
from __future__ import annotations

import argparse
import io
import json
import sys
from collections import defaultdict
from datetime import datetime
from pathlib import Path
from os.path import basename

from twaa.parse_examples import get_db, ExampleInfo


EXAMPLES_REL = "../references/examples"
IMAGES_REL   = "../references/images"

LEVEL_ICON = {"A": "🔴", "AA": "🟡", "AAA": "🔵", "?": "⚪"}


# ── 輔助函式 ──────────────────────────────────────────────────────────────────

def _code_to_level(code: str) -> str:
    if len(code) < 3:
        return "?"
    return {"1": "A", "2": "AA", "3": "AAA"}.get(code[2], "?")


def _level_order(code: str) -> int:
    return {"A": 0, "AA": 1, "AAA": 2, "?": 3}.get(_code_to_level(code), 3)


def _page_key(r: dict) -> str:
    """取頁面識別鍵：URL 或檔案路徑"""
    return r.get("url") or r.get("file") or "（未知頁面）"


def _page_label(key: str) -> str:
    """從路徑或 URL 取人類可讀標籤"""
    if key.startswith("http"):
        return key
    return basename(key)


def _group_by_page(results: list[dict]) -> dict[str, list[dict]]:
    """依頁面（URL 或檔案）分組，每頁內依等級排序"""
    pages: dict[str, list[dict]] = defaultdict(list)
    for r in results:
        if r.get("status") != "fail":
            continue
        pages[_page_key(r)].append(r)
    # 每頁內部依等級排序 (A 優先)
    for key in pages:
        pages[key].sort(key=lambda r: _level_order(r.get("code", "?")))
    return dict(pages)


def _render_issue(r: dict, idx: int, db) -> str:
    """渲染單一問題條目（頁面內的子項）"""
    code    = r.get("code", "未知")
    rule    = r.get("rule", "")
    message = r.get("message", "")
    fix     = r.get("fix_suggestion", "")
    snippet = r.get("snippet", "")
    line    = r.get("line", 0)
    level   = _code_to_level(code)
    icon    = LEVEL_ICON.get(level, "⚪")

    info: ExampleInfo | None = db.get(code)

    lines = [f"#### {idx}. {icon} `{code}` — {rule}"]
    lines.append("")

    # 問題描述
    if message:
        lines.append(f"**未達標內容：** {message}")
    if snippet:
        lines.append(f"\n```\n{snippet}\n```")
    if line:
        lines.append(f"**位置：** 第 {line} 行")

    # 稽核評量碼說明
    lines.append(f"\n**稽核評量碼：** `{code}`")
    if info:
        if info.criterion:
            lines.append(f"**對應成功準則：** {info.criterion}（等級 {info.level}）")
        if info.message:
            lines.append(f"**規則訊息：** {info.message}")

    # 官方規則說明
    if info and info.rule_desc:
        short = info.rule_desc[:250].replace("\n", " ")
        lines.append(f"\n**官方規則說明：**\n> {short}")

    # 稽核步驟
    if info and info.steps:
        lines.append(f"\n**稽核步驟（官方）：**")
        for step_line in info.steps[:300].splitlines():
            lines.append(f"> {step_line}")

    # 修改建議
    lines.append(f"\n**修改建議：**")
    if fix:
        for fl in fix.strip().splitlines():
            lines.append(f"- {fl}")
    elif info and info.steps:
        lines.append(f"- 依上方稽核步驟確認後修正")

    # 參考圖片（最多 2 張）
    if info and info.images:
        lines.append(f"\n**參考圖片（`{code}` 官方範例）：**")
        for img in info.images[:2]:
            if img.exists and img.caption:
                img_path = f"{IMAGES_REL}/{img.abs_path.parent.name}/{img.abs_path.name}"
                lines.append(f"\n![{code} 範例圖{img.index}]({img_path})")
                lines.append(f"> 📌 {img.caption[:180]}")

    # 稽核評量碼參考文件
    if info:
        lines.append(f"\n📄 **稽核評量碼完整說明：** `{EXAMPLES_REL}/{code}.md`")

    lines.append("\n---")
    return "\n".join(lines)


def generate_fix_plan(
    results: list[dict],
    project_name: str = "TWAA 無障礙檢測",
    level: str = "AA",
    report_date: str | None = None,
) -> str:
    """產生「單頁 → 全規則」格式的修復計劃 Markdown"""
    db = get_db()
    date_str = report_date or datetime.now().strftime("%Y-%m-%d %H:%M")

    fails = [r for r in results if r.get("status") == "fail"]
    pages = _group_by_page(fails)

    # 全域統計
    total_issues = sum(len(v) for v in pages.values())
    by_level: dict[str, int] = {}
    for r in fails:
        lv = _code_to_level(r.get("code", "?"))
        by_level[lv] = by_level.get(lv, 0) + 1

    # ── 標頭 ─────────────────────────────────────────────────────────────────
    doc = [
        "# TWAA 無障礙修復計劃",
        "",
        f"**專案：** {project_name}",
        f"**檢測等級：** {level}",
        f"**產生時間：** {date_str}",
        f"**工具：** TWAA 自動化檢測系統（靜態 + Playwright 瀏覽器）",
        "",
        "---",
        "",
        "## 說明",
        "",
        "本報告採用「**單一頁面 → 該頁面全部未達標項目**」的編排方式，",
        "每一節對應一個頁面或檔案，列出所有未通過規則，以反映該頁面的真正問題全貌。",
        "",
        "每項問題包含：",
        "- 未達標內容（問題描述）",
        "- 台灣 MODA 官方稽核評量碼",
        "- 官方規則說明與稽核步驟",
        "- 修改建議與參考圖片",
        "",
        "---",
        "",
        "## 摘要",
        "",
        f"| 等級 | 問題數 | 說明 |",
        f"|------|--------|------|",
        f"| 🔴 A（高優先） | {by_level.get('A', 0)} | 必須通過，影響基本可及性 |",
        f"| 🟡 AA（中優先） | {by_level.get('AA', 0)} | 標章申請必要條件 |",
        f"| 🔵 AAA（低優先） | {by_level.get('AAA', 0)} | 最佳化建議 |",
        f"| **合計** | **{total_issues}** | 涉及 **{len(pages)}** 個頁面/檔案 |",
        "",
        "---",
        "",
    ]

    # ── 逐頁輸出 ─────────────────────────────────────────────────────────────
    for page_num, (page_key, issues) in enumerate(pages.items(), start=1):
        label = _page_label(page_key)
        a_cnt  = sum(1 for r in issues if _code_to_level(r.get("code","?")) == "A")
        aa_cnt = sum(1 for r in issues if _code_to_level(r.get("code","?")) == "AA")

        doc.append(f"## 頁面 {page_num}：{label}")
        doc.append("")
        if page_key.startswith("http"):
            doc.append(f"**URL：** {page_key}")
        else:
            doc.append(f"**檔案：** `{page_key}`")
        doc.append(f"**問題總數：** {len(issues)} 項（🔴 A：{a_cnt}、🟡 AA：{aa_cnt}）")
        doc.append("")
        doc.append("### 未達標項目")
        doc.append("")

        for i, r in enumerate(issues, start=1):
            doc.append(_render_issue(r, i, db))
            doc.append("")

        doc.append("")

    # ── 修復優先順序 ──────────────────────────────────────────────────────────
    if total_issues > 0:
        doc += [
            "---",
            "",
            "## 修復優先順序建議",
            "",
            f"1. **立即修復（🔴 A 等級 {by_level.get('A', 0)} 項）**：影響基本可及性，申請標章前必須全數修復",
            f"2. **標章申請前修復（🟡 AA 等級 {by_level.get('AA', 0)} 項）**：AA 標章要求",
            f"3. **持續改善（🔵 AAA 等級 {by_level.get('AAA', 0)} 項）**：列入後續版本規劃",
            "",
            "---",
            "",
            "*本報告由 TWAA 無障礙自動化檢測技能生成。*",
            "*官方稽核評量碼完整說明：`references/examples/` 目錄*",
        ]

    return "\n".join(doc)


# ── 獨立執行 ─────────────────────────────────────────────────────────────────

def _stamp() -> str:
    return datetime.now().strftime("%Y%m%d_%H%M")

def _dated_path(path: Path) -> Path:
    stamp = _stamp()
    return path.with_name(f"{path.stem}_{stamp}{path.suffix}")


def main():
    sys.stdout = io.TextIOWrapper(sys.stdout.buffer, encoding="utf-8", errors="replace")
    ap = argparse.ArgumentParser(description="從 TWAA JSON 報告產生「單頁→全規則」修復計劃 Markdown")
    ap.add_argument("report", help="JSON 報告路徑")
    ap.add_argument("-o", "--output", default="twaa-fix-plan.md")
    ap.add_argument("--project", default="無障礙檢測專案")
    ap.add_argument("--level", default="AA")
    args = ap.parse_args()

    report_path = Path(args.report)
    if not report_path.exists():
        print(f"找不到報告：{report_path}", file=sys.stderr)
        sys.exit(1)

    data = json.loads(report_path.read_text(encoding="utf-8"))
    results = data if isinstance(data, list) else data.get("results", [])
    level = (data.get("level", args.level) if isinstance(data, dict) else args.level)
    report_date = data.get("report_time") if isinstance(data, dict) else None

    md = generate_fix_plan(results, project_name=args.project, level=level,
                           report_date=report_date)

    out_path = _dated_path(Path(args.output))
    out_path.write_text(md, encoding="utf-8")
    fails = sum(1 for r in results if r.get("status") == "fail")
    pages = len(set(r.get("url") or r.get("file", "?") for r in results if r.get("status") == "fail"))
    print(f"✅ 修復計劃已產生：{out_path}")
    print(f"   {fails} 個問題，涉及 {pages} 個頁面/檔案")


if __name__ == "__main__":
    main()
