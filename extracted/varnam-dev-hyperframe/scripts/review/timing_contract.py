#!/usr/bin/env python3
# ---
# varnam_script: review.timing_contract
# owner: reviewer
# status: live
# surface: import-or-direct
# purpose: Shared timing contract implementation.
# use_when: Use as the single source for timing-rule checks.
# inputs: CLI args, manifests, env vars, or imports documented by argparse/docstring
# outputs: files, JSON/stdout reports, or process exit code documented by the script
# authority: scripts/README.md; scripts/SCRIPT_MAP.md
# ---
"""Shared timing contract checks used by preflight and postflight wrappers."""

from __future__ import annotations

import hashlib
import json
import re
import subprocess
from datetime import datetime, timezone
from pathlib import Path
from typing import Any

from project_artifacts import resolve_artifact_path
from render_hygiene import scan_placeholder_strings


DEFAULT_AUDIO = "audio/voiceover.mp3"
DEFAULT_WORDS = "audio/voiceover.words.json"
DEFAULT_STYLES = "build/timeline.lock.json"
DEFAULT_ROOT = ""
DEFAULT_LOCK = "audio/timing.lock.json"


def _probe_duration(path: Path) -> float | None:
    try:
        result = subprocess.run(
            [
                "ffprobe",
                "-v",
                "error",
                "-show_entries",
                "format=duration",
                "-of",
                "default=noprint_wrappers=1:nokey=1",
                str(path),
            ],
            check=True,
            capture_output=True,
            text=True,
            timeout=15,
        )
    except (subprocess.CalledProcessError, OSError, ValueError):
        return None
    try:
        return float(result.stdout.strip())
    except ValueError:
        return None


def _sha256(path: Path) -> str:
    digest = hashlib.sha256()
    with path.open("rb") as handle:
        for chunk in iter(lambda: handle.read(1024 * 1024), b""):
            digest.update(chunk)
    return digest.hexdigest()


def _strip_ts_comments(text: str) -> str:
    no_blocks = re.sub(r"/\*.*?\*/", "", text, flags=re.DOTALL)
    return re.sub(r"//.*$", "", no_blocks, flags=re.MULTILINE)


def _extract_number(text: str, pattern: str) -> float | None:
    match = re.search(pattern, text)
    if not match:
        return None
    return float(match.group(1))


def _extract_styles_duration(styles_path: Path) -> tuple[float | None, str | None]:
    if styles_path.suffix == ".json":
        return _extract_timeline_duration(styles_path)

    text = _strip_ts_comments(styles_path.read_text(encoding="utf-8"))
    total_duration_s = _extract_number(
        text, r"(?:export\s+)?const\s+TOTAL_DURATION_S\s*=\s*([0-9]+(?:\.[0-9]+)?)"
    )
    if total_duration_s is not None:
        return total_duration_s, "TOTAL_DURATION_S"
    timing_total = _extract_number(text, r"\btotalDuration\s*:\s*([0-9]+(?:\.[0-9]+)?)")
    if timing_total is not None:
        return timing_total, "TIMING.totalDuration"
    total_frames = _extract_number(
        text, r"(?:export\s+)?const\s+TOTAL_FRAMES\s*=\s*([0-9]+(?:\.[0-9]+)?)"
    )
    fps = _extract_fps(styles_path)
    if total_frames is not None and fps is not None and fps > 0:
        return total_frames / fps, "TOTAL_FRAMES/FPS"
    return None, None


def _extract_timeline_duration(timeline_path: Path) -> tuple[float | None, str | None]:
    try:
        payload = json.loads(timeline_path.read_text(encoding="utf-8"))
    except json.JSONDecodeError:
        return None, None
    if not isinstance(payload, dict):
        return None, None

    for key in ("timeline_duration_seconds", "duration_seconds", "runtime_seconds"):
        value = payload.get(key)
        if isinstance(value, (int, float)) and value >= 0:
            return float(value), key

    frames = payload.get("runtime_frames") or payload.get("total_frames")
    fps = payload.get("fps")
    if isinstance(frames, (int, float)) and isinstance(fps, (int, float)) and fps > 0:
        return float(frames) / float(fps), "runtime_frames/fps"

    return None, None


def _extract_fps(styles_path: Path) -> float | None:
    if styles_path.suffix == ".json":
        try:
            payload = json.loads(styles_path.read_text(encoding="utf-8"))
        except json.JSONDecodeError:
            return None
        if isinstance(payload, dict):
            fps = payload.get("fps")
            if isinstance(fps, (int, float)) and fps > 0:
                return float(fps)
        return None

    text = _strip_ts_comments(styles_path.read_text(encoding="utf-8"))
    return _extract_number(text, r"(?:export\s+)?const\s+FPS\s*=\s*([0-9]+(?:\.[0-9]+)?)")


