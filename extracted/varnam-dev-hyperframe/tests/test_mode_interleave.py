"""Tests for mode interleave analysis."""

from __future__ import annotations

import sys
from pathlib import Path

import pytest

sys.path.insert(0, str(Path(__file__).resolve().parents[1] / "scripts" / "review" / "benchmarks"))


def test_mode_interleave_parses_timed_storyboard_and_splits_hybrids(tmp_path: Path):
    from mode_interleave import analyze_storyboard

    storyboard = tmp_path / "timed-storyboard.md"
    storyboard.write_text(
        "\n".join(
            [
                "# Timed Storyboard",
                "",
                "| # | Duration | Scene | Mode |",
                "|---|---|---|---|",
                "| 1 | 10s | Open | Text statement |",
                "| 2 | 8s | Data beat | Data hero |",
                "| 3 | 6s | Proof | Archival |",
                "| 4 | 12s | Mechanism | Text hero + diagram |",
                "| 5 | 9s | Geography | Map -> Data timeline |",
            ]
        ),
        encoding="utf-8",
    )

    result = analyze_storyboard(
        storyboard,
        max_mode_run_seconds=15.0,
        min_mode_count=5,
    )

    assert result["pass"] is True
    assert result["effective_mode_count"] == 5
    assert result["segment_count"] == 6
    assert result["mode_seconds"]["text"] == pytest.approx(16.0)
    assert result["mode_seconds"]["diagram"] == pytest.approx(6.0)
    assert result["mode_seconds"]["data_viz"] == pytest.approx(12.5)
    assert result["mode_seconds"]["map"] == pytest.approx(4.5)
    assert result["max_mode_run_seconds"] == pytest.approx(12.0)
    assert result["switch_count"] == 5
    assert result["findings"] == []


def test_mode_interleave_flags_overstayed_mode(tmp_path: Path):
    from mode_interleave import analyze_storyboard

    storyboard = tmp_path / "monotone-storyboard.md"
    storyboard.write_text(
        "\n".join(
            [
                "# Timed Storyboard",
                "",
                "| # | Frames | Duration | Scene | Mode |",
                "|---|---|---|---|---|",
                "| 1 | 0-1200 | 40s | Monologue | Text statement |",
                "| 2 | 1200-1500 | 10s | Number | Data hero |",
            ]
        ),
        encoding="utf-8",
    )

    result = analyze_storyboard(storyboard, max_mode_run_seconds=30.0, min_mode_count=2)

    assert result["pass"] is False
    assert result["max_mode_run_seconds"] == pytest.approx(40.0)
    assert result["findings"]
    assert result["findings"][0]["issue"] == "mode overstayed"
    assert result["findings"][0]["mode"] == "text"


def test_mode_interleave_requires_timed_storyboard_table(tmp_path: Path):
    from mode_interleave import analyze_storyboard

    storyboard = tmp_path / "untimed-storyboard.md"
    storyboard.write_text(
        "\n".join(
            [
                "# Untimed Storyboard",
                "",
                "## Scene 1",
                "- mode: typography",
            ]
        ),
        encoding="utf-8",
    )

    with pytest.raises(ValueError, match="timed storyboard table"):
        analyze_storyboard(storyboard)
