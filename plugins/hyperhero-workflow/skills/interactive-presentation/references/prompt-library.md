# Interactive Presentation Prompt Library

> 60+ verified prompts for generating animated HTML presentations, organized by category.
> Select and adapt prompts based on the desired visual effect.

---

## 1. Page Generation (8 prompts)

Base prompts for generating initial HTML pages with visual effects.

```
Generate a pure frontend page demonstrating the above content, using dark cool tones,
with more graphical effects. Only demonstration effects are needed,
other webpage details can be ignored. Require 1000+ lines of code.
```

```
Generate a pure frontend page demonstrating the above content, using dark cool tones
with XX color as accent. More graphical effects, only demonstration effects needed,
other details can be ignored. (Require 1000+ lines of code),
(also use PPT-style page carousel effect)
```

```
Generate a pure frontend page demonstrating XXX, using white as primary color
with other cool colors, pink as accent. More graphical effects,
only demonstration effects needed, other details can be ignored.
Require 1000+ lines of code.
```

```
Generate a pure frontend page demonstrating the above content,
using background.html as background. More graphical effects,
only demonstration needed, other details can be ignored.
Require 1000+ lines of code.
```

```
Use web frontend code to generate a pink info card,
content is about "dual-link access" educational material.
```

```
Generate a webpage simulating XX (firewall filtering traffic by IP and port),
require high completion, 800+ lines of code.
```

```
Generate a webpage XX (firewall filtering traffic by IP and port),
using dark tones, primarily focusing on graphical and dynamic display effects,
displayed within one screen. Require high completion, 1000+ lines of code.
```

---

## 2. Animation Effects (16 prompts)

Prompts for adding entrance, emphasis, and interactive animations.

### Entrance Animations

```
Add a loading page when opening this webpage, loading time is 3 seconds.
```

```
Implement sequential "ease-in" entrance animation for each element when opening
this webpage, and add transition animations when switching between scenes.
```

```
Implement sequential "ease-in" entrance animation when opening this webpage,
except the title and "class='section'" borders and backgrounds are visible by default,
all other elements within sections appear sequentially.
```

```
Implement sequential "ease-in" entrance animation when opening this webpage,
except the upper-right watermark, all other elements appear sequentially,
total appearance time: 5 seconds.
```

```
Make the text content within div class="warning-text" also appear sequentially.
```

### Timing & Sequencing

```
Modify animation playback times, requiring the entire page to load in 5 seconds.
```

```
Refine animation effects: implement ordered sequential appearance for all
functional modules and their child elements. Requirements:
1. Establish clear hierarchical animation relationships between parent modules
   and child elements, ensuring natural animation transitions
2. Apply the same level of detail to all other functional modules
3. Ensure unified timing curves and transition rhythms, avoiding visual chaos
4. Maintain consistent design language for duration, delay, and transitions
```

```
Optimize animation effects based on element content type.
```

### Emphasis & Continuous Effects

```
Add persistent "emphasis effect" animation to webpage elements.
```

```
Add emphasis effect to "XX" (e.g., add emphasis to the "Gateway IP" field).
```

```
Add persistent looping flow animation to dashed arrow elements,
keeping the arrow in a dynamic state after initial appearance animation completes.
```

```
Replace arrows with dashed arrows. Add persistent looping flow animation
to dashed arrow elements, keeping dynamic state after initial appearance.
```

```
For all elements with mouse hover glow effect,
set the glow effect as the default state (always active).
```

### Special Effects

```
Add some kaomoji to the webpage to give it an anime aesthetic.
```

```
I noticed the "ai-arch-diagram" module's animation does not follow the sequence:
"Human Language" -> (input arrow) -> "Semantic Representation" -> (vector arrow) ->
"Sequence Modeling" -> (understanding arrow) -> "AI Understanding".
```

---

## 3. 3D Effects (4 prompts)

Prompts for adding three-dimensional visual effects.

```
CapCut transform: Top-left (-500X,500Y)  Top-right (0X,0Y)
Bottom-left (0X,0Y)                       Bottom-right (-500X,500Y)
```

```
Add 3D effect to this animation.
```

```
Add 3D rotation effect to X module: when mouse moves to page left side,
module Y-axis rotates left; when mouse moves to right side, Y-axis rotates right.
```

```
Add 3D rotation effect to X module: rotate from Y-axis 15 degrees left
to Y-axis 15 degrees right, each cycle lasting 60 seconds.
```

---

## 4. PPT Style (12 prompts)

Prompts for generating and refining PPT-style slide presentations.

### Base PPT Generation

```
Generate a pure frontend single-page layout with PPT-style carousel
for intuitive visual introduction of XXX.
```

