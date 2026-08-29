# completion gates
- Before editing: inspect current branch/status and the target skill/reference structure; confirm every relative link resolves.
- After editing: run git diff --check; parse changed JSON/YAML where tooling is available; check Markdown frontmatter and required headings/links.
- If the external v4.4 bundle is copied or modified, run its python tools/validate_bundle.py from the bundle root and retain the validator result as evidence.
- Validate the marketplace/plugin manifests and ensure the two target skills reference the same standard revision and loading order.
- No commit/publish is implied by a content integration request; report any generated onboarding files or unrelated pre-existing changes separately.