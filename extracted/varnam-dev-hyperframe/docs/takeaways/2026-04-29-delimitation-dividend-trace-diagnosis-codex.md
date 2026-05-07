# Delimitation Dividend Trace Diagnosis

Date: 2026-04-29
Project: `projects/delimitation-dividend`
Session: `c6e1e040-6fad-48bb-859c-e8d2ca327f64`
Render: `projects/delimitation-dividend/output/preview-v5.mp4`
Main trace: `/Users/dev/.claude/projects/-Users-dev-Downloads-varnam-improviser/c6e1e040-6fad-48bb-859c-e8d2ca327f64.jsonl`
Subagent traces: `/Users/dev/.claude/projects/-Users-dev-Downloads-varnam-improviser/c6e1e040-6fad-48bb-859c-e8d2ca327f64/`

## Pattern

Use this pattern for trace review:

`Breakpoint -> Evidence -> Root cause -> Waste peak -> System fix -> Promotion target`

The trace is not useful as a chat recap. It is useful as a production-system diagnostic: where the operating model made the wrong decision, where the user corrected it, what cost that created, and which system surface should learn from it.

## Verdict

The session shipped a mechanically valid short. It did not prove that the production system can reliably produce an interesting Swarajya short without heavy human steering.

The central failure was not timing, rendering, or tool capability. The central failure was decision ordering. The system moved from source to script to manifest to render before selecting a strong film-specific visual world. It then tried to recover through polish, format swaps, and brand recoloring.

Correct order:

`script interpretation -> film visual world -> channel brand signals -> board -> manifest -> render`

In this session, the user had to force that order into existence.

## Trace Shape

The raw trace surface is itself noisy enough to require tooling.

- Main session JSONL: `726` lines.
- Logical actors: editor/main thread, `intake`, `core`, `researcher`, `reviewer`, `audio`, and render agent.
- Trace shards: `22` JSONLs total, including repeated shards for `core`, `researcher`, and `reviewer`.
- Subagent split: `core` had `8` shards, `researcher` had `5`, `reviewer` had `5`, while `intake`, `audio`, and render had `1` each.
- The old `/private/tmp/claude-501/.../tasks/<task-id>.output` paths were not reliable durable artifacts by the time of analysis.

The harness needs a session manifest. Without it, trace review starts with reconstruction: main JSONL, shard role, parent edge, task id, queue event, hook event, and final artifact all have to be inferred by grep.

## Breakpoints

## B1. Intake Crossed Into Core

Breakpoint: The user asked why intake was offering angles when core exists for the same task.

Evidence: User intervention at main trace line `32`: intake was behaving like an editorial ideation lane.

Root cause: Intake treated a source URL as permission to propose story directions. The system blurred intake's job of collection/scope capture with core's job of editorial interpretation.

Waste peak: Early role confusion made the user correct the team before production had even begun.

System fix: Intake may summarize supplied material and flag missing inputs. It must not propose competing story angles unless explicitly asked.

Promotion target: Already mostly covered in `.claude/agents/intake.md`; confirm and remove any stale `feedback_intake_lane.md` crutch after promotion.

## B2. The System Asked When It Should Act

Breakpoint: The user repeatedly corrected the assistant away from checkbacks and toward execution.

Evidence: User interventions around `L55`, `L266`, and `L385`: "back to me?", "stop nudging me, get it done", and "just get it done".

Root cause: The assistant treated direct proceed signals as decisions needing confirmation. It asked at exactly the moments when production momentum mattered.

Waste peak: The session accumulated friction in the main thread even when the path was obvious: short-form default, Gemini voice, subtitle removal, reviewer spawn, and link request.

System fix: In active production, direct imperatives become execution. Ask only when the next action risks changing project authority or spending on an irreversible external dependency.

Promotion target: Execution-surface guidance in editor/core orchestration, not channel taste or craft.

## B3. Format Ceiling Was Misread As Polish Gap

Breakpoint: The user said the video looked mediocre, then clarified that reels are more interesting to watch and this was not a supplementary fix.

Evidence: User interventions around `L427` and `L455`.

Root cause: The system tried to improve an uninteresting format with local polish: remove captions, add SFX, increase density, add grain, add punch moments. The format itself was the ceiling.

Waste peak: `v2` consumed a full render loop while remaining template-led. It was louder and denser, not more conceptually interesting.

System fix: When output is mechanically valid but boring, the next move is not polish. Re-author the visual surface before another full render.

Promotion target: `.claude/skills/varnam/craft/review-qc.md`, under review principles.

