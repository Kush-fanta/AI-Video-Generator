# ADR-001: Channels, Craft, and Tools

## Status: Active for taste/craft/tools split, partially superseded for routing/orchestration by later runtime docs (2026-04-14 onward)

Current note: the layer split here remains valid. Current capability availability and live specialist surface now belong to `docs/contracts/capability-registry.json`, not this ADR's older execution examples.

The taste/craft/tools separation remains current. The original "one file per channel"
container shape was superseded by ADR-004's channel directory structure.

## Decision

Three layers. No personas. Distributed as a Claude Code plugin.

```
channels/<name>/design.md       — TASTE (who we are)
.claude/skills/varnam/craft/    — CRAFT (how to think)
.claude/skills/varnam/tools/    — TOOLS (how to use APIs and scripts)
.claude/agents/                 — SUBAGENTS (who executes)
.claude/skills/varnam/SKILL.md  — THE EDITOR (identity, flow, dispatch)
```

## The Layers

### Channel (`channels/<name>/`)

The channel's creative identity. `design.md` is the single live taste surface for voice, visual design, audio posture, rhythm, runtime defaults, and production rules.

The main agent (editor) reads the channel soul once at project start. Every creative decision flows from this. No subagent ever reads the channel. No skill file contains taste. The editor interprets the channel and translates taste into specs for subagents.

`design.md` is the agent-readable channel identity layer: YAML tokens plus Markdown rationale for voice, visual design, audio posture, runtime defaults, components, density, frame families, and do/don't rules. Runtime adapters must derive from `design.md`, not from parallel hand-authored identity files.

**Properties:**
- One directory per channel
- Doesn't change per project
- Evolves slowly as the channel matures
- Only the editor reads it
- Replaces: `personas/`, `channel.md` per-project, taste leaked into rule files

### Craft (`skills/varnam/craft/`)

Domain knowledge. How to think about writing, direction, scoring, visual coverage. Format-adaptive — works for any channel, any format.

**The test:** If a sentence only makes sense for one channel, it's taste (channel). If it works for any channel, it's craft.

| File | What it teaches |
|---|---|
| `writing.md` | Finding the story, structuring for the ear, pacing, editing prose |
| `direction.md` | Reading a story → visual plan, treatment structure, shot language, voiceover adaptation |
| `visual-timeline.md` | Thinking in shots, coverage vocabulary (wide/close/detail/cutaway), cut timing, FFmpeg filters |
| `scoring.md` | Two-pass voiceover analysis (frequency space + drama curve) → map events → build Lyria prompt from spec + words.json + drama curve → verify → iterate. Format modes (narration-dominant / music-dominant / hybrid). Entry/exit design. Beat-change hygiene. |
| `editing.md` | Assembly mechanics — interleave patterns, cut types, canvas systems, chapter structures. NO palette, NO font sizes, NO specific colors. |
| `research.md` | Sourcing material — archives, government portals, media hunts |
| `sound-design.md` | Psychoacoustics, frequency masking, Murch limits, mix craft, VO intelligibility, mobile listening, stem architecture |

