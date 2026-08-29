# project technologies
- Claude Code plugin marketplace format: JSON marketplace/plugin manifests plus directory-discovered commands and skills.
- Skills and references: UTF-8 Markdown with YAML frontmatter where a file is a skill entry point.
- Configuration/policy/data: JSON and YAML.
- Runtime helpers: Node.js ESM .mjs scripts; Python utilities for deterministic conversion/validation.
- No root application package/build system is evident; validation is plugin/file-structure oriented.
- External standard v4.4 includes tools/validate_bundle.py, which requires Python and validates the standalone standard bundle.