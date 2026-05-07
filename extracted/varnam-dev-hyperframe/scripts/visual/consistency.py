#!/usr/bin/env python3
# ---
# varnam_script: visual.consistency
# owner: visual
# status: live
# surface: direct-only
# purpose: Reference consistency pass for generated assets.
# use_when: Preserve character, prop, and location continuity.
# inputs: CLI args, manifests, env vars, or imports documented by argparse/docstring
# outputs: files, JSON/stdout reports, or process exit code documented by the script
# authority: scripts/README.md; scripts/SCRIPT_MAP.md
# ---
"""
Character/prop/location consistency via reference images.

The trick: generate isolated ref images once, pass them to every beat
where that character/prop appears. Gemini uses the refs to keep faces,
costumes, and props visually stable across the whole video.

Commands:
  python3 scripts/visual/consistency.py render-refs <project_dir>
  python3 scripts/visual/consistency.py render-glimpses <project_dir>
  python3 scripts/visual/consistency.py preflight <project_dir>
"""
from __future__ import annotations

import argparse
import json
import re
import subprocess
import sys
from collections import defaultdict
from concurrent.futures import ThreadPoolExecutor, as_completed
from pathlib import Path

REPO_ROOT = Path(__file__).resolve().parents[2]
IMAGE_TOOL = REPO_ROOT / "scripts" / "visual" / "image.py"

STYLE_LOCK_SECTION_HINTS = (
    "Style Lock",
    "Visual Direction",
    "Visual System",
    "Visual Spine",
    "Visual Ground",
    "Visual Language",
)
BEAT_GLIMPSE_SECTION_HINTS = ("Beat Glimpses", "Beat Glimpses Table", "Glimpses")


def _normalize_section_key(title: str) -> str:
    return title.strip().lower()


def _section_value(sections: dict[str, str], *candidates: str) -> str:
    index = {_normalize_section_key(k): v for k, v in sections.items()}
    for candidate in candidates:
        target = _normalize_section_key(candidate)
        if target in index and index[target].strip():
            return index[target].strip()
        for key, value in index.items():
            if target in key and value.strip():
                return value.strip()
    return ""


# ── Markdown parsing ─────────────────────────────────────────────

def _split_sections(text: str) -> dict[str, str]:
    sections: dict[str, list[str]] = {}
    title: str | None = None
    lines: list[str] = []
    for line in text.splitlines():
        m = re.match(r"^##\s+(.+?)\s*$", line.strip())
        if m:
            if title is not None:
                sections[title] = lines[:]
            title, lines = m.group(1).strip(), []
        elif title is not None:
            lines.append(line.rstrip("\n"))
    if title is not None:
        sections[title] = lines
    return {k: "\n".join(v).strip() for k, v in sections.items()}


def _board_dir(project_dir: Path) -> Path:
    return project_dir / "direction" / "board"


def _board_paths(project_dir: Path) -> list[Path]:
    board_dir = _board_dir(project_dir)
    if not board_dir.exists():
        return []
    index_path = board_dir / "index.md"
    files = sorted([p for p in board_dir.glob("*.md") if p.is_file() and p.name != "index.md"])
    if index_path.exists():
        files.insert(0, index_path)
    return files


def _parse_table(text: str) -> list[dict[str, str]]:
    rows = [l.strip() for l in text.splitlines() if l.strip().startswith("|")]
    if len(rows) < 3:
        return []
    header = [c.strip() for c in rows[0].strip("|").split("|")]
    # skip separator row
    out = []
    for row in rows[2:]:
        cells = [c.strip() for c in row.strip("|").split("|")]
        cells += [""] * max(0, len(header) - len(cells))
        out.append({header[i]: cells[i] for i in range(len(header))})
    return out


def _collect_reference_rows_from_sections(sections: dict[str, str]) -> list[dict[str, str]]:
    rows: list[dict[str, str]] = []
    for title, body in sections.items():
        if "ref" not in _normalize_section_key(title):
            continue
        rows.extend(_parse_table(body))
    return rows


def _cell(row: dict, *keys: str) -> str:
    for k in keys:
        if k in row and row[k].strip():
            return row[k].strip()
    return ""


def _ref_path(raw: str) -> str:
    v = raw.strip().strip("`")
    if not v:
        return ""
    return v if "/" in v else f"images/refs/{v}"


