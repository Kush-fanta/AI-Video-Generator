#!/usr/bin/env python3
# ---
# varnam_script: research.research_logger
# owner: researcher
# status: live
# surface: direct-only
# purpose: Append-only research operation logger.
# use_when: Record durable research events across agent turns.
# inputs: CLI args, manifests, env vars, or imports documented by argparse/docstring
# outputs: files, JSON/stdout reports, or process exit code documented by the script
# authority: scripts/README.md; scripts/SCRIPT_MAP.md
# ---
"""Append-only JSONL logger for researcher operations."""

from __future__ import annotations

import json
from datetime import datetime, timezone
from pathlib import Path
from typing import Any


class ResearchLogger:
    """Small helper for durable research operation logs."""

    def __init__(self, log_path: str | Path) -> None:
        self.log_path = Path(log_path)
        self.log_path.parent.mkdir(parents=True, exist_ok=True)

    def log(self, op: str, **kwargs: Any) -> dict[str, Any]:
        entry: dict[str, Any] = {
            "ts": datetime.now(timezone.utc).isoformat(),
            "op": op,
        }
        entry.update(kwargs)
        with self.log_path.open("a", encoding="utf-8") as handle:
            handle.write(json.dumps(entry, ensure_ascii=False, default=str) + "\n")
        return entry
