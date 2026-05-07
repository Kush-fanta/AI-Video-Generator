#!/usr/bin/env python3
# ---
# varnam_script: review.benchmarks.visual_novelty
# owner: reviewer
# status: live
# surface: direct-only
# purpose: Visual novelty signal metric.
# use_when: Detect long visual plateaus after render.
# inputs: CLI args, manifests, env vars, or imports documented by argparse/docstring
# outputs: files, JSON/stdout reports, or process exit code documented by the script
# authority: scripts/README.md; scripts/SCRIPT_MAP.md
# ---
"""Deterministic visual novelty analysis for rendered video."""

from __future__ import annotations

import argparse
import json
import shutil
import subprocess
import sys
from pathlib import Path

import numpy as np


def _require_ffmpeg() -> None:
    if shutil.which("ffmpeg") and shutil.which("ffprobe"):
        return
    raise RuntimeError("ffmpeg and ffprobe are required")


def probe_video_stream(video_path: Path) -> tuple[int, int, float]:
    result = subprocess.run(
        [
            "ffprobe",
            "-v",
            "error",
            "-select_streams",
            "v:0",
            "-show_entries",
            "stream=width,height:format=duration",
            "-of",
            "json",
            str(video_path),
        ],
        check=True,
        capture_output=True,
        text=True,
    )
    payload = json.loads(result.stdout)
    stream = payload["streams"][0]
    width = int(stream["width"])
    height = int(stream["height"])
    duration = float(payload["format"]["duration"])
    return width, height, duration


def sample_grayscale_frames(
    video_path: Path,
    *,
    sample_fps: float,
    sample_width: int,
) -> tuple[np.ndarray, int]:
    source_width, source_height, _ = probe_video_stream(video_path)
    sample_height = max(8, int(round((source_height / source_width) * sample_width)))

    result = subprocess.run(
        [
            "ffmpeg",
            "-hide_banner",
            "-loglevel",
            "error",
            "-i",
            str(video_path),
            "-vf",
            f"fps={sample_fps},scale={sample_width}:{sample_height},format=gray",
            "-f",
            "rawvideo",
            "-pix_fmt",
            "gray",
            "-",
        ],
        check=True,
        capture_output=True,
    )

    frame_size = sample_width * sample_height
    if frame_size <= 0:
        raise ValueError("Invalid sampled frame dimensions")
    if len(result.stdout) % frame_size != 0:
        raise ValueError("ffmpeg returned incomplete frame data")

    frame_count = len(result.stdout) // frame_size
    if frame_count == 0:
        return np.empty((0, sample_height, sample_width), dtype=np.uint8), sample_height

    frames = np.frombuffer(result.stdout, dtype=np.uint8).reshape(frame_count, sample_height, sample_width)
    return frames, sample_height


def _frame_differences(frames: np.ndarray, lag: int) -> np.ndarray:
    if len(frames) <= lag:
        return np.empty((0,), dtype=np.float32)
    current = frames[lag:].astype(np.float32)
    previous = frames[:-lag].astype(np.float32)
    return np.mean(np.abs(current - previous), axis=(1, 2)) / 255.0


def _find_plateaus(
    low_mask: np.ndarray,
    *,
    sample_fps: float,
    recent_change: np.ndarray,
    lookback_change: np.ndarray,
    min_plateau_seconds: float,
    max_plateau_seconds: float | None,
    lookback_lag: int,
) -> tuple[list[dict[str, float | str]], float, float]:
    findings: list[dict[str, float | str]] = []
    low_indices = np.flatnonzero(low_mask)
    if len(low_indices) == 0:
        return findings, 0.0, 0.0

    total_low_seconds = float(low_mask.sum()) / sample_fps
    longest = 0.0
    run_start = low_indices[0]
    prev = low_indices[0]

    def emit(start_idx: int, end_idx: int) -> None:
        nonlocal longest
        duration = float(end_idx - start_idx + 1) / sample_fps
        longest = max(longest, duration)
        if duration < min_plateau_seconds:
            return
        interval_start = max(0.0, start_idx / sample_fps)
        interval_end = (end_idx + 1) / sample_fps
        severity = "soft"
        if max_plateau_seconds is not None and duration > max_plateau_seconds:
            severity = "hard"
        findings.append(
            {
                "timestamp": round(interval_start, 3),
                "end_timestamp": round(interval_end, 3),
                "duration": round(duration, 3),
                "issue": "low visual novelty plateau",
                "severity": severity,
                "mean_recent_change": round(float(np.mean(recent_change[start_idx : end_idx + 1])), 4),
                "mean_lookback_change": round(
                    float(np.mean(lookback_change[start_idx - lookback_lag + 1 : end_idx - lookback_lag + 2])),
                    4,
                ),
            }
        )

    for idx in low_indices[1:]:
        if idx == prev + 1:
            prev = idx
            continue
        emit(run_start, prev)
        run_start = idx
        prev = idx
    emit(run_start, prev)
    return findings, round(longest, 3), round(total_low_seconds, 3)


