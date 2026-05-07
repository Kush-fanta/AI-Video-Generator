# Image-to-SVG Animation

Turn any AI-generated image into an animated SVG draw-on sequence. The PNG is a tracing guide — only the bezier paths survive into the final render.

## The Insight

AI image models can draw anything convincingly. SVG animation can make anything draw itself. These two facts combine into a pipeline that didn't exist before generative models: **describe a subject in natural language → get a traceable image → get an animated technical diagram.**

The image never appears in the final video. It's scaffolding.

---

## When to Use This

The editor's spec indicates when a beat uses the image-to-SVG pipeline. Common subjects include:
- Technical diagrams: aircraft profiles, ship cross-sections, weapon schematics, engine cutaways
- Architectural drawings, city plans, structural blueprints
- Historical illustrations, maps of fictional places, scientific diagrams

**Do not use for real geographic maps.** Use D3 + Natural Earth TopoJSON instead. Potrace is for illustrated subjects, not cartography.

---

## The Pipeline

### Step 1 — Generate the image

Prompt nano-banana for **technical line-art on pure black**:

```
[Subject], perfect technical side-profile, pure black background,
crisp white line-art technical drawing style, no fills no gradients
no text no labels, high contrast clean illustration
```

Key prompt constraints:
- `pure black background` — potrace needs high contrast
- `crisp white line-art` — clean edges = clean bezier curves
- `no fills no gradients` — filled areas produce noise in the trace
- Side-profile or front-facing orthographic views trace better than perspective

Use `--aspect-ratio 16:9 --size 2K` for a component that fills a 1920×1080 frame.

### Step 2 — Trace with potrace

```python
from PIL import Image
import numpy as np, subprocess

img = Image.open("subject.png").convert("L")
arr = np.array(img)
binary = (arr > 30).astype(np.uint8) * 255
inverted = 255 - binary  # potrace reads black-on-white
bmp = Image.fromarray(inverted.astype(np.uint8), "L").convert("1")
bmp.save("subject.bmp")

subprocess.run([
    "potrace", "subject.bmp", "-s", "-o", "subject.svg",
    "--alphamax", "1",       # curve smoothing
    "--opttolerance", "0.2", # faithful to original shape
    "--unit", "1",           # output in pixels
])
```

`--unit 1` is critical — it outputs path coordinates in the source image's pixel space, making coordinate math straightforward.

### Step 3 — Extract path data

```python
import re
svg = open("subject.svg").read()
paths = re.findall(r'd="([^"]+)"', svg)
# Write to a .ts constants file
with open("src/lib/subject-paths.ts", "w") as f:
    for i, p in enumerate(paths):
        f.write(f'export const POTRACE_{i} = `{p}`;\n\n')
```

Potrace typically produces 5–15 paths for a clean line-art image. Path 0 is almost always the dominant shape (hull, fuselage, main body).

### Step 4 — Embed in the runtime component

Potrace uses **bottom-left origin** (y increases upward). SVG uses top-left origin (y increases downward). Fix with a group transform, and scale to the component's viewBox in the same transform:

```tsx
const imageW = 1376; // potrace viewBox width (actual PNG pixel dimensions)
const imageH = 768;
const SX = 1920 / imageW;
const SY = 1080 / imageH;

// Single combined transform: scale to component size + flip y
const groupTransform = `scale(${SX},${SY}) translate(0,${imageH}) scale(1,-1)`;

<g transform={groupTransform} fill="none" stroke={traceStroke}
   strokeWidth={2 / SX}  // compensate so stroke appears ~2px after scale
>
  <path d={POTRACE_0} ... />
</g>
```

### Step 5 — Animate with stroke-dashoffset

```tsx
const PATH_LEN = 14000; // overestimate — too large is fine, too small clips the path

const progress = interpolate(frame, [startFrame, endFrame], [0, 1], {
  extrapolateLeft: "clamp", extrapolateRight: "clamp",
});

<path
  d={POTRACE_0}
  strokeDasharray={PATH_LEN}
  strokeDashoffset={PATH_LEN * (1 - progress)}
/>
```

Stagger detail paths after the main shape:

```tsx
// Main body: frames 5–60
// Details/fittings: fade in frames 45–62
<path d={POTRACE_0} strokeDashoffset={PATH_LEN * (1 - mainProgress)} />
<g opacity={interpolate(frame, [45, 62], [0, 1], { extrapolateRight: "clamp" })}>
  <path d={POTRACE_1} />
  <path d={POTRACE_2} />
  ...
</g>
```

---

## Callout Anchor Coordinates

Potrace point `(px, py)` → final 1920×1080 space:

