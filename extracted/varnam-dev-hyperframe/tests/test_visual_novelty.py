"""Integration tests for deterministic visual novelty analysis."""

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


def _make_hard_cut_video(path: Path) -> None:
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
def test_visual_novelty_flags_static_plateau(tmp_path: Path):
    from visual_novelty import analyze_video

    video_path = tmp_path / "static.mp4"
    _run(
        [
            "ffmpeg",
            "-y",
            "-f",
            "lavfi",
            "-i",
            "color=c=black:s=320x240:d=8",
            "-c:v",
            "libx264",
            "-pix_fmt",
            "yuv420p",
            str(video_path),
        ],
        cwd=tmp_path,
    )

    result = analyze_video(video_path, max_plateau_seconds=3.0)

    assert result["pass"] is False
    assert result["longest_plateau_seconds"] >= 4.0
    assert result["findings"]
    assert result["findings"][0]["issue"] == "low visual novelty plateau"


@pytest.mark.skipif(not FFMPEG_AVAILABLE, reason="ffmpeg/ffprobe not installed")
def test_visual_novelty_accepts_hard_cut_video(tmp_path: Path):
    from visual_novelty import analyze_video

    video_path = tmp_path / "cuts.mp4"
    _make_hard_cut_video(video_path)

    result = analyze_video(video_path, max_plateau_seconds=2.0)

    assert result["pass"] is True
    assert result["longest_plateau_seconds"] == pytest.approx(0.0, abs=0.01)
    assert result["findings"] == []


@pytest.mark.skipif(not FFMPEG_AVAILABLE, reason="ffmpeg/ffprobe not installed")
def test_visual_novelty_accepts_continuous_motion(tmp_path: Path):
    from visual_novelty import analyze_video

    video_path = tmp_path / "motion.mp4"
    _run(
        [
            "ffmpeg",
            "-y",
            "-f",
            "lavfi",
            "-i",
            "testsrc2=size=320x240:rate=30:duration=8",
            "-c:v",
            "libx264",
            "-pix_fmt",
            "yuv420p",
            str(video_path),
        ],
        cwd=tmp_path,
    )

    result = analyze_video(video_path, max_plateau_seconds=2.0)

    assert result["pass"] is True
    assert result["longest_plateau_seconds"] == pytest.approx(0.0, abs=0.01)
    assert result["mean_recent_change"] > 0.02