def _inspect_runtime_root_timing(root_path: Path) -> tuple[bool, bool]:
    text = _strip_ts_comments(root_path.read_text(encoding="utf-8"))
    has_timeline_authority = "window.__timelines" in text or "data-composition-id" in text
    has_inline_duration = "data-duration" in text
    return has_timeline_authority, has_inline_duration


def _load_words(words_path: Path) -> tuple[list[dict[str, Any]], list[str], float]:
    errors: list[str] = []
    try:
        payload = json.loads(words_path.read_text(encoding="utf-8"))
    except json.JSONDecodeError as exc:
        return [], [f"Invalid JSON in words file: {words_path} ({exc})"], 0.0

    if not isinstance(payload, list):
        return [], [f"Words payload must be a list: {words_path}"], 0.0

    words: list[dict[str, Any]] = []
    previous_start = -1.0
    max_end = 0.0

    for idx, entry in enumerate(payload):
        if not isinstance(entry, dict):
            errors.append(f"words[{idx}] is not an object")
            continue
        if "start" not in entry or "end" not in entry:
            errors.append(f"words[{idx}] missing start/end")
            continue
        try:
            start = float(entry["start"])
            end = float(entry["end"])
        except (TypeError, ValueError):
            errors.append(f"words[{idx}] has non-numeric start/end")
            continue
        if start < 0:
            errors.append(f"words[{idx}] start < 0 ({start})")
        if end < start:
            errors.append(f"words[{idx}] end < start ({end} < {start})")
        if start + 1e-6 < previous_start:
            errors.append(f"words[{idx}] start regressed ({start} < previous {previous_start})")
        previous_start = start
        max_end = max(max_end, end)
        words.append(entry)

    return words, errors, max_end


def _extract_lock_checksum(lock_payload: dict[str, Any]) -> str | None:
    raw = lock_payload.get("words_sha256") or lock_payload.get("checksum")
    if raw is None:
        return None
    raw_text = str(raw)
    if raw_text.startswith("sha256:"):
        return raw_text.split(":", 1)[1]
    return raw_text


def _write_lock(
    lock_path: Path,
    *,
    words_sha256: str,
    audio_duration_seconds: float,
    timeline_duration_seconds: float | None,
    fps: float | None,
) -> None:
    payload: dict[str, Any] = {
        "words_sha256": words_sha256,
        "audio_duration_seconds": round(audio_duration_seconds, 3),
        "timeline_duration_seconds": (
            round(timeline_duration_seconds, 3) if timeline_duration_seconds is not None else None
        ),
        "styles_duration_seconds": (
            round(timeline_duration_seconds, 3) if timeline_duration_seconds is not None else None
        ),
        "fps": fps if fps is not None else 30,
        "generated_at": datetime.now(timezone.utc).isoformat(),
    }
    lock_path.parent.mkdir(parents=True, exist_ok=True)
    lock_path.write_text(json.dumps(payload, indent=2), encoding="utf-8")


