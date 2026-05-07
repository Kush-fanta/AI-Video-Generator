# Orchestration

Production mechanics. This file is about routing and handoff shape, not taste.

**Doctrine:** `docs/doctrine.md` is the cross-cutting SDLC surface. Sections below that also exist as doctrine primitives are tagged `(doctrine §N)`. When in doubt, doctrine wins — this file holds the operating mechanics that apply those primitives to specific think-tank and specialist flows.

## Agent Types

Two kinds:

- **Think tank**: `core`, `researcher`, `reviewer`
- **Specialists**: `maps`, `mograph`, `visual`, `audio`

Think tank authors and pressure-tests the package. Specialists execute approved decisions.

Channel files hold permanent taste. `task-config.md` is the project brief that applies that taste to one film. Bootstrap it through `python3 scripts/run.py project:intake` (backend fallback: `bash scripts/project/scaffold.sh --from templates/project-intake.sh`), not by manual file creation.

## Capability Registry

Use `docs/contracts/capability-registry.json` as the experimental app-level availability index before lane dispatch.
Use `docs/contracts/handoff-quality-knobs.md` as the handoff-quality boundary contract.

## Team Router

Default to single-brain authoring for:
- new videos
- major rewrites
- storyboard creation

Escalate beyond `core` only for:
- substantial research/media work
- package review
- render review
- diagnosis when the failure is unclear

Hard rules:
- `core` leads the think tank
- when think-tank mode is active, `core` is the supervisor inside the team; the editor does not broker internal hops
- `core` owns script, voiceover, and board canvas as one decision across two authoring passes
- `reviewer` is the single review entity; it covers package review, render review, and diagnosis
- `reviewer` does not run from launch; it enters when there is authored work, rendered work, or an unclear failure
- `researcher` handles verification and real-media gaps only when those gaps are real
- if a script exists but no storyboard exists, `core` still owns the storyboard

## Think Tank Operating Model

The think tank is a **team**, not a sequence of solo agent calls. For any full-scope authoring run (new video, major rewrite, storyboard creation) the editor must:

1. `TeamCreate` a `<slug>-thinktank` team for the project.
2. Spawn `core`, `researcher`, and `reviewer` as team members via `Agent` with `team_name` and `name` — so they share the team config and task list and can DM via `SendMessage`.
3. Hand the authoring brief to `core` as team-lead. Once the team is active, `core` supervises authoring inside it and coordinates with `researcher` and `reviewer` directly.
4. Tear the team down with `TeamDelete` once the package is locked and specialist dispatch begins.

Do **not** use solo `Agent(subagent_type=core)` / `Agent(subagent_type=researcher)` / `Agent(subagent_type=reviewer)` calls for full-scope authoring. That paraphrases context across hops and breaks the coordination loop the think tank is supposed to have.

Sample-scope runs (see `feedback_sample_scope`) skip the team entirely — the editor authors and reviews inline.

Operating rules inside the team:
- `core` owns package preparation in two passes and pulls `researcher` directly whenever the package needs verified facts, real-media reality, or source resolution.
- `reviewer` joins when there is authored work or an unclear failure. It may pull `researcher` directly whenever review or diagnosis turns on unresolved truth, provenance, or evidence.
- These loops stay inside the team. The editor does not micromanage each research hop.
- The editor's job is to set the brief, approve or reject the package, and supervise downstream build execution.

### Script And Board First

The creative package is authored before audio timing. The board is script interpretation and channel-variation direction; it does not need `audio/voiceover.words.json`. Word timestamps are for manifest derivation.

Core authoring pass:
- `core` writes `story/script.md`
- `core` writes `direction/board/index.md` and `direction/board/<scene-id>.md`
- `core` may write the minimum narration source needed for audio generation if it differs from the script
- for every named entity in the script, `core` authors `projects/<slug>/direction/refs/refs.md` and the corresponding entity directories during this pass; editor approves before specialist dispatch
- that is all — no manifest, no draft cuts, no approximate timings

