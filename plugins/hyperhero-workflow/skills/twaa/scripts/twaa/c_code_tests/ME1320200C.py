"""ME1320200C — 下載連結需提供開放格式版本（A 3.2.2 預期行為）。

提供 .docx/.xlsx/.pptx 等商用格式時，應同時提供 ODF/PDF 等開放格式，
讓未安裝商用軟體的使用者也能讀取（也避免廠商鎖定）。
"""
from __future__ import annotations
import re
from ..checkers.result import CheckResult, Status
from . import _helpers as H

metadata = {
    "code": "ME1320200C",
    "criterion": "3.2.2",
    "level": "A",
    "category": "Media",
    "rule": "下載連結需為開放格式",
    "applies_to": ("vue", "html"),
}

_PROPRIETARY = {
    ".doc", ".docx", ".xls", ".xlsx", ".ppt", ".pptx",
    ".mdb", ".accdb", ".pub", ".vsd", ".pages", ".numbers", ".key",
}


def check(file_path: str, content: str) -> list[CheckResult]:
    template, offset = H.extract_template(content) if file_path.endswith(".vue") else (content, 0)
    results: list[CheckResult] = []
    for m in re.finditer(r'href=["\']([^"\']*(\.\w+))["\']', template, re.IGNORECASE):
        url = m.group(1)
        ext = m.group(2).lower()
        if ext not in _PROPRIETARY:
            continue
        line = H.line_of(template, m.start(), offset)
        # 檢查同檔案是否已提供對應 ODF（簡化判斷：同 stem 不同副檔名）
        stem = url[: -len(ext)]
        has_odf = bool(
            re.search(
                rf'href=["\']{re.escape(stem)}\.(odt|ods|odp|odg|pdf)["\']',
                template, re.IGNORECASE,
            )
        )
        if has_odf:
            continue  # 已同時提供開放格式，通過
        results.append(CheckResult(
            code=metadata["code"], rule=metadata["rule"],
            status=Status.FAIL, file=file_path, line=line,
            snippet=f'href="{url}"',
            message=f"連結 '{url}' 為商用格式（{ext}），需同時提供開放格式版本",
            fix_suggestion=(
                "同時提供以下格式：\n"
                "  .docx → .odt（LibreOffice Writer）\n"
                "  .xlsx → .ods（LibreOffice Calc）\n"
                "  .pptx → .odp（LibreOffice Impress）\n"
                "或轉換為 PDF 格式"
            ),
        ))
    return results
