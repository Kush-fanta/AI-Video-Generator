# Capability Surface Contract

**Status:** Experimental (2026-04-21)

**Scope:** Varnam's application-layer ability model.

This contract sits above Claude Code native tools and below Varnam's taste/craft doctrine.

- Claude Code native tools answer: what the runtime can do.
- Varnam capabilities answer: what this product can do for a user right now.

## Goal

Give the editor and downstream agents one canonical place to answer:

- which abilities exist
- what each ability is called
- which lane owns it
- what inputs it requires
- what artifacts it produces
- whether it is `live`, `partial`, `stub`, or `deferred`

The capability layer is not another workflow engine. It is a thin product surface over the orchestration system that already exists.

This surface is experimental. It is allowed to replace scattered routing prose where it proves useful, but it should not be treated as final doctrine until the duplicated router logic has actually been shed.

## Authority

The machine-readable authority is:

- `docs/contracts/capability-registry.json`

The schema authority is:

- `docs/contracts/capability-registry.schema.json`

Execution docs such as `.claude/agents/*.md`, `.claude/skills/varnam/SKILL.md`, and `.claude/skills/varnam/orchestration.md` explain *how* a lane works.
The capability registry answers *whether that outcome is available at all* and what the app-level boundary looks like.

If there is drift:

1. lane docs remain authority for execution mechanics
2. capability registry remains authority for app-level status and boundary shape
3. the drift should be fixed immediately instead of tolerated in prose

## Status Semantics

### `live`

The ability is usable in normal production flow.

- the owning lane exists
- required surfaces are documented
- expected artifacts are known
- there is a verification path

### `partial`

The ability works only for a bounded subset.

- some outcomes are live
- some outcomes still require manual narrowing, user auth, or an explicit fallback
- the boundary must be stated before dispatch

### `stub`

The interface is acknowledged, but production execution is not wired.

- the repo may contain a placeholder doc or planned path
- agents must not present this as available
- the fallback must be explicit

### `deferred`

The ability is intentionally out of live production scope.

- this is stronger than "not yet documented"
- the lane should refuse it directly and point to the live subset

## Required Fields Per Capability

Each capability entry must declare:

- `id` — stable application-layer verb
- `summary` — one-sentence outcome
- `stage` — where it sits in the production flow
- `owner_lane` — the lane that owns the result
- `status` — `live|partial|stub|deferred`
- `intents` — request shapes that should route here
- `requires` — minimum required inputs
- `outputs` — durable artifacts or result surfaces
- `authority_inputs` — files or contracts the lane treats as source of truth
- `native_surfaces` — Claude/native/tool/script surfaces used underneath
- `verification` — how success is checked
- `fallback_or_block` — what to do when the ability is not fully available

## Routing Rule

The editor routes in this order:

1. classify the user's ask into one or more capability ids
2. check capability status in `capability-registry.json`
3. only then choose the lane

This avoids the current failure mode where the system knows who *would* own a task but not whether the product can actually do it.

## Boundary Rules

### 1. Capabilities are user-facing outcomes, not internal role descriptions

Good:

- `generate_voiceover_and_timing_lock`
- `research_evidence_and_media`
- `review_render_and_diagnose`

Bad:

- `audio_agent`
- `reviewer_team`
- `specialist_dispatch`

### 2. A capability is not a tool

Do not register low-level implementation details here:

- `run_ffmpeg`
- `call_gemini`
- `use_engine_specific_sequence_component`

Those belong in lane docs or tool docs.

### 3. A capability is not taste

Do not encode channel-specific style in the registry.

The registry answers availability and boundaries, not how Swarajya or another channel should feel.

### 4. Partial means explicit narrowing, not silent optimism

If only the image half of a visual lane is live, the registry must say that.
If Workspace depends on user-owned auth, the registry must say that.

### 5. Registry entries stay thin

If a field does not change routing, boundary understanding, or verification, it probably does not belong here.

## Maintenance Rule

Whenever a lane doc adds or removes a real ability, update the registry in the same change.

The registry is not reporting. It is product truth.
