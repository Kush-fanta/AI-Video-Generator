#!/usr/bin/env python3
# ---
# varnam_script: audio.sound_design
# owner: audio
# status: live
# surface: python3 scripts/run.py audio:sound-design
# purpose: Deterministic FFmpeg mix manifest runner.
# use_when: Mix voiceover, music, and SFX tracks after authored audio assets exist.
# inputs: CLI args, manifests, env vars, or imports documented by argparse/docstring
# outputs: files, JSON/stdout reports, or process exit code documented by the script
# authority: scripts/README.md; scripts/SCRIPT_MAP.md
# ---
"""Mix VO, music, and SFX tracks onto audio/video outputs via FFmpeg."""

from __future__ import annotations

import argparse
import json
import subprocess
import sys
from pathlib import Path

SCRIPTS_DIR = Path(__file__).resolve().parents[1]
SHARED_DIR = SCRIPTS_DIR / "shared"
if str(SHARED_DIR) not in sys.path:
    sys.path.insert(0, str(SHARED_DIR))

from _job_utils import ensure_parent, print_json


# ---------------------------------------------------------------------------
# Helpers
# ---------------------------------------------------------------------------

def _fail(msg: str):
    print(json.dumps({"status": "error", "error": msg}))
    sys.exit(1)


AUDIO_ONLY_SUFFIXES = {".mp3", ".wav", ".m4a", ".aac", ".flac", ".ogg"}


def _probe_duration(path: Path) -> float | None:
    """Return media duration in seconds via ffprobe."""
    try:
        result = subprocess.run(
            [
                "ffprobe",
                "-v", "error",
                "-show_entries", "format=duration",
                "-of", "default=noprint_wrappers=1:nokey=1",
                str(path),
            ],
            capture_output=True,
            text=True,
            timeout=15,
            check=True,
        )
    except (subprocess.CalledProcessError, OSError, ValueError):
        return None

    try:
        return float(result.stdout.strip())
    except ValueError:
        return None


def _resolve_mix_duration(
    manifest: dict,
    video_path: Path | None,
    vo_path: Path,
) -> tuple[float | None, str | None]:
    """Choose the final mix bound. Prefer explicit picture duration over VO length."""
    explicit_duration = manifest.get("duration")
    if explicit_duration is not None:
        try:
            duration = float(explicit_duration)
        except (TypeError, ValueError):
            _fail(f"Invalid manifest duration: {explicit_duration!r}")
        if duration <= 0:
            _fail(f"Manifest duration must be > 0, got {duration}")
        return duration, "manifest.duration"

    if video_path is not None:
        duration = _probe_duration(video_path)
        if duration is not None:
            return duration, "video"

    duration = _probe_duration(vo_path)
    if duration is not None:
        return duration, "voiceover"

    return None, None


def _audio_codec_args(output_path: Path, has_video: bool) -> list[str]:
    """Pick an audio codec that matches the output container."""
    if has_video:
        return ["-c:a", "aac", "-b:a", "192k"]

    suffix = output_path.suffix.lower()
    if suffix == ".mp3":
        return ["-c:a", "libmp3lame", "-b:a", "192k"]
    if suffix in {".m4a", ".aac"}:
        return ["-c:a", "aac", "-b:a", "192k"]
    if suffix == ".wav":
        return ["-c:a", "pcm_s16le"]
    if suffix == ".flac":
        return ["-c:a", "flac"]
    if suffix == ".ogg":
        return ["-c:a", "libvorbis", "-q:a", "5"]
    return ["-c:a", "aac", "-b:a", "192k"]


# ---------------------------------------------------------------------------
# Anchor resolution
# ---------------------------------------------------------------------------

