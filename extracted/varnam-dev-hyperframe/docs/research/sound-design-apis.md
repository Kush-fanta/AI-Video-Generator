# Sound Design API Research

Research date: 2026-03-23

## BGM Generation

### ElevenLabs Music API (Selected)

- **Endpoint:** `POST https://api.elevenlabs.io/v1/music`
- **Auth:** `xi-api-key` header
- **Python SDK:** `elevenlabs` package — `client.music.compose()`
- **Input:** `prompt` (text), `music_length_ms` (3000–600000ms), `model_id` ("music_v1"), `force_instrumental` (bool), `seed` (int)
- **Output:** Streamed binary audio (MP3, PCM, etc. via `output_format` query param)
- **Duration:** 3s to 600s (10 min)
- **Pricing:** Billed per generation, available to all paid users
- **Notes:** Also supports `composition_plan` for detailed section/instrument control. Streaming endpoint available at `/v1/music/stream`.

### Suno API

- **No official public API.** Third-party wrapper services exist but are unofficial.
- Not suitable for production integration.

### Stability Audio / Udio

- No publicly documented REST APIs found with standard auth flows.

## SFX Generation

### ElevenLabs Sound Effects API (Selected)

- **Endpoint:** `POST https://api.elevenlabs.io/v1/sound-generation`
- **Auth:** `xi-api-key` header
- **Python SDK:** `elevenlabs` package — `client.text_to_sound_effects.convert()`
- **Input:** `text` (description), `duration_seconds` (0.5–30), `prompt_influence` (0–1, default 0.3), `model_id` (default `eleven_text_to_sound_v2`), `loop` (bool)
- **Output:** Streamed binary audio
- **Pricing:** 40 credits per second when duration specified
- **Notes:** Model understands natural language and audio terminology.

## SFX Sourcing

### Freesound.org API (Selected)

- **Search endpoint:** `GET https://freesound.org/apiv2/search/text/`
- **Auth:** `token` query parameter (API key, no OAuth needed for search + preview downloads)
- **Search params:** `query`, `filter` (e.g. `duration:[0 TO 10]`), `sort`, `fields`, `page_size`
- **Sound detail:** `GET https://freesound.org/apiv2/sounds/<id>/`
- **Preview downloads:** No OAuth needed. Fields: `previews.preview-hq-mp3`, `previews.preview-hq-ogg`
- **Full download:** `GET https://freesound.org/apiv2/sounds/<id>/download/` — requires OAuth2
- **License:** Sounds have various CC licenses; preview quality (128kbps MP3) sufficient for video production
- **Get API key:** https://freesound.org/apiv2/apply

### Pixabay Audio

- Undocumented / limited API. Not suitable.

## Implementation Decisions

| Feature | API | Key Env Var |
|---------|-----|-------------|
| BGM generate | ElevenLabs Music | `ELEVEN_LABS_API_KEY` |
| SFX generate | ElevenLabs Sound Effects | `ELEVEN_LABS_API_KEY` |
| SFX source | Freesound.org | `FREESOUND_API_KEY` |
