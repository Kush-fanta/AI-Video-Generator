# ADR-008: Contract Boundaries — Prose for Thinking, Structure for Handoff

## Status: Accepted (2026-04-14)

This is the current boundary policy: prose for thinking, explicit structure only at
handoff boundaries, and no broad prose-only contract sprawl.

## Context

Varnam was built in reaction to a real failure mode: when the model is forced to think inside rigid schemas, it starts optimizing for field completion instead of editorial judgment. The system correctly pushed back on that. `docs/varnam/agent-design.md` makes the case directly:

- do not turn the system into a workflow engine
- do not over-engineer handoff contracts
- keep the Bible prose-first

That instinct protected creative range. It also avoided a second failure mode: premature taxonomies that make the model dumber.

Production has exposed the opposite problem:

1. Constraints did not disappear; they spread into prose.
2. The same requirements now live across `SKILL.md`, ADRs, reviewer prompts, hooks, checklists, and project files.
3. Handoffs that need exact values are partially structured in spirit but not always explicit in form.
4. Harness portability gets harder when contracts are implicit in narrative docs and coordination prose.
5. The same contract should survive different coordination models. Claude Code may run self-coordinating agent teams with direct inter-agent messaging and shared task claiming, while other harnesses may use simpler lead-worker or adapter patterns.

This is progress, not drift. ADR-006 introduced `task-config.md` as an explicit intent lock. ADR-007 introduced structured `research/findings.md` output and reviewer `route` fields. The system is already moving toward explicit contracts where ambiguity hurts production.

The unresolved question is not "schema or no schema." The real question is where structure belongs and where it becomes a cage.

## Decision

Adopt the following principle:

**No schemas for thinking. Schemas for handoff. No prose for contracts. Prose for taste.**

This means:

1. **Creative discovery stays prose-first.**
   Channel files, treatments, scripts, direction, and most storyboard reasoning remain human-readable and model-readable documents. They are where judgment lives.

2. **Stage boundaries get explicit contracts.**
   When one agent, tool, or harness must reliably consume an output, the required facts move into a narrow, explicit contract.

3. **Contracts are sidecars or focused sections, not replacements for the creative artifact.**
   We do not rewrite the treatment as JSON. We keep `treatment.md` and add only the minimal structured layer that downstream systems need.

4. **Validation happens at boundaries, not during thought.**
   The model should not be forced to think inside a schema while exploring. Validation occurs when handing work to another agent, tool, or render/review stage.

5. **Schemas stay narrow and boring.**
   A contract should capture only the fields needed for execution, review, or portability. If a field exists only to force a style of thinking, it does not belong in the contract.

6. **Contracts describe remediation lanes, not internal org charts.**
   The boundary artifact should say what kind of follow-up work is needed, not which named agent inside one harness should do it.

## Contract Classes

### 1. Prose artifacts — no schema

These remain prose-first and are judged editorially:

- `channels/<name>/narrative.md`
- `channels/<name>/design.md`
- `story/narrative.md`
- `direction/treatment.md`
- `audio/voiceover.tagged.txt`
- the reasoning views derived from `direction/board/`
- craft docs

These documents exist to expand the model's judgment, not to constrain it.

### 2. Execution contracts — explicit structure

These are the first-class boundary contracts in the system:

- `projects/<slug>/task-config.md`
  - source of truth for core message, anti-goals, tone arc, visual approach, key subjects, target length, research requirements
- `research/findings.md`
  - verified facts, disputed claims, media manifest, licensing state
- reviewer findings
  - location, expected, actual, severity, remediation lane
- render/report artifacts
  - what was rendered, from which inputs, what failed, what was skipped
- timeline and alignment artifacts
  - exact timestamps, frame math, asset paths

These may be implemented as:

- frontmatter
- sidecar JSON/YAML
- machine-readable fenced sections
- small dedicated structured files

The format is less important than the rule: downstream consumers must not have to infer critical facts from prose.

Harnesses are free to map the same contract differently:

- Claude Code can route a finding through a self-coordinating agent team.
- Codex can map the same finding to a coordinator plus one worker.
- Another runtime can map it to queue names, services, or adapter calls.

