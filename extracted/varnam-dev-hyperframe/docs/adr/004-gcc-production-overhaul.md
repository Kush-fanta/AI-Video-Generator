# ADR-004: Production System Overhaul — GCC Session

## Status: Implemented, partially superseded by ADR-007 and ADR-008 (2026-04-14)

Channel directories, script review, and several production lessons remain current.
The craft-gate hook and parts of the older enforcement response described here are no
longer active runtime behavior.

## Context

ADR-003 proposed templates. They got built and wired in. This session tried to actually ship a video — twice. Both failed, and the failures exposed problems beyond templates.

India-export: 4 render iterations, 32% value density, shelved. GCC: rebuilt from scratch, got to silent render. The changes below came from watching the output fail and fixing it live.

This ADR documents those changes. It is not a single decision — it is a post-production record of 7 connected changes that emerged from watching the system fail and fixing it live.

## What Happened

Two videos were attempted. India-export was built through 4 render iterations, each failing differently. The user watched and called it: "it feels trash. audio is trash too. what is the value and entertainment delivered in that span? it's just filled with AI slop." A value audit showed 32% signal in the script. The video was shelved. GCC was rebuilt from scratch using every lesson from the failure.

## The Changes

### 1. Channel Identity → Directory Structure

**Before (ADR-001):** One `.md` file per channel. All taste in one document — voice, eye, ear, rhythm, production.

**After:** One directory per channel. Dedicated files:

```
channels/<name>/
├── narrative.md   — voice, structure, rhetoric, topic selection, editorial stance
├── visuals.md     — composition, motion, modes, density rules
├── audio.md       — instruments, scoring philosophy, SFX, silence, forbidden zones
└── config.md      — key-value pairs: hex codes, font sizes, spring configs, frame counts
```

**Why:** The single file was too large to hold both prose philosophy and literal production values. Subagent specs need exact numbers from config.md. Editorial decisions need the prose in narrative.md. Splitting lets the editor load what's needed per phase.

**What this supersedes:** ADR-001's "one file per channel" section. The layer model (taste/craft/tools) is unchanged — only the container shape changed.

### 2. Craft Gate Hook

**Before:** `.claude/rules/` files fired on file reads. If the editor wrote an artifact without reading a craft doc first, no rules injected, no checklist, no enforcement. This is exactly what happened with the native-script rule for ElevenLabs — the rule existed in a voiceover tool doc, but the editor created `voiceover.txt` via Write without reading any craft doc.

**After:** PreToolUse hook on Write/Edit injects a reminder of the governing craft doc and its non-negotiable rules whenever the editor writes a key artifact (voiceover.txt, treatment.md, storyboard.md, narrative.md, mix.json).

**Implementation:** `.claude/hooks/craft-gate.sh` + wiring in `.claude/settings.json`. Advisory, not blocking — it reminds, doesn't prevent. Blocking would cause infinite retry loops.

**Why:** The user diagnosed this precisely: "it's just a prompt failure bro, the skill file issue." Then pushed three times to escalate from a one-off fix to systemic enforcement: "this can be the case with a lot more" → "this has to be enforced."

### 3. Script Review Gate

**Before:** The editor wrote the script and proceeded to production. Self-evaluation.

**After:** Mandatory cold-read reviewer (fresh Opus agent, zero conversation context) audits every script before any production step. The reviewer:

- Marks every sentence as VALUE / PACING / CUT
- Calculates value density (floor: 70% for India Pill, 50% general)
- Identifies the outer loop (the question that makes the viewer need to watch)
- Flags SLOP patterns against a kill list
- Answers: "why would someone watch this today?"

If the script fails review (density <50%, no outer loop, 3+ SLOP patterns), rewrite and re-review. Do not proceed to voiceover.

**Evidence:** The india-export script had ~32% value density. The editor couldn't see it. A cold-read reviewer identified specific SLOP patterns, restated facts, and buried stories in under 3 minutes. The review cost nothing; the production cost hours.

**Files changed:** `craft/writing.md` (gate added), `channels/indiapill/narrative.md` (SLOP kill list, value density floor).

