"""check_file.py — TWAA 逐檔全工具檢測主控器

使用方式：
  python -m twaa.check_file path/to/Component.vue --level AA
  python -m twaa.check_file frontend/src/ --level AA --ext .vue,.css,.scss
  python -m twaa.check_file frontend/ --level AA --json report.json
  python -m twaa.check_file frontend/ --level AAA --no-needs-human  # 只看 fail

流程（每個檔案）：
  1. 依副檔名決定適用工具（HTML 規則 / CSS 規則）
  2. 全部工具執行完畢後彙整
  3. 不暫停——全部跑完後輸出完整報告
  4. 每個 FAIL 和 NEEDS_HUMAN 均附修復建議
"""
from __future__ import annotations

import argparse
import io
import json
import sys
from datetime import datetime
from pathlib import Path

sys.stdout = io.TextIOWrapper(sys.stdout.buffer, encoding="utf-8", errors="replace")

def _now() -> str:
    return datetime.now().strftime("%Y-%m-%d %H:%M:%S")

def _stamp() -> str:
    """檔名用時間戳，格式 20260505_1130"""
    return datetime.now().strftime("%Y%m%d_%H%M")

def _dated_path(path: Path) -> Path:
    """在副檔名前插入時間戳，例如 report.json → report_20260505_1130.json"""
    stamp = _stamp()
    return path.with_name(f"{path.stem}_{stamp}{path.suffix}")

_RED    = "\033[31m"
_GREEN  = "\033[32m"
_YELLOW = "\033[33m"
_CYAN   = "\033[36m"
_BOLD   = "\033[1m"
_DIM    = "\033[2m"
_RESET  = "\033[0m"

_LEVEL_DIGIT = {"A": {"1"}, "AA": {"1", "2"}, "AAA": {"1", "2", "3"}}
EXAMPLES_REL = "references/examples"   # 相對於 skill 根目錄


def _code_level_digit(code: str) -> str:
    try:
        return code[2]
    except IndexError:
        return "?"


_C_CODE_MODULES_CACHE: list | None = None
_SUPP_MODULES_CACHE: list | None = None


def _get_c_code_modules(level: str) -> list:
    """快取 c_code_runner 模組載入結果。"""
    global _C_CODE_MODULES_CACHE
    if _C_CODE_MODULES_CACHE is None:
        from twaa.c_code_runner import load_all_c_codes
        _C_CODE_MODULES_CACHE = load_all_c_codes(level=level)
    return _C_CODE_MODULES_CACHE


def _get_supp_modules(level: str) -> list:
    """快取 supplementary_runner 模組載入結果。"""
    global _SUPP_MODULES_CACHE
    if _SUPP_MODULES_CACHE is None:
        from twaa.supplementary_runner import load_all_supplementary
        _SUPP_MODULES_CACHE = load_all_supplementary(level=level)
    return _SUPP_MODULES_CACHE


def _check_single_file(
    filepath: Path,
    level: str,
    include_needs_human: bool,
) -> list[dict]:
    """對單一檔案執行三層檢查（皆遵循「一碼一檔」原則）：
    1. c_code_runner — 29 個官方 C 碼（HM/CS/ME 前綴）— 標章審查依據
    2. supplementary_runner — 10 個 informal WCAG 補充檢查（無對應 C 碼編號的可靜態檢測項）
    3. legacy needs_human_runtime_checks — 列出無法靜態驗證的 WCAG 準則供人工檢查
    """
    from twaa.c_code_runner import run_for_file as run_c
    from twaa.supplementary_runner import run_for_file as run_supp
    from twaa.checkers.html_rules import check_html  # legacy: needs_human listing only

    content = filepath.read_text(encoding="utf-8", errors="replace")
    suffix = filepath.suffix.lower()
    allowed = _LEVEL_DIGIT.get(level, _LEVEL_DIGIT["AA"])
    results: list[dict] = []

    # 1) c_code_runner — 一碼一檔 官方 C 碼
    for r in run_c(str(filepath), content, level=level, modules=_get_c_code_modules(level)):
        d = r.to_dict()
        if not d.get("file"):
            d["file"] = str(filepath)
        results.append(d)

    # 2) supplementary_runner — 一碼一檔 informal WCAG 補強
    for r in run_supp(str(filepath), content, level=level, modules=_get_supp_modules(level)):
        d = r.to_dict()
        if not d.get("file"):
            d["file"] = str(filepath)
        results.append(d)

    # 3) Legacy needs_human 列表（無法靜態驗證的 WCAG 準則）
    if suffix in {".vue", ".html", ".htm"} and include_needs_human:
        for r in check_html(str(filepath), content, include_needs_human=True):
            if r.status.value == "needs_human" or r.code.startswith("WCAG"):
                results.append(r.to_dict())

    return results


