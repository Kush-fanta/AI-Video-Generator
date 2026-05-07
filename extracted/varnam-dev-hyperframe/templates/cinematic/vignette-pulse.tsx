import { AbsoluteFill, useCurrentFrame } from "remotion";
import { FPS } from "../shared/primitives";
import type { BaseProps } from "../shared/types";

interface VignettePulseProps extends BaseProps {
  /** Overall intensity — controls edge darkness (default 0.5, range 0-1) */
  intensity?: number;
  /** Pulse speed — higher = faster breathing (default 1.0) */
  speed?: number;
  /**
   * Edge color as a bare RGB triple string: "R,G,B"
   * e.g. "0,0,0" for black, "20,0,0" for dark red.
   * Do NOT include alpha — alpha is computed internally.
   * Default: "0,0,0"
   */
  colorRGB?: string;
}

/**
 * VignettePulse — breathing vignette overlay.
 * A radial gradient darkens the edges on a slow sin-wave cycle,
 * creating a tension/breathing effect. Fully transparent center —
 * designed to be composited over content.
 *
 * `colorRGB` accepts a bare RGB triple: "R,G,B" e.g. "0,0,0" for black.
 */
export const VignettePulse: React.FC<VignettePulseProps> = ({
  intensity = 0.5,
  speed = 1.0,
  colorRGB = "0,0,0",
}) => {
  const frame = useCurrentFrame();

  // Sin wave breathes the transparent center radius
  // frame / FPS converts to seconds so speed is FPS-independent
  const breathe = Math.sin((frame / FPS) * Math.PI * speed);

  // Inner transparent radius: ±0.15 swing (doubled from original ±0.1 * factor)
  const innerRadius = 0.4 + breathe * 0.15 * (1 - intensity);

  // Edge darkness: ±0.15 swing (doubled from original ±0.08)
  const edgeAlpha = 0.5 + intensity * 0.3 - breathe * 0.15;

  const gradient = `radial-gradient(ellipse at center, transparent ${innerRadius * 100}%, rgba(${colorRGB},${edgeAlpha.toFixed(3)}) 100%)`;

  return (
    <AbsoluteFill
      style={{
        background: gradient,
        pointerEvents: "none",
      }}
    />
  );
};
