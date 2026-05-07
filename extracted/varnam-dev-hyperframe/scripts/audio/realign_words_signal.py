#!/usr/bin/env python3
# ---
# varnam_script: audio.realign_words_signal
# owner: audio
# status: live
# surface: direct-only
# purpose: Signal-based word timing repair.
# use_when: Nudge minor word timestamp drift using audio evidence.
# inputs: CLI args, manifests, env vars, or imports documented by argparse/docstring
# outputs: files, JSON/stdout reports, or process exit code documented by the script
# authority: scripts/README.md; scripts/SCRIPT_MAP.md
# ---
"""Signal-based minor timestamp realignment for voiceover words."""

from __future__ import annotations

import argparse
import json
import shutil
import subprocess
import sys
from datetime import datetime, timezone
from pathlib import Path
from typing import Any, Optional

import numpy as np


def _decode_audio_mono(audio_path: Path, sample_rate: int) -> np.ndarray:
    cmd = [
        "ffmpeg",
        "-v",
        "error",
        "-nostdin",
        "-i",
        str(audio_path),
        "-ac",
        "1",
        "-ar",
        str(sample_rate),
        "-f",
        "f32le",
        "-",
    ]
    proc = subprocess.run(cmd, capture_output=True)
    if proc.returncode != 0:
        stderr = proc.stderr.decode("utf-8", errors="replace").strip()
        raise RuntimeError(f"ffmpeg decode failed: {stderr or 'unknown error'}")
    samples = np.frombuffer(proc.stdout, dtype=np.float32)
    if samples.size < sample_rate // 4:
        raise RuntimeError("Decoded audio is too short for alignment")
    return samples


def _load_words(path: Path) -> list[dict[str, Any]]:
    payload = json.loads(path.read_text(encoding="utf-8"))
    if not isinstance(payload, list):
        raise ValueError("words payload must be a JSON list")
    words: list[dict[str, Any]] = []
    prev_start = -1.0
    for idx, entry in enumerate(payload):
        if not isinstance(entry, dict):
            raise ValueError(f"words[{idx}] is not an object")
        if "start" not in entry or "end" not in entry:
            raise ValueError(f"words[{idx}] missing start/end")
        start = float(entry["start"])
        end = float(entry["end"])
        if end < start:
            raise ValueError(f"words[{idx}] end < start ({end} < {start})")
        if start < prev_start:
            raise ValueError(
                f"words[{idx}] is non-monotonic ({start} < previous {prev_start})"
            )
        prev_start = start
        words.append({"word": str(entry.get("word", "")), "start": start, "end": end})
    if not words:
        raise ValueError("words list is empty")
    return words


def _onset_envelope(
    samples: np.ndarray, sample_rate: int, frame_ms: float = 25.0, hop_ms: float = 10.0
) -> tuple[np.ndarray, np.ndarray]:
    frame = max(32, int(round(sample_rate * frame_ms / 1000.0)))
    hop = max(16, int(round(sample_rate * hop_ms / 1000.0)))
    if samples.size < frame:
        raise RuntimeError("Audio too short for onset envelope")
    count = 1 + (samples.size - frame) // hop
    stride = samples.strides[0]
    frames = np.lib.stride_tricks.as_strided(
        samples,
        shape=(count, frame),
        strides=(hop * stride, stride),
        writeable=False,
    )
    window = np.hanning(frame).astype(np.float32)
    weighted = frames * window
    rms = np.sqrt(np.mean(weighted * weighted, axis=1) + 1e-12)
    log_energy = np.log1p(rms * 200.0)
    flux = np.maximum(0.0, np.diff(log_energy))
    if flux.size == 0:
        raise RuntimeError("Unable to derive onset envelope")
    smooth_kernel = np.ones(5, dtype=np.float32) / 5.0
    envelope = np.convolve(flux, smooth_kernel, mode="same")
    p95 = float(np.percentile(envelope, 95))
    if p95 > 1e-6:
        envelope = np.clip(envelope / p95, 0.0, 1.5)
    else:
        envelope = np.zeros_like(envelope)
    times = (np.arange(envelope.size, dtype=np.float32) + 1.0) * (hop / sample_rate)
    return times, envelope.astype(np.float32)


