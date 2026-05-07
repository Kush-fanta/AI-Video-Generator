#!/usr/bin/env python3
# ---
# varnam_script: audio.voiceover
# owner: audio
# status: live
# surface: python3 scripts/run.py audio:voiceover
# purpose: Canonical VO generation pipeline with alignment/subtitle outputs.
# use_when: Generate or batch voiceover artifacts for a project.
# inputs: CLI args, manifests, env vars, or imports documented by argparse/docstring
# outputs: files, JSON/stdout reports, or process exit code documented by the script
# authority: scripts/README.md; scripts/SCRIPT_MAP.md
# ---
"""Voiceover orchestration: TTS + alignment + subtitles."""

from __future__ import annotations

import argparse
import json
import re
import sys
from pathlib import Path

ROOT = Path(__file__).resolve().parents[1]
if str(ROOT) not in sys.path:
    sys.path.insert(0, str(ROOT))
SHARED_DIR = ROOT / "shared"
if str(SHARED_DIR) not in sys.path:
    sys.path.insert(0, str(SHARED_DIR))

SCRIPT_DIR = Path(__file__).resolve().parent
if str(SCRIPT_DIR) not in sys.path:
    sys.path.insert(0, str(SCRIPT_DIR))

from _job_utils import load_manifest, print_json, resolve_path, select_jobs
from align_audio import clean_alignment_text, run_alignment
from provider_registry import (
    DEFAULT_AUDIO_PROVIDER,
    DEFAULT_ALIGNMENT_ENGINE,
    DEFAULT_TRANSCRIPT_MODEL,
    DEFAULT_TRANSCRIPT_RERUN_MODEL,
    audio_default_model as default_model,
    audio_default_stability as default_stability,
    audio_default_voice as default_voice,
    audio_provider_choices as provider_choices,
    audio_provider_spec as provider_spec,
)
from tts import generate_tts, list_elevenlabs_voices


_TRANSLITERATED_PATTERNS = [
    (r"\b(kya|kaise|kahan|kyun|kyunki|lekin|aur|nahi|hai|hain|tha|thi|mein|se|ko|ka|ki|ke|par|bhi|yeh|woh|jab|tab|toh|abhi|sabhi|kuch|bahut|achha|theek|arre|dekho|suno|chalo|bhai|yaar|ji)\b", "Hindi", "देवनागरी"),
    (r"\b(kehte|kehta|karenge|karega|karegi|samajh|samjho|sochna|socho|bolte|bolta|dikhao|dikhaata|paanch|chaar|teen|ek|lakh|crore|rupaye|rupee)\b", "Hindi", "देवनागरी"),
    (r"\b(kemiti|kana|hele|nahi|achi|thila|heuchi|kari|kariba|dekha|dekhiba|bhai|mane)\b", "Odia", "ଓଡ଼ିଆ"),
    (r"\b(enna|epdi|inga|anga|illai|irukku|irukken|panna|pannunga|vanakkam|nandri)\b", "Tamil", "தமிழ்"),
    (r"\b(kemon|kothay|keno|ache|chilo|korbo|korbe|dekho|bolo|bhai|dada|didi)\b", "Bengali", "বাংলা"),
]

ALIGNMENT_CONTROL_FIELDS = (
    "align_model",
    "align_parallel_chunks",
    "align_rerun_model",
    "align_max_reruns",
    "align_min_coverage_ratio",
    "align_min_match_ratio",
    "align_max_extra_ratio",
    "align_engine",
    "align_language",
    "accept_non_native_alignment",
    "debug_gemini_alignment",
)

JOB_CONTROL_FIELDS = ALIGNMENT_CONTROL_FIELDS + ("fallback", "allow_audio_only")


