# Visual Testing Detailed Checklist

## Page-Level Checks

### Header
- Brand logo present and correctly sized
- Brand name matches product name exactly
- User info (name, role) displayed in top-right
- Breadcrumb trail reflects navigation path
- Background color matches design system

### Sidebar
- Active menu item visually highlighted
- Submenu expands/collapses correctly
- Icons aligned and consistently sized
- Hover states visible on all menu items
- Width stable during navigation

### Content Area
- Title uses largest heading size (h1/h2)
- Subtitle/description below title in muted color
- Action buttons (Create, Import, Export) in top-right
- Cards/tables have consistent border-radius and shadow
- Empty state shows meaningful placeholder message

### Tables
- Column headers are bold and aligned
- Row hover effect present
- Action buttons (Detail, Edit, Delete) in last column
- Pagination shows total count and page navigation
- Status badges use semantic colors (green=active, red=danger, orange=warning)

### Forms
- Labels above or beside inputs consistently
- Required field indicators visible
- Input focus states with accent color border
- Error messages in red below invalid fields
- Save/Cancel buttons in predictable position

### Modals/Dialogs
- Overlay dims background content
- Close button (X) in top-right corner
- Title clearly states action purpose
- Confirm/Cancel buttons follow platform convention
- Form fields inside modal follow same style as page forms

## Color Consistency Matrix

| Element | Expected Color | Notes |
|---------|---------------|-------|
| Primary action button | Brand accent (blue/purple) | Filled, high contrast |
| Secondary action | Gray/outlined | Lower emphasis |
| Danger action (Delete) | Red accent | Warning color |
| Success indicator | Green | Confirmation |
| Warning indicator | Orange/amber | Attention needed |
| Info indicator | Blue | Informational |
| Active nav item | Brand accent bg | Left border or full bg |

## Responsive Breakpoints

| Width | Layout Change |
|-------|--------------|
| > 1280px | Full sidebar, all columns visible |
| 768-1279px | Collapsed sidebar, fewer columns |
| < 768px | Hidden sidebar (hamburger), stacked layout |

## Screenshot Strategy

1. **Full page** at 1920x1080 for each major page
2. **Focused region** for complex components (tables, forms)
3. **Before/after** for interactive state changes
4. **Dark mode** if applicable
5. **Error states** for validation and empty data scenarios
