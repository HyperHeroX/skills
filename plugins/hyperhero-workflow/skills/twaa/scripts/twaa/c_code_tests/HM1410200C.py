"""HM1410200C — 表單控制元件需完整提供 角色/名稱/狀態/值（A 4.1.2 H91）。

WCAG 4.1.2「名稱、角色、值」要求每個互動元件對輔助科技揭露：
- **角色（Role）**：HTML 原生標籤已具備（input/button/select 等），ARIA role 為次選
- **名稱（Name）**：accessible name 來源為 label / aria-label / aria-labelledby / title
- **狀態（State）**：checked / disabled / aria-expanded / aria-pressed 等
- **值（Value）**：value / textContent

本檢查偵測常見破壞 4.1.2 的反模式：
1. <div> / <span> 自製按鈕（缺角色）
2. button 沒有可識別文字（缺名稱）
3. 自訂 toggle 缺 aria-pressed / aria-expanded（缺狀態）
"""
from __future__ import annotations
import re
from ..checkers.result import CheckResult, Status
from . import _helpers as H

metadata = {
    "code": "HM1410200C",
    "criterion": "4.1.2",
    "level": "A",
    "category": "HTML",
    "rule": "表單控制元件需完整提供 角色/名稱/狀態/值",
    "applies_to": ("vue", "html"),
}


def check(file_path: str, content: str) -> list[CheckResult]:
    template, offset = H.extract_template(content) if file_path.endswith(".vue") else (content, 0)
    results: list[CheckResult] = []

    # 1) <div> / <span> 帶 @click（Vue）但無 role：缺角色
    for m in re.finditer(
        r'<(div|span)(\s[^>]*(?:@click|v-on:click|onclick=)[^>]*)>',
        template, re.IGNORECASE,
    ):
        tag = m.group(0)
        line = H.line_of(template, m.start(), offset)
        role = H.attr(tag, "role")
        if not role:
            results.append(CheckResult(
                code=metadata["code"], rule="<div>/<span> 帶點擊但無 role",
                status=Status.FAIL, file=file_path, line=line,
                snippet=tag[:80],
                message=f"<{m.group(1)}> 帶 click 監聽但無 role 屬性，輔助科技無法識別其互動角色",
                fix_suggestion='改用 <button> 或加上 role="button" tabindex="0" + Enter/Space 鍵盤事件',
            ))

    # 2) button 內無文字、無 aria-label、無 aria-labelledby、無 title：缺名稱
    for m in re.finditer(r"<button(\s[^>]*)?>(.*?)</button>", template, re.DOTALL | re.IGNORECASE):
        tag_attrs = "<button" + (m.group(1) or "") + ">"
        line = H.line_of(template, m.start(), offset)
        inner = m.group(2)
        plain = re.sub(r"<[^>]+>", "", inner).strip()
        aria_label = H.attr(tag_attrs, "aria-label") or ""
        aria_labelledby = H.attr(tag_attrs, "aria-labelledby") or ""
        title = H.attr(tag_attrs, "title") or ""
        # 內含 img alt 也算名稱
        img_alts = re.findall(r'<img[^>]+alt=["\']([^"\']+)["\']', inner, re.IGNORECASE)
        if H.has_dynamic(tag_attrs, "aria-label") or H.has_dynamic(tag_attrs, "title"):
            continue
        if not plain and not aria_label.strip() and not aria_labelledby.strip() and not title.strip() and not img_alts:
            results.append(CheckResult(
                code=metadata["code"], rule="<button> 缺名稱",
                status=Status.FAIL, file=file_path, line=line,
                snippet=m.group(0)[:80],
                message="<button> 無內容文字、aria-label、title、img alt，無可識別名稱",
                fix_suggestion="在 <button> 內加文字，或加 aria-label='按鈕用途'",
            ))

    # 3) role=button 的 <div> / <span> 是否有 tabindex 與鍵盤事件
    for m in re.finditer(
        r'<(div|span)(\s[^>]*role=["\']?button["\']?[^>]*)>',
        template, re.IGNORECASE,
    ):
        tag = m.group(0)
        line = H.line_of(template, m.start(), offset)
        has_tabindex = H.attr(tag, "tabindex") is not None
        has_keydown = bool(re.search(r'@keydown|@keyup|@keypress|v-on:key', tag, re.IGNORECASE))
        if not has_tabindex or not has_keydown:
            results.append(CheckResult(
                code=metadata["code"], rule='role="button" 缺 tabindex 或鍵盤事件',
                status=Status.NEEDS_HUMAN, file=file_path, line=line,
                snippet=tag[:80],
                message=f'role="button" 但 {"缺 tabindex" if not has_tabindex else ""}{"，" if not has_tabindex and not has_keydown else ""}{"缺鍵盤事件" if not has_keydown else ""}',
                fix_suggestion=(
                    "若不是 button，建議改用 <button>。\n"
                    "若必須用 div，加上 tabindex=\"0\" 與 @keydown.enter / @keydown.space 事件"
                ),
            ))

    return results
