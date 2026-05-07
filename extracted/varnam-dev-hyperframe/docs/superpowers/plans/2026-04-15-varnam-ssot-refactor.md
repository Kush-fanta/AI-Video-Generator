# Varnam SSoT Refactor Implementation Plan

> **For agentic workers:** REQUIRED: Use superpowers:subagent-driven-development (if subagents available) or superpowers:executing-plans to implement this plan. Steps use checkbox (`- [ ]`) syntax for tracking.

**Goal:** Remove scattered, contradictory behavioral rules from agent docs and enforce a single ownership chain — SKILL.md owns editor runtime, craft docs own universal method, agents own only their own contracts.

**Architecture:** Documentation-only edits across 6 files. No code changes, no new files. Verification is grep-based: confirm stale text is gone, confirm replacement text is present.

**Tech Stack:** markdown, grep, git

**Spec:** `docs/superpowers/specs/2026-04-15-varnam-ssot-refactor-design.md`

---

## Chunk 1: SKILL.md

**Files:**
- Modify: `.claude/skills/varnam/SKILL.md:95, 136, 238-240`

---

### Task 1: Fix channel-loading sentence at L95

- [ ] **Step 1: Verify the stale text exists**

```bash
grep -n "never read the channel\|Reviewer receives specs + the artifact" .claude/skills/varnam/SKILL.md
```

Expected: line 95 appears with both phrases.

- [ ] **Step 2: Replace L95**

In `.claude/skills/varnam/SKILL.md`, replace the entire paragraph at L95:

Old:
```
Load the channel directory once at project start. You interpret the channel and translate taste into specs for execution agents. **Execution agents (maps, mograph, assets, sound-engineer) never read the channel.** Core is the one exception — it receives raw channel files because writing in the channel's voice requires direct taste access, not a spec translation. Reviewer receives specs + the artifact under review, not channel files. All other teammates get specs from you.
```

New:
```
Load the channel directory once at project start. You interpret the channel and translate taste into specs for execution agents. Specialists (maps, mograph, assets, sound-engineer) load the channel files relevant to their domain themselves as their first step. Core reads raw channel files because writing in the channel's voice requires direct taste access. Reviewer receives full channel identity passed by the editor in its prompt.
```

- [ ] **Step 3: Verify the fix**

```bash
grep -n "never read the channel\|Reviewer receives specs + the artifact" .claude/skills/varnam/SKILL.md
```

Expected: no output.

---

### Task 2: Fix channel-loading sentence at L136

- [ ] **Step 1: Verify the stale text exists**

```bash
grep -n "passed by the editor at dispatch time, not loaded from disk" .claude/skills/varnam/SKILL.md
```

Expected: line 136 appears.

- [ ] **Step 2: Replace L136**

In `.claude/skills/varnam/SKILL.md`, replace the entire paragraph at L136:

Old:
```
Execution agents (maps, mograph, assets, sound-engineer) receive the relevant channel files in their prompt — passed by the editor at dispatch time, not loaded from disk themselves. They never read `craft/`. Reviewer receives the full channel identity + the artifact under review. Core reads channel identity and craft docs directly because it makes creative decisions. The rule is not "specialists never see the channel" — it is "the editor controls what channel context each agent gets, and passes it explicitly."
```

New:
```
Specialists (maps, mograph, assets, sound-engineer) load the channel files relevant to their domain themselves — they do not need them passed explicitly. They never read `craft/`. Reviewer receives the full channel identity passed by the editor in its prompt. Core reads channel identity and craft docs directly because it makes creative decisions.
```

- [ ] **Step 3: Verify the fix**

```bash
grep -n "passed by the editor at dispatch time" .claude/skills/varnam/SKILL.md
```

Expected: no output.

---

### Task 3: Fix chapter sequencing section at L238

- [ ] **Step 1: Verify the stale text exists**

```bash
grep -n "Reference-first building\|taste anchor\|dispatching specialists.*against it" .claude/skills/varnam/SKILL.md
```

Expected: lines 238 and 240 appear.

