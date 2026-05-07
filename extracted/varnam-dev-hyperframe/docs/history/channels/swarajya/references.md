# Swarajya — References

## Channel
- **URL:** https://www.youtube.com/@Swarajyamag
- **Format:** Long-form YouTube documentary (9–16 min). Instagram Reels are a separate product with different visual grammar (WARTIME GRAPHIC NOVEL — not studied here).

---

## Round 0 — Identity Bootstrap (2026-04-14)

- **Source:** `AESTHETICS_LIBRARY.md` (commit `4b3de17`) — WARTIME GRAPHIC NOVEL entry, origin: Rafale 114 Instagram Reel (Swarajya, 2026)
- **Method:** Extracted palette, text treatment, art style directive. Extended with guessed narrative stance, audio system, config.
- **Problem:** Bootstrap was built for Instagram Reels (short-form, graphic novel aesthetic). The actual YouTube channel is different. Round 1 corrected this.

---

## Round 1 — First Study (2026-04-14)

- **Videos analyzed:** 6 most recent uploads
  - `Rc7Knnuai-Q` — Drone Shield / 600 drones / 866K views / 9.4 min ← heatmap available
  - `gPIKnV-kjgY` — Nuclear Submarines / 177K views / 15.8 min
  - `vFpwyeIpM5I` — Rocket Force (IAF) / 30K views / 12.9 min
  - `KiAclFHNSk8` — PFBR Criticality / 35K views / 9 min
  - `-YKIKmTKO_k` — Satellite Bodyguards / 7.4K views / 11.7 min
  - `FE5zEspB9YY` — Battery Assembly / 7.7K views / 10 min
- **Data gathered:** Transcripts (6), heatmap (1 — Rc7Knnuai-Q only), Gemini visual + audio analysis (2 — Rc7Knnuai-Q, gPIKnV-kjgY)

### What Changed From Round 0

**Major corrections (taste — all 4 channel files updated):**

1. **Visual identity corrected.** The YouTube channel is NOT WARTIME GRAPHIC NOVEL. It is a dark ops-room documentary with two production modes:
   - Mode 1 (Animated Infographic): flat-vector illustration, bold condensed sans, ~27 CPM
   - Mode 2 (Footage Documentary): real B-roll + archival photos, editorial serif, 15–18 CPM
   - Palette: navy `#192841` + gold `#D4A264` + red `#D8323E` (not halftone green/orange/olive)

2. **Audio corrected.** Score is NOT military brass + snare. It is:
   - Mode 1: electronic/synth-cinematic (pads, bass, digital percussion, processed strings)
   - Mode 2: orchestral-synthetic hybrid (strings, piano, synth pads, taiko)
   - Behavior: near-constant bed that breathes, not enter/exit on cues

3. **Voice ID added:** `pfXTiBUjN7V2lyZgTbui` (the actual Swarajya narrator)

4. **Narrative additions (from heatmap + structural analysis):**
   - Gap Reveal as primary hook formula (confirmed by high vs low performers)
   - Human Story Rule (absolute heatmap peak at 1.0 = IdeaForge human arc, not technical content)
   - Direct address pattern on verdict lines
   - Long-form arc added (9–16 min structure)
   - "Did you know" added to SLOP kill list

### Heatmap Cross-Reference (Rc7Knnuai-Q — Drone Shield)

| Peak | Value | Timestamp | What's happening |
|---|---|---|---|
| First spike | 0.33 | 0:56–1:11 | Cost asymmetry: "AK-47 of warfare costs $4,000, intercept costs $4M — you spend 20x" |
| Second spike | 0.69 | 3:26–3:52 | S-400 first combat use: "longest surface-to-air kill ever recorded, 300 km" — verified superlative |
| **ABSOLUTE PEAK** | **1.0** | **6:05–6:34** | **IdeaForge human arc: bootstrapped 8 years, 3 Idiots film, 106x IPO, battle-tested → 137 crore emergency order** |
| Third spike | 0.38 | 7:50–8:19 | Honest accountability: "70% of India's drones were knocked out by jamming. The government disputes this." |

**Pattern:** Replay peaks are NOT technical explanations. They are: concrete economic arguments (cost asymmetry), verified superlatives (longest ever), human stories with specific numbers (106x), and honest accountability.

### Lenses (Round 1)

Built from observation of 6 videos:

1. **Gap Reveal** — the hook creates a gap between what viewers know/believe and what the video will show. High performers all do this. Low performers answer the question in line 1.
2. **Human Arc as Engagement Anchor** — the heatmap peak is always a human story, not a technical fact. Embedded in the larger argument.
3. **Adversary Action as Structural Diagnostic** — enemy's move reveals India's gap (Pakistan builds rocket force → India doesn't have one; Nixon sends Enterprise → India needs nuclear deterrence)
4. **Verified Superlative** — claims with specific measurable verification ("longest surface-to-air kill ever recorded") spike replays
5. **Honest Accountability** — admitting failure or uncertainty alongside success drives the third engagement spike. The channel's credibility comes from this.

### Frontier (Round 1)

- ~~Produce a video using the corrected identity~~ Done (Bengal Curve Ch1)
- Visual comparison against the reference videos in Round 2
- Audio comparison — does the synth-cinematic score feel like theirs?
- Test whether the voice ID `pfXTiBUjN7V2lyZgTbui` matches the actual narrator register

---

## Round 2 — Template Execution Gap (2026-04-15)

- **Reference studied:** `vFpwyeIpM5I` — "Why India Needs a Rocket Force" (12:50, 38K views)
- **Produced output compared:** Bengal Curve Ch1 (`projects/bengal-curve/output/ch1-preview.mp4`)
- **Method:** Full transcript analysis, structural decomposition, frame-by-frame comparison of reference screenshots vs produced stills

### Key Finding: Execution Gap in Template Layer

The channel identity files (visuals.md, config.md, voice.md) are **correct** — they describe exactly what the reference looks like. But the Remotion templates render the wrong aesthetic because:

1. **Palette hardcoding.** Templates imported `P` (warm cream/terracotta) instead of accepting channel palette overrides. The `SP` Swarajya palette existed in `shared/swarajya-palette.ts` but no template used it.
2. **Missing visual mode.** The reference's split layout (cinematic image LEFT + navy stat panel RIGHT with hero number, gold label, red rule, supporting text) had no template equivalent. Closest was `FramedLeftTextRight` which renders rounded images on cream canvas with serif headlines.
3. **Wrong typography.** Templates used Instrument Serif everywhere. Reference uses Bebas Neue (condensed sans-serif) for Mode 1.
4. **No channel badge.** `#SWARAJYA` red box badge (persistent top-right) was not wired into compositions.

**Classification:** All four are execution gaps. The system knows what to render — the rendering layer doesn't apply it.

### What Was Fixed

1. `shared/palette.ts` — added `mergePalette()` function for channel overrides
2. `image-comp/full-bleed-overlay.tsx` — palette-aware, added `condensedMode` (Bebas Neue), category label with red rule, badge slot
3. `image-comp/split-image-stat.tsx` — **new template** matching reference Frame 1 exactly
4. `hero/stat-hero.tsx`, `hero/stat-hero-with-image.tsx`, `image-comp/framed-left-text-right.tsx` — all made palette-aware via `mergePalette()`
5. **7 Swarajya-specific templates built, tagged in registry.json** — `SplitImageStat`, `SplitImageStatReveal`, `FullBleedOverlay`, `SectionMarker`, `DualStatCompare`, `VerdictOverlay`, `StatStrip`
6. **`BengalCurveGraph` animated data viz component built** at `data-viz/bengal-curve-graph.tsx`
7. **Demo reel rendered:** `swarajya-kit-demo.tsx → SwarajyaFullReel` (49s, all 7 templates with whip/flash transitions)

### Taste Corrections (from Gemini visual + audio analysis)

1. **Cut rate: 8-9 CPM actual** (was 15-30 CPM in config). Previous values were 3x too fast. Updated config.md and visuals.md.
2. **Mode dwell time: 5-7s per shot** (was 1.5-4s). Updated config.md.
3. **Score is NOT a constant bed** — patchwork of 12+ distinct cues (30-60s each) with deliberate silence stretches (5-27s). Signature technique: swell-then-silence at peaks. Updated audio.md and config.md.
4. **Score ducking more aggressive: -15 to -20 dB** (was -12 to -16 dB). Updated audio.md and config.md.
5. **Illustration style (unverified):** Gemini reported "retro halftone/propaganda-poster" at 0:21, 0:41, 2:58 — contradicts visuals.md which says "NOT comic-book/halftone." Needs frame-level verification before updating.

### Narrative Analysis (no gap found)

Full transcript confirms what voice.md already captures:
- Adversary hook → objection preempt ("you'd be right. But...") → reframe → frustration inventory → institutional history → American parallel → verdict as challenge
- First-person direct address ("I want you to sit with that")
- Concrete contrast pairs ("60 lobbying engagements... Four")
- No new narrative patterns needed — the script quality is not the bottleneck

### Lenses Update

Existing lenses still producing findings. No new lenses needed. Round 2 findings were entirely in the execution layer.

### Frontier (Round 2)

- Re-render Bengal Curve using the template kit and corrected channel identity
- Add safe area constant to `shared/primitives.ts`
- Improve mograph agent prompts with safe area and production quality defaults
- Compare audio scoring against reference (not yet analyzed in depth)