Then:
- `audio` generates `audio/voiceover.mp3`
- `audio` generates `audio/voiceover.words.json`
- `audio` emits `audio/voiceover.tagged.txt`
- `audio` refreshes `audio/timing.lock.json`

Manifest derivation:
- begins after reviewer approves the board and audio timing exists
- before derivation, editor runs the timing pre-flight (doctrine §12): `coverage_ratio >= 0.95` on `words.json`, `SourceEtag` matches core's `SourceClosed`
- editor/tooling derives `direction/render-manifest.yaml` as the bound render manifest
- cuts anchor by word indices (`words: [i..j]`) for VO-tied content, or explicit global frames (`frames: [f1..f2]`) for silent / visual-only content, on one runtime timeline
- each renderable cut carries `composition:` plus `variables:`; `kind:` may describe the cut type for humans and filtering, but it is advisory, not the render contract
- the runtime may exceed raw VO duration; held silence and visual-only spans are first-class, not filler
- board review happens before audio; manifest review happens after derivation

See `docs/contracts/board-render-contract.md` for the scene/cut/beat model and addressing contract.

### Large Authority Files

`direction/render-manifest.yaml` and other package artifacts may grow past a single read window. When that happens:

- do not treat a failed full-file read as permission to continue half-blind
- use headings, beat IDs, search, and offset windows to read the package in slices
- when dispatching review or specialist work, cite the exact beat ranges the lane owns
- if a downstream agent needs global shape first, give it the chapter/beat map before the detailed slices

The package must stay navigable enough that another agent can review or execute it without brute-force reading the whole file in one call.

## Craft Context Shape

- `core` loads only the authoring craft needed for the current pass.
- `reviewer` loads only the craft needed to judge the current artifact or symptom.
- Specialists narrow-load only the craft docs required for their lane.
- Missing upstream decisions stay upstream. A specialist does not widen context to repair a weak brief, storyboard, or spec.
- Pass source-of-truth files directly whenever possible: channel files, `task-config.md`, approved package, and concrete specs. Handoff prose should carry only the active ask or delta, not a lossy rewrite of those files.
- Agents have access to the full project context, but should pick only what is needed for the active ask. Avoid checklist-style bulk loading when it does not change the decision.

## Editorial Change Absorption

The editor is not a relay. When the user changes the film, the editor must absorb that change into project authority before the next specialist dispatch.

Classify live corrections as:

- `package_rewrite`
- `frame_system_replan`
- `execution_fix`
- `render_bug`

Routing defaults:

- `package_rewrite` -> back into the think tank, usually `core`
- `frame_system_replan` -> editor decides whether canon is wrong or only the next dispatch is weak; rewrite canon when needed, otherwise expand a stronger downstream brief from existing authority
- `execution_fix` -> editor tightens the relevant spec and re-dispatches the right specialist
- `render_bug` -> `reviewer` or the relevant execution lane, depending on whether the failure is still unclear

`improvise` is out of band here. Use it only for reference study, post-mortem learning, or system updates. Do not route ordinary live project redesign into the improviser.

The key move is internal prompt expansion:

- sparse user note in
- editor resolves what it means against channel files, `task-config.md`, package, render symptoms, and asset reality
- editor emits a bounded downstream brief

Only create or rewrite a durable artifact when the correction changes actual project canon. Do not manufacture a new contract file for every live adjustment.

## What The Editor Gives The Think Tank

- channel name
- project path
- `task-config.md` as the applied brief
- source material
- explicit deliverables:
  - `story/script.md`
  - `direction/board/index.md`
  - `direction/board/<scene-id>.md`

The initial dispatch must say what the video argues, what the emotional arc is, what parts of channel identity are active for this piece, and what pass `core` is being asked to author.

If `task-config.md` declares a non-default format and a matching guide exists under `.claude/skills/varnam/formats/`, the initial think-tank dispatch should name that guide by path. Format guides change how the piece behaves; they do not replace channel taste.

