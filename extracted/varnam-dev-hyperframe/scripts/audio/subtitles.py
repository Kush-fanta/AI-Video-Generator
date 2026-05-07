#!/usr/bin/env python3
# ---
# varnam_script: audio.subtitles
# owner: audio
# status: live
# surface: direct-only
# purpose: Words JSON to SRT subtitle converter.
# use_when: Emit subtitles from canonical word timing artifacts.
# inputs: CLI args, manifests, env vars, or imports documented by argparse/docstring
# outputs: files, JSON/stdout reports, or process exit code documented by the script
# authority: scripts/README.md; scripts/SCRIPT_MAP.md
# ---
"""Generic subtitle helpers for audio pipelines."""

from __future__ import annotations

import argparse
import json
import re
from pathlib import Path


def format_srt_time(seconds: float) -> str:
    hours = int(seconds // 3600)
    minutes = int((seconds % 3600) // 60)
    secs = int(seconds % 60)
    millis = int((seconds % 1) * 1000)
    return f"{hours:02d}:{minutes:02d}:{secs:02d},{millis:03d}"


def words_to_srt(text: str, words: list[dict], output_path: str) -> None:
    sentences = [s for s in re.split(r"(?<=[.!?])\s+", text.strip()) if s.strip()]

    srt_lines = []
    word_idx = 0

    for i, sentence in enumerate(sentences):
        word_count = len(sentence.split())
        if not word_count or word_idx >= len(words):
            continue

        sent_start = words[word_idx]["start"]
        sent_end = sent_start
        for _ in range(word_count):
            if word_idx < len(words):
                sent_end = words[word_idx]["end"]
                word_idx += 1

        srt_lines.append(f"{i + 1}")
        srt_lines.append(f"{format_srt_time(sent_start)} --> {format_srt_time(sent_end)}")
        srt_lines.append(sentence)
        srt_lines.append("")

    with open(output_path, "w", encoding="utf-8") as handle:
        handle.write("\n".join(srt_lines))


def parse_args(argv: list[str] | None = None) -> argparse.Namespace:
    parser = argparse.ArgumentParser(description="Build sentence-level SRT from words.json and source text")
    parser.add_argument("--text-file", required=True, help="Path to source text")
    parser.add_argument("--words", required=True, help="Path to words.json")
    parser.add_argument("--output", required=True, help="Output .srt path")
    return parser.parse_args(argv)


def main(argv: list[str] | None = None) -> int:
    args = parse_args(argv)

    text = Path(args.text_file).read_text(encoding="utf-8")
    with open(args.words, "r", encoding="utf-8") as handle:
        words = json.load(handle)
    words_to_srt(text, words, args.output)
    return 0


if __name__ == "__main__":
    raise SystemExit(main())
