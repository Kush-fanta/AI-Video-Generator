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
 * CountryHighlight — highlights a country on a world map with an animated fill.
 *
 * Map paths are pre-computed from world-atlas 110m + d3-geo (Natural Earth projection,
 * 1510×820 canvas). India uses the official Government of India (LGD) boundary.
 * Pass any SVG path string to `mapPath` / `countryPath` for custom regions.
 */
export interface CountryHighlightProps extends BaseProps {
  countryName?: string;
  value: string;
  label?: string;
  fillColor?: string;
  source?: string;
  /** SVG path data for the world/region outline */
  mapPath?: string;
  /** SVG path data for the highlighted country */
  countryPath?: string;
  /** ViewBox matching the coordinate space of your projected paths */
  mapViewBox?: string;
  at?: number;
}

export const CountryHighlight: React.FC<CountryHighlightProps> = ({
  countryName = "India",
  value,
  label,
  fillColor = P.terracotta,
  source,
  mapPath = WORLD_LAND,
  countryPath = COUNTRY_PATHS.India,
  mapViewBox = GEO_VIEWBOX,
  at = 0,
}) => {
  const frame = useCurrentFrame();
  const f = Math.max(0, frame - at);

  const fillOpacity = spring({
    frame: f,
    fps: FPS,
    config: { damping: 16, stiffness: 60, mass: 0.9 },
  });

  const numScale = overshootScale(frame, at + 20);
  const accentWidth = lineGrow(frame, at + 16, 22);

  return (
    <AbsoluteFill style={{ backgroundColor: P.bg }}>
      <svg
        style={{ position: "absolute", top: 120, left: 120 }}
        width={1510}
        height={820}
        viewBox={mapViewBox}
        preserveAspectRatio="xMidYMid meet"
      >
        {mapPath && (
          <path
            d={mapPath}
            fill="none"
            stroke={P.light}
            strokeWidth={1.5}
          />
        )}
        {countryPath && (
          <path
            d={countryPath}
            fill={fillColor}
            fillOpacity={fillOpacity}
            stroke={fillColor}
            strokeWidth={2}
            strokeOpacity={fillOpacity}
          />
        )}
      </svg>

      {/* ground plane rule */}
      <div
        style={{
          position: "absolute",
          top: 900,
          left: 120,
          width: 1510,
          height: 1,
          backgroundColor: P.light,
          opacity: 0.4,
        }}
      />

      <div
        style={{
          position: "absolute",
          top: 56,
          left: 80,
          ...reveal(frame, at + 2),
          fontFamily: sans,
          fontSize: 20,
          fontWeight: 700,
          letterSpacing: "0.18em",
          textTransform: "uppercase",
          color: P.muted,
        }}
      >
        Country Highlight
      </div>

      <div
        style={{
          position: "absolute",
          right: 80,
          top: 530,
          transform: "translateY(-50%)",
          width: 380,
          textAlign: "right",
        }}
      >
        <div
          style={{
            ...reveal(frame, at + 10),
            fontFamily: sans,
            fontSize: 20,
            fontWeight: 700,
            letterSpacing: "0.12em",
            textTransform: "uppercase",
            color: P.sub,
            marginBottom: 12,
          }}
        >
          {countryName}
        </div>

        <div
          style={{
            ...reveal(frame, at + 14),
            fontFamily: serif,
            fontSize: 96,
            color: P.text,
            lineHeight: 1.0,
            letterSpacing: "-0.02em",
            transform: `scale(${numScale})`,
            transformOrigin: "right center",
          }}
        >
          {value}
        </div>

        <div
          style={{
            width: `${accentWidth}%`,
            maxWidth: 160,
            height: 3,
            backgroundColor: fillColor,
            marginTop: 16,
            marginLeft: "auto",
            borderRadius: 2,
          }}
        />

        {label && (
          <div
            style={{
              ...reveal(frame, at + 22),
              fontFamily: sans,
              fontSize: 20,
              color: P.sub,
              marginTop: 16,
              lineHeight: 1.4,
            }}
          >
            {label}
          </div>
        )}
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
  compositionId: "geo-country-highlight",
  durationInFrames: 150,
  props: {
    countryName: "India",
    value: "$3.7T",
    label: "GDP (PPP) 2026",
    source: "World Bank",
    mapPath: WORLD_LAND,
    countryPath: COUNTRY_PATHS.India,
    mapViewBox: GEO_VIEWBOX,
    at: 0,
  } satisfies CountryHighlightProps,
};
