import importlib.util
from pathlib import Path


def _load_module(relative_path: str, module_name: str):
    path = Path(__file__).resolve().parents[1] / relative_path
    spec = importlib.util.spec_from_file_location(module_name, path)
    module = importlib.util.module_from_spec(spec)
    assert spec.loader is not None
    spec.loader.exec_module(module)
    return module


def test_asset_download_parse_args_is_separate_from_main():
    asset_download = _load_module("scripts/research/asset_download.py", "varnam_research_asset_download")

    args = asset_download.parse_args(
        ["--manifest", "filtered_results.json", "--project-dir", "projects/demo", "--max-http", "2"]
    )

    assert args.manifest == "filtered_results.json"
    assert args.project_dir == "projects/demo"
    assert args.max_http == 2


def test_video_scout_parse_args_is_separate_from_main():
    video_scout = _load_module("scripts/research/video_scout.py", "varnam_research_video_scout")

    args = video_scout.parse_args(["--url", "https://youtu.be/example", "--keywords", "land", "rent"])

    assert args.url == "https://youtu.be/example"
    assert args.keywords == ["land", "rent"]
    assert args.context == 30
