"""css_rules.py — 台灣 TWAA CSS 靜態規則

涵蓋所有可靜態分析的 CSS 成功準則：
  CS2140401C  font-size 須用相對單位（AA 1.4.4）
  CS3140800C  主要內容不得同時鎖定文字/背景色（AAA 1.4.8）
  CS3140801C  欄寬不超過 80ch（AAA 1.4.8）
  CS3140802C  需有 line-height 宣告（AAA 1.4.8）
  WCAG-2.4.7  不得 outline:none 且無替代焦點樣式（AA）
  WCAG-1.4.12 文字間距：不得固定 line-height/letter-spacing/word-spacing（AA）
"""
from __future__ import annotations
import re
from .result import CheckResult, Status


def _strip_comments(css: str) -> str:
    return re.sub(r"/\*.*?\*/", "", css, flags=re.DOTALL)


def _extract_style(src: str) -> tuple[str, int]:
    m = re.search(r"<style[^>]*>\n?(.*?)</style>", src, re.DOTALL)
    if not m:
        return src, 1
    return m.group(1), src[: m.start()].count("\n") + 1


def _line_of(css: str, pos: int, offset: int) -> int:
    return css[:pos].count("\n") + 1 + offset


# ── CS2140401C：font-size 相對單位 ────────────────────────────────────────────

def check_CS2140401C(css: str, offset: int, filepath: str) -> list[CheckResult]:
    results = []
    for m in re.finditer(r"font-size\s*:\s*([^;}{]+)", css, re.IGNORECASE):
        value = m.group(1).strip()
        line = _line_of(css, m.start(), offset)
        allowed = re.compile(
            r"^\s*(\d*\.?\d+\s*(em|rem|%|vw|vh|vmin|vmax|ch|ex)"
            r"|xx-small|x-small|small|medium|large|x-large|xx-large|xxx-large"
            r"|smaller|larger|initial|inherit|unset|revert|0)\s*$",
            re.IGNORECASE,
        )
        px_match = re.match(r"^\s*\d*\.?\d+\s*px\s*(!important)?\s*$", value, re.IGNORECASE)
        if px_match:
            px_val = float(re.search(r"[\d.]+", value).group())
            rem_val = round(px_val / 16, 4)
            results.append(CheckResult(
                code="CS2140401C", rule="font-size 不得使用固定 px",
                status=Status.FAIL, file=filepath, line=line,
                snippet=f"font-size: {value}",
                message=f"'{value}' 使用固定 px，放大瀏覽器文字時不會縮放",
                fix_suggestion=f"改為 font-size: {rem_val}rem;（以 16px 基準換算）或使用 em/%"
            ))
        elif not allowed.match(value):
            results.append(CheckResult(
                code="CS2140401C", rule="font-size 單位需人工確認",
                status=Status.NEEDS_HUMAN, file=filepath, line=line,
                snippet=f"font-size: {value}",
                fix_suggestion="確認此值是否為允許的相對單位（em/rem/%/具名大小）"
            ))
    return results


# ── CS3140800C：主內容不得同時鎖定文字/背景色 ────────────────────────────────

def check_CS3140800C(css: str, offset: int, filepath: str) -> list[CheckResult]:
    results = []
    main_selectors = re.compile(
        r"(body|main|\.main|#main|article|\.content|#content)\s*\{([^}]+)\}",
        re.IGNORECASE | re.DOTALL,
    )
    for m in main_selectors.finditer(css):
        selector, block = m.group(1), m.group(2)
        line = _line_of(css, m.start(), offset)
        has_color = bool(re.search(r"(?<![a-z-])color\s*:", block, re.IGNORECASE))
        has_bg = bool(re.search(r"\bbackground(-color)?\s*:", block, re.IGNORECASE))
        if has_color and has_bg:
            results.append(CheckResult(
                code="CS3140800C", rule="主要內容同時鎖定文字/背景色",
                status=Status.FAIL, file=filepath, line=line,
                snippet=f"{selector} {{...}}",
                message=f"'{selector}' 同時指定 color 和 background，使用者無法覆寫顏色",
                fix_suggestion="移除 color 或 background-color 宣告，讓使用者代理使用使用者偏好色"
            ))
    return results


# ── CS3140801C：欄寬不超過 80ch ──────────────────────────────────────────────

def check_CS3140801C(css: str, offset: int, filepath: str) -> list[CheckResult]:
    results = []
    for m in re.finditer(r"\b(max-width|width)\s*:\s*([^;}{]+)", css, re.IGNORECASE):
        prop, value = m.group(1).lower(), m.group(2).strip()
        line = _line_of(css, m.start(), offset)
        ch_val = re.match(r"(\d+)\s*ch", value, re.IGNORECASE)
        if ch_val and int(ch_val.group(1)) > 80:
            results.append(CheckResult(
                code="CS3140801C", rule="欄寬超過 80ch",
                status=Status.FAIL, file=filepath, line=line,
                snippet=f"{prop}: {value}",
                message=f"欄寬 {value} 超過 80 字元閱讀寬度限制",
                fix_suggestion=f"改為 {prop}: 80ch; 或使用 max-width: 80ch;"
            ))
        px_val = re.match(r"(\d+)\s*px", value, re.IGNORECASE)
        if px_val and int(px_val.group(1)) > 1280:
            results.append(CheckResult(
                code="CS3140801C", rule="欄寬超過 1280px 需人工確認",
                status=Status.NEEDS_HUMAN, file=filepath, line=line,
                snippet=f"{prop}: {value}",
                fix_suggestion="確認此欄寬是否超過 80 字元（約 1280px@16px 基準），考慮改用 ch 單位"
            ))
    return results