For normal authoring, the editor creates the `<slug>-thinktank` team, spawns `core` / `researcher` / `reviewer` into it, and hands the initial brief to `core`. After that, the team self-routes research and review internally via `SendMessage`.

## Package Lock (doctrine §10)

See `docs/doctrine.md` §10.

- reviewer has read script, `audio/voiceover.tagged.txt`, board canvas, and derived render manifest together
- board clearly decides the viewer experience; manifest clearly places it against realized VO timing
- open findings are resolved or explicitly waived by the editor

If the package only works because `core` inferred film-specific identity from raw channel files, the brief is weak. Tighten `task-config.md` before locking.

`direction/render-manifest.yaml` is a derived, bound render manifest. The editor owns the derivation after board approval; it does not author new creative decisions there. If a cut cannot name a real HyperFrames `composition:` and valid `variables:` without invention, the gap returns to board or mograph before render.

## Reviewer Route Mapping

Route vocabulary lives in `docs/contracts/reviewer-findings.md`.

Local runtime rule:
- think-tank remediation can stay inside the think tank when `core` and `reviewer` can resolve it directly
- execution-lane remediation comes back through the editor with tighter authority files
- `coordination_required` stays editor-supervised

## Why This Default Exists

Single-brain authoring preserves conviction, continuity, and taste application across script, direction, voiceover, and storyboard.

Early multi-agent routing creates lossy context passing:
- the project brief gets paraphrased instead of carried
- identity gets diluted into summaries
- script, direction, and storyboard drift apart

So the harness should add teammates only where the extra capability is worth the handoff cost.

## Outcome Briefs (doctrine §3)

See `docs/doctrine.md` §3.

### Pass 1 Handoff Knobs (doctrine §6)

See `docs/doctrine.md` §6.

- required in the handoff message:
  - `board_decision_coverage` (or `n/a`)
  - `manifest_decision_coverage` (or `n/a`)
  - `board_manifest_consistency` (or `n/a`)
  - `audio_pair_etag_freshness` (or `n/a`)
  - `render_survival` (or `n/a`)
- audio lane exits additionally carry `coverage_ratio` (aligned_words / expected_words) — hard-floor 0.95 enforced by `scripts/audio/voiceover.py --min-render-coverage`
- missing knob status means the handoff is incomplete
- "done" is valid only when the lane's applicable knobs are `pass` or an explicit blocker is declared

Every agent report closes with the Outcome/Evidence two-liner. Lanes that own source-closed state (currently `core` Pass 1 and `audio`) add one further labelled fingerprint line on the relevant exit:

```
Outcome: <post-condition the agent owned, stated as true>
Evidence: <paths, frames, sibling ack, render check — whatever makes it checkable>
SourceClosed: <path> <sha256>        # core Pass 1 exit
SourceEtag:   <path> <sha256>        # audio exit — must match core's SourceClosed sha
```

No free-form structure beyond these named lines. "File written" is not evidence. A SourceEtag that does not match the corresponding SourceClosed means the run was aborted; report the abort, do not fake the exit.

Subagents return findings in their final message. They do not create standalone report files unless the brief explicitly names a durable output path as part of the owned outcome.

## Write Ownership (doctrine §8)

See `docs/doctrine.md` §8.

- assign one live owner per writable file in a given phase
- sibling lanes send findings, diffs, beat notes, or route recommendations back as text
- if a file changed since read, reread it and decide whether ownership changed before writing again
- when a fix spans multiple files, split ownership by file path, not by idea

If two lanes need the same file, one lane owns the write and the other becomes review-only until the handoff is explicit.

## Lane Lifecycle — Idle ≠ Exit (doctrine §7)

See `docs/doctrine.md` §7 for the Spawn/Continue/Retire primitive and violation signals.

- Continue: if a specialist emits an `idle_notification`, use `SendMessage(to=<agent_id>)`. Do NOT call `Agent(subagent_type=<lane>)` — the 2026-04-23 run burned double ElevenLabs quota.
- Spawn: call `Agent()` only after explicit retirement (`TaskStop` or accepted final message).