def run(
    targets: list[Path],
    level: str = "AA",
    include_needs_human: bool = True,
    json_out: Path | None = None,
) -> dict:
    all_results: list[dict] = []
    file_summaries: list[dict] = []
    stats = {"files": 0, "files_with_fail": 0, "total_fail": 0, "total_needs_human": 0, "total_pass": 0}

    for fp in targets:
        stats["files"] += 1
        results = _check_single_file(fp, level, include_needs_human)
        for r in results:
            if not r.get("file"):
                r["file"] = str(fp)
        all_results.extend(results)

        fails   = [r for r in results if r["status"] == "fail"]
        humans  = [r for r in results if r["status"] == "needs_human"]
        passes  = [r for r in results if r["status"] == "pass"]

        stats["total_fail"]         += len(fails)
        stats["total_needs_human"]  += len(humans)
        stats["total_pass"]         += len(passes)
        if fails:
            stats["files_with_fail"] += 1

        file_summaries.append({
            "file": str(fp),
            "fail": len(fails),
            "needs_human": len(humans),
            "pass": len(passes),
        })

    # ── 終端報告 ──────────────────────────────────────────────────────────────
    report_time = _now()
    stats["report_time"] = report_time
    print(f"\n{_BOLD}{'═'*68}{_RESET}")
    print(f"{_BOLD} TWAA 無障礙檢測報告  |  等級：{level}  |  共 {stats['files']} 個檔案{_RESET}")
    print(f"{_BOLD} 檢測時間：{report_time}{_RESET}")
    print(f"{'═'*68}{_RESET}")

    # 逐檔概覽
    print(f"\n{_BOLD}▌ 逐檔概覽{_RESET}")
    for s in file_summaries:
        rel = Path(s["file"]).name
        status_sym = (
            f"{_RED}✗ FAIL {s['fail']}{_RESET}" if s["fail"]
            else f"{_GREEN}✓ PASS{_RESET}"
        )
        human_note = f" {_YELLOW}({s['needs_human']} 需人工){_RESET}" if s["needs_human"] else ""
        print(f"  {status_sym}  {rel}{human_note}")

    # ── 詳細失敗：「單一頁面 → 全部規則」格式 ──────────────────────────────────
    # 原則：先完整列出一個頁面/檔案的所有問題，再換下一個
    # 而非「一個規則 → 所有頁面」，後者無法反映單一頁面的真正問題全貌
    try:
        from twaa.parse_examples import get_db
        example_db = get_db()
    except Exception:
        example_db = None

    fails_all = [r for r in all_results if r["status"] == "fail"]
    if fails_all:
        print(f"\n{_BOLD}▌ 未達標明細 — 單一頁面/檔案列出全部問題（共 {len(fails_all)} 項）{_RESET}")
        print(f"  {_DIM}格式：[頁面/檔案] → 該頁所有未達標項目（含稽核評量碼）{_RESET}")

        # 依頁面/檔案分組（維持 check 順序）
        by_file: dict[str, list[dict]] = {}
        for r in fails_all:
            key = r.get("url") or r.get("file", "?")
            by_file.setdefault(key, []).append(r)

        for page_key, items in by_file.items():
            label = Path(page_key).name if not page_key.startswith("http") else page_key
            lvl_a  = sum(1 for r in items if r.get("code","?")[2:3] == "1")
            lvl_aa = sum(1 for r in items if r.get("code","?")[2:3] == "2")
            print(f"\n  {_CYAN}{'─'*60}{_RESET}")
            print(f"  {_BOLD}{_CYAN}📄 {label}{_RESET}  {_DIM}（{len(items)} 項：🔴A={lvl_a} 🟡AA={lvl_aa}）{_RESET}")
            if page_key != label:
                print(f"  {_DIM}{page_key}{_RESET}")

            for idx, r in enumerate(items, start=1):
                code = r.get("code", "?")
                rule = r.get("rule", "")
                loc  = f":{r['line']}" if r.get("line") else ""
                lv_icon = {"1": "🔴", "2": "🟡", "3": "🔵"}.get(code[2:3], "⚪") if len(code) > 2 else "⚪"
                print(f"\n    {idx}. {lv_icon} {_RED}[{code}]{_RESET} {rule}")
                if r.get("snippet"):
                    print(f"       未達標內容：{_DIM}{r['snippet'][:70]}{_RESET}{loc}")
                if r.get("message"):
                    print(f"       問題說明：{r['message']}")
                # 官方稽核評量碼資訊
                if example_db:
                    info = example_db.get(code)
                    if info:
                        if info.rule_desc:
                            print(f"       {_DIM}稽核規則：{info.rule_desc[:100]}{_RESET}")
                        if info.images:
                            img_dir = info.images[0].abs_path.parent.name
                            print(f"       {_DIM}參考圖片：references/images/{img_dir}/  →  {EXAMPLES_REL}/{code}.md{_RESET}")
                if r.get("fix_suggestion"):
                    lines_fix = r["fix_suggestion"].splitlines()
                    for fi, fl in enumerate(lines_fix[:3]):
                        prefix = "       修改建議：" if fi == 0 else "               "
                        print(f"{_GREEN}{prefix}{fl}{_RESET}")

    # 需人工確認
    humans_all = [r for r in all_results if r["status"] == "needs_human"]
    if humans_all and include_needs_human:
        print(f"\n{_BOLD}▌ 需人工驗證（共 {len(humans_all)} 項）{_RESET}")
        for r in humans_all:
            print(f"  {_YELLOW}? [{r['code']}]{_RESET} {r['rule']}")
            if r.get("fix_suggestion"):
                print(f"      驗收方法：{_DIM}{r['fix_suggestion']}{_RESET}")

    # 摘要
    print(f"\n{'─'*68}")
    print(
        f"{_BOLD}總計{_RESET}  "
        f"失敗：{_RED}{stats['total_fail']}{_RESET}  "
        f"需人工：{_YELLOW}{stats['total_needs_human']}{_RESET}  "
        f"含失敗檔案數：{_RED}{stats['files_with_fail']}/{stats['files']}{_RESET}  "
        f"{_DIM}({report_time}){_RESET}"
    )
    if stats["total_fail"] == 0:
        print(f"{_GREEN}✅ 靜態規則全部通過！{_RESET}")
    print()

    # JSON 報告
    if json_out:
        report = {
            "report_time": report_time,
            "level": level,
            "stats": stats,
            "file_summaries": file_summaries,
            "results": all_results,
        }
        json_out.write_text(
            json.dumps(report, indent=2, ensure_ascii=False), encoding="utf-8"
        )
        print(f"JSON 報告已寫入：{json_out}  （{report_time}）")

    return stats


