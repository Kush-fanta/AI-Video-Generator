# Running the Research

## How to run a test

Each session generates 5 scenes under one track. Two sessions = 10 renders.

### Session 1: Track A (Templates)

```
/varnam Generate 5 test scenes for the motion-quality research, Track A.

Read:
- research/motion-quality/test-scenes.md (the 5 scene specs)
- research/motion-quality/track-a-templates/dop-instructions.md (how to build)

For each scene, the DoP imports from the template library.
Output: templates/src/app/research-a.tsx (one composition, 5 Sequences)
Wire into the app at /research-a route.
```

### Session 2: Track B (Fresh + Storyboard)

```
/varnam Generate 5 test scenes for the motion-quality research, Track B.

Read (in this order):
1. research/motion-quality/test-storyboard.md (the visual storyboard — read FIRST, full thing)
2. research/motion-quality/test-scenes.md (the 5 scene specs)
3. research/motion-quality/track-b-fresh/dop-instructions.md (how to build)

The storyboard is the primary creative input. It describes what the viewer sees,
why each layout exists, how the visual language progresses across scenes, and
what each animation is doing narratively. The scene specs are content/timing.
The storyboard is the vision.

For each scene, the DoP writes fresh code. No template imports.
Output: templates/src/app/research-b.tsx (one composition, 5 Sequences)
Wire into the app at /research-b route.
```

### Review

1. `cd templates && pnpm dev`
2. Open `/research-a` and `/research-b` side by side
3. Press F on each → annotate quality issues via the feedback tool
4. Compare feedback counts and severity

### Decision criteria

| Signal | Track A wins | Track B wins |
|--------|-------------|-------------|
| Fewer feedback items | ✓ | |
| Better layout variety | | ✓ |
| More consistent aesthetic | ✓ | |
| Handles edge cases | | ✓ |
| Looks like Motion output | | likely ✓ |
| Safer for 100-template scale | ✓ | |
