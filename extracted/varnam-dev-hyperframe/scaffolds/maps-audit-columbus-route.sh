#!/usr/bin/env bash
# Audit dispatch for the maps specialist. Single bounded route-trace beat on world map.

SLUG="maps-audit-columbus-route"
CHANNEL="nightshift"
TITLE_DIRECTION="Columbus 1492 — three landfalls"

CORE_MESSAGE="Three points define the 1492 westbound crossing: Palos de la Frontera (Spain), the Canary Islands stop, and San Salvador (Bahamas) landfall."
WHY_NOW="Audit run for the maps specialist — exercising the route-trace template on world geography. No editorial release."

ANTI_GOALS="
- Not a published film; no narration; no chapters.
- Do not invent additional waypoints. Three points only.
- Do not stylize as Type A blob; this is Type B factual."

TARGET_VIEWER="Internal audit reviewer."
PLATFORM="internal"
RUNTIME="single-cut"
DESIRED_OUTCOME="One real-template preview frame proving route-trace binding works for a 3-waypoint Atlantic crossing on the nightshift channel."

FORMAT="default"
FORMAT_WHY="Audit; format irrelevant."
HOOK_CONTRACT="N/A — audit."
MOVEMENT_CONTRACT="N/A — audit."
ENDING_CONTRACT="N/A — audit."

NARRATION_STANCE="silent"
VISUAL_PROOF_MODES="
- route-trace overlay on world map with three waypoints labeled"
SOUND_STANCE="silent"
NO_GO_MOVES="
- copied numeric coordinates pulled from outside the repo's canonical data
- proxy HTML/SVG/Chrome screenshot as evidence
- nested SVG transforms"

KEY_SUBJECTS="
- Palos de la Frontera, Spain (departure August 3, 1492)
- Canary Islands stop (San Sebastián de La Gomera)
- San Salvador, Bahamas (landfall October 12, 1492)"
EXACT_FACTS="
- Three waypoints, ordered W from Iberia to Caribbean
- World map is 1510×820 canvas with Natural Earth projection per templates/geo/geo-paths.ts"
MEDIA_EVIDENCE_OBLIGATIONS="
- Preview PNG produced by the actual templates/geo/route-trace.tsx Remotion render"
RESEARCH_REQUIREMENTS="
- Geographic positions for the three points must derive from canonical repo data (varnam-world.geojson or generated paths). Hand-copied lat/lng numeric constants in the binding are not allowed; if canonical lookup is missing, escalate per maps.md MISSING: protocol."

CONTEXT_SUMMARY="Second audit dispatch for the maps specialist after the 2026-04-29 four-metro QA failure. First audit (IT corridor on India) surfaced the india.json projection mismatch and exited blocked correctly. This second audit pivots to a different template (route-trace), different data source (world map), and different channel (nightshift) to widen audit coverage."
CURRENT_TASK="Dispatch maps specialist on the Columbus route cut."
NEXT_TASK="Editor reviews exit Outcome/Evidence lines against maps.md spec."
