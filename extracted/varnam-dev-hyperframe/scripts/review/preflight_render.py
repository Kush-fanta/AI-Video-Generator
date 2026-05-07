#!/usr/bin/env python3
# ---
# varnam_script: review.preflight_render
# owner: reviewer
# status: live
# surface: python3 scripts/run.py render:preflight
# purpose: Pre-render timing and hygiene gate.
# use_when: Block renders when timing, audio, lock, or placeholders are invalid.
# inputs: CLI args, manifests, env vars, or imports documented by argparse/docstring
# outputs: files, JSON/stdout reports, or process exit code documented by the script
# authority: scripts/README.md; scripts/SCRIPT_MAP.md
# ---
"""Pre-render wrapper around timing contract validation."""

from __future__ import annotations

import argparse
import json
import sys
from pathlib import Path

from timing_contract import (
    DEFAULT_AUDIO,
    DEFAULT_LOCK,
    DEFAULT_ROOT,
    DEFAULT_STYLES,
    DEFAULT_WORDS,
    run_timing_contract,
)


def run_preflight(
    project_dir: Path,
    *,
    audio_rel: str = DEFAULT_AUDIO,
    words_rel: str = DEFAULT_WORDS,
    styles_rel: str = DEFAULT_STYLES,
    root_rel: str = DEFAULT_ROOT,
    lock_rel: str = DEFAULT_LOCK,
    video_rel: str | None = None,
    require_lock: bool = False,
    write_lock: bool = False,
    max_duration_drift: float = 0.5,
    max_word_audio_drift: float = 0.25,
) -> dict:
    return run_timing_contract(
        project_dir,
        audio_rel=audio_rel,
        words_rel=words_rel,
        styles_rel=styles_rel,
        root_rel=root_rel,
        lock_rel=lock_rel,
        video_rel=video_rel,
        require_lock=require_lock,
        write_lock=write_lock,
        max_duration_drift=max_duration_drift,
        max_word_audio_drift=max_word_audio_drift,
    )


def parse_args(argv: list[str] | None = None) -> argparse.Namespace:
    parser = argparse.ArgumentParser(
        description="Pre-render timing checks for words/audio/runtime timeline and lock parity."
    )
    parser.add_argument("project_dir")
    parser.add_argument("--audio", default=DEFAULT_AUDIO)
    parser.add_argument("--words", default=DEFAULT_WORDS)
    parser.add_argument("--styles", default=DEFAULT_STYLES)
    parser.add_argument("--root", default=DEFAULT_ROOT)
    parser.add_argument("--video", default=None)
    parser.add_argument("--lock", default=DEFAULT_LOCK)
    parser.add_argument("--write-lock", action="store_true")
    parser.add_argument("--require-lock", action="store_true")
    parser.add_argument("--max-duration-drift", type=float, default=0.5)
    parser.add_argument("--max-word-audio-drift", type=float, default=0.25)
    return parser.parse_args(argv)


def main(argv: list[str] | None = None) -> int:
    args = parse_args(argv)
    report = run_preflight(
        Path(args.project_dir),
        audio_rel=args.audio,
        words_rel=args.words,
        styles_rel=args.styles,
        root_rel=args.root,
        lock_rel=args.lock,
        video_rel=args.video,
        require_lock=args.require_lock,
        write_lock=args.write_lock,
        max_duration_drift=args.max_duration_drift,
        max_word_audio_drift=args.max_word_audio_drift,
    )
    json.dump(report, sys.stdout, indent=2)
    sys.stdout.write("\n")
    return 0 if report["ok"] else 1


if __name__ == "__main__":
    raise SystemExit(main())
