# ADR-003: The Editor Gap — Templates as Enforcement Through Structure

## Status: Historical record; conclusions partially superseded by ADR-007 and ADR-008 (2026-04-14)

The production evidence in this ADR still matters. The original conclusion —
expanding the enforcement layer as the main response — is no longer current after
the supervisor-model shift and contract-boundary cleanup.

## The Hypothesis Arc

**ADR-001** built the knowledge layer: channels hold taste, craft holds method, tools hold mechanics. The editor makes every creative decision. Subagents execute specs.

**ADR-002** built the enforcement layer: rules (advisory, path-triggered), scripts (deterministic validation), hooks (automatic blocking). The hypothesis: agents read craft docs and forget them at the moment of action. Enforcement closes that gap.

**ADR-002's Phase 4** said: run a real production. Document what the enforcement caught, what it missed, what it blocked unnecessarily. Write ADR-003.

**Two productions ran:**

1. **Arab India** (2026-04-06 to 2026-04-07): 7-minute historical documentary. 8 iterations, 18 slides, 46 images, 5 VO regenerations, 32 subagent traces, 60+ user corrections. Channel: nightshift. Produced a working 7-minute video through 8 painful iterations of user correction.

2. **GCC** (2026-04-07): Cancelled. The agent couldn't handle the creative work at all. Session pivoted to a different approach: instead of running the production pipeline, dispatched 5 agents to generate 10 composition templates each. 50 proven templates that a DoP can mix, match, and innovate from — but can't fail drastically.

## The Evidence

### What the mechanical layers caught

| Layer | What fired | What it prevented |
|-------|-----------|------------------|
| Hook: preflight_render.py | Blocked render when TOTAL_DURATION ≠ audio length | 2+ wasted 5-10 min render cycles |
| Hook: validate_alignment.py | Auto-ran after every VO gen | Word gaps >3s, phantom timestamps, duration drift |
| Rule: remotion-build.md | Loaded when agents touched remotion/src/ | Agents cited cut density, opacity thresholds |
| Rule: image-gen.md | Loaded during image generation | "No text, no signage" in prompts |
| Self-enforced: TypeScript | ALL builders ran `tsc --noEmit` | Zero type errors in final delivery |

Mechanical enforcement works. Duration checks, alignment validation, type safety — these are objective pass/fail gates. Agents comply because the system blocks them when they don't.

### What the user caught (60+ corrections)

Every single user correction during Arab India was **creative, not mechanical.** The enforcement layer has no surface for taste. Here are the corrections, categorized by what they reveal about the gap:

#### The editor didn't classify beats before assigning visuals

- Opening beat described Islamic expansion across four continents. Editor assigned a static cavalry painting. User: *"That's a sweep — why is there a static image?"* Sweep beats need maps/progressive reveals. `templates/visual-treatments.md` has the classification framework — it wasn't loaded.
- The Segment 2 map sequence (where place names light up one by one) worked perfectly. Same principle, actually applied. Proves the framework exists — it's just not consistently used.

#### The editor didn't check visual variety before dispatch

- Same painting in 3 consecutive cuts. User: *"Slideshow."*
- Power ranking beat (4 kings) had one static background. User: *"Show EACH one."*
- AnimatedSplit used 13 times across 10 slides. User: *"Max 5."*
- Both halves of splits must update when one changes. User flagged static left panels.
- Verdict sequence was all text-on-dark. User: *"Endings need images after 7 minutes of rich visuals."*

#### The editor didn't verify tool constraints before committing

- AI-generated maps placed cities at wrong positions 3 times. User: *"Coordinates need to be strictly accurate."* Wasted 3 iterations before sourcing a real Wikimedia map.
- `[calm, authoritative]` accent tags fought the Swarajya voice clone. User flagged Arabic bleed-through. Tags were removed, clone delivered its natural Indian accent.
- `amix normalize=1` (ffmpeg default) was dividing VO level by number of inputs. Discovered by sound engineer agent, but should have been a known constraint.

#### The editor didn't lock VO before dispatching builders

- VO regenerated 5 times (v1→v5). Duration compressed from 467.66s → 417.5s.
- Each change invalidated ALL 18 slide timings. 3 full rebuild passes consumed by retiming.
- The SKILL.md workflow says VO → DoP. In practice, they ran in parallel. The traces show: *"Agent 3 rebuilt everything from scratch, unaware of agents 1 and 2's completed work."*

