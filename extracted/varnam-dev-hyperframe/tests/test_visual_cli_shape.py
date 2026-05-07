import importlib.util
from pathlib import Path

import pytest


def _load_module(relative_path: str, module_name: str):
    path = Path(__file__).resolve().parents[1] / relative_path
    spec = importlib.util.spec_from_file_location(module_name, path)
    module = importlib.util.module_from_spec(spec)
    assert spec.loader is not None
    spec.loader.exec_module(module)
    return module


def test_analyze_media_parse_args_is_separate_from_main():
    analyze_media = _load_module("scripts/visual/analyze_media.py", "varnam_visual_analyze_media")

    args = analyze_media.parse_args(["--jobs", "jobs.json", "--job-id", "beat-01"])

    assert args.jobs == "jobs.json"
    assert args.job_id == "beat-01"


def test_video_parse_args_is_separate_from_main():
    video = _load_module("scripts/visual/video.py", "varnam_visual_video")

    args = video.parse_args(["--jobs", "video-jobs.json", "--job-id", "clip-01"])

    assert args.jobs == "video-jobs.json"
    assert args.job_id == "clip-01"


def test_verify_assets_parse_args_is_separate_from_main():
    verify_assets = _load_module("scripts/visual/verify_assets.py", "varnam_visual_verify_assets")

    args = verify_assets.parse_args(["--manifest", "download_manifest.json", "--analysis-timeout", "30"])

    assert args.manifest == "download_manifest.json"
    assert args.analysis_timeout == 30


def test_video_clip_parse_args_is_separate_from_main():
    video_clip = _load_module("scripts/visual/video_clip.py", "varnam_visual_video_clip")

    args = video_clip.parse_args(["--url", "https://youtu.be/example", "--output", "clip.mp4", "--quality", "720"])

    assert args.url == "https://youtu.be/example"
    assert args.output == "clip.mp4"
    assert args.quality == "720"


def test_video_clip_download_without_output_uses_argparse_error():
    video_clip = _load_module("scripts/visual/video_clip.py", "varnam_visual_video_clip_missing_output")

    with pytest.raises(SystemExit) as exc:
        video_clip.main(["--url", "https://youtu.be/example"])

    assert exc.value.code == 2


def test_video_clip_extract_frame_without_output_uses_argparse_error():
    video_clip = _load_module("scripts/visual/video_clip.py", "varnam_visual_video_clip_frame_missing_output")

    with pytest.raises(SystemExit) as exc:
        video_clip.main(["--url", "https://youtu.be/example", "--extract-frame", "00:00:01"])

    assert exc.value.code == 2


def test_screenshot_parse_args_is_separate_from_main():
    screenshot = _load_module("scripts/visual/screenshot.py", "varnam_visual_screenshot")

    args = screenshot.parse_args(["--url", "https://example.com", "--output", "page.png", "--type", "page"])

    assert args.url == "https://example.com"
    assert args.output == "page.png"
    assert args.type == "page"


def test_consistency_parse_args_is_separate_from_main():
    consistency = _load_module("scripts/visual/consistency.py", "varnam_visual_consistency")

    args = consistency.parse_args(["preflight", "projects/demo"])

    assert args.cmd == "preflight"
    assert args.project == "projects/demo"
