"""c_code_runner.py — 動態載入並執行所有 C 碼靜態檢查模組。

對應 e_code_runner.js 的 209 個 E 碼瀏覽器測試模組架構，
本檔負責掃描 c_code_tests/ 目錄，動態 import 所有 <CODE>.py 模組，
並對指定檔案/內容呼叫每個模組的 check() 函式。

依照 SKILL.md 第四不可違背原則：「一碼一檔，主程序動態呼叫」。

使用方式：
    from twaa.c_code_runner import load_all_c_codes, run_for_file

    modules = load_all_c_codes(level="AA")        # 列出所有 AA 等級的 C 碼
    results = run_for_file("Foo.vue", content, level="AA")
"""
from __future__ import annotations
import importlib
import sys
import traceback
from pathlib import Path
from .checkers.result import CheckResult, Status

_TESTS_DIR = Path(__file__).parent / "c_code_tests"

# 等級包含關係：A ⊂ AA ⊂ AAA
_LEVEL_INCLUDES = {
    "A": {"A"},
    "AA": {"A", "AA"},
    "AAA": {"A", "AA", "AAA"},
}


def _module_files() -> list[Path]:
    """列出 c_code_tests/ 中所有有效的 C 碼模組檔（排除底線開頭與 __init__）。"""
    if not _TESTS_DIR.exists():
        return []
    return sorted(
        p for p in _TESTS_DIR.glob("*.py")
        if not p.stem.startswith("_") and p.stem != "__init__"
    )


def load_all_c_codes(level: str = "AAA") -> list:
    """動態載入所有 C 碼測試模組。

    Args:
        level: 篩選等級。"A" 只載入 A 級；"AA" 載入 A+AA；"AAA" 載入全部。

    Returns:
        list of modules，每個模組都有 .check() 與 .metadata。
    """
    allowed = _LEVEL_INCLUDES.get(level, _LEVEL_INCLUDES["AAA"])
    modules = []
    for py in _module_files():
        mod_name = f"twaa.c_code_tests.{py.stem}"
        try:
            mod = importlib.import_module(mod_name)
        except Exception as exc:
            print(f"[c_code_runner] 載入失敗 {mod_name}: {exc}", file=sys.stderr)
            continue
        if not hasattr(mod, "check") or not hasattr(mod, "metadata"):
            print(f"[c_code_runner] 跳過 {mod_name}（缺 check 或 metadata）", file=sys.stderr)
            continue
        if mod.metadata.get("level") not in allowed:
            continue
        modules.append(mod)
    return modules


def _file_ext(path: str) -> str:
    return path.rsplit(".", 1)[-1].lower() if "." in path else ""


def run_for_file(
    file_path: str,
    content: str,
    level: str = "AA",
    modules: list | None = None,
) -> list[CheckResult]:
    """對單一檔案執行所有適用 C 碼。

    Args:
        file_path: 檔案路徑（決定該檔適用哪些 C 碼）
        content: 檔案內容
        level: A / AA / AAA
        modules: 可選的預載模組清單（避免每檔重新 import）

    Returns:
        list of CheckResult。執行錯誤的模組會回 NEEDS_HUMAN 結果。
    """
    if modules is None:
        modules = load_all_c_codes(level=level)
    ext = _file_ext(file_path)
    results: list[CheckResult] = []
    for mod in modules:
        applies = mod.metadata.get("applies_to", ())
        if applies and ext not in applies:
            continue
        try:
            r = mod.check(file_path, content)
            results.extend(r or [])
        except Exception as exc:
            tb = traceback.format_exc(limit=3)
            results.append(CheckResult(
                code=mod.metadata.get("code", "ERR-RUNNER"),
                rule="模組執行失敗（runner 已捕捉）",
                status=Status.NEEDS_HUMAN,
                file=file_path,
                message=f"{type(exc).__name__}: {exc}",
                fix_suggestion=f"檢查 c_code_tests/{mod.metadata.get('code')}.py 是否有 bug\n{tb}",
            ))
    return results


def list_all() -> dict:
    """列出所有已實作 C 碼，依等級分組。供 CLI / 文件使用。"""
    by_level: dict[str, list[dict]] = {"A": [], "AA": [], "AAA": []}
    for mod in load_all_c_codes(level="AAA"):
        meta = mod.metadata
        lv = meta.get("level", "?")
        if lv in by_level:
            by_level[lv].append(meta)
    return by_level


# CLI 入口：python -m twaa.c_code_runner --list
if __name__ == "__main__":
    import argparse, json
    ap = argparse.ArgumentParser(description="TWAA C 碼動態檢查器")
    ap.add_argument("--list", action="store_true", help="列出所有已實作 C 碼")
    ap.add_argument("--level", default="AA", choices=["A", "AA", "AAA"])
    ap.add_argument("--check", help="對指定檔案執行檢查")
    args = ap.parse_args()

    if args.list:
        groups = list_all()
        for lv in ("A", "AA", "AAA"):
            print(f"\n【等級 {lv}】共 {len(groups[lv])} 個 C 碼")
            for meta in groups[lv]:
                print(f"  {meta['code']:14s}  {meta['criterion']:6s}  {meta['rule']}")
        total = sum(len(v) for v in groups.values())
        print(f"\n合計：{total} 個 C 碼")
    elif args.check:
        path = Path(args.check)
        if not path.exists():
            print(f"檔案不存在：{path}", file=sys.stderr)
            sys.exit(1)
        text = path.read_text(encoding="utf-8", errors="replace")
        rs = run_for_file(str(path), text, level=args.level)
        print(json.dumps([r.to_dict() for r in rs], ensure_ascii=False, indent=2))
    else:
        ap.print_help()
