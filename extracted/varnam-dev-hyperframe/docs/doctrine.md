# Doctrine

> "No schemas for thinking. Schemas for handoff. No prose for contracts. Prose for taste."
> — ADR-008 (`docs/adr/008-contract-boundaries.md`)

Doctrine is the runtime surface for ADR-008. ADRs are history; this is the live index. Primitives expand per use case — do not invent new frameworks per round.

## How to read this file

- Each primitive is a cross-cutting rule. It has: Principle, Use cases, Enforcement point, Violation signal.
- Use cases show where the rule bites for a specific lane or operation.
- Do not restate primitives elsewhere. `orchestration.md`, `CLAUDE.md`, and agent specs reference primitives by name.
- New failure modes either add a use case under an existing primitive, or surface a new primitive. Never invent a layer.

---

## Primitives

### 1. Routing gate [EXISTING]

**Principle:** (see `CLAUDE.md` §Routing Gate) At any subagent dispatch or multi-step plan kickoff, state in one line: scope read + chosen approach + why. Then commit. Ambiguous inputs become a resolving question, not a dispatch.

| Use case | Where it bites |
|---|---|
| Multi-step plan kickoff | Gate fires before any agent is spawned |
| Subagent dispatch | Gate fires before each individual dispatch |
| Ambiguous input | Gate becomes a resolving question; do not dispatch on two equally plausible interpretations |

**Enforcement:** `CLAUDE.md` §Routing Gate

**Violation signal:** Mid-flight escalation without a new gate; dispatching on an ambiguous scope without resolving it first.

---

### 2. Authority chain [EXISTING]

**Principle:** (see `CLAUDE.md` §Authority Chain) Ordered chain: channel files > `task-config.md` > approved package (script, board canvas, words.json, tagged.txt, render manifest) > editor-written build specs > rendered output.

| Use case | Where it bites |
|---|---|
| Channel file vs storyboard conflict | Channel files win |
| Build spec contradicts approved package | Approved package wins; spec must be corrected |
| Reviewer disputes editor spec | Reviewer disputes against the approved package, not the spec |

**Enforcement:** `CLAUDE.md` §Authority Chain

**Violation signal:** Builder invents visual direction not present in the approved package; narration treated as on-screen text.

---

### 3. Outcome brief [EXISTING]

**Principle:** (see `orchestration.md` §Outcome Briefs) Every dispatch leads with the outcome the agent owns, points to real artifacts by path, and never paraphrases them. The brief does not prescribe method; it states what must be true at exit and what must not be violated.

| Use case | Where it bites |
|---|---|
| Core dispatching researcher | Brief states the claim or finding the researcher must resolve — not the search strategy |
| Editor dispatching audio lane | Brief states the artifact state at exit — not the encoding steps |
| Editor dispatching visual lane | Brief names beat IDs and sibling constraints verbatim — not a rephrased checklist |

**Enforcement:** `orchestration.md` §Outcome Briefs

**Violation signal:** Dispatch carries a method prescription instead of an outcome target; a thin brief the specialist should refuse.

---

### 4. Outcome/Evidence exit lines [EXISTING]

**Principle:** See `orchestration.md` lines 203–212 for the exit-line format. Every agent exits with it; no free-form structure beyond the named lines.

| Use case | Where it bites |
|---|---|
| Core closing a pass | `Outcome:` states the post-condition; `Evidence:` names the paths or checks that make it verifiable |
| Reviewer approving a package | `Outcome:` states what was verified; `Evidence:` names the artifact checks |
| Audio lane returning a render | `Outcome:` + `Evidence:` + `SourceEtag:` line |

**Enforcement:** `orchestration.md` lines 203–212

**Violation signal:** Lane closes with no evidence line; pass marked done without a measurable outcome.

---

### 5. Source fingerprints (SourceClosed/SourceEtag) [EXISTING]

**Principle:** See `orchestration.md` lines 208–212 for the fingerprint line format and pairing rules. A mismatch between the upstream `SourceClosed` sha and the downstream `SourceEtag` sha means the run was aborted.

