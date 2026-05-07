#!/usr/bin/env python3
# ---
# varnam_script: review.benchmarks.mode_interleave
# owner: reviewer
# status: live
# surface: direct-only
# purpose: Visual mode alternation metric.
# use_when: Measure whether visual modes vary across a render.
# inputs: CLI args, manifests, env vars, or imports documented by argparse/docstring
# outputs: files, JSON/stdout reports, or process exit code documented by the script
# authority: scripts/README.md; scripts/SCRIPT_MAP.md
# ---
"""Deterministic mode interleave analysis for timed storyboards."""

from __future__ import annotations

import argparse
import json
import math
import re
import sys
from dataclasses import dataclass
from pathlib import Path


TABLE_DIVIDER_RE = re.compile(r"^\s*:?-{3,}:?\s*$")
DURATION_RE = re.compile(r"(?P<value>\d+(?:\.\d+)?)\s*s\b", re.IGNORECASE)

CANONICAL_MODE_PATTERNS: tuple[tuple[str, tuple[re.Pattern[str], ...]], ...] = (
    (
        "data_viz",
        (
            re.compile(r"\bdata(?:-viz)?\b", re.IGNORECASE),
            re.compile(r"\bcomparative\b", re.IGNORECASE),
            re.compile(r"\btimeline\b", re.IGNORECASE),
            re.compile(r"\bproportion\b", re.IGNORECASE),
            re.compile(r"\bnumbers?\b", re.IGNORECASE),
        ),
    ),
    (
        "map",
        (
            re.compile(r"\bmap\b", re.IGNORECASE),
            re.compile(r"\bgeographic\b", re.IGNORECASE),
        ),
    ),
    (
        "diagram",
        (
            re.compile(r"\bdiagram\b", re.IGNORECASE),
            re.compile(r"\bflowchart\b", re.IGNORECASE),
            re.compile(r"\bschematic\b", re.IGNORECASE),
        ),
    ),
    (
        "archival",
        (
            re.compile(r"\barchival\b", re.IGNORECASE),
            re.compile(r"\bdocumentary\b", re.IGNORECASE),
        ),
    ),
    (
        "composite",
        (
            re.compile(r"\bcomposite\b", re.IGNORECASE),
            re.compile(r"\bcutout(?:-image)?\b", re.IGNORECASE),
            re.compile(r"\bbgless\b", re.IGNORECASE),
            re.compile(r"\bimage\b", re.IGNORECASE),
            re.compile(r"\bhuman\b", re.IGNORECASE),
            re.compile(r"\bphoto\b", re.IGNORECASE),
        ),
    ),
    (
        "text",
        (
            re.compile(r"\btext\b", re.IGNORECASE),
            re.compile(r"\btypography\b", re.IGNORECASE),
            re.compile(r"\bdarkpunch\b", re.IGNORECASE),
            re.compile(r"\bcorrect\b", re.IGNORECASE),
            re.compile(r"\bpacing\b", re.IGNORECASE),
            re.compile(r"\bstatement\b", re.IGNORECASE),
            re.compile(r"\bclosing\b", re.IGNORECASE),
        ),
    ),
    (
        "bridge",
        (
            re.compile(r"\bbridge\b", re.IGNORECASE),
            re.compile(r"\bsilence\b", re.IGNORECASE),
        ),
    ),
)


@dataclass(frozen=True)
class TimedScene:
    index: int
    scene: str
    duration_seconds: float
    raw_mode: str


@dataclass(frozen=True)
class TimedSegment:
    scene_index: int
    scene: str
    start_seconds: float
    end_seconds: float
    active_modes: tuple[str, ...]
    raw_mode: str

    @property
    def duration_seconds(self) -> float:
        return self.end_seconds - self.start_seconds


def _split_row(line: str) -> list[str]:
    return [cell.strip() for cell in line.strip().strip("|").split("|")]


def _normalize_header(cell: str) -> str:
    return re.sub(r"[^a-z0-9]+", " ", cell.lower()).strip()


def _parse_duration(value: str) -> float:
    match = DURATION_RE.search(value)
    if not match:
        raise ValueError(f"Unable to parse duration cell: {value!r}")
    return float(match.group("value"))


