import { AbsoluteFill, useCurrentFrame, spring } from "remotion";
import { FPS } from "../shared/primitives";
import type { BaseProps } from "../shared/types";

interface LetterboxProps extends BaseProps {
  /** Frame when bars begin sliding in (default 0) */
  at?: number;
  /**
   * Height of each bar as a PERCENT of frame height.
   * e.g. 12.55 = 12.55% (not a 0-1 fraction).
   * Default: 12.55 which gives 2.39:1 crop on a 1080p frame.
   * Do NOT pass 0.1255 — that will produce near-invisible bars.
   */
  barPercent?: number;
  /** Bar color (default: pure black) */
  barColor?: string;
}

// 2.39:1 on a 1080p frame: bar height = (1080 - 1080*(1/2.39)) / 2 ≈ 135.5px ≈ 12.55%
const BAR_PERCENT_239 = 12.55;

/**
 * Letterbox — cinematic bar overlay.
 * Black bars spring in from top and bottom to crop the frame to 2.39:1.
 * Uses spring physics for a satisfying "mode activation" feel.
 * Transparent center — content shows through between the bars.
 *
 * Pass `barPercent` as a percent value (e.g. 12.55), not a fraction (not 0.1255).
 */
export const Letterbox: React.FC<LetterboxProps> = ({
  at = 0,
  barPercent,
  barColor = "#000000",
}) => {
  const frame = useCurrentFrame();

  const barTarget = barPercent ?? BAR_PERCENT_239;

  // Spring-driven bar reveal — starts at `at`, settles in ~20 frames
  const progress = spring({
    frame: Math.max(0, frame - at),
    fps: FPS,
    config: {
      damping: 14,
      stiffness: 120,
      mass: 0.8,
    },
  });

  const barHeight = `${barTarget * progress}%`;

  return (
    <AbsoluteFill style={{ pointerEvents: "none" }}>
      {/* Top bar */}
      <div
        style={{
          position: "absolute",
          top: 0,
          left: 0,
          width: "100%",
          height: barHeight,
          backgroundColor: barColor,
          zIndex: 10,
        }}
      />
      {/* Bottom bar */}
      <div
        style={{
          position: "absolute",
          bottom: 0,
          left: 0,
          width: "100%",
          height: barHeight,
          backgroundColor: barColor,
          zIndex: 10,
        }}
      />
    </AbsoluteFill>
  );
};