If you're unsure whether a specialist has exited or is idle, check its trace. Do not guess.

## Specialist Dispatch

When the editor does dispatch a specialist, it happens under the Outcome Briefs shape above. The brief carries the authority files by path (`task-config.md`, approved package, storyboard beat IDs, research findings), the outcome the specialist owns, and any sibling constraints verbatim. Fields like timing, on-screen text, and palette/motion values travel as-is from the authority files — the editor does not rewrite them into a dispatch checklist.

### Harness constraints every specialist brief must surface

Include this block in every specialist brief. Three production runs lost turns to specialists discovering these the hard way.

```
Harness constraints you will hit if you ignore them:
- `scripts/hooks/project_scaffold_guard.py` blocks `mkdir projects/*` and
  direct writes under `projects/*`. Route project state through
  `python3 scripts/run.py project:intake` (or --from-json), never hand-create.
- Subagents return findings as text. Standalone report files (anywhere outside
  an explicitly named durable output path in the brief) are blocked.
- `sleep N && cmd` patterns are blocked by the leading-sleep guard. For
  condition-based waits use `until <cond>; do sleep 2; done` or
  `run_in_background`.
- The `Monitor` tool is not enabled in subagent contexts.
```

If the user asked for a screen-language change and the dispatch does not include an editor-expanded brief that captures it, the dispatch is thin. The specialist should refuse.

Visual-specific dispatch invariant:

- every first visual dispatch for a project or workstream must include the path to `research/media-index.md`
- if the file does not exist yet, the dispatch must say that visual owns creating it before generation or wiring continues
- `research/media-manifest.md` may travel too, but it never substitutes for the index
- a visual dispatch that omits the index path is thin and should be refused

## Dispatch Granularity (doctrine §9)

See `docs/doctrine.md` §9.

Valid specialist asks are granular:

- one beat
- a bounded beat range with the same craft job
- named placeholders or slots
- one component surface
- one audio artifact pass

Invalid specialist asks are unbounded:

- "build chapter 1"
- "handle this whole scene however you think best"
- "make the visuals work for this section"
- any dispatch that mixes composition, timing-thread ownership, and multiple specialist crafts into one blob

If the downstream work is chapter-sized, the editor must decompose it first into owned packets by beat range, slot set, or component family. Specialists may understand chapter context, but they must not be asked to own the chapter.

The test:

- if the brief cannot name the exact beats, slots, files, or artifacts the lane owns, it is not dispatch-ready
- if success depends on inventing cross-beat composition decisions, the work still belongs to the editor
- if multiple craft lanes would need to co-decide the outcome, split the work before dispatch
- if the lane is `visual` and the brief does not carry `research/media-index.md` (or explicit ownership to create it first), it is not dispatch-ready

## Post-Package Phase: Editor Supervises Execution

After package approval, the think tank dissolves. The post-package phase is not a team, but it is still multi-lane execution: the editor holds the thread and dispatches the specialist lanes that own bounded build work.

**Division of labor:**

- **Editor** binds the film: VO-to-beat wiring, timing ownership, render manifest binding, and review synthesis stay here.
- **Runtime** composes the film from `direction/render-manifest.yaml`, channel `design.md`, primitives, sprites, compositions, assets, and audio. Runtime is stable infrastructure, not a per-project writing surface.
- **Specialists** are the normal execution surface for their craft lanes. `maps`, `mograph`, `visual`, and `audio` take bounded work from approved specs and return execution evidence. They do not hold the whole-thread coordination state.

**VO↔beat wiring is editor work.** The timing lock — which VO clause plays over which beat's visual, for how long — is the single thread connecting script, board, render manifest, VO, and render. No specialist sees all five. Do not delegate. Core authors the board before timing; editor/tooling places it after timing.

**Timeline-first means one runtime clock.** Do not fork the film into "scene first" versus "narration first" sub-models. Spoken beats anchor to `words.json`; silent or visual-only beats anchor to explicit global frames on the same runtime timeline. The timeline may run longer than raw VO audio when the piece needs held silence, visual aftermath, or outro space.

**Dispatch reflex rule.** Default is lane ownership, not editor accumulation. If the approved work cleanly belongs to a specialist lane, dispatch it there. The editor keeps timing, storyboard binding, VO↔beat wiring, and review synthesis. Specialists keep their bounded craft execution. When a task mixes both, split it at the file and authority boundary instead of letting the editor absorb the whole thing.

**Why this shape exists.** When specialists were given autonomy to compose chapters, they duplicated content across stitches — same videos and audio fragments repeated — because each specialist reconstructed the thread wrong. The editor holds the thread; specialists pull on one end of it.

Specialists execute. They do not repair missing authorship. They do not compose full films. The runtime composes from the approved manifest. Exact specialist surface and capability status live in `docs/contracts/capability-registry.json` plus the lane docs.

## Project Workspace

Each project uses:

```text
projects/<slug>/
  task-config.md
  tasks.md
  story/script.md
  research/findings.md
  direction/board/index.md
  direction/board/<scene-id>.md
  direction/render-manifest.yaml
  audio/
  images/
  output/
```

Production projects do not own engine-specific runtime source. `projects/<slug>/src/`, project-local composition roots, project-local frame systems, and project-local renderer config are not production surfaces. If the runtime cannot render a storyboard cut through a registered composition, primitive/sprite recipe, or approved asset treatment, the cut is unresolved.

## `tasks.md`

The living build-state index for the project. One line per segment or workstream, with status. The editor reads this before any dispatch so a fresh session (or a restart) has a map of what's built, what's in progress, and what's next — instead of reconstructing state from directory listings.

Two sections:

**Package workstreams** — one line per think-tank deliverable:

- `brief` — `task-config.md` locked
- `research` — `research/facts.md` verified
- `script` — `story/script.md` approved
- `board` — `direction/board/index.md` + scene boards approved
- `voiceover-audio` — `audio/voiceover.mp3` + `audio/voiceover.words.json` + `audio/voiceover.tagged.txt` approved for manifest derivation
- `render-manifest` — `direction/render-manifest.yaml` approved against the board and real VO timing

**Build segments** — one line per rendered segment, with scope and status:

```
seg1-hook          : built        (beats 1–12, Hook)
slice-ch1-curve    : built        (beats 17–22, BengalCurve first draw only)
ch1-full           : NOT built    (beats 13–22, blocked on beats 13–16 extension)
ch2-first-cut      : NOT built    (beats 23–34)
ch3-left-front     : NOT built    (beats 35–48)
```

Status values: `built`, `in progress`, `NOT built`, `blocked: <why>`.

Update the moment a segment lands, finishes, or blocks — same discipline as the TodoWrite tool, but persistent. This file is the answer to "where are we?" after a restart.

## Build Order

1. author script + board canvas
2. approve board package
3. generate VO + words.json
4. derive `direction/render-manifest.yaml` from board + timing
5. approve manifest
6. dispatch mograph/visual/maps/audio for unresolved primitive, sprite, composition, asset, map, or media bindings
7. runtime renders preview from the bound render manifest
8. review against real output
9. fix and targeted re-render
10. finish sound and final render

## Targeted Fix Verification

- frame, layout, text, and asset-placement issues -> render the exact frame or a few surrounding frames first
- motion, transition, and timing issues -> render the smallest segment that shows setup, failure, and recovery
- audio sync or masking issues -> render or analyze the shortest segment where the problem is audible
- full rerenders are for global pacing, final assembly, cumulative mix, or post-fix end-to-end confirmation after targeted proof already passed

## Enforcement

- apply remediation lanes from `docs/contracts/reviewer-findings.md`
- thin specialist spec goes back to `editor`
- execution misses go back to the relevant lane after the brief is tightened
