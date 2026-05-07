"""Tests for post-render validation wrapper."""

from __future__ import annotations

import json
import sys
from pathlib import Path

sys.path.insert(0, str(Path(__file__).resolve().parents[1] / "scripts" / "review"))

import postflight_render  # noqa: E402


def _seed_project(tmp_path: Path) -> tuple[Path, Path, Path]:
    repo_root = tmp_path / "repo"
    project = repo_root / "projects" / "demo"
    (project / "audio").mkdir(parents=True)
    (project / "audio" / "voiceover.mp3").write_bytes(b"fake")
    (project / "audio" / "voiceover.words.json").write_text(
        json.dumps([{"word": "one", "start": 0.0, "end": 0.5}]),
        encoding="utf-8",
    )
    (project / "task-config.md").write_text("**Channel:** Swarajya\n", encoding="utf-8")

    channel_dir = repo_root / "channels" / "swarajya"
    channel_dir.mkdir(parents=True)
    (channel_dir / "config.md").write_text(
        'cut_rate_avg: "8-9 cpm"\nhold_max_sec: 8\n',
        encoding="utf-8",
    )

    video_path = repo_root / "out" / "demo-v1.mp4"
    video_path.parent.mkdir(parents=True, exist_ok=True)
    video_path.write_bytes(b"fake")
    return repo_root, project, video_path


def test_postflight_uses_channel_defaults(tmp_path: Path, monkeypatch) -> None:
    repo_root, project, video_path = _seed_project(tmp_path)
    monkeypatch.setattr(postflight_render, "REPO_ROOT", repo_root)

    seen: dict[str, dict] = {}

    monkeypatch.setattr(
        postflight_render,
        "run_timing_contract",
        lambda *args, **kwargs: {"ok": True, "errors": [], "warnings": []},
    )
    monkeypatch.setattr(
        postflight_render,
        "analyze_frame_integrity",
        lambda *args, **kwargs: {
            "placeholder_frame_count": 0,
            "blank_frame_count": 0,
            "solid_frame_count": 0,
            "frozen_run_count": 0,
        },
    )

    def fake_cut_rate(*args, **kwargs):
        seen["cut_rate"] = kwargs
        return {"pass": True, "cuts_per_minute": 9.0, "longest_hold_seconds": 7.0}

    def fake_visual_novelty(*args, **kwargs):
        seen["visual_novelty"] = kwargs
        return {"pass": True, "longest_plateau_seconds": 6.0}

    def fake_speech_masking(*args, **kwargs):
        seen["speech_masking"] = kwargs
        return {"pass": True, "longest_mask_run_seconds": 0.5}

    monkeypatch.setattr(postflight_render, "analyze_cut_rate", fake_cut_rate)
    monkeypatch.setattr(postflight_render, "analyze_visual_novelty", fake_visual_novelty)
    monkeypatch.setattr(postflight_render, "analyze_speech_masking", fake_speech_masking)

    report = postflight_render.run_postflight(project, video_arg=str(video_path))
    assert report["ok"] is True
    assert report["status"] == "passed"
    assert report["complete"] is True
    assert "timing_contract" in report["checks"]
    assert report["check_results"]["timing_contract"]["status"] == "passed"
    assert report["thresholds"]["min_cuts_per_minute"] == 8.0
    assert report["thresholds"]["max_hold_seconds"] == 8.0
    assert report["thresholds"]["max_plateau_seconds"] == 8.0
    assert seen["cut_rate"]["min_cuts_per_minute"] == 8.0
    assert seen["visual_novelty"]["max_plateau_seconds"] == 8.0
    assert seen["speech_masking"]["max_mask_run_seconds"] == 1.5


def test_postflight_reports_failures(tmp_path: Path, monkeypatch) -> None:
    repo_root, project, video_path = _seed_project(tmp_path)
    monkeypatch.setattr(postflight_render, "REPO_ROOT", repo_root)

    monkeypatch.setattr(
        postflight_render,
        "run_timing_contract",
        lambda *args, **kwargs: {"ok": True, "errors": [], "warnings": []},
    )
    monkeypatch.setattr(
        postflight_render,
        "analyze_frame_integrity",
        lambda *args, **kwargs: {
            "placeholder_frame_count": 2,
            "blank_frame_count": 1,
            "solid_frame_count": 0,
            "frozen_run_count": 0,
        },
    )
    monkeypatch.setattr(
        postflight_render,
        "analyze_cut_rate",
        lambda *args, **kwargs: {
            "pass": False,
            "cuts_per_minute": 4.0,
            "longest_hold_seconds": 12.0,
        },
    )
    monkeypatch.setattr(
        postflight_render,
        "analyze_visual_novelty",
        lambda *args, **kwargs: {"pass": False, "longest_plateau_seconds": 11.0},
    )
    monkeypatch.setattr(
        postflight_render,
        "analyze_speech_masking",
        lambda *args, **kwargs: {"pass": False, "longest_mask_run_seconds": 2.5},
    )

    report = postflight_render.run_postflight(
        project,
        video_arg=str(video_path),
        min_cuts_per_minute=8.0,
        max_hold_seconds=8.0,
        max_plateau_seconds=8.0,
        max_mask_run_seconds=1.5,
    )
    assert report["ok"] is False
    assert report["status"] == "failed"
    assert report["complete"] is True
    assert report["check_results"]["frame_integrity"]["status"] == "failed"
    assert report["check_results"]["cut_rate"]["status"] == "failed"
    assert report["check_results"]["visual_novelty"]["status"] == "failed"
    assert report["check_results"]["speech_masking"]["status"] == "failed"
    assert any("placeholder frames detected" in error for error in report["errors"])
    assert any("cut_rate: below channel floor" in error for error in report["errors"])
    assert any("visual_novelty: plateau exceeds max" in error for error in report["errors"])
    assert any("speech_masking: longest mask run exceeds max" in error for error in report["errors"])


def test_postflight_marks_skipped_required_checks_as_partial(
    tmp_path: Path, monkeypatch
) -> None:
    repo_root, project, video_path = _seed_project(tmp_path)
    monkeypatch.setattr(postflight_render, "REPO_ROOT", repo_root)

    (project / "audio" / "voiceover.mp3").unlink()
    (project / "audio" / "voiceover.words.json").unlink()

    monkeypatch.setattr(
        postflight_render,
        "analyze_frame_integrity",
        lambda *args, **kwargs: {
            "placeholder_frame_count": 0,
            "blank_frame_count": 0,
            "solid_frame_count": 0,
            "frozen_run_count": 0,
        },
    )
    monkeypatch.setattr(
        postflight_render,
        "analyze_cut_rate",
        lambda *args, **kwargs: {
            "pass": True,
            "cuts_per_minute": 9.0,
            "longest_hold_seconds": 3.0,
        },
    )
    monkeypatch.setattr(
        postflight_render,
        "analyze_visual_novelty",
        lambda *args, **kwargs: {"pass": True, "longest_plateau_seconds": 2.0},
    )

    report = postflight_render.run_postflight(project, video_arg=str(video_path))
    assert report["ok"] is False
    assert report["status"] == "partial"
    assert report["complete"] is False
    assert sorted(report["skipped_required_checks"]) == ["speech_masking", "timing_contract"]
    assert report["check_results"]["timing_contract"]["status"] == "skipped"
    assert report["check_results"]["speech_masking"]["status"] == "skipped"
    assert report["errors"] == []
    assert any("timing_contract skipped" in warning for warning in report["warnings"])
    assert any("speech_masking skipped" in warning for warning in report["warnings"])
