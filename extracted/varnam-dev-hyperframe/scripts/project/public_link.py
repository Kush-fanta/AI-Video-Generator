#!/usr/bin/env python3
# ---
# varnam_script: project.public_link
# owner: mograph
# status: live
# surface: python3 scripts/run.py project:link-public
# purpose: Renderer asset staging bridge.
# use_when: Link project audio/images into the active renderer asset root.
# inputs: CLI args, manifests, env vars, or imports documented by argparse/docstring
# outputs: files, JSON/stdout reports, or process exit code documented by the script
# authority: scripts/README.md; scripts/SCRIPT_MAP.md
# ---
"""Stage a project's render assets into the repo-level renderer asset root."""

from __future__ import annotations

import argparse
import os
import shutil
import sys
from pathlib import Path


def _replace_path(path: Path) -> None:
    if path.is_symlink() or path.is_file():
        path.unlink()
        return
    if path.is_dir():
        shutil.rmtree(path)
        return
    raise RuntimeError(f"Cannot replace unsupported path type: {path}")


def _link_dir(target: Path, link_path: Path, *, force: bool) -> str:
    if not target.exists():
        raise RuntimeError(f"Missing source directory: {target}")
    if not target.is_dir():
        raise RuntimeError(f"Source is not a directory: {target}")

    if link_path.is_symlink():
        if link_path.resolve() == target.resolve():
            return "unchanged"
        if not force:
            raise RuntimeError(
                f"Refusing to replace existing symlink without --force: {link_path}"
            )
        link_path.unlink()
    elif link_path.exists():
        if not force:
            raise RuntimeError(
                f"Refusing to replace existing path without --force: {link_path}"
            )
        _replace_path(link_path)

    link_path.parent.mkdir(parents=True, exist_ok=True)
    relative_target = os.path.relpath(target, link_path.parent)
    link_path.symlink_to(relative_target, target_is_directory=True)
    return "linked"


def parse_args(argv: list[str] | None = None) -> argparse.Namespace:
    parser = argparse.ArgumentParser(
        description=(
            "Link a project's audio/ and images/ directories into the repo-level "
            "asset root so renderer-relative paths resolve during local renders."
        )
    )
    parser.add_argument("project_dir", help="Project directory, for example projects/bengal-curve")
    parser.add_argument(
        "--force",
        action="store_true",
        help="Replace existing public/audio or public/images links if they point elsewhere.",
    )
    return parser.parse_args(argv)


def main(argv: list[str] | None = None) -> int:
    args = parse_args(argv)

    repo_root = Path(__file__).resolve().parent.parent
    project_dir = Path(args.project_dir).expanduser()
    if not project_dir.is_absolute():
        project_dir = (repo_root / project_dir).resolve()
    else:
        project_dir = project_dir.resolve()

    if not project_dir.exists():
        raise RuntimeError(f"Project directory does not exist: {project_dir}")

    mappings = (
        ("audio", project_dir / "audio", repo_root / "public" / "audio"),
        ("images", project_dir / "images", repo_root / "public" / "images"),
    )

    print(f"Project: {project_dir}")
    for label, source, destination in mappings:
        status = _link_dir(source, destination, force=args.force)
        print(f"{label}: {status} -> {destination} -> {source}")

    return 0


if __name__ == "__main__":
    try:
        raise SystemExit(main())
    except RuntimeError as exc:
        print(f"error: {exc}", file=sys.stderr)
        raise SystemExit(1)