def _score_alignment(
    starts: np.ndarray, envelope_times: np.ndarray, envelope: np.ndarray
) -> float:
    clipped = np.clip(starts, float(envelope_times[0]), float(envelope_times[-1]))
    samples = np.interp(clipped, envelope_times, envelope)
    return float(np.mean(samples))


def _estimate_shift(
    starts: np.ndarray,
    envelope_times: np.ndarray,
    envelope: np.ndarray,
    min_shift: float,
    max_shift: float,
    step: float,
) -> tuple[float, float]:
    deltas = np.arange(min_shift, max_shift + (step * 0.5), step, dtype=np.float32)
    best_delta = 0.0
    best_score = -1.0
    for delta in deltas:
        score = _score_alignment(starts + float(delta), envelope_times, envelope)
        if score > best_score:
            best_score = score
            best_delta = float(delta)
    return best_delta, best_score


def _moving_median(values: np.ndarray, radius: int = 2) -> np.ndarray:
    if values.size == 0:
        return values
    out = np.empty_like(values)
    for idx in range(values.size):
        left = max(0, idx - radius)
        right = min(values.size, idx + radius + 1)
        out[idx] = float(np.median(values[left:right]))
    return out


def _build_lag_profile(
    starts: np.ndarray,
    envelope_times: np.ndarray,
    envelope: np.ndarray,
    duration: float,
    global_shift: float,
    window_seconds: float,
    step_seconds: float,
    min_words: int,
    max_local_residual: float,
    grid_step: float,
) -> list[dict[str, Any]]:
    profile: list[dict[str, Any]] = []
    half = window_seconds * 0.5
    center = half
    while center <= max(half, duration - half):
        lo = center - half
        hi = center + half
        mask = (starts >= lo) & (starts < hi)
        count = int(mask.sum())
        if count >= min_words:
            local_starts = starts[mask]
            best_delta, best_score = _estimate_shift(
                local_starts,
                envelope_times,
                envelope,
                min_shift=global_shift - max_local_residual,
                max_shift=global_shift + max_local_residual,
                step=grid_step,
            )
            profile.append(
                {
                    "center_seconds": round(center, 3),
                    "word_count": count,
                    "shift_seconds": round(best_delta, 6),
                    "residual_seconds": round(best_delta - global_shift, 6),
                    "alignment_score": round(best_score, 6),
                }
            )
        center += step_seconds
    if not profile:
        return profile
    residuals = np.array([float(item["residual_seconds"]) for item in profile], dtype=np.float32)
    smoothed = _moving_median(residuals, radius=2)
    for idx, item in enumerate(profile):
        item["residual_seconds_smoothed"] = round(float(smoothed[idx]), 6)
    return profile


def _interp_profile_shift(profile: list[dict[str, Any]], starts: np.ndarray) -> np.ndarray:
    if not profile:
        return np.zeros_like(starts, dtype=np.float32)
    xs = np.array([float(item["center_seconds"]) for item in profile], dtype=np.float32)
    ys = np.array(
        [float(item.get("residual_seconds_smoothed", item["residual_seconds"])) for item in profile],
        dtype=np.float32,
    )
    return np.interp(starts, xs, ys, left=ys[0], right=ys[-1]).astype(np.float32)


def _local_nudges(
    shifted_starts: np.ndarray,
    envelope_times: np.ndarray,
    envelope: np.ndarray,
    max_nudge_seconds: float,
    min_gain: float,
) -> np.ndarray:
    if max_nudge_seconds <= 0:
        return np.zeros_like(shifted_starts, dtype=np.float32)
    nudges = np.zeros_like(shifted_starts, dtype=np.float32)
    for idx, t in enumerate(shifted_starts):
        left = float(t - max_nudge_seconds)
        right = float(t + max_nudge_seconds)
        lo_idx = int(np.searchsorted(envelope_times, left, side="left"))
        hi_idx = int(np.searchsorted(envelope_times, right, side="right"))
        if hi_idx - lo_idx <= 2:
            continue
        segment = envelope[lo_idx:hi_idx]
        base = float(np.interp(t, envelope_times, envelope))
        peak_rel = int(np.argmax(segment))
        peak = float(segment[peak_rel])
        gain = peak - base
        if gain < min_gain:
            continue
        peak_t = float(envelope_times[lo_idx + peak_rel])
        nudges[idx] = np.float32(peak_t - t)
    return nudges


