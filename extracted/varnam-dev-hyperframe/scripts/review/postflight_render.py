#!/usr/bin/env python3
# ---
# varnam_script: review.postflight_render
# owner: reviewer
# status: live
# surface: python3 scripts/run.py render:postflight
# purpose: Post-render deterministic QC wrapper.
# use_when: Run timing and signal checks after render.
# inputs: CLI args, manifests, env vars, or imports documented by argparse/docstring
# outputs: files, JSON/stdout reports, or process exit code documented by the script
# authority: scripts/README.md; scripts/SCRIPT_MAP.md
# ---
"""Post-render wrapper over timing contract and deterministic analyzers."""

from __future__ import annotations

import argparse
import json
import re
import sys
from datetime import datetime, timezone
from pathlib import Path
from typing import Any


REVIEW_DIR = Path(__file__).resolve().parent
SCRIPTS_DIR = REVIEW_DIR.parent
REPO_ROOT = SCRIPTS_DIR.parent
BENCHMARKS_DIR = REVIEW_DIR / "benchmarks"

for candidate in (REVIEW_DIR, BENCHMARKS_DIR):
    candidate_text = str(candidate)
    if candidate_text not in sys.path:
        sys.path.insert(0, candidate_text)

from cut_rate import analyze_video as analyze_cut_rate  # noqa: E402
from frame_integrity import analyze_video as analyze_frame_integrity  # noqa: E402
from project_artifacts import resolve_artifact_path, resolve_rendered_video_path  # noqa: E402
from speech_masking import analyze_mix as analyze_speech_masking  # noqa: E402
from timing_contract import run_timing_contract  # noqa: E402
from visual_novelty import analyze_video as analyze_visual_novelty  # noqa: E402


DEFAULT_VOICEOVER = "audio/voiceover.mp3"
DEFAULT_WORDS = "audio/voiceover.words.json"
DEFAULT_LOCK = "audio/timing.lock.json"
DEFAULT_MAX_MASK_RUN_SECONDS = 1.5
CHANNEL_DECL_RE = re.compile(r"^\*\*Channel:\*\*\s*([A-Za-z0-9_-]+)\s*$", re.MULTILINE)
CHANNEL_PATH_RE = re.compile(r"channels/([a-z0-9_-]+)/")
CUT_RATE_RE = re.compile(r'cut_rate_avg:\s*"?(?P<low>\d+(?:\.\d+)?)', re.IGNORECASE)
HOLD_MAX_RE = re.compile(r"hold_max_sec:\s*(?P<value>\d+(?:\.\d+)?)", re.IGNORECASE)
PURE_TYPE_MAX_RE = re.compile(
    r"pure_type_stretch_max_seconds:\s*\"?(?P<value>\d+(?:\.\d+)?)",
    re.IGNORECASE,
)
PURE_TYPE_LEDGER_RE = re.compile(
    r"Pure-type stretch max\s*\|\s*(?P<value>\d+(?:\.\d+)?)\s*seconds",
    re.IGNORECASE,
)


def _detect_channel(project: Path) -> str | None:
    candidates = [
        project / "task-config.md",
        project / "direction" / "board" / "index.md",
        project / "build" / "mograph-spec.md",
    ]
    for path in candidates:
        if not path.exists():
            continue
        text = path.read_text(encoding="utf-8", errors="ignore")
        declared = CHANNEL_DECL_RE.search(text)
        if declared:
            return declared.group(1).strip().lower()
        referenced = CHANNEL_PATH_RE.search(text)
        if referenced:
            return referenced.group(1).strip().lower()
    return None


def _load_channel_gates(channel: str | None) -> dict[str, float | None]:
    if not channel:
        return {"min_cuts_per_minute": None, "hold_max_seconds": None}
    ledger_path = REPO_ROOT / "channels" / channel / "ledger.md"
    design_path = REPO_ROOT / "channels" / channel / "design.md"
    legacy_config_path = REPO_ROOT / "channels" / channel / "config.md"
    source_path = (
        ledger_path
        if ledger_path.exists()
        else design_path
        if design_path.exists()
        else legacy_config_path
    )
    if not source_path.exists():
        return {"min_cuts_per_minute": None, "hold_max_seconds": None}

    text = source_path.read_text(encoding="utf-8", errors="ignore")
    cpm_match = CUT_RATE_RE.search(text)
    hold_match = (
        HOLD_MAX_RE.search(text)
        or PURE_TYPE_MAX_RE.search(text)
        or PURE_TYPE_LEDGER_RE.search(text)
    )
    return {
        "min_cuts_per_minute": (
            float(cpm_match.group("low")) if cpm_match else None
        ),
        "hold_max_seconds": (
            float(hold_match.group("value")) if hold_match else None
        ),
    }


