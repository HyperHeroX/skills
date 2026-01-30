---
name: devtem
description: "Start DevTem development team simulation for a feature"
argument-hint: "FEATURE_NAME"
disable-model-invocation: true
---

# DevTem - Development Team Simulation

Start a complete development team simulation that autonomously executes all 11 steps from requirement gathering to deployment.

## Usage

```
/devtem "My Feature Name"
```

## What Happens

1. **Initialization**
   - Creates `docs/.devtem/status.json` (workflow state)
   - Creates `docs/.devtem/circuit_breaker.json` (safety mechanism)
   - Creates `docs/.devtem/session_history.md` (audit log)

2. **Autonomous Execution**
   - Starts at Step 1 (Product Manager - Requirements)
   - Executes each step according to role
   - Auto-continues to next step after completion
   - Updates state files after each step

3. **Completion**
   - All 11 steps complete
   - All tests pass
   - Outputs `EXIT_SIGNAL: true`

## State Files

| File | Purpose |
|------|---------|
| `docs/.devtem/status.json` | Current step, role, tasks |
| `docs/.devtem/circuit_breaker.json` | Stagnation protection |
| `docs/.devtem/session_history.md` | Transition log |
| `docs/.devtem/progress_tracker.md` | Detailed progress |

## Autonomous Loop Protocol

After this command, the AI will:

```
📍 LOOP PROTOCOL (Embedded in AI Behavior)
1. Execute current step according to role
2. Update docs/.devtem/status.json
3. Check circuit_breaker state
4. IF step < 11 AND no blocker → AUTO-CONTINUE to next step
5. IF step = 11 AND tests pass → SET exit_signal = true
6. IF circuit_breaker = OPEN → HALT, await user input
```

## Session Resume

If a session is interrupted, the state is preserved. Start a new session and the AI will automatically:

1. Detect existing `docs/.devtem/status.json`
2. Announce: "🔄 Resuming from Step {N} as {ROLE}"
3. Continue from where it left off

## Safety Mechanisms

- **Circuit Breaker**: Halts after 3 consecutive no-progress cycles
- **State Validation**: Checks for corrupted state and recovers
- **Exit Signal**: Explicit completion marker prevents premature exit

```
---DEVTEM_STATUS---
STATUS: COMPLETE
STEPS_COMPLETED: 11/11
EXIT_SIGNAL: true
---END_DEVTEM_STATUS---
<promise>DEVTEM_COMPLETE</promise>
```

## Example

```bash
/devtem-loop "User Authentication Feature" --max-iterations 50
```

Claude will:
- Act as Product Manager → gather requirements
- Act as System Architect → design system
- Act as System Analyst → analyze system
- Act as Project Manager → plan project
- Act as Dev Lead → break down tasks
- Act as Database Architect → design database
- Act as Backend Engineer → implement APIs
- Act as Frontend Engineer → implement UI
- Act as QA Engineer → test and verify
- Iterate on bugs if found
- Act as CI/CD Engineer → deploy
- Output completion promise when done

## Cancel Loop

To cancel an active DevTem loop:

```bash
/cancel-devtem
```
