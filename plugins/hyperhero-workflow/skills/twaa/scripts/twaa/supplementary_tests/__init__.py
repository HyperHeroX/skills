"""supplementary_tests — 補充靜態檢查模組（非官方 C 碼編號）。

目的：補強官方 110.07 規範中標記「相關檢測碼:(無)」的成功準則，
為這些準則提供額外的靜態檢查能力。

**重要區分：**
- `c_code_tests/`     — 官方 MODA C 碼（HM/CS/ME 前綴）— 標章審查依據
- `supplementary_tests/` — 補充 WCAG 靜態檢查（WCAG-x.y.z 命名）— 開發階段協助

依「一碼一檔」原則：每個 informal 規則一個獨立模組。
"""
