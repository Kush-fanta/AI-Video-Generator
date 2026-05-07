# Board And Render Manifest Contract

Design reference for the board-first authoring model, the derived render manifest, and the think-tank operating model that produces them. Not a spec for code yet — an agreed model to edit skills and contracts against.

Status: agreed direction, partial implementation live (see "Implementation Status" at bottom).

---

## 1. Think Tank Operating Model

### When think tank is ACTIVE

- `core` is **the supervisor**. Not a coordinator. Not a router.
- `core`'s job is cognitive, not mechanical:
  - Reads the agenda and the channel harness.
  - Decides what outcome to push for (views, likes, comments — the real metric, not "completion").
  - Exploits loopholes, patterns, angles the harness reveals.
  - Briefs the `researcher` (full brief or point-list) with exactly what to dig into.
  - Pushes the system harder than the stated goal.
- `researcher` executes dynamic content research against `core`'s brief. Reports back. Does not decide what to research.
- `editor` has **no active role** while think tank is on. Owns only the entry/exit gates and the brief.
- `reviewer` stays as-is.

### When think tank is INACTIVE

- Every agent is just an agent. No supervisor. Flat.

---

## 2. Pipeline

```
script + board canvas  →  audio (tags + TTS)  →  voiceover.mp3 + words.json + voiceover.tagged.txt  →  manifest derivation  →  build
```

### Authoring pass (core)
- Writes `story/script.md`.
- Writes the board canvas:
  - `direction/board/index.md` — script interpretation, project-specific channel variation, per-story design pack, film-level bet, arc, visual spine, sound spine, anti-goals.
  - `direction/board/<scene-id>.md` — one markdown file per scene. The canvas is where the film gets *seen*: continuous prose walking each scene as a viewer experiences it, with concrete visual references at real visual turns.
- Writes `audio/voiceover.source.txt` for TTS.
- Does not write `direction/render-manifest.yaml`. No draft cuts. No approximate timings. No performance tags — **core does not author TTS markup**.

