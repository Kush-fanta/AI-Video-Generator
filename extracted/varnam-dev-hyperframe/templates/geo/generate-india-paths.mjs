/**
 * generate-india-paths.mjs
 *
 * Reads simplified India GeoJSON files (state/district/AC),
 * projects to the Remotion geo canvas (1510×820), computes centroids,
 * and writes geo/india.json — the canonical India data source.
 *
 * geo/india-paths.ts is a thin TS view over india.json and does not
 * need regeneration unless its export shape changes.
 *
 * Run: node geo/generate-india-paths.mjs
 */

import { readFileSync, writeFileSync } from "fs";
import { geoMercator, geoPath, geoCentroid } from "d3-geo";
import { fileURLToPath } from "url";
import { dirname, join } from "path";

const __dir = dirname(fileURLToPath(import.meta.url));
const dataDir = join(__dir, "data");
const outFile = join(__dir, "india.json");

const W = 1510;
const H = 820;
const FIT = [[20, 20], [W - 20, H - 20]];

function loadAndProject(file) {
  const fc = JSON.parse(readFileSync(join(dataDir, file), "utf8"));
  const proj = geoMercator().fitExtent(FIT, fc);
  const gen = geoPath(proj).digits(1);
  return { fc, proj, gen };
}

function projectedCentroid(feature, proj) {
  const [lng, lat] = geoCentroid(feature);
  const xy = proj([lng, lat]);
  if (!xy) return null;
  return [Math.round(xy[0] * 10) / 10, Math.round(xy[1] * 10) / 10];
}

console.log("Loading states...");
const { fc: statesFC, gen: statesGen } = loadAndProject("india-states-simple.geojson");

console.log("Loading districts...");
const { fc: districtsFC, gen: districtsGen } = loadAndProject("india-districts-simple.geojson");

console.log("Loading assembly constituencies...");
const { fc: acFC, gen: acGen } = loadAndProject("india-ac-simple.geojson");

// --- States ---
const stateOutlinePath = statesGen(statesFC);
const stateProj = geoMercator().fitExtent(FIT, statesFC);

const states = statesFC.features.map((f) => ({
  name: f.properties.STNAME,
  lgdCode: String(f.properties.State_LGD),
  shortName: f.properties.STNAME_SH || f.properties.STNAME,
  path: statesGen(f),
  centroid: projectedCentroid(f, stateProj),
})).filter((s) => s.path);

// --- Districts ---
const districtProj = geoMercator().fitExtent(FIT, districtsFC);

const districts = districtsFC.features.map((f) => ({
  name: f.properties.DTNAME || f.properties.dtname || f.properties.NAME || "",
  stateLgd: String(f.properties.State_LGD || f.properties.state_lgd || ""),
  districtCode: String(f.properties.District_LGD || f.properties.dtcode11 || ""),
  path: districtsGen(f),
  centroid: projectedCentroid(f, districtProj),
})).filter((d) => d.path);

// --- Assembly Constituencies ---
const acProj = geoMercator().fitExtent(FIT, acFC);

const acs = acFC.features.map((f) => ({
  name: f.properties.AC_NAME || f.properties.ac_name || "",
  acNo: String(f.properties.AC_NO || f.properties.ac_no || ""),
  stateLgd: String(f.properties.State_LGD || f.properties.state_lgd || ""),
  path: acGen(f),
  centroid: projectedCentroid(f, acProj),
})).filter((a) => a.path);

console.log(`States: ${states.length}, Districts: ${districts.length}, ACs: ${acs.length}`);

