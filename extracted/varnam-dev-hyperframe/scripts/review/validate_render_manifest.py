#!/usr/bin/env python3
# ---
# varnam_script: review.validate_render_manifest
# owner: reviewer,mograph
# status: live
# surface: python3 scripts/run.py render:validate-manifest
# purpose: Render manifest contract validator.
# use_when: Validate direction/render-manifest.yaml and HyperFrames composition bindings.
# inputs: CLI args, manifests, env vars, or imports documented by argparse/docstring
# outputs: files, JSON/stdout reports, or process exit code documented by the script
# authority: scripts/README.md; scripts/SCRIPT_MAP.md
# ---
"""Validate direction/render-manifest.yaml against the render manifest contract."""

from __future__ import annotations

import argparse
import json
import re
import subprocess
import sys
from dataclasses import dataclass, field
from pathlib import Path
from typing import Any


CURRENT_SCHEMA_VERSION = 2

REPO_ROOT = Path(__file__).resolve().parents[2]
DEFAULT_REGISTRY_PATH = REPO_ROOT / "docs/contracts/capability-registry.json"
HELD_COMPOSITIONS = {"runtime/held", "held", "none"}


@dataclass
class Finding:
    rule: str
    severity: str
    path: str
    message: str

    def as_dict(self) -> dict[str, str]:
        return {
            "rule": self.rule,
            "severity": self.severity,
            "path": self.path,
            "message": self.message,
        }


@dataclass
class ValidationContext:
    project_dir: Path
    strict: bool = False
    registry_path: Path = DEFAULT_REGISTRY_PATH
    render_manifest_path: Path = field(init=False)
    words_path: Path = field(init=False)
    render_manifest: dict[str, Any] | None = None
    words: list[dict[str, Any]] | None = None
    registry: dict[str, Any] | None = None
    findings: list[Finding] = field(default_factory=list)
    missing_inputs: list[str] = field(default_factory=list)

    def __post_init__(self) -> None:
        self.render_manifest_path = self.project_dir / "direction/render-manifest.yaml"
        self.words_path = self.project_dir / "audio/voiceover.words.json"

    @property
    def piece(self) -> dict[str, Any] | None:
        if not isinstance(self.render_manifest, dict):
            return None
        piece = self.render_manifest.get("piece")
        return piece if isinstance(piece, dict) else None

    def add(self, rule: str, severity: str, path: str, message: str) -> None:
        self.findings.append(Finding(rule, severity, path, message))

    def error(self, rule: str, path: str, message: str) -> None:
        self.add(rule, "error", path, message)

    def warning(self, rule: str, path: str, message: str) -> None:
        self.add(rule, "warning", path, message)


def load_structured(path: Path) -> Any:
    text = path.read_text(encoding="utf-8")
    try:
        return json.loads(text)
    except json.JSONDecodeError:
        pass

    try:
        import yaml  # type: ignore

        return yaml.safe_load(text)
    except ModuleNotFoundError:
        pass

    result = subprocess.run(
        [
            "ruby",
            "-ryaml",
            "-rjson",
            "-e",
            "puts JSON.generate(YAML.load_file(ARGV[0]))",
            str(path),
        ],
        check=False,
        capture_output=True,
        text=True,
    )
    if result.returncode == 0:
        return json.loads(result.stdout)

    raise ValueError(result.stderr.strip() or "could not parse as JSON/YAML")