## B4. Missing Assets Were Treated As A Visual Limitation Instead Of A Design Opening

Breakpoint: The user pointed out that even without visuals, the system could have made drawings.

Evidence: User intervention around `L488`.

Root cause: The system treated missing real-world media as a constraint to survive rather than a chance to choose an authored visual world.

Waste peak: The earlier versions stayed near template decks and photo dependency instead of inventing a graphic evidence language.

System fix: When load-bearing media is unavailable, the board must choose one of three explicit paths: source, abstract, or replan. "Draw the evidence" is a valid authored path, not a fallback.

Promotion target: Craft/storyboarding or art-direction, but only as a general rule. Do not promote the specific forensic-notebook look as universal.

## B5. Brand Alignment Was Reduced To Palette And Type

Breakpoint: The user asked how the render was using the Swarajya brand guide, then called out that it was the same v3 with some colors changed.

Evidence: User interventions around `L591` and `L605`.

Root cause: The system confused brand tokens with brand structure. It applied color and typography over a foreign visual world.

Waste peak: `v4` was the clearest bad spend. It produced a `31.2 MB` artifact, added force and fusion, but preserved the same underlying notebook grammar the user was objecting to.

System fix: Channel brand is not a skin. It is a set of signals: editorial posture, typography behavior, palette discipline, evidence treatment, motion restraint, audio posture, and argument-state marks. A per-film visual world must either harmonize with those signals or intentionally contrast with them.

Promotion target: `channels/swarajya/design.md`, new `Brand Signals` section.

## B6. The Real Architecture Emerged Late

Breakpoint: The user reframed the goal as a junior video editor that can work with or without brand guidelines, where guidelines are pluggable.

Evidence: User intervention around `L685`.

Root cause: The production model was channel-first. The user wants craft-first production with optional channel overlays.

Waste peak: The system had to travel through template-led, notebook-led, fusion, and channel-led versions to discover an architecture that should have been available before rendering.

System fix: The system must separate three primitives:

- Creative primitive: the film-specific visual world.
- Brand primitive: channel signals that constrain or steer that world.
- Execution primitive: the manifest and render code that compile it.

Promotion target: Storyboarding/art-direction doctrine plus channel design files. The channel file should not freeze the per-film visual world.

## B7. The Trace Request Was Misread

Breakpoint: The user asked for the agent trace, then rejected the answer because it did not feel like a Claude Code session trace.

Evidence: User interventions around `L690` and `L719`.

Root cause: The assistant converted a harness-artifact request into a curated narrative.

Waste peak: Late-session context cliffs were expensive: the trace-path exchange hit roughly `280k` cache-read/create tokens in a single main-trace turn.

System fix: "Agent trace" means raw paths and a manifest first, interpretation second. The system should expose trace topology without making the user reconstruct it.

Promotion target: Harness/tooling. Add a trace manifest generator before adding more prose conventions.

## Waste Peaks

## W1. Render Lane Churn

Evidence: The render lane was rebriefed five times after initial spawn: caption removal, polish, notebook rebuild, v4 fusion, and v5 brand reset.

Cost: The render shard alone used about `22.1M` cache-read tokens and `63.5k` output tokens across `164` assistant messages.

Root cause: Full render loops began before the visual world had been approved.

System fix: Before full render, require a visual-world decision and a small proof segment for the riskiest section.

## W2. Repeated Same-Lane Shards

Evidence: `core`, `researcher`, and `reviewer` appeared across repeated shards with task-assignment echoes.

Cost: Duplicated orchestration and stale task state made completed work look newly active.

Root cause: Team continuity existed, but task continuity was noisy. `TeamCreate` and `SendMessage` were not enough to make the trace legible.

System fix: Add stable task/thread ids and distinguish a new assignment from an echo.

## W3. Stop-Hook Audit Churn

Evidence: `session_learning.md` was written once and edited repeatedly. Stop hooks blocked closure for missing or stale learning four times.

Cost: Low token cost, high friction. The hook forced artifact presence/freshness, not semantic correctness.

Root cause: The stop hook checks whether learning exists and is fresh. It does not know whether the learning is true.

System fix: Either make session learning append-only with structured fields, or add semantic checks for known contradictions before closure.

## W4. Dead Render Surfaces

Evidence: `Page.tsx`, `ink.tsx`, `illustrations.tsx`, and `punch.tsx` remain in the render project but are no longer imported by the v5 path. `timing.ts` still carries old `CUTS` and `swarajya-kit/*` ids while live render only consumes `TOTAL_FRAMES`.