def _parse_beats(raw: str) -> list[int]:
    beats: set[int] = set()
    for tok in re.split(r"[,\s]+", (raw or "").strip()):
        if re.match(r"^\d+-\d+$", tok):
            a, b = map(int, tok.split("-"))
            beats.update(range(min(a, b), max(a, b) + 1))
        elif tok.isdigit():
            beats.add(int(tok))
    return sorted(beats)


# ── Direction loader (board canvas) ─────────────────────────────

def _infer_ref_type(ref_path: str, name: str = "") -> str:
    fname = Path(ref_path).name.lower()
    lname = name.lower()
    if fname.startswith("char-"):
        return "character"
    if fname.startswith("loc-"):
        return "location"
    if fname.startswith("prop-"):
        return "prop"
    if "location" in lname or "district" in lname or "city" in lname:
        return "location"
    return "character"


def _build_refs_from_rows(rows: list[dict[str, str]]) -> list[dict]:
    refs: list[dict] = []
    for row in rows:
        ref = _ref_path(_cell(row, "Ref Filename", "Reference", "Filename", "Image", "Image Filename"))
        if not ref:
            continue
        name = _cell(
            row,
            "Name",
            "Character",
            "Location",
            "Canonical Name",
            "Subject",
            "Reference Name",
        )
        refs.append({
            "type": _infer_ref_type(ref, name),
            "name": name or Path(ref).stem,
            "ref": ref,
            "desc": _cell(row, "Visual Description", "Description", "Prompt Seed", "Prompt"),
            "beats": _parse_beats(_cell(row, "Beats", "Beat List", "Beat", "Beat Range")),
            "notes": _cell(row, "Notes", "Phase Notes", "Phase", "Intent"),
        })
    return refs


def _extract_inline_reference_rows(text: str) -> list[dict[str, str]]:
    rows: list[dict[str, str]] = []
    image_link_re = re.compile(r"!\[(?P<name>[^\]]*)\]\((?P<path>[^)\s]+)(?:\s+\"[^\"]*\")?\)")
    for match in image_link_re.finditer(text):
        ref = _ref_path(match.group("path").strip())
        if not ref:
            continue
        rows.append({
            "Name": match.group("name").strip() or Path(ref).stem,
            "Ref Filename": ref,
            "Visual Description": "",
            "Beats": "",
            "Notes": "",
        })
    return rows


def _load_board_guide(project_dir: Path) -> dict:
    board_paths = _board_paths(project_dir)
    if not board_paths:
        return {"exists": False, "refs": [], "style_lock": "", "errors": ["direction/board/index.md not found"]}

    refs: list[dict] = []
    style_lock = ""
    for path in board_paths:
        sections = _split_sections(path.read_text())
        if path.name == "index.md":
            style_lock = _section_value(sections, *STYLE_LOCK_SECTION_HINTS)
        rows = _collect_reference_rows_from_sections(sections)
        if not rows:
            rows = _extract_inline_reference_rows(path.read_text())
        refs.extend(_build_refs_from_rows(rows))

    errors = []
    if not refs:
        errors.append(
            "No reference rows found in direction/board/index.md or direction/board/<scene-id>.md"
        )
    return {"exists": True, "refs": refs, "style_lock": style_lock, "errors": errors}


def _load_glimpses_from_text(project_dir: Path) -> tuple[list[dict[str, str]], str, list[str], str]:
    style_lock = ""
    rows: list[dict[str, str]] = []
    source_paths = _board_paths(project_dir)
    source = "board"

    for path in source_paths:
        if not path.exists():
            continue
        sections = _split_sections(path.read_text())
        if path.name == "index.md":
            style_lock = _section_value(sections, *STYLE_LOCK_SECTION_HINTS)
        for title, body in sections.items():
            key = _normalize_section_key(title)
            if key in ("",):
                continue
            for hint in BEAT_GLIMPSE_SECTION_HINTS:
                if _normalize_section_key(hint) in key:
                    rows.extend(_parse_table(body))
                    break

    errors: list[str] = []
    if not rows:
        errors.append("Beat Glimpses table missing or empty in direction/board files")
    return rows, style_lock, errors, source


