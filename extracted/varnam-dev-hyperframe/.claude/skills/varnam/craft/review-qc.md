# Review And QC

Review and QC are a workbench, not a verdict button.

## Review Desk Principles

**Queue first.** A reviewer needs to see what is blocked, what is fresh, and what already has open frame issues before opening a render or composition. The queue must carry verdict state and issue pressure together.

**Verdict and issue are different layers.** Frame notes are a temporary working layer. The lasting note is the verdict note in the registry. Promote precise frame findings into the verdict before shipping; do not let the archive depend on scattered annotations.

**Never approve through unresolved evidence.** If a render or composition still has open frame issues, approval is premature. Resolve them, convert them into a concrete polish brief, or reject the piece.

**Review from motion, not layout theory.** The live render is the source of truth. Read the motion, hold duration, and landing behavior from playback, then write the note. Static reasoning is supplementary.

**Targeted proof before full rerender.** For frame-level issues, render the exact frame or a few surrounding frames. For motion, timing, or audio-sync issues, render the smallest segment that contains setup, failure, and recovery. Use full-length rerenders for global questions, not local fixes.

**Inverted verification economy — cheapest check first.** Review escalates from component → chapter → full-film low-res → Gemini video mode. A component defect (prose in a short-label slot, wrong scale, broken legibility) must not be caught at the full-render tier when a single-composition render would have caught it in seconds. When an mp4 of the whole film exists, Gemini video mode replaces frame extraction as the default QC instrument — frame extraction is reserved for isolating a specific component question.

**Placeholder lint before any render.** Before a render kicks off, `python3 scripts/run.py render:preflight` greps composition props for a placeholder blocklist (`PENDING|TODO|TBD|XXX|FIXME|PENDING RESEARCHER CONFIRM`) and fails the build if hit. Placeholder strings must never reach screen; they are a hard block, not a soft note.

`scripts/review/preflight_render.py` is the pre-render wrapper over the shared timing contract, not a separate rule set. After render, `scripts/review/postflight_render.py` can report `passed`, `failed`, or `partial`; `partial` means required checks were skipped and the review is still open.

**Contact sheet before commitment.** For a new channel, a major identity rewrite, or any chapter stuck after two review cycles, stop full-length iteration and render a 12-frame contact sheet plus a 20-30 second benchmark reel from the representative chapter. Judge taste there before spending another full render.

**One-variable revisions.** Change one major variable per loop: layout, reference set, motion, palette role, or copy. When five things change at once, the pass/fail signal disappears.

**Promote then prune.** Once a temporary finding becomes a lasting rule in `channels/`, `craft/`, or `tools/`, delete the scratch note that carried it. System memory lives in the maintained files, not in drifting feedback crumbs.

**Treat broken composition asset paths as render blockers, not review notes.** If a frame 404s on `images/` or `audio/`, link the active project's assets into repo-root `public/`, rerender the broken frame, and only then judge the work. Do not review through placeholders or missing media.

**Renderable fallback is not production.** A fallback may keep the runtime from crashing, but it does not satisfy creative coverage. If a production render shows cut ids, `IMAGE`, `TYPOGRAPHY`, missing-asset labels, storyboard intent, scene prose, or other build-language on screen, the render fails. The fix is not a prettier fallback; either source the referent, replace the beat with an authored data/map/document treatment, or send the package back upstream.

**Postflight quality failures are hard gates.** If `postflight_render.py` fails cut-rate or visual-novelty thresholds, the video is not "rendered with warnings." It is an open editorial failure. Long low-novelty plateaus usually mean missing assets, wallpaper images, or one-mode execution. Reviewer must name the exact time windows and the beat ids causing them before any next render.
