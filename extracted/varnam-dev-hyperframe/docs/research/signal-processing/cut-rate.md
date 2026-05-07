# Cut Rate

## Status

Implemented in [`scripts/review/benchmarks/cut_rate.py`](../../../scripts/review/benchmarks/cut_rate.py) with tests in [`tests/test_cut_rate.py`](../../../tests/test_cut_rate.py).

## Purpose

`cut_rate` measures hard visual resets in a rendered video.

It is meant to catch:
- coverage collapse into a few large blocks
- unexpectedly long holds
- reset-heavy sections that are far sparser than the storyboard implied

It is not a full pacing model.

## Editing basis

This metric comes from editing rhythm and coverage principles.

The underlying craft idea is:
- a sequence needs enough real resets to create progression
- long holds are valid when intentional, but accidental long holds usually signal under-coverage
- if the storyboard implied multiple editorial beats and the render barely resets, the video probably collapsed structurally

So `cut_rate` is not claiming "fast cuts are always better." It is measuring whether the rendered sequence preserved enough editorial reset structure to stay alive.

## Signal

Current implementation:
- ffmpeg scene-change analysis
- count detected hard resets
- compute cuts per minute
- compute longest hold duration

Current default:
- `scene_threshold = 0.05`

That value is tuned to the repo's rendered output, not to generic broadcast footage.

## Inputs

- rendered video path
- optional scene-change threshold
- optional minimum cuts-per-minute floor

CLI:

```bash
python3 scripts/review/benchmarks/cut_rate.py path/to/video.mp4
python3 scripts/review/benchmarks/cut_rate.py path/to/video.mp4 --min-cuts-per-minute 6
```

## Output

Primary fields:
- `cut_count`
- `cuts_per_minute`
- `longest_hold_seconds`
- `cut_timestamps`
- `holds`

Example output shape:

```json
{
  "script": "cut_rate",
  "score": 1.0,
  "threshold": 6.0,
  "pass": true,
  "cut_count": 14,
  "cuts_per_minute": 9.2,
  "longest_hold_seconds": 8.4,
  "findings": []
}
```

## What it finds well

- obvious hard resets
- long static stretches
- sequences where the editor expected coverage but the render stayed in a few visual blocks

## Use cases

Use `cut_rate` when you need a hard-reset signal for:
- catching chapters that collapsed into a few large holds
- comparing two versions of the same sequence for coverage density
- detecting when the DoP silently removed editorial resets from the storyboard plan
- benchmarking whether a new transition style still preserves enough real scene progression

Operationally, `cut_rate` is best used:
- as a post-render sanity check
- as a benchmarked regression metric
- as one input into a broader visual auto-eval, not as the only pace signal

## What it does not find

- smooth transitions that still change meaningfully
- slow motion that keeps the frame alive without a hard reset
- same-layout runs with tiny swaps
- pacing quality in the editorial sense

Those are `visual_novelty` problems, not `cut_rate` problems.

## Real-video sanity check

First pass on actual repo videos:

| Video | Result |
|---|---|
| `benchmarks/signal-processing/fixtures/videos/modi-sample-healthy.mp4` | 3 cuts, 14.934 cuts/min, longest hold 3.053s |
| `benchmarks/signal-processing/fixtures/videos/pfbr-ch1-sparse.mp4` | 3 cuts, 3.526 cuts/min, longest hold 21.051s |
| `benchmarks/signal-processing/fixtures/videos/pfbr-ch2-low-change.mp4` | 3 cuts, 1.914 cuts/min, longest hold 62.059s |

Interpretation:
- the metric is useful for hard resets
- it undercounts transition-heavy edits
- it clearly catches catastrophic hold collapse
- it should be treated as one signal, not the coverage truth

## Next step

Pair `cut_rate` with [`visual_novelty`](./visual-novelty.md). Together they separate:
- few cuts but visually alive
- few cuts and visually dead
- many cuts but still repetitive
- many cuts and genuinely varied
