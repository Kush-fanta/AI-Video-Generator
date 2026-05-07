#!/usr/bin/env python3
# ---
# varnam_script: audio.tts
# owner: audio
# status: live
# surface: direct-only
# purpose: Provider text-to-speech primitive.
# use_when: Use under voiceover workflows or for low-level TTS debugging.
# inputs: CLI args, manifests, env vars, or imports documented by argparse/docstring
# outputs: files, JSON/stdout reports, or process exit code documented by the script
# authority: scripts/README.md; scripts/SCRIPT_MAP.md
# ---
"""Text-to-speech primitives for audio pipelines."""

from __future__ import annotations

import argparse
import base64
import json
import re
import shutil
import subprocess
import sys
import urllib.error
import urllib.request
from pathlib import Path
from typing import Any

SCRIPT_DIR = Path(__file__).resolve().parent
if str(SCRIPT_DIR) not in sys.path:
    sys.path.insert(0, str(SCRIPT_DIR))
SCRIPTS_DIR = SCRIPT_DIR.parent
SHARED_DIR = SCRIPTS_DIR / "shared"
if str(SHARED_DIR) not in sys.path:
    sys.path.insert(0, str(SHARED_DIR))

from common import fail, gemini_safety_settings, require_env
from align_audio import get_audio_duration
from provider_registry import (
    DEFAULT_AUDIO_PROVIDER,
    audio_default_model as default_model,
    audio_default_stability as default_stability,
    audio_default_voice as default_voice,
    audio_provider_choices as provider_choices,
)


SENTENCE_BOUNDARY_RE = re.compile(r"(?<=[.!?…])\s+")


def _split_oversized_paragraph(paragraph: str, max_chars: int) -> list[str]:
    pieces: list[str] = []
    current = ""
    for sentence in SENTENCE_BOUNDARY_RE.split(paragraph.strip()):
        sentence = sentence.strip()
        if not sentence:
            continue
        if current and len(current) + len(sentence) + 1 > max_chars:
            pieces.append(current.strip())
            current = sentence
        else:
            current = f"{current} {sentence}".strip() if current else sentence
    if current:
        pieces.append(current.strip())
    return pieces or [paragraph.strip()]


def chunk_text(text: str, max_chars: int = 4500) -> list[str]:
    paragraphs = [para.strip() for para in text.strip().split("\n\n") if para.strip()]
    units: list[str] = []
    for paragraph in paragraphs:
        if len(paragraph) <= max_chars:
            units.append(paragraph)
        else:
            units.extend(_split_oversized_paragraph(paragraph, max_chars))

    chunks: list[str] = []
    current = ""
    for unit in units:
        if current and len(current) + len(unit) + 2 > max_chars:
            chunks.append(current.strip())
            current = unit
        else:
            current = current + "\n\n" + unit if current else unit
    if current.strip():
        chunks.append(current.strip())
    return chunks


def resolve_voice(client: Any, voice_input: str) -> str:
    if len(voice_input) >= 20 and voice_input.isalnum():
        return voice_input

    voices = client.voices.get_all()
    voice_lower = voice_input.lower()
    for voice in voices.voices:
        base_name = voice.name.split(" - ")[0].strip().lower()
        if base_name == voice_lower:
            print(f"Voice: {voice_input} -> {voice.name} ({voice.voice_id})", file=sys.stderr)
            return voice.voice_id
    for voice in voices.voices:
        if voice.name.lower().startswith(voice_lower):
            print(f"Voice: {voice_input} -> {voice.name} ({voice.voice_id})", file=sys.stderr)
            return voice.voice_id

    print(f"Warning: voice '{voice_input}' not found, passing as voice_id", file=sys.stderr)
    return voice_input


