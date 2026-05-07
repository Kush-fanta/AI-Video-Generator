# ADR-002: Enforcement Layer — Rules, Validation, Hooks

## Status: Superseded by ADR-008; enforcement runtime removed in commit e8feca7 (2026-04-14)

This ADR documents the removed rules/hooks/validation-stack design. Keep it as
historical context for why the enforcement layer existed and what it caught, but do
not treat `.claude/rules/`, hook wiring, or these scripts as current runtime surfaces.

## Context

Varnam has strong craft docs — editing.md, visual-timeline.md, scoring.md, sound-design.md. They encode years of production learnings. The problem: agents don't follow them.

In the bodyguard-satellites production (2026-04-04), the agent:

- Buried 20 visual assets at 30% opacity as wallpaper (craft says "interleave 50/50", "images argue not illustrate")
- Used one background per 30-second beat (craft says "every beat gets coverage, not a single image")
- Hardcoded beat durations instead of deriving from VO timestamps (craft says "words.json is the timing spine")
- Shipped broken word alignment with 40-second phantom gaps (no validation existed)
- Never launched a reviewer (craft says "Sonnet reviewer runs alongside builders")
- Looped 8-second video clips instead of slowing them
- Called ElevenLabs 3x without checking credits

Every one of these failures had a craft doc that said the right thing. The agent read the docs at session start and then forgot them at the moment of action.

**The gap is not knowledge. It is enforcement.**

## Decision

Three enforcement layers, each catching what the previous one misses:

### Layer 1: Path-triggered rules (`.claude/rules/`)

Claude Code loads rules with `paths` frontmatter when the agent reads/writes files matching those globs. This puts the checklist in context at the exact moment of decision — not at session start when it's too early to act on.

```
.claude/rules/
  remotion-build.md     — fires when touching remotion/src/
  image-gen.md          — fires when touching images/ or GenerateImage
  voiceover-prep.md     — fires when touching voiceover*.txt
  alignment-check.md    — fires when touching *.words.json
  scoring-check.md      — fires when touching sound_design or scoring files
  pre-render.md         — fires when touching render scripts or output dirs
```

Each rule is a short checklist (5-8 items) that the agent must verify before proceeding. Not prose — imperative checkboxes.

**Example: `.claude/rules/remotion-build.md`**

```markdown
---
paths: ["**/remotion/src/**"]
---
## Before building or modifying Remotion compositions

1. Beat durations MUST be derived from words.json timestamps — never hardcoded
2. Each beat >10s MUST have 3+ internal Sequence cuts (not one background)
3. Visual assets are a shared pool — the same image/video CAN appear in multiple beats
4. No image/video at <50% opacity — if it's not visible, don't use it
5. Videos: slow via playbackRate to fill beat, never Loop
6. Text-dominant moments and media-dominant moments alternate within beats
7. Run validate_alignment.py if words.json was modified this session
```

**Why rules, not CLAUDE.md:** CLAUDE.md loads everything at start. Rules load contextually. A 200-line CLAUDE.md full of checklists becomes noise. A 10-line rule that fires when you open a Remotion file is signal.

**Why not just better craft docs:** Craft docs are essays that teach principles. Rules are checklists that enforce them. Both are needed. The craft doc explains *why*. The rule says *stop and check*.

### Layer 2: Validation scripts (`scripts/`)

Code that checks things. Agents are probabilistic; scripts are deterministic. When a rule says "validate alignment," a script does the actual checking.

```
scripts/
  validate_alignment.py   — word gaps, spans, duration match, auto-fix
  validate_timeline.py    — (exists) extend with cut density, opacity audit
  preflight_render.py     — meta-validator: runs all checks before render
```

**`validate_alignment.py`** — runs after any word alignment:

```python
# Checks:
# 1. No gap between consecutive words > 3s (collapse to 0.3s)
# 2. No single word spanning > 2s (compress to 0.3s, shift rest)
# 3. Total span within 5% of audio file duration
# 4. After speedup: recompute factor = original_duration / actual_duration
#
# Output: fixed words.json + report of what was corrected
# Exit code: 0 if clean or auto-fixed, 1 if unfixable
```

**`preflight_render.py`** — runs before any render:

```python
# Reads the Remotion composition source and checks:
# 1. TOTAL_DURATION within 5% of audio file duration
# 2. Each beat has at least 2 Sequence children (cut density)
# 3. No opacity prop < 0.5 on BgVideo/BgImage
# 4. No Loop component (slow instead)
# 5. words.json exists and passes validate_alignment
# 6. All referenced image/video files exist in public/
#
# Exit code: 0 pass, 1 fail with itemized report
```

**Why scripts, not just rules:** Rules are context — the agent sees them and should comply. Scripts are code — they produce pass/fail results regardless of whether the agent "remembered." Rules say "you should check." Scripts actually check.

### Layer 3: Hooks (automatic enforcement)

Claude Code hooks run shell commands before/after tool calls. They don't require agent cooperation — they execute automatically.

