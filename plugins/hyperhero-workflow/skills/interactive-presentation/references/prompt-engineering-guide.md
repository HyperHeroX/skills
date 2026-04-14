# Prompt Engineering Guide for Interactive Presentations

> This guide codifies the prompt design philosophy extracted from 60+ battle-tested prompts.
> Use it to compose optimal prompts through interactive Q&A with the user,
> adapting each prompt to the specific content, audience, and visual goals.

---

## Core Design Philosophy

### 1. Video-First Mindset

Every design decision serves one goal: **the output will be screen-recorded as a video**.

This means:
- Text must be large enough to read at 1080p/4K playback
- Animations must be smooth and timed for narration pacing
- Visual hierarchy must guide the viewer's eye without manual pointing
- No interactive-only elements that don't work in a recording (tooltips on hover are OK as bonus, not primary)

**How this affects prompts:** Always include phrases like:
- "for video demonstration" / "for video presentation"
- "increase font size" / "reduce text per slide"
- "enhance graphical display, use rich graphics alongside text"

### 2. Progressive Enhancement Pipeline

Never try to generate the perfect result in one shot. Build in layers:

```
Layer 1: Content + Structure  →  Raw HTML with all information
Layer 2: Animation            →  Entrance effects, emphasis, timing
Layer 3: Template Style       →  Visual identity from reference template
Layer 4: Polish               →  Icons, glow effects, 3D, particles
```

Each layer is a separate prompt. This prevents AI from sacrificing content accuracy for visual effects.

### 3. "Large Text, Few Words, Many Graphics" Principle

The original prompts consistently enforce:
- **Reduce text** — every slide should have minimal reading
- **Increase font size** — readable from 2 meters away
- **Enhance graphical display** — replace paragraphs with diagrams, icons, flow charts
- **Use emphasis** — bold, underline, italic, text color, text background
- **Rich graphics alongside text** — never a wall of text

**Prompt pattern:**
```
Reduce text per slide, increase font size, enhance graphical display,
use rich graphics alongside text for video presentation.
Apply bold, underline, italic, text color, and text background emphasis.
```

### 4. Animation Sequencing Discipline

Animations are not random decoration — they follow strict hierarchy:

```
Page transition triggers →
  Parent module appears →
    Child elements ease-in one by one →
      Emphasis effects persist after entrance
```

**Critical rules:**
- Every element must have entrance animation (no instant pop-in)
- Animations follow reading order (top→bottom, left→right)
- Parent containers appear before their children
- Total page animation: 3-5 seconds
- Persistent effects (glow, pulse) activate AFTER entrance completes
- Dashed arrows get continuous flow animation

**Prompt pattern:**
```
Add sequential "ease-in" entrance animations for each element
on every page transition (down to each line of text).
Establish clear hierarchical animation relationships between
parent modules and child elements.
Ensure unified timing curves and transition rhythms.
Total animation completion time: 5 seconds.
```

### 5. Template-Driven 95% Fidelity

When restructuring with a template, the standard is precise replication:

```
Precisely replicate layout structure, element spacing, font styles,
icon design, and visual hierarchy from the template.
Ensure all interactive elements match the reference visually.
Maintain original color values and scheme.
Ensure responsive design across devices.
Optimize DOM structure while maintaining functionality.
Target 95%+ visual similarity with template.
```

This is not a suggestion — it's a hard requirement in every restructuring prompt.

### 6. Emoji Prohibition

**Never use emoji in generated presentations.** This is the single most consistent rule across all prompts.

Replace all emoji with flat UI library icons (Font Awesome, Material Icons, Lucide, etc.):
- Font Awesome: `<i class="fas fa-network-wired"></i>`
- Material Icons: `<span class="material-icons">hub</span>`
- Inline SVG: Custom SVG icons for maximum control

**Prompt pattern (mandatory in every restructuring prompt):**
```
Replace all emoji icons with flat UI library icons.
Do NOT use emoji symbols — use UI library icons instead.
```

### 7. Single-File Zero-Dependency Architecture

