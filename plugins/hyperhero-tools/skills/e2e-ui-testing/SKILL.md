---
name: e2e-ui-testing
description: >-
  Comprehensive E2E UI testing, visual regression, and layout verification
  using browser automation tools. Use when asked to "test UI", "E2E test",
  "browser test", "visual test", "layout verification", "verify pages",
  "test all pages", "UI regression", or when performing post-deployment
  validation of web applications.
---

# E2E UI Testing & Visual Verification

## Overview

Systematic browser-based testing workflow for web applications. Covers login
flows, page navigation, data verification, interactive element testing,
visual layout checks, and regression detection.

## Prerequisites

- Browser automation MCP tools available (cursor-ide-browser or playwright)
- Application running and accessible via URL
- Valid test credentials

## Testing Workflow

### Phase 1: Environment Preparation

1. **Verify services** are running (containers, dev server, database)
2. **Reset database** if clean-state testing is required
3. **Confirm accessibility** via HTTP status check

```bash
# Container check
podman ps --format "table {{.Names}}\t{{.Status}}"
# or: docker ps --format "table {{.Names}}\t{{.Status}}"

# HTTP readiness
curl -s -o /dev/null -w '%{http_code}' <BASE_URL>/login
```

### Phase 2: Authentication Test

1. Navigate to login page
2. Verify login form elements (inputs, button, branding)
3. Fill credentials and submit
4. Confirm redirect to dashboard/home
5. Verify auth state persists across navigation

```
Test Checklist:
- [ ] Login page renders correctly
- [ ] Form validation works (empty fields)
- [ ] Login button shows loading state
- [ ] Successful login redirects to expected page
- [ ] Auth token stored (check via API calls)
```

### Phase 3: Page-by-Page E2E Testing

For **each page** in the application, verify:

#### 3a. Navigation & Routing

- [ ] Page loads without errors (no 500/404)
- [ ] URL matches expected route
- [ ] Breadcrumb reflects current location
- [ ] Sidebar/navbar active state correct

#### 3b. Data Display

- [ ] Expected data count matches database
- [ ] Table/list columns render correctly
- [ ] Empty states display when no data
- [ ] Pagination controls work (if applicable)
- [ ] Date formats are consistent

#### 3c. Interactive Elements

- [ ] All buttons are clickable and responsive
- [ ] Search/filter inputs trigger data updates
- [ ] Dropdown menus open and contain expected options
- [ ] Modal dialogs open/close correctly
- [ ] Form fields accept input and validate
- [ ] Save/Submit actions complete successfully
- [ ] Delete confirmations appear before destructive actions

#### 3d. Error Handling

- [ ] Invalid inputs show validation messages
- [ ] Network errors display user-friendly messages
- [ ] Unauthorized access redirects to login

### Phase 4: Visual & Layout Verification

For **each page**, capture screenshots and verify:

#### 4a. Layout Structure

- [ ] Header position and content correct
- [ ] Sidebar width and navigation items correct
- [ ] Main content area properly aligned
- [ ] Footer visible and contains correct text

#### 4b. Typography & Spacing

- [ ] Page titles match expected hierarchy (h1/h2/h3)
- [ ] Subtitles and descriptions present
- [ ] Text is readable (contrast, size)
- [ ] Consistent spacing between elements

#### 4c. Color & Branding

- [ ] Brand colors applied consistently
- [ ] Active/selected states visually distinct
- [ ] Status tags/badges use correct colors
- [ ] Theme consistency (light/dark)

#### 4d. Responsive Behavior (Optional)

- [ ] Desktop layout (1920x1080)
- [ ] Tablet layout (768x1024)
- [ ] Mobile layout (375x667)

## Browser Automation Protocol

### Using cursor-ide-browser MCP

```
1. browser_navigate → Open target URL
2. browser_lock → Prevent user interference
3. browser_snapshot → Get page structure (accessibility tree)
4. browser_fill → Enter text into inputs
5. browser_click → Interact with buttons/links
6. browser_snapshot + take_screenshot_afterwards → Visual evidence
7. browser_unlock → Release browser when done
```

### Key Patterns

**Wait for page transitions**: After click/navigation, wait 2-5 seconds
then take a new snapshot before interacting.

**Stale element handling**: If "Stale element reference" error occurs,
take a fresh `browser_snapshot` then retry with new refs.

**Animation timing**: Content may appear faint in screenshots if captured
during CSS animations. Wait 2-3 seconds after page load for animations
to complete before taking visual evidence screenshots.

**Element identification**: Use the accessibility tree `ref` values from
`browser_snapshot` for precise element targeting. Prefer `interactive: true`
for action-focused snapshots.

## Test Evidence Collection

For each tested page, record:

| Field | Description |
|-------|-------------|
| Page Name | Human-readable name |
| URL | Full URL path |
| Status | PASS / FAIL / WARN |
| Data Check | Expected vs actual data count |
| Elements | Interactive elements verified |
| Screenshot | Visual evidence captured |
| Issues | Any bugs or discrepancies found |

## Common Issues & Fixes

| Issue | Cause | Fix |
|-------|-------|-----|
| 500 Server Error | SSR rendering failure | Check server logs, fix syntax errors |
| IIFE syntax in Vue/Nuxt | `ref(() => {...})()` | Wrap as `ref((() => {...})())` |
| Search not filtering | API debounce or backend bug | Check network tab, verify API params |
| Faint content in screenshot | CSS animation timing | Wait 3s after load, retake screenshot |
| Click intercepted | Overlay/sidebar blocking | Use direct URL navigation instead |
| Empty data after restart | DB not seeded | Check container logs for seed output |

## Reporting Template

```markdown
## E2E UI Test Report

### Environment
- URL: [base URL]
- Database: [fresh/existing]
- Date: [test date]

### Results Summary
| Page | URL | Status | Notes |
|------|-----|--------|-------|
| Login | /login | ✅ | ... |
| Dashboard | /dashboard | ✅ | ... |

### Issues Found
1. [Issue description with page, expected vs actual]

### Visual Verification
| Check | Result |
|-------|--------|
| Branding consistency | ✅/❌ |
| Layout alignment | ✅/❌ |
| Color scheme | ✅/❌ |
| Typography hierarchy | ✅/❌ |

### Recommendations
- [Actionable items]
```

## Additional Resources

For detailed visual testing standards, see [visual-checklist.md](visual-checklist.md).