def list_elevenlabs_voices() -> None:
    try:
        from elevenlabs import ElevenLabs
    except ImportError:
        fail("Missing elevenlabs. pip install elevenlabs")

    try:
        api_key = require_env("ELEVEN_LABS_API_KEY")
    except RuntimeError as exc:
        fail(str(exc))

    client = ElevenLabs(api_key=api_key)
    voices = client.voices.get_all()
    print(f"\n{'Name':<30} {'Voice ID':<25} {'Labels'}")
    print("-" * 90)
    for voice in voices.voices:
        labels = ", ".join(f"{k}={v}" for k, v in (voice.labels or {}).items())
        print(f"{voice.name:<30} {voice.voice_id:<25} {labels}")
    print(f"\nTotal: {len(voices.voices)} voices")


def _cleanup_payload(output_path: Path, chunk_files: list[Path], tmp_dir: Path | None = None, extra_files: list[Path] | None = None) -> dict:
    cleanup_files = [str(path) for path in chunk_files]
    if extra_files:
        cleanup_files.extend(str(path) for path in extra_files)
    cleanup_dirs = [str(tmp_dir)] if tmp_dir else []
    return {
        "audio": str(output_path),
        "chunk_alignment_jobs": [],
        "native_alignment_words": [],
        "cleanup_files": cleanup_files,
        "cleanup_dirs": cleanup_dirs,
    }


def _alignment_to_words(alignment: dict | None, offset: float = 0.0, speed: float | None = None) -> list[dict]:
    if not alignment:
        return []

    characters = alignment.get("characters") or []
    starts = alignment.get("character_start_times_seconds") or []
    ends = alignment.get("character_end_times_seconds") or []
    if not characters or len(characters) != len(starts) or len(characters) != len(ends):
        return []

    text = "".join(str(ch) for ch in characters)
    time_scale = 1.0 / speed if speed and speed > 0 and abs(speed - 1.0) > 1e-9 else 1.0
    words: list[dict] = []
    for match in re.finditer(r"\S+", text):
        span_starts = [float(starts[i]) for i in range(match.start(), match.end()) if starts[i] is not None]
        span_ends = [float(ends[i]) for i in range(match.start(), match.end()) if ends[i] is not None]
        if not span_starts or not span_ends:
            continue
        start = offset + min(span_starts) * time_scale
        end = offset + max(span_ends) * time_scale
        words.append(
            {
                "word": match.group(0),
                "start": round(max(0.0, start), 3),
                "end": round(max(0.0, end), 3),
            }
        )
    return words


def _shift_words(words: list[dict], offset_seconds: float) -> list[dict]:
    shifted = []
    for word in words:
        shifted.append(
            {
                "word": str(word.get("word", "")),
                "start": round(max(0.0, float(word["start"]) + offset_seconds), 3),
                "end": round(max(0.0, float(word["end"]) + offset_seconds), 3),
            }
        )
    return shifted


def _elevenlabs_tts_with_timestamps(
    *,
    api_key: str,
    voice_id: str,
    text: str,
    model: str,
    voice_settings: dict,
    previous_text: str | None = None,
    next_text: str | None = None,
) -> tuple[bytes, list[dict]]:
    url = f"https://api.elevenlabs.io/v1/text-to-speech/{voice_id}/with-timestamps?output_format=mp3_44100_128"
    payload = {
        "text": text,
        "model_id": model,
        "voice_settings": voice_settings,
    }
    supports_text_context = model != "eleven_v3"
    if previous_text and supports_text_context:
        payload["previous_text"] = previous_text
    if next_text and supports_text_context:
        payload["next_text"] = next_text
    req = urllib.request.Request(
        url,
        data=json.dumps(payload).encode("utf-8"),
        headers={
            "xi-api-key": api_key,
            "Content-Type": "application/json",
            "Accept": "application/json",
        },
        method="POST",
    )
    try:
        with urllib.request.urlopen(req, timeout=180) as response:
            data = json.loads(response.read().decode("utf-8"))
    except urllib.error.HTTPError as exc:
        detail = exc.read().decode("utf-8", errors="replace")
        raise RuntimeError(f"ElevenLabs timestamp TTS failed ({exc.code}): {detail}") from exc
    except urllib.error.URLError as exc:
        raise RuntimeError(f"ElevenLabs timestamp TTS unreachable: {exc.reason}") from exc

    audio_b64 = data.get("audio_base64")
    if not audio_b64:
        raise RuntimeError("ElevenLabs timestamp TTS returned no audio_base64")
    alignment = data.get("normalized_alignment") or data.get("alignment")
    return base64.b64decode(audio_b64), _alignment_to_words(alignment)


