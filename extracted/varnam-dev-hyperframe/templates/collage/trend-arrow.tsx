import { AbsoluteFill, useCurrentFrame, interpolate } from "remotion";
import { C, ease } from "../shared/primitives";

interface TrendPoint {
  x: number;
  y: number;
}

interface TrendArrowProps {
  /** Array of points as percentage of canvas — the jagged line path */
  points: TrendPoint[];
  /** Line color (default red) */
  color?: string;
  /** Line thickness (default 4) */
  strokeWidth?: number;
  /** Show arrowhead at end (default true) */
  arrowHead?: boolean;
  /** Arrowhead size in px */
  arrowSize?: number;
  /** Glow/bloom effect behind the line */
  glow?: boolean;
  /** Glow blur radius */
  glowRadius?: number;
  /** Draw-on animation duration in frames */
  drawDuration?: number;
  /** Frame to start animation */
  at?: number;
  /** Canvas dimensions */
  width?: number;
  height?: number;
}

/**
 * Animated jagged trend line with arrowhead.
 * Draws on from start to end — like a stock chart crash line.
 * Optional glow effect for that news-graphic punch.
 *
 * Points are percentages of canvas. The line is SVG with stroke-dashoffset animation.
 */
export const TrendArrow: React.FC<TrendArrowProps> = ({
  points,
  color = "#E8342E",
  strokeWidth = 4,
  arrowHead = true,
  arrowSize = 20,
  glow = true,
  glowRadius = 12,
  drawDuration = 30,
  at = 0,
  width = 1920,
  height = 1080,
}) => {
  const frame = useCurrentFrame();

  if (points.length < 2) return null;

  // Convert percentage points to px
  const pxPoints = points.map((p) => ({
    x: (p.x / 100) * width,
    y: (p.y / 100) * height,
  }));

  // Build SVG path
  const pathD =
    `M ${pxPoints[0].x} ${pxPoints[0].y}` +
    pxPoints
      .slice(1)
      .map((p) => ` L ${p.x} ${p.y}`)
      .join("");

  // Calculate total path length (approximate)
  let totalLength = 0;
  for (let i = 1; i < pxPoints.length; i++) {
    const dx = pxPoints[i].x - pxPoints[i - 1].x;
    const dy = pxPoints[i].y - pxPoints[i - 1].y;
    totalLength += Math.sqrt(dx * dx + dy * dy);
  }

  // Draw-on animation
  const drawProgress = interpolate(frame, [at, at + drawDuration], [0, 1], {
    ...C,
    easing: ease,
  });
  const dashOffset = totalLength * (1 - drawProgress);

  // Arrowhead: angle at the last segment
  const last = pxPoints[pxPoints.length - 1];
  const prev = pxPoints[pxPoints.length - 2];
  const angle = Math.atan2(last.y - prev.y, last.x - prev.x);
  const arrowOpacity = interpolate(
    frame,
    [at + drawDuration - 5, at + drawDuration],
    [0, 1],
    C,
  );

  const arrowId = `trend-arrow-${Math.round(points[0].x)}`;

  return (
    <AbsoluteFill style={{ pointerEvents: "none" }}>
      <svg width={width} height={height} style={{ position: "absolute" }}>
        <defs>
          {glow && (
            <filter id={`${arrowId}-glow`}>
              <feGaussianBlur stdDeviation={glowRadius} result="blur" />
              <feMerge>
                <feMergeNode in="blur" />
                <feMergeNode in="SourceGraphic" />
              </feMerge>
            </filter>
          )}
        </defs>

        {/* Glow layer */}
        {glow && (
          <path
            d={pathD}
            fill="none"
            stroke={color}
            strokeWidth={strokeWidth * 3}
            strokeLinecap="round"
            strokeLinejoin="round"
            strokeDasharray={totalLength}
            strokeDashoffset={dashOffset}
            opacity={0.3}
            filter={`url(#${arrowId}-glow)`}
          />
        )}

        {/* Main line */}
        <path
          d={pathD}
          fill="none"
          stroke={color}
          strokeWidth={strokeWidth}
          strokeLinecap="round"
          strokeLinejoin="round"
          strokeDasharray={totalLength}
          strokeDashoffset={dashOffset}
        />

        {/* Arrowhead */}
        {arrowHead && (
          <polygon
            points={[
              `${last.x},${last.y}`,
              `${last.x - arrowSize * Math.cos(angle - 0.4)},${last.y - arrowSize * Math.sin(angle - 0.4)}`,
              `${last.x - arrowSize * Math.cos(angle + 0.4)},${last.y - arrowSize * Math.sin(angle + 0.4)}`,
            ].join(" ")}
            fill={color}
            opacity={arrowOpacity}
          />
        )}
      </svg>
    </AbsoluteFill>
  );
};
