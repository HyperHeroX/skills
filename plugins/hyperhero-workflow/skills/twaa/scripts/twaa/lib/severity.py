"""severity.py — 將 (指引編號, 等級, 子類型) 對應到嚴重度。

Severity 用於排序報告呈現順序與決定 needs_human 是否上昇成 failed。
"""
from __future__ import annotations
from enum import Enum


class Severity(str, Enum):
    CRITICAL = "critical"
    HIGH = "high"
    MEDIUM = "medium"
    LOW = "low"


# 永遠是 CRITICAL 的指引
_CRITICAL = {"2.1.2", "2.1.1", "1.1.1"}

# A/AA 等級為 HIGH
_HIGH_AA = {
    "1.4.3", "1.4.4", "1.4.10", "1.4.11", "2.4.1", "2.4.5", "2.4.7",
    "3.1.1", "3.2.1", "3.2.2", "3.3.1", "3.3.2", "3.3.3", "3.3.3", "4.1.2",
}


def score(guideline: str, level: str, subtype: str | None = None) -> Severity:
    if subtype == "decorative":
        return Severity.LOW
    if guideline in _CRITICAL:
        return Severity.CRITICAL
    if level == "AAA":
        return Severity.MEDIUM
    if guideline in _HIGH_AA:
        return Severity.HIGH
    return Severity.MEDIUM