def generate_gemini_tts(text: str, output_path: str, voice: str = "Kore", model: str = "gemini-2.5-pro-preview-tts") -> dict:
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
    output = Path(output_path)
    output.parent.mkdir(parents=True, exist_ok=True)
    chunks = chunk_text(text) if len(text) > 4500 else [text]
    print(f"Generating with Gemini TTS ({model}, voice={voice}, chunks={len(chunks)})...", file=sys.stderr)

    def generate_chunk(chunk_text_value: str) -> bytes:
        response = client.models.generate_content(
            model=model,
            contents=chunk_text_value,
            config=types.GenerateContentConfig(
                response_modalities=["AUDIO"],
                safety_settings=gemini_safety_settings(types),
                speech_config=types.SpeechConfig(
                    voice_config=types.VoiceConfig(
                        prebuilt_voice_config=types.PrebuiltVoiceConfig(voice_name=voice)
                    )
                ),
            ),
        )
        data = response.candidates[0].content.parts[0].inline_data.data
        if not data:
            fail("Gemini TTS returned empty audio for chunk")
        return data

    chunk_files: list[Path] = []
    chunk_jobs: list[dict] = []
    tmp_dir: Path | None = None
    extra_files: list[Path] = []

    if len(chunks) == 1:
        raw_path = output.with_suffix(".pcm")
        with open(raw_path, "wb") as handle:
            handle.write(generate_chunk(chunks[0]))
        subprocess.run(
            ["ffmpeg", "-y", "-f", "s16le", "-ar", "24000", "-ac", "1", "-i", str(raw_path), "-codec:a", "libmp3lame", "-b:a", "128k", str(output)],
            capture_output=True,
            check=True,
        )
        raw_path.unlink()
    else:
        tmp_dir = output.parent / ".tts_chunks"
        tmp_dir.mkdir(exist_ok=True)
        for i, chunk in enumerate(chunks):
            print(f"  Chunk {i+1}/{len(chunks)} ({len(chunk)} chars)...", file=sys.stderr)
            pcm_path = tmp_dir / f"chunk_{i:03d}.pcm"
            chunk_path = tmp_dir / f"chunk_{i:03d}.mp3"
            with open(pcm_path, "wb") as handle:
                handle.write(generate_chunk(chunk))
            subprocess.run(
                ["ffmpeg", "-y", "-f", "s16le", "-ar", "24000", "-ac", "1", "-i", str(pcm_path), "-codec:a", "libmp3lame", "-b:a", "128k", str(chunk_path)],
                capture_output=True,
                check=True,
            )
            pcm_path.unlink()
            chunk_files.append(chunk_path)

        offset = 0.0
        for i, chunk_path in enumerate(chunk_files):
            chunk_jobs.append({"index": i, "audio_path": chunk_path, "text": chunks[i], "offset": offset})
            offset += get_audio_duration(str(chunk_path))

        concat_list = tmp_dir / "concat.txt"
        with open(concat_list, "w", encoding="utf-8") as handle:
            for chunk_path in chunk_files:
                handle.write(f"file '{chunk_path.resolve()}'\n")
        subprocess.run(
            ["ffmpeg", "-y", "-f", "concat", "-safe", "0", "-i", str(concat_list), "-codec:a", "libmp3lame", "-b:a", "128k", str(output)],
            capture_output=True,
            check=True,
        )
        extra_files.append(concat_list)

    payload = _cleanup_payload(output, chunk_files, tmp_dir=tmp_dir, extra_files=extra_files)
    payload["chunk_alignment_jobs"] = chunk_jobs
    return payload


