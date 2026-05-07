#!/usr/bin/env python3
# ---
# varnam_script: hooks.post_compact_doctrine_reload
# owner: harness
# status: live
# surface: hook-only
# purpose: PostCompact doctrine reload reminder.
# use_when: Run as a Claude Code hook after context compaction.
# inputs: CLI args, manifests, env vars, or imports documented by argparse/docstring
# outputs: files, JSON/stdout reports, or process exit code documented by the script
# authority: scripts/README.md; scripts/SCRIPT_MAP.md
# ---
"""PostCompact hook: re-inject doctrine after context compaction.

When `/compact` (manual or auto) compresses the conversation, the doctrine
spec lives in the compressed window and gets paraphrased into the summary.
Paraphrased rules drift. The 2026-04-24 ugc-dalit run hit /compact at ~3hr;
nearly every doctrine miss after correlates.

This hook fires after compaction. It prints `additionalContext` that the
harness injects into the new context window, pointing the editor at the
canonical files to re-read BEFORE the next tool call.

Reads PostCompact event JSON on stdin (includes the summary). Outputs JSON
with hookSpecificOutput.additionalContext.

Doctrine reference: docs/doctrine.md §14 (post-compaction re-read use case),
docs/record-book.md (the dev story across sessions).
"""

from __future__ import annotations

import json
import os
import sys
from pathlib import Path

PROJECT_DIR = Path(os.environ.get("CLAUDE_PROJECT_DIR", "."))

CANONICAL_FILES = [
    ("docs/doctrine.md", "the system's SDLC primitives — full file"),
    (".claude/agents/editor.md", "editor behavioral contract — full file"),
    ("docs/record-book.md", "dev story across sessions — last 15-20 rows + Open threads"),
]


def _file_exists(rel: str) -> bool:
    return (PROJECT_DIR / rel).exists()


def main() -> int:
    # Consume stdin (PostCompact provides the summary; we don't need it but
    # must read it to avoid SIGPIPE).
    try:
        sys.stdin.read()
    except Exception:
        pass

    lines = [
        "DOCTRINE RELOAD REQUIRED — context was just compacted.",
        "",
        "Compaction displaces specs into paraphrased summary. Paraphrased rules drift.",
        "Before the next tool call, re-read these files as directives, not summaries:",
        "",
    ]
    for rel, why in CANONICAL_FILES:
        if _file_exists(rel):
            lines.append(f"  - {rel} — {why}")
        else:
            lines.append(f"  - {rel} — MISSING (system file expected; surface this as a problem)")

    lines.extend([
        "",
        "Also re-read the active project's `.lane-state.md` if a slug is in flight — recover state from disk, not from the summary.",
        "",
        "If you skip this re-read and take a tool action anyway, that is `post_compaction_reread_skipped` "
        "(named failure mode in editor.md). Count it in `session_learning.md` at exit.",
    ])

    additional_context = "\n".join(lines)

    print(json.dumps({
        "hookSpecificOutput": {
            "hookEventName": "PostCompact",
            "additionalContext": additional_context,
        },
        "systemMessage": "Doctrine reload reminder injected after compaction.",
    }))
    return 0


if __name__ == "__main__":
    sys.exit(main())
