"""html_rules.py — 台灣 TWAA 官方 HTML/Vue 靜態規則

靜態可查的成功準則：
  1.1.1  img/area/input[type=image]/object 替代文字
  1.3.1  heading 巢狀、th scope、fieldset/legend、label
  1.3.5  input autocomplete 屬性
  1.4.2  audio/video autoplay 控制
  2.4.1  skip link 存在
  2.4.2  <title> 非空
  2.4.4  連結文字不得為無意義詞彙
  3.1.1  <html lang> 屬性
  3.3.1  錯誤訊息 aria-live / role=alert
  4.1.1  ID 唯一性
  4.1.2  button/input 有可存取名稱（aria-label / text / title）
  4.1.3  status 訊息需有 aria-live

無法靜態驗證 → needs_human：
  1.1.1  動態繫結 alt
  1.2.x  音訊/影片字幕、音訊描述
  1.3.2  DOM 順序有意義
  1.3.3  非僅憑感官特徵
  1.3.4  螢幕方向未鎖定
  2.1.1  全鍵盤可操作
  2.1.2  無焦點陷阱
  2.1.4  快捷鍵
  2.2.1  計時可調整
  2.2.2  動態內容可暫停
  2.3.1  無閃爍
  2.4.3  焦點順序有意義
  2.4.5  多種導覽方式
  2.4.6  標題和標籤描述目的
  2.4.7  焦點可視
  2.5.x  指標輸入
  3.1.2  局部語言標記
  3.2.1  焦點不改變脈絡
  3.2.2  輸入不自動改變脈絡
  3.2.3  導覽順序一致
  3.2.4  功能元件識別一致
  3.3.2  提供標籤/說明
  3.3.3  錯誤建議
  3.3.4  重要送出有確認機制
"""
from __future__ import annotations
import re
from collections import Counter
from .result import CheckResult, Status

# ── 小工具 ──────────────────────────────────────────────────────────────────

def _extract_template(src: str) -> tuple[str, int]:
    m = re.search(r"<template[^>]*>\n?(.*?)</template>", src, re.DOTALL)
    if not m:
        return src, 1
    start_line = src[: m.start()].count("\n") + 1
    return m.group(1), start_line


def _find_tags(template: str, tag: str) -> list[tuple[int, str]]:
    pattern = re.compile(rf"<{tag}(\s[^>]*)?>", re.IGNORECASE | re.DOTALL)
    results = []
    for m in pattern.finditer(template):
        line = template[: m.start()].count("\n") + 1
        results.append((line, m.group(0)))
    return results


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


def _line_of(template: str, pos: int, offset: int) -> int:
    return template[:pos].count("\n") + 1 + offset


# ── 1.1.1 替代文字 ────────────────────────────────────────────────────────────

def check_img_alt(template: str, offset: int, fp: str) -> list[CheckResult]:
    """HM1110100C: <img> 需有 alt"""
    results = []
    for rel, tag in _find_tags(template, "img"):
        line = rel + offset
        if _has_dynamic(tag, "alt"):
            results.append(CheckResult(
                code="HM1110100C", rule="img alt（動態繫結需人工確認）",
                status=Status.NEEDS_HUMAN, file=fp, line=line, snippet=tag[:80],
                message="偵測到 :alt 動態繫結",
                fix_suggestion="確認所有條件分支下 alt 均有值，且裝飾性圖片為 alt=''"
            ))
        elif _attr(tag, "alt") is None:
            results.append(CheckResult(
                code="HM1110100C", rule="img 缺少 alt 屬性",
                status=Status.FAIL, file=fp, line=line, snippet=tag[:80],
                message="<img> 缺少 alt 屬性",
                fix_suggestion="若為資訊性圖片：加上 alt='描述圖片內容'；若為裝飾性：加上 alt=''"
            ))
    return results


