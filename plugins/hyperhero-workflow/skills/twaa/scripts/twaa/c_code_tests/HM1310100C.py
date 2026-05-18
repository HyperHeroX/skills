"""HM1310100C — <html lang> 必須存在且非空（A 3.1.1 頁面語言）。

頁面 lang 屬性是輔助科技判斷朗讀方式的關鍵。
台灣 MODA 官方建議用 zh-Hant-TW（語言-字集-地區）。
"""
from __future__ import annotations
import re
from ..checkers.result import CheckResult, Status
from . import _helpers as H

metadata = {
    "code": "HM1310100C",
    "criterion": "3.1.1",
    "level": "A",
    "category": "HTML",
    "rule": "<html lang> 必須存在且非空",
    "applies_to": ("html",),
}


def check(file_path: str, content: str) -> list[CheckResult]:
    m = re.search(r"<html(\s[^>]*)?>", content, re.IGNORECASE)
    if not m:
        return []
    tag = m.group(0)
    lang = H.attr(tag, "lang")
    if H.has_dynamic(tag, "lang"):
        return [CheckResult(
            code=metadata["code"], rule="html lang（動態需人工確認）",
            status=Status.NEEDS_HUMAN, file=file_path, snippet=tag[:80],
            fix_suggestion="確認 :lang 動態值為有效 BCP 47 標籤，如 'zh-Hant-TW'、'en'",
        )]
    if lang is None or lang.strip() == "":
        return [CheckResult(
            code=metadata["code"], rule="<html> 缺少 lang 屬性",
            status=Status.FAIL, file=file_path, snippet=tag[:80],
            message="<html> 未宣告 lang 屬性，輔助科技無法正確判斷頁面語言",
            fix_suggestion="改為 <html lang='zh-Hant-TW'>（繁體中文台灣）",
        )]
    if lang.lower() == "zh-tw":
        return [CheckResult(
            code=metadata["code"], rule="html lang 建議改為 zh-Hant-TW",
            status=Status.NEEDS_HUMAN, file=file_path, snippet=tag[:80],
            message=f"lang='{lang}' 可接受，但台灣 MODA 官方建議使用 zh-Hant-TW",
            fix_suggestion="建議改為 <html lang='zh-Hant-TW'>",
        )]
    return []
