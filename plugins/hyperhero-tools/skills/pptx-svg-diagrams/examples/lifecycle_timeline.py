import sys; import os; sys.path.insert(0, os.path.join(os.path.dirname(os.path.abspath(__file__)), "..", "scripts")); from svgkit import *
W, H = 1747, 430
b = []
ty = 150
n = 6; x0, x1 = 150, W - 170
xs = [x0 + (x1 - x0) * i / (n - 1) for i in range(n)]
st = [("產生", ["確保隨機與", "足夠金鑰空間"], "Key"), ("儲存", ["硬體保護、", "加密或分割"], "HardDrive"),
      ("分發", ["頻外傳遞或", "Key Wrapping"], "PaperPlane"), ("變更", ["依使用期限", "更換金鑰"], "RefreshCw"),
      ("回復", ["金鑰遺失時", "從備份還原"], "Archive"), ("處置銷毀", ["生命週期結束", "安全清除"], "Trash")]
b.append(line(xs[0] - 60, ty, xs[-1] + 70, ty, NAVY, 10))
b.append(head(xs[-1] + 110, ty, 1, 0, NAVY, 34))
for i in range(n - 1):
    m = (xs[i] + xs[i + 1]) / 2
    b.append(head(m + 14, ty, 1, 0, NAVY, 24))
cw = (x1 - x0) / (n - 1) - 24
for i, (x, (nm, sub, ic)) in enumerate(zip(xs, st)):
    b.append(text(x, ty - 112, nm, size=34, weight=700, color=C[i % 6], anchor="middle"))
    b.append(circle(x, ty, 48, fill=C[i % 6], stroke=PAPER, sw=6))
    b.append(icon(ic, x, ty, 46, "#FFFFFF"))
    b.append(box(x - cw / 2, ty + 74, cw, 140, fill=TINT[i % 6], stroke=C[i % 6], sw=3, rx=14))
    for j, s in enumerate(sub):
        b.append(text(x, ty + 104 + j * 40, s, size=28, color=INK, anchor="middle"))
save("lifecycle_timeline", svg(W, H, b, alt="金鑰管理生命週期六階段：產生、儲存、分發、變更、回復、處置銷毀"), layout="full",
     caption="金鑰從產生到銷毀共六站，每一站都要依標準管理，安全關鍵就在金鑰")
