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
當使用者確認問題已解決時，**必須**在 `## 案例庫` 區段追加一筆新案例，格式見下方模板。這是本技能存在的核心價值之一——把一次性的排障變成可複用的資產。

#### 觸發條件
任一即觸發：
- 使用者說出：解決了 / 搞定 / OK 了 / 可以了 / 成功 / fixed / solved / works / 記下來 / 加到技能
- 使用者按讚或明確確認完成

#### 不要觸發的情境
- 純知識問答、閒聊、沒有實際排障過程
- 只是道謝但沒確認修復
- 已有完全相同案例 → 改為**更新**既有條目，而非新增重複

#### 追加步驟
1. 讀取本檔的 `## 案例庫` 區段。
2. 在最上方（最新的在最上面）插入一筆新案例，使用下列模板：

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
4. 在回應結尾告知使用者：「✅ 已將本次解法追加至 `skills/network-troubleshooting/SKILL.md` 的案例庫。」

## 憑證處理原則
絕不在本檔或任何回應中輸出明文帳密。需要時請引導使用者依 `ENVIRONMENT.md` 的 SOPS + age 流程在本機解密。Claude 只引用變數名（例如 `$CORE_SW_01_PASS`）。

## 輸出風格
- 繁體中文，技術名詞保留英文原文。
- 指令一律用 ```` ``` ```` 程式碼區塊；跨廠牌時加註廠牌標籤。
- 避免冗長前言，直接進入診斷與解法。

---

## 案例庫

> 新案例追加於本行之下，保持「最新在最上方」。

<!-- 新案例請追加於本行之下，最新的在最上面 -->

### [2026-09-21] 家裡經中科 IPsec 訪問外部伺服器（國網中心 140.110.111.200）導通與雙向 SNAT 鏈路配置 ✅ 已驗證結案

- **症狀**：使用者需要從家裡內網（`192.168.160.0/24`）連線外部目標主機 `140.110.111.200`（國網中心 NCHC），要求連線必須經由 IPsec 隧道送到中科防火牆（`FGT60D4613060193`），再由中科對外訪問 `140.110.111.200`，且家裡電腦必須能正常接收對端的回應。
- **環境**：
  - 家裡防火牆：FortiGate-50E（v6.2.15，LAN `192.168.160.0/24`，Gateway `192.168.160.253`，WAN PPPoE `220.134.69.55`）。
  - 中科防火牆：FortiGate-60D（v6.0.17，LAN `192.168.1.0/24`，Gateway `192.168.1.99`，WAN PPPoE `59.126.84.186`）。
  - IPsec S2S 隧道：`中科` ↔ `ToHiro`。
  - 對端目標：`140.110.111.200`（已於該伺服器放行中科對外 IP `59.126.84.186` 白名單）。
- **診斷路徑**：
  1. **L3 路由排查**：在家裡防火牆執行 `get router info routing-table details 140.110.111.200`，發現僅命中預設路由 `0.0.0.0/0 via ppp1`（直出家裡 WAN，未導向 IPsec 隧道）。
  2. **IPsec SA 選擇器排查**：檢查 `diagnose vpn tunnel list`，家裡側 Phase 2 目的地選擇器（`中科_remote`）只包含 `192.168.1.0/24`、`150.129.38.38`、`163.29.199.87`、`163.29.199.81`、`192.168.10.0/24`，未宣告 `140.110.111.200`。
  3. **L4 安全政策排查**：家裡往中科方向的 Policy 11 未放行該 IP；中科雖有全開的 Policy 4，但缺少專屬且優先的轉發規則。
- **根因**：
  - 家裡防火牆缺少將 `140.110.111.200` 導向 VPN 隧道的靜態路由與安全政策。
  - 家裡防火牆 IPsec Phase 2 Selector（`中科_remote` 位址群組）未納入該目標 IP，導致 IPsec SA 不會對該流量進行加密封裝。
  - 中科防火牆缺少明確針對該目標主機的 Outbound SNAT 策略。
- **解法**：
  1. **變更前強制備份**：
     - 中科備份：`backups/20260921_zhongke_fgt_pre_nchc_140.110.111.200.conf`
     - 家裡備份：`backups/20260921_home_fgt_pre_nchc_140.110.111.200.conf`
  2. **中科防火牆（192.168.1.99）配置**：
     ```fortios
     config firewall address
         edit "NCHC_140.110.111.200"
             set subnet 140.110.111.200 255.255.255.255
             set comment "National Center for High-performance Computing (NCHC)"
         next
     end

     config firewall policy
         edit 0
             set name "VPN_WAN_NCHC"
             set srcintf "ToHiro"
             set dstintf "wan1"
             set srcaddr "ToHiro_remote_subnet_1"
             set dstaddr "NCHC_140.110.111.200"
             set action accept
             set schedule "always"
             set service "ALL"
             set nat enable
             set comments "Hiro to NCHC 140.110.111.200 via Zhongke WAN SNAT"
         next
     end
     # 將新政策前移至全開政策 Policy 4 之前
     config firewall policy
         move 16 before 4
     end
     ```
  3. **家裡防火牆（192.168.160.253）配置**：
     ```fortios
     config firewall address
         edit "NCHC_140.110.111.200"
             set subnet 140.110.111.200 255.255.255.255
             set allow-routing enable
             set comment "National Center for High-performance Computing (NCHC)"
         next
     end

     config firewall addrgrp
         edit "中科_remote"
             append member "NCHC_140.110.111.200"
         next
     end

     config router static
         edit 0
             set dst 140.110.111.200 255.255.255.255
             set device "中科"
             set comment "Route to NCHC 140.110.111.200 via Zhongke VPN"
         next
     end

     config firewall policy
         edit 11
             append dstaddr "NCHC_140.110.111.200"
         next
     end
     ```
  4. **刷新重協商 IPsec SA**：
     ```fortios
     diagnose vpn tunnel flush name 中科
     ```
- **驗證**：
  1. 路由表確認：家裡 `get router info routing-table details 140.110.111.200` 顯示 `distance 10, directly connected, 中科`。
  2. IPsec SA 選擇器確認：`diagnose vpn tunnel list` 顯示 `dst: ... 0:140.110.111.200/255.255.255.255:0` 已成功納入 SA。
  3. 路由躍點驗證：`tracert -d 140.110.111.200` 顯示第 1 跳 `192.168.160.253`（家裡）➔ 第 2 跳 `10.10.10.1`（中科 FortiGate）➔ 第 3 跳 `168.95.98.254`（中科中華電信 WAN 閘道）。
  4. 雙邊封包嗅探追蹤（`diagnose sniffer packet any 'host 140.110.111.200' 4`）：
     - 家裡 LAN 收到 PC SYN ➔ 由 `中科` 介面加密送出。
     - 中科收到 SYN ➔ SNAT 轉譯為 `59.126.84.186` 經 `ppp1`（wan1）送出。
     - 對端 `140.110.111.200` 正常回覆 `SYN-ACK` 給中科 WAN IP。
     - 中科執行反向 NAT ➔ 經 `ToHiro` 送入隧道 ➔ 家裡收到後送達電腦。
  5. 傳輸層實測：`Test-NetConnection -ComputerName 140.110.111.200 -Port 80` 回傳 `TcpTestSucceeded : True`。
- **預防**：
  - 凡是「跨站 S2S VPN 借道出海／存取專用外網主機」需求，必須檢查三位一體：
    1. 來源端：Static Route + Phase 2 Selector（addrgrp）+ LAN->VPN Policy。
    2. 中繼端：Phase 2 Selector + VPN->WAN Policy（含 `nat enable` SNAT）。
    3. 目標端：確認已放行中繼端對外 IP 白名單。
- **Rollback**：
  - 家裡端：從 `中科_remote` 移除物件，刪除該 static route 與 policy 11 引用；刷新隧道。
  - 中科端：`DELETE /api/v2/cmdb/firewall/policy/16`。

### [2026-09-04] Orca 遠端連線 4001 Unauthorized（服務重啟後動態 Token 變更）✅ 已驗證結案

- **症狀**：客戶端連線至遠端 VM（`Ubuntu24-Dev` / `192.168.10.20:6768` 經隧道）時連線失敗，錯誤提示：`Remote Orca runtime closed the connection (4001: Unauthorized)`。
- **環境**：Ubuntu 24.04（Hyper-V VM on SRV2019）、Orca Server（`orca-serve.service`，監聽 `ws://0.0.0.0:6768`）、本地 Windows 工作機（常駐隧道 `192.168.160.110:6768` -> `192.168.10.20:6768`）。
- **診斷路徑**：
  1. 測試本地到 VM 隧道連接埠：`Test-NetConnection -ComputerName 192.168.160.110 -Port 6768` → `TcpTestSucceeded : True`（L4 網路隧道正常）。
  2. 檢查 VM 端 systemd 服務日誌：`ssh ubuntu-dev "journalctl -u orca-serve -n 50"`。
  3. 發現 `orca-serve.service` 曾發生過重啟，並在啟動時輸出了全新的 `deviceToken`、`pairedDeviceId` 與 `Pairing URL`。
  4. 比對本地 `orca-environments.json` 與 VM 上最新的憑證，確認本地仍持舊 Token 導致 WebSocket 握手鑑權失敗（4001: Unauthorized）。
- **根因**：Orca Server 採用 Ephemeral / Session-based 動態配對機制。每次進程啟動或重啟時，皆會生成新隨機 Token；Client 端若未更新 Token 便無法通過認證。
- **解法**：
  ```bash
  # 1. 取得 VM 端最新 Pairing 資訊
  ssh ubuntu-dev "journalctl -u orca-serve -n 25 --no-pager | grep -E 'Pairing URL|Web client URL'"
  ```
  ```powershell
  # 2. 在本地工作機 PowerShell 自動更新 orca-environments.json（無 BOM UTF-8）
  $pairUrl = & "C:\Program Files\Git\usr\bin\ssh.exe" ubuntu-dev "journalctl -u orca-serve -n 30 --no-pager | grep 'Pairing URL:' | tail -n 1"
  if ($pairUrl -match 'code=([A-Za-z0-9_-]+)') {
      $b64 = $matches[1].Replace('-','+').Replace('_','/')
      while ($b64.Length % 4) { $b64 += '=' }
      $payload = [System.Text.Encoding]::UTF8.GetString([System.Convert]::FromBase64String($b64)) | ConvertFrom-Json
      $envPath = "$env:APPDATA\orca\orca-environments.json"
      $envJson = Get-Content $envPath -Raw | ConvertFrom-Json
      $target = $envJson.environments | Where-Object { $_.name -eq 'Dev' -or $_.endpoints[0].endpoint -like '*6768*' }
      if ($target) {
          $target.runtimeId = $null
          $target.pairedDeviceId = $payload.pairedDeviceId
          $target.endpoints[0].deviceToken = $payload.deviceToken
          $jsonStr = $envJson | ConvertTo-Json -Depth 10 -Compress
          [System.IO.File]::WriteAllText($envPath, $jsonStr, (New-Object System.Text.UTF8Encoding($false)))
          Write-Host "✅ Orca 本地 Dev 環境 Token 已更新完成！請重啟 Orca 桌面 App。" -ForegroundColor Green
      }
  }
  ```
  3. 或直接在瀏覽器點擊帶有 `#pairing=` 的 Web client 網址完成配對。
- **驗證**：本地 `orca-environments.json` 之 Token 與 VM `orca-devices.json` 一致，重啟 Orca Client 或點擊 Web 端點連線正常。
- **預防**：詳見 `docs/Ubuntu24-Dev.md`「Orca 重新配對指令」章節；若 VM 服務重啟，使用上述指令或一鍵腳本同步即可。
- **Rollback**：還原 `orca-environments.json.bak`。

