# Interactive Presentation Workflow Guide

## Complete Workflow Diagram

```
User provides content text + output path
              |
              v
+-------------------------------+
|  Step 1: Generate Base HTML   |
|  - Concatenate text + prompt  |
|  - AI generates HTML code     |
|  - Save to user-specified path|
+-------------------------------+
              |
              v
+-------------------------------+
|  Step 2: PPT Template Restyle |
|  - User selects template (1-4)|
|  - AI restructures page style |
|  - Force emoji -> UI icons    |
+-------------------------------+
              |
              v
      User requests
      "flowchart view"?
              |
         Yes  |  No
              v       v
+----------------+    Done
| Step 3: RNN    |
| Template Restyle|
| - Merge 2 pages|
| - Apply RNN tpl|
+----------------+
```

---

## Step-by-Step Execution Guide

### Step 1: Base HTML Generation

**Input:** User's text content (educational, technical, or any topic)

**Process:**
1. Read the user's content in full
2. Concatenate with the base generation prompt (see prompt-library.md, Section 4)
3. Generate a complete single-file HTML with:
   - Full viewport slides (100vw x 100vh)
   - Dark/themed color scheme
   - Sequential ease-in animations per element
   - Keyboard (arrow keys) and mouse wheel navigation
   - Progress indicator
4. Save to user-specified path

**Core Generation Prompt:**
```
Based on the above content, generate a pure frontend single-page layout
with PPT-style slide carousel for intuitive graphical visualization.
Use large text with bold, underline, italic, text color, and text background
emphasis for video demonstration. Add sequential "ease-in" entrance animations
for each page transition (down to each line of text).
```

**Quality Checklist:**
- [ ] All content covered across slides
- [ ] Animations play correctly on page transitions
- [ ] Navigation works (arrow keys, scroll, click)
- [ ] Text is large and readable for video recording
- [ ] Graphical elements enhance understanding

### Step 2: PPT Template Restructuring

**Input:** Step 1 output file + selected template

**Template Selection Guide:**

| Template | Visual Style | Best For | Complexity |
|----------|-------------|----------|------------|
| PPT-Generate-1.html | Clean, modular, CSS variables | Professional presentations, code demos | Medium |
| PPT-Generate-2.html | Chart-rich, data-focused | Data-heavy content, statistics, comparisons | Medium |
| **PPT-Generate-3.html** | **Dark blue + noise + particles** | **General use, maximum visual impact** | **High** |
| PPT-Generate-4.html | Flexible layout, adaptable | Complex multi-element content | Medium |

**Restructuring Prompt:**
```
Using templates/PPT-Template/[template-name] as the template,
restructure [Step1-file-path].
Transform the page style to match the selected template.
Reduce text per slide, increase font size, enhance graphical display,
use rich graphics alongside text for video presentation.
Replace all emoji icons with flat UI library icons.
```

**Mandatory Rules:**
1. Always include "replace emoji with flat UI library icons"
2. Read the template file before applying — let AI understand the full style
3. Preserve all content from Step 1, just restyle it

### Step 3: Flowchart / RNN Template (Optional)

**Trigger:** User says "generate flowchart", "diagram view", "process visualization", or similar

**Input:** Step 1 output file + selected RNN template

**Template Selection Guide:**

| Template | Layout Style | Best For |
|----------|-------------|----------|
| RNN-2.html | Side-by-side comparison | Before/after, old vs new |
| **RNN-3.html** | **Layered cards, green theme** | **Step-by-step processes, hierarchies** |
| RNN-4.html | Vertical top-to-bottom flow | Linear sequential processes |
| RNN-5.html | Branching structure | Decision trees, conditional flows |
| RNN-6.html | Tree diagram | Organizational hierarchies |
| RNN-7.html | Grid layout | Parallel modules, feature comparisons |

**Restructuring Prompt:**
```
Merge every two adjacent pages from [file-path],
then restructure visually following templates/RNN-Template/[template-name]
flat UI style. Keep existing color scheme.
Precisely replicate the template's layout structure, element spacing,
font styles, icon design, and visual hierarchy.
Ensure all interactive elements are visually consistent with the template.
Maintain original color values. Ensure responsive design.
Optimize DOM structure while maintaining functionality and interaction logic.
Perform visual consistency check — target 95%+ similarity with template.
```

---

## Animation Enhancement Keywords

Use these keywords in follow-up prompts to enhance specific aspects:

| Keyword | Effect | When to Use |
|---------|--------|-------------|
| Ease-in animation | Sequential element entrance | Every page transition |
| Emphasis effect | Persistent glow/highlight | Key concepts, important data |
| Graphical display | Icons, charts, diagrams | Replace text-heavy sections |
| PPT carousel | Slide-based navigation | Multi-topic content |
| 3D effect | Depth, rotation, perspective | Hero sections, key modules |
| Glow/bloom effect | Luminous element outlines | Headers, interactive elements |
| Loading screen | Splash page on open | Polished presentation start |
| Particle effects | Ambient floating particles | Background atmosphere |
| Noise texture | Film grain overlay | Professional dark themes |
| Kaomoji elements | Anime-style emoticons | Casual/educational tone |

---

## Real-World Example: OSI Seven-Layer Model

### User Input
> The International Organization for Standardization (ISO) proposed the
> "Open Systems Interconnection Reference Model" (OSI/RM) in 1978...

### Step 1 Result (7 pages)
- Cover page: OSI Seven-Layer Model
- Background introduction
- Seven-layer overview (color-coded layers)
- Core responsibilities per layer (table)
- OSI vs TCP/IP comparison
- Transport layer as core hub
- Summary

### Step 2 Result (PPT-Generate-3)
- Cyan theme + particle effect background
- Cover with rotating ring decoration
- Interactive seven-layer model (hover zoom)
- OSI vs TCP/IP comparison table
- Transport layer hub flowchart

