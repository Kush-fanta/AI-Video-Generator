#!/usr/bin/env python3
"""
generate-varnam-world-geo.py
────────────────────────────
Builds geo/varnam-world.geojson — the canonical Varnam world map.

All geometry operations happen in WGS84 lon/lat space (not pixel space).
This guarantees that India's neighbors share SOI India's exact boundary
vertices — no projection drift, no scale mismatch.

Pipeline:
  1. Decode world-atlas 110m TopoJSON → GeoJSON Features in lon/lat
  2. Load india-soi.geojson → authoritative India (Shapely geometry)
  3. Verify southern anchor: India SOI min_lat must be ~6–9°N (Kanyakumari region)
  4. For each of India's 9 neighbors: neighbor.difference(india_soi) in lon/lat
  5. Assemble FeatureCollection:
       - India: SOI geometry
       - 9 neighbors: SOI-clipped geometry
       - All other countries: world-atlas as-is
       - Maldives: injected (not in world-atlas 110m)
  6. Write varnam-world.geojson

Run from templates/:
    .venv/bin/python3 geo/generate-varnam-world-geo.py

Requirements: shapely (pip install shapely)
"""

import argparse
import json
import math
import os
import sys
from datetime import datetime, timezone

try:
    from shapely.geometry import shape, mapping, Polygon, MultiPolygon, box
    from shapely.ops import unary_union
    from shapely.validation import make_valid
    from shapely.affinity import translate as shp_translate
except ImportError:
    sys.exit("shapely not found. Run: pip install shapely")

# ── Paths ─────────────────────────────────────────────────────────────────────
SCRIPT_DIR = os.path.dirname(os.path.abspath(__file__))
REPO_ROOT  = os.path.join(SCRIPT_DIR, "..")
WORLD_TOPO = os.path.join(REPO_ROOT, "node_modules", "world-atlas", "countries-110m.json")
OUT_PATH   = os.path.join(SCRIPT_DIR, "varnam-world.geojson")

def parse_args():
    parser = argparse.ArgumentParser(
        description="Build the canonical Varnam world GeoJSON from world-atlas plus an India SOI outline."
    )
    parser.add_argument(
        "--india-soi",
        dest="india_soi",
        default=os.environ.get("VARNAM_INDIA_SOI_PATH"),
        help=(
            "Path to india-soi.geojson. "
            "You can also set VARNAM_INDIA_SOI_PATH."
        ),
    )
    return parser.parse_args()

args = parse_args()
INDIA_SOI = args.india_soi or os.path.join(SCRIPT_DIR, "india-soi.geojson")

missing = [p for p in [WORLD_TOPO, INDIA_SOI] if not os.path.exists(p)]
if missing:
    details = "\n".join(f"- {p}" for p in missing)
    sys.exit(
        "Missing required input path(s):\n"
        f"{details}\n\n"
        "Expected world-atlas at templates/node_modules/world-atlas/countries-110m.json.\n"
        "Pass the India source explicitly with `--india-soi /path/to/india-soi.geojson`\n"
        "or set `VARNAM_INDIA_SOI_PATH=/path/to/india-soi.geojson`."
    )

# ── India's neighbors (land + maritime) ──────────────────────────────────────
# IDs match world-atlas ISO numeric codes
# All neighbors — difference removes India SOI's claimed territory from each
NEIGHBOR_IDS = {
    "586",  # Pakistan
    "156",  # China
    "524",  # Nepal
    "064",  # Bhutan
    "050",  # Bangladesh
    "104",  # Myanmar
    "004",  # Afghanistan
    "144",  # Sri Lanka
}

# Land-border neighbors — get the directional extension toward India.
# Sri Lanka (144) is maritime only; no land shared boundary so skip extension.
LAND_BORDER_IDS = {"586", "156", "524", "064", "050", "104", "004"}

# Minimum area (square degrees) to keep a sub-geometry after difference.
# Filters out micro-artefacts from the boolean operation.
AREA_THRESHOLD = 0.001

# ── TopoJSON delta-decode ─────────────────────────────────────────────────────
print("Loading world-atlas TopoJSON …")
with open(WORLD_TOPO) as f:
    topo = json.load(f)

arcs_raw = topo["arcs"]
tfm      = topo.get("transform", {})
SX, SY   = tfm.get("scale",     [1, 1])
TX, TY   = tfm.get("translate", [0, 0])

def decode_arc(idx):
    raw = arcs_raw[~idx] if idx < 0 else arcs_raw[idx]
    pts, x, y = [], 0, 0
    for dx, dy in raw:
        x += dx; y += dy
        pts.append([round(x * SX + TX, 6), round(y * SY + TY, 6)])
    if idx < 0:
        pts = list(reversed(pts))
    return pts

