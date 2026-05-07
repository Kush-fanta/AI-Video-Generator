#!/usr/bin/env python3
# ---
# varnam_script: trace.session_manifest
# owner: improviser
# status: live
# surface: scripts/run.py command
# purpose: Build a Claude Code session trace manifest for post-session improviser review.
# use_when: Run before analyzing a Claude Code agent trace, especially when subagent shards exist.
# inputs: --session-jsonl, optional --trace-dir, --project, --output, --format
# outputs: JSON or Markdown manifest on stdout or at --output.
# authority: scripts/README.md; scripts/SCRIPT_MAP.md
# ---
"""Build a compact manifest for a Claude Code session trace.

The manifest is an index, not the analysis. It separates durable artifacts from
temporary task envelopes, logical actors from JSONL shards, and causal edges
from ordinary chat turns so the improviser can read the trace without first
doing archaeology.
"""

from __future__ import annotations

import argparse
import json
import re
import sys
from collections import Counter, defaultdict
from datetime import datetime, timezone
from pathlib import Path
from typing import Any

QUEUE_FIELD_RE = re.compile(r"<(?P<name>task-id|tool-use-id|output-file|status|summary)>(?P<value>.*?)</(?P=name)>", re.S)
EDGE_TOOLS = {
    "Agent",
    "SendMessage",
    "TeamCreate",
    "TeamDelete",
    "TaskCreate",
    "TaskGet",
    "TaskList",
    "TaskOutput",
    "TaskStop",
    "TaskUpdate",
}


def _read_jsonl(path: Path) -> tuple[list[dict[str, Any]], list[dict[str, Any]]]:
    events: list[dict[str, Any]] = []
    errors: list[dict[str, Any]] = []
    with path.open("r", encoding="utf-8") as fh:
        for line_no, line in enumerate(fh, 1):
            stripped = line.strip()
            if not stripped:
                continue
            try:
                event = json.loads(stripped)
                event["_line"] = line_no
                events.append(event)
            except json.JSONDecodeError as exc:
                errors.append({"line": line_no, "error": str(exc)})
    return events, errors


def _usage_from_event(event: dict[str, Any]) -> dict[str, int]:
    usage = event.get("message", {}).get("usage", {})
    if not isinstance(usage, dict):
        return {}
    keys = (
        "input_tokens",
        "output_tokens",
        "cache_creation_input_tokens",
        "cache_read_input_tokens",
    )
    return {key: int(usage.get(key) or 0) for key in keys}


def _merge_usage(total: Counter[str], event: dict[str, Any]) -> None:
    for key, value in _usage_from_event(event).items():
        total[key] += value


def _tool_uses(event: dict[str, Any]) -> list[dict[str, Any]]:
    content = event.get("message", {}).get("content", [])
    if not isinstance(content, list):
        return []
    out = []
    for item in content:
        if isinstance(item, dict) and item.get("type") == "tool_use":
            out.append(item)
    return out


def _short(value: Any, limit: int = 220) -> str:
    if value is None:
        return ""
    text = value if isinstance(value, str) else json.dumps(value, ensure_ascii=False, sort_keys=True)
    text = re.sub(r"\s+", " ", text).strip()
    if len(text) <= limit:
        return text
    return text[: limit - 1].rstrip() + "…"


def _summarize_input(tool_name: str, tool_input: dict[str, Any]) -> dict[str, Any]:
    if not isinstance(tool_input, dict):
        return {"preview": _short(tool_input)}
    keys_by_tool = {
        "Agent": ("subagent_type", "description", "team_name"),
        "SendMessage": ("to", "recipient", "summary", "type"),
        "TeamCreate": ("team_name", "agent_type", "name"),
        "TaskUpdate": ("taskId", "task_id", "status", "owner"),
        "TaskCreate": ("taskId", "task_id", "title", "owner"),
        "TaskOutput": ("taskId", "task_id"),
        "TaskGet": ("taskId", "task_id"),
        "TaskStop": ("taskId", "task_id"),
    }
    summary: dict[str, Any] = {}
    for key in keys_by_tool.get(tool_name, ()):
        if key in tool_input:
            summary[key] = tool_input[key]
    for text_key in ("prompt", "message", "content"):
        if text_key in tool_input:
            summary[f"{text_key}_preview"] = _short(tool_input[text_key])
            break
    if not summary:
        summary["preview"] = _short(tool_input)
    return summary


