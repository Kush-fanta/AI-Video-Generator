import { AbsoluteFill, useCurrentFrame, interpolate } from "remotion";
import { P } from "../shared/palette";
import { C } from "../shared/primitives";
import type { BaseProps } from "../shared/types";

export interface SmashToBlackProps extends BaseProps {
  /** Frame when smash begins */
  at: number;
  /** Content that gets smashed */
  children?: React.ReactNode;
}

/**
 * SmashToBlack — content scales to 0.8, then SLAMS to black in 2 frames.
 * Hard chapter end. No gentleness.
 */
export const SmashToBlack: React.FC<SmashToBlackProps> = ({
  at,
  children,
}) => {
  const frame = useCurrentFrame();

  // Phase 1: slow squeeze from 1.0 to 0.8 over 10 frames
  const squeeze = interpolate(frame, [at, at + 10], [1.0, 0.8], C);

  // Phase 2: black overlay slams in over 2 frames after squeeze
  const blackOpacity = interpolate(frame, [at + 10, at + 12], [0, 1], C);

  // Content opacity: stays visible during squeeze, then killed
  const contentOpacity = interpolate(frame, [at + 10, at + 12], [1, 0], C);

  return (
    <AbsoluteFill style={{ backgroundColor: P.dark }}>
      {/* Content being smashed */}
      <AbsoluteFill
        style={{
          transform: `scale(${squeeze})`,
          transformOrigin: "center center",
          opacity: contentOpacity,
        }}
      >
        {children}
      </AbsoluteFill>

      {/* Black slam */}
      <AbsoluteFill
        style={{
          backgroundColor: P.dark,
          opacity: blackOpacity,
          pointerEvents: "none",
        }}
      />
    </AbsoluteFill>
  );
};

export const demo = {
  compositionId: "trans-smash-to-black",
  props: { at: 15 },
  durationInFrames: 180,
};
