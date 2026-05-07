#!/usr/bin/env python3
# ---
# varnam_script: review.benchmarks.frame_clutter
# owner: reviewer
# status: live
# surface: direct-only
# purpose: Frame density signal metric.
# use_when: Detect overcrowded visual frames.
# inputs: CLI args, manifests, env vars, or imports documented by argparse/docstring
# outputs: files, JSON/stdout reports, or process exit code documented by the script
# authority: scripts/README.md; scripts/SCRIPT_MAP.md
# ---
"""Detect visually cluttered frames in rendered video."""

from __future__ import annotations

import argparse
import json
import sys
from pathlib import Path

import numpy as np

from visual_novelty import probe_video_stream, sample_grayscale_frames


def _blur_frame(frame: np.ndarray, radius: int = 2) -> np.ndarray:
    frame_f = frame.astype(np.float32) / 255.0
    if radius <= 0:
        return frame_f

    height, width = frame_f.shape
    padded = np.pad(frame_f, radius, mode="edge")
    blurred = np.zeros((height, width), dtype=np.float32)
    kernel_width = 2 * radius + 1
    for offset_y in range(kernel_width):
        for offset_x in range(kernel_width):
            blurred += padded[offset_y : offset_y + height, offset_x : offset_x + width]
    return blurred / float(kernel_width * kernel_width)


def _edge_strength(frame: np.ndarray) -> np.ndarray:
    frame_f = _blur_frame(frame, radius=2)
    gx = np.zeros_like(frame_f)
    gy = np.zeros_like(frame_f)
    gx[:, 1:] = np.abs(frame_f[:, 1:] - frame_f[:, :-1])
    gy[1:, :] = np.abs(frame_f[1:, :] - frame_f[:-1, :])
    return np.clip(gx + gy, 0.0, 1.0)


def _pool_to_grid(signal_map: np.ndarray, grid_size: int) -> np.ndarray:
    height, width = signal_map.shape
    if grid_size <= 1:
        raise ValueError("grid_size must be > 1")
    if height < grid_size or width < grid_size:
        raise ValueError("grid_size exceeds sampled frame dimensions")

    block_h = height // grid_size
    block_w = width // grid_size
    trimmed_h = block_h * grid_size
    trimmed_w = block_w * grid_size
    trimmed = signal_map[:trimmed_h, :trimmed_w]
    return trimmed.reshape(grid_size, block_h, grid_size, block_w).mean(axis=(1, 3))


def _normalized_entropy(values: np.ndarray) -> float:
    flat = values.reshape(-1).astype(np.float64)
    total = float(flat.sum())
    if total <= 1e-8:
        return 0.0
    probabilities = flat / total
    nonzero = probabilities[probabilities > 1e-12]
    return float(-(nonzero * np.log(nonzero)).sum() / np.log(len(flat)))


def _normalized_component(value: np.ndarray, floor: float, ceiling: float) -> np.ndarray:
    if ceiling <= floor:
        raise ValueError("ceiling must be greater than floor")
    return np.clip((value - floor) / (ceiling - floor), 0.0, 1.0)


def compute_frame_metrics(
    frames: np.ndarray,
    *,
    grid_size: int,
    edge_density_cutoff: float,
    occupied_block_cutoff: float,
    edge_density_floor: float,
    edge_density_ceiling: float,
    occupied_block_floor: float,
    occupied_block_ceiling: float,
    entropy_floor: float,
    entropy_ceiling: float,
) -> dict[str, np.ndarray]:
    if len(frames) == 0:
        empty = np.empty((0,), dtype=np.float32)
        return {
            "edge_density": empty,
            "occupied_block_fraction": empty,
            "spatial_entropy": empty,
            "frame_clutter_score": empty,
        }

    edge_density: list[float] = []
    occupied_block_fraction: list[float] = []
    spatial_entropy: list[float] = []
    frame_clutter_score: list[float] = []

    for frame in frames:
        edge_map = _edge_strength(frame)
        pooled = _pool_to_grid(edge_map, grid_size=grid_size)

        edge_density_value = float(np.mean(edge_map >= edge_density_cutoff))
        occupied_fraction_value = float(np.mean(pooled >= occupied_block_cutoff))
        entropy_value = _normalized_entropy(pooled)

        edge_component = _normalized_component(
            np.array([edge_density_value], dtype=np.float32),
            edge_density_floor,
            edge_density_ceiling,
        )[0]
        occupied_component = _normalized_component(
            np.array([occupied_fraction_value], dtype=np.float32),
            occupied_block_floor,
            occupied_block_ceiling,
        )[0]
        entropy_component = _normalized_component(
            np.array([entropy_value], dtype=np.float32),
            entropy_floor,
            entropy_ceiling,
        )[0]

        score = 0.4 * edge_component + 0.35 * occupied_component + 0.25 * entropy_component

        edge_density.append(edge_density_value)
        occupied_block_fraction.append(occupied_fraction_value)
        spatial_entropy.append(entropy_value)
        frame_clutter_score.append(float(score))

    return {
        "edge_density": np.array(edge_density, dtype=np.float32),
        "occupied_block_fraction": np.array(occupied_block_fraction, dtype=np.float32),
        "spatial_entropy": np.array(spatial_entropy, dtype=np.float32),
        "frame_clutter_score": np.array(frame_clutter_score, dtype=np.float32),
    }


