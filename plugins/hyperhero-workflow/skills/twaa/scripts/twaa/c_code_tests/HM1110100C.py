"""HM1110100C — 圖片組件需有替代文字屬性（A 1.1.1 H37）。

`<img>` 標籤必須有 alt 屬性。alt 可為空字串（裝飾性圖片）但屬性本身必須存在。
"""
from __future__ import annotations
import re
from ..checkers.result import CheckResult, Status
from . import _helpers as H

metadata = {
    "code": "HM1110100C",
    "criterion": "1.1.1",
    "level": "A",
    "category": "HTML",
    "rule": "圖片組件需有替代文字屬性",
    "applies_to": ("vue", "html"),
}


def check(file_path: str, content: str) -> list[CheckResult]:
    template, offset = H.extract_template(content) if file_path.endswith(".vue") else (content, 0)
    results: list[CheckResult] = []
    for m in re.finditer(r"<img(\s[^>]*)?>", template, re.IGNORECASE | re.DOTALL):
        line = H.line_of(template, m.start(), offset)
        tag = m.group(0)
        # 動態屬性 :alt 視為通過（無法靜態判斷值）但提示需人工確認
        if H.has_dynamic(tag, "alt"):
            continue
        alt = H.attr(tag, "alt")
        if alt is None:
            results.append(CheckResult(
                code=metadata["code"], rule=metadata["rule"],
                status=Status.FAIL, file=file_path, line=line,
                snippet=tag[:80],
                message="<img> 缺少 alt 屬性，螢幕閱讀器無法描述圖片內容",
                fix_suggestion='加上 alt 屬性：alt="圖片描述"，裝飾性圖片用 alt=""',
            ))
    return results
