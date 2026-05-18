from pathlib import Path
from twaa.merge_reports import merge_to_single_md


def test_merge_combines_summary_and_per_page(tmp_path: Path) -> None:
    audit = tmp_path / "audit"
    (audit / "per-page").mkdir(parents=True)
    (audit / "per-guideline").mkdir(parents=True)
    (audit / "summary.md").write_text("# 總覽\n本網站總體狀況...", encoding="utf-8")
    (audit / "per-page" / "home.md").write_text("# 首頁\n首頁細節", encoding="utf-8")
    (audit / "per-guideline" / "1.1.1.md").write_text("# 1.1.1\n指引細節", encoding="utf-8")

    out = tmp_path / "full-report.md"
    merge_to_single_md(audit, out, project_name="測試")

    txt = out.read_text(encoding="utf-8")
    assert "本網站總體狀況" in txt
    assert "首頁細節" in txt
    assert "指引細節" in txt
