# Varnam Generation Tools

Varnam's generation layer is agents-first and batch-first.

Agents own the workflow decisions. Scripts are execution tools. The normal
pattern is: the responsible agent writes prompts, lines, or source jobs into a
manifest, then runs the relevant tool once instead of babysitting every asset
call.

`scripts/run.py` is the stable command surface for humans and agents that want a
single menu:

```bash
python3 scripts/run.py image --jobs manifest.json
python3 scripts/run.py voiceover --jobs voiceover_jobs.json
python3 scripts/run.py preflight projects/<slug> --require-lock
python3 scripts/run.py postflight projects/<slug> --video out/<slug>.mp4
```

Domain tools still keep autonomy. Use them directly when the agent needs the
full implementation API:

```bash
python3 scripts/visual/image.py --jobs manifest.json
python3 scripts/audio/voiceover.py --jobs voiceover_jobs.json
python3 scripts/visual/timeline_images.py projects/<slug>
```

Provider and model defaults live in `scripts/shared/provider_registry.py`. Do not copy
model aliases into tool docs or new scripts.

For new jobs, run the intake first:

```bash
python3 scripts/run.py project:intake
```

That is the normal supported bootstrap path. It writes `projects/<slug>/` and the canonical control files there through the shared scaffold command. Do not bootstrap projects under `templates/`.

Backend fallback:

```bash
python3 scripts/run.py project:scaffold --from scaffolds/project-intake.sh
```

Keep manifests, refs, generated assets, and the tiny `tasks.md` in that project folder so the job can resume from any stage.

Image and video jobs can carry optional references.

Use `model_config.max_references` to declare how many references the chosen backend allows. The wrapper validates against that config instead of hardcoding one fixed limit for every provider.

For mood/style refs, write prompts that describe ambience — palette, light, grain, texture — not scenes. The director generates all refs directly via `scripts/visual/image.py`.

## Verbs

- `python3 scripts/visual/timeline_images.py <project_dir>`
- `python3 scripts/audio/voiceover.py --jobs voiceover_jobs.json`
- `python3 scripts/visual/video.py --jobs video_jobs.json`
- `python3 scripts/visual/analyze_media.py --jobs media_analysis_jobs.json`

## Timing Gate (Phase 1)

Run these before render handoff:

- `python3 scripts/run.py project:link-public <project_dir>`
- `python3 scripts/run.py render:preflight <project_dir> --require-lock`
- `python3 scripts/audio/lock_timing.py <project_dir>`
- `python3 scripts/audio/resolve_anchors.py --events <timing-events.json> --words <voiceover.words.json> --fps 30 --out <resolved.json>`

Contract source of truth: `docs/contracts/timing-contract.md`.
`preflight_render.py` is the pre-render wrapper over that contract. `postflight_render.py` is the post-render wrapper and can return `passed`, `failed`, or `partial` when required checks were skipped.

HTML composition asset paths resolve from repo-root `public/`. For projects that use generic paths such as `images/beats/...` and `audio/voiceover.mp3`, link the active project's asset folders into `public/` before `npx hyperframes render`. The public bridge is runtime state, not source-of-record media storage.

Use `timeline_images.py` when the manifest is the project's `timeline.json`. It runs the full image pass, writes a report file, and exits non-zero on partial failures so the caller can retry only the broken ids instead of babysitting every image.

## Current Support

- `scripts/visual/image.py`
  - real
  - provider: `gemini`
  - models:
    - `nano-banana-2` -> `gemini-3.1-flash-image-preview`
    - `nano-banana-pro` -> `gemini-3-pro-image-preview`
  - used directly by image generation flows and by `scripts/visual/timeline_images.py`
- `audio/voiceover.py`
  - real
  - provider: `gemini` and `elevenlabs`
  - supports direct CLI and `--jobs` batch mode
- `visual/video.py`
  - current provider: `source-clip`
  - deterministic acquisition/clipping via `scripts/visual/video_clip.py`
- `visual/analyze_media.py`
  - real
  - provider: `gemini`
  - models:
    - `lite` -> `gemini-2.5-flash-lite`
    - `flash` -> `gemini-flash-latest`
    - `pro` -> `gemini-pro`
  - multimodal understanding for local image, video, audio, and text inputs
  - structured JSON output for description, style, subjects, transcription, QA, compare, and match-to-line tasks

## Manifest Shape

### Image jobs

```json
{
  "provider": "gemini",
  "model": "nano-banana-2",
  "mode": "batch",
  "model_config": {
    "max_references": 3
  },
  "size": "2K",
  "aspect_ratio": "16:9",
  "output_dir": "projects/demo/images",
  "jobs": [
    {
      "id": "scene_01",
      "prompt": "A rain-soaked alley in blue neon.",
      "references": [
        "projects/demo/refs/neon-alley-palette.png",
        "projects/demo/refs/hero-face.png"
      ],
      "output": "scene_01.png"
    }
  ]
}
```

If a batch image entry omits `output`, the direct image tool falls back to `<project-slug>-<job-id>-image.png`.
Use the short image aliases unless you have a specific reason to pin a raw Google model string.
For timeline-driven image generation, `scripts/visual/timeline_images.py` maps each job to the exact output path in the project manifest or its local fallback.
For batch generation, keep one shared image model across the whole manifest.
`--size` is only passed through for `nano-banana-2` and `nano-banana-pro`, because that is where the current Google image docs expose `image_size`.

### Voiceover jobs

```json
{
  "provider": "elevenlabs",
  "defaults": {
    "output_dir": "projects/demo/audio",
    "voice": "George",
    "model": "eleven_v3",
    "stability": "natural"
  },
  "jobs": [
    {
      "id": "intro",
      "text": "Day one of Tom's diet. He was optimistic.",
      "output": "intro.mp3"
    }
  ]
}
```

### Video jobs

```json
{
  "provider": "source-clip",
  "model_config": {
    "max_references": 0
  },
  "defaults": {
    "output_dir": "projects/demo/video",
    "quality": "1080"
  },
  "jobs": [
    {
      "id": "clip_01",
      "url": "https://www.youtube.com/watch?v=...",
      "start": "00:00:10",
      "end": "00:00:20",
      "output": "clip_01.mp4"
    }
  ]
}
```

For the current `source-clip` backend, references are not used and jobs with references will fail validation. Keep the field in the contract so future model-backed video generators can use the same manifest shape.

### Media analysis jobs

```json
{
  "provider": "gemini",
  "defaults": {
    "model": "flash",
    "mode": "describe"
  },
  "jobs": [
    {
      "id": "hero_frame",
      "input": "projects/demo/images/scene_01.png",
      "mode": "extract_style",
      "output": "projects/demo/analysis/hero_frame.json"
    },
    {
      "id": "rough_cut",
      "input": "projects/demo/video/rough-cut.mp4",
      "mode": "match_to_line",
      "query": "Does this shot sell Tom trying and failing to resist the snack?",
      "output": "projects/demo/analysis/rough_cut.json"
    }
  ]
}
```

`analyze_media.py` is for semantic understanding, not technical probing. Use it when you need Gemini to read what is in the media, not when you just need codec metadata.
