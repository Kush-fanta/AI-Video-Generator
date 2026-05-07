# ADR-005: The Improviser — Reverse Engineer the Source

## Status: Experimental (2026-04-10)

## Context

The GCC video lacked structure. Not because the channel identity was wrong or the production pipeline failed — the system didn't know HOW to structure a 20-minute investigation video. The writing craft doc had a 5-block arc for 8-15 minute pieces. Investigation format is fundamentally different.

The immediate fix was studying AevyTV (@aevytv) — 5 transcripts, 4 heatmaps, Gemini visual analysis — and writing the investigation structure into `craft/writing.md`. That one-shot fix proved the muscle works. But the deeper problem wasn't "no mechanism to learn from references" — it was "no mechanism to take ANY source, decompose why it works, and write that understanding into the system." The improviser doesn't care if the source is a channel, a single frame, or a motion technique. The decomposition is the same muscle applied to different inputs. Subtle patterns — pinboard anchoring, history-to-current oscillation, agenda establishment — only become visible after the obvious ones are absorbed and production exposes what's still missing.

## Decision

Add an **improviser** — a reverse engineering system that takes any source, decomposes the what and why, and writes findings into the system. One muscle, any source, deeper each round. The next production run absorbs what was learned. Taste (channel identity) or craft (execution ability) — whichever layer the gap lives in — gets the surgical update.

### The Loop

1. User provides a source — a channel, a video, a frame, a technique, feedback on output
2. Improviser studies the reference (yt-dlp transcripts + heatmaps + Gemini video analysis)
3. Reads all current craft/channel files — everything already known
4. Asks: "What can I not yet explain about why the reference works?"
5. Classifies each gap as taste, craft, or execution
6. Surgically updates the right file
7. Next production uses the updated system
8. User says "again" → Round N+1, forced deeper because obvious patterns are already absorbed

### Key Design Choices

**No intermediate artifacts.** Findings go directly into craft and channel files. No pass files, no analysis documents. If a finding isn't worth putting in a system file, it wasn't worth finding. `references.md` per channel tracks what was studied and when.

**Three input types — all sources feeding one decomposition muscle.** Reference channels (yt-dlp pipeline), produced output (Gemini comparison), user/audience feedback. User feedback is highest-signal — it lands at whatever resolution the system needs next.

**Self-generating frameworks.** The improviser starts with zero analytical lenses. It watches, describes in plain language, groups related observations, names each group. Those names become the first lenses. Each round can generate new lenses, retire exhausted ones, split or merge as understanding sharpens. The analytical vocabulary is discovered from observation, not prescribed.

**Gap classification.** Every finding gets classified:
- **Taste gap:** system knows HOW but values are wrong → update channel files
- **Craft gap:** system doesn't know HOW → update craft files
- **Execution gap:** system knows both but subagent didn't deliver → reviewer/builder issue
- **Intent gap:** the goal wasn't locked or drifted mid-production → task config pattern (see ADR-006)

**Depth is emergent.** No prescribed resolution layers. The read-before-analyze rule (read what you know, then look for what you can't explain) naturally forces each round deeper. Round 1 sees macro structure. Round N sees whatever Round N-1's production exposed as still missing.

## What Changed

| File | Change |
|---|---|
| `craft/improviser.md` | New — the learning loop, round architecture, lens system, gap classification, tool chain |
| `craft/writing.md` | Added investigation format (5-move structure), inner loop cadence, paradox hooks, evidence-after-narrative rule, revelation vs summary closings — all from Round 1 AevyTV study |
| `channels/indiapill/references.md` | New — tracks AevyTV study, Round 1 findings, visual analysis, frontier |
| `SKILL.md` | Added improviser to craft table |

## Evidence (Round 1 Results)

Studied 5 AevyTV videos. Pipeline: yt-dlp catalog → transcripts → heatmaps → Gemini video upload.

**Structural finding:** 5-move investigation architecture (paradox hook → personal ground → escalation ladder → proof of alternative → agency transfer). Consistent across all 5 videos.

**Heatmap-confirmed rules:**
- Contradiction/paradox moments peak engagement (Roads 12:53 = 1.0, Air 12:43 = 1.0, BigFood 11:21 = 0.975)
- Exposition without payoff within 20 seconds → dead zone
- Closings that reveal → replays. Closings that summarize → near-zero retention.

**Visual finding (Gemini):** AevyTV is image-dominant with professional CGI. Classified as taste difference from India Pill, not a gap. Mode switching frequency and overlay-heavy transitions noted as learnable technique.

## Risks

- The improviser could over-fit to a single reference channel. Mitigation: studying multiple references, classifying "different" vs "better," user checkpoint before writing to system files.
- Self-generating lenses could produce junk frameworks. Mitigation: lenses that stop producing findings get retired. The user validates which findings get written.
- Round depth could plateau. Mitigation: production failures are the forcing function — you can't plateau if each video exposes new gaps.

## Relationship to ADR-006

The improviser is the production engine's feedback sensor. It watches produced output, compares against references, and identifies where the engine failed — taste, craft, execution, or intent. ADR-006's task config introduces the intent layer; the improviser's gap classification now includes intent gaps. See ADR-006 for task config patterns and intent gap handling.

## What This Doesn't Solve

- **Decomposition depth.** The improviser can observe patterns ("they use close-ups of hands") but can't yet reverse engineer production recipes from finished output ("here's the spring config and layer stack that produces that look"). This is the growth edge — each round should push decomposition deeper, from observation to reproducible spec.
- The improviser can't evaluate its own output. It still needs the user's eye to know when something "feels off."
- It doesn't replace the reviewer agent — execution quality is a different loop.
- It can't learn from channels with no public content (competitors who don't publish process).
