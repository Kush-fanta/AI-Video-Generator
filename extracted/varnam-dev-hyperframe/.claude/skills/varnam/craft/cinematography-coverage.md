# Cinematography And Coverage

Craft for shot meaning, coverage planning, camera logic, and sequence continuity. This is how the editor decides what the film looks like before handing specs to the builder.

## How to See

**The bible is the film.** The director saw the fire reflected in windows, the woman turning to look outside, debris falling like asteroids. Build what the director saw — not an interpretation, not an aesthetic version. When the director says "asteroids," build asteroids. When the director says "hold it, let it breathe," hold it. When the director says "overexposure is power," blow the highlights.

**The film, not the frame.** Never think in isolated images. Every frame exists because of the frame before it and creates the conditions for the frame after it. Light progresses. Color temperature shifts with the emotional arc. If you were tight on a face and then go wide, that distance IS the story. A dissolve says "these are connected." A hard cut says "this changed." A static hold says "stay here." Could the frames be shuffled without the audience noticing? Then it's a slideshow, not a film.

**Every beat gets coverage, not a single image.** A beat is a narrative moment. Plan how to photograph it — not with one held image, but with shots.

### Coverage Vocabulary

- **Wide/establishing** — sets the space, the scale, the geography
- **Close** — a face, a hand, an expression. Intimacy or confrontation.
- **Detail/insert** — the stamp, the document, the number on the screen. Concretizes an abstraction.
- **Cutaway** — something adjacent to the action. The empty chair, the ticking clock, the crowd's reaction.
- **Reaction** — a face responding to what just happened. Often without narration.

A narrative beat ("the border closed") might need 4 shots: wide of the checkpoint, close on the officer's face, insert of the stamp, cutaway to the empty road. A transitional beat may need 1. The density scales with the beat's weight and the film's pace. A 7-minute film should have 100-150 entries, not 30-40.

**Shot scale variety is mandatory.** Plan coverage across all four scales — wide, medium, close, extreme close — within every chapter. If a chapter sits at medium-wide for every shot, it's a slideshow. Cycle through scales the way you cycle through modes. Every beat's coverage should include at least one human element (face, hands, body, crowd) unless the beat is purely diagrammatic or data-driven.

**Shots without narration are valid.** A cutaway or reaction shot can have `"narration": null` — it exists for visual rhythm. The voiceover continues from the previous entry's audio. Multiple entries share the same `beat` field — this is how the renderer knows they belong to the same narrative moment.

If the moment is literal — "the plane crashed" — show it in 2-3 shots. If the moment is abstract — "nobody flinched" — find the concrete image sequence that produces the feeling. Every shot has one visual job.

## Editorial Vocabulary

**Static hold** — no motion. The audience sits with the image. Use when the frame needs to breathe.

**Slow push** — gradual zoom in. Draws the eye in. Intimacy or tension.

**Pull-back** — zoom out. Reveals context. Distance, scale, isolation.

**Hard cut** — no transition. Rupture, change, tonal shift. The strongest punctuation.

**Dissolve** — connection between frames. Time passing. Memory. Never between two zoom levels of the same image.

**Fade through black** — separation. Chapter break. Gravity.

**Wipe** — directional transition. Geographic movement. Before/after.

These are the words you use in specs. The builder translates them into runtime components.

For abstract metaphor, explainer-graphic logic, visual anchors, and mode cycling, use:
- `craft/art-direction.md`
- `craft/motion-design.md`
- `craft/editorial-typography.md`
- `craft/data-visualization.md`
