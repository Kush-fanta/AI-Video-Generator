#!/usr/bin/env python3
# ---
# varnam_script: visual.analyze_media
# owner: visual
# status: live
# surface: python3 scripts/run.py visual:analyze
# purpose: Vision-model media inspection utility.
# use_when: Inspect images or video clips with a vision model.
# inputs: CLI args, manifests, env vars, or imports documented by argparse/docstring
# outputs: files, JSON/stdout reports, or process exit code documented by the script
# authority: scripts/README.md; scripts/SCRIPT_MAP.md
# ---
"""Gemini-backed multimodal media analysis for local files and YouTube URLs."""

from __future__ import annotations

import argparse
import json
import re
import sys
import time
from pathlib import Path
from typing import Any
from urllib.parse import urlparse

SHARED_DIR = Path(__file__).resolve().parents[1] / "shared"
if str(SHARED_DIR) not in sys.path:
    sys.path.insert(0, str(SHARED_DIR))

from _job_utils import load_manifest, print_json, resolve_path, select_jobs, write_json
from env_file import get_env, require_env
from provider_registry import resolve_gemini_model


TEXT_EXTENSIONS = {
    ".txt",
    ".md",
    ".markdown",
    ".json",
    ".jsonl",
    ".csv",
    ".tsv",
    ".yaml",
    ".yml",
    ".srt",
    ".ass",
}
MEDIA_SCHEMA = {
    "type": "object",
    "properties": {
        "kind": {"type": "string"},
        "summary": {"type": "string"},
        "transcript": {"type": ["string", "null"]},
        "subjects": {"type": "array", "items": {"type": "string"}},
        "style_notes": {"type": "array", "items": {"type": "string"}},
        "audio_notes": {"type": "array", "items": {"type": "string"}},
        "text_in_media": {"type": "array", "items": {"type": "string"}},
        "key_moments": {
            "type": "array",
            "items": {
                "type": "object",
                "properties": {
                    "timestamp": {"type": ["string", "null"]},
                    "note": {"type": "string"},
                },
                "required": ["timestamp", "note"],
                "additionalProperties": False,
            },
        },
        "fit_assessment": {"type": ["string", "null"]},
        "comparison": {"type": ["string", "null"]},
        "answer": {"type": ["string", "null"]},
        "confidence_notes": {"type": "array", "items": {"type": "string"}},
    },
    "required": [
        "kind",
        "summary",
        "transcript",
        "subjects",
        "style_notes",
        "audio_notes",
        "text_in_media",
        "key_moments",
        "fit_assessment",
        "comparison",
        "answer",
        "confidence_notes",
    ],
    "additionalProperties": False,
}


def get_sdk() -> tuple[Any, Any]:
    try:
        from google import genai
        from google.genai import types
    except ImportError as exc:
        raise RuntimeError(
            "Missing google-genai. Install it with `pip install google-genai` "
            "or add it to your environment from requirements.txt."
        ) from exc
    return genai, types


GEMINI_SAFETY_CATEGORIES = (
    "HARM_CATEGORY_HARASSMENT",
    "HARM_CATEGORY_HATE_SPEECH",
    "HARM_CATEGORY_SEXUALLY_EXPLICIT",
    "HARM_CATEGORY_DANGEROUS_CONTENT",
    "HARM_CATEGORY_CIVIC_INTEGRITY",
)


def gemini_safety_threshold_name() -> str:
    threshold_name = (get_env("GEMINI_SAFETY_THRESHOLD", "OFF") or "OFF").strip().upper() or "OFF"
    valid_names = {"BLOCK_LOW_AND_ABOVE", "BLOCK_MEDIUM_AND_ABOVE", "BLOCK_ONLY_HIGH", "BLOCK_NONE", "OFF"}
    if threshold_name not in valid_names:
        raise RuntimeError(
            "Invalid GEMINI_SAFETY_THRESHOLD. "
            "Use one of BLOCK_LOW_AND_ABOVE, BLOCK_MEDIUM_AND_ABOVE, BLOCK_ONLY_HIGH, BLOCK_NONE, OFF."
        )
    return threshold_name


def build_gemini_safety_settings(types: Any) -> list[Any]:
    threshold = getattr(types.HarmBlockThreshold, gemini_safety_threshold_name())
    settings: list[Any] = []
    for category_name in GEMINI_SAFETY_CATEGORIES:
        category = getattr(types.HarmCategory, category_name, None)
        if category is None:
            continue
        settings.append(types.SafetySetting(category=category, threshold=threshold))
    return settings


def get_client() -> tuple[Any, Any]:
    api_key = require_env("GOOGLE_API_KEY")
    genai, types = get_sdk()
    return genai.Client(api_key=api_key), types


