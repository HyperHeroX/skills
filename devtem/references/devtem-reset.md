---
name: devtem-reset
description: "Reset DevTem simulation state and start fresh"
disable-model-invocation: true
---

# Reset DevTem Simulation

Reset the DevTem simulation state to start fresh.

## Usage

```
/devtem-reset
```

## What It Does

1. **Check existing state**
   - Read `docs/.devtem/status.json` if exists
   - Log current progress before reset

2. **Backup (optional)**
   - If important progress exists, create backup in `docs/.devtem/backup/`

3. **Clear state files**
   - Remove or reinitialize `docs/.devtem/status.json`
   - Reset `docs/.devtem/circuit_breaker.json` to CLOSED
   - Clear `docs/.devtem/session_history.md`

4. **Report**
   - "DevTem state reset. Ready for new simulation with /devtem"

## When to Use

- Simulation stuck in unrecoverable state
- Want to start completely fresh
- Circuit breaker in OPEN state that can't be resolved

## Preserves

- `docs/.devtem/backup/` - Previous state backups
- Any committed code changes
- Documentation generated during simulation
