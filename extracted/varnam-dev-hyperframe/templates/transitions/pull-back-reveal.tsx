import { AbsoluteFill, useCurrentFrame, interpolate } from "remotion";
import { C, ease } from "../shared/primitives";
import type { BaseProps } from "../shared/types";

export interface PullBackRevealProps extends BaseProps {
  /** Frame when pull-back starts */
  at: number;
  /** Start zoom level (default 1.4) */
  fromScale?: number;
  /** End zoom level (default 1.0) */
  toScale?: number;
  /** Duration in frames (default 20) */
  duration?: number;
  /** Content that gets the pull-back treatment */
  children?: React.ReactNode;
}

/**
 * PullBackReveal — content starts zoomed in, pulls back to reveal the full frame.
 * Recontextualization moment. "Oh, that detail was part of something bigger."
 */
export const PullBackReveal: React.FC<PullBackRevealProps> = ({
  at,
  fromScale = 1.4,
  toScale = 1.0,
  duration = 20,
  children,
}) => {
  const frame = useCurrentFrame();

  const scale = interpolate(
    frame,
    [at, at + duration],
    [fromScale, toScale],
    { ...C, easing: ease },
  );

  return (
    <AbsoluteFill>
      <AbsoluteFill
        style={{
          transform: `scale(${scale})`,
          transformOrigin: "center center",
        }}
      >
        {children}
      </AbsoluteFill>
    </AbsoluteFill>
  );
};

export const demo = {
  compositionId: "trans-pull-back-reveal",
  props: { at: 15 },
  durationInFrames: 180,
};