def resolve_model(model_name: str | None) -> str:
    return resolve_gemini_model(model_name)


def is_url(value: str) -> bool:
    parsed = urlparse(value)
    return parsed.scheme in {"http", "https"} and bool(parsed.netloc)


def is_youtube_url(value: str) -> bool:
    host = urlparse(value).netloc.lower()
    return "youtube.com" in host or "youtu.be" in host


def is_text_path(path: Path) -> bool:
    return path.suffix.lower() in TEXT_EXTENSIONS


def file_state_name(file_obj: Any) -> str:
    state = getattr(file_obj, "state", None)
    if state is None:
        return ""
    if isinstance(state, str):
        return state
    return getattr(state, "name", str(state))


def upload_and_wait(client: Any, path: Path) -> Any:
    uploaded = client.files.upload(file=str(path))
    state_name = file_state_name(uploaded)
    while state_name.endswith("PROCESSING"):
        time.sleep(2)
        uploaded = client.files.get(name=uploaded.name)
        state_name = file_state_name(uploaded)
    if state_name.endswith("FAILED"):
        raise RuntimeError(f"Gemini file processing failed for {path}")
    return uploaded


def normalize_job_inputs(job: dict[str, Any]) -> list[dict[str, Any]]:
    if isinstance(job.get("inputs"), list) and job["inputs"]:
        raw_inputs = job["inputs"]
    elif job.get("input") is not None:
        raw_inputs = [job["input"]]
    else:
        raise ValueError(f"Analysis job '{job.get('id')}' requires 'input' or 'inputs'")

    normalized: list[dict[str, Any]] = []
    for item in raw_inputs:
        if isinstance(item, str):
            if is_url(item):
                normalized.append({"url": item})
            else:
                normalized.append({"path": item})
            continue
        if isinstance(item, dict):
            if any(key in item for key in ("path", "url", "text")):
                normalized.append(item)
                continue
        raise ValueError(f"Unsupported input entry for job '{job.get('id')}': {item!r}")
    return normalized


def read_text_input(base_dir: Path, path_value: str) -> tuple[str, str]:
    path = resolve_path(base_dir, path_value, path_value)
    content = Path(path).read_text(encoding="utf-8")
    return str(path), content


def build_contents(
    client: Any,
    types: Any,
    base_dir: Path,
    inputs: list[dict[str, Any]],
) -> tuple[list[Any], list[dict[str, str]]]:
    contents: list[Any] = []
    descriptors: list[dict[str, str]] = []

    for index, item in enumerate(inputs, start=1):
        label = str(item.get("label") or f"input_{index}")
        if "text" in item:
            text_value = str(item["text"])
            contents.append(f"TEXT INPUT [{label}]:\n{text_value}")
            descriptors.append({"label": label, "kind": "text", "source": "inline"})
            continue

        if "url" in item:
            url = str(item["url"])
            if is_youtube_url(url):
                contents.append(types.Part(file_data=types.FileData(file_uri=url)))
                descriptors.append({"label": label, "kind": "youtube", "source": url})
                continue
            raise ValueError(
                f"Remote URL inputs currently support YouTube only. Download other media locally first: {url}"
            )

        path_str = str(item["path"])
        resolved_path = Path(resolve_path(base_dir, path_str, path_str))
        if is_text_path(resolved_path):
            _, content = read_text_input(base_dir, path_str)
            contents.append(f"TEXT FILE [{label}] ({resolved_path.name}):\n{content}")
            descriptors.append({"label": label, "kind": "text", "source": str(resolved_path)})
            continue

        uploaded = upload_and_wait(client, resolved_path)
        contents.append(uploaded)
        descriptors.append({"label": label, "kind": "file", "source": str(resolved_path)})

    return contents, descriptors


