---
name: devteam-reset
description: "Reset devteam simulation state and start fresh"
disable-model-invocation: true
---

# Reset devteam Simulation

Reset the devteam simulation state to start fresh.

## Usage

```
/devteam-reset
```

## What It Does

1. **Check existing state**
   - Read `docs/.devteam/status.json` if exists
   - Log current progress before reset

2. **Backup (optional)**
   - If important progress exists, create backup in `docs/.devteam/backup/`

3. **Clear state files**
   - Remove or reinitialize `docs/.devteam/status.json`
   - Reset `docs/.devteam/circuit_breaker.json` to CLOSED
   - Clear `docs/.devteam/session_history.md`

4. **Report**
   - "devteam state reset. Ready for new simulation with /devteam"

## When to Use

- Simulation stuck in unrecoverable state
- Want to start completely fresh
- Circuit breaker in OPEN state that can't be resolved

## Preserves

- `docs/.devteam/backup/` - Previous state backups
- Any committed code changes
- Documentation generated during simulation
