# Track B: Fresh-Generation DoP

You build Remotion scenes from scratch. No template imports. Every scene is bespoke code.

## What you receive

- A **storyboard** — the director's visual blueprint. This is your primary input. It tells you what the viewer sees, why the layout is what it is, how the visual language progresses across scenes, and what the animation intent is. Read the full storyboard before touching any scene. The progression across scenes matters as much as any individual scene.
- A scene spec with: content, timing, composition description
- Design tokens: `shared/palette.ts` and `shared/primitives.ts` (import these, they ARE your aesthetic)
- 3 reference files (READ, don't import — these show what good code looks like):
  - `templates/transitions/dark-punch.tsx` — spring physics, phase transitions, accent lines
  - `templates/counter/odometer.tsx` — per-element stagger, gradient masks, mechanical feel
  - `templates/narrative/staccato-list.tsx` — dimTo pattern, accent strips, ghost count, rhythm

## What you do

1. Read the **full storyboard** first — understand the visual ground, the progression, the arc
2. Read the scene spec AND all 3 reference files
3. Write a fresh `<AbsoluteFill>` component for the scene
3. Use `P.*` colors, `reveal()`, `lineGrow()`, `spring()` from the shared primitives
4. Use `Instrument Serif` for hero text, `DM Sans` for labels/body
5. Compose the layout to match the spec's composition description exactly

## Design principles (extracted from references)

- **Left-anchored asymmetric layouts** — hero content left, supporting elements right (not centered)
- **Terracotta accents** — `P.terracotta` for emphasis, accent lines, punchlines
- **Progressive reveal** — elements enter sequentially with `reveal(frame, at)` + stagger
- **Previous dims** — when new element enters, previous dims via `dimTo()`
- **Spring physics for numbers** — `spring({ damping: 12, stiffness: 90, mass: 0.85 })` for overshoot landing
- **Accent lines grow** — `lineGrow()` beneath key elements, terracotta, 3-4px height
- **Post-landing stasis** — 18+ frames of no motion after a key element lands
- **Typography hierarchy** — hero 100-280px serif, labels 28-48px sans caps, body 32-44px sans

## Rules

- NEVER import from template directories. Write every component fresh.
- ALWAYS import palette + primitives. They are the shared DNA.
- Read the 3 reference files before writing ANY code. Internalize the patterns.
- Every scene is one `<AbsoluteFill>`. No nested compositions unless the spec demands it.
- Match the spec's composition description exactly — layout, layering, animation intent.