- [ ] **Step 2: Replace L238-240**

In `.claude/skills/varnam/SKILL.md`, replace:

Old:
```
### Reference-first building

Build the hardest or most representative chapter first — skeleton, specialists, render, fix loop until right. This becomes the taste anchor. Then build remaining chapters against it, dispatching specialists in parallel per chapter once skeletons are set.
```

New:
```
### Chapter sequencing

Build the hardest or most representative chapter first — skeleton, specialists, render, fix loop until right. Then build remaining chapters. Use the first completed chapter as a consistency reference during review (cross-chapter visual and audio checks), not as a formal reference artifact passed to builders. Builders receive specs and channel config — not prior chapters.
```

- [ ] **Step 3: Verify the fix**

```bash
grep -n "Reference-first building\|taste anchor" .claude/skills/varnam/SKILL.md
```

Expected: no output.

```bash
grep -n "Chapter sequencing" .claude/skills/varnam/SKILL.md
```

Expected: one result.

- [ ] **Step 4: Commit**

```bash
git add .claude/skills/varnam/SKILL.md
git commit -m "fix(varnam): resolve channel-loading contradiction and retire reference-first framing in SKILL.md"
```

---

## Chunk 2: craft docs

**Files:**
- Modify: `.claude/skills/varnam/craft/editing.md` — remove Reference-First Building section, replace all DoP references
- Modify: `.claude/skills/varnam/craft/direction.md` — scope map rule to country boundaries, replace DoP references
- Modify: `.claude/skills/varnam/craft/storyboarding.md` — replace all DoP references

---

### Task 4: editing.md — remove Reference-First Building section

- [ ] **Step 1: Verify the section exists**

```bash
grep -n "Reference-First Building\|taste anchor\|reference chunk source code" .claude/skills/varnam/craft/editing.md
```

Expected: lines 293-295 appear.

- [ ] **Step 2: Delete the section**

In `.claude/skills/varnam/craft/editing.md`, remove the entire `### Reference-First Building` section (L293-295):

```
### Reference-First Building

The editor dispatches the hardest/most representative chunk to a builder first — alone. Reviews the rendered output, runs the fix loop until it's right. That becomes the taste anchor. Remaining chunks are dispatched in parallel with: per-chapter spec + reference chunk source code + reference render.
```

Delete these lines entirely. Orchestration belongs in SKILL.md, not craft docs.

- [ ] **Step 3: Verify removal**

```bash
grep -n "Reference-First Building\|taste anchor" .claude/skills/varnam/craft/editing.md
```

Expected: no output.

---

### Task 5: editing.md — replace all DoP references

- [ ] **Step 1: Count DoP references**

```bash
grep -n "DoP" .claude/skills/varnam/craft/editing.md
```

Note all line numbers. There are approximately 11 instances.

- [ ] **Step 2: Replace section header**

Replace `### Execution Agents — DoPs` with `### Execution Agents — Specialists`.

- [ ] **Step 3: Replace all remaining DoP references**

Go through each line returned in Step 1 and replace:
- "DoPs are supplementary hands" → "Specialists are supplementary hands"
- "DoPs receive the channel identity" → "Specialists receive the channel identity"
- "dispatch DoP with the fix spec" → "dispatch the relevant specialist with the fix spec"
- "One DoP per chapter" → "One specialist per chapter"
- "The DoP reads this FIRST" → "The specialist reads this FIRST"
- "The DoP uses intent for judgment calls" → "The specialist uses intent for judgment calls"
- "primary creative input for the DoP. Without it, the DoP" → "primary creative input for the specialist. Without it, the specialist"
- "multiple DoPs need to share" → "multiple specialists need to share"
- "each DoP agent" → "each specialist agent"
- Any remaining "DoP" → "specialist"

- [ ] **Step 4: Verify no DoP references remain**

```bash
grep -n "DoP" .claude/skills/varnam/craft/editing.md
```

Expected: no output.

---

### Task 6: direction.md — scope the map rule

