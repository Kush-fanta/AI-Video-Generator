# Flight Checks

One timing system, two wrappers:

- `voiceover.words.json` is the speech timeline
- explicit `globalFrame` values cover non-VO structure such as chapter breaks
- `timing.lock.json` proves the approved words/audio pair
- `scripts/review/preflight_render.py` checks that contract before render
- `postflight_render.py` checks the same contract after render, then adds render analyzers

## Preflight

Run before any runtime render.

- Validate `audio/voiceover.mp3` and `audio/voiceover.words.json`
- Require `audio/timing.lock.json` parity when narration exists
- `scripts/review/preflight_render.py` is the thin wrapper over the shared timing contract
- Resolve current topology first:
  - project-local artifacts under `projects/<slug>/...`
  - executable HyperFrames composition under `projects/<slug>/hyperframes/`
  - composition assets under `projects/<slug>/hyperframes/assets/`
- Block placeholder text on screen before spending a render

Command:

```bash
python3 scripts/run.py render:preflight projects/<slug> --require-lock
```

## Postflight

Run immediately after a render completes. This is the deterministic first pass before any expensive review.

- `scripts/review/postflight_render.py` runs the same timing contract plus render analyzers
- Re-check timing parity against the rendered mp4
- Catch placeholder / blank / frozen frame anomalies
- Measure cut rate and longest hold
- Measure visual novelty plateaus
- Measure speech masking when clean VO + words exist
- Write a report under `projects/<slug>/review/postflight/`

Command:

```bash
python3 scripts/run.py render:postflight projects/<slug> --video out/<slug>-draft.mp4
```

Rules:

- A render that fails postflight is a review candidate, not a ship candidate.
- A `partial` postflight report means required checks were skipped; treat it as review-needed, not a pass.
- Signals go first. Vision or cold-read only investigates what the signals expose.
