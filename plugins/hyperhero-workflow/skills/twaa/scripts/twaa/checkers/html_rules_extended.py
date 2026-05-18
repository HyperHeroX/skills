"""html_rules_extended.py -- 從 accessibility-docs 新增的 C 碼靜態規則

依據官方範例目錄 references/examples/ 中的稽核文件實作。

新增 14 個 C 碼（HM × 13 + ME × 1）：
  HM1130200C  混合文字走向需標記 dir/RLM/LRM（1.3.2 A）
  HM1240102C  多個導覽連結需以 <nav> 分組（2.4.1 A）
  HM1240200C  <title> 不得為空（2.4.2 A）  ← 升級：加上官方碼對應
  HM1240400C  毗鄰圖片+文字連結：圖片 alt 需為空（2.4.4 A）
  HM1240401C  連結必須有非空鏈結文字（2.4.4 A）
  HM1310100C  <html lang> 必須存在且非空（3.1.1 A）  ← 升級：加上官方碼
  HM1410100C  DOCTYPE 宣告必須存在（4.1.1 A）
  HM1410200C  表單控制元件 role/name/state/value 完整（4.1.2 A）  ← 升級
  HM1410201C  <frame>/<iframe> 需有 title（4.1.2 A）
  HM2310200C  局部語系標籤需有 lang 屬性（3.1.2 AA）
  HM3240900C  AAA：連結需同時有文字與 title（2.4.9 AAA）
  HM3241000C  AAA：頁面需使用 heading 組件（2.4.10 AAA）
  HM3330500C  AAA：輸入欄位需有脈絡協助說明（3.3.5 AAA）
  ME1320200C  下載連結副檔名需為開放格式（3.2.2 A）
"""
from __future__ import annotations
import re
from .result import CheckResult, Status


# ── 小工具（延用 html_rules.py 的輔助函式介面）──────────────────────────────

def _attr(tag_str: str, attr: str) -> str | None:
    m = re.search(
        rf'\b{attr}\s*=\s*(?:"([^"]*)"' + r"|'([^']*)'|(\S+))",
        tag_str, re.IGNORECASE,
    )
    if m:
        return m.group(1) or m.group(2) or m.group(3) or ""
    if re.search(rf'\b{attr}\b', tag_str, re.IGNORECASE):
        return ""
    return None


def _has_dynamic(tag_str: str, attr: str) -> bool:
    return bool(re.search(rf'(?::|\bv-bind:){attr}\b', tag_str, re.IGNORECASE))


def _line_of(src: str, pos: int, offset: int = 0) -> int:
    return src[:pos].count("\n") + 1 + offset


def _extract_template(src: str) -> tuple[str, int]:
    m = re.search(r"<template[^>]*>\n?(.*?)</template>", src, re.DOTALL)
    if not m:
        return src, 1
    return m.group(1), src[: m.start()].count("\n") + 1


# ── HM1130200C：混合文字走向需標記 dir/RLM/LRM（1.3.2 A）──────────────────

def check_HM1130200C(template: str, offset: int, fp: str) -> list[CheckResult]:
    """lang 屬性帶有 RTL 語言時，元素需有 dir 屬性或 RLM/LRM 標記"""
    results = []
    rtl_langs = {"he", "ar", "fa", "ur", "yi", "dv", "ug", "az", "ps", "sd"}
    for m in re.finditer(r'<(\w+)\s([^>]*)lang=["\']?(\S+?)["\']?[\s>]', template, re.IGNORECASE):
        lang_val = m.group(3).lower().split("-")[0]
        if lang_val not in rtl_langs:
            continue
        line = _line_of(template, m.start(), offset)
        tag = m.group(0)
        has_dir = bool(re.search(r'\bdir\s*=', tag, re.IGNORECASE))
        # RLM = &#x200F; or ‏; LRM = &#x200E; or ‎
        parent_ctx = template[max(0, m.start()-200): m.end()+200]
        has_marker = bool(re.search(r'&#x200[ef];|‏|‎', parent_ctx, re.IGNORECASE))
        if not has_dir and not has_marker:
            results.append(CheckResult(
                code="HM1130200C",
                rule="RTL 語言元素需有 dir 屬性或 RLM/LRM 標記",
                status=Status.FAIL, file=fp, line=line,
                snippet=tag[:80],
                message=f"lang='{m.group(3)}' 為 RTL 語言，但元素無 dir='rtl' 且無 RLM/LRM 標記",
                fix_suggestion=f"加上 dir='rtl'：<{m.group(1)} lang='{m.group(3)}' dir='rtl'>..."
            ))
    return results


