---
name: devteam
description: "Start devteam development team simulation for a feature"
argument-hint: "FEATURE_NAME"
disable-model-invocation: true
---

# devteam - Development Team Simulation

Start a complete development team simulation that autonomously executes all 11 steps from requirement gathering to deployment.

## Usage

```
/devteam "My Feature Name"
```

## What Happens

1. **Initialization**
   - Creates `docs/.devteam/status.json` (workflow state)
   - Creates `docs/.devteam/circuit_breaker.json` (safety mechanism)
   - Creates `docs/.devteam/session_history.md` (audit log)

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
| `docs/.devteam/status.json` | Current step, role, tasks |
| `docs/.devteam/circuit_breaker.json` | Stagnation protection |
| `docs/.devteam/session_history.md` | Transition log |
| `docs/.devteam/progress_tracker.md` | Detailed progress |

## Autonomous Loop Protocol

After this command, the AI will:

```
📍 LOOP PROTOCOL (Embedded in AI Behavior)
1. Execute current step according to role
2. Update docs/.devteam/status.json
3. Check circuit_breaker state
4. IF step < 11 AND no blocker → AUTO-CONTINUE to next step
5. IF step = 11 AND tests pass → SET exit_signal = true
6. IF circuit_breaker = OPEN → HALT, await user input
```

## Session Resume

If a session is interrupted, the state is preserved. Start a new session and the AI will automatically:

1. Detect existing `docs/.devteam/status.json`
2. Announce: "🔄 Resuming from Step {N} as {ROLE}"
3. Continue from where it left off

## Safety Mechanisms

- **Circuit Breaker**: Halts after 3 consecutive no-progress cycles
- **State Validation**: Checks for corrupted state and recovers
- **Exit Signal**: Explicit completion marker prevents premature exit

```
---devteam_STATUS---
STATUS: COMPLETE
STEPS_COMPLETED: 11/11
EXIT_SIGNAL: true
---END_devteam_STATUS---
<promise>devteam_COMPLETE</promise>
```

## Example

```bash
/devteam-loop "User Authentication Feature" --max-iterations 50
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

To cancel an active devteam loop:

```bash
/cancel-devteam
```
