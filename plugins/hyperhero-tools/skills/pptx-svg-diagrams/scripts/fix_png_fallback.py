"""修正 pptxgenjs 在 Node 環境寫入 SVG 時留下的壞 PNG 備援圖。

背景：pptxgenjs 的 addImage({data:"image/svg+xml;base64,..."}) 會在 PPTX 裡放一張 SVG（asvg:svgBlip）
與一張 PNG 備援（a:blip）。在 Node 下沒有 canvas，PNG 備援是空白／損壞的；舊版 Office、
LibreOffice、縮圖與部分檢視器只看 PNG，所以會顯示成空白。本程式把每張 PNG 備援換成由對應 SVG 算出的真 PNG。

另外順便修正 pptxgenjs 的段落 bug：同一段落有多個 run（例如 **重點** 標示切出的 run）時，
pptxgenjs 會在第 2 個以後的 run 前面再寫一個 <a:pPr><a:buNone/></a:pPr>，造成項目符號消失（且不是合法 OOXML）。
這裡把「緊接在 </a:r> 後面的 <a:pPr>」全部移除。

用法：python3 fix_png_fallback.py raw.pptx final.pptx [--scale 1.0]
需要 rsvg-convert（apt install librsvg2-bin）。
"""
import zipfile, re, sys, subprocess, hashlib, os, tempfile, argparse

def main():
    ap = argparse.ArgumentParser(); ap.add_argument("src"); ap.add_argument("dst"); ap.add_argument("--scale", type=float, default=1.0)
    a = ap.parse_args()
    zin = zipfile.ZipFile(a.src); names = zin.namelist(); repl, cache = {}, {}; tmp = tempfile.mkdtemp()
    for n in names:
        if not re.match(r"ppt/slides/slide\d+\.xml$", n): continue
        xml = zin.read(n).decode("utf8")
        rels = zin.read(n.replace("slides/", "slides/_rels/") + ".rels").decode("utf8")
        rmap = dict(re.findall(r'Id="(rId\d+)"[^>]*Target="\.\./media/([^"]+)"', rels))
        rmap.update({b: m for m, b in re.findall(r'Target="\.\./media/([^"]+)"[^>]*Id="(rId\d+)"', rels)})
        for png_id, svg_id in re.findall(r'<a:blip r:embed="(rId\d+)">.*?<asvg:svgBlip [^>]*r:embed="(rId\d+)"', xml, re.S):
            pngf, svgf = "ppt/media/" + rmap[png_id], "ppt/media/" + rmap[svg_id]
            data = zin.read(svgf); h = hashlib.md5(data).hexdigest()
            if h not in cache:
                sp, pp = os.path.join(tmp, h + ".svg"), os.path.join(tmp, h + ".png"); open(sp, "wb").write(data)
                w = int(float(re.search(rb'width="([\d.]+)', data).group(1)))
                subprocess.run(["rsvg-convert", "-w", str(min(2400, max(96, int(w * a.scale)))), sp, "-o", pp], check=True)
                cache[h] = open(pp, "rb").read()
            repl[pngf] = cache[h]
    extra_ppr = re.compile(r"(</a:r>)<a:pPr\b[^>]*?(?:/>|>.*?</a:pPr>)", re.S); fixed = 0
    for n in names:
        if re.match(r"ppt/slides/slide\d+\.xml$", n):
            xml = zin.read(n).decode("utf8"); new, k = extra_ppr.subn(r"\1", xml)
            if k: repl[n] = new.encode("utf8"); fixed += k
    zout = zipfile.ZipFile(a.dst, "w", zipfile.ZIP_DEFLATED)
    for n in names: zout.writestr(zin.getinfo(n), repl.get(n, zin.read(n)))
    zout.close(); print("png fallbacks replaced:", len(cache) and sum(1 for k in repl if k.startswith("ppt/media")), "unique:", len(cache), "| extra pPr removed:", fixed)

if __name__ == "__main__":
    main()