### [2026-05-18] Docker 主力伺服器遷移全紀錄：.113 → .116 → IP 事故 → .120（經驗總結與改進項目）✅ 已驗證結案

> 本案例為跨越多天、多個子事故的完整遷移紀錄，目的是把所有教訓沉澱成下次遷移的 Checklist，避免重蹈覆轍。

---

#### 時間軸

| 日期 | 事件 | 結果 |
|------|------|------|
| 2026-05-08 | .113 持續不穩，決定遷移至 .116 | 服務全數遷移，外部可達 |
| 2026-05-09 | Dokploy、InfoLink CI/CD 部署 | 成功，runner 自動觸發部署 |
| 2026-05-16 | Hermes Agent、Open WebUI 部署 | 成功 |
| 2026-05-17 早 | MSI 機器搶佔 .116 靜態 IP → 伺服器 DHCP 取得 .117 | NFS 掛載失敗（ASUSTOR 白名單未含 .117），NPM DB 遺失，全站中斷 |
| 2026-05-17 中 | 緊急搶修（foryou.tw、NFS、容器重啟） | 全站恢復，但期間有誤判處置 |
| 2026-05-17 晚 | 決定將伺服器 IP 固定為 .120，全面更新 FortiGate 設定 | .120 正式啟用 |
| 2026-05-18 | Nextcloud bind mount + NFS 時序問題修復 | nc.iexam.win 恢復，WebDAV 207 |

---

#### 根因分析（依嚴重度排序）

**🔴 P0：DHCP 靜態 IP 被搶占（IP Drift 事故）**
- .116 使用 DHCP 保留（FortiGate），但 MSI 機器手動設定 192.168.160.116 靜態 IP 搶先佔用
- ASUSTOR NAS 的 NFS 白名單只允許特定 IP，.117 不在白名單內 → NFS 掛載全部失敗
- NPM 因 NFS 失效以空本地 DB 啟動 → 所有 proxy host 記錄消失

**🟠 P1：Docker container 在 NFS 掛載前啟動（bind mount 時序問題）**
- Nextcloud container 在 NFS 完成掛載前啟動，Docker entrypoint 寫了最小化 config.php 到本機空路徑
- NFS 後掛但 container inode 已鎖本機目錄，導致 container 永遠看不到 NAS 資料
- 表象與根因嚴重背離（掛載看起來正常，問題在 container 啟動時序）

**🟠 P1：NFS 掛載的 fstab 設定缺少 systemd 時序控制**
- 原始 fstab：`defaults,_netdev,nofail`，沒有 `x-systemd.mount-timeout=30`
- 開機時 docker.service 可能在 NFS 完成掛載前就啟動，導致隨機性失敗

**🟡 P2：誤判根因（foryou.tw WordPress 主題遺失）**
- NFS 未掛載時 /mnt/docker 指向本機空目錄，WordPress 只看到 akismet+hello.php
- 誤以為資料遺失，直接改 DB 中的 active_theme / active_plugins → 錯誤處置
- 正確做法：先確認 NFS 掛載狀態再判斷資料是否真的遺失

**🟡 P2：ASUSTOR NAS NFS 白名單太嚴格，缺少變更流程**
- IP 變更後需要手動去 ASUSTOR ADM 更新 NFS 白名單，否則新 IP 無法掛載
- 沒有自動更新機制，IP 發生變化時容易遺漏

**🟡 P2：Nextcloud config.php 缺少 `version` key（升級後殘留問題）**
- 遷移至 .120 重啟後，container 讀到本機版本的 config.php，缺 `version` key
- `occ upgrade` 視為從 0.0.0 升級 → "multiple major versions" 錯誤
- 缺 `.ncdata` marker file → "data directory invalid" 錯誤
- loglevel=0（DEBUG）導致 nextcloud.log 達 434GB

---

#### 改進項目（下次遷移必做）

**① 伺服器 IP 管理**
```
□ 新伺服器 IP 確定前，先查 FortiGate DHCP 租約表，確保無衝突
□ DHCP 保留設定完成後，在 FortiGate 查看「Current Leases」確認新 IP 已派發
□ 任何 IP 變更，立即同步更新 ASUSTOR NAS NFS 白名單（ADM → 服務 → NFS → 允許清單）
□ 考慮將 NAS NFS 白名單改為整段允許（192.168.160.0/24），避免單機 IP 變更後須手動更新
```

**② fstab NFS 設定標準化**
```bash
# ✅ 正確格式（含 systemd 時序控制）
192.168.160.111:/volume2/hd2   /mnt/hd2     nfs  defaults,_netdev,nofail,x-systemd.mount-timeout=30  0  0
192.168.160.111:/volume1/Docker /mnt/docker  nfs  defaults,_netdev,nofail,x-systemd.mount-timeout=30  0  0

# 驗證 docker 依賴 NFS mount
systemctl list-dependencies docker.service | grep mnt
# 應看到 mnt-hd2.mount 與 mnt-docker.mount
```

**③ 容器啟動前確認 NFS 已掛載**
```bash
# 加入啟動前檢查腳本 /usr/local/bin/check-nfs-before-docker.sh
#!/bin/bash
for mp in /mnt/hd2 /mnt/docker; do
  if ! mountpoint -q "$mp"; then
    echo "ERROR: $mp not mounted, aborting docker start"
    exit 1
  fi
done
echo "NFS OK, proceeding"

# 或在 compose.yaml 加入 healthcheck 相依
```

**④ Docker bind mount 重建 SOP**
```bash
# 任何 container 懷疑 bind mount 指向舊 inode 時：
# 1. 確認 host 端掛載
mount | grep 192.168.160.111
ls /mnt/hd2/Nextcloud/data/  # 確認 NAS 資料在 host 可見

# 2. 強制重建（down 才能釋放 inode）
docker compose down && docker compose up -d

# 3. 驗證 container 內可見 NAS 資料
docker exec <container> ls /path/to/bind-mount
```

**⑤ NPM 的 proxy host 設定保護**
```
□ NPM 使用 NAS volume（/mnt/docker/npm），NFS 失敗時 NPM 以空 DB 啟動 → 所有設定遺失
□ 定期備份 NPM SQLite DB：cp /mnt/docker/npm/data/database.sqlite backups/YYYYMMDD_npm_db.sqlite
□ 或改用 NPM 的 Export 功能定期匯出設定快照
□ 緊急恢復時可用 /mnt/docker/npm/data/nginx/proxy_host/*.conf 直接復原 nginx 設定（不需 DB）
```

**⑥ 遷移後驗證 Checklist（每次遷移後必跑）**
```bash
# A. NFS 掛載
mount | grep 192.168.160.111   # 兩個 volume 都在

# B. 所有容器狀態
docker ps --format "table {{.Names}}\t{{.Status}}" | grep -v Up

# C. WebDAV（Nextcloud）
docker logs nextcloud --tail=5 | grep PROPFIND  # 應有 207

# D. 外部域名
for domain in nc.iexam.win foryou.tw infolink.iexam.win dokploy.iexam.win; do
  code=$(curl -sk -o /dev/null -w "%{http_code}" "https://$domain")
  echo "$domain → $code"
done

# E. FortiGate VIP 目的 IP
# 登入 FortiGate → Policy & Objects → Virtual IPs → 確認 mappedip 為新 IP

# F. ASUSTOR NFS 白名單
# ADM → 服務 → NFS → 確認新 IP 在允許清單
```

**⑦ Nextcloud 部署標準設定**
```php
// config.php 必填欄位（部署時務必確認）
'instanceid'        // 從 NAS 既有 config.php 複製，絕對不可用新 instanceid
'version'           // 如 '33.0.3.2'，必須與 code 版本一致
'installed'  => true
'loglevel'   => 2   // WARNING；預設 0 會產生 434GB log
'maintenance' => false
'trusted_domains'   // 含 hostname 與 IP
'dbhost'            // MySQL 位址
```

- **環境**：Ubuntu 24.04，Docker 29.4.3，FortiGate 160D，ASUSTOR NAS（NFS），Nextcloud 33，NPM 2.14.0
- **驗證**：2026-05-18 所有服務正常，WebDAV 207，外部域名全數 200，FortiGate VIP 指向 .120，NFS 掛載穩定
- **預防摘要**：最核心的兩條原則 — (1) **IP 變更必須同步更新 NAS NFS 白名單**；(2) **NFS 掛載必須在 Docker 啟動前完成（fstab 加 x-systemd.mount-timeout，或啟動前手動確認）**

### [2026-05-18] Docker bind mount 因 NFS 掛載時序問題導致 container 看不到 NAS 資料（Nextcloud 失效）✅ 已驗證結案

- **症狀**：Nextcloud（nc.iexam.win）顯示 500 / 維護模式，`occ status` 顯示未安裝；container 內 `/var/www/html/data/` 為空，看不到 appdata 與使用者目錄；NAS 上 `/mnt/hd2/Nextcloud/data/` 有完整資料（hiro 目錄、appdata_ocl99n9uanzs），兩邊不一致。
- **環境**：Ubuntu 24.04，Docker 29.4.3，NFS（192.168.160.111:/volume2/hd2 → /mnt/hd2），Nextcloud 33（nextcloud:33），compose bind mount `/mnt/hd2/Nextcloud:/var/www/html`，MySQL DB 在 NAS 192.168.160.111:3306。
- **診斷路徑**：
  1. `docker exec nextcloud ls /var/www/html/data/` → 空（或只有 index.html）
  2. `ssh .113 "ls /mnt/hd2/Nextcloud/data/"` → 有 `appdata_ocl99n9uanzs`, `hiro`, `nextcloud.log`
  3. `mount | grep 192.168.160.111` 在 .120 確認 NFS 已掛載 → 掛載正常
  4. **關鍵發現**：NFS 未掛載前 container 啟動，Docker 建立本機空目錄作為 bind mount target，NFS 後掛於同路徑但 container 的 inode 已鎖定本機目錄，不會自動切換到 NFS。
  5. config.php 僅含最小設定（instanceid only），缺 DB 連線 → 確認是 entrypoint 寫入的本機副本，非 NAS 上的完整設定。
- **根因**：Docker bind mount 的 inode 在 container 建立時確定，之後掛載於同路徑的 NFS 不會影響 container 已取得的 file descriptor。伺服器部署時序：Docker 啟動 → entrypoint 寫入 config.php 到本機路徑 → NFS 掛載（覆蓋 host view） → 但 container 仍看本機 inode。
- **解法**：
  ```bash
  # 1. 在 .113（NFS 正常掛載）寫入正確 config.php 到 NAS
  python3 -c "
  config = open('/mnt/hd2/Nextcloud/config/config.php').read()
  # 或直接寫入完整 config（含 instanceid、dbhost、version、installed=true、loglevel=2、maintenance=false）
  with open('/mnt/hd2/Nextcloud/config/config.php', 'w') as f:
      f.write(config)
  "

  # 2. 確認 compose.yaml image 正確
  grep 'image:' /data/compose/nextcloud/compose.yaml   # 應為 nextcloud:33，非 nextcloud:34

  # 3. 重建 bind mount（關鍵步驟）
  cd /data/compose/nextcloud
  docker compose down && docker compose up -d

  # 4. 驗證 container 現在看到 NAS 資料
  docker exec nextcloud ls /var/www/html/data/
  # 預期輸出：appdata_ocl99n9uanzs  hiro  index.html  nextcloud.log

  # 5. 確認 occ 狀態
  docker exec -u www-data nextcloud php occ status
  # installed: true, maintenance: false, needsDbUpgrade: false
  ```