All generated HTML must be:
- **One file** — no external CSS, JS, or image files
- **Zero dependencies** — no CDN links, no npm packages, no frameworks
- **1000+ lines** — ensures sufficient visual richness and code detail
- **Self-contained** — CSS in `<style>`, JS in `<script>`, SVG inline
- **Icon libraries** — load via CDN `<link>` only for icon fonts (acceptable exception)

### 8. Dark Theme + Accent Color Aesthetic

Default color philosophy:
- **Background:** Dark (#0a0a0f, #000000, deep blue, deep green)
- **Accent:** Cyan, purple, pink, yellow (user-configurable)
- **Text:** White (#fff) with colored highlights
- **Effects:** Noise texture overlay, particle canvas, gradient radials
- **Alternative:** Warm tones (white background + pink/color accents) when user requests

---

## Interactive Q&A Strategy

When a user requests a presentation, gather information through these questions.
Ask only what's needed — don't overwhelm. Prioritize in this order:

### Must-Ask (Before Generation)

| Question | Why | Default if Not Asked |
|----------|-----|---------------------|
| What content/topic? | Core requirement | — (must ask) |
| Output path? | Where to save | Desktop/AI_Animation.html |

### Should-Ask (For Better Quality)

| Question | Why | Default if Not Asked |
|----------|-----|---------------------|
| Color theme preference? | Dark vs light, accent color | Dark + cyan accent |
| Audience/purpose? | Adjusts complexity and tone | Video recording for educational content |
| Preferred template? | PPT-Generate-1~4, RNN-2~7 | PPT-Generate-3 (best visual) |

### Can-Ask (For Polish)

| Question | Why | Default if Not Asked |
|----------|-----|---------------------|
| Want flowchart view? | Triggers Step 3 | Skip Step 3 |
| Want 3D effects? | Adds depth | No 3D |
| Want loading screen? | Professional touch | No loading screen |
| Want anime/kaomoji style? | Tonal choice | No kaomoji |

---

## Prompt Composition Rules

### Rule 1: Compound Prompts Beat Sequential Prompts

When possible, combine related instructions into one prompt rather than multiple turns.

**Good (compound):**
```
Generate a PPT-style carousel with large text, bold/underline/italic emphasis,
sequential ease-in animations per element, dark theme with cyan accents,
1000+ lines of code. Replace emoji with flat UI icons.
```

**Bad (too split):**
```
Turn 1: Generate a webpage about X
Turn 2: Make it PPT style
Turn 3: Add animations
Turn 4: Fix the icons
```

### Rule 2: Specify Negative Constraints

The original prompts frequently use "only X needed, Y can be ignored":
- "Only demonstration effects needed, other webpage details can be ignored"
- "Displayed within one screen"
- "Remove page numbers, progress bar, navigation hints — keep keyboard navigation"

This prevents AI from adding unwanted boilerplate (headers, footers, nav bars, SEO tags).

### Rule 3: Reference Before Restructuring

When applying a template, ALWAYS read the template file first and include it in context.
Don't just name the template — let AI see the actual code.

```
Step 1: Read templates/PPT-Template/PPT-Generate-3.html
Step 2: Read the user's generated HTML from Step 1
Step 3: Apply restructuring prompt with both files in context
```

### Rule 4: Quantify When Possible

The original prompts use specific numbers rather than vague adjectives:
- "1000+ lines of code" (not "detailed code")
- "loading time 3 seconds" (not "add a loading screen")
- "total animation 5 seconds" (not "add some animations")
- "95% visual similarity" (not "make it look like the template")
- "Y-axis 15 degrees, 60-second cycle" (not "add 3D rotation")

### Rule 5: Iterative Refinement Prompts

After initial generation, use targeted refinement prompts:

**Animation timing fix:**
```
Modify animation playback times, requiring the entire page to load in 5 seconds.
```

**Specific element fix:**
```
The "ai-arch-diagram" module's animation does not follow the correct sequence:
[specify exact expected order]. Fix the animation-delay values.
```

**Visual enhancement:**
```
Add persistent "glow" effect to all elements that currently only glow on hover.
Set the glow effect as default state (always active).
```

---

## Prompt Templates by Scenario

### Scenario A: Educational/Technical Presentation

Best for: Course material, technical sharing, protocol explanation

```
Based on the following content, generate a pure frontend single-page PPT-style
carousel presentation. Requirements:
- Dark theme with [cyan/green/purple] accent color
- Large text (minimum 24px body, 48px headings)
- Bold, underline, italic, text color, text background emphasis
- Sequential "ease-in" entrance animations on each page transition
  (down to each line of text, total 5 seconds per page)
- Rich graphical visualization: diagrams, flow charts, layered card layouts
- Reduce text per slide — focus on visual demonstration
- Replace all emoji with flat UI library icons
- Single HTML file, 1000+ lines, no external dependencies
- Keyboard arrow keys and mouse wheel navigation
Output to: [path]

Content:
[user's content here]
```

### Scenario B: Architecture/System Diagram

Best for: System architecture, data flow, component relationships

```
Based on the following content, generate a single-page HTML visualization.
Requirements:
- Dark background with green gradient (reference: assets/ui-designs/design1.png style)
- Architecture components as card modules with connection arrows
- Animated data flow along connection lines (dashed arrow flow animation)
- Each component eases in sequentially
- Mouse hover on components shows detail expansion
- Replace all emoji with flat UI library icons
- 1000+ lines, single file, no dependencies
Output to: [path]

Content:
[user's architecture description]
```

### Scenario C: Step-by-Step Process

Best for: Protocol flows, tutorials, sequential operations

```
Based on the following content, generate a PPT-style carousel where each step
occupies one full page. Requirements:
- Use DHCP demo style (reference: assets/examples/DHCP/ series)
- Each page shows one step with animated progression
- Connection between steps shown with animated arrows
- Step number prominently displayed
- Sequential ease-in for all elements, 5 seconds per page
- Dark theme with yellow/orange accent
- Replace all emoji with flat UI library icons
- 1000+ lines, single file
Output to: [path]

Steps:
[user's process description]
```

### Scenario D: Template Restructuring

Best for: Upgrading an existing HTML to professional style

```
Using [template-file] as the visual reference template, restructure [source-file].
Requirements:
- Precisely replicate the template's layout structure, spacing, typography,
  icon design, and visual hierarchy
- Reduce text per slide, increase font size
- Enhance graphical display with rich graphics alongside text
- Replace all emoji icons with flat UI library icons
- Maintain all original content and information accuracy
- Ensure responsive design across devices
- Optimize DOM structure while maintaining functionality
- Target 95%+ visual similarity with the template
- Keep keyboard navigation functionality
```

### Scenario E: Flowchart/Diagram Conversion

Best for: Converting slides into process/architecture view

```
Merge every two adjacent pages from [source-file], then restructure visually
following [RNN-template-file] flat UI style.
Requirements:
- Keep existing color scheme unchanged
- Precisely replicate template layout: card positioning, arrow directions,
  element spacing, font styles
- Each merged section becomes one self-contained visual module
- Add animated connection lines between modules
- Ensure responsive design
- Target 95%+ visual similarity with template
Output to: [path]
```

---

## Anti-Patterns to Avoid

| Anti-Pattern | Why It Fails | Correct Approach |
|-------------|-------------|-----------------|
| "Make it look nice" | Too vague, AI guesses randomly | Specify: dark theme, cyan accent, particle background |
| "Add some animations" | No timing, no sequencing | Specify: ease-in per element, 5s total, hierarchical |
| Generating everything in one prompt | Content accuracy suffers | Use progressive pipeline: content → animation → template → polish |
| Not reading template before restructuring | AI invents style instead of replicating | Read template file first, include in context |
| Using emoji for decoration | Inconsistent across platforms | Always specify "replace emoji with flat UI library icons" |
| Tiny font for more content per slide | Unreadable in video recording | Large text (24px+ body), reduce word count instead |
| Multiple external files | Hard to share and present | Single HTML file, inline everything |
| Skipping animation timing specs | Animations play too fast/slow | Specify exact durations: "3s loading", "5s page animation" |