def check_area_alt(template: str, offset: int, fp: str) -> list[CheckResult]:
    """HM1110101C: <area> 需有非空 alt"""
    results = []
    for rel, tag in _find_tags(template, "area"):
        line = rel + offset
        alt = _attr(tag, "alt")
        if _has_dynamic(tag, "alt"):
            results.append(CheckResult(
                code="HM1110101C", rule="area alt（動態需人工確認）",
                status=Status.NEEDS_HUMAN, file=fp, line=line, snippet=tag[:80],
                fix_suggestion="確認 :alt 動態繫結在所有狀態下均非空字串"
            ))
        elif alt is None or alt.strip() == "":
            results.append(CheckResult(
                code="HM1110101C", rule="area 缺少非空 alt",
                status=Status.FAIL, file=fp, line=line, snippet=tag[:80],
                message="<area> 需有描述其目的地的 alt",
                fix_suggestion="加上 alt='描述此連結區域的目的，例如：前往首頁'"
            ))
    return results


def check_input_image_alt(template: str, offset: int, fp: str) -> list[CheckResult]:
    """HM1110104C: <input type=image> 需有非空 alt"""
    results = []
    for rel, tag in _find_tags(template, "input"):
        line = rel + offset
        if (_attr(tag, "type") or "").lower() != "image":
            continue
        alt = _attr(tag, "alt")
        if _has_dynamic(tag, "alt"):
            results.append(CheckResult(
                code="HM1110104C", rule="input[type=image] alt（動態需人工確認）",
                status=Status.NEEDS_HUMAN, file=fp, line=line, snippet=tag[:80],
                fix_suggestion="確認 :alt 在所有狀態下均非空"
            ))
        elif alt is None or alt.strip() == "":
            results.append(CheckResult(
                code="HM1110104C", rule="input[type=image] 缺少非空 alt",
                status=Status.FAIL, file=fp, line=line, snippet=tag[:80],
                message="<input type=image> 需有描述按鈕功能的 alt",
                fix_suggestion="加上 alt='送出表單' 或能描述該按鈕動作的文字"
            ))
    return results


def check_object_alt(template: str, offset: int, fp: str) -> list[CheckResult]:
    """HM1110105C: <object> 需有替代文字內容"""
    results = []
    for m in re.finditer(r"<object(\s[^>]*)?>(.+?)</object>", template, re.DOTALL | re.IGNORECASE):
        line = _line_of(template, m.start(), offset)
        if not m.group(2).strip():
            results.append(CheckResult(
                code="HM1110105C", rule="object 需有替代文字內容",
                status=Status.FAIL, file=fp, line=line, snippet=m.group(0)[:80],
                message="<object> 內部無替代文字",
                fix_suggestion="在 <object> 內加入描述性文字或備用 <img>，例如：<object ...><p>PDF 文件：年度報告</p></object>"
            ))
    return results


def check_img_empty_alt_no_title(template: str, offset: int, fp: str) -> list[CheckResult]:
    """HM1110106C: alt='' 的 img 不得有 title"""
    results = []
    for rel, tag in _find_tags(template, "img"):
        line = rel + offset
        alt = _attr(tag, "alt")
        title = _attr(tag, "title")
        if alt is not None and alt.strip() == "" and title is not None:
            results.append(CheckResult(
                code="HM1110106C", rule="裝飾性 img 不得有 title",
                status=Status.FAIL, file=fp, line=line, snippet=tag[:80],
                message="alt='' 表示裝飾性圖片，不得同時有 title（輔助科技會讀出 title）",
                fix_suggestion="移除 title 屬性：將 title='...' 刪除"
            ))
    return results


def check_img_longdesc(template: str, offset: int, fp: str) -> list[CheckResult]:
    """HM1110102C: img longdesc 需為有效 URI"""
    results = []
    uri_re = re.compile(r"^https?://|^/|^#", re.IGNORECASE)
    for rel, tag in _find_tags(template, "img"):
        line = rel + offset
        ld = _attr(tag, "longdesc")
        if ld is None:
            continue
        if _has_dynamic(tag, "longdesc"):
            results.append(CheckResult(
                code="HM1110102C", rule="img longdesc URI（動態需人工確認）",
                status=Status.NEEDS_HUMAN, file=fp, line=line, snippet=tag[:80],
                fix_suggestion="確認 :longdesc 值為有效 URI（http/https/以 # 開頭的錨點）"
            ))
        elif not uri_re.match(ld):
            results.append(CheckResult(
                code="HM1110102C", rule="img longdesc 需為有效 URI",
                status=Status.FAIL, file=fp, line=line, snippet=tag[:80],
                message=f"longdesc='{ld}' 不是有效 URI",
                fix_suggestion=f"改為以 http://、/、或 # 開頭的完整 URI，例如：longdesc='#desc-{ld}'"
            ))
    return results


