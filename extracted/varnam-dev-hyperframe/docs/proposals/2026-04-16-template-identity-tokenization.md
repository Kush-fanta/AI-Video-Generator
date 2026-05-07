# Template Identity Tokenization

**From:** Codex
**To:** Debasish
**Date:** 16 April 2026

## Decision

Turn the template library into:

1. **Structure + motion primitives**
2. **Identity packs**
3. **Component presets**
4. **Content payloads**

The proof already exists in the chapter-marker lab. The template kept its composition and timing logic while spacing, typography, color, and emphasis were pushed from outside. That is enough to stop treating identity as something hardcoded into every template file.

The new rule is simple:

- **Templates own composition logic and animation**
- **Identity packs own look**
- **People/channels own identity packs**

## Why

Right now the library mixes two concerns:

1. the reusable thing
   - layout
   - sequencing
   - frame math
   - animation

2. the owned thing
   - palette
   - typography
   - spacing density
   - decorative language
   - branded chrome

That makes every new look feel like a new template, and every template feel like a brand commitment.

The chapter-marker experiment proved the opposite is viable:

- same structure
- same motion
- different visual identity
- live adaptation from controls

That is enough to make the whole library smaller and more useful.

## Architecture

### 1. Library contract

Every template should move toward this contract:

- **structure**
  - topology of the composition
  - element relationships
  - timing order
  - frame math
  - state transitions

- **identity**
  - semantic colors
  - typography roles
  - spacing scale
  - surface treatment
  - ornament rules
  - motion tone presets where useful

- **preset**
  - a named component-level style variant
  - `default`, `compact`, `bold`, `editorial`, `tactical`

- **content**
  - text
  - numbers
  - image refs
  - data

### 2. Source of truth for identity

Do not invent a second identity system.

Identity should be owned by the existing channel layer first:

- `channels/<name>/config.md`
- `channels/<name>/visuals.md`

Those files already describe:

- palette roles
- typography scales
- animation rules
- spacing expectations
- image style
- badge behavior

The plan is to compile or map that channel identity into template identity packs, not fork it into a disconnected theme system.

### 3. Shared token layer

Add a shared identity layer under:

- `templates/shared/identity/types.ts`
- `templates/shared/identity/base.ts`
- `templates/shared/identity/merge.ts`
- `templates/shared/identity/presets.ts`
- `templates/shared/identity/css-vars.ts`
- `templates/shared/identity/components/`

Core token groups:

- `colors`
  - `canvas`, `surface`, `surfaceMuted`, `text`, `textSub`, `textMuted`, `textInverse`
  - `accentPrimary`, `accentSecondary`, `accentPositive`, `accentNegative`, `neutral`

- `typography`
  - `fontSerif`, `fontSans`, `fontMono`
  - role scales for `display`, `title`, `subtitle`, `label`, `meta`, `body`
  - weights, line heights, tracking

- `spacing`
  - `pageInset`, `sectionGap`, `contentGap`, `panelGap`, `safeZone`
  - radii, border widths, padding sizes

- `motion`
  - reveal durations
  - stagger steps
  - spring presets
  - easing presets

- `ornament`
  - divider widths/heights
  - frame chrome
  - badge style
  - overlay opacities
  - shadows/glows/grain strength

### 4. Component API

The target API for templates should be additive, not a breaking rewrite.

Keep legacy props working:

- `palette?: Partial<Palette>`
- `serif?: string`
- `sans?: string`

Add identity-native props:

- `identityId?: string`
- `identity?: Partial<IdentityTokenSet>`
- `preset?: string`
- `tokens?: Partial<ComponentTokenSet>`

Interpretation:

- `identityId` selects a named person/channel pack
- `identity` applies global overrides
- `preset` selects a component-local shape
- `tokens` applies direct component-local overrides

## What Gets Tokenized

### Safe to tokenize

- semantic colors
- typography roles
- spacing and insets
- content max widths
- border/shadow/radius language
- badge and label chrome
- overlay strengths
- simple motion tone presets

### Must stay structural

- chart geometry
- state machines
- conditional layout branches
- per-frame transforms
- data-dependent topology
- routing/path algorithms
- complex reveal choreography coupled to data

The standard is:

**If changing it alters the template's grammar, it is structure.**

