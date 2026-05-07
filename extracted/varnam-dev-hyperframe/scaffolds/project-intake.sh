#!/usr/bin/env bash
#
# Backend fallback only.
#
# Normal flow:
#   python3 scripts/run.py project:intake
#
# If you need a non-interactive backend form, fill this file, then run:
#   python3 scripts/run.py project:scaffold --from scaffolds/project-intake.sh
#
# Rules:
# - Use double-quoted strings.
# - For list fields, keep the leading "- " bullets inside the quoted value.
# - This form bootstraps only `projects/<slug>/...`.
# - Do not scaffold project state under `templates/`.

SLUG="replace-me"
CHANNEL="replace-me"
TITLE_DIRECTION=""

CORE_MESSAGE=""
WHY_NOW=""

ANTI_GOALS="
- "

TARGET_VIEWER=""
PLATFORM=""
RUNTIME=""
DESIRED_OUTCOME=""

FORMAT="default"
FORMAT_WHY=""
HOOK_CONTRACT=""
MOVEMENT_CONTRACT=""
ENDING_CONTRACT=""

NARRATION_STANCE=""
VISUAL_PROOF_MODES="
- "
SOUND_STANCE=""
NO_GO_MOVES="
- "

KEY_SUBJECTS="
- "
EXACT_FACTS="
- "
MEDIA_EVIDENCE_OBLIGATIONS="
- "
RESEARCH_REQUIREMENTS="
- "

CONTEXT_SUMMARY=""
CURRENT_TASK="Review scaffolded brief and start think-tank pass 1."
NEXT_TASK="Hand pass-1 script authoring to core."
