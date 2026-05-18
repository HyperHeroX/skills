"""WCAG-1.4.10 — 流動排版不應限制使用者縮放（補充靜態檢查）。

官方規範 1.4.10 標示「相關檢測碼:(無)」。
靜態可偵測 viewport meta 是否設定 maximum-scale 或 user-scalable=no
（違反弱視使用者放大內容的需求）。
"""
from __future__ import annotations
import re
from ..checkers.result import CheckResult, Status
from . import _helpers as H

metadata = {
    "code": "WCAG-1.4.10",
    "criterion": "1.4.10",
    "level": "AA",
    "category": "HTML",
    "rule": "viewport 不應限制使用者縮放",
    "applies_to": ("html", "vue"),
    "informal": True,
}


def check(file_path: str, content: str) -> list[CheckResult]:
    results: list[CheckResult] = []
    for m in re.finditer(
        r'<meta\s+[^>]*name=["\']?viewport["\']?[^>]*>',
        content, re.IGNORECASE,
    ):
        tag = m.group(0)
        cm = re.search(r'content=["\']([^"\']+)["\']', tag, re.IGNORECASE)
        if not cm:
            continue
        cval = cm.group(1)
        line = H.line_of(content, m.start(), 0)
        if re.search(r"user-scalable\s*=\s*no", cval, re.IGNORECASE):
            results.append(CheckResult(
                code=metadata["code"], rule="viewport user-scalable=no",
                status=Status.FAIL, file=file_path, line=line,
                snippet=tag[:120],
                message="user-scalable=no 阻止使用者縮放，違反 1.4.10",
                fix_suggestion='改為 content="width=device-width, initial-scale=1"',
            ))
        m_max = re.search(r"maximum-scale\s*=\s*([0-9.]+)", cval, re.IGNORECASE)
        if m_max and float(m_max.group(1)) < 2:
            results.append(CheckResult(
                code=metadata["code"], rule=f"viewport maximum-scale={m_max.group(1)} 過低",
                status=Status.FAIL, file=file_path, line=line,
                snippet=tag[:120],
                message=f"maximum-scale={m_max.group(1)} 限制使用者放大不到 200%",
                fix_suggestion="移除 maximum-scale 限制，或設為 ≥ 2",
            ))
    return results
