#!/usr/bin/env node
/**
 * Generate varnam-world-map-data.ts — the canonical Varnam world map in Mercator projection.
 *
 * Canvas: 1600x820. Projection: geoMercator().fitSize([1600, 820], worldLand).
 * Horizontal parallels (Mercator).
 *
 * Source: geo/varnam-world.geojson (single canonical GeoJSON built by generate-varnam-world-geo.py)
 *   - India = SOI authoritative
 *   - India's neighbors = SOI-clipped in WGS84 space
 *   - All other countries = world-atlas as-is
 *
 * Land base + borders mesh still come from world-atlas (aggregate paths unchanged).
 * Country fills + SOI India come from varnam-world.geojson.
 *
 * Run: pnpm maps:varnam-world-map  (after maps:varnam-world-geo)
 */

import { readFileSync, writeFileSync } from "node:fs";
import { createRequire } from "node:module";
import { dirname, resolve } from "node:path";
import { fileURLToPath } from "node:url";
import {
  geoGraticule,
  geoMercator,
  geoPath,
} from "d3-geo";
import { feature, mesh } from "topojson-client";

const __dirname = dirname(fileURLToPath(import.meta.url));
const require = createRequire(import.meta.url);

// ── Constants ────────────────────────────────────────────────────────────────
const W = 1600;
const H = 820;

// ── Helpers ──────────────────────────────────────────────────────────────────

function readGeoJson(path) {
  const json = JSON.parse(readFileSync(path, "utf8"));
  if (json.type === "FeatureCollection") return json;
  if (json.type === "Feature")
    return { type: "FeatureCollection", features: [json] };
  throw new Error(`Unsupported GeoJSON in ${path}: ${json.type}`);
}

/** Ramer-Douglas-Peucker simplification */
function simplifyFeatureCollection(fc, epsilon) {
  if (!epsilon || epsilon <= 0) return fc;
  return {
    ...fc,
    features: fc.features.map((f) => ({
      ...f,
      geometry: simplifyGeometry(f.geometry, epsilon),
    })),
  };
}

function simplifyGeometry(geometry, epsilon) {
  if (!geometry) return geometry;
  if (geometry.type === "Polygon") {
    return {
      ...geometry,
      coordinates: geometry.coordinates.map((ring) =>
        simplifyRing(ring, epsilon)
      ),
    };
  }
  if (geometry.type === "MultiPolygon") {
    return {
      ...geometry,
      coordinates: geometry.coordinates.map((poly) =>
        poly.map((ring) => simplifyRing(ring, epsilon))
      ),
    };
  }
  return geometry;
}

function simplifyRing(ring, epsilon) {
  if (!Array.isArray(ring) || ring.length <= 5) return ring;
  const first = ring[0];
  const last = ring[ring.length - 1];
  const closed = first[0] === last[0] && first[1] === last[1];
  const points = closed ? ring.slice(0, -1) : ring.slice();
  if (points.length < 4) return ring;
  const simplified = rdp(points, epsilon);
  if (simplified.length < 4) return ring;
  if (closed) simplified.push(simplified[0]);
  return simplified;
}

function rdp(points, epsilon) {
  const keep = new Uint8Array(points.length);
  keep[0] = 1;
  keep[points.length - 1] = 1;
  _rdpSeg(points, 0, points.length - 1, epsilon * epsilon, keep);
  return points.filter((_, i) => keep[i]);
}

function _rdpSeg(pts, first, last, epsSq, keep) {
  let maxSq = 0;
  let idx = -1;
  for (let i = first + 1; i < last; i++) {
    const sq = ptSegDistSq(pts[i], pts[first], pts[last]);
    if (sq > maxSq) {
      idx = i;
      maxSq = sq;
    }
  }
  if (maxSq > epsSq && idx > -1) {
    keep[idx] = 1;
    _rdpSeg(pts, first, idx, epsSq, keep);
    _rdpSeg(pts, idx, last, epsSq, keep);
  }
}

function ptSegDistSq(p, a, b) {
  const dx = b[0] - a[0];
  const dy = b[1] - a[1];
  if (dx === 0 && dy === 0)
    return (p[0] - a[0]) ** 2 + (p[1] - a[1]) ** 2;
  const t = Math.max(
    0,
    Math.min(1, ((p[0] - a[0]) * dx + (p[1] - a[1]) * dy) / (dx * dx + dy * dy))
  );
  const px = a[0] + t * dx;
  const py = a[1] + t * dy;
  return (p[0] - px) ** 2 + (p[1] - py) ** 2;
}

