"""HM2310200C — 局部語系標籤需有 lang 屬性（AA 3.1.2 部分內容語言）。

頁面內含外語區段時，需在外語元素加 lang 屬性以協助螢幕閱讀器使用正確語音。
"""
from __future__ import annotations
import re
from ..checkers.result import CheckResult, Status
from . import _helpers as H

metadata = {
    "code": "HM2310200C",
    "criterion": "3.1.2",
    "level": "AA",
    "category": "HTML",
    "rule": "外語內容需標記 lang 屬性",
    "applies_to": ("vue", "html"),
}

_FOREIGN_PATTERNS = [
    (r"[぀-ゟ゠-ヿ]", "ja", "日文"),
    (r"[가-힯]", "ko", "韓文"),
    (r"[֐-׿]", "he", "希伯來文"),
    (r"[؀-ۿ]", "ar", "阿拉伯文"),
    (r"[฀-๿]", "th", "泰文"),
]


def check(file_path: str, content: str) -> list[CheckResult]:
    template, offset = H.extract_template(content) if file_path.endswith(".vue") else (content, 0)
    results: list[CheckResult] = []
    for m_tag in re.finditer(r"<(\w+)(\s[^>]*)?>(.+?)</\1>", template, re.DOTALL | re.IGNORECASE):
        tag_name = m_tag.group(1).lower()
        if tag_name in {"script", "style", "code", "pre"}:
            continue
        attrs = m_tag.group(2) or ""
        inner = m_tag.group(3)
        if re.search(r'\blang\s*=', attrs, re.IGNORECASE):
            continue
        line = H.line_of(template, m_tag.start(), offset)
        for pattern, lang_code, lang_name in _FOREIGN_PATTERNS:
            if re.search(pattern, inner):
                results.append(CheckResult(
                    code=metadata["code"],
                    rule=f"外語內容需標記 lang（偵測到{lang_name}）",
                    status=Status.NEEDS_HUMAN, file=file_path, line=line,
                    snippet=f"<{tag_name}>{inner[:40]}</{tag_name}>",
                    message=f"元素內含疑似{lang_name}文字但未標記 lang='{lang_code}'",
                    fix_suggestion=f"加上 lang='{lang_code}'：<{tag_name} lang='{lang_code}'>...",
                ))
                break
    return results
