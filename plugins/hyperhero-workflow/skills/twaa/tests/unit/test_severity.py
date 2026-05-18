from twaa.lib.severity import score, Severity


def test_critical_for_keyboard_trap() -> None:
    assert score(guideline="2.1.2", level="A") == Severity.CRITICAL


def test_high_for_contrast_aa() -> None:
    assert score(guideline="1.4.3", level="AA") == Severity.HIGH


def test_medium_for_aaa_only() -> None:
    assert score(guideline="2.4.8", level="AAA") == Severity.MEDIUM


def test_low_for_decorative_alt() -> None:
    assert score(guideline="1.1.1", level="A", subtype="decorative") == Severity.LOW
