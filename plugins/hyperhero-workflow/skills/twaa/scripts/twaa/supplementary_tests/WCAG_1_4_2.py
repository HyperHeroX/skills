"""WCAG-1.4.2 — audio/video autoplay 需提供控制機制（補充靜態檢查）。

官方規範 1.4.2 標示「相關檢測碼:(無)」，但靜態可偵測 autoplay 缺 controls。
"""
from __future__ import annotations
import re
from ..checkers.result import CheckResult, Status
from . import _helpers as H

metadata = {
    "code": "WCAG-1.4.2",
    "criterion": "1.4.2",
    "level": "A",
    "category": "HTML",
    "rule": "audio/video autoplay 需 controls",
    "applies_to": ("vue", "html"),
    "informal": True,
}


def check(file_path: str, content: str) -> list[CheckResult]:
    template, offset = H.extract_template(content) if file_path.endswith(".vue") else (content, 0)
    results: list[CheckResult] = []
    for tag_name in ("audio", "video"):
        for m in re.finditer(rf"<{tag_name}(\s[^>]*)?>", template, re.IGNORECASE | re.DOTALL):
            tag = m.group(0)
            if H.attr(tag, "autoplay") is not None and H.attr(tag, "controls") is None:
                line = H.line_of(template, m.start(), offset)
                results.append(CheckResult(
                    code=metadata["code"], rule=f"{tag_name} autoplay 但無 controls",
                    status=Status.FAIL, file=file_path, line=line,
                    snippet=tag[:80],
                    message=f"<{tag_name}> 有 autoplay 但缺少 controls 屬性",
                    fix_suggestion="加上 controls 屬性，或移除 autoplay；自訂播放器需確保有暫停/靜音按鈕",
                ))
    return results
