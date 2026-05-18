"""check_browser.py — TWAA 瀏覽器自動化測試主控器

透過 Playwright 對指定 URL 執行完整的無障礙瀏覽器測試，
包括 axe-core、DOM 檢查、鍵盤走訪、320px 重排、hover、表單錯誤等。

使用方式：
  python -m twaa.check_browser https://localhost:44301/zh-tw/identity/login
  python -m twaa.check_browser https://example.com/page --level AA
  python -m twaa.check_browser https://... --json report.json

對多個 URL：
  python -m twaa.check_browser --urls-file sitemap.json --level AA --json report.json
"""
from __future__ import annotations

import argparse
import io
import json
import subprocess
import sys
from datetime import datetime
from pathlib import Path

sys.stdout = io.TextIOWrapper(sys.stdout.buffer, encoding="utf-8", errors="replace")

def _now() -> str:
    return datetime.now().strftime("%Y-%m-%d %H:%M:%S")

def _stamp() -> str:
    return datetime.now().strftime("%Y%m%d_%H%M")

def _dated_path(path: Path) -> Path:
    stamp = _stamp()
    return path.with_name(f"{path.stem}_{stamp}{path.suffix}")

_RED    = "\033[31m"
_GREEN  = "\033[32m"
_YELLOW = "\033[33m"
_CYAN   = "\033[36m"
_BOLD   = "\033[1m"
_DIM    = "\033[2m"
_RESET  = "\033[0m"

SCRIPTS_DIR = Path(__file__).resolve().parent.parent
BROWSER_RULES_JS = SCRIPTS_DIR / "browser_rules.js"
BROWSER_E_CODES_JS = SCRIPTS_DIR / "browser_e_codes.js"
E_CODE_RUNNER_JS = SCRIPTS_DIR / "e_code_runner.js"  # 新：209 個 E 碼各別獨立測試


def _run_js(js_path: Path, url: str, level: str, timeout: int) -> list[dict]:
    """執行 JS 腳本並解析 JSON 結果。"""
    cmd = ["node", str(js_path), url, f"--level={level}", f"--timeout={timeout}"]
    try:
        result = subprocess.run(
            cmd,
            capture_output=True,
            text=True,
            encoding="utf-8",
            timeout=timeout // 1000 + 30,
            cwd=str(SCRIPTS_DIR),
        )
        if result.returncode not in (0, 1):
            return [{
                "code": "ERR-NODE",
                "rule": "browser_rules.js 執行失敗",
                "status": "needs_human",
                "message": result.stderr[:500] if result.stderr else "未知錯誤",
                "fix_suggestion": "確認 node 已安裝且 URL 可訪問",
                "details": [],
            }]
        return json.loads(result.stdout)
    except subprocess.TimeoutExpired:
        return [{
            "code": "ERR-TIMEOUT",
            "rule": "瀏覽器測試逾時",
            "status": "needs_human",
            "message": f"URL {url} 在 {timeout}ms 內未回應",
            "fix_suggestion": "確認伺服器正在運行；增加 --timeout 值",
            "details": [],
        }]
    except json.JSONDecodeError as e:
        return [{
            "code": "ERR-JSON",
            "rule": "無法解析測試結果",
            "status": "needs_human",
            "message": str(e),
            "fix_suggestion": "檢查 browser_rules.js 是否有語法錯誤",
            "details": [],
        }]
    except FileNotFoundError:
        return [{
            "code": "ERR-NODE",
            "rule": "找不到 node 執行環境",
            "status": "fail",
            "message": "node 命令不在 PATH 中",
            "fix_suggestion": "安裝 Node.js >= 18 並確認 PATH 設定",
            "details": [],
        }]


def run_browser_rules(url: str, level: str = "AA", timeout: int = 30000) -> list[dict]:
    """呼叫 browser_rules.js（axe-core + 既有規則）。"""
    return _run_js(BROWSER_RULES_JS, url, level, timeout)


def run_browser_e_codes(url: str, level: str = "AA", timeout: int = 30000) -> list[dict]:
    """呼叫 e_code_runner.js — 逐一執行 209 個獨立 E 碼測試模組。

    架構：每個 E 碼一個獨立 JS 檔案（e_code_tests/<CODE>.js），
    主控器動態 import 並逐一呼叫，不靠 AI 判斷，全部用程式碼驗證。
    """
    runner = E_CODE_RUNNER_JS if E_CODE_RUNNER_JS.exists() else BROWSER_E_CODES_JS
    return _run_js(runner, url, level, timeout)