// --- Metros: major cities mapped to containing district centroids ---
const metroDistrictMap = [
  ["Delhi", "NEW DELHI"], ["Mumbai", "MUMBAI"], ["Mumbai Suburban", "MUMBAI SUBURBAN"],
  ["Bangalore", "BENGALURU URBAN"], ["Chennai", "CHENNAI"], ["Kolkata", "KOLKATA"],
  ["Hyderabad", "HYDERABAD"], ["Ahmedabad", "AHMADABAD"], ["Pune", "PUNE"],
  ["Jaipur", "JAIPUR"], ["Lucknow", "LUCKNOW"], ["Bhopal", "BHOPAL"],
  ["Patna", "PATNA"], ["Indore", "INDORE"], ["Surat", "SURAT"],
  ["Nagpur", "NAGPUR"], ["Kanpur", "KANPUR NAGAR"], ["Visakhapatnam", "VISAKHAPATNAM"],
  ["Vadodara", "VADODARA"], ["Coimbatore", "COIMBATORE"], ["Kochi", "ERNAKULAM"],
  ["Thiruvananthapuram", "THIRUVANANTHAPURAM"], ["Bhubaneswar", "KHORDHA"],
  ["Guwahati", "KAMRUP METROPOLITAN"], ["Chandigarh", "CHANDIGARH"], ["Ranchi", "RANCHI"],
  ["Raipur", "RAIPUR"], ["Dehradun", "DEHRADUN"], ["Shimla", "SHIMLA"], ["Srinagar", "SRINAGAR"],
];
const districtByName = new Map(districts.map((d) => [d.name.toUpperCase(), d]));
const metros = metroDistrictMap
  .map(([city, dist]) => {
    const d = districtByName.get(dist.toUpperCase());
    if (!d || !d.centroid) return null;
    return { name: city, district: d.name, stateLgd: d.stateLgd, x: d.centroid[0], y: d.centroid[1] };
  })
  .filter(Boolean);
console.log(`Metros: ${metros.length}`);

const STATE_ALIASES = {
  "JAMMU AND KASHMIR": "1", "J&K": "1", "JK": "1", "LADAKH": "37",
  "HIMACHAL PRADESH": "2", "HP": "2", "PUNJAB": "3", "UTTARAKHAND": "5",
  "HARYANA": "6", "DELHI": "7", "NCT OF DELHI": "7", "RAJASTHAN": "8",
  "UTTAR PRADESH": "9", "UP": "9", "BIHAR": "10", "SIKKIM": "11",
  "ARUNACHAL PRADESH": "12", "NAGALAND": "13", "MANIPUR": "14",
  "MIZORAM": "15", "TRIPURA": "16", "MEGHALAYA": "17", "ASSAM": "18",
  "WEST BENGAL": "19", "WB": "19", "JHARKHAND": "20", "ODISHA": "21",
  "ORISSA": "21", "CHHATTISGARH": "22", "MADHYA PRADESH": "23", "MP": "23",
  "GUJARAT": "24", "DADRA AND NAGAR HAVELI AND DAMAN AND DIU": "26",
  "MAHARASHTRA": "27", "ANDHRA PRADESH": "28", "AP": "28", "KARNATAKA": "29",
  "GOA": "30", "LAKSHADWEEP": "31", "KERALA": "32", "TAMIL NADU": "33",
  "TN": "33", "PUDUCHERRY": "34", "PONDICHERRY": "34",
  "ANDAMAN AND NICOBAR ISLANDS": "35", "ANDAMAN & NICOBAR": "35",
  "TELANGANA": "36",
};

const data = {
  meta: {
    source: "Government of India (LGD) via ramSeraph/indian_admin_boundaries",
    license: "CC0 1.0",
    boundaries: "India's official claimed territory (J&K, Ladakh, Arunachal Pradesh correct)",
    generated_from: "geo/data/*.geojson (generate-india-paths.mjs)",
  },
  projection: { type: "mercator", canvas: { width: W, height: H }, fitExtent: FIT },
  viewbox: `0 0 ${W} ${H}`,
  outline: stateOutlinePath,
  states,
  districts,
  acs,
  metros,
  state_aliases: STATE_ALIASES,
};

const json = JSON.stringify(data, null, 2);
writeFileSync(outFile, json);
const kb = Math.round(json.length / 1024);
console.log(`Written: geo/india.json (${kb} KB)`);
console.log("india-paths.ts is a thin TS view over this JSON and does not need regen.");
console.log("Done.");