function rewindFC(fc) {
  return {
    ...fc,
    features: fc.features.map((f) => ({
      ...f,
      geometry: rewindGeom(f.geometry),
    })),
  };
}

function rewindGeom(g) {
  if (!g) return g;
  if (g.type === "Polygon") {
    return { ...g, coordinates: g.coordinates.map((r) => [...r].reverse()) };
  }
  if (g.type === "MultiPolygon") {
    return {
      ...g,
      coordinates: g.coordinates.map((poly) =>
        poly.map((r) => [...r].reverse())
      ),
    };
  }
  return g;
}

function boundsArea(bounds) {
  const [[x0, y0], [x1, y1]] = bounds;
  if (![x0, y0, x1, y1].every(Number.isFinite)) return Infinity;
  return Math.abs((x1 - x0) * (y1 - y0));
}

function pickSmallestBounds(fc, pathGen) {
  const original = { fc, path: pathGen(fc) || "", bounds: pathGen.bounds(fc) };
  const rfc = rewindFC(fc);
  const rewound = {
    fc: rfc,
    path: pathGen(rfc) || "",
    bounds: pathGen.bounds(rfc),
  };
  return boundsArea(original.bounds) <= boundsArea(rewound.bounds)
    ? original
    : rewound;
}

/**
 * Transform an SVG path string coordinate-by-coordinate.
 * Matches M and L commands with x,y pairs.
 */
function transformPathCoords(d, fn) {
  return d.replace(
    /([ML])\s*(-?[\d.]+),(-?[\d.]+)/g,
    (_, cmd, xs, ys) => {
      const [nx, ny] = fn([parseFloat(xs), parseFloat(ys)]);
      return `${cmd}${nx.toFixed(1)},${ny.toFixed(1)}`;
    }
  );
}

// ── Load world-atlas for land base + borders mesh ────────────────────────────
const worldTopoPath = resolve(
  require.resolve("world-atlas/countries-110m.json")
);
const worldTopo = JSON.parse(readFileSync(worldTopoPath, "utf8"));
const landGeo = feature(worldTopo, worldTopo.objects.land);

// ── Mercator projection (fitSize on world land — stable reference) ────────────
const proj = geoMercator().fitSize([W, H], landGeo);
const pathGen = geoPath(proj).digits(1);

// ── Aggregate paths from world-atlas ─────────────────────────────────────────
const worldLandPath = pathGen(landGeo) || "";

// Full world-atlas borders mesh (kept for reference / non-India scenes)
const bordersPath =
  pathGen(mesh(worldTopo, worldTopo.objects.countries, (a, b) => a !== b)) || "";

// SOI-clean borders mesh: removes only the Pakistan-India shared arc.
// Pakistan's borders with Afghanistan, Iran, China etc. are kept.
// The Pakistan-India border is now defined by the varnam-world.geojson fill edge.
const soiBordersPath = pathGen(
  mesh(worldTopo, worldTopo.objects.countries,
    (a, b) => {
      if (a === b) return false;
      const aId = String(a.id);
      const bId = String(b.id);
      // Remove India-Pakistan shared arc — replaced by SOI fill boundary
      if ((aId === "356" && bId === "586") || (aId === "586" && bId === "356")) return false;
      return true;
    }
  )
) || "";

const graticulePath = pathGen(geoGraticule().step([10, 10])()) || "";
const graticuleFinePath = pathGen(geoGraticule().step([5, 5])()) || "";

// Ice regions from world-atlas (aggregates, not individual country fills)
const countriesFC110 = feature(worldTopo, worldTopo.objects.countries);
const antFeat = countriesFC110.features.find((f) => String(f.id) === "10");
const grnFeat = countriesFC110.features.find((f) => String(f.id) === "304");
const antPath = antFeat ? pathGen(antFeat) || "" : "";
const grnPath = grnFeat ? pathGen(grnFeat) || "" : "";

