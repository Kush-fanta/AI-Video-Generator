---
version: alpha
name: Nightshift
description: Dark atmospheric history design system — cinematic painterly default with a parchment diagram mode for mechanism beats.
runtime:
  canvas_w: 1920
  canvas_h: 1080
  format_primary: "16:9"
  render_engine: "remotion"
  fps: 30
  resolution_preview: "720p"
  resolution_final: "1080p"
voice:
  provider: "elevenlabs"
  voice_id: "pfXTiBUjN7V2lyZgTbui"
  voice_name: "Swarajya"
  model: "eleven_v3"
  stability: "default"
  target_wpm: 150
  register: "measured, prosecutorial, deliberate, audible breathing room"
colors:
  canvas-dark: "#0D0D0D"
  canvas-parchment: "#F5EDD8"
  zone-dark-base: "#2B1B4D"
  zone-dark-accent: "#E94B8A"
  zone-dark-highlight: "#D4A574"
  zone-open-sky: "#4EAED4"
  zone-open-earth: "#D4C54A"
  zone-open-vegetation: "#7FA366"
  zone-open-figure: "#E84C3D"
  zone-pivot-primary: "#6B2E9D"
  zone-pivot-accent: "#E82E8F"
  zone-pivot-warm: "#FF8C42"
  text-on-dark: "#FFFFFF"
  text-shadow-on-dark: "rgba(0,0,0,0.4)"
  watercolor-wash: "#A8D5A8"
  data-accent: "#D4A574"
typography:
  headline-display:
    fontFamily: Montserrat
    fontSize: 180px
    fontWeight: 700
    lineHeight: 1
    letterSpacing: 0em
  headline-md:
    fontFamily: Montserrat
    fontSize: 110px
    fontWeight: 700
    lineHeight: 1.05
    letterSpacing: 0em
  body-md:
    fontFamily: Montserrat
    fontSize: 36px
    fontWeight: 400
    lineHeight: 1.45
    letterSpacing: 0em
  label-md:
    fontFamily: Montserrat
    fontSize: 28px
    fontWeight: 500
    lineHeight: 1.1
    letterSpacing: 0.1em
  number-display:
    fontFamily: Montserrat
    fontSize: 180px
    fontWeight: 700
    lineHeight: 0.9
    letterSpacing: 0em
spacing:
  safe-x: 80px
  safe-y: 40px
  gutter: 48px
  panel-gap: 48px
  subtitle-reserve-bottom: 160px
rounded:
  none: 0px
  sm: 4px
  md: 8px
motion:
  transition_default: "dissolve 0.5-1.0s"
  transition_scene_change: "fade through black 0.8-1.2s"
  transition_dramatic: "cut with particle/dust burst"
  slow_zoom_duration: "1-2s"
  slow_zoom_scale: "1.0x → 1.2x"
  pan_duration: "2s for landscape reveals"
  parallax_ratio: "foreground 1.5x faster than background"
pacing:
  cut_rate_opening: "8-12 cuts/min"
  cut_rate_evidence: "12-14 cuts/min"
  cut_rate_action: "18-25 cuts/min"
  cut_rate_climax: "15-20 cuts/min"
  cut_rate_verdict: "8-10 cuts/min"
  mode_max_consecutive: "60-90s"
  scale_oscillation_max: "60-90s"
  text_frequency: "one text beat every 30-45s"
  text_max_simultaneous: 2
components:
  stage:
    backgroundColor: "{colors.canvas-dark}"
    textColor: "{colors.text-on-dark}"
  diagram-stage:
    backgroundColor: "{colors.canvas-parchment}"
    textColor: "{colors.canvas-dark}"
  watercolor-card:
    backgroundColor: "{colors.watercolor-wash}"
    opacity: 0.65
    rounded: "{rounded.md}"
  title-hero:
    typography: "{typography.headline-display}"
    textColor: "{colors.text-on-dark}"
    textShadow: "2-3px 40% black"
---

## Overview

Nightshift is dark atmospheric history. The default register is cinematic painterly — heavy negative space, a visible light source in every frame, color and light carrying the emotional story before the narration explains it. A second register, the parchment diagram mode, exists for mechanism, data, and explanation beats. The frame should feel lit, not merely colored.

Nightshift builds a case. It does not lecture. The viewer enters through lived sensation first; the argument tightens around evidence.

## Voice

Dark, authoritative history with prosecutorial confidence. Tone stays factual and controlled. Never jingoistic. Never angry. Never academic. Never listicle.

- **Opening move:** start in the scene. Use second person when immersion earns the beat.
- **Argument shape:** evidence stacking → turning point → verdict.
- **Pronoun shift:** move from "you" to "we" to "they" as the narration shifts from immersion to explanation to proof.
- **Sentence rhythm:** long wind-up, then a short hammer line.
- **Authority stamps:** direct quotes from primary sources when they sharpen the case.
- **Humor:** rare, dry, factual. Wit comes from specificity, not performance.
- **Pace:** deliberate, with audible breathing room between major ideas.

When the record contains a vivid, grotesque, or darkly human detail, use it. Specificity is part of the brand signal.

What the voice must keep doing: name the larger pattern through the specific event; make the extraordinary feel proven, not embellished; let the verdict land with calm force.

What it must not become: patriotic theater, outrage narration, classroom summary, horror cosplay.

## Colors

Two canvases, mode-switched by narrative function:

- **Canvas Dark (#0D0D0D):** near-black default, used for cinematic painterly mode (event narration, felt history).
- **Canvas Parchment (#F5EDD8):** parchment, used for informational diagram mode (mechanism, data, explanation).

Three emotional zones layer on top of the dark canvas:

- **Dark/Tense** — `#2B1B4D` deep purple-grey base, `#E94B8A` magenta accent (fire, danger, lighting), `#D4A574` warm orange-gold highlight (faces, objects of power). Use for political tension, empire, threat.
- **Open/Historical** — `#4EAED4` sky, `#D4C54A` earth, `#7FA366` vegetation, `#E84C3D` orange-red figure on cool backgrounds. Use for landscape, triumph, scale.
- **Dramatic/Pivotal** — `#6B2E9D` vibrant purple primary, `#E82E8F` magenta accent, `#FF8C42` warm orange. Gradient: purple → magenta → orange (top to bottom). Use for turning points, revelations.

**Rule:** cool → warm = threat → triumph. Warm → cool = safety → danger.

## Typography

Montserrat carries everything — Bold for titles and statement heroes, regular for body and captions. Devanagari is allowed alongside English for inscription names, Sanskrit terms, and place names.

- Title: 15-20% of frame height, white (#FFFFFF), 2-3px shadow at 40% opacity black.
- Info card (parchment mode): 8-12% of frame height, sits on a watercolor wash card.
- Watercolor wash: `#A8D5A8` soft sage-green at 60-70% opacity, reveal 0.2s, text fades in after wash.
- Data accents: `#D4A574` or `#FF8C42` — numbers pop against white text.
- Frequency: one text beat every 30-45s; never more than two simultaneous text elements.

Typography is bold, spare, and occasional. Text punctuates the argument; it does not wallpaper the frame. Use statement heroes, quote cards, timestamps, and data callouts only when they sharpen the beat.

## Layout

Rule of thirds is the default. 40-50% of the frame stays quiet enough to breathe. Build depth with foreground (sharp), subject (mid), background (soft/atmospheric) — minimum two layers. Reserve safe margins for text. If the frame feels full, remove something.

## Elevation & Depth

Depth is built optically, not stylistically: visible light source or strong directional light in every frame, no flat ambient lighting. 2-5% noise grain on all frames to kill the polished AI look. Realism level sits at 5-6/10 — painterly, not photoreal.

## Shapes

Atmospheric concept-art language: textured brushwork, cinematic lighting, grain overlay. Avoid flat vector, cartoon, anime, photoreal stock photos, clean digital art. Maps are stylized silhouettes — not detailed cartography. Borders fade in; regions pulse or glow on mention; labels stay minimal, key locations only.

### Warm Monumental Painterly Variant

Use for beats that need a subject to feel heavy, historic, and inevitable: ships surfacing, armor moving through water, launch vehicles, machinery, fortifications, or a lone figure against scale.

Prompt spine: cinematic oil-painting illustration; low-angle dramatic view; warm amber or burnt-orange dominant sky; golden backlight rim-lighting the subject from behind and below; visible material roughness; atmospheric haze and particles; one active mid-layer element catching light (water spray, dust, smoke, cloud, exhaust); three depth layers; vast negative space above; no text.

Keep the warmth explicit. Cool blue, purple, teal sky, flat vector finish, static centered subjects, and busy background scenery break this variant.

## Components

| Family | Job |
|---|---|
| Cinematic painterly stage | Default mode — storytelling, event narration, felt history |
| Parchment diagram stage | Mechanism, data, explanation beats |
| Watercolor info card | Captioned info on parchment, revealed wash-then-text |
| Statement hero | Bold Montserrat title, white on dark, deliberately held |
| Archival/inscription Ken Burns | Slow, respectful zoom on archival material — only mode that uses Ken Burns |
| Atmospheric establishing wide | Open/Historical zone — landscape, scale |
| Pivot gradient frame | Dramatic/Pivotal zone — purple→magenta→orange turning points |
| Stylized map | Silhouette geography with fade-in borders, glow-on-mention regions |

The moment narration shifts from "what happened" to "how it worked," the frame mode shifts with it.

## Audio

Voice is measured and chosen — authored, not conversationally improvised. Delivery sits slower than ordinary explainer content; space matters here.

Score behaves like pressure in the room: drone or low sustained bed (tanpura, cello, or synth pad below 80Hz) during tension, percussion entering at turning points, sparse melodic material only when it earns emotional weight, hard silence before the line that matters most. The strongest beat is often the line that arrives after the sound disappears.

SFX are diegetic-feeling — wind, stone, hoofbeats, metal, room tone. The world should feel inhabited, not edited. Avoid cinematic whoosh-pack behavior.

Mix posture: narration on top, SFX second, score third. Music must duck under speech. Nothing competes with the line carrying the verdict.

## Do's and Don'ts

- Do switch visual mode (painterly ↔ parchment diagram) on narrative function change, not scene count.
- Do let color and light tell the emotional story before narration explains it.
- Do composite real archival into the channel language — color grade and grain to match — never drop raw.
- Do hold designed silence before the most important line.
- Don't use hard cuts between unrelated scenes, jump cuts, or whip pans.
- Don't run a single visual mode (cinematic or diagram) longer than 60-90s.
- Don't stay on macro scale (empire, economy, global) longer than 60-90s without returning to human scale.
- Don't crowd parallel text elements on screen.
- Don't let score perform emotion on top of the argument — it serves the argument or it is absent.