Cost: The repo retains abandoned worldviews as if they might still be live.

Root cause: Visual-system pivots were not followed by import-graph cleanup.

System fix: After final render selection, run a consumer audit and remove or archive dead visual-world files.

## Render Evolution

The timing spine stayed stable: approximately `70.848s`, `2124` frames, `30fps`. What changed was the evidence grammar.

- `v1`: template-led vertical deck.
- `v1b`: captions removed; same deck.
- `v2`: louder deck with music, SFX, grain, and punch polish.
- `v3`: forensic notebook; first real visual-world jump.
- `v4`: fusion attempt; expensive and mostly cosmetic.
- `v5`: Swarajya-native surface; brand safer, but still only good enough.

The useful primitive is not "paper" or "notebook." The reusable primitive is:

`poster-scale evidence lands -> it settles -> the frame hands off into a docked reading state`

That can travel across channels. The notebook look should not.

## Promotion Targets

## P1. Taste: Swarajya Brand Signals

Target: `channels/swarajya/design.md`

Add a `Brand Signals` section after `Components`.

Content to capture:

- Channel signals are fixed; film worlds are invented per project.
- Swarajya signal is editorial authority, not ornamental nationalism.
- Palette/type/audio/motion should behave like an argument surface.
- Brand alignment means the viewer can recognize the editorial posture even when the visual world changes.

Delete after promotion: `feedback_brand_signals_visual_world.md`, if present.

Do not promote: forensic notebook, Rough.js, cream paper, Vishwendra-specific treatment.

## P2. Craft: Stop Polishing A Bad Surface

Target: `.claude/skills/varnam/craft/review-qc.md`

Add a review principle:

When the output is mechanically valid but the format is the ceiling, stop polishing and re-author the surface before the next full render.

Delete after promotion: `feedback_original_ideation_beats_adaptation.md`, if present.

Do not promote: the exact v1-v5 sequence.

## P3. Harness: Trace Manifest

Target: new or existing tracework tooling.

Required manifest fields:

- main JSONL path
- subagent shard paths
- shard role
- parent/child edge
- task id
- timestamps
- tool counts
- token totals
- queue events
- hook events
- durable artifacts
- temporary envelope paths

The trace analyzer should separate "logical actor" from "JSONL shard." This session had seven logical actors but twenty-two shard files.

## P4. Harness: Render Guard Slug Detection

Target: `scripts/hooks/render_guard.py`

Fix `_guess_project_slug` / project resolution so the hook only resolves from explicit `projects/<slug>` references or vetted project-directory tokens. If no project is unambiguous, stay inert.

Do not promote: this run's exact false positive. Promote the resolution rule.

## P5. Project Local Cleanup

Target: `projects/delimitation-dividend/session_learning.md`

Fix stale contradictions:

- `outcome: abandoned` conflicts with shipped `preview-v5.mp4`.
- `duration_wall_minutes: 12` does not match the real session arc.
- Render guard issue was a false positive, not a false negative.
- Vishwendra photo-rights note is stale if v5 restored the sourced photo path.

Target: `projects/delimitation-dividend/task-config.md`

Fix stale source phrasing around the 2013 claim so it matches the verified 17 Apr 2026 parliamentary vote canon.

Target: `projects/delimitation-dividend/`

Remove or archive abandoned notebook files if v5 is the accepted render:

- `Page.tsx`
- `ink.tsx`
- `illustrations.tsx`
- `punch.tsx`

Also clean `timing.ts` so live timing data is not mixed with dead `swarajya-kit/*` registry ids.

## What Not To Learn

Do not learn that Swarajya requires real photos. `v3` proved authored drawings can unlock a stronger surface when media is weak.

Do not learn that notebook/forensic paper is the channel identity. It was a film-world experiment.

Do not learn that cut rate alone solves boredom. `v2` got denser without becoming meaningfully more interesting.

Do not learn that every session needs more agents. The issue here was not agent count; it was role boundary, task echo, and late visual-world selection.

Do not learn that hook freshness equals learning quality. Fresh wrong learning is still wrong.

## Next Gate

No short-form political render should enter full build until these are true:

1. The board names the film-specific visual world.
2. The board names the channel brand signals it will obey.
3. The risky middle section has a proof segment or frame packet.
4. Reviewer can say whether the format itself is the ceiling.
5. Render path has no abandoned visual-world files after final selection.
6. Session trace has a manifest before postmortem analysis begins.

## Rule

Brand is not a skin. Craft is not a channel. A good Varnam editor first invents the film's visual world, then plugs in the channel's signals, then renders.
