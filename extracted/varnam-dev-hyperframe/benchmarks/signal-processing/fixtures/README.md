# Frozen Benchmark Fixtures

These fixtures are copied into `benchmarks/` on purpose.

Reason:
- project outputs are working surfaces
- benchmark inputs need to stay stable even if projects are renamed, deleted, or regenerated

## Provenance

Visual and structure fixtures copied on `2026-04-14`.

Audio fixtures copied on `2026-04-15`.

| Fixture | Source at copy time | SHA1 |
|---|---|---|
| `videos/modi-sample-healthy.mp4` | `projects/modi-12-years/output/sample-preview.mp4` | `6eb577f8fbd3aa529e8ea91e7714d66c2df379fa` |
| `videos/pfbr-ch1-sparse.mp4` | `projects/pfbr/output/ch1-preview.mp4` | `0b0cbbb5445c5b339dcac1d0e74521ecf4e67062` |
| `videos/pfbr-ch2-low-change.mp4` | `projects/pfbr/output/ch2-preview.mp4` | `186083167e2f6027e1a9d0ffce8c3e1769d89435` |
| `storyboards/pfbr-timed-storyboard.md` | `projects/pfbr/direction/storyboard.md` (legacy pre-yaml source at copy time) | `dac5a4810bd33b62b1597f271a9c5f2f7770549a` |
| `mode-interleave-monotone.md` | synthetic fixture | `2f72ab64dac1c794c7e7f8b90402b731ee71164c` |
| `audio/bengal-fall-75-105-voiceover.mp3` | `projects/bengal-fall/audio/voiceover.mp3` clipped to `75s-105s` | `18ff7ce99bec2e99226cafd47d4f403a5322cc68` |
| `audio/bengal-fall-75-105-mix.mp3` | `projects/bengal-fall/audio/bengal-fall-mixed.mp3` clipped to `75s-105s` | `59ae565efda0e9bd4af6300145733c6049dfe6d5` |
| `audio/bengal-fall-75-105.words.json` | `projects/bengal-fall/audio/voiceover.words.json` clipped and rebased to `75s-105s` | `0b3520328adbd638d2b6fe9a799e38c7cdc121b2` |
| `audio/bengal-fall-75-105.reveals.json` | reveal markers resolved against the rebased `audio/bengal-fall-75-105.words.json` | `5ca90bea468d5fae96d1f6fea8f40859eaf26326` |
| `audio/bengal-fall-75-105-synthetic-masked.mp3` | synthetic masked variant built from `audio/bengal-fall-75-105-voiceover.mp3` | `02f3c560395b17d472a5584655e771447f4b24b3` |
| `audio/bengal-fall-75-105-synthetic-no-drop.mp3` | synthetic no-drop variant built from `audio/bengal-fall-75-105-mix.mp3` | `83fa01e4ec2ed984812b221af37aadc0f9ab7e44` |

## Rule

If a benchmark source artifact changes, do not silently rely on the live project file.

Either:
1. replace the frozen fixture intentionally
2. update its provenance here
3. rerun the benchmark and verify the new calibration
