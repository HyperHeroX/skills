#!/usr/bin/env python3
"""查詢台灣 TWAA 檢測碼完整說明。

用法：
    python scripts/lookup_checkcode.py CS2140401C
    python scripts/lookup_checkcode.py 1.4.4        # 查某成功準則所有碼
    python scripts/lookup_checkcode.py --list AA    # 列出 AA 等級所有碼
"""

import sys
import re
import io
from pathlib import Path

SPEC_PATH = Path(__file__).parent.parent / "references" / "taiwan-spec.md"

def find_checkcode(code: str, content: str) -> str:
    idx = content.find(code)
    if idx < 0:
        return f"❌ 未找到檢測碼 {code}"

    # 向前找段落起始 (**1.x.x CODE desc**)
    start = content.rfind("**", 0, idx)
    if start < 0:
        start = max(0, idx - 100)

    # 向後找段落結束（下一個 ---\n 或下一個 ##### 標題）
    end_m = re.search(r'\n---\n|\n##### ', content[idx:])
    end = idx + end_m.start() if end_m else min(len(content), idx + 1500)

    return content[start:end].strip()


def list_criteria(criteria: str, content: str) -> str:
    codes = re.findall(r'[A-Z]{2}\d{7}[CE]', content)
    found = []
    for code in sorted(set(codes)):
        i = content.find(code)
        if i < 0:
            continue
        crit_m = re.search(r'對應成功準則.*?\|\s*(\d+\.\d+\.\d+)', content[i:i+400])
        if crit_m and crit_m.group(1) == criteria:
            level_m = re.search(r'對應認證等級.*?\|\s*(AA?A?|A)\b', content[i:i+400])
            level = level_m.group(1) if level_m else '?'
            bold_m = re.search(r'\*\*[^*]+' + re.escape(code) + r'\s+(.+?)\*\*', content[max(0,i-200):i+100])
            desc = bold_m.group(1)[:60] if bold_m else ''
            found.append(f"- `{code}` [{level}] {desc}")
    if not found:
        return f"❌ 未找到成功準則 {criteria} 的檢測碼"
    return f"## 成功準則 {criteria} 的所有檢測碼\n\n" + "\n".join(found)


def list_level(level: str, content: str) -> str:
    codes = re.findall(r'[A-Z]{2}\d{7}[CE]', content)
    found = []
    seen = set()
    for code in codes:
        if code in seen:
            continue
        seen.add(code)
        i = content.find(code)
        if i < 0:
            continue
        level_m = re.search(r'對應認證等級.*?\|\s*(AA?A?|A)\b', content[i:i+400])
        if level_m and level_m.group(1) == level:
            crit_m = re.search(r'對應成功準則.*?\|\s*(\d+\.\d+\.\d+)', content[i:i+400])
            crit = crit_m.group(1) if crit_m else '?'
            bold_m = re.search(r'\*\*[^*]+' + re.escape(code) + r'\s+(.+?)\*\*', content[max(0,i-200):i+100])
            desc = bold_m.group(1)[:55] if bold_m else ''
            ctype = '🤖' if code.endswith('C') else '👤'
            found.append(f"| {crit} | `{code}` | {ctype} | {desc} |")
    if not found:
        return f"❌ 未找到等級 {level} 的檢測碼"
    header = f"## {level} 等級檢測碼（共 {len(found)} 項）\n\n| 準則 | 碼 | 類型 | 說明 |\n|------|-----|------|------|\n"
    return header + "\n".join(found)


def main():
    sys.stdout = io.TextIOWrapper(sys.stdout.buffer, encoding='utf-8', errors='replace')

    if not SPEC_PATH.exists():
        print(f"❌ 找不到規範檔案：{SPEC_PATH}")
        sys.exit(1)

    content = SPEC_PATH.read_text(encoding='utf-8')

    if len(sys.argv) < 2:
        print(__doc__)
        sys.exit(0)

    arg = sys.argv[1]

    if arg == '--list' and len(sys.argv) >= 3:
        print(list_level(sys.argv[2], content))
    elif re.match(r'^\d+\.\d+\.\d+$', arg):
        print(list_criteria(arg, content))
    elif re.match(r'^[A-Z]{2}\d{7}[CE]$', arg):
        print(find_checkcode(arg, content))
    else:
        print(f"❌ 無法識別查詢格式：{arg}")
        print("請輸入：檢測碼（如 CS2140401C）、成功準則（如 1.4.4）、或 --list AA")
        sys.exit(1)


if __name__ == '__main__':
    main()
