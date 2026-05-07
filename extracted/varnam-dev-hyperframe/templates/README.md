# Templates

First-class Remotion template runtime for Varnam. This folder is the scene catalog, review app, shared visual primitives, template registry, and render-project substrate.

Repo root: `/Users/dev/Downloads/varnam-improviser`. Agents must resolve `.claude/`, `channels/`, `projects/`, and `templates/` from that root, not from this folder.

## CLI First

Do not hand-wire `registry.json` while choosing or adding templates. Use the CLI:

```bash
pnpm template:list
pnpm template -- find map callout
pnpm template -- show hero/topic-hero
pnpm template -- props geo/city-markers
pnpm template -- suggest "highlight five Indian cities"
pnpm template -- smoke geo/city-markers --example default
pnpm template -- registry --write
```

The source tree is the truth:

```text
templates/<family>/<template>.tsx
  export const ComponentName = ...
  export const demo = {
    compositionId: "...",
    props: { ... },
    durationInFrames: 180,
  }
```

`registry.json` remains a generated/cache artifact for the browser QC app and validators. Humans and agents should discover with the CLI, inspect source-backed props, edit source files, and regenerate the registry only with `pnpm template -- registry --write`. Do not edit `registry.json` by hand.

For map work, start here:

```bash
pnpm template -- find map
pnpm template -- suggest "highlight five Indian cities"
pnpm template -- show geo/city-markers
pnpm template -- props geo/city-markers
pnpm template -- smoke geo/city-markers --example default
```

## Quick Start

```bash
pnpm install
pnpm dev          # -> localhost:3000
```

Main pages:
- **/** — Catalog. Grid of all templates with live playback, category/status filters.
- **/qc** — QC Review. Read-only review surface backed by generated `registry.json`.
- **/review** and **/review/[slug]** — focused review surfaces.
- **/identity-lab** — identity token preview.
- **/swarajya**, **/demo**, **/demo-v2**, **/vox** — runtime/demo surfaces.

## QC Review Shortcuts

| Key | Action |
|-----|--------|
| → | Approve |
| ← | Reject |
| ↑ / P / Enter | Polish + Notes |
| ↓ | Skip |
| B / Backspace | Back |
| Cmd+Enter | Submit notes (in modal) |

## Templates

404 registered templates across 25 categories:

| Category | Prefix | Templates |
|----------|--------|-----------|
| abstract | abs- | dot-field, grain-wash, grid-warp, ... |
| annotation | annot- | accordion-reveal, card-fan, red-pen-circle, ... |
| callout | callout- | arrow-callout, magnify-crop, bracket-annotation, ... |
| cinematic | cine- | film-grain, letterbox, parallax-still, ... |
| collage | collage- | collage-scene, cutout-figure, grid-overlay, ... |
| comparison | comp- | versus-split, gap-bridge, then-now-columns, ... |
| counter | counter- | odometer, split-flap, live-ticker, ... |
| data-viz | dataviz- | proportion-bar, ascending-bars, dot-cluster, ... |
| diagram | diagram- | step-sequence, funnel, org-chart, ... |
| editorial | edit- | front-page, evidence-dossier, ticker-crawl, ... |
| geo | geo- | country-highlight, route-trace, choropleth-fill, ... |
| hero | hero- | title-with-frame, stat-hero, quote-card, ... |
| image-comp | imgcomp- | framed-left, cutout-hero, dual-frame, ... |
| indian | indian- | kolam-hero, temple-stat, dynasty-timeline, ... |
| kinetic-text | ktext- | word-by-word, karaoke-line, text-wave, ... |
| lower-thirds | lt- | speaker-id, fact-box, location-tag, ... |
| meter | meter- | dial-gauge, threat-level, progress-ring, ... |
| narrative | narr- | progressive-build, strikethrough-reject, ... |
| reveal | reveal- | peel-back, vault-door, fog-lift, ... |
| screen | screen- | browser-frame, phone-mockup, terminal, ... |
| social-proof | social- | logo-wall, leaderboard, flag-grid, ... |
| swarajya-kit | sk- | title-card, map-callout, stat-big-number, ... |
| timeline | tl- | event-timeline, before-after-wipe, ... |
| transitions | trans- | dark-punch, breath-beat, zoom-punch, ... |

## Structure

```
├── app/                    # Next.js App Router routes and file-backed APIs
├── src/app/                # Catalog/QC React surfaces and Remotion player UI
│   ├── pages/Catalog.tsx   # Browse all templates
│   ├── pages/QCReview.tsx  # QC review over generated registry.json
│   ├── demos.tsx           # compositionId → live component map
│   └── hooks/useRegistry.ts # Registry state + API persistence
├── hero/                   # Template source (.tsx)
├── data-viz/
├── ...                     # template family directories
├── shared/                 # identity, palette, primitives, types
├── projects/               # runtime render projects
├── public/                 # runtime media/assets
├── registry.json           # Generated cache for browser/QC and validators
├── QC_CHECKLIST.md         # Review principles
├── next.config.mjs         # Next.js config
└── package.json
```

## Generated Registry

`registry.json` is generated from source plus existing review state. The generated file carries an `_generated` note with the source command and repo root. The only supported write path is:

```bash
pnpm template -- registry --write
```

```jsonc
{
  "templates": {
    "hero/stat-hero": {
      "status": "approved",
      "compositionId": "hero-stat-hero",
      "qc": { "notes": "...", "reviewedAt": "..." }
    }
  }
}
```

## Design Principles

- **One thing per frame.** One typographic event. Everything else is silence.
- **Font floor.** Hero: 64px. Labels: 40px. Floor: 20px. Nothing smaller exists.
- **Spring physics.** Every entrance has mass. No linear interpolation.
- **Ultraminimal.** Monocle, FT Weekend, NYT Opinion. Not Bloomberg.
