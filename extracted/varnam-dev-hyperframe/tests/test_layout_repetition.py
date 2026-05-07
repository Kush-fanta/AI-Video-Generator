"""Integration tests for layout repetition analysis."""

from __future__ import annotations

import shutil
import subprocess
import sys
from pathlib import Path

import pytest
from PIL import Image, ImageDraw

sys.path.insert(0, str(Path(__file__).resolve().parents[1] / "scripts" / "review" / "benchmarks"))


FFMPEG_AVAILABLE = shutil.which("ffmpeg") is not None and shutil.which("ffprobe") is not None


def _run(cmd: list[str], cwd: Path) -> None:
    subprocess.run(cmd, cwd=cwd, check=True, capture_output=True, text=True)


def _make_same_layout_sequence(frames_dir: Path) -> None:
    frames_dir.mkdir(parents=True, exist_ok=True)
    colors = [(180, 40, 40), (40, 120, 220), (40, 180, 90), (180, 140, 30)]
    for idx, color in enumerate(colors):
        image = Image.new("RGB", (320, 240), "white")
        draw = ImageDraw.Draw(image)
        draw.rectangle((20, 20, 120, 220), outline="black", width=4, fill=color)
        draw.rectangle((150, 30, 300, 90), outline="black", width=4, fill=(240, 240, 240))
        draw.rectangle((150, 110, 300, 210), outline="black", width=4, fill=(220, 220, 220))
        draw.line((150, 100, 300, 100), fill="black", width=4)
        image.save(frames_dir / f"frame_{idx:03d}.png")


def _make_different_layout_sequence(frames_dir: Path) -> None:
    frames_dir.mkdir(parents=True, exist_ok=True)
    for idx in range(4):
        image = Image.new("RGB", (320, 240), "white")
        draw = ImageDraw.Draw(image)
        if idx == 0:
            draw.rectangle((20, 20, 300, 110), outline="black", width=4)
        elif idx == 1:
            draw.rectangle((20, 20, 140, 220), outline="black", width=4)
            draw.rectangle((180, 20, 300, 220), outline="black", width=4)
        elif idx == 2:
            draw.ellipse((60, 40, 260, 200), outline="black", width=6)
        else:
            draw.polygon([(160, 20), (300, 220), (20, 220)], outline="black", width=6)
        image.save(frames_dir / f"frame_{idx:03d}.png")


def _sequence_to_video(frames_dir: Path, video_path: Path) -> None:
    _run(
        [
            "ffmpeg",
            "-y",
            "-framerate",
            "1",
            "-i",
            str(frames_dir / "frame_%03d.png"),
            "-c:v",
            "libx264",
            "-pix_fmt",
            "yuv420p",
            str(video_path),
        ],
        cwd=video_path.parent,
    )


@pytest.mark.skipif(not FFMPEG_AVAILABLE, reason="ffmpeg/ffprobe not installed")
def test_layout_repetition_flags_same_layout_with_content_swaps(tmp_path: Path):
    from layout_repetition import analyze_video

    frames_dir = tmp_path / "same-layout"
    video_path = tmp_path / "same-layout.mp4"
    _make_same_layout_sequence(frames_dir)
    _sequence_to_video(frames_dir, video_path)

    result = analyze_video(
        video_path,
        sample_fps=1.0,
        lookback_seconds=2.0,
        min_plateau_seconds=2.0,
        max_plateau_seconds=1.5,
    )

    assert result["pass"] is False
    assert result["high_repetition_fraction"] > 0.4
    assert result["findings"]
    assert result["findings"][0]["issue"] == "repeated layout plateau"


@pytest.mark.skipif(not FFMPEG_AVAILABLE, reason="ffmpeg/ffprobe not installed")
def test_layout_repetition_accepts_different_layouts(tmp_path: Path):
    from layout_repetition import analyze_video

    frames_dir = tmp_path / "different-layout"
    video_path = tmp_path / "different-layout.mp4"
    _make_different_layout_sequence(frames_dir)
    _sequence_to_video(frames_dir, video_path)

    result = analyze_video(
        video_path,
        sample_fps=1.0,
        lookback_seconds=2.0,
        min_plateau_seconds=2.0,
        max_plateau_seconds=1.5,
    )

    assert result["pass"] is True
    assert result["high_repetition_fraction"] < 0.3
    assert result["findings"] == []