# ── 1.3.1 資訊與關連性 ────────────────────────────────────────────────────────

def check_heading_order(template: str, offset: int, fp: str) -> list[CheckResult]:
    """HM1130100C: heading 巢狀不得跳級"""
    results = []
    headings = []
    for m in re.finditer(r"<(h[1-6])[\s>]", template, re.IGNORECASE):
        lv = int(m.group(1)[1])
        line = _line_of(template, m.start(), offset)
        headings.append((line, lv))
    for i in range(1, len(headings)):
        prev_line, prev_lv = headings[i - 1]
        cur_line, cur_lv = headings[i]
        if cur_lv > prev_lv + 1:
            results.append(CheckResult(
                code="HM1130100C", rule="heading 巢狀不得跳級",
                status=Status.FAIL, file=fp, line=cur_line,
                message=f"從 h{prev_lv}（第{prev_line}行）跳到 h{cur_lv}，中間缺少 h{prev_lv+1}",
                fix_suggestion=f"將此標題改為 <h{prev_lv+1}> 或在中間補上 h{prev_lv+1} 層次"
            ))
    return results


def check_th_scope(template: str, offset: int, fp: str) -> list[CheckResult]:
    """HM1130101C: <th> 需有 scope 屬性"""
    results = []
    for m in re.finditer(r"<th(\s[^>]*)?>", template, re.IGNORECASE | re.DOTALL):
        line = _line_of(template, m.start(), offset)
        tag = m.group(0)
        scope = _attr(tag, "scope")
        if _has_dynamic(tag, "scope"):
            results.append(CheckResult(
                code="HM1130101C", rule="th scope（動態需人工確認）",
                status=Status.NEEDS_HUMAN, file=fp, line=line, snippet=tag[:80],
                fix_suggestion="確認 :scope 動態值為 row/col/rowgroup/colgroup 之一"
            ))
        elif scope is None:
            results.append(CheckResult(
                code="HM1130101C", rule="th 缺少 scope 屬性",
                status=Status.FAIL, file=fp, line=line, snippet=tag[:80],
                message="<th> 需有 scope 屬性才能讓輔助科技正確關聯資料格",
                fix_suggestion="欄標題加 scope='col'；列標題加 scope='row'"
            ))
    return results


def check_fieldset_legend(template: str, offset: int, fp: str) -> list[CheckResult]:
    """HM1130102C: 同名 radio/checkbox 群組需有 fieldset/legend"""
    results = []
    for m in re.finditer(r"<form(\s[^>]*)?>(.+?)</form>", template, re.DOTALL | re.IGNORECASE):
        line = _line_of(template, m.start(), offset)
        inner = m.group(2)
        radio = re.findall(r'<input\s[^>]*type=["\']?radio["\']?[^>]*name=["\']?(\w+)', inner, re.IGNORECASE)
        cb = re.findall(r'<input\s[^>]*type=["\']?checkbox["\']?[^>]*name=["\']?(\w+)', inner, re.IGNORECASE)
        for name, cnt in Counter(radio + cb).items():
            if cnt > 1 and not re.search(r"<fieldset", inner, re.IGNORECASE):
                results.append(CheckResult(
                    code="HM1130102C", rule="選項群組需有 fieldset/legend",
                    status=Status.FAIL, file=fp, line=line,
                    message=f"name='{name}' 有 {cnt} 個選項但無 <fieldset> 包裹",
                    fix_suggestion=(
                        f"用 <fieldset><legend>問題描述</legend>...{cnt}個選項...</fieldset> 包裹 name='{name}' 的選項群"
                    )
                ))
                break
    return results