| Use case | Where it bites |
|---|---|
| Researcher handoff to core | Fingerprint travels with the findings; core detects stale re-reads |
| Audio lane handoff to editor | `SourceEtag` must match the `SourceClosed` sha from core Pass 1 |
| Any cross-lane asset reference | Downstream lane re-checks fingerprint before consuming the asset |

**Enforcement:** `orchestration.md` lines 208–212

**Violation signal:** Handoff references a source without a fingerprint; downstream lane consumes a stale asset without detecting the mismatch.

---

### 6. Handoff verification (three knobs) [EXISTING]

**Principle:** (see `docs/contracts/handoff-quality-knobs.md`) Every lane-to-lane handoff includes the applicable board/manifest decision coverage knob, `audio_pair_etag_freshness`, and `render_survival` with `pass|fail|n/a` per knob. Missing knob status means the handoff is incomplete.

| Use case | Where it bites |
|---|---|
| Standard lane exit | All three knobs checked; applicable knobs must be `pass` or a blocker declared |
| Audio lane exit | `audio_pair_etag_freshness` (existing) + `coverage_ratio >= 0.95` **[NEW — 2026-04-24]** (`aligned_words / expected_words`). Kills the 2026-04-23 silent-truncation class: Gemini truncated at 1243/1519 words, mp3 was silence-padded to full duration, existing knobs passed, render continued. |

**Enforcement:** `docs/contracts/handoff-quality-knobs.md`

**Violation signal:** Expensive downstream pass started with `coverage_ratio` unchecked.

---

### 7. Lane lifecycle (Spawn / Continue / Retire — idle ≠ exit) [EXISTING]

**Principle:** (see `orchestration.md` §Lane Lifecycle — Idle ≠ Exit) Idle is not exit. Exit is the final `Outcome:`/`Evidence:` two-liner acknowledged by the editor. Use `SendMessage` to continue; use `Agent()` only after explicit retirement.

| Use case | Where it bites |
|---|---|
| Standard pass handoff | Use `SendMessage(to=<agent_id>)`; do not re-Spawn |
| Think-tank revision continuity | Reviewer fixes use `SendMessage(to=core)`, not a fresh spawn. Violation shows in the harness as `core-2`/`core-3` (the 2026-04-23 session dispatched core three times and the user flagged it). |
| Idle lane | Remains alive and messageable until explicit `TaskStop` or final message; do not re-Spawn |

**Enforcement:** `orchestration.md` §Lane Lifecycle — Idle ≠ Exit

**Violation signal:** Suffixed agent names (`core-2`, `core-3`); fresh `Agent()` call where `SendMessage` was correct.

---

### 8. Write ownership [EXISTING]

**Principle:** (see `orchestration.md` §Write Ownership) Parallel work is allowed; parallel writes to the same file are not. One live owner per writable file per phase. Siblings send diffs or findings as text; the owner writes.

| Use case | Where it bites |
|---|---|
| Two lanes targeting the same file | One lane owns the write; the other is review-only until an explicit handoff |
| Editor vs specialist on build spec | Editor-written build spec: editor owns the write; specialist proposes changes as text |

**Enforcement:** `orchestration.md` §Write Ownership

**Violation signal:** A lane writes outside its declared ownership boundary without an explicit ownership transfer.

---

### 9. Dispatch granularity [EXISTING]

**Principle:** (see `orchestration.md` §Dispatch Granularity) Specialists get granular, verifiable asks. Valid: one beat, a bounded beat range with the same craft job, named placeholders, one component surface, one audio artifact pass. Invalid: open-ended build territory.

| Use case | Where it bites |
|---|---|
| Core dispatching researcher | One claim or one bounded sweep — not "research everything" |
| Editor dispatching audio+visual | Sequence if order-dependent; batch only when outcomes are independent |
| Specialist ask scoping | Must produce a verifiable `Outcome:`/`Evidence:` line at exit |

**Enforcement:** `orchestration.md` §Dispatch Granularity

**Violation signal:** Dispatch scope so broad it cannot produce a verifiable outcome line; or so narrow it generates unnecessary round-trips.

---

### 10. Package lock [EXISTING]

