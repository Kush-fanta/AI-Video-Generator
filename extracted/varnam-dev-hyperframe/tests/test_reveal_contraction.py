"""Integration tests for accompaniment contraction at reveal markers."""

from __future__ import annotations

import shutil
import sys
from pathlib import Path

import pytest

sys.path.insert(0, str(Path(__file__).resolve().parents[1] / "scripts" / "review" / "benchmarks"))


FFMPEG_AVAILABLE = shutil.which("ffmpeg") is not None and shutil.which("ffprobe") is not None


@pytest.mark.skipif(not FFMPEG_AVAILABLE, reason="ffmpeg/ffprobe not installed")
def test_reveal_contraction_separates_real_mix_from_no_drop_failure_fixture():
    from reveal_contraction import analyze_mix

    repo_root = Path(__file__).resolve().parents[1]
    fixture_dir = repo_root / "benchmarks" / "signal-processing" / "fixtures" / "audio"

    voiceover_path = fixture_dir / "bengal-fall-75-105-voiceover.mp3"
    words_path = fixture_dir / "bengal-fall-75-105.words.json"
    markers_path = fixture_dir / "bengal-fall-75-105.reveals.json"
    healthy_mix_path = fixture_dir / "bengal-fall-75-105-mix.mp3"
    failure_mix_path = fixture_dir / "bengal-fall-75-105-synthetic-no-drop.mp3"

    healthy = analyze_mix(
        healthy_mix_path,
        voiceover_path=voiceover_path,
        words_path=words_path,
        markers_path=markers_path,
        min_reveal_contraction_db=2.5,
    )
    failure = analyze_mix(
        failure_mix_path,
        voiceover_path=voiceover_path,
        words_path=words_path,
        markers_path=markers_path,
        min_reveal_contraction_db=2.5,
    )

    assert healthy["pass"] is True
    assert healthy["supported_reveal_fraction"] == 1.0
    assert healthy["weakest_reveal_contraction_db"] >= 3.0
    assert healthy["findings"] == []

    assert failure["pass"] is False
    assert failure["supported_reveal_fraction"] == 0.0
    assert failure["weakest_reveal_contraction_db"] < 1.0
    assert len(failure["findings"]) == 2
