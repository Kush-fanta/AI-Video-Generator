"""Tests for the local artifact reverse-engineering report."""

from __future__ import annotations

import importlib.util
import json
import sys
import zipfile
from pathlib import Path


SCRIPT_PATH = Path(__file__).resolve().parents[1] / "scripts/review/artifact_report.py"
SPEC = importlib.util.spec_from_file_location("artifact_report", SCRIPT_PATH)
artifact_report = importlib.util.module_from_spec(SPEC)
assert SPEC.loader is not None
sys.modules[SPEC.name] = artifact_report
SPEC.loader.exec_module(artifact_report)


def test_html_report_detects_bundled_template_and_media_refs(tmp_path: Path) -> None:
    html_path = tmp_path / "index.html"
    html_path.write_text(
        """
        <html>
          <script type="__bundler/template">{}</script>
          <img src="uploads/frame.png" />
        </html>
        """,
        encoding="utf-8",
    )

    report = artifact_report.build_report(html_path)

    assert report["ok"] is True
    assert report["source_type"] == "html"
    assert "bundled_html" in report["framework_signals"]
    assert "uploads/frame.png" in report["media_refs"]


def test_jsx_report_detects_timing_randomness_and_runtime_warnings(tmp_path: Path) -> None:
    jsx_path = tmp_path / "video.jsx"
    jsx_path.write_text(
        """
        const BEATS = [{ t: 0.0, d: 5.0, scene: 'open' }];
        const TOTAL = 5;
        function Scene() {
          const time = useTime();
          return Math.random() > 0.5 ? time : 0;
        }
        """,
        encoding="utf-8",
    )

    report = artifact_report.build_report(jsx_path)

    assert report["entrypoints"] == ["video.jsx"]
    assert "beat_timeline" in report["timing_signals"]
    assert any("unseeded randomness" in warning for warning in report["warnings"])
    assert any("script-controlled timeline" in warning for warning in report["warnings"])


def test_zip_report_detects_entrypoints_and_promotion_candidates(tmp_path: Path) -> None:
    archive_path = tmp_path / "artifact.zip"
    with zipfile.ZipFile(archive_path, "w") as archive:
        archive.writestr("index.html", '<div data-composition-id="root" data-start="0"></div>')
        archive.writestr("IMAGE_PROMPTS.md", "Global suffix. Negative prompt. Save files in uploads/img.")

    report = artifact_report.build_report(archive_path)

    assert report["source_type"] == "zip"
    assert sorted(report["entrypoints"]) == ["index.html"]
    assert "hyperframes_reference" in report["framework_signals"]
    assert any(candidate["path"] == "IMAGE_PROMPTS.md" for candidate in report["promotion_candidates"])


def test_unsupported_input_returns_exit_code_2(tmp_path: Path, capsys) -> None:
    unsupported = tmp_path / "artifact.bin"
    unsupported.write_bytes(b"nope")

    code = artifact_report.main([str(unsupported)])

    assert code == 2
    captured = capsys.readouterr()
    payload = json.loads(captured.err)
    assert payload["status"] == "unsupported"


def test_report_option_writes_same_json_shape(tmp_path: Path, capsys) -> None:
    html_path = tmp_path / "index.html"
    report_path = tmp_path / "report.json"
    html_path.write_text("<html><body>palette typography motion</body></html>", encoding="utf-8")

    code = artifact_report.main([str(html_path), "--report", str(report_path)])

    assert code == 0
    stdout_payload = json.loads(capsys.readouterr().out)
    file_payload = json.loads(report_path.read_text(encoding="utf-8"))
    assert stdout_payload["source"] == file_payload["source"]
    assert "design_doctrine" in file_payload["implementation_patterns"]
