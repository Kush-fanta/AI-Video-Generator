# Storyboarding

The storyboard is the executable visual plan, authored on two surfaces.

For Varnam, the storyboard lives on two artifacts that do different jobs:

- **`direction/board/index.md`** — the root canvas and per-story design pack. The film-level bet, arc, story-specific primitive set, sprite pack, visual/audio/text/motion system, evidence modes, and anti-goals. This replaces a separate creative-direction file and prevents generic component picking.
- **`direction/board/<scene-id>.md`** — the canvas. One markdown file per scene. Continuous prose that walks the scene as a viewer experiences it, with concrete visual references embedded at real visual turns. This is where creative authoring happens.
- **`direction/render-manifest.yaml`** — the bound render manifest. Mechanical timeline placements plus HyperFrames `composition:` / `variables:` bindings derived from the canvas after it locks and after `words.json` exists. This is editor/tool output and what the runtime reads.

**Canvas first. Always.** A storyboard authored straight into YAML is a manifest pretending to be creative thinking. The canvas exists because film authoring needs a surface where the visual exists before the timing math — panel first, prose second, mechanics third. YAML enforces enumeration, and enumeration kills the read across cuts. The canvas is where the film gets *seen*; the YAML is where it gets *placed*.

## Purpose

The storyboard exists to:
- make the narration visible before production starts
- expose weak beats and weak transitions early
- force exact decisions about what the viewer sees
- give downstream builders a plan they can execute without discovering the argument themselves

If a beat could be filled by generic stock, generic typography, or subtitle wallpaper, the storyboard has not done its job.

## Canvas vs manifest — what goes where

| Surface | Form | Carries | Reads as |
|---|---|---|---|
| `direction/board/index.md` | tight markdown synthesis | script interpretation, channel variation, per-story design pack, film bet, arc, visual spine, sound spine, anti-goals | the film's umbrella |
| `direction/board/<scene>.md` | continuous prose + concrete visual references | scene bet, viewer experience scene-by-scene, cut moments inline, the read at each shift | a film walkthrough |
| `direction/render-manifest.yaml` | structured YAML | scene/cut/overlay/beat hierarchy, spans, anchors, triggers, asset refs, HyperFrames composition bindings | a bound render manifest |

What the canvas owns and the YAML never sees:
- the film-level spine in `direction/board/index.md`
- the bet for each scene
- the viewer's read across the scene
- the visual reference per real visual turn
- prose flow between cuts (the *between* is where film actually happens)

What the YAML owns and the canvas never enumerates:
- cut ids, span ranges, frame_type names
- overlay `appears_at` anchors and `life` triggers
- beat `trigger` words/frames and `event` declarations
- audio_track spans
- referential machinery (`reuses`, `callback_to`)

**Canvas authoring test:** read one scene file out loud. If it sounds like you're walking someone through a film, the canvas is right. If it sounds like you're reading a database, you've slipped back into manifest mode — break the structure further until it flows.

**YAML derivation test:** every cut in the YAML resolves to a canvas moment; every canvas cut moment lands in the YAML. Drift in either direction means the board was too weak or the YAML got authored creatively. Both are bugs.

## Timing Authority

**There is no manifest before `audio/voiceover.words.json` exists.**

Core produces `story/script.md`, `direction/board/index.md`, scene boards, and the minimum VO source needed for audio generation. The board is creative canvas and does not need timestamps. It should never contain cut spans, beat triggers, approximate durations, or placeholder timing.

Manifest derivation begins only after `audio/voiceover.words.json` is on disk and the board is approved. There is no provisional manifest to reconcile — there is nothing to reconcile from.

Timeline-first means the whole piece lives on one runtime clock. Spoken cuts anchor to `words.json` by word indices. Silent bridges, visual-only aftermath, and outro holds anchor to explicit global frames on that same clock. Do not split the mental model into "scene first" versus "narration first" branches. The runtime may exceed raw VO duration; that is normal.

## Governing Principles

The storyboard spends three upstream rule sets:
- `craft/storytelling.md` for pressure, turns, and causal movement
- `craft/cinematography-coverage.md` for shot meaning, coverage, continuity, and sequence logic
- `craft/motion-design.md` for reveals, transitions, and animated screen behavior
- `craft/art-direction.md` for the visual world and medium choice
- `craft/editorial-typography.md` for text hierarchy and screen reading behavior
- `craft/data-visualization.md` when a chart, diagram, or quantified comparison carries the proof

If the board violates those principles, builders inherit confusion rather than decisions.

## Unit Of Planning

The storyboard has a nested shape. Each layer answers a distinct question.

```
scene       — editorial grouping of cuts (always present; a short piece is one scene)
 └ cut      — a time slice on the timeline: video clip, image, held frame, typography
    ├ overlays — persistent elements with a lifespan (text, labels, highlights)
    └ beats    — discrete events (SFX, music hits, camera moves)
```

