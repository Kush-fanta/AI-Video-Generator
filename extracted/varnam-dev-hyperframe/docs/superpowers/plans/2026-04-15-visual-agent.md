# Visual Agent Implementation Plan

> **For agentic workers:** REQUIRED: Use superpowers:subagent-driven-development (if subagents available) or superpowers:executing-plans to implement this plan. Steps use checkbox (`- [ ]`) syntax for tracking.

**Goal:** Replace the `assets` agent with a `visual` agent that generates images and video clips, self-verifies output with Gemini vision, writes a media manifest, and wires assets directly into the Remotion timeline skeleton.

**Architecture:** Documentation-only changes — no code. Four files touched: new `visual.md` agent prompt, new `video-gen.md` tool doc, deleted `assets.md`, updated `SKILL.md` routing. Each task is independently verifiable with grep and file-existence checks.

**Tech Stack:** Markdown, Remotion, Gemini image gen (`scripts/visual/image.py`), Veo 2 video gen (Gemini API), Gemini vision (`scripts/visual/analyze_media.py`)

**Spec:** `docs/superpowers/specs/2026-04-15-assets-agent-redesign.md`

---

## Chunk 1: video-gen.md

### Task 1: Create `visual/video-gen.md`

**Files:**
- Create: `.claude/skills/varnam/visual/video-gen.md`

This tool doc gives the `visual` agent everything it needs to generate video clips with Veo 2 via the Gemini API. It follows the same format as `visual/image-gen.md`.

- [ ] **Step 1: Verify the file does not yet exist**

```bash
ls .claude/skills/varnam/visual/video-gen.md
```

Expected: `No such file or directory`

- [ ] **Step 2: Create the file**

Create `.claude/skills/varnam/visual/video-gen.md` with the following content:

```markdown
# Video Generation

> **STUB** — Veo 2 API spec pending. Not yet wired for production.

Video clip generation via Veo 2 is not yet available. When this file is complete it will cover: `veo-2.0-generate-001` model, Python SDK usage, duration control (frames→seconds), prompting techniques, Gemini vision verification, and gap handling.

**Until this file is complete:** the visual agent handles image beats only. Flag all video beats as `PENDING: video-gen.md is a stub — video generation not yet available` in the manifest. Do not stall on image beats.
```

- [ ] **Step 3: Verify the file exists and contains stub marker**

```bash
ls .claude/skills/varnam/visual/video-gen.md
grep -n "STUB" .claude/skills/varnam/visual/video-gen.md
grep -n "PENDING" .claude/skills/varnam/visual/video-gen.md
```

Expected: file exists, both greps return one result each.

- [ ] **Step 4: Commit**

```bash
git add .claude/skills/varnam/visual/video-gen.md
git commit -m "feat(visual): add video-gen.md — Veo 2 API spec and prompting techniques"
```

---

## Chunk 2: visual.md agent + assets.md deletion

### Task 2: Create `.claude/agents/visual.md`

**Files:**
- Create: `.claude/agents/visual.md`

