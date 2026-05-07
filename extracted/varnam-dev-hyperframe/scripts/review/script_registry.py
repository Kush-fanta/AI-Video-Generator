#!/usr/bin/env python3
# ---
# varnam_script: review.script_registry
# owner: reviewer
# status: live
# surface: direct-only
# purpose: Script registry, metadata, and router consistency checker.
# use_when: Verify script headers, map entries, README rows, and run.py routes stay aligned.
# inputs: Repo-local scripts tree, scripts/run.py, scripts/README.md, scripts/SCRIPT_MAP.md
# outputs: Process exit code plus human-readable consistency findings
# authority: scripts/README.md; scripts/SCRIPT_MAP.md
# ---
"""Check script governance metadata and map/router consistency."""

from __future__ import annotations

import ast
import re
import sys
from pathlib import Path

REPO_ROOT = Path(__file__).resolve().parents[2]
SCRIPTS_DIR = REPO_ROOT / "scripts"
RUN_PATH = SCRIPTS_DIR / "run.py"
README_PATH = SCRIPTS_DIR / "README.md"
MAP_PATH = SCRIPTS_DIR / "SCRIPT_MAP.md"
SETTINGS_PATH = REPO_ROOT / ".claude" / "settings.json"
AGENTS_DIR = REPO_ROOT / ".claude" / "agents"
VARNAM_SKILL_DIR = REPO_ROOT / ".claude" / "skills" / "varnam"
SCRIPT_SUFFIXES = {".py", ".sh"}
REQUIRED_META = {
    "varnam_script",
    "owner",
    "status",
    "surface",
    "purpose",
    "use_when",
    "inputs",
    "outputs",
    "authority",
}
AGENT_REQUIRED_PATHS = {
    "editor.md": (
        "docs/doctrine.md",
        ".claude/skills/varnam/orchestration.md",
        "CLAUDE.md",
    ),
    "mograph.md": (
        ".claude/skills/varnam/craft/hyperframes.md",
        ".claude/skills/varnam/hyperframes/SKILL.md",
        "scripts/run.py",
        "scripts/visual/screenshot.py",
        "scripts/visual/analyze_media.py",
        "docs/contracts/timing-contract.md",
    ),
    "maps.md": (
        ".claude/skills/varnam/tools/maps.md",
        "templates/geo",
        "templates/geo/map-source-manifest.json",
        "templates/geo/MAP_DATA_SOURCES.md",
        "templates/geo/geoUtils.ts",
        "templates/geo/india-paths.ts",
        ".claude/skills/varnam/craft/hyperframes.md",
        "scripts/run.py",
        "docs/contracts/timing-contract.md",
    ),
    "visual.md": (
        ".claude/skills/varnam/tools/media-index.md",
        ".claude/skills/varnam/tools/image-gen.md",
        ".claude/skills/varnam/tools/video-gen.md",
        "scripts/visual/image.py",
        "scripts/visual/video.py",
        "scripts/visual/analyze_media.py",
        "scripts/visual/verify_assets.py",
        "scripts/visual/consistency.py",
    ),
}
AGENT_CONTRACT_FILES = (
    AGENTS_DIR,
    VARNAM_SKILL_DIR / "tools",
    REPO_ROOT / "docs" / "contracts" / "capability-registry.json",
)
DEPRECATED_SKILL_DIRS = {
    VARNAM_SKILL_DIR / "audio": "move API/tool docs to .claude/skills/varnam/tools/",
    VARNAM_SKILL_DIR / "visual": "move API/tool docs to .claude/skills/varnam/tools/",
}
FORBIDDEN_TASTE_SURFACES = {
    REPO_ROOT / "styles": "promote style/taste formulas into channels/<name>/design.md or generalize them into craft",
    REPO_ROOT / "research" / "nightshift_visual_analysis.md": "promote channel taste study into channels/nightshift/design.md",
}
STALE_CONTRACT_PATTERNS = {
    "projects/<slug>/assets": "use project media roots images/, video/, or research/media/",
    "projects/foo/assets": "use project media roots images/, video/, or research/media/",
    "scripts/tools/image-gen": "use scripts/visual/image.py or scripts/run.py visual:image",
    "ns-map-projection": "use templates/geo shared data and generators",
    "NsMap": "use existing templates/geo, swarajya-kit map templates, or hero/map-title",
    ".claude/skills/varnam/audio/": "tool/API docs live in .claude/skills/varnam/tools/",
    ".claude/skills/varnam/visual/": "tool/API docs live in .claude/skills/varnam/tools/",
}


