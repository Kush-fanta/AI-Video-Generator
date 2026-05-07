import { AbsoluteFill, useCurrentFrame, spring, interpolate, useVideoConfig } from "remotion";
import { loadFont as loadSerif } from "@remotion/google-fonts/InstrumentSerif";
import { loadFont as loadSans } from "@remotion/google-fonts/DMSans";
import { P } from "../shared/palette";
import { reveal, lineGrow, FPS, C } from "../shared/primitives";
import type { BaseProps } from "../shared/types";
import { WORLD_LAND, GEO_VIEWBOX } from "./geo-paths";
import { INDIA_OUTLINE, INDIA_VIEWBOX, getMetro } from "./india-paths";

const { fontFamily: serif } = loadSerif();
const { fontFamily: sans } = loadSans();

/**
 * CityMarkers — animated pulsing markers on city locations across a real map,
 * with optional value labels per city.
 *
 * Map paths are pre-computed into projected SVG coordinates. For India city
 * overlays, pass INDIA_OUTLINE + INDIA_VIEWBOX from geo/india-paths.ts and build
 * cities with getMetro()/INDIA_METROS. Do not copy numeric city coordinates into
 * project code.
 */
interface CityPoint {
  name: string;
  /** X coordinate in SVG/projected space (not longitude) */
  x: number;
  /** Y coordinate in SVG/projected space (not latitude) */
  y: number;
  value?: string;
  labelX?: number;
  labelY?: number;
  labelDx?: number;
  labelDy?: number;
}

export interface CityMarkersPalette {
  bg: string;
  text: string;
  muted: string;
  mapFill: string;
  mapStroke: string;
  marker: string;
  markerStroke: string;
}

const DEFAULT_CITY_MARKERS_PALETTE: CityMarkersPalette = {
  bg: P.bg,
  text: P.text,
  muted: P.muted,
  mapFill: P.light,
  mapStroke: P.light,
  marker: P.terracotta,
  markerStroke: P.bg,
};

export interface CityMarkersProps extends BaseProps {
  cities?: CityPoint[];
  title?: string;
  categoryLabel?: string;
  /** Back-compat accent override; prefer palette.marker for channel-bound renders. */
  markerColor?: string;
  /** Channel/template palette override. */
  palette?: Partial<CityMarkersPalette>;
  /** SVG path for region/country map outline */
  mapPath?: string;
  mapViewBox?: string;
  /** Template-owned visual fit from the supplied path; agents must not hand-crop viewBoxes. */
  fitToPathBounds?: boolean;
  source?: string;
  at?: number;
}

const _defaultCities: CityPoint[] = [
  { name: "London", x: 548, y: 193 },
  { name: "New York", x: 277, y: 238 },
  { name: "Tokyo", x: 1238, y: 268 },
  { name: "Cairo", x: 672, y: 350 },
  { name: "Singapore", x: 1030, y: 468 },
];

const cityFromMetro = (
  metro: ReturnType<typeof getMetro>,
  extra: Omit<Partial<CityPoint>, "name" | "x" | "y"> = {},
): CityPoint => {
  if (!metro) {
    throw new Error("Unknown India metro");
  }
  return {
    name: metro.name,
    x: metro.x,
    y: metro.y,
    ...extra,
  };
};

const percentile = (values: number[], p: number): number => {
  if (!values.length) return 0;
  const sorted = [...values].sort((a, b) => a - b);
  const index = Math.max(0, Math.min(sorted.length - 1, Math.floor((sorted.length - 1) * p)));
  return sorted[index];
};

const fitViewBoxFromPath = (path: string, fallbackViewBox: string): string => {
  const fallback = fallbackViewBox.split(" ").map(Number);
  const nums = [...path.matchAll(/-?\d+(?:\.\d+)?/g)].map((m) => Number(m[0]));
  if (nums.length < 8) return fallbackViewBox;

  const xs: number[] = [];
  const ys: number[] = [];
  for (let i = 0; i < nums.length - 1; i += 2) {
    xs.push(nums[i]);
    ys.push(nums[i + 1]);
  }

  const minX = percentile(xs, 0.1);
  const maxX = percentile(xs, 0.9);
  const minY = percentile(ys, 0.1);
  const maxY = percentile(ys, 0.9);
  const w = maxX - minX;
  const h = maxY - minY;
  if (w <= 0 || h <= 0) return fallbackViewBox;

  const pad = Math.max(w, h) * 0.55;
  const fbX = fallback[0];
  const fbY = fallback[1];
  const fbW = fallback[2];
  const fbH = fallback[3];
  const x = Math.max(fbX, minX - pad);
  const y = Math.max(fbY, minY - pad);
  const width = Math.min(fbX + fbW - x, w + pad * 2);
  const height = Math.min(fbY + fbH - y, h + pad * 2);
  return `${x.toFixed(1)} ${y.toFixed(1)} ${width.toFixed(1)} ${height.toFixed(1)}`;
};

