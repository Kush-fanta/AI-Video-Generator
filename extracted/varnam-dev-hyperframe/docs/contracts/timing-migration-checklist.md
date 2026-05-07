# Timing Migration Checklist (Phase 2)

Use this checklist per project (`bengal-curve`, `gcc-v2`, `pfbr`) after Phase 1 foundation lands.

## 1) Enable HyperFrames runtime duration authority

- Create or update the HTML composition root with `data-composition-id`, `data-width`, and `data-height`.
- Encode timed elements as `.clip` nodes with `data-start`, `data-duration`, and `data-track-index`.
- Register a paused GSAP timeline in `window.__timelines[compositionId]`.
- Remove full-composition dependency on hardcoded total-duration constants.

## 2) Migrate VO-synced events to anchor resolver

- Replace guessed frame literals for VO beats with `timing_mode: "vo"` event definitions.
- Resolve frames from `voiceover.words.json` via anchor resolver.
- Fail build/render when an anchor cannot be resolved.

## 3) Keep editorial beats explicit in scene mode

- Encode non-VO beats with `timing_mode: "scene"` and `scene.globalFrame`.
- Keep these values global-frame based; do not add local scene clocks to runtime data.

## 4) Gate render with timing lock

- Generate lock after approved VO: `scripts/audio/lock_timing.py`.
- Require lock parity before render: `python3 scripts/run.py render:preflight --require-lock`.
- Regenerate lock intentionally after VO changes.

## 5) Validate after migration

- Unit checks for anchor resolution and timing mode validation.
- Preflight checks pass for words/audio/style duration parity.
- Smoke render with `npx hyperframes render --output <output.mp4>` verifies key VO anchors land within tolerance (default +/-2 frames).
