import { AbsoluteFill, useCurrentFrame, spring, interpolate } from "remotion";
import { loadFont as loadSerif } from "@remotion/google-fonts/InstrumentSerif";
import { loadFont as loadSans } from "@remotion/google-fonts/DMSans";
import { P } from "../shared/palette";
import type { Palette } from "../shared/palette";
import { reveal, lineGrow, FPS, C } from "../shared/primitives";
import type { BaseProps } from "../shared/types";
import { WORLD_LAND, COUNTRY_PATHS, GEO_VIEWBOX } from "./geo-paths";

const { fontFamily: serif } = loadSerif();
const { fontFamily: sans } = loadSans();

/**
 * ChoroplethFill — fills geographic regions with interpolated colors based on
 * data values, from low (slate) to high (terracotta or custom color).
 *
 * Map paths are pre-computed from world-atlas 110m + d3-geo (Natural Earth projection,
 * 1510×820 canvas). Default demo: South Asia — India, Pakistan, Bangladesh, Sri Lanka.
 * Value labels sit at approximate path bounding-box centroids.
 */
interface RegionData {
  name: string;
  value: number;
  /** SVG path for this region's shape — must be in the same space as mapViewBox */
  path: string;
}

export interface ChoroplethFillProps extends BaseProps {
  regions?: RegionData[];
  title?: string;
  /** Color for highest value — interpolates from slate towards this */
  highColor?: string;
  /** Label for the unit being measured */
  unit?: string;
  /** SVG path for background map outline */
  mapPath?: string;
  mapViewBox?: string;
  source?: string;
  at?: number;
  palette?: Partial<Palette>;
}

const _defaultRegions: RegionData[] = [
  { name: "India", value: 100, path: COUNTRY_PATHS.India },
  { name: "Pakistan", value: 65, path: COUNTRY_PATHS.Pakistan },
  { name: "Bangladesh", value: 35, path: COUNTRY_PATHS.Bangladesh },
  { name: "Sri Lanka", value: 15, path: COUNTRY_PATHS.SriLanka },
];

/**
 * HSL interpolation from slate toward a target hue.
 * When `highColor` prop is passed to ChoroplethFill, that prop directly
 * overrides the default terracotta endpoint used below — `lerpColorHSL`
 * is only used for the legend gradient and region fills when no per-region
 * color is specified. The actual region fills use `highColor` via
 * `lerpColorHSLToTarget` called from the component.
 */
function lerpColorHSL(t: number): string {
  // slate: ~hsl(210, 11%, 56%), terracotta: ~hsl(26, 44%, 52%)
  // NOTE: this default function is used for the legend only when highColor
  // is not provided; region fills use lerpColorHSLToTarget with highColor.
  const h = 210 + (26 - 210) * t;
  const s = 11 + (44 - 11) * t;
  const l = 56 + (52 - 56) * t;
  return `hsl(${h}, ${s}%, ${l}%)`;
}

