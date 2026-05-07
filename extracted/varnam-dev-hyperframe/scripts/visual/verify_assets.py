#!/usr/bin/env python3
# ---
# varnam_script: visual.verify_assets
# owner: researcher,visual
# status: live
# surface: direct-only
# purpose: Downloaded media verification gate.
# use_when: Verify acquired media before accepting it into production.
# inputs: CLI args, manifests, env vars, or imports documented by argparse/docstring
# outputs: files, JSON/stdout reports, or process exit code documented by the script
# authority: scripts/README.md; scripts/SCRIPT_MAP.md
# ---
"""Verification pass for downloaded research assets.

This script reads a download manifest, runs Gemini-backed verification on every
downloaded file, and writes `assets.json` with rights and usability decisions.
"""

from __future__ import annotations

import argparse
import json
import subprocess
import sys
import time
from datetime import datetime, timezone
from pathlib import Path
from typing import Any

SCRIPTS_DIR = Path(__file__).resolve().parent
SCRIPT_ROOT = SCRIPTS_DIR.parent
if str(SCRIPT_ROOT) not in sys.path:
    sys.path.insert(0, str(SCRIPT_ROOT))

from research.asset_download import evaluate_download_policy, normalize_license
MEDIA_EXTENSIONS = {
    "image": {".jpg", ".jpeg", ".png", ".gif", ".webp", ".bmp", ".tiff", ".svg"},
    "video": {".mp4", ".mkv", ".webm", ".avi", ".mov"},
    "audio": {".mp3", ".wav", ".ogg", ".flac", ".m4a", ".aac"},
    "document": {".pdf"},
}

def detect_asset_type(asset: dict[str, Any]) -> str:
    declared = str(asset.get("asset_type") or "").strip().lower()
    if declared:
        return declared
    local_path = Path(str(asset.get("local_path") or ""))
    suffix = local_path.suffix.lower()
    for asset_type, extensions in MEDIA_EXTENSIONS.items():
        if suffix in extensions:
            return asset_type
    return "file"


def needs_verification(asset: dict[str, Any]) -> bool:
    local_path = Path(str(asset.get("local_path") or ""))
    return local_path.exists() and local_path.stat().st_size > 0


def get_verification_mode(asset: dict[str, Any]) -> str:
    return "transcribe" if detect_asset_type(asset) == "audio" else "qa"


def build_verification_prompt(asset: dict[str, Any], script_context: str | None) -> str:
    asset_type = detect_asset_type(asset)
    description = str(asset.get("description") or "unknown content").strip()
    rights_note = str(asset.get("rights_note") or "").strip()
    instructions = [
        f"Verify this {asset_type} for documentary production use.",
        f'Expected content: "{description}"',
        "Answer four things concisely:",
        "1) Does the file actually contain the claimed content?",
        "2) Is it specific and production-usable rather than generic filler?",
        "3) For screenshots or documents, is the content readable and free of login walls, cookie walls, captchas, or obvious error states?",
        "4) Mention any visible clues that undermine authenticity or relevance.",
    ]
    if rights_note:
        instructions.append(f"Recorded rights note: {rights_note}")
    if script_context:
        instructions.append(f"Script context: {script_context}")
    return " ".join(instructions)


def build_analysis_manifest(
    assets: list[dict[str, Any]],
    script_contexts: dict[str, str],
    manifest_path: Path,
) -> Path:
    jobs: list[dict[str, Any]] = []
    for asset in assets:
        if not needs_verification(asset):
            continue
        asset_id = str(asset.get("id") or f"asset-{len(jobs) + 1}")
        topic_id = str(asset.get("topic_id") or "")
        jobs.append(
            {
                "id": asset_id,
                "input": str(asset["local_path"]),
                "mode": get_verification_mode(asset),
                "query": build_verification_prompt(asset, script_contexts.get(topic_id)),
            }
        )

    manifest = {
        "provider": "gemini",
        "defaults": {"mode": "qa"},
        "jobs": jobs,
    }
    manifest_path.parent.mkdir(parents=True, exist_ok=True)
    with manifest_path.open("w", encoding="utf-8") as handle:
        json.dump(manifest, handle, indent=2, ensure_ascii=False)
    return manifest_path


def run_analysis(manifest_path: Path, timeout_seconds: int) -> list[dict[str, Any]]:
    cmd = [sys.executable, str(SCRIPTS_DIR / "analyze_media.py"), "--jobs", str(manifest_path)]
    proc = subprocess.run(cmd, capture_output=True, text=True, timeout=timeout_seconds)
    if proc.returncode != 0:
        raise RuntimeError(proc.stderr.strip() or proc.stdout.strip() or "analyze_media.py failed")
    payload = json.loads(proc.stdout)
    if payload.get("status") != "ok":
        raise RuntimeError(payload.get("error", "analysis failed"))
    return payload.get("results", [])


