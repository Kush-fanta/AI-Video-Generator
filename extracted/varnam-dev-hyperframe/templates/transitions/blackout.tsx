import { AbsoluteFill, useCurrentFrame, interpolate } from "remotion";
import { P } from "../shared/palette";
import { C } from "../shared/primitives";
import type { BaseProps } from "../shared/types";

export interface BlackoutProps extends BaseProps {
  /** Whether to fade in from previous content (10-frame fade) */
  fadeIn?: boolean;
}

/**
 * Blackout — pure black silence.
 * No content, no chrome, no accent lines. Just darkness.
 * Optional 10-frame fade-in from content. The final breath.
 */
export const Blackout: React.FC<BlackoutProps> = ({ fadeIn = false }) => {
  const frame = useCurrentFrame();

  const bgOpacity = fadeIn
    ? interpolate(frame, [0, 10], [0, 1], C)
    : 1;

  return (
    <AbsoluteFill
      style={{
        backgroundColor: P.dark,
        opacity: bgOpacity,
      }}
    />
  );
};

export const demo = {
  compositionId: "trans-blackout",
  props: {
    fadeIn: true
  },
  durationInFrames: 90,
};
