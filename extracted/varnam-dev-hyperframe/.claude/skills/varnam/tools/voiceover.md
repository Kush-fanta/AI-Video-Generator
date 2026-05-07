# Voiceover

Invoke through the canonical command router: `python3 scripts/run.py audio:voiceover …` (alias `voiceover`). Do not call `scripts/audio/voiceover.py` directly.

Voiceover generation for supported providers: Gemini and ElevenLabs.

## Voiceover Contract

Five rules. No exceptions.

1. **Only spoken text goes to TTS.** No markdown headers, no YAML frontmatter, no `## METADATA` blocks, no visual stage directions, no image prompt notes. Strip everything that isn't meant to be spoken aloud.
2. **No SSML.** ElevenLabs v3 does not support `<break>`, `<phoneme>`, `<prosody>`. These cause errors. Gemini uses natural-language prompts, not SSML.
3. **Spell out all numbers.** "nineteen seventy-eight" not "1978". "four hundred crore rupees" not "400 crore". "twenty-seven thousand crore" not "27,000 crore". TTS reads digits unpredictably.
4. **Every non-English word in its native script.** Hindi in देवनागरी (`संकल्प` not "sankalp"), Odia in ଓଡ଼ିଆ, Tamil in தமிழ், Bengali in বাংলা, Telugu in తెలుగు. This is not optional. TTS engines pronounce native script far better than Latin transliteration. If the narrator says "लोग कहते हैं", write it in Devanagari — not "log kehte hain". Applies to single words, phrases, and full sentences in any Indian language.
5. **Budget 15-20% silence.** Wall-to-wall narration forecloses sound design. Build in 3-5 second gaps at emotional peaks, tonal transitions, and section breaks. These gaps are where the score breathes.

---

## ElevenLabs v3

Default TTS provider. v3 is a performance engine — audio tags are director's cues that tell the voice how to act.

### Live API Limitation: Chunk Continuity

Live test on 2026-05-05: ElevenLabs rejects `previous_text` and `next_text` when `model_id` is `eleven_v3`.

Do not send those fields for v3. The `/with-timestamps` endpoint works for v3 and returns native word timing, but long scripts still need local chunking and local audio stitching without server-side text continuity context. Preserve performance continuity by splitting only at paragraph, section, or emotional-boundary breaks; never split inside a reveal, sentence, or tag-driven beat.

Other ElevenLabs models may accept `previous_text` / `next_text`; the script only sends those fields for non-v3 models.

### Voice Selection

The editor specifies the voice in the spec. Use that voice. Tags refine delivery -- they don't transform the voice's character. **Never reuse a voice from another channel.**

| Voice | Style |
|-------|-------|
| **Rajesh** | Calm, smooth, Indian accent |
| **Voice of God** | Deep, authoritative, slow |

Stability: `creative` (most expressive) / `natural` (default, balanced) / `robust` (consistent, less responsive to tags).

### Audio Tags

Words in square brackets are performance cues — v3 interprets them as direction, not speech.

**Emotions & Tone:**
```
[excited] They found it — buried under the courtyard for three hundred years!
[sorrowful] She never saw her country again.
[with quiet fury] Every document was destroyed.
[deadpan] That was the plan all along.
[curious] But where did the money actually go?
[mischievously] Nobody checked the second ledger.
```

**Vocal Reactions:**
```
[sighs] Another committee. Another report.
They opened the vault. [gasps] It was empty.
[laughs] That's the official version, anyway.
[clears throat] Let me be precise about this.
[crying] Forty-seven children. Gone.
[exhales] It was over.
```

Variations work: `[laughs harder]`, `[starts laughing]`, `[sigh of relief]`.

**Delivery Direction:**
```
[whispers] We should not be here.
[slowly] Four… hundred… crore… rupees.
[with rising intensity] First Qom. Then Tabriz. Then Tehran.
[as if sharing a secret] The British had a word for this.
[stammers] I — I didn't authorize that.
```

