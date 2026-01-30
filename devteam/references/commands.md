# devteam Quick Commands Reference

## 🔗 Quick Start Commands

| User Command | AI Action |
|--------------|-----------|
| `/devteam <feature>` | Initialize simulation for feature |
| `/devteam-continue` | Resume from last state (resets CB if OPEN) |
| `/devteam-reset` | Clear state and start fresh |
| `status` | Output current devteam_STATUS |
| `skip to step N` | Jump to step N (with warning) |
| `pause` | Save state and stop |
| `reset circuit breaker` | Reset CB to CLOSED, clear counters |
| `show circuit breaker` | Display current CB state and counters |
| `debug` | Show all state files content |

---

## 🎯 Autonomous Operation Protocol

### Initialization Sequence
```
1. READ docs/.devteam/status.json
2. IF exists AND exit_signal == false:
     RESUME from current_step with current_role
3. ELSE:
     CREATE docs/.devteam/ directory
     INITIALIZE status.json with step=1, role="Product Manager"
     BEGIN Step 1
```

### Per-Step Execution
```
1. ANNOUNCE current role: "🎭 Acting as: [ROLE]"
2. LOAD role reference file
3. EXECUTE step actions
4. CREATE/UPDATE output documents
5. UPDATE docs/.devteam/status.json
6. IF milestone OR blocker:
     REPORT via mcp_user-feedback_collect_feedback
7. IF user responds "continue":
     PROCEED to next step
8. ELSE IF user provides specific instruction:
     FOLLOW instruction and update state
```

### Completion Sequence
```
1. VERIFY all 11 steps complete
2. VERIFY all tasks in docs/tasks marked done
3. VERIFY all tests in docs/tests marked PASS
4. VERIFY no BUG tasks remain
5. OUTPUT devteam_STATUS block with EXIT_SIGNAL: true
6. UPDATE status.json with exit_signal: true
7. ARCHIVE via /opsx:archive
8. FINAL REPORT via MCP
```

---

## 🚦 Status Output Format

At each milestone, output status in this format:

```
---devteam_STATUS---
STATUS: IN_PROGRESS | COMPLETE | BLOCKED
CURRENT_STEP: <number>/11
CURRENT_ROLE: <role name>
CURRENT_PHASE: Planning & Design | Implementation & Iteration | Verification & Deployment
TASKS_COMPLETED_THIS_SESSION: <number>
FILES_MODIFIED: <number>
TESTS_STATUS: PASSING | FAILING | NOT_RUN
EXIT_SIGNAL: false | true
BLOCKED_REASON: <reason if blocked, else null>
RECOMMENDATION: <one line summary>
---END_devteam_STATUS---
```

---

## ✅ Checklist Before Archiving

- [ ] All 11 steps executed
- [ ] All `docs/plan` documents complete
- [ ] All `docs/tasks` marked done
- [ ] All `docs/tests` marked PASS
- [ ] No BUG tasks in `docs/tasks`
- [ ] E2E tests passed on Stage
- [ ] `docs/CHANGELOG.md` updated
- [ ] `/opsx:archive` executed
- [ ] Final MCP report sent
- [ ] Circuit breaker state is CLOSED
