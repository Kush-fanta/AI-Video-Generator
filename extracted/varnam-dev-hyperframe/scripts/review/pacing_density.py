#!/usr/bin/env python3
# ---
# varnam_script: review.pacing_density
# owner: reviewer
# status: live
# surface: direct-only
# purpose: Pre-render drag-window density gate.
# use_when: Catch overlong single-action cuts before expensive renders.
# inputs: CLI args, manifests, env vars, or imports documented by argparse/docstring
# outputs: files, JSON/stdout reports, or process exit code documented by the script
# authority: scripts/README.md; scripts/SCRIPT_MAP.md
# ---
"""Pacing-density gate — flags stretched cuts before render.

Reads timing.ts + film render file (e.g., BengalCurve.tsx) and reports any cut
whose duration exceeds the drag threshold while using a single-action composition,
unless the render manifest marks it as a designed hold.

Run this before every render. A flagged cut is either:
  - subdivided into staged reveals (micro-beats with visible motion), or
  - explicitly marked in the render manifest as a designed hold.

Why this exists: drag windows (cuts > 5s on a single-action composition) are the
dominant structural defect across Varnam renders. The reviewer's `cut_rate`
analyzer catches them post-render, but by then each fix costs a 15-20min rerender.
Gating pre-render turns a render-cycle bug into a spec-cycle bug.

Usage:
  python3 scripts/review/pacing_density.py \
    --timing projects/<slug>/timing.ts \
    --film   projects/<slug>/<Film>.tsx \
    --render-manifest projects/<slug>/direction/render-manifest.yaml \
    [--drag-threshold 5.0] [--fps 30]

Exits non-zero if any cut fails the gate.
"""

from __future__ import annotations

import argparse
import sys
import re
from pathlib import Path

REPO_ROOT = Path(__file__).resolve().parents[2]
SCRIPTS_DIR = REPO_ROOT / "scripts"
REVIEW_DIR = SCRIPTS_DIR / "review"
if str(REVIEW_DIR) not in sys.path:
    sys.path.insert(0, str(REVIEW_DIR))

from validate_render_manifest import load_structured  # noqa: E402

# Components/compositions that render a single editorial event with no internal motion graph.
# Beats longer than DRAG_THRESHOLD_S on these components will flag unless
# the render manifest marks them as designed holds.
SINGLE_ACTION_COMPONENTS = frozenset({
    "TitleCard",
    "TextCard",
    "TextCardTwoLine",
    "TextCardAccent",
    "TextCardUnderline",
    "StatBigNumber",
    "StatPercent",
    "StatStacked",
    "StatComparison",
    "StatDelta",
    "CalloutBox",
    "DataCallout",
    "ChapterSlate",
    "ChapterIntro",
    "PullQuote",
    "EndCard",
    "EvidenceList",
    "RankingList",
    "SourceCard",
    "QuoteAttribution",
})

DESIGNED_HOLD_MARKERS = (
    "designed hold",
    "designed silence",
    "anchor #",
    "anchor#",
    "silence #",
    "held beat",
    "cinematic hold",
)

BEAT_LINE_RE = re.compile(
    r"\b([A-Za-z][A-Za-z0-9_-]*)\s*:\s*\{\s*from\s*:\s*(\d+)\s*,\s*dur\s*:\s*(\d+)\s*\}"
)
TIMING_ITEM_RE = re.compile(
    r"\{\s*id:\s*[\"']([^\"']+)[\"']\s*,\s*from:\s*(\d+)\s*,\s*dur:\s*(\d+)\s*\}"
)
SEQUENCE_BEAT_RE = re.compile(r"\{/\*\s*([A-Za-z][A-Za-z0-9_-]*)\b")
JSX_COMPONENT_RE = re.compile(r"<([A-Z][A-Za-z0-9]+)\b")


def _parse_timing(path: Path) -> dict[str, tuple[int, int]]:
    text = path.read_text(encoding="utf-8")
    beats: dict[str, tuple[int, int]] = {}
    for match in BEAT_LINE_RE.finditer(text):
        beats[match.group(1)] = (int(match.group(2)), int(match.group(3)))
    for match in TIMING_ITEM_RE.finditer(text):
        beats[match.group(1)] = (int(match.group(2)), int(match.group(3)))
    return beats