def load_inputs(ctx: ValidationContext) -> None:
    if not ctx.render_manifest_path.exists():
        ctx.missing_inputs.append(str(ctx.render_manifest_path))
        ctx.error("INPUT", "direction.render-manifest.yaml", "required render-manifest.yaml is missing")
    else:
        try:
            payload = load_structured(ctx.render_manifest_path)
            ctx.render_manifest = payload if isinstance(payload, dict) else None
            if ctx.render_manifest is None:
                ctx.error("INPUT", "direction.render-manifest.yaml", "render manifest root must be an object")
        except Exception as exc:  # noqa: BLE001 - CLI should report parse failures.
            ctx.error("INPUT", "direction.render-manifest.yaml", f"could not parse render manifest: {exc}")

    if not ctx.words_path.exists():
        ctx.missing_inputs.append(str(ctx.words_path))
        ctx.error("INPUT", "audio.voiceover.words.json", "required voiceover.words.json is missing")
    else:
        try:
            payload = json.loads(ctx.words_path.read_text(encoding="utf-8"))
            if isinstance(payload, list):
                ctx.words = payload
            else:
                ctx.error("INPUT", "audio.voiceover.words.json", "words json must be a list")
        except Exception as exc:  # noqa: BLE001
            ctx.error("INPUT", "audio.voiceover.words.json", f"could not parse words json: {exc}")

    if not ctx.registry_path.exists():
        ctx.missing_inputs.append(str(ctx.registry_path))
        ctx.error("INPUT", "docs.contracts.capability-registry.json", "required capability registry is missing")
    else:
        try:
            payload = json.loads(ctx.registry_path.read_text(encoding="utf-8"))
            ctx.registry = payload if isinstance(payload, dict) else None
            if ctx.registry is None:
                ctx.error("INPUT", "docs.contracts.capability-registry.json", "registry root must be an object")
        except Exception as exc:  # noqa: BLE001
            ctx.error("INPUT", "docs.contracts.capability-registry.json", f"could not parse registry: {exc}")

def is_int(value: Any) -> bool:
    return isinstance(value, int) and not isinstance(value, bool)


def as_list(value: Any) -> list[Any]:
    return value if isinstance(value, list) else []


def each_scene(piece: dict[str, Any]) -> list[tuple[int, dict[str, Any]]]:
    return [(idx, scene) for idx, scene in enumerate(as_list(piece.get("scenes"))) if isinstance(scene, dict)]


def each_cut(piece: dict[str, Any]) -> list[tuple[int, dict[str, Any], int, dict[str, Any]]]:
    cuts: list[tuple[int, dict[str, Any], int, dict[str, Any]]] = []
    for scene_idx, scene in each_scene(piece):
        for cut_idx, cut in enumerate(as_list(scene.get("cuts"))):
            if isinstance(cut, dict):
                cuts.append((scene_idx, scene, cut_idx, cut))
    return cuts


def scene_path(scene_idx: int) -> str:
    return f"piece.scenes[{scene_idx}]"


def cut_path(scene_idx: int, cut_idx: int) -> str:
    return f"{scene_path(scene_idx)}.cuts[{cut_idx}]"


def check_shape(ctx: ValidationContext) -> None:
    piece = ctx.piece
    if piece is None:
        ctx.error("SHAPE", "piece", "render manifest must contain a piece object")
        return

    for key in ("schema_version", "locale", "runtime_frames", "fps", "scenes"):
        if key not in piece:
            ctx.error("SHAPE", f"piece.{key}", f"piece.{key} is required")
    if "runtime_frames" in piece and not is_int(piece.get("runtime_frames")):
        ctx.error("SHAPE", "piece.runtime_frames", "runtime_frames must be an integer")
    if "fps" in piece and not is_int(piece.get("fps")):
        ctx.error("SHAPE", "piece.fps", "fps must be an integer")
    if "scenes" in piece and not isinstance(piece.get("scenes"), list):
        ctx.error("SHAPE", "piece.scenes", "scenes must be a list")

    for scene_idx, scene_raw in enumerate(as_list(piece.get("scenes"))):
        path = scene_path(scene_idx)
        if not isinstance(scene_raw, dict):
            ctx.error("SHAPE", path, "scene must be an object")
            continue
        cuts = scene_raw.get("cuts")
        if not isinstance(cuts, list) or not cuts:
            ctx.error("SHAPE", f"{path}.cuts", "scene.cuts must be a non-empty list")
            continue
        for cut_idx, cut_raw in enumerate(cuts):
            cpath = cut_path(scene_idx, cut_idx)
            if not isinstance(cut_raw, dict):
                ctx.error("SHAPE", cpath, "cut must be an object")
                continue
            for key in ("span", "timing_source", "kind", "composition", "variables"):
                if key not in cut_raw:
                    ctx.error("SHAPE", f"{cpath}.{key}", f"cut.{key} is required")
            if "base_visual" in cut_raw:
                ctx.error("SHAPE", f"{cpath}.base_visual", "base_visual is retired; use cut.kind + cut.composition + cut.variables")
            if "template" in cut_raw:
                ctx.error("SHAPE", f"{cpath}.template", "template is retired; use cut.composition")
            if "props" in cut_raw:
                ctx.error("SHAPE", f"{cpath}.props", "props is retired; use cut.variables")
            if "kind" in cut_raw and cut_raw.get("kind") is not None and not isinstance(cut_raw.get("kind"), str):
                ctx.error("SHAPE", f"{cpath}.kind", "cut.kind must be a string or null")
            if "composition" in cut_raw and cut_raw.get("composition") is not None and not isinstance(cut_raw.get("composition"), str):
                ctx.error("SHAPE", f"{cpath}.composition", "cut.composition must be a string or null")
            if "variables" in cut_raw and not isinstance(cut_raw.get("variables"), dict):
                ctx.error("SHAPE", f"{cpath}.variables", "cut.variables must be an object")


