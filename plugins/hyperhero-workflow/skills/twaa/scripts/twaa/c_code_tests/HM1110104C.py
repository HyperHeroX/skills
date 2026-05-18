"""HM1110104C — type=image 的 input 需有非空 alt（A 1.1.1 H36）。

`<input type="image">` 是圖片送出按鈕，必須有 alt 屬性提供按鈕文字描述。
"""
from __future__ import annotations
import re
from ..checkers.result import CheckResult, Status
from . import _helpers as H

metadata = {
    "code": "HM1110104C",
    "criterion": "1.1.1",
    "level": "A",
    "category": "HTML",
    "rule": "type=image 的 input 需有非空 alt",
    "applies_to": ("vue", "html"),
}


def check(file_path: str, content: str) -> list[CheckResult]:
    template, offset = H.extract_template(content) if file_path.endswith(".vue") else (content, 0)
    results: list[CheckResult] = []
    for m in re.finditer(r"<input(\s[^>]*)?>", template, re.IGNORECASE | re.DOTALL):
        tag = m.group(0)
        typ = (H.attr(tag, "type") or "").lower()
        if typ != "image":
            continue
        line = H.line_of(template, m.start(), offset)
        if H.has_dynamic(tag, "alt"):
            continue
        alt = H.attr(tag, "alt")
        if alt is None or alt.strip() == "":
            results.append(CheckResult(
                code=metadata["code"], rule=metadata["rule"],
                status=Status.FAIL, file=file_path, line=line,
                snippet=tag[:80],
                message='<input type="image"> 缺少 alt 或 alt 為空',
                fix_suggestion='加上 alt 描述按鈕用途：alt="送出"',
            ))
    return results