- **附：Nextcloud occ upgrade 常見錯誤速查**

  | 錯誤訊息 | 根因 | 解法 |
  |----------|------|------|
  | "Updates between multiple major versions are unsupported" | config.php 缺 `'version'` key → 視為 0.0.0 | 補上 `'version' => '33.0.3.2'` |
  | "Your data directory is invalid, .ncdata missing" | 資料目錄缺 marker file | `echo "# Nextcloud data directory" > /var/www/html/data/.ncdata` |
  | "Nextcloud is in maintenance mode" | 上次失敗升級留下 maintenance=true | 用 PHP script 直接改寫 config.php 的 maintenance key |
  | Migration `34000Date20260318095645` → 誤以為需要 NC34 | 此 migration 是 NC33 自帶的，非 NC34 | 保持 nextcloud:33，`occ upgrade` 會自動執行 |

- **驗證**：
  ```bash
  # WebDAV 回傳 207（非 302）確認 sync 正常
  docker logs nextcloud --tail=20 | grep PROPFIND
  # → HTTP/1.1" 207 — WebDAV Multi-Status，sync client 正常連線

  # 瀏覽器確認
  # https://nc.iexam.win → 自動跳轉 /apps/dashboard/ → 顯示儀表板
  ```
- **預防**：
  1. **NFS 掛載必須在 Docker 服務啟動前完成**：`/etc/fstab` 加 `_netdev,x-systemd.mount-timeout=30`，systemd 保證 NFS 就緒後才啟 docker.service
  2. 確認方式：`systemctl list-dependencies docker.service | grep mnt`
  3. 遷移伺服器時，container 啟動前先 `mount | grep nfs` 確認掛載，再 `docker compose up -d`
  4. Nextcloud 升級前確認 config.php 有 `'version'` key，避免版本誤判
  5. `nextcloud.log` 的 loglevel 預設應為 2（WARNING），loglevel=0 可在高流量下導致 log 無限增長（本次達 434GB）
- **Rollback**：
  ```bash
  # 若新 container 仍看不到 NAS 資料，回到 .113 找出正確 config.php 後重複步驟
  docker compose down
  # 確認 NFS 已掛載：mount | grep 192.168.160.111
  docker compose up -d
  ```

### [2026-05-17] Pi-hole v6 on Docker — split-DNS 設定三個地雷 ✅ 已驗證結案

- **症狀**：Pi-hole 容器 healthy、port 53 顯示 listening，但外部 `dig @192.168.160.116` 全部 timeout；容器內 `dig @127.0.0.1` 也無法解析自訂網域
- **環境**：pihole/pihole:v6.4.2（FTL v6.6.2）、Docker 29.x、Ubuntu 24.04、network: npm_default（172.26.0.0/16 bridge）
- **根因（三層）**：
  1. **`misc.etc_dnsmasq_d = false`（預設）**：Pi-hole v6 改用 TOML，預設不載入 `/etc/dnsmasq.d/` 自訂設定檔，導致 `address=` 記錄完全無效
  2. **`dns.listeningMode = "LOCAL"`（預設）**：只回應「容器內直連子網路」的查詢（即 `172.26.0.0/16`）；來自 `192.168.160.x` 的封包經 Docker DNAT 後保留原始 source IP，不屬於容器本地介面，直接被 FTL 拒絕
  3. **Docker UDP hairpin NAT 問題**：即使前兩項修好，從 .116 host 本身用 `dig @192.168.160.116` 仍可能 timeout（OUTPUT chain 不走 PREROUTING DNAT），需改用容器 IP `172.26.0.5` 測試，或從外部機器驗證
- **解法**：
  ```bash
  # 1. 啟用 dnsmasq.d 載入（host 路徑）
  sed -i 's/  etc_dnsmasq_d = false/  etc_dnsmasq_d = true/' /mnt/docker/pihole/etc/pihole.toml

  # 2. 改為接受所有來源查詢
  sed -i 's/  listeningMode = "LOCAL"/  listeningMode = "ALL"/' /mnt/docker/pihole/etc/pihole.toml

  # 3. 重啟套用
  docker restart pihole

  # 4. 驗證（從容器 IP 測）
  dig @172.26.0.5 hermes-dash.iexam.win +short
  # 或從外部機器
  dig @192.168.160.116 hermes-dash.iexam.win +short
  ```
  自訂記錄格式（`/mnt/docker/pihole/dnsmasq/99-internal.conf`）：
  ```
  address=/hermes-dash.iexam.win/192.168.160.116
  address=/openwebui.iexam.win/192.168.160.116
  address=/hermes-api.iexam.win/192.168.160.116
  ```
- **驗證**：`dig @192.168.160.116 hermes-dash.iexam.win +short` 回傳 `192.168.160.116`；`dig @192.168.160.116 google.com +short` 回傳公開 IP（上游轉發正常）
- **預防**：Pi-hole v6 部署後，compose 的 environment 欄位設 `DNSMASQ_LISTENING=all` 只影響舊版；v6 必須在 pihole.toml 改 `listeningMode`。先在容器內 `dig @127.0.0.1` 確認 FTL 正常，再從外部測試，可快速定位問題層次

### [2026-05-09] GitHub Actions self-hosted runner + Dokploy 內網自動部署（API key BOM 造成 UNAUTHORIZED）✅ 已驗證結案

- **症狀**：push to main 後 GitHub Actions job 執行，`compose.deploy` API 回傳 `UNAUTHORIZED 401`；即使 secret 已設定、從 Windows 直接打 API 也能成功，但 runner 上卻一直失敗。
- **環境**：GitHub Actions self-hosted runner（`infolink-runner-116`）在 `.116`（192.168.160.116）；Dokploy v0.29.2；`x-api-key` header 認證；GitHub secret `DOKPLOY_API_KEY`；Windows PowerShell 設定 secret。
- **診斷路徑**：
  1. 第一次 run：`DOKPLOY_API_KEY:` 後面空白 → secret 根本沒設進去（`echo $key | gh secret set` 透過 pipeline 傳空）。
  2. 第二次 run：secret 有值（`***`），但 API 仍回 401。從 Windows 直接打 API 成功 → 懷疑 key 值有問題。
  3. Debug 輸出 `${DOKPLOY_API_KEY:0:6}` 與 `${#DOKPLOY_API_KEY}` → **長度 65，正確應為 64**；prefix 顯示 `﻿FAOfx`（開頭有不可見字元）。
  4. **根因確認**：PowerShell `echo $key | gh secret set` 在 pipeline 中加入 UTF-8 BOM（U+FEFF），secret 存入帶 BOM 的 65 字元字串，API 認證失敗。
- **根因**：PowerShell `echo`（`Write-Output`）通過 pipeline 傳遞字串時，會在字串開頭插入 UTF-8 BOM。`gh secret set` 接收到帶 BOM 的字串後原樣儲存，runner 取出使用時 key 比實際多一個字元，Dokploy 認證失敗。
- **解法**：
  ```powershell
  # ❌ 錯誤：echo 會插入 BOM
  echo $apiKey | gh secret set DOKPLOY_API_KEY --repo owner/repo

  # ✅ 正確：用 --body 直接傳值，不經過 pipeline
  gh secret set DOKPLOY_API_KEY --repo owner/repo --body $apiKey
  ```
- **驗證**：在 workflow 加入 debug 輸出確認 key 前綴與長度：
  ```bash
  echo "API Key prefix: ${DOKPLOY_API_KEY:0:6}"
  echo "API Key length: ${#DOKPLOY_API_KEY}"
  ```
  修正後：prefix 無 BOM、length = 64 → API 認證成功，`{"success":true,"message":"Deployment queued"}`。
- **預防**：設定 GitHub secret 時，**一律使用 `gh secret set --body <value>`**，絕不使用 `echo <value> | gh secret set`（PowerShell / Windows 環境尤其注意 BOM 問題）。
- **Rollback**：重新用 `--body` 設定正確 key 即可，無需其他回滾。

---

### 附：GitHub Actions self-hosted runner + 內網 Dokploy 架構說明

GitHub webhook 需要 public URL，Dokploy 在內網時 webhook 無法使用。替代方案：self-hosted runner 主動連外，不需 inbound。

**安裝步驟（.116 Ubuntu）：**
```bash
mkdir ~/actions-runner && cd ~/actions-runner
curl -o actions-runner-linux-x64.tar.gz -L <GitHub Actions runner URL>
tar xzf actions-runner-linux-x64.tar.gz
./config.sh --url https://github.com/ORG/REPO --token <TOKEN> --labels self-hosted,linux,infolink --name infolink-runner-116 --unattended
sudo ./svc.sh install && sudo ./svc.sh start
```

**Workflow 範本（.github/workflows/deploy.yml）：**
```yaml
on:
  push:
    branches: [main]
jobs:
  deploy:
    runs-on: [self-hosted, linux, infolink]
    steps:
      - name: Trigger Dokploy deployment
        env:
          DOKPLOY_API_KEY: ${{ secrets.DOKPLOY_API_KEY }}
        run: |
          response=$(curl -s -X POST http://192.168.160.116:3000/api/trpc/compose.deploy \
            -H 'Content-Type: application/json' \
            -H "x-api-key: ${DOKPLOY_API_KEY}" \
            -d '{"json":{"composeId":"<COMPOSE_ID>"}}')
          echo "$response" | grep -q '"success":true' && echo "✅ Deployed" || { echo "❌ Failed: $response"; exit 1; }
```

**Dokploy API key 生成（瀏覽器 JS，需先登入）：**
```javascript
fetch('/api/trpc/user.createApiKey', {
  method: 'POST',
  headers: {'Content-Type': 'application/json'},
  body: JSON.stringify({"json":{
    "name":"github-actions-unlimited",
    "metadata":{"organizationId":"<ORG_ID>"},
    "rateLimitEnabled": false,
    "rateLimitMax": 100000,
    "rateLimitTimeWindow": 86400000
  }})
}).then(r=>r.json()).then(d=>console.log(d.result.data.json.key))
```

### [2026-05-09] Next.js standalone + pnpm workspace transitive dep 連鎖缺失（MODULE_NOT_FOUND）✅ 已驗證結案

- **症狀**：`infolink-web-prod` 容器啟動後 unhealthy；`docker logs` 顯示 `Cannot find module 'bullmq'`，修完後又缺 `tslib`，再修又缺 `ms`——無窮追 dep。
- **環境**：Next.js 15 `output: 'standalone'`；pnpm workspaces + turborepo monorepo；apps/web 依賴 packages/core，packages/core 才 import bullmq/ioredis/pino 等。
- **根因**：Next.js standalone file tracing 會跟隨普通 node_modules symlinks，但**不跟隨 pnpm workspace 跨套件的 symlinks**。pnpm 在 `.pnpm` 虛擬 store 裡為每個套件建立獨立目錄並以 symlink 串接，standalone 只 trace 到 apps/web 直接 import 的路徑，workspace dep（@infolink/core）用到的 runtime packages 全部被漏掉。
- **解法**：在 Dockerfile builder stage 加入 Node.js script，掃描整個 `/app/node_modules/.pnpm/` 目錄，把所有 entry 下的每一個 package 都用 `cp -rL`（dereference 所有 symlinks）複製進 `/app/_server_deps/`，再用另一個 script 把 `_server_deps` merge 進 standalone 的 `node_modules`（skip 已存在的，不 overwrite）：
  ```dockerfile
  # 在 builder stage：
  RUN node - <<'SCRIPT'
  const storeDir = '/app/node_modules/.pnpm';
  const stagingRoot = '/app/_server_deps';
  fs.mkdirSync(stagingRoot, { recursive: true });
  for (const entry of fs.readdirSync(storeDir)) {
    const nmDir = path.join(storeDir, entry, 'node_modules');
    // ...iterate all packages, cp -rL each one into stagingRoot
  }
  SCRIPT

  # 在 runner stage：
  COPY --from=builder /app/_server_deps /app/_server_deps
  RUN node - <<'MERGE'
  // cp -r each package from _server_deps into node_modules (skip if exists)
  MERGE
  ```