def _assemble_guide_payload(refs: list[dict], style_lock: str, errors: list[str]) -> dict:
    continuity: dict[int, set[str]] = defaultdict(set)
    for r in refs:
        beats = r.get("beats", [])
        ref = r.get("ref")
        if not isinstance(ref, str):
            continue
        for beat in beats:
            if isinstance(beat, int):
                continuity[beat].add(ref)
    return {"refs": refs, "continuity": dict(continuity), "style_lock": style_lock, "errors": errors}


def load_direction_guide(project_dir: Path) -> dict:
    board_result = _load_board_guide(project_dir)
    return _assemble_guide_payload(
        board_result["refs"],
        board_result["style_lock"],
        board_result["errors"] or ([] if board_result["exists"] else ["direction/board/index.md not found"]),
    )


# ── Ref rendering ───────────────────────────────────────────────

def _ref_prompt(style_lock: str, ref: dict) -> str:
    subject = ref["name"]
    if ref["desc"] and not ref["desc"].startswith(ref["name"]):
        subject = f"{ref['name']}: {ref['desc']}"

    templates = {
        "character": f"Clean character reference sheet for {subject}. Single isolated character, plain WHITE backdrop, no environment, no setting, no background elements, even soft lighting, centered framing, no text, no collage, no extra people.",
        "prop": f"Clean prop reference sheet for {subject}. Single isolated object, neutral plain backdrop, even lighting, front-three-quarter framing, no hands, no people, no text.",
        "location": f"Clear location reference for {subject}. Establishing view, readable architecture, stable documentary framing, no dramatic action, no text overlays.",
        "motif": f"Clean motif reference for {subject}. Isolate on neutral backdrop if physical object; otherwise minimum environment to make it legible. No text overlays.",
    }
    spec = templates.get(ref["type"], templates["motif"])
    # Character refs must NOT use the style lock — they need a clean, isolated
    # render. Style lock adds palette/lighting/texture that pollutes the
    # background, causing Gemini to treat it as a setting ref downstream.
    if ref["type"] == "character":
        return spec
    return f"{style_lock} {spec}".strip()


def _run_image_jobs(jobs: list[dict], label: str) -> tuple[int, list[str]]:
    generated = 0
    errors: list[str] = []
    print(f"Rendering {len(jobs)} {label}...", file=sys.stderr)

    def _run(job: dict) -> dict:
        return {
            "job": job,
            "proc": subprocess.run(job["cmd"], capture_output=True, text=True),
        }

    with ThreadPoolExecutor(max_workers=min(len(jobs), 4)) as pool:
        for future in as_completed(pool.submit(_run, job) for job in jobs):
            result = future.result()
            job = result["job"]
            out = job["out"]
            proc = result["proc"]
            if proc.returncode == 0 and out.exists():
                generated += 1
                print(f"  ok {out.name}", file=sys.stderr)
                continue

            retry = subprocess.run(job["cmd"], capture_output=True, text=True)
            if retry.returncode == 0 and out.exists():
                generated += 1
            else:
                errors.append(f"Failed: {out.name}")

    return generated, errors


def render_refs(project_dir: Path) -> dict:
    guide = load_direction_guide(project_dir)

    if guide["errors"]:
        return {"ok": False, "errors": guide["errors"], "generated": 0}

    (project_dir / "images" / "refs").mkdir(parents=True, exist_ok=True)

    jobs = []
    skipped = 0
    for ref in guide["refs"]:
        out = project_dir / ref["ref"]
        out.parent.mkdir(parents=True, exist_ok=True)
        if out.exists():
            skipped += 1
            continue
        ar = "16:9" if ref["type"] == "location" else "1:1"
        jobs.append({"ref": ref, "out": out, "cmd": [
            sys.executable, str(IMAGE_TOOL), "--prompt", _ref_prompt(guide["style_lock"], ref),
            "--size", "2K", "--aspect-ratio", ar, "--output", str(out),
        ]})

    if not jobs:
        return {"ok": True, "generated": 0, "skipped": skipped, "errors": []}

    generated, errors = _run_image_jobs(jobs, "refs")
    return {"ok": not errors, "generated": generated, "skipped": skipped, "errors": errors}


# ── Glimpse rendering ────────────────────────────────────────────

def _glimpse_prompt(style_lock: str, desc: str) -> str:
    """Glimpses ARE scene previews — they use the style lock."""
    return f"{style_lock} {desc.strip()}".strip()


