#!/usr/bin/env bash
# ---
# varnam_script: project.scaffold
# owner: editor
# status: live
# surface: python3 scripts/run.py project:scaffold
# purpose: Canonical project scaffold writer.
# use_when: Bootstrap projects/<slug> from locked intake.
# inputs: CLI args, manifests, env vars, or imports documented by argparse/docstring
# outputs: files, JSON/stdout reports, or process exit code documented by the script
# authority: scripts/README.md; scripts/SCRIPT_MAP.md
# ---
set -euo pipefail

REPO_ROOT="$(cd "$(dirname "${BASH_SOURCE[0]}")/../.." && pwd)"
INTAKE_PATH=""
FORCE=0
SOURCE_LABEL=""

usage() {
  cat <<'EOF'
Usage:
  bash scripts/project/scaffold.sh --from <intake.sh> [--force] [--repo-root <path>] [--source-label <label>]

Bootstraps the canonical project workspace under `projects/<slug>/`.
The intake file must be a shell form like `scaffolds/project-intake.sh`.

This command writes:
  - projects/<slug>/task-config.md
  - projects/<slug>/tasks.md
  - canonical project directories under projects/<slug>/

It does not create or mutate runtime project folders under `templates/`.
EOF
}

while [[ $# -gt 0 ]]; do
  case "$1" in
    --from)
      INTAKE_PATH="${2:-}"
      shift 2
      ;;
    --force)
      FORCE=1
      shift
      ;;
    --repo-root)
      REPO_ROOT="${2:-}"
      shift 2
      ;;
    --source-label)
      SOURCE_LABEL="${2:-}"
      shift 2
      ;;
    -h|--help)
      usage
      exit 0
      ;;
    *)
      echo "Unknown argument: $1" >&2
      usage >&2
      exit 1
      ;;
  esac
done

if [[ -z "$INTAKE_PATH" ]]; then
  echo "--from is required" >&2
  usage >&2
  exit 1
fi

if [[ ! -f "$INTAKE_PATH" ]]; then
  echo "Intake file not found: $INTAKE_PATH" >&2
  exit 1
fi

SOURCE_LABEL="${SOURCE_LABEL:-bash scripts/project/scaffold.sh --from ${INTAKE_PATH}}"

# shellcheck source=/dev/null
source "$INTAKE_PATH"

require_var() {
  local name="$1"
  local value="${!name:-}"
  if [[ -z "${value//[$'\t\r\n ']}" ]]; then
    echo "Missing required field in intake: $name" >&2
    exit 1
  fi
}

normalize_slug() {
  printf '%s' "$1" \
    | tr '[:upper:]' '[:lower:]' \
    | sed -E 's/[^a-z0-9]+/-/g; s/^-+//; s/-+$//; s/-+/-/g'
}

write_keep() {
  local dir="$1"
  mkdir -p "$dir"
  : > "$dir/.gitkeep"
}

require_var "SLUG"
require_var "CHANNEL"
require_var "CORE_MESSAGE"
require_var "WHY_NOW"
require_var "ANTI_GOALS"
require_var "TARGET_VIEWER"
require_var "PLATFORM"
require_var "RUNTIME"
require_var "DESIRED_OUTCOME"
require_var "NARRATION_STANCE"
require_var "VISUAL_PROOF_MODES"
require_var "SOUND_STANCE"
require_var "NO_GO_MOVES"
require_var "KEY_SUBJECTS"
require_var "RESEARCH_REQUIREMENTS"

SLUG="$(normalize_slug "$SLUG")"
if [[ -z "$SLUG" ]]; then
  echo "Slug normalized to empty value" >&2
  exit 1
fi

TITLE_DIRECTION="${TITLE_DIRECTION:-}"
FORMAT="${FORMAT:-default}"
FORMAT_WHY="${FORMAT_WHY:-- not yet locked}"
HOOK_CONTRACT="${HOOK_CONTRACT:-- not yet locked}"
MOVEMENT_CONTRACT="${MOVEMENT_CONTRACT:-- not yet locked}"
ENDING_CONTRACT="${ENDING_CONTRACT:-- not yet locked}"
EXACT_FACTS="${EXACT_FACTS:-- none locked yet}"
MEDIA_EVIDENCE_OBLIGATIONS="${MEDIA_EVIDENCE_OBLIGATIONS:-- none locked yet}"
CONTEXT_SUMMARY="${CONTEXT_SUMMARY:-$CORE_MESSAGE}"
CURRENT_TASK="${CURRENT_TASK:-Review scaffolded brief and start think-tank pass 1.}"
NEXT_TASK="${NEXT_TASK:-Hand pass-1 script authoring to core.}"