**Principle:** (see `orchestration.md` §Package Lock) The package is not approved until reviewer has read script, `voiceover.tagged.txt`, the canvas under `direction/board/`, and `direction/render-manifest.yaml` together; the canvas decides film and scene-level viewer experience; the render manifest derives from the canvas and decides timeline placements against realized VO timing; open findings are resolved or explicitly waived. Specialists read only the approved package.

| Use case | Where it bites |
|---|---|
| Build lane reading render-manifest.yaml | Must be the approved version, not a pre-approval draft; must be derived from a locked canvas |
| Reviewer cold-reading the canvas | `direction/board/<scene-id>.md` files exist for every scene the yaml covers; yaml carries no cut the canvas does not name |
| Audio lane reading voiceover.words.json | Must be post-lock; lock must match the current file's fingerprint |
| Specialist reading board canvas | Build must not start before editor approval |

**Enforcement:** `orchestration.md` §Package Lock

**Violation signal:** Specialist reads a pre-approval draft; build started before editor approval.

---

### 11. Classification (taste / craft / execution) [EXISTING]

**Principle:** (see `.claude/skills/varnam/craft/improviser.md` §The Taste vs Craft Decision) Taste: channel-specific values that belong in channel files. Craft: structural patterns that work across channels. Execution: the system already has the principle but the output does not follow it.

| Use case | Where it bites |
|---|---|
| Channel file overrides a craft default | Channel value is taste; craft doc stays as-is |
| Reviewer disputes taste call vs execution failure | Taste: update channel files. Execution: tighten reviewer spec or subagent brief. |
| Editor escalates a craft question to channel | If a craft finding would help any channel, it stays in craft — not channel. |

**Enforcement:** `.claude/skills/varnam/craft/improviser.md` §The Taste vs Craft Decision

**Violation signal:** Craft technique stored in a channel file; taste judgment hardcoded in an execution spec.

---

### 12. Pre-flight native check [NEW — 2026-04-24]

**Principle:** Agent self-gates before expensive work. Cheap verification before expensive operation — always, no exceptions. If the pre-flight fails, the agent reports the failure and does not proceed.

| Use case | Where it bites |
|---|---|
| Before reviewer cold-read | All four package files read and fingerprints match the handoff record before any review begins |
| Before manifest derivation | `words.json` coverage vs script word count >= 0.95 before deriving `direction/render-manifest.yaml` |
| Before render | Every beat's assets resolve; beat timings land in `words.json` |
| Resume preflight (disk-vs-ledger) **[NEW — 2026-04-25]** | On `/varnam` resume against an existing slug: editor `ls`s `story/`, `audio/`, `direction/`, `review/`, `output/` and reconciles against `tasks.md` BEFORE any TeamCreate or Agent dispatch. The disk is canon; `tasks.md` is a report. Failure mode: the 2026-04-24 ugc-dalit run spawned think tank for a Pass 1 that was already done because the editor trusted the ledger. Caught by core's `lane_lifecycle_violation: spawned-not-continued` guard, but cost a wasted dispatch round. |

**Enforcement:** Lives inside each agent's own prompt/spec — agent fails cheap before the expensive op.

**Violation signal:** An expensive pass started on unverified inputs (e.g., manifest derivation on a silently-truncated VO at 1243/1519 words).

---

### 13. Lane sealing [NEW — 2026-04-24]

**Principle:** A specialist owns its retry and failover envelope. The editor sees one dispatch and one result. Internal retries are invisible to the editor; only the final outcome and `provider_used` travel in the handoff.

| Use case | Where it bites |
|---|---|
| Audio lane provider failure | Lane walks the `--fallback` provider list internally, returns `provider_used` in the handoff record |
| Visual lane generation failure | Lane retries internally; editor sees one result, not a series of partial dispatches |

**Enforcement:** Agent spec (`.claude/agents/<lane>.md`) must declare retry ownership explicitly.

**Violation signal:** Editor issued more than one dispatch for the same lane outcome (the 3-audio-dispatches-in-4-min pattern from 2026-04-23).

---

### 14. Editor spec [NEW — 2026-04-24]

**Principle:** The editor has a behavioral contract and is proactive. Authorization is a standing directive until explicitly revoked. Binary recovery forks are resolved by the editor, not parked. The editor publishes a live lane ledger on every Spawn/Continue/Retire.

