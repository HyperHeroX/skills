"""WCAG-2.4.3 — 焦點順序需保留意義（補充靜態檢查）。

官方規範 2.4.3 標示「相關檢測碼:(無)」。靜態可偵測「正值 tabindex」：
tabindex > 0 會破壞自然 Tab 順序，使焦點順序與 DOM 順序不一致，
通常違反 2.4.3。建議只用 tabindex="0"（讓元件可獲焦點）或 "-1"（程式化聚焦）。
"""
from __future__ import annotations
import re
from ..checkers.result import CheckResult, Status
from . import _helpers as H

metadata = {
    "code": "WCAG-2.4.3",
    "criterion": "2.4.3",
    "level": "A",
    "category": "HTML",
    "rule": "正值 tabindex 破壞焦點順序",
    "applies_to": ("vue", "html"),
    "informal": True,
}


def check(file_path: str, content: str) -> list[CheckResult]:
    template, offset = H.extract_template(content) if file_path.endswith(".vue") else (content, 0)
    results: list[CheckResult] = []
    for m in re.finditer(
        r'tabindex\s*=\s*["\']?(\d+)["\']?',
        template, re.IGNORECASE,
    ):
        try:
            val = int(m.group(1))
        except ValueError:
            continue
        if val > 0:
            line = H.line_of(template, m.start(), offset)
            # 取週圍 60 字元當 snippet
            start = max(0, m.start() - 30)
            end = min(len(template), m.end() + 30)
            results.append(CheckResult(
                code=metadata["code"], rule=metadata["rule"],
                status=Status.FAIL, file=file_path, line=line,
                snippet=template[start:end],
                message=f'tabindex="{val}" 為正值，會強制改變自然 Tab 順序',
                fix_suggestion=(
                    'tabindex 只應用 "0"（加入 Tab 順序）或 "-1"（程式化聚焦）。'
                    "正值會讓焦點順序與 DOM 順序不一致，影響 keyboard 與螢幕閱讀器使用者。"
                ),
            ))
    return results
