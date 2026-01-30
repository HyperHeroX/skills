# DevTem Autonomous Operation System

## Overview

This document defines the **Autonomous Operation System** for the DevTem skill, supporting two operating modes:

| Mode | Mechanism | IDE Support |
|------|-----------|-------------|
| **Universal** | Directive-Based Protocol (embedded in SKILL.md) | ✅ All IDEs |
| **Advanced** | Stop Hook (Claude Code Plugin) | Claude Code only |

---

## Universal Mode: Directive-Based Protocol

The Universal Mode embeds loop behavior directly in the AI's execution protocol, requiring no external hooks.

### Core Protocol (AI Must Follow)

```
┌─────────────────────────────────────────────────────────────────┐
│               DIRECTIVE-BASED LOOP PROTOCOL                     │
├─────────────────────────────────────────────────────────────────┤
│                                                                 │
│  ┌──────────────┐     ┌──────────────┐     ┌──────────────┐    │
│  │  PRE-STEP    │ ──► │  EXECUTE     │ ──► │  POST-STEP   │    │
│  │  (Mandatory) │     │  STEP        │     │  (Mandatory) │    │
│  └──────────────┘     └──────────────┘     └──────────────┘    │
│         │                    │                    │             │
│         ▼                    ▼                    ▼             │
│  ┌──────────────┐     ┌──────────────┐     ┌──────────────┐    │
│  │ • Load State │     │ • Role Check │     │ • Analyze    │    │
│  │ • Check CB   │     │ • Execute    │     │ • Update CB  │    │
│  │ • Validate   │     │ • Output     │     │ • Save State │    │
│  └──────────────┘     └──────────────┘     └──────────────┘    │
│                                                  │              │
│                                                  ▼              │
│                                           ┌──────────────┐     │
│                                           │ CONTINUE?    │     │
│                                           │ step<11 → YES│     │
│                                           │ step≥11 → NO │     │
│                                           └──────────────┘     │
│                                                  │              │
│                                    ┌─────────────┴─────────────┐│
│                                    ▼                           ▼│
│                             [AUTO-CONTINUE]              [COMPLETE]│
│                                                                 │
└─────────────────────────────────────────────────────────────────┘
```

### Pre-Step Protocol (MANDATORY)

Before every step, the AI MUST:

```markdown
📍 PRE-STEP CHECKLIST (Execute silently)
1. READ `docs/.devtem/status.json` → Get current_step, current_role
2. READ `docs/.devtem/circuit_breaker.json` → Check state
3. IF circuit_breaker.state == "OPEN":
   → HALT execution
   → REPORT via MCP: "🚫 Circuit breaker OPEN - {reason}"
   → AWAIT user command: "continue" / "reset" / "abort"
4. VALIDATE prerequisites for current step
5. ANNOUNCE: "🎭 Acting as: {current_role} - Step {current_step}"
```

### Post-Step Protocol (MANDATORY)

After every step, the AI MUST:

```markdown
📍 POST-STEP CHECKLIST (Execute silently)
1. ANALYZE step output:
   - Detect completion signals
   - Detect progress indicators
   - Detect stagnation patterns
2. UPDATE `docs/.devtem/circuit_breaker.json`:
   - IF progress detected → Reset no_progress counter
   - IF no progress → Increment counter
   - IF threshold breached → Transition state
3. SAVE state to `docs/.devtem/status.json`:
   - Increment current_step (if progressing)
   - Update current_role (if changing)
   - Update tasks_completed
4. APPEND to `docs/.devtem/session_history.md`
5. CHECK continuation condition:
   - IF current_step <= 11 AND exit_signal == false:
     → IMMEDIATELY CONTINUE to next step (NO user prompt)
   - IF current_step > 11 AND all_tests_pass:
     → SET exit_signal = true
     → OUTPUT completion status
     → HALT and await user
   - IF circuit_breaker.state == "OPEN":
     → HALT and report
```

---

## Advanced Mode: Stop Hook (Claude Code Only)

For Claude Code users, an optional Stop Hook provides **automated enforcement** of the loop protocol.

### How It Works

1. **Stop Hook Location**: `devtem/hooks/stop-hook.sh`
2. **Registration**: `devtem/hooks/hooks.json`
3. **Trigger**: When Claude attempts to exit/stop

### Stop Hook Logic

```bash
# Pseudocode
if no_state_file:
    exit 0  # Allow exit
    
if max_iterations_reached:
    exit 0  # Allow exit
    
if completion_signal_detected:
    exit 0  # Allow exit
    
# Not complete - block exit and feed prompt back
echo '{"decision": "block", "reason": "$PROMPT", "systemMessage": "..."}'
```

### Hook Registration (`hooks.json`)

```json
{
  "name": "devtem",
  "hooks": [
    {
      "type": "Stop",
      "matcher": ".*",
      "hookPath": "./stop-hook.sh"
    }
  ]
}
```

---

