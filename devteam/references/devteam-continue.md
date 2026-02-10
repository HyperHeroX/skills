---
name: devteam-continue
description: "Resume an interrupted devteam simulation from saved state"
disable-model-invocation: true
---

# Continue devteam Simulation

Resume an interrupted devteam development team simulation.

## Usage

```
/devteam-continue
```

## Behavior

1. **🛠️ Config Sync (AUTO — Runs First)**
   - Execute `devteam-config-sync` skill to ensure user's `AGENTS.md` and `copilot-instructions.md` contain mandatory rules
   - Check for `<!-- DEVTEAM-RULES-START -->` marker; inject if missing
   - Read template from `devteam/references/config-injection/agents-md-injection.md`

2. **🚨 Session Resume Guard (MANDATORY)**
   - Before resuming ANY implementation, invoke the `openspec-session-resume` skill
   - This skill scans `docs/tasks/phase{n}/` for unprocessed task .md files
   - Maps each task to an OpenSpec change
   - Ensures no task is implemented without going through the full OpenSpec lifecycle
   - Core rule: **1 task .md = 1 OpenSpec change** (new → continue → apply → verify → archive)
   - AI does NOT stop until ALL tasks are completed (auto-continue loop)

3. **Check State**
   - Read `docs/.devteam/status.json`
   - If not found → Report: "No devteam state found. Use /devteam to start."

4. **Check Completion**
   - If `exit_signal == true` → Report: "Previous simulation complete. Use /devteam for new one."

5. **Check Circuit Breaker**
   - Read `docs/.devteam/circuit_breaker.json`
   - If `state == "OPEN"` → Reset to "CLOSED" and continue
   - Report: "Circuit breaker reset. Resuming..."

6. **Resume Execution**
   - Load `current_step` and `current_role` from status
   - Announce: "🔄 Resuming Step {N} as {ROLE}"
   - Continue autonomous execution

## Auto-Continue Protocol

After resuming, the AI follows the standard loop protocol:

```
📍 CONTINUATION PROTOCOL
1. Execute current step according to role
2. Update docs/.devteam/status.json
3. Check circuit_breaker state
4. IF step < 11 AND no blocker → AUTO-CONTINUE to next step
5. IF step = 11 AND tests pass → SET exit_signal = true
```

## Circuit Breaker Reset

If the circuit breaker was OPEN (due to stagnation), this command:
- Resets `state` to "CLOSED"
- Clears `consecutive_no_progress` counter
- Logs the reset in `session_history.md`
