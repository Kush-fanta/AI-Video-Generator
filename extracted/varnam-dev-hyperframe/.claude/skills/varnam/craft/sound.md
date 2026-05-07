# Sound

Craft knowledge for narration-driven sound — when and how voice, music, silence, and sound design serve the narrative structure.

## Score Breaks

The score must respond to structural narrative turns — not play atmospherically throughout. A continuous, level music track does not score a video. It upholsters it.

Three structural events that require a score break:

**1. The zero moment (major reveal)**
When a single fact, reversal, or contradiction lands as the emotional peak of a section, the score drops to silence for 1-2 seconds immediately after. The silence IS the emphasis. The absence of music forces the viewer to sit with the fact. Commentary by the score at this moment weakens the hit — the score must get out of the way.

**2. Chapter and section transitions**
The chapter card (or equivalent visual break) does the transition work — not a music swell. Score drops near-silence or to full silence at the chapter boundary, then re-enters with the new section's energy. Music swelling over the chapter card buries the structural break. Silence reveals it.

**3. The escalation peak before the drop**
Just before a major reveal or silence moment, the score reaches its highest intensity. The swell + silence pairing is the editorial equivalent of a held breath then a punch. The swell earns the silence. Silence without a preceding buildup is just absence.

**If the music plays continuously at a consistent level throughout, it has failed to score.** Atmosphere is not scoring. Scoring means the music makes editorial decisions — enters, changes, drops — in response to what the narration is doing structurally.

## Silence as Structural Tool

Silence is not absence of content. It is the most emphatic editorial choice available.

Silence works only in contrast — it requires music before it. A video with no score cannot deploy silence. A video with ambient underscore throughout has diluted the contrast so much that silence sounds like a glitch, not a choice.

**Designed silence:** a deliberate, held pause after a payload line. The viewer's mind fills it. 1-3 seconds at most — longer and it reads as technical error.

**Hard cut to silence:** no fade-out. Score playing, then nothing, cut on the beat. This is the strongest form. Used on single-fact reveals, shocking statistics, or the hinge point of an argument.

When the score does not fully leave, it still has to contract clearly. A reveal beat should read as a measurable drop in accompaniment energy, not just a different chord with the same density. If a marked payload line lands and the bed holds level underneath it, the mix missed the edit even if the voice remains audible.

## Music Enters for Reasons

Music is not background — it enters when it has a job. The default is voice + room tone.

Music earns its entrance when:
- Opening sequence (establishing register before voice arrives, 5-8s)
- Section transitions (bridges between chapters)
- Data reveal moments (single notes, not phrases — the score punctuates, not accompanies)
- Pattern interrupts (completely different sonic world when the argument shifts genre)
- Final implication section (earned weight, first full ensemble)

Music that enters for no structural reason teaches the viewer to ignore it. Once they ignore the score, it can no longer do editorial work.

## Speech-Band Ownership

During narration, the voice owns the intelligibility band.

In practice:
- sustained musical material in roughly `300Hz-3kHz` is a debt against clarity
- bass weight and upper air are usually safer than mid-band melody under speech
- transient hits in the voice band can be acceptable when brief, but sustained pads, strings, or synth lines there will compete

The default path is narration-first:
- if the narrator is carrying argument, explanation, or data, the mix should favor clear speech before soundtrack density
- if a section wants intentional overwhelm or buried voice as an effect, that must be called out explicitly in the score spec

This is not just taste language. It is often measurable. The clean check is to compare the final mix against the clean voiceover stem and ask whether the mix injected persistent extra mid-band energy where speech lives.

## Reveal Contraction

Major payload beats and chapter handoffs need their own audio shape, not just cleaner EQ.

In practice:
- mark reveal words or timestamps from `words.json`
- measure accompaniment energy before the marker, then across the reveal window
- require a clear contraction at the marker rather than a flat bed

This answers a different question than speech masking:
- `speech_masking` asks whether the mix crowded narration
- reveal contraction asks whether the score actually made room at the intended dramatic beat

Both matter. A mix can be intelligible and still fail editorially if the soundtrack never yields at the payload line.

## SFX as Information

Sound effects are not decoration — they are information that the visual or narration cannot carry alone:

- **Ambient environment:** the city hum under a skyline shot, the office hum under a tech park image. Grounds abstraction in place.
- **Data reveals:** subtle UI click or tick when numbers appear. Confirms the visual event in the audio channel.
- **Archival footage:** use the source audio (or reconstructed diegetic sound). Silence under real footage of an event feels sanitized.

SFX should never compete with narration. All SFX sits well under voice — the voice is always the loudest story element.
