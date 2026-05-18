"""WCAG-2.1.1 — 鍵盤可操作（補充靜態檢查）。

官方規範 2.1.1 標示「相關檢測碼:(無)」。靜態可偵測常見反模式：
非互動元素（div/span）若有 onclick / @click 但缺 keydown 監聽 / 缺 role / 缺 tabindex，
鍵盤使用者無法操作。

註：HM1410200C 偵測「缺 role」，本檢查補充偵測「有 role 但缺鍵盤事件」。
"""
from __future__ import annotations
import re
from ..checkers.result import CheckResult, Status
from . import _helpers as H

metadata = {
    "code": "WCAG-2.1.1",
    "criterion": "2.1.1",
    "level": "A",
    "category": "Script",
    "rule": "非互動元素帶 click 缺鍵盤對應",
    "applies_to": ("vue", "html"),
    "informal": True,
}


def check(file_path: str, content: str) -> list[CheckResult]:
    template, offset = H.extract_template(content) if file_path.endswith(".vue") else (content, 0)
    results: list[CheckResult] = []
    for m in re.finditer(
        r"<(div|span)(\s[^>]*(?:@click|v-on:click|onclick)[^>]*)>",
        template, re.IGNORECASE | re.DOTALL,
    ):
        tag = m.group(0)
        line = H.line_of(template, m.start(), offset)
        has_keydown = bool(re.search(
            r'(@keydown|@keyup|@keypress|v-on:key|onkey)',
            tag, re.IGNORECASE,
        ))
        has_tabindex = H.attr(tag, "tabindex") is not None
        if not has_keydown or not has_tabindex:
            results.append(CheckResult(
                code=metadata["code"], rule=metadata["rule"],
                status=Status.FAIL, file=file_path, line=line,
                snippet=tag[:80],
                message=f"<{m.group(1)}> 帶 click 但 {'缺 keydown 事件' if not has_keydown else ''}{'，' if not has_keydown and not has_tabindex else ''}{'缺 tabindex' if not has_tabindex else ''}",
                fix_suggestion=(
                    "建議改用原生 <button>。若必須用 div/span：\n"
                    '加上 tabindex="0" + @keydown.enter / @keydown.space 處理鍵盤啟動'
                ),
            ))
    return results
