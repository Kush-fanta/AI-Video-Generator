/**
 * india-paths.ts — Typed view over geo/india.json (canonical India data).
 *
 * Source of truth: geo/india.json
 * Boundaries: Government of India (LGD) official — J&K, Ladakh, Arunachal Pradesh correct.
 * Canvas: 1510×820 (Mercator projection).
 *
 * Regenerate JSON: node geo/generate-india-paths.mjs (from source GeoJSON in geo/data/)
 *
 * DO NOT hand-edit this file. Update india.json or the generators.
 */

import indiaData from "./india.json";

export interface StateData {
  name: string;
  lgdCode: string;
  shortName: string;
  path: string;
  centroid: [number, number];
}

export interface DistrictData {
  name: string;
  stateLgd: string;
  districtCode: string;
  path: string;
  centroid: [number, number];
}

export interface ACData {
  name: string;
  acNo: string;
  stateLgd: string;
  path: string;
  centroid: [number, number];
}

export interface MetroData {
  name: string;
  district: string;
  stateLgd: string;
  x: number;
  y: number;
}

/** Full India outline (all states merged) */
export const INDIA_OUTLINE: string = indiaData.outline;

/** Viewbox for all India maps */
export const INDIA_VIEWBOX: string = indiaData.viewbox;

/** All 36 states + UTs with SVG paths and centroids */
export const INDIA_STATES: StateData[] = indiaData.states as StateData[];

/** All 785 districts with SVG paths and centroids */
export const INDIA_DISTRICTS: DistrictData[] = indiaData.districts as DistrictData[];

/** All 4177 Assembly Constituencies with SVG paths and centroids */
export const INDIA_ACS: ACData[] = indiaData.acs as ACData[];

/** Major metros pre-projected to canvas coordinates (no lat/lng math needed) */
export const INDIA_METROS: MetroData[] = indiaData.metros as MetroData[];

/** Lookup: state name (uppercase) → StateData */
export const STATE_BY_NAME: Record<string, StateData> = Object.fromEntries(
  INDIA_STATES.map((s) => [s.name.toUpperCase(), s])
);

/** Lookup: LGD code → StateData */
export const STATE_BY_LGD: Record<string, StateData> = Object.fromEntries(
  INDIA_STATES.map((s) => [s.lgdCode, s])
);

/** Common state name aliases → LGD codes */
export const STATE_ALIASES: Record<string, string> = indiaData.state_aliases;

/** Lookup: metro name (uppercase) → MetroData */
export const METRO_BY_NAME: Record<string, MetroData> = Object.fromEntries(
  INDIA_METROS.map((m) => [m.name.toUpperCase(), m])
);

/**
 * Get a state's SVG path by name (case-insensitive) or LGD code.
 * Returns null if not found.
 */
export function getStatePath(nameOrCode: string): string | null {
  const upper = nameOrCode.toUpperCase();
  if (STATE_BY_LGD[nameOrCode]) return STATE_BY_LGD[nameOrCode].path;
  if (STATE_BY_NAME[upper]) return STATE_BY_NAME[upper].path;
  const lgd = STATE_ALIASES[upper];
  if (lgd && STATE_BY_LGD[lgd]) return STATE_BY_LGD[lgd].path;
  return null;
}

/** Get all districts for a state by LGD code. */
export function getDistrictsByState(stateLgd: string): DistrictData[] {
  return INDIA_DISTRICTS.filter((d) => d.stateLgd === stateLgd);
}

/** Get all ACs for a state by LGD code. */
export function getACsByState(stateLgd: string): ACData[] {
  return INDIA_ACS.filter((a) => a.stateLgd === stateLgd);
}

/**
 * Get a metro's projected canvas coordinates by name (case-insensitive).
 * Returns null if the metro isn't in india.json.
 */
export function getMetro(name: string): MetroData | null {
  return METRO_BY_NAME[name.toUpperCase()] || null;
}
