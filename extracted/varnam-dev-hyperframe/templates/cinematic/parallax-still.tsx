import { AbsoluteFill, useCurrentFrame, Img, staticFile } from "remotion";
import { kenBurns, C, FPS } from "../shared/primitives";
import type { BaseProps, ImageRef } from "../shared/types";

interface ParallaxStillProps extends BaseProps {
  /** Background image — moves at base Ken Burns rate */
  background: ImageRef;
  /** Foreground image (ideally a PNG cutout) — moves at 1.5x rate for depth */
  foreground: ImageRef;
  /** Frame when animation starts (default 0) */
  at?: number;
  /** Total animation duration in frames (default 180) */
  duration?: number;
  /** Foreground speed multiplier relative to background (default 1.5) */
  depthMultiplier?: number;
}

/**
 * ParallaxStill — Ken Burns with depth layers.
 * Background scales slowly; foreground scales 1.5x faster + subtle translateY drift,
 * creating a convincing 3D parallax from 2D stills. Foreground should be a
 * transparent-background cutout for best results.
 */
export const ParallaxStill: React.FC<ParallaxStillProps> = ({
  background,
  foreground,
  at = 0,
  duration = 180,
  depthMultiplier = 1.5,
}) => {
  const frame = useCurrentFrame();
  const f = Math.max(0, frame - at);

  // Background: gentle scale drift 1.0 → 1.06
  const bgScale = kenBurns(f, duration, 1.0, 1.06);

  // Foreground: faster scale drift, amplified by depth multiplier
  const fgScaleFrom = 1.0;
  const fgScaleTo = 1.0 + (0.06 * depthMultiplier);
  const fgScale = kenBurns(f, duration, fgScaleFrom, fgScaleTo);

  // Foreground also drifts upward slightly — parallax vertical offset
  const fgDriftY = kenBurns(f, duration, 0, -12);

  const layerBase: React.CSSProperties = {
    position: "absolute",
    top: 0,
    left: 0,
    width: "100%",
    height: "100%",
    overflow: "hidden",
  };

  return (
    <AbsoluteFill>
      {/* Background layer */}
      <div style={layerBase}>
        <Img
          src={staticFile(background)}
          style={{
            width: "100%",
            height: "100%",
            objectFit: "cover",
            transform: `scale(${bgScale})`,
            transformOrigin: "center center",
          }}
        />
      </div>

      {/* Foreground layer — faster movement creates depth */}
      <div style={{ ...layerBase, zIndex: 2 }}>
        <Img
          src={staticFile(foreground)}
          style={{
            width: "100%",
            height: "100%",
            objectFit: "contain",
            transform: `scale(${fgScale}) translateY(${fgDriftY}px)`,
            transformOrigin: "center bottom",
          }}
        />
      </div>
    </AbsoluteFill>
  );
};
