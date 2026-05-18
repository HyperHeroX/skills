"""WCAG-1.3.4 — 螢幕方向不應鎖定（補充靜態檢查）。

官方規範 1.3.4 標示「相關檢測碼:(無)」。靜態可偵測 CSS 中
`@media (orientation: ...)` 的硬性鎖定，或 viewport meta 設定方向。
"""
from __future__ import annotations
import re
from ..checkers.result import CheckResult, Status
from . import _helpers as H

metadata = {
    "code": "WCAG-1.3.4",
    "criterion": "1.3.4",
    "level": "AA",
    "category": "CSS",
    "rule": "螢幕方向不應鎖定",
    "applies_to": ("css", "scss", "vue", "html"),
    "informal": True,
}


def check(file_path: str, content: str) -> list[CheckResult]:
    results: list[CheckResult] = []

    # CSS 層級：@media (orientation: portrait/landscape) 中設定 display:none 整個內容
    if file_path.endswith((".css", ".scss", ".vue")):
        css, offset = (H.extract_style(content) if file_path.endswith(".vue") else (content, 0))
        css = H.strip_comments(css)
        for m in re.finditer(
            r"@media\s*\([^)]*orientation:\s*(portrait|landscape)[^)]*\)\s*\{([^{}]+\{[^}]*display:\s*none[^}]*\}[^}]*)+",
            css, re.IGNORECASE | re.DOTALL,
        ):
            line = H.line_of(css, m.start(), offset)
            results.append(CheckResult(
                code=metadata["code"], rule=metadata["rule"],
                status=Status.FAIL, file=file_path, line=line,
                snippet=m.group(0)[:80],
                message=f"在 orientation: {m.group(1)} 媒體查詢中隱藏整個內容，等同鎖定方向",
                fix_suggestion="移除依方向隱藏內容的規則，或改為調整版面而非隱藏",
            ))

    # HTML 層級：viewport meta 含 user-scalable=no（同時也違反 1.4.10）
    if file_path.endswith((".html", ".vue")):
        for m in re.finditer(
            r'<meta\s+[^>]*name=["\']?viewport["\']?[^>]*>',
            content, re.IGNORECASE,
        ):
            tag = m.group(0)
            cm = re.search(r'content=["\']([^"\']+)["\']', tag, re.IGNORECASE)
            if cm and re.search(r"user-scalable\s*=\s*no", cm.group(1), re.IGNORECASE):
                line = H.line_of(content, m.start(), 0)
                results.append(CheckResult(
                    code=metadata["code"], rule="viewport user-scalable=no 限制使用者縮放",
                    status=Status.FAIL, file=file_path, line=line,
                    snippet=tag[:120],
                    message="viewport 設定 user-scalable=no 阻止使用者縮放，影響弱視使用者",
                    fix_suggestion='改為 <meta name="viewport" content="width=device-width, initial-scale=1">',
                ))
    return results
