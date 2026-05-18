"""CS2140401C — font-size 不得使用固定 px 單位（AA 1.4.4 文字大小可調整）。

當使用者放大瀏覽器字級時，固定 px 字型不會等比例放大，
違反 WCAG 1.4.4 Resize text。建議改用 rem/em/% 等相對單位。
"""
from __future__ import annotations
import re
from ..checkers.result import CheckResult, Status
from . import _helpers as H

metadata = {
    "code": "CS2140401C",
    "criterion": "1.4.4",
    "level": "AA",
    "category": "CSS",
    "rule": "font-size 不得使用固定 px",
    "applies_to": ("css", "scss", "sass", "vue"),
}


def check(file_path: str, content: str) -> list[CheckResult]:
    css, offset = H.extract_style(content) if file_path.endswith(".vue") else (content, 0)
    css = H.strip_comments(css)
    results: list[CheckResult] = []

    allowed = re.compile(
        r"^\s*(\d*\.?\d+\s*(em|rem|%|vw|vh|vmin|vmax|ch|ex)"
        r"|xx-small|x-small|small|medium|large|x-large|xx-large|xxx-large"
        r"|smaller|larger|initial|inherit|unset|revert|0)\s*$",
        re.IGNORECASE,
    )

    for m in re.finditer(r"font-size\s*:\s*([^;}{]+)", css, re.IGNORECASE):
        value = m.group(1).strip()
        line = H.line_of(css, m.start(), offset)
        px_match = re.match(r"^\s*\d*\.?\d+\s*px\s*(!important)?\s*$", value, re.IGNORECASE)
        if px_match:
            px_val = float(re.search(r"[\d.]+", value).group())
            rem_val = round(px_val / 16, 4)
            results.append(CheckResult(
                code=metadata["code"], rule=metadata["rule"],
                status=Status.FAIL, file=file_path, line=line,
                snippet=f"font-size: {value}",
                message=f"'{value}' 使用固定 px，放大瀏覽器文字時不會縮放",
                fix_suggestion=f"改為 font-size: {rem_val}rem;（以 16px 基準換算）",
            ))
        elif not allowed.match(value):
            results.append(CheckResult(
                code=metadata["code"], rule="font-size 單位需人工確認",
                status=Status.NEEDS_HUMAN, file=file_path, line=line,
                snippet=f"font-size: {value}",
                fix_suggestion="確認此值是否為允許的相對單位（em/rem/%/具名大小）",
            ))
    return results