def check_render_bindings(ctx: ValidationContext) -> None:
    piece = ctx.piece
    if piece is None:
        return

    for scene_idx, _scene, cut_idx, cut in each_cut(piece):
        cpath = cut_path(scene_idx, cut_idx)
        composition_id = cut.get("composition")
        variables = cut.get("variables")
        kind = cut.get("kind")

        if not isinstance(composition_id, str) or not composition_id.strip():
            ctx.error("RENDER_BINDING", f"{cpath}.composition", "renderable cut must name a HyperFrames composition")
            continue
        if not isinstance(variables, dict):
            ctx.error("RENDER_BINDING", f"{cpath}.variables", "renderable cut must carry variables object")
        if not isinstance(kind, str) or not kind.strip():
            ctx.error("RENDER_BINDING", f"{cpath}.kind", "cut.kind is advisory but required for routing/review")

        if composition_id in HELD_COMPOSITIONS:
            continue


def get_allowlist(ctx: ValidationContext, key: str) -> set[str] | None:
    ontology = ctx.registry.get("render_manifest_contract") if isinstance(ctx.registry, dict) else None
    if not isinstance(ontology, dict):
        ctx.warning("ALLOWLISTS", "docs.contracts.capability-registry.json.render_manifest_contract", "render_manifest_contract block missing; allowlist check skipped")
        return None
    values = ontology.get(key)
    # Spec gap policy: when a registry allowlist key is absent, skip instead of
    # inventing local values in the validator.
    if values is None:
        ctx.warning("ALLOWLISTS", f"docs.contracts.capability-registry.json.render_manifest_contract.{key}", "allowlist key missing; check skipped")
        return None
    if not isinstance(values, list) or not all(isinstance(value, str) for value in values):
        ctx.warning("ALLOWLISTS", f"docs.contracts.capability-registry.json.render_manifest_contract.{key}", "allowlist must be a string list; check skipped")
        return None
    return set(values)