/** HSL interpolation from slate toward an arbitrary CSS hex/hsl highColor. */
function lerpColorHSLToTarget(t: number, highColor: string): string {
  // Parse highColor as hex to get target HSL. Falls back to terracotta values
  // if parsing fails (e.g. non-hex strings like named colors or CSS vars).
  const hexMatch = highColor.match(/^#([0-9a-f]{6})$/i);
  if (!hexMatch) {
    // Can't parse — fall back to hardcoded terracotta endpoint
    return lerpColorHSL(t);
  }
  const r = parseInt(hexMatch[1].slice(0, 2), 16) / 255;
  const g = parseInt(hexMatch[1].slice(2, 4), 16) / 255;
  const b = parseInt(hexMatch[1].slice(4, 6), 16) / 255;
  const max = Math.max(r, g, b), min = Math.min(r, g, b);
  const ll = (max + min) / 2;
  const delta = max - min;
  const ss = delta === 0 ? 0 : delta / (1 - Math.abs(2 * ll - 1));
  let hh = 0;
  if (delta !== 0) {
    if (max === r) hh = ((g - b) / delta) % 6;
    else if (max === g) hh = (b - r) / delta + 2;
    else hh = (r - g) / delta + 4;
    hh = hh * 60;
    if (hh < 0) hh += 360;
  }
  // Interpolate slate HSL → parsed highColor HSL
  const h = 210 + (hh - 210) * t;
  const s = 11 + (ss * 100 - 11) * t;
  const l = 56 + (ll * 100 - 56) * t;
  return `hsl(${h}, ${s}%, ${l}%)`;
}

/** Compute bounding box centroid of an SVG path string (approximate) */
function pathCentroid(d: string): { cx: number; cy: number } {
  const nums = d.match(/[\d.]+/g)?.map(Number) || [];
  let minX = Infinity, minY = Infinity, maxX = -Infinity, maxY = -Infinity;
  for (let i = 0; i < nums.length - 1; i += 2) {
    const x = nums[i], y = nums[i + 1];
    if (x < minX) minX = x;
    if (x > maxX) maxX = x;
    if (y < minY) minY = y;
    if (y > maxY) maxY = y;
  }
  return { cx: (minX + maxX) / 2, cy: (minY + maxY) / 2 };
}

export const ChoroplethFill: React.FC<ChoroplethFillProps> = ({
  regions = _defaultRegions,
  title,
  highColor,
  unit = "",
  mapPath = WORLD_LAND,
  mapViewBox = GEO_VIEWBOX,
  source,
  at = 0,
  palette,
}) => {
  const pal = { ...P, ...palette };
  const resolvedHighColor = highColor ?? pal.terracotta;
  const frame = useCurrentFrame();
  const f = Math.max(0, frame - at);

  const fillProgress = spring({
    frame: f,
    fps: FPS,
    config: { damping: 20, stiffness: 40, mass: 1.0 },
  });

  const maxVal = Math.max(...regions.map((r) => r.value), 1);
  const minVal = Math.min(...regions.map((r) => r.value), 0);
  const range = maxVal - minVal || 1;

  const legendStops = 5;
  const legendW = 400;
  const stopW = legendW / legendStops;

  return (
    <AbsoluteFill style={{ backgroundColor: pal.bg }}>
      {title && (
        <div
          style={{
            position: "absolute",
            top: 48,
            left: 80,
            right: 80,
            ...reveal(frame, at + 2),
          }}
        >
          <div
            style={{
              fontFamily: serif,
              fontSize: 64,
              color: pal.text,
              lineHeight: 1.15,
              maxWidth: 900,
            }}
          >
            {title}
          </div>
          <div
            style={{
              width: `${lineGrow(frame, at + 6, 20)}%`,
              maxWidth: 120,
              height: 3,
              backgroundColor: resolvedHighColor,
              marginTop: 12,
              borderRadius: 2,
            }}
          />
        </div>
      )}

      <svg
        style={{ position: "absolute", top: 80, left: 120 }}
        width={1400}
        height={860}
        viewBox={mapViewBox}
        preserveAspectRatio="xMidYMid meet"
      >
        {mapPath && (
          <path
            d={mapPath}
            fill="none"
            stroke={pal.light}
            strokeWidth={1}
          />
        )}

        {regions.map((region, i) => {
            const norm = (region.value - minVal) / range;
            const color = lerpColorHSLToTarget(norm, resolvedHighColor);
            const stagger = i * 4;
            const regionF = Math.max(0, f - stagger);
            const regionFill = spring({
              frame: regionF,
              fps: FPS,
              config: { damping: 18, stiffness: 50, mass: 0.9 },
            });

            return (
              <path
                key={i}
                d={region.path}
                fill={color}
                fillOpacity={regionFill * 0.9}
                stroke={pal.bg}
                strokeWidth={1.5}
              />
            );
          })}

          {/* value labels at region centroids */}
          {regions.map((region, i) => {
            const norm = (region.value - minVal) / range;
            const color = lerpColorHSLToTarget(norm, resolvedHighColor);
            const stagger = i * 4;
            const regionF = Math.max(0, f - stagger);
            const regionFill = spring({
              frame: regionF,
              fps: FPS,
              config: { damping: 18, stiffness: 50, mass: 0.9 },
            });
            const { cx, cy } = pathCentroid(region.path);

            return (
              <g key={`label-${i}`} opacity={regionFill}>
                <text
                  x={cx}
                  y={cy - 10}
                  textAnchor="middle"
                  fill={pal.muted}
                  fontFamily={sans}
                  fontSize={20}
                >
                  {region.name}
                </text>
                <text
                  x={cx}
                  y={cy + 14}
                  textAnchor="middle"
                  fill={color}
                  fontFamily={sans}
                  fontSize={20}
                  fontWeight={700}
                >
                  {region.value}
                </text>
              </g>
            );
        })}
      </svg>

      {/* legend */}
      <div
        style={{
          position: "absolute",
          bottom: 100,
          left: 80,
          ...reveal(frame, at + 20),
        }}
      >
        <div
          style={{
            fontFamily: sans,
            fontSize: 20,
            fontWeight: 700,
            letterSpacing: "0.14em",
            textTransform: "uppercase",
            color: pal.muted,
            marginBottom: 10,
          }}
        >
          {unit || "Value"}
        </div>

        <div style={{ display: "flex", alignItems: "center", gap: 0 }}>
          {Array.from({ length: legendStops }).map((_, i) => {
            const t = i / (legendStops - 1);
            return (
              <div
                key={i}
                style={{
                  width: stopW,
                  height: 14,
                  backgroundColor: lerpColorHSLToTarget(t, resolvedHighColor),
                  borderRadius: i === 0 ? "3px 0 0 3px" : i === legendStops - 1 ? "0 3px 3px 0" : 0,
                  position: "relative",
                }}
              >
                {/* tick mark */}
                <div
                  style={{
                    position: "absolute",
                    bottom: -6,
                    left: "50%",
                    width: 1,
                    height: 6,
                    backgroundColor: pal.muted,
                    opacity: 0.5,
                  }}
                />
              </div>
            );
          })}
        </div>

        <div style={{ display: "flex", justifyContent: "space-between", width: legendW, marginTop: 8 }}>
          <div
            style={{
              fontFamily: sans,
              fontSize: 20,
              fontVariant: "all-small-caps",
              color: pal.muted,
              fontWeight: 600,
            }}
          >
            low
          </div>
          <div
            style={{
              fontFamily: sans,
              fontSize: 20,
              fontVariant: "all-small-caps",
              color: pal.muted,
              fontWeight: 600,
            }}
          >
            high
          </div>
        </div>
      </div>

      {source && (
        <div
          style={{
            position: "absolute",
            bottom: 48,
            left: 80,
            ...reveal(frame, at + 28),
            fontFamily: sans,
            fontSize: 20,
            fontWeight: 500,
            letterSpacing: "0.08em",
            color: pal.muted,
            textTransform: "uppercase",
          }}
        >
          Source: {source}
        </div>
      )}
    </AbsoluteFill>
  );
};

export const demo = {
  compositionId: "geo-choropleth-fill",
  durationInFrames: 180,
  props: {
    regions: [
      { name: "North", value: 82, path: "M200,100 L500,90 L520,180 L180,190 Z" },
      { name: "South", value: 45, path: "M180,200 L520,190 L500,320 L220,330 Z" },
      { name: "East", value: 68, path: "M530,90 L800,100 L790,200 L520,190 Z" },
      { name: "West", value: 91, path: "M530,200 L790,210 L770,330 L510,320 Z" },
    ],
    title: "Internet Penetration by Region",
    unit: "% households",
    source: "TRAI 2026",
    at: 0,
  } satisfies ChoroplethFillProps,
};