def check_input_label(template: str, offset: int, fp: str) -> list[CheckResult]:
    """HM1130104C: 可見表單控制元件需有對應 label 或 title"""
    results = []
    skip_types = {"hidden", "submit", "reset", "button", "image"}
    for m in re.finditer(r"<input(\s[^>]*)?>", template, re.IGNORECASE | re.DOTALL):
        line = _line_of(template, m.start(), offset)
        tag = m.group(0)
        typ = (_attr(tag, "type") or "text").lower()
        if typ in skip_types:
            continue
        if _has_dynamic(tag, "id") or _has_dynamic(tag, "aria-label"):
            results.append(CheckResult(
                code="HM1130104C", rule="表單控制元件 label（動態需人工確認）",
                status=Status.NEEDS_HUMAN, file=fp, line=line, snippet=tag[:80],
                fix_suggestion="確認動態繫結的 id 能對應到 <label for='...'> 或有 aria-label/aria-labelledby"
            ))
            continue
        if _attr(tag, "title") or _attr(tag, "aria-label") or _attr(tag, "aria-labelledby"):
            continue
        elem_id = _attr(tag, "id")
        if elem_id and re.search(
            rf'<label\s[^>]*for=["\']?{re.escape(elem_id)}["\']?', template, re.IGNORECASE
        ):
            continue
        results.append(CheckResult(
            code="HM1130104C", rule="表單控制元件無可存取名稱",
            status=Status.FAIL, file=fp, line=line, snippet=tag[:80],
            message=f"<input type={typ}> 無對應 label/title/aria-label",
            fix_suggestion=(
                "方式一：加 id='xxx' 並在前方加 <label for='xxx'>欄位名稱</label>\n"
                "方式二：加 aria-label='欄位名稱'\n"
                "方式三：加 title='欄位名稱'"
            )
        ))
    return results


# ── 1.3.5 識別輸入目的 ────────────────────────────────────────────────────────

def check_autocomplete(template: str, offset: int, fp: str) -> list[CheckResult]:
    """WCAG-1.3.5: 個人資訊欄位需有 autocomplete 屬性"""
    personal_fields = {
        "name": "name", "email": "email", "tel": "tel",
        "username": "username", "password": "current-password",
        "new-password": "new-password", "address": "street-address",
    }
    results = []
    for m in re.finditer(r"<input(\s[^>]*)?>", template, re.IGNORECASE | re.DOTALL):
        line = _line_of(template, m.start(), offset)
        tag = m.group(0)
        typ = (_attr(tag, "type") or "text").lower()
        if typ in {"hidden", "submit", "reset", "button", "image", "checkbox", "radio"}:
            continue
        elem_id = (_attr(tag, "id") or "").lower()
        name_attr = (_attr(tag, "name") or "").lower()
        key = next((k for k in personal_fields if k in elem_id or k in name_attr), None)
        if key and _attr(tag, "autocomplete") is None and not _has_dynamic(tag, "autocomplete"):
            results.append(CheckResult(
                code="WCAG-1.3.5", rule="個人資訊欄位缺少 autocomplete",
                status=Status.FAIL, file=fp, line=line, snippet=tag[:80],
                message=f"疑似個人資訊欄位（含 '{key}'）未設 autocomplete",
                fix_suggestion=f"加上 autocomplete='{personal_fields[key]}'"
            ))
    return results


# ── 1.4.2 音訊控制 ────────────────────────────────────────────────────────────

def check_autoplay(template: str, offset: int, fp: str) -> list[CheckResult]:
    """WCAG-1.4.2: audio/video autoplay 需提供控制機制"""
    results = []
    for tag_name in ("audio", "video"):
        for m in re.finditer(
            rf"<{tag_name}(\s[^>]*)?>", template, re.IGNORECASE | re.DOTALL
        ):
            line = _line_of(template, m.start(), offset)
            tag = m.group(0)
            if _attr(tag, "autoplay") is not None and _attr(tag, "controls") is None:
                results.append(CheckResult(
                    code="WCAG-1.4.2", rule=f"{tag_name} autoplay 但無 controls",
                    status=Status.FAIL, file=fp, line=line, snippet=tag[:80],
                    message=f"<{tag_name}> 有 autoplay 但缺少 controls 屬性",
                    fix_suggestion=f"加上 controls 屬性，或移除 autoplay；若自訂播放器需確保有暫停/靜音按鈕"
                ))
    return results


# ── 2.4.1 跳過區塊 ────────────────────────────────────────────────────────────

