# Signal Processing Index

## Why this exists

Signal processing is the cleanest substrate for auto evals in Varnam because it turns fuzzy review complaints into measurable failures.

LLM review still matters for:
- viewer judgment
- emotional pacing
- on-brand taste
- narrative rightness

But many recurring failures are measurement problems:
- visual coverage collapsed
- holds ran too long
- the frame barely changed for 20 seconds
- text is too small on phone scale
- the score masked narration

Those should become deterministic gates, not reviewer opinions.

## System split

Use signal processing for what can be measured. Use a reviewer for what requires judgment.

In the current built layer, the deterministic checks are:
- hard reset density
- frame clutter
- hold-time distribution
- frame-to-frame novelty
- layout structure repetition
- reveal contraction
- speech masking
- storyboard mode interleave

## Why these metrics are valid

These checks are not arbitrary math. They are cheap numerical proxies for known editing and graphic-design principles.

| Signal | Craft principle | What the metric is standing in for |
|---|---|---|
| `cut_rate` | Editing rhythm and coverage | If the piece rarely resets, it often means coverage collapsed into long holds or weak progression |
| `frame_clutter` | Information hierarchy and processing budget | If too much edge activity and occupancy spread across the frame at once, the eye loses a clear entry point |
| `visual_novelty` | Ongoing delivery of new visual information | Motion without meaningful change is still a dead sequence |
| `layout_repetition` | Composition variety | Swapping content inside the same structural frame still feels templated and flat |
| `reveal_contraction` | Score break discipline and payload emphasis | A reveal can stay intelligible and still land weakly if the accompaniment never contracts at the payload beat |
| `speech_masking` | Speech intelligibility and mix priority | A voice can still be audible yet lose its center if the mix injects too much mid-band competition |
| `mode_interleave` | Mode cycling and visual-language rotation | A timed storyboard can still collapse into long text or data stretches before anything is rendered |

This is the core communication rule for the system:
- principle first
- metric second
- benchmark to prove the proxy tracks the real failure

The metric is never the principle itself. It is a measurable stand-in for the principle.

## Eval contract

Every deterministic eval should emit the same JSON shape:

```json
{
  "script": "cut_rate",
  "score": 0.73,
  "threshold": 0.6,
  "pass": true,
  "findings": [
    {
      "timestamp": 34.2,
      "issue": "long low-change run",
      "severity": "hard"
    }
  ]
}
```

Rules:
- `script`: stable machine name
- `score`: normalized where possible
- `threshold`: explicit gate value if one exists
- `pass`: deterministic boolean
- `findings`: timestamped issues with `hard` or `soft` severity

## Hook placement

### Post-render

Checks that only exist in the actual output:
- cut rate
- frame clutter
- visual novelty
- layout repetition

### Post-mix or final render audio track

Checks that require the final audio result:
- speech masking

### Storyboard-time

Checks that operate on authored temporal structure before render:
- mode interleave

## Common use cases

These checks are not just diagnostics. They support concrete decisions in the production loop.

### 1. Auto-eval gates

Use deterministic checks to block progression when the failure is measurable:
- visual coverage collapsed
- the frame became overcrowded and lost hierarchy
- the render stayed too static for too long
- the same layout skeleton kept repeating
- the score never yielded at the payload line
- the score or SFX stepped on narration

This is the main use case for render and review hooks.

### 2. Variant comparison

When two candidate renders both "work," use the metrics to compare them:
- which version has shorter dead stretches
- which version preserves hierarchy without crowding the frame
- which version has more real visual change
- which version preserved editorial resets
- which version broadened structural composition language

This is especially useful when the creative difference is small and reviewer language becomes vague.

### 3. Regression detection

When an analyzer changes, or when the render system changes, rerun the benchmark:
- did `cut_rate` suddenly stop seeing resets
- did `frame_clutter` start treating detailed photography as overload
- did `visual_novelty` become too strict
- did `layout_repetition` stop detecting template overuse
- did a new transition style invalidate the thresholds

This keeps the eval layer honest over time.

### 4. Fix routing

Signal-processing checks help route the problem to the right surface:
- `cut_rate`, `visual_novelty`, `layout_repetition` -> storyboard / DoP / visual structure
- `frame_clutter` -> hierarchy / simplification / negative space / card and label count
- `speech_masking` -> scoring / mix balance / SFX density / voice protection
- `reveal_contraction` -> score spec / chapter transition design / payload emphasis
- `mode_interleave` -> storyboard / chapter planning / visual-mode rotation

This reduces reviewer prose and makes failures actionable.