#### The editor didn't sequence information reveals

- Dikshit quote visible 4.68s before narrator spoke it. User: *"Show the book before the quote — the object earns the text."*
- Pulakeshiraja name appeared 5.6s after first VO mention. Object priming was backwards — show face first, name second, but name came way too late.

### What the traces prove agents can do without enforcement

Not everything broke. Some things worked because agents were good:

- **Segment ownership held.** 3 owners, zero merge conflicts. "DO NOT modify ArabIndia.tsx" instruction respected. Agents created handoff documents instead of overwriting each other.
- **Self-correction.** 8+ autonomous fixes: unused imports, opacity warnings, frame math, accent tag removal, SFX processing removal. No prompting.
- **Tool failure recovery.** ElevenLabs v3 rejected `previous_text` → split chunks. Disk full → cleanup and retry. Glob EACCES → bash fallback. Zero unrecoverable failures in 32 traces.
- **Reviewer specificity.** v6 code review cited timestamp + file + line for every finding. Timing fixer resolved 6 issues in one pass because the review was precise enough to act on.

## The Finding — Arab India

**ADR-002's hypothesis was half-right.**

Agents DO forget craft docs at the moment of action. Enforcement DOES help — for mechanical checks. Preflight hooks saved render cycles. Alignment validation caught word gaps. TypeScript prevented type errors.

But the 60+ user corrections reveal a gap ADR-002 didn't address: **the editor itself is the weak link.** The enforcement layer wraps around builders and renders. Nothing wraps around the editor's own creative decisions — the visual planning, the beat classification, the variety checks, the tool constraint awareness, the VO lock discipline.

The editor is the taste bottleneck (ADR-001 says so: *"The main agent makes every taste decision"*). When the editor makes bad taste decisions, no downstream enforcement catches it. The reviewer catches sync drift and spec violations, but "wrong visual mode for this beat" isn't a spec violation — the spec itself was wrong.

**The gap is between the editor's intent and the editor's spec.** The user's corrections were all things the editor *knew* (craft docs exist, templates exist) but didn't *apply* at the moment of writing specs.

## The Finding — GCC

GCC proved something Arab India only hinted at: **more rules won't fix this.**

Arab India succeeded through 8 iterations of user correction — the user manually closed the editor gap 60+ times. The system worked, but only because a human with taste was in the loop correcting every creative misstep.

GCC removed that safety net. The agent couldn't handle the creative work. It wasn't a knowledge gap (craft docs were there) or an enforcement gap (hooks were there). It was a **capability gap** — the agent doesn't reliably make good creative decisions under pressure, even with the right docs loaded.

The user's response wasn't to add more rules or more enforcement. It was to **change the architecture:**

> Instead of asking the agent to make 50 creative decisions correctly under context pressure, give it 50 proven templates. The DoP picks, mixes, and innovates from compositions that already work. The floor is high. The worst output is a working template with the right content slotted in.

This is the key insight: **templates are enforcement through structure.** Rules say "don't do X." Templates say "here are 50 ways to do it right — pick one." Rules constrain the failure space. Templates constrain the output space. The second approach is stronger because:

1. **It doesn't require the agent to remember.** The template IS the decision, pre-made.
2. **It doesn't require taste at the moment of action.** Taste was invested when the templates were designed. The DoP applies craft, not taste.
3. **Innovation is still possible** — mix two templates, modify a template, invent a new one. But the default path produces good output.
4. **The failure mode is boring, not broken.** A DoP that picks the wrong template produces a competent but unexciting result. A DoP that invents from scratch produces the slideshow-with-captions that Arab India kept hitting.

This reframes the entire ADR-002 → ADR-003 arc:

| ADR | Hypothesis | Reality |
|-----|-----------|---------|
| 002 | Agents forget rules → add enforcement | Enforcement works for mechanics |
| 003 (initial) | Editor forgets rules → add more rules around editor | More rules = more friction, still doesn't guarantee taste |
| 003 (revised) | **Don't rely on real-time creative judgment → pre-build the creative decisions as templates** | Templates raise the floor without adding friction |

