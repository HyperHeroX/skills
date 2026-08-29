# Windows command conventions
- Prefer Git Bash via C:\\Program Files\\Git\\bin\\bash.exe; use Git's shell tooling rather than WSL.
- In Git Bash on this machine, rg may be unavailable; use find, grep, sed, awk, and git instead.
- Inspect state: git status --short --branch; inspect changes: git diff --check and git diff -- <path>.
- Enumerate plugin files: find plugins -type f -print | sort.
- Validate the source standard bundle from its root: python tools/validate_bundle.py .
- Validate this marketplace with the available Claude/plugin validation command when installed (README documents /plugin validate .); otherwise perform JSON parsing, link/path checks, and focused Markdown checks locally.