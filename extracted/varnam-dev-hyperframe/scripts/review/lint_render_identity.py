#!/usr/bin/env python3
# ---
# varnam_script: review.lint_render_identity
# owner: mograph
# status: live
# surface: direct-only
# purpose: Runtime identity lint.
# use_when: Check template font, color, and motion identity drift.
# inputs: CLI args, manifests, env vars, or imports documented by argparse/docstring
# outputs: files, JSON/stdout reports, or process exit code documented by the script
# authority: scripts/README.md; scripts/SCRIPT_MAP.md
# ---
from __future__ import annotations

"""
Lint renderer source files against channel identity.

Checks:
- font family drift
- font-size vocabulary drift
- colors
- spring configs

Typography override markers:
- `// varnam-font-role: hero`
- `// varnam-font-override: preserve original monumental scale`

Run:
  python3 scripts/review/lint_render_identity.py <project_dir>
  python3 scripts/review/lint_render_identity.py <project_dir> --strict
"""
import argparse
import json
import sys
import re
from pathlib import Path

SOFT_WEIGHT = 0.35

def parse_config(config_path: Path) -> dict:
    """Extract identity values from DESIGN.md front matter or legacy yaml blocks."""
    text = config_path.read_text()
    values = {}

    frontmatter = re.match(r"\A---\n(.*?)\n---", text, re.DOTALL)
    if frontmatter:
        yaml_text = frontmatter.group(1)
        for match in re.finditer(r"^\s*([A-Za-z0-9_-]+):\s*[\"']?(#[0-9A-Fa-f]{6})[\"']?\s*$", yaml_text, re.MULTILINE):
            values[match.group(1)] = match.group(2)
        for index, match in enumerate(re.finditer(r"^\s*fontFamily:\s*[\"']?([^\"'\n]+)[\"']?\s*$", yaml_text, re.MULTILINE), start=1):
            values[f"font_{index}"] = match.group(1).strip()
        for match in re.finditer(r"^\s*([A-Za-z0-9_-]+):\s*[\"']?(\d+(?:\.\d+)?px)[\"']?\s*$", yaml_text, re.MULTILINE):
            key, value = match.group(1), match.group(2)
            if key == "fontSize":
                values[f"font_size_{len([k for k in values if k.startswith('font_size_')]) + 1}"] = value
            else:
                values[key] = value
        return values

    # Extract all yaml code blocks
    for block in re.findall(r'```yaml\n(.*?)```', text, re.DOTALL):
        for line in block.strip().split('\n'):
            line = line.strip()
            if ':' in line and not line.startswith('#'):
                key, val = line.split(':', 1)
                key = key.strip()
                val = val.strip()
                # Extract quoted value first (preserves hex colors)
                quoted = re.match(r'^"([^"]*)"', val) or re.match(r"^'([^']*)'", val)
                if quoted:
                    val = quoted.group(1)
                else:
                    # Remove inline comments only AFTER quotes
                    # But preserve hex colors: #XXX is NOT a comment if preceded by a quote or at start
                    val = val.strip()
                if val:
                    values[key] = val
    return values

def load_effective_config(project_dir: Path, channel_name: str) -> dict:
    """Load channel design identity, then apply any project-level yaml overrides if present."""
    repo_root = Path(__file__).resolve().parents[2]
    config_path = repo_root / f'channels/{channel_name}/design.md'
    legacy_config_path = repo_root / f'channels/{channel_name}/config.md'
    if not config_path.exists() and legacy_config_path.exists():
        config_path = legacy_config_path
    if not config_path.exists():
        raise FileNotFoundError(f"Channel identity not found: {config_path}")

    config = parse_config(config_path)
    project_config_path = project_dir / "config.md"
    if project_config_path.exists():
        config.update(parse_config(project_config_path))
    return config

def find_lint_targets(project_dir: Path) -> list[Path]:
    """Find relevant TS/TSX files inside a project."""
    targets: list[Path] = []

    src_dir = project_dir / "src"
    if src_dir.exists():
        root_file = src_dir / "Root.tsx"
        if root_file.exists():
            targets.append(root_file)

    deduped: list[Path] = []
    seen: set[Path] = set()
    for target in targets:
        if target not in seen:
            deduped.append(target)
            seen.add(target)
    return deduped