# ── HM1240102C：多個導覽連結需以 <nav> 分組（2.4.1 A）─────────────────────

def check_HM1240102C(template: str, offset: int, fp: str) -> list[CheckResult]:
    """同一區塊有多個導覽連結時，需以 <nav> 包裹"""
    results = []
    nav_blocks = re.findall(r"<nav[\s>].*?</nav>", template, re.DOTALL | re.IGNORECASE)
    links_in_nav = sum(len(re.findall(r"<a\s", b, re.IGNORECASE)) for b in nav_blocks)
    total_links = len(re.findall(r"<a\s[^>]*href", template, re.IGNORECASE))
    # 如果頁面有 ≥3 個連結但 <nav> 內連結少於總數的 50%，可能有導覽未分組
    if total_links >= 3 and links_in_nav < total_links * 0.5:
        nav_count = len(nav_blocks)
        results.append(CheckResult(
            code="HM1240102C",
            rule="導覽連結需以 <nav> 分組",
            status=Status.NEEDS_HUMAN if nav_count > 0 else Status.FAIL,
            file=fp,
            message=(
                f"頁面共 {total_links} 個連結，<nav> 元素共 {nav_count} 個，"
                f"nav 內連結僅 {links_in_nav} 個，請確認所有導覽群組皆有 <nav>"
            ),
            fix_suggestion=(
                "將導覽連結群組以 <nav> 包裹，並加上 aria-label 區分不同導覽區：\n"
                "<nav aria-label='主要導覽'><a href='...'>...</a></nav>\n"
                "<nav aria-label='相關連結'><a href='...'>...</a></nav>"
            )
        ))
    return results


# ── HM1240200C：<title> 不得為空（2.4.2 A）────────────────────────────────

def check_HM1240200C(full_src: str, fp: str) -> list[CheckResult]:
    """<title> 必須存在且內容不為空"""
    m = re.search(r"<title[^>]*>(.*?)</title>", full_src, re.IGNORECASE | re.DOTALL)
    if not m or not m.group(1).strip():
        return [CheckResult(
            code="HM1240200C",
            rule="<title> 不得為空",
            status=Status.FAIL, file=fp,
            message="<title> 不存在或內容為空",
            fix_suggestion="在 <head> 加入 <title>頁面描述 - 系統名稱</title>，每頁標題需唯一且具描述性"
        )]
    return []


# ── HM1240400C：毗鄰圖片+文字連結，圖片 alt 需為空（2.4.4 A）────────────

def check_HM1240400C(template: str, offset: int, fp: str) -> list[CheckResult]:
    """<a> 內同時含 <img> 和文字時，img alt 必須為空以避免重複"""
    results = []
    link_re = re.compile(r"<a(\s[^>]*)?>(.+?)</a>", re.DOTALL | re.IGNORECASE)
    for m in link_re.finditer(template):
        line = _line_of(template, m.start(), offset)
        inner = m.group(2)
        imgs = re.findall(r"<img(\s[^>]*)?>", inner, re.IGNORECASE | re.DOTALL)
        # 取出純文字（移除標籤）
        text = re.sub(r"<[^>]+>", "", inner).strip()
        if not imgs or not text:
            continue
        for img_attrs in imgs:
            alt = _attr("<img" + img_attrs + ">", "alt")
            if alt is not None and alt.strip():
                results.append(CheckResult(
                    code="HM1240400C",
                    rule="毗鄰圖片+文字連結：img alt 應為空字串",
                    status=Status.FAIL, file=fp, line=line,
                    snippet=m.group(0)[:80],
                    message=f"<a> 內含圖片（alt='{alt}'）且有文字，圖片 alt 應改為空字串避免重複朗讀",
                    fix_suggestion="將 <img> 的 alt 屬性改為空字串：alt=\"\""
                ))
    return results