def check_allowlists(ctx: ValidationContext) -> None:
    piece = ctx.piece
    if piece is None or ctx.registry is None:
        return

    overlay_kinds = get_allowlist(ctx, "overlay_kinds_allowlist")
    beat_channels = get_allowlist(ctx, "beat_channels_allowlist")
    beat_events = get_allowlist(ctx, "beat_event_kinds_allowlist")
    audio_kinds = get_allowlist(ctx, "audio_track_kinds_allowlist")
    timing_sources = get_allowlist(ctx, "timing_sources_allowlist")

    for scene_idx, _scene, cut_idx, cut in each_cut(piece):
        cpath = cut_path(scene_idx, cut_idx)
        timing_source = cut.get("timing_source")
        if timing_sources is not None and timing_source not in timing_sources:
            ctx.error("ALLOWLISTS", f"{cpath}.timing_source", f"timing_source {timing_source!r} is not in registry allowlist")

        for overlay_idx, overlay in enumerate(as_list(cut.get("overlays"))):
            if not isinstance(overlay, dict):
                continue
            kind = overlay.get("kind")
            if overlay_kinds is not None and kind not in overlay_kinds:
                ctx.error("ALLOWLISTS", f"{cpath}.overlays[{overlay_idx}].kind", f"overlay kind {kind!r} is not in registry allowlist")

        for beat_idx, beat in enumerate(as_list(cut.get("beats"))):
            if not isinstance(beat, dict):
                continue
            channel = beat.get("channel")
            if beat_channels is not None and channel not in beat_channels:
                ctx.error("ALLOWLISTS", f"{cpath}.beats[{beat_idx}].channel", f"beat channel {channel!r} is not in registry allowlist")
            event = beat.get("event")
            event_kind = str(event).split(":", 1)[0].strip() if event is not None else event
            if beat_events is not None and event_kind not in beat_events:
                ctx.error("ALLOWLISTS", f"{cpath}.beats[{beat_idx}].event", f"beat event kind {event_kind!r} is not in registry allowlist")

    for idx, track in enumerate(as_list(piece.get("audio_tracks"))):
        if not isinstance(track, dict):
            continue
        kind = track.get("kind")
        if audio_kinds is not None and kind not in audio_kinds:
            ctx.error("ALLOWLISTS", f"piece.audio_tracks[{idx}].kind", f"audio track kind {kind!r} is not in registry allowlist")


def check_provenance(ctx: ValidationContext) -> None:
    piece = ctx.piece
    if piece is None:
        return

    if piece.get("schema_version") != CURRENT_SCHEMA_VERSION:
        ctx.error("PROVENANCE", "piece.schema_version", f"schema_version must be {CURRENT_SCHEMA_VERSION}")

    locale = piece.get("locale")
    if not isinstance(locale, str) or not re.fullmatch(r"[A-Za-z]{2,3}(?:-[A-Za-z0-9]{2,8})*", locale):
        ctx.error("PROVENANCE", "piece.locale", "locale must be a syntactically valid BCP-47 tag")


def span_mode(span: Any) -> str | None:
    if not isinstance(span, dict):
        return None
    modes = [key for key in ("words", "frames") if key in span]
    return modes[0] if len(modes) == 1 else None


def span_values(span: Any) -> tuple[int, int] | None:
    mode = span_mode(span)
    if mode is None:
        return None
    value = span.get(mode)
    if isinstance(value, list) and len(value) == 2 and all(is_int(item) for item in value):
        return int(value[0]), int(value[1])
    return None


def point_mode(anchor: Any) -> str | None:
    if not isinstance(anchor, dict):
        return None
    modes = [key for key in ("word", "frame") if key in anchor]
    return modes[0] if len(modes) == 1 else None


def point_value(anchor: Any) -> int | None:
    mode = point_mode(anchor)
    if mode is None:
        return None
    value = anchor.get(mode)
    return int(value) if is_int(value) else None


def word_start_frame(words: list[dict[str, Any]], word_idx: int, fps: int) -> int | None:
    if word_idx < 0 or word_idx >= len(words):
        return None
    try:
        return round(float(words[word_idx]["start"]) * fps)
    except Exception:  # noqa: BLE001
        return None


def word_end_frame(words: list[dict[str, Any]], word_idx: int, fps: int) -> int | None:
    if word_idx < 0 or word_idx >= len(words):
        return None
    try:
        return round(float(words[word_idx]["end"]) * fps)
    except Exception:  # noqa: BLE001
        return None


def resolve_span(span: Any, ctx: ValidationContext) -> tuple[int, int] | None:
    piece = ctx.piece
    values = span_values(span)
    mode = span_mode(span)
    if piece is None or values is None or not is_int(piece.get("fps")):
        return None
    start, end = values
    if mode == "frames":
        return start, end
    if mode == "words" and ctx.words is not None:
        start_frame = word_start_frame(ctx.words, start, piece["fps"])
        end_frame = word_end_frame(ctx.words, end, piece["fps"])
        if start_frame is not None and end_frame is not None:
            return start_frame, end_frame
    return None


def resolve_point(anchor: Any, ctx: ValidationContext) -> int | None:
    piece = ctx.piece
    value = point_value(anchor)
    mode = point_mode(anchor)
    if piece is None or value is None or not is_int(piece.get("fps")):
        return None
    if mode == "frame":
        return value
    if mode == "word" and ctx.words is not None:
        return word_start_frame(ctx.words, value, piece["fps"])
    return None


