# Script Map

This is the navigation map. `scripts/README.md` is the ownership registry, and
each script's comment metadata header is the local identity/surface summary.

Read this file when deciding whether a script should exist, where it belongs,
whether it is callable through `scripts/run.py`, and whether a new tool is
actually a duplicate.

## Contract Surfaces

| Surface | Meaning | Rule |
|---|---|---|
| menu-routed | Stable command in `scripts/run.py` | Use for common human/operator or cross-agent entrypoints. |
| direct tool | Script agents may call directly | Keep when the full CLI surface matters. |
| import-only | Helper module, not a command | Must be shared by real callers; otherwise keep helper local. |
| hook-only | Claude Code hook entrypoint | Must map to a configured hook event. |
| deferred | Parked capability | Document why it exists; do not imply it is production-default. |

## Folder Rule

Segregate tools by workflow owner first, then by tool nature when ownership is
ambiguous.

- If one agent owns and maintains it, put it in that agent/workflow lane.
- If many agents call it but one domain owns the contract, put it in the domain lane.
- If many domains genuinely own it equally, put only the shared helper in `scripts/shared/`.
- If humans or agents need a stable command, expose it through `scripts/run.py`.

Do not create junk drawers such as `scripts/utils/`, `scripts/misc/`,
`scripts/temp/`, or language/type buckets such as `scripts/python/`.

## Filename Rule

Python script filenames use `snake_case.py`.

- Prefer `verb_object.py` for command scripts, such as `validate_render_manifest.py`, `verify_assets.py`, and `analyze_media.py`.
- Allow a plain domain noun only for canonical lane entrypoints, such as `voiceover.py`, `image.py`, `video.py`, and `music.py`.
- Allow noun names for import-only helpers when the role is specific, such as `common.py`, `provider_registry.py`, and `env_file.py`.
- Use clear role suffixes when they fit: `_registry`, `_contract`, `_guard`, `_report`, `_scout`, `_probe`.
- Do not add vague filenames such as `helper.py`, `utils.py`, `misc.py`, `temp.py`, or `script.py`.

## Current Command Surface

These are the routes implemented by `scripts/run.py`.

| Need | Command | Owner | Status | Why it exists |
|---|---|---|---|---|
| Create a project | `python3 scripts/run.py project:intake` | editor | live | User-facing project brief capture and normalization. |
| Scaffold from locked intake | `python3 scripts/run.py project:scaffold` | editor | live | Deterministic backend writer for `projects/<slug>/`. |
| Link project assets for render | `python3 scripts/run.py project:link-public` | mograph | live | Makes active project assets available to HTML composition paths during render. |
| Pre-render gate | `python3 scripts/run.py render:preflight` | reviewer | live | Stable pre-render timing and hygiene gate. |
| Post-render gate | `python3 scripts/run.py render:postflight` | reviewer | live | Stable post-render timing and signal-analysis aggregate. |
| Reverse-engineer artifact bundle | `python3 scripts/run.py review:artifact-report <path> --report <json>` | reviewer, improviser | live | Converts local .zip/.html/.jsx bundles into a structured report before craft/channel promotion. |
| Validate render manifest | `python3 scripts/run.py render:validate-manifest` | reviewer, mograph | live | Enforces the render manifest contract. |
| HyperFrames doctor | `python3 scripts/run.py hyperframes:doctor` | mograph, reviewer | live | Checks the runtime environment before composition work. |
| HyperFrames lint | `python3 scripts/run.py hyperframes:lint <dir> --json` | mograph, reviewer | live | Structural validation for HTML composition projects. |
| HyperFrames compositions | `python3 scripts/run.py hyperframes:compositions <dir>` | mograph, reviewer | live | Lists composition IDs and resolved durations. |
| HyperFrames preview | `python3 scripts/run.py hyperframes:preview <dir>` | mograph, reviewer | live | Live Studio preview using the HyperFrames runtime. |
| HyperFrames render | `python3 scripts/run.py hyperframes:render <dir> --output <mp4>` | mograph, reviewer | live | Renders the executable HTML composition project. |
| Generate images | `python3 scripts/run.py visual:image` | visual | live | Stable wrapper for the canonical image provider runner. |
| Generate/acquire video | `python3 scripts/run.py visual:video` | visual | live | Stable wrapper for batch source-video jobs. |
| Analyze media for review | `python3 scripts/run.py visual:analyze` | visual, audio (cross-domain) | live | Gemini-backed multimodal analysis used by visual QC and audio scoring passes. |
| Acquire source clip | `python3 scripts/run.py video:clip` | visual | live | Stable wrapper for low-level clip acquisition. |
| Generate voiceover | `python3 scripts/run.py audio:voiceover` | audio | live | Stable wrapper for VO generation, alignment, and subtitles. |
| Generate music score | `python3 scripts/run.py audio:music` | audio | live | Stable wrapper for Lyria score generation. |
| Run sound-design subcommands | `python3 scripts/run.py audio:sound-design` | audio | live | Stable wrapper for the deterministic FFmpeg mix/SFX runner (e.g. `audio:sound-design mix`). |
| Lock final timing | `python3 scripts/run.py audio:lock` | audio | live | Stable wrapper for audio↔words timing lock. |
| Source-closed handshake | `python3 scripts/run.py audio:source` | audio | live | Stable wrapper for `close`/`verify`/`invalidate` of mutating sources. |
| Build session trace manifest | `python3 scripts/run.py trace:manifest` | improviser | live | Indexes Claude Code JSONL + subagent shards before post-session analysis. |

