#!/usr/bin/env python3
# ---
# varnam_script: review.benchmarks.speech_masking
# owner: reviewer
# status: live
# surface: direct-only
# purpose: Speech masking signal metric.
# use_when: Check SFX/music masking against narration frequencies.
# inputs: CLI args, manifests, env vars, or imports documented by argparse/docstring
# outputs: files, JSON/stdout reports, or process exit code documented by the script
# authority: scripts/README.md; scripts/SCRIPT_MAP.md
# ---
"""Detect when score or SFX add competing speech-band energy over narration."""

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
            "s16le",
            "-",
        ],
        check=True,
        capture_output=True,
    )
    return np.frombuffer(result.stdout, dtype=np.int16).astype(np.float32) / 32768.0


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


def _window_power(
    samples: np.ndarray,
    *,
    window_size: int,
    window_fn: np.ndarray,
) -> np.ndarray:
    return np.abs(np.fft.rfft(samples[:window_size] * window_fn)) ** 2 + 1e-9


def _find_mask_runs(
    high_mask: np.ndarray,
    *,
    window_times: np.ndarray,
    window_seconds: float,
    hop_seconds: float,
    masking_values_db: np.ndarray,
    min_run_seconds: float,
    max_run_seconds: float | None,
) -> tuple[list[dict[str, float | str]], float, float]:
    findings: list[dict[str, float | str]] = []
    indices = np.flatnonzero(high_mask)
    if len(indices) == 0:
        return findings, 0.0, 0.0

    total_seconds = float(high_mask.sum()) * hop_seconds
    longest = 0.0
    start_idx = indices[0]
    prev_idx = indices[0]

    def emit(run_start: int, run_end: int) -> None:
        nonlocal longest
        duration = (run_end - run_start) * hop_seconds + window_seconds
        longest = max(longest, duration)
        if duration < min_run_seconds:
            return
        severity = "soft"
        if max_run_seconds is not None and duration > max_run_seconds:
            severity = "hard"
        findings.append(
            {
                "timestamp": round(float(window_times[run_start]), 3),
                "end_timestamp": round(float(window_times[run_end] + window_seconds), 3),
                "duration": round(float(duration), 3),
                "issue": "speech-band masking run",
                "severity": severity,
                "mean_speech_masking_db": round(
                    float(np.mean(masking_values_db[run_start : run_end + 1])),
                    3,
                ),
                "peak_speech_masking_db": round(
                    float(np.max(masking_values_db[run_start : run_end + 1])),
                    3,
                ),
            }
        )

    for idx in indices[1:]:
        if idx == prev_idx + 1:
            prev_idx = idx
            continue
        emit(start_idx, prev_idx)
        start_idx = idx
        prev_idx = idx
    emit(start_idx, prev_idx)
    return findings, round(longest, 3), round(total_seconds, 3)


