import { worldLandPath, getCountryPath, COUNTRY_IDS, GEO_VIEWBOX } from './geoUtils';
const ids = ['India','China','USA','Russia','Brazil','Australia','UK','Japan','SaudiArabia','Iran','SriLanka'] as const;
for (const n of ids) {
  const p = getCountryPath((COUNTRY_IDS as any)[n]);
  console.log(n, p ? 'OK (' + p.length + ' chars)' : 'MISSING');
}
console.log('viewBox:', GEO_VIEWBOX);
console.log('worldLandPath length:', worldLandPath.length);