def _strip_non_spoken(text: str) -> str:
    lines = text.split("\n")
    result = []
    in_frontmatter = False
    frontmatter_count = 0

    for i, line in enumerate(lines):
        stripped = line.strip()
        if stripped == "---":
            frontmatter_count += 1
            if frontmatter_count <= 2 and i < 20:
                in_frontmatter = not in_frontmatter
                continue
        if in_frontmatter:
            continue
        if re.match(r"^#{1,4}\s", stripped):
            continue
        if re.match(r"^-\s+(Format|Duration|Channel|Tone|Word count|Estimated|Chapters|Silence|Numbers|Callbacks):", stripped, re.IGNORECASE):
            continue
        if stripped.upper().startswith("## METADATA"):
            continue
        result.append(line)

    cleaned = re.sub(r"\n{4,}", "\n\n\n", "\n".join(result))
    return cleaned.strip()


def _lint_transliteration(text: str) -> list[str]:
    warnings = []
    if re.search(r"[\u0900-\u0D7F]", text):
        return warnings

    for pattern, lang, script in _TRANSLITERATED_PATTERNS:
        matches = re.findall(pattern, text, re.IGNORECASE)
        if len(matches) >= 3:
            unique = sorted(set(m.lower() for m in matches))
            warnings.append(
                f"Found {len(matches)} likely {lang} words in Latin script: {', '.join(unique[:8])}... "
                f"TTS pronounces {script} better. Convert native words to native script."
            )
    return warnings


def _read_text_input(text_value: str | None, text_file: str | None) -> str:
    if text_file:
        raw = Path(text_file).read_text(encoding="utf-8")
        text = _strip_non_spoken(raw)
        if raw != text:
            print(f"[voiceover] Stripped non-spoken content ({len(raw)} -> {len(text)} chars)")
        return text
    if text_value is not None:
        return text_value
    raise ValueError("Either --text or --text-file is required")


def _validate_args(parser: argparse.ArgumentParser, args: argparse.Namespace) -> None:
    if not args.output:
        parser.error("--output is required (unless using --voice-list)")
    if args.speed is not None and not (0.7 <= args.speed <= 1.2):
        parser.error("--speed must be between 0.7 and 1.2")
    if args.align_parallel_chunks < 1:
        parser.error("--align-parallel-chunks must be >= 1")
    if args.align_max_reruns < 0:
        parser.error("--align-max-reruns must be >= 0")
    if not (0.0 <= args.align_min_coverage_ratio <= 1.0):
        parser.error("--align-min-coverage-ratio must be in [0, 1]")
    if not (0.0 <= args.align_min_match_ratio <= 1.0):
        parser.error("--align-min-match-ratio must be in [0, 1]")
    if args.align_max_extra_ratio < 0.0:
        parser.error("--align-max-extra-ratio must be >= 0")
    if not (0.0 <= args.min_render_coverage <= 1.0):
        parser.error("--min-render-coverage must be in [0, 1]")


def _default_alignment_engine_for_provider(provider: str) -> str:
    return DEFAULT_ALIGNMENT_ENGINE if provider == "elevenlabs" else "auto"


def _finalize_provider_defaults(args: argparse.Namespace, *, align_engine_explicit: bool = False) -> argparse.Namespace:
    args.align_engine_explicit = align_engine_explicit
    if args.align_engine is None:
        args.align_engine = _default_alignment_engine_for_provider(args.provider)
    return args


def _cleanup_tts_artifacts(tts_result: dict) -> None:
    for path_str in tts_result.get("cleanup_files", []):
        path = Path(path_str)
        if path.exists():
            try:
                path.unlink()
            except OSError:
                pass
    for dir_str in tts_result.get("cleanup_dirs", []):
        path = Path(dir_str)
        if path.exists():
            try:
                path.rmdir()
            except OSError:
                pass


def _alignment_kwargs(args: argparse.Namespace, tts_result: dict) -> dict:
    return {
        "model": args.align_model,
        "engine": args.align_engine,
        "language": args.align_language,
        "strict": args.strict_alignment,
        "signal_align": args.signal_align,
        "align_parallel_chunks": args.align_parallel_chunks,
        "align_rerun_model": args.align_rerun_model,
        "align_max_reruns": args.align_max_reruns,
        "align_min_coverage_ratio": args.align_min_coverage_ratio,
        "align_min_match_ratio": args.align_min_match_ratio,
        "align_max_extra_ratio": args.align_max_extra_ratio,
        "chunk_alignment_jobs": tts_result.get("chunk_alignment_jobs", []),
        "native_alignment_words": tts_result.get("native_alignment_words", []),
        "allow_gemini_debug": args.debug_gemini_alignment,
    }


