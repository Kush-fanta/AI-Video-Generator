#!/usr/bin/env bash
# Audit dispatch for the maps specialist. Single bounded map beat.

SLUG="maps-audit-it-corridor"
CHANNEL="swarajya"
TITLE_DIRECTION="Where India's code is written"

CORE_MESSAGE="Five metros — Bengaluru, Hyderabad, Pune, Chennai, Delhi NCR — anchor the country's IT output."
WHY_NOW="Audit run for the maps specialist surface; no editorial release."

ANTI_GOALS="
- Not a published film; no narration; no chapters.
- Do not invent additional cities beyond the five listed.
- Do not stylize as Type A blob; this is Type B factual."

TARGET_VIEWER="Internal audit reviewer."
PLATFORM="internal"
RUNTIME="single-cut"
DESIRED_OUTCOME="One real-template preview frame proving city-markers binding works for 5 Indian metros on the swarajya channel."

FORMAT="default"
FORMAT_WHY="Audit; format irrelevant."
HOOK_CONTRACT="N/A — audit."
MOVEMENT_CONTRACT="N/A — audit."
ENDING_CONTRACT="N/A — audit."

NARRATION_STANCE="silent"
VISUAL_PROOF_MODES="
- city-markers overlay on India outline"
SOUND_STANCE="silent"
NO_GO_MOVES="
- copied numeric metro coordinates in bindings
- proxy HTML/SVG/Chrome screenshot as evidence
- nested SVG transforms"

KEY_SUBJECTS="
- Bengaluru (getMetro: Bangalore)
- Hyderabad
- Pune
- Chennai
- Delhi"
EXACT_FACTS="
- Five metros pre-projected in templates/geo/india.json"
MEDIA_EVIDENCE_OBLIGATIONS="
- Preview PNG produced by the actual templates/geo/city-markers.tsx Remotion render"
RESEARCH_REQUIREMENTS="
- None; geographic facts are in templates/geo/india.json"

CONTEXT_SUMMARY="Audit project for the maps specialist after the 2026-04-29 India 4-metro QA failure. Same shape, fresh dispatch; tests whether real-template-render evidence rule holds."
CURRENT_TASK="Dispatch maps specialist on the IT-corridor cut."
NEXT_TASK="Editor reviews exit Outcome/Evidence lines against maps.md spec."
