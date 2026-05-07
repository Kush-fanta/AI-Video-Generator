# Varnam April 2026 Activity Report

Tasks accomplished and delivered during April 2026

## Executive Summary

April moved Varnam from an experimental Claude Code video harness into an active production system with clearer agents, stronger contracts, real video outputs, and a growing template surface.

The headline outcomes were: formalization of the channel/craft/tool architecture; promotion of three active channel souls into `design.md`; delivery of a 405-template registry across 24 categories; hardening of script governance through `scripts/run.py`, `scripts/SCRIPT_MAP.md`, and `script_registry.py`; introduction of board-first authoring and template-bound storyboard validation; production of three current repo video artifacts plus one diagnosed April render; and creation of a record-book/doctrine loop for feeding production failures back into the system.

The month did not close with a universally ship-clean film. That is the important truth. Varnam is now strong enough to produce long-form outputs and also strong enough to say why they are not ready: missing score contrast, missing evidence assets, stale timing locks, old-shape storyboards, local render bypasses, and stale ledgers.

## Snapshot Metrics

| Metric | Value |
|---|---:|
| April commits on current branch scan | 175 |
| Committed files changed from pre-April baseline | 956 |
| Insertions / deletions in committed April diff | 200,554 / 22,706 |
| Current repo video artifacts inspected | 4 |
| Current long-form/preview projects with video output | 3 |
| April render with postflight evidence but missing current output file | 1 |
| Channel souls promoted to `design.md` | 3 |
| Template registry entries | 405 |
| Template categories | 24 |
| Routed script commands in `scripts/run.py` | 11 |
| Storyboard validation result, `panchatantra-world-politics` | Pass |
| Storyboard validation result, `landlord-trap` | Fail: 330 errors |

## 1. System Architecture And Control Plane

The core architecture now has durable repo surfaces instead of relying on memory or chat context.

The active split is:

- `channels/` holds taste and identity.
- `.claude/skills/varnam/craft/` holds reusable method.
- `.claude/skills/varnam/tools/` holds tool/API behavior.
- `docs/contracts/` holds validation and handoff contracts.
- `scripts/SCRIPT_MAP.md`, `scripts/README.md`, script metadata headers, and `scripts/run.py` hold script governance.

`docs/adr/001-channels-and-skills.md` remains the architecture anchor for taste/craft/tools, while the current runtime truth now lives across channel `design.md` files, `.claude/agents/*`, `.claude/skills/varnam/*`, `docs/contracts/*`, and the script registry.

Delivered value: a new agent or contributor has a clearer map of where taste, method, tools, contracts, and commands live. The system still has drift, but drift is now detectable.

## 2. Channel Identity Build-Out

Three active channels were promoted into durable `design.md` souls:

- `channels/swarajya/design.md`: consolidated dark editorial identity, visual posture, and production rules.
- `channels/indiapill/design.md`: voice, topic gates, slop rules, pacing, data/image balance, and audio posture.
- `channels/nightshift/design.md`: cinematic/diagram modes, voice, color zones, and audio posture.

Historical references were mostly moved into `docs/history/channels/`, reducing clutter in live channel identity files.

Open gap: this migration is not complete. `warindex`, `system12`, `stickman`, and `wtf` still use split `voice.md`, `audio.md`, `visuals.md`, and `config.md` files. Swarajya also still has a live `references.md`. The `design.md` model is proven for the main active channels, not finished across the whole library.

## 3. Varnam Capability Build-Out

### 3.1 Board-First Storyboarding

The largest creative-process change was separating film thinking from render manifest authoring.

The intended production flow is now:

1. Core writes `story/script.md`.
2. Core writes `direction/board/index.md` and scene boards.
3. Audio produces `voiceover.mp3`, `voiceover.words.json`, `voiceover.tagged.txt`, and timing lock.
4. Editor/tooling derives `direction/render-manifest.yaml`.
5. Build/render consumes the manifest.

Delivered value: the board becomes the authored creative surface, while `render-manifest.yaml` becomes a machine-checkable render contract.

### 3.2 Template-Bound Render Manifest Validation

Renderable cuts now need `kind`, `template`, and `props`; retired `base_visual` usage is rejected.

Live validation shows the state:

- `projects/panchatantra-world-politics` passes `python3 scripts/run.py render:validate-manifest projects/panchatantra-world-politics`.
- `projects/landlord-trap` fails with 330 errors because it still uses the retired `base_visual` shape and lacks required template bindings.

Delivered value: old-shape work can no longer look clean just because a preview exists. The validator exposes the mismatch.

### 3.3 Script Governance

The script surface was reorganized into a discoverable command and ownership model:

- `scripts/run.py` exposes stable commands for intake, scaffold, public linking, preflight, postflight, storyboard validation, visual generation, audio generation, and trace manifest creation.
- `scripts/SCRIPT_MAP.md` explains command ownership and lane boundaries.
- `scripts/review/script_registry.py` checks registry drift.
- `.claude/rules/scripts-governance.md` makes this an operating rule.

Current truth: `script_registry.py` fails on the modified `.claude/agents/visual.md` because wired-surface references are missing. That is a useful failure: governance is catching prompt/tool drift.

## 4. Production Output

Current repo video artifacts inspected with `ffprobe`:

| Project | Artifact | Runtime | Resolution | Size | Status |
|---|---|---:|---:|---:|---|
| `ugc-dalit-project` | `output/full.mp4` | 712.92s | 1920x1080 @ 30fps | 43.1 MB | Closest to full film, but postflight says `FIX-BEFORE-SHIP`. |
| `ugc-dalit-project` | `output/s1_hook.mp4` | 141.95s | 1920x1080 @ 30fps | 8.5 MB | Hook render exists. |
| `landlord-trap` | `output/preview.mp4` | 450.73s | 1920x1080 @ 30fps | 226.2 MB | Preview exists, not publishable; storyboard validation fails hard. |
| `panchatantra-world-politics` | `output/preview.mp4` | 347.33s | 1920x1080 @ 30fps | 106.8 MB | Preview-ready, not ship-reviewed; storyboard validation passes. |

Additional April evidence:

- `bengal-curve` has postflight evidence for an April render, but the referenced `out/bengal-curve-v8.mp4` is not currently present in the repo. Treat it as diagnosed render evidence, not a current shippable artifact.

Production lesson: previews are evidence, not release verdicts. The reliable truth stack is video file plus `ffprobe`, then timing/storyboard validation, then postflight/preflight reports, then lane ledger, then `tasks.md`.

## 5. Quality, Iteration And System Hardening

April's strongest system improvement came from using production failures as feedback.

Failures identified and fed back into the system include:

- silent or stale voiceover timing states
- stale timing locks
- old-shape storyboards that still render through local project code
- false-green map verification based on coordinate math instead of preview inspection
- intake overreach when supplied sources already existed
- missing score contrast
- missing evidence portraits/assets
- long holds, low visual novelty, blank frames, and frozen runs in postflight evidence
- stale `tasks.md` and `.lane-state.md` ledgers

Durable hardening surfaces created or strengthened:

- `docs/doctrine.md`
- `docs/record-book.md`
- `docs/contracts/board-render-contract.md`
- `docs/contracts/artifact-naming.md`
- `docs/contracts/handoff-quality-knobs.md`
- `scripts/review/preflight_render.py`
- `scripts/review/postflight_render.py`
- `scripts/review/validate_render_manifest.py`
- `scripts/hooks/project_scaffold_guard.py`
- `scripts/hooks/render_guard.py`
- `scripts/trace/session_manifest.py`

Delivered value: Varnam is now much better at naming why output fails, which is the prerequisite for making the next output better.

## 6. Template And Asset Delivery

The template system became a first-class product surface.

Current registry state:

| Template metric | Value |
|---|---:|
| Total templates | 405 |
| Categories | 24 |
| Draft | 269 |
| In review | 78 |
| Approved | 51 |
| Needs polish | 5 |
| Rejected | 2 |

Largest template categories include `swarajya-kit`, `image-comp`, `data-viz`, `indian`, `narrative`, `hero`, and `transitions`.

The template app now has real catalog and QC surfaces through:

- `templates/app/page.tsx`
- `templates/app/qc/page.tsx`
- `templates/src/app/pages/QCReview.tsx`
- `templates/registry.json`

Open gap: the registry is large but not fully mature. Most templates are still draft or in review. Runtime identity parsing is strongest for Swarajya and not yet equally generalized across IndiaPill and Nightshift.

## 7. Process, Documentation And Coordination

The month also produced the operating scaffolding needed to keep the system maintainable:

- `docs/record-book.md` now acts as the monthly learning ledger.
- `docs/doctrine.md` acts as the runtime primitive index.
- `scripts/SCRIPT_MAP.md` acts as the script navigation map.
- `docs/contracts/*` makes handoff, timing, artifact naming, storyboard, and reviewer contracts inspectable.
- `docs/takeaways/*` captures production diagnoses and lessons that need promotion into channel/craft/contract files.

Open gap: some lessons are still sharper in takeaways than in durable runtime surfaces. The Delimitation diagnosis asks for stronger Swarajya brand signals and a clearer QC rule around "stop polishing a bad surface; re-author the format." Those are not yet fully visible in `channels/swarajya/design.md` or `review-qc.md`.

## 8. Current Risks

- No current lane is proven ship-clean end to end.
- `landlord-trap` has a real preview but still fails the current board/manifest contract.
- `panchatantra-world-politics` has a coherent preview but lacks postflight review.
- `ugc-dalit-project` has the closest full film but is explicitly `FIX-BEFORE-SHIP`.
- Template growth has outpaced governance; 269 entries remain draft.
- Channel `design.md` migration is incomplete outside the three active channels.
- Current worktree is dirty, including unrelated tracked edits and untracked `public/`.

## Looking Ahead - May 2026

Priorities entering May:

1. Close one production lane completely with fresh preflight, render, postflight, and no stale-ledger claims.
2. Bring `landlord-trap` onto the current board/manifest contract or explicitly park it as old-shape evidence.
3. Complete or clearly scope the channel `design.md` migration.
4. Promote Delimitation lessons into Swarajya design, craft, and QC surfaces.
5. Tighten template governance by reducing draft sprawl and making approved/in-review states meaningful.
6. Generalize `design.md` identity parsing beyond Swarajya.
7. Keep using real video inspection as the source of readiness, not commit count or preview existence.

## Closing Note

April was a month of moving from prompt confidence to artifact truth.

Varnam now has enough structure to produce real videos, enough validation to say why those videos fail, and enough durable repo surfaces to turn failures into stronger channel souls, craft rules, contracts, and tools. May should be judged by whether one lane closes cleanly end to end, not by another expansion of surfaces.