# ── HM1240401C：連結必須有非空鏈結文字（2.4.4 A）─────────────────────────

def check_HM1240401C(template: str, offset: int, fp: str) -> list[CheckResult]:
    """<a href> 必須有可識別的鏈結文字或 title"""
    results = []
    link_re = re.compile(r"<a(\s[^>]*)?>(.+?)</a>", re.DOTALL | re.IGNORECASE)
    for m in link_re.finditer(template):
        tag_attrs = "<a" + (m.group(1) or "") + ">"
        href = _attr(tag_attrs, "href")
        if href is None:
            continue
        line = _line_of(template, m.start(), offset)
        inner = m.group(2)
        # 可識別文字 = 純文字 or img with non-empty alt
        plain_text = re.sub(r"<[^>]+>", "", inner).strip()
        img_alts = re.findall(r'<img[^>]+alt=["\']([^"\']+)["\']', inner, re.IGNORECASE)
        title = _attr(tag_attrs, "title")
        aria_label = _attr(tag_attrs, "aria-label")
        if not plain_text and not img_alts and not title and not aria_label:
            if _has_dynamic(tag_attrs, "aria-label") or _has_dynamic(tag_attrs, "title"):
                results.append(CheckResult(
                    code="HM1240401C",
                    rule="連結文字需人工確認（動態繫結）",
                    status=Status.NEEDS_HUMAN, file=fp, line=line,
                    snippet=m.group(0)[:80],
                    fix_suggestion="確認動態繫結的 aria-label 或 title 在所有狀態下均有非空值"
                ))
            else:
                results.append(CheckResult(
                    code="HM1240401C",
                    rule="連結缺少可識別的鏈結文字",
                    status=Status.FAIL, file=fp, line=line,
                    snippet=m.group(0)[:80],
                    message="<a> 連結無文字內容、無非空 img alt、無 title、無 aria-label",
                    fix_suggestion=(
                        "方式一：在 <a> 內加上描述性文字\n"
                        "方式二：加上 title='連結描述'\n"
                        "方式三：加上 aria-label='連結描述'"
                    )
                ))
    return results


# ── HM1310100C：<html lang> 必須存在且非空（3.1.1 A）─────────────────────

def check_HM1310100C(full_src: str, fp: str) -> list[CheckResult]:
    """<html> 必須有 lang 屬性且值不為空"""
    m = re.search(r"<html(\s[^>]*)?>", full_src, re.IGNORECASE)
    if not m:
        return []
    tag = m.group(0)
    lang = _attr(tag, "lang")
    if _has_dynamic(tag, "lang"):
        return [CheckResult(
            code="HM1310100C",
            rule="html lang（動態需人工確認）",
            status=Status.NEEDS_HUMAN, file=fp, snippet=tag[:80],
            fix_suggestion="確認 :lang 動態值為有效 BCP 47 語言標籤，如 'zh-Hant-TW'、'zh-Hant'、'en'"
        )]
    if lang is None or lang.strip() == "":
        return [CheckResult(
            code="HM1310100C",
            rule="<html> 缺少 lang 屬性",
            status=Status.FAIL, file=fp, snippet=tag[:80],
            message="<html> 未宣告 lang 屬性，輔助科技無法正確判斷頁面語言",
            fix_suggestion="改為 <html lang='zh-Hant-TW'>（繁體中文台灣）或 <html lang='zh-Hant'>"
        )]
    # 台灣規範建議使用 zh-Hant 或 zh-Hant-TW，zh-TW 也可接受但非最佳
    if lang.lower() in {"zh-tw"}:
        return [CheckResult(
            code="HM1310100C",
            rule="html lang 建議改為 zh-Hant-TW",
            status=Status.NEEDS_HUMAN, file=fp, snippet=tag[:80],
            message=f"lang='{lang}' 可接受，但台灣 MODA 官方建議使用 zh-Hant 或 zh-Hant-TW",
            fix_suggestion="建議改為 <html lang='zh-Hant-TW'>"
        )]
    return []