# ── CS3140802C：需有 line-height ──────────────────────────────────────────────

def check_CS3140802C(css: str, offset: int, filepath: str) -> list[CheckResult]:
    if not re.search(r"\bline-height\s*:", css, re.IGNORECASE):
        return [CheckResult(
            code="CS3140802C", rule="缺少 line-height 宣告",
            status=Status.FAIL, file="",
            message="樣式表中未找到 line-height 宣告",
            fix_suggestion="在 body 或主要文字選擇器加 line-height: 1.5; 以上"
        )]
    return []


# ── WCAG-2.4.7：焦點樣式不得被覆蓋 ──────────────────────────────────────────

def check_focus_outline(css: str, offset: int, filepath: str) -> list[CheckResult]:
    results = []
    # 找 outline:none 或 outline:0 但無後續 :focus 替代樣式
    for m in re.finditer(
        r":focus\s*\{([^}]+)\}", css, re.IGNORECASE | re.DOTALL
    ):
        block = m.group(1)
        line = _line_of(css, m.start(), offset)
        has_none = bool(re.search(r"outline\s*:\s*(none|0)", block, re.IGNORECASE))
        has_replacement = bool(
            re.search(r"box-shadow|border|outline-offset|background", block, re.IGNORECASE)
        )
        if has_none and not has_replacement:
            results.append(CheckResult(
                code="WCAG-2.4.7", rule=":focus 移除 outline 但無替代焦點樣式",
                status=Status.FAIL, file=filepath, line=line,
                snippet=f":focus {{ {block.strip()[:60]} }}",
                message="outline:none 使鍵盤使用者無法看到焦點位置",
                fix_suggestion=(
                    "移除 outline:none；或加上替代樣式：\n"
                    "  outline: 3px solid #005fcc;\n"
                    "  outline-offset: 2px;\n"
                    "或使用 box-shadow: 0 0 0 3px #005fcc;"
                )
            ))
    return results


# ── WCAG-1.4.12：文字間距不得固定鎖死 ────────────────────────────────────────

def check_text_spacing(css: str, offset: int, filepath: str) -> list[CheckResult]:
    """1.4.12: letter-spacing/word-spacing/line-height 不得使用 px 固定值（需可用使用者樣式覆寫）"""
    results = []
    props = {
        "letter-spacing": "0.12em",
        "word-spacing": "0.16em",
    }
    for prop, suggested in props.items():
        for m in re.finditer(rf"\b{prop}\s*:\s*([^;}}]+)", css, re.IGNORECASE):
            value = m.group(1).strip()
            line = _line_of(css, m.start(), offset)
            if re.match(r"^\d*\.?\d+\s*px\s*(!important)?\s*$", value, re.IGNORECASE):
                results.append(CheckResult(
                    code="WCAG-1.4.12", rule=f"{prop} 使用固定 px",
                    status=Status.FAIL, file=filepath, line=line,
                    snippet=f"{prop}: {value}",
                    message=f"固定 px 值會阻止使用者自訂文字間距",
                    fix_suggestion=f"改為 {prop}: {suggested}; 或使用 em 單位"
                ))
    # line-height 若為 px 固定值
    for m in re.finditer(r"\bline-height\s*:\s*([^;}{]+)", css, re.IGNORECASE):
        value = m.group(1).strip()
        line = _line_of(css, m.start(), offset)
        if re.match(r"^\d*\.?\d+\s*px\s*(!important)?\s*$", value, re.IGNORECASE):
            results.append(CheckResult(
                code="WCAG-1.4.12", rule="line-height 使用固定 px",
                status=Status.FAIL, file=filepath, line=line,
                snippet=f"line-height: {value}",
                message="固定 px 的行高會在使用者放大文字時導致文字重疊",
                fix_suggestion="改為無單位數值，例如 line-height: 1.5;"
            ))
    return results


# ── 公開介面 ─────────────────────────────────────────────────────────────────

ALL_CSS_CHECKS = [
    check_CS2140401C,
    check_CS3140800C,
    check_CS3140801C,
    check_CS3140802C,
    check_focus_outline,
    check_text_spacing,
]


def check_css(filepath: str, content: str) -> list[CheckResult]:
    """對 CSS/SCSS/Vue <style> 執行全部 CSS 靜態規則"""
    css, offset = _extract_style(content)
    css = _strip_comments(css)
    results: list[CheckResult] = []
    for fn in ALL_CSS_CHECKS:
        found = fn(css, offset - 1, filepath)
        for r in found:
            if not r.file:
                r.file = filepath
        results.extend(found)
    return results
