---
name: user-guide-creator
description: This skill should be used when the user asks to create, update, or generate a user operation guide (user manual / user guide) for any web application or system. It covers the full workflow from content planning, browser-based screenshot capture, Markdown authoring, and DOCX export. Trigger on requests like "create user guide", "write operation manual", "generate user manual", "make documentation with screenshots".
---

# User Guide Creator

Create comprehensive, screenshot-rich user operation guides for web applications. This skill produces a structured Markdown guide with focused UI screenshots, then optionally exports to DOCX for offline distribution.

## When to Use

- Creating a new user operation guide / user manual for a web application
- Adding new sections or pages to an existing guide
- Updating screenshots after UI changes
- Converting an existing Markdown guide to DOCX

## Output Structure

```
docs/user-guide/
  {project-name}-操作指南.md      # Main guide (Markdown)
  {project-name}-操作指南.docx    # Exported DOCX (optional)
  screenshots/                    # All captured screenshots
    {NN}-{section-name}.png       # Full-page overview per section
    {NN}{a-z}-{detail-name}.png   # Focused element-level shots
```

## Workflow

### Phase 1: Content Planning

1. Identify all system modules by exploring the application sidebar/navigation
2. Plan the document structure following this standard outline:
   - System introduction and main features table
   - Login and authentication
   - Dashboard overview
   - Each functional module (one section per top-level nav item)
   - Account and security settings
   - System administration (if applicable)
   - FAQ section
   - Appendix: navigation structure tree
3. Create a numbered section plan; each section maps to a screenshot numbering prefix (01, 02, ... NN)

### Phase 2: Screenshot Capture

#### Principles

- **Focused screenshots**: Capture specific functional areas, NOT entire pages. Target individual UI blocks, forms, cards, modals, tables, or setting groups
- **Full-page overview**: One full-page shot per major section for context, then multiple focused shots for details
- **Element-level capture**: Use Playwright `browser_take_screenshot` with `element` + `ref` parameters to capture specific DOM elements
- **Login first**: Always authenticate before capturing. Use `browser_navigate`, `browser_fill_form`, `browser_click` to complete login flow

#### Naming Convention

| Pattern | Usage | Example |
|---------|-------|---------|
| `{NN}-{name}.png` | Section overview | `07-bots-pool.png` |
| `{NN}{letter}-{name}.png` | Focused detail within section | `07a-header-area.png`, `07b-create-card.png` |

#### Capture Process

1. Navigate to each page using `browser_navigate`
2. Take a `browser_snapshot` to get the accessibility tree and element refs
3. Identify target elements by their ref IDs
4. Use `browser_take_screenshot` with `element` and `ref` parameters for focused captures
5. Save to `screenshots/` directory with the naming convention above
6. For interactive flows (create, edit, delete), capture each step: before click, modal/form, filled state, result

#### Important Notes

- Take screenshots one at a time (parallel screenshot calls may timeout)
- If a page returns 404, mark it in the guide as "*(page under development, screenshot pending)*" instead of leaving a broken image reference
- Resize browser to consistent width (e.g., 1280px) before capturing for uniformity
- For dropdown/modal screenshots, first trigger the UI element, take a snapshot to get new refs, then capture

### Phase 3: Markdown Authoring

#### Document Metadata Header

```markdown
# {Product Name} -- System Operation Guide

> **Target Audience**: First-time users of this system
> **System Version**: {Product} v{X.Y}
> **Last Updated**: {YYYY-MM-DD}
```

#### Section Structure Pattern

Each section follows this consistent pattern:

```markdown
## N. Section Title

Brief description of the module purpose.

![Section Overview](screenshots/NN-section-name.png)

### N.1 Sub-feature

Detailed explanation.

![Feature Detail](screenshots/NNa-detail-name.png)

| Column 1 | Column 2 |
|----------|----------|
| Item     | Description |

> **Tip**: Helpful advice for users.

#### Step-by-step instructions

1. First step
2. Second step
3. Third step
```

#### Content Guidelines

- **Language**: Match the application UI language (typically Traditional Chinese for zh-TW apps)
- **Tables**: Use Markdown tables for feature descriptions, field explanations, status codes, parameter descriptions
- **Blockquotes**: Use `>` for tips, warnings, and important notes with bold labels: `**Tip**`, `**Warning**`, `**Note**`
- **Bold**: Use `**bold**` for button names, menu items, and important terms users need to find in the UI
- **Code**: Use backticks for technical values, variable names, API endpoints
- **Step-by-step**: Use numbered lists for sequential procedures
- **FAQ section**: Use `### Q:` and `**A:**` pattern for each question

#### Appendix: Navigation Structure

Include a code block showing the full navigation tree:

```
Product Name
+-- Module A
|   +-- Sub-module A1
|   +-- Sub-module A2
+-- Module B
+-- Module C
```

### Phase 4: DOCX Export

To convert the Markdown guide to DOCX, run the bundled conversion script:

```bash
python {skill-dir}/scripts/md2docx.py <input.md> <output.docx> <screenshots-dir>
```

The script handles:
- CJK font support (Microsoft JhengHei on Windows, Noto Sans CJK on Linux/macOS)
- Heading hierarchy (H1-H4)
- Inline formatting (bold, italic, code, links)
- Markdown tables with styled headers
- Image embedding with proper sizing (5.5 inches width)
- Blockquote styling with indentation and gray text
- Ordered and unordered lists (including nested)
- Code blocks with monospace font
- Missing image placeholders (red italic text)

**Prerequisite**: `pip install python-docx` (the script checks and reports if missing)

#### DOCX Quality Checks

After generating DOCX, verify:
1. All images render correctly (no "[missing]" placeholders)
2. Tables are properly formatted
3. CJK characters display correctly
4. Heading hierarchy is preserved

### Phase 5: Validation

Before delivery, validate the complete guide:

1. **Screenshot coverage**: Every section has at least one screenshot; interactive flows have step-by-step captures
2. **Broken images**: Search for image references in MD and verify all referenced files exist in `screenshots/`
3. **Content completeness**: Every navigation item in the app has a corresponding section
4. **Link integrity**: Internal anchor links in the table of contents resolve correctly
5. **DOCX fidelity**: If DOCX was generated, open and verify visual quality