# ── HM1410100C：DOCTYPE 宣告必須存在（4.1.1 A）────────────────────────────

def check_HM1410100C(full_src: str, fp: str) -> list[CheckResult]:
    """文件需有正確的 DOCTYPE 宣告"""
    has_doctype = bool(re.match(r'\s*<!DOCTYPE\s+html', full_src, re.IGNORECASE))
    if not has_doctype:
        return [CheckResult(
            code="HM1410100C",
            rule="缺少 DOCTYPE 宣告",
            status=Status.FAIL, file=fp,
            message="文件未找到 <!DOCTYPE html> 宣告",
            fix_suggestion="在 HTML 文件第一行加入：<!DOCTYPE html>"
        )]
    return []


# ── HM1410201C：<frame>/<iframe> 需有 title（4.1.2 A）────────────────────

def check_HM1410201C(template: str, offset: int, fp: str) -> list[CheckResult]:
    """<iframe> 和 <frame> 必須有非空 title 屬性"""
    results = []
    for tag_name in ("iframe", "frame"):
        for m in re.finditer(rf"<{tag_name}(\s[^>]*)?>", template, re.IGNORECASE | re.DOTALL):
            line = _line_of(template, m.start(), offset)
            tag = m.group(0)
            title = _attr(tag, "title")
            if _has_dynamic(tag, "title"):
                results.append(CheckResult(
                    code="HM1410201C",
                    rule=f"{tag_name} title（動態需人工確認）",
                    status=Status.NEEDS_HUMAN, file=fp, line=line,
                    snippet=tag[:80],
                    fix_suggestion=f"確認 :title 在所有狀態下均為非空的描述性文字"
                ))
            elif title is None or title.strip() == "":
                results.append(CheckResult(
                    code="HM1410201C",
                    rule=f"{tag_name} 缺少 title 屬性",
                    status=Status.FAIL, file=fp, line=line,
                    snippet=tag[:80],
                    message=f"<{tag_name}> 無 title 屬性，螢幕報讀軟體無法描述其用途",
                    fix_suggestion=f"加上 title='描述此框架的用途'，例如：title='廣告框架' 或 title='內嵌地圖'"
                ))
    return results


# ── HM2310200C：局部語系標籤需有 lang 屬性（3.1.2 AA）──────────────────────

def check_HM2310200C(template: str, offset: int, fp: str) -> list[CheckResult]:
    """含有外語內容的標籤需標記 lang 屬性"""
    results = []
    # 偵測明顯的外語字元（日文、韓文、希伯來、阿拉伯、泰文等）
    foreign_patterns = [
        (r"[぀-ゟ゠-ヿ]", "ja", "日文"),           # 日文平假名/片假名
        (r"[가-힯]", "ko", "韓文"),                          # 韓文
        (r"[֐-׿]", "he", "希伯來文"),                      # 希伯來文
        (r"[؀-ۿ]", "ar", "阿拉伯文"),                      # 阿拉伯文
        (r"[฀-๿]", "th", "泰文"),                          # 泰文
    ]
    for m_tag in re.finditer(r"<(\w+)(\s[^>]*)?>(.+?)</\1>", template, re.DOTALL | re.IGNORECASE):
        tag_name = m_tag.group(1).lower()
        if tag_name in {"script", "style", "code", "pre"}:
            continue
        attrs = m_tag.group(2) or ""
        inner = m_tag.group(3)
        # 跳過已有 lang 屬性的元素
        if re.search(r'\blang\s*=', attrs, re.IGNORECASE):
            continue
        line = _line_of(template, m_tag.start(), offset)
        for pattern, lang_code, lang_name in foreign_patterns:
            if re.search(pattern, inner):
                results.append(CheckResult(
                    code="HM2310200C",
                    rule=f"外語內容需標記 lang 屬性（偵測到{lang_name}）",
                    status=Status.NEEDS_HUMAN, file=fp, line=line,
                    snippet=f"<{tag_name}>{inner[:40]}</{tag_name}>",
                    message=f"元素內含疑似{lang_name}文字，但未標記 lang='{lang_code}'",
                    fix_suggestion=f"加上 lang='{lang_code}'：<{tag_name} lang='{lang_code}'>..."
                ))
                break  # 一個元素只報一次
    return results


