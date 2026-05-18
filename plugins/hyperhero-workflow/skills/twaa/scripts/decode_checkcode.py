#!/usr/bin/env python3
"""decode_checkcode.py — 自動解碼任何 TWAA 檢測碼/稽核評量碼

無需查規範文件，根據碼的格式直接解析出：
  - 網頁科技
  - 等級（A/AA/AAA）
  - 對應成功準則
  - 類型（自動/人工）
  - 流水號

使用方式：
  python decode_checkcode.py GN1240100E
  python decode_checkcode.py HM1240402E CS2140401C GN2330300E
"""
import sys
import io
import re

sys.stdout = io.TextIOWrapper(sys.stdout.buffer, encoding="utf-8", errors="replace")

TECH_PREFIX = {
    "AR": "ARIA",
    "SC": "Client-side Scripting（JavaScript）",
    "CS": "CSS",
    "FA": "Common Failure（常見失敗樣式）",
    "FL": "Flash",
    "GN": "General（通用）",
    "HM": "HTML",
    "ME": "Media（媒體）",
    "PD": "PDF",
    "SV": "Server-side Scripting",
    "SL": "Silverlight",
    "SM": "SMIL",
    "TX": "Plain text",
}

LEVEL_MAP = {"1": "A", "2": "AA", "3": "AAA"}

PRINCIPLE_MAP = {
    "1": "感知性（Perceivable）",
    "2": "可操作性（Operable）",
    "3": "可理解性（Understandable）",
    "4": "健壯性（Robust）",
}

GUIDELINE_MAP = {
    "11": "1.1 替代文字",
    "12": "1.2 時序媒體",
    "13": "1.3 可調適",
    "14": "1.4 可辨識",
    "21": "2.1 鍵盤可操作",
    "22": "2.2 充足時間",
    "23": "2.3 預防痙攣",
    "24": "2.4 可導覽",
    "25": "2.5 輸入方式",
    "31": "3.1 可讀性",
    "32": "3.2 可預期性",
    "33": "3.3 輸入協助",
    "41": "4.1 相容性",
}

SUCCESS_CRITERION_MAP = {
    "1101": "1.1.1 非文字內容",
    "1201": "1.2.1 純音訊與純視訊",
    "1202": "1.2.2 字幕（預錄）",
    "1203": "1.2.3 音訊描述或替代媒體",
    "1204": "1.2.4 字幕（現場直播）",
    "1205": "1.2.5 音訊描述（預錄）",
    "1301": "1.3.1 資訊與關連性",
    "1302": "1.3.2 有意義的序列",
    "1303": "1.3.3 知覺特徵",
    "1304": "1.3.4 螢幕方向",
    "1305": "1.3.5 識別輸入目的",
    "1401": "1.4.1 色彩使用",
    "1402": "1.4.2 音訊控制",
    "1403": "1.4.3 對比值（最小）",
    "1404": "1.4.4 調整文字尺寸",
    "1405": "1.4.5 影像文字",
    "1406": "1.4.6 對比值（增強）",
    "1407": "1.4.7 低或無背景音訊",
    "1408": "1.4.8 視覺呈現",
    "1409": "1.4.9 影像文字（無例外）",
    "1410": "1.4.10 流動排版",
    "1411": "1.4.11 非文字對比",
    "1412": "1.4.12 文字間距",
    "1413": "1.4.13 懸浮或焦點內容",
    "2101": "2.1.1 鍵盤",
    "2102": "2.1.2 無鍵盤操作陷阱",
    "2103": "2.1.3 鍵盤（無例外）",
    "2104": "2.1.4 快捷鍵",
    "2201": "2.2.1 計時調整",
    "2202": "2.2.2 暫停、停止和隱藏",
    "2203": "2.2.3 無計時",
    "2204": "2.2.4 中斷",
    "2205": "2.2.5 重新驗證",
    "2206": "2.2.6 逾時",
    "2301": "2.3.1 閃爍三次或低於閾值",
    "2302": "2.3.2 三次閃爍",
    "2303": "2.3.3 動畫互動",
    "2401": "2.4.1 跳過區塊",
    "2402": "2.4.2 網頁標題",
    "2403": "2.4.3 焦點順序",
    "2404": "2.4.4 鏈結目的（脈絡）",
    "2405": "2.4.5 多種方式",
    "2406": "2.4.6 標題和標籤",
    "2407": "2.4.7 焦點可視",
    "2408": "2.4.8 位置",
    "2409": "2.4.9 鏈結目的（純鏈結）",
    "2410": "2.4.10 區段標頭",
    "2411": "2.4.11 焦點不被遮蔽（最小）",
    "2412": "2.4.12 焦點不被遮蔽（增強）",
    "2413": "2.4.13 焦點外觀",
    "2501": "2.5.1 指標手勢",
    "2502": "2.5.2 指標取消",
    "2503": "2.5.3 標籤名稱",
    "2504": "2.5.4 動作啟動",
    "2505": "2.5.5 目標尺寸（增強）",
    "2506": "2.5.6 並用輸入機制",
    "3101": "3.1.1 網頁語言",
    "3102": "3.1.2 局部語言",
    "3103": "3.1.3 不常見字詞",
    "3104": "3.1.4 縮寫",
    "3105": "3.1.5 閱讀程度",
    "3106": "3.1.6 發音",
    "3201": "3.2.1 焦點",
    "3202": "3.2.2 輸入",
    "3203": "3.2.3 一致的導覽",
    "3204": "3.2.4 一致的識別",
    "3205": "3.2.5 依要求變更",
    "3206": "3.2.6 一致的求救",
    "3301": "3.3.1 識別錯誤",
    "3302": "3.3.2 標籤或說明",
    "3303": "3.3.3 錯誤建議",
    "3304": "3.3.4 錯誤預防（法律、財務、個人資料）",
    "3305": "3.3.5 說明",
    "3306": "3.3.6 錯誤預防（全部）",
    "3307": "3.3.7 重複輸入",
    "3308": "3.3.8 認證可訪問（最小）",
    "3309": "3.3.9 認證可訪問（增強）",
    "4101": "4.1.1 語法分析",
    "4102": "4.1.2 名稱、角色和值",
    "4103": "4.1.3 狀態訊息",
}