def _collect_expected_fonts(config: dict) -> list[str]:
    fonts: list[str] = []
    for key, val in config.items():
        if not key.startswith("font_") or key.startswith("font_floor_"):
            continue
        cleaned = str(val).strip().strip('"').strip("'")
        if cleaned:
            fonts.append(cleaned)
    return fonts

def make_finding(
    *,
    kind: str,
    severity: str,
    path: str,
    issue: str,
    line: int | None = None,
    suggestion: str | None = None,
) -> dict:
    return {
        "kind": kind,
        "severity": severity,
        "path": path,
        "line": line,
        "issue": issue,
        "suggestion": suggestion,
    }

def format_finding(finding: dict) -> str:
    location = f"line {finding['line']} " if finding.get("line") is not None else ""
    suffix = f" | suggestion: {finding['suggestion']}" if finding.get("suggestion") else ""
    return f"  {finding['severity'].upper()} {finding['kind'].upper()}: {location}{finding['issue']}{suffix}"

def check_fonts(content: str, config: dict, filepath: str) -> tuple[list[dict], int]:
    findings: list[dict] = []
    expected_fonts = _collect_expected_fonts(config)
    if not expected_fonts:
        return findings, 0

    # Check for wrong fonts
    font_refs = re.findall(r'fontFamily:\s*["\']([^"\']+)["\']', content)
    font_refs += re.findall(r'fontFamily:\s*`([^`]+)`', content)
    observation_count = len(font_refs)

    for font in font_refs:
        if font not in expected_fonts and font not in ['serif', 'sans'] and 'var(' not in font:
            # Check if it's a variable reference (like the loadFont result)
            if not any(ef.lower().replace(' ', '') in font.lower().replace(' ', '') for ef in expected_fonts):
                findings.append(
                    make_finding(
                        kind="font",
                        severity="hard",
                        path=filepath,
                        issue=f"fontFamily '{font}' not in channel identity fonts ({', '.join(expected_fonts)})",
                        suggestion="Use a channel identity font family or add an explicit override reason.",
                    )
                )

    # Check font imports
    if any('DM Sans' in font or 'DMSans' in font for font in expected_fonts):
        observation_count += 1
        if 'DMSans' not in content and 'DM_Sans' not in content and 'DM Sans' not in content:
            findings.append(
                make_finding(
                    kind="font",
                    severity="soft",
                    path=filepath,
                    issue="channel identity specifies DM Sans but no DMSans import was found",
                    suggestion="Import the identity font or remove it from the channel/project identity.",
                )
            )

    return findings, observation_count

def parse_size_spec(raw: str) -> tuple[float, float] | None:
    numbers = [float(value) for value in re.findall(r'\d+(?:\.\d+)?', str(raw))]
    if not numbers:
        return None
    if len(numbers) >= 2 and '-' in str(raw):
        low, high = numbers[0], numbers[1]
        return (min(low, high), max(low, high))
    return (numbers[0], numbers[0])

def build_typography_contract(config: dict) -> dict:
    size_ranges: dict[str, tuple[float, float]] = {}
    for key, val in config.items():
        if not key.endswith("_size"):
            continue
        parsed = parse_size_spec(val)
        if parsed is not None:
            size_ranges[key[:-5]] = parsed

    floor_absolute = None
    if "font_floor_absolute" in config:
        parsed_floor = parse_size_spec(config["font_floor_absolute"])
        if parsed_floor is not None:
            floor_absolute = parsed_floor[0]

    return {
        "size_ranges": size_ranges,
        "font_floor_absolute": floor_absolute,
    }

def _find_font_marker(text: str, marker: str) -> str | None:
    pattern = rf"{marker}\s*:\s*([^\n]+)"
    match = re.search(pattern, text)
    if match:
        return match.group(1).strip()
    return None