def _resolve_anchor(anchor: str, words: list[dict]) -> float:
    """Resolve 'word:<text>:<occurrence>' to a timestamp from words.json."""
    parts = anchor.split(":")
    if len(parts) != 3 or parts[0] != "word":
        _fail(f"Invalid anchor format: {anchor}. Expected 'word:<text>:<occurrence>'")
    target_word = parts[1].lower()
    try:
        target_occurrence = int(parts[2])
    except ValueError:
        _fail(f"Invalid anchor occurrence: {parts[2]}. Expected integer in 'word:<text>:<occurrence>'")
    count = 0
    for entry in words:
        if entry["word"].lower().strip(".,!?;:'\"") == target_word:
            count += 1
            if count == target_occurrence:
                return entry["start"]
    _fail(f"Anchor '{anchor}': word '{target_word}' occurrence {target_occurrence} not found in words.json")


# ---------------------------------------------------------------------------
# Mix protection
# ---------------------------------------------------------------------------

def _is_in_protection_zone(start: float, protection_zones: list[dict]) -> dict | None:
    for zone in protection_zones:
        if zone["start"] <= start <= zone["end"]:
            return zone
    return None


# ---------------------------------------------------------------------------
# mix subcommand
# ---------------------------------------------------------------------------

def cmd_mix(args: argparse.Namespace) -> dict:
    project_dir = Path(args.project_dir).expanduser().resolve()
    manifest_path = Path(args.manifest).expanduser().resolve()
    with open(manifest_path, "r", encoding="utf-8") as f:
        manifest = json.load(f)

    video_rel = manifest.get("video")
    video_path = project_dir / video_rel if video_rel else None
    vo_path = project_dir / manifest["voiceover"]
    output_path = project_dir / manifest["output"]
    ensure_parent(output_path)
    output_is_audio_only = output_path.suffix.lower() in AUDIO_ONLY_SUFFIXES

    if video_path is None and not output_is_audio_only:
        _fail("Manifest must include 'video' when output is a video container")

    words_path = project_dir / "audio" / "voiceover.words.json"
    words = []
    if words_path.exists():
        with open(words_path, "r", encoding="utf-8") as f:
            words = json.load(f)

    tracks = manifest.get("tracks", [])
    mix_protection = manifest.get("mix_protection", [])
    mix_duration, mix_duration_source = _resolve_mix_duration(manifest, video_path, vo_path)

    # Resolve anchors
    for track in tracks:
        if "anchor" in track and "start" not in track:
            track["start"] = _resolve_anchor(track["anchor"], words)

    # Apply mix_protection
    filtered_tracks = []
    blocked_count = 0
    for track in tracks:
        start = track.get("start", 0.0)
        zone = _is_in_protection_zone(start, mix_protection)
        is_bgm = "bgm" in track.get("file", "").lower()
        # block policy applies to SFX only, not BGM
        if zone and zone.get("sfx_policy") == "block" and not is_bgm:
            blocked_count += 1
            continue
        # bgm_max caps BGM levels in protection zones
        if zone and "bgm_max" in zone and is_bgm:
            track["level"] = zone["bgm_max"]
        filtered_tracks.append(track)
    tracks = filtered_tracks

    # Preflight: verify all input files exist
    required_inputs = [(vo_path, "voiceover")]
    if video_path is not None:
        required_inputs.append((video_path, "video"))
    for path, label in required_inputs:
        if not path.exists():
            _fail(f"Missing {label}: {path}")
    for track in tracks:
        track_path = project_dir / track["file"]
        if not track_path.exists():
            _fail(f"Missing track file: {track_path}")

    # Build FFmpeg command
    inputs = []
    if video_path is not None:
        inputs.extend(["-i", str(video_path)])
    inputs.extend(["-i", str(vo_path)])

    video_input_idx = 0 if video_path is not None else None
    vo_input_idx = 1 if video_path is not None else 0
    track_input_base = vo_input_idx + 1
    filter_parts = []

    for i, track in enumerate(tracks):
        input_idx = track_input_base + i
        inputs.extend(["-i", str(project_dir / track["file"])])
        level = track.get("level", "0dB")
        start = track.get("start", 0.0)
        end = track.get("end")
        fade_in = track.get("fade_in", 0)
        fade_out = track.get("fade_out", 0)

        track_filter = f"[{input_idx}:a]"
        filters = []

        # 1. Trim FIRST
        if end:
            duration = end - start
            filters.append(f"atrim=0:{duration}")
            filters.append("asetpts=PTS-STARTPTS")

        # 2. Volume
        filters.append(f"volume={level}")

        # 3. Fades (source-relative)
        if fade_in > 0:
            filters.append(f"afade=t=in:st=0:d={fade_in}")
        if fade_out > 0 and end:
            duration = end - start
            fade_start = duration - fade_out
            filters.append(f"afade=t=out:st={fade_start}:d={fade_out}")

        # 4. Delay to position
        if start > 0:
            delay_ms = int(start * 1000)
            filters.append(f"adelay={delay_ms}|{delay_ms}")
            filters.append("asetpts=PTS-STARTPTS")

        filter_chain = ",".join(filters) if filters else "anull"
        filter_parts.append(f"{track_filter}{filter_chain}[t{i}]")

    # VO pass-through — untouched, no processing
    filter_parts.append(f"[{vo_input_idx}:a]anull[vo]")

    # Mix all tracks with VO using normalize=0 (pure additive sum).
    # normalize=0 disables amix's default behaviour of dividing each input
    # by N.  The VO signal passes through at its original amplitude and the
    # SFX tracks (already attenuated via their per-track volume filters)
    # are simply added on top.  No compensation boost is needed.
    mix_inputs = "[vo]" + "".join(f"[t{i}]" for i in range(len(tracks)))
    n_inputs = 1 + len(tracks)
    filter_parts.append(
        f"{mix_inputs}amix=inputs={n_inputs}:duration=longest"
        f":dropout_transition=0:normalize=0[mixed]"
    )

    mixed_label = "mixed"
    if mix_duration is not None:
        # Final trim prevents score/SFX tails from spilling past the cut.
        filter_parts.append(
            f"[mixed]atrim=0:{mix_duration:.3f},asetpts=PTS-STARTPTS[mixed_trimmed]"
        )
        mixed_label = "mixed_trimmed"

    filter_complex = ";".join(filter_parts)

    cmd = [
        "ffmpeg", "-y",
        *inputs,
        "-filter_complex", filter_complex,
    ]
    if video_input_idx is not None:
        cmd.extend(["-map", f"{video_input_idx}:v", "-c:v", "copy"])
    cmd.extend([
        "-map", f"[{mixed_label}]",
        *_audio_codec_args(output_path, has_video=video_input_idx is not None),
        str(output_path),
    ])

    if args.verbose:
        print(" ".join(cmd), file=sys.stderr)

    try:
        subprocess.run(cmd, check=True, capture_output=not args.verbose, text=True, timeout=600)
        return {
            "status": "ok",
            "output": str(output_path),
            "tracks": len(tracks),
            "blocked_by_protection": blocked_count,
            "duration_target": mix_duration,
            "duration_target_source": mix_duration_source,
        }
    except subprocess.CalledProcessError as exc:
        return {"status": "error", "error": exc.stderr[:2000] if exc.stderr else str(exc)}


# ---------------------------------------------------------------------------
# CLI
# ---------------------------------------------------------------------------

def parse_args(argv: list[str] | None = None) -> argparse.Namespace:
    parser = argparse.ArgumentParser(description="Deterministic FFmpeg mix manifest runner")
    sub = parser.add_subparsers(dest="command", required=True)

    mix_p = sub.add_parser("mix", help="Mix VO + BGM + SFX onto video")
    mix_p.add_argument("--manifest", required=True, help="Path to mix manifest JSON")
    mix_p.add_argument("--project-dir", required=True, help="Project root directory")
    mix_p.add_argument("--verbose", action="store_true", help="Print FFmpeg command")

    return parser.parse_args(argv)


def main(argv: list[str] | None = None) -> int:
    args = parse_args(argv)
    result = cmd_mix(args)
    print_json(result)
    return 0 if result.get("status") == "ok" else 1


if __name__ == "__main__":
    raise SystemExit(main())
