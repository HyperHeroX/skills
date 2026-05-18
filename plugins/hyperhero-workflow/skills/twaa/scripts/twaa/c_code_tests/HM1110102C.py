"""HM1110102C — 圖片 longdesc 屬性需為有效 URI（A 1.1.1 H45/G73/G74）。

當 `<img>` 使用 longdesc 提供長描述時，longdesc 值必須是合法 URI（含 fragment 或檔案路徑）。
"""
from __future__ import annotations
import re
from ..checkers.result import CheckResult, Status
from . import _helpers as H

metadata = {
    "code": "HM1110102C",
    "criterion": "1.1.1",
    "level": "A",
    "category": "HTML",
    "rule": "圖片 longdesc 需為有效 URI",
    "applies_to": ("vue", "html"),
}

# 簡單 URI 樣式：相對路徑、絕對路徑、http(s)、片段 #anchor
_URI_RE = re.compile(r"^(https?:\/\/|\/|\.\.?\/|[\w.-]+\.[a-z]+|#[\w.-]+).*$", re.IGNORECASE)


def check(file_path: str, content: str) -> list[CheckResult]:
    template, offset = H.extract_template(content) if file_path.endswith(".vue") else (content, 0)
    results: list[CheckResult] = []
    for m in re.finditer(r"<img(\s[^>]*)?>", template, re.IGNORECASE | re.DOTALL):
        tag = m.group(0)
        longdesc = H.attr(tag, "longdesc")
        if longdesc is None:
            continue  # 沒有 longdesc 不檢測（非必填）
        if H.has_dynamic(tag, "longdesc"):
            continue
        line = H.line_of(template, m.start(), offset)
        if longdesc.strip() == "" or not _URI_RE.match(longdesc.strip()):
            results.append(CheckResult(
                code=metadata["code"], rule=metadata["rule"],
                status=Status.FAIL, file=file_path, line=line,
                snippet=tag[:80],
                message=f"longdesc='{longdesc}' 不是有效 URI",
                fix_suggestion='longdesc 應指向描述頁面或片段，例：longdesc="thispage.html#chart-desc"',
            ))
    return results
