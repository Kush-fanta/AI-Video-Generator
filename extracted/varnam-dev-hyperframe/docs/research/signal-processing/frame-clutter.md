# Frame Clutter

## Status

Implemented in [`scripts/review/benchmarks/frame_clutter.py`](../../../scripts/review/benchmarks/frame_clutter.py) with tests in [`tests/test_frame_clutter.py`](../../../tests/test_frame_clutter.py).

## Purpose

`frame_clutter` measures when an individual frame becomes overcrowded enough that the eye loses a clear entry point.

This is distinct from:
- [`visual_novelty`](./visual-novelty.md), which asks whether the picture changes over time
- [`layout_repetition`](./layout-repetition.md), which asks whether the same composition scaffold keeps returning

The target failure mode is:
- too many competing elements at once
- not enough quiet space
- lots of structure, but weak hierarchy
- a frame that feels busy before it feels clear

## Design basis

This metric comes from graphic-design hierarchy and editorial processing-budget principles.

The underlying craft idea is:
- density can be intentional, but only if one thing wins first attention
- clutter happens when too much structure competes simultaneously
- detailed photography is not automatically clutter, so background texture must not dominate the signal

So `frame_clutter` is a proxy for frame overload, not for semantic complexity and not for motion.

## Signal

Current implementation:
- sample frames at `1 fps`
- convert to grayscale
- blur lightly to suppress photo texture and tiny noise
- compute a coarse edge map
- pool edge energy into a grid
- score each frame from three ingredients:
  - edge density
  - occupied grid fraction
  - spatial entropy of the edge energy

Interpretation:
- a frame scores high when structural activity is strong, spread widely, and occupies too much of the frame at once

This makes the signal care more about competing designed structure than about coastline detail or film grain.

## Inputs

- rendered video path
- optional sampling and grid controls
- optional clutter-score threshold
- optional maximum clutter-run duration

CLI:

```bash
python3 scripts/review/benchmarks/frame_clutter.py path/to/video.mp4
python3 scripts/review/benchmarks/frame_clutter.py path/to/video.mp4 --max-clutter-run-seconds 3
```

## Use cases

Use `frame_clutter` when you need to answer:
- did this section overload the frame with too many simultaneous elements
- did a revision add labels, cards, grids, or callouts until the hierarchy collapsed
- which variant kept more negative space and a clearer first read
- did a text-and-graphics beat become crowded even though it still changes over time

Operationally, this is useful for:
- post-render checks on explainer-heavy compositions
- catching overcrowded data / label / card frames
- comparing two design passes for visual hierarchy
- routing fixes toward simplification instead of pacing tweaks

## Output

Primary fields:
- `score`
- `high_clutter_seconds`
- `high_clutter_fraction`
- `longest_clutter_run_seconds`
- `mean_frame_clutter_score`
- `peak_frame_clutter_score`
- `findings`

Example output shape:

```json
{
  "script": "frame_clutter",
  "score": 0.71,
  "threshold": 3.0,
  "pass": true,
  "high_clutter_seconds": 11.0,
  "high_clutter_fraction": 0.29,
  "longest_clutter_run_seconds": 4.0,
  "findings": [
    {
      "timestamp": 18.0,
      "end_timestamp": 22.0,
      "duration": 4.0,
      "issue": "high visual clutter run",
      "severity": "hard"
    }
  ]
}
```

## What it finds well

- overcrowded text-and-graphic composites
- label stacks and card piles that eat the quiet space
- data frames where too much structure asks for attention at once
- revisions that add surface complexity without improving clarity

## What it does not find

- whether the frame changed enough over time
- whether the same layout keeps repeating
- whether the content is semantically correct
- whether a still frame is boring

Those belong to other signals.

## Real-video sanity check

First pass on the current frozen real-video fixtures:

| Video | Result |
|---|---|
| `benchmarks/signal-processing/fixtures/videos/modi-sample-healthy.mp4` | score `1.0`, high clutter `0.0s`, peak frame score `0.2281` |
| `benchmarks/signal-processing/fixtures/videos/pfbr-ch1-sparse.mp4` | score `1.0`, high clutter `0.0s`, peak frame score `0.2678` |
| `benchmarks/signal-processing/fixtures/videos/pfbr-ch2-low-change.mp4` | score `1.0`, high clutter `0.0s`, peak frame score `0.3214` |

Interpretation:
- the current frozen benchmark renders are not clutter-heavy once detailed photography is discounted
- that is a useful regression surface: the analyzer should stay quiet on these known-clean cases
- the failure side is currently proven by the synthetic dense-frame test, not yet by a frozen real production failure clip

Next time production yields a genuinely overcrowded sequence, freeze that video into the benchmark set.