def extract_font_size_entries(content: str) -> list[dict]:
    entries: list[dict] = []
    lines = content.splitlines()
    for line_index, line in enumerate(lines):
        if "fontSize" not in line:
            continue
        match = re.search(r'fontSize\s*:\s*([^,}]+)', line)
        if not match:
            continue

        expression = match.group(1).strip()
        values = [float(value) for value in re.findall(r'\d+(?:\.\d+)?', expression) if float(value) >= 8]
        if not values:
            continue

        window_start = max(0, line_index - 2)
        window = "\n".join(lines[window_start : line_index + 1])
        override_reason = _find_font_marker(window, "varnam-font-override")
        role = _find_font_marker(window, "varnam-font-role")

        for value in values:
            entries.append(
                {
                    "line": line_index + 1,
                    "value": value,
                    "expression": expression,
                    "override_reason": override_reason,
                    "role": role,
                }
            )
    return entries

def _size_vocabulary_suggestion(
    value: float,
    size_ranges: dict[str, tuple[float, float]],
    *,
    role: str | None = None,
    floor_absolute: float | None = None,
) -> str:
    if floor_absolute is not None and value < floor_absolute:
        return f"Raise to at least {floor_absolute:g}px or mark an explicit override."
    if role and role in size_ranges:
        low, high = size_ranges[role]
        return f"Keep {role} inside {low:g}-{high:g}px or mark an explicit override."
    if not size_ranges:
        return "Add a size tier to channel identity or mark an explicit override."

    sorted_ranges = sorted(size_ranges.items(), key=lambda item: item[1][0])
    nearest = min(
        sorted_ranges,
        key=lambda item: min(abs(value - item[1][0]), abs(value - item[1][1])),
    )
    nearest_name, (low, high) = nearest
    gap = min(abs(value - low), abs(value - high))
    if gap <= 12:
        return f"Closest configured tier is {nearest_name} ({low:g}-{high:g}px)."
    return f"No configured tier fits {value:g}px. Add a matching tier or mark an explicit override."

def check_font_sizes(content: str, config: dict, filepath: str) -> tuple[list[dict], int]:
    findings: list[dict] = []
    contract = build_typography_contract(config)
    size_ranges = contract["size_ranges"]
    floor_absolute = contract["font_floor_absolute"]

    entries = extract_font_size_entries(content)
    if not size_ranges and floor_absolute is None:
        return findings, len(entries)

    for entry in entries:
        value = entry["value"]
        line = entry["line"]
        role = entry["role"]
        override_reason = entry["override_reason"]

        if override_reason:
            continue

        if floor_absolute is not None and value < floor_absolute:
            findings.append(
                make_finding(
                    kind="type",
                    severity="hard",
                    path=filepath,
                    line=line,
                    issue=f"fontSize={value:g}px is below absolute floor {floor_absolute:g}px",
                    suggestion=_size_vocabulary_suggestion(
                        value,
                        size_ranges,
                        role=role,
                        floor_absolute=floor_absolute,
                    ),
                )
            )
            continue

        if role and role in size_ranges:
            low, high = size_ranges[role]
            if not (low <= value <= high):
                findings.append(
                    make_finding(
                        kind="type",
                        severity="soft",
                        path=filepath,
                        line=line,
                        issue=f"fontSize={value:g}px is outside {role}_size {low:g}-{high:g}px",
                        suggestion=_size_vocabulary_suggestion(
                            value,
                            size_ranges,
                            role=role,
                            floor_absolute=floor_absolute,
                        ),
                    )
                )
            continue

        if size_ranges and not any(low <= value <= high for low, high in size_ranges.values()):
            findings.append(
                make_finding(
                    kind="type",
                    severity="soft",
                    path=filepath,
                    line=line,
                    issue=f"fontSize={value:g}px is outside config size vocabulary",
                    suggestion=_size_vocabulary_suggestion(
                        value,
                        size_ranges,
                        role=role,
                        floor_absolute=floor_absolute,
                    ),
                )
            )

    return findings, len(entries)

