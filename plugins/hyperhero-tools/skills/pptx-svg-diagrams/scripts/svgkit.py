"""svgkit — PowerPoint 相容 SVG 配圖元件（單檔、無外部相依，僅需 Python 3 標準庫）。

用法：
    import sys; sys.path.insert(0, "<skill>/scripts"); from svgkit import *
    W, H = SIDE_W, 615                      # 畫布（px），1 吋 = 144 px，與 16:9 寬版投影片等比
    b = []                                   # 元素清單（字串）
    b.append(box(40, 40, 300, 120, fill=TINT[0], stroke=C[0]))
    b.append(text(190, 70, "金鑰產生", size=28, weight=700, color=INK, anchor="middle"))
    save("deck-03", svg(W, H, b, alt="一句話說明"), layout="side", caption="看圖重點一句話")

設計規則見 ../references/design-tokens.md；PowerPoint 相容規則見 ../references/ppt-safe-svg.md。
輸出目錄：環境變數 SVGKIT_OUT（預設 ./diagrams）。
"""
import math, re, json, html, os

_HERE = os.path.dirname(os.path.abspath(__file__))

# ---------- 設計代號（dataviz 驗證器：亮度帶、彩度、相鄰色 CVD ΔE、對比 全數通過） ----------
C = ["#2468C0", "#D2581F", "#14906A", "#A97800", "#C0427A", "#5B47C4"]       # 類別色：藍、橘、綠、金、桃、紫（固定順序使用）
TINT = ["#DCE8F7", "#FBE3D5", "#D5EFE5", "#F5EACB", "#F7DDE9", "#E4E0F6"]    # 對應淡底
INK = "#12202E"      # 主文字
BODY = "#2A3747"     # 次文字
MUTED = "#4A5664"    # 註解、圖例
NAVY = "#1B2B3F"     # 結構色（主幹、核心、標題列）
LINE = "#5B6775"     # 一般連線
PAPER = "#FFFFFF"
GRID = "#C9D1D9"     # 淡格線、分隔線
HL = "#FFE58A"       # 重點螢光底
FONT = "'Microsoft JhengHei','Noto Sans CJK TC','Noto Sans TC','PingFang TC',sans-serif"

# 畫布尺寸（LAYOUT_WIDE 13.333×7.5 in；1 in = 144 px）
PX = 144
SIDE_W = 1048        # 右側配圖（左邊放條列）：約 7.28 in 寬
FULL_W = 1747        # 全寬配圖（條列在下方兩欄）：約 12.13 in 寬
MIN_FONT = 22        # 圖內最小字級（px）；縮放後投影片上約 11pt 以上

# ---------- 文字 ----------
def esc(s): return html.escape(str(s).replace("**", ""), quote=True)

def _cw(ch, fs):
    o = ord(ch)
    if o > 0x2E80: return fs * 1.0          # CJK 全形
    if ch == " ": return fs * 0.3
    if ch.isupper() or ch.isdigit(): return fs * 0.62
    return fs * 0.53

def tw(s, fs):
    """估計文字寬度（px）。中文 1em、英文大寫/數字 0.62em、小寫 0.53em。"""
    return sum(_cw(c, fs) for c in str(s).replace("**", ""))

def wrap(text_, maxw, fs):
    """中英混排換行：英文單字不拆、中文逐字；超長英文硬切。回傳 list[str]。"""
    text_ = str(text_); lines, cur = [], ""
    for t in re.findall(r"[A-Za-z0-9][A-Za-z0-9\.\-_/+#&%']*|\s|.", text_):
        if t == " " and not cur: continue
        if tw(cur + t, fs) <= maxw: cur += t; continue
        if cur.strip(): lines.append(cur.rstrip())
        cur = "" if t == " " else t
        while tw(cur, fs) > maxw and len(cur) > 1:
            k = len(cur) - 1
            while k > 1 and tw(cur[:k], fs) > maxw: k -= 1
            lines.append(cur[:k]); cur = cur[k:]
    if cur.strip(): lines.append(cur.rstrip())
    return lines or [""]

def fit(text_, maxw, fs, maxlines, minfs=MIN_FONT):
    """先換行，超過 maxlines 就逐級縮字到 minfs。回傳 (lines, fs)。"""
    while True:
        ls = wrap(text_, maxw, fs)
        if len(ls) <= maxlines or fs <= minfs: return ls, fs
        fs -= 1

