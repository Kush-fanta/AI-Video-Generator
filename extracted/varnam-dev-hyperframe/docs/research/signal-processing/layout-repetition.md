# Layout Repetition

## Status

Implemented in [`scripts/review/benchmarks/layout_repetition.py`](../../../scripts/review/benchmarks/layout_repetition.py) with tests in [`tests/test_layout_repetition.py`](../../../tests/test_layout_repetition.py).

## Purpose

`layout_repetition` measures whether the structural frame keeps repeating even when the content changes.

This is distinct from:
- [`cut_rate`](./cut-rate.md), which only sees hard resets
- [`visual_novelty`](./visual-novelty.md), which measures overall picture change

The target failure mode is:
- same template
- same composition skeleton
- different words or images
- still the same structural frame over and over

## Design basis

This metric comes from composition variety in graphic design and explainer editing.

The underlying craft idea is:
- structural repetition becomes visible before literal frame duplication does
- changing numbers, labels, or images is not enough if the composition scaffold stays fixed
- a video can feel templated even when every shot contains different content

So `layout_repetition` is a proxy for structural sameness, not for overall motion or novelty.

## Signal

Current implementation:
- sample frames at `1 fps`
- convert to grayscale
- compute a coarse edge map
- pool the edge energy into a grid fingerprint
- compare layout fingerprints over short and lookback windows

Interpretation:
- high recent similarity and high lookback similarity = repeated layout plateau

This makes the signal more robust to content swaps than plain frame-difference metrics.

## Use cases

Use `layout_repetition` when you need to answer:
- did the video keep reusing the same composition skeleton
- did a "new" cut only swap content inside the same layout
- is a chapter structurally repetitive even though novelty is non-zero
- which variant actually broadens composition language instead of just changing assets

Operationally, this is useful for:
- post-render evals on template-heavy work
- catching repeated split-screen / card / counter structures
- routing fixes back to storyboard structure instead of micro-animation polish
- benchmarking whether new template usage actually improved structural variety

## Output

Primary fields:
- `score`
- `high_repetition_seconds`
- `high_repetition_fraction`
- `longest_plateau_seconds`
- `findings`

Example output shape:

```json
{
  "script": "layout_repetition",
  "score": 0.432,
  "threshold": null,
  "pass": true,
  "high_repetition_seconds": 29.0,
  "high_repetition_fraction": 0.568,
  "longest_plateau_seconds": 17.0,
  "findings": [
    {
      "timestamp": 30.0,
      "end_timestamp": 47.0,
      "duration": 17.0,
      "issue": "repeated layout plateau",
      "severity": "soft"
    }
  ]
}
```

## What it finds well

- repeated composition scaffolds
- content swaps inside the same frame skeleton
- template overuse across a section
- long stretches where the layout stays structurally fixed

## What it does not find

- whether the frame changed semantically enough overall
- whether the motion inside the layout is alive
- whether the text is readable

Those belong to other signals.

## Real-video sanity check

First pass on actual repo videos:

| Video | Result |
|---|---|
| `benchmarks/signal-processing/fixtures/videos/modi-sample-healthy.mp4` | score `1.0`, high repetition `0.0s`, longest plateau `0.0s` |
| `benchmarks/signal-processing/fixtures/videos/pfbr-ch1-sparse.mp4` | score `0.432`, high repetition `29.0s`, longest plateau `17.0s` |
| `benchmarks/signal-processing/fixtures/videos/pfbr-ch2-low-change.mp4` | score `0.458`, high repetition `51.0s`, longest plateau `18.0s` |

Interpretation:
- `pfbr/ch1-preview` shows genuine structural repetition
- `sample-preview` does not
- `pfbr/ch2-preview` shows a chapter that is both low-change and structurally repetitive

That split still matters because repetition and novelty are not the same number; `ch2-preview` stays repetitive for less time than it stays low-novelty.