**Accents & Character Voices:**
```
[strong Indian accent] On the seventh of January…
[British accent] The East India Company had other ideas.
[deep voice] This is the story they didn't want told.
```

**Combining Tags** — two max per line:
```
[whispers][urgent] Move. Now.
[sarcastic][curious] Oh, and who approved THAT?
```

### Complete ElevenLabs Script Example

```
[deep voice]

India's bodyguard satellites. [matter-of-fact] What they can do to Chinese satellites... is the real story.

[with quiet intensity] In mid twenty-twenty-four... a Chinese spacecraft manoeuvred to within ONE kilometre of an Indian mapping and ground-monitoring satellite in Low Earth Orbit.

[deadpan] Neither ISRO nor the Ministry of Defence commented publicly.

India's only proven deterrent? A kinetic kill missile -- tested once, in twenty nineteen, under Mission Shakti. [matter-of-fact] But firing it creates debris that endangers everyone's satellites... including India's own.

[slowly] A deterrent you cannot use... is not a deterrent.

[with rising intensity] The scale.

Over three thousand trackable debris fragments from China's two-thousand-and-seven ASAT test -- eighty percent will remain in orbit for decades.

[exhales] No debris. No visible damage. Plausible deniability.
```

### Punctuation as Pacing

| Mark | Effect | Use |
|------|--------|-----|
| `…` | Weighted pause — gravity, anticipation | Before reveals, dates, amounts |
| `—` | Pivot pause — shorter, conversational | Mid-sentence asides, turns |
| `.` | Full stop — clean, definitive | End of complete thought |
| `?` | Rising intonation | Rhetorical questions |
| `CAPS` | Stress on one word | Max 1-2 per paragraph |

### Text Structure

- **Short paragraphs.** One idea per paragraph. Single-sentence paragraph is a punch.
- **Line breaks** (no empty line) create subtle micro-pauses within a thought.
- **No SSML.** v3 does not support `<break>`, `<phoneme>`, `<prosody>`.
- **Spell out numbers.** `nineteen seventy-eight`, not `1978`.
- **Phonetic spelling** if v3 mispronounces a term (`Oudh` → `Awadh`).

---

## Gemini

Use Gemini only when the editor specifies it (`--provider gemini`). Structure the prompt as a direction sheet, not inline tags.

### Prompt Structure

```markdown
# AUDIO PROFILE: [Speaker Name]
## "[One-line character description]"

## THE SCENE: [Physical setting]
[2-3 sentences describing the recording environment. Close-mic? Studio? Intimate?
The energy, not the room dimensions.]

### DIRECTOR'S NOTES
Style: [Calm, intelligent, urgent, conspiratorial, etc.]
Pacing: [Measured, rapid-fire, deliberate slowdowns before reveals, etc.]
Accent: [Specific accent -- "Indian English from Delhi", not just "Indian".]

### SAMPLE CONTEXT
[Optional. 1-2 sentences of context about what this narration is for,
so the model understands the world.]

#### TRANSCRIPT
[The actual text to be spoken. No audio tags -- those are ElevenLabs.
Direction goes in DIRECTOR'S NOTES, not inline.]
```

### Complete Gemini Direction Example

```markdown
# AUDIO PROFILE: Kiran M.
## "Midnight briefing officer"

## THE SCENE: Secure briefing room, 2 AM
A close-mic recording in a quiet, windowless room. The energy is tense but controlled.
This is someone who delivers bad news for a living.

### DIRECTOR'S NOTES
Style: Precise, controlled, with occasional cracks of genuine alarm.
Pacing: Deliberate and measured. Slows before classified details. Speeds slightly
when listing threats -- the accumulation should feel overwhelming.
Accent: Indian English, educated, neutral -- not theatrical.

#### TRANSCRIPT
In mid twenty-twenty-four, a Chinese spacecraft manoeuvred to within one kilometre
of an Indian mapping satellite in Low Earth Orbit.

Neither ISRO nor the Ministry of Defence commented publicly.

India's only proven deterrent... a kinetic kill missile. Tested once. Creates three
thousand fragments of debris.

A deterrent you cannot use is not a deterrent.
```