def check_skip_link(template: str, offset: int, fp: str) -> list[CheckResult]:
    """WCAG-2.4.1: 頁面需有跳過導覽的 skip link"""
    has_skip = bool(re.search(
        r'<a\s[^>]*href=["\']#(?:main|content|maincontent|main-content)["\']',
        template, re.IGNORECASE
    ))
    if not has_skip:
        return [CheckResult(
            code="WCAG-2.4.1", rule="缺少 skip link",
            status=Status.FAIL, file="",
            message="未找到跳過導覽的 skip link（href='#main' 等）",
            fix_suggestion=(
                "在 <body> 最前端加入：\n"
                "<a class='sr-only' href='#main-content'>跳至主要內容</a>\n"
                "並確保主要內容區有 id='main-content'"
            )
        )]
    return []


# ── 2.4.2 網頁標題 ────────────────────────────────────────────────────────────

def check_page_title(full_src: str, fp: str) -> list[CheckResult]:
    """WCAG-2.4.2: <title> 非空且有描述性"""
    m = re.search(r"<title[^>]*>([^<]*)</title>", full_src, re.IGNORECASE)
    if not m or not m.group(1).strip():
        return [CheckResult(
            code="WCAG-2.4.2", rule="缺少頁面標題",
            status=Status.FAIL, file=fp,
            message="<title> 不存在或為空",
            fix_suggestion="在 <head> 內加入 <title>頁面名稱 - 系統名稱</title>"
        )]
    return []


# ── 2.4.4 鏈結目的 ────────────────────────────────────────────────────────────

_MEANINGLESS_LINK_TEXT = re.compile(
    r"^\s*(按此|點此|點擊|here|click here|read more|more|詳情|連結|link|more info)\s*$",
    re.IGNORECASE,
)


def check_link_text(template: str, offset: int, fp: str) -> list[CheckResult]:
    """WCAG-2.4.4: 連結文字需有意義"""
    results = []
    for m in re.finditer(r"<a\s[^>]*>(.+?)</a>", template, re.DOTALL | re.IGNORECASE):
        line = _line_of(template, m.start(), offset)
        inner = re.sub(r"<[^>]+>", "", m.group(1)).strip()
        if _meaningless_link_text(inner):
            results.append(CheckResult(
                code="WCAG-2.4.4", rule="連結文字無意義",
                status=Status.FAIL, file=fp, line=line,
                snippet=m.group(0)[:80],
                message=f"連結文字 '{inner}' 脫離脈絡後意義不明確",
                fix_suggestion="改為描述目的地的文字，例如：'查看年度報告'、'前往個人設定'"
            ))
    return results


def _meaningless_link_text(text: str) -> bool:
    return bool(_MEANINGLESS_LINK_TEXT.match(text))


# ── 3.1.1 網頁語言 ────────────────────────────────────────────────────────────

def check_html_lang(full_src: str, fp: str) -> list[CheckResult]:
    """WCAG-3.1.1: <html> 需有 lang 屬性"""
    m = re.search(r"<html(\s[^>]*)?>", full_src, re.IGNORECASE)
    if not m:
        return []
    tag = m.group(0)
    lang = _attr(tag, "lang")
    if _has_dynamic(tag, "lang"):
        return [CheckResult(
            code="WCAG-3.1.1", rule="html lang（動態需人工確認）",
            status=Status.NEEDS_HUMAN, file=fp,
            fix_suggestion="確認 :lang 動態值為有效 BCP 47 語言標籤，如 'zh-TW'、'en'"
        )]
    if lang is None or lang.strip() == "":
        return [CheckResult(
            code="WCAG-3.1.1", rule="html 缺少 lang 屬性",
            status=Status.FAIL, file=fp,
            snippet=tag[:80],
            message="<html> 需有 lang 屬性讓輔助科技正確朗讀",
            fix_suggestion="加上 lang='zh-TW'（繁體中文）：<html lang='zh-TW'>"
        )]
    return []


# ── 4.1.1 語法分析 ────────────────────────────────────────────────────────────

def check_duplicate_id(template: str, offset: int, fp: str) -> list[CheckResult]:
    """WCAG-4.1.1: ID 需唯一"""
    results = []
    ids = re.findall(r'\bid=["\']([^"\']+)["\']', template, re.IGNORECASE)
    for id_val, cnt in Counter(ids).items():
        if cnt > 1:
            results.append(CheckResult(
                code="WCAG-4.1.1", rule="ID 重複",
                status=Status.FAIL, file=fp,
                message=f"id='{id_val}' 出現 {cnt} 次",
                fix_suggestion=f"確保每個 id 值在整頁唯一；重複的元素改用 class 或加編號後綴如 '{id_val}-2'"
            ))
    return results