def analyze_mix(
    mix_path: Path,
    *,
    voiceover_path: Path,
    words_path: Path,
    sample_rate: int = 16000,
    window_seconds: float = 0.5,
    hop_seconds: float = 0.25,
    min_voiced_fraction: float = 0.5,
    voice_energy_floor_quantile: float = 0.15,
    speech_band_low_hz: float = 300.0,
    speech_band_high_hz: float = 3000.0,
    safe_band_low_hz: float = 50.0,
    safe_band_high_hz: float = 7000.0,
    safe_band_gap_low_hz: float = 250.0,
    safe_band_gap_high_hz: float = 4000.0,
    masking_threshold_db: float = 2.0,
    min_mask_run_seconds: float = 1.0,
    max_mask_run_seconds: float | None = None,
) -> dict:
    _require_ffmpeg()

    mix_path = mix_path.expanduser().resolve()
    voiceover_path = Path(voiceover_path).expanduser().resolve()
    words_path = Path(words_path).expanduser().resolve()

    if not mix_path.exists():
        raise FileNotFoundError(f"Mix not found: {mix_path}")
    if not voiceover_path.exists():
        raise FileNotFoundError(f"Voiceover not found: {voiceover_path}")
    if not words_path.exists():
        raise FileNotFoundError(f"Words file not found: {words_path}")
    if sample_rate <= 0:
        raise ValueError("sample_rate must be > 0")
    if window_seconds <= 0 or hop_seconds <= 0:
        raise ValueError("window_seconds and hop_seconds must be > 0")
    if not 0.0 <= min_voiced_fraction <= 1.0:
        raise ValueError("min_voiced_fraction must be within [0, 1]")
    if not 0.0 <= voice_energy_floor_quantile <= 1.0:
        raise ValueError("voice_energy_floor_quantile must be within [0, 1]")

    mix_samples = decode_audio_mono(mix_path, sample_rate=sample_rate)
    voiceover_samples = decode_audio_mono(voiceover_path, sample_rate=sample_rate)
    sample_count = min(len(mix_samples), len(voiceover_samples))
    mix_samples = mix_samples[:sample_count]
    voiceover_samples = voiceover_samples[:sample_count]

    words = load_words(words_path)
    voiced_mask = build_voiced_mask(words, sample_count=sample_count, sample_rate=sample_rate)

    window_size = max(32, int(round(window_seconds * sample_rate)))
    hop_size = max(1, int(round(hop_seconds * sample_rate)))
    if sample_count < window_size:
        duration_seconds = min(probe_media_duration(mix_path), probe_media_duration(voiceover_path))
        return {
            "script": "speech_masking",
            "mix": str(mix_path),
            "voiceover": str(voiceover_path),
            "words": str(words_path),
            "duration_seconds": round(duration_seconds, 3),
            "sample_rate": sample_rate,
            "window_seconds": window_seconds,
            "hop_seconds": hop_seconds,
            "threshold": max_mask_run_seconds,
            "masking_threshold_db": masking_threshold_db,
            "pass": True,
            "score": 1.0,
            "voiced_window_count": 0,
            "high_mask_seconds": 0.0,
            "high_mask_fraction": 0.0,
            "longest_mask_run_seconds": 0.0,
            "findings": [],
        }

    window_fn = np.hanning(window_size).astype(np.float32)
    freqs = np.fft.rfftfreq(window_size, d=1.0 / sample_rate)
    speech_band = (freqs >= speech_band_low_hz) & (freqs <= speech_band_high_hz)
    safe_band = ((freqs >= safe_band_low_hz) & (freqs < safe_band_gap_low_hz)) | (
        (freqs > safe_band_gap_high_hz) & (freqs <= safe_band_high_hz)
    )
    full_band = (freqs >= safe_band_low_hz) & (freqs <= safe_band_high_hz)
    if not speech_band.any() or not safe_band.any() or not full_band.any():
        raise ValueError("Configured frequency bands are empty at the chosen sample rate")

    candidate_voice_energy: list[float] = []
    for start in range(0, sample_count - window_size + 1, hop_size):
        voiced_fraction = float(np.mean(voiced_mask[start : start + window_size]))
        if voiced_fraction < min_voiced_fraction:
            continue
        voice_power = _window_power(voiceover_samples[start : start + window_size], window_size=window_size, window_fn=window_fn)
        candidate_voice_energy.append(float(np.sum(voice_power[full_band])))

    duration_seconds = min(probe_media_duration(mix_path), probe_media_duration(voiceover_path))
    if not candidate_voice_energy:
        return {
            "script": "speech_masking",
            "mix": str(mix_path),
            "voiceover": str(voiceover_path),
            "words": str(words_path),
            "duration_seconds": round(duration_seconds, 3),
            "sample_rate": sample_rate,
            "window_seconds": window_seconds,
            "hop_seconds": hop_seconds,
            "threshold": max_mask_run_seconds,
            "masking_threshold_db": masking_threshold_db,
            "pass": True,
            "score": 1.0,
            "voiced_window_count": 0,
            "high_mask_seconds": 0.0,
            "high_mask_fraction": 0.0,
            "longest_mask_run_seconds": 0.0,
            "findings": [],
        }

    voice_energy_floor = float(np.quantile(candidate_voice_energy, voice_energy_floor_quantile))

    window_times: list[float] = []
    speech_share_delta_db: list[float] = []
    speech_masking_db: list[float] = []

    for start in range(0, sample_count - window_size + 1, hop_size):
        voiced_fraction = float(np.mean(voiced_mask[start : start + window_size]))
        if voiced_fraction < min_voiced_fraction:
            continue

        voice_window = voiceover_samples[start : start + window_size]
        mix_window = mix_samples[start : start + window_size]
        voice_power = _window_power(voice_window, window_size=window_size, window_fn=window_fn)
        voice_full = float(np.sum(voice_power[full_band]))
        if voice_full < voice_energy_floor:
            continue

        mix_power = _window_power(mix_window, window_size=window_size, window_fn=window_fn)
        voice_speech = float(np.sum(voice_power[speech_band]))
        mix_speech = float(np.sum(mix_power[speech_band]))
        voice_safe = float(np.sum(voice_power[safe_band]))
        mix_safe = float(np.sum(mix_power[safe_band]))
        mix_full = float(np.sum(mix_power[full_band]))

        share_delta = 10.0 * np.log10((mix_speech / mix_full) / (voice_speech / voice_full))
        masking_delta = 10.0 * np.log10((mix_speech / mix_safe) / (voice_speech / voice_safe))

        window_times.append(start / sample_rate)
        speech_share_delta_db.append(float(share_delta))
        speech_masking_db.append(float(masking_delta))

    if not speech_masking_db:
        return {
            "script": "speech_masking",
            "mix": str(mix_path),
            "voiceover": str(voiceover_path),
            "words": str(words_path),
            "duration_seconds": round(duration_seconds, 3),
            "sample_rate": sample_rate,
            "window_seconds": window_seconds,
            "hop_seconds": hop_seconds,
            "threshold": max_mask_run_seconds,
            "masking_threshold_db": masking_threshold_db,
            "pass": True,
            "score": 1.0,
            "voiced_window_count": 0,
            "high_mask_seconds": 0.0,
            "high_mask_fraction": 0.0,
            "longest_mask_run_seconds": 0.0,
            "findings": [],
        }

    masking_array = np.array(speech_masking_db, dtype=np.float32)
    share_array = np.array(speech_share_delta_db, dtype=np.float32)
    time_array = np.array(window_times, dtype=np.float32)
    high_mask = masking_array >= masking_threshold_db

    findings, longest_run, high_mask_seconds = _find_mask_runs(
        high_mask,
        window_times=time_array,
        window_seconds=window_seconds,
        hop_seconds=hop_seconds,
        masking_values_db=masking_array,
        min_run_seconds=min_mask_run_seconds,
        max_run_seconds=max_mask_run_seconds,
    )
    high_mask_fraction = float(np.mean(high_mask)) if len(high_mask) else 0.0
    score = max(0.0, 1.0 - high_mask_fraction)
    passed = True
    if max_mask_run_seconds is not None and longest_run > max_mask_run_seconds:
        passed = False

    return {
        "script": "speech_masking",
        "mix": str(mix_path),
        "voiceover": str(voiceover_path),
        "words": str(words_path),
        "duration_seconds": round(duration_seconds, 3),
        "sample_rate": sample_rate,
        "window_seconds": window_seconds,
        "hop_seconds": hop_seconds,
        "masking_threshold_db": masking_threshold_db,
        "threshold": max_mask_run_seconds,
        "pass": passed,
        "score": round(score, 3),
        "voiced_window_count": int(len(masking_array)),
        "mean_speech_share_delta_db": round(float(np.mean(share_array)), 3),
        "p90_speech_share_delta_db": round(float(np.quantile(share_array, 0.9)), 3),
        "mean_speech_masking_db": round(float(np.mean(masking_array)), 3),
        "p90_speech_masking_db": round(float(np.quantile(masking_array, 0.9)), 3),
        "peak_speech_masking_db": round(float(np.max(masking_array)), 3),
        "high_mask_seconds": round(high_mask_seconds, 3),
        "high_mask_fraction": round(high_mask_fraction, 3),
        "longest_mask_run_seconds": round(longest_run, 3),
        "findings": findings,
    }