def _collect_files(paths: list[str], extensions: set[str]) -> list[Path]:
    files: list[Path] = []
    for p_str in paths:
        p = Path(p_str)
        if p.is_file():
            if p.suffix.lower() in extensions:
                files.append(p)
        elif p.is_dir():
            for ext in extensions:
                files.extend(sorted(p.rglob(f"*{ext}")))
    return [
        f for f in files
        if "node_modules" not in f.parts
        and "dist" not in f.parts
        and ".cache" not in f.parts
    ]


def main() -> None:
    ap = argparse.ArgumentParser(description="TWAA 逐檔全工具無障礙檢測主控器")
    ap.add_argument("targets", nargs="+", help="要檢測的檔案或目錄")
    ap.add_argument("--level", choices=["A", "AA", "AAA"], default="AA")
    ap.add_argument("--ext", default=".vue,.html,.css,.scss",
                    help="要檢測的副檔名（逗號分隔）")
    ap.add_argument("--json", metavar="FILE", help="輸出 JSON 報告路徑")
    ap.add_argument("--no-needs-human", action="store_true",
                    help="報告中省略 NEEDS_HUMAN 項目")
    ap.add_argument("--browser-url", metavar="URL",
                    help="靜態掃描完後，再對此 URL 執行瀏覽器自動化測試（需伺服器正在運行）")
    ap.add_argument("--browser-timeout", type=int, default=30000,
                    help="瀏覽器測試逾時 ms（預設 30000）")
    ap.add_argument("--fix-plan", metavar="FILE", default=None,
                    help="產出修復計劃 md（例如 twaa-fix-plan.md），包含官方稽核評量碼說明與參考圖片")
    args = ap.parse_args()

    extensions = {
        e.strip() if e.strip().startswith(".") else f".{e.strip()}"
        for e in args.ext.split(",")
    }
    files = _collect_files(args.targets, extensions)
    if not files:
        print(f"{_RED}找不到符合條件的檔案。{_RESET}")
        sys.exit(1)

    print(f"找到 {len(files)} 個檔案，等級：{args.level}")

    json_out      = _dated_path(Path(args.json))      if args.json      else None
    fix_plan_out  = _dated_path(Path(args.fix_plan))  if args.fix_plan  else None

    all_results_for_plan: list[dict] = []

    stats = run(
        files,
        level=args.level,
        include_needs_human=not args.no_needs_human,
        json_out=None,
    )

    # Phase 3：瀏覽器自動化（若有提供 URL）
    browser_stats = {}
    if args.browser_url:
        print(f"\n{_BOLD}{'═'*68}{_RESET}")
        print(f"{_BOLD}Phase 3 — 瀏覽器自動化測試{_RESET}（{args.browser_url}）")
        from twaa.check_browser import run as run_browser
        browser_stats = run_browser(
            [args.browser_url],
            level=args.level,
            timeout=args.browser_timeout,
            json_out=None,
        )
        stats["browser_fail"] = browser_stats.get("total_fail", 0)
        stats["browser_needs_human"] = browser_stats.get("total_needs_human", 0)

    # 收集所有結果以便產生 JSON 和修復計劃
    # 重新執行一次收集（輕量，不再印終端）
    for fp in _collect_files(args.targets, extensions):
        results = _check_single_file(fp, args.level, not args.no_needs_human)
        for r in results:
            if not r.get("file"):
                r["file"] = str(fp)
        all_results_for_plan.extend(results)

    if json_out:
        report = {
            "report_time": stats.get("report_time", _now()),
            "level": args.level,
            "stats": stats,
            "results": all_results_for_plan,
        }
        json_out.write_text(
            json.dumps(report, indent=2, ensure_ascii=False), encoding="utf-8"
        )
        print(f"\nJSON 報告已寫入：{json_out}  （{report['report_time']}）")

    # 修復計劃 md
    if fix_plan_out:
        from twaa.generate_fix_plan import generate_fix_plan
        project_name = str(args.targets[0]) if args.targets else "TWAA 專案"
        plan_time = stats.get("report_time", _now())
        md = generate_fix_plan(
            all_results_for_plan,
            project_name=project_name,
            level=args.level,
            report_date=plan_time,
        )
        fix_plan_out.write_text(md, encoding="utf-8")
        print(f"\n修復計劃已產生：{fix_plan_out}  （{plan_time}）")

    total_fail = stats.get("total_fail", 0) + browser_stats.get("total_fail", 0)
    if total_fail > 0:
        sys.exit(1)


if __name__ == "__main__":
    main()
