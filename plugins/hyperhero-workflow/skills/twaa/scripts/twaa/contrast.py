#!/usr/bin/env python3
"""
TWAA AA 色彩對比值計算工具
根據 WCAG 2.1 定義的 sRGB 相對亮度公式精確計算對比值

使用方式：
  python3 contrast.py "#767676" "#FFFFFF"
  python3 contrast.py "#888888" "#FFFFFF" --large
  python3 contrast.py "#333333" "#FFFFFF" --icon

範例輸出：
  前景：#767676（R=118, G=118, B=118）
  背景：#FFFFFF（R=255, G=255, B=255）
  相對亮度 L1（前景）= 0.1812
  相對亮度 L2（背景）= 1.0000
  對比值 = 4.54:1
  [正常文字 AA] 需 ≥ 4.5:1 → ✅ 符合
"""

import sys
import argparse


def hex_to_rgb(hex_color: str) -> tuple[int, int, int]:
    """將 #RRGGBB 或 #RGB 轉換為 (R, G, B) 整數元組"""
    h = hex_color.strip().lstrip("#")
    if len(h) == 3:
        h = "".join(c * 2 for c in h)
    if len(h) != 6:
        raise ValueError(f"無效的顏色格式：{hex_color}，請使用 #RRGGBB 或 #RGB")
    return int(h[0:2], 16), int(h[2:4], 16), int(h[4:6], 16)


def linearize(c_srgb: float) -> float:
    """將 sRGB 色彩值（0-1）線性化（gamma 校正），這是計算相對亮度的關鍵步驟"""
    if c_srgb <= 0.04045:
        return c_srgb / 12.92
    else:
        return ((c_srgb + 0.055) / 1.055) ** 2.4


def relative_luminance(r: int, g: int, b: int) -> float:
    """計算顏色的相對亮度（0=黑色，1=白色）"""
    r_lin = linearize(r / 255.0)
    g_lin = linearize(g / 255.0)
    b_lin = linearize(b / 255.0)
    return 0.2126 * r_lin + 0.7152 * g_lin + 0.0722 * b_lin


def contrast_ratio(l1: float, l2: float) -> float:
    """計算兩個亮度值的對比值（較亮在分子）"""
    lighter = max(l1, l2)
    darker = min(l1, l2)
    return (lighter + 0.05) / (darker + 0.05)


def check_contrast(fg_hex: str, bg_hex: str, large_text: bool = False, icon: bool = False) -> dict:
    """
    完整色彩對比評估，回傳評估結果字典

    參數：
        fg_hex: 前景色（文字），如 "#767676"
        bg_hex: 背景色，如 "#FFFFFF"
        large_text: 是否為大文字（≥24px 或 ≥18.5px 粗體），要求 3:1
        icon: 是否為有意義圖示，要求 3:1

    TWAA AA 標準：
        - 正常文字：≥ 4.5:1（項目 10，GN2140300E）
        - 大文字：≥ 3:1（項目 11，GN2140301E）
        - 有意義圖示：≥ 3:1（項目 12，GN2141101E）
    """
    fg_rgb = hex_to_rgb(fg_hex)
    bg_rgb = hex_to_rgb(bg_hex)

    l_fg = relative_luminance(*fg_rgb)
    l_bg = relative_luminance(*bg_rgb)
    ratio = contrast_ratio(l_fg, l_bg)

    if large_text or icon:
        required = 3.0
        if large_text:
            mode = "大文字 AA"
            audit_code = "GN2140301E"
            twaa_item = "項目 11"
        else:
            mode = "有意義圖示"
            audit_code = "GN2141101E"
            twaa_item = "項目 12"
    else:
        required = 4.5
        mode = "正常文字 AA"
        audit_code = "GN2140300E"
        twaa_item = "項目 10"

    passed = ratio >= required

    return {
        "fg_hex": fg_hex.upper(),
        "bg_hex": bg_hex.upper(),
        "fg_rgb": fg_rgb,
        "bg_rgb": bg_rgb,
        "l_fg": l_fg,
        "l_bg": l_bg,
        "ratio": ratio,
        "required": required,
        "mode": mode,
        "audit_code": audit_code,
        "twaa_item": twaa_item,
        "passed": passed,
    }


