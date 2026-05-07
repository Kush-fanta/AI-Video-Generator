# Handoff Quality Knobs

Status: active, Pass 1 contract hardening surface.

Purpose: make handoff quality measurable at lane boundaries so "done" means "quality improved and survived handoff."

This contract is narrow on purpose. It does not replace creative docs. It defines the small set of knobs required to move work between lanes without quality loss.

## Required knobs (lean set)

### 1) `board_decision_coverage`

- Boundary: `core` -> `reviewer`
- Required evidence:
  - `direction/board/index.md` states the film-level bet, arc, visual spine, sound spine, and anti-goals
  - `direction/board/index.md` includes script interpretation and a project-specific channel variation
  - `direction/board/index.md` includes a per-story design pack: visual modes, primitive set, sprite pack, image language, text grammar, edit grammar, sound grammar, and composition recipes
  - every scene has a `direction/board/<scene-id>.md`
  - scene files read as viewer-experience walkthroughs, not manifest rows
  - no placeholder payloads (`TODO`, `TBD`, `PENDING`, `<combined`-style unresolved values)
- Fail examples:
  - a scene canvas only lists cut ids or span ranges
  - "builder can decide" wording in visual payload
  - board index only picks generic components without naming primitive/sprite story jobs
  - film-level direction scattered across scene files with no root canvas

### 2) `manifest_decision_coverage`

- Boundary: `editor` -> `reviewer` and `editor` -> specialists
- Required evidence:
  - `direction/render-manifest.yaml` has explicit timing anchors (`words` or `frames`) for every cut
  - no placeholder payloads (`TODO`, `TBD`, `PENDING`, `<combined`-style unresolved values)
  - each dispatched beat range states exact owned beats/files
- Fail examples:
  - "builder can decide" wording in beat payload
  - storyboard asks for composition without declaring on-screen payload

### 3) `board_manifest_consistency`

- Boundary: `editor` -> `reviewer` and `reviewer` -> `editor`
- Required evidence:
  - every manifest cut resolves to a board moment
  - every board cut moment lands in the manifest
  - the manifest contains no creative decision that is absent from the board
- Fail examples:
  - yaml adds a new cut, overlay payload, or visual read not present in the board
  - a board visual turn is missing from the yaml
  - reviewer has to infer a creative choice from manifest fields

### 4) `audio_pair_etag_freshness`

- Boundary: `audio` -> `core`/`reviewer`
- Required evidence:
  - `voiceover_etag` = hash of `audio/voiceover.mp3`
  - `words_etag` = hash of `audio/voiceover.words.json`
  - `audio/timing.lock.json.words_sha256 == words_etag`
  - lock generated after the current words file write (no stale lock)
- Notes:
  - "etag" here means stable content fingerprint, not HTTP cache headers.
  - Persisting `voiceover_etag` in lock is recommended when the lock schema is next revised.

### 5) `render_survival`

- Boundary: `reviewer` -> `editor` (and release gate)
- Required evidence:
  - `python3 scripts/run.py render:postflight` ran on the scoped render
  - required checks are not skipped (`partial` is not pass)
  - hard findings resolved or explicitly waived by editor

## Minimum handoff record shape

Every lane-to-lane handoff should include this compact block:

```yaml
handoff_quality:
  board_decision_coverage: pass|fail|n/a
  manifest_decision_coverage: pass|fail|n/a
  board_manifest_consistency: pass|fail|n/a
  audio_pair_etag_freshness: pass|fail|n/a
  render_survival: pass|fail|n/a
  evidence:
    - <path or check>
  blockers:
    - <optional unresolved blocker>
```

`n/a` is valid only when the knob does not belong to that lane boundary.

## Access and pickup rule

All lanes may read the full project context. They should only pick the minimum inputs required for the active ask.

- full access is allowed
- bulk mandatory loading is discouraged
- only lane-relevant knobs are enforced at each handoff
