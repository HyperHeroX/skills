"""state.py — TWAA 技能進度持久化模組

state.json schema：
{
  "version": 1,
  "level": "AAA" | "AA" | "A",
  "started_at": ISO8601,
  "phase": 1 | 2 | 3 | 4,
  "sitemap": [{path, title, priority, status}, ...],
  "results": {
    <path>: {
      <guideline_id>: {status, checks: [...], issues: [...]}
    }
  },
  "pending_review": [{page, guideline, evidence}, ...]
}
"""
from __future__ import annotations

from dataclasses import dataclass, field
from datetime import datetime, timezone
from enum import Enum
from pathlib import Path
from typing import Any, Iterator
import json


class CellStatus(str, Enum):
    NOT_STARTED = "not_started"
    IN_PROGRESS = "in_progress"
    PASSED = "passed"
    FAILED = "failed"
    NEEDS_HUMAN = "needs_human"


@dataclass
class Cell:
    status: CellStatus = CellStatus.NOT_STARTED
    checks: list[str] = field(default_factory=list)
    issues: list[dict[str, Any]] = field(default_factory=list)


class State:
    SCHEMA_VERSION = 1

    def __init__(self, path: Path, level: str = "AA") -> None:
        self.path = Path(path)
        self.level = level
        self.started_at = datetime.now(timezone.utc).isoformat()
        self.phase = 1
        self.sitemap: list[dict[str, Any]] = []
        self.results: dict[str, dict[str, dict[str, Any]]] = {}
        self.pending_review: list[dict[str, Any]] = []

    @classmethod
    def load(cls, path: Path) -> "State":
        data = json.loads(Path(path).read_text(encoding="utf-8"))
        s = cls(Path(path), level=data["level"])
        s.started_at = data["started_at"]
        s.phase = data["phase"]
        s.sitemap = data["sitemap"]
        s.results = data["results"]
        s.pending_review = data["pending_review"]
        return s

    def save(self) -> None:
        payload = {
            "version": self.SCHEMA_VERSION,
            "level": self.level,
            "started_at": self.started_at,
            "phase": self.phase,
            "sitemap": self.sitemap,
            "results": self.results,
            "pending_review": self.pending_review,
        }
        self.path.parent.mkdir(parents=True, exist_ok=True)
        self.path.write_text(
            json.dumps(payload, indent=2, ensure_ascii=False), encoding="utf-8"
        )

    def set_sitemap(self, pages: list[dict[str, Any]]) -> None:
        self.sitemap = [
            {**p, "status": p.get("status", "not_started")} for p in pages
        ]

    def record(self, page: str, guideline: str, cell: Cell) -> None:
        self.results.setdefault(page, {})
        self.results[page][guideline] = {
            "status": cell.status.value,
            "checks": cell.checks,
            "issues": cell.issues,
        }

    def get_cell(self, page: str, guideline: str) -> Cell:
        d = self.results.get(page, {}).get(guideline)
        if not d:
            return Cell()
        return Cell(
            status=CellStatus(d["status"]),
            checks=d["checks"],
            issues=d["issues"],
        )

    def pending_cells(self, guideline_ids: list[str]) -> Iterator[tuple[str, str]]:
        for p in self.sitemap:
            for gid in guideline_ids:
                cell = self.get_cell(p["path"], gid)
                if cell.status in (CellStatus.PASSED, CellStatus.FAILED):
                    continue
                yield (p["path"], gid)

    def add_pending_review(self, item: dict[str, Any]) -> None:
        self.pending_review.append(item)
