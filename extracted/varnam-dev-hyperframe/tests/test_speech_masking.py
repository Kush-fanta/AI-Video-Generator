"""Integration tests for speech-band masking analysis."""

from __future__ import annotations

import json
import shutil
import subprocess
import sys
from pathlib import Path

import pytest

sys.path.insert(0, str(Path(__file__).resolve().parents[1] / "scripts" / "review" / "benchmarks"))


FFMPEG_AVAILABLE = shutil.which("ffmpeg") is not None and shutil.which("ffprobe") is not None


def _run(cmd: list[str], cwd: Path) -> None:
    subprocess.run(cmd, cwd=cwd, check=True, capture_output=True, text=True)


@pytest.mark.skipif(not FFMPEG_AVAILABLE, reason="ffmpeg/ffprobe not installed")
def test_speech_masking_separates_clean_mix_from_midband_masking(tmp_path: Path):
    from speech_masking import analyze_mix

    project_dir = tmp_path / "project"
    audio_dir = project_dir / "audio"
    audio_dir.mkdir(parents=True)

    voiceover_path = audio_dir / "voiceover.wav"
    clean_mix_path = audio_dir / "clean.wav"
    masked_mix_path = audio_dir / "masked.wav"
    words_path = audio_dir / "voiceover.words.json"

    _run(
        [
            "ffmpeg",
            "-y",
            "-f",
            "lavfi",
            "-i",
            "anoisesrc=color=pink:duration=4:sample_rate=44100",
            "-filter_complex",
            "highpass=f=120,lowpass=f=5000,volume=0.6",
            "-c:a",
            "pcm_s16le",
            str(voiceover_path),
        ],
        cwd=project_dir,
    )
    _run(
        [
            "ffmpeg",
            "-y",
            "-i",
            str(voiceover_path),
            "-f",
            "lavfi",
            "-i",
            "sine=frequency=90:duration=4",
            "-filter_complex",
            "[1:a]volume=0.18[bass];[0:a][bass]amix=inputs=2:weights=1 1",
            "-c:a",
            "pcm_s16le",
            str(clean_mix_path),
        ],
        cwd=project_dir,
    )
    _run(
        [
            "ffmpeg",
            "-y",
            "-i",
            str(voiceover_path),
            "-f",
            "lavfi",
            "-i",
            "anoisesrc=color=pink:duration=4:sample_rate=44100",
            "-filter_complex",
            "[1:a]highpass=f=500,lowpass=f=2200,volume=0.7[mask];[0:a][mask]amix=inputs=2:weights=1 1",
            "-c:a",
            "pcm_s16le",
            str(masked_mix_path),
        ],
        cwd=project_dir,
    )

    words = [
        {"word": "alpha", "start": 0.4, "end": 1.6},
        {"word": "beta", "start": 1.9, "end": 3.3},
    ]
    words_path.write_text(json.dumps(words), encoding="utf-8")

    clean = analyze_mix(
        clean_mix_path,
        voiceover_path=voiceover_path,
        words_path=words_path,
        masking_threshold_db=2.0,
        min_mask_run_seconds=0.5,
        max_mask_run_seconds=0.75,
    )
    masked = analyze_mix(
        masked_mix_path,
        voiceover_path=voiceover_path,
        words_path=words_path,
        masking_threshold_db=2.0,
        min_mask_run_seconds=0.5,
        max_mask_run_seconds=0.75,
    )

    assert clean["pass"] is True
    assert clean["p90_speech_masking_db"] < 0.5
    assert clean["high_mask_fraction"] == 0.0
    assert clean["findings"] == []

    assert masked["pass"] is False
    assert masked["p90_speech_masking_db"] > 2.3
    assert masked["high_mask_fraction"] >= 0.85
    assert masked["longest_mask_run_seconds"] >= 1.5
    assert masked["findings"]
