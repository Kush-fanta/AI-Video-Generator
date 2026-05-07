# Repository Organization

This repo is agents-first. Files live where an agent would look before a human
explains the project.

## Placement Rules

- Primary rule for tools: workflow owner first, tool nature second.
- `channels/<name>/` holds durable taste and identity.
- `.claude/skills/varnam/craft/` holds method: how work should be judged or done.
- `.claude/skills/varnam/tools/` holds tool-facing instructions and API usage.
- `scripts/<lane>/` holds lane-owned execution tools.
- repo-root `scripts/` is only for `run.py` plus script maps/registry docs.
- `projects/<slug>/` holds project artifacts, not reusable code.

Use tool nature to break ties, not as the first folder split:

- `review/` for render contract wrappers, artifact resolution, render-manifest validation, QC checks, and review queue ops.
- `review/benchmarks/` for reusable metric/eval probes.
- `audio/` for timing locks, word realignment, and anchor resolution.
- `hooks/` for agent/runtime guardrails.
- `shared/` only for helpers that multiple lanes already call.

Do not create `utils/`, `misc/`, `temp/`, or language buckets such as `python/`.

## Cleanup Rule

If a file has no clear agent owner, do not keep it as a convenience artifact.
Promote the lesson into channel or craft guidance, then delete or move the file
to the owner that will maintain it.

## Current Script Lanes

- `scripts/audio/`: audio owns voice, timing, alignment, subtitles, music, and mix helpers.
- `scripts/visual/`: visual owns screenshots, image/video dispatchers, source clip acquisition, consistency, and asset verification.
- `scripts/research/`: researcher owns discovery, scouting, downloads, and research logging.
- `scripts/review/`: reviewer/editorial ops own render gates, render-manifest validation, QC checks, benchmarks, and review queue sync.
- `scripts/project/`: editor/mograph own intake, scaffold, and project asset linking.
- `scripts/shared/`: cross-lane Python helpers and provider defaults.
- `scripts/hooks/`: harness owns Claude Code guardrails.

## Agent-First Check

Before adding or keeping a file, answer:

1. Which agent owns this?
2. Which workflow calls it?
3. Is the folder named for that owner/workflow or for a real contract surface?
4. Is it listed in `scripts/README.md` and placed on `scripts/SCRIPT_MAP.md` if it is a route people need to find?
5. Can it be reached through `scripts/run.py` if it is an operator-facing command?
6. Does a real render or deterministic check prove the path still works?
