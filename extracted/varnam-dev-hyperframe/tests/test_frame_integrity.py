"""Integration tests for deterministic frame-integrity analysis."""

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


def _make_blank_video(path: Path) -> None:
    _run(
        [
            "ffmpeg",
            "-y",
            "-f",
            "lavfi",
            "-i",
            "color=c=black:s=320x240:d=4",
            "-c:v",
            "libx264",
            "-pix_fmt",
            "yuv420p",
            str(path),
        ],
        cwd=path.parent,
    )


def _make_solid_color_video(path: Path) -> None:
    _run(
        [
            "ffmpeg",
            "-y",
            "-f",
            "lavfi",
            "-i",
            "color=c=blue:s=320x240:d=4",
            "-c:v",
            "libx264",
            "-pix_fmt",
            "yuv420p",
            str(path),
        ],
        cwd=path.parent,
    )


def _make_magenta_placeholder_video(path: Path) -> None:
    _run(
        [
            "ffmpeg",
            "-y",
            "-f",
            "lavfi",
            "-i",
            "color=c=0xFF00FF:s=320x240:d=4",
            "-c:v",
            "libx264",
            "-pix_fmt",
            "yuv420p",
            str(path),
        ],
        cwd=path.parent,
    )


def _make_motion_video(path: Path) -> None:
    _run(
        [
            "ffmpeg",
            "-y",
            "-f",
            "lavfi",
            "-i",
            "testsrc2=size=320x240:rate=30:duration=4",
            "-c:v",
            "libx264",
            "-pix_fmt",
            "yuv420p",
            str(path),
        ],
        cwd=path.parent,
    )


@pytest.mark.skipif(not FFMPEG_AVAILABLE, reason="ffmpeg/ffprobe not installed")
def test_frame_integrity_flags_blank_render(tmp_path: Path):
    from frame_integrity import analyze_video

    video_path = tmp_path / "blank.mp4"
    _make_blank_video(video_path)

    result = analyze_video(video_path)

    assert result["blank_frame_count"] > 0
    assert result["frozen_run_count"] > 0


@pytest.mark.skipif(not FFMPEG_AVAILABLE, reason="ffmpeg/ffprobe not installed")
def test_frame_integrity_flags_solid_color_render(tmp_path: Path):
    from frame_integrity import analyze_video

    video_path = tmp_path / "solid.mp4"
    _make_solid_color_video(video_path)

    result = analyze_video(video_path)

    assert result["solid_frame_count"] > 0


@pytest.mark.skipif(not FFMPEG_AVAILABLE, reason="ffmpeg/ffprobe not installed")
def test_frame_integrity_flags_magenta_placeholder(tmp_path: Path):
    from frame_integrity import analyze_video

    video_path = tmp_path / "magenta.mp4"
    _make_magenta_placeholder_video(video_path)

    result = analyze_video(video_path)

    assert result["placeholder_frame_count"] > 0


@pytest.mark.skipif(not FFMPEG_AVAILABLE, reason="ffmpeg/ffprobe not installed")
def test_frame_integrity_emits_clean_evidence_for_motion_render(tmp_path: Path):
    from frame_integrity import analyze_video

    video_path = tmp_path / "motion.mp4"
    _make_motion_video(video_path)

    result = analyze_video(video_path)

    assert result["blank_frame_count"] == 0
    assert result["solid_frame_count"] == 0
    assert result["placeholder_frame_count"] == 0
    assert result["frozen_run_count"] == 0
    assert result["findings"] == []
