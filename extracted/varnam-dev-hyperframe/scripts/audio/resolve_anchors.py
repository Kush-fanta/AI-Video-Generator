#!/usr/bin/env python3
# ---
# varnam_script: audio.resolve_anchors
# owner: mograph
# status: live
# surface: direct-only
# purpose: VO anchor to global frame resolver.
# use_when: Bind animation events to word anchors deterministically.
# inputs: CLI args, manifests, env vars, or imports documented by argparse/docstring
# outputs: files, JSON/stdout reports, or process exit code documented by the script
# authority: scripts/README.md; scripts/SCRIPT_MAP.md
# ---
"""Resolve timing events to global frames from words.json anchors."""

from __future__ import annotations

import argparse
import json
import re
import sys
from pathlib import Path
from typing import Any


def normalize_word(raw: str) -> str:
    lowered = raw.lower().strip()
    return re.sub(r"[^\w]+", "", lowered, flags=re.UNICODE)


def resolve_vo_anchor(
    words: list[dict[str, Any]],
    *,
    word: str,
    occurrence: int,
    fps: int,
    offset_frames: int = 0,
) -> tuple[int, float]:
    if occurrence < 1:
        raise ValueError(f"occurrence must be >= 1, got {occurrence}")
    target = normalize_word(word)
    if not target:
        raise ValueError("anchor word is empty after normalization")

    count = 0
    for entry in words:
        token = normalize_word(str(entry.get("word", "")))
        if token != target:
            continue
        count += 1
        if count == occurrence:
            start = float(entry["start"])
            frame = round(start * fps) + offset_frames
            if frame < 0:
                frame = 0
            return frame, start
    raise ValueError(f"word anchor not found: word={word!r}, occurrence={occurrence}")


def _load_events(path: Path) -> list[dict[str, Any]]:
    payload = json.loads(path.read_text(encoding="utf-8"))
    if isinstance(payload, list):
        return payload
    if isinstance(payload, dict) and isinstance(payload.get("events"), list):
        return payload["events"]
    raise ValueError("events must be a list or object with an 'events' list")


def _load_words(path: Path) -> list[dict[str, Any]]:
    payload = json.loads(path.read_text(encoding="utf-8"))
    if not isinstance(payload, list):
        raise ValueError("words payload must be a list")
    return payload


def resolve_events(
    events: list[dict[str, Any]], words: list[dict[str, Any]], fps: int
) -> list[dict[str, Any]]:
    resolved: list[dict[str, Any]] = []
    for idx, event in enumerate(events):
        if not isinstance(event, dict):
            raise ValueError(f"event[{idx}] is not an object")
        event_id = str(event.get("id") or event.get("event_id") or f"event_{idx + 1}")
        timing_mode = event.get("timing_mode")
        if timing_mode not in {"vo", "scene"}:
            raise ValueError(f"{event_id}: invalid timing_mode {timing_mode!r}")

        if timing_mode == "scene":
            scene = event.get("scene")
            if not isinstance(scene, dict):
                raise ValueError(f"{event_id}: scene payload missing")
            if "globalFrame" not in scene:
                raise ValueError(f"{event_id}: scene.globalFrame missing")
            global_frame = int(scene["globalFrame"])
            if global_frame < 0:
                raise ValueError(f"{event_id}: scene.globalFrame must be >= 0")
            resolved.append(
                {
                    "id": event_id,
                    "timing_mode": "scene",
                    "source": {"globalFrame": global_frame},
                    "resolved": {"globalFrame": global_frame},
                }
            )
            continue

        vo = event.get("vo")
        if not isinstance(vo, dict):
            raise ValueError(f"{event_id}: vo payload missing")
        if "word" not in vo or "occurrence" not in vo:
            raise ValueError(f"{event_id}: vo.word and vo.occurrence are required")
        word = str(vo["word"])
        occurrence = int(vo["occurrence"])
        offset_frames = int(vo.get("offsetFrames", 0))

        global_frame, timestamp = resolve_vo_anchor(
            words,
            word=word,
            occurrence=occurrence,
            fps=fps,
            offset_frames=offset_frames,
        )
        resolved.append(
            {
                "id": event_id,
                "timing_mode": "vo",
                "source": {
                    "word": word,
                    "occurrence": occurrence,
                    "offsetFrames": offset_frames,
                    "timestamp": round(timestamp, 3),
                },
                "resolved": {"globalFrame": global_frame},
            }
        )
    return resolved


def parse_args(argv: list[str] | None = None) -> argparse.Namespace:
    parser = argparse.ArgumentParser(
        description="Resolve VO/scene timing events into globalFrame values."
    )
    parser.add_argument("--events", required=True, help="Path to timing events JSON")
    parser.add_argument("--words", required=True, help="Path to voiceover.words.json")
    parser.add_argument("--fps", type=int, default=30)
    parser.add_argument("--out", required=True, help="Output path for resolved JSON")
    return parser.parse_args(argv)


def main(argv: list[str] | None = None) -> int:
    args = parse_args(argv)
    events_path = Path(args.events).expanduser().resolve()
    words_path = Path(args.words).expanduser().resolve()
    out_path = Path(args.out).expanduser().resolve()

    try:
        events = _load_events(events_path)
        words = _load_words(words_path)
        resolved_events = resolve_events(events, words, args.fps)
    except Exception as exc:  # noqa: BLE001
        payload = {"status": "error", "error": str(exc)}
        json.dump(payload, sys.stdout, indent=2)
        sys.stdout.write("\n")
        return 1

    out_path.parent.mkdir(parents=True, exist_ok=True)
    payload = {
        "status": "ok",
        "fps": args.fps,
        "event_count": len(resolved_events),
        "resolved_events": resolved_events,
    }
    out_path.write_text(json.dumps(payload, indent=2), encoding="utf-8")
    json.dump(payload, sys.stdout, indent=2)
    sys.stdout.write("\n")
    return 0


if __name__ == "__main__":
    raise SystemExit(main())
