"""check_url.py — 對「渲染後 HTML」執行靜態 C 碼 + 補充規則檢查。

**為什麼需要：**
標章審查員看的是**瀏覽器渲染後的最終 HTML**，不是原始 .vue 程式碼。
SPA / SSR 應用可能因為動態繫結、computed 屬性、條件渲染、
prerender hydration 等因素，導致原始碼通過但渲染後不通過（或反之）。

本工具：
  1. 用 Playwright 開啟 URL，等渲染完成
  2. 取得渲染後 HTML（含完整 DOM）
  3. 用 c_code_runner + supplementary_runner 對該 HTML 執行檢查
  4. 結果以「URL（而非檔名）」為主鍵記錄

對應 SKILL.md 第五原則：「靜態檢查也必須對渲染後 HTML 執行，因為審查員看的是瀏覽器最終呈現」。

使用方式：
  python -m twaa.check_url http://localhost:8083/zh-tw/home --level AA
  python -m twaa.check_url --urls-file sitemap.json --level AA --json report.json
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

SCRIPTS_DIR = Path(__file__).resolve().parent.parent  # scripts/
FETCH_JS = SCRIPTS_DIR / "fetch_rendered_html.js"


def fetch_rendered_html(url: str, timeout: int = 30000) -> tuple[str, str]:
    """用 Playwright 取得渲染後 HTML。

    Returns (html, error). error 為 "" 表示成功。
    """
    if not FETCH_JS.exists():
        # 簡易 fallback：用 curl（無法執行 JS，但能拿 prerender 過的靜態 HTML）
        try:
            result = subprocess.run(
                ["curl", "-sL", "-A", "Mozilla/5.0", url],
                capture_output=True, text=True, timeout=30, encoding="utf-8",
            )
            return result.stdout, "" if result.returncode == 0 else f"curl exit {result.returncode}"
        except Exception as e:
            return "", f"fetch failed: {e}"

    cmd = ["node", str(FETCH_JS), url, f"--timeout={timeout}"]
    try:
        result = subprocess.run(
            cmd, capture_output=True, text=True, encoding="utf-8",
            timeout=timeout // 1000 + 30, cwd=str(SCRIPTS_DIR),
        )
        if result.returncode != 0:
            return "", result.stderr[:500]
        return result.stdout, ""
    except subprocess.TimeoutExpired:
        return "", f"timeout after {timeout}ms"
    except FileNotFoundError:
        return "", "node not found"


def check_url(url: str, level: str = "AA") -> dict:
    """對 URL 執行靜態檢查（渲染後 HTML）。

    Returns dict with 'url', 'fetched_size', 'fetch_error', 'results'.
    """
    from twaa.c_code_runner import run_for_file as run_c, load_all_c_codes
    from twaa.supplementary_runner import run_for_file as run_supp, load_all_supplementary

    html, err = fetch_rendered_html(url)
    if err:
        return {
            "url": url,
            "fetched_size": 0,
            "fetch_error": err,
            "results": [],
        }

    # 用 .html 副檔名讓 runner 知道是 HTML 不是 Vue
    pseudo_path = f"{url} (rendered HTML)"

    # 將 URL 視為 .html 檔執行檢查
    # runner 用 file_path 副檔名判斷 applies_to，所以給個假路徑帶 .html
    fake_path_for_ext = "rendered_page.html"
    results = []

    c_modules = load_all_c_codes(level=level)
    for r in run_c(fake_path_for_ext, html, level=level, modules=c_modules):
        d = r.to_dict()
        d["url"] = url
        d["file"] = pseudo_path
        results.append(d)

    supp_modules = load_all_supplementary(level=level)
    for r in run_supp(fake_path_for_ext, html, level=level, modules=supp_modules):
        d = r.to_dict()
        d["url"] = url
        d["file"] = pseudo_path
        results.append(d)

    return {
        "url": url,
        "fetched_size": len(html),
        "fetch_error": "",
        "results": results,
    }


def main() -> None:
    ap = argparse.ArgumentParser(description="對渲染後 HTML 執行 TWAA 靜態檢查")
    ap.add_argument("urls", nargs="*")
    ap.add_argument("--urls-file", help="從 sitemap.json 讀取 URL 列表")
    ap.add_argument("--level", choices=["A", "AA", "AAA"], default="AA")
    ap.add_argument("--json", metavar="FILE", help="輸出 JSON 報告路徑")
    args = ap.parse_args()

    urls = list(args.urls)
    if args.urls_file:
        data = json.loads(Path(args.urls_file).read_text(encoding="utf-8"))
        for item in (data if isinstance(data, list) else []):
            urls.append(item["url"] if isinstance(item, dict) else item)

    if not urls:
        ap.print_help()
        sys.exit(1)

    all_results = []
    total_fail = 0
    total_human = 0
    for url in urls:
        print(f"\n→ {url}")
        report = check_url(url, level=args.level)
        if report["fetch_error"]:
            print(f"  ✗ fetch error: {report['fetch_error']}")
            continue
        fails = [r for r in report["results"] if r["status"] == "fail"]
        humans = [r for r in report["results"] if r["status"] == "needs_human"]
        total_fail += len(fails)
        total_human += len(humans)
        print(f"  fetched {report['fetched_size']} bytes  fail={len(fails)} needs_human={len(humans)}")
        for r in fails[:5]:
            print(f"    ✗ [{r['code']}] {r['rule']}")
        all_results.append(report)

    print(f"\n總計：fail={total_fail} needs_human={total_human} URL={len(urls)}")

    if args.json:
        Path(args.json).parent.mkdir(parents=True, exist_ok=True)
        Path(args.json).write_text(
            json.dumps({
                "report_time": datetime.now().strftime("%Y-%m-%d %H:%M:%S"),
                "level": args.level,
                "total_fail": total_fail,
                "total_needs_human": total_human,
                "urls": all_results,
            }, indent=2, ensure_ascii=False),
            encoding="utf-8",
        )
        print(f"JSON 報告：{args.json}")


if __name__ == "__main__":
    main()
