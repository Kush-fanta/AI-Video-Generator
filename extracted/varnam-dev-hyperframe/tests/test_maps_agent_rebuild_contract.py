"""Contract tests for the maps lane after the 2026-04-29 map QA failures."""

from __future__ import annotations

from pathlib import Path


REPO = Path(__file__).resolve().parents[1]
AGENT = REPO / ".claude" / "agents" / "maps.md"
CLAUDE_MAPS = REPO / ".claude" / "skills" / "varnam" / "tools" / "maps.md"
AGENTS_MAPS = REPO / ".agents" / "skills" / "varnam" / "visual" / "maps.md"


def read(path: Path) -> str:
    return path.read_text(encoding="utf-8")


def test_maps_agent_forbids_proxy_renders_as_exit_evidence() -> None:
    text = read(AGENT)

    required = [
        "Proxy renders are diagnostics only",
        "real HyperFrames composition render",
        "Standalone HTML/SVG/Chrome screenshots do not satisfy Evidence",
        "Status: blocked — real composition preview not Read'd",
    ]
    for phrase in required:
        assert phrase in text


def test_maps_agent_requires_composition_first_for_india_city_overlays() -> None:
    text = read(AGENT)

    required_phrases = [
        "python3 scripts/run.py hyperframes:lint projects/<slug>/hyperframes --json",
        "python3 scripts/run.py hyperframes:compositions projects/<slug>/hyperframes",
        "real HyperFrames composition render",
        "projects/<slug>/hyperframes/compositions/",
        "templates/geo/india-paths.ts",
        "INDIA_OUTLINE",
        "INDIA_VIEWBOX",
        "getMetro(",
        "No copied numeric city coordinates",
        "composition=",
        "variables=",
    ]
    for phrase in required_phrases:
        assert phrase in text

    retired_phrases = [
        "pnpm template -- find map",
        "pnpm template -- show geo/city-markers",
        "pnpm template -- props geo/city-markers",
        "template considered",
        "template=",
    ]
    for phrase in retired_phrases:
        assert phrase not in text


def test_visual_maps_docs_are_current_not_retired_nsmap_or_varnam_templates() -> None:
    paths = [CLAUDE_MAPS]
    if AGENTS_MAPS.exists():
        paths.append(AGENTS_MAPS)

    for path in paths:
        text = read(path)
        assert "templates/geo/india.json" in text
        assert "templates/geo/india-paths.ts" in text
        assert "INDIA_METROS" in text
        assert "getMetro(" in text
        assert "Composition-first map vocabulary" in text
        assert "HyperFrames composition surfaces" in text
        assert "composition variables" in text
        assert "varnam-templates" not in text
        assert "NsMap" not in text
