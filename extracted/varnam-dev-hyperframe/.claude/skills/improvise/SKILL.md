---
name: improvise
description: Reverse engineer any source — channel, video, frame, technique, artifact bundle, runtime pack, or failed run. Decompose what works, then promote it into the correct Varnam surface.
argument-hint: "[channel URL | artifact path | runtime pack | 'again' | feedback]"
---

# Improvise

Reverse engineering system. Takes any source — channel, video, frame, technique, artifact bundle, runtime pack, or failed run — decomposes what works and why, then surgically updates the correct durable surface: channel taste, board-index design-pack doctrine, craft method, HyperFrames runtime practice, primitive/sprite grammar, contracts, or execution specs.

This skill is not the default route for live project redesign.

## How Every Invocation Works

**First move, always:** Read `../varnam/craft/improviser.md` — the full methodology for this repo. Then determine which round this is.

### Scope Boundary

Use `improvise` only when the user is asking for one of these:

- reference study
- post-mortem analysis of produced output
- system learning
- channel, craft, runtime, contract, or execution updates that should persist beyond one project
- primitive/sprite/composition pack learning that should become reusable capability

Do **not** route into `improvise` for ordinary active-project corrections such as:

- "make these frames hit harder"
- "image should carry more of the entertainment"
- "redo the current components"
- "tighten this project's screen language"

Those stay in the normal editor production flow. The editor should expand the note into a bounded downstream brief from existing project context, and rewrite project authority only when canon really changed. `improvise` enters only when the user explicitly wants reference analysis, system learning, or a lasting channel/craft/runtime/contract update.

### Detecting the Round

- **User provides a channel URL** → Round 1. No prior study exists for this reference.
- **User provides a local zip/export/runtime/code artifact** → artifact-bundle pass. Run `python3 scripts/run.py review:artifact-report <path> --report /tmp/varnam-artifact-report.json`, then study the entrypoints and promotion candidates.
- **User asks to create or absorb primitives/sprites/compositions** → runtime-pack pass. Classify as sample/reference, runtime addition, channel companion, or project-only; render proof before promotion.
- **User says "again" or provides feedback on a produced video** → Round N+1. Prior study exists. Read `docs/history/channels/<name>/references.md` and the current channel/craft/runtime/contract surfaces to see what's known.
- **User provides a channel URL that's already in references.md** → Round N+1 on that reference. Don't re-run Round 1.

### Round 1: First Study

1. Load `../varnam/craft/improviser.md` for the full pipeline
2. Run the study pipeline: catalog → select videos → transcripts → heatmaps → structural analysis → **writing mechanics pass** → heatmap cross-reference → visual analysis (Gemini) → audio analysis (Gemini)
3. **Start with zero lenses.** Watch, describe in plain language, group, name. The frameworks emerge from observation.
4. Present hypothesis: "Here's what I found. The gap is in [taste/craft/runtime/contract/execution]. Here's what I'd update."
5. On user confirmation, surgically update the right files
6. Write study breadcrumbs to `docs/history/channels/<name>/references.md` when the input is a channel/reference study

**The writing mechanics pass (step 5b in `../varnam/craft/improviser.md`) is what feeds the Voice section of `design.md`.** Read 2–3 actual transcripts as prose before writing channel voice rules. The channel's sentence patterns and recurring editorial moves can only be extracted from the scripts — not inferred from the topic area or genre. A defence channel does not automatically sound a certain way. Read what it actually sounds like.

### Round N+1: Compare and Push

1. Load `../varnam/craft/improviser.md`
2. Read ALL craft and channel files that previous rounds updated — everything the system already knows
3. Ask: **"What can I not yet explain about why the reference works?"**
4. If user provided feedback → that's a pre-classified finding, trace root cause
5. If user said "again" → watch produced output (Gemini) vs reference, find the delta
6. Use existing lenses, generate new ones if nothing fits, retire exhausted ones
7. Classify gaps (taste / craft / runtime / contract / execution)
8. Surgical update to the right files
9. Present findings and frontier

### Input Types (in signal order)

