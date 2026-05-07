# Timing Contract

Timing is simpler than the repo language makes it sound.

This is the whole model:

1. `audio/voiceover.words.json` is the timing authority for spoken lines.
2. Anything tied to speech anchors to that file.
3. Non-speech beats, including chapter breaks, use explicit `globalFrame` values on the same runtime clock.
4. `audio/timing.lock.json` proves the approved `words.json` and audio are the pair the build should use.
5. Full-film duration comes from explicit runtime timeline authority: the HTML composition root declares `data-composition-id`, `data-width`, and `data-height`; timed `.clip` elements declare `data-start`, `data-duration`, and `data-track-index`; animation is driven by a paused GSAP timeline registered in `window.__timelines`.
6. `preflight_render.py` and `postflight_render.py` are just wrappers that verify those rules before and after render.

The contract exists because timing drift is easy to hide:

- `words.json` can change after approval
- composition duration can be hardcoded somewhere else
- the runtime envelope can collapse to raw VO length even when the film needs held silence or visual-only beats
- the rendered mp4 can be built from stale timing inputs

The job of the contract is to make that drift visible.

## The Only Clocks

- Runtime clock: `globalFrame`
- Standard FPS: `30`
- Speech-timed authority: `audio/voiceover.words.json`
- Lock file: `audio/timing.lock.json`
- Full-composition duration authority: the approved runtime timeline envelope from HyperFrames composition metadata and timed clips

No dual-clock model is allowed in committed runtime artifacts.

Scene-local timing can exist during planning, but shipped runtime events must resolve to global frame coordinates.

## What Anchors To What

- Spoken reveals, captions, labels, or motion cues that should land on narration anchor to `voiceover.words.json`.
- Chapter breaks, silent bridges, and non-VO structural beats can use explicit `globalFrame`.
- Both still live on the same runtime clock.

That is why chapter breaks do not replace `words.json`. They solve macro structure, not micro timing. Both live on the same runtime clock.

## Wrapper Roles

- `scripts/run.py render:preflight` checks the timing contract before render.
- `scripts/run.py render:postflight` checks the same timing contract after render, then adds deterministic render analyzers.
- `timing_contract.py` contains the shared timing check itself.

The wrapper is not the rule source. The contract is.

## Runtime Duration

Full-film duration is not editorial guesswork.

- Use the approved HTML composition and timed `.clip` envelope as runtime authority
- Root composition must declare `data-composition-id`, `data-width`, and `data-height`
- Timed elements must declare `class="clip"`, `data-start`, `data-duration`, and `data-track-index`
- Register the paused GSAP timeline in `window.__timelines[compositionId]`
- Render with `npx hyperframes render --output <output.mp4>`
- That duration must be greater than or equal to the approved VO duration
- Do not treat style constants or planner estimates as full-composition duration authority unless they are the explicit runtime duration source
- `scene` events are still allowed for structural beats on the same global frame clock

## Event Shape

Every timed event must declare one mode:

- `timing_mode: "vo"`
- `timing_mode: "scene"`

### VO mode

```json
{
  "id": "ch5-warning-reveal",
  "timing_mode": "vo",
  "vo": {
    "word": "warning",
    "occurrence": 1,
    "offsetFrames": -6
  }
}
```

Resolution formula:

`globalFrame = Math.round(word.start * fps) + offsetFrames`

Rules:

- `fps` is fixed to `30`.
- `occurrence` is 1-based.
- `offsetFrames` defaults to `0`.
- Missing/unresolved anchors are fatal errors.

### Scene mode

```json
{
  "id": "chapter-bumper",
  "timing_mode": "scene",
  "scene": {
    "globalFrame": 420
  }
}
```

Rules:

- `globalFrame` is explicit and required.
- No implicit conversion from local scene clocks in runtime artifacts.

## Relationship To The Board/Manifest Contract

The board/manifest contract (see `docs/contracts/board-render-contract.md`) separates authored board decisions from derived render manifest addressing:

- `words: i` or `words: [i..j]` — indices into `audio/voiceover.words.json`
- `frames: f` or `frames: [f1..f2]` — global frames on the runtime clock

The timing contract is the execution layer. Every authored trigger resolves to a single `globalFrame` before render:

- `words: i` → `timing_mode: "vo"` → `globalFrame = Math.round(words[i].start * fps)`
- `frames: f` → `timing_mode: "scene"` → `globalFrame = f`

Ranges (`words: [i..j]` on a cut span) resolve to `[start_frame, end_frame]` the same way.

The authoring layer never writes milliseconds, `offsetFrames`, or word-text + occurrence matching — those belong to this contract, emitted by the resolver. The contract's simpler positional form is the source; the richer timing-event shape is the derivation.

## Lock Gate

`audio/timing.lock.json` must include:

- `words_sha256`
- `audio_duration_seconds`
- `styles_duration_seconds`
- `fps`
- `generated_at`

Recommended for stronger provenance:

- `audio_sha256` (content fingerprint of `audio/voiceover.mp3`)
- `pair_etag` (stable fingerprint derived from audio + words fingerprints)

Render preflight must fail when:

- lock is required but missing,
- words checksum differs from lock,
- words timeline is invalid,
- configured runtime duration is shorter than the approved VO duration.

## Validation Entry Points

- `python3 scripts/run.py render:preflight <project_dir> [--write-lock|--require-lock] [--video <path>]`
- `python3 scripts/run.py render:postflight <project_dir> [--video <path>]`
- `python3 scripts/audio/resolve_anchors.py --events <timing-events.json> --words <voiceover.words.json> --fps 30 --out <resolved.json>`
- `python3 scripts/audio/lock_timing.py <project_dir>`

`preflight_render.py` and `postflight_render.py` both call the shared timing contract. `postflight_render.py` also runs render analyzers and may report:

- `passed` when all required checks ran and passed
- `failed` when one or more required checks failed
- `partial` when one or more required checks were skipped because required inputs were missing

`partial` is a real diagnostic state, not a clean pass. Treat it as "review needed before ship."