The artifact should stay stable even when the internal coordination model changes.

### 3. Deterministic gates — measured, not narrated

Anything that is a measurement problem should become a deterministic gate instead of an LLM opinion:

- slideshow risk
- cut-rate validation
- mode distribution
- text readability on mobile
- silence and masking checks
- asset existence and dimension fidelity

These are not taste contracts. They are production safety rails.

## Boundary Rules

### Rule 1: Structure the minimum needed for the next consumer

If a downstream agent, script, or harness needs 8 facts, encode those 8 facts. Do not invent 30 more.

### Rule 2: Never force the model to author creative work inside a schema

Treatments, scripts, direction, and editorial choices should be authored in prose. Contracts can summarize or pin the decisions after they are made.

### Rule 3: Every hard gate must justify its existence

A hard gate must be one of:

- identity-preserving
- budget-protecting
- failure-preventing
- portability-enabling

If it does not meet one of these tests, it should be advisory craft, not enforcement.

### Rule 4: Remove prose contracts when a contract becomes explicit

If a requirement is now captured in a structured boundary contract, delete duplicate prose obligations from general doctrine where possible. The goal is to reduce spilled constraint, not add another layer.

### Rule 5: Keep taste separate from contracts

Specific visual or audio values belong in channel config and channel prose. Contracts carry the chosen values, not the taste rationale behind them.

### Rule 6: Keep agent identity out of portable contracts

If a field names a harness-specific role such as `core`, `researcher`, or `editor`, it is probably too close to one runtime. Prefer a portable remediation lane such as narrative rewrite, research correction, visual replan, or render rerun.

## Initial Scope

This ADR does **not** introduce a schema-heavy state machine.

It does **not** require:

- turning the entire project workspace into JSON
- replacing prose storyboards with manifests
- replacing channel identity with playbooks or enums
- forcing all agents to read/write formal schemas for every step

It **does** endorse formalizing a small number of boundaries first:

1. `task-config`
2. `research/findings`
3. reviewer findings
4. render report
5. timeline/alignment handoff

## Consequences

### Positive

- Creative work keeps its range because the model still thinks in prose where it should.
- Handoffs become easier to validate and easier to port across harnesses.
- Hard requirements stop leaking across dozens of prose files.
- Review and enforcement can shift from vague reminder text to precise checks.
- Multi-agent and multi-harness support gets simpler because the stable facts are explicit.
- Claude-specific advantages are preserved at runtime instead of being flattened into the contract layer.

### Negative

- Some existing doctrine and prompts will need pruning to avoid duplicate obligations.
- There is a risk of sidecar sprawl if every artifact gets its own contract without discipline.
- The team will need to decide when a repeated prose expectation has become important enough to formalize.

## Implementation Guidance

When adding a new boundary contract, ask:

1. Who consumes this next?
2. What exact facts do they need?
3. What is the cheapest format that captures those facts?
4. What prose obligations can now be deleted?

If those questions do not produce a small answer, the contract is too broad.

## Relationship to Existing Decisions

- **ADR-001** remains correct: taste, craft, and tools stay separate.
- **ADR-004** remains correct: prose philosophy and literal production values should not live in the same file.
- **ADR-006** is strengthened: `task-config.md` is explicitly a boundary contract, not just a convenience document.
- **ADR-007** is strengthened: structured findings and routing are valid contract surfaces for team coordination, but the route should represent a remediation lane rather than a harness-specific role.
- **docs/varnam/agent-design.md** remains correct in spirit but should be interpreted more narrowly: avoid schema-heavy thinking constraints, not all explicit boundary contracts.

## Harness Note

Claude Code agent teams are a strong coordination runtime, not the contract model. They provide multiple independent sessions, direct teammate messaging, and shared task coordination. That is an advantage for execution, but the boundary artifacts should remain portable to runtimes that do not share Claude's team semantics.

## Next Step

Follow-up work should identify which current prose requirements are true contracts and relocate them into the smallest explicit boundary artifacts possible.
