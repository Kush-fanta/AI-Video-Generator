# Reveal Contraction

## Status

Implemented in [`scripts/review/benchmarks/reveal_contraction.py`](../../../scripts/review/benchmarks/reveal_contraction.py) with tests in [`tests/test_reveal_contraction.py`](../../../tests/test_reveal_contraction.py).

## Purpose

`reveal_contraction` measures whether the accompaniment actually yields at explicitly marked payload beats.

It is meant to catch:
- reveal lines where the score keeps playing at the same perceived weight
- chapter handoffs where the bed bridges across the structural break without contracting
- mixes that remain intelligible but never make room for the payload line to land

It is not a music-quality model and it is not a replacement for `speech_masking`.

## Audio basis

The craft principle is structural, not spectral:
- major reveal beats need an audible contraction in accompaniment energy
- the bed can survive the beat, but it cannot stay level
- a payload line loses force when the soundtrack refuses to yield

This is why the signal is marker-based. It checks the moments we already believe matter.

## Signal

Current implementation:
- decode the final mix and clean voiceover stem
- use `voiceover.words.json` to estimate the voice gain present in the final mix
- subtract the scaled voiceover stem to approximate accompaniment energy
- resolve reveal markers from explicit timestamps or `word:<text>:<occurrence>` anchors
- compare accompaniment RMS in the buildup window before each marker against the reveal window around it

Interpretation:
- positive contraction values mean the accompaniment got out of the way
- small or negative values mean the bed held flat or even grew through the reveal

## Inputs

- final mixed audio or video path
- clean voiceover stem
- `voiceover.words.json`
- reveal marker JSON

Marker file shape:

```json
{
  "markers": [
    { "label": "Partition date payload", "anchor": "word:nineteen:1" },
    { "label": "Section handoff", "timestamp": 7.68 }
  ]
}
```

CLI:

```bash
python3 scripts/review/benchmarks/reveal_contraction.py path/to/mix.mp3 \
  --voiceover path/to/voiceover.mp3 \
  --words path/to/voiceover.words.json \
  --markers path/to/reveals.json
```

## Output

Primary fields:
- `supported_reveal_fraction`
- `weakest_reveal_contraction_db`
- `mean_reveal_contraction_db`
- `markers_resolved`
- `findings`

Example output shape:

```json
{
  "script": "reveal_contraction",
  "score": 1.0,
  "threshold": 2.5,
  "pass": true,
  "supported_reveal_fraction": 1.0,
  "weakest_reveal_contraction_db": 3.948,
  "findings": []
}
```

## Use cases

Use `reveal_contraction` when you need to answer:
- did the score actually dip at the chapter payload
- did the reveal line get its own air or was the bed held flat
- which of two score passes better respects the intended dramatic markers
- did the final render preserve the planned score break structure from the spec

Operationally, this is useful for:
- final mix QA on narration-heavy chapters
- validating score revisions against known reveal lines
- proving that a silence-or-drop note in the score spec turned into real audio behavior

## What it finds well

- held accompaniment through reveal lines
- chapter transitions where the score refuses to reset
- structurally flat scoring that stays level under important payload beats

## What it does not find

- whether the chosen reveal markers were the right ones
- whether the music is emotionally correct after the contraction
- whether the score re-entry is good
- whether the voice was spectrally protected during the rest of the section

Those are reviewer, spec, or `speech_masking` questions.

## Real-fixture sanity check

Current frozen audio fixtures:

| Fixture | Result |
|---|---|
| `benchmarks/signal-processing/fixtures/audio/bengal-fall-75-105-mix.mp3` | `supported_reveal_fraction = 1.0`, `weakest_reveal_contraction_db = 3.948` |
| `benchmarks/signal-processing/fixtures/audio/bengal-fall-75-105-synthetic-no-drop.mp3` | `supported_reveal_fraction = 0.0`, `weakest_reveal_contraction_db = -4.048` |

Interpretation:
- the frozen real excerpt contains measurable accompaniment contraction at its marked beats
- the synthetic no-drop variant proves the analyzer moves when those contractions are flattened

## Limitation

This analyzer assumes the clean voiceover stem is aligned with the final mix and that the reveal markers are real editorial beats.

If the markers are wrong, or if the final mix contains heavy voice processing or retiming that breaks stem subtraction, the signal loses trust. The right fix is to preserve the clean stem and marker discipline in the audio pipeline, not to weaken the threshold.
