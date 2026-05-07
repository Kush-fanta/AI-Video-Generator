#!/usr/bin/env python3
# ---
# varnam_script: review.artifact_report
# owner: reviewer
# status: live
# surface: python3 scripts/run.py review:artifact-report
# purpose: Reverse-engineer local artifact bundles into a structured implementation report.
# use_when: Inspect local .zip/.html/.jsx artifact bundles before promoting lessons into craft or channel files.
# inputs: CLI path to .zip/.html/.jsx/.js/.ts/.tsx/.md/.json plus optional --report path
# outputs: JSON report on stdout and optional report file; exit code 0 clean, 1 invalid/unreadable, 2 unsupported input
# authority: scripts/README.md; scripts/SCRIPT_MAP.md
# ---
"""Produce a deterministic report for local design/code artifact bundles."""

from __future__ import annotations

import argparse
import hashlib
import json
import re
import sys
import tempfile
import zipfile
from datetime import datetime, timezone
from pathlib import Path
from typing import Any

TEXT_SUFFIXES = {
    ".css",
    ".htm",
    ".html",
    ".js",
    ".jsx",
    ".json",
    ".md",
    ".mjs",
    ".svg",
    ".ts",
    ".tsx",
    ".txt",
    ".yaml",
    ".yml",
}
SUPPORTED_SUFFIXES = TEXT_SUFFIXES | {".zip"}
IMAGE_SUFFIXES = {".jpg", ".jpeg", ".png", ".webp", ".gif"}
VIDEO_SUFFIXES = {".mp4", ".mov", ".m4v", ".webm"}
AUDIO_SUFFIXES = {".mp3", ".wav", ".m4a", ".aac", ".flac", ".ogg"}

PATTERNS: dict[str, tuple[str, str]] = {
    "beat_timeline": ("timing", r"\bBEATS\b|t:\s*\d+(?:\.\d+)?\s*,\s*d:\s*\d+(?:\.\d+)?"),
    "declared_total_duration": ("timing", r"\bTOTAL\b|duration\s*[:=]\s*\d+"),
    "runtime_clock": ("timing", r"\buseTime\b|useCurrentBeat|currentTime|requestAnimationFrame"),
    "react_runtime": ("framework", r"ReactDOM|from ['\"]react['\"]|type=\"text/babel\""),
    "remotion_reference": ("framework", r"\bremotion\b|useCurrentFrame|Composition\b"),
    "hyperframes_reference": ("framework", r"data-composition-id|data-start|data-duration|data-variable-values"),
    "bundled_html": ("framework", r"__bundler/(?:manifest|template)|__bundler_thumbnail"),
    "gsap_reference": ("animation", r"\bgsap\b|TimelineMax|TweenMax"),
    "randomness": ("warning", r"Math\.random\(|random\("),
    "image_prompt_pack": ("implementation", r"negative prompt|global suffix|save files in|image prompt"),
    "design_doctrine": ("implementation", r"palette|typography|motion|visual mode|negative space|voice|audio"),
    "audio_synthesis": ("implementation", r"AudioContext|Oscillator|createGain|voice_id|elevenlabs"),
    "media_reference": ("media", r"src=[\"'][^\"']+|url\([^)]+\)|uploads/|assets/"),
}


def hash_file(path: Path) -> str:
    digest = hashlib.sha256()
    with path.open("rb") as fh:
        for chunk in iter(lambda: fh.read(1024 * 1024), b""):
            digest.update(chunk)
    return digest.hexdigest()


def read_text_prefix(path: Path, limit: int = 262_144) -> str:
    return path.read_text(encoding="utf-8", errors="ignore")[:limit]


def image_dimensions(path: Path) -> str | None:
    data = path.read_bytes()[:64]
    if data.startswith(b"\x89PNG\r\n\x1a\n") and len(data) >= 24:
        width = int.from_bytes(data[16:20], "big")
        height = int.from_bytes(data[20:24], "big")
        return f"{width}x{height}"
    if data.startswith(b"\xff\xd8"):
        raw = path.read_bytes()
        i = 2
        while i + 9 < len(raw):
            if raw[i] != 0xFF:
                i += 1
                continue
            marker = raw[i + 1]
            if marker in {0xC0, 0xC2}:
                height = int.from_bytes(raw[i + 5 : i + 7], "big")
                width = int.from_bytes(raw[i + 7 : i + 9], "big")
                return f"{width}x{height}"
            size = int.from_bytes(raw[i + 2 : i + 4], "big")
            i += 2 + size
    return None


