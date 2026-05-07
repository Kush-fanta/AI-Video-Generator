"""Integration tests for frame clutter analysis."""

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


def _make_dense_sequence(frames_dir: Path) -> None:
    frames_dir.mkdir(parents=True, exist_ok=True)
    palette = [(34, 34, 34), (214, 72, 72), (71, 125, 242), (238, 190, 72), (74, 180, 111)]
    for idx in range(4):
        image = Image.new("RGB", (320, 240), (246, 244, 238))
        draw = ImageDraw.Draw(image)
        for x in range(0, 320, 24):
            draw.line((x, 0, x, 240), fill=(120, 120, 120), width=1)
        for y in range(0, 240, 18):
            draw.line((0, y, 320, y), fill=(120, 120, 120), width=1)

        for row in range(5):
            for col in range(7):
                left = 10 + col * 43
                top = 10 + row * 43
                color = palette[(row + col + idx) % len(palette)]
                draw.rectangle((left, top, left + 28, top + 18), outline="black", width=2, fill=color)
                draw.rectangle((left, top + 22, left + 28, top + 28), fill=(40, 40, 40))
                draw.rectangle((left, top + 31, left + 22, top + 35), fill=(60, 60, 60))

        for band in range(6):
            top = 12 + band * 38
            draw.rectangle((250, top, 308, top + 8), fill=(32, 32, 32))
            draw.rectangle((250, top + 11, 300, top + 16), fill=(90, 90, 90))
            draw.rectangle((250, top + 19, 292, top + 23), fill=(130, 130, 130))

        image.save(frames_dir / f"frame_{idx:03d}.png")


def _make_sparse_sequence(frames_dir: Path) -> None:
    frames_dir.mkdir(parents=True, exist_ok=True)
    colors = [(230, 88, 70), (62, 112, 224), (58, 160, 102), (212, 146, 40)]
    for idx, color in enumerate(colors):
        image = Image.new("RGB", (320, 240), (246, 244, 238))
        draw = ImageDraw.Draw(image)
        draw.rectangle((80, 52, 240, 188), outline="black", width=4, fill=color)
        draw.rectangle((104, 92, 216, 148), fill=(246, 244, 238))
        draw.rectangle((120, 200, 200, 208), fill=(40, 40, 40))
        image.save(frames_dir / f"frame_{idx:03d}.png")


@pytest.mark.skipif(not FFMPEG_AVAILABLE, reason="ffmpeg/ffprobe not installed")
def test_frame_clutter_flags_dense_frames(tmp_path: Path):
    from frame_clutter import analyze_video

    frames_dir = tmp_path / "dense"
    video_path = tmp_path / "dense.mp4"
    _make_dense_sequence(frames_dir)
    _sequence_to_video(frames_dir, video_path)

    result = analyze_video(
        video_path,
        sample_fps=1.0,
        min_clutter_run_seconds=2.0,
        max_clutter_run_seconds=1.5,
        clutter_score_threshold=0.58,
    )

    assert result["pass"] is False
    assert result["high_clutter_fraction"] > 0.5
    assert result["mean_frame_clutter_score"] > 0.6
    assert result["findings"]
    assert result["findings"][0]["issue"] == "high visual clutter run"


@pytest.mark.skipif(not FFMPEG_AVAILABLE, reason="ffmpeg/ffprobe not installed")
def test_frame_clutter_accepts_sparse_hero_frames(tmp_path: Path):
    from frame_clutter import analyze_video

    frames_dir = tmp_path / "sparse"
    video_path = tmp_path / "sparse.mp4"
    _make_sparse_sequence(frames_dir)
    _sequence_to_video(frames_dir, video_path)

    result = analyze_video(
        video_path,
        sample_fps=1.0,
        min_clutter_run_seconds=2.0,
        max_clutter_run_seconds=1.5,
        clutter_score_threshold=0.58,
    )

    assert result["pass"] is True
    assert result["high_clutter_fraction"] < 0.3
    assert result["mean_frame_clutter_score"] < 0.45
    assert result["findings"] == []
