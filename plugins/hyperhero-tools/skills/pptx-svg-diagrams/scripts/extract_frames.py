"""從原始影片擷取某時間範圍的畫面，作為重繪配圖的參考（找出講師當時展示的圖）。

用法：
    python3 extract_frames.py <影片檔> <起 mm:ss 或 hh:mm:ss> <迄> [--out ref/] [--step 3] [--max 12]
輸出：<out>/<影片名>_<起>-<迄>/ 下去重後的單張畫面（原解析度）與 sheet.jpg（2 欄聯絡表，左上角標時間）。
之後用 Read 看 sheet.jpg，需要細節再看單張。

做法：ffmpeg 每 step 秒取 1 張（前後各多抓 20/10 秒），以 192×108 灰階平均差 < 1.5 視為同一畫面去重，
超過 --max 張則均勻抽樣。需要 ffmpeg 與 Pillow。
"""
import sys, os, re, subprocess, argparse, tempfile, glob
from PIL import Image, ImageChops, ImageStat, ImageDraw, ImageFont

def sec(t):
    p = [int(x) for x in t.split(":")]
    return p[0] * 60 + p[1] if len(p) == 2 else p[0] * 3600 + p[1] * 60 + p[2]

def main():
    ap = argparse.ArgumentParser(); ap.add_argument("video"); ap.add_argument("t0"); ap.add_argument("t1")
    ap.add_argument("--out", default="ref"); ap.add_argument("--step", type=float, default=3); ap.add_argument("--max", type=int, default=12)
    a = ap.parse_args()
    s0, s1 = max(0, sec(a.t0) - 20), sec(a.t1) + 10
    base = os.path.splitext(os.path.basename(a.video))[0]
    out = os.path.join(a.out, f"{base}_{a.t0.replace(':','')}-{a.t1.replace(':','')}"); os.makedirs(out, exist_ok=True)
    tmp = tempfile.mkdtemp()
    subprocess.run(["ffmpeg", "-v", "error", "-ss", str(s0), "-to", str(s1), "-i", a.video,
                    "-vf", f"fps=1/{a.step}", "-q:v", "3", os.path.join(tmp, "f_%05d.jpg")], check=True)
    kept, prev = [], None
    for i, f in enumerate(sorted(glob.glob(os.path.join(tmp, "f_*.jpg")))):
        t = int(s0 + i * a.step); im = Image.open(f).convert("RGB"); sm = im.convert("L").resize((192, 108))
        if prev is not None and ImageStat.Stat(ImageChops.difference(sm, prev)).mean[0] < 1.5: continue
        prev = sm; p = os.path.join(out, f"{t//60:02d}m{t%60:02d}s.jpg"); im.save(p, quality=88); kept.append((t, p, im))
    if len(kept) > a.max:
        step = len(kept) / a.max; kept = [kept[int(i * step)] for i in range(a.max)]
    if kept:
        W, H, cols = 960, 540, 2; rows = (len(kept) + 1) // 2
        sh = Image.new("RGB", (W * cols, H * rows), "white"); d = ImageDraw.Draw(sh)
        try: f = ImageFont.truetype("DejaVuSans-Bold.ttf", 26)
        except Exception: f = ImageFont.load_default()
        for i, (t, p, im) in enumerate(kept):
            x, y = (i % cols) * W, (i // cols) * H; sh.paste(im.resize((W, H)), (x, y))
            d.rectangle([x, y, x + 100, y + 36], fill="black"); d.text((x + 8, y + 4), f"{t//60:02d}:{t%60:02d}", fill="yellow", font=f)
        sh.save(os.path.join(out, "sheet.jpg"), quality=82)
    print("frames:", len(kept)); print("sheet:", os.path.join(out, "sheet.jpg") if kept else "none")
    for t, p, _ in kept: print(p)

if __name__ == "__main__":
    main()