### 4. Focused Subagent Model

**Before (ADR-001):** "Reference-first splitting" — editor builds Ch1, dispatches full chapter builds to parallel DoPs with Ch1 as reference. Each DoP builds an entire chapter alone.

**After:** The editor decides how to use subagents based on what the chapter needs. There is no fixed dispatch pattern — the editor reads the chapter, judges what would benefit from focused help, and dispatches accordingly. Sometimes that's 3 subagents, sometimes 1, sometimes none.

The principle: dispatch for focused creative tasks, not entire chapter builds. "Build Chapter II" as a single dispatch produced generic output because the agent context-switched between too many concerns. But the specific tasks are the editor's call. Examples from the GCC session:

- "Design 8 keyframes — what does each frame look like as a finished composition?"
- "Generate/source all visual assets each frame needs"
- "Connect the isolated template compositions into one continuous canvas"

Those happened to be the right split for GCC. A different video might need different splits, or no subagents at all for a simple chapter.

**The line moved:** ADR-001 said "the main agent makes every taste decision, subagents do mechanical execution." The new model gives subagents creative latitude within their focused task — a frame designer makes real design decisions, but only about composition. The editor still sets the vision and decides what to delegate.

**Evidence:** GCC v1 (single DoP) vs v2 (focused model) — v2 had better compositions, better visual flow, better use of the template library.

### 5. Connected Canvas (Tested, Failed in Implementation)

**Hypothesis:** Templates are treated as isolated slides. Production-grade video needs elements that persist, transform, and accumulate across cuts. The canvas has memory — previous elements recede, creating depth. This subsumes density, image-forward, animation craft, and template-strict approaches.

**What was tested:** 5 hypothesis builds of the same Chapter I:
- H1: Density (texture, ghost numbers, accent lines)
- H2: Template strict (import exactly from templates/)
- H3: Image-forward (photos dominate, data lives ON images)
- H4: Animation craft (spring configs, stagger timing, easing)
- H5: Connected canvas (one continuous React tree, element persistence)

**Result:** H5 subsumes H1-H4 conceptually. But the implementation failed: subagents interpreted "elements recede to ghost opacity" as universal — every element gets `recedeTarget = 0.05-0.08`, nothing ever fully exits. By CUT 7, ~20 ghost divs at 5-8% opacity. Not depth — visual mud the viewer subconsciously feels.

**Corrected spec:**
- Default: elements fully exit (clean removal)
- Connected canvas = 1-2 chosen anchor elements per chapter that persist as ghosts
- Storyboard must name WHICH elements persist and WHY
- Dark beats remain the only hard wipe

**Status:** Architecture is right. Implementation spec was ambiguous. Next build must test corrected spec (selective persistence, not universal).

### 6. Editorial Philosophy (India Pill)

**Context:** The three channels serve a political ecosystem. The user set the constraint: "it's a way to strengthen an ecosystem so subtly that they never know the political motive. it shall also not blindly manipulate but create impact."

**Principles locked:**
- Government is mechanism, never hero. "PLI changed the incentive structure" not "Modi's visionary scheme."
- The viewer connects the dots themselves. Never state the political conclusion.
- Honesty is the weapon. Acknowledge gaps and failures — makes positive conclusions credible.
- No triumphalism, no flag imagery, no nationalist aesthetics (no tricolor, no Ashoka Chakra).
- Voice is curious analyst, not cheerleader.
- If the facts don't lead to a positive conclusion, don't force one.

**The test:** "Would this feel out of place on Vox or ColdFusion?" If yes, it's too political.

**Files changed:** `channels/indiapill/narrative.md`.

### 7. SLOP Kill List + Value Density

**India Pill's narrative.md now contains a kill list of banned patterns.** The list is living — the script reviewer adds new patterns whenever it catches a novel form of slop during review. The kill list grows with every production cycle. Initial entries:
- "The real question is..." (never answered)
- "Here's the part nobody talks about" (everyone does)
- Triple rhetorical constructions
- Straw men set up to knock down
- LinkedIn-wisdom closers
- "Let that sink in"
- Restating facts already established

