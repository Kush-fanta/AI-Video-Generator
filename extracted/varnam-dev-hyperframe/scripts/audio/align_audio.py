#!/usr/bin/env python3
# ---
# varnam_script: audio.align_audio
# owner: audio
# status: live
# surface: direct-only
# purpose: Audio-to-word alignment primitive.
# use_when: Convert rendered speech into timed word artifacts.
# inputs: CLI args, manifests, env vars, or imports documented by argparse/docstring
# outputs: files, JSON/stdout reports, or process exit code documented by the script
# authority: scripts/README.md; scripts/SCRIPT_MAP.md
# ---
"""Generic audio alignment and transcription primitives."""

from __future__ import annotations

import argparse
import json
import mimetypes
import os
import re
import subprocess
import sys
import time
import tempfile
from concurrent.futures import ThreadPoolExecutor, as_completed
from pathlib import Path
from typing import Optional

SCRIPT_DIR = Path(__file__).resolve().parent
TIMING_DIR = SCRIPT_DIR.parent / "timing"
if str(SCRIPT_DIR) not in sys.path:
    sys.path.insert(0, str(SCRIPT_DIR))

from common import fail, gemini_safety_settings, get_env, require_env
from provider_registry import DEFAULT_TRANSCRIPT_MODEL
from subtitles import words_to_srt


def get_audio_duration(audio_path: str) -> float:
    try:
        from mutagen.mp3 import MP3

        return MP3(audio_path).info.length
    except Exception:
        pass
    try:
        result = subprocess.run(
            ["ffprobe", "-v", "quiet", "-show_entries", "format=duration", "-of", "json", str(audio_path)],
            capture_output=True,
            text=True,
            check=True,
        )
        return float(json.loads(result.stdout)["format"]["duration"])
    except Exception:
        pass
    size = os.path.getsize(audio_path)
    return size / (128 * 1000 / 8)


def validate_alignment(words: list[dict], audio_duration: float) -> list[str]:
    warnings = []
    if not words:
        warnings.append("Empty word list")
        return warnings

    for i, w in enumerate(words):
        if w["end"] < w["start"]:
            warnings.append(f"Word {i} '{w.get('word', '?')}': end ({w['end']}) < start ({w['start']})")
        if w["start"] < 0:
            warnings.append(f"Word {i} '{w.get('word', '?')}': negative start ({w['start']})")
        if w["end"] - w["start"] > 3.0:
            warnings.append(f"Word {i} '{w.get('word', '?')}': duration {w['end'] - w['start']:.2f}s exceeds 3s")

    for i in range(len(words) - 1):
        if words[i + 1]["start"] < words[i]["start"]:
            warnings.append(
                f"Non-monotonic: word {i} starts at {words[i]['start']}, "
                f"word {i+1} starts at {words[i+1]['start']}"
            )

    if words[-1]["end"] > audio_duration + 0.5:
        warnings.append(f"Last word ends at {words[-1]['end']:.3f}s but audio is {audio_duration:.3f}s")

    if audio_duration > 0 and words[-1]["end"] < audio_duration * 0.8:
        warnings.append(
            f"Alignment undershoots: last word ends at {words[-1]['end']:.3f}s, "
            f"audio is {audio_duration:.3f}s ({words[-1]['end']/audio_duration*100:.0f}%)"
        )

    for i in range(len(words) - 1):
        gap = words[i + 1]["start"] - words[i]["end"]
        if gap > 2.0:
            warnings.append(
                f"Gap of {gap:.2f}s between word {i} '{words[i].get('word', '?')}' "
                f"and word {i+1} '{words[i+1].get('word', '?')}'"
            )

    return warnings


def clean_alignment_text(text: str) -> str:
    cleaned = re.sub(r"\[.*?\]\s*", "", text).strip()
    cleaned = re.sub(r"\s*--\s*", ", ", cleaned)
    cleaned = re.sub(r"\s+", " ", cleaned).strip()
    return cleaned


