# skills marketplace project map
- Repository: HyperHeroX skills marketplace; primary content is Claude Code plugin metadata, Markdown skills/references, JSON/YAML policies, and small Node/Python helpers.
- Marketplace manifest: .claude-plugin/marketplace.json; plugins live under plugins/.
- Main workflow plugin: plugins/hyperhero-workflow/; supporting tools plugin: plugins/hyperhero-tools/.
- Dev workflow entry points: plugins/hyperhero-workflow/skills/devteam/SKILL.md and plugins/hyperhero-workflow/skills/autodev/SKILL.md; shared workflow references are in plugins/hyperhero-workflow/references/.
- The external AI Agent Engineering and Secure Development Standard v4.4 is a framework-neutral, requirement-led bundle with Markdown, YAML, JSON, templates, examples, lifecycle guidance, and a Python validator. When integrating it, preserve source requirements and conditions; use shared references rather than duplicating the full standard into both skills.
- Read mem:hyperhero-workflow/core for workflow-specific state and reference routing.
- Read mem:hyperhero-tools/core for the auxiliary plugin inventory.
- Read mem:tech_stack for file/tool formats, mem:conventions for authoring rules, mem:suggested_commands for Windows commands, and mem:task_completion for validation gates.