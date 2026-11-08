import sys; import os; sys.path.insert(0, os.path.join(os.path.dirname(os.path.abspath(__file__)), "..", "scripts")); from svgkit import *
W, H = 1048, 615
b = []
# 頂部：兩種結果通知
b.append(box(20, 10, 420, 76, fill=PAPER, stroke=LINE, sw=3, rx=10))
b.append(text(40, 14, "現場非正式結果", size=24, weight=700, color=INK))
b.append(text(40, 48, "離場時考場人員給紙本", size=22, color=BODY))
b.append(arrow(446, 48, 500, 48, LINE, 4))
b.append(box(508, 10, 520, 76, fill=PAPER, stroke=NAVY, sw=4, rx=10))
b.append(icon("Mail", 548, 48, 34, NAVY))
b.append(text(580, 14, "Email 正式結果", size=24, weight=700, color=NAVY))
b.append(text(580, 48, "(ISC)² 唯一正式通知管道", size=22, color=BODY))
# 分歧菱形
dx, dy_ = 768, 148
b.append(line(dx, 92, dx, dy_ - 32, NAVY, 4))
b.append(poly([(dx, dy_ - 32), (dx + 74, dy_), (dx, dy_ + 32), (dx - 74, dy_)], fill=NAVY, stroke=NAVY))
b.append(text(dx, dy_ - 13, "通過？", size=22, weight=700, color="#FFFFFF", anchor="middle"))
# 左：通過
b.append(elbow([(dx - 76, dy_), (260, dy_), (260, 212)], C[0], 4))
b.append(text(560, dy_ - 40, "通過（不顯示分數）", size=22, weight=700, color=C[0], anchor="end"))
b.append(box(20, 216, 480, 78, fill=TINT[0], stroke=C[0], sw=3, rx=10))
b.append(text(40, 222, "線上背書申請", size=26, weight=700, color=INK))
b.append(pill(214, 222, "9 個月內", C[0], size=22)[0])
b.append(text(40, 258, "以 (ISC)² 帳號申請，準會員亦同", size=22, color=BODY))
b.append(arrow(260, 298, 260, 330, C[0], 4))
for k, (t, s1, s2) in enumerate([("英文履歷", "每個職務附", "可聯絡證明人"), ("背書人簽署", "有效會員；或由", "(ISC)² 代為背書")]):
    x = 20 + k * 248
    b.append(box(x, 334, 232, 118, fill=PAPER, stroke=C[0], sw=3, rx=10))
    b.append(text(x + 116, 342, t, size=24, weight=700, color=INK, anchor="middle"))
    b.append(text(x + 116, 378, s1, size=22, color=BODY, anchor="middle"))
    b.append(text(x + 116, 408, s2, size=22, color=BODY, anchor="middle"))
b.append(arrow(260, 456, 260, 494, C[0], 4))
b.append(box(20, 498, 480, 92, fill=NAVY, stroke=NAVY, sw=3, rx=12))
b.append(icon("Verified", 70, 544, 40, "#FFFFFF"))
b.append(text(110, 510, "取得證照", size=28, weight=700, color="#FFFFFF"))
b.append(text(110, 550, "開始 3 年認證週期", size=22, color="#CFE0F5"))
# 右：未通過
b.append(arrow(dx, dy_ + 34, dx, 212, C[1], 4))
b.append(text(dx + 84, dy_ - 16, "未通過", size=22, weight=700, color=C[1]))
b.append(box(548, 216, 480, 78, fill=TINT[1], stroke=C[1], sw=3, rx=10))
b.append(text(568, 222, "成績單列出", size=26, weight=700, color=INK))
b.append(text(568, 258, "各領域的不足之處", size=22, color=BODY))
b.append(text(568, 320, "重考間隔（距上次應考）", size=24, weight=700, color=INK))
bars = [("第 1 次未過", 30), ("第 2 次未過", 60), ("第 3 次起", 90)]
for k, (lab, d) in enumerate(bars):
    y = 366 + k * 56
    b.append(text(568, y + 6, lab, size=22, color=BODY))
    bw_ = d * 3.2
    b.append(box(712, y, bw_, 40, fill=C[1], stroke=C[1], sw=1, rx=6, shadow=False))
    b.append(text(712 + bw_ - 12, y + 7, f"{d} 天", size=22, weight=700, color="#FFFFFF", anchor="end"))
b.append(text(1028, 548, "12 個月內最多考 4 次", size=24, weight=700, color=C[1], anchor="end"))
save("decision_flow", svg(W, H, b, alt="以 Email 正式結果分歧：通過走背書申請取得證照，未通過依 30、60、90 天間隔重考"),
     layout="side", caption="正式結果以 Email 為準；通過要在 9 個月內完成背書，未過依間隔重考")
