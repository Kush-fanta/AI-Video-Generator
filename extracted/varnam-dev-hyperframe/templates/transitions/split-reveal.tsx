import { AbsoluteFill, useCurrentFrame, interpolate } from "remotion";
import { P } from "../shared/palette";
import { C, ease } from "../shared/primitives";
import type { BaseProps } from "../shared/types";

export interface SplitRevealProps extends BaseProps {
  /** Frame when split starts */
  at: number;
  /** Duration of split animation in frames (default 14) */
  duration?: number;
  /** Content revealed beneath the split halves */
  children?: React.ReactNode;
}

/**
 * SplitReveal — two halves of frame slide apart (left goes left,
 * right goes right), revealing content beneath. Curtain-pull energy.
 */
export const SplitReveal: React.FC<SplitRevealProps> = ({
  at,
  duration = 14,
  children,
}) => {
  const frame = useCurrentFrame();

  // Each half slides 55% offscreen
  const offset = interpolate(
    frame,
    [at, at + duration],
    [0, 55],
    { ...C, easing: ease },
  );

  return (
    <AbsoluteFill style={{ backgroundColor: P.dark }}>
      {/* Content revealed beneath */}
      {children && <AbsoluteFill>{children}</AbsoluteFill>}

      {/* Left half — slides left */}
      <div
        style={{
          position: "absolute",
          top: 0,
          left: 0,
          width: "50%",
          height: "100%",
          backgroundColor: P.dark,
          transform: `translateX(-${offset}%)`,
        }}
      />
      {/* Right half — slides right */}
      <div
        style={{
          position: "absolute",
          top: 0,
          right: 0,
          width: "50%",
          height: "100%",
          backgroundColor: P.dark,
          transform: `translateX(${offset}%)`,
        }}
      />
    </AbsoluteFill>
  );
};

export const demo = {
  compositionId: "trans-split-reveal",
  props: { at: 15 },
  durationInFrames: 180,
};