def _parse_film_beat_components(path: Path) -> dict[str, str]:
    """Map each B## comment to the first JSX component that follows it."""
    lines = path.read_text(encoding="utf-8").splitlines()
    mapping: dict[str, str] = {}
    i = 0
    while i < len(lines):
        m = SEQUENCE_BEAT_RE.search(lines[i])
        if not m:
            i += 1
            continue
        beat_id = m.group(1)
        for j in range(i + 1, min(i + 20, len(lines))):
            comp_match = JSX_COMPONENT_RE.search(lines[j])
            if comp_match and comp_match.group(1) not in ("AbsoluteFill", "Sequence", "Audio"):
                mapping[beat_id] = comp_match.group(1)
                break
        i += 1
    return mapping


def _walk_strings(value: object) -> list[str]:
    if isinstance(value, dict):
        strings: list[str] = []
        for item in value.values():
            strings.extend(_walk_strings(item))
        return strings
    if isinstance(value, list):
        strings: list[str] = []
        for item in value:
            strings.extend(_walk_strings(item))
        return strings
    if isinstance(value, str):
        return [value]
    return []


def _parse_render_manifest_holds(path: Path | None) -> set[str]:
    """Return cut ids whose structured payload marks them as a designed hold."""
    if path is None or not path.exists():
        return set()

    payload = load_structured(path)
    if not isinstance(payload, dict):
        raise ValueError("render manifest root must be an object")
    piece = payload.get("piece")
    if not isinstance(piece, dict):
        raise ValueError("render manifest must contain a piece object")

    designed_cuts: set[str] = set()
    scenes = piece.get("scenes")
    if not isinstance(scenes, list):
        return designed_cuts

    for scene in scenes:
        if not isinstance(scene, dict):
            continue
        for cut in scene.get("cuts", []):
            if not isinstance(cut, dict):
                continue
            cut_id = cut.get("id")
            if not isinstance(cut_id, str) or not cut_id.strip():
                continue
            text = "\n".join(_walk_strings(cut)).lower()
            if any(marker in text for marker in DESIGNED_HOLD_MARKERS):
                designed_cuts.add(cut_id)
    return designed_cuts


def parse_args(argv: list[str] | None = None) -> argparse.Namespace:
    parser = argparse.ArgumentParser(description=__doc__)
    parser.add_argument("--timing", required=True, type=Path)
    parser.add_argument("--film", required=True, type=Path)
    parser.add_argument("--render-manifest", dest="render_manifest", type=Path, default=None)
    parser.add_argument("--fps", type=int, default=30)
    parser.add_argument("--drag-threshold", type=float, default=5.0,
                        help="Seconds. Cuts > this using single-action compositions fail.")
    return parser.parse_args(argv)


def main(argv: list[str] | None = None) -> int:
    args = parse_args(argv)

    beats = _parse_timing(args.timing)
    components = _parse_film_beat_components(args.film)
    try:
        designed_holds = _parse_render_manifest_holds(args.render_manifest)
    except Exception as exc:  # noqa: BLE001 - CLI should fail loudly on parse issues.
        print(f"Could not parse render manifest: {exc}", file=sys.stderr)
        return 2

    threshold_frames = int(args.drag_threshold * args.fps)

    fails: list[str] = []
    warns: list[str] = []
    missing_components: list[str] = []

    for beat_id, (_from, dur) in sorted(beats.items(), key=lambda kv: kv[1][0]):
        if dur <= threshold_frames:
            continue
        component = components.get(beat_id, "?")
        if component == "?":
            missing_components.append(beat_id)
            continue
        is_single_action = component in SINGLE_ACTION_COMPONENTS
        if not is_single_action:
            continue
        seconds = dur / args.fps
        if beat_id in designed_holds:
            warns.append(
                f"  {beat_id}  {component:20s}  {seconds:5.2f}s  (designed hold — allowed)"
            )
            continue
        fails.append(
            f"  {beat_id}  {component:20s}  {seconds:5.2f}s  DRAG — subdivide or mark in render-manifest.yaml as a designed hold"
        )

    print(f"Pacing-density gate — threshold {args.drag_threshold}s · fps {args.fps}")
    print(f"  beats scanned: {len(beats)}  ·  single-action compositions: "
          f"{sum(1 for t in components.values() if t in SINGLE_ACTION_COMPONENTS)}  "
          f"·  designed holds: {len(designed_holds)}")

    if missing_components:
        print("\nSkipped — timing ids missing a matching cut comment in the film:")
        for beat_id in missing_components:
            print(f"  {beat_id}")

    if warns:
        print("\nDesigned holds (allowed):")
        for w in warns:
            print(w)

    if fails:
        print("\nDRAG WINDOWS (block):")
        for f in fails:
            print(f)
        print(f"\n{len(fails)} beat(s) fail the pacing-density gate.")
        return 1

    print("\nOK — no drag windows.")
    return 0


if __name__ == "__main__":
    sys.exit(main())
