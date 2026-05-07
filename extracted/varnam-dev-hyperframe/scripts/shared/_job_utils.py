#!/usr/bin/env python3
# ---
# varnam_script: shared.job_utils
# owner: shared
# status: internal
# surface: import-only
# purpose: Batch job helper library.
# use_when: Import from scripts that process job manifests.
# inputs: CLI args, manifests, env vars, or imports documented by argparse/docstring
# outputs: files, JSON/stdout reports, or process exit code documented by the script
# authority: scripts/README.md; scripts/SCRIPT_MAP.md
# ---
"""Shared helpers for batch-first generation scripts."""

from __future__ import annotations

import json
import sys
from pathlib import Path
from typing import Any


def load_manifest(path: str) -> tuple[dict[str, Any], Path]:
    manifest_path = Path(path).expanduser().resolve()
    with open(manifest_path, "r", encoding="utf-8") as handle:
        data = json.load(handle)
    if "entries" in data:
        data["jobs"] = data["entries"]
    if "jobs" not in data or not isinstance(data["jobs"], list):
        raise ValueError("Manifest must contain a top-level 'entries' array")
    return data, manifest_path


def select_jobs(manifest: dict[str, Any], job_id: str | None = None) -> list[dict[str, Any]]:
    jobs = manifest["jobs"]
    if not job_id:
        return jobs
    selected = [job for job in jobs if str(job.get("id")) == job_id]
    if not selected:
        raise ValueError(f"Job '{job_id}' not found in manifest")
    return selected


def resolve_path(base_dir: Path, path_value: str | None, fallback: str) -> Path:
    path = Path(path_value or fallback)
    if not path.is_absolute():
        path = (base_dir / path).resolve()
    return path


def resolve_reference_paths(base_dir: Path, job: dict[str, Any]) -> list[Path]:
    refs: list[str] = []

    if isinstance(job.get("references"), list):
        refs.extend(str(item) for item in job["references"])

    if isinstance(job.get("reference_images"), list):
        refs.extend(str(item) for item in job["reference_images"])

    if job.get("reference_image"):
        refs.append(str(job["reference_image"]))

    resolved: list[Path] = []
    for ref in refs:
        path = Path(ref)
        if not path.is_absolute():
            path = (base_dir / path).resolve()
        resolved.append(path)
    return resolved


def validate_reference_count(job: dict[str, Any], references: list[Path], model_config: dict[str, Any]) -> None:
    max_references = job.get("max_references", model_config.get("max_references"))
    if max_references is None:
        return
    if len(references) > int(max_references):
        raise ValueError(
            f"Job '{job.get('id')}' has {len(references)} references, but model_config.max_references={max_references}"
        )


def ensure_parent(path: Path) -> None:
    path.parent.mkdir(parents=True, exist_ok=True)


def write_json(path: Path, data: Any) -> None:
    ensure_parent(path)
    with open(path, "w", encoding="utf-8") as handle:
        json.dump(data, handle, indent=2)


def print_json(data: Any) -> None:
    json.dump(data, sys.stdout, indent=2)
    sys.stdout.write("\n")