# ── HM3240900C：AAA — 連結需同時有文字與 title（2.4.9 AAA）──────────────

def check_HM3240900C(template: str, offset: int, fp: str) -> list[CheckResult]:
    """AAA：所有連結需有連結文字且有 title 屬性（純鏈結目的）"""
    results = []
    for m in re.finditer(r"<a(\s[^>]*)?>(.+?)</a>", template, re.DOTALL | re.IGNORECASE):
        tag_attrs = "<a" + (m.group(1) or "") + ">"
        href = _attr(tag_attrs, "href")
        if href is None:
            continue
        line = _line_of(template, m.start(), offset)
        plain_text = re.sub(r"<[^>]+>", "", m.group(2)).strip()
        title = _attr(tag_attrs, "title")
        if not plain_text or not title or not title.strip():
            results.append(CheckResult(
                code="HM3240900C",
                rule="AAA：連結需同時有鏈結文字與 title 屬性",
                status=Status.FAIL, file=fp, line=line,
                snippet=m.group(0)[:80],
                message=f"連結{'缺少文字' if not plain_text else '缺少 title 屬性'}",
                fix_suggestion="加上 title='完整描述連結目的地或動作'，且連結內要有可見文字"
            ))
    return results


# ── HM3241000C：AAA — 頁面需使用 heading 組件（2.4.10 AAA）──────────────

def check_HM3241000C(template: str, fp: str) -> list[CheckResult]:
    """AAA：頁面需至少有一個 heading 元素（h1~h6）"""
    has_heading = bool(re.search(r"<h[1-6][\s>]", template, re.IGNORECASE))
    if not has_heading:
        return [CheckResult(
            code="HM3241000C",
            rule="AAA：頁面需使用 heading 組件",
            status=Status.FAIL, file=fp,
            message="頁面未找到任何 <h1>~<h6> 標頭組件",
            fix_suggestion="至少加入一個 <h1> 標頭，並用 h1-h6 建立清晰的頁面內容層次結構"
        )]
    return []


# ── HM3330500C：AAA — 輸入欄位需有脈絡協助說明（3.3.5 AAA）─────────────

def check_HM3330500C(template: str, offset: int, fp: str) -> list[CheckResult]:
    """AAA：每個輸入欄位需有 label 且 title 提供使用情境說明"""
    results = []
    skip_types = {"hidden", "submit", "reset", "button", "image"}
    for m in re.finditer(r"<input(\s[^>]*)?>", template, re.IGNORECASE | re.DOTALL):
        line = _line_of(template, m.start(), offset)
        tag = m.group(0)
        typ = (_attr(tag, "type") or "text").lower()
        if typ in skip_types:
            continue
        title = _attr(tag, "title")
        # title 需為有意義的說明（不僅是欄位名稱）
        label_id = _attr(tag, "id")
        has_label = (
            label_id and
            re.search(rf'<label\s[^>]*for=["\']?{re.escape(label_id)}["\']?', template, re.IGNORECASE)
        )
        if not title or not title.strip():
            if not has_label:
                results.append(CheckResult(
                    code="HM3330500C",
                    rule="AAA：輸入欄位缺少脈絡協助說明（title）",
                    status=Status.FAIL, file=fp, line=line,
                    snippet=tag[:80],
                    message=f"<input type={typ}> 無 title 屬性提供輸入情境說明",
                    fix_suggestion=(
                        "加上 title='輸入範例：2024-01-01'（提供格式或範例），\n"
                        "或加上帶 for 屬性的 <label> 連結此欄位"
                    )
                ))
    return results