- **驗證**：`docker logs infolink-web-prod` 顯示 `✓ Ready in 558ms`；`docker ps` 顯示 `(healthy)`；`https://infolink.iexam.win/login` 頁面正常載入。
- **預防**：凡是 pnpm workspace + Next.js standalone，在 Dockerfile 務必加上「全量 .pnpm store 掃描 + merge」步驟，**不要**逐一列出 package 名稱（因為 transitive dep 不可預測）。

### [2026-05-09] pnpm monorepo Docker 部署完整 SOP（InfoLink on Dokploy）— 含全部已知地雷 ✅ 已驗證結案

> 本案例是統整版，彙整整個部署過程的所有問題與對策，供下次部署同類架構前預先對照。
> 子問題詳細版本請見下方各獨立案例（Caddy ACME、ERR_UNKNOWN_FILE_EXTENSION 等）。

- **場景**：將 TypeScript pnpm monorepo（Next.js 15 standalone + BullMQ worker）透過 Dokploy Compose 部署至已有 NPM（Nginx Proxy Manager）的 Ubuntu 24.04 Docker 主機。
- **架構**：
  ```
  Internet → FortiGate NAT → 192.168.160.116:443 → NPM → infolink.iexam.win
  NPM → host:3001 → [infolink-caddy-prod :80] → [infolink-web-prod :3000]
                                               → [infolink-worker-prod]
  Compose 服務：postgres / redis / meilisearch / web / worker / caddy
  ```
- **部署前 Checklist（必查，省 8 次重部署）**：

  **① Git / Dockerfile**
  - [ ] `apps/web/public/` 目錄必須存在（Next.js standalone build 需要），即使為空也要建立：
    ```bash
    mkdir -p apps/web/public
    git add apps/web/public/.gitkeep
    ```
  - [ ] 所有 workspace 套件的 `package.json` exports 確認：若 `"main": "./src/index.ts"` → 是 source-first 套件，Dockerfile 需手動 tsc 編譯（見「ERR_UNKNOWN_FILE_EXTENSION」案例）
  - [ ] `Dockerfile.worker.prod` builder stage 在 `COPY . .` 後加入 tsc 編譯 + exports patch（見下方 Dockerfile 片段）
  - [ ] Caddyfile 確認無 `{$ACME_EMAIL}` 或其他未定義的環境變數替換；若在 NPM 後端只需 HTTP，直接用 `:80` listener

  **② Docker Compose 環境變數**
  - [ ] 所有 `${VAR}` 在 Dokploy environment 設定中均有對應值（特別是 `DATABASE_URL`、`REDIS_URL`、`NEXTAUTH_URL`、`NEXTAUTH_SECRET`）
  - [ ] `ACME_EMAIL` 若 Caddyfile 有用到，必須填入；若架構不需 ACME 則直接移除 global block

  **③ Port 衝突（NPM 佔用 80/443 時）**
  - [ ] Caddy 在 docker-compose 裡只 expose 內部 port，不對外 bind 80/443
  - [ ] web container expose `host:3001 → container:3000`（供 NPM forward）
  - [ ] Caddy 的 compose port 設定：`"127.0.0.1:3001:80"` 或讓 NPM 直連 web:3000（視架構）

  **④ Dokploy 設定**
  - [ ] Compose 路徑、Branch 與 GitHub 私有 repo 的 Deploy Key 已設定
  - [ ] 觸發 redeploy 使用 tRPC API（Webhook 需 branch match header，容易失敗）：
    ```js
    // 在 Dokploy 的瀏覽器 console 執行
    fetch('/api/trpc/compose.deploy', {
      method: 'POST',
      headers: {'Content-Type': 'application/json'},
      body: JSON.stringify({json: {composeId: '<YOUR_COMPOSE_ID>'}})
    }).then(r=>r.json()).then(console.log)
    ```
  - [ ] Compose ID 從 Dokploy URL 取得（`/dashboard/project/<pid>/services/compose/<composeId>`）

  **⑤ NPM Proxy Host**
  - [ ] 確認 `*.iexam.win` 萬用憑證是否還在有效期（NPM > Certificates）；有效則直接套用，不需重申請
  - [ ] 新增 Proxy Host：Domain → Forward IP:Port → SSL tab 選現有憑證 → Force SSL + HTTP/2 + WebSocket
  - [ ] 新 domain 如需 Let's Encrypt，port 80 必須對外可達（FortiGate HTTP VIP 已開通）

- **Dockerfile.worker.prod 關鍵片段（source-first monorepo 必加）**：
  ```dockerfile
  COPY . .
  RUN corepack enable && corepack prepare pnpm@9.12.3 --activate
  ENV NODE_ENV=production

  # 編譯無 build script 的 source-first workspace 套件
  RUN cd packages/db       && ./node_modules/.bin/tsc --project tsconfig.json
  RUN cd packages/core     && ./node_modules/.bin/tsc --project tsconfig.json
  RUN cd packages/ai       && ./node_modules/.bin/tsc --project tsconfig.json || true
  RUN cd packages/pipeline && ./node_modules/.bin/tsc --project tsconfig.json

  # Patch package.json exports 指向 dist/*.js 而非 src/*.ts
  RUN node - <<'EOF'
  const fs = require('fs');
  const pkgs = [
    { dir: 'packages/db', map: { '.': './dist/index.js', './schema': './dist/schema/index.js', './client': './dist/client.js', './encrypt': './dist/encrypt.js' } },
    { dir: 'packages/core', map: { '.': './dist/index.js' } },
    { dir: 'packages/ai',   map: { '.': './dist/index.js', './test': './dist/test-provider.js' } },
    { dir: 'packages/pipeline', map: { '.': './dist/index.js', './summary-prompts': './dist/summary-prompts.js' } },
  ];
  for (const { dir, map } of pkgs) {
    const p = dir + '/package.json';
    const pkg = JSON.parse(fs.readFileSync(p, 'utf8'));
    pkg.main = map['.'];
    pkg.types = map['.'].replace('.js', '.d.ts');
    pkg.exports = map;
    fs.writeFileSync(p, JSON.stringify(pkg, null, 2) + '\n');
    console.log('patched', p);
  }
  EOF

  RUN pnpm --filter @infolink/worker build
  ```

- **Caddyfile（NPM 後端 HTTP-only 版本）**：
  ```caddyfile
  # 無 global block（不需 ACME，TLS 由 NPM 管理）
  :80 {
      encode zstd gzip
      request_body { max_size 4MB }
      request_header X-Forwarded-Proto https
      request_header X-Forwarded-Host {host}
      request_header X-Real-IP {remote_host}
      request_header -X-Forwarded-For
      @nextstatic path /_next/static/*
      header @nextstatic Cache-Control "public, max-age=31536000, immutable"
      header /api/* Cache-Control "no-store"
      header {
          Strict-Transport-Security "max-age=31536000; includeSubDomains; preload"
          X-Frame-Options "DENY"
          X-Content-Type-Options "nosniff"
          Referrer-Policy "strict-origin-when-cross-origin"
          -Server
      }
      reverse_proxy web:3000 {
          flush_interval -1
          transport http { keepalive 30s }
      }
  }
  ```

- **快速除錯指令（部署後 container 起不來時）**：
  ```bash
  # 查所有容器狀態
  docker ps -a --filter name=infolink

  # 查特定容器 log（最後 50 行）
  docker logs --tail 50 infolink-worker-prod
  docker logs --tail 50 infolink-caddy-prod
  docker logs --tail 50 infolink-web-prod

  # 進容器 shell 檢查
  docker exec -it infolink-worker-prod sh

  # 確認 web 回應
  curl -s -o /dev/null -w "%{http_code}" http://localhost:3001
  ```

- **本次實際踩到的坑（按發生順序）**：

  | # | 症狀 | 根因 | 解法 |
  |---|------|------|------|
  | 1 | web build 失敗 | `apps/web/public/` 不存在 | `mkdir -p apps/web/public && git add .gitkeep` |
  | 2 | caddy crash，parse error at line 8 | `{$ACME_EMAIL}` 未設定展開為空字串 | 移除 global ACME block，改純 HTTP `:80` |
  | 3 | worker crash，ERR_UNKNOWN_FILE_EXTENSION .ts | packages/core 等為 source-first，exports 指向 `.ts` | Dockerfile 加 tsc 編譯 + package.json exports patch |
  | 4 | NPM port 80/443 衝突 | NPM 已佔用，Caddy 不需對外 expose | Caddy 不 bind host port，由 NPM forward 到 web:3001 |
  | 5 | Dokploy webhook 回傳 `Branch Not Match` | Webhook URL 需 branch match header | 改用 browser tRPC API 觸發 redeploy |

- **驗證（全部通過才算完成）**：
  ```bash
  docker ps --filter name=infolink  # 6 個容器全部 Up，web/worker 顯示 (healthy)
  curl -s -o /dev/null -w "%{http_code}" http://192.168.160.116:3001  # 200
  # NPM proxy host infolink.iexam.win 狀態 Online
  # 瀏覽器開 https://infolink.iexam.win 正常顯示
  ```

- **Rollback**：
  ```bash
  # Dokploy 介面 → Compose → Stop 或 Remove
  # 或直接 SSH 到 .116：
  cd /data/compose/infolink-stack && docker compose down
  # NPM 刪除 infolink.iexam.win proxy host
  ```

---

### [2026-05-09] pnpm source-first monorepo 在 Docker 多階段 build 的 ERR_UNKNOWN_FILE_EXTENSION .ts 問題 ✅ 已驗證結案

- **症狀**：InfoLink monorepo（Next.js 15 + BullMQ worker，pnpm workspaces + turborepo）Docker build 成功，但 `infolink-worker-prod` 容器啟動即 crash，日誌：`Error [ERR_UNKNOWN_FILE_EXTENSION]: Unknown file extension ".ts" for /app/packages/core/src/index.ts`。
- **環境**：Node.js 20-alpine，pnpm 9.12.3，turborepo；`packages/core`、`packages/db`、`packages/ai`、`packages/pipeline` 為 "source-first" package（無 `build` script），其 `package.json` exports 指向 `.ts` 原始碼（`"exports": { ".": "./src/index.ts" }`）。`NODE_ENV=production` 下 Node.js 無法直接執行 `.ts` 檔案。
- **診斷路徑**：
  1. `docker logs infolink-worker-prod` → `ERR_UNKNOWN_FILE_EXTENSION .ts` at `packages/core/src/index.ts`
  2. 進入建置好的 image 查看：`cat /app/packages/core/package.json` → `"main": "./src/index.ts"`
  3. `turbo.json` 的 `build.dependsOn: ["^build"]` 只觸發有 `build` script 的 workspace package，source-first 的套件不會被編譯
  4. 結論：worker 的 dist/index.js 在 require `@infolink/core` 時，Node.js 跟著 exports 找到 `.ts`，無法執行