PROJECT_DIR="$REPO_ROOT/projects/$SLUG"
TASK_CONFIG_PATH="$PROJECT_DIR/task-config.md"
TASKS_PATH="$PROJECT_DIR/tasks.md"

if [[ -e "$PROJECT_DIR" && "$FORCE" -ne 1 ]]; then
  echo "Project already exists: $PROJECT_DIR" >&2
  echo "Use --force only if you intend to refresh the scaffold files." >&2
  exit 1
fi

mkdir -p "$PROJECT_DIR"
write_keep "$PROJECT_DIR/story"
write_keep "$PROJECT_DIR/direction"
write_keep "$PROJECT_DIR/direction/board"
write_keep "$PROJECT_DIR/audio"
write_keep "$PROJECT_DIR/research"
write_keep "$PROJECT_DIR/images/refs"
write_keep "$PROJECT_DIR/images/beats"
write_keep "$PROJECT_DIR/review/postflight"
write_keep "$PROJECT_DIR/output"

cat > "$TASK_CONFIG_PATH" <<EOF
# Task Config — ${SLUG}

**Slug:** \`${SLUG}\`
**Channel:** ${CHANNEL}
**Title direction:** ${TITLE_DIRECTION:-TBD}

---

## Core Message

${CORE_MESSAGE}

## Why Now

${WHY_NOW}

## Anti-Goals

${ANTI_GOALS}

## Viewer / Format / Runtime

- **Target viewer:** ${TARGET_VIEWER}
- **Platform:** ${PLATFORM}
- **Runtime:** ${RUNTIME}
- **Desired outcome:** ${DESIRED_OUTCOME}
- **Format:** ${FORMAT}

## Identity Applied to This Film

**Narration stance:** ${NARRATION_STANCE}

**Visual proof modes:**
${VISUAL_PROOF_MODES}

**Sound stance:** ${SOUND_STANCE}

**No-go moves:**
${NO_GO_MOVES}

## Format Locks

- **Why this format:** ${FORMAT_WHY}
- **Hook contract:** ${HOOK_CONTRACT}
- **Movement contract:** ${MOVEMENT_CONTRACT}
- **Ending contract:** ${ENDING_CONTRACT}

## Project Locks

**Key subjects:**
${KEY_SUBJECTS}

**Exact facts / names / dates:**
${EXACT_FACTS}

**Media / evidence obligations:**
${MEDIA_EVIDENCE_OBLIGATIONS}

**Research requirements:**
${RESEARCH_REQUIREMENTS}
EOF

cat > "$TASKS_PATH" <<EOF
# ${SLUG} — Task Ledger

## Status

**Stage:** intake locked
**Channel:** ${CHANNEL}
**Workspace:** \`projects/${SLUG}/\`
**Scaffold:** \`${SOURCE_LABEL}\`

## Context

${CONTEXT_SUMMARY}

## Tasks

- [in_progress] ${CURRENT_TASK}
- [pending] ${NEXT_TASK}
- [pending] Produce \`story/script.md\` from the locked brief before board work
- [pending] Create \`direction/board/index.md\` with the per-story design pack, then \`direction/board/<scene-id>.md\` from script for board approval
- [pending] Generate \`audio/voiceover.source.txt\`
- [pending] Generate VO audio + \`audio/voiceover.words.json\`
- [pending] After board approval + \`audio/voiceover.words.json\`, derive \`direction/render-manifest.yaml\`

## Artifacts

- \`task-config.md\`: scaffolded
- \`research/findings.md\`: pending
- \`story/script.md\`: pending
- \`direction/board/index.md\`: pending
- \`direction/board/<scene-id>.md\`: pending
- \`audio/voiceover.source.txt\`: pending
- \`audio/voiceover.mp3\`: pending
- \`audio/voiceover.words.json\`: pending
- \`audio/voiceover.tagged.txt\`: pending
- \`direction/render-manifest.yaml\`: pending
- \`images/refs/\`: ready
- \`images/beats/\`: ready
- \`output/preview.mp4\`: pending

## Next Move

- ${NEXT_TASK}

## Flow Reminder

- Project bootstrap lives under \`projects/<slug>/\` only.
- Do not scaffold project state under \`templates/\`.
- Board approval happens before voice-over generation; \`audio/voiceover.source.txt\` is authored with the board.
- Editor/tooling creates \`direction/render-manifest.yaml\` only after board approval and \`audio/voiceover.words.json\` are available.
- The package order is: script first -> board -> source text -> voiceover audio + words.json -> timeline-facing package lock -> build.
EOF

echo "Scaffolded $PROJECT_DIR"
echo "  wrote $TASK_CONFIG_PATH"
echo "  wrote $TASKS_PATH"