def build_prompt(job: dict[str, Any], mode: str, descriptors: list[dict[str, str]]) -> str:
    query = str(job.get("query") or "").strip()
    custom_prompt = str(job.get("prompt") or "").strip()
    descriptor_lines = [
        f"- {item['label']}: {item['kind']} ({item['source']})" for item in descriptors
    ]

    instructions: list[str] = [
        "Analyze the provided inputs for a video-production workflow.",
        "Treat image, video, audio, and text as equal-class sources of signal.",
        "Return only JSON matching the provided schema.",
        "If a field has no useful content, return null for nullable fields or [] for arrays.",
        "Use MM:SS timestamps for audio/video key moments when possible.",
        "Be concrete and production-useful, not academic.",
        "",
        "Inputs:",
        *descriptor_lines,
        "",
    ]

    if mode == "describe":
        instructions.append(
            "Mode: describe. Summarize what is happening, extract important subjects, visible text, style, audio character, and key moments."
        )
    elif mode == "extract_style":
        instructions.append(
            "Mode: extract_style. Focus on visual grammar, composition, colour, lighting, motion, performance texture, sound texture, and any repeatable style cues."
        )
    elif mode == "extract_subjects":
        instructions.append(
            "Mode: extract_subjects. Focus on people, objects, actions, places, symbols, and any recurring motifs."
        )
    elif mode == "transcribe":
        instructions.append(
            "Mode: transcribe. Prioritize spoken words, sung words, readable on-screen text, and timing of key moments."
        )
    elif mode == "qa":
        instructions.append(
            "Mode: qa. Answer the user's question directly and keep supporting observations compact."
        )
    elif mode == "compare":
        instructions.append(
            "Mode: compare. Compare the inputs against each other and call out the strongest differences that matter for production decisions."
        )
    elif mode == "match_to_line":
        instructions.append(
            "Mode: match_to_line. Judge how well the input fits the target beat or line and explain where it does or does not land."
        )
    else:
        instructions.append(
            f"Mode: {mode}. Use the mode label as guidance and still return the standard schema."
        )

    if query:
        instructions.extend(["", f"Primary question or target: {query}"])
    if custom_prompt:
        instructions.extend(["", f"Additional instructions: {custom_prompt}"])

    return "\n".join(instructions)


def parse_json_response(response_text: str) -> dict[str, Any]:
    cleaned = response_text.strip()
    if cleaned.startswith("```"):
        cleaned = re.sub(r"^```(?:json)?\s*", "", cleaned)
        cleaned = re.sub(r"\s*```$", "", cleaned)
    return json.loads(cleaned)


def analyze_job(
    client: Any,
    types: Any,
    manifest_path: Path,
    defaults: dict[str, Any],
    job: dict[str, Any],
) -> dict[str, Any]:
    mode = str(job.get("mode") or defaults.get("mode") or "describe")
    model = resolve_model(str(job.get("model") or defaults.get("model") or "pro"))
    inputs = normalize_job_inputs(job)
    contents, descriptors = build_contents(client, types, manifest_path.parent, inputs)
    prompt = build_prompt(job, mode, descriptors)
    contents.append(prompt)

    config: dict[str, Any] = {
        "response_mime_type": "application/json",
        "response_json_schema": MEDIA_SCHEMA,
        "safety_settings": build_gemini_safety_settings(types),
    }
    media_resolution = job.get("media_resolution", defaults.get("media_resolution"))
    if media_resolution:
        config["media_resolution"] = media_resolution
    temperature = job.get("temperature", defaults.get("temperature"))
    if temperature is not None:
        config["temperature"] = temperature

    response = client.models.generate_content(
        model=model,
        contents=contents,
        config=types.GenerateContentConfig(**config),
    )

    response_text = getattr(response, "text", "") or ""
    try:
        analysis = parse_json_response(response_text)
    except Exception:
        analysis = {
            "kind": "unknown",
            "summary": response_text.strip(),
            "transcript": None,
            "subjects": [],
            "style_notes": [],
            "audio_notes": [],
            "text_in_media": [],
            "key_moments": [],
            "fit_assessment": None,
            "comparison": None,
            "answer": None,
            "confidence_notes": ["Model response was not parseable JSON; raw text was placed in summary."],
        }

    return {
        "job_id": str(job.get("id") or "analysis"),
        "mode": mode,
        "model": model,
        "inputs": descriptors,
        "analysis": analysis,
    }


def parse_args(argv: list[str] | None = None) -> argparse.Namespace:
    parser = argparse.ArgumentParser(description="Gemini-backed multimodal media analysis for Varnam")
    parser.add_argument("--jobs", required=True, help="Path to media analysis jobs manifest")
    parser.add_argument("--job-id", help="Run only a specific job id")
    return parser.parse_args(argv)


def main(argv: list[str] | None = None) -> int:
    args = parse_args(argv)

    manifest, manifest_path = load_manifest(args.jobs)
    provider = manifest.get("provider", "gemini")
    if provider != "gemini":
        raise ValueError(f"Unsupported analysis provider '{provider}'. Expected 'gemini'.")

    client, types = get_client()
    defaults = manifest.get("defaults", {})
    jobs = select_jobs(manifest, args.job_id)
    results = []

    for job in jobs:
        analysis = analyze_job(client, types, manifest_path, defaults, job)
        results.append(analysis)

        if job.get("output"):
            output_path = resolve_path(manifest_path.parent, job["output"], job["output"])
            write_json(output_path, analysis)

    print_json({"status": "ok", "provider": "gemini", "results": results})
    return 0


if __name__ == "__main__":
    try:
        raise SystemExit(main())
    except Exception as exc:
        print_json({"status": "error", "error": str(exc)})
        sys.exit(1)
