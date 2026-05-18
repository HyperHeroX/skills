"""HM3330500C — AAA：輸入欄位需有脈絡協助說明（AAA 3.3.5 協助）。

AAA 加強：表單輸入需 title 提供格式範例，或有對應的 <label for>。
"""
from __future__ import annotations
import re
from ..checkers.result import CheckResult, Status
from . import _helpers as H

metadata = {
    "code": "HM3330500C",
    "criterion": "3.3.5",
    "level": "AAA",
    "category": "HTML",
    "rule": "AAA：輸入欄位需有脈絡協助說明",
    "applies_to": ("vue", "html"),
}

_SKIP_TYPES = {"hidden", "submit", "reset", "button", "image"}


def check(file_path: str, content: str) -> list[CheckResult]:
    template, offset = H.extract_template(content) if file_path.endswith(".vue") else (content, 0)
    results: list[CheckResult] = []
    for m in re.finditer(r"<input(\s[^>]*)?>", template, re.IGNORECASE | re.DOTALL):
        line = H.line_of(template, m.start(), offset)
        tag = m.group(0)
        typ = (H.attr(tag, "type") or "text").lower()
        if typ in _SKIP_TYPES:
            continue
        title = H.attr(tag, "title")
        label_id = H.attr(tag, "id")
        has_label = (
            label_id and re.search(
                rf'<label\s[^>]*for=["\']?{re.escape(label_id)}["\']?',
                template, re.IGNORECASE,
            )
        )
        if (not title or not title.strip()) and not has_label:
            results.append(CheckResult(
                code=metadata["code"], rule=metadata["rule"],
                status=Status.FAIL, file=file_path, line=line,
                snippet=tag[:80],
                message=f"<input type={typ}> 無 title 屬性提供輸入情境說明",
                fix_suggestion="加上 title='輸入範例：2024-01-01'，或加上帶 for 屬性的 <label>",
            ))
    return results