- **根因**：pnpm "source-first" workspace package 沒有 `build` script，turbo 不會編譯它們。Node.js 20（非 tsx/ts-node）不能執行 `.ts` 檔案。多階段 Docker build 的 builder stage 必須手動 tsc 編譯這些套件，並 patch `package.json` 的 exports 指向 `dist/*.js`。
- **解法**（在 `docker/Dockerfile.worker.prod` builder stage 的 `COPY . .` 之後加入）：
  ```dockerfile
  # Build shared workspace packages that have no build script (source-first monorepo).
  RUN cd packages/db       && ./node_modules/.bin/tsc --project tsconfig.json
  RUN cd packages/core     && ./node_modules/.bin/tsc --project tsconfig.json
  RUN cd packages/ai       && ./node_modules/.bin/tsc --project tsconfig.json || true
  RUN cd packages/pipeline && ./node_modules/.bin/tsc --project tsconfig.json

  # Patch package.json exports/main to point at compiled dist instead of src/*.ts
  RUN node - <<'EOF'
  const fs = require('fs');
  const pkgs = [
    { dir: 'packages/db', map: { '.': './dist/index.js', './schema': './dist/schema/index.js', './client': './dist/client.js', './encrypt': './dist/encrypt.js' } },
    { dir: 'packages/core', map: { '.': './dist/index.js' } },
    { dir: 'packages/ai',   map: { '.': './dist/index.js', './test': './dist/test-provider.js' } },
    { dir: 'packages/pipeline', map: { '.': './dist/index.js', './summary-prompts': './dist/summary-prompts.js' } },
  ];
  for (const { dir, map } of pkgs) {
    const p = dir + '/package.json';
    const pkg = JSON.parse(fs.readFileSync(p, 'utf8'));
    pkg.main = map['.'];
    pkg.types = map['.'].replace('.js', '.d.ts');
    pkg.exports = map;
    fs.writeFileSync(p, JSON.stringify(pkg, null, 2) + '\n');
    console.log('patched', p);
  }
  EOF

  RUN pnpm --filter @infolink/worker build
  ```
- **驗證**：
  ```bash
  docker logs infolink-worker-prod  # 無 ERR_UNKNOWN_FILE_EXTENSION，改出現 BullMQ ready 訊息
  docker ps --filter name=infolink-worker-prod  # STATUS: Up (healthy)
  ```
- **預防**：
  - monorepo 建立 Docker image 前，先確認所有 workspace 套件的 `package.json` exports 是否指向 `.js`（compiled）而非 `.ts`（source）
  - 若套件有 `"exports": { ".": "./src/index.ts" }`，代表是 source-first，Docker 多階段 build 中必須手動 tsc 編譯
  - turbo `"dependsOn": ["^build"]` 不能保證 source-first 套件被編譯，不要依賴 turbo 自動處理
  - `packages/ai` 的 tsc 加 `|| true` 是因為可能有部分型別錯誤但不影響 JS 輸出
- **Rollback**：移除 Dockerfile 中的 tsc 和 patch 步驟（退回會再次 crash，僅供 debug 用）

---

### [2026-05-09] Caddy Caddyfile 因空 ACME_EMAIL 環境變數造成 parse error ✅ 已驗證結案

- **症狀**：`infolink-caddy-prod` 容器啟動即 crash，日誌：`Error: parsing caddyfile tokens for 'email': wrong argument count or unexpected line ending after 'email', at /etc/caddy/Caddyfile:8`
- **環境**：Caddy 2.x，Docker Compose，NPM（Nginx Proxy Manager）在上游已處理 TLS；Dokploy 環境未設定 `ACME_EMAIL` 環境變數。
- **診斷路徑**：
  1. `docker logs infolink-caddy-prod` → Caddyfile parse error at line 8（global block）
  2. Caddyfile 原內容：`{ email {$ACME_EMAIL} }`
  3. `$ACME_EMAIL` 未定義時展開為空字串 → Caddy parse 到 `email` 後面沒有合法 email argument → parse error
  4. 架構上 NPM 在 port 3001 前端，已負責 HTTPS/Let's Encrypt，Caddy 只需在 Docker 內網做 HTTP reverse proxy
- **根因**：Caddyfile global block 包含 `email {$ACME_EMAIL}`，環境變數為空時 Caddy 無法解析。且 Caddy 在此部署不需要 ACME（TLS 由上游 NPM 管理）。
- **解法**：移除整個 global options block，site address 改為純 `:80`（HTTP-only）：
  ```caddyfile
  # TLS terminated by NPM upstream. Caddy is HTTP-only inside Docker network.
  :80 {
      encode zstd gzip
      # ... 其餘設定保留
      reverse_proxy web:3000 {
          flush_interval -1
          transport http { keepalive 30s }
      }
  }
  # 移除 {$PUBLIC_HOSTNAME} site block 與 catch-all :80, :443 block
  ```
- **驗證**：
  ```bash
  docker logs infolink-caddy-prod  # 出現 "serving initial configuration" 無 error
  docker ps --filter name=infolink-caddy-prod  # STATUS: Up
  curl -s -o /dev/null -w "%{http_code}" http://192.168.160.116:3001  # 200
  ```
- **預防**：
  - 在 NPM/Nginx 已處理 TLS 的部署架構下，Caddy 作為內部 HTTP proxy 時不需 global ACME block
  - 使用環境變數替換 Caddyfile 時，確保所有 `{$VAR}` 在部署環境中都有對應的值；或改用有預設值的語法（Caddy 不支援 `{$VAR:-default}` 語法，應直接移除該指令）
  - site address 用 `:80` 而非 `{$PUBLIC_HOSTNAME}` 可避免主機名相關問題，讓上游 proxy 負責域名路由
- **Rollback**：在 Caddyfile 加回 global block，並確保 `ACME_EMAIL` 環境變數已設定

### [2026-05-09] 在已有 NPM 的 Docker 主機部署 Dokploy PaaS（方案 A：共用 Port 繞過衝突）✅ 已驗證結案

- **症狀**：想在 .116 安裝 Dokploy，但官方 `install.sh` 執行失敗：`Error: something is already running on port 80`，因為 NPM 已佔用 80/443。
- **環境**：.116（192.168.160.116）Ubuntu 24.04，Docker 29.4.3；NPM 佔用 port 80/443/81；已有 postgresDB（postgres:17，port 35432）與 Redis（port 36379）容器；Dokploy 目標版本：latest。
- **診斷路徑**：
  - L7：Dokploy 官方 install.sh 執行時內嵌 Traefik，預設綁 port 80/443，與 NPM 衝突
  - 確認 NPM 需要繼續運作（公開域名 proxy），不可停用
  - 查 Dokploy 官方 compose 結構：app 本身只需 port 3000，衝突來自 Traefik entrypoint 設定
  - 方案：自訂 compose，Traefik entrypoint 改為 7080/7443，Dokploy app 仍跑 3000
- **根因（三個獨立問題）**：
  1. Dokploy 官方 installer 硬綁 Traefik 於 80/443，與 NPM 衝突，無法直接執行
  2. Dokploy 的 `wait-for-postgres` 腳本讀取的環境變數是 `DATABASE_URL`（非 `POSTGRES_URL`），寫錯變數名導致一直等待 postgres 逾時
  3. 自建 postgres DB 前，`template1` 的 collation 版本（2.36）與 OS libc（2.41）不符，`CREATE DATABASE` 失敗
- **解法**：

  **Step 1：自訂 compose.yaml 繞過 port 衝突**
  ```yaml
  # /data/compose/dokploy/compose.yaml
  services:
    dokploy:
      image: dokploy/dokploy:latest
      container_name: dokploy
      environment:
        - NODE_ENV=production
        - DATABASE_URL=postgresql://postgres:PASSWORD@172.20.0.2:5432/dokploy
        - REDIS_URL=redis://172.23.0.2:6379
      ports:
        - "3000:3000"
      volumes:
        - /var/run/docker.sock:/var/run/docker.sock
        - /var/lib/dokploy:/var/lib/dokploy
        - /etc/dokploy:/etc/dokploy
      networks:
        - dokploy-network
        - postgresql_default   # 掛入既有 postgres 網路
        - redis_default        # 掛入既有 redis 網路
    traefik:
      image: traefik:v3.1.2
      command:
        - "--entrypoints.web.address=:7080"      # 不用 80
        - "--entrypoints.websecure.address=:7443" # 不用 443
      ports:
        - "7080:7080"
        - "7443:7443"
        - "8080:8080"   # Traefik dashboard
      networks:
        - dokploy-network
  networks:
    postgresql_default:
      external: true
    redis_default:
      external: true
  ```

  **Step 2：修復 collation 版本不符（postgres:17 + libc 2.41）**
  ```bash
  docker exec postgresDB psql -U postgres -c "ALTER DATABASE template1 REFRESH COLLATION VERSION"
  docker exec postgresDB psql -U postgres -c "ALTER DATABASE postgres REFRESH COLLATION VERSION"
  docker exec postgresDB psql -U postgres -c "CREATE DATABASE dokploy"
  ```

  **Step 3：查 Dokploy 正確環境變數名**
  ```bash
  # 若 Dokploy 一直 "Postgres not ready yet"，先進容器查 wait-for-postgres 腳本
  docker exec dokploy cat /app/dist/wait-for-postgres.mjs | head -5
  # 關鍵：腳本讀取 DATABASE_URL，不是 POSTGRES_URL
  ```

  **Step 4：查現有容器的 Docker network IP**
  ```bash
  docker inspect postgresDB | python3 -c "import sys,json; d=json.load(sys.stdin); [print(k,v['IPAddress']) for k,v in d[0]['NetworkSettings']['Networks'].items()]"
  # 找出 IP 後填入 DATABASE_URL
  ```

  **Step 5：NPM 加 proxy host**
  - Domain: `dokploy.iexam.win`
  - Forward: `http://192.168.160.116:3000`
  - SSL: 使用現有 `*.iexam.win` 萬用憑證（不需新申請）

- **驗證**：
  ```bash
  docker ps --filter name=dokploy  # STATUS 顯示 (healthy)
  curl -s -o /dev/null -w "%{http_code}" http://localhost:3000  # 回傳 200
  # NPM 列表：dokploy.iexam.win 狀態 Online
  ```
- **預防**：
  - 在同一主機部署多個需要 Traefik 的服務前，先確認 80/443 使用權誰屬
  - Dokploy `DATABASE_URL` 格式：`postgresql://USER:PASS@HOST:PORT/DBNAME`（注意 `!@` 等特殊字元在 URL 中需 URL-encode，或改用 Docker Secret）
  - postgres:17 容器在 OS libc 升級後，需執行 `REFRESH COLLATION VERSION` 才能建新 DB
- **Rollback**：
  ```bash
  cd /data/compose/dokploy && docker compose down
  docker exec postgresDB psql -U postgres -c "DROP DATABASE IF EXISTS dokploy"
  ```

### [2026-05-08] Docker 服務全站遷移：.113 → .116，含 NPM Proxy + FortiGate VIP 更新 ✅ 已驗證結案

- **症狀**：.113（192.168.160.113）主力 Docker 伺服器持續當機，決定全站遷移至 .116（192.168.160.116）；遷移後需確保外部域名（hiro.iexam.win、nc.iexam.win 等）與 FortiGate VIP 都指向新主機。
- **環境**：.116 Ubuntu 24.04 LTS，Docker 29.4.3；NAS 192.168.160.111（NFS volume）；NPM（Nginx Proxy Manager）；FortiGate 50E；Python paramiko SSH 自動化腳本。
- **診斷路徑**：
  1. .116 本地磁碟（228GB NVMe）容量足夠，但需掛載 NAS NFS volume 存放服務資料（與 .113 共用 NAS）。
  2. 服務依序遷移：wordpress-hiro → postgresql → mssql2019 → redis → verdaccio → rustdesk → nextcloud → NPM。
  3. 遷移過程發現多個隱藏問題（見根因）。
  4. .113 關機後，NPM proxy 與 FortiGate VIP 仍指向舊 IP，需逐一更新。