```
Configure each independent functional module to occupy a full page.
Implement a carousel (PPT) page switching mechanism with:
1) Independent module page rendering, ensuring full page space per module
2) Carousel controls: auto-play/pause, manual prev/next switching
3) Configurable parameters: switch animation, interval time, transition duration
4) Responsive design across devices
```

```
Based on the above content, generate a pure frontend single-page PPT-style carousel
with intuitive graphical visualization. Use large text with bold, underline, italic,
text color, and background emphasis for video demonstration.
Add sequential "ease-in" entrance animations on each page transition
(down to each line of text).
```

### Template-Based Restructuring

```
Use PPT-Generate-3.html as template to present the above content.
```

```
Use page Seedance 2.0.html as template to restructure XXX.
(Template: remove XXX from first page, remove pause and reset buttons
from XX page, set to auto-loop 1 second after page transition)
```

```
Merge page X and X content from x.html, restructure according to
the specified image's flat UI style. Keep existing color scheme.
Precisely replicate layout structure, spacing, typography, icon design,
and visual hierarchy. Ensure responsive design. Optimize DOM structure
while maintaining functionality. Target 95%+ visual similarity.
```

### Visual Enhancement

```
Reduce PPT text per slide, increase font size, enhance graphical display
for video presentation.
```

```
Enhance PPT graphical demonstration, use rich graphics alongside text
for video presentation.
```

```
Increase text size, optimize layout, apply bold, underline, italic,
text color, and background emphasis for better video demonstration.
```

### UI Cleanup

```
Remove page numbers (top-right and bottom), remove bottom navigation hint
"arrow keys / scroll / click to switch", remove top progress bar,
but keep keyboard navigation functionality.
```

### Cover Page Design

```
Based on x.html, design a single-page website with PPT cover poster style,
showcasing "XXXXX" theme. Include prominent title area, core concept overview,
key feature visualization within one page. Use layered visual effects,
academic-appropriate color scheme. Include large title text, concise diagrams,
key feature list, and proper whitespace for PPT-level visual impact.
```

### Anime Style

```
Add anime-style kaomoji elements to x.html to enhance visual atmosphere.
Place kaomoji at appropriate positions (titles, section breaks, interaction elements).
Ensure kaomoji don't affect layout or functionality. Choose common anime kaomoji types,
adjust size and color to match page design. Do NOT add emoji symbols —
use UI library icons instead.
```

---

## 5. Tool-Specific (Trae) (6 prompts)

Prompts optimized for specific AI coding tools.

```
Reset this webpage's layout, beautify it, use Tailwind CSS library.
```

```
Replace 1.html's background with background.html's background.
```

```
Modify content, compress everything into one screen.
```

```
Improve this XXX page's content and details.
```

```
Merge #script.js and #style.css into #index.html.
```

```
Change background and page style to match #Diffusion.html.
```

---

## 6. Beautification (6 prompts)

Prompts for visual enhancement and polish.

```
Beautify webpage content and visualization effects,
add dynamic effects, enhance webpage dynamism.
```

```
Restructure page based on current content, enhance graphical effects.
```

```
Add "glow" or "bloom" effects to webpage elements.
```

```
Add mouse-hover "emphasis" effects to elements (except titles).
```

```
Replace some text descriptions with illustrated descriptions,
enhance graphical representation for more vivid demonstrations.
```

```
1.png is a character illustration. Place it on 2.html's first page,
showing only the upper half, scaled to fill the full page height.
Ensure the character addition doesn't affect page navigation functionality.
```

---

## 7. UI Replacement (4 prompts)

Prompts for visual restructuring based on reference images.

```
Restructure x.html webpage following the specified image's flat UI style.
Keep existing color scheme. Requirements:
- Precisely replicate layout structure, spacing, typography, icon design, visual hierarchy
- Ensure all interactive elements match the reference visually
- Maintain original color values and scheme
- Ensure responsive design across devices and browsers
- Optimize DOM structure while maintaining functionality
- Perform visual consistency check — target 95%+ similarity
```

```
Merge pages 6-9 from x.html, restructure following the specified image's
flat UI style. Keep existing color scheme. [Same detailed requirements as above]
Save restructured page to xx.html.
```

```
Modify webpage to match the image's flat UI design style (keep colors unchanged).
```

```
Replace emoji icons with flat UI library icons.
```

---

## Usage Tips

1. **Combine prompts** — Use a page generation prompt + animation prompt + PPT prompt for best results
2. **Iterate** — Generate base first, then apply enhancement prompts one at a time
3. **Template first** — When restructuring, always read the template file to let AI understand the target style
4. **Emoji rule** — Always include "replace emoji with flat UI icons" in restructuring prompts
5. **Code length** — Specify "1000+ lines" for rich visual effects, "800+" for simpler pages
