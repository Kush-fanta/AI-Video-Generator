import { AbsoluteFill, useCurrentFrame, interpolate } from "remotion";
import { loadFont as loadSerif } from "@remotion/google-fonts/InstrumentSerif";
import { loadFont as loadSans } from "@remotion/google-fonts/DMSans";
import { P } from "../shared/palette";
import { reveal, lineGrow, C } from "../shared/primitives";
import type { BaseProps } from "../shared/types";
import { WORLD_LAND } from "../geo/geo-paths";

const { fontFamily: serif } = loadSerif();
const { fontFamily: sans } = loadSans();

export interface MapTitleProps extends BaseProps {
  location: string;
  subtitle?: string;
  /** SVG path data for geo outline (just borders, no fill) */
  geoPath?: string;
  categoryLabel?: string;
  at?: number;
}

/**
 * Title card with a subtle geo outline as background texture.
 * Location name prominent. Geo outline draws in via stroke-dashoffset animation.
 * If no geoPath provided, falls back to a minimal grid pattern.
 */
export const MapTitle: React.FC<MapTitleProps> = ({
  location,
  subtitle,
  geoPath,
  categoryLabel,
  at = 0,
}) => {
  const frame = useCurrentFrame();
  const outlineOpacity = interpolate(frame, [at + 2, at + 18], [0, 0.12], C);
  const dashProgress = interpolate(frame, [at + 2, at + 40], [1200, 0], C);

  return (
    <AbsoluteFill style={{ backgroundColor: P.bg }}>
      {/* Geo outline — background texture */}
      {geoPath && (
        <div
          style={{
            position: "absolute",
            top: "50%",
            right: 40,
            transform: "translateY(-50%)",
            opacity: outlineOpacity,
          }}
        >
          <svg width={560} height={560} viewBox="0 0 560 560">
            <path
              d={geoPath}
              fill="none"
              stroke={P.text}
              strokeWidth={1.5}
              strokeDasharray={1200}
              strokeDashoffset={dashProgress}
            />
          </svg>
        </div>
      )}

      {/* Grid fallback when no geoPath */}
      {!geoPath && (
        <div
          style={{
            position: "absolute",
            top: 0,
            right: 0,
            width: "50%",
            height: "100%",
            opacity: interpolate(frame, [at + 4, at + 20], [0, 0.06], C),
            backgroundImage: `linear-gradient(${P.light} 1px, transparent 1px), linear-gradient(90deg, ${P.light} 1px, transparent 1px)`,
            backgroundSize: "60px 60px",
          }}
        />
      )}

      {/* Category label */}
      {categoryLabel && (
        <div
          style={{
            position: "absolute",
            top: 80,
            left: 100,
            ...reveal(frame, at + 2),
            fontFamily: sans,
            fontSize: 18,
            fontWeight: 700,
            letterSpacing: "0.2em",
            textTransform: "uppercase",
            color: P.muted,
          }}
        >
          {categoryLabel}
        </div>
      )}

      {/* Location name */}
      <div
        style={{
          position: "absolute",
          top: "50%",
          left: 100,
          transform: "translateY(-50%)",
          zIndex: 2,
        }}
      >
        <div style={reveal(frame, at + 6)}>
          <div
            style={{
              fontFamily: serif,
              fontSize: 96,
              lineHeight: 1.0,
              color: P.text,
              letterSpacing: "-0.02em",
              maxWidth: 700,
            }}
          >
            {location}
          </div>
        </div>

        <div
          style={{
            width: `${lineGrow(frame, at + 12, 18)}%`,
            maxWidth: 100,
            height: 3,
            backgroundColor: P.terracotta,
            marginTop: 24,
            borderRadius: 2,
          }}
        />

        {subtitle && (
          <div
            style={{
              ...reveal(frame, at + 18),
              fontFamily: sans,
              fontSize: 28,
              lineHeight: 1.4,
              color: P.sub,
              marginTop: 18,
              maxWidth: 480,
              fontWeight: 500,
            }}
          >
            {subtitle}
          </div>
        )}
      </div>
    </AbsoluteFill>
  );
};

export const demo = {
  compositionId: "hero-map-title",
  durationInFrames: 120,
  props: {
    location: "South Asia",
    subtitle: "A regional backdrop for the story's opening frame",
    geoPath: WORLD_LAND,
    categoryLabel: "Tech Geography",
    at: 0,
  } satisfies MapTitleProps,
};