- **根因（各子問題）**：
  1. **PostgreSQL PG17 vs PG18**：`postgres:latest` 已升至 PG18，但 NAS 資料為 PG17 格式，container 啟動失敗 → 改 `image: postgres:17`。
  2. **Nextcloud 跨版本升級不支援**：latest=33，但資料版本 31.0.7.1，跨兩版不支援 → 必須 31→32→33 分步升級，每步等待 DB migration 完成。
  3. **Redis volume 目錄不存在**：NAS `/mnt/hd2/redis/data` 未建立 → `mkdir -p + chmod 777` 先建立。
  4. **MSSQL 2022 NFS root_squash**：NAS 以 root_squash 阻擋 container root 寫入系統 DB ldf → 暫緩，待 .113 完全下架後重新規劃（改用本地 volume 存系統 DB）。
  5. **verdaccio compose npm-net 網路缺失**：舊 yaml 宣告了 `npm-net` 但未定義 → 移除，重寫 yaml。
  6. **rustdesk hbbr 相對路徑 volume**：`./data:/root` 在 `/data/compose/rustdesk/` 下是 `/data/compose/rustdesk/data`，但 NAS 需要絕對路徑 → 改為 `/mnt/docker/rustdesk/data:/root`。
  7. **NPM SQLite 共用**：NPM 的 NAS volume（`/mnt/docker/npm/data`）包含 SQLite DB，只要 .113 的 NPM 已停止，.116 的 NPM 啟動後自動繼承所有 proxy 設定與 SSL 憑證，不需手動還原。
- **解法**：
  ```bash
  # 1. 掛載 NAS NFS（寫入 fstab）
  192.168.160.111:/volume2/hd2   /mnt/hd2     nfs  defaults,_netdev,nofail  0  0
  192.168.160.111:/volume1/Docker /mnt/docker  nfs  defaults,_netdev,nofail  0  0

  # 2. 各服務用 base64 encode yaml 寫入 /data/compose/<name>/compose.yaml
  b64=$(echo '<yaml_content>' | base64)
  echo "$b64" | base64 -d > /data/compose/<name>/compose.yaml
  cd /data/compose/<name> && docker compose up -d

  # 3. Nextcloud 分步升級（等每步 migration 完成再進下一步）
  docker exec nextcloud php occ status  # 確認 version，再換 image 重啟

  # 4. NPM proxy 更新（在 NPM Web UI 81 port）
  # 逐一編輯 hiro.iexam.win / nc.iexam.win / iexam.win，修改 Forward Hostname

  # 5. FortiGate VIP 更新（DNAT & 虛擬 IP）
  # 雙擊各 VIP 進入編輯，修改「對應的 IP 網段/範圍」
  # 受影響：postgresDB(35432)、RustDesk/RustDeskUDP(21114-21119)
  ```
- **驗證**：
  1. `docker ps -a` 確認所有容器 Up 狀態
  2. `Test-NetConnection 192.168.160.116 -Port 80/443/81` 從本機確認 port 開放
  3. NPM proxy 清單確認各域名 Online
  4. FortiGate VIP 清單確認目的 IP 已更新為 .116
- **預防**：
  - 遷移前先讀取 git 倉庫（`E:\01-Devops\HyperHeroX\docker_compose\`）的 compose yaml，避免用舊版或錯誤設定
  - postgres 指定固定版本（`postgres:17`），不用 `latest`，避免大版本升級破壞資料
  - Nextcloud 每次升級只能跨一個大版本
  - NAS NFS 的 root_squash 設定要事先確認，MSSQL 等需要 root 寫入的服務需另外規劃
  - 遷移順序：資料庫類 → 應用類 → NPM（最後），確保 proxy 更新前服務已就緒
- **Rollback**：
  - 啟回 .113（主機上電）
  - 將 FortiGate VIP 改回 .113
  - NPM proxy 改回 .113
- **待處理**：
  - MSSQL 2022 重新部署（需解決 NFS root_squash 問題）
  - 遊戲伺服器 VIP（VrisingServer/PZServer/DST）仍指向 .113，待確認是否繼續使用或刪除
  - n8n.iexam.win（原 .113:3000）需決定是否在 .116 部署 n8n

### [2026-04-08] SSL VPN 使用者連不到勞發署 pamtc.ejob.gov.tw（Policy dstintf 錯配）✅ 已驗證結案

- **症狀**：FortiClient SSL VPN 使用者連上中科後，無法訪問 `https://pamtc.ejob.gov.tw/`、`163.29.199.87`、東豐機房 `150.129.38.38`。VPN 本身連得上，內網 `192.168.1.0/24` 也通。
- **環境**：FortiGate 60D，FortiOS v6.0.17 build 528，單 VDOM root，SSL VPN on `wan1:33443`，split-tunneling enable（routing-address 空）。
- **診斷路徑**：
  1. `GET /api/v2/cmdb/firewall/policy/14` 看現況：srcintf=`ssl.root`、**dstintf=`internal`**，但 dstaddr 卻含三個 Internet 目的地（`勞發署IP_Pamtc`=163.29.199.87、`FQDN_pamtc_ejob`、`東豐機房IP`=150.129.38.38）與一個內網 `ToHiro_local_subnet_1`。
  2. `GET /api/v2/monitor/router/lookup?destination=163.29.199.87` → 結果走 `ppp1`（wan1 PPPoE），**不是 internal**。
  3. 推論：Policy 14 只對 `ToHiro_local_subnet_1` 有效，對三個 Internet 目的地永遠不會命中 → 預設 deny。
  4. 為何 client 有把 163.29.199.87 丟進 tunnel？FortiOS 6.0 在 `split-tunneling-routing-address` 為空時，會把 policy 的 dstaddr 自動推給 FortiClient 當路由。這完美解釋「VPN 連得上但就是進不去」的症狀。
- **根因**：Policy 14 `dstintf=internal` 與 dstaddr 裡的公網目的地邏輯矛盾，ssl.root → wan1 方向完全沒有 policy 可命中。
- **解法**（最小變更，**不動** Policy 14，新增 Policy 15）：

  ```powershell
  # PowerShell + FortiOS REST API（繞過 Web UI 5 分鐘 session timeout）
  $base='https://192.168.1.99'
  Invoke-WebRequest "$base/logincheck" -Method POST `
    -Body 'username=admin&secretkey=<PASS>&ajax=1' -SessionVariable sess -UseBasicParsing | Out-Null
  $csrf=(($sess.Cookies.GetCookies($base)|? Name -eq 'ccsrftoken').Value).Trim('"')
  $h=@{'X-CSRFTOKEN'=$csrf}
  $body=@{
    policyid=15; name='SSL_to_Ejob_Outbound'
    srcintf=@(@{name='ssl.root'}); dstintf=@(@{name='wan1'})
    srcaddr=@(@{name='all'})
    dstaddr=@(@{name='勞發署IP_Pamtc'},@{name='FQDN_pamtc_ejob'},@{name='東豐機房IP'})
    service=@(@{name='ALL'}); action='accept'; status='enable'
    schedule='always'; nat='enable'; groups=@(@{name='VPN'})
  } | ConvertTo-Json -Depth 6 -Compress
  $utf8=[Text.Encoding]::UTF8.GetBytes($body)   # UTF-8 必要，否則中文物件名會壞掉
  Invoke-WebRequest "$base/api/v2/cmdb/firewall/policy?vdom=root" -Method POST `
    -WebSession $sess -Headers $h -Body $utf8 -ContentType 'application/json' -UseBasicParsing
  ```

  等效 CLI：
  ```text
  config firewall policy
    edit 15
      set name "SSL_to_Ejob_Outbound"
      set srcintf "ssl.root"
      set dstintf "wan1"
      set srcaddr "all"
      set dstaddr "勞發署IP_Pamtc" "FQDN_pamtc_ejob" "東豐機房IP"
      set service "ALL"
      set action accept
      set schedule "always"
      set nat enable
      set groups "VPN"
    next
  end
  ```

- **驗證**：
  1. `GET /api/v2/cmdb/firewall/policy/15` 回讀所有欄位。
  2. 請 VPN 使用者斷線重連 FortiClient（**必須重連**才會重拉 policy 推送的路由）。
  3. Client 端：`ping 163.29.199.87`、`curl -vk https://pamtc.ejob.gov.tw/`。
  4. FortiGate 端：GUI Log → Forward Traffic，過濾 srcintf=ssl.root dstintf=wan1 看有無命中 Policy 15；或 CLI `diagnose debug flow`。
- **預防**：
  - 每條 policy 的 dstaddr 要和 dstintf 對應的實際出口一致。公網 IP/FQDN 走 wan1、內網 subnet 走 internal，兩者混在同一條 policy 會出矛盾。
  - 新增 SSL VPN 可達目的地前，先用 `/api/v2/monitor/router/lookup?destination=X` 確認該走哪個出口介面，再決定 policy 的 dstintf。
  - Split-tunnel client 會依 policy dstaddr 推送路由給 FortiClient——新增目的地時必須同步檢查對應的 `ssl.root → 出口介面` policy 是否存在。
- **Rollback**：`DELETE /api/v2/cmdb/firewall/policy/15`；極端情況從備份 `backups/2026-04-08_1559_fgt_pre_ssl_ejob_fix.conf` 整包還原。
- **相關文件**：`NETWORK.md` 第 5 節 Policy 表與「變更紀錄」；備份檔 `backups/2026-04-08_1559_fgt_pre_ssl_ejob_fix.conf`。
- **操作 Tips**（本次踩到的地雷）：
  - FortiOS 6.0 Web UI admin timeout 預設 5 分鐘，操作途中很容易被踢，改走 PowerShell + REST API 可避免。
  - Claude in Chrome 的 `javascript_tool` 輸出會被安全過濾攔截 cookie 樣式資料（config backup 內含密碼 hash 會被擋），所以備份配置要用 PowerShell `Invoke-WebRequest -OutFile` 直接落地，別用瀏覽器 JS 下載。
  - POST policy 的 JSON body 若含中文物件名，必須以 UTF-8 bytes 送（`[Text.Encoding]::UTF8.GetBytes`），否則會變成亂碼並對應不到既有物件。

---

### [2026-08-05] 本機記憶體被 WSL2 吃光（VmmemWSL 19.4 GB / 主機只剩 1.8 GB）

- **症狀**：工作管理員記憶體 96%，`VmmemWSL` 佔 19.4 GB，主機 63.8 GB 只剩 1.8 GB free。
- **環境**：Windows 開發機（Hiro，64 GB RAM）、WSL 2.6.3、發行版 `Ubuntu-24.04`(Stopped) 與 `podman-machine-default`(Running)、podman 5.8.5、cgroup v2 rootless。
- **根因**（兩個疊在一起，缺一不足以解釋）：
  1. `podman-machine-default` 裡同時跑 **16 個容器**（多套 e2e／test 環境開了 16–18 小時沒關），實際用掉約 10 GB，且**全部沒有記憶體上限**（`HostConfig.Memory=0`）。
  2. **沒有 `.wslconfig`** → WSL2 預設吃到主機一半（31 GB），而且**拿去當 page cache 的記憶體不會主動還給 Windows**（`buff/cache` 17 GB）。VM 內部 `available 20Gi` 看起來很空，Windows 卻只剩 1.8 GB —— 這個落差就是症狀本身。
- **解法**：
  ```bash
  # 1) 判斷是誰在吃（所有 distro 共用同一個 utility VM，只會有一條 VmmemWSL）
  wsl.exe -l -v                                   # Stopped 的不佔記憶體
  wsl.exe -d podman-machine-default -e free -h    # used vs buff/cache 要分開看

  # 2) 逐容器用量（podman stats 在 WSL 會失敗，改讀 cgroup v2，要 -u root）
  wsl.exe -d podman-machine-default -u root -e sh -c '
  B=/sys/fs/cgroup/user.slice/user-1000.slice/user@1000.service/app.slice
  for d in "$B"/*/; do id=$(basename "$d"); case "$id" in *.scope|*.service) continue;; esac
    cur=$(cat "$d/memory.current" 2>/dev/null) || continue
    printf "%s %s MB limit=%s\n" "${id:0:12}" "$((cur/1048576))" "$(cat "$d/memory.max")"
  done | sort -k2 -nr'
  wsl.exe -d podman-machine-default -e sh -c 'podman ps --format "{{.ID}} {{.Names}}"'  # ID→名稱要用一般使用者

  # 3) 建 C:\Users\<user>\.wslconfig（純 ASCII！），需 wsl --shutdown 生效
  #    [wsl2] memory=24GB / swap=8GB
  #    [experimental] autoMemoryReclaim=gradual / sparseVhd=true

  # 4) 逐容器設上限（現用量 1.5–2 倍）
  wsl.exe -d podman-machine-default -e sh -c '
  export XDG_RUNTIME_DIR=/run/user/1000
  podman update --memory 3g <container>'
  ```
