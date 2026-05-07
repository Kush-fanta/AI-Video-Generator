# Story-Adaptive Design

Reverse-engineering note from Claude Design exports inspected on 2026-04-30:

- `/Users/dev/Downloads/Aryavarta Archives.zip`
- `/Users/dev/Downloads/Night Shift Templates.zip`

The useful lesson is not the renderer. The useful lesson is that the design system is rebuilt around the story before rendering begins.

## What Worked

- Treat the project as a story-specific design pack, not as a generic template selection.
- Put voice, visuals, audio, image prompts, and timing rules beside the script.
- Give every beat an editorial function: cold open, scale, question, evidence, mechanism, transmission, verdict.
- Change visual mode when narration function changes. Storytelling beats can be painterly and immersive; mechanism beats should become diagrammatic, cartographic, or data-driven.
- Use sparse text as punctuation. Titles, stats, lists, quote cards, and verdict cards should appear when they sharpen the argument, not as constant subtitles.
- Keep generated images under one art direction: palette, light source, grain, depth layers, negative space, and caption-safe framing.
- Wrap stills in a reusable cinematic treatment: grade, vignette, grain, safe gradients, focal point, and slow camera motion.

## What Not To Copy

- Do not copy browser-only React playback loops as production runtime.
- Do not use script to decide timed visibility. HyperFrames timing must live in `data-start`, `data-duration`, tracks, media starts, and nested compositions.
- Do not keep unseeded `Math.random()` in render-time visuals or audio.
- Do not accept rough word-per-minute timing as final editorial timing. Lock against real voiceover, silence, music, and SFX.
- Do not treat standalone HTML template bundles as a Varnam template system. They are useful reference frames, not reusable production contracts.
- Do not rely on pretty stills alone. Real proof is a rendered video plus postflight review.

## Varnam Direction

Varnam should compile story-adaptive direction into HyperFrames, not manually rewire each run.

The authored layer should include:

- `voice`: narrator stance, rhythm, forbidden tonal lanes, authority level.
- `visuals`: palette zones, lighting doctrine, composition rules, visual modes.
- `audio`: score bed, silence doctrine, SFX hierarchy, ducking rules.
- `image_style`: prompt suffix, negative prompt, media stance, image QA rules.
- `edit_grammar`: named beat types with expected text, motion, transition, and collision rules.
- `timeline`: beat start, duration, scene, function, overlay role, focal point, motion preset, and audio relation.

The runtime layer should emit:

- `index.html` as the project composition.
- `compositions/*.html` for reusable beat grammar.
- explicit clip timing through HyperFrames attributes.
- GSAP timelines only for visual animation.
- seeded texture and particle systems.
- postflight checks for caption density, overlap, dead air, text frequency, scene-mode balance, and audio/visual alignment.

## Bar

Claude Design looks strong because it creates an opinionated design pack per story. Varnam must keep that adaptation, then add the missing production discipline: brand systems, deterministic rendering, long-form timing, real collision checks, audio locking, and frame-by-frame review.
