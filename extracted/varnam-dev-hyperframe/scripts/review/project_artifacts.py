#!/usr/bin/env python3
# ---
# varnam_script: review.project_artifacts
# owner: shared
# status: internal
# surface: import-only
# purpose: Project artifact path resolver.
# use_when: Import from gates that need canonical project paths.
# inputs: CLI args, manifests, env vars, or imports documented by argparse/docstring
# outputs: files, JSON/stdout reports, or process exit code documented by the script
# authority: scripts/README.md; scripts/SCRIPT_MAP.md
# ---
"""Artifact path resolution shared by render validation wrappers."""

from __future__ import annotations

from pathlib import Path


REPO_ROOT = Path(__file__).resolve().parents[2]


def _dedupe_paths(paths: list[Path]) -> list[Path]:
    unique: list[Path] = []
    seen: set[str] = set()
    for path in paths:
        key = str(path)
        if key in seen:
            continue
        seen.add(key)
        unique.append(path)
    return unique


def resolve_artifact_path(
    project: Path,
    rel: str,
    *,
    kind: str,
    repo_root: Path | None = None,
) -> Path:
    repo_root = repo_root or REPO_ROOT
    rel_path = Path(rel).expanduser()
    if rel_path.is_absolute():
        return rel_path.resolve()

    candidates = [
        (project / rel_path).resolve(),
        (repo_root / rel_path).resolve(),
    ]

    if kind == "styles":
        candidates.append((project / "timing.ts").resolve())
    elif kind == "root":
        candidates.append((project / "Root.tsx").resolve())

    deduped = _dedupe_paths(candidates)
    existing = [candidate for candidate in deduped if candidate.exists()]
    if existing:
        return existing[0]
    return deduped[0]


def resolve_rendered_video_path(
    project: Path,
    video_arg: str | None,
    *,
    repo_root: Path | None = None,
) -> Path | None:
    repo_root = repo_root or REPO_ROOT
    candidates: list[Path] = []
    if video_arg:
        raw = Path(video_arg).expanduser()
        if raw.is_absolute():
            candidates.append(raw.resolve())
        else:
            candidates.extend(
                [
                    (project / raw).resolve(),
                    (repo_root / raw).resolve(),
                    raw.resolve(),
                ]
            )
    else:
        output_dir = project / "output"
        if output_dir.exists():
            candidates.extend(sorted(output_dir.glob("*.mp4")))
        repo_out = repo_root / "out"
        if repo_out.exists():
            candidates.extend(sorted(repo_out.glob(f"{project.name}*.mp4")))

    existing = [path for path in candidates if path.exists()]
    if not existing:
        return None
    return max(existing, key=lambda path: path.stat().st_mtime)
