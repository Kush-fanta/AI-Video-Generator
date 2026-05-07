# Media Index

The visual lane does not improvise from memory. It works against a project media inventory.

`research/media-index.md` is that inventory. It is the reusable asset surface for the current project.

It is not the same thing as `research/media-manifest.md`.

- `research/media-index.md` = everything available and usable
- `research/media-manifest.md` = which asset covers which beat or slot in the current build

## Why it exists

Without an index, the visual lane re-hunts the same folders, misses already-cleared assets, or repeats the same mill / dock / crowd shot across multiple beats because there is no stable view of what the project already has.

The index is the anti-duplication and reuse-audit surface.

## Who updates it

- `researcher` updates it when real media is found or downloaded
- `visual` updates it when generated media is created, verified, or assigned into slots

The lane currently dispatched for media work owns the file during that dispatch. Other lanes can reference it but must not silently rewrite it.

## Required file

Path: `research/media-index.md`

If it does not exist yet, create it before generation or wiring starts.

## Minimum row shape

| asset_id | local_path | media_type | source_type | source_detail | rights_status | verified | current_use | notes |
|---|---|---|---|---|---|---|---|---|
| `asset-b1-archival-01` | `research/media/shipyard-1974.jpg` | image | archival | Wikimedia Commons URL | CC-BY-SA 4.0 | yes | available | port scene wide shot |
| `asset-b2-gen-01` | `images/beats/b2.1.png` | image | generated | prompt: "..." | generated-internal | yes | beat `2.1` | close crop |

## Field meanings

- `asset_id`: stable local identifier for discussion and manifest references
- `local_path`: exact file on disk
- `media_type`: `image`, `video`, `document`, `audio`, `screenshot`
- `source_type`: `archival`, `generated`, `document`, `screenshot`, `official-video`
- `source_detail`: source URL or prompt text
- `rights_status`: exact license or usage status
- `verified`: `yes`, `no`, or `unverified`
- `current_use`: `available`, `beat <id>`, `slot <id>`, or `blocked`
- `notes`: short reuse / framing / subject note

## Visual-lane rules

Before generating:

1. Read `research/media-index.md` and `research/media-manifest.md` if they exist.
2. Check whether the assigned beat or slot is already covered by a verified asset.
3. Reuse only when the asset actually matches the beat brief. Do not force-fit a vaguely similar image.
4. If the same asset is already dominating multiple nearby beats, prefer a fresh candidate unless repetition is intentional.

After generation or wiring:

1. Add or update the asset row in `research/media-index.md`
2. Mark `current_use` with the beat or slot that now owns it
3. Keep `research/media-manifest.md` as the beat-to-asset decision surface

## Research-lane rules

Researcher should land rights-clear discoveries here even before the editor has assigned them to exact beats.

That means `current_use` can stay `available` until the visual lane or editor turns it into a concrete beat assignment.

## Hard rules

- Unknown rights means the row can exist only as `blocked`, not as usable coverage
- Missing file on disk means remove or correct the row immediately
- `research/media-manifest.md` must never be used as a substitute for the full index
- Do not claim reuse coverage from memory; prove it with index rows
- Generated beat media should land under `images/beats/` or `video/beats/`; reusable references under `images/refs/`, `video/refs/`, `research/media/`, or `research/screenshots/`
