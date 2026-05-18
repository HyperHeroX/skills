"""CS3140801C — 欄寬不得超過 80ch（AAA 1.4.8 視覺呈現）。

連續閱讀文字的欄寬超過 80 字元會造成閱讀困難，違反 1.4.8。
"""
from __future__ import annotations
import re
from ..checkers.result import CheckResult, Status
from . import _helpers as H

metadata = {
    "code": "CS3140801C",
    "criterion": "1.4.8",
    "level": "AAA",
    "category": "CSS",
    "rule": "欄寬不得超過 80ch",
    "applies_to": ("css", "scss", "sass", "vue"),
}


def check(file_path: str, content: str) -> list[CheckResult]:
    css, offset = H.extract_style(content) if file_path.endswith(".vue") else (content, 0)
    css = H.strip_comments(css)
    results: list[CheckResult] = []

    for m in re.finditer(r"\b(max-width|width)\s*:\s*([^;}{]+)", css, re.IGNORECASE):
        prop, value = m.group(1).lower(), m.group(2).strip()
        line = H.line_of(css, m.start(), offset)
        ch_val = re.match(r"(\d+)\s*ch", value, re.IGNORECASE)
        if ch_val and int(ch_val.group(1)) > 80:
            results.append(CheckResult(
                code=metadata["code"], rule="欄寬超過 80ch",
                status=Status.FAIL, file=file_path, line=line,
                snippet=f"{prop}: {value}",
                message=f"欄寬 {value} 超過 80 字元閱讀寬度限制",
                fix_suggestion=f"改為 {prop}: 80ch; 或使用 max-width: 80ch;",
            ))
        px_val = re.match(r"(\d+)\s*px", value, re.IGNORECASE)
        if px_val and int(px_val.group(1)) > 1280:
            results.append(CheckResult(
                code=metadata["code"], rule="欄寬超過 1280px 需人工確認",
                status=Status.NEEDS_HUMAN, file=file_path, line=line,
                snippet=f"{prop}: {value}",
                fix_suggestion="確認是否超過 80 字元（約 1280px@16px），考慮改用 ch 單位",
            ))
    return results
