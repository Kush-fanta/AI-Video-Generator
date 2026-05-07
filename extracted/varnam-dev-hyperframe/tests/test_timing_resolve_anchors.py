"""Tests for VO/scene timing anchor resolution."""

from __future__ import annotations

import sys
from pathlib import Path

import pytest

sys.path.insert(0, str(Path(__file__).resolve().parents[1] / "scripts" / "audio"))

import resolve_anchors  # noqa: E402


def test_resolve_vo_anchor_handles_punctuation_and_occurrence() -> None:
    words = [
        {"word": "Warning,", "start": 1.0, "end": 1.2},
        {"word": "warning.", "start": 2.0, "end": 2.2},
    ]
    frame, timestamp = resolve_anchors.resolve_vo_anchor(
        words,
        word="warning",
        occurrence=2,
        fps=30,
        offset_frames=-6,
    )
    assert timestamp == pytest.approx(2.0)
    assert frame == 54


def test_resolve_events_supports_scene_mode() -> None:
    words = [{"word": "alpha", "start": 0.1, "end": 0.3}]
    events = [
        {
            "id": "scene-cut",
            "timing_mode": "scene",
            "scene": {"globalFrame": 420},
        }
    ]
    resolved = resolve_anchors.resolve_events(events, words, fps=30)
    assert resolved[0]["resolved"]["globalFrame"] == 420


def test_resolve_vo_anchor_missing_occurrence_is_fatal() -> None:
    words = [{"word": "warning", "start": 1.0, "end": 1.1}]
    with pytest.raises(ValueError, match="word anchor not found"):
        resolve_anchors.resolve_vo_anchor(
            words,
            word="warning",
            occurrence=2,
            fps=30,
            offset_frames=0,
        )
