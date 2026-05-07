#!/usr/bin/env python3
# ---
# varnam_script: hooks.team_member
# owner: harness
# status: live
# surface: hook-only
# purpose: Team membership verifier.
# use_when: Prevent dispatch into missing teammate state.
# inputs: Claude Code PreToolUse JSON on stdin, or manual verify/list CLI args
# outputs: Hook block JSON for invalid dispatch, manual CLI text, and process exit code
# authority: scripts/README.md; scripts/SCRIPT_MAP.md
# ---
"""Team-member verification hook: block dispatch into missing teammates.

Background: the editor can `SendMessage(to="researcher")` whether or not
`researcher` was actually spawned into the team. A message to a non-member lands
in a dead inbox, the sender thinks the dispatch worked, and the run stalls
silently. This helper closes that gap.

Non-team sessions are intentionally unaffected. In hook mode, if an `Agent` or
`SendMessage` payload does not include `team_name`/`team`, the hook passes
through without blocking.

CLI:
  team_member.py hook
  team_member.py verify <team_name> <member_name>
  team_member.py list   <team_name>

Exit codes:
  0 — member present (verify) / list printed (list)
  1 — member missing, or team config not found, or team has no members
  2 — argument or parse error
"""

from __future__ import annotations

import argparse
import json
import sys
from pathlib import Path
from typing import Any


TEAMS_DIR = Path.home() / ".claude" / "teams"


def _block(reason: str) -> int:
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


def _load_config(team: str, *, quiet: bool = False) -> dict:
    config_path = TEAMS_DIR / team / "config.json"
    if not config_path.is_file():
        if not quiet:
            print(f"team config not found: {config_path}", file=sys.stderr)
        raise SystemExit(1)
    try:
        return json.loads(config_path.read_text(encoding="utf-8"))
    except json.JSONDecodeError as exc:
        if not quiet:
            print(f"team config not valid JSON: {exc}", file=sys.stderr)
        raise SystemExit(2)


def _member_names(config: dict) -> list[str]:
    members = config.get("members") or []
    return [m.get("name", "") for m in members if m.get("name")]


def _load_hook_payload() -> dict[str, Any]:
    raw = sys.stdin.read()
    try:
        return json.loads(raw) if raw.strip() else {}
    except json.JSONDecodeError:
        return {}


def _first_string(value: Any, keys: tuple[str, ...]) -> str | None:
    if not isinstance(value, dict):
        return None
    for key in keys:
        item = value.get(key)
        if isinstance(item, str) and item.strip():
            return item.strip()
    return None


def _extract_hook_dispatch(payload: dict[str, Any]) -> tuple[str | None, str | None, str | None]:
    tool_name = payload.get("tool_name")
    tool_input = payload.get("tool_input")
    if not isinstance(tool_name, str) or not isinstance(tool_input, dict):
        return None, None, None

    if tool_name == "Agent":
        team = _first_string(tool_input, ("team_name", "team"))
        member = _first_string(tool_input, ("name", "subagent_type", "agent_name"))
        return tool_name, team, member

    if tool_name == "SendMessage":
        team = _first_string(tool_input, ("team_name", "team"))
        member = _first_string(tool_input, ("to", "name", "agent", "agent_name", "target"))
        return tool_name, team, member

    return tool_name, None, None


def cmd_hook(_: argparse.Namespace) -> int:
    payload = _load_hook_payload()
    tool_name, team, member = _extract_hook_dispatch(payload)
    if tool_name not in {"Agent", "SendMessage"}:
        return 0
    if not team or not member:
        return 0
    try:
        names = _member_names(_load_config(team, quiet=True))
    except SystemExit as exc:
        if tool_name == "SendMessage":
            return _block(
                f"Cannot SendMessage(to={member!r}) because team {team!r} is not configured. "
                "Spawn the think tank with TeamCreate and Agent(team_name, name) before dispatch."
            )
        return _block(
            f"Cannot spawn Agent(name={member!r}, team_name={team!r}) because team {team!r} is not configured. "
            "Create the team with TeamCreate before spawning members into it."
        )

    if tool_name == "SendMessage" and member not in names:
        return _block(
            f"Cannot SendMessage(to={member!r}) because {member!r} is not a member of team {team!r}. "
            f"Present members: {names}. Spawn the missing member before dispatch."
        )

    if tool_name == "Agent" and member in names:
        return _block(
            f"Do not spawn duplicate Agent(name={member!r}, team_name={team!r}); "
            f"{member!r} is already a team member. Use SendMessage instead."
        )

    return 0


def cmd_verify(args: argparse.Namespace) -> int:
    config = _load_config(args.team)
    names = _member_names(config)
    if args.member in names:
        print(f"ok {args.member} is a member of {args.team}")
        return 0
    print(
        f"not a member: {args.member!r} is not in team {args.team!r}. "
        f"present: {names}",
        file=sys.stderr,
    )
    return 1


def cmd_list(args: argparse.Namespace) -> int:
    config = _load_config(args.team)
    names = _member_names(config)
    if not names:
        print(f"team {args.team} has no members", file=sys.stderr)
        return 1
    for name in names:
        print(name)
    return 0


def build_parser() -> argparse.ArgumentParser:
    parser = argparse.ArgumentParser(description=__doc__.splitlines()[0])
    sub = parser.add_subparsers(dest="cmd", required=True)

    hook = sub.add_parser("hook", help="Claude Code PreToolUse hook mode")
    hook.set_defaults(func=cmd_hook)

    verify = sub.add_parser("verify", help="exit 0 iff member is present in team")
    verify.add_argument("team")
    verify.add_argument("member")
    verify.set_defaults(func=cmd_verify)

    listing = sub.add_parser("list", help="print team member names, one per line")
    listing.add_argument("team")
    listing.set_defaults(func=cmd_list)
    return parser


def parse_args(argv: list[str] | None = None) -> argparse.Namespace:
    return build_parser().parse_args(argv)


def main(argv: list[str] | None = None) -> int:
    args = parse_args(argv)
    return args.func(args)


if __name__ == "__main__":
    raise SystemExit(main())