- **驗證**：`memory.max` 從 `max` 變成實際位元組數；`podman inspect <c> --format "{{.HostConfig.Memory}}"` 非 0；套用後無容器被 OOM kill（因為限制都高於當下用量）。
- **預防**：
  - 測試環境（`*-e2e-*`、`*-test-*`）用完就 `podman stop`，不要整天掛著。
  - 記憶體上限要寫進各專案 compose（`mem_limit`），`podman update` **不會活過容器重建**。
  - 新機器裝好 WSL2 就先放 `.wslconfig`，別等到記憶體爆掉。
- **地雷**：
  - **`XDG_RUNTIME_DIR`**：`wsl.exe -d <machine> -e` 這種非登入 shell 拿到的是 WSLg 的 `/mnt/wslg/runtime-dir`，但 crun 狀態在 `/run/user/1000/crun`。不先 `export XDG_RUNTIME_DIR=/run/user/1000`，`podman update` 會全部失敗（`crun: does not exist: open /mnt/wslg/runtime-dir/crun/<id>/status`），`podman stats` 則報 `unknown FS magic on /run/user/1000/netns/...`。
  - `.wslconfig` 內容**只用 ASCII**，非 ASCII 註解不保證能被解析。
  - 記憶體上限是**天花板不是保留**，各容器上限加總可以超過 `.wslconfig` 的 memory；它防的是單一容器暴走，不保證總量。
  - 只設 `--memory` 不設 `--memory-swap` 時，podman 預設允許再用等量 swap（實際天花板 2 倍）。對 DB 容器這樣比較好（寧可慢也不要被殺），要硬上限才把兩者設成相同。
  - MSSQL 容器上限不可低於 2 GB（官方最低需求），壓太低會自己崩。
- **相關文件**：`docs/WSL2-Podman記憶體調校.md`（完整診斷法、16 個容器的用量與上限表、日常維護指令）。

### [2026-08-28] InfoLink 全站 502：compose 服務別名 `web` 在共用 dokploy-network 撞名 ✅ 已驗證結案

- **症狀**：`https://infolink.iexam.win/` 全站 502（網頁/API/`/mcp` 全掛）；`docker ps` 顯示 7 個容器中只有 `infolink-caddy-prod` 是 `Up 4 days (unhealthy)`（healthcheck 連續失敗 11,534 次），其餘 6 個（web/worker/mcp/postgres/redis/meilisearch）全 healthy。
- **環境**：.120（192.168.160.120）Dokploy Compose `infolink-e71vh5`；Caddy 同時掛 `infolink-e71vh5_default`（bridge 172.22.x）與共用 `dokploy-network`（overlay 10.0.1.x）；上游 NPM 經 overlay 別名 `infolink-caddy:80` 進 Caddy，Caddyfile 上游寫 compose service 別名 `web:3000`／`mcp:9092`。
- **診斷路徑**：
  1. 本機 curl → 502，DNS/Cloudflare 正常（排除外層）
  2. `docker ps` → 只有 caddy unhealthy；web 容器 healthy
  3. `docker logs infolink-caddy-prod` → `dial tcp 10.0.1.201:3000 / 10.0.1.51:3000: connect: connection refused`（持續刷）
  4. 容器內 `curl -H "Host: infolink.iexam.win" 127.0.0.1:3001/` → 421（Caddy 本體活著，問題在上游）
  5. `docker exec infolink-web-prod ss -tlnp` → next-server 正常監聽 0.0.0.0:3000（web 沒壞）
  6. IP 清點 → web 只在 bridge 172.22.0.5，Caddy 卻在撥 overlay IP → 矛盾點浮現
  7. `docker network inspect dokploy-network` → **10.0.1.201 = secuarena-y7vgog-web-1**（別的專案的 web！）
  8. caddy 內 `nslookup web`（×4）→ 永遠只回 10.0.1.51＋10.0.1.201（secuarena＋過期 IP），**從不回 172.22.0.5**；`nslookup infolink-web-prod` → 正確回 172.22.0.5
- **根因**：compose 部署會把「service 名」當網路 DNS 別名。InfoLink 的 web 服務別名是 `web`，secuarena（約 4 天前部署、也掛 dokploy-network）的 web 服務別名也叫 `web` → Docker embedded DNS 對同掛兩個網路的 caddy 解析 `web` 時只回 overlay 上的撞名容器（connection refused），不回 infolink 自己的 web。`mcp` 沒撞名所以正常——同一現場的完美對照組。
- **解法**：
  1. 熱修復：備份後改 `.120:/etc/dokploy/compose/infolink-e71vh5/code/docker/Caddyfile`，`reverse_proxy web:3000` → `reverse_proxy infolink-web-prod:3000`（唯一容器名），`docker restart infolink-caddy-prod`
  2. 永久修復：InfoLink repo PR #22（commit 6857dcd）— 上游改 `infolink-web-prod:3000` 與 `infolink-mcp-prod:9092`，merge 後 GitHub Actions → Dokploy 佈署（release `04deb424`）
- **驗證**：站點 200、`/api/health` `{"ok":true}`、`x-infolink-release` = PR #22 merge SHA、caddy healthy、容器內 grep 確認新 Caddyfile 生效。
- **地雷**：
  - **`sed -i` 換 inode**：Caddyfile 是 bind-mount，`sed -i`（rename 覆寫）會讓容器還掛在舊 inode，容器內與 `caddy reload` 都看不到變更。要嘛保留 inode 原地寫入（`cat tmp > file`），要嘛直接 restart 容器重新掛載。
  - compose 目錄（`/etc/dokploy/compose/<app>/code`）是 git clone，只改伺服器端檔案**下次部署會被蓋掉**，永久修復必須進 repo。
- **預防**：
  - **共用網路（dokploy-network）上，反代上游一律用唯一容器名**，不用 `web`/`api`/`db`/`mcp` 等通用 service 名。
  - 新 stack 接 dokploy-network 前，先 `docker network inspect dokploy-network` 確認沒有同名 service。
  - 口訣：**代理容器 unhealthy＋被代理容器 healthy 且 port 有監聽 ＝ DNS/上游解析問題**，先在代理容器內 `nslookup <上游名>`。
- **相關文件**：`docs/InfoLink-502修復報告-20260828.md`（完整報告）、`docs/dokploy/references/reference.md`（變更記錄 2026-08-28 與常見疑難新條目）。

### [2026-08-29] 本機 claude-mem worker daemon（bun）記憶體洩漏吃掉 ~10GB ✅ 已驗證結案

- **症狀**：64GB RAM 的 Windows 機器體感變慢。實體已用 46.8GB、可用僅 17GB，**Commit 達 92.4GB（遠超實體）**，Memory Compression 7GB（壓力徵兆）。
- **環境**：Windows 本機（63.8GB RAM，653 個程序）；兇手是 `~/.codex/plugins/cache/claude-mem-local/claude-mem/13.2.0/scripts/worker-service.cjs --daemon`（bun 執行），自 2026-08-25 04:32 跑到 08-29，Private Memory 長到 **10.6GB**（正常應數百 MB 內）。
- **診斷路徑**：
  1. `Get-CimInstance Win32_OperatingSystem` → Commit 92.4GB / 實體 63.8GB → 有程序「承諾」遠超實際觸碰的記憶體
  2. `Get-Process | Sort PrivateMemorySize64 -Desc`（**看 Private 而非 WorkingSet**）→ bun.exe 9.9GB（WS 卻只有 93MB → 大部分已被壓縮/換出，這就是「可用記憶體看起來還夠但系統慢」的陷阱）
  3. `Get-CimInstance Win32_Process -Filter "Name='bun.exe'"` 看 CommandLine → 鎖定 claude-mem daemon
- **根因**：claude-mem 13.2.0 的 daemon 長期駐留且記憶體只增不減（4 天長到 10.6GB commit），屬插件洩漏問題。
- **解法**：
  ```powershell
  # 確認 CommandLine 後強制終止（砍前必驗證 CommandLine 防誤殺）
  Stop-Process -Id <PID> -Force
  ```
  daemon 下次啟動 codex/claude 時會自動重生（從零開始）。
- **驗證**：無殘留 bun 程序；Commit 92.4GB → ~82GB；vmmemWSL 也從 13.5GB 回落 9.9GB。注意「實體可用」數字不會明顯變化——因為被砍程序的頁面早已被壓縮/換出，釋放的是 Commit 額度與壓縮空間，體感改善來自 Memory Compression 逐漸縮小。
- **預防**：
  - 定期巡檢：`Get-Process | Sort PrivateMemorySize64 -Descending | Select -First 10`，任何 daemon/worker 超 1GB 就查 CommandLine。
  - 口訣：**「實體可用沒少但系統慢 → 先看 Commit 與 Private Memory，別只看工作集」**（換出的程序 WS 極小但 commit 巨大）。
  - 若復發（幾天又長到 GB 級）→ 升級或暫時停用 claude-mem 插件。
  - 同日將 `.wslconfig` memory 24GB→16GB 壓制 WSL 頁快取（見 `docs/WSL2-Podman記憶體調校.md` 2026-08-29）。
- **相關文件**：`docs/WSL2-Podman記憶體調校.md`。

### [2026-08-29] MCP server 孤兒程序堆積：7 個殭屍 headroom-ai 各吃 800MB ✅ 已驗證結案

- **症狀**：64GB 機器實體已用 78%、Commit 84.8GB。Top Private Memory 出現**多個大小幾乎相同（~802MB）的 python.exe**。
- **環境**：Windows 本機。MCP server 隨 CLI session spawn：Claude Code/Codex 用 `headroom-ai`（`headroom.exe mcp serve`）、Claude Desktop 用 `windows-mcp`（各 ~950MB）。
- **診斷路徑**：
  1. `Get-Process | Sort PrivateMemorySize64 -Desc` → 8 個 ~802MB python 齊排列（大小相同＝同一支程式的多個實例）
  2. `Get-CimInstance Win32_Process` 看 CommandLine＋CreationDate → 全是 `headroom.exe mcp serve`，啟動時間 08-25、08-26、08-27×2、08-28×2、08-29——**每天一個，session 結束後沒被清掉**
- **根因**：CLI session 結束時 MCP server 程序未隨之終止，長期累積成孤兒（與 2026-08-11 wsl/podman 孤兒程序堆積同類病）。
- **解法**：逐一以 `CommandLine -like '*headroom*mcp*serve*'` 驗證後 `Stop-Process -Force`；**只保留最新的**（可能還有活躍 session 在連）。
- **驗證**：7 個全數終止、Commit 84.8→79.8GB。注意實體 % 短期持平屬正常——殭屍頁面早已被壓縮/換出（各 WS 僅 ~18MB），釋放的是 Commit 壓力；實體要等 Memory Compression 縮小與 WSL 16GB 上限生效才會明顯下降。
- **預防**：
  - 巡檢口訣：**「一群同名同大小的程序＝殭屍家族，最新的才是活的」**，發現即留一砍餘。
  - 比照 `PodmanPruneStoppedContainers` 排程，可寫個每週清理孤兒 MCP 的排程（比對 CommandLine 含 `mcp serve` 且開機前存在的）。
  - 同日相關案例：claude-mem daemon 洩漏 10.6GB（上一筆）。兩者合併檢視——**本機記憶體吃緊的兩大類：常駐 daemon 洩漏＋孤兒程序堆積**，巡檢順序：Commit 總額 → Private Top 10 → CommandLine 驗證。
