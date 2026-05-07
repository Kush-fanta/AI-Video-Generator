#!/usr/bin/env python3
# ---
# varnam_script: visual.video
# owner: visual
# status: live
# surface: python3 scripts/run.py visual:video
# purpose: Batch source-video acquisition dispatcher.
# use_when: Run video jobs from a manifest.
# inputs: CLI args, manifests, env vars, or imports documented by argparse/docstring
# outputs: files, JSON/stdout reports, or process exit code documented by the script
# authority: scripts/README.md; scripts/SCRIPT_MAP.md
# ---
"""Batch-first video generation/acquisition dispatcher for Varnam."""

from __future__ import annotations

import argparse
import json
import subprocess
import sys
from pathlib import Path

SCRIPTS_DIR = Path(__file__).resolve().parents[1]
SHARED_DIR = SCRIPTS_DIR / "shared"
if str(SHARED_DIR) not in sys.path:
    sys.path.insert(0, str(SHARED_DIR))

from _job_utils import (
    load_manifest,
    print_json,
    resolve_path,
    resolve_reference_paths,
    select_jobs,
    validate_reference_count,
)

MEDIA_SUFFIXES = {".mp4", ".webm", ".mkv"}
SUPPORTED_PROVIDERS = {"source-clip", "source_clip"}
VIDEO_CLIP_SCRIPT = Path(__file__).with_name("video_clip.py")


def find_output(base_output: Path) -> Path | None:
    if base_output.exists():
        return base_output
    return next(
        (
            candidate
            for candidate in base_output.parent.glob(f"{base_output.stem}.*")
            if candidate.suffix in MEDIA_SUFFIXES
        ),
        None,
    )


def run_source_clip_job(job: dict, manifest_path: Path, defaults: dict) -> dict:
    model_config = defaults.get("model_config", {})
    references = resolve_reference_paths(manifest_path.parent, job)
    validate_reference_count(job, references, model_config)
    if references:
        raise ValueError(
            f"Video job '{job.get('id')}' includes references, but provider 'source-clip' does not use reference inputs"
        )

    output_root = resolve_path(manifest_path.parent, defaults.get("output_dir"), "video")
    output_name = job.get("output") or f"{job.get('id', 'video')}.mp4"
    output_path = resolve_path(output_root, output_name, output_name)
    output_path.parent.mkdir(parents=True, exist_ok=True)

    if not job.get("url"):
        raise ValueError(f"Video job '{job.get('id')}' requires a url")

    command = [
        sys.executable,
        str(VIDEO_CLIP_SCRIPT),
        "--url",
        str(job["url"]),
        "--output",
        str(output_path),
        "--quality",
        str(job.get("quality", defaults.get("quality", "1080"))),
    ]
    if job.get("start"):
        command.extend(["--start", str(job["start"])])
    if job.get("end"):
        command.extend(["--end", str(job["end"])])

    result = subprocess.run(command, check=True, text=True, capture_output=True)
    produced = find_output(output_path)
    return {
        "job_id": str(job.get("id", output_path.stem)),
        "provider": "source-clip",
        "output": str(produced or output_path),
        "status": "ok" if produced else "unknown",
        "stdout": result.stdout.strip(),
    }


def parse_args(argv: list[str] | None = None) -> argparse.Namespace:
    parser = argparse.ArgumentParser(description="Batch-first video dispatcher for Varnam")
    parser.add_argument("--jobs", required=True, help="Path to video jobs manifest")
    parser.add_argument("--job-id", help="Run only a specific job id")
    return parser.parse_args(argv)


def main(argv: list[str] | None = None) -> int:
    args = parse_args(argv)

    manifest, manifest_path = load_manifest(args.jobs)
    defaults = manifest.get("defaults", {})
    defaults["model_config"] = manifest.get("model_config", {})
    jobs = select_jobs(manifest, args.job_id)
    provider = manifest.get("provider", "source-clip")

    if provider not in SUPPORTED_PROVIDERS:
        raise ValueError(
            f"Unsupported video provider '{provider}'. Current implementation supports 'source-clip' only."
        )

    results = [run_source_clip_job(job, manifest_path, defaults) for job in jobs]
    print_json({"status": "ok", "provider": "source-clip", "results": results})
    return 0


if __name__ == "__main__":
    try:
        raise SystemExit(main())
    except Exception as exc:
        print_json({"status": "error", "error": str(exc)})
        sys.exit(1)
