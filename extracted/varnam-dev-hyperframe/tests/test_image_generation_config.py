import importlib.util
from pathlib import Path


def _load_image_module():
    path = Path(__file__).resolve().parents[1] / "scripts" / "visual" / "image.py"
    spec = importlib.util.spec_from_file_location("varnam_visual_image", path)
    module = importlib.util.module_from_spec(spec)
    assert spec.loader is not None
    spec.loader.exec_module(module)
    return module


def test_gemini_3_image_config_includes_size():
    image = _load_image_module()

    config = image.generate_content_config(
        "gemini-3.1-flash-image-preview",
        aspect_ratio="16:9",
        size="2K",
    )

    assert config["image_config"] == {
        "aspect_ratio": "16:9",
        "image_size": "2K",
    }


def test_legacy_image_config_does_not_force_size():
    image = _load_image_module()

    config = image.generate_content_config(
        "gemini-2.5-flash-image",
        aspect_ratio="1:1",
        size="1K",
    )

    assert config["image_config"] == {"aspect_ratio": "1:1"}
