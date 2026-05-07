import { AbsoluteFill, useCurrentFrame, spring, interpolate } from "remotion";
import { loadFont as loadSerif } from "@remotion/google-fonts/InstrumentSerif";
import { loadFont as loadSans } from "@remotion/google-fonts/DMSans";
import { P } from "../shared/palette";
import { reveal, overshootScale, lineGrow, FPS, C } from "../shared/primitives";
import type { BaseProps } from "../shared/types";
import { WORLD_LAND, COUNTRY_PATHS, GEO_VIEWBOX } from "./geo-paths";

const { fontFamily: serif } = loadSerif();
const { fontFamily: sans } = loadSans();

/**
 * MultiCountryCompare — highlights multiple countries with animated fills and
 * side-panel value labels for direct comparison.
 *
 * Map paths are pre-computed from world-atlas 110m + d3-geo (Natural Earth projection,
 * 1510×820 canvas). Default: India, China, USA.
 */
interface CountryData {
  name: string;
  value: string;
  color?: string;
  /** SVG path for this country's shape — must be in the same space as mapViewBox */
  path: string;
  /** Legend label X position in screen pixels (default: right panel) */
  labelX?: number;
  /** Legend label Y position in screen pixels (default: stacked in right panel) */
  labelY?: number;
}

export interface MultiCountryCompareProps extends BaseProps {
  countries?: CountryData[];
  title?: string;
  /** SVG path for the base map outline */
  mapPath?: string;
  mapViewBox?: string;
  /** Reveal mode: "sequential" staggers, "simultaneous" reveals all at once */
  revealMode?: "sequential" | "simultaneous";
  source?: string;
  at?: number;
}

const VALUE_COLORS = [P.terracotta, P.sage, P.slate, P.mauve];

const _defaultCountries: CountryData[] = [
  { name: "India", value: "—", path: COUNTRY_PATHS.India },
  { name: "China", value: "—", path: COUNTRY_PATHS.China },
  { name: "USA", value: "—", path: COUNTRY_PATHS.USA },
];

export const MultiCountryCompare: React.FC<MultiCountryCompareProps> = ({
  countries = _defaultCountries,
  title,
  mapPath = WORLD_LAND,
  mapViewBox = GEO_VIEWBOX,
  revealMode = "sequential",
  source,
  at = 0,
}) => {
  const frame = useCurrentFrame();

  const stagger = revealMode === "sequential" ? 22 : 0;

  return (
    <AbsoluteFill style={{ backgroundColor: P.bg }}>
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
              fontSize: 44,
              color: P.text,
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
              backgroundColor: P.terracotta,
              marginTop: 12,
              borderRadius: 2,
            }}
          />
        </div>
      )}

      <svg
        style={{ position: "absolute", top: 100, left: 60 }}
        width={1260}
        height={840}
        viewBox={mapViewBox}
        preserveAspectRatio="xMidYMid meet"
      >
        <path
          d={mapPath}
          fill="none"
          stroke={P.light}
          strokeWidth={1.2}
        />

        {countries.map((c, i) => {
            const countryAt = at + 8 + i * stagger;
            const f = Math.max(0, frame - countryAt);
            const fillAnim = spring({
              frame: f,
              fps: FPS,
              config: { damping: 14, stiffness: 70, mass: 0.8 },
            });
            const color = c.color || VALUE_COLORS[i % VALUE_COLORS.length];

            return (
              <path
                key={i}
                d={c.path}
                fill={color}
                fillOpacity={fillAnim * 0.85}
                stroke={color}
                strokeWidth={1.5}
                strokeOpacity={fillAnim}
              />
            );
        })}
      </svg>

      {/* leader lines from legend swatches toward map */}
      <svg
        style={{ position: "absolute", top: 0, left: 0, pointerEvents: "none" }}
        width={1920}
        height={1080}
      >
        {countries.map((c, i) => {
          const lx = c.labelX ?? 1380;
          const ly = c.labelY ?? (200 + i * 160);
          return (
            <line
              key={i}
              x1={lx - 20}
              y1={ly + 24}
              x2={lx - 60}
              y2={ly + 24}
              stroke={P.light}
              strokeWidth={1}
            />
          );
        })}
      </svg>

      {countries.map((c, i) => {
        const countryAt = at + 12 + i * stagger;
        const color = c.color || VALUE_COLORS[i % VALUE_COLORS.length];
        const numScale = overshootScale(frame, countryAt + 6);

        const lx = c.labelX ?? 1380;
        const ly = c.labelY ?? (200 + i * 160);

        return (
          <div
            key={i}
            style={{
              position: "absolute",
              left: lx,
              top: ly,
              width: 460,
              ...reveal(frame, countryAt),
            }}
          >
            <div style={{ display: "flex", alignItems: "center", gap: 12, marginBottom: 6 }}>
              <div
                style={{
                  width: 14,
                  height: 14,
                  borderRadius: 3,
                  backgroundColor: color,
                  flexShrink: 0,
                }}
              />
              <div
                style={{
                  fontFamily: sans,
                  fontSize: 20,
                  fontWeight: 700,
                  letterSpacing: "0.1em",
                  textTransform: "uppercase",
                  color: P.sub,
                }}
              >
                {c.name}
              </div>
            </div>

            <div
              style={{
                fontFamily: serif,
                fontSize: 72,
                color: P.text,
                lineHeight: 1.0,
                letterSpacing: "-0.02em",
                transform: `scale(${numScale})`,
                transformOrigin: "left center",
                paddingLeft: 26,
              }}
            >
              {c.value}
            </div>
          </div>
        );
      })}

      {source && (
        <div
          style={{
            position: "absolute",
            bottom: 48,
            left: 80,
            ...reveal(frame, at + 8 + countries.length * stagger + 10),
            fontFamily: sans,
            fontSize: 20,
            fontWeight: 500,
            letterSpacing: "0.08em",
            color: P.muted,
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
  compositionId: "geo-multi-country-compare",
  durationInFrames: 150,
  props: {
    countries: [
      {
        name: "India",
        value: "$3.7T",
        path: "M600,130 L700,125 L780,140 L760,170 L680,180 L600,165 Z",
      },
      {
        name: "Germany",
        value: "$4.5T",
        path: "M420,100 L470,95 L490,120 L460,135 L420,125 Z",
      },
      {
        name: "Japan",
        value: "$4.2T",
        path: "M850,130 L880,125 L890,150 L870,160 L845,148 Z",
      },
    ],
    title: "GDP Comparison 2026",
    revealMode: "sequential",
    source: "IMF",
    at: 0,
  } satisfies MultiCountryCompareProps,
};