def label(x, y, text_, size=26, weight=400, color=None, anchor="start", maxw=None, maxlines=3, lh=1.28, minfs=MIN_FONT):
    """多行文字。y = 第一行文字框頂端（不是基線）。回傳 (svg字串, 實際高度)。"""
    color = color or INK
    lines, size = fit(text_, maxw, size, maxlines, minfs) if maxw else ([str(text_)], size)
    s = "".join(f'<text x="{x:.1f}" y="{y + size*0.88 + i*size*lh:.1f}" font-size="{size}" font-weight="{weight}" '
                f'fill="{color}" text-anchor="{anchor}">{esc(t)}</text>' for i, t in enumerate(lines))
    return s, len(lines) * size * lh

def text(x, y, s, **kw): return label(x, y, s, **kw)[0]

def knockout(cx, cy, s, size, pad=7):
    """文字底下的白色圓角襯底（文字壓在線條或弧線上時用），cx,cy = 文字中心。"""
    w = tw(s, size) + pad * 2; h = size * 1.4
    return f'<rect x="{cx - w/2:.1f}" y="{cy - h/2:.1f}" width="{w:.1f}" height="{h:.1f}" rx="6" fill="{PAPER}"/>'

# ---------- 形狀 ----------
def box(x, y, w, h, fill=PAPER, stroke=NAVY, sw=3, rx=14, shadow=True, dash=None):
    """圓角矩形；陰影是向下位移 5px 的 10% 深色矩形（不用 filter）。"""
    d = f' stroke-dasharray="{dash}"' if dash else ""
    sh = f'<rect x="{x:.1f}" y="{y+5:.1f}" width="{w:.1f}" height="{h:.1f}" rx="{rx}" fill="#14253B" fill-opacity="0.10"/>' if shadow else ""
    return sh + f'<rect x="{x:.1f}" y="{y:.1f}" width="{w:.1f}" height="{h:.1f}" rx="{rx}" fill="{fill}" stroke="{stroke}" stroke-width="{sw}"{d}/>'

def circle(cx, cy, r, fill=PAPER, stroke=NAVY, sw=3):
    return f'<circle cx="{cx:.1f}" cy="{cy:.1f}" r="{r:.1f}" fill="{fill}" stroke="{stroke}" stroke-width="{sw}"/>'

def ellipse(cx, cy, rx, ry, fill=PAPER, stroke=NAVY, sw=3):
    return f'<ellipse cx="{cx:.1f}" cy="{cy:.1f}" rx="{rx:.1f}" ry="{ry:.1f}" fill="{fill}" stroke="{stroke}" stroke-width="{sw}"/>'

def poly(points, fill=PAPER, stroke=NAVY, sw=3):
    p = " ".join(f"{x:.1f},{y:.1f}" for x, y in points)
    return f'<polygon points="{p}" fill="{fill}" stroke="{stroke}" stroke-width="{sw}"/>'

def path(d, stroke=LINE, sw=4, fill="none", dash=None):
    dd = f' stroke-dasharray="{dash}"' if dash else ""
    return f'<path d="{d}" fill="{fill}" stroke="{stroke}" stroke-width="{sw}" stroke-linecap="round" stroke-linejoin="round"{dd}/>'

def line(x1, y1, x2, y2, stroke=LINE, sw=4, dash=None):
    dd = f' stroke-dasharray="{dash}"' if dash else ""
    return f'<line x1="{x1:.1f}" y1="{y1:.1f}" x2="{x2:.1f}" y2="{y2:.1f}" stroke="{stroke}" stroke-width="{sw}" stroke-linecap="round"{dd}/>'

def arc(cx, cy, r, a0, a1, stroke=LINE, sw=6):
    """圓弧（角度：度，0° 指向右、順時針）。"""
    p0 = (cx + r * math.cos(math.radians(a0)), cy + r * math.sin(math.radians(a0)))
    p1 = (cx + r * math.cos(math.radians(a1)), cy + r * math.sin(math.radians(a1)))
    large = 1 if abs(a1 - a0) % 360 > 180 else 0; sweep = 1 if a1 > a0 else 0
    return path(f"M{p0[0]:.1f},{p0[1]:.1f} A{r:.1f},{r:.1f} 0 {large} {sweep} {p1[0]:.1f},{p1[1]:.1f}", stroke, sw)

