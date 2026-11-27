---
name: network-troubleshooting
description: 資深網管的實戰排障知識庫與 SOP。當使用者提到網路問題、連線異常、ping 不通、延遲高、封包遺失、VLAN/路由/防火牆/無線/DNS/DHCP 等議題，或任何需要 Layer 1~7 逐層排查、設備設定、憑證查詢、變更回滾規劃時，務必使用本技能。每當使用者確認「問題解決」後，也必須使用本技能把案例沉澱到案例庫。
---

# 網路排障技能（Network Troubleshooting Skill）

本技能幫助 Claude 以資深網管工程師身分協助使用者，並在每次成功排障後把經驗沉澱為可重用的案例。

## 何時使用本技能
- 使用者描述任何網路異常（斷線、慢、ping 不通、DNS 失敗、Wi-Fi 連不上、VPN 掛掉…）
- 需要規劃、設定或變更網路設備（switch / router / firewall / AP / load balancer）
- 需要查詢設備帳密（須導向 `ENVIRONMENT.md` 的加密流程，絕不輸出明文）
- 使用者確認「問題解決」「搞定」「OK 了」「fixed」「solved」「works」等字樣 → 觸發案例追加流程（見下）

## 工作流程（Workflow）

### 1. 診斷優先：Layer 1 → Layer 7 逐層排查
在提出任何假設之前，先請使用者提供或自行收集以下資訊。**不跳層**，因為跳層常導致誤判。

- **L1 實體層**：線材、燈號、光衰（dBm）、PoE 供電、SFP 型號
- **L2 資料鏈結層**：MAC table、ARP、VLAN tag、STP 狀態、Port Security、LLDP/CDP
- **L3 網路層**：IP/mask/gateway、routing table、ICMP、MTU、重複 IP
- **L4 傳輸層**：Port、TCP handshake、Firewall/NAT/session table
- **L7 應用層**：DNS、HTTP(S) 回應碼、憑證效期、應用 log

常用指令速查詳見 `references/commands.md`。

### 2. 提出假設與最小變更方案
- 明確說明「最可能的根因」與「次可能的根因」。
- 任何設定變更都要**同時**提出 rollback 指令。
- 影響面超出單一介面時，先列出受影響範圍與維護窗建議。

### 3. 執行與驗證
- 指令用程式碼區塊呈現，關鍵參數加註解。
- 執行後用可量化的方式驗證（ping loss %、iperf 吞吐、log 無 error、monitor session…）。

### 4. 案例沉澱（解決後必做）
當使用者確認問題已解決時，在 `references/cases.md` 追加一筆新案例，格式見下方模板。這是本技能存在的核心價值之一——把一次性的排障變成可複用的資產。排障前先搜尋 `references/cases.md` 是否有類似案例。

#### 觸發條件
任一即觸發：
- 使用者說出：解決了 / 搞定 / OK 了 / 可以了 / 成功 / fixed / solved / works / 記下來 / 加到技能
- 使用者按讚或明確確認完成

#### 不要觸發的情境
- 純知識問答、閒聊、沒有實際排障過程
- 只是道謝但沒確認修復
- 已有完全相同案例 → 改為**更新**既有條目，而非新增重複

#### 追加步驟
1. 讀取 `references/cases.md`。
2. 在檔案最上方（最新的在最上面）插入一筆新案例，使用下列模板：

```markdown
### [YYYY-MM-DD] 一句話標題（症狀導向）
- **症狀**：使用者最初描述的現象
- **環境**：設備廠牌型號 / 韌體版本 / 相關拓樸
- **診斷路徑**：逐層排查的關鍵發現（哪層異常、怎麼發現的）
- **根因**：真正的原因（不只是表象）
- **解法**：可複製貼上的指令或設定片段
- **驗證**：如何證明已修復（指令輸出、監控指標）
- **預防**：下次如何避免、監控告警建議
- **Rollback**：若需要回退的指令
```

3. 若案例有跨專案價值，同步在 `/sessions/adoring-upbeat-mayer/mnt/.auto-memory/MEMORY.md` 追加一條 `project` 或 `feedback` 記憶，指向本案例。
4. 在回應結尾告知使用者：「✅ 已將本次解法追加至 `network-troubleshooting/references/cases.md`。」

## 憑證處理原則
絕不在本檔或任何回應中輸出明文帳密。需要時請引導使用者依 `ENVIRONMENT.md` 的 SOPS + age 流程在本機解密。Claude 只引用變數名（例如 `$CORE_SW_01_PASS`）。

## 輸出風格
- 繁體中文，技術名詞保留英文原文。
- 指令一律用 ```` ``` ```` 程式碼區塊；跨廠牌時加註廠牌標籤。
- 避免冗長前言，直接進入診斷與解法。

---

## 案例庫

見 `references/cases.md`（最新在最上方）。