def topo_geom_to_geojson(geom):
    """Convert a TopoJSON geometry object to a GeoJSON geometry dict."""
    gtype = geom["type"]
    if gtype == "Polygon":
        rings = []
        for ring_arcs in geom["arcs"]:
            pts = []
            for ai in ring_arcs:
                pts.extend(decode_arc(ai))
            if pts and pts[0] != pts[-1]:
                pts.append(pts[0])
            rings.append(pts)
        return {"type": "Polygon", "coordinates": rings}
    elif gtype == "MultiPolygon":
        polys = []
        for poly in geom["arcs"]:
            rings = []
            for ring_arcs in poly:
                pts = []
                for ai in ring_arcs:
                    pts.extend(decode_arc(ai))
                if pts and pts[0] != pts[-1]:
                    pts.append(pts[0])
                rings.append(pts)
            polys.append(rings)
        return {"type": "MultiPolygon", "coordinates": polys}
    else:
        return None

# Decode all world-atlas countries
print("Decoding country geometries …")
country_features = []
for geom in topo["objects"]["countries"]["geometries"]:
    cid   = str(geom.get("id", ""))
    props = geom.get("properties") or {}
    name  = props.get("name", "")
    gj    = topo_geom_to_geojson(geom)
    if gj is None:
        continue
    country_features.append({"id": cid, "name": name, "geojson": gj})

print(f"  Decoded {len(country_features)} country geometries")

# ── Load India SOI ────────────────────────────────────────────────────────────
print(f"Loading India SOI from {INDIA_SOI} …")
with open(INDIA_SOI) as f:
    india_raw = json.load(f)

if india_raw["type"] == "FeatureCollection":
    india_geojson_geom = india_raw["features"][0]["geometry"]
else:
    india_geojson_geom = india_raw.get("geometry", india_raw)

india_shp = make_valid(shape(india_geojson_geom))
bounds    = india_shp.bounds   # (min_lon, min_lat, max_lon, max_lat)
print(f"  India SOI bounds: lon [{bounds[0]:.3f}, {bounds[2]:.3f}]  lat [{bounds[1]:.3f}, {bounds[3]:.3f}]")

# ── Southern boundary anchor verification ────────────────────────────────────
min_lat = bounds[1]
if not (5.0 <= min_lat <= 10.0):
    sys.exit(f"ANCHOR CHECK FAILED: India SOI min_lat={min_lat:.3f} — expected 5–10°N (Kanyakumari). "
             f"GeoJSON may be in wrong coordinate system.")
print(f"  ✓ Southern anchor verified: min_lat={min_lat:.4f}°N (Kanyakumari region)")

# ── India centroid — used to compute "toward India" direction for each neighbor ─
india_centroid = india_shp.centroid

def extend_toward_india(neighbor_shp, extend_deg=0.3):
    """
    Extend ONLY the India-facing side of the neighbor before the difference.

    Strategy:
      1. Translate the neighbor toward India by extend_deg.
      2. Clip the translated copy to a zone just around India SOI's outline
         (India bounds + extend_deg buffer). This means ONLY the strip of
         the neighbor that is near India gets extended — far sides unchanged.
      3. Union original + clipped extension → widens only the India-facing edge.

    After difference(india_soi), the extended India-facing edge is cut at
    India SOI's exact line at SOI resolution. All other borders unchanged.
    """
    nc = neighbor_shp.centroid
    dx = india_centroid.x - nc.x
    dy = india_centroid.y - nc.y
    dist = math.sqrt(dx * dx + dy * dy)
    if dist < 1e-9:
        return neighbor_shp
    ux = extend_deg * dx / dist
    uy = extend_deg * dy / dist

    # Clip zone: India's actual shape buffered by extend_deg.
    # This ensures the extension only adds area near India's real land boundary,
    # not ocean gaps (e.g. Palk Strait between India and Sri Lanka).
    india_zone = india_shp.buffer(extend_deg)

    # Shift + clip to India zone → only the India-facing strip is extended
    shifted = shp_translate(neighbor_shp, xoff=ux, yoff=uy)
    extension = shifted.intersection(india_zone)
    if extension.is_empty:
        return neighbor_shp

    return make_valid(neighbor_shp.union(extension))

# ── Build output features ─────────────────────────────────────────────────────
print("\nProcessing countries …")
out_features = []
neighbor_results = {}

