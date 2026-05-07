"""Unit tests for the pacing density QC gate."""

from __future__ import annotations

import importlib.util
import json
import sys
from pathlib import Path


SCRIPT_PATH = Path(__file__).resolve().parents[1] / "scripts/review/pacing_density.py"
SPEC = importlib.util.spec_from_file_location("pacing_density_qc", SCRIPT_PATH)
pacing_density_qc = importlib.util.module_from_spec(SPEC)
assert SPEC.loader is not None
sys.modules[SPEC.name] = pacing_density_qc
SPEC.loader.exec_module(pacing_density_qc)


def test_parse_timing_supports_object_and_array_forms(tmp_path: Path) -> None:
    timing_path = tmp_path / "timing.ts"
    timing_path.write_text(
        """
        export const T = {
          B01: { from: 0, dur: 180 },
        };
        export const SHOTS = [
          { id: "f1", from: 180, dur: 90 },
        ];
        """,
        encoding="utf-8",
    )

    beats = pacing_density_qc._parse_timing(timing_path)

    assert beats["B01"] == (0, 180)
    assert beats["f1"] == (180, 90)


def test_parse_render_manifest_holds_reads_structured_cut_annotations(tmp_path: Path) -> None:
    render_manifest_path = tmp_path / "render-manifest.yaml"
    render_manifest_path.write_text(
        json.dumps(
            {
                "piece": {
                    "schema_version": 2,
                    "locale": "en-IN",
                    "runtime_frames": 240,
                    "fps": 30,
                    "audio_tracks": [],
                    "scenes": [
                        {
                            "id": "scene_a",
                            "cuts": [
                                {
                                    "id": "B01",
                                    "span": {"frames": [0, 180]},
                                    "timing_source": "frame",
                                    "composition": "text/card",
                                    "variables": {},
                                    "overlays": [],
                                    "beats": [],
                                    "locked_notes": "designed hold to land the pivot",
                                },
                                {
                                    "id": "B02",
                                    "span": {"frames": [180, 240]},
                                    "timing_source": "frame",
                                    "composition": "image/full-bleed",
                                    "variables": {},
                                    "overlays": [],
                                    "beats": [],
                                },
                            ],
                        }
                    ],
                }
            }
        ),
        encoding="utf-8",
    )

    holds = pacing_density_qc._parse_render_manifest_holds(render_manifest_path)

    assert holds == {"B01"}


def test_parse_film_components_uses_generic_cut_ids(tmp_path: Path) -> None:
    film_path = tmp_path / "Film.tsx"
    film_path.write_text(
        """
        {/* intro_1 */}
        <Sequence>
          <TextCard />
        </Sequence>
        {/* B02 */}
        <Sequence>
          <ImageFullBleed />
        </Sequence>
        """,
        encoding="utf-8",
    )

    components = pacing_density_qc._parse_film_beat_components(film_path)

    assert components["intro_1"] == "TextCard"
    assert components["B02"] == "ImageFullBleed"