1. **User feedback** — highest signal. "The pacing felt flat." Skips discovery, goes straight to root cause.
2. **Produced output vs reference** — Gemini comparison. Shows what the system still can't do.
3. **Runtime/artifact bundles** — Claude Design exports, HyperFrames projects, primitive/sprite packs, and media packs. Shows reusable execution patterns.
4. **Reference channel study** — transcripts, heatmaps, visual analysis. Shows what good looks like.
5. **Audience feedback** — YouTube comments, retention on published videos. Noisy but useful for patterns.

### What Gets Updated

| Finding type | Goes to |
|---|---|
| New structural pattern (works across channels) | `.claude/skills/varnam/craft/scripting.md`, another current craft doc, or a new craft doc |
| New anti-pattern from production failure | Channel `design.md` or craft doc anti-patterns |
| Wrong value (cut rate, springs, palette) | Channel `design.md` |
| Missing voice/tone rule | Channel `design.md` |
| Per-story design-pack requirement | `craft/directing.md`, `craft/storyboarding.md`, or core/reviewer execution specs |
| Visual mode or technique | Channel `design.md`, `craft/art-direction.md`, `craft/motion-design.md`, or `craft/primitives-and-sprites.md` |
| Audio/scoring pattern | Channel `design.md` |
| Missing primitive/sprite/composition capability | `craft/primitives-and-sprites.md`, HyperFrames docs, runtime pack, or specialist agent spec |
| Board/render or timing boundary failed | `docs/contracts/*.md`, validators, routed scripts, or handoff knobs |
| Builder/reviewer missed known rule | `.claude/agents/`, reviewer brief, or a subagent spec before patching relevant `craft/*.md` or channel docs |
| New analytical lens | `docs/history/channels/<name>/references.md` |

### Classification Review Gate — Non-Negotiable

Before writing ANY finding to a system file, dispatch a Sonnet subagent to cold-read the proposed change against the target file. The reviewer checks: does this finding contain taste values leaking into craft? Is a runtime capability being hidden in prose? Does the system already know this, making it an execution or contract gap? See `../varnam/craft/improviser.md` § step 7 for the full reviewer prompt.

Verdicts: APPROVE, RECLASSIFY (wrong target), or SPLIT (extract taste values to channel, keep universal principle in craft).

### User Checkpoint — Non-Negotiable

Every round presents findings before writing to system files. The user confirms what to adopt. The improviser proposes — the editor decides.

### Tools

```bash
python3 scripts/run.py review:artifact-report <path> --report /tmp/varnam-artifact-report.json
python3 scripts/run.py trace:manifest --session-jsonl <jsonl> --project projects/<slug> --output projects/<slug>/trace_manifest.json
python3 scripts/run.py render:validate-manifest projects/<slug>
npx hyperframes lint <dir> --json
npx hyperframes compositions <dir>
npx hyperframes render <dir> --quality draft --output out/<slug>-draft.mp4

# Channel catalog
yt-dlp --flat-playlist --print "%(id)s | %(title)s | %(duration)s | %(view_count)s" "CHANNEL_URL/videos"

# Transcripts
yt-dlp --write-auto-sub --sub-lang en --skip-download --write-info-json -o "/tmp/study/%(id)s" "VIDEO_URL"

# Heatmaps
yt-dlp --print "%(heatmap)j" "VIDEO_URL"

# Video download (low quality for Gemini)
yt-dlp -f 18 -o "/tmp/study/%(id)s.mp4" "VIDEO_URL"
```

Gemini media analysis via subagent (upload video, targeted prompts — visual AND audio). For audio: ask timestamp-specific questions ("At 3:45, what instruments are playing? At 7:20 when the narrator pauses, what happens to the music?"). Don't accept "atmospheric background music" — decompose to specific instruments, entry/exit points, mix relationships.

### What NOT to Do

- **Don't clone.** Learn techniques, not personality. "Different" is not "worse."
- **Don't rewrite files wholesale.** Surgical additions only.
- **Don't skip production between rounds.** Round N+1 needs a produced video to compare. Analysis without production is theory without testing.
- **Don't hide runtime gaps in prose.** If Varnam lacks the primitive, sprite, composition, variable interface, or validator, build or route that surface.
- **Don't prescribe what to look for.** Lenses are discovered from observation. If no finding emerges, the system has converged.