- **相關文件**：`docs/WSL2-Podman記憶體調校.md`（同日 memory 24GB→16GB）。

### [2026-08-29] 遠端 OPNsense（Hyper-V）納管全記錄：live media 214 天＋SSH/OTP/VM 卡死三連坑 ✅ 已驗證結案

- **症狀**：新納管的遠端 OPNsense（150.129.38.58，Windows 2019 Hyper-V VM）——(1) 從外部完全無法 SSH 管理；(2) Web UI 帳密正確卻永遠回「Wrong username or password」；(3) 重灌過程 VM 卡「停止中」無法關機。
- **環境**：OPNsense 25.7，Hyper-V VM（WAN 150.129.38.58/30、LAN 192.168.10.1/24、SSH 42322、S2S VPN 對中科 59.126.84.186）。管理路徑：AI 工作機 → 公網直達 WAN IP（VPN phase2 僅涵蓋 192.168.1.0/24，不含本機 160 網段）。
- **診斷路徑與根因（三個獨立坑）**：
  1. **SSH 公鑰認證失敗**：root 的 `PermitRootLogin yes`、authorized_keys 存在（103 bytes）、權限 640/700 全部正常，但仍 Permission denied。**根因：當初提供給使用者貼入 Web UI 的公鑰字串不是本機實際的 key**（憑記憶產生而非 `cat ~/.ssh/id_ed25519.pub`），authorized_keys 裡存了一把本機沒有私鑰的 key。
  2. **Web UI 密碼「錯誤」**：用 curl 模擬登入（GET 取 CSRF → POST 帳密）一直失敗。**根因：root/hiro 帳號都啟用了 TOTP**（config.xml 有 `<otp_seed>`）——只有密碼沒有驗證器代碼，OPNsense 一律回「Wrong username or password」。用 `php -r "password_verify(密碼, config.xml 裡的雜湊)"` 驗證密碼本身其實是對的。
  3. **VM 卡「停止中」**：重灌後重開機時 ISO 未退出 → 又進 live media（RAM 設定重置）→ 在系統運行中抽出 ISO → `vm_fault: pager read error, pid 1 (init)` 狂刷（root 檔案系統就是那片光碟）→ Hyper-V 關機失敗、Stop-VM 報「無法變更狀態」。
- **背景根因（為什麼會走到重灌）**：VM 以 **ISO live media 模式連跑 214 天**（`mount` 可見 root 掛 `iso9660/OPNSENSE_INSTALL` 唯讀光碟、unionfs 疊加），所有設定只存在 RAM；磁碟上其實早有一份 ZFS 安裝但從未從硬碟開機。
- **解法**：
  1. SSH：備份後在 Web UI 把 root 的 Authorized Keys **替換成本機真公鑰**（`cat ~/.ssh/id_ed25519.pub` 取得）
  2. 持久化：console 執行 `opnsense-installer` → Install (ZFS) → da0 → **Import Config = Yes**（保留 RAM 裡全部設定）→ 設 root 密碼 → **`Force Halt`（不要 Reboot，ISO 還掛著）** → Hyper-V 移除 DVD → 開機
  3. 卡死 VM：主機 PowerShell `$guid=(Get-VM -Name OPNsense).Id; Get-CimInstance Win32_Process -Filter "Name='vmwp.exe'" | ? { $_.CommandLine -like "*$guid*" }` 後 `Stop-Process -Force`（⚠️ 依 GUID 比對，主機上還有別台 VM，不可重啟 vmms）
- **驗證**：重開機後 SSH 42322 key 認證直接成功、API 金鑰可用、WAN/LAN/IP 全部回來、`zroot ONLINE`、`mount | grep iso9660` = 0、IPsec 開機 2 秒 INSTALLED。
- **預防／教訓**：
  - **提供公鑰前必先 `cat` 本機 `.pub` 檔**，絕不憑記憶拼字串（本次最大坑，浪費多輪排查）
  - **「帳密正確卻報 Wrong username or password」→ 先查帳號是否綁 OTP**（config.xml 的 `otp_seed`；可用 `php -r password_verify` 對 config.xml 雜湊做決定性驗證）
  - **FreeBSD VM 的 VMConnect console 沒有剪貼簿**（無增強工作階段），長指令只能手打；避免 `!` 開頭（tcsh 歷史展開）。替代：由 host 端 SendKeys、或改用 SSH（修好後）
  - **OPNsense live media 判斷式**：`mount | grep iso9660` ≠0 就是從光碟跑，重開機前必清 ISO；裝完用 Force Halt → 移除 DVD → 再開機
  - RDP 裡的 VMConnect 不在本機視窗清單（在遠端 session 裡）；hyper-v host 的 `Get-VM`/`Stop-VM` 需在 host 的 PowerShell 執行
- **相關文件**：`docs/OPNsense-SRV2019.md`（納管文件、管理方式、變更記錄）；備份 `backups/20260829_OPNsense-*`（config.xml 含機密已 gitignore）。

### [2026-08-30] OPNsense VM（Hyper-V）納管：live media 214 天＋SSH/OTP/vmwp 三連坑 ✅ 已驗證結案

- **症狀**：遠端 OPNsense（150.129.38.58，Win2019 Hyper-V VM）無法 SSH 管理；Web UI/API 可達但帳密正確仍報「Wrong username or password」；重灌過程 VM 卡「停止中」無法關機。
- **環境**：OPNsense 25.7，Spring Boot… 無，FreeBSD + Hyper-V Gen2；SSH 42322 key-only；管理經公網直達 WAN IP。
- **診斷路徑與根因（四個獨立坑）**：
  1. **live media 模式跑了 214 天**：VM 一直從 ISO 光碟開機（`mount` 可見 root 掛 iso9660 唯讀＋unionfs），所有設定只存 RAM。磁碟上其實有舊 ZFS 安裝但從未從硬碟開機。**判定式：`mount | grep iso9660`**
  2. **SSH 公鑰認證失敗**：`PermitRootLogin yes`、authorized_keys 103 bytes、權限 640 全正常仍被拒——**根因是當初提供的公鑰字串根本不是本機的 key**（憑記憶拼字串）。教訓：**提供公鑰前必先 `cat ~/.ssh/id_ed25519.pub` 驗證**
  3. **Web UI 帳密「錯誤」**：root/hiro 都綁了 **TOTP**（config.xml 有 `otp_seed`）——只有密碼沒有驗證器代碼，OPNsense 一律回「Wrong username or password」。**決定性驗證法**：抽出 config.xml 的雜湊用 `php -r password_verify()` 比對
  4. **VM 卡「停止中」**：live 系統運行中抽走 ISO → `vm_fault: pager read error, pid 1 (init)` 狂刷（root 檔案系統就是那片光碟）→ Hyper-V 無法正常關機。解法：殺掉該 VM 的 `vmwp.exe`（依 VM GUID 比對 CommandLine，⚠️ host 上有其他 VM 不可重啟 vmms）
- **解法**：console 執行 `opnsense-installer` → Install ZFS → da0 → **Import Config = Yes**（保留 RAM 裡全部設定）→ `Force Halt`（不要 Reboot，ISO 還掛著）→ Hyper-V 移除 DVD → 開機 → 設定完整回歸（開機 2 秒 S2S VPN 自動重建）
- **驗證**：`zroot ONLINE`、無 iso9660、SSH/API/S2S VPN 全回歸
- **預防**：
  - **FreeBSD/Linux VM 的 VMConnect console 沒有剪貼簿**（無增強工作階段），長指令只能手打；避免 `!` 開頭（tcsh 歷史展開）。替代：修好 SSH 後一切遠端化
  - 重開機前必確認退出 ISO／開機順序硬碟優先
  - sudo -S 管線餵密碼：`echo 'pass' | sudo -S <cmd>`，提示字元會汙染輸出，用 `2>/dev/null` 或 tail 過濾

### [2026-08-30] SSH 隧道綁定位址漂移：Orca 遠端伺服器「沒有啟動」✅ 已驗證結案

- **症狀**：Orca 桌面的遠端伺服器（`ws://192.168.160.110:6768`）顯示斷線，但服務端（`orca-serve` systemd）確認 active running、`localhost:6768` 隧道 curl 也 200。
- **環境**：工作機（LAN IP 192.168.160.110）→ 常駐隧道（排程 `OrcaTunnel-UbuntuDev`，經 win2019-df 跳板）→ ubuntu-dev VM 之 orca-serve。配對端點為 `ws://192.168.160.110:6768`（LAN IP，因 Orca 拒收 loopback 端點）。
- **診斷路徑**：
  1. 服務端 systemd active、workstation IP 未變、`localhost:6768` 200 → 三者皆正常
  2. 測「配對端點本身」：`curl http://192.168.160.110:6768` → **連線拒絕**
  3. 根因：**自癒腳本接手隧道時改綁 loopback**（`-L 6768:...` 未指定綁定位址＝預設 127.0.0.1），而配對端點需要 LAN IP 上有 listener
- **解法**：腳本改為 `-L 192.168.160.110:6768:192.168.10.20:6768`（明確綁 LAN IP）＋殺掉舊隧道重連
- **驗證**：`curl http://192.168.160.110:6768` → 200；Orca 自動重連
- **預防**：
  - **SSH -L 隧道不指定綁定位址＝只綁 loopback**——「localhost 通」不代表「配對位址通」，要測的就是配對用的那個位址
  - 隧道腳本交接/重寫時，逐條比對綁定位址與消費端（桌面 App／瀏覽器）使用的位址一致
  - 另一相關坑：bash 雙引號外傳 Windows 路徑（`-File C:\Users\...`）反斜線會被吃掉，必須加引號
- **相關文件**：`docs/Ubuntu24-Dev.md`（隧道與 Orca 章節）。

### [2026-08-31] WSL2 專案放 Windows 磁碟（9P）：git worktree add 逾時 ✅ 已驗證結案

- **症狀**：Orca 在 WSL2 專案建立工作樹 → `git.addWorktree timed out after 30000ms`。實測該 repo 連 `git status` 在 WSL 內都要 300 秒+（逾時）。
- **環境**：WSL2 Ubuntu-24.04，專案 repo 位於 `/mnt/e/01-Devops/...`（Windows 磁碟經 9P/drvfs 掛載）；repo 上萬檔（含 node_modules 等未忽略目錄）。
- **根因**：WSL2 經 9P 協定存取 Windows 磁碟，每個檔案操作都有跨 VM 通訊開銷——git 需 stat 全部檔案，上萬檔案 = 分鐘級。**與機器效能無關，是協定架構問題**。
- **解法**：把 repo clone 進 WSL 原生 ext4（`git clone /mnt/e/... ~/projects/<repo>`，原始 .git 只循序讀一次 8.6 秒），之後所有 git 操作原生速度。
- **驗證**：clone 13,474 檔 8.6 秒；`git status` 0.34 秒；`git worktree add` 0.1 秒（原 30 秒逾時）。
- **預防**：
  - **WSL 內做 git/建置的專案，repo 必須放 WSL ext4（`~` 下），絕不放 `/mnt/c|d|e`**
  - Windows 側工具需同步時走 GitHub（push/pull），不要兩邊直接共用同一份工作目錄
  - 快速判斷：路徑以 `/mnt/` 開頭的 repo 在 WSL 內 = 會慢
- **相關文件**：案例「WSL 因 wsl/podman 孤兒程序堆積而 hung」（同一台機器的另一種 WSL 病）。
