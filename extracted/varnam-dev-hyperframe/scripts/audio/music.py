#!/usr/bin/env python3
# ---
# varnam_script: audio.music
# owner: audio
# status: live
# surface: python3 scripts/run.py audio:music
# purpose: Lyria background music generation entrypoint.
# use_when: Generate an authored score from a timestamped music prompt.
# inputs: CLI args, manifests, env vars, or imports documented by argparse/docstring
# outputs: files, JSON/stdout reports, or process exit code documented by the script
# authority: scripts/README.md; scripts/SCRIPT_MAP.md
# ---
"""
Generate music via Lyria 3 Pro (Google Generative AI).

Usage:
  python3 scripts/audio/music.py \
    --prompt-file path/to/prompt.txt \
    --output path/to/output.mp3 \
    --model lyria-3-pro-preview

The script reads GOOGLE_API_KEY from the repo .env file.
Output is a 48kHz stereo MP3 (192kbps) with SynthID watermark.
"""

from __future__ import annotations

import argparse
import base64
import json
import sys
from pathlib import Path

SCRIPT_DIR = Path(__file__).resolve().parent
if str(SCRIPT_DIR) not in sys.path:
    sys.path.insert(0, str(SCRIPT_DIR))

from common import fail, require_env


def generate(prompt: str, model: str, output_path: Path) -> dict:
    try:
        from google import genai
        from google.genai import types
    except ImportError:
        fail("Missing google-genai. pip install google-genai")

    try:
        api_key = require_env("GOOGLE_API_KEY")
    except RuntimeError as exc:
        fail(str(exc))

    client = genai.Client(api_key=api_key)

    print(f"Generating with {model}...", file=sys.stderr)
    print(f"Prompt preview: {prompt[:120]}...", file=sys.stderr)

    response = client.models.generate_content(
        model=model,
        contents=prompt,
        config=types.GenerateContentConfig(
            response_modalities=["AUDIO"],
        ),
    )

    # Extract audio data from response
    # Lyria returns audio in candidate.content.parts as inline_data Blob.
    # The data field is already raw bytes (not base64).
    audio_data: bytes | None = None
    mime_type: str | None = None

    if hasattr(response, "candidates") and response.candidates:
        candidate = response.candidates[0]
        if hasattr(candidate, "content") and candidate.content:
            for part in candidate.content.parts:
                blob = getattr(part, "inline_data", None)
                if blob is None:
                    continue
                data = getattr(blob, "data", None)
                if not data:
                    continue
                # data is raw bytes from Lyria (not base64)
                audio_data = data if isinstance(data, bytes) else base64.b64decode(data)
                mime_type = getattr(blob, "mime_type", None)
                break

    if audio_data is None:
        fail(
            f"No audio data found in Lyria response. "
            f"Response type: {type(response).__name__}. "
            f"Check model name and API key."
        )

    output_path.parent.mkdir(parents=True, exist_ok=True)
    raw_bytes = audio_data

    output_path.write_bytes(raw_bytes)
    print(f"Written {len(raw_bytes)} bytes to {output_path}", file=sys.stderr)

    return {
        "status": "ok",
        "output": str(output_path),
        "mime_type": mime_type,
        "bytes": len(raw_bytes),
    }


def parse_args(argv: list[str] | None = None) -> argparse.Namespace:
    parser = argparse.ArgumentParser(description="Generate music via Lyria 3 Pro")
    parser.add_argument("--prompt-file", required=True, help="Path to text file containing the Lyria prompt")
    parser.add_argument("--output", required=True, help="Output MP3 path")
    parser.add_argument(
        "--model",
        default="lyria-3-pro-preview",
        choices=["lyria-3-pro-preview", "lyria-3-clip-preview"],
        help="Lyria model to use",
    )
    return parser.parse_args(argv)


def main(argv: list[str] | None = None) -> int:
    args = parse_args(argv)

    prompt_path = Path(args.prompt_file).expanduser().resolve()
    if not prompt_path.exists():
        fail(f"Prompt file not found: {prompt_path}")

    prompt = prompt_path.read_text(encoding="utf-8")
    output_path = Path(args.output).expanduser().resolve()

    result = generate(prompt, args.model, output_path)
    print(json.dumps(result))
    return 0


if __name__ == "__main__":
    raise SystemExit(main())
