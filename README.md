# HyperHeroX Skills Marketplace

Claude Code plugin marketplace，包含完整軟體開發生命週期的技能套件。

## 安裝

```bash
# 在 Claude Code 中新增此 marketplace
/plugin marketplace add <owner>/HyperHeroX-skills

# 安裝 plugins
/plugin install hyperhero-workflow@hyperhero-skills
/plugin install hyperhero-tools@hyperhero-skills
```

## Plugins

### hyperhero-workflow — 開發流程核心

整合 devteam 團隊模擬、AutoDEV 全流程、OpenSpec SDD 驅動開發，完整涵蓋規劃到部署。

| Skills | 說明 |
|--------|------|
| **devteam** | 11 步驟開發團隊模擬（需求 → 架構 → 分析 → 規劃 → DB → 拆任務 → 開發 → 測試 → 部署） |
| **autodev** | 10 階段全流程（規劃 → OpenSpec → 資安 → Code Review → 測試 → 部署 → UI → 視覺 → 優化 → 驗收） |
| **openspec-*** | OpenSpec SDD 完整生命週期（12 skills：explore → new → continue → ff → apply → verify → archive） |
| **devteam-config-sync** | 自動注入 devteam/OpenSpec 規則到專案設定 |
| **openspec-session-resume** | 會話恢復時的強制 OpenSpec 流程閘門 |

**指令：** `/devteam`, `/devteam-continue`, `/devteam-reset`

### hyperhero-tools — 輔助工具

E2E 瀏覽器測試、使用手冊生成、Ralph Loop 自動迭代。

| Skills | 說明 |
|--------|------|
| **e2e-ui-testing** | 瀏覽器 E2E 測試與視覺回歸驗證 |
| **user-guide-creator** | 含截圖的使用手冊，支援 Markdown + DOCX 匯出 |
| **ralph-loop** | 持續自我引用 AI 迴圈，用於迭代開發 |

**指令：** `/ralph-loop`, `/cancel-ralph`, `/ralph-help`

## 跨平台支援

所有 hook scripts 已從 bash 改寫為 Node.js（`.mjs`），支援 Windows (PowerShell)、Linux、macOS。

## 目錄結構

```
skills/
├── .claude-plugin/marketplace.json
├── plugins/
│   ├── hyperhero-workflow/         # 開發流程核心
│   │   ├── skills/ (15 skills)
│   │   ├── commands/ (3 commands)
│   │   ├── scripts/devteam-stop-hook.mjs
│   │   └── references/
│   └── hyperhero-tools/            # 輔助工具
│       ├── skills/ (3 skills)
│       ├── commands/ (3 commands)
│       └── scripts/ (ralph-*.mjs, md2docx.py)
├── AGENTS.md
└── README.md
```

## 驗證

```bash
/plugin validate .
```

## License

MIT