### Step 3 Result (RNN-3)
- Dark green background + cyan particles
- Layered card architecture:
  - User Layer (L7-L5): Application, Presentation, Session
  - Transport Layer (L4): TCP/UDP, Data Segments
  - Network Layer (L3): IP, Packets
  - Physical Layer (L2-L1): Frames/Bit Streams
- Data encapsulation flow visualization
- Protocol tags with color-coded labels per layer
- Bottom comparison cards

### Final Output
`Desktop/AI_Animation.html` — Self-contained animated presentation

---

## Output Path Configuration

```
User-specified path / AI_Animation.html
         |
         +-- Default: Desktop/AI_Animation.html
         +-- User-specified: D:\Videos\AI_Animation.html
         +-- Current project: ./output/AI_Animation.html
```

**Path specification methods:**
- "Output to desktop"
- "Save to D:\Videos\"
- "Output to current project folder"
- "Save next to the source file"

---

## Common Issues & Solutions

### Issue: Animations not playing in correct order
**Solution:** Use the animation sequencing prompt from prompt-library.md Section 2 to specify exact element order.

### Issue: Too much text per slide
**Solution:** Apply "reduce PPT text, increase font size, enhance graphical display" prompt.

### Issue: Emoji icons look inconsistent
**Solution:** Always include "replace emoji with flat UI library icons" in every restructuring prompt.

### Issue: Page navigation not working
**Solution:** Ensure the generated code includes keyboard event listeners for arrow keys and scroll wheel handlers.

### Issue: Template style not fully applied
**Solution:** Read the full template file first and include it in context, then ask AI to restructure to match 95%+ similarity.

---

## UI Design Reference

The `assets/ui-designs/` directory contains reference images demonstrating proven visual styles:

| File | Description | Key Elements |
|------|-------------|--------------|
| design1.png | Architecture diagram | Dark theme, yellow accents, card layout, connection arrows |
| design2.png | System flow | Green gradient, component boxes, data flow lines |
| design3.png | Content highlight | Green theme, bullet points, side panel |
| design4.png | Dashboard layout | Multi-panel, status indicators |
| design5.png | Multi-component arch | Purple/green accents, provider grid, flow connections |
| design6.png | Detailed module view | Component breakdown, nested cards |
| timeline.png | Vertical timeline | Year markers, milestone nodes, description cards |

Use these as visual reference when requesting UI restructuring with the "UI Replacement" prompts from prompt-library.md Section 7.

---

## Example File Reference Guide

The `assets/examples/` directory contains 114 working HTML files organized by category. Use these as code-level references when generating presentations.

### By Topic — Which Example to Read

| User Topic | Reference Files to Read |
|-----------|------------------------|
| Network protocols | `tcp-visualization.html`, `HTTPS.html`, `ipv4_datagram.html`, `ethernet-frame-animated.html` |
| Protocol handshakes | `DHCP/dhcp-discover.html` through `dhcp-acknowledgment.html` (full DORA sequence) |
| AI/ML concepts | `AI Model/LSTM Introduce.html`, `AI Model/RNN.html`, `AI Model/MLP.html` |
| Neural networks | `Animation/RNN-2~7.html`, `Animation/word2vec-1.html`, `Animation/LSTM-1.html` |
| 3D visual effects | `3D - demonstrate.html`, `ipv4_datagram - 3d.html` |
| Background effects | `BG/background.html`, `BG/BG6.html`, `BG/light spot.html`, `BG/glasses.html` |
| PPT cover design | `PPT Template/PPT cover page.html` |
| UI replication | `Pirated websites/` (high-fidelity page recreations for UI accuracy reference) |
| Step-by-step process | `DHCP/` series, `Animation/RNN-2~7.html` progressive series |
| Router/Switch | `router-routing-table-animated.html`, `switch-mac-table-animated.html` |

### By Technique — Which Pattern to Extract

| Technique Needed | Example File | What to Extract |
|-----------------|-------------|-----------------|
| Particle canvas background | `BG/BG6.html`, `BG/BG7.html` | Canvas JS + requestAnimationFrame loop |
| CSS noise texture overlay | `PPT Template/PPT-Generate-3.html` | SVG filter + mix-blend-mode overlay |
| Slide carousel navigation | `PPT Template/PPT-Generate-1.html` | Keyboard event listeners + slide transition |
| Sequential ease-in entrance | `Animation/Comprehension.html` | CSS animation-delay staggering pattern |
| 3D mouse-follow rotation | `3D - demonstrate.html` | CSS perspective + JS mousemove handler |
| Glass morphism effect | `BG/glasses.html` | Backdrop-filter + frosted glass CSS |
| Layered card layout | `Animation/RNN-3.html` | Flexbox cards with animation hierarchy |
| Data flow arrows | `DHCP/dhcp-offer-packet-animated.html` | SVG/CSS animated dashed lines |
| Interactive hover zoom | `AI Model/LSTM Introduce.html` | CSS transform:scale on :hover |
| Loading splash screen | `Animation/GPU.html` | Loading overlay with setTimeout |

### File Count by Category

| Category | Files | Primary Use |
|----------|-------|-------------|
| Root-level demos | 10 | Network protocol presentations |
| AI Model/ | 4 | ML architecture visualization |
| Animation/ | 14 | Advanced animation patterns |
| BG/ | 7 | Background effect templates |
| DHCP/ | 7 | Step-by-step protocol flows |
| PPT Template/ | 5 | Slide presentation structures |
| Pirated websites/ | ~50 | UI accuracy/replication reference |
| catch the packet/ | 1 | Interactive simulation |
| geometry/ | 4 | Geometry/math visualization |
| nice try/ | 5 | Progressive iteration examples |
