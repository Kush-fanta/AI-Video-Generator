#!/usr/bin/env python3
# ---
# varnam_script: audio.quota_probe
# owner: audio
# status: live
# surface: direct-only
# purpose: Provider quota probe.
# use_when: Check quota before known-expensive audio dispatch.
# inputs: CLI args, manifests, env vars, or imports documented by argparse/docstring
# outputs: files, JSON/stdout reports, or process exit code documented by the script
# authority: scripts/README.md; scripts/SCRIPT_MAP.md
# ---
"""Pre-dispatch ElevenLabs quota probe.

Counts spoken characters in the audio source file, queries the ElevenLabs
subscription endpoint for remaining credits, and exits non-zero (with a named
shortfall) if credits < chars * (1 + margin).

Run this BEFORE dispatching the `audio` subagent. Discovering a quota cliff
five minutes into TTS costs real dollars and stalls the pipeline.

Exit codes:
  0 — quota sufficient (remaining >= chars * (1 + margin))
  1 — quota insufficient (shortfall reported on stderr)
  2 — configuration error (no api key, source missing, API error)
"""

from __future__ import annotations

import argparse
import json
import re
import sys
import urllib.error
import urllib.request
from pathlib import Path

SCRIPTS_DIR = Path(__file__).resolve().parents[1]
SHARED_DIR = SCRIPTS_DIR / "shared"
if str(SHARED_DIR) not in sys.path:
    sys.path.insert(0, str(SHARED_DIR))

from env_file import get_env


ELEVEN_USER_URL = "https://api.elevenlabs.io/v1/user/subscription"
DEFAULT_MARGIN = 0.10
DEFAULT_SOURCE = "audio/voiceover.source.txt"


def _find_project_root(start: Path) -> Path:
    for candidate in [start, *start.parents]:
        if (candidate / "task-config.md").is_file():
            return candidate
    raise SystemExit(
        f"no project root found above {start} (no task-config.md ancestor)"
    )


def count_spoken_chars(path: Path) -> int:
    text = path.read_text(encoding="utf-8")
    stripped = re.sub(r"\[[^\]]*\]", "", text)
    collapsed = re.sub(r"\s+", " ", stripped).strip()
    return len(collapsed)


class QuotaProbeError(Exception):
    """Configuration / transport problem — map to exit code 2 in main()."""


def fetch_remaining_credits(api_key: str) -> int:
    req = urllib.request.Request(
        ELEVEN_USER_URL,
        headers={"xi-api-key": api_key, "Accept": "application/json"},
    )
    try:
        with urllib.request.urlopen(req, timeout=15) as response:
            payload = json.loads(response.read().decode("utf-8"))
    except urllib.error.HTTPError as exc:
        raise QuotaProbeError(f"elevenlabs API error {exc.code}: {exc.reason}")
    except urllib.error.URLError as exc:
        raise QuotaProbeError(f"elevenlabs API unreachable: {exc.reason}")
    try:
        limit = int(payload["character_limit"])
        used = int(payload["character_count"])
    except (KeyError, TypeError, ValueError) as exc:
        raise QuotaProbeError(f"elevenlabs subscription payload unexpected: {exc}")
    return max(limit - used, 0)


def parse_args(argv: list[str] | None = None) -> argparse.Namespace:
    parser = argparse.ArgumentParser(description=__doc__.splitlines()[0])
    parser.add_argument(
        "source",
        nargs="?",
        default=DEFAULT_SOURCE,
        help="source text relative to project root (default: %(default)s)",
    )
    parser.add_argument(
        "--margin",
        type=float,
        default=DEFAULT_MARGIN,
        help="headroom multiplier (default: %(default)s)",
    )
    return parser.parse_args(argv)


def main(argv: list[str] | None = None) -> int:
    args = parse_args(argv)

    api_key = get_env("ELEVEN_LABS_API_KEY")
    if not api_key:
        print("ELEVEN_LABS_API_KEY not set in repo .env", file=sys.stderr)
        return 2

    project_root = _find_project_root(Path.cwd())
    source_path = project_root / args.source
    if not source_path.is_file():
        print(f"source not found: {source_path}", file=sys.stderr)
        return 2

    chars = count_spoken_chars(source_path)
    required = int(chars * (1 + args.margin))
    try:
        remaining = fetch_remaining_credits(api_key)
    except QuotaProbeError as exc:
        print(str(exc), file=sys.stderr)
        return 2

    if remaining >= required:
        print(
            f"ok source={args.source} chars={chars} "
            f"remaining={remaining} margin={args.margin:.0%}"
        )
        return 0

    shortfall = required - remaining
    print(
        f"quota_insufficient_for_scope: source={args.source} chars={chars} "
        f"required_with_margin={required} remaining={remaining} shortfall={shortfall}",
        file=sys.stderr,
    )
    return 1


if __name__ == "__main__":
    raise SystemExit(main())