def _shift_words(words: list[dict], offset_seconds: float) -> list[dict]:
    shifted: list[dict] = []
    for entry in words:
        start = float(entry["start"]) + offset_seconds
        end = float(entry["end"]) + offset_seconds
        shifted.append(
            {
                "word": str(entry.get("word", "")),
                "start": round(max(0.0, start), 3),
                "end": round(max(0.0, end), 3),
            }
        )
    return shifted


def repair_short_word_durations(words: list[dict], min_duration: float = 0.06) -> list[dict]:
    repaired: list[dict] = []
    for i, entry in enumerate(words):
        start = round(max(0.0, float(entry["start"])), 3)
        end = round(max(start, float(entry["end"])), 3)
        if end - start < min_duration:
            next_start = None
            if i + 1 < len(words):
                next_start = max(start, float(words[i + 1]["start"]))
            desired_end = round(start + min_duration, 3)
            if next_start is not None and next_start - start >= min_duration:
                end = min(desired_end, round(next_start, 3))
            else:
                end = desired_end
        repaired.append({"word": str(entry.get("word", "")), "start": start, "end": end})
    return repaired


def _normalize_token(token: str) -> str:
    return re.sub(r"[^\w]+", "", token.lower())


def _expected_tokens(text: str) -> list[str]:
    return [tok for tok in (_normalize_token(part) for part in text.split()) if tok]


def _aligned_tokens(words: list[dict]) -> list[str]:
    return [tok for tok in (_normalize_token(str(entry.get("word", ""))) for entry in words) if tok]


def _audio_mime_type(audio_path: Path) -> str:
    guessed, _ = mimetypes.guess_type(str(audio_path))
    return guessed or "audio/mpeg"


def _ordered_match_ratio(expected_tokens: list[str], aligned_tokens: list[str]) -> float:
    if not expected_tokens:
        return 1.0
    if not aligned_tokens:
        return 0.0
    matched = 0
    cursor = 0
    for token in expected_tokens:
        while cursor < len(aligned_tokens) and aligned_tokens[cursor] != token:
            cursor += 1
        if cursor < len(aligned_tokens):
            matched += 1
            cursor += 1
    return matched / max(1, len(expected_tokens))


def _chunk_alignment_metrics(text: str, words: list[dict], audio_duration: float) -> dict:
    expected = _expected_tokens(text)
    aligned = _aligned_tokens(words)
    expected_count = len(expected)
    aligned_count = len(aligned)
    coverage_ratio = min(aligned_count, expected_count) / max(1, expected_count) if expected_count else 1.0
    extra_ratio = max(0, aligned_count - expected_count) / max(1, expected_count) if expected_count else 0.0
    match_ratio = _ordered_match_ratio(expected, aligned)
    warnings = validate_alignment(words, audio_duration)
    return {
        "expected_count": expected_count,
        "aligned_count": aligned_count,
        "coverage_ratio": coverage_ratio,
        "extra_ratio": extra_ratio,
        "match_ratio": match_ratio,
        "warnings": warnings,
    }


def _chunk_alignment_quality_ok(
    metrics: dict,
    *,
    min_coverage_ratio: float,
    min_match_ratio: float,
    max_extra_ratio: float,
) -> bool:
    return (
        float(metrics["coverage_ratio"]) >= min_coverage_ratio
        and float(metrics["match_ratio"]) >= min_match_ratio
        and float(metrics["extra_ratio"]) <= max_extra_ratio
    )


def _chunk_alignment_score(metrics: dict) -> float:
    return (
        float(metrics["match_ratio"]) * 2.0
        + float(metrics["coverage_ratio"])
        - float(metrics["extra_ratio"])
        - min(0.25, 0.02 * len(metrics.get("warnings", [])))
    )


