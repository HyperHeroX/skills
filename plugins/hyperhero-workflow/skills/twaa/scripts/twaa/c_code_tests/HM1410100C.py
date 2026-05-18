"""HM1410100C — DOCTYPE 宣告必須存在（A 4.1.1 解析）。

文件需以 <!DOCTYPE html> 開頭，避免瀏覽器進入怪異模式（quirks mode）。
"""
from __future__ import annotations
import re
from ..checkers.result import CheckResult, Status

metadata = {
    "code": "HM1410100C",
    "criterion": "4.1.1",
    "level": "A",
    "category": "HTML",
    "rule": "DOCTYPE 宣告必須存在",
    "applies_to": ("html",),
}


def check(file_path: str, content: str) -> list[CheckResult]:
    if not re.match(r'\s*<!DOCTYPE\s+html', content, re.IGNORECASE):
        return [CheckResult(
            code=metadata["code"], rule=metadata["rule"],
            status=Status.FAIL, file=file_path,
            message="文件未找到 <!DOCTYPE html> 宣告",
            fix_suggestion="在 HTML 文件第一行加入：<!DOCTYPE html>",
        )]
    return []