```
finalX = px * SX
finalY = (imageH - py) * SY   ← y is flipped
```

Use this to position callout line anchors precisely on the traced subject.

---

## SVG Filter Stack (Glow, Bloom, Atmosphere)

SVG filter stack for glow, bloom, and atmosphere effects:

```tsx
<defs>
  {/* Standard glow — apply to all stroke elements */}
  <filter id="glow" x="-20%" y="-20%" width="140%" height="140%">
    <feGaussianBlur in="SourceGraphic" stdDeviation="3" result="blur" />
    <feComposite in="SourceGraphic" in2="blur" operator="over" />
  </filter>

  {/* Strong bloom — accents, flashes, active elements */}
  <filter id="glow-strong" x="-30%" y="-30%" width="160%" height="160%">
    <feGaussianBlur in="SourceGraphic" stdDeviation="6" result="blur1" />
    <feGaussianBlur in="SourceGraphic" stdDeviation="2" result="blur2" />
    <feMerge>
      <feMergeNode in="blur1" />
      <feMergeNode in="blur2" />
      <feMergeNode in="SourceGraphic" />
    </feMerge>
  </filter>

  {/* Soft glow — fills, background shapes */}
  <filter id="glow-soft" x="-10%" y="-10%" width="120%" height="120%">
    <feGaussianBlur in="SourceGraphic" stdDeviation="8" />
  </filter>

  {/* Vignette — darken edges */}
  <radialGradient id="vignette" cx="50%" cy="50%" r="70%">
    <stop offset="0%" stopColor="transparent" />
    <stop offset="100%" stopColor="black" stopOpacity="0.6" />
  </radialGradient>
</defs>
```

**Usage hierarchy:**
- `filter="url(#glow)"` on all visible stroke groups — makes lines look like they emit light
- `filter="url(#glow-strong)"` on accents: propeller hub, torpedo flash, HUD text
- `filter="url(#glow-soft)"` on a duplicate fill layer behind the main shape — creates a soft halo underneath the subject
- `<rect fill="url(#vignette)" />` as the last layer — darkens edges, focuses the eye

**The soft halo trick:** Render the main path twice — once as a fill with the active stroke color at very low opacity (`fill={traceStroke} opacity={0.04}`) through `glow-soft`, then the normal stroke version on top. This creates a subtle glow field behind the subject that separates it from the background.

**Atmosphere layer:** A full-frame `<rect fill="url(#depth-grad)" />` with a vertical `linearGradient` (using the scene's depth color at 3–6% opacity) adds environmental depth without obscuring the subject.

Always place atmosphere + vignette as the **last SVG children** so they composite on top of everything.

---

## Animated Sub-elements

Once the potrace paths are embedded, individual mechanical parts can be animated independently:

**Isolating parts from the main path:** Use `<clipPath>` to hide a region of the traced SVG, then replace it with a custom animated version:
```tsx
<clipPath id="hull-no-prop">
  <rect x="0" y="0" width={clipBoundary} height={imgH} />
</clipPath>
<g clipPath="url(#hull-no-prop)">
  <path d={POTRACE_0} ... />  {/* Main hull, propeller area clipped out */}
</g>
<AnimatedPropeller />  {/* Custom animated element in the clipped region */}
```

**Rotation** — propellers, radar dishes, turrets: wrap in `<g>` and rotate around the element's center point each frame.

**Translation** — the entire subject moving through frame: wrap all sub paths in a translated group. Add wake/trail particles behind it.

**Reveal** — periscopes, antennas extending: animate a `line` element's y2 coordinate, or use clipPath height.

**Projectiles** — torpedoes, missiles: interpolate a new shape from the launch point outward. Add a flash at origin (`glow-strong` on a circle that fades out in 4–6 frames) and a bubble/exhaust trail behind.

---

## Subtlety

- **Fill the main shape subtly** — `fill={depthFill} opacity={0.12}` on the primary path gives depth without competing with the stroke animation
- **Stroke width compensation** — always divide stroke width by `SX` when inside a scaled group
- **PATH_LEN estimation** — run `pathEl.getTotalLength()` in browser devtools if you need precision; otherwise 10000–20000 is safe for most subjects
- **Multiple render passes** — if the first potrace trace is noisy, try `--opttolerance 0.5` for smoother curves at the cost of some fidelity
- **Particle fields** — 30–50 floating specks with varying lifetime, drift, and opacity fade add underwater/atmospheric feel. Use seeded pseudo-random offsets (`i * 137.508`) for stable positions across frames
- **HUD/telemetry** — depth bars, headings, and readouts with `letterSpacing` and tiered font sizes (`tspan` for units) can support a technical-overlay look when the storyboard calls for it