def transcribe_with_gemini(audio_path: Path, text: str | None = None, model: str = "gemini-2.5-pro", strict: bool = False) -> list[dict]:
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
    print(f"Uploading {audio_path.name} to Gemini...", file=sys.stderr)
    uploaded = client.files.upload(file=str(audio_path))

    state = getattr(uploaded, "state", None)
    state_name = getattr(state, "name", str(state)) if state else ""
    while state_name.endswith("PROCESSING"):
        time.sleep(2)
        uploaded = client.files.get(name=uploaded.name)
        state = getattr(uploaded, "state", None)
        state_name = getattr(state, "name", str(state)) if state else ""
    if state_name.endswith("FAILED"):
        fail(f"Gemini file processing failed for {audio_path.name}")

    format_rule = (
        "Output format: one line per word, tab-separated: START\\tEND\\tWORD\n"
        "- START and END are floats in seconds, 3 decimal places.\n"
        "- No header, no blank lines, no commentary.\n"
        "- start of line N+1 >= end of line N (strictly sequential)."
    )

    if text:
        prompt = (
            "Forced-align this audio to the text below. "
            "Assign timestamps to every word in EXACT order. "
            "Do not add, remove, skip, or rephrase any word.\n\n"
            f"{format_rule}\n\n"
            f"TRANSCRIPT:\n{text}"
        )
    else:
        prompt = f"Transcribe this audio word by word.\n\n{format_rule}"

    def parse_ts(val: str) -> float:
        if ":" in val:
            parts = val.split(":")
            secs = 0.0
            for p in parts:
                secs = secs * 60 + float(p)
            return secs
        dot_parts = val.split(".")
        if len(dot_parts) >= 3:
            mins = int(dot_parts[0])
            secs_str = ".".join(dot_parts[1:])
            return mins * 60 + float(secs_str)
        return float(val)

    def parse_response(raw: str) -> list[dict]:
        words = []
        for line in raw.splitlines():
            line = line.strip()
            if not line:
                continue
            parts = line.split("\t")
            if len(parts) < 3:
                parts = line.split(None, 2)
            if len(parts) < 3:
                continue
            words.append({"word": parts[2], "start": parse_ts(parts[0]), "end": parse_ts(parts[1])})
        return words

    uploaded_name = uploaded.name
    max_attempts = 3
    last_words = []
    for attempt in range(1, max_attempts + 1):
        print(f"{'Aligning' if text else 'Transcribing'} with {model} (attempt {attempt}/{max_attempts})...", file=sys.stderr)
        response = client.models.generate_content(
            model=model,
            contents=[
                types.Content(
                    parts=[
                        types.Part.from_uri(file_uri=uploaded.uri, mime_type=_audio_mime_type(audio_path)),
                        types.Part(text=prompt),
                    ]
                )
            ],
            config=types.GenerateContentConfig(
                temperature=0,
                safety_settings=gemini_safety_settings(types),
            ),
        )
        last_words = parse_response(response.text.strip())
        if not last_words:
            print(f"  Attempt {attempt}: no parseable words", file=sys.stderr)
        elif text:
            expected = len(text.split())
            got = len(last_words)
            coverage = last_words[-1]["end"] if last_words else 0
            print(f"  Attempt {attempt}: {got}/{expected} words, last ends at {coverage:.1f}s", file=sys.stderr)
            if got >= expected * 0.8:
                break
            print(f"  Coverage too low ({got/expected*100:.0f}%), retrying...", file=sys.stderr)
        else:
            break

        if attempt < max_attempts:
            backoff = attempt * 5
            print(f"  Backing off {backoff}s...", file=sys.stderr)
            time.sleep(backoff)

    if not last_words:
        fail(f"Gemini returned no parseable words after {max_attempts} attempts")

    try:
        client.files.delete(name=uploaded_name)
    except Exception:
        pass

    return last_words


def transcribe_text_with_gemini(audio_path: Path, model: str = "gemini-2.5-flash-lite") -> str:
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
    print(f"Uploading {audio_path.name} to Gemini for transcript recovery...", file=sys.stderr)
    uploaded = client.files.upload(file=str(audio_path))

    state = getattr(uploaded, "state", None)
    state_name = getattr(state, "name", str(state)) if state else ""
    while state_name.endswith("PROCESSING"):
        time.sleep(2)
        uploaded = client.files.get(name=uploaded.name)
        state = getattr(uploaded, "state", None)
        state_name = getattr(state, "name", str(state)) if state else ""
    if state_name.endswith("FAILED"):
        fail(f"Gemini file processing failed for {audio_path.name}")

    prompt = (
        "Transcribe the spoken words in this audio as plain text only. "
        "Do not include timestamps, speaker labels, markdown, commentary, or confidence notes."
    )
    uploaded_name = uploaded.name
    response = client.models.generate_content(
        model=model,
        contents=[
            types.Content(
                parts=[
                    types.Part.from_uri(file_uri=uploaded.uri, mime_type=_audio_mime_type(audio_path)),
                    types.Part(text=prompt),
                ]
            )
        ],
        config=types.GenerateContentConfig(
            temperature=0,
            safety_settings=gemini_safety_settings(types),
        ),
    )

    try:
        client.files.delete(name=uploaded_name)
    except Exception:
        pass

    return clean_alignment_text((response.text or "").strip())


