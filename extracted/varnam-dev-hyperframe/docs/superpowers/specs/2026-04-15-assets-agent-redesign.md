# Visual Agent — Design Spec

**Date:** 2026-04-15
**Status:** Approved
**Replaces:** `assets` agent

---

## Core Principle

Every specialist owns its domain end-to-end: **generate/source → verify → place in timeline**. The editor builds the skeleton and dispatches. Specialists fill and wire their own domain. Nothing returns to the editor for placement.

This spec establishes that pattern for `visual`. The same principle applies to `maps` and `mograph` — each wires its own output into the timeline slot the editor reserved for it.

---

## What `visual` Owns

- AI image generation (from editor-authored prompts)
- AI video clip generation (from editor-authored prompts)
- Self-verification of every visual file via Gemini vision
- `research/media-manifest.md` — beat-to-asset mapping
- Applying the manifest to the editor's Remotion skeleton TSX

**Does NOT own:**
- Sourcing archival media (research agent's job — `visual` receives pre-sourced paths from research if available)
- Writing image or video prompts (editor authors all prompts)
- Editorial selections between valid candidates (flag options, don't decide)
- Cut timing, animation, layout (editor's skeleton)
- VO, BGM, SFX, mix (sound-engineer)
- Building the Remotion skeleton (editor)

---

## What `visual` Receives

| Input | Source |
|---|---|
| Channel name + project path | Editor dispatch |
| Beat brief | Editor — beat ID, subject, slot type (image/video), output dir |
| Image prompts | Editor-authored per beat |
| Video prompts + target duration in frames | Editor-authored per beat |
| Pre-sourced archival paths (optional) | Research agent — if real media was found |
| Remotion skeleton TSX path | Editor — the file to wire |

---

## Tool Docs (read before starting)

| Doc | Purpose |
|---|---|
| `channels/<name>/visuals.md` | Channel visual tone — what belongs, what doesn't |
| `channels/<name>/config.md` | Literal values — palette, sizes, spring configs |
| `visual/image-gen.md` | Image generation API — single, manifest, bgless, flex, prompting techniques |
| `visual/video-gen.md` | Video generation API — Veo, prompting techniques, duration control |
| `visual/timeline.md` | Remotion component patterns — slot structure, required props, import conventions |

**If `visual/video-gen.md` does not exist on disk:** generate images only. Flag all video beats as `PENDING: video-gen.md not yet available` in the manifest. Do not stall — complete image beats and report.

---

## Execution Flow

### Per beat

**Step 1 — Check for pre-sourced archival path**
If research provided a file path for this beat, use it. Skip to verification.

**Step 2 — Generate**
If no archival path: generate using editor's prompt.
- Images: `visual/image-gen.md` — use `--mode instant` for 1–5 images, `--bgless` when spec calls for cutout
- Video: `visual/video-gen.md` — use editor's target duration in frames to drive generation params

**Step 3 — Verify with Gemini vision**

Verification criteria differ by type:

*Archival image:*
- Does it show the right subject, right era, right place?
- Is the file intact (not a 404 download, not a placeholder)?

*Generated image:*
- Does it match the prompt subject?
- If `--bgless`: is the background transparent, not a solid fill?

*Video clip:*
- Does the clip match the prompt?
- Is the actual duration ≥ editor's target? If shorter: re-generate or flag.
- Is the file playable (not corrupt)?

**If verification fails:** re-generate (or re-source from a different archival URL) once. If second attempt also fails: write the beat as `unverified — see note` in the manifest and flag to editor. Do not use a wrong asset silently.

**Duration mismatch (video):** If verified clip duration differs from brief's target by more than 10%: flag as `DURATION_MISMATCH: brief=Nf, actual=Mf` in the manifest. Do not silently wire the wrong duration into TSX.

### After all beats

**Step 4 — Write manifest**

`research/media-manifest.md`:

| beat_id | file_path | media_type | source_type | prompt_or_source | target_frames | actual_frames | verification |
|---|---|---|---|---|---|---|---|
| 1.2 | images/beats/b1.2.jpg | image | archival | Wikimedia URL | null | null | verified |
| 2.1 | images/beats/b2.1.png | image | generated | "aerial view..." | null | null | verified |
| 3.4 | video/beats/b3.4.mp4 | video | generated | "crowd at dawn..." | 72 | 74 | verified |

- `target_frames` and `actual_frames`: `null` for images (not applicable)
- Flag beats with no coverage — never silently skip

**Step 5 — Apply manifest to skeleton TSX**

Read `visual/timeline.md` to identify slot conventions before touching the TSX.

For each beat in the manifest:
- **Image slots:** fill `src` prop with manifest file path
- **Video slots:** fill `src` prop, set `durationInFrames` from `actual_frames`, ensure `<Video>` component and required props per `visual/timeline.md`
- **Slot not found in TSX for a beat:** flag to editor — `SLOT_MISSING: no slot found for beat <id>`. Do not invent layout.
- **Slot in TSX with no manifest row (orphan slot):** leave untouched. Flag to editor — `ORPHAN_SLOT: slot exists in TSX for beat <id> but no brief entry found`.

Do not change timing, animation parameters, or layout. Only fill media paths and duration values.

---

## Gap Handling

| Condition | Action |
|---|---|
| No beat brief | Stop. Report missing. |
| No output directory | Stop. Report missing. |
| No prompt for a beat (and no archival path) | Flag: `MISSING: prompt for beat <id> — cannot generate` |
| `video-gen.md` not on disk | Complete image beats. Flag video beats as `PENDING`. |
| Skeleton TSX path not provided | Write manifest only. Flag TSX wiring as skipped. |
| Verification fails twice | Write beat as `unverified — see note`. Flag to editor. |
| Video duration mismatch >10% | Flag `DURATION_MISMATCH` in manifest. Do not silently wire. |
| Slot in TSX but no brief entry | Flag `ORPHAN_SLOT`. Leave untouched. |

---

## Patch Limit

Third pass on the same beat → discard accumulated patch set, re-generate clean from the original prompt.

---

## Agent Metadata

```yaml
name: visual
description: Visual media specialist — generates images and video clips from editor prompts, self-verifies with Gemini vision, writes media manifest, wires assets into Remotion timeline. Does not source archival media (research) or make editorial selections.
model: sonnet
```

---

## Implementation Notes

1. **Rename** `.claude/agents/assets.md` → `.claude/agents/visual.md`
2. **Update** `SKILL.md` — all references to `assets` agent → `visual`; update routing rule and dispatch table
3. **Update** `SKILL.md` channel invariant — "Every specialist dispatch MUST include the channel name" still holds
4. **Create** `visual/video-gen.md` — Veo API spec, prompting techniques, duration control (separate task, unblocks video generation capability)
5. **Note for maps and mograph** — the "generate → verify → place" pattern established here should be reflected in their agent definitions in a follow-up pass
