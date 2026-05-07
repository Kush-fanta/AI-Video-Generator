import importlib.util
import json
import sys
from pathlib import Path


SCRIPT_PATH = Path(__file__).resolve().parents[1] / "scripts/review/validate_render_manifest.py"
SPEC = importlib.util.spec_from_file_location("validate_render_manifest", SCRIPT_PATH)
validate_render_manifest = importlib.util.module_from_spec(SPEC)
assert SPEC.loader is not None
sys.modules[SPEC.name] = validate_render_manifest
SPEC.loader.exec_module(validate_render_manifest)


def registry_payload():
    return {
        "render_manifest_contract": {
            "overlay_kinds_allowlist": ["text", "label", "graphic", "highlight"],
            "beat_channels_allowlist": ["visual", "audio"],
            "beat_event_kinds_allowlist": ["sfx", "music_hit", "camera_push"],
            "audio_track_kinds_allowlist": ["music", "ambience", "drone"],
            "timing_sources_allowlist": ["tts", "frame", "external_srt"],
        }
    }


def words_payload():
    return [
        {"word": "alpha", "start": 0.0, "end": 1.0},
        {"word": "beta", "start": 1.0, "end": 2.0},
    ]


def write_fixture(tmp_path, render_manifest, words=None, registry=None):
    project = tmp_path / "project"
    (project / "direction").mkdir(parents=True)
    (project / "audio").mkdir(parents=True)
    words = words_payload() if words is None else words
    words_bytes = json.dumps(words, separators=(",", ":")).encode("utf-8")
    (project / "audio/voiceover.words.json").write_bytes(words_bytes)
    (project / "direction/render-manifest.yaml").write_text(json.dumps(render_manifest), encoding="utf-8")
    registry_path = tmp_path / "capability-registry.json"
    registry_path.write_text(json.dumps(registry or registry_payload()), encoding="utf-8")
    return project, registry_path


def base_render_manifest():
    return {
        "piece": {
            "schema_version": 2,
            "locale": "en-IN",
            "runtime_frames": 90,
            "fps": 30,
            "audio_tracks": [
                {"id": "music", "kind": "music", "span": {"words": [0, 1]}},
            ],
            "scenes": [
                {
                    "id": "scene_a",
                    "intent": "open",
                    "motif_tags": [],
                    "cuts": [
                        {
                            "id": "cut_a",
                            "span": {"words": [0, 1]},
                            "timing_source": "tts",
                            "kind": "typography",
                            "composition": "hero/topic-hero",
                            "variables": {},
                            "reuses": None,
                            "callback_to": None,
                            "overlays": [
                                {
                                    "id": "title",
                                    "kind": "text",
                                    "content": "Alpha",
                                    "appears_at": {"word": 0},
                                    "life": "stays",
                                }
                            ],
                            "beats": [
                                {
                                    "id": "hit",
                                    "channel": "audio",
                                    "trigger": {"word": 1},
                                    "event": "sfx: hit",
                                }
                            ],
                        },
                        {
                            "id": "cut_b",
                            "span": {"frames": [60, 90]},
                            "timing_source": "frame",
                            "kind": "hold",
                            "composition": "runtime/held",
                            "variables": {},
                            "reuses": "cut_a",
                            "callback_to": None,
                            "overlays": [
                                {
                                    "id": "tail",
                                    "kind": "label",
                                    "content": "Tail",
                                    "appears_at": {"frame": 60},
                                    "life": "stays",
                                }
                            ],
                            "beats": [
                                {
                                    "id": "push",
                                    "channel": "visual",
                                    "trigger": {"frame": 70},
                                    "event": "camera_push",
                                }
                            ],
                        },
                    ],
                }
            ],
        }
    }


def error_rules(report):
    return {finding["rule"] for finding in report["findings"] if finding["severity"] == "error"}


def test_happy_path(tmp_path):
    project, registry_path = write_fixture(tmp_path, base_render_manifest())
    report = validate_render_manifest.validate_project(project, registry_path=registry_path)

    assert report["status"] == "passed"
    assert report["errors"] == 0


def test_overlap_detection(tmp_path):
    render_manifest = base_render_manifest()
    render_manifest["piece"]["runtime_frames"] = 80
    cuts = render_manifest["piece"]["scenes"][0]["cuts"]
    cuts[0]["span"] = {"frames": [0, 50]}
    cuts[0]["timing_source"] = "frame"
    cuts[0]["overlays"][0]["appears_at"] = {"frame": 0}
    cuts[0]["beats"][0]["trigger"] = {"frame": 10}
    cuts[1]["span"] = {"frames": [40, 80]}

    project, registry_path = write_fixture(tmp_path, render_manifest)
    report = validate_render_manifest.validate_project(project, registry_path=registry_path)

    assert "CONTIGUITY" in error_rules(report)
    assert any("overlap" in finding["message"] for finding in report["findings"])


def test_containment_failure(tmp_path):
    render_manifest = base_render_manifest()
    render_manifest["piece"]["scenes"][0]["cuts"][0]["overlays"][0]["appears_at"] = {"word": 1}
    render_manifest["piece"]["scenes"][0]["cuts"][0]["span"] = {"words": [0, 0]}

    project, registry_path = write_fixture(tmp_path, render_manifest)
    report = validate_render_manifest.validate_project(project, registry_path=registry_path)

    assert "CONTAINMENT" in error_rules(report)


def test_allowlist_rejection(tmp_path):
    render_manifest = base_render_manifest()
    render_manifest["piece"]["scenes"][0]["cuts"][0]["overlays"][0]["kind"] = "ticker"

    project, registry_path = write_fixture(tmp_path, render_manifest)
    report = validate_render_manifest.validate_project(project, registry_path=registry_path)

    assert "ALLOWLISTS" in error_rules(report)


def test_external_srt_path(tmp_path):
    render_manifest = {
        "piece": {
            "schema_version": 2,
            "locale": "en-IN",
            "runtime_frames": 60,
            "fps": 30,
            "audio_tracks": [],
            "scenes": [
                {
                    "id": "scene_a",
                    "cuts": [
                        {
                            "id": "external",
                            "span": {"frames": [0, 60]},
                            "timing_source": "external_srt",
                            "external_audio_ref": "audio/imported.wav",
                            "kind": "video",
                            "composition": "image-comp/full-bleed-overlay",
                            "variables": {},
                            "overlays": [
                                {
                                    "id": "caption",
                                    "kind": "text",
                                    "content": "Imported",
                                    "appears_at": {"frame": 0},
                                    "life": "stays",
                                }
                            ],
                            "beats": [
                                {
                                    "id": "hit",
                                    "channel": "audio",
                                    "trigger": {"frame": 10},
                                    "event": "music_hit",
                                }
                            ],
                        }
                    ],
                }
            ],
        }
    }
    project, registry_path = write_fixture(tmp_path, render_manifest)
    report = validate_render_manifest.validate_project(project, registry_path=registry_path)

    assert report["status"] == "passed"
    assert report["errors"] == 0