def _report_issue(bucket: list[str], message: str) -> None:
    if message not in bucket:
        bucket.append(message)


def _write_report(report_path: Path, report: dict[str, Any]) -> None:
    report_path.parent.mkdir(parents=True, exist_ok=True)
    report_path.write_text(json.dumps(report, indent=2), encoding="utf-8")


def _set_check_result(
    check_results: dict[str, dict[str, Any]],
    name: str,
    *,
    status: str,
    required: bool,
    message: str | None = None,
) -> None:
    payload: dict[str, Any] = {
        "status": status,
        "required": required,
    }
    if message:
        payload["message"] = message
    check_results[name] = payload


def _derive_report_status(
    errors: list[str],
    check_results: dict[str, dict[str, Any]],
) -> tuple[str, bool, list[str]]:
    skipped_required = [
        name
        for name, payload in check_results.items()
        if payload["required"] and payload["status"] == "skipped"
    ]
    if errors:
        return "failed", False, skipped_required
    if skipped_required:
        return "partial", False, skipped_required
    return "passed", True, skipped_required


def run_postflight(
    project_dir: Path,
    *,
    video_arg: str | None = None,
    voiceover_rel: str = DEFAULT_VOICEOVER,
    words_rel: str = DEFAULT_WORDS,
    lock_rel: str = DEFAULT_LOCK,
    min_cuts_per_minute: float | None = None,
    max_hold_seconds: float | None = None,
    max_plateau_seconds: float | None = None,
    max_mask_run_seconds: float | None = DEFAULT_MAX_MASK_RUN_SECONDS,
    fail_on_blank_frames: bool = False,
    fail_on_solid_frames: bool = False,
    fail_on_frozen_runs: bool = False,
    report_path: Path | None = None,
) -> dict[str, Any]:
    project = project_dir.expanduser().resolve()
    errors: list[str] = []
    warnings: list[str] = []
    checks: dict[str, Any] = {}
    check_results: dict[str, dict[str, Any]] = {}

    video_path = resolve_rendered_video_path(project, video_arg, repo_root=REPO_ROOT)
    if video_path is None:
        report = {
            "ok": False,
            "status": "failed",
            "complete": False,
            "errors": [f"Could not resolve rendered video for {project}"],
            "warnings": warnings,
            "project": str(project),
        }
        if report_path is not None:
            _write_report(report_path, report)
        return report

    channel = _detect_channel(project)
    channel_gates = _load_channel_gates(channel)
    effective_min_cpm = (
        min_cuts_per_minute
        if min_cuts_per_minute is not None
        else channel_gates["min_cuts_per_minute"]
    )
    effective_hold_max = (
        max_hold_seconds
        if max_hold_seconds is not None
        else channel_gates["hold_max_seconds"]
    )
    effective_max_plateau = (
        max_plateau_seconds
        if max_plateau_seconds is not None
        else effective_hold_max
    )

    audio_path = resolve_artifact_path(project, voiceover_rel, kind="audio", repo_root=REPO_ROOT)
    words_path = resolve_artifact_path(project, words_rel, kind="words", repo_root=REPO_ROOT)
    lock_path = resolve_artifact_path(project, lock_rel, kind="lock", repo_root=REPO_ROOT)
    audio_exists = audio_path.exists()
    words_exists = words_path.exists()

    if audio_exists and words_exists:
        timing_contract = run_timing_contract(
            project,
            audio_rel=str(audio_path),
            words_rel=str(words_path),
            lock_rel=str(lock_path),
            video_rel=str(video_path.relative_to(project))
            if video_path.is_relative_to(project)
            else str(video_path),
            require_lock=True,
            write_lock=False,
            repo_root=REPO_ROOT,
        )
        checks["timing_contract"] = timing_contract
        _set_check_result(
            check_results,
            "timing_contract",
            status="passed" if timing_contract["ok"] else "failed",
            required=True,
        )
        for error in timing_contract.get("errors", []):
            _report_issue(errors, f"timing_contract: {error}")
        for warning in timing_contract.get("warnings", []):
            _report_issue(warnings, f"timing_contract: {warning}")
    else:
        message = "timing_contract skipped: project is missing voiceover artifacts needed for timing parity"
        _set_check_result(
            check_results,
            "timing_contract",
            status="skipped",
            required=True,
            message=message,
        )
        _report_issue(warnings, message)

    frame_integrity = analyze_frame_integrity(video_path)
    checks["frame_integrity"] = frame_integrity
    frame_integrity_failed = frame_integrity["placeholder_frame_count"] > 0
    if frame_integrity["placeholder_frame_count"] > 0:
        _report_issue(
            errors,
            f"frame_integrity: placeholder frames detected ({frame_integrity['placeholder_frame_count']})",
        )
    if frame_integrity["blank_frame_count"] > 0:
        bucket = errors if fail_on_blank_frames else warnings
        frame_integrity_failed = frame_integrity_failed or fail_on_blank_frames
        _report_issue(
            bucket,
            f"frame_integrity: blank frames detected ({frame_integrity['blank_frame_count']})",
        )
    if frame_integrity["solid_frame_count"] > 0:
        bucket = errors if fail_on_solid_frames else warnings
        frame_integrity_failed = frame_integrity_failed or fail_on_solid_frames
        _report_issue(
            bucket,
            f"frame_integrity: solid-color frames detected ({frame_integrity['solid_frame_count']})",
        )
    if frame_integrity["frozen_run_count"] > 0:
        bucket = errors if fail_on_frozen_runs else warnings
        frame_integrity_failed = frame_integrity_failed or fail_on_frozen_runs
        _report_issue(
            bucket,
            f"frame_integrity: frozen runs detected ({frame_integrity['frozen_run_count']})",
        )
    _set_check_result(
        check_results,
        "frame_integrity",
        status="failed" if frame_integrity_failed else "passed",
        required=True,
    )

    cut_rate = analyze_cut_rate(
        video_path,
        min_cuts_per_minute=effective_min_cpm,
    )
    checks["cut_rate"] = cut_rate
    cut_rate_failed = False
    if effective_min_cpm is not None and not cut_rate["pass"]:
        cut_rate_failed = True
        _report_issue(
            errors,
            (
                "cut_rate: below channel floor "
                f"({cut_rate['cuts_per_minute']} cpm < {effective_min_cpm})"
            ),
        )
    if effective_hold_max is not None and cut_rate["longest_hold_seconds"] > effective_hold_max:
        cut_rate_failed = True
        _report_issue(
            errors,
            (
                "cut_rate: longest hold exceeds channel max "
                f"({cut_rate['longest_hold_seconds']}s > {effective_hold_max}s)"
            ),
        )
    _set_check_result(
        check_results,
        "cut_rate",
        status="failed" if cut_rate_failed else "passed",
        required=True,
    )

    visual_novelty = analyze_visual_novelty(
        video_path,
        max_plateau_seconds=effective_max_plateau,
    )
    checks["visual_novelty"] = visual_novelty
    visual_novelty_failed = False
    if effective_max_plateau is not None and not visual_novelty["pass"]:
        visual_novelty_failed = True
        _report_issue(
            errors,
            (
                "visual_novelty: plateau exceeds max "
                f"({visual_novelty['longest_plateau_seconds']}s > {effective_max_plateau}s)"
            ),
        )
    _set_check_result(
        check_results,
        "visual_novelty",
        status="failed" if visual_novelty_failed else "passed",
        required=True,
    )

    if audio_exists and words_exists:
        try:
            speech_masking = analyze_speech_masking(
                video_path,
                voiceover_path=audio_path,
                words_path=words_path,
                max_mask_run_seconds=max_mask_run_seconds,
            )
            checks["speech_masking"] = speech_masking
            speech_masking_failed = False
            if max_mask_run_seconds is not None and not speech_masking["pass"]:
                speech_masking_failed = True
                _report_issue(
                    errors,
                    (
                        "speech_masking: longest mask run exceeds max "
                        f"({speech_masking['longest_mask_run_seconds']}s > {max_mask_run_seconds}s)"
                    ),
                )
            _set_check_result(
                check_results,
                "speech_masking",
                status="failed" if speech_masking_failed else "passed",
                required=True,
            )
        except Exception as exc:  # noqa: BLE001 - postflight reports analyzer failures as findings.
            message = f"speech_masking failed: {exc}"
            checks["speech_masking"] = {"status": "failed", "message": message}
            _set_check_result(
                check_results,
                "speech_masking",
                status="failed",
                required=True,
                message=message,
            )
            _report_issue(errors, message)
    else:
        message = "speech_masking skipped: missing clean voiceover or words file"
        _set_check_result(
            check_results,
            "speech_masking",
            status="skipped",
            required=True,
            message=message,
        )
        _report_issue(warnings, message)

    status, ok, skipped_required_checks = _derive_report_status(errors, check_results)

    report = {
        "ok": ok,
        "status": status,
        "complete": not skipped_required_checks,
        "errors": errors,
        "warnings": warnings,
        "project": str(project),
        "video": str(video_path),
        "channel": channel,
        "generated_at": datetime.now(timezone.utc).isoformat(),
        "thresholds": {
            "min_cuts_per_minute": effective_min_cpm,
            "max_hold_seconds": effective_hold_max,
            "max_plateau_seconds": effective_max_plateau,
            "max_mask_run_seconds": max_mask_run_seconds,
            "fail_on_blank_frames": fail_on_blank_frames,
            "fail_on_solid_frames": fail_on_solid_frames,
            "fail_on_frozen_runs": fail_on_frozen_runs,
        },
        "required_checks": [
            name for name, payload in check_results.items() if payload["required"]
        ],
        "skipped_required_checks": skipped_required_checks,
        "check_results": check_results,
        "checks": checks,
    }

    if report_path is not None:
        _write_report(report_path, report)
    return report


