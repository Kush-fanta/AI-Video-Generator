import { AbsoluteFill, useCurrentFrame, spring, interpolate } from "remotion";
import { loadFont as loadSans } from "@remotion/google-fonts/DMSans";
import { P } from "../shared/palette";
import type { Palette } from "../shared/palette";
import { reveal, lineGrow, FPS, C } from "../shared/primitives";
import { INDIA_OUTLINE, INDIA_VIEWBOX, getStatePath } from "./india-paths";

const { fontFamily: sans } = loadSans();

/**
 * IndiaChoropleth — India state-level choropleth map.
 *
 * Uses Mercator projection fitted to India bounds (1510×820).
 * State paths and outline are in the same coordinate space — they align correctly.
 *
 * DO NOT mix with WORLD_LAND or GEO_VIEWBOX — different projection.
 *
 * Usage:
 *   <IndiaChoropleth
 *     data={[
 *       { state: "West Bengal", value: 83.7 },
 *       { state: "Gujarat", value: 142 },
 *     ]}
 *     title="Per Capita Income (% of national avg)"
 *     source="RBI State Finances 2023-24"
 *     highlightStates={["West Bengal"]}
 *   />
 */

export interface StateValue {
  /** State name — case insensitive, aliases supported (e.g. "WB", "West Bengal") */
  state: string;
  value: number;
  /** Optional: override fill color for this state */
  color?: string;
}

export interface IndiaChoroplethProps {
  data: StateValue[];
  title?: string;
  source?: string;
  unit?: string;
  /** States to render with highColor (e.g. the story's subject state) */
  highlightStates?: string[];
  /** Color for highlighted/high-value states. Defaults to gold. */
  highColor?: string;
  /** Color for low-value states. Defaults to dim slate. */
  lowColor?: string;
  /** Color for states with no data. Defaults to subtle navy. */
  noDataColor?: string;
  palette?: Partial<Palette>;
  at?: number;
}

