# Intake Lock

Source/channel brief lock before creative work begins. Intake records operational locks and source-visible facts; core resolves the film's creative interpretation.

## When to Run

- No channel for this project (user described something new, or hasn't picked one)
- Channel exists but operational locks are missing: channel, source/story selection, platform/runtime override
- User explicitly asks for a briefing/config session

## How to Run

If the user gives a URL, article, document, or reference, treat it as selected source material. Read only enough to capture working title, source/author/date when visible, neutral source thesis, current hook, and obvious named entities. Scaffold a conservative brief and hand active stance/proof burden to core through `research_requirements`.

Ask only for missing operational locks. Group any needed questions by priority. Skip anything the channel already answers. If the user gives a reference video/image, that collapses multiple questions at once — study it and extract answers.

Missing user input stays missing. Do not convert a blank field into editorial direction options, A/B/C angle prompts, stance choices, proof-mode choices, or taste questions. For a supplied source, store the content as-is, use only source-visible facts plus explicit user constraints, and let core choose the active argument.

## Operational Locks

### Priority 1 — Shape

| Question | What you're locking | If skipped, what breaks |
|----------|---------------------|------------------------|
| **What's the overall goal?** Inform? Persuade? Entertain? Shock? | Tone, script register, visual intensity | Script drifts between tones |
| **What platform?** YouTube, Instagram Reels, LinkedIn, Twitter/X, internal | Aspect ratio, pacing, text density, hook style | Wrong aspect ratio, wrong pacing for platform |
| **What length?** Target duration, or current estimate if any | Pipeline choice (short = no subagents, long = chapter split), cut density | Over-engineered pipeline for a 30s clip, or underbuilt for 10min |

### Priority 2 — Look and Sound

| Question | What you're locking | If skipped, what breaks |
|----------|---------------------|------------------------|
| **Do we want real media, AI-generated, or mixed? How much?** | Media sourcing strategy, research depth, image gen budget | Agent defaults to AI gen when real footage would hit harder |
| **Render engine — HyperFrames-first runtime** | HTML compositions, `.clip` timing, GSAP timeline registration, render pipeline | All new video output uses the active shared runtime; HyperFrames is the first-step target |
| **What's the font / typography vibe?** Specific font name, or a feel (editorial, bold, handwritten) | Every text frame in the video | Inconsistent typography across beats |
| **Audio profile?** VO only? Scored with music? SFX-heavy? Ambient? | Scoring pipeline, mix complexity, Lyria budget | Agent generates a full score for a VO-only piece, or ships naked audio that needed scoring |

### Priority 3 — Detail

| Question | What you're locking | If skipped, what breaks |
|----------|---------------------|------------------------|
| **Any reference inspirations?** A video, a channel, a vibe, a mood board | Visual grammar, pacing, editing rhythm — a single reference collapses 5+ taste questions | Agent invents a style that doesn't match the user's mental image |
| **Any specific details that must be exact?** Names, dates, numbers, spellings, pronunciations | Factual accuracy in script and text overlays | Misspelled names on screen, wrong dates in narration |
| **Any specific or vague creative details?** Color palette preferences, mood, recurring motifs, things to avoid | Guard rails for creative decisions | Agent picks a palette or motif the user hates |

## Output

Preferred:

```bash
python3 scripts/run.py project:intake
```

That runner normalizes the intake fields, shows a locked brief summary, then writes `projects/<slug>/task-config.md` and `projects/<slug>/tasks.md` through the shared scaffold command. Project state lives under `projects/<slug>/`.

Backend fallback:

```bash
bash scripts/project/scaffold.sh --from templates/project-intake.sh
```

The generated `task-config.md` uses the shape below:

```markdown
# Task Config — <slug or working title>

## Core message
- <one-sentence claim>

## Why now
- <why this matters now>

## Anti-goals
- <what this piece must not become>

## Viewer / format / runtime
- **Target viewer:** <who>
- **Platform:** <platform> → <aspect ratio>
- **Runtime:** <target or estimate>
- **Desired outcome:** <what should stick>

## Identity applied to this film
- **Narration stance:** <which voice traits are active here>
- **Visual proof modes:** <what kinds of evidence belong in this piece>
- **Sound stance:** <vo-only/scored/sfx-heavy/ambient + posture>
- **No-go moves:** <palette/motif/mode habits to avoid here>

## Project locks
- **Key subjects:** <people, places, systems>
- **Exact facts / names / dates:** <must not drift>
- **Media / evidence obligations:** <real/ai/mixed + any hard requirements>
- **Research requirements:** <what must be verified before package lock>
```

## After the Lock

1. **Sample frames.** Generate 3-4 frames showing the locked visual language applied to the topic. Different beat types — one image-dominant, one text-dominant, one data/number, one transitional. User approves or tweaks before full production.

2. **If building a new channel:** Do not create separate identity docs. Author `channels/<name>/design.md` first by adapting the closest existing channel's `design.md` to the new identity, then add only `references.md` when the channel needs study evidence. Voice, audio, runtime defaults, design tokens, visual rationale, frame families, density, and guardrails live in `design.md`.

3. **If channel exists:** Intake fills the project brief from source-visible facts, explicit user constraints, and channel defaults. The scaffold command writes `task-config.md`, which applies the channel to this film — where it pins a project-specific choice, that choice governs this piece.

## Boundaries

- **Channel soul.** Intake is per-project. The channel is permanent identity. Repeated project answers belong in the channel.
- **Task config.** Intake feeds the scaffold command, which writes the applied brief. Permanent taste stays in `channels/<name>/`. Film-specific application goes in `task-config.md`.
- **Creative judgment.** Intake locks configuration. Core decides which image argues, which proof mode leads, and how the stance lands.
- **Blank user direction.** If the user did not give a preference, record no preference. Do not invent one, and do not stop the scaffold to solicit one unless the missing value is channel, source/story selection, platform, or runtime.
- **Script work.** Intake precedes writing. Core owns the writing craft.
