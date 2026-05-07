# Visual Novelty

## Status

Implemented in [`scripts/review/benchmarks/visual_novelty.py`](../../../scripts/review/benchmarks/visual_novelty.py) with tests in [`tests/test_visual_novelty.py`](../../../tests/test_visual_novelty.py).

## Purpose

`visual_novelty` should measure how much the picture actually changes over time, including smooth edits.

This exists because `cut_rate` only sees hard resets. Varnam uses smooth transitions, holds, slow builds, and moving layers that can still feel visually dead even when pixels are changing.

## Editing and design basis

This metric comes from a basic motion-graphics principle: the frame must keep delivering new visual information.

The underlying craft idea is:
- movement alone is not enough
- a frame can animate continuously and still feel dead if the visual idea never evolves
- smooth transitions should still create progression, not just pixel drift

So `visual_novelty` is a proxy for perceived visual progression, especially in work where hard cuts are rare.

## Hypothesis

A sequence can have:
- few hard cuts and still stay visually alive
- motion without meaningful visual change

The eval should catch long low-change plateaus across both static and smooth edits.

## Signal design

Baseline approach:
- sample frames every `0.5s` or `1.0s`
- downscale aggressively
- compare each sampled frame to:
  - the previous sampled frame
  - a frame `3-5s` earlier

Interpretation:
- high similarity to previous frame and high similarity to earlier frame = low novelty plateau
- high similarity to previous frame but low similarity to earlier frame = smooth progression, likely acceptable

Current implementation:
- sample at `1 fps`
- downscale to width `96`
- compare adjacent samples
- compare against a `4s` lookback window
- flag low-novelty plateaus when both the short-range and lookback change stay below threshold

## What it finds

- long low-novelty runs
- fake motion
- same layout with tiny swaps
- repeated template dependence
- stagnant chapters
- repeated near-duplicate visual ideas

## Use cases

Use `visual_novelty` when you need to answer:
- did the video keep showing the same thing for too long
- did motion create real visual progression or only pixel drift
- which of two variants stays visually alive longer
- which chapter is flattening out even though nothing is technically broken

Operationally, this is the best fit for:
- post-render auto evals on transition-heavy work
- chapter-level plateau detection before the reviewer watches the full piece
- routing "this feels dead" complaints into measurable timestamps
- benchmark coverage for low-change failure modes that `cut_rate` cannot see

## Output

- overall novelty score
- longest low-novelty run in seconds
- timestamped plateau findings
- optional per-window novelty values for graphing

Example findings:
- `12.0-24.5s: low novelty plateau`
- `47.0s: repeated composition family for 6 consecutive windows`
- `78.0-91.0s: motion present but semantic frame change minimal`

Primary fields:
- `score`
- `low_novelty_seconds`
- `low_novelty_fraction`
- `longest_plateau_seconds`
- `findings`

Example output shape:

```json
{
  "script": "visual_novelty",
  "score": 0.275,
  "threshold": null,
  "pass": true,
  "low_novelty_seconds": 37.0,
  "low_novelty_fraction": 0.725,
  "longest_plateau_seconds": 19.0,
  "findings": [
    {
      "timestamp": 1.0,
      "end_timestamp": 20.0,
      "duration": 19.0,
      "issue": "low visual novelty plateau",
      "severity": "soft"
    }
  ]
}
```

## Real-video sanity check

Use the same real videos as `cut_rate`:
- `benchmarks/signal-processing/fixtures/videos/modi-sample-healthy.mp4`
- `benchmarks/signal-processing/fixtures/videos/pfbr-ch1-sparse.mp4`
- `benchmarks/signal-processing/fixtures/videos/pfbr-ch2-low-change.mp4`

First pass:

| Video | Result |
|---|---|
| `benchmarks/signal-processing/fixtures/videos/modi-sample-healthy.mp4` | score `0.834`, low novelty `2.0s`, longest plateau `1.0s` |
| `benchmarks/signal-processing/fixtures/videos/pfbr-ch1-sparse.mp4` | score `0.275`, low novelty `37.0s`, longest plateau `19.0s` |
| `benchmarks/signal-processing/fixtures/videos/pfbr-ch2-low-change.mp4` | score `0.181`, low novelty `77.0s`, longest plateau `58.0s` |

Interpretation:
- `sample-preview` reads healthy
- `pfbr/ch1-preview` clearly shows long flat stretches
- `pfbr/ch2-preview` shows an even deeper collapse into low-change coverage

## Relationship to other checks

- [`cut_rate`](./cut-rate.md): hard reset density
- `visual_novelty`: actual picture change over time

This is the right complement, not "better cut detection."