- [ ] **Step 1: Verify assets.md exists (source of truth for what we're replacing)**

```bash
ls .claude/agents/assets.md
```

Expected: file exists.

- [ ] **Step 2: Create visual.md**

Create `.claude/agents/visual.md` with the following content:

```markdown
---
name: visual
description: Visual media specialist — generates images and video clips from editor-authored prompts, self-verifies with Gemini vision, writes media manifest, wires assets into Remotion timeline skeleton. Does not source archival media (research agent's job) or make editorial selections.
model: sonnet
---

You are the visual agent. The editor has built the Remotion skeleton and written the media prompts. You generate, verify, and wire — end to end. The editor never checks individual assets.

## What you receive

- Channel name and project path
- Beat brief: beat ID, slot type (image/video), subject description, output directory
- Image prompts (editor-authored — you execute, never write)
- Video prompts + target duration in frames (editor-authored)
- Pre-sourced archival paths (optional — from research agent if real media was found)
- Remotion skeleton TSX path (the file to wire after generation)

## Tool docs to read before starting

Read ALL of these before any generation:

| Doc | Purpose |
|---|---|
| `channels/<name>/visuals.md` | Channel visual tone — what belongs, what doesn't |
| `channels/<name>/config.md` | Literal values — palette, sizes |
| `visual/image-gen.md` | Image generation API — modes, flags, prompting techniques |
| `visual/video-gen.md` | Video generation API — Veo 2, prompting techniques, duration |
| `visual/timeline.md` | Remotion slot conventions — how slots are structured, required props |

**If `visual/video-gen.md` does not exist on disk:** handle image beats only. Flag all video beats as `PENDING: video-gen.md not yet available` in the manifest. Do not stall.

## What you do

### Per beat

**Step 1 — Check for pre-sourced archival path**

If the brief includes a pre-sourced file path from research, use it. Skip to verification.

**Step 2 — Generate**

No archival path provided: generate from editor's prompt.

- Images: follow `visual/image-gen.md`. Use `--mode instant` for 1–5 images. Use `--bgless` when the spec calls for a cutout.
- Video: follow `visual/video-gen.md`. Convert `target_frames` to seconds (`frames / 30`, minimum 5s).

**Step 3 — Verify with Gemini vision**

Verification criteria differ by type:

*Archival image:*
- Does it show the right subject, right era, right place?
- Is the file intact (not a 404 download, not a placeholder)?

*Generated image:*
- Does it match the prompt subject?
- If `--bgless`: is the background transparent, not a solid fill?

*Video clip:*
- Does the clip match the prompt subject and motion?
- Is actual duration ≥ target? If shorter by >10%: re-generate or flag.
- Is the file playable?

**If verification fails:** re-generate once. If second attempt also fails: write the beat as `unverified — see note` in the manifest and flag to editor. Never use a wrong asset silently.

**Duration mismatch (video):** if actual duration differs from target by >10%: flag as `DURATION_MISMATCH: brief=Nf, actual=Mf` in the manifest. Do not silently wire the wrong duration.

### After all beats

**Step 4 — Write `research/media-manifest.md`**

One row per beat:

| beat_id | file_path | media_type | source_type | prompt_or_source | target_frames | actual_frames | verification |
|---|---|---|---|---|---|---|---|
| 1.2 | images/beats/b1.2.png | image | generated | "aerial view..." | null | null | verified |
| 2.1 | images/beats/b2.1.jpg | image | archival | Wikimedia URL | null | null | verified |
| 3.4 | video/beats/b3.4.mp4 | video | generated | "crowd at dawn..." | 72 | 74 | verified |

- `target_frames` and `actual_frames`: use `null` for images — not applicable
- Flag any beat with no coverage. Never silently skip.

**Step 5 — Apply manifest to skeleton TSX**

Read `visual/timeline.md` to understand slot conventions before touching any TSX.

For each beat in the manifest:
- **Image slots:** fill the `src` prop with the manifest file path
- **Video slots:** fill `src`, set `durationInFrames` from `actual_frames`, ensure `<Video>` component with all required props per `visual/timeline.md`
- **Slot missing for a beat:** flag `SLOT_MISSING: no slot found for beat <id>`. Do not invent layout.
- **Orphan slot (slot in TSX but no manifest row):** leave untouched. Flag `ORPHAN_SLOT: slot in TSX for beat <id> has no brief entry`.

Do NOT change timing, animation parameters, or layout. Only fill media paths and duration values.

## Gap handling

| Condition | Action |
|---|---|
| No beat brief | Stop. Report missing. |
| No output directory | Stop. Report missing. |
| No prompt for a beat (and no archival path) | Flag: `MISSING: prompt for beat <id>` |
| `visual/video-gen.md` not on disk | Handle image beats. Flag video beats as `PENDING`. |
| Skeleton TSX path not provided | Write manifest only. Flag TSX wiring as skipped. |
| Verification fails twice | Write beat as `unverified — see note`. Flag to editor. |
| Video duration mismatch >10% | Flag `DURATION_MISMATCH` in manifest. Do not silently wire. |
| Slot in TSX with no brief entry | Flag `ORPHAN_SLOT`. Leave untouched. |

## Patch limit

Third pass on the same beat → discard accumulated patch set and regenerate clean from the original prompt.

## What you do NOT do

- Write image or video prompts — the editor authors all prompts, you execute them
- Choose between multiple valid candidate images without flagging options
- Change cut timing, animation, or layout in TSX
- Source archival media — that is the research agent's job; you receive pre-sourced paths
- Generate BGM, SFX, or VO — that is the sound-engineer's job
```

- [ ] **Step 3: Verify key content is present**

```bash
grep -n "^name: visual" .claude/agents/visual.md
grep -n "video-gen.md" .claude/agents/visual.md
grep -n "ORPHAN_SLOT\|SLOT_MISSING\|DURATION_MISMATCH" .claude/agents/visual.md
grep -n "Patch limit" .claude/agents/visual.md
```

Expected: all four greps return at least one result each.

- [ ] **Step 4: Commit visual.md**

```bash
git add .claude/agents/visual.md
git commit -m "feat(agents): add visual agent — generation, verification, timeline wiring"
```

---

### Task 3: Delete `assets.md`

**Files:**
- Delete: `.claude/agents/assets.md`

- [ ] **Step 1: Verify visual.md exists before deleting assets.md**

```bash
ls .claude/agents/visual.md .claude/agents/assets.md
```

Expected: both files exist.

- [ ] **Step 2: Delete assets.md**

```bash
git rm .claude/agents/assets.md
```

- [ ] **Step 3: Verify deletion**

```bash
ls .claude/agents/assets.md
```

Expected: `No such file or directory`

```bash
ls .claude/agents/
```

Expected: `visual.md` appears in the listing, `assets.md` does not.

- [ ] **Step 4: Commit**

```bash
git commit -m "feat(agents): remove assets agent — replaced by visual"
```

---

## Chunk 3: SKILL.md updates

### Task 4: Update all `assets` references in SKILL.md

**Files:**
- Modify: `.claude/skills/varnam/SKILL.md`

There are 8 references to `assets` in SKILL.md. Each needs a targeted update — not a blanket find-replace, since the meaning changes per location.

- [ ] **Step 1: Audit all instances**

```bash
grep -n "assets" .claude/skills/varnam/SKILL.md
```

Note all line numbers. There should be ~8 results.

- [ ] **Step 2: Update L21 — specialist dispatch list**

Find:
```
`assets` for media sourcing and image gen
```
Replace with:
```
`visual` for image and video generation, verification, and timeline wiring
```

- [ ] **Step 3: Update L95 — channel loading list**

Find:
```
Specialists (maps, mograph, assets, sound-engineer)
```
Replace with:
```
Specialists (maps, mograph, visual, sound-engineer)
```

- [ ] **Step 4: Update L136 — channel loading list (second occurrence)**

Find (same pattern, different paragraph):
```
Specialists (maps, mograph, assets, sound-engineer) load the channel files relevant to their domain themselves
```
Replace with:
```
Specialists (maps, mograph, visual, sound-engineer) load the channel files relevant to their domain themselves
```

- [ ] **Step 5: Update L199 — dispatch table row**

Find:
```
| Assets | `assets` | Sonnet | Channel name + project path + assets brief (beats, subjects, AI gen prompts, copyright constraints, output directory) |
```
Replace with:
```
| Visual | `visual` | Sonnet | Channel name + project path + beat brief (beat IDs, slot types, image/video prompts, target frame durations, output directory, skeleton TSX path) |
```

- [ ] **Step 6: Update L202 — routing rule**

Find:
```
Real sourcing + AI image gen → `assets`. Audio → `sound-engineer`.
```
Replace with:
```
Image and video generation, verification, timeline wiring → `visual`. Audio → `sound-engineer`.
```

- [ ] **Step 7: Update L204 — channel invariant**

Find:
```
`assets` reads `visuals.md`.
```
Replace with:
```
`visual` reads `visuals.md` + `config.md`.
```

- [ ] **Step 8: Update L228 — What specialists handle table**

Find:
```
| `assets` | Visual media — archival sourcing, AI image gen from your prompts |
```
Replace with:
```
| `visual` | Image and video generation — generates from editor prompts, self-verifies, writes manifest, wires into Remotion skeleton |
```

- [ ] **Step 9: Update L272 — quality loop BUILD step**

Find:
```
BUILD  — Editor writes the skeleton. Dispatches maps/mograph/assets in parallel to populate it.
```
Replace with:
```
BUILD  — Editor writes the skeleton. Dispatches maps/mograph/visual in parallel to populate it.
```

- [ ] **Step 9b: Update L407 — example tasks.md entry**

Find:
```
"Dispatch assets — beat images for Ch.1"
```
Replace with:
```
"Dispatch visual — beat images for Ch.1"
```

- [ ] **Step 10: Verify zero `assets` references remain (excluding script filenames)**

```bash
grep -n "\bassets\b" .claude/skills/varnam/SKILL.md | grep -iv "verify_assets\|asset_download"
```

Expected: no output (all agent-name references replaced; script filenames excluded).

```bash
grep -n "visual" .claude/skills/varnam/SKILL.md | grep -v "visuals\.md\|visual/\|craft/visual"
```

Expected: at least 6 results (the replaced lines).

- [ ] **Step 11: Commit**

```bash
git add .claude/skills/varnam/SKILL.md
git commit -m "feat(varnam): rename assets→visual in SKILL.md, update routing and dispatch table"
```
