#!/usr/bin/env bash
# 把 PPTX 轉成頁面圖並拼成聯絡表，供目視檢查（或交給獨立的檢查代理）。
# 用法：bash render_qa.sh deck.pptx [輸出目錄=qa] [每張聯絡表頁數=12] [指定頁，如 "56 95 180"]
# 需要：LibreOffice（soffice）、poppler-utils（pdftoppm）、ImageMagick（montage）。
set -euo pipefail
PPTX="$1"; OUT="${2:-qa}"; PER="${3:-12}"; PAGES="${4:-}"
mkdir -p "$OUT/pages"
SOFFICE="${SOFFICE:-soffice}"   # 可設成 "python3 <pptx skill>/scripts/office/soffice.py"
$SOFFICE --headless --convert-to pdf --outdir "$OUT" "$PPTX" >/dev/null 2>&1
PDF="$OUT/$(basename "${PPTX%.*}").pdf"
if [ -n "$PAGES" ]; then
  for p in $PAGES; do pdftoppm -f "$p" -l "$p" -r 60 -jpeg "$PDF" "$OUT/pages/p"; done
else
  pdftoppm -r 40 -jpeg "$PDF" "$OUT/pages/p"
fi
ls "$OUT"/pages/*.jpg | sort -V | xargs -n "$PER" | nl -nln | while read -r i files; do
  montage -label '%f' $files -tile 3x -geometry +6+6 "$OUT/sheet_$(printf %02d "$i").jpg"
done
echo "PDF: $PDF"; ls "$OUT"/sheet_*.jpg
