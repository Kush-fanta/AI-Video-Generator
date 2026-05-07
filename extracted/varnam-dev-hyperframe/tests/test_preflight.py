"""Tests for simplified preflight validation."""

import json
import os
import sys
import tempfile
from pathlib import Path
import pytest

sys.path.insert(0, str(Path(__file__).resolve().parents[1] / "scripts" / "visual"))


@pytest.fixture
def project_dir():
    with tempfile.TemporaryDirectory() as tmpdir:
        os.makedirs(os.path.join(tmpdir, "images", "refs"), exist_ok=True)
        os.makedirs(os.path.join(tmpdir, "images", "beats"), exist_ok=True)
        yield tmpdir


def _write_timeline(project_dir, entries):
    timeline = {
        "timing_mode": "voiceover",
        "audio": "audio/voiceover.mp3",
        "duration": 60.0,
        "entries": entries,
    }
    with open(os.path.join(project_dir, "timeline.json"), "w") as f:
        json.dump(timeline, f)


def _create_file(project_dir, relpath):
    path = os.path.join(project_dir, relpath)
    os.makedirs(os.path.dirname(path), exist_ok=True)
    open(path, "w").close()


def test_preflight_passes_when_all_refs_exist(project_dir):
    from consistency import preflight
    _create_file(project_dir, "images/refs/char-test.png")
    _create_file(project_dir, "images/refs/style-tension.png")
    _write_timeline(project_dir, [
        {
            "id": 1,
            "file": "images/beats/beat_1.png",
            "start": 0.0,
            "end": 5.0,
            "narration": "Test narration.",
            "reference_images": [
                "images/refs/char-test.png",
                "images/refs/style-tension.png",
            ],
        }
    ])
    result = preflight(Path(project_dir))
    assert result["ok"] is True
    assert result["errors"] == []


def test_preflight_fails_when_ref_missing(project_dir):
    from consistency import preflight
    _write_timeline(project_dir, [
        {
            "id": 1,
            "file": "images/beats/beat_1.png",
            "start": 0.0,
            "end": 5.0,
            "narration": "Test narration.",
            "reference_images": [
                "images/refs/char-test.png",
            ],
        }
    ])
    result = preflight(Path(project_dir))
    assert result["ok"] is False
    assert any("char-test.png" in e for e in result["errors"])


def test_preflight_passes_with_no_reference_images(project_dir):
    from consistency import preflight
    _write_timeline(project_dir, [
        {
            "id": 1,
            "file": "images/beats/beat_1.png",
            "start": 0.0,
            "end": 5.0,
            "narration": "Test narration.",
        }
    ])
    result = preflight(Path(project_dir))
    assert result["ok"] is True
