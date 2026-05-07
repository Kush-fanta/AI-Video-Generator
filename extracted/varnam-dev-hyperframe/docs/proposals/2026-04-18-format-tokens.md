# Format Tokens

**From:** Claude
**To:** Debasish
**Date:** 18 April 2026

## Decision

Introduce a declared `format` token at the channel (and optionally project) level. Craft rules gate on the token instead of hand-waving format scope in prose.

Not building this yet. Building it the moment a second format lands that behaves differently from storytelling explainer.

## Why

Craft docs currently carry prose scope qualifiers:

> *"mode rotation obligation, applies to storytelling explainer format; lecture, essay, or slow-cinema formats are exempt"*

This works while there is only one format in production. It breaks the moment a second format arrives and the qualifier either gets ignored (reviewer fires the wrong rule) or silently drifts (craft doc becomes a fiction). Prose scope is a promise against a machine-readable world. Token scope is the contract.

## Shape

### Declaration

One line in `channels/<name>/config.md`:

```
format: explainer
```

Optional override in `projects/<slug>/task-config.md` when a channel runs a different format for one project:

```
format: shorts
```

### Token values

Initial set — only what's real or imminent, not speculative:

| Token | What it means | Behaves differently because |
|---|---|---|
| `explainer` | Long-form argument-driven explainer, VO-led, 10–20 min | Mode rotation mandatory, 15s pure-type ceiling, 4–5s avg frame |
| `shorts` | Vertical short-form, 15–60s | Density ceiling tighter, first 2s is pure hook, no chapter structure |

Add tokens only when the format actually onboards. No speculative `cinematic`, `lecture`, `ad-60s` until a channel needs them.

### Craft rules gate on the token

Failure modes in `craft/storyboarding.md` change from:

> *"runs 3+ consecutive beats in a single mode — explainer-format rule; meditative or observational formats may hold deliberately"*

to:

> *"`format ∈ {explainer, shorts}`: runs 3+ consecutive beats in a single mode"*

Reviewer reads `format` before firing a rule. No ambiguity.

### Density targets stay in channel files

Format tokens gate *whether* a rule fires. The specific numbers (80+ media beats, 4–5s avg frame, 15s pure-type ceiling) stay in `channels/<name>/visuals.md` because they are calibrated taste, not universal law. A different explainer channel might tune to 60 beats and 20s ceiling. Same format, different taste.

## What this replaces

- Hand-scoped prose qualifiers in `craft/storyboarding.md` Failure Modes (3 rules)
- Hand-scoped prose in `craft/storyboarding.md` Visual Ground "Density is an obligation" section
- Any future "for X format" qualifier that would otherwise accumulate

## What this does NOT touch

- Channel identity tokens (palette, type system, frame vocabulary) — that's the template-identity-tokenization proposal's territory
- Project-level brief (`task-config.md` stance, proof modes, anti-goals) — those stay prose, they're per-project judgment, not format-wide gating

## Build trigger

Do not build until one of:

1. A second format channel onboards (cinematic-docu, lecture, ad-short, shorts-only)
2. A reviewer fires the wrong rule on a current channel because the prose scope got ignored
3. A second prose qualifier needs to be added to a craft doc (means the pattern is repeating)

Before that trigger, the prose scope in `craft/storyboarding.md` is sufficient. Building the token system earlier is premature abstraction.

## Open questions

1. Where does `format` get enforced? Channel config is the obvious place, but reviewer agents would need to read it every run. Cheap if the token lives in a known path; expensive if it requires a new load stack.
2. Does the shorts vs. long-form split warrant two tokens or one token with sub-values? Leaning one flat token — two is easier to gate than nested.
3. Do we want `format` to be a list (`format: [explainer, ad-60s-cutdown]`) for pieces that live in two worlds? Probably not at v1 — single value keeps the rule gates clean.

---
