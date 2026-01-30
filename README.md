# HyperHeroX Skills Repository

本倉庫包含可跨 IDE 使用的 Agent Skills，遵循 [Agent Skills](https://agentskills.io/) 開放標準。

## 📦 Skills

### devteam - Development Team Simulation

模擬完整軟體開發團隊的工作流程，包含 11 個步驟從需求收集到部署。

| 特性 | 說明 |
|------|------|
| 位置 | `devteam/` |
| 指令 | `/devteam`, `/devteam-continue`, `/devteam-reset` |
| 模式 | Universal（所有 IDE）+ Advanced（Claude Code Plugin）|

#### 快速開始

```bash
# 啟動開發團隊模擬
/devteam "我的功能名稱"

# 繼續中斷的模擬
/devteam-continue

# 重置狀態
/devteam-reset
```

#### 詳細文件

- [SKILL.md](devteam/SKILL.md) - 主技能定義
- [references/hooks.md](devteam/references/hooks.md) - 自主運作系統說明

---

## 🛠️ IDE 相容性

| IDE | Skills 支援 | 進階 Plugin |
|-----|-------------|-------------|
| VS Code + Copilot | ✅ | ❌ |
| Claude Code | ✅ | ✅ |
| Cursor | ✅ | ❌ |
| Windsurf | ✅ | ❌ |

---

## 📁 目錄結構

```
skills/
├── devteam/                 # devteam 技能
│   ├── SKILL.md            # 主技能定義
│   ├── references/         # 參考資料（含指令、工作流程）
│   └── plugin/             # Claude Code 專屬
├── .github/                # GitHub 設定與 Copilot 指令
├── docs/                   # 專案文件
├── openspec/               # OpenSpec 規範
└── README.md               # 本文件
```

---

## 🔧 安裝

### Personal Skills（個人使用）

```bash
# macOS/Linux
cp -r devteam ~/.claude/skills/

# Windows
xcopy /E /I devteam %USERPROFILE%\.claude\skills\devteam
```

### Project Skills（專案級）

```bash
cp -r devteam .claude/skills/
```

---

## 📖 相關文件

- [AI Instructions](.github/copilot-instructions.md) - 開發規範
- [AGENTS.md](AGENTS.md) - Agent 行為規範
- [Environment](docs/Environment/env.md) - 環境資訊

---

## 📜 License

MIT