def format_result(result: dict) -> str:
    """將評估結果格式化為可讀字串"""
    fg = result["fg_hex"]
    bg = result["bg_hex"]
    fr, fg_g, fb = result["fg_rgb"]
    br, bg_g, bb = result["bg_rgb"]
    l_fg = result["l_fg"]
    l_bg = result["l_bg"]
    ratio = result["ratio"]
    required = result["required"]
    mode = result["mode"]
    audit_code = result["audit_code"]
    twaa_item = result["twaa_item"]
    passed = result["passed"]
    status = "✅ 符合" if passed else "❌ 不符合"

    lines = [
        "=" * 50,
        f"前景（文字）：{fg}（R={fr}, G={fg_g}, B={fb}）",
        f"背景：       {bg}（R={br}, G={bg_g}, B={bb}）",
        "-" * 50,
        f"相對亮度 L（前景）= {l_fg:.4f}",
        f"相對亮度 L（背景）= {l_bg:.4f}",
        f"對比值           = {ratio:.2f}:1",
        "-" * 50,
        f"[{mode}] {twaa_item}（{audit_code}）",
        f"需要 ≥ {required}:1 → {status}",
    ]

    if not passed:
        # 建議最小修正色值
        lines.append("")
        lines.append("建議：加深前景色以達到要求，例如：")
        suggestions = _suggest_darker(result["fg_rgb"], result["bg_rgb"], required)
        for s in suggestions:
            lines.append(f"  {s}")

    lines.append("=" * 50)
    return "\n".join(lines)


def _suggest_darker(fg_rgb, bg_rgb, required_ratio):
    """建議幾個可通過對比值的較深色值"""
    l_bg = relative_luminance(*bg_rgb)
    suggestions = []
    # 嘗試從當前色值往黑色方向搜尋
    r, g, b = fg_rgb
    step = 8
    for delta in range(step, 256, step):
        nr = max(0, r - delta)
        ng = max(0, g - delta)
        nb = max(0, b - delta)
        l = relative_luminance(nr, ng, nb)
        if contrast_ratio(l, l_bg) >= required_ratio:
            suggestions.append(f"#{nr:02X}{ng:02X}{nb:02X}（對比值 {contrast_ratio(l, l_bg):.2f}:1）")
            if len(suggestions) >= 3:
                break
    return suggestions if suggestions else ["#000000（純黑，最高對比）"]


def main():
    parser = argparse.ArgumentParser(
        description="TWAA AA 色彩對比值計算（依 WCAG 2.1 公式精確計算）"
    )
    parser.add_argument("fg", help="前景色（文字色），如 #767676")
    parser.add_argument("bg", help="背景色，如 #FFFFFF")
    parser.add_argument("--large", action="store_true", help="大文字模式（≥24px 或 ≥18.5px 粗體），要求 ≥3:1")
    parser.add_argument("--icon", action="store_true", help="有意義圖示模式，要求 ≥3:1")
    args = parser.parse_args()

    try:
        result = check_contrast(args.fg, args.bg, large_text=args.large, icon=args.icon)
        print(format_result(result))
        sys.exit(0 if result["passed"] else 1)
    except ValueError as e:
        print(f"錯誤：{e}", file=sys.stderr)
        sys.exit(2)


if __name__ == "__main__":
    main()


# ─────────────────────────────────────────────────────────────────────────────
# SCSS 變數解析與整檔掃描（v2 擴充）
# ─────────────────────────────────────────────────────────────────────────────
import re
import colorsys
from pathlib import Path
from typing import Any


_VAR_DECL = re.compile(r"^\s*\$([\w-]+)\s*:\s*(.+?)\s*;\s*(?://.*)?$", re.M)
_HEX = re.compile(r"#[0-9a-fA-F]{3,6}")
_LIGHTEN = re.compile(r"lighten\(\s*\$([\w-]+)\s*,\s*(\d+(?:\.\d+)?)%?\s*\)")
_DARKEN = re.compile(r"darken\(\s*\$([\w-]+)\s*,\s*(\d+(?:\.\d+)?)%?\s*\)")