export const CityMarkers: React.FC<CityMarkersProps> = ({
  cities = _defaultCities,
  title,
  categoryLabel,
  markerColor,
  palette: paletteOverride,
  mapPath = WORLD_LAND,
  mapViewBox = GEO_VIEWBOX,
  fitToPathBounds = false,
  source,
  at = 0,
}) => {
  const frame = useCurrentFrame();
  const { width, height } = useVideoConfig();

  const palette: CityMarkersPalette = {
    ...DEFAULT_CITY_MARKERS_PALETTE,
    ...(markerColor ? { marker: markerColor } : {}),
    ...(paletteOverride ?? {}),
  };

  const stagger = 12;

  const svgW = width * 0.68;
  const svgH = height * 0.72;
  const svgTop = height * 0.18;
  const svgLeft = width * 0.06;

  const effectiveViewBox = fitToPathBounds ? fitViewBoxFromPath(mapPath, mapViewBox) : mapViewBox;
  const vbParts = effectiveViewBox.split(" ").map(Number);
  const vbX = vbParts[0];
  const vbY = vbParts[1];
  const vbW = vbParts[2];
  const vbH = vbParts[3];
  const scale = Math.min(svgW / vbW, svgH / vbH);
  const offsetX = (svgW - vbW * scale) / 2;
  const offsetY = (svgH - vbH * scale) / 2;

  return (
    <AbsoluteFill style={{ backgroundColor: palette.bg }}>
      {categoryLabel && (
        <div
          style={{
            position: "absolute",
            top: 52,
            left: 80,
            ...reveal(frame, at + 2),
            fontFamily: sans,
            fontSize: 20,
            fontWeight: 700,
            letterSpacing: "0.18em",
            textTransform: "uppercase",
            color: palette.muted,
          }}
        >
          {categoryLabel}
        </div>
      )}

      {title && (
        <div
          style={{
            position: "absolute",
            top: 48,
            right: 80,
            textAlign: "right",
            maxWidth: 600,
            ...reveal(frame, at + 4),
          }}
        >
          <div
            style={{
              fontFamily: serif,
              fontSize: 44,
              color: palette.text,
              lineHeight: 1.15,
            }}
          >
            {title}
          </div>
          <div
            style={{
              width: `${lineGrow(frame, at + 8, 20)}%`,
              maxWidth: 120,
              height: 3,
              backgroundColor: palette.marker,
              marginTop: 12,
              marginLeft: "auto",
              borderRadius: 2,
            }}
          />
        </div>
      )}

      <svg
        style={{ position: "absolute", top: svgTop, left: svgLeft }}
        width={svgW}
        height={svgH}
        viewBox={effectiveViewBox}
        preserveAspectRatio="xMidYMid meet"
      >
        <path
          d={mapPath}
          fill={palette.mapFill}
          fillOpacity={0.3}
          stroke={palette.mapStroke}
          strokeWidth={1.5}
        />

        {cities.map((city, i) => {
            const cityAt = at + 10 + i * stagger;
            const cityF = Math.max(0, frame - cityAt);

            const dotPop = spring({
              frame: cityF,
              fps: FPS,
              config: { damping: 10, stiffness: 120, mass: 0.4 },
            });

            const pulsePhase = ((frame - cityAt) % 40) / 40;
            const pulseR = interpolate(pulsePhase, [0, 0.5, 1], [0, 22, 0], C);
            const pulseO = interpolate(pulsePhase, [0, 0.25, 0.5, 1], [0, 0.4, 0, 0], C);

            return (
              <g key={i}>
                {dotPop > 0.5 && (
                  <circle
                    cx={city.x}
                    cy={city.y}
                    r={pulseR}
                    fill="none"
                    stroke={palette.marker}
                    strokeWidth={1.5}
                    opacity={pulseO}
                  />
                )}
                <circle
                  cx={city.x}
                  cy={city.y}
                  r={7 * dotPop}
                  fill={palette.marker}
                  stroke={palette.markerStroke}
                  strokeWidth={2.5}
                />
              </g>
            );
        })}
      </svg>

      {cities.map((city, i) => {
        const cityAt = at + 14 + i * stagger;
        const markerScreenX = (city.x - vbX) * scale + offsetX + svgLeft;
        const markerScreenY = (city.y - vbY) * scale + offsetY + svgTop;
        const screenX = city.labelX ?? markerScreenX + (city.labelDx ?? 0);
        const screenY = city.labelY ?? markerScreenY + (city.labelDy ?? 0);
        const labelAbove = (city.y - vbY) < (vbH / 2);

        return (
          <div
            key={i}
            style={{
              position: "absolute",
              left: screenX,
              top: labelAbove ? screenY - 36 : screenY + 16,
              textAlign: "center",
              ...reveal(frame, cityAt),
              transform: "translateX(-50%)",
              whiteSpace: "nowrap",
            }}
          >
            <div
              style={{
                fontFamily: sans,
                fontSize: 20,
                fontWeight: 700,
                color: palette.text,
                letterSpacing: "0.04em",
              }}
            >
              {city.name}
            </div>
            {city.value && (
              <div
                style={{
                  fontFamily: serif,
                  fontSize: 30,
                  color: palette.marker,
                  lineHeight: 1.1,
                  marginTop: 2,
                }}
              >
                {city.value}
              </div>
            )}
          </div>
        );
      })}

      {/* right-panel data summary */}
      <div
        style={{
          position: "absolute",
          right: 80,
          top: "50%",
          textAlign: "right",
          ...reveal(frame, at + 10 + cities.length * stagger),
          transform: "translateY(-50%)",
        }}
      >
        <div
          style={{
            fontFamily: serif,
            fontSize: 72,
            color: palette.text,
            lineHeight: 1.0,
            letterSpacing: "-0.02em",
          }}
        >
          {cities.length}
        </div>
        <div
          style={{
            fontFamily: sans,
            fontSize: 20,
            fontWeight: 700,
            letterSpacing: "0.1em",
            textTransform: "uppercase",
            color: palette.muted,
            marginTop: 4,
          }}
        >
          cities
        </div>
      </div>

      {source && (
        <div
          style={{
            position: "absolute",
            bottom: 48,
            left: 80,
            ...reveal(frame, at + 10 + cities.length * stagger + 8),
            fontFamily: sans,
            fontSize: 20,
            fontWeight: 500,
            letterSpacing: "0.08em",
            color: palette.muted,
            textTransform: "uppercase",
          }}
        >
          Source: {source}
        </div>
      )}
    </AbsoluteFill>
  );
};

