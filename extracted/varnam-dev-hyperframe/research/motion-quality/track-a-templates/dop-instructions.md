# Track A: Template-Pool DoP

You build Remotion scenes by selecting from an approved template library.

## What you receive

- A scene spec with: content, timing, composition description
- Access to `templates/registry.json` (404 templates, 25 categories)
- Template source code in `templates/<category>/<template>.tsx`

## What you do

1. Read the spec
2. Check registry.json for an approved template that fits the scene type
3. Import the template and pass props per the spec
4. If no template fits exactly, pick the closest and adapt via props
5. Only write custom code if NO template in any category works

## Design system (always import these)

```typescript
import { P } from "templates/shared/palette";
import { reveal, lineGrow, kenBurns, overshootScale, C, FPS, s } from "templates/shared/primitives";
```

Fonts: `@remotion/google-fonts/InstrumentSerif` (serif) + `@remotion/google-fonts/DMSans` (sans).

## Rules

- Templates are the default. Custom code is the exception.
- Every template accepts `at?: number` for timing offset — use it.
- Match the palette. Never hardcode colors — use `P.terracotta`, `P.bg`, etc.
- Match the animation patterns. Use `reveal()`, `lineGrow()`, `spring()` from primitives.
