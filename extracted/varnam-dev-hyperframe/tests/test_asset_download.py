from __future__ import annotations

import sys
from pathlib import Path

sys.path.insert(0, str(Path(__file__).resolve().parents[1] / "scripts" / "research"))

from asset_download import build_curl_command, evaluate_download_policy, normalize_license


def test_normalize_license_maps_creative_commons_variants() -> None:
    assert normalize_license("Creative Commons Attribution-ShareAlike 4.0") == "cc-by-sa"
    assert normalize_license("Public Domain Mark 1.0") == "public-domain"
    assert normalize_license("Open Government License") == "open-data"


def test_policy_allows_cc_wikimedia_image() -> None:
    allowed, reason = evaluate_download_policy(
        {
            "source_url": "https://upload.wikimedia.org/example.jpg",
            "asset_type": "image",
            "download_method": "curl",
            "license_claim": "CC-BY-SA 4.0",
        }
    )
    assert allowed is True
    assert reason == "ok"


def test_policy_rejects_blacklisted_stock_source() -> None:
    allowed, reason = evaluate_download_policy(
        {
            "source_url": "https://www.gettyimages.com/photos/example",
            "asset_type": "image",
            "download_method": "curl",
            "license_claim": "public-domain",
        }
    )
    assert allowed is False
    assert "blacklisted" in reason


def test_policy_rejects_unknown_youtube_rights() -> None:
    allowed, reason = evaluate_download_policy(
        {
            "source_url": "https://www.youtube.com/watch?v=dQw4w9WgXcQ",
            "asset_type": "video",
            "download_method": "yt-dlp",
            "license_claim": "",
        }
    )
    assert allowed is False
    assert "license" in reason


def test_policy_limits_screenshots_to_open_surfaces() -> None:
    allowed, reason = evaluate_download_policy(
        {
            "source_url": "https://www.bbc.com/news/articles/example",
            "asset_type": "image",
            "download_method": "screenshot",
            "license_claim": "public-domain",
        }
    )
    assert allowed is False
    assert "screenshots" in reason


def test_wikimedia_curl_uses_commons_referer(tmp_path: Path) -> None:
    command = build_curl_command(
        "https://upload.wikimedia.org/wikipedia/commons/example.jpg",
        tmp_path / "example.jpg",
    )
    assert "--referer" in command
    assert "https://commons.wikimedia.org/" in command