def qwen_align_python() -> str:
    return get_env("QWEN_ALIGN_PYTHON", sys.executable) or sys.executable


def resolve_alignment_engine(engine: str) -> str:
    if engine == "auto":
        return "qwen3"
    return engine


def run_qwen3_align(
    *,
    audio_path: Path,
    text: str,
    language: str = "English",
    chunk_alignment_jobs: list[dict] | None = None,
) -> list[dict]:
    script_path = SCRIPT_DIR / "qwen3_align.py"
    python_bin = qwen_align_python()

    with tempfile.TemporaryDirectory(prefix="varnam-qwen-align-") as tmp:
        tmp_dir = Path(tmp)
        output_words = tmp_dir / "words.json"
        cmd = [python_bin, str(script_path), "--output-words", str(output_words), "--language", language]
        if chunk_alignment_jobs:
            jobs_path = tmp_dir / "jobs.json"
            jobs = [
                {
                    "audio_path": str(job["audio_path"]),
                    "text": str(job["text"]),
                    "offset": float(job.get("offset", 0.0)),
                    "language": str(job.get("language", language)),
                }
                for job in chunk_alignment_jobs
            ]
            jobs_path.write_text(json.dumps(jobs, indent=2), encoding="utf-8")
            cmd.extend(["--jobs-json", str(jobs_path)])
        else:
            text_path = tmp_dir / "transcript.txt"
            text_path.write_text(text, encoding="utf-8")
            cmd.extend(["--audio", str(audio_path), "--text-file", str(text_path)])

        proc = subprocess.run(cmd, capture_output=True, text=True, check=False)
        if proc.returncode != 0:
            stderr = (proc.stderr or "").strip()
            raise RuntimeError(stderr or f"qwen3_align failed with exit code {proc.returncode}")
        return json.loads(output_words.read_text(encoding="utf-8"))


