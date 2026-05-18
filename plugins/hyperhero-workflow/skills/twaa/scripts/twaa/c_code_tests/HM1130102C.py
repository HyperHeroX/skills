"""HM1130102C — 表單群組需用 <fieldset> + <legend>（A 1.3.1 H71）。

當表單有多個相關欄位形成群組（如 radio 群組、地址欄位群、聯絡資訊群）時，
應用 `<fieldset>` 包裹並以 `<legend>` 提供群組標題，
讓螢幕閱讀器使用者了解群組的整體用途。
"""
from __future__ import annotations
import re
from ..checkers.result import CheckResult, Status
from . import _helpers as H

metadata = {
    "code": "HM1130102C",
    "criterion": "1.3.1",
    "level": "A",
    "category": "HTML",
    "rule": "表單群組需用 <fieldset> + <legend>",
    "applies_to": ("vue", "html"),
}


def check(file_path: str, content: str) -> list[CheckResult]:
    template, offset = H.extract_template(content) if file_path.endswith(".vue") else (content, 0)
    results: list[CheckResult] = []

    # 1. 檢查 fieldset 必須包含 legend
    for m in re.finditer(r"<fieldset(\s[^>]*)?>(.*?)</fieldset>", template, re.DOTALL | re.IGNORECASE):
        line = H.line_of(template, m.start(), offset)
        inner = m.group(2)
        legend_m = re.search(r"<legend(\s[^>]*)?>(.*?)</legend>", inner, re.DOTALL | re.IGNORECASE)
        if not legend_m:
            results.append(CheckResult(
                code=metadata["code"], rule="<fieldset> 缺 <legend>",
                status=Status.FAIL, file=file_path, line=line,
                snippet=m.group(0)[:80],
                message="<fieldset> 內未提供 <legend>，群組失去標題",
                fix_suggestion="在 <fieldset> 內第一個元素加上 <legend>群組標題</legend>",
            ))
            continue
        legend_text = re.sub(r"<[^>]+>", "", legend_m.group(2)).strip()
        if not legend_text:
            results.append(CheckResult(
                code=metadata["code"], rule="<legend> 內容為空",
                status=Status.FAIL, file=file_path, line=line,
                snippet=m.group(0)[:80],
                message="<legend> 內容為空字串",
                fix_suggestion="<legend> 內提供群組標題文字",
            ))

    # 2. 偵測 radio 群組未用 fieldset 包裹（需人工確認，因可能用 ARIA 替代）
    radios_by_name: dict[str, list[int]] = {}
    for rm in re.finditer(r'<input(\s[^>]*type=["\']?radio["\']?[^>]*)?>', template, re.IGNORECASE):
        tag = rm.group(0)
        name = H.attr(tag, "name")
        if name:
            radios_by_name.setdefault(name, []).append(rm.start())
    for name, positions in radios_by_name.items():
        if len(positions) < 2:
            continue
        # 確認是否在 <fieldset> 中
        first = positions[0]
        # 找前面最近的 <fieldset>，再看是否在對應 </fieldset> 之前
        fieldset_before = list(re.finditer(r"<fieldset(\s[^>]*)?>", template[:first], re.IGNORECASE))
        in_fieldset = False
        if fieldset_before:
            fs_start = fieldset_before[-1].start()
            fs_end_m = re.search(r"</fieldset>", template[fs_start:], re.IGNORECASE)
            if fs_end_m and fs_start + fs_end_m.start() > first:
                in_fieldset = True
        # 也接受 role=group 或 role=radiogroup 的 ARIA 替代
        ctx = template[max(0, first - 500): first]
        has_role_group = bool(re.search(r'role=["\']?(group|radiogroup)["\']?', ctx, re.IGNORECASE))
        if not in_fieldset and not has_role_group:
            line = H.line_of(template, first, offset)
            results.append(CheckResult(
                code=metadata["code"], rule="radio 群組未用 <fieldset>+<legend> 包裹",
                status=Status.NEEDS_HUMAN, file=file_path, line=line,
                snippet=f'name="{name}" 的 radio × {len(positions)}',
                message=f'name="{name}" 有 {len(positions)} 個 radio，未在 <fieldset> 內',
                fix_suggestion=(
                    "<fieldset>\n  <legend>選項標題</legend>\n  <input type=radio>...</fieldset>\n"
                    ' 或用 role="radiogroup" + aria-labelledby 替代'
                ),
            ))
    return results
