"""scan_static.py — 靜態掃描協調器

呼叫 scan_vue.js / scan_react.mjs / contrast.py 把全專案掃過一遍，
回傳 findings list（每個 finding 含 rule、guideline、severity、file、line、message）。

執行：
  python -m twaa.scan_static --project /path/to/project --out findings.json
"""
from __future__ import annotations
import argparse
import json
import subprocess
from pathlib import Path
from typing import Any

from twaa.contrast import scan_scss_file


SCRIPTS_DIR = Path(__file__).resolve().parent.parent  # scripts/


class StaticScanner:
    def __init__(self, project_root: Path) -> None:
        self.root = Path(project_root)

    def run(self) -> list[dict[str, Any]]:
        all_findings: list[dict[str, Any]] = []
        all_findings.extend(self._scan_vue())
        all_findings.extend(self._scan_react())
        all_findings.extend(self._scan_scss())
        return all_findings

    def _scan_vue(self) -> list[dict[str, Any]]:
        files = list(self.root.rglob("*.vue"))
        if not files:
            return []
        cmd = ["node", str(SCRIPTS_DIR / "scan_vue.js"), *map(str, files), "--json"]
        return self._run_node(cmd)

    def _scan_react(self) -> list[dict[str, Any]]:
        files = list(self.root.rglob("*.tsx")) + list(self.root.rglob("*.jsx"))
        if not files:
            return []
        cmd = ["node", str(SCRIPTS_DIR / "scan_react.mjs"), *map(str, files), "--json"]
        return self._run_node(cmd)

    def _scan_scss(self) -> list[dict[str, Any]]:
        out: list[dict[str, Any]] = []
        for f in self.root.rglob("*.scss"):
            out.extend(scan_scss_file(f))
        for f in self.root.rglob("*.css"):
            out.extend(scan_scss_file(f))
        return out

    def _run_node(self, cmd: list[str]) -> list[dict[str, Any]]:
        try:
            result = subprocess.run(
                cmd, capture_output=True, text=True, check=True, encoding="utf-8"
            )
            return json.loads(result.stdout) if result.stdout.strip() else []
        except subprocess.CalledProcessError as e:
            print(f"[scan_static] node script error: {e.stderr}")
            return []


def main() -> None:
    p = argparse.ArgumentParser()
    p.add_argument("--project", required=True, help="專案根目錄")
    p.add_argument("--out", required=True, help="輸出 JSON 檔路徑")
    args = p.parse_args()

    scanner = StaticScanner(Path(args.project))
    findings = scanner.run()
    Path(args.out).parent.mkdir(parents=True, exist_ok=True)
    Path(args.out).write_text(
        json.dumps(findings, indent=2, ensure_ascii=False), encoding="utf-8"
    )
    print(f"Wrote {len(findings)} findings to {args.out}")


if __name__ == "__main__":
    main()