## Lane Map

| Lane | Folder | What belongs here | What does not belong |
|---|---|---|---|
| audio | `scripts/audio/` | VO, TTS, alignment, subtitles, timing locks, music/mix helpers | Visual generation, render review gates |
| visual | `scripts/visual/` | image/video dispatch, screenshots, source clips, media verification, visual consistency | Research discovery, claim/source logging |
| research | `scripts/research/` | discovery, scouting, rights-gated downloads, research logs | Post-download visual QA, render checks |
| review | `scripts/review/` | render gates, render-manifest validation, QC checks | Source acquisition, provider generation |
| benchmarks | `scripts/review/benchmarks/` | calibrated signal metrics and benchmark fixtures | One-off render debugging |
| project | `scripts/project/` | intake, scaffold, public asset linking | Per-project creative authoring |
| trace | `scripts/trace/` | Claude Code session trace indexing for improviser/postmortem work | Render QC, project artifact validation |
| hooks | `scripts/hooks/` | Configured Claude Code event guards and hook support scripts | General-purpose script helpers, manual preflight CLIs |
| shared | `scripts/shared/` | import-only helpers used across lanes | Single-lane convenience functions |

## Script Metadata

Every executable script carries a comment frontmatter block immediately after
the shebang. The block is valid syntax for Python and shell, and gives agents a
fast routing contract before they read implementation details.

Required fields:

```text
# ---
# varnam_script: <lane.subject>
# owner: <agent-or-lane>
# status: <live|deferred|internal>
# surface: <scripts/run.py command|direct-only|import-only|import-or-direct|hook-only>
# purpose: <one sentence>
# use_when: <one sentence>
# inputs: <args/manifests/env/import contract>
# outputs: <files/stdout/report/exit-code contract>
# authority: scripts/README.md; scripts/SCRIPT_MAP.md
# ---
```

`varnam_script` is a stable dot-separated logical id, not a full filesystem
path. It should usually mirror the lane plus subject, such as
`audio.voiceover`, `visual.image`, `review.preflight_render`, or
`shared.provider_registry`. Keep it stable across purely mechanical file moves
unless the script's real capability changes.

The file header is authoritative for ownership, status, and invocation surface.
This map is the navigation layer.

Filename rule:

- Prefer subject/capability nouns, such as `voiceover.py`, `timing_contract.py`,
  and `media_verification.py`.
- Avoid bare nouns when one lane has multiple meanings; add the capability
  facet when needed.
- Avoid imperative prefixes in filenames, such as `generate_*`, `validate_*`,
  `analyze_*`, and `download_*`. Keep actions in `scripts/run.py` commands,
  CLI help, and docs.
- Import-only helpers must say `surface: import-only`; hook entrypoints must say
  `surface: hook-only`.

## Direct Tools By Lane

These scripts are callable directly by agents. Some also have menu-routed
commands; the direct surface remains because agents sometimes need the full CLI.

### Audio