def source_type(path: Path) -> str:
    if path.is_dir():
        return "directory"
    suffix = path.suffix.lower()
    if suffix == ".zip":
        return "zip"
    if suffix in {".html", ".htm"}:
        return "html"
    if suffix in {".js", ".jsx", ".ts", ".tsx", ".mjs"}:
        return "jsx"
    return suffix.lstrip(".") or "unknown"


def file_kind(path: Path, dimensions: str | None) -> str:
    suffix = path.suffix.lower()
    if dimensions or suffix in IMAGE_SUFFIXES:
        return "image"
    if suffix in VIDEO_SUFFIXES:
        return "video"
    if suffix in AUDIO_SUFFIXES:
        return "audio"
    if suffix in TEXT_SUFFIXES:
        return "text"
    return suffix.lstrip(".") or "unknown"


def scan_text(path: Path) -> dict[str, list[str]]:
    if path.suffix.lower() not in TEXT_SUFFIXES:
        return {}
    text = read_text_prefix(path)
    signals: dict[str, list[str]] = {}
    for name, (category, pattern) in PATTERNS.items():
        if re.search(pattern, text, flags=re.IGNORECASE):
            signals.setdefault(category, []).append(name)
    return signals


def media_refs(path: Path) -> list[str]:
    if path.suffix.lower() not in TEXT_SUFFIXES:
        return []
    text = read_text_prefix(path)
    refs = set()
    for match in re.finditer(r"(?:src|href)=['\"]([^'\"]+)['\"]|url\(['\"]?([^)'\"\s]+)", text):
        ref = match.group(1) or match.group(2)
        if ref and not ref.startswith(("http://", "https://", "data:")):
            refs.add(ref)
    return sorted(refs)[:50]


def record_file(path: Path, display_path: Path) -> dict[str, Any]:
    dimensions = image_dimensions(path)
    signals = scan_text(path)
    return {
        "path": display_path.as_posix(),
        "size": path.stat().st_size,
        "sha256": hash_file(path),
        "kind": file_kind(path, dimensions),
        "dimensions": dimensions,
        "signals": signals,
        "media_refs": media_refs(path),
    }


def iter_files(path: Path) -> list[tuple[Path, Path]]:
    if path.is_file():
        return [(path, Path(path.name))]
    return [(item, item.relative_to(path)) for item in sorted(path.rglob("*")) if item.is_file()]


def extract_files(path: Path) -> tuple[str, list[dict[str, Any]], int | None]:
    if path.is_file() and path.suffix.lower() == ".zip":
        with zipfile.ZipFile(path) as archive:
            members = [info for info in archive.infolist() if not info.is_dir()]
            with tempfile.TemporaryDirectory(prefix="varnam-artifact-report-") as tmp:
                tmp_root = Path(tmp)
                archive.extractall(tmp_root)
                records = []
                for member in members:
                    extracted = tmp_root / member.filename
                    if extracted.exists() and extracted.is_file():
                        records.append(record_file(extracted, Path(member.filename)))
            return "zip", records, sum(info.file_size for info in members)

    return source_type(path), [record_file(real, display) for real, display in iter_files(path)], None


def flatten_signal(records: list[dict[str, Any]], category: str) -> list[str]:
    found = set()
    for record in records:
        found.update(record["signals"].get(category, []))
    return sorted(found)


def summarize_files(records: list[dict[str, Any]]) -> list[dict[str, Any]]:
    return sorted(
        [
            {
                "path": record["path"],
                "kind": record["kind"],
                "size": record["size"],
                "dimensions": record["dimensions"],
                "signals": record["signals"],
            }
            for record in records
        ],
        key=lambda item: item["size"],
        reverse=True,
    )


