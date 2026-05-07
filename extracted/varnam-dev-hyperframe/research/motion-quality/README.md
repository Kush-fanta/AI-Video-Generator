# Motion-Quality Research

Two competing hypotheses for how Varnam should generate video scenes. Same test scenes, different generation approaches. The feedback tool at `localhost:3001/demo-v2` is the review surface.

## Track A: Template Pool

**Thesis:** A curated library of pre-built components (404 templates) gives consistent output because the LLM selects and composes rather than inventing.

**How it works:** Editor writes a spec → DoP picks templates from registry → passes props → renders.

**Strengths:** Consistent aesthetic fingerprint, fast iteration, QA'd components.
**Weaknesses:** Rigid layouts, can't compose what doesn't exist, creative ceiling.

**Test:** DoP receives template library docs + registry + shared primitives. Generates scenes by importing templates.

## Track B: Fresh Generation

**Thesis:** The LLM generates fresh Remotion code per scene, guided only by design tokens (palette, primitives, fonts) and 2-3 few-shot examples of excellent code. No template imports.

**How it works:** Editor writes a spec with per-scene composition descriptions → DoP generates bespoke `<AbsoluteFill>` components using shared/palette.ts + shared/primitives.ts + example code as style reference.

**Strengths:** Unlimited compositional freedom, every scene is purpose-built, matches Motion's approach.
**Weaknesses:** Quality variance, no QA floor, relies on model taste.

**Test:** DoP receives palette + primitives + 3 template source files as style examples (NOT for import — for pattern reference). Generates scenes from scratch.

## Test Protocol

1. Pick 5 test scenes covering different types:
   - Data hero (big number)
   - Comparison (A vs B)
   - Narrative moment (pivot/reframe)
   - Sequence (step-by-step process)
   - Climax (dark punch / thesis moment)

2. Generate each scene under both tracks (same spec, different DoP instructions)

3. Render both to the preview app — `/research-a` and `/research-b` routes

4. Use the feedback tool to annotate quality issues on each

5. Compare: which track produces fewer feedback items? Which handles edge cases better? Which looks more like Motion's output?

## What we're measuring

- **Visual craft** — does it look designed or generated?
- **Compositional variety** — does each scene feel purpose-built or stamped from a mold?
- **Consistency** — do scenes share a coherent aesthetic despite being different layouts?
- **Animation quality** — spring physics, timing, easing — does it feel physical?
- **Failure modes** — when it's bad, how bad? Can it self-correct?

## Decision

After 5 scenes × 2 tracks = 10 renders reviewed:
- If Track A wins → invest in template coverage (the 100-template sessions make sense)
- If Track B wins → pivot to design-token-guided generation, templates become reference material only
- If mixed → hybrid model (templates for proven patterns, fresh gen for novel compositions)
