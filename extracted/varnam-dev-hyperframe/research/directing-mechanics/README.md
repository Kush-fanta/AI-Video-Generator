# Directing Mechanics Research

How you hand context to the DoP matters as much as what's in the context. This research tests the prompting and context handling — not taste, not aesthetics, but the mechanical delivery of creative intent to a code-generating agent.

## The Question

We proved storyboards work. Now: what's the optimal way to deliver a storyboard + spec + references to a DoP agent? Order, volume, granularity, iteration mode — each is a variable that affects output quality.

---

## Hypothesis 1: Context Ordering

**Claim:** Reading the full storyboard BEFORE the spec produces better output than reading the spec first and the storyboard as supplementary.

**Why it might be true:** The storyboard sets the mental model. The DoP reads "the visual world progresses from restraint to rupture" and then every spec detail slots into that frame. Spec-first means the DoP starts building before understanding why.

**Why it might be false:** The spec is concrete. The storyboard is prose. A code-generating model might anchor better on concrete inputs.

**Test:** Same 5 scenes, two DoP prompts:
- A: Storyboard → spec → references → generate
- B: Spec → storyboard → references → generate

**Measure:** Feedback tool annotations. Does A produce scenes that feel like they belong together (arc coherence)? Does B produce individually correct but arc-incoherent scenes?

---

## Hypothesis 2: Context Compression

**Claim:** There's a sweet spot of storyboard density. Too sparse (segment briefs) fails. Too verbose (the full test-storyboard.md at ~2000 words) might also fail — the model drowns in prose and grabs random details.

**Why it might be true:** LLMs have attention patterns. A 500-word storyboard might land harder than a 2000-word one because every sentence gets more weight.

**Why it might be false:** The full storyboard's "why this layout" sections are load-bearing. Cutting them loses the editorial reasoning the DoP needs for judgment calls.

**Test:** Same 5 scenes, three storyboard densities:
- A: Full storyboard (~2000 words) — Visual Ground + all per-scene sections
- B: Compressed (~800 words) — Visual Ground + one-paragraph per scene (what + why, no progression/animation)
- C: Bullet points (~300 words) — Visual Ground as 3 sentences + per-scene as `layout | animation | key detail`

**Measure:** Quality vs density curve. Where does compression start losing output quality?

---

## Hypothesis 3: Few-Shot Quantity and Selection

**Claim:** The specific reference files matter more than the number of them. One perfectly chosen example beats three mediocre ones.

**Why it might be true:** Each reference file consumes context and creates potential pattern conflicts. If two references use different spring configs, the DoP has to choose.

**Why it might be false:** More examples = more pattern vocabulary. The DoP can pick what fits.

**Test:** Same 5 scenes, four reference configurations:
- A: 0 references (storyboard + primitives only)
- B: 1 reference (dark-punch.tsx — the most complex, covers springs + phases + accent lines)
- C: 3 references (dark-punch + odometer + staccato-list — the current Track B set)
- D: 5 references (add ascending-bars + weight-contrast)

**Measure:** Does 0→1 show a bigger jump than 1→3 or 3→5? Is there a reference that single-handedly improves all scene types?

---

## Hypothesis 4: Spec Granularity

**Claim:** Intent-level specs ("the thesis arrives with physical force") produce better output than frame-level specs ("spring damping 12, stiffness 90, scale 1.14→1.0").

**Why it might be true:** Intent gives the DoP creative room. Frame-level specs turn it into a transcriber — and the transcription might be wrong because the editor guessed the spring config without seeing the result.

**Why it might be false:** Frame-level specs remove ambiguity. "Physical force" is subjective. `damping: 12` is not.

**Test:** Same 5 scenes, two spec styles:
- A: Intent-level — "quiet arrival," "slams into frame," "the gap between reveals IS the argument"
- B: Frame-level — exact spring configs, exact frame numbers for every reveal, exact opacity values

**Measure:** Which produces fewer feedback annotations? Which handles edge cases (unusual content, long text) better?

---

## Hypothesis 5: Scene-by-Scene vs Batch Generation

**Claim:** Generating scenes one at a time — with the previous scene's rendered output or code as context — produces better cross-scene consistency than generating all 5 at once.

**Why it might be true:** Each scene inherits visual decisions from the previous one. Scene 3's typography weight shift only makes sense if the DoP has seen Scene 2's weight.

**Why it might be false:** Batch generation with a good storyboard might already handle consistency. Scene-by-scene is 5x more expensive (5 agent calls vs 1).

**Test:** Same 5 scenes:
- A: Batch — one agent generates all 5 scenes in a single composition
- B: Sequential — 5 agents, each receives the previous scene's source code as additional context

**Measure:** Cross-scene consistency (do accent line widths, typography weights, and spacing stay coherent?). Also measure: cost (tokens) and time.

---

## Hypothesis 6: Negative Examples

**Claim:** Showing the DoP what BAD output looks like (with annotations explaining why it's bad) improves output more than adding another positive example.

**Why it might be true:** The model needs to know the failure modes specific to this domain — centered layouts when asymmetric was intended, spring bounce on text that should be quiet, busy frames when restraint was called for. Positive examples show what to do. Negative examples show what to avoid.

**Why it might be false:** Negative examples might confuse the model — it might grab patterns from the bad example.

**Test:** Same 5 scenes:
- A: 3 positive references (current Track B)
- B: 2 positive references + 1 annotated negative ("here's a scene that fails — here's why")

**Measure:** Does the negative example reduce the specific failure mode it warns about? Does it introduce new failure modes?

---

## Run Order

Priority by expected impact:

1. **H4 (Spec Granularity)** — intent vs frame-level is the biggest open question for daily workflow
2. **H2 (Context Compression)** — directly affects how much work the editor puts into each storyboard
3. **H5 (Scene-by-Scene)** — determines orchestration architecture
4. **H3 (Few-Shot Quantity)** — determines what docs the DoP loads
5. **H1 (Context Ordering)** — quick test, low effort
6. **H6 (Negative Examples)** — speculative, test last

## Protocol

Each test uses the same 5 scenes from `research/motion-quality/test-scenes.md`. Each variant generates a composition wired into the preview app. Feedback tool annotations are the measure. All tests run against the IndiaPill channel aesthetic.

## Output

Each hypothesis gets a `research/directing-mechanics/hN-<name>/` directory with:
- DoP instructions variant
- Generated composition
- Feedback annotations (from feedback.json)
- Result summary: which variant won, by how much, why

## Feature Captures

- `research/directing-mechanics/features/word-timing-global-align/`
  - Global word-timing alignment script snapshot and README
  - Before/after verification MP4 is kept locally (see feature README; gitignored)
