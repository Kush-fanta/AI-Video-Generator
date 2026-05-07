"""Integration tests for sound design mixing."""

from __future__ import annotations

import argparse
import json
import shutil
import subprocess
import sys
from pathlib import Path

import pytest

sys.path.insert(0, str(Path(__file__).resolve().parents[1] / "scripts" / "audio"))


FFMPEG_AVAILABLE = shutil.which("ffmpeg") is not None and shutil.which("ffprobe") is not None


def _run(cmd: list[str], cwd: Path) -> None:
    subprocess.run(cmd, cwd=cwd, check=True, capture_output=True, text=True)


def _probe_duration(path: Path) -> float:
    result = subprocess.run(
        [
            "ffprobe",
            "-v", "error",
            "-show_entries", "format=duration",
            "-of", "default=noprint_wrappers=1:nokey=1",
            str(path),
        ],
        check=True,
        capture_output=True,
        text=True,
    )
    return float(result.stdout.strip())


@pytest.mark.skipif(not FFMPEG_AVAILABLE, reason="ffmpeg/ffprobe not installed")
def test_cmd_mix_trims_audio_only_output_to_manifest_duration(tmp_path: Path):
    from sound_design import cmd_mix

    project_dir = tmp_path / "project"
    audio_dir = project_dir / "audio"
    bgm_dir = audio_dir / "bgm"
    bgm_dir.mkdir(parents=True)

    vo_path = audio_dir / "voiceover.mp3"
    bgm_path = bgm_dir / "score.mp3"
    output_path = audio_dir / "mixed.mp3"
    manifest_path = audio_dir / "mix.json"

    _run(
        [
            "ffmpeg", "-y",
            "-f", "lavfi", "-i", "sine=frequency=660:duration=3",
            "-c:a", "libmp3lame",
            str(vo_path),
        ],
        cwd=project_dir,
    )
    _run(
        [
            "ffmpeg", "-y",
            "-f", "lavfi", "-i", "sine=frequency=220:duration=5",
            "-c:a", "libmp3lame",
            str(bgm_path),
        ],
        cwd=project_dir,
    )

    manifest = {
        "voiceover": "audio/voiceover.mp3",
        "output": "audio/mixed.mp3",
        "duration": 2.0,
        "tracks": [
            {
                "file": "audio/bgm/score.mp3",
                "start": 0.0,
                "end": 5.0,
                "level": "-18dB",
            }
        ],
    }
    manifest_path.write_text(json.dumps(manifest), encoding="utf-8")

    result = cmd_mix(
        argparse.Namespace(
            project_dir=str(project_dir),
            manifest=str(manifest_path),
            verbose=False,
        )
    )

    assert result["status"] == "ok"
    assert result["duration_target"] == pytest.approx(2.0)
    assert result["duration_target_source"] == "manifest.duration"
    assert output_path.exists()

    duration = _probe_duration(output_path)
    assert duration == pytest.approx(2.0, abs=0.15)


@pytest.mark.skipif(not FFMPEG_AVAILABLE, reason="ffmpeg/ffprobe not installed")
def test_cmd_mix_trims_video_output_to_picture_duration(tmp_path: Path):
    from sound_design import cmd_mix

    project_dir = tmp_path / "project"
    audio_dir = project_dir / "audio"
    bgm_dir = audio_dir / "bgm"
    output_dir = project_dir / "output"
    bgm_dir.mkdir(parents=True)
    output_dir.mkdir(parents=True)

    vo_path = audio_dir / "voiceover.mp3"
    bgm_path = bgm_dir / "score.mp3"
    video_path = output_dir / "preview.mp4"
    output_path = output_dir / "preview_with_audio.mp4"
    manifest_path = audio_dir / "mix-video.json"

    _run(
        [
            "ffmpeg", "-y",
            "-f", "lavfi", "-i", "color=c=black:s=320x240:d=2",
            "-c:v", "libx264",
            "-pix_fmt", "yuv420p",
            str(video_path),
        ],
        cwd=project_dir,
    )
    _run(
        [
            "ffmpeg", "-y",
            "-f", "lavfi", "-i", "sine=frequency=660:duration=3",
            "-c:a", "libmp3lame",
            str(vo_path),
        ],
        cwd=project_dir,
    )
    _run(
        [
            "ffmpeg", "-y",
            "-f", "lavfi", "-i", "sine=frequency=220:duration=5",
            "-c:a", "libmp3lame",
            str(bgm_path),
        ],
        cwd=project_dir,
    )

    manifest = {
        "video": "output/preview.mp4",
        "voiceover": "audio/voiceover.mp3",
        "output": "output/preview_with_audio.mp4",
        "tracks": [
            {
                "file": "audio/bgm/score.mp3",
                "start": 0.0,
                "end": 5.0,
                "level": "-18dB",
            }
        ],
    }
    manifest_path.write_text(json.dumps(manifest), encoding="utf-8")

    result = cmd_mix(
        argparse.Namespace(
            project_dir=str(project_dir),
            manifest=str(manifest_path),
            verbose=False,
        )
    )

    assert result["status"] == "ok"
    assert result["duration_target_source"] == "video"
    assert output_path.exists()

    duration = _probe_duration(output_path)
    assert duration == pytest.approx(2.0, abs=0.15)
