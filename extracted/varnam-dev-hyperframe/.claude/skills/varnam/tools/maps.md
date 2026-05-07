# Maps

Use this when a scene needs a real map — not decorative geography, not an atmospheric silhouette.

This is a craft/data contract for Varnam map work. It describes which data sources and HyperFrames composition surfaces are canonical. Channel taste still lives in `channels/<name>/design.md`; map execution binds through composition variables.

Repo root: `/Users/dev/Downloads/varnam-improviser`. Resolve `.claude/`, `channels/`, `projects/`, and `templates/` from that root. Do not run from `templates/` and then look for `templates/.claude` or `templates/channels`.

---

## 1. Map modes

### Type A — stylized spatial graphic

Use when geography is suggestive, not a factual position claim.

Examples:
- rough regional emphasis
- symbolic spread
- title-card geography
- editorial callout where exact placement does not carry the argument

Allowed stylized composition surfaces include dot, callout, and title map treatments when the storyboard declares a stylized treatment.

### Type B — factual cartographic map

Use when a wrong point, border, route, or region would mislead the viewer.

Examples:
- city/port/site markers
- routes or directional flow
- state/district/constituency highlights
- borders/territory claims
- any map used as evidence

Type B maps must use canonical geo data and must be verified on a real rendered frame. Coordinate math alone is not evidence.

---

## 2. Canonical India data

For India maps, the canonical source is:

- `templates/geo/india.json` — outline, viewbox, projection metadata, 36 states/UTs, 785 districts, 4177 assembly constituencies, 28 metros; all centroids are pre-projected to a 1510×820 Mercator canvas.
- `templates/geo/india-paths.ts` — typed view over `india.json` exporting `INDIA_OUTLINE`, `INDIA_VIEWBOX`, `INDIA_STATES`, `INDIA_DISTRICTS`, `INDIA_ACS`, `INDIA_METROS`, `getMetro(`, `getStatePath()`, and related helpers.

Rules:

- Use `INDIA_OUTLINE` + `INDIA_VIEWBOX` for India-wide city overlays.
- Use `INDIA_METROS` / `getMetro()` for metro markers.
- Use district/state/AC typed arrays for subnational shapes and centroids.
- Do not hand-derive centroids from SVG path text.
- Do not copy numeric city coordinates into project bindings when the typed view can return them.
- If a necessary place is absent, update the canonical data/generator path; do not create a one-off coordinate table inside a project.

---

## 3. Composition-first map vocabulary

Start with HyperFrames composition inspection:

```bash
python3 scripts/run.py hyperframes:lint projects/<slug>/hyperframes --json
python3 scripts/run.py hyperframes:compositions projects/<slug>/hyperframes
```

Map composition surfaces:

| Composition | Use |
|---|---|
| `projects/<slug>/hyperframes/compositions/*map*.html` | Executable map compositions for points, routes, zooms, choropleths, and callouts. |
| `templates/geo/*` | Canonical data and legacy source references while the map library is being moved into HyperFrames compositions. |

A new map composition is the last resort. Before authoring one, document which existing HyperFrames compositions were considered and why they failed.

---

## 4. India city overlay binding pattern

Use this pattern for India metro maps:

```tsx
import { CityMarkers } from "./geo/city-markers";
import { INDIA_OUTLINE, INDIA_VIEWBOX, getMetro } from "./geo/india-paths";

const cities = ["Delhi", "Mumbai", "Bangalore", "Chennai"].map((name) => {
  const metro = getMetro(name);
  if (!metro) throw new Error(`Unknown metro: ${name}`);
  return metro;
});

<CityMarkers
  mapPath={INDIA_OUTLINE}
  mapViewBox={INDIA_VIEWBOX}
  cities={cities}
  palette={{
    bg: "#192841",
    text: "#F5F2EA",
    muted: "#A0A8B4",
    mapFill: "#26395E",
    mapStroke: "#5A7A9A",
    marker: "#D4A264",
    markerStroke: "#192841",
  }}
/>
```

The numeric coordinates are data output from `getMetro()`. They do not belong as copied constants in project code or agent-authored bindings.

---

## 5. World map boundary stance

For world maps where India is visible and the boundary stance matters:

- world base: `world-atlas/countries-110m.json`
- India boundary: Survey of India / DataMeet `india-soi.geojson`
- generated canonical GeoJSON: `templates/geo/varnam-world.geojson`
- generated runtime data under `templates/geo/`

Do not compose a world map by manually overlaying a separate India outline at render time. Regenerate canonical assets instead.

Regeneration:

```bash
VARNAM_INDIA_SOI_PATH=/absolute/path/to/india-soi.geojson pnpm --dir templates maps:varnam-world-geo
pnpm --dir templates maps:varnam-world-map
```

`india-soi.geojson` is not committed. The source URL lives in `templates/geo/map-source-manifest.json`.

---

## 6. Verification contract

A Type B map is not done until the real HyperFrames composition output is rendered and opened.

Required evidence:

1. real composition path rendered, e.g. `projects/<slug>/hyperframes/compositions/map-city-markers.html`
2. canonical data path and lookup API used, e.g. `templates/geo/india-paths.ts getMetro()`
3. preview PNG path opened with Read in the same run
4. visual confirmation: marker/label placement, landmass/bounds, route direction if any, and channel palette

Proxy renders are diagnostics only. Standalone HTML/SVG/Chrome screenshots do not satisfy Evidence for a composition binding. If a proxy was used during debugging, the final proof must still come from the actual HyperFrames composition render.

---

## 7. Anti-patterns

- self-verification by coordinate ordering or pixel math only
- hand-written SVG/HTML screenshots as final proof
- nested SVGs or transform groups to reconcile mismatched coordinate spaces
- project-local renderer map code under `projects/<slug>/src/**`
- one-off India city components when an existing HyperFrames map composition covers the job
- using stylized blob compositions for factual city positions
- stale old template-root paths; the executable root is `projects/<slug>/hyperframes/`
- retired legacy map-canvas vocabulary; use HyperFrames composition surfaces
