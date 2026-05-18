"""merge_reports.py — 把 audit/ 內三層報告合併為單一 full-report.md，再用 pandoc 產 docx。"""
from __future__ import annotations
import argparse
import subprocess
from pathlib import Path
from typing import Iterable


def _read_sorted(dir_: Path, suffix: str = ".md") -> Iterable[tuple[str, str]]:
    if not dir_.is_dir():
        return []
    files = sorted(dir_.glob(f"*{suffix}"))
    return [(f.stem, f.read_text(encoding="utf-8")) for f in files]


def merge_to_single_md(audit_dir: Path, out_md: Path, project_name: str) -> None:
    parts: list[str] = []
    parts.append(f"---\ntitle: {project_name} TWAA 全等級檢測報告\n---\n")

    summary = audit_dir / "summary.md"
    if summary.is_file():
        parts.append(summary.read_text(encoding="utf-8"))
        parts.append("\n\\newpage\n")

    parts.append("\n# 各頁面深度檢測\n")
    for stem, body in _read_sorted(audit_dir / "per-page"):
        parts.append(body)
        parts.append("\n\\newpage\n")

    parts.append("\n# 各指引橫切結果\n")
    for stem, body in _read_sorted(audit_dir / "per-guideline"):
        parts.append(body)
        parts.append("\n\\newpage\n")

    out_md.parent.mkdir(parents=True, exist_ok=True)
    out_md.write_text("\n".join(parts), encoding="utf-8")


def render_docx(md_path: Path, docx_path: Path) -> None:
    docx_path.parent.mkdir(parents=True, exist_ok=True)
    subprocess.run(
        ["pandoc", str(md_path), "-o", str(docx_path), "--toc", "--toc-depth=3"],
        check=True,
    )


def main() -> None:
    p = argparse.ArgumentParser()
    p.add_argument("--audit-dir", required=True)
    p.add_argument("--project-name", required=True)
    p.add_argument("--out-md", required=True)
    p.add_argument("--out-docx")
    args = p.parse_args()

    audit = Path(args.audit_dir)
    out_md = Path(args.out_md)
    merge_to_single_md(audit, out_md, args.project_name)
    print(f"Wrote {out_md}")

    if args.out_docx:
        render_docx(out_md, Path(args.out_docx))
        print(f"Wrote {args.out_docx}")


if __name__ == "__main__":
    main()
