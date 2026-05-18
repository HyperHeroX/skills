"""render_dashboard.py — 把 state.json 嵌進 dashboard-template.html 產出可離線開啟的儀表板。"""
from __future__ import annotations
import argparse
import json
from pathlib import Path

ASSETS_DIR = Path(__file__).resolve().parent.parent.parent / "assets"
TEMPLATE = ASSETS_DIR / "dashboard-template.html"


def render(state_path: Path, project_name: str, out_html: Path) -> None:
    state = json.loads(state_path.read_text(encoding="utf-8"))
    tpl = TEMPLATE.read_text(encoding="utf-8")
    html = (
        tpl.replace("__PROJECT__", project_name)
           .replace("__LEVEL__", state.get("level", "AA"))
           .replace("__STATE_JSON__", json.dumps(state, ensure_ascii=False))
    )
    out_html.parent.mkdir(parents=True, exist_ok=True)
    out_html.write_text(html, encoding="utf-8")


def main() -> None:
    p = argparse.ArgumentParser()
    p.add_argument("--state", required=True)
    p.add_argument("--project-name", required=True)
    p.add_argument("--out", required=True)
    args = p.parse_args()
    render(Path(args.state), args.project_name, Path(args.out))
    print(f"Wrote {args.out}")


if __name__ == "__main__":
    main()