### Key Differences: ElevenLabs vs. Gemini

| Aspect | ElevenLabs | Gemini |
|--------|-----------|--------|
| Direction method | Inline `[tags]` in transcript | Separate DIRECTOR'S NOTES section |
| Emotional control | Per-line tags: `[deadpan]`, `[excited]` | Global style + pacing directives |
| Physical reactions | `[sighs]`, `[exhales]`, `[laughs]` | Described in scene/notes, not transcript |
| Transcript | Contains tags + spoken text | Contains ONLY spoken text |
| Best for | Fine-grained per-line emotional control | Consistent sustained tone, natural delivery |

---

## Scripts

### Single file

```bash
python3 scripts/run.py audio:voiceover \
  --provider elevenlabs \
  --text-file voiceover.txt \
  --output voiceover.mp3 \
  --voice Rajesh \
  --stability natural
```

### Gemini

```bash
python3 scripts/run.py audio:voiceover \
  --provider gemini \
  --align-engine qwen3 \
  --text-file voiceover.txt \
  --output voiceover.mp3 \
  --voice Kore
```

### Align existing audio

```bash
python3 scripts/run.py audio:voiceover \
  --align-only existing.mp3 \
  --text-file voiceover.txt
```

### Batch

```bash
python3 scripts/run.py audio:voiceover --jobs voiceover_jobs.json
```

## Flags

| Flag | Default | Notes |
|------|---------|-------|
| `--provider` | elevenlabs | Pass `gemini` explicitly for Gemini TTS |
| `--voice` | Kore (Gemini), George (EL) | Name or voice_id. `--voice-list` to browse |
| `--stability` | natural | creative / natural / robust (EL only) |
| `--speed` | native | 0.7-1.2, applied via ffmpeg post (EL only) |
| `--model` | gemini-2.5-pro-preview-tts (Gemini), eleven_v3 (EL) | Provider-specific. Eleven v3 currently rejects `previous_text`/`next_text` continuity context. |
| `--align-model` | gemini-2.5-flash-lite | Gemini model used for transcript recovery/debug only |
| `--align-engine` | elevenlabs | ElevenLabs native timestamps are the default alignment authority; Gemini is transcript recovery/debug only. Use `qwen3` or `auto` only when provider-native timestamps are unavailable. |
| `--align-language` | English | Language label for local forced aligners |
| `--align-parallel-chunks` | 5 | Parallel chunk alignment workers when stitch offsets are known |
| `--align-rerun-model` | gemini-2.5-pro | Selective rerun model for bad chunk alignments |
| `--align-max-reruns` | 1 | Selective retries per bad chunk before fallback |
| `--align-min-coverage-ratio` | 0.8 | Minimum chunk coverage threshold |
| `--align-min-match-ratio` | 0.65 | Minimum chunk lexical-order match threshold |
| `--align-max-extra-ratio` | 0.45 | Maximum tolerated extra-token ratio before rerun |
| `--signal-align` / `--no-signal-align` | on | Run/skip post-alignment signal correction on `voiceover.words.json` |
| `--fallback` | — | Fallback provider if primary fails |
| `--allow-audio-only` | off | Allow ElevenLabs audio-only fallback if `/with-timestamps` fails. Not production-safe. |
| `--debug-gemini-alignment` | off | Permit Gemini timestamp alignment for explicit debug/emergency runs. |
| `--accept-non-native-alignment` | off | Accept Qwen/Gemini recovery alignment instead of ElevenLabs native timestamps. |
| `--align-only` | — | Skip TTS, align existing audio against --text-file |

### Alignment Reliability Mode

For ElevenLabs voiceover, alignment starts with the provider-native timestamp endpoint:

