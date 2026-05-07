# Primitives And Sprites

Varnam uses motion-design vocabulary because HyperFrames is an executable visual system, not a template picker.

## Terms

- **Primitive**: a reusable visual or motion building block. Examples: grid field, glow line, text reveal, phone frame, chart bar, connector line, coin disc, light streak, particle field, map marker, safe-area label.
- **Sprite**: a visual asset treated as a movable object. Examples: cutout person, logo mark, coin PNG, document scan, phone screenshot, generated character, source frame, particle image.
- **Composition**: an executable HyperFrames scene or nested scene that arranges primitives and sprites over time.
- **Recipe**: the per-story rule for how primitives, sprites, text, sound, and transitions combine. Recipes live in the board index first; compositions implement them.

## Doctrine

No generic template picking.

The board does not say "use hero card, stat card, timeline card." The board names the story-specific system:

- what primitives the story needs
- what sprites exist or must be created
- what each primitive/sprite does for the argument
- how they move, collide, repeat, and escalate
- what visual grammar is forbidden

The render manifest then binds that system to runtime:

```yaml
composition: "compositions/product-network.html#network"
variables:
  headline: "Global"
  sprites:
    - id: "coin-main"
      src: "assets/coin.png"
      role: "recurring trust token"
  primitives:
    grid: "world-space-dark"
    connector: "neon-routing"
    reveal: "music-hit-wipe"
```

The exact variable schema belongs to the selected composition. The board owns the why; the manifest owns the binding; HyperFrames owns execution.

## Board Index Requirements

`direction/board/index.md` should name:

- **primitive set**: the reusable building blocks this story needs
- **sprite pack**: logos, people, documents, UI captures, generated assets, source frames, and any recurring tokens
- **composition recipes**: how primitives and sprites combine into repeatable scene types
- **motion grammar**: reveal timing, hits, holds, loops, light behavior, camera/parallax rules
- **collision rules**: safe areas, text/image overlap rules, label avoidance, UI density limits

If the board index only lists component names, it has failed. Components are implementation. Primitives and sprites are the story's visual vocabulary.

## Mograph Requirements

Mograph may:

- bind a cut to an existing composition
- adapt a composition interface
- author a new composition from locked primitive/sprite requirements

Mograph may not:

- choose a generic template because it is available
- invent primitives or sprites not implied by the board
- hide missing story logic inside a pretty component
- use default motion when the design pack names a primitive behavior

## Reviewer Requirements

Reviewer blocks:

- board indexes that list templates without primitive/sprite jobs
- manifests with `composition` bindings but no clear variable payload
- repeated sprites that are not declared as motifs, callbacks, continuity, or deliberate returns
- compositions whose primitives overlap text, labels, people, maps, or UI in incoherent ways
- visual systems where every scene is a different one-off instead of a reusable recipe family

## Why This Matters

Strong video systems feel designed because the same few primitives and sprites recur with purpose. Weak systems feel like slides because each beat selects a card. The path to brand-ad quality is not more templates. It is a stronger primitive set, a coherent sprite pack, and recipes that adapt to the story.
