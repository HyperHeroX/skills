"""discover_sitemap.py — 從專案原始碼推測網站 sitemap。"""
from __future__ import annotations
import argparse
import json
import re
from pathlib import Path
from typing import Any


_VUE_ROUTE = re.compile(
    r"\{\s*path:\s*['\"]([^'\"]+)['\"](?:[^}]*?name:\s*['\"]([^'\"]+)['\"])?(?:[^}]*?title:\s*['\"]([^'\"]+)['\"])?",
    re.S,
)


def discover_vue_routes(project_root: Path) -> list[dict[str, Any]]:
    out: list[dict[str, Any]] = []
    seen = set()
    for f in list(project_root.rglob("router*.ts")) + list(project_root.rglob("routers/index.ts")):
        if f in seen:
            continue
        seen.add(f)
        text = f.read_text(encoding="utf-8")
        for m in _VUE_ROUTE.finditer(text):
            path, name, title = m.group(1), m.group(2), m.group(3)
            if not path:
                continue
            out.append({
                "path": path if path.startswith("/") else "/" + path,
                "name": name or "",
                "title": title or name or path,
                "source": str(f.relative_to(project_root)),
            })
    deduped: list[dict[str, Any]] = []
    seen_paths = set()
    for r in out:
        if r["path"] in seen_paths:
            continue
        seen_paths.add(r["path"])
        deduped.append(r)
    return deduped


def discover_nextjs_routes(project_root: Path) -> list[dict[str, Any]]:
    out: list[dict[str, Any]] = []
    for base in [project_root / "app", project_root / "pages"]:
        if not base.is_dir():
            continue
        for page in list(base.rglob("page.tsx")) + list(base.rglob("page.jsx")):
            rel = page.relative_to(base).parent
            path = "/" + str(rel).replace("\\", "/").replace("(", "").replace(")", "")
            if path == "/.":
                path = "/"
            out.append({
                "path": path,
                "name": "",
                "title": rel.name or "home",
                "source": str(page.relative_to(project_root)),
            })
    return out


def assign_priority(routes: list[dict[str, Any]]) -> list[dict[str, Any]]:
    P1 = ("home", "index", "/")
    P2 = ("login", "register", "forget", "reset", "directions", "sitemap", "about")
    P3 = ("apply", "upload", "edit", "submit")
    for r in routes:
        path_lower = r["path"].lower()
        if any(k in path_lower for k in P1):
            r["priority"] = 1
        elif any(k in path_lower for k in P2):
            r["priority"] = 2
        elif any(k in path_lower for k in P3):
            r["priority"] = 3
        else:
            r["priority"] = 4
    routes.sort(key=lambda r: (r["priority"], r["path"]))
    return routes


def main() -> None:
    p = argparse.ArgumentParser()
    p.add_argument("--project", required=True)
    p.add_argument("--out", required=True)
    args = p.parse_args()

    root = Path(args.project)
    routes = discover_vue_routes(root) + discover_nextjs_routes(root)
    routes = assign_priority(routes)
    Path(args.out).parent.mkdir(parents=True, exist_ok=True)
    Path(args.out).write_text(
        json.dumps(routes, indent=2, ensure_ascii=False), encoding="utf-8"
    )
    print(f"Discovered {len(routes)} routes → {args.out}")


if __name__ == "__main__":
    main()
