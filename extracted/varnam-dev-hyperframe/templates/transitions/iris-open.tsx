import { AbsoluteFill, useCurrentFrame, interpolate } from "remotion";
import { P } from "../shared/palette";
import { C, ease } from "../shared/primitives";
import type { BaseProps } from "../shared/types";

export interface IrisOpenProps extends BaseProps {
  /** Frame when iris starts expanding */
  at: number;
  /** Duration of iris expansion in frames (default 18) */
  duration?: number;
  /** Content revealed by the iris */
  children?: React.ReactNode;
}

/**
 * IrisOpen — circular mask expanding from center, revealing content.
 * Classic cinema iris transition. Starts as a pinpoint, opens to full frame.
 */
export const IrisOpen: React.FC<IrisOpenProps> = ({
  at,
  duration = 18,
  children,
}) => {
  const frame = useCurrentFrame();

  // Circle radius: 0% → 150% (oversized to cover corners)
  const radius = interpolate(
    frame,
    [at, at + duration],
    [0, 150],
    { ...C, easing: ease },
  );

  return (
    <AbsoluteFill style={{ backgroundColor: P.dark }}>
      {/* Content clipped by circular mask */}
      <AbsoluteFill
        style={{
          clipPath: `circle(${radius}% at 50% 50%)`,
        }}
      >
        {children}
      </AbsoluteFill>
    </AbsoluteFill>
  );
};

export const demo = {
  compositionId: "trans-iris-open",
  props: { at: 15 },
  durationInFrames: 180,
};