def _find_clutter_runs(
    high_mask: np.ndarray,
    *,
    sample_fps: float,
    edge_density: np.ndarray,
    occupied_block_fraction: np.ndarray,
    spatial_entropy: np.ndarray,
    frame_clutter_score: np.ndarray,
    min_run_seconds: float,
    max_run_seconds: float | None,
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
        if duration < min_run_seconds:
            return
        severity = "soft"
        if max_run_seconds is not None and duration > max_run_seconds:
            severity = "hard"
        findings.append(
            {
                "timestamp": round(run_start / sample_fps, 3),
                "end_timestamp": round((run_end + 1) / sample_fps, 3),
                "duration": round(duration, 3),
                "issue": "high visual clutter run",
                "severity": severity,
                "mean_edge_density": round(float(np.mean(edge_density[run_start : run_end + 1])), 4),
                "mean_occupied_block_fraction": round(
                    float(np.mean(occupied_block_fraction[run_start : run_end + 1])),
                    4,
                ),
                "mean_spatial_entropy": round(float(np.mean(spatial_entropy[run_start : run_end + 1])), 4),
                "mean_frame_clutter_score": round(float(np.mean(frame_clutter_score[run_start : run_end + 1])), 4),
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
    sample_width: int = 128,
    grid_size: int = 12,
    edge_density_cutoff: float = 0.12,
    occupied_block_cutoff: float = 0.045,
    edge_density_floor: float = 0.04,
    edge_density_ceiling: float = 0.22,
    occupied_block_floor: float = 0.2,
    occupied_block_ceiling: float = 0.85,
    entropy_floor: float = 0.55,
    entropy_ceiling: float = 0.95,
    clutter_score_threshold: float = 0.6,
    min_clutter_run_seconds: float = 3.0,
    max_clutter_run_seconds: float | None = None,
) -> dict:
    video_path = video_path.expanduser().resolve()
    if not video_path.exists():
        raise FileNotFoundError(f"Video not found: {video_path}")
    if sample_fps <= 0:
        raise ValueError("sample_fps must be > 0")
    if not 0.0 <= clutter_score_threshold <= 1.0:
        raise ValueError("clutter_score_threshold must be within [0, 1]")

    frames, sample_height = sample_grayscale_frames(video_path, sample_fps=sample_fps, sample_width=sample_width)
    _, _, duration_seconds = probe_video_stream(video_path)
    metrics = compute_frame_metrics(
        frames,
        grid_size=grid_size,
        edge_density_cutoff=edge_density_cutoff,
        occupied_block_cutoff=occupied_block_cutoff,
        edge_density_floor=edge_density_floor,
        edge_density_ceiling=edge_density_ceiling,
        occupied_block_floor=occupied_block_floor,
        occupied_block_ceiling=occupied_block_ceiling,
        entropy_floor=entropy_floor,
        entropy_ceiling=entropy_ceiling,
    )

    frame_scores = metrics["frame_clutter_score"]
    if len(frame_scores) == 0:
        return {
            "script": "frame_clutter",
            "video": str(video_path),
            "duration_seconds": round(duration_seconds, 3),
            "sample_fps": sample_fps,
            "sample_width": sample_width,
            "sample_height": sample_height,
            "grid_size": grid_size,
            "threshold": max_clutter_run_seconds,
            "clutter_score_threshold": clutter_score_threshold,
            "pass": True,
            "score": 1.0,
            "sampled_frame_count": 0,
            "high_clutter_seconds": 0.0,
            "high_clutter_fraction": 0.0,
            "longest_clutter_run_seconds": 0.0,
            "findings": [],
        }

    high_mask = frame_scores >= clutter_score_threshold
    findings, longest_run, high_clutter_seconds = _find_clutter_runs(
        high_mask,
        sample_fps=sample_fps,
        edge_density=metrics["edge_density"],
        occupied_block_fraction=metrics["occupied_block_fraction"],
        spatial_entropy=metrics["spatial_entropy"],
        frame_clutter_score=frame_scores,
        min_run_seconds=min_clutter_run_seconds,
        max_run_seconds=max_clutter_run_seconds,
    )

    high_clutter_fraction = 0.0 if duration_seconds <= 0 else high_clutter_seconds / duration_seconds
    score = max(0.0, 1.0 - high_clutter_fraction)
    passed = True
    if max_clutter_run_seconds is not None and longest_run > max_clutter_run_seconds:
        passed = False

    return {
        "script": "frame_clutter",
        "video": str(video_path),
        "duration_seconds": round(duration_seconds, 3),
        "sample_fps": sample_fps,
        "sample_width": sample_width,
        "sample_height": sample_height,
        "grid_size": grid_size,
        "threshold": max_clutter_run_seconds,
        "clutter_score_threshold": clutter_score_threshold,
        "pass": passed,
        "score": round(score, 3),
        "sampled_frame_count": int(len(frame_scores)),
        "mean_edge_density": round(float(np.mean(metrics["edge_density"])), 4),
        "peak_edge_density": round(float(np.max(metrics["edge_density"])), 4),
        "mean_occupied_block_fraction": round(float(np.mean(metrics["occupied_block_fraction"])), 4),
        "peak_occupied_block_fraction": round(float(np.max(metrics["occupied_block_fraction"])), 4),
        "mean_spatial_entropy": round(float(np.mean(metrics["spatial_entropy"])), 4),
        "peak_spatial_entropy": round(float(np.max(metrics["spatial_entropy"])), 4),
        "mean_frame_clutter_score": round(float(np.mean(frame_scores)), 4),
        "peak_frame_clutter_score": round(float(np.max(frame_scores)), 4),
        "high_clutter_seconds": round(high_clutter_seconds, 3),
        "high_clutter_fraction": round(high_clutter_fraction, 3),
        "longest_clutter_run_seconds": round(longest_run, 3),
        "findings": findings,
    }


def parse_args(argv: list[str] | None = None) -> argparse.Namespace:
    parser = argparse.ArgumentParser(description="Measure visually cluttered runs in a rendered video")
    parser.add_argument("video", help="Path to rendered video")
    parser.add_argument("--sample-fps", type=float, default=1.0)
    parser.add_argument("--sample-width", type=int, default=128)
    parser.add_argument("--grid-size", type=int, default=12)
    parser.add_argument("--edge-density-cutoff", type=float, default=0.12)
    parser.add_argument("--occupied-block-cutoff", type=float, default=0.045)
    parser.add_argument("--edge-density-floor", type=float, default=0.04)
    parser.add_argument("--edge-density-ceiling", type=float, default=0.22)
    parser.add_argument("--occupied-block-floor", type=float, default=0.2)
    parser.add_argument("--occupied-block-ceiling", type=float, default=0.85)
    parser.add_argument("--entropy-floor", type=float, default=0.55)
    parser.add_argument("--entropy-ceiling", type=float, default=0.95)
    parser.add_argument("--clutter-score-threshold", type=float, default=0.6)
    parser.add_argument("--min-clutter-run-seconds", type=float, default=3.0)
    parser.add_argument("--max-clutter-run-seconds", type=float, default=None)
    return parser.parse_args(argv)


def main(argv: list[str] | None = None) -> int:
    args = parse_args(argv)
    try:
        result = analyze_video(
            Path(args.video),
            sample_fps=args.sample_fps,
            sample_width=args.sample_width,
            grid_size=args.grid_size,
            edge_density_cutoff=args.edge_density_cutoff,
            occupied_block_cutoff=args.occupied_block_cutoff,
            edge_density_floor=args.edge_density_floor,
            edge_density_ceiling=args.edge_density_ceiling,
            occupied_block_floor=args.occupied_block_floor,
            occupied_block_ceiling=args.occupied_block_ceiling,
            entropy_floor=args.entropy_floor,
            entropy_ceiling=args.entropy_ceiling,
            clutter_score_threshold=args.clutter_score_threshold,
            min_clutter_run_seconds=args.min_clutter_run_seconds,
            max_clutter_run_seconds=args.max_clutter_run_seconds,
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