**If changing it alters the template's accent, it is identity.**

## Migration Waves

### Wave 0: Foundation

Deliver:

- shared identity types
- token merge helper
- CSS var helper
- backward-compatible base props extension

Exit criteria:

- no template behavior changes
- chapter-marker proof still works

### Wave 1: Low-risk hero templates

Targets:

- `chapter-marker`
- `cold-open`
- `duo-title`
- `sequence-title`
- `timeline-hero`
- `stat-hero`

Goal:

- move typography, spacing, palette, and decorative values into shared hero tokens
- keep structure untouched

### Wave 2: Split/image hero variants

Targets:

- `title-with-frame`
- `stat-hero-with-image`
- `image-title-overlay`

Goal:

- introduce shared image-panel shell tokens
- normalize text/image spacing and frame treatment

### Wave 3: Image-comp families

Targets first:

- `framed-left-text-right`
- `framed-right-text-left`
- `image-with-quote`
- `stat-strip`
- `full-bleed-overlay`

Goal:

- pull repeated panel/badge/source/overlay styling into reusable helpers

Hold for later:

- `cutout-before-after`
- `cutout-shatter`
- `cutout-morph-split`
- `split-image-stat-reveal`

These are logic-heavy and should only be partially tokenized.

### Wave 4: Data-viz easy wins

Targets:

- `waffle-grid`
- `delta-arrow`

Goal:

- tokenize chart identity, stroke, spacing, and motion defaults
- keep chart math intact

### Wave 5: Data-viz structural variants

Targets:

- `bubble-pack`
- `sankey-flow`
- `pyramid-chart`
- `radar-chart`

Goal:

- introduce family-specific `layoutPreset` or `templateVariant`
- do not force pure tokenization where structure differs materially

### Wave 6: Brand-shell isolation

Targets:

- `ops-room-title`
- `wanted-poster`
- Swarajya-specific composition wrappers

Goal:

- separate reusable primitive from locked brand shell
- keep opinionated branded variants as wrappers over a reusable base

### Wave 7: Identity-pack ownership

Deliver:

- named packs mapped from channels and people
- one place to set palette/typography/ornament language
- catalog/demo tooling that can preview the same template across identities

This is where identity becomes vested to people rather than trapped in template copies.

## Family Findings

### Hero

Low-risk token work:

- text-first and number-title heroes
- chapter markers
- simpler editorial title shells

High-risk or brand-locked:

- `ops-room-title`
- `wanted-poster`
- `countdown-hero`
- `map-title`

### Image-comp

Best token candidates:

- frame shells
- overlay gradients
- badges
- source labels
- spacing and title stacks

Hard cases:

- morph, shatter, before/after, reveal-direction templates

### Data-viz

Best token candidates:

- palette roles
- chart chrome
- stroke widths
- typography roles
- motion defaults

Hard cases:

- sankey
- bubble packing
- radar/polar systems
- mirrored pyramid layouts

## Rules

1. Do not tokenize structure math just because it is numeric.
2. Do not create a second source of truth for identity.
3. Do not aim for infinite configurability.
4. Prefer named presets over dozens of raw knobs for production use.
5. Keep the raw knobs in labs and component dev surfaces.
6. Preserve backward compatibility while the migration is in flight.

## Deliverables

### Phase 1 deliverables

- shared identity layer in `templates/shared/identity`
- one migrated hero family
- one migrated image-comp family
- one migrated data-viz family
- lab route pattern for testing token adaptation

### Phase 2 deliverables

- channel-to-identity-pack mapping
- preview tooling for switching identity packs
- wrapper strategy for branded shells

## Success Criteria

The migration is working when:

1. one structure can render under multiple identities without code forks
2. new people/channel looks are created by pack work, not template copying
3. hardcoded identity values shrink materially in template files
4. branded exceptions are explicit wrappers, not accidental defaults
5. the library gets smaller while usable output diversity increases

## Next Move

Start with the foundation and one family from each of these buckets:

- hero
- image-comp
- data-viz

Recommended first set:

- `chapter-marker`
- `cold-open`
- `framed-left-text-right`
- `full-bleed-overlay`
- `waffle-grid`

That is enough to validate the system without overfitting the plan to one template.