# ---------- 箭頭（全部用多邊形，不用 marker） ----------
def head(x, y, dx, dy, color=LINE, size=16):
    """箭頭尖端位於 (x,y)，方向 (dx,dy)。"""
    L = math.hypot(dx, dy) or 1; ux, uy = dx / L, dy / L
    bx, by = x - ux * size, y - uy * size; px, py = -uy * size * 0.55, ux * size * 0.55
    return f'<polygon points="{x:.1f},{y:.1f} {bx+px:.1f},{by+py:.1f} {bx-px:.1f},{by-py:.1f}" fill="{color}"/>'

def arrow(x1, y1, x2, y2, color=LINE, sw=4, both=False, dash=None, size=None):
    """直線箭頭（尖端在 x2,y2）；both=True 為雙向。"""
    s = size or max(14, sw * 3.4); dx, dy = x2 - x1, y2 - y1; L = math.hypot(dx, dy) or 1
    ex, ey = x2 - dx / L * s * 0.8, y2 - dy / L * s * 0.8
    sx, sy = (x1 + dx / L * s * 0.8, y1 + dy / L * s * 0.8) if both else (x1, y1)
    out = line(sx, sy, ex, ey, color, sw, dash) + head(x2, y2, dx, dy, color, s)
    if both: out += head(x1, y1, -dx, -dy, color, s)
    return out

def curve_arrow(x1, y1, cx, cy, x2, y2, color=LINE, sw=4, dash=None):
    """二次貝茲曲線箭頭（控制點 cx,cy）。"""
    s = max(14, sw * 3.4); tx, ty = x2 - cx, y2 - cy; T = math.hypot(tx, ty) or 1
    ex, ey = x2 - tx / T * s * 0.8, y2 - ty / T * s * 0.8
    return path(f"M{x1:.1f},{y1:.1f} Q{cx:.1f},{cy:.1f} {ex:.1f},{ey:.1f}", color, sw, dash=dash) + head(x2, y2, tx, ty, color, s)

def elbow(points, color=LINE, sw=4, dash=None):
    """折線箭頭：points=[(x,y),...]，最後一段畫箭頭。"""
    d = "M" + " L".join(f"{x:.1f},{y:.1f}" for x, y in points[:-1])
    (ax, ay), (bx, by) = points[-2], points[-1]; s = max(14, sw * 3.4); L = math.hypot(bx-ax, by-ay) or 1
    ex, ey = bx - (bx-ax)/L*s*0.8, by - (by-ay)/L*s*0.8
    return path(d + f" L{ex:.1f},{ey:.1f}", color, sw, dash=dash) + head(bx, by, bx-ax, by-ay, color, s)

# ---------- 圖示（Lucide，ISC 授權；見 icons.json） ----------
ICONS = json.load(open(os.path.join(_HERE, "icons.json"), encoding="utf-8"))
ICON_NAMES = sorted(ICONS.keys())

def icon(name, cx, cy, size, color):
    """線條圖示，中心 (cx,cy)。currentColor 會被換成實際色碼（PowerPoint 不支援 currentColor）。"""
    s = size / 24; inner = ICONS[name].replace("currentColor", color)
    return (f'<g transform="translate({cx - size/2:.1f},{cy - size/2:.1f}) scale({s:.3f})" fill="none" stroke="{color}" '
            f'stroke-width="2" stroke-linecap="round" stroke-linejoin="round">{inner}</g>')

def badge(name, cx, cy, r, color, fg=PAPER):
    """圓形色塊＋白色圖示（含位移陰影）。"""
    return (f'<circle cx="{cx:.1f}" cy="{cy + 3:.1f}" r="{r:.1f}" fill="#14253B" fill-opacity="0.15"/>'
            f'<circle cx="{cx:.1f}" cy="{cy:.1f}" r="{r:.1f}" fill="{color}" stroke="#FFFFFF" stroke-width="3"/>' + icon(name, cx, cy, r * 1.1, fg))

def pill(x, y, text_, color, size=24, fg=PAPER, padx=16):
    """膠囊標籤；回傳 (svg, 寬度)。"""
    w = tw(text_, size) + padx * 2; h = size * 1.6
    s = (f'<rect x="{x:.1f}" y="{y:.1f}" width="{w:.1f}" height="{h:.1f}" rx="{h/2:.1f}" fill="{color}"/>'
         f'<text x="{x + w/2:.1f}" y="{y + h/2 + size*0.35:.1f}" font-size="{size}" font-weight="700" fill="{fg}" text-anchor="middle">{esc(text_)}</text>')
    return s, w

