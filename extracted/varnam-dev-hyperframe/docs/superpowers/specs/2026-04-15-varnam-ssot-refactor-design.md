# Varnam SSoT Refactor — Design Spec

**Date:** 2026-04-15  
**Status:** Approved  
**Approach:** SKILL.md-as-anchor

---

## Problem

Behavioral rules for the editor agent are spread across SKILL.md, craft docs, ADRs, agent prompts, and CLAUDE.md with no single authoritative source. When the architecture changed (DoP → specialists, fixed phases → supervisor model), files weren't updated in sync. Symptoms:

- Editor announces "Chapter 1 — the reference chapter" (stale SKILL.md framing)
- Reviewer routes findings to `dop` which no longer exists
- `direction.md` rule about map rendering conflates a political-safety constraint with a taste decision
- `SKILL.md` has two contradictory statements on channel loading (L95 area and L136 area vs L204)
- `CLAUDE.md` repeats the same contradiction
- `craft/editing.md` and `craft/storyboarding.md` still contain DoP agent references throughout

---

## Ownership Chain

The single rule this refactor enforces:

| File | Owns | Does NOT own |
|---|---|---|
| `SKILL.md` | Editor runtime behavior — intake, delegation, build loop, specialist routing, chapter sequencing | Craft method, agent internals |
| `craft/*.md` | Universal method — storyboarding, writing, editing. No agent names, no taste values, no implementation prescriptions | Who executes it, how specialists work |
| `agents/*.md` | Own contract only — required inputs, self-verification, gap handling | Global orchestration rules |
| `CLAUDE.md` | Repo invariants — entrypoint, thin-harness, workspace pattern | Behavioral rules for any specific agent |

---

## Changes

### 1. `SKILL.md`

**Fix channel-loading contradiction — two locations:**

Remove both of the following sentences (wherever they appear):
- "Execution agents (maps, mograph, assets, sound-engineer) receive the relevant channel files in their prompt — passed by the editor at dispatch time, not loaded from disk themselves."
- "Execution agents … never read the channel directly."
- Any sentence that says reviewers receive specs + artifact only (not channel files)

Correct rule (already stated elsewhere): specialists load the relevant channel files themselves as their first step. Reviewer receives full channel identity passed by the editor in its prompt.

**Fix chapter sequencing section:**

Replace the section `### Reference-first building` with `### Chapter sequencing` containing:

> Build the hardest or most representative chapter first — skeleton, specialists, render, fix loop until right. Then build remaining chapters. Use the first completed chapter as a consistency reference during review (cross-chapter visual and audio checks), not as a formal reference artifact passed to builders. Builders receive specs and channel config — not prior chapters.

---

### 2. `craft/editing.md`

**Remove `### Reference-First Building` section entirely.**

Rationale: universal editing craft doesn't encode orchestration patterns. Who builds what in what order is editor runtime behavior — lives in SKILL.md.

**Replace ALL DoP references** with "specialist" or "builder" throughout the entire file. Do not enumerate — grep the file for "DoP" and replace every instance. Key structural rename: `### Execution Agents — DoPs` → `### Execution Agents — Specialists`.

---

### 3. `craft/direction.md`

**Do not remove the map rule entirely.** It carries a political-safety constraint (geographic accuracy for India, J&K, Ladakh, Aksai Chin) — that is a correctness constraint, not a taste decision.

**Replace** the existing rule with scoped version:

Old text (approximate):
> "Never draw country maps in code. SVG paths, dot clusters, and hand-drawn outlines of real countries are wrong. They will be geographically inaccurate and politically dangerous. Generate maps via image generation or source real cartographic images."

New text:
> "For country boundary maps: never render borders in code (SVG paths, dot clusters, hand-drawn outlines). Geographic and political accuracy cannot be guaranteed in code — use the maps agent with verified TopoJSON data or image generation. Abstract and thematic maps (routes, data overlays, region highlights) are not subject to this constraint."

**Replace ALL DoP references** with "specialist" or "builder" throughout the file. Grep for "DoP" and replace every instance.

---

### 4. `craft/storyboarding.md`

**Replace ALL DoP references** with "specialist" or "builder" throughout the entire file. Do not enumerate — grep the file for "DoP" and replace every instance. Pay attention to structural descriptions like "Composition (for the DoP)" which appear in section headers and layer definitions.

---

### 5. `agents/reviewer.md`

**Fix route vocabulary — simple routes:**

Replace the `dop` route entry:
```
- `dop` — mechanical visual fixes (timing, animation, layout)
```
With three specialist routes:
```
- `maps` — geographic, layout, or spatial findings
- `mograph` — typography, animation, or data viz findings  
- `assets` — missing or wrong media
```

**Fix compound route:**
- `researcher -> dop` → `researcher -> assets` (missing media that requires sourcing before visual fix)

**Fix Pass 2b stale language:**
- "the DoP dropped coverage" → "the specialist dropped coverage"

**Fix inputs list:**
- "Reference chapter video (for cross-chapter consistency)" → "Reference chapter video (optional — for cross-chapter consistency checks)"

**Fix Pass 3 framing:**
- "Compare against the reference chapter:" → "If a reference chapter is provided, compare against it:"

**Note on route vocabulary mismatch:** SKILL.md uses lane-name routes (`visual_replan`, `audio_rework`, etc.) while reviewer.md uses agent-name routes (`maps`, `mograph`, `core`, etc.). This inconsistency pre-dates this refactor and is not resolved here. It is acknowledged as a known mismatch — a future ADR should align on one vocabulary.

---

### 6. `CLAUDE.md`

**Fix the channel-loading sentence in the System Components section:**

Remove: "The editor loads the channel once; execution agents and reviewers never read it directly. `core` is the exception when writing in the channel's voice."

Replace with: "The editor loads the channel once and translates taste into specs. Specialists load the channel files relevant to their domain themselves. Reviewers receive full channel identity passed by the editor. `core` is the only agent that reads channel files directly for creative voice."

---

## What Does NOT Change

- ADRs — historical record, leave as-is
- No new files created
- No changes to agent capability or pipeline logic — this is documentation only

---

## Success Criteria

- Editor no longer announces "reference chapter" framing unprompted
- Reviewer findings route to `maps`/`mograph`/`assets` not `dop`; compound `researcher -> dop` route is gone
- `grep -r "DoP" .claude/skills/varnam/craft/` returns zero results
- No internal contradictions in SKILL.md on channel loading
- `CLAUDE.md` channel-loading sentence matches actual specialist behavior
- `direction.md` map rule is scoped to country boundaries; abstract maps explicitly unaffected
