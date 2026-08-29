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

1. **AI Agent Standard v4.4 Contract (Step -1 — MANDATORY)**
   - Loads `references/ai-agent-development-standard-v4.4-integration.md`
   - Records standard version `4.4.0`, baseline digest, lifecycle／SSDLC／risk, direct／indirect Requirement IDs, source conditions, and required evidence
   - Blocks product-code writes when the baseline, policy, Requirement mapping, or required gate cannot be verified

2. **Config Sync (Step 0 — AUTO)**
   - Runs `devteam-config-sync` to inject mandatory rules into user's `AGENTS.md` and `copilot-instructions.md`
   - Checks for `<!-- DEVTEAM-RULES-START -->` marker; injects if missing
   - Reads template from `devteam/references/config-injection/agents-md-injection.md`

3. **Initialization**
   - Creates `docs/.devteam/status.json` (workflow state)
   - Creates `docs/.devteam/circuit_breaker.json` (safety mechanism)
   - Creates `docs/.devteam/session_history.md` (audit log)
   - Initializes the v4.4 requirement contract fields in `status.json`

4. **Autonomous Execution**
   - Starts at Step 1 (Product Manager - Requirements)
   - Executes each step according to role
   - Auto-continues to next step after completion
   - Updates state files after each step

5. **Completion**
   - All 11 steps complete
   - All tests pass
   - Independent Requirement Conformance passes for all direct／indirect Requirement IDs with the same candidate revision and baseline digest
   - Outputs `EXIT_SIGNAL: true`

## State Files

| File | Purpose |
|------|---------|
| `docs/.devteam/status.json` | Current step, role, tasks |
| `docs/.devteam/circuit_breaker.json` | Stagnation protection |
| `docs/.devteam/session_history.md` | Transition log |
| `docs/.devteam/progress_tracker.md` | Detailed progress |

The `status.json` contract section must retain `standard_version`, `baseline_digest`, lifecycle／SSDLC／risk, direct／indirect Requirement IDs, candidate revision, and `requirement_conformance`.

## Autonomous Loop Protocol

After this command, the AI will:

```
📍 LOOP PROTOCOL (Embedded in AI Behavior)
1. Execute current step according to role
2. Update docs/.devteam/status.json
3. Check circuit_breaker state
4. IF step < 11 AND no blocker → AUTO-CONTINUE to next step
5. IF step = 11 AND tests, reviews, scans, and Requirement Conformance pass → SET exit_signal = true
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
REQUIREMENT_BASELINE_DIGEST: 77478e2a918e6dc7984f79534abcd5415cdbb07bb2c7de2346aceb03e5484f4f
REQUIREMENT_CONFORMANCE: PASS
---END_devteam_STATUS---
<promise>devteam_COMPLETE</promise>
```

## Example

```bash
/devteam-loop "User Authentication Feature" --max-iterations 50
```

Claude will:
- Act as Product Manager → gather requirements
- Act as System Architect → design system architecture
- Act as System Analyst → analyze system
- Act as Project Manager → plan project
- Act as Database Architect → design database schema
- Act as Dev Lead (資深全端工程師, 25年經驗, CISSP) → break down all tasks to finest granularity
- Act as Backend Engineer → implement database migrations and APIs
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