def extract_script_contexts(script_path: str | None, topics: list[dict[str, Any]]) -> dict[str, str]:
    contexts: dict[str, str] = {}
    if not script_path:
        return contexts
    script_file = Path(script_path)
    if not script_file.exists():
        return contexts

    script_text = script_file.read_text(encoding="utf-8")
    lines = script_text.splitlines()
    for topic in topics:
        topic_id = str(topic.get("topic_id") or topic.get("id") or "").strip()
        if not topic_id:
            continue
        refs = topic.get("script_refs") or []
        snippets: list[str] = []
        for ref in refs:
            ref_text = str(ref)
            if "line" in ref_text.lower():
                try:
                    line_number = int(ref_text.lower().split("line")[-1].strip().split()[0])
                except (ValueError, IndexError):
                    snippets.append(ref_text)
                    continue
                start = max(0, line_number - 2)
                end = min(len(lines), line_number + 2)
                snippets.append(" ".join(lines[start:end]))
            else:
                snippets.append(ref_text)
        label = str(topic.get("label") or "")
        context = " | ".join(part for part in [label, *snippets[:3]] if part)
        if context:
            contexts[topic_id] = context[:600]
    return contexts


def interpret_verification(analysis: dict[str, Any]) -> tuple[bool | None, str]:
    result = analysis.get("analysis", {})
    answer = str(result.get("answer") or "")
    summary = str(result.get("summary") or "")
    confidence_notes = result.get("confidence_notes") or []
    combined = f"{answer} {summary}".lower()

    rejection_signals = {
        "does not show",
        "does not contain",
        "mismatch",
        "unrelated",
        "wrong person",
        "wrong place",
        "wrong event",
        "generic",
        "cookie banner",
        "login wall",
        "captcha",
        "access denied",
        "error page",
        "not readable",
        "not legible",
        "cannot verify",
    }
    verification_signals = {
        "matches",
        "contains the claimed",
        "shows the claimed",
        "authentic",
        "readable",
        "legible",
        "relevant",
        "production-usable",
    }

    rejection_score = sum(1 for signal in rejection_signals if signal in combined)
    verification_score = sum(1 for signal in verification_signals if signal in combined)
    notes = answer or summary
    if confidence_notes:
        notes = (notes + " | " if notes else "") + "Confidence: " + "; ".join(str(note) for note in confidence_notes)

    if rejection_score > verification_score and rejection_score > 0:
        return False, notes
    if verification_score > rejection_score and verification_score > 0:
        return True, notes
    return None, notes or "Gemini did not give a decisive answer"


def build_asset_record(asset: dict[str, Any], analysis: dict[str, Any] | None) -> dict[str, Any]:
    allowed, rights_reason = evaluate_download_policy(asset)
    local_path = str(asset.get("local_path") or "")
    verified, verification_notes = (None, "analysis not run")
    if analysis is not None:
        verified, verification_notes = interpret_verification(analysis)

    return {
        "id": asset.get("id"),
        "type": detect_asset_type(asset),
        "description": asset.get("description", ""),
        "source_url": asset.get("source_url", ""),
        "local_path": local_path,
        "license": normalize_license(asset.get("license_claim")),
        "rights_note": asset.get("rights_note", ""),
        "rights_clear": allowed,
        "rights_notes": rights_reason,
        "topic_id": asset.get("topic_id", ""),
        "script_refs": asset.get("script_refs", []),
        "verified": verified,
        "verification_method": get_verification_mode(asset) if analysis is not None else "none",
        "verification_notes": verification_notes,
        "usable": allowed and verified is True,
        "file_size_bytes": Path(local_path).stat().st_size if local_path and Path(local_path).exists() else 0,
    }


def parse_args(argv: list[str] | None = None) -> argparse.Namespace:
    parser = argparse.ArgumentParser(description="Verify downloaded research assets")
    parser.add_argument("--manifest", required=True, help="Path to download_manifest.json")
    parser.add_argument("--script", help="Optional narrative/script path for context")
    parser.add_argument("--topics", help="Optional topics.json path for script_refs context")
    parser.add_argument("--output", help="Output path for assets.json")
    parser.add_argument("--log", help="Optional research_log.jsonl path")
    parser.add_argument("--analysis-timeout", type=int, default=120, help="Max seconds per analyze_media.py invocation")
    return parser.parse_args(argv)


