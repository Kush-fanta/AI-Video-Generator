#!/usr/bin/env python3
# ---
# varnam_script: audio.lock_timing
# owner: audio
# status: live
# surface: python3 scripts/run.py audio:lock
# purpose: Timing lock writer for approved VO artifacts.
# use_when: Refresh audio/timing.lock.json before render gates.
# inputs: CLI args, manifests, env vars, or imports documented by argparse/docstring
# outputs: files, JSON/stdout reports, or process exit code documented by the script
# authority: scripts/README.md; scripts/SCRIPT_MAP.md
# ---
"""Create or refresh timing lock from approved VO artifacts."""

from __future__ import annotations

import argparse
import json
import sys
from pathlib import Path


REVIEW_DIR = Path(__file__).resolve().parents[1] / "review"
if str(REVIEW_DIR) not in sys.path:
    sys.path.insert(0, str(REVIEW_DIR))

from timing_contract import run_timing_contract  # noqa: E402


def parse_args(argv: list[str] | None = None) -> argparse.Namespace:
    parser = argparse.ArgumentParser(
        description="Write audio/timing.lock.json after validating VO artifacts against the runtime timeline."
    )
    parser.add_argument("project_dir")
    parser.add_argument("--audio", default="audio/voiceover.mp3")
    parser.add_argument("--words", default="audio/voiceover.words.json")
    parser.add_argument(
        "--timeline",
        "--styles",
        dest="styles",
        default="build/timeline.lock.json",
        help="Runtime timeline authority file. JSON timeline locks are preferred; TS timing files are accepted for migration.",
    )
    parser.add_argument("--lock", default="audio/timing.lock.json")
    parser.add_argument("--max-duration-drift", type=float, default=0.5)
    parser.add_argument("--max-word-audio-drift", type=float, default=0.25)
    return parser.parse_args(argv)


def main(argv: list[str] | None = None) -> int:
    args = parse_args(argv)
    report = run_timing_contract(
        Path(args.project_dir),
        audio_rel=args.audio,
        words_rel=args.words,
        styles_rel=args.styles,
        lock_rel=args.lock,
        write_lock=True,
        require_lock=False,
        max_duration_drift=args.max_duration_drift,
        max_word_audio_drift=args.max_word_audio_drift,
    )
    json.dump(report, sys.stdout, indent=2)
    sys.stdout.write("\n")
    return 0 if report["ok"] else 1


if __name__ == "__main__":
    raise SystemExit(main())
