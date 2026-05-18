"""WCAG-2.4.4 — 連結文字需有意義（補充靜態檢查）。

HM1240401C 檢查連結是否「有」文字，本檢查補充：文字是否「有意義」。
偵測常見的 anti-pattern：「按這裡」「點擊」「more」「click here」等。
"""
from __future__ import annotations
import re
from ..checkers.result import CheckResult, Status
from . import _helpers as H

metadata = {
    "code": "WCAG-2.4.4",
    "criterion": "2.4.4",
    "level": "A",
    "category": "HTML",
    "rule": "連結文字需有意義",
    "applies_to": ("vue", "html"),
    "informal": True,
}

_MEANINGLESS = re.compile(
    r"^\s*(按此|點此|點擊|按這裡|點這裡|here|click here|read more|more|詳情|連結|link|more info)\s*$",
    re.IGNORECASE,
)


def check(file_path: str, content: str) -> list[CheckResult]:
    template, offset = H.extract_template(content) if file_path.endswith(".vue") else (content, 0)
    results: list[CheckResult] = []
    for m in re.finditer(r"<a\s[^>]*>(.+?)</a>", template, re.DOTALL | re.IGNORECASE):
        line = H.line_of(template, m.start(), offset)
        inner = re.sub(r"<[^>]+>", "", m.group(1)).strip()
        if _MEANINGLESS.match(inner):
            results.append(CheckResult(
                code=metadata["code"], rule=metadata["rule"],
                status=Status.FAIL, file=file_path, line=line,
                snippet=m.group(0)[:80],
                message=f"連結文字 '{inner}' 脫離脈絡後意義不明確",
                fix_suggestion="改為描述目的地的文字，例如：'查看年度報告'、'前往個人設定'",
            ))
    return results