def _apply_shifts(
    words: list[dict[str, Any]],
    shifts: np.ndarray,
    audio_duration: float,
    min_word_duration: float,
) -> list[dict[str, Any]]:
    corrected: list[dict[str, Any]] = []
    prev_end = 0.0
    for idx, word in enumerate(words):
        start = float(word["start"])
        end = float(word["end"])
        duration = max(end - start, min_word_duration)
        shifted_start = start + float(shifts[idx])
        shifted_start = max(0.0, min(shifted_start, max(0.0, audio_duration - duration)))
        shifted_start = max(shifted_start, prev_end)
        shifted_end = shifted_start + duration
        if shifted_end > audio_duration:
            shifted_end = audio_duration
            shifted_start = max(prev_end, shifted_end - duration)
        if shifted_end < shifted_start + min_word_duration:
            shifted_end = min(audio_duration, shifted_start + min_word_duration)
        corrected.append(
            {
                "word": word["word"],
                "start": round(shifted_start, 3),
                "end": round(max(shifted_end, shifted_start), 3),
            }
        )
        prev_end = corrected[-1]["end"]
    return corrected


def parse_args(argv: list[str] | None = None) -> argparse.Namespace:
    parser = argparse.ArgumentParser(
        description=(
            "Estimate minor timestamp drift from audio onset signal and apply bounded "
            "corrections to voiceover.words.json"
        )
    )
    parser.add_argument("--audio", required=True, help="Path to voiceover audio file")
    parser.add_argument("--words", required=True, help="Path to words JSON file")
    parser.add_argument(
        "--out",
        help="Output path for corrected words JSON (default: <words>.signal-corrected.json)",
    )
    parser.add_argument(
        "--in-place",
        action="store_true",
        help="Overwrite --words in place (writes a backup copy first)",
    )
    parser.add_argument("--report-out", help="Optional path for JSON drift report")
    parser.add_argument("--sample-rate", type=int, default=16000)
    parser.add_argument("--max-global-shift-ms", type=float, default=120.0)
    parser.add_argument("--grid-step-ms", type=float, default=2.5)
    parser.add_argument("--local-window-seconds", type=float, default=14.0)
    parser.add_argument("--local-step-seconds", type=float, default=7.0)
    parser.add_argument("--local-min-words", type=int, default=24)
    parser.add_argument("--max-local-residual-ms", type=float, default=20.0)
    parser.add_argument("--max-local-nudge-ms", type=float, default=10.0)
    parser.add_argument("--nudge-min-gain", type=float, default=0.08)
    parser.add_argument("--max-total-shift-ms", type=float, default=90.0)
    parser.add_argument("--min-word-duration-ms", type=float, default=30.0)
    return parser.parse_args(argv)