def check_timing_source_consistency(ctx: ValidationContext) -> None:
    piece = ctx.piece
    if piece is None:
        return

    for scene_idx, _scene, cut_idx, cut in each_cut(piece):
        cpath = cut_path(scene_idx, cut_idx)
        source = cut.get("timing_source")
        mode = span_mode(cut.get("span"))
        expected_mode = "words" if source == "tts" else "frames" if source in {"frame", "external_srt"} else None
        if expected_mode is not None and mode != expected_mode:
            ctx.error("TIMING_SOURCE_CONSISTENCY", f"{cpath}.span", f"{source} cut must use span.{expected_mode}")
        if source == "external_srt" and not cut.get("external_audio_ref"):
            ctx.error("TIMING_SOURCE_CONSISTENCY", f"{cpath}.external_audio_ref", "external_srt cut must carry external_audio_ref")

        expected_anchor = "word" if source == "tts" else "frame" if source in {"frame", "external_srt"} else None
        if expected_anchor is None:
            continue
        for overlay_idx, overlay in enumerate(as_list(cut.get("overlays"))):
            if not isinstance(overlay, dict):
                continue
            apath = f"{cpath}.overlays[{overlay_idx}]"
            if point_mode(overlay.get("appears_at")) != expected_anchor:
                ctx.error("TIMING_SOURCE_CONSISTENCY", f"{apath}.appears_at", f"{source} cut overlays must anchor by {expected_anchor}")
            life = overlay.get("life")
            until = life.get("until") if isinstance(life, dict) else None
            if isinstance(until, dict) and "end_of" not in until and point_mode(until) != expected_anchor:
                ctx.error("TIMING_SOURCE_CONSISTENCY", f"{apath}.life.until", f"{source} cut overlay exits must anchor by {expected_anchor} or end_of")
        for beat_idx, beat in enumerate(as_list(cut.get("beats"))):
            if not isinstance(beat, dict):
                continue
            if point_mode(beat.get("trigger")) != expected_anchor:
                ctx.error("TIMING_SOURCE_CONSISTENCY", f"{cpath}.beats[{beat_idx}].trigger", f"{source} cut beats must anchor by {expected_anchor}")


def validate_word_index(ctx: ValidationContext, value: Any, path: str, skip_words: bool) -> None:
    if skip_words:
        return
    if not is_int(value):
        ctx.error("RESOLVABILITY", path, "word index must be an integer")
        return
    if ctx.words is not None and (value < 0 or value >= len(ctx.words)):
        ctx.error("RESOLVABILITY", path, f"word index {value} does not exist in words.json")


def validate_frame_point(ctx: ValidationContext, value: Any, path: str) -> None:
    piece = ctx.piece
    if not is_int(value):
        ctx.error("RESOLVABILITY", path, "frame must be an integer")
        return
    if piece is not None and is_int(piece.get("runtime_frames")) and not (0 <= value < piece["runtime_frames"]):
        ctx.error("RESOLVABILITY", path, f"frame {value} is outside [0, runtime_frames)")


def validate_span(ctx: ValidationContext, span: Any, path: str, skip_words: bool = False) -> None:
    values = span_values(span)
    mode = span_mode(span)
    piece = ctx.piece
    if mode is None or values is None:
        ctx.error("RESOLVABILITY", path, "span must contain exactly one integer range: words [i, j] or frames [f1, f2]")
        return
    start, end = values
    if start > end:
        ctx.error("RESOLVABILITY", path, "span start must be <= span end")
    if mode == "words":
        validate_word_index(ctx, start, f"{path}.words[0]", skip_words)
        validate_word_index(ctx, end, f"{path}.words[1]", skip_words)
    elif piece is not None and is_int(piece.get("runtime_frames")):
        if start < 0 or start >= piece["runtime_frames"]:
            ctx.error("RESOLVABILITY", f"{path}.frames[0]", f"frame boundary {start} is outside [0, runtime_frames)")
        if end < 0 or end > piece["runtime_frames"]:
            ctx.error("RESOLVABILITY", f"{path}.frames[1]", f"frame boundary {end} is outside [0, runtime_frames]")
        if start >= end:
            ctx.error("RESOLVABILITY", path, "frame span must have start < end")


