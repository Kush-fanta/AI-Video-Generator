# Landlord Trap Failure Diagnosis

Date: 2026-04-27
Project: `projects/landlord-trap`
Render: `projects/landlord-trap/output/preview.mp4`

## Pattern

Use the same pattern for every failure:

`Symptom -> Evidence -> Root cause -> System fix -> Next gate`

## Verdict

The run proved the pipeline can produce a mechanically valid render. It did not prove the system can produce a good Swarajya film.

The quality failure was not lack of scene direction. The board had useful direction. The failure was that board direction did not compile into specialist execution: templates were bypassed, mograph was bypassed, missing referents became fallback cards, and review accepted a render that postflight rejected.

## Mechanical Failures

These are pipeline, routing, artifact, and render-contract failures.

## M1. Render Path Drift

Symptom: The render path was not stable.

Evidence: Render needed public asset bridging and failed on missing `staticFile()` paths before completing.

Root cause: Remotion authority was split across project-local `src/`, repo-root `public/`, `public_link.py`, `remotion.config.ts`, and `templates`.

System fix: One render substrate. Either render from `templates` with project data/assets, or import templates as the only allowed visual component layer.

Next gate: A project cannot define generic local visual primitives that replace the template library.

## M2. Template Bypass

Symptom: Existing templates and the `mograph` lane were effectively ignored.

Evidence: Project scaffold built generic local components like `DiagramStack` and fallback typography instead of selecting approved Remotion templates. The run used `visual` for data cards/diagrams that belong to `mograph`.

Root cause: The editor did not compile the board into lane-specific packets. It treated the scaffold as the renderer instead of treating templates as the execution floor.

System fix: Mograph owns data viz, diagrams, counters, chapter cards, verdict cards, split stats, and text reveals.

Next gate: Any beat with `kind: graphic` or data/text proof must name a template or declare `new_template_required` before build.

## M3. Missing Asset Contract

Symptom: Missing image assets became renderable production frames.

Evidence: `20` image cuts stayed `awaiting_render`, covering `144.4s` of runtime.

Root cause: The fallback kept Remotion alive, so the pipeline treated missing visual coverage as non-fatal.

System fix: Separate render fallback from production acceptance. Fallback is crash protection only.

Next gate: No `awaiting_render` image cut may enter production render. Missing referent means `researcher` or `board_replan`, not fallback card.

## M4. Text Leakage

Symptom: On-screen text leaked storyboard/debug language.

Evidence: Render frames showed cut ids, `IMAGE`, scene intent, and narration-like captions, including lines such as `About to lose this company on screen`.

Root cause: Fallback components rendered `cut.intent` and `cut.id`. Captions were globally mounted. Storyboard prose was treated as screen payload.

System fix: Production frames must render only designed editorial text: labels, numbers, source captions, pull quotes, verdict lines.

Next gate: Preflight must fail on visible `cut.id`, fallback labels, storyboard intent, or narration captions unless the format explicitly requires subtitles.

## M5. Timing-Only Audio Validation

Symptom: Timing passed mechanically, but visuals did not feel bound to the narration.

Evidence: `validate_storyboard` and `preflight_render` passed, yet the rendered viewer experience felt off.

Root cause: Word-index sync only proves timing. It does not prove that the image under each clause is the correct referent.

System fix: Add VO-clause-to-visual verification.

Next gate: Reviewer checks sampled clauses: spoken referent, visible referent, screen text, and motion event must agree.

## Quality Failures

These are creative, editorial, visual, and viewer-experience failures.

## Q1. Boring Video

Symptom: The video felt like radio over visual backing.

Evidence: Postflight failed with longest hold `31.267s` and longest low-novelty plateau `27.0s`.

Root cause: The editor/render path allowed long stretches of one-mode execution and missing-asset fallbacks.

System fix: No full render until a beat execution matrix exists.

Next gate: Every beat must declare `lane`, `template/component`, `asset/source`, `on_screen_text`, and `fallback_policy`.

## Q2. Dead Images

Symptom: Images behaved like wallpaper, not evidence.

Evidence: Several generated images were generic editorial city/building shots. Load-bearing referents like Yeo, Chartered, Dholera, and Indian engineers were missing or deferred.

Root cause: Visual lane was asked to fill media broadly. It generated or deferred assets instead of forcing a source-or-replan decision per load-bearing referent.

System fix: Load-bearing people, events, documents, and institutions require researcher-sourced media or explicit board replan.

Next gate: Every real-world visual must be `filed`, `generated-as-abstraction`, or `replanned`; never silently substituted with generic wallpaper.

## Q3. Data Viz Was Underused

Symptom: The film forgot its strongest proof mode.

Evidence: The brief and board asked for Bengal Curve, split-image stat, Dholera data panel, and three-layer stack. Execution reduced several of these to static cards or generic bars.

Root cause: Data-viz was treated as a visual asset, not a motion-graphics argument.

System fix: Data-viz beats must be mograph components with reveal logic, hierarchy, and timed payloads.

Next gate: Data beats require `data_payload`, `visual_form`, `reveal_order`, `source_caption`, and `template/component`.

## Q4. Weak Scene-To-Screen Translation

Symptom: Scene direction did not create a meaningful quality bump.

Evidence: Board files had strong reads and visual references, but the rendered frames were mostly generic cards, static diagrams, captions, and wallpaper images.

Root cause: The board was treated as inspiration, not as a source for executable lane decisions.

System fix: Compile board into an execution matrix before any build.

Next gate: Every board moment must map to a lane, template/component, asset/source, text payload, and motion event.

## Correct Next Pass

1. Reject the current render as quality-failed.
2. Build `direction/execution-matrix.md` from the existing board and storyboard.
3. Assign every beat to `researcher`, `visual`, `mograph`, or `maps`.
4. Select templates for every mograph beat before code work.
5. Source load-bearing real referents before full render.
6. Render a 60-90s proof reel from the worst sections.
7. Run postflight and visual-clause review before full render.

## Rule

Canvas direction is not enough. It must compile into executable lane decisions.

If the next run cannot name the template, source, and lane for a beat, that beat is not ready to build.
