"""Integration tests for deterministic cut-rate analysis."""

from __future__ import annotations

import shutil
import subprocess
import sys
from pathlib import Path

import pytest

sys.path.insert(0, str(Path(__file__).resolve().parents[1] / "scripts" / "review" / "benchmarks"))


FFMPEG_AVAILABLE = shutil.which("ffmpeg") is not None and shutil.which("ffprobe") is not None


def _run(cmd: list[str], cwd: Path) -> None:
    subprocess.run(cmd, cwd=cwd, check=True, capture_output=True, text=True)


def _make_three_cut_video(path: Path) -> None:
    _run(
        [
            "ffmpeg",
            "-y",
            "-f",
            "lavfi",
            "-i",
            "color=c=red:s=320x240:d=1",
            "-f",
            "lavfi",
            "-i",
            "color=c=blue:s=320x240:d=1",
            "-f",
            "lavfi",
            "-i",
            "color=c=green:s=320x240:d=1",
            "-filter_complex",
            "[0:v][1:v][2:v]concat=n=3:v=1:a=0,format=yuv420p[v]",
            "-map",
            "[v]",
            str(path),
        ],
        cwd=path.parent,
    )


@pytest.mark.skipif(not FFMPEG_AVAILABLE, reason="ffmpeg/ffprobe not installed")
def test_detect_cut_timestamps_finds_hard_cuts(tmp_path: Path):
    from cut_rate import detect_cut_timestamps

    video_path = tmp_path / "cuts.mp4"
    _make_three_cut_video(video_path)

    timestamps = detect_cut_timestamps(video_path, scene_threshold=0.2)

    assert len(timestamps) == 2
    assert timestamps[0] == pytest.approx(1.0, abs=0.15)
    assert timestamps[1] == pytest.approx(2.0, abs=0.15)


@pytest.mark.skipif(not FFMPEG_AVAILABLE, reason="ffmpeg/ffprobe not installed")
def test_analyze_video_fails_when_cut_rate_is_below_floor(tmp_path: Path):
    from cut_rate import analyze_video

    video_path = tmp_path / "static.mp4"
    _run(
        [
            "ffmpeg",
            "-y",
            "-f",
            "lavfi",
            "-i",
            "color=c=black:s=320x240:d=3",
            "-c:v",
            "libx264",
            "-pix_fmt",
            "yuv420p",
            str(video_path),
        ],
        cwd=tmp_path,
    )

    result = analyze_video(video_path, min_cuts_per_minute=5.0)

    assert result["pass"] is False
    assert result["cut_count"] == 0
    assert result["cuts_per_minute"] == pytest.approx(0.0, abs=0.01)
    assert result["findings"]
    assert "below minimum floor" in result["findings"][0]["issue"]