def validate_anchor(ctx: ValidationContext, anchor: Any, path: str, skip_words: bool = False) -> None:
    mode = point_mode(anchor)
    value = point_value(anchor)
    if mode is None or value is None:
        ctx.error("RESOLVABILITY", path, "anchor must contain exactly one integer word or frame")
        return
    if mode == "word":
        validate_word_index(ctx, value, f"{path}.word", skip_words)
    else:
        validate_frame_point(ctx, value, f"{path}.frame")


def check_resolvability(ctx: ValidationContext) -> None:
    piece = ctx.piece
    if piece is None:
        return

    if ctx.words is not None and ctx.words and is_int(piece.get("runtime_frames")) and is_int(piece.get("fps")):
        last_frame = word_end_frame(ctx.words, len(ctx.words) - 1, piece["fps"])
        if last_frame is not None and piece["runtime_frames"] < last_frame:
            ctx.error("RESOLVABILITY", "piece.runtime_frames", "runtime_frames is shorter than the last word frame in words.json")

    for scene_idx, _scene, cut_idx, cut in each_cut(piece):
        cpath = cut_path(scene_idx, cut_idx)
        skip_words = cut.get("timing_source") == "external_srt"
        validate_span(ctx, cut.get("span"), f"{cpath}.span", skip_words=skip_words)
        for overlay_idx, overlay in enumerate(as_list(cut.get("overlays"))):
            if not isinstance(overlay, dict):
                continue
            apath = f"{cpath}.overlays[{overlay_idx}]"
            validate_anchor(ctx, overlay.get("appears_at"), f"{apath}.appears_at", skip_words=skip_words)
            life = overlay.get("life")
            until = life.get("until") if isinstance(life, dict) else None
            if isinstance(until, dict) and "end_of" not in until:
                validate_anchor(ctx, until, f"{apath}.life.until", skip_words=skip_words)
        for beat_idx, beat in enumerate(as_list(cut.get("beats"))):
            if isinstance(beat, dict):
                validate_anchor(ctx, beat.get("trigger"), f"{cpath}.beats[{beat_idx}].trigger", skip_words=skip_words)

    for idx, track in enumerate(as_list(piece.get("audio_tracks"))):
        if isinstance(track, dict):
            validate_span(ctx, track.get("span"), f"piece.audio_tracks[{idx}].span")


def check_contiguity(ctx: ValidationContext) -> None:
    piece = ctx.piece
    if piece is None or not is_int(piece.get("runtime_frames")):
        return

    scene_intervals: list[tuple[int, int, str]] = []
    for scene_idx, scene in each_scene(piece):
        intervals: list[tuple[int, int, str]] = []
        for cut_idx, cut in enumerate(as_list(scene.get("cuts"))):
            if not isinstance(cut, dict):
                continue
            interval = resolve_span(cut.get("span"), ctx)
            if interval is None:
                continue
            intervals.append((interval[0], interval[1], cut_path(scene_idx, cut_idx)))
        if not intervals:
            continue
        for prev, current in zip(intervals, intervals[1:]):
            if prev[1] != current[0]:
                relation = "gap" if prev[1] < current[0] else "overlap"
                ctx.error("CONTIGUITY", current[2], f"cut {relation}: previous cut ends at {prev[1]}, current starts at {current[0]}")
        scene_intervals.append((intervals[0][0], intervals[-1][1], scene_path(scene_idx)))

    if not scene_intervals:
        return
    if scene_intervals[0][0] != 0:
        ctx.error("CONTIGUITY", scene_intervals[0][2], f"first scene starts at {scene_intervals[0][0]}, expected 0")
    for prev, current in zip(scene_intervals, scene_intervals[1:]):
        if prev[1] != current[0]:
            relation = "gap" if prev[1] < current[0] else "overlap"
            ctx.error("CONTIGUITY", current[2], f"scene {relation}: previous scene ends at {prev[1]}, current starts at {current[0]}")
    if scene_intervals[-1][1] != piece["runtime_frames"]:
        ctx.error("CONTIGUITY", scene_intervals[-1][2], f"last scene ends at {scene_intervals[-1][1]}, expected runtime_frames {piece['runtime_frames']}")


