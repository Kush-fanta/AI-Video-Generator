import importlib.util
import argparse
import base64
import json
from pathlib import Path

import pytest


def _load_module(relative_path: str, module_name: str):
    path = Path(__file__).resolve().parents[1] / relative_path
    spec = importlib.util.spec_from_file_location(module_name, path)
    module = importlib.util.module_from_spec(spec)
    assert spec.loader is not None
    spec.loader.exec_module(module)
    return module


def test_music_parse_args_is_separate_from_main():
    music = _load_module("scripts/audio/music.py", "varnam_audio_music")

    args = music.parse_args(["--prompt-file", "prompt.txt", "--output", "score.mp3"])

    assert args.prompt_file == "prompt.txt"
    assert args.output == "score.mp3"
    assert args.model == "lyria-3-pro-preview"


def test_tts_parse_args_is_separate_from_main():
    tts = _load_module("scripts/audio/tts.py", "varnam_audio_tts")

    args = tts.parse_args(["--text", "hello", "--output", "voice.mp3", "--provider", "gemini"])

    assert args.text == "hello"
    assert args.output == "voice.mp3"
    assert args.provider == "gemini"


def test_tts_default_provider_is_elevenlabs():
    tts = _load_module("scripts/audio/tts.py", "varnam_audio_tts_default")

    args = tts.parse_args(["--text", "hello", "--output", "voice.mp3"])

    assert args.provider == "elevenlabs"


def test_tts_chunking_prefers_paragraph_boundaries():
    tts = _load_module("scripts/audio/tts.py", "varnam_audio_tts_chunk_paragraphs")
    text = "Paragraph one stays together.\n\nParagraph two stays together.\n\nParagraph three."

    chunks = tts.chunk_text(text, max_chars=65)

    assert chunks == [
        "Paragraph one stays together.\n\nParagraph two stays together.",
        "Paragraph three.",
    ]


def test_tts_chunking_splits_oversized_paragraph_on_sentence_boundary():
    tts = _load_module("scripts/audio/tts.py", "varnam_audio_tts_chunk_sentence")
    text = "First sentence is long enough. Second sentence must move. Third sentence remains."

    chunks = tts.chunk_text(text, max_chars=35)

    assert chunks == [
        "First sentence is long enough.",
        "Second sentence must move.",
        "Third sentence remains.",
    ]


def test_elevenlabs_timestamp_request_sends_chunk_context_for_supported_models(monkeypatch):
    tts = _load_module("scripts/audio/tts.py", "varnam_audio_tts_context")
    captured = {}

    class FakeResponse:
        def __enter__(self):
            return self

        def __exit__(self, *_args):
            return False

        def read(self):
            return json.dumps(
                {
                    "audio_base64": base64.b64encode(b"mp3").decode("ascii"),
                    "alignment": {
                        "characters": [],
                        "character_start_times_seconds": [],
                        "character_end_times_seconds": [],
                    },
                }
            ).encode("utf-8")

    def fake_urlopen(req, timeout):
        captured["payload"] = json.loads(req.data.decode("utf-8"))
        captured["timeout"] = timeout
        return FakeResponse()

    monkeypatch.setattr(tts.urllib.request, "urlopen", fake_urlopen)

    audio, words = tts._elevenlabs_tts_with_timestamps(
        api_key="key",
        voice_id="voice",
        text="middle chunk",
        model="eleven_multilingual_v2",
        voice_settings={"stability": 0.45},
        previous_text="previous chunk",
        next_text="next chunk",
    )

    assert audio == b"mp3"
    assert words == []
    assert captured["payload"]["previous_text"] == "previous chunk"
    assert captured["payload"]["next_text"] == "next chunk"


def test_elevenlabs_v3_timestamp_request_omits_unsupported_chunk_context(monkeypatch):
    tts = _load_module("scripts/audio/tts.py", "varnam_audio_tts_v3_context")
    captured = {}

    class FakeResponse:
        def __enter__(self):
            return self

        def __exit__(self, *_args):
            return False

        def read(self):
            return json.dumps(
                {
                    "audio_base64": base64.b64encode(b"mp3").decode("ascii"),
                    "alignment": {
                        "characters": [],
                        "character_start_times_seconds": [],
                        "character_end_times_seconds": [],
                    },
                }
            ).encode("utf-8")

    def fake_urlopen(req, timeout):
        captured["payload"] = json.loads(req.data.decode("utf-8"))
        return FakeResponse()

    monkeypatch.setattr(tts.urllib.request, "urlopen", fake_urlopen)

    tts._elevenlabs_tts_with_timestamps(
        api_key="key",
        voice_id="voice",
        text="middle chunk",
        model="eleven_v3",
        voice_settings={"stability": 0.45},
        previous_text="previous chunk",
        next_text="next chunk",
    )

    assert "previous_text" not in captured["payload"]
    assert "next_text" not in captured["payload"]