def generate_elevenlabs_tts(
    text: str,
    output_path: str,
    voice: str = "George",
    model: str = "eleven_v3",
    speed: float | None = None,
    stability: str = "natural",
    allow_audio_only: bool = False,
) -> dict:
    try:
        from elevenlabs import ElevenLabs
    except ImportError:
        fail("Missing elevenlabs. pip install elevenlabs")

    try:
        api_key = require_env("ELEVEN_LABS_API_KEY")
    except RuntimeError as exc:
        fail(str(exc))

    client = ElevenLabs(api_key=api_key)
    output = Path(output_path)
    output.parent.mkdir(parents=True, exist_ok=True)
    voice_id = resolve_voice(client, voice)
    stability_map = {"creative": 0.15, "natural": 0.45, "robust": 0.85}
    voice_settings = {
        "stability": stability_map.get(stability, 0.45),
        "similarity_boost": 0.75,
        "style": 0.0,
        "use_speaker_boost": True,
    }

    chunks = chunk_text(text) if len(text) > 4500 else [text]
    print(f"Generating with {model} (stability={stability}, speed={speed or 'default'}, chunks={len(chunks)})...", file=sys.stderr)

    chunk_files: list[Path] = []
    chunk_jobs: list[dict] = []
    native_words: list[dict] = []
    tmp_dir: Path | None = None

    if len(chunks) == 1:
        try:
            audio_bytes, native_words = _elevenlabs_tts_with_timestamps(
                api_key=api_key,
                voice_id=voice_id,
                text=chunks[0],
                model=model,
                voice_settings=voice_settings,
            )
        except RuntimeError as exc:
            if not allow_audio_only:
                raise
            print(f"[tts] ElevenLabs timestamp endpoint unavailable ({exc}); using audio-only TTS.", file=sys.stderr)
            audio_generator = client.text_to_speech.convert(
                voice_id=voice_id,
                text=chunks[0],
                model_id=model,
                output_format="mp3_44100_128",
                voice_settings=voice_settings,
            )
            audio_bytes = b"".join(audio_generator)
        if not audio_bytes:
            fail("ElevenLabs returned empty audio")
        raw_path = output.with_stem(output.stem + "_raw") if speed is not None else output
        with open(raw_path, "wb") as handle:
            handle.write(audio_bytes)
    else:
        tmp_dir = output.parent / ".tts_chunks"
        tmp_dir.mkdir(exist_ok=True)
        offset = 0.0
        for i, chunk in enumerate(chunks):
            print(f"  Chunk {i+1}/{len(chunks)} ({len(chunk)} chars)...", file=sys.stderr)
            chunk_native_words: list[dict] = []
            try:
                chunk_bytes, chunk_native_words = _elevenlabs_tts_with_timestamps(
                    api_key=api_key,
                    voice_id=voice_id,
                    text=chunk,
                    model=model,
                    voice_settings=voice_settings,
                    previous_text=chunks[i - 1] if i > 0 else None,
                    next_text=chunks[i + 1] if i + 1 < len(chunks) else None,
                )
            except RuntimeError as exc:
                if not allow_audio_only:
                    raise
                print(f"[tts] ElevenLabs timestamp endpoint unavailable for chunk {i+1} ({exc}); using audio-only TTS.", file=sys.stderr)
                generator = client.text_to_speech.convert(
                    voice_id=voice_id,
                    text=chunk,
                    model_id=model,
                    output_format="mp3_44100_128",
                    voice_settings=voice_settings,
                )
                chunk_bytes = b"".join(generator)
            if not chunk_bytes:
                fail(f"ElevenLabs returned empty audio for chunk {i+1}")
            chunk_path = tmp_dir / f"chunk_{i:03d}.mp3"
            with open(chunk_path, "wb") as handle:
                handle.write(chunk_bytes)
            chunk_files.append(chunk_path)
            chunk_duration = get_audio_duration(str(chunk_path))
            if speed is None or abs(speed - 1.0) < 1e-9:
                chunk_jobs.append({"index": i, "audio_path": chunk_path, "text": chunks[i], "offset": offset})
            native_words.extend(_shift_words(chunk_native_words, offset))
            offset += chunk_duration

        raw_path = output.with_stem(output.stem + "_raw") if speed is not None else output
        with open(raw_path, "wb") as handle:
            for chunk_path in chunk_files:
                handle.write(chunk_path.read_bytes())

    if speed is not None and speed != 1.0:
        ffmpeg_bin = shutil.which("ffmpeg") or "/opt/homebrew/Cellar/ffmpeg/8.0.1/bin/ffmpeg"
        print(f"Applying speed: {speed}x via ffmpeg atempo...", file=sys.stderr)
        subprocess.run(
            [ffmpeg_bin, "-y", "-i", str(raw_path), "-filter:a", f"atempo={speed}", str(output)],
            capture_output=True,
            check=True,
        )
        raw_path.unlink()

    payload = _cleanup_payload(output, chunk_files, tmp_dir=tmp_dir)
    payload["chunk_alignment_jobs"] = chunk_jobs
    if native_words and speed is not None and speed != 1.0:
        native_words = [
            {**word, "start": round(float(word["start"]) / speed, 3), "end": round(float(word["end"]) / speed, 3)}
            for word in native_words
        ]
    payload["native_alignment_words"] = native_words
    return payload


