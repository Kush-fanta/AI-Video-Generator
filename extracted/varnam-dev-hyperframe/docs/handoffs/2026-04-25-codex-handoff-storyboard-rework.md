# Handoff — Storyboard Rework + Channel Freeze + Directing Engine

**Date:** 2026-04-25
**From:** Claude (Opus 4.7) session
**To:** Codex (or any agent picking up the thread)
**Status:** Diagnosis complete. Proposal authored. No code changes yet. User has approved the direction in principle and pushed for full automation.

---

## Where we are in one paragraph

The UGC Dalit render (`projects/ugc-dalit-project/output/full.mp4`) shipped visibly broken. Inspection showed five compositor defects the postflight reviewer missed (text-on-text collisions, placeholder directives rendered as content) plus an encoder bitrate issue. We diagnosed the root cause as a structural commitment — *the channel's visual identity is re-decided at every project's build time* — and traced four cascading problems to it (storyboard.yaml as 137KB contract, decide/build agent split, prose taste files, doctrine carrying defenses the primitives should carry). A reference artifact (Anthropic's design tool output, `Indiapill_claudedesign/`) was studied as a working counter-example. A leadership proposal was written and rendered to PDF. The user then pushed deeper: the storyboard isn't doing creative work, it's a production manifest in disguise; rework needed. The current settled shape: *channel-freeze + scene-direction layer + directing engine that authors scene direction unsupervised from a curated reference library.*

---

## The thread of this session, compressed

1. **User opened with the trace** of the second `/varnam` run (`fbca0b0b...`) and noted the produced video quality was "horrible."
2. **Frame inspection** at 5s, 90s, 250s, 450s, 650s surfaced 5 distinct compositor defects (see `docs/proposals/2026-04-25-channel-freeze-or-loop-tax.md` table for the full list with timestamps).
3. **Root-cause analysis** identified: no z-stack contract; placeholder branch leaks YAML directive strings; reviewer rationalized signal evidence ("96.1% low-novelty" called a measurement artifact); encoder default at 157kbps@1080p.
4. **User asked "what might have caused this?"** — answer: the whole pipeline is symbolic; first human-readable frame is the final mp4; postflight signal tools at 96×54 can't see typography collisions.
5. **User dropped Anthropic design-tool package** at `Indiapill_claudedesign/`. Three-file stack (HTML + animations.jsx + audio_stage.jsx + scenes), no build step, Babel-in-browser, ~178s editorial video, no comparable defects. Critical artifact: `SESSION_LEARNINGS.json` — cost playbook + technical lessons.
6. **User refused feature-comparison framing**, asked for the *thought process* behind the design. Answer: it's loop-first, not artifact-first. They optimized iteration; we optimized the final artifact. Decisions deferred = compounding cost. Constraints as taste (mono ALWAYS uppercase). Anticipated failure modes shipped with primitives. Joint loop design (both agent and user named).
7. **User asked "why our system can't do that"** — surfaced the 10 structural commitments. User dismissed renderer/harness items as swappable, focused on real ones.
8. **The single deepest commitment named:** we design per project, not per channel. Indiapill executes a frozen template. Veritasium looks like Veritasium across 400 videos; the taste IS the brand.
9. **Leadership report authored** at `docs/proposals/2026-04-25-channel-freeze-or-loop-tax.md` (also rendered to .html and .pdf). Two paths: freeze a channel (Path A, recommended) or accept the loop tax (Path B). Pilot scope: 4 weeks, swarajya channel, re-render UGC Dalit as proof.
10. **User mentioned leadership pushing for "hyperframes."** Found it: HeyGen's open-source HTML-video framework, agent-first. Initial response said "fold it in." User corrected: renderer-swap doesn't move the loop tax; tax lives in the *translation layer*, which exists because of the harness shape. The channel freeze IS the harness fix. HyperFrames is useful prior art, not the answer.
11. **User asked why storyboard.yaml didn't deliver** despite being the intended game-changer. Answer: it solved a problem we created. Designed as contract, operated as scratchpad. Encoded channel-level decisions at project granularity. Too rich for slot-fill, too poor for design. Authored separately from validation. Optimized for parallelism that doesn't exist. Became the doctrine substrate, not the deliverable.
12. **User's insight:** "a storyboard without the creative part isn't a storyboard, it's a management framework." All the fields are coordination metadata. The creative work was never *in* the storyboard — it was implicit in prose channel files and re-derived per project, badly.
13. **User asked for rework, still believes in the artifact.** Proposed two-layer reshape: scene direction (creative, ~6 files per project, hand-authored or agent-authored, image-anchored) + beat manifest (mechanical, derived from scene direction, what compositor needs).
14. **User asked "you want me to do the direction?"** Initial answer split it (you author intent, agent expands). User rejected: "this also needs to be automated. what's the benefit of paying for AI then."
15. **Final settled shape:** taste codified into a *channel reference library* (30–50 annotated beats from past work + admired references, with timestamped notes on what makes each work), consumed by a *directing agent* that authors scene direction unsupervised. User reviews 6 scene cards in 30s each. Pure judgment, zero authoring.

---

## Load-bearing insights (carry these, drop the rest)

- **Loop tax lives in the translation layer.** Translation layer exists because of the harness shape (multi-agent decide/build split). Renderer choice (Remotion / HyperFrames / etc.) is downstream and incidental.
- **The storyboard.yaml is the harness shape made flesh.** It exists because handoffs need contracts. Collapse the harness need and you collapse the storyboard.
- **Channel taste belongs in code, not prose.** `channels/<name>/{voice,palette,visuals}.md` are interpretable artifacts that get reinterpreted every project, dropping fidelity. They should be a `kit.tsx` package: PALETTE, LAYER_BANDS, TYPE_SCALE, primitive components.
- **Defenses belong in primitives, not in cross-cutting doctrine.** Indiapill's `common_gotcha_1` lives in the source of the primitive that produces it. Our doctrine is paying interest on Remotion primitives we don't own.
- **Granularity matters: direction lives at scene level (~6 per video), not beat level (~84 per video).** Trying to be creative at beat level forces the artifact to become a manifest.
- **AI's leverage is collapsing labor while keeping judgment.** Asking the user to author intent per scene is underclaiming. Codify the taste in a reference library + directing agent; user becomes a 30-second reviewer per scene.
- **Indiapill is the worked example.** Three files, no build, no schema, no contract, no doctrine — and shipped a clean 178s video. We have all four and shipped a broken 11:53. Architecture matters more than effort.

---

## Artifacts produced this session

Files created (no code changes to running system yet):

- `docs/proposals/2026-04-25-channel-freeze-or-loop-tax.md` — leadership proposal, ~1700 words, footnoted
- `docs/proposals/2026-04-25-channel-freeze-or-loop-tax.html` — self-contained HTML render
- `docs/proposals/2026-04-25-channel-freeze-or-loop-tax.pdf` — 4-page PDF, page-numbered
- `docs/handoffs/2026-04-25-codex-handoff-storyboard-rework.md` — this file

Files NOT yet authored (the obvious next moves):

- `docs/proposals/2026-04-25-storyboard-rework-and-directing-engine.md` — the rework spec, supersedes/extends the channel-freeze proposal. Should fold in: two-layer storyboard (scene direction + derived manifest), directing engine architecture, reference library spec, integration with channel-freeze pilot.
- `channels/swarajya/kit.tsx` — the frozen kit (palette, type, layer bands, primitives with placeholder discipline). Doesn't exist yet.
- `channels/swarajya/references.md` — annotated reference library (30–50 beats). Doesn't exist yet.
- A directing-agent spec (probably `.claude/agents/director.md` or similar). Doesn't exist yet.

---

## The open question / next move

**The user hasn't said "build it" yet.** The session ended at the directing-engine proposal. The natural next move is one of:

1. **Author the storyboard-rework + directing-engine proposal as a follow-on doc**, parallel to the channel-freeze proposal, so leadership has the complete picture before approving the pilot.
2. **Prototype the directing engine on a single UGC Dalit scene** (e.g. s3 Tiwari mechanism — the worst defect) to prove the shape works before formalizing.
3. **Author the swarajya kit first** (frozen visual primitives), since both channel-freeze and directing-engine require it as substrate.

If picking one: option 3 is the structural unblock — neither (1) nor (2) can land without it, and it's the most concrete deliverable. The kit can be authored from the existing UGC Dalit Remotion src tree (`projects/ugc-dalit-project/src/`) by lifting Chapter.tsx, frames.tsx, and the layout constants into a channel-level package, with the placeholder fix baked in (no more rendering YAML directive strings).

Confirm with the user before starting any of the three. The user has been emphatic about (a) automation > authoring and (b) match-mechanism-weight-to-failure-weight (no over-engineering). Both apply.

---

## What to read in what order

If you're picking this up cold:

1. This file (you're here).
2. `docs/proposals/2026-04-25-channel-freeze-or-loop-tax.md` — the leadership-facing version, has the structural diagnosis cleanly.
3. `Indiapill_claudedesign/SESSION_LEARNINGS.json` — the worked counter-example. Read all of it; it's the load-bearing reference.
4. `Indiapill_claudedesign/index.html` + `animations.jsx` (skim) — to understand the loop the design tool runs.
5. `projects/ugc-dalit-project/session_learning.md` — the prior session's audit (backfilled, has trace evidence).
6. `projects/ugc-dalit-project/review/postflight/full.md` — the postflight verdict that missed the real defects.
7. `docs/doctrine.md` — current SDLC primitives. The rework will likely retire some of these (anything storyboard-coupled).
8. `docs/record-book.md` — dev story across sessions. Last 5 rows give recent context.

Frames showing the defects are at `/tmp/vq_5.jpg`, `/tmp/vq_90.jpg`, `/tmp/vq_250.jpg`, `/tmp/vq_450.jpg`, `/tmp/vq_650.jpg` (may have been cleared by now; regenerable via `ffmpeg -ss <t> -i projects/ugc-dalit-project/output/full.mp4 -frames:v 1 -update 1 -q:v 2 /tmp/vq_<t>.jpg`).

---

## User's load-bearing principles for this rework (memory + this session)

- *Match mechanism weight to actual failure weight* — no over-engineering, no hooks for solo studio if root cause is elsewhere.
- *Doctrine is primitives × use cases* — don't invent new frameworks per round.
- *Verify artifacts before dispatching on a ledger* — disk is canon, tasks.md is a report.
- *Reuse agent slots, don't spawn duplicates* — SendMessage to existing names; suffixed names read as churn.
- *Parse intent, not grammar* — short typo'd pushbacks are frame-sharpening, not requests for clarification.
- *(This session)* Automation > authoring. If a human has to do the work, the AI isn't earning its cost.
- *(This session)* Constraints as taste — frozen channel produces coherent shows. Re-deciding per project is amateur.
