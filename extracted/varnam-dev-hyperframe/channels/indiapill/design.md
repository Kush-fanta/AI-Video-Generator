---
version: alpha
name: IndiaPill
description: Warm parchment editorial design system for data-led explainers about modern India's institutional mechanics.
runtime:
  canvas_w: 1920
  canvas_h: 1080
  format_primary: "16:9"
  render_engine: "remotion"
  badge: "top-right rounded black rect, 60% opacity"
voice:
  provider: "elevenlabs"
  voice_id: "pfXTiBUjN7V2lyZgTbui"
  model: "eleven_v3"
  stability: "natural"
  target_wpm: 135
  register: "English male, Indian accent, analytical, well-read friend with an economics background"
colors:
  canvas-parchment: "#E4E0D8"
  canvas-dark: "#0D0D0D"
  text-primary: "#5C5248"
  text-headline: "#3A342E"
  text-body: "#6B6259"
  text-muted: "#8B8178"
  accent-primary: "#D4854A"
  accent-positive: "#8FB07A"
  accent-negative: "#9B7777"
  accent-neutral: "#A4C0D8"
  accent-gold: "#B8A050"
  accent-dark: "#2D4A2A"
typography:
  headline-display:
    fontFamily: Instrument Serif
    fontSize: 260px
    fontWeight: 800
    lineHeight: 1
    letterSpacing: 0em
  headline-md:
    fontFamily: Instrument Serif
    fontSize: 110px
    fontWeight: 700
    lineHeight: 1.05
    letterSpacing: 0em
  body-md:
    fontFamily: DM Sans
    fontSize: 42px
    fontWeight: 400
    lineHeight: 1.45
    letterSpacing: 0em
  label-md:
    fontFamily: DM Sans
    fontSize: 56px
    fontWeight: 700
    lineHeight: 1.1
    letterSpacing: 0.14em
  number-display:
    fontFamily: DM Sans
    fontSize: 108px
    fontWeight: 800
    lineHeight: 0.9
    letterSpacing: 0em
  source-citation:
    fontFamily: DM Sans
    fontSize: 22px
    fontWeight: 400
    lineHeight: 1.2
    letterSpacing: 0em
spacing:
  safe-x: 96px
  safe-y: 56px
  gutter: 48px
  panel-gap: 56px
  subtitle-reserve-bottom: 160px
rounded:
  none: 0px
  sm: 4px
  md: 8px
font-floors:
  hero: 64px
  labels: 40px
  secondary: 20px
  absolute: 20px
signature:
  leader-line-color: "#8B8178"
  leader-line-width: 1.5px
  leader-line-dash: 6px
  proportion-border-color: "#8B8178"
  proportion-border-width: 1px
motion:
  reveal_opacity: "0 → 1"
  reveal_translateY: "12px → 0"
  reveal_frames: 24
  reveal_easing: "cubic-bezier(0.25, 0.1, 0.25, 1)"
  number_spring: "damping 12 / mass 0.4 / stiffness 300"
  leader_line_draw_frames: 30
  proportion_fill_frames: 36
  chart_clip_reveal_frames: 48
  chart_clip_direction: "left-to-right"
  dim_previous_opacity: 0.3
  post_landing_stasis_frames: 18
  element_sequence_frames: "24-30 per element"
pacing:
  cut_density: "12-18 cuts/min"
  cut_hold_standard: "3-5s"
  cut_hold_complex_data: "5-7s"
  cut_hold_simple_stat: "3-4s"
  cut_hold_pattern_interrupt: "1-1.5s"
  video_duration: "5-6 min"
  chapters_per_video: "3-4"
  mode_max_consecutive: "60s"
  interleave: "55% data viz / 25% text statement / 20% archival map"
  image_density_floor: "2 per minute"
  max_typography_run_sec: 35
mix:
  vo_lufs: "-16 to -18dB"
  bgm_during_narration: "-28 to -34dB"
  bgm_music_bridge: "-16 to -18dB"
  data_reveal_tick: "-24dB"
  sfx: "-20 to -26dB"
  room_tone: "-42dB"
  designed_silence: "-45dB"
components:
  stage:
    backgroundColor: "{colors.canvas-parchment}"
    textColor: "{colors.text-primary}"
  proportion-rect:
    borderColor: "{colors.text-muted}"
    borderWidth: 1px
    fillColor: "{colors.accent-positive}"
  leader-line:
    color: "{colors.text-muted}"
    width: 1.5px
    dash: 6px
  comparative-column:
    fillColor: "{colors.accent-primary}"
    typography: "{typography.number-display}"
  area-chart:
    baseColor: "{colors.accent-dark}"
    overlayColor: "{colors.accent-gold}"
    markerColor: "#FFFFFF"
  archival-frame:
    borderColor: "{colors.text-muted}"
    borderWidth: 1px
  brand-badge:
    backgroundColor: "{colors.canvas-dark}"
    opacity: 0.6
    rounded: "{rounded.md}"