def align_chunks_parallel(
    chunk_jobs: list[dict],
    *,
    model: str,
    rerun_model: str,
    max_reruns: int,
    min_coverage_ratio: float,
    min_match_ratio: float,
    max_extra_ratio: float,
    max_workers: int,
    strict: bool,
) -> list[dict]:
    if not chunk_jobs:
        return []

    workers = max(1, min(max_workers, len(chunk_jobs)))
    print(f"Aligning {len(chunk_jobs)} chunk(s) in parallel with {model} (workers={workers})...", file=sys.stderr)
    chunk_results: dict[int, list[dict]] = {}

    def run_job(job: dict) -> tuple[int, list[dict]]:
        idx = int(job["index"])
        audio_path = Path(job["audio_path"])
        text = str(job["text"])
        offset = float(job["offset"])
        chunk_duration = get_audio_duration(str(audio_path))
        attempts: list[dict] = []
        total_attempts = max(1, max_reruns + 1)

        for attempt in range(total_attempts):
            run_model = rerun_model if attempt == total_attempts - 1 and rerun_model else model
            words = transcribe_with_gemini(audio_path, text, model=run_model, strict=strict)
            metrics = _chunk_alignment_metrics(text, words, chunk_duration)
            score = _chunk_alignment_score(metrics)
            attempts.append({"model": run_model, "words": words, "metrics": metrics, "score": score})
            ok = _chunk_alignment_quality_ok(
                metrics,
                min_coverage_ratio=min_coverage_ratio,
                min_match_ratio=min_match_ratio,
                max_extra_ratio=max_extra_ratio,
            )
            if ok:
                break
            if attempt < total_attempts - 1:
                print(
                    (
                        f"  Chunk {idx + 1}: low-quality alignment "
                        f"(coverage={metrics['coverage_ratio']:.2f}, "
                        f"match={metrics['match_ratio']:.2f}, extra={metrics['extra_ratio']:.2f}) "
                        "— selective rerun."
                    ),
                    file=sys.stderr,
                )

        best = max(attempts, key=lambda item: float(item["score"]))
        best_metrics = best["metrics"]
        best_ok = _chunk_alignment_quality_ok(
            best_metrics,
            min_coverage_ratio=min_coverage_ratio,
            min_match_ratio=min_match_ratio,
            max_extra_ratio=max_extra_ratio,
        )
        if not best_ok:
            msg = (
                f"Chunk {idx + 1} alignment beyond repair "
                f"(coverage={best_metrics['coverage_ratio']:.2f}, "
                f"match={best_metrics['match_ratio']:.2f}, "
                f"extra={best_metrics['extra_ratio']:.2f})."
            )
            if strict:
                raise RuntimeError(msg)
            print(f"[align_audio] {msg} Using best-effort result.", file=sys.stderr)

        return idx, _shift_words(best["words"], offset)

    with ThreadPoolExecutor(max_workers=workers) as executor:
        futures = {executor.submit(run_job, job): int(job["index"]) for job in chunk_jobs}
        for future in as_completed(futures):
            idx, words = future.result()
            chunk_results[idx] = words
            print(f"  Alignment chunk {idx + 1}/{len(chunk_jobs)} done.", file=sys.stderr)

    merged: list[dict] = []
    prev_start = 0.0
    for idx in range(len(chunk_jobs)):
        words = chunk_results.get(idx, [])
        for entry in words:
            start = max(float(entry["start"]), prev_start)
            end = max(float(entry["end"]), start)
            merged.append({"word": str(entry.get("word", "")), "start": round(start, 3), "end": round(end, 3)})
            prev_start = start
    return merged


def run_signal_realign(audio_path: Path, words_path: Path) -> Optional[dict]:
    script_path = TIMING_DIR / "realign_words_signal.py"
    if not script_path.exists():
        print(f"[align_audio] Signal align skipped: script not found at {script_path}", file=sys.stderr)
        return None

    report_path = words_path.with_name(f"{words_path.stem}.signal-report.json")
    cmd = [
        sys.executable,
        str(script_path),
        "--audio",
        str(audio_path),
        "--words",
        str(words_path),
        "--in-place",
        "--report-out",
        str(report_path),
    ]
    try:
        proc = subprocess.run(cmd, capture_output=True, text=True, check=False)
    except Exception as exc:
        print(f"[align_audio] Signal align failed to launch: {exc}", file=sys.stderr)
        return None

    if proc.returncode != 0:
        summary = (proc.stderr or "").strip() or (proc.stdout or "").strip() or f"exit code {proc.returncode}"
        print(f"[align_audio] Signal align skipped: {summary}", file=sys.stderr)
        return None

    raw = (proc.stdout or "").strip()
    if not raw:
        print("[align_audio] Signal align returned empty output", file=sys.stderr)
        return None
    try:
        report = json.loads(raw)
    except json.JSONDecodeError:
        print("[align_audio] Signal align returned non-JSON output", file=sys.stderr)
        return None

    metrics = report.get("metrics", {})
    gain = metrics.get("alignment_score_gain")
    gain_text = f"{gain:.4f}" if isinstance(gain, (int, float)) else "n/a"
    print(f"[align_audio] Signal align applied (score gain {gain_text})", file=sys.stderr)
    return report


