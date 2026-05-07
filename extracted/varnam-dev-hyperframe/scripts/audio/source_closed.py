#!/usr/bin/env python3
# ---
# varnam_script: audio.source_closed
# owner: audio,core
# status: live
# surface: python3 scripts/run.py audio:source
# purpose: Source closure verifier.
# use_when: Ensure audio starts only after source text is closed.
# inputs: CLI args, manifests, env vars, or imports documented by argparse/docstring
# outputs: files, JSON/stdout reports, or process exit code documented by the script
# authority: scripts/README.md; scripts/SCRIPT_MAP.md
# ---
"""Source-closed handshake: prevent downstream dispatch on a mutating input.

CLI:
  source_closed.py close     <rel_path> --agent <name>
  source_closed.py verify    <rel_path>
  source_closed.py invalidate <rel_path>

Record path: <project_root>/.source_closed.json
Project root is the nearest ancestor of cwd containing task-config.md.
"""

from __future__ import annotations

import argparse
import hashlib
import json
import sys
from datetime import datetime, timezone
from pathlib import Path


def _sha256(path: Path) -> str:
    digest = hashlib.sha256()
    with path.open("rb") as handle:
        for chunk in iter(lambda: handle.read(1024 * 1024), b""):
            digest.update(chunk)
    return digest.hexdigest()


def _find_project_root(start: Path) -> Path:
    for candidate in [start, *start.parents]:
        if (candidate / "task-config.md").is_file():
            return candidate
    raise SystemExit(
        f"no project root found above {start} (no task-config.md ancestor)"
    )


def _load_record(record_path: Path) -> dict:
    if not record_path.exists():
        return {}
    try:
        return json.loads(record_path.read_text(encoding="utf-8"))
    except json.JSONDecodeError as exc:
        raise SystemExit(f"{record_path} is not valid JSON: {exc}")


def _save_record(record_path: Path, data: dict) -> None:
    record_path.write_text(json.dumps(data, indent=2, sort_keys=True) + "\n", encoding="utf-8")


def cmd_close(args: argparse.Namespace) -> int:
    project_root = _find_project_root(Path.cwd())
    target = project_root / args.path
    if not target.is_file():
        print(f"source not found: {target}", file=sys.stderr)
        return 1
    record_path = project_root / ".source_closed.json"
    data = _load_record(record_path)
    data[args.path] = {
        "closed": True,
        "sha256": _sha256(target),
        "signed_by": args.agent,
        "signed_at": datetime.now(timezone.utc).strftime("%Y-%m-%dT%H:%M:%SZ"),
    }
    _save_record(record_path, data)
    print(f"closed {args.path} sha256={data[args.path]['sha256']} by={args.agent}")
    return 0


def cmd_verify(args: argparse.Namespace) -> int:
    project_root = _find_project_root(Path.cwd())
    target = project_root / args.path
    record_path = project_root / ".source_closed.json"
    data = _load_record(record_path)
    entry = data.get(args.path)
    if not entry:
        print(f"source not closed: no record for {args.path}", file=sys.stderr)
        return 1
    if not entry.get("closed"):
        print(f"source invalidated: {args.path} marked closed=false", file=sys.stderr)
        return 1
    if not target.is_file():
        print(f"source missing: {target}", file=sys.stderr)
        return 1
    current = _sha256(target)
    if current != entry["sha256"]:
        print(
            f"source mutated since close: {args.path}\n"
            f"  closed_sha={entry['sha256']}\n"
            f"  now_sha   ={current}",
            file=sys.stderr,
        )
        return 1
    print(f"ok {args.path} sha256={current} signed_by={entry.get('signed_by')}")
    return 0


def cmd_invalidate(args: argparse.Namespace) -> int:
    project_root = _find_project_root(Path.cwd())
    record_path = project_root / ".source_closed.json"
    data = _load_record(record_path)
    entry = data.get(args.path)
    if not entry:
        print(f"no record for {args.path} — nothing to invalidate", file=sys.stderr)
        return 0
    entry["closed"] = False
    entry["invalidated_at"] = datetime.now(timezone.utc).strftime("%Y-%m-%dT%H:%M:%SZ")
    data[args.path] = entry
    _save_record(record_path, data)
    print(f"invalidated {args.path}")
    return 0


def parse_args(argv: list[str] | None = None) -> argparse.Namespace:
    parser = argparse.ArgumentParser(description=__doc__.splitlines()[0])
    sub = parser.add_subparsers(dest="cmd", required=True)

    close = sub.add_parser("close", help="mark a source file closed with its current sha")
    close.add_argument("path", help="path relative to project root")
    close.add_argument("--agent", required=True, help="agent name writing the close record")
    close.set_defaults(func=cmd_close)

    verify = sub.add_parser("verify", help="verify a source file is still closed and unchanged")
    verify.add_argument("path", help="path relative to project root")
    verify.set_defaults(func=cmd_verify)

    inv = sub.add_parser("invalidate", help="mark a source file no longer closed")
    inv.add_argument("path", help="path relative to project root")
    inv.set_defaults(func=cmd_invalidate)

    return parser.parse_args(argv)


def main(argv: list[str] | None = None) -> int:
    args = parse_args(argv)
    return args.func(args)


if __name__ == "__main__":
    raise SystemExit(main())
