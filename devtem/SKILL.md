---
name: devtem
description: Simulates a complete software development team workflow. Use when developing features end-to-end, from requirements to deployment, with autonomous 11-step process including Product Manager, Architect, Dev Lead, Engineers, QA, and CI/CD roles. Triggers include commands like /devtem, devtem, or requests for full development workflow simulation with team roles.
---

# DevTem - Development Team Simulation

Simulate a complete software development lifecycle with **autonomous continuous operation**. Execute 11 sequential steps from requirement gathering to deployment, with role-based execution and state persistence.

**Key Features:**
- 📊 **State Management System** - Persistent state files for session continuity
- 🔍 **Intelligent Exit Detection** - Dual-condition exit gate (indicators + explicit signal)
- 🧠 **Response Analysis** - Pattern-based completion and stagnation detection
- ↩️ **Session Continuity** - Seamless resume across conversations
- ⚡ **Autonomous Loop Protocol** - Self-continuing execution until task completion

## Quick Start

```
/devtem "My Feature Name"
```

## ⚡ Autonomous Continuous Operation

This skill implements an **Autonomous Loop Protocol** that works across all IDEs supporting the Agent Skills standard.

### Operating Modes

| Mode | Scope | Mechanism | IDE Support |
|------|-------|-----------|-------------|
| **Universal** | Core | State Files + Directive Protocol | ✅All IDEs |
| **Advanced** | Plugin | Stop Hook (optional) | Claude Code only |

### Continuation Protocol (CRITICAL)

**After EVERY step completion, the AI MUST:**

```
📍 STEP COMPLETION CHECK (Mandatory Protocol)
1. READ `docs/.devtem/status.json`
2. IF current_step <= 11 AND exit_signal == false:
   →INCREMENT current_step
   →SAVE state
   →IMMEDIATELY CONTINUE to next step
   →DO NOT wait for user input
3. IF current_step > 11 AND all_tests_pass:
   →SET exit_signal = true
   →OUTPUT completion status
   →HALT and await user
```

### Circuit Breaker Protection

When stagnation detected (same error 3+ times):
```
⛔ CIRCUIT BREAKER TRIGGERED
- HALT autonomous execution
- REPORT via MCP: "Circuit breaker OPEN - {reason}"
- AWAIT user input: "continue" / "reset" / "abort"
```

## 🔁 Core Workflow (11 Steps)

| Phase | Steps | Roles |
|-------|-------|-------|
| **Planning** | 1-5 | Product Manager → Architect → Analyst → PM → Dev Lead |
| **Implementation** | 6-8 | DB Architect → Backend → Frontend |
| **Verification** | 9-11 | QA → Iteration Check → CI/CD |

For detailed step-by-step instructions, see [references/workflow.md](references/workflow.md).

## 📁 State Management

| File | Purpose |
|------|---------|
| `docs/.devtem/status.json` | Current step, role, tasks |
| `docs/.devtem/circuit_breaker.json` | Stagnation protection |
| `docs/.devtem/session_history.md` | Audit log |
| `docs/.devtem/progress_tracker.md` | Detailed progress |

State templates available at [references/StateTemplate/](references/StateTemplate/).

## 🚨 Non-Negotiable Directives

1. **Serena MCP First**: Use `mcp_oraios_serena_*` for all code exploration
2. **MCP-Only Communication**: Report via `mcp_user-feedback_collect_feedback`
3. **Strict Formatting**: Follow `references/FormatSample/` templates
4. **UI/UX Standards**: Apply `ui-ux-pro-max` skill for frontend work
5. **Pre-Commit Checks**: Build + Tests must pass before commit
6. **Session Recovery**: Always check `docs/.devtem/status.json` on resume

## ✅ Completion Signal

When all 11 steps complete and tests pass, output:

```
---DEVTEM_STATUS---
STATUS: COMPLETE
STEPS_COMPLETED: 11/11
TASKS_REMAINING: 0
TESTS_PASSING: 100%
EXIT_SIGNAL: true
---END_DEVTEM_STATUS---
```

## 🔗 Quick Commands

| Command | Action |
|---------|--------|
| `/devtem <feature>` | Start new simulation |
| `/devtem-continue` | Resume from last state |
| `/devtem-reset` | Clear state and restart |
| `status` | Output current status |
| `skip to step N` | Jump to step N |
| `pause` | Save state and stop |

For detailed command documentation, see [references/commands.md](references/commands.md).

## 📚 Additional Resources

### Core Documentation
- **Detailed Workflow**: [references/workflow.md](references/workflow.md)
- **Commands Reference**: [references/commands.md](references/commands.md)
- **Hook System**: [references/hooks.md](references/hooks.md)

### Configuration
- **Circuit Breaker**: [references/circuit_breaker.json](references/circuit_breaker.json)
- **Response Analyzer**: [references/response_analyzer.json](references/response_analyzer.json)

### Reference Materials
- **Role Definitions**: [references/JobDescription/](references/JobDescription/)
- **Document Templates**: [references/FormatSample/](references/FormatSample/)
- **State Templates**: [references/StateTemplate/](references/StateTemplate/)
- **Environment Info**: [references/Environment/](references/Environment/)

### Plugin (Claude Code Only)
- **Stop Hook**: [plugin/stop-hook.sh](plugin/stop-hook.sh)
- **Hook Config**: [plugin/hooks.json](plugin/hooks.json)
