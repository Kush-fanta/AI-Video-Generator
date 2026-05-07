# Scripts Registry

Every executable script has a metadata header and an owner. If a script has no
owner, it gets deleted.

## Operating Contract

This repo is agents-first. The `audio`, `visual`, `researcher`, `reviewer`,
`mograph`, and `editor` lanes own the workflows. Scripts are tools those agents
call; they are not the architecture.

Folder rule: place scripts by workflow owner first, then by tool nature only
when ownership is ambiguous. The question is "who reaches for this during
production?", not "what language is this file written in?"

Examples:

- Audio-owned TTS/alignment/subtitle work goes in `scripts/audio/`.
- Visual-owned image/video/screenshot/asset verification work goes in `scripts/visual/`.
- Render-contract wrappers and artifact resolution go in `scripts/review/`.
- Deterministic quality checks go in `scripts/review/` or `scripts/review/benchmarks/`.
- Project bootstrap and asset linking go in `scripts/project/`.
- Claude Code session-trace indexing for postmortems goes in `scripts/trace/`.
- Cross-lane helpers only go in `scripts/shared/` after at least two lanes need them.

Forbidden buckets: `scripts/utils/`, `scripts/misc/`, `scripts/temp/`,
`scripts/python/`, and any folder whose name does not identify a workflow owner
or contract surface.

Filename rule: Python scripts use `snake_case.py`. Command scripts should prefer
`verb_object.py` names (`validate_render_manifest.py`, `verify_assets.py`,
`analyze_media.py`). A plain domain noun is allowed only for canonical lane
entrypoints (`voiceover.py`, `image.py`, `video.py`, `music.py`) or import-only
helpers (`common.py`, `provider_registry.py`, `env_file.py`). Use clear role
suffixes when they fit: `_registry`, `_contract`, `_guard`, `_report`, `_scout`,
`_probe`. Do not add vague files named `helper.py`, `utils.py`, `misc.py`,
`temp.py`, or `script.py`.

Governance rule: `.claude/rules/scripts-governance.md` auto-loads when script
surfaces are touched.

Fast map: `scripts/SCRIPT_MAP.md`.

## Script Metadata Header

Every Python and shell script starts with a comment frontmatter block after the
shebang. This block is the fast agent-facing identity and invocation contract;
the registry below remains the durable ownership record.

Required fields:

| Field | Meaning |
|---|---|
| `varnam_script` | Stable dot-separated logical id, such as `visual.image` or `review.preflight_render`. |
| `owner` | Owning lane or agent; multi-owner is allowed only when the script crosses a real contract boundary. |
| `status` | `live`, `deferred`, or `internal`. |
| `surface` | `python3 scripts/run.py ...`, `direct-only`, `import-only`, `import-or-direct`, or `hook-only`. |
| `purpose` | One-sentence capability summary. |
| `use_when` | One-sentence routing cue for agents. |
| `inputs` | Expected args, manifests, env vars, or import contract. |
| `outputs` | Files, stdout/JSON reports, or exit-code contract. |
| `authority` | Docs/contracts that govern the script. |

Skill and agent files use YAML frontmatter. Script files use comment
frontmatter so they remain valid Python/shell.

## Python Script Shape

New or touched command scripts should be boring enough to teach:

1. Parse CLI args near the bottom.
2. Put provider calls, file IO, and subprocess work in named functions above `main`.
3. Return `0`/non-zero from `main` when the script is command-like; print JSON only when the caller expects a machine report.
4. Put helpers in `scripts/shared/` only after at least two lanes import them.
5. Read provider keys and local runtime knobs through `scripts/shared/env_file.py`; do not read API keys from exported shell state or mutate `os.environ` to simulate loading.
6. Keep provider/model defaults in `scripts/shared/provider_registry.py`; keep taste, channel identity, and editorial choices out of Python helpers.

Dead-code audit for script reconciliation:

```bash
python3 -m vulture scripts tests --min-confidence 60
```

