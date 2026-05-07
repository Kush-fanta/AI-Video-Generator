#!/usr/bin/env python3
# ---
# varnam_script: shared.provider_registry
# owner: shared
# status: live
# surface: import-only
# purpose: Provider and model defaults registry.
# use_when: Import to resolve audio/image provider aliases and defaults.
# inputs: CLI args, manifests, env vars, or imports documented by argparse/docstring
# outputs: files, JSON/stdout reports, or process exit code documented by the script
# authority: scripts/README.md; scripts/SCRIPT_MAP.md
# ---
"""Global provider and model defaults for scripts/ entrypoints."""

from __future__ import annotations

from typing import Final, Mapping

AUDIO_PROVIDER_SPECS: Final[dict[str, dict[str, str]]] = {
    "gemini": {
        "default_voice": "Kore",
        "default_model": "gemini-2.5-pro-preview-tts",
        "jobs_default_model": "gemini-2.5-flash-preview-tts",
    },
    "elevenlabs": {
        "default_voice": "George",
        "default_model": "eleven_v3",
        "default_stability": "natural",
    },
}

AUDIO_PROVIDER_NAMES: Final[tuple[str, ...]] = tuple(AUDIO_PROVIDER_SPECS.keys())
DEFAULT_AUDIO_PROVIDER: Final[str] = "elevenlabs"

GEMINI_MODEL_ALIASES: Final[dict[str, str]] = {
    "flash": "gemini-flash-latest",
    "pro": "gemini-pro",
    "flash-lite": "gemini-2.5-flash-lite",
    "2.5-pro": "gemini-2.5-pro",
}

DEFAULT_ANALYZE_MODEL_ALIAS: Final[str] = "flash"
DEFAULT_TRANSCRIPT_MODEL: Final[str] = "gemini-2.5-flash-lite"
DEFAULT_TRANSCRIPT_RERUN_MODEL: Final[str] = "gemini-2.5-pro"
DEFAULT_ALIGNMENT_ENGINE: Final[str] = "elevenlabs"

IMAGE_MODEL_ALIASES: Final[dict[str, str]] = {
    "nano-banana-2": "gemini-3.1-flash-image-preview",
    "nano-banana-pro": "gemini-3-pro-image-preview",
}

DEFAULT_IMAGE_MODEL_ALIAS: Final[str] = "nano-banana-2"


def audio_provider_choices() -> tuple[str, ...]:
    return AUDIO_PROVIDER_NAMES


def audio_provider_spec(provider: str) -> dict[str, str]:
    spec = AUDIO_PROVIDER_SPECS.get(provider)
    if spec is None:
        raise ValueError(f"Unsupported provider '{provider}'. Use one of: {', '.join(AUDIO_PROVIDER_NAMES)}.")
    return spec


def audio_default_voice(provider: str) -> str:
    return audio_provider_spec(provider)["default_voice"]


def audio_default_model(provider: str, *, jobs: bool = False) -> str:
    spec = audio_provider_spec(provider)
    if jobs and spec.get("jobs_default_model"):
        return spec["jobs_default_model"]
    return spec["default_model"]


def audio_default_stability(provider: str) -> str:
    return audio_provider_spec(provider).get("default_stability", "natural")


def resolve_gemini_model(model_name: str | None, *, default_alias: str = DEFAULT_ANALYZE_MODEL_ALIAS) -> str:
    chosen = (model_name or default_alias).strip()
    return GEMINI_MODEL_ALIASES.get(chosen.lower(), chosen)


def default_image_model_setting(env: Mapping[str, str] | None = None) -> str:
    source = env if env is not None else {}
    return (source.get("GEMINI_IMAGE_MODEL", DEFAULT_IMAGE_MODEL_ALIAS) or DEFAULT_IMAGE_MODEL_ALIAS).strip()


def resolve_image_model(model_name: str | None, env: Mapping[str, str] | None = None) -> str:
    chosen = (model_name or default_image_model_setting(env)).strip()
    return IMAGE_MODEL_ALIASES.get(chosen.lower(), chosen)


def image_model_aliases_csv() -> str:
    return ", ".join(sorted(IMAGE_MODEL_ALIASES))
