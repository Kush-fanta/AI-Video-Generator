# WarIndex - Config

## Canvas

```yaml
canvas: "#050A12"
canvas_panel: "#0C1624"
canvas_globe: "#07111B"
canvas_depth: "#0A1320"
canvas_alert: "#311517"
```

## Palette - Text

```yaml
text_primary: "#E8D9C8"
text_secondary: "#DCE7F0"
text_label: "#9DB3C7"
text_muted: "#6F8598"
text_dim: "#44586A"
```

## Palette - Tactical

```yaml
accent_india: "#D7A261"
accent_route: "#D7A261"
accent_neutral: "#5C84A9"
accent_alert: "#C7615C"
accent_glow: "#A8C2DA"
grid_line: "#173249"
grid_minor: "#102434"
```

## Typography

```yaml
font_serif: "Instrument Serif"
font_sans: "DM Sans"
hero_stat_size: 220-260px
verdict_size: 112-148px
chapter_title_size: 96-128px
ops_label_size: 22-28px
constraint_label_size: 30-40px
body_size: 30-38px
source_size: 18-22px
font_floor_primary: 26px
font_floor_secondary: 18px
label_tracking: "0.16em"
```

## Signature Element Specs

```yaml
route_width: 4px
route_dash: "14 8"
grid_major_width: 1px
grid_minor_width: 0.5px
panel_border_width: 1px
pulse_ring_max: 34px
glow_blur: 18px
```

## Motion

```yaml
reveal_opacity: "0 -> 1"
reveal_translateY: "18px -> 0"
reveal_frames: 18
camera_drift_px: "18-42px"
camera_push_scale: "1.0 -> 1.16"
panel_tilt_x: "8deg"
panel_tilt_y: "-6deg"
number_spring_damping: 14
number_spring_mass: 0.55
number_spring_stiffness: 220
route_trace_frames: 40
label_snap_frames: 10
verdict_hold_frames: 24
```

## Pacing

```yaml
cut_density: "10-18 cuts/min"
cut_hold_standard: "3-6s"
cut_hold_complex_map: "5-8s"
cut_hold_verdict: "4-6s"
video_duration: "8-14 min"
chapters_per_video: "6-8"
chapter_duration: "50-120s"
mode_max_consecutive: "45s before switching"
graphics_only_floor: "80%"
typography_only_max_sec: 12
narrator_wpm: "125-145"
```

## Audio Timing

```yaml
data_lead_narration: "0.3-0.8s"
map_lead_narration: "0.6-1.4s"
verdict_sync: "AT the line"
hard_cut_transition: "0f"
silence_after_payload: "12-24f"
```

## Mix Levels

```yaml
vo_lufs: "-16 to -18dB"
bgm_during_narration: "-30 to -36dB"
bgm_during_execution: "-24 to -28dB"
percussion_hit: "-22 to -26dB"
sfx: "-20 to -26dB"
room_tone: "-42dB"
designed_silence: "-46dB"
```

## Production

```yaml
aspect_ratio: "16:9"
platform: "YouTube long-form"
graphics_engine: "Remotion, graphics-first, 2D + 2.5D layers"
archival_usage: "0-20% of runtime, evidence only"
map_engine: "D3 + TopoJSON or vetted projected SVGs; no hand-drawn country outlines"
camera_language: "slow push, orbital drift, tilted tactical boards"
```

## Voice

```yaml
provider: "elevenlabs"
voice_id: "pfXTiBUjN7V2lyZgTbui"
stability: "natural"
model: "eleven_v3"
```
