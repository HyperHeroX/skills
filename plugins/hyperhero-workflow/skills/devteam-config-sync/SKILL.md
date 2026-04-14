---
name: devteam-config-sync
description: |
  Automatically check and inject mandatory devteam/OpenSpec rules into user's AGENTS.md and copilot-instructions.md.
  This skill runs as Step 0 of the devteam workflow and before session resume processing.
  
  **USE THIS SKILL WHEN:**
  - Starting a devteam workflow (/devteam)
  - Resuming a devteam session (/devteam-continue)
  - Session resume guard detects pending tasks
  - User explicitly asks to sync configuration
  
  **WHAT IT DOES:**
  - Checks user's AGENTS.md for `<!-- DEVTEAM-RULES-START -->` marker
  - Checks user's copilot-instructions.md (in .github/ or project root) for the same marker
  - If marker is missing → reads injection template and appends to the file
  - If marker exists with outdated version → replaces the entire block with updated content
  - Reports what was injected
license: MIT
compatibility: Works with any project using devteam skills.
metadata:
  author: HyperHeroX
  version: "1.0"
  priority: HIGH
  runBefore:
    - devteam
    - devteam-continue
---

# devteam Config Sync

Automatically ensures that the user's project configuration files contain the mandatory devteam/OpenSpec workflow rules.

## Why This Skill Exists

The `AGENTS.md` and `copilot-instructions.md` files are **NOT** part of the skills package — they are maintained by the user in their own projects. However, the devteam workflow requires certain mandatory rules to be present in these files to prevent AI from skipping the structured workflow.

This skill bridges that gap by automatically injecting the required rules.

---

## Steps

### Step 1: Locate User Configuration Files

Search for the user's configuration files in the following order:

**For AGENTS.md:**
1. `./AGENTS.md` (project root)
2. `./.github/AGENTS.md`
3. `./claude/AGENTS.md`

**For copilot-instructions.md:**
1. `./.github/copilot-instructions.md`
2. `./copilot-instructions.md` (project root)

If a file does NOT exist → **create it** with the injection content as the initial content.

### Step 2: Read Injection Template

Read the injection template from:
```
devteam/references/config-injection/agents-md-injection.md
```

This template contains the standardized rules block wrapped in markers:
```
<!-- DEVTEAM-RULES-START v1.0 -->
... rules content ...
<!-- DEVTEAM-RULES-END -->
```

### Step 3: Check for Existing Markers

For each configuration file found:

1. Search for `<!-- DEVTEAM-RULES-START` in the file content
2. **If NOT found** → proceed to Step 4 (Inject)
3. **If found** → extract version number and compare:
   - If version matches current (v1.0) → skip (already up to date)
   - If version is older → proceed to Step 5 (Update)

### Step 4: Inject Rules (New Injection)

If the marker is NOT found in the file:

1. Append the full injection template to the END of the file
2. Ensure there's a blank line before the injected block
3. Log: "✅ Injected devteam rules v1.0 into {filename}"

**Example:**
```markdown
... existing user content ...

<!-- DEVTEAM-RULES-START v1.0 -->
## 🚨 devteam Workflow — Mandatory Rules (Auto-Injected)
... (template content) ...
<!-- DEVTEAM-RULES-END -->
```

### Step 5: Update Rules (Version Update)

If the marker exists but version is outdated:

1. Find the start marker: `<!-- DEVTEAM-RULES-START v{old} -->`
2. Find the end marker: `<!-- DEVTEAM-RULES-END -->`
3. Replace everything between (inclusive) with the new template content
4. Log: "🔄 Updated devteam rules from v{old} to v1.0 in {filename}"

### Step 6: Verify Injection

After injection/update, verify:
1. The file is valid markdown (no broken formatting)
2. The markers are present and properly closed
3. No duplicate injection blocks exist

### Step 7: Report

Summarize what was done:

```
## 📋 Config Sync Report

| File | Action | Version |
|------|--------|---------|
| AGENTS.md | ✅ Injected | v1.0 |
| copilot-instructions.md | ✅ Injected | v1.0 |
```

Or if already up to date:
```
## 📋 Config Sync Report
All configuration files are up to date. No injection needed.
```

---

## Output

- Updated `AGENTS.md` with devteam rules block
- Updated `copilot-instructions.md` with devteam rules block
- Config sync report showing what was done

---

## Guardrails

- **NEVER** remove existing user content — only append or replace the marked block
- **NEVER** inject duplicate blocks — check for existing markers first
- **ALWAYS** preserve the user's existing file structure and formatting
- **ALWAYS** use the exact markers: `<!-- DEVTEAM-RULES-START v{version} -->` and `<!-- DEVTEAM-RULES-END -->`
- If the file is read-only or injection fails, log the error but do NOT block the workflow
- Report injection results but do NOT wait for user confirmation — this is an automatic process

---

## Integration Points

This skill is called automatically by:

| Caller | When |
|--------|------|
| `devteam` SKILL.md | Step 0: Before starting any workflow step |
| `devteam-continue` | Before resuming from saved state |
| Session resume logic | Before session resume processing (see `../../references/openspec-integration.md`) |

The AI executing any of these workflows MUST run config-sync first.