## Hook Lifecycle Detail
**Actions**:
1. Update `docs/.devtem/status.json`
2. Append to `progress_tracker.md`
3. Update `session_history.md`

### 7. Exit Condition Check Hook (`hook_check_exit_conditions`)
**Trigger**: Final post-step hook
**Actions**:
1. Check exit_signals.json for completion indicators
2. Verify dual-condition exit gate:
   - `completion_indicators >= 2`
   - `EXIT_SIGNAL == true`
3. If both met → Initiate completion sequence
4. If not met → Continue to next step

## Exit Detection Algorithm

```
FUNCTION should_exit_gracefully():
    
    # Load exit signals
    signals = READ docs/.devtem/exit_signals.json
    
    # Count recent signals
    test_loops = COUNT(signals.test_only_loops)
    done_signals = COUNT(signals.done_signals)
    completion_indicators = COUNT(signals.completion_indicators)
    
    # Check exit conditions (in order of priority)
    
    # 1. Blocked state - never exit
    IF signals.blocked == true:
        RETURN "continue"
    
    # 2. Test saturation (3+ consecutive test-only loops)
    IF test_loops >= 3:
        RETURN "test_saturation"
    
    # 3. Multiple done signals (2+ consecutive)
    IF done_signals >= 2:
        RETURN "completion_signals"
    
    # 4. Strong completion indicators WITH explicit EXIT_SIGNAL
    IF completion_indicators >= 2:
        # Read explicit EXIT_SIGNAL from status
        status = READ docs/.devtem/status.json
        IF status.exit_signal == true:
            RETURN "project_complete"
        ELSE:
            # High confidence but no explicit signal - CONTINUE
            RETURN "continue"
    
    # 5. All steps complete
    IF status.current_step > 11 AND ALL_TASKS_DONE():
        RETURN "workflow_complete"
    
    # Default: continue
    RETURN "continue"
```

## Session Continuity Protocol

### On Conversation Start
```
1. CHECK docs/.devtem/status.json exists
2. IF exists AND exit_signal != true:
     a. LOAD state
     b. CHECK circuit breaker
     c. ANNOUNCE: "🔄 Resuming from Step {N} as {ROLE}"
     d. CONTINUE from last checkpoint
3. ELSE IF exists AND exit_signal == true:
     a. ANNOUNCE: "✅ Previous simulation complete"
     b. ASK user: "Start new simulation?"
4. ELSE:
     a. INITIALIZE new session
     b. CREATE docs/.devtem/ directory
     c. ANNOUNCE: "🆕 Starting new DevTem simulation"
```

### On User "continue" Command
```
1. RESET circuit breaker to CLOSED (if OPEN)
2. CLEAR exit_signal flags
3. RELOAD state
4. PROCEED to next step
```

### On Blocker Detection
```
1. SET status.blocked = true
2. SET status.blocker_reason = description
3. REPORT via MCP with options:
   a. Provide missing information
   b. Skip blocked step
   c. Pause simulation
4. AWAIT user response
5. ON response:
   a. CLEAR blocked status
   b. UPDATE state
   c. CONTINUE
```

## Integration with SKILL.md

The hooks are implicitly executed by following this protocol in SKILL.md:

### Before Each Step
```markdown
**Pre-Step Protocol**:
1. 📂 Load `docs/.devtem/status.json`
2. 🔌 Check circuit breaker state
3. ✅ Validate prerequisites
4. 🚫 If OPEN → Report via MCP and HALT
```

### After Each Step
```markdown
**Post-Step Protocol**:
1. 📊 Analyze step output (completion signals, progress)
2. 🔄 Update circuit breaker counters
3. 💾 Save state to `docs/.devtem/status.json`
4. 🚦 Check exit conditions
5. 📢 If milestone → Report via MCP
6. ➡️ If continue → Proceed to next step
```

## State Files Schema

### docs/.devtem/exit_signals.json
```json
{
  "test_only_loops": [],
  "done_signals": [],
  "completion_indicators": [],
  "last_analysis": {
    "step": 0,
    "has_progress": false,
    "exit_signal": false
  }
}
```

### docs/.devtem/circuit_breaker.json
```json
{
  "state": "CLOSED",
  "consecutive_no_progress": 0,
  "consecutive_same_error": 0,
  "last_progress_step": 0,
  "total_opens": 0
}
```

## Error Recovery

### Circuit Breaker OPEN Recovery
```
1. User says "continue" or "reset circuit breaker"
2. AI:
   a. RESET circuit_breaker.json to CLOSED state
   b. CLEAR consecutive counters
   c. LOG transition to session_history.md
   d. RELOAD state from status.json
   e. ANNOUNCE recovery
   f. PROCEED with execution
```

### Corrupted State Recovery
```
1. AI detects invalid JSON or missing fields
2. AI:
   a. BACKUP corrupted file
   b. INITIALIZE fresh state
   c. WARN user via MCP
   d. OFFER options: restart / manual fix
```