## Decision: Composition Template Library + VO Lock + Craft Codification

Three changes. The template library is the primary decision. VO lock and craft codification are supporting.

### Change 1: Composition template library (the main decision)

**The architecture shift:** Instead of the editor writing specs from scratch and the DoP building compositions from scratch, pre-build a library of 50 proven Remotion composition templates. The DoP picks, mixes, matches, and customizes — but starts from working code, not a blank file.

**Template generation:** 5 agents, 10 templates each. Each template is a working Remotion composition with:
- Defined cut structure (number of cuts, timing pattern, transition types)
- Visual grammar (image placement, text positioning, animation patterns)
- Slot system (content slots the DoP fills with project-specific images, text, timing)
- Proven aesthetics (compositions that have been reviewed and approved)

**How the DoP uses templates:**
1. Editor classifies each beat (sweep, moment, verdict, list, progressive, etc.)
2. Editor picks a template per beat — or says "innovate" for beats that need something new
3. DoP instantiates the template with project content (images, text, word timestamps)
4. DoP can modify, combine two templates, or extend — but the starting point works
5. Reviewer checks the result against specs as before

**What this replaces:** The dispatch-check rule (Change 1 in the initial draft) becomes less critical. Templates encode the visual planning decisions that the editor was forgetting to make — visual mode, component variety, image backing, information sequencing. The checklist is baked into the template, not asked as a question.

**What this doesn't replace:** The editor still decides WHICH template for which beat. Taste at the selection level is still the editor's job. But "pick from 50 good options" is a fundamentally easier task than "invent a good option from scratch."

### Change 2: VO lock mechanism (supporting)

### Change 2: VO lock mechanism

Still needed. Templates don't solve the VO cascade problem — that's a process issue, not a creative one.

```yaml
# In projects/<slug>/config.md after VO approval:
vo_lock:
  file: audio/voiceover.mp3
  words: audio/voiceover.words.json
  checksum: sha256:a3f2...
  locked_at: 2026-04-06T14:30:00Z
```

**Preflight check (extend `preflight_render.py`):** if `vo_lock.checksum` exists, verify it matches current words.json SHA. Mismatch → block render: "VO changed after lock. Re-approve or clear lock."

**Dispatch check:** rule warns if `vo_lock` is absent when dispatching builders: "VO not locked. Builders may work on stale timing."

**VO regeneration is an explicit break:** clearing the lock is a manual action. It forces acknowledgment that all downstream timing is stale.

### Change 3: Codify discovered craft rules

The 60+ user corrections aren't just feedback — they're craft rules discovered through production. They belong in the system permanently, not just in memory files.

| Correction | Destination | Addition |
|-----------|-------------|----------|
| Sweep beats need maps, not static images | `craft/direction.md` | "Classify each beat as sweep or moment before assigning visuals" |
| AI maps can't do geography | `craft/direction.md` | "Geographic claims require real cartographic source" |
| Object priming before text | `craft/editing.md` | "Show the physical artifact before revealing its text content" |
| No component >5 uses | `craft/editing.md` | "No composition component >5 uses across a video" |
| Endings need images | `craft/editing.md` | "Final verdict beats must have image-backed cuts" |
| Both split halves update | `craft/editing.md` | "When text panel updates, image panel must update too" |
| ≥3 distinct images per beat | `craft/editing.md` | "If a 30s beat has <3 distinct images, it's underserved" |
| No accent tags on clones | `tools/voiceover-elevenlabs.md` | "For cloned voices: no accent or delivery tags" |
| v3 no previous_text | `tools/voiceover-elevenlabs.md` | "v3 model rejects previous_text/next_text" |
| amix normalize=0 | `tools/sound-mix.md` | "amix normalize must be 0" |
| Image naming convention | `tools/remotion.md` or `.claude/rules/image-gen.md` | "v[VERSION]-s[SEGMENT]-[BEAT_NAME].png" |

### New validation scripts

| Script | What it checks |
|--------|---------------|
| `validate_mix.py` | VO track has no processing; normalize=0; SFX below -12dB |
| Extend `preflight_render.py` | VO lock checksum; component usage count (warn if >5) |

## What This Does NOT Solve

