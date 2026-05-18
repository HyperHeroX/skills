"""HM1130103C — 表單控制元件需有 label 或 title（A 1.3.1 H44/H65）。

每個可見的 input/select/textarea 必須有可識別的標籤：
- 優先使用 `<label for="id">` 與 input 的 id 配對
- 次選 aria-label / aria-labelledby
- 最後選 title 屬性（不建議，僅在 label 不可用時使用）
"""
from __future__ import annotations
import re
from ..checkers.result import CheckResult, Status
from . import _helpers as H

metadata = {
    "code": "HM1130103C",
    "criterion": "1.3.1",
    "level": "A",
    "category": "HTML",
    "rule": "表單控制元件需有 label 或 title",
    "applies_to": ("vue", "html"),
}

_SKIP_TYPES = {"hidden", "submit", "reset", "button", "image"}
_FORM_TAGS = ("input", "select", "textarea")


def check(file_path: str, content: str) -> list[CheckResult]:
    template, offset = H.extract_template(content) if file_path.endswith(".vue") else (content, 0)
    results: list[CheckResult] = []

    for tag_name in _FORM_TAGS:
        for m in re.finditer(rf"<{tag_name}(\s[^>]*)?/?>", template, re.IGNORECASE | re.DOTALL):
            tag = m.group(0)
            if tag_name == "input":
                typ = (H.attr(tag, "type") or "text").lower()
                if typ in _SKIP_TYPES:
                    continue
            line = H.line_of(template, m.start(), offset)

            # 1. 透過 id + <label for> 配對
            elem_id = H.attr(tag, "id")
            if elem_id and re.search(
                rf'<label\s[^>]*for=["\']?{re.escape(elem_id)}["\']?',
                template, re.IGNORECASE,
            ):
                continue

            # 2. aria-label / aria-labelledby
            if H.attr(tag, "aria-label") or H.attr(tag, "aria-labelledby"):
                continue
            if H.has_dynamic(tag, "aria-label") or H.has_dynamic(tag, "aria-labelledby"):
                continue

            # 3. title（不推薦但可接受）
            if (H.attr(tag, "title") or "").strip():
                continue

            # 4. 被 <label> 包裹（implicit label）
            preceding = template[:m.start()][-300:]
            if re.search(r"<label[^>]*>[^<]*$", preceding, re.IGNORECASE):
                continue

            results.append(CheckResult(
                code=metadata["code"], rule=metadata["rule"],
                status=Status.FAIL, file=file_path, line=line,
                snippet=tag[:80],
                message=f"<{tag_name}> 缺少 label 關聯（無 <label for>、aria-label、title 等）",
                fix_suggestion=(
                    "1. 加 id 與 <label for=id> 配對（建議）\n"
                    "2. 加 aria-label='欄位描述'\n"
                    "3. 加 title='欄位描述'（最後手段）"
                ),
            ))
    return results