def _validate_production_alignment(args: argparse.Namespace, alignment: dict) -> None:
    source = str(alignment.get("alignment_source") or "")
    if args.accept_non_native_alignment:
        return
    if args.provider == "elevenlabs" and source != "elevenlabs_native":
        raise RuntimeError(
            "Production ElevenLabs voiceover requires native provider timestamps. "
            f"Got alignment_source={source!r}. Pass --accept-non-native-alignment only for an explicit recovery/debug run."
        )
    if source.startswith("gemini"):
        raise RuntimeError(
            "Gemini timestamp alignment is debug-only. Pass --debug-gemini-alignment and "
            "--accept-non-native-alignment only for an explicit emergency run."
        )


def _run_voiceover_pipeline(args: argparse.Namespace, text: str) -> dict:
    output_path = Path(args.output)
    output_path.parent.mkdir(parents=True, exist_ok=True)
    words_path = output_path.with_suffix(".words.json")
    srt_path = output_path.with_suffix(".srt")

    resolved_voice = args.voice or default_voice(args.provider)
    resolved_model = args.model or default_model(args.provider)
    tts_result = generate_tts(
        provider=args.provider,
        text=text,
        output_path=str(output_path),
        voice=resolved_voice,
        model=resolved_model,
        speed=args.speed,
        stability=args.stability,
        allow_audio_only=args.allow_audio_only,
    )

    for chunk_job in tts_result.get("chunk_alignment_jobs", []):
        chunk_job["text"] = clean_alignment_text(str(chunk_job.get("text", "")))

    cleaned_text = clean_alignment_text(text)
    alignment = run_alignment(
        audio_path=Path(tts_result["audio"]),
        text=cleaned_text,
        output_words=words_path,
        output_srt=srt_path,
        **_alignment_kwargs(args, tts_result),
    )
    _validate_production_alignment(args, alignment)
    _cleanup_tts_artifacts(tts_result)

    expected_word_count = len(cleaned_text.split())
    aligned_word_count = len(alignment["words"])
    coverage_ratio = (aligned_word_count / expected_word_count) if expected_word_count > 0 else 0.0

    if coverage_ratio < args.min_render_coverage:
        print(
            json.dumps(
                {
                    "status": "fail",
                    "reason": "render_coverage_below_threshold",
                    "audio": str(output_path),
                    "expected_words": expected_word_count,
                    "aligned_words": aligned_word_count,
                    "coverage_ratio": round(coverage_ratio, 4),
                    "min_render_coverage": args.min_render_coverage,
                    "hint": (
                        "The TTS render covered fewer words than the script. "
                        "Common cause: provider truncated output mid-render and "
                        "mp3 was silence-padded to target duration. "
                        "Re-render or split the script into smaller chunks."
                    ),
                },
                indent=2,
            ),
            file=sys.stderr,
        )
        sys.exit(2)

    result = {
        "status": "ok",
        "audio": str(output_path),
        "srt": str(srt_path),
        "words": str(words_path),
        "duration": round(alignment["duration"], 2),
        "word_count": aligned_word_count,
        "expected_word_count": expected_word_count,
        "coverage_ratio": round(coverage_ratio, 4),
        "model": resolved_model,
        "voice": resolved_voice,
        "provider": args.provider,
        "alignment_model": args.align_model,
        "alignment_engine": args.align_engine,
        "alignment_source": alignment["alignment_source"],
        "alignment_parallel_chunks": args.align_parallel_chunks,
        "alignment_rerun_model": args.align_rerun_model,
        "alignment_max_reruns": args.align_max_reruns,
        "signal_aligned": bool(alignment["signal_report"] and alignment["signal_report"].get("status") == "ok"),
    }
    print(json.dumps(result, indent=2))
    return result