def analyze_video(
    video_path: Path,
    *,
    sample_fps: float = 1.0,
    sample_width: int = 96,
    lookback_seconds: float = 4.0,
    recent_threshold: float = 0.02,
    lookback_threshold: float = 0.08,
    min_plateau_seconds: float = 4.0,
    max_plateau_seconds: float | None = None,
) -> dict:
    _require_ffmpeg()
    video_path = video_path.expanduser().resolve()
    if not video_path.exists():
        raise FileNotFoundError(f"Video not found: {video_path}")
    if sample_fps <= 0:
        raise ValueError("sample_fps must be > 0")

    frames, sample_height = sample_grayscale_frames(
        video_path,
        sample_fps=sample_fps,
        sample_width=sample_width,
    )
    _, _, duration_seconds = probe_video_stream(video_path)

    if len(frames) < 2:
        return {
            "script": "visual_novelty",
            "video": str(video_path),
            "duration_seconds": round(duration_seconds, 3),
            "sample_fps": sample_fps,
            "sample_width": sample_width,
            "sample_height": sample_height,
            "lookback_seconds": lookback_seconds,
            "recent_threshold": recent_threshold,
            "lookback_threshold": lookback_threshold,
            "threshold": max_plateau_seconds,
            "pass": True,
            "score": 1.0,
            "sampled_frame_count": int(len(frames)),
            "mean_recent_change": None,
            "mean_lookback_change": None,
            "low_novelty_seconds": 0.0,
            "low_novelty_fraction": 0.0,
            "longest_plateau_seconds": 0.0,
            "findings": [],
        }

    recent_change = _frame_differences(frames, lag=1)
    lookback_lag = max(2, int(round(lookback_seconds * sample_fps)))
    lookback_change = _frame_differences(frames, lag=lookback_lag)

    if len(lookback_change) == 0:
        low_mask = np.zeros((0,), dtype=bool)
        findings = []
        longest_plateau = 0.0
        low_novelty_seconds = 0.0
    else:
        aligned_recent = recent_change[lookback_lag - 1 :]
        low_mask = (aligned_recent < recent_threshold) & (lookback_change < lookback_threshold)
        findings, longest_plateau, low_novelty_seconds = _find_plateaus(
            low_mask,
            sample_fps=sample_fps,
            recent_change=aligned_recent,
            lookback_change=lookback_change,
            min_plateau_seconds=min_plateau_seconds,
            max_plateau_seconds=max_plateau_seconds,
            lookback_lag=1,
        )

    low_novelty_fraction = 0.0 if duration_seconds <= 0 else low_novelty_seconds / duration_seconds
    score = max(0.0, 1.0 - low_novelty_fraction)
    passed = True
    if max_plateau_seconds is not None and longest_plateau > max_plateau_seconds:
        passed = False

    return {
        "script": "visual_novelty",
        "video": str(video_path),
        "duration_seconds": round(duration_seconds, 3),
        "sample_fps": sample_fps,
        "sample_width": sample_width,
        "sample_height": sample_height,
        "lookback_seconds": lookback_seconds,
        "recent_threshold": recent_threshold,
        "lookback_threshold": lookback_threshold,
        "threshold": max_plateau_seconds,
        "pass": passed,
        "score": round(score, 3),
        "sampled_frame_count": int(len(frames)),
        "mean_recent_change": round(float(np.mean(recent_change)), 4),
        "mean_lookback_change": round(float(np.mean(lookback_change)), 4) if len(lookback_change) else None,
        "low_novelty_seconds": round(low_novelty_seconds, 3),
        "low_novelty_fraction": round(low_novelty_fraction, 3),
        "longest_plateau_seconds": round(longest_plateau, 3),
        "findings": findings,
    }


def parse_args(argv: list[str] | None = None) -> argparse.Namespace:
    parser = argparse.ArgumentParser(description="Measure visual novelty across a rendered video")
    parser.add_argument("video", help="Path to rendered video")
    parser.add_argument("--sample-fps", type=float, default=1.0, help="Frames sampled per second (default: 1.0)")
    parser.add_argument("--sample-width", type=int, default=96, help="Sample width for analysis (default: 96)")
    parser.add_argument("--lookback-seconds", type=float, default=4.0, help="Lookback window in seconds")
    parser.add_argument("--recent-threshold", type=float, default=0.02, help="Low-change threshold for adjacent samples")
    parser.add_argument("--lookback-threshold", type=float, default=0.08, help="Low-change threshold across the lookback window")
    parser.add_argument("--min-plateau-seconds", type=float, default=4.0, help="Minimum plateau duration to report")
    parser.add_argument("--max-plateau-seconds", type=float, default=None, help="Fail when the longest low-novelty plateau exceeds this")
    return parser.parse_args(argv)


def main(argv: list[str] | None = None) -> int:
    args = parse_args(argv)
    try:
        result = analyze_video(
            Path(args.video),
            sample_fps=args.sample_fps,
            sample_width=args.sample_width,
            lookback_seconds=args.lookback_seconds,
            recent_threshold=args.recent_threshold,
            lookback_threshold=args.lookback_threshold,
            min_plateau_seconds=args.min_plateau_seconds,
            max_plateau_seconds=args.max_plateau_seconds,
        )
    except (RuntimeError, FileNotFoundError, subprocess.CalledProcessError, ValueError, KeyError, json.JSONDecodeError) as exc:
        json.dump({"script": "visual_novelty", "error": str(exc)}, sys.stdout, indent=2)
        sys.stdout.write("\n")
        return 1

    json.dump(result, sys.stdout, indent=2)
    sys.stdout.write("\n")
    return 0 if result["pass"] else 2


if __name__ == "__main__":
    raise SystemExit(main())
