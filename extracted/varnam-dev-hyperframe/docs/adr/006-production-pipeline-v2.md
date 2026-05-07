# ADR-006: Production Engine V2 — Dynamic Engine with Task Config and Mandatory Delegation

## Status: Superseded by ADR-007 (2026-04-14)

This ADR introduced the task-config and several useful production concepts, but the
phase engine itself was replaced by ADR-007's supervisor/team model.

## Context

The production system works but has no canonical Engine. Each session re-derives the sequence: what gets delegated, when review happens, who holds creative control. ADR-004 fixed individual failures (craft gate, script review, channel directory). ADR-005 added the improviser for learning. But the Engine itself — from "user says make a video" to "done" — is implicit, rebuilt from scratch each time.

Three problems from production sessions:

1. **Intent drift.** By the time the DoP is building chapter 7, nobody remembers the original argument. The channel config says who we are, but not what THIS video is trying to say. Agents re-derive intent from conversation context, which compresses and rots.

2. **DoP delegation is all-or-nothing.** Either Main builds everything (context rot by chapter 5) or delegates whole chapters to sub-agents (visual continuity death — the connected canvas problem from the GCC session). Neither works.

3. **The Engine is rigid when it should be dynamic.** Not every video needs research. Not every video needs image generation. Forcing a fixed sequence wastes time or skips steps that were needed.

## Decision

### Two Config Layers

**Channel config** (exists, unchanged) — persistent identity. Who we are, what we value, how we look and sound.

**Task config** (new) — per-video intent, locked at the start of production. Written by Main after reading the user's request and channel identity. Every downstream agent reads this as source of truth.

Task config contains:
- **Core message** — the one argument this video makes, in one sentence
- **Anti-goals** — what this video is NOT (prevents drift toward adjacent topics)
- **Tone / emotional arc** — documentary? essay? narrative? what shifts?
- **Visual approach** — image-heavy? typography-driven? map-based? mixed?
- **Key subjects** — specific people, places, objects that must appear
- **Target length** — rough duration bracket
- **Research requirements** — what needs to be verified, what's assumed

Location: `projects/<slug>/task-config.md`

The task config is written once. If production reveals the angle doesn't work, Main updates the config explicitly and notes why. No silent drift.

### Dynamic Engine

The Engine is demand-driven, not a fixed sequence. Main assesses what's needed and invokes what's necessary. But the phases exist in a defined order — you can skip a phase, you can't reorder them.

#### Phase 1: Assessment + Task Config
Main reads the user's request, channel identity, and any provided references. Decides:
- Does this need research? → spawn research agent
- Does this need original investigation? → different research approach
- Is the topic well-understood? → skip research, go to creative core

Writes the task config. This is the last moment intent can be shaped cheaply.

#### Phase 2: Creative Core (single agent)
One agent produces all three:
- **Script** — from research (if any), channel narrative, task config
- **Audio direction** — VO style, music mood, SFX philosophy for this video
- **Visual direction** — shot philosophy, density, mode balance for this video

Why one agent: distributing taste across agents was tried and failed. The script's rhythm determines the audio's pacing determines the visual's density. These are one decision expressed three ways.

#### Phase 3: Review Gate (before storyboard)
Fresh reviewer agent. Cold read. No conversation context.

Catches:
- AI slop (the kill list from ADR-004)
- Fake claims / unverified assertions
- Value density below threshold
- Drift from task config's core message

This happens BEFORE storyboard, not after. Catching a bad script before 6 hours of visual production is the highest-leverage gate in the Engine.

#### Phase 4: Storyboard + Audio Generation (parallel)

**Storyboard** — Main agent reads the reviewed script, audio direction, visual direction, and task config. Builds the storyboard with filmmaking first principles (see Craft section below). The storyboard includes image/video generation prompts — these are creative decisions, not mechanical ones.

**Audio generation** — Sub-agent generates narration audio simultaneously. This is mechanical: take the reviewed script, apply the audio direction, call the API.

Once both complete: word-level timeline is extracted, frame timing is locked. The storyboard and timeline together are the contract for visual production.

#### Phase 5: Visual Production (Main + mandatory delegation)

This is the longest phase and the highest risk for context rot. Architecture:

**Main DoP works chapter by chapter, sequentially.** For each chapter:

1. Main builds the compositional skeleton — layout, timing, structure, transitions
2. Main decides what to delegate for this chapter (mandatory — Main must delegate)
3. Main spawns sub-agents for the mechanical work:
   - Image generation
   - Cutout/PNG Engine
   - Animation refinement
   - Color grading
   - Any other asset work
4. Sub-agents complete, Main reviews their output
5. Main moves to next chapter

**The mandate: Main must delegate.** Main never builds a complete chapter alone. The split is Main's judgment call per chapter — maybe chapter 1 needs heavy image work and chapter 3 needs animation polish — but delegation is not optional.

**Why this works:**
- Main holds compositional continuity (one agent sees the whole video)
- Main's context stays light (skeletons + task list, not full Remotion code)
- Sub-agents do focused mechanical work (no taste decisions)
- The task list on disk survives context compression

