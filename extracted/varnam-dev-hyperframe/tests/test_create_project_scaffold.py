"""Smoke tests for the project scaffold script."""

from __future__ import annotations

import subprocess
from pathlib import Path


REPO_ROOT = Path(__file__).resolve().parents[1]
SCRIPT = REPO_ROOT / "scripts" / "project" / "scaffold.sh"


def test_scaffold_creates_project_workspace(tmp_path: Path) -> None:
    repo_root = tmp_path / "repo"
    (repo_root / "projects").mkdir(parents=True)
    intake = tmp_path / "intake.sh"
    intake.write_text(
        """SLUG="Test Project"
CHANNEL="nightshift"
TITLE_DIRECTION="A locked title"
CORE_MESSAGE="A clear thesis."
WHY_NOW="Because timing matters."
ANTI_GOALS="
- not vague
- not soft
"
TARGET_VIEWER="curious adult"
PLATFORM="YouTube"
RUNTIME="300-360s"
DESIRED_OUTCOME="viewer retains the thesis"
FORMAT="story"
FORMAT_WHY="The argument wants a narrative spine."
HOOK_CONTRACT="Cold open with one strange fact."
MOVEMENT_CONTRACT="Each chapter escalates the claim."
ENDING_CONTRACT="Verdict lands on a hard line."
NARRATION_STANCE="confident"
VISUAL_PROOF_MODES="
- real media
- data cards
"
SOUND_STANCE="restrained score"
NO_GO_MOVES="
- no filler b-roll
"
KEY_SUBJECTS="
- subject one
- subject two
"
EXACT_FACTS="
- 1947
"
MEDIA_EVIDENCE_OBLIGATIONS="
- at least one archival source
"
RESEARCH_REQUIREMENTS="
- verify date chain
"
CONTEXT_SUMMARY="Scaffold summary."
CURRENT_TASK="Lock the intake."
NEXT_TASK="Start the script pass."
""",
        encoding="utf-8",
    )

    proc = subprocess.run(
        ["bash", str(SCRIPT), "--repo-root", str(repo_root), "--from", str(intake)],
        text=True,
        capture_output=True,
        check=False,
    )
    assert proc.returncode == 0, proc.stderr

    project_dir = repo_root / "projects" / "test-project"
    assert project_dir.exists()
    assert (project_dir / "task-config.md").read_text(encoding="utf-8").find("**Channel:** nightshift") != -1
    assert (project_dir / "tasks.md").read_text(encoding="utf-8").find("Start the script pass.") != -1
    assert (project_dir / "story" / ".gitkeep").exists()
    assert (project_dir / "images" / "refs" / ".gitkeep").exists()