def run_alignment(
    *,
    audio_path: Path,
    text: str,
    output_words: Path,
    output_srt: Path | None = None,
    model: str = DEFAULT_TRANSCRIPT_MODEL,
    strict: bool = False,
    signal_align: bool = True,
    align_parallel_chunks: int = 5,
    align_rerun_model: str = "gemini-2.5-pro",
    align_max_reruns: int = 1,
    align_min_coverage_ratio: float = 0.8,
    align_min_match_ratio: float = 0.65,
    align_max_extra_ratio: float = 0.45,
    chunk_alignment_jobs: list[dict] | None = None,
    native_alignment_words: list[dict] | None = None,
    engine: str = "auto",
    language: str = "English",
    allow_gemini_debug: bool = False,
) -> dict:
    clean_text = clean_alignment_text(text)
    chunk_alignment_jobs = chunk_alignment_jobs or []
    native_alignment_words = native_alignment_words or []
    resolved_engine = resolve_alignment_engine(engine)
    words: list[dict] | None = None
    alignment_source: str | None = None

    if (engine in {"auto", "elevenlabs"} or resolved_engine == "elevenlabs") and native_alignment_words:
        duration = get_audio_duration(str(audio_path))
        native_metrics = _chunk_alignment_metrics(clean_text, native_alignment_words, duration)
        native_ok = _chunk_alignment_quality_ok(
            native_metrics,
            min_coverage_ratio=align_min_coverage_ratio,
            min_match_ratio=align_min_match_ratio,
            max_extra_ratio=align_max_extra_ratio,
        )
        if native_ok:
            print("Using ElevenLabs native timestamp alignment.", file=sys.stderr)
            words = native_alignment_words
            alignment_source = "elevenlabs_native"
        elif engine == "elevenlabs":
            raise RuntimeError(
                "ElevenLabs native alignment failed quality checks "
                f"(coverage={native_metrics['coverage_ratio']:.2f}, "
                f"match={native_metrics['match_ratio']:.2f}, extra={native_metrics['extra_ratio']:.2f})"
            )
        else:
            print(
                "[align_audio] ElevenLabs native alignment failed quality checks "
                f"(coverage={native_metrics['coverage_ratio']:.2f}, "
                f"match={native_metrics['match_ratio']:.2f}, extra={native_metrics['extra_ratio']:.2f}); "
                "falling back.",
                file=sys.stderr,
            )
    if words is None and resolved_engine == "elevenlabs":
        if engine == "elevenlabs":
            raise RuntimeError("ElevenLabs native alignment requested, but no native timestamps were provided")
        resolved_engine = resolve_alignment_engine("auto")

    if words is None and resolved_engine == "qwen3":
        try:
            qwen_text = clean_text
            used_gemini_transcript = False
            if not qwen_text:
                print(f"Transcribing with {model}; Qwen3 remains the timing authority...", file=sys.stderr)
                qwen_text = transcribe_text_with_gemini(audio_path, model=model)
                used_gemini_transcript = True
                if not qwen_text:
                    fail("Gemini transcript recovery returned empty text; cannot run Qwen forced alignment")
            print(f"Aligning transcript with local Qwen3 forced aligner via {qwen_align_python()}...", file=sys.stderr)
            words = run_qwen3_align(
                audio_path=audio_path,
                text=qwen_text,
                language=language,
                chunk_alignment_jobs=chunk_alignment_jobs,
            )
            alignment_source = "gemini_transcript_qwen3" if used_gemini_transcript else "qwen3"
        except Exception as exc:
            if engine == "auto":
                fail(
                    "Qwen3 forced alignment is required for final timing when provider-native timestamps are unavailable. "
                    f"Gemini-only alignment is banned. Qwen error: {exc}"
                )
            else:
                raise
    elif words is None and chunk_alignment_jobs and align_parallel_chunks > 1:
        if not allow_gemini_debug:
            raise RuntimeError(
                "Gemini chunk timestamp alignment is debug-only. Use ElevenLabs native timestamps, "
                "Qwen3 forced alignment, or pass allow_gemini_debug=True for an explicit debug run."
            )
        try:
            words = align_chunks_parallel(
                chunk_alignment_jobs,
                model=model,
                rerun_model=align_rerun_model,
                max_reruns=align_max_reruns,
                min_coverage_ratio=align_min_coverage_ratio,
                min_match_ratio=align_min_match_ratio,
                max_extra_ratio=align_max_extra_ratio,
                max_workers=align_parallel_chunks,
                strict=strict,
            )
            alignment_source = "gemini_chunk_debug"
        except Exception as exc:
            print(f"[align_audio] Parallel alignment failed ({exc}); falling back to full-file alignment.", file=sys.stderr)
            words = transcribe_with_gemini(audio_path, clean_text, model=model, strict=strict)
            alignment_source = "gemini_debug"
    elif words is None:
        if not allow_gemini_debug:
            raise RuntimeError(
                "Gemini timestamp alignment is debug-only. Use ElevenLabs native timestamps, "
                "Qwen3 forced alignment, or pass allow_gemini_debug=True for an explicit debug run."
            )
        print("[align_audio] Explicit Gemini alignment selected; debug/emergency use only.", file=sys.stderr)
        words = transcribe_with_gemini(audio_path, clean_text, model=model, strict=strict)
        alignment_source = "gemini_debug"

    words = repair_short_word_durations(words)

    duration = get_audio_duration(str(audio_path))
    alignment_warnings = validate_alignment(words, duration)
    if alignment_warnings:
        print(f"Alignment warnings ({len(alignment_warnings)}):", file=sys.stderr)
        for warning in alignment_warnings:
            print(f"  - {warning}", file=sys.stderr)
        if strict:
            fail(f"Strict alignment: {len(alignment_warnings)} warnings — aborting")

    output_words.parent.mkdir(parents=True, exist_ok=True)
    with open(output_words, "w", encoding="utf-8") as handle:
        json.dump(words, handle, indent=2)

    signal_report = None
    if signal_align:
        signal_report = run_signal_realign(audio_path, output_words)
        if signal_report and signal_report.get("status") == "ok":
            with open(output_words, "r", encoding="utf-8") as handle:
                words = json.load(handle)
            post_warnings = validate_alignment(words, duration)
            if post_warnings:
                print(f"Post-signal alignment warnings ({len(post_warnings)}):", file=sys.stderr)
                for warning in post_warnings:
                    print(f"  - {warning}", file=sys.stderr)
                if strict:
                    fail(f"Strict alignment (post-signal): {len(post_warnings)} warnings — aborting")

    if output_srt is not None:
        words_to_srt(clean_text, words, str(output_srt))

    return {
        "words": words,
        "duration": duration,
        "signal_report": signal_report,
        "clean_text": clean_text,
        "alignment_source": alignment_source,
    }


