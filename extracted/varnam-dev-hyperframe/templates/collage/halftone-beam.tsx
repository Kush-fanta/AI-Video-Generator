import { AbsoluteFill, useCurrentFrame, interpolate } from "remotion";
import { C, ease } from "../shared/primitives";

interface BeamPoint {
  x: number;
  y: number;
}

interface HalftoneBeamProps {
  /** Start point of beam (narrow end) — percentage of canvas */
  from: BeamPoint;
  /** End point of beam (wide end) — percentage of canvas */
  to: BeamPoint;
  /** Beam color */
  color?: string;
  /** Beam spread at narrow end (px) */
  narrowWidth?: number;
  /** Beam spread at wide end (px) */
  wideWidth?: number;
  /** Halftone dot size (px, default 4) */
  dotSize?: number;
  /** Halftone dot spacing (px, default 10) */
  dotSpacing?: number;
  /** Halftone dot color — defaults to slightly darker than beam */
  dotColor?: string;
  /** Frame to start animation */
  at?: number;
  /** Canvas width for percentage calc */
  width?: number;
  /** Canvas height for percentage calc */
  height?: number;
}

/**
 * A geometric beam/cone shape with halftone dot pattern overlay.
 * Connects two points on the canvas — narrow end to wide end.
 * The halftone dots are CSS-generated, no images needed.
 *
 * Animation: beam extends from narrow→wide with a wipe, dots fade in after.
 */
export const HalftoneBeam: React.FC<HalftoneBeamProps> = ({
  from,
  to,
  color = "#E8A828",
  narrowWidth = 60,
  wideWidth = 280,
  dotSize = 3.5,
  dotSpacing = 9,
  dotColor,
  at = 0,
  width = 1920,
  height = 1080,
}) => {
  const frame = useCurrentFrame();

  // Beam extends over 20 frames
  const beamProgress = interpolate(frame, [at, at + 20], [0, 1], {
    ...C,
    easing: ease,
  });
  // Dots fade in after beam lands
  const dotOpacity = interpolate(frame, [at + 16, at + 28], [0, 0.55], C);

  const fx = (from.x / 100) * width;
  const fy = (from.y / 100) * height;
  const tx = (to.x / 100) * width;
  const ty = (to.y / 100) * height;

  // Angle of the beam
  const angle = Math.atan2(ty - fy, tx - fx);
  const perpX = Math.cos(angle + Math.PI / 2);
  const perpY = Math.sin(angle + Math.PI / 2);

  // Lerp endpoint based on progress
  const cx = fx + (tx - fx) * beamProgress;
  const cy = fy + (ty - fy) * beamProgress;
  const currentWide = narrowWidth + (wideWidth - narrowWidth) * beamProgress;

  // Four corners of the trapezoid
  const nHalf = narrowWidth / 2;
  const wHalf = currentWide / 2;

  const points = [
    `${fx + perpX * nHalf},${fy + perpY * nHalf}`,
    `${cx + perpX * wHalf},${cy + perpY * wHalf}`,
    `${cx - perpX * wHalf},${cy - perpY * wHalf}`,
    `${fx - perpX * nHalf},${fy - perpY * nHalf}`,
  ].join(" ");

  const beamId = `beam-clip-${Math.round(from.x)}-${Math.round(to.x)}`;
  const resolvedDotColor = dotColor || adjustBrightness(color, -30);

  return (
    <AbsoluteFill style={{ pointerEvents: "none" }}>
      <svg width={width} height={height} style={{ position: "absolute" }}>
        <defs>
          <clipPath id={beamId}>
            <polygon points={points} />
          </clipPath>
          {/* Halftone dot pattern */}
          <pattern
            id={`halftone-${beamId}`}
            width={dotSpacing}
            height={dotSpacing}
            patternUnits="userSpaceOnUse"
          >
            <circle
              cx={dotSpacing / 2}
              cy={dotSpacing / 2}
              r={dotSize}
              fill={resolvedDotColor}
            />
          </pattern>
        </defs>

        {/* Solid beam */}
        <polygon points={points} fill={color} />

        {/* Halftone overlay clipped to beam shape */}
        <rect
          x={0}
          y={0}
          width={width}
          height={height}
          fill={`url(#halftone-${beamId})`}
          clipPath={`url(#${beamId})`}
          opacity={dotOpacity}
        />
      </svg>
    </AbsoluteFill>
  );
};

/** Darken a hex color by amount */
function adjustBrightness(hex: string, amount: number): string {
  const num = parseInt(hex.replace("#", ""), 16);
  const r = Math.max(0, Math.min(255, ((num >> 16) & 0xff) + amount));
  const g = Math.max(0, Math.min(255, ((num >> 8) & 0xff) + amount));
  const b = Math.max(0, Math.min(255, (num & 0xff) + amount));
  return `#${((r << 16) | (g << 8) | b).toString(16).padStart(6, "0")}`;
}
