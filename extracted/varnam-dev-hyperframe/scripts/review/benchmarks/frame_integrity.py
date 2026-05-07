#!/usr/bin/env python3
# ---
# varnam_script: review.benchmarks.frame_integrity
# owner: reviewer
# status: live
# surface: direct-only
# purpose: Frame integrity signal metric.
# use_when: Detect blank, solid, placeholder, or frozen-frame anomalies.
# inputs: CLI args, manifests, env vars, or imports documented by argparse/docstring
# outputs: files, JSON/stdout reports, or process exit code documented by the script
# authority: scripts/README.md; scripts/SCRIPT_MAP.md
# ---
"""Detect render-integrity failures: blank, solid, frozen, or placeholder frames."""

from __future__ import annotations

import argparse
import json
import shutil
import subprocess
import sys
from pathlib import Path

import numpy as np

from visual_novelty import probe_video_stream, sample_grayscale_frames


def _require_ffmpeg() -> None:
    if shutil.which("ffmpeg") and shutil.which("ffprobe"):
        return
    raise RuntimeError("ffmpeg and ffprobe are required")


def sample_rgb_frames(
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
            f"fps={sample_fps},scale={sample_width}:{sample_height},format=rgb24",
            "-f",
            "rawvideo",
            "-pix_fmt",
            "rgb24",
            "-",
        ],
        check=True,
        capture_output=True,
    )

    frame_size = sample_width * sample_height * 3
    if frame_size <= 0:
        raise ValueError("Invalid sampled frame dimensions")
    if len(result.stdout) % frame_size != 0:
        raise ValueError("ffmpeg returned incomplete frame data")

    frame_count = len(result.stdout) // frame_size
    if frame_count == 0:
        return np.empty((0, sample_height, sample_width, 3), dtype=np.uint8), sample_height

    frames = np.frombuffer(result.stdout, dtype=np.uint8).reshape(
        frame_count, sample_height, sample_width, 3
    )
    return frames, sample_height