---

## Overview

India Pill explains modern India to Indians who want to understand the machine — the economy, the institutions, the numbers behind the headlines. The look is annual report, not thumbnail: warm parchment canvas, desaturated palette, Instrument Serif heroes paired with DM Sans data, dotted leader lines and proportion rectangles as connective tissue.

The channel does not cheer or critique. It shows the mechanism. The viewer connects the dots; the narrator never lands the political conclusion.

## Voice

A well-read friend who happens to have a background in economics. Not a professor. Not a news anchor. Someone who reads Economic Survey documents for fun and can explain fiscal federalism over chai without making you feel stupid.

- **English.** Clean, direct, accessible. No jargon without immediate context. Assumes intelligence, not knowledge.
- **Curious, not omniscient.** The narrator is discovering something alongside the viewer.
- **Specific, not sweeping.** "Foxconn pulled 300 Chinese engineers out of India in July 2025" — not "global supply chains are shifting." The specific detail is the argument.
- **Honesty is the weapon.** Acknowledge every gap, every failure, every legitimate critique. The full truth — when the truth happens to be more interesting than the cynicism — is the channel's credibility.
- **No tells.** No triumphalism. No "India Rising" energy. No flag imagery. Production quality and analytical depth carry the seriousness.
- **The viewer connects the dots.** Never state the political conclusion. The viewer's own inference is 10x more powerful than the narrator's assertion.

### Topic gates

A topic must pass all three before it enters production:

1. **The Outer Loop.** One question the viewer cannot stop thinking about until it's answered — with genuine tension, not a thesis.
2. **Timeliness.** Why watch this today instead of reading a headline? An old story needs a news hook to become urgent.
3. **The Gap.** What does this video show that no existing coverage shows? If you can't name the gap, the topic is saturated.

### Script quality

Target 70%+ value density: in an 8-minute script, at least 5.5 minutes is genuine information or narrative tension. Every sentence either surprises, reframes, creates tension, or delivers a fact. Mark every line VALUE / PACING / CUT before the script is accepted; if more than 30% is CUT, rewrite.

One hero number per insight. Don't stack. Numbers verbatim from source — never round. Physical translations earn their place once.

### SLOP kill list

Banned constructions; rewrite the sentence if any appear. The list grows; the script reviewer adds new patterns whenever it catches a novel form of slop.

| Pattern | Why it's SLOP | Fix |
|---|---|---|
| "The real question is..." | Announces insight instead of delivering it | Just ask the question |
| "Here's the part nobody talks about" | Performative exclusivity | Cut. State the fact. |
| "Far beyond X, far beyond Y" | Rhetorical throat-clearing | Say what it IS, not what it's beyond |
| "This is not X. This is not Y. This is Z." (3+) | Once is a device. Three times is a template. | One use per script max |
| "Assembly was never the destination. It was the door." | LinkedIn aphorism | State the actual mechanism |
| "By any reasonable measure" | Hand-waving | State the measure |
| "Patient, unglamorous, decades-long" | Triple adjective performing seriousness | Pick one — or show an example |
| "The story X is telling is credible" | Op-ed language | Show the evidence |
| "A hedge, not a commitment" | Trying too hard to be pithy | Describe what happened |
| Restating the hook | Padding — the viewer remembers | Never restate the core fact more than once |

### Structure

No rigid formula. Required elements: a 15-second hook that's a fact (not a thesis); an outer loop planted in the first 60 seconds; A→B→C causality chains in the body; inner-loop questions every 2-3 minutes; a pattern interrupt when data fatigue threatens; an honest tension section that presents the strongest counter-argument; a payoff that resolves the outer loop with a fact or image, not a thesis statement.

### Pacing rules

5-6 minutes total — density over length. 3-4 chapters. Never more than 90 seconds of data without a human moment. Never more than 60 seconds of emotion without a number. Every chapter must advance the outer loop.

### Government / policy framing

Name the policy and the mechanism. Don't name the politician. Politicians appear as context only ("New Delhi, 2016"), never as subject. Cleverness is evident from design, not from assertion. When policy fails, report it.

### Counter-arguments

State the strongest counter in the opponent's words. Acknowledge what's true about it. Show what it misses with evidence. Don't land the reframe — the viewer reframes on their own.

