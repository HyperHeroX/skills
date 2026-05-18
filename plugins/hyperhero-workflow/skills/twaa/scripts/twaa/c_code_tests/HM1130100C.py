"""HM1130100C — 標頭組件需正確巢狀層次（A 1.3.1 H42）。

`<h1>`~`<h6>` 必須遞增不跳級（h1 → h2 → h3，不可 h1 → h3）。
讓螢幕閱讀器使用者能透過標題列表導覽內容結構。
"""
from __future__ import annotations
import re
from ..checkers.result import CheckResult, Status
from . import _helpers as H

metadata = {
    "code": "HM1130100C",
    "criterion": "1.3.1",
    "level": "A",
    "category": "HTML",
    "rule": "標頭組件需正確巢狀層次",
    "applies_to": ("vue", "html"),
}


def check(file_path: str, content: str) -> list[CheckResult]:
    template, offset = H.extract_template(content) if file_path.endswith(".vue") else (content, 0)
    results: list[CheckResult] = []

    # 收集所有 h1-h6 出現順序
    headings = [
        (m.start(), int(m.group(1)))
        for m in re.finditer(r"<h([1-6])[\s>]", template, re.IGNORECASE)
    ]
    if not headings:
        return results

    prev_level = 0
    for pos, level in headings:
        line = H.line_of(template, pos, offset)
        # 第一個標題必須是 h1（除非整頁無 h1，特別寬鬆處理：第一個是任意級別都允許）
        if prev_level == 0:
            prev_level = level
            continue
        # 跳級：例如從 h2 直接到 h4
        if level > prev_level + 1:
            results.append(CheckResult(
                code=metadata["code"], rule=metadata["rule"],
                status=Status.FAIL, file=file_path, line=line,
                snippet=f"<h{level}>",
                message=f"標題層次跳級：前一個是 h{prev_level}，這個是 h{level}（應為 h{prev_level + 1}）",
                fix_suggestion=f"改為 <h{prev_level + 1}> 或在中間補上 <h{prev_level + 1}>",
            ))
        prev_level = level
    return results
