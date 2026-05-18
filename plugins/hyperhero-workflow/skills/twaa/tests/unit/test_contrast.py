from pathlib import Path
from twaa.contrast import (
    relative_luminance, contrast_ratio,
    parse_scss_variables, extract_color_pairs, scan_scss_file,
)


def test_contrast_basic() -> None:
    l1 = relative_luminance(255, 255, 255)
    l2 = relative_luminance(0, 0, 0)
    assert abs(contrast_ratio(l1, l2) - 21.0) < 0.01


def test_parse_scss_lighten(tmp_path: Path) -> None:
    f = tmp_path / "vars.scss"
    f.write_text("$primary: #1a7a94;\n$light: lighten($primary, 20%);\n")
    vars_ = parse_scss_variables(f)
    assert vars_["primary"] == "#1A7A94"
    assert vars_["light"].startswith("#")


def test_scan_scss_file_finds_low_contrast(tmp_path: Path) -> None:
    f = tmp_path / "btn.scss"
    f.write_text("""
$primary: #1a7a94;
$light: lighten($primary, 20%);
.btn { background: $light; color: #FFFFFF; }
""")
    issues = scan_scss_file(f)
    assert any(i["rule"] == "low-contrast" for i in issues)