def print_url_report(url: str, results: list[dict]) -> tuple[int, int, int]:
    """印出單一 URL 的報告，回傳 (n_fail, n_needs_human, n_pass)"""
    fails  = [r for r in results if r["status"] == "fail"]
    humans = [r for r in results if r["status"] == "needs_human"]
    passes = [r for r in results if r["status"] == "pass"]

    print(f"\n{_BOLD}{'─'*68}{_RESET}")
    print(f"{_BOLD}URL：{url}{_RESET}")
    status_line = (
        f"  {_RED}✗ {len(fails)} 項失敗{_RESET}" if fails else f"  {_GREEN}✓ 靜態通過{_RESET}"
    )
    if humans:
        status_line += f"  {_YELLOW}({len(humans)} 需人工確認){_RESET}"
    print(status_line)

    # 失敗詳情
    for r in fails:
        print(f"\n  {_RED}✗ [{r['code']}]{_RESET} {r['rule']}")
        if r.get("message"):
            print(f"      問題：{r['message']}")
        if r.get("details"):
            for d in r["details"][:3]:
                print(f"      {_DIM}▸ {d}{_RESET}")
        if r.get("fix_suggestion"):
            for i, line in enumerate(r["fix_suggestion"].splitlines()):
                prefix = "      修復：" if i == 0 else "             "
                print(f"{_GREEN}{prefix}{line}{_RESET}")

    # 需人工確認
    for r in humans:
        print(f"  {_YELLOW}? [{r['code']}]{_RESET} {r['rule']}")
        if r.get("message") and len(r["message"]) < 200:
            print(f"      {_DIM}{r['message']}{_RESET}")
        if r.get("fix_suggestion"):
            print(f"      驗收：{_DIM}{r['fix_suggestion'][:120]}{_RESET}")

    return len(fails), len(humans), len(passes)


def run(
    urls: list[str],
    level: str = "AA",
    timeout: int = 30000,
    json_out: Path | None = None,
) -> dict:
    all_results = []
    stats = {"urls": 0, "urls_with_fail": 0, "total_fail": 0, "total_needs_human": 0}

    for url in urls:
        stats["urls"] += 1
        print(f"\n{_CYAN}🌐 正在測試（Phase 3a - axe-core + 基礎規則）：{url}{_RESET}")
        results_base = run_browser_rules(url, level, timeout)

        print(f"{_CYAN}🌐 正在測試（Phase 3b - 209 個稽核評量碼）：{url}{_RESET}")
        results_e = run_browser_e_codes(url, level, timeout)

        results = results_base + results_e
        for r in results:
            r.setdefault("url", url)
        all_results.extend(results)

        n_fail, n_human, n_pass = print_url_report(url, results)
        stats["total_fail"]        += n_fail
        stats["total_needs_human"] += n_human
        if n_fail > 0:
            stats["urls_with_fail"] += 1

    # 總摘要
    report_time = _now()
    stats["report_time"] = report_time
    print(f"\n{'═'*68}")
    print(f"{_BOLD} TWAA 瀏覽器測試完成  |  等級：{level}  |  共 {stats['urls']} 個 URL{_RESET}")
    print(f"{_BOLD} 檢測時間：{report_time}{_RESET}")
    print(
        f"  失敗：{_RED}{stats['total_fail']}{_RESET}  "
        f"需人工：{_YELLOW}{stats['total_needs_human']}{_RESET}  "
        f"含失敗 URL：{_RED}{stats['urls_with_fail']}/{stats['urls']}{_RESET}"
    )
    if stats["total_fail"] == 0:
        print(f"{_GREEN}✅ 瀏覽器自動化檢測全部通過！{_RESET}")

    if json_out:
        report = {"report_time": report_time, "level": level, "stats": stats, "results": all_results}
        json_out.write_text(
            json.dumps(report, indent=2, ensure_ascii=False), encoding="utf-8"
        )
        print(f"\nJSON 報告已寫入：{json_out}")

    return stats


def main() -> None:
    ap = argparse.ArgumentParser(description="TWAA 瀏覽器自動化無障礙測試")
    ap.add_argument("urls", nargs="*", help="要測試的 URL（可多個）")
    ap.add_argument("--urls-file", help="從 sitemap.json 讀取 URL 列表")
    ap.add_argument("--level", choices=["A", "AA", "AAA"], default="AA")
    ap.add_argument("--timeout", type=int, default=30000, help="頁面載入逾時 ms")
    ap.add_argument("--json", metavar="FILE", help="輸出 JSON 報告路徑")
    args = ap.parse_args()

    urls = list(args.urls)

    if args.urls_file:
        data = json.loads(Path(args.urls_file).read_text(encoding="utf-8"))
        if isinstance(data, list):
            # sitemap.json 格式：[{"url": "...", "priority": 1}, ...]
            urls += [
                item["url"] if isinstance(item, dict) else item
                for item in data
            ]

    if not urls:
        print(f"{_RED}請提供至少一個 URL 或使用 --urls-file{_RESET}")
        ap.print_help()
        sys.exit(1)

    json_out = _dated_path(Path(args.json)) if args.json else None
    stats = run(urls, level=args.level, timeout=args.timeout, json_out=json_out)

    if stats["total_fail"] > 0:
        sys.exit(1)


if __name__ == "__main__":
    main()
