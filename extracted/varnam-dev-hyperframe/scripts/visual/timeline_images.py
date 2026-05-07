#!/usr/bin/env python3
# ---
# varnam_script: visual.timeline_images
# owner: visual
# status: live
# surface: direct-only
# purpose: Project timeline image pass.
# use_when: Turn project timeline entries into image generation jobs.
# inputs: CLI args, manifests, env vars, or imports documented by argparse/docstring
# outputs: files, JSON/stdout reports, or process exit code documented by the script
# authority: scripts/README.md; scripts/SCRIPT_MAP.md
# ---
"""Run image generation for a project's timeline.json in one pass."""

from __future__ import annotations

import argparse
import json
import subprocess
import sys
from pathlib import Path

REPO_ROOT = Path(__file__).resolve().parents[2]
SHARED_DIR = REPO_ROOT / "scripts" / "shared"
if str(SHARED_DIR) not in sys.path:
    sys.path.insert(0, str(SHARED_DIR))

from _job_utils import print_json, write_json


def parse_args(argv: list[str] | None = None) -> argparse.Namespace:
    parser = argparse.ArgumentParser(
        description="Generate timeline images from <project>/timeline.json using the image manifest runner."
    )
    parser.add_argument("project_dir", help="Project directory containing timeline.json")
    parser.add_argument("--job-id", help="Regenerate a single timeline entry by id")
    parser.add_argument("--mode", choices=["instant", "batch"], default="instant")
    parser.add_argument("--workers", type=int, default=4)
    return parser.parse_args(argv)


def load_tool_output(text: str) -> dict:
    try:
        return json.loads(text)
    except json.JSONDecodeError as exc:
        raise RuntimeError(f"scripts/visual/image.py returned non-JSON output: {exc}") from exc


def main(argv: list[str] | None = None) -> int:
    args = parse_args(argv)
    project_dir = Path(args.project_dir).expanduser().resolve()
    timeline_path = project_dir / "timeline.json"
    if not timeline_path.exists():
        print_json({"status": "error", "error": f"timeline.json not found: {timeline_path}"})
        return 2

    cmd = [
        sys.executable,
        str(REPO_ROOT / "scripts" / "visual" / "image.py"),
        "--jobs",
        str(timeline_path),
        "--mode",
        args.mode,
    ]
    if args.mode == "instant":
        cmd.extend(["--workers", str(args.workers)])
    if args.job_id:
        cmd.extend(["--job-id", str(args.job_id)])

    proc = subprocess.run(cmd, capture_output=True, text=True)
    if proc.stderr.strip():
        print(proc.stderr, file=sys.stderr, end="" if proc.stderr.endswith("\n") else "\n")

    payload = load_tool_output(proc.stdout)
    payload["timeline"] = str(timeline_path)
    payload["project_dir"] = str(project_dir)

    report_path = project_dir / "images" / ".timeline-image-run.json"
    write_json(report_path, payload)
    payload["report_file"] = str(report_path)

    if proc.returncode != 0:
        print_json(payload)
        return proc.returncode

    if args.mode == "instant":
        failures = [
            result
            for result in payload.get("results", [])
            if result.get("status") != "ok"
        ]
        if failures:
            payload["status"] = "partial_failure"
            payload["failures"] = len(failures)
            payload["failed_job_ids"] = [str(result.get("job_id")) for result in failures]
            print_json(payload)
            return 1

    print_json(payload)
    return 0


if __name__ == "__main__":
    raise SystemExit(main())