def parse_args(argv: list[str] | None = None) -> argparse.Namespace:
    parser = argparse.ArgumentParser(description="Align audio to source text or transcribe it into words.json")
    parser.add_argument("--audio", required=True, help="Path to audio file")
    parser.add_argument("--text-file", help="Optional source text file for forced alignment")
    parser.add_argument("--output-words", required=True, help="Output words.json path")
    parser.add_argument("--output-srt", help="Optional output .srt path")
    parser.add_argument("--model", default=DEFAULT_TRANSCRIPT_MODEL, help="Gemini transcript recovery/debug model")
    parser.add_argument("--engine", choices=["auto", "gemini", "qwen3"], default="auto")
    parser.add_argument("--language", default="English", help="Forced alignment language for local aligners")
    parser.add_argument("--strict", action="store_true", help="Fail on alignment warnings")
    parser.add_argument("--signal-align", action="store_true", default=False, help="Run signal post-alignment")
    parser.add_argument(
        "--debug-gemini-alignment",
        action="store_true",
        help="Permit Gemini timestamp alignment for explicit debug/emergency runs.",
    )
    return parser.parse_args(argv)


def main(argv: list[str] | None = None) -> int:
    args = parse_args(argv)

    text = Path(args.text_file).read_text(encoding="utf-8") if args.text_file else ""
    result = run_alignment(
        audio_path=Path(args.audio),
        text=text,
        output_words=Path(args.output_words),
        output_srt=Path(args.output_srt) if args.output_srt else None,
        model=args.model,
        engine=args.engine,
        language=args.language,
        strict=args.strict,
        signal_align=args.signal_align,
        allow_gemini_debug=args.debug_gemini_alignment,
    )
    print(
        json.dumps(
            {
                "status": "ok",
                "duration": round(result["duration"], 2),
                "word_count": len(result["words"]),
                "alignment_source": result["alignment_source"],
            },
            indent=2,
        )
    )
    return 0


if __name__ == "__main__":
    raise SystemExit(main())
