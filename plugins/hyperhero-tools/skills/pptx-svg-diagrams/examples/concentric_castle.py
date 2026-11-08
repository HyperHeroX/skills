import sys, math; import os; sys.path.insert(0, os.path.join(os.path.dirname(os.path.abspath(__file__)), "..", "scripts")); from svgkit import *
W, H = 1048, 615
cx, cy = 900, 318
layers = ["實體邊界", "邊界網路", "區域網路", "主機", "應用程式"]
roles = ["對外人員流程", "內部使用者", "開發人員", "系統管理員", None]
ctrls = ["設施安全", "Web 應用", "受信任 LAN", "更新流程", "受信任軟體"]
cols = [C[0], C[2], C[5], C[3], C[1]]
R = [830, 700, 575, 455, 340]; half = 228
b = []
for i, r in enumerate(R):
    a = math.asin(min(0.99, half / r))
    x1, y1 = cx - r * math.cos(a), cy - r * math.sin(a); x2, y2 = cx - r * math.cos(a), cy + r * math.sin(a)
    b.append(path(f"M{x1:.1f},{y1:.1f} A{r},{r} 0 0 0 {x2:.1f},{y2:.1f}", cols[i], 10))
    # 角色（上）與控制（下）
    if roles[i]: b.append(text(x1, y1 - 40, roles[i], size=22, weight=700, color=cols[i], anchor="middle"))
    b.append(text(x2, y2 + 10, ctrls[i], size=22, weight=700, color=cols[i], anchor="middle"))
# 層名：放在中線、兩弧之間
for i in range(len(R)):
    rin = R[i + 1] if i + 1 < len(R) else 230
    x = cx - (R[i] + rin) / 2 - 6
    wl = tw(layers[i], 24) + 14
    b.append(f'<rect x="{x - wl/2:.1f}" y="{cy - 20:.1f}" width="{wl:.1f}" height="34" rx="6" fill="#FFFFFF"/>')
    b.append(text(x, cy - 16, layers[i], size=24, weight=700, color=INK, anchor="middle"))
# 資料核心
b.append(circle(cx - 120, cy, 92, fill=NAVY, stroke=NAVY))
b.append(icon("Database", cx - 120, cy - 26, 44, "#FFFFFF"))
b.append(text(cx - 120, cy + 6, "資料", size=30, weight=700, color="#FFFFFF", anchor="middle"))
b.append(text(cx - 120, cy + 40, "Data", size=22, weight=400, color="#CFE0F5", anchor="middle"))
# 攻擊者方向
b.append(arrow(14, cy + 80, 66, cy + 80, LINE, 4))
b.append(text(12, cy + 96, "攻擊", size=22, color=MUTED))
# 圖例
b.append(text(W - 6, 6, "上：角色　中：分層　下：控制", size=22, color=MUTED, anchor="end"))
save("concentric_castle", svg(W, H, b, alt="縱深防禦：由外而內五道防線包圍核心資料"), layout="side",
     caption="由外而內每一層都有對應的角色與控制，攻擊者要穿過所有層才碰得到資料")
