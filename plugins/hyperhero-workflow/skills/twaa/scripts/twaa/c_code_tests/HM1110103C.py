"""HM1110103C — 字符圖案/表情符號需透過標題屬性提供替代文字（A 1.1.1）。

當網頁內容使用「挪用文字外型作為表意功能」的語言形式時，例如：
- ASCII art / 字符圖案：`:-)`、`<3`、`>_<`、`(╯°□°)╯`
- 純 Unicode 表情符號：😀 ❤️ 👍（在元件中作為主要意義載體）
- 特殊符號圖案：★ ☆ ♣ ♥（作為視覺標記但無文字說明）

由於螢幕閱讀器無法解讀這類圖案的視覺意涵，必須透過合適組件的
title 屬性（或 aria-label）提供替代文字，且其值不得為空字串或空白。
"""
from __future__ import annotations
import re
from ..checkers.result import CheckResult, Status
from . import _helpers as H

metadata = {
    "code": "HM1110103C",
    "criterion": "1.1.1",
    "level": "A",
    "category": "HTML",
    "rule": "字符圖案/表情符號需 title 提供替代文字",
    "applies_to": ("vue", "html"),
}

# Unicode 表情符號與圖形字符範圍（粗略）
_EMOJI_RE = re.compile(
    "["
    "\U0001F300-\U0001F9FF"   # 各種表情符號
    "\U0001F600-\U0001F64F"   # 表情
    "\U0001F680-\U0001F6FF"   # 交通與符號
    "\U00002600-\U000026FF"   # 雜項符號 ☀☁☂…
    "\U00002700-\U000027BF"   # 裝飾符號 ✂✈…
    "\U00002B00-\U00002BFF"   # 箭頭 ⬅⬆…
    "\U00002190-\U000021FF"   # 箭頭 ←→
    "\U00002600-\U000026FF"   # 雜項符號
    "★☆♣♥♦♪♫♬"               # 特殊符號圖案
    "]"
)

# ASCII art 樣式：連續 3+ 標點且不含字母
# 注意：必須排除電話號碼、地址等含數字的常見格式（避免誤判）
_ASCII_ART_RE = re.compile(r"(?:[<>:;\^_\-\=\*\|]\s?){3,}")
# 數字密集的內容（電話號碼、編號、坐標）— 不視為 ASCII 圖案
_NUMERIC_HEAVY_RE = re.compile(r"\d.*\d")


def _has_alt_attr(tag_attrs: str) -> bool:
    """檢查標籤是否提供任一替代文字屬性。"""
    return bool(
        H.attr(tag_attrs, "title") or
        H.attr(tag_attrs, "aria-label") or
        H.attr(tag_attrs, "aria-labelledby") or
        H.has_dynamic(tag_attrs, "title") or
        H.has_dynamic(tag_attrs, "aria-label")
    )


def check(file_path: str, content: str) -> list[CheckResult]:
    template, offset = H.extract_template(content) if file_path.endswith(".vue") else (content, 0)
    results: list[CheckResult] = []

    # 找所有元素及其內部文字（限定常用標籤，避免 script/style 干擾）
    for m in re.finditer(
        r"<(span|button|a|i|em|strong|p|td|th|li|div)(\s[^>]*)?>([^<]*)</\1>",
        template, re.IGNORECASE | re.DOTALL,
    ):
        tag_name = m.group(1).lower()
        tag_attrs_str = "<" + tag_name + (m.group(2) or "") + ">"
        inner = m.group(3).strip()
        if not inner:
            continue
        line = H.line_of(template, m.start(), offset)

        # 1. 內容只含表情符號（剝除空白後仍只剩 emoji）
        emoji_only = bool(inner) and _EMOJI_RE.match(inner) and len(_EMOJI_RE.sub("", inner).strip()) == 0
        # 2. 內容像 ASCII art：含 ASCII 標點圖案 + 非中英文字佔比高 + 不像電話號碼/數字內容
        ascii_art = (
            bool(_ASCII_ART_RE.search(inner))
            and len(re.sub(r"[A-Za-z一-鿿]", "", inner)) >= len(inner) * 0.7
            and not _NUMERIC_HEAVY_RE.search(inner)  # 排除電話/編號/坐標
        )

        if not (emoji_only or ascii_art):
            continue

        if _has_alt_attr(tag_attrs_str):
            continue

        # 父元素也視為合格（如 <button title="..."><span>★</span></button>）
        parent_window = template[max(0, m.start() - 200): m.start()]
        if re.search(r'(title|aria-label)\s*=\s*["\'][^"\']+["\']', parent_window, re.IGNORECASE):
            continue

        kind = "表情符號" if emoji_only else "ASCII 圖案/字符圖案"
        results.append(CheckResult(
            code=metadata["code"], rule=metadata["rule"],
            status=Status.FAIL, file=file_path, line=line,
            snippet=f"<{tag_name}>{inner[:30]}</{tag_name}>",
            message=f"{kind} '{inner[:20]}' 缺少 title / aria-label 替代文字",
            fix_suggestion=(
                f'加上 title 或 aria-label 描述其意義：\n'
                f'<{tag_name} title="說明此符號的意思">{inner}</{tag_name}>'
            ),
        ))
    return results