**What moved out:**
- `editing.md`: warm white canvas (#FAFAF8), copper accent, 280px hero numbers, 50/50 interleave ratio → channel soul Eye/Rhythm
- `scoring.md`: tanpura instrument table, lore beat types, India case study instrument constraints → channel soul Ear
- Any channel-specific SFX aesthetic, mix personality → channel soul Ear

### Tools (`skills/varnam/tools/`)

API specs, prompting guides, script docs. Mechanical knowledge. How to call an API, what parameters it takes, what its limits are. No creative judgment.

| File | What it documents |
|---|---|
| `lyria.md` | Lyria API — models, prompting, timestamp control, limits, prompt read-back |
| `mixing.md` | SFX/mix tooling — mix manifests, `sound_design.py`, analysis support |
| `voiceover.md` | TTS routing and command use |
| `image-gen.md` | Image generation capability, prompt packets, project refs register |
| `video-gen.md` | Video generation capability and duration control |
| `media-index.md` | Media inventory and asset handoff format |
| `maps.md` | Map data and HyperFrames map execution contracts |
| `image-to-svg-animation.md` | SVG animation from AI-generated images |
| `google-workspace.md` | Google Workspace adapter use |
| `source-priority.md` | Source priority and copyright/source rules |

**Properties:**
- No taste, no creative judgment
- Subagents CAN read tool docs (they need API specs to execute)
- Updated when APIs change, not when projects change

### Agents (`skills/varnam/agents/`)

Claude Code subagent definitions. Each is a `.md` file with YAML frontmatter (`name`, `description`, `model`, `tools`) and a system prompt body. Distributed with the plugin — anyone who installs varnam gets these agents.

| File | Model | Role |
|---|---|---|
| `dop.md` | Opus | Builds Remotion compositions from the editor's spec |
| `sound-engineer.md` | Opus | Lyria scoring, ElevenLabs SFX, FFmpeg mix |
| `reviewer.md` | Sonnet | Gemini media analysis auditor — spec vs reality |
| `researcher.md` | Haiku | Media-first fact finding and source collection |
| `renderer.md` | Haiku | Runs render commands, reports results |

Agents are invoked via the `Agent` tool with `subagent_type` matching the agent `name`. They read `tools/` docs for API specs. They never read `channels/` or `craft/`.

### Plugin Distribution

Varnam is a Claude Code plugin. The repo IS the plugin. Structure:

```
skills/varnam/
  SKILL.md          — entrypoint (has name: frontmatter)
  agents/           — subagent definitions (auto-discovered)
  craft/            — domain knowledge (loaded by editor)
  tools/            — API specs (loaded by agents)
  evaluator.md      — artifact review
channels/           — channel souls (loaded by editor)
```

Anyone who points Claude Code at this repo as a plugin gets the full system: editor skill, agents, craft, tools.

## The Editor (`skills/varnam/SKILL.md`)

Small. Identity + invocation flow + dispatch model.

```
1. Read state     — tasks.md + disk
2. Load channel   — channels/<name>.md (taste for everything)
3. Load craft     — craft/<domain>.md (method for current phase)
4. Do the work    — make every creative decision
5. Dispatch       — hand SPECS to subagents (they load tool docs, not craft or channel)
6. Update state   — tasks.md
```

### Subagent model

Subagents are specialists with tool knowledge. They execute the editor's creative decisions.

| Subagent | Model | What the editor gives it | What the subagent knows |
|---|---|---|---|
| Sound engineer | Opus | Instrument palette, beat events with timestamps, entry/exit types, protection zones, mix levels, SFX list with descriptions | Lyria prompting (Pro model), ElevenLabs API, FFmpeg mix, voiceover drama analysis, audio verification |
| DoP | Opus | Treatment, beat specs, image prompts with camera/light/composition, timeline math | Remotion, zoompan, image generation, subtitle styling |
| Renderer | any | Exact render command | Script execution |
| Researcher | Haiku | Topic, investigation angle | Web search, archive sourcing, media download |
| Reviewer | Sonnet | Specs (words.json, treatment, mix manifest, channel soul) + rendered output path | Gemini media analysis, spec-vs-reality comparison, findings reports |

**The line:** The editor decides WHAT (taste × craft). The subagent decides HOW to execute (tools).

The editor says: "Bell strike on 'संकल्प' at 8.5s, tanpura drone below 80Hz, hard silence at 49.5s, cold synth temperature shift at 57s." The sound engineer says: "I'll use Lyria pro with this timestamp prompt, verify with Gemini flash, enforce silence via mix protection at -45dB."

#### Voiceover drama analysis

Before scoring, the sound engineer runs two analysis passes on the voiceover:
1. **Frequency & space** — where the voice lives (Hz), forbidden zones for instruments
2. **Drama curve** — emotional energy per 5s window (intensity 1-10, pacing, register: deadpan/tense/chaotic/sincere)

The Lyria prompt is built from three inputs: the editor's score spec (instruments, events), `words.json` (word timestamps), and the drama curve (emotional shape). This produces scores that respond to HOW the narrator speaks, not just WHAT words appear at WHEN timestamps. A deadpan drop gets sparse scoring. A chaotic acceleration gets building intensity. The drama shapes the music.

### Reviewer (Sonnet) + Media Analysis Loop

Builders are Opus. Reviewers are Sonnet. The reviewer runs DURING or AFTER the build — never before, never instead of.

#### What the reviewer is

A strict auditor. It doesn't build anything. It reads specs (treatment, words.json, channel soul, mix manifests), watches/listens to the rendered output via Gemini media analysis, and produces a findings report. Findings are specific — timestamps, frame numbers, file paths, expected vs actual.

#### When to dispatch

| Trigger | Reviewer scope | What it checks |
|---|---|---|
| Chapter rendered | Sync reviewer (one per chapter, parallel) | Every cut's `from`/`durationInFrames` against word timestamps. Priming rule (image 0.5-1.5s before word, text at word ±0.5s). Drift accumulation across beats. |
| Score generated | Score reviewer | Beat events landed within ±2s of target. No melody in voice band. Entry/exit types match spec. Beat changes respected (score doesn't play through mood pivots). |
| Mix rendered | Mix reviewer | VO intelligibility on phone speaker sim. Protection zones enforced. SFX don't mask payload. Chapter transitions (room-hum bridges, no digital zero). Score levels match manifest. |
| Final assembled | Full reviewer | Cross-chapter continuity. Visual grammar consistency. Audio layer coherence across the full piece. |

#### The media analysis loop

The reviewer's eyes and ears are Gemini. It doesn't guess from code — it watches the actual rendered output.

```
1. Reviewer reads specs (words.json, treatment, mix manifest, channel soul)
2. Reviewer builds analysis manifest for analyze_media.py
   - Targeted prompts: "At timestamp 28.5s, is there a bell strike? Is the narrator saying 'संकल्प'?"
   - NOT generic: "describe what happens" — that produces wallpaper analysis
3. Reviewer runs: python3 scripts/visual/analyze_media.py --jobs <manifest>
   - Model: gemini-flash-latest (fast, cheap, sufficient for audit)
4. Reviewer compares Gemini's observations against specs
5. Reviewer produces findings: timestamp, expected, actual, severity (hard/soft)
```

**Hard finding:** Cut at f=375 should align with "कल्प" at 12.7s (f=381). Actual: image appears at 12.1s — 0.6s early. PRIMING VIOLATION.

**Soft finding:** Score temperature shift requested at 57s. Gemini hears shift at 55.2s. Within ±2s tolerance. ACCEPTABLE.

#### The fix loop

Builders stay alive. Reviewers send findings back to the same builder that produced the chapter — not a separate fixer agent. The builder already has the full context (code, components, styles, assets). Spinning up a new agent to fix means rebuilding all that context from scratch.

```
Editor reads findings
    │
    ├─ Hard findings → send to the SAME builder (DoP/sound-engineer)
    │   via SendMessage to the running agent
    │   Builder already has code loaded, applies frame-accurate fixes
    │
    ├─ Soft findings → editor judges: fix or accept
    │
    └─ Re-review after fixes (same Sonnet reviewer, new render)
        Loop until: zero hard findings
```

#### Why Sonnet for review

- Cheaper — reviews are read-heavy, low-creativity work
- Faster — Sonnet processes analysis output quicker
- No taste needed — the reviewer checks specs against reality, not whether it "feels right"
- Parallel — one Sonnet per chapter costs less than one Opus doing all six

#### Why NOT the editor reviews

The editor made the creative decisions. The editor checking its own work is self-evaluation — the bias is baked in. A separate agent with only the specs and the rendered output catches what the editor's expectations blind it to.

#### Proactive vs reactive

The reviewer is dispatched proactively after every render — not only when the user asks "is the sync right?" The editor's flow becomes:

```
Build → Render → Review → Fix (if needed) → Re-render → Re-review → Done
```

The user sees the output AFTER the review loop has closed. They shouldn't need to catch sync drift or mix masking — that's the reviewer's job.

### Work Splitting — The Non-Determinism Problem

LLMs are non-deterministic in both understanding and output. Two Opus agents given the same channel soul will interpret "warm white editorial" differently. Across 6 chapters built by 6 agents, the drift is visible. This is the hardest problem in the system.

#### The principle

**The main agent makes every taste decision. Subagents do mechanical execution and gap-filling within the taste the main agent already committed to.**

The main agent doesn't say "build chapter 3 in the Pavneet style." It says "here are the exact image prompts, the exact text content, the exact cut timings, the exact color values." The subagent fills in zoompan math, Remotion component wiring, render commands — mechanical work where non-determinism doesn't matter.

#### When to split

Split when the work is long enough that the main agent's context would overflow, AND the work can be divided into chunks where taste decisions are already made.

| Phase | Split strategy |
|---|---|
| **Script** | Never split. One voice, one arc, one agent. The main agent writes the full script. |
| **Direction** | Never split. The treatment is one vision. The main agent writes it. |
| **DoP / Timeline** | Split by chapter/segment AFTER the main agent has written per-segment specs. Each spec includes: exact image prompts with camera/light/composition, exact text content, exact cut list with `from`/`durationInFrames`, transition types. The DoP agent wires Remotion components from these specs. |
| **Image generation** | Split by batch. Main agent writes every prompt. Workers generate in parallel. No creative latitude. |
| **Scoring** | Split by chapter AFTER the main agent has written per-chapter score specs: instrument palette, beat events with timestamps, entry/exit types. Sound engineer executes the Lyria prompt and iterates on tool-level quality (did the bell land? is the frequency clean?). |
| **Mix** | Split by chapter. Main agent writes the mix manifest (tracks, levels, protection zones). Sound engineer runs FFmpeg. |
| **Review** | Split by chapter. Sonnet reviewers run in parallel. Mechanical comparison — no taste needed. |

#### The spec is the taste boundary

The main agent's job per split unit is a **spec** — a document detailed enough that any competent executor produces the same result. The spec is where taste gets frozen into decisions.

Bad spec (taste leaks to subagent):
```
Chapter 3 covers the Three Scales section. Use the channel's warm
editorial style. Score should feel contemplative turning urgent.
Generate appropriate images for each beat.
```
The subagent has to interpret "warm editorial," "contemplative turning urgent," and "appropriate images." Three different Opus agents will make three different films.

Good spec (taste is decided, execution is mechanical):
```
Chapter 3 — 14 cuts, 109s total.

CUT 1: [f=0, dur=180] Image: stone-inscription-closeup.png
  KenBurns: scale 1.0→1.08, pan center→bottom-left
CUT 2: [f=180, dur=60] Text hero: "Three Scales"
  Canvas: #FAFAF8, text #1A1612, 280px, center
  Entry: scale 1.08→1.0 spring, 24px rise
CUT 3: [f=240, dur=240] Progressive build on #FAFAF8:
  "तिथि" at f=273, "पंचांग" at f=339, "युग" at f=438
  Each term: 36px slide-in, copper #C87F5A accent underline
...

Score spec:
  Instruments: tanpura drone 65Hz, singing bowl, high pad >6kHz
  [0:00-0:06] Bare tanpura, fading in
  [0:06] Bowl strike on "inscription"
  [0:08-0:12] Hold — tanpura only
  ...
  Entry: room-tone bridge from ch2 (inherited)
  Exit: bleed into ch4 (fade_out: 0)
```

The DoP agent reads this and wires Remotion `<Sequence>` components. The sound engineer reads the score spec and writes a Lyria prompt. Neither interprets taste — the main agent already did.

#### How this plays with context limits

The main agent writes specs in batches. For a 6-chapter video:

```
Phase 1: Main agent writes full script (story/narrative.md)
Phase 2: Main agent writes full treatment (direction/treatment.md)
Phase 3: Main agent writes per-chapter specs (direction/ch1-spec.md ... ch6-spec.md)
         Each spec has: cut list, image prompts, text content, score spec
         This is the most context-heavy phase — the main agent holds
         the full treatment + channel soul + words.json
Phase 4: Dispatch N DoP agents in parallel (one per chapter, each reads its spec)
Phase 5: Dispatch N image workers in parallel (prompts from specs)
Phase 6: Render each chapter
Phase 7: Dispatch N Sonnet reviewers in parallel (specs + rendered output)
Phase 8: Main agent reads findings, routes hard findings back to SAME builders via SendMessage
Phase 9: Builders fix, re-render. Reviewers re-check. Loop until zero hard findings.
Phase 10: Main agent writes per-chapter mix specs (mix-ch1.json ... mix-ch6.json)
Phase 11: Sound engineer executes mix per chapter
Phase 12: Final review of assembled piece
```

The main agent's context resets between phases. Specs on disk are the memory. The main agent reads back its own specs when it needs to make further decisions.

#### What the subagent CAN decide

Not everything is specified. The subagent has latitude over:

- **Tool-level implementation** — which Remotion component to use, how to wire spring physics, zoompan easing curves
- **Gap-filling** — if a spec says "KenBurns" but doesn't specify exact scale values, the DoP picks reasonable defaults
- **Iteration on tool quality** — if Lyria misses a beat event, the sound engineer re-prompts without asking the main agent
- **Error recovery** — if an image generation fails, retry with adjusted parameters

What the subagent CANNOT decide:

- **Which image to show** — main agent specified the prompt
- **What text to display** — main agent specified the content
- **When to cut** — main agent specified `from`/`durationInFrames`
- **What instruments to use** — main agent specified the palette
- **When to be silent** — main agent specified protection zones
- **Color, typography, composition** — main agent specified from channel soul

#### Reference-first splitting

Specs describe taste in words. Words are ambiguous. The strongest reference is a built artifact.

**The main agent builds the first chunk itself.** Chapter 1, or the hardest/most representative segment. That rendered output becomes the reference — the actual colors, motion, pacing, sound, component patterns, code structure. Every subsequent subagent gets:

1. **The spec** — per-chapter cut list, image prompts, text, score events
2. **The reference** — the built chunk (rendered video + source code + assets)
3. **Explicit match instructions** — "Chapter 1 is the reference. Match its visual grammar, component patterns, easing curves, color values, score density."

```
Main agent
    │
    ├─ Writes full treatment + all per-chapter specs
    │
    ├─ BUILDS Chapter 1 itself (DoP work, images, score spec, render)
    │   This is the taste anchor. The main agent's creative decisions
    │   are now concrete — not described in words, but visible in output.
    │
    ├─ Reviews Ch1 render (Sonnet reviewer + Gemini analysis)
    │   Fixes until Ch1 is right. This is the quality bar.
    │
    ├─ PARALLEL WAVE 1 — Builders (Opus, one per chapter):
    │   Ch2, Ch3, Ch4, Ch5, Ch6 — all dispatched simultaneously
    │   Each gets: its chapter spec + Ch1 source + Ch1 render as reference
    │
    ├─ PARALLEL WAVE 2 — Reviewers (Sonnet, one per chapter):
    │   Launched IN PARALLEL with builders, not after.
    │   Each reviewer watches its builder's output dir.
    │   The moment a chapter renders, the reviewer picks it up.
    │   Checks: spec match + Ch1 reference match
    │
    │   In practice: builder finishes Ch3 → Ch3 reviewer already running →
    │   findings ready before the other builders finish.
    │
    ├─ FIX LOOP — Builders stay alive, receive findings:
    │   Reviewer sends findings → editor routes to the SAME builder
    │   via SendMessage. Builder already has full context loaded.
    │   No new agent spin-up. No context rebuilding.
    │   Builder fixes → re-renders → reviewer picks up new output.
    │
    └─ Loop until zero hard findings per chapter.
```

**Why this works:**

- **Non-determinism collapses.** "Warm white editorial" is ambiguous. `#FAFAF8` background with `opacity: 0.95` on a `<div>` with `borderLeft: 3px solid #C87F5A` in the actual Ch1 `HeroText` component is not. Subagents copy the pattern, not interpret the description.
- **Code IS the spec.** The Ch1 Remotion components — `ImageNumber`, `FrostedOverlay`, `ProgressiveBuild` — are reusable. Ch2-6 agents import and use them. The component API enforces consistency that words can't.
- **The reviewer has a concrete bar.** "Does Ch3's text entrance animation match Ch1's?" is answerable by watching both. "Does Ch3 feel like the same channel?" is not.
- **The main agent's context stays focused.** It goes deep on Ch1 (full taste decisions, component design, iteration). Then it writes specs for Ch2-6 referencing what it already built. The specs are thinner because the reference carries the weight.

#### What the reference chunk should be

Not always Chapter 1. Pick the chunk that:
- Has the widest variety of beat types (image, text, composite, progressive, dark)
- Establishes components the other chunks will reuse
- Is the hardest to get right (if Ch1 is a simple intro and Ch4 is the data-heavy core, build Ch4 first)

The reference chunk is the one where the most taste decisions happen. Everything after it is variation.

#### The non-determinism tax

Even with reference + specs, subagent output will vary. The reviewer catches this:

- DoP agent A uses slightly different easing than the reference → reviewer catches visual inconsistency
- Sound engineer's Lyria generation drifts from the beat map → reviewer catches with media analysis
- Image generation produces unexpected composition → reviewer flags against the prompt spec

The fix loop (reviewer → builder → re-review) is the tax you pay for parallelism. It's cheaper than sequential execution by a single agent that would overflow context. And with a concrete reference, the fixes are specific: "match Ch1's spring config: mass 1, damping 15, stiffness 120" — not "make it feel more like the channel."

## Migration — Completed 2026-03-31

Commit `edf8d6d`. 75 files changed, 2525 insertions, 773 deletions.

### What was done

| Source | Destination | Surgery |
|---|---|---|
| `personas/writers/pavneet.md` + `rules/editing.md` taste + `rules/scoring.md` taste + memory files | `channels/pavneet.md` | Consolidated all taste into Voice, Eye, Ear, Rhythm, Production |
| `rules/writing.md`, `direction.md`, `visual-timeline.md`, `research.md` | `craft/` | Direct move, no changes |
| `rules/editing.md` | `craft/editing.md` | Removed all colors, fonts, sizes, scoring section. Kept universal mechanics. |
| `rules/scoring.md` | `craft/scoring.md` | Removed case study Lyria prompt, channel instruments. Kept format-adaptive method. |
| `rules/sound-design.md` + `skills/sound-design/SKILL.md` theory | `craft/sound-design.md` | Merged theory, added documentary practices |
| `rules/lyria.md`, `remotion.md`, `image-to-svg-animation.md`, `voiceover.md` | `tools/` | Direct move |
| `skills/voiceover-elevenlabs/SKILL.md`, `skills/voiceover-gemini/SKILL.md` | `tools/` | Stripped SKILL.md frontmatter, fixed broken refs |
| `skills/sound-design/SKILL.md` tool sections | `tools/sound-mix.md` | Extracted API specs, manifest format, CLI docs |
| `skills/varnam/SKILL.md` | Rewritten in place | New: channel/craft/tools/agents/splitting/reviewer model |
| `CLAUDE.md`, `AGENTS.md` | Updated in place | Removed persona refs, updated to new structure |
| `projects/*/channel.md` | Simplified | `channel: pavneet` pointer only |
| All 45 persona files | `archive/personas-v1/` | Archived, not deleted from git history |
| Agent design specs in `docs/superpowers/specs/` | `skills/varnam/agents/` | Formalized as Claude Code agent definitions |

### What was deleted

```
skills/varnam/rules/          — replaced by craft/ + tools/
skills/sound-design/          — merged into craft/sound-design.md + tools/sound-mix.md
skills/voiceover/             — collapsed into tools/voiceover.md
skills/voiceover-elevenlabs/  — collapsed into tools/voiceover-elevenlabs.md
skills/voiceover-gemini/      — collapsed into tools/voiceover-gemini.md
personas/                     — archived to archive/personas-v1/
```

## Consequences

### Positive
- Taste is in one place (channel), method in another (craft), tool specs in another (tools) — no mixing
- The editor owns all creative decisions — subagents can't drift
- Skills are reusable across channels — a new channel only needs a new channel soul
- Subagent handoffs are specs, not vibes
- Fewer files loaded at runtime — channel + one craft file + one tool file per phase

### Negative
- Editor context is heavier — it carries the taste AND makes the creative decisions, then writes detailed specs
- Building a new channel requires writing Voice + Eye + Ear + Rhythm + Production upfront
- `editing.md` becomes thinner — the mechanics without the taste may feel incomplete until the channel soul is loaded alongside it

### Why not v3 reference library now
- The 40+ persona files were useful for building channel souls but have no runtime role
- Adding a "reference" layer creates a third place to look for creative guidance — ambiguity
- If the editor is stuck, the human gives direction. That's the feedback loop. Not a reference library.