def _edge_events(events: list[dict[str, Any]], source: str) -> list[dict[str, Any]]:
    edges = []
    for event in events:
        for tool in _tool_uses(event):
            name = tool.get("name")
            if name not in EDGE_TOOLS:
                continue
            edges.append({
                "source": source,
                "line": event.get("_line"),
                "timestamp": event.get("timestamp"),
                "tool": name,
                "tool_use_id": tool.get("id"),
                "input": _summarize_input(name, tool.get("input") or {}),
            })
    return edges


def _queue_events(events: list[dict[str, Any]], source: str) -> list[dict[str, Any]]:
    out = []
    for event in events:
        if event.get("type") != "queue-operation":
            continue
        content = str(event.get("content") or "")
        fields = {m.group("name").replace("-", "_"): _short(m.group("value"), 500) for m in QUEUE_FIELD_RE.finditer(content)}
        out.append({
            "source": source,
            "line": event.get("_line"),
            "timestamp": event.get("timestamp"),
            "operation": event.get("operation"),
            **fields,
        })
    return out


def _hook_events(events: list[dict[str, Any]], source: str) -> list[dict[str, Any]]:
    hooks = []
    for event in events:
        event_type = str(event.get("type") or "")
        subtype = str(event.get("subtype") or "")
        if "hook" not in event_type and "hook" not in subtype:
            continue
        hooks.append({
            "source": source,
            "line": event.get("_line"),
            "timestamp": event.get("timestamp"),
            "type": event.get("type"),
            "subtype": event.get("subtype"),
            "status": event.get("status"),
            "summary": _short(event.get("summary") or event.get("content") or event.get("message"), 500),
        })
    return hooks


def _file_results(events: list[dict[str, Any]], source: str) -> list[dict[str, Any]]:
    results = []
    for event in events:
        result = event.get("toolUseResult")
        if not isinstance(result, dict):
            continue
        path = result.get("filePath") or result.get("path")
        if not path:
            continue
        results.append({
            "source": source,
            "line": event.get("_line"),
            "timestamp": event.get("timestamp"),
            "path": path,
            "type": result.get("type") or result.get("operation"),
        })
    return results


def _event_summary(events: list[dict[str, Any]], source: str) -> dict[str, Any]:
    event_types = Counter(str(event.get("type") or "unknown") for event in events)
    subtypes = Counter(str(event.get("subtype")) for event in events if event.get("subtype"))
    tool_counts = Counter()
    token_totals: Counter[str] = Counter()
    timestamps = [event.get("timestamp") for event in events if event.get("timestamp")]
    for event in events:
        _merge_usage(token_totals, event)
        for tool in _tool_uses(event):
            tool_counts[str(tool.get("name") or "unknown")] += 1
    return {
        "source": source,
        "line_count": len(events),
        "first_timestamp": min(timestamps) if timestamps else None,
        "last_timestamp": max(timestamps) if timestamps else None,
        "event_types": dict(sorted(event_types.items())),
        "subtypes": dict(sorted(subtypes.items())),
        "tool_counts": dict(sorted(tool_counts.items())),
        "token_totals": dict(sorted(token_totals.items())),
    }


def _load_meta(path: Path) -> dict[str, Any]:
    meta_path = path.with_suffix(".meta.json")
    if not meta_path.exists():
        return {}
    try:
        return json.loads(meta_path.read_text(encoding="utf-8"))
    except (OSError, json.JSONDecodeError):
        return {"meta_error": f"could not parse {meta_path}"}


