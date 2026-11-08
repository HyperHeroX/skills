"""檢查 SVG 是否 PowerPoint 相容，並輸出 PNG 預覽（之後務必用眼睛看）。

用法：
    python3 check_svg.py diagrams/deck-03.svg [--width 1048] [--max-height 615] [--min-font 22]
    python3 check_svg.py diagrams/*.svg               # 批次
檢查項目：
  - 禁用語法：filter / marker / url(#…) / gradient / currentColor / <style> / <image> / <animate> / <foreignObject> / <use>
  - 最小字級（預設 22px）
  - 畫布寬度與高度上限（有指定時）；同目錄 <key>.json 的 layout 為 side/full 時自動套 1048/1747 寬
  - 文字座標是否落在畫布外
預覽需要 rsvg-convert（librsvg2-bin）；沒有時改用 cairosvg（pip install cairosvg）。
結束碼：有任何問題 = 1。
"""
import sys, re, json, os, subprocess, argparse, shutil

FORBIDDEN = [r"filter", r"<marker|marker-(start|end|mid)", r"url\(#", r"[Gg]radient", r"currentColor", r"<style",
             r"<image", r"<animate", r"<foreignObject", r"<use\b", r"mask=", r"clip-path"]
LAYOUT_W = {"side": 1048, "full": 1747}

def check(p, width=None, max_h=None, min_font=22):
    s = open(p, encoding="utf-8").read(); errs = []
    for pat in FORBIDDEN:
        if re.search(pat, s): errs.append("禁用語法: " + pat)
    for m in re.finditer(r'font-size="([\d.]+)"', s):
        if float(m.group(1)) < min_font: errs.append(f"字太小: {m.group(1)}px（下限 {min_font}）"); break
    W = float(re.search(r'<svg[^>]*width="([\d.]+)"', s).group(1)); H = float(re.search(r'<svg[^>]*height="([\d.]+)"', s).group(1))
    meta = p[:-4] + ".json"
    if width is None and os.path.exists(meta):
        width = LAYOUT_W.get(json.load(open(meta, encoding="utf-8")).get("layout"))
    if width and abs(W - width) > 2: errs.append(f"寬度應為 {width:.0f}，目前 {W:.0f}")
    if max_h and H > max_h + 2: errs.append(f"高度不可超過 {max_h:.0f}，目前 {H:.0f}")
    for m in re.finditer(r'<text x="([-\d.]+)" y="([-\d.]+)"[^>]*>([^<]*)<', s):
        x, y = float(m.group(1)), float(m.group(2))
        if y > H + 2 or y < 10 or x < -2 or x > W + 2: errs.append(f"文字超出畫布: {m.group(3)[:12]} ({x:.0f},{y:.0f})")
    png = p[:-4] + ".png"; w = str(int(min(W, 1400)))
    if shutil.which("rsvg-convert"):
        subprocess.run(["rsvg-convert", "-b", "white", "-w", w, p, "-o", png], check=True)
    else:
        import cairosvg; cairosvg.svg2png(url=p, write_to=png, output_width=int(w), background_color="white")
    return errs, png

if __name__ == "__main__":
    ap = argparse.ArgumentParser(); ap.add_argument("files", nargs="+")
    ap.add_argument("--width", type=float); ap.add_argument("--max-height", type=float); ap.add_argument("--min-font", type=float, default=22)
    a = ap.parse_args(); bad = 0
    for f in a.files:
        errs, png = check(f, a.width, a.max_height, a.min_font)
        print(("OK   " if not errs else "FAIL ") + f + "  → 預覽 " + png)
        for e in errs[:12]: print("     - " + e)
        bad += bool(errs)
    sys.exit(1 if bad else 0)
