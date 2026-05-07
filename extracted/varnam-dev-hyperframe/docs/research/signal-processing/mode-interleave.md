# Mode Interleave

## What it measures

`mode_interleave` measures how a timed storyboard rotates between canonical visual modes over time.

It reads an authored storyboard table with explicit scene durations and mode labels, then computes:
- how much time each canonical mode owns
- how many mode switches occur
- the longest uninterrupted run for any one mode
- whether the storyboard collapses into long stretches of the same language

This is a storyboard-time signal, not a rendered-video signal.

## Why this metric is valid

The craft principle is simple: visual modes need to cycle, not appear as isolated interruptions inside one dominant mode.

That principle already exists in Varnam craft:
- no one mode should dominate too long
- text, data, diagram, map, archival, and image beats should rotate as a pattern
- a storyboard can fail this before any frame is rendered

So the metric is standing in for a real editing and graphic-design rule:
- visual rhythm is not only cuts
- it is also the alternation of visual languages

If the storyboard spends 45 seconds in text, then 40 seconds in text again, that is already a structural failure.

## Input contract

First version requirement:
- markdown storyboard
- timed scene table present
- table must include `Duration` and `Mode` columns

Example:

```md
| # | Frames | Duration | Scene | Mode |
|---|---|---|---|---|
| 1 | 0-120 | 4s | Cold open text | Text hero |
| 2 | 120-330 | 7s | Correction | Text correct |
| 3 | 330-570 | 8s | Scarcity detail | Text statement |
| 4 | 570-720 | 5s | Pivot text | Text pacing |
| 5 | 720-900 | 6s | 1954 hero | Data hero |
```

Untimed prose storyboards should fail loudly instead of pretending precision.

## Canonical modes

Raw storyboard labels are collapsed into stable families:
- `text`
- `data_viz`
- `diagram`
- `map`
- `archival`
- `composite`
- `bridge`

This keeps the signal durable even when individual scene names vary.

## Output shape

```json
{
  "script": "mode_interleave",
  "score": 0.87,
  "pass": true,
  "effective_mode_count": 6,
  "switch_count": 27,
  "max_mode_run_seconds": 32.0,
  "mode_fractions": {
    "text": 0.388,
    "data_viz": 0.287
  },
  "findings": []
}
```

Key fields:
- `effective_mode_count`: how many canonical modes actually appear
- `switch_count`: how often the active mode set changes
- `max_mode_run_seconds`: longest uninterrupted run for one canonical mode
- `distribution_entropy`: normalized spread across modes

## Use cases

### 1. Storyboard gate before render

Catch structural flatness early:
- text runs too long
- data runs pile up without a reset
- there are too few distinct modes in the whole piece

### 2. Chapter planning

Check whether the chapter sequence is actually rotating language:
- abstract -> concrete
- number -> proof
- diagram -> human anchor

### 3. Variant comparison

When two storyboards tell the same story, compare which one:
- switches modes more often
- distributes time more evenly
- avoids dominant-mode plateaus

### 4. Reviewer compression

Replace vague comments like:
- "too much text"
- "this section feels samey"
- "we stay in data mode too long"

with a deterministic trace.

## Current evidence

Measured on `benchmarks/signal-processing/fixtures/storyboards/pfbr-timed-storyboard.md`:
- `effective_mode_count`: `6`
- `switch_count`: `27`
- `distribution_entropy`: `0.825`
- `max_mode_run_seconds`: `32.0`

That matches the creative read: the chapter plan rotates across text, data, diagram, archival, map, and bridge, but it still has one extended late data run.

## What it does not do

It does not prove the render is visually alive.

A storyboard can rotate modes well and still produce:
- weak frame-to-frame change
- repeated layout skeletons
- dead transitions

That is why `mode_interleave` belongs beside render-time signals, not instead of them.
