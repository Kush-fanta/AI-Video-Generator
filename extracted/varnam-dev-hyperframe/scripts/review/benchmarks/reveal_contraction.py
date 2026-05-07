#!/usr/bin/env python3
# ---
# varnam_script: review.benchmarks.reveal_contraction
# owner: reviewer
# status: live
# surface: direct-only
# purpose: Reveal timing contraction metric.
# use_when: Catch reveal pacing that collapses under runtime pressure.
# inputs: CLI args, manifests, env vars, or imports documented by argparse/docstring
# outputs: files, JSON/stdout reports, or process exit code documented by the script
# authority: scripts/README.md; scripts/SCRIPT_MAP.md
# ---
"""Measure whether accompaniment contracts at reveal markers."""

from __future__ import annotations

import argparse
import json
import math
import shutil
import subprocess
import sys
from pathlib import Path

import numpy as np


def _require_ffmpeg() -> None:
    if shutil.which("ffmpeg") and shutil.which("ffprobe"):
        return
    raise RuntimeError("ffmpeg and ffprobe are required")


def probe_media_duration(media_path: Path) -> float:
    result = subprocess.run(
        [
            "ffprobe",
            "-v",
            "error",
            "-show_entries",
            "format=duration",
            "-of",
            "default=noprint_wrappers=1:nokey=1",
            str(media_path),
        ],
        check=True,
        capture_output=True,
        text=True,
    )
    return float(result.stdout.strip())


def decode_audio_mono(media_path: Path, *, sample_rate: int) -> np.ndarray:
    result = subprocess.run(
        [
            "ffmpeg",
            "-hide_banner",
            "-loglevel",
            "error",
            "-i",
            str(media_path),
            "-vn",
            "-ac",
            "1",
            "-ar",
            str(sample_rate),
            "-f",
            "f32le",
            "-",
        ],
        check=True,
        capture_output=True,
    )
    return np.frombuffer(result.stdout, dtype=np.float32)


def load_words(words_path: Path) -> list[dict[str, float | str]]:
    with open(words_path, "r", encoding="utf-8") as handle:
        words = json.load(handle)
    if not isinstance(words, list):
        raise ValueError(f"Expected a list of words in {words_path}")
    return words


def build_voiced_mask(
    words: list[dict[str, float | str]],
    *,
    sample_count: int,
    sample_rate: int,
) -> np.ndarray:
    mask = np.zeros(sample_count, dtype=bool)
    for word in words:
        start = max(0, int(round(float(word["start"]) * sample_rate)))
        end = min(sample_count, int(round(float(word["end"]) * sample_rate)))
        if end > start:
            mask[start:end] = True
    return mask


def load_markers(markers_path: Path) -> list[dict[str, str | float]]:
    with open(markers_path, "r", encoding="utf-8") as handle:
        payload = json.load(handle)
    if isinstance(payload, dict):
        markers = payload.get("markers", [])
    else:
        markers = payload
    if not isinstance(markers, list):
        raise ValueError(f"Expected a marker list in {markers_path}")
    return markers


def resolve_anchor(anchor: str, words: list[dict[str, float | str]]) -> float:
    parts = anchor.split(":")
    if len(parts) != 3 or parts[0] != "word":
        raise ValueError(f"Invalid anchor format: {anchor}")
    target_word = parts[1].lower()
    try:
        target_occurrence = int(parts[2])
    except ValueError as exc:
        raise ValueError(f"Invalid anchor occurrence: {anchor}") from exc

    count = 0
    for entry in words:
        word = str(entry["word"]).lower().strip(".,!?;:'\"")
        if word != target_word:
            continue
        count += 1
        if count == target_occurrence:
            return float(entry["start"])
    raise ValueError(f"Anchor not found in words: {anchor}")


def resolve_markers(
    markers: list[dict[str, str | float]],
    *,
    words: list[dict[str, float | str]],
) -> list[dict[str, str | float]]:
    resolved: list[dict[str, str | float]] = []
    for marker in markers:
        if not isinstance(marker, dict):
            raise ValueError("Each marker must be an object")
        label = str(marker.get("label") or marker.get("anchor") or marker.get("timestamp") or "marker")
        if "timestamp" in marker:
            timestamp = float(marker["timestamp"])
        elif "anchor" in marker:
            timestamp = resolve_anchor(str(marker["anchor"]), words)
        else:
            raise ValueError(f"Marker missing timestamp or anchor: {marker}")
        resolved.append({"label": label, "timestamp": timestamp})
    return resolved