def parse_timed_storyboard(storyboard_path: Path) -> list[TimedScene]:
    lines = storyboard_path.read_text(encoding="utf-8").splitlines()
    header_index = None
    headers: list[str] = []

    for idx, line in enumerate(lines):
        if not line.lstrip().startswith("|"):
            continue
        candidate = _split_row(line)
        normalized = [_normalize_header(cell) for cell in candidate]
        if "duration" in normalized and "mode" in normalized:
            header_index = idx
            headers = normalized
            break

    if header_index is None:
        raise ValueError(
            f"{storyboard_path} does not contain a timed storyboard table with Duration and Mode columns"
        )

    if header_index + 1 >= len(lines):
        raise ValueError(f"{storyboard_path} is missing the table divider row")

    divider_cells = _split_row(lines[header_index + 1])
    if not divider_cells or not all(TABLE_DIVIDER_RE.match(cell) for cell in divider_cells):
        raise ValueError(f"{storyboard_path} has a malformed table divider row")

    duration_index = headers.index("duration")
    mode_index = headers.index("mode")
    scene_index = headers.index("scene") if "scene" in headers else None
    id_index = headers.index("#") if "#" in headers else None

    scenes: list[TimedScene] = []
    next_index = 1
    for line in lines[header_index + 2 :]:
        if not line.lstrip().startswith("|"):
            break
        cells = _split_row(line)
        if len(cells) < len(headers):
            continue
        duration_cell = cells[duration_index]
        mode_cell = cells[mode_index]
        if not duration_cell or not mode_cell:
            continue
        scene_name = cells[scene_index] if scene_index is not None else f"scene-{next_index}"
        scene_id = next_index
        if id_index is not None:
            try:
                scene_id = int(cells[id_index])
            except ValueError:
                scene_id = next_index
        scenes.append(
            TimedScene(
                index=scene_id,
                scene=scene_name,
                duration_seconds=_parse_duration(duration_cell),
                raw_mode=mode_cell,
            )
        )
        next_index += 1

    if not scenes:
        raise ValueError(f"{storyboard_path} contains a header row but no timed scene rows")
    return scenes


def _ordered_unique(values: list[str]) -> tuple[str, ...]:
    seen: set[str] = set()
    ordered: list[str] = []
    for value in values:
        if value in seen:
            continue
        seen.add(value)
        ordered.append(value)
    return tuple(ordered)


def canonicalize_modes(raw_mode: str) -> list[tuple[str, ...]]:
    segments = [part.strip() for part in raw_mode.split("->") if part.strip()]
    if not segments:
        segments = [raw_mode.strip()]

    canonical_segments: list[tuple[str, ...]] = []
    for segment in segments:
        matches: list[str] = []
        for canonical, patterns in CANONICAL_MODE_PATTERNS:
            if any(pattern.search(segment) for pattern in patterns):
                matches.append(canonical)
        if not matches:
            normalized = re.sub(r"[^a-z0-9]+", "_", segment.lower()).strip("_")
            matches.append(normalized or "unknown")
        canonical_segments.append(_ordered_unique(matches))
    return canonical_segments


def expand_scenes(scenes: list[TimedScene]) -> list[TimedSegment]:
    cursor = 0.0
    segments: list[TimedSegment] = []
    for scene in scenes:
        mode_segments = canonicalize_modes(scene.raw_mode)
        sub_duration = scene.duration_seconds / len(mode_segments)
        for active_modes in mode_segments:
            end = cursor + sub_duration
            segments.append(
                TimedSegment(
                    scene_index=scene.index,
                    scene=scene.scene,
                    start_seconds=cursor,
                    end_seconds=end,
                    active_modes=active_modes,
                    raw_mode=scene.raw_mode,
                )
            )
            cursor = end
    return segments


def _round_dict(values: dict[str, float], digits: int = 3) -> dict[str, float]:
    return {key: round(values[key], digits) for key in sorted(values)}


def _normalized_entropy(mode_seconds: dict[str, float]) -> float:
    total = sum(mode_seconds.values())
    if total <= 0:
        return 0.0
    probabilities = [value / total for value in mode_seconds.values() if value > 0]
    if len(probabilities) <= 1:
        return 0.0
    entropy = -sum(probability * math.log(probability) for probability in probabilities)
    return entropy / math.log(len(probabilities))