# ── 4.1.2 名稱、角色和值 ─────────────────────────────────────────────────────

def check_button_accessible_name(template: str, offset: int, fp: str) -> list[CheckResult]:
    """WCAG-4.1.2: <button> 需有可存取名稱"""
    results = []
    for m in re.finditer(r"<button(\s[^>]*)?>(.+?)</button>", template, re.DOTALL | re.IGNORECASE):
        line = _line_of(template, m.start(), offset)
        tag = m.group(1) or ""
        inner = re.sub(r"<[^>]+>", "", m.group(2)).strip()
        aria_label = _attr("<button" + tag + ">", "aria-label")
        aria_labelledby = _attr("<button" + tag + ">", "aria-labelledby")
        title = _attr("<button" + tag + ">", "title")
        if not inner and not aria_label and not aria_labelledby and not title:
            results.append(CheckResult(
                code="WCAG-4.1.2", rule="button 無可存取名稱",
                status=Status.FAIL, file=fp, line=line,
                snippet=m.group(0)[:80],
                message="<button> 無文字內容、aria-label、或 aria-labelledby",
                fix_suggestion="加上文字內容、aria-label='關閉'、或 title='關閉'"
            ))
    return results


def check_interactive_role(template: str, offset: int, fp: str) -> list[CheckResult]:
    """WCAG-4.1.2: 自訂互動元件需有適當 role"""
    results = []
    # 偵測有 onclick 但非原生互動元素且無 role 的 div/span
    non_semantic = re.compile(
        r"<(div|span)(\s[^>]*)?(@click|v-on:click|onclick)[^>]*>",
        re.IGNORECASE | re.DOTALL
    )
    for m in non_semantic.finditer(template):
        tag = m.group(0)
        line = _line_of(template, m.start(), offset)
        role = _attr(tag, "role")
        tabindex = _attr(tag, "tabindex")
        if not role and not tabindex:
            results.append(CheckResult(
                code="WCAG-4.1.2", rule="div/span 有 click 事件但無 role/tabindex",
                status=Status.FAIL, file=fp, line=line,
                snippet=tag[:80],
                message="非原生互動元件有 click 事件但缺少 role 和 tabindex",
                fix_suggestion=(
                    "改用 <button> 元素；或加上 role='button' tabindex='0' 並處理 keydown Enter/Space 事件"
                )
            ))
    return results


# ── 4.1.3 狀態訊息 ──────────────────────────────────────────────────────────

def check_aria_live(template: str, offset: int, fp: str) -> list[CheckResult]:
    """WCAG-4.1.3: 成功/錯誤等狀態訊息需有 aria-live 或 role=alert"""
    results = []
    # 找看起來像錯誤訊息的元素（class 含 error/alert/success）但無 aria-live/role=alert
    for m in re.finditer(
        r'<(?:div|span|p)([^>]*class=["\'][^"\']*(?:error|alert|success|warning|message)[^"\']*["\'][^>]*)>',
        template, re.IGNORECASE
    ):
        tag = m.group(0)
        line = _line_of(template, m.start(), offset)
        if not re.search(r'\baria-live\b|\brole=["\']?alert', tag, re.IGNORECASE):
            results.append(CheckResult(
                code="WCAG-4.1.3", rule="狀態訊息元素缺少 aria-live",
                status=Status.FAIL, file=fp, line=line,
                snippet=tag[:80],
                message="偵測到狀態訊息元素（class 含 error/alert 等）但無 aria-live 或 role=alert",
                fix_suggestion=(
                    "錯誤訊息加 role='alert'；\n"
                    "一般狀態更新加 aria-live='polite'；\n"
                    "緊急訊息加 aria-live='assertive'"
                )
            ))
    return results


# ── NEEDS_HUMAN：無法靜態驗證的成功準則 ──────────────────────────────────────

