#!/usr/bin/env python3
# ---
# varnam_script: hooks.project_scaffold_guard
# owner: harness
# status: live
# surface: hook-only
# purpose: Project scaffold guard.
# use_when: Block manual project bootstrap outside the canonical flow.
# inputs: CLI args, manifests, env vars, or imports documented by argparse/docstring
# outputs: files, JSON/stdout reports, or process exit code documented by the script
# authority: scripts/README.md; scripts/SCRIPT_MAP.md
# ---
"""Block manual project bootstrap outside the canonical scaffold command."""

from __future__ import annotations

import json
import re
import sys
from dataclasses import dataclass
from typing import Any


PROJECT_SLUG = r"[A-Za-z0-9_-]+"
PROJECT_PATH = rf"projects/{PROJECT_SLUG}"
TEMPLATE_PROJECT_PATH = rf"templates/projects/{PROJECT_SLUG}"
WRITE_VERBS = r"cat|printf|echo|touch|cp|install|tee|mkdir|mv|rsync"
REDIRECT_WRITE = rf"(?:cat|printf|echo)\b[^\n]*[>][^\n]*"
FILE_WRITE = rf"(?:{REDIRECT_WRITE}|\b(?:touch|cp|install|tee)\b[^\n]*)"
ANY_WRITE = rf"(?:{REDIRECT_WRITE}|\b(?:{WRITE_VERBS})\b[^\n]*)"
ALLOWED_SCAFFOLD_COMMANDS = (
    "scripts/project/scaffold.sh",
    "scripts/run.py project:scaffold",
)


def _guard_pattern(pattern: str) -> re.Pattern[str]:
    return re.compile(pattern, re.IGNORECASE | re.VERBOSE)


@dataclass(frozen=True)
class GuardRule:
    name: str
    pattern: re.Pattern[str]
    reason: str

    def matches(self, text: str) -> bool:
        return bool(self.pattern.search(text))


PROJECT_LOCAL_RENDER_REASON = (
    "Project-local renderer source is not a production surface. "
    "Do not create or write projects/<slug>/src/**, project package.json, or project-local renderer config. "
    "Bind cuts in direction/render-manifest.yaml and route missing primitive/composition/runtime capability to mograph."
)
TEMPLATE_PROJECT_REASON = (
    "Project bootstrap must not target templates/projects; templates/ is reusable catalog/runtime code only. "
    "Run python3 scripts/run.py project:intake, or use the backend fallback "
    "python3 scripts/run.py project:scaffold --from <form>."
)
MANUAL_BOOTSTRAP_REASON = (
    "Manual project bootstrap is blocked. "
    "Run python3 scripts/run.py project:intake, or use the backend fallback "
    "python3 scripts/run.py project:scaffold --from <form>."
)

GUARD_RULES: tuple[GuardRule, ...] = (
    GuardRule(
        name="project_local_renderer_write",
        pattern=_guard_pattern(
            rf"""
            {ANY_WRITE}
            (?:
                {PROJECT_PATH}/src(?:/|\b)
                |
                {PROJECT_PATH}/(?:hyperframes\.config\.[A-Za-z0-9]+|package\.json)
            )
            """
        ),
        reason=PROJECT_LOCAL_RENDER_REASON,
    ),
    GuardRule(
        name="project_local_renderer_reference",
        pattern=_guard_pattern(
            rf"""
            {PROJECT_PATH}/
            (?:
                src(?:/|$)(?:[^\s"']+\.(?:tsx|ts)|[^\s"']*)
                |
                hyperframes\.config\.[A-Za-z0-9]+
                |
                package\.json
            )
            """
        ),
        reason=(
            "Project-local renderer source is not a production surface. "
            "Use direction/render-manifest.yaml composition/variables bindings and the shared runtime instead."
        ),
    ),
    GuardRule(
        name="template_project_bootstrap",
        pattern=_guard_pattern(
            rf"""
            \bmkdir\b[^\n]*\b{TEMPLATE_PROJECT_PATH}
            """
        ),
        reason=TEMPLATE_PROJECT_REASON,
    ),
    GuardRule(
        name="manual_project_directory_bootstrap",
        pattern=_guard_pattern(
            rf"""
            \bmkdir\b[^\n]*\b{PROJECT_PATH}
            """
        ),
        reason=MANUAL_BOOTSTRAP_REASON,
    ),
    GuardRule(
        name="manual_project_control_file_write",
        pattern=_guard_pattern(
            rf"""
            {FILE_WRITE}
            (?:
                {PROJECT_PATH}/(?:task-config\.md|tasks\.md)
                |
                {TEMPLATE_PROJECT_PATH}
            )
            """
        ),
        reason=MANUAL_BOOTSTRAP_REASON,
    ),
)


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


def _block(rule: GuardRule) -> int:
    payload = {
        "decision": "block",
        "reason": rule.reason,
        "rule": rule.name,
        "hookSpecificOutput": {
            "hookEventName": "PreToolUse",
            "permissionDecision": "deny",
            "permissionDecisionReason": f"{rule.name}: {rule.reason}",
        },
    }
    json.dump(payload, sys.stdout)
    sys.stdout.write("\n")
    return 0


def _is_allowed_scaffold_command(text: str) -> bool:
    lowered = text.lower()
    return any(command in lowered for command in ALLOWED_SCAFFOLD_COMMANDS)


def _matching_rule(text: str) -> GuardRule | None:
    for rule in GUARD_RULES:
        if rule.matches(text):
            return rule
    return None


def main() -> int:
    payload, raw = _load_payload()
    text = _payload_text(payload, raw)
    if _is_allowed_scaffold_command(text):
        return 0

    rule = _matching_rule(text)
    return _block(rule) if rule else 0


if __name__ == "__main__":
    raise SystemExit(main())
