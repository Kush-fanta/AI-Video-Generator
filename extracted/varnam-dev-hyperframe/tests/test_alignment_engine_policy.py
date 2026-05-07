import importlib.util
from pathlib import Path

import pytest


def _load_align_module():
    path = Path(__file__).resolve().parents[1] / "scripts" / "audio" / "align_audio.py"
    spec = importlib.util.spec_from_file_location("varnam_audio_align", path)
    module = importlib.util.module_from_spec(spec)
    assert spec.loader is not None
    spec.loader.exec_module(module)
    return module


def test_auto_uses_native_alignment_before_qwen(monkeypatch, tmp_path):
    align = _load_align_module()
    native_words = [
        {"word": "Hello", "start": 0.0, "end": 0.2},
        {"word": "world", "start": 0.3, "end": 0.6},
    ]

    monkeypatch.setattr(align, "get_audio_duration", lambda _path: 0.8)
    monkeypatch.setattr(align, "run_qwen3_align", lambda **_kwargs: pytest.fail("Qwen should not run"))
    monkeypatch.setattr(align, "transcribe_with_gemini", lambda *_args, **_kwargs: pytest.fail("Gemini timestamps should not run"))

    result = align.run_alignment(
        audio_path=tmp_path / "voiceover.mp3",
        text="Hello world",
        output_words=tmp_path / "voiceover.words.json",
        output_srt=None,
        signal_align=False,
        native_alignment_words=native_words,
        engine="auto",
    )

    assert result["words"] == native_words
    assert result["alignment_source"] == "elevenlabs_native"


def test_auto_pairs_gemini_transcript_recovery_with_qwen_timing(monkeypatch, tmp_path):
    align = _load_align_module()
    calls = {}
    qwen_words = [
        {"word": "Recovered", "start": 0.0, "end": 0.4},
        {"word": "text", "start": 0.5, "end": 0.8},
    ]

    monkeypatch.setattr(align, "get_audio_duration", lambda _path: 1.0)
    monkeypatch.setattr(align, "transcribe_text_with_gemini", lambda *_args, **_kwargs: "Recovered text")
    monkeypatch.setattr(align, "transcribe_with_gemini", lambda *_args, **_kwargs: pytest.fail("Gemini timestamp alignment should not run"))

    def fake_qwen(**kwargs):
        calls["text"] = kwargs["text"]
        return qwen_words

    monkeypatch.setattr(align, "run_qwen3_align", fake_qwen)

    result = align.run_alignment(
        audio_path=tmp_path / "voiceover.mp3",
        text="",
        output_words=tmp_path / "voiceover.words.json",
        output_srt=None,
        signal_align=False,
        engine="auto",
    )

    assert calls["text"] == "Recovered text"
    assert result["words"] == qwen_words
    assert result["alignment_source"] == "gemini_transcript_qwen3"


def test_auto_fails_instead_of_gemini_only_timing(monkeypatch, tmp_path):
    align = _load_align_module()

    monkeypatch.setattr(align, "get_audio_duration", lambda _path: 1.0)
    monkeypatch.setattr(align, "transcribe_with_gemini", lambda *_args, **_kwargs: pytest.fail("Gemini timestamp alignment should not run"))
    monkeypatch.setattr(align, "run_qwen3_align", lambda **_kwargs: (_ for _ in ()).throw(RuntimeError("qwen unavailable")))

    with pytest.raises(SystemExit) as exc:
        align.run_alignment(
            audio_path=tmp_path / "voiceover.mp3",
            text="Hello world",
            output_words=tmp_path / "voiceover.words.json",
            output_srt=None,
            signal_align=False,
            engine="auto",
        )

    assert exc.value.code == 1


def test_explicit_gemini_alignment_requires_debug_flag(monkeypatch, tmp_path):
    align = _load_align_module()

    monkeypatch.setattr(align, "get_audio_duration", lambda _path: 1.0)
    monkeypatch.setattr(align, "transcribe_with_gemini", lambda *_args, **_kwargs: pytest.fail("Gemini should be gated"))

    with pytest.raises(RuntimeError, match="debug-only"):
        align.run_alignment(
            audio_path=tmp_path / "voiceover.mp3",
            text="Hello world",
            output_words=tmp_path / "voiceover.words.json",
            output_srt=None,
            signal_align=False,
            engine="gemini",
        )


def test_short_word_duration_repair_handles_qwen_zeroes():
    align = _load_align_module()

    words = align.repair_short_word_durations(
        [
            {"word": "ST", "start": 1.0, "end": 1.0},
            {"word": "Microelectronics", "start": 1.5, "end": 1.5},
        ]
    )

    assert words[0]["end"] > words[0]["start"]
    assert words[1]["end"] > words[1]["start"]
