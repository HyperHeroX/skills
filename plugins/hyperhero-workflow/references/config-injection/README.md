# Config Injection System

This directory contains template content that **MUST** automatically be injected into the user's project files (`AGENTS.md` and `copilot-instructions.md`) when the devteam skill is executed.

## Why This Exists

`AGENTS.md` and `copilot-instructions.md` are **NOT** part of the skills package. They are maintained by the user in their own project. However, these files MUST contain certain mandatory sections for the devteam/OpenSpec workflow to function correctly.

This system ensures those sections are automatically present.

## How It Works

1. **Detection**: The AI checks for the marker `<!-- DEVTEAM-RULES-START -->` in the user's files
2. **Injection**: If the marker is missing, the template content is appended
3. **Update**: If the marker exists but content is outdated (version mismatch), the block is replaced
4. **Versioning**: Each injection block has a version number for future updates

## Marker Format

```markdown
<!-- DEVTEAM-RULES-START v1.0 -->
... injected content ...
<!-- DEVTEAM-RULES-END -->
```

## Files

| File | Purpose |
|------|---------|
| `agents-md-injection.md` | Content to inject into user's `AGENTS.md` and `copilot-instructions.md` (same template for both) |

## When Injection Happens

- **devteam workflow Step 0** (Configuration Sync)
- **Session resume processing** (if `openspec-session-resume` skill is installed, else via Tier 2/3 fallback — see `../openspec-integration.md`)
- **devteam-continue** command (before resuming)

## AI Instructions

When executing config injection, the AI MUST:

1. Check if `AGENTS.md` exists in the project root
2. Check if `copilot-instructions.md` exists (in `.github/` or project root)
3. Search for `<!-- DEVTEAM-RULES-START` marker in each file
4. If marker NOT found → append the full injection block to the end of the file
5. If marker found → check version number → if outdated, replace the entire block
6. Report what was injected via MCP
