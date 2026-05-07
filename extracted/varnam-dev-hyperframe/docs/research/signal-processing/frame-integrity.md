# Frame Integrity

## Status

Implemented in [`scripts/review/benchmarks/frame_integrity.py`](../../../scripts/review/benchmarks/frame_integrity.py) with tests in [`tests/test_frame_integrity.py`](../../../tests/test_frame_integrity.py).

## Purpose

`frame_integrity` is the cheapest pre-check in the signal-processing system. It catches render failures that no Gemini call should ever pay for — blank, solid, frozen, or asset-missing-placeholder frames — before any vision tier sees the artifact.

This exists because the editor and reviewer pay Opus/Gemini tokens for pixel-level questions that pure NumPy can answer in milliseconds. Anything caught here short-circuits the rest of the review chain.

## What it detects

- **blank** — frame normalized-grayscale variance < `blank_var_threshold` (default `1e-4`). Catches all-black, all-white, all-one-color renders.
- **solid** — single dominant color in a 16-bin RGB histogram covers more than `solid_pct_threshold` of the frame (default `0.99`). Catches "rendered as a single fill."
- **placeholder** — pure-magenta region (`R≥240`, `G≤16`, `B≥240`) covers more than `magenta_pct_threshold` of the frame (default `0.5`). Catches Remotion / framework "missing asset" magenta fills. Real content with magenta accents stays well under this; calibration on `testsrc2` gives ~11% peak vs 100% for a real placeholder.
- **frozen** — consecutive sampled frames differ by less than `frozen_diff_threshold` (default `1e-3`) for a run longer than `frozen_min_seconds` (default `2.0s`). Distinguishes intentional holds (short) from stuck renders (long).

## Output

```json
{
  "script": "frame_integrity",
  "duration_seconds": 4.0,
  "frames_sampled": 16,
  "blank_frame_count": 0,
  "solid_frame_count": 0,
  "placeholder_frame_count": 0,
  "frozen_run_count": 0,
  "longest_frozen_seconds": 0.0,
  "findings": []
}
```

The analyzer emits **evidence, not a verdict**. There is no `pass` field and the CLI always exits 0 on successful analysis. Adjudication belongs to the reviewer, which has the storyboard, spec, and channel context needed to decide whether a finding is a real defect (intentional 4s slate vs. broken render) or expected behavior. Manifest-driven CI cases can still set hard rules per metric (e.g. `blank_frame_count: { max: 0 }`) when an unambiguous floor is desired.

## Integration

- Registered in `scripts/review/benchmarks/run_signal_benchmarks.py` under the key `frame_integrity`.
- Manifest cases under `benchmarks/signal-processing/visual-evals.json` set `min` / `max` rules per metric (e.g. `blank_frame_count: { max: 0 }`).
- Reuses `sample_grayscale_frames` and `probe_video_stream` from `visual_novelty.py`; adds a small `sample_rgb_frames` helper for color checks.
- Pure NumPy + ffmpeg, no new dependencies.

## Why this lives in signal-processing

This is the floor of the deterministic stack. Other analyzers (`visual_novelty`, `frame_clutter`, `layout_repetition`) ask "is the frame doing enough?" — `frame_integrity` asks "is there a frame at all?" When it fires, downstream signals are not meaningful and the route is `render_rerun` after the asset/skeleton fix.

## Known gaps

- Safe-area violations (text outside channel-defined margins) are not covered. That check needs channel `config.md` wiring and either DOM/spec hooks or a noisier "high-contrast edges in margin zones" heuristic. Deferred to a later analyzer.
- Asset-missing patterns other than magenta fills (broken-image checker, transparent rectangles after compositing) are not detected. Add patterns as we encounter real failure modes.
