# Word Timing Global Align

Feature capture for global word-timestamp alignment and before/after verification.

## What is preserved

- `realign_words_signal.py`: script snapshot used to estimate timing lag from audio signal and apply bounded timestamp corrections.
- `bengal-ch1-before-vs-after-with-vo-audio.mp4`: side-by-side verification render (before vs after), with VO audio — **not tracked in git** (copy from the project path below; ~234MB).

## Source of capture

- Script source: `scripts/audio/realign_words_signal.py`
- Video source: `projects/bengal-curve/output/ch1-words-before-vs-after-with-vo-audio.mp4`

## Usage note

The script supports strict global behavior by disabling local residual and local nudges:

```bash
python3 scripts/audio/realign_words_signal.py \
  --audio <project>/audio/voiceover.mp3 \
  --words <project>/audio/voiceover.words.json \
  --in-place \
  --max-local-residual-ms 0 \
  --max-local-nudge-ms 0
```

This feature folder is intentionally outside `projects/` so it survives project cleanup.