def test_align_audio_parse_args_is_separate_from_main():
    align_audio = _load_module("scripts/audio/align_audio.py", "varnam_audio_align")

    args = align_audio.parse_args(["--audio", "voice.mp3", "--output-words", "words.json"])

    assert args.audio == "voice.mp3"
    assert args.output_words == "words.json"
    assert args.engine == "auto"


def test_quota_probe_parse_args_is_separate_from_main():
    quota_probe = _load_module("scripts/audio/quota_probe.py", "varnam_audio_quota_probe")

    args = quota_probe.parse_args(["audio/custom.source.txt", "--margin", "0.25"])

    assert args.source == "audio/custom.source.txt"
    assert args.margin == 0.25


def test_qwen3_align_parse_args_is_separate_from_main():
    qwen3_align = _load_module("scripts/audio/qwen3_align.py", "varnam_audio_qwen3_align")

    args = qwen3_align.parse_args(["--audio", "voice.mp3", "--text", "hello", "--output-words", "words.json"])

    assert args.audio == "voice.mp3"
    assert args.text == "hello"
    assert args.output_words == "words.json"


def test_subtitles_parse_args_is_separate_from_main():
    subtitles = _load_module("scripts/audio/subtitles.py", "varnam_audio_subtitles")

    args = subtitles.parse_args(["--text-file", "source.txt", "--words", "words.json", "--output", "subs.srt"])

    assert args.text_file == "source.txt"
    assert args.words == "words.json"
    assert args.output == "subs.srt"


def test_source_closed_parse_args_is_separate_from_main():
    source_closed = _load_module("scripts/audio/source_closed.py", "varnam_audio_source_closed")

    args = source_closed.parse_args(["verify", "audio/voiceover.source.txt"])

    assert args.cmd == "verify"
    assert args.path == "audio/voiceover.source.txt"


def test_sound_design_parse_args_is_separate_from_main():
    sound_design = _load_module("scripts/audio/sound_design.py", "varnam_audio_sound_design")

    args = sound_design.parse_args(["mix", "--manifest", "mix.json", "--project-dir", "projects/demo"])

    assert args.command == "mix"
    assert args.manifest == "mix.json"
    assert args.project_dir == "projects/demo"


def test_voiceover_parse_args_is_separate_from_main():
    voiceover = _load_module("scripts/audio/voiceover.py", "varnam_audio_voiceover")

    args = voiceover.parse_args(["--text", "hello", "--output", "voice.mp3"])

    assert args.text == "hello"
    assert args.output == "voice.mp3"
    assert args.provider == "elevenlabs"
    assert args.align_engine == "elevenlabs"
    assert args.align_model == "gemini-2.5-flash-lite"
    assert not args.allow_audio_only
    assert not args.debug_gemini_alignment
    assert not args.accept_non_native_alignment


def test_voiceover_gemini_provider_defaults_to_auto_alignment():
    voiceover = _load_module("scripts/audio/voiceover.py", "varnam_audio_voiceover_gemini_align")

    args = voiceover.parse_args(["--provider", "gemini", "--text", "hello", "--output", "voice.mp3"])

    assert args.align_engine == "auto"
    assert not args.align_engine_explicit


def test_voiceover_explicit_alignment_survives_provider_defaulting():
    voiceover = _load_module("scripts/audio/voiceover.py", "varnam_audio_voiceover_explicit_align")

    args = voiceover.parse_args(
        ["--provider", "gemini", "--align-engine", "qwen3", "--text", "hello", "--output", "voice.mp3"]
    )

    assert args.align_engine == "qwen3"
    assert args.align_engine_explicit


def test_voiceover_runtime_error_uses_provider_fallback_with_provider_alignment(monkeypatch):
    voiceover = _load_module("scripts/audio/voiceover.py", "varnam_audio_voiceover_runtime_fallback")
    calls = []

    def fake_run_provider(args, text):
        calls.append((args.provider, args.align_engine))
        if args.provider == "elevenlabs":
            raise RuntimeError("timestamp endpoint failed")
        return {"status": "ok", "provider": args.provider, "alignment_engine": args.align_engine}

    monkeypatch.setattr(voiceover, "_run_provider", fake_run_provider)
    args = voiceover.parse_args(
        ["--provider", "elevenlabs", "--fallback", "gemini", "--text", "hello", "--output", "voice.mp3"]
    )

    result = voiceover._run_with_fallback(args, "hello")

    assert result["provider"] == "gemini"
    assert result["alignment_engine"] == "auto"
    assert calls == [("elevenlabs", "elevenlabs"), ("gemini", "auto")]


def test_voiceover_rejects_non_native_elevenlabs_alignment_by_default():
    voiceover = _load_module("scripts/audio/voiceover.py", "varnam_audio_voiceover_gate")
    args = argparse.Namespace(provider="elevenlabs", accept_non_native_alignment=False)

    with pytest.raises(RuntimeError, match="native provider timestamps"):
        voiceover._validate_production_alignment(args, {"alignment_source": "qwen3"})