def parse_args(argv: list[str] | None = None) -> argparse.Namespace:
    parser = argparse.ArgumentParser(description="Measure speech-band masking in a final mix")
    parser.add_argument("mix", help="Path to the final mixed audio or video")
    parser.add_argument("--voiceover", required=True, help="Path to the clean voiceover stem")
    parser.add_argument("--words", required=True, help="Path to voiceover.words.json")
    parser.add_argument("--sample-rate", type=int, default=16000, help="Analysis sample rate")
    parser.add_argument("--window-seconds", type=float, default=0.5, help="FFT window size in seconds")
    parser.add_argument("--hop-seconds", type=float, default=0.25, help="Window hop size in seconds")
    parser.add_argument("--min-voiced-fraction", type=float, default=0.5, help="Minimum voiced coverage in a window")
    parser.add_argument(
        "--voice-energy-floor-quantile",
        type=float,
        default=0.15,
        help="Ignore the quietest voiced windows below this quantile",
    )
    parser.add_argument("--speech-band-low-hz", type=float, default=300.0, help="Speech band lower bound")
    parser.add_argument("--speech-band-high-hz", type=float, default=3000.0, help="Speech band upper bound")
    parser.add_argument("--safe-band-low-hz", type=float, default=50.0, help="Reference band lower bound")
    parser.add_argument("--safe-band-high-hz", type=float, default=7000.0, help="Reference band upper bound")
    parser.add_argument("--safe-band-gap-low-hz", type=float, default=250.0, help="Reference gap lower bound")
    parser.add_argument("--safe-band-gap-high-hz", type=float, default=4000.0, help="Reference gap upper bound")
    parser.add_argument("--masking-threshold-db", type=float, default=2.0, help="Masking threshold in dB")
    parser.add_argument("--min-mask-run-seconds", type=float, default=1.0, help="Minimum masking run reported")
    parser.add_argument(
        "--max-mask-run-seconds",
        type=float,
        default=None,
        help="Optional max tolerated masking run for pass/fail",
    )
    return parser.parse_args(argv)


