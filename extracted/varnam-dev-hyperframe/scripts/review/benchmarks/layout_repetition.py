#!/usr/bin/env python3
# ---
# varnam_script: review.benchmarks.layout_repetition
# owner: reviewer
# status: live
# surface: direct-only
# purpose: Layout repetition signal metric.
# use_when: Find repeated layout patterns across chapters.
# inputs: CLI args, manifests, env vars, or imports documented by argparse/docstring
# outputs: files, JSON/stdout reports, or process exit code documented by the script
# authority: scripts/README.md; scripts/SCRIPT_MAP.md
# ---
"""Detect repeated layout structure across rendered video frames."""

from __future__ import annotations

import argparse
import json
import subprocess
import sys
from pathlib import Path

import numpy as np

from visual_novelty import probe_video_stream, sample_grayscale_frames


def _edge_strength(frame: np.ndarray) -> np.ndarray:
    frame_f = frame.astype(np.float32) / 255.0
    gx = np.zeros_like(frame_f)
    gy = np.zeros_like(frame_f)
    gx[:, 1:] = np.abs(frame_f[:, 1:] - frame_f[:, :-1])
    gy[1:, :] = np.abs(frame_f[1:, :] - frame_f[:-1, :])
    return gx + gy


def _pool_to_grid(edge_map: np.ndarray, grid_size: int) -> np.ndarray:
    height, width = edge_map.shape
    block_h = max(1, height // grid_size)
    block_w = max(1, width // grid_size)
    trimmed_h = block_h * grid_size
    trimmed_w = block_w * grid_size
    trimmed = edge_map[:trimmed_h, :trimmed_w]
    pooled = trimmed.reshape(grid_size, block_h, grid_size, block_w).mean(axis=(1, 3))
    total = float(pooled.sum())
    if total > 1e-8:
        pooled = pooled / total
    return pooled


def compute_layout_fingerprints(frames: np.ndarray, grid_size: int) -> np.ndarray:
    if len(frames) == 0:
        return np.empty((0, grid_size * grid_size), dtype=np.float32)
    fingerprints = []
    for frame in frames:
        pooled = _pool_to_grid(_edge_strength(frame), grid_size=grid_size)
        fingerprints.append(pooled.reshape(-1))
    return np.stack(fingerprints).astype(np.float32)


def _cosine_similarity_vectors(a: np.ndarray, b: np.ndarray) -> np.ndarray:
    dot = np.sum(a * b, axis=1)
    a_norm = np.linalg.norm(a, axis=1)
    b_norm = np.linalg.norm(b, axis=1)
    denom = a_norm * b_norm
    similarity = np.zeros_like(dot, dtype=np.float32)
    both_zero = denom < 1e-8
    similarity[both_zero] = 1.0
    valid = ~both_zero
    similarity[valid] = dot[valid] / denom[valid]
    return similarity


def _similarity_series(fingerprints: np.ndarray, lag: int) -> np.ndarray:
    if len(fingerprints) <= lag:
        return np.empty((0,), dtype=np.float32)
    return _cosine_similarity_vectors(fingerprints[lag:], fingerprints[:-lag])


def _find_repetition_runs(
    high_mask: np.ndarray,
    *,
    sample_fps: float,
    recent_similarity: np.ndarray,
    lookback_similarity: np.ndarray,
    min_plateau_seconds: float,
    max_plateau_seconds: float | None,
) -> tuple[list[dict[str, float | str]], float, float]:
    findings: list[dict[str, float | str]] = []
    indices = np.flatnonzero(high_mask)
    if len(indices) == 0:
        return findings, 0.0, 0.0

    total_seconds = float(high_mask.sum()) / sample_fps
    longest = 0.0
    start = indices[0]
    prev = indices[0]

    def emit(run_start: int, run_end: int) -> None:
        nonlocal longest
        duration = float(run_end - run_start + 1) / sample_fps
        longest = max(longest, duration)
        if duration < min_plateau_seconds:
            return
        severity = "soft"
        if max_plateau_seconds is not None and duration > max_plateau_seconds:
            severity = "hard"
        findings.append(
            {
                "timestamp": round(run_start / sample_fps, 3),
                "end_timestamp": round((run_end + 1) / sample_fps, 3),
                "duration": round(duration, 3),
                "issue": "repeated layout plateau",
                "severity": severity,
                "mean_recent_layout_similarity": round(float(np.mean(recent_similarity[run_start : run_end + 1])), 4),
                "mean_lookback_layout_similarity": round(float(np.mean(lookback_similarity[run_start : run_end + 1])), 4),
            }
        )

    for idx in indices[1:]:
        if idx == prev + 1:
            prev = idx
            continue
        emit(start, prev)
        start = idx
        prev = idx
    emit(start, prev)
    return findings, round(longest, 3), round(total_seconds, 3)


def analyze_video(
    video_path: Path,
    *,
    sample_fps: float = 1.0,
    sample_width: int = 96,
    grid_size: int = 12,
    lookback_seconds: float = 4.0,
    recent_similarity_threshold: float = 0.92,
    lookback_similarity_threshold: float = 0.88,
    min_plateau_seconds: float = 4.0,
    max_plateau_seconds: float | None = None,
) -> dict:
    video_path = video_path.expanduser().resolve()
    if not video_path.exists():
        raise FileNotFoundError(f"Video not found: {video_path}")
    if sample_fps <= 0:
        raise ValueError("sample_fps must be > 0")
    if grid_size <= 1:
        raise ValueError("grid_size must be > 1")

    frames, sample_height = sample_grayscale_frames(video_path, sample_fps=sample_fps, sample_width=sample_width)
    _, _, duration_seconds = probe_video_stream(video_path)
    fingerprints = compute_layout_fingerprints(frames, grid_size=grid_size)

    if len(fingerprints) < 2:
        return {
            "script": "layout_repetition",
            "video": str(video_path),
            "duration_seconds": round(duration_seconds, 3),
            "sample_fps": sample_fps,
            "sample_width": sample_width,
            "sample_height": sample_height,
            "grid_size": grid_size,
            "lookback_seconds": lookback_seconds,
            "recent_similarity_threshold": recent_similarity_threshold,
            "lookback_similarity_threshold": lookback_similarity_threshold,
            "threshold": max_plateau_seconds,
            "pass": True,
            "score": 1.0,
            "sampled_frame_count": int(len(fingerprints)),
            "high_repetition_seconds": 0.0,
            "high_repetition_fraction": 0.0,
            "longest_plateau_seconds": 0.0,
            "findings": [],
        }

    recent_similarity = _similarity_series(fingerprints, lag=1)
    lookback_lag = max(2, int(round(lookback_seconds * sample_fps)))
    lookback_similarity = _similarity_series(fingerprints, lag=lookback_lag)

    if len(lookback_similarity) == 0:
        findings = []
        longest_plateau = 0.0
        high_repetition_seconds = 0.0
        aligned_recent = np.empty((0,), dtype=np.float32)
    else:
        aligned_recent = recent_similarity[lookback_lag - 1 :]
        high_mask = (aligned_recent >= recent_similarity_threshold) & (
            lookback_similarity >= lookback_similarity_threshold
        )
        findings, longest_plateau, high_repetition_seconds = _find_repetition_runs(
            high_mask,
            sample_fps=sample_fps,
            recent_similarity=aligned_recent,
            lookback_similarity=lookback_similarity,
            min_plateau_seconds=min_plateau_seconds,
            max_plateau_seconds=max_plateau_seconds,
        )

    high_repetition_fraction = 0.0 if duration_seconds <= 0 else high_repetition_seconds / duration_seconds
    score = max(0.0, 1.0 - high_repetition_fraction)
    passed = True
    if max_plateau_seconds is not None and longest_plateau > max_plateau_seconds:
        passed = False

    return {
        "script": "layout_repetition",
        "video": str(video_path),
        "duration_seconds": round(duration_seconds, 3),
        "sample_fps": sample_fps,
        "sample_width": sample_width,
        "sample_height": sample_height,
        "grid_size": grid_size,
        "lookback_seconds": lookback_seconds,
        "recent_similarity_threshold": recent_similarity_threshold,
        "lookback_similarity_threshold": lookback_similarity_threshold,
        "threshold": max_plateau_seconds,
        "pass": passed,
        "score": round(score, 3),
        "sampled_frame_count": int(len(fingerprints)),
        "mean_recent_layout_similarity": round(float(np.mean(recent_similarity)), 4),
        "mean_lookback_layout_similarity": round(float(np.mean(lookback_similarity)), 4) if len(lookback_similarity) else None,
        "high_repetition_seconds": round(high_repetition_seconds, 3),
        "high_repetition_fraction": round(high_repetition_fraction, 3),
        "longest_plateau_seconds": round(longest_plateau, 3),
        "findings": findings,
    }


def parse_args(argv: list[str] | None = None) -> argparse.Namespace:
    parser = argparse.ArgumentParser(description="Measure repeated layout structure across a rendered video")
    parser.add_argument("video", help="Path to rendered video")
    parser.add_argument("--sample-fps", type=float, default=1.0)
    parser.add_argument("--sample-width", type=int, default=96)
    parser.add_argument("--grid-size", type=int, default=12)
    parser.add_argument("--lookback-seconds", type=float, default=4.0)
    parser.add_argument("--recent-similarity-threshold", type=float, default=0.92)
    parser.add_argument("--lookback-similarity-threshold", type=float, default=0.88)
    parser.add_argument("--min-plateau-seconds", type=float, default=4.0)
    parser.add_argument("--max-plateau-seconds", type=float, default=None)
    return parser.parse_args(argv)


def main(argv: list[str] | None = None) -> int:
    args = parse_args(argv)
    try:
        result = analyze_video(
            Path(args.video),
            sample_fps=args.sample_fps,
            sample_width=args.sample_width,
            grid_size=args.grid_size,
            lookback_seconds=args.lookback_seconds,
            recent_similarity_threshold=args.recent_similarity_threshold,
            lookback_similarity_threshold=args.lookback_similarity_threshold,
            min_plateau_seconds=args.min_plateau_seconds,
            max_plateau_seconds=args.max_plateau_seconds,
        )
    except (FileNotFoundError, ValueError, subprocess.CalledProcessError, KeyError, json.JSONDecodeError) as exc:
        json.dump({"script": "layout_repetition", "error": str(exc)}, sys.stdout, indent=2)
        sys.stdout.write("\n")
        return 1

    json.dump(result, sys.stdout, indent=2)
    sys.stdout.write("\n")
    return 0 if result["pass"] else 2


if __name__ == "__main__":
    raise SystemExit(main())