function hexToHSL(hex: string): [number, number, number] {
  const m = hex.match(/^#([0-9a-f]{6})$/i);
  if (!m) return [210, 11, 56];
  const r = parseInt(m[1].slice(0, 2), 16) / 255;
  const g = parseInt(m[1].slice(2, 4), 16) / 255;
  const b = parseInt(m[1].slice(4, 6), 16) / 255;
  const max = Math.max(r, g, b), min = Math.min(r, g, b);
  const l = (max + min) / 2;
  const d = max - min;
  const s = d === 0 ? 0 : d / (1 - Math.abs(2 * l - 1));
  let h = 0;
  if (d !== 0) {
    if (max === r) h = ((g - b) / d) % 6;
    else if (max === g) h = (b - r) / d + 2;
    else h = (r - g) / d + 4;
    h = h * 60;
    if (h < 0) h += 360;
  }
  return [h, s * 100, l * 100];
}

function lerpHSL(t: number, from: [number, number, number], to: [number, number, number]): string {
  const h = from[0] + (to[0] - from[0]) * t;
  const s = from[1] + (to[1] - from[1]) * t;
  const l = from[2] + (to[2] - from[2]) * t;
  return `hsl(${h.toFixed(1)}, ${s.toFixed(1)}%, ${l.toFixed(1)}%)`;
}

export const IndiaChoropleth: React.FC<IndiaChoroplethProps> = ({
  data,
  title,
  source,
  unit = "",
  highlightStates = [],
  highColor,
  lowColor,
  noDataColor,
  palette,
  at = 0,
}) => {
  const pal = { ...P, ...palette };
  const frame = useCurrentFrame();
  const f = Math.max(0, frame - at);

  const resolvedHigh = highColor ?? pal.terracotta;
  const resolvedLow = lowColor ?? pal.slate;
  const resolvedNoData = noDataColor ?? pal.light;

  const highHSL = hexToHSL(resolvedHigh);
  const lowHSL = hexToHSL(resolvedLow);

  const vals = data.map((d) => d.value);
  const maxVal = Math.max(...vals, 1);
  const minVal = Math.min(...vals, 0);
  const range = maxVal - minVal || 1;

  // Normalize state names for lookup
  const dataMap = new Map<string, StateValue>();
  for (const d of data) {
    dataMap.set(d.state.toUpperCase(), d);
  }
  const highlightSet = new Set(highlightStates.map((s) => s.toUpperCase()));

  // All known state names from the alias map (STATE_ALIASES keys cover the common ones)
  const ALL_STATES = [
    "Jammu and Kashmir", "Ladakh", "Himachal Pradesh", "Punjab",
    "Uttarakhand", "Haryana", "Delhi", "Rajasthan", "Uttar Pradesh",
    "Bihar", "Sikkim", "Arunachal Pradesh", "Nagaland", "Manipur",
    "Mizoram", "Tripura", "Meghalaya", "Assam", "West Bengal",
    "Jharkhand", "Odisha", "Chhattisgarh", "Madhya Pradesh", "Gujarat",
    "Maharashtra", "Andhra Pradesh", "Karnataka", "Goa", "Kerala",
    "Tamil Nadu", "Telangana", "Puducherry", "Chandigarh",
    "Andaman and Nicobar Islands", "Lakshadweep",
    "Dadra and Nagar Haveli and Daman and Diu",
  ];

  // Build render list: state name + path + fill color
  const stateRenders = ALL_STATES.map((name, i) => {
    const path = getStatePath(name);
    if (!path) return null;
    const d = dataMap.get(name.toUpperCase());
    const stagger = i * 2;
    const stateF = Math.max(0, f - stagger);
    const fillProgress = spring({
      frame: stateF,
      fps: FPS,
      config: { damping: 18, stiffness: 50, mass: 0.9 },
    });

    let fill: string;
    if (d?.color) {
      fill = d.color;
    } else if (d) {
      const t = (d.value - minVal) / range;
      fill = lerpHSL(t, lowHSL, highHSL);
    } else {
      fill = resolvedNoData;
    }

    const isHighlighted = highlightSet.has(name.toUpperCase());

    return { name, path, fill, fillProgress, stagger, isHighlighted, value: d?.value };
  }).filter(Boolean) as Array<{
    name: string; path: string; fill: string; fillProgress: number;
    stagger: number; isHighlighted: boolean; value?: number;
  }>;

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
              fontFamily: sans,
              fontSize: 52,
              fontWeight: 700,
              letterSpacing: "0.04em",
              color: pal.text,
              textTransform: "uppercase",
              lineHeight: 1.2,
            }}
          >
            {title}
          </div>
          <div
            style={{
              width: `${lineGrow(frame, at + 6, 20)}%`,
              maxWidth: 100,
              height: 3,
              backgroundColor: resolvedHigh,
              marginTop: 10,
              borderRadius: 2,
            }}
          />
        </div>
      )}

      <svg
        style={{
          position: "absolute",
          top: title ? 120 : 20,
          left: 40,
          right: 40,
          width: "calc(100% - 80px)",
          height: title ? "calc(100% - 160px)" : "calc(100% - 40px)",
        }}
        viewBox={INDIA_VIEWBOX}
        preserveAspectRatio="xMidYMid meet"
      >
        {/* India outline as background */}
        <path
          d={INDIA_OUTLINE}
          fill={resolvedNoData}
          fillOpacity={0.3}
          stroke={pal.light}
          strokeWidth={1}
        />

        {/* State fills */}
        {stateRenders.map(({ name, path, fill, fillProgress, isHighlighted }) => (
          <path
            key={name}
            d={path}
            fill={fill}
            fillOpacity={fillProgress * (isHighlighted ? 1.0 : 0.85)}
            stroke={pal.bg}
            strokeWidth={isHighlighted ? 2 : 1}
          />
        ))}

        {/* Highlight outlines on top */}
        {stateRenders
          .filter((s) => s.isHighlighted)
          .map(({ name, path }) => (
            <path
              key={`hl-${name}`}
              d={path}
              fill="none"
              stroke={resolvedHigh}
              strokeWidth={3}
            />
          ))}
      </svg>

      {/* Legend */}
      <div
        style={{
          position: "absolute",
          bottom: source ? 80 : 48,
          left: 80,
          ...reveal(frame, at + 30),
        }}
      >
        <div
          style={{
            fontFamily: sans,
            fontSize: 18,
            fontWeight: 700,
            letterSpacing: "0.12em",
            textTransform: "uppercase",
            color: pal.muted,
            marginBottom: 8,
          }}
        >
          {unit}
        </div>
        <div style={{ display: "flex", alignItems: "center", gap: 0 }}>
          {Array.from({ length: 6 }).map((_, i) => {
            const t = i / 5;
            const c = lerpHSL(t, lowHSL, highHSL);
            return (
              <div
                key={i}
                style={{
                  width: 60,
                  height: 12,
                  backgroundColor: c,
                  borderRadius: i === 0 ? "3px 0 0 3px" : i === 5 ? "0 3px 3px 0" : 0,
                }}
              />
            );
          })}
        </div>
        <div
          style={{
            display: "flex",
            justifyContent: "space-between",
            width: 360,
            marginTop: 6,
            fontFamily: sans,
            fontSize: 16,
            color: pal.muted,
            fontWeight: 600,
          }}
        >
          <span>{minVal}{unit && ` ${unit}`}</span>
          <span>{maxVal}{unit && ` ${unit}`}</span>
        </div>
      </div>

      {source && (
        <div
          style={{
            position: "absolute",
            bottom: 48,
            left: 80,
            ...reveal(frame, at + 35),
            fontFamily: sans,
            fontSize: 18,
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
  compositionId: "geo-india-choropleth",
  durationInFrames: 180,
  props: {
    data: [
      { state: "West Bengal", value: 83.7 },
      { state: "Gujarat", value: 142 },
      { state: "Maharashtra", value: 128 },
      { state: "Karnataka", value: 118 },
      { state: "Tamil Nadu", value: 115 },
      { state: "Uttar Pradesh", value: 74 },
    ],
    title: "Per Capita Income (% of national avg)",
    source: "RBI State Finances 2023-24",
    unit: "%",
    highlightStates: ["West Bengal"],
    at: 0,
  } satisfies IndiaChoroplethProps,
};
