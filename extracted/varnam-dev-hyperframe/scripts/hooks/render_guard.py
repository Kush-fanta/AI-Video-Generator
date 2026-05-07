#!/usr/bin/env python3
# ---
# varnam_script: hooks.render_guard
# owner: harness
# status: live
# surface: hook-only
# purpose: Render command guard.
# use_when: Attach render gates around render commands.
# inputs: CLI args, manifests, env vars, or imports documented by argparse/docstring
# outputs: files, JSON/stdout reports, or process exit code documented by the script
# authority: scripts/README.md; scripts/SCRIPT_MAP.md
# ---
"""Claude Code hook entrypoint for render preflight/postflight."""

from __future__ import annotations

import json
import re
import subprocess
import sys
from pathlib import Path
from typing import Any


REPO_ROOT = Path(__file__).resolve().parents[2]
PROJECTS_DIR = REPO_ROOT / "projects"
VIDEO_TOKEN_RE = re.compile(r'([^\s"\']+\.(?:mp4|mov|mkv|webm))', re.IGNORECASE)
PROJECT_REF_RE = re.compile(r"(?<![A-Za-z0-9_-])projects/([A-Za-z0-9_-]+)")


def _walk_strings(value: Any) -> list[str]:
    if isinstance(value, dict):
        strings: list[str] = []
        for item in value.values():
            strings.extend(_walk_strings(item))
        return strings
    if isinstance(value, list):
        strings: list[str] = []
        for item in value:
            strings.extend(_walk_strings(item))
        return strings
    if isinstance(value, str):
        return [value]
    return []


def _load_payload() -> tuple[dict[str, Any], str]:
    raw = sys.stdin.read()
    try:
        payload = json.loads(raw) if raw.strip() else {}
    except json.JSONDecodeError:
        payload = {}
    return payload, raw


def _payload_text(payload: dict[str, Any], raw: str) -> str:
    return "\n".join([raw, *_walk_strings(payload)])


def _is_render_hook(payload: dict[str, Any]) -> bool:
    tool_input = payload.get("tool_input")
    command = ""
    if isinstance(tool_input, dict):
        command = str(tool_input.get("command") or "")
    if not command:
        command = str(payload.get("command") or "")
    normalized = command.lower()
    return (
        "hyperframes render" in normalized
        or "scripts/run.py hyperframes:render" in normalized
        or "scripts/run.py render:" in normalized
        or "scripts/run.py render " in normalized
    )


def _explicit_project_slugs(payload_text: str) -> set[str]:
    slugs: set[str] = set()
    if not PROJECTS_DIR.exists():
        return slugs

    for match in PROJECT_REF_RE.finditer(payload_text):
        slug = match.group(1)
        if (PROJECTS_DIR / slug).is_dir():
            slugs.add(slug)

    return slugs


def _guess_project_slug(payload_text: str) -> str | None:
    slugs = _explicit_project_slugs(payload_text)
    if len(slugs) == 1:
        return next(iter(slugs))
    return None


def _resolve_path(token: str) -> Path:
    candidate = Path(token).expanduser()
    if candidate.is_absolute():
        return candidate.resolve()
    return (REPO_ROOT / candidate).resolve()


def _guess_video_path(payload_text: str, project_slug: str | None) -> Path | None:
    matches = VIDEO_TOKEN_RE.findall(payload_text)
    for token in reversed(matches):
        path = _resolve_path(token)
        if path.exists():
            return path

    if not project_slug:
        return None

    project_output = REPO_ROOT / "projects" / project_slug / "output"
    repo_out = REPO_ROOT / "out"
    candidates: list[Path] = []
    if project_output.exists():
        candidates.extend(sorted(project_output.glob("*.mp4")))
    if repo_out.exists():
        candidates.extend(sorted(repo_out.glob(f"{project_slug}*.mp4")))
    if not candidates:
        return None
    return max(candidates, key=lambda path: path.stat().st_mtime)


def _block_preflight(reason: str) -> int:
    payload = {
        "decision": "block",
        "reason": reason,
        "hookSpecificOutput": {
            "hookEventName": "PreToolUse",
            "permissionDecision": "deny",
            "permissionDecisionReason": reason,
        },
    }
    json.dump(payload, sys.stdout)
    sys.stdout.write("\n")
    return 0


def _warn_postflight(reason: str) -> int:
    payload = {
        "decision": "block",
        "reason": reason,
    }
    json.dump(payload, sys.stdout)
    sys.stdout.write("\n")
    return 0


def _summarize_failures(output: str) -> str:
    try:
        payload = json.loads(output)
    except json.JSONDecodeError:
        return output.strip().splitlines()[0][:240] if output.strip() else "hook command failed"

    errors = payload.get("errors") or []
    warnings = payload.get("warnings") or []
    if errors:
        return "; ".join(str(item) for item in errors[:3])
    if warnings:
        return "; ".join(str(item) for item in warnings[:2])
    return "hook command failed"


def _run_pre(project_dir: Path) -> int:
    words_candidates = [
        project_dir / "audio" / "voiceover.words.json",
    ]
    if not any(path.exists() for path in words_candidates):
        return 0

    cmd = [
        sys.executable,
        str(REPO_ROOT / "scripts" / "review" / "preflight_render.py"),
        str(project_dir),
        "--require-lock",
    ]
    proc = subprocess.run(cmd, capture_output=True, text=True, check=False)
    if proc.returncode == 0:
        return 0

    reason = f"Render preflight failed for {project_dir.name}: {_summarize_failures(proc.stdout or proc.stderr)}"
    return _block_preflight(reason)


def _run_post(project_dir: Path, video_path: Path | None) -> int:
    report_dir = project_dir / "review" / "postflight"
    report_name = f"{(video_path.stem if video_path else 'latest')}.json"
    report_path = report_dir / report_name

    cmd = [
        sys.executable,
        str(REPO_ROOT / "scripts" / "review" / "postflight_render.py"),
        str(project_dir),
        "--report",
        str(report_path),
    ]
    if video_path is not None:
        cmd.extend(["--video", str(video_path)])

    proc = subprocess.run(cmd, capture_output=True, text=True, check=False)
    if proc.returncode == 0:
        return 0

    reason = (
        f"Render postflight failed for {project_dir.name}: "
        f"{_summarize_failures(proc.stdout or proc.stderr)}. "
        f"Report: {report_path}"
    )
    return _warn_postflight(reason)


def main() -> int:
    if len(sys.argv) != 2 or sys.argv[1] not in {"pre", "post"}:
        print("usage: render_guard.py [pre|post]", file=sys.stderr)
        return 1

    mode = sys.argv[1]
    payload, raw = _load_payload()
    text = _payload_text(payload, raw)
    if not _is_render_hook(payload):
        return 0

    project_slug = _guess_project_slug(text)
    if not project_slug:
        return 0

    project_dir = REPO_ROOT / "projects" / project_slug
    if not project_dir.exists():
        return 0

    if mode == "pre":
        return _run_pre(project_dir)

    video_path = _guess_video_path(text, project_slug)
    return _run_post(project_dir, video_path)


if __name__ == "__main__":
    raise SystemExit(main())
