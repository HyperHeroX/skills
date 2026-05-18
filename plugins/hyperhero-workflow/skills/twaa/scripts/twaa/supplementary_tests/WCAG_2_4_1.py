"""WCAG-2.4.1 — 頁面需有跳過導覽 skip link（補充靜態檢查）。

雖然 HM1240102C 檢查 nav 分組，但 skip link 本身的存在性是另一個檢查。
靜態可偵測 <a href="#main"> 等 skip link 是否存在。

注意：本檢查只在「頁面 layout」檔（含 <html> 或 <body>）才執行，
元件子檔不應觸發此檢查。
"""
from __future__ import annotations
import re
from ..checkers.result import CheckResult, Status
from . import _helpers as H

metadata = {
    "code": "WCAG-2.4.1",
    "criterion": "2.4.1",
    "level": "A",
    "category": "HTML",
    "rule": "頁面需有跳過導覽 skip link",
    "applies_to": ("html",),  # 只檢測完整 HTML，不檢測 Vue 元件
    "informal": True,
}


def check(file_path: str, content: str) -> list[CheckResult]:
    # 只在含 <html> 或 <body> 的頁面 layout 才檢查
    if not re.search(r"<(html|body)\b", content, re.IGNORECASE):
        return []
    # 接受常見的 skip link 目標 id（main、content、login-form、register-form 等）
    # 也接受 .skip-link / .sr-only-focusable 等慣例 class
    has_skip = bool(re.search(
        r'<a\s[^>]*(?:class=["\'][^"\']*(?:skip|sr-only)[^"\']*["\']|href=["\']#(?:main|content|maincontent|main-content|primary|primary-content|[a-z-]+-form|[a-z-]+-content))',
        content, re.IGNORECASE,
    ))
    if has_skip:
        return []
    return [CheckResult(
        code=metadata["code"], rule=metadata["rule"],
        status=Status.FAIL, file=file_path,
        message="頁面未找到跳過導覽 skip link（href='#main' 等）",
        fix_suggestion=(
            "在 <body> 第一個元素加入：\n"
            "<a class='skip-link' href='#main-content'>跳至主要內容</a>\n"
            "並確保主要內容區有 id='main-content'"
        ),
    )]
