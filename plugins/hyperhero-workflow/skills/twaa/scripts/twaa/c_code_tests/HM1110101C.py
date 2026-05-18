"""HM1110101C — 影像地圖區域組件需有非空 alt（A 1.1.1 H24）。

`<map>` 內每個 `<area>` 必須有 alt 屬性，且值不得為空字串或空白。
原因：area 是可點擊熱區，沒有可見文字，純靠 alt 讓螢幕閱讀器描述。
"""
from __future__ import annotations
import re
from ..checkers.result import CheckResult, Status
from . import _helpers as H

metadata = {
    "code": "HM1110101C",
    "criterion": "1.1.1",
    "level": "A",
    "category": "HTML",
    "rule": "<area> 需有非空 alt 屬性",
    "applies_to": ("vue", "html"),
}


def check(file_path: str, content: str) -> list[CheckResult]:
    template, offset = H.extract_template(content) if file_path.endswith(".vue") else (content, 0)
    results: list[CheckResult] = []
    for m in re.finditer(r"<area(\s[^>]*)?/?>", template, re.IGNORECASE | re.DOTALL):
        line = H.line_of(template, m.start(), offset)
        tag = m.group(0)
        if H.has_dynamic(tag, "alt"):
            continue
        alt = H.attr(tag, "alt")
        if alt is None or alt.strip() == "":
            results.append(CheckResult(
                code=metadata["code"], rule=metadata["rule"],
                status=Status.FAIL, file=file_path, line=line,
                snippet=tag[:80],
                message="<area> 缺少 alt 或 alt 為空，可點擊區域無法被螢幕閱讀器描述",
                fix_suggestion='加上非空 alt：<area shape="..." href="..." alt="此區域用途描述">',
            ))
    return results