# 依文字自動挑圖示（關鍵字 → 圖示），找不到時輪替 FALLBACK
ICON_RULES = [
    (r"金鑰|密鑰|Key", "Key"), (r"火災|消防|Fire", "Fire"), (r"指紋|生物辨識|Biometric", "Fingerprint"),
    (r"加密|解密|密碼|雜湊|Hash|簽章|憑證|PKI|TLS|VPN|鎖|機密", "Lock"), (r"備份|封存|Archive", "Archive"),
    (r"清除|銷毀|刪除|Purge|Destroy", "Trash"), (r"資料庫|DB|SQL|儲存", "Database"), (r"雲|Cloud|SaaS|PaaS|IaaS", "Cloud"),
    (r"無線|Wi-?Fi", "Wifi"), (r"網路|Internet|路由|TCP|協定|LAN|WAN|DNS|防火牆", "Network"),
    (r"伺服器|主機|Server|機房", "Server"), (r"CPU|處理器|記憶體|硬體|韌體|作業系統", "Cpu"),
    (r"身分|認證|MFA|登入|驗證", "UserCheck"), (r"使用者|人員|員工|角色|團隊|User|客戶", "Users"),
    (r"監控|偵測|IDS|SIEM|Monitor", "Eye"), (r"查詢|分析|調查|掃描|鑑識|搜尋", "Search"),
    (r"稽核|審查|檢查|評估|測試|合規|Audit", "ClipboardCheck"), (r"惡意|病毒|漏洞|Bug|弱點", "Bug"),
    (r"風險|威脅|攻擊|事件|災難|入侵|錯誤", "Warning"), (r"緊急|應變|通報", "Siren"), (r"法律|法規|法院|證據", "Gavel"),
    (r"政策|標準|規範|框架|合約|ISO|NIST", "Book"), (r"文件|紀錄|日誌|Log|報告", "FileText"),
    (r"程式|軟體|開發|Code|API|應用|App", "Code"), (r"修補|維護|修復|工具|Patch", "Wrench"),
    (r"復原|還原|循環|更新|輪調", "RefreshCw"), (r"設定|組態|流程|Config", "Settings"), (r"控制|防護|保護|安全|防禦", "Shield"),
    (r"治理|管理|權衡|責任", "Scale"), (r"時間|週期|期限|排程", "Clock"), (r"信任|合作|供應商|第三方", "Trust"),
    (r"授權|核准|簽署|證照", "Verified"), (r"訓練|教育|學習|課程|考試", "GraduationCap"), (r"目標|任務|策略", "Target"),
    (r"規劃|計畫|設計|原則|概念", "Lightbulb"), (r"分層|層級|階層|分類", "Layers"), (r"連線|連結|整合|SSO", "Link"),
    (r"通訊|訊息|溝通", "Chat"), (r"郵件|Email|E-mail", "Mail"), (r"指標|KPI|量測|成本|統計", "Chart"),
    (r"傳送|傳輸|交付|發送", "PaperPlane"), (r"實體|設施|建築|環境", "Building"), (r"硬碟|磁碟|SSD|媒體", "HardDrive"),
    (r"執行|運作|營運", "Activity"), (r"完成|結束|通過", "Check"),
]
FALLBACK = ["Lightbulb", "Shield", "Target", "Star", "Activity", "Layers", "Settings", "Check"]

def icon_for(text_, i=0):
    for pat, name in ICON_RULES:
        if re.search(pat, str(text_), re.I) and name in ICONS: return name
    return FALLBACK[i % len(FALLBACK)]

# ---------- 輸出 ----------
def svg(W, H, body, alt=""):
    """組成完整 SVG；<title> 會成為替代文字。"""
    if isinstance(body, (list, tuple)): body = "".join(body)
    return (f'<svg xmlns="http://www.w3.org/2000/svg" width="{W:.0f}" height="{H:.0f}" viewBox="0 0 {W:.0f} {H:.0f}" '
            f'font-family="{FONT}"><title>{esc(alt)}</title>{body}</svg>')

def save(key, code, layout="side", caption=None, out=None):
    """寫出 <out>/<key>.svg 與 <key>.json（{"layout","caption"}，供組 PPT 時決定版位）。
    layout：'side'（寬 SIDE_W，圖在右、條列在左）或 'full'（寬 FULL_W，圖全寬、條列在下）。"""
    out = out or os.environ.get("SVGKIT_OUT", "diagrams")
    os.makedirs(out, exist_ok=True)
    p = os.path.join(out, f"{key}.svg")
    open(p, "w", encoding="utf-8").write(code)
    json.dump({"layout": layout, "caption": caption}, open(p[:-4] + ".json", "w", encoding="utf-8"), ensure_ascii=False)
    return p
