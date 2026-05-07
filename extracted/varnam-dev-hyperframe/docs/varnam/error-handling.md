# Error Handling Rules — Varnam Pipeline

Pipeline order: script + board/source → audio → render-manifest derivation → image generation → timeline validation.
Each step is a hard dependency. Never claim the project is ready when a required artifact is missing or invalid.

---

## 1. Generation Failures

### Partial batch failures
- After any batch (images, voiceover segments, video clips), report a succinct summary:
  ```
  Images: 9/12 succeeded. Failed: beat-04, beat-07, beat-11
  ```
- Pause and ask the user before retrying failed items. Do not auto-retry silently.
- If more than half the batch fails, stop the entire stage and diagnose before continuing.

### Never proceed with missing assets
- Treat a missing or zero-byte artifact as a hard blocker.
- Do not start the next stage until the current stage is fully resolved.
- The only exception: the user explicitly acknowledges and accepts placeholder behavior.

### ElevenLabs hard stops
- `401 Unauthorized` → stop immediately. Report: "ElevenLabs API key is invalid or missing. Set ELEVEN_LABS_API_KEY in repo .env and retry."
- `quota_exceeded` / `429` with quota message → stop immediately. Do not retry. Tell the user their quota and what was consumed so far.
- Rate-limit `429` (transient) → wait, then retry once. If it fails again, stop and report.

### Gemini hard stops
- `RESOURCE_EXHAUSTED` → stop. Report quota status if available. Do not flood retries.
- Any image returned as empty/corrupt → mark that beat as failed, report it, ask before retrying.

---

## 2. Timeline Validation

### Pre-handoff check
Verify all of the following before declaring the project package complete:
- [ ] Every timeline entry has a corresponding image file (non-zero size)
- [ ] `audio/voiceover.mp3` exists and has non-zero duration — voiceover/hybrid mode only (`ffprobe` check)
- [ ] `audio/voiceover.words.json` timestamps are monotonic and within audio duration — voiceover/hybrid mode only
- [ ] `audio/timing.lock.json` exists and checksum matches current `audio/voiceover.words.json`
- [ ] `story/script.md`, `direction/board/index.md`, and `direction/board/<scene-id>.md` are approved for the current board lock
- [ ] `audio/voiceover.source.txt` exists and was used for the latest voiceover run
- [ ] `direction/render-manifest.yaml` is derived from the approved board package + `audio/voiceover.words.json`
- [ ] Every entry has `narration` (voiceover mode) or `narration: null` (music/duration mode)
- [ ] `timing_mode` is set when not using voiceover
- [ ] All image files are valid (non-zero size, correct extension)
- [ ] Aspect ratios are consistent across images (warn if mixed)
- [ ] Timeline entries are ordered, non-overlapping, and stay within runtime duration
- [ ] Spoken anchors stay within audio duration even when runtime duration is longer

If any check fails, report the full checklist with pass/fail status. Do not present the package as ready until it is clean.
Use `python3 scripts/run.py render:preflight` as the shared timing-contract wrapper before render, not as a separate rule source.

### Post-render validation
If a render is completed, run `python3 scripts/run.py render:postflight` for the first deterministic pass. Its `partial` status means required checks were skipped because inputs were missing; that is not a ship state and should be treated as review-needed.

### Coherence failures
- If `timeline.json` has gaps, overlaps, or image paths that do not resolve, stop and repair the timeline instead of hand-waving the issue.
- If beat imagery clearly fails the narration match, stop and report the offending entry IDs.
- If a generated artifact claims success but the files do not exist, treat that as a stage failure.

---

## 3. Script and Tool Exit Codes

- Any script in `scripts/` that exits non-zero → stop and report the error before doing anything else.
- Always surface stderr to the user. Never swallow it.
- Do not retry the same command more than once without first diagnosing the stderr output.
- If a script fails twice with the same error, escalate to the user with the full error text and ask for instructions.

---

## 4. Project Package Checklist

Run this before marking a project complete. Report as a checklist, not prose.

```
Project package validation:
[ ] direction/board/index.md               — exists
[ ] direction/board/<scene-id>.md           — exists
[ ] audio/voiceover.source.txt              — exists, generated with current run
[ ] direction/render-manifest.yaml                — derived from approved board + words.json
[ ] audio/voiceover.tagged.txt  — exists
[ ] audio/voiceover.mp3         — exists, duration > 0s
[ ] audio/voiceover.words.json  — exists, parseable
[ ] audio/timing.lock.json      — exists, checksum parity with audio/voiceover.words.json
[ ] runtime duration authority  — exists, parseable, >= VO duration
[ ] images/refs/                — present when board direction requires refs
[ ] images/beats/               — every timeline image exists, size > 0
[ ] timeline.json               — exists, parseable, ordered, duration-safe
[ ] aspect ratios               — consistent (warn if mixed)
```

Any `[ ]` that cannot be checked → fail it, do not skip it.

Timing gate command:

`python3 scripts/run.py render:preflight <project_dir> --require-lock`

---

## 5. API Rate Limits and Quotas

### ElevenLabs
- Character quota: check remaining quota before large voiceover jobs if the API provides it.
- If a request is rate-limited (`429`, transient): wait the time specified in `Retry-After` header, retry once.
- If rate-limited again: stop. Report the limit and ask the user how to proceed.
- Never send concurrent voiceover requests beyond what the account tier allows.

### Gemini
- Image generation: do not exceed the per-minute request limit. Use the concurrency already set in `consistency.py` or the manifest runner.
- On `RESOURCE_EXHAUSTED`: stop the batch, report how many succeeded before the limit hit, ask before resuming.
- Do not implement exponential backoff that runs silently for more than 30 seconds without a user-visible status update.

### General
- Any API failure that consumes quota or money should be reported before retrying.
- Prefer stopping and asking over automatically spending more API budget.
