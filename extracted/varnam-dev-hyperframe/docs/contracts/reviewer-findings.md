# Reviewer Findings Contract

**Scope:** Any creative-team reviewer output, including diagnostic investigations, that must be handed to a remediation coordinator, execution lane, or harness adapter.

## Goal

A single, transportable output shape so any harness can consume reviewer findings, including diagnosis-backed findings, and route fixes deterministically.

## Boundary rule

This contract applies only at the handoff boundary.

- Reviewer thinking may remain freeform.
- Only the emitted findings artifact must conform to this shape.
- `artifact_type` answers where the problem lives.
- `issue_type` answers what kind of problem it is.
- `route` answers which remediation lane should absorb the issue.
- Harnesses may map the same lane to different internal agents, teams, or workflows.

## Envelope

- `schema_version`: required, integer. Use `2` for the diagnosis-capable reviewer contract below.
- `result`: required, one of `pass`, `needs_fixes`, `blocked`.
- `total_findings`: required, integer.
- `total_findings` must equal `len(findings)`.
- `findings`: required, array of finding objects (may be empty when `result = pass`).

## Finding fields

### Required

1. `id`
- Stable identifier for idempotency and traceability (e.g., `rf-001`).
- Rationale: lets editor dedupe reruns and reference specific fixes.

2. `artifact_type`
- Required category: `research`, `script`, `visual`, `audio`, `render`, `delivery`, `system`.
- Rationale: routing can be auto-bucketed by artifact domain.

3. `artifact_ref`
- Required identifier of the target artifact (path, chapter id, sequence id).
- Rationale: tells the fix owner exactly where work applies.

4. `location`
- Required human-readable pointer, such as chapter + timeline/line/asset.
- Rationale: gives the owner a fast jump-to point for repair.

5. `issue_type`
- Required canonical type: `evidence_gap`, `fact_error`, `continuity`, `clarity`, `tone_drift`, `sync_drift`, `coverage`, `composition`, `timing`, `audio_masking`, `render_failure`, `contract_gap`, `missing_asset`.
- Rationale: supports filtering, analytics, and repeatable triage.

6. `severity`
- Required one of `blocker`, `hard`, `soft`, `note`.
- Rationale: controls whether loop continues.

7. `expected`
- Required: what the reviewer expects to observe.
- Rationale: defines the acceptance target for the fix.

8. `actual`
- Required: what was observed.
- Rationale: gives owner concrete delta from expectation.

9. `route`
- Required: one of `research_correction`, `narrative_rewrite`, `visual_replan`, `audio_rework`, `timeline_recut`, `render_rerun`, `delivery_fix`, `diagnostic_followup`, `no_action`, or `coordination_required`.
- Rationale: declares the remediation lane, not a specific agent or harness role.

10. `finding_status`
- Required one of `confirmed_issue`, `false_positive`, `inconclusive`.
- Rationale: lets the reviewer distinguish real failures from adjudicated misses and unresolved ambiguity.

11. `confidence`
- Required one of `high`, `medium`, `low`.
- Rationale: preserves inference strength for downstream judgment.

### Optional

- `route_chain` (array of lanes)
  - Required only when `route = coordination_required`.
  - Example: `["research_correction", "narrative_rewrite"]`.
  - Rationale: defines ordered multi-lane work without exposing harness-specific internals.

- `tests_run`
  - Optional array of checks used to reach the finding.
  - Suggested values: `cut_rate`, `visual_novelty`, `layout_repetition`, `frame_clutter`, `speech_masking`, `reveal_contraction`, `mode_interleave`, `preflight_render`, `render_metadata`, `analyze_media`, `script_cold_read`, `source_inspection`, `asset_provenance`, `frame_capture`, `single_frame_render`, `segment_render`, `contact_sheet`.
  - Rationale: makes diagnosis-backed findings auditable.

- `root_cause_layer`
  - Optional narrow layer where the failure entered the system.
  - Suggested values: `research`, `script`, `creative_direction`, `storyboard`, `spec`, `timing`, `media`, `audio_mix`, `component_code`, `render_pipeline`, `system`, `unknown`.
  - Rationale: separates where the symptom appeared from where the problem started.

- `verification_scope`
  - Optional scope used to verify the finding.
  - Suggested values: `source_only`, `frame`, `segment`, `full_render`, `artifact`.
  - Rationale: distinguishes local proof from end-to-end review and keeps rerender scope disciplined.

- `diagnosis`
  - Optional one-paragraph root-cause statement.
  - Rationale: preserves the reviewer’s causal inference when the issue is not obvious from `expected` and `actual` alone.

- `evidence`
  - Optional evidence map to keep findings actionable.
  - Suggested keys: `media_file`, `timestamp`, `frame`, `frame_range`, `screenshot_path`, `line`, `source_ref`.
  - Rationale: helps owner validate and patch quickly.

- `proposed_fix`
  - Optional one-line suggestion, if obvious.
  - Rationale: reduces iteration when issue is mechanical.

- `notes`
  - Optional context that does not affect execution.
  - Rationale: preserves reviewer reasoning without overloading downstream parsing.

## Remediation lane semantics (required behavior)