def render_glimpses(project_dir: Path) -> dict:
    """Render beat glimpses from the Beat Glimpses table."""
    board_rows, style_lock, glimpse_errors, _glimpse_source = _load_glimpses_from_text(project_dir)
    if glimpse_errors:
        return {"ok": False, "errors": glimpse_errors, "generated": 0}
    rows = board_rows
    if not rows:
        return {"ok": False, "errors": ["Beat Glimpses table missing or empty in direction/board files"], "generated": 0}
    if not style_lock:
        return {"ok": False, "errors": ["Style Lock section missing or empty in direction/board/index.md"], "generated": 0}

    glimpse_dir = project_dir / "images" / "glimpses"
    glimpse_dir.mkdir(parents=True, exist_ok=True)

    jobs = []
    skipped = 0
    for row in rows:
        desc = _cell(row, "Glimpse Description", "Description")
        filename = _cell(row, "Filename")
        refs_raw = _cell(row, "Refs", "References")
        if not desc or not filename:
            continue

        out = glimpse_dir / filename
        if out.exists():
            skipped += 1
            continue

        cmd = [
            sys.executable, str(IMAGE_TOOL),
            "--prompt", _glimpse_prompt(style_lock, desc),
            "--size", "2K", "--aspect-ratio", "16:9",
            "--output", str(out),
        ]
        # Wire in ref images if specified
        if refs_raw:
            for ref_name in [r.strip().strip("`") for r in refs_raw.split(",")]:
                if not ref_name:
                    continue
                ref_path = project_dir / "images" / "refs" / ref_name
                if ref_path.exists():
                    cmd.extend(["--reference-image", str(ref_path)])

        jobs.append({"out": out, "cmd": cmd})

    if not jobs:
        return {"ok": True, "generated": 0, "skipped": skipped, "errors": []}

    generated, errors = _run_image_jobs(jobs, "glimpses")
    return {"ok": not errors, "generated": generated, "skipped": skipped, "errors": errors}


# ── Preflight ───────────────────────────────────────────────────

def preflight(project_dir: Path) -> dict:
    """Validate that all reference_images in timeline.json exist on disk."""
    errors = []

    timeline_path = project_dir / "timeline.json"
    if not timeline_path.exists():
        return {"ok": False, "errors": ["timeline.json not found"]}

    data = json.loads(timeline_path.read_text())
    entries = data if isinstance(data, list) else data.get("entries", [])

    for entry in entries:
        eid = entry.get("id")
        refs = entry.get("reference_images", []) or []
        if isinstance(refs, str):
            refs = [refs]
        if entry.get("reference_image"):
            refs = list(refs) + [entry["reference_image"]]

        for ref in refs:
            ref_path = project_dir / ref
            if not ref_path.exists():
                errors.append(f"Entry {eid}: reference image missing on disk: {ref}")

    return {"ok": not errors, "errors": errors}


# ── CLI ─────────────────────────────────────────────────────────

def parse_args(argv: list[str] | None = None) -> argparse.Namespace:
    parser = argparse.ArgumentParser(description="Visual consistency helpers")
    sub = parser.add_subparsers(dest="cmd", required=True)
    sub.add_parser("render-refs").add_argument("project")
    sub.add_parser("render-glimpses").add_argument("project")
    sub.add_parser("preflight").add_argument("project")
    return parser.parse_args(argv)


def main(argv: list[str] | None = None) -> int:
    args = parse_args(argv)

    project = Path(args.project)
    dispatch = {
        "render-refs": render_refs,
        "render-glimpses": render_glimpses,
        "preflight": preflight,
    }
    if args.cmd in ("render-refs", "render-glimpses"):
        print(f"WARNING: {args.cmd} is deprecated. The filmmaker generates refs directly.", file=sys.stderr)

    report = dispatch[args.cmd](project)

    status = "OK" if report["ok"] else "FAIL"
    print(f"\n{args.cmd.upper()} [{status}]", file=sys.stderr)
    for e in report.get("errors", []):
        print(f"  x {e}", file=sys.stderr)
    for w in report.get("warnings", []):
        print(f"  ! {w}", file=sys.stderr)
    print(json.dumps(report, indent=2, default=str))
    return 0 if report["ok"] else 1


if __name__ == "__main__":
    raise SystemExit(main())
