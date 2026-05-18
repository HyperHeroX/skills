"""HM3240900C — AAA：連結需同時有文字與 title 屬性（AAA 2.4.9 鏈結目的）。

AAA 級加強：所有連結除了文字也需 title 屬性，提供完整的鏈結目的說明。
"""
from __future__ import annotations
import re
from ..checkers.result import CheckResult, Status
from . import _helpers as H

metadata = {
    "code": "HM3240900C",
    "criterion": "2.4.9",
    "level": "AAA",
    "category": "HTML",
    "rule": "AAA：連結需同時有文字與 title",
    "applies_to": ("vue", "html"),
}


def check(file_path: str, content: str) -> list[CheckResult]:
    template, offset = H.extract_template(content) if file_path.endswith(".vue") else (content, 0)
    results: list[CheckResult] = []
    for m in re.finditer(r"<a(\s[^>]*)?>(.+?)</a>", template, re.DOTALL | re.IGNORECASE):
        tag_attrs = "<a" + (m.group(1) or "") + ">"
        href = H.attr(tag_attrs, "href")
        if href is None:
            continue
        line = H.line_of(template, m.start(), offset)
        plain_text = re.sub(r"<[^>]+>", "", m.group(2)).strip()
        title = H.attr(tag_attrs, "title")
        if not plain_text or not title or not title.strip():
            results.append(CheckResult(
                code=metadata["code"], rule=metadata["rule"],
                status=Status.FAIL, file=file_path, line=line,
                snippet=m.group(0)[:80],
                message="連結" + ("缺少文字" if not plain_text else "缺少 title 屬性"),
                fix_suggestion="加上 title='完整描述連結目的地或動作'，且連結內要有可見文字",
            ))
    return results