**Task list is the state machine.** Main maintains a task list on disk:
```
Ch 1: skeleton ✓ | images (sub) ✓ | cutouts (sub) in_progress
Ch 2: skeleton ✓ | animations (sub) pending
Ch 3: skeleton pending
...
```

If Main's context compresses, it reads the task list and picks up where it left off.

**Sub-agent constraints:**
- Never more than 2-3 concurrent sub-agents (coordination overhead)
- Parallel where independent (image gen for ch3 while Main skeletons ch4)
- Sequential where dependent (cutouts for ch1 need ch1's skeleton first)
- Sub-agents receive: the chapter's skeleton, task config, specific instructions. They never receive the full storyboard or other chapters.

#### Phase 6: Visual Review
Reviewer agent watches the rendered output. Checks:
- Timeline alignment (visuals match VO timing)
- Visual drift across chapters (continuity)
- Rendering artifacts
- Storyboard compliance

Findings go back to Main, not to sub-agents. Main decides what to fix and how.

#### Phase 7: Sound Design
Two sub-tasks, both informed by the rendered visual:
- **SFX** — designed according to what's on screen (visuals drive SFX, not the script)
- **Music** — designed according to the narration arc (emotional trajectory, not visual events)

#### Phase 8: Sound Engineer Review
Final audio QA. Checks mix levels, SFX timing, music-VO balance. This is the last gate.

#### Phase 9: Final Review (optional)
Combined audio + visual pass. Only needed for complex productions. Watches the full render as a viewer would.

### Storyboard Craft Gap

The current storyboard output is thin — it describes information, not frames. The storyboard agent needs filmmaking first principles:

- **Every frame needs a subject** — a thing, not a concept. A face, hands, an object. "India's GDP growth" is not a frame.
- **Shot variety** — wide/medium/close/extreme close. Most AI storyboards default to medium-wide.
- **People are the anchor** — viewers watch faces, hands, bodies. A frame without a human element earns its place or gets cut.
- **Composition** — rule of thirds, leading lines, negative space. These control where the eye goes.
- **Camera implies emotion** — low angle = power, high = vulnerability, Dutch = tension, tracking = journey, static = dead.
- **Cut motivation** — every cut has a reason: new information, emotional shift, visual contrast. Not "3 seconds passed."

This belongs in a craft doc (`craft/storyboarding.md`), not in channel config. It's universal — works for any channel.

### Image and Video Generation

Generation prompts are creative decisions authored in the storyboard, not derived by the DoP sub-agent. The storyboard frame says what to generate; the sub-agent sends the prompt and places the result. Channel identity already provides strong style direction — the gap was the storyboard being too vague for the generator to work with.

As video generation APIs mature (Veo, etc.), the same pattern applies: prompt authored upstream, execution delegated.

## What Changes

| Area | Before | After |
|---|---|---|
| Intent tracking | Implicit in conversation context | Explicit task config, written once, referenced by all agents |
| Engine shape | Re-derived each session | Defined phases, skip-able but not reorderable |
| Creative work | Split across agents sometimes | Single agent for script + audio direction + visual direction |
| Script review | After production (ADR-004 added pre-VO) | Before storyboard — earliest possible gate |
| DoP delegation | All-or-nothing | Main skeletons every chapter, must delegate mechanical work |
| Visual production state | In context | Task list on disk, survives compression |
| Storyboard quality | Describes information | Filmmaking first principles in craft doc |
| Generation prompts | Sometimes derived by DoP | Always authored in storyboard |

## What This Doesn't Solve

- **Task config staleness.** If the angle stops working mid-production, Main must update the config explicitly. No mechanism forces this — it relies on Main's judgment.
- **Reviewer teeth.** Reviewers need concrete criteria, not "check for slop." The kill list from ADR-004 helps but isn't exhaustive. This improves iteratively.
- **Scale.** Three channels at 24 videos/month means the human (you) is still the bottleneck for task config approval and storyboard review. The system can't yet learn which decisions to auto-approve.
- **Visual continuity across chapters.** Main holding all chapters helps but doesn't guarantee continuity. A per-project visual continuity doc (colors used, layouts chosen, animation style) could help sub-agents stay consistent. Not implemented yet.
- **Craft doc rot.** As findings accumulate across sessions, craft docs and memories may contradict. No pruning mechanism exists beyond the improviser's read-before-write discipline.

## Risks

- **Task config becomes bureaucracy.** If it's too detailed, writing it takes as long as writing the script. Keep it short — one sentence per field, not paragraphs.
- **Mandatory delegation becomes busywork.** If Main delegates trivially ("add this one image") just to satisfy the mandate, it wastes a sub-agent. The mandate exists to prevent Main from hoarding — if a chapter genuinely needs no delegation, Main should note why, not force it.
- **Phase ordering too rigid.** "Skip but not reorder" is enforced. If a video type genuinely needs a different order, that's a system change (update the ADR and SKILL.md), not a per-project exception.