def _discover_trace_dir(session_jsonl: Path, explicit: str | None) -> Path | None:
    if explicit:
        path = Path(explicit).expanduser()
        return path if path.exists() else None
    sibling = session_jsonl.with_suffix("")
    return sibling if sibling.exists() else None


def _artifact_record(path: Path, repo_root: Path) -> dict[str, Any]:
    stat = path.stat()
    try:
        display = str(path.resolve().relative_to(repo_root.resolve()))
    except ValueError:
        display = str(path)
    return {
        "path": display,
        "abs_path": str(path.resolve()),
        "size_bytes": stat.st_size,
        "mtime": datetime.fromtimestamp(stat.st_mtime, tz=timezone.utc).isoformat(),
    }


def _project_artifacts(project: Path | None, repo_root: Path) -> list[dict[str, Any]]:
    if project is None or not project.exists():
        return []
    candidates = [
        project / "task-config.md",
        project / "tasks.md",
        project / "session_learning.md",
        project / "session_trace.md",
    ]
    output_dir = project / "output"
    if output_dir.exists():
        candidates.extend(sorted(output_dir.glob("*")))
    return [_artifact_record(path, repo_root) for path in candidates if path.exists() and path.is_file()]


def _build_manifest(args: argparse.Namespace) -> dict[str, Any]:
    repo_root = Path(args.repo_root).expanduser().resolve()
    session_jsonl = Path(args.session_jsonl).expanduser().resolve()
    trace_dir = _discover_trace_dir(session_jsonl, args.trace_dir)
    main_events, main_errors = _read_jsonl(session_jsonl)
    session_ids = sorted({event.get("sessionId") for event in main_events if event.get("sessionId")})
    cwd_values = sorted({event.get("cwd") for event in main_events if event.get("cwd")})

    subagents = []
    all_edges = _edge_events(main_events, "main")
    all_queues = _queue_events(main_events, "main")
    all_hooks = _hook_events(main_events, "main")
    all_file_results = _file_results(main_events, "main")
    parse_errors = {"main": main_errors}

    if trace_dir:
        subagent_dir = trace_dir / "subagents"
        if subagent_dir.exists():
            for jsonl_path in sorted(subagent_dir.glob("*.jsonl")):
                events, errors = _read_jsonl(jsonl_path)
                agent_id = jsonl_path.stem
                meta = _load_meta(jsonl_path)
                summary = _event_summary(events, agent_id)
                summary.update({
                    "agent_id": agent_id,
                    "path": str(jsonl_path),
                    "agent_type": meta.get("agentType"),
                    "description": meta.get("description"),
                    "meta": meta,
                })
                subagents.append(summary)
                all_edges.extend(_edge_events(events, agent_id))
                all_queues.extend(_queue_events(events, agent_id))
                all_hooks.extend(_hook_events(events, agent_id))
                all_file_results.extend(_file_results(events, agent_id))
                if errors:
                    parse_errors[agent_id] = errors

    logical_actor_counts = Counter()
    logical_actor_counts["main"] = 1
    for shard in subagents:
        logical_actor_counts[str(shard.get("agent_type") or "unknown")] += 1

    temp_envelopes = []
    for event in all_queues:
        output_file = event.get("output_file")
        if not output_file:
            continue
        path = Path(str(output_file))
        temp_envelopes.append({
            "task_id": event.get("task_id"),
            "output_file": str(path),
            "exists": path.exists(),
            "status": event.get("status"),
            "summary": event.get("summary"),
        })

    project = Path(args.project).expanduser().resolve() if args.project else None
    main_summary = _event_summary(main_events, "main")
    return {
        "schema": "varnam.trace_manifest.v1",
        "generated_at": datetime.now(timezone.utc).isoformat(),
        "session": {
            "session_ids": session_ids,
            "cwd_values": cwd_values,
            "main_jsonl": str(session_jsonl),
            "trace_dir": str(trace_dir) if trace_dir else None,
            "project": str(project) if project else None,
            "first_timestamp": main_summary.get("first_timestamp"),
            "last_timestamp": main_summary.get("last_timestamp"),
        },
        "main": main_summary,
        "subagents": subagents,
        "logical_actor_counts": dict(sorted(logical_actor_counts.items())),
        "causal_edges": all_edges,
        "queue_events": all_queues,
        "hook_events": all_hooks,
        "file_results": all_file_results,
        "durable_artifacts": _project_artifacts(project, repo_root),
        "temporary_envelopes": temp_envelopes,
        "parse_errors": {key: value for key, value in parse_errors.items() if value},
    }