def _run_provider(args: argparse.Namespace, text: str) -> dict:
    return _run_voiceover_pipeline(args, text)


def _run_with_fallback(args: argparse.Namespace, text: str) -> dict:
    try:
        return _run_provider(args, text)
    except (RuntimeError, SystemExit) as exc:
        failed = not isinstance(exc, SystemExit) or exc.code != 0
        if failed and args.fallback and args.fallback != args.provider:
            print(f"[voiceover] {args.provider} failed, falling back to {args.fallback}", file=sys.stderr)
            retry_args = argparse.Namespace(**vars(args))
            retry_args.provider = args.fallback
            if not getattr(args, "align_engine_explicit", False):
                retry_args.align_engine = _default_alignment_engine_for_provider(retry_args.provider)
            return _run_provider(retry_args, text)
        raise


def _apply_common_job_controls(job_args: argparse.Namespace, job: dict, defaults: dict) -> None:
    for field in JOB_CONTROL_FIELDS:
        setattr(job_args, field, job.get(field, defaults.get(field, getattr(job_args, field))))
    job_args.align_engine_explicit = "align_engine" in job or "align_engine" in defaults
    if not job_args.align_engine_explicit:
        job_args.align_engine = _default_alignment_engine_for_provider(job_args.provider)

    signal_align = job.get("signal_align", defaults.get("signal_align"))
    if signal_align is not None:
        job_args.signal_align = bool(signal_align)


def _run_jobs(args: argparse.Namespace) -> None:
    manifest, manifest_path = load_manifest(args.jobs)
    provider = manifest.get("provider", args.provider or "gemini")
    provider_spec(provider)
    defaults = manifest.get("defaults", {})
    jobs = select_jobs(manifest, args.job_id)
    output_root = resolve_path(manifest_path.parent, defaults.get("output_dir"), "audio")

    results = []
    for job in jobs:
        output_name = job.get("output") or f"{job.get('id', 'voiceover')}.mp3"
        output_path = resolve_path(output_root, output_name, output_name)
        output_path.parent.mkdir(parents=True, exist_ok=True)

        job_args = argparse.Namespace(**vars(args))
        job_args.jobs = None
        job_args.provider = provider
        job_args.output = str(output_path)
        job_args.voice = str(job.get("voice", defaults.get("voice", default_voice(provider))))
        job_args.model = str(job.get("model", defaults.get("model", default_model(provider, jobs=True))))
        job_args.text = job.get("text")
        job_args.text_file = None

        if job.get("text_file"):
            text_path = resolve_path(manifest_path.parent, job["text_file"], job["text_file"])
            job_args.text_file = str(text_path)
        elif job.get("text") is None:
            raise ValueError(f"Voiceover job '{job.get('id')}' requires text or text_file")

        if provider == "elevenlabs":
            job_args.stability = str(job.get("stability", defaults.get("stability", default_stability(provider))))
            speed = job.get("speed", defaults.get("speed"))
            job_args.speed = float(speed) if speed is not None else None
        else:
            speed = job.get("speed", defaults.get("speed"))
            job_args.speed = None if speed is None else float(speed)

        _apply_common_job_controls(job_args, job, defaults)

        text = _read_text_input(job_args.text, job_args.text_file)
        for warning in _lint_transliteration(text):
            print(f"[voiceover] ⚠ {warning}", file=sys.stderr)
        result = _run_with_fallback(job_args, text)
        result["job_id"] = str(job.get("id", output_path.stem))
        results.append(result)

    print_json({"status": "ok", "provider": provider, "results": results})


