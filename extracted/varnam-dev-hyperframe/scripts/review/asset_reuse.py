#!/usr/bin/env python3
# ---
# varnam_script: review.asset_reuse
# owner: reviewer
# status: live
# surface: direct-only
# purpose: Repeated asset detection gate.
# use_when: Find undeclared repeated visual assets across a film.
# inputs: CLI args, manifests, env vars, or imports documented by argparse/docstring
# outputs: files, JSON/stdout reports, or process exit code documented by the script
# authority: scripts/README.md; scripts/SCRIPT_MAP.md
# ---
"""Asset-reuse gate — flags image reuse not declared in render-manifest.yaml.

Scans a film render file for explicit image/audio asset references,
maps each asset to the cut ids that use it, and flags any asset that appears in
more than one cut unless the render manifest declares the reuse via
`Cut.reuses`.

Why this exists: asset repetition within a film is a dominant drag-causing
defect — when a cut reuses an image the viewer just saw (or saw 40s ago), the
chapter pacing collapses even when durations are fine. The old markdown-era
gate relied on free-text motif markers. The live contract now carries reuse
explicitly on the cut graph, so the QC gate must read that graph directly.

Usage:
  python3 scripts/review/asset_reuse.py \
    --film projects/<slug>/<Film>.tsx \
    --render-manifest projects/<slug>/direction/render-manifest.yaml

Exits non-zero if any asset is reused without a declared reuse chain.
"""

from __future__ import annotations

import argparse
import sys
import re
from pathlib import Path

REPO_ROOT = Path(__file__).resolve().parents[2]
SCRIPTS_DIR = REPO_ROOT / "scripts"
REVIEW_DIR = SCRIPTS_DIR / "review"
if str(REVIEW_DIR) not in sys.path:
    sys.path.insert(0, str(REVIEW_DIR))

from validate_render_manifest import load_structured  # noqa: E402

PHOTO_RE = re.compile(r'photo\(\s*"([^"]+)"\s*\)')
STATIC_FILE_RE = re.compile(r'(?:src|href)=["\']([^"\']+)["\']')
CUT_COMMENT_RE = re.compile(r"\{/\*\s*([A-Za-z][A-Za-z0-9_-]*)\b")


def _scan_film(path: Path) -> dict[str, list[str]]:
    """Return mapping of asset path -> ordered cut ids that reference it."""
    lines = path.read_text(encoding="utf-8").splitlines()
    current_cut: str | None = None
    asset_usage: dict[str, set[str]] = {}
    for line in lines:
        cut_m = CUT_COMMENT_RE.search(line)
        if cut_m:
            current_cut = cut_m.group(1)
        for m in PHOTO_RE.finditer(line):
            asset = m.group(1)
            asset_usage.setdefault(asset, set()).add(current_cut or "?")
        for m in STATIC_FILE_RE.finditer(line):
            asset = m.group(1)
            # skip audio / data files — only image assets matter
            if asset.endswith((".jpg", ".jpeg", ".png", ".webp", ".gif")):
                asset_usage.setdefault(asset, set()).add(current_cut or "?")
    return {asset: sorted(cuts) for asset, cuts in asset_usage.items()}


def _load_render_manifest_reuses(path: Path | None) -> dict[str, str | None]:
    if path is None or not path.exists():
        return {}

    payload = load_structured(path)
    if not isinstance(payload, dict):
        raise ValueError("render manifest root must be an object")

    piece = payload.get("piece")
    if not isinstance(piece, dict):
        raise ValueError("render manifest must contain a piece object")

    cuts: dict[str, str | None] = {}
    scenes = piece.get("scenes")
    if not isinstance(scenes, list):
        return cuts

    for scene in scenes:
        if not isinstance(scene, dict):
            continue
        for cut in scene.get("cuts", []):
            if not isinstance(cut, dict):
                continue
            cut_id = cut.get("id")
            if not isinstance(cut_id, str) or not cut_id.strip():
                continue
            reuses = cut.get("reuses")
            cuts[cut_id] = reuses if isinstance(reuses, str) and reuses.strip() else None
    return cuts


