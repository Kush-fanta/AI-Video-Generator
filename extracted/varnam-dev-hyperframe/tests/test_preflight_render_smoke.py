"""Read-only smoke checks for project preflight on real artifacts."""

from __future__ import annotations

import shutil
import sys
from pathlib import Path

import pytest

sys.path.insert(0, str(Path(__file__).resolve().parents[1] / "scripts" / "review"))

import preflight_render  # noqa: E402


FFPROBE_AVAILABLE = shutil.which("ffprobe") is not None


@pytest.mark.skipif(not FFPROBE_AVAILABLE, reason="ffprobe not installed")
@pytest.mark.parametrize(
    "project_rel,video_rel",
    [
        ("projects/bengal-curve", "output/bengal-curve-v6.mp4"),
        ("projects/gcc-v2", "output/preview_v2.mp4"),
        ("projects/pfbr", None),
    ],
)
def test_preflight_smoke_on_existing_projects(project_rel: str, video_rel: str | None) -> None:
    repo_root = Path(__file__).resolve().parents[1]
    project = repo_root / project_rel
    if not project.exists():
        pytest.skip(f"project missing: {project}")

    video_arg = None
    if video_rel:
        video_path = project / video_rel
        video_arg = video_rel if video_path.exists() else None

    report = preflight_render.run_preflight(
        project,
        video_rel=video_arg,
        require_lock=False,
        write_lock=False,
        max_duration_drift=10.0,
        max_word_audio_drift=1.0,
    )
    assert report["ok"] is True, report["errors"]
