# Image Generation

Invoke through the canonical command router: `python3 scripts/run.py image …` (or the explicit alias `visual:image`). Do not call `scripts/visual/image.py` directly. Single images, manifest batches, transparent PNGs — all via flags.

---

## 1. Model Capability Surface

### Model aliases

| Alias | Google model | Sizes | Flex |
|-------|-------------|-------|------|
| `nano-banana-2` | `gemini-3.1-flash-image-preview` | 0.5K, 1K, 2K, 4K | yes |
| `nano-banana-pro` | `gemini-3-pro-image-preview` | 1K, 2K, 4K | yes |

`0.5K` is only available on `nano-banana-2`.

Freshness check 2026-04-29: Google docs list both model IDs as live.

### Multi-image reference array — verified limits

The API accepts references as inline image parts prepended to the prompt. Verified from Google documentation (2026-04-29):

- **nano-banana-2** (`gemini-3.1-flash-image-preview`): up to 10 object/prop/location references + up to 4 character references = **14 total**.
- **nano-banana-pro** (`gemini-3-pro-image-preview`): up to 6 object/prop/location references + up to 5 character references = **11 total**.

The two pools (object and character) have independent caps; you cannot freely redistribute slots between them. The script does not enforce this split at the call site — the caller is responsible for staying within model-appropriate limits.

Practical guidance: 3–5 well-chosen references produce more coherent output than the ceiling. Adding more references increases conditioning weight competition; when references conflict on style or lighting, the model averages them, degrading both.

### What "consistency" means mechanically

The models use visual understanding, not identity tokens. Character consistency is probabilistic — the model maintains facial and costume similarity across generations but does not guarantee pixel-exact reproduction. Object fidelity (props, logos, products) is stronger because shape and color are less ambiguous than faces.

Implications for production:

- Character identity across 10+ beats requires a controlled reference set: front-facing, high-resolution, consistent lighting across reference files. Do not mix candid and staged references in one job.
- When consistency degrades across a large beat run, regenerate with a tighter reference subset rather than adding more refs.
- Identity and style references compete for conditioning weight when mixed in one job. Run style-heavy jobs and identity-heavy jobs separately when the two concerns are both strong.

### Scene compositing

`--bgless` removes the background and outputs RGBA PNG. Use it when the beat places a subject over a motion background or composite layer. Describe the subject only — background isolation is auto-appended to the prompt.

---

## 2. Reference Taxonomy

References do different jobs. Separate them rather than collapsing everything into one adjective soup.

**Style reference** locks palette, texture, grain, and finish. Pass one strong style anchor. Adding multiple style refs averages the looks and weakens the signal. Style refs and identity refs compete for conditioning weight when mixed; separate jobs when both are strong.

**Composition reference** locks framing, spatial hierarchy, and focal depth. Use when the storyboard calls for a precise layout that is hard to describe in text alone.

**Identity reference** keeps a named character, prop, vehicle, or location visually consistent. Source from `direction/refs/<entity-id>/`. Only use approved entries. See Section 3 for the full authorship and consumption contract.

**Evidence reference** proves what the real thing looks like — archival photos, product shots, location stills. Use when a beat must depict a real object or place. Rights and provenance are researcher-owned; visual specialist confirms the file is present and approved before passing it.

If the beat needs consistency, name the reference type explicitly in the manifest job.

---

## 3. Project Refs Register

### On-disk shape

```
projects/<slug>/direction/refs/
  <entity-id>/
    <angle-or-description>.png
  refs.md
```

### Ledger format (`refs.md`)

| entity_id | entity_type | files | source | approved | notes |
|-----------|-------------|-------|--------|----------|-------|
| entity-harbor | location | harbor-wide.png, harbor-dock.png | archival, CC-BY-SA 4.0, Wikimedia | yes | 1890s Bombay harbor |
| entity-raj | character | raj-front.png, raj-profile.png | generated from board beat 1.1 | yes | |
| entity-locomotive | prop | loco-left.png, loco-right.png | archival, public domain | no | awaiting editor approval |

`entity_type` values: `character`, `location`, `prop`, `vehicle`, `event-setting`.

### Authorship rule

A **named entity** is a proper noun or uniquely identified script referent that carries its own `<entity-id>` row in the register — Burzōya, Vishnusharman, the Kalīla wa Dimna BnF Arabe 3465, the Ahmedabad mill exterior. A generic descriptor with no entity-id (a "trade engraving," "a manuscript folio") is not a named entity and does not need an entry.

Every named entity in the script gets a matching image in the refs register. No threshold, no count. If the script names it, it has an entry. The editor may exempt a named entity where a visual referent is not load-bearing, with a justification in the `notes` column.

Reuse depends on occurrence. An entity appearing once gets one image, used in that beat. An entity appearing N times gets the same archival file (or the same AI-generation ref set) reused across all N appearances — that is how continuity is enforced.