def within_point(frame: int, interval: tuple[int, int], *, allow_end: bool = False) -> bool:
    start, end = interval
    if allow_end:
        return start <= frame <= end
    return start <= frame < end


def overlay_end_frame(
    ctx: ValidationContext,
    cut: dict[str, Any],
    cut_interval: tuple[int, int],
    overlay: dict[str, Any],
    seen: set[str],
) -> int | None:
    life = overlay.get("life")
    if life in (None, "stays"):
        return cut_interval[1]
    if life == "pulse":
        return resolve_point(overlay.get("appears_at"), ctx)
    until = life.get("until") if isinstance(life, dict) else None
    if not isinstance(until, dict):
        return None
    if "end_of" not in until:
        return resolve_point(until, ctx)
    target_id = until.get("end_of")
    if not isinstance(target_id, str) or target_id in seen:
        return None
    for candidate in as_list(cut.get("overlays")):
        if isinstance(candidate, dict) and candidate.get("id") == target_id:
            return overlay_end_frame(ctx, cut, cut_interval, candidate, seen | {target_id})
    return None


def check_containment(ctx: ValidationContext) -> None:
    piece = ctx.piece
    if piece is None or not is_int(piece.get("runtime_frames")):
        return

    for scene_idx, _scene, cut_idx, cut in each_cut(piece):
        cpath = cut_path(scene_idx, cut_idx)
        cut_interval = resolve_span(cut.get("span"), ctx)
        if cut_interval is None:
            continue
        for overlay_idx, overlay in enumerate(as_list(cut.get("overlays"))):
            if not isinstance(overlay, dict):
                continue
            apath = f"{cpath}.overlays[{overlay_idx}]"
            appears_frame = resolve_point(overlay.get("appears_at"), ctx)
            if appears_frame is not None and not within_point(appears_frame, cut_interval):
                ctx.error("CONTAINMENT", f"{apath}.appears_at", f"overlay appears at frame {appears_frame}, outside parent cut span {cut_interval}")
            end_frame = overlay_end_frame(ctx, cut, cut_interval, overlay, set())
            if end_frame is not None and not within_point(end_frame, cut_interval, allow_end=True):
                ctx.error("CONTAINMENT", f"{apath}.life", f"overlay exit resolves to frame {end_frame}, outside parent cut span {cut_interval}")
        for beat_idx, beat in enumerate(as_list(cut.get("beats"))):
            if not isinstance(beat, dict):
                continue
            frame = resolve_point(beat.get("trigger"), ctx)
            if frame is not None and not within_point(frame, cut_interval):
                ctx.error("CONTAINMENT", f"{cpath}.beats[{beat_idx}].trigger", f"beat triggers at frame {frame}, outside parent cut span {cut_interval}")

    for idx, track in enumerate(as_list(piece.get("audio_tracks"))):
        if not isinstance(track, dict):
            continue
        interval = resolve_span(track.get("span"), ctx)
        if interval is None:
            continue
        if interval[0] < 0 or interval[1] > piece["runtime_frames"] or interval[0] >= interval[1]:
            ctx.error("CONTAINMENT", f"piece.audio_tracks[{idx}].span", f"audio track span {interval} is outside [0, runtime_frames)")


