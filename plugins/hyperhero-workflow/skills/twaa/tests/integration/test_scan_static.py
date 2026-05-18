from pathlib import Path
from twaa.scan_static import StaticScanner


def test_scanner_collects_findings_across_languages(tmp_path: Path) -> None:
    project = tmp_path / "proj"
    project.mkdir()
    (project / "App.vue").write_text(
        '<template><img src="/x.png" /></template>',
        encoding="utf-8",
    )
    (project / "App.tsx").write_text(
        'export const A = () => <img src="/y.png" />;',
        encoding="utf-8",
    )
    (project / "btn.scss").write_text(
        '$p: #1a7a94;\n$l: lighten($p, 20%);\n.btn{background:$l;color:#FFF;}',
        encoding="utf-8",
    )

    scanner = StaticScanner(project)
    findings = scanner.run()

    rules = {f["rule"] for f in findings}
    assert "img-without-alt" in rules
    assert "low-contrast" in rules
