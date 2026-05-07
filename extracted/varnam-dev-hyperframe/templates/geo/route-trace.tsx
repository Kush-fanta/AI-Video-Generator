import { AbsoluteFill, useCurrentFrame, spring, interpolate } from "remotion";
import { loadFont as loadSerif } from "@remotion/google-fonts/InstrumentSerif";
import { loadFont as loadSans } from "@remotion/google-fonts/DMSans";
import { P } from "../shared/palette";
import { reveal, FPS, C } from "../shared/primitives";
import type { BaseProps } from "../shared/types";
import { WORLD_LAND, GEO_VIEWBOX } from "./geo-paths";

const { fontFamily: serif } = loadSerif();
const { fontFamily: sans } = loadSans();

// Default route: Mumbai → Dubai → London → New York
// Approximate SVG coordinates for the Natural Earth projection at 1510×820
const _defaultPoints: RoutePoint[] = [
  { x: 940, y: 388, label: "Mumbai" },
  { x: 870, y: 350, label: "Dubai" },
  { x: 550, y: 195, label: "London" },
  { x: 275, y: 240, label: "New York" },
];

interface RoutePoint {
  x: number;
  y: number;
  label: string;
}

/**
 * RouteTrace — animates a traced route across a world map with pulsing waypoints.
 *
 * Map paths are pre-computed from world-atlas 110m + d3-geo (Natural Earth projection,
 * 1510×820 canvas). Default demo route: Mumbai → Dubai → London → New York.
 * Point coordinates are in the same SVG space as GEO_VIEWBOX (0 0 1510 820).
 */
export interface RouteTraceProps extends BaseProps {
  points?: RoutePoint[];
  routeColor?: string;
  title?: string;
  subtitle?: string;
  /** SVG path data for background map outline */
  mapPath?: string;
  mapViewBox?: string;
  source?: string;
  at?: number;
}