### Audio stage (audio agent)
- Consumes: `story/script.md`, `channels/<name>/design.md`, the `tts_engine` declaration from `task-config.md`.
- Applies engine-appropriate expression tags (ElevenLabs v3 inline tags, Gemini DIRECTOR'S NOTES) based on the declared engine.
- Produces:
  - `audio/voiceover.mp3` — the rendered audio
  - `audio/voiceover.words.json` — word-level timing
  - `audio/voiceover.tagged.txt` — the exact tagged text submitted to TTS (performance read-back)
  - `audio/voiceover.srt` — subtitle encoding
  - `audio/timing.lock.json` — timing lock

### Manifest derivation (editor/tooling)
- Begins only after reviewer approves the board and audio timing exists.
- Writes `direction/render-manifest.yaml` from the approved board and `audio/voiceover.words.json`.
- Mechanical timeline placements only: cut spans, overlay anchors, beat triggers, audio_tracks, asset refs.
- Carries no creative content the board does not already carry. If derivation needs a creative decision, the editor sends the gap back to core and the board changes first.

### Invariants

- **There is no manifest before `words.json` exists.** No cut spans, beat triggers, or approximate durations. The board exists before timing; the manifest does not.
- **Canvas before manifest.** `direction/render-manifest.yaml` is never the first place creative thinking happens. `direction/board/` lands first, locks, and the yaml derives from it. Authoring straight into yaml is manifest authoring, not boarding a film — and reads as such.
- **Core does not write TTS tags.** Tagging is the audio agent's craft, engine-specific, and lives in `voiceover.tagged.txt`. Core stays engine-agnostic.
- **`direction/voiceover.txt` is not a pipeline artifact.** The audio agent reads from the script; the performance layer lives in `voiceover.tagged.txt`.
- No screen-first vs frame-first split. No scene-first vs narration-first. **One runtime timeline.** Spoken content anchors by word indices; silent content anchors by global frames. The runtime may exceed raw VO duration — held silence, visual aftermath, outro space are first-class uses of the extra envelope.

---

## 3. Artifact Naming (see separate doc)

See `docs/contracts/artifact-naming.md` for the repo-wide file naming convention. Storyboard artifacts follow those rules; the current graph row for `direction/` lives there.

## 4. Hierarchy

```
scene       — editorial grouping of cuts (always present; a short piece is one scene)
 └ cut      — a time slice on the timeline: video clip, image, held frame, typography
    ├ overlays — persistent elements with a lifespan (text, labels, highlights)
    └ beats    — discrete events (SFX, music hits, camera moves)
```

Questions each layer answers:

| Layer | Question |
|---|---|
| scene | What's the editorial section? |
| cut | What's on screen right now? |
| overlay | What's present and for how long? |
| beat | What just moved or sounded? |

**Nothing above scene** (script owns chapter/section/act).
**Nothing below overlay or beat** (keyframes and curves are the builder's problem).

### Scene

- Always present. A 30s piece is a one-scene piece.
- Contains cuts in order.
- Holds editorial intent, not mechanical timing.

### Cut

- The time slice. This is the visible foreground on the timeline.
- A cut is one of: video clip, image, held frame, typography card, designed composition.
- Owns its render binding: advisory `kind`, required `composition`, and required `variables` for renderable cuts.
- Addressed on the timeline via one of two modes:
  - **VO-tied** → `words: [i..j]` (indices into `words.json`)
  - **Silent / visual-only** → `frames: [f1..f2]` (global frames on the runtime clock)
- No floating milliseconds. Mid-word cuts are structurally impossible because you can't name half a word.
- A cut carries two peer collections: **overlays** (persistent elements with a lifespan) and **beats** (discrete events).
- `kind` describes the screen mode for humans and filtering. It is not the render contract.
- `composition` and `variables` are the render contract. A cut without them is unresolved unless it is an explicitly designed held/silent cut.

### Overlays

Overlays are persistent elements that occupy screen space with a lifespan — text, labels, graphic overlays, highlights, callout boxes. They model *state*, not events.

```
overlay:
  id
  kind: text | label | graphic | highlight | ...
  content: "..."           # what the overlay carries
  appears_at: { word: i } | { frame: f }
  life: stays | until <ref> | pulse
```

**Lifespan vocabulary:**
- `stays` — persists until the cut ends (default for most overlays)
- `until <ref>` — exits at a named trigger: `until { word: j }`, `until { frame: f }`, `until end_of: <other_overlay_id>`
- `pulse` — momentary; appears and disappears in one move (author states the disappearance trigger)

Overlays layer naturally: three text overlays with `stays` and staggered `appears_at` give a stacking reveal. One overlay's `life` can bind to another's exit.

Overlays do **not** specify animation style, curve, or duration. Those live in channel motion design; builder reads both and composes.

### Beats

Beats are discrete events on the timeline — SFX stings, music hits, camera pushes, short non-persistent animations. They model *what just happened*, not *what's on screen*.

```
beat:
  channel: visual | audio
  trigger: { word: i } | { frame: f } | { relative_ms: offset }
  event: "sfx: whoosh" | "camera_push: 1.1x" | "music_hit" | ...
```

- Beats are atomic. One event per beat.
- Beats fire in parallel by sharing a trigger. A visual push synchronized to an audio sting is two beats at the same trigger, not a special "both" channel.
- A cut with no beats is a held state. A cut with many beats is choreographed.

### Overlays vs beats — the split

| | Overlays | Beats |
|---|---|---|
| What they model | screen state (things present) | events (things happening) |
| Have a lifespan | yes | no |
| Can layer via shared trigger | yes (via `appears_at`) | yes (via shared trigger) |
| Carry content | yes (text, graphic) | no (just event reference) |
| Harness metric | screen complexity | pacing density |

The stacking reveal case — text1, text2, text3 arriving one at a time and all staying through the cut — is three overlays with staggered `appears_at` and `life: stays`. Not three beats.

### The list-overlay / list-beat failure

An overlay carries **one** content payload. A beat fires **one** event. "Text: A, then B, then C" is three overlays, not one overlay with a list. "Show A, then B, then C" in a single beat is a list-beat — reject and split. Lists are what make downstream agents guess.

A pullback that reveals or a push-in that lands is still *one* beat (one coherent event). Coherent motion is not a list.

---

## 5. Timeline Addressing

Two addressing modes, both explicit, both snap to the same clock. They apply to every timeline-bearing node — cuts, overlays (`appears_at`, `life.until`), beats (`trigger`), and audio tracks (`span`).

| Mode | When | Reference |
|---|---|---|
| `words: i` or `words: [i..j]` | Tied to narration | indices into `audio/voiceover.words.json` |
| `frames: f` or `frames: [f1..f2]` | Silent bridge, aftermath, outro, or any non-VO moment | global frames on the runtime timeline |

The builder converts word indices → frames at build time by reading `words.json`. **Authors never write milliseconds into the storyboard.** There is no `relative_ms` or any other time-offset mode — if a beat needs to fire mid-cut, it uses a word index or a global frame number, both of which resolve to exact frames at build time.

---

## 6. Parallel Layers

Not everything belongs to a cut. Some things span.

### Audio tracks (parallel layer above cuts)

```
audio_tracks:
  - id
  - kind: music | ambience | drone
  - span: { words: [i..j] } | { frames: [f..f] }
  - behavior: duck_under_vo | continuous | swell
```

Beats can trigger events *on* tracks (fade in/out, swell). Tracks themselves are not beats.

### Captions

Subtitles render continuously from `words.json`. They are a render-layer setting, not authored content:

```
caption_track: { enabled, style_ref }
```

Do not express captions as beats — that would duplicate `words.json` and invite drift.

---

## 7. Motif, Reuse, Callback

First-class fields on cuts and scenes:

```
cut:   { reuses: cut_id | null, callback_to: scene_id | null }
scene: { motif_tags: [...] }
```

Reviewer reads these to measure:
- asset reuse rate
- callback density
- motif consistency across the piece

No extra scaffolding. These are queries over the render manifest.

---

## 8. Harness ↔ Contract

The contract makes channel metrics queryable without invention.

| Metric | Reads from |
|---|---|
| cpm (cuts per minute) | count of cuts per minute |
| bpm (beats per minute) | count of beats per minute |
| beats per cut | distribution of beat counts across cuts |
| overlays per cut | distribution of overlay counts (screen complexity) |
| cut length distribution | cut durations (median / variance) — resolve via `words.json` |
| scene count | total scenes in the piece |
| scene length distribution | scene durations (median / variance) — resolve via `words.json` |
| reuse rate | cuts with `reuses` set / total cuts |
| callback count | total `callback_to` references in the piece |

Length metrics require resolving word spans into frame counts via `audio/voiceover.words.json` plus `piece.fps`. Count / rate / distribution metrics over counts read directly off the render manifest.

### Dynamic targets, not fixed rates

- The **channel harness** carries *reference bands* measured from real renders (not invented numbers).
- The **core** supervisor sets the per-piece target based on intent. Tense segment → push cpm. Reflective opening → drop it.
- The **reviewer** measures delta from the per-piece target, not from a static channel constant.

Bootstrap: until own-channel renders accumulate, bands come from **measured reference videos** — admired work whose cpm/bpm/hold distribution has been measured and encoded. Replace with own-channel measurements over time.

---

## 9. Board And Render Manifest Contract (sketch)

The storyboard lives on two surfaces. `direction/board/index.md` plus `direction/board/<scene-id>.md` is the **authored** canvas — film spine plus one markdown file per scene, prose flow with concrete visual references at real visual turns, primitive set, sprite pack, composition recipes, and the place creative thinking actually happens. `direction/render-manifest.yaml` is the **derived bound render manifest** — structured timeline placements plus HyperFrames composition/variable bindings, mechanical and clean, what the runtime reads. Canvas authored first by core. Manifest derived after canvas locks by editor/tooling. This contract is the schema for the manifest; the canvas form lives in `.claude/skills/varnam/craft/storyboarding.md`.

```yaml
piece:
  schema_version: int         # current breaking schema: 2
  locale: string              # BCP-47 tag: "en-IN", "bn-IN", "hi-IN", etc.
  runtime_frames: int
  fps: int
  caption_track: { enabled: bool, style_ref: string | null }
  audio_tracks: [AudioTrack, ...]
  scenes: [Scene, ...]        # always present

Scene:
  id: string
  intent: string              # editorial why
  motif_tags: [string, ...]
  cuts: [Cut, ...]

Cut:
  id: string
  span: { words: [i, j] } | { frames: [f1, f2] }
  timing_source: tts | frame | external_srt   # tts = word-indexed; frame = silent/visual-only; external_srt = imported audio with its own timing
  kind: string | null         # advisory screen mode, e.g. image/document/data/map/typography/composite/held
  composition: string | null  # required for renderable cuts; HyperFrames composition id/path, e.g. "compositions/card.html#card"
  variables: object           # required by composition; maps to data-variable-values / data-var-* inputs
  reuses: cut_id | null
  callback_to: scene_id | null
  overlays: [Overlay, ...]    # persistent elements with a lifespan
  beats: [Beat, ...]          # discrete events

Overlay:
  id: string
  kind: text | label | graphic | highlight | ...
  content: string             # what the overlay carries
  appears_at: { word: i } | { frame: f }
  life: "stays" | { until: { word: j } | { frame: f } | { end_of: overlay_id } } | "pulse"

Beat:
  id: string
  channel: visual | audio
  trigger: { word: i } | { frame: f }
  event: string               # declarative event reference: "sfx: whoosh", "camera_push", "music_hit"
                              # magnitude, curve, duration — builder reads channel motion design

AudioTrack:
  id: string
  kind: music | ambience | drone
  span: { words: [i, j] } | { frames: [f1, f2] }
```

Prose breathing room lives in side fields (`intent`, overlay `content`, `event` strings). The spine stays machine-readable. `kind` remains descriptive; renderability comes from `composition` + `variables`.

**Entry transitions, beat magnitudes (e.g. push amount), and audio track mix behavior (duck, swell, continuous) are not in the contract.** They live in channel design (`channels/<name>/design.md`) and audio taste docs. The storyboard names *what*; channel files specify *how*; the builder composes both.

---

## 10. Invariants

A schema-valid render manifest is not automatically a buildable render manifest. These invariants must hold for a piece to resolve onto the runtime clock without guesswork.

### Containment

- Every `Overlay.appears_at` and every `Overlay.life.until` trigger must resolve inside its parent cut's `span`.
- Every `Beat.trigger` must resolve inside its parent cut's `span`.
- Every `AudioTrack.span` must resolve inside `[0, piece.runtime_frames)`.

### Contiguity

- Cuts within a scene are ordered; their spans must be contiguous on the runtime clock. No gaps, no overlaps.
- Scenes within a piece are ordered; their cut-sets must tile `[0, piece.runtime_frames)` without gaps or overlaps.

### Resolvability

- Every word index used anywhere (cut span, overlay anchor, beat trigger, audio-track span) must exist in `audio/voiceover.words.json`.
- Every frame number must satisfy `0 ≤ f < piece.runtime_frames`.
- Every renderable cut must resolve `composition` to a real HyperFrames composition or approved runtime treatment.
- Every renderable cut must satisfy the selected composition's declared variables.
- Every composition binding must trace back to a board-level primitive, sprite, or composition recipe. Generic component selection is not a valid derivation.
- A cut with only `kind`, `intent`, `content`, or a missing-media placeholder is unbuildable.
- `piece.runtime_frames` must be `≥` the last word's frame in `words.json`. The runtime may exceed the VO envelope (held silence, outro); it cannot be shorter.

### Provenance coupling

- Words.json staleness is detected by `timing.lock.json.words_sha256` via preflight. The render manifest does not re-check this — it stays coupled transitively through the approved lock. One gate, one place.
- `piece.locale` must match the locale the VO was generated in. A locale change (dub) invalidates approval status and the board plus render manifest are re-derived.
- `piece.schema_version` must match the active contract schema version in this repo. Older versions are read-only archive; the builder refuses to render them without an explicit migration.

### Timing source consistency

- Cuts with `timing_source: tts` must use `span: { words: [i, j] }` and their overlays/beats anchor by word index.
- Cuts with `timing_source: frame` must use `span: { frames: [f1, f2] }` and their overlays/beats anchor by frame.
- Cuts with `timing_source: external_srt` must use `span: { frames: [f1, f2] }`, carry an `external_audio_ref` field pointing at the imported audio artifact, and skip word-index validation entirely. Their overlays/beats may still anchor by frame.

### Referential integrity

- `Cut.reuses` (if set) must resolve to another `Cut.id` in the piece.
- `Cut.callback_to` (if set) must resolve to a `Scene.id` earlier in the piece (callbacks go backward, not forward).
- `Overlay.life.until.end_of` (if set) must resolve to another `Overlay.id` in the same cut.

### Overlay kind allowlist

- `Overlay.kind` must be in the active allowlist declared in `docs/contracts/capability-registry.json`. Adding a new kind is an contract change, not a local authoring decision — the registry PR comes first, the render-manifest use comes after. This enforces the authoring/execution boundary as a machine check, not a prose norm.

### Production render boundary

- Production renders consume `direction/render-manifest.yaml` through the shared runtime.
- Production projects may own HyperFrames source under `projects/<slug>/hyperframes/`.
- Production projects do not own generic app scaffolds such as `projects/<slug>/src/`, project-local frame systems, or project-local renderer config.
- Production runtime must not mask unresolved cuts with `Fallback*` components, cut ids, storyboard intent, placeholder labels, or narration transcript.

### Consequence

A render manifest that passes the shape in §9 but fails these invariants is unbuildable. Reviewer gates on the invariants before build. If any fail, it's a think-tank issue, not a builder issue — the package is not ready.

## 11. Where The Contract Stops

The board is the **creative authoring layer**. `direction/render-manifest.yaml` is the **bound render manifest**. The shared runtime is the **execution layer**. The ontology's job is to kill builder guesses at the editorial layer, not to specify frame-by-frame render behavior.

For every candidate field, ask: *does this kill a real guess the builder would otherwise make?*

| Kills a guess | Drop |
|---|---|
| text content of an overlay | animation style (slide, fade, pop) |
| when an overlay appears | animation duration in ms |
| lifespan (stays / until / pulse) | easing curves, springs |
| cut span on the timeline | z-index, exact pixel position |
| event trigger (word/frame) | layout math |
| event kind (sfx, music hit, camera move) | keyframes |
| composition id/path and variables | project-local generic app framework |

Animation grammar lives in **channel design** (`channels/<name>/design.md`). The builder reads both — editorial intent from the storyboard, motion grammar from the channel — and composes. Core never authors curves; channel files never author content. The storyboard is the interface between them.

If a field in the contract starts specifying *how* something moves rather than *what* should happen, it has crossed into grunt work a render engine already does better. Cut it.

## 12. What Is Deliberately NOT In The Contract

- **No layer above scene.** Script owns chapter/section/act.
- **No layer below beat.** Keyframes belong to the builder.
- **No separate "camera" object.** Camera move is a beat event.
- **No "type" field on cuts** (talking-head / b-roll / graphic). That's tagging — keep tags flat, not in the spine.
- **No "transition" object between cuts.** Entry transition lives on the next cut. Between-cut transitions would invent an extra entity with no unique identity.
- **No provisional manifest state.** Before `words.json`, there is no `direction/render-manifest.yaml`. The board already exists; timing placement does not.
- **No fixed per-channel cpm/bpm constants.** Channel provides a reference band; core sets the per-piece target.

---

## 13. Implementation Status (2026-04-23)

### Live

- Think tank operating model (editor entry/exit only, `core` as supervisor inside): `CLAUDE.md`, `.claude/agents/core.md`, `.claude/skills/varnam/SKILL.md`, `.claude/skills/varnam/orchestration.md`.
- Timeline-first one-clock rule, no scene-first/narration-first split: `orchestration.md`, `craft/storyboarding.md`.
- Single-pass authoring: core writes `story/script.md` and `direction/board/*` before audio, while manifest derivation (`direction/render-manifest.yaml`) is editor/tooling after `audio/voiceover.words.json`: `core.md`, `orchestration.md`, `SKILL.md`.
- VO-clause ↔ image binding: `craft/editing.md`.
- Scene/cut/overlay/beat hierarchy written into `craft/storyboarding.md`.
- `direction/render-manifest.yaml` rename landed across governance files.
- Audio agent emits `audio/voiceover.tagged.txt`; core stays engine-agnostic.
- `direction/voiceover.txt` killed as a pipeline artifact.
- Artifact naming convention extracted to `docs/contracts/artifact-naming.md`.
- Header fields: `schema_version`, `locale`; `timing_source` discriminator; overlay kind allowlist (must register in capability-registry). Words-json provenance stays coupled via `timing.lock.json.words_sha256` — one gate, one place.
- Structured schema validator for `direction/render-manifest.yaml`: `scripts/run.py render:validate-manifest`.

### Pending

- Overlay kind allowlist entry in `docs/contracts/capability-registry.json` (list current kinds, make it the canonical registry).
- Multi-speaker model (`speaker_id` in words.json, `speaker` ref in storyboard) — deferred until first interview / guest-read piece.
- Reviewer tiered protocol for long-form pieces (sampling + anomaly-flagging above ~60 cuts).
- Concurrent-write protection for `render-manifest.yaml` (lockfile) — deferred until we see the failure.
- Capable-harness work: measure reference videos, encode reference bands into `channels/<name>/ledger.md`.
- Language-file carve-out in `artifact-naming.md` + rename `QC_CHECKLIST.md` / `MAP_DATA_SOURCES.md` in `templates/`.

### Open questions

- Where do measured reference bands live? `channels/<name>/ledger.md` is the current convention; replace only if runtime tooling proves it needs a stricter format.