def check_referential_integrity(ctx: ValidationContext) -> None:
    piece = ctx.piece
    if piece is None:
        return

    scene_order: dict[str, int] = {}
    cut_ids: dict[str, str] = {}
    for scene_idx, scene in each_scene(piece):
        scene_id = scene.get("id")
        if isinstance(scene_id, str):
            scene_order[scene_id] = scene_idx
        for cut_idx, cut in enumerate(as_list(scene.get("cuts"))):
            if isinstance(cut, dict) and isinstance(cut.get("id"), str):
                cut_ids[cut["id"]] = cut_path(scene_idx, cut_idx)

    for scene_idx, _scene, cut_idx, cut in each_cut(piece):
        cpath = cut_path(scene_idx, cut_idx)
        reuses = cut.get("reuses")
        if reuses is not None:
            if reuses not in cut_ids:
                ctx.error("REFERENTIAL_INTEGRITY", f"{cpath}.reuses", f"reuses target {reuses!r} does not resolve to a cut id")
            elif reuses == cut.get("id"):
                ctx.error("REFERENTIAL_INTEGRITY", f"{cpath}.reuses", "reuses must point to another cut, not itself")
        callback_to = cut.get("callback_to")
        if callback_to is not None:
            if callback_to not in scene_order:
                ctx.error("REFERENTIAL_INTEGRITY", f"{cpath}.callback_to", f"callback_to target {callback_to!r} does not resolve to a scene id")
            elif scene_order[callback_to] >= scene_idx:
                ctx.error("REFERENTIAL_INTEGRITY", f"{cpath}.callback_to", "callback_to must point to an earlier scene")

        overlay_ids = {
            overlay.get("id")
            for overlay in as_list(cut.get("overlays"))
            if isinstance(overlay, dict) and isinstance(overlay.get("id"), str)
        }
        for overlay_idx, overlay in enumerate(as_list(cut.get("overlays"))):
            if not isinstance(overlay, dict):
                continue
            until = overlay.get("life", {}).get("until") if isinstance(overlay.get("life"), dict) else None
            if isinstance(until, dict) and "end_of" in until and until.get("end_of") not in overlay_ids:
                ctx.error("REFERENTIAL_INTEGRITY", f"{cpath}.overlays[{overlay_idx}].life.until.end_of", f"end_of target {until.get('end_of')!r} does not resolve inside this cut")


CHECKS = (
    check_shape,
    check_provenance,
    check_render_bindings,
    check_timing_source_consistency,
    check_resolvability,
    check_contiguity,
    check_containment,
    check_referential_integrity,
    check_allowlists,
)


def validate_project(project_dir: Path, *, strict: bool = False, registry_path: Path | None = None) -> dict[str, Any]:
    ctx = ValidationContext(
        project_dir=project_dir,
        strict=strict,
        registry_path=registry_path or DEFAULT_REGISTRY_PATH,
    )
    load_inputs(ctx)
    if ctx.render_manifest is not None:
        for check in CHECKS:
            check(ctx)

    errors = sum(1 for finding in ctx.findings if finding.severity == "error")
    warnings = sum(1 for finding in ctx.findings if finding.severity == "warning")
    status = "partial" if ctx.missing_inputs else "failed" if errors else "passed"
    return {
        "status": status,
        "errors": errors,
        "warnings": warnings,
        "findings": [finding.as_dict() for finding in ctx.findings],
    }


def print_human(report: dict[str, Any]) -> None:
    print(f"status: {report['status']}")
    print(f"errors: {report['errors']}")
    print(f"warnings: {report['warnings']}")
    findings = report.get("findings", [])
    if not findings:
        print("findings: none")
        return
    print("findings:")
    for finding in findings:
        print(f"- [{finding['severity']}] {finding['rule']} {finding['path']}: {finding['message']}")


def build_parser() -> argparse.ArgumentParser:
    parser = argparse.ArgumentParser(description="Validate direction/render-manifest.yaml against the render manifest contract.")
    parser.add_argument("project_dir", type=Path, help="Project directory containing direction/render-manifest.yaml")
    parser.add_argument("--strict", action="store_true", help="Reserved for stricter future checks; current invariants are always enforced")
    parser.add_argument("--json", action="store_true", help="Write structured JSON report to stdout")
    return parser


def parse_args(argv: list[str] | None = None) -> argparse.Namespace:
    return build_parser().parse_args(argv)


def main(argv: list[str] | None = None) -> int:
    args = parse_args(argv)
    report = validate_project(args.project_dir, strict=args.strict)
    if args.json:
        print(json.dumps(report, indent=2, sort_keys=True))
    else:
        print_human(report)
    return min(int(report["errors"]), 127)


if __name__ == "__main__":
    raise SystemExit(main())
