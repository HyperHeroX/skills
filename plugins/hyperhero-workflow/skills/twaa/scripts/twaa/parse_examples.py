"""parse_examples.py -- 解析官方稽核評量碼範例檔案

從 references/examples/*.md 提取：
- 規則說明
- 稽核/檢測步驟
- 範例圖片路徑與說明
- 修復建議

用法：
  from twaa.parse_examples import ExampleDB
  db = ExampleDB()
  info = db.get('GN1240100E')
  print(info.rule_desc)
  print(info.steps)
  for img in info.images:
      print(img.path, img.caption)
"""
from __future__ import annotations
import re
import json
from dataclasses import dataclass, field
from pathlib import Path
from functools import lru_cache

EXAMPLES_DIR = Path(__file__).resolve().parent.parent.parent / "references" / "examples"
IMAGES_DIR   = Path(__file__).resolve().parent.parent.parent / "references" / "images"


@dataclass
class ExampleImage:
    """範例圖片資訊"""
    path: str           # 相對路徑（../images/1658/img1.jpg）
    abs_path: Path      # 絕對路徑
    caption: str        # 圖片說明文字
    index: int          # 圖片編號（1, 2, 3...）

    @property
    def exists(self) -> bool:
        return self.abs_path.exists()

    def md_ref(self) -> str:
        """回傳在 fix plan 中使用的 Markdown 圖片語法"""
        return f"![範例圖片{self.index}]({self.path})\n> {self.caption}"


@dataclass
class ExampleInfo:
    """單一稽核評量碼的完整資訊"""
    code: str
    criterion: str          # 對應成功準則（如 2.4.1）
    level: str              # A / AA / AAA
    category: str           # HTML / CSS / General / ARIA / ...
    message: str            # 規則訊息（中文）
    message_en: str         # 英文訊息
    rule_desc: str          # 規則說明段落
    steps: str              # 稽核/檢測說明步驟
    extra: str              # 補充說明
    images: list[ExampleImage] = field(default_factory=list)
    source_file: Path | None = None

    def has_images(self) -> bool:
        return len(self.images) > 0

    def image_summary(self) -> str:
        """所有圖片說明的摘要文字"""
        if not self.images:
            return ""
        return "\n".join(
            f"  圖{img.index}：{img.caption[:100]}"
            for img in self.images
            if img.caption
        )

    def fix_guidance(self) -> str:
        """組合步驟 + 圖片說明，作為修復指引"""
        parts = []
        if self.steps:
            parts.append(f"**稽核步驟：**\n{self.steps}")
        if self.image_summary():
            parts.append(f"**範例圖片說明：**\n{self.image_summary()}")
        return "\n\n".join(parts)


def _extract_field(content: str, label: str) -> str:
    m = re.search(rf'\*\*{label}\*\*[：:]\s*(.+)', content)
    return m.group(1).strip() if m else ""


def _extract_section(content: str, heading: str) -> str:
    """提取 ## heading 下的內容（到下一個 ## 為止）"""
    m = re.search(
        rf'##\s*{heading}\s*\n+(.*?)(?=\n##|\Z)',
        content, re.DOTALL
    )
    return m.group(1).strip() if m else ""


def _parse_images(content: str) -> list[ExampleImage]:
    """解析範例圖片，提取路徑和說明"""
    images = []
    # 找所有 ![...](../images/...) 後跟著的 **圖片說明：** 段落
    pattern = re.compile(
        r'!\[([^\]]*)\]\((\.\./images/(\d+)/([^\)]+))\)\s*\n+\*\*圖片說明[：:]\*\*\s*([^\n\!]+)',
        re.DOTALL
    )
    for i, m in enumerate(pattern.finditer(content), start=1):
        rel_path = m.group(2)
        img_id   = m.group(3)
        img_file = m.group(4).strip()
        caption  = m.group(5).strip()
        abs_path = IMAGES_DIR / img_id / img_file
        images.append(ExampleImage(
            path=rel_path,
            abs_path=abs_path,
            caption=caption,
            index=i,
        ))
    # 若說明格式略有不同，嘗試備用 pattern
    if not images:
        imgs = re.findall(r'!\[[^\]]*\]\((\.\./images/\d+/[^\)]+)\)', content)
        captions = re.findall(r'\*\*圖片說明[：:]\*\*\s*([^\n\!]+)', content)
        for i, (rel_path, caption) in enumerate(zip(imgs, captions), start=1):
            parts = rel_path.split('/')
            img_id   = parts[-2] if len(parts) >= 2 else ''
            img_file = parts[-1] if len(parts) >= 1 else ''
            images.append(ExampleImage(
                path=rel_path,
                abs_path=IMAGES_DIR / img_id / img_file,
                caption=caption.strip(),
                index=i,
            ))
    return images


def parse_example_file(path: Path) -> ExampleInfo | None:
    """解析單一範例 md 檔案"""
    try:
        content = path.read_text(encoding='utf-8')
    except Exception:
        return None

    code = path.stem  # 檔名即代碼

    # 推斷等級（從代碼第3字元）
    level_map = {'1': 'A', '2': 'AA', '3': 'AAA'}
    level = level_map.get(code[2] if len(code) > 2 else '1', 'A')

    return ExampleInfo(
        code=code,
        criterion=_extract_field(content, '對應成功準則'),
        level=level,
        category=_extract_field(content, '類別'),
        message=_extract_field(content, '訊息'),
        message_en=_extract_field(content, '英文訊息'),
        rule_desc=_extract_section(content, '規則說明'),
        steps=_extract_section(content, r'(?:稽核步驟|檢測說明)'),
        extra=_extract_section(content, '說明'),
        images=_parse_images(content),
        source_file=path,
    )


class ExampleDB:
    """所有範例碼的資料庫，支援快速查詢"""

    def __init__(self):
        self._cache: dict[str, ExampleInfo] = {}
        self._loaded = False

    def _load_all(self):
        if self._loaded:
            return
        if not EXAMPLES_DIR.exists():
            self._loaded = True
            return
        for md_path in EXAMPLES_DIR.glob("*.md"):
            info = parse_example_file(md_path)
            if info:
                self._cache[info.code] = info
        self._loaded = True

    def get(self, code: str) -> ExampleInfo | None:
        """取得特定代碼的範例資訊"""
        self._load_all()
        return self._cache.get(code)

    def all_codes(self) -> list[str]:
        self._load_all()
        return list(self._cache.keys())

    def by_criterion(self, criterion: str) -> list[ExampleInfo]:
        """取得某成功準則的所有範例"""
        self._load_all()
        return [v for v in self._cache.values() if v.criterion == criterion]


# 全域單例
_db: ExampleDB | None = None

def get_db() -> ExampleDB:
    global _db
    if _db is None:
        _db = ExampleDB()
    return _db