def script_files() -> list[Path]:
    return sorted(
        path
        for path in SCRIPTS_DIR.rglob("*")
        if path.is_file()
        and path.suffix in SCRIPT_SUFFIXES
        and "__pycache__" not in path.parts
    )


def rel(path: Path) -> str:
    return path.relative_to(REPO_ROOT).as_posix()


def read(path: Path) -> str:
    return path.read_text(encoding="utf-8")


def parse_metadata(path: Path) -> dict[str, str]:
    metadata: dict[str, str] = {}
    for raw_line in read(path).splitlines()[:32]:
        line = raw_line.strip()
        if line.startswith("#"):
            line = line[1:].strip()
        if not line or line == "---" or ":" not in line:
            continue
        key, value = line.split(":", 1)
        if key in REQUIRED_META:
            metadata[key] = value.strip()
    return metadata


def parse_run_commands() -> dict[str, str]:
    tree = ast.parse(read(RUN_PATH))
    commands: dict[str, str] = {}
    for node in tree.body:
        if not isinstance(node, ast.AnnAssign):
            continue
        if not isinstance(node.target, ast.Name) or node.target.id != "COMMANDS":
            continue
        if not isinstance(node.value, ast.Dict):
            continue
        for key_node, value_node in zip(node.value.keys, node.value.values):
            if not isinstance(key_node, ast.Constant) or not isinstance(key_node.value, str):
                continue
            path = _extract_command_path(value_node)
            if path:
                commands[key_node.value] = path
    return commands


def _extract_command_path(node: ast.AST) -> str | None:
    if not isinstance(node, ast.List):
        return None
    for item in node.elts:
        text = _path_expr_to_string(item)
        if text and text.startswith("scripts/"):
            return text
    return None


def _path_expr_to_string(node: ast.AST) -> str | None:
    if isinstance(node, ast.Call) and isinstance(node.func, ast.Name) and node.func.id == "str" and node.args:
        return _path_expr_to_string(node.args[0])
    if isinstance(node, ast.BinOp) and isinstance(node.op, ast.Div):
        left = _path_expr_to_string(node.left)
        right = _path_expr_to_string(node.right)
        if left and right:
            return f"{left}/{right}"
    if isinstance(node, ast.Name):
        names = {
            "SCRIPTS_DIR": "scripts",
            "PROJECT_DIR": "scripts/project",
            "REVIEW_DIR": "scripts/review",
            "VISUAL_DIR": "scripts/visual",
        }
        return names.get(node.id)
    if isinstance(node, ast.Constant) and isinstance(node.value, str):
        return node.value
    return None


def map_current_paths() -> set[str]:
    text = read(MAP_PATH)
    paths = set(re.findall(r"`(scripts/[^`]+?\.(?:py|sh))`", text))
    moved_section = text.split("## Moved Paths", 1)[1] if "## Moved Paths" in text else ""
    old_paths = set()
    for line in moved_section.splitlines():
        matches = re.findall(r"`(scripts/[^`]+?\.(?:py|sh))`", line)
        if len(matches) >= 2:
            old_paths.add(matches[0])
    return paths - old_paths


def map_statuses() -> dict[str, str]:
    statuses: dict[str, str] = {}
    for line in read(MAP_PATH).splitlines():
        match = re.match(
            r"\|\s*`(scripts/[^`]+?\.(?:py|sh))`\s*\|\s*(live|deferred|internal)\s*\|",
            line,
        )
        if match:
            statuses[match.group(1)] = match.group(2)
    return statuses


def readme_entries() -> set[str]:
    return set(re.findall(r"`([^`]+?\.(?:py|sh|md))`", read(README_PATH)))


def contract_files() -> list[Path]:
    files: list[Path] = []
    for root in AGENT_CONTRACT_FILES:
        if root.is_file():
            files.append(root)
        elif root.is_dir():
            files.extend(path for path in root.rglob("*") if path.is_file() and path.suffix == ".md")
    return sorted(files)


def validate_agent_contracts() -> list[str]:
    failures: list[str] = []
    for agent_name, required_paths in AGENT_REQUIRED_PATHS.items():
        agent_path = AGENTS_DIR / agent_name
        if not agent_path.exists():
            failures.append(f".claude/agents/{agent_name}: missing agent spec")
            continue
        text = read(agent_path)
        for relative in required_paths:
            if relative not in text:
                failures.append(f"{rel(agent_path)}: missing wired surface reference {relative}")
            if not (REPO_ROOT / relative).exists():
                failures.append(f"{rel(agent_path)}: referenced path does not exist: {relative}")

    for path in contract_files():
        text = read(path)
        for pattern, replacement in STALE_CONTRACT_PATTERNS.items():
            if pattern in text:
                failures.append(f"{rel(path)}: stale contract reference {pattern!r}; {replacement}")
    return failures