| Use case | Where it bites |
|---|---|
| Standing authorization | "Go ahead" is a directive; do not re-ask permission after it is given |
| Binary recovery fork | Commit to the safer path, narrate the choice, do not park for user input |
| Lane ledger | Publish current lane state (active, idle, retired) on every lifecycle transition |
| Silence on active work | No silence on an active lane without a surfaced status — concrete threshold set in `.claude/agents/editor.md` (currently ~10 minutes wall time) |
| Post-compaction re-read **[NEW — 2026-04-25]** | When the harness compacts the conversation context, editor must re-read `docs/doctrine.md` and `.claude/agents/editor.md` BEFORE the next tool call. Compaction is a doctrine-context event — the spec lived in the compressed window and must be reloaded as a directive, not a paraphrase. Failure mode: the 2026-04-24 ugc-dalit run hit `/compact` at ~3hr in; nearly every doctrine miss after that point correlates with compaction having displaced the spec. |

**Enforcement:** `.claude/agents/editor.md` — **TODO: this file does not yet exist.**

**Violation signal:** 12+ hour stall on a fork; user asks "status?" unprompted; escalation to "wtf do it yourself."

---

### 15. CLI packaging [NEW — 2026-04-24]

**Principle:** One agent-first CLI surface per lane. Agents invoke verbs, not script paths with per-script flag dialects. The surface is stable across internal restructures.

| Use case | Where it bites |
|---|---|
| Audio lane invocation | `varnam audio <render\|verify\|align>` |
| Visual lane invocation | `varnam visual <plan\|gen\|verify>` |
| Intake invocation | `varnam intake <new\|validate>` |

**Enforcement:** `scripts/run.py` — currently untracked, ~15% built.

**Violation signal:** Agent prompt must name a python script path and per-script flag dialect to invoke a lane operation; breaks on any internal restructure.

---

### 16. Session self-audit [NEW — 2026-04-24]

**Principle:** Every session ends with a self-written `session_learning.md` that audits the path the session took, names doctrine violations by their failure-mode id, and records what the next improviser round should target. Self-correction happens live via named failure modes (§14 editor + per-lane specs); self-audit happens at exit and leaves a persistent trace.

| Use case | Where it bites |
|---|---|
| End of a `/varnam` run | Editor writes `projects/<slug>/session_learning.md` before the final user-facing summary. Named violations with counts. Artifact deltas (which files were redone, which passes re-entered). Recommended improviser target. |
| Session ends without ship | Editor writes the learning anyway. A session that ended without approval is high-signal input — the trace goes to `session_learning.md` and is queued for the improviser post-session hook (`improviser.md` §Post-Session Hook). |
| Mid-session self-correction | Named failure modes fire live (`authorization_reasked`, `fork_parked`, `lane_not_sealed`, `preflight_skipped`, `lane_lifecycle_violation`, `render_coverage_below_threshold`, etc.). The editor does not wait until exit to notice them; the self-audit at exit counts how many fired and whether they were resolved. |
| Session-end signal recognition **[NEW — 2026-04-25]** | Phrases like `show the render`, `trace file`, `session trace`, `done?`, `wrap up`, `log off`, `signing off`, `ill stop here` are session-end signals from the user. Editor must recognize them as exit triggers, write `session_learning.md` BEFORE the casual response, then answer. The 2026-04-24 ugc-dalit run exited via "show the render" → "trace file" and never wrote the audit because the editor treated those as interactive queries. |

**Enforcement:** `.claude/agents/editor.md` — Session self-audit section (see file). Format for `session_learning.md` is fixed so downstream improviser rounds can parse it.

**Violation signal:** A `/varnam` run exited without a `session_learning.md` on disk. A session that ran clean still produces one — a one-line `Path audit: clean` is valid content, not a skip.

---

## What this file does not contain

- Channel taste — stays in `channels/<name>/`
- Craft technique — stays in `.claude/skills/varnam/craft/`
- Per-lane execution specifics — stay in `.claude/agents/*.md`
- Contract schemas — stay in `docs/contracts/`
- Full ADR content — ADRs stay as history in `docs/adr/`