- `research_correction`: source acquisition, citation repair, evidence validation, factual support.
- `narrative_rewrite`: script repair, structure change, claim softening, clarity, tone, or sequencing changes in the narrative artifact.
- `visual_replan`: shot logic, frame composition, graphic treatment, or visual asset plan correction.
- `audio_rework`: voice, music, mix, masking, loudness, or audio sequencing correction.
- `timeline_recut`: timing, sync, pacing, or edit-structure correction across assembled media.
- `render_rerun`: pipeline, render configuration, or export regeneration work.
- `delivery_fix`: packaging, naming, pathing, publishing, or final-format correction.
- `diagnostic_followup`: more tests, evidence, or observability are required before a fix lane can be assigned with confidence.
- `no_action`: the finding was checked against the real artifact and adjudicated as a false positive or already-resolved state.
- `coordination_required`: issue spans more than one lane and must declare `route_chain`.

## Status semantics

- `confirmed_issue`: reviewer believes the issue is real and dispatchable.
- `false_positive`: reviewer checked the artifact and found no live failure requiring remediation.
- `inconclusive`: reviewer has evidence of risk or ambiguity, but not enough to isolate a confident fix without more investigation.

## Harness mapping note

The contract does not prescribe internal agent topology.

- Claude may resolve `narrative_rewrite` through `core`.
- Claude may resolve `research_correction` through `researcher`.
- Claude may continue `diagnostic_followup` inside the reviewer before dispatching a lane.
- Codex may map both lanes to one worker plus one coordinator.
- Another harness may map lanes to queue names, adapters, or service endpoints.

The emitted artifact stays stable even when the internal coordination model changes.

## Minimal valid YAML example

```yaml
schema_version: 2
result: needs_fixes
total_findings: 2
findings:
  - id: rf-001
    artifact_type: research
    artifact_ref: project/research/source-facts.md
    location: "Claim: thorium reserve estimate in paragraph 3"
    issue_type: evidence_gap
    severity: hard
    expected: "Claim must include primary or peer-reviewed source ID and date"
    actual: "Claim includes uncited percentage but no source"
    route: research_correction
    finding_status: confirmed_issue
    confidence: high
    tests_run:
      - source_inspection
    root_cause_layer: research
    proposed_fix: "Add citation block with source URL and confidence note"
  - id: rf-002
    artifact_type: render
    artifact_ref: project/output/ch2.mp4
    location: "00:01:42-00:01:44"
    issue_type: sync_drift
    severity: hard
    expected: "On-screen callout appears before narrated phrase"
    actual: "Callout appears 1.2s late"
    route: timeline_recut
    finding_status: confirmed_issue
    confidence: high
    verification_scope: segment
    tests_run:
      - segment_render
      - render_metadata
    evidence:
      media_file: project/output/ch2.mp4
      timestamp: "00:01:42-00:01:44"
    proposed_fix: "Shift callout start to -0.8s"
```

## Example with coordinated remediation

```yaml
- id: rf-003
  artifact_type: script
  artifact_ref: project/story/ch3.md
  location: "Ch3 intro paragraph 1"
  issue_type: tone_drift
  severity: hard
  expected: "Avoid speculative claim without research support"
  actual: "Sentence introduces a causal claim before evidence"
  route: coordination_required
  finding_status: confirmed_issue
  confidence: medium
  route_chain:
    - research_correction
    - narrative_rewrite
  tests_run:
    - source_inspection
    - script_cold_read
  root_cause_layer: research
  diagnosis: "The causal claim outruns the verified evidence, so research correction must happen before the paragraph can be safely rewritten."
  proposed_fix: "Validate the causal path first, then rewrite the paragraph around the confirmed evidence"
```

## Example with false-positive adjudication

```yaml
- id: rf-004
  artifact_type: render
  artifact_ref: project/output/ch4.mp4
  location: "00:03:11"
  issue_type: composition
  severity: soft
  expected: "Bar labels overlap at the peak frame"
  actual: "Peak frame remains readable; the earlier complaint does not reproduce in the rendered artifact"
  route: no_action
  finding_status: false_positive
  confidence: high
  verification_scope: frame
  tests_run:
    - single_frame_render
    - analyze_media
  evidence:
    media_file: project/output/ch4.mp4
    frame: 4679
    timestamp: "00:03:11"
  root_cause_layer: unknown
  notes: "Prior complaint came from an intermediate preview, not the shipped render."
```

## Example with inconclusive diagnosis

```yaml
- id: rf-005
  artifact_type: audio
  artifact_ref: project/output/final-mix.mp3
  location: "00:01:20-00:01:34"
  issue_type: audio_masking
  severity: hard
  expected: "Narration remains dominant through the payload line"
  actual: "The payload line feels weakened, but current checks do not isolate whether masking comes from score energy, SFX overlap, or voice level"
  route: diagnostic_followup
  finding_status: inconclusive
  confidence: medium
  tests_run:
    - speech_masking
    - analyze_media
  root_cause_layer: unknown
  diagnosis: "There is a real intelligibility risk, but the exact source surface is not isolated yet."
  proposed_fix: "Run targeted stem or clip analysis before dispatching audio rework."
```

## Validation rule

A finding is valid only if all required fields exist and at least one of `evidence`, `notes`, `proposed_fix`, `tests_run`, or `diagnosis` is present.

Additional rules:
- if `route = coordination_required`, `route_chain` is required
- if `finding_status = false_positive`, `route` should normally be `no_action`
- if `finding_status = inconclusive`, `route` should normally be `diagnostic_followup` or `coordination_required`