- [ ] **Step 1: Verify the stale text exists**

```bash
grep -n "Never draw country maps in code" .claude/skills/varnam/craft/direction.md
```

Expected: line 121 appears.

- [ ] **Step 2: Replace the map rule**

In `.claude/skills/varnam/craft/direction.md`, replace at L121:

Old:
```
**Never draw country maps in code.** SVG paths, dot clusters, and hand-drawn outlines of real countries are wrong. They will be geographically inaccurate and politically dangerous. Generate maps via image generation or source real cartographic images. Always verify territorial accuracy before shipping — especially for India (J&K, Ladakh, Aksai Chin, NE states, island territories must be present and correct).
```

New:
```
**For country boundary maps: never render borders in code** (SVG paths, dot clusters, hand-drawn outlines). Geographic and political accuracy cannot be guaranteed in code — use the maps agent with verified TopoJSON data or image generation. Always verify territorial accuracy before shipping — especially for India (J&K, Ladakh, Aksai Chin, NE states, island territories must be present and correct). Abstract and thematic maps (routes, data overlays, region highlights) are not subject to this constraint.
```

- [ ] **Step 3: Verify the fix**

```bash
grep -n "Never draw country maps in code" .claude/skills/varnam/craft/direction.md
```

Expected: no output.

```bash
grep -n "never render borders in code" .claude/skills/varnam/craft/direction.md
```

Expected: one result.

---

### Task 7: direction.md — replace DoP references

- [ ] **Step 1: Find all DoP references**

```bash
grep -n "DoP" .claude/skills/varnam/craft/direction.md
```

Expected: lines 34, 39, 42 (and any others).

- [ ] **Step 2: Replace each instance**

- L34: "the DoP can build them" → "the specialist can build them"
- L39: "what the DoP should extract" → "what the specialist should extract"
- L42: "every visual asset the DoP needs" → "every visual asset the specialist needs"

- [ ] **Step 3: Verify no DoP references remain**

```bash
grep -n "DoP" .claude/skills/varnam/craft/direction.md
```

Expected: no output.

---

### Task 8: storyboarding.md — replace all DoP references

- [ ] **Step 1: Find all DoP references**

```bash
grep -n "DoP" .claude/skills/varnam/craft/storyboarding.md
```

Expected: lines 3, 8, 39, 71, 107, 115, 120 (and any others).

- [ ] **Step 2: Replace each instance**

- L3: "every visual asset the DoP needs to build from" → "every visual asset the specialist needs to build from"
- L8: "every visual element the DoP needs" → "every visual element the specialist needs"
- L39: "The DoP uses these dimensions" → "The specialist uses these dimensions"
- L71: "Would the DoP know what to extract" → "Would the specialist know what to extract"
- L107: "Composition (for the DoP)" → "Composition (for the specialist)"
- L115: "The DoP needs intent so it can make judgment calls" → "The specialist needs intent so it can make judgment calls"
- L120: "A structured vocabulary that the DoP can match" → "A structured vocabulary that the specialist can match"

- [ ] **Step 3: Verify no DoP references remain**

```bash
grep -n "DoP" .claude/skills/varnam/craft/storyboarding.md
```

Expected: no output.

- [ ] **Step 4: Final verification — zero DoP in all craft docs**

```bash
grep -rn "DoP" .claude/skills/varnam/craft/
```

Expected: no output.

- [ ] **Step 5: Commit**

```bash
git add .claude/skills/varnam/craft/editing.md .claude/skills/varnam/craft/direction.md .claude/skills/varnam/craft/storyboarding.md
git commit -m "fix(craft): remove DoP references, scope map rule to country boundaries, remove orchestration from craft docs"
```

---

## Chunk 3: reviewer.md and CLAUDE.md

**Files:**
- Modify: `.claude/agents/reviewer.md:17, 49, 55, 79, 83`
- Modify: `CLAUDE.md:53`

---

### Task 9: reviewer.md — fix stale routes and reference chapter language

- [ ] **Step 1: Verify all stale text**

