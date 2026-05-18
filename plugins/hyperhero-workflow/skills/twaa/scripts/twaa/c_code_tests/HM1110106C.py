"""HM1110106C — alt="" 的 img 不得有 title 屬性（A 1.1.1 H67）。

裝飾性圖片以 alt="" 告訴輔助科技「忽略此圖」；若同時有 title，
title 仍會被朗讀，破壞「裝飾性、應忽略」的語意。
"""
from __future__ import annotations
import re
from ..checkers.result import CheckResult, Status
from . import _helpers as H

metadata = {
    "code": "HM1110106C",
    "criterion": "1.1.1",
    "level": "A",
    "category": "HTML",
    "rule": "alt='' 的 img 不得有 title",
    "applies_to": ("vue", "html"),
}


def check(file_path: str, content: str) -> list[CheckResult]:
    template, offset = H.extract_template(content) if file_path.endswith(".vue") else (content, 0)
    results: list[CheckResult] = []
    for m in re.finditer(r"<img(\s[^>]*)?>", template, re.IGNORECASE | re.DOTALL):
        tag = m.group(0)
        alt = H.attr(tag, "alt")
        if alt is None or alt.strip() != "":
            continue  # 只檢測 alt 為空字串的情況
        title = H.attr(tag, "title")
        if title is not None:
            line = H.line_of(template, m.start(), offset)
            results.append(CheckResult(
                code=metadata["code"], rule=metadata["rule"],
                status=Status.FAIL, file=file_path, line=line,
                snippet=tag[:80],
                message="裝飾性圖片（alt=''）同時有 title，仍會被螢幕閱讀器朗讀",
                fix_suggestion="移除 title 屬性；裝飾性圖片只需 alt=''",
            ))
    return results
