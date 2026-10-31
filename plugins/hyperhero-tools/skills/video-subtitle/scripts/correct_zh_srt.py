#!/usr/bin/env python3
"""
Post-processing script to correct common Whisper transcription errors
in Traditional Chinese SRT subtitle files.

Focuses on:
- Homophone confusion (同音字)
- Proper noun garbling (專有名詞)
- Technical term corruption (技術術語)
- Context-dependent errors

Usage:
    python correct_zh_srt.py <input.srt> [--output <corrected.srt>]

The default corrections cover general Traditional Chinese errors.
For domain-specific corrections, add entries to CUSTOM_REPLACEMENTS below.
"""

import argparse
import re
import os
import sys

# ============================================================
# CORRECTION TABLES
# Order matters: longer/more specific patterns should come first
# to avoid partial match issues.
# ============================================================

# General Traditional Chinese homophone corrections
HOMOPHONE_CORRECTIONS = [
    # 機構名稱
    ("公園醫院自通所", "工研院資通所"),
    ("書法部", "數發部"),
    ("蘇巴布", "數發部"),

    # 自我介紹
    ("畢信王", "敝姓王"),
    ("畢信", "敝姓"),

    # 常見同音錯字
    ("自安議題", "資安議題"),
    ("自安的", "資安的"),
    ("自安", "資安"),  # Broad - apply last
    ("來跟各位憲進", "來跟各位先進"),
    ("各位憲進", "各位先進"),
    ("被父母的一些任務", "被賦予的一些任務"),
    ("完成性", "完整性"),
    ("結洽", "接洽"),
    ("測象", "測項"),

    # 著作權 vs 制裁權
    ("制裁權的保護", "著作權的保護"),
    ("在制裁權的部分", "在著作權的部分"),
    ("制裁權", "著作權"),

    # 裁罰相關
    ("做對應的猜法", "做對應的裁罰"),
    ("明確在做猜法", "明確在做裁罰"),
    ("猜成了兩個", "拆成了兩個"),
]

# Proper noun corrections
PROPER_NOUN_CORRECTIONS = [
    ("公其郡的工作室", "宮崎駿的工作室"),
    ("基普力工作室", "吉卜力工作室"),
    ("吉普利工作室", "吉卜力工作室"),
]

# English/technical term corrections
TECHNICAL_CORRECTIONS = [
    # Security terms
    ("Interact Brown Injection Attack", "Indirect Prompt Injection Attack"),
    ("Interact Brown Injection", "Indirect Prompt Injection"),
    ("Cross-Side Request Forage", "Cross-Site Request Forgery"),
    ("Cross-Plugin Request Forage", "Cross-Plugin Request Forgery"),
    ("Large Length Model", "Large Language Model"),
    ("OASP Top 10", "OWASP Top 10"),
    ("OASP", "OWASP"),
    ("Bronin Json", "Prompt Injection"),
    ("Sequence Json", "SQL Injection"),
    ("Deepflag", "Deepfake"),
    ("Jet Brakes", "Jailbreak"),
    ("Fast Detection", "Face Detection"),
    ("MCPCLI", "MCP、CLI"),
]

# Context-dependent corrections
CONTEXT_CORRECTIONS = [
    # 攻擊 vs 供給 (in security context)
    ("供給威脅", "攻擊威脅"),
    ("供給還會造成", "攻擊還會造成"),
    ("供給的貼紙", "攻擊的貼紙"),
    ("對抗式樣本供給", "對抗式樣本攻擊"),
    ("這類型的供給就可以", "這類型的攻擊就可以"),

    # AI terminology
    ("生成是AI", "生成式AI"),
    ("人眼識別", "人臉識別"),
    ("自然的攻擊", "資安的攻擊"),
]

# Regex-based corrections for truncated words
REGEX_CORRECTIONS = [
    (r"攻擊的Prom\b", "攻擊的Prompt"),
    (r"System Prom\b", "System Prompt"),
    (r"那個Prom\b", "那個Prompt"),
]

# ============================================================
# Add your custom domain-specific corrections here
# ============================================================
CUSTOM_REPLACEMENTS = [
    # ("錯誤文字", "正確文字"),
]


def correct_srt(content, verbose=False):
    """Apply all correction tables to SRT content."""
    total_changes = 0

    all_replacements = (
        HOMOPHONE_CORRECTIONS +
        PROPER_NOUN_CORRECTIONS +
        TECHNICAL_CORRECTIONS +
        CONTEXT_CORRECTIONS +
        CUSTOM_REPLACEMENTS
    )

    for old, new in all_replacements:
        count = content.count(old)
        if count > 0:
            content = content.replace(old, new)
            total_changes += count
            if verbose:
                print(f"  [{count:3d}x] '{old}' → '{new}'")

    for pattern, replacement in REGEX_CORRECTIONS:
        matches = re.findall(pattern, content)
        if matches:
            content = re.sub(pattern, replacement, content)
            total_changes += len(matches)
            if verbose:
                print(f"  [regex {len(matches):3d}x] '{pattern}' → '{replacement}'")

    return content, total_changes


def main():
    parser = argparse.ArgumentParser(
        description="Correct common Whisper errors in Traditional Chinese SRT files"
    )
    parser.add_argument("input", help="Path to SRT file")
    parser.add_argument("--output", "-o", help="Output path (default: overwrite input)")
    parser.add_argument("--verbose", "-v", action="store_true", help="Show each correction")
    args = parser.parse_args()

    if not os.path.exists(args.input):
        print(f"Error: File not found: {args.input}", file=sys.stderr)
        sys.exit(1)

    with open(args.input, "r", encoding="utf-8-sig") as f:
        content = f.read()

    corrected, change_count = correct_srt(content, verbose=args.verbose)

    output_path = args.output or args.input
    with open(output_path, "w", encoding="utf-8-sig") as f:
        f.write(corrected)

    print(f"Total corrections: {change_count}")
    print(f"Output: {output_path}")


if __name__ == "__main__":
    main()