1. **Template selection is still a taste decision.** The editor picks which template for which beat. A bad pick produces a technically working but narratively wrong result. The floor is higher, but the ceiling still depends on the editor's judgment.

2. **Novel formats need new templates.** 50 templates cover the patterns discovered in Arab India and bodyguard-satellites. A music video, a data explainer, or a comedy format will need new templates. The library grows with each production — it's an investment, not a one-time fix.

3. **Template staleness.** Templates encode the visual language at the time they were built. Channel souls evolve. A template built for "flat airbrush" doesn't work for "Edwin Lord Weeks oil paintings." Templates must be rebuilt or extended when a channel's visual language shifts.

4. **Taste evolution mid-session.** Nightshift went from "flat airbrush" to "Edwin Lord Weeks" during Arab India. Templates can't predict that. Sample frames and user feedback still drive taste discovery. Templates codify taste AFTER it's discovered.

## Risks

**Template overfit.** If templates are too specific to Arab India's visual language, they constrain future channels unnecessarily. Mitigation: templates encode composition patterns (split layout, progressive reveal, pull quote), not channel taste (color, typography, mood). Taste comes from the channel soul; structure comes from templates.

**DoP passivity.** If the DoP always picks from templates and never innovates, output becomes formulaic. Mitigation: the editor can explicitly say "innovate" for beats that need something new. Templates are the default, not a cage. The 50-template library is wide enough that "pick the right one" is itself a creative act.

**VO lock rigidity.** Sometimes VO needs to change after builders start. Mitigation: lock is a warning, not a hard block. Clearing it forces acknowledgment of the cascade.

**Rule rot.** Craft rules from Arab India may not apply to future formats. Mitigation: each rule traces to a specific user correction (Appendix A). If the context no longer applies, the rule can be removed.

## The Hypothesis for the Next Production

| ADR | Hypothesis | What we learned |
|-----|-----------|----------------|
| 001 | Separate taste/craft/tools | Right separation. Works. |
| 002 | Enforce craft via rules/scripts/hooks | Works for mechanics. Doesn't reach taste. |
| 003 | **Don't enforce taste — pre-build it as templates** | Templates raise the floor. DoP picks from proven options instead of inventing from scratch. |

**The hypothesis:** With 50 composition templates, the next production should produce competent output on the FIRST iteration, not the eighth. User corrections should shift from *"this is fundamentally wrong"* (Arab India v1-v4) to *"this is good, now refine it"* (Arab India v5-v8). The template library absorbs the creative risk that the editor currently bears alone.

**The test:** Run a full production with the template library. Count iterations to first usable output. Count user corrections. Compare against Arab India (8 iterations, 60+ corrections). If the template library works, both numbers drop significantly — not because the agent got smarter, but because the architecture made good output the default path.

## Appendix A: User Corrections — Arab India

See `projects/arab-india/trace/USER_CORRECTIONS.md` — 60+ corrections across 4 categories:
- Creative / Taste (15): visual style, image coherence, audio direction, maps, text timing
- Process / Workflow (9): render operations, VO management, validation gates, segment ownership
- Tool / Technical (8): mix architecture, image naming, PNG cutouts, frame calculation
- Craft Rules Discovered (11): audio-first, segment ownership, reviewer specificity, self-correction culture, tool resilience, visual mode matching, VO cascade impact, voice clone fragility

## Appendix B: Trace Analysis

See `projects/arab-india/trace/`:
- `FINDINGS_1.md` through `FINDINGS_5.md` — per-agent findings from 32 traces
- `TRACE_FINDINGS.md` — 1,130-line cross-trace analysis
- `ADR_SUMMARY.md` — 12 architectural findings with evidence

## References

- ADR-001: Channels, Craft, and Tools — the knowledge layer
- ADR-002: Enforcement Layer — the mechanical enforcement layer this ADR evaluates
- Arab India trace files: `projects/arab-india/trace/` (32 files, 7.2MB)
- `templates/visual-treatments.md` — the classification framework that exists but wasn't loaded
- Memory files: `feedback_visual_mode_matching.md`, `feedback_map_accuracy.md`, `feedback_visual_variety_craft.md`, `feedback_elevenlabs_v3_limits.md`, `feedback_always_validate_alignment.md`, `feedback_render_always_background.md`