def needs_human_runtime_checks(fp: str) -> list[CheckResult]:
    """將無法靜態驗證的成功準則列出，標 NEEDS_HUMAN"""
    items = [
        ("WCAG-1.2.1", "純音訊/純視訊 需提供替代內容（字幕/逐字稿）",
         "開啟頁面確認所有 <audio>/<video> 是否有字幕或等義文字稿"),
        ("WCAG-1.2.2", "預錄同步媒體 需有字幕",
         "播放影片確認字幕正確且同步"),
        ("WCAG-1.2.3", "同步媒體 需有音訊描述或替代媒體",
         "確認有音訊描述軌或提供替代文字媒體"),
        ("WCAG-1.2.4", "現場直播 需有即時字幕（AA）",
         "若有現場直播功能，確認提供即時字幕"),
        ("WCAG-1.2.5", "預錄視訊 需有音訊描述（AA）",
         "確認影片有描述畫面內容的音訊描述軌"),
        ("WCAG-1.3.2", "DOM 順序需有意義",
         "關閉 CSS 後確認頁面線性閱讀順序仍合理"),
        ("WCAG-1.3.3", "指示不得僅靠感官特徵（形狀/顏色/位置）",
         "確認說明中無『按右側紅色按鈕』等純感官描述"),
        ("WCAG-1.3.4", "螢幕方向不得鎖定",
         "在手機瀏覽確認旋轉螢幕後內容正常顯示"),
        ("WCAG-1.4.1", "顏色不是唯一區分方式",
         "確認連結/錯誤/狀態除顏色外還有底線/圖示/文字等區別"),
        ("WCAG-1.4.3", "文字對比值至少 4.5:1（AA）",
         "使用 contrast.py 或瀏覽器 DevTools 量測所有文字/背景組合"),
        ("WCAG-1.4.5", "避免影像文字（AA）",
         "確認非必要情況下不使用帶文字的圖片，改用 CSS 文字"),
        ("WCAG-1.4.10", "流動排版：320px 寬度不需水平捲動（AA）",
         "將瀏覽器縮至 320px 寬，確認無水平捲動條"),
        ("WCAG-1.4.11", "UI 元件/圖形對比至少 3:1（AA）",
         "量測按鈕邊框、圖示等非文字元件與相鄰背景的對比值"),
        ("WCAG-1.4.12", "調整文字間距後功能不喪失（AA）",
         "注入 bookmarklet 測試：line-height 1.5×、letter-spacing 0.12em"),
        ("WCAG-1.4.13", "懸浮/焦點內容可移除、可移動、持續（AA）",
         "測試 tooltip/dropdown：Esc 可關閉、滑鼠可移入不消失"),
        ("WCAG-2.1.1", "全部功能可用鍵盤操作",
         "Tab 走訪全頁確認所有互動元件皆可鍵盤觸發"),
        ("WCAG-2.1.2", "無鍵盤焦點陷阱",
         "Tab 走訪確認焦點不卡在任何元件，modal 關閉後焦點回到觸發點"),
        ("WCAG-2.1.4", "快捷鍵可停用或重對應",
         "若有單鍵快捷鍵，確認提供停用/重對應機制"),
        ("WCAG-2.2.1", "計時限制可調整",
         "確認 session timeout 前有警告且可延長"),
        ("WCAG-2.2.2", "動態內容可暫停/停止",
         "確認輪播/跑馬燈有暫停按鈕"),
        ("WCAG-2.3.1", "無每秒超過 3 次閃爍",
         "使用 Photosensitive Epilepsy Analysis Tool (PEAT) 分析頁面"),
        ("WCAG-2.4.3", "焦點順序保留意義",
         "Tab 走訪確認焦點順序與視覺順序一致"),
        ("WCAG-2.4.5", "提供多種方式找到網頁（AA）",
         "確認有搜尋功能或網站地圖"),
        ("WCAG-2.4.6", "標題和標籤描述目的（AA）",
         "確認所有 heading 和 label 能清楚描述其後的內容"),
        ("WCAG-2.4.7", "焦點可視（AA）",
         "Tab 走訪確認每個元件的焦點框清晰可見"),
        ("WCAG-2.5.1", "複雜手勢有替代單點操作",
         "確認滑動/縮放等手勢有對應按鈕替代"),
        ("WCAG-2.5.2", "指標取消可逆",
         "確認 mouseup 時才觸發動作，或可取消"),
        ("WCAG-2.5.3", "標籤名稱含可視文字",
         "確認 aria-label 包含可視標籤文字"),
        ("WCAG-2.5.4", "動作啟動有替代方式",
         "確認裝置搖動等動作有按鈕替代且可停用"),
        ("WCAG-3.1.2", "局部語言有 lang 標記（AA）",
         "確認頁面中外語片段有 lang 屬性"),
        ("WCAG-3.2.1", "焦點不改變脈絡",
         "Tab 走訪確認取得焦點時不自動觸發導覽或對話框"),
        ("WCAG-3.2.2", "輸入不自動改變脈絡",
         "確認 select/checkbox 改變時不自動跳頁"),
        ("WCAG-3.2.3", "導覽順序一致（AA）",
         "跨頁確認導覽選單項目順序相同"),
        ("WCAG-3.2.4", "功能元件識別一致（AA）",
         "確認相同功能的按鈕在各頁面用相同名稱/圖示"),
        ("WCAG-3.3.2", "提供標籤/說明",
         "確認所有欄位有 label 或 placeholder 說明"),
        ("WCAG-3.3.3", "提供錯誤更正建議（AA）",
         "提交表單後確認錯誤訊息有說明如何更正"),
        ("WCAG-3.3.4", "重要送出有確認/撤銷機制（AA）",
         "確認刪除/送出重要資料前有確認步驟"),
    ]
    return [
        CheckResult(
            code=code, rule=rule,
            status=Status.NEEDS_HUMAN, file=fp,
            message="此準則需運行期或人工驗證",
            fix_suggestion=fix
        )
        for code, rule, fix in items
    ]


