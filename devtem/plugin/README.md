# DevTem Claude Code Plugin (Advanced Mode)

This directory contains **Claude Code specific** plugin features that provide automated enforcement of the DevTem loop protocol.

## ⚠️ Compatibility Notice

| Component | Support |
|-----------|---------|
| `stop-hook.sh` | Claude Code only |
| `hooks.json` | Claude Code only |

These files are **NOT required** for the DevTem skill to function. They provide **optional enhancement** for Claude Code users.

## How to Enable

### Option 1: Plugin Directory Flag

```bash
claude --plugin-dir ./devtem/plugin
```

### Option 2: Install as Plugin

Copy this directory to your Claude Code plugins location:

```bash
# macOS/Linux
cp -r ./devtem/plugin ~/.claude/plugins/devtem

# Windows
xcopy /E /I .\devtem\plugin %USERPROFILE%\.claude\plugins\devtem
```

## What It Does

The Stop Hook intercepts Claude's exit attempts and:

1. Checks if `docs/.devtem/status.json` indicates incomplete simulation
2. If NOT complete → Blocks exit and feeds the prompt back
3. If complete (all 11 steps + exit_signal=true) → Allows exit

## Without Plugin (Universal Mode)

Without this plugin, DevTem still works using the **Directive-Based Protocol** embedded in SKILL.md. The AI follows the loop protocol through instructions rather than automated hooks.

The main difference:
- **With Plugin**: Exit attempts are automatically blocked
- **Without Plugin**: AI must self-enforce the continuation protocol

## Files

| File | Purpose |
|------|---------|
| `stop-hook.sh` | Stop Hook script that intercepts exit |
| `hooks.json` | Hook registration for Claude Code |
| `README.md` | This documentation |
