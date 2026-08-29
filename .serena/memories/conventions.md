# authoring conventions
- Keep skill directory name and SKILL.md frontmatter name stable when improving an existing skill.
- Skill descriptions state both capability and trigger contexts; body provides progressive workflow instructions and links to focused references.
- Use relative links from SKILL.md to plugin references; keep large standards in a shared reference bundle and route readers by task/domain.
- Prefer terse Traditional-Chinese documentation for project-specific workflow guidance, while preserving source-standard wording and Requirement IDs exactly when normative.
- Treat user/system requirements as immutable: do not weaken conditional language, turn mandatory capabilities into optional ones, or let external best practices replace source requirements.
- Keep devteam orchestration (roles, state, task sequencing, gates) separate from AutoDEV phase guidance, and share normative references instead of maintaining divergent copies.
- Preserve unrelated dirty-worktree changes; inspect before editing and keep changes scoped to the requested plugin/skill files.