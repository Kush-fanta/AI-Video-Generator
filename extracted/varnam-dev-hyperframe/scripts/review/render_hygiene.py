#!/usr/bin/env python3
# ---
# varnam_script: review.render_hygiene
# owner: reviewer
# status: internal
# surface: import-only
# purpose: Placeholder-string scan helpers for render gates.
# use_when: Import from preflight/postflight gates to detect placeholder text in project and template files.
# inputs: CLI args, manifests, env vars, or imports documented by argparse/docstring
# outputs: files, JSON/stdout reports, or process exit code documented by the script
# authority: scripts/README.md; scripts/SCRIPT_MAP.md
# ---
"""Non-timing render hygiene checks shared by validation wrappers."""

from __future__ import annotations

import re
from pathlib import Path


REPO_ROOT = Path(__file__).resolve().parents[2]

PLACEHOLDER_PATTERNS = [
    r"\bPENDING\b",
    r"\bTBD\b",
    r"\bTODO\b",
    r"\bFIXME\b",
    r"\bXXX\b",
    r"PENDING\s+RESEARCHER\s+CONFIRM",
    r"PLACEHOLDER",
    r"LOREM\s+IPSUM",
]


def scan_placeholder_strings(project: Path, *, repo_root: Path | None = None) -> list[str]:
    """Return `file:line:match` hits for placeholder strings in TSX/storyboard."""
    repo_root = repo_root or REPO_ROOT
    hits: list[str] = []
    roots = [
        project / "src",
        project / "direction",
        repo_root / "templates" / "projects" / project.name,
    ]
    compiled = [re.compile(pattern, re.IGNORECASE) for pattern in PLACEHOLDER_PATTERNS]
    for root in roots:
        if not root.exists():
            continue
        for path in root.rglob("*"):
            if not path.is_file():
                continue
            if path.suffix.lower() not in {".tsx", ".ts", ".md", ".txt"}:
                continue
            try:
                text = path.read_text(encoding="utf-8", errors="ignore")
            except OSError:
                continue
            for lineno, line in enumerate(text.splitlines(), 1):
                stripped = line.strip()
                if stripped.startswith("//") or stripped.startswith("#"):
                    continue
                for pattern in compiled:
                    if pattern.search(line):
                        hits.append(f"{path}:{lineno}: {line.strip()[:120]}")
                        break
    return hits
