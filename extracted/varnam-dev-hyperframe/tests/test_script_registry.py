"""Tests for script registry governance helpers."""

from __future__ import annotations

import sys
from pathlib import Path

sys.path.insert(0, str(Path(__file__).resolve().parents[1] / "scripts" / "review"))

import script_registry  # noqa: E402


def test_hook_references_ignore_self_references(tmp_path: Path, monkeypatch) -> None:
    repo = tmp_path / "repo"
    hooks_dir = repo / "scripts" / "hooks"
    hooks_dir.mkdir(parents=True)
    settings = repo / ".claude" / "settings.json"
    settings.parent.mkdir(parents=True)
    settings.write_text("{}", encoding="utf-8")

    hook = hooks_dir / "self_hook.py"
    hook.write_text(
        '"""Usage: python3 scripts/hooks/self_hook.py; basename self_hook.py."""\n',
        encoding="utf-8",
    )

    monkeypatch.setattr(script_registry, "REPO_ROOT", repo)
    monkeypatch.setattr(script_registry, "SCRIPTS_DIR", repo / "scripts")
    monkeypatch.setattr(script_registry, "SETTINGS_PATH", settings)

    assert "scripts/hooks/self_hook.py" not in script_registry.hook_references()


def test_hook_references_include_other_hook_references(tmp_path: Path, monkeypatch) -> None:
    repo = tmp_path / "repo"
    hooks_dir = repo / "scripts" / "hooks"
    hooks_dir.mkdir(parents=True)
    settings = repo / ".claude" / "settings.json"
    settings.parent.mkdir(parents=True)
    settings.write_text("{}", encoding="utf-8")

    caller = hooks_dir / "caller.py"
    target = hooks_dir / "target.py"
    caller.write_text('"""Calls target.py."""\n', encoding="utf-8")
    target.write_text('"""Target hook."""\n', encoding="utf-8")

    monkeypatch.setattr(script_registry, "REPO_ROOT", repo)
    monkeypatch.setattr(script_registry, "SCRIPTS_DIR", repo / "scripts")
    monkeypatch.setattr(script_registry, "SETTINGS_PATH", settings)

    assert "scripts/hooks/target.py" in script_registry.hook_references()


def test_agent_contract_validation_rejects_stale_paths(tmp_path: Path, monkeypatch) -> None:
    repo = tmp_path / "repo"
    agents = repo / ".claude" / "agents"
    agents.mkdir(parents=True)
    agent = agents / "visual.md"
    agent.write_text("Use projects/<slug>/assets for generated files.\n", encoding="utf-8")

    monkeypatch.setattr(script_registry, "REPO_ROOT", repo)
    monkeypatch.setattr(script_registry, "AGENTS_DIR", agents)
    monkeypatch.setattr(script_registry, "AGENT_REQUIRED_PATHS", {})
    monkeypatch.setattr(script_registry, "AGENT_CONTRACT_FILES", (agents,))

    failures = script_registry.validate_agent_contracts()

    assert any("projects/<slug>/assets" in failure for failure in failures)
