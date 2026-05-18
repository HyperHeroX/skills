"""HM1240400C — 毗鄰圖片+文字連結：圖片 alt 應為空字串（A 2.4.4）。

當 <a> 內同時含 <img> 和文字時，圖片 alt 必須為空，
否則螢幕閱讀器會重複朗讀（先念 alt 再念文字）。
"""
from __future__ import annotations
import re
from ..checkers.result import CheckResult, Status
from . import _helpers as H

metadata = {
    "code": "HM1240400C",
    "criterion": "2.4.4",
    "level": "A",
    "category": "HTML",
    "rule": "毗鄰圖片+文字連結：圖片 alt 應為空",
    "applies_to": ("vue", "html"),
}


def check(file_path: str, content: str) -> list[CheckResult]:
    template, offset = H.extract_template(content) if file_path.endswith(".vue") else (content, 0)
    results: list[CheckResult] = []
    link_re = re.compile(r"<a(\s[^>]*)?>(.+?)</a>", re.DOTALL | re.IGNORECASE)
    for m in link_re.finditer(template):
        line = H.line_of(template, m.start(), offset)
        a_attrs = "<a" + (m.group(1) or "") + ">"
        # 若 <a> 已有 aria-label / aria-labelledby，accessible name 由它決定，
        # img alt 不會重複朗讀 — 跳過此檢查（避免誤判）
        if H.attr(a_attrs, "aria-label") or H.attr(a_attrs, "aria-labelledby"):
            continue
        if H.has_dynamic(a_attrs, "aria-label") or H.has_dynamic(a_attrs, "aria-labelledby"):
            continue
        inner = m.group(2)
        imgs = re.findall(r"<img(\s[^>]*)?>", inner, re.IGNORECASE | re.DOTALL)
        text = re.sub(r"<[^>]+>", "", inner).strip()
        if not imgs or not text:
            continue
        for img_attrs in imgs:
            alt = H.attr("<img" + img_attrs + ">", "alt")
            if alt is not None and alt.strip():
                results.append(CheckResult(
                    code=metadata["code"], rule=metadata["rule"],
                    status=Status.FAIL, file=file_path, line=line,
                    snippet=m.group(0)[:80],
                    message=f"<a> 內含圖片（alt='{alt}'）且有文字，alt 應改為空字串避免重複朗讀",
                    fix_suggestion='將 <img> 的 alt 屬性改為空字串：alt=""，或在 <a> 加 aria-label',
                ))
    return results
