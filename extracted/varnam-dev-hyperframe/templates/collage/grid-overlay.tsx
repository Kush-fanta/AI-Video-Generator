import { AbsoluteFill, useCurrentFrame, interpolate } from "remotion";
import { C, ease } from "../shared/primitives";

interface GridOverlayProps {
  /** Grid line color */
  color?: string;
  /** Line opacity (default 0.12) */
  opacity?: number;
  /** Cell size in px (default 80) */
  cellSize?: number;
  /** Line thickness (default 1) */
  lineWidth?: number;
  /** Animate grid fade-in */
  at?: number;
  /** Canvas dimensions */
  width?: number;
  height?: number;
}

/**
 * Thin grid overlay — chart/graph paper aesthetic.
 * Fades in with a subtle top-to-bottom wipe.
 * Works on both light and dark canvases.
 */
export const GridOverlay: React.FC<GridOverlayProps> = ({
  color = "rgba(255,255,255,0.12)",
  opacity = 1,
  cellSize = 80,
  lineWidth = 1,
  at = 0,
  width = 1920,
  height = 1080,
}) => {
  const frame = useCurrentFrame();
  const fadeIn = interpolate(frame, [at, at + 15], [0, opacity], C);
  // Wipe reveals grid top to bottom
  const wipeY = interpolate(frame, [at, at + 25], [0, height + 100], {
    ...C,
    easing: ease,
  });

  const cols = Math.ceil(width / cellSize);
  const rows = Math.ceil(height / cellSize);

  return (
    <AbsoluteFill style={{ pointerEvents: "none", opacity: fadeIn }}>
      <svg width={width} height={height} style={{ position: "absolute" }}>
        <defs>
          <clipPath id="grid-wipe">
            <rect x={0} y={0} width={width} height={wipeY} />
          </clipPath>
        </defs>
        <g clipPath="url(#grid-wipe)">
          {/* Vertical lines */}
          {Array.from({ length: cols + 1 }, (_, i) => (
            <line
              key={`v${i}`}
              x1={i * cellSize}
              y1={0}
              x2={i * cellSize}
              y2={height}
              stroke={color}
              strokeWidth={lineWidth}
            />
          ))}
          {/* Horizontal lines */}
          {Array.from({ length: rows + 1 }, (_, i) => (
            <line
              key={`h${i}`}
              x1={0}
              y1={i * cellSize}
              x2={width}
              y2={i * cellSize}
              stroke={color}
              strokeWidth={lineWidth}
            />
          ))}
        </g>
      </svg>
    </AbsoluteFill>
  );
};
