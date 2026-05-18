"""CS3140800C — 主要內容不得同時鎖定文字色與背景色（AAA 1.4.8 視覺呈現）。

若 body/main/.content 同時設定 color 與 background-color，
使用者無法以「使用者偏好色」覆寫，違反 1.4.8 視覺呈現原則。
"""
from __future__ import annotations
import re
from ..checkers.result import CheckResult, Status
from . import _helpers as H

metadata = {
    "code": "CS3140800C",
    "criterion": "1.4.8",
    "level": "AAA",
    "category": "CSS",
    "rule": "主要內容不得同時鎖定文字/背景色",
    "applies_to": ("css", "scss", "sass", "vue"),
}


def check(file_path: str, content: str) -> list[CheckResult]:
    css, offset = H.extract_style(content) if file_path.endswith(".vue") else (content, 0)
    css = H.strip_comments(css)
    results: list[CheckResult] = []

    main_re = re.compile(
        r"(body|main|\.main|#main|article|\.content|#content)\s*\{([^}]+)\}",
        re.IGNORECASE | re.DOTALL,
    )
    for m in main_re.finditer(css):
        selector, block = m.group(1), m.group(2)
        line = H.line_of(css, m.start(), offset)
        has_color = bool(re.search(r"(?<![a-z-])color\s*:", block, re.IGNORECASE))
        has_bg = bool(re.search(r"\bbackground(-color)?\s*:", block, re.IGNORECASE))
        if has_color and has_bg:
            results.append(CheckResult(
                code=metadata["code"], rule=metadata["rule"],
                status=Status.FAIL, file=file_path, line=line,
                snippet=f"{selector} {{...}}",
                message=f"'{selector}' 同時指定 color 和 background，使用者無法覆寫顏色",
                fix_suggestion="移除 color 或 background-color，讓使用者代理使用使用者偏好色",
            ))
    return results
