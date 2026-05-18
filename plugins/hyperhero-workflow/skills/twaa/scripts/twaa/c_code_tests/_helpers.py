"""_helpers.py — c_code_tests 共用工具函式。

模組以底線開頭命名，c_code_runner 會跳過底線開頭模組（不視為檢查碼）。
"""
from __future__ import annotations
import re


def strip_comments(css: str) -> str:
    """移除 CSS 註解，避免註解中文字干擾規則比對。"""
    return re.sub(r"/\*.*?\*/", "", css, flags=re.DOTALL)


def extract_style(src: str) -> tuple[str, int]:
    """從 .vue 檔擷取 <style> 內容；非 .vue 則整檔當成 CSS。

    Returns (css_content, offset_lines)，offset_lines 為原檔案中 CSS 起始行號 - 1。
    """
    m = re.search(r"<style[^>]*>\n?(.*?)</style>", src, re.DOTALL)
    if not m:
        return src, 0
    return m.group(1), src[: m.start()].count("\n")


def extract_template(src: str) -> tuple[str, int]:
    """從 .vue 檔擷取 <template> 內容；非 .vue 則整檔當成 HTML。"""
    m = re.search(r"<template[^>]*>\n?(.*?)</template>", src, re.DOTALL)
    if not m:
        return src, 0
    return m.group(1), src[: m.start()].count("\n")


def line_of(src: str, pos: int, offset: int = 0) -> int:
    """計算 src[:pos] 對應的原檔行號（從 1 開始）。"""
    return src[:pos].count("\n") + 1 + offset


def attr(tag_str: str, name: str) -> str | None:
    """從 HTML/Vue 標籤字串擷取屬性值；若屬性存在但無值回 ""，不存在回 None。"""
    m = re.search(
        rf'\b{name}\s*=\s*(?:"([^"]*)"' + r"|'([^']*)'|(\S+))",
        tag_str, re.IGNORECASE,
    )
    if m:
        return m.group(1) or m.group(2) or m.group(3) or ""
    if re.search(rf'\b{name}\b', tag_str, re.IGNORECASE):
        return ""
    return None


def has_dynamic(tag_str: str, attr_name: str) -> bool:
    """判斷標籤是否使用 Vue 動態繫結（:attr 或 v-bind:attr）。"""
    return bool(re.search(rf'(?::|\bv-bind:){attr_name}\b', tag_str, re.IGNORECASE))


def find_tags(template: str, tag: str) -> list[tuple[int, str]]:
    """找出所有 <tag ...>，回傳 [(start_pos, full_tag_string), ...]。"""
    return [
        (m.start(), m.group(0))
        for m in re.finditer(rf"<{tag}(\s[^>]*)?/?>", template, re.IGNORECASE)
    ]