# ── 公開介面 ─────────────────────────────────────────────────────────────────

def check_html(filepath: str, content: str, include_needs_human: bool = True) -> list[CheckResult]:
    """對 HTML/Vue template 執行 informal WCAG 規則 + 列出需人工驗證的成功準則。

    重要：自從採用「一碼一檔」原則（SKILL.md 原則四）後，
    所有「有官方 C 碼編號」的檢查已遷移至 c_code_tests/<CODE>.py，
    本函式只保留**沒有對應 C 碼編號**的 informal WCAG 規則：

      WCAG-1.3.5  autocomplete 屬性
      WCAG-1.4.2  audio/video autoplay
      WCAG-2.4.1  skip link 存在
      WCAG-2.4.4  連結文字語意品質（如禁止「按這裡」）
      WCAG-4.1.1  ID 唯一性
      WCAG-4.1.3  status 訊息 aria-live

    以下函式仍保留檔案中以維持 import 相容性，但不再被 orchestrator 呼叫：
      check_img_alt              → 升級為 HM1110100C
      check_area_alt             → 升級為 HM1110101C
      check_input_image_alt      → 升級為 HM1110104C
      check_object_alt           → 升級為 HM1110105C
      check_img_empty_alt_no_title → 升級為 HM1110106C
      check_img_longdesc         → 升級為 HM1110102C
      check_heading_order        → 升級為 HM1130100C
      check_th_scope             → 升級為 HM1130101C
      check_fieldset_legend      → 升級為 HM1130102C
      check_input_label          → 升級為 HM1130104C
      check_page_title           → 升級為 HM1240200C
      check_html_lang            → 升級為 HM1310100C
      check_button_accessible_name → 涵蓋於 HM1410200C
      check_interactive_role     → 涵蓋於 HM1410200C
    """
    template, offset = _extract_template(content)
    offset_0 = offset - 1
    results: list[CheckResult] = []

    # 過去在此呼叫的 6 個 informal 函式已升格為 supplementary_tests/ 模組：
    #   check_autocomplete   → supplementary_tests/WCAG_1_3_5.py
    #   check_autoplay       → supplementary_tests/WCAG_1_4_2.py
    #   check_skip_link      → supplementary_tests/WCAG_2_4_1.py
    #   check_link_text      → supplementary_tests/WCAG_2_4_4.py
    #   check_duplicate_id   → supplementary_tests/WCAG_4_1_1.py
    #   check_aria_live      → supplementary_tests/WCAG_4_1_3.py
    # 由 supplementary_runner 統一呼叫，此處不再重複執行。

    # 需人工確認的準則（無法靜態驗證的 WCAG 項目清單）
    if include_needs_human:
        results.extend(needs_human_runtime_checks(filepath))

    return results