def validate_skill_and_taste_boundaries() -> list[str]:
    failures: list[str] = []
    for path, fix in DEPRECATED_SKILL_DIRS.items():
        if path.exists():
            failures.append(f"{rel(path)}: deprecated skill/tool split; {fix}")
    for path, fix in FORBIDDEN_TASTE_SURFACES.items():
        if path.exists():
            failures.append(f"{rel(path)}: taste surface outside channels/; {fix}")
    return failures


def hook_references() -> set[str]:
    references: set[str] = set()
    if SETTINGS_PATH.exists():
        settings_text = read(SETTINGS_PATH)
        references.update(re.findall(r"scripts/hooks/[^`\"'\s]+?\.(?:py|sh)", settings_text))

    for path in (SCRIPTS_DIR / "hooks").glob("*"):
        if path.is_file() and path.suffix in SCRIPT_SUFFIXES:
            text = read(path)
            explicit_references = set(re.findall(r"scripts/hooks/[^`\"'\s]+?\.(?:py|sh)", text))
            explicit_references.discard(rel(path))
            references.update(explicit_references)
            for candidate in (SCRIPTS_DIR / "hooks").glob("*"):
                if candidate != path and candidate.is_file() and candidate.name in text:
                    references.add(rel(candidate))
    return references


def is_registered_in_readme(path: Path, entries: set[str]) -> bool:
    relative = rel(path)
    without_scripts = path.relative_to(SCRIPTS_DIR).as_posix()
    basename = path.name
    for entry in entries:
        if entry in {relative, without_scripts, basename}:
            return True
        if entry.endswith(f"/{basename}"):
            return True
    return False


def main() -> int:
    failures: list[str] = []
    script_map = read(MAP_PATH)
    current_map_paths = map_current_paths()
    current_map_statuses = map_statuses()
    registry_entries = readme_entries()
    known_hook_references = hook_references()
    files = script_files()

    for path in files:
        relative = rel(path)
        metadata = parse_metadata(path)
        missing = sorted(REQUIRED_META - set(metadata))
        if missing:
            failures.append(f"{relative}: missing metadata fields: {', '.join(missing)}")
        if metadata.get("status") not in {"live", "deferred", "internal"}:
            failures.append(f"{relative}: invalid status {metadata.get('status')!r}")
        if relative not in current_map_paths:
            failures.append(f"{relative}: missing from scripts/SCRIPT_MAP.md current-path sections")
        mapped_status = current_map_statuses.get(relative)
        if mapped_status and metadata.get("status") != mapped_status:
            failures.append(
                f"{relative}: metadata status {metadata.get('status')!r} does not match "
                f"scripts/SCRIPT_MAP.md status {mapped_status!r}"
            )
        if "scripts/hooks" in relative:
            if metadata.get("surface") != "hook-only":
                failures.append(f"{relative}: scripts/hooks files must declare surface 'hook-only'")
            if relative not in known_hook_references:
                failures.append(
                    f"{relative}: hook script is not configured in .claude/settings.json "
                    "or referenced by another hook script"
                )
        if not is_registered_in_readme(path, registry_entries):
            failures.append(f"{relative}: missing from scripts/README.md registry")

    commands = parse_run_commands()
    for command, path in commands.items():
        target = REPO_ROOT / path
        if not target.exists():
            failures.append(f"scripts/run.py command {command}: target does not exist: {path}")
        if command not in script_map:
            failures.append(f"scripts/run.py command {command}: missing from scripts/SCRIPT_MAP.md")
        metadata = parse_metadata(target) if target.exists() else {}
        surface = metadata.get("surface", "")
        if "scripts/run.py" not in surface:
            failures.append(f"{path}: routed by scripts/run.py but metadata surface is {surface!r}")

    for mapped_path in sorted(current_map_paths):
        if not (REPO_ROOT / mapped_path).exists():
            failures.append(f"scripts/SCRIPT_MAP.md references missing current path: {mapped_path}")

    failures.extend(validate_agent_contracts())
    failures.extend(validate_skill_and_taste_boundaries())

    if failures:
        for failure in failures:
            print(f"FAIL: {failure}", file=sys.stderr)
        return 1

    print(f"ok: {len(files)} scripts, {len(commands)} routed commands")
    return 0


if __name__ == "__main__":
    raise SystemExit(main())
