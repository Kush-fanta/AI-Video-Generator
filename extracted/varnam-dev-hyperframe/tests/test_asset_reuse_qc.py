"""Unit tests for the asset reuse QC gate."""

from __future__ import annotations

import importlib.util
import json
import sys
from pathlib import Path


SCRIPT_PATH = Path(__file__).resolve().parents[1] / "scripts/review/asset_reuse.py"
SPEC = importlib.util.spec_from_file_location("asset_reuse_qc", SCRIPT_PATH)
asset_reuse_qc = importlib.util.module_from_spec(SPEC)
assert SPEC.loader is not None
sys.modules[SPEC.name] = asset_reuse_qc
SPEC.loader.exec_module(asset_reuse_qc)


def _render_manifest_with_reuse(reuses_b02: str | None, reuses_b03: str | None = None) -> dict[str, object]:
    return {
        "piece": {
            "schema_version": 2,
            "locale": "en-IN",
            "runtime_frames": 90,
            "fps": 30,
            "audio_tracks": [],
            "scenes": [
                {
                    "id": "scene_a",
                    "cuts": [
                        {
                            "id": "B01",
                            "span": {"frames": [0, 30]},
                            "timing_source": "frame",
                            "composition": "image/full-bleed",
                            "variables": {},
                            "reuses": None,
                            "callback_to": None,
                            "overlays": [],
                            "beats": [],
                        },
                        {
                            "id": "B02",
                            "span": {"frames": [30, 60]},
                            "timing_source": "frame",
                            "composition": "image/full-bleed",
                            "variables": {},
                            "reuses": reuses_b02,
                            "callback_to": None,
                            "overlays": [],
                            "beats": [],
                        },
                        {
                            "id": "B03",
                            "span": {"frames": [60, 90]},
                            "timing_source": "frame",
                            "composition": "image/full-bleed",
                            "variables": {},
                            "reuses": reuses_b03,
                            "callback_to": None,
                            "overlays": [],
                            "beats": [],
                        },
                    ],
                }
            ],
        }
    }


def test_declared_reuse_chain_allows_repeat(tmp_path: Path) -> None:
    render_manifest_path = tmp_path / "render-manifest.yaml"
    render_manifest_path.write_text(
        json.dumps(_render_manifest_with_reuse("B01")),
        encoding="utf-8",
    )

    reuses_by_cut = asset_reuse_qc._load_render_manifest_reuses(render_manifest_path)
    origins, declared, undeclared = asset_reuse_qc._classify_asset_repeat(
        ["B01", "B02"],
        reuses_by_cut,
    )

    assert origins == ["B01"]
    assert declared == ["B02"]
    assert undeclared == []


def test_unrelated_repeat_blocks(tmp_path: Path) -> None:
    render_manifest_path = tmp_path / "render-manifest.yaml"
    render_manifest_path.write_text(
        json.dumps(_render_manifest_with_reuse(None, None)),
        encoding="utf-8",
    )

    reuses_by_cut = asset_reuse_qc._load_render_manifest_reuses(render_manifest_path)
    origins, declared, undeclared = asset_reuse_qc._classify_asset_repeat(
        ["B01", "B03"],
        reuses_by_cut,
    )

    assert origins == ["B01", "B03"]
    assert declared == []
    assert undeclared == []


def test_scan_film_deduplicates_same_asset_within_cut(tmp_path: Path) -> None:
    film_path = tmp_path / "Film.tsx"
    film_path.write_text(
        """
        {/* B01 first */}
        <Sequence><Image src={photo("same.jpg")} /></Sequence>
        <Sequence><Image src={photo("same.jpg")} /></Sequence>
        {/* B02 second */}
        <Sequence><Image src={photo("same.jpg")} /></Sequence>
        """,
        encoding="utf-8",
    )

    usage = asset_reuse_qc._scan_film(film_path)

    assert usage["same.jpg"] == ["B01", "B02"]
