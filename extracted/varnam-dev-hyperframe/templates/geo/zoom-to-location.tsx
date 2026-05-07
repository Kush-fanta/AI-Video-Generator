import { AbsoluteFill, useCurrentFrame, spring, interpolate } from "remotion";
import { loadFont as loadSerif } from "@remotion/google-fonts/InstrumentSerif";
import { loadFont as loadSans } from "@remotion/google-fonts/DMSans";
import { P } from "../shared/palette";
import { reveal, lineGrow, kenBurns, FPS, C } from "../shared/primitives";
import type { BaseProps } from "../shared/types";
import { WORLD_LAND, GEO_VIEWBOX } from "./geo-paths";

const { fontFamily: serif } = loadSerif();
const { fontFamily: sans } = loadSans();

/**
 * ZoomToLocation — cinematic zoom into a pin-marked location on a world map.
 *
 * Map paths are pre-computed from world-atlas 110m + d3-geo (Natural Earth projection,
 * 1510×820 canvas). Default target: India's center at SVG coords ~[1050, 370].
 * Coordinates are in GEO_VIEWBOX space (0 0 1510 820).
 */
export interface ZoomToLocationProps extends BaseProps {
  locationName: string;
  subtitle?: string;
  categoryLabel?: string;
  /** Target X coordinate on the SVG map to zoom into (in mapViewBox units) */
  targetX?: number;
  /** Target Y coordinate on the SVG map to zoom into (in mapViewBox units) */
  targetY?: number;
  markerColor?: string;
  /** SVG path for world/region map. Pass real projected path data — see JSDoc for sources. */
  mapPath?: string;
  mapViewBox?: string;
  at?: number;
}

export const ZoomToLocation: React.FC<ZoomToLocationProps> = ({
  locationName,
  subtitle,
  categoryLabel,
  targetX = 1050,
  targetY = 370,
  markerColor = P.terracotta,
  mapPath = WORLD_LAND,
  mapViewBox = GEO_VIEWBOX,
  at = 0,
}) => {
  const frame = useCurrentFrame();
  const f = Math.max(0, frame - at);

  const zoomSpring = spring({
    frame: f,
    fps: FPS,
    config: { damping: 18, stiffness: 40, mass: 1.1 },
  });

  const mapScale = interpolate(zoomSpring, [0, 1], [1.0, 2.4], C);
  const translateX = interpolate(zoomSpring, [0, 1], [0, -(targetX - 240) * 1.8], C);
  const translateY = interpolate(zoomSpring, [0, 1], [0, -(targetY - 240) * 1.8], C);

  const kenBurnsExtra = kenBurns(f, FPS * 5, 1.0, 1.04);
  const finalScale = mapScale * kenBurnsExtra;

  const markerPop = spring({
    frame: Math.max(0, f - 20),
    fps: FPS,
    config: { damping: 10, stiffness: 120, mass: 0.4 },
  });

  const pinHeight = 36 * markerPop;
  const pinPulse = interpolate(frame % 40, [0, 20, 40], [0.3, 0.7, 0.3], C);

  const accentWidth = lineGrow(frame, at + 25, 20);

  return (
    <AbsoluteFill style={{ backgroundColor: P.dark, overflow: "hidden" }}>
      <div
        style={{
          position: "absolute",
          top: 0,
          left: 0,
          width: "100%",
          height: "100%",
          display: "flex",
          alignItems: "center",
          justifyContent: "center",
          transform: `scale(${finalScale}) translate(${translateX}px, ${translateY}px)`,
          transformOrigin: "center center",
        }}
      >
        <svg
          width={960}
          height={960}
          viewBox={mapViewBox}
          preserveAspectRatio="xMidYMid meet"
        >
          <path
            d={mapPath}
            fill="none"
            stroke={P.slate}
            strokeWidth={0.8}
            opacity={0.5}
          />

          {markerPop > 0.01 && (
            <g>
              <circle
                cx={targetX}
                cy={targetY}
                r={18 * markerPop}
                fill={markerColor}
                opacity={pinPulse * 0.25}
              />
              <circle
                cx={targetX}
                cy={targetY}
                r={10 * markerPop}
                fill={markerColor}
                opacity={pinPulse * 0.45}
              />
              <line
                x1={targetX}
                y1={targetY}
                x2={targetX}
                y2={targetY - pinHeight}
                stroke={markerColor}
                strokeWidth={2.5}
                strokeLinecap="round"
              />
              <circle
                cx={targetX}
                cy={targetY - pinHeight}
                r={6 * markerPop}
                fill={markerColor}
                stroke={P.dark}
                strokeWidth={2}
              />
            </g>
          )}
        </svg>
      </div>

      <div
        style={{
          position: "absolute",
          bottom: 0,
          left: 0,
          width: "100%",
          height: "40%",
          background:
            "linear-gradient(to top, rgba(10,10,10,0.92) 0%, rgba(10,10,10,0.5) 60%, transparent 100%)",
        }}
      />

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
            color: "rgba(255,255,255,0.45)",
          }}
        >
          {categoryLabel}
        </div>
      )}

      <div
        style={{
          position: "absolute",
          bottom: 80,
          left: 80,
          right: 80,
          zIndex: 2,
        }}
      >
        <div style={reveal(frame, at + 22)}>
          <div
            style={{
              fontFamily: serif,
              fontSize: 80,
              color: P.bg,
              lineHeight: 1.06,
              letterSpacing: "-0.02em",
              maxWidth: 1100,
            }}
          >
            {locationName}
          </div>
        </div>

        <div
          style={{
            width: `${accentWidth}%`,
            maxWidth: 160,
            height: 3,
            backgroundColor: markerColor,
            marginTop: 18,
            borderRadius: 2,
          }}
        />

        {subtitle && (
          <div
            style={{
              ...reveal(frame, at + 30),
              fontFamily: sans,
              fontSize: 28,
              color: "rgba(237,234,228,0.7)",
              marginTop: 14,
              lineHeight: 1.4,
              maxWidth: 800,
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
  compositionId: "geo-zoom-to-location",
  durationInFrames: 150,
  props: {
    locationName: "Bengaluru",
    subtitle: "India's Silicon Plateau — 1,600+ GCCs",
    categoryLabel: "Tech Geography",
    targetX: 300,
    targetY: 280,
    at: 0,
  } satisfies ZoomToLocationProps,
};
