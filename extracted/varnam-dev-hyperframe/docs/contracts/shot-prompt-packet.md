# Shot Prompt Packet

The packet is the creative handoff primitive.

A storyboard can stay rich and expansive. The execution handoff cannot. Builders should receive a compact packet that carries the exact shot argument, the exact references, and the exact failure boundaries.

## Why

Long creative prose makes models generic. Strong output comes from:

- a clear visual argument
- tight references
- explicit negatives
- a small success rubric

One packet should describe one shot family decision. If a beat contains two different arguments, split it into two packets.

## Packet Fields

| Field | What it answers |
|---|---|
| `id` | Which shot this is |
| `editorial_function` | Why this shot exists in the argument |
| `viewer_takeaway` | What the viewer should understand or feel after seeing it |
| `mode` | `full-bleed-image`, `data-viz`, `map`, `composite`, `typography`, `evidence`, etc. |
| `subject` | The thing the frame is actually about |
| `action_or_change` | What moves, reveals, or shifts |
| `setting_or_context` | Where this lives and what world it belongs to |
| `composition` | Layout anchor, scale commitment, depth, focal hierarchy |
| `references` | Style refs, composition refs, identity refs, evidence refs |
| `motion` | Entry, hold, exit, pacing notes |
| `copy_payload` | Only the text that belongs on screen |
| `hard_constraints` | Non-negotiables: palette role, primitive/composition family, source requirement, real-vs-generated rule |
| `negatives` | What must not appear |
| `success_check` | What QC should verify visually |

## Reference Stack

References do different jobs. Separate them instead of collapsing everything into one adjective soup.

- **Style reference**: locks palette, texture, grain, finish
- **Composition reference**: locks framing and spatial hierarchy
- **Identity reference**: keeps a person, object, or prop consistent
- **Evidence reference**: proves what the real thing looks like

If the shot needs consistency, name the reference type explicitly.

## Transmission Rules

1. The packet is what the specialist sees first.
2. Do not dump the full chapter essay into the live builder context.
3. Do not pass a channel manifesto when a taste card plus packet will do.
4. Keep the packet compact enough to scan in one screenful, excluding linked refs.
5. The packet must include negatives. "Make it good" is not a constraint.

## Revision Loop

The loop is:

1. taste card
2. packet
3. contact sheet
4. benchmark reel
5. rubric
6. one-variable revision

When revising, change one major variable at a time:

- reference set
- composition
- motion
- palette role
- on-screen copy

If multiple variables move at once, the team loses the causal read on what improved.

## Minimum Success Rubric

Every packet should be judged on five things:

1. on-brand
2. legible
3. compositionally clear
4. visually specific
5. production-ready

If a shot cannot be scored on those five dimensions, the packet is still too vague.
