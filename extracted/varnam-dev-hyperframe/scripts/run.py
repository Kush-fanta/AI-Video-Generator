#!/usr/bin/env python3
# ---
# varnam_script: run
# owner: shared
# status: live
# surface: python3 scripts/run.py <command> [args...]
# purpose: Stable command router for human and agent script entrypoints.
# use_when: Use this first when a stable command exists.
# inputs: CLI args, manifests, env vars, or imports documented by argparse/docstring
# outputs: files, JSON/stdout reports, or process exit code documented by the script
# authority: scripts/README.md; scripts/SCRIPT_MAP.md
# ---
"""Unified command runner for repo scripts."""

from __future__ import annotations

import subprocess
import sys
from pathlib import Path

SCRIPTS_DIR = Path(__file__).resolve().parent
REPO_ROOT = SCRIPTS_DIR.parent
PROJECT_DIR = SCRIPTS_DIR / "project"
REVIEW_DIR = SCRIPTS_DIR / "review"
VISUAL_DIR = SCRIPTS_DIR / "visual"
AUDIO_DIR = SCRIPTS_DIR / "audio"
TRACE_DIR = SCRIPTS_DIR / "trace"

COMMANDS: dict[str, list[str]] = {
    "project:intake": [sys.executable, str(PROJECT_DIR / "intake.py")],
    "project:scaffold": ["bash", str(PROJECT_DIR / "scaffold.sh")],
    "project:link-public": [sys.executable, str(PROJECT_DIR / "public_link.py")],
    "render:preflight": [sys.executable, str(REVIEW_DIR / "preflight_render.py")],
    "render:postflight": [sys.executable, str(REVIEW_DIR / "postflight_render.py")],
    "review:artifact-report": [sys.executable, str(REVIEW_DIR / "artifact_report.py")],
    "render:validate-manifest": [sys.executable, str(REVIEW_DIR / "validate_render_manifest.py")],
    "visual:image": [sys.executable, str(VISUAL_DIR / "image.py")],
    "visual:video": [sys.executable, str(VISUAL_DIR / "video.py")],
    "visual:analyze": [sys.executable, str(VISUAL_DIR / "analyze_media.py")],
    "audio:voiceover": [sys.executable, str(AUDIO_DIR / "voiceover.py")],
    "audio:music": [sys.executable, str(AUDIO_DIR / "music.py")],
    "audio:sound-design": [sys.executable, str(AUDIO_DIR / "sound_design.py")],
    "audio:lock": [sys.executable, str(AUDIO_DIR / "lock_timing.py")],
    "audio:source": [sys.executable, str(AUDIO_DIR / "source_closed.py")],
    "video:clip": [sys.executable, str(VISUAL_DIR / "video_clip.py")],
    "trace:manifest": [sys.executable, str(TRACE_DIR / "session_manifest.py")],
    "hyperframes:doctor": ["npx", "--yes", "hyperframes", "doctor"],
    "hyperframes:lint": ["npx", "--yes", "hyperframes", "lint"],
    "hyperframes:compositions": ["npx", "--yes", "hyperframes", "compositions"],
    "hyperframes:preview": ["npx", "--yes", "hyperframes", "preview"],
    "hyperframes:render": ["npx", "--yes", "hyperframes", "render"],
    "hyperframes:info": ["npx", "--yes", "hyperframes", "info"],
}

COMMON_COMMANDS = (
    "project:intake",
    "project:scaffold",
    "project:link-public",
    "render:preflight",
    "render:postflight",
    "review:artifact-report",
    "render:validate-manifest",
    "visual:image",
    "visual:video",
    "visual:analyze",
    "video:clip",
    "audio:voiceover",
    "audio:music",
    "audio:sound-design",
    "audio:lock",
    "audio:source",
    "trace:manifest",
    "hyperframes:doctor",
    "hyperframes:lint",
    "hyperframes:compositions",
    "hyperframes:preview",
    "hyperframes:render",
    "hyperframes:info",
)

ALIASES: dict[str, str] = {
    "intake": "project:intake",
    "scaffold": "project:scaffold",
    "preflight": "render:preflight",
    "postflight": "render:postflight",
    "voiceover": "audio:voiceover",
    "music": "audio:music",
    "image": "visual:image",
    "trace-manifest": "trace:manifest",
    "hf-doctor": "hyperframes:doctor",
    "hf-lint": "hyperframes:lint",
    "hf-render": "hyperframes:render",
}


def _print_help() -> None:
    print("Usage: python3 scripts/run.py <command> [args...]")
    print("")
    print("Common commands:")
    for key in COMMON_COMMANDS:
        print(f"  {key}")
    print("")
    print("Aliases:")
    for alias, target in sorted(ALIASES.items()):
        print(f"  {alias:<12} -> {target}")


def main(argv: list[str] | None = None) -> int:
    args = list(sys.argv[1:] if argv is None else argv)
    if not args or args[0] in {"-h", "--help", "help"}:
        _print_help()
        return 0

    requested = args[0].strip()
    command = ALIASES.get(requested, requested)
    passthrough = args[1:]
    base = COMMANDS.get(command)
    if base is None:
        print(f"Unknown command: {requested}", file=sys.stderr)
        _print_help()
        return 2

    proc = subprocess.run(base + passthrough)
    return proc.returncode


if __name__ == "__main__":
    raise SystemExit(main())