```json
{
  "hooks": {
    "pre-tool": [
      {
        "tool": "Bash",
        "pattern": "remotion render",
        "command": "python3 scripts/run.py render:preflight $PROJECT_DIR",
        "block_on_failure": true
      }
    ],
    "post-tool": [
      {
        "tool": "Bash",
        "pattern": "voiceover.py",
        "command": "python3 scripts/validate_alignment.py $PROJECT_DIR/audio/*.words.json"
      }
    ]
  }
}
```

**Why hooks:** Rules depend on agent compliance. Scripts depend on agents calling them. Hooks run regardless. They are the last line of defense.

**Why hooks are Layer 3, not Layer 1:** Hooks are rigid — they fire on string pattern matches, not semantic understanding. A rule that says "check cut density" adapts to context. A hook that blocks `remotion render` is a blunt instrument. Use hooks only for checks with clear pass/fail criteria (alignment validation, file existence, duration match). Use rules for judgment calls (is this image arguing or wallpapering?).

## The Layers Working Together

```
Agent starts building Remotion slides
  ↓
Layer 1: .claude/rules/remotion-build.md loads into context
  → Agent sees checklist: "3+ cuts per beat, shared asset pool, no dim wallpaper"
  → Agent follows (or doesn't — rules are advisory)
  ↓
Agent finishes building, runs render command
  ↓
Layer 3: Hook fires preflight_render.py before render
  ↓
Layer 2: preflight_render.py checks composition
  → FAIL: "Beat 3 has 1 Sequence child (need 3+), opacity 0.3 on BgVideo"
  → Render blocked. Agent must fix.
  ↓
Agent fixes, re-runs render
  ↓
Layer 2: preflight_render.py passes
  ↓
Render proceeds
  ↓
Reviewer agent watches rendered output (enforced by SKILL.md)
  → Catches remaining issues scripts can't check (visual quality, narrative coherence)
```

## What This Does NOT Solve

1. **Creative judgment.** No rule can enforce "this image is arguing, not wallpapering." That requires taste. The craft docs teach taste; rules can't replace it.

2. **Novel situations.** Rules encode past failures. New failure modes will still get through. The system learns by adding rules after each production.

3. **Subagent compliance.** Subagents run in their own context. Rules in `.claude/rules/` load for the main agent, not for subagents. Subagent compliance comes from their agent definitions and the specs the editor writes.

4. **User-level override.** The user can always say "skip the checks." The enforcement layer should not fight the user — it should fight the agent's tendency to forget.

## Implementation Plan

### Phase 1: Rules (1 hour)

Write 6 rule files in `.claude/rules/`. Immediate impact, zero infrastructure.

### Phase 2: Validation scripts (2-3 hours)

`validate_alignment.py` and `preflight_render.py`. These have the highest ROI — alignment bugs and timing drift are the most common failures.

### Phase 3: Hooks (1 hour, after scripts work)

Wire hooks to trigger scripts automatically. Depends on Phase 2.

### Phase 4: Evaluate (next production)

Run a full production with all three layers active. Document what the enforcement caught, what it missed, and what it blocked unnecessarily. Write ADR-003 with findings.

## Risks

**Over-enforcement:** Too many rules create friction. Agent spends more time checking than creating. Mitigation: start with 6 rules, add only when a real failure justifies it.

**False positives:** Validation scripts may block legitimate creative choices (e.g., intentionally dim background at 0.3 opacity for a quote slide). Mitigation: scripts report warnings, not hard blocks, for judgment-dependent checks. Only block on objective failures (missing files, broken alignment).

**Rule rot:** Rules written for past failures may not apply to future formats. Mitigation: each rule includes a "why" comment. If the "why" no longer applies, delete the rule.

## Alternatives Considered

**1. Better craft docs only:** Already tried. Doesn't work. Agents read docs and forget them. Rejected.

**2. Longer CLAUDE.md with all rules:** Overloads the context window. A 500-line CLAUDE.md becomes noise. Path-triggered rules are scoped and timely. Rejected as primary mechanism.

**3. Mandatory reviewer before user sees anything:** Adds latency to every iteration. User wants fast feedback loops during iteration, not perfection at every step. Accepted as complementary to rules, not replacement.

**4. Fully automated pipeline (no agent judgment):** Removes the creative flexibility that makes the system valuable. The agent's ability to adapt to novel situations IS the product. Enforcement should constrain the agent's worst instincts, not replace its best ones. Rejected.

## Results — First Production (Tax Reform 2026, 2026-04-04)

Status: Partially Validated. Trace: `789f92d2-fd1e-401d-97ec-9c538a8a8fc5.jsonl`

### Pipeline Reconstruction

