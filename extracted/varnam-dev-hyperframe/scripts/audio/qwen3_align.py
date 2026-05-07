#!/usr/bin/env python3
# ---
# varnam_script: audio.qwen3_align
# owner: audio
# status: live
# surface: direct-only
# purpose: Local Qwen3 forced-alignment adapter.
# use_when: Align rendered speech to an exact transcript without Gemini timestamp prompting.
# inputs: Audio path plus transcript text/file, or a JSON chunk-job list
# outputs: Word timing JSON to stdout or --output-words
# authority: scripts/README.md; scripts/SCRIPT_MAP.md
# ---
"""Run Qwen3-ForcedAligner and emit Varnam words.json shape."""

from __future__ import annotations

import argparse
import json
import sys
from pathlib import Path
from typing import Any


def _load_aligner(model_name: str):
    try:
        import torch
        from qwen_asr import Qwen3ForcedAligner
    except ImportError as exc:
        raise RuntimeError(
            "Missing qwen-asr runtime. Create an isolated Python 3.12 env and install `qwen-asr`, "
            "then set QWEN_ALIGN_PYTHON=/path/to/env/bin/python."
        ) from exc

    kwargs: dict[str, Any] = {"dtype": torch.float32}
    return Qwen3ForcedAligner.from_pretrained(model_name, **kwargs)


def _read_text(args: argparse.Namespace) -> str:
    if args.text_file:
        return Path(args.text_file).read_text(encoding="utf-8")
    if args.text is not None:
        return args.text
    raise ValueError("Provide --text, --text-file, or --jobs-json")


def _to_words(result, offset: float = 0.0) -> list[dict[str, Any]]:
    words: list[dict[str, Any]] = []
    for item in result:
        start = round(max(0.0, float(item.start_time) + offset), 3)
        end = round(max(start, float(item.end_time) + offset), 3)
        words.append({"word": str(item.text), "start": start, "end": end})
    return words


def _merge_monotonic(chunks: list[list[dict[str, Any]]]) -> list[dict[str, Any]]:
    merged: list[dict[str, Any]] = []
    prev_start = 0.0
    for chunk in chunks:
        for entry in chunk:
            start = max(float(entry["start"]), prev_start)
            end = max(float(entry["end"]), start)
            merged.append({"word": str(entry.get("word", "")), "start": round(start, 3), "end": round(end, 3)})
            prev_start = start
    return merged


def _align_single(aligner, audio: str, text: str, language: str, offset: float = 0.0) -> list[dict[str, Any]]:
    result = aligner.align(audio=audio, text=text, language=language)[0]
    return _to_words(result, offset=offset)


def parse_args(argv: list[str] | None = None) -> argparse.Namespace:
    parser = argparse.ArgumentParser(description="Local Qwen3 forced alignment to Varnam words.json")
    parser.add_argument("--audio", help="Audio file for single alignment")
    parser.add_argument("--text", help="Transcript text for single alignment")
    parser.add_argument("--text-file", help="Transcript file for single alignment")
    parser.add_argument("--jobs-json", help="JSON file containing chunk jobs with audio_path, text, offset")
    parser.add_argument("--output-words", help="Write words JSON here instead of stdout")
    parser.add_argument("--model", default="Qwen/Qwen3-ForcedAligner-0.6B")
    parser.add_argument("--language", default="English")
    return parser.parse_args(argv)


def main(argv: list[str] | None = None) -> int:
    args = parse_args(argv)

    aligner = _load_aligner(args.model)
    if args.jobs_json:
        jobs = json.loads(Path(args.jobs_json).read_text(encoding="utf-8"))
        chunks = [
            _align_single(
                aligner,
                audio=str(job["audio_path"]),
                text=str(job["text"]),
                language=str(job.get("language", args.language)),
                offset=float(job.get("offset", 0.0)),
            )
            for job in jobs
        ]
        words = _merge_monotonic(chunks)
    else:
        if not args.audio:
            raise ValueError("--audio is required without --jobs-json")
        words = _align_single(aligner, args.audio, _read_text(args), args.language)

    payload = json.dumps(words, indent=2)
    if args.output_words:
        output = Path(args.output_words)
        output.parent.mkdir(parents=True, exist_ok=True)
        output.write_text(payload + "\n", encoding="utf-8")
    else:
        print(payload)
    return 0


if __name__ == "__main__":
    try:
        raise SystemExit(main())
    except Exception as exc:
        print(f"qwen3_align: {exc}", file=sys.stderr)
        raise SystemExit(1)