def decode(code: str) -> dict:
    """解析單一檢測碼，回傳解析結果 dict。"""
    code = code.strip().upper()
    pattern = re.compile(r"^([A-Z]{2})(\d)(\d{4})(\d{2})([CE])$")
    m = pattern.match(code)
    if not m:
        return {"code": code, "error": "格式不符（應為 XX1234567C 或 E 共 10 碼）"}

    tech_prefix, level_digit, criteria_digits, seq, code_type = m.groups()

    # 成功準則解析（criteria_digits = XYZZ，XY=指引，ZZ=準則流水）
    principle = criteria_digits[0]
    guideline = criteria_digits[1]
    criterion_num = criteria_digits[2:]  # 2碼，01-99
    # 去除前導零用於 key 查詢
    criterion_int = int(criterion_num)
    # 建立查詢 key：原則+指引+準則（4碼，ZZ 為原始2碼）
    key = f"{principle}{guideline}{criterion_num}"
    key_nopad = f"{principle}{guideline}{criterion_int}"  # 不補零版
    criterion_name = (
        SUCCESS_CRITERION_MAP.get(key)
        or SUCCESS_CRITERION_MAP.get(key_nopad)
        or f"{principle}.{guideline}.{criterion_int}"
    )

    guideline_key = f"{principle}{guideline}"
    guideline_name = GUIDELINE_MAP.get(guideline_key, f"指引 {principle}.{guideline}")

    return {
        "code": code,
        "tech": TECH_PREFIX.get(tech_prefix, tech_prefix),
        "tech_prefix": tech_prefix,
        "level": LEVEL_MAP.get(level_digit, f"未知（{level_digit}）"),
        "principle": PRINCIPLE_MAP.get(principle, f"原則 {principle}"),
        "guideline": guideline_name,
        "success_criterion": criterion_name,
        "sequence": int(seq),
        "type": "🤖 自動檢測（C）" if code_type == "C" else "👤 人工稽核（E）",
        "in_taiwan_spec": None,  # 由呼叫端填入
    }


def print_decode(code: str, check_spec: bool = True) -> None:
    result = decode(code)
    if "error" in result:
        print(f"❌ {code}: {result['error']}")
        return

    # 選擇性查 taiwan-spec.md
    in_spec = "（未查詢）"
    if check_spec:
        try:
            from pathlib import Path
            spec = Path(__file__).parent.parent / "references" / "taiwan-spec.md"
            if spec.exists():
                in_spec = "✅ 在規範文件中" if code in spec.read_text(encoding="utf-8") else "⚠ 不在 taiwan-spec.md（指引 2.x/3.x/4.x 尚未收錄）"
        except Exception:
            in_spec = "（無法查詢）"

    print(f"""
{'─'*55}
代碼：{result['code']}
網頁科技：{result['tech']}（前綴 {result['tech_prefix']}）
等級：{result['level']}
原則：{result['principle']}
指引：{result['guideline']}
成功準則：{result['success_criterion']}
流水號：第 {result['sequence']:02d} 個
類型：{result['type']}
規範文件：{in_spec}""")


def main() -> None:
    args = sys.argv[1:]
    if not args:
        print(__doc__)
        sys.exit(0)

    for code in args:
        print_decode(code)
    print()


if __name__ == "__main__":
    main()