def generate_tts(
    *,
    provider: str,
    text: str,
    output_path: str,
    voice: str | None = None,
    model: str | None = None,
    speed: float | None = None,
    stability: str | None = None,
    emotion: str | None = None,
    allow_audio_only: bool = False,
) -> dict:
    resolved_voice = voice or default_voice(provider)
    resolved_model = model or default_model(provider)

    if provider == "gemini":
        return generate_gemini_tts(text=text, output_path=output_path, voice=resolved_voice, model=resolved_model)
    return generate_elevenlabs_tts(
        text=text,
        output_path=output_path,
        voice=resolved_voice,
        model=resolved_model,
        speed=speed,
        stability=stability or default_stability(provider),
        allow_audio_only=allow_audio_only,
    )


def _read_text_input(text_value: str | None, text_file: str | None) -> str:
    if text_file:
        return Path(text_file).read_text(encoding="utf-8")
    if text_value is not None:
        return text_value
    raise ValueError("Either --text or --text-file is required")


def parse_args(argv: list[str] | None = None) -> argparse.Namespace:
    parser = argparse.ArgumentParser(description="Generic TTS entrypoint for Gemini and ElevenLabs")
    parser.add_argument("--text", help="Text to synthesize")
    parser.add_argument("--text-file", help="Read text from file instead")
    parser.add_argument("--output", required=True, help="Output audio path")
    parser.add_argument("--provider", default=DEFAULT_AUDIO_PROVIDER, choices=list(provider_choices()))
    parser.add_argument("--voice", help="Voice name or ID")
    parser.add_argument("--model", help="Provider model")
    parser.add_argument("--speed", type=float, default=None)
    parser.add_argument("--stability", default=None)
    parser.add_argument("--emotion", default=None)
    parser.add_argument(
        "--allow-audio-only",
        action="store_true",
        help="Allow ElevenLabs audio-only fallback if the timestamp endpoint fails. Production voiceover should not use this.",
    )
    parser.add_argument("--voice-list", action="store_true", help="List ElevenLabs voices and exit")
    return parser.parse_args(argv)


def main(argv: list[str] | None = None) -> int:
    args = parse_args(argv)

    if args.voice_list:
        list_elevenlabs_voices()
        return 0

    text = _read_text_input(args.text, args.text_file)
    result = generate_tts(
        provider=args.provider,
        text=text,
        output_path=args.output,
        voice=args.voice,
        model=args.model,
        speed=args.speed,
        stability=args.stability,
        emotion=args.emotion,
        allow_audio_only=args.allow_audio_only,
    )
    print(json.dumps({"status": "ok", "audio": result["audio"]}, indent=2))
    return 0


if __name__ == "__main__":
    raise SystemExit(main())
