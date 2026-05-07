# Google Workspace (`gws`) Tool Surface

Purpose: Make Google Workspace first-class in Varnam without adding local wrapper abstractions.
Use `gws` directly with app-native verbs and structured JSON output.

## Design rules

- Keep the harness thin.
- Do not build a local Workspace API layer.
- Do not translate Workspace into custom internal object taxonomies.
- Prefer direct `gws` commands over helper wrappers.
- Let agents reason in native app terms: Docs, Drive, Sheets, Gmail, Calendar, Chat.

## Install, auth, and version pin

Recommended install options:

```bash
npm install -g @googleworkspace/cli
# or
brew install googleworkspace-cli
# or
cargo install --git https://github.com/googleworkspace/cli --locked
```

Initial auth:

```bash
gws auth setup
gws auth login
```

Version guidance:

- Pin a known-good `gws` version for production workflows.
- Re-pin only after a small smoke run across required apps.
- Do not assume stable behavior from unpinned latest releases.

## JSON output expectations

Operational default:

- Prefer JSON output whenever available.
- If a command supports flags/params for structured response, use them.
- Avoid parsing prose output when JSON is available.
- Preserve raw command output snippets in logs when behavior is ambiguous.

Agent behavior:

- Read JSON minimally for the task at hand.
- Do not invent schemas around full responses.
- Extract only needed fields and keep provenance references.

## App-native verb guide

Use these verbs directly through `gws` commands. This is the contract surface for agent behavior.

### Docs

Primary verbs:

- read brief
- create review note
- append findings
- update sections
- publish decision notes

Usage pattern:

- Pull source narrative from Docs when it is the collaboration source.
- Write review summaries and decision logs back to Docs when requested.

### Drive

Primary verbs:

- list files/folders
- fetch source assets
- upload deliverables
- move/archive outputs
- share links

Usage pattern:

- Use Drive for intake and delivery surfaces.
- Keep local project artifacts as active working files.

### Sheets

Primary verbs:

- read tracker rows
- update status columns
- append production rows
- export structured tables

Usage pattern:

- Treat Sheets as a collaboration tracker and structured status board.
- Avoid making Sheets the sole state store for production artifacts.

### Gmail

Primary verbs:

- draft review mail
- send delivery/update mail
- read thread context when explicitly needed

Usage pattern:

- Use only when outbound communication is part of the task.
- Keep message artifacts and key decisions in project docs where relevant.

### Calendar

Primary verbs:

- read schedule/deadlines
- create review sessions
- create delivery milestones
- update event details

Usage pattern:

- Use when scheduling is requested or required for handoff.

### Chat

Primary verbs:

- post status updates
- post review links
- post escalation/blocked notices
- notify completion

Usage pattern:

- Use Chat for operational coordination and review flow notifications.

## Provenance and artifact discipline

Workspace is first-class, but provenance must stay explicit.

Rules:

- Record source object references (URL or ID) when ingesting meaningful inputs.
- Record destination object references when publishing outputs.
- Keep local project artifacts for active production state.
- Do not silently replace local artifacts from remote updates.
- When local and remote materially diverge, surface it as a coordination issue.

Suggested project section:

```md
## Workspace
- brief_doc: <url-or-id>
- source_drive_folder: <url-or-id>
- delivery_drive_folder: <url-or-id>
- tracker_sheet: <url-or-id>
- review_doc: <url-or-id>
- review_chat_space: <space-id-or-url>
- notification_email: <email>
- review_calendar: <calendar-id>
```

This is a reference block, not a schema system.

## Failure modes and handling

### 1. Missing CLI

Symptom:

- `gws` command not found.

Action:

- install via one supported path
- re-run auth

### 2. Auth/session invalid

Symptom:

- auth/token errors across commands.

Action:

- run `gws auth login`
- re-validate on a low-risk read command before writes

### 3. Scope/permission denied

Symptom:

- some apps work, others fail with permission errors.

Action:

- request required scopes for the failing app
- continue partial workflow where safe
- report explicit degraded mode

### 4. Object not found / moved

Symptom:

- referenced Doc/File/Sheet/Space/Event missing.

Action:

- verify ID/URL
- search nearest known container
- update workspace reference block with corrected target

### 5. Partial publish failure

Symptom:

- one publish target succeeded (Drive) while another failed (Chat/Docs).

Action:

- report partial completion explicitly
- include succeeded target refs
- retry only failed operations

### 6. Format mismatch

Symptom:

- Docs/Sheets content shape does not match expected task usage.

Action:

- avoid brittle parsing
- extract minimal required fields
- request human confirmation when semantics are ambiguous

### 7. CLI behavior drift

Symptom:

- command args/output changed after upgrade.

Action:

- pin/revert to known-good version
- update command examples in this file only after validation

## What not to build

- No local wrapper SDK over `gws`.
- No central orchestrator for Workspace apps.
- No mandatory global sync daemon.
- No broad schema-enforcement layer for Workspace payloads.

Varnam should stay model-forward: direct tools, explicit provenance, minimal permanent structure.