| Layer | Question |
|---|---|
| scene | What's the editorial section? |
| cut | What's on screen right now? |
| overlay | What's present and for how long? |
| beat | What just moved or sounded? |

See `docs/contracts/board-render-contract.md` for the full model, invariants, and contract sketch.

### Scene

- Always present. A 30s piece is a one-scene piece. Scenes carry editorial intent, motif tags, and group cuts — they do not carry mechanical timing.

### Cut

- The time slice. This is the visible foreground on the timeline.
- Anchored via **one** of two modes: `words: [i..j]` (indices into `audio/voiceover.words.json`) for VO-tied content, or `frames: [f1..f2]` on the runtime clock for silent / visual-only content.
- In the manifest, owns its render binding (`kind` advisory, `composition` required for renderable cuts, `variables` required by that composition), and carries two peer collections: `overlays` and `beats`.
- Mid-word cuts are not allowed.

### Overlays

- Persistent elements that occupy screen space with a lifespan: text, labels, graphic overlays, highlights, callout boxes.
- Each overlay carries `content`, an `appears_at` trigger, and a `life` (stays until cut ends / until a named trigger / pulse).
- Stacking reveals — text1, text2, text3 arriving in sequence and all staying through the cut — are three overlays with staggered `appears_at` and `life: stays`. Not three beats.
- Overlays do not specify animation style, curve, or duration. That's channel motion design.

### Beats

- Discrete events on the timeline: SFX stings, music hits, camera pushes, short non-persistent animations.
- Each beat is atomic (one event) and fires at a single trigger (word index or global frame). No `relative_ms`.
- Beats can layer by sharing a trigger. A visual push synchronized to an audio sting is two beats at the same trigger, one `channel: visual` and one `channel: audio`. There is no `channel: both`.
- A cut with no beats is a held state. A cut with many beats is choreographed.

### The list failure

An overlay carries one content payload; a beat fires one event. "Text: A, then B, then C" is three overlays, not one. "Show A, then B, then C" as one beat is a list-beat — reject and split. But a pullback that reveals or a push-in that lands is still *one* coherent event, not several.

If timing remains hard to judge after boarding, move to animatic quickly.

## What every cut moment must answer

A cut in the canvas is a moment in the prose flow, not a database row. But the prose must still answer specific questions for each cut moment, or builders will improvise. Walk the scene; for each cut where the viewer's read shifts, the prose must make these answers visible — explicitly stated or unambiguously implied:

- the cut's audio payload (what the VO is saying when this cut lands, if VO-tied)
- the cut's editorial job (what it argues, reveals, or turns — why it earns its time slice)
- the base visual (what fills the frame — image, footage, typography card, designed composition)
- the first read (where the viewer's eye lands first)
- the evidence type (what kind of proof or asset carries the claim)
- the framing or scale (wide vs tight, full-bleed vs panel)
- the persistence (is this a held still, a moving shot, a typography card with revealing text)
- the locked notes (anything that cannot drift in execution)

The visual reference embedded inline at the cut moment carries half of these implicitly when one exists — base visual, framing, first read, and often the editorial job all read off the panel or source frame. The prose around it carries the rest.

The `direction/render-manifest.yaml` derivation translates these answers into the manifest's structured form (spans, overlays, beats, frame types, composition bindings, variables). The canvas does not enumerate that structure. It states the experience strongly enough that the structure derives without invention.

## Canvas form

A board is markdown. `direction/board/index.md` holds the film-level spine; scene files hold scene-level walkthroughs. The scene shape is suggestion, not contract — the test is whether it reads as film walkthrough, not whether it matches a template. A scene file typically opens with the scene's bet, walks the cuts in order with concrete visual references, and closes on the read the scene leaves the viewer with.

```md
# Film Board

**Bet:** <one sentence — the swing this film takes, what kills it.>
**Script interpretation:** <what the script is doing beneath the literal narration.>
**Channel variation:** <how this film bends the channel identity for this script without breaking it.>
**Per-story design pack:** <the specific visual/audio/text/motion/evidence system this story needs; not a list of generic templates.>
**Arc:** <one paragraph — how pressure moves across the piece.>
**Visual spine:** <recurring modes, motifs, evidence grammar.>
**Sound spine:** <score/silence/impact logic.>
**Anti-goals:** <what this film must not become.>
```

The per-story design pack must answer, at minimum:

- which visual modes this story uses and what each mode proves
- the image language for this story: source media, generated media, grading, focal rules, negative space, and evidence obligations
- the on-screen text grammar: title cards, stat cards, labels, quotes, word lists, or silence
- the edit grammar: recurring beat types, transitions, reveal logic, and mode-switch triggers
- the sound grammar: score bed, silence, SFX role, and moments where audio changes meaning
- what reusable HyperFrames compositions will likely be needed, without reducing the board to component selection
- what primitives and sprites those compositions spend

If the board index says only "use components X/Y/Z" or names visual components without explaining their story job, it has failed. Components are downstream implementation; the board index owns the story-specific primitive set, sprite pack, and composition recipes those components must serve.

```md
# Scene <id> — <name>

**Bet:** <one sentence — the swing this scene takes, what kills it.>

<Opening prose. Establishes where the viewer is, what register the scene opens in.>

[visual reference or source frame for first cut]

*Read:* <one sentence — what the viewer takes from this slice.>

<Prose continues. Cut moments called out inline as they unfold.>

[visual reference or source frame for next cut]

*Read:* <...>

<...>

**Closing read:** <one sentence — what the scene leaves the viewer with before the next scene opens.>
```

The wording stays human. The shape stays loose. What stays explicit: script interpretation, channel variation, film spine, scene bet, visual references, reads, and the cuts named in prose with their evidence and framing visible.

`Span` and every overlay/beat trigger live in the YAML, not the canvas. Word indices from `audio/voiceover.words.json` and explicit global frames resolve there. Do not write timing math into the canvas — the canvas says *the date stamps in*, the YAML says `overlay.appears_at = {word: 1}`.

Animation style, curve, and duration are **not** in the board on either surface. Those live in channel motion design. The canvas says *what* appears and *when in the flow*; the YAML names the trigger; the channel says *how*; the builder composes all three.

## Visual Ground

Before beat entries, the storyboard needs one short visual-ground section for the whole piece:
- dominant modes
- mode rotation logic
- density pattern
- recurring elements
- escalation logic

This keeps the beat list from turning into isolated fragments.

### Density is an obligation, not a preference

Storytelling explainer format carries a density floor. Pure-type stretches erode attention, and mode rotation is mandatory — not a stylistic choice. Every board must rotate across at least three of: type cards, data viz (chart / map / diagram / comparison), media (photograph / archival footage / licensed b-roll), and designed editorial text (pull-quote / label stamp / source block). A chapter that sits in one mode for its whole run is a board failure regardless of channel.

Specific numeric targets (how many media beats, what max pure-type duration, what average frame length) are measured channel performance bands — they live in `channels/<name>/ledger.md`, not the design file. The obligation itself is universal craft. If a channel ledger does not specify a density target, the board author negotiates one with the editor before building — do not default to "as dense as possible" or "as sparse as the script allows."

### Frame-type archetypes

Beyond the channel-specific frame vocabulary in `channels/<name>/design.md`, these universal beat archetypes are available to every board:

- **Archival Footage** — real event on tape (newsreels, government footage, public-record video). Mode: evidence. It says *this happened, we have the tape.*
- **Licensed B-Roll** — licensed or open-source contemporary footage of the referent (machinery, place, process, object). Mode: the thing itself, used when a metaphor needs its referent. Never shot by the channel unless the channel explicitly allows own-camera work.
- **Label Stamp** — single-word or single-clause editorial text held 1.5–3 seconds as a punctuation beat. Not a chapter card, not a verdict — a full stop. Examples: "Dead.", "gherao", "NEVER BUILT."
- **Pull-Quote** — sourced quote typeset as the image, with the source filed right. The quote is the visual — no decoration.

Channel design files specify the treatment (colors, borders, grading, opacity). The archetype specifies the editorial job.

## What The Storyboard Must Decide

The board must decide:
- subject, not just topic
- hierarchy, not just content
- mode, not just medium inventory
- motion, not just static layout
- transition logic, not just sequence order
- evidence type, not just image desire

It must say why this image, this mode, this transition, now.

## Visualizing Abstraction

Every board encounters abstract beats — policy mechanism, strategic doctrine, technical backstory, analogy, causation, absence. These beats fail if they default to a type card while the VO carries the whole argument. The board's job is to find the concrete thing the abstract claim points at, and cut to that.

Pattern library:

| Abstract beat | On-screen answer |
|---|---|
| Geopolitical threat, power, or pressure | Footage of the physical instrument of the threat — the carrier, the army, the sanction document, the border crossing |
| Technical analogy ("like asking X to build Y") | Visualize the **referent**, not the metaphor object. If VO says "scooter mechanic building a Mercedes," board the engineers working on the actual precision machinery — not a car and not a scooter |
| Secrecy, invisibility, absence | Board the place where the secret sat — the dry dock, the sealed facility, the bunker, the empty chair. Absence becomes visible when its container is on screen |
| Strategic doctrine or policy structure | Clean numbered list card: 01 / 02 / 03 — type carries doctrine when and only when it is a list |
| Causation ("because of X, Y happened") | Two beats with a hard cut or animated arrow between — the cause image, then the effect image. Do not narrate the link; show the link |
| Program or institution failure / death | For terse editorial register: single-word label stamp as punctuation ("Dead.", "Cancelled.", "NEVER BUILT."), held 1.5–3s. For lyrical or cinematic register: long hold on a photograph, music sting, silence. Match the channel's voice |
| Scale claim ("the biggest / the fastest / the first") | The referent at scale — the thing photographed wide, with a human or known object in frame for size. Never a stat alone |
| Quote or filed finding | Pull-quote in editorial italic, source stamped right. The quote is the image |

Rule: when the VO turns abstract, the board should get **more** concrete, not less. A stretch of metaphor in the script is the board's cue to find the referent, not the cue to fall back on headline type.

## What The Storyboard Must Not Become

Do not use the storyboard to:
- paraphrase the narration
- write generic placeholders like `show map` or `show factory`
- substitute a shot list for visual thinking
- replace exact beats with prompt piles
- leave timing blank because “edit will sort it out”
- derive a timing-sensitive manifest from guessed durations before real `audio/voiceover.words.json` exists
- let the builder choose the real first read

The board is where those choices get made.

## Acceptance Tests

Every beat must pass:

### Mute Test

If the narration were muted, would a builder still understand what the beat is trying to teach or argue?

### First-Read Test

Is it obvious where the viewer's eye lands first?

### Specificity Test

Does the beat name a real subject and screen event, not just a concept?

### Evidence Test

Does the beat state what kind of proof or asset carries the claim?

### Handoff Test

Could a builder execute the beat without inventing composition, payload, or transition logic?

If any answer is no, the beat is not ready.

## Motion Belongs To Channel Motion Design

Animation style, curve, and duration are **not** in the storyboard. The board names *what* appears, *when* it appears, and *how long it persists*. It does not name fade vs slide vs slam, hold parallax speed, or exit dissolve type.

That layer lives in `channels/<name>/design.md`. The builder reads both — editorial intent from the board, motion grammar from the channel — and composes.

The manifest may name `kind:` as descriptive metadata (`image`, `document`, `data`, `map`, `typography`, `composite`, `held`). `kind` helps humans and agents filter the work, but the render binding is `composition:` plus `variables:`. Do not turn `kind` into a local ontology fight.

Every renderable cut in `direction/render-manifest.yaml` must name the HyperFrames composition or approved asset treatment that renders it. A cut with only `intent`, `content`, `kind`, or a missing-media placeholder is unresolved.

What the board does still say:

- **Overlay lifespan.** `life: stays` / `until word X` / `until end_of overlay_Y` / `pulse`. The board names the persistence, not the curve.
- **Beat event.** `camera_push` / `music_hit` / `sfx: whoosh`. Declarative event kind, no magnitude, no curve.
- **Cut hold character.** If a cut is a *designed still* (a photograph meant to be looked at, a slate), say so in the cut's editorial notes. If it's a typical foreground dwelling under motion, don't over-specify.

**Empty-cut rule.** A cut held longer than ~6 seconds with zero overlays and zero beats must either (a) explicitly declare itself a designed still with a reason or (b) gain overlays/beats. Reviewer flags otherwise.

**Same-content adjacent cuts.** If two consecutive cuts show the same subject or same framing, the board must state the reason they're two cuts and not one. Two identical frames back-to-back is a mistake, not a beat.

## Failure Modes

Reject the storyboard if it:
- repeats the narration instead of translating it
- leaves audio and visuals loosely coupled
- has no timing sense
- hides the main idea inside an overstuffed frame
- stays too vague to guide capture or design
- breaks visual world logic from beat to beat
- becomes radio over wallpaper
- treats the shot list as if it were the board
- never marks what evidence the viewer is actually seeing
- runs 3+ consecutive beats in a single mode (all type cards, all stat frames, all portraits) — mode rotation obligation, applies to storytelling explainer format; lecture, essay, or slow-cinema formats are exempt
- holds any single beat >10s without a visual update (callout animating in, data viz revealing, stat counting up, cut to a sub-beat) — explainer-format rule; meditative or observational formats may hold deliberately
- names a person, place, event, or object in the VO but boards zero imagery of it — universal: if the script names it, the board shows it

## Relationship To Other Documents

- `direction/board/index.md`: defines the film-level system
- `direction/board/<scene-id>.md`: spends the system scene by scene
- `direction/render-manifest.yaml`: derives mechanical timeline placement and render binding from the approved board
- runtime: consumes the bound render manifest
- shot list: production logistics derived later if needed
- animatic: timing proof when still beats are not enough

Do not collapse these into one document.

## Depth Rule

Thin boards produce generic output.

The board does not need ornamental prose, but it does need enough specificity that:
- review can attack weak beats before build
- the editor can translate beats into storyboard composition bindings cleanly
- specialists can execute without inventing the film