def build_parser() -> argparse.ArgumentParser:
    parser = argparse.ArgumentParser(
        description="Generate voiceover: TTS, alignment, and subtitles in one pipeline",
        formatter_class=argparse.RawDescriptionHelpFormatter,
        epilog="""Examples:
  %(prog)s --text "Hello world" --output hello.mp3
  %(prog)s --text-file script.txt --output voiceover.mp3 --voice Rajesh
  %(prog)s --text-file script.txt --output vo.mp3 --speed 0.9 --stability natural
  %(prog)s --provider gemini --voice Kore --text "Hello world" --output hello.mp3
  %(prog)s --jobs voiceover_jobs.json
  %(prog)s --voice-list
""",
    )
    parser.add_argument("--text", help="Text to convert to speech")
    parser.add_argument("--text-file", help="Read text from file instead")
    parser.add_argument("--output", help="Output MP3 path")
    parser.add_argument("--jobs", help="Run a voiceover jobs manifest instead of a single request")
    parser.add_argument("--job-id", help="Run only one job from --jobs")
    parser.add_argument("--provider", default=DEFAULT_AUDIO_PROVIDER, choices=list(provider_choices()))
    parser.add_argument("--voice", default=None)
    parser.add_argument("--model", default=None)
    parser.add_argument("--speed", type=float, default=None)
    parser.add_argument("--stability", default="natural", choices=["creative", "natural", "robust"])
    parser.add_argument("--strict-alignment", action="store_true", default=True)
    parser.add_argument("--no-strict", dest="strict_alignment", action="store_false")
    parser.add_argument("--align-model", default=DEFAULT_TRANSCRIPT_MODEL)
    parser.add_argument("--align-engine", choices=["auto", "elevenlabs", "gemini", "qwen3"], default=None)
    parser.add_argument("--align-language", default="English")
    parser.add_argument("--align-parallel-chunks", type=int, default=5)
    parser.add_argument("--align-rerun-model", default=DEFAULT_TRANSCRIPT_RERUN_MODEL)
    parser.add_argument("--align-max-reruns", type=int, default=1)
    parser.add_argument("--align-min-coverage-ratio", type=float, default=0.8)
    parser.add_argument("--align-min-match-ratio", type=float, default=0.65)
    parser.add_argument("--align-max-extra-ratio", type=float, default=0.45)
    parser.add_argument(
        "--min-render-coverage",
        type=float,
        default=0.95,
        help="Hard-fail threshold for aligned_words / expected_words over the whole render. "
             "Catches provider truncation (e.g., Gemini cutoff) masked by silence-padding. "
             "Default 0.95. See docs/doctrine.md §6 Handoff verification.",
    )
    parser.add_argument("--signal-align", dest="signal_align", action="store_true", default=True)
    parser.add_argument("--no-signal-align", dest="signal_align", action="store_false")
    parser.add_argument("--fallback", default=None, choices=list(provider_choices()))
    parser.add_argument(
        "--allow-audio-only",
        action="store_true",
        help="Allow ElevenLabs audio-only fallback when native timestamp TTS fails. Not for production timing.",
    )
    parser.add_argument(
        "--debug-gemini-alignment",
        action="store_true",
        help="Permit Gemini timestamp alignment for explicit debug/emergency runs.",
    )
    parser.add_argument(
        "--accept-non-native-alignment",
        action="store_true",
        help="Accept Qwen/Gemini recovery alignment instead of ElevenLabs native timestamps.",
    )
    parser.add_argument("--voice-list", action="store_true", help="List available ElevenLabs voices and exit")
    return parser


def parse_args(argv: list[str] | None = None) -> argparse.Namespace:
    parser = build_parser()
    args = parser.parse_args(argv)
    return _finalize_provider_defaults(args, align_engine_explicit=args.align_engine is not None)


def main(argv: list[str] | None = None) -> int:
    parser = build_parser()
    args = parser.parse_args(argv)
    _finalize_provider_defaults(args, align_engine_explicit=args.align_engine is not None)

    if args.voice_list:
        list_elevenlabs_voices()
        return 0

    if args.jobs:
        _run_jobs(args)
        return 0

    _validate_args(parser, args)
    text = _read_text_input(args.text, args.text_file)
    for warning in _lint_transliteration(text):
        print(f"[voiceover] ⚠ {warning}", file=sys.stderr)
    _run_with_fallback(args, text)
    return 0


if __name__ == "__main__":
    raise SystemExit(main())