def analyze_storyboard(
    storyboard_path: Path,
    *,
    max_mode_run_seconds: float | None = None,
    min_mode_count: int | None = None,
) -> dict:
    storyboard_path = storyboard_path.expanduser().resolve()
    if not storyboard_path.exists():
        raise FileNotFoundError(f"Storyboard not found: {storyboard_path}")

    scenes = parse_timed_storyboard(storyboard_path)
    segments = expand_scenes(scenes)

    total_duration = sum(scene.duration_seconds for scene in scenes)
    mode_seconds: dict[str, float] = {}
    switch_count = 0
    previous_modes: tuple[str, ...] | None = None

    runs_by_mode: dict[str, list[tuple[float, float]]] = {}
    active_run_start: dict[str, float] = {}

    for segment in segments:
        share = segment.duration_seconds / len(segment.active_modes)
        for mode in segment.active_modes:
            mode_seconds[mode] = mode_seconds.get(mode, 0.0) + share

        current_modes = set(segment.active_modes)
        if previous_modes is not None and current_modes != set(previous_modes):
            switch_count += 1
        previous_modes = segment.active_modes

        for mode in list(active_run_start):
            if mode in current_modes:
                continue
            runs_by_mode.setdefault(mode, []).append((active_run_start.pop(mode), segment.start_seconds))
        for mode in current_modes:
            active_run_start.setdefault(mode, segment.start_seconds)

    for mode, start in active_run_start.items():
        runs_by_mode.setdefault(mode, []).append((start, total_duration))

    longest_runs_seconds = {
        mode: max((end - start) for start, end in intervals)
        for mode, intervals in runs_by_mode.items()
    }
    max_mode_run = max(longest_runs_seconds.values(), default=0.0)
    effective_mode_count = sum(1 for duration in mode_seconds.values() if duration > 0)
    mode_fractions = {
        mode: 0.0 if total_duration <= 0 else duration / total_duration
        for mode, duration in mode_seconds.items()
    }
    distribution_entropy = _normalized_entropy(mode_seconds)
    run_component = 0.0 if total_duration <= 0 else max(0.0, 1.0 - (max_mode_run / total_duration))
    score = (distribution_entropy + run_component) / 2.0

    findings: list[dict[str, float | str]] = []
    if max_mode_run_seconds is not None:
        for mode, intervals in runs_by_mode.items():
            for start, end in intervals:
                duration = end - start
                if duration <= max_mode_run_seconds:
                    continue
                findings.append(
                    {
                        "timestamp": round(start, 3),
                        "end_timestamp": round(end, 3),
                        "duration": round(duration, 3),
                        "issue": "mode overstayed",
                        "mode": mode,
                        "severity": "hard",
                    }
                )

    passed = True
    if max_mode_run_seconds is not None and max_mode_run > max_mode_run_seconds:
        passed = False
    if min_mode_count is not None and effective_mode_count < min_mode_count:
        passed = False
        findings.append(
            {
                "timestamp": 0.0,
                "duration": round(total_duration, 3),
                "issue": "insufficient mode variety",
                "mode_count": effective_mode_count,
                "severity": "hard",
            }
        )

    return {
        "script": "mode_interleave",
        "storyboard": str(storyboard_path),
        "source_type": "timed_storyboard",
        "duration_seconds": round(total_duration, 3),
        "scene_count": len(scenes),
        "segment_count": len(segments),
        "threshold": {
            "max_mode_run_seconds": max_mode_run_seconds,
            "min_mode_count": min_mode_count,
        },
        "pass": passed,
        "score": round(score, 3),
        "effective_mode_count": effective_mode_count,
        "switch_count": switch_count,
        "distribution_entropy": round(distribution_entropy, 3),
        "mode_seconds": _round_dict(mode_seconds),
        "mode_fractions": _round_dict(mode_fractions),
        "max_mode_run_seconds": round(max_mode_run, 3),
        "longest_runs_seconds": _round_dict(longest_runs_seconds),
        "findings": sorted(findings, key=lambda item: float(item["timestamp"])),
    }


def parse_args(argv: list[str] | None = None) -> argparse.Namespace:
    parser = argparse.ArgumentParser(description="Measure mode interleave in a timed storyboard")
    parser.add_argument("storyboard", help="Path to timed storyboard markdown")
    parser.add_argument(
        "--max-mode-run-seconds",
        type=float,
        default=None,
        help="Fail when any single canonical mode stays active longer than this",
    )
    parser.add_argument(
        "--min-mode-count",
        type=int,
        default=None,
        help="Fail when fewer than this many canonical modes appear",
    )
    return parser.parse_args(argv)


def main(argv: list[str] | None = None) -> int:
    args = parse_args(argv)
    try:
        result = analyze_storyboard(
            Path(args.storyboard),
            max_mode_run_seconds=args.max_mode_run_seconds,
            min_mode_count=args.min_mode_count,
        )
    except (FileNotFoundError, ValueError) as exc:
        json.dump({"error": str(exc)}, sys.stdout, indent=2)
        sys.stdout.write("\n")
        return 1

    json.dump(result, sys.stdout, indent=2)
    sys.stdout.write("\n")
    return 0 if result["pass"] else 2


if __name__ == "__main__":
    raise SystemExit(main())
