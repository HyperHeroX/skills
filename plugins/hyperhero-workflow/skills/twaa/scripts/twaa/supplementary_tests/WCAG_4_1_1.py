"""WCAG-4.1.1 — ID 需唯一（補充靜態檢查）。

HM1410100C 檢查 DOCTYPE，本檢查補充：所有 id 屬性值需在頁面內唯一。
"""
from __future__ import annotations
import re
from collections import Counter
from ..checkers.result import CheckResult, Status
from . import _helpers as H

metadata = {
    "code": "WCAG-4.1.1",
    "criterion": "4.1.1",
    "level": "A",
    "category": "HTML",
    "rule": "ID 需唯一",
    "applies_to": ("vue", "html"),
    "informal": True,
}


def check(file_path: str, content: str) -> list[CheckResult]:
    template, offset = H.extract_template(content) if file_path.endswith(".vue") else (content, 0)
    # 排除動態 id（:id="..."）
    static_ids = re.findall(r'(?<![:@])\bid=["\']([^"\']+)["\']', template, re.IGNORECASE)
    results: list[CheckResult] = []
    for id_val, cnt in Counter(static_ids).items():
        if cnt > 1:
            results.append(CheckResult(
                code=metadata["code"], rule=metadata["rule"],
                status=Status.FAIL, file=file_path,
                message=f"id='{id_val}' 出現 {cnt} 次",
                fix_suggestion=f"確保每個 id 唯一；重複的元素改用 class 或加編號後綴如 '{id_val}-2'",
            ))
    return results
