---
name: devteam
description: |
  Development Team Simulation Skill for end-to-end software development. Use when the user asks to develop, implement, build, or deploy a feature; requests a development-team or dev-team workflow; invokes `/devteam`; or wants a systematic, enterprise-grade process with planning, coding, testing, and verification. Always apply the bundled AI Agent Engineering and Secure Development Standard v4.4 and its 57 immutable mandatory requirements.

  Runs an 11-step workflow covering requirements, architecture, analysis, planning, database, task breakdown, backend, frontend, testing, iteration, and deployment. Persists session state in `docs/.devteam/`, applies role-based execution, enforces quality checks, and integrates with available development tools.
---

# devteam - Development Team Simulation

Simulate a complete software development lifecycle with **autonomous continuous operation**. Execute 11 sequential steps from requirement gathering to deployment, with role-based execution and state persistence.

**Key Features:**
- 📊 **State Management System** - Persistent state files for session continuity
- 🔍 **Intelligent Exit Detection** - Dual-condition exit gate (indicators + explicit signal)
- 🧠 **Response Analysis** - Pattern-based completion and stagnation detection
- ↩️ **Session Continuity** - Seamless resume across conversations
- ⚡ **Autonomous Loop Protocol** - Self-continuing execution until task completion

## Quick Start

```
/devteam "My Feature Name"
```

## AI Agent Engineering Standard v4.4 Contract (MANDATORY)

Before any workflow step or write, load and follow [the v4.4 integration contract](../../references/ai-agent-development-standard-v4.4-integration.md). It routes the complete source bundle, including the immutable baseline, 57 Requirement IDs, profiles, policies, schemas, lifecycle guidance, templates, and validator.

Record `standard_version: 4.4.0` and baseline digest `77478e2a918e6dc7984f79534abcd5415cdbb07bb2c7de2346aceb03e5484f4f` in the task/preflight and carry them through the same candidate revision. All 57 requirements remain `MUST`; runtime feature switches may change runtime behavior but never remove implementation, testing, documentation, or conformance obligations.

### Step -1: Requirement Contract Preflight

Before Step 0 Config Sync:

1. Load the immutable requirement baseline, the two Always-on general Profiles, the target project's protected instructions/policies, the lifecycle/task/security artifacts, and Requirement-ID-specific Profiles.
2. Record task ID, lifecycle/SSDLC stage, risk, direct/indirect Requirement IDs, verbatim source conditions, allowed/forbidden paths, trust boundaries, reusable modules, pattern decision, test/review/scan/conformance plan, rollback, monitoring, and stop conditions.
3. If the digest, source condition, Requirement ID mapping, protected policy, or required evidence cannot be verified, set the task to `blocked` and do not write product code.

## 🛠️ Step 0: Config Sync (AUTO — Runs After Requirement Preflight)

Before ANY workflow step, the AI **MUST** run the `devteam-config-sync` skill to ensure the user's `AGENTS.md` and `copilot-instructions.md` contain the mandatory devteam/OpenSpec rules.

**What it does:**
1. Checks for `<!-- DEVTEAM-RULES-START -->` marker in user's files
2. If missing → reads template from `../../references/config-injection/agents-md-injection.md`
3. Appends the rules block to the user's files
4. If marker exists but version is outdated → replaces with updated version

**This step is AUTOMATIC and NON-NEGOTIABLE.** The AI must perform it silently at the start of every `/devteam`, `/devteam-continue`, or session resume.

See `devteam-config-sync` skill for full details.

## 🚨 Session Resume Guard (MANDATORY)

When resuming from a conversation summary or when pending tasks exist, the AI **MUST** perform session resume processing BEFORE any implementation work. This is a non-negotiable gate.

**Detection (three-tier — see `../../references/openspec-integration.md`):**
1. **Tier 1** — If `openspec-session-resume` skill is installed → invoke via Skill tool
2. **Tier 2** — If OpenSpec CLI is installed → run `openspec status` + manually scan pending tasks
3. **Tier 3** — Scan `docs/tasks/phase{n}/` for unprocessed task .md files and resume accordingly

**Core Rules (apply regardless of tier):**
- Each task .md file (created by Dev Lead in Step 6) = one independent OpenSpec change lifecycle
- Full lifecycle per task: `new → continue/ff → apply → verify → archive`
- Process tasks sequentially; complete one before starting the next
- AI does NOT stop until ALL tasks are completed
- Never modify source code without an active OpenSpec change