def run_timing_contract(
    project_dir: Path,
    *,
    audio_rel: str = DEFAULT_AUDIO,
    words_rel: str = DEFAULT_WORDS,
    styles_rel: str = DEFAULT_STYLES,
    root_rel: str = DEFAULT_ROOT,
    lock_rel: str = DEFAULT_LOCK,
    video_rel: str | None = None,
    require_lock: bool = False,
    write_lock: bool = False,
    max_duration_drift: float = 0.5,
    max_word_audio_drift: float = 0.25,
    repo_root: Path | None = None,
) -> dict[str, Any]:
    project = project_dir.expanduser().resolve()
    errors: list[str] = []
    warnings: list[str] = []

    audio_path = resolve_artifact_path(project, audio_rel, kind="audio", repo_root=repo_root)
    words_path = resolve_artifact_path(project, words_rel, kind="words", repo_root=repo_root)
    styles_path = resolve_artifact_path(project, styles_rel, kind="styles", repo_root=repo_root)
    root_path = (
        resolve_artifact_path(project, root_rel, kind="root", repo_root=repo_root)
        if root_rel
        else None
    )
    lock_path = resolve_artifact_path(project, lock_rel, kind="lock", repo_root=repo_root)
    video_path = (
        resolve_artifact_path(project, video_rel, kind="video", repo_root=repo_root)
        if video_rel
        else None
    )

    if not audio_path.exists():
        errors.append(f"Missing audio file: {audio_path}")
    if not words_path.exists():
        errors.append(f"Missing words file: {words_path}")
    if not styles_path.exists():
        errors.append(f"Missing timeline authority file: {styles_path}")
    if video_path is not None and not video_path.exists():
        errors.append(f"Missing video file: {video_path}")
    if errors:
        return {"ok": False, "errors": errors, "warnings": warnings, "project": str(project)}

    has_calculate_metadata: bool | None = None
    has_duration_in_frames_prop: bool | None = None
    if root_path is not None:
        if root_path.exists():
            try:
                has_calculate_metadata, has_duration_in_frames_prop = _inspect_runtime_root_timing(root_path)
            except OSError as exc:
                warnings.append(f"Could not inspect Root timing authority at {root_path}: {exc}")
            else:
                if not has_calculate_metadata:
                    warnings.append(
                        f"No runtime metadata authority found in {root_path}; full composition duration may be hardcoded."
                    )
                elif has_duration_in_frames_prop:
                    warnings.append(
                        f"{root_path} includes frame-duration props; keep the shared timeline as full-composition duration authority."
                    )
        else:
            warnings.append(f"Root timing authority check skipped; file not found: {root_path}")

    audio_duration = _probe_duration(audio_path)
    if audio_duration is None:
        return {
            "ok": False,
            "errors": [f"Could not probe audio duration via ffprobe: {audio_path}"],
            "warnings": warnings,
            "project": str(project),
        }

    words, word_errors, last_word_end = _load_words(words_path)
    errors.extend(word_errors)
    words_sha256 = _sha256(words_path)

    if last_word_end > audio_duration + max_word_audio_drift:
        errors.append(
            f"Words exceed audio duration ({last_word_end:.3f}s > {audio_duration:.3f}s + tolerance {max_word_audio_drift:.3f}s)"
        )

    styles_duration, styles_duration_source = _extract_styles_duration(styles_path)
    styles_fps = _extract_fps(styles_path) or 30
    if styles_duration is None:
        warnings.append(
            f"No timeline duration authority found in {styles_path}; expected duration_seconds, runtime_frames/fps, TOTAL_DURATION_S, or TIMING.totalDuration."
        )
    else:
        duration_drift = styles_duration - audio_duration
        if duration_drift < -max_duration_drift:
            errors.append(
                f"Timeline duration is shorter than VO duration ({styles_duration:.3f}s vs {audio_duration:.3f}s, drift {duration_drift:.3f}s)"
            )
        elif duration_drift > max_duration_drift:
            warnings.append(
                f"Timeline extends beyond VO by {duration_drift:.3f}s; verify the extra runtime is intentional."
            )

    video_duration = None
    if video_path is not None:
        video_duration = _probe_duration(video_path)
        if video_duration is None:
            errors.append(f"Could not probe video duration via ffprobe: {video_path}")
        else:
            target_duration = styles_duration if styles_duration is not None else audio_duration
            video_target_drift = abs(video_duration - target_duration)
            if video_target_drift > max_duration_drift:
                errors.append(
                    f"Video/runtime duration drift too large ({video_duration:.3f}s vs {target_duration:.3f}s, drift {video_target_drift:.3f}s)"
                )

    placeholder_hits = scan_placeholder_strings(project, repo_root=repo_root)
    if placeholder_hits:
        errors.append(
            "Placeholder strings found in composition/storyboard — block render:\n  "
            + "\n  ".join(placeholder_hits[:20])
            + (f"\n  ... and {len(placeholder_hits) - 20} more" if len(placeholder_hits) > 20 else "")
        )

    lock_payload = None
    if lock_path.exists():
        try:
            lock_payload = json.loads(lock_path.read_text(encoding="utf-8"))
        except json.JSONDecodeError as exc:
            errors.append(f"Invalid lock JSON: {lock_path} ({exc})")
    elif require_lock and not write_lock:
        errors.append(f"Timing lock required but missing: {lock_path}")

    if lock_payload is not None:
        lock_checksum = _extract_lock_checksum(lock_payload)
        if not lock_checksum:
            errors.append(f"Timing lock missing checksum field: {lock_path}")
        elif lock_checksum != words_sha256:
            errors.append("Timing lock checksum mismatch: voiceover.words.json changed after lock.")

    lock_written = False
    if write_lock and not errors:
        _write_lock(
            lock_path,
            words_sha256=words_sha256,
            audio_duration_seconds=audio_duration,
            timeline_duration_seconds=styles_duration,
            fps=styles_fps,
        )
        lock_written = True

    return {
        "ok": not errors,
        "errors": errors,
        "warnings": warnings,
        "project": str(project),
        "metrics": {
            "audio_duration_seconds": round(audio_duration, 3),
            "timeline_duration_seconds": round(styles_duration, 3) if styles_duration is not None else None,
            "styles_duration_seconds": round(styles_duration, 3) if styles_duration is not None else None,
            "audio_path": str(audio_path),
            "words_path": str(words_path),
            "styles_path": str(styles_path),
            "styles_duration_source": styles_duration_source,
            "fps": styles_fps,
            "words_count": len(words),
            "last_word_end_seconds": round(last_word_end, 3),
            "words_sha256": words_sha256,
            "video_duration_seconds": round(video_duration, 3) if video_duration is not None else None,
            "root_path": str(root_path) if root_path is not None else None,
            "has_calculate_metadata": has_calculate_metadata,
            "has_duration_in_frames_prop": has_duration_in_frames_prop,
            "lock_path": str(lock_path),
            "lock_written": lock_written,
            "placeholder_hits": len(placeholder_hits),
        },
    }