// ── Load varnam-world.geojson — single source for country fills ───────────────
const varnamGeoPath = resolve(__dirname, "varnam-world.geojson");
const varnamGeo = JSON.parse(readFileSync(varnamGeoPath, "utf8"));
console.log(`Loaded varnam-world.geojson: ${varnamGeo.features.length} features`);

// Project all features. India (id=356) → soiIndiaPath. Others → country paths.
let soiIndiaPath = "";
const worldCountryPaths = [];

for (const feat of varnamGeo.features) {
  const id   = feat.properties?.id || String(feat.id || "");
  const name = feat.properties?.name || "";
  const path = pathGen(feat) || "";
  if (!path) continue;

  if (id === "356") {
    soiIndiaPath = path;
  } else {
    worldCountryPaths.push({ id, name, path });
  }
}

if (!soiIndiaPath) {
  throw new Error("India (id=356) not found in varnam-world.geojson");
}
console.log(`  Projected ${worldCountryPaths.length} country paths + SOI India`);

// ── Meta ─────────────────────────────────────────────────────────────────────
const meta = {
  canvas: `${W}x${H}`,
  projection: `geoMercator().fitSize([${W}, ${H}], worldLand)`,
  source: "geo/varnam-world.geojson (SOI India + SOI-clipped neighbors + world-atlas rest)",
  generatedAt: new Date().toISOString(),
  countryCount: worldCountryPaths.length,
  varnamMeta: varnamGeo.varnam_meta || {},
};

// ── Output TypeScript ────────────────────────────────────────────────────────
const ts = `// Generated by geo/generate-varnam-world-map.mjs. Do not hand-edit.
//
// Canonical Varnam world map — Mercator projection (horizontal parallels).
// Canvas: ${W}x${H}. Projection: geoMercator().fitSize([${W}, ${H}], worldLand).
//
// PAINT ORDER CONVENTION:
// 1. Ocean background
// 2. Graticule lines
// 3. World land fill (VARNAM_WORLD_LAND_PATH)
// 4. Greenland + Antarctica snow (VARNAM_GRN_PATH, VARNAM_ANT_PATH)
// 5. Individual country fills from VARNAM_WORLD_COUNTRY_PATHS (excludes India)
// 6. SOI India fill (VARNAM_SOI_INDIA_PATH) — painted LAST among fills,
//    so it covers all disputed territories (J&K, Ladakh, Arunachal Pradesh).
// 7. Animated overlays (highlights, arcs, dots, etc.)
// 8. Country borders mesh (VARNAM_WORLD_BORDERS_PATH)
// 9. SOI India border outline (on top, for clean political line)
// 10. Labels

export const VARNAM_MAP_META = ${JSON.stringify(meta, null, 2)} as const;

export const VARNAM_MAP_VIEWBOX = "0 0 ${W} ${H}";

export const VARNAM_WORLD_LAND_PATH = ${JSON.stringify(worldLandPath)};

export const VARNAM_WORLD_BORDERS_PATH = ${JSON.stringify(bordersPath)};

/** Borders mesh with India + all recalculated India neighbors excluded.
 *  Use this in any map that shows SOI India — avoids double-line artifacts
 *  at the old world-atlas boundary positions. */
export const VARNAM_SOI_BORDERS_PATH = ${JSON.stringify(soiBordersPath)};

export const VARNAM_GRATICULE_PATH = ${JSON.stringify(graticulePath)};

export const VARNAM_GRATICULE_FINE_PATH = ${JSON.stringify(graticuleFinePath)};

export const VARNAM_ANT_PATH = ${JSON.stringify(antPath)};

export const VARNAM_GRN_PATH = ${JSON.stringify(grnPath)};

/** SOI India — J&K, Ladakh, Arunachal all included. Paint AFTER country fills. */
export const VARNAM_SOI_INDIA_PATH = ${JSON.stringify(soiIndiaPath)};

/** All countries except India. Paint BEFORE VARNAM_SOI_INDIA_PATH. */
export const VARNAM_WORLD_COUNTRY_PATHS = ${JSON.stringify(worldCountryPaths, null, 2)} as const;
`;

const outPath = resolve(
  __dirname,
  "../src/remotion/varnam-world-map/varnam-world-map-data.ts"
);
writeFileSync(outPath, ts);

console.log(
  `Wrote ${outPath}: ${meta.countryCount} countries, SOI from varnam-world.geojson, ${Math.round(ts.length / 1024)} KB`
);
