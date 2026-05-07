# India Pill — References

## @aevytv
- **URL:** https://www.youtube.com/@aevytv
- **Last studied:** 2026-04-10
- **Round:** 1
- **Videos analyzed:** 5 — WW3 (_j_JTk6WfAo), Nothing (BYodMVmmTc0), BigFood (Tly9QFHZlK4), Roads (VEu8biALJ8s), China Air (-VPYbJxPvzY)
- **Data:** Transcripts (5), Heatmaps (4), Visual analysis (pending)
- **Key finding:** 5-move investigation structure (paradox hook → personal ground → escalation ladder → proof of alternative → agency transfer). Heatmap-confirmed: contradiction moments peak engagement, exposition without payoff kills it, closings that reveal beat closings that summarize.
- **What was updated:** `craft/writing.md` — added investigation format, inner loop cadence, paradox as structural device, evidence-after-narrative rule, revelation vs summary closings
- **Visual analysis (Gemini):** Image-dominant (80-100 cuts/min in montages), CGI recreations, custom animation, parallax, mint green kitchen set, warm orange/red accents. Professional documentary production value. This is a TASTE difference from India Pill, not a gap — India Pill's editorial/typographic approach is deliberate identity. Do not adopt AevyTV's visual modes.
- **What to learn visually:** Mode switching frequency (never same mode >60s), overlay-heavy transitions (not hard cuts), desaturation for archival contrast, chapter cards as tonal resets.
- **Frontier:** Audio/scoring patterns, production test needed

## Round 2: GCC Video Comparison
- **Date:** 2026-04-10
- **Video analyzed:** `projects/gcc/output/preview_with_audio.mp4` (4.3 min, produced BEFORE Round 1)
- **Method:** Gemini visual/audio analysis + manual gap analysis against AevyTV findings and channel spec
- **Findings:**
  - **Execution gaps (4):** Zero real images (visuals.md already requires them), no mode switching (config already has `mode_max_consecutive: 60s`), generic ambient score (audio.md already specifies narrative-scored), wrong voice gender (audio.md says male)
  - **Craft gap (1):** No human beat until minute 5 of 6. Added Human Beat Rule to `craft/writing.md` — first 40% of runtime must have a named person
  - **Already fixed by Round 1 (1):** Flat middle / no escalation ladder — the investigation format added in Round 1 addresses this
- **Systemic changes (new — execution gap classification):**
  - Updated `craft/improviser.md` — added "execution gap" as third classification type, findings update enforcement layer
  - Added classification review gate (Sonnet subagent) to prevent taste/craft mixing
  - Updated `craft/writing.md` script review gate — added human beat and visual variety pass/fail checks
  - Updated `.claude/agents/reviewer.md` — added Pass 2b for storyboard asset coverage verification
  - **Lenses active:** Structure (from Round 1), Visual Coverage (new — tracks whether storyboard visual variety survives into render), Enforcement Fidelity (new — tracks whether known rules are actually enforced by the pipeline)
  - **Frontier:** Score a video using narrative-scored approach from audio.md. Test whether Round 1 escalation ladder + Human Beat Rule produce a structurally better script. Produce a video and compare.

## Round 3: Anchor Continuity + Audio Scoring
- **Date:** 2026-04-11
- **Input:** GCC output (gcc_preview.mp4) + AevyTV "Roads" (VEu8biALJ8s) Gemini comparison + user feedback ("canvas in each frame is disconnected")
- **Findings:**
  - **Craft gap (visual continuity):** System had no principle for anchor-based continuity vs. ghost stacking. Added "Visual Continuity Through Anchor Transformation" to `craft/visual-editing.md`.
  - **Taste fix (config):** `previous_elements` in `config.md` was defining connected canvas as universal ghost opacity — corrected to: one named anchor per chapter, full exit for everything else.
  - **Craft gap (audio):** System had no universal scoring principle. India Pill `audio.md` had instrument palette and phase triggers but no structural rule for when score must break. Created `craft/audio.md` with Score Breaks, Silence as Structural Tool, Music Enters for Reasons.
  - **Craft gap (mode cycling):** System had a ceiling (`mode_max_consecutive`) but no rhythm principle. Added "Mode Cycling vs. Mode Isolation" to `craft/visual-editing.md`.
  - **Lenses active:** Structure, Visual Coverage, Enforcement Fidelity, **Anchor Continuity** (new — tracks whether a chapter has a named transforming element or just isolated frames), **Score Structure** (new — tracks whether music responds to narrative turns or runs ambient throughout)
- **Frontier:** Produce a video with the updated anchor doctrine + score break doctrine active. The storyboard must name an anchor per chapter. The sound brief must specify the zero-moment silence and escalation peak. Compare against AevyTV "Roads" — specifically the "Zero" moment (2:54–3:01) as the target for what a scored silence beat should feel like.

