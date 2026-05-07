# Swarajya — Channel Ledger

Measured performance bands and past-work observations. This is not identity. It tracks what has worked, what shipped, and what postflight should measure.

## Performance Bands

| Metric | Band | Source |
|---|---:|---|
| Long-form media/data beats | 80+ for a 12-18 minute piece | Round 1 reference study |
| Average frame duration | 4-5 seconds | Round 1 reference study |
| Pure-type stretch max | 15 seconds without explicit direction | Round 1 reference study |
| Production fallback stretch max | 0 seconds | `landlord-trap` failed render, 2026-04-27 |
| Low-novelty plateau max | 15 seconds | `landlord-trap` failed postflight, 2026-04-27 |

## Reference Runs

### 2026-04-25 — Nuclear submarine reference

- Source: `channels/swarajya/references.md` Round 1.
- Observed `~115` media beats in `15:50`.
- Observed average frame duration `3-6s`, modal `4-5s`.
- Observed longest pure-type stretch `17s`, deliberately held.

### 2026-04-27 — Landlord Trap failed render

- Source: `projects/landlord-trap/output/preview.mp4`.
- Postflight failed: longest hold `31.267s`, longest low-novelty plateau `27.0s`.
- Root cause: renderable missing-asset fallbacks became production frames; debug labels and storyboard intent leaked on screen.
- Asset coverage failure: `20` image cuts stayed `awaiting_render`, covering `144.4s` of runtime.
- Creative failure: generated "editorial" images behaved like wallpaper, while the board's load-bearing archival/data referents were still missing.
- Channel lesson: a Swarajya render cannot ship through missing referents. If a required image is not filed, replace the beat with a designed data/map/document treatment or send the package back upstream. Do not approve a navy fallback card as a creative substitute.

### 2026-05-05 — BJP UP 2027 commissions failed preview

- Source: `projects/bjp-up-2027-commissions/output/preview-draft.mp4`.
- Postflight failed: longest hold `87.8s`, longest low-novelty plateau `84.0s`.
- Frame-integrity warnings: `1267` blank frames, `1267` solid-color frames, `21` frozen runs.
- Speech masking check could not read audio from the preview MP4 through ffmpeg, so the mix remains unverified.
- Channel lesson: a timed render is not enough. If the video collapses into blank or solid holds, reviewer should treat it as a failed composition/render surface before making taste notes.

## Render Checks

Postflight may read this ledger for channel-specific measured bands. If a future film intentionally breaks a band, the project direction should say why.
