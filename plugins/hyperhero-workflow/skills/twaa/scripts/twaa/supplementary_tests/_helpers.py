"""共用工具：複用 c_code_tests/_helpers.py，避免重複實作。"""
from ..c_code_tests._helpers import (
    strip_comments,
    extract_style,
    extract_template,
    line_of,
    attr,
    has_dynamic,
    find_tags,
)