def parse_args(argv: list[str] | None = None) -> argparse.Namespace:
    parser = argparse.ArgumentParser(
        description="Post-render validation over timing parity, pacing, integrity, and audio masking."
    )
    parser.add_argument("project_dir")
    parser.add_argument("--video", default=None, help="Rendered video path; defaults to the latest project/output or out/<slug>*.mp4")
    parser.add_argument("--voiceover", default=DEFAULT_VOICEOVER)
    parser.add_argument("--words", default=DEFAULT_WORDS)
    parser.add_argument("--lock", default=DEFAULT_LOCK)
    parser.add_argument("--min-cuts-per-minute", type=float, default=None)
    parser.add_argument("--max-hold-seconds", type=float, default=None)
    parser.add_argument("--max-plateau-seconds", type=float, default=None)
    parser.add_argument("--max-mask-run-seconds", type=float, default=DEFAULT_MAX_MASK_RUN_SECONDS)
    parser.add_argument("--fail-on-blank-frames", action="store_true")
    parser.add_argument("--fail-on-solid-frames", action="store_true")
    parser.add_argument("--fail-on-frozen-runs", action="store_true")
    parser.add_argument("--report", default=None, help="Optional JSON report output path")
    return parser.parse_args(argv)


def main(argv: list[str] | None = None) -> int:
    args = parse_args(argv)
    report = run_postflight(
        Path(args.project_dir),
        video_arg=args.video,
        voiceover_rel=args.voiceover,
        words_rel=args.words,
        lock_rel=args.lock,
        min_cuts_per_minute=args.min_cuts_per_minute,
        max_hold_seconds=args.max_hold_seconds,
        max_plateau_seconds=args.max_plateau_seconds,
        max_mask_run_seconds=args.max_mask_run_seconds,
        fail_on_blank_frames=args.fail_on_blank_frames,
        fail_on_solid_frames=args.fail_on_solid_frames,
        fail_on_frozen_runs=args.fail_on_frozen_runs,
        report_path=Path(args.report).expanduser().resolve() if args.report else None,
    )
    json.dump(report, sys.stdout, indent=2)
    sys.stdout.write("\n")
    return 0 if report["ok"] else 1


if __name__ == "__main__":
    raise SystemExit(main())
