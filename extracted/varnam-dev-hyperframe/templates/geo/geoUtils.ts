/**
 * geoUtils.ts — Real geographic path generation using d3-geo + world-atlas.
 *
 * Canvas: 1510×820 (the map area used in all geo templates).
 * Projection: Natural Earth (aesthetically neutral, good for world maps).
 *
 * INDIA OVERRIDE: getCountryPath(COUNTRY_IDS.India) returns paths from the
 * official Government of India (LGD) boundary data — NOT Natural Earth, which
 * uses the disputed "international" boundary for Kashmir and excludes Arunachal
 * Pradesh from India. It is impossible to accidentally render the wrong India map
 * through this API. Use india-paths.ts directly for state/district/AC drill-downs.
 *
 * Usage:
 *   import { worldLandPath, getCountryPath, COUNTRY_IDS } from "./geoUtils";
 *
 *   // In your component (computed once at module load, not per-frame):
 *   const indiaPath = getCountryPath(COUNTRY_IDS.India); // always official GoI boundary
 *   const worldPath = worldLandPath;
 */

// India override — official GoI boundary (J&K, Ladakh, Arunachal Pradesh correct)
import { INDIA_OUTLINE } from "./india-paths";

// @ts-ignore — world-atlas ships JSON, types not always present
import worldData from "world-atlas/countries-110m.json";
import { feature } from "topojson-client";
import { geoNaturalEarth1, geoPath, geoMercator } from "d3-geo";
import type { GeoPermissibleObjects } from "d3-geo";

// Canvas size matching all geo templates
const MAP_WIDTH = 1510;
const MAP_HEIGHT = 820;

// Build world features once
const land = feature(worldData as any, (worldData as any).objects.land);
const countriesCollection = feature(
  worldData as any,
  (worldData as any).objects.countries,
);

// Natural Earth projection fitted to canvas
const naturalEarthProjection = geoNaturalEarth1().fitSize(
  [MAP_WIDTH, MAP_HEIGHT],
  land,
);

// Mercator projection — better for regional/zoomed maps
const mercatorProjection = geoMercator().fitSize([MAP_WIDTH, MAP_HEIGHT], land);

// Path generators
const naturalEarthPathGen = geoPath(naturalEarthProjection);
const mercatorPathGen = geoPath(mercatorProjection);

/** Full world land outline — Natural Earth projection */
export const worldLandPath: string = naturalEarthPathGen(land) ?? "";

/** All individual country features */
const countryFeatures = (countriesCollection as any).features as Array<{
  id: string;
  type: string;
  geometry: any;
  properties: any;
}>;

/**
 * Get the SVG path string for a specific country by its ISO 3166-1 numeric ID.
 * Returns empty string if not found.
 *
 * @param numericId - ISO 3166-1 numeric country code as string (e.g. "356" for India)
 * @param projection - "naturalEarth" (default, world maps) or "mercator" (regional maps)
 */
export function getCountryPath(
  numericId: string,
  projection: "naturalEarth" | "mercator" = "naturalEarth",
): string {
  // India override: always use official GoI boundary, never Natural Earth
  if (numericId === COUNTRY_IDS.India) return INDIA_OUTLINE;

  const feature = countryFeatures.find((f) => f.id === numericId);
  if (!feature) return "";
  const gen = projection === "mercator" ? mercatorPathGen : naturalEarthPathGen;
  return gen(feature as any) ?? "";
}

/**
 * Get SVG paths for multiple countries.
 * Returns a combined path string (all countries merged into one <path> element).
 */
export function getCountriesCombinedPath(
  numericIds: string[],
  projection: "naturalEarth" | "mercator" = "naturalEarth",
): string {
  return numericIds
    .map((id) => getCountryPath(id, projection))
    .filter(Boolean)
    .join(" ");
}

/**
 * Get individual path strings for multiple countries.
 * Returns an array of { id, path } objects for rendering separate <path> elements.
 */
export function getCountryPaths(
  numericIds: string[],
  projection: "naturalEarth" | "mercator" = "naturalEarth",
): Array<{ id: string; path: string }> {
  return numericIds
    .map((id) => ({ id, path: getCountryPath(id, projection) }))
    .filter((e) => e.path.length > 0);
}

/**
 * ISO 3166-1 numeric IDs for common countries.
 *
 * Full list: https://en.wikipedia.org/wiki/ISO_3166-1_numeric
 * To find an ID for any country, search: "ISO 3166-1 numeric <country name>"
 */
export const COUNTRY_IDS = {
  Afghanistan: "004",
  Angola: "024",
  Argentina: "032",
  Australia: "036",
  Bangladesh: "050",
  Brazil: "076",
  Canada: "124",
  Chile: "152",
  China: "156",
  Colombia: "170",
  DemRepCongo: "180",
  Egypt: "818",
  Ethiopia: "231",
  France: "250",
  Germany: "276",
  Ghana: "288",
  India: "356",
  Indonesia: "360",
  Iran: "364",
  Iraq: "368",
  Israel: "376",
  Italy: "380",
  Japan: "392",
  Jordan: "400",
  Kenya: "404",
  Malaysia: "458",
  Mexico: "484",
  Morocco: "504",
  Myanmar: "104",
  Nepal: "524",
  Netherlands: "528",
  NewZealand: "554",
  Nigeria: "566",
  NorthKorea: "408",
  Norway: "578",
  Pakistan: "586",
  Peru: "604",
  Philippines: "608",
  Poland: "616",
  Portugal: "620",
  Qatar: "634",
  Russia: "643",
  SaudiArabia: "682",
  Somalia: "706",
  SouthAfrica: "710",
  SouthKorea: "410",
  Spain: "724",
  SriLanka: "144",
  Sudan: "729",
  Sweden: "752",
  Switzerland: "756",
  Syria: "760",
  Tanzania: "834",
  Thailand: "764",
  Turkey: "792",
  UAE: "784",
  Uganda: "800",
  UK: "826",
  Ukraine: "804",
  USA: "840",
  Uzbekistan: "860",
  Venezuela: "862",
  Vietnam: "704",
  Yemen: "887",
  Zimbabwe: "716",
} as const;

export type CountryName = keyof typeof COUNTRY_IDS;

/** ViewBox string matching the geo template canvas */
export const GEO_VIEWBOX = `0 0 ${MAP_WIDTH} ${MAP_HEIGHT}`;

// Re-export India drill-down API — use these for state/district/AC level maps
export {
  INDIA_OUTLINE,
  INDIA_VIEWBOX,
  INDIA_STATES,
  INDIA_DISTRICTS,
  INDIA_ACS,
  STATE_BY_NAME,
  STATE_BY_LGD,
  STATE_ALIASES,
  getStatePath,
  getDistrictsByState,
  getACsByState,
} from "./india-paths";