def check_colors(content: str, config: dict, filepath: str) -> tuple[list[dict], int]:
    findings: list[dict] = []

    # Collect all channel identity hex colors
    config_colors = {}
    for key, val in config.items():
        hex_match = re.search(r'#[0-9A-Fa-f]{6}', val)
        if hex_match:
            config_colors[key] = hex_match.group().upper()

    # Find all hex colors in the TSX file
    tsx_colors = set()
    for match in re.findall(r'["\']#([0-9A-Fa-f]{6})["\']', content):
        tsx_colors.add(f'#{match.upper()}')

    # Check canvas color specifically
    canvas_color = config_colors.get('canvas', '').upper()
    bg_colors = re.findall(r'backgroundColor:\s*["\']#([0-9A-Fa-f]{6})["\']', content)
    if canvas_color:
        # Look for backgroundColor assignments that aren't the config canvas
        for bg in bg_colors:
            bg_hex = f'#{bg.upper()}'
            dark_canvas = config_colors.get('canvas_dark', '#0D0D0D').upper()
            if bg_hex != canvas_color and bg_hex != dark_canvas and bg_hex != '#FFFFFF' and bg_hex != '#000000':
                findings.append(
                    make_finding(
                        kind="color",
                        severity="soft",
                        path=filepath,
                    issue=f"backgroundColor '{bg_hex}' is not canvas ({canvas_color}) or dark canvas ({dark_canvas})",
                    suggestion="Use a channel identity canvas tone or add the intentional color to channel/project identity.",
                    )
                )

    # Check for colors not in channel identity palette
    all_config_hex = set(v for v in config_colors.values())
    # Also collect raw hex values from the entire identity text
    for key, val in config.items():
        for h in re.findall(r'#[0-9A-Fa-f]{6}', val):
            all_config_hex.add(h.upper())

    for color in tsx_colors:
        if color not in all_config_hex:
            # Allow common neutrals
            if color in ('#FFFFFF', '#000000', '#TRANSPARENT', '#F5F5F5'):
                continue
            # Allow derived colors (borders, tracks) that are close to canvas
            findings.append(
                make_finding(
                    kind="color",
                    severity="soft",
                    path=filepath,
                issue=f"color '{color}' is not in channel identity palette",
                suggestion="Use an identity palette color or add this color to design.md if it is intentional.",
                )
            )

    observation_count = len(tsx_colors) + len(bg_colors)
    return findings, observation_count

def check_springs(content: str, config: dict, filepath: str) -> tuple[list[dict], int]:
    findings: list[dict] = []

    config_damping = config.get('number_spring_damping', '')
    # Find spring configs in code
    spring_blocks = re.findall(r'spring\(\{[^}]+\}', content, re.DOTALL)

    for block in spring_blocks:
        damping_match = re.search(r'damping:\s*(\d+\.?\d*)', block)
        if damping_match and config_damping:
            val = damping_match.group(1)
            # Allow ±2 tolerance for creative variation
            if abs(float(val) - float(config_damping)) > 4:
                findings.append(
                    make_finding(
                        kind="spring",
                        severity="soft",
                        path=filepath,
                        issue=f"spring damping={val} differs from channel identity {config_damping}",
                        suggestion="Use the configured spring or document why the motion needs a different feel.",
                    )
                )

    return findings, len(spring_blocks)

def lint_file(filepath: Path, config: dict) -> dict:
    content = filepath.read_text()
    findings: list[dict] = []
    observation_count = 0

    font_findings, font_observations = check_fonts(content, config, str(filepath))
    size_findings, size_observations = check_font_sizes(content, config, str(filepath))
    color_findings, color_observations = check_colors(content, config, str(filepath))
    spring_findings, spring_observations = check_springs(content, config, str(filepath))

    findings.extend(font_findings)
    findings.extend(size_findings)
    findings.extend(color_findings)
    findings.extend(spring_findings)
    observation_count += font_observations + size_observations + color_observations + spring_observations

    hard_count = sum(1 for finding in findings if finding["severity"] == "hard")
    soft_count = sum(1 for finding in findings if finding["severity"] == "soft")
    return {
        "path": str(filepath),
        "file": filepath.name,
        "observation_count": observation_count,
        "hard_count": hard_count,
        "soft_count": soft_count,
        "findings": findings,
    }

