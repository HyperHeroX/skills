# OpenSpec Integration — Conditional Skill Detection

> This reference defines how workflows in this plugin integrate with OpenSpec
> without requiring the OpenSpec helper skills to be bundled in this plugin.

## Principle

OpenSpec is a valuable SDD (Spec-Driven Development) tool, but the OpenSpec helper
skills (formerly bundled as `openspec-*`) are distributed as an independent plugin.
This plugin does NOT bundle those skills. Instead, each workflow step that would
benefit from OpenSpec helper skills performs a runtime availability check and
picks the best execution path.

## Three-Tier Execution Strategy

When a workflow reaches an OpenSpec-related step, follow this decision tree:

```
Need OpenSpec operation (new / apply / verify / archive / session-resume)
                    |
                    v
     Check if corresponding skill is available
                    |
        ┌───────────┴────────────┐
       Yes                        No
        |                          |
        v                          v
   Tier 1: Use                Check if OpenSpec CLI
   the skill                  is installed
   (best experience)                |
                         ┌──────────┴────────────┐
                        Yes                      No
                         |                        |
                         v                        v
                    Tier 2: Use           Tier 3: Execute
                    OpenSpec CLI          inline fallback
                    (npm-installed)       (basic workflow)
```

## Tier 1: Skill-Based Execution (Preferred)

If the corresponding OpenSpec skill is installed in the user's Claude Code environment,
invoke it via the Skill tool.

**Skills to check (in order of relevance):**

| Operation | Skill Name |
|-----------|-----------|
| Create new change | `openspec-new-change` |
| Continue change artifacts | `openspec-continue-change` |
| Fast-forward artifacts | `openspec-ff-change` |
| Apply implementation | `openspec-apply-change` |
| Verify implementation | `openspec-verify-change` |
| Archive completed change | `openspec-archive-change` |
| Bulk archive | `openspec-bulk-archive-change` |
| Sync specs | `openspec-sync-specs` |
| Resume session | `openspec-session-resume` |
| Onboarding | `openspec-onboard` |
| Exploration | `openspec-explore` |

**How to check skill availability:**

1. Look at the current session's loaded skills list (shown in system-reminder at session start)
2. Search for the skill name (case-insensitive match, may be prefixed like `openspec:openspec-new-change`)
3. If found → invoke via Skill tool: `Skill(skill: "openspec-new-change")`

## Tier 2: CLI-Based Execution (Fallback)

If the skill is not available, check whether the OpenSpec CLI is installed.

**Check CLI availability:**

```bash
openspec --version
```

**If installed:** Use CLI commands directly.

| Operation | CLI Command |
|-----------|-------------|
| Initialize | `openspec init` |
| New change | `openspec new <change-id>` |
| Apply | `openspec apply <change-id>` |
| Verify | `openspec verify <change-id>` |
| Archive | `openspec archive <change-id>` |
| List changes | `openspec list` |
| Status | `openspec status` |

**If not installed:** Suggest installation, then proceed to Tier 3 if user declines.

```bash
npm install -g @fission-ai/openspec@latest
```

## Tier 3: Inline Fallback (Last Resort)

If neither skill nor CLI is available, execute a basic manual equivalent.

**For `new-change` operation:**
1. Create directory: `docs/openspec/changes/<change-id>/`
2. Create `proposal.md` with problem statement, goals, non-goals
3. Create `specs/` directory with spec files
4. Create `design.md` with technical approach
5. Create `tasks.md` with implementation checklist

**For `apply` operation:**
1. Read the change's `specs/` and `tasks.md`
2. Implement each task following the spec
3. Update `tasks.md` checkboxes as work progresses

**For `verify` operation:**
1. Re-read specs and implementation
2. Confirm each acceptance criterion is met
3. Run tests referenced in `tasks.md`

**For `archive` operation:**
1. Move the change directory to `docs/openspec/archived/<change-id>/`
2. Merge relevant specs into the main specs directory

**For `session-resume` operation:**
1. Scan `docs/tasks/phase{n}/` for unprocessed task .md files
2. For each unprocessed task, determine its OpenSpec change state
3. Resume at the correct lifecycle step

## Usage Pattern for Workflow Authors

When writing a workflow step that needs OpenSpec, use this pattern:

```markdown
### Step X: Create OpenSpec Change

**Detection (in order):**
1. **Try Skill:** Check session skills list for `openspec-new-change`.
   If available → invoke via Skill tool.
2. **Try CLI:** Run `openspec --version`. If exit code 0 →
   `openspec new <change-id>`.
3. **Fallback:** Manually create `docs/openspec/changes/<change-id>/`
   with proposal.md, specs/, design.md, tasks.md.

**Required output:** An active OpenSpec change with proposal + specs + design + tasks.
```

This pattern ensures the workflow functions in all three environments:
- Full OpenSpec plugin installed → best experience
- CLI-only → functional
- Neither → degraded but usable

## Rationale

Keeping OpenSpec integration conditional:
- **Reduces plugin size** — no duplication of OpenSpec's own skill files
- **Respects skill ownership** — OpenSpec team maintains their own skills
- **Stays functional** — fallbacks prevent hard failures when dependencies are missing
- **Encourages installation** — users see the value of OpenSpec and install it themselves
