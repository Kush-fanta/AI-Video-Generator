from __future__ import annotations

import json
import sys
from pathlib import Path

_REPO = Path(__file__).resolve().parents[1]
sys.path.insert(0, str(_REPO / "scripts" / "visual"))
sys.path.insert(1, str(_REPO / "scripts" / "research"))

from verify_assets import build_analysis_manifest, build_asset_record, needs_verification


def test_needs_verification_includes_documents_and_screenshots(tmp_path: Path) -> None:
    screenshot_path = tmp_path / "chart.png"
    screenshot_path.write_bytes(b"png")
    document_path = tmp_path / "report.pdf"
    document_path.write_bytes(b"%PDF-1.4")

    screenshot_asset = {"local_path": str(screenshot_path), "download_method": "screenshot", "asset_type": "image"}
    document_asset = {"local_path": str(document_path), "download_method": "curl", "asset_type": "document"}

    assert needs_verification(screenshot_asset) is True
    assert needs_verification(document_asset) is True


def test_build_analysis_manifest_keeps_documents_and_screenshots(tmp_path: Path) -> None:
    screenshot_path = tmp_path / "chart.png"
    screenshot_path.write_bytes(b"png")
    document_path = tmp_path / "report.pdf"
    document_path.write_bytes(b"%PDF-1.4")

    manifest_path = tmp_path / "verify_manifest.json"
    build_analysis_manifest(
        [
            {
                "id": "shot-1",
                "local_path": str(screenshot_path),
                "download_method": "screenshot",
                "asset_type": "image",
                "description": "Open data chart",
                "topic_id": "topic-a",
            },
            {
                "id": "doc-1",
                "local_path": str(document_path),
                "download_method": "curl",
                "asset_type": "document",
                "description": "Government report",
                "topic_id": "topic-b",
            },
        ],
        {"topic-a": "chart context", "topic-b": "report context"},
        manifest_path,
    )

    payload = json.loads(manifest_path.read_text(encoding="utf-8"))
    assert [job["id"] for job in payload["jobs"]] == ["shot-1", "doc-1"]


def test_build_asset_record_respects_rights_gate_even_when_content_looks_good(tmp_path: Path) -> None:
    image_path = tmp_path / "frame.png"
    image_path.write_bytes(b"png")
    record = build_asset_record(
        {
            "id": "video-1",
            "asset_type": "video",
            "local_path": str(image_path),
            "source_url": "https://www.youtube.com/watch?v=example",
            "license_claim": "",
            "description": "Official-looking clip",
        },
        {
            "analysis": {
                "answer": "This matches the claimed content and looks production-usable.",
                "summary": "",
                "confidence_notes": [],
            }
        },
    )

    assert record["verified"] is True
    assert record["rights_clear"] is False
    assert record["usable"] is False
