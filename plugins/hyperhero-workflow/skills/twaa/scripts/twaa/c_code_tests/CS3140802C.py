"""CS3140802C — 樣式需有 line-height 宣告（AAA 1.4.8）。

未設定行高會導致中文字行顯得擁擠，影響閱讀。
"""
from __future__ import annotations
import re
from ..checkers.result import CheckResult, Status
from . import _helpers as H

metadata = {
    "code": "CS3140802C",
    "criterion": "1.4.8",
    "level": "AAA",
    "category": "CSS",
    "rule": "樣式需有 line-height 宣告",
    "applies_to": ("css", "scss", "sass", "vue"),
}


def check(file_path: str, content: str) -> list[CheckResult]:
    css, offset = H.extract_style(content) if file_path.endswith(".vue") else (content, 0)
    css = H.strip_comments(css)
    if css.strip() and not re.search(r"\bline-height\s*:", css, re.IGNORECASE):
        return [CheckResult(
            code=metadata["code"], rule=metadata["rule"],
            status=Status.FAIL, file=file_path, line=offset + 1,
            message="樣式表中未找到 line-height 宣告",
            fix_suggestion="在 body 或主要文字選擇器加 line-height: 1.5; 以上",
        )]
    return []