def main(argv: list[str] | None = None) -> int:
    args = parse_args(argv)
    audio_path = Path(args.audio).expanduser().resolve()
    words_path = Path(args.words).expanduser().resolve()

    if args.in_place and args.out:
        print(
            json.dumps(
                {"status": "error", "error": "--in-place cannot be used with --out"},
                indent=2,
            )
        )
        return 1
    if not audio_path.exists():
        print(json.dumps({"status": "error", "error": f"Missing audio: {audio_path}"}, indent=2))
        return 1
    if not words_path.exists():
        print(json.dumps({"status": "error", "error": f"Missing words: {words_path}"}, indent=2))
        return 1

    try:
        words = _load_words(words_path)
        samples = _decode_audio_mono(audio_path, sample_rate=args.sample_rate)
        envelope_times, envelope = _onset_envelope(samples, sample_rate=args.sample_rate)
    except Exception as exc:  # noqa: BLE001
        print(json.dumps({"status": "error", "error": str(exc)}, indent=2))
        return 1

    starts = np.array([float(entry["start"]) for entry in words], dtype=np.float32)
    duration = samples.size / float(args.sample_rate)
    grid_step = max(0.0005, args.grid_step_ms / 1000.0)
    max_global = max(0.005, args.max_global_shift_ms / 1000.0)
    max_local_residual = max(0.0, args.max_local_residual_ms / 1000.0)
    max_local_nudge = max(0.0, args.max_local_nudge_ms / 1000.0)
    max_total_shift = max(0.001, args.max_total_shift_ms / 1000.0)
    min_word_duration = max(0.001, args.min_word_duration_ms / 1000.0)

    baseline_score = _score_alignment(starts, envelope_times, envelope)
    global_shift, global_score = _estimate_shift(
        starts,
        envelope_times,
        envelope,
        min_shift=-max_global,
        max_shift=max_global,
        step=grid_step,
    )

    lag_profile = _build_lag_profile(
        starts,
        envelope_times,
        envelope,
        duration=duration,
        global_shift=global_shift,
        window_seconds=args.local_window_seconds,
        step_seconds=args.local_step_seconds,
        min_words=args.local_min_words,
        max_local_residual=max_local_residual,
        grid_step=grid_step,
    )

    profile_residual = _interp_profile_shift(lag_profile, starts)
    shifted_starts = starts + np.float32(global_shift) + profile_residual
    local_nudges = _local_nudges(
        shifted_starts,
        envelope_times,
        envelope,
        max_nudge_seconds=max_local_nudge,
        min_gain=args.nudge_min_gain,
    )

    shifts = np.float32(global_shift) + profile_residual + local_nudges
    shifts = np.clip(shifts, -max_total_shift, max_total_shift)
    corrected_words = _apply_shifts(
        words,
        shifts=shifts,
        audio_duration=duration,
        min_word_duration=min_word_duration,
    )
    corrected_starts = np.array(
        [float(entry["start"]) for entry in corrected_words], dtype=np.float32
    )
    corrected_score = _score_alignment(corrected_starts, envelope_times, envelope)

    out_path: Path
    backup_path: Optional[Path] = None
    if args.in_place:
        out_path = words_path
        backup_path = words_path.with_name(f"{words_path.stem}.pre-signal.json")
        shutil.copy2(words_path, backup_path)
    elif args.out:
        out_path = Path(args.out).expanduser().resolve()
    else:
        out_path = words_path.with_name(f"{words_path.stem}.signal-corrected.json")

    out_path.parent.mkdir(parents=True, exist_ok=True)
    out_path.write_text(json.dumps(corrected_words, indent=2), encoding="utf-8")

    shift_ms = shifts.astype(np.float64) * 1000.0
    abs_shift_ms = np.abs(shift_ms)
    top_indices = np.argsort(abs_shift_ms)[::-1][:10]
    top_adjustments = []
    for idx in top_indices:
        top_adjustments.append(
            {
                "index": int(idx),
                "word": words[int(idx)]["word"],
                "original_start": round(float(words[int(idx)]["start"]), 3),
                "new_start": round(float(corrected_words[int(idx)]["start"]), 3),
                "shift_ms": round(float(shift_ms[int(idx)]), 2),
            }
        )

    report: dict[str, Any] = {
        "status": "ok",
        "audio": str(audio_path),
        "words_in": str(words_path),
        "words_out": str(out_path),
        "backup_path": str(backup_path) if backup_path else None,
        "generated_at": datetime.now(timezone.utc).isoformat(),
        "metrics": {
            "word_count": len(words),
            "audio_duration_seconds": round(duration, 3),
            "alignment_score_before": round(baseline_score, 6),
            "alignment_score_after": round(corrected_score, 6),
            "alignment_score_gain": round(corrected_score - baseline_score, 6),
            "global_shift_ms": round(global_shift * 1000.0, 2),
            "global_score": round(global_score, 6),
            "profile_points": len(lag_profile),
            "local_nudges_applied": int(np.count_nonzero(np.abs(local_nudges) > 1e-6)),
            "median_abs_shift_ms": round(float(np.median(abs_shift_ms)), 2),
            "p95_abs_shift_ms": round(float(np.percentile(abs_shift_ms, 95)), 2),
            "max_abs_shift_ms": round(float(np.max(abs_shift_ms)), 2),
        },
        "lag_profile": lag_profile,
        "top_adjustments": top_adjustments,
    }

    if args.report_out:
        report_path = Path(args.report_out).expanduser().resolve()
        report_path.parent.mkdir(parents=True, exist_ok=True)
        report_path.write_text(json.dumps(report, indent=2), encoding="utf-8")

    print(json.dumps(report, indent=2))
    return 0


if __name__ == "__main__":
    raise SystemExit(main())
