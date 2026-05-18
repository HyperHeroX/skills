"""單元測試：state.py CRUD 與序列化"""
from pathlib import Path
from twaa.lib.state import State, CellStatus, Cell


def test_create_empty_state(tmp_path: Path) -> None:
    s = State(tmp_path / "state.json", level="AAA")
    assert s.level == "AAA"
    assert s.phase == 1
    assert s.sitemap == []
    assert s.results == {}


def test_set_sitemap_and_persist(tmp_path: Path) -> None:
    p = tmp_path / "state.json"
    s = State(p, level="AA")
    s.set_sitemap([{"path": "/home", "title": "首頁", "priority": 1}])
    s.save()

    s2 = State.load(p)
    assert s2.level == "AA"
    assert len(s2.sitemap) == 1
    assert s2.sitemap[0]["path"] == "/home"


def test_record_cell_result(tmp_path: Path) -> None:
    s = State(tmp_path / "state.json", level="AA")
    s.set_sitemap([{"path": "/home", "title": "首頁", "priority": 1}])
    s.record("/home", "1.4.3", Cell(status=CellStatus.PASSED, checks=["static"]))
    assert s.get_cell("/home", "1.4.3").status == CellStatus.PASSED


def test_resume_skips_completed(tmp_path: Path) -> None:
    p = tmp_path / "state.json"
    s = State(p, level="AA")
    s.set_sitemap([
        {"path": "/home", "title": "首頁", "priority": 1},
        {"path": "/about", "title": "關於", "priority": 2},
    ])
    s.record("/home", "1.4.3", Cell(status=CellStatus.PASSED, checks=["static"]))
    s.save()

    s2 = State.load(p)
    pending = list(s2.pending_cells(["1.4.3", "2.4.1"]))
    assert ("/home", "1.4.3") not in pending
    assert ("/home", "2.4.1") in pending
    assert ("/about", "1.4.3") in pending
