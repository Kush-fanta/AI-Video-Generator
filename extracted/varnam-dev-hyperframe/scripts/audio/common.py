#!/usr/bin/env python3
# ---
# varnam_script: audio.common
# owner: audio
# status: internal
# surface: import-only
# purpose: Shared audio safety and helper functions.
# use_when: Import from audio scripts; do not call as a CLI.
# inputs: CLI args, manifests, env vars, or imports documented by argparse/docstring
# outputs: files, JSON/stdout reports, or process exit code documented by the script
# authority: scripts/README.md; scripts/SCRIPT_MAP.md
# ---
"""Shared helpers for audio primitives."""

from __future__ import annotations

import json
import sys
from pathlib import Path

SCRIPTS_DIR = Path(__file__).resolve().parents[1]
SHARED_DIR = SCRIPTS_DIR / "shared"
if str(SHARED_DIR) not in sys.path:
    sys.path.insert(0, str(SHARED_DIR))

from env_file import get_env, require_env

GEMINI_SAFETY_CATEGORIES = (
    "HARM_CATEGORY_HARASSMENT",
    "HARM_CATEGORY_HATE_SPEECH",
    "HARM_CATEGORY_SEXUALLY_EXPLICIT",
    "HARM_CATEGORY_DANGEROUS_CONTENT",
    "HARM_CATEGORY_CIVIC_INTEGRITY",
)


def fail(msg: str) -> None:
    print(json.dumps({"status": "error", "error": msg}))
    sys.exit(1)


def gemini_safety_threshold_name() -> str:
    threshold_name = (get_env("GEMINI_SAFETY_THRESHOLD", "OFF") or "OFF").strip().upper() or "OFF"
    valid_names = {"BLOCK_LOW_AND_ABOVE", "BLOCK_MEDIUM_AND_ABOVE", "BLOCK_ONLY_HIGH", "BLOCK_NONE", "OFF"}
    if threshold_name not in valid_names:
        fail(
            "Invalid GEMINI_SAFETY_THRESHOLD. "
            "Use one of BLOCK_LOW_AND_ABOVE, BLOCK_MEDIUM_AND_ABOVE, BLOCK_ONLY_HIGH, BLOCK_NONE, OFF."
        )
    return threshold_name


def gemini_safety_settings(types):
    threshold = getattr(types.HarmBlockThreshold, gemini_safety_threshold_name())
    settings = []
    for category_name in GEMINI_SAFETY_CATEGORIES:
        category = getattr(types.HarmCategory, category_name, None)
        if category is None:
            continue
        settings.append(types.SafetySetting(category=category, threshold=threshold))
    return settings