| Script | Status | Why it exists | Not a duplicate of |
|---|---|---|---|
| `scripts/audio/voiceover.py` | live | Canonical VO orchestration: TTS, alignment, subtitles, and batch jobs. | `tts.py`; this is the workflow surface, not the provider primitive. |
| `scripts/audio/tts.py` | live | Provider TTS primitive used by `voiceover.py` and low-level debugging. | `voiceover.py`; this should stay below the public VO workflow. |
| `scripts/audio/align_audio.py` | live | Generic alignment/transcription primitive for timed words. | `realign_words_signal.py`; this is initial alignment. |
| `scripts/audio/qwen3_align.py` | live | Optional local Qwen3 forced-alignment adapter. | `align_audio.py`; this isolates the heavy qwen-asr runtime and keeps Gemini Flash Lite as transcript recovery, not final timing. |
| `scripts/audio/subtitles.py` | live | Encodes canonical words JSON into SRT. | `voiceover.py`; this is reusable output formatting. |
| `scripts/audio/lock_timing.py` | live | Writes `audio/timing.lock.json` from approved VO artifacts. | `timing_contract.py`; this writes the lock, the contract checks it. |
| `scripts/audio/realign_words_signal.py` | live | Bounded waveform-based repair for minor word drift. | `align_audio.py`; this is post-alignment repair. |
| `scripts/audio/resolve_anchors.py` | live | Resolves VO word anchors to global frames for mograph timing. | `lock_timing.py`; this binds animation events, not locks artifacts. |
| `scripts/audio/music.py` | live | Lyria score generation from timestamped music prompts. | `sound_design.py`; this creates score assets, it does not mix them. |
| `scripts/audio/source_closed.py` | live | Close/verify/invalidate source handoff records for voiceover inputs. | `voiceover.py`; this gates source readiness, it does not render audio. |
| `scripts/audio/quota_probe.py` | live | ElevenLabs character quota check before expensive VO dispatch. | `tts.py`; this is a preflight spend check, not a provider runner. |
| `scripts/audio/sound_design.py` | live | Deterministic FFmpeg mix manifest runner for authored VO, music, and SFX assets. | `voiceover.py`; this is post-asset mixing, not VO generation. |

### Visual

| Script | Status | Why it exists | Not a duplicate of |
|---|---|---|---|
| `scripts/visual/image.py` | live | Canonical image provider runner and base primitive for batch flows. | `timeline_images.py`; this is the provider runner. |
| `scripts/visual/timeline_images.py` | live | Converts project `timeline.json` entries into image jobs for `image.py`. | `image.py`; this is the project batch wrapper. |
| `scripts/visual/video.py` | live | Batch source-video acquisition dispatcher. | `video_clip.py`; this routes manifest jobs. |
| `scripts/visual/video_clip.py` | live | Low-level source clip acquisition/cutting primitive. | `video.py`; this handles one clip request. |
| `scripts/visual/analyze_media.py` | live | Vision-model semantic inspection of images/video/audio outputs. | `screenshot.py`; this understands media, it does not capture it. |
| `scripts/visual/verify_assets.py` | live | Rights/usability verification gate after downloads. | `asset_download.py`; this accepts or rejects acquired media. |
| `scripts/visual/consistency.py` | live | Reference-image continuity workflow for characters, props, and locations. | `image.py`; this coordinates references for generation. |
| `scripts/visual/screenshot.py` | live | Quick page/frame capture for cheap proof before full renders. | `analyze_media.py`; this captures evidence. |

### Research

| Script | Status | Why it exists | Dedup note |
|---|---|---|---|
| `scripts/research/asset_download.py` | live | Canonical rights-gated acquisition with policy checks, transport selection, and provenance. | Keep. This is the acquisition source of truth. |
| `scripts/research/video_scout.py` | live | Pre-download intelligence: metadata, transcripts, and useful timestamp windows. | Keep; may absorb search-only YouTube behavior. |
| `scripts/research/research_logger.py` | live | Append-only researcher operation audit trail. | Keep; separate from discovery/download. |

### Review

| Script | Status | Why it exists | Not a duplicate of |
|---|---|---|---|
| `scripts/review/preflight_render.py` | live | Thin pre-render wrapper over timing and hygiene checks. | `timing_contract.py`; this is the stable CLI surface. |
| `scripts/review/postflight_render.py` | live | Aggregates timing checks plus deterministic post-render analyzers. | Benchmark scripts; this orchestrates them. |
| `scripts/review/artifact_report.py` | live | Reverse-engineers local artifact bundles into structured implementation reports. | `trace/session_manifest.py`; this inspects artifact code/assets, not Claude session topology. |
| `scripts/review/timing_contract.py` | live | Shared timing contract implementation used by preflight/postflight. | Wrappers; this is the rule source. |
| `scripts/review/validate_render_manifest.py` | live | Render manifest schema, capability, and composition-binding validator. | `mode_interleave.py`; this validates contract shape. |
| `scripts/review/asset_reuse.py` | live | Film-wide repeated asset gate with declared reuse allowances. | `visual_novelty.py`; this checks authored/reused assets. |
| `scripts/review/pacing_density.py` | live | Pre-render drag-window gate against timing, film, and render manifest. | `cut_rate.py`; this catches long holds before render. |
| `scripts/review/lint_render_identity.py` | live | Runtime identity lint for fonts, color, and motion drift. | Component validation; this is channel identity focused. |
| `scripts/review/script_registry.py` | live | Checks metadata, README, map, and `scripts/run.py` consistency. | Vulture/manual review; this catches registry drift. |