Treat vulture output as candidates, not automatic truth. CLI wrappers, hook
entrypoints, and agent-called scripts can look unused to static analysis; delete
only after checking docs, tests, hooks, and `scripts/run.py`.

Default invocation is `python3 scripts/run.py <command> ...` when a human or
agent wants a stable menu-like surface. Domain scripts keep autonomy and remain
callable directly when an agent needs the full API surface:

- Audio owns `scripts/audio/*`
- Visual owns `scripts/visual/*`
- Research owns `scripts/research/*`
- Editor/mograph own `scripts/project/*`
- Reviewer owns `scripts/review/*`
- Shared helpers live in `scripts/shared/*` only when they are genuinely cross-lane
- Reviewer/mograph own validation, timing, and render gates

Shared defaults live in `scripts/shared/provider_registry.py`. Repo-local secret
lookup lives in `scripts/shared/env_file.py`. Do not duplicate model aliases,
provider defaults, or env parsing inside domain scripts. Defaults are technical
only; wrappers do not make taste decisions (voice persona/identity, image style,
or editorial tone).

## Visual

| Script | Owner | Purpose | Justification |
|---|---|---|---|
| `analyze_media.py` | `visual` | Gemini vision verification - images and video clips | Agents need a deterministic media-inspection primitive before accepting assets or renders. |
| `video.py` | `visual` | Veo 2 video clip generation | Keeps video acquisition batchable instead of burying provider calls in ad hoc prompts. |
| `timeline_images.py` | `visual` | Batch image generation for a project's beat list | Turns timeline decisions into repeatable image jobs with manifest outputs. |
| `image.py` | `visual` | Canonical Gemini image provider runner | Keeps image generation inside the visual lane instead of a separate tools namespace. |
| `screenshot.py` | `visual`, `mograph` | Site-aware capture and single-frame preview utility | Needed for cheap visual proof before burning full renders. |
| `video_clip.py` | `visual` | Deterministic source clip acquisition used by video generation wrappers | Centralizes clip capture so source-video handling is not duplicated. |
| `verify_assets.py` | `researcher`, `visual` | Post-download media verification manifest | Gives agents a concrete pass/fail manifest after downloads. |
| `consistency.py` | `visual` | Character/prop/location consistency via reference images | Preserves visual continuity across generated assets without relying on chat memory. |

## Audio

| Script | Owner | Purpose | Justification |
|---|---|---|---|
| `voiceover.py` | `audio` | Canonical VO entrypoint: direct CLI plus `--jobs` batch mode, Gemini/ElevenLabs generation, alignment, and optional signal post-align | This is the production audio API; deleting it removes the VO lane. |
| `qwen3_align.py` | `audio` | Optional local Qwen3 forced-alignment adapter | Keeps heavy local ML dependencies out of the main repo Python; pairs with Gemini Flash Lite transcript recovery so Gemini-only final timing is not used. |
| `common.py` | `audio` | Shared audio safety/fail helpers | Keeps audio-specific primitives local without broad shared utility creep. |
| `music.py` | `audio` | Lyria score generation from timestamped music prompts | Keeps provider-specific score generation separate from deterministic mixing. |
| `quota_probe.py` | `audio` | ElevenLabs quota check before known-expensive VO dispatch | Prevents known-failing provider calls before spend. |
| `source_closed.py` | `audio`, `core` | Close/verify/invalidate voiceover source handoff records | Stops audio from rendering a mutating source file. |
| `sound_design.py` | `audio` | Deterministic FFmpeg mix manifest runner | Applies authored VO, music, and SFX tracks after assets exist; no provider sourcing side effects. |
| `tts.py` | `audio` | Generic text-to-speech primitive used by voiceover and future audio pipelines | Provider primitive used under the canonical VO workflow. |
| `align_audio.py` | `audio` | Generic forced-alignment / transcription primitive for audio-to-words timing | Required to turn rendered audio into timeline-addressable words. |
| `subtitles.py` | `audio` | Generic words.json to SRT subtitle helper | Converts the canonical words artifact into standard subtitle output. |
| `lock_timing.py` | `audio` | Refresh `audio/timing.lock.json` from approved VO artifacts | Enforces the audio/timeline checksum gate before render. |
| `realign_words_signal.py` | `audio` | Detect minor VO timestamp drift from audio signal and apply bounded word-level nudges | Repairs alignment drift with signal evidence instead of manual timestamp edits. |
| `resolve_anchors.py` | `mograph` | Resolve `timing_mode` events to global frames from words.json anchors | Lets builders bind animation events to VO anchors deterministically. |

