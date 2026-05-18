"""HM1130200C — RTL 語言元素需有 dir 屬性或 RLM/LRM 標記（A 1.3.2）。

混合左右走向文字時，輔助科技需 dir 屬性或 Unicode 雙向控制字元才能正確閱讀。
"""
from __future__ import annotations
import re
from ..checkers.result import CheckResult, Status
from . import _helpers as H

metadata = {
    "code": "HM1130200C",
    "criterion": "1.3.2",
    "level": "A",
    "category": "HTML",
    "rule": "RTL 語言元素需有 dir 屬性或 RLM/LRM 標記",
    "applies_to": ("vue", "html"),
}

_RTL_LANGS = {"he", "ar", "fa", "ur", "yi", "dv", "ug", "az", "ps", "sd"}


def check(file_path: str, content: str) -> list[CheckResult]:
    template, offset = H.extract_template(content) if file_path.endswith(".vue") else (content, 0)
    results: list[CheckResult] = []
    for m in re.finditer(r'<(\w+)\s([^>]*)lang=["\']?(\S+?)["\']?[\s>]', template, re.IGNORECASE):
        lang_val = m.group(3).lower().split("-")[0]
        if lang_val not in _RTL_LANGS:
            continue
        line = H.line_of(template, m.start(), offset)
        tag = m.group(0)
        has_dir = bool(re.search(r'\bdir\s*=', tag, re.IGNORECASE))
        ctx = template[max(0, m.start() - 200): m.end() + 200]
        has_marker = bool(re.search(r'&#x200[ef];|‏|‎', ctx, re.IGNORECASE))
        if not has_dir and not has_marker:
            results.append(CheckResult(
                code=metadata["code"], rule=metadata["rule"],
                status=Status.FAIL, file=file_path, line=line,
                snippet=tag[:80],
                message=f"lang='{m.group(3)}' 為 RTL 語言，但元素無 dir='rtl' 且無 RLM/LRM 標記",
                fix_suggestion=f"加上 dir='rtl'：<{m.group(1)} lang='{m.group(3)}' dir='rtl'>...",
            ))
    return results