def entrypoints(records: list[dict[str, Any]]) -> list[str]:
    candidates = []
    for record in records:
        name = Path(record["path"]).name.lower()
        if name in {"index.html", "video.jsx", "app.jsx", "main.jsx", "panchatantra.html"}:
            candidates.append(record["path"])
    return sorted(candidates)


def promotion_candidates(records: list[dict[str, Any]]) -> list[dict[str, str]]:
    candidates = []
    for record in records:
        signals = {name for names in record["signals"].values() for name in names}
        path = record["path"]
        if "design_doctrine" in signals or "image_prompt_pack" in signals:
            candidates.append({"path": path, "target": "craft/channel", "reason": "design or prompt doctrine"})
        if "beat_timeline" in signals:
            candidates.append({"path": path, "target": "craft/storyboarding", "reason": "explicit beat timing"})
        if "hyperframes_reference" in signals:
            candidates.append({"path": path, "target": "runtime/hyperframes", "reason": "HyperFrames timing surface"})
        if "bundled_html" in signals:
            candidates.append({"path": path, "target": "reference-only", "reason": "self-contained exported HTML bundle"})
    return candidates


def warnings_for(records: list[dict[str, Any]]) -> list[str]:
    warnings = []
    if any("randomness" in record["signals"].get("warning", []) for record in records):
        warnings.append("unseeded randomness detected; do not copy into render-time code")
    if any("remotion_reference" in record["signals"].get("framework", []) for record in records):
        warnings.append("Remotion references detected; translate lessons to current runtime instead of preserving old doctrine")
    if any("runtime_clock" in record["signals"].get("timing", []) for record in records):
        warnings.append("script-controlled timeline detected; HyperFrames timing must move to data attributes")
    return warnings


def build_report(path: Path) -> dict[str, Any]:
    resolved = path.expanduser().resolve()
    if not resolved.exists():
        raise FileNotFoundError(str(path))
    if resolved.is_file() and resolved.suffix.lower() not in SUPPORTED_SUFFIXES:
        raise ValueError(f"unsupported input extension: {resolved.suffix}")

    kind, records, uncompressed_size = extract_files(resolved)
    media = sorted(
        {
            ref
            for record in records
            for ref in record.get("media_refs", [])
            if ref
        }
    )
    return {
        "ok": True,
        "status": "passed",
        "source": str(resolved),
        "source_type": kind,
        "generated_at": datetime.now(timezone.utc).isoformat(),
        "sha256": hash_file(resolved) if resolved.is_file() else None,
        "uncompressed_size": uncompressed_size,
        "files": summarize_files(records),
        "entrypoints": entrypoints(records),
        "framework_signals": flatten_signal(records, "framework"),
        "animation_signals": flatten_signal(records, "animation"),
        "timing_signals": flatten_signal(records, "timing"),
        "asset_refs": [record["path"] for record in records if record["kind"] == "image"],
        "media_refs": media[:100],
        "implementation_patterns": flatten_signal(records, "implementation"),
        "promotion_candidates": promotion_candidates(records),
        "warnings": warnings_for(records),
        "errors": [],
    }


def parse_args(argv: list[str] | None = None) -> argparse.Namespace:
    parser = argparse.ArgumentParser(
        description="Reverse-engineer a local artifact bundle into a deterministic JSON report."
    )
    parser.add_argument("path", help="Local .zip, .html, .jsx, or directory to inspect.")
    parser.add_argument("--report", help="Optional path to write the JSON report.")
    return parser.parse_args(argv)


def main(argv: list[str] | None = None) -> int:
    args = parse_args(argv)
    try:
        report = build_report(Path(args.path))
    except FileNotFoundError as exc:
        print(json.dumps({"ok": False, "status": "failed", "errors": [str(exc)]}), file=sys.stderr)
        return 1
    except (ValueError, zipfile.BadZipFile) as exc:
        print(json.dumps({"ok": False, "status": "unsupported", "errors": [str(exc)]}), file=sys.stderr)
        return 2

    rendered = json.dumps(report, indent=2, sort_keys=True) + "\n"
    print(rendered, end="")
    if args.report:
        output = Path(args.report)
        output.parent.mkdir(parents=True, exist_ok=True)
        output.write_text(rendered, encoding="utf-8")
    return 0


if __name__ == "__main__":
    raise SystemExit(main())
