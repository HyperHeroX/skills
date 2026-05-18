"""HM1410201C — <iframe>/<frame> 需有 title（A 4.1.2 名稱、角色、值）。

框架元素需以 title 屬性描述用途，否則螢幕閱讀器無法說明該區塊內容。
"""
from __future__ import annotations
import re
from ..checkers.result import CheckResult, Status
from . import _helpers as H

metadata = {
    "code": "HM1410201C",
    "criterion": "4.1.2",
    "level": "A",
    "category": "HTML",
    "rule": "<iframe>/<frame> 需有 title",
    "applies_to": ("vue", "html"),
}


def check(file_path: str, content: str) -> list[CheckResult]:
    template, offset = H.extract_template(content) if file_path.endswith(".vue") else (content, 0)
    results: list[CheckResult] = []
    for tag_name in ("iframe", "frame"):
        for m in re.finditer(rf"<{tag_name}(\s[^>]*)?>", template, re.IGNORECASE | re.DOTALL):
            line = H.line_of(template, m.start(), offset)
            tag = m.group(0)
            title = H.attr(tag, "title")
            if H.has_dynamic(tag, "title"):
                results.append(CheckResult(
                    code=metadata["code"], rule=f"{tag_name} title（動態需人工確認）",
                    status=Status.NEEDS_HUMAN, file=file_path, line=line,
                    snippet=tag[:80],
                    fix_suggestion="確認 :title 在所有狀態下均為非空的描述性文字",
                ))
            elif title is None or title.strip() == "":
                results.append(CheckResult(
                    code=metadata["code"], rule=f"{tag_name} 缺少 title",
                    status=Status.FAIL, file=file_path, line=line,
                    snippet=tag[:80],
                    message=f"<{tag_name}> 無 title 屬性，螢幕閱讀器無法描述其用途",
                    fix_suggestion=f"加上 title='描述此框架的用途'，例如 title='內嵌地圖'",
                ))
    return results