### Benchmarks

Benchmarks are calibrated regression metrics. They are not one-off QC scripts.

| Script | Signal | When it runs | Why it exists |
|---|---|---|---|
| `scripts/review/benchmarks/run_signal_benchmarks.py` | suite runner | calibration/regression | Runs frozen fixtures against analyzer expectations. |
| `scripts/review/benchmarks/cut_rate.py` | hard reset density, longest hold | post-render | Catches coverage collapse. |
| `scripts/review/benchmarks/visual_novelty.py` | low-change plateau | post-render | Catches dead motion across smooth edits. |
| `scripts/review/benchmarks/layout_repetition.py` | structural repetition | post-render | Separates layout sameness from general novelty. |
| `scripts/review/benchmarks/frame_clutter.py` | hierarchy overload | post-render | Catches overcrowded frames. |
| `scripts/review/benchmarks/frame_integrity.py` | blank/solid/placeholder/frozen frames | post-render | Catches render-floor failures before vision review. |
| `scripts/review/benchmarks/speech_masking.py` | VO intelligibility vs mix energy | post-render | Catches narration masking. |
| `scripts/review/benchmarks/reveal_contraction.py` | payload-beat contraction | post-render | Catches weak reveal emphasis. |
| `scripts/review/benchmarks/mode_interleave.py` | visual mode alternation | storyboard/spec time | Catches authored structure collapse before render. |

### Project

| Script | Status | Why it exists | Not a duplicate of |
|---|---|---|---|
| `scripts/project/intake.py` | live | User-facing brief collector plus JSON/non-interactive wrapper. | `scaffold.sh`; this normalizes the request. |
| `scripts/project/scaffold.sh` | live | Deterministic writer for canonical project files/directories. | `intake.py`; this writes the workspace. |
| `scripts/project/public_link.py` | live | Links active project assets into `public/` for HTML composition renders. | Intake/scaffold; this is render-path wiring. |

### Trace

| Script | Status | Why it exists | Not a duplicate of |
|---|---|---|---|
| `scripts/trace/session_manifest.py` | live | Builds a compact manifest from Claude Code main JSONL, subagent shards, queue events, hooks, tool edges, token counts, temporary envelopes, and durable project artifacts. | `session_learning.md`; this indexes raw trace topology before analysis, it does not write findings. |

## Import-Only Helpers

| Script | Owner | Why it exists | Current callers |
|---|---|---|---|
| `scripts/audio/common.py` | audio | Centralizes audio safety settings and fail helpers. | `align_audio.py`, `tts.py`, `music.py` |
| `scripts/shared/_job_utils.py` | shared | Manifest/path/job helpers for batch-first scripts. | `voiceover.py`, `sound_design.py`, `analyze_media.py`, `timeline_images.py`, `video.py` |
| `scripts/shared/env_file.py` | shared | Reads repo `.env` values without relying on exported shell state. | `image.py`, `analyze_media.py`, `audio/common.py`, `quota_probe.py` |
| `scripts/shared/provider_registry.py` | shared | Single source for provider/model aliases and technical defaults. | `voiceover.py`, `tts.py`, `image.py` |
| `scripts/review/project_artifacts.py` | shared | Canonical project artifact resolution and legacy catalog fallback for gates. | `timing_contract.py`, `postflight_render.py` |
| `scripts/review/render_hygiene.py` | reviewer | Placeholder-string scanning for render gates. | `timing_contract.py` |

## Hook Scripts