```bash
grep -n "dop\|DoP\|reference chapter\|Reference chapter" .claude/agents/reviewer.md
```

Expected: lines 17, 49, 55, 79, 83 appear.

- [ ] **Step 2: Fix inputs list (L17)**

Replace:
```
- Reference chapter video (for cross-chapter consistency)
```

With:
```
- Reference chapter video (optional — for cross-chapter consistency checks)
```

- [ ] **Step 3: Fix Pass 2b stale language (L49)**

Replace:
```
that's a **hard finding** — the DoP dropped coverage
```

With:
```
that's a **hard finding** — the specialist dropped coverage
```

- [ ] **Step 4: Fix Pass 3 framing (L55)**

Replace:
```
Compare against the reference chapter:
```

With:
```
If a reference chapter is provided, compare against it:
```

- [ ] **Step 5: Fix route vocabulary (L79)**

Replace:
```
  - `dop` — mechanical visual fixes (timing, animation, layout)
```

With:
```
  - `maps` — geographic, layout, or spatial findings
  - `mograph` — typography, animation, or data viz findings
  - `assets` — missing or wrong media
```

- [ ] **Step 6: Fix compound route (L83)**

Replace:
```
  - `researcher -> dop` — missing media before visual fix
```

With:
```
  - `researcher -> assets` — missing media that requires sourcing before visual fix
```

- [ ] **Step 6b: Fix route field definition (L67)**

Replace:
```
- **Route**: one of `researcher`, `core`, `editor`, or `researcher -> core`
```

With:
```
- **Route**: one of `researcher`, `core`, `editor`, `maps`, `mograph`, `assets`, `researcher -> core`, or `researcher -> assets`
```

- [ ] **Step 7: Verify all stale text is gone**

```bash
grep -n "dop\|DoP\|reference chapter\|Reference chapter" .claude/agents/reviewer.md
```

Expected: no output.

---

### Task 10: CLAUDE.md — fix channel-loading sentence

- [ ] **Step 1: Verify the stale text**

```bash
grep -n "execution agents and reviewers never read it directly" CLAUDE.md
```

Expected: line 53 appears.

- [ ] **Step 2: Replace the sentence**

In `CLAUDE.md` at L53, replace the sentence:

Old text (within the paragraph):
```
The editor loads the channel once; execution agents and reviewers never read it directly. `core` is the exception when writing in the channel's voice.
```

New text:
```
The editor loads the channel once and translates taste into specs. Specialists load the channel files relevant to their domain themselves. Reviewers receive full channel identity passed by the editor. `core` is the only agent that reads channel files directly for creative voice.
```

- [ ] **Step 3: Verify the fix**

```bash
grep -n "execution agents and reviewers never read it directly" CLAUDE.md
```

Expected: no output.

```bash
grep -n "Specialists load the channel files" CLAUDE.md
```

Expected: one result.

- [ ] **Step 4: Final verification — success criteria check**

```bash
# Zero DoP in craft docs
grep -rn "DoP" .claude/skills/varnam/craft/
# Zero dop routes in reviewer
grep -n "dop" .claude/agents/reviewer.md
# Channel loading contradiction gone from SKILL.md
grep -n "never read the channel\|passed by the editor at dispatch time" .claude/skills/varnam/SKILL.md
# Reference-first framing gone
grep -n "Reference-first building\|taste anchor" .claude/skills/varnam/SKILL.md
```

All four commands should return no output.

```bash
# direction.md map rule was replaced (not deleted)
grep -n "never render borders in code" .claude/skills/varnam/craft/direction.md
grep -n "Abstract and thematic maps" .claude/skills/varnam/craft/direction.md
# CLAUDE.md replacement landed
grep -n "Specialists load the channel files" CLAUDE.md
```

All three commands should return one result each.

- [ ] **Step 5: Commit**

```bash
git add .claude/agents/reviewer.md CLAUDE.md
git commit -m "fix(agents): replace dop routes with specialist routes, fix reference chapter language, fix channel-loading rule in CLAUDE.md"
```
