"""HM1130101C — 表格 <th> 需有 scope 屬性（A 1.3.1 H63）。

含有多列標題的資料表格，`<th>` 必須用 scope="row" 或 scope="col"
讓螢幕閱讀器知道每個資料儲存格屬於哪個行/列標題。
也可改用 id+headers 屬性建立關聯，本檢查接受兩種寫法。
"""
from __future__ import annotations
import re
from ..checkers.result import CheckResult, Status
from . import _helpers as H

metadata = {
    "code": "HM1130101C",
    "criterion": "1.3.1",
    "level": "A",
    "category": "HTML",
    "rule": "表格 <th> 需有 scope 或 id+headers 關聯",
    "applies_to": ("vue", "html"),
}


def check(file_path: str, content: str) -> list[CheckResult]:
    template, offset = H.extract_template(content) if file_path.endswith(".vue") else (content, 0)
    results: list[CheckResult] = []

    for tm in re.finditer(r"<table(\s[^>]*)?>(.*?)</table>", template, re.DOTALL | re.IGNORECASE):
        table_html = tm.group(2)
        # 計算 th 數量；只在有多個 th 時才視為「資料表格」需 scope
        ths = list(re.finditer(r"<th(\s[^>]*)?>", table_html, re.IGNORECASE))
        if len(ths) < 2:
            continue
        # 是否有 td 帶 headers 屬性？若是則整體允許 id+headers 模式
        has_td_headers = bool(re.search(r"<td\s[^>]*headers=", table_html, re.IGNORECASE))
        for thm in ths:
            tag = "<th" + (thm.group(1) or "") + ">"
            if has_td_headers and H.attr(tag, "id"):
                continue  # id+headers 模式，已合規
            scope = H.attr(tag, "scope")
            if scope not in {"row", "col", "rowgroup", "colgroup"}:
                line = H.line_of(template, tm.start(2) + thm.start(), offset)
                results.append(CheckResult(
                    code=metadata["code"], rule=metadata["rule"],
                    status=Status.FAIL, file=file_path, line=line,
                    snippet=tag[:80],
                    message=f"<th> 缺 scope 屬性（多列標題表格中）",
                    fix_suggestion='加上 scope="col"（直行標題）或 scope="row"（橫列標題）',
                ))
    return results
