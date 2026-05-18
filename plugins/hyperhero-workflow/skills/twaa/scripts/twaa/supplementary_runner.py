"""supplementary_runner.py — 動態載入並執行 supplementary_tests 中所有 informal WCAG 模組。

對應 c_code_runner.py 的設計，但載入 supplementary_tests/ 下的 WCAG_x_y_z.py 模組。
這些模組的 metadata['code'] 為「WCAG-x.y.z」格式（informal，非官方 C 碼編號）。

依「一碼一檔」原則：
  - 官方 C 碼（HM/CS/ME 前綴）→ c_code_tests/<CODE>.py
  - 補充 WCAG 規則（無對應 C 碼）→ supplementary_tests/WCAG_x_y_z.py
"""
from __future__ import annotations
import importlib
import sys
import traceback
from pathlib import Path
from .checkers.result import CheckResult, Status

_TESTS_DIR = Path(__file__).parent / "supplementary_tests"

_LEVEL_INCLUDES = {
    "A": {"A"},
    "AA": {"A", "AA"},
    "AAA": {"A", "AA", "AAA"},
}


def _module_files() -> list[Path]:
    if not _TESTS_DIR.exists():
        return []
    return sorted(
        p for p in _TESTS_DIR.glob("*.py")
        if not p.stem.startswith("_") and p.stem != "__init__"
    )


def load_all_supplementary(level: str = "AAA") -> list:
    """動態載入所有 supplementary 模組。"""
    allowed = _LEVEL_INCLUDES.get(level, _LEVEL_INCLUDES["AAA"])
    modules = []
    for py in _module_files():
        mod_name = f"twaa.supplementary_tests.{py.stem}"
        try:
            mod = importlib.import_module(mod_name)
        except Exception as exc:
            print(f"[supplementary_runner] 載入失敗 {mod_name}: {exc}", file=sys.stderr)
            continue
        if not hasattr(mod, "check") or not hasattr(mod, "metadata"):
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
    if modules is None:
        modules = load_all_supplementary(level=level)
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
                code=mod.metadata.get("code", "ERR-SUPP"),
                rule="補充模組執行失敗",
                status=Status.NEEDS_HUMAN,
                file=file_path,
                message=f"{type(exc).__name__}: {exc}",
                fix_suggestion=f"檢查 supplementary_tests/{Path(mod.__file__).name}：\n{tb}",
            ))
    return results


def list_all() -> list[dict]:
    return [m.metadata for m in load_all_supplementary(level="AAA")]


if __name__ == "__main__":
    import argparse, json
    ap = argparse.ArgumentParser(description="TWAA 補充靜態檢查器（informal WCAG）")
    ap.add_argument("--list", action="store_true")
    ap.add_argument("--level", default="AA", choices=["A", "AA", "AAA"])
    ap.add_argument("--check", help="對指定檔案執行檢查")
    args = ap.parse_args()

    if args.list:
        metas = list_all()
        print(f"已實作補充規則：{len(metas)} 個\n")
        for m in metas:
            print(f"  {m['code']:14s}  {m['criterion']:6s}  [{m['level']}]  {m['rule']}")
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
