"""HM1240200C — <title> 不得為空（A 2.4.2 頁面標題）。

每個頁面必須有描述性的 <title>，且每頁標題應唯一。
本規則檢查整份 HTML 原始碼（含 <head>），不限於 <template> 範圍。
"""
from __future__ import annotations
import re
from ..checkers.result import CheckResult, Status

metadata = {
    "code": "HM1240200C",
    "criterion": "2.4.2",
    "level": "A",
    "category": "HTML",
    "rule": "<title> 不得為空",
    "applies_to": ("html",),
}


def check(file_path: str, content: str) -> list[CheckResult]:
    m = re.search(r"<title[^>]*>(.*?)</title>", content, re.IGNORECASE | re.DOTALL)
    if not m or not m.group(1).strip():
        return [CheckResult(
            code=metadata["code"], rule=metadata["rule"],
            status=Status.FAIL, file=file_path,
            message="<title> 不存在或內容為空",
            fix_suggestion="在 <head> 加入 <title>頁面描述 - 系統名稱</title>，每頁標題需唯一且具描述性",
        )]
    return []
