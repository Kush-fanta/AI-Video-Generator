# Mixing — Scoring, SFX, and Mix Execution

End-to-end method from story analysis to final mixed output. The editor provides instrument palettes, score events, and protection zones. This file provides the method and tools.

Scope rule: this doc governs the external mix path. If the project is already being authored in the active runtime and the audio can live on the composition timeline, keep VO, BGM, and SFX inside that runtime. Use this FFmpeg path only when the audio workflow is intentionally separate from the composition.

## 1. Scoring Method

### Step 1: Listen to the Voice — Two Passes

Before writing a single note, analyze the voiceover with Gemini. Two passes, two different questions.

```bash
python3 scripts/run.py visual:analyze --jobs <manifest>
```

**Pass 1 — Frequency & Space (where music can exist):**
- Fundamental frequency range (Hz) — defines the floor of the forbidden zone
- Energy concentration bands — where the voice's body and clarity live
- Dynamic range — quietest vs loudest passages
- Tonal character — warm/dark vs bright/forward

**Prompt:**
```
Analyze this voiceover for frequency and space. I need:
1) Speaker fundamental frequency range (Hz).
2) Where voice energy concentrates (frequency bands).
3) Dynamic range -- quietest vs loudest passages with timestamps.
4) Tonal character -- warm/dark vs bright/forward.
```

**Sample finding:** A warm male narrator at 90-150Hz with energy at 150Hz-1kHz and 2-4kHz means the music must live below 80Hz or above 6kHz. The 150Hz-4kHz zone belongs to the voice — no melodic instruments there. Percussive/transient instruments in the voice band are acceptable — they don't mask sustained speech. Sustained melodic instruments in the voice band will compete.

**Pass 2 — Drama Curve (how the narration FEELS over time):**
- Intensity level per 5-second window (1-10)
- Pacing — where the narrator speeds up, slows down, holds
- Emotional register — deadpan, tense, chaotic, sincere, mocking, reverent
- Energy peaks and drops with exact timestamps
- Silence gaps and dramatic pauses

**Prompt:**
```
Map the emotional energy of this narration. For each 5-second window:
1) Intensity level (1-10).
2) Pacing (slow/medium/fast).
3) Emotional register (deadpan/tense/chaotic/sincere/mocking/etc).
4) Note exact timestamps of: energy peaks, deadpan drops, silence gaps, dramatic shifts.
```

Pass 1 tells you WHERE music can exist (frequency). Pass 2 tells you WHAT the music should do (drama). The words.json tells you WHEN words land. All three feed the Lyria prompt.

### Step 2: Map Score Events

Read `direction/board/index.md`, the relevant scene boards, and `voiceover.words.json`. The editor's spec identifies score events — moments where music should respond. The spec uses format-specific vocabulary depending on whether a section is narration-dominant, music-dominant, or hybrid. Execute the events as specified.

Mark 10-20 events per chapter/section. Not every word, not every cut — the moments specified in the editor's event map.

#### Event Types — Spec Vocabulary Reference

The editor uses these terms in score specs. This table defines what each term means for execution.

| Event Type | What the editor marked | What to execute |
|-----------|---------|-----------------|
| **Naming** | A concept named for the first time | Accent — bell strike, harmonic shift, single note |
| **Accumulation** | A list building | Progressive layering — add one instrument per item |
| **Pivot** | The argument turns | Tonal shift — new instruments, not new volume |
| **Payload** | Thesis statement, devastating fact | Music retreats or disappears. Silence protects the line. |
| **Deflation** | Deadpan after intensity | Everything dims — volume drops, texture thins |
| **Designed silence** | Planned gap in narration | Hard silence. No fade, no residual hum. |
| **Temperature shift** | Topic change, new world | Palette change — different instruments entirely |
| **Exit** | Final words of a section | Music exits BEFORE the last word lands |

#### Event Map Table Format

Build this table before writing any Lyria prompt:

```
| Time  | VO Word/Phrase         | Event Type         | Musical Response                          |
|-------|------------------------|--------------------|-------------------------------------------|
| 0:00  | (opening)              | Entry              | Sub-bass drone fades in over 3s           |
| 0:08  | "संकल्प"               | Naming             | Single bell strike, resonant              |
| 0:12  | "कल्प"                 | Accumulation       | Harmonic shift, second drone layer        |
| ...   | ...                    | ...                | ...                                       |
```

