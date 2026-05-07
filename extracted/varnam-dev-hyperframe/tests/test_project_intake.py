"""Tests for the interactive intake runner helpers."""

from __future__ import annotations

import importlib.util
import json
import sys
from pathlib import Path


REPO_ROOT = Path(__file__).resolve().parents[1]
MODULE_PATH = REPO_ROOT / "scripts" / "project" / "intake.py"
SPEC = importlib.util.spec_from_file_location("intake", MODULE_PATH)
assert SPEC and SPEC.loader
intake = importlib.util.module_from_spec(SPEC)
sys.modules[SPEC.name] = intake
SPEC.loader.exec_module(intake)


def test_normalize_slug() -> None:
    assert intake.normalize_slug("  My Test Project!  ") == "my-test-project"


def test_csv_to_bullets_uses_fallback() -> None:
    assert intake.csv_to_bullets("", fallback="- channel default") == "- channel default"


def test_build_intake_text_contains_shell_vars() -> None:
    data = intake.IntakeData(
        slug="test-project",
        channel="nightshift",
        title_direction='A "quoted" title',
        core_message="Core message",
        why_now="Why now",
        anti_goals="- not vague",
        target_viewer="curious adult",
        platform="YouTube",
        runtime="300-360s",
        desired_outcome="viewer retains the thesis",
        format_name="default",
        format_why="- not yet locked",
        hook_contract="- not yet locked",
        movement_contract="- not yet locked",
        ending_contract="- not yet locked",
        narration_stance="channel default",
        visual_proof_modes="- channel default",
        sound_stance="channel default",
        no_go_moves="- channel default",
        key_subjects="- subject one",
        exact_facts="- 1947",
        media_evidence_obligations="- archival proof",
        research_requirements="- verify date chain",
        context_summary="Summary",
        current_task="Current",
        next_task="Next",
    )
    text = intake.build_intake_text(data)
    assert 'SLUG="test-project"' in text
    assert 'CHANNEL="nightshift"' in text
    assert 'TITLE_DIRECTION="A \\"quoted\\" title"' in text


def test_build_summary_mentions_locked_brief() -> None:
    data = intake.IntakeData(
        slug="test-project",
        channel="nightshift",
        title_direction="Test title",
        core_message="Core message",
        why_now="Why now",
        anti_goals="- not vague",
        target_viewer="curious adult",
        platform="YouTube",
        runtime="300-360s",
        desired_outcome="viewer retains the thesis",
        format_name="story",
        format_why="Because argument needs movement",
        hook_contract="Open on the strange fact",
        movement_contract="Escalate each section",
        ending_contract="Land on a hard line",
        narration_stance="channel default",
        visual_proof_modes="- channel default",
        sound_stance="channel default",
        no_go_moves="- channel default",
        key_subjects="- subject one",
        exact_facts="- 1947",
        media_evidence_obligations="- archival proof",
        research_requirements="- verify date chain",
        context_summary="Summary",
        current_task="Current",
        next_task="Next",
    )
    summary = intake.build_summary(data)
    assert "Locked brief" in summary
    assert "- channel: nightshift" in summary
    assert "- format: story" in summary


def test_minimal_supplied_source_json_keeps_missing_user_direction_blank(tmp_path: Path) -> None:
    payload = {
        "channel": "swarajya",
        "working_title": "Beyond The Cabinet",
        "core_message": "Neutral source thesis from the supplied article.",
        "why_now": "current source supplied by user",
    }
    path = tmp_path / "intake.json"
    path.write_text(json.dumps(payload), encoding="utf-8")

    data = intake.load_intake_json(path)

    assert data.slug == "beyond-the-cabinet"
    assert data.anti_goals == "- none locked yet"
    assert data.key_subjects == "- none locked yet"
    assert data.visual_proof_modes == "- channel default"
    assert "core chooses active argument/stance before package lock" in data.research_requirements