def _patch_pool_max(values: np.ndarray, *, grid: int) -> np.ndarray:
    """Pool a (N, H, W) tensor into (N, grid, grid) patch-means and return the per-frame max patch value."""
    if len(values) == 0:
        return np.zeros((0,), dtype=np.float32)
    if grid <= 1:
        return values.reshape(len(values), -1).max(axis=1).astype(np.float32)
    height, width = values.shape[1], values.shape[2]
    block_h = max(1, height // grid)
    block_w = max(1, width // grid)
    trimmed_h = block_h * grid
    trimmed_w = block_w * grid
    if trimmed_h == 0 or trimmed_w == 0:
        return values.reshape(len(values), -1).mean(axis=1).astype(np.float32)
    trimmed = values[:, :trimmed_h, :trimmed_w]
    pooled = trimmed.reshape(len(values), grid, block_h, grid, block_w).mean(axis=(2, 4))
    return pooled.reshape(len(values), -1).max(axis=1).astype(np.float32)


def _detect_blank(
    gray_frames: np.ndarray,
    *,
    blank_var_threshold: float,
    patch_grid: int,
) -> np.ndarray:
    if len(gray_frames) == 0:
        return np.zeros((0,), dtype=bool)
    normalized = gray_frames.astype(np.float32) / 255.0
    mean_per_patch = _patch_means(normalized, grid=patch_grid)
    sq_per_patch = _patch_means(normalized * normalized, grid=patch_grid)
    patch_variances = np.clip(sq_per_patch - mean_per_patch * mean_per_patch, 0.0, None)
    max_patch_variance = patch_variances.reshape(len(gray_frames), -1).max(axis=1)
    return max_patch_variance < blank_var_threshold


def _patch_means(values: np.ndarray, *, grid: int) -> np.ndarray:
    """Pool a (N, H, W) tensor into a (N, grid, grid) tensor of patch means."""
    if len(values) == 0:
        return np.zeros((0, grid, grid), dtype=np.float32)
    if grid <= 1:
        return values.mean(axis=(1, 2)).reshape(len(values), 1, 1).astype(np.float32)
    height, width = values.shape[1], values.shape[2]
    block_h = max(1, height // grid)
    block_w = max(1, width // grid)
    trimmed_h = block_h * grid
    trimmed_w = block_w * grid
    if trimmed_h == 0 or trimmed_w == 0:
        return values.mean(axis=(1, 2)).reshape(len(values), 1, 1).astype(np.float32)
    trimmed = values[:, :trimmed_h, :trimmed_w]
    pooled = trimmed.reshape(len(values), grid, block_h, grid, block_w).mean(axis=(2, 4))
    return pooled.astype(np.float32)


def _detect_solid(rgb_frames: np.ndarray, *, solid_pct_threshold: float, bins: int) -> np.ndarray:
    if len(rgb_frames) == 0:
        return np.zeros((0,), dtype=bool)
    quantized = (rgb_frames.astype(np.uint16) * bins // 256).astype(np.uint16)
    keys = quantized[..., 0] * bins * bins + quantized[..., 1] * bins + quantized[..., 2]
    flagged = np.zeros(len(rgb_frames), dtype=bool)
    pixels_per_frame = keys.shape[1] * keys.shape[2]
    for idx in range(len(rgb_frames)):
        counts = np.bincount(keys[idx].ravel())
        dominant_pct = counts.max() / pixels_per_frame
        if dominant_pct > solid_pct_threshold:
            flagged[idx] = True
    return flagged


def _detect_placeholder(rgb_frames: np.ndarray, *, magenta_pct_threshold: float) -> np.ndarray:
    if len(rgb_frames) == 0:
        return np.zeros((0,), dtype=bool)
    r = rgb_frames[..., 0]
    g = rgb_frames[..., 1]
    b = rgb_frames[..., 2]
    magenta_mask = (r >= 240) & (g <= 16) & (b >= 240)
    pixels_per_frame = magenta_mask.shape[1] * magenta_mask.shape[2]
    fractions = magenta_mask.reshape(len(rgb_frames), -1).sum(axis=1) / pixels_per_frame
    return fractions > magenta_pct_threshold


def _detect_frozen_runs(
    gray_frames: np.ndarray,
    *,
    sample_fps: float,
    frozen_diff_threshold: float,
    frozen_min_seconds: float,
    patch_grid: int,
) -> tuple[list[dict[str, float | str]], int, float]:
    if len(gray_frames) < 2:
        return [], 0, 0.0
    current = gray_frames[1:].astype(np.float32)
    previous = gray_frames[:-1].astype(np.float32)
    abs_diff = np.abs(current - previous) / 255.0
    diffs = _patch_pool_max(abs_diff, grid=patch_grid)
    low_mask = diffs < frozen_diff_threshold

    findings: list[dict[str, float | str]] = []
    longest = 0.0
    if not low_mask.any():
        return findings, 0, 0.0

    low_indices = np.flatnonzero(low_mask)
    run_start = low_indices[0]
    prev = low_indices[0]

    def emit(start_idx: int, end_idx: int) -> None:
        nonlocal longest
        run_length_frames = end_idx - start_idx + 2
        duration = run_length_frames / sample_fps
        longest = max(longest, duration)
        if duration < frozen_min_seconds:
            return
        findings.append(
            {
                "timestamp": round(start_idx / sample_fps, 3),
                "end_timestamp": round((end_idx + 2) / sample_fps, 3),
                "duration": round(duration, 3),
                "issue": "frozen frame run",
                "mean_diff": round(float(np.mean(diffs[start_idx : end_idx + 1])), 5),
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
    return findings, len(findings), round(longest, 3)


def _flag_timestamps(
    mask: np.ndarray, sample_fps: float, reason: str
) -> list[dict[str, float | str]]:
    if not mask.any():
        return []
    return [
        {"timestamp": round(int(idx) / sample_fps, 3), "issue": reason}
        for idx in np.flatnonzero(mask)
    ]


def analyze_video(
    video_path: Path,
    *,
    sample_fps: float = 4.0,
    sample_width: int = 96,
    blank_var_threshold: float = 1e-4,
    solid_pct_threshold: float = 0.99,
    solid_bins: int = 16,
    magenta_pct_threshold: float = 0.5,
    frozen_diff_threshold: float = 1e-3,
    frozen_min_seconds: float = 2.0,
    patch_grid: int = 6,
) -> dict:
    _require_ffmpeg()
    video_path = video_path.expanduser().resolve()
    if not video_path.exists():
        raise FileNotFoundError(f"Video not found: {video_path}")
    if sample_fps <= 0:
        raise ValueError("sample_fps must be > 0")

    _, _, duration_seconds = probe_video_stream(video_path)
    gray_frames, sample_height = sample_grayscale_frames(
        video_path, sample_fps=sample_fps, sample_width=sample_width
    )
    rgb_frames, _ = sample_rgb_frames(
        video_path, sample_fps=sample_fps, sample_width=sample_width
    )

    aligned = min(len(gray_frames), len(rgb_frames))
    gray_frames = gray_frames[:aligned]
    rgb_frames = rgb_frames[:aligned]

    blank_mask = _detect_blank(
        gray_frames, blank_var_threshold=blank_var_threshold, patch_grid=patch_grid
    )
    solid_mask = _detect_solid(
        rgb_frames, solid_pct_threshold=solid_pct_threshold, bins=solid_bins
    )
    placeholder_mask = _detect_placeholder(
        rgb_frames, magenta_pct_threshold=magenta_pct_threshold
    )
    frozen_findings, frozen_run_count, longest_frozen_seconds = _detect_frozen_runs(
        gray_frames,
        sample_fps=sample_fps,
        frozen_diff_threshold=frozen_diff_threshold,
        frozen_min_seconds=frozen_min_seconds,
        patch_grid=patch_grid,
    )

    flagged: list[dict[str, float | str]] = []
    flagged.extend(_flag_timestamps(blank_mask, sample_fps, "blank"))
    flagged.extend(_flag_timestamps(solid_mask, sample_fps, "solid"))
    flagged.extend(_flag_timestamps(placeholder_mask, sample_fps, "placeholder"))
    flagged.extend(frozen_findings)
    flagged.sort(key=lambda entry: entry["timestamp"])

    blank_count = int(blank_mask.sum())
    solid_count = int(solid_mask.sum())
    placeholder_count = int(placeholder_mask.sum())

    return {
        "script": "frame_integrity",
        "video": str(video_path),
        "duration_seconds": round(duration_seconds, 3),
        "sample_fps": sample_fps,
        "sample_width": sample_width,
        "sample_height": sample_height,
        "frames_sampled": int(aligned),
        "blank_frame_count": blank_count,
        "solid_frame_count": solid_count,
        "placeholder_frame_count": placeholder_count,
        "frozen_run_count": frozen_run_count,
        "longest_frozen_seconds": longest_frozen_seconds,
        "findings": flagged,
    }


def parse_args(argv: list[str] | None = None) -> argparse.Namespace:
    parser = argparse.ArgumentParser(description="Detect render-integrity failures in a rendered video")
    parser.add_argument("video", help="Path to rendered video")
    parser.add_argument("--sample-fps", type=float, default=4.0)
    parser.add_argument("--sample-width", type=int, default=96)
    parser.add_argument("--blank-var-threshold", type=float, default=1e-4)
    parser.add_argument("--solid-pct-threshold", type=float, default=0.99)
    parser.add_argument("--solid-bins", type=int, default=16)
    parser.add_argument("--magenta-pct-threshold", type=float, default=0.5)
    parser.add_argument("--frozen-diff-threshold", type=float, default=1e-3)
    parser.add_argument("--frozen-min-seconds", type=float, default=2.0)
    parser.add_argument("--patch-grid", type=int, default=6)
    return parser.parse_args(argv)


def main(argv: list[str] | None = None) -> int:
    args = parse_args(argv)
    try:
        result = analyze_video(
            Path(args.video),
            sample_fps=args.sample_fps,
            sample_width=args.sample_width,
            blank_var_threshold=args.blank_var_threshold,
            solid_pct_threshold=args.solid_pct_threshold,
            solid_bins=args.solid_bins,
            magenta_pct_threshold=args.magenta_pct_threshold,
            frozen_diff_threshold=args.frozen_diff_threshold,
            frozen_min_seconds=args.frozen_min_seconds,
            patch_grid=args.patch_grid,
        )
    except (RuntimeError, FileNotFoundError, subprocess.CalledProcessError, ValueError, KeyError, json.JSONDecodeError) as exc:
        json.dump({"script": "frame_integrity", "error": str(exc)}, sys.stdout, indent=2)
        sys.stdout.write("\n")
        return 1

    json.dump(result, sys.stdout, indent=2)
    sys.stdout.write("\n")
    return 0


if __name__ == "__main__":
    raise SystemExit(main())