def estimate_voice_gain(mix_samples: np.ndarray, voiceover_samples: np.ndarray, voiced_mask: np.ndarray) -> float:
    if not voiced_mask.any():
        return 1.0
    voice = voiceover_samples[voiced_mask]
    mix = mix_samples[voiced_mask]
    denom = float(np.dot(voice, voice))
    if denom <= 1e-9:
        return 1.0
    gain = float(np.dot(mix, voice) / denom)
    return float(np.clip(gain, 0.25, 4.0))


def rms(samples: np.ndarray) -> float:
    if len(samples) == 0:
        return 0.0
    return float(np.sqrt(np.mean(np.square(samples, dtype=np.float32), dtype=np.float32) + 1e-12))


def analyze_mix(
    mix_path: Path,
    *,
    voiceover_path: Path,
    words_path: Path,
    markers_path: Path,
    sample_rate: int = 16000,
    pre_window_seconds: float = 0.85,
    pre_gap_seconds: float = 0.15,
    post_start_offset_seconds: float = -0.05,
    post_window_seconds: float = 0.65,
    min_reveal_contraction_db: float = 2.5,
) -> dict:
    _require_ffmpeg()

    mix_path = mix_path.expanduser().resolve()
    voiceover_path = Path(voiceover_path).expanduser().resolve()
    words_path = Path(words_path).expanduser().resolve()
    markers_path = Path(markers_path).expanduser().resolve()

    if not mix_path.exists():
        raise FileNotFoundError(f"Mix not found: {mix_path}")
    if not voiceover_path.exists():
        raise FileNotFoundError(f"Voiceover not found: {voiceover_path}")
    if not words_path.exists():
        raise FileNotFoundError(f"Words file not found: {words_path}")
    if not markers_path.exists():
        raise FileNotFoundError(f"Markers file not found: {markers_path}")
    if sample_rate <= 0:
        raise ValueError("sample_rate must be > 0")
    if pre_window_seconds <= 0 or post_window_seconds <= 0:
        raise ValueError("pre_window_seconds and post_window_seconds must be > 0")
    if pre_gap_seconds < 0:
        raise ValueError("pre_gap_seconds must be >= 0")

    mix_samples = decode_audio_mono(mix_path, sample_rate=sample_rate)
    voiceover_samples = decode_audio_mono(voiceover_path, sample_rate=sample_rate)
    sample_count = min(len(mix_samples), len(voiceover_samples))
    mix_samples = mix_samples[:sample_count]
    voiceover_samples = voiceover_samples[:sample_count]

    words = load_words(words_path)
    markers = resolve_markers(load_markers(markers_path), words=words)
    voiced_mask = build_voiced_mask(words, sample_count=sample_count, sample_rate=sample_rate)
    voice_gain = estimate_voice_gain(mix_samples, voiceover_samples, voiced_mask)
    accompaniment = mix_samples - voice_gain * voiceover_samples
    duration_seconds = min(probe_media_duration(mix_path), probe_media_duration(voiceover_path))

    resolved_markers: list[dict[str, float | str]] = []
    contractions: list[float] = []
    findings: list[dict[str, float | str]] = []

    for marker in markers:
        timestamp = float(marker["timestamp"])
        pre_start = int(round((timestamp - pre_window_seconds) * sample_rate))
        pre_end = int(round((timestamp - pre_gap_seconds) * sample_rate))
        post_start = int(round((timestamp + post_start_offset_seconds) * sample_rate))
        post_end = int(round((timestamp + post_start_offset_seconds + post_window_seconds) * sample_rate))

        pre_start = max(0, pre_start)
        pre_end = min(sample_count, pre_end)
        post_start = max(0, post_start)
        post_end = min(sample_count, post_end)

        if pre_end <= pre_start or post_end <= post_start:
            continue

        pre_rms = rms(accompaniment[pre_start:pre_end])
        post_rms = rms(accompaniment[post_start:post_end])
        contraction_db = 20.0 * math.log10((pre_rms + 1e-9) / (post_rms + 1e-9))
        contractions.append(float(contraction_db))

        marker_result = {
            "label": str(marker["label"]),
            "timestamp": round(timestamp, 3),
            "pre_rms": round(pre_rms, 6),
            "post_rms": round(post_rms, 6),
            "reveal_contraction_db": round(float(contraction_db), 3),
        }
        resolved_markers.append(marker_result)

        if contraction_db < min_reveal_contraction_db:
            findings.append(
                {
                    "timestamp": round(timestamp, 3),
                    "issue": "reveal accompaniment did not contract enough",
                    "severity": "hard",
                    "label": str(marker["label"]),
                    "reveal_contraction_db": round(float(contraction_db), 3),
                }
            )

    if not contractions:
        return {
            "script": "reveal_contraction",
            "mix": str(mix_path),
            "voiceover": str(voiceover_path),
            "words": str(words_path),
            "markers": str(markers_path),
            "duration_seconds": round(duration_seconds, 3),
            "sample_rate": sample_rate,
            "threshold": min_reveal_contraction_db,
            "pass": True,
            "score": 1.0,
            "marker_count": 0,
            "supported_reveal_fraction": 1.0,
            "mean_reveal_contraction_db": 0.0,
            "median_reveal_contraction_db": 0.0,
            "weakest_reveal_contraction_db": 0.0,
            "strongest_reveal_contraction_db": 0.0,
            "markers_resolved": [],
            "findings": [],
        }

    contraction_array = np.array(contractions, dtype=np.float32)
    supported_fraction = float(np.mean(contraction_array >= min_reveal_contraction_db))
    passed = bool(np.all(contraction_array >= min_reveal_contraction_db))

    return {
        "script": "reveal_contraction",
        "mix": str(mix_path),
        "voiceover": str(voiceover_path),
        "words": str(words_path),
        "markers": str(markers_path),
        "duration_seconds": round(duration_seconds, 3),
        "sample_rate": sample_rate,
        "threshold": min_reveal_contraction_db,
        "pass": passed,
        "score": round(max(0.0, supported_fraction), 3),
        "marker_count": int(len(contraction_array)),
        "supported_reveal_fraction": round(supported_fraction, 3),
        "mean_reveal_contraction_db": round(float(np.mean(contraction_array)), 3),
        "median_reveal_contraction_db": round(float(np.median(contraction_array)), 3),
        "weakest_reveal_contraction_db": round(float(np.min(contraction_array)), 3),
        "strongest_reveal_contraction_db": round(float(np.max(contraction_array)), 3),
        "voice_gain_applied": round(voice_gain, 3),
        "markers_resolved": resolved_markers,
        "findings": findings,
    }