### Step 3: Apply the Instrument Palette

The editor provides the instrument palette in the spec. It is derived from:

1. **Voice analysis** (Step 1) — defines the forbidden frequency band during narrated sections. Any sustained instrument with energy in the voice band competes. Percussive/transient instruments in the voice band are fine (they don't mask sustained speech).

2. **Creative direction** — the editor specified a world, an era, an emotional register. The instruments belong to that world.

3. **Format mode per section** — during narrated passages, instruments must avoid the voice band. During music-dominant passages (montages, visual sequences without narration), the full frequency range is available. The same score might need different arrangements for different sections.

### Step 4: Write the Score Prompt

Use Lyria 3 Pro (`lyria-3-pro-preview`) with timestamp control. **One prompt, one generation.** Not separate stems — one coherent piece scored to the narration's timeline. Generation is non-deterministic; verify each take.

**Prompt structure:**

```
[Context — what the film is about, what the music serves]
A score for a documentary video essay about [subject]. The music serves
[narration style — e.g., "a warm male Hindi/English narrator"]. The voice
owns [frequency range from Pass 1]. Music must live [above/below those bands].

[Instrument constraints — what's allowed, what's forbidden, and WHY]
Instruments: [list from editor's spec + frequency analysis].
Forbidden: [instruments that compete with voice band].
BPM: [from editor's spec].

[Timestamped score events — from the event map]
[0:00-0:07] A low sub-bass drone (below 80Hz) fades in slowly. The sound
of something ancient waking up. No melody. No rhythm.

[0:08-0:09] On the word "संकल्प" — a single bell strike. Resonant, felt in
the chest, not heard with ears. The drone continues beneath.

...

Instrumental only. No vocals. No humming.
```

**What makes a good timestamp entry:**
- Name the narration word that triggers the event: *"On the word 'संकल्प' — a bell strike"*
- Describe the sound in physical terms: *"felt in the chest, not heard with ears"*
- Describe the emotional function: *"The drone agrees — it sounds small"*
- Say what is NOT happening: *"No melody. No development. The sound of a closed mind."*

**What makes a bad timestamp entry:**
- Generic mood: *"mysterious atmosphere"* — this produces wallpaper
- Technical specs without reason: *"add reverb here"* — Lyria doesn't understand mix parameters
- Too many events in one window: Lyria can hit ~15-20 timestamp marks reliably, not 40

### Step 5: Generate and Verify

Generate with Lyria 3 Pro (`lyria-3-pro-preview`) — NOT clip — pro gives 2+ minutes with timestamp control.

**Generation command:**
```bash
python3 scripts/run.py audio:music \
  --prompt-file score-prompt.txt \
  --output audio/bgm/ch1-score.mp3 \
  --model lyria-3-pro-preview
```

Duration belongs in the timestamped prompt; the CLI intentionally does not take a separate `--duration` flag.

**Then analyze what you got** — don't blindly mix. Run `analyze_media.py` on the generated audio.

```bash
python3 scripts/run.py visual:analyze --jobs <manifest>
```

Check:
- Did the bell land near the right timestamp? (Acceptable: within +/- 2 seconds)
- Did the temperature shift happen where requested?
- Is there unwanted melody in the voice band?
- Are there unwanted vocals? (Lyria sometimes generates cinematic vocals from instrumental prompts)
- What's the actual duration?

Lyria is non-deterministic. The output won't perfectly match the prompt. What matters:
- Major structural events (bell, silence, temperature shift) should be within ±2 seconds of target
- Instrument palette should match the constraints
- The piece should feel scored to moments, not like a generic bed

If major beats are missed, regenerate. If minor timing is off, the mix can compensate. If the palette is wrong, re-prompt with more specific instrument constraints.

### Format-Adaptive Scoring

The editor's spec identifies each section's mode and provides format-specific instructions. The three modes and their execution constraints:

#### Video Essay (Narration-Dominant)
- Voice owns the frequency band and timeline. Music lives in the gaps and below the voice.
- Score to specific narration words as marked in the event map.
- During narration, music is underscore. During pauses, music can surface.
- Protection zones enforce silence where specified.

#### Cinematic / Documentary Drama (Music-Dominant)
- Music carries the emotional arc. Full frequency range is available in narration-free sections.
- Longer musical phrases. Wider dynamic range — the score can build to peaks without fighting a narrator.
- SFX and score blend — environmental sound becomes musical texture.

#### Hybrid (Most Common)
- Sections alternate between narration-heavy and music-heavy. The editor's spec marks which mode each section is in. Execute accordingly.

### Entries and Exits — Designed, Not Default

Score starts and endings are specified by the editor, not defaulted.

#### Entry Types
| Type | When | How |
|---|---|---|
| **Cold start** | Score begins with impact — a statement, a reveal | No fade. Music appears at full level on a cut. |
| **Pre-lap** | Score enters before the visual/narration beat it serves | Music fades in 1-3s ahead of the moment, building anticipation. |
| **Room-tone bridge** | Score emerges from ambient silence | Ambient bed (room hum, wind) gradually reveals musical content within it. |
| **Inherited** | Score continues from previous chapter/section | No entry at all — the music was already playing. |

#### Exit Types
| Type | When | How |
|---|---|---|
| **Hard cut** | Designed silence after a statement | Music stops on a frame. No fade. Silence IS the design. |
| **Bleed** | Mid-video chapter boundary | Score does NOT fade out — it carries into the next chapter. `fade_out: 0`. |
| **Decay** | Natural ending — bell ring, drone release | The instrument's own decay is the exit. No artificial fade. |
| **Designed fade** | Final chapter or act ending | Intentional fade over 4-8s. Only when the piece is genuinely ending. |

**The default is NOT a 2s fade-in + 4s fade-out.** Every entry and exit is specified in the editor's spec.

### Beat-Change Hygiene

When the narration pivots — new topic, new mood, new argument — the score must respond. Sometimes that means a texture shift within the same piece. Sometimes it means **cutting the score and starting a new one.**

#### Cut, Shift, and Silence — Spec Vocabulary
The editor marks score boundaries as cut, shift, or silence in the spec. Definitions for execution:
- **Cut**: Hard stop. Generate a new score segment for the next section. Do not crossfade between incompatible palettes.
- **Shift**: Evolve within the same generation. Instruments change but the piece continues.
- **Silence**: Composed gap. No music. The mix enforces this even if the generated audio has residual sound.

#### Catching beat changes
Read the board canvas. Every section boundary, every "pivot," every "designed silence" annotation is a potential score boundary. Don't generate one long piece and hope it works — map the boundaries first, then decide whether to score in one prompt or multiple.

If a single Lyria generation plays through a beat change that should have been a cut, **re-generate the section, don't patch it in the mix.** Mix protection can enforce silence, but it cannot fix music that's emotionally wrong for the moment.

#### Iteration
Scoring is iterative. The sequence:
1. Generate → verify with Gemini → catch missed beats
2. If major beats missed: re-prompt that section specifically
3. If entries/exits are wrong: re-generate with explicit entry/exit instructions
4. The audio agent owns this iteration loop — if the analysis shows the score plays through a beat change, fix it proactively.

## 2. SFX Generation — ElevenLabs Sound Effects API

Physical sounds, ambience, room tone, transients. NOT Lyria.

```bash
curl -X POST "https://api.elevenlabs.io/v1/sound-generation" \
  -H "xi-api-key: $ELEVENLABS_API_KEY" \
  -H "Content-Type: application/json" \
  -d '{"text": "prompt describing the physical sound", "duration_seconds": 8}' \
  --output audio/sfx/name.mp3
```

Python:
```python
import requests, os
resp = requests.post(
    "https://api.elevenlabs.io/v1/sound-generation",
    headers={"xi-api-key": os.environ["ELEVENLABS_API_KEY"]},
    json={"text": "prompt describing the physical sound", "duration_seconds": 8},
)
with open("audio/sfx/name.mp3", "wb") as f:
    f.write(resp.content)
```

After generation, normalize to -16 LUFS:
```bash
ffmpeg -i input.mp3 -af loudnorm=I=-16:TP=-1.5:LRA=11 -ar 48000 output.mp3
```

Use ElevenLabs for: bells, stone textures, room tone, wind, water, fire crackle, footsteps, paper, book thuds, clock ticks, tabla hits, any physical/environmental sound.

**The rule: Lyria makes music. ElevenLabs makes sounds. Never cross them.**

## 3. Mix Theory

### Frequency Masking and the Human Voice
The human voice sits in specific frequency bands. Every instrument choice is a masking decision.

- **Fundamental frequency**: Male ~85-180Hz, female ~165-255Hz. Body and warmth.
- **Clarity and intelligibility**: 2-4kHz. Consonants and plosives. Where words are understood. Boosting 1-5kHz improves speech intelligibility.
- **Presence**: 4-6kHz. Sibilance and air.
- **The 250Hz problem**: The single most destructive frequency band for masking. Muddy mixes almost always have congestion here. If BGM and VO both have energy at 250Hz, no amount of level adjustment will fix it.

**Practical rule**: Choose instruments that do not compete with voice. Prefer BGM with energy below 80Hz (sub-bass, kick) or above 6kHz (air, shimmer), with a deliberate valley in the 200Hz-4kHz range. Arrangement solves masking problems that EQ cannot.

### Equal-Loudness Contours (Fletcher-Munson)
Human hearing is not flat. At low playback volumes (typical phone/laptop listening), bass and treble perception drops. The 2-5kHz range sounds disproportionately loud because the ear canal resonates there.

A BGM bed at -18dB will feel louder in a quiet passage than the same -18dB during loud narration, because overall SPL drops and the perception curve changes.

**Mix at the volume the audience will hear it.** For YouTube/phone content, that means moderate-to-low SPL, not cranked studio monitors.

### Silence as Designed Element
Silence is not the absence of sound — it is designed.

- **Minimum effective duration**: <0.5s reads as a pause. 1-2s reads as a beat. 3+ seconds reads as a statement.
- **Room tone is mandatory**: True digital silence (0 signal) reads as a technical error. Always fill "silent" passages with room tone or low-level ambience.
- **Silence after sound vs. silence after silence**: Silence following a loud event is perceived as much more dramatic. The contrast is the design tool, not the silence alone.

### Mobile Listening Reality
Most YouTube and social media content is consumed on phones, earbuds, or laptop speakers.

- **Phone speaker frequency response**: Usable range roughly 500Hz-10kHz for iPhones. Below 600Hz, response drops sharply.
- **Mono fold-down**: Phone speakers are so close together that stereo separation is effectively nonexistent. Always check the mix in mono.
- **Dynamic range compression**: Phone speakers have very limited dynamic range. Target narrower dynamic range for delivery.
- **The earbud exception**: Earbuds reproduce wider frequency range and maintain stereo. Mix for the worst case (phone speaker), then verify on earbuds.

### Film Scoring Functions

Every piece of music serves a function. Know which one is being deployed.

- **Underscore**: Music beneath dialogue, shaping mood without calling attention to itself.
- **Counterpoint**: Music that deliberately contradicts the image.
- **Foreshadowing**: Introducing a musical theme before the narrative event it represents.
- **Leitmotif**: A recurring musical phrase tied to a character, place, or idea.
- **Stinger**: Short, sharp musical punctuation on a specific moment.
- **Music leads vs. follows**: The editor's spec indicates which mode applies per section.

### Instrument Reference — Sonic Properties

- **Solo piano**: Narrow frequency footprint, clean attack/decay. Sits in mid-range (250Hz-4kHz fundamental).
- **Strings**: Wide frequency range. Sustained tones produce continuous energy in the voice band. Tremolo produces intermittent energy (less masking).
- **Synths/pads**: Frequency content is fully controllable. Can be placed entirely outside the voice band.
- **Acoustic guitar**: Nylon has softer transients, steel has brighter attack. Both concentrate energy in 200Hz-2kHz.
- **Sparse percussion**: Transient-heavy, minimal sustained energy. Low masking risk even in the voice band.

### Diegetic vs. Non-Diegetic Spectrum
- **Diegetic**: Sound within the world of the film.
- **Non-diegetic**: Sound layered by the filmmaker — score, narration, effects characters cannot hear.
- **The blur**: The most interesting sound design lives in the overlap.

### Sound-Before-Image (J-Cut / Pre-Lap)
Introducing the sound of the next scene before the image cuts. Use for: foreshadowing, smoothing transitions, creating unease, compressing time.

### Emotional Priming Through Ambience
The ambient bed sets the emotional baseline before any dialogue or action. The audience does not consciously register ambience shifts, which is precisely why they work.

### SFX Density Strategy
- **Sparse (1-2 layers)**: Maximum clarity, maximum attention. Tension, intimacy, important dialogue.
- **Medium (3-4 layers)**: Rich but distinguishable. Standard for active scenes.
- **Dense (5+ layers)**: Overwhelming, chaotic. Use for battle, disaster, sensory overload — then cut back dramatically for contrast.

Density should oscillate like dynamics in music. Constant medium density is exhausting.

## 4. Mix Execution

### VO Intelligibility Is the Anchor Condition
In narration-driven pieces, the voiceover must be understood on first listen. Everything else is secondary.

- **The 3-second rule**: If any 3-second window of narration is unintelligible on a phone speaker, the mix has failed.
- **VO sits on top, always.** It is the element the mix is built around.

### Masking Is Arrangement First, Levels Second
If BGM competes with VO in the 200Hz-4kHz range, no amount of ducking will fully fix it.

1. **Choose instruments** that do not occupy the voice band
2. **Arrange sparsely** during narration — drop instruments out, thin the texture
3. **EQ the BGM** to carve a valley where the voice sits (wide cut at 250Hz, notch around 2-4kHz)
4. **Then adjust levels** — ducking is the last resort, not the first tool

### Dynamic Mixing: BGM That Breathes
- **During narration**: BGM at -18 to -24dB relative to VO
- **During pauses**: BGM rises to -6 to -12dB — these moments let the music land emotionally
- **Transitions**: BGM can briefly hit -3 to 0dB for structural punctuation
- **Pre-duck**: Start the duck ~0.5-2 seconds before narration begins, not when the voice starts

### Payload Protection
Certain narration passages carry the argument — thesis, reveal, emotional peak.

- Payload narration gets absolute priority: BGM drops to minimum or cuts entirely
- No SFX during payload unless directly reinforcing the point
- Mark payload moments in the mix manifest using `mix_protection` zones with `sfx_policy: "block"` and aggressive `bgm_max` values
- Final delivery never spills past picture. If the cut is 389.0s, the mixed output ends at 389.0s even if the voiceover file or score tail runs longer.

### Mix Manifest Format

The mix manifest (`audio/mix.json` or `audio/mix-chN.json`) drives the final mix:

```json
{
  "video": "output/chapter1.mp4",
  "voiceover": "audio/voiceover-ch1-padded.mp3",
  "output": "output/chapter1-mixed.mp4",
  "duration": 83.0,
  "mix_protection": [
    {
      "start": 45.0,
      "end": 52.0,
      "sfx_policy": "block",
      "bgm_max": "-24dB",
      "label": "designed silence: statement needs weight"
    }
  ],
  "tracks": [
    {
      "file": "audio/bgm/ch1-score.mp3",
      "start": 0.0,
      "end": 83.0,
      "level": "-18dB",
      "fade_in": 2.0,
      "fade_out": 0,
      "label": "ch1 score — no fade-out: mid-video chapter"
    },
    {
      "file": "audio/sfx/ghanta-bell.mp3",
      "start": 8.0,
      "end": 16.0,
      "level": "-16dB",
      "fade_in": 0,
      "fade_out": 2.0,
      "label": "ghanta bell — sankalp naming moment"
    }
  ]
}
```

#### Track fields

| Field | Description |
|---|---|
| `file` | Path relative to project directory |
| `start` / `end` | Timestamp in seconds (omit `end` to play full duration) |
| `anchor` | Sync to VO word: `word:<text>:<occurrence>` (resolves against `voiceover.words.json`) |
| `level` | Volume adjustment (e.g., `"-12dB"`, `"0dB"`) |
| `fade_in` / `fade_out` | Duration in seconds |
| `label` | Human-readable note (not used by mixer, but critical for understanding the manifest) |

#### Duration bounding

- `duration` is the authoritative cut length for the final mix. Use it whenever the picture is already locked or when you are producing an audio-only mix artifact.
- If `duration` is omitted, the mixer falls back to probing the `video` duration, then the `voiceover` duration.
- Bleed is a compositional choice inside the cut, not permission for container-level spill. A score can carry across a chapter boundary, but the rendered file still stops exactly with picture.

#### Mix protection fields

| Field | Description |
|---|---|
| `start` / `end` | Protected time range |
| `bgm_max` | Maximum BGM level during this range (e.g., `"-30dB"`, `"-45dB"`) |
| `sfx_policy` | `"allow"` or `"block"` — whether SFX can play during this range |
| `label` | What this zone protects and why |

### Mix Commands

```bash
python3 scripts/run.py audio:sound-design mix \
  --manifest audio/mix.json \
  --project-dir projects/<slug> \
  --verbose
```

The mixer uses FFmpeg under the hood. It handles track trimming, volume, fades, delay positioning, additive mixing, and final duration bounding automatically.

### Analysis

```bash
python3 scripts/run.py visual:analyze --jobs manifest.json
```

Default model: `gemini-flash-latest` (fast, cheap, sufficient for audit). Use `"model": "pro"` in manifest for complex analysis requiring `gemini-pro`.

Use for: verifying SFX placement, checking vocal contamination in scores, auditing mix balance, frequency separation checks.

### Multi-Stem Architecture

- **VO stem**: Always present, always on top
- **BGM stem(s)**: One or more music beds with level, fade_in, fade_out shaping
- **SFX stem(s)**: Discrete effects at specific timestamps, using `anchor` to sync to VO words
- **Ambience stem**: Continuous low-level bed (room tone, city hum, nature) for acoustic grounding

### Long-Form BGM Strategy

#### Tiling
Video essays often run 10-30 minutes. No single generated track covers that duration cleanly. Generate BGM in segments (30-90 seconds each) with consistent key, tempo, and instrumentation. Crossfade between segments at natural phrase boundaries.

#### Loop Points
For sustained beds, generate a segment with similar start and end energy, then loop with a 2-4 second crossfade.

#### Variation
Generate 2-3 variations of the same prompt with slight changes (add/remove instrument, shift energy) to create movement without jarring transitions.

#### Bookends
Generate distinct opening and closing cues sharing the tonal palette of the body BGM but with more presence and resolution.

#### Duration Limits
Generation APIs typically produce 30-120 second clips. For a 20-minute piece, plan 8-15 BGM segments. Generate with 2-4 seconds of overlap for crossfading.

### Mix Process

1. Write the sound bible — reasoning, hearing, design intent — before generating a single note
2. Generate BGM stems based on the bible's architecture
3. Generate or source SFX — each one serves a purpose, no quota filling
4. Write the mix manifest with exact timing, levels, fades, word-based anchors, and explicit `duration` once the cut length is known
5. Mix to produce the final output
6. Listen and iterate — target specific problems (the stem that's wrong, not the whole mix)

### Sound Bible Structure

Pure prose. The bible contains:
- What this piece sounds like — specific texture, not genre labels
- The emotional arc in sound — where pressure builds, releases, where silence is designed
- BGM architecture — relationship to voice, where it leads vs. follows, where it drops out and why
- SFX philosophy — what sounds exist in this world, diegetic vs. non-diegetic, density strategy
- Mix intent — how VO, BGM, and SFX relate. Payload protection moments. Where BGM can swell.
- Silence map — designed silences with reasoning

## Key Principles

1. **Listen before scoring.** The voice tells you where the music can exist.
2. **Identify the format.** Video essay, cinematic, or hybrid — the approach changes.
3. **Score to words, not vibes.** Every musical event has a reason tied to a specific narration moment.
4. **Design entries and exits.** No default fades. Every start and stop is specified in the editor's spec, and every rendered file still hard-stops at the cut length.
5. **Cut on beat changes.** When the mood pivots, the score pivots — or stops.
6. **Silence is scored.** The gap between scores is as composed as the scores themselves.
7. **Temperature is palette, not volume.** A tonal shift means changing instruments, not turning the knob.
8. **Verify before mixing.** Analyze what Lyria actually produced — it's non-deterministic.
9. **Iterate proactively.** If the analysis shows problems, fix them without being asked.
10. **The mix is the last tool.** Protection zones enforce silence the generation missed — but they can't fix wrong music.
11. **Scene context overrides apply when the editor specifies them.**
12. **VO intelligibility is the anchor condition.** Everything else serves it.
13. **Masking is arrangement first, levels second.** Choose instruments that don't fight the voice.
14. **SFX is not a quota.** If silence is stronger, leave the space alone.
15. **The mobile listening test.** Will this work on phone speakers?
16. **Payload protection is sacred.** Critical narration lines get absolute mix priority.
17. **SFX default levels**: Start at -18 to -24 dB for most SFX, -14 dB for impacts. Adjust up only if a specific moment earns it.
18. **Script-level silence budget**: The script must have ~15-20% of duration as deliberate silence. Wall-to-wall narration forecloses real sound design. This is a writing-phase decision, not fixable in post.