## Round 4: Export Revolution — Production Feedback
- **Date:** 2026-04-13
- **Input:** User feedback on `projects/export-revolution/output/preview.mp4` (298s, 4 chapters, India Pill channel)
- **Method:** Code inspection of Chapter1-4.tsx, SouthIndiaMap.tsx, image assets. User feedback as pre-classified findings.
- **Findings (4):**
  - **Execution gap — low visual usage:** 3 images total in 298s (iphone-whole, iphone-disassembled, factory-narsapura). Storyboard planned 4th (tata-industrial-split) — never generated. Chapter 1 has zero images. Storyboard itself only planned 4 images for 5 minutes — below any reasonable floor.
  - **Execution gap — hand-drawn SVG maps:** `SouthIndiaMap.tsx` uses literal hand-drawn SVG paths (`M 140 100 L 200 80...`). Config says `map_engine: "D3 + TopoJSON, Survey of India boundaries"`. Reviewer found `visual/maps.md` already has the full tool spec — the builder ignored it entirely.
  - **Craft gap — non-deterministic image sizing:** All `<Img>` components use `height: "auto"` or `objectFit: "contain"` without explicit container dimensions. Layout shifts with image resolution. Storyboard format had no image footprint spec.
  - **Execution gap — bgless not used:** All 3 images are RGB mode (no alpha channel), 1376×768, identical generation size. `--bgless` flag was never invoked despite storyboard tagging all images as bgless. No post-generation transparency check existed.
- **What was updated:**
  - `craft/storyboarding.md` — added Image Density Awareness (principle, no numbers) + Image Footprint in Composition (mandatory width/height/anchor in manifest)
  - `channels/indiapill/config.md` — added `image_density_floor: "2 per minute"`, `max_typography_run_sec: 35`
  - **Classification review:** Sonnet reviewers caught taste values in initial craft proposals. Image density numbers (2/min, 35s max) moved from craft to config. Pixel coordinate examples stripped from craft. Proposed `craft/maps.md` rejected — `visual/maps.md` already has full coverage; gap was execution, not knowledge.
  - **Lenses active:** Structure, Visual Coverage, Enforcement Fidelity, Anchor Continuity, Score Structure, **Image Pipeline Integrity** (new — tracks whether bgless flag is used, transparency verified, dimensions match storyboard), **Layout Determinism** (new — tracks whether frame composition is stable across image resolutions)
  - **Frontier:** Produce a video. The storyboard must: specify image footprints, plan ≥2 images/min, use D3/TopoJSON maps (not SVG paths). The image pipeline must: verify RGBA transparency, match storyboard dimensions. Compare visual density and map quality against the export-revolution output.

## Round 5: PFBR + Agent Trace Analysis
- **Date:** 2026-04-14
- **Input:** PFBR ch1-preview.mp4 code inspection (all 4 chapters) + Silk Road Gods creative team trace (`13056c54`) + PFBR visual production trace (`58f0b599`)
- **Method:** Code inspection of Chapter1-4.tsx against storyboard spec + trace analysis of both creative team and visual production coordination patterns
- **Findings:**
  - **Execution gaps (5):** Dark canvas abuse in Ch1 (2 non-dark-punch scenes use dark canvas), Kalpakkam image misplaced to Scene 1.6 (belongs in 2.1 only), map placeholder in Scene 3.6 (repeat from Round 4), throughline schematic built as text not SVG, closing compressed to 4s (storyboard needs ~12s)
  - **Craft gap — think tank coordination:** Silk Road Gods trace showed creative team running as subagents where reviewer couldn't SendMessage teammates. Editor manually routed all inter-agent communication — three production sessions confirmed the friction. Updated ADR-007 to direct teammate messaging.
  - **Craft gap — editor-as-DoP antipattern:** PFBR visual production trace showed 46 code edits by editor, 0 DoP dispatches. Editor built all 4 chapter components from scratch AND did all fix iterations. DoP was never spawned. The editor should spec + diagnose, DoP should build + fix.
  - **Craft gap — Gemini reviewer false positives:** Visual production trace showed reviewer reporting incorrect failures on Ch3 bars and Ch4 scale. Editor overrode by rendering individual frames as evidence. No doctrine existed for false-positive adjudication.
  - **Observation — 6 review rounds vs 2-cycle max:** Visual production needed 6 rounds (partly real bugs, partly Gemini false positives). 2-cycle hard cap is unworkable for visual review. Updated to "escalate after 2 cycles" with override/dispatch/accept options.
  - **Observation — H.264 compression floor:** Ch1 leader line took 7 iterations. Sub-8px elements at low contrast don't survive video compression. Minimum visible element: ~24px at 0.75 opacity.
- **What was updated:**
  - `docs/adr/007-agent-teams.md` — think tank naming, direct routing, dynamic reviewer contract, DoP builds (editor doesn't write code), termination rule fixed (dispatch or accept, never fix directly), channel file access contradiction resolved
  - `craft/editing.md` — self-contained think tank doctrine + DoP builds chapters from spec + shared file ownership clarified (editor writes skeleton, DoP builds within)
  - `docs/varnam/think-tank-diagram.md` — new, covers both script loop (think tank) and visual production loop (editor→DoP→reviewer)
- **Lenses active:** Structure, Visual Coverage, Enforcement Fidelity, Anchor Continuity, Score Structure, Image Pipeline Integrity, Layout Determinism, **Pipeline Coordination** (new — tracks creative team self-coordination), **Build Ownership** (new — tracks whether editor or DoP writes component code), **Reviewer Reliability** (new — tracks false positive rate in Gemini visual review)
- **Frontier:** (1) Run the think tank as an actual agent team in next production. (2) DoP builds chapters — editor dispatches, does not write Chapter.tsx. (3) Add rendered-frame evidence path for overriding Gemini false positives. (4) Test H.264 compression floor (24px minimum). (5) Remaining PFBR execution gaps (dark canvas, map, throughline, closing) need fixing during visual production. (6) Update SKILL.md / runtime prompt to match new doctrine (stale runtime was root cause of editor-as-DoP in PFBR session).