def _markdown(manifest: dict[str, Any]) -> str:
    session = manifest["session"]
    lines = [
        "# Claude Code Session Trace Manifest",
        "",
        f"Generated: `{manifest['generated_at']}`",
        f"Schema: `{manifest['schema']}`",
        f"Main JSONL: `{session['main_jsonl']}`",
        f"Trace dir: `{session.get('trace_dir')}`",
        f"Project: `{session.get('project')}`",
        "",
        "## Summary",
        "",
        f"- Main lines: `{manifest['main']['line_count']}`",
        f"- Subagent shards: `{len(manifest['subagents'])}`",
        f"- Logical actor counts: `{json.dumps(manifest['logical_actor_counts'], sort_keys=True)}`",
        f"- Causal edges: `{len(manifest['causal_edges'])}`",
        f"- Queue events: `{len(manifest['queue_events'])}`",
        f"- Hook events: `{len(manifest['hook_events'])}`",
        f"- Durable artifacts: `{len(manifest['durable_artifacts'])}`",
        f"- Temporary envelopes: `{len(manifest['temporary_envelopes'])}`",
        "",
        "## Main Token Totals",
        "",
        "```json",
        json.dumps(manifest["main"].get("token_totals", {}), indent=2, sort_keys=True),
        "```",
        "",
        "## Subagent Shards",
        "",
        "| Agent id | Type | Lines | Tools | Tokens |",
        "|---|---|---:|---|---|",
    ]
    for shard in manifest["subagents"]:
        tools = _short(shard.get("tool_counts", {}), 120)
        tokens = _short(shard.get("token_totals", {}), 120)
        lines.append(
            f"| `{shard['agent_id']}` | `{shard.get('agent_type')}` | "
            f"{shard['line_count']} | `{tools}` | `{tokens}` |"
        )
    lines.extend([
        "",
        "## Temporary Envelopes",
        "",
        "| Task id | Exists | Status | Output file |",
        "|---|---:|---|---|",
    ])
    for item in manifest["temporary_envelopes"]:
        lines.append(
            f"| `{item.get('task_id')}` | `{item.get('exists')}` | "
            f"`{item.get('status')}` | `{item.get('output_file')}` |"
        )
    return "\n".join(lines) + "\n"


def parse_args(argv: list[str] | None = None) -> argparse.Namespace:
    parser = argparse.ArgumentParser(description=__doc__)
    parser.add_argument("--session-jsonl", required=True, help="Path to the main Claude Code session JSONL.")
    parser.add_argument("--trace-dir", help="Session directory containing subagents/ and tool-results/. Defaults to sibling of session JSONL.")
    parser.add_argument("--project", help="Optional projects/<slug> directory for durable artifact listing.")
    parser.add_argument("--repo-root", default=".", help="Repo root used for relative artifact display.")
    parser.add_argument("--output", "-o", help="Write manifest here instead of stdout.")
    parser.add_argument("--format", choices=("json", "md"), default="json", help="Output format.")
    return parser.parse_args(argv)


def main(argv: list[str] | None = None) -> int:
    args = parse_args(argv)
    manifest = _build_manifest(args)
    if args.format == "json":
        content = json.dumps(manifest, indent=2, sort_keys=True) + "\n"
    else:
        content = _markdown(manifest)

    if args.output:
        Path(args.output).expanduser().write_text(content, encoding="utf-8")
    else:
        sys.stdout.write(content)
    return 0


if __name__ == "__main__":
    raise SystemExit(main())