def parse_args(argv: list[str] | None = None) -> argparse.Namespace:
    parser = argparse.ArgumentParser(description="Measure accompaniment contraction at reveal markers")
    parser.add_argument("mix", help="Path to the final mixed audio or video")
    parser.add_argument("--voiceover", required=True, help="Path to the clean voiceover stem")
    parser.add_argument("--words", required=True, help="Path to voiceover.words.json")
    parser.add_argument("--markers", required=True, help="Path to reveal marker JSON")
    parser.add_argument("--sample-rate", type=int, default=16000, help="Analysis sample rate")
    parser.add_argument(
        "--pre-window-seconds",
        type=float,
        default=0.85,
        help="Seconds of buildup audio to sample before a reveal",
    )
    parser.add_argument(
        "--pre-gap-seconds",
        type=float,
        default=0.15,
        help="Gap between the reveal marker and the pre window",
    )
    parser.add_argument(
        "--post-start-offset-seconds",
        type=float,
        default=-0.05,
        help="Offset from marker to start measuring the reveal window",
    )
    parser.add_argument(
        "--post-window-seconds",
        type=float,
        default=0.65,
        help="Seconds of reveal window audio to measure",
    )
    parser.add_argument(
        "--min-reveal-contraction-db",
        type=float,
        default=2.5,
        help="Minimum accompaniment drop required at each reveal",
    )
    return parser.parse_args(argv)


def main(argv: list[str] | None = None) -> int:
    args = parse_args(argv)
    try:
        result = analyze_mix(
            Path(args.mix),
            voiceover_path=Path(args.voiceover),
            words_path=Path(args.words),
            markers_path=Path(args.markers),
            sample_rate=args.sample_rate,
            pre_window_seconds=args.pre_window_seconds,
            pre_gap_seconds=args.pre_gap_seconds,
            post_start_offset_seconds=args.post_start_offset_seconds,
            post_window_seconds=args.post_window_seconds,
            min_reveal_contraction_db=args.min_reveal_contraction_db,
        )
    except (FileNotFoundError, ValueError, RuntimeError, subprocess.CalledProcessError) as exc:
        json.dump({"error": str(exc)}, sys.stdout, indent=2)
        sys.stdout.write("\n")
        return 1

    json.dump(result, sys.stdout, indent=2)
    sys.stdout.write("\n")
    return 0 if result["pass"] else 2


if __name__ == "__main__":
    raise SystemExit(main())
