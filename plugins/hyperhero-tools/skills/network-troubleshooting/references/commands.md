# 排障指令速查（references/commands.md）

逐層查詢時可參考本檔。僅列出高頻指令，細節請查官方文件。

## Layer 1（實體）
```bash
# Linux
ethtool eth0              # 速率 / duplex / link
ip -s link show eth0      # 介面錯誤與丟包計數
```
```text
! Cisco IOS
show interfaces Gi1/0/1
show interfaces Gi1/0/1 transceiver detail   # 光模組 dBm
```

## Layer 2（MAC / VLAN / STP）
```text
! Cisco
show mac address-table
show vlan brief
show spanning-tree
show interfaces trunk
show port-security interface Gi1/0/1
```
```bash
# Linux
bridge fdb show
ip -d link show vlan100
```

## Layer 3（IP / Routing）
```bash
ping -c 5 8.8.8.8
mtr -rwbzc 30 8.8.8.8
traceroute -n 8.8.8.8
ip route
ip neigh
```
```text
! Cisco
show ip interface brief
show ip route
show ip arp
```

## Layer 4（Port / Firewall / NAT）
```bash
ss -tulnp
nc -vz host 443
iptables -nvL
nft list ruleset
conntrack -L | head
```

## Layer 7（DNS / HTTP）
```bash
dig +trace example.com
nslookup example.com 1.1.1.1
curl -vk https://example.com
openssl s_client -connect example.com:443 -servername example.com
```

## 流量分析與效能
```bash
tcpdump -ni eth0 'host 10.0.0.1 and port 443' -w /tmp/cap.pcap
iperf3 -c <server>            # 客戶端
iperf3 -s                     # 伺服器
nmap -sS -p- -T4 10.0.0.0/24
snmpwalk -v2c -c public 10.0.0.1 system
```

## 無線（Wi-Fi）
```bash
iw dev wlan0 link
iw dev wlan0 scan | grep -E 'SSID|signal|freq'
wpa_cli status
```