| Step | What happened | Time |
|------|--------------|------|
| 1 | `/varnam` → SKILL.md loaded | 0:00 |
| 2 | PDF read (pages 1-5, 6-10) | 0:01 |
| 3 | Agent asked channel/platform question | 0:02 |
| 4 | Read craft/writing.md, craft/editing.md, tools/remotion.md, tools/voiceover.md (~1000 lines) | 0:03 |
| 5 | Read bodyguard-satellites code as reference (Root.tsx, styles.ts, slides, components — 7 files) | 0:05 |
| 6 | Wrote narrative.md + voiceover.txt | 0:08 |
| 7 | ElevenLabs TTS failed (quota exhausted) → manual switch to Gemini | 0:10 |
| 8 | Scaffolded Remotion from bodyguard-satellites (package.json, tsconfig, index, styles, components) | 0:12 |
| 9 | Wrote 10 slide components | 0:15 |
| 10 | Read words.json → mapped 215 words to beat boundaries | 0:17 |
| 11 | First render (720p preview) | 0:19 |
| 12 | Self-reviewed 7 frames → caught layout issues | 0:20 |
| 13 | 15+ edits to fix layouts | 0:22 |
| 14 | Second render → reviewed 10 frames | 0:24 |
| 15 | Full-res stills → confirmed clean | 0:26 |
| 16 | Final 720p render | 0:28 |

### Layer-by-Layer Verdict

**Rules (Advisory) — Did NOT fire during production.** Zero evidence in trace that rule content was injected during the build phase. The agent only read rule files during post-mortem self-analysis. Rules were present but their impact is unverifiable.

**Hooks (Enforcement) — Inconclusive.** `preflight-render.sh` should have fired on `npx remotion render`. Hook output is not captured in JSONL traces — cannot confirm firing. Need explicit hook logging.

**Templates — Never loaded.** Zero template files accessed. Agent copied structure from bodyguard-satellites instead. Templates exist but the agent doesn't know to load them — SKILL.md mentions them in a table but doesn't gate steps on template loading.

**Reviewer — Was self-review, not dedicated reviewer.** No `Agent` tool calls in the entire trace. Agent rendered frames, read them as images, caught layout issues. Effective for mechanical problems. Did not catch creative gaps (no images, VO quality) — user had to flag these.

### What Slipped Through

1. **No images generated.** Agent treated PDF as pure data, replicated layout in code. Zero visual media. `image-gen.md` rule never fired because no image files were touched.
2. **Voiceover quality.** First VO was "AI slop" (user). `voiceover-direction.md` template never loaded. Second VO (user-demanded) was better — proper Gemini AUDIO PROFILE with direction.
3. **ElevenLabs failure with no fallback.** Quota exhausted. Manual detection and retry wasted time.
4. **Layout issues.** Title overflow, content pushed by `justifyContent: "center"`. Caught in self-review but shouldn't have happened.

### What Actually Drove the Speed Improvement

23-minute production was faster than bodyguard-satellites, but NOT because of enforcement:

| Factor | Impact |
|--------|--------|
| Simpler source material | PDF is pure text/data vs 12 images + 8 videos + narrative |
| Working reference project | Copied structure from bodyguard-satellites |
| Opus self-review | Model capability, not enforcement feature |
| words.json timing | Alignment concept worked — unclear if from rule, SKILL.md, or prior context |

### Corrected Metrics

| Metric | Bodyguard Satellites | Tax Reform 2026 |
|--------|---------------------|-----------------|
| Time to first render | ~3 hours | ~23 minutes |
| Versions before usable | 5+ | 2 (user demanded second pass) |
| User corrections needed | 15+ | 3 (images, VO quality, font) |
| Reviewer passes | 0 (never launched) | 0 (self-review only) |
| Templates loaded | 0 | 0 |
| Image treatment | 30% opacity wallpaper | No images at all |
| VO quality | Decent narration | "AI slop" → better on 2nd pass |

### Decisions from Results

**Keep:** words.json → beat timing, agent self-review loop, SKILL.md pipeline structure, hook wiring architecture.

**Fix:**
1. Template loading must be gated, not optional — block Remotion writes if templates haven't been read, or move critical content into rules
2. Dedicated reviewer, not self-review — self-review catches layout, misses creative gaps
3. TTS fallback in voiceover.py — `--fallback gemini` flag
4. VO quality gate — compare voiceover.txt against source + template before TTS
5. Image planning step — require coverage plan before Remotion build
6. Hook logging — `echo "HOOK FIRED: $0"` to verify firing in post-mortem

**Investigate:**
1. Do rules inject context on Write to new files, or only on Read/Edit of existing?
2. Is copying a working project always faster than loading templates? If so, templates should BE scaffolding scripts.
3. Can PreToolUse hooks check whether specific files have been Read in the session?

### Core Finding

**The enforcement layer was largely bypassed.** Advisory rules don't change behavior. Templates that aren't loaded don't help. Self-review doesn't catch creative quality gaps. The agent optimizes for speed (copy from reference) over quality (load templates, plan images, craft VO).

**The core problem:** Agents take the shortest path, not the best path. Enforcement must make the best path the shortest path — scaffolding scripts that embed templates, quality gates that block progression, and dedicated reviewers that catch what self-review misses.

## References

- ADR-001: Channels, Craft, and Tools (the knowledge layer this ADR enforces)
- Bodyguard-satellites production session (2026-04-04) — the failure that motivated this ADR
- Tax-reform-2026 production session (2026-04-04) — first test of enforcement layer
- Claude Code hooks documentation: hook configuration for pre/post tool call automation
- `.claude/rules/` path-triggered rules: Claude Code memory documentation
