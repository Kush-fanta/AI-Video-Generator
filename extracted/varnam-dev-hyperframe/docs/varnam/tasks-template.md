# Project Tasks

Do not create this file by hand. Bootstrap it with:

```bash
python3 scripts/run.py project:intake
```

Backend fallback:

```bash
bash scripts/project/scaffold.sh --from scaffolds/project-intake.sh
```

Project root: `projects/<slug>/`

## Context
- One short summary of the job, constraints, and any locked creative decisions.

## Tasks
- [in_progress] Current task
- [pending] Next task
- [completed] Finished task

## Artifacts
- `task-config.md`:
- `research/findings.md`:
- `story/script.md`:
- `direction/board/index.md`:
- `direction/board/<scene-id>.md`:
- `audio/voiceover.source.txt`:
- `audio/voiceover.mp3`:
- `audio/voiceover.words.json`:
- `audio/voiceover.tagged.txt`:
- `direction/render-manifest.yaml`:
- `images/refs/`:
- `images/beats/`:
- `output/preview.mp4`:

## Next Move
- The single next action to take from the current stage.

## Flow Reminder
- Render manifest must be derived only after `audio/voiceover.words.json` is available.
- Current pass model:
  - core authors `story/script.md` + `direction/board/index.md` (including the per-story design pack) + `direction/board/<scene-id>.md` + `audio/voiceover.source.txt` together.
  - audio derives `audio/voiceover.mp3` and `audio/voiceover.words.json`.
  - editor/tooling derives `direction/render-manifest.yaml` from approved board files + `audio/voiceover.words.json`.