const indiaFourMetroCities: CityPoint[] = [
  cityFromMetro(getMetro("Delhi"), { labelDy: -72 }),
  cityFromMetro(getMetro("Mumbai"), { labelDx: -118, labelDy: -6 }),
  cityFromMetro(getMetro("Bangalore"), { labelDx: -96, labelDy: 96 }),
  cityFromMetro(getMetro("Chennai"), { labelDx: 118, labelDy: 96 }),
];

const swarajyaMapPalette: CityMarkersPalette = {
  bg: "#192841",
  text: "#F5F2EA",
  muted: "#A0A8B4",
  mapFill: "#26395E",
  mapStroke: "#5A7A9A",
  marker: "#D4A264",
  markerStroke: "#192841",
};

export const indiaCitiesDemo = {
  compositionId: "geo-city-markers-india",
  durationInFrames: 150,
  props: {
    cities: indiaFourMetroCities,
    title: "India's Four Metros",
    categoryLabel: "Urban India",
    source: "templates/geo/india.json",
    mapPath: INDIA_OUTLINE,
    mapViewBox: INDIA_VIEWBOX,
    fitToPathBounds: true,
    palette: swarajyaMapPalette,
    at: 0,
  } satisfies CityMarkersProps,
};

export const demo = {
  compositionId: "geo-city-markers",
  durationInFrames: 150,
  props: {
    cities: indiaFourMetroCities,
    title: "India's Four Metros",
    categoryLabel: "Urban India",
    source: "templates/geo/india.json",
    mapPath: INDIA_OUTLINE,
    mapViewBox: INDIA_VIEWBOX,
    fitToPathBounds: true,
    palette: swarajyaMapPalette,
    at: 0,
  } satisfies CityMarkersProps,
};
