"""HM1110105C — 物件組件需有替代文字內容（A 1.1.1 H35/H46/H53）。

`<applet>`、`<embed>`、`<object>` 等物件組件需提供替代內容，作法：
- `<object>` 內嵌入文字、`<img alt>`、或巢狀 `<object>` 替代
- `<embed>` 後緊接 `<noembed>` 提供文字替代
- `<applet>` 內嵌入文字或圖片
"""
from __future__ import annotations
import re
from ..checkers.result import CheckResult, Status
from . import _helpers as H

metadata = {
    "code": "HM1110105C",
    "criterion": "1.1.1",
    "level": "A",
    "category": "HTML",
    "rule": "物件組件需有替代文字內容",
    "applies_to": ("vue", "html"),
}


def _has_text_or_alt(inner: str) -> bool:
    """檢查 inner 是否含有非空文字、含 alt 的 img、或巢狀替代物件。"""
    plain_text = re.sub(r"<[^>]+>", "", inner).strip()
    if plain_text:
        return True
    if re.search(r'<img\s[^>]*alt=["\'][^"\']+["\']', inner, re.IGNORECASE):
        return True
    if re.search(r"<noembed[\s>]", inner, re.IGNORECASE):
        return True
    if re.search(r"<a\s[^>]*href", inner, re.IGNORECASE):
        return True
    return False


def check(file_path: str, content: str) -> list[CheckResult]:
    template, offset = H.extract_template(content) if file_path.endswith(".vue") else (content, 0)
    results: list[CheckResult] = []
    for tag_name in ("object", "applet", "embed"):
        for m in re.finditer(
            rf"<{tag_name}(\s[^>]*)?>(.*?)</{tag_name}>",
            template, re.IGNORECASE | re.DOTALL,
        ):
            inner = m.group(2)
            line = H.line_of(template, m.start(), offset)
            if not _has_text_or_alt(inner):
                results.append(CheckResult(
                    code=metadata["code"], rule=metadata["rule"],
                    status=Status.FAIL, file=file_path, line=line,
                    snippet=m.group(0)[:80],
                    message=f"<{tag_name}> 內未提供替代文字或替代內容",
                    fix_suggestion=(
                        f"在 <{tag_name}> 內加入文字描述、含 alt 的 <img>、或 <noembed>"
                    ),
                ))
        # 自閉合的 <embed ...> 沒有 </embed>，後面應緊接 <noembed>
        if tag_name == "embed":
            for m in re.finditer(r"<embed(\s[^>]*)?/?>", template, re.IGNORECASE):
                tag = m.group(0)
                if tag.rstrip("/>").strip().endswith(">") and not tag.endswith("/>"):
                    # 是否後面有 </embed> 配對？若無，視為自閉合
                    if re.search(r"</embed>", template[m.end():m.end() + 200], re.IGNORECASE):
                        continue
                line = H.line_of(template, m.start(), offset)
                tail = template[m.end(): m.end() + 200]
                if not re.match(r"\s*<noembed", tail, re.IGNORECASE):
                    results.append(CheckResult(
                        code=metadata["code"], rule="自閉合 <embed> 未接 <noembed>",
                        status=Status.NEEDS_HUMAN, file=file_path, line=line,
                        snippet=tag[:80],
                        fix_suggestion="在 <embed> 後緊接 <noembed>替代文字</noembed>",
                    ))
    return results