`core` authors `refs.md` and the corresponding entity directories during the board pass. The editor approves entries before specialist dispatch. An entity directory without an approved row in `refs.md` is incomplete and must not be consumed.

### Consumption rule

The visual specialist reads `refs.md`, confirms `approved: yes` for the entity named in the beat, collects the files from `direction/refs/<entity-id>/`, and passes them as `--reference-image` (single mode) or as the `references` array (manifest mode).

If a storyboard beat names a registered entity but `refs.md` has no approved entry for it, the specialist flags:

```
MISSING_IDENTITY_REF: <entity-id>
```

Do not invent a substitute. Do not proceed with the beat. Route back to editor.

---

## 4. CLI and Manifest Mechanics

### Modes

| Mode | Cost | Latency | Use when |
|------|------|---------|----------|
| `instant` | Standard | ~8-12s per image | 1-5 images, iteration |
| `flex` | 50% off | 1-15 min | 5+ images, cost-sensitive |

Flex is synchronous — same API call with `service_tier: 'flex'`. Requests may queue 1-15 min. Returns 503/429 when capacity is full.

### Single image

```bash
python3 scripts/run.py image \
  --prompt "..." \
  --output projects/<slug>/images/beat-01.png
```

### With reference image

```bash
python3 scripts/run.py image \
  --prompt "Same graphic novel style. ..." \
  --reference-image projects/<slug>/direction/refs/entity-raj/raj-front.png \
  --output projects/<slug>/images/beat-05.png
```

`--reference-image` is repeatable. Pass each file as a separate flag. Stay within model-appropriate limits (Section 1).

### Flex mode

```bash
python3 scripts/run.py image \
  --prompt "..." \
  --mode flex \
  --output projects/<slug>/images/beat-01.png
```

### Transparent PNG (bgless)

```bash
python3 scripts/run.py image \
  --prompt "Gold trophy, studio lighting, centered" \
  --bgless \
  --output projects/<slug>/images/stickers/trophy.png
```

`--bgless` defaults size to `0.5K`, auto-detects and removes the background, outputs RGBA PNG. Override size with `--size`.

### Bgless guidelines

- Describe subject only — background isolation is auto-appended
- Solid, opaque, high-contrast subjects work best
- Cartoon/graphic styles produce cleaner edges than photorealistic
- `studio lighting, centered on frame` reduces shadow cast
- Do not use for: glass/smoke/water (partial transparency), fine hair on photorealistic

### Manifest mode (multiple images)

```bash
python3 scripts/run.py image --jobs manifest.json
python3 scripts/run.py image --jobs manifest.json --bgless
python3 scripts/run.py image --jobs manifest.json --job-id trophy
python3 scripts/run.py image --jobs manifest.json --mode flex --workers 2
```

### Manifest format

```json
{
  "model": "nano-banana-2",
  "size": "1K",
  "aspect_ratio": "9:16",
  "output_dir": "images/beats",
  "jobs": [
    {
      "id": "beat-01",
      "prompt": "...",
      "file": "beat-01.png"
    },
    {
      "id": "beat-02",
      "prompt": "...",
      "file": "beat-02.png",
      "size": "2K",
      "references": [
        "direction/refs/style-anchor/anchor.png",
        "direction/refs/entity-raj/raj-front.png"
      ]
    }
  ]
}
```

The `references` array accepts any taxonomy type — style, composition, identity, or evidence. Identity refs come from `direction/refs/<entity-id>/`. Confirm `approved: yes` in `refs.md` before including any identity ref path.

Per-job overrides: `size`, `aspect_ratio`, `model`, `file`, `references`.

### Parameters

| Flag | Required | Notes |
|------|----------|-------|
| `--prompt` | single mode | Image description |
| `--output` | single mode | Output file path |
| `--jobs` | manifest mode | Path to JSON manifest |
| `--job-id` | no | Run one job from manifest |
| `--workers` | no | Default 4. Parallel workers for manifest mode |
| `--mode` | no | `instant` (default) or `flex` |
| `--bgless` | no | Transparent PNG. Defaults size to `0.5K` |
| `--size` | no | Default `1K` (or `0.5K` with `--bgless`) |
| `--aspect-ratio` | no | Default `16:9` |
| `--model` | no | Default `nano-banana-2` |
| `--reference-image` | no | Repeatable. Stay within model limits (Section 1) |

### Troubleshooting

| Issue | Fix |
|-------|-----|
| `Missing GOOGLE_API_KEY` | Set `GOOGLE_API_KEY` in repo `.env` |
| No image data returned | Prompt filtered — simplify content |
| Flex timeout | Flex is best-effort, 1-15 min. Retry on 503/429 |
| Style inconsistency | Regenerate with fewer, more coherent reference images |
| Bgless ragged edges | Use cartoon style; preview on dark background |
| Identity drift across beats | Tighten reference set to front-facing, consistent-lighting files; reduce total ref count |
| `MISSING_IDENTITY_REF` | Entity not approved in `refs.md`. Route to editor before proceeding |
