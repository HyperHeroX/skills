"""HM3241000C — AAA：頁面需使用 heading 組件（AAA 2.4.10 區段標題）。

頁面至少需有一個 <h1>~<h6> 標頭組件，建立內容層次結構。
"""
from __future__ import annotations
import re
from ..checkers.result import CheckResult, Status
from . import _helpers as H

metadata = {
    "code": "HM3241000C",
    "criterion": "2.4.10",
    "level": "AAA",
    "category": "HTML",
    "rule": "AAA：頁面需使用 heading 組件",
    "applies_to": ("vue", "html"),
}


def check(file_path: str, content: str) -> list[CheckResult]:
    template, _ = H.extract_template(content) if file_path.endswith(".vue") else (content, 0)
    if template.strip() and not re.search(r"<h[1-6][\s>]", template, re.IGNORECASE):
        return [CheckResult(
            code=metadata["code"], rule=metadata["rule"],
            status=Status.FAIL, file=file_path,
            message="頁面未找到任何 <h1>~<h6> 標頭組件",
            fix_suggestion="至少加入一個 <h1> 標頭，並用 h1-h6 建立清晰的層次結構",
        )]
    return []
