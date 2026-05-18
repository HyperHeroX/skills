"""HM1240102C — 多個導覽連結需以 <nav> 分組（A 2.4.1）。

頁面同時有多個連結群組（主選單、頁尾、相關連結）時，
應以 <nav> 標籤包裹並用 aria-label 區分。
"""
from __future__ import annotations
import re
from ..checkers.result import CheckResult, Status
from . import _helpers as H

metadata = {
    "code": "HM1240102C",
    "criterion": "2.4.1",
    "level": "A",
    "category": "HTML",
    "rule": "導覽連結需以 <nav> 分組",
    "applies_to": ("vue", "html"),
}


def check(file_path: str, content: str) -> list[CheckResult]:
    template, _ = H.extract_template(content) if file_path.endswith(".vue") else (content, 0)
    nav_blocks = re.findall(r"<nav[\s>].*?</nav>", template, re.DOTALL | re.IGNORECASE)
    links_in_nav = sum(len(re.findall(r"<a\s", b, re.IGNORECASE)) for b in nav_blocks)
    total_links = len(re.findall(r"<a\s[^>]*href", template, re.IGNORECASE))
    if total_links >= 3 and links_in_nav < total_links * 0.5:
        nav_count = len(nav_blocks)
        return [CheckResult(
            code=metadata["code"], rule=metadata["rule"],
            status=Status.NEEDS_HUMAN if nav_count > 0 else Status.FAIL,
            file=file_path,
            message=(
                f"頁面共 {total_links} 個連結，<nav> 元素 {nav_count} 個，"
                f"nav 內連結僅 {links_in_nav} 個，請確認導覽群組皆有 <nav>"
            ),
            fix_suggestion=(
                "將導覽連結群組以 <nav> 包裹，並加上 aria-label 區分：\n"
                "<nav aria-label='主要導覽'>...</nav>\n"
                "<nav aria-label='相關連結'>...</nav>"
            ),
        )]
    return []
