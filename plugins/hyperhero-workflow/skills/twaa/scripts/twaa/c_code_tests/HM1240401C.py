"""HM1240401C — 連結必須有非空鏈結文字（A 2.4.4 鏈結目的）。

<a href> 必須有可識別的鏈結文字、img alt、title 或 aria-label 之一。
"""
from __future__ import annotations
import re
from ..checkers.result import CheckResult, Status
from . import _helpers as H

metadata = {
    "code": "HM1240401C",
    "criterion": "2.4.4",
    "level": "A",
    "category": "HTML",
    "rule": "連結必須有非空鏈結文字",
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
        inner = m.group(2)
        plain_text = re.sub(r"<[^>]+>", "", inner).strip()
        img_alts = re.findall(r'<img[^>]+alt=["\']([^"\']+)["\']', inner, re.IGNORECASE)
        title = H.attr(tag_attrs, "title")
        aria_label = H.attr(tag_attrs, "aria-label")
        if not plain_text and not img_alts and not title and not aria_label:
            if H.has_dynamic(tag_attrs, "aria-label") or H.has_dynamic(tag_attrs, "title"):
                results.append(CheckResult(
                    code=metadata["code"], rule="連結文字需人工確認（動態繫結）",
                    status=Status.NEEDS_HUMAN, file=file_path, line=line,
                    snippet=m.group(0)[:80],
                    fix_suggestion="確認動態繫結的 aria-label/title 在所有狀態下均有非空值",
                ))
            else:
                results.append(CheckResult(
                    code=metadata["code"], rule="連結缺少可識別的鏈結文字",
                    status=Status.FAIL, file=file_path, line=line,
                    snippet=m.group(0)[:80],
                    message="<a> 連結無文字、無非空 img alt、無 title、無 aria-label",
                    fix_suggestion="在 <a> 內加入文字，或加上 title/aria-label 屬性",
                ))
    return results