def main(argv: list[str] | None = None) -> int:
    args = parse_args(argv)
    try:
        result = analyze_mix(
            Path(args.mix),
            voiceover_path=Path(args.voiceover),
            words_path=Path(args.words),
            sample_rate=args.sample_rate,
            window_seconds=args.window_seconds,
            hop_seconds=args.hop_seconds,
            min_voiced_fraction=args.min_voiced_fraction,
            voice_energy_floor_quantile=args.voice_energy_floor_quantile,
            speech_band_low_hz=args.speech_band_low_hz,
            speech_band_high_hz=args.speech_band_high_hz,
            safe_band_low_hz=args.safe_band_low_hz,
            safe_band_high_hz=args.safe_band_high_hz,
            safe_band_gap_low_hz=args.safe_band_gap_low_hz,
            safe_band_gap_high_hz=args.safe_band_gap_high_hz,
            masking_threshold_db=args.masking_threshold_db,
            min_mask_run_seconds=args.min_mask_run_seconds,
            max_mask_run_seconds=args.max_mask_run_seconds,
        )
    except (FileNotFoundError, RuntimeError, ValueError, subprocess.CalledProcessError) as exc:
        json.dump({"error": str(exc)}, sys.stdout, indent=2)
        sys.stdout.write("\n")
        return 1

    json.dump(result, sys.stdout, indent=2)
    sys.stdout.write("\n")
    return 0 if result["pass"] else 2


if __name__ == "__main__":
    raise SystemExit(main())