def _has_declared_ancestor(
    cut_id: str,
    used_cuts: set[str],
    reuses_by_cut: dict[str, str | None],
) -> bool:
    seen: set[str] = set()
    current = reuses_by_cut.get(cut_id)
    while current:
        if current in seen:
            return False
        if current in used_cuts:
            return True
        seen.add(current)
        current = reuses_by_cut.get(current)
    return False


def _classify_asset_repeat(
    used_cuts: list[str],
    reuses_by_cut: dict[str, str | None],
) -> tuple[list[str], list[str], list[str]]:
    origins: list[str] = []
    declared: list[str] = []
    undeclared: list[str] = []
    used_cut_set = set(used_cuts)

    for cut_id in used_cuts:
        if cut_id == "?":
            undeclared.append(cut_id)
            continue
        if _has_declared_ancestor(cut_id, used_cut_set, reuses_by_cut):
            declared.append(cut_id)
        else:
            origins.append(cut_id)

    if len(origins) > 1 or undeclared:
        return origins, declared, undeclared
    return origins, declared, undeclared


def parse_args(argv: list[str] | None = None) -> argparse.Namespace:
    parser = argparse.ArgumentParser(description=__doc__)
    parser.add_argument("--film", required=True, type=Path)
    parser.add_argument("--render-manifest", dest="render_manifest", type=Path, default=None)
    return parser.parse_args(argv)


def main(argv: list[str] | None = None) -> int:
    args = parse_args(argv)

    usage = _scan_film(args.film)
    try:
        reuses_by_cut = _load_render_manifest_reuses(args.render_manifest)
    except Exception as exc:  # noqa: BLE001 - CLI should fail loudly on parse issues.
        print(f"Could not parse render manifest: {exc}", file=sys.stderr)
        return 2

    repeats = {asset: cuts for asset, cuts in usage.items() if len(cuts) > 1}

    print(f"Asset-reuse gate — scanned {len(usage)} distinct image assets  ·  "
          f"{sum(len(c) for c in usage.values())} total cut references  ·  "
          f"render manifest cuts: {len(reuses_by_cut)}")

    if not repeats:
        print("\nOK — no asset reused anywhere in the film.")
        return 0

    allowed: list[str] = []
    fails: list[str] = []

    for asset, cuts in sorted(repeats.items(), key=lambda kv: len(kv[1]), reverse=True):
        cuts_str = " · ".join(cuts)
        origins, declared, undeclared = _classify_asset_repeat(cuts, reuses_by_cut)
        if len(origins) <= 1 and not undeclared:
            if origins:
                root = origins[0]
                reuse_chain = " -> ".join([root, *declared]) if declared else root
            else:
                reuse_chain = cuts_str
            allowed.append(
                f"  {asset}\n"
                f"    cuts: {cuts_str}  (declared reuse via Cut.reuses: {reuse_chain})"
            )
        else:
            reason_parts: list[str] = []
            if len(origins) > 1:
                reason_parts.append(f"multiple origins: {' · '.join(origins)}")
            if undeclared:
                reason_parts.append(f"unmapped cuts: {' · '.join(undeclared)}")
            reason = "; ".join(reason_parts) if reason_parts else "missing declared reuse chain"
            fails.append(
                f"  {asset}\n"
                f"    cuts: {cuts_str}  REPEAT — add `reuses` to render-manifest.yaml or swap one ({reason})"
            )

    if allowed:
        print("\nDeclared reuse chains (allowed):")
        for a in allowed:
            print(a)

    if fails:
        print("\nUNDECLARED REPEATS (block):")
        for f in fails:
            print(f)
        print(f"\n{len(fails)} asset(s) repeat without a declared reuse chain.")
        return 1

    return 0


if __name__ == "__main__":
    sys.exit(main())