For full Tier mechanics, see `../../references/openspec-integration.md`.

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
1. READ `docs/.devteam/status.json`
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
| **Planning** | 1-6 | Product Manager → Architect → Analyst → PM → DB Architect → Dev Lead |
| **Implementation** | 7-8 | Backend → Frontend |
| **Verification** | 9-11 | QA → Iteration Check → CI/CD |

Every step must preserve Requirement IDs and produce evidence for the current lifecycle stage. Use the stage-by-stage bindings in the integration contract for architecture, security, data, management, interface, AI, testing, and versioning requirements.

For detailed step-by-step instructions, see [references/workflow.md](../../references/workflow.md).

## 📁 State Management

| File | Purpose |
|------|---------|
| `docs/.devteam/status.json` | Current step, role, tasks |
| `docs/.devteam/circuit_breaker.json` | Stagnation protection |
| `docs/.devteam/session_history.md` | Audit log |
| `docs/.devteam/progress_tracker.md` | Detailed progress |

The status record must also retain the v4.4 standard version, baseline digest, direct/indirect Requirement IDs, candidate revision, and Requirement Conformance status. Use the source schemas/examples for detailed task, review, scan, lifecycle, and conformance manifests.

State templates available at [references/StateTemplate/](../../references/StateTemplate/).

## 🚨 Non-Negotiable Directives

1. **v4.4 Requirement Contract**: Load the integration contract and preserve the 57 immutable requirements and baseline digest
2. **Serena MCP First**: Use `mcp_oraios_serena_*` for all code exploration
3. **MCP-Only Communication**: Report via `mcp_user-web-feed_collect_feedback`
4. **Strict Formatting**: Follow `../../references/FormatSample/` templates
5. **UI/UX Standards**: Apply `ui-ux-pro-max` skill for frontend work
6. **Pre-Commit Checks**: Build + Tests + required reviews/scans/conformance must pass before commit
7. **Session Recovery**: Always check `docs/.devteam/status.json` and its requirement contract fields on resume

## ✅ Completion Signal

When all 11 steps complete and tests pass, output:

```
---devteam_STATUS---
STATUS: COMPLETE
STEPS_COMPLETED: 11/11
TASKS_REMAINING: 0
TESTS_PASSING: 100%
REQUIREMENT_BASELINE_DIGEST: 77478e2a918e6dc7984f79534abcd5415cdbb07bb2c7de2346aceb03e5484f4f
REQUIREMENT_CONFORMANCE: PASS
EXIT_SIGNAL: true
---END_devteam_STATUS---
```

## 🔗 Quick Commands

| Command | Action |
|---------|--------|
| `/devteam <feature>` | Start new simulation |
| `/devteam-continue` | Resume from last state |
| `/devteam-reset` | Clear state and restart |
| `status` | Output current status |
| `skip to step N` | Jump to step N |
| `pause` | Save state and stop |

For detailed command documentation, see [references/commands.md](../../references/commands.md).

## 📚 Additional Resources

### Core Documentation
- **Detailed Workflow**: [references/workflow.md](../../references/workflow.md)
- **Commands Reference**: [references/commands.md](../../references/commands.md)
- **Hook System**: [references/hooks.md](../../references/hooks.md)

### Configuration
- **Circuit Breaker**: [references/circuit_breaker.json](../../references/circuit_breaker.json)
- **Response Analyzer**: [references/response_analyzer.json](../../references/response_analyzer.json)

### Reference Materials
- **Role Definitions**: [references/JobDescription/](../../references/JobDescription/)
- **Document Templates**: [references/FormatSample/](../../references/FormatSample/)
- **State Templates**: [references/StateTemplate/](../../references/StateTemplate/)
- **Environment Info**: [references/Environment/](../../references/Environment/)
- **AI Agent Standard v4.4 Integration**: [ai-agent-development-standard-v4.4-integration.md](../../references/ai-agent-development-standard-v4.4-integration.md)
- **AI Agent Standard v4.4 Source Bundle**: [ai-agent-development-standard-v4.4/](../../references/ai-agent-development-standard-v4.4/)

### Plugin (Claude Code Only)
- **Stop Hook**: [plugin/stop-hook.sh](plugin/stop-hook.sh)
- **Hook Config**: [plugin/hooks.json](plugin/hooks.json)
