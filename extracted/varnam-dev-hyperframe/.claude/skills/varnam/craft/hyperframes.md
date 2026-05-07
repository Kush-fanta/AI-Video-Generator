# HyperFrames Practice

HyperFrames is not a template catalog with a different renderer. Treat it as the runtime authoring model: primitives, sprites, compositions, variables, and timed clips.

## Source Of Truth

- A video is an HTML composition project.
- The top-level project has `index.html`.
- Reusable/nested compositions live as separate HTML files under `compositions/`.
- Assets live beside the composition project, usually under `assets/`.
- Primitives and sprites are the design vocabulary inside those compositions; they are not selected from a generic card shelf.
- The root composition declares `data-composition-id`, `data-width`, and `data-height`.
- Timed visible elements use data attributes, not script lifecycle code.

## Two Layers

HTML owns primitive clips and timing:

- `<video>` for video clips
- `<img>` for stills and visual overlays
- `<audio>` for VO, music, ambience, and SFX
- `<div data-composition-id="...">` for nested compositions
- `data-start`, `data-duration`, `data-track-index`, `data-media-start`, `data-volume`

Script owns visual animation only:

- Use GSAP timelines with `{ paused: true }`.
- Register each timeline under `window.__timelines[compositionId]`.
- Use absolute GSAP positions for intentional timing.
- Never call `play()`, `pause()`, or set `currentTime` on media.
- Never use script to mount/unmount clips according to time.

## Clip Rules

- Visible non-media clips need `class="clip"` so HyperFrames manages visibility.
- `<video>` and `<audio>` do not use `class="clip"`; the framework manages media directly.
- Images need explicit `data-duration`.
- Video and audio may infer duration from source media, but long-form production should make duration explicit when editorial timing matters.
- Track index is z-order and overlap control; clips on the same track must not overlap.
- Relative `data-start` references resolve only inside the same composition and require the referenced clip to have known duration.

## GSAP Rules

- Always create paused timelines.
- Register the timeline key to match the composition root's `data-composition-id`.
- Use GSAP for transforms, opacity, color, and visual state.
- Do not directly animate `width`, `height`, `top`, or `left` on `<video>` elements. Wrap the video in a non-timed `<div>` and animate that wrapper.
- Do not manually add nested composition timelines to a parent timeline; HyperFrames nests them from composition timing.
- Extend the timeline explicitly with `tl.set({}, {}, durationSeconds)` when the composition duration must exceed the last visual animation.

## Variables

Reusable compositions expose variables with `data-var-*` attributes.

Callers pass values through `data-variable-values` on the nested composition element. In Varnam manifests this maps to `variables:`.

## CLI First

Use the HyperFrames CLI as the runtime authority:

```bash
npx hyperframes doctor
npx hyperframes compositions <dir>
npx hyperframes lint <dir> --json
npx hyperframes preview <dir>
npx hyperframes render <dir> --quality draft --output out/<slug>-draft.mp4
npx hyperframes render <dir> --docker --output out/<slug>.mp4
npx hyperframes info <dir> --json
```

Local render is for iteration. Docker render is the deterministic production/CI path.

## Review Order

1. `npx hyperframes doctor`
2. `npx hyperframes lint <dir>`
3. `npx hyperframes compositions <dir>` to confirm IDs and duration
4. `python3 scripts/run.py render:preflight projects/<slug> --require-lock`
5. `npx hyperframes render <dir> --quality draft --output ...`
6. `python3 scripts/run.py render:postflight projects/<slug> --video ...`

Do not approve a project because the catalog app boots or because a static screenshot looks plausible. HyperFrames lint plus a real render are the proof.

## Hard Bans

- No script-controlled media playback.
- No script-controlled clip visibility.
- No unseeded randomness in render-time code.
- No render-time network fetches.
- No missing `class="clip"` on timed visible elements.
- No GSAP timeline key mismatch.
- No composition whose GSAP timeline is shorter than the intended runtime.
- No direct dimension/position animation on `<video>` elements.