- generate audio through `/v1/text-to-speech/{voice_id}/with-timestamps`
- convert `normalized_alignment` character timings into `voiceover.words.json`
- quality-check lexical coverage before accepting it
- if native timestamps are missing or bad, fail production. Use `--accept-non-native-alignment` only for explicit recovery/debug runs.

For non-native or recovery alignment, chunked TTS scripts prefer chunk-parallel forced alignment:

- split into TTS chunks
- align chunk audio + chunk transcript with local Qwen3 when `QWEN_ALIGN_PYTHON` points at a Python 3.12 env with `qwen-asr`
- stitch chunk timestamps using known cumulative chunk durations
- normalize zero-duration acronym/number words to a minimum duration before validation
- selectively rerun only hallucinated/broken chunks before full fallback
- apply optional signal-based micro-correction (`--signal-align`, default on)

### Local Qwen3 aligner

```bash
uv venv tmp/qwen-align/.venv --python 3.12
uv pip install --python tmp/qwen-align/.venv/bin/python qwen-asr
QWEN_ALIGN_PYTHON=tmp/qwen-align/.venv/bin/python \
  python3 scripts/run.py audio:voiceover \
  --align-engine qwen3 \
  --text-file voiceover.txt \
  --output voiceover.mp3
```

Qwen3 alignment is local and transcript-constrained. Gemini Flash Lite may recover missing text, but Qwen remains the timing authority. Gemini-only final alignment is banned unless `--debug-gemini-alignment` is explicitly passed, and that output still requires `--accept-non-native-alignment`.

## Output

ElevenLabs: MP3 + word-accurate `.words.json` from native timestamps when accepted + sentence-level `.srt`
Gemini: MP3 + word-accurate `.words.json` via Gemini Flash Lite transcript recovery + Qwen3 forced alignment + sentence-level `.srt`
The JSON report must include `alignment_source`; production ElevenLabs runs should report `elevenlabs_native`, not a regenerated aligner.

For `--output voiceover.mp3`:
- `voiceover.mp3` — audio
- `voiceover.words.json` — word-level timestamps
- `voiceover.srt` — sentence-level subtitles
- `voiceover.tagged.txt` — the exact tagged text submitted to TTS (performance read-back for core; required for both supported engines, including Gemini's DIRECTOR'S NOTES form)

## Batch Manifest

```json
{
  "provider": "elevenlabs",
  "defaults": {
    "output_dir": "projects/demo/audio",
    "voice": "Rajesh",
    "model": "eleven_v3",
    "stability": "natural"
  },
  "jobs": [
    {
      "id": "intro",
      "text": "Day one of Tom's diet. He was optimistic.",
      "output": "intro.mp3"
    },
    {
      "id": "chapter1",
      "text_file": "direction/voiceover-ch1.txt",
      "output": "chapter1.mp3"
    }
  ]
}
```

## Anti-Patterns

| Do Not | Do Instead |
|--------|-----------|
| `[short pause]` or `[long pause]` as direction | Use a real emotion: `[resigned]`, `[with quiet fury]` |
| `[dramatic] [whispers] [sighs]` triple-stack | Two tags max: `[whispers][urgent]` |
| ElevenLabs tags in Gemini prompts | Use DIRECTOR'S NOTES for Gemini |
| Stage directions in transcript | Strip: "CUT TO:", "IMAGE:", "SFX:" — only spoken words |
| Digits: `1978`, `400 crore` | Spell out: "nineteen seventy-eight", "four hundred crore" |
| SSML: `<break time="1.5s" />` | Punctuation: `...` for pauses, `--` for pivots |
| CAPS on every emphasis | Max 1-2 CAPS words per paragraph |
| English transliteration: "sankalp" | Devanagari: `संकल्प` |
| Wall-to-wall narration | Budget 15-20% deliberate silence gaps |
| Metadata in voiceover.txt | Spoken words only. Script strips these as a safety net. |
