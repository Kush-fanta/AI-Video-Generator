#!/usr/bin/env python3
# ---
# varnam_script: shared.env_file
# owner: shared
# status: internal
# surface: import-only
# purpose: Read repo-local .env values without relying on exported shell state.
# use_when: Import from scripts that need provider keys or local runtime knobs.
# inputs: Repo-root .env file.
# outputs: String values returned to callers.
# authority: scripts/README.md; scripts/SCRIPT_MAP.md
# ---
"""Repo-local .env lookup for provider credentials and runtime knobs."""

from __future__ import annotations

from pathlib import Path

REPO_ROOT = Path(__file__).resolve().parents[2]
REPO_ENV_PATH = REPO_ROOT / ".env"


def read_env_file() -> dict[str, str]:
    if not REPO_ENV_PATH.exists():
        return {}

    values: dict[str, str] = {}
    for raw_line in REPO_ENV_PATH.read_text(encoding="utf-8").splitlines():
        line = raw_line.strip()
        if not line or line.startswith("#") or "=" not in line:
            continue
        if line.startswith("export "):
            line = line.removeprefix("export ").strip()
        key, value = line.split("=", 1)
        key = key.strip()
        if key:
            values[key] = value.strip().strip("\"'")
    return values


def get_env(name: str, default: str | None = None) -> str | None:
    value = read_env_file().get(name)
    return value if value not in {None, ""} else default


def require_env(name: str, help_text: str | None = None) -> str:
    value = get_env(name)
    if value:
        return value
    raise RuntimeError(help_text or f"{name} not set. Add it to repo .env.")