export const RouteTrace: React.FC<RouteTraceProps> = ({
  points = _defaultPoints,
  routeColor = P.terracotta,
  title,
  subtitle,
  mapPath = WORLD_LAND,
  mapViewBox = GEO_VIEWBOX,
  source,
  at = 0,
}) => {
  const frame = useCurrentFrame();
  const f = Math.max(0, frame - at);

  const traceProgress = spring({
    frame: f,
    fps: FPS,
    config: { damping: 22, stiffness: 35, mass: 1.2 },
  });

  const svgW = 1800;
  const svgH = 940;
  const svgTop = 60;
  const svgLeft = 60;

  const segments: Array<{ x1: number; y1: number; x2: number; y2: number; totalLen: number }> = [];
  let cumulativeLen = 0;
  for (let i = 1; i < points.length; i++) {
    const dx = points[i].x - points[i - 1].x;
    const dy = points[i].y - points[i - 1].y;
    const len = Math.sqrt(dx * dx + dy * dy);
    segments.push({
      x1: points[i - 1].x,
      y1: points[i - 1].y,
      x2: points[i].x,
      y2: points[i].y,
      totalLen: len,
    });
    cumulativeLen += len;
  }

  const drawnLen = traceProgress * cumulativeLen;
  let accumulated = 0;
  const drawnSegments: Array<{ x1: number; y1: number; x2: number; y2: number }> = [];
  let leadX = points[0]?.x ?? 0;
  let leadY = points[0]?.y ?? 0;

  for (const seg of segments) {
    if (accumulated + seg.totalLen <= drawnLen) {
      drawnSegments.push(seg);
      accumulated += seg.totalLen;
      leadX = seg.x2;
      leadY = seg.y2;
    } else {
      const remaining = drawnLen - accumulated;
      const ratio = remaining / seg.totalLen;
      const ex = seg.x1 + (seg.x2 - seg.x1) * ratio;
      const ey = seg.y1 + (seg.y2 - seg.y1) * ratio;
      drawnSegments.push({ x1: seg.x1, y1: seg.y1, x2: ex, y2: ey });
      leadX = ex;
      leadY = ey;
      break;
    }
  }

  const traceArrivalFrame = at + Math.floor(60 * traceProgress);
  const pulsePhaseFrame = Math.max(0, frame - traceArrivalFrame);
  const pulseRadius = interpolate(
    pulsePhaseFrame % 30,
    [0, 15, 30],
    [6, 10, 6],
    C,
  );
  const pulseOpacity = interpolate(
    pulsePhaseFrame % 30,
    [0, 15, 30],
    [0.9, 0.4, 0.9],
    C,
  );

  return (
    <AbsoluteFill style={{ backgroundColor: P.bg }}>
      {title && (
        <div
          style={{
            position: "absolute",
            top: 52,
            left: 80,
            maxWidth: 800,
            ...reveal(frame, at + 2),
          }}
        >
          <div
            style={{
              fontFamily: serif,
              fontSize: 72,
              color: P.text,
              lineHeight: 1.15,
            }}
          >
            {title}
          </div>
          {subtitle && (
            <div
              style={{
                fontFamily: sans,
                fontSize: 20,
                color: P.sub,
                marginTop: 8,
                lineHeight: 1.4,
              }}
            >
              {subtitle}
            </div>
          )}
        </div>
      )}

      <svg
        style={{ position: "absolute", top: svgTop, left: svgLeft }}
        width={svgW}
        height={svgH}
        viewBox={mapViewBox}
        preserveAspectRatio="xMidYMid meet"
      >
        {mapPath && (
          <path
            d={mapPath}
            fill="none"
            stroke={P.light}
            strokeWidth={1.2}
          />
        )}

        {drawnSegments.map((seg, i) => (
            <line
              key={i}
              x1={seg.x1}
              y1={seg.y1}
              x2={seg.x2}
              y2={seg.y2}
              stroke={routeColor}
              strokeWidth={3.5}
              strokeDasharray="12 6"
              strokeLinecap="round"
            />
          ))}

          {traceProgress > 0.01 && (
            <>
              <circle
                cx={leadX}
                cy={leadY}
                r={pulseRadius * 2.2}
                fill={routeColor}
                opacity={pulseOpacity * 0.2}
              />
              <circle
                cx={leadX}
                cy={leadY}
                r={pulseRadius}
                fill={routeColor}
                opacity={pulseOpacity}
              />
              <circle
                cx={leadX}
                cy={leadY}
                r={4}
                fill="#fff"
              />
            </>
          )}

          {points.map((pt, i) => {
            const pointReached =
              i === 0 ||
              (() => {
                let len = 0;
                for (let j = 0; j < i; j++) {
                  const dx = points[j + 1].x - points[j].x;
                  const dy = points[j + 1].y - points[j].y;
                  len += Math.sqrt(dx * dx + dy * dy);
                }
                return drawnLen >= len;
              })();

            return pointReached ? (
              <g key={i}>
                <circle
                  cx={pt.x}
                  cy={pt.y}
                  r={7}
                  fill={i === points.length - 1 ? routeColor : P.slate}
                  stroke={P.bg}
                  strokeWidth={2.5}
                />
              </g>
            ) : null;
          })}
      </svg>

      {points.map((pt, i) => {
        const stagger = at + 8 + i * 16;
        const isFirst = i === 0;
        const isLast = i === points.length - 1;
        const mapScaleX = svgW / parseFloat(mapViewBox.split(" ")[2]);
        const mapScaleY = svgH / parseFloat(mapViewBox.split(" ")[3]);
        const screenX = svgLeft + pt.x * mapScaleX;
        const screenY = svgTop + pt.y * mapScaleY;

        return (
          <div
            key={i}
            style={{
              position: "absolute",
              left: screenX,
              top: screenY + (i % 2 === 0 ? -38 : 18),
              ...reveal(frame, stagger),
              transform: "translateX(-50%)",
              fontFamily: sans,
              fontSize: isFirst || isLast ? 20 : 20,
              fontWeight: isFirst || isLast ? 700 : 600,
              color: isLast ? routeColor : P.sub,
              letterSpacing: "0.06em",
              textTransform: "uppercase",
              whiteSpace: "nowrap",
            }}
          >
            {pt.label}
          </div>
        );
      })}

      {/* data callout */}
      <div
        style={{
          position: "absolute",
          bottom: 80,
          right: 80,
          ...reveal(frame, at + 24),
          fontFamily: sans,
          fontSize: 20,
          fontWeight: 600,
          fontVariant: "all-small-caps",
          letterSpacing: "0.1em",
          color: P.muted,
        }}
      >
        {points.length} waypoints
      </div>

      {source && (
        <div
          style={{
            position: "absolute",
            bottom: 48,
            left: 80,
            ...reveal(frame, at + 30),
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
  compositionId: "geo-route-trace",
  durationInFrames: 180,
  props: {
    points: [
      { x: 150, y: 180, label: "Mumbai" },
      { x: 400, y: 160, label: "Dubai" },
      { x: 650, y: 140, label: "London" },
      { x: 850, y: 200, label: "New York" },
    ],
    title: "Spice Route to Finance Route",
    subtitle: "How capital flows mirrored ancient trade",
    source: "Varnam research",
    at: 0,
  } satisfies RouteTraceProps,
};
