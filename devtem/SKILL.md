---
name: devtem
description: Simulates a complete software development team workflow. Use when developing features end-to-end, from requirements to deployment, with autonomous 11-step process including Product Manager, Architect, Dev Lead, Engineers, QA, and CI/CD roles.
argument-hint: <feature-name>
disable-model-invocation: true
---

# DevTem - Development Team Simulation

Simulate a complete software development lifecycle with **autonomous continuous operation**. Execute 11 sequential steps from requirement gathering to deployment, with role-based execution and state persistence.

## Quick Start

```
/devtem "My Feature Name"
```

## Core Workflow (11 Steps)

| Phase | Steps | Roles |
|-------|-------|-------|
| **Planning** | 1-5 | Product Manager → Architect → Analyst → PM → Dev Lead |
| **Implementation** | 6-8 | DB Architect → Backend → Frontend |
| **Verification** | 9-11 | QA → Iteration Check → CI/CD |

For detailed step instructions, see [lib/workflow.md](lib/workflow.md).

## Autonomous Loop Protocol

After each step completion, the AI MUST:

1. Update `docs/.devtem/status.json`
2. Check circuit breaker state
3. If `current_step <= 11` AND `exit_signal == false` → **AUTO-CONTINUE**
4. If blocked → Report via MCP and await user input

## State Management

| File | Purpose |
|------|---------|
| `docs/.devtem/status.json` | Current step, role, tasks |
| `docs/.devtem/circuit_breaker.json` | Stagnation protection |
| `docs/.devtem/session_history.md` | Audit log |

## Non-Negotiable Directives

1. **Serena MCP First**: Use `mcp_oraios_serena_*` for code exploration
2. **MCP-Only Communication**: Report via `mcp_user-feedback_collect_feedback`
3. **Strict Formatting**: Follow `reference/FormatSample` templates
4. **UI/UX Standards**: Apply `ui-ux-pro-max` skill for frontend work
5. **Pre-Commit Checks**: Build + Tests must pass before commit

## Completion Signal

When all 11 steps complete and tests pass:

```
---DEVTEM_STATUS---
STATUS: COMPLETE
STEPS_COMPLETED: 11/11
EXIT_SIGNAL: true
---END_DEVTEM_STATUS---
```

## Additional Resources

- Detailed workflow: [lib/workflow.md](lib/workflow.md)
- Commands reference: [lib/commands.md](lib/commands.md)
- Hook system: [lib/hooks.md](lib/hooks.md)
- Circuit breaker: [lib/circuit_breaker.json](lib/circuit_breaker.json)
- Role definitions: [reference/JobDescription/](reference/JobDescription/)
- Document templates: [reference/FormatSample/](reference/FormatSample/)
- State templates: [reference/StateTemplate/](reference/StateTemplate/)