def build_summary(project_dir: Path, channel_name: str, strict: bool, file_reports: list[dict]) -> dict:
    findings = [finding for report in file_reports for finding in report["findings"]]
    total_observations = sum(report["observation_count"] for report in file_reports)
    hard_count = sum(1 for finding in findings if finding["severity"] == "hard")
    soft_count = sum(1 for finding in findings if finding["severity"] == "soft")
    weighted_issues = hard_count + soft_count * SOFT_WEIGHT
    score = 1.0 if total_observations <= 0 else max(0.0, 1.0 - (weighted_issues / total_observations))
    passed = len(findings) == 0
    return {
        "script": "lint_render_identity",
        "project": str(project_dir),
        "channel": channel_name,
        "threshold": {
            "strict": strict,
            "hard_issue_weight": 1.0,
            "soft_issue_weight": SOFT_WEIGHT,
        },
        "pass": passed,
        "advisory_only": not strict,
        "strict_pass": passed,
        "score": round(score, 3),
        "file_count": len(file_reports),
        "observation_count": total_observations,
        "finding_count": len(findings),
        "hard_finding_count": hard_count,
        "soft_finding_count": soft_count,
        "files": file_reports,
        "findings": findings,
    }

def exit_code_for_summary(summary: dict, strict: bool) -> int:
    if summary["finding_count"] <= 0:
        return 0
    return 2 if strict else 0

def parse_args(argv: list[str] | None = None) -> argparse.Namespace:
    parser = argparse.ArgumentParser(
        description="Lint runtime identity drift against channel design.md",
    )
    parser.add_argument("project_dir", help="Project directory to lint")
    parser.add_argument(
        "--strict",
        action="store_true",
        help="Return a failing exit code when findings are present",
    )
    parser.add_argument(
        "--json",
        action="store_true",
        help="Emit signal-style JSON summary instead of text output",
    )
    return parser.parse_args(argv)

def main(argv: list[str] | None = None) -> int:
    args = parse_args(argv)
    project_dir = Path(args.project_dir)

    # Find channel identity
    channel_md = project_dir / 'channel.md'
    if not channel_md.exists():
        print(f"No channel.md in {project_dir}")
        return 1

    # Read channel name
    channel_text = channel_md.read_text()
    channel_match = re.search(r'channel:\s*(\w+)', channel_text)
    if not channel_match:
        print("No channel: field in channel.md")
        return 1

    channel_name = channel_match.group(1)
    lint_targets = find_lint_targets(project_dir)

    if not lint_targets:
        print(f"No TS/TSX lint targets found in {project_dir}")
        return 1

    try:
        config = load_effective_config(project_dir, channel_name)
    except FileNotFoundError as exc:
        print(str(exc))
        return 1

    file_reports: list[dict] = []
    for target in lint_targets:
        file_reports.append(lint_file(target, config))

    summary = build_summary(project_dir, channel_name, args.strict, file_reports)

    if args.json:
        json.dump(summary, sys.stdout, indent=2)
        sys.stdout.write("\n")
    else:
        print(f"Channel: {channel_name} ({len(config)} identity values)")
        for report in file_reports:
            findings = report["findings"]
            if findings:
                print(
                    f"\n{report['file']}: {len(findings)} finding(s) "
                    f"[{report['hard_count']} hard / {report['soft_count']} soft]"
                )
                for finding in findings:
                    print(format_finding(finding))
            else:
                print(f"{report['file']}: ✓ clean")

        print(
            f"\nTotal: {summary['finding_count']} finding(s) across {summary['file_count']} files "
            f"[{summary['hard_finding_count']} hard / {summary['soft_finding_count']} soft]"
        )
        print(f"Score: {summary['score']}")
        if summary["finding_count"] > 0 and not args.strict:
            print("Advisory only. Use --strict to fail on findings.")

    return exit_code_for_summary(summary, args.strict)

if __name__ == '__main__':
    raise SystemExit(main())
