---
name: devtem-continue
description: "Resume an interrupted DevTem simulation from saved state"
disable-model-invocation: true
---

# Continue DevTem Simulation

Resume an interrupted DevTem development team simulation.

## Usage

```
/devtem-continue
```

## Behavior

1. **Check State**
   - Read `docs/.devtem/status.json`
   - If not found → Report: "No DevTem state found. Use /devtem to start."

2. **Check Completion**
   - If `exit_signal == true` → Report: "Previous simulation complete. Use /devtem for new one."

3. **Check Circuit Breaker**
   - Read `docs/.devtem/circuit_breaker.json`
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
2. Update docs/.devtem/status.json
3. Check circuit_breaker state
4. IF step < 11 AND no blocker → AUTO-CONTINUE to next step
5. IF step = 11 AND tests pass → SET exit_signal = true
```

## Circuit Breaker Reset

If the circuit breaker was OPEN (due to stagnation), this command:
- Resets `state` to "CLOSED"
- Clears `consecutive_no_progress` counter
- Logs the reset in `session_history.md`