## Research

| Script | Owner | Purpose | Justification |
|---|---|---|---|
| `asset_download.py` | `researcher` | Copyright-gated asset downloads via curl/yt-dlp/ffmpeg/screenshot | Gives research a controlled acquisition path with provenance. |
| `video_scout.py` | `researcher` | Pre-download video analysis - metadata, transcripts, segments | Avoids downloading full media before deciding if it is useful. |
| `research_logger.py` | `researcher` | Append-only research operation log | Keeps source work auditable across agent turns. |

## Review

| Script | Owner | Purpose | Justification |
|---|---|---|---|
| `lint_render_identity.py` | `mograph` | Runtime composition identity checks | Blocks composition identity drift before it reaches render. |
| `asset_reuse.py` | `reviewer` | Film-wide repeated asset detection with motif/callback allowances | Catches visual repetition that timing checks cannot see. |
| `artifact_report.py` | `reviewer`, `improviser` | Reverse-engineer local .zip/.html/.jsx artifact bundles into structured reports | Gives reviewer/improviser a deterministic readout before promoting lessons into craft or channel files. |
| `pacing_density.py` | `reviewer` | Pre-render drag-window checks against timing, render files, and render manifest | Moves drag-window failures before expensive renders. |
| `preflight_render.py` | `reviewer` | Pre-render wrapper for the timing contract: words/audio/styles parity + lock checksum validation + runtime duration authority warning | Hard gate before render; prevents stale timing and placeholder leakage. |
| `postflight_render.py` | `reviewer` | Post-render wrapper: timing contract + frame integrity + cut rate + visual novelty + speech masking in one report | First deterministic review pass after render. |
| `validate_render_manifest.py` | `reviewer`, `mograph` | Validate bound render manifests and HyperFrames composition bindings | Enforces the render manifest contract in one place. |
| `timing_contract.py` | `reviewer` | Shared timing-contract checks consumed by the preflight and postflight wrappers | Single implementation of timing rules; avoids wrapper drift. |
| `project_artifacts.py` | `shared` | Public artifact-path helpers for validation wrappers | Centralizes project artifact resolution and legacy catalog fallbacks. |
| `render_hygiene.py` | `reviewer` | Shared placeholder and pre-render hygiene helpers | Keeps placeholder blocking consistent across render gates. |
| `script_registry.py` | `reviewer` | Script metadata, registry, map, and router consistency checker | Prevents script governance drift after reorganizations. |

## Project

| Script | Owner | Purpose | Justification |
|---|---|---|---|
| `project/intake.py` | `editor` | Interactive/non-interactive intake runner, then calls the canonical scaffold | Canonical project creation path; prevents hand-built project drift. |
| `project/scaffold.sh` | `editor` | Canonical bootstrap for `projects/<slug>/`: task-config, tasks, and standard project directories | Shell fallback for deterministic scaffold writes. |
| `project/public_link.py` | `mograph` | Link the active project's `audio/` and `images/` into repo-root `public/` so HTML composition asset paths resolve during render | Prevents broken assets during local render. |

## HyperFrames CLI

Use routed HyperFrames commands for executable composition work:

| Command | Use |
|---|---|
| `python3 scripts/run.py hyperframes:doctor` | Check Node, FFmpeg, FFprobe, Chrome, and Docker readiness |
| `python3 scripts/run.py hyperframes:lint <dir> --json` | Structural composition validation before render |
| `python3 scripts/run.py hyperframes:compositions <dir>` | Resolve composition IDs and durations |
| `python3 scripts/run.py hyperframes:preview <dir>` | Live Studio preview using the production runtime |
| `python3 scripts/run.py hyperframes:render <dir> --output <mp4>` | Render MP4/MOV/WebM output |
| `python3 scripts/run.py hyperframes:info <dir> --json` | Machine-readable project metadata |

## Trace

| Script | Owner | Purpose | Justification |
|---|---|---|---|
| `trace/session_manifest.py` | `improviser` | Build a Claude Code trace manifest from the main JSONL, subagent shards, queue events, hooks, tool edges, token counts, temporary envelopes, and durable artifacts | Gives post-session improviser work a stable trace index before analysis; avoids reconstructing topology from grep. |

## Signal Processing Benchmarks

All review-owned. Run via `review/benchmarks/run_signal_benchmarks.py`.

| Script | Measures | Justification |
|---|---|---|
| `review/benchmarks/cut_rate.py` | Cuts per minute vs target | Quantifies pacing instead of relying on subjective review only. |
| `review/benchmarks/frame_clutter.py` | Element density per frame | Catches overcrowded frames mechanically. |
| `review/benchmarks/frame_integrity.py` | Blank, solid, placeholder, and frozen-frame anomalies | Detects render failures that can look like creative choices in prose review. |
| `review/benchmarks/layout_repetition.py` | Repeated layout patterns across chapters | Finds composition monotony across a chapter. |
| `review/benchmarks/mode_interleave.py` | Visual mode alternation (image/text/data) | Measures whether the visual system is stuck in one mode. |
| `review/benchmarks/reveal_contraction.py` | Reveal animation timing contraction | Catches reveal pacing that collapses under runtime pressure. |
| `review/benchmarks/speech_masking.py` | SFX/music masking of VO frequencies | Protects narration intelligibility in final mix. |
| `review/benchmarks/visual_novelty.py` | Per-beat visual uniqueness | Detects long visual plateaus after render. |
| `review/benchmarks/run_signal_benchmarks.py` | Orchestrates all benchmark runs | Runs the metric suite as one review command. |

## Harness / Hooks

| Script | Owner | Purpose | Justification |
|---|---|---|---|
| `hooks/post_compact_doctrine_reload.py` | harness | PostCompact reminder to reload doctrine and editor rules | Keeps long sessions from drifting after compaction. |
| `hooks/project_scaffold_guard.py` | harness | Blocks manual project bootstrap outside the intake runner / scaffold flow | Enforces canonical project creation. |
| `hooks/render_guard.py` | harness | Guard render commands with pre/post checks | Automatically attaches render gates to render commands. |
| `hooks/team_member.py` | harness | PreToolUse guard plus debug CLI for team membership dispatch | Blocks duplicate team spawns and missing-member messages when the dispatch payload exposes team context; non-team payloads pass through. |

## Root Entry Points

Keep repo-root `scripts/` small. Root contains only navigation and the stable router.

| Script | Owner | Purpose | Justification |
|---|---|---|---|
| `run.py` | `shared` | Canonical script entrypoint router (`python3 scripts/run.py <command> ...`) | Stable command menu so scripts can move without breaking agent prompts. |
| `SCRIPT_MAP.md` | `shared` | Fast navigation map for commands, lanes, root policy, and moved paths | Human-readable map for the script layout. |
| `README.md` | `shared` | Full script ownership registry | Ownership and deletion contract for every script. |

## Shared

| Script | Owner | Purpose | Justification |
|---|---|---|---|
| `shared/env_file.py` | shared | Repo-local `.env` value lookup for provider keys and runtime knobs | One tiny parser keeps API-key access teachable and avoids shell-export drift. |
| `shared/provider_registry.py` | shared | Global provider/model defaults and alias resolution for audio + image runners | Single source for provider defaults used across lanes. |
| `shared/_job_utils.py` | shared | Job queue and parallel execution utilities | Shared only because multiple batch runners use the same job manifest behavior. |
