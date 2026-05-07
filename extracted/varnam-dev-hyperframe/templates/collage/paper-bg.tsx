import { AbsoluteFill, useCurrentFrame, interpolate } from "remotion";
import { C } from "../shared/primitives";

interface PaperBgProps {
  /** Base paper color */
  color?: string;
  /** Grain intensity 0–1 (default 0.06) */
  grain?: number;
  /** Vignette intensity 0–1 (default 0.15) */
  vignette?: number;
  /** Subtle aging — yellow tint overlay opacity */
  aging?: number;
  children?: React.ReactNode;
}

/**
 * Aged paper background with procedural grain noise and soft vignette.
 * The canvas for retro collage compositions. No images needed — pure CSS/SVG.
 */
export const PaperBg: React.FC<PaperBgProps> = ({
  color = "#F2EDE4",
  grain = 0.06,
  vignette = 0.15,
  aging = 0.04,
  children,
}) => {
  const frame = useCurrentFrame();
  // Subtle grain shift over time — feels alive, not static
  const grainSeed = Math.floor(frame / 3);

  return (
    <AbsoluteFill style={{ backgroundColor: color }}>
      {/* Paper fiber texture via SVG filter */}
      <svg width="0" height="0" style={{ position: "absolute" }}>
        <filter id={`paper-grain-${grainSeed}`}>
          <feTurbulence
            type="fractalNoise"
            baseFrequency="0.65"
            numOctaves={4}
            seed={grainSeed}
            stitchTiles="stitch"
          />
          <feColorMatrix type="saturate" values="0" />
        </filter>
      </svg>

      {/* Grain overlay */}
      <div
        style={{
          position: "absolute",
          inset: 0,
          filter: `url(#paper-grain-${grainSeed})`,
          opacity: grain,
          mixBlendMode: "multiply",
        }}
      />

      {/* Aging yellow tint */}
      <div
        style={{
          position: "absolute",
          inset: 0,
          background: `radial-gradient(ellipse at 40% 30%, rgba(180,160,100,${aging}), transparent 70%)`,
          pointerEvents: "none",
        }}
      />

      {/* Vignette */}
      <div
        style={{
          position: "absolute",
          inset: 0,
          background: `radial-gradient(ellipse at center, transparent 50%, rgba(60,50,30,${vignette}))`,
          pointerEvents: "none",
        }}
      />

      {/* Content */}
      <AbsoluteFill>{children}</AbsoluteFill>
    </AbsoluteFill>
  );
};
