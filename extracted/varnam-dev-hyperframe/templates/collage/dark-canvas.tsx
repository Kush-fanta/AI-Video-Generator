import { AbsoluteFill, useCurrentFrame, interpolate } from "remotion";
import { C } from "../shared/primitives";

interface DarkCanvasProps {
  /** Base color (default near-black) */
  color?: string;
  /** Subtle gradient highlight color */
  highlightColor?: string;
  /** Gradient center position as percentage */
  highlightX?: number;
  highlightY?: number;
  /** Noise grain intensity */
  grain?: number;
  children?: React.ReactNode;
}

/**
 * Dark editorial canvas — near-black with subtle radial gradient highlight
 * and film grain. The dark counterpart to PaperBg.
 *
 * Used for: news thumbnails, crisis graphics, dark-mode editorial pieces.
 */
export const DarkCanvas: React.FC<DarkCanvasProps> = ({
  color = "#0D0F14",
  highlightColor = "rgba(30,35,50,0.6)",
  highlightX = 50,
  highlightY = 40,
  grain = 0.04,
  children,
}) => {
  const frame = useCurrentFrame();
  const grainSeed = Math.floor(frame / 3);

  return (
    <AbsoluteFill style={{ backgroundColor: color }}>
      {/* Subtle radial highlight — breaks the flat black */}
      <div
        style={{
          position: "absolute",
          inset: 0,
          background: `radial-gradient(ellipse at ${highlightX}% ${highlightY}%, ${highlightColor}, transparent 70%)`,
          pointerEvents: "none",
        }}
      />

      {/* Film grain */}
      <svg width="0" height="0" style={{ position: "absolute" }}>
        <filter id={`dark-grain-${grainSeed}`}>
          <feTurbulence
            type="fractalNoise"
            baseFrequency="0.7"
            numOctaves={3}
            seed={grainSeed}
            stitchTiles="stitch"
          />
          <feColorMatrix type="saturate" values="0" />
        </filter>
      </svg>
      <div
        style={{
          position: "absolute",
          inset: 0,
          filter: `url(#dark-grain-${grainSeed})`,
          opacity: grain,
          mixBlendMode: "screen",
        }}
      />

      {/* Content */}
      <AbsoluteFill>{children}</AbsoluteFill>
    </AbsoluteFill>
  );
};
