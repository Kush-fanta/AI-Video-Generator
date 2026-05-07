# Editing

Editing is the translation of an approved board into a bound render manifest and rendered experience.

For the Varnam harness, this doc exists to keep execution from rewriting authorship under deadline pressure.

## Purpose

The edit must:
- preserve the board/storyboard argument
- preserve hierarchy and first read
- keep rhythm alive across the whole piece
- verify decisions against actual render output

The edit is not where a weak board gets rescued.

## Core Invariants

1. **Storyboard leads.** The board decides what the viewer sees.
2. **Visual leads, audio anchors.** Narration and score support the screen; they do not replace it.
3. **One beat, one payload.** If two ideas compete, split the beat.
4. **On-screen text is editorial text.** It is not subtitle transcription.
5. **Builders do not invent direction.** Missing composition or payload is an upstream failure.
6. **Render truth wins.** Review closes on actual output, not on intention.

## Gates

### Package Gate

Do not build until:
- script, board canvas, and bound render manifest are approved together
- the board clearly decides what the viewer experiences
- the manifest clearly places those decisions on the runtime timeline
- reviewer findings on authored work are resolved

### Spec Gate

Do not dispatch specialists without:
- relevant storyboard section
- timing
- composition
- visual backing
- on-screen text when needed
- asset requirements
- render checks

For `visual` specifically, also require:
- `research/media-index.md` path on first dispatch for the project/workstream
- or explicit ownership to create `research/media-index.md` before generation or wiring begins
- `research/media-manifest.md` only when there is already a current beat-to-asset assignment surface

If a spec lacks those, it is thin.

### Render Gate

Do not accept a chapter until the preview render has been checked for:
- timing
- readability
- hierarchy
- asset coverage
- pacing
- audio clarity

Missing visual coverage is a rejection, not a note. If a cut is still `awaiting_render`, the editor has only three valid choices: source the intended referent, redesign the beat as a specific data/map/document frame, or return to the board for a replan. A generic navy card with the cut intent on it is a debug surface, not an editorial frame.

## Beat Tests

Every built beat should pass:

### Mute Test

Without narration, does the frame still teach or argue something?

### First-Read Test

Is it obvious what the viewer reads first?

### Hierarchy Test

Is the payload dominant, with supporting elements subordinate?

### Rhythm Test

Does the beat arrive, hold, and hand off with the right amount of pressure?

### Transition Test

Does the cut or transition carry a reason, not just sequence adjacency?

## Default Editing Pass

1. Translate approved beats into `direction/render-manifest.yaml` HyperFrames composition bindings.
2. Preserve the intended beat order and payload.
3. Build the simplest version that can prove the beat.
4. Render preview.
5. Review against the storyboard and actual output.
6. Fix from the beat definition, not from superficial symptoms.

## VO-Clause↔Image Binding

Each beat's image answers the VO clause at that beat — not the narrative section the beat lives in.

The test: read the image while hearing the matching words. Do they agree on the same referent, not a near neighbour?

- VO says "the port is the busiest" → show the port, not a bridge in the same city.
- VO says "the 1951 mill collapsed" → show the specific mill or a placard of the fact, not a 2023 image standing in for the period.
- VO names a person, date, or place → the image surfaces that specific referent.

"Near neighbour" failures — same region, same era, same theme but different referent — are the most common visual drift. They pass an inattentive eye and fail the mute test: without narration, the image does not argue the clause.

This binding lives in the board and derived render manifest, is verified by the editor when wiring VO to beats, and is checked by the reviewer on render (image-under-phrase pairing, beat by beat). Generic region imagery under a specific-clause line is a `visual_replan`.

## Mode And Text Discipline

- do not sit in one visual mode too long
- do not use images as wallpaper
- do not use text where image, map, or diagram argues better
- do not force image generation when typography or data is the stronger beat
- do not let main text read like spoken narration
- do not let storyboard prose, cut ids, placeholder labels, or scene intent reach the screen
- do not build project-local renderer frame systems for production; bind cuts to existing compositions and primitive/sprite recipes or send the gap to mograph

If the frame reads like a transcript of the VO, the board or spec is wrong.

## Source-To-Video Exception

When the task is faithful document narration:
- the source governs the wording
- visuals still need to carry each claim
- duration follows approved VO, not arbitrary target length

This is the narrow exception, not the default mode.

## Common Failure Modes

Reject or rebuild when the edit becomes:
- **radio over wallpaper**
- **composition fill** instead of authored beats; composition binding is required, but the primitive/sprite recipe still has to answer the beat
- **flat mode run** with no energy change
- **text overload** with no first read
- **timing smear** where entries and exits blur the payload
- **asset drift** where the render no longer matches planned evidence
- **patch pile** where repeated fixes are hiding an upstream board/spec problem

## Harness Rule

This doc should stay short enough to operate as a live execution contract.

If a rule belongs only to one channel, one composition, or one project, it does not belong here.
