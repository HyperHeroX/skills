"""WCAG-4.1.3 — 狀態訊息需 aria-live 或 role=alert（補充靜態檢查）。

官方規範 4.1.3 標示「相關檢測碼:(無)」，但靜態可偵測：
class 含 error/alert/success/warning 的容器若無 aria-live 或 role=alert，
螢幕閱讀器無法即時通知使用者。
"""
from __future__ import annotations
import re
from ..checkers.result import CheckResult, Status
from . import _helpers as H

metadata = {
    "code": "WCAG-4.1.3",
    "criterion": "4.1.3",
    "level": "AA",
    "category": "ARIA",
    "rule": "狀態訊息需 aria-live 或 role=alert",
    "applies_to": ("vue", "html"),
    "informal": True,
}


def check(file_path: str, content: str) -> list[CheckResult]:
    template, offset = H.extract_template(content) if file_path.endswith(".vue") else (content, 0)
    results: list[CheckResult] = []
    pattern = re.compile(
        r'<(?:div|span|p)([^>]*class=["\'][^"\']*'
        r'(?:error|alert|success|warning|message)'
        r'[^"\']*["\'][^>]*)>',
        re.IGNORECASE,
    )
    for m in pattern.finditer(template):
        tag = m.group(0)
        if re.search(r'\baria-live\b|\brole=["\']?(?:alert|status|log)', tag, re.IGNORECASE):
            continue
        line = H.line_of(template, m.start(), offset)
        results.append(CheckResult(
            code=metadata["code"], rule=metadata["rule"],
            status=Status.FAIL, file=file_path, line=line,
            snippet=tag[:80],
            message="狀態訊息容器缺 aria-live 或 role=alert",
            fix_suggestion=(
                '加上 role="alert" 或 aria-live="polite"：\n'
                '<div class="error" role="alert" aria-live="assertive">...</div>'
            ),
        ))
    return results
