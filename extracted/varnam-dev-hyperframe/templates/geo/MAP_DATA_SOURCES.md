# Map Data Sources

This is the source decision for Varnam map work. Use it before touching
`geo/india-paths.ts` or any world-map component.

## Source Hierarchy

### India, canonical

Use India Geodata as the download index. It aggregates DataMeet,
LGD/Bharat Maps, Survey of India, and Bhuvan assets with machine-readable
metadata.

- Country outline: `india-soi.geojson` for the Survey of India stance, or
  `india-composite.geojson` when the scene needs disputed territory variants.
- States: prefer `SOI_States.*` for visual outline fidelity; prefer
  `LGD_States.*` when LGD codes are needed for data joins.
- Districts: prefer `SOI_Districts.*` for map shape; prefer
  `LGD_Districts.*` for code-stable district data joins.
- Subdistricts: use `SOI_Subdistricts.*` or `LGD_Subdistricts.*` only in
  state-level drill-downs. Do not show all subdistrict labels nationally.

Do not use Natural Earth or `world-atlas` India as the featured India shape.
Those datasets are useful for the world base, but the India boundary stance is
not the one we want for India-focused videos.

### World, canonical

Use `world-atlas` for the broad world base. Prefer `countries-10m.json` for
rendered shots and `countries-110m.json` only for tiny inserts.

For non-India ADM1/ADM2 work, use geoBoundaries as the first open global
administrative source. It is not the India canonical source for us.

## Rendering Rule

World maps should be hybrid:

1. Render the world land/country base from `world-atlas`.
2. Suppress or overpaint Natural Earth India when India is visible enough to
   matter.
3. Draw the India SOI/composite outline above the world base in the same
   projection.
4. Draw state/district detail only after the camera is India-focused.

Never paste `geo/india-paths.ts` paths onto a world map. Those paths are fitted
to an India-only viewport. For world maps, read the SOI/composite GeoJSON,
project it with the same `d3-geo` projection used for `world-atlas`, then render
that projected path as the India overlay.

The current sanity check is `WorldIndiaMapPreview`: `world-atlas` India and SOI
India align within 2.2px on a `1600x820` Natural Earth projection. The northern
outline difference is source/claim coverage, not coordinate drift.

## Direct Assets

See `geo/map-source-manifest.json` for direct URLs, file sizes, licenses, and
the intended use of each source.

## Agent Workflow

From `templates/`, use these scripts before handing a map scene to
review:

```bash
python3 geo/generate-varnam-world-geo.py --india-soi /absolute/path/to/india-soi.geojson
node geo/generate-varnam-world-map.mjs
```

Inputs:

- explicit `--india-soi /absolute/path/to/india-soi.geojson` or `VARNAM_INDIA_SOI_PATH`
- installed `world-atlas/countries-110m.json` from the normal package dependency

Use `geo/map-source-manifest.json` to download the raw India source when needed.
Keep raw downloads outside the repo; commit only the canonical generated assets
that the runtime actually imports.
