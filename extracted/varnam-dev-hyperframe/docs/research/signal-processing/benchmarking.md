# Benchmarking

## Why keep a benchmark

These evals are not useful if they drift silently.

A benchmark set gives the repo a stable calibration surface:
- healthy real examples
- sparse / low-coverage examples
- low-change examples
- synthetic fixtures for edge cases that production does not yet preserve cleanly

When thresholds, sampling rates, or algorithms change, the benchmark tells us whether the signal still separates those cases in the same way.

## What the benchmark is

Audio manifest:
- [`benchmarks/signal-processing/audio-evals.json`](../../../benchmarks/signal-processing/audio-evals.json)

Visual manifest:
- [`benchmarks/signal-processing/visual-evals.json`](../../../benchmarks/signal-processing/visual-evals.json)

Structure manifest:
- [`benchmarks/signal-processing/structure-evals.json`](../../../benchmarks/signal-processing/structure-evals.json)

Runner:
- [`scripts/run_signal_benchmarks.py`](../../../scripts/run_signal_benchmarks.py)

Frozen fixture inventory:
- [`benchmarks/signal-processing/fixtures/README.md`](../../../benchmarks/signal-processing/fixtures/README.md)

Current visual benchmark cases:
- `modi-sample-healthy`
- `pfbr-ch1-sparse`
- `pfbr-ch2-low-change`

Current audio benchmark cases:
- `bengal-fall-healthy-mix-75-105`
- `bengal-fall-synthetic-masked-75-105`
- `bengal-fall-synthetic-no-drop-75-105`

Current structure benchmark cases:
- `pfbr-timed-storyboard`
- `mode-interleave-monotone-fixture`

## What is being benchmarked

Current analyzers:
- `cut_rate`
- `frame_clutter`
- `layout_repetition`
- `mode_interleave`
- `reveal_contraction`
- `speech_masking`
- `visual_novelty`

The benchmark does **not** say the video is good. It says the analyzer still behaves predictably on known examples.

That distinction matters.

## Use cases

Use the benchmark when:
- an eval algorithm changes
- a threshold changes
- sampling cadence changes
- the render style changes enough that the old calibration may drift
- a new failure mode from production needs to be preserved as a permanent test case

The benchmark is for calibration and regression control, not for judging one render in isolation.

## How to run it

```bash
python3 scripts/run_signal_benchmarks.py
```

Or explicitly:

```bash
python3 scripts/run_signal_benchmarks.py benchmarks/signal-processing/audio-evals.json
python3 scripts/run_signal_benchmarks.py benchmarks/signal-processing/visual-evals.json
python3 scripts/run_signal_benchmarks.py benchmarks/signal-processing/structure-evals.json
```

## Manifest shape

Each benchmark case specifies:
- the input artifact path
- notes describing why it belongs in the set
- per-analyzer metric expectations

Example:

```json
{
  "id": "modi-sample-healthy",
  "input": "benchmarks/signal-processing/fixtures/videos/modi-sample-healthy.mp4",
  "expectations": {
    "cut_rate": {
      "metrics": {
        "cuts_per_minute": { "min": 10.0 }
      }
    }
  }
}
```

## Maintenance rule

When an eval changes:
1. run the benchmark
2. inspect any drift
3. decide whether the analyzer improved or regressed
4. only then update the benchmark ranges

Do not casually "fix" the benchmark to match a worse analyzer.

## When to add a new sample

Add a benchmark sample when:
- a new failure mode is discovered in production
- an eval is added that needs a calibration case
- an existing sample stops being representative

Good benchmark samples are:
- short enough to run quickly
- stable files already in the repo
- semantically distinct from each other
- honest about whether they are real production artifacts or synthetic fixtures

Current note:
- `frame_clutter` is calibrated against clean real renders in the frozen fixture set
- its failure side is currently proven by synthetic tests, not yet by a frozen real clutter-heavy production clip
- the next production section that clearly overloads the frame should be copied into `fixtures/videos/` and added here
- `speech_masking` is calibrated against a frozen real Bengal Fall mix excerpt
- its failure side is currently proven by a synthetic masked variant built from the same frozen voiceover clip
- `reveal_contraction` is calibrated against the same frozen real Bengal Fall mix excerpt plus explicit reveal markers from the rebased `words.json`
- its failure side is currently proven by a synthetic no-drop variant built from that frozen real mix
- the next production mix that genuinely buries narration should be frozen into `fixtures/audio/` as a real failure case

## Fixture rule

Benchmark manifests should point at frozen copies under `benchmarks/signal-processing/fixtures/`, not live project outputs.

Live project files are allowed as the source when a fixture is first created. They are not the long-term benchmark location.

## Relationship to docs

- [`README.md`](./README.md) is the index
- per-check docs define the signal
- this document defines how we keep those signals honest over time