# ── ME1320200C：下載連結需為開放格式（3.2.2 A）────────────────────────────

PROPRIETARY_EXTENSIONS = {
    ".doc", ".docx", ".xls", ".xlsx", ".ppt", ".pptx",
    ".mdb", ".accdb", ".pub", ".vsd", ".pages", ".numbers", ".key"
}
OPEN_EXTENSIONS = {
    ".odt", ".ods", ".odp", ".odg", ".odf", ".pdf",
    ".txt", ".csv", ".json", ".xml", ".html", ".md", ".epub"
}


def check_ME1320200C(template: str, offset: int, fp: str) -> list[CheckResult]:
    """下載連結的副檔名需為開放格式（ODF/PDF 等），不得僅有商用格式"""
    results = []
    ext_re = re.compile(r'href=["\']([^"\']*(\.\w+))["\']', re.IGNORECASE)
    for m in ext_re.finditer(template):
        url = m.group(1)
        ext = m.group(2).lower()
        if ext not in PROPRIETARY_EXTENSIONS:
            continue
        line = _line_of(template, m.start(), offset)
        results.append(CheckResult(
            code="ME1320200C",
            rule="下載連結應提供開放格式版本",
            status=Status.FAIL, file=fp, line=line,
            snippet=f'href="{url}"',
            message=f"連結 '{url}' 為商用格式（{ext}），需同時提供對應的開放格式",
            fix_suggestion=(
                f"同時提供以下格式：\n"
                f"  .docx → .odt（LibreOffice Writer）\n"
                f"  .xlsx → .ods（LibreOffice Calc）\n"
                f"  .pptx → .odp（LibreOffice Impress）\n"
                f"或轉換為 PDF 格式"
            )
        ))
    return results


# ── 公開介面 ─────────────────────────────────────────────────────────────────

ALL_EXTENDED_CHECKS_TEMPLATE = [
    check_HM1130200C,
    check_HM1240102C,
    check_HM1240400C,
    check_HM1240401C,
    check_HM1410201C,
    check_HM2310200C,
    check_HM3241000C,  # needs full template
    check_HM3330500C,
    check_ME1320200C,
]

ALL_EXTENDED_CHECKS_FULLSRC = [
    check_HM1240200C,
    check_HM1310100C,
    check_HM1410100C,
]

# AAA 等級碼（只在 --level AAA 時執行）
AAA_CHECKS_TEMPLATE = [
    check_HM3240900C,
    check_HM3241000C,
]
AAA_CHECKS_FULLSRC = [
]


def check_html_extended(
    filepath: str,
    content: str,
    template: str,
    offset: int,
    level: str = "AA"
) -> list[CheckResult]:
    """對 HTML/Vue 執行全部擴充 C 碼靜態規則。

    Args:
        filepath: 檔案路徑
        content: 完整原始碼（含 <html>、<head>）
        template: 已提取的 template 區段
        offset: template 起始行號偏移
        level: "A"、"AA"、"AAA"
    """
    results: list[CheckResult] = []

    # Template 層規則（A + AA）
    for fn in ALL_EXTENDED_CHECKS_TEMPLATE:
        if fn in AAA_CHECKS_TEMPLATE and level != "AAA":
            continue
        results.extend(fn(template, offset - 1, filepath))

    # AAA template 規則
    if level == "AAA":
        for fn in AAA_CHECKS_TEMPLATE:
            results.extend(fn(template, offset - 1, filepath))

    # 完整原始碼層規則
    for fn in ALL_EXTENDED_CHECKS_FULLSRC:
        results.extend(fn(content, filepath))

    return results