def main(argv: list[str] | None = None) -> int:
    args = parse_args(argv)

    with Path(args.manifest).open("r", encoding="utf-8") as handle:
        manifest = json.load(handle)
    assets = manifest.get("assets", [])
    downloaded_assets = [asset for asset in assets if asset.get("status") in {"ok", "skipped"} and needs_verification(asset)]

    topics: list[dict[str, Any]] = []
    if args.topics and Path(args.topics).exists():
        with Path(args.topics).open("r", encoding="utf-8") as handle:
            topic_payload = json.load(handle)
        if isinstance(topic_payload, dict):
            topics = topic_payload.get("topics", [])

    logger = None
    if args.log:
        from research.research_logger import ResearchLogger

        logger = ResearchLogger(args.log)

    script_contexts = extract_script_contexts(args.script, topics)
    analysis_map: dict[str, dict[str, Any]] = {}
    analysis_errors: list[str] = []
    if downloaded_assets:
        analysis_manifest_path = Path(args.manifest).resolve().parent / "verify_manifest.json"
        build_analysis_manifest(downloaded_assets, script_contexts, analysis_manifest_path)
        start = time.monotonic()
        results: list[dict[str, Any]] = []
        try:
            results = run_analysis(analysis_manifest_path, timeout_seconds=args.analysis_timeout)
        except Exception as exc:
            analysis_errors.append(f"batch: {exc}")
            if logger:
                logger.log(
                    "verify_analysis",
                    agent="verify_assets.py",
                    status="error",
                    error=str(exc),
                )
            for asset in downloaded_assets:
                single_manifest_path = analysis_manifest_path.with_name(f"verify-{asset.get('id')}.json")
                build_analysis_manifest([asset], script_contexts, single_manifest_path)
                try:
                    results.extend(run_analysis(single_manifest_path, timeout_seconds=args.analysis_timeout))
                except Exception as single_exc:
                    message = f"{asset.get('id')}: {single_exc}"
                    analysis_errors.append(message)
                    if logger:
                        logger.log(
                            "verify_asset",
                            agent="verify_assets.py",
                            asset_id=asset.get("id"),
                            status="error",
                            error=str(single_exc),
                        )
        elapsed = int((time.monotonic() - start) * 1000)
        analysis_map = {str(result.get("job_id")): result for result in results}
        if logger:
            logger.log(
                "verify_analysis",
                agent="verify_assets.py",
                total=len(results),
                duration_ms=elapsed,
                status="ok",
            )

    verified_assets = [
        build_asset_record(asset, analysis_map.get(str(asset.get("id"))))
        for asset in downloaded_assets
    ]
    failed_assets = [asset for asset in assets if asset.get("status") == "error"]

    output = {
        "project": str(Path(args.manifest).resolve().parent.parent),
        "researched_at": datetime.now(timezone.utc).isoformat(),
        "total_assets": len(verified_assets),
        "verified_assets": sum(1 for asset in verified_assets if asset.get("verified") is True),
        "rejected_assets": sum(1 for asset in verified_assets if asset.get("verified") is False),
        "uncertain_assets": sum(1 for asset in verified_assets if asset.get("verified") is None),
        "usable_assets": sum(1 for asset in verified_assets if asset.get("usable") is True),
        "assets": verified_assets,
        "analysis_errors": analysis_errors,
        "gaps": [
            {
                "topic_id": asset.get("topic_id", ""),
                "description": asset.get("description", ""),
                "source_url": asset.get("source_url", ""),
                "error": asset.get("error", ""),
            }
            for asset in failed_assets
        ],
    }

    output_path = Path(args.output) if args.output else Path(args.manifest).resolve().parent / "assets.json"
    output_path.parent.mkdir(parents=True, exist_ok=True)
    with output_path.open("w", encoding="utf-8") as handle:
        json.dump(output, handle, indent=2, ensure_ascii=False)

    if logger:
        logger.log(
            "verify_all",
            agent="verify_assets.py",
            total=output["total_assets"],
            usable=output["usable_assets"],
            rejected=output["rejected_assets"],
            uncertain=output["uncertain_assets"],
            status="ok",
        )

    print(json.dumps({"status": "ok", "output": str(output_path), "usable": output["usable_assets"]}, indent=2))
    return 0


if __name__ == "__main__":
    try:
        raise SystemExit(main())
    except Exception as exc:
        print(json.dumps({"status": "error", "error": str(exc)}, indent=2))
        sys.exit(1)
