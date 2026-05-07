# Lyria 3 Audio Generation

Invoke through the canonical command router: `python3 scripts/run.py audio:music …` (alias `music`). Do not call `scripts/audio/music.py` directly.

## CLI

```bash
python3 scripts/run.py audio:music \
  --prompt-file projects/<slug>/audio/bgm/<label>.prompt.txt \
  --output projects/<slug>/audio/bgm/<label>.mp3 \
  --model lyria-3-pro-preview
```

| Flag | Required | Notes |
|---|---|---|
| `--prompt-file` | yes | Path to the timestamped prompt text |
| `--output` | yes | Destination MP3 |
| `--model` | no | `lyria-3-pro-preview` (default, up to ~2:20) or `lyria-3-clip-preview` (30s fixed) |

Duration belongs in the timestamped prompt; the CLI does not take a separate `--duration` flag.

## On-disk artifacts

```
projects/<slug>/audio/bgm/
  <label>.prompt.txt     # the exact timestamped prompt submitted
  <label>.mp3            # generated score segment
```

Write the prompt file before generation, alongside the output. The prompt is the read-back artifact for verification (analogous to `audio/voiceover.tagged.txt` for VO).

## API

```
POST https://generativelanguage.googleapis.com/v1beta/models/{model}:generateContent
Header: x-goog-api-key: {GEMINI_API_KEY}
```

| Model | Duration | Speed | Use |
|---|---|---|---|
| `lyria-3-clip-preview` | 30s fixed | ~15s | Transitions, stings, short cues |
| `lyria-3-pro-preview` | up to ~2:20 | ~55s | Full scores, structured pieces |

Output: 48kHz stereo MP3, 192kbps, base64 in response. SynthID watermark on all output.

```json
{
  "contents": [{"parts": [{"text": "prompt"}]}],
  "generationConfig": {"responseModalities": ["AUDIO"]}
}
```

Add `"TEXT"` to responseModalities for lyrics/captions alongside audio.

## Prompt Formula

```
[Timestamps] + Genre + Specific instruments + BPM + Key + Mood
```

### Be Specific About Instruments

Not "Indian instruments" — sitar, tabla, bansuri, tanpura, mridangam. The model knows: kamayacha, nadaswaram, surbahar, santoor, duduk, kora, guqin, hardingfele, komuz, mbira, bandoneón, shakuhachi, gayageum, oud, ney, rubab, balalaika, charango. Use the real terms.

### Native Script for Vocals

**The single most impactful technique.** Prompt in the target language's script for authentic vocal delivery. English prompts produce English-accented singing regardless of requested language.

```
❌  "Female vocalist singing in Odia. Mardala drum."
✅  "ଓଡ଼ିଶୀ ସଙ୍ଗୀତ। ମହିଳା କଣ୍ଠ, ଓଡ଼ିଆ ଭାଷାରେ ଗାଇବା। ମର୍ଦଳ ବାଦ୍ୟ।"
✅  Mixed: "ଜଗନ୍ନାଥ ଭକ୍ତି ଗୀତ — Odissi classical. Mardala drum, sitar."
```

Native script for emotional/devotional terms. English for technical directions. Works across 30+ tested languages.

### Vocal Character via Mood

Lyria translates emotional description into vocal character. It does not follow literal voice directions.

- "intimate, breathy, close-mic" → airy, near-mic melodic vocal
- "ecstatic, building" → full-throated, intense
- Describe feelings, not techniques

### Timestamps + BPM = Tightest Control

```
[0:00-0:15] Intro: Solo tanpura drone, establishing Sa
[0:15-0:45] Verse: Sitar enters, tabla joins softly
[0:45-1:15] Build: Tempo increases, full ensemble
[1:15-1:45] Climax: Energetic tabla solo
[1:45-2:00] Outro: Tanpura drone, fade
```

Duration accuracy within 2-4 seconds of target. Section tags without timestamps let the model expand freely.

### Custom Lyrics

```
[Verse 1]
Lyrics in target language...

[Chorus]
More lyrics...

Style: Instrument list, vocal style, mood.
```

## SFX Fusion

Lyria weaves environmental sound into music when given atmospheric prompts. This is **controllable** — the more specific the mapping, the more precise the integration.

```
"Submarine engine room. The engine hum IS the bass at 60 BPM.
 Sonar pings on beat 4 of every second bar. Tense strings and brass."
```

```
"Mumbai monsoon. Rain = staccato percussion. Traffic = bass.
 Temple bells = melody. The city IS the music."
```

SFX removal works as composition: "When the predator moves, the jungle goes silent" produces a track where environmental sounds filter out at the narrative turning point.

**Default:** one prompt per scene producing unified score + atmospheric SFX. Separate SFX tools only for isolated frame-accurate one-shots.

## Known Limits

| Limit | Detail |
|---|---|
| No speech | Music/singing only. Use TTS for narration. |
| ~2:20 ceiling | Pro model hard-caps. Concatenate for longer pieces. |
| 30s fixed clips | Clip model cannot make short sounds. |
| Flat dynamics | Peaks at 0 dB. Piano/transients suffer. Sustained textures mask it. |
| Single turn | No "make drums louder." Regenerate from scratch. |
| Non-deterministic | Same prompt → different output. No seed. |
| Artist names blocked | Describe the style, never name the player. |
| Copyright fence | Prompts too close to recognizable scores get blocked. Rephrase. |
| Military context | Specific dates/navy names can trigger safety filter. |

### Vocal Contamination

Lyria may generate cinematic vocal content in instrumental-only prompts. Always verify generated scores with Gemini analysis before mixing. If vocals appear in a narration-backed section, regenerate or use only the vocal-free portions. For all narration-backed sections: add "Instrumental only. No vocals. No humming. No chanting." to the prompt. Intentional Lyria vocals for non-narrated sections (transitions, chapter walls, emotional peaks without VO) are worth exploring — the cinematic voice quality is an asset in the right context.

### Image Input

Lyria accepts images as input — pass frame snapshots to steer vibe/atmosphere toward the visual. Useful as a secondary alignment tool when the prompt alone isn't landing the right feel. Quality is imprecise; the text prompt is still primary.

## Confirmed Language Coverage

Hindi, Sanskrit, Tamil, Bengali, Punjabi, Telugu, Malayalam, Gujarati, Kannada, Odia, Kashmiri, Konkani, Maithili, Dogri, Manipuri, Assamese, Rajasthani, Bhojpuri, Tulu, Santali, Chhattisgarhi, Arabic, Persian, Turkish, Mandarin, Japanese, Korean, Yoruba, Portuguese. Sindhi defaulted to English. Bodo produced fabricated syllables.