### 5. Benchmark maintenance

Benchmark samples should represent distinct failure and success classes:
- healthy and dynamic
- sparse and under-covered
- low-change without hard cuts

When production discovers a new failure mode, add that case to the benchmark set.

## Check catalog

| Check | Status | Purpose | Doc |
|---|---|---|---|
| `cut_rate` | implemented | Hard-reset density and longest hold duration | [Cut Rate](./cut-rate.md) |
| `frame_clutter` | implemented | Detect frames that lose hierarchy because too much structure competes at once | [Frame Clutter](./frame-clutter.md) |
| `visual_novelty` | implemented | Detect low-change plateaus across static and smooth edits | [Visual Novelty](./visual-novelty.md) |
| `layout_repetition` | implemented | Detect repeated composition skeletons across content changes | [Layout Repetition](./layout-repetition.md) |
| `reveal_contraction` | implemented | Detect whether accompaniment actually contracts at marked reveal beats | [Reveal Contraction](./reveal-contraction.md) |
| `speech_masking` | implemented | Detect score or SFX that add competing speech-band energy over narration | [Speech Masking](./speech-masking.md) |
| `mode_interleave` | implemented | Detect overlong runs of the same storyboard mode in timed scene plans | [Mode Interleave](./mode-interleave.md) |

## Benchmark

Benchmark manifest and maintenance notes live here:
- [Benchmarking](./benchmarking.md)

## Naming rule

Eval names should describe the signal, not the metaphor and not the implementation detail.

Good:
- `cut_rate`
- `visual_novelty`
- `layout_repetition`

Bad:
- `slideshow_risk`
- `cut_rate_counter`

The name should survive changes in implementation.

## Current evidence

The first implemented checks are:
- [`scripts/review/benchmarks/cut_rate.py`](../../../scripts/review/benchmarks/cut_rate.py)
- [`scripts/review/benchmarks/frame_clutter.py`](../../../scripts/review/benchmarks/frame_clutter.py)
- [`scripts/review/benchmarks/layout_repetition.py`](../../../scripts/review/benchmarks/layout_repetition.py)
- [`scripts/review/benchmarks/mode_interleave.py`](../../../scripts/review/benchmarks/mode_interleave.py)
- [`scripts/review/benchmarks/reveal_contraction.py`](../../../scripts/review/benchmarks/reveal_contraction.py)
- [`scripts/review/benchmarks/speech_masking.py`](../../../scripts/review/benchmarks/speech_masking.py)
- [`scripts/review/benchmarks/visual_novelty.py`](../../../scripts/review/benchmarks/visual_novelty.py)

The current benchmarked visual fixtures are frozen copies of real repo renders:
- `benchmarks/signal-processing/fixtures/videos/modi-sample-healthy.mp4`
- `benchmarks/signal-processing/fixtures/videos/pfbr-ch1-sparse.mp4`
- `benchmarks/signal-processing/fixtures/videos/pfbr-ch2-low-change.mp4`

The current benchmarked audio fixtures are a frozen real Bengal Fall mix excerpt plus synthetic failure variants built from the same frozen voiceover clip:
- `benchmarks/signal-processing/fixtures/audio/bengal-fall-75-105-mix.mp3`
- `benchmarks/signal-processing/fixtures/audio/bengal-fall-75-105.reveals.json`
- `benchmarks/signal-processing/fixtures/audio/bengal-fall-75-105-synthetic-masked.mp3`
- `benchmarks/signal-processing/fixtures/audio/bengal-fall-75-105-synthetic-no-drop.mp3`
- `benchmarks/signal-processing/fixtures/audio/bengal-fall-75-105-voiceover.mp3`
- `benchmarks/signal-processing/fixtures/audio/bengal-fall-75-105.words.json`

Interpretation from the first pass:
- `cut_rate` works for hard resets but undercounts transition-heavy edits
- `frame_clutter` stays quiet on the current frozen real renders once background photo texture is discounted
- `visual_novelty` catches low-change plateaus even when hard cuts are absent
- `layout_repetition` catches structural sameness even when overall novelty is non-zero
- `reveal_contraction` stays strong on the frozen real mix excerpt and collapses on the synthetic no-drop variant
- `speech_masking` stays quiet on the frozen healthy mix excerpt and spikes on the synthetic masked variant
- `mode_interleave` catches author-time mode domination before it turns into a flat render
- together they form the first usable visual + audio + structure auto-eval layer

## Core principle

Measure what is measurable.

Do not ask an LLM to estimate a property that signal processing can compute directly. Use the reviewer for interpretation, not instrumentation.
