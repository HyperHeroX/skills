"""共用資料型別：CheckResult"""
from __future__ import annotations
from dataclasses import dataclass, field
from enum import Enum


class Status(str, Enum):
    PASS = "pass"
    FAIL = "fail"
    NEEDS_HUMAN = "needs_human"


@dataclass
class CheckResult:
    code: str           # 台灣檢測碼或 WCAG 成功準則編號，如 HM1110100C / WCAG-1.1.1
    rule: str           # 規則簡述
    status: Status
    file: str = ""
    line: int = 0
    col: int = 0
    message: str = ""
    snippet: str = ""
    fix_suggestion: str = ""   # 修復建議（fail/needs_human 時填寫）

    def to_dict(self) -> dict:
        return {
            "code": self.code,
            "rule": self.rule,
            "status": self.status.value,
            "file": self.file,
            "line": self.line,
            "col": self.col,
            "message": self.message,
            "snippet": self.snippet,
            "fix_suggestion": self.fix_suggestion,
        }
