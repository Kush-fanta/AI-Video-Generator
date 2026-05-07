#!/usr/bin/env python3
# ---
# varnam_script: review.benchmarks.cut_rate
# owner: reviewer
# status: live
# surface: direct-only
# purpose: Cut-rate signal metric.
# use_when: Measure cuts per minute against target.
# inputs: CLI args, manifests, env vars, or imports documented by argparse/docstring
# outputs: files, JSON/stdout reports, or process exit code documented by the script
# authority: scripts/README.md; scripts/SCRIPT_MAP.md
# ---
"""Deterministic hard-cut analysis for rendered video."""

from __future__ import annotations

import argparse
import json
import re
import shutil
import subprocess
import sys
from pathlib import Path


PTS_TIME_RE = re.compile(r"pts_time:(?P<pts>\d+(?:\.\d+)?)")


def _require_ffmpeg() -> None:
    if shutil.which("ffmpeg") and shutil.which("ffprobe"):
        return
    raise RuntimeError("ffmpeg and ffprobe are required")


def probe_duration(video_path: Path) -> float:
    result = subprocess.run(
        [
            "ffprobe",
            "-v",
            "error",
            "-show_entries",
            "format=duration",
            "-of",
            "default=noprint_wrappers=1:nokey=1",
            str(video_path),
        ],
        check=True,
        capture_output=True,
        text=True,
    )
    return float(result.stdout.strip())


def detect_cut_timestamps(video_path: Path, scene_threshold: float) -> list[float]:
    result = subprocess.run(
        [
            "ffmpeg",
            "-hide_banner",
            "-i",
            str(video_path),
            "-filter:v",
            f"select='gt(scene,{scene_threshold})',showinfo",
            "-an",
            "-f",
            "null",
            "-",
        ],
        check=True,
        capture_output=True,
        text=True,
    )

    timestamps: list[float] = []
    for line in result.stderr.splitlines():
        match = PTS_TIME_RE.search(line)
        if not match:
            continue
        timestamp = float(match.group("pts"))
        if timestamps and abs(timestamp - timestamps[-1]) < 1e-6:
            continue
        timestamps.append(timestamp)
    return timestamps


def _hold_durations(cut_timestamps: list[float], duration_seconds: float) -> list[dict[str, float]]:
    holds: list[dict[str, float]] = []
    start = 0.0
    for end in [*cut_timestamps, duration_seconds]:
        holds.append(
            {
                "start": round(start, 3),
                "end": round(end, 3),
                "duration": round(max(0.0, end - start), 3),
            }
        )
        start = end
    return holds


def analyze_video(
    video_path: Path,
    *,
    scene_threshold: float = 0.05,
    min_cuts_per_minute: float | None = None,
) -> dict:
    _require_ffmpeg()
    video_path = video_path.expanduser().resolve()
    if not video_path.exists():
        raise FileNotFoundError(f"Video not found: {video_path}")

    duration_seconds = probe_duration(video_path)
    cut_timestamps = detect_cut_timestamps(video_path, scene_threshold=scene_threshold)
    cut_count = len(cut_timestamps)
    cuts_per_minute = 0.0 if duration_seconds <= 0 else (cut_count / duration_seconds) * 60.0
    holds = _hold_durations(cut_timestamps, duration_seconds)
    longest_hold = max((hold["duration"] for hold in holds), default=0.0)

    passed = True
    score = 1.0
    findings: list[dict[str, float | str]] = []

    if min_cuts_per_minute is not None:
        score = min(cuts_per_minute / min_cuts_per_minute, 1.0) if min_cuts_per_minute > 0 else 1.0
        if cuts_per_minute < min_cuts_per_minute:
            passed = False
            findings.append(
                {
                    "timestamp": 0.0,
                    "value": round(cuts_per_minute, 3),
                    "issue": (
                        "cut rate below minimum floor "
                        f"({cuts_per_minute:.2f} cuts/min < {min_cuts_per_minute:.2f})"
                    ),
                    "severity": "hard",
                }
            )

    result = {
        "script": "cut_rate",
        "video": str(video_path),
        "duration_seconds": round(duration_seconds, 3),
        "scene_threshold": scene_threshold,
        "threshold": min_cuts_per_minute,
        "pass": passed,
        "score": round(score, 3),
        "cut_count": cut_count,
        "cuts_per_minute": round(cuts_per_minute, 3),
        "longest_hold_seconds": round(longest_hold, 3),
        "cut_timestamps": [round(timestamp, 3) for timestamp in cut_timestamps],
        "findings": findings,
        "holds": holds,
    }
    return result


def parse_args(argv: list[str] | None = None) -> argparse.Namespace:
    parser = argparse.ArgumentParser(description="Measure cut density from rendered video")
    parser.add_argument("video", help="Path to rendered video")
    parser.add_argument(
        "--scene-threshold",
        type=float,
        default=0.05,
        help="ffmpeg scene-change threshold tuned for Varnam-style hard resets (default: 0.05)",
    )
    parser.add_argument(
        "--min-cuts-per-minute",
        type=float,
        default=None,
        help="Optional floor; fail when the measured cut rate falls below it",
    )
    return parser.parse_args(argv)


def main(argv: list[str] | None = None) -> int:
    args = parse_args(argv)
    try:
        result = analyze_video(
            Path(args.video),
            scene_threshold=args.scene_threshold,
            min_cuts_per_minute=args.min_cuts_per_minute,
        )
    except (RuntimeError, FileNotFoundError, subprocess.CalledProcessError, ValueError) as exc:
        json.dump({"script": "cut_rate", "error": str(exc)}, sys.stdout, indent=2)
        sys.stdout.write("\n")
        return 1

    json.dump(result, sys.stdout, indent=2)
    sys.stdout.write("\n")
    return 0 if result["pass"] else 2


if __name__ == "__main__":
    raise SystemExit(main())