def _adjust_lightness(hex_color: str, delta: float) -> str:
    r, g, b = hex_to_rgb(hex_color)
    h, l, s = colorsys.rgb_to_hls(r / 255, g / 255, b / 255)
    l = max(0.0, min(1.0, l + delta / 100))
    nr, ng, nb = colorsys.hls_to_rgb(h, l, s)
    return "#{:02X}{:02X}{:02X}".format(int(nr * 255), int(ng * 255), int(nb * 255))


def parse_scss_variables(path: Path) -> dict[str, str]:
    text = Path(path).read_text(encoding="utf-8")
    raw: dict[str, str] = {}
    for m in _VAR_DECL.finditer(text):
        raw[m.group(1)] = m.group(2).strip()

    resolved: dict[str, str] = {}

    def resolve(name: str, depth: int = 0) -> str:
        if depth > 10:
            return raw.get(name, "")
        if name in resolved:
            return resolved[name]
        v = raw.get(name, "")

        m = _LIGHTEN.match(v)
        if m:
            base = resolve(m.group(1), depth + 1)
            if base and _HEX.match(base):
                resolved[name] = _adjust_lightness(base, float(m.group(2)))
            else:
                resolved[name] = base or ""
            return resolved[name]
        m = _DARKEN.match(v)
        if m:
            base = resolve(m.group(1), depth + 1)
            if base and _HEX.match(base):
                resolved[name] = _adjust_lightness(base, -float(m.group(2)))
            else:
                resolved[name] = base or ""
            return resolved[name]

        if v.startswith("$"):
            resolved[name] = resolve(v[1:], depth + 1)
            return resolved[name]

        m = _HEX.search(v)
        if m:
            resolved[name] = m.group(0).upper()
            return resolved[name]

        resolved[name] = v
        return v

    for n in raw:
        resolve(n)
    return resolved


def extract_color_pairs(scss_text: str, vars_: dict[str, str]) -> list[tuple[str, str, int]]:
    pairs: list[tuple[str, str, int]] = []
    rule_re = re.compile(r"\.[\w-]+\s*\{[^}]*\}", re.M | re.S)
    bg_re = re.compile(r"background(?:-color)?\s*:\s*([^;]+)", re.M)
    fg_re = re.compile(r"\bcolor\s*:\s*([^;]+)", re.M)

    for m in rule_re.finditer(scss_text):
        block = m.group(0)
        bg_m = bg_re.search(block)
        fg_m = fg_re.search(block)
        if not (bg_m and fg_m):
            continue
        bg_val = _resolve_to_hex(bg_m.group(1).strip().rstrip(";"), vars_)
        fg_val = _resolve_to_hex(fg_m.group(1).strip().rstrip(";"), vars_)
        if bg_val and fg_val:
            line = scss_text[:m.start()].count("\n") + 1
            pairs.append((fg_val, bg_val, line))
    return pairs


def _resolve_to_hex(expr: str, vars_: dict[str, str]) -> str | None:
    expr = expr.strip()
    if expr.startswith("$"):
        return vars_.get(expr[1:])
    m = _HEX.search(expr)
    return m.group(0).upper() if m else None


def scan_scss_file(path: Path, threshold: float = 4.5) -> list[dict[str, Any]]:
    text = Path(path).read_text(encoding="utf-8")
    vars_ = parse_scss_variables(path)
    issues: list[dict[str, Any]] = []
    for fg, bg, line in extract_color_pairs(text, vars_):
        try:
            l1 = relative_luminance(*hex_to_rgb(fg))
            l2 = relative_luminance(*hex_to_rgb(bg))
            ratio = contrast_ratio(l1, l2)
            if ratio < threshold:
                issues.append({
                    "rule": "low-contrast",
                    "guideline": "1.4.3",
                    "severity": "high",
                    "file": str(path),
                    "line": line,
                    "fg": fg,
                    "bg": bg,
                    "ratio": round(ratio, 2),
                    "threshold": threshold,
                    "message": f"對比 {ratio:.2f}:1 不足 {threshold}:1（fg={fg}, bg={bg}）",
                })
        except ValueError:
            continue
    return issues