for feat in country_features:
    cid  = feat["id"]
    name = feat["name"]
    gj   = feat["geojson"]

    if cid == "356":
        # India replaced by SOI — skip world-atlas India
        continue

    if cid in NEIGHBOR_IDS:
        try:
            neighbor_shp = make_valid(shape(gj))
            # Land-border neighbors: extend toward India so the shared border
            # fully overlaps India SOI — difference then cuts at SOI resolution.
            # Maritime-only neighbors (Sri Lanka): skip extension, just difference.
            if cid in LAND_BORDER_IDS:
                neighbor_ext = extend_toward_india(neighbor_shp, extend_deg=0.3)
            else:
                neighbor_ext = neighbor_shp
            adjusted = make_valid(neighbor_ext.difference(india_shp))

            # Filter artefacts — keep only polygons that are at least 1% of the
            # largest piece. This removes small fragments (orphaned coastal slivers,
            # border-junction artefacts, leftover claim fragments) while preserving
            # any legitimate large territory or significant islands.
            if adjusted.geom_type in ("MultiPolygon", "GeometryCollection"):
                polys = [g for g in adjusted.geoms
                         if g.geom_type == "Polygon" and g.area > AREA_THRESHOLD]
                if not polys:
                    print(f"  WARNING: {name} ({cid}) fully consumed by India SOI — keeping original")
                    adjusted = neighbor_shp
                else:
                    largest = max(polys, key=lambda g: g.area)
                    rel_threshold = largest.area * 0.01  # keep ≥ 1% of largest
                    kept = [g for g in polys if g.area >= rel_threshold]
                    if len(kept) == 1:
                        adjusted = kept[0]
                    else:
                        adjusted = MultiPolygon(kept)
            elif adjusted.geom_type == "GeometryCollection":
                polys = [g for g in adjusted.geoms
                         if g.geom_type in ("Polygon", "MultiPolygon") and g.area > AREA_THRESHOLD]
                if not polys:
                    print(f"  WARNING: {name} ({cid}) geometry collection empty — keeping original")
                    adjusted = neighbor_shp
                else:
                    largest_area = max(g.area for g in polys)
                    rel_threshold = largest_area * 0.01
                    polys = [g for g in polys if g.area >= rel_threshold]
                    adjusted = make_valid(unary_union(polys))

            adjusted = make_valid(adjusted)
            removed_area = neighbor_shp.area - adjusted.area
            print(f"  {name:20s} ({cid:3s})  removed {removed_area:.4f}°² from India's claimed territory")
            neighbor_results[cid] = True

            out_features.append({
                "type": "Feature",
                "properties": {"id": cid, "name": name, "varnam": "soi-clipped"},
                "geometry": mapping(adjusted),
            })
        except Exception as e:
            print(f"  ERROR processing {name} ({cid}): {e} — keeping original")
            out_features.append({
                "type": "Feature",
                "properties": {"id": cid, "name": name},
                "geometry": gj,
            })
    else:
        out_features.append({
            "type": "Feature",
            "properties": {"id": cid, "name": name},
            "geometry": gj,
        })

# ── Add India SOI ─────────────────────────────────────────────────────────────
out_features.append({
    "type": "Feature",
    "properties": {"id": "356", "name": "India", "varnam": "soi-authoritative"},
    "geometry": india_geojson_geom,
})
print(f"\n  India SOI added (authoritative)")

# ── Add Maldives (not in world-atlas 110m) ────────────────────────────────────
# Representative small polygon at Male atoll (~4.17°N, 73.51°E)
maldives_coords = [
    [73.45, 4.12], [73.57, 4.12], [73.57, 4.22], [73.45, 4.22], [73.45, 4.12]
]
out_features.append({
    "type": "Feature",
    "properties": {"id": "462", "name": "Maldives", "varnam": "injected"},
    "geometry": {"type": "Polygon", "coordinates": [maldives_coords]},
})
print("  Maldives injected (not in world-atlas 110m)")

# ── Write output ──────────────────────────────────────────────────────────────
out_geojson = {
    "type": "FeatureCollection",
    "varnam_meta": {
        "description": "Canonical Varnam world map. India = SOI authoritative. Neighbors recalculated in WGS84 space.",
        "india_source": "india-soi.geojson (Survey of India / DataMeet)",
        "world_source": "world-atlas countries-110m.json (Natural Earth)",
        "neighbors_recalculated": sorted(neighbor_results.keys()),
        "generated_at": datetime.now(timezone.utc).isoformat(),
    },
    "features": out_features,
}

with open(OUT_PATH, "w") as f:
    json.dump(out_geojson, f, separators=(",", ":"))

size_kb = os.path.getsize(OUT_PATH) // 1024
print(f"\n✓ Written to {OUT_PATH}")
print(f"  Features: {len(out_features)}  |  Size: {size_kb} KB")
print(f"  Neighbors recalculated: {sorted(neighbor_results.keys())}")
print("\nNext: run generate-varnam-world-map.mjs to project to TypeScript SVG paths")
