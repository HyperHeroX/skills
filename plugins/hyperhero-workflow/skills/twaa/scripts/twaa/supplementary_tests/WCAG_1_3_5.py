"""WCAG-1.3.5 — 個人資訊欄位需有 autocomplete 屬性（補充靜態檢查）。

官方規範 1.3.5 標示「相關檢測碼:(無)」，但靜態可偵測：
若 input name/id 含個人資訊關鍵字（name/email/tel/address 等），應有對應的 autocomplete。
"""
from __future__ import annotations
import re
from ..checkers.result import CheckResult, Status
from . import _helpers as H

metadata = {
    "code": "WCAG-1.3.5",
    "criterion": "1.3.5",
    "level": "AA",
    "category": "HTML",
    "rule": "個人資訊欄位需有 autocomplete",
    "applies_to": ("vue", "html"),
    "informal": True,
}

_PERSONAL_FIELDS = {
    "name": "name", "fullname": "name", "fname": "given-name", "firstname": "given-name",
    "lname": "family-name", "lastname": "family-name",
    "email": "email", "mail": "email",
    "tel": "tel", "phone": "tel", "mobile": "tel",
    "address": "street-address",
    "city": "address-level2",
    "zip": "postal-code", "postal": "postal-code",
    "birthday": "bday", "birthdate": "bday",
    "company": "organization", "org": "organization",
}


def check(file_path: str, content: str) -> list[CheckResult]:
    template, offset = H.extract_template(content) if file_path.endswith(".vue") else (content, 0)
    results: list[CheckResult] = []
    for m in re.finditer(r"<input(\s[^>]*)?>", template, re.IGNORECASE | re.DOTALL):
        tag = m.group(0)
        if H.attr(tag, "autocomplete") is not None:
            continue
        name_or_id = (H.attr(tag, "name") or H.attr(tag, "id") or "").lower()
        if not name_or_id:
            continue
        for key, ac_value in _PERSONAL_FIELDS.items():
            if key in name_or_id:
                line = H.line_of(template, m.start(), offset)
                results.append(CheckResult(
                    code=metadata["code"], rule=metadata["rule"],
                    status=Status.FAIL, file=file_path, line=line,
                    snippet=tag[:80],
                    message=f"疑似個人資訊欄位（含 '{key}'）未設 autocomplete",
                    fix_suggestion=f"加上 autocomplete='{ac_value}'",
                ))
                break
    return results
