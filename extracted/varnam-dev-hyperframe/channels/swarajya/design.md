---
version: alpha
name: Swarajya
description: Dark navy editorial design system for argument-led Indian policy and power analysis.
runtime:
  canvas_w: 1920
  canvas_h: 1080
  format_primary: "16:9"
  format_secondary: "9:16"
  render_engine: "remotion"
  badge: "#SWARAJYA"
voice:
  provider: "elevenlabs"
  voice_id: "i6pIVBNjqZPVh8GEnyjS"
  model: "eleven_v3"
  target_wpm: 145
  register: "male, mid-to-low, standard Indian English, journalistic"
colors:
  canvas-navy: "#192841"
  surface-navy: "#0F1E38"
  text-cream: "#F5F2EA"
  text-muted: "#A0A8B4"
  accusation-red: "#D8323E"
  authority-gold: "#D4A264"
typography:
  headline-display:
    fontFamily: Space Grotesk
    fontSize: 110px
    fontWeight: 700
    lineHeight: 1
    letterSpacing: 0em
  headline-md:
    fontFamily: Space Grotesk
    fontSize: 72px
    fontWeight: 700
    lineHeight: 1.05
    letterSpacing: 0em
  body-md:
    fontFamily: Inter
    fontSize: 36px
    fontWeight: 400
    lineHeight: 1.45
    letterSpacing: 0em
  label-md:
    fontFamily: Inter
    fontSize: 28px
    fontWeight: 500
    lineHeight: 1.1
    letterSpacing: 0.14em
  number-display:
    fontFamily: Space Grotesk
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
components:
  stage:
    backgroundColor: "{colors.canvas-navy}"
    textColor: "{colors.text-cream}"
  data-card:
    backgroundColor: "{colors.surface-navy}"
    textColor: "{colors.text-cream}"
    typography: "{typography.number-display}"
    rounded: "{rounded.md}"
  red-rule:
    backgroundColor: "{colors.accusation-red}"
    size: 8px
  gold-rule:
    backgroundColor: "{colors.authority-gold}"
    size: 8px
  chapter-card:
    backgroundColor: "{colors.canvas-navy}"
    textColor: "{colors.text-cream}"
    typography: "{typography.headline-display}"
  source-caption:
    backgroundColor: "{colors.canvas-navy}"
    textColor: "{colors.text-muted}"
    typography: "{typography.label-md}"
---

## Overview

Swarajya's baseline is the dark navy Bengal Curve register: serious, broadcast-clean, high-contrast, and data-led. It should feel like a strategic briefing with an editorial verdict, not a soft print essay.

Swarajya diagnoses. It does not cheer. The event is proof; the larger pattern is the argument.

## Voice

The narrator says "I", not "we". He has a view and states it. India is not seeking permission; the failures are India's to name and fix.

The hook is a gap between the official story and what is actually happening. It is not a soft question. Good openings name a specific date, fact, and missing implication: "What none of them mentioned is..." / "India's air defense held. But how?" / "Pakistan built a dedicated rocket force 3 months after getting hit. Sit with that."

Every video needs one human arc inside the larger argument: a person, company, or institution moving through struggle to proof. The close does not summarize; it hands pressure to the viewer.

Avoid pride-copy, false balance, "only time will tell", "this changes everything", "did you know", editorial "we", and any sentence that could sit in a government press release.

## Colors

- **Canvas Navy (#192841):** base canvas.
- **Surface Navy (#0F1E38):** cards, panels, and media backing.
- **Text Cream (#F5F2EA):** main text on navy.
- **Text Muted (#A0A8B4):** metadata, captions, quiet labels.
- **Accusation Red (#D8323E):** danger, reversal, contradiction, negative proof.
- **Authority Gold (#D4A264):** achievement, positive proof, structural highlight.

Cream/peach is not the identity baseline. Use cream only as a local panel or image backing when a specific frame needs contrast.

## Typography

Space Grotesk carries headlines, numbers, and hard claims. Inter carries explanatory body and labels. Keep labels readable on mobile; do not shrink primary payload below the established label scale.

## Layout

Use bold split frames, data panels, full-bleed media, and clear safe zones. Composition should make the claim readable first, then the evidence, then the source. Do not default-center unresolved text.

## Elevation & Depth

Depth comes from navy surfaces, panel contrast, media overlays, and gold/red emphasis. Shadows are allowed only when separating media or panels from the navy canvas.

## Shapes

Gold slashes, red accusation lines, dark panels, framed media, and chart trajectories are the core marks. Shapes must carry argument state, not decoration.

## Components

Baseline components are chapter cards, Bengal Curve/data frames, full-bleed media overlays, split-image stats, accusation reveals, source captions, and gold/red transitions.

| Family | Job |
|---|---|
| Chapter card | Section break or thesis reset |
| Bengal Curve / data frame | Ranked trajectory, decline/rise, proof-by-number |
| Full-bleed media overlay | Real place, object, institution, footage, or person as evidence |
| Split-image stat | Comparison where the image and number share the argument |
| Accusation reveal | Red-line reversal, failure, contradiction, or threat |
| Source caption | Filed evidence and provenance |
| Gold/red transition | Authority-to-accusation state change, not decoration |
| Label stamp | One to three word punctuation beat |

Long-form Swarajya should feel visually reported, not card-bound. Visual referents should appear often enough that the film feels evidenced, not illustrated after the fact.

Named people, places, institutions, documents, technologies, and events should usually get a visual referent.

## Audio

Voice is dominant and measured: authoritative, not performative. Punctuation directs performance: ellipsis for a real pause before verdict, sharp pivots for new clauses, and short sentences after dense setup for landing beats.

Score is not a constant bed. Use 30-60s patchwork cues that breathe with the argument: tense/investigative synths and ticking, somber piano/pads for failure, layered cinematic swells for structural turns.

At structural peaks, the score may build layers toward a turn, land a low impact, then cut to silence on the key line. Silence is a directed choice, not an automatic house trick.

SFX land on visual events, not spoken words. Soft whooshes, UI clicks, low impacts, and referent-specific ambiences are allowed. Generic booms, aggressive whooshes, and SFX that compete with VO are banned.

Mix posture: VO at reference, score under VO around -15 to -20 dB, SFX around -6 to -8 dB. Every word must remain intelligible.

## Do's and Don'ts

- Do make project-specific direction calls from the script.
- Do use red and gold as argument state, not palette garnish.
- Do derive render primitives from this file.
- Do treat on-screen text as editorial selection, not narration transcription.
- Don't treat the cream/coral register as Swarajya's default identity.
- Don't replace project direction with a rigid slot list.
- Don't repeat the same frame family for three or more consecutive beats without a directed reason.
- Don't render placeholder or acquisition notes as visible content.
- Don't place important text in the subtitle reserve.
- Don't add decorative marks that do not encode argument state.
