---
name: interactive-presentation
description: "This skill should be used when the user asks to \"create a presentation\", \"generate slides\", \"make an interactive demo\", \"create HTML animation\", \"generate PPT\", \"build a slideshow\", \"create a visual explainer\", or wants to convert text content into animated HTML presentations. Supports three-step workflow: base HTML generation, PPT-style template restructuring, and optional flowchart-style layout."
version: 1.0.0
---

# Interactive Presentation: AI-Driven HTML Presentation Generator

## Overview

Transform any text content into stunning, animated HTML presentations with a three-step automated workflow. Generate single-file HTML slideshows with CSS animations, 3D effects, and professional PPT-style layouts — no frameworks or dependencies required.

**Core capabilities:**
- Convert text/educational content into multi-page HTML slide presentations
- Apply PPT-style or flowchart-style visual templates
- Generate CSS animations with sequential element entrance effects
- Produce self-contained single HTML files for easy sharing

---

## Prompt Design Philosophy (8 Principles)

These principles govern ALL prompt composition and generation in this skill. Consult `references/prompt-engineering-guide.md` for the full guide with scenario templates and anti-patterns.

1. **Video-First** — Every design decision serves screen recording. Include "for video demonstration" in prompts. Text must be readable at 1080p playback.
2. **Progressive Enhancement** — Never generate the perfect result in one shot. Build in layers: Content → Animation → Template Style → Polish. Each layer is a separate prompt.
3. **Large Text, Few Words, Many Graphics** — Reduce text per slide, increase font size (24px+ body, 48px+ headings), replace paragraphs with diagrams and icons.
4. **Animation Sequencing Discipline** — Animations follow strict hierarchy: page transition → parent module → child elements ease-in one by one → persistent emphasis. Total per page: 3-5 seconds.
5. **Template-Driven 95% Fidelity** — When restructuring, read the template file first. Target 95%+ visual similarity. Precisely replicate layout, spacing, typography, icons.
6. **Emoji Prohibition** — Never use emoji. Always replace with flat UI library icons (Font Awesome, Material Icons, inline SVG). This instruction is mandatory in every restructuring prompt.
7. **Single-File Zero-Dependency** — One HTML file, no external CSS/JS/images. Inline everything. 1000+ lines ensures visual richness. Icon font CDN links are the only acceptable external resource.
8. **Dark Theme + Accent** — Default: dark background (#0a0a0f) + cyan/purple/pink accent. Alternative: warm (white + color accents) when user requests.

---

## Interactive Q&A Flow

Before generating, gather key information from the user. Ask naturally, not as a checklist.

### Must-Ask
- **Content/Topic** — What is the presentation about? (Ask user to provide text or describe the topic)
- **Output path** — Where to save? (Default: Desktop/AI_Animation.html)

### Should-Ask (improves quality significantly)
- **Color theme** — Dark or light? Preferred accent color? (Default: dark + cyan)
- **Audience** — Who will watch this? Educational video, tech sharing, classroom? (Default: educational video)
- **Template preference** — Show the 4 PPT options and 6 RNN options, recommend PPT-Generate-3 (Default: PPT-Generate-3)

### Can-Ask (for polish)
- **Flowchart view** — Want a diagram/process view? (Triggers Step 3)
- **3D effects** — Want depth and rotation? (Default: no)
- **Loading screen** — Want a splash screen? (Default: no)
- **Anime style** — Want kaomoji decoration? (Default: no)
- **Special effects** — Particles, glow, noise texture? (Default: include if using PPT-Generate-3)

### Prompt Composition After Q&A

Combine user answers into a compound prompt. Quantify everything:
- Font size: "minimum 24px body, 48px headings" (not "large text")
- Animation timing: "5 seconds total per page" (not "add animations")
- Code volume: "1000+ lines" (not "detailed")
- Fidelity: "95%+ visual similarity" (not "make it match")
- Constraints: "only demonstration needed, other details can be ignored" (prevents boilerplate)

---

## Three-Step Workflow

### Step 1: Generate Base HTML

Read the user's input content, then compose a generation prompt following the 8 principles above. Core prompt pattern:

```
Based on the following content, generate a pure frontend single-page layout
with PPT-style slide carousel for intuitive graphical visualization.
- Dark theme with [accent color] accents
- Large text: minimum 24px body, 48px headings
- Bold, underline, italic, text color, text background emphasis
- Sequential "ease-in" entrance animations on each page transition
  (down to each line of text, hierarchical parent→child, 5 seconds total per page)
- Rich graphical visualization: diagrams, flow charts, icon-based layouts
- Reduce text per slide — focus on visual demonstration for video
- Replace all emoji with flat UI library icons
- Single HTML file, 1000+ lines, no external dependencies
- Keyboard arrow keys and mouse wheel for page navigation
- Each slide: full viewport (100vw x 100vh)
Only demonstration effects needed — other webpage details can be ignored.
Output to: [path]
```

**Key requirements for generation:**
- Single HTML file, no external dependencies
- Dark or themed color scheme with accent colors
- Minimum 1000 lines of code for rich visual effects
- Keyboard arrow keys and mouse wheel for page navigation
- Each slide occupies full viewport (100vw x 100vh)

Save output to user-specified path. Default: `Desktop/AI_Animation.html`

### Step 2: PPT Template Restructuring

Select a PPT template from `templates/PPT-Template/` and restructure Step 1 output:

| Option | Template | Style |
|--------|----------|-------|
| 1 | PPT-Generate-1.html | Clean, CSS variables, modular structure |
| 2 | PPT-Generate-2.html | Chart-rich, data visualization |
| 3 | **PPT-Generate-3.html** | **Best visual effects (recommended)** — noise texture, particle canvas, deep blue theme |
| 4 | PPT-Generate-4.html | Flexible layout, adaptable |

Apply restructuring with this prompt:

```
Using templates/PPT-Template/[selected-template] as the template,
restructure [Step1-file-path]. Transform the style to match the template.
Reduce text per slide, increase font size, enhance graphical display,
use rich graphics alongside text for video presentation.
Replace all emoji icons with flat UI library icons.
```

**Mandatory:** Always include the instruction to replace emoji with flat UI icons.

### Step 3 (Optional): Flowchart Style

Triggered when the user requests "flowchart", "diagram view", or "process visualization".

Merge every two adjacent pages from Step 1, then apply an RNN template from `templates/RNN-Template/`:

| Option | Template | Style |
|--------|----------|-------|
| 1 | RNN-2.html | Comparison layout |
| 2 | **RNN-3.html** | **Layered cards (recommended)** — green theme, particle effects |
| 3 | RNN-4.html | Vertical flow |
| 4 | RNN-5.html | Branch structure |
| 5 | RNN-6.html | Tree diagram |
| 6 | RNN-7.html | Grid layout |

Apply with this prompt:

```
Merge adjacent two pages from [file-path], then restructure visually
following templates/RNN-Template/[selected-RNN-template] flat UI style.
Keep existing color scheme. Precisely replicate template layout structure,
spacing, typography, icon design, and visual hierarchy.
Ensure responsive design across devices. Optimize DOM structure
while maintaining functionality and interaction logic.
Perform visual consistency check — target 95%+ similarity with template.
```

---

## Output Configuration

| Method | Output Path |
|--------|-------------|
| Default | `Desktop/AI_Animation.html` |
| User-specified | Any valid path the user provides |

The user specifies the path naturally: "output to desktop", "save to D:\Videos\", "output to current project folder".

---

## Animation & Visual Enhancement

After base generation, apply enhancement prompts from `references/prompt-library.md` as needed:

- **Entrance animations** — Sequential element ease-in on page load/transition
- **Emphasis effects** — Persistent glow, highlight, hover effects
- **3D transforms** — Mouse-following 3D rotation, auto-rotation cycles
- **Loading screens** — 3-second loading splash on page open
- **Particle effects** — Canvas-based ambient particles
- **Noise textures** — SVG-based film grain overlay

Consult `references/prompt-library.md` for the full categorized prompt library (60+ prompts).

---

## Template Technical Specs

All templates share these characteristics:
- **Tech stack:** HTML5 + CSS3 + vanilla JavaScript (zero dependencies)
- **Animations:** CSS Animation / Keyframes / 3D Transform
- **Compatibility:** Chrome, Firefox, Safari, Edge
- **Layout:** Full viewport slides with overflow hidden
- **Navigation:** Arrow keys, mouse wheel, click navigation
- **Effects:** Noise overlay, particle canvas, gradient backgrounds

---

## Workflow Decision Tree

```
User provides content + output path
         |
         v
  Step 1: Generate base HTML slideshow
         |
         v
  Step 2: Apply PPT template (recommend PPT-Generate-3)
         |
         v
  User requests flowchart? --No--> Done
         |
        Yes
         v
  Step 3: Merge pages + apply RNN template (recommend RNN-3)
         |
         v
       Done
```

---

## Bundled Example Library (114 files)

The skill includes a complete library of working HTML animation examples in `assets/examples/`. Read these files as reference when generating new presentations to replicate proven visual patterns and code structures.

### Network Protocol Demos (root level)
Standalone animated demonstrations — read these as reference for technical topic presentations:
- **`assets/examples/tcp-visualization.html`** — TCP protocol with 3D effects and interaction
- **`assets/examples/HTTPS.html`** — HTTPS handshake visualization
- **`assets/examples/ipv4_datagram.html`** — IPv4 datagram structure
- **`assets/examples/ipv4_datagram - 3d.html`** — IPv4 with 3D rotation effects
- **`assets/examples/ethernet-frame-animated.html`** — Ethernet frame structure animation
- **`assets/examples/ppp_frame_complete.html`** — PPP frame visualization
- **`assets/examples/router-routing-table-animated.html`** — Router table with path highlighting
- **`assets/examples/switch-mac-table-animated.html`** — Switch MAC table animation
- **`assets/examples/3D - demonstrate.html`** — 3D transform showcase
- **`assets/examples/animation.html`** — General animation techniques demo

### AI/ML Concept Animations (`assets/examples/AI Model/`)
Neural network and ML model visualizations — reference for AI/data science topics:
- `GRU Introduce.html` — GRU architecture visualization
- `LSTM Introduce.html` — LSTM cell structure and gates
- `MLP.html` — Multi-layer perceptron
- `RNN.html` — Recurrent neural network flow

### Advanced Animation Techniques (`assets/examples/Animation/`)
Sophisticated animations for complex concepts — use as reference for animation patterns:
- `Comprehension.html` — Text comprehension visualization
- `Cross-modal disentanglement - 2.html` — Cross-modal concept
- `GPU.html` — GPU architecture graphical demo
- `LSTM-1.html` — LSTM detailed animation
- `onehot.html` / `onehot-drawback.html` — One-hot encoding visualization
- `word2vec-1.html` — Word embedding visualization
- `The fatal flaw of DNN.html` — DNN limitation illustration
- `RNN-2.html` ~ `RNN-7.html` — RNN concept series (6 variants with different layouts)

### Background Effects (`assets/examples/BG/`)
Reusable background templates — read and replicate these patterns for presentation backgrounds:
- `3D.html` — 3D perspective background
- `background.html` — Standard animated background
- `BG6.html` / `BG6 - white.html` — Particle backgrounds (dark/light)
- `BG7.html` — Advanced particle system
- `glasses.html` — Glass morphism effect
- `light spot.html` — Ambient light spot animation

### DHCP Protocol Series (`assets/examples/DHCP/`)
Complete protocol flow animation series — reference for step-by-step process presentations:
- `dhcp-discover.html` → `dhcp-offer-demo-v1-enhanced.html` → `dhcp-request.html` → `dhcp-acknowledgment.html` — Full DORA process
- `dhcp-demo.html` — Complete DHCP demo
- `dhcp-offer-packet-animated.html` — Packet-level animation
- `dhcp-attack-demo.html` — Security attack visualization

### PPT Template Examples (`assets/examples/PPT Template/`)
Additional PPT templates beyond the main templates/ directory:
- `PPT cover page.html` — Standalone cover page design (poster style)
- `PPT-Generate-1~4.html` — Original template variants

### Web Security Demos (`assets/examples/Pirated websites/`)
UI replication examples demonstrating high-fidelity page recreation — reference for UI accuracy:
- Login page recreations (QQ, WeChat, VPN, etc.)
- E-commerce page demos (Alipay, Momo Shopping, App Store)
- Social media UI demos (Bilibili variant, Douyin variant)
- Includes icon assets in `icon/` and `PNG/` subdirectories

### Additional Examples
- **`assets/examples/catch the packet/`** — Network packet capture simulation
- **`assets/examples/geometry/`** — Geometry generator with CSS/JS
- **`assets/examples/nice try/`** — Progressive iteration examples (1~5.html)

---

## UI Design Reference (`assets/ui-designs/`)

7 reference images demonstrating proven visual design patterns. Read these when the user requests a specific visual style:

| File | Style | Key Elements |
|------|-------|-------------|
| design1.png | Architecture diagram | Dark theme, yellow accents, card layout, connection arrows |
| design2.png | System flow | Green gradient, component boxes, data flow lines |
| design3.png | Content highlight | Green theme, bullet points, side panel |
| design4.png | Dashboard layout | Multi-panel, status indicators |
| design5.png | Multi-component | Purple/green accents, provider grid, flow connections |
| design6.png | Detailed module | Component breakdown, nested cards |
| timeline.png | Vertical timeline | Year markers, milestone nodes, description cards |

---

## How to Use Bundled Assets

### As Style Reference
When generating a new presentation, read the relevant example HTML to extract CSS patterns:
```
Read assets/examples/BG/BG6.html to replicate the particle background effect.
Read assets/examples/AI Model/LSTM Introduce.html to replicate the card layout.
```

### As Code Templates
Extract specific code patterns (animation keyframes, slide navigation JS, particle canvas):
```
Read assets/examples/PPT Template/PPT cover page.html for cover page poster design.
Read assets/examples/Animation/RNN-3.html for layered card layout patterns.
```

### As Visual Benchmarks
Open example HTML files in browser to verify generated output matches quality standards.

---

## Additional Resources

### Reference Files
- **`references/prompt-engineering-guide.md`** — Prompt design philosophy, interactive Q&A strategy, scenario-specific prompt templates, and anti-patterns to avoid. **Read this first when composing prompts.**
- **`references/prompt-library.md`** — Complete categorized prompt library (60+ prompts across 7 categories)
- **`references/workflow-guide.md`** — Detailed workflow guide with animation keywords, template selection advice, and real-world examples

### Template Files (primary)
- **`templates/PPT-Template/`** — 4 PPT-style HTML presentation templates
- **`templates/RNN-Template/`** — 6 flowchart-style HTML layout templates

### Asset Files
- **`assets/examples/`** — 114 working HTML animation examples across 10+ categories
- **`assets/ui-designs/`** — 7 UI design reference images

---

## Quick Example

**User input:**
> Help me create a presentation about TCP three-way handshake, output to desktop

**Execution:**
1. Generate 7-page base HTML with TCP handshake content + animations
2. Apply PPT-Generate-3.html template — deep blue theme, particle effects, interactive diagrams
3. (If requested) Apply RNN-3.html — layered card layout merging every 2 pages

**Output:** `Desktop/AI_Animation.html` — a self-contained, animated HTML presentation

---

## Related Commands

### `/repage` — Page-Specific Modification

After generating a presentation, use the `/repage` slash command to modify specific pages without regenerating the whole file.

**Usage:**
```
/repage                              # Full Q&A flow
/repage <file-path>                  # Skip file question
/repage <file-path> <page-number>    # Skip file and page questions
```

**What it does:**
- Guides the user through structured Q&A: target page → change type → requirements
- Applies the 8 design principles contextually (video-first, large text, animation sequencing, etc.)
- Composes an optimized compound prompt following the prompt engineering guide
- Previews the prompt for confirmation before modification
- Auto-validates the modification against all 8 principles post-execution

**Change type menu:**
1. Content — text/data edits
2. Layout — rearrangement
3. Animation — timing/sequencing
4. Visual Style — colors/theme
5. Typography — font size/emphasis
6. Icons — emoji → flat UI icons
7. Interactive FX — hover/3D/particles
8. Template Style — apply PPT/RNN template
9. Add / Remove — element-level changes
10. Multiple — combination

See `../../commands/repage.md` for the full command definition and Q&A flow.