**Value density floor:** 70% for India Pill. Every sentence either delivers a new fact, advances the argument, or creates necessary pacing. Everything else is cut.

**Evidence:** India-export script was 32% value. Even after manual review, only ~22 seconds of the 111-second Chapter I had actual insight. "Not even 22 if you take out slop that is now normalized."

## Other Changes

| Change | Files | What |
|---|---|---|
| ffmpeg dependency purged | `scripts/audio/voiceover.py` | Remotion-only project. Binary MP3 concat + mutagen for duration. No ffprobe. |
| Native script lint | `scripts/audio/voiceover.py` | Warns when 3+ Hindi/Odia/Tamil/Bengali words appear in Latin script. |
| Identity linter | `scripts/lint_remotion_identity.py` | Validates Remotion .tsx against config.md — fonts, font-size vocabulary, explicit typography overrides, colors, spring configs. Advisory by default, `--strict` when a phase wants a real gate. Emits signal-style JSON for downstream tooling. |
| Storyboard depth rule | `craft/direction.md`, `craft/editing.md` | 3-5 pages min for 6-min video. Thin storyboard = generic output. |

## Commits

```
3cbd184 feat: production system overhaul — craft gates, identity linter, template library wiring, connected canvas
b410655 refactor: move agent definitions to .claude/agents/ for native dispatch
67105a3 fix: voiceover.py — no ffmpeg dependency, native script lint, mutagen duration
3eed504 feat: craft gate hook — PreToolUse reminder when writing key artifacts
b900db0 refactor: channel directory refs, task tools, native script rule, DoP template access
e0b966b docs: ADR-004 production overhaul, renumber storyboard ADR to 005, ever-growing SLOP kill list
f779e71 cleanup: remove legacy souls/, migrate channels to directory format
9d78c0a feat: add templates — 22 categories, 380+ Remotion components, design system, template browser
```

## Consequences

### Positive
- Script review gate catches bad writing before expensive production. Proved on GCC (63% → rewritten).
- Focused subagent model produces better output than whole-chapter dispatch. Proved on GCC v2.
- Craft gate hook prevents the "never read the doc" failure mode that caused the native script miss.
- Channel directory structure separates prose philosophy from literal production values.
- Identity linter gives mechanical enforcement of config.md values in Remotion code.
- Template library is connected — DoPs start from proven compositions instead of building from scratch.

### Negative
- Connected canvas is architecturally right but not yet proven in implementation. The spec language needs to be precise enough that subagents don't cargo-cult it.
- The focused subagent model requires the editor to judge what to delegate per chapter — more orchestration thinking than a blanket "build this chapter" dispatch.
- Script review gate adds a cycle before production. Worth it, but the loop can expand if the reviewer is too strict.
- The system has accumulated significant complexity: channel dirs + craft docs + tool docs + rules + hooks + linters + templates + review gates. Onboarding a new contributor would require reading ADR-001 through 004.

### What ADR-001 Gets Wrong Now

ADR-001 says:
- "One file per channel" → Now directories with 4 files (§1 above)
- "Reference-first splitting: main agent builds Chapter 1, parallel DoPs build the rest" → Now focused subagent model (§4 above)
- "Agents never read channels or full craft" → Still true
- "Specs on disk are the memory" → Still true
- The reviewer model described in ADR-001 is still accurate

ADR-001 should be read with this ADR as an amendment, not replaced. The layer model, spec-first principle, and reviewer architecture are unchanged.

## Open Questions

1. **Connected canvas v2** — Will selective persistence (1-2 named anchors, rest fully exits) produce the intended depth without the mud? Untested.
2. **Score/mix pipeline** — No video has shipped with BGM/SFX. Sound design end-to-end is the next gap.
3. **Template QC** — 380+ templates committed, most "in-review." The library is wide but not yet quality-gated. ADR-003's hypothesis (templates solve the editor gap) depends on the templates being good.
4. **Value density at scale** — The 70% floor was set from one failed script. Is it the right number? Will it kill legitimate pacing?
