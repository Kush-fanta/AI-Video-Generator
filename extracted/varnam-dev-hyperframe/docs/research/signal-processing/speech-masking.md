# Speech Masking

## Status

Implemented in [`scripts/review/benchmarks/speech_masking.py`](../../../scripts/review/benchmarks/speech_masking.py) with tests in [`tests/test_speech_masking.py`](../../../tests/test_speech_masking.py).

## Purpose

`speech_masking` measures when the final mix adds too much competing mid-band energy over narration.

It is meant to catch:
- score that sits inside the speech band instead of around it
- SFX layers that pull attention away from the spoken line
- mixes that feel busy in the ear even when the voice is technically present

It is not a taste model for music quality.

## Audio basis

This metric comes from speech-intelligibility and mixing principles.

The underlying craft idea is:
- during narration, the voice owns the intelligibility band
- sustained material in roughly `300Hz-3kHz` competes with spoken clarity
- low bass and upper air are usually safer than mid-band beds
- the clean question is not "is there music" but "did the mix inject extra mid-band energy where speech lives"

So `speech_masking` is a proxy for voice competition, not for emotion, not for score quality, and not for whether the music is good.

## Signal

Current implementation:
- decode the clean voiceover stem and the final mix to mono
- use `voiceover.words.json` to isolate voiced windows only
- ignore the quietest voiced windows, where tiny spectral shifts are not meaningful
- compare speech-band energy (`300Hz-3kHz`) against safer reference bands (`50Hz-250Hz` and `4kHz-7kHz`)
- measure how much the final mix increases that speech-band share relative to the clean voiceover

Interpretation:
- near-zero or negative masking values mean the mix largely preserved the original speech shape
- positive values mean the mix injected extra competing energy into the speech zone

## Inputs

- final mixed audio or video path
- clean voiceover stem
- `voiceover.words.json`
- optional masking threshold and run-length gate

CLI:

```bash
python3 scripts/review/benchmarks/speech_masking.py path/to/mix.mp3 \
  --voiceover path/to/voiceover.mp3 \
  --words path/to/voiceover.words.json

python3 scripts/review/benchmarks/speech_masking.py path/to/final-render.mp4 \
  --voiceover path/to/voiceover.mp3 \
  --words path/to/voiceover.words.json \
  --max-mask-run-seconds 1.0
```

## Output

Primary fields:
- `p90_speech_masking_db`
- `peak_speech_masking_db`
- `high_mask_fraction`
- `longest_mask_run_seconds`
- `findings`

Example output shape:

```json
{
  "script": "speech_masking",
  "score": 0.98,
  "threshold": 1.0,
  "pass": true,
  "p90_speech_masking_db": 0.42,
  "high_mask_fraction": 0.02,
  "longest_mask_run_seconds": 0.75,
  "findings": []
}
```

## Use cases

Use `speech_masking` when you need to answer:
- did the score start competing with the narrator after a music revision
- did SFX decoration push the spoken line out of the center of attention
- which of two mixes keeps narration clearer without muting the soundtrack entirely
- did a final render preserve the voice clarity that the clean stem had

Operationally, this is useful for:
- final mix QA before shipping
- variant comparison between two score passes
- regression checks when mix defaults, scoring style, or SFX density change
- turning "audio feels muddy" into a measurable failure

## What it finds well

- persistent mid-band score masking
- SFX layers that sit where the narration body and consonant clarity live
- sections where the voice is present but no longer cleanly prioritized

## What it does not find

- whether the score entered or exited at the right dramatic moment
- whether a designed silence landed strongly enough
- whether the music is emotionally correct
- whether the narrator performed well

Those remain reviewer or future-audio-signal questions.

## Real-fixture sanity check

Current frozen audio fixtures:

| Fixture | Result |
|---|---|
| `benchmarks/signal-processing/fixtures/audio/bengal-fall-75-105-mix.mp3` | `p90_speech_masking_db = 0.083`, `high_mask_fraction = 0.0`, `longest_mask_run_seconds = 0.0` |
| `benchmarks/signal-processing/fixtures/audio/bengal-fall-75-105-synthetic-masked.mp3` | `p90_speech_masking_db = 3.576`, `high_mask_fraction = 0.339`, `longest_mask_run_seconds = 1.5` |

Interpretation:
- the frozen real excerpt behaves like a healthy narration-first mix
- the synthetic variant proves the analyzer moves hard when extra mid-band noise is added
- this is enough to benchmark the signal now, while we wait for a preserved real production masking failure clip

## Limitation

This analyzer assumes the clean voiceover and final mix are aligned versions of the same timeline.

If the mix contains editorial retiming, independent voice processing that materially reshapes the narration spectrum, or no words file, this signal loses trust. In those cases the fix is not to weaken the metric. The fix is to preserve the clean stem and timing artifacts as part of the audio pipeline.
