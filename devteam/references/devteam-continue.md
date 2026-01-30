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

1. **Check State**
   - Read `docs/.devteam/status.json`
   - If not found → Report: "No devteam state found. Use /devteam to start."

2. **Check Completion**
   - If `exit_signal == true` → Report: "Previous simulation complete. Use /devteam for new one."

3. **Check Circuit Breaker**
   - Read `docs/.devteam/circuit_breaker.json`
   - If `state == "OPEN"` → Reset to "CLOSED" and continue
   - Report: "Circuit breaker reset. Resuming..."

4. **Resume Execution**
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