| Script | Event/scope | Why it exists | Dedup note |
|---|---|---|---|
| `scripts/hooks/post_compact_doctrine_reload.py` | PostCompact | Reminds agents to reload doctrine after compaction. | Keep. |
| `scripts/hooks/project_scaffold_guard.py` | project writes/tool calls | Blocks manual project bootstrap outside canonical flow. | Keep hook input parsing local for auditability. |
| `scripts/hooks/render_guard.py` | render commands | Attaches pre/post render checks around render commands. | Keep hook input parsing local for auditability. |
| `scripts/hooks/team_member.py` | Agent/SendMessage PreToolUse | Blocks duplicate team spawns and missing-member messages when team context is present. | Non-team payloads without `team_name` pass through; manual `verify/list` remains for debugging. |

## Dedup / Merge Candidates

These are not automatic deletion orders. They are the current cleanup queue.

No active dedup candidates after this pass.

## Wishlist / Gap Log

| Gap | Desired state | Notes |
|---|---|---|
| Research discovery contract | One canonical discovery/scout flow before `asset_download.py` | `video_scout.py` is now the remaining scout surface; deleted weak `youtube_search.py` and `asset_finder.py`. |
| Hook helper module | Do not add one unless hook logic becomes too large to audit locally | Claude Code hooks are command boundaries; self-contained parsing is intentional. |
| SFX sourcing/generation lane | Add a dedicated, tested provider script before using SFX generation/source APIs in production | Removed untested provider subcommands from `sound_design.py`; the mixer is live and deterministic only. |
| Signal docs parity | Ensure signal-processing docs mention every benchmark, including `frame_integrity.py` | Current map treats all benchmark scripts as first-class. |
| Naming cleanup | Rename imperative filenames only when behavior changes or churn is justified | `analyze_media.py`, `verify_assets.py`, and `asset_download.py` remain clear but not stylistically perfect. |
| Script-map generation | Keep `scripts/review/script_registry.py` strict enough to catch drift | Prevents route/doc drift like the old Supabase and deferred-route mismatches. |

## Moved Paths

Old paths are historical only. Do not add compatibility shims unless a real
external caller requires one.

| Old path | Current path |
|---|---|
| `scripts/video_clip.py` | `scripts/visual/video_clip.py` |
| `scripts/intake.py` | `scripts/project/intake.py` |
| `scripts/scaffold.sh` | `scripts/project/scaffold.sh` |
| `scripts/public_link.py` | `scripts/project/public_link.py` |
| `scripts/preflight_render.py` | `scripts/review/preflight_render.py` |
| `scripts/postflight_render.py` | `scripts/review/postflight_render.py` |
| `scripts/validate_render_manifest.py` | `scripts/review/validate_render_manifest.py` |
| `scripts/timing_contract.py` | `scripts/review/timing_contract.py` |
| `scripts/project_artifacts.py` | `scripts/review/project_artifacts.py` |
| `scripts/render_hygiene.py` | `scripts/review/render_hygiene.py` |
| `scripts/timing/lock_timing.py` | `scripts/audio/lock_timing.py` |
| `scripts/timing/realign_words_signal.py` | `scripts/audio/realign_words_signal.py` |
| `scripts/timing/resolve_anchors.py` | `scripts/audio/resolve_anchors.py` |
| `scripts/hooks/source_closed.py` | `scripts/audio/source_closed.py` |
| `scripts/hooks/quota_probe.py` | `scripts/audio/quota_probe.py` |
| `scripts/qc/asset_reuse.py` | `scripts/review/asset_reuse.py` |
| `scripts/qc/pacing_density.py` | `scripts/review/pacing_density.py` |
| `scripts/qc/lint_render_identity.py` | `scripts/review/lint_render_identity.py` |
| `scripts/benchmarks/*` | `scripts/review/benchmarks/*` |
| `scripts/harness/*` | `scripts/hooks/*` |
| `scripts/provider_registry.py` | `scripts/shared/provider_registry.py` |
| `scripts/utils/_job_utils.py` | `scripts/shared/_job_utils.py` |

## Add-A-Script Checklist

1. Pick the owning lane first.
2. Search this map for an existing primitive, wrapper, helper, or wishlist item.
3. Use tool nature only to choose inside broad lanes, such as `review/` vs `review/benchmarks/`.
4. Put the file under that lane unless it is `run.py` or registry documentation.
5. Add the metadata header.
6. Add it to `scripts/README.md`.
7. Add or update `scripts/SCRIPT_MAP.md`.
8. Add or update the `scripts/run.py` command only if humans/operators need a stable route.
9. Add intentionally parked work to `Wishlist / Gap Log` or mark it `status: deferred`.
10. Run `python3 -m vulture scripts tests --min-confidence 60`.
