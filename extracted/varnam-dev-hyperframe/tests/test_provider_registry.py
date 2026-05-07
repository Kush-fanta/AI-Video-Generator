import importlib.util
from pathlib import Path


def _load_provider_registry():
    path = Path(__file__).resolve().parents[1] / "scripts" / "shared" / "provider_registry.py"
    spec = importlib.util.spec_from_file_location("varnam_provider_registry", path)
    module = importlib.util.module_from_spec(spec)
    assert spec.loader is not None
    spec.loader.exec_module(module)
    return module


def test_default_image_model_does_not_read_shell_env(monkeypatch):
    registry = _load_provider_registry()
    monkeypatch.setenv("GEMINI_IMAGE_MODEL", "shell-value")

    assert registry.default_image_model_setting() == registry.DEFAULT_IMAGE_MODEL_ALIAS


def test_default_image_model_uses_explicit_source():
    registry = _load_provider_registry()

    assert registry.default_image_model_setting({"GEMINI_IMAGE_MODEL": "nano-banana-pro"}) == "nano-banana-pro"


def test_normal_gemini_model_aliases_are_shared():
    registry = _load_provider_registry()

    assert registry.resolve_gemini_model(None) == "gemini-flash-latest"
    assert registry.resolve_gemini_model("pro") == "gemini-pro"
    assert registry.DEFAULT_AUDIO_PROVIDER == "elevenlabs"
    assert registry.DEFAULT_TRANSCRIPT_MODEL == "gemini-2.5-flash-lite"
    assert registry.DEFAULT_ALIGNMENT_ENGINE == "elevenlabs"