## Colors

- **Canvas Parchment (#E4E0D8):** warm parchment, the channel's default — never white.
- **Canvas Dark (#0D0D0D):** near-black, rare earned emphasis only (max 3 per video).
- **Text Primary (#5C5248):** warm brown-grey body.
- **Text Headline (#3A342E):** dark warm charcoal for heroes.
- **Text Muted (#8B8178):** captions, source citations, leader lines, proportion borders.
- **Text Body (#6B6259):** medium warm brown.
- **Accent Primary (#D4854A):** terracotta — badges, filled cards, highlights.
- **Accent Positive (#8FB07A):** sage green — area fills, proportion bars, growth.
- **Accent Negative (#9B7777):** muted rose — comparison blocks, threat.
- **Accent Neutral (#A4C0D8):** muted blue — pool fills, secondary data.
- **Accent Gold (#B8A050):** muted gold — secondary chart lines, trends.
- **Accent Dark (#2D4A2A):** forest green — chart areas, deep fills.

No saturated colors. Ever.

## Typography

Instrument Serif carries hero text, display, and chapter cards. DM Sans carries body, labels, data callouts, and source citations.

- Hero: 240-280px, weight 800.
- Category label: 48-64px, weight 700, ALL CAPS.
- Data callout: 96-120px, weight 800.
- Body: 36-48px, weight 400-500, mixed case.
- Source citation: 20-24px, weight 400 — never below 20px.

Font floors are absolute: hero ≥ 64px, primary labels ≥ 40px, secondary ≥ 20px. Nothing below 20px exists on a phone.

## Layout

One concept per frame — never two charts competing. Generous margins, ~70% canvas occupation. Grid-aligned, precisely placed. Brand badge top-right (small, rounded black rect, 60% opacity). Source/methodology notes in small muted text when showing external data.

### Cognitive offloading

Narration carries the causality and the investigative arc. Visuals carry the math, the mechanics, and the emotional proof. Two parallel information streams. If the visual just illustrates the words, it failed.

### Muted audio test

Every 30-second block: with audio muted, can the viewer still broadly follow the argument? Pass conditions: data frames carry their own labels; archival photos are captioned; maps show flow that implies the argument; comparison frames make winner/loser visually obvious; text statements crystallise the thesis independently.

### Data + image balance

Data viz and real images share the screen roughly equally. Neither dominates more than 30-40 seconds. The interleave between data and image is the rhythm.

## Elevation & Depth

Depth is built through composition and signature elements, not shadow stacks. Bgless cutouts float on the parchment canvas like a specimen on a research desk. Archival photos sit in thin-border frames (1px #8B8178). The proportion rectangle, the leader line, and the white circular chart marker carry the channel's visual presence.

## Shapes

Signature elements — used as connective tissue, not decoration:

- **Dotted leader lines** — thin dotted lines connecting labels to data points, percentages to areas, callouts to chart regions.
- **Proportion rectangles** — thin border, filled proportionally; percentage label outside, connected by leader line.
- **Comparative columns** — 3-5 equal-width blocks side by side, entity name above, hero number inside; fill encodes a second variable.
- **Area / line charts** — Epyllion-style. Forest-green base area, muted-gold overlay trend, white circular markers, thin axes, no gridlines.
- **Geographic composites** — D3 + TopoJSON state maps (Survey of India boundaries) with highlighted outlines, callout boxes via leader lines, percentage bars inset, clipped imagery inside silhouettes.
- **Bgless cutouts** — PNG subjects with transparent backgrounds, composited directly on parchment alongside data labels and leader lines. The cutout IS the frame.
- **Archival photography** — real photos, thin-border framed on parchment. Used liberally — every chapter gets at least one.
- **Rapid collage** — 4-8 video stills or headlines in quick succession (1-1.5s each). Scale-proof beats only.
- **Chapter cards** — left-aligned B&W portrait crop framed, right-aligned chapter number + title, clean horizontal rule, parchment canvas.

## Components

| Family | Job |
|---|---|
| Data hero | Giant animated number — scale moments, milestone numbers |
| Comparative viz | Side-by-side blocks, proportion bars, trend lines — A vs B, trajectory |
| Archival / documentary | Real photos, B&W or desaturated, framed as evidence |
| Map / geographic | D3 maps with data overlays, animated routes |
| Text statement | Bold text on clean canvas, key phrase accented — thesis crystallisation |
| Rapid collage | 4-8 images/headlines, quick succession — scale proof, media montage |
| UI / interface | Mockup screens, data interfaces — policy data, modern feel |
| Bgless cutout composition | Subject + data + leader lines on parchment — the channel signature |

### Information → mode mapping

| Information | Mode |
|---|---|
| Scale / milestone numbers | Data hero |
| Trajectory / time series | Animated trend line or timeline |
| A vs B comparison | Side-by-side blocks or split screen |
| Physical process | Real footage or high-res archival |
| Geographic argument | D3 map with animated flows |
| Policy / mechanism | Schematic diagram or UI mockup |
| Historical precedent | Archival, B&W treatment |
| Cultural phenomenon | Rapid collage of real evidence |
| Emotional / human moment | Single portrait, held long |
| Thesis / crystallisation | Bold text on clean canvas |
| Counter-argument | The evidence that destroys it |

### Sync modes

1. **Delegation** (most common) — narration tells the story, visual does the math.
2. **Visual leads** — image appears 0.5-1s before narrator names it. Priming.
3. **Complementary** — visual and narration explain the same thing from different angles.
4. **Ironic contrast** — visual shows the gap between rhetoric and reality.
5. **Evidentiary action** — visual proves the claim by showing it happening.

### Pattern interrupts

Every 4-6 minutes, hard cut to a different visual world: data → single human face; macro/policy → micro/hands; contemporary → archival; clean → chaotic collage; narration-heavy → music-only montage (5-10s).

### Progressive build

Data elements animate in sequence: container → fill → percentage label → leader line → callout. Each step waits for the previous to settle.

## Audio

Cinematic documentary, not podcast. Score carries emotional weight. Silence carries narrative weight. Music is never background — it's always doing something.

### Instrument palette

| Instrument | Role | Usage |
|---|---|---|
| Minimal piano (sparse, high register) | Academic elegance, signature sound | Data reveals (single notes), pivots |
| Cinematic strings (high sustained) | Weight, gravity, implication | Section climaxes, payoff moments |
| Sub-bass pulse (30-60Hz) | Tension bed, grounding | Investigation, building dread |
| Electronic percussion (minimal) | Urgency, modernity | Data acceleration |
| Ambient pads (textured) | Atmosphere, geography | Location shifts, establishing |
| Light percussive tick / click | Rhythmic structure | Synced to data entries |
| Ambient room tone | Warmth, presence | Always |
| Synth risers | Tension build | Pre-payoff, loop close |
| Bansuri / Indian classical | Wrong register | **Forbidden** |
| Dramatic orchestra hits | Wrong energy | **Forbidden** |
| Synth arpeggios | Too electronic | **Forbidden** |

### Scoring philosophy

Voice + ambient room tone is the default. Music enters for: opening (5-8s before voice), section transitions (2-3s bridges), the final implication section, data reveal moments (single notes, not phrases), pattern interrupts (a different sonic world).

Phase scoring: investigation buildup → tension bed + sub-bass slowly rising; data acceleration → electronic percussion enters, tempo increases; pattern interrupt → hard cut to different sonic world; emotional calibration → piano or strings, slower, breathing room; payoff → full ensemble (first time in video), then strips to voice + silence.

Data scoring: soft piano note on hero number; percussive tick on data-point entries; silence during complex chart builds (let the viewer process); subtle string swell when implication lands.

Designed silence is earned: 2-3 seconds of nothing after a payload sentence. Only works if there was music before.

### SFX

SFX as information — UI sounds for data reveals (subtle click/tick); news broadcast snippets as 0.5-2s scene-setters, ducked; textured transition sounds between chapters; specific factory/location ambience under relevant visuals.

### Audio timing

- Data leads narration by 0.5-1s (priming).
- Image leads narration by 1.5-2s (priming).
- Statement syncs at the word (±0.5s).
- Pattern interrupt transitions are hard cuts — no dissolve.
- Chapter bridges are 2-4s of music + visual.

## Do's and Don'ts

- Do treat every frame as an argument — proves, reveals, or reframes. Decoration fails.
- Do hold the muted-audio test on every 30-second block.
- Do name the mechanism, not the politician.
- Do present the strongest counter-argument, with evidence, and let the viewer reframe on their own.
- Do compose bgless cutouts directly on parchment with leader lines and data — no border, no shadow.
- Don't use saturated colors.
- Don't run a single visual mode for more than 60 seconds.
- Don't ship full-bleed AI illustration — cutouts on canvas yes, full-bleed no.
- Don't use dramatic dark backgrounds beyond 3 earned moments per video.
- Don't use Ken Burns as a primary device.
- Don't drop a number below 20px on screen.
- Don't end with a call to action — earned clarity is the close.
