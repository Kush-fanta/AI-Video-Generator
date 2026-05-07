---
name: hyperframes
description: Author, validate, preview, and render Varnam HyperFrames composition projects.
argument-hint: "[doctor|lint|preview|render|composition|fix]"
---

# HyperFrames Runtime

Use this skill when work touches the executable video runtime.

Read first:

- `.claude/skills/varnam/craft/hyperframes.md`
- `docs/contracts/timing-contract.md`
- `docs/contracts/board-render-contract.md`

## Runtime Model

HyperFrames source is HTML. Do not translate the work back into the old template catalog model.

Project shape:

```text
projects/<slug>/hyperframes/
  index.html
  compositions/
  assets/
```

Shared reusable compositions may live in a shared library, but the executable project is still a HyperFrames composition directory with an `index.html`.

## Commands

From repo root:

```bash
python3 scripts/run.py hyperframes:doctor
python3 scripts/run.py hyperframes:lint projects/<slug>/hyperframes --json
python3 scripts/run.py hyperframes:compositions projects/<slug>/hyperframes
python3 scripts/run.py hyperframes:preview projects/<slug>/hyperframes
python3 scripts/run.py hyperframes:render projects/<slug>/hyperframes --quality draft --output out/<slug>-draft.mp4
python3 scripts/run.py hyperframes:info projects/<slug>/hyperframes --json
```

Use Docker mode for deterministic production/CI renders:

```bash
python3 scripts/run.py hyperframes:render projects/<slug>/hyperframes --docker --output out/<slug>.mp4
```

## Authoring Rules

- Root composition has `data-composition-id`, `data-width`, and `data-height`.
- Timed visible clips have `class="clip"` plus `data-start`, `data-duration`, and `data-track-index`.
- Video/audio clips use data attributes for playback and volume; scripts do not control media.
- GSAP timelines are `{ paused: true }` and registered in `window.__timelines` with the composition id.
- Nested compositions register their own timelines; do not manually add them to a parent.
- Use `data-variable-values` for reusable composition inputs.

## Manifest Binding

`direction/render-manifest.yaml` binds renderable cuts with:

```yaml
composition: "compositions/card.html#card"
variables:
  title: "..."
  accent: "#FFCC00"
```

`composition` names the executable HyperFrames composition or nested composition target. `variables` maps to `data-variable-values` / `data-var-*` inputs.

Do not use `template:` / `props:` for new work.

## Exit Evidence

Return:

- composition path(s)
- `npx hyperframes lint` result
- composition duration from `npx hyperframes compositions` or `info`
- rendered MP4 path for runtime changes
- postflight report path when a video render exists
